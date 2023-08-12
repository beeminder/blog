import memoize from "./memoize";
import { Post, post } from "../schemas/post";
import fetchPosts from "./fetchPosts";

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
  console.time("Gathering posts");
  const inputs = fetchPosts();
  const posts = await Promise.all(inputs.map((p) => p.then(post.parse)));
  console.timeEnd("Gathering posts");

  posts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return posts;
}, "posts");
