#!/bin/bash
# wave3c: the independent projection 62 declaration measurement, then the two load-sensitive files alone.
export PATH="/usr/local/bin:$PATH"
WT=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
S=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts
. "$S/lane/p16-env.sh"
bash "$S/lane/measure-p62.sh"
cd "$WT" || exit 9
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run vitest:alone npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3c-alone.json" tests/bridge-p13b-s7-disclosure.test.ts tests/bridge-runtime-checkpoint-prepared-reuse.test.ts
echo "=== ALL DONE at $(date '+%F %T')"
