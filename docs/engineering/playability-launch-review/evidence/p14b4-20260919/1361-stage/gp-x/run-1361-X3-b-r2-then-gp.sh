#!/usr/bin/env bash
# 1361-F5: dry-run p15a1-b-r2 with run-1361-X.sh (label r3b; the tree checked out at the tag, detached), return the
# tree to the ref it started on, then run G-P on p15a1-b-r2 (run-1361-gp.sh, default roots line). Run alone under
# lane-run.sh. A versioned new file; neither called script is edited.
set -u
P=/Users/zacheryspector/studio-scratch/1361-prod
START=$(git -C "$P/tree" symbolic-ref -q --short HEAD || git -C "$P/tree" rev-parse HEAD)
[ -z "$(git -C "$P/tree" status --porcelain)" ] || { echo "STOP: the writer's tree is dirty"; exit 3; }
git -C "$P/tree" checkout -q p15a1-b-r2 || { echo "STOP: checkout p15a1-b-r2 failed"; exit 3; }
bash "$P/run-1361-X.sh" p15a1-b-r2 r3b; echo "X r3b exit $?"
git -C "$P/tree" checkout -q "$START" && echo "tree back on $START at $(git -C "$P/tree" rev-parse --short HEAD)"
bash /Users/zacheryspector/studio-scratch/1361-gp/run-1361-gp.sh p15a1-b-r2; echo "G-P exit $?"
