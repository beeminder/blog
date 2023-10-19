import extractExcerpt from "./extractExcerpt";
import striptags from "striptags";

export default function getExcerpt(
  excerpt: string | undefined,
  content: string,
) {
  switch (excerpt) {
    case "MAGIC_AUTO_EXTRACT":
      return extractExcerpt(content);
    case undefined:
      return undefined;
    default:
      return striptags(excerpt);
  }
}
