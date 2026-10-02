#!/usr/bin/env bash
# 1357-X cash-path diagnostic, alone in the lane under lane-run.sh. Usage: run-diag.sh <tag> <weeks> <seeds>
set -u
X=/Users/zacheryspector/studio-scratch/1357-x
TAG=$1 WEEKS=$2 SEEDS=$3
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
cd "$X/tree" || exit 2
echo "$TAG: node $(node --version), weeks $WEEKS, seeds $SEEDS, start $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"
PROBE_TREE_HEAD=b08096020e4dccf8c22d036bbd9fb7ad742e5aea PROBE_WEEKS=$WEEKS PROBE_SEEDS=$SEEDS \
  ./node_modules/.bin/vite-node ../probe/1357-X-cash-diag.ts > "$X/out/$TAG.json" 2> "$X/out/$TAG.err"
rc=$?
echo "$TAG: exit $rc, end $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"
exit $rc
