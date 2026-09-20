# 555 — Enumerator slice of the owner adapter: design note, independent review, adopted brief

2026-09-20. Claude Code parent. Two READ-ONLY specialist reports (verbatim in §4): 555-A sim-core
design note for the SECOND owner-adapter slice (a domain-completeness certificate from the
Started producer plus a DERIVED hard bound on when any fresh admission can produce a first take;
no Ready-producer run), and 555-B contract-auditor review: **REFINE, core sound** (the floor is a
valid hard bound under plan :292 applied negatively; the forced-take condition; option β; the new
module and the one-hunk adapter extension), seven exact changes adopted below. No source, test,
fixture, cap, validator or plan text changed. HEAD at review `6d7d75a3`/`e33022fb` (source
identical to `e753da22` plus the 556 fixture reconciliation).

## 1. Adopted design (555-A as refined by 555-B)

**The fresh-take floor (owner fact, not a product decision).** No picture the issuer has not
started at source-now can record a first take before `now + 5`: admission sets
`startTick = now`, `remainingTicks = PRODUCTION_TICKS (8)` (`actions.ts:344-345`,
replay `:2577`; queue admissions land at `now+1`, `tick.ts:410-412` + `actions.ts:1750-1757`);
the same-week sweep skips (`operations.ts:1658-1661`); one decrement per weekly advance and
never two (`:1684, :1764, :1782`, `enterPhase :1431`; the setup hold `continue`s without
decrementing); the take fires only in the `remainingTicks === 5` branch when the task is
`scheduled` with no blocker (`:1680-1689`), scheduling needs the boundary after Shooting entry
(`:793-797`); the take is stamped with the produced week (`tick.ts:1102-1108`). Load-in, casting
acknowledgement, founding and phase-entry blockers only delay. `FRESH_TAKE_OFFSET = 5`, derived at
module load from `productionPhaseForRemainingTicksOrNull` (not from the scalar's
`WEEKS_TO_FIRST_TAKE` hypothesis). Generalised started floor
`now + (startTick >= now ? 1 : 0) + (remainingTicks − 5) + 1`.

**Started-domain conditions**, for every issuer picture: (a′) an issuer-matched first take is
recorded OR `remainingTicks < 5` (the producer's own `historicallyFilmed` law, replay `:690`,
`:2011`); (b) `shootingTask.status === 'scheduled' && blocker === null` at source-now (no lawful
writer reverts it; the next sweep fires it; the Started producer's `commands: []` trace reproduces
exactly that); (c) its floor ≥ `claims.horizonEndWeek`. Otherwise a named omission
`started picture <id>: lawful command timings and facility acquisition are not enumerated`.

**Certificate (555-B Q4 correction).** `existingCalendars = allOwnerTraces =` (every Started
attempt complete ∧ no producer omission ∧ ∀ issuer picture (a′)/(b)/(c)) ∧
`claims.horizonEndWeek ≤ now + FRESH_TAKE_OFFSET`. Ready scripts are EXISTING paths (plan
:236-237, :241), so beyond the floor both flags are incomplete; a complete flag over a missing
existing path would let the kernel stop the prior optimisation at an under-protected profile.
Fresh-admission omission wording: `any picture not started at source-now (Ready staffing
alternatives, scripts in drafting/review, stock door, commissions) is not enumerated beyond the
fresh-take floor`. Stock door under managed development is closed by law
(`productionAdmission.ts:98-133`); under legacy development it is the same `applyGreenlight`
countdown, inside the omission. Commissions: earliest take ≥ `now + 6`. Never assert completeness
on a cut; cap and span cuts stay `workLimit`/`sizeLimit` → UNCERTIFIED, never PROVEN_*.

**Option β**: the Ready producer is NOT run in this slice; long windows are truthfully
UNCERTIFIED/domainIncomplete with the named omission (D2 stands: under the adopted 162 §2 metric
the Ready producer cannot admit on history-bearing worlds, and one admission per trace cannot
witness B = 2). Ready staffing enumeration is slice 3, D2-dependent.

**API.** NEW pure module `src/core/promiseCapacityEnumerator.ts` (imports only the Started
producer, the adapter, the kernel, `productionPhases`, `tuning`, type-only `types`/`promises`;
no live importer; not index-exported): `FRESH_TAKE_OFFSET`, `FRESH_ADMISSION_OMISSION`,
`earliestStartedTakeWeek(now, picture)`, `enumerateOwnerTraces(state, claims, limits) →
EnumeratedDomain { producer, enumeration, floors, work }`, `classifyEnumeratedOffer(state, draft,
limits)`. Behaviour: (1) rival/absent-industry claims → no producer run, both flags incomplete, no
throw; (2) enumerator tariff `w_e` (linear scans over `studio.activeProductions`,
`operations.workflows`, `firstTakes`; formula fixed by the RED) charged and saturated against
`limits.work` BEFORE any run — saturation returns the replay's own cut shape (`attempts: []`,
`preparationWork = limits.work`, omission `work limit before enumeration completed`, both flags
incomplete → kernel `UNCERTIFIED/workLimit`, `workUsed = limit`); (3) ONE Started run,
`plans: [{ traceKey, commands: [] }]`, `horizonEndWeek = claims.horizonEndWeek` always,
`preparationWork = w_e`, producer limits picked from the caller's `limits`; (4) certificate per
above; (5) assembly adds `claims.work` once (539 §1 law unchanged; one monotone sum; a producer
overshoot ≤ `claims.work` is cut by the kernel with the same label).
ONE hunk in `src/core/promiseCapacityOwners.ts` `:151-168`: 5th parameter
`enumeration: EnumerationCoverage = NO_ENUMERATION` (the constant stays UNEXPORTED; the default
reproduces today's coverage byte-for-byte, so RED 7/8/9 and RED 11's export pin are unchanged;
`export type EnumerationCoverage` adds no runtime key) AND 553-R item 1's canonical re-literal of
`limits` in a fixed key order (routine; RED 7 `toEqual` and RED 12 are key-order insensitive).

## 2. Not in this slice (555-A §5 + 555-B; each with its controlling line)

Ready staffing enumeration or any Ready-producer run (D2; 538-C §2); commissions/stock door as
enumerated paths (13; plan :238); command-timing/facility alternatives for unforced started
pictures (plan :241-242; named omission); live wiring, `PROMISE_RULES_VERSION`, receipt fields
(D1, 537 §3; 23); Save/projection/schema (26 §3-§4); kernel/producer/cap/tariff changes (538-C;
515 §6); `breakPromisesOnCancel` (26 :69-79); B = 2 / multi-admission grammar (538-C Q3); test
loosening (plan :128-129). The certificate does NOT close ordinary-offer coverage (13 :104-106).

## 3. Adopted RED brief and writer scope

T1 (test-author): ONE new file `tests/p14b4-owner-enumerator-slice.test.ts` implementing 555-A
§5 E1–E10 with 555-B's refinements: E1 pins `FRESH_TAKE_OFFSET === 5` and the formula cells as
law, and the natural-chain take on `opened` as `>= now + FRESH_TAKE_OFFSET` (law) plus a guarded
`===` observation reporting the week; E2 unchanged; E3 as written (eligible →
PROVEN_FRAGILE/achievableProbeFailed; ineligible and the conflicting case → PROVEN_IMPOSSIBLE/
completeCountFailure with `scope 'jointOfferOnly'`; `unbound(support)` IMPOSSIBLE is PAPER and
must report a different class loudly, never loosen); E4 at `now+6` → BOTH flags incomplete with
the fresh-admission omission, plus a separate loud precondition that the Started attempt to
`now+6` is `complete`; E5 with the `unscheduled` state captured by the copied builder before
`scheduleShootingTake`, omission naming `w.productionId`; E6 with the same producer-completeness
precondition; E7; E8 with the `w_e` formula written in the RED; E9 with `input.limits`
`toEqual` (canonical key order), `limits.work 200001` → the producer's own throw unrelabelled,
`span` short → `sizeLimit` via the kernel; E10 plus "`NO_ENUMERATION` not exported; the adapter's
RED 11 key list unchanged". Additions as constructible: (i) admitted-this-week picture on
`opened` with a 2-week draft → complete → PROVEN_IMPOSSIBLE; (ii) (a′) via `tick(w.ready)` with a
fresh unbound 2-week draft → complete → IMPOSSIBLE; (iii) queue non-empty → producer cut → both
flags incomplete (fail-loud precondition, else reported unconstructible); (iv) the
`remainingTicks < 5` arm of (a′) on plain `Pick` inputs of the helper; (v) `w_e` saturation with a
tiny `limits.work` → UNCERTIFIED/workLimit. In-memory tagged variants only; builders copied from
540, not imported; the missing-module RED named as such.

