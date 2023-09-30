import config from "./vitest.config";

export default {
  ...config,
  test: {
    ...config.test,
    setupFiles: [],
    include: ["src/**/*.spec-snapshot.ts"],
    watch: false,
  },
};
