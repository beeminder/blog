import readLegacyData from "./readLegacyData";

import memoize from "./memoize";
import { LegacyPostInput, legacyPostInput } from "../schemas/legacyPostInput";
import { z } from "zod";

const getParsedLegacyData = memoize(() => {
  const raw = readLegacyData();
  return z.array(legacyPostInput).parse(raw);
}, "getParsedLegacyData");

export default function getLegacyData(
  url: string
): LegacyPostInput | undefined {
  return getParsedLegacyData().find((p) => p.expost_source_url === url);
}
