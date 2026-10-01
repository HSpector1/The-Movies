# S10 rows 8-11 probe (promise-148): parent runbook, 1344-C5 r2 work unit r2d

The test-author wrote this runbook and ran none of it. It follows `1344-stage/s10/probes-r2/RUNBOOK.md` (1344-D6:
CONFIRMED) with its own output directory, old tree and probe copy, so it never touches the r2 probes' files.

Run it when no other vitest is running, one step at a time, in this order. The probe runs from a NEW-named copy,
`tests/zz-s10-promises.test.ts`, beside the file it copies. No step edits a swept test file. Each merge-tree step deletes
its copy and ends on a status that prints exactly `?? dist/`.

The probe runs twice: first in the merge tree (`S10_TREE=head`), then in the old-source tree (`S10_TREE=old`). The old
run reads the head dump and writes the predicates, so the order matters. Each run ticks one 95-week chain and hashes 96
states; x2 ran this chain three times in 69 s, so expect about a minute per run.

## Variables (set once per shell)

```bash
MERGE=/Users/zacheryspector/studio-scratch/1344-merge/tree
OLD=/Users/zacheryspector/studio-scratch/1344-r2/r2d/old-tree
PR=/Users/zacheryspector/studio-scratch/1344-r2/r2d/probes
OUT=/Users/zacheryspector/studio-scratch/1344-r2/r2d/out
X2=a318722f2d411ff3855310b309f062428e480457
```

The probe writes only under `$OUT`. Its `s10Out()` throws on any path outside it, including an `S10_OUT_DIR` override
that points elsewhere. Logs go there through the redirections below.

## Step 0. Preconditions

```bash
pgrep -fl vitest || echo "no vitest running"                    # must print: no vitest running
git -C "$MERGE" status --porcelain                              # must print exactly: ?? dist/
ls "$MERGE/tests" | grep '^zz-s10' || echo "no probe copies"    # must print: no probe copies
test "$(git -C "$MERGE" rev-parse HEAD:src)" = db80ca312211a70b54fcb75cb80480ad5e8dc867 && echo "src is x2's"
git -C "$MERGE" diff --quiet "$X2" HEAD -- src tests/p14c2c-rival-promises.test.ts tests/p14c3-admission-boundaries.test.ts \
  tests/helpers/p14c2c-fixtures.ts tests/helpers/p14c2b-fixtures.ts tests/helpers/p14b2-fixtures.ts && echo "chain files are x2's"
test ! -e "$OUT" && test ! -e "$OLD" && echo "fresh"            # must print: fresh (1344-D6 re-run note: move an old $OUT aside)
mkdir -p "$OUT"
git -C "$MERGE" rev-parse HEAD > "$OUT/merge-head.txt"
df -h /Users/zacheryspector | tail -1                            # the old tree (step 2) needs about 100 MB
```

The checks must print `src is x2's`, `chain files are x2's` and `fresh`. The merge tree moved past `a318722` when the
parent merged r2a-r2c, and none of those commits touched `src` or these five files (checked 2026-10-01 17:25 at
`6935ea5`). If the first two print nothing, stop: the head run would not measure the x2 chain. If `fresh` prints
nothing, move the old `$OUT` or `$OLD` aside first.

## Step 1. Head run, merge tree

```bash
test ! -e "$MERGE/tests/zz-s10-promises.test.ts"
cp "$MERGE/tests/p14c2c-rival-promises.test.ts" "$MERGE/tests/zz-s10-promises.test.ts"
cat "$PR/s10-promises-chain.block.ts.txt" >> "$MERGE/tests/zz-s10-promises.test.ts"
(cd "$MERGE" && S10_TREE=head node_modules/.bin/vitest run --project core tests/zz-s10-promises.test.ts -t "S10-promises") > "$OUT/promises.head.log" 2>&1; echo "exit=$?" >> "$OUT/promises.head.log"
rm -f "$MERGE"/tests/zz-s10-promises.test.ts*
git -C "$MERGE" status --porcelain                              # exactly: ?? dist/
```

Writes `promises.head.json` and `promises.head.log`.
- The log line `S10-promises head gates` carries `C1_head_anchor`, `P1_d1_r01_shelving_before_take`,
  `P2_d2_thirteen_rejections`, `P4_d3_take_via_commission_or_retry` and `P5_head_half`. `exit=0` means all five held.
- The log line `S10-promises head outcome` carries the recorded S10 outcome per row group. The declaration predicts
  `PREMISE_CONFLICT` for both.
