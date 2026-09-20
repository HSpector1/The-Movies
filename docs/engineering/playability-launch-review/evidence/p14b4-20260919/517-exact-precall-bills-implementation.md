# 517 — Exact pre-call bills (C2 retained Development, C3 single Post exit, C4 single-early and admission)

2026-09-20. Sim-core writer, IMPLEMENT mode, sole production writer. Model observed: the
harness identifies the session as Fable 5.1 (`claude-fable-5-1`). The lean-ctx MCP tools
named in the user CLAUDE.md were not exposed; Read/Edit/Write/Bash were used.

This is the work-accounting correction adopted in 516 (parent addendum items 1–7, refining
515 §4). It is not a gameplay change, not a discovery change and not a fix of the 302 stale
route, which stays RED by expectation. No fit or savings claim is made here.

## Scope and pins

- Worktree `/Users/zacheryspector/The-Movies-headless-program`, branch
  `wip/headless-program-20260916-ts`, HEAD `df0533c6fac18ec5027231500d80050d800fd3b5`, tree
  clean before editing.
- `src/core/promiseCapacityOwnerReplay.ts` before editing: SHA256
  `5d4851713ff53209b569c813b78a1e22e6b53ab91e27522ceb5a9ee7222a941a`, 2740 lines (the frozen
  505 candidate), verified with `shasum -a 256` and `wc -l` before the first edit.
- After the final edit: SHA256
  `65cf1bf1a66c3cc91c819ac7f5402527ca677900002c90ca3e58d443f9ac697e`, 2796 lines (+56).
- Only two paths were edited: that source file and this handback. No test, fixture, config,
  validator, tuning, owner, kernel, save/projection, schema or other file was touched. No Git
  operation, no network, no vitest, no delegation.
- The single authorized runtime check, `npm run typecheck` (root + UI tsc), ran once after
  the final edit. Exact output:

```text
> project-studio-core@0.1.0 typecheck
> tsc --noEmit && tsc -p ui/tsconfig.json --noEmit

EXIT=0
```

Line numbers below refer to the NEW file unless marked "old".

## Complete implementation delta

### `allocationBill` (1172–1225)

- 1173: signature gains two trailing defaulted parameters, `retainedClaims = 0` and
  `retainedOccupied = 0`. The function stays module-private; no export changes.
- 1184: `claims = retainedDevelopment ? retainedClaims : work.calc(8).times(4, rawOwners)`.
- 1185: `occupied = retainedDevelopment ? retainedOccupied : work.calc(8).add(d.external,
  work.calc(8).times(3, other))`.
- 1212–1218: `retention` gains a `retainedDevelopment` arm between the `singleWrapSlot` arm
  and the general arm: `add(20, plus(20, times(2, text), times(d.f, 2 + text), keyBill(2, 19),
  keyConstruction, keyBill(occupied, keyLength)))`, that is ×1 with the exact union instead of
  ×2 with `occupied + 2`. The general arm's expression is byte-identical.
- 1224: the requirement-walk multiplier becomes `wrapOnly || retainedDevelopment ? 1 : 2`.
- `other`, `rawOwners`, `raw`'s per-workflow terms (`2 * d.n`, `times(2 * rawOwners, text)`),
  `selection`, `adoption`, `callback`, `facilitySort`, `slots`, `composite`, the 20/140
  constants and the `singlePostExit` arms are unchanged.

### `singleEarlySweepBill` (1263–1413)

- 1316: `occupiedKey = work.calc(16).keyBill(d.external + (shooting ? 1 : 0), keyLength)`
  (old 1301: `d.external + 2`). The `+ d.external` term stays.
- 1359: the requirement-walk width becomes `2 + capabilityText` (old 1342: `2 + text`), that
  is `2 * d.f * (2 + equality(19))`.
- No slot 3→2 or composite 2→1 reduction (the optional ordered proof is omitted, as the
  default in 516 item 5). No new `Dimensions` field.

### `sweepBill` (1432–1590)

- 1479–1481: `releasePhase` is now
  `retainedDevelopment ? calc(32).plus(40, 4 * equality(19), 2 * keyBill(1, 19),
  LITERAL.phaseRelease, 6) : calc(64).plus(80, singlePostExit ? 0 : times(8, text),
  d.workflowCopy, d.bindingsCopy, 70)`. Values: 339 retained, 343 Post exit, 799 elsewhere.
