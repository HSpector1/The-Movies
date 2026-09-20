# 125 — first actual-owner trace producer tranche

2026-09-20. INERT bounded design, not source authorization, implemented coverage
or B4 acceptance. Read the published generic clock,91/94,113,118/121, next-owner
notes and the relevant actual owners. Only this document is written; no source,
test, runtime/probe, Git/network or descendant activity.

## First deliverable, not a future-picture enumerator

Implement execution/certificate extraction for an explicitly supplied lawful
command plan over ALL already-started productions of one issuer, together with
every relevant current background owner. One branch contains the entire slate,
not one solo simulation per beneficiary. Use the actual shared allocator/sweep;
do not import actions, tick, queueAdmission or hollywoodTick into the producer.
Return one certified whole trace or a clearly incomplete prefix. Collecting such
branches into a domain and proving global completeness is separate from replay.

No new films, salary promises, employment winners, screenplay assessment, forecasts,
results, first-take receipts or durable IDs are minted. Existing production IDs,
cast/director and linked screenplay identities come directly from the source.
InProduction screenplay and production have ONE physical path. Already-filmed
paths remain useful continuations but cannot supply another future first take.

Proposed internal module `promiseCapacityOwnerReplay.ts`, with a small explicit
entry (names are proposed for subsequent review, not an installed API):

```ts
type StartedPicture = ProductionClockView & Readonly<Pick<Production,
  'conceptId' | 'writerId' | 'cast' | 'craftIds'>>
type ExistingProductionCommand = Readonly<{
  week: number
  ordinal: number
  kind: 'assignLockedDirector' | 'clearGrandfatheredScenery'
    | 'scheduleTake' | 'commitRelease'
  productionId: string
}>
type StartedOwnerFrame = Readonly<{
  studioId: string
  week: number
  caller: 'player' | 'rival'
  productions: readonly StartedPicture[]
  operations: StudioOperations
  sets: readonly StudioSet[]
  releaseAuthority: StudioReleaseAuthority
  // Actual narrow roots; no synthetic GameState or Production cast.
  facts: ExistingOwnerFacts
}>
type StartedReplayInput = Readonly<{
  frame: StartedOwnerFrame
  commands: readonly ExistingProductionCommand[]
  horizonEndWeek: number // effective H supplied under94, not raw target horizon
  sourceFactRefs: readonly string[]
}>
type StartedReplayResult =
  | Readonly<{ kind: 'certifiedTrace'; trace: JointOwnerTrace
      finalFrame: StartedOwnerFrame; workUsed: number
      omissions: readonly string[] }>
  | Readonly<{ kind: 'incompletePrefix'; through: Boundary
      workUsed: number; omissions: readonly string[] }>
function replayStartedProductionPlan(
  input: StartedReplayInput, budget: OwnerPreparationBudget,
): StartedReplayResult
```

`ExistingOwnerFacts` is a named product of the genuine views below plus actual
concepts, existing first-take identity set and background occupancy facts. It is
NOT a free-form caller callback capable of declaring arbitrary calendars lawful.
`OwnerPreparationBudget` is shared across every attempted branch and discarded
prefix; it cannot reset per issuer/trace/week. The producer returns work consumed,
not a promise classification.91's kernel receives total preparationWork once.

## Minimum genuine owner seams needed

| Seam | Smallest implementation/type work; existing law stays put |
| --- | --- |
| Production clocks | Already published: pass StartedPicture records through `advanceManagedProductions`1567, preserving their entire type. Use all current clocks, current workflows and actual director IDs. No forecast/participants placeholders. |
| Technology policy | `createProductionTechnologyPolicy`54 and private operationalAdoption17 need technology, market.tick, hollywood.playerStudioId and placement.facilities. Introduce a genuine named fact-Pick with just those fields; preserve factory/selection/lock/adoption bodies and defaults. Narrow `hasOperationalFacilityInstallation`62 to its actual placement read. Existing full GameState callers remain structurally compatible. No cached initial-week closure. |
| Setup route | `createProductionSetupRouteResolver`164/deriveSetupProvenance138/lightingAdoption need technology, playerStudioId and exact placement installation facts. `adoptionChainOperational`281 needs playerStudioId/placement, not a complete simulation. Narrow these read signatures without changing access/acquired/operational/held-equipment/cancelled checks. Existing required setup records and prior work remain untouched. |
| Scenery | `facilityBodyCentre`100, sceneryLoadInFor183 and sceneryLoadInDecision275 need property plus placement; propertyOf already accepts a narrow view. Preserve actual geometry, exact grandfather flag, withholding reasons and due-at-call settlement. No geometry or arrival date invention. |
| Release | Narrow ReleaseOwner49 productions to id/conceptId/remainingTicks and concepts to id/title. Keep releaseCommitmentRefusal64 body unchanged, plus existing operations/authority. Use withReleaseCommitment only in the detached branch after the real refusal returns null. No already-ready shortcut; no persistent commitment/event written to the campaign. |
| Rival stage command owner | Extract the actual operateStage74 body into a lower pure owner with narrow productions/operations and returned operations; both hollywoodTick and replay use it. Preserve assign→abstract clear→schedule and production order. Keep sound-selection/rival-installation reads in their actual position; narrow their business views if needed, do not copy their policy into replay. |
| Current background dates | Existing writing/casting due dates, complete pooled writer IDs and exact reservations are facts. Their pre-sweep completion predicates may be shared as tiny pure predicates from completeDueScriptWork447/completeDueCastingSessions408 if replay needs them. Do not manufacture Review/assessment/acknowledgement roots merely to drop occupancy. Date projection is not screenplay acceptance. |

