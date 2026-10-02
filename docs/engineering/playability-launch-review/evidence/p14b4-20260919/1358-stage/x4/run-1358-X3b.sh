#!/usr/bin/env bash
# 1358-X3b (record 1358-X4): parent run of slice B RED r8 (1358-C8: r7 plus three save-v44 leaves and one anchor assertion) at HEAD, per 1358-F5, F6 and F8. Run under lane-run.sh.
# usage: run-1358-X3b.sh <staged r8 patch> <its sha256>
# Same tree as 1358-X3: tests/fixtures is a REAL directory of links to the repository's entries, except p14, which is
# a real directory of links to the repository's p14 entries plus a real genuine-v43-pre-romance/ holding 1358-X2's
# dry-run capture (copied). Nothing is written under a link. r6's producer hunk is byte-identical to r5's (the parent
# compared the two patches file by file), and 1358-X3 showed that hunk reproduces X2's capture byte for byte, so this
# run does not run the producer.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
X=/Users/zacheryspector/studio-scratch/1358-x3b
T=$X/tree
CAP=/Users/zacheryspector/studio-scratch/1358-x2/ptree/tests/fixtures/p14/genuine-v43-pre-romance
B6=$1 B6SHA=$2
BASE=$(git -C "$R" rev-parse HEAD)
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ "$(shasum -a 256 "$B6" | cut -c1-64)" = "$B6SHA" ] || { echo "r6 patch hash differs"; exit 2; }
[ -d "$CAP" ] || { echo "missing X2 capture $CAP"; exit 2; }
[ -e "$T" ] && { echo "$T exists"; exit 2; }
[ -e "$R/tests/fixtures/p14/genuine-v43-pre-romance" ] && { echo "the repository already holds the capture; the layering is moot"; exit 2; }
ls "$X"/*.txt >/dev/null 2>&1 && { echo "outputs exist in $X"; exit 2; }
git -C "$R" diff --quiet b0809602 "$BASE" -- src generated || { echo "src moved since b0809602"; exit 2; }
echo "node $(node --version), base $BASE"
mkdir -p "$T" && cd "$R" || exit 2
git archive "$BASE" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T"
git archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$T"
for d in docs node_modules art tools; do ln -sfn "$R/$d" "$T/$d"; done
mkdir "$T/tests/fixtures"
for e in "$R"/tests/fixtures/*; do n=$(basename "$e"); [ "$n" = p14 ] || ln -s "$e" "$T/tests/fixtures/$n"; done
mkdir "$T/tests/fixtures/p14"
for e in "$R"/tests/fixtures/p14/*; do ln -s "$e" "$T/tests/fixtures/p14/$(basename "$e")"; done
mkdir "$T/tests/fixtures/p14/genuine-v43-pre-romance"
cp "$CAP"/* "$T/tests/fixtures/p14/genuine-v43-pre-romance/"
echo "capture: $(ls "$T/tests/fixtures/p14/genuine-v43-pre-romance" | tr '\n' ' ')"
cd "$T" && git init -q && git add -A . && git commit -q -m "base $BASE (fixtures layered, X2 capture)"
git apply --index --include='tests/*' "$B6" && git commit -q -m slice-b-red-r6-tests || { echo "R6 APPLY FAILED"; exit 1; }
echo "r6 tests applied: $(git diff --stat HEAD~1 HEAD | tail -1)"
V="--project core --no-cache --reporter=verbose --reporter=json"
SLICEB="tests/p14b10-competitions-log.test.ts tests/p14b10-labels.test.ts tests/p14b10-save-v44.test.ts tests/bridge-p14b10-relationship-labels.test.ts tests/p14b10-romance.test.ts tests/p14b5-relationships.test.ts"
date '+x3b-red-sliceB start %H:%M:%S'
node_modules/.bin/vitest run $V --outputFile.json="$X/x3b-red-sliceB.json" $SLICEB > "$X/x3b-red-sliceB.txt" 2>&1; echo "x3b-red-sliceB exit $?"
{ for p in tsconfig.json ui/tsconfig.json tsconfig.bridge.json; do echo "== $p"; node_modules/.bin/tsc -p $p --noEmit 2>&1; echo "exit $?"; done; } > "$X/x3b-red-sliceB-tsc.txt"
echo "tsc: $(grep -E '^(==|exit)' "$X/x3b-red-sliceB-tsc.txt" | tr '\n' ' ')"
echo "tree status: [$(git status --porcelain | tr '\n' ' ')]"
date '+done %H:%M:%S'
grep -E 'Test Files|Tests ' "$X/x3b-red-sliceB.txt"