- 1498: `rounds = retainedDevelopment || singlePostExit ? 2 : 2 * d.n + 1`. `visits` and
  therefore `commonVisits` (still `singleWrapSlot ? 2 : visits` at 1577) become 2 on the
  Post exit; `attempts` stays `singlePostExit ? 1 : …` at 1500.
- 1504–1516: one new guarded block after the existing retained loop and after the `attempts`
  selector: `let retainedClaims = 0, retainedOccupied = 0; if (retainedDevelopment) { … }`. The
  block walks every `operations.workflows` row, reads `reservations.length`, `bindings.setId`
  and `shootingTask`, sums `retainedClaims` (reservations + task + bound Set) and
  `slateKeys` (reservations + bound Set), then sets
  `retainedOccupied = add(d.external, slateKeys - 1)`.
- 1564–1570: `phaseTransitions` becomes a four-way chain: `singleWrapSlot` (unchanged
  expression), `retainedDevelopment ? smallTransitionBill(d, 1, 1, 0)`, `singlePostExit ?
  calc(16).add(smallTransitionBill(d, 1, 0, 1), smallTransitionBill(d, 0, 0, 0))`, otherwise
  `calc(32).times(2, transition)` (old: `times(retainedDevelopment ? 1 : 2, transition)`).
- 1572–1574: `enter` uses `times(retainedDevelopment ? 1 : singlePostExit ? 2 : 3, update)`
  and passes `retainedClaims, retainedOccupied` to `allocationBill`. `d.workflowCopy`,
  `d.bindingsCopy`, `d.pCopy`, 150 stay in `enter` on every arm.
- `transition` (1473), `wear`, `update`, `policyLock`, `setup`, `binding`, the wrapOnly block,
  `common` and the return are unchanged.

### `initialAdmissionBill` (2391–2440)

- 2425: `examined = occupied === 0 ? 1 : developmentCapacity`.
- 2426: `slotKey = occupied === 0 ? work.calc(8).keyBill(0, keyLength) : key`.
- 2436: the slot term becomes `times(examined, plus(14, 50 + 2 * d.d, slotKey, slotKey))`
  (old 2380: `times(developmentCapacity, plus(14, 50 + 2 * d.d, key, key))`). `key` is
  unchanged and still feeds the two occupancy terms, which are ×0 when `occupied === 0`.

Nothing else in the file changed. `dimensions`, `commandDimensions`, `dimensionRecordFacts`,
`staticDimensionFacts`, `LITERAL`, `Work`, `smallTransitionBill`, `singlePostExitProof`,
`hasUsableRehearsalSet`, `restrictedSweepBill`, `frame`, `admitReady`, every owner call,
order, refusal, provenance, drain, cap, span, trace limit, validator and timeout are as in 505.

## Owner inventory

Each changed term, the owner lines that prove the executed work, and the pre-call facts that
select it with the site where they are paid.

