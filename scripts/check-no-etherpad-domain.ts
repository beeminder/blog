import "dotenv/config";
import { spawnSync } from "node:child_process";

const domain = process.env.ETHERPAD_DOMAIN;

if (!domain) {
  console.error(
    "pre-commit: ETHERPAD_DOMAIN is unset and not found in .env.\n" +
      "Set it (e.g. in .env) so this hook can verify no staged file " +
      "contains the value.",
  );
  process.exit(1);
}

const result = spawnSync(
  "git",
  [
    "grep",
    "--cached",
    "-n",
    "-F",
    domain,
    "--",
    ":!.env",
    ":!.env.*",
    ":!scripts/check-no-etherpad-domain.ts",
  ],
  { encoding: "utf8" },
);

// git grep exits 0 on match, 1 on no match, >1 on error.
if (result.status === 0 && result.stdout) {
  console.error("pre-commit: ETHERPAD_DOMAIN value found in staged content:");
  console.error(result.stdout.trimEnd());
  console.error(
    "\nRefusing to commit. Remove the literal value before committing.",
  );
  process.exit(1);
}

if (result.status !== null && result.status > 1) {
  console.error("pre-commit: git grep failed:", result.stderr.trim());
  process.exit(result.status);
}
