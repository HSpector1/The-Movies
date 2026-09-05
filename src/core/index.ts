// ── Public API (phase 1) ─────────────────────────────────────────────────────
// The test author imports ONLY from here. Re-exports the phase-1 surface:
// §2 declarations, the §2.1 vector math, §16 TUNING + named constants, §4 shape
// declarations, §13 grid declarations, the seeded RNG (M9), and §17 save.
//
// Phase-2+ logic (applyActions, tick, reception, forecast, agents, worldgen,
// broadcast) is intentionally absent — those phases add their exports here.

// §2 / §7 / §8 / §10 types
export type {
  Genre,
  SegmentId,
  CulturalForce,
  CreativeRole,
  CastSlot,
  Range,
  Persona,
  Expression,
  Talent,
  RoleRequirement,
  FilmConcept,
  FilmShape,
  ShapeOption,
  ShapeEffects,
  Promise,
  Budget,
  Production,
  FilmResult,
  TheatricalRun,
  TheatricalRunStatus,
  GameStateV3,
  FilmParticipant,
  FilmParticipantRole,
  FilmParticipants,
  Standing,
  Segment,
  CompetingRelease,
  MarketState,
  EraConfig,
  Studio,
  GameState,
  GameStateV2,
  GameStateV4,
  GameStateV5,
  GameStateV6,
  GameStateV7,
  GameStateV8,
  GameStateV9,
  GameStateV10,
  GameStateV11,
  PublicityTier,
  PublicityState,
  StudioOperationsMode,
  FacilityCapability,
  StudioFacility,
  ProductionPhase,
  FacilityReservation,
  ShootingTaskStatus,
  ShootingTask,
  ProductionBlocker,
  ProductionWorkflow,
  StudioOperations,
  ConstructionMode,
  ConstructionParcelId,
  ConstructionProjectId,
  ConstructionProjectKind,
  ConstructionFacilityId,
  ConstructionProjectStatus,
  ConstructionParcel,
  ConstructionProject,
  StudioConstruction,
  // ── Placement Core V12 ──
  LotCell,
  LotRect,
  LotParcel,
  ParcelTerrain,
  FacilityBlueprint,
  PlacedFacility,
  PlacementStatus,
  PlacementRejection,
  PlacementCellVerdict,
  PlacementRequest,
  PlacementQuote,
  StudioPlacement,
  StudioPlacementMode,
  GameStateV12,
  // ── Blueprint Requirements (C1-M2) ──
  BlueprintRequirement,
  BlueprintRequirementKind,
  UnmetRequirement,
  BlueprintAvailability,
  // ── Property State (C1-M1a) ──
  PlacementQueryOptions,
  PlacementMutationRefusal,
  FacilityEngagement,
  FacilityEngagementKind,
  FacilityMoveRequest,
  FacilityDemolitionRequest,
  PropertyState,
  PropertyStructure,
  PropertyStructureRole,
  GameStateV13,
  GameStateV14,
  GameStateV15,
  GameStateV16,
  ReleaseCommitment,
  StudioReleaseAuthority,
  SetTypeId,
  StudioSet,
  WorkflowBindings,
  ProductionQueueEntry,
  BlueprintBeat,
  MovieBlueprint,
  OriginalScreenplays,
  CommissionOriginalScreenplayPayload,
  StudioEvent,
  StudioEventKind,
  StudioEventLog,
  CashLedgerCheckpoint,
  ScriptDevelopmentMode,
  ScriptProjectStatus,
  ScriptRewriteCount,
  ScriptAssessment,
  ScriptReservation,
  ScriptProject,
  ScriptDevelopment,
  CommissionScriptPayload,
  GreenlightScriptProjectPayload,
  ScriptWriterAssignment,
  DevelopmentCastingOccupancy,
  CastingSessionsMode,
  CastingSessionStatus,
  CastingReservation,
  CastingSlate,
  AuditionResult,
  CastingResults,
  CastingSession,
  CastingSessions,
  StartCastingSessionPayload,
  TalentCareerEvent,
  CareerReasonCode,
  Action,
  AuthoredTalentInput,
  CustomTalentInput,
  BalancedTalentInput,
  ArchetypePreset,
  // D-11 employment / contracts / ledger / founding (types.ts)
  EmploymentStatus,
  Contract,
  LedgerKind,
  LedgerEntry,
  LedgerKindV10,
  LedgerEntryV10,
  FoundingState,
  Confidence,
  ForecastBand,
  ForecastFactorKey,
  SegmentForecast,
  Forecast,
  BroadcastFacts,
  BroadcastItem,
  CoverageContext,
  // D-9 multi-discipline talent vocabulary + supporting types (types.ts)
  Discipline,
  ActingSkill,
  WritingSkill,
  DirectingSkill,
  CraftSkill,
  SkillPair,
  DisciplineSkills,
  SkillProfiles,
  Ceilings,
  GenreExpEntry,
  GenreExperience,
  DevRates,
  WorkHistory,
  PotentialTier,
  SkillBias,
} from './types.js'

// Development & Casting Annex V1 — exact capital-project lifecycle and view.
export {
  ANNEX_PARCEL_ID,
  ANNEX_PROJECT_ID,
  ANNEX_PROJECT_KIND,
  ANNEX_FACILITY_ID,
  ANNEX_NAME,
  ANNEX_CAPEX,
  ANNEX_DURATION_WEEKS,
  ANNEX_CAPACITY_GAIN,
  ANNEX_LEDGER_NOTE,
  emptyStudioConstruction,
  initialManagedStudioConstruction,
  assertStudioConstructionInvariants,
  completeDueConstruction,
} from './construction.js'
export type {
  ConstructionInvariantOptions,
  ConstructionCompletion,
} from './construction.js'

