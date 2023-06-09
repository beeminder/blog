import getPosts from "./getPosts";
import type { Post } from "./makePost";
import memoize from "./memoize";

type Tag = {
  name: string;
  posts: Post[];
  count: number;
};

const getTags = memoize(makeTags, "tags");

export default getTags;

async function makeTags(): Promise<Record<string, Tag>> {
  const posts = await getPosts();
  const tagNames = posts.map((p) => p.tags).flat();
  const entries = tagNames.map((t) => {
    const matched = posts.filter((p) => p.tags.includes(t));
    return [
      t,
      {
        name: t,
        posts: matched,
        count: matched.length,
      },
    ];
  });

  return Object.fromEntries(entries);
}
