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

  it("replaces etherpad domain", async () => {
    const result = canonicalizeUrl("etherpad/psychpricing");

    expect(result).toContain("the_etherpad_domain");
  });

  it("replaces doc.bmndr.com domain", async () => {
    const result = canonicalizeUrl("doc.bmndr.com/psychpricing");

    expect(result).toContain("the_etherpad_domain");
  });

  it("replaces doc.beeminder.com domain", async () => {
    const result = canonicalizeUrl("doc.beeminder.com/psychpricing");

    expect(result).toContain("the_etherpad_domain");
  });

  it("does not replace unknown domain", async () => {
    const result = canonicalizeUrl("doc.unknown.com/psychpricing");

    expect(result).not.toContain("the_etherpad_domain");
  });

  it("strips trailing slashes", async () => {
    const result = canonicalizeUrl("doc.unknown.com/psychpricing/");
    expect(result).not.toMatch(/\/$/);
  });

  it("does not add /export/txt to unknown domain", async () => {
    const result = canonicalizeUrl("doc.unknown.com/psychpricing");

    expect(result).not.toContain("/export/txt");
  });
});
