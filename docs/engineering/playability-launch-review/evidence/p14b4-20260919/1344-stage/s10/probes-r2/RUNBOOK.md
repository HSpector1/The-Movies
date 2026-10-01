# S10 probes r2: parent runbook (1344-D5 section 3, 1344-F4 Process)

The test-author wrote this runbook and ran none of it. The parent runs it after x2 ends and before x3 starts (F4 Process; D5 section 3), one probe at
a time, in the order below. Every probe runs from a NEW-named copy (`tests/zz-s10-*.test.ts`) beside the file it
copies. No step edits a swept test file. Each step deletes its copy, and the step's last command must print exactly
`?? dist/`.

Rows 1-4 run twice: first in the merge tree (`S10_TREE=head`), then in the old-source tree (`S10_TREE=old`). The
old run reads the head dump and writes the predicates, so the order matters. Rows 5, 6 and 7 run in the merge tree
only.

## Variables (set once per shell)

```bash
MERGE=/Users/zacheryspector/studio-scratch/1344-merge/tree
OLD=/Users/zacheryspector/studio-scratch/1344-sweep/s10/old-tree
PR2=/Users/zacheryspector/studio-scratch/1344-sweep/s10/probes-r2
OUT=/Users/zacheryspector/studio-scratch/1344-sweep/s10/out
```

Every probe writes only under `$OUT`. The probe's `s10Out()` throws on any path outside it, including an
`S10_OUT_DIR` override that points elsewhere. Logs go there through the redirections below.

## Step 0. Preconditions

```bash
pgrep -fl vitest || echo "no vitest running"   # must print: no vitest running (x2 has ended; x3 waits for step 8)
git -C "$MERGE" status --porcelain             # must print exactly: ?? dist/
mkdir -p "$OUT"
git -C "$MERGE" rev-parse HEAD > "$OUT/merge-head.txt"
df -h /Users/zacheryspector | tail -1          # the old tree (step 4) needs about 100 MB
```

## Step 1. Row 5 (S7, 1344-F4 ruling 2), merge tree

The probe file is the reviewed r1 probe, byte for byte. Its header comment names the swept file; this step
supersedes that comment.

```bash
test ! -e "$MERGE/tests/zz-s10-row5.test.ts"
cp "$MERGE/tests/p14b5-relationships.test.ts" "$MERGE/tests/zz-s10-row5.test.ts"
cat "$PR2/s10-row5-take-digest.test.ts.txt" >> "$MERGE/tests/zz-s10-row5.test.ts"
(cd "$MERGE" && node_modules/.bin/vitest run --project core tests/zz-s10-row5.test.ts -t "S10-row5") > "$OUT/row5.log" 2>&1; echo "exit=$?" >> "$OUT/row5.log"
rm -f "$MERGE"/tests/zz-s10-row5.test.ts*
git -C "$MERGE" status --porcelain             # exactly: ?? dist/
```

Writes `row5.log`. `exit=0` means every guard clause of F4 ruling 2 held on `after` (version 1, `shelved` empty, hold
0, every rejection count 1 on an active ready ordinal, no `screenplayShelved` receipt) and the stripped digest equals
`9702aa68…`. The lines `S10-row5 shelving` and `S10-row5 stripped digest` carry the values.

## Step 2. Row 6 (S10, 1344-F4 ruling 4), merge tree

```bash
test ! -e "$MERGE/tests/zz-s10-row6.test.ts"
cp "$MERGE/tests/p14b5-relationships.test.ts" "$MERGE/tests/zz-s10-row6.test.ts"
cat "$PR2/s10-row6-rival-chain.block.ts.txt" >> "$MERGE/tests/zz-s10-row6.test.ts"
(cd "$MERGE" && node_modules/.bin/vitest run --project core tests/zz-s10-row6.test.ts -t "S10-row6") > "$OUT/row6.log" 2>&1; echo "exit=$?" >> "$OUT/row6.log"
rm -f "$MERGE"/tests/zz-s10-row6.test.ts*
git -C "$MERGE" status --porcelain             # exactly: ?? dist/
```

Writes `row6.json` and `row6.log`.
- `predicates.R1`-`R5` (d1-d6), each `{pass, detail}`. `exit=0` means all five passed, so the :372 movement is
  attributed to the week-208 shelving.
