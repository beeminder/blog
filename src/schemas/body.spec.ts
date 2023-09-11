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
});
