import getPosts, { __reset } from "./getPosts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import fetchPost from "./fetchPost";
import getLegacyData from "./getLegacyData";

describe("getPosts", () => {
  beforeEach(() => {
    __reset();
    vi.mocked(readFileSync).mockReturnValue("");
    vi.mocked(getLegacyData).mockResolvedValue([
      {
        expost_source_url: "https://padm.us/psychpricing",
        Slug: "psychpricing",
      },
    ]);
  });

  it("filters out blank lines", async () => {
    const posts = await getPosts();

    expect(posts).toHaveLength(0);
  });

  it("only loads sources once", async () => {
    await getPosts();
    await getPosts();

    expect(readFileSync).toHaveBeenCalledTimes(1);
  });

  it("fetches post content", async () => {
    vi.mocked(readFileSync).mockReturnValue("https://padm.us/psychpricing");

    await getPosts();

    expect(fetchPost).toBeCalledWith("https://padm.us/psychpricing");
  });

  it("handles dtherpad legacy domain", async () => {
    vi.mocked(readFileSync).mockReturnValue(
      "https://dtherpad.com/psychpricing"
    );

    vi.mocked(getLegacyData).mockResolvedValue([
      {
        expost_source_url: "https://dtherpad.com/psychpricing",
        Slug: "psychpricing",
      },
    ]);

    const result = await getPosts();

    expect(result[0]?.url).toContain("padm.us");
  });

  it("uses formatted url for fetching markdown", async () => {
    vi.mocked(readFileSync).mockReturnValue(
      "https://dtherpad.com/psychpricing"
    );

    vi.mocked(getLegacyData).mockResolvedValue([
      {
        expost_source_url: "https://dtherpad.com/psychpricing",
        Slug: "psychpricing",
      },
    ]);

    await getPosts();

    expect(fetchPost).toBeCalledWith(expect.stringContaining("padm.us"));
  });
});
