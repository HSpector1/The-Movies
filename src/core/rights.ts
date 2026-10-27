import { carriedConceptForProduction, type CarriedProductionAuthority } from './continuedScripts.js'
import type { RivalProjectCosts } from './hollywoodTypes.js'
import type { FacilityCapability, ProductionPhase, Production, ProductionWorkflow, Standing, ReleaseCommitment, ScriptProject, ScriptAssessment, ScriptReservation, StudioFacility, PlacedFacility, StudioOperations, ScriptDevelopment } from './types.js'
import type { TechnologyId } from './technologyTypes.js'
import type { StandingContext, ReleaseBenchmarks } from './standing.js'
// ── P16A: story properties, four separate rights, title history and the rights root ──
//
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/):
//   1367-stage/p16-prep/P16-RIGHTS-ESTATE-CONTRACT.md §3 (four rights, exact subjects, title);
//   1370-ad-copy-only-unblock-and-p16a-preparation/p16a-r3/P16A-CONTRACT-AND-RED.md (identity,
//   chronology, legacy resolver, title events, read model); 1362-O §5.3/§5.9; 1367-O (branch
//   rights stay with the parent until explicit promotion).
//
// P16 is the sole title/licence writer. This module owns:
//   * the identity grammar `story-property:<conceptId>` (prefix + the COMPLETE founding conceptId;
//     never normalized, truncated or derived from a display title);
//   * the pure legacy-title resolver: virtual R1/R2 genesis records built from authentic facts on
//     every read, even while the migrated root is empty (manifest rows, IndustryFilm results and
//     announcement receipts, released FilmResults, release-frozen history titles, ledger greenlight
//     rows). A source with no authentic title returns `title: null`, never a fabricated one;
//   * the event-derived current holder of each R1 property and R2 film, the default R3/R4
//     authority, and the parent-bound branch rule;
//   * atomic mint hooks (accepted greenlight → property + R1 genesis; actual release → film title +
//     R2 genesis) and the exact materialization of a virtual record at its first lawful write;
//   * the Save46 rights-root validator.
//
// Pure `(state) => state`/`(state) => read`: no RNG, Date, I/O or mutation of inputs. Creator
// identity never changes when the current holder does. Valuation never creates cash and lives in
// propertyValuation.ts; executable sales/licences/diligence/estates live in their own modules.

import { QUOTE_AGE_POLICIES, quoteAgeRefusal, quoteAgeVersionRefusal, type QuoteAgePolicyVersion } from './quoteAge.js'
import { HOLLYWOOD_STARTING_MANIFEST } from './hollywoodStartingData.js'
import type { HollywoodState } from './hollywoodTypes.js'
import type { GameState } from './types.js'

export const RIGHTS_ROOT_VERSION = 2 as const
export const STORY_PROPERTY_ID_PREFIX = 'story-property:'
/** A holder id of the form `estate:<studioId>`: archived, nontradeable title held by a closed studio's estate. */
export const ESTATE_HOLDER_PREFIX = 'estate:'

// ── types ─────────────────────────────────────────────────────────────────────

export type RightsDate = { kind: 'beforeCampaign'; year: number } | { kind: 'campaign'; week: number }
export type RightSubject = { right: 'R1'; propertyId: string } | { right: 'R2'; filmId: string }
// Absorption transfers have their own joined terminal/employment/cash producer, never a titleSale surrogate.
export type TitleCause = 'genesis' | 'sale' | 'estateSale' | 'archive' | 'absorption' | 'absorbedWorkRelease'
export type LegacySourceKind = 'authored-start' | 'simulated-rival' | 'player'
export type TitleSource =
  | { kind: 'greenlight'; productionId: string }
  | { kind: 'release'; productionId: string }
  | { kind: 'legacy'; sourceKind: LegacySourceKind; ref: string }
  | { kind: 'transaction'; transactionId: string }
  | { kind: 'estate'; estateId: string }
  | { kind: 'absorption'; absorptionId: string }
  | { kind: 'absorbedWorkRelease'; absorptionId: string; productionId: string }
  /** A hand-recorded event for pure fold fixtures. NEVER valid in a save: the validator refuses it. */
  | { kind: 'manual'; ref: string }

export type TitleEvent = {
  id: string
  subject: RightSubject
  /** 1-based per subject; genesis is 1. */
  ordinal: number
  date: RightsDate
  /** The rights allocator value at the write: fixes precedence inside one week. */
  boundaryOrder: number
  priorHolder: string | null
  newHolder: string
  cause: TitleCause
  source: TitleSource
}

export type PropertyTitleSource = 'greenlight' | 'manifest' | 'release' | 'concept' | 'history' | 'unavailable'
export type StoryProperty = {
  propertyId: string
  conceptId: string
  creatorStudioId: string
  createdAt: RightsDate
  title: string | null
  titleSource: PropertyTitleSource
  origin: 'original' | 'promotion'
  parentPropertyId: string | null
  /** Append-only, distinct production/film ids. */
  workLinks: string[]
}
export type FilmTitle = {
  filmId: string
  conceptId: string
  propertyId: string
  creatorStudioId: string
  releasedAt: RightsDate
  title: string | null
  titleSource: 'release' | 'manifest' | 'history' | 'unavailable'
}

export type LicenceScope = { use: 'sequel' | 'remake' | 'spinoff' } | { use: 'television' | 'merchandise' }
/** The enumerated continuation uses an R3 licence may name (contract §3). */
export const R3_USES = ['sequel', 'remake', 'spinoff'] as const
/** The enumerated cross-media uses an R4 licence names (contract §3). */
export const R4_USES = ['television', 'merchandise'] as const
/**
 * CONTRACT GAP (P16B, contract §3 / P16A r3): "no executable grant before the P18 consumer exists". The R4 grant law is
 * complete (licence.ts `licenceGrantRefusal`); this ONE flag keeps it closed — the producer refuses `r4ConsumerNotLive`
 * and the validator refuses any R4 licence in a save — until P18 lands its consumer and sets it true.
 */
export const R4_CONSUMER_LIVE = false
export type Licence = {
  id: string
  right: 'R3' | 'R4'
  subject: RightSubject
  scope: LicenceScope
  exclusive: boolean
  grantorId: string
  granteeId: string
  /** Half-open [startWeek, endWeekExclusive); reversion to the grantor at expiry. */
  startWeek: number
  endWeekExclusive: number
  grantedWeek: number
  transactionId: string
}

export type RightsInstrument =
  | { kind: 'title'; subject: RightSubject }
  | { kind: 'licence'; right: 'R3' | 'R4'; subject: RightSubject; scope: LicenceScope; exclusive: boolean; startWeek: number; endWeekExclusive: number }
export type RightsOfferStatus = 'open' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'
export type RightsOffer = {
  /** Absence denotes retained historical v0; new producers stamp v1 without rewriting old rows. */
  quoteAgePolicyVersion?: QuoteAgePolicyVersion
  disclosureId?: string | null
  id: string
  week: number
  offerorId: string
  counterpartyId: string
  /** `buy`: the offeror buys from the counterparty; `sell`: the offeror sells to the counterparty. */
  direction: 'buy' | 'sell'
  instrument: RightsInstrument
  price: number
  /** Valid while week < expiresWeek. */
  expiresWeek: number
  status: RightsOfferStatus
  resolvedWeek: number | null
  transactionId: string | null
  refusal: string | null
}

export type RightsTransactionKind = 'titleSale' | 'licenceGrant' | 'estateSale' | 'dueDiligence'
export const RIGHTS_TRANSACTION_KINDS: readonly RightsTransactionKind[] = ['titleSale', 'licenceGrant', 'estateSale', 'dueDiligence']
export type RightsTransaction = {
  id: string
  week: number
  kind: RightsTransactionKind
  payerId: string
  /** The studio credited; null for a fee sink (dueDiligence) or an estate (estateSale). */
  payeeId: string | null
  estateId: string | null
  amount: number
  subject: RightSubject | null
  licenceId: string | null
  offerId: string | null
  lotId: string | null
  bidId: string | null
  titleEventIds: string[]
}

export type DiligenceScopeItem = 'rights' | 'employment' | 'liabilities'
export type DiligenceTarget = { kind: 'studio'; studioId: string } | { kind: 'estateLot'; estateId: string; lotId: string }
export type DisclosureBody = {
  rights: { subject: RightSubject; value: number | null; encumbrances: string[] }[]
  employment: { contractId: string; talentId: string; annualSalary: number; startWeek: number; endWeekExclusive: number; exitCost: number }[] | null
  /** r2: `cash` is the target's whole-dollar cash (floored), the figure an absorption quote transfers at par. */
  liabilities: { stage: string; hasOutstandingLoan: boolean; weeklyFixedCost: number; cash: number } | null
}
export type DiligenceRecord = {
  quoteAgePolicyVersion?: QuoteAgePolicyVersion
  id: string
  week: number
  recipientId: string
  target: DiligenceTarget
  scope: DiligenceScopeItem[]
  fee: number
  transactionId: string
  /** The record is stale from this week on; a binding offer then needs a fresh disclosure. */
  staleFromWeek: number
  body: DisclosureBody
}

/** `encumbrances` are the lot's licence references (`licence:<id>`): the live and future terms on its subjects it is sold subject to. */
export type EstateLot = { lotId: string; subjects: RightSubject[]; minimumBid: number; encumbrances: string[] }
export type EstateLotRecord = EstateLot & { status: 'open' | 'sold' | 'archived'; winningBidId: string | null; transactionId: string | null }
/** Why a held right is not offered in a lot: an encumbrance the sale law refuses (contract §3), or the producer's choice. */
export const ESTATE_PENDING_REASONS = ['activeRun', 'activeProduction', 'notOffered'] as const
export type EstatePendingReason = (typeof ESTATE_PENDING_REASONS)[number]
/** A held right outside every lot: frozen at closure, archived at D with the unsold lots (contract §4 "every subject gets one disposition"). */
export type EstatePending = { subject: RightSubject; reason: EstatePendingReason; status: 'pending' | 'archived' }
export type EstateBidStatus = 'sealed' | 'won' | 'lost' | 'disqualified'
export type EstateBid = { quoteAgePolicyVersion?: QuoteAgePolicyVersion; id: string; estateId: string; lotId: string; bidderId: string; amount: number; week: number; status: EstateBidStatus; disqualification: string | null }
/** Actual current closure versus a truthful predecessor observation; neither is a sale. */
export type EstateOrigin =
  | { kind: 'closure49'; closureId: string }
  | { kind: 'observed48'; observedAtWeek: number; closureId: string; closureSequence: number; archivalEventId: string | null; classification: 'observedCurrent' }
export type EstateRecord = {
  origin: EstateOrigin
  estateId: string
  closureId: string
  studioId: string
  closureWeek: number
  opensWeek: number
  closesWeek: number
  lots: EstateLotRecord[]
  bids: EstateBid[]
  proceeds: { transactionId: string; lotId: string; amount: number }[]
  closedWeek: number | null
  pending: EstatePending[]
  /** Opaque references into P15's claims context (contract §4 "claim references"): P15 owns class, priority and payment. */
  claimsContext: { priorityVersion: string; claimIds: string[] }
  cashReconciliation: { terminalCash: number; loanRemainder: number }
}

/** Current49 healthy terminal transaction; never a distress closure or an employment owner. */
export type AbsorptionStoppedScript = {
  scriptProjectId: string; reason: 'writersNotRetained'; sourceContractIds: string[]
  originalScript: ScriptProject; originalCosts: RivalProjectCosts
}
export type AbsorptionContinuedScript = {
  sourceScriptProjectId: string; sourceContractIds: string[]; buyerContractIds: string[]
  originalScript: ScriptProject; originalCosts: RivalProjectCosts
  reservationAtClose: ScriptReservation; project: ScriptProject
}
export type AbsorptionScriptDecision =
  | { id:string; projectId:string; kind:'greenlight'; week:number; production:Production; paidRows:import('./types.js').LedgerEntry[]; nativeCost?:RivalProjectCosts }
  | { id:string; projectId:string; kind:'cancelProduction'; week:number; production:Production }
  | { id:string; projectId:string; kind:'productionReleased'; week:number; productionId:string }
  | { id:string; projectId:string; kind:'accept'; week:number }
  | { id:string; projectId:string; kind:'rewrite'; week:number; reservation:ScriptReservation;
      nativeInput:{operations:StudioOperations;development:ScriptDevelopment;occupiedSlots:string[]};
      allocationAuthority:{projectIds:string[];workflowIds:string[];productions:Production[];occupiedSlots:string[];developmentContext:AbsorptionScriptCompletion['developmentContext'];estUplift:number} }
