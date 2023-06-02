import { describe, it } from "vitest";
import transformContent from "./exengine";

describe("ExEngine", () => {
  it("should run", () => {
    transformContent("foo");
  });
});
