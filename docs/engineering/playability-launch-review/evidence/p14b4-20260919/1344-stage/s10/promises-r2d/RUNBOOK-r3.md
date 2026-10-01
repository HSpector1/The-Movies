# S10 rows 8-11 probe (promise-148), revision 3: parent runbook, 1344-C5 r2 work unit r2d

The test-author wrote this runbook and ran none of it. It replaces `RUNBOOK.md` (reviewed in 1344-D7) and
`RUNBOOK-r2.md` (1344-D8: NOT CONFIRMED), which both stay as they were. Run this one only. It runs the probe in
`probes-r3/`. It differs from `RUNBOOK-r2.md` in three ways:
- the paths point at `probes-r3/`;
- the head run records two re-witness results, one per test file (1344-D8): `rows8to10` for
  `p14c2c-rival-promises` R1-R3 and `row11` for `p14c3-admission-boundaries` N10;
- step 4 reports both: NONE, ERROR or the witness, with the first entry of each list.

It keeps everything else from `RUNBOOK-r2.md`, which D8 checked: the parent's script form
(`1344-stage/s10/run-probes-parent.sh`: `set -u`, `step` and `clean`, an `exit 3` STOP on any failed check), a check that
no other vitest runs before each vitest run, and the merge tree's status check at the end of every merge-tree step.

Run the steps in order, one at a time, as one script (the way the parent ran `run-probes-parent.sh`) or block by block
in one `bash` session. Never run them in parallel with another vitest. The probe runs from a NEW-named copy,
`tests/zz-s10-promises.test.ts`, beside the file it copies. No step edits a tracked file. Each merge-tree step deletes its
copy and ends on a status that prints exactly `?? dist/`.

The probe runs twice: first in the merge tree (`S10_TREE=head`), then in the old-source tree (`S10_TREE=old`). The old
run reads the head dump and writes the predicates, so the order matters. Each run ticks one 95-week chain and hashes 96
states; x2 ran this chain three times in 69 s, so expect about a minute per run. The re-witness searches add a promise
pass only for a candidate, and none is predicted.

## Variables and helpers (once, at the top of the script or session)

```bash
set -u
MERGE=/Users/zacheryspector/studio-scratch/1344-merge/tree
OLD=/Users/zacheryspector/studio-scratch/1344-r2/r2d/old-tree
PR=/Users/zacheryspector/studio-scratch/1344-r2/r2d/probes-r3
OUT=/Users/zacheryspector/studio-scratch/1344-r2/r2d/out
X2=a318722f2d411ff3855310b309f062428e480457
step() { echo "== $1 $(date '+%H:%M:%S')"; }
clean() { s=$(git -C "$MERGE" status --porcelain); echo "status: [$s]"; [ "$s" = "?? dist/" ] || { echo "MERGE TREE NOT CLEAN, STOP"; exit 3; }; }
novitest() { pgrep -fl vitest && { echo "vitest running, STOP"; exit 3; }; return 0; }
```

The probe writes only under `$OUT`. Its `s10Out()` throws on any path outside it, including an `S10_OUT_DIR` override
that points elsewhere. Logs go there through the redirections below. In an interactive session, `exit 3` closes the
shell: that is the STOP.

## Step 0. Preconditions

```bash
step 0
novitest
clean
ls "$MERGE/tests" | grep '^zz-s10' && { echo "probe copy present, STOP"; exit 3; }
test "$(git -C "$MERGE" rev-parse HEAD:src)" = db80ca312211a70b54fcb75cb80480ad5e8dc867 || { echo "src is not x2's, STOP"; exit 3; }
git -C "$MERGE" diff --quiet "$X2" HEAD -- src tests/p14c2c-rival-promises.test.ts tests/p14c3-admission-boundaries.test.ts \
  tests/helpers/p14c2c-fixtures.ts tests/helpers/p14c2b-fixtures.ts tests/helpers/p14b2-fixtures.ts || { echo "chain files moved since x2, STOP"; exit 3; }
{ test ! -e "$OUT" && test ! -e "$OLD"; } || { echo "out/ or old-tree/ exists, move it aside, STOP"; exit 3; }
mkdir -p "$OUT"
git -C "$MERGE" rev-parse HEAD > "$OUT/merge-head.txt"
df -h /Users/zacheryspector | tail -1
```

- The merge tree moved past `a318722` when the parent merged r2a-r2c. None of those commits touched `src` or the five
  chain files: the author checked at `6935ea5` on 2026-10-01 at 17:59, 18:12 and 18:28.
- If `out/` exists from an earlier run of `RUNBOOK.md` or `RUNBOOK-r2.md`, move it aside (1344-D6 re-run note). This
  runbook writes the same file names. At 18:28 no `out/` existed.
