import {
  array,
  boolean as bool,
  enumeration,
  integer,
  literal,
  nullable,
  number,
  object,
  optional,
  reference,
  text,
  union,
  type InferSchema,
  type JsonSchema,
} from './dsl.ts'
import {StudioBridgeIntentOption} from './intent-schema.ts'
export {AVAILABLE_INTENT_KINDS} from './intent-schema.ts'
import {industryDefinitions,StudioIndustryProjection} from './industry-schema.ts'

export const PROTOCOL_VERSION = 4 as const
// P05A W2: the closed Production projection (fourteen operational states,
// worksite/Locate targets, blocker anatomy, wrap receipts, the Stage-local
// collection, and the exact `rehearsal` journey beat) extends the wire shape,
// so the projection identity advances 11 → 12. Protocol stays 4; save stays 15
// (no saved byte changed).
// P06A W2 (charter W2): 13 → 14 — the Release projection joins the bundle,
// `release-committed` joins the closed operational-state vocabulary, and the
// explicit `commitPictureToRelease` intent kind joins the wire.
// P07A W2 (charter W2): 14 → 15 — the release-results projection gains the rich per-film
// `results` (StudioFilmResultSnapshot: three independent critic/audience/business channels,
// gross vs studio revenue, banked-vs-projected). Additive; protocol stays 4; save stays V16
// (result truth is DERIVED from already-persisted state — no saved byte changed).
// Owner UX 01: public discipline/genre estimates and readable saved-slot metadata.
// Protocol stays 4 and gameplay save stays V18; both fields derive existing authority.
// R05: the Profile uses the same authoritative calendar label as Industry.
// Absolute career weeks and durable save formats remain unchanged.
// R3-N4-SIM-20 (N4/N5/N6 batched read-model deltas): 30 -> 31 — three additive
// wire-shape changes, all pure projections over already-authoritative facts:
//   (a) `StudioDevelopmentProjectSnapshot.attention`, the per-screenplay record
//       attention, reusing the SAME closed vocabulary casting already publishes;
//   (b) `StudioContractOfferSnapshot.affordable` + `.refusalReason`, the D-12
//       solvency answer the sign route already asks per published term;
//   (c) `StudioFinanceSnapshot.attention` becomes a row object
//       (`StudioFinanceAttention` — stable id, the same sentence, an optional
//       existing `StudioFinanceRoute`) instead of a bare string.
// Protocol stays 4 and the durable save format is untouched: no gameplay, price,
// employment or command law changed, and no new state is stored.
// R3-N7-SIM-01 (N7 retrievable history): 31 -> 32 — ONE additive wire section,
// `operationsEvents`, a read-only projection over the `state.studioEvents`
// ledger the engine has appended since C2a-M1 and nothing has ever published.
// It stores nothing, consumes nothing and changes no simulation law; it exists
// so a decision cue that has cleared stays retrievable in History (N7 family
// sheet §3). Protocol stays 4 and the durable save format is untouched.
// P13B-S1b (plan §S1b): 32 -> 33 — additive Laboratory seat data beside the
// existing labels: `StudioLaboratoryPage.seats/receipts/weekly`. Nothing renamed or
// removed, protocol stays 4, no simulation law and no durable save format changed.
// P13B-S2-T6 (plan §S2): 33 -> 34 — the Laboratory page carries two technologies and
// two Laboratories: `StudioLaboratorySeat.laboratoryFacilityId`, per-Laboratory rows on
// stored receipts (`StudioResearchReceipt.labs`, null only where the stored receipt has
// none) and on the quoted week (`StudioResearchWeek.labs` + its integer `units`), and
// `StudioLaboratoryPage.projects` — one row per project this body carries. The existing
// top-level members keep their S1b meaning (the synchronized-sound project) and are
// superseded by `projects[]` for the Unity binding. `StudioResearchReceipt.units` is now
// the project credit over 1/160,000 (was 1/20,000): the same verified work, rebased by
// the governed V21->V22 lift. Additive only; protocol stays 4.
// P13B-S3-T4 (plan §S3): 34 -> 35 — the studio's persistent physical plans reach the
// wire. A new `view: 'plans'` industry page (`StudioPlansPage` with `StudioPlanRow`,
// `StudioPlanQuote`, `StudioPlanQuoteComponent`, `StudioPlanNext`,
// `StudioPlanCommitReceipt`), `StudioIndustryResponse.plans` (null on every other view,
// as `laboratory` is), the five `plan*` studio-history kinds on
// `StudioHistoryEventSnapshot.kind`, and the `physicalPlanAction` intent kind for the
// five plan verbs. `StudioPlanRow.next` is null exactly on a started or cancelled row:
// a terminal plan has no next admission boundary. Additive only; protocol stays 4.
// P13B-S4-T3 (plan §S4): 35 -> 36 — one Development & Casting building's development
// standard and its in-place conversions reach the wire. A new `view: 'office'` industry
// page (`StudioOfficePage` with `StudioOfficeConversionRow`), `StudioIndustryResponse
// .office` (null on every other view, as `laboratory` and `plans` are), and the office
// row ids `office-convert-<facilityId>-ii|iii` / `plan-queue-office-convert-<facilityId>
// -ii|iii`. Every conversion row is published even when the engine refuses it, carrying
// its `FacilityInstallationRefusal` name; `StudioOfficePage.blueprintId` is null exactly
// on the endowed founding office, which is a property structure with no placement.
// Additive only; protocol stays 4, and no new intent kind is minted.
// P13B-S5-T4 (plan §S5): 36 -> 37 — technology ADOPTION reaches the wire per technology.
// `StudioAdoptionComponent`/`StudioAdoptionQuote`/`StudioAdoptionRow`, a nullable `quote` on
// `StudioLaboratoryAction` (populated on `adopt-*` rows only, null on every other row and on
// every Plans/Office action row), `StudioLaboratoryPage.adoptions` (this studio's committed
// adoptions), the per-technology row ids `adopt-<technologyId>-<stageFacilityId>[-<postFacilityId>]`
// and their `plan-queue-adopt-<technologyId>-<stageFacilityId>` companions, and the
// `adoptTechnology` intent kind. A refused adopt row is still published with the engine's own
// `rejections`/`refusal`; `postFacilityId` is null exactly when the technology has no Post
// component. Additive only; protocol stays 4.
//
// PROJECTION 39 (P13B-S6): installation cancellation reaches the wire. The
// `cancel-adoption-<adoptionId>` row on the Laboratory page and the
// `cancel-<projectId>` rows on the Office and plans pages each carry the engine's
// own `cancellationQuote` in the shared action-row `quote` member, plus the
// `cancellationAction` intent kind, `cancelledWeek` on every adoption row, the
// studio's `equipment[]` beside `adoptions[]`, and the third `cancelled` placement
// status wherever an INSTALLATION record is published (the lot views stay two-value
// by construction: they carry bodies, which can never be cancelled).
//
// NOT purely additive at ONE site, and deliberately so: the action row's `quote` now
// references `StudioActionQuote`/`StudioActionQuoteComponent`, which REPLACE
// `StudioAdoptionQuote` and carry each verb's own members as OPTIONAL properties. A
// discriminated union of the two quote shapes is what this would otherwise be, and the
// C# contract generator refuses an object union without a shared required const/enum
// discriminator (CF08) — adding one to the adoption arm would have changed the
// projection-37 adopt-row shape itself. Nothing is defaulted: a `cancel-*` row simply
// omits `total`/`reusedPostFacilityId`/`reusedEquipmentAssetId`, and an `adopt-*` row
// omits `refund`/`restoration`. Protocol stays 4.
//
// PROJECTION 40 (P13B-S7): public milestone disclosure reaches the wire.
// `StudioLaboratoryPage.forecast` publishes one `StudioTechnologyForecast` per catalogue
// technology, derived from the catalogue entry and the campaign week alone — a two-bound
// window until the public announcement, the exact commercial date from it. `replacementLabel`
// (authored catalogue text) joins the `purchase-*`/`adopt-*` action rows as an OPTIONAL member
// and every `StudioAdoptionRow`. TWO named surface changes, not text-only:
//   * `StudioIndustryActivity.studioId` is now NULLABLE. The derived announcement row
//     `technology-announcement-<technologyId>` is minted by the campaign clock, which owns no
//     studio; null keeps it out of every per-studio History filter by construction while it
//     appears in the Industry Pulse feed. Every receipt-derived row still carries its studio id.
//   * The Laboratory `wait-<technologyId>`/`purchase-<technologyId>` rows, published for
//     synchronized sound alone since P13A, are now per catalogue technology and exist ONLY
//     while that technology's forecast is EXACT — a row whose text embeds the exact commercial
//     week cannot be published before that week is public. Sound's window is degenerate, so its
//     two rows are unchanged at every week; lighting's appear at its announcement week.
// Nothing is persisted: no announcement receipt, no save change (V26 stays live). Protocol stays 4.
//
// PROJECTION 41 (P13B-S8): rival research becomes visible as ONE public fact, text only.
// Save V27 landed five rival-only receipt kinds (`laboratoryCommitted`,
// `laboratoryOperational`, `instrumentOperational`, `researchSeatAssigned`,
// `researchCompleted`) and four rival ledger kinds (`researchSpend`, `researchCapacity`,
// `technologyRestoration`, `technologyRefund`). The projection publishes rival research
// facts FROM RECEIPTS ONLY, and only one of them: a `laboratoryOperational` receipt mints
// one `StudioIndustryActivity` in the existing `studios` group ("<studio> expands its
// research capacity"), with no seat, Lab or instrument count in its text. The other four
// receipt kinds mint NO row and no text anywhere — a commitment, an instrument, a seat and
// a finished project are the rival's private research STATE, which the S8 law keeps off
// every page. Rival finance stays behind the existing public standings: none of the four
// rival money kinds, no rival cash and no rival period reaches any surface. The player's
// Laboratory and finance pages read the player's own slices and are unchanged.
// NO DTO CHANGE: the row uses the projection-40 `StudioIndustryActivity` shape as minted,
// and the schema moves only through its own `$id`/`x-project-studio.projectionVersion`.
// Save V27 is live (`742fb1e`); protocol stays 4.
//
// PROJECTION 42 (P14A.1): the contested talent-market case reaches the client through
// the Profile — the thin player surface of companion §2.1.10/§2.1.11 and nothing more.
//   * `StudioPersonProfileSnapshot.marketCase` is a NULLABLE `StudioMarketCaseSnapshot`:
//     present exactly while the engine holds a case for that person (`caseForTalent`),
//     null for everyone else. It carries the derived status, the derived decision week
//     and its campaign-calendar label, the person's public preference facts, one row per
//     current proposal, the profile-route attention rows, and the settlement reasons.
//   * The proposal row is a DISCRIMINATED union on `disclosure`, because the two rows are
//     genuinely different facts: `StudioMarketOwnProposalSnapshot` carries the viewer's own
//     numbers (re-derived at the read week through the shared pricing entry — never the
//     stored submission-week quote), and `StudioMarketUndisclosedProposalSnapshot` carries
//     the literal `"UNKNOWN"` marker in `premiumTier`/`annualSalary`/`signingBonus`. A
//     competing studio's real figures are never serialized anywhere, and the marker is
//     never null and never omitted (companion §2.1.5). The blanket privacy of
//     `bridge/industry.ts` and the `contract: null` of `bridge/people.ts` are UNCHANGED
//     for everyone outside a case: this is the authored narrowing, not a new disclosure.
//   * `marketProposalAction` joins `AVAILABLE_INTENT_KINDS` with its own quote family
//     (`quoteMarketProposal` → `StudioMarketProposalQuoteSnapshot`): propose / revise /
//     withdraw through the accepted quote → refusal → digest-bound commit pattern, with
//     `underMarketCase` joining the contract refusal vocabulary (the Renew row now reads
//     the engine's own case-time refusal instead of offering a commit the engine throws on).
// Save V28 is live; protocol stays 4; no new persisted fact.
//
// PROJECTION 43 (P14A.2): the Talent Market WORKSPACE — `view: 'market'` with
// `StudioIndustryResponse.market` (nullable `StudioMarketPage`), and the Pulse fold.
//   * Read models over the landed A.1 law only: no new engine law, no new intent kind
//     (`Review & Submit` / `Revise` / `Withdraw` stay the existing `marketProposalAction`
//     quote family), and Save V28 is UNCHANGED — nothing here is persisted.
//   * Four buckets by DERIVED facts, a case in exactly one: `renewalWindow`, `freeAgents`,
//     `settling` (the decision week is the NEXT authoritative week) and the paged `closed`.
//     Row order inside every bucket is fixed and derived, never an array/Map/PersonId order.
//   * `selected` carries the A.1 case block itself, a rail BY REFERENCE to the projection-42
//     profile pieces, the proposal comparison (the same A.1 disclosure union — every
//     competing figure the literal `"UNKNOWN"`) and the paged P12 employer history, whose
//     rival-owned intervals carry NO salary member at all.
//   * `StudioIndustryActivity.settlementKind` is a new OPTIONAL member carried by the ONE
//     folded Pulse row a settlement now writes — `retained` (same employer) or `moved` (a
//     new one) in place of the two separate P12 rows, naming the person, the studio and the
//     term length and never a figure. Every other activity row is unchanged and omits it.
//   * The industry request gains `view: 'market'` and an OPTIONAL `historyPage`; every
//     existing request shape stays valid as minted.
// Save V28 is live; protocol stays 4; no new persisted fact.
// PROJECTION 44 (P14A.3): the WORLD ROUTE facts — what a world surface may state about
// one person, and how it opens that person's case.
//   * Read models over the landed A.1 case law and the landed A.2 workspace only: no
//     engine law, no new intent kind, no new page, no Pulse change, and Save V28 is
//     UNCHANGED — nothing here is persisted.
//   * `StudioWorldRouteSnapshot` carries three facts: `statusLine` (the restrained OPEN-
//     case line, "Renewal window open · decides Week N" until `decisionWeek <= week + 1`
//     and "Decides next week · Week N" from there while the case is still open),
//     `caseRef` (`StudioWorldCaseRef {view:'market', targetId}` — the existing industry
//     request convention, opening the exact case with no new page) and `reach`
//     (`playerLot` iff the Profile's `presence.onLot`, else `industry`).
//   * `statusLine` and `caseRef` are BOTH null for a closed case and for a person the
//     engine holds no case for; a settled case stays readable through the Profile's
//     `marketCase` and the market page's `closed` bucket.
//   * Carriers: `StudioPersonProfileSnapshot.worldRoute` (required — every profile has a
//     route), `StudioRosterRowSnapshot.worldStatusLine` (nullable) and, on the PUBLIC
//     Industry person row, `StudioIndustryPerson.caseStatusLine` / `caseRef` (both
//     nullable). Public case facts only: a rival's tier, salary and bonus stay behind
//     A.1's disclosure exactly as before, and no figure is carried by any of them.
//   * The presence/attention DTOs are UNCHANGED: no capability, marker or meeting concept
//     is added anywhere, and the presence engagement and credit vocabularies gain nothing.
// Save V28 is live; protocol stays 4; no new persisted fact.
// P14B.1 (projection 45) — Save V29 is live (the `firstTakes` and `promises` roots)
// and the THIN CORE promise surface joins the wire: the case block's proposal rows
// gain `promise` (the issuer's own row carries family, count, window and
// classification; every competing row carries the SAME literal `"UNKNOWN"` marker
// §2.1.5 already used for the tier, salary and bonus), the block gains `trustLabel`
// (§4.5's public descriptor per viewing studio, no driver text) and `promiseHistory`
// (the VIEWING studio's own BOUND promises for this person, open and settled), the
// market-proposal draft gains an OPTIONAL `promise` and its quote a `promise`
// verdict, and `priorityOrder` widens to the six landed descriptors. No new view,
// page or intent kind; the trust driver text, the Pulse promise activities, the
// promise attention causes and the workspace history are P14B.2.
// P14B.4 (projection 47, record 600) — Save V30 is live (the explicitly selected P2
// seat class on the promise root) and `PROMISE_RULES_VERSION` is 4. The market-proposal
// draft's `promise` becomes a CLOSED family-discriminated union: a
// `LEAD_OR_SIGNIFICANT_ROLE_COUNT` draft REQUIRES `seatClass` (`lead` |
// `leadOrAntagonist`, no default, no optional); every other catalogue family stays
// count-only with no class member (P3–P5 remain enumerated and engine-refused). The
// issuer's own promise snapshot and the bound history row gain `seatClass`
// (nullable: the real class for a tagged P2, `null` for a count family or a legacy
// classless P2 — never a fabricated lead). The preferences snapshot gains
// `preferredOpportunity` (the engine's own public archetype reader). Competing rows
// keep the whole `"UNKNOWN"` marker; no new view, page, intent kind or persisted fact.
// P14B.5 (projection 48) — Save V31 is live (the top-level `relationships` root) and
// D5 relationships ranks in the chooser, so the engine's own `publicPriorityOrder`
// returns SEVEN members: the CLOSED `priorityOrder` enum gains `relationships`. The
// D5 settlement sentence reaches the wire as a VALUE through the existing free-text
// `settlementReasons`. NOTHING ELSE: no relationship DTO, no tier, no drivers text, no
// chemistry row, no casting warning, no attention cause, no view/intent/page (B.6);
// no closeness, edge or driver ever appears on any serialized DTO.
// P14B.6 (projection 49, Owner ruling 4 of record 683) — the relationship READ MODELS,
// and nothing else: `StudioPersonProfileSnapshot` gains the `collaborators` block
// (`StudioRelationshipBlock` + `StudioRelationshipRow`) and the casting CONFIRMATION
// (`StudioCastingQuoteSnapshot`) gains `chemistry` (`StudioCastingChemistryRow`) and
// `chemistryWarning`. The DTO key is `collaborators`, NOT `relationships`: the landed
// leak law forbids that key form on every serialized DTO. NO SAVE STEP —
// `LIVE_SAVE_VERSION` stays 31, with no new root, validator or migration; no new driver
// kind, constant, policy, refusal or RNG; and NO production-quality modifier, which
// remains the production-result owner's own slice. The two carriers disclose on DIFFERENT
// bases, and the distinction is load-bearing. On the PROFILE block a tie publishes only
// when its counterpart is independently visible to the player in their own right, on the
// player's roster at W, so a pair internal to a rival reaches no profile. On the CASTING
// rows there is no roster predicate and none is intended: the player has proposed both
// people for the same picture, both ids are already inside their own request, and ruling
// 3 (iii) requires the readout for exactly that seating — so two off-roster freelancers
// who share an edge DO read there, on the basis that a seating the player proposes is
// self-disclosing. Closeness, edge ids, stored driver rows and delta magnitudes reach
// neither carrier.
// P14B.8 (projection 50) — THE WAIVER'S PLAYER SURFACE. Three wire changes and no more:
// (1) `StudioMarketPromiseHistoryRow` gains `supersededByPromiseId` (the TYPED successor
// link, so no consumer parses `outcomeCause`) and `progress` (a player who cannot see the
// remaining obligation drafts a substitute by trial and error); all three carriers of that
// row inherit both. (2) the `quoteWaivePromise` family — its OWN draft payload, whose
// `family` domain admits only the two the surface offers, plus
// `StudioPromiseWaiverQuoteSnapshot`. (3) the `waivePromise` intent kind. NO SAVE STEP:
// `LIVE_SAVE_VERSION` stays 32 and `PROMISE_RULES_VERSION` stays 4 — B.7's waiver law is
// complete and B.8 moves none of it. The OWNERSHIP of a promise is not on this wire and
// never becomes a client's to assert: the bridge resolves the issuer from the promise id
// and refuses every id the player's own studio does not hold.
// Record 840 (projection 51): the current runtime now owns Save37's Scientist
// retirement law. No DTO field changes; exact schema50 checkpoints migrate both
// independent slots through the governed prior-schema path in the same slice.
export const PROJECTION_VERSION = 51 as const

const nonEmptyText = () => text({ minLength: 1 })
const nonNegativeInteger = () => integer({ minimum: 0 })
const ratio = () => number({ minimum: 0, maximum: 1 })

/**
 * The ONE closed per-record attention vocabulary. Casting projects have published
 * it since P04A; R3-N4-SIM-20 gives Development's per-screenplay records the same
 * vocabulary rather than a second, divergent one. Adding a value here changes both
 * surfaces at once, which is exactly the intent.
 */
const recordAttention = () =>
  enumeration(['none', 'ready', 'waiting', 'active', 'decisionRequired', 'blocked'])

const StudioGridCellSnapshot = object('StudioGridCellSnapshot', {
  gx: integer(),
  gy: integer(),
})

const StudioGridRectSnapshot = object('StudioGridRectSnapshot', {
  x0: integer(),
  y0: integer(),
  x1: integer(),
  y1: integer(),
})

const StudioFootprintSnapshot = object('StudioFootprintSnapshot', {
  width: integer({ minimum: 1 }),
  depth: integer({ minimum: 1 }),
})

const StudioBuildingSnapshot = object('StudioBuildingSnapshot', {
  id: nonEmptyText(),
  available: bool(),
  attention: optional(enumeration([
    'normal',
    'active',
    'positive',
    'warning',
    'decision-required',
    'empty',
    'future',
    'recently-completed',
  ])),
  attentionReason: optional(text()),
  constructionStatus: optional(enumeration(['legacy', 'vacant', 'building', 'operational'])),
  constructionProgress01: optional(ratio()),
  constructionProgressText: optional(text()),
})

const StudioProductionSnapshot = object('StudioProductionSnapshot', {
  id: nonEmptyText(),
  title: nonEmptyText(),
  genre: nonEmptyText(),
  stageId: nonEmptyText(),
  progress01: ratio(),
  weeksRemaining: nonNegativeInteger(),
  active: bool(),
  stageState: optional(enumeration([
    'available',
    'filming',
    'decision-required',
    'ready-for-release',
    'completed',
    'idle',
  ])),
})

const StudioReleasedFilmSnapshot = object('StudioReleasedFilmSnapshot', {
  id: nonEmptyText(),
  title: nonEmptyText(),
  reception: enumeration(['flop', 'mixed', 'hit', 'smash']),
  weeksAgo: nonNegativeInteger(),
})

// P07A W2 — the rich per-film numeric result (the durable result-inspection surface).
// Three INDEPENDENT channels (D3): CRITICS, AUDIENCE, BUSINESS — never one quality score.
// BOX OFFICE GROSS is kept distinct from STUDIO REVENUE, and "…PaidToDate" (actually credited)
// is distinct from the locked full-run totals (D2 truthfulness). Money lives here, NOT on the
// rail rows (D5). Every value is DERIVED in TS from persisted state; Unity only renders it.
const StudioFilmSegmentScore = object('StudioFilmSegmentScore', {
  segment: enumeration(['youngAdult', 'family', 'adult', 'prestige']),
  score: number(),
})
const StudioFilmResultSnapshot = object('StudioFilmResultSnapshot', {
  id: nonEmptyText(),
  title: nonEmptyText(),
  releaseWeek: nonNegativeInteger(),
  weeksAgo: nonNegativeInteger(),
  criticScore: number(),
  criticStars: number(),
  criticBand: enumeration(['flop', 'mixed', 'hit', 'smash']),
  criticTier: enumeration(['pan', 'mixed', 'favorable', 'strong', 'rave']),
  audienceAggregate: number(),
  audienceTier: enumeration(['hated', 'disliked', 'divided', 'liked', 'loved']),
  audiencePerSegment: array(reference('StudioFilmSegmentScore', StudioFilmSegmentScore)),
  boxOfficeOpening: number(),
  boxOfficeGrossTotal: number(),
  studioRevenueTotal: number(),
  studioRevenuePaidToDate: number(),
  grossPaidToDate: number(),
  committedCost: number(),
  contribution: number(),
  roi: number(),
  projected: bool(),
  resultLabel: enumeration([
    'Profit',
    'Loss',
    'Break-even',
    'Projected profit',
    'Projected loss',
    'Projected break-even',
  ]),
  runStatus: enumeration(['active', 'completed', 'legacyCompleted', 'none']),
  totalWeeks: nonNegativeInteger(),
  weeksCredited: nonNegativeInteger(),
})

