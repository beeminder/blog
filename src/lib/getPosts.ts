import { createHash } from "node:crypto";
import memoize from "./memoize";
import { type Post, processPost, rawPost } from "../schemas/post";
import fetchPosts from "./fetchPosts";
import readSources from "./readSources";
import env from "./env";
import { hashCache } from "./hashCache";

const POSTS_CACHE_FILE = ".cache/posts-processed.json";

// The disk cache is keyed on posts.json contents, which do not change when pad
// content changes. On Render the build directory can persist across deploys,
// so a cache hit would silently serve stale pad content.
function isDiskCacheDisabled(): boolean {
  return !!env("RENDER") || env("FILE_SYSTEM_CACHE") === "false";
}

const getDuplicates = (
  arr: Array<Record<string, unknown>>,
  key: string,
): unknown[] => {
  const keys = arr.map((item) => item[key]);
  return keys.filter((key) => keys.indexOf(key) !== keys.lastIndexOf(key));
};

function getSourcesHash(): string {
  const sources = readSources();
  return createHash("md5").update(JSON.stringify(sources)).digest("hex");
}

const makePosts = memoize((): Promise<Post>[] =>
  fetchPosts().map((p) =>
    p.then((d) => {
      const result = rawPost.safeParse(d);
      if (!result.success) {
        throw new Error(
          `Failed to parse post ${d.source}: ${result.error.message}`,
          { cause: result.error },
        );
      }
      return processPost(result.data);
    }),
  ),
);

async function computeAllPosts(): Promise<Post[]> {
  const posts = await Promise.all(makePosts());

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

  return posts;
}

const getAllPosts = memoize((): Promise<Post[]> => {
  if (isDiskCacheDisabled()) return computeAllPosts();

  return hashCache<Post[]>({
    key: getSourcesHash(),
    path: POSTS_CACHE_FILE,
    serialize: (posts, hash) => JSON.stringify({ hash, posts }),
    deserialize: (raw, hash) => {
      const parsed = JSON.parse(raw);
      if (parsed.hash !== hash) return null;
      return (parsed.posts as Array<Record<string, unknown>>).map((p) => ({
        ...p,
        date: new Date(p.date as string),
      })) as Post[];
    },
    compute: computeAllPosts,
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
    const posts = [...(await getAllPosts())];

    if (sort) {
      posts.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    if (includeUnpublished) return posts;

    return posts.filter((p) => p.status === "publish");
  },
);

export default getPosts;
