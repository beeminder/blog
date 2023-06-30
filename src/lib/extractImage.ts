import { JSDOM } from "jsdom";
import type { Image } from "./makePost";

export default function extractImage(html: string): Image | undefined {
  const dom = new JSDOM(html);
  const img = dom.window.document.querySelector("img");
  return img
    ? {
        src: img.src,
        alt: img.alt,
        extracted: true,
      }
    : undefined;
}