export type AbsorptionScriptCompletion = {
  id: string; projectId: string; week: number; inputWeek: number; estUplift: number
  developmentContext: { facilities: StudioFacility[]; placements: PlacedFacility[]; paidRows: { projectId: string; week: number; amount: number }[] }
  writerRewriting: { actual: number; perceived: number } | null; assessment: ScriptAssessment
}
type AbsorptionRecordBase = {
  id: string; week: number; buyerId: string; targetId: string; disclosureId: string
  quotedAtWeek: number; quoteAgePolicyVersion: QuoteAgePolicyVersion
  consideration: number; cashBeforeExits: number; exitCharges: number; postExitCash: number; outlay: number
  evaluatedBuyerWeek: number; evaluatedTargetWeek: number
  contracts: { sourceContractId: string; buyerContractId: string | null; talentId: string; exitCost: number }[]
  research: { projectId: string; verifiedWork: number; expenditure: number }[]
  facilities: string[]; titleEventIds: string[]
  runs: { productionId: string; beneficiaryFromWeek: number; startingWeekIndex: number; grossPaidBeforeClose: number; revenuePaidBeforeClose: number }[]
  runReceipts: { id: string; week: number; productionId: string; weekIndex: number; gross: number; revenue: number }[]
  continuedProductions: { productionId: string; scriptProjectId: string; originalProduction: Production; originalWorkflow: ProductionWorkflow; originalReleaseCommitment: ReleaseCommitment | null; buyerPostFacilityId: string | null }[]
  buyerWorkflows: ProductionWorkflow[]
  workCancellations: { id: string; productionId: string; week: number; remainingTicks: number }[]
  workSteps: { id: string; productionId: string; week: number; beforeRemaining: number; afterRemaining: number }[]
  workReleases: { productionId: string; week: number; titleEventId: string | null; standingBefore: Standing; standingAfter: Standing; standingContext: StandingContext; benchmarks: ReleaseBenchmarks }[]
  stoppedProductions: { productionId: string; scriptProjectId: string; remainingTicks: number; phase: ProductionPhase; reason: 'missingParticipants' | 'buyerOperationsNotManaged' | 'productionIdCollision' | `noFacility:${FacilityCapability}` | `noCapacity:${FacilityCapability}`; blockedCapability: FacilityCapability | null; missingParticipants: string[] }[]
  adoptions: { adoptionId: string; technologyId: TechnologyId; committedWeek: number; equipmentAssetId: string | null; equipmentCost: number; installationCost: number }[]
  physicalPlans: { planId: string; disposition: 'retainedCompleted' | 'stoppedPaid' | 'cancelledUnstarted'; committedCost: number }[]
  knowledge: { technologyId: TechnologyId; sourceProjectId: string; completedWeek: number; disposition: 'granted' | 'alreadyHeld' }[]
}
/** Existing current49 v1 records retain their exact shape and no in-flight scripts.
 * v2 explicitly observes actual stopped drafting; it never synthesizes v1 history. */
export type AbsorptionRecord = AbsorptionRecordBase & (
  | { producerVersion: 'absorption-clean/v1'; stoppedScripts?: never }
  | { producerVersion: 'absorption-scripts/v2'; stoppedScripts: AbsorptionStoppedScript[] }
  | { producerVersion: 'absorption-scripts/v3'; stoppedScripts: AbsorptionStoppedScript[]; continuedScripts: AbsorptionContinuedScript[]; scriptCompletions: AbsorptionScriptCompletion[] }
  | { producerVersion: 'absorption-scripts/v4'; stoppedScripts: AbsorptionStoppedScript[]; continuedScripts: AbsorptionContinuedScript[]; scriptCompletions: AbsorptionScriptCompletion[]; scriptDecisions: { id:string; projectId:string; kind:'accept'; week:number }[] }
  | { producerVersion: 'absorption-scripts/v5'; stoppedScripts: AbsorptionStoppedScript[]; continuedScripts: AbsorptionContinuedScript[]; scriptCompletions: AbsorptionScriptCompletion[]; scriptDecisions: AbsorptionScriptDecision[] }
  | { producerVersion: 'absorption-scripts/v6'; stoppedScripts: AbsorptionStoppedScript[]; continuedScripts: AbsorptionContinuedScript[]; scriptCompletions: AbsorptionScriptCompletion[]; scriptDecisions: AbsorptionScriptDecision[] }
  | { producerVersion: 'absorption-obligations/v7'; stoppedScripts: AbsorptionStoppedScript[]; continuedScripts: AbsorptionContinuedScript[]; scriptCompletions: AbsorptionScriptCompletion[]; scriptDecisions: AbsorptionScriptDecision[]; obligations: import('./absorbedObligations.js').AbsorptionObligations }
  | { producerVersion: 'absorption-rival-scripts/v8'; stoppedScripts: AbsorptionStoppedScript[]; continuedScripts: AbsorptionContinuedScript[]; scriptCompletions: AbsorptionScriptCompletion[]; scriptDecisions: AbsorptionScriptDecision[]; scriptShelving: { rejections:{projectId:string;count:number}[]; shelved:{projectId:string;week:number;retryWeek:number}[] } }
  | { producerVersion: 'absorption-rival-obligations/v9'; stoppedScripts: AbsorptionStoppedScript[]; continuedScripts: AbsorptionContinuedScript[]; scriptCompletions: AbsorptionScriptCompletion[]; scriptDecisions: AbsorptionScriptDecision[]; scriptShelving: { rejections:{projectId:string;count:number}[]; shelved:{projectId:string;week:number;retryWeek:number}[] }; obligations: import('./absorbedObligations.js').AbsorptionObligations }
)

type BoundarySourceKind = 'player-ledger' | 'player-active' | 'player-release' | 'rival-announcement' | 'rival-active' | 'rival-release'

export type RightsRoot = {
  version: typeof RIGHTS_ROOT_VERSION
  recordedFromWeek: number
  /** Observational cutover facts only; accepted hooks never extend this frontier. */
  legacyBoundary: { propertyIds: string[]; filmIds: string[]; propertyAnchors: { propertyId: string; conceptId: string; creatorStudioId: string; productionIds: string[]; sources: { productionId: string; kind: BoundarySourceKind }[] }[] }
  properties: StoryProperty[]
  filmTitles: FilmTitle[]
  titleEvents: TitleEvent[]
  licences: Licence[]
  offers: RightsOffer[]
  transactions: RightsTransaction[]
  diligence: DiligenceRecord[]
  estates: EstateRecord[]
  absorptions: AbsorptionRecord[]
  /** The one P16 allocator: ids and boundary orders; `next++` at every write. */
  nextId: number
}

export const RIGHTS_ROOT_KEYS = ['version', 'recordedFromWeek', 'legacyBoundary', 'properties', 'filmTitles', 'titleEvents', 'licences', 'offers', 'transactions',
  'diligence', 'estates', 'absorptions', 'nextId'] as const

export function initialRightsRoot(week: number): RightsRoot {
  return { version: RIGHTS_ROOT_VERSION, recordedFromWeek: week, legacyBoundary: { propertyIds: [], filmIds: [], propertyAnchors: [] }, properties: [], filmTitles: [], titleEvents: [], licences: [], offers: [],
    transactions: [], diligence: [], estates: [], absorptions: [], nextId: 1 }
}

/** Captures genuine pre-existing boundary subjects on predecessor migration or industry opening.
 * No title/event/transaction is minted, and later action hooks cannot add frontier IDs. */
export function cutoverRightsRoot(state: GameState): RightsRoot {
  const root = initialRightsRoot(state.market.tick), facts = authenticTitles(state)
  const atBoundary = (date: RightsDate) => date.kind === 'campaign' && date.week === root.recordedFromWeek
  root.legacyBoundary.propertyIds = [...facts.properties].filter(([, p]) => atBoundary(p.createdAt)).map(([id]) => id).sort()
  root.legacyBoundary.propertyAnchors = root.legacyBoundary.propertyIds.map(id => {
    const fact = facts.properties.get(id)!
    const productionIds = [...fact.workLinks].sort(), h = state.hollywood!
    const sources = productionIds.map(productionId => {
      let kind: BoundarySourceKind
      if (fact.creatorStudioId === h.playerStudioId) {
        kind = state.ledger.some(row => row.kind === 'production' && row.productionId === productionId && row.week === root.recordedFromWeek) ? 'player-ledger'
          : state.studio.activeProductions.some(p => p.id === productionId && p.startTick === root.recordedFromWeek) ? 'player-active' : 'player-release'
      } else {
        const business = h.businesses.find(b => b.studioId === fact.creatorStudioId)
        kind = business?.projects.some(p => p.productionId === productionId && p.announcedWeek === root.recordedFromWeek) ? 'rival-announcement'
          : business?.productions.some(p => p.id === productionId && p.startTick === root.recordedFromWeek) ? 'rival-active' : 'rival-release'
      }
      return { productionId, kind }
    })
    return { propertyId: id, conceptId: fact.conceptId, creatorStudioId: fact.creatorStudioId, productionIds, sources }
  })
  root.legacyBoundary.filmIds = [...facts.filmTitles].filter(([, t]) => atBoundary(t.releasedAt)).map(([id]) => id).sort()
  return root
}

/** The pure date helper keeps adopted same-boundary semantics; this subject-aware predicate
 * additionally distinguishes new hooked facts from the immutable observed cutover frontier. */
function isLegacySubject(date: RightsDate, root: RightsRoot, kind: 'propertyIds' | 'filmIds', id: string): boolean {
  return date.kind === 'beforeCampaign' || date.week < root.recordedFromWeek
    || root.legacyBoundary[kind].includes(id)
}

// ── identity ──────────────────────────────────────────────────────────────────

export function storyPropertyId(conceptId: string): string {
  if (typeof conceptId !== 'string' || conceptId.length === 0) throw new Error('rights: a story property needs its complete founding conceptId')
  return `${STORY_PROPERTY_ID_PREFIX}${conceptId}`
}
export function parseStoryPropertyId(propertyId: string): string | null {
  if (typeof propertyId !== 'string' || !propertyId.startsWith(STORY_PROPERTY_ID_PREFIX)) return null
  const conceptId = propertyId.slice(STORY_PROPERTY_ID_PREFIX.length)
  return conceptId.length === 0 ? null : conceptId
}
export const subjectKey = (s: RightSubject): string => (s.right === 'R1' ? `R1:${s.propertyId}` : `R2:${s.filmId}`)
export const sameSubject = (a: RightSubject, b: RightSubject): boolean => subjectKey(a) === subjectKey(b)
export const isEstateHolder = (holderId: string): boolean => holderId.startsWith(ESTATE_HOLDER_PREFIX)
export const estateHolderId = (studioId: string): string => `${ESTATE_HOLDER_PREFIX}${studioId}`

/** The rights allocator: one id and boundary order per write. */
export function allocateRightsId(root: RightsRoot, prefix: string): { root: RightsRoot; id: string; order: number } {
  const order = root.nextId
  return { root: { ...root, nextId: order + 1 }, id: `${prefix}-${order}`, order }
}

// ── dates ─────────────────────────────────────────────────────────────────────

/** Every valid pre-campaign date orders before every campaign week; years and weeks order numerically. */
export function compareRightsDate(a: RightsDate, b: RightsDate): number {
  if (a.kind !== b.kind) return a.kind === 'beforeCampaign' ? -1 : 1
  return a.kind === 'beforeCampaign' ? a.year - (b as { year: number }).year : a.week - (b as { week: number }).week
}
export const dateThrough = (d: RightsDate, asOfWeek: number): boolean => d.kind === 'beforeCampaign' || d.week <= asOfWeek
const sameDate = (a: RightsDate, b: RightsDate): boolean => compareRightsDate(a, b) === 0
function validRightsDate(d: unknown): d is RightsDate {
  if (d === null || typeof d !== 'object') return false
  const r = d as Record<string, unknown>
  if (r.kind === 'beforeCampaign') return Object.keys(r).length === 2 && Number.isSafeInteger(r.year)
  if (r.kind === 'campaign') return Object.keys(r).length === 2 && Number.isSafeInteger(r.week) && (r.week as number) >= 0
  return false
}
function compareEvents(a: TitleEvent, b: TitleEvent): number {
  return compareRightsDate(a.date, b.date) || a.boundaryOrder - b.boundaryOrder || a.ordinal - b.ordinal
}

// ── the legacy-title resolver ─────────────────────────────────────────────────

export type ResolvedProperty = StoryProperty & { virtual: boolean; source: TitleSource }
export type ResolvedFilmTitle = FilmTitle & { virtual: boolean; source: TitleSource }
export type UnavailableSubject = { subject: RightSubject; reason: 'ambiguousProvenance' | 'missingGenesis' }
export type TitleResolution = {
  properties: ResolvedProperty[]
  filmTitles: ResolvedFilmTitle[]
  /** Every title event, persisted or virtual genesis, in (date, boundaryOrder, ordinal) order. */
  events: TitleEvent[]
  unavailable: UnavailableSubject[]
}
const EMPTY_RESOLUTION: TitleResolution = { properties: [], filmTitles: [], events: [], unavailable: [] }

/** r2: the facts a persisted property's own evidence is read from (review F3/F26, F43/F15). */
export type TitleEvidence = {
  /** Each player production's greenlight week: its first ledger 'production' row, the one fact a cancellation leaves behind. */
  greenlightWeeks: ReadonlyMap<string, number>
  /** Every concept's present title (player and rival). */
  conceptTitles: ReadonlyMap<string, string>
  /** Each original screenplay's last lawful rename week (`renameScreenplay`); absent when never renamed. */
  renamedWeeks: ReadonlyMap<string, number>
}
type AuthenticRecords = { properties: Map<string, ResolvedProperty>; filmTitles: Map<string, ResolvedFilmTitle>; evidence: TitleEvidence }

/** A record dated before the rights root began (or before the campaign) is LEGACY: virtual until its first lawful write.
 * A record dated in the P16 era must have been persisted by its mint hook; it is never silently derived. */
/** A fact dated at or before `recordedFromWeek` may predate the recording (the tick that produced the boundary week ran
 * under the predecessor era, or before the industry opened in that week), so it is derived unless a hook recorded it;
 * completeness is enforced strictly after the boundary week. A record dated in the boundary week is kept and wins over
 * the derived view (resolveTitles merges persisted records first). */
export function isLegacyDate(date: RightsDate, recordedFromWeek: number): boolean {
  return date.kind === 'beforeCampaign' || date.week <= recordedFromWeek
}

function legacy(sourceKind: LegacySourceKind, ref: string): TitleSource {
  return { kind: 'legacy', sourceKind, ref }
}

/** Every authentic R1/R2 record the roots attest (manifest, film results, announcements, releases, greenlight rows); no
 * FilmConcept, campaign greenlight or sale is invented. `resolveTitles` decides which of these are virtual. */
