import { describe, it, expect } from "vitest";
import canonicalizeUrl from "./canonicalizeUrl";
import corpus from "./__fixtures__/posts-corpus.json";
import env from "./env";

const domain = env("ETHERPAD_DOMAIN");

if (typeof domain !== "string") {
  throw new Error("invalid domain");
}

// Reads the frozen corpus (see getPosts.spec-snapshot.ts), not live posts.json,
// so publishing a post doesn't add an unsnapshotted case and fail CI.
describe("canonicalizeUrl", () => {
  it.each(corpus)("handles source $source", async ({ source }) => {
    if (typeof source !== "string") {
      throw new Error("invalid source");
    }
    const result = canonicalizeUrl(source).replaceAll(
      domain,
      "the_source_domain",
    );

    expect(result).toBeTypeOf("string");
    expect(result).toMatchSnapshot();
  });
});
