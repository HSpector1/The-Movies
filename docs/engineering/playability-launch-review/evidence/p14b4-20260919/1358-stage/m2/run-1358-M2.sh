#!/usr/bin/env bash
# 1358-M2: slice B's Save44 and projection-57 fallout, measured in scratch (1358-F7 Next 4, 1358-F8 ruling 5).
# Tree: HEAD (RED r8 landed, the genuine-v43-pre-romance capture minted) plus production step 4 r2 (1358-E2,
# cumulative). Not a recorded run. Order: three type gates; the two generator checks; core over 440 files (1348-M's 435
# plus slice B's five RED files); UI; then the four §7 natural routes (the 1348-X7 analog, run names m2-*), whose
# outputs go to the §7 kit's out/ (the kit refuses to overwrite). Run under lane-run.sh. --no-cache: no results file
# through a link. Nothing is written under a link.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
EREL=docs/engineering/playability-launch-review/evidence/p14b4-20260919
X=/Users/zacheryspector/studio-scratch/1358-m2
T=$X/tree
K=/Users/zacheryspector/studio-scratch/1344-s7
STEP4=$R/$EREL/1358-stage/1358-rel-sliceB-production-step4-r2.patch
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/m2.meta"; }
[ "$(shasum -a 256 "$STEP4" | cut -c1-64)" = 2004b500b8d4be509f82381a0f3ab2022b28732cbe4fd3c0d79c22601c2cb96f ] || { echo "step 4 r2 hash differs"; exit 2; }
[ -e "$R/tests/p14b10-romance.test.ts" ] || { echo "the RED has not landed at HEAD"; exit 2; }
[ -d "$R/tests/fixtures/p14/genuine-v43-pre-romance" ] || { echo "the minted capture is not in the repository"; exit 2; }
[ -e "$T" ] && { echo "$T exists"; exit 2; }
ls "$X"/m2-*.txt >/dev/null 2>&1 && { echo "outputs exist in $X"; exit 2; }
for r in m2-p13a m2-seedb m2-ledger-p13b m2-ledger-p13pub; do [ -e "$K/out/$r" ] && { echo "$K/out/$r exists"; exit 2; }; done
[ "$(wc -l < "$X/core-list.txt" | tr -d ' ')" = 440 ] || { echo "core list is not 440 files"; exit 2; }
BASE=$(git -C "$R" rev-parse HEAD)
for f in $(cat "$X/core-list.txt"); do git -C "$R" cat-file -e "$BASE:$f" 2>/dev/null || { echo "missing at HEAD: $f"; exit 2; }; done
log "start at $BASE, node $(node --version)"
mkdir -p "$T" && cd "$R" || exit 2
git archive "$BASE" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T"
git archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$T"
for d in docs node_modules art tools tests/fixtures; do ln -sfn "$R/$d" "$T/$d"; done
cd "$T" && git init -q && git add -A . && git commit -q -m "base $BASE" && git tag base
git apply --index "$STEP4" && git commit -q -m "production step 4 r2" || { log "STOP: step 4 apply failed"; exit 1; }
log "step 4 r2 applied: $(git diff --stat base HEAD | tail -1)"
{ for p in tsconfig.json ui/tsconfig.json tsconfig.bridge.json; do echo "== $p"; node_modules/.bin/tsc -p $p --noEmit 2>&1; echo "exit $?"; done; } > "$X/m2-tsc.txt"
log "tsc: $(grep -E '^(==|exit)' "$X/m2-tsc.txt" | tr '\n' ' ')"
{ echo "== check:bridge-contract"; node_modules/.bin/vite-node scripts/generate-bridge-contract.ts --check 2>&1; echo "exit $?";
  echo "== check:bridge-contract:fixtures"; node_modules/.bin/vite-node scripts/generate-bridge-contract-fixtures.ts --check 2>&1; echo "exit $?"; } > "$X/m2-generate.txt"
log "generator: $(grep -E '^(==|exit)' "$X/m2-generate.txt" | tr '\n' ' ')"
log "core start"
PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project core --no-cache $(cat "$X/core-list.txt") > "$X/m2-core.txt" 2>&1
log "core exit $?; $(grep -aE '^ +Tests ' "$X/m2-core.txt" | tr -s ' ')"
PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project ui --no-cache > "$X/m2-ui.txt" 2>&1
log "ui exit $?; $(grep -aE '^ +Tests ' "$X/m2-ui.txt" | tr -s ' ')"
cp "$K/probes/s7-lib.ts" "$T/tests/zz-s7-lib.ts"
cp "$K/probes/s7-natural-route.test.ts" "$T/tests/zz-s7-natural-route.test.ts"
route() { local name=$1 seed=$2
  env S7_TREE=candidate S7_RUN="$name" S7_SEED="$seed" node_modules/.bin/vitest run --project core --no-cache tests/zz-s7-natural-route.test.ts > "$X/$name.log" 2>&1
  echo "exit=$?" >> "$X/$name.log"
  log "$name: $(grep -aE '^S7 |Tests |exit=' "$X/$name.log" | tr '\n' ' ' | cut -c1-400)"; }
route m2-p13a p13a-core-causal-01
route m2-seedb seed-b
route m2-ledger-p13b p13b-s8-bridge-probe-01
route m2-ledger-p13pub p13-public-commercial-adoption
log "tree status: [$(git status --porcelain | tr '\n' ' ')]"
log "end"
