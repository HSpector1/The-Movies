#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN typecheck"; npm run -s typecheck; echo "=== END typecheck exit=$? elapsed=$(( $(date +%s) - t0 ))s"
cd tests || exit 9
FILES=$(ls stabilization-l14-l15-money-admission.test.ts stabilization-facilities-cancellation-seam.test.ts stabilization-l19-save07-persistence.test.ts p06a-*.test.ts actions.test.ts p13b-s4-*.test.ts p13b-s5-*.test.ts p13b-s6-*.test.ts p13b-s3-*.test.ts facility-*.test.ts placement-*.test.ts c1-m6-*.test.ts p14d2-*.test.ts d11-employment.test.ts contracts/determinism-floor.contract.test.ts contracts/cross-owner-refusal.contract.test.ts 2>/dev/null | sed 's|^|tests/|')
cd .. || exit 9
echo "files: $(echo "$FILES" | wc -l | tr -d ' ')"
t0=$(date +%s); echo "=== BEGIN vitest focused"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch34-r2.json" $FILES
echo "=== END vitest focused exit=$? elapsed=$(( $(date +%s) - t0 ))s"
