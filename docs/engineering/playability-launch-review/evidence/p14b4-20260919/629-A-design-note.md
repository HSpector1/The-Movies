# 629-A design note: breakPromisesOnCancel causal-coupling correction

Role sim-core, mode READ-ONLY design note. Worktree /Users/zacheryspector/The-Movies-headless-program, HEAD cb13a4579ab5b27dbf89d8e3b3d461828e8cb729, `git status` clean. No file outside this note was written; no vitest/tsc/node was run. Every line number below is a HEAD fact read with `sed -n`/`grep -n`; the task text's :420/:421 for the two nMax refusals are :421/:422 at HEAD (the `refuse` calls sit one line later than the task quoted). The 629-T working-tree RED was not read.

Law applied: P14B4-HEADLESS-PLAN.md :237-258 (outcome and bridge boundary), :331-336 (bound-target remaining count), :348-355 (immediate checks use the separate target-specific physical predicate proof, never the offer result alone); record 26 §2 (26-live-cutover-implementation-map.md :73-82); record 628 NEXT628 (b) (CONTINUATION-STATE.md :259); companion §4.4 table (P14-PREPARATION-COMPANION.md :378).

## 1. HEAD facts

### 1.1 `breakPromisesOnCancel` (src/core/promises.ts :735-761)

```ts
/**
 * §4.4's "any studio-caused event that makes the predicate unsatisfiable": the
 * studio cancelled a picture the beneficiary was seated on BEFORE its first take.
 * The service is re-run against committed state and the promise is BROKEN IFF the
 * result is IMPOSSIBLE — a cancellation the schedule can still absorb costs the
 * studio nothing here (it is priced by trust, §4.5), and a first take already
 * taken is never un-taken (companion §4.2: "first take, then cancellation").
 */
export function breakPromisesOnCancel(state: GameState, issuerStudioId: string, cancelled: Production): GameState {
  requirePromiseRoots(state)                                                          // :745
  const week = state.market.tick                                                      // :746
  if (state.firstTakes.some((t) => t.productionId === cancelled.id)) return state    // :747 immunity
  const seated = new Set(CAST_SLOTS.map((slot) => cancelled.cast[slot]))             // :748 class-blind
  let next = state
  for (const promise of state.promises) {
    if (!evaluable(promise)) continue
    if (promise.issuerStudioId !== issuerStudioId || !seated.has(promise.beneficiaryPersonId)) continue   // :752
    if (reclassifyPromise(next, promise, week).classification !== 'IMPOSSIBLE') continue                  // :753 THE COUPLING
    next = settle(next, promise, {
      outcome: 'BROKEN',
      outcomeCause: 'the studio cancelled the picture this person was cast in, and no path was left',    // :756
      outcomeEventId: null,
    }, week, 'a promise to this person was broken by a cancelled picture')                                 // :758
  }
  return next
}
```

Facts: :747 keeps immunity for any cancel of a picture with a recorded take. :748 seats over all three `CAST_SLOTS` regardless of the promise's class mask, so a tagged lead promise whose beneficiary sat in `support` on the cancelled picture is judged. :753 passes `next` (already carrying earlier settles of this same loop), so a later promise's reservation read (`activePromiseReservations` :289-298 filters `outcome === null`) depends on loop order. No feasibility receipt is persisted at this seam: the receipt `reclassifyPromise` mints is read for `.classification` and dropped; `settle` (:639-661) writes only `outcome`, `outcomeCause`, `outcomeWeek`, `outcomeEventId` and one `promiseOutcome` market receipt (:646-652). The stored `feasibilityReceipt` is untouched.

### 1.2 `reclassifyPromise` (:444-460)

```ts
export function reclassifyPromise(state: GameState, promise: ProfessionalPromise, week: number): PromiseFeasibilityReceipt {
  return promiseFeasibility(state, {
    family: promise.family,
    issuerStudioId: promise.issuerStudioId,
    beneficiaryPersonId: promise.beneficiaryPersonId,
    predicate: promise.predicate,                       // ORIGINAL count, never remaining
    windowStartWeek: promise.windowStartWeek,
    dueWeekExclusive: promise.dueWeekExclusive,
    startWeek: promise.windowStartWeek,
    termWeeks: promise.dueWeekExclusive - promise.windowStartWeek,
    promiseId: promise.promiseId,
  }, week)
}
```

Callers at HEAD: only `breakPromisesOnCancel` :753 (grep over src/). The freeze step uses its own `attachedFeasibility` (talentMarket.ts :761-777), not this function. It is re-exported at index.ts :1401. After the correction it has no internal caller; it stays exported and untouched.

