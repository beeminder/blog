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
            // The rule already validates only placeholder/alt/aria-label/value/
            // title on native DOM tags and auto-ignores every other native
            // attribute, so this list is NOT a denylist of all structural
            // attributes — it only needs the names that DO get validated but
            // are never user-facing copy:
            //   - the plugin's own defaults (className/styleName/style/type/
            //     key/id/width/height), re-listed because we override the option;
            //   - literal string props on our components: `name` (<Icon>),
            //     `Heading` (<TitleLockup>/<PostMeta>), `class` (<PostMeta>),
            //     `slot` (e.g. <Pagination slot="before-content">).
            // `value` is intentionally NOT excluded so user-facing button/input
            // values are still caught; non-copy values (e.g. a config domain)
            // should be passed via an expression rather than a literal.
            // Add a name here only when the guard false-positives on a prop that
            // genuinely isn't copy.
            exclude: [
              "className",
              "styleName",
              "style",
              "type",
              "key",
              "id",
              "width",
              "height",
              "class",
              "name",
              "Heading",
              "slot",
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
