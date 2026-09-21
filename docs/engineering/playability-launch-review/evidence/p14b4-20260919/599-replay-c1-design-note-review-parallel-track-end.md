# 599 — Parallel track, last item: replay bill reduction C1 (calculator execution structure, with C5's static widths as module-init constants) — design note (599-A) and review (599-B)

2026-09-21. Claude Code parent. Record 598's "Next (bounded)" opened C1 only as a bounded
READ-ONLY design note, with the honest premise that it closes no route (the stale route's gap is
≈ 28k after C6+C7) and moves no certificate bound; its value is a cleaner calculator whose
reserved-but-unused bucket capacity stops being charged, with every bill VALUE byte-identical.
A sim-core READ-ONLY design note (599-A) read the calculator model as implemented, tabulated
every `calc(k)` site on the current `src/core/promiseCapacityOwnerReplay.ts` (2809 lines, SHA256
`9e97ffed9911af55a1a5ff5e819cf53c17dfc3214bc729cc995ae72cb956ebd5`), and stated whether the
slice is worth its review cost. The contract-auditor reviewed READ-ONLY (599-B). Nothing in
source changed; no cap, tariff, refusal, deadline or test moved.

## Decision (parent, after 599-B): C1 is NOT opened; record 599 ends the parallel track

Both specialists reached the same conclusion from the numbers, and the parent adopts it. The
note (599-A §8) recommends "do NOT open C1 now"; the review (599-B Q7/Q8) concurs: KEEP the
note as a record, REFINE items only, none blocking. Grounds, as measured on paper:

- C1 with every layer (bucket right-sizing L1, the seven structurally-zero hunks H1–H7, the
  C5(i) literal constants) saves ≈13–15k on the stale route prefix (≈12.6–14.6k under the
  auditor's A′ convention), ≈11–12k on the first-take route, ≈3k on 538 scenario 1 and ≈0.2k on
  prepare-only. The stale route's gap after C6+C7 is ≈28k (598): the cut moves from the w8
  sweep reservation to w9/w10 and stays `workLimit`. No route closes. The 576 bound (complete
  set fits only at now+2; now+3 ≈253k) does not move. Even C1 + C9 + C10 on paper (≈22–24k)
  stays short of 28k, and C9/C10 need Owner rulings (578).
- Its price is the program's one production-writer release spent on ≈250 edit points in the one
  module (244 bucket literals on 282 lines, seven hunks, six constants), a receipt-literal RED
  that goes stale at the next slice, four passive re-measurements with a new bill-value
  identity check, an auditor convention ruling and the full 579→598 record cycle, for no route
  or certificate movement. The auditor recommends against the fallback (commit 1 + H1 + C5(i))
  for the same reason; the parent does not take it.
- Reopening condition, recorded: an Owner ruling under 578 (D2 kernel budget, 515 §6 stale
  route, C9/C10 tariffs) that makes ≈13k load-bearing for closing the stale route. Until then
  the note, the site table and the two scripts are the design; a later writer starts from them
  and from Rulings 1 and 2 below, not from a fresh survey.

Nothing in source, tests, caps, tariffs, refusals, deadlines or timeouts changed. No RED was
installed, no writer released, no re-measurement run. HEAD stays `48a43511075b` at the start of
this record; this record and the archived artifacts are the only commit.

## Rulings recorded (599-B; parent authority for the design, not Owner acceptance)

- **Ruling 1 (counting convention).** Convention A (each `.member` one node, bare base local
  not counted, literal/operator one, ternary one with both arms, nested `calc` chain one
  result) governs, except at a module-helper-call site whose argument evaluation is named by
  no adjacent labelled block pay and no labelled entry pay of the helper; there the invocation
  and each argument count in the outer tree (A′). Per site: A stands at :1139:2, :1143:1,
  :1177:1, :1178:1, :1578:1, :1581:1, :1585:1, :1590:1, :1838:1, :1876:1, :2618:1, :2572:1,
  :2594:1. A′ governs at :1347:1 → 32 (not 8), :1399:1 → 32 (not 16), :1422:1 → 32 (not 16),
  :2447:1 → 32 (not 16), :2513:1 and :2517:1 → 16 (not 8); :2331:1, :1845:1, :2607:1 stay 16
  and :2482:1 stays 64 (20 nodes; the strict table already flags it): not lowered. Cost of A′
  against the note's A figures ≈0.3–0.4k on the stale prefix.
- **Ruling 2 (`:1423:1` and the other textual under-reservations).** Record only; outside C1.
  C1's law is "buckets may only fall, bill values byte-identical"; a +16 self-charge moves
  `used` in the direction the bill-identity probe would have to explain. The six sites
  (:352:1 covered by :351 `pay(6)`; :1175:1 36 nodes, above any bucket; :1423:1 a real 2-node
  gap; :1525:1 covered by :1522; :2383:1 a real 5-node gap per workflow row after :2382's
  unlabelled `pay(10)`; :2413:1 plausibly covered by :2412's unlabelled `pay(16)`) form one
  separate 176 §1 lawfulness item with its own +N paper, if ever wanted.

## Corrections to the note (599-B D1–D3; the verbatim body in §4 is left as written)

- D1: the route model applies the both-zero occupancy figure (+134) to w2, where only
  `occupied` is zero (claims = 1): 124 − 16 = 108, so w2 L2 = 256 (not 282), w2 total 1968
  (not 1994), all-layers stale prefix 12320 under A (not 12346). Immaterial to the decision.
- D2: the §5(i) constants would be inserted after :254 (`FIXED_HOLD_COPY`), not :253
  (`HOLD_COPY`); verified on the module bytes (:253 `HOLD_COPY`, :254 `FIXED_HOLD_COPY`).
- D3: H6 is stated in §4 as "+102 on rT7" with no guard pay; the table, the TSV row and
  `599-A-route-model.py` :68 use the separate-statement form with `pay(6)` (+96 zero / −6
  nonzero). The separate-statement form is the one the numbers assume; an inlined ternary
  would lift the outer tree to calc(32) (+86 / −16).
- Cosmetic: §2's method line cites are off by up to three (`pay` :260-263, `add` :301-304,
  `times` :305-309, `keySpanBill` :324-327; the comparator-bound pay is :396). The script
  docstring cites :1503/:1573 where the precedents sit at :1522/:1572.

## Artifacts archived (this folder; SHA256 verified equal to the scratchpad originals)

| file | bytes | SHA256 | what |
|---|---:|---|---|
| `599-A-calc-sites.tsv` | 70202 | `5a9db92a4938b3ebb1d5b9e42afffe8489fbdec14e986d10704dfcbf5fedea63` | 481 `calc(k)` sites on 282 lines, convention A with the strict columns merged; the record of the site table |
| `599-A-calc-sites-strict.tsv` | 62098 | `693caf5fbd29f9e9a879edca08e420c7e3d5981714b87ca8e5104f094d435016` | the same sites under the strict convention |
| `599-A-count-calc-sites.py` | 9637 | `2a5cbd67cb8af180d2a83a6f008e00f2eac5b4d9c51acfa9999c16800a159540` | site enumerator / node counter (rerunnable on any candidate; `STRICT=1`) |
| `599-A-route-model.py` | 8355 | `18b484d59c610e2f1fc5f3ea5e62ddecadbd7be16701ae49f4807e1e96dc60e6` | paper route model (carries the D1 slip at w2, uncorrected) |
| `599-A-calc-skeleton.tsv` | 28623 | `f34c79b6df8535fe84a2433a16554604d55c1d4693a81af573ea0f1c13a3e48c` | partial artifact (line, ordinal, calc text; 481 rows) of the FIRST 599-A dispatch, terminated by the model limit before reporting; superseded by the two TSVs, kept as provenance |

Specialist dispatch: the first 599-A agent (Fable 5.1) was terminated by the model limit; the
parent re-dispatched the same brief as a two-stage sequential workflow (`wf_9b3e26bd-022`:
sim-core 599-A, then contract-auditor 599-B, both on Opus 5, one specialist at a time; 98 tool
uses, ≈483k subagent tokens). Both returns were saved verbatim from the workflow journal
(599-A 26214 bytes SHA256 `387373d01b628893bfc29a8a98926aa9dcd30d3fad663b772d16602d7ed86a5a`;
599-B 19556 bytes SHA256 `c9b9f304e7c0e773281e5123934de141b7d18e1ecd5dc15bcf2304656aa7819a`)
and appear unedited in §4. No agent edited, ran, hashed or committed anything; the tree was
clean at `48a43511075b` before and after both.

## Record-only items carried

- From 599 (new): Ruling 2's six textual under-reservations (one future 176 §1 item); C5(ii)
  (bill VALUE changes at :1494:2, :1133, :1236:2; ≈1.0k value + 0.4k self on the stale route)
  stays closed as 579 left it and must never share a commit with a bucket change; the RED
  shape for any future C1 slice is a receipt-literal ratchet (`< 180022` cited to
  `597-post-514-firsttake.txt`) whose comment must name the receipt and say a later lawful
  bill rise re-derives it; bill-VALUE identity is the parent's 514-pattern passive probe, not a
  vitest assertion (176 §8, no new seam); any future writer release is four commits
  (L1 sweep layer → L1 rest → H1 + C5(i) → H2–H7) with a bill-value probe after each and the
  counter script re-run on the candidate; `CEILING`/`EQUALITY_SATURATION_LENGTH`, `copyLiteral`
  and the two hold-copy constants, `searchBill`, `boundedStableSort.ts`, the four `uniqueIds`
  sites and the :1991 second sort are NOT writable in that slice; :1243 `keyLength` could move
  inside the H3 guard (preference).
- From 598 (unchanged): the ten 598-R items; the 576 rows are historical after 597.
- From 574-R (nine), 553-R items 2–6, the designated failures (stale-target :234 with
  `workLimit`; trust-chooser test 6; bridge OLD TS2353): unchanged.
- Owner items (578): D1 evaluator-4 definition, D2 kernel budget (538-C §2), 515 §6 stale
  route and the C9/C10 tariffs, the 576 bound. All stand; nothing here is Owner acceptance, a
  cap/tariff ruling or a 302 closure.

## Next (bounded)

The parallel track (515 §3 C5–C7 → 576 disposition → 579/598 C6+C7 → 599 C1) is closed. The
detached certificate track is at its lawful bound (576). The program's remaining bounded
engineering waits on the Owner's rulings in record 578; no live wiring, rulesVersion,
Save30/projection movement, cap or tariff change is authorized. Unity/native work stays
deferred. If an Owner ruling arrives, the next slice starts from 578 and, for C1, from this
record's Rulings 1 and 2 and the archived site table.

## 4. Verbatim specialist reports

### 599-A — sim-core READ-ONLY design note (Opus 5; workflow agent af4355b79e9a15d8f)

**599-A — READ-ONLY design note: replay bill reduction C1 (calculator execution structure) with C5 static widths as module-init constants**

Status: DONE (design note; no source, test, Git or runtime change). Artifacts (scratchpad, for the parent to archive with record 599):
- `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/599-A-calc-sites.tsv` — 481 rows (one per `calc(k)` invocation), 70202 bytes, SHA256 `5a9db92a4938b3ebb1d5b9e42afffe8489fbdec14e986d10704dfcbf5fedea63`
- `…/scratchpad/599-A-calc-sites-strict.tsv` — same sites under the strict convention, SHA256 `693caf5fbd29f9e9a879edca08e420c7e3d5981714b87ca8e5104f094d435016`
- `…/scratchpad/599-A-count-calc-sites.py` — the site enumerator/node counter (rerunnable by the auditor on any candidate; `STRICT=1` for the strict convention), SHA256 `2a5cbd67cb8af180d2a83a6f008e00f2eac5b4d9c51acfa9999c16800a159540`
- `…/scratchpad/599-A-route-model.py` — the paper route model (multiplicities from source reading), SHA256 `18b484d59c610e2f1fc5f3ea5e62ddecadbd7be16701ae49f4807e1e96dc60e6`

## 1. Identity
- Worktree `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`, HEAD `48a43511075b29d9ad4321c5c8d9929cf6caebb2`, `git status --short` empty before and after this work (verified twice).
- Model observed: Opus 5 (1M context), `claude-opus-5[1m]`.
- `src/core/promiseCapacityOwnerReplay.ts`: 2809 lines, SHA256 `9e97ffed9911af55a1a5ff5e819cf53c17dfc3214bc729cc995ae72cb956ebd5` (matches 598's C7 commit `21569c7c`).
- Records read: 176 §1/§5–§8; 515 §3 and 515-A item 2 (§7); 579 §1–§3, 579-A §2–§8, 579-B Q4/Q5; 598 (identity, verification, carried items, "Next (bounded)"); 576 :30-56; the 597 stale/first-take/538 outputs and the 514 patch; `types.ts` :592-648.

## 2. The calculator model as implemented (source facts, quoted)
- `Work.pay` :259-262: `if (units > this.limit - this.used) { this.used = this.limit; throw new WorkLimit() } this.used += units`.
- `Work.calc` :264-269: `/** Evaluate the receiver BEFORE JavaScript evaluates calculator arguments. Each source call reserves two units per scalar operand-read/operator: 8/16/32/64 cover <=4/8/16/32 nodes respectively. Nested paid calls own their own trees, not this allowance. No callbacks/rest arrays are hidden. */ calc(units: 8 | 16 | 32 | 64): this { this.pay(units); return this }`. So `work.calc(k).m(args)` pays `k` first (JS evaluates the callee `work.calc(k).m` before the arguments), then the arguments run (nested calc chains pay their own `k` as reached), then the method pays its own body.
- Method self-charges: `plus` :277 `this.pay(20)` + `add` per extra operand (:270-276 doc: "Entry/optional-argument guards cost20; each of the k-1 saturating adds costs8"); `add` :298 `this.pay(8)`; `times` :302 `this.pay(10)`, `if (a === 0 || b === 0) return 0`; `equality` :311 `this.pay(20)`, `length >= EQUALITY_SATURATION_LENGTH ? CEILING : 1 + 2 * length`; `keyBill` :315 `this.pay(64)`, `base + count * unit` with `base = 1 + length`, `unit = 1 + 2 * length`; `keySpanBill` :323 `this.pay(20)` + nested; `copyCost` :332-338 pays per key and `this.calc(8).add(cost, 3 + key.length)`. Seven sites use `work.calc(K).pay(expr)` (:2478, :2572, :2585, :2590, :2594, :2607, :2634): the bucket covers `pay`'s argument tree.
- "Counted nodes, 2 per node" in this code: the bucket `k` is the reservation for the scalar operand-reads/operators in the argument text of that one method call; nested `work.calc(..)` chains are excluded (they carry their own bucket) and contribute one passed-result operand. Overflow of `k` is NOT detected anywhere: a tree with more than `k/2` nodes is simply under-reserved (a 176 §1 lawfulness defect, not a runtime error). If `k` does not fit `limit - used`, `pay` throws before any argument arithmetic runs, so a cut always precedes the unreserved steps.
- 176 §1 :34-36 (the accepted model): "`reserve(units)` checks … if it does not fit, set used=limit and stop work BEFORE the associated operation … Reserve each cost-calculator scan/arithmetic step before doing it too. The constant counter/check dispatcher is the accounting mechanism, not a recursively self-charged operation." 176 nowhere states "2 per node"; that convention is the module's own doc at :265-268 (cited by 515-A item 2 as "2/node, 176 §1 accepted model").
- Precedent for counting members: :1522 `work.pay(24) // visit/control, five property reads, null test, selection and sum` for `operations.workflows` + `row.reservations.length` + `row.bindings.setId` (+ `row.shootingTask`): each `.member` is a read; a bare base local is not a separate read. Precedent for helper-call arguments being reserved outside the calc tree: :1572 `work.pay(40) // selector/local and both five-argument transition-helper calls`; :1142 `work.pay(16) // scalar decoration/comparator arithmetic, excluding paid helpers`; :399 `work.pay(8) // comparator-bound argument reads/arithmetic before sortBill`.
- What C1 removes: only reserved-but-unused bucket capacity (a `calc(64)` over a 4-node tree reserves 28 nodes that never exist), evaluations of calculator subtrees whose result is provably unused or multiplied by a paid-zero fact, and per-call re-computation of pure-literal subtrees. Lawful because a reservation is for a step that is done; a step that no longer exists (never written, never executed) is not reserved (176 §1 :35). NOT touched, and what WOULD be a price change: any `pay(N)` argument, any per-node price (the 2, the 20/8/10/20/64 bodies, `CEILING`, `EQUALITY_SATURATION_LENGTH`), any `LITERAL`, any bill function's returned value, any width fed to `equality`/`keyBill`.

## 3. Site table (summary; the TSV is the record)
Counting convention A ("precedent", the recommended one): literal = 1; each `.member` = 1 (bare base not counted; a bare scalar local = 1); operator = 1 (`?:` = 1, both arms counted, i.e. the tree as written); nested calc chain = 1 (result); module helper call (`sortBill`, `smallTransitionBill`, `workflowUpdate`, `orderBill`, `geometryBill`, `allocationBill`, `arrivalBill`, `searchBill`, `freelancerBill`, `readyOccupancyBill`, `initialAdmissionBill`, `work.copyCost`) = 1 (result; argument evaluation reserved by the helper's entry pay or the caller's adjacent block pay, per the precedents above); native `Math.*` = call node + argument nodes. Convention "strict" (second TSV, merged as columns `nodes_strict/proposed_k_strict/delta_strict`): every identifier segment counted AND helper-call argument nodes counted in the outer tree. Proposed `k` = smallest of {8,16,32,64} with `k/2 >= nodes` (the `calc` signature is kept; exact `2n` widths would change the documented model and remove the auditor's slack; not proposed).
- Sites: **481** `calc(k)` invocations on 282 lines (200×8, 62×16, 131×32, 88×64). Sites that fall: **244** under both conventions (the same set), static saving per single evaluation of every site **7000** (A) / **6016** (strict). No site rises (C1 may only fall).
- Textual under-reservations found (reported, not resized): `:352:1` (Work.token, 10 nodes at calc(16); the `typeof` dispatch is covered by :351 `pay(6) // loop/type dispatch`; Work not writable), `:1175:1` (restrictedSweepBill `control`, 36 nodes at calc(64), above the 32-node maximum; only the :1171 `pay(192) // at most96 scalar reads/operators` block could cover the excess), `:1423:1` (10 nodes at calc(16), no labelled adjacent block: a real 2-node gap), `:1525:1` (9 nodes; `row.shootingTask` sits in :1522's "five property reads", the remaining 8 fit), `:2383:1` (18 nodes at calc(16); :2382 `pay(10)` unlabelled), `:2413:1` (10 nodes at calc(16); :2411 `pay(16)` unlabelled). Under strict, 27 sites are flagged (list in the strict TSV); the 23 sites containing a helper call are listed in column `non_calc_calls_in_tree` so the auditor can check each adjacent block pay.
- Per bill function (sites that fall / static units, convention A): admitReady 26/952, sweepBill 33/936, allocationBill 28/904, singleEarlySweepBill 30/784, freelancerBill 36/688, initialAdmissionBill 14/440, restrictedSweepBill 13/416, readyOccupancyBill 10/344, frame 9/256, readyProductionId 8/208, geometryBill 5/176, executeCommand 6/176, arrivalBill 6/168, smallTransitionBill 4/80, replayPlans 3/80, sortBill 2/72, company 2/72, workflowUpdate 2/72, orderBill 2/72, writers 2/64, prepare 1/24, sortedOutput 1/8, hasUsableRehearsalSet 1/8. Zero change: Work.copyCost, Work.token, dimensionRecordFacts, staticDimensionFacts, searchBill (discovery-side sites are all `calc(8).add` with 2–4 nodes).
- Paper route deltas (units; convention A | strict). Layers: L1 = bucket right-sizing; L2 = §4 hunks H1–H7 (net of their guard pays); L3 = §5(i) literal constants. Frame kinds from the 597 tables (`remaining` 8→2 at w1..w8; the 8th bill is computed before the cut):

| frame (597 `bill`) | path | L1 | L2 | L3 | total A | total strict |
|---|---|---:|---:|---:|---:|---:|
| w1 (315) | restricted, o=1 | 584 | 116 | 28 | 728 | 592 |
| w2 (6861) | retainedDevelopment | 1456 | 282 | 256 | 1994 | 1778 |
| w3 (8099) | singleEarly rT7 | 1360 | 352 | 212 | 1924 | 1692 |
| w4 (8578) | singleEarly rT6 | 1104 | 72 | 212 | 1388 | 1212 |
| w5 (850) | restricted, t=1 | 688 | 66 | 28 | 782 | 646 |
| w6 (7948) | wrapOnly/singleWrapSlot | 1672 | 498 | 116 | 2286 | 2054 |
| w7 (576) | restricted, c=1 | 640 | 206 | 28 | 874 | 738 |
| w8 (5668, then the cut) | singlePostExit | 1480 | 498 | 0 | 1978 | 1754 |
| two commands at w5 | assign + schedule | 392 | 0 | 0 | 392 | 312 |

Stale route prefix (8 sweep bills + 2 commands): **L1 9376 | 7808; all layers 12346 | 10778**, plus once-per-route Ready admission at prepare ≈ 2–3k (admitReady/readyOccupancyBill/initialAdmissionBill/readyProductionId static sums ≈ 1.9k plus loop multiplicities, freelancerBill ≤ 0.7k only if `!allContracted`) and Started/Ready prepare sites ≈ 0.2k. Today the w8 sweep reservation needs 200491 (`payFailure` used 194726, requested 5765); by paper it would fit after C1, and the cut moves later (w9 sweep / w10 command). The route still lacks ≈ 28k (598) minus ≈ 13–15k: **still RED, `workLimit`**. First-take route (6 frames + commands): **9494 | 8286** (+ admission ≈ 2–3k) against the 597 receipt 180022. 538 scenario 1 (frames rT5 + rT4, Started producer, no admission): **3068 | 2700** against 105351; prepare-only ≈ **200 | 192** against 29694; Ready prepare-only (16475) ≈ 0.2–0.5k (readyProductionId + prepare sites). The 515-A estimate (8–11k) is confirmed for L1 alone.

## 4. Structurally-zero and dead subtrees (hunk shapes; every value identical because `times(0, x) === 0` :303 and `add(a, 0) === a` :299 below CEILING)
- **H1 (largest; sweepBill :1483/:1486)** — `keyLength`, `keyConstruction` and `transition` are consumed only by the general arm :1583 `work.calc(32).times(2, transition)` (word-exact grep over :1445-1600); on `singleWrapSlot`/`retainedDevelopment`/`singlePostExit` (three of the eight measured frames) the 246 units are dead. Shape: delete :1483/:1486 and inline in the :1583 arm: `: work.calc(8).times(2, work.calc(8).plus(30, work.calc(8).times(4, work.calc(8).add(50, work.calc(8).times(2, d.d))), work.calc(8).times(8, work.calc(8).equality(work.calc(8).add(d.d, 26))), 160))` (comments :1484-1485 move). No new read, no guard: the ternary already selects. General path: identical charges, different order.
- **H2 (allocationBill :1201-1204)** — `rawOwners` (:1195, from `other = max(0, d.n − 1)` on wrapOnly/singlePostExit, `d.n` paid at discovery), `claims` (:1196) and `occupied` (:1197 or the caller-supplied `retainedOccupied` :1528) are paid locals; when 0 the four `times` subtrees are evaluated for a 0 product. Shape: `claims === 0 ? 0 : work.calc(16).times(claims, 6 + 3 * text)` and `occupied === 0 ? 0 : work.calc(8).times(occupied, …keyBill(occupied, keyLength)…)` inside `occupancy` (outer tree 15 nodes → calc(32)); raw's two guards net only +38 on the zero path and −32 on `n ≥ 2` routes (marginal; auditor's call). 176 clause: the guard reads paid locals (§1 "steps that no longer exist are not reserved"; §5 "branch-specific bill selected only by facts available BEFORE the owner invocation" — these are read facts, not owner outcomes).
- **H3 (smallTransitionBill :1248-1249)** — `before * after === 0` for (1,0,1), (0,1,1), (2,0,2), (0,0,0) (six of the eight calls on the stale route). Shape: `work.pay(18)` + `const pairs = before === 0 || after === 0 ? 0 : work.calc(8).times(work.calc(8).times(2, work.calc(8).times(before, after)), work.calc(8).add(2, work.calc(8).equality(keyLength)))`; `pairs` replaces the operand at :1248. +80 per zero call, −18 per nonzero call.
- **H4 (restrictedSweepBill :1178)** — `t + r === 0` (w1, w7): `workflowUpdate` (122 right-sized) computed for a 0 product. Shape: `work.pay(14)` + `const updates = t + r === 0 ? 0 : work.calc(8).times(t + r, workflowUpdate(d, work))`. +126 zero / −14 nonzero.
- **H5 (restrictedSweepBill :1174)** — `o === 0` (w5, w7): `keyBill(commitments.size, d.dp)` for a 0 product. `work.pay(10)` + guarded statement. +80 / −10.
- **H6 (singleEarlySweepBill :1340-1342)** — `rawClaims = shooting ? 2 : 0` is used only at :1342; replace the local by `shooting ? work.calc(8).times(2, work.calc(32).plus(LITERAL.claim, APPEND, 36, 2 * keyConstruction, 2 * text)) : 0` (the selector's nodes are the ones :1339 `pay(16)` already reserves for the removed ternary). +102 on rT7.
- **H7 (singleEarlySweepBill :1343)** — `d.external === 0` (paid, frame :1926): `keyBill(0, keyLength)` for a 0 product. `work.pay(10)` + guarded statement. +96 on rT7 and rT6.
- Excluded as marginal (guard cost ≥ saving, or reached by no measured route): `:1209:2-3` adoptions/placements (+28/−24), `:1208:2` selection (+16/−2), `:1346:2` (+18/−8), `:1180:2-4`, `:1247:2`, `:1250:1` (guard raises the outer bucket), the general `policyLock`/`setup` arms `:1500/:1503/:1504` and geometryBill `:1114` (not reached on any measured route). Requiring a NEW read: none of H1–H7; the excluded `:1250:1` would need none either, it is just not worth it.

## 5. C5 static widths as module-init constants
Two distinct things, kept apart:
(i) **Self-charge removal, values identical (belongs in C1)**: module constants next to `LITERAL` (:242-243 convention, like `HOLD_COPY`): `CAPABILITY_TEXT = 1 + 2 * 19 = 39` (`equality(19)`, 19 < `EQUALITY_SATURATION_LENGTH` :136), `PHASE_TEXT = 29`, `CAPABILITY_KEY = 20 + 39 = 59` (`keyBill(1, 19)`), `TWO_CAPABILITY_KEYS = 20 + 2 * 39 = 98` (`keyBill(2, 19)`), `RETAINED_RELEASE_PHASE = 40 + 4 * 39 + 2 * 59 + LITERAL.phaseRelease + 6` (the whole literal subtree at :1493 and :1392), `SINGLE_WRAP_RETENTION = 138` (:1225). Removed per-call self-charges: `:1179:2` 28 per restricted call; `:1321:1-2`, `:1322:1`, `:1392:1` 212 per singleEarly call; `:1493:1-3` 184 per retainedDevelopment call; `:1225:1-2` 116 per singleWrapSlot call; `:1228:1`/`:1230:1` 72. Domains verified in `types.ts` :592-597 (capability max `'development-casting'` 19), :606-612 (phase max `'postProduction'` 14), :622 (status max `'unassigned'` 10), :633/:638/:648 (blocker kind max `'facility-capacity'` 17). Adds no per-call charge (a constant read is one node, like the local it replaces).
(ii) **C5 proper = bill VALUE changes (579-A §2 (a), (c), (d2)); NOT C1**: (a) `:1494:2` `times(8, text)` → `times(8, CAPABILITY_TEXT)`: −144 per general-releasePhase frame (w6; 538/576 frame 61), self +0; (c) `:1133` `times(4, equality(d.d))` → `PHASE_TEXT + STATUS_TEXT(21) + BLOCKER_KIND_TEXT(35) + text`: −86 per workflow per arrivalBill call (9 calls on the stale route ≈ −774) and self −42 per call (the nested `:1133:3-4` go, one `equality(d.d)` stays); (d2) `:1236:2` in the wrapOnly arm → `2 + (wrapOnly ? CAPABILITY_TEXT : text)`: −90 at w6, self +8 (the selector lifts that tree to calc(16)). Honest net for (ii) ≈ 1.0k value + 0.4k self on the stale route, ≈ 0.4k on 538. Because (ii) moves bill VALUES it violates this task's hard constraint and must NOT share a commit with C1; if ever taken, its own receipts and a separate re-measurement law apply (the 579 C7 precedent). 579-A/579-B's "≈ 0.1–0.3k net" was computed with per-call `calc(8).equality(19)` bindings; module constants remove that objection but do not make (ii) byte-identical. Recommendation: take (i) inside C1; leave (ii) closed as 579 left it.

## 6. Pins that move / stay
- Re-grep after C6/C7 (`preparationWork|workUsed|ownWork|expectedWork` with `toBe|toEqual|toBeLessThan|toBeGreaterThan` over `tests/` and `bridge/`): **no absolute replay-bill pin exists.** Every assertion is the cap (`toBe(200000)`/`≤ 200000`), relative (`started-owner-replay :391/:392/:558/:592/:614/:621 (+17)`, `ready-owner-replay :654 (+17)/:759`, `replay-record-facts :182-183/:204/:214`, `enumerator-slice :443/:525/:734`, `adapter :575`), the adapter/enumerator's OWN tariff formulas (`:370/:410/:451/:494/:645`, `:701`), or the C7 witness `replay-bill-reductions :287` (`swapped > original`; C1 changes `:432:1` equally on both sides, the inequality survives). The `+17` offset tests transfer `input.preparationWork` and are untouched; the sweep-boundary binary search (`:571-585`) re-derives its edge.
- The 514 instrumentation prints per frame `used` (total at `sweepBillDone`, before the :1962 reservation) and `bill` (the sweepBill VALUE), plus the `dimensions` JSON, and `payFailure {used, requested}`. Under C1: all eight `bill` values (315, 6861, 8099, 8578, 850, 7948, 576, 5668) and every `dimensions` object must be byte-identical; every `used` falls by the cumulative §3 deltas; the stale cut stays `workLimit` but at a later frame/request (it no longer occurs at the w8 `:1962` reservation); first-take `result.used` falls from 180022; 538 `producerWork` from 105351, prepare-only from 29694.
- Evidence rows that go stale (records, never hand-adjusted): the 597 tables, 598's "197631 at the cut" lineage, 576/577 rows.
- RED brief (test-author; ONE new file or a new `describe` in `tests/p14b4-replay-bill-reductions.test.ts`; builders copied): (1) **RED→GREEN witness, receipt-based, no private tariff**: on the first-take fixture (`p14b4-ready-replay-first-take` state, the exact 597 route), assert `result.preparationWork < 180022`, the literal cited to `597-post-514-firsttake.txt` `{"phase":"result","used":180022}` (a measured receipt, not a hand-derived tariff; 176 §8 item 4 is about computing the expected value from the private cost function); RED today (equal), GREEN after any C1 layer; the test-author prints the value. Same shape optional on 538 scenario 1 (`< 105351`). Note the staleness class: the literal must be re-derived from the next receipt whenever a later slice moves bills. (2) **Behaviour neutrality GREEN both sides**: the existing E2/E8 enumerator pins, Started 28 and Ready 17 suites already assert traces/holds/provenance byte-equality; no new protection needed. (3) **Bill-VALUE identity cannot be asserted in vitest** without a new seam (176 §8: no new observer/cost coupon); it is the parent's 514-pattern re-run (passive probe patch on the candidate, `fixedSource:true`), diffing the eight `bill` fields and `dimensions` byte for byte, `used` strictly lower at every print. (4) Unchanged-source baseline of the new case under `record-check.mjs` before the writer (504 pattern), exit 1 on case (1) only.

## 7. Controls and writer scope
- Serial fixed-source groups after the writer (mirror 579 §3 / 598 verification): new RED case GREEN; Ready 17 + the sole stale FAIL at `stale-target:234` with the same `'workLimit'` message (if it flips to `commandRefused` the route closed — not expected by paper; report, do not accept silently); Started 28; adapter RED 33; enumerator RED 45; kernel 41 / hold-order 5 / stable-sort 7 / sort-owners 7; facts 7; material 17; root+UI typecheck; adjacent 203; bridge tsc with the sole OLD TS2353; live-P2 110/83 byte-identical to 570/549; B1/B2/B3 133 PASS / 1 designated FAIL / 2 todo; trust 22; historical saves 137; then the four passive re-measurements (538 probe, 577 probe, 514 stale, 514 first-take) with the bill-value identity check above; freeze/hash; independent actual-delta review against this note's per-frame table (any residual outside the A|strict bracket is a finding).
- Expected observation class in the 577 probe set: assumed-coverage partial pairs near the cap (576: `{61,63}` producer 196248 then kernel-cut; 598 item 7's S6 flipped to PROVEN_FRAGILE after −2.9k) will likely flip from cut to PROVEN_FRAGILE under −8–12k; that is a measured observation, not a certificate, and the 576 complete-set bound (now+3 ≈ 253k, :50-52) does not move.
- Writable, `src/core/promiseCapacityOwnerReplay.ts` only, grouped by bill function (exact rows = TSV `delta_A > 0`): the `calc(k)` literal at each of the 244 falling sites — sweep layer: sweepBill :1486-1595 (33), allocationBill :1201-1236 (28), singleEarlySweepBill :1324-1425 (30), restrictedSweepBill :1161-1179 (13), smallTransitionBill :1244-1248 (4), orderBill :1143 (2), workflowUpdate :1107 (2), hasUsableRehearsalSet :1265 (1); frame/command layer: frame :1925-2016 (9), executeCommand :1838-1868 (6), arrivalBill :1133-1139 (6), geometryBill :1113-1115 (5), replayPlans :2732-2733 (3); prepare layer: sortBill :382-383 (2), sortedOutput :432 (1), company :516-517 (2), writers :527 (2), prepare :783 (1); Ready layer: admitReady :2478-2619 (26), freelancerBill :2195-2365 (36), initialAdmissionBill :2440-2456 (14), readyOccupancyBill :2389-2399 (10), readyProductionId :2117-2133 (8); plus the H1–H7 hunks at the lines in §4 (with their `work.pay(N)` guard lines as new statements, never a changed existing `pay`), and the §5(i) constants inserted after :253 (`FIXED_HOLD_COPY`) with their replacement sites. NOT writable: `Work` :255-357 entire (incl. `calc`'s signature, `:337`, `:352`), `LITERAL` :143-242, every existing `work.pay(N)` literal (block pays are not calc buckets; `:1171/:1187/:1481 pay(192)` stay), `sorted`/`sortedOutput`/`sortBill` bodies beyond the two literals, `find`/`uniqueIds`, `drainEvents`/`reconcile`, `dimensions`/`staticDimensionFacts`/`dimensionRecordFacts`, the six under-reserved sites (§3), tests, kernel, owners, enumerator/adapter, caps/limits/refusals/deadlines/timeouts, docs.
- One writer release is NOT sane for 244 literals + 7 hunks + 6 constants if a residual must be bisected. If opened: one release, four commits, bill-value probe after each: (1) L1 sweep layer (script-generated from the TSV, largest and best-documented, ≈ 8k of the route); (2) L1 remaining layers (≈ 1.5k + admission ≈ 2–3k); (3) H1 + §5(i) constants (≈ 0.9k, the two clean structural hunks); (4) H2–H7 (≈ 1.5k, each needing its own value-identity reading). The auditor reruns `599-A-count-calc-sites.py` on the candidate: every site's new `k` must equal `proposed_k_A` (or `proposed_k_strict` where the adjacent block pay does not name the helper arguments), no site below its count.

## 8. Risks, open questions, evidence limits, value statement, next action
- Risks: (a) the convention is the whole law for L1: an auditor who rejects the precedent reading (helper arguments reserved by entry/adjacent block pays) must apply the strict columns at the 23 helper sites, which costs ≈ 1.6k of the saving and nothing else; (b) 27 strict-flagged sites versus 6 precedent-flagged: the module already tolerates textual excess where block pays are believed to cover it, so C1 cannot claim "every site exactly covered", only "no site above its bucket that was not already above it"; (c) evaluation-order changes in H1 move where a `workLimit` cut lands inside a frame (same frame, same `through`); (d) the expected flip class in the 577 set could be misread as certificate movement; (e) 244 literal edits are a wide diff in the production writer's one file.
- Open questions for the auditor: rule on the counting convention (A vs strict at the 23 helper sites); whether `:1423:1` (a real 2-node textual gap) should be raised to calc(32) in the same release (a +16 self-charge, no value change, outside "may fall") or recorded only.
- Evidence limits: paper only, nothing executed; multiplicities (n=1, f=5, sets=2, external=0, t, commitments=0, `possible = 0` in `arrivalBill` on every measured frame, one post facility, founding order) are read from the module and the 597 `dimensions` prints, not measured; admission/prepare figures are static sums without loop multiplicities; the route model does not include w9/w10 of the stale route; the 514 probe cannot separate the sweepBill calculation from the pre-sweep frame work, so per-frame `used` predictions carry the ±(A−strict) bracket.
- Honest value: C1 (all layers, with §5(i)) saves ≈ 13–15k on the stale route prefix, ≈ 11–12k on the first-take route, ≈ 3k on 538 scenario 1, ≈ 0.2k on prepare-only. It closes no route (stale gap ≈ 28k; the cut moves from w8's sweep reservation to w9/w10 and stays `workLimit`), moves no certificate bound (576 now+3 ≈ 253k), and its non-measurable benefit is a calculator whose buckets match its trees. Against that: one production-writer release over ~250 edit points in the one file, a receipt-literal RED that goes stale at the next slice, four re-measurements with a new bill-identity check, an auditor pass with a convention ruling, and the 579→598 record cycle. **Recommendation: do NOT open C1 now; record this note, the TSV and the two scripts as the parallel track's end.** Reopen only if an Owner ruling (578: D2 / 515 §6 / C9–C10) makes ≈ 13k load-bearing for closing the stale route — under current tariffs even C1+C9+C10 (≈ 22–24k) leaves that route short of 28k. If the parent still wants a slice for the calculator's own sake, take commit (1) L1 sweep layer + H1 + §5(i) constants only (≈ 9–10k on the stale prefix, script-verifiable, three hunks by hand) and leave H2–H7, the Ready layer and C5(ii) closed.
- Next concrete action: parent saves this note verbatim as record 599 §4, archives the four scratchpad artifacts by hash, sends the note to the contract-auditor for the two rulings (convention; `:1423:1`), and records the outcome per the recommendation.

### 599-B — contract-auditor READ-ONLY review (Opus 5; workflow agent aaedf9cfe4d7f5b84)

# 599-B — contract-auditor READ-ONLY review of design note 599-A (replay bill reduction C1 with C5(i) static-width constants)

**Status: DONE (review only).** No file created, edited, run, hashed or diffed; no Git, shell, network or delegation. Tools: Read, Glob, Grep on the worktree, the evidence folder and the named scratchpad files. **Overall verdict: KEEP the note as a record (REFINE items listed, none blocking); CONCUR with its recommendation not to open C1 now; record 599 as the parallel track's end.** The two rulings requested are given under Q2 (convention) and Q8 (`:1423:1`).

**Model observed:** the harness reports Opus 5 (1M context), `claude-opus-5[1m]`. The lean-ctx MCP tools named in the user CLAUDE.md are not exposed in this session; the role allowlist was used as-is.

## Identity as read

- Worktree `/Users/zacheryspector/The-Movies-headless-program`; HEAD `48a43511075b`, module 2809 lines and SHA `9e97ffed…` are the parent's git outputs (I cannot hash). Every line cited below was read from the module bytes and matches the note's cites unless stated.
- Scratchpad (`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/`): `599-A-calc-sites.tsv` (header + 481 data rows, lines 2–482), `599-A-calc-sites-strict.tsv`, `599-A-count-calc-sites.py`, `599-A-route-model.py` present; plus an unnamed `599-A-calc-skeleton.tsv` the note does not list (archive or discard, say which). SHA-256 values are the author's; not re-hashed.

## Sources read (line ranges)

- Module `src/core/promiseCapacityOwnerReplay.ts`: :130-369 (CEILING/EQUALITY_SATURATION_LENGTH :135-136, `literalCost`/`LITERAL` :143-242, `copyLiteral`/`HOLD_COPY`/`FIXED_HOLD_COPY` :243-254, `Work` :257-357), :369-538 (`sortBill`, `sorted`, `sortedOutput`, `find`, `uniqueIds`, `company`, `writers`), :1100-1274 (`workflowUpdate`, `geometryBill`, `arrivalBill`, `orderBill`, `restrictedSweepBill`, `allocationBill`, `smallTransitionBill`, `hasUsableRehearsalSet`), :1275-1604 (`singleEarlySweepBill`, `singlePostExitProof`, `sweepBill`), :1830-1879 (`executeCommand`), :1915-2019 (`frame`), :2100-2149 (`readyProductionId` tail, `searchBill`), :2152-2366 (`freelancerBill`), :2370-2464 (`readyOccupancyBill`, `initialAdmissionBill`), :2470-2639 (`admitReady`). Grep `keyLength|keyConstruction|\btransition\b` over the module (H1 dead-ness).
- TSV whole (all 481 rows); `599-A-count-calc-sites.py` :1-140; `599-A-route-model.py` :59-109 (grep).
- Records: 598 whole (incl. 598-R verbatim); 176 whole (§1 :15-36, §5 :189-210, §8 :346-400); 579 :196-275 (579-A §2 C5 table, §3, §4) and :355-384 (579-B Q4–Q9); 515 :40-113, :160-257 (515-A item 2 at :229, gap statement :245-253); 578 headings/§ lines (grep).
- Receipts: `597-post-514-stale.txt` :7-50 (all `sweepBillDone` rows, `payFailure` :49, result :50); `597-post-514-firsttake.txt` :12-41.
- Tests: grep `(preparationWork|workUsed|ownWork|expectedWork).*(toBe|toEqual|toBeLessThan|toBeGreaterThan|toStrictEqual)` over `tests/`; grep `180022|105351|29694|16475|194726|toBe\([0-9]{4,}\)` over `tests/`; grep of the same plus `preparationWork|workUsed` over `bridge/` (empty).

## Numbered answers

### 1. Calculator model — MET WITH EVIDENCE. Not a price change.

- As implemented: `calc(units)` :269 pays `units` when the receiver chain is evaluated, i.e. before JavaScript evaluates the method's arguments; each method then pays its own body (`plus` :280 pay 20 + `add` 8 per operand beyond the first, `add` :302 8, `times` :306 10 with `a === 0 || b === 0 → 0` :307, `equality` :311 20, `keyBill` :315 64, `keySpanBill` :325 20 + nested, `copyCost` :332-340 per key + `calc(8).add`). `pay` :261 throws only when `units > limit − used`; nothing anywhere compares a tree's node count to `k/2`, so an over-full bucket is silently under-reserved (a 176 §1 lawfulness defect, not a runtime error). The note's §2 statement is correct. Cosmetic: §2's method line cites are off by up to three (`pay` :260-263, `add` :301-304, `times` :305-309, `keySpanBill` :324-327; the comparator-bound pay is :396, not :399).
- "Two units per scalar operand-read/operator; 8/16/32/64 cover ≤4/8/16/32 nodes" is the module's own doc :265-266; 176 §1 :34-35 says only "Reserve each cost-calculator scan/arithmetic step before doing it too". The note says exactly this.
- Ruling: lowering `k` to the smallest documented bucket with `k/2 ≥ nodes` removes reserved-but-never-used capacity; the per-node price (2), the bucket table and every method body/`pay(N)` stay. That is a reservation-fit change under 176 §1 as written, not a price change, on the sole condition that the node count is right. An under-count would convert it into an under-reservation (the Q2 burden).

### 2. Site table accuracy — MET WITH EVIDENCE on the sample; totals NOT VERIFIED (script output).

My independent recounts, convention A (each `.member` = 1, bare base not counted, literal/operator = 1, ternary = 1 with both arms, nested calc chain = 1). All equal the TSV or over-count safely (TSV over-count marked *):

| site | function | my A nodes | TSV | proposed k |
|---|---|---:|---:|---:|
| :382:1 | sortBill | 5 | 5 | 16 |
| :516:1 / :517:1 | company | 5 / 4 | 5 / 4 | 16 / 8 |
| :1107:1 | workflowUpdate | 5 (strict 7) | 5 (7) | 16 |
| :1113:1 | geometryBill | 7 | 7 | 16 |
| :1133:1 / :1133:2 | arrivalBill | 2 / 4 | 2 / 4 | 8 / 8 |
| :1143:1 | orderBill | 4 (see ruling) | 4 | 8 |
| :1173:2 | restrictedSweepBill | 16 | 16 | 32 (no change) |
| :1175:1 | restrictedSweepBill | 36 | 36 | over 64 (reported) |
| :1208:2 / :1218:1 / :1235:1 | allocationBill | 15 / 10 / 16 | same | 32 / 32 / 32 |
| :1371:1 / :1372:1 / :1381:1 / :1413:1 / :1423:1 | singleEarlySweepBill | 15 / 9 / 12 / 12 / 10 | same | 32 / 32 / 32 / 32 / (16 today, reported) |
| :1499:2 / :1585:1 / :1585:2 / :1590:1 / :1591:2 | sweepBill | 12 / 10 / 8 / 6 / 8 | same | 32 / 32 / 16 / 16 / 16 |
| :1962:1 | frame | 15 | 15 | 32 |
| :1867:2 | executeCommand | 14 | 14 | 32 (no change) |
| :2383:1 | readyOccupancyBill | 18 | 18 | 64 (16 today, reported) |
| :2453:1 | initialAdmissionBill | 21 | 21 | 64 |
| :2502:1 / :2523:1 / :2585:1 / :2618:1 | admitReady | 14 / 11* / 12 / 9 | 14 / 12 / 12 / 9 | 32 / 32 / 32 / 32 |
| :2354:1 | freelancerBill | 13 | 13 | 32 |

Boundary sites (nodes = k/2 exactly: :1235:1, :1585:2, :1591:2) recounted twice; no under-count found anywhere in the sample. The convention is grounded in the module's own precedent :1522 (`row.reservations.length`, `row.bindings.setId`, `row.shootingTask` = "five property reads"). The script (`count_nodes`, :77-136) implements the stated convention (`max(1, segs − 1)` under A, helper-call skip, ternary arms counted). The totals 481 sites / 282 lines / 244 falling / 7000 (A) / 6016 (strict) and the per-function sums are the script's output; I cannot run it and did not recount them by hand.

**Ruling 1 (convention), the note's open question (a):** apply A, except at a module-helper-call site whose argument evaluation is NOT named by an adjacent labelled block pay or by the helper's own labelled entry pay; there, count the invocation (1) and each argument as one node in the outer tree (call it A′). Reason: `sortBill` :378 says "argument arithmetic/helpers remain prepaid", i.e. the CALLER must have reserved the argument tree; today the over-sized bucket happens to absorb it, and lowering the bucket under A would leave those nodes unreserved. Per-site result at the 23 helper sites:
- A stands (labelled cover exists): :1139:2 (:1132 "nested calculators each charge themselves"), :1143:1 (:1142), :1177:1 and :1178:1 (:1171 pay(192)), :1578:1 and :1581:1 (:1572 "both five-argument transition-helper calls"), :1585:1 (:1584 + callee :1186), :1590:1 (:1481 pay(192)), :1838:1 (:1837), :1876:1 (:1873), :2618:1 (`copyCost` pays its own; two reference-read arguments fit 9+4 ≤ 16), :2572:1 and :2594:1 (already 8; no lowering proposed).
- A′ governs (no labelled cover): **:1347:1 → 32** (not 8: 3 + call 1 + `d.f, 6 + 2 * text, work` 7 = 11); **:1399:1 → 32** (not 16: 7 + 6 = 13); **:1422:1 → 32** (not 16: 8 + 3 = 11); **:2447:1 → 32** (not 16: 8 + 8 = 16); **:2513:1 and :2517:1 → 16** (not 8: 3 + call + `source.talent`, closure, `id`, `work` = 8); **:2331:1, :1845:1, :2607:1 stay 16** and **:2482:1 stays 64** (5 + 3×5 = 20 nodes; the strict TSV already flags it) — not lowered.
- Cost of A′ against the note's A figures: ≈ 0.3–0.4k on the stale prefix (two singleEarly frames ≈ 56–88 each, admission ≈ 200 once, one command 8). Immaterial to §8.

### 3. Structurally-zero and dead subtrees — MET WITH EVIDENCE for H1–H7; one form ambiguity (REFINE).

- H1: grep confirms `keyLength`/`keyConstruction` (:1483) are consumed inside `sweepBill` only at :1486 and `transition` only at :1583; the selectors `singleWrapSlot`/`retainedDevelopment`/`singlePostExit` are computed and paid (:1572 "selector/local") before :1577. Inlining into the :1583 arm: no new read, identical arithmetic on the general path (order only), the three narrow arms lose a value-0 contribution. The proposed inline buckets recount at 4/2/2/2/2/2/1/2 nodes → all calc(8) as written. Dead cost today 246 (16+16+18+108+18+42+28), 166 after L1 — matches the model constant.
- H2: `claims` (:1196) and `occupied` (:1197 or `retainedOccupied` :1528) are paid locals derived from `d.n`/`d.external`/read workflow rows; `times(0, x) === 0` :307 and `add(a, 0)` :303 reproduce `a` (including the `a ≥ CEILING` case, which was identical before). Outer `occupancy` tree with the two guards recounts at 15 → calc(32). On the measured frames: w2 occupied = 0 (`slateKeys − 1 = 0`), claims = 1; w6/w8 both 0.
- H3: `before`/`after` are call-site literals; guard 9 nodes = pay(18); the six zero calls on the stale route are (1,0,1)+(0,1,1) at w3, (2,0,2)+(0,1,1) at w6, (1,0,1)+(0,0,0) at w8; +80/−18 re-derived. Preference, not defect: :1243 `keyLength` is consumed only inside the guarded subtree and could move inside the guard (+16 more per zero call).
- H4 (`t + r`, loop counters paid at :1152), H5 (`o`), H7 (`d.external`, paid at frame :1925-1929 via `external.size`): guards 7/5/5 nodes = 14/10/10; savings 140−14, 90−10, 106−10 re-derived; values identical by :307.
- H6: **REFINE for form.** §4 says "+102 on rT7" with no guard pay; the TSV row and `route-model.py` :68 use a separate-statement form with `pay(6)` (+96 zero / −6 nonzero, which is what the w3/w4 table rows contain). If the ternary is instead inlined into the :1341 `plus` argument, the outer tree becomes 10 nodes → calc(32), i.e. +86 / −16. State one form; the separate-statement form (a local, the outer stays 7 nodes → 16) is the one the numbers assume.
- Exclusions (:1208:2, :1209:2-3, :1180:2-4, :1247:2, :1250:1, :1346:2, the general `policyLock`/`setup` arms, :1114): agreed as marginal or unreached. No H1–H7 candidate needs a new read; the note excluded none wrongly and included none that needs one.

### 4. C5(i) constants — MET WITH EVIDENCE; (ii) correctly quarantined.

- Arithmetic: `CAPABILITY_TEXT` = 1 + 2·19 = 39 (19 < 100000 :136); `PHASE_TEXT` = 29; `CAPABILITY_KEY` = 20 + 39 = 59; `TWO_CAPABILITY_KEYS` = 20 + 78 = 98; `RETAINED_RELEASE_PHASE` = 40 + 156 + 118 + `LITERAL.phaseRelease` (= 1 + 9 + 9 = 19) + 6 = 339, all below CEILING so `plus` is a plain sum; `SINGLE_WRAP_RETENTION` = 138.
- These fold subtrees whose arguments are ALREADY literals (`equality(19)`, `equality(14)`, `keyBill(1, 19)`, `keyBill(2, 19)`), i.e. the LITERAL convention :137-142, not a width change; 579-B Q4's domain rulings (19/14) are consistent but not even load-bearing for (i). Self-charges removed per call re-derived: restricted 28; singleEarly 28+28+72+84 = 212; retainedDevelopment 84+28+72 = 184 (+72 at :1228:1 → 256 at w2); singleWrapSlot 44+72 = 116; :1228/:1230 72 (one arm per call). A constant read is one node, as the local it replaces. (ii) moves bill VALUES and is rightly excluded from C1 and from any shared commit.

### 5. Pins and the RED brief — MET WITH EVIDENCE (pins); PARTIAL → REFINE (brief wording).

- My grep: every `preparationWork|workUsed` assertion in `tests/` is the cap (`toBe(200000)` started-owner-replay :406, adapter :564; `≤ 200000` elsewhere), relative (started-owner-replay :391/:392/:558/:592/:614/:621; ready-owner-replay :654/:759; replay-record-facts :182-183/:204/:214; enumerator :442-443/:525/:734; adapter :575), the adapter/enumerator's own tariff, kernel bounds, or the C7 witness `replay-bill-reductions :287` (`swapped > original`, which survives C1 since :432:1 changes both sides equally). No `ownWork` consumer; `bridge/` has none; no `180022|105351|29694|16475|194726` literal in tests; the only 4+-digit `toBe` values are 200000 and the 230339 fixture byte length. Confirmed: no absolute replay-bill pin.
- Receipts: `597-post-514-stale.txt` :12/:16/:20/:24/:36/:40/:44/:48 carry `bill` 315/6861/8099/8578/850/7948/576/5668 and the `dimensions` objects — these must be byte-identical under C1; `used` at each print falls; :49 `payFailure used 194726 requested 5765` (= 5668 + 97 at :1962) then :50 result 200000 — under C1 the cut moves later (same `workLimit` class, later frame or site); `597-post-514-firsttake.txt` :41 `result used 180022` falls. 538 rows 105351/29694/16475 fall.
- RED brief: `result.preparationWork < 180022` with the literal cited to the 597 receipt is lawful under 176 §8 item 4 (:383-388: a measured receipt, not a value computed from the private cost function) and loosens nothing. REFINE: it is a one-way ratchet; the test comment must name the receipt path and say that any later lawful bill RISE (a cover fix under Q8 item 1, the annex +543 class of 598 item 2) re-derives it, so it is not misread as a tariff pin. Bill-VALUE identity cannot be asserted in vitest without a new seam (176 §8 :348-353); the 514-pattern passive probe is the right check, and the brief says so.

### 6. Writer scope — PARTIAL → REFINE.

- Ranges: the listed per-function ranges match the TSV rows with `delta_A > 0`; apply Ruling 1 before generating them. NOT-writable additions: `CEILING`/`EQUALITY_SATURATION_LENGTH` :135-136 (named in §2 as a price, missing from §7's list); `copyLiteral`/`HOLD_COPY`/`FIXED_HOLD_COPY` :243-254 (landed C6) — and the §5(i) constants insert AFTER :254, not "after :253 (`FIXED_HOLD_COPY`)" (off by one; :253 is `HOLD_COPY`); `searchBill` :2138-2149; `boundedStableSort.ts`; the four `uniqueIds` sites and the :1991 second sort (579-B Q8 carry-over). The rest of the list (Work whole, LITERAL, every existing `pay(N)`, the six under-reserved sites, tests/kernel/owners/adapter/enumerator/caps/refusals/docs) is complete.
- One release for ≈244 literals + 7 hunks + 6 constants is NOT reviewable as one commit; the note's own four-commit split (L1 sweep layer → L1 rest → H1 + §5(i) → H2–H7) with a bill-value probe after each is the right order. Add: commits (1)/(2) script-generated from the TSV with A′ applied; the parent (not this read-only auditor) re-runs `599-A-count-calc-sites.py` on the candidate, asserting each new `k` equals the ruled `proposed_k` and no site sits below its count.

### 7. Honest value statement — MET WITH EVIDENCE; one paper slip.

- L1 recounted by hand for w1 (584), w2 (1456), w5 (688), w7 (640) and the two w5 commands (392): all equal the note's table. L2 per-frame constants and the hunk deltas re-derived (Q3). Slip: `route-model.py` :65/:89 applies the both-zero occupancy figure +134 to w2, where only `occupied` is zero (claims = 1): 124 − 16 = 108, so w2 L2 = 256, w2 total 1968, and the all-layers stale prefix is 12320 (A), not 12346. Immaterial.
- The conclusion follows from the numbers: ≈13–15k (≈12.6–14.6k under A′) against the ≈28k gap after C6+C7 (598), so the stale route stays RED with `workLimit`; no certificate bound moves (576 now+3 ≈ 253k); the cost is a production-writer release over ≈250 edit points, four re-measurements with a new bill-identity check, a ratchet RED, a convention ruling and the 579→598 record cycle. Even the paper sum with C9+C10 (≈22–24k) is below 28k, and those need Owner rulings (578). Concur: do NOT open C1 now; record this note, the TSV and the scripts as the parallel track's end. The fallback ("commit 1 + H1 + §5(i) for the calculator's own sake") is coherent but I recommend against taking it absent a ruling that makes ≈13k load-bearing: it spends the one production-writer release for no route or certificate movement.

### 8. Overall — KEEP (record); REFINE items only; nothing reads as a price/tariff change or a test loosening.

- §1 KEEP. §2 KEEP (cosmetic cites, Q1). §3 KEEP as sample-verified; totals script-output (Q2); Ruling 1 applied at the nine listed helper sites. §4 KEEP with the H6 form fixed (Q3). §5 KEEP. §6 REFINE (ratchet wording, Q5). §7 REFINE (NOT-writable additions, :253→:254, A′ generation, Q6). §8 KEEP; recommendation concurred (Q7).
- **Ruling 2 (`:1423:1`), the note's open question (b):** record only; not in C1. C1's law is "may only fall, bill VALUES byte-identical"; a +16 self-charge changes no value but changes `used` in the direction the bill-identity probe would have to explain, and the six textual under-reservations (:352:1 covered by :351 pay(6); :1175:1 36 nodes, unfixable by a bucket; :1423:1 a real 2-node gap; :1525:1 covered by :1522; :2383:1 a real 5-node gap per workflow row after :2382's unlabelled pay(10); :2413:1 plausibly covered by :2412's unlabelled pay(16)) belong together in one separate 176 §1 lawfulness item with its own +N paper, if the parent ever wants it. Carry them as a record-only item under 599.
- Record-only: the unnamed `599-A-calc-skeleton.tsv`; the script docstring's stale cites (`:1503`, `:1573` → :1522, :1572); C5(ii) stays closed as 579 left it; nothing here is Owner acceptance, a cap/tariff ruling or a 302 closure.

## Defects (demonstrated) versus preferences

Defects in the note (all paper/presentation; no source candidate exists): (D1) w2 L2 over-stated by 26 (Q7); (D2) §7 insertion line :253 should be :254 (Q6); (D3) H6 stated as +102 with no guard while the model and table use +96/−6 (Q3). Preferences/observations: A′ over A at the nine uncovered helper sites (a ruling, given); moving :1243 `keyLength` inside the H3 guard; the ratchet comment in the RED; NOT-writable additions; `CEILING` naming.

## Evidence limits

Read/Glob/Grep only: no hashing, no running of the two scripts, no counting of TSV totals beyond the sampled ≈35 sites across 13 functions; the 481/282/244/7000/6016 totals and the per-function sums are the author's script output. L1 recounted by hand only for the four restricted/retained frames and the two commands; w3/w4/w6/w8 L1 and the admission ≈2–3k are taken from the note's table and static sums (both consistent with my site recounts but not summed independently). Receipts read as text lines, not re-executed. Nothing here is a native run, a certificate or Owner acceptance.

## Next concrete action

Parent saves this review verbatim as record 599 §4; records Ruling 1 (A′ at :1347:1, :1399:1, :1422:1, :2447:1, :2513:1, :2517:1; no lowering at :2331:1, :1845:1, :2607:1, :2482:1) and Ruling 2 (`:1423:1` and the other five under-reservations record-only, outside C1); archives the four artifacts by hash and decides the skeleton file; corrects D1–D3 in the record text (not in the note's verbatim body); closes the parallel track with 599 per the note's recommendation — no RED, no writer, no re-measurement — and leaves reopening to an Owner ruling under 578.
