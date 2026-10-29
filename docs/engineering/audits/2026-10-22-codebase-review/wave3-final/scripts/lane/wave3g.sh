#!/bin/bash
# wave3g: after the agent's round 4. Static gates; the files round 3 changed plus the 14 files that were new failures in
# wave3b plus the C-01 witness (green, timed); then bridge-p13b-s7-disclosure ALONE for the item-5 timing against the parent.
export PATH="/usr/local/bin:$PATH"
WT=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
cd "$WT" || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
echo "node $(node --version) at $(date '+%F %T'); worktree HEAD $($G rev-parse --short HEAD); load $(uptime | sed 's/.*load/load/'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
. /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/p16-env.sh
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
echo "=== dirty: $($G status --porcelain | wc -l | tr -d ' ') paths"; $G status --porcelain | head -5
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
run check:bridge-contract npm run -s check:bridge-contract
run check:bridge-contract:fixtures npm run -s check:bridge-contract:fixtures
CHANGED=$( { $G diff --name-only c0a6c64e HEAD -- tests; $G diff --name-only HEAD -- tests; } | /usr/bin/grep '\.test\.ts$' | sort -u)
NEW14="tests/p15b2-corporate-condition-save.test.ts tests/p15b4-studio-closure-save.test.ts tests/p15b-legacy-v3.test.ts tests/p15b-legacy-terminal-regression.test.ts tests/p14c2s-scientist-retirement.test.ts tests/p14c3-cohort-transition.test.ts tests/p14c3-dual-extensions.test.ts tests/p15a2-power-ranking-archive.test.ts tests/bridge-stabilization-l24-quote-contract.test.ts tests/stabilization-l19-save07-persistence.test.ts tests/p14c3-profession-history.test.ts tests/p06a-corporate-condition.test.ts tests/p13b-s3-validation.test.ts tests/bridge-contract-generator.test.ts tests/bridge-p13b-s7-disclosure.test.ts tests/bridge-runtime-checkpoint-prepared-reuse.test.ts tests/p14p4p5-opportunities.test.ts tests/p14p4p5-screenplay-status.test.ts tests/p15a1-market-integration.test.ts tests/p16-healthy-drafting171-funded-baseline.test.ts tests/p16-r2-acquisition.test.ts tests/p16-r2-authority.test.ts tests/p16-r2-estate.test.ts tests/p16-r2-validator.test.ts tests/p16b-condition-readers.test.ts tests/p16c-acquisition.test.ts tests/p16c-estate.test.ts tests/p16-rebase-c01-absorbed-claims.test.ts tests/bridge-p14b5-relationships.test.ts tests/p16b-live-condition-readers.test.ts"
FILES=$(printf '%s\n' $CHANGED $NEW14 | /usr/bin/grep -v '^$' | sort -u | while read f; do [ -f "$f" ] && echo "$f"; done)
echo "=== FILES ($(echo "$FILES" | wc -l | tr -d ' '))"; echo "$FILES"
run vitest:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3g-core.json" $FILES
run vitest:s7-alone npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3g-l24-alone.json" tests/bridge-stabilization-l24-quote-contract.test.ts
echo "=== ALL DONE at $(date '+%F %T'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
