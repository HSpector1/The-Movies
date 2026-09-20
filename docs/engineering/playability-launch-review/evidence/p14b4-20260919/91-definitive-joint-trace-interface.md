# Definitive detached joint-trace interface for independent RED

2026-09-20. Resolves89 and the five required precisions in90. This is a proposed
engineering contract for the next independent tests/review, not implemented
source, a product-policy change or B4 acceptance. Original49 and its API/tests
remain intact.82's date alone was corrected to2026-09-20 in this task.

## Separate entry and exact types

Future entry in `src/core/promiseCapacityKernel.ts`:
`searchPromiseCapacityTraces(input: JointTraceCapacityInput): JointTraceCapacityResult`.
The existing `searchPromiseCapacity(CapacityKernelInput): CapacityKernelResult`
remains the optional-alternative entry with unchanged49 semantics.

All referenced49 types are reused, not independently redefined. `DeepReadonly`
has49's existing definition. Numeric, mask, boundary, foreign-selection and
count-remainder rules remain49/56's. No GameState, Production, forecast, action,
tick, callback executor or new durable identity enters this lower API.

```ts
export type JointTracePicture = DeepReadonly<Omit<PictureAlternative, 'personRelease'> & {
  kind: 'jointTracePicture'
  jointTraceKey: string
  personRelease: Boundary | null
  additionalHolds: readonly []
  holdReplacements: readonly []
}>

// Certified compulsory trajectory with NO claim of a complete picture calendar.
// Includes writing/research or a picture with no certified future event here.
export type JointTraceBackgroundPath = DeepReadonly<{
  kind: 'jointTraceBackground'
  jointTraceKey: string
  pathKey: string
  issuerId: string
  existingPath: boolean
  ownerFactRefs: readonly string[]
}>

export type JointTracePath = JointTracePicture | JointTraceBackgroundPath

export type JointOwnerTrace = DeepReadonly<{
  kind: 'jointOwnerTrace'
  traceKey: string
  ownerFactRefs: readonly string[]
  paths: readonly JointTracePath[]
  fixedHoldReplacements: readonly HoldReplacement[]
  additionalHolds: readonly Hold[]
}>

export type JointTraceCoverage = DeepReadonly<{
  claimsAndHolds: 'complete' | 'incomplete'
  existingCalendars: 'complete' | 'incomplete'
  allOwnerTraces: 'complete' | 'incomplete'
  omissions: readonly string[]
}>

export type JointTraceCapacityInput = DeepReadonly<
  Omit<CapacityKernelInput, 'alternatives' | 'coverage'> & {
    mode: 'jointOwnerTraces'
    traces: readonly JointOwnerTrace[]
    coverage: JointTraceCoverage
  }
>

export type JointTraceWitness = DeepReadonly<{
  traceKey: string
  ownerFactRefs: readonly string[]
  executedPathKeys: readonly string[]
  effectiveHoldIds: readonly string[]
  creditedPictureKeys: readonly string[]
  credits: readonly Credit[]
  targetTakeBoundaries: readonly Boundary[]
}>

export type JointTraceCapacityResult =
  | Extract<CapacityKernelResult,
      { status: 'ALREADY_MET' | 'PROVEN_IMPOSSIBLE' | 'UNCERTIFIED' }>
  | (Omit<Extract<CapacityKernelResult,
      { status: 'CERTIFIED_ACHIEVABLE' }>, 'witness'> &
      Readonly<{ witness: JointTraceWitness }>)
  | (Omit<Extract<CapacityKernelResult,
      { status: 'PROVEN_FRAGILE' }>, 'countWitness'> &
      Readonly<{ countWitness: JointTraceWitness }>)
```

The new entry requires its exact mode/tagged rows and refuses mixed-mode fields
such as a top-level `alternatives`, untagged paths, or nonempty per-picture hold
arrays. Explicit new trace tags supplied to the old entry are a mode error, not
permission to interpret compulsory trajectories as49 optional alternatives.
Previously governed49 inputs/results remain unchanged; no blanket reinterpretation
or new schema/save admission is licensed.

