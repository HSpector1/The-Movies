# 619-A — Design note: final seating preference at the rival billing comparison

READ-ONLY paper note. Worktree /Users/zacheryspector/The-Movies-headless-program, HEAD 62ca561a, clean tree.
No edits, no vitest/tsc/node. Law: P14B4-HEADLESS-PLAN.md :215-236; record 26 §2 :80-87; records 600/616/618.
Every line number below is HEAD 62ca561a. Where the task brief's line numbers differ from HEAD, HEAD wins and the
difference is named.

## 1. HEAD facts

### 1.1 src/core/hollywoodPolicy.ts — chooseIndustryPackage (:32-66)
- :18 `BILLINGS=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]` — the six permutations, fixed iteration order.
- :21-28 `perceivedPlanningInputs` — detached planning view (hidden actual persona/strength never reach the AI).
- :32-34 signature: `(input:ReceptionInputs, policy, options:{seed;key;cashAvailable;weeklyCost;lockScreenplay})`.
  No GameState, no promises, no RNG stream object.
- :35 `planning=perceivedPlanningInputs(input)`; :36 `actors=[planning.cast.lead,planning.cast.antagonist,planning.cast.support]` —
  the triple the permutations act on; a person absent here can never be seated.
- :37 `let best=null; let bestScore=-Infinity`.
- :38 outer loops `shape` (locked → `[planning.shape]`, else the six SHAPES) × `billing` (BILLINGS).
- :39 `inp` = planning + shape + `cast:{lead:actors[b0],antagonist:actors[b1],support:actors[b2]}`.
- :40-44 planning-only promise range derivation (`!lockScreenplay`).
- :45-49 `required` negative; `scale` loop over `TUNING.HOLLYWOOD_NEGATIVE_CHOICES` (:46); marketing menu loop (:49).
- :50 cash gate: `if(negative+marketing>options.cashAvailable)continue`.
- :52 `computeForecast(candidate,{seed,productionId:options.key,...},true,true)` — derived stream
  `stream(seed,'forecast',productionId)` (forecast.ts :408), never the sim stream.
- :53 `expectedIncrementalContribution`; :56 `holdOperatingMargin=-weeklyCost*(PRODUCTION_TICKS+THEATRICAL_WEEKS)`;
  :57 `expectedOperatingMargin`.
- :59 `score=expectedOperatingMargin-|marketing/max(negative,1)-policy.marketingRatio|*HOLLYWOOD_POLICY_PREFERENCE_COST`.
- :60 viability gate (brief said :59): `if(options.lockScreenplay&&score<=holdOperatingMargin)continue`.
- :61 strict-greater comparison (brief said :60): `if(score>bestScore){bestScore=score;best={shape,promise,budget,cast:{ids},…}}`.
- :65 `return best` (null when nothing passed :50/:60).
Consequence of :61: among equal scores the FIRST candidate in (shape, billing, scale, marketing) iteration order is kept.
That is the "inherited BILLINGS iteration fallback".

### 1.2 src/core/hollywoodTick.ts — decide (:153-224)
- :153 `decide(state:GameState,h,b,talent,week)`; :154-155 decision cadence (`TUNING.HOLLYWOOD_DECISION_WEEKS` = 1, tuning.ts :29).
- :156 `busy=busyTalentIds({...state,hollywood:h,talent})` — employment.ts :160-171 = player production companies +
  active writing + `industryBusyTalentIds` (hollywood.ts :89-101: rival drafting/rewriting writers + rival production
  companies) + active research seats.
- :157 `people` map; :158 `employees=currentEmployees(h,b.studioId)` → hollywoodTick.ts :53-55 maps
  `h.activeEmploymentOrdinals` in ORDINAL ORDER filtered to this studio — "employment order". Renewal in `staff()` keeps
  the position (:116 `map(i=>i===ordinal?newOrdinal:i)`); a market win appends at the end (talentMarket.ts :986).
- :159-160 one ready script at a time; `if(b.productions.length!==0)break`.
- :161 `director=employees.find(role==='director'&&!busy)`; :162 `actors=employees.filter(role==='actor'&&!busy).slice(0,3)`;
  :163 `craft=employees.find(role==='craft'&&!busy)`; :164 guard `director&&actors.length===3&&craft`.
  The rival path is role-disjoint by PRIMARY role; it never calls productionAdmission's validator.
- :167-168 `provisional` package (cast = actors[0..2] in employment order, `writerId:ready.writerId`).
- :169-170 the greenlight call: `chooseIndustryPackage(inputsFor(state,h,b,provisional,ready,people), b.policy,
  {seed,key:`${studioId}:package:${ready.id}`, cashAvailable:cash-operatingReserve, weeklyCost, lockScreenplay:true})`.