| Term (new line) | Selected by (paid pre-call facts) | Owner evidence |
| --- | --- | --- |
| C2 `phaseTransitions = small(1,1,0)` (1567) | Retained loop 1452–1466: every started picture at 8 with phase `development`, exactly one reservation of capability `development-casting`, no task, no blocker, no setup (paid at 1458–1464, `find` at 1456). | `releaseCompletedPhase` keeps the slot (`retainedCapabilitiesFor('development','preProduction')` = `['development-casting']`, productionPhases.ts 55–56, 160–161) and returns the same workflow at operations.ts 1264, so `enterPhase` 1321 skips the release transition; `allocateForPhase` takes the retained arm at 375–391 and `recordReservationTransition` 554–574 runs once at 1380 with one key on both sides; both `includes` hit, no event. |
| C2 `releasePhase` 339 (1480) | Same loop. | Two capability compares (productionPhases.ts 161 filter `includes`; operations.ts 1257 `retained.includes`), `claimed.has`/`claimed.add` on a 19-char key (1257–1258), one reservation visit, both arrays and the return record; `released.length === 0` returns the same workflow (1264), no spread. Same shape as the accepted single-early release at 1379. |
| C2 `claims = retainedClaims` (1184) | New walk 1508–1512 over every workflow row (paid 1506, 1509, calc sites 1511–1512). | `resourceClaims` (occupancy.ts 409–437) emits one claim per reservation and one per non-null task; 6c (570–587) emits a set-exclusivity claim only when `bindings.setId !== null` and a soundstage reservation exists; the walk counts a Set claim for every non-null `setId`, which is an upper bound. Screenplay/casting/installation/research rows are supplied as `d.external` by `frame` (1847–1862). |
| C2 `occupied = retainedOccupied` (1185) | Same walk plus `slateKeys - 1` at 1515 (paid 1514). | `occupiedSlots` 242–259 filters owner `production` and excludes the own production id (`claimPasses` 637–646); task claims carry owner `shootingTask` and never index; Set claims key as `set:<id>` (occupancyKeyOf 291–299) and do index. Each retained picture holds exactly one key (loop proof), so another picture's union is `d.external + Σ keys − 1` at most. |
| C2 `retention` ×1, `keyBill(occupied, keyLength)` (1214–1216) | Same loop; `requirementsForPhase('preProduction')` is the static one-entry table (productionPhases.ts 56). | Loop 375–391 runs once; the retained arm's `facilities.some` (382), `alreadyRetained.add` (387), reservation spread (388) and `occupied.add` (389) execute, and 389 is the first insertion into `occupied`, so the Set holds exactly the union at that add. The 20/140 constants stay. |
| C2 walk ×1 (1224) | Same loop. | The retained arm `continue`s at 390 before the facility walk 394–415; one walk is conservative (exact 0). |
| C2 `update` ×1 (1572) | Same loop. | `replaceWorkflow` runs only at 1430 (1356 skipped, 1370 unreachable because `allowsFacility` never excludes `development-casting`, technologyProduction.ts 74–77, and the retained slot is always re-claimable). |
| C3 `phaseTransitions = small(1,0,1) + small(0,0,0)` (1568–1569) | `singlePostExitProof` 1416–1430 (unchanged, paid): n = 1, one workflow, started, remaining 2, no task, one `post` reservation, phase `postProduction`. | `retainedCapabilitiesFor('postProduction','releaseReady')` = `[]` (productionPhases.ts 60); the single post slot releases; transition at 1354 has before [1 key], after [], one `reservationReleased`; `allocateForPhase('releaseReady')` has zero requirements (loop 375 never iterates) and always returns `ok`; transition at 1380 is empty to empty, no event. |
| C3 `releasePhase` 343 (1481) | Same proof. | Filter and loop perform zero string compares (`[].includes`, empty `retained`); the release DOES spread the workflow (1266) and derives bindings (1281), so both copy terms stay; only the eight-compare term leaves. |
| C3 `update` ×2 (1572) | Same proof. | `replaceWorkflow` at 1356 and 1430; the failure arm 1370 is unreachable. |
| C3 `rounds = 2` → `commonVisits = 2` (1498, 1577) | Same proof. | `advanceManagedProductions` 1654–1817: first visit advances with `released` true → `break` (1806); second visit hits `settled.has` (1657) → `continue`; the round makes no further progress and the loop exits. |
| C4 `occupiedKey = keyBill(d.external (+1 at 6))` (1316) | Single-early guards 1265–1289: n = 1, one workflow, remaining 7/6, matching phase, one reservation, no task, `requiresSetBinding`, capability, `setId`/`stageFacilityId` shape; `d.external` from `frame` 1861–1865. | At 7 the Development slot is released before allocation (`retainedCapabilitiesFor('preProduction','rehearsal')` = `[]`), own claims are excluded (637–646) and `setId === null`, so every `occupied.has` (326, 403) sees exactly the external keys; the single `occupied.add` (411) is the last operation. At 6 the retained stage key is added at 389 before the scenery walk, so membership tests see at most `d.external + 1` keys. The blocked-retry at 7 releases nothing further and sees the same union. |
| C4 walk width `equality(19)` (1359) | Same guards. | Walk 394–415 compares `facility.capability !== capability` (phase-table capabilities, ≤ 19 chars) for every facility. Coverage statement: at 7 the one executed walk (rehearsal = `['soundstage']`) costs 5 × (2 + 39) = 205 for the capability compares plus, on the two soundstage facilities, `capability === 'soundstage'` (≤ 39), `boundSet !== null` (2) and `facility.id !== boundSet.mountedOn` (2 + equality(28) = 59): 2 × 100 = 200; total 405 ≤ 410 = `2 * 5 * (2 + 39)`. The auditor's figure 5×41 + 2×59 = 323 omits the second capability compare and is also covered. At 6 the soundstage requirement takes the retained arm before any walk and the set-scenery walk costs 5 × 41 + 39 = 244 ≤ 410. |
| Admission `examined = 1`, `slotKey = keyBill(0)` (2425–2426, 2436) | `occupied = indexedClaims + d.external` (2419, from the paid walks 2398–2417 and `admitReady` 2577–2586). | `addManagedProductionWorkflow` 621–626 calls `allocateForPhase` with the draft (no reservations, no task, empty bindings) and the external union; with `occupied.size === 0` the first Development slot in id order is free: one `occupied.has` (403) and one `occupied.add` (411) on an empty Set, then `break`. With zero Development capacity no slot is examined and the refusal is thrown; pricing one slot is conservative. Any occupied key keeps the full `developmentCapacity` bound (the background control's casting row can hold slot 0). |

## Source-counted prepayments

Two units per scalar node, as in 505. "Guard" names the arm that executes the site; a site
listed as "selected arm only" never executes on any other arm, so those arms' payment
sequences are byte-identical to 505.

| Site (new line) | Guard | Payment and counted work |
| --- | --- | --- |
| 1506 `work.pay(16)` | `retainedDevelopment` only | Guard read/branch 2, `slateKeys` binding/literal 2, `operations.workflows` reads 2, iterator setup/terminal 2 = 8 nodes. The two outer locals at 1504 (2 bindings, 2 literals) initialize one statement earlier; see the non-selected-arm note below. |
| 1509 `work.pay(24)` per row | `retainedDevelopment` only | Visit/control 1, `row.reservations.length` 3, `row.bindings.setId` 3, `=== null` 1, selection 1, literal 1, `+` 1, `keys` binding 1 = 12 nodes. |
| 1511 `work.calc(8).add(slateKeys, keys)` | `retainedDevelopment` only | 8 units: two operand reads ≤ 4 nodes; `add` pays its own 8. |
| 1512 `work.calc(16).add(retainedClaims, keys + (row.shootingTask === null ? 0 : 1))` | `retainedDevelopment` only | 16 units: `retainedClaims` 1, `keys` 1, `+` 1, `row.shootingTask` 2, `=== null` 1, selection 1, literal 1 = 8 nodes; `add` pays 8. |
| 1514 `work.pay(4)` | `retainedDevelopment` only | `slateKeys - 1` operand pair and the local write (`add` pays itself; its argument tree is inside the calc(8) below). |
| 1515 `work.calc(8).add(d.external, slateKeys - 1)` | `retainedDevelopment` only | 8 units: `d.external` 2, `slateKeys` 1, `- 1` 1 = 4 nodes; `add` pays 8. |
| 1480 `work.calc(32).plus(40, 4 * calc(8).equality(19), 2 * calc(8).keyBill(1, 19), LITERAL.phaseRelease, 6)` | `retainedDevelopment` only | calc(32): literals 3, two products 2, `LITERAL.phaseRelease` 2 ≤ 16 nodes; `plus` pays 20 + 4 × 8; nested `calc(8).equality` (8 + 20) and `calc(8).keyBill` (8 + 64) pay themselves. Replaces the general `calc(64).plus(80, calc(8).times(8, text), …)` on this arm. |
| 1481 `singlePostExit ? 0 : work.calc(8).times(8, text)` | inside the general `calc(64).plus` | The selection (read/branch) sits in the calc(64) argument tree, which held ≈ 7 of its 32 nodes; on the Post exit the nested `calc(8).times` (18 units) is not executed. General/wrapOnly arms execute exactly the 505 sequence. |
| 1567 `smallTransitionBill(d, 1, 1, 0, work)` | `retainedDevelopment` only | Call nodes (callee 1, five arguments 5, invocation 1) are inside the pay(40) at 1560 ("selector/local and both five-argument transition-helper calls", 20 nodes; this arm uses binding 1 + three selections 6 + call 7 = 14). The helper pays its own 24 + calcs. Replaces `calc(32).times(1, transition)` (42 units) on this arm. |
| 1568–1569 `work.calc(16).add(small(1,0,1), small(0,0,0))` | `singlePostExit` only | calc(16) instead of the singleWrapSlot arm's calc(8): this arm has one more selection than that arm (binding 1 + four selections 8 + two calls 14 = 23 nodes against pay(40)'s 20), so the calc's 8-node allowance carries the excess. `add` pays 8; both helpers pay themselves. |
| 1572 `retainedDevelopment ? 1 : singlePostExit ? 2 : 3` | inside `calc(32).times` | Argument tree grows from 4 to 7 nodes, within the calc(32) allowance of 16. |
| 1573 two new arguments | all arms | Two argument reads, inside the pay(16) at 1571 ("both private flag argument/binding and allocation-selector groups", 8 nodes: three flag reads, the update selector and now two more reads = 8). |
| 1184–1185 `retainedDevelopment ? retainedClaims : …`, `? retainedOccupied : …` | selection on all arms | On the retained arm the nested `calc(8).times(4, rawOwners)` (18) and `calc(8).add(d.external, calc(8).times(3, other))` (36) are not executed. Every other arm executes the 505 sequence. |
| 1214–1216 retained `retention` | `retainedDevelopment` only | `calc(8).add(20, calc(64).plus(20, calc(8).times(2, text), calc(32).times(d.f, 2 + text), calc(8).keyBill(2, 19), keyConstruction, calc(8).keyBill(occupied, keyLength)))`: the same calculator sites as the general inner expression minus the outer `calc(32).times(2, …)` (42 units). |
| 1224 `wrapOnly || retainedDevelopment ? 1 : 2` | inside `calc(32).times` | Argument tree grows from 4 to 6 nodes, within 16. |
| 1316 `keyBill(d.external + (shooting ? 1 : 0), keyLength)` | single-early arm | Argument tree: `d.external` 2, `+` 1, `shooting` 1, selection 1, literals 2, `keyLength` 1 = 8 nodes, exactly the calc(16) allowance; `keyBill` pays 64. Same payment sequence as 505 on this arm. |
| 1359 `2 + capabilityText` | single-early arm | Same node count and payments as `2 + text`; only the value changes (590 → 410). |
| 2426 `work.calc(8).keyBill(0, keyLength)` | admission `occupied === 0` only | 8 + 64 units; two argument nodes. On the occupied > 0 arm `slotKey` is the existing `key` and no new calculator runs. |
| 2425–2426 selections, 2436 `examined`/`slotKey` reads | admission, all arms | Bindings 2, `occupied === 0` reads/compares/branches 6, `key` read 1 = 9 nodes, within the pay(64) at 2422 (32 nodes; 505 used ≈ 8 of them for the four bindings and `occupied + 1`). The `times`/`plus` at 2436 keep their 505 sites and, on occupied > 0, their values. |

