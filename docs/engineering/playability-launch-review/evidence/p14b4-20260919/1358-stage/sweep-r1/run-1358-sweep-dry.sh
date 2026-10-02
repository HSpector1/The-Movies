#!/usr/bin/env bash
# 1358-N sweep dry run (records 1358-X6 onward): repo HEAD + production step 4 r2 + a merged sweep patch (tests only).
# Usage: run-1358-sweep-dry.sh <run-name> <sweep-patch> [<probe-patch> <probe-files>]
# Order (1358-F9): three type gates; both generator checks; the six slice B files plus p14b10-mentor-label (the x1
# content); the optional message probe; core over the 440 files of 1358-M2; UI. Not a recorded run. Run under
# lane-run.sh. --no-cache: no results
# file through a link. Nothing is written under a link.
set -u
NAME=${1:?run name}; SWEEP=${2:?sweep patch}; PROBE=${3:-}; PROBE_FILES=${4:-}
[ -z "$PROBE" ] || { [ -s "$PROBE" ] && [ -s "$PROBE_FILES" ]; } || { echo "probe patch or file list missing"; exit 2; }
R=/Users/zacheryspector/The-Movies-headless-program
EREL=docs/engineering/playability-launch-review/evidence/p14b4-20260919
W=/Users/zacheryspector/studio-scratch/1358-sweep
X=$W/$NAME
T=$X/tree
STEP4=$R/$EREL/1358-stage/1358-rel-sliceB-production-step4-r2.patch
LIST=/Users/zacheryspector/studio-scratch/1358-m2/core-list.txt
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/run.meta"; }
[ "$(shasum -a 256 "$STEP4" | cut -c1-64)" = 2004b500b8d4be509f82381a0f3ab2022b28732cbe4fd3c0d79c22601c2cb96f ] || { echo "step 4 r2 hash differs"; exit 2; }
[ -s "$SWEEP" ] || { echo "no sweep patch at $SWEEP"; exit 2; }
[ -e "$X" ] && { echo "$X exists"; exit 2; }
[ "$(wc -l < "$LIST" | tr -d ' ')" = 440 ] || { echo "core list is not 440 files"; exit 2; }
mkdir -p "$X" && cp "$SWEEP" "$X/sweep.patch"
BASE=$(git -C "$R" rev-parse HEAD)
log "start at $BASE, node $(node --version), sweep $(shasum -a 256 "$X/sweep.patch" | cut -c1-16)"
mkdir -p "$T" && cd "$R" || exit 2
git archive "$BASE" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T"
git archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$T"
for d in docs node_modules art tools tests/fixtures; do ln -sfn "$R/$d" "$T/$d"; done
cd "$T" && git init -q && git add -A . && git commit -q -m "base $BASE" && git tag base
git apply --index "$STEP4" && git commit -q -m "production step 4 r2" && git tag step4 || { log "STOP: step 4 apply failed"; exit 1; }
git apply --index "$X/sweep.patch" && git commit -q -m "sweep" || { log "STOP: sweep apply failed"; exit 1; }
log "applied: step4 $(git diff --stat base step4 | tail -1); sweep $(git diff --stat step4 HEAD | tail -1)"
[ -z "$(git diff --name-only step4 HEAD | grep -v -E '^(tests/|ui/src/.*\.test\.tsx?$)')" ] || { log "STOP: sweep touches a non-test file"; exit 1; }
{ for p in tsconfig.json ui/tsconfig.json tsconfig.bridge.json; do echo "== $p"; node_modules/.bin/tsc -p $p --noEmit 2>&1; echo "exit $?"; done; } > "$X/tsc.txt"
log "tsc: $(grep -E '^(==|exit)' "$X/tsc.txt" | tr '\n' ' ') errors $(grep -c 'error TS' "$X/tsc.txt")"
{ echo "== check:bridge-contract"; node_modules/.bin/vite-node scripts/generate-bridge-contract.ts --check 2>&1; echo "exit $?";
  echo "== check:bridge-contract:fixtures"; node_modules/.bin/vite-node scripts/generate-bridge-contract-fixtures.ts --check 2>&1; echo "exit $?"; } > "$X/generate.txt"
log "generator: $(grep -E '^(==|exit)' "$X/generate.txt" | tr '\n' ' ')"
SB="tests/p14b10-competitions-log.test.ts tests/p14b10-labels.test.ts tests/p14b10-save-v44.test.ts tests/bridge-p14b10-relationship-labels.test.ts tests/p14b10-romance.test.ts tests/p14b5-relationships.test.ts tests/p14b10-mentor-label.test.ts"
PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project core --no-cache --reporter=verbose --reporter=json --outputFile.json="$X/sliceb.json" $SB > "$X/sliceb.txt" 2>&1
log "slice B files exit $?; $(grep -aE '^ +Tests ' "$X/sliceb.txt" | tr -s ' ')"
# Optional message probe (1344-X12 form): applied, run once over its files, removed; the tree must return to the sweep.
if [ -n "$PROBE" ]; then
  cp "$PROBE" "$X/probe.patch" && cp "$PROBE_FILES" "$X/probe-files.txt"
  git apply "$X/probe.patch" || { log "STOP: probe apply failed"; exit 1; }
  PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project core --no-cache --reporter=verbose $(cat "$X/probe-files.txt") > "$X/probe.txt" 2>&1
  log "probe exit $?; $(grep -aE '^ +Tests ' "$X/probe.txt" | tr -s ' '); lines $(grep -ac 'PROBE1358 ' "$X/probe.txt")"
  git apply -R "$X/probe.patch" || { log "STOP: probe reverse failed"; exit 1; }
  [ -z "$(git status --porcelain)" ] || { log "STOP: tree differs from the sweep after the probe: $(git status --porcelain | tr '\n' ' ')"; exit 1; }
fi
log "core start"
PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project core --no-cache $(cat "$LIST") > "$X/core.txt" 2>&1
log "core exit $?; $(grep -aE '^ +Tests ' "$X/core.txt" | tr -s ' ')"
PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project ui --no-cache > "$X/ui.txt" 2>&1
log "ui exit $?; $(grep -aE '^ +Tests ' "$X/ui.txt" | tr -s ' ')"
log "tree status: [$(git status --porcelain | tr '\n' ' ')]"
log "end"
