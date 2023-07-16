import fs from "fs";

export default function readSources(): string[] {
  return fs.readFileSync("sources.txt", "utf-8").split("\n").filter(Boolean);
}
