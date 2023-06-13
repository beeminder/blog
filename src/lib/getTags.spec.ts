import { readFileSync } from "fs";
import { describe, it, expect, beforeEach, vi } from "vitest";
import getTags from "./getTags";
import getLegacyData from "./getLegacyData";

describe("getTags", () => {
  beforeEach(() => {
    vi.mocked(readFileSync).mockReturnValue("https://padm.us/psychpricing");
    vi.mocked(getLegacyData).mockResolvedValue({
      expost_source_url: "https://padm.us/psychpricing",
      Slug: "psychpricing",
      Tags: "the_tag",
      Date: "2021-09-01",
    });
  });

  it("returns tags", async () => {
    const result = await getTags();

    expect(result.the_tag).toBeDefined();
  });

  it("includes posts in tags", async () => {
    const result = await getTags();

    expect(result.the_tag?.posts).toHaveLength(1);
  });

  it("includes post count on tags", async () => {
    const result = await getTags();

    expect(result.the_tag?.count).toEqual(1);
  });

  it("includes tag name in tag", async () => {
    const result = await getTags();

    expect(result.the_tag?.name).toEqual("the_tag");
  });

  it("does not include blank tags", async () => {
    vi.mocked(getLegacyData).mockResolvedValue({
      expost_source_url: "https://padm.us/psychpricing",
      Slug: "psychpricing",
      Tags: "",
      Date: "2021-09-01",
    });

    const result = await getTags();

    expect(Object.keys(result)).toHaveLength(0);
  });
});
