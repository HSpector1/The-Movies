#!/bin/bash
# wave3l: round 7 (the third review's two blockers and three observations) measured on the primary worktree at 332a742a,
# after the full gate wave3j released it. Static gates; the four changed test files alone (p15c2 for the two 120 s cases'
# own durations); then every suite that reaches the frozen-era money path (moveRivalMoney / admitRivalPlans / research-v27)
# and the importers of the three helpers on that path, in one focused run.
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
for f in p14d1-rival-shelving p1364-late-founding p15c2-campaign-legacy-integration p13b-s7-announcements; do
  run "solo:$f" npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3l-solo-$f.json" "tests/$f.test.ts"
done
HELPERS=$(/usr/bin/grep -l "helpers/1368-lowmarket-research-boundary\|helpers/1368-operational-boundary\|helpers/recovery-migration-expectation" tests/*.test.ts)
FILES=$(printf '%s\n' tests/p13b-s8-old-era-period.test.ts tests/p14r3-save-v41.test.ts tests/p13b-s8-save-v27.test.ts tests/save-masked-downgrade-own-era.test.ts tests/bridge-p13b-s3-plans.test.ts tests/bridge-p13b-s8-rivals.test.ts tests/p13b-s8-capacity.test.ts tests/p13b-s8-finance.test.ts tests/stabilization-l33-rival-interest.test.ts $HELPERS | sort -u | while read f; do [ -f "$f" ] && echo "$f"; done)
echo "=== FILES ($(echo "$FILES" | wc -l | tr -d ' '))"; echo "$FILES"
run vitest:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3l-core.json" $FILES
# (d) the reviewer's red-without-fix witness for the moveRivalMoney guard: probe on HEAD (throws), then on a throwaway at 5a700af3 (NaN).
PROBE=tests/zz-wave3l-probe.test.ts; OLD=/Users/zacheryspector/studio-scratch/p16-probe-wt
cp "$S/lane/zz-wave3l-probe.test.ts" "$PROBE"
run probe:head env PROBE_EXPECT=throw npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3l-probe-head.json" "$PROBE"
rm -f "$PROBE"; echo "probe removed from the worktree; dirty $($G status --porcelain | wc -l | tr -d ' ')"
[ -e "$OLD" ] && { echo "probe tree exists; skipping"; } || {
  $G worktree add --detach --no-checkout "$OLD" 5a700af3 && $G -C "$OLD" sparse-checkout init --no-cone && printf '/*\n!/docs/\n!/ui/\n' > "$($G -C "$OLD" rev-parse --git-path info/sparse-checkout)" && $G -C "$OLD" checkout --detach 5a700af3 -q && ln -s "$WT/node_modules" "$OLD/node_modules" && cp "$S/lane/zz-wave3l-probe.test.ts" "$OLD/$PROBE"
  echo "probe tree $($G -C "$OLD" rev-parse --short HEAD); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
  (cd "$OLD" && run probe:5a700af3 env PROBE_EXPECT=nan npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/wave3l-probe-parent.json" "$PROBE")
  $G worktree remove --force "$OLD" && echo "probe tree removed"
}
echo "=== ALL DONE at $(date '+%F %T'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
