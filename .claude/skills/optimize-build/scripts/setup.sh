#!/usr/bin/env bash
# Setup script for build performance optimization experiments.
# Checks out master, pulls, creates a new branch, and installs dependencies.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

BRANCH_NAME="build-perf-optimize-$(date +%Y%m%d-%H%M%S)"
echo "=== Creating branch: $BRANCH_NAME ==="
git checkout -b "$BRANCH_NAME"

echo "=== Installing dependencies ==="
pnpm install

# Initialize .build-perf.json if it doesn't exist
if [ ! -f .build-perf.json ]; then
  echo '[]' > .build-perf.json
  echo "=== Initialized .build-perf.json ==="
else
  echo "=== .build-perf.json already exists, keeping existing data ==="
fi

echo "=== Setup complete ==="
echo "Branch: $BRANCH_NAME"
echo "Ready for experiments."
