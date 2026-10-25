#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN typecheck"; npm run -s typecheck; echo "=== END typecheck exit=$? elapsed=$(( $(date +%s) - t0 ))s"
cd tests || exit 9
FILES=$(ls stabilization-*.test.ts p13b-s3-*.test.ts p13b-s4-*.test.ts p13b-s6-*.test.ts p13b-s8-*.test.ts placement-*.test.ts facility-*.test.ts *production-queue*.test.ts talent-market*.test.ts p14c2b-*.test.ts actions.test.ts bridge-p13b-s6*.test.ts p15b4-*.test.ts 2>/dev/null | sort -u | sed 's|^|tests/|')
cd .. || exit 9
echo "files: $(echo "$FILES" | wc -l | tr -d ' ')"
t0=$(date +%s); echo "=== BEGIN vitest focused"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch34c-r1.json" $FILES
echo "=== END vitest focused exit=$? elapsed=$(( $(date +%s) - t0 ))s"
