// Fails when an AI-agent-co-authored commit changes real user-facing copy in
// the i18n catalog.
//
// Policy: only humans may write or edit the wording of user-facing strings.
// Agents may still ADD `tk("description")` placeholder stubs (a human fills in
// the copy later), but any other add/edit/delete of a string value in a
// protected catalog file by an agent-authored commit is a violation.
//
// "Agent-authored" = the commit's author identity or any `Co-authored-by:`
// trailer matches a known AI-agent signature (see AGENT_PATTERNS). This is the
// convention Claude Code and similar tools use.
//
// Scope = commits on this branch that aren't on the base branch
// (<base>..HEAD). Already-merged history is never re-examined, so this only
// polices NEW commits in a PR. (It is expected to fail on the PR that first
// migrates existing copy into the catalog — that bulk move is agent-authored.)
import { spawnSync } from "node:child_process";

function git(args: string[]): string {
  const r = spawnSync("git", args, { encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed:\n${r.stderr}`);
  }
  return r.stdout;
}

const base =
  process.env.STRINGS_CHECK_BASE ||
  (process.env.GITHUB_BASE_REF
    ? `origin/${process.env.GITHUB_BASE_REF}`
    : "origin/master");

// Protected = locale catalogs under src/i18n. Code in that dir (the tk helper,
// the barrel) is not copy and is exempt.
function isProtected(file: string): boolean {
  if (!file.startsWith("src/i18n/") || !file.endsWith(".ts")) return false;
  const name = file.slice("src/i18n/".length);
  return name !== "tk.ts" && name !== "index.ts";
}

const AGENT_PATTERNS: RegExp[] = [
  /anthropic/i,
  /\bclaude\b/i,
  /\bcopilot\b/i,
  /\bcursor\b/i,
  /\bdevin\b/i,
  /\baider\b/i,
  /\bchatgpt\b/i,
  /\bopenai\b/i,
  /\bcodex\b/i,
];

function isAgentAuthored(message: string, author: string): boolean {
  const trailers = [...message.matchAll(/^\s*co-authored-by:\s*(.+)$/gim)].map(
    (m) => (m[1] ?? "").trim(),
  );
  return [author, ...trailers].some((id) =>
    AGENT_PATTERNS.some((p) => p.test(id)),
  );
}

// A diff line touches real copy when it contains a string literal that is not a
// tk() placeholder. Structural lines (braces, unquoted keys, function
// signatures) and comments are ignored.
function touchesRealCopy(content: string): boolean {
  const trimmed = content.trim();
  if (trimmed === "") return false;
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*")
  ) {
    return false;
  }
  // import/export-from statements are code (e.g. `import { tk } from "./tk"`),
  // not copy — their quotes are module paths.
  if (
    trimmed.startsWith("import ") ||
    /\bfrom\s+["'][^"']*["']/.test(trimmed)
  ) {
    return false;
  }
  if (!trimmed.includes('"') && !trimmed.includes("`")) return false;
  if (/\btk\(/.test(content) || /\[TK:/.test(content)) return false;
  return true;
}

try {
  git(["rev-parse", "--verify", base]);
} catch {
  console.error(
    `check:strings: base ref '${base}' not found.\n` +
      "Fetch the base branch first, or set STRINGS_CHECK_BASE (e.g. origin/master).",
  );
  process.exit(2);
}

const shas = git(["rev-list", "--no-merges", `${base}..HEAD`])
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

const violations: string[] = [];

for (const sha of shas) {
  const message = git(["show", "-s", "--format=%B", sha]);
  const author = git(["show", "-s", "--format=%an <%ae>", sha]).trim();
  if (!isAgentAuthored(message, author)) continue;

  const files = git(["diff-tree", "--no-commit-id", "--name-only", "-r", sha])
    .split("\n")
    .map((s) => s.trim())
    .filter(isProtected);

  for (const file of files) {
    const patch = git(["show", "--format=", "--unified=0", sha, "--", file]);
    for (const line of patch.split("\n")) {
      if (
        line.startsWith("+++") ||
        line.startsWith("---") ||
        line.startsWith("@@")
      ) {
        continue;
      }
      if (!line.startsWith("+") && !line.startsWith("-")) continue;
      if (touchesRealCopy(line.slice(1))) {
        violations.push(`${sha.slice(0, 9)} ${file}: ${line.trim()}`);
      }
    }
  }
}

if (violations.length) {
  console.error(
    "check:strings: agent-co-authored commit(s) changed user-facing copy in the i18n catalog.\n" +
      "Only humans may write or edit copy; agents may only add tk() stubs. See docs/agents/i18n.md.\n",
  );
  const shown = violations.slice(0, 25);
  for (const v of shown) console.error("  " + v);
  if (violations.length > shown.length) {
    console.error(`  ...and ${violations.length - shown.length} more.`);
  }
  process.exit(1);
}

console.log(
  "check:strings: no agent-authored copy changes in the i18n catalog.",
);