- :171-186 on a candidate: id (:173), `choices={...provisional,budget,cast:candidate.cast}` (:174), `inputsFor` again (:175),
  `forecastSnapshot` (:176-177), `Production` (:178-179, `participants:buildFilmParticipants(...)` — discipline by SLOT,
  filmParticipants.ts :52-54, not by primary role), workflow/link/money/receipt `filmAnnounced` (:180-185).
- :212-214 the SCREENPLAY-PLANNING call (`lockScreenplay:false`), cast = first three role-actors WITHOUT the busy filter;
  only `shape`/`promise` are kept (:216). Must stay byte-identical.
- `inputsFor` (:63-70): receives `state` already; reads `b.projects[ordinal]`, `h.concepts`, `partsFor` (people by id),
  `industryMarket(state.market)`, `b.standing`, `state.era`, assessment override. Nothing promise-related.
- `advanceHollywoodWeek` (:227+) runs PRE-increment: `week=state.market.tick` (:233), tick.ts :929 passes `admitted`
  whose `market` is `state.market` (tick.ts :432). `decide` at :250, `operateStage` :251, `advanceManagedProductions`
  :257 with `currentTick=week` (a picture greenlit this week is skipped: operations.ts :1658-1661).

### 1.3 src/core/promises.ts
- :53 `WEEKS_TO_FIRST_TAKE=5` (exported; also index.ts :1418).
- :272-282 is `seatedPreFirstTake` (the brief's :274-283); the reservation membership is :289-298 `activePromiseReservations`:
  `outcome===null && (contractId!==null || attached.has(promiseId))` — it deliberately INCLUDES current attached
  (unaccepted) offers because a feasibility QUOTE must reserve capacity for offers on the table (:284-288, :584-586).
  That is exactly why the seating rule must NOT reuse it: an unaccepted offer binds nobody; seating for it would spend a
  real seat on a promise that may never exist.
- :588-590 `evaluable(promise) = outcome===null && contractId!==null` — the bound-OPEN predicate (module-private).
- :592-597 `promiseCastSlots`: no `kind` → `['lead','antagonist','support']`; `seatClass==='lead'` → `['lead']`; else
  `['lead','antagonist']`. Masks are NESTED, so any intersection equals the narrowest mask.
- :599-613 `qualifyingTakes`: same issuer, `windowStartWeek <= take.week < dueWeekExclusive`, beneficiary in a mask slot,
  distinct productions.
- :652-692 `advancePromisesWeek` — the outcome owner: SATISFIED at count (:660-676), BROKEN at due (:678-685),
  `progress` refreshed from takes every week (:687-689). Runs post-increment at tick.ts :1110 AFTER `appendFirstTakes`
  (:1102-1108), so at the next `decide` `promise.progress` already reflects last week's takes.
- :407-409 has-discipline law = `person.skills.acting !== undefined` (mirrors productionAdmission.ts :89-96 `requireRole`).
  NOTE: `SkillProfiles` (types.ts :95-101) declares `acting` non-optional, so every typed person passes; the test is
  defensive, not selective.
- types.ts :2179-2233: `ProfessionalPromiseV30` union; `CastRoleCountPredicate {kind:'castRoleCount';count;seatClass}`.

### 1.4 src/core/talentMarket.ts :1275-1296 — authorRivalPromise
Rival authors at its own proposal: unproven → `[flexible(leadOrAntagonist,count 1), p1]`, proven → `[p1]`; window =
the whole proposed term (:1278); first REASONABLY_ACHIEVABLE attaches (:1293). The subject is ANY role the rival
retains/bids on (:1216-1241; trigger :630-649 (a) own person in window), so a rival's writer/director/craft/scientist can
hold a cast promise (the feasibility service checks acting-profile presence only, :407-409). Binding: `contractId` set at
settlement (`commitWinningPromise`, ruling (i) :575-586); a rival winner's row is appended at :985-986.

### 1.5 Double-role / exclusivity law
- Player greenlight: productionAdmission.ts :150-208 `resolveGreenlightStaffing` — has-discipline per seat (:154-172),
  distinct cast (:174-179), one role per person incl. the WRITER credit (:180-199, M16.7); :210-220 idle gate;
  actions.ts :319-338 (writer credit is not a seat but cannot double on the same picture, :330-333).
- Rival packages: NO validator is called; disjointness today is an accident of primary roles (:161-163, :191).
  A promised-person generalization must re-state the exclusions itself (writer of `ready`, chosen director, chosen craft,
  busy, has-discipline) — §2(d).

### 1.6 First-take timing (operations.ts)
- :1680-1696 the 5 → 4 branch: only with `shootingTask.status==='scheduled'` and no blocker; pushes the production into
  `firstTakes` (ephemeral, :1517-1523); a picture greenlit this week is settled untouched (:1658-1661).
- tick.ts :1102-1108 appends the durable receipt with `finalized.market.tick` (post-increment).
- Timeline for a rival greenlight at pre-increment week W (startTick=W, remainingTicks=8): W (skipped) → W+1: 8→7 →
  W+2: 7→6 → W+3: 6→5 → W+4 advance moves 5→4, receipt week = W+5 = W + WEEKS_TO_FIRST_TAKE. Matches promises.ts
  :352-365 `expectedFirstTakeWeek` (k=0, nothing running: `from + 5`; running: `max(1,remainingTicks-4)+(startTick>=from?1:0)`)
  and the seed-b witness (search hit at tick 215 with remainingTicks 5 → greenlight 211 → receipt 216; the "week 216"
  three-promise take in promises.ts :670-672).

## 2. Design

### 2(a) Member reader — `promisedCastMasks` in src/core/promises.ts
Place: after `promiseCastSlots` (:597), before `qualifyingTakes` (:599). Why promises.ts and not hollywoodPolicy.ts:
the bound-OPEN predicate (`evaluable`, :588, module-private) and the mask reader (`promiseCastSlots`, :592) both live
here; the membership rule is a promise-root READ owned by P14B, not a policy fact; hollywoodPolicy.ts today imports no
GameState and stays a pure function of `ReceptionInputs`+options (keeps the planning call :212 untouched and the
chooser testable by inputs alone). hollywoodTick.ts is the only site that holds state + studio + week.

```ts
/** P14B.4 final seating preference (plan :215-236): the people a package decided this week should seat, each with the
 * INTERSECTION of the masks of every promise a take in `takeWeek` could serve — bound OPEN, unmet, this issuer, take
 * inside the half-open window. CURRENT unaccepted offers never count: they reserve quote capacity
 * (`activePromiseReservations`) and bind nobody. Reads `state.promises` only; no receipts, no RNG. */
export function promisedCastMasks(
  state: Pick<GameStateV30, 'promises'>, issuerStudioId: string, takeWeek: number,
): ReadonlyMap<string, readonly CastSlot[]> {
  const masks = new Map<string, readonly CastSlot[]>()
  for (const promise of state.promises) {
    if (!evaluable(promise) || promise.issuerStudioId !== issuerStudioId
      || promise.progress >= promise.predicate.count
      || takeWeek < promise.windowStartWeek || takeWeek >= promise.dueWeekExclusive) continue
    const slots = promiseCastSlots(promise)
    masks.set(promise.beneficiaryPersonId,
      (masks.get(promise.beneficiaryPersonId) ?? CAST_SLOTS).filter((slot) => slots.includes(slot)))
  }
  return masks
}
```
Membership, term by term: `evaluable` = `contractId!==null && outcome===null` (:588-590); unmet = `progress < count`
(`progress` is refreshed by the outcome owner every week, :687-689, before the next decide); same issuer; prospective
take = `takeWeek` (caller passes `week + WEEKS_TO_FIRST_TAKE`, §1.6) inside `[windowStartWeek, dueWeekExclusive)`
(the same half-open test as `qualifyingTakes` :608). Legacy count-only stays generic (`CAST_SLOTS`), tagged stays exact,
one beneficiary with several applicable promises gets the intersection (nested masks → the narrowest). Map insertion
order is `state.promises` order (deterministic); the seam re-orders by employment order anyway and the benefit count is
order-free. `takeWeek` is a plain number, so no slack, no schedule replay, no receipts (contrast promiseCapacityOwners.ts
:113-135, which counts CURRENT attached offers and is player-only — not reusable here).

### 2(b) Benefit of a cast triple
`benefit(cast) = |{ slot ∈ {lead,antagonist,support} : masks.get(cast[slot].id) includes slot }|`.
The three seated people are distinct (`employees` holds one active row per person per studio; `.filter`/`.slice` cannot
repeat one), so counting satisfied SLOTS equals counting DISTINCT beneficiaries whose assigned role satisfies their mask.
No weighting, no per-promise double counting.

### 2(c) Chooser change — lexicographic (benefit, score), inherited fallback
hollywoodPolicy.ts, in the loop of :38-63:
1. New optional option `promisedMasks?: ReadonlyMap<string, readonly CastSlot[]>`.
2. After `inp` (:39), once per (shape, billing): `const benefit = benefitOf(inp.cast)`; `benefitOf` returns 0 when
   `options.promisedMasks` is undefined or empty.
3. `let bestBenefit = 0` beside `bestScore = -Infinity` (:37).
4. :61 becomes `if (benefit > bestBenefit || (benefit === bestBenefit && score > bestScore)) { bestBenefit = benefit; bestScore = score; best = {...same object...} }`.
Composition with the existing gates and cost, in order, per candidate (scale × marketing inside the billing):
- :50 cash gate (unchanged) — an unaffordable candidate never reaches the comparison.
- :59 `score` already includes the marketing-preference cost `|marketing/negative − marketingRatio| × 25_000`.
- :60 viability gate (unchanged, before the comparison): `lockScreenplay && score <= holdOperatingMargin` ⇔
  `expectedIncrementalContribution − preferenceCost <= 0` → skipped. A permutation serving 3 promises with no positive
  expected contribution therefore never wins; benefit is only compared among candidates that passed :50 and :60.
- Comparison: higher benefit wins outright (even against a much higher score); equal benefit → the ordinary score
  (contribution + hold + preference cost, exactly :59); equal both → the earlier candidate in (shape, billing, scale,
  marketing) iteration order is kept by strict-greater, i.e. the inherited BILLINGS fallback. No person-ID order, no
  fairness, no refusal: a viable `best` is returned whenever one exists today.
No-preference path: with `promisedMasks` undefined (planning call) or empty (no member), `benefit === 0` for every
candidate, `bestBenefit` stays 0, and the predicate reduces to `score > bestScore` — the same iteration, the same
comparison, the same `best`. `lockScreenplay` handling (:38, :40, :60) is untouched.

### 2(d) Initial cast seam — hollywoodTick.ts :161-164
Rule (only when the member set is non-empty; otherwise the existing expression, verbatim):
1. `director` (:161) and `craft` (:163) first, by the EXISTING first-non-busy-by-primary-role rule — unchanged.
2. `masks = promisedCastMasks(state, b.studioId, week + WEEKS_TO_FIRST_TAKE)`.
3. `taken = {ready.writerId, director?.id, craft?.id}` — the writer of THIS screenplay and the chosen director/craft
   cannot also be cast on this picture (M16.7 / plan :230-232).
4. `promised = employees.filter(t => masks.has(t.id) && !busy.has(t.id) && !taken.has(t.id) && t.skills.acting !== undefined)`
   — employment order, current employees of this studio only (a member who left is simply absent), busy law = the same
   `busy` set as :156, has-discipline = promises.ts :409 / productionAdmission.ts :89-96.
5. `actors = [...promised, ...employees.filter(t => t.role==='actor' && !busy.has(t.id) && !promised.includes(t))].slice(0,3)`.
6. Guard :164 `director && actors.length===3 && craft` unchanged — fewer than three lawful people is a capacity
   constraint, never a forged package.
No-promise path unchanged: `masks.size === 0` ⇒ `promised = []` ⇒ step 5 is exactly
`employees.filter(t=>t.role==='actor'&&!busy.has(t.id)).slice(0,3)` (:162), same order, same three ids, same
`provisional`. Ordinary policy, crew assignment (director/craft rule), the planning call (:205-208, :212-214), `staff()`,
UI read models: untouched. Members beyond three: the first three in employment order (existing order, no new priority).
Deliberately NOT done: preferring a non-member director/craft when a second one exists (would broaden crew assignment;
open question Q9).

### 2(e) What inputsFor must receive
Nothing new. `inputsFor` (:63-70) already takes `state`; the masks are computed in `decide` (which has `state`,
`b.studioId`, `week`) and handed to the chooser as `options.promisedMasks` (:169-170). `ReceptionInputs` is unchanged.

### 2(f) Determinism, RNG, receipts, save, bridge
- No RNG: the reader is a filter over `state.promises`; the chooser's only randomness is the derived forecast stream
  keyed by `options.key` (forecast.ts :408) — unchanged draws, `state.rngState` untouched by decide as today.
- Deterministic order: `state.promises` array order; `employees` ordinal order; BILLINGS fixed.
- Receipts unchanged: `filmAnnounced` (:185) keeps its shape; no new receipt kind, no promise write (the outcome owner
  stays advancePromisesWeek). Save shape unchanged: no persisted fact (the chosen cast already persists on
  `Production.cast`); no version bump, no migration, no projection/schemaId change. bridge/, UI read models, index.ts:
  untouched (hollywoodTick imports `promisedCastMasks` directly from './promises.js').

## 3. Edit points (HEAD 62ca561a lines)

WRITABLE: src/core/hollywoodPolicy.ts, src/core/hollywoodTick.ts, src/core/promises.ts (the reader only, after :597).
FROZEN: everything else — src/core/promises.ts evaluator/feasibility/outcome paths (:194-460, :599-692, rules version :45),
operations.ts, talentMarket.ts, tick.ts, types.ts, save*/migrate*, index.ts, bridge/**, productionAdmission.ts,
promiseCapacity{Kernel,Owners,OwnerReplay,Enumerator}.ts (the replay module), tests/** (619-T owns the RED; the
designated evaluator-5 RED tests/p14b4-cast-class-capacity-evaluator5.test.ts stays), docs/**, fixtures.

A. src/core/promises.ts — insert after :597 (§2(a) fragment). Uses module-private `evaluable` (:588) and `CAST_SLOTS` (:37).
   Export needed by hollywoodTick only; do NOT add to index.ts.

B. src/core/hollywoodPolicy.ts
   :7  `import type { CastSlot, FilmShape, Talent } from './types.js'`
   :18 after BILLINGS: `const CAST_SLOTS=['lead','antagonist','support'] as const`
   :32-34 options: `{seed:string;key:string;cashAvailable:number;weeklyCost:number;lockScreenplay:boolean;
          /** P14B.4 seating preference: bound-open member masks (promises.ts promisedCastMasks); absent = no preference. */
          promisedMasks?:ReadonlyMap<string,readonly CastSlot[]>}`
   :37 `let best:IndustryPackageChoice|null=null;let bestScore=-Infinity;let bestBenefit=0`
   after :37:
   `const masks=options.promisedMasks`
   `const benefitOf=(cast:ReceptionInputs['cast']):number=>masks===undefined?0:CAST_SLOTS.filter(slot=>masks.get(cast[slot].id)?.includes(slot)===true).length`
   after :39: `const benefit=benefitOf(inp.cast)`
   :61 `if(benefit>bestBenefit||(benefit===bestBenefit&&score>bestScore)){bestBenefit=benefit;bestScore=score;best={…unchanged…}}`
   Nothing else moves; :40-60 byte-identical.

C. src/core/hollywoodTick.ts
   imports (after :5): `import { promisedCastMasks, WEEKS_TO_FIRST_TAKE } from './promises.js'`
   :161-163 →
   ```ts
   const director=employees.find(t=>t.role==='director'&&!busy.has(t.id))
   const craft=employees.find(t=>t.role==='craft'&&!busy.has(t.id))
   // P14B.4 seating preference (plan :215-236): eligible PROMISED people enter the triple first, in employment
   // order; the writer of this screenplay and the chosen director/craft cannot double as cast; with no member
   // the expression below is the historical first-three rule unchanged.
   const masks=promisedCastMasks(state,b.studioId,week+WEEKS_TO_FIRST_TAKE)
   const taken=new Set([ready.writerId,director?.id,craft?.id])
   const promised=employees.filter(t=>masks.has(t.id)&&!busy.has(t.id)&&!taken.has(t.id)&&t.skills.acting!==undefined)
   const actors=[...promised,...employees.filter(t=>t.role==='actor'&&!busy.has(t.id)&&!promised.includes(t))].slice(0,3)
   ```
   :169-170 options add `,promisedMasks:masks` (after `lockScreenplay:true`).
   :212-214 planning call: NO change (no `promisedMasks` → benefit 0 → byte-identical).
   `inputsFor`, `staff`, `operateStage`, everything after :171: unchanged.
Import cycle check: promises.ts imports math/occupancy/tuning/types only (:29-35) — no cycle with hollywoodTick.

## 4. Paper effect (no run; derived from record 618 + 600-T4 scan log + HEAD source)

### 4.1 The 'seed-b' witness (O-T4-1; 600-T4-scan-A-rival-seed-b-seed-d.log :7-15)
Facts: search hit at tick 215 with `remainingTicks===5` on `studio-bc14baf6-r01:film:23` ⇒ greenlight decision at
pre-increment week 211, prospective take week 216 (§1.6). Cast today: lead `…r01-4` (promise-8, tagged leadOrAntagonist,
[208,416)), antagonist `…r01-3` (promise-6, P1 count-only, [208,416)), support `…r01-2` (promise-4, tagged
leadOrAntagonist, [208,416)). All three bound (w208 incumbent retention, O-T4-2), OPEN, progress 0 at 215 ⇒ also at 211.
Employment order of r01's actors is entry index order 2,3,4 (hollywood.ts :214-233 with RIVAL_TEAM_ROLES
['writer','director','actor','actor','actor','craft']; the w208 market rows are appended in case order, which follows the
same ordinals, talentMarket.ts :1192, :986) ⇒ `actors=[r01-2, r01-3, r01-4]` and today's cast is BILLINGS[5]=[2,1,0], the
LAST permutation — so its score strictly beat all five others (:61).
Member masks at 211 (takeWeek 216 ∈ [208,416)): r01-2 → {lead,antagonist}; r01-3 → {lead,antagonist,support};
r01-4 → {lead,antagonist}. Benefit per permutation (lead,antagonist,support):
[0,1,2]=(2,3,4)→2 · [0,2,1]=(2,4,3)→3 · [1,0,2]=(3,2,4)→2 · [1,2,0]=(3,4,2)→2 · [2,0,1]=(4,2,3)→3 · [2,1,0]=(4,3,2)→2 (today).
New rule: benefit 3 beats today's 2. Winner = whichever of [0,2,1] (lead r01-2, antagonist r01-4, support r01-3) and
[2,0,1] (lead r01-4, antagonist r01-2, support r01-3) has the higher ordinary score after the :50/:60 gates; exact tie →
[0,2,1] (earlier in BILLINGS, strict-greater). Which of the two is not derivable on paper (it depends on perceived
star/fit of r01-2 vs r01-4 in lead vs antagonist); the test-author should pin from the run: benefit 3, r01-3 in support,
{r01-2, r01-4} = {lead, antagonist}. The economic score DID prefer another permutation: [2,1,0] was the strict maximum,
so the new winner has a strictly lower score than today's — the "conflicting ordinary score" property holds on this
witness without construction. Triple unchanged (all three members are the three primary actors; writer/director/craft
excluded), so only the permutation moves here. Viability: [2,0,1]/[0,2,1] must still pass :60 — if neither does
(possible only if their best score ≤ hold while [2,1,0]'s exceeded it), the rule falls back to the best viable lower
benefit; the run decides.
Downstream on seed-b: the w216 take satisfies promise-4 too (3 SATISFIED on `first-take-event-N` instead of 2);
promise-4 no longer stays open (today it waits for a later r01 picture or BROKEN at 416); r01 gains a positive trust
driver at 216; film 23's reception (actual cast, hollywoodTick.ts :269, derived streams — the sim stream is NOT
consumed by the rival path) changes r01 revenue/cash, shared market forces, `applyReleaseCareers` growth on the three
people (tick.ts :932-935), later r01 decisions, research/adoption timing and the ~404-416 churn (trust/cash → bids →
settlement winners). Same shape on 'seed-d' r02 film 23 (scan log :20-23: antagonist r02-2 tagged qualifies, support
r02-4 tagged does not, lead r02-3 P1 → benefit 2 today; the [lead,antagonist]={r02-2,r02-4}, support r02-3 permutations
reach 3). 'seed-d' r01 film 23 (three P1, scan :17-19) is benefit 3 under EVERY permutation → score decides → unchanged.

### 4.2 Natural-chain controls that run rival decisions — what can move, what is pinned
Rule of thumb (paper): a chain is byte-identical until the first rival greenlight at which (i) some member has a
non-generic mask (tagged P2) AND the seating changes the winner, or (ii) the seam admits a member who is not among the
first three non-busy primary actors (a 4th actor, a non-busy scientist, a second director/craft/writer). Bound rival
promises first exist at the w208 settlement on the natural seeds (founding contracts are 208 weeks; pre-208 rival bids
on player people drop `noSeatForRole` at the roster cap — p14b1-trust-chooser.test.ts :64-78), so everything ≤ w208 is
unchanged. P1-only members already in the triple change nothing (all six permutations tie on benefit).
- tests/p14b4-cast-class-outcomes.test.ts `rivalWorlds` (:209-245, 'seed-b' ≤350): prerequisites should still be met on
  film 23 at 215 (all three slots keep bound OPEN roots; `genuine` = a tagged root in lead/antagonist — now BOTH tagged
  people sit there). MOVES: `slots.support.promiseId` becomes promise-6 (P1) instead of promise-4; `slots.lead`/
  `slots.antagonist` swap or not per §4.1; comment :211-216 goes stale. Matrix cases use `variant()` (in-memory material
  rewrite, :250-268) so they survive; the record-only comment needs a sweep. Not pinned by expect; pinned by comment.
- tests/p14b4-cast-class-policy.test.ts `scan` (:406-, default 220 + 'seed-b' 220): per-submission invariants; the
  witnesses (`P1fallback` at seed-b w196 etc.) precede binding → unchanged; ticks 208-220 can diverge in cash only; no new
  cases open before ~404 → expected unchanged (paper). Timeout 159 s in 617 — unchanged work.
- tests/p14b1-trust-chooser.test.ts :630 220-tick scan and the 195-207 D3 construction: pre-binding → unchanged; the
  week-404 insolvency narrative is comment-only.
- tests/p14b1-t4-regressions.test.ts `sharedTakeOutcomes` (:267-284, default ≤230): default r01's w216 take seats three
  P1 members (promises.ts :670-672) → benefit ties → unchanged IF no default rival admits a new member by the seam before
  230 (record 618: the only tagged default root is a craft worker, excluded as chosen craft). Paper; verify by run.
- tests/helpers/p14b2-fixtures.ts `rivalFixture` (:215-231, default ≤240) and `poachingFixture` (:159-207, default to
  the promise's due ≈416): derived searches, no hard week pins; `poachingFixture` walks past every default rival decision
  from 208 to ~416 — any default-seed drift (i) or (ii) moves its incidental facts (which rival films/takes exist), not its
  asserted player-promise facts. bridge-p14b2-trust and p14b2-fixture-preconditions consume these.
- tests/bridge-p13b-s8-rivals.test.ts WEEK277/WEEK288 (:198-215): HARD pins of r01 research/lab weeks at 265/266/276/278/
  288 on the default chain (+ player lab). Byte-identical only if the default chain has no drift through 288. Highest
  breakage risk among hard pins if (ii) occurs on the default seed.
- tests/p13a-rival-adoption.test.ts (:55-63, 'p13-public-commercial-adoption', 416→~520): derived, but a 120 s budget and
  a "week 520 / fifth rival" comment; drift on that seed after 208 can move the purchase week/studio.
- tests/p14a1-rival-trigger (196-207), p14b3-reservations/p14b1-promises/bridge-p14b1-promises (≤52), the outcomes
  `:444` shared-take and player worlds: pre-binding or player-issued → unchanged.
- Fixtures on disk (tests/fixtures/p14/**, recorded corpora): not regenerated; unaffected.
Pinned-by-grep summary: hard week pins that could move = bridge-p13b-s8-rivals :198-215 (default); comment pins =
p14b4-cast-class-outcomes :211-216, p13a-rival-adoption :48-53, p14b1-trust-chooser :250-292; everything else derives.
NEW reconciliation class for the test-author: **G10 — post-binding rival seating drift**: any natural-chain fact after
the first rival greenlight (≥ w208) whose winner or triple the seating preference changes — rival `Production.cast` per
slot, `FirstTakeReceipt.cast`, which/how many promises a shared take satisfies, promise-4-class outcomes (SATISFIED
earlier instead of later/BROKEN), trust drivers, rival cash/reception/careers, later settlement winners, research/
adoption weeks. Sub-classes: G10-a permutation-only (same triple; needs a non-generic member) — 'seed-b' r01 f23,
'seed-d' r02 f23; G10-b triple change (seam admits a non-first-three member) — none witnessed on paper; G10-0 provably
unchanged (member set empty, or all members generic and already the triple) — everything ≤ 208, 'seed-d' r01 f23, the
default w216 r01 take. Each moved fact needs the 618-style "fixture choice, nothing invented" treatment.

## 5. Risks and open questions for the contract-auditor

Q1 count 2 with progress 1: member (unmet, `progress < count`); `progress` is the outcome owner's weekly value
   (:687-689), current at decide because advancePromisesWeek runs after appendFirstTakes at tick end (tick.ts :1102-1110).
   Reading receipts instead (`qualifyingTakes`) would be equivalent today; the brief said promises only.
Q2 one person, one legacy P1 + one tagged lead: intersection = {lead}. A support seat would still satisfy the P1 alone,
   but counts 0 under the intersection rule — the plan's choice ("not duplicate-root weighting"), which can under-count a
   partial service. Alternative (union / any-mask) rejected as duplicate weighting by the plan; flag as a deliberate
   consequence.
Q3 window starts after the take week (`windowStartWeek > week+5`): not a member — the take would not qualify
   (`qualifyingTakes` :608). Due week == take week: not a member (half-open). No slack: the chooser tests "inside the
   window" exactly; a one-week slip (blocked take, load-in) at the due edge is the feasibility service's slack problem
   (PROMISE_SLACK_WEEKS 8 at authoring), not the chooser's. Recommend: exact half-open, as the plan words it.
Q4 beneficiary is the screenplay's writer: excluded from the pool for THIS picture (M16.7); the promise stays open. A
   rival has one writer (RIVAL_TEAM_ROLES), so a cast promise to its writer can only be served by a picture written by
   someone else — normally never. STRATEGY GAP G-1 (plan :233-235 "report any remaining strategy gap"): `authorRivalPromise`
   offers cast promises to its sole writer/director/craft (feasibility checks acting-profile presence only, :407-409, and
   `SkillProfiles.acting` is non-optional, types.ts :95-101) that the seam can never seat → BROKEN at due → trust damage
   the rival authored itself. Record 618's default-seed craft-worker tagged root is exactly this. Out of this slice
   (talentMarket.ts frozen); needs a Fable/Owner call: (A) authoring excludes people whose only lawful role on the
   rival's own pictures is a non-cast seat; (B) accept as delegated-hypothesis cost. Recommend A as a later B4 item.
Q5 tie iteration order: (shape → billing → scale → marketing), strict-greater keeps the earliest; with lockScreenplay
   only one shape. Two benefit-3 permutations with equal score → the earlier BILLINGS row. No permutation invariance.
Q6 take week: `week + WEEKS_TO_FIRST_TAKE` where `week` is decide's pre-increment tick; receipt week is the
   post-increment tick of the 5→4 advance (operations.ts :1680-1689; tick.ts :1102-1108) = W+5 on schedule (§1.6).
   Verified against the witness (211 → 216). If a rival picture holds at the S5-R07 setup gate (operations.ts :1698-)
   the take slips — prospective, not a law breach.
Q7 lockScreenplay (:60): the gate runs before the comparison; benefit never rescues an inviable candidate. But benefit
   CAN pick a viable candidate with a much lower score (e.g. hold+1 vs hold+2M). The plan says exactly that; flag the
   magnitude for the auditor — no cap is proposed (constraints forbid a tariff).
Q8 performance: one `state.promises` scan per decide (|promises| ≈ 40 by w400); `benefitOf` 6× per shape (1 shape
   locked) — three Map lookups each. Negligible.
Q9 director/craft vs member: the seam keeps the existing first-non-busy director/craft rule; a member who is the chosen
   director/craft is excluded even if a second director/craft exists. Preferring a non-member crew would broaden crew
   assignment (plan :230-231 forbids silent broadening). Recommend: keep; record as a known ceiling.
Q10 scientists: `employees` includes scientists (extra roles, hollywoodTick.ts :243-244); a non-busy scientist member
   with a bound promise would be seated by the seam (has acting profile by type). Lawful under has-discipline; the only
   non-primary-actor beneficiary a rival can currently seat — the test-author's "actual non-primary-actor beneficiary" is
   constructible only there (or via a rival with >3 actors, which staff()/noSeatForRole never produce). If neither exists
   naturally, report the gap rather than construct one.
Q11 plan vs code: the plan says "the three selected at hollywoodTick.ts162" — HEAD :162 confirmed. The brief's
   :59/:60 for gate/comparison are :60/:61 at HEAD; `activePromiseReservations` is :289-298, not :274-283.
Q12 `promisedMasks` passed as an empty Map vs undefined: both yield benefit 0; the fragment passes the Map always from
   decide and never from the planning call. Auditor may prefer `masks.size===0?undefined:masks` for legibility — no
   behavioural difference.
Q13 member employed elsewhere / row closed: the seam reads `employees` (this studio's active rows), so a member without
   an active row is never seated; no cross-studio poaching path is opened.
Q14 test design: pin benefit 3 on the witness AND a control where the highest-score permutation is also the
   highest-benefit one (no change); pin the no-member path by structural equality of `decide` output on a pre-208 state;
   test actual production/take (`FirstTakeReceipt.cast`, three SATISFIED on one take at 216) not just the chooser's
   return; the planning call's `shape`/`promise` byte-identical.

## 6. Evidence limits
Paper only: no vitest/tsc/node run, no probe. The 'seed-b' facts come from record 618 and the archived 600-T4 scan log,
not from a fresh run; the employment-order claim (r01-2, r01-3, r01-4) is inferred from hollywood.ts :214-233 and
talentMarket.ts :986/:1192, not observed. Which of the two benefit-3 permutations wins on score is unknown. Default-seed
"unchanged" claims (G10-0) rest on record 618's craft-worker fact and the roster cap; a run must confirm them.
tests/p14b4-rival-seating-preference.test.ts exists in the working tree (619-T's file) and was NOT read.
