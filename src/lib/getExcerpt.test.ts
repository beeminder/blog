import { describe, it, expect } from "vitest";
import getExcerpt from "./getExcerpt";

describe("getExcerpt", () => {
  it("decodes HTML entities in explicit excerpts", () => {
    const result = getExcerpt("<p>It&#8217;s great</p>", "content");
    expect(result).toBe("It\u2019s great");
    expect(result).not.toContain("&#8217;");
  });

  it("returns undefined when excerpt is undefined", () => {
    expect(getExcerpt(undefined, "content")).toBeUndefined();
  });
});
