import makeRedirects from "./makeRedirects";
import { describe, it, expect } from "vitest";

describe("makeRedirects", () => {
  it("makes redirects", () => {
    const result = makeRedirects(["slug"]);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: "s",
          to: "slug",
        }),
      ])
    );
  });

  it("makes all redirects", () => {
    const result = makeRedirects(["slug"]);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: "sl",
          to: "slug",
        }),
      ])
    );
  });

  it("does not redirect to itself", () => {
    const result = makeRedirects(["slug"]);

    expect(result).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          from: "slug",
          to: "slug",
        }),
      ])
    );
  });

  it("does not include duplicates", () => {
    const result = makeRedirects(["slug", "slug2"]);

    const matches = result.filter((r) => r.from === "s");

    expect(matches).toHaveLength(1);
  });

  it("prioritizes shorter slugs", () => {
    const result = makeRedirects(["slug2", "slug"]);

    const matches = result.filter((r) => r.from === "s");

    expect(matches).toHaveLength(1);
    expect(matches[0]?.to).toBe("slug");
  });
});
