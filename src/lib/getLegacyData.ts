import loadLegacyData from "./loadLegacyData";

export default function getLegacyData(
  url: string
): Record<string, unknown> | undefined {
  return loadLegacyData().find((p) => p.expost_source_url === url);
}
