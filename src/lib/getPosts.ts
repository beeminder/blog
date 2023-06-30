import fs from "fs";
import type { Post } from "./makePost";
import makePost, { Status } from "./makePost";
import memoize from "./memoize";

export default async function getPosts({
  includeUnpublished = false,
}: {
  includeUnpublished?: boolean;
} = {}) {
  const posts = await makePosts();

  if (includeUnpublished) {
    return posts;
  }

  return posts.filter((p) => p.status === Status.Publish);
}

const makePosts = memoize(_makePosts, "posts");

async function _makePosts(): Promise<Post[]> {
  const sources = fs.readFileSync("sources.txt", "utf-8");
  const urls = sources.split("\n").filter(Boolean);
  const values: Post[] = [];

  console.time("Gathering posts");
  for (const url of urls) {
    values.push(await makePost(url));
  }
  console.timeEnd("Gathering posts");

  values.sort((a, b) => b.date.getTime() - a.date.getTime());

  return values;
}
