# 527 — Bounded independent re-review of the 526 correction: KEEP

2026-09-20. Project `contract-auditor` profile, READ-ONLY, model override fable, observed as
Fable 5.1. It read only the frozen 526 snapshot copies (candidate `d5f8cb71…1eb22`, the 517
predecessor, the exact production patch `add13897…8b51b5`, the 526 handback), the 518
record, 176 and the owner `allocateForPhase`. Verdict: **KEEP** — the 526 hunk is exactly
the correction 518 defect 1 specified, lawful under the `Work.calc` node rule (`calc(32)`
for a 9-node tree; the hoist form would have needed a second line change), restores 8578
at rT6 and leaves 8099 at rT7, and its only behavioural side effect is +16 units of
self-charge in `used` per single-early frame. No defect in the hunk.

## Parent addendum (record-only items, no source change)

- `used` against 525: +16 at the week-3 frame, +196 at week 4 (16 self-charge + the 180
  larger reservation), +212 cumulative thereafter — exactly what 534 measured. The 526
  handback's "+32 after week 4" describes the self-charge alone.
- 518's line citations shift +1 for lines ≥ 1358 in the 526 numbering (1359→1360,
  1512→1513, 1568–1569→1569–1570). 518 defects 2 and 3 remain record-only.
- Record-only defect 4 (pre-existing 505/517 content, KEPT by 518, outside the 526 hunk):
  the rT7 single-early requirement-walk bound 405 ≤ 410 assumes the fixture's two soundstage
  facilities; the single-early guards do not bound the stage count, so a lot with four or
  more stages whose only bindable set sits on the last-sorted stage could exceed the term by
  paper arithmetic (no measured control moves; executed ≈ 255 on this fixture). The minimal
  lawful repair would use the already-read `stages` fact (e.g. `calc(16).times(stages,
  4 + text)` on the rT7 arm), moving label 3 and requiring re-measurement; deferred to a
  later slice with independent review, not reopened here.
- Cosmetic: the 526 handback's diff heading cites "1353–1356 / 1359" where the 526 text is
  1354–1358 / 1360; the diff body is correct.

## Verbatim 527 handback (SHA256 `1c4fa684c19bdfcd084085dcfc68f5acb3777613e7d1dc8a631476b5e62dcf66`)