- `outcome.kind` is recorded and never asserted. `REPIN` names `repeatTake` and `repeatTakeWeek`, the values the
  author may write into `FROZEN.rival`. `PREMISE_CONFLICT` sends the three leaves back to the parent, with no
  widening.
- The log lines `S10-row6 predicates` and `S10-row6 outcome` repeat both.

## Step 3. Row 7 (ORACLE, 1344-F4 ruling 3), merge tree

Run A logs the first mismatch and still fails, as the recorded leaf does:

```bash
test ! -e "$MERGE/tests/zz-s10-row7a.test.ts"
cp "$MERGE/tests/p14b1-trust-chooser.test.ts" "$MERGE/tests/zz-s10-row7a.test.ts"
patch "$MERGE/tests/zz-s10-row7a.test.ts" < "$PR2/s10-row7-runA.diff"
(cd "$MERGE" && node_modules/.bin/vitest run --project core tests/zz-s10-row7a.test.ts -t "natural rival") > "$OUT/row7-runA.log" 2>&1; echo "exit=$?" >> "$OUT/row7-runA.log"
rm -f "$MERGE"/tests/zz-s10-row7a.test.ts*
git -C "$MERGE" status --porcelain             # exactly: ?? dist/
```

Writes `row7-runA.log`. The expected result is `exit=1`. Each line `S10-row7-runA {...}` carries `d1`: the expected
read names a screenplay in the issuer's `screenplayShelving.shelved` at that week, or that screenplay's genre. The
line also logs week, issuer, index, draft, want, `shelved`, the active index and the candidate list.

Run B applies the declared oracle edit alone:

```bash
test ! -e "$MERGE/tests/zz-s10-row7b.test.ts"
cp "$MERGE/tests/p14b1-trust-chooser.test.ts" "$MERGE/tests/zz-s10-row7b.test.ts"
patch "$MERGE/tests/zz-s10-row7b.test.ts" < "$PR2/s10-row7-runB.diff"
(cd "$MERGE" && node_modules/.bin/vitest run --project core tests/zz-s10-row7b.test.ts -t "natural rival") > "$OUT/row7-runB.log" 2>&1; echo "exit=$?" >> "$OUT/row7-runB.log"
rm -f "$MERGE"/tests/zz-s10-row7b.test.ts*
git -C "$MERGE" status --porcelain             # exactly: ?? dist/
```

Writes `row7-runB.log`. d2 and d3 hold when `exit=0` and the summary shows both leaves (:761 and :802) passed.

## Step 4. Build the old-source tree (once)

```bash
bash "$PR2/build-old-tree.sh"
```

Writes `old-tree-build.txt`, naming the merge commit it copied. The script refuses to run if `$OLD` exists or the
merge tree is not clean apart from `dist/`.

## Step 5. Row 1 (attribution only, 1344-F4 ruling 1): head, then old

```bash
test ! -e "$MERGE/tests/zz-s10-row1.test.ts"
cp "$MERGE/tests/p14b4-rival-seating-preference.test.ts" "$MERGE/tests/zz-s10-row1.test.ts"
cat "$PR2/s10-row1-seating-seed-b.block.ts.txt" >> "$MERGE/tests/zz-s10-row1.test.ts"
(cd "$MERGE" && S10_TREE=head node_modules/.bin/vitest run --project core tests/zz-s10-row1.test.ts -t "S10-row1") > "$OUT/row1.head.log" 2>&1; echo "exit=$?" >> "$OUT/row1.head.log"
rm -f "$MERGE"/tests/zz-s10-row1.test.ts*
git -C "$MERGE" status --porcelain             # exactly: ?? dist/

test ! -e "$OLD/tests/zz-s10-row1.test.ts"
cp "$OLD/tests/p14b4-rival-seating-preference.test.ts" "$OLD/tests/zz-s10-row1.test.ts"
cat "$PR2/s10-row1-seating-seed-b.block.ts.txt" >> "$OLD/tests/zz-s10-row1.test.ts"
(cd "$OLD" && S10_TREE=old node_modules/.bin/vitest run --project core tests/zz-s10-row1.test.ts -t "S10-row1") > "$OUT/row1.old.log" 2>&1; echo "exit=$?" >> "$OUT/row1.old.log"
rm -f "$OLD"/tests/zz-s10-row1.test.ts*
```

