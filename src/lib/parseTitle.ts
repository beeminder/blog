export default function parseTitle(content: string): string | undefined {
  return content.match(/BEGIN_MAGIC\[(.*?)\]/)?.[1];
}
