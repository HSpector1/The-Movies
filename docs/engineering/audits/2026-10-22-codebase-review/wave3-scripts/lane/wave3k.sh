#!/bin/bash
# wave3k: round 6 measured on the primary worktree at 5a700af3. Static gates; the three files the agent asked to run alone
# (p15c2 for its heavier predecessor-era control against the unchanged 120 s budget, p13b-s7 for the predicted ref path,
# facility-move-demolish for the unknown field); then the other round-6 files, the helper importers and the old-era
# admission suites that reach the frozen-era period roster in one focused run.
export PATH="/usr/local/bin:$PATH"
WT=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
S=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
cd "$WT" || exit 9
echo "node $(node --version) at $(date '+%F %T'); worktree HEAD $($G rev-parse --short HEAD); dirty $($G status --porcelain | wc -l | tr -d ' '); load $(uptime | sed 's/.*load/load/'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
. "$S/lane/p16-env.sh"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
run check:bridge-contract npm run -s check:bridge-contract
run check:bridge-contract:fixtures npm run -s check:bridge-contract:fixtures
for f in p15c2-campaign-legacy-integration p13b-s7-announcements facility-move-demolish; do
  run "solo:$f" npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3k-solo-$f.json" "tests/$f.test.ts"
done
FILES="tests/p1364-late-founding.test.ts tests/p14c3-transitions.test.ts tests/p14c3-offmenu-extensions.test.ts tests/p14d1-rival-shelving.test.ts tests/p14r3-save-v41.test.ts tests/p15b2-corporate-condition-live.test.ts tests/p13b-s8-old-era-period.test.ts tests/p15b4-pending-player-adoption.test.ts tests/p15b4-player-proposal-transaction.test.ts tests/p15b4-proposal-transaction.test.ts tests/bridge-p14b2-trust.test.ts tests/bridge-p14p4p5-opportunities.test.ts tests/p13b-s3-save-v23.test.ts tests/p14c2b-save-v36.test.ts tests/p14d2-save46-migration.test.ts tests/frozen-save-builder-projection.test.ts tests/p15a2-power-ranking-archive.test.ts tests/p15b4-studio-closure-save.test.ts tests/p16-rebase-c01-absorbed-claims.test.ts"
FILES=$(for f in $FILES; do [ -f "$f" ] && echo "$f"; done)
echo "=== FILES ($(echo "$FILES" | wc -l | tr -d ' '))"; echo "$FILES"
run vitest:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3k-core.json" $FILES
echo "=== ALL DONE at $(date '+%F %T'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