Non-selected-arm note (disclosed, not hidden). The following selections execute on arms that
did NOT change and are not preceded by a new payment, because any new unconditional payment
would move those arms' measured `used` values: in `sweepBill` the `retainedDevelopment` test
at 1479 (2 nodes), `|| singlePostExit` at 1498 (2), the two locals at 1504 (4), the `if` at
1505 (2) and the `singlePostExit` test at 1568 (2; not on the singleWrapSlot arm); in
`allocationBill` the two parameter bindings (2) and the tests at 1184, 1185 and 1214 (2 each;
1214 not on the singleWrapSlot arm). That is 20 nodes (40 units) on the general arm and 16
nodes on the wrapOnly/singleWrapSlot arm (label 6). By hand count the general arm's
straight-line scalar nodes outside nested calculators and explicitly paid sub-blocks number
about 54 in `sweepBill` 1467–1590 and about 58 in `allocationBill` 1174–1225, against the
112-node bounds paid at 1467–1468 and 1174–1175 ("at most 96 scalar reads/operators" plus 16
"selection controls"). Both bounds keep their stated headroom after this change. The 518
reviewer should recount those two regions; if either bound is judged exceeded, the lawful
repair is a new unconditional `work.pay` at 1467 / 1174, which would shift every arm's
`used` by that constant and require re-measuring the unchanged frames.

