// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://ponderance.dev",
  output: "static",
  adapter: cloudflare({
    // katex/rehype-katex use CommonJS; workerd (default) doesn't support require()
    prerenderEnvironment: "node",
  }),
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: { theme: "github-dark", wrap: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
