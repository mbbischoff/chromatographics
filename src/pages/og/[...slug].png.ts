import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import satori from 'satori';
import { html } from 'satori-html';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

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
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function adjustColorLuminance(hexColor: string, targetLuminance: number): string {
  const { r, g, b } = hexToRgb(hexColor);
  
  if (targetLuminance > 0.5) {
    // For high luminance (like 98%), blend with white
    const whiteBlend = targetLuminance;
    const colorBlend = 1 - targetLuminance;
    
    const newR = Math.round(r * colorBlend + 255 * whiteBlend);
    const newG = Math.round(g * colorBlend + 255 * whiteBlend);
    const newB = Math.round(b * colorBlend + 255 * whiteBlend);
    
    return rgbToHex(newR, newG, newB);
  } else {
    // For low luminance (like 2%), blend with black
    const blackBlend = 1 - targetLuminance;
    const colorBlend = targetLuminance;
    
    const newR = Math.round(r * colorBlend + 0 * blackBlend);
    const newG = Math.round(g * colorBlend + 0 * blackBlend);
    const newB = Math.round(b * colorBlend + 0 * blackBlend);
    
    return rgbToHex(newR, newG, newB);
  }
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
  
  if (type === 'poem' && entry) {
    const poemEntry = entry as CollectionEntry<'poems'>;
    title = poemEntry.data.title.replace(/<[^>]*>/g, ''); // Strip HTML tags
    titleColor = poemEntry.data.color?.hex || '#000000';
    backgroundColor = poemEntry.data.backgroundColor || adjustColorLuminance(titleColor, 0.98);
    textColor = poemEntry.data.textColor || adjustColorLuminance(titleColor, 0.02);
    
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
    
    // Split truncated content into lines and process each line separately
    const lines = truncatedContent.split('\n');
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
  };
}

function createOGImageTemplate(data: OGImageData) {
  const { title, subtitle, content, titleColor, backgroundColor, textColor } = data;
  const fontSize = title.length > OG_IMAGE_CONFIG.titleFontSize.threshold 
    ? OG_IMAGE_CONFIG.titleFontSize.small 
    : OG_IMAGE_CONFIG.titleFontSize.large;
  
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
          font-size: ${fontSize}px;
          color: ${titleColor};
          margin: 0;
          line-height: ${OG_IMAGE_CONFIG.lineHeight.title};
          font-weight: bold;
        ">${title}</h1>
        
        ${content ? `
          <div style="
            display: flex;
            flex-direction: column;
            font-size: ${OG_IMAGE_CONFIG.contentFontSize}px;
            color: ${textColor};
            margin-top: ${OG_IMAGE_CONFIG.margins.content}px;
            line-height: ${OG_IMAGE_CONFIG.lineHeight.content};
            font-family: 'Lacrima', ${FONT_CONFIG.fallback};
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