### 1.3 `promiseFeasibility` refusal sites (:383-441) and which are target-specific physical bounds

| line | refusal | target-specific physical/lawful impossibility of THIS bound target? |
|---|---|---|
| :389 (`NOT_OFFERED_IN_B1` :213-217) | family not offered (directing/genre/named project) | No. Offer-catalogue rule. A bound root of such a family is a real commitment with generic-cast semantics (`promiseCastSlots` :595 returns all three seats for every count-only predicate; validator :982-992 evaluates its evidence over `CAST_SLOTS`). Whether its takes are physically reachable is independent of what the catalogue offers today. |
| :394 | classless P2 fresh-offer refusal | No. A bound legacy count-only `LEAD_OR_SIGNIFICANT_ROLE_COUNT` root would be refused here on ANY relevant cancel, and BROKEN by :753. Record 26 §2: "Do not route a bound legacy P2 through fresh-offer refusal to decide its outcome." |
| :397 | class on a non-P2 family | No, and unreachable for a persisted root: validator :986-988 refuses that shape at the save boundary; `attachPromise` :510-514 throws before minting. |
| :399-403 | count not whole / window inverted / window outside proposed contract | No, and unreachable: `reclassifyPromise` synthesises `startWeek = windowStartWeek`, `termWeeks = due - start`, so :401 and :403 cannot fire; :399/:400 are refused by the validator (:999, :1004) for any persisted root. |
| :408-409 | person absent / no acting skill profile | Lawful cast eligibility, but not caused by a cancel: a bound root passed a REASONABLY_ACHIEVABLE freeze (talentMarket.ts :1112-1114 throws otherwise), so the person had an acting profile at bind and skills are never removed. Not part of a cancel proof. |
| :421 | `X > nMax`: "no filming week inside the window can reach that many pictures" | YES in kind: the one physical bound. But `X = draft.predicate.count` is the ORIGINAL count (:384), not the remaining count, and `nMax` is counted from `from = max(windowStart, week)` (:411), so takes already recorded before `week` are never credited. A count-2 promise with one take and room for exactly one more is refused here and BROKEN at :753. Plan :331-334 forbids exactly this. |
| :422 | `reserved + X > nMax`: "promises already made to this person exhaust the window" | No. JOINT reservation conflict. `reservedByActivePromises` :300-304 sums other promises' `count - progress`, and `activePromiseReservations` :289-298 admits CURRENT attached, unaccepted proposals (`attached.has(promise.promiseId)` :292). Plan :244-247: "CURRENT unaccepted offers are not actual causal holds"; "never ... pick a beneficiary loser from a portfolio conflict". |

FRAGILE results (:433, :436, :439) never break today (:753 tests `!== 'IMPOSSIBLE'`) and never break under the correction.

### 1.4 `expectedFirstTakeWeek` (:345-367)

```ts
function expectedFirstTakeWeek(state: GameState, draft: PromiseDraft, from: number, k: number): number {
  if (k === 0) {
    const running = seatedPreFirstTake(state, draft.issuerStudioId, draft.beneficiaryPersonId, promiseCastSlots(draft))
    let earliest: number | null = null
    for (const production of running) {
      // `remainingTicks` 5 is the week BEFORE the take; the first advance is
      // skipped for a picture greenlit this very week.
      const weeks = Math.max(1, production.remainingTicks - 4) + (production.startTick >= from ? 1 : 0)
      if (earliest === null || from + weeks < earliest) earliest = from + weeks
    }
    if (earliest !== null) return earliest
  }
  return from + k * SEAT_CYCLE_WEEKS + WEEKS_TO_FIRST_TAKE
}
```

Reads only `draft.issuerStudioId`, `draft.beneficiaryPersonId` and `promiseCastSlots(draft)` (which reads `draft.predicate`). `SEAT_CYCLE_WEEKS = TUNING.PRODUCTION_TICKS` (= 8, tuning.ts :59), declared a HYPOTHESIS at :54-58; `WEEKS_TO_FIRST_TAKE = 5` (:53), verified against operations.ts :1658-1661 (a picture greenlit this week is skipped) and :1680-1689 (the 5 -> 4 branch is the one first-take owner). For `k >= 1` the running picture's timing is ignored entirely; the cadence is the fresh chain from `from`.

### 1.5 `seatedPreFirstTake` (:268-283)

```ts
function seatedPreFirstTake(state: GameState, studioId: string, personId: string, slots: readonly CastSlot[]): readonly Production[] {
  const recorded = new Set(state.firstTakes.map((t) => t.productionId))
  return studioProductions(state, studioId).filter(
    (p) => !recorded.has(p.id) && slots.some((slot) => p.cast[slot] === personId),
  )
}
```

