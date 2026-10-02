#!/usr/bin/env bash
# 1348-X7: slice A's natural-route check. The four §7 natural routes (520 weeks) at HEAD, which carries slice A
# (1348-L), against 1344-V's final-state hashes at 469a9547. The §7 kit's probes run unchanged; their outputs go to
# the kit's OUT_ROOT under new run names (h-*), which the kit refuses to overwrite. Run under lane-run.sh.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
K=/Users/zacheryspector/studio-scratch/1344-s7
X=/Users/zacheryspector/studio-scratch/1348-x7
T=$X/tree
BASE=e7f075ce
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ -e "$T" ] && { echo "$T exists"; exit 2; }
for r in h-p13a h-seedb h-ledger-p13b h-ledger-p13pub; do [ -e "$K/out/$r" ] && { echo "$K/out/$r exists"; exit 2; }; done
git -C "$R" diff --quiet b0809602 "$BASE" -- src generated || { echo "src moved since b0809602"; exit 2; }
echo "node $(node --version), base $(git -C "$R" rev-parse "$BASE")"
mkdir -p "$T" && cd "$R" || exit 2
git archive "$BASE" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T"
git archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$T"
for d in docs node_modules art tools; do ln -sfn "$R/$d" "$T/$d"; done
ln -sfn "$R/tests/fixtures" "$T/tests/fixtures"
cp "$K/probes/s7-lib.ts" "$T/tests/zz-s7-lib.ts"
cp "$K/probes/s7-natural-route.test.ts" "$T/tests/zz-s7-natural-route.test.ts"
cd "$T" && git init -q && git add -A . && git commit -q -m "1348-X7 base $BASE plus the s7 probes"
run() { local name=$1 seed=$2
  env S7_TREE=candidate S7_RUN="$name" S7_SEED="$seed" node_modules/.bin/vitest run --project core --no-cache tests/zz-s7-natural-route.test.ts > "$X/$name.log" 2>&1
  echo "exit=$?" >> "$X/$name.log"
  echo "$name: $(grep -aE '^S7 |Tests |exit=' "$X/$name.log" | tr '\n' ' ' | cut -c1-400)"; }
run h-p13a p13a-core-causal-01
run h-seedb seed-b
run h-ledger-p13b p13b-s8-bridge-probe-01
run h-ledger-p13pub p13-public-commercial-adoption
echo "tree status: [$(git status --porcelain | tr '\n' ' ')]"
date '+done %H:%M:%S'
