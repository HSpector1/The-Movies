#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-sprint3-20261025
run() { local label="$1"; shift; echo "=== BEGIN $label"; uptime; "$@"; local rc=$?; echo "=== END $label exit=$rc"; }
run acquisition npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/acquisition-after.json" tests/p16c-acquisition.test.ts tests/p16-r2-acquisition.test.ts tests/p16-absorption-clean-target.test.ts
run forecast-parity npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/forecast-parity.json" tests/p14b4-rival-seating-preference.test.ts tests/p14d2-binding-cash.test.ts tests/forecast.test.ts tests/forecast-independence.test.ts tests/d17b-marketing-menu.test.ts
run estate-after npx vitest run --project core -t 'a lot encumbered after the handoff' --reporter=default --reporter=json --outputFile="$S/estate-after.json" tests/p16-r2-estate.test.ts
run adoptions-after npx vitest run --project core -t 'committed adoptions' --reporter=default --reporter=json --outputFile="$S/adoptions-after.json" tests/bridge-p13b-s7-disclosure.test.ts
echo '=== ALL DONE'
