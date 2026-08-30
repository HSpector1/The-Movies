# PROJECT: STUDIO — PACKAGE 14 BUILDER ANNEX

# Talent Market, Relationships & Career Lifecycle

Status: **DECISION-READY RESEARCH CANDIDATE**<br>
Mode: **DOCUMENTATION ONLY**<br>
Authorization: **NO PRODUCTION AUTHORIZATION**<br>
Companion report: `docs/design/CODEX-TALENT-MARKET-RELATIONSHIPS-CAREER-LIFECYCLE-PACKAGE-14.md`<br>
Research branch: `codex/p13-p15-long-range-research-01`<br>
Accepted TypeScript audit point: `campaign/living-lot-ts` at `7811377cea1c1b9ddca2c17c626879504b23ed4e`<br>
Accepted Unity audit point, read-only: `campaign/living-lot-client` at `29aea89a706a7f0961f5a460afc5bdb4d38d8395`

This annex is implementation guidance for future reconnaissance. Its names and shapes are conceptual contracts, not production code or schema authorization. The mandatory final changed-path refresh in the companion report applies to every path below.

## A. Canonical terminology

| Term | Canonical meaning | Must not mean |
|---|---|---|
| `PersonId` | Immutable identity of one authoritative professional across every employer, contract, credit, relationship, retirement state, and view. | A roster row, body instance, name, current employer key, or save-array index. |
| Person | P10-owned persistent professional identity. | A P14-specific market card or decorative pedestrian. |
| Star Power | P10-owned commercial recognition/drawing-power fact. | Profession, craft OVR, relationship, trust, market rank, or legacy. |
| Employer | Exactly one current `StudioId` attached through an active employer interval, or none. | The studio whose UI is currently open. |
| Employer interval | Dated, immutable record that a person was employed by a studio from effective start through optional end. | Mutable “current team” text or a duplicate person. |
| Contract | P10-owned binding employment terms/obligation record referenced by P14 settlement. | A proposal, promise, relationship, or employer identity. |
| Talent market case | Bounded decision context for one person's eligible renewal/free-agency episode. | A permanent profile or market-wide person copy. |
| Proposal / offer | Versioned structured terms from one studio to one person in one case, with deadline and status. | A conversation line, rumor, inferred desire, or immediate employment. |
| Negotiation | State machine that creates/revises/withdraws proposals and records knowledge/refusal. | An unbounded dialogue minigame. |
| Offer version | Monotonic version of all material proposal terms. | UI revision number or timestamp alone. |
| Settlement | Atomic validation and outcome that produces at most one active employer/contract result. | Clicking an offer card or a Unity animation. |
| Intermediary | Authoritative route that can disclose expectations, carry a proposal, consume time/cost, and return typed reasons. | A magical recruiter, guaranteed outcome, or decorative agent NPC. |
| Interest | Public tier/range and typed drivers known at the current knowledge level. | Exact hidden willingness/weight or a promise of acceptance. |
| Competing offer | A real authoritative proposal by another studio, with knowledge provenance. | Flavor text fabricated for tension. |
| Promise | Typed, versioned professional commitment with predicate, deadline, progress, and outcome. | Free text, generic mood modifier, or invisible expectation. |
| Trust | Public professional summary derived from material commitment/conduct evidence. | A daily need bar or universal relationship score. |
| Relationship edge | Sparse canonical pair record connecting two distinct `PersonId`s after qualifying evidence. | All-pairs matrix, Unity proximity, or one unexplained scalar. |
| Driver event | Typed, dated evidence that can affect a relationship/trust summary. | Client-authored prose or hidden bonus. |
| Collaboration | Shared authoritative work with exact production/film/role references. | Co-presence or an animation. |
| Mentorship | Derived professional classification supported by senior/junior shared-work and development evidence. | A manually purchased buff. |
| Professional rivalry | Derived, evidence-backed career competition/strain classification. | Personal hatred, sabotage, or generic negative score. |
| Birth provenance | Truth/estimate metadata from which current age is derived. | A fabricated exact birthday for an old save. |
| Life phase | Authored public career-stage descriptor derived from calendar/provenance/rules. | Exact hidden potential or universal biological judgment. |
| Retirement eligible | Person may transition under approved law. | Already retired or automatically unavailable. |
| Retired alumni | No longer eligible for active professional assignment under retirement law; same identity/history retained. | Deleted person or new alumni record. |
| Career event | Durable dated fact linked by stable IDs and source/version. | Recomputed prose or an overwrite of film truth. |
| Current summary | Bounded hot projection sufficient for a current decision. | Complete history embedded every frame. |
| History page | Stable cursor-bounded chronological records plus provenance. | Offset into an unstable full array. |

### A.1 Evidence labels used in this annex

`SOURCE VERIFIED`, `PROJECT AUTHORITY VERIFIED`, `CURRENT CODE VERIFIED`, `COMPARATOR OBSERVED`, `OPEN-SOURCE PATTERN`, `INFERENCE`, `PRELIMINARY RECOMMENDATION`, `OWNER DECISION REQUIRED`, `OPEN QUESTION`, and `REFUTED` have exactly the definitions in the companion report.

## B. Package slices and dependency gates

| Slice | Proves | Hard prerequisites | Explicitly excluded |
|---|---|---|---|
| P14A.1 — Contested Expiry Core | Real player/rival proposals, informational intermediary preview, P10 term versioning, one atomic deadline decision through P10/P11/P12, persistence/replay. | P10 stable person/contract/profile; P11 quote/obligation; P12 stable studios/employer/exclusivity/interval/rival action; authoritative calendar week. | Browser/Unity world surface, in-term break, compensation, promises, relationships, aging, retirement, cohorts, ranking. |
| P14A.2 — Bounded Read Side | Current comparison, typed reasons/unknowns, append-stable paged history and stale-revision behavior; no new outcome law. | Sealed P14A.1. | World/client route and all later P14 systems. |
| P14A.3 — World/Client Route | Exact world entry, retained workspace, closed proposal intents, input/accessibility/Back/Locate proof. | Sealed P14A.2 and accepted bridge/client paths. | Client settlement, relationships, lifecycle, and later package scope. |
| P14B — Professional Bonds | Typed promises/trust; sparse work-derived relationships; collaboration, mentorship, professional rivalry evidence. | P14A identity/events; P10 film/assignment truth; bounded event/history index. | Social spam, romance/family, needs, mental-health/addiction, all-pairs graph. |
| P14C — Career Lifecycle | Birth-derived age/life phase, retirement/alumni, renewable cohorts, succession planning, durable archive. | core scheduler absolute week/phase; P13 era/timeline context; P10 person/profile plus assignment/contract retirement receipt; P11 obligation-or-explicit-none receipt; P12 roster/current-employer/exclusivity/interval transition receipt; P14A market decision events; P14B optional evidence. | Mortality, estates, health/injury, likeness, guilds/pensions, acquisition. |
| P14D — Advanced Labor & Contract Mobility (P16+ parking only) | No implementation authorization: possible future in-term approach, negotiated release, buyout/compensation, contract break, tampering. | Accepted P14A–C plus P10 contract, P11 obligation/compensation, P12 employer/exclusivity/interval, legal/disclosure law, new Owner charter. | Cannot enter P14B/C; no one-click poaching or silent contract mutation. |

No slice begins from an imagined future path. The first task of a future charter is the changed-path refresh and ownership proof.

## C. State-transition tables

### C.1 Market case

| From | Command/event | Guards | To | Durable facts | Refusal if guard fails |
|---|---|---|---|---|---|
| absent | eligibility opens | person exists; not retired; P10 contract/window; no open case for episode | `discovered` | case-open event, eligibility basis | Duplicate/open episode. |
| `discovered` | contact intermediary | authorized route; quote current; no active engagement | `intermediary_contacted` | engagement ID, fee/time/knowledge scope | Route unavailable or quote stale. |
| `intermediary_contacted` | response due | effective week reached | `accepting_proposals` | response, interest/refusal reasons | Not yet due. |
| `discovered` or `accepting_proposals` | studio creates/projects first draft | studio/person eligible; deadline valid; current P10 draft and P11 consequence can be projected | `proposals_open` | draft proposal V1; no submission event yet | Typed reason; no partial write. |
| `proposals_open` | other studio creates, reviews, and submits under its authoritative strategy | same shared guards and review-before-submit law | `proposals_open` | competitor submitted proposal and knowledge event as disclosure allows | Same shared refusal. |
| `proposals_open` | material proposal term changes | issuer owns proposal; version/state current; before deadline | `proposals_open` | incremented offer version and current P10 draft/version/digest; prior review token and submission invalidated; state returns to `draft` | Stale/closed/expired. |
| `proposals_open` | deadline phase begins | authoritative week/phase | `decision_pending` | frozen eligible proposal set/version refs | No open valid proposal. |
| `decision_pending` | expiry-phase decision resolves | freeze and revalidate proposal set; deterministic chooser/rules version fixed; P10/P11/P12 authorities available | `settled` or `declined` in one transaction | chooser receipt; P10 contract ref; P12 employer-transition ref; P11 obligation ref; linked career event | Invalidate failed proposals and re-evaluate remaining set in the same transaction; if none remain, decline/free agency; invariant failure rolls back all writes. |
| any open | deadline passes with no valid decision | exact due phase | `expired` | expiration event | Already terminal. |
| any open | authorized proposal withdrawal | issuer/current version/before lock | case remains open, or `declined` at deadline if no valid proposal remains | proposal withdrawal event | Stale/locked/not issuer. |
| any nonterminal | upstream state invalidates eligibility | typed cause | `invalidated` | cause/source reference | None; scheduled authoritative event. |

Terminal case states are `settled`, `declined`, `expired`, and `invalidated`. An individual proposal may be `withdrawn`, `superseded`, `not_selected`, `expired`, `invalidated`, or `selected` by the atomic terminal transaction. No proposal is “accepted” before P10/P11/P12 settlement succeeds.

