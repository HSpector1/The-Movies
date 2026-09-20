# 137 — first started-owner replay: exact bounded contract

2026-09-20. INERT implementation contract, not source authorization or executed
evidence. Refines125/126 using the adopted132 constructibility correction.
Parent reports published source `6afe629a6519ff64a42e89064b6fe2d1576a2ceb`.
Only this file is written. Native sim-core; no runtime/probes, source/tests,
Git/network or descendants. Numerical accounting below is a proposed explicit
logical work tariff supported by source walks, NOT a JavaScript instruction,
native-sort-comparison or wall-clock theorem. Independent review remains required.

## 1. Deliverable and hard boundary

New internal `src/core/promiseCapacityOwnerReplay.ts` executes explicit command
plans for the **entire already-started player slate**, using the actual common
managed sweep. It returns complete-H joint traces or unusable-for-proof prefixes.
It does not enumerate commands, Ready packages, commissions, staffing choices,
employment winners or future films. It cannot classify a promise or declare a
complete choice domain. No action/tick/hollywoodTick import or copied pipeline.

Rival source selection returns a named `rivalPolicyUnsupported` cut BEFORE any
replay. No extract/copy of operateStage is needed in this first implementation.
The independent rival type-fact tests may still prove existing policy factories
accept genuine rival facts; that is not rival weekly replay support.

Current player work is useful without those domains: one/two real pictures,
current writing/audition reservations, actual player scenery, existing silent or
selected operational technology, existing setup records, stage/Set contention,
wrap/Post waiting and lawful release. Publication of this tranche is not natural
offer feasibility, full B4, live V30/projection47 or Owner/native acceptance.

## 2. Exact lower fact signatures (body-preserving first gate)

Names below are the intended production names. Existing full-state callers remain
structurally compatible; no new required argument/default or executable body.
Use type-only imports between owners. These views are not alternate save readers.

```ts
// facilityEffects.ts
export type FacilityInstallationFacts = Readonly<{
  placement: Readonly<{ facilities: readonly PlacedFacility[] }>
}>
hasOperationalFacilityInstallation(state: FacilityInstallationFacts,
  targetFacilityId: string | null, blueprintId: string): boolean

// technologyAdoption.ts
export type AdoptionChainFacts = FacilityInstallationFacts & Readonly<{
  hollywood: Readonly<Pick<HollywoodState, 'playerStudioId'>> | null
}>
adoptionChainOperational(state: AdoptionChainFacts,
  adoption: TechnologyAdoption): boolean

// technologyProduction.ts
export type ProductionTechnologyFacts = AdoptionChainFacts & Readonly<{
  technology: StudioTechnology
  market: Readonly<Pick<GameState['market'], 'tick'>>
}>
createProductionTechnologyPolicy(state: ProductionTechnologyFacts,
  studioId = playerId(state)): {
    policy: ProductionAllocationPolicy<ProductionClockView>
    technology: () => StudioTechnology
  }
// Private playerId takes Pick<AdoptionChainFacts,'hollywood'>.
// Private operationalAdoption takes ProductionTechnologyFacts.
// selectedTechnology may take Pick<ProductionTechnologyFacts,'technology'>;
// productionHasBegunFilming and other full-state public APIs stay full-state.

// productionSetup.ts
export type ProductionSetupFacts = AdoptionChainFacts &
  Readonly<{ technology: StudioTechnology }>
deriveSetupProvenance(state: ProductionSetupFacts,
  recipe: ProductionSetupRecipe, stageFacilityId: string, week: number,
  studioId: string | null = playerStudioId(state)): ProductionSetupProvenance
createProductionSetupRouteResolver(state: ProductionSetupFacts):
  ProductionSetupRouteResolver
// Private playerStudioId takes Pick<AdoptionChainFacts,'hollywood'>;
// lightingAdoption takes ProductionSetupFacts; workflowOf stays full-state.

// sceneryLoadIn.ts; propertyOf already accepts this genuine optional property.
export type SceneryLoadInFacts = FacilityInstallationFacts &
  Readonly<{ property?: PropertyState }>
facilityBodyCentre(state: SceneryLoadInFacts, facilityId: string): LotCell | null
sceneryLoadInFor(state: SceneryLoadInFacts,
  workflow: ProductionWorkflow, week: number): SceneryLoadIn | SceneryLoadInWithholding
sceneryLoadInDecision(state: SceneryLoadInFacts,
  workflow: ProductionWorkflow, week: number): SceneryLoadInDecision

// releaseAuthority.ts: preserve existing ReleaseOwner name and all bodies.
export type ReleaseOwner = {
  productions: readonly Pick<Production,'id'|'conceptId'|'remainingTicks'>[]
  concepts: readonly Pick<FilmConcept,'id'|'title'>[]
  operations: StudioOperations
  releaseAuthority: StudioReleaseAuthority
}
```

