import type { Image } from "../schemas/image";

export default function extractImage(html: string): Image | undefined {
  const match = html.match(/<img\s[^>]*?\/?>/i);
  if (!match) return undefined;

  const tag = match[0];
  // Capture the opening quote and match to the SAME quote (\1), so the
  // other kind of quote is allowed inside the value (e.g. an apostrophe
  // in a double-quoted title). [\s\S] rather than . so a value spanning
  // multiple lines still matches its closing quote.
  const src = tag.match(/src=(["'])([\s\S]*?)\1/i)?.[2] ?? "";
  const alt = tag.match(/alt=(["'])([\s\S]*?)\1/i)?.[2] ?? "";
  const title = tag.match(/title=(["'])([\s\S]*?)\1/i)?.[2] ?? "";

  return { src, alt, title, extracted: true };
}
