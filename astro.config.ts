import { defineConfig } from "astro/config";
import makeRedirects from "./src/lib/makeRedirects";
import getPosts from "./src/lib/getPosts";
import prefetch from "@astrojs/prefetch";
const posts = await getPosts();
const slugs = posts.map((p) => p.slug);

// WORKAROUND: `as any` was added to sidestep an incorrect upstream Astro type definition
// https://github.com/withastro/astro/issues/7322#issuecomment-1581891586
const redirects = makeRedirects(slugs) as any;

// https://astro.build/config
export default defineConfig({
  site: "https://blog.beeminder.com",
  redirects,
  experimental: {
    redirects: true,
  },
  integrations: [
    prefetch({
      selector: "a",
    }),
  ],
});
