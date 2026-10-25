#!/bin/bash
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
echo "node $(node --version) at $(date '+%F %T')"
t0=$(date +%s); echo "=== BEGIN typecheck"; npm run -s typecheck; echo "=== END typecheck exit=$? elapsed=$(( $(date +%s) - t0 ))s"
t0=$(date +%s); echo "=== BEGIN typecheck:bridge"; npm run -s typecheck:bridge; echo "=== END typecheck:bridge exit=$? elapsed=$(( $(date +%s) - t0 ))s"
cd tests || exit 9
FILES=$(ls stabilization-*.test.ts 1368-*.test.ts p14c2*.test.ts p14c3-queued-writing-proof.test.ts p14c3-second-episode-writing.test.ts p14c3-profession-history.test.ts p14c3-transitions.test.ts p14c3-profession-episodes.test.ts casting-*.test.ts d11-*.test.ts d12-economy.test.ts p13a-scientist-foundation.test.ts p13b-s8-finance.test.ts p11-finance-report.test.ts p14b1-promises.test.ts p14p3-directing-promises.test.ts p14p4p5-*.test.ts p15b4-*.test.ts p15b5-*.test.ts p15c2-campaign-legacy-integration.test.ts contracts/determinism-floor.contract.test.ts contracts/union-producer-subsumption.contract.test.ts contracts/cross-owner-refusal.contract.test.ts actions.test.ts p14b4-production-admission.test.ts p14a1-*.test.ts ruling-b-multihyphenate.test.ts 2>/dev/null | sed 's|^|tests/|')
cd .. || exit 9
echo "files: $(echo "$FILES" | wc -l | tr -d ' ')"
t0=$(date +%s); echo "=== BEGIN vitest focused"
npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/focused-batch2-r1.json" $FILES
echo "=== END vitest focused exit=$? elapsed=$(( $(date +%s) - t0 ))s"