Keep hasOperationalFacilityInstallation's exact target/completion conditions;
adoptionChainOperational's cancelled/player/rival distinction; nullable player
identity and default studio resolution; setup access/equipment/operational checks;
all scenery withholding/grandfather rules; full technology collector callbacks;
all strict validators. No fake GameState/Production or casts to satisfy a factory.
This type-only gate is independently tested BEFORE the runtime producer gate.

Two later tiny shared predicates belong to the producer's separate RED/release:

```ts
scriptWorkDueAt(project: Pick<ScriptProject,'status'|'dueWeek'>,
  arrivalWeek: number): boolean
castingWorkDueAt(session: Pick<CastingSession,'status'|'dueWeek'>,
  arrivalWeek: number): boolean
```

Move ONLY each current completion eligibility expression into its owner predicate
(scriptDevelopment447–465, castingSessions408–428), and call it from BOTH the
existing completion function and replay. Mode guards remain with callers. No
assessment/result body moves. Actual pool IDs come from scriptProjectWriterIds;
do not duplicate its attributed-writer fallback. A mechanical narrowing of
productionCompanyTalentIds to readonly Pick<Production,'directorId'|'cast'|
'craftIds'>[] is permissible in that later gate, preserving its body. It is not
part of the present type-fact test assignment unless separately covered/released.

## 3. Exact replay API and immutable facts

Reuse Boundary/FixedHold/JointOwnerTrace from the published kernel. `Readonly`
views below promise no mutation, not recursive copying of irrelevant history.
Original full P records survive spreads/countdown changes, including caller
markers; there is no partial-as-Production assertion.

```ts
export type StartedPicture = ProductionClockView &
  Readonly<Pick<Production,'conceptId'|'writerId'|'cast'|'craftIds'>>

export type StartedOwnerSource<P extends StartedPicture> =
  ProductionTechnologyFacts & SceneryLoadInFacts &
  Readonly<Pick<GameState, 'operations'|'sets'|'releaseAuthority'|
    'scriptDevelopment'|'castingSessions'|'construction'|'physicalPlans'|
    'productionQueue'|'founding'|'firstTakes'>> & Readonly<{
      // Genuine root required for foreign current-work cuts; not a fabricated
      // player-only Hollywood record. Factories consume its narrower view.
      hollywood: GameState['hollywood']
      concepts: readonly Pick<FilmConcept,'id'|'title'|'genre'>[]
      studio: Readonly<{ activeProductions: readonly P[] }>
    }>

export type StartedProductionCommand = Readonly<{
  week: number
  ordinal: number
  productionId: string
  kind: 'assignLockedDirector' | 'clearGrandfatheredScenery' |
        'scheduleTake' | 'commitRelease'
}>
export type StartedProductionPlan = Readonly<{
  traceKey: string
  commands: readonly StartedProductionCommand[]
}>
export type StartedOwnerReplayInput<P extends StartedPicture> = Readonly<{
  source: StartedOwnerSource<P>
  issuerId: string
  // Union of the actual prepared target/prior/debit people, not an availability
  // attestation. Replay adds EVERY current player company and active writer ID.
  claimPersonIds: readonly string[]
  plans: readonly StartedProductionPlan[]
  horizonEndWeek: number // already-effective H under94
  preparationWork: number
  limits: Readonly<{ work: number; span: number; alternatives: number }>
}>

export type StartedReplayProjection<P extends StartedPicture> = Readonly<{
  week: number
  productions: readonly P[]
  operations: StudioOperations
  sets: readonly StudioSet[]
  technology: StudioTechnology
  releaseAuthority: StudioReleaseAuthority
  completedBackgroundPathKeys: readonly string[]
}>
export type StartedReplayAttempt<P extends StartedPicture> =
  | Readonly<{ kind:'complete'; trace:JointOwnerTrace;
      projection:StartedReplayProjection<P>; provenance:readonly ReplayObservation[] }>
  | Readonly<{ kind:'cut'; traceKey:string; through:Boundary;
      reason:'unsupportedContext'|'rivalPolicyUnsupported'|'commandRefused'|
             'workLimit'|'sizeLimit'; detail:string;
      provenance:readonly ReplayObservation[] }>
export type StartedOwnerReplayResult<P extends StartedPicture> = Readonly<{
  fixedHolds: readonly FixedHold[]
  attempts: readonly StartedReplayAttempt<P>[]
  preparationWork: number // cumulative; includes failed/discarded branches
  omissions: readonly string[]
}>
export function replayStartedProductionPlans<P extends StartedPicture>(
  input: StartedOwnerReplayInput<P>,
): StartedOwnerReplayResult<P>
```

