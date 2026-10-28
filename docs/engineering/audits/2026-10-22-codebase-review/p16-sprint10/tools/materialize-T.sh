#!/bin/bash
# Materialize sparse-excluded TRACKED files from HEAD without changing HEAD, index content or sparse patterns.
# usage: bash materialize.sh <path-prefix>...   (run only when no lane is active; tree must stay clean)
set -u
X=/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt
G=(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks -C "$X")
[ ! -e /Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK ] || { echo 'STOP: lane active'; exit 9; }
[ -z "$("${G[@]}" status --porcelain)" ] || { echo 'STOP: tree not clean'; exit 9; }
n=0
for pre in "$@"; do
  while IFS=$'\t' read -r meta path; do
    blob=$(echo "$meta" | awk '{print $3}')
    mkdir -p "$X/$(dirname "$path")"
    "${G[@]}" cat-file -p "$blob" > "$X/$path" || { echo "STOP: cat-file failed $path"; exit 9; }
    [ "$(echo "$meta" | awk '{print $2}')" = 100755 ] && chmod 755 "$X/$path"
    "${G[@]}" update-index --no-skip-worktree -- "$path" || { echo "STOP: update-index failed $path"; exit 9; }
    n=$((n+1))
  done < <("${G[@]}" ls-files -s -v "$pre" | awk -F'\t' '$1 ~ /^S/ {print $1"\t"$2}')
done
echo "materialized $n files"
echo "status: [$("${G[@]}" status --porcelain)]"
"${G[@]}" diff --stat HEAD | tail -1
