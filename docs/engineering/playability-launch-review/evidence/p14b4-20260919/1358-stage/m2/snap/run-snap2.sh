#!/usr/bin/env bash
# 1358-M2 snapshot probe 2 runner, in the 1358-X6 scratch tree: first at its sweep commit (step 4 r2 + sweep r1,
# 69a91bb), then at its base commit (4e2b45a, HEAD 768fc628's source). Route mode on the four §7 seeds (520 weeks,
# blocks every 4 weeks), then cohort mode once. Run under lane-run.sh. The probe file is untracked and removed at the
# end; the tree returns to the sweep commit.
set -u
T=/Users/zacheryspector/studio-scratch/1358-sweep/x6/tree
P=/Users/zacheryspector/studio-scratch/1358-m2/snap
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$P/snap2.meta"; }
cd "$T" || exit 2
[ "$(git rev-parse --short HEAD)" = 69a91bb ] || { log "STOP: tree is not at the sweep commit"; exit 2; }
[ -z "$(git status --porcelain --untracked-files=no)" ] || { log "STOP: tracked changes in the tree"; exit 2; }
cp "$P/zz-snap2-probe.test.ts" tests/zz-snap2-probe.test.ts
run() { local label=$1
  for seed in p13a-core-causal-01 seed-b p13b-s8-bridge-probe-01 p13-public-commercial-adoption; do
    env SNAP2_MODE=route SNAP2_SEED=$seed node_modules/.bin/vitest run --project core --no-cache tests/zz-snap2-probe.test.ts > "$P/snap2-$label-$seed.txt" 2>&1
    log "$label $seed exit $?: $(grep -a '^SNAP2 ' "$P/snap2-$label-$seed.txt" | cut -c1-600)"
  done
  env SNAP2_MODE=cohort node_modules/.bin/vitest run --project core --no-cache tests/zz-snap2-probe.test.ts > "$P/snap2-$label-cohort.txt" 2>&1
  log "$label cohort exit $?: $(grep -a '^SNAP2 ' "$P/snap2-$label-cohort.txt" | cut -c1-600)"; }
log "start, node $(node --version)"
run sweep
git checkout -q base || { log "STOP: checkout base failed"; exit 1; }
run base
git checkout -q 69a91bb || { log "STOP: checkout sweep failed"; exit 1; }
rm -f tests/zz-snap2-probe.test.ts
log "tree: $(git rev-parse --short HEAD) [$(git status --porcelain --untracked-files=no | tr '\n' ' ')]"
log "end"