The exhaustive nonterminal proposal lifecycle is `draft → reviewed → submitted`. `reviewed` is valid
only for one binding digest of `OfferId + offerVersion + P10 draft/version/digest + state revision`.
Every material P10 or P14 term change increments `offerVersion`, invalidates that binding and any prior
submission, and returns the proposal to `draft`; no in-place submitted-term mutation is legal.

### C.2 Proposal review/submission versioning

| Event | `offerVersion` / P10 authority | Proposal state and review token | Rule |
|---|---|---|---|
| Create/project draft | 1 + exact P10 draft/version/digest | `draft`; no token | Exact current material terms and P11 consequence are projected before submission. |
| Review V1 | unchanged | `reviewed`; token binds `OfferId + offerVersion + P10 draft/version/digest + state revision` | Review never accepts, settles, or chooses a winner. |
| Submit V1 | unchanged | token is consumed; `submitted` | The initial submission is legal only after review and records one idempotent submission event. |
| Revise any material P10 or P14 term | increment by one + current P10 draft/version/digest | return to `draft`; old token and prior submission invalid | Every material term change requires a fresh projection, review, and submission. A terminal selected proposal cannot be revised. |
| Knowledge-only field becomes known | unchanged if no material term changed | UI marks new information; policy may require fresh review without changing version | Knowledge provenance is not silently rewritten into terms. |
| Deadline/eligibility changes by authoritative rule | increment version or invalidate, never silently mutate | old token invalid; `draft` or terminal `invalidated` | Effective consequence must be explicit. |
| Deadline freeze | fixed `submitted` versions only | client review tokens have no settlement power | TypeScript consumes one case-decision idempotency key and records selected/not-selected states atomically. |

### C.3 Active employer and interval state

| P12 authoritative current state | Legal transition | Atomic result |
|---|---|---|
| no active employer, eligible free agent | P14 chooser selects a valid submitted P10 draft | P10 activates one contract and P12 opens one employer interval in the same transaction. |
| active employer, contract naturally expires | expiry-phase P14 chooser selects or declines | P12 closes the interval at the exact boundary; selected offer opens/continues one interval, otherwise the person becomes free. |
| active employer, eligible renewal | incumbent proposal selected at expiry | P10 renews under its law and P12 continues or closes/opens its one interval; never overlap. |
| active employer, in-term approach | none in P14A | refuse: outside permitted market window. |
| retired | none | refuse: not eligible for active employment. Alumni advisory work would require a distinct future law. |

P14A has no reserved future employer transition. Future-dated acceptance is a later Owner decision.

Invariant: at any effective week, the half-open interval `[startWeek, endWeekExclusive)` model contains at most one interval for a `PersonId`. Boundary handoff at the same week is non-overlapping.

### C.4 Promise/trust (P14B)

| From | Event | To | Evidence / effect |
|---|---|---|---|
| proposed | included in accepted authorized terms | active | exact promise type/version, issuer, beneficiary, predicate, due week. |
| active | relevant authoritative event | active | bounded progress summary and event refs; no polling/guessing. |
| active | predicate satisfied by deadline | satisfied | durable outcome; trust driver once. |
| active | deadline reached unsatisfied | broken | durable outcome and typed causal evidence. |
| active | both parties approve waiver under future law | waived | signed waiver references; not treated as secretly kept. |
| active | external impossibility rule fires | `impossible_external` | cause/version; Owner law decides trust effect. |
| any terminal | any further evaluation | unchanged | idempotent; duplicate outcome rejected. |

Trust summary is a reducer over material evidence, not an editable number. Its exact labels/rules require P14B approval.

### C.5 Sparse professional relationship edge (P14B)

| From | Input | To | Storage |
|---|---|---|---|
| absent | nonqualifying co-presence | absent | none. |
| absent | qualifying shared-work/evidence event | observed | canonical pair ID, first/last week, typed aggregate, evidence ref. |
| observed | authored evidence threshold | established | bounded driver summary and collaboration counts. |
| established | material repeated pattern | notable | derived classification with version/reasons. |
| any active | no material event over dormancy horizon | dormant | hot index removed; compact summary/history retained. |
| dormant | new qualifying event | established/notable after recompute from compact summary + event | hot index restored; identity unchanged. |

No edge updates because two presentation bodies happen to stand near one another.

### C.6 Lifecycle (P14C)

| From | Event/guard | To | Durable effect |
|---|---|---|---|
| scheduled cohort candidate | deterministic cohort boundary | registration-pending | P14 issues one idempotent cohort request; no person or market row exists yet. |
| registration-pending | P10 validates and returns a person-registration receipt | emerging/free agent | P10-minted `PersonId`, exact registration receipt, P14 cohort provenance, and market eligibility commit together. |
| registration-pending | P10 validation/mint fails | scheduled or refused | typed refusal; no P14 lifecycle/market row, partial person, or consumed identity. |
| active phase | calendar crosses authored phase boundary | next phase | one phase event; age remains derived. |
| active phase | retirement window opens | retirement eligible | visible planning fact; not a forced outcome. |
| eligible | approved decision law resolves | announced or remains active | persisted decision receipt and public reasons. |
| announced | effective week reached but P10 assignment/contract, P11 obligation, or P12 roster/employer/exclusivity/interval guard remains | announced/deferred | one typed deferral receipt and next governed check; person remains active under existing truth, with no partial retirement or contract break. |
| announced | effective week reached; P10/P11/P12 all report clear/settled under the approved P14C law | retired alumni | one off-state candidate commits P14 retirement/alumni/eligibility event, P10 person/assignment/contract receipt, explicit P11 zero-or-settlement receipt, and P12 roster/employer/exclusivity/interval transition receipt once or none. |
| announced | any participant preflight/validation fails | announced/refused or deferred | typed reason; authoritative state unchanged and retry/reschedule follows the approved policy. |
| retired alumni | presentation/archive compaction | archived alumni | only hot/cold storage placement changes. |

### C.7 P15 operating-state participant disposition — future P15B only

| P12 transition request | P14 preflight | P14 receipt | Forbidden result |
|---|---|---|---|
| entrant activation | initialize no person or studio; validate any P10-created starter people and prepare only P14-owned empty/bounded participant indexes | idempotent `p14_participant_ready` receipt naming the P12 request, P10 registration receipts, P14 revision, request/rules digests, and recording boundary | P14 minting `PersonId`, claiming to initialize the entrant, inventing pre-entry offers, or activating before the whole participant manifest commits |
| active to dormant/closed | deterministically invalidate, expire, or preserve each open case/proposal/commitment under an Owner-approved typed rule | one root manifest bound to request/rules versions and affected-set count/digest, plus immutable chunks of at most 100 typed subject/disposition/reason rows | silently dropping an open offer, promise, market case, or chooser obligation; embedding an unbounded receipt array |
| dormant to active | validate preserved/terminal facts and open a new recording episode only when legally due | idempotent re-entry receipt | resurrecting expired proposals or fabricating dormant-period activity |

P14 never changes P12 operating state. It prepares one immutable participant receipt for P15/P12's
all-owner candidate; failure leaves every P14 row and the P12 registry unchanged.

## D. Interface-level entity sketches

These sketches state required meaning. They are intentionally not drop-in TypeScript.

```ts
type PersonId = Opaque<string, 'PersonId'>
type StudioId = Opaque<string, 'StudioId'>
type MarketCaseId = Opaque<string, 'MarketCaseId'>
type OfferId = Opaque<string, 'OfferId'>
type P10ContractDraftId = Opaque<string, 'P10ContractDraftId'> // foreign authority
type P10ContractId = Opaque<string, 'P10ContractId'>           // foreign authority
type P12EmployerTransitionId = Opaque<string, 'P12EmployerTransitionId'> // foreign authority
type P10CareerEventId = Opaque<string, 'P10CareerEventId'>     // foreign authority
type P10PersonRegistrationReceiptId = Opaque<string, 'P10PersonRegistrationReceiptId'> // foreign authority
type RetirementEventId = Opaque<string, 'RetirementEventId'> // P14 lifecycle authority
type CohortRequestId = Opaque<string, 'CohortRequestId'>
type CohortReceiptId = Opaque<string, 'CohortReceiptId'>

interface TalentMarketRootV1 {
  casesById: IdMap<MarketCaseId, TalentMarketCase>
  openCaseByPerson: IdMap<PersonId, MarketCaseId>
  proposalsById: IdMap<OfferId, OfferProposal>
  dueIndex: WeekBuckets<MarketCaseId | OfferId | IntermediaryEngagementId>
  nextP14DomainSequence: integer
  rulesVersion: string
}

interface TalentMarketCase {
  id: MarketCaseId
  personId: PersonId
  episodeId: string
  eligibility: { kind: 'renewal_window' | 'expiring' | 'free_agent'; sourceRef: string }
  state: MarketCaseState
  openedWeek: integer
  decisionWeek: integer
  caseAdmissionOrdinal: positiveInteger // scheduler-issued within decisionWeek; visible and stable
  proposalIds: readonly OfferId[]
  selectedOfferId?: OfferId
  decisionReceipt?: TalentMarketDecisionReceipt
}

interface OfferProposal {
  id: OfferId
  caseId: MarketCaseId
  personId: PersonId
  issuerStudioId: StudioId
  offerVersion: positiveInteger
  p10ContractDraftId: P10ContractDraftId
  p10TermsVersion: positiveInteger
  p10TermsDigest: string
  opportunity: PublicOpportunityCode
  intermediaryFeeQuoteRef?: string
  effectiveWeek: integer
  expiresWeek: integer
  routeRef?: IntermediaryEngagementId
  portfolioPriority?: positiveInteger // unique 1..32 per issuer/decision phase after multi-case approval
  p11ObligationHoldRef?: string       // required only by the approved multi-case expansion
  p12CapacityAdmissionRef?: string    // capacity evidence, never a future employer transition
  state: OfferState
  reviewBindingDigest?: string
  createdP14DomainSequence: integer
}

interface TalentMarketDecisionReceipt {
  id: string
  caseId: MarketCaseId
  decisionWeek: integer
  phaseId: string                 // scheduler-owned
  phaseOrdinal: integer           // immutable append-time value
  phaseOrderVersion: string
  rulesVersion: string
  selectedOfferId?: OfferId
  selectedOfferVersion?: positiveInteger
  selectedP10TermsVersion?: positiveInteger
  selectedP10TermsDigest?: string
  selectedP10ContractId?: P10ContractId
  p12EmployerTransitionId?: P12EmployerTransitionId
  p10CareerEventId?: P10CareerEventId
  p11ObligationReceiptRefs: readonly string[]
  invalidatedOfferReasons: readonly TypedReason[]
}
```

