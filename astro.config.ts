import { defineConfig } from "astro/config";
import prefetch from "@astrojs/prefetch";
import getPosts from "./src/lib/getPosts";

const posts = await getPosts();
const redirects = posts.reduce<Record<string, string>>((acc, post) => {
  if (!post.redirects.length) return acc;
  post.redirects.forEach((r) => {
    acc[`/${r}`] = `/${post.slug}`;
  });
  return acc;
}, {});

// https://astro.build/config
export default defineConfig({
  site: "https://blog.beeminder.com",
  redirects,
  integrations: [
    prefetch({
      selector: "a",
    }),
  ],
});