The retained-Development, single-early, Post-exit and empty-admission arms' calculator
self-charges DO change (fewer or different nested calculator sites); those are selected
arms and are not predicted here beyond the bill values below.

## Predicted bill values (514 `Dimensions` record: n1 f5 capacity8 sets2 external0 d28 dp9 pCopy101 workflowCopy98 taskCopy66 bindingsCopy95 operationsCopy33 setCopy137 technologyCopy132 technologyRowCopy62 t0/1 adoptions0 placements0 genreRows1 genreId9 allSilent; commitments 0)

Derived terms: `text` = equality(28) = 57, `pid` = 19, `keyLength` = 54, `keyConstruction` =
106, equality(19) = 39, keyBill(1,19) = 59, keyBill(2,19) = 98, keyBill(0,54) = 55,
keyBill(1,54) = 164, keyBill(2,54) = 273, `LITERAL.phaseRelease` = 19, `update` = 68,
`orderBill` = 99, `sortBill(5,120)` = 2158, smallTransitionBill(1,1,0) = 470, (1,0,1) = 186,
(0,0,0) = 20, `transition` = 1486. Calibration: the 505 expressions reproduce the measured
315 / 11193 / 9587 / 8905 / 850 / 7948 / 576 and the analysts' 9234 exactly by the same hand
arithmetic (label 2: common 1218 + enter 9912 + policyLock 63; label 3: 806 + 7511 + 530 +
740; label 4: 806 + 6460 + 0 + 1639).

