#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
run vitest:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/decisions-r1-core.json" tests/p15b4-studio-closure.test.ts tests/p15c2-campaign-legacy-integration.test.ts tests/world-first-scenery-load-in-provenance.test.ts
run vitest:ui npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/decisions-r1-ui.json" ui/src/lot/authored-rgba-export.test.ts ui/src/lot/authored-stage-a.test.ts ui/src/lot/authored-stage-a-wiring.test.tsx ui/src/screens/Recap.test.tsx
echo "=== ALL DONE at $(date '+%F %T')"
