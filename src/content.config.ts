import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().trim().min(1).optional(),
    // Full timestamps are enforced by src/lib/postDates.mjs.
    date: z.date(),
    updated: z.date().optional(),
    tags: z.array(z.string()).optional().default(['note']),
  }),
});

export const collections = { posts };
