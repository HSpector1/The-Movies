# B4 kernel interface — definitive refinement for independent RED

2026-09-20. Implements review44's representation corrections to design42;
original42 remains byte-unchanged. No kernel/source/test implementation here.
The following names and shapes supersede42's illustrative interface for the
independent test-author. Future module: `src/core/promiseCapacityKernel.ts`;
entry point: `searchPromiseCapacity(input: CapacityKernelInput): CapacityKernelResult`.
It has no GameState, Production, forecast, action, tick or policy dependency.

## Types

All numbers are finite safe integers; weeks/counts are nonnegative, required
promise counts positive. Boundaries compare week then step, without multiplication.
The adapter owns step meanings and certifies actual ordered command/sweep facts.

```ts
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T
export type Slot = 'lead' | 'antagonist' | 'support'
export type Mask = readonly Slot[]
export type Boundary = Readonly<{ week: number; step: number }>
export type Window = Readonly<{ startWeek: number; dueWeekExclusive: number }>
export type HoldSubject =
  | Readonly<{ kind: 'person'; personId: string }>
  | Readonly<{ kind: 'resource'; resourceKey: string; slot: number }>
export type Hold = DeepReadonly<{
  holdId: string; ownerKey: string; ownerPathKey: string | null
  subject: HoldSubject; from: Boundary; until: Boundary
}>
export type FixedHold = Hold & Readonly<{
  replaceableFrom: Boundary | null
}>
export type HoldReplacement = Readonly<{ holdId: string; newUntil: Boundary }>
export type PriorClaim = DeepReadonly<{
  promiseId: string; issuerId: string; personId: string
  membership: 'bound' | 'current'
  mask: Mask; window: Window; remaining: number
}>
export type ForeignDebit = DeepReadonly<{
  promiseId: string; issuerId: string; personId: string
  membership: 'bound' | 'current'
  sourceWindow: Window; remaining: number
}>
export type PictureAlternative = DeepReadonly<{
  key: string; pathKey: string; issuerId: string; existingPath: boolean
  greenlight: Boundary; firstTake: Boundary | null; personRelease: Boundary
  cast: Record<Slot, string>; staffingWitnessKey: string
  additionalHolds: readonly Hold[]
  holdReplacements: readonly HoldReplacement[]
  ownerFactRefs: readonly string[]
}>
export type DomainCoverage = DeepReadonly<{
  claimsAndHolds: 'complete' | 'incomplete'
  existingAlternatives: 'complete' | 'incomplete'
  allAlternatives: 'complete' | 'incomplete'
  omissions: readonly string[]
}>
export type CapacityKernelInput = DeepReadonly<{
  now: Boundary; horizonEndWeek: number; issuerId: string
  target: {
    promiseId: string | null; personId: string; mask: Mask; window: Window
    state: 'unbound' | 'bound'; count: number; actualQualifiedCount: number
  }
  priorClaims: readonly PriorClaim[]; foreignDebits: readonly ForeignDebit[]
  alternatives: readonly PictureAlternative[]; fixedHolds: readonly FixedHold[]
  coverage: DomainCoverage; preparationWork: number
  limits: { claims: number; units: number; alternatives: number; work: number; span: number }
}>
export type DemandKey =
  | readonly ['target']
  | readonly ['prior', string]
  | readonly ['foreignDebit', string]
export type Credit = DeepReadonly<{ demandKey: DemandKey; pathKey: string; slot: Slot }>
export type Witness = DeepReadonly<{
  selectedAlternativeKeys: readonly string[]; credits: readonly Credit[]
  targetTakeBoundaries: readonly Boundary[]
}>
export type PriorProfile = DeepReadonly<{
  existingUnits: number
  cumulativeByBoundary: readonly { boundary: Boundary; units: number }[]
}>
export type CapacityKernelResult = DeepReadonly<(
  | { status: 'ALREADY_MET'; remaining: 0 }
  | { status: 'CERTIFIED_ACHIEVABLE'; remaining: number; bufferDemand: number
      priorOptimum: PriorProfile; witness: Witness }
  | { status: 'PROVEN_FRAGILE'; reason: 'achievableProbeFailed' | 'priorPathProtection'
      priorOptimum: PriorProfile; countWitness: Witness }
  | { status: 'PROVEN_IMPOSSIBLE'; scope: 'jointOfferOnly'
      reason: 'completeCountFailure' | 'certifiedUpperBound'; upperBound?: number }
  | { status: 'UNCERTIFIED'; reason: 'domainIncomplete' | 'workLimit' | 'sizeLimit'
      omissions: readonly string[] }
) & { workUsed: number }>
```

