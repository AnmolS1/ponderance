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
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: { theme: "github-dark", wrap: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