The P10 draft reference/digest is the material-term authority; P14 does not copy salary, term, guarantee, activation, or renewal fields. In P14A, `effectiveWeek === case.decisionWeek` by invariant and no promise enters the proposal. The receipt links one atomic result across the P10 contract, P11 obligation, and P12 employer authorities. Missing selected references are legal only for a recorded decline/free-agent outcome.

P14A.1 has exactly one case and does not require the optional portfolio fields. Before any multi-case
expansion, one studio may have at most 32 submitted offers settling in one decision phase; their
`portfolioPriority` values are complete and unique. Proposal 33 is refused with a typed capacity
reason. Priority/hold changes create a new offer version and invalidate old review. Due cases settle
by `(decisionWeek, caseAdmissionOrdinal)`, never by opaque `PersonId`; P11/P12 owns the referenced
obligation/capacity facts, and the capacity admission is not a future-employer reservation.

There is deliberately no P14 `EmploymentHistoryRoot`, current-employer index, future-transition reservation, or `EmployerInterval` sketch. Those remain P12A authority and are read through stable P12 references/pages.

```ts

interface ProfessionalCommitmentsRootV1 {
  activePromiseIdsByPerson: IdMap<PersonId, readonly PromiseId[]>
  promisePageIndexByPerson: IdMap<PersonId, PageIndexRef>
  trustSummaryByPair: IdMap<PersonStudioPairId, PublicTrustSummary>
}

interface ProfessionalRelationshipsRootV1 {
  activeEdgesByPair: IdMap<CanonicalPersonPairId, RelationshipEdge>
  notableEdgeIdsByPerson: IdMap<PersonId, readonly CanonicalPersonPairId[]>
  coldSummaryIndex: IdMap<CanonicalPersonPairId, ColdSegmentRef>
}
```

P14 validates every referenced P12 employer transition and P10 contract during load diagnostics; it never silently repairs or mirrors conflicting upstream data.

```ts
interface RelationshipEdge {
  id: CanonicalPersonPairId
  personLowId: PersonId
  personHighId: PersonId
  firstEvidenceWeek: integer
  lastEvidenceWeek: integer
  collaborationSummary: BoundedCollaborationSummary
  publicClassifications: readonly PublicRelationshipClassification[]
  publicDriverReasons: readonly PublicDriverReason[] // bounded
  compactedHistoryRef?: ColdSegmentRef
  rulesVersion: string
}

interface CareerLifecycleRootV1 {
  lifeByPerson: IdMap<PersonId, CareerLifeRecord>
  transitionDueIndex: WeekBuckets<PersonId>
  activeCohortRequestById: IdMap<CohortRequestId, CohortRequest>
  cohortIdempotencyIndex: IdMap<string, CohortReceiptRef>
  cohortArchiveIndex: PageIndexRef // immutable request + terminal receipt segments; never one lifetime array
}

interface CohortSlotRequest {
  slotId: string
  professionCode: PublicProfessionCode
  authoredEntryBand: PublicEntryBand
}

interface CohortRequest {
  cohortRequestId: CohortRequestId
  requestIdempotencyKey: string
  requestBodyDigest: string
  scheduleId: string
  scheduleVersion: string
  worldgenVersion: string
  cohortRulesVersion: string
  dueWeek: integer
  requestedCount: positiveInteger // equals slots.length; hard maximum 32
  hardMaximum: 32
  slots: readonly CohortSlotRequest[] // immutable, complete, 1..32
}

interface CohortMemberRegistration {
  slotId: string
  personId: PersonId
  p10PersonRegistrationReceiptId: P10PersonRegistrationReceiptId
}

interface CommittedCohortReceipt {
  state: 'committed'
  cohortReceiptId: CohortReceiptId
  historyOrderKey: P14HistoryOrderKey
  cohortRequestId: CohortRequestId
  requestBodyDigest: string
  requestedCount: positiveInteger
  registrations: readonly CohortMemberRegistration[] // complete; equals requestedCount; max 32
  p10RegistrationSetDigest: string
}

interface RefusedCohortReceipt {
  state: 'refused'
  cohortReceiptId: CohortReceiptId
  historyOrderKey: P14HistoryOrderKey
  cohortRequestId: CohortRequestId
  requestBodyDigest: string
  requestedCount: positiveInteger
  refusalReason: TypedReason
  registrations: readonly [] // refusal proves no PersonId or P10 receipt was accepted
}

type CohortReceipt = CommittedCohortReceipt | RefusedCohortReceipt

interface CohortReceiptRef {
  cohortReceiptId: CohortReceiptId
  archiveSegmentId: string
  archiveOrdinal: positiveInteger
}

type P14DispositionSubject =
  | { kind: 'market_case'; id: MarketCaseId }
  | { kind: 'offer'; id: OfferId }
  | { kind: 'promise'; id: PromiseId }
  | { kind: 'intermediary_engagement'; id: IntermediaryEngagementId }
  | { kind: 'pending_decision'; id: string }

type P14OperatingDisposition = 'invalidated' | 'expired' | 'preserved' | 'settled_before_boundary'

interface P14DispositionRow {
  subject: P14DispositionSubject
  disposition: P14OperatingDisposition
  reason: TypedReason
}

interface P14DispositionChunk {
  chunkArchiveId: string
  chunkOrdinal: positiveInteger
  rowCount: integer // 1..100
  rows: readonly P14DispositionRow[] // complete for this immutable chunk; hard maximum 100
  previousChunkDigest?: string
  chunkDigest: string
}

interface P14CorporateTransitionDispositionManifest {
  receiptId: string
  receiptVersion: positiveInteger
  supersedesReceiptId?: string
  historyOrderKey: P14HistoryOrderKey
  p12TransitionRequestId: string
  p12TransitionRequestVersion: string
  requestDigest: string
  studioId: StudioId
  priorOperatingState: 'active' | 'dormant' | 'closed' | 'not_registered'
  requestedOperatingState: 'active' | 'dormant' | 'closed'
  dispositionRulesVersion: string
  p14SourceRevision: string
  affectedSetCount: integer
  affectedSetRootDigest: string
  dispositionChunkArchiveId?: string // paged immutable chunks; never embedded without bound
  dispositionChunkCount: integer
  firstChunkDigest?: string
  finalChunkDigest?: string
  orderedChunkChainDigest: string
  recordingBoundaryWeek?: integer
  state:
    | { kind: 'participant_ready'; candidateDigest: string }
    | { kind: 'committed'; allOwnerTransactionReceiptId: string }
    | { kind: 'refused'; reason: TypedReason; p14WritesApplied: false }
}

interface P14HistoryOrderKey {
  effectiveWeek: integer
  phaseId: string
  phaseOrdinal: integer
  phaseOrderVersion: string
  p14DomainSequence: integer
  eventId: string
  phasePrecision: 'recorded' | 'not_recorded'
}

interface CareerLifeRecord {
  personId: PersonId
  birth: BirthProvenance
  publicLifePhase: LifePhaseCode
  retirement: RetirementState
  retirementEventId?: RetirementEventId
  alumniSinceWeek?: integer
  rulesVersion: string
}

interface RetirementSettlementReceipt {
  retirementSettlementReceiptId: string
  personId: PersonId
  announcedRetirementEventId: RetirementEventId
  effectiveOrAttemptWeek: integer
  settlementPolicyVersion: string
  historyOrderKey: P14HistoryOrderKey
  p10PersonAssignmentContractReceipt: string
  p11ObligationOrExplicitNoneReceipt: string
  p12RosterEmployerExclusivityIntervalTransitionReceipt: string
  result: 'committed_retirement' | 'deferred' | 'refused'
  reasons: readonly TypedReason[]
  nextCheckWeek?: integer
}
```

For a cohort request, `slots.length === requestedCount <= hardMaximum === 32`. A committed receipt has
exactly that many unique slot/person/P10-receipt triples; each P10 receipt resolves to the same
`PersonId`, slot request digest, worldgen version, and committed registration. A refused receipt has
zero registrations. Reusing an idempotency key with the same request digest returns the original
terminal receipt; reusing it with a different body refuses. Terminal request/receipt pairs move to
immutable, paged segments (default 25, hard maximum 100 rows), while the durable idempotency index
retains only the exact receipt reference.

A P14 operating-disposition result is also immutable. `participant_ready` and `refused` are off-state
preflight artifacts/diagnostics: they append no P14 root, row, event, chunk, or receipt. Only the
`committed` manifest/chunks persist atomically with the complete all-owner transaction and exact P12
registry receipt. `receiptVersion`/`supersedesReceiptId` is reserved for a later authorized correction
or migration of an already committed manifest, never candidate-to-commit mutation. `affectedSetCount`
and `affectedSetRootDigest` cover the canonical sorted subject/disposition/reason union;
`firstChunkDigest`, `finalChunkDigest`, and `orderedChunkChainDigest` bind the exact ordered chain.
Nonempty sets are stored as immutable chunks of at most 100 rows,
paged through `dispositionChunkArchiveId`; the manifest embeds no unbounded ID list. A committed
manifest proves every subject appears exactly once with a disposition separate from its reason. A
refused manifest applies no P14 write. An entrant-ready empty set uses the canonical empty-set digest
and zero chunks; it does not claim that P14 initialized the studio.

### D.1 Birth provenance sketch

```ts
type BirthProvenance =
  | { kind: 'authored_exact_week'; birthWeek: integer }
  | { kind: 'authored_year_only'; birthYear: integer; displayPrecision: 'year' }
  | { kind: 'legacy_age_anchor'; ageAtMigration: integer; migrationWeek: integer; displayPrecision: 'estimated_year' }
```

An estimate stays labeled. A migration must not convert “age 34 at Week X” into a fabricated day or exact week.

