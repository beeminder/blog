import getPosts from "./getPosts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import fetchPost from "./fetchPost";
import getLegacyData from "./getLegacyData";

describe("getPosts", () => {
  beforeEach(() => {
    vi.mocked(readFileSync).mockReturnValue("https://padm.us/psychpricing");
    vi.mocked(getLegacyData).mockResolvedValue({
      expost_source_url: "https://padm.us/psychpricing",
      Slug: "psychpricing",
      Date: "2021-09-01",
      Status: "publish",
    });
  });

  it("filters out blank lines", async () => {
    vi.mocked(readFileSync).mockReturnValue("");

    const posts = await getPosts();

    expect(posts).toHaveLength(0);
  });

  it("only loads sources once", async () => {
    await getPosts();
    await getPosts();

    expect(readFileSync).toHaveBeenCalledTimes(1);
  });

  it("fetches post content", async () => {
    await getPosts();

    expect(fetchPost).toBeCalledWith("https://padm.us/psychpricing");
  });

  it("handles dtherpad legacy domain", async () => {
    vi.mocked(readFileSync).mockReturnValue(
      "https://dtherpad.com/psychpricing"
    );

    vi.mocked(getLegacyData).mockResolvedValue({
      expost_source_url: "https://dtherpad.com/psychpricing",
      Slug: "psychpricing",
      Date: "2021-09-01",
      Status: "publish",
    });

    const result = await getPosts();

    expect(result[0]?.url).toContain("padm.us");
  });

  it("uses formatted url for fetching markdown", async () => {
    vi.mocked(readFileSync).mockReturnValue(
      "https://dtherpad.com/psychpricing"
    );

    vi.mocked(getLegacyData).mockResolvedValue({
      expost_source_url: "https://dtherpad.com/psychpricing",
      Slug: "psychpricing",
      Date: "2021-09-01",
      Status: "publish",
    });

    await getPosts();

    expect(fetchPost).toBeCalledWith(expect.stringContaining("padm.us"));
  });

  it("sorts post by date descending", async () => {
    vi.mocked(readFileSync).mockReturnValue(`
https://dtherpad.com/old
https://dtherpad.com/new
`);

    vi.mocked(getLegacyData).mockImplementation(async (url: string) => {
      if (url === "https://dtherpad.com/old") {
        return {
          expost_source_url: "https://dtherpad.com/old",
          Slug: "old",
          Date: "2020-01-01",
          Status: "publish",
        };
      }
      if (url === "https://dtherpad.com/new") {
        return {
          expost_source_url: "https://dtherpad.com/new",
          Slug: "new",
          Date: "2020-01-02",
          Status: "publish",
        };
      }
      return undefined;
    });

    const result = await getPosts();

    expect(result[0]?.url).toContain("new");
  });

  it("includes excerpts", async () => {
    vi.mocked(fetchPost).mockResolvedValue("word");

    const posts = await getPosts();

    expect(posts[0]?.excerpt).toContain("word");
  });

  it("excludes unpublished posts by default", async () => {
    vi.mocked(getLegacyData).mockResolvedValue({
      expost_source_url: "https://padm.us/psychpricing",
      Slug: "psychpricing",
      Date: "2021-09-01",
      Status: "draft",
    });

    const posts = await getPosts();

    expect(posts).toHaveLength(0);
  });

  it("includes unpublished posts when requested", async () => {
    vi.mocked(getLegacyData).mockResolvedValue({
      expost_source_url: "https://padm.us/psychpricing",
      Slug: "psychpricing",
      Date: "2021-09-01",
      Status: "draft",
    });

    const posts = await getPosts({ includeUnpublished: true });

    expect(posts).toHaveLength(1);
  });

  it('caches posts without reference to "includeUnpublished"', async () => {
    await getPosts();
    await getPosts({ includeUnpublished: true });

    expect(fetchPost).toHaveBeenCalledTimes(1);
  });
});