// ── Placement Core V12 + Property State (C1-M1a) ─────────────────────────────
export {
  INITIAL_PROPERTY,
  BARE_LOT_PROPERTY,
  BARE_LOT_PARCELS,
  BARE_LOT_STRUCTURES,
  bareLotProperty,
  INITIAL_PROPERTY_STRUCTURES,
  LOT_DEPTH,
  LOT_PARCELS,
  LOT_ROADS,
  LOT_WIDTH,
  LEGACY_EXPANSION_PARCEL_ID,
  cellKey,
  clonePropertyState,
  initialProperty,
  isOnLot,
  isRoadCell,
  parcelAt,
  parcelById,
  parcelHasRoadFrontage,
  placementWouldSeverLot,
  propertyOf,
  propertyStructureCellKeys,
  rectCells,
  roadCellKeys,
  structureCells,
} from './lot.js'
export {
  BASELINE_DEVELOPMENT_OFFICE_TIER,
  DEVELOPMENT_OFFICE_TIER_BLUEPRINT_IDS,
  developmentOfficeEstUplift,
  developmentOfficeTier,
  freelancerFeeMultiplier,
  hasOperationalBlueprint,
  nonStackingDiscountMultiplier,
  operationalBlueprintCount,
  supersedingOperationalBlueprintId,
} from './facilityEffects.js'
export {
  LIVE_REQUIREMENT_KINDS,
  blueprintAtInstanceLimit,
  blueprintInstanceCount,
  blueprintMaxInstances,
  blueprintRequirementMet,
  blueprintRequirementReason,
  evaluateBlueprintRequirements,
  requirementIsAttainable,
  FOUNDING_OFFICE_BLUEPRINT_ID,
  FOUNDING_OFFICE_REQUIREMENT_REASON,
  foundingPhaseOf,
  foundingPhaseRequirementsFor,
  effectiveBlueprintMaxInstances,
  blueprintAtInstanceLimitFor,
  blueprintNeededNow,
} from './blueprintRequirements.js'
export type { FoundingPhase } from './blueprintRequirements.js'
export {
  PLACEMENT_REJECTION_ORDER,
  RESERVED_PARCEL_BLUEPRINTS,
  parcelReservedBlueprintId,
  assertStudioPlacementInvariants,
  blueprintById,
  clearanceRingCells,
  commitPlacement,
  completeDuePlacements,
  emptyStudioPlacement,
  expectedWeeklyOperatingCostAt,
  footprintCells,
  initialManagedStudioPlacement,
  legacyAnnexPlacement,
  legacyAnnexOffered,
  legacyAnnexPlacementRequest,
  groundOccupiedCellKeys,
  occupiedCellKeys,
  capacityProvidingPlacedFacilities,
  operationalPlacedFacilities,
  placedStudioFacility,
  placementRegimeReady,
  queryPlacement,
  quoteForBlueprint,
  facilityEngagements,
  facilityMoveRefusal,
  facilityDemolitionRefusal,
  facilityDemolitionRefund,
  moveFacility,
  demolishFacility,
  demolishedFacilityHistory,
  blueprintByLedgerNote,
  studioConstructionView,
  studioPlacementView,
  weeklyPlacementOperatingCost,
} from './placement.js'
export type {
  PlacedFacilityView,
  PlacementCatalogView,
  PlacementCompletion,
  PlacementParcelView,
  StudioConstructionView,
  StudioPlacementView,
} from './placement.js'

// ── Presence Projection V1 ───────────────────────────────────────────────────
// A pure, save-neutral projection of the CURRENT week into per-person beats.
// Changes zero outcomes, persists nothing, consumes zero simulation RNG.
export {
  BEATS_PER_WEEK,
  PRESENCE_DEPARTURE_WINDOW,
  PRESENCE_LAST_WORK_BEAT,
  ROSTER_HOME_FACILITY,
  rosterHomeFacilityId,
  studioPresence,
} from './presence.js'
export type {
  PersonPresence,
  PresenceBeat,
  PresenceCredit,
  PresenceEngagement,
  PresenceWithholding,
  StudioPresence,
} from './presence.js'

// ── First Film Journey V1 ────────────────────────────────────────────────────
// A pure, save-neutral projection of "where is my picture and what do I do next",
// derived entirely from the existing screenplay/casting/production read models.
export { firstFilmJourney } from './firstFilmJourney.js'
export type {
  FirstFilmJourneyNext,
  FirstFilmJourneyStage,
  FirstFilmJourneyView,
  PictureJourneyBeat,
  JourneySite,
  JourneyTargetKind,
} from './firstFilmJourney.js'

// §2.1 vector math + EPSILON
export {
  EPSILON,
  personaToExpression,
  magnitude,
  dot,
  distance,
  personaDistance,
  safeCosine,
} from './vector.js'

// numeric primitives used by contract formulas
export { clamp, mean, lerp, smoothstep, remap, weightedMean, sum, product } from './math.js'