export function authenticTitles(state: GameState): AuthenticRecords {
  const properties = new Map<string, ResolvedProperty>()
  const filmTitles = new Map<string, ResolvedFilmTitle>()
  const greenlightWeeks = new Map<string, number>()
  for (const entry of state.ledger) if (entry.kind === 'production' && entry.productionId !== undefined && !greenlightWeeks.has(entry.productionId)) greenlightWeeks.set(entry.productionId, entry.week)
  const conceptTitles = new Map<string, string>([...(state.hollywood?.concepts ?? []), ...state.concepts].map((c) => [c.id, c.title]))
  const renamedWeeks = new Map<string, number>()
  for (const b of state.originalScreenplays?.blueprints ?? []) if (b.renamedWeek !== null) renamedWeeks.set(b.conceptId, b.renamedWeek)
  const evidence: TitleEvidence = { greenlightWeeks, conceptTitles, renamedWeeks }
  const h = state.hollywood
  if (!h) return { properties, filmTitles, evidence }
  // r2 (F11): work a persisted property links under a DIFFERENT concept is a continuation of that property
  // (`linkContinuationAtGreenlight`): it founds no property of its own, and its film title names the parent.
  const linkedTo = new Map<string, string>()
  for (const p of state.rights?.properties ?? []) for (const link of p.workLinks) linkedTo.set(link, p.propertyId)
  const continuationParent = (workId: string, conceptId: string): string | null => {
    const parent = linkedTo.get(workId)
    return parent !== undefined && parent !== storyPropertyId(conceptId) ? parent : null
  }
  const addProperty = (p: ResolvedProperty, workLink: string): void => {
    const existing = properties.get(p.propertyId)
    if (existing === undefined) { properties.set(p.propertyId, { ...p, workLinks: [workLink] }); return }
    if (compareRightsDate(p.createdAt, existing.createdAt) < 0) {
      properties.set(p.propertyId, { ...existing, createdAt: p.createdAt, title: existing.title ?? p.title, titleSource: existing.title === null ? p.titleSource : existing.titleSource, source: p.source })
    } else if (existing.title === null && p.title !== null) {
      properties.set(p.propertyId, { ...existing, title: p.title, titleSource: p.titleSource })
    }
    if (!properties.get(p.propertyId)!.workLinks.includes(workLink)) properties.get(p.propertyId)!.workLinks.push(workLink)
  }
  // A cancelled boundary production disappears from active work but keeps its paid ledger row.
  // Preserve observed identity/date from cutover metadata; this is virtual, never a title mint.
  for (const anchor of state.rights?.legacyBoundary.propertyAnchors ?? []) {
    const first = anchor.productionIds[0]!
    addProperty({ propertyId: anchor.propertyId, conceptId: anchor.conceptId, creatorStudioId: anchor.creatorStudioId,
      createdAt: { kind: 'campaign', week: state.rights.recordedFromWeek }, title: null, titleSource: 'unavailable',
      origin: 'original', parentPropertyId: null, workLinks: [], virtual: true,
      source: legacy(anchor.creatorStudioId === h.playerStudioId ? 'player' : 'simulated-rival', `greenlight:${first}`) }, first)
    for (const work of anchor.productionIds.slice(1)) if (!properties.get(anchor.propertyId)!.workLinks.includes(work)) properties.get(anchor.propertyId)!.workLinks.push(work)
  }
  const identities = new Map(h.identities.map((i) => [i.studioId, i]))
  const concepts = new Map(h.concepts.map((c) => [c.id, c.title]))
  const announced = new Map<string, number>()
  for (const b of h.businesses) for (const p of b.projects) if (p.productionId !== null && p.announcedWeek !== null) announced.set(p.productionId, p.announcedWeek)
  for (const film of h.films) {
    const propertyId = storyPropertyId(film.conceptId)
    if (film.provenance === 'authored-start/v1') {
      const identity = identities.get(film.studioId)
      const row = identity === undefined ? undefined : HOLLYWOOD_STARTING_MANIFEST.studios[identity.row - 1]
      const index = row?.films?.findIndex((f) => f[0] === film.title) ?? -1
      const ref = index >= 0 ? `manifest:${identity!.row}:${index}` : `manifest:unmatched:${film.filmId}`
      filmTitles.set(film.filmId, { filmId: film.filmId, conceptId: film.conceptId, propertyId, creatorStudioId: film.studioId, releasedAt: film.released,
        title: film.title, titleSource: 'manifest', virtual: true, source: legacy('authored-start', ref) })
      addProperty({ propertyId, conceptId: film.conceptId, creatorStudioId: film.studioId, createdAt: film.released, title: film.title, titleSource: 'manifest',
        origin: 'original', parentPropertyId: null, workLinks: [], virtual: true, source: legacy('authored-start', ref) }, film.filmId)
    } else {
      const releasedAt: RightsDate = { kind: 'campaign', week: film.result.releaseTick }
      const created: RightsDate = { kind: 'campaign', week: announced.get(film.filmId) ?? film.result.releaseTick }
      const parent = continuationParent(film.filmId, film.conceptId)
      filmTitles.set(film.filmId, { filmId: film.filmId, conceptId: film.conceptId, propertyId: parent ?? propertyId, creatorStudioId: film.studioId, releasedAt,
        title: film.title, titleSource: 'release', virtual: true, source: legacy('simulated-rival', `film:${film.filmId}`) })
      if (parent === null) addProperty({ propertyId, conceptId: film.conceptId, creatorStudioId: film.studioId, createdAt: created, title: film.title, titleSource: 'release',
        origin: 'original', parentPropertyId: null, workLinks: [], virtual: true, source: legacy('simulated-rival', announced.has(film.filmId) ? `announcement:${film.filmId}` : `film:${film.filmId}`) }, film.filmId)
    }
  }
  for (const b of h.businesses) for (const p of b.productions) {
    if (continuationParent(p.id, p.conceptId) !== null) continue
    const title = concepts.get(p.conceptId) ?? null
    addProperty({ propertyId: storyPropertyId(p.conceptId), conceptId: p.conceptId, creatorStudioId: b.studioId,
      createdAt: { kind: 'campaign', week: announced.get(p.id) ?? p.startTick }, title, titleSource: title === null ? 'unavailable' : 'concept',
      origin: 'original', parentPropertyId: null, workLinks: [], virtual: true, source: legacy('simulated-rival', `production:${p.id}`) }, p.id)
  }
  const historyTitles = new Map<string, string>()
  for (const row of state.studioHistory?.rows ?? []) if (row.kind === 'filmReleased' && !historyTitles.has(row.productionId)) historyTitles.set(row.productionId, row.title)
  const player = h.playerStudioId
  for (const film of state.studio.releasedFilms) {
    const parent = continuationParent(film.productionId, film.conceptId)
    const propertyId = parent ?? storyPropertyId(film.conceptId)
    const title = historyTitles.get(film.productionId) ?? null
    filmTitles.set(film.productionId, { filmId: film.productionId, conceptId: film.conceptId, propertyId, creatorStudioId: player,
      releasedAt: { kind: 'campaign', week: film.releaseTick }, title, titleSource: title === null ? 'unavailable' : 'history', virtual: true,
      source: legacy('player', `film:${film.productionId}`) })
    if (parent === null) addProperty({ propertyId, conceptId: film.conceptId, creatorStudioId: player, createdAt: { kind: 'campaign', week: greenlightWeeks.get(film.productionId) ?? film.releaseTick },
      title, titleSource: title === null ? 'unavailable' : 'history', origin: 'original', parentPropertyId: null, workLinks: [], virtual: true,
      source: legacy('player', greenlightWeeks.has(film.productionId) ? `greenlight:${film.productionId}` : `film:${film.productionId}`) }, film.productionId)
  }
  for (const p of state.studio.activeProductions) {
    if (continuationParent(p.id, p.conceptId) !== null) continue
    addProperty({ propertyId: storyPropertyId(p.conceptId), conceptId: p.conceptId, creatorStudioId: player,
      createdAt: { kind: 'campaign', week: greenlightWeeks.get(p.id) ?? p.startTick }, title: null, titleSource: 'unavailable',
      origin: 'original', parentPropertyId: null, workLinks: [], virtual: true, source: legacy('player', `production:${p.id}`) }, p.id)
  }
  for (const p of properties.values()) p.workLinks.sort()
  return { properties, filmTitles, evidence }
}

function virtualGenesis(subject: RightSubject, date: RightsDate, creator: string, source: TitleSource): TitleEvent {
  return { id: `virtual:${subjectKey(subject)}`, subject, ordinal: 1, date, boundaryOrder: 0, priorHolder: null, newHolder: creator, cause: 'genesis', source }
}

/** The greenlight week the player's ledger attests for the production a property's genesis names (its own greenlight, or a
 * legacy `greenlight:`/`production:` reference); null when the genesis names none the ledger records. */
function attestedGreenlightWeek(genesis: TitleEvent | undefined, evidence: TitleEvidence): number | null {
  if (genesis === undefined) return null
  const ref = genesis.source.kind === 'greenlight' ? genesis.source.productionId
    : genesis.source.kind === 'legacy' && /^(greenlight|production):/.test(genesis.source.ref) ? genesis.source.ref.slice(genesis.source.ref.indexOf(':') + 1) : null
  return ref === null ? null : evidence.greenlightWeeks.get(ref) ?? null
}

/** A derived player date read from a fallback (start or release week, no greenlight row): it may only move LATER. */
const fallbackDate = (v: ResolvedProperty): boolean => v.source.kind === 'legacy' && v.source.sourceKind === 'player' && !v.source.ref.startsWith('greenlight:')

/**
 * Why a persisted property contradicts its evidence, or null. r2 (review F3/F26, F43/F15):
 *   * creator: the derived creator, exactly;
 *   * date: the greenlight week the ledger attests for its genesis production, exactly (a cancelled first greenlight keeps
 *     its ledger row, so the earlier week stays provable); else the derived date exactly, except a player date derived from
 *     a fallback, which may only be later; a P16 greenlight genesis is always a campaign date;
 *   * title: a P16 greenlight genesis holds its GREENLIGHT snapshot (P16A r3: later renames "never rewrite that snapshot"),
 *     so it must equal the concept's present title unless a lawful `renameScreenplay` ran at or after the greenlight week;
 *     a legacy record keeps the derived title when both are known.
 */
function propertyContradiction(persisted: StoryProperty, virtual: ResolvedProperty | undefined, genesis: TitleEvent | undefined, evidence: TitleEvidence): string | null {
  if (virtual !== undefined && persisted.creatorStudioId !== virtual.creatorStudioId) return `creator ${virtual.creatorStudioId}`
  const attested = attestedGreenlightWeek(genesis, evidence)
  const campaignWeek = persisted.createdAt.kind === 'campaign' ? persisted.createdAt.week : null
  if (attested !== null) {
    if (campaignWeek !== attested) return `greenlight week ${attested}, date ${JSON.stringify(persisted.createdAt)}`
  } else if (genesis?.source.kind === 'greenlight' && campaignWeek === null) {
    return `a campaign greenlight dated ${JSON.stringify(persisted.createdAt)}`
  } else if (virtual !== undefined && !(fallbackDate(virtual) ? campaignWeek !== null && compareRightsDate(persisted.createdAt, virtual.createdAt) <= 0 : sameDate(persisted.createdAt, virtual.createdAt))) {
    return `date ${JSON.stringify(virtual.createdAt)}`
  }
  if (genesis?.source.kind === 'greenlight') {
    const conceptTitle = evidence.conceptTitles.get(persisted.conceptId)
    const renamed = evidence.renamedWeeks.get(persisted.conceptId)
    if (conceptTitle !== undefined && (renamed === undefined || campaignWeek === null || renamed < campaignWeek) && persisted.title !== conceptTitle) {
      return `greenlight title ${JSON.stringify(persisted.title)} differs from its concept's title ${JSON.stringify(conceptTitle)} with no lawful rename since the greenlight`
    }
  } else if (virtual !== undefined && virtual.title !== null && persisted.title !== null && persisted.title !== virtual.title) {
    return `title ${JSON.stringify(virtual.title)}`
  }
  return null
}
function compatibleFilmTitle(persisted: FilmTitle, virtual: ResolvedFilmTitle): boolean {
  return persisted.creatorStudioId === virtual.creatorStudioId && sameDate(persisted.releasedAt, virtual.releasedAt)
    && (virtual.title === null || persisted.title === null || persisted.title === virtual.title) && persisted.conceptId === virtual.conceptId
}

