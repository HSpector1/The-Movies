#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-sprint3-predecessor-481fd444 || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-sprint3-20261025
run() { local label="$1"; shift; echo "=== BEGIN $label"; uptime; "$@"; local rc=$?; echo "=== END $label exit=$rc"; }
run p14-predecessor npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/p14-predecessor.json" tests/p14b4-rival-seating-preference.test.ts
echo '=== ALL DONE'
