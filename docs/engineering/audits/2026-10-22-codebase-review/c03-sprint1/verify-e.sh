#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt || exit 9
. /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/p16-env.sh
S=/Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025
run() { local name="$1"; shift; echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc"; }
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
run contract npm run -s check:bridge-contract
run contract:fixtures npm run -s check:bridge-contract:fixtures
for file in p16c-estate p16-r2-estate p16-r2-authority; do
  run "$file" npx vitest run --project core --reporter=default --reporter=json --outputFile="$S/solo-$file.json" "tests/$file.test.ts"
done
echo '=== ALL DONE'