// §16 TUNING + contract-declared named constants + D-9 named tables (D-9.16)
export {
  TUNING,
  CAST_WEIGHT,
  CASTING_CANDIDATES_PER_ROLE,
  CASTING_MIN_UNIQUE_CANDIDATES,
  CASTING_SESSION_WEEKS,
  CASTING_OBSERVATION_SIGMA,
  CASTING_RESULT_HALF_WIDTH,
  SLOT_TRANSFORM,
  ROLE_WEIGHT,
  FORCE_VECTORS,
  INITIAL_STANDING,
  WORLD_CONFIG,
  // C2a-M3 — the distributions a film concept is drawn from, and the fixed cast
  // slot order both worldgen and the screenplay mint build against.
  CONCEPT_DISTRIBUTIONS,
  SLOT_ORDER,
  // D-9.16 large tables / fixed orders (named exports beside CAST_WEIGHT/FORCE_VECTORS)
  SKILL_ORDER,
  DISCIPLINE_ORDER,
  GENRE_ORDER,
  ROLE_TO_DISCIPLINE,
  // RULING B (2026-07-26) — multi-hyphenate generation mixture tables
  GEN_ARCHETYPE_MIX,
  GEN_SECONDARY_BANDS,
  GEN_ADJACENCY,
  OVR_WEIGHTS,
  GENRE_SKILL_WEIGHTS,
  SHAPE_SKILL_MODS,
  PROMISE_SKILL_MODS,
  PROMISE_MOD_THRESHOLDS,
  SLOT_SKILL_MODS,
  TEMPER_BANDS,
  POTENTIAL_TIER_THRESHOLDS,
  AUTHORED_TIER_COST,
  AUTHORED_TIER_RANGE,
  AUTHORED_START_OVR,
  // D-11.C Balanced Creator archetype presets
  BALANCED_ARCHETYPES,
  // C2a-M2 — the §3.4 buildable slate and the Set catalog (charter §9)
  STAGE_STANDARD_BLUEPRINT,
  STAGE_BLUEPRINTS,
  POST_BUILDING_BLUEPRINT,
  SCENERY_SHOP_BLUEPRINT,
  BASELINE_DEVELOPMENT_CASTING_BLUEPRINT,
  SET_BLUEPRINTS,
  SET_TYPE_LABELS,
  setBlueprintById,
  // C2a-M4: the queue's `build-blueprint` remedy quotes this catalog, so a
  // surface can price the relief it is being offered.
  FACILITY_BLUEPRINTS,
} from './tuning.js'
export type { SetBlueprint } from './tuning.js'

// §4 shape declarations + resolveShape (phase 2)
export { SHAPE_OPTIONS, specificity, resolveShape } from './shape.js'

// §5 reception pipeline (phase 2)
export {
  resolveReception,
  buildFilmResult,
  roleFit,
  castContribution,
  computeSegmentAppeal,
  computeBoxOffice,
  budgetRealizationDelta,
  scriptPotentialAppealDelta,
} from './reception.js'
export type { ReceptionInputs, ReceptionResult } from './reception.js'

// §7 forecast pipeline (phase 2) + the deterministic forecast-center helper
// (§15.6's behavioral-independence tests use it; the contract itself defines the
// deterministic center in §7/B16).
export { computeForecast, forecastCenters, bandOf } from './forecast.js'
export type { ForecastInputs, ForecastContext, ForecastCenters, DeterministicCore } from './forecast.js'

// §13 grid declarations
export {
  NEGATIVE_BUDGET_MULTIPLIERS,
  MARKETING_BUDGET_LEVELS,
  PROMISE_WIDTHS,
  PROMISE_CENTERS,
  rangeFrom,
  CANDIDATE_CONFIG,
} from './grid.js'

// D-17B §4 — regime-aware, capacity-anchored marketing menu. The legacy fixed
// grid above remains public because it is still authoritative for disengaged/M0A play.
export {
  marketingCapacityFor,
  marketingMenuFromCapacity,
  marketingLevelsFor,
} from './marketingMenu.js'
export type { MarketingMenu, MarketingMenuInputs } from './marketingMenu.js'

// D-17B §2 — exact publicity decision read model (same lift/cooldown/affordability as action).
export {
  PUBLICITY_TIER_ORDER,
  publicityLiftAt,
  publicityOffer,
  publicityOffers,
} from './publicity.js'
export type { PublicityOffer } from './publicity.js'

// seeded RNG (M9)
export { RngStream, stream } from './rng.js'
export type { RngPurpose } from './rng.js'

// §9 world generation (phase 3) + the §10-shared salary curve (B7)
export { generateWorld, salaryCurve } from './worldgen.js'
export type { GenerateWorldOptions } from './worldgen.js'

// ── C2a-M3 — Renewable Screenplay Generation V1 (charter §3.5) ───────────────
// The authored vocabulary, the mint, the set demand, the writer-speed law, and
// the provenance a surface prints.
export {
  BEAT_TEMPLATES,
  BEATS_PER_BLUEPRINT,
  TITLE_LEAD_BY_GENRE,
  UNUSED_RECOVERED_BEAT_SHAPES,
  type BeatTemplate,
  type BeatTemplateProvenance,
  type TemplateBeat,
} from './data/screenplay.js'
export { TITLE_LEAD, TITLE_NOUN } from './data/wordlists.js'
export {
  ACQUIRED_SCREENPLAY_LABEL,
  ORIGINAL_CONCEPT_ID_PREFIX,
  assertMovieBlueprintInvariants,
  beatsForGenre,
  blueprintForConcept,
  developmentOfficeRichnessTier,
  emptyOriginalScreenplays,
  generateScreenplayTitle,
  isOriginalConceptId,
  isOriginalScreenplay,
  mintOriginalConcept,
  mintedNegativeCost,
  movieBlueprint,
  normalizeScreenplayTitle,
  originalConceptId,
  originalScreenplayCredit,
  persistedConceptIds,
  renameScreenplayRefusal,
  requiredSetDemand,
  requiredSetTypes,
  screenplayDraftConsequence,
  screenplayProvenance,
  scriptDraftWeeks,
  writingPaceExperience,
  type MovieBlueprintInvariantContext,
  type RequiredSetTypeView,
  type ScreenplayProvenanceView,
  type ScreenplayRenameRefusal,
} from './screenplay.js'
export { persistedProductionIds } from './productionIdentity.js'

