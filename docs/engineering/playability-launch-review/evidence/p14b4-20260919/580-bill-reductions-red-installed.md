# 580 — RED installed: replay bill reductions C6/C7 (T1), with the unchanged-source baseline and the pre-writer measurement rows

2026-09-21. Claude Code parent. The test-author authored the requirement-based RED for the
reductions adopted in record 579 §1 (brief §2). ONE new file, nothing else changed:
`tests/p14b4-replay-bill-reductions.test.ts`, SHA256
`3389cc8409e5457a8e58a080ffc7baed04b0e506d5b5d3934799a1ed27a2fe53`, 372 lines, 5 runtime cases
(C7 facility-order witness; C7 duplicate-identity protection ×6 throws; C6 key-set invariant on
two Started routes; no bill literal; loud `UNCONSTRUCTIBLE` preconditions). Case 1 is RED for
exactly the reason the design predicts: on unchanged source a [0]↔[1] facility swap leaves the
bill equal (59177 = 59177), because `uniqueIds` sorts the array in full either way; after C7 the
inverted array pays the walk prefix plus the full sort while founding order pays only the walk.

## Identity

- Parent baseline under `record-check.mjs`: `581-bill-reductions-red-baseline.{txt,json,patch}`;
  HEAD `20f6b8eff47e8f5a31837e0a349c623d3b28184e` (docs only since `00fd237c`; source = the 574
  checkpoint); protected capture = the untracked RED file only; fixedSource:true; exit 1;
  `Tests 1 failed | 4 passed (5)`; the sole failure `tests/p14b4-replay-bill-reductions.test.ts:287:37`
  `expected 59177 to be greater than 59177`; receipts captured in the txt:
  `B4_BILL_580 {… "original":59177,"swapped":59177,"delta":0,"equalToday":true}`,
  `B4_CLOSES_580 {"route":"world().ready now+2 (538 wrap)", … "fixedCloses":3,"nonFixedCloses":0,"preparationWork":107889}`,
  `B4_CLOSES_580 {"route":"world().ready now+5 (Post exit)", … "fixedCloses":3,"nonFixedCloses":1,"preparationWork":172434}`.
- Test-author's own runs (dev1 exit 1 with a fixture-construction error in its own file, fixed;
  dev2 and final exit 1 with the sole case-1 failure; typecheck run 1 exit 2 on a TS4104 in its
  own file, fixed; run 2 exit 0) preceded the parent run; see §3.
- The file is INSTALLED with this record, so the writer implements against committed bytes.

## Pre-writer measurement rows (same source; the "before" receipts for 579 §1's re-measurement law)

| Record | Probe (restored from its archived patch, run, removed again) | Result |
| --- | --- | --- |
| 582-pre-538-probe | `tests/p14b4-capacity-budget-measurement.test.ts` from the 538 patch | 38 PASS; scenario 1 `producerWork 108265` (kernel 112677 supplied), prepare-only 32043 — identical to record 538, so the bills are unchanged on this source |
| 582-pre-514-stale | the 514 instrumentation of `promiseCapacityOwnerReplay.ts` (stale route) | exit 1 (the designated stale FAIL); `payFailure` at `used 197631, requested 5765` inside `frame` (replay :1975 instrumented), result `used 200000` |
| 582-pre-514-firsttake | the 514 instrumentation (first-take route) | 1 PASS; result `used 182925` (= 534/535) |

After each 514 run the instrumentation was reverse-applied and the module re-hashed
`d5f8cb7171f602df76b2115819e7e63320b84b4f7e602fb5811ad57984b1eb22` (= 579/580-T identity);
`git status` showed only the RED and the evidence files. The 576/577 rows (`world().unscheduled`
alternatives) already sit on this source and need no pre-run.

## Writer release (T2; ONE sim-core writer, record 583)