const StudioJourneyNextSnapshot = object('StudioJourneyNextSnapshot', {
  kind: enumeration([
    // P09 W1b: a bare lot's first step is a BUILD, not a commission.
    'build',
    'commission',
    'script-review',
    'plan-auditions',
    'audition-review',
    'review-casting-blocker',
    'open-package',
    'resolve-production',
    'release-review',
    'advance-week',
  ]),
  label: nonEmptyText(),
  site: nullable(enumeration(['development', 'casting', 'stage', 'post', 'admin', 'build'])),
})

const StudioJourneyWaitingSnapshot = object('StudioJourneyWaitingSnapshot', {
  untilWeek: nullable(nonNegativeInteger()),
  reason: nonEmptyText(),
})

const StudioJourneyBlockedSnapshot = object('StudioJourneyBlockedSnapshot', {
  reason: nonEmptyText(),
})

const StudioFirstFilmJourneySnapshot = object('StudioFirstFilmJourneySnapshot', {
  stage: enumeration([
    // P09 W1b: a bare lot with no operational Development & Casting capacity.
    'no-capacity',
    'no-picture',
    'drafting',
    'script-review',
    'ready-to-package',
    'auditioning',
    'audition-review',
    'in-production',
    'released',
  ]),
  beat: enumeration([
    'no-capacity',
    'no-picture',
    'screenplay-writing',
    'screenplay-review',
    'screenplay-ready',
    'auditions-running',
    'auditions-ready',
    'auditions-reviewed',
    'greenlit',
    'pre-production',
    // P05A W2: Rehearsal is preparation, not LOAD-IN — the exact member the
    // W1 copy correction deferred to this governed projection bump.
    'rehearsal',
    'load-in',
    'shooting',
    'post-production',
    'release-ready',
    'released',
  ]),
  productionId: nullable(text()),
  scriptProjectId: nullable(text()),
  pictureTitle: nullable(text()),
  ordinal: integer({ minimum: 1 }),
  headline: nonEmptyText(),
  whatHappened: nonEmptyText(),
  whyItMatters: nonEmptyText(),
  detail: nullable(text()),
  next: nullable(reference('StudioJourneyNextSnapshot', StudioJourneyNextSnapshot)),
  waiting: nullable(reference('StudioJourneyWaitingSnapshot', StudioJourneyWaitingSnapshot)),
  blocked: nullable(reference('StudioJourneyBlockedSnapshot', StudioJourneyBlockedSnapshot)),
})

const StudioProductionBlockerSnapshot = object('StudioProductionBlockerSnapshot', {
  kind: enumeration([
    'facility-capacity',
    'set-unavailable',
    'director-dispatch',
    'scenery-load-in',
    'take-scheduling',
  ]),
  headline: nonEmptyText(),
  detail: nonEmptyText(),
})

const StudioProductionCompanyMemberSnapshot = object('StudioProductionCompanyMemberSnapshot', {
  productionRole: enumeration(['writer', 'director', 'lead', 'antagonist', 'support', 'craft']),
  slotIndex: nonNegativeInteger(),
  talentId: nonEmptyText(),
  name: nonEmptyText(),
  presentationRole: enumeration(['director', 'talent']),
})

const StudioAssignShootingDirectorCommand = object('StudioAssignShootingDirectorCommand', {
  kind: literal('assignShootingDirector'),
  productionId: nonEmptyText(),
  directorId: nonEmptyText(),
  label: nonEmptyText(),
})

const StudioClearSceneryLoadInCommand = object('StudioClearSceneryLoadInCommand', {
  kind: literal('clearSceneryLoadIn'),
  productionId: nonEmptyText(),
  label: nonEmptyText(),
})

const StudioScheduleShootingTakeCommand = object('StudioScheduleShootingTakeCommand', {
  kind: literal('scheduleShootingTake'),
  productionId: nonEmptyText(),
  label: nonEmptyText(),
})

const StudioProductionCommandSnapshot = union('StudioProductionCommandSnapshot', [
  reference('StudioAssignShootingDirectorCommand', StudioAssignShootingDirectorCommand),
  reference('StudioClearSceneryLoadInCommand', StudioClearSceneryLoadInCommand),
  reference('StudioScheduleShootingTakeCommand', StudioScheduleShootingTakeCommand),
] as const)

// ── P05A W2 — the CLOSED Production row and Stage-local collection ───────────

const StudioProductionTargetSnapshot = object('StudioProductionTargetSnapshot', {
  relationship: enumeration(['current-work', 'related']),
  resourceKind: enumeration(['facility', 'set']),
  resourceId: nonEmptyText(),
  capability: nullable(text()),
  label: nonEmptyText(),
  buildingId: nullable(text()),
  locatable: bool(),
  reason: nullable(text()),
})

const StudioBlockerHolderSnapshot = object('StudioBlockerHolderSnapshot', {
  resourceId: nonEmptyText(),
  ownerId: nonEmptyText(),
  title: text(),
  activity: text(),
  freesInWeeks: nullable(nonNegativeInteger()),
})

const StudioProductionRemedyRouteSnapshot = object('StudioProductionRemedyRouteSnapshot', {
  kind: enumeration(['open-queue', 'open-scenery-shop', 'open-set', 'wait-for-holder']),
  label: nonEmptyText(),
  setId: nullable(text()),
  holderId: nullable(text()),
  freesInWeeks: nullable(nonNegativeInteger()),
})

const StudioProductionBlockerAnatomySnapshot = object('StudioProductionBlockerAnatomySnapshot', {
  kind: enumeration([
    'facility-capacity',
    'set-unavailable',
    'director-dispatch',
    'scenery-load-in',
    'take-scheduling',
  ]),
  headline: nonEmptyText(),
  detail: nonEmptyText(),
  consequence: nonEmptyText(),
  holders: array(reference('StudioBlockerHolderSnapshot', StudioBlockerHolderSnapshot)),
  projectedWeeks: nullable(nonNegativeInteger()),
  remedies: array(reference(
    'StudioProductionRemedyRouteSnapshot',
    StudioProductionRemedyRouteSnapshot,
  )),
})

const StudioWrapReceiptSnapshot = object('StudioWrapReceiptSnapshot', {
  wrappedWeek: nonNegativeInteger(),
  stageFacilityId: nonEmptyText(),
  setId: nullable(text()),
  currentWeek: bool(),
})

const StudioStageLogisticsCueSnapshot = object('StudioStageLogisticsCueSnapshot', {
  kind: literal('scenery-load-in'),
  fromFacilityId: nonEmptyText(),
  toFacilityId: nonEmptyText(),
  distance: nonNegativeInteger(),
  weeksTotal: nonNegativeInteger(),
  weeksRemaining: nonNegativeInteger(),
  arrived: bool(),
})

const StudioStageProductionSnapshot = object('StudioStageProductionSnapshot', {
  stageFacilityId: nonEmptyText(),
  stageBuildingId: nullable(text()),
  facilityLabel: nonEmptyText(),
  holderProductionId: nullable(text()),
  holderTitle: nullable(text()),
  currentSetId: nullable(text()),
  presentationState: enumeration([
    'withheld',
    'dark',
    'rehearsal',
    'load-in',
    'blocked',
    'shooting',
    'wrap',
  ]),
  holderCopy: nullable(text()),
  theaterSubjectIds: array(nonEmptyText()),
  presenceTalentIds: array(nonEmptyText()),
  logistics: nullable(reference(
    'StudioStageLogisticsCueSnapshot',
    StudioStageLogisticsCueSnapshot,
  )),
  wrapReceipt: nullable(reference('StudioWrapReceiptSnapshot', StudioWrapReceiptSnapshot)),
  presentationHint: nullable(text()),
})

// ── P13B-S5-R07 (projection 38) — the production SETUP subtask ───────────────
// The engine's own `ProductionWorkflow.setup` record, published verbatim: the
// recipe it names, the route its provenance was fixed on at admission, the units
// credited against the units required, and the two derived weeks a client needs
// to state the wait honestly (`nextUnitWeek`, `forecastShootingEntryWeek` =
// `setupForecast(admittedWeek, requiredUnits)`). Every week member is null
// exactly where the engine has not stamped it yet — a selected plan the weekly
// sweep has not admitted forecasts nothing, and a completed setup owes no
// further unit.
const StudioProductionSetup = object('StudioProductionSetup', {
  recipeId: nonEmptyText(),
  /** The catalogue's own `name` for that recipe; never an id dressed as a label. */
  recipeLabel: nonEmptyText(),
  route: enumeration(['conventional', 'lighting']),
  creditedUnits: nonNegativeInteger(),
  requiredUnits: nonNegativeInteger(),
  /** The sweep visit that opened the gate. Null between selection and that visit. */
  admittedWeek: nullable(nonNegativeInteger()),
  /** The next week a unit can credit; null before admission and once complete. */
  nextUnitWeek: nullable(nonNegativeInteger()),
  /** `admittedWeek + requiredUnits`; null before admission. */
  forecastShootingEntryWeek: nullable(nonNegativeInteger()),
  completedWeek: nullable(nonNegativeInteger()),
  /** The exact adoption the lighting route was earned from; null on the conventional route. */
  adoptionId: nullable(text()),
  stageFacilityId: nonEmptyText(),
  setId: nonEmptyText(),
  planRevision: nonNegativeInteger(),
})

// One reviewable recipe choice for one exact production, with the S4 disclosure
// pattern: `refusal` is the engine's own primary refusal (its thrown sentence)
// and `rejections` the full list this row was refused for, so a client never has
// to guess what a disabled row hid. `enabled` and `refusal` never disagree.
const StudioSetupRecipeAction = object('StudioSetupRecipeAction', {
  /** `setup-recipe-<productionId>-<recipeId>`. */
  id: nonEmptyText(),
  productionId: nonEmptyText(),
  recipeId: nonEmptyText(),
  /** The plan revision this row was quoted against — the commit's own staleness key. */
  planRevision: nonNegativeInteger(),
  label: nonEmptyText(),
  detail: text(),
  enabled: bool(),
  disabledReason: nullable(text()),
  rejections: array(nonEmptyText()),
  refusal: nullable(text()),
  intent: nullable(reference('StudioBridgeIntentOption', StudioBridgeIntentOption)),
})

const StudioProductionOperationsSnapshot = object('StudioProductionOperationsSnapshot', {
  productionId: nonEmptyText(),
  title: nonEmptyText(),
  phase: enumeration([
    'legacy',
    'development',
    'preProduction',
    'rehearsal',
    'shooting',
    'postProduction',
    'releaseReady',
  ]),
  phaseLabel: nonEmptyText(),
  weeksRemaining: nonNegativeInteger(),
  progress01: ratio(),
  locationBuildingId: nullable(nonEmptyText()),
  facilityLabel: nonEmptyText(),
  directorId: nonEmptyText(),
  directorName: nonEmptyText(),
  leadId: optional(nonEmptyText()),
  leadName: optional(nonEmptyText()),
  companyMembers: optional(array(reference(
    'StudioProductionCompanyMemberSnapshot',
    StudioProductionCompanyMemberSnapshot,
  ))),
  taskStatus: nullable(enumeration(['unassigned', 'blocked', 'ready', 'scheduled', 'completed'])),
  statusLabel: nonEmptyText(),
  blocker: nullable(reference('StudioProductionBlockerSnapshot', StudioProductionBlockerSnapshot)),
  attention: enumeration([
    'normal',
    'active',
    'positive',
    'warning',
    'decision-required',
    'empty',
    'future',
    'recently-completed',
  ]),
  currentCommand: nullable(reference('StudioProductionCommandSnapshot', StudioProductionCommandSnapshot)),
  // ── P05A W2 closed-row fields. REQUIRED on the wire: the adapter always
  //    emits them (managed rows from the composition, legacy rows as honest
  //    status-unavailable defaults), so absence fails closed at the boundary. ──
  conceptId: nonEmptyText(),
  operationalState: enumeration([
    'development-working',
    'pre-production-working',
    'rehearsal-working',
    'director-required',
    'scenery-in-transit',
    'scenery-arrival-pending',
    'legacy-load-in-acknowledgment',
    'ready-to-schedule',
    'shooting-working',
    'resource-wait',
    'wrapped-waiting-for-post',
    'post-handoff',
    'release-ready',
    'release-committed',
    'status-unavailable',
  ]),
  stateLabel: nonEmptyText(),
  stateWeeksRemaining: nullable(nonNegativeInteger()),
  nextMilestone: nonEmptyText(),
  worksiteResolution: enumeration(['exact', 'none', 'withheld']),
  ownedWorksites: array(reference(
    'StudioProductionTargetSnapshot',
    StudioProductionTargetSnapshot,
  )),
  primaryWorkTarget: nullable(reference(
    'StudioProductionTargetSnapshot',
    StudioProductionTargetSnapshot,
  )),
  relatedTargets: array(reference(
    'StudioProductionTargetSnapshot',
    StudioProductionTargetSnapshot,
  )),
  locateTargets: array(reference(
    'StudioProductionTargetSnapshot',
    StudioProductionTargetSnapshot,
  )),
  stageFacilityId: nullable(text()),
  stageBuildingId: nullable(text()),
  currentSetId: nullable(text()),
  blockerAnatomy: nullable(reference(
    'StudioProductionBlockerAnatomySnapshot',
    StudioProductionBlockerAnatomySnapshot,
  )),
  wrapReceipt: nullable(reference('StudioWrapReceiptSnapshot', StudioWrapReceiptSnapshot)),
  // ── P13B-S5-R07 (projection 38). OPTIONAL, and the reason is stated rather
  //    than assumed: these two members are added at the BRIDGE boundary
  //    (`bridge/productionSetup.ts`, composed in `BridgeSession.snapshotFor`),
  //    not by the broad lot selector every other member here comes from, so a
  //    raw `studioLotSnapshot()` row carries neither. Every SERVED row carries
  //    both — `setup` explicitly null when this production has no setup plan,
  //    `setupRecipeActions` empty once the picture has entered Shooting. ──
  setup: optional(nullable(reference('StudioProductionSetup', StudioProductionSetup))),
  setupRecipeActions: optional(array(reference('StudioSetupRecipeAction', StudioSetupRecipeAction))),
})

const StudioPersonSnapshot = object('StudioPersonSnapshot', {
  id: nonEmptyText(),
  name: nonEmptyText(),
  role: enumeration(['director', 'talent']),
  authority: enumeration(['active-production', 'studio-roster', 'district-managed']),
  productionId: nullable(text()),
  productionTitle: nullable(text()),
})

const StudioPresencePersonSnapshot = object('StudioPresencePersonSnapshot', {
  talentId: nonEmptyText(),
  name: nonEmptyText(),
  creativeRole: enumeration(['actor', 'director', 'writer', 'craft', 'scientist']),
  engagement: enumeration(['production', 'script', 'casting', 'roster', 'research']),
  credit: nullable(enumeration([
    'writer',
    'director',
    'lead',
    'antagonist',
    'support',
    'craft',
    'auditionee',
    'scientist',
  ])),
  ownerId: nullable(text()),
  facilityId: nullable(text()),
  slot: nullable(nonNegativeInteger()),
  beats: array(enumeration(['home', 'travel', 'at-site', 'waiting'])),
  blockedReason: nullable(text()),
  facilityName: nullable(text()),
  workTitle: nullable(text()),
  activity: nullable(text()),
})

const StudioPresenceSnapshot = object('StudioPresenceSnapshot', {
  week: nonNegativeInteger(),
  beatsPerWeek: integer({ minimum: 1 }),
  staticBeat: nonNegativeInteger(),
  people: array(reference('StudioPresencePersonSnapshot', StudioPresencePersonSnapshot)),
  withheldTalentIds: array(nonEmptyText()),
})

const StudioParcelSnapshot = object('StudioParcelSnapshot', {
  id: nonEmptyText(),
  label: nonEmptyText(),
  terrain: enumeration(['buildable', 'blocked']),
  rect: reference('StudioGridRectSnapshot', StudioGridRectSnapshot),
  roadFrontage: bool(),
  occupiedCells: nonNegativeInteger(),
  placedFacilityIds: array(nonNegativeInteger()),
})

const StudioPlacementMutationBlockSnapshot = object('StudioPlacementMutationBlockSnapshot', {
  code: enumeration(['regimeNotReady', 'unknownPlacement', 'foundingPlacement', 'facilityEngaged']),
})

const StudioPlacementMutationSnapshot = object('StudioPlacementMutationSnapshot', {
  canMove: bool(),
  canDemolish: bool(),
  blocked: nullable(reference(
    'StudioPlacementMutationBlockSnapshot',
    StudioPlacementMutationBlockSnapshot,
  )),
  demolitionRefund: nonNegativeInteger(),
})

const StudioPlacedFacilitySnapshot = object('StudioPlacedFacilitySnapshot', {
  id: nonNegativeInteger(),
  blueprintId: nonEmptyText(),
  capability: optional(nonEmptyText()),
  name: nonEmptyText(),
  facilityId: nonEmptyText(),
  parcelId: nonEmptyText(),
  origin: reference('StudioGridCellSnapshot', StudioGridCellSnapshot),
  cells: array(reference('StudioGridCellSnapshot', StudioGridCellSnapshot)),
  status: enumeration(['underConstruction', 'operational']),
  placedWeek: nonNegativeInteger(),
  completesWeek: nonNegativeInteger(),
  weeksRemaining: nonNegativeInteger(),
  progress01: ratio(),
  weeklyOperatingCost: nonNegativeInteger(),
  mutation: optional(reference('StudioPlacementMutationSnapshot', StudioPlacementMutationSnapshot)),
})

/** One unmet requirement in the engine's own player copy (P09 §10.3 / C1-M5). */
const StudioPlacementUnmetRequirementSnapshot = object('StudioPlacementUnmetRequirementSnapshot', {
  kind: nonEmptyText(),
  reason: nonEmptyText(),
  notYetAttainable: bool(),
})

const StudioPlacementCatalogEntrySnapshot = object('StudioPlacementCatalogEntrySnapshot', {
  blueprintId: nonEmptyText(),
  name: nonEmptyText(),
  capability: nonEmptyText(),
  capacity: nonNegativeInteger(),
  footprint: reference('StudioFootprintSnapshot', StudioFootprintSnapshot),
  clearanceRing: nonNegativeInteger(),
  requiresRoadAccess: bool(),
  buildWeeks: nonNegativeInteger(),
  cost: nonNegativeInteger(),
  weeklyOperatingCost: nonNegativeInteger(),
  affordable: bool(),
  effectSummary: nonEmptyText(),
  available: bool(),
  /** P09 §10.3: the exact engine-published reasons a row is unavailable, in order. */
  unmet: array(reference('StudioPlacementUnmetRequirementSnapshot', StudioPlacementUnmetRequirementSnapshot)),
  maxInstances: nullable(nonNegativeInteger()),
  /** The allowance in force is used up — a separately worded lock. */
  atInstanceLimit: bool(),
  buildable: bool(),
  instanceCount: nonNegativeInteger(),
  /** P09 §10.3: the ONE row a bare lot must build next (a tag, never an unlock). */
  neededNow: bool(),
})

const StudioPlacementSnapshot = object('StudioPlacementSnapshot', {
  mode: enumeration(['legacy', 'managed']),
  currentWeek: nonNegativeInteger(),
  buildEnabled: bool(),
  lotWidth: integer({ minimum: 1 }),
  lotDepth: integer({ minimum: 1 }),
  parcels: array(reference('StudioParcelSnapshot', StudioParcelSnapshot)),
  placements: array(reference('StudioPlacedFacilitySnapshot', StudioPlacedFacilitySnapshot)),
  catalog: array(reference(
    'StudioPlacementCatalogEntrySnapshot',
    StudioPlacementCatalogEntrySnapshot,
  )),
  weeklyOperatingCost: nonNegativeInteger(),
})

const StudioPropertyBoundsSnapshot = object('StudioPropertyBoundsSnapshot', {
  width: integer({ minimum: 1 }),
  depth: integer({ minimum: 1 }),
})

const StudioPropertyBuildingSnapshot = object('StudioPropertyBuildingSnapshot', {
  id: nonEmptyText(),
  label: nonEmptyText(),
  role: enumeration(['landmark', 'founding', 'parcel', 'placed']),
  origin: reference('StudioGridCellSnapshot', StudioGridCellSnapshot),
  footprint: reference('StudioFootprintSnapshot', StudioFootprintSnapshot),
  placedFacilityId: optional(nonNegativeInteger()),
  blueprintId: optional(nonEmptyText()),
  capability: optional(nonEmptyText()),
  status: optional(enumeration(['underConstruction', 'operational'])),
})

const StudioPropertySnapshot = object('StudioPropertySnapshot', {
  bounds: reference('StudioPropertyBoundsSnapshot', StudioPropertyBoundsSnapshot),
  buildings: array(reference('StudioPropertyBuildingSnapshot', StudioPropertyBuildingSnapshot)),
  /** P09 §16: the persisted founding regime — exact history, never inferred from the buildings. */
  regime: enumeration(['endowed', 'bare-lot']),
  /** P09 W1b: the engine's road rectangles (half-open), the ground road-frontage is judged against. */
  roads: array(reference('StudioGridRectSnapshot', StudioGridRectSnapshot)),
})

const StudioWeekTheaterSubjectSnapshot = object('StudioWeekTheaterSubjectSnapshot', {
  kind: enumeration([
    'scenery-in-transit',
    'stage-hot',
    'stage-dark',
    'set-mounting',
    'set-struck',
    'wrap-clearing',
    'company-waiting',
    'queue-waiting',
    'construction-progressing',
  ]),
  id: nonEmptyText(),
  facilityId: nullable(text()),
  facilityName: nullable(text()),
  productionId: nullable(text()),
  productionTitle: nullable(text()),
  phase: nullable(text()),
  setId: nullable(text()),
  weeksRemaining: nullable(nonNegativeInteger()),
  distance: nullable(number({ minimum: 0 })),
  reason: nullable(text()),
  beats: array(enumeration(['idle', 'travel', 'working', 'waiting', 'clearing'])),
})

const StudioWeekTheaterSnapshot = object('StudioWeekTheaterSnapshot', {
  week: nonNegativeInteger(),
  beatsPerWeek: integer({ minimum: 1 }),
  staticBeat: nonNegativeInteger(),
  subjects: array(reference(
    'StudioWeekTheaterSubjectSnapshot',
    StudioWeekTheaterSubjectSnapshot,
  )),
})

const StudioStageSnapshot = object('StudioStageSnapshot', {
  facilityId: nonEmptyText(),
  facilityName: nonEmptyText(),
  buildingId: nonEmptyText(),
  origin: enumeration(['founding', 'placed']),
  standing: bool(),
})

const StudioSetCatalogEntrySnapshot = object('StudioSetCatalogEntrySnapshot', {
  blueprintId: nonEmptyText(),
  name: nonEmptyText(),
  setType: nonEmptyText(),
  quality: number({ minimum: 0, maximum: 100 }),
  cost: nonNegativeInteger(),
  buildWeeks: nonNegativeInteger(),
  affordable: bool(),
})

const StudioSetSnapshot = object('StudioSetSnapshot', {
  id: nonEmptyText(),
  name: nonEmptyText(),
  locationLabel: nonEmptyText(),
  mountedOnFacilityId: nonEmptyText(),
  status: enumeration(['under-construction', 'standing', 'retired']),
  repairing: bool(),
  completesWeek: nullable(nonNegativeInteger()),
  weeksRemaining: nonNegativeInteger(),
  quality: number({ minimum: 0, maximum: 100 }),
  condition: number({ minimum: 0, maximum: 100 }),
  novelty: ratio(),
  usable: bool(),
  sceneryFacilityId: nullable(text()),
})

// ── LL-CP9: Gate-to-Founding World Interaction ───────────────────────────────
//
// The founding-arrival view is a READ-ONLY presentation join, not a second
// hiring model: every arrival is one currently-offerable founding applicant,
// keyed to the EXACT opaque signFoundingContract intentId the same snapshot
// emits in availableIntents. Identity, pricing, legality, potential, and the
// consequence preview are all authored here by the TypeScript authority;
// Unity may only place, select, and dispatch.

const foundingRole = () => enumeration(['actor', 'director', 'writer', 'craft', 'scientist'])

