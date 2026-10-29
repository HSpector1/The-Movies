#!/bin/bash
# wave3f: the audit's C-04 gate on the rebase worktree at unchanged budgets (mirrors final-gates.sh on main):
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
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
run check:bridge-contract npm run -s check:bridge-contract
run check:bridge-contract:fixtures npm run -s check:bridge-contract:fixtures
run audit:repo-hygiene npm run -s audit:repo-hygiene
run audit:3d-assets npm run -s audit:3d-assets
run lane-guard-self-test bash .claude/hooks/lane-guard.test.sh
run build npm run -s build
run test:bridge npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/p16-gate-bridge.json" tests/bridge*.test.ts
run test:ui npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/p16-gate-ui.json"
run test:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/p16-gate-core.json"
echo "=== ALL DONE at $(date '+%F %T'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
