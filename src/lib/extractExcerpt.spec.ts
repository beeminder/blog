import extractExcerpt from "./extractExcerpt";
import { describe, it, expect } from "vitest";
import ether from "./test/ether";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

describe("extractExcerpt", () => {
  it("appends ellipsis to excerpt", () => {
    const result = extractExcerpt(ether());

    expect(result).toBe("...");
  });

  it("does not include images in excerpt", () => {
    const result = extractExcerpt(
      ether({
        content: '<img src="https://example.com/image.png" />',
      }),
    );

    expect(result).toBe("...");
  });

  it("limits length fuzzily", () => {
    const result = extractExcerpt(
      ether({
        content: lorem,
      }),
    );

    const words = result.split(" ");

    expect(words[words.length - 1]).toBe("cillum...");
  });

  it("strips footnotes", () => {
    const result = extractExcerpt(
      ether({
        content: '<a class="footnote" id="fn1" href="#1">1</a>',
      }),
    );

    expect(result).toBe("...");
  });

  it("strips newlines", () => {
    const result = extractExcerpt(
      ether({
        content: "foo\nbar",
      }),
    );

    expect(result).toBe("foo bar...");
  });

  it("does not include private notes", () => {
    const result = extractExcerpt(
      ether({
        before: "private notes",
      }),
    );

    expect(result).not.toContain("private notes");
  });
});
