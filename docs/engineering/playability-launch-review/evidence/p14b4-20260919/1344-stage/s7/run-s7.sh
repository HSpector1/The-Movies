#!/usr/bin/env bash
# The §7 verification (1344-s7 RUNBOOK steps 0-10), one heavy process at a time, unattended.
# Usage (detached): python3 -c 'import os,sys; os.setsid(); os.execvp("bash", ["bash"]+sys.argv[1:])' \
#   /Users/zacheryspector/studio-scratch/1344-s7/run-s7.sh <C_SHA> </dev/null >/dev/null 2>&1 &
# Progress: out/s7.meta. Holds /Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK while it runs.
# Commands are the RUNBOOK's; the STOP checks transcribe its "must" lines. Step 12 (cleanup) stays manual.
set -u
# Node: the baselines this kit compares against (1329's probes, 1338, 1343, 1344-M) ran v20.20.2; the session default is
# v22.23.2. Pin v20.20.2 so the byte anchors and the C8 comparison run in the baselines' environment.
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
REPO=/Users/zacheryspector/The-Movies-headless-program
E=$REPO/docs/engineering/playability-launch-review/evidence/p14b4-20260919
K=/Users/zacheryspector/studio-scratch/1344-s7
T=$K/tree
O=$K/old-tree
OUT=$K/out
C_SHA=${1:?usage: run-s7.sh <C_SHA>}
LOCK=/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK
mkdir -p "$OUT"
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$OUT/s7.meta"; }
stop() { log "STOP: $1"; exit 3; }
caffeinate -is -w $$ &
log "start, C_SHA $C_SHA, node $(node --version) at $(command -v node)"

# Step 0. Preconditions. Take the lock first, so agents start no new vitest, then wait out any vitest or tsc that
# started before it. Matching on the node command name skips shell waiters whose text mentions vitest.
heavy() { ps -axo comm=,args= | awk '$1 ~ /(^|\/)node$/ && /vitest|\/bin\/tsc|\/lib\/tsc\.js/'; }
[ -e "$LOCK" ] && stop "the heavy lane is locked: $(cat "$LOCK")"
echo "1344 s7 verification, started $(date '+%Y-%m-%d %H:%M:%S %Z')" > "$LOCK"
trap 'rm -f "$LOCK"' EXIT
n=0
while [ -n "$(heavy)" ]; do
  [ $n -eq 0 ] && log "waiting for: $(heavy | cut -c1-200 | tr '\n' ' ')"
  n=$((n+1)); [ $n -gt 120 ] && stop "a vitest or tsc still runs after 60 min"
  sleep 30
