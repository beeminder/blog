import { describe, it, expect } from "vitest";
import canonicalizeUrl from "./canonicalizeUrl";

describe("canonicalizeUrl", () => {
  it("adds schema if missing", async () => {
    const result = canonicalizeUrl("padm.us/psychpricing");

    expect(result).toContain("https://");
  });
});
