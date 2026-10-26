#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-sprint3-20261025
run() { local label="$1"; shift; echo "=== BEGIN $label"; uptime; "$@"; local rc=$?; echo "=== END $label exit=$rc"; }
run approved-ask-red npx vitest run --project core -t 'the rival.s willingness is a disclosed policy' --reporter=default --reporter=json --outputFile="$S/ask-red.json" tests/p16c-acquisition.test.ts
echo '=== ALL DONE'