- The old tree (step 2) needs about 100 MB.

## Step 1. Head run, merge tree

```bash
step 1-head
novitest
test ! -e "$MERGE/tests/zz-s10-promises.test.ts" || exit 3
cp "$MERGE/tests/p14c2c-rival-promises.test.ts" "$MERGE/tests/zz-s10-promises.test.ts"
cat "$PR/s10-promises-chain.block.ts.txt" >> "$MERGE/tests/zz-s10-promises.test.ts"
(cd "$MERGE" && S10_TREE=head node_modules/.bin/vitest run --project core tests/zz-s10-promises.test.ts -t "S10-promises") > "$OUT/promises.head.log" 2>&1; echo "exit=$?" >> "$OUT/promises.head.log"
rm -f "$MERGE"/tests/zz-s10-promises.test.ts*; clean; tail -1 "$OUT/promises.head.log"
grep -hE 'S10-promises head (gates|outcome|rewitness|predictions) ' "$OUT/promises.head.log"
```

Writes `promises.head.json`, `promises.rewitness.json` and `promises.head.log`.
- `S10-promises head gates`: `C1_head_anchor`, `P1_d1_r01_shelving_before_take`, `P2_d2_thirteen_rejections`,
  `P4_d3_take_via_commission_or_retry` and `P5_head_half`. `exit=0` means all five held.
- `S10-promises head outcome`: the recorded S10 outcome per row group. The declaration predicts `PREMISE_CONFLICT` for
  both.
- `S10-promises head rewitness`: two records, one per test file.
  - `rows8to10` (`p14c2c-rival-promises` R1-R3: rival promises VOIDED by the tick into their cutoff, checks 1-4): the
    `witness` (`"NONE"`, `"ERROR"` or the witness), the candidate count, the first candidate in rule order with its
    checks, the error count and `scanMatchesTicks`.
  - `row11` (`p14c3-admission-boundaries` N10: open, bound, progress-0 rival promises one week before their cutoff,
    VOIDED or not, checks 4 and 5): the same fields without `scanMatchesTicks`.
  - Predicted for both: `"witness":"NONE"`, `"candidates":0`, `"first":null`, `"errors":0`; `rows8to10` also
    `"scanMatchesTicks":true`.
- `S10-promises head predictions`: the eight non-gating predictions.
- `-t` skips the copied file's own leaves; only the probe runs.

The re-witness searches never gate. They sit outside `gates` and `expect`. A throw inside one is recorded under that
search's `errors`, and its witness reads `"ERROR"`, never `"NONE"`; the other search runs on.

Run step 3 even when step 1 exited 1: step 3 records what it can compute, and a gate it cannot compute reads false. It
stops with `promises.head.json is missing` only if the head chain threw before writing.

## Step 2. Build the old-source tree (once)

```bash
step 2-old-tree
bash "$PR/build-old-tree.sh" || { echo "OLD TREE BUILD FAILED, STOP"; exit 3; }
clean
```

Writes `old-tree-build.txt`, naming the merge commit it copied. The script refuses to run if `$OLD` exists, if `$OUT` is
missing, or if the merge tree is not clean apart from `dist/`. It checks the source tree hash (ff803032:src is
347cfcce), both links, five chain source files against ff803032, and the probe's test files against the merge tree. Its
commands are those of `probes/build-old-tree.sh`, which 1344-D7 reviewed and 1344-D8 found unchanged in revision 2; only
its comments and two messages changed.

## Step 3. Old run, old-source tree

```bash
step 3-old
novitest
test ! -e "$OLD/tests/zz-s10-promises.test.ts" || exit 3
cp "$OLD/tests/p14c2c-rival-promises.test.ts" "$OLD/tests/zz-s10-promises.test.ts"
cat "$PR/s10-promises-chain.block.ts.txt" >> "$OLD/tests/zz-s10-promises.test.ts"
(cd "$OLD" && S10_TREE=old node_modules/.bin/vitest run --project core tests/zz-s10-promises.test.ts -t "S10-promises") > "$OUT/promises.old.log" 2>&1; echo "exit=$?" >> "$OUT/promises.old.log"
rm -f "$OLD"/tests/zz-s10-promises.test.ts*; clean; tail -1 "$OUT/promises.old.log"
grep -hE 'S10-promises (gates|predictions) ' "$OUT/promises.old.log"
```

Writes `promises.old.json` and `promises.predicates.json`. The old tree carries the merge tree's helpers, which import
`validateSaveV43` and `convertV43ToV42` from a `save.ts` that lacks them. Under vitest 2.1.9 a missing named import reads
`undefined` and fails only when called. The r2 ledger probe's old run depends on the same behaviour and exited 0
(`1344-sweep/s10/out/ledger.old.log`, started 17:17:56 on 2026-10-01). The old branch never calls either function, and
it skips both re-witness searches.

