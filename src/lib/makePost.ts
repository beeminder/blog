import parseMarkdown from "./parseMarkdown";
import fetchPost from "./fetchPost";

export type Post = {
  url: string;
  title: string;
  content: string;
  slug: string;
  tags: string[];
  date: Date;
  author: string;
};

function formatUrl(url: string) {
  const hasSchema = url.startsWith("http");
  const isDtherpad = url.includes("dtherpad.com");

  if (isDtherpad) {
    url = url.replace("dtherpad.com", "padm.us");
  }

  return hasSchema ? url : `https://${url}`;
}

export default async function makePost(
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
