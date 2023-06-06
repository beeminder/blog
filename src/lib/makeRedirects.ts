type Redirect = {
  from: string;
  to: string;
};

export default function makeRedirects(slugs: string[]): Redirect[] {
  const redirects = slugs
    .sort((a, b) => a.length - b.length)
    .map((s) =>
      Array.from({ length: s.length - 1 }, (_, i) => i + 1).map((n) => ({
        from: s.slice(0, n),
        to: s,
      }))
    )
    .flat();

  return redirects.reduce((acc: Redirect[], r) => {
    const matches = acc.filter((a) => a.from === r.from);
    if (matches.length) return acc;
    return [...acc, r];
  }, []);
}
