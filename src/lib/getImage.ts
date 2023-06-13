import { JSDOM } from "jsdom";

export type Image = {
  src: string;
  alt: string | undefined;
};

export default function getImage(html: string): Image | undefined {
  const dom = new JSDOM(html);
  const img = dom.window.document.querySelector("img");
  return img
    ? {
        src: img.src,
        alt: img.alt,
      }
    : undefined;
}