done
[ -z "$(git -C "$REPO" diff --stat 9fc79624 "$C_SHA" -- src generated)" ] || stop "src or generated differs from 9fc79624"
df -h /Users/zacheryspector | tail -1 >> "$OUT/s7.meta"
test ! -e "$OUT/kit-sha256.txt" || stop "out/kit-sha256.txt exists"
(cd "$K" && shasum -a 256 RUNBOOK.md NOTES.md build-trees.sh probes/* controls/* c8/*) > "$OUT/kit-sha256.txt"
log "step 0 done"

# Step 1. Build the trees
bash "$K/build-trees.sh" "$C_SHA" >> "$OUT/s7.meta" 2>&1 || stop "build-trees failed"
log "step 1 done"

# Step 2. The C8 re-run, in the pristine candidate tree
mkdir -p "$OUT/c8"
test ! -e "$OUT/c8/run.txt" || stop "out/c8/run.txt exists"
(cd "$T" && PATH="$REPO/.venv/bin:$PATH" node_modules/.bin/vitest run --project core --no-cache \
   --reporter=default --reporter=json --outputFile.json="$OUT/c8/run.json" \
   tests/bridge-p14b2-trust.test.ts tests/p14b1-t4-regressions.test.ts tests/p14b2-fixture-preconditions.test.ts \
   tests/p14b4-cast-class-outcomes.test.ts tests/p14b4-rival-seating-preference.test.ts tests/bridge-p14b5-relationships.test.ts) \
   > "$OUT/c8/run.txt" 2>&1
echo "exit=$?" >> "$OUT/c8/run.txt"
(cd "$T" && python3 "$E/1321-I-attribution.py" "$OUT/c8/run.txt" "$OUT/c8/failures.json") >> "$OUT/s7.meta" 2>&1
echo "c8 status: [$(git -C "$T" status --porcelain | tr '\n' ' ')]" >> "$OUT/s7.meta"
log "step 2 done ($(tail -1 "$OUT/c8/run.txt"))"

# Step 3. Control (a)
bash "$K/controls/a-test3.sh" >> "$OUT/s7.meta" 2>&1
log "step 3 done"

# Step 4. Install the probes in both trees, and define the runner
for D in "$T" "$O"; do
  for f in zz-s7-lib.ts zz-s7-natural-route.test.ts zz-s7-decide-diag.test.ts zz-s7-player-only.test.ts; do
    test ! -e "$D/tests/$f" || stop "$D/tests/$f exists"
  done
  cp "$K/probes/s7-lib.ts" "$D/tests/zz-s7-lib.ts"
  cp "$K/probes/s7-natural-route.test.ts" "$D/tests/zz-s7-natural-route.test.ts"
  cp "$K/probes/s7-decide-diag.test.ts" "$D/tests/zz-s7-decide-diag.test.ts"
  cp "$K/controls/b-player-only.test.ts" "$D/tests/zz-s7-player-only.test.ts"
done
s7run() {
  local dir=$1 tree=$2 run=$3 file=$4; shift 4
  if [ -e "$OUT/$run" ] || [ -e "$OUT/$run.log" ]; then log "s7run: $run exists, refusing"; return 1; fi
  (cd "$dir" && env S7_TREE="$tree" S7_RUN="$run" "$@" node_modules/.bin/vitest run --project core --no-cache "tests/$file") \
    > "$OUT/$run.log" 2>&1
  echo "exit=$?" >> "$OUT/$run.log"
  log "$run: $(grep -aE '^S7 |Tests |exit=' "$OUT/$run.log" | tr '\n' ' ' | cut -c1-400)"
  tail -1 "$OUT/$run.log" | grep -q '^exit=0$'
}
log "step 4 done"

# Step 5. Smoke runs; every run must exit 0 and the four cmp lines must print "equal"
s7run "$T" candidate smoke-c-route zz-s7-natural-route.test.ts S7_WEEKS=20 || stop "smoke-c-route"
s7run "$O" old       smoke-o-route zz-s7-natural-route.test.ts S7_WEEKS=20 || stop "smoke-o-route"
s7run "$T" candidate smoke-c-diag  zz-s7-decide-diag.test.ts  S7_WEEKS=20 || stop "smoke-c-diag"
s7run "$O" old       smoke-o-diag  zz-s7-decide-diag.test.ts  S7_WEEKS=20 || stop "smoke-o-diag"
s7run "$T" candidate smoke-c-po    zz-s7-player-only.test.ts  S7_WEEKS=4 || stop "smoke-c-po"
s7run "$O" old       smoke-o-po    zz-s7-player-only.test.ts  S7_WEEKS=4 || stop "smoke-o-po"
for f in natural-chain.jsonl rival-economy.jsonl weekly.jsonl; do
  cmp -s "$OUT/smoke-c-route/$f" "$OUT/smoke-o-route/$f" || stop "smoke $f differs between trees"
done
cmp -s "$OUT/smoke-c-po/player-only.cmp.json" "$OUT/smoke-o-po/player-only.cmp.json" || stop "smoke player-only differs"
log "step 5 done: four smoke comparisons equal"

# Step 6. The natural-route runs. A failing run stays as evidence; the kit's names stay fixed, so stop on failure.
s7run "$T" candidate c-p13a-1        zz-s7-natural-route.test.ts S7_SEED=p13a-core-causal-01 || stop "c-p13a-1"
s7run "$T" candidate c-p13a-2        zz-s7-natural-route.test.ts S7_SEED=p13a-core-causal-01 || stop "c-p13a-2"
s7run "$O" old       o-p13a          zz-s7-natural-route.test.ts S7_SEED=p13a-core-causal-01 || stop "o-p13a"
s7run "$T" candidate c-seedb         zz-s7-natural-route.test.ts S7_SEED=seed-b || stop "c-seedb"
s7run "$O" old       o-seedb         zz-s7-natural-route.test.ts S7_SEED=seed-b || stop "o-seedb"
s7run "$T" candidate c-ledger-p13b   zz-s7-natural-route.test.ts S7_SEED=p13b-s8-bridge-probe-01 || stop "c-ledger-p13b"
s7run "$O" old       o-ledger-p13b   zz-s7-natural-route.test.ts S7_SEED=p13b-s8-bridge-probe-01 || stop "o-ledger-p13b"
s7run "$T" candidate c-ledger-p13pub zz-s7-natural-route.test.ts S7_SEED=p13-public-commercial-adoption || stop "c-ledger-p13pub"
s7run "$O" old       o-ledger-p13pub zz-s7-natural-route.test.ts S7_SEED=p13-public-commercial-adoption || stop "o-ledger-p13pub"
log "step 6 done"

# Step 7. The decide-diag runs
s7run "$T" candidate c-diag zz-s7-decide-diag.test.ts S7_SEED=p13a-core-causal-01 || stop "c-diag"
s7run "$O" old       o-diag zz-s7-decide-diag.test.ts S7_SEED=p13a-core-causal-01 S7_WEEKS=216 || stop "o-diag"
log "step 7 done"

# Step 8. Control (b): player-only campaigns
s7run "$T" candidate c-player-only zz-s7-player-only.test.ts || stop "c-player-only"
s7run "$O" old       o-player-only zz-s7-player-only.test.ts || stop "o-player-only"
log "step 8 done"

# Step 9. Remove the probes from both trees; no tracked file may change
for D in "$T" "$O"; do
  rm -f "$D"/tests/zz-s7-*
  st=$(git -C "$D" status --porcelain)
  echo "status $D: [$(echo "$st" | tr '\n' ' ')]" >> "$OUT/s7.meta"
  echo "$st" | grep -qE '^ ?[MD]' && stop "a tracked file changed in $D"
done
log "step 9 done"

# Step 10. Compare, check the controls, fill the worksheet (light; no vitest)
python3 "$K/probes/compare.py" >> "$OUT/s7.meta" 2>&1; log "compare.py exit $?"
python3 "$K/controls/check.py" >> "$OUT/s7.meta" 2>&1; log "check.py exit $?"
python3 "$K/c8/worksheet.py" >> "$OUT/s7.meta" 2>&1; log "worksheet.py exit $?"
log "end"
