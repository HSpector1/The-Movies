#!/usr/bin/env bash
# 1358-X5: parent dry run of slice B production steps 1-4, revision r2 (1358-E, 1358-E2; staged in E/1358-stage) on the landed RED r8, per
# 1358-F7 Next 2. Run under lane-run.sh, after the RED commit and the minted capture are in the repository.
# usage: run-1358-X5.sh <classification json>
# Tree: an archive of HEAD (RED tests landed) with docs, node_modules, art, tools and tests/fixtures linked. Each
# cumulative step patch applies alone on the base commit; after its runs the tree resets to base. Nothing is written
# under a link.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
EREL=docs/engineering/playability-launch-review/evidence/p14b4-20260919
X=/Users/zacheryspector/studio-scratch/1358-x5
T=$X/tree
CLS=$1
BASE=$(git -C "$R" rev-parse HEAD)
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
# bash 3.2 (macOS): no associative arrays; step k's expected sha256 is the k-th word.
SHAS="95d5a5d9083ef56174ae1a8205dfb18565897229b786817456f3ce512442a9a0 eaa026e2cdd071ee21bf0eefd26b618a861e1a7bb0bfa7038fc1abff4a8edd08 510c361bae1b076bbebfe1bbf49c84dd735009705a9fd44014bf90e8956a8c1f 2004b500b8d4be509f82381a0f3ab2022b28732cbe4fd3c0d79c22601c2cb96f"
k=0; for want in $SHAS; do k=$((k+1))
  [ "$(shasum -a 256 "$R/$EREL/1358-stage/1358-rel-sliceB-production-step$k-r2.patch" | cut -c1-64)" = "$want" ] || { echo "step $k patch hash differs"; exit 2; }
done
[ -e "$R/tests/p14b10-romance.test.ts" ] || { echo "the RED has not landed at HEAD"; exit 2; }
[ -d "$R/tests/fixtures/p14/genuine-v43-pre-romance" ] || { echo "the minted capture is not in the repository"; exit 2; }
[ -e "$T" ] && { echo "$T exists"; exit 2; }
ls "$X"/x5-*.txt >/dev/null 2>&1 && { echo "outputs exist in $X"; exit 2; }
echo "node $(node --version), base $BASE"
mkdir -p "$T" && cd "$R" || exit 2
git archive "$BASE" src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C "$T"
git archive "$BASE" tests ':!tests/fixtures' | tar -x -C "$T"
for d in docs node_modules art tools tests/fixtures; do ln -sfn "$R/$d" "$T/$d"; done
cd "$T" && git init -q && git add -A . && git commit -q -m "base $BASE" && git tag base
V="--project core --no-cache --reporter=verbose --reporter=json"
SLICEB="tests/p14b10-competitions-log.test.ts tests/p14b10-labels.test.ts tests/p14b10-save-v44.test.ts tests/bridge-p14b10-relationship-labels.test.ts tests/p14b10-romance.test.ts tests/p14b5-relationships.test.ts"
for k in 1 2 3 4; do
  git apply --index "$R/$EREL/1358-stage/1358-rel-sliceB-production-step$k-r2.patch" && git commit -q -m "step $k" || { echo "STEP $k APPLY FAILED"; exit 1; }
  echo "step $k applied: $(git diff --stat base HEAD | tail -1)"
  date "+step $k vitest start %H:%M:%S"
  node_modules/.bin/vitest run $V --outputFile.json="$X/x5-step$k.json" $SLICEB > "$X/x5-step$k.txt" 2>&1; echo "step $k vitest exit $?"
  { for p in tsconfig.json ui/tsconfig.json tsconfig.bridge.json; do echo "== $p"; node_modules/.bin/tsc -p $p --noEmit 2>&1; echo "exit $?"; done; } > "$X/x5-step$k-tsc.txt"
  echo "step $k tsc: $(grep -E '^(==|exit)' "$X/x5-step$k-tsc.txt" | tr '\n' ' ')"
  if [ "$k" = 4 ]; then
    { echo "== check:bridge-contract"; node_modules/.bin/vite-node scripts/generate-bridge-contract.ts --check 2>&1; echo "exit $?";
      echo "== check:bridge-contract:fixtures"; node_modules/.bin/vite-node scripts/generate-bridge-contract-fixtures.ts --check 2>&1; echo "exit $?"; } > "$X/x5-step4-generate.txt"
    echo "step 4 generator: $(grep -E '^(==|exit)' "$X/x5-step4-generate.txt" | tr '\n' ' ')"
  fi
  python3 "$X/check-steps.py" "$CLS" "$X/x5-step$k.json" "$k" > "$X/x5-step$k-check.txt" 2>&1; echo "step $k check exit $?"
  head -2 "$X/x5-step$k-check.txt"
  echo "tree status after step $k: [$(git status --porcelain | tr '\n' ' ')]"
  git reset -q --hard base
done
date '+done %H:%M:%S'
