import { marked } from "marked";
import parseTitle from "./parseTitle";
import trimContent from "./trimContent";
import { markedSmartypants } from "marked-smartypants";
import hooks from "./markedHooks";

marked.use(markedSmartypants());
marked.use({ hooks });

const MARKED_OPTIONS = {
  mangle: false,
  headerIds: false,
  pedantic: true,
} as const;

export default function parseMarkdown(markdown: string): {
  title: string;
  content: string;
} {
  const trimmed = trimContent(markdown);

  return {
    title: parseTitle(markdown),
    content: marked.parse(trimmed, MARKED_OPTIONS),
  };
}
