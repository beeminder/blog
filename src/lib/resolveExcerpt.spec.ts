import { describe, it, expect } from "vitest";
import resolveExcerpt from "./resolveExcerpt";
import ether from "./test/ether";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

describe("resolveExcerpt", () => {
  describe("undefined raw excerpt", () => {
    it("returns undefined", () => {
      expect(resolveExcerpt(undefined, "content")).toBeUndefined();
    });
  });

  describe("explicit raw excerpt", () => {
    it("decodes HTML entities", () => {
      const result = resolveExcerpt("<p>It&#8217;s great</p>", "content");
      expect(result).toBe("It’s great");
      expect(result).not.toContain("&#8217;");
    });

    it("strips HTML tags", () => {
      const result = resolveExcerpt("<p>Hello <strong>world</strong></p>", "");
      expect(result).toBe("Hello world");
    });
  });

  describe("auto-extract from html (MAGIC_AUTO_EXTRACT)", () => {
    it("appends ellipsis to excerpt", () => {
      const result = resolveExcerpt("MAGIC_AUTO_EXTRACT", ether());
      expect(result).toBe("...");
    });

    it("does not include images in excerpt", () => {
      const result = resolveExcerpt(
        "MAGIC_AUTO_EXTRACT",
        ether({
          content: '<img src="https://example.com/image.png" />',
        }),
      );
      expect(result).toBe("...");
    });

    it("limits length fuzzily", () => {
      const result = resolveExcerpt(
        "MAGIC_AUTO_EXTRACT",
        ether({ content: lorem }),
      );

      const words = (result ?? "").split(" ");
      expect(words[words.length - 1]).toBe("cillum...");
    });

    it("strips footnotes", () => {
      const result = resolveExcerpt(
        "MAGIC_AUTO_EXTRACT",
        ether({
          content: '<a class="footnote" id="fn1" href="#1">1</a>',
        }),
      );
      expect(result).toBe("...");
    });

    it("strips newlines", () => {
      const result = resolveExcerpt(
        "MAGIC_AUTO_EXTRACT",
        ether({ content: "foo\nbar" }),
      );
      expect(result).toBe("foo bar...");
    });

    it("does not include private notes", () => {
      const result = resolveExcerpt(
        "MAGIC_AUTO_EXTRACT",
        ether({ before: "private notes" }),
      );
      expect(result).not.toContain("private notes");
    });

    it("decodes HTML entities", () => {
      const html = "<p>It&#8217;s a great resource</p>";
      const result = resolveExcerpt("MAGIC_AUTO_EXTRACT", html);
      expect(result).toContain("’s a great resource");
      expect(result).not.toContain("&#8217;");
    });

    it("decodes multiple different HTML entities", () => {
      const html = "<p>&#8220;Hello&#8221; &amp; &#8217;world&#8217;</p>";
      const result = resolveExcerpt("MAGIC_AUTO_EXTRACT", html);
      expect(result).toContain("“Hello”");
      expect(result).toContain("& ’world’");
    });
  });
});
