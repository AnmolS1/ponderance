import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    category: z.enum(['ml', 'security', 'frontend', 'infra', 'automation']),
    repo: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    featured: z.boolean(),
    order: z.number().int().positive(),
    cover: z.string().optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z
      .array(
        z.enum([
          'math',
          'physics',
          'security',
          'ml',
          'homelab',
          'origami',
          'evals',
          'engineering',
        ])
      )
      .min(1),
    summary: z.string(),
    draft: z.boolean().default(true),
  }),
});

export const collections = { work, notes };