const StudioFoundingArrivalSnapshot = object('StudioFoundingArrivalSnapshot', {
  talentId: nonEmptyText(),
  name: nonEmptyText(),
  role: foundingRole(),
  roleLabel: nonEmptyText(),
  ovr: integer({ minimum: 0, maximum: 100 }),
  ovrTier: nonEmptyText(),
  /**
   * Star Power. The engine bounds fame to 0..100 (worldgen truncated normal;
   * per-film deltas re-clamped to 0..100) but never rounds it — it is a
   * CONTINUOUS number, not an integer. A stat block may round for display.
   */
  fame: number({ minimum: 0, maximum: 100 }),
  potentialTier: nonEmptyText(),
  potentialHigh: integer({ minimum: 0, maximum: 100 }),
  /** Visible work ethic. Engine law (D-9.11): an integer in 1..99. */
  workEthic: integer({ minimum: 1, maximum: 99 }),
  workEthicLabel: nonEmptyText(),
  /**
   * Relative market standing: the D-11.C percentile of this person's primary
   * OVR within the matching working population, rounded to a whole 0..100.
   */
  standingPct: number({ minimum: 0, maximum: 100 }),
  /** Plain-language tier for standingPct (standingTier() — approximate by law). */
  standingTier: nonEmptyText(),
  age: integer({ minimum: 0 }),
  topStrengths: array(nonEmptyText()),
  primaryConcern: nullable(text()),
  /**
   * The one authoritative specialty signal: the highest PERCEIVED genre
   * experience in the primary discipline (worldgen genreExperience, 0..100).
   * Null label/value when every perceived cell is 0 — honest absence, never
   * a manufactured strength. Ties break by GENRE_ORDER; the tied flag keeps
   * a shared top honest. The second signal exists only when a second
   * non-zero cell does.
   */
  topGenreLabel: nullable(text()),
  topGenreExperience: nullable(integer({ minimum: 0, maximum: 100 })),
  topGenreTied: bool(),
  secondGenreLabel: nullable(text()),
  secondGenreExperience: nullable(integer({ minimum: 0, maximum: 100 })),
  weeklySalary: number({ minimum: 0 }),
  annualSalary: number({ minimum: 0 }),
  signingBonus: number({ minimum: 0 }),
  guaranteedComp: number({ minimum: 0 }),
  totalObligation: number({ minimum: 0 }),
  termWeeks: integer({ minimum: 1 }),
  /** True on the optional post-coverage reserve-Actor wave — never a founding gate. */
  reserve: bool(),
  /** The exact opaque intent this arrival dispatches; matches availableIntents. */
  intentId: nonEmptyText(),
  payrollAfterWeekly: number({ minimum: 0 }),
  fundAfter: number(),
  runwayAfterWeeks: nullable(integer()),
  runwayAfterInfinite: bool(),
})

const StudioFoundingRoleProgressSnapshot = object('StudioFoundingRoleProgressSnapshot', {
  role: foundingRole(),
  label: nonEmptyText(),
  count: nonNegativeInteger(),
  min: integer({ minimum: 1 }),
  met: bool(),
})

/**
 * One signed founding contract, in signing order — a founding is exact
 * humans, not a tally (v8; hostile review #2). Names come from the engine's
 * own talent records via each contract's talentId.
 */
const StudioFoundingSignedSnapshot = object('StudioFoundingSignedSnapshot', {
  name: nonEmptyText(),
  roleLabel: nonEmptyText(),
})

const StudioFoundingSnapshot = object('StudioFoundingSnapshot', {
  /** The profession currently arriving at the gate; null once nothing is offered. */
  waveRole: nullable(foundingRole()),
  waveRoleLabel: nullable(text()),
  /** True when the current wave is the optional reserve-Actor offer. */
  waveReserve: bool(),
  arrivals: array(reference('StudioFoundingArrivalSnapshot', StudioFoundingArrivalSnapshot)),
  /** Every contract signed so far, in signing order. */
  signed: array(reference('StudioFoundingSignedSnapshot', StudioFoundingSignedSnapshot)),
  progress: array(reference(
    'StudioFoundingRoleProgressSnapshot',
    StudioFoundingRoleProgressSnapshot,
  )),
  recruitmentFund: number(),
  projectedWeeklyPayroll: number({ minimum: 0 }),
  projectedRunwayWeeks: nullable(integer()),
  projectedRunwayInfinite: bool(),
  /** Core coverage (3/1/1/1) is met and foundStudio is emitted — the player's law. */
  readyToFound: bool(),
})

/**
 * The persistent tycoon pulse (LL-CP9): the authoritative money facts a HUD may
 * state without a workspace. All values are the engine's own D-12/D-17A read
 * models — cash, the ONE runway rule, and the founding-guarded weekly burn
 * (0 during a founding draft, when the tick charges nothing).
 */
const StudioTreasurySnapshot = object('StudioTreasurySnapshot', {
  cash: number(),
  weeklyBurn: number({ minimum: 0 }),
  /**
   * Contracted payroll COMPONENT (FinanceView.weeklyPayroll). Post-founding,
   * burn = payroll + overhead; during a founding draft the tick charges
   * nothing, so burn is 0 while this still reports the contracted amount.
   */
  weeklyPayroll: number({ minimum: 0 }),
  netWeeklyCash: number(),
  runwayWeeks: nullable(integer()),
  runwayInfinite: bool(),
})

// ── P03A: Development-from-the-Lot — the Development board and the quote seam ─
//
// Package 03 (accepted 2d285e5). The physical Development building becomes the
// primary owner of screenplay work, so the bundle gains ONE new projection: the
// TypeScript-authored Development board (capacity, projects, the commission
// board with its creative catalog, and the review context with the qualitative
// assessment basis and the deterministic rewrite preview). The commission
// choice space cannot fan out as pre-resolved intents, so the protocol gains a
// QUOTE exchange: Unity posts the player's draft selections; TypeScript
// validates them against the live state, mints ONE opaque digest-bound commit
// intent, and answers with the exact consequence summary. Unity then submits
// only that intentId through the ordinary /command route. C# never constructs
// an engine payload and never caches legality.

const developmentGenre = () =>
  enumeration(['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure'])

const estimateBand = () => enumeration(['Fragile', 'Workable', 'Promising', 'Strong'])

const developmentBlockerKind = () =>
  enumeration([
    'script-mode',
    'operations-mode',
    'studio-founding',
    'facility-capacity',
    'writer-contract',
    'writer-assignment',
    'package-staffing',
    'casting-session',
    'greenlight-queued',
    'no-concepts',
    'no-writers',
  ])

const StudioDevelopmentBlockerSnapshot = object('StudioDevelopmentBlockerSnapshot', {
  kind: developmentBlockerKind(),
  headline: nonEmptyText(),
  detail: nonEmptyText(),
  remedy: nonEmptyText(),
})

const StudioScriptAssessmentSnapshot = object('StudioScriptAssessmentSnapshot', {
  /** The required player-facing uncertainty marker, authored as `Est.`. */
  label: nonEmptyText(),
  /** Persisted PERCEIVED strength only — never the hidden actual value. */
  score: number({ minimum: 0, maximum: 100 }),
  band: estimateBand(),
  strengths: array(nonEmptyText()),
  concerns: array(nonEmptyText()),
})

const StudioDevelopmentOccupantSnapshot = object('StudioDevelopmentOccupantSnapshot', {
  owner: enumeration(['production', 'script', 'casting']),
  ownerId: nonEmptyText(),
  activity: enumeration(['production-development', 'drafting', 'rewriting', 'auditioning']),
  title: nonEmptyText(),
  label: nonEmptyText(),
})

const StudioDevelopmentSlotSnapshot = object('StudioDevelopmentSlotSnapshot', {
  slot: nonNegativeInteger(),
  occupant: nullable(reference('StudioDevelopmentOccupantSnapshot', StudioDevelopmentOccupantSnapshot)),
})

const StudioDevelopmentFacilitySnapshot = object('StudioDevelopmentFacilitySnapshot', {
  facilityId: nonEmptyText(),
  facilityName: nonEmptyText(),
  capacity: nonNegativeInteger(),
  occupied: nonNegativeInteger(),
  available: nonNegativeInteger(),
  slots: array(reference('StudioDevelopmentSlotSnapshot', StudioDevelopmentSlotSnapshot)),
})

const StudioDevelopmentCapacitySnapshot = object('StudioDevelopmentCapacitySnapshot', {
  capacity: nonNegativeInteger(),
  occupied: nonNegativeInteger(),
  available: nonNegativeInteger(),
  facilities: array(reference('StudioDevelopmentFacilitySnapshot', StudioDevelopmentFacilitySnapshot)),
})

const StudioDevelopmentProjectSnapshot = object('StudioDevelopmentProjectSnapshot', {
  projectId: nonEmptyText(),
  section: enumeration(['needsReview', 'inDevelopment', 'readyToPackage', 'productionHistory']),
  title: nonEmptyText(),
  genre: developmentGenre(),
  status: enumeration(['drafting', 'review', 'rewriting', 'ready', 'inProduction', 'produced']),
  statusLabel: nonEmptyText(),
  rewriteCount: integer({ minimum: 0, maximum: 1 }),
  dueWeek: nullable(nonNegativeInteger()),
  weeksUntilDecision: nullable(nonNegativeInteger()),
  writerId: nonEmptyText(),
  writerName: nonEmptyText(),
  consequence: nonEmptyText(),
  /**
   * R3-N4-SIM-20: the engine's own per-screenplay attention, so the client never
   * re-derives one from `status`. Same vocabulary as `StudioCastingProjectSnapshot`.
   */
  attention: recordAttention(),
  assessment: nullable(reference('StudioScriptAssessmentSnapshot', StudioScriptAssessmentSnapshot)),
  facilityName: nullable(text()),
  slot: nullable(nonNegativeInteger()),
})

const StudioCommissionConceptSnapshot = object('StudioCommissionConceptSnapshot', {
  id: nonEmptyText(),
  title: nonEmptyText(),
  genre: developmentGenre(),
  provenanceLabel: nonEmptyText(),
  origin: enumeration(['original', 'pool']),
})

const StudioCommissionWriterSnapshot = object('StudioCommissionWriterSnapshot', {
  id: nonEmptyText(),
  name: nonEmptyText(),
  primaryRole: enumeration(['writer', 'director', 'actor', 'craft', 'scientist']),
  estimateLabel: nonEmptyText(),
  estimateScore: number({ minimum: 0, maximum: 100 }),
  available: bool(),
  assignmentLabel: nullable(text()),
})

const StudioCommissionOfficeUpliftSnapshot = object('StudioCommissionOfficeUpliftSnapshot', {
  name: nonEmptyText(),
  points: nonNegativeInteger(),
  line: nonEmptyText(),
})

const StudioCommissionChoiceSnapshot = object('StudioCommissionChoiceSnapshot', {
  id: nonEmptyText(),
  title: nonEmptyText(),
})

const StudioCommissionSegmentSnapshot = object('StudioCommissionSegmentSnapshot', {
  id: enumeration(['youngAdult', 'family', 'adult', 'prestige']),
  label: nonEmptyText(),
})

const StudioCommissionPromiseAxisSnapshot = object('StudioCommissionPromiseAxisSnapshot', {
  id: enumeration(['intimacy', 'tonalWeight', 'kineticEnergy']),
  title: nonEmptyText(),
  description: nonEmptyText(),
  /** Exactly four authored center labels, lowest center first. */
  centerLabels: array(nonEmptyText()),
})

const StudioCommissionGenreSnapshot = object('StudioCommissionGenreSnapshot', {
  id: developmentGenre(),
  label: nonEmptyText(),
})

const StudioCommissionCatalogSnapshot = object('StudioCommissionCatalogSnapshot', {
  openings: array(reference('StudioCommissionChoiceSnapshot', StudioCommissionChoiceSnapshot)),
  midpoints: array(reference('StudioCommissionChoiceSnapshot', StudioCommissionChoiceSnapshot)),
  endings: array(reference('StudioCommissionChoiceSnapshot', StudioCommissionChoiceSnapshot)),
  segments: array(reference('StudioCommissionSegmentSnapshot', StudioCommissionSegmentSnapshot)),
  genres: array(reference('StudioCommissionGenreSnapshot', StudioCommissionGenreSnapshot)),
  promiseAxes: array(reference(
    'StudioCommissionPromiseAxisSnapshot',
    StudioCommissionPromiseAxisSnapshot,
  )),
})

const StudioCommissionBoardSnapshot = object('StudioCommissionBoardSnapshot', {
  canStart: bool(),
  canStartOriginal: bool(),
  canSubmitMarketIntent: bool(),
  canSubmitOriginalIntent: bool(),
  willQueueIntent: bool(),
  consequence: nonEmptyText(),
  concepts: array(reference('StudioCommissionConceptSnapshot', StudioCommissionConceptSnapshot)),
  writers: array(reference('StudioCommissionWriterSnapshot', StudioCommissionWriterSnapshot)),
  blockers: array(reference('StudioDevelopmentBlockerSnapshot', StudioDevelopmentBlockerSnapshot)),
  officeUplift: nullable(reference(
    'StudioCommissionOfficeUpliftSnapshot',
    StudioCommissionOfficeUpliftSnapshot,
  )),
  catalog: reference('StudioCommissionCatalogSnapshot', StudioCommissionCatalogSnapshot),
})

const StudioScriptExplanationSnapshot = object('StudioScriptExplanationSnapshot', {
  label: nonEmptyText(),
  finding: nonEmptyText(),
  tone: enumeration(['strength', 'concern', 'neutral']),
})

const StudioScriptBriefSnapshot = object('StudioScriptBriefSnapshot', {
  openingTitle: nonEmptyText(),
  midpointTitle: nonEmptyText(),
  endingTitle: nonEmptyText(),
  segmentLabels: array(nonEmptyText()),
  promiseLines: array(nonEmptyText()),
})

const StudioScriptAcceptCardSnapshot = object('StudioScriptAcceptCardSnapshot', {
  label: nonEmptyText(),
  lines: array(nonEmptyText()),
})

const StudioRewritePreviewSnapshot = object('StudioRewritePreviewSnapshot', {
  currentScore: number({ minimum: 0, maximum: 100 }),
  currentBand: estimateBand(),
  projectedScore: number({ minimum: 0, maximum: 100 }),
  projectedBand: estimateBand(),
  delta: number(),
  direction: enumeration(['gain', 'unchanged', 'decline']),
  currentLine: nonEmptyText(),
  projectedLine: nonEmptyText(),
  directionLine: nonEmptyText(),
  dueWeek: nonNegativeInteger(),
  writerName: nonEmptyText(),
  capacityLine: nonEmptyText(),
  operatingLine: nonEmptyText(),
  projectionNote: nonEmptyText(),
})

const StudioScriptRewriteCardSnapshot = object('StudioScriptRewriteCardSnapshot', {
  available: bool(),
  label: nullable(text()),
  blockers: array(reference('StudioDevelopmentBlockerSnapshot', StudioDevelopmentBlockerSnapshot)),
  preview: nullable(reference('StudioRewritePreviewSnapshot', StudioRewritePreviewSnapshot)),
})

const StudioScriptReviewSnapshot = object('StudioScriptReviewSnapshot', {
  projectId: nonEmptyText(),
  title: nonEmptyText(),
  genre: developmentGenre(),
  reviewState: enumeration(['first-draft', 'final-draft']),
  writerId: nonEmptyText(),
  writerName: nonEmptyText(),
  writerRoleLabel: nonEmptyText(),
  provenanceLabel: nullable(text()),
  deliveryLine: nullable(text()),
  assessment: nullable(reference('StudioScriptAssessmentSnapshot', StudioScriptAssessmentSnapshot)),
  whyThisEstimate: array(reference(
    'StudioScriptExplanationSnapshot',
    StudioScriptExplanationSnapshot,
  )),
  brief: reference('StudioScriptBriefSnapshot', StudioScriptBriefSnapshot),
  consequence: nonEmptyText(),
  accept: reference('StudioScriptAcceptCardSnapshot', StudioScriptAcceptCardSnapshot),
  rewrite: reference('StudioScriptRewriteCardSnapshot', StudioScriptRewriteCardSnapshot),
  finalNote: nullable(text()),
})

const StudioDevelopmentAttentionSnapshot = object('StudioDevelopmentAttentionSnapshot', {
  kind: enumeration([
    'review-required',
    'capacity-constraint',
    'active-work',
    'ready-script',
    'idle',
  ]),
  headline: nonEmptyText(),
  detail: nonEmptyText(),
})

const StudioDevelopmentBoardSnapshot = object('StudioDevelopmentBoardSnapshot', {
  /** The Development building's world status line, authored here. */
  worldStatus: nonEmptyText(),
  /** Non-null exactly while a review decision waits (world pennant text). */
  attentionPennant: nullable(text()),
  /** Non-null exactly while an accepted screenplay waits for Casting. */
  castingBoundaryLine: nullable(text()),
  attention: reference('StudioDevelopmentAttentionSnapshot', StudioDevelopmentAttentionSnapshot),
  capacity: reference('StudioDevelopmentCapacitySnapshot', StudioDevelopmentCapacitySnapshot),
  projects: array(reference('StudioDevelopmentProjectSnapshot', StudioDevelopmentProjectSnapshot)),
  commission: reference('StudioCommissionBoardSnapshot', StudioCommissionBoardSnapshot),
  review: nullable(reference('StudioScriptReviewSnapshot', StudioScriptReviewSnapshot)),
})

const StudioDevelopmentSnapshot = object('StudioDevelopmentSnapshot', {
  mode: enumeration(['legacy', 'managed']),
  /** Null outside a managed screenplay studio (legacy mode or an open founding draft). */
  board: nullable(reference('StudioDevelopmentBoardSnapshot', StudioDevelopmentBoardSnapshot)),
})

// ── P04A: Casting — the role-first package-assembly board and the casting quote seam ─
//
// Package 04 (§2.1). The Casting board composes castingSessionsReadModel +
// castingPackageReadModel + expiry notices into ONE role-first projection per
// Ready screenplay: candidate pools (director/lead/antagonist/support/craftLead),
// closed negative/marketing budget menus, screen-test evidence, and a
// greenlight-readiness summary. Every public signal is a SAFE PERCEIVED fact
// (role tier, genre experience, availability, contract/fee status) — never
// `talent.actual`, persona, temperament decomposition, RNG state, the run seed,
// or hidden ceilings. Mirrors the `development`/quote idiom exactly: the
// mode/board-nullable snapshot shape, and a second quote-request member
// (`quoteCasting`) alongside `quoteCommission` in the SAME union envelope.

const StudioCastingSignalSnapshot = object('StudioCastingSignalSnapshot', {
  kind: enumeration(['positive', 'concern', 'action']),
  text: nonEmptyText(),
})

const StudioCastingEvidenceSnapshot = object('StudioCastingEvidenceSnapshot', {
  talentId: nonEmptyText(),
  slot: enumeration(['lead', 'antagonist', 'support']),
  estimate: nonNegativeInteger(),
  low: nonNegativeInteger(),
  high: nonNegativeInteger(),
  testedWeek: nullable(nonNegativeInteger()),
  sessionId: nonEmptyText(),
})

const StudioBudgetOptionSnapshot = object('StudioBudgetOptionSnapshot', {
  amount: nonNegativeInteger(),
  label: nonEmptyText(),
})

const StudioCastingBlockerSnapshot = object('StudioCastingBlockerSnapshot', {
  code: nonEmptyText(),
  role: enumeration([
    'screenTest',
    'director',
    'lead',
    'antagonist',
    'support',
    'craftLead',
    'budget',
    'capacity',
    'session',
    'project',
  ]),
  talentId: nullable(text()),
  message: nonEmptyText(),
  currentHolderId: nullable(text()),
  remedy: nonEmptyText(),
})

const StudioCastingCandidateSnapshot = object('StudioCastingCandidateSnapshot', {
  talentId: nonEmptyText(),
  name: nonEmptyText(),
  professionLabel: nonEmptyText(),
  contractBadge: enumeration(['studio', 'freelancer']),
  ovr: nonNegativeInteger(),
  fit: nonNegativeInteger(),
  epLow: nonNegativeInteger(),
  epHigh: nonNegativeInteger(),
  epExpected: nonNegativeInteger(),
  genreExperienceLabel: nonEmptyText(),
  starPower: nonNegativeInteger(),
  available: bool(),
  availabilityLabel: nonEmptyText(),
  currentWorkLabel: nullable(text()),
  /**
   * P05A.3 §12: the authoritative week the person's current engagement ends
   * (production wrap / writing due), when the engine knows it. Null when not
   * busy or when no completion week is authoritative — never invented.
   */
  returnWeek: nullable(nonNegativeInteger()),
  projectCostAmount: nonNegativeInteger(),
  projectCostLabel: nonEmptyText(),
  signals: array(reference('StudioCastingSignalSnapshot', StudioCastingSignalSnapshot)),
  /** Role-specific to the pool this row sits in; null outside the lead/antagonist/support acting pools. */
  evidence: nullable(reference('StudioCastingEvidenceSnapshot', StudioCastingEvidenceSnapshot)),
})

const StudioCastingResultsSnapshot = object('StudioCastingResultsSnapshot', {
  lead: array(reference('StudioCastingEvidenceSnapshot', StudioCastingEvidenceSnapshot)),
  antagonist: array(reference('StudioCastingEvidenceSnapshot', StudioCastingEvidenceSnapshot)),
  support: array(reference('StudioCastingEvidenceSnapshot', StudioCastingEvidenceSnapshot)),
})

const StudioCastingReadinessSnapshot = object('StudioCastingReadinessSnapshot', {
  knownGatesClear: bool(),
  willQueue: bool(),
  blockers: array(reference('StudioCastingBlockerSnapshot', StudioCastingBlockerSnapshot)),
})

/** Identity + display name ONLY — no scores, no hidden facts. */
const StudioCastingSlateReadSnapshot = object('StudioCastingSlateReadSnapshot', {
  talentId: nonEmptyText(),
  name: nonEmptyText(),
})

/**
 * The authoritative committed screen-test slate for a project, grouped by
 * role. Populated whenever the project's casting session is queued,
 * auditioning, in review, or complete; null otherwise.
 */
const StudioCastingActiveSlateSnapshot = object('StudioCastingActiveSlateSnapshot', {
  lead: array(reference('StudioCastingSlateReadSnapshot', StudioCastingSlateReadSnapshot)),
  antagonist: array(reference('StudioCastingSlateReadSnapshot', StudioCastingSlateReadSnapshot)),
  support: array(reference('StudioCastingSlateReadSnapshot', StudioCastingSlateReadSnapshot)),
})

const StudioCastingProjectSnapshot = object('StudioCastingProjectSnapshot', {
  projectId: nonEmptyText(),
  title: nonEmptyText(),
  genre: developmentGenre(),
  writerId: nonEmptyText(),
  writerName: nonEmptyText(),
  sessionStatus: enumeration(['notStarted', 'queued', 'auditioning', 'review', 'complete']),
  sessionId: nullable(text()),
  dueWeek: nullable(nonNegativeInteger()),
  weeksUntilDecision: nullable(nonNegativeInteger()),
  /** The no-fee/no-hold/one-week copy from Core CASTING_SESSION_CONSEQUENCE. */
  consequence: nonEmptyText(),
  attention: recordAttention(),
  directorCandidates: array(reference('StudioCastingCandidateSnapshot', StudioCastingCandidateSnapshot)),
  leadCandidates: array(reference('StudioCastingCandidateSnapshot', StudioCastingCandidateSnapshot)),
  antagonistCandidates: array(reference('StudioCastingCandidateSnapshot', StudioCastingCandidateSnapshot)),
  supportCandidates: array(reference('StudioCastingCandidateSnapshot', StudioCastingCandidateSnapshot)),
  craftCandidates: array(reference('StudioCastingCandidateSnapshot', StudioCastingCandidateSnapshot)),
  results: nullable(reference('StudioCastingResultsSnapshot', StudioCastingResultsSnapshot)),
  negativeOptions: array(reference('StudioBudgetOptionSnapshot', StudioBudgetOptionSnapshot)),
  marketingOptions: array(reference('StudioBudgetOptionSnapshot', StudioBudgetOptionSnapshot)),
  packageReadiness: reference('StudioCastingReadinessSnapshot', StudioCastingReadinessSnapshot),
  greenlightQueued: bool(),
  auditionQueued: bool(),
  /** The authoritative active slate; null when no session (queued/auditioning/review/complete) exists. */
  activeSlate: nullable(reference('StudioCastingActiveSlateSnapshot', StudioCastingActiveSlateSnapshot)),
})

const StudioCastingExpiryNoticeSnapshot = object('StudioCastingExpiryNoticeSnapshot', {
  eventSeq: nonNegativeInteger(),
  queueOrdinal: nonNegativeInteger(),
  projectId: nonEmptyText(),
  title: nonEmptyText(),
  reason: nonEmptyText(),
  reviewActionLabel: nonEmptyText(),
})

