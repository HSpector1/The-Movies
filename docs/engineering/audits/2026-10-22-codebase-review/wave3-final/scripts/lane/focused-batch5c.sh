#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN typecheck"; npm run -s typecheck; echo "=== END typecheck exit=$? elapsed=$(( $(date +%s) - t0 ))s"
cd tests || exit 9
FILES=$(ls stabilization-l19-save07-persistence.test.ts p15c2-legacy-lens-shape.test.ts save.test.ts contracts/v14-boundary-guards.contract.test.ts contracts/studio-events*.test.ts p13b-s8-save-v27.test.ts p13b-s5-*save*.test.ts p13b-s6-save*.test.ts p13b-s7-*save*.test.ts p13b-r07-*.test.ts bridge-p13b-r07-setup.test.ts p14c2rm-*.test.ts p14c3-save-v38.test.ts construction-core.test.ts studio-events*.test.ts p15b4-*.test.ts 2>/dev/null | sort -u | sed 's|^|tests/|')
cd .. || exit 9
echo "files: $(echo "$FILES" | wc -l | tr -d ' ')"
t0=$(date +%s); echo "=== BEGIN vitest focused"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch5c-r1.json" $FILES
echo "=== END vitest focused exit=$? elapsed=$(( $(date +%s) - t0 ))s"
