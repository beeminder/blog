import { describe, it, expect } from "vitest";
import { body } from "./body";
import padm from "../lib/test/padm";

describe("body", () => {
  it("supports em dashes", () => {
    const r = body.parse(
      padm({
        content: "foo -- bar",
      }),
    );

    // https://www.codetable.net/name/em-dash
    expect(r).toContain("&#8212;");
  });

  it("throws if no BEGIN_MAGIC", () => {
    expect(() => body.parse("hello world\nEND_MAGIC")).toThrow();
  });

  it("throws if no END_MAGIC", () => {
    expect(() => body.parse("BEGIN_MAGIC\nhello world")).toThrow();
  });

  it("disallows inline script tags", () => {
    expect(
      body.safeParse(
        padm({
          content: "<script></script>",
        }),
      ),
    ).toEqual(expect.objectContaining({ success: false }));
  });

  it("disallows inline script tags with content", () => {
    expect(
      body.safeParse(
        padm({
          content: "<script>console.log('hello')</script>",
        }),
      ),
    ).toEqual(expect.objectContaining({ success: false }));
  });

  it("disallows inline style tags with content", () => {
    expect(
      body.safeParse(
        padm({
          content: "<style>body {font-size: 2em;}</style>",
        }),
      ),
    ).toEqual(
      expect.objectContaining({
        data: expect.stringContaining(
          "&lt;style&gt;body {font-size: 2em;}&lt;/style&gt;",
        ),
      }),
    );
  });

  it("parse error includes sanitizeHTML error message", () => {
    const r = body.safeParse(
      padm({ content: `<iframe src="https://www.example.com"></iframe>` }),
    );
    if (r.success) {
      throw new Error("Expected failure");
    }
    expect(r.error.toString()).toContain("Iframe src not allowed");
  });
});