`studioProductions` (:229-234) returns `state.studio.activeProductions` for the player. A recorded take excludes the picture; a seat outside `slots` excludes it (record 600 mask rule).

### 1.6 `qualifyingTakes` (:620-634)

```ts
export function qualifyingTakes(state: Pick<GameStateV30, 'firstTakes'>, promise: ProfessionalPromiseV30): readonly FirstTakeReceipt[] {
  const slots = promiseCastSlots(promise)
  const productions = new Set<string>()
  return state.firstTakes.filter((take) => {
    if (productions.has(take.productionId)
      || take.studioId !== promise.issuerStudioId
      || take.week < promise.windowStartWeek || take.week >= promise.dueWeekExclusive
      || !slots.some((slot) => take.cast[slot] === promise.beneficiaryPersonId)) return false
    productions.add(take.productionId)
    return true
  })
}
```

Actual class-qualified, exact issuer, half-open window, distinct productions. Exported from promises.ts; NOT re-exported by index.ts (grep: index.ts :1395-1428 lists neither `qualifyingTakes`, `promiseCastSlots` nor `promisedCastMasks`; promiseCapacityOwners.ts :15 imports them from './promises.js').

### 1.7 `promiseCastSlots` (:592-597)

```ts
export function promiseCastSlots(promise: Pick<ProfessionalPromiseV30, 'predicate'>): readonly CastSlot[] {
  if (!('kind' in promise.predicate)) return CAST_SLOTS
  return promise.predicate.seatClass === 'lead' ? ['lead'] : ['lead', 'antagonist']
}
```

### 1.8 `evaluable` (:588-590)

```ts
function evaluable(promise: ProfessionalPromise): boolean {
  return promise.outcome === null && promise.contractId !== null
}
```

### 1.9 `advancePromisesWeek` (:673-718) and `breakPromisesOnTermination` (:720-733)

The weekly owner recomputes `progress = min(count, qualifyingTakes(next, promise).length)` every pass (:678-680), settles SATISFIED at `takes.length >= count` (:681-699) with evidence refs, settles BROKEN at `week >= dueWeekExclusive` (:701-709) writing the recomputed `progress`, and writes back a changed `progress` otherwise (:711-713). tick.ts :1102-1110 appends the week's takes and runs this owner in the same advance, before the terminal market step. Termination (:720-733) breaks every open promise of (issuer, person) unconditionally; called from actions.ts :2637 (`releaseTalent`). Both untouched by this slice.

### 1.10 `applyCancel` (src/core/actions.ts :567-600)

```ts
function applyCancel(state: GameState, action: Action & { kind: 'cancel' }): GameState {
  const idx = state.studio.activeProductions.findIndex((pr) => pr.id === action.productionId)   // :568
  if (idx === -1) throw ...                                                                       // :569-573
  const cancelled = state.studio.activeProductions[idx]!                                          // :574
  const scriptDevelopment = ... returnScriptProjectToReady(...)                                   // :575-578
  const withoutProduction: GameState = {                                                          // :579-590
    ...state,
    studio: { ...state.studio, activeProductions: state.studio.activeProductions.filter((pr) => pr.id !== action.productionId) },
    operations: removeManagedProductionWorkflow(state.operations, action.productionId),
    technology: discardUnfilmedProductionTechnology(state, action.productionId),
    scriptDevelopment,
  }
  const playerStudioId = state.hollywood?.playerStudioId                                          // :596
  return playerStudioId === undefined
    ? withoutProduction
    : breakPromisesOnCancel(withoutProduction, playerStudioId, cancelled)                         // :597-599
}
```

Facts: the ONLY call of `breakPromisesOnCancel` in src/ is :599 (grep). The issuer passed is always the player studio. `cancelled` is the whole `Production` (cast, startTick, remainingTicks, id) so the relevance filter needs nothing more from this seam. The state handed to the promise module already lacks the cancelled picture (:579-590), so a running-picture read after the cancel cannot see it. Rivals never route here: `hollywoodTick.ts`, `hollywoodPolicy.ts`, `hollywood.ts` contain no cancel (grep -i cancel returns nothing); rival productions live in `hollywood.businesses[].productions` and no rival code removes one before release. `tick.ts` :755 mentions cancellation only in a novelty comment.

### 1.11 `applyGreenlight` (src/core/actions.ts :286-565), paper assessment only

The greenlight seam: `resolveGreenlightStaffing` (:319), the busy law `activeProductionCompanyTalentIds(state)` plus `activeWritingAssignmentIds` (:341-343; employment.ts :125-127 reserves director, three cast and craft of every active production) enforced by `assertGreenlightStaffingIdle` (productionAdmission.ts :210-220, throws when an engaged id is busy). No promise code is reached from this function (grep: promises.js is imported at actions.ts :61 for the two break functions only; :599 and :2637 are the only calls).

