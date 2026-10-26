#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-sprint4-20261025
run() { local label="$1"; shift; echo "=== BEGIN $label"; uptime; "$@"; local rc=$?; echo "=== END $label exit=$rc"; }
run null-corrected npx vitest run --project core -t 'full current reader refuses independent cent drift' --reporter=default --reporter=json --outputFile="$S/null-corrected.json" tests/p16-absorption-clean-target.test.ts
echo '=== ALL DONE'