## Identity, complete ledger and replacement authority

- `traceKey` is globally unique. Each path's `jointTraceKey` equals its containing
  trace. `pathKey` occurs ONCE per trace across both row kinds. Picture `key` is
  a unique occurrence identity across the supplied trace domain; repeated physical
  pictures in other traces retain their SAME `pathKey`, not an extra event.
  Their issuer/existing status must agree across variants. In this issuer-local
  domain every path issuer equals input.issuerId.
- Both row kinds have nonempty owner fact references. Picture rows retain49's
  cast/staffing/event invariants: three distinct actual cast people, complete
  staffing witness, real ordered greenlight/take boundaries, and no historical
  first take promoted to a future event. A null take is a genuine no-credit
  continuation. In THIS trace mode only, personRelease is nullable: a known
  first take inside the horizon must not be erased just because actual release
  is uncertified or beyond the horizon. A nonnull release is an actual certified
  boundary not earlier than greenlight/take; null claims no release date.
  Never invent personRelease at the horizon. The compulsory ledger must still
  prove all actual occupied intervals through the analyzed horizon. A ledger
  interval clipped at `(horizonEndWeek,0)` states occupancy on that finite
  interval, NOT that its person/resource releases there. A fixed-hold suffix
  replacement still requires actual owner-certified release, not mere clipping.
  Unknown release cannot justify freeing occupancy earlier; uncertainty about
  possible earlier releases/choices affects the GLOBAL completeness flags.
  Old49 optional-picture personRelease remains required and unchanged.
  Background rows carry NO cast, firstTake, greenlight, personRelease, picture
  key or per-row holds; reject these mixed-kind fields, do not fabricate them.
- A background row is a certified relevant owner trajectory, not a new film.
  It can describe current writing, research, scenery or other compulsory work,
  including a retained hold with no certified release during this trace. Its
  `existingPath` records existing versus contemplated owner work; it contributes
  no event or profile units. If a current screenplay becomes its already-linked
  inProduction picture, the adapter uses ONE physical path and one picture row
  with the complete script/production provenance, not a second background credit.
- Every trace includes the complete relevant activity context, even rows that
  earn no promise credit. Choosing a trace makes its ENTIRE ledger compulsory.
  Start with every input.fixedHold; apply that trace's fixedHoldReplacements;
  then add every trace.additionalHold. Credit choices cannot remove, shorten or
  skip any of these facts. No new physical resource encodes trace exclusivity.
- A replacement must name an existing fixed hold, occur at most once in this
  trace, and have a nonnull replaceableFrom. Its original ownerPathKey must join
  exactly one certified path row IN THIS TRACE (picture, null-take continuation
  or background). That trajectory's owner facts must justify the suffix release.
  Preserve original ownerKey, subject, slot, from and immutable prefix; require
  `replaceableFrom <= newUntil <= original.until`. A trace label alone grants
  no replacement authority. Null/unrepresented ownerPathKey cannot be replaced.
- Unreplaced fixed holds survive exactly, including every other owner's hold.
  Genuine non-picture paths may release only their own owner-certified suffix:
  no cast, fictitious film or invented personRelease is needed. External owner
  holds without such a local trajectory remain fixed facts, not an adapter choice.
- Fixed IDs are globally unique. Additional IDs are unique within the chosen
  ledger and disjoint from ALL fixed IDs. Their nonnull ownerPathKey must join
  a path in the trace; a non-picture external hold may instead have null
  ownerPathKey plus its actual ownerKey/facts. Reusing a conditional additional
  hold ID in DIFFERENT traces is allowed; those ledgers are never merged.
- Validate complete person/exact-resource-slot compatibility of every claimed
  trace ledger, including uncredited rows and empty intervals under49 rules.
  A self-conflicting claimed complete trace, malformed identity/owner/prefix or
  contradictory row shape is an input Error, not proof of gameplay IMPOSSIBLE.
  Genuine count impossibility comes from a lawful complete trace domain with
  insufficient admissible event credits, not an invalid producer certificate.

