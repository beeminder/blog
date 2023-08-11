import applyIdsToElements from "./applyIdsToElements";
import { describe, it, expect } from "vitest";

describe("applyIdsToElements", () => {
  it("works", () => {
    const r = applyIdsToElements("<p>{#foo}bar</p>");
    expect(r).toBe('<p id="foo">bar</p>');
  });
});
