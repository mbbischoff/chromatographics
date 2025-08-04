import { defineCollection, z } from 'astro:content';

const poemsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    titleColor: z.string(),
    titleColorPantone: z.string().optional(),
    titleFont: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    date: z.date(),
  }),
});

export const collections = {
  'poems': poemsCollection,
}; 