# 1225-A — P4/P5 concrete contract candidate

Parent-authored review candidate on3d0b05ea (production2af37179), after1218-A/B.
This is not a production release or a claim that outgoing preservation succeeded.
1221 source review,1222 compiler,1223 actual capture and1224 attribution remain
ahead of version activation. Existing P4/P5 refusals remain authoritative.

## Material definitions

The proposed bounded cast catalogue is `allCast`, `lead`, `leadOrAntagonist`.
These mean respectively the existing lead/antagonist/support mask, lead alone,
and lead/antagonist. Adding allCast here is an explicit implementation choice
using P1's existing mask, not a claim that1218 or the Owner selected that spelling.
All use requested Actor discipline and actual greenlight eligibility, independent
of the primary-profession label. Director remains the separately defined P3.

Proposed exact core predicates:

```ts
type OpportunitySeatClass = 'allCast' | 'lead' | 'leadOrAntagonist'
type GenreOpportunityPredicate = {
  kind: 'genreOpportunity'; count: 1; seatClass: OpportunitySeatClass; genre: Genre
}
type ProjectOpportunityPredicate = {
  kind: 'projectOpportunity'; count: 1; seatClass: OpportunitySeatClass; scriptProjectId: string
}
```

The tags apply only to PREFERRED_GENRE_OPPORTUNITY and SPECIFIC_PROJECT,
respectively. Exact keys and literal count1 are required. Genre is one of the
existing six Genre values. The project is an existing script project of the
issuer, never a concept ID, title, rival project or new commission request.
Historical count-only P4/P5 retain their recorded generic-cast meaning and are
not silently converted into fresh offerable predicates.

Family, count, selected class, genre/project identity and the half-open window
are material for proposal digest, attachment, settlement freeze and substitution.
No new salary term or new family is added. A fresh promise is bound only by the
existing accepted proposal/contract transaction; abandoned roots earn no outcome.

## Durable first-take subjects

Proposed required root:

```ts
firstTakeSubjects: {
  version: 1
  cutoverOrdinal: number
  facts: readonly {
    eventId: string
    conceptId: string
    genre: Genre
    scriptProjectId: string | null
  }[]
}
```

Keep FirstTakeReceipt and every old receipt byte unchanged. A genuinely admitted
frozen39 migration sets cutoverOrdinal to the old firstTakes.length and facts to
[]. Fresh worlds use0. For each actually new receipt appended by appendFirstTakes,
append exactly one subject in the same transaction, in receipt order. Resolve
the concept and script link from the actual issuing owner at that take. A stock
picture may have scriptProjectId:null; an absent pre-cutover subject is unknown
history, not that null observation. Missing authoritative concept/managed-project
joins fail loudly rather than inventing a subject. Duplicate append is idempotent.

Validate exact root/fact keys, version1, integral cutover in[0,firstTakes.length],
and an exact one-to-one ordered suffix of firstTakes from cutover onward. Validate
event identity and concept/genre against retained owner authority; any nonnull
project must belong to that owner and concept. A canceled project's cleared live
productionId does not invalidate its retained take subject. Where a surviving
production or released film carries an independent join, require agreement.
Cancellation, release, import and validation never remove, backfill or rewrite
subjects or move cutover. This is an append/validation law, not a cryptographic
proof against rewriting an entire internally consistent save.

New tagged outcomes require both the original receipt's issuer/person/class/
window facts and its subject's genre/project fact. Distinct productions count;
count1 progress is bounded and earned work stays earned after cancellation.
No mutable later project lookup supplies missing historical evidence.

## Singular quote and reservations

P4/P5 use one required event, existing pipeline, an available qualifying seat,
existing facility capacity and eight-week slack. They do not use a spare-event
buffer. A real already-held qualifying pre-take seat uses its actual clock;
post-take pictures cannot produce a second first take. Fresh work waits for the
beneficiary's other actual production-company seats across owners; Writer credit
alone is excluded. Fresh admission reads requested Actor retirement as well as
the current profession boundary. Existing committed seats keep finishing rights.

P5 enumerates only its named project's path. Produced, already-taken, wrong-owner,
missing and greenlit-with-no-matching-fixed-seat targets are unavailable; there
is no assumed cancellation, recasting or substitute project. P4 enumerates actual
genre-matching pipeline paths. A future matching commission can explain FRAGILE,
but cannot certify an existing path. A concept without a script does not satisfy
P5's named existing-project input. Genre and project checks apply to running
pictures as well as scripts, and pipeline status/draft completion/resource holds
participate in the quote and input digest.

The following is a deliberately conservative **candidate reservation policy**
for independent review, not a claim to have implemented evaluator5:

* Keep the membership-first bound/current-attached, open, unmet, nonself,
  half-open-overlapping person-or-issuer union already used by revision6.
