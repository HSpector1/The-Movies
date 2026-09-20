# 583 — Replay bill reductions C6 + C7 implemented (T2) and checked on fixed source, with the before/after measurement rows

2026-09-21. Claude Code parent. ONE sim-core writer implemented C6 and C7 against the installed
RED (record 580) under the adopted design (record 579 §1), on `src/core/promiseCapacityOwnerReplay.ts`
ONLY, as two patches (C6, then C7) so the parent lands two bisectable commits. The candidate is
FROZEN and UNCOMMITTED pending the independent actual-delta review 598-R; it is captured in the
evidence patches below and in a hash-verified snapshot outside the worktree
(`~/The-Movies-recovery-snapshots/20260921T000000Z-583-bill-reductions-candidate/`, SHA256SUMS).

## Candidate identity (parent-verified)

- Base HEAD `f65758311c93fac3b126ba88629ee0647461e3c1` (record 580 publication; source = the 574
  checkpoint + the installed RED).
- `src/core/promiseCapacityOwnerReplay.ts` 2797 → 2809 lines; SHA256 after C6
  `e83a7908f0f64050fe2bd11b4cec351e88ee1cf9b1329d91326a526c9128953b` (writer-reported), after C7
  (the candidate) `9e97ffed9911af55a1a5ff5e819cf53c17dfc3214bc729cc995ae72cb956ebd5`;
  `git diff --numstat` = `16 4`. The parent's `git diff` equals the writer's full patch
  `583-W-c6-c7.patch` (SHA256 `03338b48d17d727b4bf9c7374e91a5ba66897ecad30b134c066837e222615b11`)
  byte for byte after the index line; the C6-only patch `583-W-c6.patch`
  (`55c8854542036debcc5a091ced725cb4a33ffa080a9cd513544f5fb72f0df01c`) applies to the clean index
  (`git apply --cached --check`).
- Hunks (verbatim in §3): the `copyLiteral` / `HOLD_COPY` (61) / `FIXED_HOLD_COPY` (79) insertion
  at :243-254; `closeHold` :1642 and `closePath` :1668 pay `18 + (fixed ? FIXED_HOLD_COPY : HOLD_COPY)`
  in place of `14 + work.copyCost(hold)`; `uniqueIds` :444 calls `sortedOutput`; the doc at :402.
  Nothing else in the file; no other file. The caller-record `copyCost` sites (:689, :1333, :1683,
  :2618 ×2), `Work`, `LITERAL`, `sorted`/`sortBill`/`sortedOutput`/`find` bodies, the four
  `uniqueIds` call sites and the :1991 second sort are untouched (writer grep, parent spot-check).
- Protected patch `03338b48…` identical in every run 584–596 (`untrackedSource []`); the 597
  probe runs carry the candidate plus the archived probe (538: `5b167333…`; 577: `fdd897aa…`;
  514 instrumentation: `fb9c7d6b…`), each reversed afterwards with the module re-hashed
  `9e97ffed…` and compared byte-equal to the snapshot.

## Fixed-source checks — serial, one process at a time, all fixedSource:true on f6575831 + 03338b48…

| Record | Group | UTC interval | Result | Baseline |
| --- | --- | --- | --- | --- |
| 584 | the installed RED file | 23:23:57.713–23:24:04.609 | 5 PASS (was 1 FAIL / 4 PASS, 581): case 1 `B4_BILL_580` original 59177 → 56826, swapped 59177 → 59246, delta 2420; `B4_CLOSES_580` 3/0 107889 → 104975, 3/1 172434 → 169361 | RED→GREEN |
| 585 | enumerator RED | 23:24:04.809–23:24:14.973 | 45 PASS | identical to 562 |
| 586 | first-slice RED | 23:24:15.172–23:24:23.115 | 33 PASS | identical to 563 |
| 587 | six Ready replay files | 23:24:23.296–23:24:37.090 | 17 PASS; sole original stale-target FAIL at `:234` (`expected 'workLimit' to be 'commandRefused'`) | identical to 564 |
| 588 | six Started replay files | 23:24:37.279–23:24:53.239 | 28 PASS | identical to 565 |
| 589 | root + UI typecheck | 23:24:53.438–23:26:03.069 | PASS | identical to 566 |
| 590 | seventeen adjacent/caller files | 23:26:03.267–23:26:33.398 | 203 PASS | identical to 567 |
| 591 | bridge types | 23:26:33.574–23:26:57.167 | exit 2; sole OLD TS2353 at `tests/bridge-p14b4-cast-class.test.ts(364,20)` | identical to 568 |
| 592 | facts + employment lookup | 23:26:57.342–23:27:03.117 | 7 PASS | identical to 569 |
| 593 | eleven live-P2 / kernel groups | 23:27:03.292–23:28:57.466 | 110 PASS / 83 FAIL; the 83 failing lines and 83 reason lines byte-identical and in order to 570/549 | identical to 570 |
| 594 | B1/B2/B3 controls + bridge consumers | 23:28:57.657–23:30:06.868 | 133 PASS / 1 FAIL (the designated trust-chooser test 6, same reason as 571) / 2 todo | identical to 571 |
| 595 | `bridge-p14b2-trust` | 23:30:07.045–23:30:24.955 | 22 PASS | identical to 572 |
| 596 | twelve historical save files | 23:30:25.132–23:31:16.140 | 137 PASS | identical to 573 |

