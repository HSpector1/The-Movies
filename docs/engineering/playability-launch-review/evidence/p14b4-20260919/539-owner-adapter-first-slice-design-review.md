# 539 — Detached owner-adapter first slice: design note, independent review, adopted brief

2026-09-20. Claude Code parent. Two READ-ONLY specialist reports (verbatim in §4): 539-A sim-core
design note for the smallest lawful detached owner-adapter slice (claim collection, capacity-input
assembly over the EXISTING explicit-plan producers, kernel-result mapping, inputs digest; no
enumerator, no live wiring, no version stamp, no rival context), and 539-B contract-auditor review
against the plan (:90-139, :250-320), records 13/14 (KEEP architecture), 26 §1/§2, 23, 17, 176 §1,
537 and 538. Verdict KEEP WITH REFINEMENTS. No source, test, fixture, cap, validator or plan text
changed. HEAD at review `e3c6dd29` (docs only since `69d16f8`; source identical).

## 1. Adopted design (539-A as refined by 539-B)

New pure module `src/core/promiseCapacityOwners.ts`, no live importer, not re-exported from
`index.ts` (the kernel and the producers are not either). Imports only `./math.js` (`fnv1a64`),
`./promises.js` (two helpers), `./promiseCapacityKernel.js`, `./types.js`. It never runs a producer;
it consumes a producer RESULT.

