import { describe, it, expect } from "vitest";
import { normalizeTagName, tagRedirectSlug } from "./tagSlug";

describe("normalizeTagName", () => {
  it("lowercases the tag name", () => {
    expect(normalizeTagName("Commitment Devices")).toEqual(
      "commitment devices",
    );
  });

  it("leaves an already-lowercase name unchanged", () => {
    expect(normalizeTagName("akrasia")).toEqual("akrasia");
  });
});

describe("tagRedirectSlug", () => {
  it("encodes spaces as +", () => {
    expect(tagRedirectSlug("commitment devices")).toEqual("commitment+devices");
  });

  it("encodes every space", () => {
    expect(tagRedirectSlug("a b c")).toEqual("a+b+c");
  });

  it("returns null when there is nothing to encode", () => {
    expect(tagRedirectSlug("akrasia")).toBeNull();
  });
});