Masks canonicalize to lead,antagonist,support order, without duplicates. Legal
count-family masks are lead; lead+antagonist; or all3. IDs are opaque identity,
never beneficiary priority. Claims are the adapter's B3/B4-selected OPEN bound or
CURRENT set, self excluded, half-open overlapping, no terminal/abandoned rows.
Same-issuer competing people are included. Selection provenance remains adapter
authority: this kernel receives no mutable roots from which to invent membership.

## Exact effective hold ledger

Fixed holds have globally unique holdId. `replaceableFrom:null` means the WHOLE
interval is immutable. Otherwise `[from,replaceableFrom)` is immutable and
`[replaceableFrom,until)` is its explicitly replaceable future suffix. Unresolved
holds extend through the analyzed horizon. The adapter may certify an earlier
release via a complete continuation; the kernel may not guess one.

For each selected set of mutually exclusive whole alternatives:

1. Begin with every fixed hold, including every other owner's hold.
2. Each HoldReplacement must name an existing replaceable fixed hold whose
   ownerPathKey EXACTLY equals the selecting alternative's pathKey. Inherit its
   ownerKey, subject, slot, from and replaceableFrom; a replacement cannot change
   any identity or prefix. Require `replaceableFrom <= newUntil <= original.until`.
   A fixed hold may be replaced at most once in a selected set.
3. Its effective interval becomes the unchanged prefix plus
   `[replaceableFrom,newUntil)`. Equality is a lawful empty suffix. With no
   selected replacement, the original full hold remains. Choosing a later picture
   never removes an earlier picture's hold.
4. Add selected additionalHolds by their unique holdId, then perform ordinary
   person/exact-resource-slot interval compatibility. Additional holds cannot
   duplicate fixed IDs or reintroduce an overlapping copy of the replaced hold.
   Equal owner keys alone NEVER excuse an overlap or an inconsistent interval.
   The adapter must express retained occupancy by the exact replacement, not by
   both a fixed horizon hold and a second continuation hold.

At most ONE alternative per path is selected. A `firstTake:null` continuation
may establish release or resource transitions and earns NO credit, existing-unit
score or target boundary. Historical takes cannot become future events. Its cast
and staffing still describe the actual picture; the adapter certifies the release
action and ALL relevant cross-path interactions, not merely a witness string.

These requirements are internal input invariants. Malformed identities/intervals
are implementation/input errors, never proof of gameplay IMPOSSIBLE. No GameState
validator, save admission or release authority is relaxed by this representation.

## Canonical credits and exact prior profile

Demand keys are tuple namespaces, not caller-chosen concatenated strings:
`['target']`, `['prior',promiseId]`, `['foreignDebit',sourcePromiseId]`.
Canonical key encoding is JSON of that tuple. Duplicate source identity across
prior/debit collections is invalid; an existing target promise is excluded from
both. Every witness credit names one selected NONNULL event path, the person's
actual slot in its complete cast, and an in-window demand. One `(personId,pathKey)`
can pay at most ONE planning demand, including debit and target. Different people
may use their distinct actual seats on the same picture. No credit is minted from
the staffing reference, an already-filmed continuation, or an unselected variant.

Every prior/debit receives EXACTLY its remaining number of credits. A count probe
gives target X; an achievable probe gives target B=X+ceil(X/3). A bound target's X
is count minus actual class-qualified evidence clipped at0; unbound X=count.
Zero is ALREADY_MET, without a game outcome. Target boundary output is the sorted
list of its credited firstTake boundaries, with multiplicity across distinct
paths. The first X must be existing paths and the Xth take leaves8 weeks for an
achievable witness. No two incompatible witnesses may supply these conditions.

`existingUnits` counts individual prior PLUS foreign-debit credits whose selected
path has existingPath=true and firstTake nonnull. It is NOT distinct pictures,
people or target credits. E.g. two different prior people on one existing picture
contribute2. Build the common profile boundary list from ALL distinct nonnull
existing firstTake boundaries in the complete relevant existing domain, sorted
by (week,step). At each boundary, count those same prior/debit existing credits
whose take is <= that boundary. Include zero entries. Future-path credits and
zero-event continuations never enter this profile.

Optimize the tuple `(existingUnits, cumulativeUnits[0], cumulativeUnits[1],...)`
lexicographically, while satisfying all priors/debits. Keep every equivalent
assignment available for the protected target probes. IDs may stabilize search
serialization, never permanently award a contested lead or discard a claimant.

Review44 accepts the foreign debit as an explicit conservative RULES4 mechanical
hypothesis, not unchanged B3 physical classification: retain its original source
identity/window in inputs/digest; full remainder applies even for partial overlap.
Only overlapping same-person foreign rows qualify, under
`source.due > max(now.week,target.start)` and `source.start < target.due`.
Their normalized token mask is all3, normalized window is the target window, and
they participate in prior protection. Tokens withhold local opportunity; they
record no foreign seat/date/fulfillment. Other-person foreign rows, self, inactive
and exact nonoverlap do not enter. Actual foreign employment/holds remain separate
facts. One event cannot pay both token and target; a token does not take an entire
picture. This normalization is not causal BROKEN authority.

