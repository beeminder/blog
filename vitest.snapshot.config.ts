import config from "./vitest.config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  ...config,
  test: {
    ...config.test,
    setupFiles: [],
    globalSetup: ["./vitest.snapshot.setup.ts"],
    include: ["src/**/*.spec-snapshot.ts"],
    watch: false,
    reporters: "dot",
  },
});
