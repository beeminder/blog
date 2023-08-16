import { describe, it, expect } from "vitest";
import canonicalizeUrl from "./canonicalizeUrl";

describe("canonicalizeUrl", () => {
  it("adds schema if missing", async () => {
    const result = canonicalizeUrl("dtherpad.com/psychpricing");

    expect(result).toContain("https://");
  });

  it("works correctly TODO better name", async () => {
    const result = canonicalizeUrl("https://padm.us/beemblog-akrasia/export/txt");
    console.log(result);
    expect(result).toContain("https://");
  });

});

