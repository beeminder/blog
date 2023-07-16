import memoize from "./memoize";
import { Post, post } from "../schemas/post";
import readSources from "./readSources";

export default async function getPosts({
  includeUnpublished = false,
}: {
  includeUnpublished?: boolean;
} = {}) {
  const posts = await makePosts();

  if (includeUnpublished) return posts;

  return posts.filter((p) => p.status === "publish");
}

const makePosts = memoize(async (): Promise<Post[]> => {
  const urls = readSources();
  const posts: Post[] = [];

  console.time("Gathering posts");
  for (const url of urls) {
    posts.push(await post.parseAsync(url));
  }
  console.timeEnd("Gathering posts");

  posts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return posts;
}, "posts");
