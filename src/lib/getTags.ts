import getPosts from "./getPosts";
import type { Post } from "./makePost";

type Tag = {
  name: string;
  posts: Post[];
  count: number;
};

let tags: Record<string, Tag> | undefined;

export default async function getTags(): Promise<Record<string, Tag>> {
  if (!tags) tags = await makeTags();
  return tags;
}

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

export function __resetTags(): void {
  tags = undefined;
}
