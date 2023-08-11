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
  const inputs = await fetchPosts();

  console.time("Parsing posts");
  const posts: Post[] = inputs.map((i) => post.parse(i));
  console.timeEnd("Parsing posts");

  posts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return posts;
}, "posts");
