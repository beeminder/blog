import fs from "fs";
import { parse } from "csv-parse/sync";
import memoize from "./memoize";

const loadData = memoize(
  (): Array<Record<string, unknown>> =>
    parse(fs.readFileSync("wp-export.csv", "utf-8"), {
      columns: true,
    }),
  "wpExport"
);

export default async function getLegacyData(
  url: string
): Promise<Record<string, unknown> | undefined> {
  return loadData().find((p) => p.expost_source_url === url);
}