`ReplayObservation` is a closed union, not arbitrary prose-as-certification:
`{kind:'command', at, command}`; `{kind:'backgroundCompleted', at, pathKey,
dueWeek, owner:'screenplay'|'castingSession'}`; `{kind:'sweepStarted', at,
externalSlotKeys:readonly string[]}`; `{kind:'ownerEvent', at, ownerWeek,
draft:StudioEventDraft}`; `{kind:'firstTake', at, productionId}`;
`{kind:'releaseAdmitted', at, productionId}`. Every arm is readonly. `at` is a
Boundary. Command records are explicitly hypothetical lawful choices, ownerEvent
records are actual detached sink output, not campaign events with invented seq.

This entry is internal to core and requires genuine already-validated engine
roots (as the current clock owner does), not untrusted save JSON. It checks the
bounded scalar/identity joins it consumes and fails contradictory facts loudly;
it does not relax or replace campaign/save validation. No caller `complete`,
`harmless`, fabricated occupancy or callback authorization flags exist.

One call owns ONE counter across input preparation and EVERY plan, including
refused/cut plans. It accepts lower limits only, capped200000/220/1024. Canonicalize
plans by traceKey and commands by (week,ordinal); repeated traceKey or repeated
(week,ordinal) in a plan is input Error. Commands must address an original current
production, now<=week<H. Empty plan means no player commands. Never sort the
actual input production/workflow arrays to manufacture a different source order.
The sweep still computes its own longest-waiting/ordinal service order and retains
caller output order. Replay never returns a GameState or synthetic Review root.

## 4. Supported context and root-derived cuts

now=(source.market.tick,0). H>=now.week and H-now.week<=220, checked with safe
integer arithmetic BEFORE iteration. This first tranche requires a founded,
managed player issuer matching the actual nonnull Hollywood player ID. Legacy
DEVELOPMENT plus managed OPERATIONS is supported; managed development is not
silently substituted. Empty managed slate is legal but creates no picture credit.

Inspect and charge actual roots, not just output rows:

- Any current production queue row: cut before replay. Any own physical plan
  queued/held/blocked: cut. Started/cancelled plans have no new admission but their
  actual placement/technology work is still inspected.
- Any underConstruction player placement, legacy construction project, or
  under-construction/repairing Set: cut. Do not freeze those clocks or invent their
  slots. Completed installations and standing/retired Sets remain actual facts.
- Any active player research project, or own uncancelled adoption with null
  operationalWeek: cut. No guessed research funding, equipment availability or
  installation completion. Paused/completed/cancelled history alone is not active
  person occupancy; retained physical destruction facts remain distinguishable.
- Relevant current foreign work is a cut, not a guessed H-long reservation:
  inspect actual Hollywood businesses' production-company people and every
  activeScriptOrdinal's actual pooled writer IDs, plus foreign active research
  seats with releasedWeek null. Relevance is claimPersonIds UNION all current
  player company/active-writing IDs. Preserve exact offending source references.
  A credited writer alone is not a company seat. Missing indexed records are an
  input contradiction, not idle work. No other-studio person/calendar is simulated.
- Disjoint rival work is irrelevant to this selected player execution: its
  facilities/adoptions/equipment are studio-owned and it cannot change this
  player's retained active company or current writing. This is NOT a proof that
  future hiring/staffing/admission choices are complete. Rival issuer replay
  itself is always the explicit unsupported cut above.

