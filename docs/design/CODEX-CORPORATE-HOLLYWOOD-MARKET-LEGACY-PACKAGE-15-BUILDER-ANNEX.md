# PROJECT: STUDIO — PACKAGE 15 BUILDER ANNEX

# Corporate Hollywood, Shared Market & Studio Legacy

Status: **DECISION-READY RESEARCH CANDIDATE**<br>
Mode: **DOCUMENTATION ONLY**<br>
Authorization: **NO PRODUCTION AUTHORIZATION**<br>
Companion report: `docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md`<br>
Accepted TypeScript base: `7811377cea1c1b9ddca2c17c626879504b23ed4e`<br>
Unity activity: **none**

This annex is implementation guidance for future reconnaissance. It contains conceptual names and
projections, not production code or permission to change schemas. The first authorized builder must
refresh every path and type after upstream Owner acceptance.

---

## A. Builder decision in one page

Build nothing from this annex now. When later authorized, prove only **P15A.1 — One Symmetric
Shared-Market Consequence**:

> one player film + one rival film → same genre and governed release window → one shared
> formula/version → symmetric assessment and release consequence → typed source-backed reasons →
> decay → save/load/replay → world/workspace explanation.

The implementation boundary is strict:

- TypeScript owns eligibility, formula, version, pressure, decay, reasons, release effect, event,
  persistence, migration, and query ordering.
- P07 remains reception/theatrical authority; P15 supplies one prospective market input and never
  recomputes a frozen result.
- P08 Standing/history remain distinct; P15 records references, not replacement truth.
- P12 must supply real studio identities and conserved rival releases.
- Unity/Fable presents DTOs and submits current intents only; it calculates no market, rank, distress,
  closure, or Legacy state.
- P15A.1 contains no Power Ranking, screens, distress, entrants, closure, acquisition, merger,
  co-production, library/IP, finale, or post-2040 continuation.

Future gates:

- **P15A.2:** formula-versioned periodic Power Ranking, only after enough comparable history.
- **P15B:** shared pre-terminal warning/distress/recovery gates, equivalent remedy capabilities, and entrant eligibility orchestration only after Owner approval. P12 remains the sole active/dormant/closed registry and entrant-identity/business-state owner; rival closure and any player terminal ending require distinct rulings.
- **P15C:** evidence-backed 2040 Legacy, only after upstream facts and finale law are complete.
- **P16+:** acquisition, merger, co-production, subsidiaries/labels, valuation, library/IP ownership.

---

## B. Canonical terminology

| Term | Canonical meaning | Must not mean |
|---|---|---|
| Shared Market | one authoritative industry state consumed by every eligible studio/release | a player debuff or UI-only trend |
| Market pressure | bounded, versioned consequence of known active exposure in a defined genre/segment/window | popularity, Standing, rank, or arbitrary penalty |
| Exposure | one film's time-bounded contribution to shared market state | its full box office or permanent genre damage |
| Exposure window | exact weeks during which a source release affects pressure | vague “recent” history |
| Decay | deterministic reduction/removal of exposure according to the same versioned law | hidden rubber-banding |
| Market assessment | immutable release-boundary record of inputs, output, formula version, and reasons | a live recalculation from current state |
| Known release | P12-owned project/release whose public-disclosure law permits it to appear | every private rival project; a P15-owned schedule copy |
| Industry release schedule | P12-owned public release/event facts consumed by P15 through exact IDs/revisions | a P15 `industryCalendar` root; P07/P10/P11 player operations calendar |
| Standing | P08's persistent Audience Awareness, Industry Prestige, Commercial Confidence | Power Ranking, market pressure, Legacy |
| Power Ranking | P15A.2 periodic comparative recent momentum in a defined cohort/window | permanent reputation or one universal studio value |
| Rank snapshot | immutable dated cohort/order/movement/reason record | a client sort over current rows |
| Corporate condition | approved P15B warning/distress/recovery assessment and remedy state keyed to one P12 studio registry state | a second active/dormant/closed registry, literal cash band, or visual style |
| Studio operating state | P12-owned durable active/dormant/closed registry fact; P15B may request but never mirror its transition | P15 condition label or client presentation |
| Distress | staged business condition with typed causes, forecast, and remedies | any negative-cash week |
| Dormancy | non-terminal approved state with no/limited new commitments and preserved identity | deletion, bankruptcy, or acquisition |
| Closure | explicit terminal operating transition plus settlement and permanent archive | removing a row or freeing its ID |
| Entrant | newly created immutable studio identity entering through a dated event | respawn of a closed studio ID |
| Legacy fact | canonical P07–P15 record cited by the finale | generated prose or subjective score |
| Legacy archetype | nonexclusive versioned interpretation supported by qualifying and contrary facts | rank, grade, winner, or hidden score |
| Finale source manifest | frozen list of canonical IDs/completeness boundaries used at 2040 | duplicate copy of every source entity |
| Recorded-from week | first week a domain has trustworthy persisted history | guessed founding/market history |
| Formula version | immutable identifier for exact eligibility/window/math/tie/reason law | presentation build number |
| Typed reason | code plus source IDs and values sufficient for deterministic localized explanation | free text used as simulation input |

Use these terms consistently in core, bridge, Fable, tests, reports, and Owner playtest evidence.

---

## C. State-transition tables

### C.1 Release/exposure state

| From | Trigger | To | Persisted output | Refusal / invariant |
|---|---|---|---|---|
| unindexed | eligible P12 public-disclosure/schedule fact | known-preview | exact foreign release/studio/genre/week refs in a bounded read index | P12 source project/studio/revision must exist; P15 stores no schedule copy |
| known-preview | P12 cancellation/delay/disclosure change | removed/refreshed preview | no new P15 historical release event; exact P12 source revision changes | no assessment or phantom pressure for an unreleased film |
| known-preview | authoritative P12 release fact at week `W` | batch-pending | exact eligible release ID in week `W` due set | one membership per film/formula/release boundary |
| batch-pending | due set freezes | batch-frozen | `MarketReleaseBatch` with all eligible IDs and pre-batch exposure revision/digest | no assessment/activation before the whole due set is frozen |
| batch-frozen candidate | every P15 assessment and every P07 prospective result/input application succeeds and the whole candidate validates | committed P07 results + assessments + exposure-active atomically | all immutable assessments, P07 result/input/history refs, active index rows/end-decay schedule, one batch receipt | each subject reads same pre-batch snapshot + other batch members, explicitly excluding itself; one failed subject commits nothing |
| batch-frozen candidate | any P07/P15/cross-root validation fails | authoritative state unchanged | typed refusal outside simulation state; same source state remains replayable | no partial Film Result, assessment, history row, exposure, event, or debit; retry cannot duplicate |
| exposure-active | decay boundary | exposure-decaying | updated bounded exposure/aggregate event if material | no weekly prose/event spam |
| exposure-decaying | expiry boundary | archived | immutable assessment remains; active index entry removed | archived history never changes |

Calculate every subject and its P07 prospective result before activating any batch member. Build genre/
window aggregates once, subtract the subject's own contribution, assemble one complete off-state
`GameState` candidate, validate it, and commit once. Commit order is `(effectiveWeek, releaseId)` for
canonical bytes, not an input advantage. ID/owner swaps must swap normalized outputs exactly. If the
accepted P07 boundary cannot preflight and join this transaction, the checkpoint stops.

### C.2 P15A.2 rank state

| State | Gate | Next | Persist |
|---|---|---|---|
| insufficient-history | minimum cohort/window not met | insufficient-history | reason and next eligible boundary may be projected, not persisted weekly |
| eligible | cadence boundary | published | one snapshot with cohort, rank, prior comparable rank, movement, tie rule, formula, reasons |
| published | next cadence boundary | superseded | old snapshot remains queryable; new snapshot references prior ID |
| archived studio | later snapshot | excluded/archived | explicit eligibility reason; history retained |

P15A.1 has no rank state or rank fields.

### C.3 P15B corporate state

