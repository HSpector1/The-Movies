#!/usr/bin/env bash
# 1358-M2 snapshot probe runner: the four §7 seeds, 520 weeks, a people projection every week, first on the step-4
# commit of the M2 scratch tree (729f6d8), then on its base commit (e9b7481, HEAD 5245072a's source). Run under
# lane-run.sh. The probe file is untracked and removed at the end; the tree returns to the step-4 commit.
set -u
X=/Users/zacheryspector/studio-scratch/1358-m2
T=$X/tree
P=$X/snap
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$P/snap.meta"; }
cd "$T" || exit 2
[ "$(git rev-parse --short HEAD)" = 729f6d8 ] || { log "STOP: tree is not at the step-4 commit"; exit 2; }
[ -z "$(git status --porcelain --untracked-files=no)" ] || { log "STOP: tracked changes in the tree"; exit 2; }
cp "$P/zz-snap-probe.test.ts" tests/zz-snap-probe.test.ts
run() { local label=$1
  for seed in p13a-core-causal-01 seed-b p13b-s8-bridge-probe-01 p13-public-commercial-adoption; do
    env SNAP_SEED=$seed SNAP_WEEKS=520 node_modules/.bin/vitest run --project core --no-cache tests/zz-snap-probe.test.ts > "$P/snap-$label-$seed.txt" 2>&1
    log "$label $seed exit $?: $(grep -a '^SNAP ' "$P/snap-$label-$seed.txt" | cut -c1-400)"
  done; }
log "start, node $(node --version)"
run step4
git checkout -q e9b7481 || { log "STOP: checkout base failed"; exit 1; }
run base
git checkout -q 729f6d8 || { log "STOP: checkout step4 failed"; exit 1; }
rm -f tests/zz-snap-probe.test.ts
log "tree: $(git rev-parse --short HEAD) [$(git status --porcelain --untracked-files=no | tr '\n' ' ')]"
log "end"
