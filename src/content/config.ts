import { defineCollection, z } from 'astro:content';

const ColorSchema = z.object({
  hex: z.string(),
  name: z.string(),
  link: z.string().optional(),
  sampledFrom: z.string().optional(),
});

const PublicationSchema = z.object({
  title: z.string(),
  link: z.string(),
  date: z.date(),
});

const poemsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    color: ColorSchema.optional(),
    titleFont: z.string().optional(),
    titleFontMultiplier: z.number().optional(),
    titleFontWeight: z.string().optional(),
    textFont: z.string().optional(),
    textFontMultiplier: z.number().optional(),
    textFontWeight: z.string().optional(),
    stickerFont: z.string().optional(),
    stickerFontSizeMultiplier: z.number().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    titleColor: z.string().optional(),
    felt: z.union([z.date(), z.array(z.date())]).optional(),
    written: z.date(),
    published: z.date(),
    publications: z.array(PublicationSchema).optional(),
    preformatted: z.boolean().default(true),
    ignoresDarkMode: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = {
  'poems': poemsCollection,
  'pages': pagesCollection,
}; 