/**
 * P05A.3 §10 — one authoritative contract-term offer (Core D-11.6 economics,
 * computed by contractOfferOptions; never re-derived client-side).
 */
const StudioContractOfferSnapshot = object('StudioContractOfferSnapshot', {
  termWeeks: nonNegativeInteger(),
  termLabel: nonEmptyText(),
  annualSalary: nonNegativeInteger(),
  signingBonus: nonNegativeInteger(),
  weeklySalary: nonNegativeInteger(),
  /** Weekly salary × term — the full guaranteed compensation of the contract. */
  guaranteedComp: nonNegativeInteger(),
  /** Signing bonus + guaranteed compensation: the total obligation signed into. */
  totalObligation: nonNegativeInteger(),
  /**
   * R3-N4-SIM-20: the D-12 solvency answer for THIS term's signing bonus, asked of
   * the same authority (`canAfford`) the sign door re-asks at commit. Presentation
   * only — it neither authorizes nor blocks anything.
   */
  affordable: bool(),
  /** The engine's own refusal sentence for this term, or null when none applies. */
  refusalReason: nullable(text()),
})

/**
 * P05A.3 §8/§11 — one signable person from the authoritative hiring market
 * (free agents first, then the rotating epoch sample). A hiring candidate is
 * NOT castable until a contract is accepted — the `kind` says which side of
 * that line they stand on.
 */
const StudioHiringCandidateSnapshot = object('StudioHiringCandidateSnapshot', {
  talentId: nonEmptyText(),
  name: nonEmptyText(),
  professionLabel: nonEmptyText(),
  /** The primary role key ('actor' | 'writer' | 'director' | 'craft'). */
  role: nonEmptyText(),
  ovr: nonNegativeInteger(),
  starPower: nonNegativeInteger(),
  genreExperienceLabel: nonEmptyText(),
  kind: enumeration(['free-agent', 'hiring-market']),
  availabilityLabel: nonEmptyText(),
  offers: array(reference('StudioContractOfferSnapshot', StudioContractOfferSnapshot)),
})

const StudioCastingBoardSnapshot = object('StudioCastingBoardSnapshot', {
  capacityLine: nonEmptyText(),
  projects: array(reference('StudioCastingProjectSnapshot', StudioCastingProjectSnapshot)),
  expiryNotices: array(reference('StudioCastingExpiryNoticeSnapshot', StudioCastingExpiryNoticeSnapshot)),
  /** P05A.3 §8: every currently signable person (free agents + hiring market). */
  hiringCandidates: array(reference('StudioHiringCandidateSnapshot', StudioHiringCandidateSnapshot)),
  /** P05A.3 §13: the authoritative week the freelancer-market epoch next rotates. */
  freelancerMarketRefreshWeek: nonNegativeInteger(),
})

const StudioCastingSnapshot = object('StudioCastingSnapshot', {
  mode: enumeration(['legacy', 'managed']),
  /** Null outside a managed screenplay studio (legacy mode or an open founding draft). */
  board: nullable(reference('StudioCastingBoardSnapshot', StudioCastingBoardSnapshot)),
})

const StudioCommissionDraftPayload = object('StudioCommissionDraftPayload', {
  source: enumeration(['market', 'original']),
  /** Required exactly when source is `market`. */
  conceptId: nullable(text()),
  /** Required exactly when source is `original`. */
  genre: nullable(developmentGenre()),
  writerId: nonEmptyText(),
  opening: enumeration(['immediateAction', 'slowSetup', 'mysteryHook']),
  midpoint: enumeration(['reversal', 'escalation', 'revelation']),
  ending: enumeration(['triumph', 'bittersweet', 'tragic', 'ambiguous']),
  intendedSegments: array(enumeration(['youngAdult', 'family', 'adult', 'prestige'])),
  /** Center indices into the authored promise grid; the width stays TypeScript law. */
  intimacyCenter: integer({ minimum: 0, maximum: 3 }),
  tonalWeightCenter: integer({ minimum: 0, maximum: 3 }),
  kineticEnergyCenter: integer({ minimum: 0, maximum: 3 }),
})

const StudioCommissionQuoteSnapshot = object('StudioCommissionQuoteSnapshot', {
  /** The ONE opaque digest-bound commit intent this quote mints. */
  intentId: nonEmptyText(),
  kind: enumeration(['commissionScreenplay', 'commissionOriginalScreenplay']),
  commitLabel: nonEmptyText(),
  startsNow: bool(),
  queues: bool(),
  /** The adapted premise title; null for an original (its title is minted at commit). */
  title: nullable(text()),
  writerName: nonEmptyText(),
  draftWeeks: nullable(nonNegativeInteger()),
  reviewWeek: nullable(nonNegativeInteger()),
  consequence: nonEmptyText(),
  paceNote: nullable(text()),
  richnessNote: nullable(text()),
  officeUpliftLine: nullable(text()),
  noFeeLine: nonEmptyText(),
  queueNote: nullable(text()),
})

// P04A: the request draft envelope, generalized from a single monomorphic
// object into a discriminated union member alongside `StudioQuoteCastingRequest`
// (the `StudioProductionCommandSnapshot` precedent). The wire shape of THIS
// member is byte-identical to the pre-P04A `StudioBridgeQuoteRequest` — only
// the registered definition name changed, to make room for the sibling member.
const StudioQuoteCommissionRequest = object('StudioQuoteCommissionRequest', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  expectedStateRevision: nonNegativeInteger(),
  type: literal('quoteCommission'),
  draft: reference('StudioCommissionDraftPayload', StudioCommissionDraftPayload),
})

// P04A (§2.1): ONE object, kind-discriminant, nullable-by-kind — the
// `StudioCommissionDraftPayload` precedent. Every field is always PRESENT on
// the wire (never `optional()`); "required exactly when kind=X" is a plain-
// language refusal enforced by `castingDraftToEngine` against the live read
// models, not a JSON Schema structural constraint.
const StudioCastingDraftPayload = object('StudioCastingDraftPayload', {
  kind: enumeration(['screenTest', 'greenlightPackage', 'signActor']),
  /** Hiring may have no screenplay; camera tests and greenlight require an exact Ready project. */
  projectId: nullable(nonEmptyText()),
  /** Required exactly when kind is `screenTest`; exactly 2 IDs each, enforced server-side. */
  slateLead: nullable(array(nonEmptyText())),
  slateAntagonist: nullable(array(nonEmptyText())),
  slateSupport: nullable(array(nonEmptyText())),
  /** Required exactly when kind is `greenlightPackage`. */
  directorId: nullable(text()),
  castLead: nullable(text()),
  castAntagonist: nullable(text()),
  castSupport: nullable(text()),
  craftLeadId: nullable(text()),
  /** Must equal a published negative/marketing menu amount — enforced server-side. */
  budgetNegative: nullable(nonNegativeInteger()),
  budgetMarketing: nullable(nonNegativeInteger()),
  /** Required exactly when kind is `signActor`: a published hiring candidate + a published term. */
  signTalentId: nullable(text()),
  signTermWeeks: nullable(nonNegativeInteger()),
})

const StudioQuoteCastingRequest = object('StudioQuoteCastingRequest', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  expectedStateRevision: nonNegativeInteger(),
  type: literal('quoteCasting'),
  draft: reference('StudioCastingDraftPayload', StudioCastingDraftPayload),
})

// ── P09 §18 — the placement quote family ─────────────────────────────────────
// A PREVIEW is a first-class answer (P09-REQ-013/015): an illegal spot returns an
// ACCEPTED quote with `ok:false`, every cell's verdict, the ordered rejections,
// the primary reason in player words, and NO commit intent. A legal spot mints
// the ONE digest-bound commit intent (`placeFacility`); commit revalidates.
const PLACEMENT_REJECTION_KINDS = [
  'unknownBlueprint',
  'offLot',
  'notOwned',
  'terrainUnbuildable',
  'groundReserved',
  'occupied',
  'clearanceRing',
  'noRoadAccess',
  'seversLot',
  'requirementsUnmet',
  'instanceLimit',
  'insufficientFunds',
] as const

const StudioPlacementDraftPayload = object('StudioPlacementDraftPayload', {
  /** Build (P09 core). Move/demolish are P09-R4 and are refused until then. */
  verb: enumeration(['build']),
  blueprintId: nonEmptyText(),
  origin: reference('StudioGridCellSnapshot', StudioGridCellSnapshot),
})

const StudioQuotePlacementRequest = object('StudioQuotePlacementRequest', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  expectedStateRevision: nonNegativeInteger(),
  type: literal('quotePlacement'),
  draft: reference('StudioPlacementDraftPayload', StudioPlacementDraftPayload),
})

// P09A W5 — a Set commission preview: a set blueprint on a named soundstage.
const SET_COMMISSION_REFUSAL_KINDS = [
  'notManaged',
  'unknownBlueprint',
  'unknownStage',
  'stageAlreadyDressed',
  'noSceneryCapacity',
  'insufficientFunds',
] as const

const StudioSetCommissionDraftPayload = object('StudioSetCommissionDraftPayload', {
  blueprintId: nonEmptyText(),
  stageFacilityId: nonEmptyText(),
})

const StudioQuoteSetCommissionRequest = object('StudioQuoteSetCommissionRequest', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  expectedStateRevision: nonNegativeInteger(),
  type: literal('quoteSetCommission'),
  draft: reference('StudioSetCommissionDraftPayload', StudioSetCommissionDraftPayload),
})

// ── P10-R1 — the contract quote family (renew / early release) ────────────────
// The existing D-11 actions (`renewContract`, `releaseTalent`) reached the client
// through no route. This family is that route: a consequence PREVIEW is an ACCEPTED
// quote (`ok:false` carries the engine's own refusal + reason — a closed renewal
// window, an unpublished term, the D-12 solvency gate, a screenplay task in
// progress); a legal preview mints the ONE digest-bound intent, and the commit
// re-asks the same authorities against the live state. The client never prices.
const CONTRACT_REFUSAL_KINDS = [
  'unknownTalent',
  'noActiveContract',
  'renewalWindowClosed',
  'unpublishedTerm',
  'insufficientFunds',
  'onScreenplayTask',
  // P14A.1 (projection 42): the person is under an open market case, so the
  // incumbent's renewal IS a proposal settled at the decision week — the engine's
  // own `underMarketCase` refusal (src/core/actions.ts, applyRenewContract).
  'underMarketCase',
] as const

const StudioContractDraftPayload = object('StudioContractDraftPayload', {
  verb: enumeration(['renew', 'release']),
  talentId: nonEmptyText(),
  /** Required exactly when verb is `renew`: one of the person's PUBLISHED renewal terms. */
  termWeeks: nullable(nonNegativeInteger()),
})

const StudioQuoteContractRequest = object('StudioQuoteContractRequest', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  expectedStateRevision: nonNegativeInteger(),
  type: literal('quoteContract'),
  draft: reference('StudioContractDraftPayload', StudioContractDraftPayload),
})

// ── P14B.1 (projection 45) — the promise facts a proposal row may carry ─────
// ORDERING-ONLY facts (companion §4.1: never free text, never a salary term). The
// three vocabularies are the engine's own unions verbatim; B.1 offers
// `APPEARANCE_COUNT` alone and refuses the other four families at quote, but the
// wire enumerates all five exactly as the engine's `PromiseFamily` does.
const PROMISE_FAMILIES = [
  'APPEARANCE_COUNT', 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', 'DIRECTING_COUNT',
  'PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT',
] as const
const PROMISE_CLASSIFICATIONS = ['REASONABLY_ACHIEVABLE', 'FRAGILE', 'IMPOSSIBLE'] as const
const PROMISE_OUTCOMES = ['SATISFIED', 'BROKEN', 'WAIVED', 'VOIDED'] as const
/** §4.5's public descriptor. No driver text on this projection (P14B.2). */
const TRUST_LABELS = ['Reliable', 'Mixed record', 'Distrusted'] as const

// ── P14A.1 — the market-proposal quote family (propose / revise / withdraw) ──
// The incumbent's renewal for a person under an open case is a PROPOSAL settled at
// the decision week (companion §2.1.3/R6), so it needs the same route the contract
// family already has. The draft names no issuer: the session always proposes as the
// player's own studio, so no client can author a rival's proposal.
const MARKET_PROPOSAL_REFUSAL_KINDS = [
  'unknownTalent',
  'noOpenCase',
  'notEligibleProposer',
  'unpublishedTerm',
  'unpublishedTier',
  'insufficientFunds',
  'noCurrentProposal',
] as const

// P14B.1: the promise a propose/revise draft may carry. The window is read against
// the SAME proposed contract the draft names (`startWeek` is the case's decision
// week, `termWeeks` the draft's own term), so the payload carries neither.
// P14B.4 (projection 47): a CLOSED union discriminated by `family`. The two members'
// `family` domains are disjoint, so the first-match `anyOf` is order-independent.
const PROMISE_SEAT_CLASSES = ['lead', 'leadOrAntagonist'] as const
const COUNT_ONLY_PROMISE_FAMILIES = [
  'APPEARANCE_COUNT', 'DIRECTING_COUNT', 'PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT',
] as const
const promiseDraftTerms = {
  count: integer({ minimum: 1 }),
  windowStartWeek: nonNegativeInteger(),
  dueWeekExclusive: nonNegativeInteger(),
}
/** A seat-class (P2) draft REQUIRES its explicitly selected class: no default, no optional. */
const StudioMarketProposalCastClassPromiseDraftPayload = object('StudioMarketProposalCastClassPromiseDraftPayload', {
  family: literal('LEAD_OR_SIGNIFICANT_ROLE_COUNT'),
  ...promiseDraftTerms,
  seatClass: enumeration(PROMISE_SEAT_CLASSES),
})
/** Every other catalogue family stays count-only; P3–P5 remain enumerated and engine-refused. */
const StudioMarketProposalCountPromiseDraftPayload = object('StudioMarketProposalCountPromiseDraftPayload', {
  family: enumeration(COUNT_ONLY_PROMISE_FAMILIES),
  ...promiseDraftTerms,
})
const StudioMarketProposalPromiseDraftPayload = union('StudioMarketProposalPromiseDraftPayload', [
  reference('StudioMarketProposalCastClassPromiseDraftPayload', StudioMarketProposalCastClassPromiseDraftPayload),
  reference('StudioMarketProposalCountPromiseDraftPayload', StudioMarketProposalCountPromiseDraftPayload),
] as const)
const StudioMarketProposalDraftPayload = object('StudioMarketProposalDraftPayload', {
  verb: enumeration(['propose', 'revise', 'withdraw']),
  talentId: nonEmptyText(),
  /** Required for propose/revise: one of the person's PUBLISHED terms. */
  termWeeks: nullable(integer({ minimum: 1 })),
  /** Required for propose/revise: one of the published premium tiers (1.00 is the floor). */
  premiumTier: nullable(number({ minimum: 1 })),
  /** OPTIONAL and ABSENT by default: a draft without a promise carries no member at
   * all, so every client written before projection 45 stays wire-legal. */
  promise: optional(reference('StudioMarketProposalPromiseDraftPayload', StudioMarketProposalPromiseDraftPayload)),
})

const StudioQuoteMarketProposalRequest = object('StudioQuoteMarketProposalRequest', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  expectedStateRevision: nonNegativeInteger(),
  type: literal('quoteMarketProposal'),
  draft: reference('StudioMarketProposalDraftPayload', StudioMarketProposalDraftPayload),
})

// ── P14B.8 (projection 50) — the waiver's propose leg ────────────────────────
// ITS OWN DRAFT PAYLOAD, not the market proposal's reused. The `family` domain
// enumerates ONLY the two families this surface offers, so `DIRECTING_COUNT`,
// `PREFERRED_GENRE_OPPORTUNITY` and `SPECIFIC_PROJECT` are unexpressible BY
// CONSTRUCTION: each of those reaches the engine's `NOT_OFFERED_IN_B1` refusal,
// which would publish the build vocabulary *a directing promise is not offered in
// this slice* to a player. The seat-class family REQUIRES its explicit class for
// exactly the same reason — a classless P2 publishes *a seat-class promise needs
// its seat class selected (lead, or lead-or-antagonist)*.
// The draft NAMES NO STUDIO. The issuer arrives implicitly through the promise id,
// and the bridge refuses every id whose issuer is not the player's own studio.
const StudioPromiseWaiverCastClassSubstituteDraftPayload = object('StudioPromiseWaiverCastClassSubstituteDraftPayload', {
  family: literal('LEAD_OR_SIGNIFICANT_ROLE_COUNT'),
  ...promiseDraftTerms,
  seatClass: enumeration(PROMISE_SEAT_CLASSES),
})
const StudioPromiseWaiverCountSubstituteDraftPayload = object('StudioPromiseWaiverCountSubstituteDraftPayload', {
  family: literal('APPEARANCE_COUNT'),
  ...promiseDraftTerms,
})
const StudioPromiseWaiverSubstituteDraftPayload = union('StudioPromiseWaiverSubstituteDraftPayload', [
  reference('StudioPromiseWaiverCastClassSubstituteDraftPayload', StudioPromiseWaiverCastClassSubstituteDraftPayload),
  reference('StudioPromiseWaiverCountSubstituteDraftPayload', StudioPromiseWaiverCountSubstituteDraftPayload),
] as const)
const StudioPromiseWaiverDraftPayload = object('StudioPromiseWaiverDraftPayload', {
  /** The player's OWN open promise. Every other id is refused at conversion. */
  promiseId: nonEmptyText(),
  substitute: reference('StudioPromiseWaiverSubstituteDraftPayload', StudioPromiseWaiverSubstituteDraftPayload),
})

const StudioQuoteWaivePromiseRequest = object('StudioQuoteWaivePromiseRequest', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  expectedStateRevision: nonNegativeInteger(),
  type: literal('quoteWaivePromise'),
  draft: reference('StudioPromiseWaiverDraftPayload', StudioPromiseWaiverDraftPayload),
})

const StudioBridgeQuoteRequest = union('StudioBridgeQuoteRequest', [
  reference('StudioQuoteCommissionRequest', StudioQuoteCommissionRequest),
  reference('StudioQuoteCastingRequest', StudioQuoteCastingRequest),
  reference('StudioQuotePlacementRequest', StudioQuotePlacementRequest),
  reference('StudioQuoteSetCommissionRequest', StudioQuoteSetCommissionRequest),
  reference('StudioQuoteContractRequest', StudioQuoteContractRequest),
  reference('StudioQuoteMarketProposalRequest', StudioQuoteMarketProposalRequest),
  reference('StudioQuoteWaivePromiseRequest', StudioQuoteWaivePromiseRequest),
] as const)

const StudioFinancialConsequence = object('StudioFinancialConsequence', {
  cashBefore: number(), immediateCashChange: number(), cashAfter: number(),
  weeklyOperatingCostBefore: number(), weeklyOperatingCostAfter: number(), weeklyPayrollChange: number(),
  netWeeklyCashflowBefore: number(), netWeeklyCashflowAfter: number(), runwayAfter: nonEmptyText(),
  guaranteesBefore: number(), guaranteesAfter: number(), currentBasis: nonEmptyText(),
  laterBeginsWeek: nullable(nonNegativeInteger()), laterOperatingCost: nullable(number()),
  laterNetWeeklyCashflow: nullable(number()), laterRunway: nullable(text()), laterBasis: nullable(text()), exclusions: nonEmptyText(),
})

// P14B.6 (projection 49) — the RELATIONSHIP READ MODELS. Every field they add is a
// LABEL, a SENTENCE or an INTEGER COUNT: no closeness, no edge id, no stored driver row,
// and NO DELTA MAGNITUDE ever (694-C Q2 — a resumed campaign can hold both a -4 and a -5
// sharedFailure on ONE edge, so a magnitude would show two numbers for one event class).
// The eight-rung ladder of `RELATIONSHIP_TIERS` (src/core/relationships.ts :45), restated
// here on the TRUST_LABELS precedent: this schema module imports no engine source. A rung
// added there and not here fails LOUDLY at the wire parse.
const RELATIONSHIP_TIER_LABELS =
  ['Nemeses', 'Enemies', 'Strained', 'Acquaintances', 'Colleagues', 'Friends', 'CloseFriends', 'Inseparable'] as const
// The pairwise readout among the four seats of a PROPOSED seating, in `seatPairs` seat
// order. A pair with no edge reads `tierLabel: null` and an honest line — never a neutral
// score. Ruling 4: this is a READOUT and never a production-quality modifier.
const StudioCastingChemistryRow = object('StudioCastingChemistryRow', {
  seatA: enumeration(['director', 'lead', 'antagonist', 'support']),
  seatB: enumeration(['director', 'lead', 'antagonist', 'support']),
  talentIdA: nonEmptyText(),
  talentIdB: nonEmptyText(),
  tierLabel: nullable(enumeration(RELATIONSHIP_TIER_LABELS)),
  sign: integer({ minimum: -1, maximum: 1 }),
  /** `pairChemistry(...).reasons` verbatim — copy that carries no number. */
  drivers: array(nonEmptyText()),
  line: nonEmptyText(),
})

const StudioCastingQuoteSnapshot = object('StudioCastingQuoteSnapshot', {
  financial: nullable(reference('StudioFinancialConsequence', StudioFinancialConsequence)),
  /** The ONE opaque digest-bound commit intent this quote mints. */
  intentId: nonEmptyText(),
  kind: enumeration(['startAuditions', 'greenlightPicture', 'signContract']),
  commitLabel: nonEmptyText(),
  startsNow: bool(),
  queues: bool(),
  projectId: nullable(nonEmptyText()),
  title: nonEmptyText(),
  // Screen-test consequence — null when kind !== 'startAuditions'.
  weekLine: nullable(text()),
  slotLine: nullable(text()),
  noFeeLine: nullable(text()),
  noHoldLine: nullable(text()),
  uniquePeople: nullable(nonNegativeInteger()),
  // Existing package-at-admission estimate. P11 financial uses the actual
  // discarded successor, including zero current debit when Greenlight queues.
  negative: nullable(nonNegativeInteger()),
  marketing: nullable(nonNegativeInteger()),
  freelancerFees: nullable(nonNegativeInteger()),
  totalImmediate: nullable(nonNegativeInteger()),
  cashBefore: nullable(integer()),
  cashAfter: nullable(integer()),
  affordable: nullable(bool()),
  strongestAssignmentLine: nullable(text()),
  weakestAssignmentLine: nullable(text()),
  forecastLine: nullable(text()),
  setDemandLine: nullable(text()),
  queueNote: nullable(text()),
  // Sign-contract consequence (P05A.3 §10) — null when kind !== 'signContract'.
  // totalImmediate carries the signing bonus; cashBefore/cashAfter/affordable
  // carry the D-12 read exactly as the greenlight quote does.
  signTalentName: nullable(text()),
  signTermWeeks: nullable(nonNegativeInteger()),
  signWeeklySalary: nullable(nonNegativeInteger()),
  signGuaranteedComp: nullable(nonNegativeInteger()),
  // P14B.6 — the casting CONFIRMATION carries the chemistry readout for the seating it
  // proposes. The board project snapshot is NOT a carrier: a Ready screenplay's
  // `activeSlate` is null, so no seating exists there. Both are null for a screen test
  // and a contract signing, neither of which proposes a four-seat package.
  chemistry: nullable(array(reference('StudioCastingChemistryRow', StudioCastingChemistryRow))),
  /** Ruling 3 (iii): ONE sentence when a seated pair reads −1. It never refuses, never
   *  blocks, and never changes a quote, a cost or a forecast. */
  chemistryWarning: nullable(text()),
})

const StudioPlacementCellVerdictSnapshot = object('StudioPlacementCellVerdictSnapshot', {
  cell: reference('StudioGridCellSnapshot', StudioGridCellSnapshot),
  ok: bool(),
  rejection: nullable(enumeration(PLACEMENT_REJECTION_KINDS)),
})