// §3 applyActions (phase 3) — greenlight / cancel / createTalent / createCustomTalent / createBalancedTalent
export { applyActions, previewCustomTalent, previewBalancedTalent, balancedBoostDiscipline, predictProductionId } from './actions.js'

// Production Operations V1 — authoritative phase/facility/task helpers.
export {
  INITIAL_STUDIO_FACILITIES,
  foundingFacilitiesOf,
  emptyStudioOperations,
  initialManagedStudioOperations,
  addManagedProductionWorkflow,
  advanceManagedProductions,
  emptyWorkflowBindings,
  productionPhaseForRemainingTicks,
  // C2a-M4 (§3.3): the queue order for production transitions and the derived
  // aging term it is ordered by.
  productionWaitWeeks,
  productionsInSweepOrder,
  assertStudioOperationsInvariants,
} from './operations.js'

// Shared resource occupancy (C2a-M0, charter §3.2) — THE one named union
// producer over every persisted holder of studio capacity, plus the fail-closed
// cross-owner double-booking refusal every boundary wires into.
export {
  occupiedResourceSlots,
  resourceClaims,
  resourceClaimsOf,
  resourceSlotClaimsOf,
  screenplayOccupiedSlotKeys,
  findDoubleBookedResourceSlot,
  assertNoDoubleBookedResourceSlots,
  isResourceSlotClaim,
  facilitySlotKey,
  resourceSlotKey,
  resourceFacilityKey,
} from './occupancy.js'

// ── C2a-M1 — Sets (charter §3.1) and the studio event ledger (§5) ────────────
export {
  SET_TYPES,
  STARTER_SET_TYPE,
  HOUSE_SET_BLUEPRINT_ID,
  ENDOWED_HOUSE_SET_STAGES,
  ENDOWED_NEXT_SET_ID,
  endowedHouseSets,
  neutralGenreWeights,
  setId,
  setTypeLabel,
  // C2a-M2 — the life of a Set (charter §3.1)
  assertSetsInvariants,
  bindableSetsOnStage,
  commissionSet,
  commissionSetRefusal,
  completeDueSets,
  depleteSetNoveltyForRelease,
  hasFreeSceneryCapacity,
  mintSetName,
  productionBoundToSet,
  repairSet,
  repairSetRefusal,
  setBindingUplift,
  setById,
  setCapexLedgerNote,
  setCommissionCost,
  setCommissionRefusalCopy,
  setDemolitionRefund,
  setGenreFit,
  setIsUnderRepair,
  setIsUsable,
  setMountedOn,
  setNoveltyReceptionFactor,
  setRepairLedgerNote,
  setRepairRefusalCopy,
  setStrikeLedgerNote,
  setStrikeRefusalCopy,
  strikeSet,
  strikeSetRefusal,
  wearSetAtWrap,
} from './sets.js'
export type {
  SetCommissionRefusal,
  SetRepairRefusal,
  SetStrikeRefusal,
  SetRefusalCopy,
} from './sets.js'
export type { KnownSetTypeId } from './sets.js'
export {
  TIER_D_STUDIO_EVENT_KINDS,
  isTierDStudioEventKind,
  emptyStudioEventLog,
  compactStudioEvents,
  commitStudioEvents,
  disabledStudioEventSink,
  studioEventProductionIds,
  StudioEventSink,
} from './studioEvents.js'
export type { StudioEventDraft } from './studioEvents.js'
export type {
  OccupancySources,
  OccupiedSlotFilter,
  ResourceClaim,
  ResourceDoubleBooking,
  ResourceKind,
  ResourceOccupancy,
  ResourceOwnerKind,
  ResourceSlotClaim,
} from './occupancy.js'

// Script Projects V1 — authoritative screenplay lifecycle and shared capacity.
export {
  emptyScriptDevelopment,
  initialManagedScriptDevelopment,
  canonicalScriptProjectId,
  nextScriptProjectId,
  scriptOccupiedFacilitySlots,
  developmentCastingOccupancy,
  availableDevelopmentCastingSlots,
  allocateScriptReservation,
  commissionScriptProject,
  assessFirstDraft,
  scriptRewriteDelta,
  rewriteAssessment,
  completeDueScriptWork,
  requestScriptRewrite,
  acceptScriptProject,
  linkScriptProjectToProduction,
  returnScriptProjectToReady,
  markScriptProjectProduced,
  scriptProjectForProduction,
  readyScriptPerceivedStrength,
  linkedScriptStrengthOverride,
  scriptProjectsNeedingReview,
  nextScriptProjectNeedingReview,
  activeScriptWriterAssignments,
  joinScreenplayWriterPool,
  scriptProjectWriterIds,
  scriptWriterAssignment,
  screenplayFactsMatch,
  assertScriptDevelopmentInvariants,
} from './scriptDevelopment.js'
export type {
  ScriptWorkSources,
  ScriptDevelopmentInvariantContext,
} from './scriptDevelopment.js'

// Casting Sessions V1 — optional one-week camera tests and persisted evidence.
export {
  emptyCastingSessions,
  initialManagedCastingSessions,
  canonicalCastingSessionId,
  nextCastingSessionId,
  castingSessionForProject,
  castingSessionsNeedingReview,
  nextCastingSessionNeedingReview,
  castingSlateTalentIds,
  assertCastingSlateLaw,
  assertCastingSlateEligibility,
  castingOccupiedFacilitySlots,
  castingDevelopmentCastingOccupancy,
  allocateCastingReservation,
  startCastingSession,
  auditionObservation,
  completeDueCastingSessions,
  acknowledgeCastingSession,
  assertCastingSessionsInvariants,
} from './castingSessions.js'
export type {
  CastingStartSources,
  CastingCompletionSources,
  CastingSessionsInvariantContext,
} from './castingSessions.js'