## Proof and deterministic budget contract

Retain42/44's proof rules: a complete lawful B witness PLUS proved full prior
optimum may certify even with missing FUTURE alternatives; a best-so-far optimum
may not. Complete existing-domain saturated bounds must prove every profile
component. Missing relevant holds or unproved staffing/interactions prevents a
positive certificate. Failed protected X plus unoptimized all-obligation X
witness is prior-protection FRAGILE. IMPOSSIBLE requires complete unoptimized
joint-count failure or a sound hard bound, never a partial-domain count. All
results are offer reads, not beneficiary winners or target-specific BROKEN proof.

Default maxima remain32 combined prior/debit/target rows,64 combined prior/debit
units PLUS B,1024 alternatives,200000 logical work and owner-derived span220.
The numeric limits fields permit LOWER test budgets, not higher gameplay caps.
Safe saturated counting precedes expansion; no per-count/per-week loop on large
admitted integers. Known sound direct legal/upper-bound proofs may return before
unneeded general expansion; they must not manufacture a bound from truncated data.

Deterministic charging refinement for implementation:

- Start at preparationWork, which the adapter must itself measure canonically.
  One shared counter covers normalization, protection and ALL probes.
- Before searching, charge a structural scan: one unit per scalar leaf and per
  character in string leaves, plus array element visits. Exhaustion here returns
  workLimit with workUsed=limit and fixed omission `normalization work limit`;
  it cannot certify in one input order before examining the rest.
- Precharge normalization/sorting per array by the deterministic allowance
  `4*n*ceil(log2(n))` for n>1,0 otherwise, using saturating arithmetic before
  multiplication. Use a bounded canonical sort, not charge engine-sort comparator
  calls whose number depends on incoming permutation. All stable keys include
  the complete semantic tuple, with opaque IDs only as final identity tie fields.
- Canonicalize claim/debit, alternative, hold, replacement, mask and omission
  collections before search. From then on visit the same canonical branch order;
  charge each branch, compatibility pair, counter/profile comparison and witness
  construction step before performing it. Equal normalized inputs have equal
  cap disposition/work use, regardless of original array ordering.
- Size/work/domain omissions map only to UNCERTIFIED and the already adopted
  nonofferable FRAGILE explanation. Charge no unbounded preprocessing outside
  this accounting; no false maximum or timeout increase is licensed.

Independent tests should assert permutation-equivalent results/cap disposition,
not compare implementation-generated expected profiles or copy a search oracle.
The allowance is a logical bounded-work contract, not a CPU timing guarantee.

## Fourth minimal fixture: already-filmed release, not a second event

Add to42's three finite fixtures. All facts below are detached scheduling inputs,
not fabricated game saves. Now=(10,0), target T any-cast X1 window[15,30), no
priors/debits. Fixed hold H belongs to path F/person T, interval[(8,0),(30,0)),
replaceableFrom=(10,0). F has already filmed: its sole release alternative is
firstTake=null, personRelease=(14,0), replacement `{holdId:'H',newUntil:(14,0)}`.
Future staffed picture G starts15, takes18, releases22; its additional T hold
is[(15,0),(22,0)). Domains/holds complete; no spare picture.

- With F's release alternative, count witness selects F+G, credits ONLY G, and
  preserves H's[(8,0),(10,0)) prefix. Count is possible; no B2 witness, therefore
  PROVEN_FRAGILE. F contributes0 event/target/profile credit.
- Remove F's alternative but retain H: T stays occupied to30, G cannot be used;
  complete-domain result is PROVEN_IMPOSSIBLE/jointOfferOnly, never guessed release.
- Add another owner's immutable T hold[(15,0),(19,0)): F's selected replacement
  still cannot remove it, so G remains blocked. Renaming that other owner to a
  superficially similar key cannot authorize replacement.
- Reverse alternatives/holds and use an intentionally tiny work budget: preserve
  the same status/cap disposition; no input-order lucky positive certificate.

Also retain44's foreign-debit discriminant: earlier existing T event pays debit,
next existing T event pays X, later event supplies spare in ONE witness. Removing
the next existing path cannot substitute a future-only target and still pass
existing-path protection. Membership/digest tests must retain sourceWindow,
partial overlap, exact nonoverlap and original source identity.

Next: independent requirement-first kernel RED against these names/definitions;
then a separately authorized kernel implementation. Full owner-adapter, natural
chains, policy/wire/live activation and B4 acceptance remain separate work.
