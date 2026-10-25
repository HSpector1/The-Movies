#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN typecheck"; npm run -s typecheck; echo "=== END typecheck exit=$? elapsed=$(( $(date +%s) - t0 ))s"
cd tests || exit 9
FILES=$(ls stabilization-l0*.test.ts casting-*.test.ts p14c3-profession-history.test.ts p14c3-transitions.test.ts p14c3-profession-episodes.test.ts p14c3-dual-extensions.test.ts p14c2rm-writer-continuation.test.ts p14c2a-*.test.ts 1368-*.test.ts p14b4-production-admission.test.ts p14p3-directing-promises.test.ts p04a2-writer-credit-law.test.ts save*.test.ts *save-v*.test.ts p13b-s8-*.test.ts p15*.test.ts contracts/*.test.ts p14a1-*.test.ts migration*.test.ts 2>/dev/null | sort -u | sed 's|^|tests/|')
cd .. || exit 9
echo "files: $(echo "$FILES" | wc -l | tr -d ' ')"
t0=$(date +%s); echo "=== BEGIN vitest focused"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch2b-r1.json" $FILES
echo "=== END vitest focused exit=$? elapsed=$(( $(date +%s) - t0 ))s"