// Casting Sessions V1 — narrow player-facing Casting Room projection.
export {
  CASTING_SESSION_CONSEQUENCE,
  castingSessionsReadModel,
  nextCastingDecision,
} from './castingReadModel.js'
export type {
  CastingCandidateView,
  AuditionEvidenceView,
  CastingProjectActionView,
  CastingProjectView,
  CastingReviewDecisionView,
  CastingSessionsReadModel,
} from './castingReadModel.js'

// Script Projects V1 — narrow player-facing Writers Room projection. These
// fresh read models contain perceived estimates and legal commands only.
export {
  SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE,
  estimatedScriptAssessment,
  estimatedBandForScore,
  scriptAssessmentExplanation,
  rewriteDecisionPreview,
  scriptCapacityView,
  scriptProjectsReadModel,
  nextScriptDecision,
  nextStudioDecision,
} from './scriptReadModel.js'
export type {
  ScriptAssessmentExplanationView,
  RewriteDecisionPreviewView,
  ScriptProjectSection,
  ScriptPlayerBlockerKind,
  ScriptPlayerBlocker,
  ScriptProjectActionView,
  EstimatedScriptAssessmentView,
  ScriptWriterView,
  ScriptProjectCardView,
  ScriptCapacityOccupantView,
  ScriptCapacitySlotView,
  ScriptCapacityFacilityView,
  ScriptCapacityView,
  CommissionConceptView,
  CommissionWriterView,
  ScriptCommissionAvailabilityView,
  ScriptPackageAvailabilityView,
  ReadyScriptPackageView,
  ScriptReviewDecisionView,
  ProductionOperationsCommand,
  ProductionOperationsDecisionView,
  StudioDecisionView,
  ScriptLotAttentionView,
  ScriptProjectsReadModel,
} from './scriptReadModel.js'

// Casting Package V1 — the role-first package-assembly projection (director/
// lead/antagonist/support/craftLead pools, closed budget menus, readiness).
export { castingPackageReadModel, freelancerMarketRefreshWeek, hiringMarketView, returnWeek } from './castingPackageReadModel.js'
export type {
  PackageCandidateView,
  PublicSignalView,
  AuditionEvidenceRef,
  RolePoolView,
  CastingPackageProjectView,
  ContractOfferView,
  HiringCandidateView,
  PackageBlockerView,
} from './castingPackageReadModel.js'

// Studio Calendar & Capacity Board V1 — pure studio-wide planning projection.
export { studioCalendar } from './studioCalendar.js'
export type {
  StudioCalendarDecisionView,
  StudioCalendarOccupantView,
  StudioCalendarSlotView,
  StudioCalendarFacilityView,
  StudioCalendarCommitmentView,
  StudioCalendarProductionFacilityView,
  StudioCalendarProductionBlockerView,
  StudioCalendarProductionView,
  StudioCalendarContractView,
  StudioCalendarExpiryClusterView,
  StudioCalendarSummaryView,
  StudioCalendarView,
} from './studioCalendar.js'

// ── The production queue (C2a-M4, charter §3.3) ──────────────────────────────
// Phase-Gate Admission: the front doors admit what capacity cannot yet carry,
// and the queue is the studio's record of what is waiting for what.
export {
  QUEUE_GATE_CAPABILITY,
  QueueableCapacityRefusal,
  freeGateSlot,
  gateSlotAvailable,
  nextQueueOrdinal,
  queueEntryLabel,
  queueEntrySubjectId,
  queueInPriorityOrder,
  queueWaitWeeks,
} from './productionQueue.js'
export { admitQueuedIntents } from './queueAdmission.js'
export type { QueueAdmissionResult } from './queueAdmission.js'

// ── The Studio Queue (C2a-M4, charter §3.3) ──────────────────────────────────
// The DERIVED law-2 surface: what waits, what it needs, who occupies it, when it
// frees, and what relieves it. Beside `studioCalendar()`, fed by the same
// authorities, and never persisted.
export { studioQueueView } from './studioQueueView.js'
export type {
  StudioQueueNeedView,
  StudioQueueOccupantView,
  StudioQueueRemedy,
  StudioQueueWaiterView,
  StudioQueueView,
} from './studioQueueView.js'

// ── Scenery Load-In V2 (C2a-M5, charter §4.2) ────────────────────────────────
// The one place ground has a deterministic consequence on time. Pure geometry
// over authored structures and completed placements; nothing persisted.
export {
  facilityBodyCentre,
  gridDistance,
  isSceneryLoadIn,
  sceneryLoadInDecision,
  sceneryLoadInFor,
  sceneryLoadInWeeksForDistance,
} from './sceneryLoadIn.js'
export type {
  SceneryLoadIn,
  SceneryLoadInDecision,
  SceneryLoadInWithheldReason,
  SceneryLoadInWithholding,
} from './sceneryLoadIn.js'

// ── Studio Week Theater V1 (C2a-M5, charter §4.2) ────────────────────────────
// The manufacturing loop as beat tracks over the engine's own ten-beat week —
// scenery in transit, stages hot and dark, sets going up and coming down, a wrap
// clearing a stage, companies waiting, a building rising. Presence's twin: pure,
// save-neutral, RNG-neutral, withholds with a reason, never throws.
export { studioWeekTheater } from './studioWeekTheater.js'
export type {
  StudioWeekTheater,
  TheaterBeat,
  TheaterSubject,
  TheaterSubjectKind,
  TheaterWithholding,
} from './studioWeekTheater.js'

