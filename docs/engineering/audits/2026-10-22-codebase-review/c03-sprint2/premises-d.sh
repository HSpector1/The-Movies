#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-c03-sprint2-20261025
run() { local label="$1"; shift; echo "=== BEGIN $label"; uptime; "$@"; local rc=$?; echo "=== END $label exit=$rc"; }
run authority-complete npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/authority-complete.json" tests/p16-r2-authority.test.ts
run reverse-investigation npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/reverse-first.json" tests/p16-c03-reverse-ownership-investigation.test.ts
echo '=== ALL DONE'
