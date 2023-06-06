import getPosts, { __reset } from "./getPosts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";

vi.mock("../../wp-export.csv", () => ({
  __esModule: true,
  default: [
    {
      expost_source_url: "https://padm.us/psychpricing",
      Slug: "psychpricing",
    },
  ],
}));

vi.mock("fs", () => {
  const readFileSync = vi.fn(() => "");

  return {
    __esModule: true,
    readFileSync,
    default: {
      readFileSync,
    },
  };
});

describe("getPosts", () => {
  beforeEach(() => {
    __reset();
    vi.mocked(readFileSync).mockReturnValue("");
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

    expect(fetch).toBeCalled();
  });
});
