# 515 — Stale-route attribution, gap finding and next bounded direction (exact pre-call bills)

2026-09-20. Claude Code parent after 514. Two READ-ONLY analyses were run concurrently on the
frozen 505 source (`5d4851…2941a`, HEAD 9ed6e35 during their reads), each withheld from the
other: 515-A by the project `sim-core` profile in READ_ONLY mode (attribution to source law
and ranked lawful candidates) and 515-B by the project `instrumentation` profile (independent
paper model of the remaining route). Both ran as Fable 5.1 (`claude-fable-5-1`, profile
defaults opus/sonnet overridden); neither edited the worktree, ran tests or touched Git.
Their complete handbacks are reproduced verbatim at the end of this record. Every number
below is paper or measured as labelled; nothing here is a fit claim or an adopted saving.

## 1. Finding: the gap and its size

Both mirrors reproduce the seven measured weekly bills (315, 11193, 9587, 8905, 850, 7948,
576) and the seven measured sweep-bill calculator costs exactly, and both reproduce the 514
cut position. On that calibration the remaining work from the cut (199994, week-8 label,
inside `sweepBill`) to the asserted refusal is:

| Source | LOW | LIKELY | HIGH | Whole route |
| --- | ---: | ---: | ---: | ---: |
| 515-B instrumentation | 31,164 | 32,510 | 34,964 | ≈232.5k |
| 515-A sim-core | ≈29.5k | ≈32k | ≈38k | ≈232k |

The cut sits at about 86% of the route. Closing it needs roughly 14% of the whole route.
The first-take route (PASS) leaves 10,744 units for the kernel; the kernel's actual use is
unmeasured (only the pass bound exists).

## 2. Finding: where the work goes (515-B dominance, LIKELY route, share of the 200k cap)

| Component | Units | % cap |
| --- | ---: | ---: |
| Preparation + Ready admission before frame 1 (excl. its `dimensions`) | 62,779 | 31.4 |
| Owner bills reserved at `frame` 1898 (w1–w9) | 49,316 | 24.7 |
| Discovery (`dimensions` ×10 + `commandDimensions` ×3) | 37,776 | 18.9 |
| `sweepBill` calculator self-charges (computing the bills) | 32,751 | 16.4 |
| Post-owner drain/reconcile/loops | 28,903 | 14.5 |
| Command bodies excl. projection; fixed per-frame constants | ≈20,860 | 10.4 |

515-A attributes each block to source lines and classifies it as (a) required payment for
actually executed owner/helper/ledger work, (b) prepaid bound that over-approximates what
this fixture executes, or (c) discovery with a named consumer. The identified (b) portions
are concentrated in the general-branch transition frames: ≈4.5k of the retained-Development
bill 11193 (label 2), ≈2.1k/≈0.5k of the single-early bills 9587/8905 (labels 3/4), ≈0.9k of
the Post-entry bill 7948 (label 6), ≈3.5k of the unreached Post-exit bill 9234 (label 8) and
≈0.6k of `initialAdmissionBill`.

## 3. Finding: lawful candidates do not close the gap under 176 as written

515-A's ranked candidates (all gross, this fixture, all UNADOPTED):

| Candidate | Gross | Law status |
| --- | ---: | --- |
| C2+C3+C4 exact pre-call bills: retained Development, single Post exit, single-early occupancy/slot count (+ admission) | ≈11.2k | lawful under 176 §5/§6, accepted branch-proof pattern |
| C1 calculator execution structure (bucket sizing to counted nodes; no structurally-zero subtrees), bills byte-identical | ≈8–11k | lawful as written; diffuse (≈100 sites), highest review cost |
| C5 static-domain widths for capability/set-id operands | ≈2–2.5k | lawful; per-term operand proof needed |
| C6 fixed-schema copy price for module-owned hold records | ≈1.5k | lawful (LITERAL convention) |
| C7 already-sorted detection in `uniqueIds` | ≈1.5k | lawful (existing `sortedOutput` pattern) |
| C8 admission talent `searchBill` restructure | −3k…+1k | observation only; needs a position probe |
| C9 merge-sort head-comparison bound n·L → actual maximum | ≈5.4k | NEEDS a 176 §2 clarification (tariff) |
| C10 `token` 7 units/char → paid escape-free pre-scan | ≈3–4k | NEEDS a 176 clarification (tariff) |

Sum of the lawful-as-written set C1–C7: ≈23–26k gross, below the LIKELY gap. With C9+C10:
≈32–35k, marginal against 31–35k and every figure is gross. Conclusion recorded honestly:
**under 176 as written and the existing tariffs, no bounded reduction identified here shows
the original 302 stale route fitting 200000.** The Owner packet preserves caps, tariffs,
exact refusals and the original tests, so C9/C10 and any ruling on the control are NOT
within the parent's authority; see §6. This finding blocks only the stale route's GREEN,
not the bounded correction below and not the rest of the program.

## 4. Adopted direction for the next bounded slice: C2 + C3 + C4 exact pre-call bills

One slice, one writer, confined to `sweepBill` (1415–1532), `allocationBill` (1172–1213),
`singleEarlySweepBill` (1251–1396) and `initialAdmissionBill` (2340–2389) in
`src/core/promiseCapacityOwnerReplay.ts`. Same pattern as the accepted
`singleEarlySweepBill` / `singleWrapSlot` / `singlePostExitProof` branches: a bill selected
only by facts read and paid BEFORE the owner invocation (176 §5), reserving every possible
original outcome at first call (176 §6). Owners, order, refusals, provenance, drain,
discovery, caps, spans and validators unchanged; bill VALUES on every branch this fixture
does not select must be byte-identical.

- **C2 retained Development** (`retainedDevelopment === true` path, label 2 and any all-at-8
  retained move): `releaseCompletedPhase` (operations.ts 1247–1285) keeps the development
  slot and returns the SAME workflow with one `includes` of a 19-char capability;
  `allocateForPhase` (284–427) emits exactly one own claim (one reservation, no task,
  `bindings.setId === null` so no set-exclusivity claim), takes the retained arm for the one
  `preProduction` requirement (`development-casting`, static phase table), records a
  transition with one key on both sides and no event. Therefore: phaseTransitions =
  `smallTransitionBill(d, 1, 1, 0)` instead of `transition`; releasePhase without the
  workflow/bindings copy terms and with one `equality(19)`; raw claims = actual reservation
  count, retention ×1, `keyBill(0, …)` for the empty occupied Set, one requirement walk.
  Proof facts to read and pay before the call: `bindings.setId === null`,
  `reservations.length === 1` (already read), the static requirement count. ≈4.5k on label 2.