const StudioPlacementQuoteSnapshot = object('StudioPlacementQuoteSnapshot', {
  financial: nullable(reference('StudioFinancialConsequence', StudioFinancialConsequence)),
  /**
   * The ONE opaque digest-bound intent id (the union's shared identity slot). It is
   * REGISTERED for commit only when `ok` is true; an illegal preview's id is never
   * accepted by the authority (INTENT_NOT_AVAILABLE), so `ok` is the commit truth.
   */
  intentId: nonEmptyText(),
  kind: literal('placeFacility'),
  commitLabel: nonEmptyText(),
  /** Construction starts the moment a legal quote is committed (never queued). */
  startsNow: bool(),
  queues: bool(),
  queueNote: nullable(text()),
  ok: bool(),
  blueprintId: nonEmptyText(),
  name: nonEmptyText(),
  effectSummary: nonEmptyText(),
  origin: reference('StudioGridCellSnapshot', StudioGridCellSnapshot),
  footprint: reference('StudioFootprintSnapshot', StudioFootprintSnapshot),
  parcelId: nullable(text()),
  cells: array(reference('StudioGridCellSnapshot', StudioGridCellSnapshot)),
  cellLegality: array(reference('StudioPlacementCellVerdictSnapshot', StudioPlacementCellVerdictSnapshot)),
  cost: nonNegativeInteger(),
  weeklyOperatingCost: nonNegativeInteger(),
  buildWeeks: nonNegativeInteger(),
  completesOnWeek: nonNegativeInteger(),
  capability: nullable(text()),
  capacityDelta: nonNegativeInteger(),
  rejections: array(enumeration(PLACEMENT_REJECTION_KINDS)),
  primary: nullable(enumeration(PLACEMENT_REJECTION_KINDS)),
  /** The primary rejection in the player's words; null when legal. */
  primaryReason: nullable(text()),
  unmetRequirements: array(reference('StudioPlacementUnmetRequirementSnapshot', StudioPlacementUnmetRequirementSnapshot)),
  instanceCount: nonNegativeInteger(),
  maxInstances: nullable(nonNegativeInteger()),
  cashBefore: integer(),
  cashAfter: integer(),
  affordable: bool(),
  consequence: nonEmptyText(),
})

const StudioSetCommissionQuoteSnapshot = object('StudioSetCommissionQuoteSnapshot', {
  /** The union's shared identity slot; REGISTERED for commit only when `ok`. */
  intentId: nonEmptyText(),
  kind: literal('commissionSet'),
  commitLabel: nonEmptyText(),
  /** Set construction starts the moment a legal quote is committed (never queued). */
  startsNow: bool(),
  queues: bool(),
  queueNote: nullable(text()),
  ok: bool(),
  blueprintId: nonEmptyText(),
  name: nonEmptyText(),
  setType: nonEmptyText(),
  quality: number({ minimum: 0, maximum: 100 }),
  cost: nonNegativeInteger(),
  buildWeeks: nonNegativeInteger(),
  completesOnWeek: nonNegativeInteger(),
  stageFacilityId: nonEmptyText(),
  stageName: nullable(text()),
  /** The engine's own refusal code, or null when the commission is legal. */
  refusal: nullable(enumeration(SET_COMMISSION_REFUSAL_KINDS)),
  refusalReason: nullable(text()),
  refusalRemedy: nullable(text()),
  cashBefore: integer(),
  cashAfter: integer(),
  affordable: bool(),
  consequence: nonEmptyText(),
})

// P10-R1: the contract consequence sheet Unity renders verbatim. `ok:false` is an
// accepted preview carrying the engine's refusal; only `ok:true` is a registered commit.
const StudioContractQuoteSnapshot = object('StudioContractQuoteSnapshot', {
  financial: nullable(reference('StudioFinancialConsequence', StudioFinancialConsequence)),
  /** The union's shared identity slot; REGISTERED for commit only when `ok`. */
  intentId: nonEmptyText(),
  kind: enumeration(['renewContract', 'releaseTalent']),
  commitLabel: nonEmptyText(),
  /** Both actions take effect the moment they are committed (never queued). */
  startsNow: bool(),
  queues: bool(),
  queueNote: nullable(text()),
  ok: bool(),
  verb: enumeration(['renew', 'release']),
  talentId: nonEmptyText(),
  talentName: nonEmptyText(),
  /** The CURRENT contract as it stands this week (null only for a refused draft on a person with no contract). */
  currentEndWeekExclusive: nullable(nonNegativeInteger()),
  currentRemainingWeeks: nullable(nonNegativeInteger()),
  renewalOpen: bool(),
  // Renewal consequence — null when verb !== 'renew' or the draft is refused before pricing.
  termWeeks: nullable(integer({ minimum: 1 })),
  termLabel: nullable(text()),
  annualSalary: nullable(number({ minimum: 0 })),
  weeklySalary: nullable(number({ minimum: 0 })),
  signingBonus: nullable(number({ minimum: 0 })),
  newEndWeekExclusive: nullable(nonNegativeInteger()),
  // Release consequence — null when verb !== 'release' or refused before pricing.
  terminationCost: nullable(number({ minimum: 0 })),
  guaranteedRemaining: nullable(number({ minimum: 0 })),
  /** The one immediate cash effect of committing (signing bonus, or termination cost). */
  cost: number({ minimum: 0 }),
  refusal: nullable(enumeration(CONTRACT_REFUSAL_KINDS)),
  refusalReason: nullable(text()),
  refusalRemedy: nullable(text()),
  cashBefore: integer(),
  cashAfter: integer(),
  affordable: bool(),
  consequence: nonEmptyText(),
})

// P14B.1: the offerability verdict for a drafted promise, as §4.3 decides it.
// `message` is null exactly when `ok`; otherwise it is the typed refusal "not
// offerable: <bottleneck>" carrying the feasibility service's own bottleneck text.
// The drafted FAMILY is deliberately absent: a verdict names no promise terms.
const StudioMarketPromiseQuoteSnapshot = object('StudioMarketPromiseQuoteSnapshot', {
  ok: bool(),
  classification: enumeration(PROMISE_CLASSIFICATIONS),
  message: nullable(text()),
})

// P14A.1: the market-proposal consequence sheet. Nothing is charged by submitting —
// the signing bonus is due at settlement IF this person selects it — so the sheet
// publishes the decision week, the terms and the affordability answer, never a debit.
const StudioMarketProposalQuoteSnapshot = object('StudioMarketProposalQuoteSnapshot', {
  /** The union's shared identity slot; REGISTERED for commit only when `ok`. */
  intentId: nonEmptyText(),
  kind: enumeration(['marketProposalAction']),
  commitLabel: nonEmptyText(),
  /** A proposal never takes effect now: it is settled at the decision week. */
  startsNow: bool(),
  queues: bool(),
  queueNote: nullable(text()),
  ok: bool(),
  verb: enumeration(['propose', 'revise', 'withdraw']),
  talentId: nonEmptyText(),
  talentName: nonEmptyText(),
  decisionWeek: nullable(nonNegativeInteger()),
  decisionWeekLabel: nullable(text()),
  termWeeks: nullable(integer({ minimum: 1 })),
  termLabel: nullable(text()),
  premiumTier: nullable(number({ minimum: 1 })),
  annualSalary: nullable(number({ minimum: 0 })),
  /** Due at settlement, not now. */
  signingBonus: nullable(number({ minimum: 0 })),
  effectiveWeek: nullable(nonNegativeInteger()),
  refusal: nullable(enumeration(MARKET_PROPOSAL_REFUSAL_KINDS)),
  refusalReason: nullable(text()),
  refusalRemedy: nullable(text()),
  /** The accepted D-12 answer on the bonus, asked at the read week. */
  affordable: bool(),
  consequence: nonEmptyText(),
  /** P14B.1: null when the draft carried no promise (and on withdraw). A promise
   * verdict never changes `ok` — B.1 commits no promise through this route. */
  promise: nullable(reference('StudioMarketPromiseQuoteSnapshot', StudioMarketPromiseQuoteSnapshot)),
})

// P14B.8: the waiver's answer, shaped on `StudioMarketProposalQuoteSnapshot`. A
// substitute the person would refuse is an ACCEPTED answer carrying `ok: false` and
// `waiverAccepted`'s BARE sentence — never the namespaced throw `waivePromise` raises,
// and never a protocol rejection. The echoed terms are the SUBSTITUTE's; the
// substitute's own promise id is deliberately absent, because it is minted at commit
// as `promise-${promises.length}` and any quote naming it is wrong the moment another
// promise lands first. Nothing is charged by a waiver, so there is no money sheet.
const StudioPromiseWaiverQuoteSnapshot = object('StudioPromiseWaiverQuoteSnapshot', {
  /** The union's shared identity slot; REGISTERED for commit only when `ok`. */
  intentId: nonEmptyText(),
  kind: enumeration(['waivePromise']),
  commitLabel: nonEmptyText(),
  /** The union's three shared scheduling slots, carried for the same reason every
   * other member carries them: the generator promotes exactly the members all six
   * share onto the abstract `StudioQuoteSnapshot`, and dropping them here would
   * demote `startsNow`/`queues`/`queueNote` into five concrete classes and break
   * every C# reader that holds a base reference. A waiver settles the original and
   * binds the substitute in the SAME accepted command, so it starts now and queues
   * nothing — the opposite of a market proposal, which settles at its decision week. */
  startsNow: bool(),
  queues: bool(),
  queueNote: nullable(text()),
  ok: bool(),
  /** null exactly when `ok`; otherwise the engine's own refusal, verbatim. */
  refusalReason: nullable(text()),
  /** The ORIGINAL being waived, echoed back; resolved to this person by the bridge. */
  promiseId: nonEmptyText(),
  talentId: nonEmptyText(),
  /** The SUBSTITUTE's terms. `seatClass` is null for the count-only family. */
  family: enumeration(PROMISE_FAMILIES),
  count: integer({ minimum: 1 }),
  seatClass: nullable(enumeration(PROMISE_SEAT_CLASSES)),
  windowStartWeek: nonNegativeInteger(),
  dueWeekExclusive: nonNegativeInteger(),
  consequence: nonEmptyText(),
})

const StudioQuoteSnapshot = union('StudioQuoteSnapshot', [
  reference('StudioCommissionQuoteSnapshot', StudioCommissionQuoteSnapshot),
  reference('StudioCastingQuoteSnapshot', StudioCastingQuoteSnapshot),
  reference('StudioPlacementQuoteSnapshot', StudioPlacementQuoteSnapshot),
  reference('StudioSetCommissionQuoteSnapshot', StudioSetCommissionQuoteSnapshot),
  reference('StudioContractQuoteSnapshot', StudioContractQuoteSnapshot),
  reference('StudioMarketProposalQuoteSnapshot', StudioMarketProposalQuoteSnapshot),
  reference('StudioPromiseWaiverQuoteSnapshot', StudioPromiseWaiverQuoteSnapshot),
] as const)

const StudioBridgeQuoteResponse = object('StudioBridgeQuoteResponse', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  accepted: literal(true),
  /** A quote mutates nothing: the revision is UNCHANGED. */
  stateRevision: nonNegativeInteger(),
  gameWeek: nonNegativeInteger(),
  stateDigest: nonEmptyText(),
  quote: reference('StudioQuoteSnapshot', StudioQuoteSnapshot),
  processingMs: number({ minimum: 0 }),
})

const studioLotSnapshotProperties = {
  studioName: nonEmptyText(),
  week: nonNegativeInteger(),
  sceneSeed: nonEmptyText(),
  buildings: array(reference('StudioBuildingSnapshot', StudioBuildingSnapshot)),
  activeProductions: array(reference('StudioProductionSnapshot', StudioProductionSnapshot)),
  releasedFilms: array(reference('StudioReleasedFilmSnapshot', StudioReleasedFilmSnapshot)),
  // P07A W2 — rich per-film results (owned by the release-results projection); see D2/D3/D5.
  results: array(reference('StudioFilmResultSnapshot', StudioFilmResultSnapshot)),
  productionOperations: array(reference(
    'StudioProductionOperationsSnapshot',
    StudioProductionOperationsSnapshot,
  )),
  // P05A W2: the Stage-local collection (recon §5.5). Optional at the snapshot
  // root exactly like `stages`/`sets` — always emitted in managed mode.
  stageProductions: optional(array(reference(
    'StudioStageProductionSnapshot',
    StudioStageProductionSnapshot,
  ))),
  people: array(reference('StudioPersonSnapshot', StudioPersonSnapshot)),
  presence: optional(reference('StudioPresenceSnapshot', StudioPresenceSnapshot)),
  placement: reference('StudioPlacementSnapshot', StudioPlacementSnapshot),
  property: reference('StudioPropertySnapshot', StudioPropertySnapshot),
  weekTheater: optional(reference('StudioWeekTheaterSnapshot', StudioWeekTheaterSnapshot)),
  stages: optional(array(reference('StudioStageSnapshot', StudioStageSnapshot))),
  sets: optional(array(reference('StudioSetSnapshot', StudioSetSnapshot))),
  /** P09A W5: the authored Set catalogue (managed mode), so a Sets route can offer what the engine can build. */
  setCatalog: optional(array(reference('StudioSetCatalogEntrySnapshot', StudioSetCatalogEntrySnapshot))),
  firstFilmJourney: reference('StudioFirstFilmJourneySnapshot', StudioFirstFilmJourneySnapshot),
  development: reference('StudioDevelopmentSnapshot', StudioDevelopmentSnapshot),
  casting: reference('StudioCastingSnapshot', StudioCastingSnapshot),
} as const

export const StudioLotSnapshotSchema = object('StudioLotSnapshot', studioLotSnapshotProperties)

export const StudioLotProjectionSchema = object('StudioLotProjection', {
  studioName: studioLotSnapshotProperties.studioName,
  week: studioLotSnapshotProperties.week,
  sceneSeed: studioLotSnapshotProperties.sceneSeed,
  buildings: studioLotSnapshotProperties.buildings,
  property: studioLotSnapshotProperties.property,
  stages: studioLotSnapshotProperties.stages,
  sets: studioLotSnapshotProperties.sets,
  setCatalog: studioLotSnapshotProperties.setCatalog,
})

export const StudioProductionsProjectionSchema = object('StudioProductionsProjection', {
  activeProductions: studioLotSnapshotProperties.activeProductions,
  productionOperations: studioLotSnapshotProperties.productionOperations,
  stageProductions: studioLotSnapshotProperties.stageProductions,
})

// ── P10A W0 — the player-safe PEOPLE projection (projection 18) ────────────
// Producers per docs/engineering/P10-INFORMATION-VISIBILITY-TABLE.md. Nothing hidden
// (actual skills, ceilings, devRate, actual genre experience, the seed) has a field.
const disciplineEnum = () => enumeration(['acting', 'writing', 'directing', 'craft', 'research'])
const genreEnum = () => enumeration(['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure'])
const professionEnum = () => enumeration(['actor', 'director', 'writer', 'craft', 'scientist'])
const attentionTierEnum = () => enumeration(['info', 'attention', 'decision', 'blocking'])
const employmentStatusEnum = () =>
  enumeration(['contracted', 'engagedFreelancer', 'availableFreelancer', 'freeAgent', 'unavailable'])
const StudioPersonDisciplineSnapshot = object('StudioPersonDisciplineSnapshot', {
  discipline: disciplineEnum(),
  label: nonEmptyText(),
  isPrimary: bool(),
  ovr: number({ minimum: 0, maximum: 99 }),
  tier: nonEmptyText(),
  proven: bool(),
  capableButUnproven: bool(),
  potentialLow: integer({ minimum: 0, maximum: 99 }),
  potentialHigh: integer({ minimum: 0, maximum: 99 }),
  potentialTier: nonEmptyText(),
  isEstimate: literal(true),
  workHistory: nonNegativeInteger(),
})
const StudioPersonSpecialtySnapshot = object('StudioPersonSpecialtySnapshot', {
  discipline: disciplineEnum(),
  genre: genreEnum(),
  label: nonEmptyText(),
  perceived: number({ minimum: 0, maximum: 100 }),
})
// P10-R1 (projection 19): the PUBLISHED legal renewal terms — the engine's own
// offers (contractOfferOptions), one per authorized term. The client picks one; it
// never prices anything.
const StudioPersonRenewalTermSnapshot = object('StudioPersonRenewalTermSnapshot', {
  termWeeks: integer({ minimum: 1 }),
  termLabel: nonEmptyText(),
  annualSalary: number({ minimum: 0 }),
  weeklySalary: number({ minimum: 0 }),
  signingBonus: number({ minimum: 0 }),
  /** The contract's new end week (exclusive) if renewed on this term THIS week. */
  endWeekExclusive: nonNegativeInteger(),
})
// P10-R1 (projection 19): the two material contract actions and their legal windows,
// decided by the existing employment authorities (renewalWindowOpen, the D-12
// solvency gate on the signing bonus, the screenplay-task guard on release). A
// closed window carries its exact reason; the client renders it and asks nothing.
const StudioPersonContractActionsSnapshot = object('StudioPersonContractActionsSnapshot', {
  renewAvailable: bool(),
  renewReason: nullable(text()),
  renewalTerms: array(reference('StudioPersonRenewalTermSnapshot', StudioPersonRenewalTermSnapshot)),
  releaseAvailable: bool(),
  releaseReason: nullable(text()),
})
const StudioPersonContractSnapshot = object('StudioPersonContractSnapshot', {
  annualSalary: number({ minimum: 0 }),
  weeklySalary: number({ minimum: 0 }),
  signingBonus: number({ minimum: 0 }),
  startWeek: nonNegativeInteger(),
  endWeekExclusive: nonNegativeInteger(),
  termWeeks: integer({ minimum: 1 }),
  remainingWeeks: nonNegativeInteger(),
  guaranteedRemaining: number({ minimum: 0 }),
  terminationCost: number({ minimum: 0 }),
  renewalOpen: bool(),
  renewalLine: nonEmptyText(),
  actions: reference('StudioPersonContractActionsSnapshot', StudioPersonContractActionsSnapshot),
})
const StudioPersonEmploymentSnapshot = object('StudioPersonEmploymentSnapshot', {
  status: employmentStatusEnum(),
  statusLabel: nonEmptyText(),
  availability: nonEmptyText(),
  contract: nullable(reference('StudioPersonContractSnapshot', StudioPersonContractSnapshot)),
  marketRatePerProduction: number({ minimum: 0 }),
  freelancerFee: nullable(number({ minimum: 0 })),
  offersAvailable: bool(),
})
const StudioPersonWorkSnapshot = object('StudioPersonWorkSnapshot', {
  kind: enumeration(['available', 'assigned', 'ambiguous', 'undisclosed']),
  assignmentKind: nullable(enumeration(['production', 'script', 'research'])),
  assignmentId: nullable(text()),
  label: nullable(text()),
  reason: nullable(text()),
})
const StudioPersonPresenceSnapshot = object('StudioPersonPresenceSnapshot', {
  onLot: bool(),
  engagement: nullable(enumeration(['production', 'script', 'casting', 'roster', 'research'])),
  credit: nullable(text()),
  facilityId: nullable(text()),
  facilityName: nullable(text()),
  blockedReason: nullable(text()),
  canLocate: bool(),
  locateReason: nullable(text()),
})
const StudioPersonAttentionSnapshot = object('StudioPersonAttentionSnapshot', {
  tier: nullable(attentionTierEnum()),
  reason: nullable(text()),
  cohort: nullable(text()),
})
const StudioPersonCareerRowSnapshot = object('StudioPersonCareerRowSnapshot', {
  eventId: nonEmptyText(),
  filmId: nonEmptyText(),
  filmTitle: nonEmptyText(),
  releaseWeek: nonNegativeInteger(),
  releaseDateLabel: nonEmptyText(),
  genre: genreEnum(),
  roleLabel: nonEmptyText(),
  discipline: disciplineEnum(),
  ovrBefore: number({ minimum: 0, maximum: 99 }),
  ovrAfter: number({ minimum: 0, maximum: 99 }),
  starPowerBefore: number({ minimum: 0, maximum: 100 }),
  starPowerAfter: number({ minimum: 0, maximum: 100 }),
  starPowerDelta: number(),
  genreExpBefore: number({ minimum: 0, maximum: 100 }),
  genreExpAfter: number({ minimum: 0, maximum: 100 }),
  reasonCodes: array(nonEmptyText()),
  resultAvailable: bool(),
})
const StudioPersonCareerSnapshot = object('StudioPersonCareerSnapshot', {
  rows: array(reference('StudioPersonCareerRowSnapshot', StudioPersonCareerRowSnapshot)),
  creditsWithoutEvents: nonNegativeInteger(),
  uncapturedFilms: nonNegativeInteger(),
  provenance: enumeration(['recorded', 'partial', 'notRecorded', 'none']),
  provenanceNotice: nullable(text()),
})
// ── P14A.1 (projection 42) — the Profile's market case block ────────────────
// Public (companion §2.1.5): that a case exists, its subject, its decision week, the
// person's public preference facts, and that a competing proposal exists — from which
// studio, since which week, for how long, from which effective week. PRIVATE, before
// and after settlement: every non-issuer's premium tier, salary and bonus, which read
// the literal marker below. No band, no estimate, no rumour is invented here.
const MARKET_UNKNOWN = 'UNKNOWN' as const
const marketProposalCommon = {
  issuerStudioId: nonEmptyText(),
  submittedWeek: nonNegativeInteger(),
  termWeeks: integer({ minimum: 1 }),
  /** The week the proposal would take effect: the case's decision week. */
  effectiveWeek: nonNegativeInteger(),
}
const StudioMarketPromiseSnapshot = object('StudioMarketPromiseSnapshot', {
  family: enumeration(PROMISE_FAMILIES),
  /** The promised count X of a count family. */
  count: integer({ minimum: 1 }),
  /** P14B.4: the explicitly selected P2 seat class; `null` for a count family or a
   * legacy classless P2 (read from the stored shape, never inferred from a version). */
  seatClass: nullable(enumeration(PROMISE_SEAT_CLASSES)),
  windowStartWeek: nonNegativeInteger(),
  dueWeekExclusive: nonNegativeInteger(),
  classification: enumeration(PROMISE_CLASSIFICATIONS),
})
/** One row of the VIEWING studio's own promise record for this person: bound
 * (`contractId` set) promises only, open (`outcome: null`) and settled. */
