#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN typecheck"; npm run -s typecheck; echo "=== END typecheck exit=$? elapsed=$(( $(date +%s) - t0 ))s"
t0=$(date +%s); echo "=== BEGIN vitest focused"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch5-r2.json" tests/stabilization-l19-save07-persistence.test.ts tests/p15c2-legacy-lens-shape.test.ts tests/save.test.ts tests/contracts/v14-boundary-guards.contract.test.ts tests/p13b-s8-save-v27.test.ts tests/p15c2-legacy-root-shape.test.ts tests/p15b4-studio-closure.test.ts
echo "=== END vitest focused exit=$? elapsed=$(( $(date +%s) - t0 ))s"
