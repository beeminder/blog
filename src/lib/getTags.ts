import type { Post } from "../schemas/post";
import getPosts from "./getPosts";
import memoize from "./memoize";

type Tag = {
  name: string;
  posts: Post[];
  count: number;
  redirect: string | null;
};

const getTags = memoize(makeTags);

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
      redirect: t.includes(" ") ? t.replace(/ /g, "+") : null,
    };
  });

  tags.sort((a, b) => b.count - a.count);

  return tags;
}
