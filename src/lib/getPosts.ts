import fs from "fs";
import type { Post } from "./makePost";
import makePost from "./makePost";
import memoize from "./memoize";

const getPosts = memoize(makePosts, "posts");

export default getPosts;

async function makePosts(): Promise<Post[]> {
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