Writer's own runs (not evidence): the RED after C6 (case 1 still RED at 59177 = 59177; the two
`B4_CLOSES_580` bills −561 and −714 = 3×187 and 3×187 + 153), after C7 (5 PASS), the
Started/Ready/stale trio (17 + 10 PASS + the stale FAIL), root+UI typecheck exit 0, bridge tsc the
sole OLD TS2353.

## Before/after measurement rows (pre = records 582/577/581 on the same source; post = 597/584 on the candidate)

| Probe | Row | Before → after | Δ | Law (579 §1: C7 = 2275 + 37 + 37 at Started prepare, +2 per frame with no admitted release; Ready prepare 2275 + 2 + 2; C6 = 153 per non-fixed, 187 per fixed close) |
| --- | --- | --- | --- | --- |
| 538 (597-post-538-probe, 38 PASS) | scenario 1, every cell | 108265 → 105351 | −2914 | 2349 + 2×2 + 3×187 = 2914 ✓; kernel totals shift by the same 2914; every status unchanged (UNCERTIFIED / PROVEN_FRAGILE / PROVEN_IMPOSSIBLE) |
| 538 | Started prepare-only | 32043 → 29694 | −2349 | 2275 + 37 + 37 ✓ |
| 538 | Ready prepare-only | 18754 → 16475 | −2279 | 2275 + 2 + 2 ✓ (no productions) |
| 538 | saturated rows (Ready admission; scenarios 2/3) | 200000 → 200000 | 0 | cut unchanged, as 579-B Q5 predicted |
| 577 (597-post-577-probe, 8 PASS, 65 rows, same scenario order; the parent script's `keys equal False` flag means only that its row key included fields that lawfully moved — `inputPreparationWork`, `previousWork` and the cut attempts' `through`/`provenanceRows` — every row has a pre and a post twin) | prepare-only h2/h5 | 32043 → 29694 | −2349 | ✓ |
| 577 | S3-k1 now+2 / +3 / +4 / +5 | 112098 → 109184; 127529 → 124613; 164652 → 161581; 178454 → 175381 | −2914; −2916; −3071; −3073 | 2349 + 2·frames + 3×187 (+153 where the Post exit lands inside the window) ✓ |
| 577 | complete sets k≥2 at now+3/+4/+5 | 200000 → 200000 | 0 | still CUT at plan 2; the cut `through` moves later ({62, step 3} → {62, step 5}, provenance rows 7 → 9) — the 576 bound is unchanged |
| 577 | S6 kernel rows (author-ASSUMED coverage, NOT a certificate) | e.g. now+2 pair 151457 → 148539 PROVEN_FRAGILE both | −2918 | ✓; ONE class change: `S6-kernel-k2-h4-w1w3` UNCERTIFIED 200000 (kernel normalization cut) → PROVEN_FRAGILE 198903 — the partial pair {61,63} at now+4 now fits the kernel under the assumed coverage; a measured consequence of the lower bill, not a certificate, and not a change to 576's conclusion (the complete set at now+4 still cuts) |
| 514 stale (597-post-514-stale, the designated FAIL) | `payFailure` | used 197631 → 194726, `requested 5765` both | −2905 at the cut | 2279 (Ready prepare) + 7×2 (frames, no admitted release) + 153 (the frame-3 Development & Casting release) + 3×153 (the wrap's three closes, NON-FIXED on this Ready route: the picture is admitted inside the window, so its holds are owner-granted `addHold` rows, not prepare-time fixed rows) = 2905 ✓; the Post exit lies AFTER the cut (frame 8, between the sweep bill and the drain) so it is not in the pre-cut prefix; same frame, same request; result 200000 both; `stale-target:234` keeps `'workLimit'` |
| 514 first-take (597-post-514-firsttake, 1 PASS) | result | 182925 → 180022 | −2903 | 2279 + 6×2 + 153 + 3×153 = 2903 ✓ (the route ends after the frame-6 wrap; no Post exit inside its horizon); no cut |

Close prices depend on the row's origin: Started-route wrap closes are prepare-time FIXED rows (187 each); Ready-route closes of a picture admitted inside the window are owner-granted rows (153 each); re-measurement paper must derive which from the row source (598-R Q2).

The full per-row / per-phase comparison tables (every 538 cell, all 65 577 rows, all 44/35 514
phase lines) are in the parent's `583-parent-comparisons.txt` (scratchpad; reproduced in the
598 review record where the reviewer cites them). No residual outside the four terms was found
by the parent; the exact per-frame attribution on the 514 routes is the reviewer's (598-R Q2).

