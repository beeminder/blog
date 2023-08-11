import type { Post } from "../schemas/post";
import getPosts from "./getPosts";
import memoize from "./memoize";

type Tag = {
  name: string;
  posts: Post[];
  count: number;
};

const getTags = memoize(makeTags, "tags");

export default getTags;

async function makeTags(): Promise<Tag[]> {
  const posts = await getPosts();
  const tagNames = [...new Set(posts.map((p) => p.tags).flat())];
  const tags = tagNames.map((t) => {
    const matched = posts.filter((p) => p.tags.includes(t));
    return {
      name: t,
      posts: matched,
      count: matched.length,
    };
  });

  tags.sort((a, b) => b.count - a.count);

  return tags;
}
