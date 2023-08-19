import { describe, it, expect } from "vitest";
import { legacyPost } from "./legacyPost";
import loadLegacyData from "../lib/test/loadLegacyData";

describe("legacyPost", () => {
  it("generates disqus id", () => {
    loadLegacyData([
      {
        ID: "1",
        expost_source_url: "the_url",
      },
    ]);

    const p = legacyPost.parse("the_url");

    if (!p) throw new Error("p is undefined");

    expect(p.disqus_id).toEqual("1 https://blog.beeminder.com/?p=1");
  });
});
