import type { Image } from "../schemas/image";

export default function extractImage(html: string): Image | undefined {
  const match = html.match(/<img\s[^>]*?\/?>/i);
  if (!match) return undefined;

  const tag = match[0];
  const src = tag.match(/src=["']([^"']*)["']/i)?.[1] ?? "";
  const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1] ?? "";
  const title = tag.match(/title=["']([^"']*)["']/i)?.[1] ?? "";

  return { src, alt, title, extracted: true };
}