- **C3 single Post exit** (`singlePostExitProof` true, label 8, the frame that cuts):
  post→releaseReady releases the single post slot (`smallTransitionBill(1, 0, 1)`), the
  second transition is 0→0, the retained filter compares no strings
  (`retainedCapabilitiesFor` empty), `allocateForPhase(releaseReady)` has no requirements,
  the sweep makes two visits (advance, released → break). Therefore: phaseTransitions =
  `small(1,0,1) + small(0,0,0)` instead of 2×`transition`; releasePhase without the 8×text
  term; visits/commonVisits 2; update ×2. ≈3.5k on label 8.
- **C4 single-early occupancy/slot exactness** (labels 3/4 and `initialAdmissionBill`):
  `occupiedKey = keyBill(actual occupied count, keyLength)` where the count is provable
  pre-call (n = 1, external = 0, own claims excluded → 0 at rT7 and at admission; 1 retained
  stage key at rT6); slots 3→2 and composite 2→1 with a paid proof that the first soundstage
  in id order carries a usable mounted Set (facility ids and `sets[].mountedOn/status/
  condition` are input facts; `hasUsableRehearsalSet` already scans them); requirement walks
  at `equality(19)`. ≈2.1k (label 3) + ≈0.5k (label 4) + ≈0.6k (admission).

Expected effect, stated up front: ≈11.2k gross to the refusal; the stale route remains RED
after this slice (gap ≈32k). It also lowers the 276 first-take producer work (C2 and C4 are
on that route), which must stay GREEN including the shared kernel assertion. No discovery
changes, so no deferred-cold or table-history side effect is expected. Runner-up, not
adopted now: C1 (only with a probe-based bill-equality check across all seven measured
frames). C5/C6/C7 remain evidence-backed follow-ups. C8 needs a position probe first.

## 5. Verification order (existing law; nothing skipped)

1. 516: independent `contract-auditor` READ-ONLY review of THIS direction against 176/137/365
   and the actual owners, term by term, before any writer. Qualified KEEP required.
2. 517: independent `test-author` additive Started control for the single Post exit that no
   existing GREEN test exercises: a real state one tick before the existing Release-Ready
   fixture (rT2, postProduction, one post reservation), an empty plan, H = now + 1, asserting
   the actual owner outcome (releaseReady, post slot released, `reservationReleased` and
   `phaseEntered` provenance) and completion within the cap, derived from the real
   applyActions/tick oracle. Its unchanged-source baseline runs under `record-check.mjs`
   BEFORE the writer (the 504 pattern); it is a protection control, not RED→GREEN.
3. 518: ONE `sim-core` writer, replay module only, exact handback with block-by-block
   payments; freeze/hash; parent pins (21 test/owner/kernel files, unchanged bodies).
4. 519: independent actual-delta review; then serial fixed-source checks in the six 507–512
   groups plus the new control; then a 514-pattern passive measurement of both routes with
   exact restoration; qualified checkpoint; shared headers; publication with exact-remote
   verification. Preserve the original stale RED and its exact new boundary.

## 6. OWNER / Current Ops decision item (recorded, non-blocking)

The parent cannot lawfully close the 302 stale route with the reductions available to it.
Options, none adopted by the parent: (a) authorize the two engineering-law clarifications
C9 (merge-sort head-comparison bound) and C10 (token output span via a paid escape-free
pre-scan), together ≈9k gross, which with C1–C7 reaches the LOW–LIKELY gap only marginally;
(b) rule on the 302 control itself (horizon, route or cap), which the parent does not
propose and will not touch; (c) keep the route RED as a recorded exact boundary while the
rest of B4 proceeds. The program continues with §4–§5 meanwhile; only the stale route's
GREEN depends on this ruling.

## 7. Verbatim handbacks

### 515-A — sim-core READ_ONLY attribution, verbatim, SHA256 `e73c0f5be2966d9386e4c86811996f04e4d5a916229dcd485fd3f63cff7eb588`

