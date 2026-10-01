# 1344-D6: confirmation of the S10 probes, revision 2

Contract-auditor, read-only. Read `declarations-r2.md` and `probes-r2/` against 1344-D5 section 4. Nothing run; both row 7 patches pass `patch --dry-run` on scratchpad copies of the merged file.

**Verdict: CONFIRMED.** The parent may run the probes as written.

## D5 items

- C1: APPLIED. The anchors match the recorded logs: row 1 at 1344-save43-broad-core.txt:117 and 1338-t1-broad-core.txt:29; ledger hashes at :32680, :32734 and 1338 :4081; the 1338 sentence row is event 297 (:4102).
- C2: APPLIED. The old runs read the head dumps and gate the first differing row after Ws (row 1 P4, ledger P1).
- C3: APPLIED. `stableStringify` is identical at ff803032 (save.ts:673) and HEAD (:679): sorted keys, -0 written as 0. The ledger also requires no shelving receipt in the hashed state.
- Row 1 d2: APPLIED DIFFERENTLY, sound. P2 requires `rejections: 13` and a count of 12 entering Ws. It cannot pass falsely. It reads false if an open named promise held the count at 13 (1344-A §3.3); `countBefore` shows that case.
- Rows 2-4 verbatim dump: APPLIED. `s10FirstDiff` compares settlement receipts and rows through `stableStringify`.
- Law lines: APPLIED. The :557 relaxation admits only seed-b's extension sentence, alone, with d6 true.
- `rel !== null`: APPLIED.
- R6a: APPLIED (`guard <= 40`, post-tick 237).
- R6b: APPLIED. A stray take at 217 yields PREMISE_CONFLICT, the safe direction.
- R6c: APPLIED (R3, R4, R5).
- Row 7 Run A: APPLIED (rethrowing try/catch; d1 from the persisted `shelved` list).
- ORACLE at :607-608: APPLIED. Part f says :606-608, a cosmetic slip.
- Section 3: APPLIED. `s10Out` throws outside `out/`. Every merge-tree step removes `zz-s10-<name>.test.ts*`, including patch leftovers, then checks status. build-old-tree.sh refuses a dirty merge tree and checks the source tree hash (ff803032:src is 347cfcce, verified), both links and the copied files.

## New false-pass paths

None found. Ledger P1 compares post-tick settlement weeks with the processed shelving week. That holds: tick.ts runs the Hollywood week before the increment (:935) and the market after it (:1160), so a settlement in the shelving tick is downstream of the shelving, and C3 rules out any earlier divergence. Row 6's REPIN is recorded, never asserted, and checks every condition the leaf imposes (:357-375, :641-642).

## Merge tree status

Clean after every step. The copied files hold no snapshot assertions, and vitest's cache goes through the tracked `node_modules` symlink. Step 4 and the old runs never write the merge tree.

## Re-run note (not blocking)

Step 0 keeps an existing `$OUT`, and the old step runs even after a failed head step. On a re-run, a head step that dies before writing would leave the old step reading the previous head dump. `out/` does not exist yet, so the first run is safe. Before any re-run, move `$OUT` aside.
