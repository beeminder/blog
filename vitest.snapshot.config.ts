import config from "./vitest.config";
import Reporter from "./vitest.snapshot.reporter";
import { defineConfig } from "vitest/config";

export default defineConfig({
  ...config,
  test: {
    ...config.test,
    setupFiles: [],
    include: ["src/**/*.spec-snapshot.ts"],
    watch: false,
    reporters: new Reporter(),
  },
});
