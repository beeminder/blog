export default function makeRedirects(slugs: string[]): Record<string, string> {
  const redirects = slugs
    .sort((a, b) => a.length - b.length)
    .map((s) =>
      Array.from({ length: s.length - 1 }, (_, i) => i + 1).map((n) => ({
        from: s.slice(0, n),
        to: s,
      }))
    )
    .flat();

  return redirects.reduce((acc: Record<string, string>, r) => {
    if (acc[r.from]) return acc;
    return { ...acc, [r.from]: r.to };
  }, {});
}
