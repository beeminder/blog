#!/usr/bin/env bash
set -euo pipefail

# Fail the commit if ETHERPAD_DOMAIN is unset, or if its value appears in any
# file that would be in the resulting tree. Keeps the production pad host
# out of the public repo.

if [ -z "${ETHERPAD_DOMAIN:-}" ] && [ -f .env ]; then
  raw=$(grep -E '^[[:space:]]*ETHERPAD_DOMAIN[[:space:]]*=' .env | head -1 || true)
  if [ -n "$raw" ]; then
    raw="${raw#*=}"                              # drop key + =
    raw="${raw#"${raw%%[![:space:]]*}"}"         # lstrip
    if [[ "$raw" == \"* ]]; then
      raw="${raw#\"}"; raw="${raw%%\"*}"         # content between double quotes
    elif [[ "$raw" == \'* ]]; then
      raw="${raw#\'}"; raw="${raw%%\'*}"         # content between single quotes
    else
      raw="${raw%%#*}"                           # strip inline comment
      raw="${raw%"${raw##*[![:space:]]}"}"       # rstrip
    fi
    ETHERPAD_DOMAIN="$raw"
  fi
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
