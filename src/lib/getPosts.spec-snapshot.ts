import { describe, it, expect } from "vitest";
import getPosts from "./getPosts";
import { createHash } from "crypto";

console.time("Retrieving posts");
const posts = await getPosts();
console.timeEnd("Retrieving posts");

console.time("Hashing posts");
const tests = posts.map((p) => {
  const hash = createHash("md5").update(p.md).digest("hex");
  return [p.slug, hash, p];
});
console.timeEnd("Hashing posts");

describe("body", () => {
  it.each(tests)("post %s hash %s", (_slug, _hash, post) => {
    expect(post).toMatchSnapshot();
  });
});