| P12 operating state / P15 condition from | Trigger class | P12 operating state / P15 condition to | Required facts | Forbidden shortcut |
|---|---|---|---|---|
| active / stable | approved warning predicate | active / warning | formula version, causes, forecast horizon, remedy capabilities | cash `< 0` alone |
| active / warning | condition clears | active / stable | resolution event | silent disappearance |
| active / warning | approved sustained threshold | active / distress | conserved cash/obligation/project evidence | one bad film or one week |
| active / distress | equivalent legal remedy succeeds | active / recovery | remedy capability, eligibility, conserved cost, timing, and effect references | secret/player-only subsidy |
| active / recovery | stable interval completes | active / stable | recovery summary | instant reset |
| active / distress | approved suspension predicate and P15 request | dormant / distress | complete participant manifest: P13 work/adoption disposition, P10 person/contract disposition, P11 finance settlement, P12 project/capacity/roster/current-employer/exclusivity/interval candidate, P14 case/commitment disposition, then one P12 registry receipt | P15 directly mutating/mirroring registry state or committing one participant early |
| dormant / distress | re-entry remedy succeeds and P12 commits | active / recovery | complete participant manifest: P13 entry/current-standard baseline, P10 person/contract, P11 finance, P12 registry/project/capacity/roster/employer/exclusivity/interval, and P14 market/lifecycle receipts, then one P12 registry receipt | free restart resources, dormant-period progress, or partial activation |

No P15B condition exists until Owner approval and a dedicated implementation charter. P12 owns every
operating-state transition in this composite table. Its accepted law permits rival failure while the
player has no mandatory hard-bankruptcy game-over. A future rival extension may request `dormant →
closed` only after exact Owner-approved trigger, settlement, archive, and entrant-floor law; a player
terminal ending is a separate decision. Acquisition is never implied.

### C.4 Entrant state

| From | Trigger | To | Ownership law |
|---|---|---|---|
| not eligible | P15B deterministic authored-window/floor predicate | eligible candidate | P15B persists one eligibility receipt/candidate ID; no `StudioId`, roster, cash, capacity, films, or history exists yet |
| eligible candidate | P15B submits idempotent creation request | requested | request references eligibility/policy versions; P15 cannot mint a studio or endowment |
| requested | effective week, all participant preflights, and feasibility pass | announced/active | one off-state candidate includes P12 `StudioId` mint/registry/business/project/capacity/roster/current-employer/exclusivity/interval state, P11 finance, P10 person/contract registrations, P13 entry-week technology/standard baseline, and P14 market/lifecycle initialization; P12 activates only after the complete manifest validates |
| requested | feasibility fails | deferred/cancelled | P15B records typed orchestration result; P12 creates no partial registry/business state and no phantom films/awards |
| active | ordinary lifecycle | P12 registry state plus P15B condition | same market/pre-terminal condition/remedy law as peers; no identity handoff |

The participant manifest is idempotent by transition request. P13 creates no retroactive research or
firsts; P10/P11/P12/P14 create only their owned entry-week facts; dormancy/closure resolves active P13
work and P14 open cases/promises explicitly. No `active`, `dormant`, or `closed` registry transition
exists until every receipt validates and the one candidate commits.

### C.5 P15C finale state

| From | Trigger | To | Persisted law |
|---|---|---|---|
| not-due | governed 2040 boundary reached | eligible | exact week and completeness audit |
| eligible | all mandatory source domains validate | source-frozen | one manifest with source IDs, recorded-from boundaries, formula/catalogue versions |
| source-frozen | interpretation reducer runs | interpreted | archetype IDs, qualifying/contrary refs, interpretation version; no prose authority |
| interpreted | player opens/acknowledges | presented | presentation state may remain non-authoritative; no source mutation |
| presented | Owner-selected mode | archive-browsable / ended / Endless transition | one explicit mode event; no implicit continuation |

---

## D. Interface-level entity sketches

These are conceptual contracts, not TypeScript definitions.

### D.1 Market definition

```text
SharedMarketDefinition
  marketDefinitionId: immutable ID
  version: exact formula/catalogue version
  genreOrSegmentKeys: ordered stable IDs
  exposureWindowWeeks: positive bounded integer
  releaseEligibility: typed/versioned predicate identity
  contributionBounds: explicit min/max
  decaySchedule: ordered deterministic stages
  commitOrder: stable identity rule; never a formula input advantage
  effectiveFromWeek: exact week
  retiredAtWeek: optional exact week
```

### D.2 Active exposure

```text
MarketExposure
  exposureId: immutable ID
  filmId / studioId: canonical references
  genreOrSegmentId: canonical reference
  releaseWeek: exact authoritative week
  activeFromWeek / activeThroughWeek: half-open boundary
  sourceReachBandOrValue: public authoritative input only
  contribution: core-authored bounded value
  definitionVersion: exact version
```

### D.2.1 Frozen release batch

```text
MarketReleaseBatch
  batchId: immutable ID
  effectiveWeek
  p15DomainSequence / phaseId / phaseOrdinal / phaseOrderVersion
  marketDefinitionVersion
  p12SourceRevision / preBatchExposureRevision / preBatchDigest
  eligibleReleaseCount / eligibleReleaseSetRootDigest
  memberChunkArchiveId / memberChunkCount / firstChunkDigest / finalChunkDigest / orderedChunkChainDigest
  memberChunks: immutable chunks max 100 rows, each exact release/studio/genre/contribution once;
                after commit the same row binds assessmentId and P07 result/input receipt ref
  genreWindowAggregates: complete maximum 64 aggregate rows; each has aggregateId/value/version,
                         contributorCount/rootDigest and bounded/paged contributor-index ref
  state: committed                // frozen exists only inside the uncommitted candidate
  batchCommitReceiptId: durable idempotency receipt
```

### D.3 Market assessment

```text
MarketAssessment
  assessmentId: immutable ID from the complete taken-set allocator
  p15DomainSequence: monotonic P15-only history order
  phaseId / phaseOrdinal / phaseOrderVersion: scheduler-owned append-time facts
  batchId: exact frozen release batch
  subjectFilmId / subjectStudioId
  effectiveWeek
  definitionVersion
  inputSnapshot: pre-batch revision + batch member-set digest + exact genre/window aggregate ID/digest
                 + subject contribution subtracted for self-exclusion
  outputPressure / consequence
  sourceExposureCount / sourceExposureSetDigest / sourceAuditPageRef
  reasonFacts: typed codes + source IDs + values, hard maximum 5
  completeness / provenance
```

The input snapshot prevents later decay or retitling from rewriting the released film's explanation.
The complete batch membership, assessment IDs, and P07 receipt refs are stored once in the chunked
batch manifest—never repeated as “all other releases” on every assessment. Aggregate contributors are
also indexed once per bounded genre/window aggregate. An assessment keeps only its batch/aggregate
digests, subject self-contribution, counts, and at most five causal source refs; its audit route pages
the frozen batch/aggregate indexes. This keeps persisted identity references O(batch members + active
contributors), not O(batch²), including the 512-release hostile fixture.

### D.4 Ranking snapshot — P15A.2 only

```text
PowerRankingSnapshot
  snapshotId / rankingDefinitionVersion
  p15DomainSequence
  phaseId / phaseOrdinal / phaseOrderVersion
  effectiveWeek / trailingWindowWeeks: 52
  cohortDefinition / eligibleStudioIds
  laneDefinition: P07 filmOutcomeMomentum + P08 recognitionMomentum + P12 deliveryMomentum
  rows: studioId, three public 0..10 lane values, unweighted points 0..30,
        dense rank, priorComparableRank, movementState, reasonFacts
  tieRule / completeness
```

Do not store an unexplained blended `powerScore` merely to sort rows. If a source metric is used, its
meaning and version are part of the definition; TypeScript emits the authoritative order.

### D.5 Corporate condition and P12 transition reference — P15B only

```text
CorporateConditionAssessment
  studioId
  condition / conditionSinceWeek       // stable | warning | distress | recovery
  policyVersion
  causeFacts: typed refs to P11/P12 truth
  forecastBoundary / remedyCapabilities
  p12OperatingStateRef
  activeTransitionRequestId: optional

CorporateConditionEvent
  eventId / studioId / from / to / effectiveWeek
  p15DomainSequence
  phaseId / phaseOrdinal / phaseOrderVersion
  policyVersion / causeFacts / remedyRefs / p12TransitionRefs / publicDisclosure

StudioOperatingTransitionParticipantManifest
  manifestId / p12TransitionRequestId / p12TransitionRequestVersion / requestDigest
  studioId / requestedOperatingState / effectiveWeek
  policyVersion / sourceGameStateRevision / participantSetVersion
  p13TechnologyBaselineOrWorkDispositionReceipt
  p10PersonContractParticipantManifestRef
  p11FinanceSettlementOrInitializationReceipt
  p12RegistryProjectCapacityRosterEmployerExclusivityIntervalCandidateReceipt
  p14MarketLifecycleCommitmentDispositionOrInitializationReceipt
  validationDigest / state: candidate | committed
  p12RegistryTransitionReceipt: absent in candidate; exact receipt in committed manifest
```

