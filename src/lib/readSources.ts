import fs from "fs";
import canonicalizeUrl from "./canonicalizeUrl";

export default function readSources(): string[] {
  return fs.readFileSync("sources.txt", "utf-8")
    .split("\n").filter(Boolean).map(canonicalizeUrl);
}
