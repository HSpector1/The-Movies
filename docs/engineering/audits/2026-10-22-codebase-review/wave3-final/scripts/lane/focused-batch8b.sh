#!/bin/bash
export PATH="/usr/local/bin:$PATH"
W=/Users/zacheryspector/The-Movies-headless-program
S=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
cd "$W" || exit 9
echo "node $(node --version) at $(date '+%F %T')"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
run vitest:core:batch8b npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch8b-r1.json" tests/bridge-stabilization-l24-quote-contract.test.ts tests/save.test.ts
run vitest:ui:batch8b npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/focused-batch8b-ui-r1.json" ui/src/lot/scene/LotScene.production-occupancy.test.ts ui/src/lot/StudioLotScreen.test.tsx
echo "=== BEGIN red run of the L-38 case at the parent d624fb30 (worktree)"
WT="$S/wt-l38-parent"; rm -rf "$WT"
$G -C "$W" worktree add --detach "$WT" d624fb30 >/dev/null 2>&1 || { echo "worktree add failed"; exit 0; }
ln -s "$W/node_modules" "$WT/node_modules"
cp "$W/ui/src/lot/StudioLotScreen.test.tsx" "$WT/ui/src/lot/StudioLotScreen.test.tsx"
(cd "$WT" && npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/red-run-l38-parent.json" ui/src/lot/StudioLotScreen.test.tsx 2>&1 | /usr/bin/grep -E "L-38|Test Files|Tests  " | cut -c1-200)
echo "=== END red run"
rm -f "$WT/node_modules"; $G -C "$W" worktree remove --force "$WT"; $G -C "$W" worktree prune; echo "=== worktree removed"
