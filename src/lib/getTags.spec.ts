import { describe, it, expect, beforeEach, vi } from "vitest";
import getTags from "./getTags";
import readSources from "./readSources";
import meta from "./test/meta";

describe("getTags", () => {
  beforeEach(() => {
    vi.mocked(readSources).mockReturnValue([
      meta({
        tags: ["the_tag"],
      }),
    ]);
  });

  it("returns tags", async () => {
    const result = await getTags();

    expect(result.length).toEqual(1);
  });

  it("includes posts in tags", async () => {
    const result = await getTags();

    expect(result[0]?.posts).toHaveLength(1);
  });

  it("includes post count on tags", async () => {
    const result = await getTags();

    expect(result[0]?.count).toEqual(1);
  });

  it("includes tag name in tag", async () => {
    const result = await getTags();

    expect(result[0]?.name).toEqual("the_tag");
  });

  it("does not include blank tags", async () => {
    vi.mocked(readSources).mockReturnValue([
      meta({
        tags: [""],
      }),
    ]);

    const result = await getTags();

    expect(Object.keys(result)).toHaveLength(0);
  });
});
