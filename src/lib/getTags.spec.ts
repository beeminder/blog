import { describe, it, expect, beforeEach, vi } from "vitest";
import getTags from "./getTags";
import meta from "./test/meta";
import { getCollection } from "astro:content";
import ether from "./test/ether";

describe("getTags", () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReturnValue([
      {
        data: {
          ...meta({
            tags: ["the_tag"],
          }),
          md: ether(),
        },
      },
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
    vi.mocked(getCollection).mockReturnValue([
      {
        data: {
          ...meta({
            tags: [""],
          }),
          md: ether(),
        },
      },
    ]);

    const result = await getTags();

    expect(Object.keys(result)).toHaveLength(0);
  });
});
