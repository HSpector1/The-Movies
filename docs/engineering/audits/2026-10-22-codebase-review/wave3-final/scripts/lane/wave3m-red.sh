#!/bin/bash
# Round 8 regression witnesses on reviewed Round 7 source, unchanged test budgets.
export PATH="/usr/local/bin:$PATH"
WT=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
S=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
cd "$WT" || exit 9
echo "node $(node --version) at $(date '+%F %T'); worktree HEAD $($G rev-parse --short HEAD); dirty $($G status --porcelain | wc -l | tr -d ' '); load $(uptime | sed 's/.*load/load/'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
. "$S/lane/p16-env.sh"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
# Diagnostic controls run on the reviewed Round 7 source before Round 8 repairs.
run round8:red npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3m-red.json" tests/stabilization-p16-money-refusal.test.ts tests/stabilization-p16-stopped-participants.test.ts tests/p16c-acquisition.test.ts
echo "=== ALL DONE at $(date '+%F %T')"
