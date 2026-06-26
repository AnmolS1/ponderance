import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

// Static output (astro.config.mjs `output: "static"`) → this endpoint prerenders
// to a flat dist/rss.xml at build time; no `export const prerender` needed.
export async function GET(context) {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  notes.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Marginalia — ponderance',
    description: 'Notes from the margins — math, physics, ML, security, homelab, and making things.',
    // Resolves to astro.config's site (https://ponderance.dev); relative item links are joined to it.
    site: context.site,
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.date,
      description: note.data.summary,
      // Slug is the file id, matching getStaticPaths in marginalia/[slug].astro.
      link: `/marginalia/${note.id}`,
    })),
  });
}
