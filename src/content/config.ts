import { defineCollection, z } from 'astro:content';

const ColorSchema = z.object({
  hex: z.string(),
  name: z.string(),
  link: z.string().optional(),
});

const poemsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    color: ColorSchema.optional(),
    titleFont: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    written: z.date(),
    published: z.date(),
  }),
});

export const collections = {
  'poems': poemsCollection,
}; 