The P10 reference is one upstream participant manifest/receipt, not an embedded roster-sized array.
Before P15B may start, P10 must author a contract bound to the exact P12 request ID/version/digest,
P10 source/rules versions, affected-set count/root digest, and immutable chunks of at most 100 typed
person/contract/assignment disposition-or-initialization rows. Its candidate/committed/refused result
must be discriminated and idempotent, and every affected `PersonId` must occur exactly once. P15 stores
only the exact manifest ID/version/digest reference and verifies it inside the all-owner candidate.
P15 does not redesign P10 or copy its people/contracts; absence of this bounded upstream contract is a
P15B stop condition.

The same completeness law applies to **every** variable-size participant. A fixed-size P11 or P12
receipt is acceptable only if its schema declares a true hard maximum, exact affected count/subjects,
and content digest. Otherwise P11 finance/obligations and P12 registry/projects/capacity/roster/
current-employer/exclusivity/intervals each require one exact request/source/rules-bound root manifest,
affected-set count/root digest, first/final/ordered chunk-chain digests, and immutable typed chunks of at
most 100 rows with every affected subject exactly once. P15 stores/verifies only exact manifest ID/
version/digest refs and does not redesign those packages. Missing bounded P11 or P12 contracts stop
P15B just as a missing P10 contract does.

Every P13/P10/P11/P12/P14 participant field is an exact receipt or manifest ID/version/digest
reference to the same P12 transition request ID/version/body digest. `validationDigest` covers that
complete normalized reference set; a merely matching request ID with a different body refuses.
The `candidate` is off-state preflight material and a refusal is diagnostic: neither appends P15 or
participant-domain facts. Only `committed` persists, atomically with every owner result and the exact
P12 registry-transition receipt.

P12 is the sole owner of the studio registry's durable `active | dormant | closed` fact, entry week,
and identity. P15B may assess conditions and issue an idempotent, policy-backed transition request;
only P12 validates and commits a registry transition. P15 persists the request/receipt reference, not
a mirrored operating state.

### D.6 Legacy finale — P15C only

```text
LegacyFinaleSnapshot
  legacySnapshotId / studioId / triggerWeek
  p15DomainSequence
  phaseId / phaseOrdinal / phaseOrderVersion
  interpretationVersion
  sourceManifest: per-domain revision + ordering kind/version + source-order high-watermark + recordedFromWeek + completeness
  usedEvidenceIds: only stable IDs actually cited by an interpretation, bounded per archetype/lens
  releasedFilmCatalogLensRef: P07/P10/P12 film/release/result identities; no rights ownership
  archetypes: complete authored definition set maximum 8; archetypeId + qualifyingRefs + contraryRefs + confidence/completeness
  unresolvedDomains
  postFinaleMode: absent until Owner decision is committed

SourceDomainOrderingManifestEntry
  domainId / sourceRevision
  orderingKind: native_sequence | owner_archive_adapter
  orderingVersion / sourceOrderHighWatermark
  recordedFromWeek / completeness / orderPrecision
  phaseOrderLineageRef: oldestVersion / newestVersion / lineageDigest
```

### D.7 Exact identity requirements and allocator law

- explicit taken-set lookup across current and archived roots;
- deterministic keyspace or monotonic allocator whose state is persisted;
- no array-position, display-name, rank, or week-only identity;
- collision and duplicate-load refusal;
- all new IDs included in complete save validators/walkers;
- stable aliases only through versioned migration tables.

---

## E. Proposed projection and DTO shapes

DTOs contain ready-to-present public truth and explicit capabilities. They do not expose raw rival
state or ask Unity to calculate.

### E.1 Shared Market summary

```text
SharedMarketSummaryDto
  schemaVersion / projectionVersion / snapshotRevision / asOfP15DomainSequence
  phaseOrderLineageRef                         // one oldest/newest/digest; rows carry exact version
  marketDefinitionVersion / effectiveWeek
  recordedFromWeek / historyCompleteness
  requestedGenreLimit / appliedGenreLimit     // default 16, hard maximum 64
  genreRows[]:
    genreId / displayName
    currentPressure / direction / recoveryWeek
    activeExposureCount
    topReasonFacts[]                           // hard maximum 5 per genre
    reasonFactCount / reasonsTruncated / openGenreReasonPageCapability
  upcomingReleaseCount
  isGenreListTruncated / openAllGenresCapability
  canOpenMarket
```

### E.2 Genre detail page

```text
SharedMarketGenrePageDto
  querySnapshotId / asOfP15DomainSequence
  phaseOrderLineageRef                         // bounded reference; no version array
  sourceOrderingManifest[]                    // hard maximum 16 domains
  genre identity + formula/window explanation
  activeExposurePage:
    requestedPageSize / appliedPageSize / rows[] // default 25, hard maximum 100
    nextCursor / hasMore
    row: exposureId / filmId / studioId / public title/studio name / release week /
         contribution / decay state / source capability
  upcomingKnownReleasePage:
    requestedPageSize / appliedPageSize / rows[] // default 25, hard maximum 50
    nextCursor / hasMore
  recentAssessmentPage:
    requestedPageSize / appliedPageSize / rows[] // default 25, hard maximum 50
    nextCursor / hasMore
  incompleteHistoryNotice
```

### E.3 Film market explanation

```text
FilmMarketAssessmentDto
  assessmentId / marketReleaseBatchId / filmId / studioId / effectiveWeek
  formula label + version + window
  pressure direction/value and bounded consequence
  reasonRows[]: localized code inputs + source entity links     // hard maximum 5
  sourceExposureLinks[]                                        // hard maximum 20; paged route if more
  reasonCount / reasonsTruncated / openReasonPageCapability
  sourceExposureCount / sourceExposuresTruncated / openSourceExposurePageCapability
  provenance / history completeness
```

### E.4 Industry/corporate row — future P15B

```text
IndustryStudioStatusDto
  studioId / public identity
  status / sinceWeek / publicReasonFacts       // hard maximum 5
  publicReasonCount / reasonsTruncated / openReasonPageCapability
  nextPublicBoundary
  openProfileCapability / openHistoryCapability
  no private cash, hidden strategy, or unsupported forecast
```

### E.5 Power Ranking row — future P15A.2

```text
PowerRankingPageDto
  snapshotId / definitionVersion / effectiveWeek / trailingWindow / cohortLabel
  requestedPageSize / appliedPageSize          // default 25, hard maximum 100
  rows[]: studioId, three public lane values, rankingPoints, dense rank, priorRank, movement,
          completeness, reasons (maximum 5), reasonCount,
          reasonsTruncated, openReasonPageCapability, openProfileCapability
  nextCursor / hasMore / priorSnapshotCapability
  explicit Standing-and-History distinction
```

### E.6 Finale dossier — future P15C

```text
LegacyDossierDto
  legacySnapshotId / triggerWeek / interpretationVersion
  sourceHighWatermarkManifest[]                // maximum 16 domains; revision/order/high-watermark + phase-lineage ref
  releasedFilmCatalogLens: exact film/release/result refs and paged route; never legal IP ownership
  archetypeCards[]:                            // complete authored set; hard maximum 8
    archetypeId / title / concise interpretation
    qualifyingEvidenceLinks[] / contraryEvidenceLinks[] // maximum 12 each
    qualifyingCount / contraryCount / truncated flags / paged evidence capabilities
    completenessNotice
  archetypeCount / archetypesTruncated: false  // authoring rejects a ninth definition
  lensSummaries[] / lensCount / truncated / paged-route capabilities   // hard maximum 12
  unresolvedDomains[] / unresolvedDomainCount / truncated              // hard maximum 16
  postFinaleModeOptions only after Owner law
```

### E.7 DTO rules

