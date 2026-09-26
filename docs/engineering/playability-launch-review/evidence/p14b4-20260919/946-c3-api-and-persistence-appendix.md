# 946 — C.3 exact API and persistence appendix (draft)

2026-09-26. Companion to942/942-A. No production release until independent review,
outgoing T0 and independent RED. Source1f44aa50 is still Save37/projection52.
This document selects implementation details under937's delegated authority;
it creates no additional career path, promise family or Owner decision.

## Persistent types

Add these exact fields to a new `CareerLifecycleRootV38` extending V36; historical
root/types remain frozen. `GameStateV38` replaces only careerLifecycle in V37.
The live GameState/LiveSaveFile/makeSave/import/migrate boundary moves together.
Every object has exact keys; all week/count/ordinal numbers are safe nonnegative
integers. All arrays are readonly to consumers. Names below are core names.

```ts
type TransitionTarget = 'director' | 'writer'
type TransitionRoleTier = 'Highly unproven' | 'Raw prospect' | 'Limited-or-developing'
  | 'Strong' | 'Major-studio' | 'Elite' | 'Generational'
type TransitionPotentialTier = 'Limited' | 'Steady' | 'Promising' | 'High Upside'
  | 'Exceptional Upside' | 'Generational Upside'
type RetirementKey = { personId: string; profession: CreativeRole }
type ProfessionAnchor = {
  personId: string; profession: CreativeRole; recordedWeek: number
  kind: 'existing' | 'entrant'
}
type TransitionPictureRef = { studioId: string; pictureId: string }
type TransitionContextWitness = {
  counterpartId: string | null
  // First min(contextCount, 2) canonical pictures for one maximal counterpart.
  pictures: readonly TransitionPictureRef[]
}
type TransitionTargetInput = {
  profession: TransitionTarget
  capability: number; roleTier: TransitionRoleTier
  workHistory: number; proven: boolean; potentialTier: TransitionPotentialTier
  contextCount: number; contextBand: 0 | 1 | 2
  contextWitness: TransitionContextWitness
}
type TransitionInputs = {
  age: number; actingFirstTakes: number; leadFirstTakes: number
  // First min(actingFirstTakes, 3) canonical real take event ids.
  actingWitnesses: readonly string[]
  targets: readonly [TransitionTargetInput, TransitionTargetInput]
}
type TransitionEvaluation = {
  id: string; ordinal: number; week: number; personId: string
  source: RetirementKey; rulesVersion: 1
  inputs: TransitionInputs; inputsDigest: string
  outcome: 'deferred' | 'chosen' | 'declinedAll' | 'ageBoundary'
  selected: TransitionTarget | null
  reason: 'noEligibleTarget' | 'onlyEligibleTarget' | 'strongerPublicTuple'
    | 'equalPublicTuples' | 'waitingAgeReached'
}
type ProfessionChange = {
  id: string; ordinal: number; week: number; personId: string
  from: 'actor'; to: TransitionTarget; evaluationId: string
}
type IndustryRetirement = {
  personId: string; week: number; profession: CreativeRole
  source: RetirementKey
  cause: 'noCatalogue' | 'declinedAll' | 'ageBoundary'
  evaluationId: string | null
}
type TransitionDue = { personId: string; week: number }
type CareerLifecycleRootV38 = CareerLifecycleRootV36 & {
  transitionBoundaryWeek: number
  professionAnchors: readonly ProfessionAnchor[]
  transitionEvaluations: readonly TransitionEvaluation[]
  professionChanges: readonly ProfessionChange[]
  industryRetirements: readonly IndustryRetirement[]
  transitionDue: readonly TransitionDue[]
}
```

Target array order is director,writer. IDs are `transition-evaluation-N` and
`profession-change-N`, where N is their zero-based array ordinal. Retirement keys
compare both fields, never an unescaped joined string. Anchors are in talent order.
Industry retirement rows append in actual processing order with person uniqueness.
The queue sorts week then personId (code-point comparison); one entry per person.
Appending due subjects/receipts in that order does not break selection ties.

