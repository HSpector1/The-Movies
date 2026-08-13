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
} from './tuning.js'

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

// §3 applyActions (phase 3) — greenlight / cancel / createTalent / createCustomTalent / createBalancedTalent
export { applyActions, previewCustomTalent, previewBalancedTalent, balancedBoostDiscipline, predictProductionId } from './actions.js'

// Production Operations V1 — authoritative phase/facility/task helpers.
export {
  INITIAL_STUDIO_FACILITIES,
  emptyStudioOperations,
  initialManagedStudioOperations,
  addManagedProductionWorkflow,
  advanceManagedProductions,
  productionPhaseForRemainingTicks,
  assertStudioOperationsInvariants,
} from './operations.js'

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
  scriptCapacityView,
  scriptProjectsReadModel,
  nextScriptDecision,
  nextStudioDecision,
} from './scriptReadModel.js'
export type {
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
  buildNewspaper,
  criticStars,
  audienceTier,
  aggregateAudienceScore,
  NEWSPAPER_MASTHEAD,
} from './newspaper.js'
export type { NewspaperView, NewspaperInput, CriticRating, AudienceTier } from './newspaper.js'

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
  busyTalentIds,
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

// §17 save — frozen V1–V9 envelopes plus live Casting Sessions V1 V10.
// stableStringify/deepEqual are unchanged. validateSave dispatches on version and
// loudly rejects unknown versions. New games save as V10.
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
  SaveFile,
  TalentV1,
  GameStateV1,
} from './save.js'

// ── D-14 Talent Career Impact — Star Power progression + frozen career events ──
export {
  computeStarPowerDelta,
  buildTalentCareerEvent,
  starPowerRoleWeight,
  roleDiscipline,
  flattenParticipants,
} from './starPower.js'
export type { StarPowerInput, StarPowerResult, CareerEventInput } from './starPower.js'