// §6 standing (phase 3) — the three-channel updateStanding (B12 context param)
export { updateStanding } from './standing.js'
export type { ReleaseBenchmarks, StandingContext } from './standing.js'

// §3 tick (phase 3/D-9) — PRODUCTION→RELEASE→RECEPTION→STANDING→BROADCAST→DEVELOPMENT.
// DEVELOPMENT (step 6, D-9.8) is gated by TickOptions.develop (default false).
export { tick } from './tick.js'
export type { TickOptions } from './tick.js'

// ── D-9 talent read-only summaries + the §5/§7 effectiveSkill substitute ──────
// effectiveSkill + projectSkillWeights are the ONLY sim-read functions; the rest
// are display/development inputs (never read by §5/§7). (talentSummary.ts)
export {
  effectiveSkill,
  castSlotExecution,
  projectSkillWeights,
  genreExperience,
  workHistoryCount,
  roleOVR,
  roleTier,
  projectFit,
  expectedPerformance,
  temperamentSummary,
  expectedPotentialTier,
  expectedPotentialRange,
  workEthicLabel,
  careerIdentity,
  developmentReport,
  ageRunwayMult,
} from './talentSummary.js'
export type { SkillUse, PerformanceBand, DisciplineStanding, CareerIdentity } from './talentSummary.js'

// ── D-9.8 development (tick step 6 core) — pure per-release skill growth ───────
export { developTalent } from './development.js'
export type { DevelopmentContext } from './development.js'

// ── D-11.C newspaper release reveal (newspaper.ts) — pure deterministic derivation ─
export {
  buildFilmChronicle,
  buildNewspaper,
  criticStars,
  audienceTier,
  aggregateAudienceScore,
  NEWSPAPER_MASTHEAD,
} from './newspaper.js'
// ── P07A W0 canonical reception-verdict module (single source of the verdict logic) ─
export { criticBand, criticTier, filmCommittedCost, filmAudienceScore } from './receptionVerdict.js'
export type { ReceptionBand, CriticTier } from './receptionVerdict.js'
export type {
  NewspaperView,
  NewspaperInput,
  CriticRating,
  AudienceTier,
  FilmChronicleScriptInput,
  FilmChronicleLedgerInput,
  FilmChronicleReception,
  FilmChronicleInput,
  FilmChronicleUnavailable,
  FilmChronicleCreativeRecord,
  FilmChronicleCredits,
  FilmChronicleProductionRecord,
  FilmChronicleFit,
  FilmChroniclePackageRecord,
  FilmChronicleView,
} from './newspaper.js'

// ── D-12 studio economy (economy.ts) — pure theatrical-run + fame-saturation math ─
export { fameReach, theatricalSchedule, openTheatricalRun, legacyTheatricalRun } from './economy.js'

// ── D-12 financial read models (economyView.ts) — the SINGLE UI money source ────
// Pure, deterministic, display-only. Mirrors the exact engine math (tick 3.5/7.5,
// payroll, solvency, runway). The sim never reads these.
export {
  weeklyOverhead,
  projectedWeeklyOverhead,
  weeklyBurn,
  foundingRunwayPreview,
  runNextWeekRevenue,
  runRemainingRevenue,
  expectedWeeklyRunRevenue,
  pipelineRunRevenue,
  runway,
  affordability,
  commitmentPreview,
  breakEvenGross,
  prospectiveCycleFixedCost,
  cycleInclusiveBreakEvenGross,
  regimeStudioShare,
  affordabilityScopes,
  offerObligation,
  postSigningRunway,
  runView,
  activeRunViews,
  financeTotals,
  periodSummary,
  financeView,
} from './economyView.js'
export type {
  Runway,
  CommitmentPreview,
  CycleFixedCost,
  CycleInclusiveBreakEven,
  AffordabilityScopes,
  OfferObligation,
  PostSigningRunway,
  RunView,
  FinanceTotals,
  PeriodSummary,
  FinanceView,
} from './economyView.js'

// ── D-17A/T3 retrospective fixed-cost allocation (fixedCostAllocation.ts) ──────
// Pure managerial attribution of ACTUAL ledger payroll+overhead across the films that
// occupied the studio each week, with unallocated idle burn reported separately. Reconciles
// to the ledger over any window (R7 safeguard). The sim never reads it.
export {
  allocateFixedCosts,
  allocateFixedCostSeries,
  fixedCostOccupancy,
  filmOccupancyWindows,
  ledgerFixedCostByWeek,
  partitionWeeklyFixedCost,
} from './fixedCostAllocation.js'
export type {
  AllocationWindow,
  FixedCostAllocation,
  FilmFixedCostAllocation,
  WeeklyOccupancy,
} from './fixedCostAllocation.js'