## Evidence, comparison and digest

Counts are exact totals over retained qualifying facts at or before evaluation,
deduplicated by `(studioId, pictureId)`. An acting first take includes the subject
in any recorded cast slot. Lead count requires cast.lead. Directing context joins
lead takes to their recorded director; writing context joins released acting and
writer credits on one picture. Player FilmResult.participants and Hollywood film
credits are alternative representations of the same picture, not extra counts.
Only actual recorded player participants count; do not fill uncaptured credits.
Authored-start released pictures may contribute writing context with their genuine
authored provenance; they never create a first take. Their containing studio must
already have entered at the historical evaluation week. Live releases must be dated
no later than evaluation. A retained cancelled take still proves that take.

The contextCount is maximum shared-picture count with one counterpart, zero if
none. The witness uses the code-point-smallest counterpart among equal maxima,
then first two canonical `(studioId,pictureId)` pairs; that identifier choice only
selects evidence, never affects eligibility or target choice. All exact counts
are rederived from complete retained source facts. Stored bounded references must
equal this deterministic witness selection; they are not the total-count oracle.
Acting witnesses sort by week,studioId,productionId,eventId and keep first three.

Capability is the P10 displayed perceived OVR (safe integer1..99); roleTier must
equal the existing roleTier(capability). workHistory is the historical snapshot;
proven equals capability>=CAPABILITY_OVR_MIN && workHistory>0. Potential tier must
be a member of the existing six public tiers. Neither historical capability,
potential nor workHistory can be reconstructed from today's mutable values.

Eligibility and comparison are exactly942. Tuple order is proven,roleTier rank,
contextBand,potentialTier rank. The reason/outcome/selected fields must agree with
deterministically recomputed choice. Age uses immutable provenance. Exactly one
eligible target requires reason onlyEligibleTarget; two eligible with unequal tuples require
strongerPublicTuple; equal eligible tuples require declinedAll/equalPublicTuples.
No eligible target requires deferred/noEligibleTarget until the age boundary.
At75 or older ageBoundary/waitingAgeReached wins before target choice.

Canonical digest is fnv1a64(JSON.stringify of the following positional tuple),
lowercase16hex. No raw object serialization or object insertion order enters it:

```text
[1, personId, week, [source.personId, source.profession],
 [age, actingFirstTakes, leadFirstTakes, actingWitnesses,
  targets.map(t => [t.profession,t.capability,t.roleTier,t.workHistory,t.proven,
   t.potentialTier,t.contextCount,t.contextBand,
   [t.contextWitness.counterpartId,
    t.contextWitness.pictures.map(p => [p.studioId,p.pictureId])]])]]
```

The digest binds the recorded question, not the outcome. Choice validation checks
the outcome separately. Integrity checks do not establish tamper-proof historical
public values; mutation tests state the exact invariant being demonstrated.

## Scheduling, migration and public core entry points

New TUNING names are PROFESSION_TRANSITION_MIN_ACTING_TAKES=3,
PROFESSION_TRANSITION_MIN_CONTEXT_PICTURES=2,
PROFESSION_TRANSITION_RECHECK_WEEKS=52, and
PROFESSION_TRANSITION_WAIT_AGE_MARGIN=5. Waiting cutoff is current acting hard
age plus that margin (70+5), while each target also uses its existing hard age.

`professionAtWeek(state, personId, week)` returns the observed original profession
before a change and the new profession inclusively at/after its week. It does not
decide presence; historical cohort callers must first select their recorded talent
prefix. Reject any prefix containing an entrant anchor dated after the cohort
receipt's week; silently ignoring that contradictory member is insufficient.
`retirementRecordFor(state,personId,profession?)` defaults to current primary
profession for current operations; explicit acting callers retain acting retirement.
Current helpers therefore require talent alongside careerLifecycle. A separate
latest completed record helper serves historical alumni and relationship boundaries.