> **Verdict: KEEP** — the 526 hunk is exactly the correction 518 defect 1 specified, lawful under the `Work.calc` node rule, restores 8578 at rT6 while leaving 8099 at rT7, and its only behavioural side effect is +16 units of self-charge in `used` per single-early frame. No defect in the hunk. Two record-level notes and one adjacent (pre-existing, outside-the-hunk) observation for the parent below.
>
> **Status: DONE.** Read-only; no file created/modified, no command run, no delegation. Model observed: harness identifies me as Fable 5.1 (`claude-fable-5-1`). The lean-ctx MCP tools named in the user CLAUDE.md were not exposed; Read/Glob/Grep only. Live worktree replay file not opened.
>
> ## Sources read (absolute paths)
> - Snapshot `/Users/zacheryspector/The-Movies-recovery-snapshots/20260920T162801Z-526-frozen-candidate/`: `SHA256SUMS.txt`; `526-precall-bills-rt6-width-correction.md` whole; `526-protected-patch.patch` whole; `526-promiseCapacityOwnerReplay.ts` 118–347 (LITERAL/Work), 936–975, 1040–1069, 1168–1229, 1255–1453, 1454–1588, 2410–2449, 2780–2797; `517-promiseCapacityOwnerReplay.ts` 1168–1229, 1255–1384, 1453–1587, 2409–2448, 2779–2796.
> - Worktree `/Users/zacheryspector/The-Movies-headless-program`: `docs/engineering/playability-launch-review/evidence/p14b4-20260919/518-precall-bills-delta-review.md` whole; `.../176-started-replay-work-contract.md` whole; `src/core/operations.ts` 284–427; `src/core/productionPhases.ts` whole; grep of `tests/*.test.ts` and `src/**/*.test.ts` for `preparationWork`.
>
> ## Item 1 — Delta is exactly one hunk: MET WITH EVIDENCE
> - 526 1354–1358 (five comment lines) replace 517 1354–1357 (four); 526 1360 `work.calc(32).times(2 * d.f, 2 + (shooting ? text : capabilityText)), 2 * capabilityText,` replaces 517 1359 `work.calc(16).times(2 * d.f, 2 + capabilityText), 2 * capabilityText,`. 526 1359 and 1361 equal 517 1358 and 1360.
> - Direct comparison: 517 1255–1353 = 526 1255–1353; 517 1361–1383 = 526 1362–1384; every 517-touched region byte-equal in both copies (allocationBill 1172–1225; occupiedKey 1316; sweepBill 517 1474–1516 / 1560–1574 = 526 1475–1517 / 1561–1575; admission 517 2422–2426, 2436 = 526 2423–2427, 2437); tails 517 2779–2796 = 526 2780–2797.
> - Hunk locality: the 526 patch (HEAD→526) has nine git hunks, all inside the four regions 518 item 1 enumerated for the 517 patch; any 517→526 edit elsewhere would have produced a new hunk. Mechanical counts across both copies: `work.pay(` 475/475, `work.calc(` 279/279, `calc(32)` 111→112, `calc(16)` 59→58, lines with `shooting` 42→43, lines with `capabilityText` 7→8, non-blank lines 2756→2757, total 2796→2797. All consistent with exactly this hunk.
>
> ## Item 2 — Lawfulness of the `calc(32)` form: MET WITH EVIDENCE
> - Rule: `Work.calc` doc 526 252–257 ("two units per scalar operand-read/operator: 8/16/32/64 cover <=4/8/16/32 nodes"; receiver evaluated before arguments; nested paid calls own their trees). `calc(32)` at 1360 pays 32 before JS evaluates the two argument expressions (1257 `calc(units) { this.pay(units); return this }`).
> - Tree at 1360: `2`, `*`, `d`, `.f`, `2`, `+`, `shooting`, `?:`, arm read (`text` or `capabilityText`) = 10 static / 9 executed on either frame (518's method counts `d.f` as two nodes; nine if counted as one). 9 > 8, so `calc(16)` would be one node short; ≤ 16, so `calc(32)` is the minimal in-place allowance. The enclosing `calc(64).plus` tree at 1359–1361 is unchanged in node count (the inner call is one node regardless of its literal).
> - `shooting` bound at 1270, `text` at 1308 (under `pay(40)` at 1307): both are already-read local scalars, so reading them in the tree costs only the nodes counted above; no variable walk, callback, string operation or spread is introduced (176 §1). No `work.pay` added or moved (475 = 475; all compared regions identical).
> - Hoist form (b) count CONFIRMED: `pay(12)` at 1342 = 6 nodes; 1343 executes 4 on either frame (`shooting` read, branch, `sceneryCapacity` read or the self-paying `calc(8).times` call counted as one node, binding write) leaving 2 spare; the hoist needs 4 (`shooting`, branch, arm read, write) — short by 2, so (b) under 1342 would require `pay(12)`→`pay(16)`, a second line change. 518's "has spare nodes" was true (2) but insufficient. Observation, not a defect: `pay(40)` at 1307 (20 nodes) covers eight bindings at 1308–1316 (≈16 nodes), so a hoist placed after 1309 would have fit with zero margin and no `used` side effect; (a) with 6 spare nodes is the more robust choice and was explicitly authorised by 518.
>
> ## Item 3 — Values: MET WITH EVIDENCE (paper arithmetic from 526 source and `Work` formulas; 514 dimensions d 28 / f 5 taken from 518/526)
> - `equality(l) = 1 + 2l` (526 298–301): text 57, capabilityText 39. `times(10, 41) = 410`; `times(10, 59) = 590`; delta 180.
> - rT6 requirements recomputed from 526 1359–1361: 30 + 3×capabilityKey(keyBill(1,19) = 20 + 39 = 59 → 177) + walk + 2×39 + reservationCopy (five keys 12/10/10/4/5 → 1 + 56 = 57) + 6 + keyConstruction 106 + occupiedKey keyBill(1, 54) = 55 + 109 = 164. With 410: 1028 (518's figure, confirmed); with 590: 1208. Flows linearly: `allocation` 1369 (+180 → 5472), `entries` 1384 with `attempts` = 1 at rT6 (1383, `shooting`) (+180 → 6133), return 1413 (+180 → 8398 → **8578**), matching 516's expectation.
> - rT7: `shooting === false` takes `capabilityText` → walk 410 unchanged → 8099 unchanged (nothing else in the arm differs).
> - rT6 static bound (operations.ts 375–391, 394–415; `requirementsForPhase('shooting') = ['soundstage','set-scenery']`, productionPhases.ts 58): `soundstage` takes the retained arm — `facilities.some` ≤ f × (2 + text) = 295; `set-scenery` walk ≤ f × (2 + capabilityText) = 205 plus one `capability === 'soundstage'` on the scenery facility ≈ 21–22 (`boundSet` is null under `retainingSet`, so no id compare at 398). Worst ≈ 521–522 ≤ 590; with a per-visit callback overhead credited (≈ 5 units/facility) still ≤ 547. Fixture-executed ≈ 322–330 (four id spans 51+36+44+45 = 176 before `facility-soundstage-07`, plus the scenery walk ≈ 146). `text` lawfully bounds facility ids: `d` is maxed over `operations.facilities` rows at 526 942–944 (`dimensionStrings`) before production/workflow widths at 1060/1069.
> - rT7 bound 405 ≤ 410 is unchanged by 526 (see adjacent observation below on what that 405 assumes).
>
> ## Item 4 — Side effect: MET WITH EVIDENCE, one record-wording correction
> - Only executed difference 517→526: at 1360, `used` grows by 32 instead of 16 (+16) on every frame that reaches 1360, i.e. the single-early frames (all `return null` guards at 1266–1288 precede it; sole caller 1445, once per `sweepBill`; result returned at 1446 without further comparison). `times` returns a×b independent of `used`, so bill values differ only through the rT6 argument (+180). `used` is observable only as `preparationWork` (2712, 2775) and through the `WorkLimit` boundary in `pay` (249).
> - No numeric pin: `tests/*.test.ts` reference `preparationWork` only relatively (≤ 200000, `toBe(edge.low)` / `toBe(work)` from discovered boundaries, `zeroPrior + 17`, cross-run equality, `toBe(200000)` saturated cut). `src/**/*.test.ts` contains none.
> - Correction to the 526 handback line 44 ("+16 after week 3 and +32 after week 4 against the 517 candidate"): the returned bill is paid in full at 1950 (`work.pay(calc(64).plus(bill, …))`), so against 517/525 the `used` meter moves +16 at the week-3 frame and +16 + 180 = +196 at the week-4 frame, cumulative +212 after week 4. The +32 figure is the self-charge alone. 534 should expect +212, not +32, wherever it compares `used`.
>
> ## Item 5 — Resolves 518 defect 1; defects 2 and 3 untouched: MET WITH EVIDENCE
> - rT6 now priced at `2 + text` per facility × 2f, a static bound over the guarded domain (item 3); the 1354–1358 comment now states the retained-arm id-compare reason correctly ("IDS" capitalisation is cosmetic).
> - 526 1513 still `work.calc(16).add(retainedClaims, …)` (518 defect 2) and 1569–1570 unchanged (defect 3): both remain record-only, as 518 routed. Line citations in those records shift +1 for lines ≥ 1358 (518's 1359 → 1360, 1512 → 1513, 1568–1569 → 1569–1570). Nit: the handback's diff heading "1353–1356 comment and line 1359" matches none of the HEAD/517/526 numberings exactly (526: 1354–1358 and 1360); the diff body is correct.
>
> ## Adjacent observation — outside the 526 hunk, 517 content 518 KEPT; corrects 518 item 4's rT7 "domain worst" sentence (paper calculation, LOW severity, record-only recommended)
> 518's rT7 figure 405 = 5×41 + 2×(39+2+59) assumes TWO soundstage facilities. That is the 276/302 fixture's composition, not a guarded fact: the single-early guards (1266–1288) do not bound `stages` (counted at 1291–1300, used by `composite` 1367 and `freeSlots` 1348, not by `requirements`). At rT7 `boundSet !== null` during the walk, so every soundstage visited before the mounted one evaluates operations.ts 398's `facility.id !== boundSet.mountedOn` (width up to d); the mounted stage is the first in id order with a free slot AND a bindable set, so a lot whose only set sits on the last-sorted stage visits all of them. With the whole-term slack at rT7 credited (second unexecuted walk 205 + two unexecuted `capabilityKey` 118 + one unexecuted `capabilityText` 39 = 567 at f=5): under 518's widths (41/facility, +100/visited stage) 3 stages → 505 ✓, 4 stages + dev → 605 ✗; under a tight per-node model (35/facility, +90/visited stage) 4 stages ✓, 5 stages + dev (f=6, allowance 649) → 660 ✗. No measured control moves (fixture 2 stages, executed ≈ 255 ≤ 410), and the same non-scaling per-facility structure predates 517 (505 used `2 + text` per facility; the general arm at 1224 likewise — not audited here). Minimal lawful repair, if ever wanted, uses the already-read `stages` fact (e.g. add `work.calc(16).times(stages, 4 + text)` to the rT7 arm) — that would move label 3 (8099) and require re-measurement, so I recommend recording it as a 518-style record-only item (defect 4 / rT7 stage-count conditionality) rather than reopening the writer for this slice. This does not affect the 527 verdict on the hunk.
>
> ## Evidence limits
> No execution; every figure is hand arithmetic from the frozen 526/517 text and the 518/526 records (514/525 not re-opened). The 517 patch itself was not opened; "nothing else changed" rests on 518's hunk enumeration, the 526 patch's hunk locality, direct region comparison and the pattern counts. `dimensionStrings` body not opened (assumed to include `row.id`, consistent with 176 §7 "all consumed groups"). Pre-existing `pay` blocks of `singleEarlySweepBill` (505/517 content) and the general arm's pricing of the 398 compare were not recounted.
>
> ## Next parent action
> Qualify the frozen 526 hash `d5f8cb7171f602df76b2115819e7e63320b84b4f7e602fb5811ad57984b1eb22` (2797 lines) as the corrected candidate; run 528–533 and the 534 passive re-measurement requiring 315 / 6861 / 8099 / **8578** / 850 / 7948 / 576, 5668 on the unreached Post exit, 708 restricted, 3913 admission, with `used` expected +16 at week 3 and +196 at week 4 (+212 cumulative) versus 525; transcribe the +1 line shift into the 518 citations; record the rT7 stage-count observation as record-only alongside 518 defects 2 and 3.
