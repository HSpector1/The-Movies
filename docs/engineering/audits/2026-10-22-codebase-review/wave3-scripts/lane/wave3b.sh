#!/bin/bash
# P16 rebase verification in the sparse worktree: static gates, manifest regeneration, the changed and candidate suites.
export PATH="/usr/local/bin:$PATH"
WT=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
cd "$WT" || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
echo "node $(node --version) at $(date '+%F %T'); worktree HEAD $($G rev-parse --short HEAD); load $(uptime | sed 's/.*load/load/'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
[ -s /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/p16-env.sh ] && . /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/p16-env.sh
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
run generate:bridge-contract npm run -s generate:bridge-contract
run check:bridge-contract npm run -s check:bridge-contract
run check:bridge-contract:fixtures npm run -s check:bridge-contract:fixtures
echo "=== manifest diff after regeneration"; $G status --porcelain -- generated | head -5
CHANGED=$( { $G diff --name-only 8792de52 HEAD -- tests; $G diff --name-only HEAD -- tests; $G ls-files --others --exclude-standard -- tests; } | /usr/bin/grep '\.test\.ts$' | sort -u)
STAB=$(ls tests/stabilization-*.test.ts tests/bridge-stabilization-*.test.ts tests/save.test.ts tests/contracts/v14-boundary-guards.contract.test.ts tests/p13b-s8-save-v27.test.ts tests/bridge-*.test.ts tests/p15a1-market-integration*.test.ts tests/p15a2-*.test.ts tests/p14c3-cohort-transition.test.ts 2>/dev/null)
REPORTED=$(cat /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/p16-report-tests.txt | while read f; do [ -f "$f" ] && echo "$f"; done)
EXTRA=$(ls tests/p14d2-a8-binding-cash.test.ts 2>/dev/null)
FILES=$(printf '%s\n%s\n%s\n%s\n' "$CHANGED" "$STAB" "$REPORTED" "$EXTRA" | /usr/bin/grep -v '^$' | sort -u)
echo "=== FILES ($(echo "$FILES" | wc -l | tr -d ' '))"; echo "$FILES"
run vitest:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3b-core.json" $FILES
run vitest:ui npx vitest run --project ui --reporter=default --reporter=json --outputFile="$OUT/wave3b-ui.json" ui/src/lot/LotNextEventRail.test.tsx ui/src/lot/snapshot/nextEvent.test.ts
echo "=== ALL DONE at $(date '+%F %T'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
