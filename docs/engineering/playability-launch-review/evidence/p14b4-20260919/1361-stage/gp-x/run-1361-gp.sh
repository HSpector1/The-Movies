#!/usr/bin/env bash
# 1361-GP: the gating G-P run (1361-F ruling 12; 1361-F2 ruling 1). usage: run-1361-gp.sh <writer tag> [roots line]
# Builds X/tree from the writer's tag, commits the v2 values, runs a 20-week smoke, stops unless the smoke read the
# expected P15 roots, then runs the full routes. Writes only under X. Notes §5.4 plus 1361-GP-D findings 2 and 6.
set -u -o pipefail
R=/Users/zacheryspector/The-Movies-headless-program
E=$R/docs/engineering/playability-launch-review/evidence/p14b4-20260919
W=/Users/zacheryspector/studio-scratch/1361-prod/tree
X=/Users/zacheryspector/studio-scratch/1361-gp-x
PROBE=/Users/zacheryspector/studio-scratch/1361-gp/1361-GP-probe-r2.ts
PROBE_SHA16=3d460c228b5b406b
TAG=${1:?tag}
ROOTS=${2:-p15Sequence, powerRanking, sharedMarket}
GREP=/usr/bin/grep
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ "$(shasum -a 256 "$PROBE" | cut -c1-16)" = "$PROBE_SHA16" ] || { echo "STOP: probe hash differs"; exit 2; }
[ -e "$X" ] && { echo "STOP: $X exists"; exit 2; }
CAND=$(git -C "$W" rev-parse "$TAG^{commit}") || exit 2
mkdir -p "$X/tree" "$X/probe" "$X/out" || exit 2
git -C "$W" archive "$CAND" | tar -x -C "$X/tree" || { echo "STOP: archive failed"; exit 2; }
ln -s "$R/node_modules" "$X/tree/node_modules" || exit 2
cd "$X/tree" || exit 2
G="git -c user.name=parent -c user.email=parent@local"
git init -q && echo node_modules > .git/info/exclude || exit 2
$G add -A && $G commit -qm "base $CAND (1361-prod $TAG)" || { echo "STOP: base commit failed"; exit 2; }
git apply "$E/1353-stage/x4/1353-X4-tree-edits.patch" || { echo "STOP: the 1353-X4 tree edits do not apply"; exit 3; }
$GREP -q "^export const CAMPAIGN_LEGACY_DEFINITION = 'campaign-legacy/v2'$" src/core/campaignLegacy.ts \
  || { echo "STOP: the definition is not v2"; exit 3; }
[ "$($GREP -cE '^  LEGACY_(CRITIC_ACCLAIM_MIN: 60|MIN_SHARE_PERCENT: 20|HIT_REACH_PERCENT: 49),' src/core/tuning.ts)" = 3 ] \
  || { echo "STOP: the three v2 values are not in tuning.ts"; exit 3; }
$G commit -qam "v2 values: critic 60, share 20, hit 49, campaign-legacy/v2 (1353-X4 tree edits)" || { echo "STOP: v2 commit failed"; exit 2; }
[ -z "$(git status --porcelain)" ] || { echo "STOP: tree is dirty"; exit 3; }
HEADS="$CAND+$(git rev-parse --short HEAD)"
cp "$PROBE" "$X/probe/" || exit 2
[ "$(shasum -a 256 "$X/probe/1361-GP-probe-r2.ts" | cut -c1-16)" = "$PROBE_SHA16" ] || { echo "STOP: copied probe hash differs"; exit 2; }
probe() { # tag weeks seeds
  echo "$1: 1361-GP-probe-r2.ts node $(node --version), tree $HEADS ($TAG), weeks $2, seeds $3, start $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"
  PROBE_TREE_HEAD=$HEADS PROBE_WEEKS=$2 PROBE_SEEDS=$3 ./node_modules/.bin/vite-node ../probe/1361-GP-probe-r2.ts > "$X/out/$1.json" 2> "$X/out/$1.err"
  local rc=$?
  echo "$1: exit $rc, end $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"
  return $rc
}
probe smoke-gp 20 p13a-core-causal-01 || { echo "STOP: smoke failed"; exit 1; }
$GREP -qF "P15 roots at week 20: $ROOTS;" "$X/out/smoke-gp.err" \
  || { echo "STOP: the smoke did not read the roots '$ROOTS'"; exit 4; }
echo "smoke read the roots: $ROOTS" >> "$X/out/runs.meta"
probe gp 6240 p13a-core-causal-01,seed-b; rc=$?; echo "gp exit $rc"; exit $rc
