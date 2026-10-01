#!/usr/bin/env bash
# Parent execution of probes-r2/RUNBOOK.md steps 0-8, verbatim, one probe at a time (1344-F4 Process; D5 §3; D6).
# Each step logs the merge tree's porcelain status, which must read exactly "?? dist/".
set -u
MERGE=/Users/zacheryspector/studio-scratch/1344-merge/tree
OLD=/Users/zacheryspector/studio-scratch/1344-sweep/s10/old-tree
PR2=/Users/zacheryspector/studio-scratch/1344-sweep/s10/probes-r2
OUT=/Users/zacheryspector/studio-scratch/1344-sweep/s10/out
step() { echo "== $1 $(date '+%H:%M:%S')"; }
clean() { s=$(git -C "$MERGE" status --porcelain); echo "status: [$s]"; [ "$s" = "?? dist/" ] || { echo "MERGE TREE NOT CLEAN, STOP"; exit 3; }; }

step 0; pgrep -fl vitest && { echo "vitest running, STOP"; exit 3; }; clean; mkdir -p "$OUT"; git -C "$MERGE" rev-parse HEAD > "$OUT/merge-head.txt"

step 1-row5
test ! -e "$MERGE/tests/zz-s10-row5.test.ts" || exit 3
cp "$MERGE/tests/p14b5-relationships.test.ts" "$MERGE/tests/zz-s10-row5.test.ts"
cat "$PR2/s10-row5-take-digest.test.ts.txt" >> "$MERGE/tests/zz-s10-row5.test.ts"
(cd "$MERGE" && node_modules/.bin/vitest run --project core tests/zz-s10-row5.test.ts -t "S10-row5") > "$OUT/row5.log" 2>&1; echo "exit=$?" >> "$OUT/row5.log"
rm -f "$MERGE"/tests/zz-s10-row5.test.ts*; clean; tail -1 "$OUT/row5.log"

step 2-row6
test ! -e "$MERGE/tests/zz-s10-row6.test.ts" || exit 3
cp "$MERGE/tests/p14b5-relationships.test.ts" "$MERGE/tests/zz-s10-row6.test.ts"
cat "$PR2/s10-row6-rival-chain.block.ts.txt" >> "$MERGE/tests/zz-s10-row6.test.ts"
(cd "$MERGE" && node_modules/.bin/vitest run --project core tests/zz-s10-row6.test.ts -t "S10-row6") > "$OUT/row6.log" 2>&1; echo "exit=$?" >> "$OUT/row6.log"
rm -f "$MERGE"/tests/zz-s10-row6.test.ts*; clean; tail -1 "$OUT/row6.log"

step 3-row7a
test ! -e "$MERGE/tests/zz-s10-row7a.test.ts" || exit 3
cp "$MERGE/tests/p14b1-trust-chooser.test.ts" "$MERGE/tests/zz-s10-row7a.test.ts"
patch "$MERGE/tests/zz-s10-row7a.test.ts" < "$PR2/s10-row7-runA.diff"
(cd "$MERGE" && node_modules/.bin/vitest run --project core tests/zz-s10-row7a.test.ts -t "natural rival") > "$OUT/row7-runA.log" 2>&1; echo "exit=$?" >> "$OUT/row7-runA.log"
rm -f "$MERGE"/tests/zz-s10-row7a.test.ts*; clean; tail -1 "$OUT/row7-runA.log"

step 3-row7b
test ! -e "$MERGE/tests/zz-s10-row7b.test.ts" || exit 3
cp "$MERGE/tests/p14b1-trust-chooser.test.ts" "$MERGE/tests/zz-s10-row7b.test.ts"
patch "$MERGE/tests/zz-s10-row7b.test.ts" < "$PR2/s10-row7-runB.diff"
(cd "$MERGE" && node_modules/.bin/vitest run --project core tests/zz-s10-row7b.test.ts -t "natural rival") > "$OUT/row7-runB.log" 2>&1; echo "exit=$?" >> "$OUT/row7-runB.log"
rm -f "$MERGE"/tests/zz-s10-row7b.test.ts*; clean; tail -1 "$OUT/row7-runB.log"

step 4-old-tree; bash "$PR2/build-old-tree.sh" || { echo "OLD TREE BUILD FAILED, STOP"; exit 3; }

step 5-row1
test ! -e "$MERGE/tests/zz-s10-row1.test.ts" || exit 3
cp "$MERGE/tests/p14b4-rival-seating-preference.test.ts" "$MERGE/tests/zz-s10-row1.test.ts"
cat "$PR2/s10-row1-seating-seed-b.block.ts.txt" >> "$MERGE/tests/zz-s10-row1.test.ts"
(cd "$MERGE" && S10_TREE=head node_modules/.bin/vitest run --project core tests/zz-s10-row1.test.ts -t "S10-row1") > "$OUT/row1.head.log" 2>&1; echo "exit=$?" >> "$OUT/row1.head.log"
rm -f "$MERGE"/tests/zz-s10-row1.test.ts*; clean; tail -1 "$OUT/row1.head.log"
test ! -e "$OLD/tests/zz-s10-row1.test.ts" || exit 3
cp "$OLD/tests/p14b4-rival-seating-preference.test.ts" "$OLD/tests/zz-s10-row1.test.ts"
cat "$PR2/s10-row1-seating-seed-b.block.ts.txt" >> "$OLD/tests/zz-s10-row1.test.ts"
(cd "$OLD" && S10_TREE=old node_modules/.bin/vitest run --project core tests/zz-s10-row1.test.ts -t "S10-row1") > "$OUT/row1.old.log" 2>&1; echo "exit=$?" >> "$OUT/row1.old.log"
rm -f "$OLD"/tests/zz-s10-row1.test.ts*; tail -1 "$OUT/row1.old.log"

step 6-ledger
test ! -e "$MERGE/tests/zz-s10-ledger.test.ts" || exit 3
cp "$MERGE/tests/bridge-p14b5-relationships.test.ts" "$MERGE/tests/zz-s10-ledger.test.ts"
cat "$PR2/s10-rows2-4-ledger.block.ts.txt" >> "$MERGE/tests/zz-s10-ledger.test.ts"
(cd "$MERGE" && S10_TREE=head node_modules/.bin/vitest run --project core tests/zz-s10-ledger.test.ts -t "S10-ledger") > "$OUT/ledger.head.log" 2>&1; echo "exit=$?" >> "$OUT/ledger.head.log"
rm -f "$MERGE"/tests/zz-s10-ledger.test.ts*; clean; tail -1 "$OUT/ledger.head.log"
test ! -e "$OLD/tests/zz-s10-ledger.test.ts" || exit 3
cp "$OLD/tests/bridge-p14b5-relationships.test.ts" "$OLD/tests/zz-s10-ledger.test.ts"
cat "$PR2/s10-rows2-4-ledger.block.ts.txt" >> "$OLD/tests/zz-s10-ledger.test.ts"
(cd "$OLD" && S10_TREE=old node_modules/.bin/vitest run --project core tests/zz-s10-ledger.test.ts -t "S10-ledger") > "$OUT/ledger.old.log" 2>&1; echo "exit=$?" >> "$OUT/ledger.old.log"
rm -f "$OLD"/tests/zz-s10-ledger.test.ts*; tail -1 "$OUT/ledger.old.log"

step 8-cleanup
rm -rf "$OLD"
ls "$MERGE/tests" | grep '^zz-s10' || echo "no probe copies left"
clean
step done
