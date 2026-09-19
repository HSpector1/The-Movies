# Managed clock extraction72 — bounded independent plan review

Native contract-auditor, 2026-09-20. Verdict: qualified KEEP for the proposed
type-only two-owner extraction. No concrete blocking mismatch was found between
the proposed narrow record boundary and the inspected executable bodies. This
is a plan review, not a review of an implemented change or adapter completeness.

Read complete72, the affected operations/technology seams and immediate player,
rival and direct test callers. No runtime, typecheck, engine probe/import, Git,
network, descendant agent or source/test change was performed. This review is
the sole authorized write; independent author's mutable77 draft was not read.

## Reviewed identities

- Plan72 SHA256: `34ee5c15878859c5c36f5ca6577e46f345c880799d655a2a5bfc934c5f2fff7f`.
- Existing `operations.ts`: `13b16db62b353a5572ba74b9b566b83880e2624c6d578f1ae549cf7de28a795c`.
- Existing `technologyProduction.ts`: `4e2a66d8d187f69051598de96301234318e8ccbc6faf71d21d5eaf8fb101b0da`.

These are inspected predecessor bytes, not hashes of a completed extraction.
Earlier kernel verification is separate and is not relabeled as clock coverage.

## MET by source inspection — sufficient direct record view

The four-field view is sufficient for these specific operations seams:

- `addManagedProductionWorkflow` at580 reads id, countdown and start tick.
- `assignShootingDirector` at676 reads id and locked director, retaining both the
  production and shooting-task director comparisons.
- `productionWaitWeeks` at1444 reads start/countdown; ordering at1471 additionally
  reads id. Its existing ordinal/wait comparator and copied sort must stay exact.
- `enterPhase` at1279 reads id/director/countdown and changes countdown by spread.
  `advanceManagedProductions` at1560 reads the same four-field set across legacy,
  managed, setup, first-take and committed-release arms. Its final result keeps
  caller array order and obtains post-advance first-take records from `byId`.

No fifth direct Production field is needed in these bodies. This does NOT mean
that a calendar can be computed from four fields alone: operations/workflows,
external occupancy, actual sets, genre closure, setup provenance, technology
policy, release commitments and event sink are still explicit authorities.

## KEEP — generic preservation and policy variance design

Using `P extends ProductionClockView` in advance/enterPhase and their returned
records preserves complete caller records and additional marker fields instead
of reconstructing Production from a clock. Generic sweep ordering likewise
preserves its input element type. Keep `Production` defaults for the existing
public result/policy type names and preserve all positional/default arguments.

`ProductionAllocationPolicy<NoInfer<P>>` prevents the compatible broad stock
policy from supplying a weaker inference candidate than the production array.
The repository declares TypeScript `^5.6.0`; actual compiler acceptance remains
an independent test/typecheck gate, not something this review executed.
Custom `beforePhaseEntered` callbacks remain parameterized by the full caller P
and may read its extra fields. Narrowing all callbacks globally would instead be
an API regression. Numeric clock fields are ordinary numbers as72 specifies;
the plan does not promise preservation of literal/branded countdown subtypes.

The private allocator at279 only calls `allowsFacility`. Its proposed
`Pick<ProductionAllocationPolicy,'allowsFacility'>` removes irrelevant callback
variance from that seam without dropping any runtime field or invocation.
`enterPhase` must continue receiving the complete generic policy and calling
`beforePhaseEntered` before phase event/shooting work. No callback projection or
policy-free branch is authorized there.

## KEEP — stock technology restrictions remain real

The stock callback at `technologyProduction.ts:74` reads only production.id;
therefore a `ProductionAllocationPolicy<ProductionClockView>` return is sound for
both narrow and complete records. It must retain the factory's actual GameState/
studio inputs, invocation-local collector and all current body logic:

- selected production loadout and adoption identity;
- operational week relative to the actual market clock;
- player's real stage/Post installation effects;
- selected soundstage AND Post facility restrictions, with no unavailable-chain
  fallback to a convenient facility;
- exact shooting-entry lock and unchanged silent/default behavior.

Separate speculative branches require separate collectors. No speculative
technology/events may be committed to live state by this extraction.

## Caller/validator protection and required gates

Player `tick.ts:336` supplies complete active productions and later passes full
outputs into queue admission (`tick.ts:394`). Its genre closure reads the real
conceptId externally and its setup resolver retains actual owner provenance.
Rival `hollywoodTick.ts:257` likewise passes complete productions; first takes,
reception, participant credits, forecasts and financial inputs downstream need
those full records. None may be replaced with a four-field projection.

Strict `assertStudioOperationsInvariants` at819 remains a full-Production save
boundary. `assertProductionTechnologyBindings` at122 and every save validator
remain unchanged. No persisted type, schema, rules/version, admission policy,
legacy mode or runtime algorithm change is needed or authorized.

Before acceptance, independent tests/typechecks must establish complete and narrow
marked P preservation through productions/firstTakes/order, full-P custom
callback access, and the broader stock policy without inference widening. Paired
owner executions need isolated equivalent contexts/collectors and exact operations,
sets, events, technology, clock fields and take/release identity comparisons.
Existing transparent full-owner spies also need generic-signature compatibility;
do not bypass or cast away actual owner results to obtain compilation.

All executable bodies/refusals must remain exact, including greenlight-week skip,
once-per-week sweep/restart, scheduled5→4, setup admission without immediate work,
wrap release before blocked Post, Set wear and committed1→0 in both modes. Keep
PRE-increment sweep/phase-lock time distinct from ARRIVED durable first-take/setup
time. The proposed regression selection and both typechecks are appropriate;
their outcomes and any newly reached failures remain owed after implementation.

The narrow view is reusable access to an existing owner, not a forecast,
fabricated Production, lawful staffing/commission enumerator or complete capacity
adapter. Those remaining B4 obligations are not closed by this plan verdict.
