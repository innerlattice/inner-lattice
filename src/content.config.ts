import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().trim().min(1).optional(),
    date: z.date().optional().default(() => new Date()),
    tags: z.array(z.string()).optional().default(['note']),
  }),
});

export const collections = { posts };
