import fs from "fs";
import { parse } from "csv-parse/sync";

export default async function getLegacyData(): Promise<
  Array<Record<string, unknown>>
> {
  return parse(fs.readFileSync("wp-export.csv", "utf-8"), {
    columns: true,
  });
}
