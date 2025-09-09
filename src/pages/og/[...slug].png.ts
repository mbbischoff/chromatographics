import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import satori from 'satori';
import { html } from 'satori-html';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { adjustLuminance } from '../../utils/colors';

// Types
interface OGImageProps {
  type: 'poem' | 'page' | 'home';
  entry: CollectionEntry<'poems'> | CollectionEntry<'pages'> | null;
}

interface ColorAdjustment {
  hex: string;
  luminance: number;
}

interface OGImageData {
  title: string;
  subtitle: string;
  content: string;
  titleColor: string;
  backgroundColor: string;
  textColor: string;
  titleFont?: string;
  titleFontWeight?: string;
  textFont?: string;
  titleFontMultiplier?: number;
  textFontMultiplier?: number;
  textFontWeight?: string;
}

// Constants
const OG_IMAGE_CONFIG = {
  width: 1200,
  height: 630,
  padding: 80,
  titleFontSize: {
    small: 64,
    large: 72,
    threshold: 30,
  },
  contentFontSize: 32,
  subtitleFontSize: 28,
  brandFontSize: 24,
  lineHeight: {
    title: 1.2,
    content: 1.5,
  },
  margins: {
    content: 40,
    footer: 40,
  },
  opacity: {
    subtitle: 0.8,
  },
} as const;

const FONT_CONFIG = {
  regular: 'LacrimaMG-SerifRegular.otf',
  bold: 'LacrimaMG-SerifBold.otf',
  italic: 'LacrimaMG-ItalicRegular.otf',
  fallback: 'Times New Roman, Georgia, Arial, "Segoe UI", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
} as const;

// Utility functions



function normalizeSpecialCharacters(text: string): string {
  // Replace special dashes with regular em dash
  let normalized = text
    .replace(/⸺/g, '—')  // 2-em dash to em dash
    .replace(/⸻/g, '—')  // 3-em dash to em dash  
    .replace(/―/g, '—')  // Horizontal bar to em dash
    .replace(/──/g, '—') // Double hyphen-minus to em dash
    .replace(/--/g, '—'); // Double hyphen to em dash
  
  // Replace special spaces with regular space
  normalized = normalized
    .replace(/[\u2009]/g, ' ')  // Thin space to regular space
    .replace(/[\u200A]/g, ' ')  // Hair space to regular space
    .replace(/[\u00A0]/g, ' ')  // Non-breaking space to regular space
    .replace(/[\u2002]/g, ' ')  // En space to regular space
    .replace(/[\u2003]/g, ' ')  // Em space to regular space
    .replace(/[\u2004]/g, ' ')  // Three-per-em space to regular space
    .replace(/[\u2005]/g, ' ')  // Four-per-em space to regular space
    .replace(/[\u2006]/g, ' ')  // Six-per-em space to regular space
    .replace(/[\u2007]/g, ' ')  // Figure space to regular space
    .replace(/[\u2008]/g, ' ')  // Punctuation space to regular space
    .replace(/[\u202F]/g, ' ')  // Narrow no-break space to regular space
    .replace(/[\u205F]/g, ' '); // Medium mathematical space to regular space
    
  return normalized;
}

function truncateContent(content: string, isPreformatted: boolean, maxLines = 4, maxWords = 20): string {
  if (isPreformatted) {
    const lines = content.split('\n').filter(line => line.trim());
    const truncated = lines.slice(0, maxLines).join('\n');
    return lines.length > maxLines ? `${truncated}` : truncated;
  } else {
    const words = content.split(/\s+/).filter(word => word.trim());
    const truncated = words.slice(0, maxWords).join(' ');
    return words.length > maxWords ? `${truncated}` : truncated;
  }
}

