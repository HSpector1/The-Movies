#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN typecheck:bridge"; npm run -s typecheck:bridge; echo "=== END typecheck:bridge exit=$? elapsed=$(( $(date +%s) - t0 ))s"
t0=$(date +%s); echo "=== BEGIN check:bridge-contract"; npm run -s check:bridge-contract; echo "=== END check:bridge-contract exit=$? elapsed=$(( $(date +%s) - t0 ))s"
t0=$(date +%s); echo "=== BEGIN check:bridge-contract:fixtures"; npm run -s check:bridge-contract:fixtures; echo "=== END check:bridge-contract:fixtures exit=$? elapsed=$(( $(date +%s) - t0 ))s"
t0=$(date +%s); echo "=== BEGIN vitest bridge"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch7-r1.json" tests/bridge*.test.ts
echo "=== END vitest bridge exit=$? elapsed=$(( $(date +%s) - t0 ))s"
