import { defineConfig } from "vitest/config";
import astroConfig from "./astro.config";

export default defineConfig({
  ...astroConfig.vite,
  test: {
    setupFiles: ["./vitest.setup.ts"],
    clearMocks: true,
  },
});
