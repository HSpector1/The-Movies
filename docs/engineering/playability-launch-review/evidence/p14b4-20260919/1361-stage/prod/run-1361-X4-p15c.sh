#!/usr/bin/env bash
# 1361-X4: the parent's dry run of P15C's production (1361-E3). Run alone under lane-run.sh. A versioned new file; the
# scripts it calls are unchanged. (1) run-1361-X.sh on p15c-c-r1, p15c-b-r1, p15c-a-r1 in the writer's tree (checked
# out at each tag, detached), then the tree back on its branch; (2) the d16 suite on an archive of p15c-c-r1;
# (3) the sibling patch r2 applied in a separate archive tree of p15c-c-r1 (fixtures as a real dir of links), its file run.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
E=$R/docs/engineering/playability-launch-review/evidence/p14b4-20260919
P=/Users/zacheryspector/studio-scratch/1361-prod
T=$P/tree
START=$(git -C "$T" symbolic-ref -q --short HEAD || git -C "$T" rev-parse HEAD)
[ -z "$(git -C "$T" status --porcelain)" ] || { echo "STOP: the writer's tree is dirty"; exit 3; }
for pair in "p15c-c-r1 pcc" "p15c-b-r1 pcb" "p15c-a-r1 pca"; do
  set -- $pair
  git -C "$T" checkout -q "$1" || { echo "STOP: checkout $1 failed"; exit 3; }
  bash "$P/run-1361-X.sh" "$1" "$2"; echo "X $2 exit $?"
done
git -C "$T" checkout -q "$START" && echo "tree back on $START at $(git -C "$T" rev-parse --short HEAD)"
bash /Users/zacheryspector/studio-scratch/1361-d16/run-d16.sh p15c-c-r1 p15c-c; echo "d16 p15c-c exit $?"
S=/Users/zacheryspector/studio-scratch/1361-sibling/run
[ -e "$S" ] && { echo "STOP: $S exists"; exit 2; }
mkdir -p "$S/tree" "$S/out" || exit 2
git -C "$T" archive p15c-c-r1 | tar -x -C "$S/tree" || { echo "STOP: archive failed"; exit 2; }
for d in node_modules art tools; do ln -s "$R/$d" "$S/tree/$d"; done
mkdir -p "$S/tree/tests/fixtures" && for e in "$R"/tests/fixtures/*; do b=$(basename "$e"); [ "$b" = bridge-contract-union-fixtures.ts ] || ln -s "$e" "$S/tree/tests/fixtures/$b"; done
cp "$R/tests/fixtures/bridge-contract-union-fixtures.ts" "$S/tree/tests/fixtures/" || exit 2
(cd "$S/tree" && git apply "$E/1359-stage/1359-p15c-wave2-sibling-r2.patch") || { echo "STOP: the sibling patch does not apply on p15c-c-r1"; exit 3; }
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
echo "sibling: p15c-c-r1 $(git -C "$T" rev-parse p15c-c-r1) + sibling-r2, node $(node --version), start $(date '+%Y-%m-%d %H:%M:%S %Z')" > "$S/out/run.meta"
(cd "$S/tree" && ./node_modules/.bin/vitest run --project core --no-cache --reporter=default --reporter=json --outputFile.json="$S/out/sibling.json" tests/p15c2-campaign-legacy-sibling.test.ts > "$S/out/sibling.txt" 2>&1); rc=$?
echo "sibling: vitest exit $rc; $(/usr/bin/grep -E '^ +Tests ' "$S/out/sibling.txt" | tail -1); end $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$S/out/run.meta"
echo "sibling exit $rc"
