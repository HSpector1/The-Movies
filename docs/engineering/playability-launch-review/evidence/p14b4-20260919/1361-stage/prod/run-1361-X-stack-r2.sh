#!/usr/bin/env bash
# Dry-runs the P15A.1 r1 stack on slice 2a r2 (1361-F3): p15a1-c-r1, then p15a1-b-r1, then p15a2-r2, each with
# run-1361-X.sh in the writer's tree (checked out at the tag, detached), then returns the tree to main. Run alone
# under lane-run.sh. A versioned new file; run-1361-X.sh itself is unchanged.
set -u
P=/Users/zacheryspector/studio-scratch/1361-prod
for pair in "p15a1-c-r1 r2c" "p15a1-b-r1 r2b" "p15a2-r2 r2s"; do
  set -- $pair
  git -C "$P/tree" checkout -q "$1" || { echo "checkout $1 failed"; exit 3; }
  bash "$P/run-1361-X.sh" "$1" "$2"
done
git -C "$P/tree" checkout -q main && echo "tree back on main at $(git -C "$P/tree" rev-parse --short HEAD)"
