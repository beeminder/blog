import { describe, it, expect, beforeEach, vi } from "vitest";
import getArchives from "./getArchives";
import readSources from "./readSources";
import meta from "./test/meta";

describe("getArchives", () => {
  beforeEach(() => {
    vi.mocked(readSources).mockReturnValue([meta()]);
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
      meta({ date: "2013-02-22" }),
      meta({ date: "2015-02-22" }),
    ]);

    const result = await getArchives();

    expect(result[0]?.months[0]?.posts).toHaveLength(1);
  });

  it("handles three posts in one month", async () => {
    vi.mocked(readSources).mockReturnValue([meta(), meta(), meta()]);

    const result = await getArchives();

    expect(result[0]?.months[0]?.posts).toHaveLength(3);
  });

  it("sorts posts by date", async () => {
    vi.mocked(readSources).mockReturnValue([
      meta({ title: "A", date: "2013-02-22" }),
      meta({ title: "B", date: "2013-02-21" }),
    ]);

    const result = await getArchives();

    expect(result[0]?.months[0]?.posts[0]?.title).toEqual("B");
  });
});
