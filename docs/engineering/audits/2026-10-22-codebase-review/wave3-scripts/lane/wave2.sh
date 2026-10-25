#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
echo "node $(node --version) at $(date '+%F %T'); HEAD $($G rev-parse --short HEAD)"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run vitest:core:prepared-reuse-alone npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave2-prepared-reuse-alone.json" tests/bridge-runtime-checkpoint-prepared-reuse.test.ts
run typecheck:ui npx tsc -p ui/tsconfig.json --noEmit
CHANGED=$( { $G diff --name-only HEAD -- ui/src; $G ls-files --others --exclude-standard -- ui/src; } | /usr/bin/grep -E '\.test\.tsx?$' | sort -u)
RELATED=$(ls ui/src/lot/StudioLotScreen.test.tsx ui/src/lot/LotNextEventRail.test.tsx ui/src/lot/nextEvent*.test.ts ui/src/lot/auditionPlanning*.test.ts ui/src/lot/scene/LotScene*.test.ts ui/src/lot/authored-stage-a-wiring.test.tsx ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx ui/src/lot/WorldFirstSceneryLoadIn.test.tsx ui/src/engine/p15b-browser-wave5.test.ts ui/src/engine/p15b-lot-closure-gate.test.ts ui/src/saves.test.tsx ui/src/lot/StudioLotView.hollywood.test.ts ui/src/lot/snapshot/nextEvent.test.ts ui/src/lot/snapshot/productionCompany.test.ts ui/src/lot/studio-lot-snapshot.test.ts ui/src/lot/snapshot/auditionPlanning.test.ts ui/src/lot/StudioLotScreen.audition-planning.test.tsx ui/src/lot/WorldFirstLotRetainedAuditionPlanningAppAuthority.test.tsx ui/src/lot/WorldFirstWorldInspectorDefault.test.tsx ui/src/lot/WorldFirstAnnexConstruction.test.tsx ui/src/lot/WorldFirstBuildModeV1.test.tsx ui/src/lot/StudioLotScreen.script-review-receipt.test.tsx ui/src/lot/WorldFirstLotNativeCastingReviewApp.test.tsx ui/src/lot/WorldFirstLotNativeCastingReviewAppAuthority.test.tsx ui/src/lot/WorldFirstLotNativeScriptReviewAppAuthority.test.tsx ui/src/lot/WorldFirstStage7ProductionDetailHandoffApp.test.tsx ui/src/lot/livingTurn.scheduler.test.tsx ui/src/test/contracts/sim-stop-ladder.contract.test.ts ui/src/engine/writer-credit-not-assignment.test.ts ui/src/shell/dialog-replacement.test.tsx ui/src/presentation/wiring.test.tsx ui/src/p1364-late-founding-route.test.tsx ui/src/App.test.tsx ui/src/lot/scene/LotScene.production-occupancy.test.ts 2>/dev/null)
FILES=$(printf '%s\n%s\n' "$CHANGED" "$RELATED" | /usr/bin/grep -v '^$' | sort -u)
echo "=== FILES ($(echo "$FILES" | wc -l | tr -d ' '))"; echo "$FILES"
run vitest:ui npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/wave2-ui.json" $FILES
SPEC=$(ls ui/e2e/lot-key-capture-v1.spec.ts 2>/dev/null)
[ -n "$SPEC" ] && run playwright:17a npx playwright test -c ui/playwright.config.ts "$SPEC" --reporter=line
# Red run: the changed and new UI test files at the parent 342e9a90, in a throwaway worktree (expect failures).
WT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/wt-ui-parent-342e9a90
$G worktree add --detach "$WT" 342e9a90 >/dev/null 2>&1 && ln -s /Users/zacheryspector/The-Movies-headless-program/node_modules "$WT/node_modules" && ln -s /Users/zacheryspector/The-Movies-headless-program/ui/node_modules "$WT/ui/node_modules" 2>/dev/null
RED=""
for f in $CHANGED; do mkdir -p "$WT/$(dirname "$f")"; cp "$f" "$WT/$f"; RED="$RED $f"; done
if [ -n "$RED" ]; then (cd "$WT" && run vitest:ui:red-at-parent npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/wave2-ui-red-parent.json" $RED); fi
$G worktree remove --force "$WT" >/dev/null 2>&1
echo "=== ALL DONE at $(date '+%F %T')"