async function loadFonts(): Promise<{ regular: Buffer; bold: Buffer; italic: Buffer }> {
  const fontDir = path.join(process.cwd(), 'public', 'fonts');
  
  try {
    const [regular, bold, italic] = await Promise.all([
      fs.readFile(path.join(fontDir, FONT_CONFIG.regular)),
      fs.readFile(path.join(fontDir, FONT_CONFIG.bold)),
      fs.readFile(path.join(fontDir, FONT_CONFIG.italic)),
    ]);
    
    return { regular, bold, italic };
  } catch (error) {
    throw new Error(`Failed to load fonts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateOGImageData(props: OGImageProps): Promise<OGImageData> {
  const { type, entry } = props;
  
  // Default values
  let title = 'chromatographics';
  let subtitle = 'gay poems by mb bischoff';
  let titleColor = '#000000';
  let backgroundColor = '#ffffff';
  let textColor = '#333333';
  let content = '';
  let titleFont: string | undefined;
  let titleFontWeight: string | undefined;
  let textFont: string | undefined;
  let titleFontMultiplier: number | undefined;
  let textFontMultiplier: number | undefined;
  let textFontWeight: string | undefined;
  
  if (type === 'poem' && entry) {
    const poemEntry = entry as CollectionEntry<'poems'>;
    title = normalizeSpecialCharacters(poemEntry.data.title.replace(/<[^>]*>/g, '')); // Strip HTML tags and normalize special characters
    
    // Calculate default colors based on title color (matching Poem.astro logic)
    const baseTitleColor = poemEntry.data.color?.hex || '#000000';
    titleColor = poemEntry.data.titleColor || baseTitleColor;
    backgroundColor = poemEntry.data.backgroundColor || adjustLuminance(baseTitleColor, 0.98);
    textColor = poemEntry.data.textColor || adjustLuminance(baseTitleColor, 0.02);
    
    // Extract font properties from poem data
    titleFont = poemEntry.data.titleFont;
    titleFontWeight = poemEntry.data.titleFontWeight;
    textFont = poemEntry.data.textFont;
    titleFontMultiplier = poemEntry.data.titleFontMultiplier;
    textFontMultiplier = poemEntry.data.textFontMultiplier;
    textFontWeight = poemEntry.data.textFontWeight;
    
    // Render the markdown content to HTML and extract text
    const { Content } = await poemEntry.render();
    
    // For OG images, we'll preserve italic formatting and remove other markdown
    let textContent = poemEntry.body
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '<i>$1</i>') // Convert italic to HTML
      .replace(/_(.*?)_/g, '<i>$1</i>') // Convert italic to HTML
      .replace(/`(.*?)`/g, '$1') // Remove code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .replace(/^\s*>\s+/gm, '') // Remove blockquotes
      .replace(/^\s*`{3,}.*$/gm, '') // Remove code blocks
      .replace(/^\s*`{3,}$/gm, '') // Remove code block endings
      .trim();
    
    const isPreformatted = poemEntry.data.preformatted ?? true;
    
    // Truncate the content first (before converting to HTML divs)
    const truncatedContent = truncateContent(textContent, isPreformatted);
    
    // Normalize special characters in the truncated content
    const normalizedContent = normalizeSpecialCharacters(truncatedContent);
    
    // Split normalized content into lines and process each line separately
    const lines = normalizedContent.split('\n');
    const processedLines = lines.map(line => {
      if (line.trim() === '') return '';
      return `<div style="display: flex; flex-wrap: wrap; white-space: pre-wrap;">${line}</div>`;
    });
    content = processedLines.join('');
    subtitle = 'by mb bischoff';
  } else if (type === 'page' && entry) {
    const pageEntry = entry as CollectionEntry<'pages'>;
    title = pageEntry.data.title;
    subtitle = pageEntry.data.description || 'chromatographics';
  }
  
  return {
    title,
    subtitle,
    content,
    titleColor,
    backgroundColor,
    textColor,
    titleFont,
    titleFontWeight,
    textFont,
    titleFontMultiplier,
    textFontMultiplier,
    textFontWeight,
  };
}

function createOGImageTemplate(data: OGImageData) {
  const { title, subtitle, content, titleColor, backgroundColor, textColor, titleFont, titleFontWeight, textFont, titleFontMultiplier, textFontMultiplier, textFontWeight } = data;
  
  // Calculate font sizes with multipliers
  const baseTitleFontSize = title.length > OG_IMAGE_CONFIG.titleFontSize.threshold 
    ? OG_IMAGE_CONFIG.titleFontSize.small 
    : OG_IMAGE_CONFIG.titleFontSize.large;
  const titleFontSize = titleFontMultiplier ? baseTitleFontSize * titleFontMultiplier : baseTitleFontSize;
  const contentFontSize = textFontMultiplier ? OG_IMAGE_CONFIG.contentFontSize * textFontMultiplier : OG_IMAGE_CONFIG.contentFontSize;
  
  // Determine font families and weights
  const titleFontFamily = 'Lacrima';
  const textFontFamily = 'Lacrima';
  
  // Map font weights
  const getFontWeight = (weight?: string) => {
    if (!weight) return 'normal';
    switch (weight) {
      case '500': return '500';
      case '600': return '600';
      case 'bold': return 'bold';
      case '700': return 'bold';
      default: return 'normal';
    }
  };
  
  const titleWeight = getFontWeight(titleFontWeight);
  const textWeight = getFontWeight(textFontWeight);
  
  return html(`
    <div style="
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background-color: ${backgroundColor};
      padding: ${OG_IMAGE_CONFIG.padding}px;
      font-family: 'Lacrima', ${FONT_CONFIG.fallback};
    ">
      <div style="
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: center;
      ">
        <h1 style="
          font-size: ${titleFontSize}px;
          color: ${titleColor};
          margin: 0;
          line-height: ${OG_IMAGE_CONFIG.lineHeight.title};
          font-weight: ${titleWeight};
          font-family: '${titleFontFamily}', ${FONT_CONFIG.fallback};
        ">${title}</h1>
        
        ${content ? `
          <div style="
            display: flex;
            flex-direction: column;
            font-size: ${contentFontSize}px;
            color: ${textColor};
            margin-top: ${OG_IMAGE_CONFIG.margins.content}px;
            line-height: ${OG_IMAGE_CONFIG.lineHeight.content};
            font-family: '${textFontFamily}', ${FONT_CONFIG.fallback};
            font-weight: ${textWeight};
          ">${content}</div>
        ` : ''}
      </div>
      
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-top: ${OG_IMAGE_CONFIG.margins.footer}px;
      ">
        <span style="
          font-size: ${OG_IMAGE_CONFIG.subtitleFontSize}px;
          color: ${titleColor};
          opacity: ${OG_IMAGE_CONFIG.opacity.subtitle};
        ">${subtitle}</span>
        
        <span style="
          font-size: ${OG_IMAGE_CONFIG.brandFontSize}px;
          color: ${titleColor};
          font-weight: bold;
        ">chromatographics</span>
      </div>
    </div>
  `);
}

// Static paths generation
export async function getStaticPaths() {
  try {
    const [poems, pages] = await Promise.all([
      getCollection('poems'),
      getCollection('pages'),
    ]);
    
    const poemPaths = poems.map((poem) => ({
      params: { slug: poem.slug },
      props: { type: 'poem' as const, entry: poem },
    }));
    
    const pagePaths = pages.map((page) => ({
      params: { slug: page.slug },
      props: { type: 'page' as const, entry: page },
    }));
    
    const homePath = {
      params: { slug: 'index' },
      props: { type: 'home' as const, entry: null },
    };
    
    return [...poemPaths, ...pagePaths, homePath];
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}

// Main API route
export const GET: APIRoute = async ({ props }) => {
  try {
    const { type, entry } = props as OGImageProps;
    
    // Load fonts
    const { regular: fontData, bold: fontBoldData, italic: fontItalicData } = await loadFonts();
    
    // Generate image data
    const imageData = await generateOGImageData({ type, entry });
    
    // Create template
    const template = createOGImageTemplate(imageData);
    
    // Generate SVG
    const svg = await satori(template, {
      width: OG_IMAGE_CONFIG.width,
      height: OG_IMAGE_CONFIG.height,
      fonts: [
        {
          name: 'Lacrima',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Lacrima',
          data: fontBoldData,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Lacrima',
          data: fontItalicData,
          weight: 400,
          style: 'italic',
        },
      ],
    });
    
    // Convert SVG to PNG
    const png = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();
    
    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    // Return a fallback image or error response
    return new Response('Error generating image', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
};