The lower module checks these structural joins and intervals. It cannot prove
that prose fact references correspond to real engine execution; the owner
producer must actually run the common allocator/sweep with mandatory priority,
all real inputs and isolated branch-local event/technology collectors.

## Proof objects and global optimization

For EVERY positive/count witness, traceKey joins the complete immutable input
trace. ownerFactRefs copies that trace's canonical references. executedPathKeys
lists ALL its path rows, not only beneficiaries. effectiveHoldIds lists the
entire effective ledger, including retained/empty fixed holds and every added
hold. These identifiers, joined to the input, identify the full execution proof.

Separately, creditedPictureKeys lists exactly the distinct picture occurrence
keys with at least one credit. Credits retain49's tuple DemandKey/pathKey/actual
slot representation and are checked only against picture rows of the chosen
trace. Background/null rows cannot earn credit. Each person/path pays at most
one planning demand; different real cast seats may pay different people.
Target boundaries are sorted actual credited takes, with49's multiplicity and
existing-first tie convention. No selectedAlternativeKeys field ambiguously
suggests that uncredited mandatory work did not happen.

There is ONE common profile boundary list: union/deduplicate all nonnull existing
picture take boundaries in ALL supplied traces, sorted by week then step. Every
trace/credit assignment is scored on that SAME list, including zero entries.
Optimize the49 tuple globally over all lawful traces satisfying ALL priors/debits.
Keep every equivalent optimal trace and every equivalent credit assignment
available for protected X/B; do not privilege the first trace or beneficiary ID.

Only after global optimum proof may X/B be classified. B, first X on existing
paths and eight-week slack belong to ONE trace and ONE joint credit assignment.
Complete failed protected X requires the separate unoptimized joint X search
across ALL traces. Reallocation is priorPathProtection FRAGILE; complete joint
failure is jointOfferOnly IMPOSSIBLE, never target-specific causal BROKEN.
ALREADY_MET and all other status/reason meanings remain49's.

Implementation must factor/reuse current kernel normalization, accounting,
credit/profile and probe primitives behind this explicit domain. Do NOT call
the public kernel with a fresh budget/profile per trace and combine its labels,
copy a second matching algorithm, stop after the first rejected candidate, or
prune a picture globally because one trace was incompatible.

## Exact global coverage and preparation/work contract

`claimsAndHolds` concerns ALL relevant current/bound/foreign obligations and all
occupancy/context facts. `existingCalendars` concerns ALL lawful choices that
can change ANY relevant existing picture's calendar, staffing or first take:
not merely inventorying its ID or completing one trace. Unexplored FUTURE work
that could change an existing picture through contention makes this INCOMPLETE.
`allOwnerTraces` concerns exhaustion of the full relevant legal owner-choice
domain, including compulsory activity and caller command order, not the count
of observed successful traces. These are GLOBAL attestations, never per-trace
flags. Missing facts/choices belong in omissions without invented history.

Complete negative/exhaustive optimum proof requires all three flags complete
and all relevant search work finished. A separately sound direct hard bound
retains49's exception; truncated trace data never supplies that proof. Positive proof needs a lawful B trace,
complete claims/holds, and the FULL global prior optimum. With nonzero priors,
missing future-only choices permit positive proof only when existingCalendars
really is complete and a sound global upper profile is fully attained. That
bound deduplicates physical paths across trace variants and bounds every profile
component, not the best observed trace. Zero prior/debit demand has identically
zero optimum, including at any unobserved cut; do not invent cut timestamps.
Unproved optimum or incomplete failed probe returns UNCERTIFIED.

The existing limits fields retain maxima32/64/1024/200000/220; lower limits are
permitted, larger ones remain input errors. Exact global accounting:

- Claim rows =1 target + supplied relevant prior rows + retained foreign debits.
- Required units =B + sum prior/debit remaining counts, once for the shared
  obligations, NOT reset or multiplied per mutually exclusive trace.
- Domain rows =`traces.length + sum(trace.paths.length)`. This must not exceed
  limits.alternatives. EVERY picture occurrence, null/background path and empty
  trace header costs one; repeat variants of a physical path still consume rows.
  Thus1025 empty traces and1024 headers plus one picture both exceed the default.
