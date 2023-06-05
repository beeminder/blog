export default function parseTitle(content: string): string {
  const matches = content.match(/BEGIN_MAGIC\[(.*?)\]/);

  return matches?.[1] || "";
}
