// WORKAROUND: `import.meta.env` is not available during Astro config evaluation.
// https://docs.astro.build/en/guides/configuring-astro/#environment-variables
export default function env(key: string): string | undefined {
  return import.meta.env?.[key] || process.env[key];
}
