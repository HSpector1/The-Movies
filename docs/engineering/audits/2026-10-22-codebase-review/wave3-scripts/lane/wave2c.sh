#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
echo "node $(node --version) at $(date '+%F %T'); HEAD $($G rev-parse --short HEAD); load $(uptime | sed 's/.*load/load/')"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run playwright:17a:tree npx playwright test -c ui/playwright.config.ts ui/e2e/lot-key-capture-v1.spec.ts --reporter=line
WT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/wave3-scripts/wt-ui-parent-342e9a90-spec
$G worktree add --detach "$WT" 342e9a90 >/dev/null 2>&1 && ln -s /Users/zacheryspector/The-Movies-headless-program/node_modules "$WT/node_modules" && { [ -d /Users/zacheryspector/The-Movies-headless-program/ui/node_modules ] && ln -s /Users/zacheryspector/The-Movies-headless-program/ui/node_modules "$WT/ui/node_modules"; }
cp ui/e2e/lot-key-capture-v1.spec.ts "$WT/ui/e2e/"
(cd "$WT" && run playwright:17a:red-at-parent npx playwright test -c ui/playwright.config.ts ui/e2e/lot-key-capture-v1.spec.ts --reporter=line)
$G worktree remove --force "$WT" >/dev/null 2>&1
echo "=== ALL DONE at $(date '+%F %T')"
