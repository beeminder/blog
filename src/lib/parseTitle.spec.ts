import { describe, it, expect } from "vitest";

import parseTitle from "./parseTitle";

describe("parseTitle", () => {
  it("parses title", () => {
    const content = "BEGIN_MAGIC[title]";
    expect(parseTitle(content)).toBe("title");
  });

  it("returns undefined if no title", () => {
    const content = `BEGIN_MAGIC
helle world`;
    expect(parseTitle(content)).toBeUndefined();
  });

  it("returns blogmorphosis title", () => {
    const content = `BEGIN_MAGIC[Ditching WordPress and a Shiny Blog Redesign]`;
    expect(parseTitle(content)).toBe(
      "Ditching WordPress and a Shiny Blog Redesign",
    );
  });
});
