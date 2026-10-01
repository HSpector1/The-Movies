# S10 r3 row 6 re-witness probe: parent runbook (1344-F5 A2)

The test-author wrote this runbook and ran none of it. Run it only when both of these hold:
- the independent review of `declaration.md` has accepted it (F5 A2);
- dry run x3 has ended.

Run one command at a time, in order, and stop on any output other than the one stated. The probe runs from a NEW-named
copy beside the file it copies. No step edits a tracked file, and the merge tree must read exactly `?? dist/` after
step 2.

## Variables (set once per shell)

```bash
MERGE=/Users/zacheryspector/studio-scratch/1344-merge/tree
R3=/Users/zacheryspector/studio-scratch/1344-r3/row6
OUT=/Users/zacheryspector/studio-scratch/1344-r3/row6/out
```

The probe writes only under `$OUT`, and its `r3Out()` throws on any other path. It reads the r2 record
`1344-stage/s10/out/row6.json` in the evidence directory, read-only.

## Step 0. Preconditions

```bash
pgrep -fl vitest || echo "no vitest running"
```
Must print `no vitest running`.

```bash
git -C "$MERGE" status --porcelain
```
Must print exactly `?? dist/`.

```bash
git -C "$MERGE" rev-parse HEAD:src HEAD:generated
```
Must print `db80ca312211a70b54fcb75cb80480ad5e8dc867`, then `8b0ab81024d87f373f14e82353610e9f5bb4fa08`. Any other value
means the chain may have moved and declaration part c no longer holds. Stop and return the declaration for revision.

```bash
git -C "$MERGE" diff --quiet 6935ea5 HEAD -- tests/p14b5-relationships.test.ts && echo "test file as declared"
```
Must print `test file as declared`. Otherwise the base the probe copies differs from the reviewed one. Stop and return
it to the reviewer.

```bash
test ! -e "$OUT" && mkdir -p "$OUT" && git -C "$MERGE" rev-parse HEAD > "$OUT/merge-head.txt" && echo "out ready"
```
Must print `out ready`. If it prints nothing, `$OUT` holds an earlier run: move it aside first (D6 re-run note).

## Step 1. The probe, merge tree

```bash
test ! -e "$MERGE/tests/zz-s10-r3-row6.test.ts" && echo "no copy yet"
```
Must print `no copy yet`.

```bash
cp "$MERGE/tests/p14b5-relationships.test.ts" "$MERGE/tests/zz-s10-r3-row6.test.ts"
```

```bash
cat "$R3/s10-r3-row6-witness.block.ts.txt" >> "$MERGE/tests/zz-s10-r3-row6.test.ts"
```

```bash
(cd "$MERGE" && node_modules/.bin/vitest run --project core tests/zz-s10-r3-row6.test.ts -t "S10-r3-row6") > "$OUT/row6-r3.log" 2>&1; echo "exit=$?" >> "$OUT/row6-r3.log"
```

```bash
rm -f "$MERGE"/tests/zz-s10-r3-row6.test.ts*
```

## Step 2. Cleanup check

```bash
ls "$MERGE/tests" | grep '^zz-s10' || echo "no probe copies left"
```
Must print `no probe copies left`.

```bash
git -C "$MERGE" status --porcelain
```
Must print exactly `?? dist/`. The merge tree must be in this state before any further gate or dry run.

## Step 3. Read the result

```bash
tail -1 "$OUT/row6-r3.log"
```
`exit=0` means every gate held.

```bash
grep '^S10-r3-row6' "$OUT/row6-r3.log"
```
Prints the gates line and the witness line. `$OUT/row6-r3.json` holds the full record.

Expected (declaration part c): `exit=0`, every gate `true`, `"witness":"NONE"`, `"reason":"P3_NOT_ALONE_IN_ITS_WEEK"`,
`t1` `studio-aca408ec-r01:film:12` at week 229, and `sameWeek`
`["studio-aca408ec-r01:film:12","studio-aca408ec-r02:film:14"]`.

How to act on it:
- `exit=0` and NONE: F5 A3 applies. Make no test edit, and record the exception in declaration part f.
- `exit=0` and a witness object: this contradicts part c, because the recorded chain gives NONE when `A0` is true.
  Stop, pin nothing, and return to the reviewer.
- `exit=1` with `A0_anchor_recorded_chain` false: this run is not the declared chain. Stop and report, and pin
  nothing.
- `exit=1` with any other gate false, or with no gates line (for example a fixture pin failing inside `lifted()`):
  stop, return the log to the parent, and pin nothing.

`$OUT` stays as the record: `merge-head.txt`, `row6-r3.log` and `row6-r3.json`.
