import memoize from "./memoize";
import { type Post, post } from "../schemas/post";
import fetchPosts from "./fetchPosts";

const makePosts = memoize((): Promise<Post>[] =>
  fetchPosts().map((p) =>
    p.then((d) => {
      const result = post.safeParse(d);
      if (result.success) return result.data;
      throw new Error(
        `Failed to parse post ${d.url}: ${result.error.message}`,
        result.error,
      );
    }),
  ),
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
);

export default getPosts;
