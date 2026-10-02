#!/usr/bin/env bash
# 1359-X5: parent dry run of the P15C Wave 2 RED r7 and reference r4 (1359-C6, 1359-C7; under 1353-F6, 1353-F7, 1359-F6).
# Fresh scratch tree from the repo HEAD, the STAGED patches only: RED r7 (tests), then reference r4 (src, over r7).
# No route L capture is minted: C2-C4 stay FIXTURE PENDING. Expected (1359-C6): RED 40 fail, 76 pass over the three
# files (35 integration leaves with r5's messages, the five moved Wave 1 leaves), root type gate exit 0; reference
# 113 pass and C2-C4 FIXTURE PENDING, root type gate exit 2 with 1359-X2's 35 errors.
# Heavy lane: run alone under lane-run.sh. --no-cache: no results file through the link.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
E=$R/docs/engineering/playability-launch-review/evidence/p14b4-20260919
X=/Users/zacheryspector/studio-scratch/1359-x5
T=$X/tree
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ -e "$T" ] && { echo "tree exists; remove it first"; exit 2; }
for f in x5-red.txt x5-ref.txt; do [ -e "$X/$f" ] && { echo "$f exists"; exit 2; }; done
[ "$(shasum -a 256 "$E/1359-stage/1359-p15c-wave2-red-r7.patch" | cut -c1-64)" = e3ccde792ac00b8b7c1bc343e74a1c1c7c2571c71303ea57aff716781463c5a9 ] || { echo "red r7 hash differs"; exit 2; }
[ "$(shasum -a 256 "$E/1359-stage/1359-p15c-wave2-reference-r4.patch" | cut -c1-64)" = 66dc946d83e3b93aa19af6a7ac8f4a9eacef56044b9584e6fd2b3e29905fa025 ] || { echo "reference r4 hash differs"; exit 2; }
mkdir -p "$T" && cd "$R" && BASE=$(git rev-parse HEAD) && echo "base $BASE, node $(node --version)"
git archive "$BASE" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T"
git archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$T"
for d in docs node_modules art tools; do ln -sfn "$R/$d" "$T/$d"; done
ln -sfn "$R/tests/fixtures" "$T/tests/fixtures"
cd "$T" && git init -q && git add -A . && git commit -q -m "base $BASE"
git apply --index "$E/1359-stage/1359-p15c-wave2-red-r7.patch" && git commit -q -m red-r7 || { echo "RED APPLY FAILED"; exit 1; }
F="tests/p15c2-campaign-legacy-integration.test.ts tests/p15c-wave-r-retention.test.ts tests/p15c1-campaign-legacy.test.ts"
V="--project core --no-cache --reporter=verbose --reporter=json"
CLS="$E/1359-stage/1359-p15c-wave2-red-r7-classification.json"
date '+red start %H:%M:%S'
node_modules/.bin/vitest run $V --outputFile.json="$X/x5-red.json" $F > "$X/x5-red.txt" 2>&1; echo "red exit $?"
node_modules/.bin/tsc -p tsconfig.json --noEmit > "$X/x5-red-tsc.txt" 2>&1; echo "red tsc exit $?"
python3 "$X/check-1359.py" "$CLS" "$X/x5-red.json" red > "$X/x5-red-check.txt" 2>&1; echo "red check exit $?"
git apply --index "$E/1359-stage/1359-p15c-wave2-reference-r4.patch" && git commit -q -m ref-r4 || { echo "REFERENCE APPLY FAILED"; exit 1; }
date '+ref start %H:%M:%S'
node_modules/.bin/vitest run $V --outputFile.json="$X/x5-ref.json" $F > "$X/x5-ref.txt" 2>&1; echo "ref exit $?"
node_modules/.bin/tsc -p tsconfig.json --noEmit > "$X/x5-ref-tsc.txt" 2>&1; echo "ref tsc exit $?"
python3 "$X/check-1359.py" "$CLS" "$X/x5-ref.json" ref > "$X/x5-ref-check.txt" 2>&1; echo "ref check exit $?"
echo "tree status: [$(git status --porcelain | tr '\n' ' ')]"
date '+done %H:%M:%S'
grep -E 'Test Files|Tests ' "$X/x5-red.txt" "$X/x5-ref.txt"
head -2 "$X/x5-red-check.txt" "$X/x5-ref-check.txt"
