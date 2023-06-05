import { marked } from "marked";
import parseTitle from "./parseTitle";
import trimContent from "./trimContent";
import { markedSmartypants } from "marked-smartypants";
import hooks from "./markedHooks";
import addBlankLines from "./addBlankLines";

marked.use(markedSmartypants());
marked.use({ hooks });

const MARKED_OPTIONS = {
  mangle: false,
  headerIds: false,
} as const;

export default function parseMarkdown(markdown: string): {
  title: string;
  content: string;
} {
  const blanked = addBlankLines(markdown);
  const trimmed = trimContent(blanked);

  return {
    title: parseTitle(markdown),
    content: marked.parse(trimmed, MARKED_OPTIONS),
  };
}
