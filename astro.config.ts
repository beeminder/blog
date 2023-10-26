import { defineConfig } from "astro/config";
import prefetch from "@astrojs/prefetch";
import getRedirects from "./src/lib/getRedirects";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.beeminder.com",
  image: {
    domains: ["blog.beeminder.com", "user-images.githubusercontent.com"]
  },
  redirects: await getRedirects().catch(e => {
    console.error(e);
    throw e;
  }),
  integrations: [prefetch({
    selector: "a"
  }), sitemap()]
});