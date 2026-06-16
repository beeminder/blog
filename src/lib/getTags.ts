import type { Post } from "../schemas/post";
import getPosts from "./getPosts";
import memoize from "./memoize";
import { normalizeTagName, tagRedirectSlug } from "./tagSlug";

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
  const tagNames = [
    ...new Set(
      posts
        .map((p) => p.tags)
        .flat()
        .map(normalizeTagName),
    ),
  ];
  const tags = tagNames.map((t) => {
    const matched = posts.filter((p) =>
      p.tags.some((pt) => normalizeTagName(pt) === t),
    );
    return {
      name: t,
      posts: matched,
      count: matched.length,
      redirect: tagRedirectSlug(t),
    };
  });

  tags.sort((a, b) => b.count - a.count);

  return tags;
}
