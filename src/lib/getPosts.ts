import fs from "fs";
import memoize from "./memoize";
import { Post, post } from "../schemas/post";

export default async function getPosts({
  includeUnpublished = false,
}: {
  includeUnpublished?: boolean;
} = {}) {
  const posts = await makePosts();

  if (includeUnpublished) {
    return posts;
  }

  return posts.filter((p) => p.status === "publish");
}

const makePosts = memoize(_makePosts, "posts");

async function _makePosts(): Promise<Post[]> {
  const sources = fs.readFileSync("sources.txt", "utf-8");
  const urls = sources.split("\n").filter(Boolean);
  const posts: Post[] = [];

  console.time("Gathering posts");
  for (const url of urls) {
    posts.push(await post.parseAsync(url));
  }
  console.timeEnd("Gathering posts");

  posts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return posts;
}