Actual player writing and auditions are SUPPORTED using original reservations,
mode, status and persisted due dates. Active pooled writing reserves all writers;
audition candidates do NOT acquire fictitious person-company holds. Review/Ready
credit reserves nobody. An inProduction project linked to a current picture is
part of that picture's provenance, not a second background/event path.

No new command in a plan changes staffing, plans, research or technology choice.
Payroll/standing/reception/employment expiry do not change the current managed
clock, locked staffing, selected installed chain or these commands' eligibility.
They are not executed or claimed in the returned projection. Changes affecting
the projection are covered by the cuts and the explicit release/Set step below;
any newly discovered dependency is a named cut before execution, not silently
declared irrelevant. No full-world final-state equality claim follows.
The returned technology root preserves opaque foreign rows from the input;
comparison with a real later tick is restricted to this issuer's production
locks, selected chain and setup facts. It is not a claim that unrelated rivals'
new technology rows or research histories were advanced in this projection.

## 5. Exact execution order and ledger

Each visible week w starts step0. Steps increase in a single sequence for planned
commands, pre-sweep completions, arrival sink rows, sweep-start, sweep sink rows,
then release-batch collection. No command may be inserted between these internal
phases. All actual returned first takes are stamped (w+1,0), never their service
order or an arbitrary ID tie-break. Preserve each sink row's raw ownerWeek.

1. Execute that week's commands in ordinal order. assignLockedDirector calls
   actual assignShootingDirector with the picture's locked ID, then actual
   arriveDueScenery restricted to THAT picture using sceneryLoadInDecision at w,
   matching actions1778–1810. Manual clear requires classifier manual-clear and
   calls actual clearSceneryLoadIn. scheduleTake calls actual scheduleShootingTake.
   commitRelease calls releaseCommitmentRefusal then withReleaseCommitment only
   on null refusal. This composes existing owners, not a second command law;
   illegal plans return commandRefused and never become partial lawful traces.
2. For each original current writing/audition path not completed in this branch,
   use its shared due predicate at w+1. Close its actual slot and (writing only)
   pooled-person holds at the ordered pre-sweep step. Record original dueWeek;
   do not run derived assessment/observations, accept a screenplay, or invent a
   durable completion event. Subsequent weeks omit that completed background's
   reservation; original project/session roots remain untouched.
3. Actual arriveDueScenery evaluates the genuine geometry at w+1. Arrival makes
   READY only. A scheduling command can follow only at the NEXT visible command
   boundary. Current grandfathered work is not automatically cleared.
4. Build external bare slots from exact remaining background reservations and
   genuine narrow occupancy sources. With installation/Set-work cuts their
   schedulable contributions are provably empty, not omitted by assumption.
   Do not call resourceClaims(fullSource) then charge only the filtered results:
   that owner eagerly expands installation capacities and sorts research roots.
   Use resourceClaims({placement,operations}) for installation facts when needed;
   use the original exact background reservations with shared due decisions.
   Set occupancy must use post-arrival operations. No fake script/casting state.
5. Build FRESH actual technology policy and setup resolver from this branch's
   week/technology/installation facts; invoke advanceManagedProductions ONCE on
   the entire current slate with actual commitments, real Sets and a concept-ID
   genre lookup. Keep its operations, P records, Sets and technology() result.
   No alternate allocator, solo replay, copied countdown or callback omission.
6. Drain the fresh enabled StudioEventSink in append order. Apply all exact bare
   reservation releases/grants; retained slots have no event and retain their
   interval. Join stage grants to returned binding and stage releases to the
   actual wrapped(stage,set) sequence. Reconcile initial plus deltas with final
   reservations. A newly entered picture cannot also wrap in this sweep because
   it is settled, so the returned binding is sufficient for that new acquisition.
7. The returned admittedReleaseIds must equal exactly returned zero clocks.
   At the post-sweep release-collection boundary in pre-increment w, close those
   company-person holds; this is an owner-return admission observation, NOT an
   invented reservation event. Remove those clocks and use actual
   pruneReleasedCommitments. In ascending production-ID release order invoke
   depleteSetNoveltyForRelease using the PRE-sweep workflow's retained setId
   (tick555–574/759). This affects later lockedNovelty; setBindingUplift itself
   uses quality+fit, not novelty. Carry wear from the sweep exactly once. Do not
   mint reception/results, Produced screenplay history or campaign release rows.
