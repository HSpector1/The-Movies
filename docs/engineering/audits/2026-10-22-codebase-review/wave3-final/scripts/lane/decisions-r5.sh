#!/bin/bash
# Verifies the 5A and 9A/10A slices: static gates, every changed or added test file, and the related suites.
export PATH="/usr/local/bin:$PATH"
cd /Users/zacheryspector/The-Movies-headless-program || exit 9
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
echo "node $(node --version) at $(date '+%F %T'); HEAD $($G rev-parse --short HEAD)"
run() { local name="$1"; shift; local t0=$(date +%s); echo "=== BEGIN $name"; "$@"; local rc=$?; echo "=== END $name exit=$rc elapsed=$(( $(date +%s) - t0 ))s"; }
run typecheck npm run -s typecheck
run typecheck:bridge npm run -s typecheck:bridge
CHANGED=$( { $G diff --name-only HEAD -- tests; $G ls-files --others --exclude-standard -- tests; } | /usr/bin/grep '\.test\.ts$' | sort -u)
RELATED=$(ls tests/c2a-m4-*.test.ts tests/c2a-m5-*.test.ts tests/bridge-operations-events.test.ts tests/bridge.test.ts tests/bridge-r3n4-read-model-deltas.test.ts tests/r3n1-stale-schedule-take*.test.ts tests/p14b9-casting-competition*.test.ts tests/p05a3-minimal-founding-liveness*.test.ts tests/first-film-journey*.test.ts tests/presence-scenario*.test.ts tests/studio-week-theater*.test.ts tests/p05a1-*.test.ts tests/p14p4p5-queued-project-outcome.test.ts tests/save.test.ts tests/p14c3-queued-writing-proof*.test.ts tests/p04a2-writer-credit-law*.test.ts tests/v14-dual-run*.test.ts tests/contracts/studio-events.contract*.test.ts tests/p1364-late-founding*.test.ts tests/bridge-casting.test.ts tests/bridge-p05a1-owner-greenlight*.test.ts tests/bridge-p05a3-roster-liveness*.test.ts 2>/dev/null)
FILES=$(printf '%s\n%s\n' "$CHANGED" "$RELATED" | /usr/bin/grep -v '^$' | sort -u)
echo "=== FILES ($(echo "$FILES" | wc -l | tr -d ' ')):"; echo "$FILES"
run vitest:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/decisions-r5-core.json" $FILES
echo "=== ALL DONE at $(date '+%F %T')"
