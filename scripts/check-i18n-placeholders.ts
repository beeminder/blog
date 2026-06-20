// Fails while any unwritten-copy placeholder remains in the source tree.
//
// New user-facing strings are stubbed with `tk("description")` (see
// src/i18n/tk.ts), which renders the grep-able marker `[TK: ...]`. This gate
// blocks merge until a human replaces every stub with real copy, so
// AI-scaffolded placeholders can never ship to users.
import { spawnSync } from "node:child_process";

// The helper itself legitimately contains the marker and the `tk(` token.
const EXCLUDE_HELPER = ":!src/i18n/tk.ts";

type Probe = { label: string; args: string[] };

const probes: Probe[] = [
  // The rendered placeholder marker, anywhere under src/.
  {
    label: "unwritten-copy marker [TK: ...]",
    args: ["-n", "-F", "[TK:", "--", "src", EXCLUDE_HELPER],
  },
  // The stub helper call inside the i18n catalog.
  {
    label: "tk(...) placeholder call in src/i18n",
    args: ["-n", "-F", "tk(", "--", "src/i18n", EXCLUDE_HELPER],
  },
];

let found = false;

for (const probe of probes) {
  const result = spawnSync("git", ["grep", ...probe.args], {
    encoding: "utf8",
  });

  // git grep exits 0 on match, 1 on no match, >1 on error.
  if (result.status === 0 && result.stdout) {
    found = true;
    console.error(`check:i18n: ${probe.label} found in:`);
    console.error(result.stdout.trimEnd());
    console.error("");
  } else if (result.status !== null && result.status > 1) {
    console.error("check:i18n: git grep failed");
    console.error(result.stderr);
    process.exit(2);
  }
}

if (found) {
  console.error(
    "Unwritten user-facing copy must be filled in by a human before merge.\n" +
      "Replace each tk(...) stub in src/i18n with the real string.",
  );
  process.exit(1);
}