- All numbers arrive labeled with basis/window/version.
- Every source action carries stable semantic target IDs, not URLs assembled by the client.
- P15 allocates only `p15DomainSequence`; the accepted scheduler supplies immutable append-time
  `phaseId`, `phaseOrdinal`, and `phaseOrderVersion`. Cursors bind subject/filter/requested and applied
  page size/schema-generation/`asOfP15DomainSequence`, one phase-order lineage reference, and stable
  `(effectiveWeek, phaseOrdinal, 'P15', p15DomainSequence, eventId)` order. A merged industry or finale
  query freezes each included domain's owner, source revision, ordering kind/version, and source-order
  high-watermark, then merges by `(effectiveWeek, phaseOrdinal, domainId, sourceOrderOrdinal,
  eventId)`. P15 native rows use `p15DomainSequence`. A P07/P08/P10/P11/P12 source without native sequence
  must supply an owner-authored idempotent metadata-only archive-order adapter bound to its persisted
  source order/stable IDs; P15 never mints it. If the owner cannot prove stable order, P15 excludes the
  domain and names the incomplete evidence lens. A later
  phase catalogue cannot remap old facts. The source manifest has a hard maximum of 16 domains; each
  row/page contains its exact phase version and one bounded lineage reference. A source/lineage digest
  mismatch refuses as incompatible history rather than truncating provenance. Legacy rows with no phase evidence use the fixed
  `legacy_phase_unspecified` bucket and `phasePrecision: not_recorded`, never current-rule inference. Later
  appends do not invalidate or reorder the bound page; only an explicitly reported incompatible
  schema/compaction generation can retire it.
- A small page must cost O(page size + indexed lookup), not O(full save).
- Every list that may omit otherwise eligible rows reports its requested/applied limit or count,
  truncation, and a paged route where more rows exist. A fixed complete schema list must fit its hard
  cap or fail authoring/validation; it cannot silently truncate.
  The finale manifest stores domain revisions/high-watermarks plus only evidence IDs actually used;
  it never embeds every historical ID.
- No raw formulas, strategy weights, hidden cash, hidden potential, seeds, or internal object graphs.
- No rank in P15A.1 DTOs—not even an unused nullable field.
- No UI-seen state in authoritative save.

---

## F. No-hidden-data and explainability law

### F.1 Player-safe public inputs

- canonical film/studio identity;
- disclosed release week/window and genre/segment;
- public reach/exposure input if the formula uses it;
- current market pressure and recovery horizon;
- assessment formula/version label;
- one to three top reason facts with exact source IDs;
- incomplete-history and disclosure boundaries.

### F.2 Private inputs that remain private

- unrevealed rival slate and strategy weights;
- private rival cash, exact obligations, salaries, bids, or internal candidate rankings;
- RNG state and seeds;
- hidden talent potential/skill;
- unpublished technology research state;
- rejected corporate/release candidates and debug scores.

### F.3 Explainability acceptance

A player must be able to answer:

1. What changed?
2. Over what exact time window?
3. Which known films/studios contributed most?
4. Which formula/version produced the assessment?
5. When will pressure next decay?
6. What lawful response exists, if any?

The UI may localize typed reasons. It may not invent causality, reconstruct a score, or transform
private inputs into suggestive prose.

---

## G. Persistence, retention, and migration

### G.1 Persist / derive / discard matrix

| Fact | Treatment | Reason |
|---|---|---|
| market definition/version | **Persist catalogue/reference** | exact replay and explanation |
| next P15 domain sequence | **Persist monotonic allocator state** | append-stable P15 ordering; never reused or treated as global |
| scheduler phase ID/ordinal/version on each new P15 event | **Persist immutable append-time facts** | phase-catalogue upgrades cannot reorder old same-week history |
| current active exposures | **Persist or deterministically rebuild once with proof** | save/load mid-window |
| committed release batch and all-or-none receipt | **Persist immutable after one candidate commit; no authoritative half-committed batch** | same-week neutrality, P07/P15 replay and assessment provenance |
| release assessment | **Persist immutable** | frozen P07 consequence/provenance |
| current pressure aggregate | **Persist/checkpoint or derive from active bounded index** | fast weekly work; verify reconciliation |
| weekly zero-change pressure | **Discard** | no history value |
| monthly genre aggregate | **Persist bounded summary** | century graph without raw weekly log |
| P12 known-release schedule/disclosure changes | **Foreign P12 facts; P15 stores exact revision/reference only where an assessment needs provenance** | avoid duplicate industry calendar/history |
| rejected rival release candidates | **Discard** | deliberation/debug only |
| rank snapshot | **Persist P15A.2** | dated movement/history |
| P15 corporate-condition transition and P12 transition request/receipt reference | **Persist P15B when approved** | explainable assessment/orchestration without duplicating P12 operating state |
| active/dormant/closed studio state, entrant `StudioId`, entry week | **Foreign P12 fact only** | one registry and one identity owner |
| routine warning calculation | **Derive** | current state only unless transition occurs |
| canonical studio entry/active/dormant/closed registry event | **Foreign P12 fact only** | one identity/state/history authority |
| entrant eligibility, corporate-condition event, transition request and P12 receipt reference | **Persist P15B only when that slice exists** | explain orchestration without duplicating P12 registry events |
| complete operating-transition participant manifest | **Persist P15B only after the one candidate commits** | proves P13/P10/P11/P12/P14 initialization or settlement participated; no half-manifest is authoritative |
| finale source manifest/archetypes | **Persist P15C** | exact 2040 interpretation replay |
| generated finale prose/layout | **Derive** | localization/presentation, not truth |
| filters, scroll, hover, seen-state | **Presentation only** | never authoritative save |

### G.2 Migration sketch

1. Validate source save using its historical exact-key schema.
2. Copy unchanged historical leaves; add empty P15 roots additively.
3. Set `marketRecordedFromWeek` to migration/current authoritative week.
4. Set ranking/corporate/Legacy history completeness to `not recorded before migration`.
5. Do not infer exposures from old film dates unless a separately approved migration policy names
   the exact active-run boundary; default is grandfathered/no retroactive pressure.
6. Build empty/bounded indexes deterministically from only supported forward facts.
7. Validate every referenced ID and taken-set.
8. Serialize once to current canonical form; second migration is a no-op.
9. Preserve exact warning notices in projection, not as fabricated events.
10. Preserve any recorded phase ID/ordinal/version exactly. Index a legacy row with no evidence only
    as `legacy_phase_unspecified` / `phasePrecision: not_recorded`; do not backfill current tick order.
11. For an upstream domain without native sequence, accept only its owner-authored metadata archive
    index (source revision, stable ID, source-order ordinal, ordering version/precision, checksum,
    high-watermark). Rebuild must be idempotent; otherwise exclude the domain as incomplete.

### G.3 Migration refusal cases

- duplicate assessment/exposure/studio/film ID;
- assessment references absent or mismatched owner identity;
- impossible active window or formula version;
- closed studio marked active without a transition;
- legacy manifest references missing entities without a completeness marker;
- unknown future version;
- cursor/query state found in authoritative save;
- participant manifest missing a required owner, containing mismatched source revisions, or claiming a
  P12 transition without its exact registry receipt;
- P10 participant reference missing its P12-request/source/rules binding, affected-set count/root
  digest, bounded immutable chunks, or exact one-row-per-person proof; and
- any P11/P12 variable-size participant using an opaque receipt without a declared fixed maximum or
  without request/source/rules binding, affected count/root/chain digests, bounded chunks, and exact-once subjects; and
- a recorded phase ordinal absent from/mismatched with its immutable phase-order version.

Refusal never silently resets, truncates, substitutes another ID, or regenerates history.

### G.4 Catalogue/formula change

- New formulas get new immutable versions and `effectiveFromWeek`.
- Old assessments retain their original version and values.
- Active exposures crossing a version boundary require an explicit transition policy and fixture.
- A content rename changes presentation; stable genre/segment IDs remain.
- Removed IDs use explicit aliases/retirement rules; never “closest match.”

---

## H. Likely current and future files

Exact names are recommendations for reconnaissance, not authorization.

