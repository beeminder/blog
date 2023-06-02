export default function trimContent(content: string): string {
  const trimLeft = content.replace(/.+BEGIN_MAGIC\[(.*?)\]/s, "");
  const trimRight = trimLeft.replace(/END_MAGIC.+/s, "");

  return trimRight;
}
