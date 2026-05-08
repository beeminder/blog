import { describe, it, expect, vi, beforeEach } from "vitest";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { hashCache } from "./hashCache";

describe("hashCache", () => {
  beforeEach(() => {
    vi.mocked(readFileSync).mockReset();
    vi.mocked(writeFileSync).mockReset();
    vi.mocked(mkdirSync).mockReset();
  });

  it("runs compute and writes when the cache file is missing", () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });
    const compute = vi.fn(() => "fresh");

    const result = hashCache({
      key: "abc",
      path: ".cache/x/abc.txt",
      serialize: (v) => v,
      deserialize: (raw) => raw,
      compute,
    });

    expect(result).toBe("fresh");
    expect(compute).toHaveBeenCalledTimes(1);
    expect(writeFileSync).toHaveBeenCalledWith(".cache/x/abc.txt", "fresh");
  });

  it("creates the parent directory before writing", () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });

    hashCache({
      key: "abc",
      path: ".cache/nested/dir/abc.txt",
      serialize: (v) => v,
      deserialize: (raw) => raw,
      compute: () => "v",
    });

    expect(mkdirSync).toHaveBeenCalledWith(".cache/nested/dir", {
      recursive: true,
    });
  });

  it("returns the cached value without recomputing on a hit", () => {
    vi.mocked(readFileSync).mockReturnValue(
      "cached" as unknown as ReturnType<typeof readFileSync>,
    );
    const compute = vi.fn(() => "fresh");

    const result = hashCache({
      key: "abc",
      path: ".cache/x/abc.txt",
      serialize: (v) => v,
      deserialize: (raw) => raw,
      compute,
    });

    expect(result).toBe("cached");
    expect(compute).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it("treats a deserialize that returns null as a miss", () => {
    vi.mocked(readFileSync).mockReturnValue(
      "stale" as unknown as ReturnType<typeof readFileSync>,
    );
    const compute = vi.fn(() => "fresh");

    const result = hashCache({
      key: "current",
      path: ".cache/x/abc.txt",
      serialize: (v) => v,
      deserialize: () => null,
      compute,
    });

    expect(result).toBe("fresh");
    expect(compute).toHaveBeenCalledTimes(1);
    expect(writeFileSync).toHaveBeenCalled();
  });

  it("treats a deserialize that throws as a miss", () => {
    vi.mocked(readFileSync).mockReturnValue(
      "not json" as unknown as ReturnType<typeof readFileSync>,
    );
    const compute = vi.fn(() => "fresh");

    const result = hashCache({
      key: "abc",
      path: ".cache/x/abc.json",
      serialize: (v) => JSON.stringify(v),
      deserialize: (raw) => JSON.parse(raw),
      compute,
    });

    expect(result).toBe("fresh");
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it("swallows write errors", () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });
    vi.mocked(writeFileSync).mockImplementation(() => {
      throw new Error("EACCES");
    });

    expect(() =>
      hashCache({
        key: "abc",
        path: ".cache/x/abc.txt",
        serialize: (v) => v,
        deserialize: (raw) => raw,
        compute: () => "fresh",
      }),
    ).not.toThrow();
  });

  it("swallows mkdir errors", () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });
    vi.mocked(mkdirSync).mockImplementation(() => {
      throw new Error("EACCES");
    });

    expect(() =>
      hashCache({
        key: "abc",
        path: ".cache/x/abc.txt",
        serialize: (v) => v,
        deserialize: (raw) => raw,
        compute: () => "fresh",
      }),
    ).not.toThrow();
  });

  it("awaits async compute and then writes", async () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });

    const result = await hashCache({
      key: "abc",
      path: ".cache/x/abc.json",
      serialize: (v) => JSON.stringify(v),
      deserialize: (raw) => JSON.parse(raw),
      compute: async () => ({ a: 1 }),
    });

    expect(result).toEqual({ a: 1 });
    expect(writeFileSync).toHaveBeenCalledWith(
      ".cache/x/abc.json",
      JSON.stringify({ a: 1 }),
    );
  });

  it("passes the key to serialize so callers can embed it on disk", () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });

    hashCache({
      key: "the_hash",
      path: ".cache/x/fixed.json",
      serialize: (value, key) => JSON.stringify({ key, value }),
      deserialize: (raw, key) => {
        const parsed = JSON.parse(raw);
        return parsed.key === key ? parsed.value : null;
      },
      compute: () => "fresh",
    });

    expect(writeFileSync).toHaveBeenCalledWith(
      ".cache/x/fixed.json",
      JSON.stringify({ key: "the_hash", value: "fresh" }),
    );
  });
});
