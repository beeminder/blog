export default async function getLegacyData(): Promise<
  Array<Record<string, unknown>>
> {
  return (await import("../../wp-export.csv")).default;
}