// ── D-15 Studio Run Recap (studioRunRecap.ts) — pure read-only run explainer ───
// Reconstructs the whole-run recap (capital story, film slate, talent development,
// concentration, current position + recovery, inflections, warnings) from the live
// GameState. Adds no persistence, mutates nothing, advances no RNG, recomputes no
// film/career outcome. The sim never reads it.
export {
  studioRunRecap,
  classifyContribution,
  // D-17A/T4 — the recap's own package/affordability builders, promoted (math untouched) so
  // every surface answers "can I make a film?" with the same number.
  cheapestPackage,
  standardPackage,
  cheapestPackageQuote,
  standardPackageQuote,
  packageAllIn,
  contractedRosterCanField,
  recentTypicalCommitment,
  affordabilityOf,
} from './studioRunRecap.js'
export type {
  StudioRunRecap,
  RunSummary,
  CapitalStory,
  RecapFilm,
  RecapTalent,
  Concentration,
  ConcentrationEntry,
  RecurringMember,
  CurrentPosition,
  PositionAffordability,
  PackageBreakdown,
  ProspectivePackageQuote,
  RecoveryPosition,
  FilmContributionClass,
  InflectionPoint,
  InflectionKind,
  RecapWarning,
  RecapWarningCode,
  WarningSeverity,
  FixedCostAllocationBasis,
} from './studioRunRecap.js'

// ── D-11 employment / contracts / roster / freelancer market (employment.ts) ──
// Pure, deterministic, read-only helpers (status/offers/markets/payroll/founding).
// The engine reads these in actions.ts (sign/renew/release/greenlight legality) and
// tick.ts (payroll/expiration); the UI reads the display/selector helpers.
export {
  employmentEngaged,
  economyEngaged,
  canAfford,
  employmentStatus,
  activeContract,
  isContracted,
  assignableForFilm,
  assignmentProjectCost,
  busyTalentIds,
  activeProductionCompanyTalentIds,
  activeWritingAssignmentIds,
  creditedWriterIds,
  weeklySalary,
  guaranteedComp,
  terminationCost,
  weeklyPayroll,
  annualPayroll,
  renewalWindowOpen,
  contractOffer,
  contractOfferOptions,
  offerForTalent,
  freelancerFee,
  freelancerMarketIds,
  hiringMarketIds,
  rosterTalent,
  rosterCoverage,
  foundingMinimumsMet,
  foundingGaps,
  FOUNDING_MINIMUMS,
  beginFounding,
  correlateConceptCost,
} from './employment.js'
export type { ContractOffer, Affordability } from './employment.js'

// ── Phase 5.1 CYCLE 3 — Film Package assessment helpers (READ-ONLY UI summaries) ─
// Pure, deterministic, JSON-serializable read-only assessments the UI calls so it
// never reinvents a §5/§7/D-9 formula. The sim never reads any of these (exactly
// like the D-9 talentSummary display functions). (filmPackage.ts)
export {
  creativeCohesion,
  packageFit,
  executionConfidence,
  forecastProfitRange,
  greenlightAssessment,
  risksMaterialized,
  packageDelta,
  // D-17A/T6 — same-rule discoverability exposure (mirrors reception.ts:633-642);
  // player-visible operands only, no realized draw.
  discoveryExposure,
  // Casting Package V1 — the negative-budget-menu formula promoted verbatim from
  // ui/src/engine/adapter.ts's requiredNegative, symmetric to marketingLevelsFor.
  requiredNegative,
} from './filmPackage.js'
export type {
  CreativeCohesion,
  AssignmentFit,
  PackageFitInput,
  PackageFit,
  ExecutionConfidence,
  ExecutionConfidenceInput,
  ExecutionConfidenceContext,
  MoneyRange,
  ForecastProfitRange,
  ForecastProfitInput,
  ForecastProfitContext,
  GreenlightAssessment,
  PreTickSnapshot,
  MaterializedRisk,
  RisksMaterialized,
  AssignmentDelta,
  PackageDelta,
  PackageSide,
  DiscoveryExposure,
} from './filmPackage.js'

// §8 broadcast (phase 4) — the minimal deterministic broadcast core (B22/B23/B24/M10).
// Public entry + facts/ranking/template helpers for the test author, plus the two
// release template ids and their renderer.
export {
  evaluateReleaseBroadcast,
  deriveFacts,
  rankRelease,
  editorialRelevance,
  renderReleaseTemplate,
  releaseTemplateId,
  RELEASE_BETTER_TEMPLATE_ID,
  RELEASE_WORSE_TEMPLATE_ID,
} from './broadcast.js'
export type { ReleaseBroadcastInputs, RankingBreakdown } from './broadcast.js'

// §13 candidate generator (phase 3, step 4) — the finite, deterministic,
// agent-independent decision grid (B18/B19/B21).
export { generateCandidates, packageReceptionInputs } from './candidates.js'
export type { CandidatePackage } from './candidates.js'

// §13 agents (phase 3, step 4) — RandomAgent + OracleAgent over the shared grid
// (ruling #3/#4, D-1).
export { RandomAgent, OracleAgent } from './agents.js'
export type { Agent } from './agents.js'