Per 579 §1: writable in `src/core/promiseCapacityOwnerReplay.ts` ONLY — (i) the `copyLiteral` /
`HOLD_COPY` / `FIXED_HOLD_COPY` insertion between :242 and :243; (ii) :1630; (iii) :1656;
(iv) :432; (v) the word "four" in the doc at :390 — C6 first, then C7, handed back as two
patches so the parent lands two bisectable commits. Not writable: everything else (579 §1 list),
tests, kernel, owners, enumerator, caps/limits/refusals, docs. The writer runs only the new RED
file (after C6: case 1 still RED, cases 2–3 GREEN; after C7: 5 PASS with `delta > 0`), the
Started/Ready/stale-target trio, and the typechecks; the parent runs the 579 §3 serial groups,
the post-writer measurement rows and the independent actual-delta review.

## 3. Verbatim test-author hand-back (580-T)

As returned, unedited (embedded raw because the hand-back carries its own code fences, as in
record 558 §3).

# 580-T — requirement-based RED for replay bill reductions C6/C7 (T1)

**Status: DONE.** ONE new untracked file `tests/p14b4-replay-bill-reductions.test.ts` (372 lines, SHA256 `3389cc8409e5457a8e58a080ffc7baed04b0e506d5b5d3934799a1ed27a2fe53`). No other file, source, config, fixture or doc changed; no Git state change (no add/commit/stash/checkout); no network; no installs; no delegation. Runtime returned: no process left running; I hold no native input slot.

**Model observed:** Fable 5.1 (`claude-fable-5-1`). The lean-ctx MCP tools named in the user CLAUDE.md are not exposed in this session; Bash (read-only `sed -n`/`grep`/`git rev-parse|status|log|diff --stat`/`shasum`/`wc`, plus the authorized vitest and `npm run typecheck`), Write and Edit were used.