Can greenlighting the beneficiary into a NON-qualifying seat make a class predicate physically impossible before due? The hold it creates lasts while the picture is in `activeProductions`, and the same studio can end it any week by `cancel` (:567), which frees the person immediately (busy set is derived from `activeProductions`). So the hold is reversible by a lawful action and is not PERMANENT path loss. The offer law already ignores such a hold: `seatedPreFirstTake` counts only mask seats (:281) and `expectedFirstTakeWeek` falls through to `from + 5` (:366) whatever non-mask seat the person holds. Greenlighting the beneficiary into a mask seat adds a path; greenlighting a picture without the beneficiary consumes rooms, which is capacity, not target-specific person impossibility, and is also reversible. Companion §4.4 :378 names "greenlighting the named project with the seat filled by someone else" as an immediate cause, which is the SPECIFIC_PROJECT family; that family is never bound by the live route (§5 (iii)). Recommendation: paper-only, no greenlight integration in this slice. Plan sentence satisfied: "Review only relevant successful greenlight/cancel seams for immediate studio-caused permanent path loss" (:243-244); the greenlight seam causes none; "Otherwise real takes/due-week evaluation decide outcomes" (:251-252) covers a hold that the studio never releases.

### 1.12 index.ts :1395-1428

`breakPromisesOnTermination` :1404, `breakPromisesOnCancel` :1405, `reclassifyPromise` :1401, `promiseFeasibility` :1400 are re-exported. `promiseCastSlots`, `qualifyingTakes`, `promisedCastMasks` are module exports of promises.ts without an index re-export (tests import them from '../src/core/promises.js'; p14b4-cast-class-outcomes.test.ts :16 does so for `advancePromisesWeek`, `attachPromise`).

## 2. Design: the separate target-specific proof

### 2.1 Helper

Name: `targetSpecificImpossibility(state, promise, week): string | null`, returning the bottleneck sentence or `null`. Pure, no RNG, no receipt, no inputs digest, reads `state.firstTakes` and the issuer's active productions only.

```ts
/**
 * Plan :331-336 / :348-355: the SEPARATE target-specific physical proof for a
 * BOUND promise after a studio action. `remaining` is the count minus the ACTUAL
 * class-qualified distinct first takes (never the stored progress counter); zero
 * remaining is a met predicate the weekly owner settles, not a failed probe.
 * `nMax` is the sequential physical bound from max(windowStartWeek, week) on the
 * state AFTER the action, in the promise's own class mask. No reservation
 * subtraction, no family or class refusal, no buffer/slack/existing-path term
 * and no receipt: this is an outcome proof, not an offer classification
 * (record 26 §2). A FRAGILE remainder, a joint conflict and an unsupported
 * family are all `null` here.
 */
export function targetSpecificImpossibility(state: GameState, promise: ProfessionalPromise, week: number): string | null {
  const remaining = Math.max(0, promise.predicate.count - qualifyingTakes(state, promise).length)
  if (remaining === 0) return null
  const from = Math.max(promise.windowStartWeek, week)
  let nMax = 0
  while (nMax < remaining && expectedFirstTakeWeek(state, promise, from, nMax) < promise.dueWeekExclusive) nMax += 1
  return remaining > nMax ? 'no filming week inside the window can reach that many pictures' : null
}
```

The loop is bounded by `remaining` (no 1000 cap needed). The bottleneck reuses the :421 sentence, since it is the same physical statement with the corrected count.

Reuse of `expectedFirstTakeWeek`: pass the promise itself. `expectedFirstTakeWeek` reads exactly `issuerStudioId`, `beneficiaryPersonId` and `predicate` (§1.4), and `ProfessionalPromise` carries all three with identical types (types.ts :2182-2186, :2220-2225 against `PromiseDraft` :196-210). So narrow its parameter type, one signature line, zero runtime change:

```ts
// :352, signature only
function expectedFirstTakeWeek(
  state: GameState,
  draft: Pick<PromiseDraft, 'issuerStudioId' | 'beneficiaryPersonId' | 'predicate'>,
  from: number,
  k: number,
): number {
```

Why not synthesise a `PromiseDraft` as `reclassifyPromise` does: that form carries five fields the law never reads (`family`, `windowStartWeek`, `dueWeekExclusive`, `startWeek`, `termWeeks`) and invites a future reader to think the proof depends on them. Why not a new shared helper: there is one law and it already exists; a second implementation of the same cadence is the duplication the plan forbids. If the auditor prefers no signature edit at all, the synthesised-draft form is a drop-in:

