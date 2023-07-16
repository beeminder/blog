import parseMarkdown from "./parseMarkdown";
import fetchPost from "./fetchPost";
import getLegacyData from "./getLegacyData";
import { z } from "zod";
import type { Image } from "../schemas/image";
import { legacyPostOutput } from "../schemas/legacyPostOutput";
import { parsedMarkdown } from "../schemas/parsedMarkdown";
import { Status, status } from "../schemas/status";

export type Post = {
  url: string;
  title: string;
  excerpt: string;
  content: string;
  markdown: string;
  slug: string;
  tags: string[];
  date: Date;
  date_string: string;
  author: string;
  disqus: {
    id: string;
    url: string;
  };
  image: Image | undefined;
  status: Status;
};

function formatUrl(url: string) {
  const hasSchema = url.startsWith("http");
  const isDtherpad = url.includes("dtherpad.com");

  if (isDtherpad) {
    url = url.replace("dtherpad.com", "padm.us");
  }

  return hasSchema ? url : `https://${url}`;
}

export function getStatus(value: unknown): Status | undefined {
  return status.optional().parse(value);
}

const postSchema = z.object({
  wp: legacyPostOutput.optional(),
  parsed: parsedMarkdown,
});

export default async function makePost(url: string): Promise<Post> {
  const wp = getLegacyData(url);
  const markdownUrl = formatUrl(url);
  const markdown = await fetchPost(markdownUrl);
  const parsed = parseMarkdown(markdown);

  if (wp === undefined && !parsed.frontmatter.excerpt) {
    throw new Error("Custom excerpts are required for new posts.");
  }

  const slug = parsed.slug || wp?.slug;

  if (typeof slug !== "string") {
    throw new Error(`Invalid slug for ${url}`);
  }

  const date = parsed.date || wp?.date;

  if (!(date instanceof Date)) {
    throw new Error(`Invalid date for ${url}`);
  }

  const date_string = date.toISOString().split("T")[0];

  if (!date_string) {
    throw new Error(`Invalid date for ${url}`);
  }

  return {
    ...parsed,
    slug,
    title: parsed.isLegacyTitle
      ? wp?.title?.toString() || parsed.title
      : parsed.title,
    markdown,
    tags: [...parsed.tags, ...(wp?.tags || [])],
    date,
    date_string,
    url: markdownUrl,
    author: parsed.author || wp?.author || "",
    disqus: {
      id: `${wp?.id} https://blog.beeminder.com/?p=${wp?.id}`,
      url: `https://blog.beeminder.com/${slug}/`,
    },
    status: parsed.status ?? getStatus(wp?.status) ?? "draft",
  };
}