const StudioMarketPromiseHistoryRow = object('StudioMarketPromiseHistoryRow', {
  promiseId: nonEmptyText(),
  family: enumeration(PROMISE_FAMILIES),
  count: integer({ minimum: 1 }),
  /** P14B.4: as on `StudioMarketPromiseSnapshot` — real class or `null`. */
  seatClass: nullable(enumeration(PROMISE_SEAT_CLASSES)),
  windowStartWeek: nonNegativeInteger(),
  dueWeekExclusive: nonNegativeInteger(),
  /** Bound history always names the actual employment contract. */
  contractId: nonEmptyText(),
  /** null while the promise is open. */
  outcome: nullable(enumeration(PROMISE_OUTCOMES)),
  outcomeWeek: nullable(nonNegativeInteger()),
  outcomeCause: nullable(text()),
  /** P14B.8: the TYPED successor link, set only on a WAIVED original and pointing
   * BACKWARDS only. The derivation, so no consumer ever parses `outcomeCause`: a
   * row's substitute is the row whose `promiseId` equals this row's
   * `supersededByPromiseId`; a row's predecessor is the row whose
   * `supersededByPromiseId` equals this row's `promiseId`. Both rows always travel
   * together on this carrier, which is what licenses leaving the inverse link off. */
  supersededByPromiseId: nullable(nonEmptyText()),
  /** P14B.8: the delivered part of `count`, so a player drafting a substitute can
   * SEE the remaining obligation (`count - progress`) instead of discovering it
   * from a refusal. Event-derived by the engine, never a second authority. */
  progress: nonNegativeInteger(),
})
const StudioMarketOwnProposalSnapshot = object('StudioMarketOwnProposalSnapshot', {
  disclosure: literal('own'),
  ...marketProposalCommon,
  premiumTier: number({ minimum: 1 }),
  /** RE-DERIVED at the read week through the shared pricing entry, never the stored quote. */
  annualSalary: number({ minimum: 0 }),
  signingBonus: number({ minimum: 0 }),
  /** The issuer's OWN attached promise, or null when it attached none. */
  promise: nullable(reference('StudioMarketPromiseSnapshot', StudioMarketPromiseSnapshot)),
})
const StudioMarketUndisclosedProposalSnapshot = object('StudioMarketUndisclosedProposalSnapshot', {
  disclosure: literal('undisclosed'),
  ...marketProposalCommon,
  premiumTier: literal(MARKET_UNKNOWN),
  annualSalary: literal(MARKET_UNKNOWN),
  signingBonus: literal(MARKET_UNKNOWN),
  /** §2.1.5 "a competing proposal's attached promises": the SAME marker the tier,
   * salary and bonus already use — never a band, an estimate or a rumour. */
  promise: literal(MARKET_UNKNOWN),
})
const StudioMarketProposalSnapshot = union('StudioMarketProposalSnapshot', [
  reference('StudioMarketOwnProposalSnapshot', StudioMarketOwnProposalSnapshot),
  reference('StudioMarketUndisclosedProposalSnapshot', StudioMarketUndisclosedProposalSnapshot),
] as const)
// The five A.1 case causes plus B.2's independent bound-promise reminders.
const MARKET_ATTENTION_CAUSES = [
  'decisionWeekNear',
  'newCompetingProposal',
  'termsRevised',
  'settlementCompleted',
  'proposalWouldFail',
  'promiseDue',
  'promiseOutcome',
] as const
const StudioMarketAttentionRowSnapshot = object('StudioMarketAttentionRowSnapshot', {
  cause: enumeration(MARKET_ATTENTION_CAUSES),
  talentId: nonEmptyText(),
  reason: nonEmptyText(),
})
// §2.1.7: the archetype-derived priority order and preferred term are "readable on the
// profile and not manipulable" — the engine's own public accessors, never a second copy.
const StudioMarketPreferencesSnapshot = object('StudioMarketPreferencesSnapshot', {
  priorityOrder: array(enumeration(
    // P14B.1: the six LANDED descriptors (`talentMarket.ts` DESCRIPTOR_ORDER) — D3
    // `opportunity` and D4 `trust` joined the engine's own public order at T2.
    // P14B.5: D5 `relationships` joins it (the seventh and last companion member).
    ['opportunity', 'compensation', 'term', 'trust', 'standing', 'incumbency', 'relationships'],
  )),
  preferredTermWeeks: integer({ minimum: 1 }),
  /** P14B.4: the engine's own public opportunity preference (`publicPreferredOpportunity`,
   * the same proven/unproven archetype as the order and term) — read, never a copy. */
  preferredOpportunity: enumeration(['significantCastRole', 'anyCastAppearance']),
  line: nonEmptyText(),
})
const StudioMarketCaseSnapshot = object('StudioMarketCaseSnapshot', {
  talentId: nonEmptyText(),
  /** The employer whose contract is expiring (the case's subject studio). */
  subjectStudioId: nonEmptyText(),
  status: enumeration([
    'discovered', 'proposals_open', 'decision_pending', 'settled', 'declined', 'expired', 'invalidated',
  ]),
  /** DERIVED on read from the live employment row the case names. */
  decisionWeek: nonNegativeInteger(),
  /** The same authoritative campaign calendar Industry and the Profile already use. */
  decisionWeekLabel: nonEmptyText(),
  preferences: reference('StudioMarketPreferencesSnapshot', StudioMarketPreferencesSnapshot),
  proposals: array(reference('StudioMarketProposalSnapshot', StudioMarketProposalSnapshot)),
  attentionRows: array(reference('StudioMarketAttentionRowSnapshot', StudioMarketAttentionRowSnapshot)),
  /** Order-only, after settlement. Never an amount. */
  settlementReasons: array(nonEmptyText()),
  /** P14B.1 §4.5: how this person's record reads for the VIEWING studio. Derived on
   * read from persisted facts, never a persisted meter, and never a hidden number. */
  trustLabel: enumeration(TRUST_LABELS),
  /** P14B.1: the VIEWING studio's own bound promises to this person. A rival's
   * promise is never a row here — it is UNKNOWN on the proposal row and nowhere else. */
  promiseHistory: array(reference('StudioMarketPromiseHistoryRow', StudioMarketPromiseHistoryRow)),
})

// ── P14A.2 — the Talent Market workspace page (projection 43) ────────────────
// READ MODELS over the landed A.1 law: no new engine law, no new intent kind, Save V28
// unchanged. Disclosure is the A.1 disclosure exactly — every competing proposal figure
// is the same literal `"UNKNOWN"` marker (the workspace reuses `StudioMarketProposal
// Snapshot` itself rather than minting a second row shape), and a RIVAL-owned employment
// interval carries NO `annualSalary` member at all: absence, not a marker, because that
// figure was never this studio's to disclose or withhold.
//
// The definitions live here beside the other market DTOs; `StudioIndustryResponse.market`
// (industry-schema.ts) references `StudioMarketPage` by name, which keeps the two schema
// modules acyclic — both land in the one shared `$defs` map.
const MARKET_CASE_ROW_STATUSES = [
  'discovered', 'proposals_open', 'decision_pending', 'settled', 'declined', 'expired', 'invalidated',
] as const
const MARKET_CASE_OUTCOMES = ['settled', 'declined', 'expired', 'invalidated'] as const
// One case in a workspace bucket. Public facts only: that a case exists, whose it is,
// when it decides, HOW MANY proposals are on the table (existence is public; the figures
// are not) and whether this studio is one of the issuers.
const StudioMarketCaseRow = object('StudioMarketCaseRow', {
  talentId: nonEmptyText(),
  name: nonEmptyText(),
  roleLabel: nonEmptyText(),
  /** The employer whose contract is expiring (the case's subject studio). */
  subjectStudioId: nonEmptyText(),
  subjectStudioName: nonEmptyText(),
  status: enumeration(MARKET_CASE_ROW_STATUSES),
  /** DERIVED on read from the live employment row the case names. */
  decisionWeek: nonNegativeInteger(),
  decisionWeekLabel: nonEmptyText(),
  /** The STORED terminal week: null on a live case, and on a DERIVED invalidation
   * (a release closed the interval early, which no receipt stamped as a closure). */
  closedWeek: nullable(nonNegativeInteger()),
  outcome: nullable(enumeration(MARKET_CASE_OUTCOMES)),
  proposalCount: nonNegativeInteger(),
  ownProposal: bool(),
})
// One free agent this studio may sign OUTRIGHT (R26 instant signing): no case, no
// deadline, no person choice on that path. The ask is RE-DERIVED at the read week
// through `playerOffer` at the shortest published term, and the row carries the
// EXISTING `signContract` hiring path — the workspace mints no new intent kind, and a
// person the existing conversion refuses says so instead of offering a commit it throws on.
const StudioMarketFreeAgentRow = object('StudioMarketFreeAgentRow', {
  talentId: nonEmptyText(),
  name: nonEmptyText(),
  roleLabel: nonEmptyText(),
  termWeeks: integer({ minimum: 1 }),
  annualSalary: nonNegativeInteger(),
  signingBonus: nonNegativeInteger(),
  intentKind: literal('signContract'),
  signable: bool(),
  /** The existing hiring conversion's own refusal sentence; null when it accepts. */
  refusal: nullable(nonEmptyText()),
})
// The one BOUNDED bucket. The three live buckets are bounded by the live world (open
// cases cannot exceed the active employment rows inside a renewal window; free agents
// cannot exceed the pool), so they are hot summaries bounded by construction; closed
// cases accumulate for a century and are paged.
const StudioMarketClosedCases = object('StudioMarketClosedCases', {
  rows: array(reference('StudioMarketCaseRow', StudioMarketCaseRow)),
  page: nonNegativeInteger(),
  pageSize: integer({ minimum: 1 }),
  total: nonNegativeInteger(),
})
// A case appears in EXACTLY ONE bucket, by DERIVED facts alone. Row order inside each
// bucket is fixed and never an array, Map, Set or PersonId order: `renewalWindow` and
// `settling` by decision week ascending then discovery order; `closed` by closed week
// descending then discovery order; `freeAgents` by role in the fixed discipline order,
// then the ask at the read week descending, then the most recent P12 employment ordinal,
// then the person's ordinal in the append-only `state.talent` roster.
const StudioMarketCases = object('StudioMarketCases', {
  renewalWindow: array(reference('StudioMarketCaseRow', StudioMarketCaseRow)),
  freeAgents: array(reference('StudioMarketFreeAgentRow', StudioMarketFreeAgentRow)),
  settling: array(reference('StudioMarketCaseRow', StudioMarketCaseRow)),
  closed: reference('StudioMarketClosedCases', StudioMarketClosedCases),
})
// One recorded employer interval from the P12 rows. `annualSalary` is present on THIS
// studio's own intervals alone and is ABSENT — never null, never a marker — on every
// rival-owned interval, exactly as Industry keeps rival contract terms private.
const StudioMarketEmployerRow = object('StudioMarketEmployerRow', {
  studioId: nonEmptyText(),
  studioName: nonEmptyText(),
  fromWeek: nonNegativeInteger(),
  fromLabel: nonEmptyText(),
  /** The interval's live end: its early end when one was recorded, else its term end. */
  toWeek: nonNegativeInteger(),
  toLabel: nonEmptyText(),
  termWeeks: integer({ minimum: 1 }),
  transition: enumeration(['entry', 'renewal', 'replacement', 'player-contract', 'existing-player-contract']),
  own: bool(),
  ended: bool(),
  annualSalary: optional(nonNegativeInteger()),
})
// The candidate rail: BY REFERENCE to the projection-42 profile pieces. It copies no
// profile field — `preferences` is the case block's own preference line, `standingLine`
// is composed from the People projection's already-published labels, and `profileRef` is
// the key the client opens the full profile with (null when the projection holds none).
const StudioMarketCandidateRail = object('StudioMarketCandidateRail', {
  talentId: nonEmptyText(),
  role: professionEnum(),
  standingLine: nonEmptyText(),
  preferences: reference('StudioMarketPreferencesSnapshot', StudioMarketPreferencesSnapshot),
  profileRef: nullable(nonEmptyText()),
})
// The paged career and employer history. `employers` is paged by row ordinal
// (`MARKET_HISTORY_PAGE_SIZE`); `credits` is the People projection's own career rows by
// reference, unpaged, so no credit fact is derived a second time here.
const StudioMarketHistory = object('StudioMarketHistory', {
  employers: array(reference('StudioMarketEmployerRow', StudioMarketEmployerRow)),
  credits: array(reference('StudioPersonCareerRowSnapshot', StudioPersonCareerRowSnapshot)),
  /** The viewer's own bound promise history, unpaged and newest first. */
  promises: array(reference('StudioMarketPromiseHistoryRow', StudioMarketPromiseHistoryRow)),
  page: nonNegativeInteger(),
  pageSize: integer({ minimum: 1 }),
  total: nonNegativeInteger(),
})
// The selected case. `comparison` is the case block's own proposal rows (one per current
// proposal, the viewer's own re-derived at the read week, every competing figure the
// UNKNOWN marker); after settlement the engine clears the proposals and the order-only
// reasons stay on `case.settlementReasons`. `droppedReasons` carries THIS studio's OWN
// dropped proposal's sentence and nothing else — a rival's drop sentence is never shown.
// `marketCase` and NOT `case`: the C# generator refuses a wire member that emits a
// reserved identifier (CF08-IDENTIFIER-COLLISION — `case` is a C# keyword), and this is
// the same member name projection 42 already publishes for this exact block on the
// Profile (`StudioPersonProfileSnapshot.marketCase`).
const StudioMarketCaseDetail = object('StudioMarketCaseDetail', {
  marketCase: reference('StudioMarketCaseSnapshot', StudioMarketCaseSnapshot),
  rail: reference('StudioMarketCandidateRail', StudioMarketCandidateRail),
  comparison: array(reference('StudioMarketProposalSnapshot', StudioMarketProposalSnapshot)),
  history: reference('StudioMarketHistory', StudioMarketHistory),
  droppedReasons: array(nonEmptyText()),
})
// The workspace. `attention` gathers the five A.1 causes across every case this studio
// may lawfully be interrupted about, deduplicated per (cause, talentId), in decision-week
// then discovery order. `selected` is null for a targetId the engine holds no case for.
const StudioMarketPage = object('StudioMarketPage', {
  attention: array(reference('StudioMarketAttentionRowSnapshot', StudioMarketAttentionRowSnapshot)),
  cases: reference('StudioMarketCases', StudioMarketCases),
  selected: nullable(reference('StudioMarketCaseDetail', StudioMarketCaseDetail)),
})

// ── P14A.3: the world route facts (projection 44) ──────────────────────────
// The reference that opens the EXACT case behind a world status line: the existing
// `view`/`targetId` convention of the industry request, so a client that already speaks
// `view:'market'` opens the case with no new page and no new intent. `view` is the const
// `market` because this is the only route a case is opened through.
const StudioWorldCaseRef = object('StudioWorldCaseRef', {
  view: literal('market'),
  targetId: nonEmptyText(),
})
// One person's world route. `statusLine` and `caseRef` are BOTH null unless the engine
// holds an OPEN case for this person — a closed case and a person with no case read the
// same restrained nothing, and a settled case stays readable through the Profile's own
// `marketCase` block and the market page's `closed` bucket. `reach` is `playerLot` iff
// the Profile's `presence.onLot` (the player-only Presence Projection V1 fact) and
// `industry` otherwise: a rival's person is reached from the Industry roster and the
// profile, never from a physical rival lot, which does not exist on this wire.
const StudioWorldRouteSnapshot = object('StudioWorldRouteSnapshot', {
  statusLine: nullable(nonEmptyText()),
  caseRef: nullable(reference('StudioWorldCaseRef', StudioWorldCaseRef)),
  reach: enumeration(['playerLot', 'industry']),
})

// P14B.2: the engine's public descriptor, with at most its three newest drivers.
// Labels use every eligible driver before this display cap, never just these rows.
const StudioTrustDriverRow = object('StudioTrustDriverRow', {
  kind: enumeration(['promiseKept', 'promiseBroken', 'terminatedEarly', 'ranToEnd', 'cancelledAfterFirstTake']),
  week: nonNegativeInteger(),
  dateLabel: nonEmptyText(),
  positive: bool(),
  reason: nonEmptyText(),
})
const StudioTrustBlock = object('StudioTrustBlock', {
  label: enumeration(TRUST_LABELS),
  scope: enumeration(['person', 'studio']),
  drivers: array(reference('StudioTrustDriverRow', StudioTrustDriverRow)),
  line: nonEmptyText(),
})

// P14B.6 (projection 49) — the PROFILE COLLABORATORS block, on the StudioTrustBlock
// pattern above. The `$def` keeps 687's `StudioRelationshipBlock` name; the DTO KEY is
// `collaborators`, because the landed leak law forbids the key form `"relationships":`
// on every serialized DTO (tests/bridge-p14b5-relationships.test.ts :404-408) and a
// `$def` name never appears as a key. The tier vocabulary and the no-magnitude law are
// stated on `StudioCastingChemistryRow` above.
const StudioRelationshipRow = object('StudioRelationshipRow', {
  counterpartId: nonEmptyText(),
  counterpartName: nonEmptyText(),
  /** The rung at this week; null when no tie is recorded. A shared credit alone never
   *  backfills a tier (Owner ruling 3 (ii)), so a pre-V31 campaign reads null here. */
  tierLabel: nullable(enumeration(RELATIONSHIP_TIER_LABELS)),
  sign: integer({ minimum: -1, maximum: 1 }),
  /** `pairChemistry(...).reasons` verbatim — copy that carries no number. */
  drivers: array(nonEmptyText()),
  /** A FACT derived from `firstTakes` and released credits, never friendship. */
  sharedPictures: nonNegativeInteger(),
})
const StudioRelationshipBlock = object('StudioRelationshipBlock', {
  /** Present on every profile. When ties exist that the player cannot see in their own
   *  right, this line says so WITHOUT a count and WITHOUT an identity (the
   *  `presence.withheld` precedent). */
  line: nonEmptyText(),
  rows: array(reference('StudioRelationshipRow', StudioRelationshipRow)),
})

const StudioPersonProfileSnapshot = object('StudioPersonProfileSnapshot', {
  talentId: nonEmptyText(),
  name: nonEmptyText(),
  nameShared: bool(),
  profession: professionEnum(),
  professionLabel: nonEmptyText(),
  primaryDiscipline: disciplineEnum(),
  age: number({ minimum: 0 }),
  authored: bool(),
  careerIdentityLabel: nonEmptyText(),
  capableButUnproven: array(nonEmptyText()),
  disciplines: array(reference('StudioPersonDisciplineSnapshot', StudioPersonDisciplineSnapshot)),
  genreExperience: array(reference('StudioPersonSpecialtySnapshot', StudioPersonSpecialtySnapshot)),
  specialties: array(reference('StudioPersonSpecialtySnapshot', StudioPersonSpecialtySnapshot)),
  specialtyLine: nonEmptyText(),
  workEthic: integer({ minimum: 1, maximum: 99 }),
  workEthicLabel: nonEmptyText(),
  workEthicEffect: nonEmptyText(),
  temperament: nonEmptyText(),
  starPower: number({ minimum: 0, maximum: 100 }),
  starPowerDefinition: nonEmptyText(),
  potentialNotice: nonEmptyText(),
  employment: reference('StudioPersonEmploymentSnapshot', StudioPersonEmploymentSnapshot),
  work: reference('StudioPersonWorkSnapshot', StudioPersonWorkSnapshot),
  presence: reference('StudioPersonPresenceSnapshot', StudioPersonPresenceSnapshot),
  attention: reference('StudioPersonAttentionSnapshot', StudioPersonAttentionSnapshot),
  career: reference('StudioPersonCareerSnapshot', StudioPersonCareerSnapshot),
  trust: reference('StudioTrustBlock', StudioTrustBlock),
  /** P14B.6: only ties whose COUNTERPART the player can already see in their own right
   *  (on the player's roster at W), so a pair internal to a rival appears on no profile.
   *  That predicate is the PROFILE block's alone. The casting rows deliberately carry no
   *  roster filter — see the disclosure note above `PROJECTION_VERSION`. */
  collaborators: reference('StudioRelationshipBlock', StudioRelationshipBlock),
  promises: array(reference('StudioMarketPromiseHistoryRow', StudioMarketPromiseHistoryRow)),
  /** P14A.1: present exactly while the engine holds a case for this person; null otherwise. */
  marketCase: nullable(reference('StudioMarketCaseSnapshot', StudioMarketCaseSnapshot)),
  /** P14A.3: the world route facts for this person; present on every profile. */
  worldRoute: reference('StudioWorldRouteSnapshot', StudioWorldRouteSnapshot),
})
const StudioRosterOvrSnapshot = object('StudioRosterOvrSnapshot', {
  discipline: disciplineEnum(),
  label: nonEmptyText(),
  ovr: number({ minimum: 0, maximum: 99 }),
})
const StudioRosterRowSnapshot = object('StudioRosterRowSnapshot', {
  talentId: nonEmptyText(),
  name: nonEmptyText(),
  nameShared: bool(),
  profession: professionEnum(),
  professionLabel: nonEmptyText(),
  careerIdentityLabel: nonEmptyText(),
  ovr: number({ minimum: 0, maximum: 99 }),
  ovrDiscipline: disciplineEnum(),
  ovrDisciplineLabel: nonEmptyText(),
  ovrTier: nonEmptyText(),
  ovrByDiscipline: array(reference('StudioRosterOvrSnapshot', StudioRosterOvrSnapshot)),
  starPower: number({ minimum: 0, maximum: 100 }),
  specialtyLine: nonEmptyText(),
  currentWork: nonEmptyText(),
  availability: nonEmptyText(),
  status: employmentStatusEnum(),
  contractLine: nonEmptyText(),
  contractEndWeek: nullable(nonNegativeInteger()),
  attentionTier: nullable(attentionTierEnum()),
  attentionReason: nullable(text()),
  canLocate: bool(),
  population: enumeration(['employed', 'freelancer', 'known']),
  /** P14A.3: the world route's own status line, or null when no case is open. */
  worldStatusLine: nullable(nonEmptyText()),
})
const StudioRosterCountsSnapshot = object('StudioRosterCountsSnapshot', {
  employed: nonNegativeInteger(),
  freelancer: nonNegativeInteger(),
  known: nonNegativeInteger(),
  withAttention: nonNegativeInteger(),
})
const StudioRosterSnapshot = object('StudioRosterSnapshot', {
  rows: array(reference('StudioRosterRowSnapshot', StudioRosterRowSnapshot)),
  counts: reference('StudioRosterCountsSnapshot', StudioRosterCountsSnapshot),
})
const StudioPeopleAttentionCohortSnapshot = object('StudioPeopleAttentionCohortSnapshot', {
  key: nonEmptyText(),
  label: nonEmptyText(),
  tier: attentionTierEnum(),
  talentIds: array(nonEmptyText()),
})
const StudioPeopleAttentionSnapshot = object('StudioPeopleAttentionSnapshot', {
  cohorts: array(reference('StudioPeopleAttentionCohortSnapshot', StudioPeopleAttentionCohortSnapshot)),
  currentWeek: nonNegativeInteger(),
})

// P10A W0 (projection 18): the player-safe profiles, the roster and grouped attention ride
// their OWN additive bundle section (like P08's `history`), so the legacy lot-snapshot
// partition invariant (every people-section field is a legacy field) stays intact.
const StudioTalentSnapshot = object('StudioTalentSnapshot', {
  profiles: array(reference('StudioPersonProfileSnapshot', StudioPersonProfileSnapshot)),
  roster: reference('StudioRosterSnapshot', StudioRosterSnapshot),
  attention: reference('StudioPeopleAttentionSnapshot', StudioPeopleAttentionSnapshot),
})
export const StudioTalentProjectionSchema = object('StudioTalentProjection', {
  talent: reference('StudioTalentSnapshot', StudioTalentSnapshot),
})

export const StudioPeopleProjectionSchema = object('StudioPeopleProjection', {
  people: studioLotSnapshotProperties.people,
  presence: studioLotSnapshotProperties.presence,
})

export const StudioConstructionProjectionSchema = object('StudioConstructionProjection', {
  placement: studioLotSnapshotProperties.placement,
})

export const StudioJourneyNoticesProjectionSchema = object('StudioJourneyNoticesProjection', {
  firstFilmJourney: studioLotSnapshotProperties.firstFilmJourney,
  weekTheater: studioLotSnapshotProperties.weekTheater,
})

export const StudioReleaseResultsProjectionSchema = object('StudioReleaseResultsProjection', {
  releasedFilms: studioLotSnapshotProperties.releasedFilms,
  // P07A W2: rich per-film results (durable inspection), owned once here — same partition
  // pattern as releasedFilms. The coarse `releasedFilms` band is retained (D10 additive).
  results: studioLotSnapshotProperties.results,
})

export const StudioDevelopmentProjectionSchema = object('StudioDevelopmentProjection', {
  development: studioLotSnapshotProperties.development,
})

export const StudioCastingProjectionSchema = object('StudioCastingProjection', {
  casting: studioLotSnapshotProperties.casting,
})