## E. Proposed projection/DTO shapes and no-hidden-data law

DTO examples define fields and trust boundaries; names must be refreshed against the actual bridge.

```ts
interface TalentMarketCaseSummaryDto {
  caseId: string
  person: PersonSummaryDto                // P10-authored public facts
  eligibilityLabel: string                // TypeScript-localized/code-backed
  state: PublicCaseState
  currentWeek: number
  decisionWeek: number
  intermediary?: IntermediaryPublicDto
  proposals: readonly OfferComparisonDto[] // bounded studio count for checkpoint
  proposalCount: number
  proposalsAppliedLimit: number             // P14A: 2; future hard maximum 16
  proposalsTruncated: boolean
  openProposalPageCapability?: CapabilityDto
  allowedIntents: readonly IntentDto[]
  sourceRevision: string
}

interface OfferComparisonDto {
  offerId: string
  offerVersion: number
  p10TermsVersion: number
  p10TermsDigest: string
  issuerStudio: StudioIdentitySummaryDto   // P12 reference
  knownTerms: readonly ContractTermRowDto[] // P10-authored complete fixed schema; hard max 24
  explicitlyUnknownTermCodes: readonly string[] // complete fixed schema; hard max 24
  interest: { tier: PublicInterestTier; reasons: readonly ReasonDto[]; reasonCount: number;
              reasonsTruncated: boolean; openReasonPageCapability?: CapabilityDto }
  status: PublicOfferState
  effectiveWeek: number
  expiresWeek: number
  consequence: FinanceConsequenceDto       // P11-authored
  reviewToken?: string
}

interface PlayerProposalIntentDto {
  intentId: string
  kind: 'submit' | 'revise' | 'withdraw'
  caseId: string
  offerId: string
  offerVersion: number
  p10ContractDraftId: string
  p10TermsVersion: number
  p10TermsDigest: string
  reviewToken: string
  expectedStateRevision: string
}
```

`allowedIntents` can expose only submit/revise/withdraw for the player's proposal. There is no accept, choose-winner, or settle intent. The DTO has no hidden actual skill, exact ceiling/potential, AI weights, unrevealed rival maximum, RNG state/seed, internal attraction score, or raw finance internals. Reasons are authoritative typed facts rendered by localization; Unity cannot create a causal sentence from numbers.

```ts
type HistorySubjectRefDto =
  | { kind: 'person'; personId: string }
  | { kind: 'person_pair'; personLowId: string; personHighId: string }
  | { kind: 'market_case'; caseId: string }

type HistoryFilterCode =
  | 'market_decision'
  | 'employer_interval'
  | 'credit_or_honor'
  | 'relationship'
  | 'promise'
  | 'lifecycle'
  | 'all_available'

interface HistoryPageRequestDto {
  subject: HistorySubjectRefDto
  filters: readonly HistoryFilterCode[] // complete requested set; hard maximum 8
  sourceDomainIds: readonly string[] // complete requested set; hard maximum 16
  order: 'newest_first' | 'oldest_first'
  requestedPageSize: number // default 25; server clamps to hard maximum 100
  asOfWeek: number
  expectedSnapshotRevision: string
  cursor?: string
}

interface ProfessionalBondSummaryDto {
  otherPerson: PersonSummaryDto
  classifications: readonly PublicClassificationDto[] // complete fixed catalogue; hard max 8
  sharedFilmCount: number
  firstRecordedWeek: number
  lastRecordedWeek: number
  recentDrivers: readonly ReasonDto[] // strict cap
  driverCount: number
  recentDriversTruncated: boolean
  openDriverHistoryCapability?: CapabilityDto
  historyPageRequest: HistoryPageRequestDto
}

interface CareerLifecycleSummaryDto {
  personId: string
  displayedAge: { value?: number; label: string; precision: 'exact_year' | 'estimated_year' | 'not_recorded' }
  lifePhase: PublicLifePhase
  retirement: PublicRetirementState
  effectiveWeek?: number
  currentEmployer?: StudioIdentitySummaryDto
  employerSummary: readonly P12EmployerIntervalSummaryDto[] // P12 projection, recent cap
  employerIntervalCount: number
  employerSummaryTruncated: boolean
  openP12EmployerHistoryCapability?: CapabilityDto
  historyPageRequest: HistoryPageRequestDto
}

interface SourceDomainOrderingManifest {
  domainId: string
  sourceRevision: string
  orderingKind: 'native_sequence' | 'owner_archive_adapter'
  orderingVersion: string
  sourceOrderHighWatermark: number
  recordedFromWeek?: number
  completeness: 'complete' | 'partial' | 'not_recorded'
  phaseOrderLineageRef: PhaseOrderLineageRef
}

interface PhaseOrderLineageRef {
  oldestVersion: string
  newestVersion: string
  lineageDigest: string
}

interface HistoryPageDto<T> {
  subject: HistorySubjectRefDto
  appliedFilters: readonly HistoryFilterCode[] // exact echo; hard maximum 8
  sourceDomainIds: readonly string[] // exact echo; hard maximum 16
  recordingBoundary?: { fromWeek: number; reason: string }
  order: 'newest_first' | 'oldest_first'
  asOfWeek: number
  requestedPageSize: number
  appliedPageSize: number // clamp 1..100; default 25
  records: readonly T[] // hard maximum 100
  returnedRecordCount: number
  nextCursor?: string
  asOfP14DomainSequence: number
  phaseOrderLineageRef: PhaseOrderLineageRef // one oldest/newest/digest; rows carry exact version
  sourceOrderingManifest: readonly SourceDomainOrderingManifest[] // hard maximum 16 domains
  snapshotRevision: string
  schemaVersion: string
  segmentGeneration: string
  dataVersion: string
  incompleteDomains: readonly { domainId: string; reason: string }[] // hard maximum 16; complete
}
```

Cursors bind subject, filter, stable sort tuple `(effectiveWeek, phaseOrdinal, 'P14', p14DomainSequence, eventId)`, requested/applied page size, schema/segment generation, `asOfP14DomainSequence`, and one phase-lineage reference; each of the at most 100 rows retains its exact phase-order version. P14 allocates only its own monotonically increasing domain sequence; the accepted scheduler owns immutable `phaseId`/ordinal/version facts. A merged career view freezes each source owner's revision, ordering kind/version, and order high-watermark, then merges by `(effectiveWeek, phaseOrdinal, domainId, sourceOrderOrdinal, eventId)`. P14 native rows use `p14DomainSequence`. An accepted P08/P10/P12 source without a native sequence must supply an owner-authored, idempotent metadata-only archive-order adapter bound to persisted source order and stable IDs; P14 cannot mint it. If the owner cannot prove one, exclude that domain with explicit incompleteness. The source manifest has a hard maximum of 16 domains; lineage/digest mismatch refuses rather than truncates. A scheduler catalogue upgrade cannot remap an old event. Legacy events without phase evidence use `legacy_phase_unspecified` plus `phasePrecision: not_recorded`, never current-rule inference. Later appends do not invalidate or reorder the bound page during its retention window. A cursor from another person/filter, or one invalidated by an explicitly reported incompatible schema/compaction generation, is refused rather than coerced.

Bounded summary arrays use explicit caps: `proposals` at most 16 in the future full market (two in
P14A), `knownTerms` at most 24, `interest.reasons` at most 5, `recentDrivers` at most 5, and recent
employer summaries at most 12 before the P12 paged route. Every list that may omit otherwise eligible
rows reports count, applied limit, truncation, and the route to more. A fixed complete schema/catalogue
list must fit its hard cap or fail authoring/validation; it never silently drops rows.

## F. Identity requirements and cross-root invariants

1. Every `PersonId` resolves to exactly one P10 person or a validated historical tombstone record preserving identity.
2. No `PersonId` is generated from name, employer, role, birth, current week, or collection index.
3. Every P14 decision receipt references the exact P12 employer transition and P10 contract/career records produced by the same atomic transaction, or records an honest decline with no such references.
4. P12 remains solely responsible for proving that active employer intervals per person do not overlap; P14 validates the referenced result but stores no parallel interval.
5. P14A stores no future-employer reservation or transition.
6. The selected proposal's person/studio/P10 draft/version/digest equals the linked P10 contract and P12 transition facts; no proposal becomes selected if those writes fail.
7. Proposal issuer cannot equal a nonexistent/closed studio; future P15 distress law must explicitly resolve open cases.
8. An intermediary engagement cannot change person identity or employer directly.
9. A relationship edge references two distinct persons in canonical ID order.
10. A public relationship classification has at least one retained evidence/aggregate reference and a rules version.
11. A promise outcome is terminal and emitted once.
12. Retirement never deletes person, film participant, award/honor, career event, employer interval, promise outcome, or relationship evidence.
13. Current profile employer is derived from the active interval/P10 contract reconciliation, never from last history row alone.
14. Event IDs/sequences never rewind after compaction, migration, save/load, or rollback to a checkpoint.
15. Old-history absence is represented explicitly, not filled with generated employer or relationship records.
16. P14 never mints `PersonId`; every committed cohort maps each bounded request slot one-to-one to a unique committed P10 person-registration receipt and `PersonId`. A refused cohort contains none, and any failed registration creates no lifecycle or market row.
17. A P12 operating-state transition cannot commit while a P14-required open-case/commitment disposition manifest is missing, duplicated, stale, digest-mismatched, incompletely chunked, or only partially applied.
18. A P14 event owns exactly one P14 domain sequence. Cross-domain pages preserve the frozen high-watermark manifest and never reinterpret a foreign sequence as global.
19. Every new P14 history row stores the scheduler-issued `phaseId`, immutable ordinal, and phase-order version; catalogue evolution cannot reorder it, and legacy unknown-phase rows remain explicitly noncausal.
20. A foreign P08/P10/P12 history appears in a merge only with its owner-authored native sequence or
    versioned archive-order adapter; P14 never allocates its order, and unavailable domains remain
    visibly incomplete.
