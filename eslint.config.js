import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import i18next from "eslint-plugin-i18next";

export default tseslint.config(
  {
    ignores: [
      ".astro/**",
      "dist/**",
      ".cache/**",
      ".vscode/**",
      "node_modules/**",
      "public/**",
      "pnpm-lock.yaml",
      "posts.json",
      "shots/**",
      // Virtual <script>/<style> blocks that eslint-plugin-astro extracts from
      // .astro files. We lint only the .astro template (for the i18n guard);
      // frontmatter and inline scripts are left to `astro check`.
      "**/*.astro/*",
    ],
  },
  // TypeScript rules apply to JS/TS sources only. .astro frontmatter is left to
  // `astro check`; this config adds only the i18n guard (below) to .astro, so
  // making .astro parseable doesn't retroactively lint it with TS rules.
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mjs", "**/*.cjs", "**/*.js"],
    extends: [tseslint.configs.recommended],
  },
  {
    files: ["vitest.setup.ts", "**/*.spec.ts", "src/lib/test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Parse .astro files so user-facing text can be linted.
  ...astro.configs["flat/base"],

  // Guard: no literal user-facing strings in .astro markup. All such copy must
  // live in the src/i18n catalog. See docs/agents/i18n.md.
  {
    files: ["**/*.astro"],
    plugins: { i18next },
    rules: {
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",
          "jsx-attributes": {
            // Structural / non-user-facing attributes. On native DOM tags the
            // plugin only validates placeholder/alt/aria-label/value/title;
            // the entries below suppress false positives from component props
            // and Astro directives.
            exclude: [
              "class",
              "className",
              "styleName",
              "style",
              "type",
              "key",
              "id",
              "width",
              "height",
              "name",
              "Heading",
              "value",
              "class:list",
              "set:html",
              "define:vars",
              "is:inline",
              "src",
              "href",
              "rel",
              "property",
              "content",
              "slot",
              "crossorigin",
              "charset",
              "lang",
              "method",
              "action",
            ],
          },
          // Object literals passed to component props (e.g. pagination
          // `previous={{ url, title }}`): route/asset values keyed by these
          // names are not user-facing copy. (Uppercase keys are the plugin
          // default.)
          "object-properties": {
            exclude: ["[A-Z_-]+", "url", "href", "src", "slug"],
          },
        },
      ],
    },
  },
);
