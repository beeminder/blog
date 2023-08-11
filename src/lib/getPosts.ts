import memoize from "./memoize";
import { Post, PostInput, post } from "../schemas/post";
import readSources from "./readSources";
import { markdown } from "../schemas/markdown";

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
  const inputs: PostInput[] = [];

  console.time("Gathering posts");

  console.time("Fetching markdown");
  for (const url of urls) {
    inputs.push({
      url,
      md: await markdown.parseAsync(url),
    });
  }
  console.timeEnd("Fetching markdown");

  console.time("Parsing posts");
  const posts: Post[] = inputs.map((i) => post.parse(i));
  console.timeEnd("Parsing posts");

  console.timeEnd("Gathering posts");

  posts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return posts;
}, "posts");
