#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-c03-sprint2-20261025
run() { local label="$1"; shift; echo "=== BEGIN $label"; uptime; "$@"; local rc=$?; echo "=== END $label exit=$rc"; }
run save-as-after npx vitest run --project core -t 'identical in a Save As world:' --reporter=default --reporter=json --outputFile="$S/after-save-as.json" tests/bridge-p13b-s7-disclosure.test.ts
run pending-witness npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/pending-first.json" tests/p16-c03-licensed-pending-player.test.ts
run estate-and-valuation npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/focused-valuation.json" tests/p16c-estate.test.ts tests/p16a-valuation.test.ts tests/p16-estate-d-join-negative.test.ts
echo '=== ALL DONE'
