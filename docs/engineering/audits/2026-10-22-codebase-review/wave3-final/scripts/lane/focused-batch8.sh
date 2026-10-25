#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
run check:bridge-contract npm run -s check:bridge-contract
cd tests || exit 9
CORE=$(ls bridge-stabilization-l24-quote-contract.test.ts stabilization-l36-period-summary.test.ts stabilization-l19-save07-persistence.test.ts save.test.ts bridge-p09a-w1-placement-quote.test.ts bridge-p09a-w5-set-commission.test.ts bridge-p10a-r1-contract-quote.test.ts bridge-casting.test.ts bridge-development.test.ts bridge-p15b5-loan-choice.test.ts bridge-p14b8-*.test.ts bridge-p14a1-*.test.ts bridge-p14a-*.test.ts bridge-operations-events.test.ts bridge-contract-consumer-lock.test.ts bridge-p04a2-writer-credit-law.test.ts bridge-p05a1-owner-greenlight.test.ts bridge-p11-finance.test.ts bridge-p09a-w1b-bare-lot-projection.test.ts bridge-p09a-w5-bare-lot-first-film.test.ts bridge-foundation-recovery.test.ts bridge-p05a3-roster-liveness.test.ts 2>/dev/null | sort -u | sed 's|^|tests/|')
cd .. || exit 9
echo "core files: $(echo "$CORE" | wc -l | tr -d ' ')"
run vitest:core:batch8 npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch8-r1.json" $CORE
run vitest:ui:batch8 npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/focused-batch8-ui-r1.json" ui/src/lot/StudioLotScreen.test.tsx ui/src/lot/WorldFirstSceneryLoadIn.test.tsx ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx ui/src/lot/WorldFirstStudioHome.test.tsx ui/src/lot/facilityMutation.test.ts ui/src/lot/scene/LotScene.production-occupancy.test.ts ui/src/lot/StudioLotView.hollywood.test.ts ui/src/lot/authored-stage-a-wiring.test.tsx ui/src/lot/tycoon/placedSoundstageBody.test.ts ui/src/lot/tycoon/world.test.ts ui/src/lot/d1b-assignment-lifecycle.test.tsx ui/src/lot/WorldFirstWorldInspectorDefault.test.tsx
echo "=== ALL DONE at $(date '+%F %T')"
