# 579 — Parallel track: replay bill reductions C6 and C7 — design note (579-A) and review (579-B)

2026-09-21. Claude Code parent. Record 576's disposition named the replay reductions C6/C7 (then
C5, then C1; 515 §3, lawful as written) as the remaining bounded engineering while D1, D2 and
515 §6 stay with the Owner (578). A sim-core READ-ONLY design note (579-A) relocated the sites on
the current `src/core/promiseCapacityOwnerReplay.ts` (2797 lines, SHA256
`d5f8cb7171f602df76b2115819e7e63320b84b4f7e602fb5811ad57984b1eb22`), derived the reserved-step
accounting, found that NO test pins an absolute replay bill, re-derived C5 to ≈ 0.1–0.3k net and
dropped it, and asked three rulings of the reviewer (the 465 scope sentence vs 176 §4 for C7;
C7's disclosed bill-increase class for out-of-order facility arrays; the +4 selector charge for
C6). The contract-auditor reviewed READ-ONLY (579-B). Nothing in source changed; no cap, tariff,
refusal, deadline or test moved.

## 1. Adopted (parent decision after 579-B)

- **C6 adopted as designed** (579-A §3; 579-B Q1 KEEP): the two hold-close sites pay
  `18 + (row.fixed ? FIXED_HOLD_COPY : HOLD_COPY)` (61 / 79 = the exact `copyCost` price of the
  module-built six/seven-key hold; +4 for the flag read and selector, the module convention) in
  place of `14 + copyCost(hold)`; the discovery scan the code no longer performs is not a reserved
  step (176 §1 :34-35); the copy price is unchanged and still paid before the spread. Saving per
  close 153 (non-fixed) / 187 (fixed). `copyLiteral` never touches the caller-record `copyCost`
  sites (:677, :1321, :1671, :2606).
- **C7 adopted as designed** (579-A §3; 579-B Q2/Q3 KEEP conditional): `uniqueIds` routes through
  the existing `sortedOutput` (paid linear `less` walk; the real sorter runs, fully paid, on any
  inversion; the charged adjacent `equal` walk unchanged). The three conditions are met by this
  record:
  1. Record 465's sentence "Keep existing sorted and EVERY input canonicalization call
     unchanged" (465 :12) was that slice's scope, not a 176 clause (465 :9-16 "Exact scope";
     466 :26-30/:86-87 the writer's compliance statement). 176 §4 :159-165 requires the real
     sorter for INDEX builds used by joins and a charged adjacent walk for duplicates;
     `uniqueIds` builds no index (every lookup is the linear `find` :423-430). The `sortedOutput`
     caller set becomes FIVE (466 :86-87 "exactly four" is historical from this record), and the
     465 :59-63 private precondition (internally constructed dense plain arrays; pure
     projections) extends to :655/:662/:663 (validated engine JSON arrays, 176 §1 :53-58) and
     :1978 (owner-built dense array); the projections `row => row.id`, `row => row.productionId`,
     `id => id` are pure.
  2. **Amendment of record 576's disposition wording** ("bills byte-identical or lower, every
     pin unchanged"): C7 LOWERS every bill on founding-order facility arrays (−2275 at prepare
     for the five founding facilities; −37 / −2 at the n = 1 / n = 0 sites) and RAISES the bill
     for an out-of-order array by the walk prefix up to the first inversion (≤ ~600 for f = 6),
     the class records 465/466 already accepted for the four output arrays ("an inversion pays
     the entire unchanged sort"; 176 §4 :182 "charged when performed"). No existing fixture,
     test or evidence route has an out-of-order facility array (579-B Q3: 15 replay-consuming
     test files, four fixture families, the V13 e2e save; all founding order). The 576 text is
     preserved; this paragraph governs.
  3. Annex-lot observation: once a lot carries `facility-development-casting-annex` (operations
     :121-126; sorts before `facility-post-building`), every replay call pays ≈ +543 on top of the
     unchanged sort; C7 is a founding-lot saving, not a universal reduction. Recorded so nobody
     reads it otherwise.
- **C5 dropped as scoped** (579-A §3; 579-B Q4 KEEP): only the general `releasePhase` arm, three
  of the four arrival-guard compares and the `wrapOnly` requirement walk are static-domain
  reductions; the wear and retention walks compare input ids bounded only by the discovered
  width (a discovery change, outside C5); honest net ≈ 0.1–0.3k. Static widths as module-init
  constants fold into C1 if C1 is ever taken.
- **Pins**: no test or bridge file pins an absolute replay bill (579-A §4; 579-B Q5: 129 lines
  read, all cap/relative/own-tariff); the adapter RED 8's required CUT of the Ready plan on
  `world().opened` cannot flip (the admission pairs term alone ≥ 815850, saturating).
- **One writer release, C6 + C7, two commits inside it** (C6 first, then C7) so a residual in
  the re-measurement can be bisected. Writable in `src/core/promiseCapacityOwnerReplay.ts` ONLY:
  (i) the `copyLiteral` / `HOLD_COPY` / `FIXED_HOLD_COPY` insertion between :242 and :243;
  (ii) :1630; (iii) :1656; (iv) :432; (v) the word "four" in the doc at :390. NOT writable:
  `Work` :245-345 (incl. `copyCost` :320-328, `less` :318), `LITERAL` :143-242 (incl.
  `literalCost`), `sorted`/`sortBill`/`sortedOutput` bodies, `find` :423-430, the four
  `uniqueIds` call sites :655/:662/:663/:1978, the :1979 second sort (deferred), every bill
  function :1093-1584, `drainEvents`/`reconcile`, the four existing `sortedOutput` callers,
  `boundedStableSort.ts`, tests, kernel, owners, enumerator, caps/limits/refusals, docs.
- **Re-measurement law** (579-B Q6): close counts are derived from each run's outputs (fixed
  closes = `fixedHoldReplacements.length`; non-fixed closes = `additionalHolds` closed before the
  prepared end), C7 = 2349 at prepare on founding order + 2 per frame with zero admitted
  releases + 37 per frame with one; expected delta = C7 + 153 × nonFixed + 187 × fixed; any
  residual is a finding, never adjusted away. Prepare-only rows isolate C7.

## 2. Adopted RED brief (test-author, record 580; ONE new file `tests/p14b4-replay-bill-reductions.test.ts`; builders copied, not imported)

1. **C7 RED→GREEN witness (facility order).** Started producer, horizon now+1, on a state whose
   reservations sit at facility index ≥ 2 (the 558 RED's `world().unscheduled` copy: shooting
   stage/scenery; or `started-owner-replay :66-91`), versus the same source with
   `operations.facilities[0]` and `[1]` swapped. Assert: every result field except
   `preparationWork` equal, with `projection.operations.facilities` compared NORMALISED (sorted
   by id, or asserted equal to the swapped input and then excluded), since the projection carries
   the source array; and `swapped.preparationWork > original.preparationWork` (equal today →
   RED; after C7 the swapped source pays the walk prefix plus the full sort → GREEN). The
   unchanged-source baseline must PRINT both bills and confirm equality; if they differ, case 1
   is not a witness and the test-author reports rather than adjusts.
2. **C7 protection (GREEN both sides):** an in-order and an out-of-order duplicate id each
   throw `Started owner replay: duplicate consumed identity`, for facilities, activeProductions
   and workflows.
3. **C6 protection (GREEN both sides; the fixed-schema key-set invariant):** for every complete
   attempt, `Object.keys` of every `trace.additionalHolds[i]` is exactly
   `['holdId','ownerKey','ownerPathKey','subject','from','until']` in that order; every
   `result.fixedHolds[i]` exactly the seven keys with `replaceableFrom` last; every
   `fixedHoldReplacements[i]` exactly `['holdId','newUntil']`; on a route with at least one fixed
   close (the 2-week wrap on `world().ready`) and one non-fixed close (a Ready admission +
   release, or the 302 prefix).
