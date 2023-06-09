import fs from "fs";
import { parse } from "csv-parse/sync";

let meta: Record<string, unknown>[] | undefined;

export default async function getLegacyData(
  url: string
): Promise<Record<string, unknown> | undefined> {
  if (!meta) {
    meta = parse(fs.readFileSync("wp-export.csv", "utf-8"), {
      columns: true,
    });
  }

  return meta?.find((p) => p.expost_source_url === url);
}
