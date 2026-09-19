# P14B.4 detached capacity kernel — interface proposal

2026-09-20. Bounded design preparation, NOT implementation or solver acceptance.
Base: published6d42bcea485cf45faa07fdb48efc1e8b6b666ed0 plus frozen pure-core
candidate supplied by parent. Only this document is written. No runtime, engine
probe/import, source/test edits, Git, network or delegation.

Authority: reviewed B4 plan382252, its bounded-capacity appendix; B-F2 owner
preparation/review13–14; B4 mode correction17. This proposes internal mechanical
types for independent RED, not new availability, employment or winner policy.

## Boundary and proposed entry point

Propose `searchPromiseCapacity(input: CapacityKernelInput): CapacityKernelResult`
in a future lower-level `src/core/promiseCapacityKernel.ts`. It imports no
GameState, Production, forecast, action, tick, queue or rival-policy module.
The adapter supplies detached owner-certified alternatives; the kernel checks
their joint compatibility and searches assignments. It neither runs the owners
nor creates their records. All input/output trees are deeply readonly; all maps,
counters and search work are local to this invocation.

Illustrative TypeScript shapes (names are proposed, not existing exports):

```ts
type Slot = 'lead' | 'antagonist' | 'support'
type Mask = readonly Slot[] // canonical distinct subset; never inferred from version
type Window = { startWeek: number; dueWeekExclusive: number }
type Boundary = { week: number; step: number }
type Interval = { from: Boundary; until: Boundary }
type PersonHold = Interval & { personId: string; ownerKey: string }
type ResourceHold = Interval & { resourceKey: string; slot: number; ownerKey: string }
type Demand = {
  key: string; personId: string; mask: Mask; window: Window; remaining: number
}
type PriorClaim = Demand & {
  promiseId: string; issuerId: string; membership: 'bound' | 'current'
}
type ForeignDebit = {
  promiseId: string; personId: string; issuerId: string
  membership: 'bound' | 'current'; remaining: number
}
type PictureAlternative = {
  key: string; pathKey: string; issuerId: string
  existingPath: boolean
  greenlight: Boundary; firstTake: Boundary; personRelease: Boundary
  cast: Readonly<Record<Slot, string>>
  staffingWitnessKey: string
  personHolds: readonly PersonHold[]
  resourceHolds: readonly ResourceHold[]
  ownerFactRefs: readonly string[]
}
type DomainCoverage = {
  claimsAndHolds: 'complete' | 'incomplete'
  existingAlternatives: 'complete' | 'incomplete'
  allAlternatives: 'complete' | 'incomplete'
  omissions: readonly string[]
}
type CapacityKernelInput = DeepReadonly<{
  now: Boundary; horizonEndWeek: number; issuerId: string
  target: {
    promiseId: string | null; personId: string; mask: Mask; window: Window
    state: 'unbound' | 'bound'; count: number; actualQualifiedCount: number
  }
  priorClaims: readonly PriorClaim[]
  foreignDebits: readonly ForeignDebit[]
  alternatives: readonly PictureAlternative[]
  fixedPersonHolds: readonly PersonHold[]
  fixedResourceHolds: readonly ResourceHold[]
  coverage: DomainCoverage
  preparationWork: number // already charged adapter work, not a fresh budget
  limits: { claims: 32; units: 64; alternatives: 1024; work: 200000; span: number }
}>
```

`DeepReadonly` is notation for the contract, not a proposed new library. Resource
keys name real owner slots (stage, Set, post, writing, etc.); no anonymous scalar
stage count substitutes for them. If a resource admits several slots, the adapter
enumerates lawful exact-slot alternatives. A whole alternative already specifies
its FULL lawful cast, complementary staffing and schedule. The kernel does not
cross-product separate casts/calendars or slide its take into a later window.
The staffing witness is an adapter-owned proof reference, not a generated person
or a claim that an arbitrary string makes a schedule legal.

Boundaries compare `(week,step)` lexicographically without arithmetic packing.
The adapter's step convention preserves actual command/sweep order. Half-open
holds permit release/reacquisition only at lawful ordered boundaries. This is
needed for same-week wrap/Post/stage reuse and the player's next schedule command;
bare integer weeks cannot establish those facts. No new game calendar is stored.

## Adapter facts versus kernel choices

The adapter owns eligibility, exact employer availability, actual writing versus
permanent writer credit, required setup/technology/scenery, owner sweep/admission
order, and the legality/completeness of every alternative. Apply owner-review14's
caller-specific busy predicates; do not broaden greenlight to commissioning's
different busy rule. Legacy DEVELOPMENT plus managed OPERATIONS can produce a
lawful direct-stock take; managed DEVELOPMENT needs the actual Ready path;
legacy OPERATIONS emits no take (correction17).

Path identity is productionId once started, otherwise issuer/project identity,
the actual bounded stock concept, or planner-local hypothetical-commission key.
An inProduction script, queue item and production join ONE path. Alternatives
sharing pathKey are mutually exclusive. Already-recorded first takes supply no
new event, although their person/resource holds still matter. Fixed cast appears
unchanged in every alternative of its started picture. A release-ready film is
not assumed released without its owner-certified future action boundary.