- The log line `S10-promises head predictions` carries the non-gating predictions (shelving week 2612, and so on).
- The copied file's own leaves are skipped by `-t`; only the probe runs.

Run step 3 even when step 1 failed: it records what it can compute, and a gate it cannot compute reads false. Step 3
stops with `promises.head.json is missing` only if the head chain itself threw before writing.

## Step 2. Build the old-source tree (once)

```bash
bash "$PR/build-old-tree.sh"
```

Writes `old-tree-build.txt`, naming the merge commit it copied. The script refuses to run if `$OLD` exists, if `$OUT`
is missing, or if the merge tree is not clean apart from `dist/`. It checks the source tree hash (ff803032:src is
347cfcce), both links, five chain source files against ff803032, and the probe's test files against the merge tree.

## Step 3. Old run, old-source tree

```bash
test ! -e "$OLD/tests/zz-s10-promises.test.ts"
cp "$OLD/tests/p14c2c-rival-promises.test.ts" "$OLD/tests/zz-s10-promises.test.ts"
cat "$PR/s10-promises-chain.block.ts.txt" >> "$OLD/tests/zz-s10-promises.test.ts"
(cd "$OLD" && S10_TREE=old node_modules/.bin/vitest run --project core tests/zz-s10-promises.test.ts -t "S10-promises") > "$OUT/promises.old.log" 2>&1; echo "exit=$?" >> "$OUT/promises.old.log"
rm -f "$OLD"/tests/zz-s10-promises.test.ts*
```

Writes `promises.old.json` and `promises.predicates.json`. The old tree carries the merge tree's helpers, which import
`validateSaveV43` and `convertV43ToV42` from a `save.ts` that lacks them. Under vitest 2.1.9 a missing named import reads
`undefined` and fails only when called. The r2 ledger probe's old run depends on the same behaviour and exited 0
(`1344-sweep/s10/out/ledger.old.log`, started 17:17:56 on 2026-10-01). The old branch never calls either function.

`promises.predicates.json` holds:
- `gates`: `C1_head_anchor`, `C1_old_anchor`, `P1_d1_r01_shelving_before_take`, `P2_d2_thirteen_rejections`,
  `P3_C2_C3_first_divergence_at_Ws_plus_1`, `P4_d3_take_via_commission_or_retry`, `P5_d4_stall_without_shelving`,
  each `{pass, detail}`. `exit=0` means all seven held.
- `predictions`: non-gating, the head's six plus `first_divergence_at_post_2613` and `first_divergence_in_hollywood_only`.
- `outcome`: from the head run, recorded and never asserted.
- `explanatory`: r01's timeline, other studios' shelvings before the take, the guard record, and the promises r01
  authored on the chain.

## Step 4. Record

Record each gate as true or false from `promises.predicates.json`, and the outcome from its `outcome` field.

How to read them:
- A false `C1_head_anchor` or `C1_old_anchor` means the run did not reproduce its recorded chain. Stop and report.
- All seven gates true: the movement at `p14c2c-rival-promises.test.ts:25` (rows 8-10) and
  `p14c3-admission-boundaries.test.ts:141` (row 11) is attributed to r01's shelving. Then read `outcome`:
  - `PREMISE_CONFLICT` (predicted for both groups): the leaves return to the parent. No test changes and nothing widens.
    `outcome.firstFailingAfterRederivation` names the line each leaf would fail at next. `outcome.lastOpenPost` and
    `outcome.openForPerson` are facts for any later redesign; this runbook chooses no new witness.
  - `REPIN` for a group: the author writes only that group's two fields (`:25` for rows 8-10, `:141` for row 11),
    `outcome` and `progress`, from `outcome.repinValues`, with a comment naming `wsR01`, the take's event id and week.
    The declaration shows this branch unreachable once `C1_head_anchor` holds; if it appears, report it before writing.
- Any of P1-P5 false: the attribution is not established. Those rows return to the parent as unattributed movements.
- A false prediction with every gate true means the predicted week or path was wrong, not the attribution. Report it.

## Step 5. Cleanup

```bash
rm -rf "$OLD"
ls "$MERGE/tests" | grep '^zz-s10' || echo "no probe copies left"   # must print: no probe copies left
git -C "$MERGE" status --porcelain                                   # exactly: ?? dist/
```

`$OUT` stays as the record. The merge tree must be back to its pre-probe state before x3 or any type gate runs. As in
the r2 runs, vitest's cache goes through the tracked `node_modules` symlink, not into the merge tree.
