// CONTEXT: https://github.com/beeminder/blog/issues/376
export default function inlineParagraphs(markdown: string): string {
  return markdown.replace(/(.)\r?\n(.)/gm, "$1 $2");
}
