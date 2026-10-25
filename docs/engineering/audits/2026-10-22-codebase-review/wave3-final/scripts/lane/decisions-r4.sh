#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN vitest:expiry"; npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/decisions-r4-core.json" tests/bridge-p13-scientist-expiry.test.ts; echo "=== END vitest:expiry exit=$? elapsed=$(( $(date +%s) - t0 ))s"
