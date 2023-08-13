import memoize from "./memoize";
import { Post, post } from "../schemas/post";
import fetchPosts from "./fetchPosts";

const makePosts = memoize(
  (): Promise<Post>[] => fetchPosts().map((p) => p.then(post.parse)),
  "makePosts",
);

const getPosts = memoize(
  async ({
    includeUnpublished = false,
    sort = false,
  }: {
    includeUnpublished?: boolean;
    sort?: boolean;
  } = {}): Promise<Post[]> => {
    const posts = await Promise.all(makePosts());

    if (sort) {
      posts.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    if (includeUnpublished) return posts;

    return posts.filter((p) => p.status === "publish");
  },
  "getPosts",
);

export default getPosts;
