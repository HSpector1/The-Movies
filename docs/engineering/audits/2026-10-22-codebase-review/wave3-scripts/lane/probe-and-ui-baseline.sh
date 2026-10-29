#!/bin/bash
export PATH="/usr/local/bin:$PATH"
W=/Users/zacheryspector/The-Movies-headless-program
S=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
cd "$W" || exit 9
echo "node $(node --version) at $(date '+%F %T')"
cp "$S/probe/zz-probe-save07.test.ts" "$W/tests/zz-probe-save07.test.ts"
t0=$(date +%s); echo "=== BEGIN probe"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/probe-save07.json" tests/zz-probe-save07.test.ts 2>&1 | /usr/bin/grep -E "PROBE|✓|×|Test Files|Tests  |Error|error" | cut -c1-400
echo "=== END probe exit=${PIPESTATUS[0]} elapsed=$(( $(date +%s) - t0 ))s"
rm -f "$W/tests/zz-probe-save07.test.ts"
echo "=== BEGIN ui baseline at parent be45f16b (worktree)"
WT="$S/wt-ui-parent"; rm -rf "$WT"
$G -C "$W" worktree add --detach "$WT" be45f16b >/dev/null 2>&1 || { echo "worktree add failed"; exit 0; }
ln -s "$W/node_modules" "$WT/node_modules"
[ -d "$W/ui/node_modules" ] && ln -s "$W/ui/node_modules" "$WT/ui/node_modules"
t0=$(date +%s)
(cd "$WT" && npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/ui-baseline-parent.json" ui/src/lot/LotNextEventRail.test.tsx ui/src/lot/StudioLotScreen.test.tsx ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx ui/src/lot/WorldFirstSceneryLoadIn.test.tsx ui/src/lot/WorldFirstStudioHome.test.tsx ui/src/lot/authored-rgba-export.test.ts ui/src/lot/authored-stage-a-wiring.test.tsx ui/src/lot/authored-stage-a.test.ts 2>&1 | /usr/bin/grep -E "FAIL|✓|×|Test Files|Tests  " | cut -c1-220)
echo "=== END ui baseline elapsed=$(( $(date +%s) - t0 ))s"
rm -f "$WT/node_modules" "$WT/ui/node_modules"; $G -C "$W" worktree remove --force "$WT"; $G -C "$W" worktree prune
echo "=== worktree removed"