21. Cohort request body, count (1..32), schedule/worldgen/rules versions, digest, and terminal receipt survive save/load; equal idempotency key plus unequal body is a refusal.
22. Cohort and operating-disposition terminal history is segmented and paged; no root, projection, receipt, or bridge snapshot embeds a lifetime ledger or unbounded affected-ID list.
23. A committed operating-disposition root manifest's affected count/digest equals the canonical union of its immutable chunks, and every subject appears exactly once with typed disposition and reason.
24. P14A.1 has one due case. A later multi-case phase requires unique scheduler admission ordinals, at most 32 submitted offers per studio/decision phase, unique visible issuer priorities, and valid P11/P12 hold/admission references; `PersonId` never orders scarcity.

## G. Persistence rules

- Root collections are versioned independently enough to validate/migrate, while one accepted `GameState` save version remains the transactional boundary.
- Open cases, proposals, terms versions, intermediary engagements, P14 decision receipts, lifecycle due queues, and active promise/relationship summaries persist. The current-employer index and employer intervals persist only in P12's authoritative root.
- UI selection, expanded rows, sort order, transient hover, animations, and unopened page caches do not affect authoritative save state.
- Settlement writes all related facts or none: case/proposal terminal state, contract reference, employer interval transition, finance receipt/reference, and career event.
- Persistence validates closed/open interval consistency, deadline ordering, ID uniqueness, source refs, allowed state combinations, and index parity.
- Duplicate scheduled event delivery is idempotent by durable event/receipt ID.
- Cohort creation is one cross-root candidate: P14 persists the immutable request body/digest,
  schedule/worldgen/rules versions, and 1..32 slots; P10 mints and registers every `PersonId`; P14
  commits lifecycle/arrival provenance only with an equal-cardinality, unique slot/person/P10-receipt
  set. Duplicate dispatch returns the same terminal receipt, a changed body under the same key refuses,
  and one failed registration commits none of the cohort. Terminal pairs archive behind a paged index.
- Future P15B entrant/operating-state transitions persist P14 disposition manifests/chunks only as
  part of the complete all-owner candidate; ready/refused preflight artifacts remain off-state. The manifest binds request/rules versions, source revision,
  affected-set count/root digest, and a chunk archive whose immutable chunks hold at most 100 rows.
  Open cases, submitted proposals, and commitments cannot disappear on dormancy or closure.
- Retirement settlement is one scheduled P14C candidate. P14 commits alumni/eligibility only with the
  exact P10 assignment/contract, P11 obligation-or-none, and P12 roster/employer/exclusivity/interval
  receipts. An uncleared guard records a typed deferral; no package performs a silent contract break.
- Content/rules versions required to interpret offers, promises, classifications, lifecycle, and cohorts persist with records.
- History segments are immutable after sealing. Corrections are new events or explicitly versioned migration receipts, never silent mutation.
- Phase ID/ordinal/version facts are immutable event-time fields. Page-index rebuild and compaction
  preserve them; legacy rows without evidence use the fixed unknown-phase bucket rather than the
  current scheduler map.
- Paging indexes may rebuild deterministically from records; rebuild is verified and cannot invent records.
- A failed history segment/checksum produces a visible load/refusal path. It does not drop the segment and continue as complete.

## H. Migration sketches

### H.1 Pre-P14 to P14A

1. Validate the incoming accepted save completely under its source version.
2. Add empty market-case/proposal/intermediary roots.
3. Require P12's accepted migration to have already created or validated every current-employer anchor, uniqueness index, interval, transition reference, and employer-history recording boundary required by its law. If any required P12 fact is absent, stop; P14 creates none of them.
4. Add only P14's market-fact recording boundary at migration week.
5. Do not generate prior intervals, prior offers, rival bids, agency contacts, departure reasons, or contract IDs not established by upstream truth.
6. Initialize P14 case/proposal indexes and due queues, then validate all P12 foreign references.
7. Record the P14 migration version/receipt; serialize; load again; compare invariants.

### H.2 P14A to P14B

1. Add empty commitment/relationship roots and page indexes.
2. Mark promise/relationship recording boundary at migration week.
3. Do not backfill chemistry from old film credits unless Owner expressly approves a truthful **derived summary** clearly labeled as reconstruction; default is no backfill.
4. Do not manufacture promises or trust baselines from salary/tenure.
5. Build empty active-edge and due indexes; validate.

### H.3 P14B to P14C

1. Add lifecycle/cohort roots.
2. For new/future people, use authored birth provenance.
3. For legacy `Talent.age`, anchor `ageAtMigration` to `migrationWeek` with estimated-year precision; do not invent exact birth week.
4. No person starts retired solely because an inferred historical boundary already passed. Apply an explicit grandfathering/transition law approved for migration.
5. Mark lifecycle recording boundary; create no past retirement announcements or phase events.
6. Initialize only future due boundaries/cohort schedules. A receipt exists only after P10 has atomically registered the due people; migration never pre-mints a cohort.

### H.4 Failure and rollback

Migration is pure and transactional. Any invalid ID, overlapping interval, missing studio/person reference, impossible state, duplicate event, unsupported rules version, or serialization mismatch rejects the migrated candidate and leaves the source save untouched. There is no “best effort” dropping of career facts.

Phase-order migration is equally strict: recorded phase facts copy unchanged; an older event with no
phase evidence is indexed as `legacy_phase_unspecified` and `phasePrecision: not_recorded`. A new
phase-order catalogue version may add only a reserved ordinal and cannot rewrite old page keys.

For an upstream history without native sequence, the owning package/shared history contract may add a
metadata index containing source revision, stable event ID, source-order ordinal, order precision,
checksum, and high-watermark. It does not mutate or reinterpret the event. Rebuild must be idempotent;
otherwise P14 excludes the domain and reports its incomplete recording/order state.

## I. Likely current/future files and seam classification

These are reconnaissance targets, not authorized changed paths. Exact line numbers and final paths must be refreshed after upstream acceptance.

| Concern | Current accepted target | Classification | Future conceptual seam |
|---|---|---|---|
| Person/profile/hidden truth | `src/core/types.ts`; `src/core/talentSummary.ts`; `ui/src/engine/adapter.ts` Profile projections | `EXISTING` / `DO NOT TOUCH` ownership | Add P14 references/projections; never a replacement person model. |
| P10 contracts/employment | `src/core/employment.ts`; contract/action/tick sections in `src/core/types.ts`, `src/core/actions.ts`, `src/core/tick.ts` | `EXISTING` / `UPSTREAM PACKAGE DEPENDENCY` | The scheduled P14 chooser transaction calls one accepted P10 contract boundary; P14 does not reproduce term or employment state. |
| Finance quote/consequence | cash/contract logic and P11 future authority | `UPSTREAM PACKAGE DEPENDENCY` / `DO NOT TOUCH` | Typed finance quote/commit receipt interface, not duplicate math. |
| Studios/employer/rivals | no accepted current multi-studio root; `MarketState.competingSlate` is inert | `INERT PLACEHOLDER` / `UPSTREAM PACKAGE DEPENDENCY` | P12-owned `StudioId`, employer ownership, rival command/decision boundary. |
| Market state | `src/core/types.ts`: `MarketState`, `market.tick` | `EXISTING` calendar counter; `DO NOT WIDEN` frozen leaf | Additive `talentMarket` root and due index. |
| Career events | `src/core/types.ts` career records; `src/core/starPower.ts`; `src/core/tick.ts` | `EXISTING` | Extend event taxonomy or an adjacent versioned career-event root with exact provenance. |
| Film/collaboration facts | `FilmResult`/participants/production IDs | `EXISTING` with legacy gaps | Relationship input event adapter referencing frozen facts, never recomputation of missing cast. |
| Relationship graph | none | `ADDITIVE ROOT NEEDED` | Conceptual `professionalRelationships` reducer/index/history page. |
| Birth/age/lifecycle | stored `Talent.age`; no aging/retirement | `INERT PLACEHOLDER` / `ADDITIVE ROOT NEEDED` | Additive lifecycle provenance/due queue; preserve legacy age honesty. |
| Talent supply | `src/core/worldgen.ts`; current rotating market selectors | `EXISTING BUT INSUFFICIENT` | P14 versioned deterministic cohort schedule/request from core week plus P13 era context; P10-owned person allocator/registration receipt; no P14 mint. |
| Save/migration | `src/core/save.ts` V1–V15 validators/migrations | `EXISTING` | One staged save increment per accepted wave; strict roots/refs/index validation. |
| Read model | `ui/src/engine/adapter.ts` | `EXISTING` | Bounded market/bond/lifecycle summaries and page request boundary. |
| Browser UI | `ui/src/screens/HiringMarket.tsx`, `StudioRoster.tsx`; `ui/src/components/TalentProfileDrawer.tsx` | `EXISTING` / final paths may change | Retained Talent Market workspace plus Profile tabs/context retention. |
| Calendar/attention | `src/core/studioCalendar.ts`; adapter next-event logic | `EXISTING` / `UPSTREAM PACKAGE DEPENDENCY` | Grouped deadlines and promise/retirement due events, no duplicate date math. |
| Cross-domain history order | heterogeneous P08/P10/P12 event IDs/arrays; no accepted global sequence | `UPSTREAM OWNER DEPENDENCY` | consume sealed core phase catalogue plus native source sequence or source-owner archive adapter; otherwise explicit incomplete domain. |
| Bridge schema/session | `bridge/schema/bridge-schema.ts`; `bridge/session.ts`; generated Unity DTOs | `EXISTING` | Capability/intent DTOs, stale revision guards, paged query channel after accepted architecture. |
| Unity presentation | accepted Unity workspace at `29aea89...`; exact final P05/P06 paths unsealed | `DO NOT TOUCH` / `FINAL CHANGED-PATH REFRESH REQUIRED` | World selection/status/arrival plus retained workspace presentation only. |
| Endurance/size measurement | current core tests and `scripts/measure-v14-save-size.mts` | `EXISTING` precedent; insufficient for P14 | Dedicated 6,240-week scenario, root-size report, replay/save-cadence variants. |

### I.1 Possible future module boundaries, names not authorized

