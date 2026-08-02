import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    category: z.enum(['ml', 'security', 'frontend', 'infra', 'automation', 'games', 'devtools']),
    repo: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    featured: z.boolean(),
    order: z.number().int().positive(),
    cover: z.string().optional(),
    /**
     * Social card for THIS entry, absolute-from-root (e.g. `/work/x-og.png`).
     * Distinct from `cover`: covers are SVGs inlined into the page so they
     * inherit the theme tokens, and link previewers render neither SVG nor CSS
     * variables. A card must be a flat raster at exactly 1200x630 — Base.astro
     * hardcodes those as `og:image:width`/`height`, so any other size makes the
     * markup lie about the file. Omit and the entry falls back to the site-wide
     * `/og-image.png`.
     */
    ogImage: z.string().optional(),
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
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
  }),
});

export const collections = { work, notes };
