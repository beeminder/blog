import { defineConfig, sharpImageService } from "astro/config";
import prefetch from "@astrojs/prefetch";
import dsv from "@rollup/plugin-dsv";
import stripBom from "strip-bom";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.beeminder.com",
  experimental: {
    assets: true,
  },
  image: {
    service: sharpImageService(),
    domains: ["blog.beeminder.com", "user-images.githubusercontent.com"],
  },
  integrations: [
    prefetch({
      selector: "a",
    }),
  ],
  vite: {
    plugins: [
      dsv({
        processRow: (row) => {
          const entries = Object.entries(row);
          const stripped = entries.map(([k, v]) => [stripBom(k), v]);
          return Object.fromEntries(stripped);
        },
      }),
    ],
  },
});