`promises.predicates.json` holds:
- `gates`: `C1_head_anchor`, `C1_old_anchor`, `P1_d1_r01_shelving_before_take`, `P2_d2_thirteen_rejections`,
  `P3_C2_C3_first_divergence_at_Ws_plus_1`, `P4_d3_take_via_commission_or_retry`, `P5_d4_stall_without_shelving`,
  each `{pass, detail}`. `exit=0` means all seven held.
- `predictions`: non-gating, the head's eight (with `rewitness_rows8to10_is_NONE` and `rewitness_row11_is_NONE`) plus
  `first_divergence_at_post_2613` and `first_divergence_in_hollywood_only`.
- `outcome`: from the head run, recorded and never asserted. It includes `rewitness`, the same two records as
  `promises.rewitness.json`.
- `explanatory`: r01's timeline, other studios' shelvings before the take, the guard record, and the promises r01
  authored on the chain.

## Step 4. Record

```bash
step 4-record
grep -hE 'S10-promises (head )?(gates|outcome|rewitness|predictions) ' "$OUT/promises.head.log" "$OUT/promises.old.log"
grep -nE '^ "(rows8to10|row11)"|^  "witness"' "$OUT/promises.rewitness.json"
```

Record each gate as true or false from the step 3 `S10-promises gates` line (or `promises.predicates.json`), the outcome
from the step 1 `S10-promises head outcome` line, and both re-witness results from the `rewitness` line. The second
command shows each record's `witness` line in `promises.rewitness.json` under its record name.

How to read them:
- A false `C1_head_anchor` or `C1_old_anchor` means the run did not reproduce its recorded chain. Stop and report.
- All seven gates true: the movement at `p14c2c-rival-promises.test.ts:25` (rows 8-10) and
  `p14c3-admission-boundaries.test.ts:141` (row 11) is attributed to r01's shelving. Then read `outcome`:
  - `PREMISE_CONFLICT` (predicted for both groups): the leaves return to the parent. No test changes and nothing widens.
    `outcome.firstFailingAfterRederivation` names the line each leaf would fail at next. `outcome.lastOpenPost` and
    `outcome.openBoundForPerson` are facts for any later redesign.
  - `REPIN` for a group: the author writes only that group's two fields (`:25` for rows 8-10, `:141` for row 11),
    `outcome` and `progress`, from `outcome.repinValues`, with a comment naming `wsR01`, the take's event id and its
    week. The declaration shows this branch unreachable once `C1_head_anchor` holds. If it appears, report it before
    writing.
- Any of P1-P5 false: the attribution is not established. Those rows return to the parent as unattributed movements.
- A false prediction with every gate true means the predicted week or path was wrong, not the attribution. Report it.
- Re-witness (1344-D8; the evidence 1344-F5 A3 asks for). Report both `witness` values, `rows8to10` for
  `p14c2c-rival-promises` R1-R3 and `row11` for `p14c3-admission-boundaries` N10, each with its candidate count and its
  first entry (`first`), or that there was none:
  - `"NONE"` (predicted for both): no rival promise in this fixture meets that file's rule inside the leaves' horizon
    (cutoff 2601-2696). If the parent extends F5 Part A to these rows, that file's leaves stay failing as a declared
    exception.
  - A witness: report its `promiseId`, issuer, `wc` and checks from the log line, and its beneficiary and retirement
    record from `promises.rewitness.json`. Pin nothing. A witness replaces PERSON, PROMISE, the contract and the
    announcement week (and R1's terminal list for rows 8-10; the premise at :233-236 and the weeks at :237-239 for
    row 11), so it needs its own declaration and review first (D7 §4; F5 A2).
  - `"ERROR"`: that search threw at the weeks under its `errors`. Report them. The gates and the other search's result
    stand, because neither search gates.
  - `rows8to10.scanMatchesTicks` false: the tick-by-tick detection and the scan of the 2696 state disagree. Report both
    lists (`rows8to10.candidates`, `rows8to10.scanned`) from `promises.rewitness.json`.

## Step 5. Cleanup

```bash
step 5-cleanup
rm -rf "$OLD"
test ! -e "$OLD" || { echo "old tree still present, STOP"; exit 3; }
ls "$MERGE/tests" | grep '^zz-s10' && { echo "probe copy left, STOP"; exit 3; }
echo "no probe copies left"
clean
step done
```

`$OUT` stays as the record. The merge tree must be back to its pre-probe state, with status exactly `?? dist/`, before
x3 or any type gate runs. As in the r2 runs, vitest's cache goes through the tracked `node_modules` symlink, not into the
merge tree.