4. **No vitest literal for the C6/C7 deltas** (176 §8 item 4: a hand-derived 153/187 would be
   private-tariff self-equality); the parent's re-measurement rows carry the numbers.
5. **Unchanged-source baseline** of the new file under `record-check.mjs` BEFORE the writer
   (504 pattern), exit 1 on case 1 only.

## 3. Serial fixed-source checks after the writer (mirror 574; parent, one process at a time)

New RED file (case 1 RED→GREEN, cases 2–3 GREEN both sides); Ready 17 PASS + the sole stale FAIL
at `stale-target:234` with the same `'workLimit'` message; Started 28; adapter RED 33; enumerator
RED 45; kernel 41 / hold-order 5 / stable-sort 7 / sort-owners 7; facts 7; root+UI typecheck;
adjacent 203; bridge tsc with the sole OLD TS2353; live-P2 110/83 byte-identical to 549/570;
B1/B2/B3 + bridge consumers 133 PASS / 1 designated FAIL / 2 todo; bridge-p14b2-trust 22;
historical saves 137; then the passive re-measurements (538 scenario 1 and prepare-only; the 576
run-3 set; the 514 stale and first-take routes) with output-derived close counts; freeze/hash;
independent actual-delta review; checkpoint; headers; publication with exact-remote verification.

## 4. Verbatim specialist reports

### 579-A — sim-core READ-ONLY design note

As returned, unedited (embedded raw because the note carries its own code fences, as in record
558 §3).

# 579-A — READ-ONLY design note: replay bill reductions C6 and C7 (C5 scoped)

**Status: DONE (design note only).** No worktree file created or modified; no vitest/tsc/npm; no Git state change; no network; no delegation. One scratch copy (header only) at `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/579-A-design-note.md`; this hand-back is the note.

**Model observed:** the harness reports Fable 5.1 (`claude-fable-5-1`). The lean-ctx MCP tools named in the user CLAUDE.md are not exposed in this session; Read/Bash (read-only: `sed -n`, `grep`, `git rev-parse/status/log/show`, `shasum`, `wc`) and Write (scratchpad only) were used.

## 1. Identity

- Worktree `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`.
- HEAD at my first check `bb6bcb31e69007989729a41623975d0d367b1bdb` (record 576), `git status --short` empty. During my reads the parent published record 578: HEAD at my last check `19bc70e0a6acaa039882e92511b53290d4fbaa3f` ("Record 578: Owner / Current Ops decision packet…", one file `578-owner-decision-packet.md` +118), tree clean. Docs-only; the source identity below is unchanged across both HEADs.
- `src/core/promiseCapacityOwnerReplay.ts`: **2797 lines**, SHA256 **`d5f8cb7171f602df76b2115819e7e63320b84b4f7e602fb5811ad57984b1eb22`** (`shasum -a 256`, computed before and after the HEAD move).
- 515-A's line numbers (2740-line file, SHA `5d4851…`) are stale by about +57 from ~line 1200 on (C2+C3+C4 landed at `69d16f8`, "Exact pre-call bills … (517+526)"); every site below is re-located on the current file. `git log 9ed6e35..HEAD` confirms C2+C3+C4 (516/517/518-526 chain) landed; C1/C5–C7 have not.

## 2. Site relocation (source facts, quoted)

### C6 — `copyCost` on module-owned hold records

Tariff helper `copyCost`, `:320-328`:
```ts
  copyCost(value: object): number {
    let cost = 1
    this.pay()
    for (const key in value) {
      this.pay(3 + key.length)
      if (Object.prototype.hasOwnProperty.call(value, key)) cost = this.calc(8).add(cost, 3 + key.length)
    }
    return cost
  }
```
Literal convention `:143-147` (comment), constructor `:148-152`, the two hold schemas `:161-162`:
```ts
 * Fixed SOURCE schemas, not caller records. Compute their exact literal costs
 * once at module initialization; no input-dependent discovery/caching occurs.
 * Each use below pays the number BEFORE constructing that record. ...
function literalCost(...keys: readonly string[]): number { let result = 1; for (const key of keys) result += 1 + key.length; return result }
  hold: literalCost('holdId', 'ownerKey', 'ownerPathKey', 'subject', 'from', 'until'),
  fixedHold: literalCost('holdId', 'ownerKey', 'ownerPathKey', 'subject', 'from', 'until', 'replaceableFrom'),
```
Site A `closeHold` `:1617-1636`, charge at `:1630-1632`:
```ts
  invariant(found !== undefined, 'owner released a subject it does not hold')
  work.pay(14 + work.copyCost(found.hold))
  found.hold = { ...found.hold, until: at }
  found.closed = true
```
Site B `closePath` `:1650-1662`, charge at `:1656-1657`:
```ts
    work.pay(14 + work.copyCost(row.hold))
    row.hold = { ...row.hold, until: at }; row.closed = true
```
Where every ledger `hold` comes from (the key-set invariant):
- Non-fixed rows: `addHold` `:1644-1648` — module literal with exactly the six `LITERAL.hold` keys:
```ts
  work.pay(12 + LITERAL.ledgerRow + LITERAL.hold + APPEND)
  branch.ledger.push({ fixed: false, closed: false, path, subject, hold: {
    holdId: work.token('grant', plan.traceKey, branch.nextHold++, issuer), ownerKey: issuer,
    ownerPathKey: path.key, subject: subject.value, from: at, until: end,
  } })
```
- Fixed rows: prepare's `hold()` closure `:748-759` builds `const entry: FixedHold = { holdId: work.token('fixed', path.key, fixed.length), ownerKey: issuer, ownerPathKey: path.key, subject: value, from: now, until: end, replaceableFrom: now }` after `work.pay(18 + 15 + LITERAL.fixedHold + LITERAL.fixedIdentity + 2 * APPEND)` (`:751`); they enter the ledger at `:2725-2727`: `ledger: prepared.fixed.map((hold, index) => { … return { hold, fixed: true, closed: false, path: identity.path, subject: identity.subject } })`.
- The only other writes to a row's `hold` are the two spreads `:1631` and `:1657` (`{ ...hold, until: at }`), which preserve key set and order. `grep -n "ledger.push\|\.hold = \|ledger: "` → exactly `:1631, :1645, :1657, :2725`. `fixed:` is written only at `:1645` (`false`) and `:2727` (`true`). No caller record ever enters `branch.ledger`; `fixedHolds` is a RESULT field (`:103/:114/:2775`), not an input.
- Kernel types agree: `promiseCapacityKernel.ts :16-20` `Hold = DeepReadonly<{ holdId; ownerKey; ownerPathKey; subject; from; until }>`, `FixedHold = Hold & { replaceableFrom }`.
- Call sites reaching A/B: `drainEvents` `:1698` and `:1705` (`closeHold` on `reservationReleased` and the wrapped-Set witness), `frame` `:1892` (`closePath`, background completion, `peopleOnly=false`), release aftermath `:1986` (`closePath`, `peopleOnly=true`), and the Ready path via `admitReady` → `drainEvents` (`:2634`).
- Governing 176 clauses: §1 `:25-29` (units = named blocks, copies, "discovered/copied shallow properties"; a block may not hide an uncharged walk/callback/string op/spread), §1 `:34-35` ("Reserve each cost-calculator scan/arithmetic step before doing it too"), §1 `:53-64` (discovery is for CALLER records with generic P fields: "Replay does not discard extra fields: it discovers and bills every enumerable own string key…"), §2 `:68-70` ("measured shallow `copy(record)`… `literal(keys)` = `1+sum(write(k))`"), §4 `:182-183` ("Every sorting/copy/index lookup cost above is charged when performed"). The source's LITERAL block is the accepted implementation of "fixed schema, computed once".

### C7 — `uniqueIds` adjacent-duplicate walk