/** Persisted and virtual title records merged by exact subject; incompatible pairs are reported, never guessed. */
export function resolveTitles(state: GameState): TitleResolution {
  if (!state.hollywood) return EMPTY_RESOLUTION
  const root = state.rights
  const authentic = authenticTitles(state)
  const virtual: AuthenticRecords = {
    properties: new Map([...authentic.properties].filter(([id, p]) => isLegacySubject(p.createdAt, root, 'propertyIds', id))),
    filmTitles: new Map([...authentic.filmTitles].filter(([id, t]) => isLegacySubject(t.releasedAt, root, 'filmIds', id))),
    evidence: authentic.evidence,
  }
  const unavailable: UnavailableSubject[] = []
  const eventsBySubject = new Map<string, TitleEvent[]>()
  for (const e of root.titleEvents) {
    const key = subjectKey(e.subject)
    eventsBySubject.set(key, [...(eventsBySubject.get(key) ?? []), e])
  }
  const properties = new Map<string, ResolvedProperty>()
  for (const p of root.properties) {
    const v = authentic.properties.get(p.propertyId)
    const subject: RightSubject = { right: 'R1', propertyId: p.propertyId }
    const genesis = (eventsBySubject.get(subjectKey(subject)) ?? []).find((e) => e.cause === 'genesis')
    if (propertyContradiction(p, v, genesis, authentic.evidence) !== null) { unavailable.push({ subject, reason: 'ambiguousProvenance' }); continue }
    if (genesis === undefined) { unavailable.push({ subject, reason: 'missingGenesis' }); continue }
    const source = genesis.source
    properties.set(p.propertyId, { ...p, workLinks: [...new Set([...p.workLinks, ...(v?.workLinks ?? [])])].sort(), virtual: false, source })
  }
  for (const [id, v] of virtual.properties) if (!properties.has(id) && !unavailable.some((u) => u.subject.right === 'R1' && u.subject.propertyId === id)) properties.set(id, v)
  const filmTitles = new Map<string, ResolvedFilmTitle>()
  for (const t of root.filmTitles) {
    const v = authentic.filmTitles.get(t.filmId)
    const subject: RightSubject = { right: 'R2', filmId: t.filmId }
    if (v !== undefined && !compatibleFilmTitle(t, v)) { unavailable.push({ subject, reason: 'ambiguousProvenance' }); continue }
    const genesis = (eventsBySubject.get(subjectKey(subject)) ?? []).find((e) => e.cause === 'genesis')
    if (genesis === undefined) { unavailable.push({ subject, reason: 'missingGenesis' }); continue }
    filmTitles.set(t.filmId, { ...t, virtual: false, source: genesis.source })
  }
  for (const [id, v] of virtual.filmTitles) if (!filmTitles.has(id) && !unavailable.some((u) => u.subject.right === 'R2' && u.subject.filmId === id)) filmTitles.set(id, v)
  const events: TitleEvent[] = []
  for (const p of [...properties.values()].sort((a, b) => (a.propertyId < b.propertyId ? -1 : 1))) {
    const subject: RightSubject = { right: 'R1', propertyId: p.propertyId }
    events.push(...(p.virtual ? [virtualGenesis(subject, p.createdAt, p.creatorStudioId, p.source)] : eventsBySubject.get(subjectKey(subject)) ?? []))
  }
  for (const t of [...filmTitles.values()].sort((a, b) => (a.filmId < b.filmId ? -1 : 1))) {
    const subject: RightSubject = { right: 'R2', filmId: t.filmId }
    events.push(...(t.virtual ? [virtualGenesis(subject, t.releasedAt, t.creatorStudioId, t.source)] : eventsBySubject.get(subjectKey(subject)) ?? []))
  }
  events.sort(compareEvents)
  return {
    properties: [...properties.values()].sort((a, b) => (a.propertyId < b.propertyId ? -1 : a.propertyId > b.propertyId ? 1 : 0)),
    filmTitles: [...filmTitles.values()].sort((a, b) => (a.filmId < b.filmId ? -1 : a.filmId > b.filmId ? 1 : 0)),
    events,
    unavailable,
  }
}

// ── holders ───────────────────────────────────────────────────────────────────

export type HolderReason = 'noIndustry' | 'invalidAsOfWeek' | 'futureWeek' | 'unknownSubject' | 'noTitleAtDate' | 'ambiguousProvenance' | 'missingGenesis'
  | 'unresolvedTerminalAuthority'
export type HolderResult =
  /** `estate.lotId` is null for a held right the handoff left pending (outside every lot). */
  | { kind: 'holder'; holderId: string; tradeable: boolean; archived: boolean; estate?: { estateId: string; lotId: string | null } }
  | { kind: 'unavailable'; reason: HolderReason }

export function asOfWeekRefusal(state: GameState, asOfWeek: number): HolderReason | null {
  if (!state.hollywood) return 'noIndustry'
  if (!Number.isSafeInteger(asOfWeek) || asOfWeek < 0) return 'invalidAsOfWeek'
  if (asOfWeek > state.market.tick) return 'futureWeek'
  return null
}

function subjectKnown(resolved: TitleResolution, subject: RightSubject): boolean {
  return subject.right === 'R1' ? resolved.properties.some((p) => p.propertyId === subject.propertyId) : resolved.filmTitles.some((t) => t.filmId === subject.filmId)
}

/** The holder from the resolved chain at the end of `asOfWeek`; terminal authority from the estates root only. */
export function holderAt(resolved: TitleResolution, estates: readonly EstateRecord[], subject: RightSubject, asOfWeek: number): HolderResult {
  const key = subjectKey(subject)
  const blocked = resolved.unavailable.find((u) => subjectKey(u.subject) === key)
  if (blocked !== undefined) return { kind: 'unavailable', reason: blocked.reason }
  if (!subjectKnown(resolved, subject)) return { kind: 'unavailable', reason: 'unknownSubject' }
  const events = resolved.events.filter((e) => subjectKey(e.subject) === key && dateThrough(e.date, asOfWeek))
  if (events.length === 0) return { kind: 'unavailable', reason: 'noTitleAtDate' }
  const holderId = events[events.length - 1]!.newHolder
  if (isEstateHolder(holderId)) return { kind: 'holder', holderId, tradeable: false, archived: true }
  const estate = estates.find((e) => e.studioId === holderId && e.closureWeek <= asOfWeek)
  if (estate === undefined) return { kind: 'holder', holderId, tradeable: true, archived: false }
  // r2 (F38): a title still with the closed studio at `asOfWeek` was not yet resolved then — the sale or archive at D
  // is its own dated title event — so an as-of read inside the window reads the lot (or the pending right) as open.
  const lot = estate.lots.find((l) => l.subjects.some((s) => subjectKey(s) === key))
  // An admitted predecessor's actual P15 archival is the observational authority.
  // It creates no retroactive P16 title event; historical reads before D remain open.
  if (estate.origin?.kind === 'observed48' && estate.closedWeek !== null && estate.closedWeek <= asOfWeek
    && (lot !== undefined || estate.pending.some(p => subjectKey(p.subject) === key))) {
    return { kind: 'holder', holderId: estateHolderId(holderId), tradeable: false, archived: true }
  }
  if (lot !== undefined) return { kind: 'holder', holderId, tradeable: false, archived: false, estate: { estateId: estate.estateId, lotId: lot.lotId } }
  if ((estate.pending ?? []).some((p) => subjectKey(p.subject) === key)) return { kind: 'holder', holderId, tradeable: false, archived: false, estate: { estateId: estate.estateId, lotId: null } }
  return { kind: 'unavailable', reason: 'unresolvedTerminalAuthority' }
}

export function currentHolder(state: GameState, subject: RightSubject, asOfWeek: number): HolderResult {
  const refusal = asOfWeekRefusal(state, asOfWeek)
  if (refusal !== null) return { kind: 'unavailable', reason: refusal }
  return holderAt(resolveTitles(state), state.rights.estates, subject, asOfWeek)
}

/** Every subject whose holder at the end of `asOfWeek` is `holderId`, in stable subject-key order. */
export function subjectsHeldBy(resolved: TitleResolution, estates: readonly EstateRecord[], holderId: string, asOfWeek: number): RightSubject[] {
  const subjects: RightSubject[] = [
    ...resolved.properties.map((p): RightSubject => ({ right: 'R1', propertyId: p.propertyId })),
    ...resolved.filmTitles.map((t): RightSubject => ({ right: 'R2', filmId: t.filmId })),
  ]
  return subjects.filter((s) => { const h = holderAt(resolved, estates, s, asOfWeek); return h.kind === 'holder' && h.holderId === holderId })
    .sort((a, b) => (subjectKey(a) < subjectKey(b) ? -1 : 1))
}

// ── default R3/R4 authority and parent-bound branches ─────────────────────────

export type AuthorityResult =
  | { kind: 'authority'; studioId: string; via: 'title' | 'licence'; licenceId: string | null }
  | { kind: 'unavailable'; reason: HolderReason | 'r3RequiresProperty' | 'archived' }

/** The licence in force for (subject, right, scope) at `week`, exclusive first. A licence limits one enumerated use, so a
 * scope-less read (the title's own authority) is never answered by a licence. */
export function licenceInForce(licences: readonly Licence[], subject: RightSubject, right: 'R3' | 'R4', scope: LicenceScope | null, week: number): Licence | null {
  if (scope === null) return null
  const live = licences.filter((l) => l.right === right && sameSubject(l.subject, subject) && l.startWeek <= week && week < l.endWeekExclusive && l.scope.use === scope.use)
  return live.find((l) => l.exclusive) ?? live[0] ?? null
}

/** A closed studio's title is frozen, not void: a paid licence term over it still answers (1362-O 5.3; contract §6, §7 E). */
const TERMINAL_REASONS: readonly string[] = ['archived', 'unresolvedTerminalAuthority']

/**
 * Default authority derives from the current R1 holder (R3) or the relevant R1/R2 holder (R4), limited by a scoped
 * exclusive licence. r2 (review F1/F27/F41): the licence in force is read BEFORE the holder's terminal state, so closure,
 * an estate sale and archival freeze the title while a paid term keeps answering for its use until it ends.
 */
export function rightsAuthority(state: GameState, subject: RightSubject, right: 'R3' | 'R4', week: number, scope: LicenceScope | null = null): AuthorityResult {
  if (right === 'R3' && subject.right !== 'R1') return { kind: 'unavailable', reason: 'r3RequiresProperty' }
  const holder = currentHolder(state, subject, week)
  if (holder.kind === 'unavailable' && !TERMINAL_REASONS.includes(holder.reason)) return holder
  const licence = licenceInForce(state.rights.licences, subject, right, scope, week)
  if (licence !== null && licence.exclusive) return { kind: 'authority', studioId: licence.granteeId, via: 'licence', licenceId: licence.id }
  if (holder.kind === 'unavailable') return holder
  if (holder.archived) return { kind: 'unavailable', reason: 'archived' }
  return { kind: 'authority', studioId: holder.holderId, via: 'title', licenceId: null }
}

export type Permission =
  | { kind: 'permitted'; via: 'title' | 'licence'; licenceId: string | null }
  | { kind: 'refused'; reason: string }

/**
 * The live question a consumer asks at a boundary: may `studioId` exercise `right` on `subject` for `scope` at `week`?
 * Answered from present title and licence truth, never from a stored grant, so a sale, an estate, an archive or an expiry
 * changes the answer the week it happens. The scoped authority answers first; a nonexclusive grantee (R4) holds its own
 * term beside it, through a closure too. A lapsed grantee is told its grant expired (`expired:<licenceId>`); anyone else
 * without authority is told who holds it, or why nobody does.
 */
export function permissionFor(state: GameState, studioId: string, subject: RightSubject, right: 'R3' | 'R4', scope: LicenceScope, week: number): Permission {
  const authority = rightsAuthority(state, subject, right, week, scope)
  if (authority.kind === 'authority' && authority.studioId === studioId) return { kind: 'permitted', via: authority.via, licenceId: authority.licenceId }
  const mine = state.rights.licences.filter((l) => l.granteeId === studioId && l.right === right && sameSubject(l.subject, subject) && l.scope.use === scope.use)
  const own = mine.find((l) => !l.exclusive && l.startWeek <= week && week < l.endWeekExclusive)
  if (own !== undefined && (authority.kind === 'authority' || TERMINAL_REASONS.includes(authority.reason))) return { kind: 'permitted', via: 'licence', licenceId: own.id }
  const lapsed = mine.filter((l) => week >= l.endWeekExclusive).sort((a, b) => b.endWeekExclusive - a.endWeekExclusive || (a.id < b.id ? -1 : 1))[0]
  if (lapsed !== undefined) return { kind: 'refused', reason: `expired:${lapsed.id}` }
  return { kind: 'refused', reason: authority.kind === 'unavailable' ? authority.reason : `noAuthority:${authority.studioId}` }
}

export type BranchAuthority =
  | { kind: 'authority'; studioId: string; via: 'parent'; propertyId: string; promoted: false; licenceId: string | null }
  | { kind: 'unavailable'; reason: HolderReason | 'archived' }

/**
 * 1367-O: a character/branch stays within its parent R1/R3 until an explicit promotion mints an independent property; none
 * exists in this checkpoint. r2 (review F34/F55): `studioId` is the studio holding the parent's SPIN-OFF authority, the
 * same answer `permissionFor(…, 'R3', { use: 'spinoff' })` gives: an exclusive spin-off licensee during its term, else
 * the parent's title holder. `licenceId` names the licence when one answers.
 */
export function branchAuthority(state: GameState, branch: { parentPropertyId: string; branch: string }, week: number): BranchAuthority {
  const parent = rightsAuthority(state, { right: 'R1', propertyId: branch.parentPropertyId }, 'R3', week, { use: 'spinoff' })
  if (parent.kind === 'unavailable') return { kind: 'unavailable', reason: parent.reason === 'r3RequiresProperty' ? 'unknownSubject' : parent.reason }
  return { kind: 'authority', studioId: parent.studioId, via: 'parent', propertyId: branch.parentPropertyId, promoted: false, licenceId: parent.licenceId }
}

// ── writes: materialization, events, mint hooks ───────────────────────────────

function withRoot(state: GameState, root: RightsRoot): GameState {
  return { ...state, rights: root }
}

/** Persist the exact virtual record for one subject at its first lawful write; a persisted subject is a no-op. */
export function materializeLegacyTitles(state: GameState, subject: RightSubject): GameState {
  const resolved = resolveTitles(state)
  const blocked = resolved.unavailable.find((u) => sameSubject(u.subject, subject))
  if (blocked !== undefined) throw new Error(`rights: cannot materialize ${subjectKey(subject)}: ${blocked.reason}`)
  if (subject.right === 'R1') {
    const p = resolved.properties.find((x) => x.propertyId === subject.propertyId)
    if (p === undefined) throw new Error(`rights: unknown property ${subject.propertyId}`)
    if (!p.virtual) return state
    const { virtual: _v, source, ...record } = p
    const allocated = allocateRightsId(state.rights, 'rights-event')
    const genesis: TitleEvent = { id: allocated.id, subject, ordinal: 1, date: record.createdAt, boundaryOrder: allocated.order, priorHolder: null, newHolder: record.creatorStudioId, cause: 'genesis', source }
    return withRoot(state, { ...allocated.root, properties: [...allocated.root.properties, record], titleEvents: [...allocated.root.titleEvents, genesis] })
  }
  const t = resolved.filmTitles.find((x) => x.filmId === subject.filmId)
  if (t === undefined) throw new Error(`rights: unknown film ${subject.filmId}`)
  if (!t.virtual) return state
  const { virtual: _v, source, ...record } = t
  const allocated = allocateRightsId(state.rights, 'rights-event')
  const genesis: TitleEvent = { id: allocated.id, subject, ordinal: 1, date: record.releasedAt, boundaryOrder: allocated.order, priorHolder: null, newHolder: record.creatorStudioId, cause: 'genesis', source }
  return withRoot(state, { ...allocated.root, filmTitles: [...allocated.root.filmTitles, record], titleEvents: [...allocated.root.titleEvents, genesis] })
}

