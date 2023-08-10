import memoize from "./memoize";
import fs from "fs";
import { parse } from "csv-parse/sync";

const readCsv = (path: string): Array<Record<string, unknown>> =>
  parse(fs.readFileSync(`${__dirname}/../../${path}`, "utf-8"), {
    bom: true,
    columns: true,
  });

const readLegacyData = memoize((): Array<Record<string, unknown>> => {
  const posts = readCsv("wp-posts.csv");
  const users = readCsv("wp-users.csv");

  return posts.map((post) => ({
    ...post,
    user: users.find((u) => u.ID === post["Author ID"]),
  }));
}, "wpExport");

export default readLegacyData;