> # 515-A — READ-ONLY attribution of the 505 stale-route work profile and ranked lawful reduction candidates
>
> **Status: DONE (proposal only).** No file in the worktree was created or modified; no vitest/tsc/npm, no Git state change, no delegation. Two scratch files were written OUTSIDE the worktree (`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/mirror515.mjs`, `tally515.mjs`/`tally515b.mjs`): a hand-transcribed paper mirror of the bill formulas, run with `node` for arithmetic only. It is not the source and was validated against measurements (below).
>
> **Model observed:** the harness identifies me as Fable 5.1 (`claude-fable-5-1`); the lean-ctx MCP tools named in the user CLAUDE.md were not available in this session, so Read/Bash were used. Tools used: Read, Bash (read-only: cat/sed/grep/shasum/node arithmetic), Write (scratchpad only).
>
> **Identity checks:** HEAD `9ed6e35670b91d207c2f548de4a8ad592c366012` (after 1f0b968), tree clean, `src/core/promiseCapacityOwnerReplay.ts` SHA256 `5d4851713ff53209b569c813b78a1e22e6b53ab91e27522ceb5a9ee7222a941a`, 2740 lines.
>
> ## Sources actually read
>
> - Replay source `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityOwnerReplay.ts`: all 2740 lines. Key ranges cited below: Work 245–345 (calc 257, plus 265–287, add 289, times 293, equality 298, keyBill 302, text 316, copyCost 320–328, token 329–344); sortBill 357–372; sorted/sortedOutput/uniqueIds 373–437; canonicalIdentity 449–461; prepare 534–799; dimensionRecordFacts 865–912; staticDimensionFacts 933–976; dimensions 978–1041; commandDimensions 1045–1092; workflowUpdate/geometryBill/arrivalBill/orderBill 1093–1133; restrictedSweepBill 1135–1169; allocationBill 1172–1213; smallTransitionBill 1216–1227; hasUsableRehearsalSet 1231–1247; singleEarlySweepBill 1251–1396; singlePostExitProof 1399–1413; sweepBill 1415–1532; closeHold/addHold/closePath 1565–1611; drainEvents 1612–1667; reconcile 1668–1713; executeCommand 1758–1825; frame 1827–1968; readyProductionId 1972–2072; searchBill 2074–2085; freelancerBill 2088–2302; readyOccupancyBill 2306–2336; initialAdmissionBill 2340–2389; admitReady 2400–2580; replayPlans 2610–2719.
> - Test `tests/p14b4-ready-replay-stale-target.test.ts` 1–280 (route: source week 0, Ready admission at (0,1), commands at week 4, take week 5, commit week 8, release week 9, H=10, stale command week 9); `tests/_p04a2WriterCreditFixtures.ts` 1–333; `tests/p14b4-ready-replay-first-take.test.ts` lines 204–327 (kernel budget assertions).
> - Owners: `src/core/operations.ts` 1–160 (facility table), 160–460 (deriveBindings, occupiedSlots 242, allocateForPhase 284–427), 460–810 (retarget tail, recordReservationTransition 554–574, replaceWorkflow 576, addManagedProductionWorkflow 588–654, assign/clear/arrive/schedule 684–807), 1240–1831 (releaseCompletedPhase 1247–1285, enterPhase 1287–1436, productionsInSweepOrder 1482–1502, advanceManagedProductions 1576–1831); `src/core/productionPhases.ts` (whole: REQUIRED_CAPABILITIES_BY_PHASE, retainedCapabilitiesFor); `src/core/occupancy.ts` (whole; resourceClaims 337–590); `src/core/sceneryLoadIn.ts` (whole); `src/core/technologyProduction.ts` (whole; allowsFacility/beforePhaseEntered); `src/core/productionSetup.ts` (whole); `src/core/releaseAuthority.ts` (whole); `src/core/studioEvents.ts` (whole); `src/core/boundedStableSort.ts` (whole); `src/core/productionIdentity.ts` (whole; persistedProductionIds); `src/core/productionAdmission.ts` (whole); `src/core/sets.ts` endowedHouseSets, wearSetAtWrap, depleteSetNoveltyForRelease, bindableSetsOn, heldSetIds; `src/core/employment.ts` 1–160 and 340–400; `src/core/hollywood.ts` initializeHollywood/enterRival; `src/core/calendar.ts` RIVAL_ARRIVAL_WEEKS; `src/core/lot.ts` propertyOf/INITIAL_PROPERTY structure list; `src/core/tuning.ts` founding capacities, WORLD_CONFIG, event/set constants; `src/core/worldgen.ts` 620–640 (concept ids `c-NN`, two-word titles; talent ids `t-<prefix>-NN`).
> - Records (evidence folder): 176 (fully, incl. §10), 137, 365, 501, 503, 505, 506, 513, 514 + raw `514-command-result-stale.txt`/`-firsttake.txt`, 500 raw stale/firsttake, 162, 175, 480, 481, 482 raw (context/charge/fact tables), 483 raw (contexts, charges, failure), 484, 485, 486, 492.
>
> ## Measurement basis and the paper mirror
>
> The 483 profile (492-equivalent source, contexts indexed per frame/site) and the 514 profile (505 source) agree byte-for-byte on every stage before the command projection, so 483's per-site categories are valid attribution for the 505 stale route through the week-8-label cut, except the `dimensions` sites after week 5 (+939/+54/+90 deferred cold discovery on 505) and the command sites (505 `commandDimensions`).
>
> The mirror reproduces all seven measured sweep bills exactly (315, 11193, 9587, 8905, 850, 7948, 576) AND the seven measured sweep-bill calculator execution costs exactly (1678, 4879, 5632, 4525, 1941, 5992, 1801 = 483 `frame.sweepBill` context sums). It also reproduces the cut position: 1193 units are spent inside `sweepBill` before line 1520's `times`; 514 measured 1995 from dimensionsDone to the cut = arrival ~496 + collectors ~300 + 1193. Unreached frames priced by the same mirror: rT2 general/singlePostExit bill **9234** (calculator 4401), rT1 restricted (o=1,r=1) bill **708** (calculator 1902). Frame labels below follow the probe (label k = branch.week k−1).
>
> ## 1. Attribution
>
> Legend: (a) actually executed owner/helper/ledger work that 176 requires to be paid; (b) prepaid bound that over-approximates what this fixture executes; (c) discovery/copy work with consumer named.
>
> ### 1a. Preparation + Ready admission, 0 → 66333 (33% of cap)
>
> | Block (lines) | Units | Class | What produces it |
> |---|---:|---|---|
> | envelope + branch literal (2627, 2662–2673) | 67 + 442 | a | fixed literals, ledger/calendar arrays |
> | `prepare` 534–799 | 9943 | a/b | facility `uniqueIds` sort 2158 (b: `sortBill(5,120)` for 5 already-ordered facility ids; real sorter runs); tokens 2246 (factRef, 2 mount identities, 2 fixed mount holds, 2 mount subjects; `token` bills 7 units/char for JSON escaping, 329–344); direct/text/equal/calc ~5.5k (root cuts, foreign relevance over 4 rival businesses, company() bills, identity scans) |
> | `admitReady` excluding the four sub-contexts (2400–2513, 2515–2579) | 40014 (=483's 45664 − 492's 5650) | a/b | dominant: six `searchBill` calls over `source.talent` (2444, 2448 → 2074–2085): ~165 row visits × 50 units of calculator scan (calc(16)+add+text+equal) ≈ 8.3k PLUS their returned owner bills ≈ 3.5k (`requireTalent` find prefix; a). Staffing/role reserve 2454–2457 ≈ 6k (a: real cast Set/role Map keyBills). Contracts/engaged/employment reserves 2491–2512 ≈ 4.5k (a). `initialAdmissionBill` 4579 + ~0.7k calculator (b: `developmentCapacity × 448` charges 2 slots with `keyBill(1,54)`; the owner examines 1 slot on an empty occupied Set → ~0.6k over). Five `addHold` 2572–2576 ≈ 4.5k (a; each ~422-unit `grant` token). `readyOccupancyBill` ≈ 2.4k (a). Link reserve + two copyCosts ≈ 1.2k (a). Header ≈ 1.5k (a). |
> | `readyProductionId` 1972–2072 | 9649 | a/b | calculator walk of every persisted-id root ≈ 4.6k (a) + reserve 5012 (b-by-law: 40/visit for ~57 rows, plus the 162 all-pairs `key(U,k)` Set bill for ~8 rival historical-film ids ≈ 2.3k) + `allocateIdentity` 738 |
> | cold `dimensions` 978–1041 | 3554 (44454→48008) | c | first discovery of operations/technology roots, P, workflow, bindings, reservation, 2 Sets; consumers: every later bill term (`pCopy`, `workflowCopy`, `bindingsCopy`, `setCopy`, `technologyCopy`, `d`) |
> | admission `drainEvents` 1612–1667 | 2196 | a | reservationGranted + phaseEntered: draft copyCost, bareKey, facility find, `canonicalIdentity` + 411-unit facility token, `addHold` + 422-unit token |
> | admission `reconcile` | 468 | a | |
>
> ### 1b. Per-frame work after `sweepBillDone` (505 measurements; 483 site split)
>
> | Label (week, rT) | after-bill total | sweep reserve (bill+97+100) | drainEvents | reconcile | release bookkeeping | class |
> |---|---:|---:|---:|---:|---:|---|
> | 1 (0, new) | 1459 | 315+197 | 8 | 468 | 463 | a |
> | 2 (1, 8→7) | 12501 | 11193+197 | 168 (phaseEntered) | 468 | 463 | reserve b, rest a |
> | 3 (2, 7→6) | 16019 | 9587+197 | 4799 (dev release, stage grant, Set hold, phase) | 961 | 463 | reserve b, rest a |
> | 4 (3, 6→5) | 13735 | 8905+197 | 2502 (scenery grant, phase) | 1590 | 463 | reserve b, rest a |
> | 6 (5, 4→3 wrap) | 15250 | 7948+197 | 5945 (wrapped, 2 releases, Set close, Post grant, phase) | 685 | 463 | reserve b, rest a |
> | 7 (6, 3→2) | 1937 | 576+197 | 0 | 689 | 463 | a |
>
> The 97 is the fixed observation literal (sink 27 + boundary 11 + sweepStarted 26 + binding 14 + APPEND + 16); the 100 is the `calc(64).plus` at 1898. drainEvents cost per reservation event ≈ 1.1–2.7k: draft copyCost discovery (~80 exec), three `find`s, bareKey+equal per candidate (~160), facility `find` (~100–300), `canonicalIdentity` scan and a 346–411-unit token on a miss, `closeHold`/`addHold` ledger scan plus hold copyCost discovery (157 exec → 61) or a 422-unit `grant` token. All (a), with three identifiable over-approximations: hold copyCost discovery on module-owned fixed-schema records (C6 below), 7-units/char token bound (C10), draft copyCost (501: no net, not re-proposed).
>
> ### 1c. `sweepBill` decompositions (mirror; exact)
>
> Retained-Development label 2, bill **11193** (1415–1532 general path, `retainedDevelopment=true`): common 1218 (orderBill 99, 80, keyBill 29, 2 visits × 276 = 552, per-n copies 448, keyBill 10) + attempts 1 × (enter 9912 + policyLock 63). enter = releasePhase 799 + 65 + phaseTransitions 1486 (= `transition` at 1456) + update 68 + **allocationBill 7050** + 98 + 95 + 101 + 150. allocationBill (1172–1213): raw 1365 (claims = 4×rawOwners), occupancy 2077, callback 47 × 5 = 235, **facilitySort 2158** (`sortBill(5, 120)`), retention 1832 (= 20 + 2 × 906), 2 requirement walks 590, 140.
> Actual owner at 8→7 (operations.ts): `releaseCompletedPhase` 1247–1285 keeps the dev slot and returns the SAME workflow (no spread; 1 `includes` compare of a 19-char capability); `allocateForPhase` 284–427: `resourceClaims` emits exactly 1 claim (1 reservation, no task, `bindings.setId` null → no set-exclusivity claim, occupancy.ts 570–587), excluded as own; 5 `allowsFacility` calls (t=0, cheap); real `boundedStableSort` of 5 facilities; ONE requirement (`preProduction` = `['development-casting']`, productionPhases.ts) taken by the retained arm (375–391); `recordReservationTransition` 554–574 with 1 key on both sides, no event; `beforePhaseEntered` returns at the phase guard; workflow/bindings/production spreads. Over-approximation: phaseTransitions ~1000, releasePhase ~600, raw/occupancy claims ~1430, retention ×2 ~900 (+ `keyBill(occupied+2,…)` on an empty Set ~440), second requirement walk ~295 → **≈4.5k of 11193 is (b)**.
>
> Post-entry label 6, bill **7948** (wrapOnly/singleWrapSlot): enter 6730 = releasePhase 799 + 65 + wear 417 + phaseTransitions 538 (small(2,0,2)+small(0,1,1), exact) + 3×68 + allocationBill 4263 (facilitySort 2158, callback 162×5 = 810, slots 657 (1 slot, exact), retention 138, walk 295, 140) + 98+95+101+150; common 1218. Actual (enterPhase 1287–1436): shooting→post retains nothing (`retainedCapabilitiesFor` = []), so the `8×text = 456` in releasePhase pays for zero string compares; `wearSetAtWrap` compares 8-char set ids, charged at width 28; `allowsFacility` compares a ~21-char studio id and a 9-char production id, charged at width 28. **≈0.9k (b)**; the rest is (a) and the sort is real.
>
> Single-early labels 3/4 (9587/8905): label 3 slotSearch 1971 = 3 slots × (5 + 106 + 2×keyBill(2,54)=546) — the owner examines 2 slots (composite: first sorted stage has set-0000 → break; requirement walk: only that stage) on an EMPTY occupied Set (own claim released, external 0) → `keyBill(0,54)=55` would be exact: ~1.3k over; composite 1147 charges both stages, owner visits one: ~0.44k; requirement walks `2×d.f×(2+text)=590` charge width 28 for 19-char capability compares: ~0.34k. Label 4: `occupiedKey = keyBill(2,54)` where the occupied Set holds 1 key: ~0.33k; set-exclusivity claim priced as two 28-char facility keys: ~0.15k. **≈2.1k / ≈0.5k (b).** Everything else there is tight (162/175 style).
>
> Restricted labels 1/5/7 (315/850/576) and the unreached rT1 (708): tight (162 KEEP model).
>
> Unreached Post-exit label 8, bill **9234** (general/singlePostExit): phaseTransitions **2972** (2×`transition` 1486), releasePhase 799, 3×update 204, allocationBill 3193 (facilitySort 2158, callback 810, occupancy 47, retention 20), common 1494 (3 visits × 276). Actual: `releaseCompletedPhase` post→releaseReady releases the single post slot (1 key vs 0: `smallTransitionBill(1,0,1)`≈186), second transition 0→0 (≈60), zero string compares in the retained filter, `allocateForPhase(releaseReady)` has no requirements (only occupancy + 5 policy calls + the real sort), the sweep does 2 visits (advance, released → `break`; second round settled). **≈3.5k of 9234 is (b).**
>
> ### 1d. Sweep-bill CALCULATOR execution (a, but structural)
>
> Computing the bills costs, per frame: 1678 / 4879 / 5632 / 4525 / 1941 / 5992 / 1801 (measured) and 4401 / 1902 (mirror, unreached) = 32751 on the full route, 16% of the cap, ON TOP of the 49k of bills. 484 measured all calculator categories at 52456 of the 483 prefix. The tally shows duplicated helper calls inside one `sweepBill` cost only 56–212/frame (hoisting is not the lever); 44% of each sweep-bill calculation is the `calc(k)` bucket charge (e.g. label 2: calc.arguments 2128 of 4879), i.e. coarse 8/16/32/64 buckets on ~100 call sites, plus branch terms evaluated only to be multiplied by 0 (`times(d.adoptions, …)`, `selection` with t=0, whole `raw`/`occupancy` trees on the singlePostExit path).
>
> ### 1e. Full `dimensions` per frame (c), 1070–4466
>
> Per 483 site 76 (label 7): direct 1162 (fresh literal 218 + 64, per-call fixed 40, text calls), **facts.scan 1782 (297 linear-table visits × 6)**, discovery 601 (43 keys), calc 608, text 210. Misses are unavoidable full scans (new P every advancing frame, new operations root/workflow/bindings/reservation/task on transitions: 365 law); hits for the newest records cost ~40 visits because the table is scanned oldest-first. Consumers of every projected field are identified (pCopy/workflowCopy/taskCopy/bindingsCopy/setCopy/technologyCopy/technologyRowCopy/allSilent/genreId → named bill terms). `d.d = 28` is `'facility-development-casting'` and is consumed as THE width for every `equality(d.d)` term, including terms whose actual operands are capabilities (≤19), production ids (9), set ids (8) or the studio id (~21).
>
> ## 2. Ranked lawful reduction candidates (gross, THIS fixture; all unadopted)
>
> Est. = gross units saved per frame / total to the refusal; law status; risks; controls needed before a writer.
>
> 1. **C2+C3+C4: exact pre-call bills for the three remaining over-approximated transition frames** (one bounded direction). Lawful under 176 §5 ("branch-specific bill selected only by facts available BEFORE that owner invocation") and §6 (first-call reservation covers every possible original outcome; no retry exists on these branches). Same pattern as the accepted `singleEarlySweepBill`/`singleWrapSlot`.
>    - C2 retained Development (label 2): in `sweepBill` 1462–1531 and `allocationBill` 1179–1212 when `retainedDevelopment`: phaseTransitions → `smallTransitionBill(d,1,1,0)` (1 kept key both sides, 0 emitted) instead of 2×`transition`; releasePhase → no workflow/bindings spread (owner returns the same workflow when nothing is released) and `equality(19)` for the one `includes`; raw claims = actual reservation count (1) not 4×owners; retention ×1 (the `preProduction` requirement list has one entry, a static table fact) and `keyBill(0,54)` for the `occupied.add` on an empty Set; one requirement walk. Proof additions to read (paid): `bindings.setId === null`, `reservations.length === 1` (already read), target-phase requirement count from the static table. **≈4.5k** on label 2 (also on the 276 first-take route and any 179-style all-at-8 slate; per retained move).
>    - C3 single Post exit (label 8): after `singlePostExitProof` true: phaseTransitions → `small(1,0,1)+small(0,0,0)`; releasePhase without the 8×text term; visits/commonVisits 2; update ×2. **≈3.5k** on label 8 (the frame that currently cuts).
>    - C4 rT7 single-early occupancy/slot exactness (label 3, plus label 4 and `initialAdmissionBill`): `occupiedKey = keyBill(actual occupied count, keyLength)` where the count is provable pre-call (n=1, external=0, own claims excluded → 0 at rT7 and at admission; 1 retained stage key at rT6); slots 3→2 and composite 2→1 stages with a paid proof that the first soundstage in id order carries a usable mounted Set (facility ids and `sets[].mountedOn/status/condition` are input facts; `hasUsableRehearsalSet` already scans them but in source order); requirement walks at `equality(19)`. **≈2.1k (label 3) + 0.5k (label 4) + 0.6k (admission)**.
>    Sum ≈ **11.2k gross** to the refusal. Risks: 276 first-take/kernel GREEN exercises C2 and C4 (must stay GREEN; lower producer work only helps its cumulative kernel assertion at test lines 210/321–327); C3 is exercised by NO existing GREEN control (Post exit at rT2 is reached only by the stale route) → a test-author must add a Started control: real state captured one tick before the existing Release-Ready fixture (rT2, postProduction, 1 post reservation), empty plan, H=now+1, asserting the owner outcome (releaseReady, post slot released, `reservationReleased`+`phaseEntered` provenance) and completion within the cap; 179 one/two-picture and 504/209/222/200 controls unchanged. Deferred-cold/table-history effects: none (no discovery change).
>
> 2. **C1: calculator execution structure** (`sweepBill`, `allocationBill`, `singleEarlySweepBill`, `restrictedSweepBill`, `smallTransitionBill`, `orderBill`, `arrivalBill`, `readyOccupancyBill`, `initialAdmissionBill`): size every `calc(k)` bucket to the counted nodes (2/node, 176 §1 accepted model; unchanged price per node) and do not evaluate branch subtrees that are structurally zero on the selected path (e.g. `times(d.adoptions,…)` when adoptions=0 is a read fact; the `raw/occupancy` tree on singlePostExit). Bill VALUES must stay byte-identical. Lawful under 176 as written ("Reserve each cost-calculator scan/arithmetic step before doing it too"; steps that no longer exist are not reserved). **≈8–11k** on the route (sweep-bill calculation 32.7k; bucket over-sizing ≈ 44% of it; ±3k). Risks: diffuse (≈100 sites), an auditor must recount every node; easy to be read as a "lower price" unless each site's node count is documented; parent must re-run the 514-pattern probe and require identical `bill` values at all seven measured frames. Not recommended first: highest review cost per unit.
>
> 3. **C6: fixed-schema copy price for module-owned hold records** in `closeHold` 1578 and `closePath` 1604: `copyCost(found.hold)` discovers 6/7 keys of a record this module constructed from `LITERAL.hold`/`LITERAL.fixedHold` (157 exec → 61). Use the module constant (`1+Σ(3+len)`: 61 / 79) selected by `row.fixed`, exactly the LITERAL convention at 137–148 ("Fixed SOURCE schemas… compute their exact literal costs once"). ~10 closes on the route × ~150 → **≈1.5k**. Lawful. Control: existing ledger/hold tests (Started/Ready files) unchanged; one assertion that a closed hold retains its exact key set is already implied by the kernel ledger check.
>
> 4. **C7: already-sorted detection in `uniqueIds`** 431–437 (prepare 655/662/663): use the existing `sortedOutput` pattern (392–422: pay the linear `less` walk, sort only on an inversion) before the adjacent-duplicate walk. Facility ids are in id order in this fixture → saves ≈2158 − ~600 = **≈1.5k**; a source with unordered facilities pays walk + full sort (small extra). Lawful (existing accepted pattern). Control: existing duplicate-id refusal tests.
>
> 5. **C5: static-domain widths** for terms whose operands are provably capabilities (≤19, the phase table) or set ids: `releasePhase` 8×text at 1457, requirement/retention walks `times(d.f, 2+text)` at 1207/1212/1342, `wearSetAtWrap` bill 1458, arrival guards 1121 (phase/status/blocker.kind operands). **≈0.4–0.5k per general frame, ≈2–2.5k** on the route. Lawful (consumed spans are the actual operands; the phase table is a source constant; set-id width is discovered). Risk: per-term operand proof must be written for the auditor; the ten-role hint model was rejected for ADDING work, this adds none.
>
> 6. **C8 (observation, not recommended):** admission talent `searchBill` restructure (one paid width/count pass + whole-roster bounds instead of six exact-prefix calculator scans): −3k…+1k depending on unknown roster positions; the 487 probe recorded id widths, not positions. Needs a position probe first.
>
> Needs a 176 clarification (not lawful as written):
> - **C9:** 176 §2 fixes `M = n·L` head comparisons (15 for n=5); the actual max for a 5-element merge sort is 9. Seven facility sorts on the route (prepare, admission, labels 2/3/4/6/8) × 6×128 → **≈5.4k**.
> - **C10:** `token` 329–344 bills 7 output units per code unit (JSON escaping bound). A paid pre-scan proving escape-free ASCII would justify 1/char output span (176 "consumed string spans"). ~15 tokens × ~60 chars → **≈3–4k**.
>
> Not lawful / not proposed: any Map/hint lookup without a tariff (365, 484 rejection), pruning table entries, refunds, per-plan resets, cross-identity caches, timing, cap/test/fixture changes, removal of any refusal/owner/provenance/drain.
>
> ## 3. Gap statement
>
> Measured to the cut: 199994 at label 8 inside `sweepBill` (1193 units into the calculation). Remaining, by mirror + formula inspection with 483-site analogs (paper, not measured):
> - Rest of label 8: sweep-bill calculator remainder 3208 + reservation 9331+100 + drain (post release + phaseEntered) ≈1.2k + reconcile ~75 + bookkeeping 463 + 12 ≈ **14.4k**.
> - Week-8 (label 9) `commitRelease` command 1758–1818: loop/resolved literal 70, `commandDimensions` ≈2.0k (new workflow/bindings/operations roots cold + longer table scans), sink/literals/commandBill calculator ~500, 30-concept title/id scan (`c-NN`, two-word titles) ~0.7k, release-refusal reserve ≈2.5k (`33×61+…`, width 28), commitment reserve ~300, drain ~140 → **≈7.3k** (6.5–8.5k).
> - Label 9 frame (1→0 release): background 173, dims ≈3.0k (2.7–4.5k), arrival ~500, collectors ~315, restricted bill calculator 1902 + reservation 905, reconcile ~60, release bookkeeping ≈3.4k (closePath over 5 person holds with copyCost ≈1.9k, novelty/prune/filter reserves ~1.2k, sorts/finds) → **≈10.3k** (9.5–12.5k).
> - Week-9 stale command: find on an empty branch, `commandRefused` (8+9+42), cut literal 70 → **≈0.2k**.
>
> **Remaining: low ≈29.5k, likely ≈32k, high ≈38k** (route total ≈232k). Sum of the lawful-as-written candidates C1–C7: ≈23–26k gross (C1 8–11k + C2/C3/C4 11.2k + C6 1.5k + C7 1.5k + C5 2–2.5k). **They do not close this fixture's route.** Adding both clarifications C9+C10 (≈9k) reaches ≈32–35k: marginal against the likely gap and below the high estimate. Note every figure above is gross; 505 showed ~36% of a discovery saving re-appearing later, though C2–C7 change no discovery, so their deferral risk is nil. The honest finding for escalation: under 176 as written and the current tariff helpers, the 302 stale route (9 frames + 3 commands, H=10) cannot be shown to fit 200000 by the bounded reductions identified here; closing it needs either a 176 clarification (C9/C10) on top of C1–C7, or a decision Fable must take about the fixture's horizon/route, which this report does not propose.
>
> ## 4. Explicit non-proposals
>
> No looser cap, no weakened/modified test or expected-failure set, no timing, refund, per-plan reset or cross-identity cache, no removal of any refusal/owner/provenance/drain, no invented fixture, no Map/hint tariff, no draft-copyCost swap for `pay(10)` (501).
>
> ## Evidence limits
>
> Remaining-route figures are paper (mirror + 483 site analogs), not measured; the singlePostExit path (label 8) was never exercised by a measured frame, so its 9234/4401 rest on my transcription of lines 1179–1212 and 1458–1531 (mirror otherwise exact on 14 measured quantities). Talent-roster positions, hold/ledger sizes at labels 8–9 and concept title lengths are estimated. No fixture was constructed and nothing was executed against the source.
>
> ## Recommendation
>
> **Single next bounded direction: C2+C3+C4 (exact pre-call bills for retained Development, rT7 single-early occupancy/slot count, and single Post exit), ≈11.2k gross, confined to `sweepBill`/`allocationBill`/`singleEarlySweepBill`/`initialAdmissionBill`.** Why: every term removed is a named over-approximation against a specific owner line (operations.ts 1247–1285, 284–427, 554–574, 1654–1817; productionPhases table), it follows the already-accepted branch-proof pattern, it is auditable term by term, it changes no discovery (no deferred-cold or table-history side effects), and it directly moves the cutting frame (label 8) plus the two largest measured reserves; preconditions: a test-author Post-exit (rT2) Started control before the writer, 276 first-take/kernel must stay GREEN, then a 514-pattern re-measurement. State up front to Fable that this direction alone leaves the stale route RED (gap ≈32k vs ≈11k) and that the full lawful set is not expected to close it without a 176 clarification.
>
> **Runner-up: C1 calculator execution structure** (≈8–11k, byte-identical bills required, diffuse review), to be attempted only with a probe-based bill-equality check, after the branch bills.

