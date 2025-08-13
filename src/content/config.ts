import { defineCollection, z } from 'astro:content';

const ColorSchema = z.object({
  hex: z.string(),
  name: z.string(),
  link: z.string().optional(),
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
    textFont: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    titleColor: z.string().optional(),
    felt: z.date().optional(),
    written: z.date(),
    published: z.date(),
    publications: z.array(PublicationSchema).optional(),
    preformatted: z.boolean().default(true),
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