8. Record returned firstTakes at(w+1,0); next visible commands begin afterward.
   Reject contradictory duplicate actual first-take identity; current previously
   filmed continuations have null future take even if recording started later.

Source-derived path keys are canonical JSON tuples: ['production',issuer,id],
['screenplay',issuer,id], ['castingSession',issuer,id], ['setMount',issuer,setId].
Tokens name genuine source rows/owner steps; no whole-GameState hash. Capture one
global fixed ledger from now to(H,0), replaceableFrom=now only for represented
local trajectories. Each plan starts from that SAME ledger and immutable source.
Current company holds are director/cast/craft, never credited writer. Initial
reservations and genuinely occupied bound Set are exact physical claims. Set
mounts are separate stable background resources, not stage-production slots.
Completed installation destruction/body claims are not schedulable slot claims;
no construction/move command is permitted here. They are retained in provenance
and never transformed into an occupied production slot. Under-work cases cut.

Use resourceKey=JSON.stringify(['facility',issuer,facilityId]) with actual slot;
Set exclusivity uses ['set',issuer,setId], slot0; mount uses ['mount',issuer,stageId],
slot0. These are genuine physical namespaces, not scenario tokens. Hold IDs add
actual owner/path, subject and segment ordinal. Bare sink keys join a prebuilt
key→exact facility/slot index; never parse arbitrary facility IDs with split(':').
Unknown/unseen bare keys are contradictions. The index is charged by SUM actual
capacities BEFORE expansion, or built only from exact bounded current/granted
reservation facts with identity verification; choose the latter to avoid useless
slot enumeration. Never treat equal slot numbers in different facilities as equal.

Close a current fixed hold by its actual owner-certified suffix replacement;
new acquisitions become additionalHolds. Preserve every immutable prefix and
other hold. Nonnull historical bindings.setId after wrap is NOT occupancy.
Unknown release stays null and path-owned cast/company holds extend to H as94
requires; H-clipping is not a release or suffix-release certificate. A future
take inside H remains usable with unknown release. Every current picture and
relevant background remains in the trace even when it earns no credit. Prefixes
do not enter JointOwnerTrace[] or support claimsAndHolds completeness.

132's real due-writing + different sticky Development slot is the required
chronology test. A same-slot new-development grant DURING this started-only
sweep is impossible under the lawful phase graph; the queued after-sweep handoff
stays a later extension, never fabricated to satisfy a test.

## 6. Numerical before-call work contract

Use a bounded local counter initialized to preparationWork. Reserve each complete
owner call's tariff BEFORE invocation; failure consumes the remaining allowance
and returns workLimit without calling it. No refund for short scans, early return,
failed plans or abandoned traces. No per-plan fresh budget. Saturating addition/
multiplication against remaining budget precedes products/loops/allocations.

Logical units: one loop/callback row visit, one constant straight-line owner block,
or one emitted/copy record. String/container scan charges1 plus string.length;
scan only consumed views, not opaque forecast/history leaves. A native sort of n
rows is assigned tariff Q(n)=1+n+n*n, plus its comparator's named source work.
Q is an explicit bounded-size logical tariff, NOT a claim that ECMAScript/V8
promises n² comparisons. No wall-clock bound follows; unchanged native owner
sorts are neither rewritten nor secretly run to discover their charge. Factories
and callback work are included below. If a platform-level execution bound were
required instead, separately reviewed owner sorting instrumentation would be a
new prerequisite; it is not falsely supplied by this contract.

Footprint for a sweep: N current clocks/workflows; R total reservations; r=2
(maximum lawful reservations/phase requirements); F facility rows; C=sum of ALL
facility capacities; S Sets; E external slot count; T technology production rows
(reserve initial count+original N for every branch); A adoptions; X access rows;
Y equipment rows; P placed facilities; G concept rows; U authored structures; J=sum lengths of
providesFacilityIds; K=sum placed-cell lengths. Reject mismatched workflows or
R>2N as malformed consumed facts, not gameplay uncertainty. Check every capacity
is a nonnegative safe integer, and accumulate C with saturation before an owner
can iterate slots. No arbitrary max1000 claim or unbounded Array.from.

The following table defines the charge composition (terms deliberately overlap
to avoid unsafe optimistic refunds):

