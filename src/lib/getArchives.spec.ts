import { describe, it, expect, beforeEach, vi } from "vitest";
import getArchives from "./getArchives";
import readSources from "./readSources";

describe("getArchives", () => {
  beforeEach(() => {
    vi.mocked(readSources).mockReturnValue([
      {
        title: "Test Post",
        source: "https://padm.us/psychpricing",
        date: "2011-01-24",
        slug: "psychpricing",
        status: "publish",
        author: "author",
        excerpt: "excerpt",
        disqus_id: "abc",
        redirects: [],
        tags: [],
      },
    ]);
  });

  it("gets archives", async () => {
    const result = await getArchives();

    expect(result[0]).toBeDefined();
  });

  it("batches by month", async () => {
    const result = await getArchives();

    expect(result[0]?.months[0]?.posts).toHaveLength(1);
  });

  it("sets month label", async () => {
    const result = await getArchives();

    expect(result[0]?.months[0]?.label).toEqual("January");
  });

  it("properly batches by year", async () => {
    vi.mocked(readSources).mockReturnValue([
      {
        title: "Test Post",
        source: "https://padm.us/psychpricing",
        date: "2013-02-22",
        slug: "psychpricing",
        status: "publish",
        author: "author",
        disqus_id: "abc",
        redirects: [],
        tags: [],
        excerpt: "MAGIC_AUTO_EXTRACT",
      },
      {
        title: "Second Post",
        source: "https://padm.us/second",
        date: "2015-02-22",
        slug: "second",
        status: "publish",
        author: "author",
        disqus_id: "def",
        redirects: [],
        tags: [],
        excerpt: "MAGIC_AUTO_EXTRACT",
      },
    ]);

    const result = await getArchives();

    expect(result[0]?.months[0]?.posts).toHaveLength(1);
  });

  it("handles three posts in one month", async () => {
    vi.mocked(readSources).mockReturnValue([
      {
        title: "A",
        source: "https://padm.us/a",
        date: "2013-02-22",
        slug: "a",
        status: "publish",
        author: "author",
        disqus_id: "a",
        redirects: [],
        tags: [],
        excerpt: "MAGIC_AUTO_EXTRACT",
      },
      {
        title: "B",
        source: "https://padm.us/b",
        date: "2013-02-22",
        slug: "b",
        status: "publish",
        author: "author",
        disqus_id: "b",
        redirects: [],
        tags: [],
        excerpt: "MAGIC_AUTO_EXTRACT",
      },
      {
        title: "C",
        source: "https://padm.us/c",
        date: "2013-02-22",
        slug: "c",
        status: "publish",
        author: "author",
        disqus_id: "c",
        redirects: [],
        tags: [],
        excerpt: "MAGIC_AUTO_EXTRACT",
      },
    ]);

    const result = await getArchives();

    expect(result[0]?.months[0]?.posts).toHaveLength(3);
  });

  it("sorts posts by date", async () => {
    vi.mocked(readSources).mockReturnValue([
      {
        title: "A",
        source: "https://padm.us/a",
        date: "2013-02-22",
        slug: "a",
        status: "publish",
        author: "author",
        disqus_id: "a",
        redirects: [],
        tags: [],
        excerpt: "MAGIC_AUTO_EXTRACT",
      },
      {
        title: "B",
        source: "https://padm.us/b",
        date: "2013-02-21",
        slug: "b",
        status: "publish",
        author: "author",
        disqus_id: "b",
        redirects: [],
        tags: [],
        excerpt: "MAGIC_AUTO_EXTRACT",
      },
    ]);

    const result = await getArchives();

    expect(result[0]?.months[0]?.posts[0]?.title).toEqual("B");
  });
});
