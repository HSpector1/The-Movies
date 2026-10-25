#!/bin/bash
# One lane job: Batch 5 follow-up (core), Batch 6 reruns (ui), Batch 7 reruns (bridge, with the manifest regenerated).
export PATH="/usr/local/bin:$PATH"
W=/Users/zacheryspector/The-Movies-headless-program
S=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
cd "$W" || exit 9
echo "node $(node --version) at $(date '+%F %T')"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
cd tests || exit 9
CORE=$(ls stabilization-l19-save07-persistence.test.ts p15c2-legacy-lens-shape.test.ts save.test.ts contracts/v14-boundary-guards.contract.test.ts contracts/studio-events*.test.ts p13b-s8-save-v27.test.ts p13b-s5-*save*.test.ts p13b-s6-save*.test.ts p13b-s7-*save*.test.ts p13b-r07-*.test.ts bridge-p13b-r07-setup.test.ts p14c2rm-*.test.ts p14c3-save-v38.test.ts construction-core.test.ts studio-events*.test.ts p15b4-*.test.ts 2>/dev/null | sort -u | sed 's|^|tests/|')
cd .. || exit 9
echo "core files: $(echo "$CORE" | wc -l | tr -d ' ')"
run vitest:core:batch5c npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch5c-r1.json" $CORE
run vitest:ui:batch6-r2 npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/focused-batch6-r2.json" ui/src/lot/LotNextEventRail.test.tsx ui/src/lot/StudioLotScreen.test.tsx ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx ui/src/lot/WorldFirstSceneryLoadIn.test.tsx ui/src/lot/WorldFirstStudioHome.test.tsx ui/src/lot/authored-rgba-export.test.ts ui/src/lot/authored-stage-a-wiring.test.tsx ui/src/lot/authored-stage-a.test.ts ui/src/lot/snapshot/weekTheater.stabilization.test.ts ui/src/lot/facilityMutation.test.ts ui/src/lot/StudioLotView.hollywood.test.ts ui/src/lot/tycoon/placedSoundstageBody.test.ts ui/src/lot/tycoon/placedSupportBodies.test.ts
run typecheck:bridge npm run -s typecheck:bridge
run generate:bridge-contract npm run -s generate:bridge-contract
run check:bridge-contract npm run -s check:bridge-contract
run check:bridge-contract:fixtures npm run -s check:bridge-contract:fixtures
BRIDGE=$(cat "$S/lane/bridge-rerun-files.txt" | tr '\n' ' ')
echo "bridge files: $(wc -l < "$S/lane/bridge-rerun-files.txt" | tr -d ' ')"
run vitest:bridge:batch7-r2 npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch7-r2.json" $BRIDGE
echo "=== ALL DONE at $(date '+%F %T')"
