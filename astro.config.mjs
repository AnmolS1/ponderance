// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://ponderance.dev",
  output: "static",
  // Disable auto-injected SESSION KV binding (portfolio doesn't use sessions)
  session: { driver: { entrypoint: "unstorage/drivers/null" } },
  adapter: cloudflare({
    // katex/rehype-katex use CommonJS; workerd (default) doesn't support require()
    prerenderEnvironment: "node",
    // passthrough: no Cloudflare Images binding needed (we serve pre-built static images)
    imageService: "passthrough",
  }),
  integrations: [mdx()],
  markdown: {
    // unified() processor; MDX inherits via the processor reference
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: { theme: "github-dark", wrap: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // KaTeX and Shiki emit inline style= attributes; prevent Astro from also
    // inlining its own small stylesheets as <style> blocks (an additional CSP hit)
    inlineStylesheets: "never",
  },
});
