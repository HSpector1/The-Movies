#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-sprint4-20261025
run() { local label="$1"; shift; echo "=== BEGIN $label"; uptime; "$@"; local rc=$?; echo "=== END $label exit=$rc"; }
run final-bridge-contract npm run check:bridge-contract
run final-bridge-fixtures npm run check:bridge-contract:fixtures
run s7-complete npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/s7-complete.json" tests/bridge-p13b-s7-disclosure.test.ts
run p16-integration npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/p16-integration.json" tests/p16*.test.ts tests/bridge-p16*.test.ts
run historical-forecast npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/historical-forecast.json" tests/p13b-s7-forecast.test.ts
run final-root-types npx tsc --noEmit
echo '=== ALL DONE' 
