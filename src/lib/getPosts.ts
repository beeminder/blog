import fs from "fs";

import getLegacyData from "./getLegacyData";
import type { Post } from "./makePost";
import makePost from "./makePost";

let _result: Post[] | undefined;

export default async function getPosts(): Promise<Post[]> {
  if (!_result) _result = await makePosts();
  return _result;
}

async function makePosts(): Promise<Post[]> {
  const sources = fs.readFileSync("sources.txt", "utf-8");
  const meta = await getLegacyData();
  const urls = sources.split("\n").filter(Boolean);
  const values: Post[] = [];

  console.time("Gathering posts");
  for (const url of urls) {
    values.push(await makePost(url, meta));
  }
  console.timeEnd("Gathering posts");

  values.sort((a, b) => b.date.getTime() - a.date.getTime());

  return values;
}

// For testing
export function __reset() {
  _result = undefined;
}
