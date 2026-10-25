#!/bin/bash
export PATH="/usr/local/bin:$PATH"
S=/Users/zacheryspector/studio-scratch/p16-c03-sprint2-20261025
W=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
R=/Users/zacheryspector/The-Movies-headless-program
run() { local label="$1"; shift; echo "=== BEGIN $label"; "$@"; local rc=$?; echo "=== END $label exit=$rc"; }
node --version
uptime
df -k ~
cd "$R" || exit 9
run predecessor npx vitest run --project core -t 'identical in a Save As world:' --reporter=default --reporter=json --outputFile="$S/baseline-main.json" tests/bridge-p13b-s7-disclosure.test.ts
cd "$W" || exit 9
run candidate npx vitest run --project core -t 'identical in a Save As world:' --reporter=default --reporter=json --outputFile="$S/baseline-candidate.json" tests/bridge-p13b-s7-disclosure.test.ts
run profile node --cpu-prof --cpu-prof-dir="$S/profile" node_modules/vitest/vitest.mjs run --project core -t 'identical in a Save As world:' --reporter=default --reporter=json --outputFile="$S/profile-candidate.json" tests/bridge-p13b-s7-disclosure.test.ts
echo '=== ALL DONE'