export type TitleEventInput = { subject: RightSubject; priorHolder: string; newHolder: string; cause: Exclude<TitleCause, 'genesis'>; date: RightsDate; source: TitleSource }

/** Append one non-genesis title event; the subject is materialized first and `priorHolder` must be the present holder. */
export function appendTitleEvent(state: GameState, input: TitleEventInput): { state: GameState; event: TitleEvent } {
  const materialized = materializeLegacyTitles(state, input.subject)
  const key = subjectKey(input.subject)
  const chain = materialized.rights.titleEvents.filter((e) => subjectKey(e.subject) === key).sort(compareEvents)
  const last = chain[chain.length - 1]
  if (last === undefined) throw new Error(`rights: ${key} has no genesis to follow`)
  if (last.newHolder !== input.priorHolder) throw new Error(`rights: ${key} is held by ${last.newHolder}, not ${input.priorHolder}`)
  if (compareRightsDate(input.date, last.date) < 0) throw new Error(`rights: ${key} event would precede its chain`)
  const allocated = allocateRightsId(materialized.rights, 'rights-event')
  const event: TitleEvent = { id: allocated.id, subject: input.subject, ordinal: chain.length + 1, date: input.date, boundaryOrder: allocated.order,
    priorHolder: input.priorHolder, newHolder: input.newHolder, cause: input.cause, source: input.source }
  return { state: withRoot(materialized, { ...allocated.root, titleEvents: [...allocated.root.titleEvents, event] }), event }
}

/** A pure fold fixture helper: records a structurally valid event with a `manual` source (never valid in a save). */
export function recordTitleEventForTest(state: GameState, input: Omit<TitleEventInput, 'source'> & { source: { kind: 'manual'; ref: string } | TitleSource }): GameState {
  return appendTitleEvent(state, input).state
}

/** The one continuation use a greenlight of an already-founded concept exercises: producing the same story again is a remake. */
export const SAME_CONCEPT_GREENLIGHT_USE = 'remake' as const

/**
 * The rights law of a greenlight, read BEFORE anything is written (r2, review F23/F62): null when `studioId` may greenlight
 * `conceptId` at `week`, else the refusal sentence. A concept that already founded a property (persisted or virtual) is
 * produced again under that property's R3 remake authority (review F5/F28/F42: scope-aware, through `permissionFor`): the
 * title holder, or an exclusive remake licensee during its term. A derived record whose only evidence is
 * `productionId` itself is this greenlight's own fact (a greenlight dated in the boundary week reads as legacy).
 */
export function greenlightRightsRefusal(state: GameState, studioId: string, conceptId: string, week: number, productionId: string | null = null): string | null {
  if (!state.hollywood) return null
  const propertyId = storyPropertyId(conceptId)
  const existing = resolveTitles(state).properties.find((p) => p.propertyId === propertyId)
  if (existing === undefined) return null
  if (existing.virtual && productionId !== null && existing.workLinks.every((link) => link === productionId)) return null
  const permission = permissionFor(state, studioId, { right: 'R1', propertyId }, 'R3', { use: SAME_CONCEPT_GREENLIGHT_USE }, week)
  return permission.kind === 'permitted' ? null : `rights: ${studioId} has no continuation authority over ${propertyId} (${permission.reason})`
}

/** Append `workId` to a property's links, materializing a virtual property first; a present link is a no-op. */
function linkWork(state: GameState, propertyId: string, workId: string): GameState {
  const materialized = state.rights.properties.some((p) => p.propertyId === propertyId) ? state : materializeLegacyTitles(state, { right: 'R1', propertyId })
  return withRoot(materialized, { ...materialized.rights, properties: materialized.rights.properties.map((p) =>
    p.propertyId === propertyId && !p.workLinks.includes(workId) ? { ...p, workLinks: [...p.workLinks, workId] } : p) })
}

/**
 * Accepted greenlight: one property and its R1 genesis, atomically. A concept that already has a property is produced
 * again under it (`greenlightRightsRefusal`): the authorised studio's production is linked, anyone else is refused and
 * the action that called this refuses with it. Never a second property for one founding concept.
 */
export function mintStoryPropertyAtGreenlight(state: GameState, input: { studioId: string; production: Production; week: number }, carriedProduction?:CarriedProductionAuthority): GameState {
  const h = state.hollywood
  if (!h) return state
  const propertyId = storyPropertyId(input.production.conceptId)
  const refusal = greenlightRightsRefusal(state, input.studioId, input.production.conceptId, input.week, input.production.id)
  if (refusal !== null) throw new Error(refusal)
  const existing = resolveTitles(state).properties.find((p) => p.propertyId === propertyId)
  const ownFactOnly = existing !== undefined && existing.virtual && existing.workLinks.every((link) => link === input.production.id)
  if (existing !== undefined && !ownFactOnly) return linkWork(state, propertyId, input.production.id)
  const concept = (input.studioId === h.playerStudioId ? state.concepts : h.concepts).find((c) => c.id === input.production.conceptId) ?? (input.studioId===h.playerStudioId?carriedConceptForProduction(state,input.production.id,carriedProduction):undefined)
  const title = concept?.title ?? null
  const property: StoryProperty = { propertyId, conceptId: input.production.conceptId, creatorStudioId: input.studioId, createdAt: { kind: 'campaign', week: input.week },
    title, titleSource: title === null ? 'unavailable' : 'greenlight', origin: 'original', parentPropertyId: null, workLinks: [input.production.id] }
  const allocated = allocateRightsId(state.rights, 'rights-event')
  const genesis: TitleEvent = { id: allocated.id, subject: { right: 'R1', propertyId }, ordinal: 1, date: property.createdAt, boundaryOrder: allocated.order,
    priorHolder: null, newHolder: input.studioId, cause: 'genesis', source: { kind: 'greenlight', productionId: input.production.id } }
  return withRoot(state, { ...allocated.root, properties: [...allocated.root.properties, property], titleEvents: [...allocated.root.titleEvents, genesis] })
}

/**
 * r2 (review F11; contract §3 "A licensed continuation links to the existing parent and does not mint an unencumbered R1"):
 * the writer P17 calls when it greenlights a continuation with ITS OWN concept. Gated by `permissionFor` for the named
 * use, it appends the production to the parent's work links and mints nothing for the new concept; the film's release
 * then titles it under the parent (`mintFilmTitleAtRelease`). A concept that already founded a property is refused:
 * re-parenting it would launder its title.
 */
export function linkContinuationAtGreenlight(state: GameState, input: { studioId: string; production: Pick<Production, 'id' | 'conceptId'>; parentPropertyId: string; use: 'sequel' | 'remake' | 'spinoff'; week: number }): GameState {
  if (!state.hollywood) throw new Error('rights: no industry')
  const own = storyPropertyId(input.production.conceptId)
  const resolved = resolveTitles(state)
  if (!resolved.properties.some((p) => p.propertyId === input.parentPropertyId)) throw new Error(`rights: unknown parent property ${input.parentPropertyId}`)
  if (own === input.parentPropertyId) throw new Error(`rights: ${input.production.conceptId} is the parent's own concept; its greenlight is the remake hook (mintStoryPropertyAtGreenlight)`)
  if (resolved.properties.some((p) => p.propertyId === own) || state.rights.properties.some((p) => p.workLinks.includes(input.production.id))) {
    throw new Error(`rights: ${input.production.conceptId} already founded ${own} or ${input.production.id} is already linked; a continuation cannot re-parent it`)
  }
  const permission = permissionFor(state, input.studioId, { right: 'R1', propertyId: input.parentPropertyId }, 'R3', { use: input.use }, input.week)
  if (permission.kind !== 'permitted') throw new Error(`rights: ${input.studioId} has no ${input.use} authority over ${input.parentPropertyId} (${permission.reason})`)
  return linkWork(state, input.parentPropertyId, input.production.id)
}

/**
 * Actual release: one film title and its R2 genesis; the parent property gains the work link (materialized first for a
 * pre-P16 greenlight). A continuation (linked to a parent under another concept) is titled under that parent. A release
 * with no attested title records `title: null`, source unavailable (review F65), never a fabricated one.
 */
export function mintFilmTitleAtRelease(state: GameState, input: { studioId: string; filmId: string; conceptId: string; title: string | null; week: number }): GameState {
  if (!state.hollywood) return state
  if (state.rights.filmTitles.some((t) => t.filmId === input.filmId)) throw new Error(`rights: ${input.filmId} already has a film title`)
  const own = storyPropertyId(input.conceptId)
  const parent = state.rights.properties.find((p) => p.workLinks.includes(input.filmId) && p.propertyId !== own)
  const propertyId = parent?.propertyId ?? own
  let next = linkWork(state, propertyId, input.filmId)
  const record: FilmTitle = { filmId: input.filmId, conceptId: input.conceptId, propertyId, creatorStudioId: input.studioId,
    releasedAt: { kind: 'campaign', week: input.week }, title: input.title, titleSource: input.title === null ? 'unavailable' : 'release' }
  const allocated = allocateRightsId(next.rights, 'rights-event')
  const genesis: TitleEvent = { id: allocated.id, subject: { right: 'R2', filmId: input.filmId }, ordinal: 1, date: record.releasedAt, boundaryOrder: allocated.order,
    priorHolder: null, newHolder: input.studioId, cause: 'genesis', source: { kind: 'release', productionId: input.filmId } }
  next = withRoot(next, { ...allocated.root, filmTitles: [...allocated.root.filmTitles, record], titleEvents: [...allocated.root.titleEvents, genesis] })
  return next
}

// ── the Save46 root validator ─────────────────────────────────────────────────

type Row = Record<string, unknown>
const isRow = (v: unknown): v is Row => v !== null && typeof v === 'object' && !Array.isArray(v)

function expectedMoneyByStudio(transactions: readonly RightsTransaction[], estates: readonly EstateRecord[]): Map<string, { rightsConsideration: number; dueDiligenceFee: number; acquisitionOutlay: number; estateSaleProceeds: number }> {
  const out = new Map<string, { rightsConsideration: number; dueDiligenceFee: number; acquisitionOutlay: number; estateSaleProceeds: number }>()
  const at = (id: string) => { let row = out.get(id); if (row === undefined) { row = { rightsConsideration: 0, dueDiligenceFee: 0, acquisitionOutlay: 0, estateSaleProceeds: 0 }; out.set(id, row) } return row }
  for (const t of transactions) {
    switch (t.kind) {
      case 'titleSale': case 'licenceGrant': at(t.payerId).rightsConsideration -= t.amount; if (t.payeeId !== null) at(t.payeeId).rightsConsideration += t.amount; break
      case 'estateSale': {
        at(t.payerId).rightsConsideration -= t.amount
        const estate = estates.find(e => e.estateId === t.estateId)
        if (estate !== undefined) at(estate.studioId).estateSaleProceeds += t.amount
        break
      }
      case 'dueDiligence': at(t.payerId).dueDiligenceFee -= t.amount; break
    }
  }
  return out
}

/** The P16 money each studio actually moved, from the authoritative accounts (ledger rows for the player, period movements for a rival). */
export function actualP16Money(state: GameState, studioId: string): { rightsConsideration: number; dueDiligenceFee: number; acquisitionOutlay: number; estateSaleProceeds: number } {
  const h = state.hollywood!
  const out = { rightsConsideration: 0, dueDiligenceFee: 0, acquisitionOutlay: 0, estateSaleProceeds: 0 }
  if (studioId === h.playerStudioId) {
    for (const e of state.ledger) if (e.kind === 'rightsConsideration' || e.kind === 'dueDiligenceFee' || e.kind === 'acquisitionOutlay') out[e.kind] += e.amount
    return out
  }
  const business = h.businesses.find((b) => b.studioId === studioId)
  for (const p of business?.account.periods ?? []) {
    out.rightsConsideration += p.movements.rightsConsideration ?? 0
    out.dueDiligenceFee += p.movements.dueDiligenceFee ?? 0
    out.acquisitionOutlay += p.movements.acquisitionOutlay ?? 0
    out.estateSaleProceeds += p.movements.estateSaleProceeds ?? 0
  }
  return out
}

