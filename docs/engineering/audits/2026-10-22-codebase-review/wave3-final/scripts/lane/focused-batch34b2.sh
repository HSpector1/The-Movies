#!/bin/bash
export PATH="/usr/local/bin:$PATH"
W=/Users/zacheryspector/The-Movies-headless-program
S=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts
cd "$W" || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN typecheck"; npm run -s typecheck; echo "=== END typecheck exit=$? elapsed=$(( $(date +%s) - t0 ))s"
cd tests || exit 9
FILES=$(ls stabilization-l0*.test.ts stabilization-l14-l15-money-admission.test.ts stabilization-facilities-cancellation-seam.test.ts actions.test.ts p13b-s3-*.test.ts p13b-s4-*.test.ts p13b-s5-*.test.ts p13b-s6-*.test.ts p13b-s7-*.test.ts facility-*.test.ts placement-*.test.ts c1-m6-*.test.ts p15b4-*.test.ts p13a-research-identity*.test.ts *physical-plan*.test.ts *production-queue*.test.ts p14c2b-*.test.ts talent-market*.test.ts p14b4-production-admission.test.ts p14c3-profession-history.test.ts p14c3-save-v38.test.ts casting-*.test.ts contracts/determinism-floor.contract.test.ts 2>/dev/null | sort -u | sed 's|^|tests/|')
cd .. || exit 9
echo "files: $(echo "$FILES" | wc -l | tr -d ' ')"
t0=$(date +%s); echo "=== BEGIN vitest focused"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch34b-r2.json" $FILES
echo "=== END vitest focused exit=$? elapsed=$(( $(date +%s) - t0 ))s"
echo "=== BEGIN red run at parent 53a9b4d6 (worktree)"
WT="$S/wt-parent"; rm -rf "$WT"
git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks -C "$W" worktree add --detach "$WT" 53a9b4d601c17fbaf2bb14ac33db4a7fe7a30b80 >/dev/null 2>&1 || { echo "worktree add failed"; exit 0; }
ln -s "$W/node_modules" "$WT/node_modules"
cp "$W/tests/stabilization-l02-casting-save-path.test.ts" "$WT/tests/"; cp "$W/tests/helpers/stabilization-staffing.ts" "$WT/tests/helpers/"
(cd "$WT" && npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/red-run-parent-save-path.json" tests/stabilization-l02-casting-save-path.test.ts)
echo "=== END red run exit=$?"
rm -f "$WT/node_modules"; git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks -C "$W" worktree remove --force "$WT"; git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks -C "$W" worktree prune
echo "=== worktree removed"
