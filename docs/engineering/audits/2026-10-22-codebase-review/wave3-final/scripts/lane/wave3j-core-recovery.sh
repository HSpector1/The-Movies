#!/bin/bash
# wave3j (wave3f rerun on the round-6 head): the audit's C-04 gate on the rebase worktree at unchanged budgets (mirrors final-gates.sh on main):
# static gates, hygiene audits, build, test:bridge, test:ui, full test:core. Sparse-checkout ENOENTs under docs/evidence are
# a classification, not a failure of the tree.
export PATH="/usr/local/bin:$PATH"
WT=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
cd "$WT" || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
echo "node $(node --version) at $(date '+%F %T'); worktree HEAD $($G rev-parse --short HEAD); dirty $($G status --porcelain | wc -l | tr -d ' '); load $(uptime | sed 's/.*load/load/'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
. /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/p16-env.sh
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run test:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/p16-gate2-core-recovery.json"
echo "=== ALL DONE at $(date '+%F %T')"
