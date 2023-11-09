import matter from "gray-matter";

export default function markdownSourceData({
  frontmatter = {},
  before = "",
  content = "",
  after = "",
  title,
}: {
  frontmatter?: Record<string, unknown>;
  before?: string;
  content?: string;
  after?: string;
  title?: string;
  redirects?: string[];
} = {}): string {
  return matter.stringify(
    `
${before}
BEGIN_MAGIC${title ? `[${title}]` : ""}
${content}
END_MAGIC
${after}
`,
    frontmatter,
  );
}
