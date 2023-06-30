const fns = new Map<string, unknown>();

export default function memoize<T, P extends Array<unknown>>(
  fn: (...args: P) => T,
  id: string
) {
  return (...args: P): T => {
    const _id = id + JSON.stringify(args);

    if (!fns.has(_id)) {
      fns.set(_id, fn(...args));
    }

    return fns.get(_id) as T;
  };
}

export function __reset() {
  fns.clear();
}
