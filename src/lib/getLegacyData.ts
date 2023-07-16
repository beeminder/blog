import readLegacyData from "./readLegacyData";

import memoize from "./memoize";
import { legacyPostInput } from "../schemas/legacyPostInput";
import { z } from "zod";
import {
  legacyPostOutput,
  type LegacyPostOutput,
} from "../schemas/legacyPostOutput";

const getParsedLegacyData = memoize(() => {
  const raw = readLegacyData();
  return z.array(legacyPostInput).parse(raw);
}, "getParsedLegacyData");

export default function getLegacyData(
  url: string
): LegacyPostOutput | undefined {
  const raw = getParsedLegacyData().find((p) => p.expost_source_url === url);
  return raw ? legacyPostOutput.parse(raw) : undefined;
}
