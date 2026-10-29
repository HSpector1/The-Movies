#!/bin/bash
# Measure tests/bridge-runtime-checkpoint-prepared-reuse alone: current tree vs 843a492d (before Batch 5).
export PATH="/usr/local/bin:$PATH"
W=/Users/zacheryspector/The-Movies-headless-program
S=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
cd "$W" || exit 9
echo "node $(node --version) at $(date '+%F %T'); HEAD $($G rev-parse --short HEAD)"
t0=$(date +%s); echo "=== BEGIN now"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/measure-prepared-reuse-now.json" tests/bridge-runtime-checkpoint-prepared-reuse.test.ts 2>&1 | /usr/bin/grep -E "✓|×|Tests  " | cut -c1-160
echo "=== END now elapsed=$(( $(date +%s) - t0 ))s"
WT="$S/wt-pre5"; rm -rf "$WT"
$G -C "$W" worktree add --detach "$WT" 843a492d >/dev/null 2>&1 || { echo "worktree add failed"; exit 0; }
ln -s "$W/node_modules" "$WT/node_modules"
t0=$(date +%s); echo "=== BEGIN pre-batch5 (843a492d)"
(cd "$WT" && npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/measure-prepared-reuse-pre5.json" tests/bridge-runtime-checkpoint-prepared-reuse.test.ts 2>&1 | /usr/bin/grep -E "✓|×|Tests  " | cut -c1-160)
echo "=== END pre-batch5 elapsed=$(( $(date +%s) - t0 ))s"
rm -f "$WT/node_modules"; $G -C "$W" worktree remove --force "$WT"; $G -C "$W" worktree prune; echo "=== worktree removed"