When modeling a continuation of an existing path, its committed holds must not
be charged again as competing fixed holds. Exact `(ownerKey,person/resource,slot)`
identity distinguishes the same owner's retained interval from another claim.
Keep immutable committed prefixes and certified continuation holds consistent;
do not discard another owner's hold or double-charge the same stage reservation.
An unresolved release extends through the horizon, not to a guessed week.

Membership is prepared once under B3 law and used by both kernel and input digest:
OPEN, bound OR CURRENT-linked, self excluded, half-open relevant overlap. Abandoned,
terminal and unrelated nonoverlapping rows do not consume demand. Same-issuer
other beneficiaries compete for actual class seats; foreign other beneficiaries
do not take this issuer's lead. Coverage must attest that no governing relevant
claim or actual hold was omitted. The kernel does not choose which obligations
to keep: every included prior claim is required.

Foreign same-person reservations remain a separate conservative debit, not
simultaneous foreign employment or a fabricated foreign picture. Proposed explicit
mechanical realization of the inherited scalar debit: charge its remaining units
as additional distinct generic-cast opportunity tokens for that person in the
TARGET's analyzed window, before target probes; include them in prior-path
protection. Source overlap selected the debit; do not impose an invented foreign
first-take date or seat class. These tokens represent capacity withheld from this
offer, never evidence that the foreign promise was fulfilled. They consume actual
local witness opportunity/temporal capacity and cannot reuse the same person's
event for the target. Keep source promise IDs for deduplication and explanation.
This normalization must receive explicit bounded review against B3's existing
`reservedByActivePromises` semantics before foreign-debit implementation; it is
not an assertion that scalar debit already supplies a physical calendar.

For bound target demand compute `X=max(0,count-actualQualifiedCount)`; unbound
uses X=count. The adapter derives actualQualifiedCount from the exact shared
class/issuer/window/distinct-production evidence owner, not stale progress.
X=0 returns an already-met READ result without settling or minting anything.

The kernel chooses at most one whole alternative per path, compatible person/
resource intervals, and claim-to-seat credits. One picture can credit different
people's claims in distinct actual seats. Planning separately reserves each
promise: the same person's one event cannot pay two planning demand counters.
This deliberately differs from actual outcome evidence, which may satisfy two
separate promises to that person. Do not change outcome law to match planning.

## Probes, protection and proof-bearing results

Prior optimization satisfies ALL prior claims/debits, then maximizes aggregate
existing-path credits. Among equal totals, lexicographically maximize cumulative
prior credits at successive existing first-take boundaries. Derive the boundary
sequence from the complete relevant existing domain, not input array order.
Retain all equivalent prior profiles/assignments for target probing: an arbitrary
beneficiary or ID must not occupy a lead permanently just because visited first.

With positive X, B=X+ceil(X/3). The protected count probe asks for X target events.
The achievable probe asks for B in ONE compatible joint witness, with its first X
target events on existing paths and dueWeekExclusive minus Xth take week >=8.
Both probes preserve the SAME proven prior optimum. Do not combine the spare
capacity of one schedule with the early existing path of an incompatible schedule.

```ts
type Witness = {
  selectedAlternativeKeys: readonly string[]
  credits: readonly { demandKey: string; pathKey: string; slot: Slot }[]
  targetTakeBoundaries: readonly Boundary[]
}
type PriorProfile = {
  existingUnits: number
  cumulativeByBoundary: readonly { boundary: Boundary; units: number }[]
}
type CapacityKernelResult =
  | { status: 'ALREADY_MET'; remaining: 0 } // internal read, no new game enum
  | { status: 'CERTIFIED_ACHIEVABLE'; remaining: number; bufferDemand: number
      priorOptimum: PriorProfile; witness: Witness }
  | { status: 'PROVEN_FRAGILE'; reason: 'achievableProbeFailed' | 'priorPathProtection'
      priorOptimum: PriorProfile; countWitness: Witness }
  | { status: 'PROVEN_IMPOSSIBLE'; scope: 'jointOfferOnly'
      reason: 'completeCountFailure' | 'certifiedUpperBound'; upperBound?: number }
  | { status: 'UNCERTIFIED'; reason: 'domainIncomplete' | 'workLimit' | 'sizeLimit'
      omissions: readonly string[]; workUsed: number }
```

Witnesses are detached proof objects, not gameplay assignments or employment
winners. Deterministic normalization/traversal and witness serialization must be
independent of input array permutations. IDs establish identity, not beneficiary
priority. Equivalent assignments must remain available to satisfy ALL claims;
cap exhaustion is UNCERTIFIED, not permission to discard inconvenient claims.

Proof requirements:

- A legal X witness proves possibility even if other alternatives are omitted.
  It does not prove maximum capacity, optimal prior protection or FRAGILE.