| Block / actual source | Reserved logical cost |
|---|---|
| One technology allowsFacility (technologyProduction64–76) | `Pfac = 4 + T + A + 2P` (selection, adoption, two exact installation walks) |
| One shooting lock (technologyProduction78–94) | `Plock = 6 + 2T + A + 2P + r` (selection, optional adoption, reservation check, append/map) |
| One setup resolver (productionSetup98–171) | `Psetup = 9 + X + A + Y + 2P` (two-entry recipe table included, access/adoption/equipment/chain) |
| One geometry decision (sceneryLoadIn100–233/275) | `Geo = 12 + 2r + 2(U+J+P+K)` (both bodies, housing includes, possible placement/cell walks, classification) |
| occupiedSlots for production-only supplied root (operations241; occupancy352–583) | `Occ = 4 + 7N + 4R + E` (two workflow passes incl Set exclusivity, reservation visits, emitted claim filtering/index/copy, external copy) |
| allocateForPhase283–423 | `Alloc = 16 + Occ + F*(1+Pfac) + Q(F) + (N+R) + (F+C+2F*S) + 2*(r+2F+C)` |
| enterPhase1283–1433 | `Enter = 18 + 12r + 4r*r + 3N + 2S + Alloc + Plock + 1` |
| One sweep visit incl all alternative branches1647–1814 | `Visit = 20 + 2N + Enter + Psetup` |
| Whole advance1567–1824 | `Sweep = 10 + 5N + 9Q(N) + N*(2N+1)*Visit` |

Explanation of the finite factors: production-only resourceClaims still walks
workflow reservations AND bound-Set exclusivity; Occ includes both, plus claim
indexing and the occupied-key copy. Alloc includes filtering/callbacks, actual
facility sort, heldSetIds, stage/slot search and bindableSetsOn at EVERY candidate
stage; that Set helper filters IN STATE ORDER and does NOT sort. Two phase
requirements account for retention lookup plus facility/slot search. Enter allows
two reservation transitions including their two-way includes scans, three
workflow replacement maps, wrap Set lookup/map, lock and genre lookup. Its fixed
18 slots cover entry/release/result branches and small immutable record builds;
Alloc's16 cover occupied/result/composite/retention/requirement setup and return
blocks. Visit's20 cover the top-level skip/find/phase/take/setup/release/same-phase/
transition dispatch and record/map updates. No nested variable-size work belongs
in a fixed block. Genre is a charged prepared ID→genre map lookup, not an
uncharged concepts scan.

Each progress/restart advances or first-releases one of N workflows; each can
do each at most once, hence at most2N progress rounds plus the final scan and
N*(2N+1) visits. The factor9 before Q(N) reserves the production-order comparator's
two wait calculations, two ordinal parses and comparison chain as well as sort
tariff. Input ID character lengths/ordinal syntax are charged during preparation;
native string/regex execution is inside the same logical/native-operation model,
not a hidden claim about machine instructions.

Other calls, separately reserved before they run:

- assign/schedule/clear: `8+2N` each for lookup/map and fixed guards. Director
  due-at-call settlement additionally reserves `4+N*(1+Geo+N)` for arriveDueScenery.
  The weekly arrival reserves that same bound; callbacks are not free.
- release refusal/commit: `10+3N+G+L+Q(L+1)` where L is commitment count; includes
  the existing linear production/title-concept lookups and actual commitment
  map/append/sort. Do not alter those runtime bodies merely to reduce this tariff.
- current background projection: `3 + B + Wb` each week for B original active
  script/session rows and Wb total pooled writer IDs, with command-free completion
  and each resulting endpoint separately charged. Every actual predicate call
  and scriptProjectWriterIds input/returned ID walk is included, not only due rows.
- release collection/Set aftermath: `5 + 4N + Q(N) + N*(N+2S) + L`; covers zero
  equality, pre-sweep workflow lookup, sorted released IDs, novelty scan/map,
  active filter and commitment pruning. No reception is inside this bound.
- installation/Set occupancy: use the chosen genuinely narrow resourceClaims
  arguments and charge every supplied collection before filtering. With this
  tranche's active-work cuts, standing Sets emit mounts but no scenery slots;
  a narrow `{placement,operations}` call costs `4 + P*(1+F) + 3N + 2R` plus its
  emitted/indexed rows. Under-construction input cuts BEFORE this call, so it
  cannot expand installation capacity. No technology root is supplied to that
  occupancy call; thus no hidden research sort or seat expansion is invoked.
