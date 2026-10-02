#!/usr/bin/env bash
# Run one P15 probe once, alone, under lane-run.sh. Usage: run-probe.sh <probe file> <tag> <weeks> <seeds>
# stdout (one JSON document) -> out/<tag>.json; stderr (progress) -> out/<tag>.err. Node pinned to v20.20.2.
set -u
X=/Users/zacheryspector/studio-scratch/p15-probes
P=$1 TAG=$2 WEEKS=$3 SEEDS=$4
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
cd "$X/tree" || exit 2
echo "$TAG: $P node $(node --version), weeks $WEEKS, seeds $SEEDS, start $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"
PROBE_TREE_HEAD=$(cat "$X/tree-head.txt") PROBE_WEEKS=$WEEKS PROBE_SEEDS=$SEEDS \
  ./node_modules/.bin/vite-node "../probe/$P" > "$X/out/$TAG.json" 2> "$X/out/$TAG.err"
rc=$?
echo "$TAG: exit $rc, end $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"
exit $rc
