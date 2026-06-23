import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
];
