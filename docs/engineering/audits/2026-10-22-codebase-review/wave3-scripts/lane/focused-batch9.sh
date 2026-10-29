#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
run vitest:core:batch9 npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch9-r1.json" tests/bridge-schema.test.ts tests/bridge-stabilization-l24-quote-contract.test.ts tests/bridge-operations-events.test.ts tests/world-first-scenery-load-in-provenance.test.ts tests/bridge-runtime-checkpoint-prepared-reuse.test.ts tests/bridge-p09a-w1-placement-quote.test.ts tests/bridge-casting.test.ts
run vitest:ui:batch9 npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/focused-batch9-ui-r1.json" ui/src/lot/StudioLotScreen.test.tsx ui/src/lot/facilityMutation.test.ts
echo "=== ALL DONE at $(date '+%F %T')"
