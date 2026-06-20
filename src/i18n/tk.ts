// Placeholder for copy that has NOT been written yet.
//
// AI agents (and anyone scaffolding new UI) must NOT invent user-facing copy.
// For any new string, leave the wording to a human: give `tk()` a description
// of what the copy should say and where it appears, and reference it from the
// catalog as usual. Example:
//
//   emptyState: tk("Message shown on the tag page when a tag has no posts"),
//
// The rendered value is an obvious, grep-able marker (`[TK: ...]`) so an
// unwritten string is impossible to miss in dev/preview, and CI fails while any
// remain (see scripts/check-i18n-placeholders.ts) — a human must replace the
// `tk(...)` call with the real copy before the PR can merge.
//
// "TK" is the journalism convention for "to come"; the bigram appears in almost
// no English word, which is what makes it safe to grep for.
export function tk(description: string): string {
  return `[TK: ${description}]`;
}
