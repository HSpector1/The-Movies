#!/usr/bin/env bash
# 1353-X4: G-P again on the 1353-F6 values (1353-F6 ruling 5, first run). Run under lane-run.sh.
# The unchanged 1359-GP probe (sha256 f0f0c0f6...) in ./probe reads ../tree, an archive of the repo HEAD whose second
# tree commit sets critic 60, share 20, hit 49 and CAMPAIGN_LEGACY_DEFINITION 'campaign-legacy/v2'. A 20-week smoke on
# p13a-core-causal-01 first, then 1359-X4's full routes to 6240 on p13a-core-causal-01 and seed-b. stdout (one JSON
# document) -> out/<tag>.json; stderr -> out/<tag>.err. Node pinned to v20.20.2.
set -u
X=/Users/zacheryspector/studio-scratch/1353-x4
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
cd "$X/tree" || exit 2
[ -z "$(git status --porcelain)" ] || { echo "tree is dirty"; exit 2; }
HEADS="$(git log -1 --format=%s HEAD~1 | sed 's/^base //; s/ .*//')+$(git rev-parse --short HEAD)"
[ "$(shasum -a 256 "$X/probe/1359-GP-probe.ts" | cut -c1-16)" = f0f0c0f6ed226ddb ] || { echo "probe hash differs"; exit 2; }
probe() { # tag weeks seeds
  echo "$1: 1359-GP-probe.ts node $(node --version), tree $HEADS, weeks $2, seeds $3, start $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"
  PROBE_TREE_HEAD=$HEADS PROBE_WEEKS=$2 PROBE_SEEDS=$3 ./node_modules/.bin/vite-node ../probe/1359-GP-probe.ts > "$X/out/$1.json" 2> "$X/out/$1.err"
  local rc=$?
  echo "$1: exit $rc, end $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"
  return $rc
}
probe smoke-gp-v2 20 p13a-core-causal-01 || { echo "smoke failed"; exit 1; }
probe gp-v2 6240 p13a-core-causal-01,seed-b; echo "gp-v2 exit $?"