## Findings

- C6 and C7 do what 579 §1 adopted and nothing else moves: 45 + 33 + 17 + 28 + 203 + 7 + 133 +
  22 + 137 + 5 = 630 focused passes, the 110/83 live-P2 set byte-identical, the two designated
  failures unchanged, every bill lower by exactly the law's terms, no cap/tariff/refusal/timeout/
  metric/test moved; the stale route stays RED with `workLimit` (515 §6 / 578 stand).
- The measured increase class (579 §1 condition 2): the inverted facility array of the RED's
  witness pays +2420 (145 walk prefix + the full sort the original no longer pays); no measured
  row went up.
- Submitted to 598-R: the two hunks, the reconciliation above, the S6 class change, and the
  record-only items (the :1991 second sort; the annex-lot +543 class; 466's "exactly four"
  superseded).

## Next

598-R independent READ-ONLY review of the landed module and the actual deltas; on KEEP, two
commits (C6 via `git apply --cached 583-W-c6.patch`; C7 from the remaining working-tree diff),
records 583/598 and the run captures 584–597, headers, publication with exact-remote verification.

## 3. Verbatim sim-core writer hand-back (583-W)

As returned, unedited (embedded raw because the hand-back carries its own code fences, as in
record 558 §3).

# 583-W — sim-core writer: replay bill reductions C6 + C7 (T2)

**Status: DONE.** C6 and C7 implemented exactly per record 579 §1 / 579-A §3 hunks on `src/core/promiseCapacityOwnerReplay.ts` ONLY. RED file (record 580) goes case 1 RED→GREEN (5 PASS, exit 0); every observed bill delta reconciles to the paper with zero residual. No test, fixture, doc, kernel, owner, enumerator or config touched. No Git state change (no add/commit/stash/checkout/reset; only `git apply --cached --check`, which writes nothing). No network, no installs, no delegation. Runtime returned; no process left running.

**Model observed:** the harness reports Fable 5.1 (`claude-fable-5-1`). The lean-ctx MCP tools named in the user CLAUDE.md are not exposed in this session; Bash (read-only `sed -n`/`grep`/`git rev-parse|status|diff|apply --check`/`shasum`/`wc`, plus the authorized vitest/npm/tsc) and two scripted assert-then-write node edits (scratchpad `583-W-c6-edit.mjs`, `583-W-c7-edit.mjs`, insertion text from a quoted heredoc `583-W-c6-insert.txt`) were used.

## Identity
- Worktree `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`. HEAD at start AND end `f65758311c93fac3b126ba88629ee0647461e3c1`; `git status --short` empty at start.
- Source at start: 2797 lines, SHA256 `d5f8cb7171f602df76b2115819e7e63320b84b4f7e602fb5811ad57984b1eb22` (= 579/580 identity). All five sites matched 579-A byte-for-byte before editing (:242 `})` / :243 `// An appended element…`; :390 doc; :432 `sorted(`; :1630/:1656 `copyCost`).
- **After C6:** 2809 lines, SHA256 `e83a7908f0f64050fe2bd11b4cec351e88ee1cf9b1329d91326a526c9128953b`.
- **After C7 (final working tree):** 2809 lines, SHA256 `9e97ffed9911af55a1a5ff5e819cf53c17dfc3214bc729cc995ae72cb956ebd5`.
- `git status --short` at end: exactly ` M src/core/promiseCapacityOwnerReplay.ts` (both changes in place, uncommitted).
- Patches (scratchpad `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/`):
  - `583-W-c6.patch` — 41 lines, SHA256 `55c8854542036debcc5a091ced725cb4a33ffa080a9cd513544f5fb72f0df01c` (C6 only, `git diff` vs HEAD taken before C7).
  - `583-W-c6-c7.patch` — 59 lines, SHA256 `03338b48d17d727b4bf9c7374e91a5ba66897ecad30b134c066837e222615b11` (full diff vs HEAD).
  - `git apply --cached --check` of each against the clean index at HEAD: both apply. (Sequential apply not verified: it would write the index. Landing plan: `git apply --cached 583-W-c6.patch` → commit C6; the working tree then diffs to exactly the C7 hunks → add → commit C7.)