```ts
const draft: PromiseDraft = { family: promise.family, issuerStudioId: promise.issuerStudioId,
  beneficiaryPersonId: promise.beneficiaryPersonId, predicate: promise.predicate,
  windowStartWeek: promise.windowStartWeek, dueWeekExclusive: promise.dueWeekExclusive,
  startWeek: promise.windowStartWeek, termWeeks: promise.dueWeekExclusive - promise.windowStartWeek }
```

### 2.2 The cadence for `k >= 1` (genuine design gap; see §5 (vii))

The task directs "expectedFirstTakeWeek's law": `k = 0` running-or-fresh, then `from + 8k + 5`. That law is the offer hypothesis (:54-58), not a proven hard bound, and it errs in both directions once `remaining >= 2`:

- Too optimistic for the ordinary path: a fresh picture greenlit at `from` takes at `from+5` and reaches `remainingTicks 0` at `from+9` (skipped first advance, operations.ts :1658-1661; 8 decrements after it), so the next fresh take is `from+14`, not `from+13`. Optimism never causes a false BROKEN, so this direction is harmless to the proof.
- Too pessimistic against a lawful path: after the first take at `t0` the studio may cancel that picture (take retained, :747 immunity; person freed by :579-590) and greenlight the next one the same week, so the second take can land at `t0 + 5`, and a running picture at `remainingTicks 5` (take `from+1`) can be followed by a take at `from+6`, far earlier than the law's `from+13`. A due week inside that gap yields a false "impossible" for `remaining = 2`.

Two feasible alternatives:

- A (as directed): loop `expectedFirstTakeWeek(state, promise, from, k)` for all `k` (fragment §2.1). One law shared with the quote; NOT a strict hard bound for `remaining >= 2`.
- B (proof-only hard bound): `t0 = expectedFirstTakeWeek(state, promise, from, 0)` (running-or-fresh, a true lower bound on the first take because a countdown can only be delayed, operations.ts :1658-1689) and `t_k = t0 + k * WEEKS_TO_FIRST_TAKE` (each later take needs a greenlight at least five weeks earlier, and the seat frees at the earlier take's cancel). `nMax = t0 < due ? Math.ceil((due - t0) / WEEKS_TO_FIRST_TAKE) : 0`. No loop, no `SEAT_CYCLE_WEEKS`, no change to the quote law.

The two agree whenever `remaining === 1` (both reduce to `t0 < due`), which is every existing pin (§3) and every live-authored promise (rivals author count 1, talentMarket.ts :1279-1281; the tagged player route in the tests authors count 1 or count 2 with the count-2 case immune at cancel). Recommendation: B. Plan :348-349 accepts "a valid hard upper bound" and :244-245 refuses "a merely FRAGILE remainder"; A would let the seat-cycle hypothesis write a permanent BROKEN on a record where a lawful two-take path exists. B is the plan's proof; A is the quote's estimate. If the auditor rules that consistency with the quote law outweighs the `remaining >= 2` band, A is the fragment in §2.1 unchanged.

### 2.3 Relevance filter

A promise is judged at this seam iff:

1. `evaluable(promise)` (:588-590): bound and open;
2. `promise.issuerStudioId === issuerStudioId` (the player, the only caller);
3. the cancelled picture could have satisfied THIS promise's class: `promiseCastSlots(promise).some((slot) => cancelled.cast[slot] === promise.beneficiaryPersonId)`.

Rule 3 replaces the class-blind `seated` set (:748). A tagged lead promise whose beneficiary sat in `support` loses no class path at that cancel and is not judged (record 26 §2: "check whether the cancelled picture could satisfy this class"). A legacy count-only root keeps generic-cast relevance through `promiseCastSlots` :595.

Whether the cancelled picture's own expected first take also had to fall inside the window: NOT required. One rule, mask-seat relevance only. Reasons: (a) the plan's "relevant ... seams" is met by the picture holding a class-capable seat the studio controlled; whether that seat could have made the due week is exactly what the physical proof then settles, and a second timing test in the filter would compute the same quantity twice with a chance of disagreeing; (b) the existing pin tests/p14b1-promises.test.ts :780-838 cancels a picture whose take (`W+5`) lies outside the window (`due W+2`) and requires BROKEN within one tick; a take-inside-window precondition flips that pin to "not judged", and the due-week owner would then break the same promise at `W+2` with the generic due-week cause, losing the cancel attribution the test and companion §4.4 :378 ("the causing event's receipt") want; (c) "studio-caused" is satisfied literally: after the studio's action the beneficiary's class path count is zero and the proof says so.

### 2.4 Corrected `breakPromisesOnCancel` (edit points :735-761)

```ts
/**
 * §4.4's "any studio-caused event that makes the predicate unsatisfiable": the
 * studio cancelled a picture the beneficiary held a CLASS seat on BEFORE its
 * first take. BROKEN iff the separate target-specific proof finds no physical
 * path for the REMAINING count on the post-cancel state (plan :243-252, :331-336;
 * record 26 §2). A cancellation the schedule can still absorb costs the studio
 * nothing here (it is priced by trust, §4.5); a joint reservation conflict, an
 * unsupported family or a FRAGILE remainder never breaks; a first take already
 * taken is never un-taken (companion §4.2: "first take, then cancellation").
 */
export function breakPromisesOnCancel(state: GameState, issuerStudioId: string, cancelled: Production): GameState {
  requirePromiseRoots(state)
  const week = state.market.tick
  if (state.firstTakes.some((t) => t.productionId === cancelled.id)) return state          // :747 unchanged
  let next = state                                                                          // :748 `seated` deleted
  for (const promise of state.promises) {
    if (!evaluable(promise)) continue
    if (promise.issuerStudioId !== issuerStudioId) continue                                 // :752 split
    if (!promiseCastSlots(promise).some((slot) => cancelled.cast[slot] === promise.beneficiaryPersonId)) continue
    if (targetSpecificImpossibility(state, promise, week) === null) continue                // :753 replaced
    next = settle(next, promise, {
      outcome: 'BROKEN',
      outcomeCause: 'the studio cancelled the picture this person was cast in, and no path was left',   // :756 unchanged
      outcomeEventId: null,
    }, week, 'a promise to this person was broken by a cancelled picture')                                // :758 unchanged
  }
  return next
}
```

Edit points: doc comment :735-743 rewritten; :748 removed; :752 split into issuer test and mask-seat test; :753 replaced by the proof call on `state` (not `next`; the proof reads `firstTakes` and productions, which `settle` never changes, so the two are identical and `state` makes the independence of each judgment visible); :754-759 unchanged, strings unchanged. Nothing else in promises.ts changes except the `expectedFirstTakeWeek` parameter type (§2.1) and the new helper placed after `qualifyingTakes` (:634) so it sits beside the reader it uses. `reclassifyPromise` :444-460 untouched. `settle` writes no `progress` here, as today; the due-week owner writes one (:701-709) and the termination owner does not (:727-731), so either precedent exists, and no pin needs it (validator :1077 reads stored progress, which is `< count` for every evaluable promise at action time because tick.ts :1102-1110 recomputes it every advance and takes append only at advances).

Receipts: none new. The proof writes no feasibility receipt (today none is persisted at this seam either, §1.1); each BROKEN settle appends exactly one `promiseOutcome` market receipt as before. `feasibilityInputs` (:308-345) and `activePromiseReservations` (:289-298) are no longer read at the cancel seam.

Export: export `targetSpecificImpossibility` from promises.ts (module export, like `promiseCastSlots`/`qualifyingTakes`/`promisedCastMasks`) so 629-T can pin the arithmetic directly by importing '../src/core/promises.js'; do NOT add an index.ts re-export (index.ts frozen; no bridge or wire consumer needs it; the three siblings set the precedent). If 629-T uses only the `applyActions` cancel route, the export is harmless and costs one keyword.

## 3. Paper effect on the existing pins

Paper only; nothing was run.

### 3.1 tests/p14b1-promises.test.ts :780-838 (count-1 P1, due `W+2`, only picture cancelled): still BROKEN

Facts from the test: six people signed, one greenlight at :789 with `W = state.market.tick` read at :793 (`startTick = W`, `remainingTicks = 8`), promise `APPEARANCE_COUNT` count 1, window `[W, W+2)` (:802-817), bound to the lead's real employment row (:797), cancel at `W` (:830), one `tick` to `W+1` (:833), BROKEN expected (:836). The lead came from the hiring market (`signOne`), so no other player picture seats them.

Under the correction, at the cancel:

- immunity :747: no take recorded for the picture (it never reached 5 -> 4), so the loop runs;
- relevance: `promiseCastSlots` is `CAST_SLOTS` (count-only) and `cancelled.cast.lead === lead.id`, judged;
- `remaining = max(0, 1 - |qualifyingTakes|) = 1 - 0 = 1`;
- `from = max(W, W) = W`; post-cancel `activeProductions` seats the lead nowhere, so `expectedFirstTakeWeek(k = 0) = W + 0 * 8 + 5 = W + 5`;
- `W + 5 < W + 2` is false, so `nMax = 0`; `remaining 1 > 0`, bottleneck returned, BROKEN settled at `W` with the existing cause string.

Alternative B gives `t0 = W + 5 >= due`, `nMax = 0`, the same. The tick to `W+1` finds `outcome !== null` and skips it (:677). The pin holds. The direct `promiseFeasibility` sanity call at :823-828 (IMPOSSIBLE before the cancel, through :421 with the running picture at `k = 0`: `max(1, 8 - 4) + 1 = 5`, `W + 5 >= W + 2`) is untouched because `promiseFeasibility` does not change.

### 3.2 tests/p14b4-cast-class-outcomes.test.ts :430-442 (count-2 lead, one take, cancel of the picture that already filmed)

`complete(initial)` records the take on `initial.productionId` (:432); the cancel at :436 hits :747 immunity (`firstTakes.some(productionId === cancelled.id)`) and returns `state` unchanged, so `{ progress: 1, outcome: null }` at :437 holds as today. The second picture (:438-442) satisfies through the weekly owner, untouched. Unchanged.

### 3.3 :488-506 (first take then real player cancellation)

The promise is already SATISFIED (:490), and :747 returns before the loop anyway; `root(cancelled, ...)` equals `kept`, the take and receipts are unchanged. Unchanged.

### 3.4 Every other test that reaches `applyCancel`

grep `kind: 'cancel'` over tests/: actions.test.ts (:710, :724, :733), c2a-m2-set-binding :383, construction-core :357/:612, operations :436/:763, p13a-production-technology :224, p14b4-ready-replay-identity :104, presence-scenario :371, ruling-a-development-in-play :244, script-projects-actions :263/:334, studio-calendar :552. None references `promises`/`attachPromise`/`withPromises` (grep count 0 in each except p14b4-ready-replay-identity, whose :80 asserts `state.promises` equals `[]`); nine of them have no `hollywood` at all, so `applyCancel` :597 returns `withoutProduction` before the promise module. With no evaluable player promise the loop settles nothing and returns `state`, byte-identical to today. No test calls `breakPromisesOnCancel` directly and no test asserts either cancel string (grep over tests/ and scripts/: zero hits for `breakPromisesOnCancel`, `no path was left`, `broken by a cancelled picture`, `cancelled the picture this person`). The 629-T RED may add such pins; the strings are kept for that reason.

### 3.5 Natural-chain digests

The only call is actions.ts :599 under the player's `cancel` action (§1.10). Rival worlds never route a cancel (no cancel in hollywoodTick.ts, hollywoodPolicy.ts, hollywood.ts; the bridge has no production-cancel route, grep `kind: 'cancel'` over bridge/ is empty; the replay module promiseCapacityOwnerReplay.ts mentions cancellation only for laboratory adoption rows :663). Of the 625 control set (625-seating-natural-chain-controls.txt lists 17 files), only p14b1-promises.test.ts contains a player cancel, the :780-838 case above. No chain digest moves. Reconciliation class: none.

## 4. Writable and frozen lists for the ONE writer

Writable:

- src/core/promises.ts only: `breakPromisesOnCancel` :735-761 (doc comment and body per §2.4); new exported helper `targetSpecificImpossibility` placed after `qualifyingTakes` :634; the parameter type of `expectedFirstTakeWeek` :352 narrowed to `Pick<PromiseDraft, 'issuerStudioId' | 'beneficiaryPersonId' | 'predicate'>` (or, if the auditor refuses that line, the synthesised-draft form in §2.1 with :352 untouched).

Frozen:

- src/core/index.ts (no new re-export; §2.4);
- src/core/actions.ts (`applyCancel` passes the whole `Production`; the relevance filter needs nothing else; `applyGreenlight` gets no integration, §1.11);
- src/core/promiseCapacityOwnerReplay.ts and every replay/started-replay reader, the stale route test, save/bridge/UI/Unity, `PROMISE_RULES_VERSION 4`, `LIVE_SAVE_VERSION 30`, `PROJECTION_VERSION 47`, tuning, fixtures, caps, tariffs, timeouts;
- `reclassifyPromise`, `promiseFeasibility`, `advancePromisesWeek`, `breakPromisesOnTermination`, `settle`, the validators.

No wire change: no new persisted field, no new receipt kind, no schema change; Unity untouched.

## 5. Risks and open questions for the contract-auditor

1. (i) The `k = 0` running term after the cancel. `applyCancel` builds `withoutProduction` (:579-590) before :599, so `state.studio.activeProductions` no longer holds the cancelled picture when `seatedPreFirstTake` (:272-283, via `studioProductions` :229-234) runs; the proof cannot re-count it. Also `operations.workflows` is already pruned (:587), which the proof never reads. Confirmed by reading; the RED should still pin "the cancelled picture is not a path" with a second seated picture present versus absent.

2. (ii) Employment ending before any reachable take. Validator :1029 refuses a bound root whose `dueWeekExclusive` exceeds the carrying contract's `endWeekExclusive`, so a bound window lies inside the contract; a cancel never touches employment; an early end is termination, owned by `breakPromisesOnTermination` (:720-733, actions.ts :2637). OUT of this slice: the proof carries no employment term. Plan sentence: "Preserve early termination attribution" (:252-253).

3. (iii) Unsupported-family roots (`NOT_OFFERED_IN_B1` :213-217). Live route: `attachPromise` :492-560 mints with whatever receipt the service returns (IMPOSSIBLE for these families, :389), `survivesFreeze` drops the proposal as `promiseNotFeasible` (talentMarket.ts :1096-1098) and `commitWinningPromise` throws unless the frozen receipt is REASONABLY_ACHIEVABLE (:1112-1114). Rival authoring offers P1 and tagged P2 only (:1279-1281). So no such root binds through the live route today. The save validator (:976-977) accepts any catalogue family on a bound root, so a hand-authored or in-memory synthetic root of that family is representable. For it the proof returns the physical answer over the generic cast mask (`promiseCastSlots` :595; `qualifyingTakes` over cast seats, never `directorId`, :628-632, matching validator :1049-1051). No family refusal, per record 26 §2.

4. (iv) Several promises of one person at one cancel. Each promise is judged on its own `remaining` against its own class mask and window; no reservation term exists, so no promise's judgment reads another's; there is no break-all and no loser selection (plan :247-251). Two count-1 promises of one person with one seat left both return `null` (either could still be kept), as the plan requires.

5. (v) Determinism and order. The loop walks `state.promises` in root order; `settle` appends one `promiseOutcome` receipt per BROKEN promise in that order (eventId ordinal :477). The proof is passed `state`, which no `settle` alters in the fields it reads, so the result set is order-independent and the receipt order is the root order, as today. A promise past due with `outcome null` cannot be evaluable at action time (tick.ts :1102-1110 settles it in the advance that reaches `due`), so `from >= due` never arises on the live route; if a synthetic state forces it, the proof breaks with the cancel cause, which the auditor may prefer to see pinned as out of contract.

6. (vi) Stale progress. `advancePromisesWeek` recomputes `progress` from `qualifyingTakes` on every pass (:678-680, :711-713) and takes append only inside the advance (tick.ts :1102-1110), so the stored counter is current at every action. The proof still never reads it (plan :333-334): the `variant()` probes in p14b4-cast-class-outcomes.test.ts :253-271 change a root's class in memory without a pass, and `promisedCastMasks` :607 / `reservedByActivePromises` :300-304 do read the counter (other owners, not this slice).

7. (vii) Plan versus current code, three points. (a) `SEAT_CYCLE_WEEKS` is a hypothesis (:54-58), not a hard bound; the first-take-then-cancel path makes a five-week cycle lawful and a running picture's release makes the ordinary cycle nine weeks, so alternative A can write a false BROKEN when `remaining >= 2` (§2.2); the auditor must choose A or B, and the RED should carry one `remaining = 2` case that separates them if B is chosen. (b) Record 26 §2 cites `breakPromisesOnCancel:656` and `applyGreenlight:321` / cancellation `:739-746`; at HEAD these are :744-761, :286 and :567-600 (drift only). (c) `expectedFirstTakeWeek` returns the running picture's week even when it is at a setup hold or unscheduled take (operations.ts :1680-1684 `continue` without a take); the proof therefore stays optimistic about a blocked picture, which is the safe direction (the due-week owner decides), and is stated so no one reads a blocked picture as a proven path.

8. Optional, not recommended: writing `progress: count - remaining` into the cancel settle to mirror the due-week owner (:701-709). No pin needs it; the termination owner omits it; the plan asks for the coupling correction only.

## 6. Evidence limits

- Paper only. No vitest, tsc or node run; the arithmetic in §3 is hand-derived from the test text and the source at HEAD.
- The 629-T working-tree RED was not read; the strings and the export recommendation are guesses at what it may pin.
- The natural-chain claim rests on grep (no cancel in the rival tick modules or the bridge) and on the 625 control-file list; it was not re-run.
- Line numbers are HEAD cb13a457 facts; the task's :420/:421 are :421/:422 here.
- The "cancel then greenlight the same week" path in §2.2 was reasoned from `applyCancel` :579-590 and the busy law (employment.ts :125-127, productionAdmission.ts :210-220); it was not executed.