// ── P08A W2 — the closed Standing & Studio History projection (charter P08 §12) ──
// Every value is a direct read of the recorded `studioHistory` root and the P07
// authorities it references: exact ids, frozen before/after/deltas, the formula
// identity, and player-safe driver facts already public in the accepted game.
// Nothing here is recomputed by the consumer; routine settling detail is folded
// server-side and the timeline carries material rows only.
const StudioStandingValues = object('StudioStandingValues', {
  audienceAwareness: number(),
  industryPrestige: number(),
  commercialConfidence: number(),
})
const StudioStandingChannelSnapshot = object('StudioStandingChannelSnapshot', {
  key: enumeration(['audienceAwareness', 'industryPrestige', 'commercialConfidence']),
  label: nonEmptyText(),
  meaning: nonEmptyText(),
  value: number(),
  recordedChange: number(),
})
const StudioStandingReceiptSnapshot = object('StudioStandingReceiptSnapshot', {
  eventId: nonNegativeInteger(),
  week: nonNegativeInteger(),
  sourceKind: enumeration(['releaseResult', 'publicity', 'awarenessDrift', 'settled']),
  sourceId: nullable(text()),
  sourceLabel: nonEmptyText(),
  significance: enumeration(['landmark', 'major', 'standard', 'routine']),
  before: reference('StudioStandingValues', StudioStandingValues),
  after: reference('StudioStandingValues', StudioStandingValues),
  deltas: reference('StudioStandingValues', StudioStandingValues),
  reasonLines: array(text()),
  formulaVersion: nonEmptyText(),
  filmId: nullable(text()),
  weekStart: nullable(nonNegativeInteger()),
  weekEnd: nullable(nonNegativeInteger()),
  count: nullable(nonNegativeInteger()),
})
const StudioHistoryEventSnapshot = object('StudioHistoryEventSnapshot', {
  eventId: nonNegativeInteger(),
  week: nonNegativeInteger(),
  kind: enumeration([
    'studioFounded',
    'standingChanged',
    'standingDriftFolded',
    'filmReleased',
    'theatricalRunCompleted',
    'facilityCommitted',
    'facilityCompleted',
    'facilityDemolished',
    'facilityMoved',
    'careerMilestone',
    'technologyMilestone',
    // P13B-S3 (projection 35): the five physical-plan transitions.
    'planQueued',
    'planStarted',
    'planHeld',
    'planBlocked',
    'planCancelled',
  ]),
  significance: enumeration(['landmark', 'major', 'standard', 'routine']),
  headline: nonEmptyText(),
  detail: text(),
  subjectKind: enumeration(['studio', 'film', 'person', 'facility']),
  subjectId: nullable(text()),
  subjectLabel: nonEmptyText(),
  subjectLocation: enumeration(['current', 'historical', 'none']),
  filmId: nullable(text()),
  personId: nullable(text()),
  buildingId: nullable(text()),
})
const StudioHistoryFilmSnapshot = object('StudioHistoryFilmSnapshot', {
  productionId: nonEmptyText(),
  title: nonEmptyText(),
  releaseWeek: nonNegativeInteger(),
  historyRecorded: bool(),
  resultAvailable: bool(),
  historyEventIds: array(nonNegativeInteger()),
})
const StudioHistoryCreditSnapshot = object('StudioHistoryCreditSnapshot', {
  productionId: nonEmptyText(),
  title: nonEmptyText(),
  roleLabel: nonEmptyText(),
})
const StudioHistoryPersonSnapshot = object('StudioHistoryPersonSnapshot', {
  talentId: nonEmptyText(),
  name: nonEmptyText(),
  roleLabel: nonEmptyText(),
  credits: array(reference('StudioHistoryCreditSnapshot', StudioHistoryCreditSnapshot)),
  uncapturedFilms: nonNegativeInteger(),
  onLot: bool(),
  present: bool(),
})
const StudioStandingBoardSnapshot = object('StudioStandingBoardSnapshot', {
  channels: array(reference('StudioStandingChannelSnapshot', StudioStandingChannelSnapshot)),
  receipts: array(reference('StudioStandingReceiptSnapshot', StudioStandingReceiptSnapshot)),
  routineWindowWeeks: integer({ minimum: 1 }),
})
const StudioHistorySnapshot = object('StudioHistorySnapshot', {
  recordingStartedWeek: nonNegativeInteger(),
  currentWeek: nonNegativeInteger(),
  notRecordedNotice: nullable(text()),
  standing: reference('StudioStandingBoardSnapshot', StudioStandingBoardSnapshot),
  timeline: array(reference('StudioHistoryEventSnapshot', StudioHistoryEventSnapshot)),
  films: array(reference('StudioHistoryFilmSnapshot', StudioHistoryFilmSnapshot)),
  people: array(reference('StudioHistoryPersonSnapshot', StudioHistoryPersonSnapshot)),
  recordsAvailable: bool(),
  recordsNotice: nonEmptyText(),
})
export const StudioHistoryProjectionSchema = object('StudioHistoryProjection', {
  history: reference('StudioHistorySnapshot', StudioHistorySnapshot),
})

// ── R3-N7-SIM-01 — the read-only Studio Operations Events projection ─────────
// A second, disjoint view beside `history`: the engine's own operating ledger
// (`state.studioEvents`), published so a decision cue that has cleared stays
// RETRIEVABLE. Nothing here is stored, consumed or re-derived — see
// `bridge/operations-events.ts` for the three honesty rules it enforces.
// `significance` is deliberately the SAME vocabulary History's four shipped
// filter chips already use, so one chip strip governs both lists.

/** The sixteen `StudioEventDraft` kinds, exactly (`src/core/studioEvents.ts`). */
const operationsEventKind = () =>
  enumeration([
    'wrapped',
    'premiere',
    'releaseCommitted',
    'constructionCompleted',
    'setBuilt',
    'setRetired',
    'reservationGranted',
    'reservationReleased',
    'phaseEntered',
    'sceneryArrived',
    // P13B-S5-R07 (projection 38): the four setup history kinds. Tier W, like
    // every other operating row here; the durable record is the workflow's own
    // `setup` leaf, published beside it on the production row.
    'setupAdmitted',
    'setupUnitCredited',
    'setupCompleted',
    'setupRebound',
    'queueAdmitted',
    'queueIntentExpired',
  ])
const StudioOperationsEventSubject = object('StudioOperationsEventSubject', {
  kind: enumeration(['production', 'film', 'building', 'set', 'queue', 'resource']),
  id: nonEmptyText(),
})
const StudioOperationsEventRoute = object('StudioOperationsEventRoute', {
  filmId: nullable(text()),
  /** Always null: not one of the sixteen kinds carries a talent id. */
  personId: nullable(text()),
  buildingId: nullable(text()),
})
const StudioOperationsEventSnapshot = object('StudioOperationsEventSnapshot', {
  seq: nonNegativeInteger(),
  week: nonNegativeInteger(),
  date: nonEmptyText(),
  kind: operationsEventKind(),
  tier: enumeration(['permanent', 'windowed']),
  significance: enumeration(['major', 'standard']),
  summary: nonEmptyText(),
  /** Null ONLY where the row carries no durable identity of its own. */
  subject: nullable(reference('StudioOperationsEventSubject', StudioOperationsEventSubject)),
  route: reference('StudioOperationsEventRoute', StudioOperationsEventRoute),
})
const StudioOperationsEventsCoverage = object('StudioOperationsEventsCoverage', {
  windowWeeks: integer({ minimum: 1 }),
  oldestWindowedWeek: nullable(nonNegativeInteger()),
  permanentKinds: array(operationsEventKind()),
})
const StudioOperationsEventsTotals = object('StudioOperationsEventsTotals', {
  permanent: nonNegativeInteger(),
  windowed: nonNegativeInteger(),
})
const StudioOperationsEventsSnapshot = object('StudioOperationsEventsSnapshot', {
  currentWeek: nonNegativeInteger(),
  coverage: reference('StudioOperationsEventsCoverage', StudioOperationsEventsCoverage),
  totals: reference('StudioOperationsEventsTotals', StudioOperationsEventsTotals),
  rows: array(reference('StudioOperationsEventSnapshot', StudioOperationsEventSnapshot)),
})
export const StudioOperationsEventsProjectionSchema = object('StudioOperationsEventsProjection', {
  operationsEvents: reference('StudioOperationsEventsSnapshot', StudioOperationsEventsSnapshot),
})

// ── P06A W2 — the closed Release projection (recon r2 §6.3) ─────────────────
const StudioReleaseDecisionSnapshot = object('StudioReleaseDecisionSnapshot', {
  productionId: nonEmptyText(),
  title: nonEmptyText(),
  genreLabel: nonEmptyText(),
  authorityState: enumeration(['ready-uncommitted', 'committed']),
  commitmentId: nullable(text()),
  committedAtWeek: nullable(nonNegativeInteger()),
  legalCommit: bool(),
  refusal: nullable(text()),
  expectedCriticScore: number({}),
  expectedOpening: number({}),
  expectedTotal: number({}),
  alreadyPaidProduction: number({ minimum: 0 }),
  alreadyPaidMarketing: number({ minimum: 0 }),
  holdBusyTalentIds: array(text()),
  holdBusyTalentNames: array(text()),
})

const StudioReleaseBoard = object('StudioReleaseBoard', {
  decisions: array(reference('StudioReleaseDecisionSnapshot', StudioReleaseDecisionSnapshot)),
  // TypeScript-authored auto-roll fact: false while ANY decision stop is live.
  // Unity's Living Time consumes THIS — intent presence is never permission (W5).
  automaticWeekRollEligible: bool(),
  nextDecisionKind: nullable(
    enumeration(['scriptReview', 'castingReview', 'productionOperation', 'releaseReview']),
  ),
})

export const StudioReleaseProjectionSchema = object('StudioReleaseProjection', {
  // The house sectioning pattern: each bundle section wraps its content under
  // its own wire key and is projected from the flat composed source.
  release: reference('StudioReleaseBoard', StudioReleaseBoard),
})

// P11: engine-authored current pace and bounded recorded cash explanation.
const StudioFinanceCategory = object('StudioFinanceCategory', {
  kind: nonEmptyText(), label: nonEmptyText(), amount: number(), entryCount: nonNegativeInteger(),
})
const StudioFinanceCapitalContributor = object('StudioFinanceCapitalContributor', {
  ledgerIndex: nonNegativeInteger(), week: nonNegativeInteger(), amount: number(),
  constructionProjectId: nonEmptyText(), name: text(), placementId: nullable(nonNegativeInteger()),
  facilityId: nullable(nonEmptyText()), buildingId: nullable(nonEmptyText()),
  historyEventId: nullable(nonNegativeInteger()), identityBasis: nonEmptyText(),
})
const StudioFinanceCapitalContributors = object('StudioFinanceCapitalContributors', {
  // Producer caps this detail at 20 and reports every omitted payment in the remainder.
  rows: array(reference('StudioFinanceCapitalContributor', StudioFinanceCapitalContributor)),
  totalEntries: nonNegativeInteger(), displayedAmount: number(), remainingEntries: nonNegativeInteger(),
  remainingAmount: number(), recordedAmount: number(), notice: nullable(text()),
})
const StudioFinancePeriod = object('StudioFinancePeriod', {
  id: nonEmptyText(), label: nonEmptyText(), fromWeek: nonNegativeInteger(), toWeekInclusive: nonNegativeInteger(),
  timeClass: literal('recordedCash'), coverage: enumeration(['complete','partial','unavailable']),
  complete: bool(), notice: nullable(text()), openingCash: nullable(number()), closingCash: nullable(number()),
  netCash: number(), categories: array(reference('StudioFinanceCategory', StudioFinanceCategory)),
  capitalContributors: reference('StudioFinanceCapitalContributors', StudioFinanceCapitalContributors),
})
const StudioFinanceEmployee = object('StudioFinanceEmployee', {
  talentId: nonEmptyText(), name: nonEmptyText(), profession: nonEmptyText(), weeklySalary: number(), chargedNextAdvance: number(),
  endWeekExclusive: nonNegativeInteger(), remainingWeeks: nonNegativeInteger(), guaranteedRemaining: number(),
  terminationCost: number(), renewalOpen: bool(), renewalLine: text(),
})
const StudioFinanceFacility = object('StudioFinanceFacility', {
  placementId: nonNegativeInteger(), buildingId: nonEmptyText(), facilityId: nonEmptyText(), projectId: nonEmptyText(),
  name: nonEmptyText(),
  // P13B-S6: this row publishes EVERY placement record, installations included, so it
  // carries the engine's third `PlacementStatus`. The lot views stay two-value by
  // construction: `PlacedFacilityView` filters to bodies, which can never be cancelled.
  status: enumeration(['underConstruction','operational','cancelled']), completesWeek: nonNegativeInteger(),
  weeklyOperatingCost: number(), chargedNextAdvance: number(), capacity: nonNegativeInteger(), capability: nullable(text()), onsetLine: nonEmptyText(),
})
const StudioFinanceFilm = object('StudioFinanceFilm', {
  productionId: nonEmptyText(), title: nonEmptyText(), status: enumeration(['inProduction','releasing','settled','legacy']),
  releaseWeek: nullable(nonNegativeInteger()), resultAvailable: bool(), theatricalGross: nullable(number()),
  studioRevenueReceived: number(), studioRevenueTotal: nullable(number()), studioRevenueRemaining: nullable(number()),
  remainingWeeks: nonNegativeInteger(), directCommitment: nullable(number()), productionAndMarketing: nullable(number()),
  freelancerFees: nullable(number()), contribution: nullable(number()), contributionLabel: nonEmptyText(), basis: nonEmptyText(),
})
const StudioFinanceRoute = object('StudioFinanceRoute', {
  kind: enumeration(['profile','facilityHistory','casting','production','releaseResult','filmHistory','development']),
  targetId: nonEmptyText(), label: nonEmptyText(),
})
/**
 * R3-N4-SIM-20: one Finance attention line. `id` is a stable row identity (the
 * client keys `finance-attention-<id>` off it), `message` is the unchanged
 * sentence, and `route` is an EXISTING presentation destination or null. No new
 * route kind is minted here: a line whose destination is inside the Finance
 * screen itself publishes `route: null` rather than an invented target.
 */
const StudioFinanceAttention = object('StudioFinanceAttention', {
  id: nonEmptyText(), message: nonEmptyText(), route: nullable(reference('StudioFinanceRoute', StudioFinanceRoute)),
})
const StudioFinanceUpcomingEvent = object('StudioFinanceUpcomingEvent', {
  id: nonEmptyText(), kind: enumeration(['facilityCompletion','facilityOpex','contractRenewal','contractExpiry','setCompletion']),
  week: nonNegativeInteger(), label: nonEmptyText(), detail: nonEmptyText(),
  weeklyOperatingCostChange: nullable(number()), route: nullable(reference('StudioFinanceRoute', StudioFinanceRoute)),
})
const StudioFinanceUpcomingWindow = object('StudioFinanceUpcomingWindow', {
  windowWeeks: integer({ minimum: 13, maximum: 52 }), fromWeek: nonNegativeInteger(), toWeekInclusive: nonNegativeInteger(),
  rows: array(reference('StudioFinanceUpcomingEvent', StudioFinanceUpcomingEvent)), remainingRows: nonNegativeInteger(), notice: nullable(text()),
})
const StudioFinanceUpcoming = object('StudioFinanceUpcoming', {
  timeClass: literal('knownCommitment'), defaultWindowWeeks: literal(13), nextAdvanceStudioRevenue: number(), remainingStudioRevenue: number(),
  basis: nonEmptyText(), windows: array(reference('StudioFinanceUpcomingWindow', StudioFinanceUpcomingWindow)),
})
const StudioFinancePortfolioRow = object('StudioFinancePortfolioRow', {
  id: nonEmptyText(), identityKind: enumeration(['scriptProject','production']), projectId: nullable(nonEmptyText()), productionId: nullable(nonEmptyText()),
  title: nonEmptyText(), phase: enumeration(['developmentPackage','production','postReleaseReady','inTheaters','completed']),
  phaseLabel: nonEmptyText(), timingWeek: nullable(nonNegativeInteger()), phaseWeeksRemaining: nullable(nonNegativeInteger()),
  timingLabel: nonEmptyText(), hasDecisionOrBlocker: bool(), decisionLine: nonEmptyText(),
  commitmentState: enumeration(['uncommitted','recorded','notRecorded']), directCommitment: nullable(number()),
  studioRevenueReceived: nullable(number()), studioRevenueRemaining: nullable(number()), studioRevenueTotal: nullable(number()),
  contribution: nullable(number()), contributionLabel: nonEmptyText(), basis: nonEmptyText(),
  routes: array(reference('StudioFinanceRoute', StudioFinanceRoute)),
})
const StudioFinancePortfolio = object('StudioFinancePortfolio', {
  defaultSort: literal('attentionPhaseTime'), basis: nonEmptyText(), rows: array(reference('StudioFinancePortfolioRow', StudioFinancePortfolioRow)),
})
const StudioFinanceCostPoint = object('StudioFinanceCostPoint', {
  week: nonNegativeInteger(), amount: nullable(number()), coverage: enumeration(['complete','partial','unavailable']), notice: nullable(text()),
})
const StudioFinanceCostSeries = object('StudioFinanceCostSeries', {
  kind: nonEmptyText(), label: nonEmptyText(), periodAmount: nullable(number()), points: array(reference('StudioFinanceCostPoint', StudioFinanceCostPoint)),
})
const StudioFinanceHistoryWindow = object('StudioFinanceHistoryWindow', {
  windowWeeks: integer({ minimum: 13, maximum: 52 }), label: nonEmptyText(), period: nullable(reference('StudioFinancePeriod', StudioFinancePeriod)),
  points: array(reference('StudioFinancePeriod', StudioFinancePeriod)), costSeries: array(reference('StudioFinanceCostSeries', StudioFinanceCostSeries)),
})
const StudioFinanceHistory = object('StudioFinanceHistory', {
  defaultWindowWeeks: literal(13), calendarNotice: nonEmptyText(), windows: array(reference('StudioFinanceHistoryWindow', StudioFinanceHistoryWindow)),
})
const StudioFinanceSnapshot = object('StudioFinanceSnapshot', {
  upcoming: reference('StudioFinanceUpcoming', StudioFinanceUpcoming),
  portfolio: reference('StudioFinancePortfolio', StudioFinancePortfolio),
  history: reference('StudioFinanceHistory', StudioFinanceHistory),
  employees: array(reference('StudioFinanceEmployee', StudioFinanceEmployee)),
  facilities: array(reference('StudioFinanceFacility', StudioFinanceFacility)),
  films: array(reference('StudioFinanceFilm', StudioFinanceFilm)),
  guaranteedPayrollRemaining: number(), obligationsBasis: nonEmptyText(), operationsBasis: nonEmptyText(),
  attention: array(reference('StudioFinanceAttention', StudioFinanceAttention)),
  weeklyCostTimeClass: literal('currentRecurringCost'), scheduledRevenueTimeClass: literal('knownCommitment'), paceTimeClass: literal('currentPaceEstimate'),
  asOfWeek: nonNegativeInteger(), cash: number(), weeklyPayroll: number({minimum: 0}),
  weeklyOverhead: number({minimum: 0}), weeklyFacilityOperatingCost: number({minimum: 0}),
  weeklyOperatingCost: number({minimum: 0}), nextScheduledStudioRevenue: number({minimum: 0}),
  netWeeklyCashflow: number(), runwayState: enumeration(['inRed', 'positive', 'steady', 'finite', 'unavailable']),
  runwayLabel: nonEmptyText(), runwayWeeks: nullable(nonNegativeInteger()), paceBasis: nonEmptyText(),
  firstCompleteWeek: nullable(nonNegativeInteger()), coverageNotice: nullable(text()),
  lastPeriod: nullable(reference('StudioFinancePeriod', StudioFinancePeriod)),
  currentPeriod: reference('StudioFinancePeriod', StudioFinancePeriod),
})
export const StudioFinanceProjectionSchema = object('StudioFinanceProjection', {
  finance: reference('StudioFinanceSnapshot', StudioFinanceSnapshot),
})

export const StudioProjectionBundleSchema = object('StudioProjectionBundle', {
  industry:reference('StudioIndustryProjection',StudioIndustryProjection),
  lot: reference('StudioLotProjection', StudioLotProjectionSchema),
  productions: reference('StudioProductionsProjection', StudioProductionsProjectionSchema),
  people: reference('StudioPeopleProjection', StudioPeopleProjectionSchema),
  construction: reference('StudioConstructionProjection', StudioConstructionProjectionSchema),
  journeyNotices: reference('StudioJourneyNoticesProjection', StudioJourneyNoticesProjectionSchema),
  releaseResults: reference('StudioReleaseResultsProjection', StudioReleaseResultsProjectionSchema),
  development: reference('StudioDevelopmentProjection', StudioDevelopmentProjectionSchema),
  casting: reference('StudioCastingProjection', StudioCastingProjectionSchema),
  release: reference('StudioReleaseProjection', StudioReleaseProjectionSchema),
  // P08A W2: the Standing & Studio History section (additive; projection 16).
  history: reference('StudioHistoryProjection', StudioHistoryProjectionSchema),
  // R3-N7-SIM-01: the read-only operating ledger beside it (additive; projection 32).
  operationsEvents: reference('StudioOperationsEventsProjection', StudioOperationsEventsProjectionSchema),
  finance: reference('StudioFinanceProjection', StudioFinanceProjectionSchema),
  // P10A W0: the player-safe Talent section — profiles, roster, grouped attention (additive; projection 18).
  talent: reference('StudioTalentProjection', StudioTalentProjectionSchema),
})


export const REJECTION_CODES = [
  'INVALID_JSON',
  'INVALID_COMMAND',
  'INVALID_CONTROL',
  'PROTOCOL_MISMATCH',
  'SCHEMA_MISMATCH',
  'SESSION_MISMATCH',
  'STALE_REVISION',
  'COMMAND_ID_REUSE',
  'INTENT_NOT_AVAILABLE',
  'ENGINE_REJECTED',
  'NO_SAVE',
  'SAVE_REJECTED',
  'CAMPAIGN_CONFLICT','CAMPAIGN_NOT_FOUND','INVALID_CAMPAIGN_LABEL','UNSAVED_PROGRESS','STORAGE_UNAVAILABLE',
] as const

export const REJECTION_CATEGORIES = [
  'request-invalid',
  'contract-incompatible',
  'session-mismatch',
  'state-stale',
  'command-conflict',
  'intent-unavailable',
  'authority-refusal',
  'save-state',
] as const


const StudioSavedSlotSnapshot = object('StudioSavedSlotSnapshot', {
  studioName: nonEmptyText(),
  gameWeek: nonNegativeInteger(),
})

const StudioBridgeMetrics = object('StudioBridgeMetrics', {
  payloadBytes: nonNegativeInteger(),
  serializationMs: number({ minimum: 0 }),
})

const StudioBridgeIntentPayload = object('StudioBridgeIntentPayload', {
  intentId: nonEmptyText(),
})

const StudioBridgeIntentRequest = object('StudioBridgeIntentRequest', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  expectedStateRevision: nonNegativeInteger(),
  type: literal('submitIntent'),
  payload: reference('StudioBridgeIntentPayload', StudioBridgeIntentPayload),
})

const StudioBridgeControlRequest = object('StudioBridgeControlRequest', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  expectedStateRevision: nonNegativeInteger(),
})

// P12A storage operations have an explicit authority-switch receipt. They do not impersonate /load.
export const CAMPAIGN_OPERATIONS = ['newGame','save','saveAs','load','rename','delete','discard'] as const
const StudioCampaignSummary = object('StudioCampaignSummary', {
  id:nonEmptyText(),label:nonEmptyText(),revision:nonNegativeInteger(),gameWeek:nonNegativeInteger(),
  year:integer({minimum:1920}),weekOfYear:integer({minimum:1,maximum:52}),dateLabel:nonEmptyText(),studioName:nullable(nonEmptyText()),
})
const StudioCampaignLibraryResponse = object('StudioCampaignLibraryResponse', {
  protocolVersion:literal(PROTOCOL_VERSION),schemaId:nonEmptyText(),snapshotVersion:literal(PROJECTION_VERSION),
  type:literal('campaignLibrary'),sessionId:nonEmptyText(),stateRevision:nonNegativeInteger(),gameWeek:nonNegativeInteger(),stateDigest:nonEmptyText(),
  catalogueRevision:nonNegativeInteger(),activeCampaignId:nullable(nonEmptyText()),dirty:bool(),durable:bool(),
  campaigns:array(reference('StudioCampaignSummary',StudioCampaignSummary)),
})
const StudioCampaignRequest = object('StudioCampaignRequest', {
  protocolVersion:literal(PROTOCOL_VERSION),schemaId:nonEmptyText(),sessionId:nonEmptyText(),commandId:nonEmptyText(),expectedStateRevision:nonNegativeInteger(),
  type:literal('campaign'),operation:enumeration(CAMPAIGN_OPERATIONS),expectedCatalogueRevision:nonNegativeInteger(),
  expectedActiveCampaignId:nullable(nonEmptyText()),campaignId:nullable(nonEmptyText()),label:nullable(nonEmptyText()),
  overwriteCampaignId:nullable(nonEmptyText()),confirmDestructive:bool(),unsavedDisposition:enumeration(['requireClean','save','discard']),
})
const StudioCampaignAcceptedResponse = object('StudioCampaignAcceptedResponse', {
  protocolVersion:literal(PROTOCOL_VERSION),schemaId:nonEmptyText(),type:literal('campaignAccepted'),accepted:literal(true),
  commandId:nonEmptyText(),originatingSessionId:nonEmptyText(),operation:enumeration(CAMPAIGN_OPERATIONS),campaignId:nullable(nonEmptyText()),
  sessionId:nonEmptyText(),stateRevision:nonNegativeInteger(),gameWeek:nonNegativeInteger(),stateDigest:nonEmptyText(),catalogueRevision:nonNegativeInteger(),
  message:text(),processingMs:number({minimum:0}),
})

