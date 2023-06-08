import makeRedirects from "./makeRedirects";
import { describe, it, expect } from "vitest";

describe("makeRedirects", () => {
  it("makes redirects", () => {
    const result = makeRedirects(["slug"]);

    expect(result.s).toEqual("slug");
  });

  it("makes all redirects", () => {
    const result = makeRedirects(["slug"]);

    expect(result.sl).toEqual("slug");
  });

  it("does not redirect to itself", () => {
    const result = makeRedirects(["slug"]);

    expect(result.slug).toBeUndefined();
  });

  it("prioritizes shorter slugs", () => {
    const result = makeRedirects(["slug2", "slug"]);

    expect(result.s).toBe("slug");
  });
});
