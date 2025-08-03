import { defineCollection, z } from 'astro:content';

const poemsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    titleColor: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    date: z.date(),
  }),
});

export const collections = {
  'poems': poemsCollection,
}; 