The head run writes `row1.head.json`: tuples, shelving receipts, weekly counts, Ws, the state hash at Ws and the head
gates `C1_head_anchor`, `P1_d1_shelving_before_w211`, `P2_d2_thirteen_rejections`, `P6_d5_leaf_law_head`. The old run
writes `row1.old.json` and `row1.predicates.json`, which hold every gate (the head gates plus `C1_old_anchor`,
`P3_C3_state_equal_at_Ws`, `P4_C2_first_moved_row_after_Ws`) and the non-gating `P5_d4_explanatory`. Run the old step
even when the head step failed: it records what is computable, and a gate it cannot compute reads false.

## Step 6. Rows 2-4 (attribution only, 1344-F4 ruling 1): head, then old

```bash
test ! -e "$MERGE/tests/zz-s10-ledger.test.ts"
cp "$MERGE/tests/bridge-p14b5-relationships.test.ts" "$MERGE/tests/zz-s10-ledger.test.ts"
cat "$PR2/s10-rows2-4-ledger.block.ts.txt" >> "$MERGE/tests/zz-s10-ledger.test.ts"
(cd "$MERGE" && S10_TREE=head node_modules/.bin/vitest run --project core tests/zz-s10-ledger.test.ts -t "S10-ledger") > "$OUT/ledger.head.log" 2>&1; echo "exit=$?" >> "$OUT/ledger.head.log"
rm -f "$MERGE"/tests/zz-s10-ledger.test.ts*
git -C "$MERGE" status --porcelain             # exactly: ?? dist/

test ! -e "$OLD/tests/zz-s10-ledger.test.ts"
cp "$OLD/tests/bridge-p14b5-relationships.test.ts" "$OLD/tests/zz-s10-ledger.test.ts"
cat "$PR2/s10-rows2-4-ledger.block.ts.txt" >> "$OLD/tests/zz-s10-ledger.test.ts"
(cd "$OLD" && S10_TREE=old node_modules/.bin/vitest run --project core tests/zz-s10-ledger.test.ts -t "S10-ledger") > "$OUT/ledger.old.log" 2>&1; echo "exit=$?" >> "$OUT/ledger.old.log"
rm -f "$OLD"/tests/zz-s10-ledger.test.ts*
```

Per seed (`seed-b`, `p13-public-commercial-adoption`, `p13a-core-causal-01`):
- The head run writes `ledger.<seed>.head.json`. It holds the verbatim settlement receipts, rows and all market
  receipts, the shelving receipts, Ws, the state hash at Ws, the law-line results and `C1_head_anchor`. The head run
  fails a seed only on its anchor.
- The old run writes `ledger.<seed>.old.json` and `ledger.<seed>.predicates.json`. The gates are:
  - `C1_head_anchor`, `C1_old_anchor`;
  - `P1_d1_d2_C2_first_moved_row_after_Ws`;
  - `P3_C3_state_equal_at_Ws`;
  - `P4_d4_law_lines_head`;
  - `P5_d5_rng_unmoved`;
  - `P6_d6_extension_row` (always true off seed-b).
- `E_d3_explanatory` is non-gating. It lists each moved settlement with the proposals for that person in both trees
  and the issuers' shelvings before it.

## Step 7. Record

Record each gate as true or false (F4 Process) from:
- `row5.log`;
- `row6.json`;
- `row7-runA.log` and `row7-runB.log`;
- `row1.predicates.json`;
- `ledger.*.predicates.json`.

How to read them:
- Rows 1-4: all gates true attributes the changed primary to shelving. The row stays failing and no test changes.
- A false `C1` means the run did not reproduce the recorded chain. Stop that row and report it.
- Any other false gate on rows 1-4 refutes the attribution. That row returns to the parent as an unattributed
  movement.

## Step 8. Cleanup

```bash
rm -rf "$OLD"
ls "$MERGE/tests" | grep '^zz-s10' || echo "no probe copies left"   # must print: no probe copies left
git -C "$MERGE" status --porcelain                                   # exactly: ?? dist/
```

`$OUT` stays as the record. The merge tree must be back to its pre-probe state before x3 or any type gate runs.
