import getPosts, { Post } from "./getPosts";

type Tag = {
  name: string;
  posts: Post[];
  count: number;
};

export default async function getTags(): Promise<Record<string, Tag>> {
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
