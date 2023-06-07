import meta from "../../wp-export.csv";
import fs from "fs";
import parseMarkdown from "./parseMarkdown";
import fetchPost from "./fetchPost";

function formatUrl(url: string) {
  const hasSchema = url.startsWith("http");
  const isDtherpad = url.includes("dtherpad.com");

  if (isDtherpad) {
    url = url.replace("dtherpad.com", "padm.us");
  }

  return hasSchema ? url : `https://${url}`;
}

type Post = {
  url: string;
  wp: (typeof meta)[0] | undefined;
  title: string;
  content: string;
  slug: string;
};

let _result: Post[] | undefined;

export default async function getPosts(): Promise<Post[]> {
  if (!_result) _result = await _getPosts();
  return _result;
}

async function _getPosts(): Promise<Post[]> {
  const sources = fs.readFileSync("sources.txt", "utf-8");
  const urls = sources.split("\n").filter(Boolean);
  const posts = urls.map((url) => ({
    url: formatUrl(url),
    wp: meta.find((p) => p.expost_source_url === url),
  }));
  const values: Post[] = [];

  for (const p of posts) {
    console.log("start", p.url);

    const markdown = await fetchPost(p.url);
    const slug = p.wp?.Slug;

    if (typeof slug !== "string") {
      throw new Error(`No slug for ${p.url}`);
    }

    values.push({
      ...p,
      ...parseMarkdown(markdown),
      slug,
    });

    console.log("end", p.url);
  }

  return values;
}

// For testing
export function __reset() {
  _result = undefined;
}
