import memoize from "./memoize";
import { type Post, post } from "../schemas/post";
import { getCollection } from "astro:content";

const getDuplicates = (
  arr: Array<Record<string, unknown>>,
  key: string,
): unknown[] => {
  const keys = arr.map((item) => item[key]);
  return keys.filter((key) => keys.indexOf(key) !== keys.lastIndexOf(key));
};

const makePosts = memoize(async (): Promise<Post[]> => {
  const posts = await getCollection("posts");
  return posts.map((p) => {
    const result = post.safeParse(p.data);
    if (result.success) {
      return result.data;
    }
    throw new Error(
      `Failed to parse post ${p.data.source}: ${result.error.message}`,
      result.error,
    );
  });
});

const getPosts = memoize(
  async ({
    includeUnpublished = false,
    sort = false,
  }: {
    includeUnpublished?: boolean;
    sort?: boolean;
  } = {}): Promise<Post[]> => {
    const posts = await makePosts();

    const duplicateSlugs = getDuplicates(posts, "slug");
    if (duplicateSlugs.length > 0) {
      throw new Error(
        `Duplicate slugs found: ${duplicateSlugs.join(
          ", ",
        )}. Slugs must be unique.`,
      );
    }

    const duplicateDisqusIds = getDuplicates(posts, "disqus_id");
    if (duplicateDisqusIds.length > 0) {
      throw new Error(
        `Duplicate disqus_ids found: ${duplicateDisqusIds.join(
          ", ",
        )}. Disqus_ids must be unique.`,
      );
    }

    if (sort) {
      posts.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    if (includeUnpublished) return posts;

    return posts.filter((p) => p.status === "publish");
  },
);

export default getPosts;
