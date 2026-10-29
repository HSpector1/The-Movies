#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN vitest:manifest-readers"; npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/decisions-r6-core.json" tests/p1364-late-founding.test.ts tests/p14d2-save46-migration.test.ts; echo "=== END vitest:manifest-readers exit=$? elapsed=$(( $(date +%s) - t0 ))s"
