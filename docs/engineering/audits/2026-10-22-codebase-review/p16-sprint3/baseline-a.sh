#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-sprint3-20261025
run() { local label="$1"; shift; echo "=== BEGIN $label"; uptime; "$@"; local rc=$?; echo "=== END $label exit=$rc"; }
run post-opening-baseline npx vitest run --project core -t 'a lot encumbered after the handoff' --reporter=default --reporter=json --outputFile="$S/baseline-estate.json" tests/p16-r2-estate.test.ts
run adoptions-baseline npx vitest run --project core -t 'committed adoptions' --reporter=default --reporter=json --outputFile="$S/baseline-adoptions.json" tests/bridge-p13b-s7-disclosure.test.ts
run post-opening-profile node --cpu-prof --cpu-prof-dir="$S/profile" node_modules/vitest/vitest.mjs run --project core -t 'a lot encumbered after the handoff' --reporter=default --reporter=json --outputFile="$S/profile-estate.json" tests/p16-r2-estate.test.ts
echo '=== ALL DONE'
