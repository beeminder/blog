import fs from "fs";
import makePostInput from "./makePost";
import memoize from "./memoize";
import { z } from "zod";
import { Post, PostInput, post } from "../schemas/post";

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
  const inputs: PostInput[] = [];

  console.time("Gathering posts");
  for (const url of urls) {
    inputs.push(await makePostInput(url));
  }
  console.timeEnd("Gathering posts");

  const posts = z.array(post).parse(inputs);

  posts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return posts;
}
