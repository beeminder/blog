export default function ether({
  before = "",
  content = "",
  after = "",
  title = "the_title",
}: {
  frontmatter?: Record<string, unknown>;
  before?: string;
  content?: string;
  after?: string;
  title?: string | undefined | null;
  redirects?: string[];
} = {}): string {
  return `${before}
BEGIN_MAGIC${title ? `[${title}]` : ""}
${content}
END_MAGIC
${after}`;
}