- Post-insertion line map (+12): copyLiteral block :243-254; `sortedOutput` doc :402; `uniqueIds` call :444; `closeHold` pay :1642; `closePath` pay :1668. Untouched, re-verified by grep: caller-record `copyCost` sites now :689/:1333/:1683/:2618(x2); `Work.copyCost` body; `LITERAL` incl. `literalCost`; `sorted`/`sortBill`/`sortedOutput` bodies; `find`; the four `uniqueIds` call sites (:667/:674/:675/:1990); the :1979 second sort (now :1991 `sorted(advanced.admittedReleaseIds…)`); the four existing `sortedOutput` callers (:1817-1819, :2765). `sortedOutput` caller set is now five.

## Exact hunks

### C6 (verbatim `583-W-c6.patch`)
```diff
diff --git a/src/core/promiseCapacityOwnerReplay.ts b/src/core/promiseCapacityOwnerReplay.ts
index 8075504..ed47ea8 100644
--- a/src/core/promiseCapacityOwnerReplay.ts
+++ b/src/core/promiseCapacityOwnerReplay.ts
@@ -240,6 +240,18 @@ const LITERAL = Object.freeze({
   contextError: literalCost('reason', 'message'),
   commandError: literalCost('message'),
 })
+/** Shallow-copy price of a fixed MODULE schema: 1 + Σ(3 + |key|), the exact
+ * number copyCost discovers, computed once because every ledger hold is
+ * constructed by this module with exactly these keys (addHold; prepare hold();
+ * the two `{ ...hold, until }` spreads keep the key set). Caller records
+ * (production, reservation, drafts) keep incremental discovery. */
+function copyLiteral(...keys: readonly string[]): number {
+  let result = 1
+  for (const key of keys) result += 3 + key.length
+  return result
+}
+const HOLD_COPY = copyLiteral('holdId', 'ownerKey', 'ownerPathKey', 'subject', 'from', 'until')                        // 61
+const FIXED_HOLD_COPY = copyLiteral('holdId', 'ownerKey', 'ownerPathKey', 'subject', 'from', 'until', 'replaceableFrom') // 79
 // An appended element reserves capacity(1), invocation(1), reference write(1).
 const APPEND = 3
 class Work {
@@ -1627,7 +1639,7 @@ function closeHold<P extends StartedPicture>(branch: Branch<P>, path: Identity,
     }
   }
   invariant(found !== undefined, 'owner released a subject it does not hold')
-  work.pay(14 + work.copyCost(found.hold))
+  work.pay(18 + (found.fixed ? FIXED_HOLD_COPY : HOLD_COPY)) // 14 as before + 4: fixed-flag read and price selector
   found.hold = { ...found.hold, until: at }
   found.closed = true
   if (found.fixed) {
@@ -1653,7 +1665,7 @@ function closePath<P extends StartedPicture>(branch: Branch<P>, pathKey: string,
     work.pay(4)
     if (row.closed || row.hold.ownerPathKey === null || !work.equal(row.hold.ownerPathKey, pathKey) ||
       (peopleOnly && row.hold.subject.kind !== 'person')) continue
-    work.pay(14 + work.copyCost(row.hold))
+    work.pay(18 + (row.fixed ? FIXED_HOLD_COPY : HOLD_COPY))
     row.hold = { ...row.hold, until: at }; row.closed = true
     if (row.fixed) {
       work.pay(LITERAL.replacement + APPEND)
```