| Need | Current/future seam | Classification | Builder rule |
|---|---|---|---|
| common identities/rivals | future P12 roots; current `src/core/types.ts` singleton | **UPSTREAM PACKAGE DEPENDENCY** | do not begin P15 until real |
| market placeholder | `src/core/types.ts::MarketState`, `CompetingRelease`; `src/core/worldgen.ts` | **INERT PLACEHOLDER** | do not widen in place; add versioned root after save audit |
| reception boundary | `src/core/reception.ts`, `src/core/theatrical.ts`, result/tick path | **EXISTING / P07 OWNED** | one prospective input seam; no duplicate formula |
| film library/IP/rights ownership | current `FilmResult` and production records identify works/outcomes but do not model a library, IP rights, chain of title, or ownership transfers | **DO NOT TOUCH / P16+ ADDITIVE ROOT NEEDED** | P15 retains immutable source IDs/history only; acquisition, co-production, library ownership, and rights transfer remain absent |
| Standing | `src/core/standing.ts` | **EXISTING / P08 OWNED** | no P15 mutation outside established inputs |
| finance | `src/core/ledger.ts`, `economy.ts`, `economyView.ts` | **EXISTING / P11 OWNED** | P15B reads typed facts; no private disclosure leak |
| player calendar | `src/core/studioCalendar.ts` | **EXISTING** | leave as player planner |
| cross-domain phase/archive order | current tick and heterogeneous P07/P08/P10/P11/P12 event arrays/IDs | **UPSTREAM SHARED-CORE/OWNER DEPENDENCY** | consume sealed phase catalogue and owner-native/order-adapter manifests; P13/P14/P15 use native new sequences, and any unprovable legacy finance/history domain is excluded honestly |
| industry release/disclosure facts | final P12 schedule/public-event roots; current accepted base has no such authority | **UPSTREAM PACKAGE DEPENDENCY** | consume exact P12 IDs/revisions; do not create a P15 `industryCalendar` copy |
| market law | likely `src/core/sharedMarket.ts` | **ADDITIVE ROOT NEEDED** | pure/versioned rule and active-index reducer |
| market types | likely additive P15 types/root file | **ADDITIVE ROOT NEEDED** | avoid widening frozen recursive leaves |
| typed events | P12 industry event root or likely `industryEvents.ts` | **UPSTREAM / EXTEND** | facts before prose |
| rankings | future `powerRanking.ts` | **DO NOT CREATE in P15A.1** | separate P15A.2 charter |
| corporate fate | future `corporateFate.ts` | **DO NOT CREATE in P15A.1** | separate Owner-approved P15B charter |
| legacy | future `studioLegacy.ts` | **DO NOT CREATE in P15A.1** | separate P15C charter |
| save/migration | `src/core/save.ts` | **FINAL CHANGED-PATH REFRESH REQUIRED** | exact next save generation and all ID walkers |
| core tests | current `src/core/*.test.ts`, harness conventions | **EXISTING PATTERN** | add pure/symmetry/migration/endurance suites later |
| query projection | `ui/src/engine/adapter.ts` or future core read models | **ADDITIVE ROOT NEEDED** | bounded page, server/core ordering |
| browser surface | future `SharedMarket` screen | **ADDITIVE PRESENTATION NEEDED** | reference behavior only; no duplicate law |
| bridge schema | `bridge/schema/bridge-schema.ts`, JSON schema, generated DTOs | **FINAL CHANGED-PATH REFRESH REQUIRED** | atomic TS/validator/generated change only if authorized |
| bridge session | `bridge/session.ts::snapshotFor`, `availableIntents` | **FINAL CHANGED-PATH REFRESH REQUIRED** | query route/cache by revision; no repeated whole-save work |
| Unity/Fable | accepted client repo only after refresh | **DO NOT TOUCH now** | presentation only; no calculations |
| P05/P06 | active/unsealed/provisional paths | **DO NOT TOUCH** | read after seal; never recon against imagined final code |

### H.1 Changed-path reconnaissance output required later

For every proposed path, the builder records: exact accepted SHA, symbol, current responsibility,
owner package, frozen-save recurrence, proposed additive/extension action, migration impact, bridge
impact, tests, performance risk, and whether the path changed since this report.

---

## I. Worker and authority ownership

“Worker” means an execution owner, not necessarily a browser Worker thread.

| Responsibility | Owner | May do | Must not do |
|---|---|---|---|
| authoritative weekly market update | TypeScript simulation core | freeze complete due-release batch, calculate all assessments from one pre-batch snapshot, atomically activate exposures, decay bounded indexes | inspect UI state/wall clock or activate one batch member early |
| release-batch candidate and commit | one serialized TypeScript `GameState` transaction coordinating P07/P15 owners | preflight every P15 assessment and P07 prospective result/input, validate all refs/invariants, commit all results/history/assessments/exposures/receipt once | sequential partial P07 applications, exposure activation before all results validate, or client retry duplication |
| reception consequence | P07-owned calculation inside that candidate | calculate/apply exact prospective versioned input once and return a receipt reference | recalculate an old run or commit outside the batch transaction |
| rival release input | P12 compact business simulation | produce conserved release with owner/date/genre/public state | spawn decorative rated films |
| corporate condition/remedy assessment | future P15B TypeScript reducer | assess shared pre-terminal guards and equivalent remedy capabilities; issue idempotent transition requests | write or mirror P12 active/dormant/closed registry state; give either side a cheaper/faster/unique remedy |
| operating-transition participant coordinator | one serialized future P15B/P12 `GameState` candidate | collect and validate exact P13/P10/P11/P12/P14 participant receipts, then commit every owner fact plus P12 registry receipt once | commit participant receipts sequentially, omit technology/open-case disposition, or expose half-transition state |
| studio operating-state transition | P12 registry authority inside that candidate | validate/commit active↔dormant and any approved rival closure; return immutable receipt after every participant validates | let P15 or Unity mutate registry identity/state |
| entrant eligibility/request | future P15B orchestration | determine authored eligibility and submit one creation request | mint `StudioId` or initialize cash/projects/capacity/roster |
| entrant registration/initialization | P12 registry/business/employer authority with P13/P11/P10/P14 participants | atomically mint/register studio, projects/capacity/roster, current employer/exclusivity/intervals, and conserved initial state; P13 writes entry-week standards only | accept partial state, omit P13/P12 employer truth, or fabricate prehistory/research/firsts |
| market projection/query | TypeScript read-model layer | filter/page/order/localization codes from current revision | mutate or evaluate private decisions |
| bridge/session | bridge authority | validate revision/cursor, cache projection/digest per revision, carry DTOs | infer market/rank/closure |
| Unity/Fable | client presentation | render, navigate, request page, submit exact current intent | calculate, reorder authoritative rank, fill missing facts |
| endurance harness | TypeScript test/harness process | run 6,240 weeks, save/load/migrate, sample timing/storage/invariants | become production simulation law |
| finale interpreter | future TypeScript P15C reducer | consume frozen source manifest and versioned archetype rules | generate unsupported biography or mutate source history |

No LLM, network service, wall clock, `Math.random`, filesystem order, locale sort, or client frame
timing may influence authoritative market, corporate, rank, or finale output.

---

## J. Implementation waves

### Wave 0 — post-upstream reconnaissance

- confirm P12 real studio identity and conserved rival-release authority;
- confirm accepted P07 release/result boundary;
- inspect final P05/P06 changed paths without writing;
- audit save generation, ID walkers, RNG streams, bridge projection/hash costs;
- confirm the scheduler-owned immutable phase catalogue and fixed legacy unknown-phase policy;
- select exact P15A.1 formula/window with Owner;
- produce implementation charter; stop if any prerequisite is absent.

### Wave 1 — pure P15A.1 law and fixtures

- one definition/version;
- one genre and bounded release window;
- active exposure/decay reducer;
- frozen same-week batch, aggregate/self-exclusion law, atomic assessment/reason production;
- ownership/ID-swap symmetry, batch-order reversal, and no-early-activation proofs;
- no UI, bridge, rank, or corporate code yet.

Run the full 6,240-week headless expected/hostile fixtures before Wave 2; seal or reject the law.

### Wave 2 — persistence and integration

- additive root/save generation/migration;
- P12 player+rival fixture integration;
- P07 one-time prospective consequence seam;
- P08 history reference without Standing duplication;
- replay, duplicate prevention, old-save honesty.

Rerun the 6,240-week fixtures with P07/P08/P12 and persistence integrations before Wave 3.

### Wave 3 — bounded query and world/workspace presentation

- summary/detail/assessment DTOs;
- revision-bound cursor route and per-revision projection/hash cache;
- lot pulse/local route, retained Shared Market workspace, exact Back;
- responsive/controller/keyboard/accessibility/error states;
- observer-neutral and no-authority-in-client proof.

