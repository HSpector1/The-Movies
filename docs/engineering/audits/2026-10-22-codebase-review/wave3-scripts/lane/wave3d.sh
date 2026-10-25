#!/bin/bash
# wave3d: the C-01 red run on a throwaway tree of b2d3d97e (the worktree itself is NOT read: the implementing agent is
# editing it), then bridge-p13b-s7-disclosure alone on the main checkout (9f36dd23 = main 8792de52 for core) for the
# parent timing of item 5. The worktree green run and its own s7 timing follow after the agent's round 3.
export PATH="/usr/local/bin:$PATH"
WT=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
RED=/Users/zacheryspector/studio-scratch/p16-c01-red-wt
R=/Users/zacheryspector/The-Movies-headless-program
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
TEST=tests/p16-rebase-c01-absorbed-claims.test.ts
HEADSHA=$($G -C "$WT" rev-parse HEAD)
echo "node $(node --version) at $(date '+%F %T'); worktree HEAD ${HEADSHA:0:8}; load $(uptime | sed 's/.*load/load/'); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
. /Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/lane/p16-env.sh
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
[ -e "$RED" ] && { echo "red tree already exists at $RED; refusing"; exit 9; }
$G -C "$WT" worktree add --detach --no-checkout "$RED" b2d3d97e || exit 9
$G -C "$RED" sparse-checkout init --no-cone
printf '/*\n!/docs/\n' > "$($G -C "$RED" rev-parse --git-path info/sparse-checkout)"
$G -C "$RED" checkout --detach b2d3d97e -q || exit 9
ln -s "$WT/node_modules" "$RED/node_modules"; ln -s "$WT/ui/node_modules" "$RED/ui/node_modules"
$G -C "$WT" show "$HEADSHA:$TEST" > "$RED/$TEST"
echo "red tree $($G -C "$RED" rev-parse --short HEAD), $(du -sk "$RED" | awk '{printf "%.0f MB", $1/1024}'); test copied from $HEADSHA ($(shasum -a 256 "$RED/$TEST" | cut -c1-16)); free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
echo "=== claimsLiveWork at the red tree:"; /usr/bin/grep -n "verifyParticipants(p,true" "$RED/src/core/hollywoodValidation.ts"
(cd "$RED" && run vitest:red npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/c01-red.json" "$TEST")
$G -C "$WT" worktree remove --force "$RED" && echo "red tree removed; free $(df -k ~ | awk 'NR==2 {printf "%.2f GB", $4/1048576}')"
echo "=== main checkout $($G -C "$R" rev-parse --short HEAD) status: $($G -C "$R" status --porcelain | wc -l | tr -d ' ') dirty paths"
(cd "$R" && run vitest:s7-parent npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/s7-parent.json" tests/bridge-p13b-s7-disclosure.test.ts)
echo "=== ALL DONE at $(date '+%F %T')"