## Identity
- Worktree `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`.
- HEAD at start `e444b22441afb89e118e20456e340fa941066f93`, `git status --short` empty. **HEAD moved once during my work** to `20f6b8eff47e8f5a31837e0a349c623d3b28184e` ("Headers: 578 Owner packet and 579 C6/C7 design+review recorded; NEXT579 …"): docs-only (5 header files, `git diff --stat e444b22..HEAD -- src tests bridge ui scripts package.json` empty). Source identity identical across both HEADs: `src/core/promiseCapacityOwnerReplay.ts` 2797 lines SHA256 `d5f8cb7171f602df76b2115819e7e63320b84b4f7e602fb5811ad57984b1eb22` (= 579's), kernel `1faa6fca…`, enumerator-slice test `b9da9b76…`, started-owner-replay test `e2091264…`, `_contractFixtures.ts` `7554a6b1…`, `helpers/p14b2-fixtures.ts` `23457e03…`.
- `git status --short` at end: exactly `?? tests/p14b4-replay-bill-reductions.test.ts`.
- Scratch logs (all under the assigned scratchpad prefix `580-T-*`): `580-T-dev1.log`, `580-T-dev2.log`, `580-T-final-vitest.log`, `580-T-typecheck.log`, `580-T-typecheck-2.log` in `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/`.

## Sources read (line ranges)
- Record 579 whole (392 lines: §1–§3, 579-A §2/§3/§4/§6/§7, 579-B Q1–Q9); 176 `:376-390` (§8 items 3–4); 576 rows `:38,:40,:151-156,:205-207` (the S3-k1-h5 route and `B4_BUDGET_576` line format); `record-check.mjs` `:1-70` (stdout+stderr of the spawned command go into the `.txt`, so the `B4_*` lines are captured).
- Replay `:1-140` (types, `invariant` :127-134, result :100-103), `:245-345` (`Work`: `equal`/`less` :318-319, `copyCost` :320-328), `:373-437` (`sorted`, `sortedOutput`, `find`, `uniqueIds`), `:518-535` (`reservationSubject` :526), `:590-680` (prepare preamble :625-654; `uniqueIds` :655/:662/:663 behind the cardinality invariant :660), `:700-712`, `:740-764` (fixed `hold()` :747-760), `:1610-1714` (`closeHold`/`addHold`/`closePath`/`drainEvents`), `:1776-1808` (trace tail; `additionalHolds` :1797-1800; per-path `[]` :1784), `:1880-1899`, `:1970-1994`, `:2680-2797` (prepare errors re-thrown :2713; ledger :2725-2727; result :2775; projection :2781-2783); grep: `const end` → `:542`.
- Kernel `:1-40` (Hold/FixedHold/HoldReplacement :16-21), `:117` `MAX_LIMITS = { claims: 32, units: 64, alternatives: 1024, work: 200000, span: 220 }` (not exported).
- Tests: enumerator-slice `:1-330` (+grep; `world()` :66-183, `startedSource` :243-251, `startedRef` :253-258, `:446` fixed `until = {week: now+2, step: 0}`); started-owner-replay `:1-130` (fixture :66-91, input :121-127); ready-owner-replay `:1-100` + grep (Ready admission/release routes; not used); `contracts/_contractFixtures.ts` `:49-90` (phase requirements: `development` AND `preProduction` hold `development-casting`), `:165-312` (`richFoundedStudio` depth, `operationsStudio`, `productionPayload`); `helpers/p14b2-fixtures.ts` `:1-40`.
- `operations.ts :83-127` (founding facilities, ascending ids; annex), `:600-640` (greenlight capacity refusal); `types.ts :600-615` (`ProductionPhase`); `tuning.ts` grep (`PRODUCTION_TICKS 8` :59; founding capacities 2/2/2/1 :632-635); `vitest.config.ts`, `vitest.workspace.ts` (`core` project = `tests/**/*.test.ts`, node), `package.json` scripts.

## Per case

**Case 1 — C7 RED→GREEN witness (facility order).** Fixture: the `world()` copy's `unscheduled` (558/576 fixture; one started picture `prod-0052` at remainingTicks 5, shooting, take ready not scheduled), now = 60. Preconditions (each `assert.ok` → `UNCONSTRUCTIBLE:`): ≥ 3 facilities; `[0].id ≠ [1].id`; every workflow reservation's facility sits at index ≥ 2 (579-B Q7: the linear `find` :526 then visits BOTH [0] and [1] in either order and its `equal` :319 charges sum identically). Swapped state built immutably: `{ ...base, operations: { ...base.operations, facilities: [f[1], f[0], ...f.slice(2)] } }`. ONE plan, `commands: []`, horizon now+1, `claimPersonIds` = cast leads (started-owner-replay :125 shape), limits = kernel :117 caps. Why no commands / now+1: no owner-granted hold and no release lands inside one frame on this fixture (the wrap is the second frame, 538), so no grant/release-time `find` can reach index 0/1; asserted from the receipt (zero `reservationGranted`/`reservationReleased` owner events in provenance). Pins, in order: both attempts complete; `projection.operations.facilities` deep-equals the respective INPUT array (original→original's, swapped→swapped's; 579-B Q7: the projection carries the source array by construction, :2723/:2782); `normalised(swapped)` `toStrictEqual` `normalised(original)` where `normalised` = `{ fixedHolds, omissions, attempts }` with `preparationWork` removed and `projection.operations.facilities` sorted by id (nothing else altered: trace, provenance, fixedHolds, omissions, projection week/productions/sets/technology/releaseAuthority/completedBackgroundPathKeys all compared exactly); LAST: `swapped.preparationWork > original.preparationWork`. Expectation on unchanged source: every equality PASSES, the final `>` FAILS (both 59177) → RED; after C7 the swapped array inverts at index 1 and pays the walk prefix plus the full unchanged sort → GREEN. **Observed: the witness is valid** (bills equal today, delta 0; the provenance/trace/projection equality held, so no identity key depends on facility discovery order on this route).

`B4_BILL_580` line verbatim (from the final run):
```
B4_BILL_580 {"fixture":"enumerator world().unscheduled (558/576 copy)","now":60,"horizon":61,"plan":"one plan, no commands","swap":["facility-development-casting","facility-post-building"],"original":59177,"swapped":59177,"delta":0,"equalToday":true}
```

**Case 2 — C7 protection (six throws, GREEN both sides).** Message pin: anchored regex `/^Started owner replay: duplicate consumed identity$/` (prefix :130, message :436; prepare's invariant is a plain Error re-thrown at :2713, so `toThrow` is the right shape). All inputs zero-span (`horizonEndWeek = now`, 176 §8 item 3: prepare still validates/charges consumed facts), preceded by a zero-span CONTROL on the unmodified state that must complete (otherwise `UNCONSTRUCTIBLE`, so a context cut can never masquerade as "did not throw").
- `operations.facilities` on `world().unscheduled`: precondition the real array is strictly ascending by id (founding order, operations.ts :85-116); in-order duplicate = `[...f, last]` (adjacent equal pair, no inversion), out-of-order = `[last, ...f]` (inversion at index 1 → after C7 the full sort runs, caught adjacent as today).
- `studio.activeProductions` and `operations.workflows` on `trio()` (see ambiguity 3): with `[p0,p1,p2]`/`[w0,w1,w2]` sorted by key, productions in-order `[p0,p1,p1]` and out-of-order `[p1,p0,p1]` against the REAL unique workflows (equal cardinality :660; :662 throws before :663); workflows in-order `[w0,w1,w1]` and out-of-order `[w1,w0,w1]` against the REAL unique productions (:662 passes; :663 throws). Receipt: all six throw on unchanged source; both controls complete.

**Case 3 — C6 protection (key-set invariant, GREEN both sides).** Helper `keySetsAndCloses`: every `result.fixedHolds[i]` → `Object.keys` exactly `['holdId','ownerKey','ownerPathKey','subject','from','until','replaceableFrom']` (LITERAL.fixedHold :162, prepare :754-755, kernel :20) and a receipt precondition that its `until` equals the prepared end `{ week: horizonEndWeek, step: 0 }` (:542, :755); on every complete attempt every `trace.additionalHolds[i]` → exactly `['holdId','ownerKey','ownerPathKey','subject','from','until']` (LITERAL.hold :161, addHold :1645-1648, kernel :16-19; :1797-1800 pushes the ledger's own rows) and every `trace.fixedHoldReplacements[i]` → exactly `['holdId','newUntil']` (:1635/:1660). Close counts derived from outputs (579-B Q6): fixed = `fixedHoldReplacements.length`; non-fixed = `additionalHolds` whose `until` is no longer the prepared end. Routes: (a) `world().ready` now+2 (the 538 two-week wrap; take scheduled in-source; no commands) → precondition `fixedCloses ≥ 1`; (b) `world().ready` now+5 → precondition `nonFixedCloses ≥ 1` (the Post reservation granted at the wrap by `addHold` :1706 on `reservationGranted` and released at the Post exit by `closeHold` :1698 on `reservationReleased`: the only owner-granted holds a Started route closes). Receipts (verbatim):
```
B4_CLOSES_580 {"route":"world().ready now+2 (538 wrap)","now":60,"horizon":62,"fixedCloses":3,"nonFixedCloses":0,"preparationWork":107889}
B4_CLOSES_580 {"route":"world().ready now+5 (Post exit)","now":60,"horizon":65,"fixedCloses":3,"nonFixedCloses":1,"preparationWork":172434}
```
(3 fixed at the wrap = stage, scenery, Set, as 579-A §3 paper; 1 non-fixed at Post exit; the person-release closes did NOT land inside now+5 on `ready` — fixedCloses stays 3, not 8 — an observation for the re-measurement paper, not a defect.) Expectation on unchanged source: PASS; after C6: PASS (schemas unchanged).

**Case 4 (no bill literal):** the file contains no vitest literal for any bill or delta; the only numeric literals are the kernel caps `{ work: 200000, span: 220, alternatives: 1024 }` (kernel :117, cited in-file). **Case 5:** every fixture precondition self-reports `UNCONSTRUCTIBLE: …` via `assert.*`; no `try/catch`; no `Math.random`/`Date`; the copied `world()` keeps its own `UNEXECUTED fixture` throws verbatim.

## Runs (all from the worktree root; one process at a time)
1. `node_modules/.bin/vitest run --project core tests/p14b4-replay-bill-reductions.test.ts` — dev run 1: START 2026-09-20T23:06:28Z, END 23:06:35Z, exit 1; 2 failed / 3 passed (case 1 RED as intended; case 2's trio `it` failed in the FIXTURE: the third greenlight refused "no development-casting capacity for prod-0002" because my wait loop keyed on phase `'development'` while `preProduction` also holds the Development & Casting slot). Log `580-T-dev1.log`.
2. Fix (test-file only): wait until no workflow holds a `development-casting` reservation (real slot occupancy, contract fixtures :58-66) before the third greenlight. Dev run 2: START 23:07:17Z, END 23:07:23Z, exit 1; **1 failed / 4 passed** (the sole failure = case 1 `:287` `expected 59177 to be greater than 59177`). Log `580-T-dev2.log`.
3. `npm run typecheck` (root + UI) run 1: START 23:07:36Z, END 23:08:07Z, exit 2; ONE error, in my file only: `TS4104 readonly Production[]` → mutable `activeProductions` at the `withRows` parameter (:318). Fixed by annotating the parameter `GameState['studio']['activeProductions']` (type-only; no runtime change). Log `580-T-typecheck.log`.
4. Final vitest run on the final bytes (SHA `3389cc84…`): START 23:08:45Z, END 23:08:52Z, exit 1; **Test Files 1 failed (1); Tests 1 failed | 4 passed (5)**; failure = case 1 `:287:37` `AssertionError: expected 59177 to be greater than 59177`; `B4_BILL_580` / `B4_CLOSES_580` lines as quoted. vitest v2.1.9. Log `580-T-final-vitest.log`.
5. `npm run typecheck` run 2: START 23:08:52Z, END 23:09:58Z, **exit 0, 0 TS errors**. Log `580-T-typecheck-2.log`.
Nothing else ran (no other suite, no record-check, no bridge/UI tests). The brief said typecheck "once"; the second run was required to prove the annotation fix clean and is disclosed here.

## Ambiguities resolved (the writer must honour)
1. **Case 1 plan/horizon** (579 §2 item 1 "no commands is fine"): `world().unscheduled`, ONE plan with `commands: []`, horizon now+1; the route's freedom from grants/releases is asserted from provenance, not assumed. The writer must keep every non-bill output identical under the swap (trace, provenance, holds, projection) — the test compares them `toStrictEqual`.
2. **Facilities normalisation** (579-B Q7): both forms — asserted equal to the respective input array, then sorted by id for the cross comparison. `preparationWork` is the ONLY excluded field.
3. **Three distinct productions for the out-of-order workflow duplicate** (replay :660 precedes :662/:663; :662 refuses duplicate productions with the same message, so a 2-production state cannot reach :663 with an inversion): `trio()` = `richFoundedStudio('p13a-production-consumer', { actor: 9, director: 3, writer: 3, craft: 3 })` → `activateStudioOperations` → `initializeHollywood(…, 'fresh')` at week 0 → two `greenlight`s via `productionPayload(state, 0|1)` → tick until no `development-casting` reservation is held (2 real ticks) → third `greenlight` at week 2; asserted 3 distinct ids, empty `productionQueue` (replay :629 would context-cut first), 1:1 workflow join, `makeSave` validated. Shared helper modules (`./contracts/_contractFixtures.js`, `./helpers/p14b2-fixtures.js`) are imported exactly as the existing replay tests import them; the test-file-local builders (`world()`, `startedSource`, the input shape) are COPIED, per the brief.
4. **Message pin is anchored** (`^…$`); C7's `sortedOutput` route must leave the `equal` walk's `invariant(…, 'duplicate consumed identity')` message untouched.
5. **Non-fixed route = Started `world().ready` now+5**, not a Ready admission route (one fixture family; the Post grant/exit is the only non-fixed close a Started route performs; `closePath` :1892/:1986 close prepare-time FIXED rows). Fixed route = `world().ready` now+2 as the brief names.
6. **Closed-ness** = `until ≠ { week: horizonEndWeek, step: 0 }` (:542; every hold runs to `end` :755/:1647), with the fixed-hold `until` receipt check guarding the derivation.
7. **Key-set pins are order-sensitive `Object.keys` equalities** on the three trace/result-level arrays only (the brief's list); per-path `additionalHolds`/`holdReplacements` (:1784, `[]` for existing pictures) are not pinned. C6's `HOLD_COPY`/`FIXED_HOLD_COPY` must be built from exactly these key lists; the test pins the ledger schema, not the constant's value.
8. **Caps literal** `{ work: 200000, span: 220, alternatives: 1024 }` re-literalled from kernel :117 (not exported) — a cap, not a bill.
9. **Two extra `B4_CLOSES_580` lines** (beyond the brief's single `B4_BILL_580`) carry output-derived close counts and bills for the two case-3 routes so the parent's re-measurement rows have a receipt (expected post-writer delta per 579 §1: C7 + 153 × nonFixed + 187 × fixed with fixed 3 / non-fixed 0 at now+2 and 3 / 1 at now+5 — paper, NOT pinned).

## Unconstructible items
None. Every precondition held on unchanged source.

## Evidence limits
- Observed bills (59177; 107889; 172434) depend on this file's trace keys (`580-c7-facility-order`, `580-c6-wrap`, `580-c6-post-exit`) and `claimPersonIds` (cast leads), so they are NOT comparable to 538's 108265 (`world().ready` now+2 under the enumerator's claims/trace key); they are this file's own receipts only.
- The file was authored and run against source identical at HEADs `e444b224` and `20f6b8ef` (docs-only move); not re-run after the HEAD move because no source path changed (verified by `git diff --stat`).
- GREEN side (post-writer) not executed; the "after C7 strictly greater" expectation is 579 §1/579-A §3 paper (walk prefix + full sort on the inverted array vs 504 on founding order).
- Dev run 1's trio failure was a fixture-construction error in my file (phase-name wait), not a product finding; dev run 2 and the final run are byte-different only by that fixture wait and the TS4104 parameter annotation.
- The `record-check.mjs` baseline was NOT run (parent-owned).

## Next concrete action for the parent
Save this hand-back verbatim as record 580; run the unchanged-source baseline `node docs/engineering/playability-launch-review/evidence/p14b4-20260919/record-check.mjs <fresh-name> node_modules/.bin/vitest run --project core tests/p14b4-replay-bill-reductions.test.ts` (expect exit 1; `Tests 1 failed | 4 passed (5)`; the sole failure at `:287` case 1 `>`; `B4_BILL_580 … "original":59177,"swapped":59177,"delta":0,"equalToday":true`; `B4_CLOSES_580` 3/0 and 3/1); install the file; release ONE sim-core writer on 579 §1's five ranges (C6 then C7, two commits). After the writer the same command must exit 0 with 5 passed, `B4_BILL_580` delta > 0 (swapped > original), `B4_CLOSES_580` close counts unchanged (3/0, 3/1) with both bills lower by C7 + 153 × nonFixed + 187 × fixed; any residual is a finding.
