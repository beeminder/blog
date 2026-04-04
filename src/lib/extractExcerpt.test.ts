import { describe, it, expect } from "vitest";
import extractExcerpt from "./extractExcerpt";

describe("extractExcerpt", () => {
  it("decodes HTML entities", () => {
    const html = "<p>It&#8217;s a great resource</p>";
    const result = extractExcerpt(html);
    expect(result).toContain("\u2019s a great resource");
    expect(result).not.toContain("&#8217;");
  });

  it("decodes multiple different HTML entities", () => {
    const html =
      "<p>&#8220;Hello&#8221; &amp; &#8217;world&#8217;</p>";
    const result = extractExcerpt(html);
    expect(result).toContain("\u201CHello\u201D");
    expect(result).toContain("& \u2019world\u2019");
  });
});
