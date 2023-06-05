export default function addBlankLines(markdown: string): string {
  return markdown.replace(/(<\/\w+>)\n*/g, "$1\n\n");
}
