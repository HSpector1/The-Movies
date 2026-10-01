#!/usr/bin/env bash
# 1344-C5 S10 r2: build the old-source scratch tree for the row 1 and rows 2-4 probes (1344-D5 section 3).
# NOT RUN by the author. The parent runs it once, at RUNBOOK.md step 4, after x2 has ended and before x3.
#
# The tree is `git archive ff803032 src generated` (the 1338 run's source; its src tree is 347cfcce, the tree 1332-A
# used) plus the merge tree's committed tests, bridge, ui and configs. ui is included because vitest.workspace.ts
# declares the ui project. The merge tree's tracked symlinks (art, docs, node_modules, tools, tests/fixtures) come out
# of the archive as the same absolute symlinks into the real repository; nothing under them is copied or written.
# Read-only on the repository and the merge tree: the only writes are the new directory OLD and one line under OUT.
set -euo pipefail

REPO=/Users/zacheryspector/The-Movies-headless-program
MERGE=/Users/zacheryspector/studio-scratch/1344-merge/tree
OLD=/Users/zacheryspector/studio-scratch/1344-sweep/s10/old-tree
OUT=/Users/zacheryspector/studio-scratch/1344-sweep/s10/out
OLD_SRC=ff803032
OLD_SRC_TREE=347cfcce5602570eaa39137e6490d7e6fa0228eb

fail() { echo "build-old-tree: $*" >&2; exit 1; }

[ -e "$OLD" ] && fail "$OLD already exists; remove it first (RUNBOOK step 8)"
[ "$(git -C "$REPO" rev-parse "$OLD_SRC:src")" = "$OLD_SRC_TREE" ] || fail "$OLD_SRC:src is not $OLD_SRC_TREE"

# The archive must equal what the head runs see: the merge tree clean apart from dist/ (no zz-s10 copy left behind).
dirty=$(git -C "$MERGE" status --porcelain | grep -v '^?? dist/$' || true)
[ -z "$dirty" ] || fail "merge tree is not clean apart from dist/:
$dirty"
MERGE_HEAD=$(git -C "$MERGE" rev-parse HEAD)

mkdir -p "$OLD" "$OUT"
git -C "$MERGE" archive --format=tar "$MERGE_HEAD" -- \
  tests bridge ui package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json \
  vitest.config.ts vitest.workspace.ts art docs node_modules tools \
  | tar -x -C "$OLD"
git -C "$REPO" archive --format=tar "$OLD_SRC" -- src generated | tar -x -C "$OLD"

# Checks: links point into the real repository; src is the 1338 source; the copied test files are the merge tree's.
[ "$(readlink "$OLD/node_modules")" = "$REPO/node_modules" ] || fail "node_modules link"
[ "$(readlink "$OLD/tests/fixtures")" = "$REPO/tests/fixtures" ] || fail "tests/fixtures link"
cmp -s <(git -C "$REPO" show "$OLD_SRC:src/core/hollywoodTick.ts") "$OLD/src/core/hollywoodTick.ts" || fail "src/core/hollywoodTick.ts is not $OLD_SRC's"
cmp -s <(git -C "$REPO" show "$OLD_SRC:src/core/save.ts") "$OLD/src/core/save.ts" || fail "src/core/save.ts is not $OLD_SRC's"
if grep -q screenplayShelving "$OLD/src/core/hollywoodTick.ts"; then fail "the old src carries shelving"; fi
for f in tests/p14b4-rival-seating-preference.test.ts tests/bridge-p14b5-relationships.test.ts tests/helpers/p14b2-fixtures.ts \
         vitest.workspace.ts vitest.config.ts package.json; do
  cmp -s "$MERGE/$f" "$OLD/$f" || fail "$f differs from the merge tree"
done

echo "old tree $OLD: src+generated from $OLD_SRC (src tree $OLD_SRC_TREE); tests, bridge, ui, configs from merge $MERGE_HEAD" \
  | tee "$OUT/old-tree-build.txt"
