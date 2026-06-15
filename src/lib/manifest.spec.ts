import { describe, it, expect, beforeEach, vi } from "vitest";
import getManifest from "./manifest";
import readSources from "./readSources";
import meta from "./test/meta";

describe("getManifest", () => {
  beforeEach(() => {
    vi.mocked(readSources).mockReturnValue([meta()]);
  });

  it("returns validated, typed entries", () => {
    const result = getManifest();

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toContain("the_slug");
  });

  it("strips the md field — manifest entries are pre-fetch metadata", () => {
    vi.mocked(readSources).mockReturnValue([
      meta({ md: "should not be here" }),
    ]);

    const result = getManifest();

    expect(result[0]).not.toHaveProperty("md");
  });

  it("reads posts.json only once across calls", () => {
    getManifest();
    getManifest();

    expect(readSources).toHaveBeenCalledTimes(1);
  });

  it("throws with the entry index when an entry is invalid", () => {
    vi.mocked(readSources).mockReturnValue([meta(), { source: "only-source" }]);

    expect(() => getManifest()).toThrow(/index 1/);
  });
});
