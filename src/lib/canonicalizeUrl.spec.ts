import { describe, it, expect } from "vitest";
import canonicalizeUrl from "./canonicalizeUrl";

describe("canonicalizeUrl", () => {
  it("adds schema if missing", async () => {
    const result = canonicalizeUrl("doc.bmndr.co/psychpricing");

    expect(result).toContain("https://");
  });

  it("replaces domain", async () => {
    const result = canonicalizeUrl("doc.bmndr.co/psychpricing");

    expect(result).not.toContain("doc.bmndr.co");
  });

  it("uses source domain", async () => {
    const result = canonicalizeUrl("doc.bmndr.co/psychpricing");

    expect(result).not.toContain("undefined");
  });

  it("returns the correct url", async () => {
    const result = canonicalizeUrl("doc.bmndr.co/psychpricing");

    expect(result).toEqual(
      "https://the_etherpad_domain/psychpricing/export/txt",
    );
  });
});
