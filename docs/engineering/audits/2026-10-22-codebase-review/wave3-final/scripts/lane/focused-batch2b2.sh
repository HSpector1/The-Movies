#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN typecheck"; npm run -s typecheck; echo "=== END typecheck exit=$? elapsed=$(( $(date +%s) - t0 ))s"
t0=$(date +%s); echo "=== BEGIN vitest focused"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch2b-r2.json" tests/stabilization-l04-rival-seat-gate.test.ts tests/stabilization-l02-casting-save-path.test.ts tests/stabilization-l02-casting-profession.test.ts tests/casting-sessions-save-v10.test.ts
echo "=== END vitest focused exit=$? elapsed=$(( $(date +%s) - t0 ))s"