- `src/core/talentMarket.ts` — pure case/proposal reducer, scheduled chooser orchestration, decision receipts, and selectors;
- P12-owned employer-history/index modules — consumed through accepted validation and projection boundaries; no P14 duplicate module;
- `src/core/professionalCommitments.ts` — typed promise/trust reducer;
- `src/core/professionalRelationships.ts` — sparse edge reducer/compaction;
- `src/core/careerLifecycle.ts` — age/life phase/retirement/cohort schedule;
- `src/core/careerArchive.ts` — immutable segments/page cursors;
- corresponding focused tests, save validators/migrations, adapter selectors, bridge schema/session bindings, and presentation components.

A future builder may choose different files after reconnaissance. Adding everything to `types.ts`, `tick.ts`, `adapter.ts`, or one monolithic “talent system” file should trigger hostile review.

## J. Worker ownership and concurrency law

“Worker” here means simulation/projection responsibility, not a requirement to introduce a browser worker.

| Work | Sole authority | Allowed consumers | Forbidden behavior |
|---|---|---|---|
| Weekly phase/tick and scheduled due events | TypeScript simulation owner | Read models after committed transition | Unity/UI ticking deadlines or lifecycle. |
| Offer create/revise/withdraw | TypeScript command reducer | Browser/Unity submits capability-bound intent | Client mutating proposal state optimistically as truth. |
| Deadline decision/settlement | One serialized TypeScript scheduled phase | P11/P10/P12 boundaries inside one transaction; projections afterward | Any client settlement command; iteration-order winner; partial cross-root commit. |
| Employer identity, uniqueness index, intervals, transitions, anchors, and recording boundary | P12 TypeScript core/save authority | P10/P14 selectors and validators by reference | P14 creating or migrating employer facts; separate player/rival maps with eventual reconciliation. |
| Promise/relationship reducers | TypeScript authoritative event consumer | Bounded projection/cache | UI deriving trust/chemistry from visible credits. |
| Lifecycle/cohort scheduling | P14 TypeScript scheduled event owner | Profile/market/history | Frame-time age mutation, nondeterministic arrivals, or person minting. |
| Person mint/registration | P10 identity authority | P14 stores committed registration receipt and cohort provenance | P14 allocator, partial cohort, or duplicate person on retry. |
| P15B operating-state participant disposition | P14 domain reducer inside one all-owner candidate | P12/P15 transition coordinator consumes receipt | Mutating P12 registry state or dropping open cases/commitments. |
| P14C retirement coordinator | one serialized TypeScript scheduled candidate coordinating P14/P10/P11/P12 | commit retirement and every owned settlement receipt once, or persist only a typed deferral/refusal | closing employer interval/contract in P14, unilateral compensation, partial alumni state, or client-triggered retirement commit. |
| History compaction | Deterministic maintenance phase or offline save operation with receipt | Page service and diagnostics | Background mutation racing authoritative tick/settlement. |
| Snapshot/page projection | Pure read side over immutable committed state/revision | Browser/Unity | Projection writing simulation or consuming RNG. |
| Unity world/UI | Presentation and intent submission | Accepted DTOs/capabilities | Formula, legality, choice, reason, or history invention. |

If asynchronous history paging is later used, each request binds a committed history revision. Appends may create a new revision but cannot reorder the bound page. Compaction publishes atomically after verification. No background worker may mutate the live authoritative object graph without the same serialized command boundary.

P14A.1 freezes and settles one case. Before multiple cases may be active in one decision phase, the
scheduler assigns a stable, visible `caseAdmissionOrdinal` at due-set admission and P14 indexes the set
by `(decisionWeek, caseAdmissionOrdinal)`. No ordinal derives from `PersonId`, collection position, or
client timing. One issuer may submit at most 32 offers into that phase, each with a unique visible
`portfolioPriority` and valid P11 obligation-hold/P12 capacity-admission receipt; excess submission is
refused. Revalidate P10 contract and those P11/P12 facts before each atomic commit. If an upstream fact
invalidates scarce capacity, resolve that issuer's affected offers by unique portfolio priority and emit
typed loser/refusal outcomes with no partial writes. Enumeration, insertion, async completion, duplicate
retry, or client timing cannot reorder the due set.

## K. Implementation waves

Each wave is independently stoppable and requires technical plus Owner acceptance before the next.

### K.0 — Reconnaissance and dependency proof

- record accepted upstream SHAs and working-tree cleanliness;
- confirm P10/P11/P12/P13 exact ownership and APIs;
- classify seams and define no-touch paths;
- resolve P14A-blocking Owner decisions;
- build identity/interval/offer transition spec and fixtures only;
- set performance/storage budgets from measured current state.

Stop if stable `PersonId`, stable `StudioId`, one employer authority, contract commit boundary,
finance consequence boundary, or scheduler-owned immutable phase catalogue/legacy unknown-phase law is absent.

### K.1 — P14A.1 core state, no presentation

- additive market case/proposal roots;
- versioned P10 draft references and review invalidation;
- intermediary preview route;
- one scheduled atomic chooser transaction that produces P10/P11/P12 mutations plus a P14 decision receipt;
- deterministic player/rival fixture;
- save validator/migration/replay tests.

Run the full 6,240-week P14A.1 endurance scenario and seal the core slice before read-side work.

### K.2 — P14A.2 bounded projections/bridge

- one case summary, offer comparison, public reasons, allowed intents;
- stale revision/terms-version protection;
- recent employer summary and paged history seam;
- no hidden field audit;
- browser and Unity schema equivalence tests.

Run the full 6,240-week P14A.2 endurance scenario with repeated projection and paging schedules; its simulation digest must equal P14A.1.

### K.3 — P14A.3 world/workspace

- exact person world route and context return;
- retained market case workspace;
- accessible offer comparison, proposal-submission confirmation, and refusal;
- effective-week arrival/departure presentation;
- grouped deadline/competition attention.

Seal P14A here. Do not continue automatically.

### K.4 — P14B commitments

- small Owner-approved typed promise catalogue;
- event-driven progress/outcome and public trust summary;
- migration boundary, due index, history pages;
- no free-text/unbounded polling.

### K.5 — P14B professional relationships

- qualifying collaboration events;
- sparse canonical edge/index;
- bounded public drivers/classifications;
- dormancy/compaction; Profile collaboration view;
- no simulation bonuses until each exact consequence is separately proven/approved.

Seal P14B here.

### K.6 — P14C lifecycle

- birth provenance/derived age;
- life phase/retirement law and due queue;
- deterministic era-aware P14 cohort requests plus atomic P10 person-registration receipts;
- immutable cohort body/digest, schedule/worldgen/rules versions, hard maximum 32, and paged terminal archive;
- retirement/alumni employer/contract resolution;
- Profile/history/succession presentation;
- old-save grandfathering and 6,240-week proof.

Seal P14C here. P15 consumes only after Owner acceptance.

## L. Test fixtures

### L.1 P14A minimum fixtures

| Fixture | Facts | Proof target |
|---|---|---|
| `expiry_player_vs_rival` | Person P1, player S1, rival S2, expiring P10 contract, two visible offers | Deterministic selection and single settlement. |
| `revision_invalidates_review` | Offer O1 V1 reviewed, salary/term changes to V2 | V1 token refused; V2 requires review. |
| `duplicate_deadline_dispatch` | The same case-decision idempotency key is dispatched twice at the effective phase | One authored transaction and one duplicate refusal; no overlap or duplicate event. |
| `declines_all` | Both offers valid but below visible acceptance rule | Typed reasons, free-agent outcome. |
| `unknown_rival_terms` | Rival interest known, term knowledge restricted | Explicit unknowns; no fabricated comparison. |
| `assignment_until_expiry` | Person bound to active production through boundary | No early transfer; exact legal date. |
| `insufficient_funds` | P11 quote valid at review, cash changed before commit | Revalidation and atomic refusal. |
| `withdrawn_offer` | Issuer withdraws current version | Cannot settle; durable status. |
| `save_open_case` | Open case and intermediary response pending | IDs/version/deadline persist; P14A uses no chooser RNG state or receipt. |
| `legacy_recording_boundary` | Pre-P14 current employee with no employer history | Current anchor only; “Not recorded” past. |

### L.2 P14B fixtures

- one shared-film event below edge threshold;
- repeated collaboration crossing threshold exactly once;
- Actor–Director evidence without importing the original game's hidden formula;
- canonical `(A,B)` ordering under reversed event input;
- duplicate event idempotence;
- promise fulfilled at exact deadline;
- promise broken with two evidence refs;
- waived and externally impossible promises;
- dormant edge reactivated after a new film;
- compacted driver segment produces identical public summary;
- no edge from Unity co-presence; and
- no public relationship label without evidence.

### L.3 P14C fixtures

- authored exact-week birth and year-only birth;
- legacy age anchor retaining displayed age at migration;
- phase boundary before/after save/load;
- retirement eligible but remains active;
- retirement announced with outstanding assignment/contract;
- outstanding assignment/contract/obligation at the attempted effective week yields a typed deferred
  receipt, leaves P10/P11/P12/P14 unchanged, and schedules only the approved next check;
- effective retirement closes eligibility exactly once;
- clear retirement boundary commits matching P10 person/assignment/contract, P11 explicit-none or
  settlement, P12 roster/employer/exclusivity/interval, and P14 alumni receipts atomically; injected
  failure in any participant commits none and duplicate dispatch returns the first receipt;
- alumni profile linked from old film and award;
- deterministic cohort arrival across save-cadence variants;
- duplicate cohort dispatch with the same body digest returns the original P10/P14 receipt set and creates no second person;
- the same idempotency key with a changed body, worldgen version, rules version, count, or slot refuses;
- committed cohort request count, slot count, unique `PersonId` count, and unique committed P10 receipt count are equal; one P10 registration failure leaves the entire cohort refused/uncommitted with an empty registration list and no consumed P14 lifecycle slot;
- a 32-person request commits atomically; a 33-person request refuses before P10 minting; lifetime terminal receipts page without entering the hot snapshot;
- phase catalogue version changes after a same-week mixed-domain career page is issued; old order,
  cursor continuation, recorded phase facts, and legacy unknown-phase labels remain identical;
