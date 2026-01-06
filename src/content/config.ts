import { defineCollection, z } from 'astro:content';

const announcementsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    version: z.string(), // e.g., "v1.0.0" or "2025.01"
    date: z.coerce.date(),
    category: z.enum(['dev-updates', 'new-features', 'tips', 'personal']),
    summary: z.string().max(200),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  announcements: announcementsCollection,
};
