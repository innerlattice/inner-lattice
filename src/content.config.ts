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

// A series lists its parts in reading order. A part is a published post or a
// planned title that readers see as forthcoming.
const series = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/series' }),
  schema: z.object({
    title: z.string(),
    description: z.string().trim().min(1),
    parts: z
      .array(z.union([z.object({ post: z.string() }).strict(), z.object({ planned: z.string() }).strict()]))
      .min(1),
  }),
});

export const collections = { posts, series };
