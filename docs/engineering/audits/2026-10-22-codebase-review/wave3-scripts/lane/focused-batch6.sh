#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN typecheck"; npm run -s typecheck; echo "=== END typecheck exit=$? elapsed=$(( $(date +%s) - t0 ))s"
FILES=$(ls ui/src/lot/tycoon/*.test.ts ui/src/lot/snapshot/*.test.ts ui/src/lot/*.test.ts ui/src/lot/*.test.tsx ui/src/lot/scene/*.test.ts ui/src/App*.test.tsx 2>/dev/null | sort -u)
echo "files: $(echo "$FILES" | wc -l | tr -d ' ')"
t0=$(date +%s); echo "=== BEGIN vitest ui focused"
npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/focused-batch6-r1.json" $FILES
echo "=== END vitest ui focused exit=$? elapsed=$(( $(date +%s) - t0 ))s"
