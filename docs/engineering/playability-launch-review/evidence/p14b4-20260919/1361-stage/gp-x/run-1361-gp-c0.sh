#!/usr/bin/env bash
# 1361-GP C0: r1 and r2 on one tree with no P15 root (notes §5.5; 1361-F2 ruling 1). Writes only under Y.
set -u -o pipefail
R=/Users/zacheryspector/The-Movies-headless-program
E=$R/docs/engineering/playability-launch-review/evidence/p14b4-20260919
W=/Users/zacheryspector/studio-scratch/1361-prod/tree
Y=/Users/zacheryspector/studio-scratch/1361-gp-c0
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ -e "$Y" ] && { echo "STOP: $Y exists"; exit 2; }
mkdir -p "$Y/tree" "$Y/probe" "$Y/out" || exit 2
cp "$E/1359-stage/gp/1359-GP-probe.ts" /Users/zacheryspector/studio-scratch/1361-gp/1361-GP-probe-r2.ts "$Y/probe/" || exit 2
[ "$(shasum -a 256 "$Y/probe/1359-GP-probe.ts" | cut -c1-16)" = f0f0c0f6ed226ddb ] || { echo "STOP: r1 hash differs"; exit 2; }
[ "$(shasum -a 256 "$Y/probe/1361-GP-probe-r2.ts" | cut -c1-16)" = 3d460c228b5b406b ] || { echo "STOP: r2 hash differs"; exit 2; }
git -C "$W" archive base | tar -x -C "$Y/tree" || { echo "STOP: archive failed"; exit 2; }
ln -s "$R/node_modules" "$Y/tree/node_modules" || exit 2
cd "$Y/tree" || exit 2
git init -q && git apply "$E/1353-stage/x4/1353-X4-tree-edits.patch" || { echo "STOP: the tree edits do not apply"; exit 3; }
echo "C0: base $(git -C "$W" rev-parse base)+v2, node $(node --version), start $(date '+%Y-%m-%d %H:%M:%S %Z')" > "$Y/out/runs.meta"
rc=0
for f in 1359-GP-probe 1361-GP-probe-r2; do
  PROBE_TREE_HEAD="$(git -C "$W" rev-parse base)+v2" PROBE_WEEKS=20 PROBE_SEEDS=p13a-core-causal-01 \
    ./node_modules/.bin/vite-node "../probe/$f.ts" > "$Y/out/$f.json" 2> "$Y/out/$f.err"; r=$?; echo "$f exit $r" | tee -a "$Y/out/runs.meta"
  [ $r = 0 ] || rc=$r
done
/usr/bin/grep -h '"manifestSha256"' "$Y/out/"*.json
echo "C0 end $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$Y/out/runs.meta"
exit $rc
