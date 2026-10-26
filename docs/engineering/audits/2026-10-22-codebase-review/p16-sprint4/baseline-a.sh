#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-sprint4-20261025
run() { local label="$1"; shift; echo "=== BEGIN $label"; uptime; "$@"; local rc=$?; echo "=== END $label exit=$rc"; }
run s7-baseline npx vitest run --project core -t 'committed adoptions' --reporter=default --reporter=json --outputFile="$S/s7-baseline.json" tests/bridge-p13b-s7-disclosure.test.ts
run joins-baseline npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/joins-baseline.json" tests/p16-estate-d-join-negative.test.ts
run replay-baseline npx vitest run --project core -t 'the ordinary route: ticks carry the estate' --reporter=default --reporter=json --outputFile="$S/replay-baseline.json" tests/p16c-estate.test.ts
run s7-profile node --cpu-prof --cpu-prof-dir="$S/profile" node_modules/vitest/vitest.mjs run --project core -t 'committed adoptions' --reporter=default --reporter=json --outputFile="$S/s7-profile.json" tests/bridge-p13b-s7-disclosure.test.ts
echo '=== ALL DONE'
