import memoize from "./memoize";
import fs from "fs";
import { parse } from "csv-parse/sync";

const readLegacyData = memoize(
  (): Array<Record<string, unknown>> =>
    parse(fs.readFileSync("wp-export.csv", "utf-8"), {
      columns: true,
    }),
  "wpExport",
);

export default readLegacyData;