export function validateRightsRoot(raw: Record<string, unknown>, label: string): void {
  // Annotated on the binding so the compiler narrows after each `if (...) refuse(...)` (assertion-style never calls).
  const refuse: (path: string, rule: string) => never = (path, rule) => { throw new Error(`${label}: rights${path === '' ? '' : `.${path}`} ${rule}`) }
  const root = raw.rights
  if (!isRow(root)) return refuse('', 'root is missing')
  const own = Object.keys(root)
  if (own.length !== RIGHTS_ROOT_KEYS.length || RIGHTS_ROOT_KEYS.some((k) => !Object.hasOwn(root, k))) refuse('', `must carry exactly ${RIGHTS_ROOT_KEYS.join(', ')}`)
  if (root.version !== RIGHTS_ROOT_VERSION) refuse('version', `must be ${RIGHTS_ROOT_VERSION}`)
  const state = raw as unknown as GameState
  const tick = state.market.tick
  const from = root.recordedFromWeek
  if (typeof from !== 'number' || !Number.isSafeInteger(from) || from < 0 || from > tick) refuse('recordedFromWeek', 'must be a whole week in [0, market.tick]')
  for (const key of ['properties', 'filmTitles', 'titleEvents', 'licences', 'offers', 'transactions', 'diligence', 'estates', 'absorptions'] as const) {
    if (!Array.isArray(root[key])) refuse(key, 'must be an array')
  }
  const nextId = root.nextId
  if (typeof nextId !== 'number' || !Number.isSafeInteger(nextId) || nextId < 1) refuse('nextId', 'must be a whole number of at least 1')
  const frontier = root.legacyBoundary
  if (!isRow(frontier) || Object.keys(frontier).sort().join() !== 'filmIds,propertyAnchors,propertyIds') refuse('legacyBoundary', 'must carry exactly propertyIds, filmIds and propertyAnchors')
  for (const kind of ['propertyIds', 'filmIds'] as const) {
    const ids = frontier[kind]
    if (!Array.isArray(ids) || ids.some((id, i) => typeof id !== 'string' || id.length === 0 || i > 0 && ids[i - 1] >= id)) refuse('legacyBoundary.' + kind, 'must be sorted unique nonempty subject IDs')
  }
  if (!Array.isArray(frontier.propertyAnchors)) refuse('legacyBoundary.propertyAnchors', 'must be an array')
  const rights = root as unknown as RightsRoot
  const h = state.hollywood as HollywoodState | null
  if (h === null) {
    if (rights.legacyBoundary.propertyIds.length + rights.legacyBoundary.filmIds.length + rights.legacyBoundary.propertyAnchors.length > 0) refuse('legacyBoundary', 'cannot hold observed subjects without an industry')
    if (rights.properties.length + rights.filmTitles.length + rights.titleEvents.length + rights.licences.length + rights.offers.length
      + rights.transactions.length + rights.diligence.length + rights.estates.length + rights.absorptions.length + rights.legacyBoundary.propertyIds.length + rights.legacyBoundary.filmIds.length > 0) refuse('', 'cannot hold records without an industry')
    return
  }
  const identities = new Set(h.identities.map((i) => i.studioId))
  const estateIds = new Set<string>()
  for (const [i, e] of rights.estates.entries()) {
    if (!identities.has(e.studioId)) refuse(`estates[${i}]`, `names an unknown studio identity ${e.studioId}`)
    if (!isRow(e.origin)) refuse(`estates[${i}].origin`, 'must name actual closure or predecessor observation')
    if (estateIds.has(e.estateId)) refuse(`estates[${i}]`, 'duplicate estate id')
    estateIds.add(e.estateId)
    if (!Number.isSafeInteger(e.closureWeek) || e.closureWeek < 0 || e.closureWeek > tick) refuse(`estates[${i}].closureWeek`, 'must be a whole week in [0, market.tick]')
    if (!(Number.isSafeInteger(e.opensWeek) && Number.isSafeInteger(e.closesWeek) && e.opensWeek >= e.closureWeek && e.closesWeek > e.opensWeek)) refuse(`estates[${i}]`, 'window must be [opensWeek, closesWeek) at or after closure')
    // r2 (F18/F37): the ceremony runs exactly at D, once: closed AT D, and never still open at or after it.
    if (e.closedWeek !== null && e.closedWeek !== e.closesWeek) refuse(`estates[${i}].closedWeek`, 'must be null or exactly closesWeek (the ceremony runs at D)')
    if (e.closedWeek === null && tick >= e.closesWeek) refuse(`estates[${i}]`, `is still open at or after its close boundary D=${e.closesWeek}`)
    const claims = e.claimsContext as unknown
    if (!isRow(claims) || typeof claims.priorityVersion !== 'string' || claims.priorityVersion.length === 0 || !Array.isArray(claims.claimIds)
      || claims.claimIds.some((c) => typeof c !== 'string' || c.length === 0) || new Set(claims.claimIds).size !== claims.claimIds.length) refuse(`estates[${i}].claimsContext`, 'must carry a priority version and distinct claim references')
    if (!Array.isArray(e.pending)) refuse(`estates[${i}].pending`, 'must be an array')
    const seen = new Set<string>()
    for (const lot of e.lots) {
      for (const s of lot.subjects) { const k = subjectKey(s); if (seen.has(k)) refuse(`estates[${i}]`, `lot overlap on ${k}`); seen.add(k) }
      if (!Array.isArray(lot.encumbrances) || lot.encumbrances.some((ref) => {
        const l = typeof ref === 'string' && ref.startsWith('licence:') ? rights.licences.find((x) => x.id === ref.slice('licence:'.length)) : undefined
        return l === undefined || !lot.subjects.some((s) => sameSubject(s, l.subject))
      }) || new Set(lot.encumbrances).size !== lot.encumbrances.length) refuse(`estates[${i}].lots`, `${lot.lotId} encumbrances must name distinct licences on its own subjects`)
    }
    for (const [j, pending] of e.pending.entries()) {
      const k = isRow(pending.subject) ? subjectKey(pending.subject) : '?'
      if (seen.has(k)) refuse(`estates[${i}].pending[${j}]`, `disposes ${k} twice`)
      seen.add(k)
      if (!(ESTATE_PENDING_REASONS as readonly string[]).includes(pending.reason)) refuse(`estates[${i}].pending[${j}]`, 'reason must be activeRun, activeProduction or notOffered')
      if (pending.status !== (e.closedWeek === null ? 'pending' : 'archived')) refuse(`estates[${i}].pending[${j}]`, 'a pending right archives exactly at the close')
    }
    const proceeds = e.proceeds.reduce((s, p) => s + p.amount, 0)
    const sold = rights.transactions.filter((t) => t.kind === 'estateSale' && t.estateId === e.estateId).reduce((s, t) => s + t.amount, 0)
    if (proceeds !== sold) refuse(`estates[${i}].proceeds`, 'must equal the estate sale transactions')
  }
  const holderKnown = (id: string): boolean => identities.has(id) || (isEstateHolder(id) && identities.has(id.slice(ESTATE_HOLDER_PREFIX.length)))
  for (const anchor of rights.legacyBoundary.propertyAnchors) {
    if (!isRow(anchor) || !Array.isArray(anchor.productionIds) || typeof anchor.propertyId !== 'string' || typeof anchor.conceptId !== 'string' || typeof anchor.creatorStudioId !== 'string') refuse('legacyBoundary.propertyAnchors', 'malformed boundary anchor')
  }
  const authentic = authenticTitles(state)
  const propertyIds = new Set<string>()
  for (const [i, p] of rights.properties.entries()) {
    if (propertyIds.has(p.propertyId)) refuse(`properties[${i}]`, 'duplicate propertyId')
    propertyIds.add(p.propertyId)
    if (p.propertyId !== storyPropertyId(p.conceptId)) refuse(`properties[${i}]`, 'propertyId must be the prefix plus its founding conceptId')
    if (!identities.has(p.creatorStudioId)) refuse(`properties[${i}].creatorStudioId`, 'must be a reserved studio identity')
    if (!validRightsDate(p.createdAt) || !dateThrough(p.createdAt, tick)) refuse(`properties[${i}].createdAt`, 'must be a valid date not after market.tick')
    if (p.title !== null && typeof p.title !== 'string') refuse(`properties[${i}].title`, 'must be text or null')
    if (p.origin !== 'original' || p.parentPropertyId !== null) refuse(`properties[${i}]`, 'promotion is not lawful in this checkpoint (1367-O): origin must be original with no parent')
    if (new Set(p.workLinks).size !== p.workLinks.length) refuse(`properties[${i}].workLinks`, 'must be distinct')
    const genesis = rights.titleEvents.find((e) => e.cause === 'genesis' && isRow(e.subject) && e.subject.right === 'R1' && e.subject.propertyId === p.propertyId)
    const contradiction = propertyContradiction(p, authentic.properties.get(p.propertyId), genesis, authentic.evidence)
    if (contradiction !== null) refuse(`properties[${i}]`, `contradicts its authentic source (${contradiction}): ambiguous provenance`)
  }
  const filmIds = new Set<string>()
  for (const [i, t] of rights.filmTitles.entries()) {
    if (filmIds.has(t.filmId)) refuse(`filmTitles[${i}]`, 'duplicate filmId')
    filmIds.add(t.filmId)
    // r2 (F11): a continuation's film is titled under the parent that links it.
    if (t.propertyId !== storyPropertyId(t.conceptId) && !rights.properties.some((p) => p.propertyId === t.propertyId && p.workLinks.includes(t.filmId))) {
      refuse(`filmTitles[${i}]`, 'propertyId must be the prefix plus its conceptId, or the parent that links it as a continuation')
    }
    if (!identities.has(t.creatorStudioId)) refuse(`filmTitles[${i}].creatorStudioId`, 'must be a reserved studio identity')
    if (!validRightsDate(t.releasedAt) || !dateThrough(t.releasedAt, tick)) refuse(`filmTitles[${i}].releasedAt`, 'must be a valid date not after market.tick')
    const v = authentic.filmTitles.get(t.filmId)
    if (v === undefined) refuse(`filmTitles[${i}]`, `names a film ${t.filmId} with no released record`)
    else if (!compatibleFilmTitle(t, v)) refuse(`filmTitles[${i}]`, `contradicts its authentic source (creator ${v.creatorStudioId}, title ${JSON.stringify(v.title)}, date ${JSON.stringify(v.releasedAt)}): ambiguous provenance`)
  }
  if (rights.legacyBoundary.propertyAnchors.length !== rights.legacyBoundary.propertyIds.length) refuse('legacyBoundary.propertyAnchors', 'must match every boundary property exactly once')
  for (const [i, anchor] of rights.legacyBoundary.propertyAnchors.entries()) {
    if (!isRow(anchor) || Object.keys(anchor).sort().join() !== 'conceptId,creatorStudioId,productionIds,propertyId,sources'
      || anchor.propertyId !== rights.legacyBoundary.propertyIds[i] || typeof anchor.conceptId !== 'string'
      || anchor.propertyId !== storyPropertyId(anchor.conceptId) || !h.identities.some(identity => identity.studioId === anchor.creatorStudioId)
      || !Array.isArray(anchor.productionIds) || anchor.productionIds.length === 0
      || anchor.productionIds.some((id, j) => typeof id !== 'string' || j > 0 && anchor.productionIds[j - 1]! >= id)) refuse('legacyBoundary.propertyAnchors', 'not an authentic boundary property anchor')
    if (!Array.isArray(anchor.sources) || anchor.sources.length !== anchor.productionIds.length) refuse('legacyBoundary.propertyAnchors', 'one original source is required for each observed work')
    for (const [j, source] of anchor.sources.entries()) {
      if (!isRow(source) || Object.keys(source).sort().join() !== 'kind,productionId' || source.productionId !== anchor.productionIds[j]
        || !['player-ledger','player-active','player-release','rival-announcement','rival-active','rival-release'].includes(source.kind)) refuse('legacyBoundary.propertyAnchors', 'malformed original source')
      const productionId = source.productionId, player = anchor.creatorStudioId === h.playerStudioId
      if (source.kind.startsWith('player-') !== player) refuse('legacyBoundary.propertyAnchors', 'original source differs from creator')
      if (!state.concepts.some(c => c.id === anchor.conceptId) && !h.concepts.some(c => c.id === anchor.conceptId)) refuse('legacyBoundary.propertyAnchors', 'unknown original concept')
      const active = player ? state.studio.activeProductions.find(p => p.id === productionId)
        : h.businesses.find(b => b.studioId === anchor.creatorStudioId)?.productions.find(p => p.id === productionId)
      const released = player ? state.studio.releasedFilms.find(f => f.productionId === productionId)
        : h.films.find(f => f.filmId === productionId)
      const announced = h.businesses.find(b => b.studioId === anchor.creatorStudioId)?.projects.find(p => p.productionId === productionId)
      if (active && (active.conceptId !== anchor.conceptId || source.kind.endsWith('active') && active.startTick !== from)) refuse('legacyBoundary.propertyAnchors', 'surviving production contradicts original source')
      if (released && released.conceptId !== anchor.conceptId) refuse('legacyBoundary.propertyAnchors', 'surviving release contradicts original concept')
      if (announced && announced.conceptId !== anchor.conceptId) refuse('legacyBoundary.propertyAnchors', 'surviving project contradicts original concept')
      if (source.kind === 'player-ledger' && !state.ledger.some(row => row.kind === 'production' && row.productionId === productionId && row.week === from)) refuse('legacyBoundary.propertyAnchors', `${anchor.propertyId} has no retained boundary production evidence`)
      if (source.kind === 'rival-announcement' && announced?.announcedWeek !== from) refuse('legacyBoundary.propertyAnchors', 'retained announcement differs from original source')
      if (source.kind === 'player-release' && (!released || !('releaseTick' in released) || released.releaseTick !== from)) refuse('legacyBoundary.propertyAnchors', 'retained player release differs from original source')
      if (source.kind === 'rival-release' && (!released || !('result' in released) || released.studioId !== anchor.creatorStudioId || released.result.releaseTick !== from)) refuse('legacyBoundary.propertyAnchors', 'retained rival release differs from original source')
      // An original active fallback may disappear through lawful cancellation. Its truthful
      // cutover observation remains authority; no nonexistent paid ledger is manufactured.
    }
  }
  for (const id of rights.legacyBoundary.filmIds) {
    const fact = authentic.filmTitles.get(id)
    if (!fact || fact.releasedAt.kind !== 'campaign' || fact.releasedAt.week !== from) refuse('legacyBoundary.filmIds', `${id} is not an authentic boundary film`)
  }
  // Completeness: a record dated in the P16 era was minted by its hook, or the save is not a lawful V46 state.
  for (const [id, p] of authentic.properties) {
    if (!isLegacySubject(p.createdAt, rights, 'propertyIds', id) && !propertyIds.has(id)) refuse('properties', `${id} was greenlit in the P16 era (${JSON.stringify(p.createdAt)}) but has no persisted record`)
  }
  for (const [id, t] of authentic.filmTitles) {
    if (!isLegacySubject(t.releasedAt, rights, 'filmIds', id) && !filmIds.has(id)) refuse('filmTitles', `${id} was released in the P16 era (${JSON.stringify(t.releasedAt)}) but has no persisted record`)
  }
  const transactionIds = new Map(rights.transactions.map((t) => [t.id, t]))
  const ids = new Set<string>()
  const idNumber = (id: string, path: string): number => {
    const m = /^[a-z-]+-(\d+)$/.exec(id)
    if (m === null) refuse(path, `id ${id} is not <prefix>-<n>`)
    const n = Number(m![1])
    if (n >= nextId) refuse(path, `id ${id} is at or above nextId ${nextId}`)
    if (ids.has(id)) refuse(path, `duplicate id ${id}`)
    ids.add(id)
    return n
  }
  for (const [i, record] of rights.absorptions.entries()) {
    if (!isRow(record)) refuse(`absorptions[${i}]`, 'must be an object')
    idNumber(record.id, 'absorptions.id')
    for(const receipt of record.runReceipts) idNumber(receipt.id,'absorptions.runReceipts.id')
    for(const step of record.workSteps) idNumber(step.id,'absorptions.workSteps.id')
    for(const cancellation of record.workCancellations) idNumber(cancellation.id,'absorptions.workCancellations.id')
    if((record.producerVersion==='absorption-scripts/v3'||record.producerVersion==='absorption-scripts/v4'||(record.producerVersion==='absorption-scripts/v5'||record.producerVersion==='absorption-scripts/v6'||(record.producerVersion==='absorption-obligations/v7'||(record.producerVersion==='absorption-rival-scripts/v8'||record.producerVersion==='absorption-rival-obligations/v9'))))){
      for(const row of record.continuedScripts)idNumber(row.project.id,'absorptions.continuedScripts.project.id')
      for(const row of record.scriptCompletions)idNumber(row.id,'absorptions.scriptCompletions.id')
      if(record.producerVersion==='absorption-scripts/v4'||(record.producerVersion==='absorption-scripts/v5'||record.producerVersion==='absorption-scripts/v6'||(record.producerVersion==='absorption-obligations/v7'||(record.producerVersion==='absorption-rival-scripts/v8'||record.producerVersion==='absorption-rival-obligations/v9'))))for(const row of record.scriptDecisions)idNumber(row.id,'absorptions.scriptDecisions.id')
    }
  }
  const bySubject = new Map<string, TitleEvent[]>()
  for (const [i, e] of rights.titleEvents.entries()) {
    const path = `titleEvents[${i}]`
    if (!isRow(e.subject) || (e.subject.right !== 'R1' && e.subject.right !== 'R2')) refuse(path, 'unknown subject')
    const key = subjectKey(e.subject)
    const known = e.subject.right === 'R1' ? propertyIds.has(e.subject.propertyId) : filmIds.has(e.subject.filmId)
    if (!known) refuse(path, `unknown subject ${key}: its record is not persisted`)
    idNumber(e.id, `${path}.id`)
    if (!validRightsDate(e.date)) refuse(`${path}.date`, 'invalid date')
    if (!dateThrough(e.date, tick)) refuse(`${path}.date`, 'is in the future')
    if (!Number.isSafeInteger(e.boundaryOrder) || e.boundaryOrder < 0 || e.boundaryOrder >= nextId) refuse(`${path}.boundaryOrder`, 'must be below nextId')
    if (!['genesis', 'sale', 'estateSale', 'archive', 'absorption', 'absorbedWorkRelease'].includes(e.cause)) refuse(`${path}.cause`, `unknown cause ${JSON.stringify(e.cause)}`)
    if (!holderKnown(e.newHolder)) refuse(`${path}.newHolder`, `unknown holder ${e.newHolder}`)
    if (e.priorHolder !== null && !holderKnown(e.priorHolder)) refuse(`${path}.priorHolder`, `unknown holder ${e.priorHolder}`)
    bySubject.set(key, [...(bySubject.get(key) ?? []), e])
  }
  for (const [key, chain] of bySubject) {
    chain.sort((a, b) => a.ordinal - b.ordinal)
    const genesisCount = chain.filter((e) => e.cause === 'genesis').length
    if (genesisCount !== 1) refuse('titleEvents', `${key} must have exactly one genesis (found ${genesisCount})`)
    for (const [i, e] of chain.entries()) {
      if (e.ordinal !== i + 1) refuse('titleEvents', `${key} ordinal ${e.ordinal} breaks the 1..n sequence`)
      if (i === 0) {
        if (e.cause !== 'genesis' || e.priorHolder !== null) refuse('titleEvents', `${key} genesis must come first with priorHolder null`)
        const record = e.subject.right === 'R1' ? rights.properties.find((p) => p.propertyId === (e.subject as { propertyId: string }).propertyId)! : rights.filmTitles.find((t) => t.filmId === (e.subject as { filmId: string }).filmId)!
        const creator = record.creatorStudioId
        const date = 'createdAt' in record ? record.createdAt : record.releasedAt
        if (e.newHolder !== creator) refuse('titleEvents', `${key} genesis newHolder must be the creator ${creator}`)
        if (!sameDate(e.date, date)) refuse('titleEvents', `${key} genesis date must equal the record date`)
        if (e.source.kind !== 'greenlight' && e.source.kind !== 'release' && e.source.kind !== 'legacy') refuse('titleEvents', `${key} genesis has a forged source ${e.source.kind}`)
      } else {
        const prev = chain[i - 1]!
        if (e.priorHolder !== prev.newHolder) refuse('titleEvents', `${key} ordinal ${e.ordinal} priorHolder ${e.priorHolder} breaks continuity with ${prev.newHolder}`)
        if (compareEvents(e, prev) <= 0) refuse('titleEvents', `${key} ordinal ${e.ordinal} is not strictly after its predecessor in (date, boundaryOrder, ordinal)`)
        if (e.cause === 'archive') {
          if (e.newHolder !== estateHolderId(e.priorHolder!)) refuse('titleEvents', `${key} archive must move the title to the estate of ${e.priorHolder}`)
          if (!rights.estates.some((x) => x.studioId === e.priorHolder && x.closedWeek !== null)) refuse('titleEvents', `${key} archive has no closed estate record for ${e.priorHolder}`)
          if (e.source.kind !== 'estate' || !estateIds.has(e.source.estateId)) refuse('titleEvents', `${key} archive has a forged source`)
        } else if(e.cause==='absorbedWorkRelease') {
          if(e.source.kind!=='absorbedWorkRelease')refuse('titleEvents',`${key} continued release lacks its actual source`)
          const source=e.source
          const owner=rights.absorptions.find(a=>source.kind==='absorbedWorkRelease' && a.id===source.absorptionId)
          const release=owner?.workReleases.find(r=>source.kind==='absorbedWorkRelease' && r.productionId===source.productionId && r.titleEventId===e.id)
          if(!owner || !release || e.subject.right!=='R2' || source.kind!=='absorbedWorkRelease' || e.subject.filmId!==source.productionId || e.priorHolder!==owner.targetId || e.newHolder!==owner.buyerId || e.date.kind!=='campaign' || e.date.week!==release.week)refuse('titleEvents',`${key} continued release has no actual owner transition`)
        } else if (e.cause === 'absorption') {
          if (e.source.kind !== 'absorption') refuse('titleEvents', `${key} absorption requires its actual producer record`)
          const record = rights.absorptions.find(a => e.source.kind === 'absorption' && a.id === e.source.absorptionId)
          if (!record || !record.titleEventIds.includes(e.id) || e.priorHolder !== record.targetId || e.newHolder !== record.buyerId
            || e.date.kind !== 'campaign' || e.date.week !== record.week) refuse('titleEvents', `${key} absorption has no matching owner transition`)
        } else {
          if (e.source.kind !== 'transaction') refuse('titleEvents', `${key} ${e.cause} has a forged source ${e.source.kind}`)
          const t = transactionIds.get(e.source.transactionId)
          // A bilateral transaction names its one subject; a lot-level estate sale names the lot and lists every event.
          if (t === undefined || !t.titleEventIds.includes(e.id) || (t.subject !== null && !sameSubject(t.subject, e.subject))) refuse('titleEvents', `${key} ${e.cause} names a transaction that does not record it`)
          if (e.cause === 'estateSale' && (t.kind !== 'estateSale' || !estateIds.has(t.estateId ?? ''))) refuse('titleEvents', `${key} estateSale needs an estate sale transaction`)
          if (e.cause === 'sale' && t.kind !== 'titleSale') refuse('titleEvents', `${key} sale needs a titleSale transaction`)
        }
      }
    }
  }
  for (const p of rights.properties) if (!bySubject.has(`R1:${p.propertyId}`)) refuse('properties', `${p.propertyId} has no genesis event`)
  for (const t of rights.filmTitles) if (!bySubject.has(`R2:${t.filmId}`)) refuse('filmTitles', `${t.filmId} has no genesis event`)
  const resolved = resolveTitles(state)
  const subjectExists = (s: RightSubject): boolean => subjectKnown(resolved, s)
  for (const [i, l] of rights.licences.entries()) {
    const path = `licences[${i}]`
    idNumber(l.id, `${path}.id`)
    if (l.right !== 'R3' && l.right !== 'R4') refuse(path, 'right must be R3 or R4')
    if (l.right === 'R3' && l.subject.right !== 'R1') refuse(path, 'R3 needs a property subject')
    if (l.right === 'R3' && (l.exclusive !== true || !(R3_USES as readonly string[]).includes(l.scope.use))) refuse(path, 'an R3 licence is an exclusive term over an enumerated continuation use')
    if (l.right === 'R4' && (!R4_CONSUMER_LIVE || !(R4_USES as readonly string[]).includes(l.scope.use))) refuse(path, 'no R4 grant is lawful before its P18 consumer is live')
    if (!subjectExists(l.subject)) refuse(path, `unknown subject ${subjectKey(l.subject)}`)
    if (!identities.has(l.grantorId) || !identities.has(l.granteeId) || l.grantorId === l.granteeId) refuse(path, 'grantor and grantee must be distinct studio identities')
    if (!(Number.isSafeInteger(l.startWeek) && Number.isSafeInteger(l.endWeekExclusive) && l.startWeek < l.endWeekExclusive)) refuse(path, 'term must be half-open [startWeek, endWeekExclusive)')
    if (!Number.isSafeInteger(l.grantedWeek) || l.grantedWeek > tick || l.grantedWeek > l.startWeek) refuse(path, 'grantedWeek must be a past week not after startWeek')
    if (typeof l.exclusive !== 'boolean') refuse(path, 'exclusive must be boolean')
    const t = transactionIds.get(l.transactionId)
    if (t === undefined || t.kind !== 'licenceGrant' || t.licenceId !== l.id) refuse(path, 'has no licenceGrant transaction')
    for (const other of rights.licences.slice(0, i)) {
      if (other.right === l.right && sameSubject(other.subject, l.subject) && other.scope.use === l.scope.use && (other.exclusive || l.exclusive)
        && other.startWeek < l.endWeekExclusive && l.startWeek < other.endWeekExclusive) refuse(path, `overlaps exclusive licence ${other.id}`)
    }
  }
  for (const [i, o] of rights.offers.entries()) {
    const path = `offers[${i}]`
    idNumber(o.id, `${path}.id`)
    const versionRefusal = quoteAgeVersionRefusal(o.quoteAgePolicyVersion)
    if (versionRefusal !== null) refuse(path, versionRefusal)
    if (o.quoteAgePolicyVersion === 1 && o.expiresWeek !== o.week + QUOTE_AGE_POLICIES[1].bilateralOffer.max + 1) refuse(path, 'v1 offer expiry must be quote week plus4')
    if (o.quoteAgePolicyVersion === 1 && o.status === 'accepted' && quoteAgeRefusal('bilateralOffer', o.week, o.resolvedWeek!, 1) !== null) refuse(path, 'accepted offer violates its quote age')
    if (o.disclosureId !== undefined && o.disclosureId !== null) {
      const disclosure = rights.diligence.find(d => d.id === o.disclosureId)
      if (disclosure === undefined || disclosure.recipientId !== o.offerorId || disclosure.target.kind !== 'studio' || disclosure.target.studioId !== o.counterpartyId) refuse(path, 'disclosure is not held for this offer')
      if (o.status === 'accepted' && (quoteAgeRefusal('disclosure', disclosure!.week, o.resolvedWeek!, disclosure!.quoteAgePolicyVersion) !== null || o.resolvedWeek! >= disclosure!.staleFromWeek)) refuse(path, 'accepted offer used a stale disclosure')
    }
    if (!identities.has(o.offerorId) || !identities.has(o.counterpartyId) || o.offerorId === o.counterpartyId) refuse(path, 'offeror and counterparty must be distinct identities')
    if (!Number.isSafeInteger(o.price) || o.price < 0) refuse(path, 'price must be a non-negative whole amount')
    if (!Number.isSafeInteger(o.week) || o.week > tick || !Number.isSafeInteger(o.expiresWeek) || o.expiresWeek <= o.week) refuse(path, 'invalid offer weeks')
    if (o.status === 'open' && o.expiresWeek <= tick) refuse(path, 'an open offer cannot be past its expiry')
    if ((o.status === 'accepted') !== (o.transactionId !== null)) refuse(path, 'an accepted offer has exactly one transaction')
    if (o.transactionId !== null && transactionIds.get(o.transactionId)?.offerId !== o.id) refuse(path, 'transaction does not name this offer')
    if ((o.status === 'open') !== (o.resolvedWeek === null)) refuse(path, 'resolvedWeek set exactly when resolved')
  }
  // r2 (F9/F31): every transaction carries its effect — a lawful kind with a producer in this checkpoint, the accepted offer,
  // licence, sold lot and winning bid, or disclosure record it closed, the parties and sign that record names, and exactly
  // the title events it moved. Money then reconciles per row below.
  const offersById = new Map(rights.offers.map((o) => [o.id, o]))
  const eventsById = new Map(rights.titleEvents.map((e) => [e.id, e]))
  for (const [i, t] of rights.transactions.entries()) {
    const path = `transactions[${i}]`
    idNumber(t.id, `${path}.id`)
    if (!RIGHTS_TRANSACTION_KINDS.includes(t.kind)) refuse(path, `kind ${JSON.stringify(t.kind)} has no matching bilateral/estate transaction producer`)
    if (!identities.has(t.payerId)) refuse(path, 'payer must be a studio identity')
    if (t.payeeId !== null && !identities.has(t.payeeId)) refuse(path, 'payee must be a studio identity or null')
    if (!Number.isSafeInteger(t.amount) || t.amount < 0) refuse(path, 'amount must be a non-negative whole amount')
    if (!Number.isSafeInteger(t.week) || t.week > tick || t.week < from) refuse(path, 'week must be in [recordedFromWeek, market.tick]')
    if (!Array.isArray(t.titleEventIds)) refuse(path, 'titleEventIds must be an array')
    for (const id of t.titleEventIds) if (!eventsById.has(id)) refuse(path, `names an unknown title event ${id}`)
    const moved = t.titleEventIds.map((id) => eventsById.get(id)!)
    const inWeek = (e: TitleEvent): boolean => e.date.kind === 'campaign' && e.date.week === t.week
    if (t.kind === 'titleSale' || t.kind === 'licenceGrant') {
      const offer = t.offerId === null ? undefined : offersById.get(t.offerId)
      if (offer === undefined || offer.status !== 'accepted' || offer.transactionId !== t.id || offer.resolvedWeek !== t.week) refuse(path, `${t.kind} names no accepted offer that records it`)
      const buyer = offer!.direction === 'buy' ? offer!.offerorId : offer!.counterpartyId
      const seller = offer!.direction === 'buy' ? offer!.counterpartyId : offer!.offerorId
      if (t.payeeId !== seller) refuse(path, `${t.kind} payee must be the seller ${seller}, credited the price`)
      if (t.payerId !== buyer) refuse(path, `${t.kind} payer must be the buyer ${buyer}`)
      if (t.amount !== offer!.price) refuse(path, `${t.kind} amount must be the accepted price ${offer!.price}`)
      if (t.subject === null || !sameSubject(t.subject, offer!.instrument.subject)) refuse(path, `${t.kind} subject must be its offer's`)
      if (t.estateId !== null || t.lotId !== null || t.bidId !== null) refuse(path, `${t.kind} names no estate, lot or bid`)
      if (t.kind === 'titleSale') {
        const e = moved[0]
        if (offer!.instrument.kind !== 'title' || t.licenceId !== null || moved.length !== 1 || e!.cause !== 'sale' || !sameSubject(e!.subject, t.subject!)
          || e!.priorHolder !== seller || e!.newHolder !== buyer || !inWeek(e!)) refuse(path, 'titleSale must move exactly its title, seller to buyer, by one sale title event in its week')
      } else {
        const instrument = offer!.instrument
        const l = t.licenceId === null ? undefined : rights.licences.find((x) => x.id === t.licenceId)
        if (instrument.kind !== 'licence' || l === undefined || l.transactionId !== t.id || l.grantorId !== seller || l.granteeId !== buyer || l.grantedWeek !== t.week
          || l.right !== instrument.right || !sameSubject(l.subject, instrument.subject) || l.scope.use !== instrument.scope.use || l.exclusive !== instrument.exclusive
          || l.startWeek !== instrument.startWeek || l.endWeekExclusive !== instrument.endWeekExclusive) refuse(path, 'licenceGrant must name the one licence its accepted offer granted')
        if (moved.length !== 0) refuse(path, 'licenceGrant moves no title')
      }
    } else if (t.kind === 'estateSale') {
      const estate = rights.estates.find((x) => x.estateId === t.estateId)
      if (estate === undefined || t.payeeId !== null) refuse(path, 'estate sale must name its estate and no payee')
      const lot = estate!.lots.find((l) => l.lotId === t.lotId)
      const bid = estate!.bids.find((b) => b.id === t.bidId)
      if (lot === undefined || lot.status !== 'sold' || lot.transactionId !== t.id || bid === undefined || bid.id !== lot.winningBidId || bid.bidderId !== t.payerId
        || bid.amount !== t.amount || estate!.closedWeek !== t.week) refuse(path, 'estateSale must be its sold lot\'s winning bid at the close')
      if (t.subject !== null || t.licenceId !== null || t.offerId !== null) refuse(path, 'estateSale names its lot, not a subject, licence or offer')
      if (moved.length !== lot!.subjects.length || lot!.subjects.some((s) => !moved.some((e) => sameSubject(e.subject, s))) || moved.some((e) => e.cause !== 'estateSale'
        || e.priorHolder !== estate!.studioId || e.newHolder !== t.payerId || !inWeek(e))) refuse(path, 'estateSale must move each lot subject to the winner by one estateSale title event')
    } else {
      if (t.payeeId !== null) refuse(path, 'a diligence fee has no payee')
      const d = rights.diligence.find((x) => x.transactionId === t.id)
      if (d === undefined || d.recipientId !== t.payerId || d.fee !== t.amount || d.week !== t.week || t.amount < 1) refuse(path, 'dueDiligence must name the disclosure record it paid for')
      if (moved.length !== 0 || t.subject !== null || t.licenceId !== null || t.offerId !== null || t.estateId !== null || t.lotId !== null || t.bidId !== null) refuse(path, 'a diligence fee moves nothing else')
    }
  }
  for (const [i, d] of rights.diligence.entries()) {
    const path = `diligence[${i}]`
    idNumber(d.id, `${path}.id`)
    const versionRefusal = quoteAgeVersionRefusal(d.quoteAgePolicyVersion)
    if (versionRefusal !== null) refuse(path, versionRefusal)
    if (!Number.isSafeInteger(d.week) || d.week < 0 || d.week > tick || !Number.isSafeInteger(d.staleFromWeek) || d.staleFromWeek <= d.week) refuse(path, 'invalid disclosure weeks')
    if (d.quoteAgePolicyVersion === 1 && d.staleFromWeek !== d.week + QUOTE_AGE_POLICIES[1].disclosure.max + 1) refuse(path, 'v1 disclosure expires at quote week plus13')
    if (!identities.has(d.recipientId)) refuse(path, 'recipient must be a studio identity')
    const t = transactionIds.get(d.transactionId)
    if (t === undefined || t.kind !== 'dueDiligence' || t.payerId !== d.recipientId || t.amount !== d.fee) refuse(path, 'has no matching diligence fee transaction')
    if (d.target.kind === 'studio' && !identities.has(d.target.studioId)) refuse(path, 'unknown target studio')
    if (d.target.kind === 'estateLot' && !estateIds.has(d.target.estateId)) refuse(path, 'unknown target estate')
  }
  for (const [i, e] of rights.estates.entries()) {
    for (const [j, b] of e.bids.entries()) {
      idNumber(b.id, `estates[${i}].bids[${j}].id`)
      const versionRefusal = quoteAgeVersionRefusal(b.quoteAgePolicyVersion)
      if (versionRefusal !== null) refuse(`estates[${i}].bids[${j}]`, versionRefusal)
      if (b.quoteAgePolicyVersion === 1 && b.status === 'won' && quoteAgeRefusal('estateBid', b.week, e.closedWeek!, 1) !== null) refuse(`estates[${i}].bids[${j}]`, 'winning bid violates its quote age')
      if (!identities.has(b.bidderId)) refuse(`estates[${i}].bids[${j}]`, 'bidder must be a studio identity')
      if (!Number.isSafeInteger(b.amount) || b.amount < 1) refuse(`estates[${i}].bids[${j}]`, 'amount must be a positive whole amount')
      if (!Number.isSafeInteger(b.week) || b.week >= e.closesWeek || b.week < e.opensWeek) refuse(`estates[${i}].bids[${j}]`, 'admitted only inside [opensWeek, closesWeek)')
      if (e.closedWeek === null && b.status !== 'sealed') refuse(`estates[${i}].bids[${j}]`, 'a bid resolves only at the close')
      if (e.closedWeek !== null && b.status === 'sealed') refuse(`estates[${i}].bids[${j}]`, 'a closed estate leaves no sealed bid')
      if (!e.lots.some((l) => l.lotId === b.lotId)) refuse(`estates[${i}].bids[${j}]`, 'names an unknown lot')
    }
    for (const [j, lot] of e.lots.entries()) {
      if (e.closedWeek === null && lot.status !== 'open') refuse(`estates[${i}].lots[${j}]`, 'lots resolve only at the close')
      if (e.closedWeek !== null && lot.status === 'open') refuse(`estates[${i}].lots[${j}]`, 'a closed estate leaves no open lot')
      if ((lot.status === 'sold') !== (lot.winningBidId !== null && lot.transactionId !== null)) refuse(`estates[${i}].lots[${j}]`, 'a sold lot names its winning bid and transaction')
      if (lot.status === 'sold' && !e.bids.some((b) => b.id === lot.winningBidId && b.status === 'won' && b.lotId === lot.lotId)) refuse(`estates[${i}].lots[${j}]`, 'winning bid mismatch')
      for (const s of lot.subjects) if (!subjectExists(s)) refuse(`estates[${i}].lots[${j}]`, `unknown subject ${subjectKey(s)}`)
    }
  }
  // Every P16 money movement reconciles with the transactions, per studio and kind.
  const expected = expectedMoneyByStudio(rights.transactions, rights.estates)
  for (const record of rights.absorptions) {
    for (const [studioId, amount] of [[record.buyerId, -record.outlay], [record.targetId, -record.postExitCash]] as const) {
      const row = expected.get(studioId) ?? { rightsConsideration: 0, dueDiligenceFee: 0, acquisitionOutlay: 0, estateSaleProceeds: 0 }
      row.acquisitionOutlay += amount; expected.set(studioId, row)
    }
  }
  for (const id of identities) {
    const want = expected.get(id) ?? { rightsConsideration: 0, dueDiligenceFee: 0, acquisitionOutlay: 0, estateSaleProceeds: 0 }
    const have = actualP16Money(state, id)
    for (const kind of ['rightsConsideration', 'dueDiligenceFee', 'acquisitionOutlay', 'estateSaleProceeds'] as const) {
      if (want[kind] !== have[kind]) refuse('transactions', `${id} ${kind} ${have[kind]} does not reconcile with its rights transactions (${want[kind]})`)
    }
  }
  // r2 (F9): each player P16 ledger row names the transaction whose effect it carries (the note), at that signed amount.
  const player = h.playerStudioId
  const wantRows = new Map<string, number>()
  for (const t of rights.transactions) {
    if (t.amount === 0) continue
    const key = `${t.id}|${t.kind === 'dueDiligence' ? 'dueDiligenceFee' : 'rightsConsideration'}`
    if (t.payerId === player) wantRows.set(key, (wantRows.get(key) ?? 0) - t.amount)
    if (t.payeeId === player) wantRows.set(key, (wantRows.get(key) ?? 0) + t.amount)
  }
  for (const record of rights.absorptions) if (record.buyerId === player && record.outlay !== 0) wantRows.set(`${record.id}|acquisitionOutlay`, -record.outlay)
  const haveRows = new Map<string, number>()
  for (const [j, row] of state.ledger.entries()) {
    if (row.kind !== 'rightsConsideration' && row.kind !== 'dueDiligenceFee' && row.kind !== 'acquisitionOutlay') continue
    const key = `${row.note}|${row.kind}`
    if (haveRows.has(key) || !wantRows.has(key) || wantRows.get(key) !== row.amount) refuse('transactions', `ledger[${j}] (${row.kind} ${row.amount}, note ${row.note}) does not carry exactly one rights transaction's effect`)
    haveRows.set(key, row.amount)
  }
  for (const key of wantRows.keys()) if (!haveRows.has(key)) refuse('transactions', `${key.split('|')[0]} has no player ledger row carrying its ${key.split('|')[1]}`)
}