- provenance/ledger: reserve1 per emitted observation/hold/change, every scanned
  reservation/subject and ID character, plus Q(n) for each actual canonical sort.
  Input/output canonicalization, joins, collisions and closure checks are real
  charged loops in the new module. Generated trace rows must also fit the GLOBAL
  1024 header+path occurrence limit; repeated plans do not get fresh quotas.

Useful arithmetic control, NOT an observed fixture: N2/R4/F5/C6/S2/E2/T2 and
A=X=Y=P=0 give Pfac6, Plock12, Psetup9, Occ36, Alloc191, Enter272, Visit305,
Sweep3133. With U8/J5/K0, Geo42 and arrival94, twelve sweeps cost38724 before
commands/preparation/ledger. Reserving at most30 primitive stage commands with
their worst due-at-call surcharge3180, twelve release/background/occupancy blocks
under500 each6000, and an independently counted preparation+ledger budget20000
keeps this specified footprint below67904, leaving kernel search room. The
20000 is a FIXTURE CAP on measured logical scan/output work, not a magic producer
charge or assertion about every campaign. Tests must guard/count actual source
dimensions and actual charged work; if a chosen real fixture exceeds these
dimensions, preserve failure and select/derive the correct bound, never edit it
into compliance. Larger valid states remain budget-limited, not IMPOSSIBLE.

Do not loop all220 weeks blindly after exhaustion. An optional exact terminal
fast-forward is permitted only after an actual sweep and root inspection prove:
every remaining picture is uncommitted Release Ready, no command remains, all
supported background has finished, and no deferred local change survived the
cuts. Such clocks have no reservations or take possibility and cannot change
without a command; extending their company holds to H certifies NO release.
Charge the endpoint construction. No general 'blocked means stationary' shortcut.

## 7. Independent tests and implementation sequence

1. First existing-function type RED → type-only seams in section2 → original
   owner regressions/full/narrow equivalence/strict checks. Do not bundle predicates
   or replay runtime into that release. Staffing130 remains unchanged.
2. Independent missing-entry/behavioral RED for this exact replay API and tiny
   due predicates. Then ONE producer writer; no changes to kernel/policy/versions.
3. Real disclosed132 route: due writing releases its original dev slot BEFORE
   sweep; A keeps its DIFFERENT slot and skip-first-tick8; later8→7 retains it.
   No fake same-slot waiter. Separate actual wrap/Post-full stage handoff tests.
4. Compare actual action/tick local projections for one/two current pictures,
   including original/full/narrow P markers, empty/no-op and legal explicit plans.
   Do not compare opaque, deliberately unadvanced foreign technology history as
   if this were a whole-world tick.
   Player arrival alone stays READY; next command schedules; actual5→4 take is
   arrived-week. Invalid manual clear, wrong phase, duplicate commitment or plan
   ordinal refuses without mutating input or producing a complete trace.
5. Branch isolation: silent/operational selected chain and real setup provenance,
   wear once at wrap, post-wrap historical Set not occupied, release-time novelty
   then later binding's lockedNovelty. No forecast/result/history fabrication.
6. Full ledger includes uncredited pictures and actual backgrounds; pooled writers
   held, credited writer not held, audition candidates not invented as company;
   known first take/null release has full-H occupancy. Actual root-derived foreign
   booking/research/installation/Set-work/queue/plan cuts are independently tested.
7. Transparent owner call-through observers prove every invocation was prepaid;
   zero/tiny remaining allowance yields ZERO unreserved calls. Large capacities,
   geometry arrays, technology histories, many plans and long windows stop before
   expensive expansion. Canonical plan permutations have equal result/work.
   Real one/two-picture controls must complete useful traces within200000, and
   complete traces must pass the unchanged joint-trace kernel ledger checks.

Return complete owner-context traces only; caller still owes complete obligations,
foreign debits and global choice coverage. Never set existingCalendars/allOwnerTraces
complete because these explicit plans finished. Nonzero-prior optimum, future
contention and every natural-offer gate remain the published91/94 obligations.
This contract creates no new product decision or permission for live activation.

DOCUMENT FROZEN for bounded review, independent tests and explicit source release.
