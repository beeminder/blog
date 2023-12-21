import { describe, it, expect } from "vitest";
import canonicalizeUrl from "./canonicalizeUrl";
import readSources from "./readSources";
import env from "./env";

const domain = env("ETHERPAD_DOMAIN");

if (typeof domain !== "string") {
  throw new Error("invalid domain");
}

describe("canonicalizeUrl", () => {
  it.each(readSources())("handles source $source", async ({ source }) => {
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
