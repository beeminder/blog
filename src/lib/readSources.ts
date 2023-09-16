import fs from "fs";

export default function readSources(): Record<string, unknown>[] {
  return JSON.parse(fs.readFileSync("posts.json", "utf-8"));
}