### Wave 4 — endurance and Owner gate

- normal and hostile 6,240-week harness;
- measured storage/load/tick/projection/page slopes;
- automation, hostile review, fresh source review;
- exact Owner playtest and KEEP/REVISE/REJECT;
- stop. Do not begin P15A.2.

### Future separate charters

- P15A.2 ranking;
- P15B corporate fate;
- P15C finale;
- P16+ ownership transactions.

---

## K. Test fixtures

### K.1 P15A.1 minimum fixtures

| Fixture | Setup | Required assertion |
|---|---|---|
| `market-one-player-one-rival` | two studios, same genre/window, equal inputs | equal formula path; source reasons name both |
| `market-owner-swap` | swap player/rival IDs and ownership only | normalized outputs swap; no `isPlayer` branch |
| `market-order-reversal` | reverse studio/film/enumeration order before due-set freeze | identical batch membership, normalized assessments, and canonical committed bytes |
| `market-same-week-batch` | exact simultaneous releases | both calculate from one pre-batch snapshot plus the other batch member; neither activates early |
| `market-large-batch-linear-storage` | 512 same-week releases with dense overlap | one exact-once member/chunk manifest and bounded aggregates; assessments contain no repeated co-batch list; persisted IDs/bytes grow linearly within the measured envelope |
| `market-batch-manifest-corrupt` | missing/duplicate member, wrong count/root/ordered-chain digest, chunk 101, or assessment/P07 receipt mismatch | whole batch candidate refuses; no result, assessment, exposure, event, or partial manifest persists |
| `market-second-p07-failure` | first subject validates; second P07 application fails | authoritative state contains no P07 result, assessment, history reference, exposure, event, or debit from either subject |
| `market-batch-duplicate-retry` | committed batch delivered twice | second delivery returns the same batch receipt; no duplicated P07/P15 fact |
| `market-batch-save-replay` | save immediately before due week, run/commit, reload and replay | identical canonical committed batch, P07 receipts/results, assessments, exposures, and terminal digest |
| `market-id-swap` | swap the two film IDs while preserving all nonidentity facts | normalized subject outputs swap exactly; commit order cannot change formula inputs |
| `market-different-genre` | move rival film outside genre | no contribution; typed ineligibility |
| `market-cancel-before-release` | announced rival film cancels | no phantom exposure/assessment |
| `market-delay-across-window` | player moves release | preview changes; no history mutation |
| `market-decay-boundaries` | active exposure at every stage | exact half-open dates and no duplicate decay |
| `market-undisclosed-project` | private rival project exists | no title/fact leak before legal disclosure |
| `market-stale-intent` | state changes after preview | refusal, refresh, no auto-resubmit |
| `market-old-save` | last pre-P15 save | empty history + recorded-from notice; no backfill |
| `market-inflight-save` | save during active exposure | next boundary and result identical after reload |
| `market-duplicate-command` | replay release/event command | one assessment/effect only |
| `market-missing-source` | broken source reference | fail closed; no guessed film/studio |
| `market-observer-neutral` | repeated queries/navigation | save/RNG/future result unchanged |
| `market-phase-catalogue-upgrade` | page same-week P15 and upstream history, then install a compatible scheduler catalogue with one new reserved phase | old phase facts, order, cursor continuation, and replay remain identical; legacy unknown-phase rows stay noncausal |
| `market-legacy-order-adapter` | a P08/P10 source has stable IDs/persisted order but no native sequence | owner adapter rebuild is idempotent and preserves cursor/high-watermark; missing proof excludes the lens with explicit incompleteness, never a P15-minted order |

### K.2 Integration fixtures

- P07 Film Result remains byte/fact stable after later decay.
- P08 Standing channels retain original meanings and no market field aliases them.
- P08 History links to the assessment but does not recompute it.
- P12 rival cannot release without conserved project/owner inputs.
- P13 technology and P14 talent facts may appear as later reasons only when their owning package
  publishes a public typed fact; P15A.1 does not require them.
- P11 cash remains unchanged by P15A.1 except through existing P07 revenue law.

### K.3 Explicit fixture exclusion

P15A.1 contains no dormancy, closure, entrant, ranking, transaction, or finale fixture—even as a
“contract-only” scaffold. Those future charters must define and own their own fixtures.

### K.4 Required future P15B fixtures — not P15A.1 acceptance

- `corporate-remedy-owner-swap`: swap player/rival roles while facts stay fixed; the same typed remedy
  capability families, eligibility, conserved costs, timing, and effects remain legal. Only UI versus
  deterministic P12 selection differs.
- `corporate-no-parallel-registry`: every dormancy/re-entry/approved rival-closure outcome has one P12
  transition receipt and no P15 active/dormant/closed field.
- `entrant-no-partial-mint`: duplicate/failing P15 eligibility requests create at most one P12 `StudioId`
  and never partial P13 baseline, finance, project, capacity, roster, current-employer/exclusivity/
  interval, film, award, or pre-entry history.
- `entrant-after-several-standards`: P12 activates a late studio only with the complete participant
  manifest; P13 records current entry-week standards and no retroactive research/adoption/use first,
  while P10/P11/P12/P14 initialize only their owned entry-week facts.
- `entrant-duplicate-request`: duplicate delivery returns the same manifest/P12 transition receipt and
  cannot mint a second `StudioId`, P10 person, P13 baseline, P11 endowment, P12 project, or P14 row.
- `dormancy-during-adoption`: an active P13 adoption and its P09/P11 reservations receive one typed P13
  disposition inside the all-owner candidate; injected failure leaves every root and P12 state unchanged.
- `dormancy-with-open-offers`: P14 supplies a complete typed case/proposal/commitment disposition;
  omission or failure blocks the P12 transition and preserves all open facts at the source revision.
- `participant-variable-set-completeness`: P11 obligations and P12 project/capacity/roster/employer/
  exclusivity/interval sets each use a fixed bounded receipt or count/root/chain-digest manifest with
  chunks of at most 100 and exact-once subjects; one missing/duplicate row, stale request/source/rules
  version, wrong chain, or oversized chunk rejects the whole candidate with no participant write.

---

## L. Long-run and endurance harness

### L.1 Required horizons

- week 0 / founding boundary;
- early 1920s;
- sound-era transition vicinity;
- mid-century rival-entry period;
- 2005 original reward horizon;
- late 2039;
- exact 2040 finale boundary contract;
- 6,240-week terminal run.

### L.2 Normal planning fixture

Use 16 studios, 20,000 films over the campaign, 500 simultaneously public/active release records,
250,000 material cross-package history rows, bounded genres, and a maximum same-week batch of 32.
Only P15A.1 roots are active. Storage reporting must measure actual encoded total/P15 bytes rather
than carry a guessed raw-JSON allowance into acceptance.

### L.3 Hostile fixture

- 64 studios;
- 100,000 films;
- 20,000 people referenced by upstream history;
- 1,000,000 material/history rows across packages;
- 4,000 simultaneously public/active release records;
- maximum same-week batch of 512 releases with dense genre overlap;
- repeated cancellation/delay at boundaries;
- duplicate command injection;
- reversed iteration order;
- save/load every 13, 52, and 520 weeks in separate runs;
- migration from early/mid/late historical save versions;
- repeated bounded archive queries while simulation advances.

### L.4 Complexity and storage gates

- weekly market cost proportional to active exposures + due events + batch members;
- no studios × all-film-history scan;
- no pairwise film overlap scan over complete history or same-week batch; build bounded
  genre/window aggregates once and subtract the subject;
- no per-assessment copy of all co-batch or contributing-exposure IDs; one chunked batch/member
  manifest and bounded aggregate contributor indexes own them, while assessment audit routes page by
  digest-bound references;
- no full-save serialization/hash for each page/view;
- no unbounded DTO list;
- cursor query cost proportional to page size + indexed lookup;
- no weekly rank persistence;
- no duplicate batch, assessment, exposure, or P15A.1 market event;
- stable ID taken-set invariant across active and archived entities;
- exact cross-studio uniqueness for current employer/owner where applicable.

### L.5 Measurements

Record at 25%, 50%, 75%, and 100% horizon:

