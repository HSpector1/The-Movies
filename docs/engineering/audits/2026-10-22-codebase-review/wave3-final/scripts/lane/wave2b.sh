#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
echo "node $(node --version) at $(date '+%F %T'); HEAD $($G rev-parse --short HEAD); load $(uptime | sed 's/.*load/load/')"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
i=0; for f in ui/src/lot/livingTurn.scheduler.test.tsx ui/src/lot/WorldFirstLotNativeCastingReviewApp.test.tsx ui/src/lot/authored-stage-a-wiring.test.tsx ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx; do i=$((i+1)); run "vitest:ui:alone:$i:$(basename $f)" npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/wave2b-ui-alone-$i.json" "$f"; done
# prepared-reuse timing: current tree, then the wave-1 parent 342e9a90 in a worktree
run vitest:core:prepared-reuse-now npx vitest run --project core --reporter=json --outputFile="$OUT/wave2b-prepared-reuse-now.json" tests/bridge-runtime-checkpoint-prepared-reuse.test.ts
WT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/wt-core-parent-342e9a90
$G worktree add --detach "$WT" 342e9a90 >/dev/null 2>&1 && ln -s /Users/zacheryspector/The-Movies-headless-program/node_modules "$WT/node_modules"
(cd "$WT" && run vitest:core:prepared-reuse-parent npx vitest run --project core --reporter=json --outputFile="$OUT/wave2b-prepared-reuse-parent.json" tests/bridge-runtime-checkpoint-prepared-reuse.test.ts)
$G worktree remove --force "$WT" >/dev/null 2>&1
echo "=== ALL DONE at $(date '+%F %T')"
