import { describe, it, expect } from "vitest";
import formatEtherpadUrl from "./formatEtherpadUrl";

describe("formatEtherpadUrl", () => {
  it("adds schema if missing", async () => {
    const result = formatEtherpadUrl("dtherpad.com/psychpricing");

    expect(result).toContain("https://");
  });

  it("handles dtherpad legacy domain", async () => {
    const result = formatEtherpadUrl("https://dtherpad.com/psychpricing");

    expect(result).toContain("padm.us");
  });
});
