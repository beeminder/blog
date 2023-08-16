import { describe, it, expect } from "vitest";
import canonicalizeUrl from "./canonicalizeUrl";

describe("canonicalizeUrl", () => {
  it("adds schema if missing", async () => {
    const result = canonicalizeUrl("dtherpad.com/psychpricing");

    expect(result).toContain("https://");
  });

  it("handles dtherpad legacy domain", async () => {
    const result = canonicalizeUrl("https://dtherpad.com/psychpricing");

    expect(result).toContain("padm.us");
  });
});
