const fns = new Map<string, any>();

export default function memoize<T>(fn: () => T, id: string) {
  return (): T => {
    if (fns.has(id)) {
      return fns.get(id);
    }

    const result = fn();
    fns.set(id, result);

    return result;
  };
}

export function __reset(id?: string) {
  if (id) {
    fns.delete(id);
  } else {
    fns.clear();
  }
}