`:431-437`:
```ts
function uniqueIds<T>(rows: readonly T[], keyOf: (row: T) => string, work: Work): void {
  const ordered = sorted(rows, keyOf, work)
  for (let i = 1; i < ordered.length; i++) {
    work.pay(3)
    invariant(!work.equal(keyOf(ordered[i - 1]!), keyOf(ordered[i]!)), 'duplicate consumed identity')
  }
}
```
Callers: `:655 uniqueIds(source.operations.facilities, row => row.id, work)`, `:662 uniqueIds(source.studio.activeProductions, row => row.id, work)`, `:663 uniqueIds(source.operations.workflows, row => row.productionId, work)`, `:1978 uniqueIds(advanced.admittedReleaseIds, id => id, work)` (every frame's release aftermath; `:1979` then sorts the same array again with `sorted`).
`sorted` `:373-390`: pays 4; per row `6 + LITERAL.decoration(11) + APPEND(3)` + `text(key)`; 8; `sortBill(n, 6 + 2·(1+2·max))` (self-charges AND returned value paid); `2 + 3n`; comparator `(a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0` (`:387`). `sortBill` `:357-372`.
Existing pattern `sortedOutput` `:390-422`; doc `:390-391` "Only the four dense output arrays with pure key projections use this path. An inversion pays the entire unchanged sort; every return is a fresh array."; body: 16; `count < 2` → 12 + `values.slice()`; else 24, per index `10 (+ 20, keyOf, 12, work.less(current, previous), 10)`, on inversion `12` + `sorted(values, keyOf, work)`; on completion pays `calc(16).add(10, calc(8).times(2, count))` then `values.slice()`. `less` `:318` pays `1 + a.length + b.length`, returns `a < b`. Current callers: `:1805-1807` (`paths`, `fixedHoldReplacements`, `additionalHolds`) and `:2753` (`completedBackgroundPathKeys`) — the four adopted by records 465/466.
Governing 176 clauses: §4 `:159-165` ("Build local sorted indexes for exact ID joins, using the REAL shared sorter… Duplicate keys are checked by a charged adjacent walk"), §4 `:182`, §1 `:34`. Record 465 `:10-16` adopted `sortedOutput` with the slice text "Keep existing sorted and EVERY input canonicalization call unchanged… replacing ONLY four same-signature calls"; 466 `:86-87` "exactly four sortedOutput callers" — see §7 item 1.

### C5 — static-domain widths (current lines, operand proofs)

`text = work.calc(8).equality(d.d)` at `:1471` (sweepBill) and `:1186` (allocationBill). `d.d` is the DISCOVERED maximum over every consumed string: `staticDimensionFacts` `:933-976` starts `width = 22` and folds `dimensionStrings(row)` (every own string field: id, name, capability) over facilities, adoptions, access, equipment, structure `providesFacilityIds`, placements; `dimensions` `:978-1041` folds production id/directorId, workflow/bindings/reservation/task/setup strings, Set rows and technology rows. So `d.d` already bounds capabilities, phases, statuses, set ids and task ids (28 on the 515 fixture = `facility-development-casting`).

| Term | Current code | Owner compares actually performed | Operand domain | Static? |
| --- | --- | --- | --- | --- |
| (a) releasePhase general arm | `:1482` `work.calc(64).plus(80, singlePostExit ? 0 : work.calc(8).times(8, text), d.workflowCopy, d.bindingsCopy, 70)` | `releaseCompletedPhase` operations.ts `:1247-1285`: `retainedCapabilitiesFor` filter (productionPhases.ts `:156-163`, ≤2×2 table compares), per reservation (≤2, comment `:1472`) `retained.includes(reservation.capability)` + `claimed.has`, `kept.some(r => r.capability === 'soundstage')` ≤2 | all `FacilityCapability` (types.ts `:592-597`; max `'development-casting'` = 19; the phase table productionPhases.ts `:52-60` is a source constant; `reservation.capability` is validated into the union by save.ts `asCapability` `:2544-2550` and `:2842-2848` (must equal its facility's capability) and re-checked by the replay at `:527`) | YES, width 19 (accepted precedent `capabilityText = work.calc(8).equality(19)` `:1309`; retained arm `:1481`) |
| (b) wear | `:1484` `work.calc(64).plus(24, work.calc(32).times(d.sets, 5 + 2 * text), d.setCopy, 18)` | sets.ts `:687-700` `sets.some(set => set.id === id)` then `sets.map(set => set.id === id ? {…} : set)` | set ids (`set.id` vs `bindings.setId`): input strings, bounded only by discovered `d.d`; not a source constant | NO (needs a new discovered width = new `Dimensions` key = `LITERAL.dimensions` change = discovery change) |
| (c) arrival guards | `:1119` `common = work.calc(32).add(18, work.calc(32).times(d.n, 14 + work.calc(32).times(4, work.calc(8).equality(d.d))))` | operations.ts `:768-774` per workflow: `phase !== 'shooting'`, `task.status !== 'blocked'`, `blocker?.kind !== 'scenery-load-in'`, `blocker.taskId !== task.id` | phase ∈ `ProductionPhase` (max 14; `phaseText` precedent `:1309`), status ∈ `ShootingTaskStatus` (types.ts `:622`, max 10), kind ∈ blocker union (types.ts `:633/:638/:648`, max 17), taskId = input id ≤ `d.d` | 3 of 4 YES, 1 NO |
| (d1) retention walks | `:1215/:1217` `work.calc(32).times(d.f, 2 + text)` | operations.ts `:383` `facilities.some(facility => facility.id === retained.facilityId)` | facility ids ≤ `d.d` | NO |
| (d2) fresh requirement walks | `:1224` `work.calc(32).times(wrapOnly \|\| retainedDevelopment ? 1 : 2, work.calc(32).times(d.f, 2 + text))` | operations.ts `:395-397` `facility.capability !== capability`; for matching facilities `capability === 'soundstage' && boundSet !== null && facility.id !== boundSet.mountedOn` | capability compares ≤ 19, but the matching-facility id compare is ≤ `d.d` whenever a Set is bound (rehearsal/shooting targets) | only where the target is provably not stage-binding (the `wrapOnly` arm: Post target, `needsSet` false) |

## 3. Per-reduction design

### C6 (recommended)

Hunk (insert between `:242` `})` and `:243` `// An appended element…`; two one-line edits):
```ts
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
-  work.pay(14 + work.copyCost(found.hold))                        // :1630
+  work.pay(18 + (found.fixed ? FIXED_HOLD_COPY : HOLD_COPY)) // 14 as before + 4: fixed-flag read and price selector
-    work.pay(14 + work.copyCost(row.hold))                        // :1656
+    work.pay(18 + (row.fixed ? FIXED_HOLD_COPY : HOLD_COPY))
```
Reserved-step accounting per close (paper, exact from `:320-328`):
- BEFORE, non-fixed (6 keys, Σ|key| = 42): `copyCost` self-charges `1 + Σ(3+|k|) + 6×(calc 8 + add 8)` = 1 + 60 + 96 = **157**, returns 61; `pay(14 + 61)` = 75; total **232**. Fixed (7 keys, Σ|key| = 57): 1 + 78 + 112 = **191**, returns 79; `pay(14 + 79)` = 93; total **284**. (Matches 515-A's "157 exec → 61".)
- AFTER: `pay(18 + 61)` = **79** / `pay(18 + 79)` = **97**. The copy PRICE (61/79 = 176 §2 `copy(record)` for that schema) is unchanged and still paid before the spread; what is gone is the calculator's own for-in discovery scan, a step the new code does not perform (176 §1 `:34`: calculator steps are reserved "before doing it"; a scan not done is not reserved). Nothing is priced lower.
- Saving per close: **153** non-fixed / **187** fixed. If the auditor rules the selector sits inside the existing 14-block (a straight-line scalar step, not a walk/callback/string op/spread, §1 `:28-29`), the saving is 157/191. I recommend +4: every qualified slice in this module paid explicitly for added flag reads/selectors (`:1174 // added Post-exit flag reads, selectors and control`, `:1497`, `:1571`, `:1576`).
- Route paper (closes counted from the owners; 515 labels): 302 stale route = 10 non-fixed closes (w3 Development release 1; w6 wrap stage+scenery+Set 3; w8 Post exit 1; w9 release `closePath` 5 person holds; the 2 mount holds are visited, not closed) → **−1530** (515-A "≈1.5k"). 538 scenario 1 (horizon 62): frame 61 wrap closes stage, scenery, Set, all FIXED → **−561**. 576 windows: now+2/+3/+4 → −561 per plan; now+5 adds the Post exit (non-fixed, −153) and, if the release lands inside the window, 5 fixed person closes (−935) → up to **−1649** per plan. 276 first-take: closes per its route (parent measures).
- Invariants: (i) the key set of every ledger `hold` is exactly `LITERAL.hold`/`LITERAL.fixedHold` (constructors `:1645-1648`, `:754-755`; only spreads afterwards; no caller record enters the ledger — §2); (ii) `row.fixed` is written once at construction (`:1645`, `:2727`); (iii) `HOLD_COPY === 61 === copyCost(anyLedgerHold)`, `FIXED_HOLD_COPY === 79`, by `:320-328` construction; the RED pins the key lists (§6). `copyLiteral` must NOT touch `:677` (`production`, caller P), `:1321` (`reservation`, caller record), `:1671` (`draft`, owner-returned), `:2606` (Ready `scriptDevelopment`/`project`): those stay discovery under 176 §1 `:53-64`.

### C7 (recommended)

Hunk:
```ts
-/** Only the four dense output arrays with pure key projections use this path.
+/** The four dense output arrays and the duplicate-identity check use this path.
  * An inversion pays the entire unchanged sort; every return is a fresh array. */
 function sortedOutput<T>(
 ...
 function uniqueIds<T>(rows: readonly T[], keyOf: (row: T) => string, work: Work): void {
-  const ordered = sorted(rows, keyOf, work)
+  const ordered = sortedOutput(rows, keyOf, work)
```
Reserved-step accounting (paper, exact from `:357-422`):
- BEFORE, n = 5 founding facilities (key lengths 28/22/21/22/22, Σ 115, max 28, comparator 6 + 2·57 = 120): `sorted` = 4 + 5×20 + (5 + 115) + 8 + `sortBill` self-charges 372 + `sortBill` value **2158** (= 10 + 3·5 + 8·3 + 19·6 + 133·15; equals the 515-A measured "sortBill(5,120)") + 17 = **2779**. n = 1 (`prod-0052`): 4 + 20 + 10 + 8 + 10 + 8 + 5 = **65**. n = 0: **30**.
- AFTER (input already in key order): `sortedOutput` n = 5 = 16 + 24 + 4×52 + adjacent `less` spans (51 + 44 + 44 + 45 = 184) + 10 + (16 + 8 + 10 + 8 + 20) = **504**; n = 1 → 16 + 12 = **28**; n = 0 → **28**. The adjacent `equal` walk `:433-436` is unchanged either way (196 for the 5 facilities).
- Removed steps: the decoration rows, `sortBill`'s calculator and the reserved merge-sort bound for a sort that is not run; the real sorter still runs and is fully paid on any inversion. Added performed step: the paid `less` walk. Per-site deltas: facilities **−2275**, activeProductions (n = 1) **−37**, workflows (n = 1) **−37**, admittedReleaseIds per frame **−2** (n = 0) / **−37** (n = 1). Route paper: prepare **−2349** on every route (538 prepare-only 32043 → ≈29694); 302 stale route ≈ −2349 − 8×2 − 37 = **−2402**; 538 scenario 1 ≈ −2353 (108265 → ≈105912 with C7 alone, ≈**105351** with C6); 576 single plans −2353 … −2388 before C6.
- Combined C6+C7 on the 302 stale route ≈ **−3.9k**: the cut moves later than its current position (199994 inside the w8 `sweepBill`, 514 table) but the route stays RED by ≈28k (515 §1 gap ≈32k − 3.9k); `stale-target.test.ts:234` keeps failing with `'workLimit'`, as 515 §6 requires.
- Invariants: (i) `less(a, b)` = `a < b` and the `sorted` comparator uses the same `<`/`>` on the same `keyOf` strings (`:387`): one total order (UTF-16 code units); for a non-decreasing input the stable sort (`boundedStableSort`, record 168, p14b4-bounded-stable-sort) is the identity, so `values.slice()` and `sorted(values)` hold the same references in the same order and the `equal` walk sees identical adjacent pairs; (ii) refusal semantics identical: a non-adjacent duplicate forces an inversion (a ≤ b ≤ c with a = c gives a = b = c), so it takes the full-sort path and is caught adjacent as today; an adjacent duplicate passes `less` (equal is not less) and is caught by the unchanged `equal` walk; (iii) unordered input pays the walk prefix up to the first inversion PLUS the entire unchanged `sorted`: a bill increase bounded by 16 + 24 + (i−1)·52 + Σ spans + 12 for inversion index i (≤ ~600 for f = 6 with 28-char ids).

### C5 — NOT recommended for this release (paper, proofs in §2)

Only (a), three of the four (c) compares, and (d2) in the `wrapOnly` arm are static-domain reductions lawful as written. (b) and (d1) are not: their operands are input ids bounded only by the discovered `d.d`; a tighter bound needs a new discovered width, i.e. a new `Dimensions` key and a `LITERAL.dimensions` change (a discovery change; outside C5 and this note). Re-derived savings (d = 28, f = 5, n = 1): (a) 8×(57−39) = **144**, only where the general `releasePhase` arm is selected (label 6 on the stale route; frame 61 on 538/576); (d2 wrapOnly) 5×18 = **90** at the same frame; (c) `equality(14) + 2·equality(17) + equality(d)` for `4·equality(d)` saves 72 per workflow per call but adds two calculator calls (+56 self-charges) → ≈ **16** per call at n = 1. Each new `work.calc(8).equality(19)` binding also adds 28 self-charges on every `sweepBill` call that reaches it (labels 2, 6, 8 on the stale route), so (a) nets ≈ 144 − 84 = 60. Honest total: **≈0.2–0.4k gross, ≈0.1–0.3k net** on the measured routes, versus 515-A's "≈2–2.5k", which counted (b) and the walks. Recommendation: drop C5 as scoped. If static widths are ever wanted, fold "static-domain widths as module-init constants" into the C1 calculator-structure item, where the per-call calculator charges are the subject.

## 4. Pins that move

Grep evidence: `preparationWork|workUsed|ownWork|expectedWork|\.bill\b|toBe([0-9]{4,})` over `tests/` and `bridge/`; `108265|32043|182925|145876|199994|2158` over `tests/`.
- **No test pins an absolute replay bill.** Every `preparationWork`/`workUsed` assertion is (i) the cap: `toBe(200000)` / `toBeLessThanOrEqual(200000)` (`p14b4-started-owner-replay :174/:406/:548`, `p14b4-ready-owner-replay :149/:321/:718`, `p14b4-owner-adapter-first-slice :259/:564/:575`, `p14b4-owner-enumerator-slice :444/:518/:581`, `p14b4-ready-replay-first-take :210/:327`, `stale-target :230`, background/casting/director/scenery/retained-development/identity/command files likewise); (ii) relative: `started-owner-replay :391-392` (opaque-field equality), `:558` `toBe(work)` for tiny limits, `:592/:614` `toBe(edge.low)` from the bounded binary search `threshold` `:571-585` (176 §8 item 4), `:621` `zeroPrior + 17`; `ready-owner-replay :654/:759`; `replay-record-facts :182-183/:204/:214`; `enumerator-slice :443/:734-735` `reference(...).preparationWork + domain.work`; `adapter-first-slice :575` `200000 + claims.work`; or (iii) the adapter/enumerator's OWN tariff formulas (`expectedWork` adapter `:226`, `expectedEnumeratorWork` enumerator `:701`), which never read the replay. `bridge/` has no consumer of `preparationWork`/`workUsed` (grep empty). `p14b4-started-replay-scenery-commands.test.ts:64 toBe(230339)` is a fixture byte length. Enumerator RED `:18` mentions "108265/4225 (inequalities only)" in a comment.
- Moves without a pinned literal: every `preparationWork` value (prepare −2349 on all routes, plus C6 per close); the binary-searched `edge.low/high` (`started-owner-replay :587-624`, re-derived each run); the 302 cut position (later; still a `workLimit` cut, so `:234` stays RED with the same message); the enumerator/adapter relative sums hold by construction.
- Evidence rows that become stale (records, not test pins): 538 scenario-1 `producerWork 108265`, prepare-only 32043, kernel totals 112490–112722; 576 single-plan 112098/127529/164652/178454 and k-sets 145876/172492/174246/168952/193546/196248; the 514 stale/first-take frame tables. No pin needs hand-adjusting; any literal receipt in the checkpoint must come from the re-measurement rows (derive pins from receipts).

## 5. Controls

- Behaviour neutrality (traces, holds, ledgers, refusals, provenance byte-identical; only bills move): Started 28 (`p14b4-started-owner-replay` incl. sweep-boundary and plan-permutation cases; background-command, casting, director, scenery-commands, retained-development), Ready 17 + the designated stale FAIL (`ready-owner-replay`, first-take, identity, command, background, stale-target), facts 7 (`replay-record-facts`), adapter RED 33 and enumerator RED 45 (E2/E8 pin trace/hold byte-equality and the relative bill sums through the Started producer), kernel 41 / hold-order 5 / joint-trace groups (consume `fixedHolds`/traces), stable-sort 7 and sort-owners 7 (C7's order/comparator), bridge-p14b2-trust 22, live-P2 groups byte-identical to 549/570, historical saves 137. Duplicate-identity refusal: the existing 'duplicate consumed identity' cases plus the RED's in-order/out-of-order pair (§6).
- Measured rows to re-run (514 pattern, passive, exact restoration): 538 scenario 1 (expect ≈ 108265 − 2353 − 561 = **≈105351**, prepare-only **≈29694**); the 576 run-3 set on `world().unscheduled` (expect ≈ −2914 per plan at now+2..+4, ≈ −4.0k at now+5 if the release lands inside the window; the joint discount unchanged); the 302 stale route (514 stale patch: cut ≈ 3.9k later than 199994-at-w8; still RED); the 276 first-take route (514 firsttake patch: −2349 prepare − C6 closes on its route). Each delta must equal closes×153/187 + the C7 site deltas; any residual is a finding.

## 6. Recommended slice order and writer scope

- ONE writer release: **C6 + C7 together** (five small hunks, one file, independent by construction). C5 excluded (§3). C1/C8/C9/C10 untouched.
- Writable in `src/core/promiseCapacityOwnerReplay.ts` only: (i) insert `copyLiteral` + `HOLD_COPY` + `FIXED_HOLD_COPY` between `:242` and `:243`; (ii) `:1630`; (iii) `:1656`; (iv) `:432`; (v) doc `:390` (the word "four"). NOT writable: `Work` `:245-345` incl. `copyCost` `:320-328`, `LITERAL` `:148-242`, the bodies of `sorted`/`sortBill`/`sortedOutput`, every bill function `:1093-1584`, `drainEvents`/`reconcile`, the four existing `sortedOutput` callers, tests, kernel, owners, enumerator/adapter, caps/limits/refusals.
- RED brief (test-author; ONE new file, e.g. `tests/p14b4-replay-bill-reductions.test.ts`; builders copied, not imported):
  1. C7 RED→GREEN (facility order): Started producer, horizon now+1 (no grants/releases, so no `find` over facilities changes cost), on a real started fixture (the 538/576 `world()` copy or `operationsStudio('p13a-production-consumer')` as in `started-owner-replay :70`), versus the same source with `operations.facilities[0]` and `[1]` swapped (`facility-development-casting` ↔ `facility-post-building`: both are visited by every prepare-time `find` that reaches index ≥ 2 either way, so today the bills are equal). Assert results deep-equal after deleting `preparationWork` from both, AND `swapped.preparationWork > original.preparationWork` (today equal → RED; after C7 the swapped source pays the walk prefix 145 + the full sort 2779 against 504 → GREEN). Allocation is order-independent (`allocateForPhase` sorts by id, operations.ts `:294-299`). A full-reversal variant may assert the equality-minus-bill only (its `find` costs differ today). If identity keys turn out to depend on facility discovery order, compare holds/provenance structurally and report; do not weaken.
  2. C7 protection (GREEN before/after): an in-order duplicate id and an out-of-order duplicate both throw `Started owner replay: duplicate consumed identity` (`invariant` `:436`), for facilities, activeProductions and workflows.
  3. C6 protection (GREEN before/after; the fixed-schema key-set invariant): for every complete attempt, `Object.keys` of every `trace.additionalHolds[i]` is exactly `['holdId','ownerKey','ownerPathKey','subject','from','until']` in that order; every `result.fixedHolds[i]` exactly the seven keys with `replaceableFrom` last; every `fixedHoldReplacements[i]` exactly `['holdId','newUntil']`; include a route with at least one fixed close (the 538 2-week wrap) and one non-fixed close (a Ready admission + release, or the 302 prefix).
  4. C6 bill movement: no vitest literal (a hand-derived 153/187 would be private-tariff self-equality, 176 §8 item 4); verified by the parent's §5 re-measurement rows against the paper deltas.
  5. Unchanged-source baseline of the new file under `record-check.mjs` BEFORE the writer (504 pattern).
- Serial fixed-source checks after the writer (mirror 555 §3 / 574 `:44-49`): new RED file GREEN (case 1 RED→GREEN, cases 2–3 GREEN both sides); Ready 17 PASS + sole stale FAIL at `stale-target:234` with the same `'workLimit'` message; Started 28; adapter first-slice RED 33; enumerator RED 45; kernel 41, hold-order 5, stable-sort 7, sort-owners 7; facts 7; material 17; root+UI typecheck; adjacent 203; bridge tsc with the sole OLD TS2353; live-P2 110/83 byte-identical to 549/570; B1/B2/B3 + bridge consumers 133 PASS / 1 designated FAIL (trust-chooser test 6) / 2 todo; bridge-p14b2-trust 22; historical saves 137; then the §5 passive re-measurements; freeze/hash; independent actual-delta review; checkpoint; shared headers; publication with exact-remote verification.

## 7. Risks and open questions

1. **C7 vs record 465's scope text (the one legal question).** 465 `:11-13`: "Keep existing sorted and EVERY input canonicalization call unchanged… replacing ONLY four same-signature calls"; 466 `:86-87` confirmed exactly four callers. `uniqueIds` at `:655/:662/:663` IS input canonicalization. I read that sentence as the 465/466 slice scope, not a standing 176 clause: 176 §4 requires the REAL sorter for INDEX builds used by joins and "a charged adjacent walk" for duplicates; `uniqueIds` builds no index (lookups are the linear `find` `:423-430`), the hunk keeps a charged adjacent walk, and the real sorter runs on any inversion. The auditor must rule explicitly; if 465's sentence is standing law, C7 needs a 176/465 clarification and stops there.
2. **C7 raises the bill for out-of-order facility arrays** (≤ ~600 for f = 6; §3), so it is not "byte-identical or lower" for that input class. Founding order is ascending (`INITIAL_STUDIO_FACILITIES` operations.ts `:85-120`). A later-appended facility with a lower id inverts it: the Annex `'facility-development-casting-annex'` (operations.ts `:122`), placed facilities (`placedStudioFacility` placement.ts `:327`, id = blueprint base or numbered), rival laboratories (rivalResearch.ts `:288`). Fixtures: 538/576 `world()` = `fund(p13aGeneratedStudio())` = `generateWorld` + `activateStudioOperations` + `initializeHollywood` (harness/p13a/fixtures.ts `:9-11`, no construction) → founding order; the 302/276 Ready fixtures (`foundedStudio` + real actions; stale-target `:31-33`, first-take `:32-34` assert no construction) → founding order; `started-owner-replay` uses `operationsStudio('p13a-production-consumer')` → founding order. `p13aLaboratorySlice` (fixtures.ts `:18`) adds a laboratory but no replay test uses it. `tests/p14b4-bounded-sort-owners.test.ts:70` reverses facilities but calls `advanceManagedProductions` directly, not the replay. So no existing test bill increases; the parent must accept the disclosed increase class or C7 does not qualify.
3. **C6 selector charge**: +4 (recommended, module convention) or 0 (block-constant reading); a 4-unit accounting choice for the auditor.
4. **C6 extra keys**: none possible today (§2); RED case 3 pins it so a future `addHold`/prepare change cannot silently break the constant. `copyLiteral` must not be applied to the caller-record `copyCost` sites listed in §3.
5. **Observation, not a finding (C5 d2)**: the fresh requirement arm (operations.ts `:395-397`) performs, for facilities matching a soundstage requirement while a Set is bound, two extra compares beyond the `2 + text` per facility at `:1224`; I did not verify which term covers them (possibly the 140 constant or `slots`). Lowering that walk to width 19 is therefore not lawful without an explicit matching-facility term; the auditor may want to look at the current cover independently.
6. **Second sort at `:1979`** (`released = sorted(advanced.admittedReleaseIds…)` right after `uniqueIds` of the same array): an obvious later reduction (return `ordered` from `uniqueIds`); NOT proposed here (signature change, second site).
7. The stale route stays RED after C6+C7 (gap ≈28k); caps 200000, deadlines, tariffs, refusals, timeouts and the 302 control are untouched (515 §6 / 578 remain the Owner's).

## 8. Evidence limits and next concrete action

- Paper only; nothing executed. 2779/504/2158/157/191 are hand-derived from `:245-437` and `:320-328` and agree with the 515-A measured anchors (sortBill(5,120) = 2158; copyCost 157 → 61). Route deltas assume the stated close counts (10 non-fixed on 302; 3 fixed at the 538/576 wrap; +1 non-fixed, +5 fixed at Post exit/release) and founding facility order. HEAD moved once during my reads (578, docs-only). I did not open records 504/514/517/526/528/543 beyond the 514 table and the 538/576 rows quoted.
- Next: parent saves this note as record 579 §4 → contract-auditor READ-ONLY review of C6 and C7 (rulings needed: 465 scope vs law for C7; the C7 increase class; the +4 selector) → test-author RED per §6 with its unchanged-source baseline → ONE sim-core writer on the five listed ranges → §6 serial checks → §5 re-measurements → checkpoint. C5 closed as re-derived (≈0.1–0.3k net) unless the auditor disagrees with §2/§3's proofs.

### 579-B — contract-auditor READ-ONLY review

As returned, unedited.

```text
# 579-B — contract-auditor READ-ONLY review of design note 579-A (C6, C7; C5 dropped)

**Status: DONE (review only).** No file created, edited or run; no Git, network, shell or delegation. Tools used: Read, Glob, Grep on the worktree and the note's scratchpad path only.

**Model observed:** the harness identifies me as Fable 5.1 (`claude-fable-5-1`). The lean-ctx MCP tools named in the user CLAUDE.md are not exposed in this session; the role allowlist (Read/Glob/Grep) was used as-is.

**Identity:** every source line the note quotes matched the bytes I read at HEAD 19bc70e (2797-line `src/core/promiseCapacityOwnerReplay.ts`; SHA parent-verified). Line cites below are to that file unless another path is given.

## Sources read (line ranges)

- Note: `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/579-A-report.md` whole (187 lines).
- Replay: :127-134 (`invariant`, message prefix), :140-250 (LITERAL incl. :161-162, APPEND), :245-345 (`Work`; `less` :318, `copyCost` :320-328), :357-437 (`sortBill`, `sorted`, `sortedOutput`, `find`, `uniqueIds`), :518-535 (`reservationSubject`, the facility `find` :526), :636-680 (prepare's three `uniqueIds` :655/:662/:663, `copyCost(production)` :677, `find` :680), :740-764 (fixed `hold()` :747-760), :1112-1122 (arrival guards :1121), :1180-1225 (`allocationBill`), :1240-1252 (`hasUsableRehearsalSet`), :1288-1299, :1300-1324 (`copyCost(reservation)` :1321), :1462-1489 (`sweepBill` terms :1481-1483), :1522-1533, :1610-1714 (`closeHold` :1617-1637, `addHold` :1638-1649, `closePath` :1650-1663, `drainEvents` :1664-1714), :1776-1808 (`completeTrace` tail; `additionalHolds` :1797-1800; four `sortedOutput` callers :1805-1807), :1880-1899 (:1892 `closePath`), :1970-1994 (:1978 `uniqueIds`, :1979 `sorted`, :1986 `closePath`), :2715-2734 (ledger from `prepared.fixed` :2725-2727), :2762-2797 (:2775 result, :2781-2783 projection, entries). Greps: `ledger.push|.hold = |ledger: |fixed.push|addHold(|closeHold(|closePath(|copyCost(|sortedOutput(|uniqueIds(|sorted(`, `operations.facilities|fixed: true|fixed: false`, `factRef`, selector-convention comments.
- `src/core/promiseCapacityKernel.ts` :10-24; `src/core/boundedStableSort.ts` whole (60); `src/core/operations.ts` :83-127, :378-401, :764-777; `src/core/sets.ts` :684-701; `src/core/types.ts` :588-651; `src/core/productionPhases.ts` :48-63, :152-165; `src/core/save.ts` :2543-2549, :2701, :2842-2848 (grep); `src/harness/p13a/fixtures.ts` :1-30.
- Records: 176 whole; 465-output-order-direction whole; 466 whole; 515 whole (incl. 515-A/515-B verbatim); 576 :1-183; 578 whole; 538 :34-49, :70-74; plan `P14B4-HEADLESS-PLAN.md` :300-324.
- Tests: grep `preparationWork|workUsed|ownWork|expectedWork` over `tests/` (129 lines, all read), over `bridge/` and `ui/` (none); `toBe|toEqual|toStrictEqual(4+ digits)` over `tests/*.ts`; `Snapshot(` (none); `__snapshots__` (none); `108265|32043|182925|145876|199994|2158|2779|105351|29694` (only comments/unrelated); replay-consuming test files (15, listed under Q3); `p14b4-owner-adapter-first-slice.test.ts` :552-581; `p14b4-started-owner-replay.test.ts` :66-95; `p14b4-started-replay-scenery-commands.test.ts` :22-23, :50-145; `p14b4-bounded-sort-owners.test.ts` :60-79; the e2e fixture `ui/e2e/world-first-scenery-load-in-v1/week-30-nights-of-watchtower-stage-7-blocked.save.json` (facility ids only, grep -o).

## Numbered answers

### 1. C6 lawfulness — MET WITH EVIDENCE (lawful as written). Verdict KEEP.

Key-set invariant, verified from source: the only writers of a ledger row's `hold` are the constructor in `addHold` :1645-1648 (exactly `holdId, ownerKey, ownerPathKey, subject, from, until`, the `LITERAL.hold` :161 order) and the two spreads :1631 and :1657 (`{ ...hold, until: at }`, which preserve key set and order). Fixed rows come only from `fixed.push(entry)` :757 with `entry` built at :754-755 (seven keys, `replaceableFrom` last, the `LITERAL.fixedHold` :162 order) and enter the ledger only at :2725-2727. `fixed:` is written only at :1645 (`false`) and :2727 (`true`); `ledger.push` only at :1645; `ledger:` only at :2725. No caller record reaches `branch.ledger`. Kernel `Hold`/`FixedHold` :16-20 agree. `closeHold` filters `!row.closed` (:1623) and `closePath` skips closed rows (:1654), so each row is closed once.

Arithmetic, re-derived from :320-328: non-fixed Σ|key| = 6+8+12+7+4+5 = 42; self-charge 1 + Σ(3+|k|)=60 + 6×(calc 8 + add 8)=96 → 157; returned 61; before `pay(14+61)`=75 → 232; after `pay(18+61)` = 79; saving 153. Fixed: Σ|key| = 57; 1+78+112 = 191; returned 79; before 284; after 97; saving 187. All match the note and 515-A's "157 exec → 61".

Law: 176 §1 :25-29 counts "copied shallow properties" and forbids an uncharged spread; the spread's price (61/79 = `copy(record)` per 176 §2 :68-69 and the §7 :312-324 table's formula 1+Σ(3+|k|)) is still paid before the spread. 176 §1 :34-35 reserves calculator steps "before doing it"; a discovery scan the code no longer performs is not a step. 176 §1 :53-64 discovery is for consumed caller records; the LITERAL convention :137-142 ("Fixed SOURCE schemas, not caller records. Compute their exact literal costs once") is the accepted pattern for module-built records. 515 §3 and 576 "Disposition" already classify C6 as lawful under that convention.

+4 selector: rule +4. The read of `row.fixed` and the ternary are a scalar read/operator pair the current 14-block does not contain (the existing `if (found.fixed)` :1633 is a separate read); the module pays added flag reads explicitly at :1174, :1208, :1381, :1560, :1572 (the note's cites :1497/:1571/:1576 are off by a few lines; cosmetic). 0 would be defensible under :28-29 but +4 is the conservative module convention.

`copyLiteral` must not touch :677 (`production`, caller P), :1321 (`reservation`), :1671 (`draft`), :2606 (`scriptDevelopment`, `project`, two calls). That is the complete caller-record `copyCost` set; :1630 and :1656 are the only module-record sites. Confirmed.

Preference (not a defect): evaluate `work.pay(4)` before reading `row.fixed`, then `work.pay(14 + price)`, to keep strict reserve-before-read order; the module already reads argument scalars before `pay` (e.g. :1886), so the note's single-`pay` form is within convention.

### 2. C7 lawfulness — MET WITH EVIDENCE under 176 as written; the 465 sentence is slice scope. Verdict KEEP, with a record note (parent authority, not Owner).

465 :9-16 is headed "Exact scope and helper" and opens "ONLY replay module + 466 handback"; :78 "Parent ADOPTS exactly this scope". 466 :26-30 and :86-87 are the writer's compliance statement for that slice. Neither amends 176. 176 §4 :159-165 requires the real sorter for INDEX builds used by joins plus a charged adjacent walk for duplicates; :182 charges sorting "when performed". `uniqueIds` :431-437 discards `ordered` and builds no index; every lookup in the module is the linear `find` :423-430 (:526, :671, :680, :1680-1683, :1885, :1976, :1982-1983, :1990). The hunk keeps the charged adjacent `equal` walk :433-436 unchanged and runs the real sorter, fully paid, on any inversion (:412-414). Nothing in `sortedOutput` or `sorted` changes price. So no 176/465 clarification is needed from the Owner; the parent records in 579 that (a) the `sortedOutput` caller set is now five (466 :86-87 "exactly four" becomes historical), and (b) the 465 :59-63 private precondition ("internally constructed dense plain arrays; pure field/identity projections") extends to :655/:662/:663 via 176 §1 :53-58 (validated engine JSON arrays) and to :1978 via the owner-built dense array; the projections `row => row.id`, `row => row.productionId`, `id => id` are pure.

Claims verified: `less` :318 returns `a < b`; the comparator :386 is `a.key < b.key ? -1 : a.key > b.key ? 1 : 0`; both are UTF-16 code-unit order on the same `keyOf` strings. `boundedStableSort` :43-50 takes the left element whenever `order <= 0`, so on non-decreasing input it is the identity; `sorted` returns `ordered.map(row => row.value)` :388 and `sortedOutput` returns `values.slice()` :401/:421, so `ordered` in `uniqueIds` holds the same references in the same order either way. Duplicates: an adjacent equal pair passes `less` (equal is not less) and is caught by the `equal` walk; a non-adjacent duplicate a…a on a non-decreasing walk forces every element between to equal a (so an adjacent pair exists), and any other arrangement is an inversion that takes the full sort and is caught adjacent as today. One semantic difference to record: at n = 1 `sortedOutput` :399-401 evaluates no key, so the 10-unit `text(key)` `sorted` paid at :380 for `prod-0052` is gone; lawful because no comparison is performed (176 §4 :182) and the id span is consumed at :680.

Arithmetic, re-derived: `sortBill(5,120)` self 10 + 3×(6+24) + 4 + 18 + 16 + 22 + 64 + 3×18 + 42 + 20 + 32 = 372, value 10+15+24+114+1995 = 2158; `sorted` n=5 = 4 + 5×20 + (5+115) + 8 + 372 + 2158 + 17 = 2779; n=1 = 4+20+10+8+10+8+5 = 65; n=0 = 4+8+10+6+2 = 30. `sortedOutput` n=5 on founding order (d < p < s; "scenery" < "soundstage" at c < o; 07 < 12) = 16 + 24 + 4×52 + (51+44+44+45) + 10 + 42 + 20 = 504; n=1 and n=0 = 28. Deltas 2275 / 37 / 37 / 2 as the note states. Founding ids from operations.ts :85-116 confirmed.

### 3. C7's disclosed bill-increase class — admissible under 176 §4 and the 465/466 precedent; DEVIATES from the parent's own 576 :71 sentence ("bills byte-identical or lower"). Verdict KEEP conditional on a record-only amendment.

465 :65-67 and 466 :78-79 accepted "unsorted routes can be MORE expensive" for the four output arrays; 176 §4 :182 charges the sort when performed. 576 :71 is the parent's disposition wording, so the parent may amend it in 579; if it declines, C7 does not qualify and C6 goes alone.

Fixture check (MET WITH EVIDENCE, extended beyond the note): the 15 replay-consuming test files are p14b4-{owner-enumerator-slice, owner-adapter-first-slice, started-replay-background-command, ready-owner-replay, ready-replay-background, started-owner-replay, replay-record-facts, ready-replay-stale-target, ready-replay-first-take, ready-replay-command, ready-replay-identity, started-replay-scenery-commands, started-replay-retained-development, started-replay-director, started-replay-casting}. Their states come from `foundedStudio` (9 files), `operationsStudio('p13a-production-consumer')` (3), `fund(p13aGeneratedStudio())` (2; fixtures.ts :9-11, no construction) and one V13 save. The save (`ui/e2e/world-first-scenery-load-in-v1/week-30-…-blocked.save.json`, seed `marathon-annex-play`, which the note did not inspect) carries exactly the five founding ids in founding order; the seed name is not an annex world. `p13aLaboratorySlice` (fixtures.ts :18-19, adds a laboratory) is used only by p13b/bridge tests, none of which call the replay. `p14b4-bounded-sort-owners.test.ts` :67-70 reverses facilities for `advanceManagedProductions`; `p14b4-kernel-hold-order-extension` `reversed` is the kernel's input. So no existing test bill increases.

Design observation for the record (not a defect): once a lot has the annex (operations.ts :121-126; `facility-development-casting-annex` sorts before `facility-post-building`), the facilities array is inverted at index 5 and every replay call pays the walk prefix 16+24+4×52+42+(51+44+44+45+57)+12 = 543 on top of the unchanged sort. The −2275 is a founding-lot saving; constructed lots pay ≈ +0.5k per call. 579 should say so, so C7 is not read as a universal reduction.

### 4. C5 dropped — MET WITH EVIDENCE for the domain claims and both NO rulings. Verdict KEEP (drop C5 as scoped).

Domains: `FacilityCapability` types.ts :592-597 (max `development-casting` 19); `ProductionPhase` :606-612 (max `postProduction` 14); `ShootingTaskStatus` :622 (max 10); blocker kinds :633/:638/:648 (17/15/15); phase table productionPhases.ts :52-61 is a frozen constant, `retainedCapabilitiesFor` :156-162; save.ts `asCapability` :2543-2549 validates into the union and :2842-2848 requires reservation capability = facility capability. NO rulings: (b) sets.ts :692-694 compares `set.id === id` (input ids) — correct; (d1) operations.ts :382 compares `facility.id === retained.facilityId` (input ids) — correct; (d2) :395-398 mixes the capability compare with `facility.id !== boundSet.mountedOn` when a Set is bound — only the `wrapOnly` (Post, no Set) arm is static — correct; (c) :770-774 three static operands plus `taskId` — correct. Net arithmetic checks: 8×(57−39) = 144; 5×18 = 90; 4×57 − (29+70+57) = 72 minus 56 self-charges; each new `calc(8).equality(19)` binding costs 28 per `sweepBill` call. ≈0.1–0.3k net is the honest figure; dropping C5 and folding static widths into C1 (module-init constants) is right. Note §7 item 5 (two extra compares in the fresh-requirement arm) I did not resolve either; it is an observation about the current cover, not a C5 requirement.

### 5. Pins — MET WITH EVIDENCE. No missed pin.

All 129 `preparationWork|workUsed|expectedWork` lines in `tests/` are (i) caps (`toBe(200000)` / `toBeLessThanOrEqual(...)`), (ii) relative (started-owner-replay :391-392/:558/:592/:614/:621; ready-owner-replay :654/:759; replay-record-facts :182-183/:204/:214; enumerator :443/:734-735; adapter :575 `200000 + claims.work`), (iii) the adapter/enumerator's own tariff (`expectedWork` :226, `expectedEnumeratorWork` :701), or (iv) kernel tests with synthetic inputs. `toBe(4+ digits)` in p14b4 files: only 200000 (background-command :361, started-owner-replay :406, adapter :564, ready-owner-replay :718) and 230339 (scenery-commands :64, fixture byte length). No `ownWork` consumer; `bridge/` and `ui/` have none; no snapshot files. The pin the note did not argue: adapter RED 8 :554-581 requires the Ready plan on `world().opened` to CUT at 200000. 538 :40-48 shows that admission's pairs term alone is ≥ 815850 (saturating `add`/`times`, CEILING 200001), so a ≈2.4k+ reduction cannot flip that cut. Record this in 579.

### 6. Controls and re-measurement — PARTIAL. Verdict REFINE.

The suites listed in §5 cover behaviour neutrality (traces, holds, ledgers, refusals, provenance are asserted byte-equal by E2/E8, the Started 28 and Ready 17). The deltas are derivable exactly, but the note assumes close counts; derive them from each measured run's outputs instead: fixed closes = `fixedHoldReplacements.length`; non-fixed closes = closed `additionalHolds` (until ≠ prepared end); C7 = 2349 at prepare (founding order) + 2 per frame with zero admitted releases + 37 per frame with one. Expected delta = 2349 + Σframes + 153×nonFixed + 187×fixed; any residual is a finding. The prepare-only rows (538: 32043 → 29694; 576 identical) isolate C7 alone; the remainder attributes C6.

### 7. RED brief — REFINE (case 1); cases 2–4 MET.

Case 1 defect as written: the projection carries the source's facilities array (:2723 `operations: input.source.operations`; :2782 `operations: branch.operations`; the owner's spreads keep the array), so "deep-equal after deleting `preparationWork`" fails on `projection.operations.facilities` order by construction. Compare that array normalised (sorted by id, or asserted equal to the swapped input and then excluded); everything else (trace, provenance, fixedHolds, omissions, `factRef` :797 = `token('source', issuer, now.week)`) is order-independent. Second refinement: pin the fixture to a state whose reservations sit at facility index ≥ 2 (576 `world().unscheduled`: shooting stage/scenery; started-owner-replay :66-91: scheduled shooting), because `reservationSubject` :526 `find` costs are symmetric under a [0]↔[1] swap only then; the module's other facility loops (:656, :942, :1292, :1526) are order-independent sums and :1245 is unreached for shooting. The unchanged-source baseline (step 5) must print both bills and confirm equality; if they differ, case 1 is not a witness and the test-author reports rather than adjusts. Case 2: message :130 is `Started owner replay: duplicate consumed identity`; in-order and out-of-order duplicates both reach :436. Case 3 is a faithful proxy: `additionalHolds` are the ledger's own hold objects (:1797-1800 push `row.hold`), replacements are :1635/:1660 literals, `fixedHolds` = `prepared.fixed` (:2775). "No vitest literal" is the right reading of 176 §8 item 4 (:383-388). Not missing anything blocking; :1978 n=0/1 is exercised by every Started route without a dedicated case (accepted limit).

### 8. Writer scope — MET WITH EVIDENCE; small addition. Verdict KEEP.

The five ranges are exact and minimal (:242/:243 insert; :1630; :1656; :432; the word "four" at :390). Add to NOT-writable: `find` :423-430, the four `uniqueIds` call sites :655/:662/:663/:1978, the :1979 second sort (note §7 item 6, deferred), `literalCost` :143-147, `boundedStableSort.ts`. Preference: `HOLD_COPY` could be `LITERAL.hold + 12` (= 61) and `FIXED_HOLD_COPY` `LITERAL.fixedHold + 14` (= 79), but the explicit `copyLiteral` mirrors `copyCost` line for line and is easier to audit; keep the note's form.

### 9. Overall

- C6: KEEP. C7: KEEP, conditional on the 579 record note (465 caller-set widening and precondition extension; 576 :71 amended for the disclosed increase class; the annex-lot +543 observation). C5 drop: KEEP. Controls: REFINE (derive close counts from outputs). RED brief: REFINE (case 1 projection normalisation and fixture pin). Writer scope: KEEP with the NOT-writable additions.
- One writer release for C6 + C7 is acceptable: disjoint ranges, one file, separable paper deltas; ask the writer for two commits inside the release (C6, then C7) so a residual can be bisected. If the parent declines the 576 amendment, release C6 alone.
- Nothing here changes a price, tariff, cap, deadline, refusal or timeout, and no test is loosened; every `sortedOutput`/`sorted`/`copyCost` tariff stays byte-identical. The stale route stays RED after C6 + C7 (paper: ≈28k of the 515 §1 gap); `stale-target:234` keeps `workLimit`. No Owner acceptance, cap/tariff ruling or 302 closure is claimed.
- Record-only items: 466 :86-87 "exactly four" superseded; 576 :71 wording amended; note §7 item 6 (:1979) deferred; the note's selector-convention cites corrected to :1174/:1208/:1381/:1560/:1572.

## Evidence limits

Paper only; nothing executed. Route close counts (10 non-fixed on 302; 3 fixed at the 538/576 wrap) agree with 515-B :299/:303 and the module's call sites but are unmeasured. The 302 gap after C6+C7 is 515 §1's paper figure minus 3.9k. I read the e2e fixture's facility ids only, not its whole content.

## Next concrete action

Parent saves this as 579 §4 with the record note from Q2/Q3/Q5; test-author RED per §6 with the case-1 refinements, baselined on unchanged source under `record-check.mjs`; ONE sim-core writer on the five ranges (two commits); serial checks per note §6; re-measurement per Q6 with output-derived close counts; independent actual-delta review.
```