* Never compare the whole union's count against P5's Nmax1. Issuer equality
  alone does not prove that another person owns this exact target seat.
* A sufficient reservation-clearance witness is that every other retained
  obligation is already covered by its own actual qualifying pre-take committed
  seat(s), on distinct productions from the candidate. Each witness must satisfy
  its real predicate, remaining count, issuer, beneficiary, role and window.
  Fixed company assignments supply the occupancy proof. Do not manufacture future
  allocations to uncast scripts or treat mask intersection as an allocation.
* A directly conflicting named-project fixed-seat fact can rule a path out.
  Otherwise, an unproved alternative allocation is FRAGILE with a reservation
  reason. It is not IMPOSSIBLE merely because this sufficient witness is absent.
  Any conservatism of this restricted witness must be disclosed in tests/review.
* Actual compatible outcome sharing stays unchanged. The independent-seat quote
  witness is stricter than the material predicate; it never breaks a bound promise.

The reviewer must assess whether this sufficient witness is useful and faithful
enough for the first slice before it is adopted. It is not authorization to begin
a general scheduling solver, to optimize away reservations, or to change rival
staffing so a fixture passes. If a broader allocation rule is necessary, freeze
that exact bounded rule before production rather than leaving an implicit guess.

Candidate evaluator7 selects a fresh tagged opportunity or a quote whose relevant
union contains one. Count-family quotes in that scope retain their count buffer
and revision6 occupancy rules, and include all new material predicate fields in
their digest/reservations. Outside the new scope, exact existing4/6 behavior and
stored receipts remain. Revision5 stays reserved for its separate joint work.
The exact7 algorithm and validator acceptance need review before allocation.

## Outcomes and waiver strength

Use the existing first-take, studio action, due-week and lifecycle event owners;
no second weekly poll or clock. A real qualifying take satisfies once. A fixed
wrong-seat greenlight of the named target can make an unmet P5 impossible and
must reach the existing studio-caused BROKEN path. A pre-take cancellation that
returns the same screenplay to Ready does not by itself prove permanent physical
impossibility: test the actual remaining target and time separately from quote
reservations/slack. Genre cancellation likewise needs an actual impossibility
proof. After-take cancellation preserves earned evidence and existing conduct
consequences. External retirement/profession disposition uses an explicit
role/target-specific physical check; a FRAGILE estimate is never terminal proof.

Waivers retain real contract interval, forward-only window, unfulfilled count,
trust and feasible-substitute requirements. Add predicate inclusion to the
existing class-mask subset rule: an original genre requires the same genre, or
the same-genre named project; an original named project requires that same project.
A new genre/project restriction may strengthen generic cast work only when it
covers the whole remaining count (therefore at most one). A generic cast count
cannot erase an original genre/project restriction. Director/cast exchange stays
refused. Equality includes the complete material predicate, not just class/count.
Validate retained waiver links by this same strength law, with historical links
admitted under their frozen shape law and no receipt restamping.

## Persistence, Bridge and symmetric policy boundary

Candidate coordinated boundary is Save40 / projection55 / protocol4 / evaluator7.
These numbers remain unactivated until the outgoing capture and this contract
are closed. Frozen39 readers stay strict and cannot admit40 fields by omission.
The live proof must validate all new authority before any historical-context
projection; never hide malformed new predicates while delegating older checks.
39→40 preserves every old field/value and adds only the empty cutover root.
40→39 first admits the full40 save, then refuses any new fact or new tagged
predicate, including terminal/unbound/waived rows. Empty representable states
may downgrade losslessly. All earlier downgrade routes pass through this guard.

Wire drafts discriminate the new families, require the selected class and exact
genre/scriptProjectId, and fix count1. Own proposal/history/waiver reads carry the
selected restriction and clear begin-filming copy. Competing promises remain
UNKNOWN, including genre and named project; no private target leaks via summaries.
Keep generated contracts and runtime54 migration/replay independently qualified.
Only the existing standalone component is in this UI slice; no hosted/native claim.

Rival proposals use the same feasibility service. Existing bounded strategy may
choose a matching existing genre/project opportunity only through that law; no
new market or staffing authority. Seating preference must receive the actual
project/concept context and must not apply a genre/project promise to arbitrary
work. Historical classless and P1/P2/P3 behavior outside the new scope stays intact.
Require player/rival append, matching and refusal controls, strict migration and
downgrade controls, actual outcome/cancellation/waiver controls, material freeze,
purity, privacy, runtime replay and component evidence before claiming the slice.
The failed1169 route and other P3 qualification limits remain individually named.

This candidate releases no tests or edits; source-derived reviewer refinements
and separately owned concrete test requirements precede the parent production patch.
