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

export const PROTOCOL_VERSION = 4 as const
export const PROJECTION_VERSION = 11 as const

const nonEmptyText = () => text({ minLength: 1 })
const nonNegativeInteger = () => integer({ minimum: 0 })
const ratio = () => number({ minimum: 0, maximum: 1 })

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

const StudioJourneyNextSnapshot = object('StudioJourneyNextSnapshot', {
  kind: enumeration([
    'commission',
    'script-review',
    'plan-auditions',
    'audition-review',
    'review-casting-blocker',
    'open-package',
    'resolve-production',
    'advance-week',
  ]),
  label: nonEmptyText(),
  site: nullable(enumeration(['development', 'casting', 'stage', 'post', 'admin'])),
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
    'no-picture',
    'screenplay-writing',
    'screenplay-review',
    'screenplay-ready',
    'auditions-running',
    'auditions-ready',
    'auditions-reviewed',
    'greenlit',
    'pre-production',
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
  locationBuildingId: nonEmptyText(),
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
  creativeRole: enumeration(['actor', 'director', 'writer', 'craft']),
  engagement: enumeration(['production', 'script', 'casting', 'roster']),
  credit: nullable(enumeration([
    'writer',
    'director',
    'lead',
    'antagonist',
    'support',
    'craft',
    'auditionee',
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
  maxInstances: nullable(nonNegativeInteger()),
  buildable: bool(),
  instanceCount: nonNegativeInteger(),
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

const foundingRole = () => enumeration(['actor', 'director', 'writer', 'craft'])

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
  primaryRole: enumeration(['writer', 'director', 'actor', 'craft']),
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
  attention: enumeration(['none', 'ready', 'waiting', 'active', 'decisionRequired', 'blocked']),
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

const StudioCastingBoardSnapshot = object('StudioCastingBoardSnapshot', {
  capacityLine: nonEmptyText(),
  projects: array(reference('StudioCastingProjectSnapshot', StudioCastingProjectSnapshot)),
  expiryNotices: array(reference('StudioCastingExpiryNoticeSnapshot', StudioCastingExpiryNoticeSnapshot)),
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
  kind: enumeration(['screenTest', 'greenlightPackage']),
  projectId: nonEmptyText(),
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

const StudioBridgeQuoteRequest = union('StudioBridgeQuoteRequest', [
  reference('StudioQuoteCommissionRequest', StudioQuoteCommissionRequest),
  reference('StudioQuoteCastingRequest', StudioQuoteCastingRequest),
] as const)

const StudioCastingQuoteSnapshot = object('StudioCastingQuoteSnapshot', {
  /** The ONE opaque digest-bound commit intent this quote mints. */
  intentId: nonEmptyText(),
  kind: enumeration(['startAuditions', 'greenlightPicture']),
  commitLabel: nonEmptyText(),
  startsNow: bool(),
  queues: bool(),
  projectId: nonEmptyText(),
  title: nonEmptyText(),
  // Screen-test consequence — null when kind !== 'startAuditions'.
  weekLine: nullable(text()),
  slotLine: nullable(text()),
  noFeeLine: nullable(text()),
  noHoldLine: nullable(text()),
  uniquePeople: nullable(nonNegativeInteger()),
  // Greenlight consequence — null when kind !== 'greenlightPicture'. NO burn,
  // NO runway, NO recurring delta anywhere on this snapshot — omission is law
  // this checkpoint.
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
})

const StudioQuoteSnapshot = union('StudioQuoteSnapshot', [
  reference('StudioCommissionQuoteSnapshot', StudioCommissionQuoteSnapshot),
  reference('StudioCastingQuoteSnapshot', StudioCastingQuoteSnapshot),
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
  productionOperations: array(reference(
    'StudioProductionOperationsSnapshot',
    StudioProductionOperationsSnapshot,
  )),
  people: array(reference('StudioPersonSnapshot', StudioPersonSnapshot)),
  presence: optional(reference('StudioPresenceSnapshot', StudioPresenceSnapshot)),
  placement: reference('StudioPlacementSnapshot', StudioPlacementSnapshot),
  property: reference('StudioPropertySnapshot', StudioPropertySnapshot),
  weekTheater: optional(reference('StudioWeekTheaterSnapshot', StudioWeekTheaterSnapshot)),
  stages: optional(array(reference('StudioStageSnapshot', StudioStageSnapshot))),
  sets: optional(array(reference('StudioSetSnapshot', StudioSetSnapshot))),
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
})

export const StudioProductionsProjectionSchema = object('StudioProductionsProjection', {
  activeProductions: studioLotSnapshotProperties.activeProductions,
  productionOperations: studioLotSnapshotProperties.productionOperations,
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
})

export const StudioDevelopmentProjectionSchema = object('StudioDevelopmentProjection', {
  development: studioLotSnapshotProperties.development,
})

export const StudioCastingProjectionSchema = object('StudioCastingProjection', {
  casting: studioLotSnapshotProperties.casting,
})

export const StudioProjectionBundleSchema = object('StudioProjectionBundle', {
  lot: reference('StudioLotProjection', StudioLotProjectionSchema),
  productions: reference('StudioProductionsProjection', StudioProductionsProjectionSchema),
  people: reference('StudioPeopleProjection', StudioPeopleProjectionSchema),
  construction: reference('StudioConstructionProjection', StudioConstructionProjectionSchema),
  journeyNotices: reference('StudioJourneyNoticesProjection', StudioJourneyNoticesProjectionSchema),
  releaseResults: reference('StudioReleaseResultsProjection', StudioReleaseResultsProjectionSchema),
  development: reference('StudioDevelopmentProjection', StudioDevelopmentProjectionSchema),
  casting: reference('StudioCastingProjection', StudioCastingProjectionSchema),
})

export const AVAILABLE_INTENT_KINDS = [
  'signFoundingContract',
  'foundStudio',
  'commissionScreenplay',
  'advanceWeek',
  'acceptScreenplay',
  'requestRewrite',
  'startAuditions',
  'acknowledgeAuditions',
  'greenlightPicture',
  'resolveProductionBlocker',
  'startConstruction',
  'commissionOriginalScreenplay',
] as const

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

const StudioBridgeIntentOption = object('StudioBridgeIntentOption', {
  intentId: nonEmptyText(),
  kind: enumeration(AVAILABLE_INTENT_KINDS),
  label: nonEmptyText(),
  detail: text(),
  projectId: nullable(text()),
  castingSessionId: nullable(text()),
  productionId: nullable(text()),
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
  StudioGridCellSnapshot,
  StudioGridRectSnapshot,
  StudioFootprintSnapshot,
  StudioBuildingSnapshot,
  StudioProductionSnapshot,
  StudioReleasedFilmSnapshot,
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
  StudioBridgeQuoteRequest,
  StudioCastingQuoteSnapshot,
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
  StudioProjectionBundle: StudioProjectionBundleSchema,
  StudioBridgeIntentOption,
  StudioBridgeMetrics,
  StudioBridgeIntentPayload,
  StudioBridgeIntentRequest,
  StudioBridgeControlRequest,
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
  $id: 'urn:project-studio:bridge:protocol-4:projection-11',
  title: 'Project Studio TypeScript to Unity Bridge',
  description: 'Canonical wire contract owned by the authoritative TypeScript runtime.',
  oneOf: [
    { $ref: '#/$defs/StudioBridgeIntentRequest' },
    { $ref: '#/$defs/StudioBridgeControlRequest' },
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
export type BridgeCastingQuoteSnapshot = InferSchema<typeof StudioCastingQuoteSnapshot>
export type BridgeQuoteCommissionRequest = InferSchema<typeof StudioQuoteCommissionRequest>
export type BridgeQuoteCastingRequest = InferSchema<typeof StudioQuoteCastingRequest>
export type BridgeQuoteRequest = InferSchema<typeof StudioBridgeQuoteRequest>
export type BridgeQuoteResponse = InferSchema<typeof StudioBridgeQuoteResponse>

export const AVAILABLE_INTENT_KEYS = Object.keys(
  StudioBridgeIntentOption.properties as Record<string, unknown>,
) as Array<keyof BridgeAvailableIntent>
