import tseslint from "typescript-eslint";

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
    ],
  },
  tseslint.configs.recommended,
  {
    files: ["vitest.setup.ts", "**/*.spec.ts", "src/lib/test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
