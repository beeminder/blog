import { z } from "zod";
// import addBlankLines from "../lib/addBlankLines";
import trimContent from "../lib/trimContent";
import linkFootnotes from "../lib/linkFootnotes";
import expandRefs from "../lib/expandRefs";
import { marked } from "marked";
import { markedSmartypants } from "marked-smartypants";
import applyIdsToElements from "../lib/applyIdsToElements";

const MARKED_OPTIONS = {
  mangle: false,
  headerIds: false,
} as const;

marked.use(
  markedSmartypants({
    config: "1",
  }),
);

marked.use({
  hooks: {
    postprocess: applyIdsToElements,
    // WORKAROUND: @types/marked incorrectly requires `preprocess` to be defined.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
});

export const body = z
  .string()
  // .transform(addBlankLines)
  .transform(trimContent)
  .transform(linkFootnotes)
  .transform(expandRefs)
  .transform((md) => marked.parse(md, MARKED_OPTIONS));

export type Body = z.infer<typeof body>;