/** Observational metadata can strip only when predecessor facts still reconstruct its authority. */
export function cutoverDowngradeRefusal(state: GameState): string | null {
  const root = state.rights
  const withoutAnchors = { ...state, rights: { ...root, legacyBoundary: { ...root.legacyBoundary, propertyAnchors: [] } } }
  const raw = authenticTitles(withoutAnchors)
  for (const anchor of root.legacyBoundary.propertyAnchors) {
    const fact = raw.properties.get(anchor.propertyId)
    if (!fact || fact.conceptId !== anchor.conceptId || fact.creatorStudioId !== anchor.creatorStudioId
      || fact.createdAt.kind !== 'campaign' || fact.createdAt.week !== root.recordedFromWeek
      || anchor.productionIds.some(id => !fact.workLinks.includes(id))) return `cannot downgrade or discard unique cutover provenance ${anchor.propertyId}`
  }
  for (const id of root.legacyBoundary.filmIds) {
    const fact = raw.filmTitles.get(id)
    if (!fact || fact.releasedAt.kind !== 'campaign' || fact.releasedAt.week !== root.recordedFromWeek) return `cannot downgrade or discard unique cutover provenance ${id}`
  }
  return null
}

/** True when the root records nothing: the lossless downgrade condition for the empty P16 era. */
export function rightsRootIsEmpty(root: RightsRoot): boolean {
  return root.properties.length === 0 && root.filmTitles.length === 0 && root.titleEvents.length === 0 && root.licences.length === 0
    && root.offers.length === 0 && root.transactions.length === 0 && root.diligence.length === 0 && root.estates.length === 0 && root.absorptions.length === 0
}
