#!/bin/bash
export PATH="/usr/local/bin:$PATH"
WT=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
cd "$WT" || exit 9
. /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/p16-env.sh
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
for f in p16-healthy-drafting171-funded-baseline p16-estate-d-ceremony p16-rebase-estate-licence-survival bridge-p14r2r3-prior55; do
 run "solo:$f" npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3n-$f.json" "tests/$f.test.ts"
done
echo "=== ALL DONE at $(date '+%F %T')"