- save bytes and incremental P15 bytes;
- import/migration/export duration;
- median/p95/p99 weekly tick and allocation;
- crowded release-boundary cost;
- summary and page projection duration;
- digest/cache cost per authoritative revision;
- event/assessment/summary/index counts;
- peak active exposures and due-event queue;
- terminal replay/digest comparison.

No acceptance threshold is invented here. The implementation charter must establish target hardware,
budgets, and regression ceilings before code.

### L.6 Endurance invariants

1. Same seed/actions produce byte-identical authoritative terminal state.
2. Observer/query/client behavior is neutral.
3. No stable ID duplicates or changes meaning.
4. A film has one creator/release owner fact and one assessment per governed boundary/version.
5. P12's one-current-employer and studio/release-owner invariants remain valid; P15 stores references, not parallel ownership.
6. Rival projects/cash/capacity remain conserved under P12/P11 law.
7. Old saves retain honest `not recorded` boundaries.
8. No past Film Result changes because current pressure/rank changes.
9. Every active/dormant/closed transition with P15B participation has exactly one complete manifest,
  one P12 registry receipt, all required P13/P10/P11/P12/P14 receipts—including P12 roster/employer/
  exclusivity/interval settlement—and no participant-only commit; every variable-size participant is
  complete through a hard-bounded fixed receipt or count/root/chain-digest chunks of at most 100.
10. Every P15 event has one monotonic P15 domain sequence; merged views retain source-owner sequences
    and frozen per-domain high-watermarks.
11. Each committed release batch has one exact-once, count/root/ordered-chain-valid member manifest;
    assessments carry no repeated all-other-member/source list and persisted batch identity bytes grow
    linearly across the 32- and 512-release fixtures.

---

## M. World and UI anatomy

### M.1 Lot-level pulse

At management zoom, a restrained Industry pulse may show:

```text
SHARED MARKET
Comedy pressure: Rising
2 known releases in the next governed window
[Open Shared Market]
```

It does not show a mystery score, rank, private rival plan, or action that changes a release.

### M.2 Shared Market workspace

Wide layout:

```text
┌ retained lot/context ┐┌ SHARED MARKET — Week 742 ──────────────────────────┐
│ exact camera/selection││ [Genre] [Window] [Known releases] [History]        │
│ remains mounted       ││ COMEDY — pressure rising; recovery starts Week 748│
│                       ││ Why: Harbor Laughs (Monarch), Tin Street (You)     │
│                       ││ Known releases / active exposure / recent results  │
│                       ││ [Open film] [Formula & window] [Next page]          │
└───────────────────────┘└────────────────────────────────────────────────────┘
```

Information order:

1. exact effective week and market definition/version;
2. selected genre/segment and direction;
3. current pressure/consequence in player-safe language;
4. recovery/next decay boundary;
5. known source releases and studios;
6. typed reasons;
7. upcoming known releases;
8. paged history and formula glossary;
9. incomplete-history notice.

### M.3 Film explanation drawer

- film/studio identity;
- release week/genre/window;
- assessment version and frozen consequence;
- ordered reason facts with source links;
- `Recorded from Week N` where applicable;
- route to P07 Film Result and P12 studio profile;
- no live recomputation or unsupported advice.

### M.4 Future Power Ranking

Separate workspace/lens only after P15A.2. It shows date, cohort, trailing window, rank, prior
comparable rank, movement state, reasons, and prior snapshots. A persistent banner states:

> Power Ranking is recent comparative momentum. Studio Standing and Studio History are separate.

### M.5 Future P15B corporate view

Condition and P12 operating state are always text plus icon and effective date, visibly distinguished.
Warning/distress views name public causes, forecast boundary, and legitimate remedies. They do not
expose private rival accounting or imply an acquisition action. Player and rivals use the same pre-
terminal predicates and equivalent remedy capabilities; only human-versus-policy selection differs.
P12's terminal asymmetry remains visible: rival closure needs a dedicated policy, while a player
terminal ending needs a different Owner ruling.

### M.6 Future 2040 Legacy dossier

Opening hierarchy:

1. studio identity and 1920–2040 span/completeness;
2. nonexclusive archetype cards;
3. defining films/people/rivals/eras;
4. awards, technology, finance, market, and resilience lenses;
5. setbacks, recoveries, and unresolved gaps;
6. source-linked chronology and records;
7. explicit Owner-approved post-finale option.

No “overall 92,” letter grade, world rank, winner, GOAT meter, or meta-power reward.

---

## N. Responsive, accessibility, and input rules

### N.1 Responsive layout

| Width/state | Layout |
|---|---|
| wide desktop | 30–40% retained lot/context; 60–70% workspace; independent scroll |
| medium | narrow context strip or 75–85% workspace; two-column cards collapse as needed |
| narrow / high text scale | full-width retained page; fixed identity/week header; one-column cards |

Graphs never become required horizontal scrollers. The table/text equivalent is primary at narrow
width. Long titles wrap; studio/film identity and reason/action never disappear.

### N.2 Mouse

- click row/card selects or opens safe detail only;
- explicit labeled links open source film/studio;
- wheel over workspace never moves lot camera;
- hover may reinforce but cannot hold unique facts;
- no right-click destructive/corporate action.

### N.3 Keyboard

- logical heading/filter/list/detail/source/Back order;
- arrows move within graph/list only when semantics are announced;
- Enter opens safe detail; Space toggles controls where standard;
- Escape closes one layer and restores opener;
- all tooltip/formula facts have focus routes.

### N.4 Controller

- bumper/tab changes top-level lens;
- d-pad/stick changes focused row/filter;
- confirm opens safe detail; Back unwinds exactly one layer;
- no destructive/default focus on future remedies;
- chart cursor announces date/value/reason and has list equivalent.

### N.5 Accessibility

- color-independent signs, icons, labels, patterns;
- 200% text without clipped reason/consequence;
- reduced motion removes graph tween/rank movement/finale flourish;
- screen-reader summaries describe current pressure, direction, window, top causes, and next boundary;
- dates/weeks use one project-wide format plus era-aware display, not color or position alone;
- incomplete-history notice precedes any derived interpretation it limits.

---

## O. Error and refusal language

| Typed condition | Player-facing headline | Exact response |
|---|---|---|
| `marketDefinitionUnavailable` | `Shared-market rules are unavailable.` | Return to lot; record diagnostic; never use a fallback formula. |
| `marketDefinitionChanged` | `Market rules changed at this historical boundary.` | Refresh current version; preserve frozen earlier assessment. |
| `sourceFilmMissing` | `This market record cannot resolve its source film.` | Show ID/provenance-safe error; no substitute by title. |
| `sourceStudioMissing` | `This market record cannot resolve its studio.` | Fail closed; no rank/assessment mutation. |
| `duplicateAssessment` | `Duplicate market outcome detected.` | Stop affected release/import; do not choose one. |
| `invalidExposureWindow` | `Market exposure dates are invalid.` | Refuse load/transition; preserve recoverable source save. |
| `historyNotRecorded` | `Shared-market history was not recorded before Week <N>.` | Show forward facts only; no backfill. |
| `releaseNotPublic` | `This release is not yet public.` | Hide private identity/details; show only lawful aggregate if permitted. |
| `staleProjection` | `The industry changed while this view was open.` | Refresh in place; retain filter/selection where IDs survive. |
| `cursorIncompatible` | `This history page uses an older schema or retired compaction generation.` | Return to the current recording boundary with notice; later appends alone do not expire an append-stable cursor. |
| `rankingNotAvailable` | `Not enough comparable history for a Power Ranking.` | Show Standing/History routes separately; no provisional rank. |
| `corporatePolicyNotAuthorized` | `Corporate fate is not part of the current rules.` | No placeholder action or mutation. |
| `negativeCashOnly` | `Negative cash does not by itself close a studio.` | Route to P11 finance explanation where public/owned. |
| `legacyEvidenceIncomplete` | `This legacy view has incomplete recorded history.` | Name domains and recorded-from boundaries. |
| `finaleModeUndecided` | `Post-2040 play has not been authorized.` | Offer only governed ending/archive behavior. |

Errors are typed facts. The client never parses prose to decide legality or chooses a “close enough”
film, studio, formula, cursor, or history row.

---

## P. Anti-cheat and anti-facade assertions

### P.1 Shared-market symmetry