- P10/P08 history with stable IDs but no native sequence receives an owner-authored idempotent archive
  index; rebuilding preserves order/high-watermark, while unavailable adapter proof excludes the
  domain with explicit incompleteness rather than a P14-minted sequence;
- no ID collision over 120 years;
- no automatic retirement of legacy person due solely to estimated past threshold; and
- market remains adequately supplied under worst-case approved retirement law.

### L.4 Corrupt/hostile fixtures

- duplicate `PersonId`, `OfferId`, event ID, or relationship pair;
- proposal references wrong person/case/studio;
- selected proposal version differs from decision receipt;
- two active employer intervals overlap;
- active index disagrees with intervals;
- deadline before creation/effective week;
- terminal promise receives second outcome;
- relationship self-edge;
- cold segment checksum/revision mismatch;
- retired person appears active/assignable;
- page cursor reused for another person/filter;
- history request exceeds eight complete filters or 16 complete source domains;
- requested history page size exceeds 100 and is clamped to 100 with exact requested/applied values;
- history cursor binds another snapshot/subject/filter and refuses;
- bridge intent missing/wrong state revision;
- two due cases contend for one studio's final P11 obligation/roster capacity; reversing insertion and
  worker-completion order preserves persisted admission/portfolio order without reading `PersonId`, a
  duplicate retry returns the first receipt, and the lower-priority invalidated offer records one typed
  loser disposition without a partial contract/employer/finance write;
- proposal 33 for one studio/decision phase refuses, duplicate `portfolioPriority` refuses, and a
  priority/hold change invalidates the prior reviewed version;
- a future P15B dormancy request with open offers/commitments produces one complete typed P14
  disposition manifest and immutable chunks or leaves P12/P14 unchanged; duplicate delivery returns
  the same receipt; and
- a missing/duplicate disposition subject, wrong affected-set count/root digest, stale request/rules
  version, chunk over 100 rows, or committed/refused-state mismatch rejects the all-owner candidate.

Every corrupt fixture must reject or visibly quarantine under approved recovery law. None may silently drop or choose the first record.

## M. Long-run/endurance harness

### M.1 Required runs

1. Run a deterministic 1920–2040 scenario for 6,240 ticks at every slice boundary: P14A.1 core, P14A.2 read side, P14A.3 world route, P14B commitments, P14B relationships, and P14C lifecycle. Only the final P14C run activates every accepted P14 root.
2. Repeat from identical seed/content/rules/commands; compare checkpoint digests and final canonical facts.
3. Repeat with save/load every week for a bounded stress interval and every 26/52 weeks across the full run.
4. Repeat with different UI paging/sort/filter/view-opening schedules; simulation digest must remain identical.
5. Repeat with randomized but seeded valid command schedule and high rival contention.
6. Run migration at early/mid/late saves from every supported predecessor.
7. Run compaction at different allowed maintenance boundaries; current summaries and durable history answers remain equal.
8. Project browser and Unity snapshot/page DTOs from the same checkpoints; compare semantic parity.

### M.2 Stress population envelope

The first measured envelope should support at least:

- 10 studios;
- 2,500 unique people created over the century;
- 500 active professionals at peak;
- 50,000 career/market/promise/lifecycle events;
- 20,000 offer/employer-interval records;
- 25,000 retained relationship driver records after compaction;
- 2,000 active/notable sparse edges at peak; and
- histories exceeding one page by at least 20× for selected long-career people.

These are test inputs, not product counts.

### M.3 Assertions every tick/checkpoint

- unique IDs and monotonic sequences;
- at most one open market episode and one active employer per person;
- no overlapping employer intervals;
- no settled proposal without matching decision/contract/employer/career references;
- no invalid/retired person in active assignment or eligible market indexes;
- due indexes contain exactly the expected nonterminal records;
- relationship edges are canonical, sparse, and evidence-backed;
- no promise receives duplicate outcome;
- cohorts conserve IDs, every new person has a P10 registration receipt, and P14 never remints historical people;
- duplicate cohort dispatch and injected P10 registration failure cannot leave partial lifecycle/market rows;
- rival/player commands obey identical guard functions;
- no full-history scan counter increases in weekly hot paths;
- deterministic digest equality at authored checkpoints;
- canonical due-case settlement is invariant under collection/insertion/worker-order permutation, and
  every resource-contention disposition matches latest-state P10/P11/P12 revalidation without opaque
  identity ordering;
- every committed cohort preserves exact request/slot/person/P10-receipt cardinality and every refused
  cohort preserves an empty registration set; and
- every P14 operating-disposition manifest/chunk set is complete, bounded, digest-valid, and idempotent.

### M.4 Measurements and budgets

Report median/p95/p99/max tick time, settlement time, save/load time, migration time, current projection time, page latency, history compaction time, serialized bytes per root/segment, hot snapshot bytes, allocation peak, active indexes, event/edge counts, and digest cost.

Budgets must be set against the accepted runtime/platform after baseline measurement. Regardless of numeric budget:

- hot weekly work is proportional to current scheduled events/touched people/pairs, not total history or all possible pairs;
- one current projection is bounded independent of total history;
- a history page is `O(page size + index lookup)`, not `O(all history)`;
- no view performs a repeated full-save hash; and
- storage exhaustion fails early and explicitly before history is lost.

### M.5 Storage estimate method

For each root, publish:

```text
record count × measured mean/p95 encoded bytes
+ map/index overhead
+ segment metadata/checksums
+ current snapshot/cache bytes (non-authoritative)
= measured total and projected 6,240-week total
```

Do not multiply TypeScript object estimates and call them serialized size. Measure actual accepted encoding. Include names/reason payloads/localization codes and worst-case IDs. Compare against the real persistence quota/backend, not an assumed browser local-storage capacity.

## N. World/UI anatomy

### N.1 Selected-person market inspector

```text
┌──────────────────────────────────────────┐
│ [PORTRAIT]  PERSON NAME                  │
│             Profession · Current studio │
│             Renewal decision in 8 weeks │
├──────────────────────────────────────────┤
│ KNOWN MARKET STATE                       │
│ Your offer submitted · Rival interested │
│ Interest: Open — Role, term, recent work │
├──────────────────────────────────────────┤
│ [Open Profile]       [Review Market Case]│
└──────────────────────────────────────────┘
```

No accept/poach button appears in this compact inspector. It supplies context and a route to a consequence-bearing retained workspace.

### N.2 Desktop Talent Market workspace

```text
┌─ TALENT MARKET ───────────────────────────────────────────────────┐
│ Attention (2)   Renewal | Available | Approached | Closed        │
├──────────────┬───────────────────────┬─────────────────────────────┤
│ CASES        │ PERSON / CAREER       │ OFFER COMPARISON            │
│ ● A. Rivera  │ portrait + P10 facts  │ Your Studio | Rival Studio  │
│   8 weeks    │ current work/employer │ Salary      | Known/unknown │
│ ○ M. Okafor  │ recent credits        │ Term        | Term          │
│              │ employer chronology   │ Opportunity | Opportunity   │
│              │                       │ Deadline / reasons          │
├──────────────┴───────────────────────┴─────────────────────────────┤
│ Consequence: P11 quote / obligations / effective week            │
│ [Withdraw] [Revise]                        [Review & Submit V2]    │
└──────────────────────────────────────────────────────────────────┘
```

### N.3 P14B Profile collaboration tab

```text
Collaborations
  Notable: Person B — Established collaborators
  Why: 4 shared films · most recent Week 812
       Director/Actor on Night Harbor [Open film]
       Promise kept: lead role fulfilled [Open event]
  [View paged history]
```

Never show a free-standing percentage or “chemistry bonus” without specific authority and explanation.

### N.4 P14C retirement/alumni state

```text
Career
  Veteran · Age about 68 (legacy estimate)
  Retirement announced — effective Week 2,548
  Current commitments: 1 film through Week 2,544
  Succession: Actor coverage at risk [Open roster]

After retirement:
  Alumni since 1969 · same profile and Person ID
  37 recorded credits · 3 honors · 4 studios
  Earlier employer history: Not recorded before Week 1,920
```

Counts appear only when exact records exist; otherwise use bounded truthful language.

### N.5 Context retention

Each deep link carries source world selection, `PersonId`, case/event ID, camera bookmark where accepted, and return target. If the person departs while the workspace is open, the workspace updates from authoritative state, disables stale actions, explains the outcome, and retains the historical profile. Back does not select a different person by array position.

## O. Responsive rules

| Width/mode | Required behavior |
|---|---|
| Wide desktop | Three-pane case/person/comparison workspace; details remain visible while browsing cases. |
| Medium | Case rail collapses to a selectable drawer; person and comparison remain two panes; no term is removed. |
| Narrow/touch | One semantic column: identity → deadline/state → each offer card → consequence → actions. A sticky context header may remain; no horizontal offer table. |
| Large text / 200% | Rows wrap, cards grow, reason text remains reachable, and footer actions do not obscure content. |
| Controller focus | One active focus region; shoulder buttons change top-level region/tab; directional navigation never jumps across hidden panes. |

Sort/filter controls state the active order and result count. Narrow layouts preserve source labels, unknown-term markers, version, deadline, and consequence. Relationship graphs, if ever offered as secondary visualization, are omitted before evidence lists—not vice versa.

## P. Controller, keyboard, and mouse behavior

### Shared laws

- Select/Enter opens inspection, never commits.
- Back/Escape closes one layer, restores the opener when valid, and never withdraws or submits a proposal.
- `Review & Submit Proposal` requires an explicit labeled confirmation screen bound to the current offer version, P10 draft/version/digest, and state revision; it submits only and never accepts the person or chooses the winner.
- Disabled actions remain focusable only when platform accessibility guidance allows an explanation; otherwise the adjacent reason is persistently visible.
- Paging, sorting, and filtering never alter simulation or consume RNG.

### Mouse/touch

- Entire semantic row/card selects; separate action buttons do not rely on hover.
- Tooltips are supplementary. Every decisive term/reason is persistent text.
- Touch targets meet accepted minimum size and avoid destructive adjacency.

### Keyboard

