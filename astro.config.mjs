import { defineConfig } from "astro/config";
import CSV from "vite-plugin-csv";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [CSV()],
  },
});
