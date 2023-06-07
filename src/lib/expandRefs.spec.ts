import { describe, it, expect } from "vitest";
import expandRefs from "./expandRefs";

describe("expandRefs", () => {
  it("expands refs", () => {
    const result = expandRefs("$REF[foo]");

    expect(result).toContain("1");
  });

  it("does not link refs", () => {
    const result = expandRefs("$REF[foo]");

    expect(result).not.toContain("href");
  });

  it("increments refs", () => {
    const result = expandRefs("$REF[foo]\n\n$REF[foo]");

    expect(result).toContain("2");
  });

  it("isolates ref counting", () => {
    const result = expandRefs("$REF[foo]\n\n$REF[bar]");

    expect(result).not.toContain("2");
  });

  it("handls short syntax", () => {
    const result = expandRefs("$REF[foo] $foo");

    expect(result).toContain("2");
  });
});