- Tab follows cases → profile/context → comparison → consequence → actions.
- Arrow keys operate a table/list only while focus is inside it.
- Space/Enter activation is identical to pointer activation; no single key submits or withdraws a proposal without the same confirmation, and no key finalizes the employment outcome.
- Focus moves to the changed-version banner when reviewed terms become stale, then returns safely.

### Controller

- D-pad/stick moves within the active semantic region; bumpers change tabs/offer cards.
- Confirm opens/reviews; a separate explicit confirmation submits the current proposal version. No controller action accepts the person, chooses the winner, or settles employment.
- Back returns through workspace → world context.
- All refusal/detail copy is scrollable and screen-reader/voice equivalent where supported.

## Q. Error/refusal language

TypeScript returns stable codes plus authoritative parameters; presentation localizes without changing meaning.

| Condition | Required language pattern |
|---|---|
| Stale state | “This market case changed after you opened it. Review the current offers before submitting.” |
| Terms version changed | “This is now Offer V{n}. {changed fields} changed; your earlier review no longer applies.” |
| Deadline passed | “The decision deadline was Week {week}. This proposal is closed.” |
| Outside market window | “{Person} is under contract with {Studio} through Week {week}. In-term approaches are not permitted in this package.” |
| Insufficient funds/obligation | “The current commitment requires {P11-authored consequence}. Available/forecast authority does not permit settlement.” |
| Assignment blocker | “{Person} remains committed to {Project} through Week {week}; the proposed effective date is not legal.” |
| Proposal withdrawn | “{Studio} withdrew Offer V{n} in Week {week}. It cannot be accepted.” |
| Person chose another studio | “{Person} accepted {Studio}'s offer effective Week {week}. Top recorded reasons: {typed reasons}.” |
| Person declined | “No offer was accepted. Recorded reasons: {typed reasons or honest unknown}.” |
| Intermediary unavailable | “This route cannot complete before the decision deadline” or the exact typed cause. |
| Identity/reference failure | “Career data could not be verified for this person. No offer or employer change was made.” |
| History not recorded | “This history was not recorded before Week {migrationWeek}.” |
| Page cursor incompatible | “This history page belongs to an older schema or retired compaction generation. Reload from the current recording boundary.” Later appends alone do not invalidate an append-stable cursor. |
| Retirement | “{Person} retired effective Week {week}. Their profile and recorded career remain available.” |

Never say “bad luck,” “loyalty,” “betrayal,” “chemistry,” “poached,” “prime,” or “decline” unless the corresponding authoritative public fact exists. Never soften an invariant failure by selecting the first duplicate or silently refreshing into a commitment.

## R. Anti-cheat / anti-facade assertions

1. Every displayed rival offer resolves to a persisted `OfferId`, issuer `StudioId`, case, version, and status.
2. Every proposal submission/revision/withdrawal crosses a capability-bound TypeScript command with expected revision; settlement occurs only in the scheduled TypeScript phase.
3. Unity cannot alter terms, deadline, interest, choice, employer, compensation, trust, relationship, age, or retirement.
4. Reopening/reordering/paging a view cannot create, revise, withdraw, reveal, or settle an offer.
5. A client cannot submit an unrevealed rival offer or change another studio's proposal.
6. Unknown rival terms remain absent/unknown; debug or hidden fields are not serialized into production DTOs.
7. Settlement validates the current P10/P11/P12 state; cached quotes/cards cannot bypass it.
8. One active employer is validated in core and save, not merely deduplicated in UI.
9. Employer transfer preserves the same person record and exact historical references.
10. Relationship consequences originate from typed authoritative events; world proximity/animation never creates them.
11. Promise progress comes from authoritative predicates/events, not client-reported completion.
12. Age derives from saved provenance/current authoritative week; system clock and frame count are irrelevant.
13. Retirement/alumni changes eligibility only; no deletion or archive remint.
14. Rival AI obeys the same offer eligibility, deadline, exclusivity, and consequence APIs as the player.
15. Endurance/replay proofs run with presentation disabled; a UI animation cannot be required for state progress.
16. History pages are server/core projections with stable cursors; clients cannot request unbounded “all.”
17. Debug commands/fixtures cannot ship as player capability without explicit separation and proof.

## S. Hostile-review checklist

- [ ] Exact accepted upstream SHAs and changed paths are recorded.
- [ ] P10 owns person/profile/contract/career; P14 references rather than clones.
- [ ] P11 owns all cash/obligation calculations.
- [ ] P12 supplies real stable studio/employer/rival truth.
- [ ] Core scheduler supplies authoritative absolute week/phase; P13 supplies era/timeline/milestone context before lifecycle.
- [ ] Agents, negotiations, promises, and modern contracts are labeled successor design, not original parity.
- [ ] P14A contains only one contested renewal/expiry fixture and one intermediary route.
- [ ] In-term break/compensation/poaching remains excluded until Owner law.
- [ ] P10 term-version changes reset review and require a fresh submission; no client acceptance state exists.
- [ ] Settlement is atomic, idempotent, and preserves exactly one active employer.
- [ ] Person identity survives employer change and retirement.
- [ ] Public reasons are typed; hidden exact weights/potential/seeds do not cross projection.
- [ ] Rival and player use symmetric law.
- [ ] No relationship click-grind, all-pairs matrix, or proximity inference exists.
- [ ] Every public relationship classification has evidence.
- [ ] No manual stat allocation or exact hidden potential appears.
- [ ] Age is derived; legacy birthday precision is honest.
- [ ] Retirement preserves active links/profile/history.
- [ ] Migration fabricates no employer, offer, promise, relationship, birth, retirement, award, or credit.
- [ ] Current snapshots and history pages are bounded.
- [ ] Weekly work performs no total-history/all-pairs/full-population scan.
- [ ] No repeated full-save hash occurs per view.
- [ ] 6,240-week run, replay, alternate save cadence, migrations, and size report pass.
- [ ] Keyboard/controller/mouse and responsive layouts preserve every decision fact.
- [ ] P15 ranking/legacy and P16 acquisition/co-production are absent.
- [ ] Owner playtest accepts world route and decision clarity separately from tests.

## T. Stop conditions and rollback

### Stop immediately if

- an immutable P10 `PersonId` or P12 `StudioId` cannot be referenced without replacement;
- P12 has no real rival/employer state and the checkpoint would require a decorative competitor;
- P11 cannot author/revalidate the displayed obligation;
- two active employers, overlapping intervals, duplicate identities, or mismatched settlement facts can survive validation;
- a rival offer exists only in presentation;
- P10 term changes do not invalidate review/submission;
- migration requires fabricated history/birth facts to continue;
- hidden potential/AI weights/RNG enter a client DTO;
- Unity must calculate legality/outcome/reason;
- tick/projection work scales with total history or all possible person pairs;
- save/storage pressure would silently prune history;
- first-checkpoint scope expands into P14B/C, P15, or P16; or
- Owner-blocking decisions are assumed instead of recorded.

### Rollback law

- Before seal, rollback means discard the P14 candidate branch/save version and return to the last accepted upstream state; never downgrade a live save in place.
- Every migration leaves the source bytes untouched and writes a separately validated candidate.
- Every scheduled settlement transaction is atomic; on any failure, no case, proposal, employer, contract, finance, or event mutation commits. There is no settlement command exposed to a client.
- Presentation rollout may be feature-gated only if disabled state has no authoritative no-op action and no P14 data is silently discarded.
- Once an accepted save version containing P14 history exists, removal requires a forward migration preserving identities/events as inert readable history or an explicit Owner-approved incompatibility policy. Never erase it.
- Rollback reports name exact affected save versions, branches, commits, fixtures, and whether candidate saves remain recoverable.

## U. First-checkpoint final report format

```text
P14A ONE CONTESTED EXPIRY — FINAL REPORT

STATUS
COMPLETE / BLOCKED

AUTHORITY
TypeScript branch + SHA
Unity branch + SHA
Upstream P10/P11/P12/P13 accepted SHAs
Save version / bridge schema / rules versions

CHANGED PATHS
Exact production, test, generated, and documentation paths
Explicit no-touch authorities confirmed

OWNER DECISIONS APPLIED
Poaching/window scope
Intermediary power
Offer visibility
Offer decision law
Expiry-only settlement timing
Any deviations (must be separately approved)

SCENARIO PROVED
PersonId / player StudioId / rival StudioId / case ID
Eligibility and deadline
Offer versions and visible reasons
Settlement outcome
Employer intervals / contract / finance / career-event refs

GOLDEN JOURNEYS
Result for every P14A journey
World → workspace → return evidence
Keyboard / controller / mouse / narrow layout

DETERMINISM / SAVE / MIGRATION
Replay digests and checkpoints
Save/load cadence variants
Migration honesty and recording boundary
Duplicate/exclusivity/idempotence results

PROJECTION / ANTI-FACADE
DTO hidden-data audit
Browser/Unity semantic parity
Stale intent and fabricated-rival-offer refusal

PERFORMANCE / STORAGE
Fixture scale and the actual 6,240-week result for each implemented slice
tick / settlement / projection / page / save-load metrics
bytes by root and persistence headroom
proof of no history/all-pairs weekly scan and no per-view full-save hash

OWNER PLAYTEST
World route
Decision clarity
Offer/refusal explanation
Career continuity
Accessibility/input disposition

ADVERSARIAL REVIEW
Reviewers, findings, corrections, remaining blockers

ROLLBACK / RECOVERY
Last accepted checkpoint
Candidate-save handling

FINAL DISPOSITION
Accepted / revise / reject
Explicit authorization required before P14B
```

The report may not say “complete” if only a browser or Unity facade exists, if the rival is not authoritative, if an old save fabricates history, if exact identity/exclusivity fails, or if Owner playtest has not accepted the route.

## V. Builder annex disposition

This annex is complete as implementation guidance and remains **DOCUMENTATION ONLY**. Before use, perform the companion report's `POST-UPSTREAM OWNER-ACCEPTED REFRESH REQUIRED`, replace conceptual paths with verified current paths, preserve the package boundaries, obtain a separate implementation charter, and obtain explicit Owner authorization. Until then, stop without implementation.