- Search/AST or equivalent proof finds no player-specific coefficient/exemption in market law.
- Owner-swap fixture produces swapped normalized outputs.
- Every same-week subject reads one frozen pre-batch exposure revision plus the other eligible batch
  members with self-exclusion; no release activates before all batch assessments validate.
- Rivals cannot release without conserved project, owner, people/capacity, and date facts from P12.
- No invisible cash, free capacity, free talent, technology grant, or quality multiplier repairs a rival.
- Cancelling/removing a real cause removes the resulting pressure at the defined boundary.

### P.2 Client authority

- Unity/browser contains no formula, decay, rank, status, closure, or archetype calculation.
- Client sort cannot masquerade as authoritative rank.
- Missing DTO facts produce unavailable/refusal UI, never local estimates.
- Opening/filtering/paging/animating is save/RNG neutral.
- A screenshot or animation cannot count as proof without state/event evidence.

### P.3 History integrity

- no fabricated pre-migration market/rank/corporate/finale facts;
- no deletion or ID reuse after closure/retirement;
- no title/name join where immutable ID is required;
- no current data recomputation presented as frozen historical fact;
- no finale prose without qualifying source references;
- no single hidden score behind archetype selection.

### P.4 Performance facade

- paged payload size alone is not accepted if the core still scans/hashes the full save;
- cached projection must invalidate by authoritative revision, not wall time;
- weekly update cannot enumerate full film history;
- aggregate graphs cannot rebuild from every raw event on screen open;
- endurance evidence includes slopes, not only one terminal pass.

---

## Q. Hostile-review checklist

Reject the candidate if any answer is adverse:

1. Does P15 duplicate P07 reception or P08 Standing/history?
2. Does the market formula branch on player status?
3. Can a rival visible consequence exist without conserved state?
4. Are source IDs missing from reasons?
5. Is private rival data leaked?
6. Is formula/version/window/commit-order law absent?
7. Can immutable-ID or enumeration order change a same-week subject's formula inputs rather than only canonical commit order?
8. Does current pressure rewrite old Film Results?
9. Is Power Ranking present in P15A.1?
10. Is rank confused with Standing or Legacy?
11. Does negative cash equal bankruptcy?
12. Can distress jump directly to closure?
13. Can closure erase or remint identity?
14. Are acquisition/merger/co-production/library/IP fields present in P15 roots?
15. Is acquisition called original-game parity?
16. Are migrated histories fabricated?
17. Can the finale award an archetype without source evidence?
18. Is there one blended Legacy score or GOAT ladder?
19. Is post-2040 continuation assumed?
20. Is any weekly work O(total history) or O(films²)?
21. Does each page still hash/project the whole save?
22. Are DTOs unbounded?
23. Can queries or presentation alter RNG/save?
24. Are input/accessibility facts hover/color/pointer only?
25. Is P05/P06 final code being imagined rather than refreshed?
26. Is the first checkpoint wider than one player+rival overlap proof?

Every real finding must be corrected; no reviewer-shopping.

---

## R. Stop conditions

Stop immediately and do not broaden implementation if:

- P12 cannot supply immutable studio IDs and conserved rival releases;
- the P07 prospective consequence seam cannot be added without rewriting frozen results;
- the Owner has not selected the P15A.1 formula/window;
- shared law requires player-specific exceptions to pass;
- old saves require fabricated backfill;
- migration cannot preserve exact existing IDs/history;
- P10 cannot provide the single request-bound, digest-verified, chunk-bounded person/contract participant manifest required by P15B;
- P11 or P12 cannot provide a fixed-size bounded receipt or request-bound, digest-verified,
  chunk-bounded participant manifest for every variable-size owned set required by P15B;
- a small query still performs repeated O(full save) work with no bounded mitigation;
- the 6,240-week harness shows superlinear growth or unstable replay;
- the client needs hidden data or local calculation;
- P15A.1 requires Power Ranking, screens, distress, a corporate/ownership transaction, or finale scope;
- P05/P06 remains unsealed where the changed path is essential;
- a destructive schema rewrite is proposed without a separately approved migration plan.

Successful P15A.1 is also a stop condition: report and seek Owner judgment before P15A.2/P15B/P15C.

---

## S. Rollback and recoverability

### S.1 Before merge

- use an isolated branch/worktree;
- record exact base SHA and dirty-path audit;
- keep P15 roots/schema changes additive and separately reviewable;
- do not touch Unity until TypeScript law, save, and bridge proof pass;
- do not combine formula tuning with architecture migration;
- preserve old-version fixtures and pre-change save bytes.

### S.2 Candidate rollback

Rollback means revert the bounded P15A.1 candidate commits as a unit, not edit user saves or reset
shared worktrees. No destructive Git command is implied. If a migrated candidate save exists, retain
its source save and document that the newer save is not backward-compatible unless an explicit export
path was designed.

### S.3 Runtime failure posture

- refuse invalid import/transition without partial mutation;
- keep the last valid authoritative state and source save recoverable;
- never truncate history to make a save load;
- never substitute an older/newer formula silently;
- emit bounded diagnostic facts with IDs/version/week, not private player data;
- do not auto-resubmit a stale action after refresh.

---

## T. First-checkpoint final report format

The future P15A.1 builder returns exactly:

### P15A.1 STATUS

`COMPLETE`, `REVISE`, or `BLOCKED`.

### AUTHORITY

- branch;
- base SHA;
- final SHA;
- accepted upstream TypeScript/Unity SHAs;
- save/bridge/formula versions;
- explicit statement that no P15A.2/P15B/P15C/P16 scope was added.

### CHANGED PATHS

Every changed file, classified as core/save/query/bridge/client/test/docs, with why it changed. Confirm
no unrelated or Unity path changed unless separately authorized.

### IMPLEMENTED PROOF

- exact formula/window and bounds;
- exact player and rival source films/studios;
- frozen batch ID, P12 source revision, pre-batch exposure revision/digest, and self-excluded subject inputs;
- market assessment/reason records;
- symmetric consequence plus owner/ID/order-swap and no-early-activation proof;
- decay/cancel/delay behavior;
- source navigation and exact Back behavior.

### MIGRATION AND HISTORY

- old-save recorded-from behavior;
- active-window policy;
- round-trip/idempotence results;
- duplicate/missing/unknown-version refusals;
- confirmation of no fabricated history.

### DETERMINISM AND ENDURANCE

- seeds/fixtures/action traces;
- 6,240-week normal and hostile result;
- terminal hashes/invariants;
- save size, load/migrate, tick, crowded-boundary, projection, paging, and allocation measurements at
  25/50/75/100% horizon;
- complexity slope disposition.

### ACCESSIBILITY AND INPUT

- mouse/keyboard/controller;
- narrow width/200% text;
- screen-reader/table equivalent;
- reduced motion;
- stale/error/refusal states.

### ADVERSARIAL REVIEW

- reviewers and exact review bases;
- every finding;
- correction or explicit disposition;
- re-review results;
- no reviewer-shopping.

### OWNER PLAYTEST

- exact two-release journey;
- what the Owner understood without explanation;
- surprises/confusions;
- KEEP / REVISE / REJECT.

### STOP-LINE CONFIRMATION

Confirm no Power Ranking, screens, distress, entrants, closure, acquisition, merger, co-production,
library/IP, finale, or Endless Mode was implemented.

### ROLLBACK

- exact pre-candidate SHA/save fixture;
- recoverable rollback method;
- any forward-save compatibility limitation.

### NEXT ACTION

Owner accepts/revises P15A.1. Do not begin P15A.2, P15B, P15C, or P16+ automatically.

---

## U. POST-UPSTREAM OWNER-ACCEPTED REFRESH REQUIRED

This annex is not a changed-path specification. Before implementation reconnaissance, re-read:

- accepted P07/P08/P09/P10/P11/P12 final authorities and current changed paths;
- accepted P13/P14 design and implementation status;
- sealed P05 and approved P06 state;
- current TypeScript and Unity campaign SHAs;
- current save generation, validators, ID walkers, RNG, calendar, result boundary, projections,
  bridge schema/session, query protocol, and performance evidence;
- current external comparator pages and all eight exact open-source revisions/licenses.

Then produce a fresh implementation charter and obtain explicit production authorization. Until that
happens: **DECISION-READY RESEARCH CANDIDATE / DOCUMENTATION ONLY / NO PRODUCTION AUTHORIZATION**.
