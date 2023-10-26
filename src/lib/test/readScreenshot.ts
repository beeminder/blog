import fs from "fs";
import type { Sharp } from "sharp";
import sharp from "sharp";

export default function readScreenshot(path: URL): Sharp {
  return sharp(fs.readFileSync(path));
}