`transitionInputsFor(state,personId,week)` derives today's public evidence without
writing and requires week===state.market.tick. A separate retained-facts helper
reconstructs historical take/context counts for validation; it never stamps today's
mutable skills, potential or workHistory at a past date.
`chooseProfessionTransition(inputs)` returns outcome/selected/reason only.
`advanceProfessionTransitions(state,newlyRetiredKeys)` consumes due entries and
actual newly completed retirements after retirement settlement, before cohort.
It is copy-on-write, no RNG, no I/O, no global cache. Current obligations must be
cleared before any transition/finality commit; retirement settlement already owns
that invariant and the commit asserts it. A deferred subject is not made hireable.

Initial current roots receive anchors from actual fresh talent. Every real append
site appends entrant anchors at creation, including custom people, rival founding
teams, rival supply and annual cohorts. Frozen conversion intermediates without a
V38 root do not gain anchors; convertV37ToV38 opens them once over final talent.

Migration opens boundary=current week, existing anchors, empty new event arrays,
and, with Hollywood engaged, boundary+1 due entries for already-completed retirements. That initial
queue includes non-actors for prospective finality; after first reconciliation,
only deferred actors may remain queued. A current fresh root has no migration queue.
Null-Hollywood imports preserve valid old retirement facts with an empty queue;
no C.3 event can execute or become overdue while disengaged. A later actual
initializeHollywood call starts reconciliation, using its persisted originWeek.
The reconciliation opening is max(transitionBoundaryWeek,hollywood.originWeek).
Completed retirements at/before that opening are due opening+1. This same helper
runs after actual current-world industry activation; frozen conversion intermediates
without V38 roots do not gain current events, anchors or queues. This is no new
refusal in the public frozen37 reader.
Schedule inside initializeHollywood after actual entry work, covering beginFounding
and every caller. Its existing non-null early return stays idempotent; repeat
initialization/load never resets the queue. originWeek is persisted from the actual
initializer clock, validated at/before current week (fresh origin requires0).
An actor evaluation deferred atW schedules min(W+52,nextBirthdayWeek(row,74));
chosen/declinedAll/ageBoundary and all final retirees have no queue. Every pending
entry must be strictly after current week. No duplicates or stale due entries.

Validation reconstructs expected due entries from completed retirements, migration
boundary/actual engagement and each person's last event; compare exact sorted queue.
First evaluation is actual retirement week unless that retirement predates/equaled
the reconciliation opening, in which case it is opening+1. Later evaluations are
the previous exact due week.
Every chosen evaluation corresponds one-to-one with a same-week change; every final
outcome corresponds one-to-one with industry retirement. A non-catalogue finality
has null evaluationId. No extra evaluations after change/finality. Per-person event
history is bounded by actual retirement chronology and the annual schedule, not a
five-evaluation cap. The margin5 means hard acting age70 to cutoff75; an actor who
completes earliest normal retirement at61 can evaluate61 through75 inclusive.

Frozen public validate/migrate readers through37 keep their old defaults. Add
make/validate/convert/migrate38 following existing version patterns. A downgrade
to37 refuses any nonempty event/change/finality or actual post-boundary entrant
anchor/new semantic state, before stripping empty scaffolding. Empty boundary
anchors and untouched prospective migration queue may be stripped losslessly.

## Projection53 fields

Keep `StudioPersonLifecycle` as the current primary profession's lifecycle shape.
Add required `career` to `StudioPersonProfileSnapshot`, reference `StudioPersonCareer`:

```text
StudioProfessionRetirement:
  profession: professionEnum, announcedWeek/effectiveWeek/retiredWeek: nonnegativeInt,
  retiredLabel: nonemptyText, extensionUsed: bool
StudioProfessionChange:
  fromProfession: literal actor, toProfession: director | writer, week: nonnegativeInt,
  dateLabel: nonemptyText, reason: nonemptyText
StudioPersonCareer:
  status: working | awaitingTransition | pendingReconciliation | retired,
  line: nonemptyText, recordingNotice: nullable(nonemptyText),
  professionRetirements: StudioProfessionRetirement[],
  lastChange: nullable(StudioProfessionChange),
  industryRetiredWeek: nullable(nonnegativeInt),
  industryRetiredLabel: nullable(nonemptyText)
```