### 515-B — instrumentation READ_ONLY gap model, verbatim, SHA256 `0bac1c3158b7c680ed0cd05452cc5283668dfdfa0450ac414b23c6b09bf1f2d3`

> # 515-B — paper model of the stale-after-release route beyond the 505 cut (READ_ONLY)
>
> **Status: DONE.** No worktree file created or edited; no vitest/tsc/npm; no Git or network. Scratch arithmetic only: `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/replica515b.js` (a transcription of the 505 tariff calculators, run with `node`; not the source, not a test).
>
> ## Model observed
> 1. Source identity confirmed: `src/core/promiseCapacityOwnerReplay.ts` SHA256 `5d4851713ff53209b569c813b78a1e22e6b53ab91e27522ceb5a9ee7222a941a`, 2740 lines, HEAD `9ed6e35`.
> 2. Transcribed into the scratch script: `Work` (245-345), `LITERAL` (143-242), `sortBill` (357-372), `find` (423), `workflowUpdate` (1093), `arrivalBill` (1105), `orderBill` (1129), `restrictedSweepBill` (1135), `allocationBill` (1172), `smallTransitionBill` (1216), `hasUsableRehearsalSet` (1231), `singleEarlySweepBill` (1251), `singlePostExitProof` (1399), `sweepBill` (1415-1532), the frame reserve at 1898-1899, the `executeCommand` commitRelease arm (1797-1817) and the week-10 refusal/cut path (1760-1762, 2699-2716). Fixture facts fed in: the probe `Dimensions` record (n1 f5 capacity8 sets2 external0 d28 dp9 pCopy101 workflowCopy98 taskCopy66 bindingsCopy95 operationsCopy33 setCopy137 technologyCopy132 technologyRowCopy62 t0/1 structures8 provides5 genreRows1 genreId9 allSilent), founding facilities `INITIAL_STUDIO_FACILITIES` (operations.ts 85-120; capacities 2/2/2/1/1 from tuning.ts 632-635; `facility-development-casting` is the d=28 string), sets `set-0`/`set-1` (sets.ts 91-98), production id width 9 (`prod-NNNN`), studio id `studio-<8hex>-player` = 22 chars (hollywood.ts 160), project id 11 chars (derived below), concepts 30 × `c-NN` with titles `lead noun` 12-27 chars (worldGen.ts 634-645, wordlists.ts 39/51, tuning.ts 1978).
> 3. Calibration against the 514 raw probes: the replica reproduces all seven measured weekly bills (315, 11193, 9587, 8905, 850, 7948, 576), all seven measured `sweepBill` self-charge totals (1678, 4879, 5632, 4525, 1941, 5992, 1801 = sweepBillDone − dimensionsDone − fixed pre-sweep constant 767/769/765/787/770) and the 1225 units consumed inside the week-8 `sweepBill` before the failing `pay(10)` — fifteen exact matches. This pins the week-8 branch as `general` with `singlePostExit = true` (remaining 2, task null, one `post` reservation) and the week-9 branch as `restricted` with o=1, r=1 (remaining 1, committed).
> 4. Post-owner work (drain/reconcile/loops) is source-modelled, not replicated end-to-end; its one calibration point is week 7: measured post-owner residual 1156 (1937 − 773 reserve − 8) vs model 1164 (drain 4 + reconcile 697 incl. a 529-unit `reservationSubject` + fixed loops 463).
>
> ## Sources actually read
> - `docs/.../evidence/p14b4-20260919/176-started-replay-work-contract.md` (whole), `514-command-result-probe.md` (whole), `514-command-result-stale.txt` / `514-command-result-firsttake.txt` / `500-width-result-stale.txt` / `500-width-result-firsttake.txt` (all `B4_RESULT` lines, full `sweepBillDone` records w5-7, full payFailure stacks), `514-command-result-stale.patch` (probe placement: `frameEntry` before `pay(7)`, `dimensionsEntry`/`commandDimensionsEntry` at function entry, `commandEntry` before the first `pay(8)`, `sweepBillDone` after `sweepBill` returns, before the 1898 reserve), `501-admission-width-qualified-checkpoint.md` (whole).
> - `src/core/promiseCapacityOwnerReplay.ts` 122-441, 449-533, 840-1135, 1135-1532, 1534-1968, 2582-2740.
> - `tests/p14b4-ready-replay-stale-target.test.ts` 1-280 (whole); `tests/p14b4-ready-replay-first-take.test.ts` 1-330 (whole).
> - `src/core/operations.ts` 80-130, 540-660, 1330-1400, 1735-1835; `src/core/sets.ts` 91-98, 105-135; `src/core/hollywood.ts` 150-170; `src/core/worldGen.ts` 595-660; `src/core/occupancy.ts` 244-246; `src/core/tuning.ts` 632-635, 840, 1978; `src/core/data/wordlists.ts` (lengths only).
>
> ## 1. Verification of the 514 arithmetic (raw lines, stale 505 unless stated)
> Per frame (frameEntry → next frameEntry): w1 72350−66333 = **6017** (bill 315); w2 91740−72350 = **19390** (11193); w3 116734−91740 = **24994** (9587; after-bill 116734−100715 = **16019**); w4 138493−116734 = **21759** (8905; after-bill **13735**); commands 149340−138493 = **10847**; w5 159631−149340 = **10291** (850); w6 185566−159631 = **25935** (7948; after-bill **15250**); w7 194713−185566 = **9147** (576); w8 cut: dims 194886→197999 = 3113, payFailure at 199994 requesting 10. All match the parent's table. Commands: assign 145682−138493 = **7189**, its commandDimensions 141375−138550 = **2825**; schedule 149340−145748 = **3592**, commandDimensions 148095−145805 = **2290**. Preparation 66333 = 44454 + 3554 (pre-frame `dimensions`) + 18325. 492→505: discovery 4542 (142446−137904) → 2825 = −1717; 3176 (150028−146852) → 2290 = −886; w5 dims 3234 (155302−152068) → 4173 = +939; w5 entry 151895 → 149340 = −2555; w6 entry −1616; w7 entry −1562; w8 entry 196185 → 194713 = **−1472**; w8 dims done 199381 → 197999 = −1382; first-take result 190818 → 189256 = **−1562**. No discrepancy in any reported figure.
>
> Three refinements the table does not spell out:
> - The "week 4 21759 / 13735 after" figures end at `commandEntry`, so they include 70 units of week-5 loop/command dispatch (2678 `pay(4)`, 2680 `pay(3)`, 2685 `pay(8)`, `equal(projectId, readyProjectId)` = 23, `LITERAL.resolvedCommand` = 32); frame(4) proper is 21689. The 23 fixes the project ID width at 11 (the commandDone→commandEntry gap 145748−145682 = 66 = 3+8+23+32).
> - Gross command saving 2603 vs 2555 at w5 entry: the 48 is the two new `pay(24)` at 505 line 1764 (492 spent 33 before its command `dimensions`, 505 spends 57 before `commandDimensions`).
> - The deferred cold discovery is not only +939 at w5. `dimensions` also costs +54 at w6 (3733 vs 3679), +90 at w7 (4466 vs 4376) and +90 at w8 (3113 vs 3023) on 505 vs 492, so the net saving shrinks 2555 → 1616 → 1562 → 1472 → 1382 exactly. The +90/frame from w7 on is a systematic per-frame tax (consistent with ~15 extra 6-unit warm scan steps in `dimensionRecordFacts` per `dimensions` call, i.e. a slightly longer record table after the two `commandDimensions` calls); it recurs on every later frame including week 9.
>
> ## 2. Remaining executed stages from the cut (used 199994, 6 units unspent) — LOW / LIKELY / HIGH units
> (a) Rest of week-8 frame (Post 2→1, `general/singlePostExit`):
> - failed `times` 10 + rest of `sweepBill` 3166 (lines 1521-1531: `enter` 1920 charges incl. `allocationBill` 1722, `common` 1046, return 166) = **3176** exact (replica).
> - bill value **9234** (`common` 1494 + `enter` 7677 + `policyLock` 63; `allocationBill` value 3193 of which facility `sortBill(5,120)` = 2158); reserve at 1898 = 100 charges + 9234 + 97 = **9431** exact; `pay(8)` after the owner.
> - `drainEvents`: source fact (operations.ts 1358, 1385): Post exit emits `reservationReleased`(post) + `phaseEntered`. Model: 4 + [166 draft/boundary/ownerEvent + 69 three finds + 136 bareKey/equal + 5 + 529 `reservationSubject` (20-entry identity table) + 363 `closeHold` over 12 ledger rows] + 164 phase event = **1436**; LOW 1350 / HIGH 1600 (identity-table length).
> - `reconcile` (workflow now has zero reservations): **107** (100/200). Zero/release/first-take loops with released=[] and 0 commitments: **463** exact (calibrated on w7).
> - (a) total: **LOW 14528 / LIKELY 14625 / HIGH 14878** (12615 of it exact).
> (b) Week-9 `commitRelease` command: dispatch 70 + executeCommand excl. `commandDimensions` **4391-4901** (replica: 57 pre-projection + 33 sink + 20 command literal + 16 boundary + 30 + 414 commandBill calculator charges [value 718 not paid in this arm] + 10 + concept loop 664-1114 (30 concepts × (4+1+|title|+5)) + release-owner bill 2675-2735 (212 charges + value 290 + 33×(4+57) + 4×(|title|max+28); the `max(d, longestTitle)` span is pinned at 28 because titles ≤ 27) + 16 + 281 withReleaseCommitment (incl. `sortBill(1)`) + 39 releaseCommitted + 136 drain of one `{kind, productionId}` draft) + `commandDimensions` LOW 1500 / LIKELY 1950 / HIGH 2900 (cold operations/workflow/bindings, no reservations/task; HIGH = measured cold analogue 2825). **LOW 5961 / LIKELY 6649 / HIGH 7871**.
> (c) Week-9 frame (`restricted`, o=1 r=1, actual release admission): pre-dims 173 exact + `dimensions` LOW 3200 / LIKELY 3700 / HIGH 4500 (five cold records: production, operations, technology root, releaseReady workflow, bindings; extrapolated from the measured w7/w8 values 4466/3113 and the record-table growth) + 813 exact (sink 33, arrival 461 for phase `releaseReady`, 4, factories 130, commitments(1) 179, 6) + `sweepBill` self-charges **1902** + bill **708** + reserve 100+97 (= 2807 exact) + 8 + drain **4** (source fact operations.ts 1768: release records a transition against `[]` on a workflow with no reservations; nothing is emitted) + reconcile 80 (workflows now `[]`) + fixed loops with released=[id], commitments 1: **787** exact + released-loop body **2661** (5 + two finds 46 + boundary 16 + `closePath` peopleOnly 1941 over 12 rows [5 closed rows 20, 2 mounts 216 with pathKey spans 45/53, 5 person holds 5×343 incl. copyCost 61 + write 75] + 35 + find 23 + `depleteSetNoveltyForRelease` bill 595). **LOW 10472 / LIKELY 11033 / HIGH 12012**.
> (d) Week-10 stale `commitRelease`: loop 4+3+8+23+32, `executeCommand` 8 + `find([])` 2 + `commandRefused` 59 (8 + `LITERAL.commandError` 9 + 42-char detail), cut construction 70 (5+48+11+6): **209** exact.
> (e) Empty-slate frames: **0**. The week-10 command is dispatched before `frame(10)`, so the refusal ends the plan at `through {week 10}` (matches test line 235) and no frame runs after the release; horizonEndWeek 11 is never reached. (Hypothetical only: an empty-slate frame would cost ≈ 3.8k; not on the asserted route.)
>
> ## 3. Gap totals
> Units still required beyond the cut = (a)+(b)+(c)+(d)+(e) minus the 6 unspent: **LOW 31,164 / LIKELY 32,510 / HIGH 34,964** above the 200,000 cap; whole-route producer work ≈ **231.2k / 232.5k / 235.0k**. The parent's "tens of thousands" statement holds; the cut sits at 86% of the route.
> First-take route (505): producer result 189,256, so `searchPromiseCapacityTraces` starts with **10,744** of the shared cap. The 514 first-take PASS (line 327 `workUsed ≤ 200000`, line 326 `> 189256`) proves the kernel consumed between 1 and 10,744 units on this fixture; no record logs `capacity.workUsed`, so the actual slack is unmeasured (anywhere in 0..10,743). 276 therefore has headroom only in the sense that it passes; a producer regression of more than 10,744 units would fail it regardless of kernel cost.
>
> ## 4. Dominance (LIKELY route ≈ 232.5k; shares of the 200,000 cap in brackets)
> | Component | Units | % route [% cap] |
> |---|---:|---:|
> | Preparation + Ready admission before frame 1 (excl. its `dimensions` call 3554) | 62,779 | 27.0 [31.4] |
> | Owner bills paid at 1898 (w1-w9: 315, 11193, 9587, 8905, 850, 7948, 576, 9234, 708) | 49,316 | 21.2 [24.7] |
> | Discovery: `dimensions` ×10 (3554, 1940, 1070, 2401, 2561, 4173, 3733, 4466, 3113, ~3700) + `commandDimensions` ×3 (2825, 2290, ~1950) | 37,776 | 16.2 [18.9] |
> | `sweepBill` calculator self-charges (1678, 4879, 5632, 4525, 1941, 5992, 1801, 4401, 1902) | 32,751 | 14.1 [16.4] |
> | Post-owner drain/reconcile/loops (947, 1111, 6235, 4633, 2170, 7105, 1164, ~2006, ~3532) | 28,903 | 12.4 [14.5] |
> | Command bodies excl. projection (assign 4307, schedule 1245, commit ~4699, stale 209) | 10,460 | 4.5 [5.2] |
> | Fixed per-frame constants (173 pre-dims, sink/arrival/factories/commitments ~770, reserve 100+97) ×9 | ~10,400 | 4.5 [5.2] |
> By calendar block: prep+admission 66,333 [33.2%]; Development w2-w4 66,143 [33.1%]; Post w6-w8 54,984 [27.5%] (w8 complete ≈ 19,902); week-5 commands+take 21,138 [10.6%]; week-9/10 tail 17,891 [8.9%]; week 1 6,017 [3.0%].
> Reading: closing a ≈32.5k gap needs roughly 14% of the whole route. Every block small enough for a 1-3k lawful trim (a single command projection, one frame's post-owner work, the reserve literals) is an order of magnitude short. Only four blocks are individually as large as the gap: preparation/admission (would need −52%), the five general-branch bills w2/w3/w4/w6/w8 = 46,867 (−69%), discovery (−86%) or the calculator self-charges (−99%). The self-charge block is the one unattributed to any owner: each general-branch frame pays 4.4-6.0k just to compute an 8-11k bill (w8: 4,401 to compute 9,234), driven by `calc(64).plus(...)` receiver reservations (64 + 20 + 8·(k−1)) and repeated nested `calc(8).equality`/`keyBill` (28/72 each) — a tuning observation for the parent, not a proposal.
>
> ## 5. Limits
> - The replica is a transcription validated on 15 measured quantities; it is not the source and cannot see owner return values. Week-8/9 tariffs assume the owners return the reference shapes the test asserts (Post exit → releaseReady with zero reservations; release removes the workflow), which the 500/514 runs confirmed only through week 8.
> - `dimensions`/`commandDimensions` at week 9 are extrapolated from measured record-table growth (±20%); whether the releaseReady workflow/bindings are fresh objects (cold) is assumed, worth ±600.
> - Identity-table length (20 entries) and director ID width (≤28) are assumed; validated only indirectly by the 8-unit week-7 residual match.
> - Longest concept title for this seed is unknown within 12-27 (±240 units, already inside the band).
> - Kernel consumption on the first-take route is unmeasured; only the pass bound exists.
> - No fix, tariff change, cap, timeout, assertion or fixture change is proposed or evaluated.
