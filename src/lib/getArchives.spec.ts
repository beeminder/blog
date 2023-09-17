import { describe, it, expect, beforeEach, vi } from "vitest";
import getArchives from "./getArchives";
import readSources from "./readSources";

describe("getArchives", () => {
  beforeEach(() => {
    vi.mocked(readSources).mockReturnValue([
      {
        source: "https://padm.us/psychpricing",
        date: "2011-01-24",
        slug: "psychpricing",
        status: "publish",
        author: "author",
        disqus_id: "abc",
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
        source: "https://padm.us/psychpricing",
        date: "2013-02-22",
        slug: "psychpricing",
        status: "publish",
        author: "author",
        disqus_id: "abc",
      },
      {
        source: "https://padm.us/second",
        date: "2015-02-22",
        slug: "second",
        status: "publish",
        author: "author",
        disqus_id: "def",
      },
    ]);

    const result = await getArchives();

    expect(result[0]?.months[1]?.posts).toHaveLength(1);
  });
});
