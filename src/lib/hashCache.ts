import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "node:path";

export interface HashCacheOptions<T> {
  /** Unique key (typically a content hash) identifying this cache entry. */
  key: string;
  /** Full path to the cache file, including extension. */
  path: string;
  /** Convert a value to the string written to disk. Receives the key in case
   * the serialized form needs to embed it (e.g. for fixed-path caches). */
  serialize: (value: T, key: string) => string;
  /** Parse the on-disk string back into a value. Return `null` to signal a
   * cache miss (for example, when the embedded key doesn't match). Throwing
   * is also treated as a miss. */
  deserialize: (raw: string, key: string) => T | null;
  /** Compute the value when the cache misses. May be sync or async. */
  compute: () => T | Promise<T>;
}

/**
 * Read-miss-write filesystem cache utility.
 *
 * Owns the cache file I/O, error tolerance, and parent-directory creation
 * that are common to our hash-keyed disk caches. Cache write failures are
 * swallowed so they never crash the build.
 */
export function hashCache<T>(
  opts: HashCacheOptions<T> & { compute: () => Promise<T> },
): Promise<T>;
export function hashCache<T>(
  opts: HashCacheOptions<T> & { compute: () => T },
): T;
export function hashCache<T>(opts: HashCacheOptions<T>): T | Promise<T>;
export function hashCache<T>(opts: HashCacheOptions<T>): T | Promise<T> {
  const { key, path, serialize, deserialize, compute } = opts;

  try {
    const raw = readFileSync(path, "utf-8");
    if (typeof raw === "string") {
      const value = deserialize(raw, key);
      if (value !== null && value !== undefined) return value;
    }
  } catch {
    // Cache miss (file missing or unreadable).
  }

  const write = (value: T): void => {
    try {
      mkdirSync(dirname(path), { recursive: true });
    } catch {
      // ignore mkdir errors
    }
    try {
      writeFileSync(path, serialize(value, key));
    } catch {
      // ignore write errors
    }
  };

  const result = compute();
  if (result instanceof Promise) {
    return result.then((value) => {
      write(value);
      return value;
    });
  }
  write(result);
  return result;
}
