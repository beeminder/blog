import { marked } from "marked";
import parseTitle from "./parseTitle";
import trimContent from "./trimContent";
import { markedSmartypants } from "marked-smartypants";

marked.use(markedSmartypants());

export default function parseMarkdown(markdown: string): {
  title: string;
  content: string;
} {
  const trimmed = trimContent(markdown);

  return {
    title: parseTitle(markdown),
    content: marked.parse(trimmed, {
      mangle: false,
      headerIds: false,
      pedantic: true,
    }),
  };
}
