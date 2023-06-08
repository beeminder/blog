import fs from "fs";
import parseMarkdown from "./parseMarkdown";
import fetchPost from "./fetchPost";
import getLegacyData from "./getLegacyData";

export type Post = {
  url: string;
  title: string;
  content: string;
  slug: string;
  tags: string[];
  date: Date;
  author: string;
};

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

  for (const url of urls) {
    console.log("start", url);
    values.push(await makePost(url, meta));
    console.log("end", url);
  }

  return values;
}

function formatUrl(url: string) {
  const hasSchema = url.startsWith("http");
  const isDtherpad = url.includes("dtherpad.com");

  if (isDtherpad) {
    url = url.replace("dtherpad.com", "padm.us");
  }

  return hasSchema ? url : `https://${url}`;
}

async function makePost(
  url: string,
  meta: Record<string, unknown>[]
): Promise<Post> {
  const wp = meta.find((p) => p.expost_source_url === url);
  const formattedUrl = formatUrl(url);
  const markdown = await fetchPost(formattedUrl);
  const slug = wp?.Slug;
  const date = new Date(String(wp?.Date));
  const author = String(wp?.["Author Username"]);
  const tags = String(wp?.Tags || "")
    .split("|")
    .filter(Boolean);

  if (typeof slug !== "string") {
    throw new Error(`Invalid slug for ${url}`);
  }

  return {
    ...parseMarkdown(markdown),
    slug,
    tags,
    date,
    url: formattedUrl,
    author,
  };
}

// For testing
export function __reset() {
  _result = undefined;
}