// §17 save — frozen V1–V10 envelopes plus live Annex V1 V11.
// stableStringify/deepEqual are unchanged. validateSave dispatches on version and
// loudly rejects unknown versions. New games save as V11.
export {
  stableStringify,
  deepEqual,
  validateSave,
  validateSaveV1,
  validateSaveV2,
  validateSaveV3,
  validateSaveV4,
  validateSaveV5,
  validateSaveV6,
  validateSaveV7,
  validateSaveV8,
  validateSaveV9,
  validateSaveV10,
  validateSaveV11,
  validateSaveV12,
  validateSaveV13,
  validateSaveV14,
  validateSaveV15,
  validateSaveV16,
  makeSave,
  makeSaveV1,
  makeSaveV2,
  makeSaveV3,
  makeSaveV4,
  makeSaveV5,
  makeSaveV6,
  makeSaveV7,
  makeSaveV8,
  makeSaveV9,
  makeSaveV10,
  makeSaveV11,
  makeSaveV12,
  makeSaveV13,
  makeSaveV14,
  makeSaveV15,
  makeSaveV16,
  loadSave,
  exportSave,
  importSave,
  // D-9.15 (owner-overridden) — legacy V1 → NEW V2, deterministic + idempotent.
  migrateTalent,
  convertV1ToV2,
  importLegacyV1,
  // D-11.16 — legacy V2 → NEW V3 (and V1 → V3), deterministic + idempotent.
  convertV2ToV3,
  importLegacyV2,
  importLegacyV1ToV3,
  // D-12 — legacy V3 → NEW V4 (and V2/V1 → V4) + migrateToV4, deterministic + idempotent.
  convertV3ToV4,
  importLegacyV3ToV4,
  importLegacyV2ToV4,
  importLegacyV1ToV4,
  migrateToV4,
  // D-14 — legacy V4 → NEW V5 + migrateToV5, deterministic + idempotent.
  convertV4ToV5,
  migrateToV5,
  // D-17A/R2 — legacy V5 → NEW V6 + migrateToV6 (reconstructs the persisted engagement
  // fact), deterministic + idempotent.
  convertV5ToV6,
  migrateToV6,
  // D-17B/E4 — legacy V6 → NEW V7 + migrateToV7 (seeds the empty publicity state),
  // deterministic + idempotent.
  convertV6ToV7,
  migrateToV7,
  emptyPublicityState,
  // Production Operations V1 — legacy V7 → V8 seeds explicit legacy/empty state.
  emptyLegacyOperations,
  convertV7ToV8,
  migrateToV8,
  // Script Projects V1 — legacy V8 → V9 seeds explicit legacy/empty state.
  emptyLegacyScriptDevelopment,
  convertV8ToV9,
  migrateToV9,
  // Casting Sessions V1 — legacy V9 → V10 seeds explicit legacy/empty state.
  convertV9ToV10,
  migrateToV10,
  // Development & Casting Annex V1 — legacy V10 → live V11.
  convertV10ToV11,
  convertV11ToV12,
  convertV12ToV13,
  convertV13ToV14,
  migrateToV11,
  migrateToV12,
  migrateToV13,
  migrateToV14,
  // P04A (§2.5) — live V14 → NEW V15 + migrateToV15 (identity-bearing queue
  // expiry: `subjectId` on `queueIntentExpired`), deterministic + idempotent.
  convertV14ToV15,
  migrateToV15,
  // P06A (charter W1) — live V15 → NEW V16 + migrateToV16 (the release-
  // commitment authority root; empty on migration = explicitly uncommitted).
  convertV15ToV16,
  migrateToV16,
  // P08A — live V16 → NEW V17 + migrateToV17 (the studio-history root).
  convertV16ToV17,
  migrateToV17,
  makeSaveV17,
  validateSaveV17,
  // P09 — live V17 → NEW V18 + migrateToV18 (the founding-regime root).
  convertV17ToV18,
  migrateToV18,
  makeSaveV18,
  validateSaveV18,
} from './save.js'
export type {
  SaveFileV1,
  SaveFileV2,
  SaveFileV3,
  SaveFileV4,
  SaveFileV5,
  SaveFileV6,
  SaveFileV7,
  SaveFileV8,
  SaveFileV9,
  SaveFileV10,
  SaveFileV11,
  SaveFileV12,
  SaveFileV13,
  SaveFileV14,
  SaveFileV15,
  SaveFileV16,
  SaveFileV17,
  SaveFileV18,
  SaveFile,
  TalentV1,
  GameStateV1,
} from './save.js'

// ── P06A Release Authority (charter W1) ──────────────────────────────────────
export {
  initialReleaseAuthority,
  mintReleaseCommitmentId,
  releaseCommitmentFor,
  committedReleaseIds,
  commitPictureToReleaseRefusal,
  withReleaseCommitment,
  pruneReleasedCommitments,
  assertReleaseAuthorityInvariants,
  releaseHoldBusyTalentIds,
  RELEASE_COMMITMENT_NAMESPACE,
} from './releaseAuthority.js'

// ── D-14 Talent Career Impact — Star Power progression + frozen career events ──
export {
  computeStarPowerDelta,
  buildTalentCareerEvent,
  starPowerRoleWeight,
  roleDiscipline,
  flattenParticipants,
} from './starPower.js'
export type { StarPowerInput, StarPowerResult, CareerEventInput } from './starPower.js'

// ── P08A Standing & Studio History Spine V1 ──────────────────────────────────
export {
  initialStudioHistory,
  migratedStudioHistory,
  historyRecordedAt,
  StudioHistorySink,
  disabledStudioHistorySink,
  standingDeltas,
  standingChanged,
  classifyHistorySignificance,
  historyDraft,
  commitStudioHistory,
  appendStudioHistory,
  foldRoutineHistory,
  assertStudioHistoryInvariants,
  studioHistoryChronology,
  standingReceipts,
  studioHistoryTimeline,
  studioHistoryRecording,
  filmSubject,
  studioSubject,
  cloneStanding,
  HISTORY_ROUTINE_WINDOW_WEEKS,
  HISTORY_STANDING_MAJOR_DELTA,
} from './studioHistory.js'
export type { StudioHistoryDraft, StudioHistoryFacts } from './studioHistory.js'
export { releaseStandingDrivers, STANDING_FORMULA_VERSION } from './standing.js'
export type {
  StandingChannelKey,
  StandingChangeSource,
  StandingChangeFacts,
  StudioHistorySignificance,
  StudioHistorySubject,
  StudioHistoryEvent,
  StudioHistoryEventKind,
  StudioHistoryState,
  GameStateV17,
  GameStateV18,
  FoundingRegime,
} from './types.js'