### C7 increment (the two hunks `583-W-c6-c7.patch` adds over the C6 patch, verbatim; the full patch's index line is `8075504..943c088`)
```diff
@@ -387,7 +399,7 @@ function sorted<T>(values: readonly T[], keyOf: (value: T) => string, work: Work
   work.pay(2 + 3 * ordered.length)
   return ordered.map(row => row.value)
 }
-/** Only the four dense output arrays with pure key projections use this path.
+/** The four dense output arrays and the duplicate-identity check use this path.
  * An inversion pays the entire unchanged sort; every return is a fresh array. */
 function sortedOutput<T>(
   values: readonly T[],
@@ -429,7 +441,7 @@ function find<T>(rows: readonly T[], id: string, keyOf: (row: T) => string, work
   return undefined
 }
 function uniqueIds<T>(rows: readonly T[], keyOf: (row: T) => string, work: Work): void {
-  const ordered = sorted(rows, keyOf, work)
+  const ordered = sortedOutput(rows, keyOf, work)
   for (let i = 1; i < ordered.length; i++) {
     work.pay(3)
     invariant(!work.equal(keyOf(ordered[i - 1]!), keyOf(ordered[i]!)), 'duplicate consumed identity')
```

## Reserved-step accounting as implemented (579-A §3; no deviation)
- **C6, per close:** `pay(18 + price)` = the existing 14-block + 4 (fixed-flag read and price selector, 579-B Q1 ruling) + the unchanged copy price (61 non-fixed / 79 fixed = `copyCost`'s 1 + Σ(3+|key|) for the six/seven-key module schema), paid BEFORE the spread. Before: 14 + `copyCost` self-charge 157/191 + returned 61/79 = 232/284; after 79/97; saving 153/187. The discovery scan the code no longer performs is not a reserved step (176 §1 :34-35). Single-`pay` form kept as adopted (579-B noted its two-`pay` preference as within convention, not required). Constants paper-checked: Σ|key| 42 → 61; Σ|key| 57 → 79.
- **C7, per `uniqueIds` call:** the paid linear `less` walk replaces the unconditional decorate + `sortBill` + merge sort; the real sorter runs, fully paid, on any inversion (`sortedOutput` :412-414 unchanged); the charged adjacent `equal` walk and its anchored message untouched. Founding-order n=5: 504 vs 2779 (−2275); n=1: 28 vs 65 (−37); n=0: 28 vs 30 (−2). Inverted-at-index-1 array: walk prefix 16+24+10+20+12+51+12 = 145, then the full 2779.
- **Observed reconciliation (all exact, zero residual):**
  - now+1 witness route, original: 59177 → 56826 = −2351 = 2275 + 37 + 37 + 2 (one frame, n=0 at the :1990 release-aftermath site). Swapped: 59177 → 59246 = +69 = +145 − 37 − 37 − 2. delta 2420 = 145 + 2275.
  - C6 alone: now+2 107889 → 107328 = −561 = 3×187; now+5 172434 → 171720 = −714 = 3×187 + 1×153.
  - C7 on top: now+2 107328 → 104975 = −2353 = 2349 + 2 frames × 2; now+5 171720 → 169361 = −2359 = 2349 + 5 frames × 2 (no frame carries an admitted release id inside now+5 on `ready`, consistent with 580's fixedCloses-stays-3 observation).
  - Cumulative vs 580: now+2 −2914; now+5 −3073 = C7 + 153×nonFixed + 187×fixed with C7 = 2349 + 2/frame.

## Runs (worktree root; one process at a time; vitest v2.1.9; logs in the scratchpad)
1. **After C6** — `node_modules/.bin/vitest run --project core tests/p14b4-replay-bill-reductions.test.ts`: START 2026-09-20T23:18:03Z, END 23:18:09Z, **exit 1**; `Test Files 1 failed (1)`; `Tests 1 failed | 4 passed (5)`; sole failure case 1 `tests/p14b4-replay-bill-reductions.test.ts:287:37` `AssertionError: expected 59177 to be greater than 59177` (as predicted: the now+1 route closes no hold). Log `583-W-c6-vitest.log`. Receipts verbatim:
```
B4_BILL_580 {"fixture":"enumerator world().unscheduled (558/576 copy)","now":60,"horizon":61,"plan":"one plan, no commands","swap":["facility-development-casting","facility-post-building"],"original":59177,"swapped":59177,"delta":0,"equalToday":true}
B4_CLOSES_580 {"route":"world().ready now+2 (538 wrap)","now":60,"horizon":62,"fixedCloses":3,"nonFixedCloses":0,"preparationWork":107328}
B4_CLOSES_580 {"route":"world().ready now+5 (Post exit)","now":60,"horizon":65,"fixedCloses":3,"nonFixedCloses":1,"preparationWork":171720}
```
2. **After C7** — same command: START 23:19:01Z, END 23:19:08Z, **exit 0**; `Test Files 1 passed (1)`; `Tests 5 passed (5)`. Log `583-W-c7-vitest.log`. Receipts verbatim:
```
B4_BILL_580 {"fixture":"enumerator world().unscheduled (558/576 copy)","now":60,"horizon":61,"plan":"one plan, no commands","swap":["facility-development-casting","facility-post-building"],"original":56826,"swapped":59246,"delta":2420,"equalToday":false}
B4_CLOSES_580 {"route":"world().ready now+2 (538 wrap)","now":60,"horizon":62,"fixedCloses":3,"nonFixedCloses":0,"preparationWork":104975}
B4_CLOSES_580 {"route":"world().ready now+5 (Post exit)","now":60,"horizon":65,"fixedCloses":3,"nonFixedCloses":1,"preparationWork":169361}
```
3. **After C7** — `node_modules/.bin/vitest run --project core tests/p14b4-started-owner-replay.test.ts tests/p14b4-ready-owner-replay.test.ts tests/p14b4-ready-replay-stale-target.test.ts`: START 23:19:08Z, END 23:19:20Z, **exit 1**; `Test Files 1 failed | 2 passed (3)`; `Tests 1 failed | 27 passed (28)`; per file: started-owner-replay 17 PASS, ready-owner-replay 10 PASS, stale-target 1 FAIL at `tests/p14b4-ready-replay-stale-target.test.ts:234:28` `AssertionError: expected 'workLimit' to be 'commandRefused' // Object.is equality`. Log `583-W-c7-trio-vitest.log`. (The brief's "28 + 17 PASS" are the 579 §3 GROUP totals across the six Started / several Ready files; these three files alone hold 17 + 10 + 1 as vitest counts them. Not a defect; wording.)
4. `npm run typecheck` (root + UI): START 23:19:57Z, END 23:21:05Z, **exit 0**, 0 TS errors. Log `583-W-typecheck.log`.
5. `node_modules/.bin/tsc -p tsconfig.bridge.json --noEmit`: START 23:21:05Z, END 23:21:29Z, **exit 2**; the sole OLD error `tests/bridge-p14b4-cast-class.test.ts(364,20): error TS2353: Object literal may only specify known properties, and 'kind' does not exist in type '{ count: number; }'.` Log `583-W-bridge-tsc.log`.
Nothing else ran (no serial groups, no record-check, no re-measurement probes, no bridge/UI suites).

## Design decisions beyond 579 §1
None. Both hunks are 579-A §3 verbatim (including the `// 61` / `// 79` trailers and the closeHold-only `// 14 as before + 4…` comment, as the hunk had them). Disclosure: my C7 edit script's first run tripped its own self-assert (it expected the `sortedOutput<T>(` definition to match `sortedOutput\(`; it does not); the assert fired before any write, the file hash stayed `e83a7908…`, I corrected the count to the five call sites and re-ran. Both scripts are in the scratchpad for audit.

## Remaining defects
None found in scope. The stale route stays RED with `'workLimit'` as 515 §6 / 579 §1 require (paper gap ≈28k; not measured here). No cap, tariff, refusal, deadline, timeout, metric or test moved.

## Evidence limits
- Only the authorized checks ran; the 579 §3 serial groups (adapter RED 33, enumerator RED 45, kernel/hold-order/stable-sort/sort-owners, facts, adjacent 203, live-P2, B1/B2/B3, trust 22, historical saves 137) and the passive re-measurements (538 scenario 1 / prepare-only, the 576 run-3 set, the 514 stale / first-take routes) are the parent's.
- The bills above are the 580 file's own receipts (its trace keys / claims), not comparable to 538's 108265 (580 evidence limits).
- The `B4_CLOSES_580` frame attribution (2 per frame, n=0) is my paper reading of the observed totals against 579 §1's law, not an instrumented per-frame receipt.
- `git apply --cached --check` proves each patch applies to the clean index; the C6-then-C7 sequential landing was not exercised (it would write the index).

## Next concrete action
Parent: save this hand-back verbatim as record 583; `git apply --cached 583-W-c6.patch` → commit C6; `git add` the remaining working-tree diff (exactly the two C7 hunks) → commit C7; verify the landed module SHA `9e97ffed9911af55a1a5ff5e819cf53c17dfc3214bc729cc995ae72cb956ebd5` / 2809 lines; run the 579 §3 serial groups and the passive re-measurements with output-derived close counts (expected 538 scenario 1 ≈ 108265 − 2353 − 561 = 105351; prepare-only 32043 − 2349 = 29694; any residual is a finding); independent actual-delta review; checkpoint; headers.
