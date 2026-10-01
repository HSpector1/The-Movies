#!/usr/bin/env bash
# 1344-C5 r2, work unit r2d, revision 2: build the old-source scratch tree for the rows 8-11 probe (promise-148, S10).
# NOT RUN by the author. The parent runs it once, at r2d RUNBOOK-r2.md step 2, with no other vitest running.
# It differs from probes/build-old-tree.sh (reviewed in 1344-D7) only in these header comments and in two fail messages,
# which now name RUNBOOK-r2.
#
# The recipe of 1344-stage/s10/probes-r2/build-old-tree.sh (1344-D6: CONFIRMED; it ran at 17:16 on 2026-10-01), with its own
# OLD and OUT and this probe's file checks. The tree is `git archive ff803032 src generated` (the 1338 run's source; its src
# tree is 347cfcce) plus the merge tree's committed tests, bridge, ui and configs. ui is included because
# vitest.workspace.ts declares the ui project. The merge tree's tracked symlinks (art, docs, node_modules, tools,
# tests/fixtures) come out of the archive as the same absolute symlinks into the real repository; nothing under them is
# copied or written. Read-only on the repository and the merge tree: the only writes are the new directory OLD and one line
# under OUT.
set -euo pipefail

REPO=/Users/zacheryspector/The-Movies-headless-program
MERGE=/Users/zacheryspector/studio-scratch/1344-merge/tree
OLD=/Users/zacheryspector/studio-scratch/1344-r2/r2d/old-tree
OUT=/Users/zacheryspector/studio-scratch/1344-r2/r2d/out
OLD_SRC=ff803032
OLD_SRC_TREE=347cfcce5602570eaa39137e6490d7e6fa0228eb

fail() { echo "build-old-tree (r2d): $*" >&2; exit 1; }

[ -e "$OLD" ] && fail "$OLD already exists; remove it first (RUNBOOK-r2 step 5)"
[ -d "$OUT" ] || fail "$OUT is missing; run RUNBOOK-r2 steps 0 and 1 first"
[ "$(git -C "$REPO" rev-parse "$OLD_SRC:src")" = "$OLD_SRC_TREE" ] || fail "$OLD_SRC:src is not $OLD_SRC_TREE"

# The archive must equal what the head run saw: the merge tree clean apart from dist/ (no zz-s10 copy left behind).
dirty=$(git -C "$MERGE" status --porcelain | grep -v '^?? dist/$' || true)
[ -z "$dirty" ] || fail "merge tree is not clean apart from dist/:
$dirty"
MERGE_HEAD=$(git -C "$MERGE" rev-parse HEAD)

mkdir -p "$OLD"
git -C "$MERGE" archive --format=tar "$MERGE_HEAD" -- \
  tests bridge ui package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json \
  vitest.config.ts vitest.workspace.ts art docs node_modules tools \
  | tar -x -C "$OLD"
git -C "$REPO" archive --format=tar "$OLD_SRC" -- src generated | tar -x -C "$OLD"

# Checks: links point into the real repository; the chain's source files are the 1338 source; the copied test files on the
# probe's module graph are the merge tree's.
[ "$(readlink "$OLD/node_modules")" = "$REPO/node_modules" ] || fail "node_modules link"
[ "$(readlink "$OLD/tests/fixtures")" = "$REPO/tests/fixtures" ] || fail "tests/fixtures link"
for f in src/core/hollywoodTick.ts src/core/save.ts src/core/tick.ts src/core/promises.ts src/harness/p13a/fixtures.ts; do
  cmp -s <(git -C "$REPO" show "$OLD_SRC:$f") "$OLD/$f" || fail "$f is not $OLD_SRC's"
done
if grep -q screenplayShelving "$OLD/src/core/hollywoodTick.ts"; then fail "the old src carries shelving"; fi
for f in tests/p14c2c-rival-promises.test.ts tests/helpers/p14c2c-fixtures.ts tests/helpers/p14c2b-fixtures.ts \
         tests/helpers/p14b2-fixtures.ts vitest.workspace.ts vitest.config.ts package.json; do
  cmp -s "$MERGE/$f" "$OLD/$f" || fail "$f differs from the merge tree"
done

echo "old tree $OLD: src+generated from $OLD_SRC (src tree $OLD_SRC_TREE); tests, bridge, ui, configs from merge $MERGE_HEAD" \
  | tee "$OUT/old-tree-build.txt"
