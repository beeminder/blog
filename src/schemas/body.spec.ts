import { describe, it, expect } from "vitest";
import { body } from "./body";

describe("body", () => {
  it("supports em dashes", () => {
    const r = body.parse("foo -- bar");

    // https://www.codetable.net/name/em-dash
    expect(r).toContain("&#8212;");
  });
});