No fake GameState is needed to satisfy a read factory. In particular the technology
collector gets the branch's real current week/technology/installation facts, while
the allocator receives genuine narrow clocks. Full current Productions happen to
exist in this first tranche; using that accident to conceal the factory's broad
type would leave later Ready-clock branches unsound.

## Actual owner sequence and supported cuts

Player command boundary: apply the explicit ordered plan using existing
assignShootingDirector680, sceneryLoadInDecision and clear/arrival owners,
scheduleShootingTake783, and releaseCommitmentRefusal. A manual clear is permitted
only for the classifier's actual grandfathered case. A director call performs
the same due-at-call arrival check as the action; a derived in-transit or withheld
trip is not manually cleared. No command means no scheduling.

For advance w→w+1, preserve tick251–372: already-due writing/casting occupancy
releases before allocation; actual scenery arrival is checked at w+1 and makes
READY only; compute external slots from installation + current script + casting
+ Set work using post-load-in operations; build fresh technology/setup collectors;
call the ONE managed sweep at currentTick=w with all clocks and committed IDs.
Carry its returned operations, clocks, Sets and technology into this branch only.
First-take candidates are exactly its5→4 return, never6→5 or forecast durations.

Queue admission and physical-plan admission occur AFTER the sweep; construction,
placement and Set completion also contribute no capacity retroactively. For the
first tranche, a nonempty queue or unmodeled mandatory admission/completion is a
named cut: either execute an already-shared genuine lower owner at its exact place,
or stop the prefix before that state can affect later replay. Do not freeze a
known changing background, silently omit it, or reinterpret a queue as a hold.
Current writing/casting reservations may be projected to their persisted due
boundaries without generating assessment/Ready facts; future use of those packages
is outside this tranche. Unknown research/funding/installation changes require an
explicit cut or independently proved irrelevance to this trace, not guessed release.

Rival order is DIFFERENT: hollywoodTick251 runs actual operateStage and legal
automatic commitments before its sweep, then selected sound policy; writing
completes/accepts later at316. Do not release rival writing slots in the player
pre-sweep position. Its current call passes no Set binding/setup resolver and
uses abstract scenery; preserve those exact caller choices. Prior hiring,
physical/research policy and decide() can change context. Replay may cross only
a boundary at which those mandatory effects are included or actually proved
irrelevant; otherwise stop. In particular `week < nextDecisionWeek` proves only
decide's early return, not that sound purchase/research/physical policy is absent.
This tranche must not quietly turn rivals into player-directed no-op studios.

Initial useful cases are small real-action player states from113 with no changing
unmodeled background, plus its real active-writing due state; single-step rival
equivalence is a separately qualified route. Long rival policy replay and future
commission choices are not claimed implemented by a stage-owner extraction.

## Certificate extraction, chronology and full ledger

Create a fresh enabled StudioEventSink for each detached owner sweep and inspect
drain() only after the call. It is ephemeral and never committed to studioEvents.
Its ordered reservationReleased/reservationGranted rows carry exact facility:slot
addresses; releases precede grants and retained slots emit nothing (operations550).
Reconcile every transition against initial/final reservations. Endpoints alone
cannot certify a slot released and regranted to another picture within the sweep.

Use one explicit logical boundary convention throughout: visible week w begins
at(w,0); planned commands and then the w→w+1 owner call occupy increasing steps
of w; qualifying takes are(w+1,0), exactly the arrived-week append convention in
tick1102. Next week's commands occur after that boundary. Preserve each sink row's
raw authoritative week in provenance; do not restamp setup's arrived-week facts
to pretend they are durable pre-week events. Steps express invocation order, not
invented fractional-week gameplay or an additional event receipt. Simultaneous
arrived first takes retain the same boundary, avoiding an arbitrary ID-based
earliest-profile advantage. Release is a separate owner boundary: record the
actual lawful1→0 admission and subsequent release boundary in the caller's
pre-increment w sequence, not at the first-take append stamp. Existing release
receipts use their own owner week; neither the producer nor a generic arrival
rule may restamp them. Reuse for another new picture still requires a later
lawful command/admission boundary, not an invented mid-sweep greenlight.

