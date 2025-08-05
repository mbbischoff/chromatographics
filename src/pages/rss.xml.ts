import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

export async function GET(context: any) {
  const poems = await getCollection('poems');
  
  return rss({
    title: 'chromatographics',
    description: 'gay poems by mb bischoff',
    site: context.site,
    items: poems.map((poem) => ({
      title: poem.data.title,
      pubDate: poem.data.published,
      content: sanitizeHtml(parser.render(poem.body)),
      link: `/poem/${poem.data.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
} 