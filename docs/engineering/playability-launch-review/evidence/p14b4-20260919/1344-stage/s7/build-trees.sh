#!/usr/bin/env bash
# 1344-s7: build the two scratch trees for the §7 verification. NOT RUN by the author; RUNBOOK.md step 1.
# usage: bash build-trees.sh <landed-candidate-sha>
#
#   tree      git archive of the candidate (the 1327-C path list: src bridge ui generated scripts package*.json
#             tsconfig*.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md, plus tests without fixtures)
#   old-tree  the same archive with src and generated taken from ff803032 instead (1338's sourceSha; its src and
#             generated equal 133aca7a's, the source 1329 measured). Tests, configs and the probes match the candidate.
# Both link docs, node_modules, art, tools and tests/fixtures into the real repository with ln -sfn, never copy them,
# and get a scratch git commit so `git status` can show stray writes. Read-only on the real repository: the only
# writes are under /Users/zacheryspector/studio-scratch/1344-s7/.
set -euo pipefail

REPO=/Users/zacheryspector/The-Movies-headless-program
K=/Users/zacheryspector/studio-scratch/1344-s7
T=$K/tree
O=$K/old-tree
OUT=$K/out
OLD_SRC=ff803032
KIT_BASE=9fc79624   # the HEAD this kit was written against
SRC1329=133aca7a    # the source 1329-A measured

fail() { echo "build-trees: $*" >&2; exit 1; }
[ $# -eq 1 ] || fail "usage: build-trees.sh <landed-candidate-sha>"
C_SHA=$(git -C "$REPO" rev-parse --verify "$1^{commit}") || fail "not a commit: $1"
[ -e "$T" ] && fail "$T exists; remove it first (RUNBOOK step 12)"
[ -e "$O" ] && fail "$O exists; remove it first (RUNBOOK step 12)"

# The candidate carries the law, and its src equals the kit's base (the sweep changes tests only, 1344-N).
# grep -c reads its whole input, so pipefail never sees a SIGPIPE from git show.
git -C "$REPO" show "$C_SHA:src/core/hollywoodTick.ts" | grep -c "kind:'screenplayShelved'" > /dev/null || fail "$C_SHA has no shelving law in hollywoodTick.ts"
if ! git -C "$REPO" diff --quiet "$KIT_BASE" "$C_SHA" -- src generated; then
  git -C "$REPO" diff --stat "$KIT_BASE" "$C_SHA" -- src generated >&2
  fail "src or generated moved since $KIT_BASE: the comparisons assume shelving is the only behavioural change over $OLD_SRC (NOTES.md item 15). Stop and review."
fi
# The old source is the one 1329 measured.
git -C "$REPO" diff --quiet "$SRC1329" "$OLD_SRC" -- src generated || fail "$OLD_SRC src or generated differs from $SRC1329"

KEEP="bridge ui scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md tests"
build() { # build <dir> <src-commit>
  local dir=$1 src=$2
  mkdir -p "$dir"
  # shellcheck disable=SC2086
  git -C "$REPO" archive --format=tar "$C_SHA" -- $KEEP | tar -x -f - -C "$dir" --exclude 'tests/fixtures' --exclude 'tests/fixtures/*'
  git -C "$REPO" archive --format=tar "$src" -- src generated | tar -x -f - -C "$dir"
  [ ! -e "$dir/tests/fixtures" ] || fail "tests/fixtures was extracted into $dir"
  for d in docs node_modules art tools; do
    [ ! -e "$dir/$d" ] || fail "$dir/$d exists before linking"
    ln -sfn "$REPO/$d" "$dir/$d"
  done
  ln -sfn "$REPO/tests/fixtures" "$dir/tests/fixtures"
  for d in docs node_modules art tools tests/fixtures; do
    [ "$(readlink "$dir/$d")" = "$REPO/$d" ] || fail "$dir/$d does not link to $REPO/$d"
  done
  git -C "$dir" init -q
  git -C "$dir" add -A
  git -C "$dir" -c user.name='1344-s7 scratch' -c user.email=scratch@localhost commit -q -m "base: $C_SHA with src+generated from $src"
}
build "$T" "$C_SHA"
build "$O" "$OLD_SRC"

# Checks: each tree's src is its commit's; the old src has no law; tests and configs are the candidate's in both.
for f in src/core/hollywoodTick.ts src/core/hollywoodPolicy.ts src/core/save.ts; do
  cmp -s <(git -C "$REPO" show "$C_SHA:$f") "$T/$f" || fail "$T/$f is not $C_SHA's"
  cmp -s <(git -C "$REPO" show "$OLD_SRC:$f") "$O/$f" || fail "$O/$f is not $OLD_SRC's"
done
if grep -q screenplayShelving "$O/src/core/hollywoodTick.ts"; then fail "the old src carries shelving"; fi
for f in tests/p14d1-rival-shelving.test.ts tests/acceptance-corpus.test.ts vitest.workspace.ts vitest.config.ts package.json; do
  cmp -s "$T/$f" "$O/$f" || fail "$f differs between the trees"
done

mkdir -p "$OUT"
[ -e "$OUT/trees.txt" ] && fail "$OUT/trees.txt exists"
{
  echo "candidate $C_SHA src-tree $(git -C "$REPO" rev-parse "$C_SHA:src") -> $T ($(git -C "$T" rev-parse --short HEAD))"
  echo "old src $OLD_SRC src-tree $(git -C "$REPO" rev-parse "$OLD_SRC:src") (equal to $SRC1329), tests and configs from $C_SHA -> $O ($(git -C "$O" rev-parse --short HEAD))"
  echo "src and generated unchanged since $KIT_BASE: yes"
} | tee "$OUT/trees.txt"
