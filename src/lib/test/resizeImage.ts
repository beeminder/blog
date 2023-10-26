import { type Sharp } from "sharp";

type Options = {
  image: Sharp;
  width: number;
  height: number;
};

export default function resizeImage({
  image,
  width,
  height,
}: Options): Promise<Buffer> {
  return image
    .resize({
      width,
      height,
      fit: "contain",
      position: "left top",
    })
    .raw()
    .toBuffer();
}
