export default function parseTitle(content: string): string {
  return content.match(/BEGIN_MAGIC\[(.*?)\]/)?.[1] || "";
}
