#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025
node --version
npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/final-p16c-estate.json" tests/p16c-estate.test.ts
rc=$?; echo "=== final-p16c-estate child exit=$rc"
df -k ~
npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/broader-f.json" tests/p16*.test.ts tests/bridge-p16*.test.ts
rc=$?; echo "=== broader-f child exit=$rc"; exit "$rc"
