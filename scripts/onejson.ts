// usage:
// pnpm dlx tsx ./scripts/onejson.ts

import { readFileSync, writeFileSync } from "fs";
import { parse } from "csv-parse";
import canonicalizeUrl from "../src/lib/canonicalizeUrl";

const sourcesPath = new URL("../sources.txt", import.meta.url).pathname;
const postsPath = new URL("../wp-posts.csv", import.meta.url).pathname;
const usersPath = new URL("../wp-users.csv", import.meta.url).pathname;

function readCsv(path: string): Promise<Record<string, string>[]> {
  const raw = readFileSync(path, "utf8");
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }).toArray();
}

const sources = readFileSync(sourcesPath, "utf8").split("\n").filter(Boolean);
const posts = await readCsv(postsPath);
const users = await readCsv(usersPath);

const data = sources.map((source) => {
  const canonical = canonicalizeUrl(source);
  console.log(canonical);
  const post = posts.find((post) => post.expost_source_url === canonical);
  const author = post
    ? users.find((user) => user.ID === post["Author ID"])
    : undefined;

  console.log({ post, author });

  return {
    source,
    id: post?.ID,
    title: post?.Title,
    slug: post?.Slug,
    date: post?.Date,
    author: author?.display_name,
    tags: post?.Tags?.split("|").filter(Boolean),
    status: post?.Status,
    disqus_id: post
      ? `${post.ID} https://blog.beeminder.com/?p=${post.ID}`
      : undefined,
    excerpt: post?.Excerpt,
  };
});

writeFileSync(
  new URL("../posts.json", import.meta.url).pathname,
  JSON.stringify(data, null, 2),
);