- `collectPromiseClaims(state: ClaimSource, draft: PromiseDraft): CollectedClaims` — membership is
  the B3 law of `activePromiseReservations` (`promises.ts:274-283`: outcome null AND (bound OR
  attached), self excluded) with the kernel's own half-open overlap predicate (byte-equal to
  `overlapWindow`), widened per plan :94/:258-259 to EVERY beneficiary of the issuing studio
  (`PriorClaim`) and narrowed per plan :95/:262-263 to other issuers' claims on the TARGET person
  only (`ForeignDebit`). Mask by predicate shape only via `promiseCastSlots`. `remaining`: bound
  members `max(0, count − qualifyingTakes(state, root).length)`; CURRENT members and foreign
  debits `count` (B3's existing conservative debit, `promises.ts:287`; plan :262-263). Zero
  remaining is emitted, not dropped. Empty-window or count<1 members are excluded as zero-demand
  (exact, no omission). Target: `state 'bound'` iff the named root has a contract;
  `actualQualifiedCount` from `qualifyingTakes` for bound targets, else 0. Malformed target
  (empty window, count<1, non-integer) → named invariant throw (precondition; in the later live
  slice the scalar's structural refusals `promises.ts:373-383` run BEFORE the adapter, so the
  huge/outside-contract refusals are never relabelled as cap uncertainty). Rival guard:
  `state.hollywood === null` or issuer ≠ `hollywood.playerStudioId` → empty claims,
  `claimsAndHolds 'incomplete'`, named omission, never a throw. `now = {market.tick, 0}`;
  `horizonEndWeek = max(target due, prior-claim dues)`; `claimPersonIds` sorted unique; collection
  tariff `work = 1 + P + A + M×T` (plan :316-318 "Charge/cap preprocessing too"; the M×T
  first-take scan is not linear), added to `preparationWork` at assembly.
- `assembleCapacityInput(claims, producer, horizonEndWeek, limits): JointTraceCapacityInput` — the
  first-take test's hand assembly (`tests/p14b4-ready-replay-first-take.test.ts:314-321`) with
  coverage DERIVED: `claimsAndHolds 'complete'` iff claims complete AND every attempt complete AND
  no producer omission; `existingCalendars` and `allOwnerTraces` ALWAYS `'incomplete'` with the
  fixed omission `NO_ENUMERATOR_OMISSION`; cuts carried as omissions. No hold clipping (the
  producers already clip to the analyzed interval, plan :313-315). Named invariant: with any
  complete trace, `horizonEndWeek >= claims.horizonEndWeek` (the kernel's `validateTraces` :511
  is an input-invariant Error, not a cap; 538's `windowClipped` workaround must NOT be repeated).
  Spans beyond `limits.span` are the producer's/kernel's `sizeLimit` → truthful UNCERTIFIED.
- `capacityInputsDigest(input)` — `fnv1a64(JSON.stringify(…))` over the assembled input WITHOUT
  `preparationWork` (539-B Q6: the Ready producer's bill walks ledger/career/history rows, so
  including it would couple the digest to cash and unrelated history against plan :73-76);
  `kernel.workUsed` is carried on the result instead.
- `mapCapacityResult(result, inputsDigest): DetachedOfferClassification` — CERTIFIED_ACHIEVABLE
  and ALREADY_MET → REASONABLY_ACHIEVABLE with `bottleneck null` (plan :276-277; the read settles
  nothing); PROVEN_FRAGILE → FRAGILE with a reason (the PRESENCE of a prior-path-protection
  bottleneck is plan law :300-302, wording routine); PROVEN_IMPOSSIBLE → IMPOSSIBLE for the
  OFFER only, `scope 'jointOfferOnly'` carried on `kernel`; UNCERTIFIED (domainIncomplete /
  workLimit / sizeLimit) → FRAGILE with EXACTLY `bounded capacity analysis could not certify this
  schedule` (plan :125-126). The result type is deliberately NOT a `PromiseFeasibilityReceipt`
  (no `rulesVersion`, no `week`): D1 stays open. `classifyDetachedOffer(...)` composes the three.
- Lawful under D1 (a) as the evaluator-5 front end, (b) as the first part of 26 §2 row 3's
  adapter, (c) as a limits pass-through; under D2 coverage stays what the producers report.

## 2. Not in this slice (unchanged from 539-A §2, each with its controlling line)

No enumerator (13; 537 §4); no live wiring (537 §2; 26 §2 row 3); no `PROMISE_RULES_VERSION`
change and no receipt fields (D1; 23); no Save/projection/schema change (26 §3-§4); no synthetic
receipts or test loosening (23; plan :128-129); no kernel or producer change (538's admission bill
and single-admission structure are D2 items, `538-admission-bill-contract-review.md`); no
`breakPromisesOnCancel` decoupling (26 :69-79). One item carried for D2, not settled here: with a
capped kernel whose bill depends on unrelated history, "same digest ⇒ byte-equal receipt"
(types.ts:2163-2164) and "exclude unrelated history" (plan :73-76) cannot both hold; the adapter
follows the plan's explicit text.

## 3. Adopted RED brief and writer scope

T1 (test-author, next): ONE new file `tests/p14b4-owner-adapter-first-slice.test.ts` implementing
539-A §3 items 1–15 with 539-B's refinements (RED 3 foreign debits via a detached `ClaimSource`
fixture including the other-person rival root dropped; RED 4 mirrors the installed conflicting case,
both lead and antagonist tagged `['lead']`; RED 5 second half labelled a non-live arithmetic pin;
RED 7 may use the Started producer on `w.ready` (538 scenario 1) for the byte-identity pin; RED 12
pins digest independence from `preparationWork` and runs the cash/RNG variants through the STARTED
producer on `w.ready`) plus 539-B's additions (i) count-only P2 root → all three seats, (ii) bound
target with a real take → ALREADY_MET → REASONABLY_ACHIEVABLE/null, (iii) `limits.work 200001`
refused by the kernel, (iv) exact half-open edges excluded, (v) malformed target → named throw.
In-memory tagged variants only (never `live()`/`makeSave` on tagged state; 23, 537-B G4); imports
from module paths; the T1 law applies: a missing module/export RED is named as such, never claimed
as reached-assertion coverage.

T2 (ONE sim-core writer, after the RED is recorded): writable `src/core/promiseCapacityOwners.ts`
(new) and `src/core/promises.ts` lines 548/555 ONLY (`export` + `Pick` parameter type, zero body
change; 539-B Q3: no typecheck risk found, no B4 RED set can move). Checks, serial, fixed source:
the new file GREEN; kernel 41, hold-order 5, sort 7, sort-owners, the replay groups (Ready 17 PASS +
sole stale FAIL, Started 28), material 17 byte-identical; `p14b1-*`, `p14b2-*`, `p14b3-*`,
`p14bf2-*`, `bridge-p14b1-promises`, `bridge-p14b3-promise-command` and the twelve historical
save files pass/fail-set identical; the six B4 live-P2 groups byte-identical to 536; root/UI
typecheck clean; bridge typecheck unchanged with its sole OLD TS2353. Then independent review of
the landed module against 539-A + 539-B + 13/14 before any enumerator slice.

## 4. Verbatim specialist reports

As returned, unedited; advisory. §1–§3 above is the parent's adjudication.

### 4.1 — 539-A (sim-core, READ-ONLY design note)

```text
# 539-A — READ-ONLY design note: detached owner-adapter FIRST slice

**Status: DONE (proposal only).** No worktree file created or edited, no vitest/tsc/npm, no Git, no network. `tests/p14b4-capacity-budget-measurement.test.ts` not opened. 538 facts folded in from the hand-back at `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/538-M-report.md`.

**Model observed:** claude-fable-5-1 (Fable 5.1), Claude Code agent harness.

**Worktree/HEAD:** `/Users/zacheryspector/The-Movies-headless-program` at `79b7a738d6e229e6e9b26a1c431f6fcb1240a6ad`, `git status` = only the (since-removed) untracked measurement file.

## Sources read (line ranges)

- `docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md` :90-139, :245-329
- `evidence/p14bf2-20260919/13-p2-owner-adapter-preparation.md` 1-111; `14-p2-owner-adapter-review.md` 1-34
- `evidence/p14b4-20260919/537-…decision-items.md` :34-116 (§2-§4), 537-A §3 (items 1-5), 537-C Q1-Q3, Q6-Q7, defects; `26-live-cutover-implementation-map.md` 1-197; `23-capacity-first-red-disposition.md` 1-39
- `src/core/promiseCapacityKernel.ts` :1-330 (types, MAX_LIMITS, Budget, holdValue, normalizeBase, pictureValue), :383-522 (normalizeTraces, validateTraces), :929-1047 (classifyDomain, runCapacity, exports)
- `src/core/promiseCapacityOwnerReplay.ts` :1-330 (public types, ContextCut, LITERAL, Work), :534-900 (prepare, fixed holds, checkForeignRelevance), :1767-1804 (completeTrace ownerFactRefs), :2680-2797 (replayPlans tail, exports)
- `src/core/promises.ts` :1-120, :120-260, :260-430, :430-530, :530-600, :600-700, :806-830; `src/core/types.ts` :2120-2250; `src/core/index.ts` :1390-1435 (+ grep: neither kernel nor replay is exported from index); `src/core/math.ts` :91-98 (`fnv1a64(text): string`); `src/core/talentMarket.ts` :745-780, :1225-1300 (`attachedFeasibility`, `authorRivalPromise`), :298-334 (proposalDraft: `startWeek = effectiveWeekFor(...)`); `src/core/tuning.ts` :30, :377-378, :392; `src/core/save.ts` :6396 (`LIVE_SAVE_VERSION = 29`)
- `tests/p14b4-ready-replay-first-take.test.ts` 1-330; `tests/p14b4-cast-class-capacity.test.ts` 1-366; `tests/p14b4-capacity-kernel.test.ts` 1-140 + assertion index of 140-486; `package.json` scripts; `tests/` roster

## 1. Exact pure API (new module `src/core/promiseCapacityOwners.ts`, no live importer, NOT exported from `index.ts`, mirroring the kernel and replay which are also not index-exported)

Imports allowed: `./math.js` (fnv1a64), `./promises.js` (two helpers, see 1.5), `./promiseCapacityKernel.js` (types + `searchPromiseCapacityTraces`), `./types.js`. Forbidden per 13: `actions`, `tick`, `queueAdmission`, `hollywoodTick`, `talentMarket`, `promiseCapacityOwnerReplay` (the adapter consumes a producer RESULT, it never runs the producer; the caller/enumerator does).

'''ts
export const UNCERTIFIED_BOTTLENECK = 'bounded capacity analysis could not certify this schedule' // plan :125-126, exact
export const NO_ENUMERATOR_OMISSION = 'explicit supplied plans only; owner alternatives are not enumerated'

export type ClaimSource = Pick<GameStateV30, 'promises' | 'firstTakes' | 'talentMarket' | 'market' | 'hollywood'>
export type CapacityLimits = JointTraceCapacityInput['limits']        // {claims, units, alternatives, work, span}, each <= kernel MAX_LIMITS (:117)

export type CollectedClaims = Readonly<{
  issuerId: string
  now: Boundary                                  // { week: state.market.tick, step: 0 } — the ONE calendar; never draft.startWeek
  target: JointTraceCapacityInput['target']      // { promiseId: draft.promiseId ?? null, personId, mask, window, state, count, actualQualifiedCount }
  priorClaims: readonly PriorClaim[]             // same issuer, any beneficiary, sorted by promiseId
  foreignDebits: readonly ForeignDebit[]         // other issuers, target person only, sorted by promiseId
  claimPersonIds: readonly string[]              // sorted unique: target person + every priorClaim.personId; hand to the producers' claimPersonIds
  horizonEndWeek: number                         // max(target.window.dueWeekExclusive, ...priorClaims[].window.dueWeekExclusive): the span law's "latest relevant due-exclusive"
  coverage: Readonly<{ claimsAndHolds: 'complete' | 'incomplete'; omissions: readonly string[] }>
  work: number                                   // deterministic collection tariff, see 1.6
}>
export function collectPromiseClaims(state: ClaimSource, draft: PromiseDraft): CollectedClaims
'''

Collection law (1:1 with `activePromiseReservations` promises.ts:274-283 = B3, widened only where the plan says "Include ALL relevant prior obligations" :258-259):

- `attached = new Set(state.talentMarket.proposals.flatMap(p => p.promises))`.
- Member iff `outcome === null && (contractId !== null || attached.has(promiseId)) && promiseId !== draft.promiseId && dueWeekExclusive > max(now.week, draft.windowStartWeek) && windowStartWeek < draft.dueWeekExclusive`. This is byte-for-byte the kernel's `overlapWindow` (:162-165), so every emitted `PriorClaim` survives `normalizeBase`'s `prior must overlap the relevant target interval` invariant (:281).
- `membership = contractId !== null ? 'bound' : 'current'`.
- Local issuer (`issuerStudioId === draft.issuerStudioId`) → `PriorClaim { promiseId, issuerId, personId: beneficiaryPersonId, membership, mask: promiseCastSlots(promise), window: {windowStartWeek, dueWeekExclusive}, remaining }`. Includes OTHER beneficiaries of the same studio: the cross-beneficiary claims the B3 scalar filters out by `beneficiaryPersonId` (:280) and which 537-A §3 identified as the 15th-case gap.
- Other issuer AND `beneficiaryPersonId === draft.beneficiaryPersonId` → `ForeignDebit { promiseId, issuerId, personId, membership, sourceWindow: window, remaining }` (plan :95: other studios' other beneficiaries do not consume this studio's lead; the kernel drops them anyway at :999-1003).
- `remaining = max(0, predicate.count − qualifyingTakes(state, promise).length)` (plan :273-275; `qualifyingTakes` already counts distinct productionIds, issuer-matched, half-open window, class-masked, promises.ts:555-569). Zero is emitted, not dropped (kernel accepts 0-unit priors).
- Mask by predicate SHAPE only (promises.ts:548-553): no `kind` → all three seats regardless of family; `seatClass 'lead'` → `['lead']`; `'leadOrAntagonist'` → `['lead','antagonist']`. The target mask uses the same helper on `draft.predicate` (a tagged P2 draft carries `kind/seatClass` structurally; `'kind' in` detects it at runtime).
- Target: `state: 'bound'` iff `draft.promiseId` names a root with `contractId !== null`; `actualQualifiedCount = qualifyingTakes(state, root).length` for bound, else `0` (the kernel ignores it when unbound, :985-986).
- Members whose window is empty (`start >= due`) or `count < 1` are excluded silently as zero-demand: exact, not conservative (they can never be served and reserve no seat); the kernel would otherwise throw `window must be nonempty`. Non-integer counts are passed through so the kernel's `integer()` throws (fail loud; a validator matter).
- Rival/industry guard: if `state.hollywood === null` or `draft.issuerStudioId !== state.hollywood.playerStudioId`, return empty claim lists with `coverage.claimsAndHolds = 'incomplete'` and omission `'claims are collected for the player studio only; rival policy is not replayed'`. Otherwise `'complete'`, `[]`.

'''ts
export type ProducerResult = Readonly<{                                   // ReadyOwnerReplayResult and StartedOwnerReplayResult<P> both satisfy this structurally
  fixedHolds: readonly FixedHold[]
  attempts: readonly (Readonly<{ kind: 'complete'; trace: JointOwnerTrace }>
                     | Readonly<{ kind: 'cut'; traceKey: string; reason: string; detail: string }>)[]
  preparationWork: number
  omissions: readonly string[]
}>
export function assembleCapacityInput(claims: CollectedClaims, producer: ProducerResult,
  horizonEndWeek: number, limits: CapacityLimits): JointTraceCapacityInput
'''

Assembly is exactly the first-take test's hand construction (test :314-321) with the coverage derived, never asserted:

- `{ mode: 'jointOwnerTraces', now: claims.now, horizonEndWeek, issuerId: claims.issuerId, target: claims.target, priorClaims, foreignDebits, traces: producer.attempts.filter(complete).map(a => a.trace), fixedHolds: producer.fixedHolds, coverage, preparationWork: producer.preparationWork + claims.work, limits }`.
- `coverage.claimsAndHolds = 'complete'` iff `claims.coverage.claimsAndHolds === 'complete' && producer.attempts.every(complete) && producer.omissions.length === 0`; else `'incomplete'`. `existingCalendars = 'incomplete'`, `allOwnerTraces = 'incomplete'` ALWAYS in this slice (no enumerator). `omissions` = sorted unique of `[...claims.coverage.omissions, ...producer.omissions, ...cuts.map(c => `${c.reason}: ${c.detail}`), NO_ENUMERATOR_OMISSION]`.
- Hold clipping: none performed. The producer already emits fixed holds `from: now, until: end, replaceableFrom: now` (replay :753-760) and unknown-release person holds to the horizon (test :272-275); that IS plan :313-315 ("clip … without inventing their release"). The adapter copies `fixedHolds` and traces by reference.
- Horizon guard (throw, named): `invariant(producer.attempts.every(cut) || horizonEndWeek >= claims.horizonEndWeek, 'producer horizon precedes the latest relevant due week; run the producer to claims.horizonEndWeek')`. Reason: the kernel's effective horizon is `max(horizonEndWeek, target.due, prior dues)` (:1005-1006) and `validateTraces` THROWS `unknown release occupancy must cover the effective horizon` (:511) for a complete unknown-release picture whose holds stop earlier. 538 worked around this by clipping the target window (`windowClipped:true`); the adapter must never clip the target window (that changes the question). Spans beyond `limits.span` are not this guard's business: the producer cuts `sizeLimit` and the kernel returns `UNCERTIFIED/sizeLimit` before `validateTraces` (:1010-1015), so a huge due yields truthful UNCERTIFIED, not a throw.
- The 12+208=220 allowance is not computed here: `limits` are the caller's, capped by the kernel (`MAX_LIMITS` :117, refusal :977) and the producer (`limits may only lower the published caps` :2679). Constants behind 220 for the record: `TUNING.HIRING_RENEWAL_WINDOW_WEEKS: 12` (tuning.ts:392, the proposal start offset via `effectiveWeekFor`, talentMarket.ts ≈:316) + `TUNING.CONTRACT_MAX_WEEKS: 208` (:377; `HOLLYWOOD_CONTRACT_WEEKS: 208` :30).

'''ts
export function capacityInputsDigest(input: JointTraceCapacityInput): string   // fnv1a64(JSON.stringify(input)) — the same primitive as receipt():212 and promiseDigest():151

export type DetachedOfferClassification = Readonly<{
  classification: PromiseClassification          // 'REASONABLY_ACHIEVABLE' | 'FRAGILE' | 'IMPOSSIBLE'
  bottleneck: string | null                      // null iff REASONABLY_ACHIEVABLE (types.ts:2157-2159 law)
  inputsDigest: string
  kernel: Readonly<{ status: CapacityKernelResult['status']; reason: string | null; workUsed: number; omissions: readonly string[] }>
}>   // deliberately NOT assignable to PromiseFeasibilityReceipt: no rulesVersion, no week
export function mapCapacityResult(result: CapacityKernelResult | JointTraceCapacityResult, inputsDigest: string): DetachedOfferClassification

export function classifyDetachedOffer(claims: CollectedClaims, producer: ProducerResult,
  horizonEndWeek: number, limits: CapacityLimits): DetachedOfferClassification
  // const input = assembleCapacityInput(...); return mapCapacityResult(searchPromiseCapacityTraces(input), capacityInputsDigest(input))
'''

Mapping table (only the UNCERTIFIED string is law; the others are proposals, routine for writer/test-author):

| kernel | classification | bottleneck |
|---|---|---|
| `CERTIFIED_ACHIEVABLE` | REASONABLY_ACHIEVABLE | `null` |
| `ALREADY_MET` (remaining 0, bound) | REASONABLY_ACHIEVABLE | `null` (plan :276-277: met, not a failed probe; the read settles nothing; `kernel.status` keeps the distinction for the later live slice) — reviewer to confirm |
| `PROVEN_FRAGILE / achievableProbeFailed` | FRAGILE | `'the promised count fits, but no schedule keeps a spare picture, existing paths and slack together'` |
| `PROVEN_FRAGILE / priorPathProtection` | FRAGILE | `'the promised count fits only by moving an earlier promise off its existing path'` |
| `PROVEN_IMPOSSIBLE / completeCountFailure` | IMPOSSIBLE | `'no lawful joint schedule reaches the promised count inside the window'` (offer only; `kernel.status` carries `scope: 'jointOfferOnly'` semantics; the module exports nothing taking a Production/cancel context, so it cannot feed `breakPromisesOnCancel`) |
| `PROVEN_IMPOSSIBLE / certifiedUpperBound` | IMPOSSIBLE | `'a certified upper bound on qualifying pictures is below the promised count'` (typed but not emitted by `classifyDomain` today) |
| `UNCERTIFIED` (domainIncomplete / workLimit / sizeLimit) | FRAGILE | `UNCERTIFIED_BOTTLENECK` exactly; reason and omissions only in `kernel` |

Digest: whole assembled input, including `preparationWork` (it determines the result via the cap) and `limits`. It changes with class (target.mask), claims, producer traces/holds; it does not change with cash or `rngState` because neither the collection nor `prepare`/`admitReady` reads them (replay reads market.tick, productions, workflows, sets, development, casting, hollywood businesses, technology; "no forecast, affordability" :2795). Alternative if the reviewer prefers: exclude `preparationWork` from the digest; one line either way.

### 1.5 `qualifyingTakes` / `promiseCastSlots`: export, do not duplicate

Both are module-private (promises.ts:548, :555). 26 §1 asks for exactly this reusable helper "typed against ProfessionalPromiseV30 and only the first-take input it reads"; 26 §2 row 4 makes it the ONE class-qualified-takes law the weekly owner and the adapter share. Lawful change, two signatures, zero body change:

'''ts
export function promiseCastSlots(promise: Pick<ProfessionalPromiseV30, 'predicate'>): readonly CastSlot[]     // :548
export function qualifyingTakes(state: Pick<GameStateV30, 'firstTakes'>, promise: ProfessionalPromiseV30): readonly FirstTakeReceipt[]  // :555, add `export` only
'''

Duplicating them in the new module is the fallback if the parent refuses any `promises.ts` edit; it creates a second authority that the cutover must collapse and I do not recommend it. No `index.ts` re-export is needed (the RED imports from `../src/core/promises.js` as the cast-class test already does).

### 1.6 Work accounting: charge, through `preparationWork`

`Work` (replay) and `Budget` (kernel) are both module-private; the only shared entry is the kernel's `preparationWork` (Budget constructor :171-173; `>= limit` → `UNCERTIFIED/workLimit` :982). Proposal: `claims.work = 1 + P + A + M × T` with P = `promises.length`, A = Σ `proposals[].promises.length`, M = members whose takes were counted (priorClaims + foreignDebits + bound target), T = `firstTakes.length`; assembly sets `preparationWork = producer.preparationWork + claims.work`. Deterministic, permutation-invariant (counts only), safe-integer for any admitted save. Why charge rather than declare free: plan :316-318 ("Charge/cap preprocessing too") and the sibling producer charges its own linear scans (e.g. `for (const take of source.firstTakes) work.pay(5)` :686-689); the M×T term is not linear when several claims exist. The plan's "Beyond linear inspection of owner collections, work is budgeted" (:318) is the reading under which collection would be free; I recommend charging for consistency with the producer, and the cost is negligible (tens of units).

### 1.7 Rival context

Structural: the module has no live importer and imports nothing from `talentMarket`/`hollywoodTick`, so `authorRivalPromise` (talentMarket.ts:1260-1276) cannot reach it in this slice. Defence in depth: `collectPromiseClaims` refuses a non-player issuer as `claimsAndHolds: 'incomplete'` + named omission (1.1), and a producer run for a rival cuts every plan `rivalPolicyUnsupported` (replay :621-622), which assembly turns into `'incomplete'`; the kernel then returns `UNCERTIFIED/domainIncomplete` (:1024) → FRAGILE + exact string → nonofferable. It never throws on a rival issuer (a throw inside a rival policy pass would crash the tick). For the later live slice: gate the issuer before calling the adapter (537-A §3 item 4: "Must stay unwired for rivals"), not after.

## 2. Not in this slice (controlling line)

- No enumerator over Ready scripts / stock door / staffing alternatives: 13 "Smallest proposed architecture" second clause and 537 §4 item 2 ("Enumerator is a separate reviewed slice"). Coverage `existingCalendars`/`allOwnerTraces` stay `'incomplete'` with `NO_ENUMERATOR_OMISSION`; the adapter never claims completeness (538: only an author-ASSUMED complete coverage yields PROVEN_*).
- No live wiring into `promiseFeasibility` :366-413, `attachedFeasibility` talentMarket.ts:757-773, `authorRivalPromise` :1260, `breakPromisesOnCancel` :656: 537 §2 ("No production change is lawful for the live-P2 scope until D1"), 26 §2 row 3.
- No `PROMISE_RULES_VERSION` change and no `rulesVersion`/`week` on the result: D1 (537 §3), 23 ("Do not … bump only the rules literal"). The result type is structurally not a receipt.
- No Save/projection/schema/wire change: 26 §3-§4; Save29/rules3/projection46 frozen (537 §4 last line).
- No synthetic receipts, no fixture/test loosening (23; plan :128-129), no change to `tests/p14b4-cast-class-capacity.test.ts`'s `rulesVersion 4` pin (D1).
- No kernel or producer change. Not required for the slice. Two producer facts are LIMITS, not blockers, and belong to the enumerator/replay-reduction tracks: (a) `admitReady` runs once at source-now, so a Ready trace holds at most one fresh picture and B=2 is unreachable on a 0-production fixture (538 structural fact; replay :554-556 "source-now ordinal zero is reserved for admission"); (b) Ready plans on `world().opened` cut `workLimit` at `{45,0}` inside `admitReady` (538 scenario 2/0). If the parent wants B=2 through the kernel, that is a producer change (C1/C5-C7, 515 §3) or D1(c), to be named as such, not folded in here.
- No `breakPromisesOnCancel` decoupling (26 :69-79): separate correction; the adapter exposes no causal entry.

## 3. RED list for the test-author (names + pinned facts; new file, e.g. `tests/p14b4-owner-adapter-first-slice.test.ts`; import from module paths, not `index`; build tagged variants IN MEMORY, never through `live()`/`makeSave`, since the strict V29 writer refuses `predicate.kind`, 23/537-B G4)

1. `collects bound-open P1 roots on world().ready as generic-mask prior claims` — target = lead person's root (draft via the capacity test's `shortDraft` shape with `promiseId`): `priorClaims` = antagonist + support roots, `membership 'bound'`, `mask ['lead','antagonist','support']`, `remaining 1`, `window [start, start+52)`; `foreignDebits []`; target `state 'bound'`, `actualQualifiedCount 0`; `claimPersonIds` = the three actor ids sorted; `horizonEndWeek = start+52`; coverage complete.
2. `self-exclusion and abandoned roots` — same draft without `promiseId` → the lead root becomes a third prior claim; a root with `outcome !== null` or (`contractId null` and not attached) never appears (`w.opened` after a `withdrawProposal`, per capacity test :279-296 shape).
3. `current attached draft is a 'current' claim on w.opened` — attach a P2 lead draft to another actor in memory via `attachPromise` (lawful on V29 as count-only? no: use a P1 attachment for the V29-lawful current case, and an in-memory tagged root for the mask case) → `membership 'current'`, mask by shape; foreign debits = rival proposals' attached promises for the target person if any exist at `opened` (pin by membership predicate, not by count).
4. `conflicting tagged lead claim on the antagonist person is a ['lead'] prior claim` — in-memory `shortVariants` shape on `w.ready` (no `live()`): antagonist root `{kind:'castRoleCount', count:1, seatClass:'lead'}`, window `[now, now+2)`; target = support root → prior claims: antagonist `mask ['lead']`, lead person `mask any`.
5. `remaining clips at zero and reads actual class-qualified distinct takes` — in-memory root `count: 2` on `w.ready`, then `tick` → take at now+1, root open with `progress 1` → `remaining 1`; in-memory variant with `count 1`, real take, `outcome` forced `null` (labelled probe) → `remaining 0`, still emitted.
6. `empty-window / zero-count attached drafts demand nothing` — excluded, no omission, coverage complete.
7. `assembly is byte-identical to the first-take hand assembly` — re-run the first-take route (or its `baseReady` + one Ready plan), then `expect(assembleCapacityInput(claims, result, horizon, limits)).toEqual({ ...hand, coverage: { ...hand.coverage, omissions: [NO_ENUMERATOR_OMISSION] }, preparationWork: result.preparationWork + claims.work })`; every other field byte-equal (`priorClaims: []`, `coverage.claimsAndHolds 'complete'`, calendars/traces `'incomplete'`).
8. `cut attempts and producer omissions make claimsAndHolds incomplete and are carried as omissions` — 538 fact (2): any Ready plan on `world().opened` cuts `workLimit` at `{45,0}` with `preparationWork 200000`; assembly → `traces []`, `claimsAndHolds 'incomplete'`, omissions include `'workLimit: shared replay work limit'` and the producer's `'work limit; remaining plan suffixes unexecuted'`; full `classifyDetachedOffer` → `kernel.status 'UNCERTIFIED'`, `reason 'workLimit'`, `workUsed 200000`, classification FRAGILE, bottleneck `=== UNCERTIFIED_BOTTLENECK`. Do NOT assert REASONABLY_ACHIEVABLE for the 40-week baseline on `opened` through this slice: unreachable (538 facts 2 and the one-fresh-picture-per-trace structure).
9. `2-week fixed-cast cells reach the kernel within budget and map UNCERTIFIED/domainIncomplete` — 538 fact (1): `replayStartedProductionPlans` on `w.ready` (plan `{traceKey, commands: []}`, horizon `now+2`, `claimPersonIds` from claims) costs ≈108,265; kernel +4.2-4.5k; total ≤ 112,722 ≤ 200,000. For the matrix cells (target mask lead / flexible / any, others as P1 priors, in-memory 2-week windows) and the conflicting case (RED 4): `kernel.status 'UNCERTIFIED'`, `reason 'domainIncomplete'`, `workUsed ≤ 200000` and `> producer.preparationWork`, classification FRAGILE, bottleneck exact string. The installed capacity RED's `IMPOSSIBLE`/`FRAGILE with bottleneck !== UNKNOWN_CAP` for these cells is NOT asserted here; that needs the enumerator's complete coverage (538: assumed-complete coverage gives PROVEN_FRAGILE/PROVEN_IMPOSSIBLE, an observation, not a certificate).
10. `mapCapacityResult covers all five kernel statuses` — feed real results from the kernel test's detached finite fixtures (`searchPromiseCapacity` optional mode: the `achievable`, `fragile(achievableProbeFailed)`, `fragile(priorPathProtection)`, impossible, ALREADY_MET and UNCERTIFIED cases in `tests/p14b4-capacity-kernel.test.ts`) → classification/bottleneck per the table; bottleneck `null` iff REASONABLY_ACHIEVABLE; UNCERTIFIED bottleneck is the exact string for all three reasons and never contains omissions text; result has no `rulesVersion`/`week` keys.
11. `IMPOSSIBLE is offer-scoped` — `kernel.status 'PROVEN_IMPOSSIBLE'` retained; the module's export list contains no function accepting a `Production` or cancel context (`Object.keys(module)` pin).
12. `inputs digest changes with class and claims, not with cash or RNG` — same state, target mask `['lead']` vs `['lead','antagonist']` → different digest; `studio.cash + 1` and `rngState '1,2,3,4'` variants → identical digest AND identical classification (state shapes from capacity test :322-335).
13. `rival issuer is nonofferable, never thrown` — `collectPromiseClaims(state, {…issuerStudioId: rivalId})` → empty claims, `claimsAndHolds 'incomplete'`, named omission; with a producer result for that issuer (all cuts `rivalPolicyUnsupported`) → FRAGILE + exact string; no exception.
14. `no state mutation, determinism, permutation invariance` — `structuredClone` equality of `state`, `draft`, producer result, assembled input before/after; shuffling `state.promises` and `talentMarket.proposals` order yields identical claims, `work`, digest and classification; `work === 1 + P + A + M×T` (pin the formula the writer lands).
15. `horizon guard` — a complete unknown-release trace produced with horizon `< claims.horizonEndWeek` → assembly throws the named message; a target due `now + 221` with no complete trace → no throw, `kernel.reason 'sizeLimit'`, FRAGILE + exact string.

## 4. Writable paths and acceptance checks for the eventual writer

Writable: `src/core/promiseCapacityOwners.ts` (new); `src/core/promises.ts` lines 548 and 555 ONLY (`export` + `Pick` parameter type, no body change), flagged as the one path outside "new module"; nothing else (`index.ts` untouched unless the test-author insists on index imports). No kernel, producer, test, fixture, tuning, save, bridge or doc edits.

Checks, serial, fixed source, package commands only (`npm run test:core -- <file>` = `vitest run --project core <file>`; `npm run typecheck`; `npm run typecheck:bridge`), raw outputs preserved:
1. new RED file → GREEN.
2. `tests/p14b4-capacity-kernel.test.ts` (41), `tests/p14b4-kernel-hold-order-extension.test.ts`, `tests/p14b4-ready-replay-first-take.test.ts`, `tests/p14b4-ready-replay-stale-target.test.ts` (and the other `p14b4-*replay*` groups), `tests/p14b4-material-evidence-core.test.ts` (17), `tests/p14b4-bounded-stable-sort.test.ts`, `tests/p14b4-bounded-sort-owners.test.ts`: pass sets identical to HEAD.
3. Because `promises.ts` gains two exports: `tests/p14b1-*`, `p14b2-*`, `p14b3-*`, `p14bf2-*` groups pass/fail-set identical.
4. `tests/p14b4-cast-class-capacity.test.ts`, `p14b4-cast-class-outcomes`, `p14b4-cast-class-policy`, `p14b4-save-v30-compatibility`, `bridge-p14b4-runtime47-compatibility`, `bridge-p14b4-cast-class`: pass/fail sets byte-identical to 536 (still RED at the same stop points).
5. `npm run typecheck` (root + UI) clean; `npm run typecheck:bridge` unchanged with its sole OLD TS2353.
Independent review of the landed module against this note and 13/14 before any enumerator slice.

## 5. Dependence on D1/D2

- D1(a) (4 = scalar, kernel = 5): the slice is the evaluator-5 front end; unstamped, detached, unchanged. The RED lives in its own file with no version pin, so the capacity file's pin move at 5 does not touch it.
- D1(b) (4 = kernel-backed): the slice is the first mandatory part of the adapter 26 §2 row 3 installs; unchanged.
- D1(c) (caps/tariffs revisited): `limits` are caller inputs capped by kernel `MAX_LIMITS` and the producer; the adapter passes them through and adds only its small tariff; unchanged unless the Owner also changes how preprocessing is charged (1.6 alternative).
- D2 / 538: fact (1) means the 2-week fixed-cast cells and the conflicting-claim case flow through THIS slice within budget, but only as UNCERTIFIED with the producers' supplied coverage (RED 9); turning them into PROVEN_* is the enumerator slice's job (declare `existingCalendars`/`allOwnerTraces` complete only when it can prove the Ready scripts cannot take inside the 2-week window). Fact (2) means the 40-week baseline (`REASONABLY_ACHIEVABLE` on `opened`) is unreachable through the current Ready producer regardless of this slice or the enumerator (workLimit at admission; one fresh picture per trace vs B=2); resolving it needs producer reductions (C1/C5-C7), D1(c), or D1(a)'s scalar for launch. Nothing in the adapter's law changes under either outcome; only the expected `kernel.reason` in the RED (`domainIncomplete` on `ready`, `workLimit` on `opened`).

## 6. Evidence limits

Paper only: nothing typechecked or executed. 538 numbers are taken from the hand-back, not re-measured. The `work` formula, bottleneck strings other than the UNCERTIFIED one, `ALREADY_MET` mapping and the `preparationWork`-in-digest choice are recommendations for the reviewer. Foreign debits on `w.opened` (RED 3) are inferred from `authorRivalPromise`'s attach path, not observed. Not read: `admitReady` body (2024-2557), kernel search internals (:522-930), `effectiveWeekFor`, `occupancy.ts`, `tests/helpers/p14b2-fixtures.ts`, the V29 validator's window/count checks (:830-1023). No native, usability, Save30, projection47 or Owner-acceptance claim.

**Next concrete action:** independent review of this note (contract-auditor), then the test-author writes the RED file per §3 (importing from module paths, in-memory tagged variants), then release ONE sim-core writer with §4's paths and check list.
```

### 4.2 — 539-B (contract-auditor, READ-ONLY review)

```text
# 539-B — independent READ-ONLY review of 539-A (detached owner-adapter first slice)

**Status: DONE (read-only).** No file created or edited, no vitest/tsc/npm, no Git, no network, no delegation. Every statement about a future test outcome is paper analysis from source and test bodies, not an executed result.

**Model observed:** the harness identifies this session as Fable 5.1 (`claude-fable-5-1`); I cannot verify beyond the system prompt. The lean-ctx MCP tools named in the user CLAUDE.md were not available; Read/Glob/Grep only.

**Worktree/HEAD:** `/Users/zacheryspector/The-Movies-headless-program`, git status snapshot clean at `e3c6dd2` (docs only since `69d16f8`). All line numbers are from files as read now.

## Sources read (line ranges)

Note under review: `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/539-A-report.md` 1-178 (whole).
Plan `docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md` :60-339. Records (`docs/engineering/playability-launch-review/evidence/`): `p14bf2-20260919/13` (whole), `14` (whole); `p14b4-20260919/26` (whole), `537` :1-323 and :400-570 (§1-§4, 537-B tail, 537-C whole), `538` :1-199 (whole incl. verbatim lines), `23` (whole), `17-outcome-mode-premise-correction.md` (whole), `176` :1-60.
Source: `src/core/promiseCapacityKernel.ts` :1-330, :383-632, :929-1047; `src/core/promiseCapacityOwnerReplay.ts` :1-330, :534-773, :795-838, :2024-2113, :2660-2797; `src/core/promises.ts` :1-120, :120-600, :600-709, :800-1028; `src/core/types.ts` :2120-2254; `src/core/math.ts` :85-98; `src/core/talentMarket.ts` :287-333, :745-780, :1225-1300; `src/core/hollywoodTypes.ts` :120-139; `src/core/tuning.ts` :30, :59, :377, :392 (grep); `src/core/productionIdentity.ts` (grep ledger/careerEvents); `src/core/index.ts` (grep promises exports); grep of `src` for kernel/replay importers.
Tests: `tests/p14b4-ready-replay-first-take.test.ts` :180-330; `tests/p14b4-capacity-kernel.test.ts` :1-150 + status grep; `tests/p14b4-cast-class-capacity.test.ts` :1-366 (whole); `tests/p14b4-material-evidence-core.test.ts` :1-120 + grep of `tick(`/`spyOn`/`validateState`.

## Answers

### Q1 — Claim membership. Verdict: KEEP, one minor REFINE (current-claim remaining).

- Widened membership is what the plan requires. Plan :94 "same-studio shared lead/antagonist/support capacities BOTH constrain P2"; :258-259 "Include ALL relevant prior obligations; never maximize a number of winners by dropping one inconvenient beneficiary"; :92-93 "Preserve competing-current cross-issuer treatment as a separate rule"; :95 "Other beneficiaries at another studio do not consume this studio's lead"; :262-263 "Keep foreign CURRENT alternatives under existing conservative debit". Kernel types `PriorClaim` (:22-25, any local person) and `ForeignDebit` (:26-29). The kernel's own foreign filter is `debit.issuerId !== input.issuerId && debit.personId === input.target.personId && debit.promiseId !== input.target.promiseId && debit.remaining > 0 && overlapWindow(...)` at **:992-997** (the note and the brief cite :999-1003; :998-999 is the horizon fold). Dropping other studios' other beneficiaries: lawful (plan :95; kernel :994 would drop them anyway).
- B3 consistency: `activePromiseReservations` promises.ts:274-283 is `outcome === null && (contractId !== null || attached) && promiseId !== draft.promiseId && beneficiaryPersonId === draft.beneficiaryPersonId && dueWeekExclusive > from && windowStartWeek < draft.dueWeekExclusive`. The note's set restricted to the target person equals the B3 set (same-issuer same-person → PriorClaim; other-issuer same-person → ForeignDebit). Superset relation holds; the per-beneficiary scalar filter is exactly the 537-A §3 15th-case gap.
- Overlap predicate: kernel :162-165 `source.dueWeekExclusive > Math.max(now.week, target.startWeek) && source.startWeek < target.dueWeekExclusive`. The note's predicate is byte-equal with `now = {market.tick, 0}` and target window = draft window, the same values `normalizeBase` uses at :280. `normalizeBase` cannot throw on overlap, issuer (:278, by construction), nonempty window (:147, by the exclusion), duplicate ids (:274; validator :907 guarantees uniqueness), mask shape (:150-158; `promiseCastSlots` returns exactly the three admitted shapes in SLOTS order).
- Empty-window / count<1 exclusion: exact, not conservative. Such a member has zero demand and can never be credited; dropping it cannot increase winners (plan :258-259 is about obligations, and a zero-count row is not one). 13 :95-99's explicit-omission list concerns staffing/facility/start alternatives, not claims. No omission required. Note the empty window case must be an explicit exclusion because `[70,70)` passes the overlap predicate and would reach `windowValue` (:147) and throw. Such roots are in-memory only: the V29/V30 validator refuses `count < 1` (:931) and `due <= start` (:936), but `attachPromise` stages any draft (:489-506; the capacity test's huge cases :346-365 rely on that).
- Minor REFINE (fidelity, not blocking): the note computes `remaining = count − qualifyingTakes` for every member. For BOUND priors that is the plan's rule by analogy to :273-275 (fresh evidence, never a stale counter). For CURRENT priors and foreign debits, B3's existing debit is `count − progress` (promises.ts:287) with `progress` 0 for an unbound root, i.e. `count`; plan :273 makes the unbound target's X its full count and :262-263 says keep foreign CURRENT under the "existing conservative debit". Recommend: bound → `max(0, count − qualifyingTakes.length)`; current (local or foreign) → `count`. Difference is an edge case (a take landing inside a not-yet-bound window), but it keeps the adapter aligned with both texts.

### Q2 — Mask, remaining, target. Verdict: KEEP.

- Mask by shape only: 26 §1 :31-32 "Shape, never root/receipt version, selects the branch"; `promiseCastSlots` :548-553 already does this for the weekly owner; the V30 validator refuses a tagged predicate on a non-P2 family (:918-920) and V29 refuses `kind` outright (:928), so no saved state carries a tagged non-P2. Lawful.
- `remaining` clipped at 0 and emitted at 0: kernel `integer(value.remaining)` (:273) admits 0; `prepareCommon` pushes a 0-unit demand (:548-549); `classifyDomain` :939 handles all-zero priors. Plan :273-277 is satisfied for the target (`state: 'bound'` iff root `contractId !== null`; `actualQualifiedCount = qualifyingTakes(state, root).length`, else 0 and ignored at kernel :985-986). Zero remaining on a BOUND target yields `ALREADY_MET` (:1028), and the adapter settles nothing (plan :277).
- One observation, not a defect: zero-remaining priors do count against `limits.claims` (kernel :1011 uses `priorClaims.length`, only debits are pre-filtered). Irrelevant at 3 roots; a remaining-0 open bound root is unreachable in live play anyway (tick order at :1099-1110 per 26: appendFirstTakes → advancePromisesWeek settles it in the same tick).

### Q3 — Exporting `promiseCastSlots`/`qualifyingTakes` with a `Pick` parameter. Verdict: KEEP; lawful under 26 §1; no widening/activation; no typecheck risk found.

- 26 §1 :27-34 asks for exactly a reusable helper "typed against ProfessionalPromiseV30 and only the first-take input it reads"; :38 forbids widening/activating attachment or the V30 weekly mutator, which two `export` keywords do not touch. `qualifyingTakes` already has the `Pick<GameStateV30,'firstTakes'>` signature (:555-558) and `advancePromisesWeek` already passes a V29 `GameState` into it at :611, so the narrowing risk the brief asks about exists today and HEAD compiles (536 ran the groups; typecheck itself I could not run). `Pick<ProfessionalPromiseV30,'predicate'>` resolves to `{ predicate: {count:number} | CastRoleCountPredicate }`, the same union the body narrows with `'kind' in` at :551 today. `PromiseDraft.predicate` (`{count:number}`, :193) is assignable. No B4 RED group's pass/fail set can move: zero body change, and `vi.spyOn(promisesModule, 'advancePromisesWeek')` in the material test (:268) is unaffected by new exports (ESM internal calls do not route through the namespace). `index.ts` needs no change (the capacity test already imports from `../src/core/promises.js`). Duplicating the helpers would create a second authority; agree with the note's refusal.

### Q4 — Assembly. Verdict: KEEP with two clarifications.

- Byte-identity: the first-take hand assembly (test :314-321) is `{mode, now, horizonEndWeek, issuerId, target, priorClaims: [], foreignDebits: [], traces: [attempt.trace], fixedHolds: result.fixedHolds, coverage, preparationWork: result.preparationWork, limits}`. The note's assembly differs only in `coverage.omissions` (the fixed string vs `NO_ENUMERATOR_OMISSION`) and `preparationWork` (+ `claims.work`). Correct as stated.
- Coverage derivation: `claimsAndHolds` complete iff claims complete, no cut, no producer omission. Conservative superset of the truth (a `commandRefused` cut leaves holds complete) but safe; the only observable effect is whether the kernel runs the search before returning UNCERTIFIED (:1029 vs `classifyDomain` :944-966), never the class. `existingCalendars`/`allOwnerTraces` incomplete always: required, since no enumerator exists (13 :95-102 "Never relabel current scalar helpers as a complete adapter"; 538: only author-assumed coverage yields PROVEN_*).
- Hold clipping: none needed. Producer fixed holds are `from: now, until: end, replaceableFrom: now` (replay :754-755) and the picture people's holds run to the horizon (first-take test :272-275). That IS plan :313-315 ("Clip pre-existing holds to the analyzed interval without inventing their release; release beyond the interval remains occupied throughout it"). Copy by reference is right.
- Horizon guard as a throw: KEEP. Kernel effective horizon is `max(horizonEndWeek, target.due, prior dues)` (:998-999) and `validateTraces` :511 `invariant(compareBoundary(cursor, end) >= 0, 'unknown release occupancy must cover the effective horizon')` is an input-invariant Error, not a `WorkLimit`. A producer run to a shorter horizon than `claims.horizonEndWeek` with a complete unknown-release trace is a caller-contract fault, not a domain or computation limit, so UNCERTIFIED would be an untruthful label; plan :315 ("Larger historical spans produce truthful UNCERTIFIED, never invalid saves") is about spans beyond `limits.span`, which the kernel disposes as `sizeLimit` at :1010-1015 BEFORE `validateTraces` (:1027), and the producer cuts `sizeLimit` at :549. The guard's cut exemption is right: with no complete trace, `validateTraces` checks nothing. Vacuous-empty `attempts` also passes, correctly.
- 538's `windowClipped: true` (538 :130 / lines 174-178): confirmed a measurement workaround (target due clipped to the producer horizon so the kernel's effective horizon matched). The adapter must not repeat it; clipping the due changes the question. Plan :308-309: span "ends at the latest relevant target/claim due-exclusive boundary", so the producer must be run to `claims.horizonEndWeek`. The note is right.
- Clarification 1 (REFINE, documentation): the note is silent on a malformed TARGET (empty window, count < 1, non-integer). The kernel throws (`windowValue` :147, `target count must be positive` :264). State the precondition and add a named early invariant in `collectPromiseClaims`, and record that in the later live slice the scalar's structural refusals (promises.ts:373-378: whole-picture count, window closes before it opens, window inside the proposed contract; :381-383 person/acting) run BEFORE the adapter. The capacity test's huge cases (:357-359) require the outside-contract refusal never be relabelled as cap uncertainty; through the adapter alone those drafts would come back `UNCERTIFIED/sizeLimit` (kernel :1013; producer :549) and be relabelled.
- Clarification 2: `claims.horizonEndWeek` excludes foreign debit windows; the kernel excludes them too (:999 folds only `priorClaims`). Consistent.

### Q5 — Mapping. Verdict: KEEP.

- UNCERTIFIED string exact: plan :125-126 `bounded capacity analysis could not certify this schedule`; the note's constant matches byte-for-byte and the capacity test's `UNKNOWN_CAP` (:36) is identical.
- `ALREADY_MET` → REASONABLY_ACHIEVABLE with `null` bottleneck: consistent with plan :276-277 (already met, not a failed probe; the read settles nothing) and with the `bottleneck null iff REASONABLY_ACHIEVABLE` law (types.ts:2158-2159; validator :943-945 refuses a bottleneck on an achievable receipt). `kernel.status` keeps the distinction. Confirmed as routine, not Owner-gated.
- PROVEN_IMPOSSIBLE offer-only: kernel result carries `scope: 'jointOfferOnly'` (:70-71, :935-936); plan :303-304 "Immediate studio-caused outcome checks use the separate target-specific physical predicate proof … not this offer result alone"; no `src` importer of the kernel or replay besides `promiseCapacityOwnerReplay.ts:38` (grep), and `breakPromisesOnCancel` :676-693 still calls `reclassifyPromise` (26 :69-79 separate correction). Structurally unreachable. Optional: carry `scope` on `kernel` when status is PROVEN_IMPOSSIBLE so the result says so itself (the note drops it).
- Not a receipt (no `rulesVersion`/`week`): consistent with D1 open (537 §3) and 23 :36. `now` is inside the digest, so the week is still identified.
- One wording fix: the note calls all non-UNCERTIFIED bottleneck strings "proposals". The PRESENCE of "an explicit prior-path-protection bottleneck" for `PROVEN_FRAGILE/priorPathProtection` is plan law (:300-302); only its wording is routine. The proposed strings leak no class (plan :214-215).

### Q6 — Digest and work. Verdict: REFINE (exclude `preparationWork` from the digest); tariff KEEP.

- Defect (demonstrated by source, not executed): `readyProductionId` walks `source.ledger` (replay :2046 `rows(source.ledger, row => id(row.productionId))`), `careerEvents` (:2047), `hollywood.films` (:2077), `hollywood.careerEvents` (:2078), `studioHistory.rows` (:2066), each visit billed 40 (:2105). The capacity test's cash probe appends a ledger row (:338-339). So a Ready-producer `preparationWork` moves with cash-ledger rows and with unrelated campaign history, and including it in the digest violates plan :73-76 ("exclude irrelevant cash, RNG and unrelated campaign history"). RED 12 as written would pass only because `opened` saturates at 200000 in both variants (538 scenario 0/2) and the Started producer's `prepare` (:534-799) reads none of those roots; it would not catch the coupling. The number is not a "class/path/reservation/availability fact" (plan :73-75). Recommendation: digest the assembled input WITHOUT `preparationWork` (keep `limits`, `now`, target, claims, traces, fixedHolds, coverage); carry `kernel.workUsed` on the result so a cap-induced classification difference under an identical digest is attributable to `kernel.status/reason`. Record the residual tension for the parent (not for this slice to settle): with a capped kernel whose bill depends on unrelated history (538's finding), "same digest ⇒ byte-equal receipt" (types.ts:2163-2164) and "exclude unrelated history" cannot both hold; excluding follows the plan's explicit text and D2 already carries the bill question.
- Tariff `1 + P + A + M×T` added to `preparationWork`: lawful and, for the `M×T` term, required. Plan :318 "Charge/cap preprocessing too. Beyond linear inspection of owner collections, work is budgeted": the per-member scan of `firstTakes` is a product, not a linear inspection. `P` and `A` may be free under :318; charging them is harmless (tens of units) and mirrors the producer (`for (const take of source.firstTakes) work.pay(5)` at :691-694, not :686-689). No effect on the first-take GREEN route: the adapter is not called there; its `expect(capacity.workUsed).toBeLessThanOrEqual(200000)` (:327) is on the hand assembly. With a 200000 cut plus tariff the kernel seeds `min(preparation, limit)` (:172) and returns `workUsed: budget.limit` (:1034), so RED 8's `workUsed 200000` holds. I did not read 515 §6; if it reserves every new tariff to the Owner, drop `P + A` (free under :318) and keep `M×T`.
- Observation: `JSON.stringify` + `fnv1a64` over the assembled input is itself uncharged; bounded by the kernel's row/claim limits, same as `receipt()` :217. No change needed.

### Q7 — Rival guard. Verdict: KEEP.

`HollywoodState.playerStudioId: string` exists (hollywoodTypes.ts:131; used at promises.ts:222). `hollywood === null` or non-player issuer → empty claims, `claimsAndHolds: 'incomplete'`, named omission; the producer independently cuts `rivalPolicyUnsupported` (:621-622, after `plansPrepared` at :617 so cuts are emitted) or, with no plans, returns `omissions: [reason, message]` (:2712); assembly → incomplete → kernel `UNCERTIFIED/domainIncomplete` (:1029) → FRAGILE + exact string. Never throws. Sufficient for a detached module; the live slice must still gate rivals before calling (537-A §3 item 4), which the note says.

### Q8 — RED list (15 items). Per item:

1. KEEP. Verified on `w.ready`: 538 dimension line records `promises: 3`, `firstTakes: 24` (rival takes, issuer-filtered to 0 by :563), now 60, roots bound at :136 with window `[start, start+52)`; priors = antagonist + support, `remaining 1`, `actualQualifiedCount 0`, `horizonEndWeek = start+52`, coverage complete.
2. KEEP; citation fix: the withdraw shape is capacity test :290-308 (the brief's :279-296 is the conflicting-claim case). `w.opened` has no roots (538 `promises: 0`), so attach-P1-then-`withdrawProposal` is the right construction; `outcome !== null` is reachable on `tick(w.ready)` (:269-275 shows all three SATISFIED).
3. REFINE: the foreign-debit half is unreachable as written. `w.opened` carries zero promise roots (538 scenario 0: "no player promise roots", `promises: 0`), so no rival root exists and "pin by membership predicate, not by count" is vacuous (the note's own §6 admits "inferred, not observed"). Build a detached `ClaimSource` fixture (the note's `Pick` type makes this cheap) with a rival-issued current P1 root on the target person carried by a rival proposal, plus a rival root on ANOTHER person, and pin: first → `ForeignDebit` with `sourceWindow`; second → dropped (plan :95). Never saved; labelled. The `attachPromise` P1 'current' half is fine.
4. KEEP; choose deliberately: the installed conflicting case (:281) tags BOTH lead and antagonist `['lead']` (538's "conflicting lead/lead/P1" cell); the note's fixture tags only the antagonist ("lead person mask any"). Mirror the installed case so RED 9's conflicting cell matches 538.
5. KEEP first half (`count: 2`, `tick` on an in-memory tagged state is the material test's own pattern :236-251; validator not invoked by `tick`). Second half (`outcome` forced null with a real take) is constructible in memory (V30 validator :972-991 does not recompute takes for open roots) but unreachable in live play (same-tick settlement); keep it, labelled "arithmetic pin only, not a live state".
6. KEEP (see Q1).
7. KEEP; cheaper alternative: the first-take route is a full founding-week fixture in another file; the Started producer on `w.ready` with `{traceKey, commands: []}` (538 scenario 1, 108,265, complete) gives the same byte-identity pin using the `world()` the file already needs. Either satisfies the requirement.
8. KEEP. 538 facts verified in the record; omission strings from replay :2759/:2771; kernel `workUsed: budget.limit` at :1034.
9. KEEP. 538 scenario 1 lines 144-169: supplied coverage → `UNCERTIFIED/domainIncomplete`, workUsed 112,490-112,722. Through the adapter the kernel omissions become `[NO_ENUMERATOR_OMISSION]`. Correctly refuses to assert the installed IMPOSSIBLE/FRAGILE outcomes.
10. KEEP. The kernel test has all five statuses (CERTIFIED :168, both PROVEN_FRAGILE reasons :206/:250, PROVEN_IMPOSSIBLE :183, ALREADY_MET :291-299, UNCERTIFIED domainIncomplete/sizeLimit/workLimit :416/:460/:470). Its helpers are file-local, so the new file copies the minimal `input()`/`picture()`/`prior()` shapes (:28-52); `mapCapacityResult` accepts the optional-mode result type.
11. KEEP as a scope pin (`Object.keys(module)`); it is a surface pin, not a proof; the proof is the importer grep above.
12. REFINE with Q6: pin that the digest is independent of `preparationWork` (same input, `preparationWork ± 1` → same digest) and run the cash/RNG variants (capacity test :338-340, not :322-335) through the STARTED producer on `w.ready`, where the producer completes; on `opened` the Ready producer saturates and the identity is vacuous.
13. KEEP (see Q7).
14. KEEP. Sorted-by-promiseId claims, count-only tariff, producer independent of `promises` order.
15. KEEP; reachable both ways: (a) Started producer horizon `now+2` with a complete unknown-release trace and a draft due `now+52` → guard throws; (b) target due `now+221` with no complete trace (producer at `now+221` cuts `sizeLimit` at :549 before `plansPrepared`, so `attempts: []`, or producer at a short horizon with `plans: []`) → kernel `horizon − now > 220` → `sizeLimit` (:1013), FRAGILE + exact string. (b) must not include a complete trace or (a) fires first.

Missing cases to add: (i) count-only `LEAD_OR_SIGNIFICANT_ROLE_COUNT` root → mask all three (plan :67; 26 §1 :30); (ii) bound TARGET with a real take → `actualQualifiedCount 1`, `state 'bound'` → through the trace route → `ALREADY_MET` → REASONABLY_ACHIEVABLE/null (reachable on `tick(w.ready)` with the lead root as target; other roots terminal and excluded); (iii) `limits.work: 200001` → the kernel throws `work limit exceeds the governed maximum` (:977) through the adapter, refused by the kernel not the adapter; (iv) nonoverlap at the exact half-open edges (`windowStartWeek === draft.dueWeekExclusive`; `dueWeekExclusive === max(now, start)`) → excluded; (v) malformed target → named throw (Q4 clarification 1). No item duplicates an installed pin.

### Q9 — Scope discipline. Verdict: KEEP; check list REFINE.

Writable paths (new module + two `export` lines) are minimal and complete. Nothing is a live change in disguise: no importer, no version stamp, no wiring, no save/projection change, no kernel/producer edit. No placeholder matcher: the classification is the kernel's proof class, mapped. No enumerator by another name: `collectPromiseClaims` collects claims from `state.promises`, `assembleCapacityInput` consumes producer results. Lawful under D1 (a) evaluator-5 front end, (b) first part of 26 §2 row 3's adapter, (c) limits pass-through, and under D2 (coverage stays what producers report). Check list: add `bridge-p14b1-promises` and `bridge-p14b3-promise-command` (bridge consumers of `promises.ts`; the `p14b1-*` glob does not match the `bridge-` prefix) and the twelve historical save files 537-A named, all "pass/fail sets identical".

### Q10 — Overall: **KEEP with REFINEMENTS** (no REWORK). Adopt before RED authoring and writer release:

1. Digest excludes `preparationWork` (Q6); RED 12 pins that plus the Started-producer cash/RNG variant.
2. RED 3 foreign debits via a detached `ClaimSource` fixture (Q8.3), including the other-person rival root dropped.
3. Current priors/foreign debits `remaining = count`; bound priors `count − qualifyingTakes` (Q1), or record explicitly why `qualifyingTakes` is used for current roots.
4. Malformed-target precondition and named invariant; record the live-ordering requirement (scalar structural refusals :373-383 before the adapter) in §2/§5 (Q4).
5. RED additions (i)-(v) from Q8; RED 4 mirrors the installed conflicting case; RED 5 second half labelled as a non-live arithmetic pin.
6. Check-list additions (Q9). Optional: carry `scope: 'jointOfferOnly'` on `kernel`.

Owner-gated items the note tried to settle: none. D1/D2 are deferred correctly; bottleneck wording, `ALREADY_MET` mapping and the tariff are routine under the plan. One item for the parent to carry alongside D2, not to settle here: the digest/receipt-law tension under a history-dependent bill (Q6).

## Defects and inaccuracies in 539-A (section → source)

- §1 digest law: includes `preparationWork`, which the Ready producer derives from ledger/history walks (replay :2046-2047, :2066-2091); conflicts with plan :75-76; RED 12 would be vacuous (538 saturation). REFINE.
- §3 RED 3: foreign debits on `w.opened` unreachable (538 `promises: 0`). REFINE.
- §1 target well-formedness unaddressed (kernel :147, :264 throw); live ordering vs the scalar's refusals (:373-383) and the huge cases (:357-359) not recorded.
- §1/§3 remaining for CURRENT members deviates from B3 :287 / plan :262-263 (minor).
- §3 RED 4 fixture differs from the installed conflicting case (:281) without saying so.
- §4 check list omits bridge consumers of `promises.ts`.
- Citation drifts: foreign-debit drop is kernel :992-997 (note: :999-1003); producer firstTakes scan :691-694 (note :686-689); withdraw shape capacity :290-308; cash/RNG shapes :338-340; `kernel` field drops `scope`. Verified correct: UNCERTIFIED string :125-126; `MAX_LIMITS` :117; `Budget` :168-186; `overlapWindow` :162-165; `normalizeBase` prior invariant :280; `validateTraces` throw :511; `runCapacity` remaining/ALREADY_MET/horizon/sizeLimit :985-1028; `rivalPolicyUnsupported` :621-622; ordinal-zero rule :583; fixed holds :754-755; producer caps :2679; `promiseCastSlots`/`qualifyingTakes` :548-569; `activePromiseReservations` :274-283; `receipt` :211-218; `fnv1a64` math.ts:91-97; tuning :30/:377/:392; `playerStudioId` hollywoodTypes.ts:131; no `src` importer of kernel/replay.

## Evidence limits

Nothing executed: no tsc, no vitest; 538 numbers are taken from the record's verbatim lines, not re-measured. Not read: `tests/p14b4-started-owner-replay.test.ts`, `index.ts` export bodies (only grepped), 515 §6, `caseForTalent` (the 12-week offset attribution is the note's, unverified), kernel search internals :632-929. TypeScript narrowing statements are by reading, not compilation. No native, usability, Save30, projection47 or Owner-acceptance claim.

## Next concrete action

Parent records 539-B; test-author writes the RED file per §3 with refinements 1-5 (in-memory tagged variants, module-path imports, detached `ClaimSource` fixture for foreign debits, Started producer on `w.ready` for the cash/RNG and byte-identity pins); then release ONE sim-core writer with §4 paths and the extended check list; independent review of the landed module against 539-A + 539-B + 13/14 before any enumerator slice.
```
