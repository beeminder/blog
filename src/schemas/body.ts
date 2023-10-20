import { z } from "zod";
import addBlankLines from "../lib/addBlankLines";
import trimContent from "../lib/trimContent";
import linkFootnotes from "../lib/linkFootnotes";
import expandRefs from "../lib/expandRefs";
import { marked } from "marked";
import { markedSmartypants } from "marked-smartypants";
import applyIdsToElements from "../lib/applyIdsToElements";
// import DOMPurify from "dompurify";
// import getDom from "../lib/getDom";
import sanitizeHtml from "sanitize-html";

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
  .refine((content) => content.includes("BEGIN_MAGIC"), {
    message: "No BEGIN_MAGIC found",
  })
  .refine((content) => content.includes("END_MAGIC"), {
    message: "No END_MAGIC found",
  })
  .refine((content) => !/(?<!\n)\n<!--/gm.test(content), {
    message:
      "Failed due to comment syntax error in post. Please make sure all HTML comments are preceeded by a new line.",
  })
  .transform(trimContent)
  .transform(addBlankLines)
  .transform(linkFootnotes)
  .transform(expandRefs)
  .transform((md) => marked.parse(md))
  .transform((html) =>
    sanitizeHtml(html, {
      allowedAttributes: {
        "*": ["id", "href", "title", "class", "style"],
        a: ["href", "name", "target"],
        font: ["size", "color"],
        form: ["action"],
        iframe: [
          "src",
          "frameborder",
          "name",
          "height",
          "width",
          "border",
          "cellspacing",
          "scrolling",
        ],
        img: ["src", "alt", "width", "height", "caption", "cite"],
        input: ["type", "name", "value"],
        ol: ["start"],
        table: ["border", "cellpadding", "cellspacing"],
        tt: ["weight"],
      },
      disallowedTagsMode: "escape",
      parser: {
        decodeEntities: false,
      },
      allowedTags: [
        "a",
        "center",
        "address",
        "article",
        "aside",
        "footer",
        "font",
        "form",
        "header",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hgroup",
        "main",
        "nav",
        "section",
        "blockquote",
        "dd",
        "div",
        "dl",
        "dt",
        "figcaption",
        "figure",
        "hr",
        "li",
        "main",
        "ol",
        "p",
        "pre",
        "ul",
        "a",
        "abbr",
        "b",
        "bdi",
        "bdo",
        "br",
        "cite",
        "code",
        "data",
        "dfn",
        "em",
        "i",
        "input",
        "iframe",
        "kbd",
        "mark",
        "q",
        "rb",
        "rp",
        "rt",
        "rtc",
        "ruby",
        "s",
        "samp",
        "small",
        "span",
        "strike",
        "strong",
        "sub",
        "sup",
        "time",
        "u",
        "var",
        "wbr",
        "caption",
        "col",
        "colgroup",
        "table",
        "tbody",
        "td",
        "tfoot",
        "th",
        "thead",
        "tr",
        "tt",
        "img",
      ],
    }),
  );

// .transform((html) => {
//   const window = getDom("");
//   const purify = DOMPurify(window as any);
//   return purify.sanitize(html);
//  });

// DOMPurify.sanitize(body.parse(""));
// const clean = DOMPurify.sanitize("<img src=x onerror=alert(1)//>");
// console.log(clean);

export type Body = z.infer<typeof body>;
