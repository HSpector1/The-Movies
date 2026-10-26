#!/bin/bash
set -u
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
[ "$(df -Pk . | awk 'NR==2 {print $4}')" -ge 3670016 ] || exit 9
echo '=== BEGIN retained-writing-predecessor-red'
date -Iseconds
node node_modules/vitest/vitest.mjs run --project core tests/p16-retained-drafting-continuation.test.ts -t 'default actual writer retention carries one namespaced live buyer draft through actual due173 with creator paid history save and replay' --reporter=default --reporter=json --outputFile=/Users/zacheryspector/studio-scratch/p16-sprint7-verification-20261026/baseline-red.json
rc=$?
echo "=== END retained-writing-predecessor-red exit=$rc"
date -Iseconds
exit "$rc"