T2 (ONE sim-core writer, after the RED is recorded): writable `src/core/promiseCapacityEnumerator.ts`
(new) and `src/core/promiseCapacityOwners.ts` `:151-168` (the 5th parameter, the type export,
the `limits` re-literal); nothing else. Serial fixed-source checks: the new file GREEN; the
first-slice RED 33 PASS unchanged; kernel 41, hold-order 5, stable-sort 7, sort-owners 7; Ready 17
PASS + the sole stale FAIL; Started 28; material 17; B1/B2/B3 + bridge consumers with the sole
designated `p14b1-trust-chooser` test 6 FAIL; `bridge-p14b2-trust` 22; historical saves 137; the
six live-P2 groups byte-identical to 536/549; root+UI typecheck; bridge tsc with its sole OLD
TS2353. Then independent review of the landed module.

## 4. Verbatim specialist reports

As returned, unedited; advisory. §1–§3 above is the parent's adjudication.

### 4.1 — 555-A (sim-core, READ-ONLY design note)

```text
# 555-A — READ-ONLY design note: the enumerator slice of the owner adapter

**Status: DONE (proposal only).** No worktree file created or edited, no vitest/tsc/npm, no Git state change, no network, no delegation; nothing under `bisect-wt` opened. All reads were from the main checkout `/Users/zacheryspector/The-Movies-headless-program` at HEAD `4b88394c8611c60223ea516ef481f37d7735ff0e` (clean), which is the docs-only commit above `e753da22`.

**Model observed:** the harness identifies this session as Fable 5.1 (`claude-fable-5-1`); not independently verifiable. lean-ctx MCP tools named in the user CLAUDE.md were not exposed; Bash read-only (`cat`/`sed`/`awk`/`grep`/`git log`) only.

## Sources read (line ranges)

- Records (`docs/engineering/playability-launch-review/evidence/p14b4-20260919/`): `553-…qualified-checkpoint.md` whole; `541-…implementation.md` whole; `539-…design-review.md` :1-140 (§1-§3, 539-A 1.1-1.4), :321-345 (539-B Q4 clarifications 1-2, Q5, Q6); `538-capacity-budget-measurement.md` :1-110 (identity, measured table :29-36, parent reading :38-66, D2 :68-80, 538-M head); `538-admission-bill-contract-review.md` whole (§1-§2, 538-C Q1-Q5); `537-…decision-items.md` §3 (D1/D2 text) and 537-A §3. `evidence/p14bf2-20260919/13-…preparation.md` whole; `14-…review.md` whole; `26-live-cutover-implementation-map.md` :1-88 (§1-§2). Plan `docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md` :60-139, :205-329.
- Source: `src/core/promiseCapacityOwners.ts` whole (198); `src/core/promiseCapacityOwnerReplay.ts` :1-330, :534-625 (`prepare`), :795-838 (`checkForeignRelevance`), :2024-2135 (`readyProductionId`), :2440-2664 (`admitReady`, `finishReady`), :2666-2797 (`replayPlans`, exports, caps :2679); `src/core/promiseCapacityKernel.ts` :1-190, :255-300 (`normalizeBase`), :383-520 (`normalizeTraces`, `validateTraces`), :621-660 (`prepareDomain`, `priorUpperProfile`), :925-1047 (`classifyDomain`, `runCapacity`); `src/core/promises.ts` :240-435 (stock door :249-258, B3 :274-288, `expectedFirstTakeWeek` :335-348, scalar :366-431), :42, :50; `src/core/actions.ts` :300-490 (`applyGreenlight` body), :1917-1990, :2046-2075 (commission guards); `src/core/productionAdmission.ts` :1-220; `src/core/employment.ts` :120-171, :375-400; `src/core/operations.ts` :1460-1500, :1576-1612, :1640-1700 (managed sweep: skip :1658, phase invariant :1671-1676, the 5→4 take branch :1680-1696); `src/core/tick.ts` :296-345, :1095-1111; `src/core/productionPhases.ts` :25-100; `src/core/sceneryLoadIn.ts` :280-292; `src/core/hollywoodPolicy.ts` :28-66; `src/core/talentMarket.ts` :680-815; `src/core/tuning.ts` grep (PRODUCTION_TICKS :59, contract/renewal :30, :376-392, load-in :880-882, draft weeks :930-932); `src/core/types.ts` :2135-2142; `src/core/index.ts` grep (no capacity module exported; `WEEKS_TO_FIRST_TAKE` :1418).
- Tests: `tests/p14b4-cast-class-capacity.test.ts` whole (366); `tests/p14b4-owner-adapter-first-slice.test.ts` :50-300 (fixtures, `twoWeek` :211-216, `started()` :244-263), :536-583 (RED 7/8), :651-673 (CELLS, RED 9), case index; `tests/p14b4-ready-replay-first-take.test.ts` :150-330; `tests/p14b4-started-owner-replay.test.ts` :100-215; `tests/p14b4-ready-replay-stale-target.test.ts` :150-190; `tests/` roster (32 `p14b4-*` files).

---

## 1. Domain definition

**What the kernel actually consumes.** `normalizeTraces` :453-461 maps `coverage.existingCalendars → existingAlternatives` and `allOwnerTraces → allAlternatives` and verifies nothing about them; they are the caller's certificate. `classifyDomain` :934 `complete = both === 'complete'` gates the three proof classes: :944/:952 `impossible()` (PROVEN_IMPOSSIBLE) and :955/:966 PROVEN_FRAGILE are returned only when `complete`; :943/:945 use `existingAlternatives === 'complete'` to stop the prior optimisation at the optimistic upper profile. `claimsAndHolds` is checked earlier (:1029) and `ALREADY_MET` precedes it (:1028). So the enumerator's job is exactly to make a truthful certificate, plus the traces the certificate is about.

**Completeness claim the enumerator makes (plan :290-291 "COMPLETE UNOPTIMIZED lawful domain retaining all relevant obligations"):** for the analysed interval `I = [now, claims.horizonEndWeek)` (:139 = max target due, prior dues), *every lawful alternative of the issuer's pipeline that could add a class-qualifying first take for the target or for any prior claim inside `I` is either present as a path of a supplied trace, or is proved unable to produce a take inside `I`.* Alternatives that can only remove events (cancel, never scheduling) are dominated for every probe the kernel runs (count, achievable, prior maximisation) and need no row. The certificate is only ever `'complete'` when every producer attempt is `complete`, there is no producer omission, `claims.coverage.claimsAndHolds === 'complete'`, and `productionQueue` is empty (the producer already cuts otherwise, :624).

**The four path families and what "complete" requires of each (plan :236-243; 13 omission list):**

| Family | Identity | What complete means | First-slice enumerator disposition |
|---|---|---|---|
| Started pictures | `productionId`; fixed cast (:97) | one path each; its take week is the lawful remaining schedule. Command alternatives (assign director, clear grandfathered scenery, schedule take, commit release: replay grammar :568-569) exist only while the take is not yet forced | included via the Started producer, `commands: []`. Complete iff for every issuer picture (a) a first take is already recorded (no NEW event, :98), or (b) `shootingTask.status === 'scheduled' && blocker === null` at source-now (the next sweep fires it, operations :1680-1684; nothing lawful delays it), or (c) its countdown floor (§2) is ≥ horizon. Otherwise → named omission `started picture <id>: lawful command timings are not enumerated`, `existingCalendars: 'incomplete'`. 13 allows this ("omitted lawful … start alternatives") |
| Ready scripts | `issuer/projectId` (:237); "fixed or lawful possible staffing" (:241) | every lawful staffing that seats the target or a prior-claim person in a seat of its mask, complement filled from idle contracted/freelancer people at source-now (`resolveGreenlightStaffing`, `assertGreenlightStaffingIdle` with greenlight's OWN busy set actions.ts:336-338, NOT `busyTalentIds` — 14 "caller-specific busy predicates"; `greenlightFreelancers` 240:94-98 source-now) | NOT enumerated in this slice. Excluded by the fresh-take floor when horizon ≤ floor (§2); otherwise named omission `fresh admissions (Ready staffing alternatives, stock door, commissions) are not enumerated beyond week <floor>` → `allOwnerTraces` AND `existingCalendars` incomplete (Ready is an existing path, :237) |
| Stock door | `conceptId` (:237-238) | under managed development the door is CLOSED by law: `requireGreenlightHeader` :106-111 refuses any greenlight that is not an assessed Ready project, so 13's "managed stock must use `applyCommissionScript` and real writing" folds into the commission family. Under legacy development it is a real path outside the producer grammar (`admitReady` requires a project) | managed: proved closed (a fact, no omission). legacy development: same named omission as above. `stockGreenlightAvailable` promises.ts:249-258 is the scalar's approximation and is NOT read by the enumerator |
| Commissions | planner-local (:238) | hypothetical; requires a commissionable writer (actions :1970/:2053), drafting ≥ `SCRIPT_DRAFT_WEEKS_MIN` 1 (tuning :932), review at a later tick, acceptance command, greenlight, then the same countdown → earliest take ≥ now + 1 + 5 | never enumerated in this slice; excluded by the fresh-take floor when horizon ≤ floor, else inside the same named omission (13: "speculative employment … start alternatives") |

Rival issuer: `collectPromiseClaims` already returns `claimsAndHolds: 'incomplete'` with `RIVAL_OMISSION` (:108-112); the enumerator runs no producer for it (the producer would cut `rivalPolicyUnsupported` :621-622 anyway) and both certificate flags stay incomplete. 553-R item 2 (gate rivals BEFORE the adapter in live wiring) stands.

Prior-path protection / ExampleB (:106-108, :265-269): with one started trace per world there is nothing to reallocate; the kernel's prior optimisation runs on the supplied traces exactly as today. The slice adds no second allocator and awards no seat (13; 14).

## 2. Cheapest certifying path for the installed RED cells

**The bound (derived from the authoritative owners, not from `WEEKS_TO_FIRST_TAKE`).** A picture the issuer has NOT started at source-now cannot record a first take before week `now + 5`:

1. Admission of any new picture sets `startTick = <admission week>`, `remainingTicks = TUNING.PRODUCTION_TICKS` (= 8, tuning :59): `admitReady` :2574-2577 and `applyGreenlight` actions.ts:343-345 alike; queue-admitted pictures are admitted at a later week (tick.ts :388 after the sweep), so their floor is later still.
2. The sweep that runs in the admission week skips it: operations :1658 `if (original.startTick >= currentTick) … continue` (legacy arm :1606 same); tick.ts :318-319 "a film greenlit at t does NOT advance during tick t".
3. The managed sweep decrements `remainingTicks` at most once per picture per weekly advance, and the workflow phase must equal the countdown's phase (:1671-1676); `PHASE_BY_REMAINING_TICKS` productionPhases.ts :36-45 puts the first Shooting week at 5.
4. The first take is emitted ONLY in the `remainingTicks === 5` branch :1680-1695, only when the task is `scheduled` with no blocker, and the scheduling command needs a command boundary after the picture is visibly in Shooting; the take is stamped with the week the advance PRODUCES (tick.ts :298, :1102-1108 `appendFirstTakes(…, finalized.market.tick)`; first-take test :190 `take.week === scheduleWeek + 1`, :220 sweep at `take.week − 1`).
5. Hence for admission at week `n`: skip at `n`; 8→7 at `n+1`, 7→6 at `n+2`, 6→5 at `n+3`; schedule at boundary `n+4`; 5→4 at the `n+4` sweep, take stamped `n+5`. Setup holds (:1698-1712), load-in (1–5 weeks, tuning :880-882), casting/scenery gates only push later. `FRESH_TAKE_OFFSET = 1 + (PRODUCTION_TICKS − 5) + 1 = 5`; the "5" is read at module load by scanning `productionPhaseForRemainingTicksOrNull(8..1)` for the first `'shooting'` count, so the constant is tied to the phase owner, not a literal.
6. Generalised floor for a started picture with `(startTick s, remainingTicks r ≥ 5)`: `now + (s >= now ? 1 : 0) + (r − 5) + 1`; this reproduces, from the owners, the scalar's `max(1, r−4) + (s >= from ? 1 : 0)` (promises.ts :342), which the RED pins as an observation, never as authority. Legacy operations mode emits no take at all (:1603-1612; 13) and is a producer context cut (:618), so the floor is asserted only after the Started producer completed (which implies managed context).

**Lawfulness.** Plan :112-116 forbids proving IMPOSSIBLE "from a heuristic search miss" and says "minimum countdowns are not certified availability": the floor is used only in the NEGATIVE direction (an actual bound on when a take can exist), which :112-113 and :292 expressly accept ("a valid hard upper bound/direct legal refusal"). 13/14 forbid inferring exhaustive failure from absence of enumeration; here the absent alternatives are PROVEN unable to contribute inside `I`, so the domain is complete by proof, not by omission. Observation supporting the arithmetic (not authority): 538 :60 — on `opened` (now 45) the real Ready route's take lands at week 50; 534/276's take is `commands[1].week + 1`.

**The minimal enumerator for the 13 RED-9 cells and the conflicting case.** On `w.ready` (now = 60 in 538): one started picture, take scheduled, blocker null (fixture :176-178) → condition (b); the three roots' windows and the target window are `[now, now+2)` (`twoWeek` :211-216) → `claims.horizonEndWeek = now+2 ≤ now+5` → Ready/stock/commission excluded by the floor; queue empty, managed, founded. Enumerator output: the Started producer's single trace (identical to `started(w)`, 538 scenario 1: producer 108265, kernel 4225–4457, total ≤ 112722 of 200000) plus certificate `{existingCalendars:'complete', allOwnerTraces:'complete', omissions: []}`. 538 :33 already OBSERVED what the kernel returns on these exact inputs when TOLD the domain is complete: eligible matrix cells `PROVEN_FRAGILE/achievableProbeFailed`; ineligible cells and the lead/lead/P1 conflicting case `PROVEN_IMPOSSIBLE`. Through `mapCapacityResult` (:185-188) that is `FRAGILE` with the achievableProbeFailed bottleneck (≠ `UNCERTIFIED_BOTTLENECK`) and `IMPOSSIBLE` (`kernel.scope 'jointOfferOnly'`). D2 is side-stepped because the Ready producer never runs.

**Installed capacity cases that become reachable THROUGH THE ADAPTER (a new RED file, in-memory variants; the live scalar path stays D1-gated):** `tests/p14b4-cast-class-capacity.test.ts` :237-247 (matrix: eligible FRAGILE with `bottleneck !== UNKNOWN_CAP`, ineligible IMPOSSIBLE), :254-261 (joint lead+flexible+P1: three FRAGILE, named bottleneck), :266-268 (`withoutSelfExclusion` support → IMPOSSIBLE: the person's own bound root becomes a prior with `remaining 1` while the unbound target asks for 1 more from the same single seat, plan :106 — PAPER, 538 did not measure this cell), :279-282 (conflicting lead claims → IMPOSSIBLE, offer-scoped). NOT reachable: :290-294 baseline REASONABLY_ACHIEVABLE on `opened` (§3), :346-359 huge windows (the scalar's structural refusal precedes the adapter, 539-B Q4 cl. 1; through the adapter alone → `sizeLimit`), :249-251/:285-287 `advancePromisesWeek` neutrality (owner behaviour, not the adapter's).

## 3. Long windows and D2

For any `claims.horizonEndWeek > now + 5` (the 40-week baseline on `opened`, the 52-week bound roots on `ready`, every ordinary launch offer) the certificate cannot be `'complete'` without enumerating Ready staffing alternatives (and, for `allOwnerTraces`, commissions). Under the current hypothesis that route cannot certify: (i) the Ready producer's `readyProductionId` bill saturates 200000 at admission on any history-bearing world (538 :34-36, 538-C Q2; contract law per 162 §2/176/320/285, not a writer's option); (ii) one admission per trace at source-now (240/241) makes `B = X + ceil(X/3) = 2` unwitnessable on a 0-production world (538-C Q4; 176:146-148), and on `opened` even the source-now take (week 50) precedes the window start 52; (iii) the Started producer run to a 40-week horizon crosses wrap/release, the 515 §6 stale route. So for long windows the enumerator MUST report truthfully: this slice → `UNCERTIFIED/domainIncomplete` with the named fresh-admission omission; a later Ready-enumerating slice → `UNCERTIFIED/workLimit` at `workUsed 200000` (RED 8 already pins that shape). Either maps to FRAGILE with the exact plan string (:124-126). I propose no cap, tariff, timeout, test or assertion change (plan :128-129, :319-321; 538-C §2; 515 §6). PROVEN_* for windows beyond the floor is unreachable until D2 is decided.

## 4. API and pure shape

**Decision: a NEW module `src/core/promiseCapacityEnumerator.ts`, not an extension of `promiseCapacityOwners.ts`.** Reasons: the enumerator must import the producers (`replayStartedProductionPlans`), which 539 §1 deliberately keeps out of the adapter ("consumes a producer RESULT, never runs the producer"); RED 11 :711-712 pins the adapter's exact 7-export runtime surface, so any enumerator export there would break an installed pin; and the "no live importer" rule is kept by both (neither is re-exported from `index.ts`, grep: 0 references). One small extension of the adapter is still needed so the certificate can be carried without duplicating the assembly law (13/26 §1: shared helper, no second copy):

'''ts
// promiseCapacityOwners.ts :151-168, ONE hunk (default byte-identical → RED 7/8/9 unchanged)
export type EnumerationCoverage = Readonly<{ existingCalendars: 'complete' | 'incomplete'
  allOwnerTraces: 'complete' | 'incomplete'; omissions: readonly string[] }>
const NO_ENUMERATION: EnumerationCoverage = { existingCalendars: 'incomplete', allOwnerTraces: 'incomplete', omissions: [NO_ENUMERATOR_OMISSION] }
export function assembleCapacityInput(claims, producer, horizonEndWeek, limits, enumeration: EnumerationCoverage = NO_ENUMERATION)
// omissions = sorted unique of claims.coverage.omissions ∪ producer.omissions ∪ cuts ∪ enumeration.omissions
// coverage: { claimsAndHolds: derived as today, existingCalendars: enumeration.existingCalendars, allOwnerTraces: enumeration.allOwnerTraces, omissions }
'''
A type export does not appear in `Object.keys` (RED 11 safe). Optionally, in the same hunk, 553-R item 1's canonical re-literal of `limits` at :167 (safe under RED 7 `toEqual` and RED 12/14); I recommend taking it now because the enumerator adds a second consumer of `limits` (the producers) and the digest law should not depend on call-site literal order.

'''ts
// src/core/promiseCapacityEnumerator.ts (new; pure; not index-exported)
// imports ONLY: ./promiseCapacityOwnerReplay.js (replayStartedProductionPlans + types), ./promiseCapacityOwners.js,
// ./promiseCapacityKernel.js (searchPromiseCapacityTraces + types), ./productionPhases.js (productionPhaseForRemainingTicksOrNull),
// ./tuning.js (PRODUCTION_TICKS), type-only ./types.js and ./promises.js (PromiseDraft).
// FORBIDDEN (13): actions, tick, queueAdmission, hollywoodTick, talentMarket, employment, promises runtime (no WEEKS_TO_FIRST_TAKE).
export const FRESH_TAKE_OFFSET: number                 // 5, derived at module load (§2 item 5)
export const FRESH_ADMISSION_OMISSION: string          // 'fresh admissions (Ready staffing alternatives, stock door, commissions) are not enumerated beyond the fresh-take floor'
export function earliestStartedTakeWeek(now: number, picture: Pick<Production, 'startTick' | 'remainingTicks'>): number
export type EnumeratedDomain = Readonly<{
  producer: ProducerResult          // Started result: traces, fixedHolds, cumulative bill (enumerator tariff transferred in), omissions
  enumeration: EnumerationCoverage  // the certificate (§1 conditions)
  floors: Readonly<{ freshTakeWeek: number }>   // now + FRESH_TAKE_OFFSET
  work: number                       // the enumerator's own tariff (already inside producer.preparationWork)
}>
export function enumerateOwnerTraces(state: GameState, claims: CollectedClaims, limits: CapacityLimits): EnumeratedDomain
export function classifyEnumeratedOffer(state: GameState, draft: PromiseDraft, limits: CapacityLimits): DetachedOfferClassification
//   = collectPromiseClaims → enumerateOwnerTraces → assembleCapacityInput(claims, domain.producer, claims.horizonEndWeek, limits, domain.enumeration)
//     → searchPromiseCapacityTraces → mapCapacityResult(result, capacityInputsDigest(input))
'''

Behaviour of `enumerateOwnerTraces`, in order:
1. Precondition: `claims.coverage.claimsAndHolds === 'complete'`; otherwise (rival/absent industry) return `{ producer: EMPTY, enumeration: incomplete/incomplete with no extra omission (the rival omission is already on claims), floors, work: 1 }` — no producer run, no throw.
2. Charge the enumerator tariff `w_e` (linear/product over `studio.activeProductions`, `operations.workflows`, `firstTakes` for conditions (a)/(b)/(c); exact formula fixed by the RED as 540 choice 1 did; native Sets avoided in favour of charged linear scans, following the adapter's accepted precedent 539-B Q6). Saturate against `limits.work` before running anything (plan :316-318 "check size before expansion; charge preprocessing too").
3. Run `replayStartedProductionPlans({ source: state, issuerId: claims.issuerId, claimPersonIds: claims.claimPersonIds, plans: [{ traceKey: 'enumerator:started', commands: [] }], horizonEndWeek: claims.horizonEndWeek, preparationWork: w_e, limits: { work, span, alternatives } picked from `limits` })`. Horizon law: always `claims.horizonEndWeek` (plan :308-309; adapter HORIZON_GUARD :160; 538's `windowClipped` never repeated). `GameState` satisfies `StartedOwnerSource<Production>` structurally (the tests' `startedSource` is a pick of it).
4. Certificate: `existingCalendars = 'complete'` iff every attempt complete ∧ no producer omission ∧ every issuer picture satisfies (a)/(b)/(c) of §1; `allOwnerTraces = 'complete'` iff that ∧ `claims.horizonEndWeek <= floors.freshTakeWeek`. Each failed condition contributes its named omission. Never assert completeness on a cut.
5. Return; `assembleCapacityInput` then adds `claims.work` exactly once (539 §1 law unchanged).

**Work accounting (176 §1 one counter, `preparationWork` transfer, no per-plan reset).** One monotone sum: `claims.work + w_e + producer + kernel` against one cap. `w_e` is transferred into the producer's `Work(limit, initial)` (:2681), the producer's cumulative `preparationWork` flows through assembly (+ `claims.work`) into the kernel's `Budget` seed (:172, :982). The only asymmetry is that the producer's counter does not see `claims.work`, so a bill that overshoots by ≤ `claims.work` is cut by the kernel (`workLimit`) rather than the producer; the total and the label are the same. The alternative (feed `claims.work` into the producer and stop adding it at assembly) changes the landed adapter law for no gain: rejected.

**Rival exclusion structurally:** step 1 (no producer for a rival issuer); plus the producer's own `rivalPolicyUnsupported` cut if ever reached. **Limits:** the enumerator constructs no `limits`; it passes the caller's object through to assembly (digest sees the same object) and PICKS the producer subset from it: one upstream construction site (553-R item 1 as a live-wiring rule) or the canonical re-literal, parent's choice.

**Two feasible alternatives for the long-window branch (routine engineering choice; recommendation given):**
- (α) also run the Ready producer with one deterministic seating per Ready script × claim person × lawful seat and mark the certificate incomplete (omission naming the un-enumerated complements). Result on history-bearing worlds: `workLimit` at 200000 (truthful, RED 8 shape); it buys real Ready traces only on history-free worlds and can never certify (D2 (ii)).
- (β, recommended) do not run the Ready producer in this slice; name the fresh-admission omission; `domainIncomplete`. Cheaper per invocation (plan :319-320 "quote/weekly cost multiplies by invocations"), identical proof value under D2, no staffing-enumeration design to review now. The Ready staffing enumerator becomes slice 3 with its own design (bounded seat/complement enumeration, `limits.alternatives`, the 14 busy-predicate clarification) and is D2-dependent.

Optional (not required): skip producers when `claims.target.state === 'bound'` and `count − actualQualifiedCount === 0` (kernel :1028 answers ALREADY_MET before coverage); saves a producer run at live cost. Add only if the RED wants it pinned.

## 5. Not in scope · RED list · writable paths · checks · dependence · limits

**Not in scope (controlling line):** Ready staffing enumeration and any Ready producer run (D2, 538-C §2; β above); commissions and the stock door as enumerated paths (13 omission list; plan :238); command-timing alternatives for started pictures whose take is not forced (plan :241-242; named omission instead); live wiring, `PROMISE_RULES_VERSION` (still 3, promises.ts:42), receipt fields, `rulesVersion 4` (D1, 537 §3; 23); Save/projection/schema (26 §3-§4); kernel/producer/cap/tariff changes (538-C; 515 §6); `breakPromisesOnCancel` (26 :69-79); test loosening (plan :128-129); B = 2 / multi-admission grammar (538-C Q3: direction record + decision item); rival policy replay (537-A §3 item 4); any `promises.ts` change beyond none (no new export needed: the enumerator reads no scalar helper).

**RED list (test-author; ONE new file `tests/p14b4-owner-enumerator-slice.test.ts`; in-memory tagged variants only, `live()`/`makeSave` never on tagged state; the 540 `world()`/`twoWeek`/`rootDraft`/`started()` builders copied, not imported; missing-module RED named as such):**
- E1 floor: `FRESH_TAKE_OFFSET === 5`; `earliestStartedTakeWeek(now, {startTick: now, remainingTicks: 8}) === now + 5`; `(now−1, 5) → now + 1`; `(now−1, 6) → now + 2`. Natural-chain observation on `w.opened`: greenlight the second Ready script at `now`, assign/schedule at the earliest lawful boundaries via the first-take test's loop (:153-199), real first take week `=== now + 5` (538 :60 predicts 50 from 45). Equality with `WEEKS_TO_FIRST_TAKE` noted as an observation only.
- E2 certificate on the 13 cells (540 CELLS :652-660): `enumerateOwnerTraces` → `enumeration` exactly `{complete, complete, []}`, `producer.attempts` = one complete trace byte-equal to `started(w).attempts[0].trace`, `producer.fixedHolds` byte-equal, `producer.preparationWork === startedWithPreparation(w_e).preparationWork`, no `workLimit`.
- E3 classification through the adapter: matrix eligible → `{classification:'FRAGILE', kernel:{status:'PROVEN_FRAGILE', reason:'achievableProbeFailed'}}`, `bottleneck !== UNCERTIFIED_BOTTLENECK`; matrix ineligible → `{classification:'IMPOSSIBLE', kernel:{status:'PROVEN_IMPOSSIBLE', reason:'completeCountFailure', scope:'jointOfferOnly'}}`; joint lead+flexible+P1 all three targets FRAGILE/PROVEN_FRAGILE; conflicting lead/lead/P1 target support IMPOSSIBLE; `unbound(support)` on the joint variant IMPOSSIBLE (paper, plan :106); every `kernel.workUsed ≤ 200000` and `> producer.preparationWork`. Digest differs from the first-slice digest of the same cell (coverage is inside the digest) and is `preparationWork`-independent.
- E4 honesty at the floor: same cell with the target root's `dueWeekExclusive = now + 5` → still complete (half-open: a take at `now+5` is outside); `now + 6` → `allOwnerTraces:'incomplete'`, `existingCalendars:'complete'`, omissions contain `FRESH_ADMISSION_OMISSION`, classification `FRAGILE`/`UNCERTIFIED_BOTTLENECK`/`kernel.reason 'domainIncomplete'`. Started producer run to `now+6` (holds `until {now+6, 0}`), no HORIZON_GUARD throw.
- E5 started-domain honesty: extend `world()` with `unscheduled` = the real state captured immediately before `scheduleShootingTake` (fixture :176; no in-memory edit of operations) → `existingCalendars:'incomplete'` with the started-picture omission naming `w.productionId`; UNCERTIFIED/domainIncomplete; no throw.
- E6 horizon law with a later prior: variant where one other root's due is `now+4` and the target's `now+2` → `claims.horizonEndWeek === now+4`, producer run to `now+4`, certificate complete, class per E3.
- E7 rival/absent industry: rival-issuer draft → no producer run (attempts `[]`, `work` tiny), both flags incomplete, omissions contain the rival string; FRAGILE/UNCERTIFIED; never a throw. Also `hollywood: null` variant.
- E8 purity/determinism/permutation: `structuredClone` equality of `state`, `claims`, `limits` before/after; repeated call `toEqual`; reversed `state.promises` order → identical output; tariff `w_e` pinned to its formula.
- E9 limits pass-through: `input.limits` is the caller's object (`toBe`); `limits.work: 200001` → the producer's `limits may only lower the published caps` throw (:2679) surfaces unrelabelled; `span` below the horizon distance → producer `sizeLimit` cut → certificate incomplete → UNCERTIFIED/sizeLimit via the kernel, never PROVEN_*.
- E10 surface: `Object.keys(enumeratorModule).sort()` equals the exact runtime export list; `assembleCapacityInput` with the 5th argument yields the supplied flags and omits `NO_ENUMERATOR_OMISSION`; without it, byte-identical to RED 7's hand assembly (RED 7 stays the pin).

**Writable paths (writer):** NEW `src/core/promiseCapacityEnumerator.ts`; `src/core/promiseCapacityOwners.ts` :151-168 only (5th parameter, `EnumerationCoverage` type, optional `limits` re-literal). Test-author: the one new test file plus the `unscheduled` World field inside it. Nothing else.

**Serial fixed-source checks (539 §3 list, unchanged):** new file GREEN; `p14b4-owner-adapter-first-slice` 33 PASS unchanged; kernel 41, hold-order 5, stable-sort 7, sort-owners 7; Ready 17 PASS + the sole stale FAIL (:234); Started 28; material 17; `p14b1-*`, `p14b2-*`, `p14b3-*`, `p14bf2-*`, `bridge-p14b1-promises`, `bridge-p14b3-promise-command` pass/fail-set identical (the two pre-existing B1/B2 control drifts stay attributed separately); twelve historical save files 137; the six B4 live-P2 groups byte-identical to 536/549; root+UI typecheck; bridge tsc with its sole OLD TS2353.

**D1/D2 dependence.** D1: untouched; the enumerator is detached (no live importer, no `rulesVersion`/`week`, no receipt); the installed capacity cases stay unreachable through the live scalar. D2: the short-horizon certificate does not depend on it (the Ready producer is not run); every window beyond `now+5` is truthfully UNCERTIFIED until D2 (and a Ready staffing slice) exist. 553 record-only items 1-2 are carried as live-wiring rules above; items 3-6 unaffected.

**Evidence limits.** Paper only: nothing executed, hashed or diffed. The kernel classes for the 13 cells are 538's OBSERVED results under author-assumed coverage (:33); the enumerator supplies the same flags with different omissions, so the class is expected identical and the digest different — a reading. The `unbound(support)` cell is unmeasured. The floor derivation is by reading operations.ts :1640-1712, tick.ts :296-345/:1095-1111, productionPhases.ts :36-45 and the two replay tests; I did not read the whole `advanceManagedProductions` body, so "every other branch only delays" is from its comments and the fixtures' loops. Ready-producer cost on `ready` (as opposed to `opened`) is unmeasured, irrelevant under β. No native, usability, Save30, projection or Owner-acceptance claim.

**Next concrete action.** Parent sends this note for independent READ-ONLY review (floor lawfulness under plan :112-116/:292; the (a)/(b)/(c) started-domain conditions; α vs β; the one-hunk adapter extension and the `limits` re-literal), then a test-author RED per the E-list, then ONE sim-core writer on the two writable paths with the serial checks above.
```