professionRetirements contains actual completed profession retirements in date/role
order, at most two. lastChange is the one public change, with a safe reason sentence
derived from its typed reason, never raw inputs, witness counterpart or private terms.
working includes active/announced/finishing current professionals. awaitingTransition
means actually deferred or prospectively due retired actor. pendingReconciliation
means migrated retired non-actor before its first current-law tick. retired requires
an actual industryRetirement fact. recordingNotice explains the prospective boundary
where relevant; no backdated finality is inferred at load.

Existing nullable alumni remains populated once any profession was completed; its
profession/date identify the latest actual completed profession. Existing credits,
honors disclaimer, employment and filmography references retain their meanings.
Add to every StudioIndustryPerson: careerStatus (same four-enum), careerLine(text),
professionRetiredWeek(nullable int), industryRetiredWeek(nullable int), and
lastProfessionChangeWeek(nullable int). Existing lifecycleStatus/retiredWeek remain
current-profession facts. Alumni query includes any professionRetiredWeek, one row
per identity, sorted that week descending then personId. Current employment/new role
are visible alongside former-profession retirement; pagination limits unchanged.

Relationships are current for working new-profession people. Waiting/pending rows
use latest actual profession-retirement asOf; final industry rows use final actual
profession-retirement, even when prospective finality was recorded later. Never
reconstruct unavailable historical tiers or relax current counterpart disclosure.

Calendar and Industry activity add actual profession-change and industry-retirement
events at their recorded weeks, using existing person routes. The exact surfaces:

- Add `careerEvents` to core StudioCalendarView, separate from future/current
  `commitments`: `{eventId, kind:'professionChanged'|'industryRetired', week,
  talentId, talentName, profession, fromProfession:'actor'|null, line}`. Only actual
  records with0<=currentWeek-week<13 appear; sort week descending, eventId ascending.
  profession is the new profession for a change or final profession for industry
  retirement; fromProfession is actor only for a change. StudioCalendar's existing
  React screen renders the recent events and uses existing
  `onNavigate({kind:'profile',talentId})`.
  No new unread state, stop, forecast, money, reservation or committed-event count.
- StudioIndustryActivity adds optional `careerKind:'professionChanged'|'industryRetired'`.
  Both kinds use group people, studioId=null, filmId=null, actual talentId/week/date,
  public headline/detail. Change eventId is its core change id; finality eventId is
  `industry-retirement:` followed by JSON.stringify(personId). One row per actual fact.
  Pulse retention is13weeks for these rows despite null studioId; the existing
  permanent public technology milestone exception remains specific to those older
  rows. Preserve group/week/eventId sorting and page bounds. The rows do not invent
  an employer and do not enter per-studio employment/history by coincidence.
- MARKET_ATTENTION_CAUSES adds professionChanged and industryRetired; payload remains
  `{cause,talentId,reason}`. Same actual-event13week window. Append after existing
  finishing/announcement priority, ordering changes before finality, then week
  ascending and personId. One per actual fact; existing case/outcome attention
  retains its own law. Text names actual profession/week without raw input evidence.

Profile career history remains available after news retention expires. Finance
receives no profession-change ledger or invented cost.
Register outgoing52 schema identity and generate53 through the existing generator;
handwritten Unity/native work stays deferred. Current/saved runtime slots remain
distinct and prior incompatible journal authority resets by the accepted contract.

## Remaining bounded release checks

Reviewer supplies exact current-only validation delegation/anchor propagation map.
Parent reconciles that inventory here, obtains independent final API review, and
publishes the contract. T0 parity failure945/948 remains separately under diagnosis.
No C.3 writer release until genuine outgoing evidence and independent behavior RED.