- CERTIFIED_ACHIEVABLE may survive an incomplete future domain ONLY when its
  complete witness is lawful, claims/holds are complete, and the prior optimum is
  actually established. No priors is a trivial optimum. Another valid case is a
  proved saturated prior upper/profile bound over a COMPLETE existing domain;
  missing future paths cannot improve that bound. A best-so-far prior schedule
  is not an optimum. Omitted existing alternatives normally prevent certification.
- Protected X feasible plus a COMPLETE failed achievable probe -> PROVEN_FRAGILE.
  Protected X failed, proved prior optimum, and an unoptimized lawful joint X
  witness -> PROVEN_FRAGILE/priorPathProtection. The latter needs no impossible
  claim: it explicitly demonstrates that prior reallocation would make X possible.
- IMPOSSIBLE requires complete failed UNOPTIMIZED joint X search over complete
  domains/claims/holds, or a valid independently derived hard upper bound. A
  partial list of paths is not a hard bound. Direct legal refusals remain the
  outer feasibility owner's law; the kernel takes no arbitrary trusted Nmax.
- Missing holds/staffing soundness prevents even a positive certificate. Any
  incomplete necessary proof/cap -> UNCERTIFIED, mapped only to nonofferable
  FRAGILE with `bounded capacity analysis could not certify this schedule`.
  No result here is target-specific causal BROKEN authority.

## Bounded work and arithmetic

Input saved counts/weeks may be arbitrary positive safe integers. Validate
arithmetic before expansion: saturate summed units at65 for the64-unit gate;
bound X before computing/allocating B; never allocate one object per huge count
or loop one week at a time through an admitted historical window. Compare
boundaries directly and avoid unsafe start+term arithmetic. Cap covers prior
rows/debits plus target, and prior units plus the B probe, not X alone.

Span limit is derived by the adapter from the actual renewal/term catalogues
(`TUNING.HIRING_RENEWAL_WINDOW_WEEKS=12`, maximum CONTRACT_TERM_OPTIONS=208),
currently220 from NOW, not208. Latest relevant due bounds the analyzed horizon;
larger valid inputs yield UNCERTIFIED, never invalid saves. Holds past that end
stay occupied throughout it. Charge canonicalization, alternative expansion,
compatibility construction, objective optimization and both probes against the
shared200000-work budget, starting at preparationWork; do not hide exponential
preprocessing outside search or restart the budget for each probe.

No polynomial completeness claim is made. Intended bounded cost is linear owner
inspection plus charged work up to W, with bounded claim/alternative/unit memory;
sorting and pairwise compatibility are charged too. A simple exhaustive finite
search for small inputs with pruning is acceptable; raising caps/timeouts or
claiming every natural offer uncertified is not acceptance. Natural repeated
quote/rival costs must be measured later by the parent.

## Three smallest requirement examples for independent kernel RED

These are detached mathematical fixtures, NOT invented engine history. Each
named alternative includes a complete owner-certified staffing/hold packet;
all unmentioned crew are distinct/legal, and intervals shown permit the stated
combinations. Full-domain claims below apply only to these finite test domains.

1. **One shared picture, three class seats, plus spare.** Now0; target T any-cast
   X1 window[0,40); prior A lead-only1 and B flexible1, same window/issuer. Existing
   P has take10/release14 and cast `{lead:A,antagonist:B,support:T}`. Future Q has
   take24/release28, T in support and lawful complementary cast. Nonoverlapping
   person/phase holds; complete domain. Prior optimum2 at10. One joint witness
   credits A+B+T on P and T's spare on Q; CERTIFIED_ACHIEVABLE. Reorder claim/path
   arrays unchanged. Removing Q leaves X possible but no B2 witness, hence
   PROVEN_FRAGILE, not IMPOSSIBLE. Never reserve all of P to its lead claimant.

2. **Fixed support is not lead capacity.** Target T lead-only X1 [0,20), no priors;
   only P takes10 with T fixed in support; no other paths, complete domain. Hard
   eligible-event upper bound0 -> PROVEN_IMPOSSIBLE/jointOfferOnly. Flexible P2
   also fails; any-cast X1 succeeds only at count probe and is PROVEN_FRAGILE
   without a spare. Changing coverage to incomplete alternatives must withdraw
   the impossible proof and return UNCERTIFIED. Never recast the fixed picture.

3. **Protected prior reallocation is fragile, not impossible.** Prior A lead1
   [0,40); target T lead1 [0,20). Existing P at10 has two mutually exclusive whole
   alternatives, lead=A OR lead=T. Future Q at25 can legally seat A. Holds permit
   P then Q; complete domain. Proven prior optimum uses P for A (existingUnits1).
   Protected count for T fails, but unoptimized `{P:T,Q:A}` is lawful. Return
   PROVEN_FRAGILE/priorPathProtection with that X witness, never IMPOSSIBLE and
   never assign an actual loser. Reverse P alternatives/claim arrays unchanged.

Independent tests should assert these obligations and validate witnesses from
the fixture facts, not compare the searcher's output to its own derived helper.
These three fixtures do not cover owner-adapter completeness, foreign debit
normalization, natural rival strategy, physical impossibility or full B4.
