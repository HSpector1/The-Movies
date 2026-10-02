#!/usr/bin/env bash
# 1360-X: the P15 Wave 2 RED landing replayed in scratch on the Save44 HEAD (1360-F ruling 5), in 1360-F's order:
# 1356 RED; 1355 RED (merged P15_ROOTS) with its producer; 1355-P in mint mode; the capture sha pin; 1359 RED r8
# (merged P15_ROOTS) with its producer; 1359-P; each RED's files at the point its recorded RED will run; 1356 again after
# the mints; the root type gate. Not a mint: nothing is written to the repository (1360-F ruling 6).
# Layout: a fresh tree from a repository archive; node_modules, art and tools linked; tests/fixtures and the E directory
# real directories of per-entry links; the producers copied into the tree's E as real files; the captures written to the
# tree's real tests/fixtures/p15. Heavy lane: run alone under lane-run.sh. The parent removes the tree afterwards.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
EREL=docs/engineering/playability-launch-review/evidence/p14b4-20260919
E=$R/$EREL
X=/Users/zacheryspector/studio-scratch/1360-x
T=$X/tree
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
log() { echo "$1; $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/run.meta"; }
stop() { log "STOP: $1"; exit 3; }
[ -e "$T" ] && stop "tree exists"
check() { [ "$(shasum -a 256 "$1" | cut -c1-64)" = "$2" ] || stop "$1 hash differs"; }
P1356=$E/1356-stage/1356-p15a2-wave2-red-r4.patch;          check "$P1356" 32397525d8c178eab61de834af08c1b2936f530e594cb144053d9bde710bf8f1
P1355=$E/1355-stage/1355-p15a1-wave2-red-r4.patch;          check "$P1355" 2092c19874aa08af2d54301e9a56ad20b04c517d7ce769ef155efd5c20c5a686
P1359=$E/1359-stage/1359-p15c-wave2-red-r8.patch;           check "$P1359" 2a5df9771b2c77388e8d756a77323f6acb9cea8c55bf7eef26b984120520616b
PR1355=$E/1355-stage/1355-P-p15a1-market-producer-r3.ts;    check "$PR1355" 5007e231468ad566d7c69fe45b78261270550bbc1c9c8ad7c488c2b3e8ba5707
PR1359=$E/1359-stage/1359-P-p15c2-route-l-producer-r4.ts;   check "$PR1359" 78c1d1055973dfd98479f511140d9ec44978639b83ae27e6389ffb55ada35186
BASE=$(git -C "$R" rev-parse HEAD)
log "start at $BASE, node $(node --version)"
mkdir -p "$T"
git -C "$R" archive "$BASE" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T"
git -C "$R" archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$T"
for d in node_modules art tools; do ln -s "$R/$d" "$T/$d"; done
mkdir -p "$T/tests/fixtures" && for e in "$R"/tests/fixtures/*; do ln -s "$e" "$T/tests/fixtures/$(basename "$e")"; done
[ -e "$T/tests/fixtures/p15" ] && stop "tests/fixtures/p15 exists in the repository; the captures would land under a link"
mkdir -p "$T/$EREL" && for e in "$E"/*; do ln -s "$e" "$T/$EREL/$(basename "$e")"; done
cd "$T" || exit 2
G() { git -c user.name=parent -c user.email=parent@local "$@"; }
G init -q && G add -A . && G commit -q -m "base $BASE" || stop "base commit"
V="--project core --no-cache --reporter=default --reporter=json"
F1356="tests/p15a2-power-ranking-archive.test.ts tests/p15a2-power-ranking-archive-isolation.test.ts tests/p15a2-power-ranking-archive-harness.test.ts"
F1355="tests/p15a1-market-integration.test.ts tests/p15a1-market-integration-phases.test.ts tests/p15a1-market-integration-atomicity.test.ts"
F1359="tests/p15c2-campaign-legacy-integration.test.ts tests/p15c-wave-r-retention.test.ts tests/p15c1-campaign-legacy.test.ts"
run() { local label=$1; shift
  node_modules/.bin/vitest run $V --outputFile.json="$X/$label.json" "$@" > "$X/$label.txt" 2>&1; local v=$?
  log "$label: vitest exit $v; $(grep -aE '^ +Tests ' "$X/$label.txt" | tr -s ' ')"; }
roots() { python3 - "$1" <<'PY' || stop "roots edit"
import sys
p = 'tests/helpers/p15-roots.ts'
lines = open(p).read().split('\n')
assert lines[9].startswith('export const P15_ROOTS: readonly string[] = '), lines[9]
lines[9] = 'export const P15_ROOTS: readonly string[] = ' + sys.argv[1]
open(p, 'w').write('\n'.join(lines))
PY
}
# 1-2: the 1356 RED and its files (its recorded RED runs here, before any mint)
G apply --index "$P1356" && G commit -q -m "1356 RED r4" || stop "1356 apply"
run s2-1356 $F1356
# 3: the 1355 RED with the merged list and its producer
G apply --index --exclude=tests/helpers/p15-roots.ts "$P1355" || stop "1355 apply"
roots "['p15Sequence', 'powerRanking', 'sharedMarket']"
cp "$PR1355" "$EREL/1355-P-p15a1-market-producer.ts"
G add -A tests "$EREL/1355-P-p15a1-market-producer.ts" && G commit -q -m "1355 RED r4, merged P15_ROOTS, producer" || stop "1355 commit"
log "s3 roots: $(sed -n 10p tests/helpers/p15-roots.ts)"
# 4: the 1355 mint (mint mode)
P15A1_PRODUCER_HEAD=$(git rev-parse HEAD) P15A1_CAPTURE_MODE=mint node_modules/.bin/vite-node "$EREL/1355-P-p15a1-market-producer.ts" > "$X/s4-1355-mint.txt" 2>&1; m=$?
log "s4 1355 mint exit $m"; [ $m = 0 ] || stop "1355 mint failed"
# 5: the fixture commit with the capture sha pin
SHA=$(shasum -a 256 tests/fixtures/p15/genuine-below-p15-save-step/MANIFEST.json | cut -c1-64)
python3 - "$SHA" <<'PY' || stop "sha pin"
import sys
p = 'tests/p15a1-market-integration.test.ts'
t = open(p).read()
a = 'const CAPTURE_MANIFEST_SHA256: string | null = null'
assert t.count(a) == 1
open(p, 'w').write(t.replace(a, "const CAPTURE_MANIFEST_SHA256: string | null = '" + sys.argv[1] + "'"))
PY
G add -A tests && G commit -q -m "1355 fixtures and capture sha pin" || stop "1355 fixture commit"
log "s5 capture MANIFEST sha256 $SHA"
# 6: the 1355 files (its recorded RED runs here)
run s6-1355 $F1355
# 7: the 1359 RED r8 with the merged list and its producer
G apply --index --exclude=tests/helpers/p15-roots.ts "$P1359" || stop "1359 apply"
roots "['p15Sequence', 'powerRanking', 'sharedMarket', 'campaignLegacy']"
cp "$PR1359" "$EREL/1359-P-p15c2-route-l-producer.ts"
G add -A tests "$EREL/1359-P-p15c2-route-l-producer.ts" && G commit -q -m "1359 RED r8, merged P15_ROOTS, producer" || stop "1359 commit"
log "s7 roots: $(sed -n 10p tests/helpers/p15-roots.ts)"
# 8-9: the 1359 mint and its fixture commit
P15C2_PRODUCER_HEAD=$(git rev-parse HEAD) node_modules/.bin/vite-node "$EREL/1359-P-p15c2-route-l-producer.ts" > "$X/s8-1359-mint.txt" 2>&1; m=$?
log "s8 1359 mint exit $m"; [ $m = 0 ] || stop "1359 mint failed"
G add -A tests && G commit -q -m "1359 fixtures" || stop "1359 fixture commit"
# 10: the 1359 files (its recorded RED runs here)
run s10-1359 $F1359
# after every landing: 1356 again, and the root type gate
run s11-1356-after $F1356
node_modules/.bin/tsc -p tsconfig.json --noEmit > "$X/s12-tsc.txt" 2>&1; t=$?
log "s12 tsc exit $t, $(grep -c 'error TS' "$X/s12-tsc.txt") errors"
G log --format='%h %s' > "$X/tree-log.txt"
log "tree status: [$(git status --porcelain | tr '\n' ' ')]"
log "end"
