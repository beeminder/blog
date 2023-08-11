import getArchives from "./getArchives";
import memoize from "./memoize";

function getSortedValues<T>(obj: Record<string, T>): T[] {
  return Object.entries(obj)
    .sort((a, b) => +b[0] - +a[0])
    .map(([, v]) => v);
}

const getYears = memoize(() => getArchives().then(getSortedValues), "getYears");

export default getYears;
