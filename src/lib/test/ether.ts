import matter from "gray-matter";

export type Ether = {
  frontmatter?: Record<string, unknown>;
  before?: string;
  content?: string;
  after?: string;
  title?: string;
  redirects?: string[];
};

export default function ether({
  frontmatter = {},
  before = "",
  content = "",
  after = "",
  title,
}: Ether = {}): string {
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
