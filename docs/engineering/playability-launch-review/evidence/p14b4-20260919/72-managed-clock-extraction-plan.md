# Managed production clock — narrow owner extraction plan

2026-09-20. Read-only preparation after kernel66: parent reports46/46 PASS,
fixed source. This document neither changes the frozen kernel nor certifies an
adapter. Only this document was written; no runtime, probe, typecheck, Git,
network or descendant agent was used.

## Minimal production scope

Two owners suffice: `src/core/operations.ts` for type boundaries and generic
record preservation, and `src/core/technologyProduction.ts` for the stock
policy's compatible callback type. Keep the allocation/sweep/technology bodies
unchanged. No new clock implementation, fake Production, forecast construction,
GameState migration, validator widening, rules/version change or live adapter.

Define beside the existing operations policy, not in persisted types:

```ts
export type ProductionClockView = Readonly<Pick<Production,
  'id' | 'startTick' | 'remainingTicks' | 'directorId'>>

export type ProductionAllocationPolicy<
  P extends ProductionClockView = Production,
> = {
  allowsFacility: (productionId: string, facility: StudioFacility,
    targetPhase: ProductionPhase) => boolean
  beforePhaseEntered?: (production: P, targetPhase: ProductionPhase,
    reservations: readonly FacilityReservation[], week: number) => void
}

export type ManagedProductionAdvance<
  P extends ProductionClockView = Production,
> = {
  productions: P[]
  operations: StudioOperations
  sets: readonly StudioSet[]
  admittedReleaseIds: readonly string[]
  firstTakes: readonly P[]
}
```

Exact function seams (line references are the inspected source):

- `operations.ts:1560` — `advanceManagedProductions<P extends
  ProductionClockView = Production>(operations, productions: readonly P[],
  currentTick, committedReleaseIds, externallyOccupiedSlots?, events?, binding?,
  policy?: ProductionAllocationPolicy<NoInfer<P>>, setupRoute?):
  ManagedProductionAdvance<P>`. Preserve every positional parameter/default.
  Change only local `firstTakes` and `byId` annotations to `P[]`/`Map<string,P>`.
- `operations.ts:1279` — private `enterPhase<P extends ProductionClockView>`
  receives `production: P`, returns `production: P`, and receives the matching
  generic policy. Preserve all result flags and operations/sets fields.
- `operations.ts:1471` — `productionsInSweepOrder<P extends
  Pick<ProductionClockView,'id'|'startTick'|'remainingTicks'>>(productions:
  readonly P[], currentTick): readonly P[]`. Its sort/comparator body is unchanged.
- `operations.ts:1444` — `productionWaitWeeks` needs only
  `Pick<ProductionClockView,'startTick'|'remainingTicks'>`; same arithmetic.
- `operations.ts:580` — `addManagedProductionWorkflow` needs only
  `Pick<ProductionClockView,'id'|'startTick'|'remainingTicks'>`; same body/return.
- `operations.ts:676` — `assignShootingDirector` needs only
  `Pick<ProductionClockView,'id'|'directorId'>`; preserve both locked-director
  comparisons and all workflow/task refusals.
- `operations.ts:279` — private `allocateForPhase` reads only `allowsFacility`.
  Type that parameter as `Pick<ProductionAllocationPolicy,'allowsFacility'>`,
  leaving its body unchanged. This avoids trying to assign generic full-record
  callbacks to a fixed `Production` callback type. `enterPhase` still receives
  and invokes the COMPLETE policy, never just this allocator projection.
- `technologyProduction.ts:54` — factory return becomes
  `policy: ProductionAllocationPolicy<ProductionClockView>`; its actual callback
  reads only `production.id` at74–86. Keep the whole factory body, GameState/studio
  inputs and `technology()` collector unchanged. No policy-free planning variant.

`NoInfer<P>` prevents a broad clock-compatible policy from widening a complete
caller record inferred from `productions`. The repository declares TypeScript
`^5.6.0` (`package.json:56`). Generic defaults preserve existing annotations that
mean full Production. Require independent compile-time checks that both complete
Production and a genuine narrow view with an additional marker retain their
record fields through `productions`, `firstTakes` and sweep ordering. No casts
from a partial object to Production and no `any` escape are part of this plan.
Numeric clock fields are ordinary `number` fields, not literal countdown types.

No barrel change is necessary for existing callers (`index.ts:546–561` already
re-exports the functions); a later public type export is separable from this
internal extraction.

## Actual dependencies beyond the four direct record reads

No fifth Production field is read by the inspected allocator/enterPhase/sweep
bodies. Four fields are NOT the entire calendar input:

- Operations supplies phase, reservations, blockers, shooting task, bindings,
  setup units/history and facilities. External occupied slots supply other
  owners. Keep both, including exact resource identity and sticky retention.
- Set binding supplies real sets and `genreOf(productionId)`. The player closure
  reads the complete production's `conceptId` and actual concept genre
  (`tick.ts:354–366`), although operations itself does not. Detached callers need
  an honest ID-to-genre owner fact, not a invented default or fake concept.
  Allocation locks uplift/novelty; wrap wears the actual bound Set.
- The setup resolver receives stage/recipe/week and derives real technology
  provenance (`productionSetup.ts:164–174`, `tick.ts:369–371`). Its absence has
  an existing specific meaning; do not omit it merely to ease an adapter.
- Technology policy reads selection/adoption, actual market week and operational
  installation facts (`technologyProduction.ts:13–25,54–92`). It enforces the
  chosen stage AND Post chain, refuses unavailable sound chains, and locks at
  real shooting entry. Factory collection is invocation-local: independent
  planning branches must not share a mutated collector or persist its read-only
  speculative result into live state.
- Generic custom `beforePhaseEntered` callbacks may legitimately read additional
  fields of their caller's complete P. Only the STOCK callback is ID-only.
  Therefore a globally narrowed non-generic callback would be an API regression.
- Committed release IDs and the event sink remain explicit authorities. A
  detached result has no authority to commit its events, mint durable takes or
  release a real picture.

The extraction does not change the independent development/operations modes.
Legacy development plus managed operations still admits its lawful direct-stock
route; a narrow clock adds no screenplay Ready or staffing admission shortcut.

## Caller and return invariants

Player `tick.ts:335–371` and rival `hollywoodTick.ts:256–260` continue passing full
Production arrays and the real technology policy. Full outputs remain available
to player queue/reception assembly (`tick.ts:394–419`) and rival reception using
participants/forecast/financial inputs (`hollywoodTick.ts:261–275`). They must not
be reconstructed from the clock view. Existing direct callers in operations,
technology, release-law and setup tests keep their complete record types.

Preserve unchanged/shallow-spread record behavior and caller array order;
preserve firstTakes as the post-advance full P records. Leave strict
`assertStudioOperationsInvariants(operations, readonly Production[], options)`
at `operations.ts:819` and `assertProductionTechnologyBindings(GameState)` at
`technologyProduction.ts:122` unchanged, along with every save validator.

Retain greenlight-week skip, fixed once-per-week longest-waiting/ordinal order,
restart after capacity release, 5→4 scheduled/unblocked take, 6-tick setup
admission/no-work visit at currentTick+1, actual committed 1→0 release, and the
legacy arm's absence of first takes. Keep wrap stage/Set release before blocked
Post acquisition, Set wear, retained bindings/history and all failure messages.

Both sweeps receive PRE-increment weeks. Durable first takes are appended in
`tick.ts:1102–1110` using ARRIVED `finalized.market.tick`; technology locks retain
their actual phase-entry week. Do not unify these timestamps. Rival operateStage
assigns/clears/schedules before its sweep (`hollywoodTick.ts:74–87`); player
scenery arrival is not a scheduling command. Neither sequence changes here.

## Independent regression gate, then implementation

Author narrow-view compile/type assertions and paired owner-output comparisons
before the sole-writer release. Derive the four fields from genuine fixture
productions, not fabricated persisted Production records. Run the same existing
operations owner with isolated equivalent contexts/collectors; compare complete
operations, sets, events, technology, first-take/release IDs and projected clock
fields. Verify full input records, extra marker fields and inputs remain intact.
These tests establish owner reuse, not completeness of future alternatives.

Serialized selection after implementation:

- New narrow-clock/type-preservation tests, then `operations.test.ts`,
  `c2a-m4-release-law.test.ts`, `c2a-m4-contention-property.test.ts`.
- `p13a-production-technology.test.ts` (real policy, sound restrictions/lock,
  unchanged silent route), `p13b-r07-timeline.test.ts`,
  `p14b2-setup-wrap-regressions.test.ts`, `p14b1-first-take.test.ts`.
- `p14b4-material-evidence-core.test.ts` and `p14b4-cast-class-outcomes.test.ts`
  include transparent sweep spies; check generic-signature compatibility while
  retaining their existing reached/expected-RED qualification.
- Root/UI and bridge typechecks catch full-record loss through actual callers.
  No generated-contract change is expected. Broader acceptance remains parent
  qualified, not implied by this extraction selection.

Implementation may then be released for operations/technology type plumbing
only. Preserve owner executable bodies; any newly required behavioral change is
a separate finding, not permission to expand this mechanical extraction.

DOCUMENT FROZEN. Production and tests remain unchanged by this task.
