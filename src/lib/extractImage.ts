import type { Image } from "../schemas/image";
import getDom from "./getDom";

export default function extractImage(html: string): Image | undefined {
  const { document } = getDom(html);

  const img = document.querySelector("img") as unknown as HTMLImageElement;

  return img
    ? {
        src: img.src,
        alt: img.alt,
        title: img.title,
        extracted: true,
      }
    : undefined;
}