Person holds: actual director/cast/craft stay occupied through lawful1→0 release
admission, even after stage wrap/Post blockage/Release Ready. Credited writer is
not a production seat; all active pooled writing remains a separate background
path. Unknown release stays null and retains exact path-owned occupancy to H under94;
never make H a certified release. Existing historical first-take IDs forbid a
second event for an already-filmed continuation. No appendFirstTakes call occurs.

Set holds require special care: operations1265–1277 intentionally retains setId,
lockedNovelty and lockedUplift after releasing the stage. Nonnull historical setId
does NOT reserve that Set. Open a Set's physical hold only from an actual bound
stage/resource acquisition; close it using the actual wrapped event's stage/Set
and ensuing release sequence (1338+). Preserve retained-stage holds and returned
wear exactly once. The actual settled-per-sweep rule prevents a newly binding
picture from also wrapping in that sweep, permitting acquisition to join its
returned binding without guessing an intermediate second Set. Cross-picture
release/reacquisition still follows the sink order. No ghost resource encodes
scenario exclusivity; genuine Sets are physical resources, trace keys are logical.

Each certified trace includes every current picture plus every relevant non-picture
background path, even if none earns credits. Unknown/out-of-window/already-filmed
events become null or background as91 permits, never disappear. Full fixed prefix,
same-owner certified suffix releases and all other owners' holds survive. The
kernel separately validates the complete ledger; that is not a substitute for
this producer's actual owner execution and provenance.

## Before-call cost and proof obligations

Implement a source-audited `reserveOwnerCall(kind, footprint)` that computes and
debits an upper bound BEFORE invoking each real owner. No caller-supplied guessed
charge and no one-unit-after-call accounting. Its footprint includes N clocks,
workflow/reservation counts, facilities, physical slot iteration, Sets, background
claims, geometry cells, technology/access/adoption/equipment/placement rows and
callback scan dimensions. Charge input collection/canonicalization and each
abandoned branch too; saturate arithmetic before any large multiplication.

The existing sweep gives a useful concrete bound: at most2N progress/restart
rounds, scanning at most N pictures each, plus one final nonprogress scan. Each
visit's workflow lookups, reservation release, allocator scans/sorts, stage+Set
search and actual callbacks must appear in the per-visit bound. Sort allowance
must cover the actual owner sort implementation, not assume kernel merge-sort
cost. Do not count only four clock fields and ignore callback input sizes.
`rivalInstallationSlots`86 explicitly expands every affected facility capacity
with Array.from; reserve its summed slot count BEFORE calling it, even if a later
allocator would have found a free slot early. Safe-integer facility counts must
not cause an uncharged huge expansion.

The numerical constants for these bounded owner blocks require source accounting
and independent review during implementation; this document does not claim a
verified operation bound from an arbitrary multiplier. Missing bound or insufficient
budget returns an incomplete prefix BEFORE the owner call. This is an engineering
obligation, not permission to complete the tranche with every ordinary case
uncertified. Tests must show useful one/two-picture traces within unchanged200000
work and observe zero unreserved calls at tiny budgets. No timeout increase.

## Composition and first independent proof cases

The replay entry accepts a current branch frame, not a promised-person winner.
Later Ready/staffing enumeration validates proposed people through118/121, creates
an ephemeral narrow clock through the actual shared admission/allocation owner,
and feeds the resulting ENTIRE slate into this same replay. Keep121's three
diagnostic orders and fresh craft array at the real action boundary. Never splice
the new path's solo dates into existing calendars. Changed commands/staffing imply
a different whole trace; they share physical path identity, not event capacity.

Global existingCalendars/allOwnerTraces remain incomplete whenever unenumerated
choices—including future work—can change an existing calendar. Executing one plan
cannot assert those flags complete. claimsAndHolds can be complete only when the
full context is certified. A useful partial domain may still support91's lawful
positive with proved prior optimum (including the zero-prior exception); failed
searches cannot become impossibility or maximum claims.

Independent first cases from113: full/narrow actual two-picture equivalence;
controlled A/W/B priority kept separate from genuine admission; actual player
arrival without scheduling versus next-command scheduled take; arrived-week
first-take joins; wrap/Post blockage retaining person but releasing stage/Set;
completed Set history not occupancy; real writing-pool due release with permanent
writer credit; branch-local silent/selected-chain/setup/Set evolution; tiny-budget
pre-call refusal; all-input purity and canonical plan order. Technology/layout
controlled fixtures retain their labels and do not become genuine campaign proofs.
No natural-offer, future-domain completeness, owner acceptance or full B4 closeout
is claimed by this execution tranche.

DOCUMENT FROZEN for review and an independent next implementation contract.
