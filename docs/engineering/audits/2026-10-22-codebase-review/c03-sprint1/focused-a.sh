#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/p16-env.sh
node --version
df -k ~
npx vitest run --project core --reporter=default --reporter=json --outputFile=/Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/focused-a.json tests/p16-c03-estate-handoff.test.ts tests/p16c-estate.test.ts tests/p16-r2-estate.test.ts tests/p16-r2-authority.test.ts
rc=$?; echo "=== focused-a child exit=$rc"; exit "$rc"
