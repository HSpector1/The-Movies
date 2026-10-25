#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T'); HEAD $(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse --short HEAD)"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck:ui npx tsc -p ui/tsconfig.json --noEmit
run vitest:core:readers npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/decisions-r7-core.json" $(cat /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/r7-core-files.txt)
run vitest:ui:16c npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/decisions-r7-ui.json" ui/src/lot/StudioLotScreen.test.tsx ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx ui/src/lot/WorldFirstSceneryLoadIn.test.tsx
echo "=== ALL DONE at $(date '+%F %T')"
