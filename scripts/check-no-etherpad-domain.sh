#!/usr/bin/env bash
set -euo pipefail

# Fail the commit if ETHERPAD_DOMAIN is unset, or if its value appears in any
# file that would be in the resulting tree. This prevents the production
# pad host from being leaked into the public repo (it has happened before —
# see the May 2026 history scrub).

if [ -z "${ETHERPAD_DOMAIN:-}" ] && [ -f .env ]; then
  ETHERPAD_DOMAIN=$(
    grep -E '^[[:space:]]*ETHERPAD_DOMAIN[[:space:]]*=' .env \
      | head -1 \
      | sed -E 's/^[[:space:]]*ETHERPAD_DOMAIN[[:space:]]*=[[:space:]]*//' \
      | sed -E 's/^"(.*)"$/\1/' \
      | sed -E "s/^'(.*)'\$/\\1/"
  )
fi

if [ -z "${ETHERPAD_DOMAIN:-}" ]; then
  echo "pre-commit: ETHERPAD_DOMAIN is unset and not found in .env." >&2
  echo "Set it (e.g. in .env) so this hook can verify no staged file contains the value." >&2
  exit 1
fi

# Search the staged index — what the commit would actually contain.
# Exclude .env files (gitignored but defensive) and this script itself
# (which intentionally references the variable name, not its value).
matches=$(git grep --cached -n -F "$ETHERPAD_DOMAIN" -- \
  ':!.env' ':!.env.*' \
  ':!scripts/check-no-etherpad-domain.sh' 2>/dev/null || true)

if [ -n "$matches" ]; then
  echo "pre-commit: ETHERPAD_DOMAIN value found in staged content:" >&2
  echo "$matches" >&2
  echo "" >&2
  echo "Refusing to commit. Remove the literal value before committing." >&2
  exit 1
fi
