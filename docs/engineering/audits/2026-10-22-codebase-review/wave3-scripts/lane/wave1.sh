#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
echo "node $(node --version) at $(date '+%F %T'); HEAD $($G rev-parse --short HEAD)"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
run check:bridge-contract npm run -s check:bridge-contract
CHANGED=$( { $G diff --name-only HEAD -- tests; $G ls-files --others --exclude-standard -- tests; } | /usr/bin/grep '\.test\.ts$' | sort -u)
RELATED=$(ls tests/p13b-s3-validation.test.ts tests/p13b-s6-*.test.ts tests/stabilization-facilities-cancellation-seam.test.ts tests/stabilization-l32-adoption-restart.test.ts tests/p15c1-*.test.ts tests/p15c2-*.test.ts tests/p15b4-*.test.ts tests/bridge-p13b-s2-labs.test.ts tests/bridge-p13-laboratory.test.ts tests/bridge-runtime-checkpoint*.test.ts tests/bridge-p13b-s3-plans.test.ts tests/bridge-p13b-s6-cancellation.test.ts tests/p13b-s5-*.test.ts tests/save.test.ts tests/p15b-legacy-*.test.ts tests/p15c2-legacy-*.test.ts tests/p15b5-notices.test.ts tests/bridge-p15b5-notices.test.ts tests/p14d1-rival-shelving.test.ts tests/bridge-p14b4-runtime47-compatibility.test.ts tests/bridge-p13b-s5-adoption.test.ts tests/placement-save-v12.test.ts tests/p13b-s3-*.test.ts tests/p13b-s4-*.test.ts tests/facility-move-demolish.test.ts tests/facility-effects.test.ts tests/p11-finance-recurring.test.ts tests/c1-m6-*.test.ts tests/p13a-placement-history-validation.test.ts tests/p13a-physical-installation.test.ts tests/legacy-parcel-ground.test.ts tests/p15b4-pending-player-adoption.test.ts tests/property-state-v13.test.ts tests/construction-save-v11.test.ts tests/tuning.test.ts tests/bridge-p09a-r2-facility-history-rows.test.ts tests/bridge-p11-capital-contributors.test.ts 2>/dev/null)
FILES=$(printf '%s\n%s\n' "$CHANGED" "$RELATED" | /usr/bin/grep -v '^$' | sort -u)
echo "=== FILES ($(echo "$FILES" | wc -l | tr -d ' '))"; echo "$FILES"
run vitest:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave1-core.json" $FILES
echo "=== ALL DONE at $(date '+%F %T')"