- Span starts at now and reaches the latest relevant due/horizon exactly as49;
  safe saturated checks precede replay or expansion of large saved integers.
- preparationWork includes ALL canonical owner-domain enumeration/replay work,
  including abandoned candidate traces and proof-of-coverage work. The producer
  receives only limits.work total allowance, charges before owner work, stops
  before exceeding it and preserves truthful incomplete flags on unfinished
  enumeration. It cannot run unmetered replays then report a capped number.
- The new entry begins at that same preparationWork; at/above the limit returns
  workLimit immediately. Structural scalar/string/array/container scan, sorting,
  trace-ledger checks, global profile optimization, all X/B/unoptimized probes
  and proof construction consume ONE remaining counter. No nested fresh budget.
  Use49's deterministic normalization allowance/canonical branch order; input
  permutations have identical complete result and work/cap disposition.

The future producer needs explicit accounting or a safe conservatively charged
owner-step bound. This contract does not pretend replay is free, does not raise
timeouts, and does not promise a polynomial search. Ordinary finite owner cases
must actually be constructed/measured; a missing producer is not a permanent
UNCERTIFIED implementation of all ordinary cases.

## Small fixed-input discriminants for the independent author

These are mathematical owner-certified input fixtures, NOT fabricated saves or
proof that an actual engine trace has been constructed. All omitted fields in
these descriptions must be supplied literally under the types above, with real
fixture person/resource intervals, distinct cast and nonempty provenance refs.

1. **Do not splice traces.** Target T lead X1, window[0,40), no priors. Trace A
   has existing P take10 and no other T event; trace B has future Q take24 and
   no other T event. Represent the other path as a background where relevant;
   retain P/Q identities and existing flags across traces. Complete domain:
   count succeeds, B2 cannot, so FRAGILE, common profile0 at10. Free-mixing P+Q
   would wrongly certify achievable. Count witness names one full trace and
   every background path, while creditedPictureKeys contains only its event.
2. **Global protection, not local labels.** Prior A lead1; target T lead1.
   Early trace pays A on existing P at10; T has no qualifying event. Later trace
   pays A on existing R at18, offers T on P at10 and future Q at24. Target window
   [0,40); full ledgers lawful. Common prior optimum is `(1;1@10,1@18)`, not
   later's `(1;0@10,1@18)`. Protected X fails; unoptimized later X exists:
   priorPathProtection FRAGILE, not a per-trace ACHIEVABLE or IMPOSSIBLE. An
   independent equivalent-optimum variant should place A flex on P's antagonist
   and T lead on P in a second trace, with Q spare: that trace MUST remain
   searchable and certify. No trace ID decides the beneficiary.
3. **Non-picture release and full ledger survive credit subset.** Now10,
   target T window[15,30). Fixed person hold H belongs to an actual writing
   path, from8 to30, replaceableFrom10. A certified background trajectory
   releases its suffix at14. The same trace contains future G take18, with
   T occupied15–22; no spare event. Count succeeds/FRAGILE, and the witness
   includes the writing path/H but credits only G. A lawful no-release trace
   keeps H to30 and has no G event: complete count fails. Reject wrong owner
   path, duplicate replacement, prefix shortening and per-picture hold fields.
   Add another owner's T15–19 hold to a claimed G-executing trace: reject the
   inconsistent complete ledger; credit omission cannot hide that hold.

Also pin mixed modes/tags, duplicate physical paths/script-film aliases,
non-picture fields/casts, common profile cuts, future contention invalidating
existingCalendars completeness, input purity, empty/background row caps,
preparation exhaustion and trace/path/hold/credit permutation invariance.
Include a known first take with personRelease:null and compulsory occupancy
through the horizon: retain its lawful credit, forbid earlier person reuse,
and do not manufacture a release event. With no nonzero prior/debit demand,
a lawful B trace and complete claims/holds may certify despite incomplete
existingCalendars/allOwnerTraces: every possible prior score is identically zero.

DOCUMENT FROZEN for review and independent authorship. No trace implementation,
runtime or acceptance is claimed.