const snapshotResponseProperties = {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  snapshotVersion: literal(PROJECTION_VERSION),
  sessionId: nonEmptyText(),
  stateRevision: nonNegativeInteger(),
  gameWeek: nonNegativeInteger(),
  stateDigest: nonEmptyText(),
  snapshot: reference('StudioProjectionBundle', StudioProjectionBundleSchema),
  /** Non-null exactly while the founding draft is open (LL-CP9 gate arrivals). */
  founding: nullable(reference('StudioFoundingSnapshot', StudioFoundingSnapshot)),
  savedSlot: nullable(reference('StudioSavedSlotSnapshot', StudioSavedSlotSnapshot)),
  treasury: reference('StudioTreasurySnapshot', StudioTreasurySnapshot),
  availableIntents: array(reference('StudioBridgeIntentOption', StudioBridgeIntentOption)),
  metrics: reference('StudioBridgeMetrics', StudioBridgeMetrics),
}

const StudioBridgeSnapshotResponse = object(
  'StudioBridgeSnapshotResponse',
  snapshotResponseProperties,
)

const StudioBridgeAcceptedCommandResponse = object('StudioBridgeAcceptedCommandResponse', {
  ...snapshotResponseProperties,
  commandId: nonEmptyText(),
  accepted: literal(true),
  message: text(),
  processingMs: number({ minimum: 0 }),
})

const StudioBridgeSaveResponse = object('StudioBridgeSaveResponse', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nonEmptyText(),
  accepted: literal(true),
  message: text(),
  stateRevision: nonNegativeInteger(),
  gameWeek: nonNegativeInteger(),
  stateDigest: nonEmptyText(),
  saveJson: nonEmptyText(),
  savedSlot: nullable(reference('StudioSavedSlotSnapshot', StudioSavedSlotSnapshot)),
  processingMs: number({ minimum: 0 }),
})

const StudioBridgeRejection = object('StudioBridgeRejection', {
  category: enumeration(REJECTION_CATEGORIES),
  blocker: nonEmptyText(),
  currentHolder: nullable(nonEmptyText()),
  remedy: nonEmptyText(),
})

const StudioBridgeRejectedResponse = object('StudioBridgeRejectedResponse', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  sessionId: nonEmptyText(),
  commandId: nullable(text()),
  accepted: literal(false),
  reasonCode: enumeration(REJECTION_CODES),
  rejection: reference('StudioBridgeRejection', StudioBridgeRejection),
  message: nonEmptyText(),
  stateRevision: nonNegativeInteger(),
  gameWeek: nonNegativeInteger(),
  stateDigest: nonEmptyText(),
  processingMs: number({ minimum: 0 }),
})

const StudioBridgeHealthResponse = object('StudioBridgeHealthResponse', {
  status: literal('ok'),
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  snapshotVersion: literal(PROJECTION_VERSION),
  runtimeInstanceId: nonEmptyText(),
  sessionId: nonEmptyText(),
  stateRevision: nonNegativeInteger(),
  gameWeek: nonNegativeInteger(),
  stateDigest: nonEmptyText(),
})

const StudioBridgeSessionResponse = object('StudioBridgeSessionResponse', {
  protocolVersion: literal(PROTOCOL_VERSION),
  schemaId: nonEmptyText(),
  snapshotVersion: literal(PROJECTION_VERSION),
  runtimeInstanceId: nonEmptyText(),
  sessionId: nonEmptyText(),
  stateRevision: nonNegativeInteger(),
  gameWeek: nonNegativeInteger(),
  stateDigest: nonEmptyText(),
})

const StudioBridgeContractResponse = object('StudioBridgeContractResponse', {
  schemaId: nonEmptyText(),
  contractJson: nonEmptyText(),
})

const definitions = {
  ...industryDefinitions,
  StudioGridCellSnapshot,
  StudioGridRectSnapshot,
  StudioFootprintSnapshot,
  StudioBuildingSnapshot,
  StudioProductionSnapshot,
  StudioReleasedFilmSnapshot,
  StudioFilmSegmentScore,
  StudioFilmResultSnapshot,
  StudioJourneyNextSnapshot,
  StudioJourneyWaitingSnapshot,
  StudioJourneyBlockedSnapshot,
  StudioFirstFilmJourneySnapshot,
  StudioProductionBlockerSnapshot,
  StudioProductionCompanyMemberSnapshot,
  StudioAssignShootingDirectorCommand,
  StudioClearSceneryLoadInCommand,
  StudioScheduleShootingTakeCommand,
  StudioProductionCommandSnapshot,
  StudioProductionTargetSnapshot,
  StudioBlockerHolderSnapshot,
  StudioProductionRemedyRouteSnapshot,
  StudioProductionBlockerAnatomySnapshot,
  StudioWrapReceiptSnapshot,
  StudioStageLogisticsCueSnapshot,
  StudioStageProductionSnapshot,
  StudioProductionSetup,
  StudioSetupRecipeAction,
  StudioProductionOperationsSnapshot,
  StudioPersonSnapshot,
  StudioPresencePersonSnapshot,
  StudioPresenceSnapshot,
  StudioParcelSnapshot,
  StudioPlacementMutationBlockSnapshot,
  StudioPlacementMutationSnapshot,
  StudioPlacedFacilitySnapshot,
  StudioPlacementCatalogEntrySnapshot,
  StudioPlacementSnapshot,
  StudioPropertyBoundsSnapshot,
  StudioPropertyBuildingSnapshot,
  StudioPropertySnapshot,
  StudioWeekTheaterSubjectSnapshot,
  StudioWeekTheaterSnapshot,
  StudioStageSnapshot,
  StudioSetSnapshot,
  StudioSetCatalogEntrySnapshot,
  StudioFoundingArrivalSnapshot,
  StudioFoundingRoleProgressSnapshot,
  StudioFoundingSignedSnapshot,
  StudioFoundingSnapshot,
  StudioTreasurySnapshot,
  StudioDevelopmentBlockerSnapshot,
  StudioScriptAssessmentSnapshot,
  StudioDevelopmentOccupantSnapshot,
  StudioDevelopmentSlotSnapshot,
  StudioDevelopmentFacilitySnapshot,
  StudioDevelopmentCapacitySnapshot,
  StudioDevelopmentProjectSnapshot,
  StudioCommissionConceptSnapshot,
  StudioCommissionWriterSnapshot,
  StudioCommissionOfficeUpliftSnapshot,
  StudioCommissionChoiceSnapshot,
  StudioCommissionSegmentSnapshot,
  StudioCommissionGenreSnapshot,
  StudioCommissionPromiseAxisSnapshot,
  StudioCommissionCatalogSnapshot,
  StudioCommissionBoardSnapshot,
  StudioScriptExplanationSnapshot,
  StudioScriptBriefSnapshot,
  StudioScriptAcceptCardSnapshot,
  StudioRewritePreviewSnapshot,
  StudioScriptRewriteCardSnapshot,
  StudioScriptReviewSnapshot,
  StudioDevelopmentAttentionSnapshot,
  StudioDevelopmentBoardSnapshot,
  StudioDevelopmentSnapshot,
  StudioCastingSignalSnapshot,
  StudioCastingEvidenceSnapshot,
  StudioContractOfferSnapshot,
  StudioHiringCandidateSnapshot,
  StudioBudgetOptionSnapshot,
  StudioCastingBlockerSnapshot,
  StudioCastingCandidateSnapshot,
  StudioCastingResultsSnapshot,
  StudioCastingReadinessSnapshot,
  StudioCastingSlateReadSnapshot,
  StudioCastingActiveSlateSnapshot,
  StudioCastingProjectSnapshot,
  StudioCastingExpiryNoticeSnapshot,
  StudioCastingBoardSnapshot,
  StudioCastingSnapshot,
  StudioCommissionDraftPayload,
  StudioCommissionQuoteSnapshot,
  StudioCastingDraftPayload,
  StudioQuoteCommissionRequest,
  StudioQuoteCastingRequest,
  StudioPlacementDraftPayload,
  StudioSetCommissionDraftPayload,
  StudioQuotePlacementRequest,
  StudioQuoteSetCommissionRequest,
  StudioContractDraftPayload,
  StudioQuoteContractRequest,
  StudioMarketProposalCastClassPromiseDraftPayload,
  StudioMarketProposalCountPromiseDraftPayload,
  StudioMarketProposalPromiseDraftPayload,
  StudioMarketProposalDraftPayload,
  StudioQuoteMarketProposalRequest,
  StudioPromiseWaiverCastClassSubstituteDraftPayload,
  StudioPromiseWaiverCountSubstituteDraftPayload,
  StudioPromiseWaiverSubstituteDraftPayload,
  StudioPromiseWaiverDraftPayload,
  StudioQuoteWaivePromiseRequest,
  StudioMarketPromiseQuoteSnapshot,
  StudioMarketProposalQuoteSnapshot,
  StudioPromiseWaiverQuoteSnapshot,
  StudioBridgeQuoteRequest,
  StudioCastingChemistryRow,
  StudioCastingQuoteSnapshot,
  StudioPlacementCellVerdictSnapshot,
  StudioPlacementUnmetRequirementSnapshot,
  StudioPlacementQuoteSnapshot,
  StudioSetCommissionQuoteSnapshot,
  StudioContractQuoteSnapshot,
  StudioQuoteSnapshot,
  StudioBridgeQuoteResponse,
  StudioLotProjection: StudioLotProjectionSchema,
  StudioProductionsProjection: StudioProductionsProjectionSchema,
  StudioPeopleProjection: StudioPeopleProjectionSchema,
  StudioConstructionProjection: StudioConstructionProjectionSchema,
  StudioJourneyNoticesProjection: StudioJourneyNoticesProjectionSchema,
  StudioReleaseResultsProjection: StudioReleaseResultsProjectionSchema,
  StudioDevelopmentProjection: StudioDevelopmentProjectionSchema,
  StudioCastingProjection: StudioCastingProjectionSchema,
  StudioReleaseDecisionSnapshot,
  StudioReleaseBoard,
  StudioReleaseProjection: StudioReleaseProjectionSchema,
  StudioStandingValues,
  StudioStandingChannelSnapshot,
  StudioStandingReceiptSnapshot,
  StudioHistoryEventSnapshot,
  StudioHistoryFilmSnapshot,
  StudioHistoryCreditSnapshot,
  StudioHistoryPersonSnapshot,
  StudioStandingBoardSnapshot,
  StudioHistorySnapshot,
  StudioHistoryProjection: StudioHistoryProjectionSchema,
  StudioOperationsEventSubject,
  StudioOperationsEventRoute,
  StudioOperationsEventSnapshot,
  StudioOperationsEventsCoverage,
  StudioOperationsEventsTotals,
  StudioOperationsEventsSnapshot,
  StudioOperationsEventsProjection: StudioOperationsEventsProjectionSchema,
  StudioPersonDisciplineSnapshot,
  StudioPersonSpecialtySnapshot,
  StudioPersonRenewalTermSnapshot,
  StudioPersonContractActionsSnapshot,
  StudioPersonContractSnapshot,
  StudioPersonEmploymentSnapshot,
  StudioPersonWorkSnapshot,
  StudioPersonPresenceSnapshot,
  StudioPersonAttentionSnapshot,
  StudioPersonCareerRowSnapshot,
  StudioPersonCareerSnapshot,
  StudioMarketPromiseSnapshot,
  StudioMarketPromiseHistoryRow,
  StudioMarketOwnProposalSnapshot,
  StudioMarketUndisclosedProposalSnapshot,
  StudioMarketProposalSnapshot,
  StudioMarketAttentionRowSnapshot,
  StudioMarketPreferencesSnapshot,
  StudioMarketCaseSnapshot,
  StudioMarketCaseRow,
  StudioMarketFreeAgentRow,
  StudioMarketClosedCases,
  StudioMarketCases,
  StudioMarketEmployerRow,
  StudioMarketCandidateRail,
  StudioMarketHistory,
  StudioMarketCaseDetail,
  StudioMarketPage,
  StudioWorldCaseRef,
  StudioWorldRouteSnapshot,
  StudioTrustDriverRow,
  StudioTrustBlock,
  StudioRelationshipRow,
  StudioRelationshipBlock,
  StudioPersonProfileSnapshot,
  StudioRosterOvrSnapshot,
  StudioRosterRowSnapshot,
  StudioRosterCountsSnapshot,
  StudioRosterSnapshot,
  StudioPeopleAttentionCohortSnapshot,
  StudioPeopleAttentionSnapshot,
  StudioTalentSnapshot,
  StudioTalentProjection: StudioTalentProjectionSchema,
  StudioProjectionBundle: StudioProjectionBundleSchema,
  StudioFinanceProjection: StudioFinanceProjectionSchema,
  StudioFinanceSnapshot,
  StudioFinanceRoute,
  StudioFinanceAttention,
  StudioFinanceUpcoming,
  StudioFinanceUpcomingWindow,
  StudioFinanceUpcomingEvent,
  StudioFinancePortfolio,
  StudioFinancePortfolioRow,
  StudioFinanceHistory,
  StudioFinanceHistoryWindow,
  StudioFinanceCostSeries,
  StudioFinanceCostPoint,
  StudioFinancePeriod,
  StudioFinanceCategory,
  StudioFinanceCapitalContributor,
  StudioFinanceCapitalContributors,
  StudioFinanceEmployee,
  StudioFinanceFacility,
  StudioFinanceFilm,
  StudioFinancialConsequence,
  StudioBridgeIntentOption,
  StudioSavedSlotSnapshot,
  StudioBridgeMetrics,
  StudioBridgeIntentPayload,
  StudioBridgeIntentRequest,
  StudioBridgeControlRequest,
  StudioCampaignSummary,StudioCampaignLibraryResponse,StudioCampaignRequest,StudioCampaignAcceptedResponse,
  StudioBridgeSnapshotResponse,
  StudioBridgeAcceptedCommandResponse,
  StudioBridgeSaveResponse,
  StudioBridgeRejection,
  StudioBridgeRejectedResponse,
  StudioBridgeHealthResponse,
  StudioBridgeSessionResponse,
  StudioBridgeContractResponse,
} as const

export const BRIDGE_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `urn:project-studio:bridge:protocol-${PROTOCOL_VERSION}:projection-${PROJECTION_VERSION}`,
  title: 'Project Studio TypeScript to Unity Bridge',
  description: 'Canonical wire contract owned by the authoritative TypeScript runtime.',
  oneOf: [
    { $ref: '#/$defs/StudioBridgeIntentRequest' },
    { $ref: '#/$defs/StudioBridgeControlRequest' },
    { $ref: '#/$defs/StudioCampaignRequest' },
    { $ref: '#/$defs/StudioIndustryRequest' },
    { $ref: '#/$defs/StudioIndustryResponse' },
    { $ref: '#/$defs/StudioCampaignLibraryResponse' },
    { $ref: '#/$defs/StudioCampaignAcceptedResponse' },
    { $ref: '#/$defs/StudioBridgeQuoteRequest' },
    { $ref: '#/$defs/StudioBridgeQuoteResponse' },
    { $ref: '#/$defs/StudioBridgeSnapshotResponse' },
    { $ref: '#/$defs/StudioBridgeAcceptedCommandResponse' },
    { $ref: '#/$defs/StudioBridgeSaveResponse' },
    { $ref: '#/$defs/StudioBridgeRejectedResponse' },
    { $ref: '#/$defs/StudioBridgeHealthResponse' },
    { $ref: '#/$defs/StudioBridgeSessionResponse' },
    { $ref: '#/$defs/StudioBridgeContractResponse' },
  ],
  $defs: definitions,
  'x-project-studio': {
    contractId: 'project-studio-current-game-unity-bridge',
    protocolVersion: PROTOCOL_VERSION,
    projectionVersion: PROJECTION_VERSION,
    transport: 'http-json-localhost',
    routes: {
      health: 'GET /health',
      contract: 'GET /contract',
      session: 'GET /session',
      snapshot: 'GET /snapshot',
      command: 'POST /command',
      quote: 'POST /quote',
      save: 'POST /save',
      load: 'POST /load',
    },
  },
} as const satisfies JsonSchema

export type BridgeStudioLotSnapshot = InferSchema<typeof StudioLotSnapshotSchema>
export type BridgeStudioProjectionBundle = InferSchema<typeof StudioProjectionBundleSchema>
export type BridgeAvailableIntent = InferSchema<typeof StudioBridgeIntentOption>
export type BridgeSubmitIntentCommand = InferSchema<typeof StudioBridgeIntentRequest>
export type BridgeControlEnvelope = InferSchema<typeof StudioBridgeControlRequest>
export type BridgeRejectionCode = (typeof REJECTION_CODES)[number]
export type BridgeRejectionCategory = (typeof REJECTION_CATEGORIES)[number]
export type BridgeRejection = InferSchema<typeof StudioBridgeRejection>
export type BridgeSnapshotEnvelope = InferSchema<typeof StudioBridgeSnapshotResponse>
export type BridgeFoundingSnapshot = InferSchema<typeof StudioFoundingSnapshot>
export type BridgeFoundingArrivalSnapshot = InferSchema<typeof StudioFoundingArrivalSnapshot>
export type BridgeTreasurySnapshot = InferSchema<typeof StudioTreasurySnapshot>
export type BridgeAcceptedCommandResponse = InferSchema<typeof StudioBridgeAcceptedCommandResponse>
export type BridgeRejectedResponse = InferSchema<typeof StudioBridgeRejectedResponse>
export type BridgeAcceptedSaveResponse = InferSchema<typeof StudioBridgeSaveResponse>
export type BridgeHealthResponse = InferSchema<typeof StudioBridgeHealthResponse>
export type BridgeSessionResponse = InferSchema<typeof StudioBridgeSessionResponse>
export type BridgeContractResponse = InferSchema<typeof StudioBridgeContractResponse>
export type BridgeDevelopmentSnapshot = InferSchema<typeof StudioDevelopmentSnapshot>
export type BridgeCastingSnapshot = InferSchema<typeof StudioCastingSnapshot>
export type BridgeCastingCandidateSnapshot = InferSchema<typeof StudioCastingCandidateSnapshot>
export type BridgeCastingProjectSnapshot = InferSchema<typeof StudioCastingProjectSnapshot>
export type BridgeCastingBlockerSnapshot = InferSchema<typeof StudioCastingBlockerSnapshot>
export type BridgeCastingExpiryNoticeSnapshot = InferSchema<typeof StudioCastingExpiryNoticeSnapshot>
export type BridgeCommissionDraftPayload = InferSchema<typeof StudioCommissionDraftPayload>
export type BridgeCommissionQuoteSnapshot = InferSchema<typeof StudioCommissionQuoteSnapshot>
export type BridgeCastingDraftPayload = InferSchema<typeof StudioCastingDraftPayload>
export type BridgeCastingChemistryRow = InferSchema<typeof StudioCastingChemistryRow>
export type BridgeCastingQuoteSnapshot = InferSchema<typeof StudioCastingQuoteSnapshot>
export type BridgeContractOfferSnapshot = InferSchema<typeof StudioContractOfferSnapshot>
export type BridgeHiringCandidateSnapshot = InferSchema<typeof StudioHiringCandidateSnapshot>
export type BridgeQuoteCommissionRequest = InferSchema<typeof StudioQuoteCommissionRequest>
export type BridgeQuoteCastingRequest = InferSchema<typeof StudioQuoteCastingRequest>
export type BridgePlacementDraftPayload = InferSchema<typeof StudioPlacementDraftPayload>
export type BridgeQuotePlacementRequest = InferSchema<typeof StudioQuotePlacementRequest>
export type BridgeSetCommissionDraftPayload = InferSchema<typeof StudioSetCommissionDraftPayload>
export type BridgeQuoteSetCommissionRequest = InferSchema<typeof StudioQuoteSetCommissionRequest>
export type BridgeSetCommissionQuoteSnapshot = InferSchema<typeof StudioSetCommissionQuoteSnapshot>
export type BridgeContractDraftPayload = InferSchema<typeof StudioContractDraftPayload>
export type BridgeQuoteContractRequest = InferSchema<typeof StudioQuoteContractRequest>
export type BridgeContractQuoteSnapshot = InferSchema<typeof StudioContractQuoteSnapshot>
export type BridgeContractRefusalKind = (typeof CONTRACT_REFUSAL_KINDS)[number]
export type BridgeMarketProposalDraftPayload = InferSchema<typeof StudioMarketProposalDraftPayload>
export type BridgeQuoteMarketProposalRequest = InferSchema<typeof StudioQuoteMarketProposalRequest>
export type BridgeMarketProposalQuoteSnapshot = InferSchema<typeof StudioMarketProposalQuoteSnapshot>
export type BridgeMarketProposalRefusalKind = (typeof MARKET_PROPOSAL_REFUSAL_KINDS)[number]
export type BridgePromiseWaiverSubstituteDraftPayload = InferSchema<typeof StudioPromiseWaiverSubstituteDraftPayload>
export type BridgePromiseWaiverDraftPayload = InferSchema<typeof StudioPromiseWaiverDraftPayload>
export type BridgeQuoteWaivePromiseRequest = InferSchema<typeof StudioQuoteWaivePromiseRequest>
export type BridgePromiseWaiverQuoteSnapshot = InferSchema<typeof StudioPromiseWaiverQuoteSnapshot>
export type BridgeMarketPromiseSnapshot = InferSchema<typeof StudioMarketPromiseSnapshot>
export type BridgeMarketPromiseHistoryRow = InferSchema<typeof StudioMarketPromiseHistoryRow>
export type BridgeMarketPromiseQuoteSnapshot = InferSchema<typeof StudioMarketPromiseQuoteSnapshot>
export type BridgeMarketProposalPromiseDraftPayload = InferSchema<typeof StudioMarketProposalPromiseDraftPayload>
export type BridgeMarketProposalSnapshot = InferSchema<typeof StudioMarketProposalSnapshot>
export type BridgeMarketAttentionRowSnapshot = InferSchema<typeof StudioMarketAttentionRowSnapshot>
export type BridgeMarketAttentionCause = (typeof MARKET_ATTENTION_CAUSES)[number]
export type BridgeMarketCaseSnapshot = InferSchema<typeof StudioMarketCaseSnapshot>
export type BridgeMarketCaseRow = InferSchema<typeof StudioMarketCaseRow>
export type BridgeMarketFreeAgentRow = InferSchema<typeof StudioMarketFreeAgentRow>
export type BridgeMarketCases = InferSchema<typeof StudioMarketCases>
export type BridgeMarketEmployerRow = InferSchema<typeof StudioMarketEmployerRow>
export type BridgeMarketCaseDetail = InferSchema<typeof StudioMarketCaseDetail>
export type BridgeMarketPage = InferSchema<typeof StudioMarketPage>
export type BridgeWorldCaseRef = InferSchema<typeof StudioWorldCaseRef>
export type BridgeWorldRouteSnapshot = InferSchema<typeof StudioWorldRouteSnapshot>
export type BridgeTrustDriverRow = InferSchema<typeof StudioTrustDriverRow>
export type BridgeTrustBlock = InferSchema<typeof StudioTrustBlock>
export type BridgeRelationshipRow = InferSchema<typeof StudioRelationshipRow>
export type BridgeRelationshipBlock = InferSchema<typeof StudioRelationshipBlock>
export type BridgePersonRenewalTermSnapshot = InferSchema<typeof StudioPersonRenewalTermSnapshot>
export type BridgePersonContractActionsSnapshot = InferSchema<typeof StudioPersonContractActionsSnapshot>
export type BridgePlacementQuoteSnapshot = InferSchema<typeof StudioPlacementQuoteSnapshot>
export type BridgeQuoteRequest = InferSchema<typeof StudioBridgeQuoteRequest>
export type BridgeQuoteResponse = InferSchema<typeof StudioBridgeQuoteResponse>
export type BridgeHistorySnapshot = InferSchema<typeof StudioHistorySnapshot>

export const AVAILABLE_INTENT_KEYS = Object.keys(
  StudioBridgeIntentOption.properties as Record<string, unknown>,
) as Array<keyof BridgeAvailableIntent>

export type CampaignRequest=InferSchema<typeof StudioCampaignRequest>
export type CampaignSummary=InferSchema<typeof StudioCampaignSummary>
export type CampaignLibraryResponse=InferSchema<typeof StudioCampaignLibraryResponse>
export type CampaignAcceptedResponse=InferSchema<typeof StudioCampaignAcceptedResponse>