| Frame (label, branch.week, move) | 505 measured | 517 predicted | Components |
| --- | ---: | ---: | --- |
| 1 (0, new; restricted) | 315 | **315** | unchanged arm |
| 2 (1, 8→7 retained Development) | 11193 | **6861** | common 1218 + enter 5580 + policyLock 63; enter = releasePhase 339 + 65 + phaseTransitions 470 + update 68 + allocationBill 4194 + 98 + 95 + 101 + 150; allocationBill = occupancy 640 (raw 459: 40 + 2 + 2 + 114 + 301) + 18 + callback 235 + facilitySort 2158 + retention 708 (20 + 20 + 114 + 295 + 98 + 106 + 55) + walk 295 + 140 |
| 3 (2, 7→6 single-early) | 9587 | **8099** | common 806 + entries 6023 + releaseCopy 530 + success 740; entries = release 339 + allocation 5362 + 60 + 46 + 98 + 50 + 68; allocation = occupancy 213 + facilities 2381 + requirements 695 (30 + 177 + 410 + 78) + slotSearch 663 (3 × (5 + 106 + 110)) + composite 1147 + 80 + 78 + 50 + 26 + 29 |
| 4 (3, 6→5 single-early, shooting) | 8905 | **8398** | common 806 + entries 5953 + success 1639; entries = 339 + allocation 5292 + 60 + 46 + 98 + 50 + 68; allocation = occupancy 1131 + facilities 2381 + requirements 1028 (30 + 177 + 410 + 78 + 57 + 276) + slotSearch 439 (5 + 106 + 328) + 80 + 78 + 100 + 26 + 29 |
| 5 (4, 5→4 restricted) | 850 | **850** | unchanged arm |
| 6 (5, 4→3 wrapOnly / singleWrapSlot) | 7948 | **7948** | unchanged arm |
| 7 (6, 3→2 restricted) | 576 | **576** | unchanged arm |
| 8 (7, 2→1 single Post exit; unreached in 514) | 9234 (paper) | **5668** | common 1218 (2 visits) + enter 4387 + policyLock 63; enter = releasePhase 343 + 65 + phaseTransitions 206 + update 136 + allocationBill 3193 + 98 + 95 + 101 + 150 |
| rT1 (8, 1→0 restricted; unreached) | 708 (paper) | **708** | unchanged arm |
| Ready admission `initialAdmissionBill` (occupied 0) | 4579 (515-A) | **3913** | the slot term 896 (2 × 448) becomes 230 (1 × (14 + 106 + 55 + 55)); every other term unchanged. The 4579 total is 515-A's measurement, not recomputed here. |

Differences from the 516 expectations, stated plainly:

- Label 2: 6861, not ≈ 6946. The 85 is the adopted 339 release shape (516 addendum item 2)
  against the 424 variant the auditor's line-item estimate used (799 − 375). Every other
  component matches the auditor's figures (470, 640, 708, 295).
- Label 3: 8099, at the low end of ≈ 8100–8280 (occupiedKey −1308, walk width −180).
- Label 4: 8398, not ≈ 8578. The requirement-walk width at 1359 is one shared expression for
  both single-early frames, so the −180 lands at 6 as well as at 7; the auditor's label-4
  estimate counted only the occupiedKey terms (−218 slotSearch, −109 requirements = −327).
  The width is lawful at 6 (244 ≤ 410, table above). If the parent wants the 6 frame held at
  8578, the lawful edit is `shooting ? text : capabilityText` at 1359; it is not applied here.
- Labels 1, 5, 6, 7 and rT1 must re-measure exactly equal in bill AND in the `used` consumed
  by `sweepBill`, because no new payment executes on those arms.

First-take route (same fixture, labels 2, 3, 4 and the admission): producer work is expected
to fall by 4332 + 1488 + 507 + 666 = 6993 in bills plus the selected arms' calculator deltas.
This is a paper expectation, not a measurement. 276 first-take and the shared kernel
assertion (`≤ 200000`) can only move toward GREEN from lower work.

## What did not change, and limits

- No discovery change: `dimensions`, `commandDimensions`, `dimensionRecordFacts`,
  `staticDimensionFacts` and `LITERAL.dimensions` are byte-identical. No new `Dimensions`
  field. No deferred-cold or table-history side effect is implied.
- No owner, sweep order, refusal, provenance, drain, cap 200000, span 220, trace/path limit,
  validator, timeout or public API change. No new export, cast, cache or `Work` tariff change.
  `allocationBill`'s two new defaulted parameters are private.
- Every arm not named in 516 (general without the proofs, wrapOnly with or without
  `singleWrapSlot`, restricted, admission occupied > 0) keeps its bill expressions and its
  payment sequence; the only additions those arms execute are the unpaid selections listed
  above, which are disclosed for the reviewer.
- The optional slot 3→2 / composite 2→1 reduction and the paid `work.text(setId)` width are
  NOT implemented (516 item 5 default).
- The new walk is placed after the whole retained loop and behind `if (retainedDevelopment)`,
  not inside the loop as 516 item 3 offered; this is stricter than the offered placement (an
  in-loop read would also execute on general-arm slates whose first started picture is at 8).
  The walk reads every workflow, so no `4 * rawOwners` / `3 * other` fallback row remains.
- Runtime: exactly one `npm run typecheck` (exit 0). No vitest, no probe, no measurement. The
  values above are hand arithmetic from the new expressions, calibrated on the 514 record.
  No fit claim, no savings claim; the 302 stale route stays RED by expectation (515 §3, 516
  item 6) with its new boundary expected in the week-9 commit command or week-9 frame.
- Tests were read, not run, and not edited: `tests/p14b4-started-owner-replay.test.ts:259`
  (weeks = 2 single Post exit), `tests/p14b4-started-replay-retained-development.test.ts`
  (n = 2, both retained: walk counts 2 claims, other's union 1 key, so `occupied` = 1 and the
  bill covers both attempts), `tests/p14b4-ready-owner-replay.test.ts:231–236` (one started +
  one new picture: the walk counts both Development rows, claims 2, `occupied` = 1),
  `tests/p14b4-ready-replay-background.test.ts:161–178` (casting row → `occupied` ≥ 1, old
  admission bound), 276 first-take and 302 stale RED.

SOURCE FROZEN; write ownership yielded.

Next parent action: hash and pin `65cf1bf1a66c3cc91c819ac7f5402527ca677900002c90ca3e58d443f9ac697e`
(2796 lines) as the 517 candidate; dispatch the 518 independent actual-delta review against
this handback (including a recount of the two 112-node bounds); then the serial fixed-source
groups (507/508 baselines, the four pinned controls, 276 first-take with kernel, 302 stale
RED) and a 514-pattern passive re-measurement with exact restoration, requiring equality on
labels 1, 5, 6, 7 and rT1 and the predicted values 6861 / 8099 / 8398 / 5668 / 3913 on the
changed frames.