### 4.2 — 555-B (contract-auditor, READ-ONLY review)

```text
# 555-B — independent READ-ONLY review of design note 555-A (enumerator slice)

**Status: DONE.** Verdict **REFINE** (keep the floor, the started-domain certificate, β, the new module and the one-hunk adapter extension; seven exact changes below, one of them a real certificate-semantics defect). No file created or edited, no command, no Git, no network, no delegation. The three files the test-author is editing were not opened.

**Model observed:** the harness identifies this session as Fable 5.1 (`claude-fable-5-1`); not independently verifiable. lean-ctx MCP tools named in the user CLAUDE.md were not exposed; Read/Glob/Grep only.

## Sources read (absolute paths, line ranges)

- Note under review: `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/555-A-report.md` whole (133 lines).
- Plan `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md` :95-144, :228-327.
- Records (`…/evidence/p14b4-20260919/`): `553-…qualified-checkpoint.md` whole; `539-…design-review.md` :1-140, :318-349; `540-…red-installed.md` whole; `538-capacity-budget-measurement.md` :1-110; `538-admission-bill-contract-review.md` whole; `537-…decision-items.md` grep (D1 :66-78, :540-542). `…/evidence/p14bf2-20260919/13-…preparation.md` whole; `14-…review.md` whole.
- Source (`/Users/zacheryspector/The-Movies-headless-program/src/core/`): `operations.ts` :586-830 (workflow creation :605-615, assign/clear/arrive/schedule :684-807), :1540-1832 (the WHOLE `advanceManagedProductions` body :1576-1831), grep of every `remainingTicks`/`blocker`/`shootingTask` write; `tick.ts` :285-444, :1085-1111; `actions.ts` :95-120, :286-562 (`applyGreenlight`), :1712-1760 (`commitQueuedIntent`), :1771-1860 (shooting actions), :1917-1991, :2046-2078, :2284-2372 (grep); `productionAdmission.ts` :98-138 (`requireGreenlightHeader`); `queueAdmission.ts` :24-98; `hollywoodTick.ts` :240-269; `productionPhases.ts` :1-105; `tuning.ts` :55-64, :876-885, :926-935; `screenplay.ts` :373-396; `sceneryLoadIn.ts` grep (:171-175, :214-233, :274-290); `promises.ts` :36-99, :100-160, :240-354; `promiseCapacityOwnerReplay.ts` :155-160, :481-487, :687-700, :534-629, :1879-2020 (`frame`), :2540-2599, :2666-2797; `promiseCapacityKernel.ts` :60-124, :380-464, :495-524, :618-662, :920-1047, grep (`dueWeekExclusive` :588/:781, `certifiedUpperBound` :71 only); `promiseCapacityOwners.ts` whole (198); `types.ts` :700-758.
- Tests: `tests/p14b4-cast-class-capacity.test.ts` :95-300, :338-366; `tests/p14b4-owner-adapter-first-slice.test.ts` :205-263, :530-583, :645-719; `tests/p14b4-ready-replay-first-take.test.ts` :145-234.

## Answers

### 1. Fresh-take floor — MET WITH EVIDENCE (by reading). KEEP.

The floor is used only negatively (an upper bound of ZERO issuer takes inside `[now, now+5)` from any picture not started at source-now). That is plan :292's "valid hard upper bound/direct legal refusal" applied to a sub-domain, not :112's "minimum countdown … certified availability" (which forbids the POSITIVE use, and 555-A makes none). Chain, each link verified:

- Admission sets the clock: `applyGreenlight` actions.ts:298 `const currentTick = state.market.tick`, :344-345 `const startTick = currentTick; const remainingTicks = TUNING.PRODUCTION_TICKS`; tuning.ts:59 `PRODUCTION_TICKS: 8`; replay :2577 `startTick: prepared.now.week, remainingTicks: TUNING.PRODUCTION_TICKS`. Grep of `remainingTicks: (TUNING.PRODUCTION_TICKS|\d)` in src/core: only these two constructors (rival pictures are the rival's, hollywoodTick :259 stamps `studioId: b.studioId`). Every player greenlight door (`greenlightScriptProject` :2284, `…Now` :2342-2348, legacy stock `greenlight`) funnels into `applyGreenlight`.
- Queue: `commitQueuedIntent` actions.ts:1750-1757 calls `applyGreenlightScriptProject(state, …, week, false)` on the state tick.ts:410-412 builds with `market: { ...state.market, tick: currentTick + 1 }` → `startTick = n+1` → floor n+6. (555-A §2 item 1 cites only tick.ts :388; add :410-412 and actions :1750-1757.)
- Same-week skip: operations.ts:1658-1661 `if (original.startTick >= currentTick) { settled.add…; continue }`; legacy arm :1606; tick.ts:318-319.
- One decrement per weekly advance, no skip: the only `remainingTicks` writes in the sweep are :1684 (5→4), :1764 (1→0), :1782 (`nextRemaining = remainingTicks - 1`, :1751) and `enterPhase` :1431 (`remainingTicks - 1`); the setup hold :1709-1740 `continue`s at 6 without decrementing; :1671-1676 throws (not a shortcut) on a phase/countdown disagreement.
- The take fires only at :1680-1689 `if (production.remainingTicks === 5) { … if (task === null || task.status !== 'scheduled' || workflow.blocker !== null) continue; … firstTakes.push(production) }`. `scheduleShootingTake` :793-797 needs `phase === 'shooting' && task.status === 'ready' && blocker === null`; the task is `null` at workflow creation (:609) and exists only after shooting entry, so scheduling needs the boundary AFTER the sweep that produced r=5.
- Stamp: tick.ts:1102-1108 `appendFirstTakes(…, finalized.market.tick)` = the produced week (first-take test :184 `take.week === state.market.tick` post-tick, :190 `=== commands[1].week + 1`); producer :1882/:2014 `takeAt = { week: branch.week + 1 }`.
- Other callers of the sweep: tick.ts:336 (player), hollywoodTick.ts:257 (rivals), replay :1955 (detached). `appendFirstTakes` has one caller (tick.ts:1102); `hollywood === null` records nothing (promises.ts:124). Legacy operations: `firstTakes: []` (:1621) and the producer cuts `unsupportedContext` (:618).
- Only delays: load-in `weeks ≥ SCENERY_LOAD_IN_WEEKS_BASE` 1 (sceneryLoadIn :171-175); due-at-call settlement (actions :1789-1797) makes n+5 tight, never earlier (assign requires `'unassigned'` :700); casting acknowledgement (productionAdmission :117-128), founding gate (:135), phase-entry blockers (:1809-1816) all push later.

Arithmetic n → skip n → 8→7 (n+1) → 7→6 (n+2) → 6→5 (n+3) → schedule at boundary n+4 → 5→4 at sweep n+4 → stamped n+5. No lawful path records an issuer first take before now+5. The generalised started floor `now + (s ≥ now ? 1 : 0) + (r − 5) + 1` checks for r = 5, 6, 8 (538: now 60 → take 61 for r=5 scheduled).

### 2. Started-domain conditions (a)/(b)/(c) — KEEP with one fold (REFINE).

- (b) verified: no lawful writer reverts `'scheduled'`: `assignShootingDirector` requires `'unassigned'` (:700), `clearSceneryLoadIn` `'blocked'` (:723), `arriveDueScenery` `'blocked'` (:772), `scheduleShootingTake` `'ready'` (:796); `enterPhase` :1370 is never reached at r=5 (the :1680 branch `continue`s); grep finds no other `shootingTask`/`blocker` writer. `cancel` (actions :567) only removes. The fixed-point loop cannot skip it: `settled` + restart (:1653-1661, breaks at :1775/:1806/:1815 set `progressed = true`), so every unsettled picture is visited. The Started producer's `commands: []` trace reproduces exactly this: `frame` :1922 `arriveDueScenery` (no-op on `scheduled`) → :1955 the same `advanceManagedProductions` → :2007-2016 `calendar.firstTake = { week: arrivedWeek }`; 538 scenario 1 observed firstTake 61 on now 60.
- (a) REFINE: fold in the producer's own law. replay :690 `let historicallyFilmed = production.remainingTicks < 5`, :693 OR an issuer-matched receipt, invariant :2011 `!picture.historicallyFilmed`. Since :1680 is the only take branch and the countdown is monotone, a picture at r ≤ 4 can never fire; (a) := "issuer-matched take recorded OR `remainingTicks < 5`". Without the fold, a migrated or `hollywood: null` picture past shooting with no receipt gets a spurious "command timings" omission.
- (c) KEEP (formula verified).
- Completeness of {a',b,c}: the residue is exactly r ≥ 5, not forced, floor < horizon — take date depends on command timing (assign/clear/schedule) and, for r ≥ 6, on phase-entry acquisition. The omission is lawful under 13 :95-96 ("omitted lawful staffing/facility/start alternatives … bypassed command boundary"). Wording REFINE: name facility acquisition as well as command timing for r ≥ 6. "Removal-only alternatives are dominated" holds for this certificate because (b) acquires nothing (:1680-1695) and (c) is a pure countdown bound, so cancelling one picture cannot advance another's take inside I.

### 3. Stock door and commissions — MET; one citation fix.

- `requireGreenlightHeader` lives in `src/core/productionAdmission.ts:98-133`, not actions.ts (actions.ts:106-111 is an import list; the parent's brief has the same slip; 555-A's row cites bare ":106-111"). :106-111 throws unless `scriptProject.status === 'ready' && assessment !== null`; :129-133 refuses a projectId under legacy development. Managed stock door closed by law: MET.
- Legacy development + managed operations: the stock greenlight is the same `applyGreenlight` (:344-345) with the workflow added at :500-543 → the floor bounds it; folding it into the fresh-admission omission is lawful (13 :57 treats it as a separate path; the omission names it).
- Commissions: `requireCommissionableWriter` :1970/:2053; `scriptDraftWeeks` screenplay.ts:373-396 clamps to `SCRIPT_DRAFT_WEEKS_MIN` 1 (pool = `SCRIPT_DRAFT_WEEKS_POOL` 1); completion at the tick (13 :67), acceptance a subsequent command (13 :40) → greenlight ≥ now+1 → take ≥ now+6. `now+1+5` is a sound lower bound. KEEP.
- Gap in the omission wording (REFINE): a project already in `review`/drafting at source-now can be accepted and greenlit at boundary `now` (take ≥ now+5, still bounded by the floor) but is neither "Ready staffing" nor "commission". Word `FRESH_ADMISSION_OMISSION` as "any picture not started at source-now (Ready staffing alternatives, scripts in drafting/review, stock door, commissions) is not enumerated beyond the fresh-take floor".

### 4. Certificate semantics vs the kernel — DEVIATES (one real defect). REFINE.

Kernel: `normalizeTraces` :459-461 maps and verifies nothing; `classifyDomain` :934 `complete = existingAlternatives === 'complete' && allAlternatives === 'complete'`; `impossible()` at :944/:952 and PROVEN_FRAGILE at :958/:969 only when `complete`; :943 `stopProfile: upper` and :945 `saturated` key on `existingAlternatives` ALONE; CERTIFIED_ACHIEVABLE :961-964 needs neither flag.

Defect: 555-A §1 row 2 says the fresh-admission omission makes "`allOwnerTraces` AND `existingCalendars` incomplete (Ready is an existing path, :237)", but §4 step 4 defines `existingCalendars` without the floor condition and E4 pins `now + 6 → allOwnerTraces:'incomplete', existingCalendars:'complete'`. Plan :236-237 and :241 make Ready scripts existing paths with an existing-path flag; beyond the floor they are un-enumerated, so `existingCalendars` must be `'incomplete'` too. Consequence of the wrong flag: :943/:945 would stop the prior optimisation at `upper` computed from `upperPaths` (:641-651, supplied traces only) while an existing Ready path for a prior is missing, and CERTIFIED_ACHIEVABLE could be issued over an under-protected prior profile (ExampleB, plan :106-108, :265-269). Unreachable in practice in this slice (B = 2 needs two events; one started picture gives one per person; 538-C Q4), but the certificate would be untruthful. Exact change: `existingCalendars = allOwnerTraces = (every attempt complete ∧ no producer omission ∧ ∀ issuer picture (a')/(b)/(c)) ∧ claims.horizonEndWeek ≤ now + FRESH_TAKE_OFFSET`; the two flags coincide in this slice (a per-family split would give `existing` floor now+5 and `all` floor now+6, but `existing ⊂ all` means both are still incomplete for now+5 < horizon ≤ now+6, so nothing is gained). E4 at now+6 → both incomplete, omissions contain the fresh-admission string; keep a separate loud pin that the Started attempt to now+6 is `complete` (a producer fact).

Verified KEEP items: half-open edge — kernel :588 credits `firstTake.week < dueWeekExclusive`, :162-164 half-open overlap → `claims.horizonEndWeek <= now + 5` is the right comparison; interval — `claims.horizonEndWeek` (owners :139, priors only) equals the kernel's effective horizon (:998-999; foreign debits :992-996 are debits, plan :262-263) and `validateTraces` :511 requires the trace to cover it, so the producer must run to `claims.horizonEndWeek` (555-A step 3 does); prior-optimisation stop :943/:945 is truthful once `upperPaths` holds every existing take reachable inside I; ExampleB — one trace, nothing to reallocate.

### 5. Relabelling — MET. KEEP, one shape to specify.

"Never assert completeness on a cut" is implemented by the stated rules (any cut → attempt `'cut'` → both flags incomplete); WorkLimit/sizeLimit are disposed by the kernel before or independent of the flags (:982, :1010-1015, :1034) → never PROVEN_*. Huge/outside-contract drafts through the adapter alone → producer :549 `sizeLimit` → kernel :1013 `sizeLimit` → UNCERTIFIED; 555-A §2 correctly lists them as not reachable and carries the live-wiring rule (scalar structural refusal first, 539 §1). REFINE: §4 step 2 "saturate w_e against limits.work before running anything" gives no return shape; mirror replay :2686-2687 (`attempts: []`, `preparationWork: limits.work`, omission `'work limit before enumeration completed'`, both flags incomplete) so assembly → kernel :982 → `UNCERTIFIED/workLimit`, `workUsed = limit` (:1034). β: KEEP — truthful (plan :296 "domain incompleteness" with a named omission), cheaper (plan :319-320), and α could not certify under D2 (538-C Q3/Q4). Carry 13 :104-106/14 :19-21: β does not close ordinary-offer coverage; 555-A §3 says so.

### 6. API/shape — KEEP, two refinements.

- New module + one-hunk 5th parameter: default `NO_ENUMERATION` reproduces owners :162/:166 byte-for-byte (same four omission sources with `NO_ENUMERATOR_OMISSION`, flags `'incomplete'`) → RED 7 `toEqual` and RED 8/9 unchanged; `export type` adds no runtime key → RED 11 :711-712 safe. State explicitly that `NO_ENUMERATION` stays unexported.
- `FRESH_TAKE_OFFSET` derived from `productionPhaseForRemainingTicksOrNull`: sound, and preferable to importing `WEEKS_TO_FIRST_TAKE` (promises.ts:44-50 declares it a HYPOTHESIS, "none of these is settled law"; 13 :102). Caveat: the take branch is operations :1680's literal `=== 5` (and :1133's "Shooting remainingTicks must be 5 or 4"), not the phase table; E1's natural-chain pin is the link to the take owner, keep it.
- Work accounting: KEEP. The asymmetry already exists in the landed law (owners :167; RED 7 hand assembly :546); overshoot ≤ `claims.work`, same label either side (kernel :1034 `workUsed: budget.limit`). Reseeding the producer with `claims.work` would move RED 7. (I did not read 176 §1; this rests on 539-B Q6 and 553-R §1 as recorded.)
- 553-R item 1 re-literal: take it in the same hunk. Safe: RED 7 `toEqual` is key-order insensitive; RED 12 pins only "limits change → different digest" and the 16-hex shape; no exact digest is pinned (540 §digest). Routine, not Owner-gated. BUT E9 pins `input.limits` `toBe` the caller's object, which a re-literal breaks. Choose one: re-literal + E9 `toEqual` with canonical key order, or no re-literal + `toBe`. Recommend the former.

### 7. RED list E1–E10 — per item.

- E1: constant and formula cells pin law. The natural-chain `=== now + 5` on `opened` is a fixture observation (setup `null` at creation :614 → no hold; load-in base 1 week :171-175 with due-at-call :1789-1797 gives n+5 only if the set's distance yields 1 week). Pin `take.week >= now + FRESH_TAKE_OFFSET` as law; assert `===` only as a guarded observation that reports the observed week. 538 :60's "week 50" is not shown as native (538 scenario 3's producer cut before admission); NOT VERIFIED.
- E2: fine (requires a second Started run seeded with `preparationWork: w_e`, ~108k, within cap).
- E3: `PROVEN_IMPOSSIBLE.reason` is always `'completeCountFailure'` (:935-936; `certifiedUpperBound` exists only in the type :71) — correct to pin. Eligible → `PROVEN_FRAGILE/achievableProbeFailed` matches 538 :33 (flags identical; omissions are read only for the uncertain fallback :933). `unbound(support)` IMPOSSIBLE is PAPER (plan :106) and unmeasured — author it to report a different class loudly, not to loosen. `workUsed > producer.preparationWork` holds (`claims.work ≥ 1`).
- E4: change per Q4. Additionally NOT VERIFIED: the Started producer to now+5/now+6 on `w.ready` crosses 4→3 (post entry) and beyond; 538 measured now+2 only, and 555-A §3 itself names the wrap/release stale route for long runs. Author with a loud precondition `producer.attempts[0].kind === 'complete'`.
- E5: lawful (state captured by the copied builder before `scheduleShootingTake`, capacity test :172; real owner state; status `'ready'` fails (b)). Omission must name `w.productionId`.
- E6: lawful tagged variant (window patch only); producer run to now+4 shares E4's unmeasured caveat.
- E7: covers the `playerStudioId` mismatch (rival issuer) and `hollywood: null`. Fine.
- E8: fine; the w_e formula must be written in the RED (as 540 choice 1).
- E9: 200001 → producer :2679 throw surfaces unrelabelled (the enumerator's own saturation at step 2 does not fire at 200001). `span` → kernel :1013 `sizeLimit` precedes :1029. Fix the `toBe` conflict (Q6).
- E10: fine; add "`NO_ENUMERATION` not exported; RED 11 key list unchanged".
- Missing cases to add: (i) admitted-this-week picture: real greenlight of the second Ready script on `opened` at now, 2-week draft on its lead → (c) floor now+5 ≥ horizon → complete → PROVEN_IMPOSSIBLE (mirrors capacity :243-244 "A fresh film cannot complete before due in two weeks"); (ii) (a) via `tick(w.ready)` (roots SATISFIED, r=4 with receipt): a fresh unbound 2-week draft → complete → IMPOSSIBLE; (iii) queue non-empty → producer cut :624 → both flags incomplete/UNCERTIFIED, only if a real greenlight on `w.ready` lands in the queue (fail-loud precondition, else record unconstructible); (iv) the `remainingTicks < 5` arm of (a') pinned on plain `Pick` inputs of the helper, not by editing `firstTakes` in memory (owner history; 23/537-B G4); (v) w_e saturation shape with `limits.work` tiny → UNCERTIFIED/workLimit.

### 8. Overall — REFINE.

Sound core: the floor (Q1), the forced-take condition (Q2b), β (Q5), the new module and the 5th parameter (Q6). Required changes before RED: (1) both certificate flags gated by the floor (Q4; E4 expectation changes); (2) fold `remainingTicks < 5` into (a) (Q2); (3) specify the w_e-saturation return shape (Q5); (4) widen the omission wording to drafting/review scripts and facility acquisition (Q2/Q3); (5) resolve E9 `toBe` vs the `limits` re-literal (Q6); (6) E1 natural chain as `>=` law plus guarded `===`; (7) loud producer-completeness preconditions in E4/E6. Cite `productionAdmission.ts:98-133` and tick.ts:410-412/actions.ts:1750-1757.

Owner-gated surfaces: none settled. No receipt/`rulesVersion` (D1 open), no cap/metric/tariff change (w_e is a preprocessing charge of the class 539-B Q6/553-R §1 accepted under plan :316-318, formula to be fixed by the RED), no Ready-producer change, no multi-admission (538-C Q3), no live wiring, no fixture edit. The only new law is the derived fresh-take floor, an owner fact of operations/tick/actions, not a product decision.

## Defects in 555-A (section → source line)

1. §1 row 2 vs §4 step 4 vs E4 — `existingCalendars` complete beyond the floor contradicts plan :236-237/:241 and exposes kernel :943-945/:961.
2. §1 row 1 (a) — missing the `remainingTicks < 5` no-event law (replay :690/:2011; operations :1680 sole take branch).
3. §1 row 3 — `requireGreenlightHeader :106-111` is `productionAdmission.ts:98-133`; no file named.
4. §4 step 2 — w_e saturation return shape unspecified (replay :2686-2687 precedent).
5. §4 / E9 vs recommended re-literal — `toBe` on `input.limits` cannot survive a re-literal.
6. §5 E1 — `=== now+5` natural chain is fixture tightness, not the floor law; 538 :60 not shown native.
7. §5 E4/E6 — Started runs beyond now+2 on `w.ready` unmeasured.
8. §2 item 1 — queue mechanism cited as tick.ts :388 only; the later-week fact is tick.ts:410-412 + actions.ts:1750-1757.
9. `FRESH_ADMISSION_OMISSION` — omits drafting/review-status scripts.

Verified-correct citations (no action): operations :1606/:1658/:1671-1676/:1680-1696/:1698-1712/:1621; tick :298/:318-319/:388/:1102-1108; productionPhases :36-45; tuning :59/:880-882/:932; actions :336-338/:344-345/:1970/:2053; replay :618/:621-622/:624/:2574-2577/:2679/:2681; kernel :453-461/:934/:943-945/:1028-1029/:982; owners :151-168/:160/:185-188; promises :249-258/:342; first-take test :190/:220; capacity test :176-178/:237-247/:254-261/:266-268/:279-282/:290-294/:346-359; first-slice test :211-216/:244-263/:652-660/:711-712.

## Evidence limits

Paper only; nothing executed or hashed. 538's numbers and the "week 50" observation are the parent's record. Kernel search internals (:522-920) read only at :588/:781. The fixture set's load-in distance and whether `w.ready` can queue a greenlight are unknown. 176 §1 not read. Whether the Started producer completes to now+4/5/6 on `w.ready` is unmeasured. No native, usability, Save30, projection or Owner-acceptance claim.

## Next concrete action

Parent records 555-B as REFINE, applies the seven changes to the enumerator brief (certificate flags, (a') fold, saturation shape, omission wording, E9/re-literal choice, E1 `>=`, E4/E6 preconditions), then releases the test-author for the E-list RED (with the added cases i–v as it judges constructible) and ONE sim-core writer on the two writable paths with the 539 §3 serial checks.
```
