import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import getPosts from "../lib/getPosts";

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error("Missing site metadata");
  }

  const posts = await getPosts({
    sort: true,
  });

  return rss({
    title: "Beeminder Blog",
    description: "Beeminder Blog",
    site: context.site.toString(),
    items: posts.slice(0, 30).map((p) => ({
      link: `${context.site}${p.slug}`,
      title: p.title,
      pubDate: p.date,
      description: p.excerpt,
      content: p.content,
    })),
  });
}
