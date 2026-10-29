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
RELATED=$(ls tests/p13a-*.test.ts tests/p13b-s5-*.test.ts tests/p13b-s2-*.test.ts tests/bridge-p13b-s2-labs.test.ts tests/bridge-operations-events.test.ts tests/studio-week-theater*.test.ts tests/p05a1-*.test.ts tests/p13b-s6-*.test.ts tests/p14c1-materialized-aging*.test.ts tests/p14c2s-scientist-retirement*.test.ts tests/bridge-p14c2s-scientist*.test.ts tests/bridge-p14c2rm-retirement*.test.ts tests/p14c2a-core-lifecycle*.test.ts tests/p14c2a-save-and-settlement*.test.ts tests/p14c3-transitions*.test.ts tests/p14c3-save-v38*.test.ts tests/bridge-p14a1*.test.ts tests/bridge-p14a2*.test.ts tests/bridge-p14a3-world*.test.ts tests/bridge-p13-scientist-expiry*.test.ts tests/bridge-p13-laboratory*.test.ts tests/p14p4p5-queued-project-outcome.test.ts 2>/dev/null)
FILES=$(printf '%s\n%s\n' "$CHANGED" "$RELATED" | /usr/bin/grep -v '^$' | sort -u)
echo "=== FILES ($(echo "$FILES" | wc -l | tr -d ' ')):"; echo "$FILES"
run vitest:core npx vitest run --project core --reporter=default --reporter=json --outputFile="$OUT/decisions-r3-core.json" $FILES
echo "=== ALL DONE at $(date '+%F %T')"
