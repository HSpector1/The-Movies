#!/usr/bin/env bash
# 1361-M2: the Save45 fallout on the merged candidate, measured in scratch (1361-F ruling 20; 1358-M2's method).
# Tree: an archive of HEAD (src and tests equal the writer's base) plus the cumulative production patch through
# p15c-c-r1 (slice 2a r2, P15A.1 (a) and (b) r2, P15C (a)-(c)). No test edit. Not a recorded run. Order: three type
# gates; the two generator checks; core over 447 files (1358-M2's 440 plus the seven P15 RED files; 1296-A's six stay
# out); UI; the d16 config (1361-F5 ruling 3). docs, node_modules, art and tools are links; tests/fixtures is a real dir
# of per-entry links with bridge-contract-union-fixtures.ts copied (memory scratch-tree-fixture-links). --no-cache.
# Nothing is written under a link. Run alone under lane-run.sh; never edit it while it runs.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
EREL=docs/engineering/playability-launch-review/evidence/p14b4-20260919
X=/Users/zacheryspector/studio-scratch/1361-m2
T=$X/tree
PATCH=$R/$EREL/1361-stage/prod/1361-p15c-production-c-r1.patch
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/m2.meta"; }
[ "$(shasum -a 256 "$PATCH" | cut -c1-64)" = a7a70ad959ee2eb7fc7f0e7200ee693f3a28edfb66ffbc8fc327fd077ef7c221 ] || { echo "STOP: patch hash differs"; exit 2; }
[ -e "$T" ] && { echo "STOP: $T exists"; exit 2; }
ls "$X"/m2-*.txt >/dev/null 2>&1 && { echo "STOP: outputs exist in $X"; exit 2; }
[ "$(wc -l < "$X/core-list.txt" | tr -d ' ')" = 447 ] || { echo "STOP: core list is not 447 files"; exit 2; }
BASE=$(git -C "$R" rev-parse HEAD)
[ "$(git -C "$R" rev-parse "$BASE:src")" = 762d8e094caba998b2e5458f0999e8421d90a835 ] || { echo "STOP: HEAD's src is not the writer's base"; exit 2; }
for f in $(cat "$X/core-list.txt"); do git -C "$R" cat-file -e "$BASE:$f" 2>/dev/null || { echo "STOP: missing at HEAD: $f"; exit 2; }; done
log "start at $BASE, node $(node --version)"
mkdir -p "$T" || exit 2
git -C "$R" archive "$BASE" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T" || exit 2
git -C "$R" archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$T" || exit 2
for d in docs node_modules art tools; do ln -s "$R/$d" "$T/$d"; done
mkdir -p "$T/tests/fixtures" && for e in "$R"/tests/fixtures/*; do b=$(basename "$e"); [ "$b" = bridge-contract-union-fixtures.ts ] || ln -s "$e" "$T/tests/fixtures/$b"; done
cp "$R/tests/fixtures/bridge-contract-union-fixtures.ts" "$T/tests/fixtures/" || exit 2
G="git -C $T -c user.name=parent -c user.email=parent@local"
printf 'node_modules\nart\ntools\ndocs\ntests/fixtures/\n' > "$X/exclude.txt"
$G init -q && cp "$X/exclude.txt" "$T/.git/info/exclude" && $G add -A . && $G commit -q -m "base $BASE" && $G tag base || exit 2
$G apply --index "$PATCH" && $G commit -q -m "Save45 productions through p15c-c-r1" || { log "STOP: patch apply failed"; exit 1; }
log "applied: $($G diff --stat base HEAD | tail -1)"
cd "$T" || exit 2
{ for p in tsconfig.json ui/tsconfig.json tsconfig.bridge.json; do echo "== $p"; node_modules/.bin/tsc -p $p --noEmit 2>&1; echo "exit $?"; done; } > "$X/m2-tsc.txt"
log "tsc: $(/usr/bin/grep -E '^(==|exit)' "$X/m2-tsc.txt" | tr '\n' ' ')"
{ echo "== check:bridge-contract"; node_modules/.bin/vite-node scripts/generate-bridge-contract.ts --check 2>&1; echo "exit $?";
  echo "== check:bridge-contract:fixtures"; node_modules/.bin/vite-node scripts/generate-bridge-contract-fixtures.ts --check 2>&1; echo "exit $?"; } > "$X/m2-generate.txt"
log "generator: $(/usr/bin/grep -E '^(==|exit)' "$X/m2-generate.txt" | tr '\n' ' ')"
log "core start"
PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project core --no-cache $(cat "$X/core-list.txt") > "$X/m2-core.txt" 2>&1
log "core exit $?; $(/usr/bin/grep -aE '^ +Tests ' "$X/m2-core.txt" | tr -s ' ')"
PATH="$R/.venv/bin:$PATH" node_modules/.bin/vitest run --project ui --no-cache > "$X/m2-ui.txt" 2>&1
log "ui exit $?; $(/usr/bin/grep -aE '^ +Tests ' "$X/m2-ui.txt" | tr -s ' ')"
node_modules/.bin/vitest run --config src/harness/d16/vitest.d16.config.ts --no-cache --reporter=default --reporter=json --outputFile.json="$X/m2-d16.json" > "$X/m2-d16.txt" 2>&1
log "d16 exit $?; $(/usr/bin/grep -aE '^ +Tests ' "$X/m2-d16.txt" | tr -s ' ')"
log "tree status: [$(git status --porcelain | tr '\n' ' ')]"
log "end"
