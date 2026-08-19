// Facilities & Construction research observatory.
//
// ANALYSIS ONLY. This module drives the public core surface and projects evidence from
// Studio Calendar V1. It never imports from production internals, never writes a save,
// and the sole counterfactual mutation is an explicitly labelled configured facility.

import { createHash } from 'node:crypto'
import {
  FOUNDING_MINIMUMS,
  INITIAL_STUDIO_FACILITIES,
  NEGATIVE_BUDGET_MULTIPLIERS,
  TUNING,
  applyActions,
  beginFounding,
  busyTalentIds,
  contractOffer,
  expectedWeeklyRunRevenue,
  freelancerFee,
  freelancerMarketIds,
  generateWorld,
  isContracted,
  makeSave,
  marketingLevelsFor,
  nextStudioDecision,
  productionPhaseForRemainingTicks,
  readyScriptPerceivedStrength,
  renewalWindowOpen,
  resolveShape,
  stableStringify,
  studioCalendar,
  tick,
  weeklyOverhead,
  weeklyPayroll,
  weeklySalary,
} from '../../core/index.js'
import type {
  Action,
  CastingSlate,
  CastingSession,
  CastSlot,
  CommissionScriptPayload,
  CreativeRole,
  FacilityCapability,
  GameState,
  GreenlightScriptProjectPayload,
  LedgerEntry,
  ReceptionInputs,
  ProductionBlocker,
  ProductionPhase,
  ProductionWorkflow,
  ScriptProject,
  StudioFacility,
  Talent,
} from '../../core/index.js'

export const FACILITIES_OBSERVER_SCHEMA_VERSION = 'facilities-observer-v2' as const
export const DEFAULT_FACILITIES_HORIZON_WEEKS = 260
export const FACILITIES_POLICY_IDS = [
  'direct-package',
  'development-casting',
  'scaled-two-team',
] as const

export type FacilitiesPolicyId = (typeof FACILITIES_POLICY_IDS)[number]
export type FacilitiesEvidenceMode = 'current' | 'counterfactual' | 'one-boundary-shadow'
export type FacilitiesCapacityDelta = 1 | 2
export type FacilitiesArmConfigurationId =
  | 'current-capacity'
  | 'development-casting-plus-one'
  | 'development-casting-plus-two'

export type FacilitiesArmConfiguration = {
  id: FacilitiesArmConfigurationId
  evidenceMode: 'current' | 'counterfactual'
  capacityDelta: 0 | FacilitiesCapacityDelta
  availableWeek: number | null
}

export type FacilitiesEvaluatedShadowConfiguration = {
  id: `one-boundary-${FacilityCapability}-plus-one`
  evidenceMode: 'one-boundary-shadow'
  capability: FacilityCapability
  capacityDelta: 1
  availableWeek: number
  facilityId: string
}

export type FacilitiesSourceProvenance = {
  sourceCommit: string
  sourceTree: string
  worktreeDirty: boolean
  runtime: string
}

export type FacilitiesManifestEntry = {
  id: string
  name: string
  capability: FacilityCapability
  capacity: number
}

type EvidenceBase = {
  schemaVersion: typeof FACILITIES_OBSERVER_SCHEMA_VERSION
  recordType: 'weekly' | 'intent' | 'shadow' | 'staffing'
  mode: FacilitiesEvidenceMode
  armConfiguration: FacilitiesArmConfiguration
  seed: string
  policyId: FacilitiesPolicyId
  horizonWeeks: number
  week: number
  facilityManifestId: string
  facilityManifest: FacilitiesManifestEntry[]
  initialSaveHash: string
  sourceCommit: string
  sourceTree: string
  worktreeDirty: boolean
  runtime: string
}

export type FacilitiesWeeklyFacility = FacilitiesManifestEntry & {
  occupied: number
  idle: number
  full: boolean
  ownerSlots: Record<'production' | 'script' | 'casting', number>
}

export type FacilitiesWeeklyRow = EvidenceBase & {
  recordType: 'weekly'
  mode: 'current' | 'counterfactual'
  sampleKind: 'interval-start' | 'horizon-arrival'
  behaviorHash: string
  stateHash: string
  rngState: string
  cash: number
  ledgerTotal: number
  cashReconciliationDelta: number
  weeklyPayroll: number
  weeklyOverhead: number
  activeRunReceipts: number
  activeProductions: number
  releasedFilms: number
  activeContracts: number
  activeContractIds: string[]
  renewalOpenContracts: number
  expiryClusterWeek: number | null
  expiryClusterContracts: number
  scripts: Record<'drafting' | 'review' | 'rewriting' | 'ready' | 'inProduction' | 'produced', number>
  castingSessions: Record<'auditioning' | 'review' | 'complete', number>
  facilities: FacilitiesWeeklyFacility[]
}

export type FacilitiesIntentKind =
  | 'script-commission'
  | 'script-rewrite'
  | 'script-accept'
  | 'casting-session'
  | 'casting-acknowledgement'
  | 'production-greenlight'
  | 'production-operation'
  | 'production-transition'
  | 'contract-renewal'

export type FacilitiesIntentRow = EvidenceBase & {
  recordType: 'intent'
  mode: 'current' | 'counterfactual'
  intentId: string
  intentKind: FacilitiesIntentKind
  ownerId: string
  action: Action | null
  accepted: boolean
  reason: string | null
  capacityBound: boolean
  capability: FacilityCapability | null
  blockerKind: 'capacity' | 'staffing' | 'affordability' | 'lifecycle' | 'other' | null
  targetPhase: ProductionPhase | null
  shadowId: string | null
  delayExposure: FacilitiesDelayExposure | null
}

export type FacilitiesDelayExposure = {
  payroll: number
  overhead: number
  activeRunReceipts: number
  netCommittedBurn: number
}

export type FacilitiesProductionHoldSummary = {
  productionHoldWeeks: number
  productionHoldWeeksByCapability: Record<FacilityCapability, number>
  uniqueHeldStudioWeeks: number
  holdDelayExposure: FacilitiesDelayExposure
}

export type FacilitiesProductionHoldIntentBase = Omit<
  FacilitiesIntentRow,
  | 'intentId'
  | 'intentKind'
  | 'ownerId'
  | 'action'
  | 'accepted'
  | 'reason'
  | 'capacityBound'
  | 'capability'
  | 'blockerKind'
  | 'targetPhase'
  | 'shadowId'
  | 'delayExposure'
>

export type FacilitiesHeldWorkflow = Omit<ProductionWorkflow, 'blocker'> & {
  blocker: Extract<ProductionBlocker, { kind: 'facility-capacity' }>
}

type FacilitiesShadowEvidenceBase = Omit<EvidenceBase, 'armConfiguration'> & {
  sourceArmConfiguration: FacilitiesArmConfiguration
  evaluatedShadowConfiguration: FacilitiesEvaluatedShadowConfiguration
}

export type FacilitiesShadowRow = FacilitiesShadowEvidenceBase & {
  recordType: 'shadow'
  mode: 'one-boundary-shadow'
  shadowId: string
  boundaryKind: 'action-rejection' | 'production-hold'
  capability: FacilityCapability
  ownerId: string
  exactAction: Action | null
  currentStateHash: string
  configuredStateHash: string
  shadowStateHash: string | null
  configurationConsumedRng: boolean
  admitted: boolean
  shadowReason: string | null
  currentRemainingTicks: number | null
  shadowRemainingTicks: number | null
}

export const FACILITIES_STAFFING_POLICY_ID = 'renew-first-open-retry-weekly-208-v1' as const

export type FacilitiesStaffingBoundary =
  | 'renewal-window-pre'
  | 'renewal-window-post'
  | 'expiry-pre-tick'
  | 'expiry-post-tick'

export type FacilitiesStaffingRow = EvidenceBase & {
  recordType: 'staffing'
  mode: 'current' | 'counterfactual'
  boundary: FacilitiesStaffingBoundary
  staffingPolicyId: typeof FACILITIES_STAFFING_POLICY_ID
  cohortId: string
  expiryWeek: number
  renewalWindowWeek: number
  stateHash: string
  rngState: string
  cash: number
  ledgerTotal: number
  cashReconciliationDelta: number
  activeContracts: number
  activeContractsByRole: Record<CreativeRole, number>
  activeContractTalentIds: string[]
  activeCohortTalentIds: string[]
  activeCohortByRole: Record<CreativeRole, number>
  weeklyPayrollIfAdvanced: number
  weeklyOverheadIfAdvanced: number
  pipeline: {
    scripts: Record<'drafting' | 'review' | 'rewriting' | 'ready' | 'inProduction' | 'produced', number>
    castingSessions: Record<'auditioning' | 'review' | 'complete', number>
    activeProductions: number
    readyPackages: number
    staffingBlockedIntentsAtWeek: number
    capacityBlockedIntentsAtWeek: number
  }
  developmentCasting: {
    capacity: number
    occupied: number
    idle: number
    full: boolean
    ownerSlots: Record<'production' | 'script' | 'casting', number>
  }
  transitionLedgerEntries: LedgerEntry[]
}

export type FacilitiesLeadTime = {
  projectId: string
  commissionedWeek: number
  readyWeek: number | null
  greenlightWeek: number | null
  releaseWeek: number | null
  commissionToReadyWeeks: number | null
  commissionToGreenlightWeeks: number | null
  commissionToReleaseWeeks: number | null
}

export type FacilitiesCapabilitySummary = {
  capacitySlotWeeks: number
  occupiedSlotWeeks: number
  idleSlotWeeks: number
  fullWeeks: number
  longestFullStreak: number
  ownerSlotWeeks: Record<'production' | 'script' | 'casting', number>
}

export type FacilitiesStaffingSnapshot = {
  week: number
  relation:
    | 'renewal-window-eve'
    | 'renewal-window-arrival'
    | 'expiry-eve'
    | 'expiry-arrival'
    | 'post-expiry'
    | 'horizon-arrival'
  activeContracts: number
  initialCohortUnderContract: number
  weeklyPayroll: number
  weeklyOverhead: number
  activeProductions: number
  readyScripts: number
  activeScriptTasks: number
  activeCastingTasks: number
  developmentCastingCapacity: number
  developmentCastingOccupied: number
  developmentCastingFull: boolean
  capacityRejectedIntentsAtWeek: number
  staffingBlockedIntentsAtWeek: number
}

export type FacilitiesStaffingStratum = {
  originalExpiryWeek: number | null
  renewalWindowWeek: number | null
  initialCohortTalentIds: string[]
  initialCohortWeeklyPayroll: number
  renewalAttempts: number
  renewalAcceptances: number
  renewalRejections: number
  renewalAttemptWeeks: number[]
  retainedAtExpiryTalentIds: string[] | null
  releasedAtExpiryTalentIds: string[] | null
  expiryArrivalContractDelta: number | null
  expiryArrivalPayrollDelta: number | null
  snapshots: FacilitiesStaffingSnapshot[]
  boundaryRows: FacilitiesStaffingRow[]
  preExpiryWindow: FacilitiesStaffingWindow | null
  postExpiryWindow: FacilitiesStaffingWindow | null
  interpretation: string
}

export type FacilitiesStaffingWindow = {
  startWeek: number
  endWeekExclusive: number
  observedWeeks: number
  contractSlotWeeks: number
  payrollScheduledTotal: number
  payrollLedgerTotal: number
  overheadScheduledTotal: number
  overheadLedgerTotal: number
  staffingBlockedIntents: number
  capacityBlockedIntents: number
  screenplayCommissionsAccepted: number
  rewritesAccepted: number
  castingSessionsAccepted: number
  greenlightsAccepted: number
  releases: number
  productionHoldWeeks: number
  developmentCasting: FacilitiesCapabilitySummary
}

export type FacilitiesRejectionExposureCounts = {
  fullHorizon: number
  beforeAvailability: number
  fromAvailabilityInclusive: number
}

export type FacilitiesAvailabilityRejectionExposure =
  FacilitiesRejectionExposureCounts & {
    availabilityWeek: number
  }

export type FacilitiesArmSummary = {
  observedWeeks: number
  arrivalWeekObserved: boolean
  initialRoster: Record<CreativeRole, number>
  initialExpiryClusterWeek: number | null
  initialExpiryClusterContracts: number
  finalCash: number
  finalLedgerTotal: number
  finalStateHash: string
  finalRngState: string
  finalWeek: number
  scriptProjects: number
  castingSessions: number
  greenlights: number
  releases: number
  acceptedIntents: number
  rejectedIntents: number
  capacityRejectedIntents: number
  capacityRejectedIntentsByCapability: Record<FacilityCapability, number>
  developmentCastingRejectionExposure: FacilitiesAvailabilityRejectionExposure
  productionHoldWeeks: number
  productionHoldWeeksByCapability: Record<FacilityCapability, number>
  uniqueHeldStudioWeeks: number
  holdDelayExposure: FacilitiesDelayExposure
  oneBoundaryShadows: number
  shadowsAdmitted: number
  shadowsAdmittedByCapability: Record<FacilityCapability, number>
  renewalAttempts: number
  renewalRejections: number
  capability: Record<FacilityCapability, FacilitiesCapabilitySummary>
  leadTimes: FacilitiesLeadTime[]
  staffingStratum: FacilitiesStaffingStratum
}

export type FacilitiesArmResult = {
  schemaVersion: typeof FACILITIES_OBSERVER_SCHEMA_VERSION
  seed: string
  policyId: FacilitiesPolicyId
  mode: 'current' | 'counterfactual'
  armConfiguration: FacilitiesArmConfiguration
  horizonWeeks: number
  facilityManifestId: string
  facilityManifest: FacilitiesManifestEntry[]
  initialSaveHash: string
  initialStateHash: string
  rows: FacilitiesWeeklyRow[]
  intents: FacilitiesIntentRow[]
  shadows: FacilitiesShadowRow[]
  staffingRows: FacilitiesStaffingRow[]
  summary: FacilitiesArmSummary
}

export type FacilitiesDescriptiveOutcomeDelta = {
  interpretation: 'descriptive-after-policy-feedback'
  causal: false
  capacityRejectedIntents: number
  productionHoldWeeks: number
  releases: number
  scriptProjects: number
  castingSessions: number
  finalCash: number
  developmentCastingOccupiedSlotWeeks: number
}

export type FacilitiesPairResult = {
  seed: string
  policyId: FacilitiesPolicyId
  currentArmConfiguration: FacilitiesArmConfiguration
  counterfactualArmConfiguration: FacilitiesArmConfiguration
  currentManifestId: string
  counterfactualManifestId: string
  firstRngDivergenceWeek: number | null
  firstBehaviorDivergenceWeek: number | null
  firstIntentDivergenceWeek: number | null
  delta: FacilitiesDescriptiveOutcomeDelta
}

export type FacilitiesFourthSlotMarginalResult = {
  seed: string
  policyId: FacilitiesPolicyId
  interpretation: 'descriptive-after-policy-feedback'
  causal: false
  fromArmConfiguration: FacilitiesArmConfiguration & { capacityDelta: 1 }
  toArmConfiguration: FacilitiesArmConfiguration & { capacityDelta: 2 }
  fromManifestId: string
  toManifestId: string
  firstRngDivergenceWeek: number | null
  firstBehaviorDivergenceWeek: number | null
  firstIntentDivergenceWeek: number | null
  delta: FacilitiesDescriptiveOutcomeDelta
}

export type FacilitiesAggregatePolicy = {
  policyId: FacilitiesPolicyId
  pairCount: number
  currentDevelopmentCastingRejectedIntents: number
  counterfactualDevelopmentCastingRejectedIntents: number
  developmentCastingRejectionsByAvailability: {
    availabilityWeek: number
    current: FacilitiesRejectionExposureCounts
    counterfactual: FacilitiesRejectionExposureCounts
  }
  admittedDevelopmentCastingBoundaryShadows: number
  currentOtherCapabilityRejectedIntents: number
  counterfactualOtherCapabilityRejectedIntents: number
  currentProductionHoldWeeks: number
  counterfactualProductionHoldWeeks: number
  descriptivePairDeltas: {
    releases: FacilitiesDeltaDistribution
    finalCash: FacilitiesDeltaDistribution
    developmentCastingOccupiedSlotWeeks: FacilitiesDeltaDistribution
  }
}

export type FacilitiesFourthSlotAggregatePolicy = {
  policyId: FacilitiesPolicyId
  pairCount: number
  plusOneDevelopmentCastingRejectedIntents: number
  plusTwoDevelopmentCastingRejectedIntents: number
  plusOneProductionHoldWeeks: number
  plusTwoProductionHoldWeeks: number
  descriptiveFourthSlotDeltas: {
    releases: FacilitiesDeltaDistribution
    finalCash: FacilitiesDeltaDistribution
    developmentCastingOccupiedSlotWeeks: FacilitiesDeltaDistribution
  }
}

export type FacilitiesFourthSlotMarginalAggregate = {
  interpretation: 'descriptive-after-policy-feedback'
  causal: false
  fromCapacityDelta: 1
  toCapacityDelta: 2
  availableWeek: number
  pairCount: number
  policies: FacilitiesFourthSlotAggregatePolicy[]
}

export type FacilitiesDeltaDistribution = {
  interpretation: 'descriptive-after-policy-feedback'
  pairCount: number
  total: number
  mean: number
  median: number
  min: number
  max: number
  negativePairs: number
  zeroPairs: number
  positivePairs: number
}

export type FacilitiesCorpusResult = {
  schemaVersion: typeof FACILITIES_OBSERVER_SCHEMA_VERSION
  provenance: FacilitiesSourceProvenance & {
    saveVersion: 10
    operationsMode: 'managed'
    horizonWeeks: number
    seeds: string[]
    policyIds: FacilitiesPolicyId[]
    maxConcurrentProductions: number
    productionTicks: number
    productionPhaseIdentity: { remainingTicks: number; phase: string }[]
    productionAllocationIdentity: string
    armConfigurations: FacilitiesArmConfiguration[]
    currentFacilityManifest: FacilitiesManifestEntry[]
    counterfactualFacilityManifest: FacilitiesManifestEntry[]
    counterfactualDelta: {
      facilityId: string
      capability: 'development-casting'
      capacityDelta: FacilitiesCapacityDelta
      availableWeek: number
    }
  }
  runs: FacilitiesArmResult[]
  pairs: FacilitiesPairResult[]
  fourthSlotMarginals: FacilitiesFourthSlotMarginalResult[]
  aggregate: {
    runCount: number
    pairCount: number
    policies: FacilitiesAggregatePolicy[]
    fourthSlotMarginal: FacilitiesFourthSlotMarginalAggregate | null
    boundaryStatement: string
  }
}

export type RunFacilitiesArmInput = {
  seed: string
  policyId: FacilitiesPolicyId
  mode: 'current' | 'counterfactual'
  horizonWeeks?: number
  capacityDelta?: FacilitiesCapacityDelta
  availableWeek?: number
  source: FacilitiesSourceProvenance
}

export type RunFacilitiesCorpusInput = {
  seeds: readonly string[]
  policyIds?: readonly FacilitiesPolicyId[]
  horizonWeeks?: number
  capacityDelta?: FacilitiesCapacityDelta
  availableWeek?: number
  source: FacilitiesSourceProvenance
}

type PolicyDefinition = {
  id: FacilitiesPolicyId
  targetActiveProductions: 1 | 2
  targetPipeline: number
  auditions: boolean
  rewriteBelow: number | null
  desiredRoster: Record<CreativeRole, number>
}

const POLICY: Record<FacilitiesPolicyId, PolicyDefinition> = {
  'direct-package': {
    id: 'direct-package',
    targetActiveProductions: 1,
    targetPipeline: 2,
    auditions: false,
    rewriteBelow: null,
    desiredRoster: { actor: 3, director: 1, writer: 2, craft: 1 },
  },
  'development-casting': {
    id: 'development-casting',
    targetActiveProductions: 1,
    targetPipeline: 3,
    auditions: true,
    rewriteBelow: 55,
    desiredRoster: { actor: 3, director: 1, writer: 3, craft: 1 },
  },
  'scaled-two-team': {
    id: 'scaled-two-team',
    targetActiveProductions: 2,
    targetPipeline: 4,
    auditions: true,
    rewriteBelow: 60,
    desiredRoster: { actor: 6, director: 2, writer: 3, craft: 2 },
  },
}

const FACILITY_NAME: Record<FacilityCapability, string> = {
  'development-casting': 'Research-only Development & Casting +1',
  soundstage: 'Research-only Soundstage +1',
  'set-scenery': 'Research-only Scenery +1',
  post: 'Research-only Post +1',
}

const SCRIPT_STATUSES = [
  'drafting',
  'review',
  'rewriting',
  'ready',
  'inProduction',
  'produced',
] as const
const CASTING_STATUSES = ['auditioning', 'review', 'complete'] as const
const ROLES = ['actor', 'director', 'writer', 'craft'] as const

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function stateHash(state: GameState): string {
  return sha256(stableStringify(state))
}

function manifestOf(state: GameState): FacilitiesManifestEntry[] {
  return state.operations.facilities
    .map((facility) => ({
      id: facility.id,
      name: facility.name,
      capability: facility.capability,
      capacity: facility.capacity,
    }))
    .sort((a, b) => compareId(a.id, b.id))
}

function initialManifest(): FacilitiesManifestEntry[] {
  return INITIAL_STUDIO_FACILITIES.map((facility) => ({ ...facility })).sort((a, b) =>
    compareId(a.id, b.id),
  )
}

function manifestId(manifest: readonly FacilitiesManifestEntry[]): string {
  return `facilities-${sha256(stableStringify(manifest)).slice(0, 16)}`
}

function researchFacility(
  capability: FacilityCapability,
  capacityDelta: FacilitiesCapacityDelta = 1,
): StudioFacility {
  const suffix = capacityDelta === 1 ? 'one' : 'two'
  return {
    id: `research-${capability}-plus-${suffix}`,
    name:
      capacityDelta === 1
        ? FACILITY_NAME[capability]
        : FACILITY_NAME[capability].replace(/\+1$/, '+2'),
    capability,
    capacity: capacityDelta,
  }
}

function armConfiguration(
  mode: 'current' | 'counterfactual',
  capacityDelta: FacilitiesCapacityDelta,
  availableWeek: number,
): FacilitiesArmConfiguration {
  if (mode === 'current') {
    return {
      id: 'current-capacity',
      evidenceMode: 'current',
      capacityDelta: 0,
      availableWeek: null,
    }
  }
  return {
    id:
      capacityDelta === 1
        ? 'development-casting-plus-one'
        : 'development-casting-plus-two',
    evidenceMode: 'counterfactual',
    capacityDelta,
    availableWeek,
  }
}

function evaluatedShadowConfiguration(
  capability: FacilityCapability,
  availableWeek: number,
): FacilitiesEvaluatedShadowConfiguration {
  const facility = researchFacility(capability)
  return {
    id: `one-boundary-${capability}-plus-one`,
    evidenceMode: 'one-boundary-shadow',
    capability,
    capacityDelta: 1,
    availableWeek,
    facilityId: facility.id,
  }
}

/**
 * Apply the only permitted research mutation: append one labelled capacity slot.
 * Existing facilities, reservations, cash, ledger, clocks, and RNG are untouched.
 */
export function withResearchCapacity(
  state: GameState,
  capability: FacilityCapability,
  capacityDelta: FacilitiesCapacityDelta = 1,
): GameState {
  const validatedDelta = assertCapacityDelta(capacityDelta)
  const facility = researchFacility(capability, validatedDelta)
  if (state.operations.mode !== 'managed') {
    throw new Error('facilities observatory: research capacity requires managed operations')
  }
  if (state.operations.facilities.some((candidate) => candidate.id === facility.id)) {
    throw new Error(`facilities observatory: research facility "${facility.id}" already exists`)
  }
  return {
    ...state,
    operations: {
      ...state.operations,
      facilities: [...state.operations.facilities, facility],
    },
  }
}

function assertCapacityDelta(value: number): FacilitiesCapacityDelta {
  if (value !== 1 && value !== 2) {
    throw new Error('facilities observatory: capacityDelta must be exactly 1 or 2')
  }
  return value
}

function assertAvailableWeek(value: number, horizonWeeks: number): number {
  if (!Number.isInteger(value) || value < 0 || value > horizonWeeks) {
    throw new Error(
      'facilities observatory: availableWeek must be an integer from 0 through horizonWeeks',
    )
  }
  return value
}

function assertHorizon(value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('facilities observatory: horizonWeeks must be a positive integer')
  }
  return value
}

function assertPolicyId(value: FacilitiesPolicyId): void {
  if (!(FACILITIES_POLICY_IDS as readonly string[]).includes(value)) {
    throw new Error(`facilities observatory: unknown policyId "${String(value)}"`)
  }
}

function roleCount(state: GameState): Record<CreativeRole, number> {
  const active = new Set(
    state.contracts
      .filter(
        (contract) =>
          contract.startWeek <= state.market.tick && state.market.tick < contract.endWeekExclusive,
      )
      .map((contract) => contract.talentId),
  )
  return {
    actor: state.talent.filter((person) => person.role === 'actor' && active.has(person.id)).length,
    director: state.talent.filter(
      (person) => person.role === 'director' && active.has(person.id),
    ).length,
    writer: state.talent.filter((person) => person.role === 'writer' && active.has(person.id)).length,
    craft: state.talent.filter((person) => person.role === 'craft' && active.has(person.id)).length,
  }
}

function applicantsByRole(state: GameState, role: CreativeRole): Talent[] {
  if (state.founding === null) throw new Error('facilities observatory: founding draft is absent')
  const applicantIds = new Set(state.founding.applicantIds)
  return state.talent
    .filter((person) => person.role === role && applicantIds.has(person.id))
    .sort((a, b) => {
      const aOffer = contractOffer(state, a.id, 208)
      const bOffer = contractOffer(state, b.id, 208)
      return aOffer.signingBonus - bOffer.signingBonus || compareId(a.id, b.id)
    })
}

function foundManagedStudio(seed: string, policy: PolicyDefinition): GameState {
  let state = beginFounding(generateWorld(seed))
  const hired = new Set<string>()
  const sign = (person: Talent): boolean => {
    if (state.founding === null) return false
    const offer = contractOffer(state, person.id, 208)
    const remaining = state.founding.budget - state.founding.spentBonus
    if (offer.signingBonus > remaining) return false
    state = applyActions(state, [
      { kind: 'signContract', talentId: person.id, termWeeks: 208 },
    ])
    hired.add(person.id)
    return true
  }

  // Minimums are non-negotiable and receive the cheapest role-local offers first.
  for (const role of ROLES) {
    const candidates = applicantsByRole(state, role)
    for (const person of candidates.slice(0, FOUNDING_MINIMUMS[role])) {
      if (!sign(person)) {
        throw new Error(`facilities observatory: recruitment fund cannot satisfy ${role} minimum`)
      }
    }
  }

  // Extra screenplay capacity is useful to every measured policy; then scale the
  // remaining departments. A skipped extra is recorded implicitly by initialRoster.
  for (const role of ['writer', 'actor', 'director', 'craft'] as const) {
    const desired = policy.desiredRoster[role]
    const candidates = applicantsByRole(state, role).filter((person) => !hired.has(person.id))
    let current = [...hired].filter(
      (id) => state.talent.find((person) => person.id === id)?.role === role,
    ).length
    for (const person of candidates) {
      if (current >= desired) break
      if (sign(person)) current++
    }
  }

  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function capacityFromReason(reason: string): FacilityCapability | null {
  if (/Development & Casting slot|development-casting capacity/i.test(reason)) {
    return 'development-casting'
  }
  if (/soundstage capacity/i.test(reason)) return 'soundstage'
  if (/set-scenery capacity|scenery capacity/i.test(reason)) return 'set-scenery'
  if (/post capacity/i.test(reason)) return 'post'
  return null
}

type Milestone = {
  projectId: string
  commissionedWeek: number
  readyWeek: number | null
  greenlightWeek: number | null
  releaseWeek: number | null
}

type ArmRuntime = {
  state: GameState
  mode: 'current' | 'counterfactual'
  armConfiguration: FacilitiesArmConfiguration
  seed: string
  policy: PolicyDefinition
  horizonWeeks: number
  initialSaveHash: string
  manifest: FacilitiesManifestEntry[]
  manifestId: string
  counterfactualCapacityDelta: FacilitiesCapacityDelta
  counterfactualAvailableWeek: number
  counterfactualActivated: boolean
  source: FacilitiesSourceProvenance
  captureEvidence: boolean
  initialCohort: {
    talentId: string
    endWeekExclusive: number
    weeklySalary: number
  }[]
  rows: FacilitiesWeeklyRow[]
  intents: FacilitiesIntentRow[]
  shadows: FacilitiesShadowRow[]
  staffingRows: FacilitiesStaffingRow[]
  milestones: Map<string, Milestone>
  // Contains accepted renewal identities only. Rejections retry once per later
  // legal week through expiry under FACILITIES_STAFFING_POLICY_ID.
  attemptedRenewals: Set<string>
}

function evidenceBase(
  runtime: ArmRuntime,
  recordType: EvidenceBase['recordType'],
  mode: FacilitiesEvidenceMode = runtime.mode,
  manifest: FacilitiesManifestEntry[] = runtime.manifest,
  week: number = runtime.state.market.tick,
): EvidenceBase {
  return {
    schemaVersion: FACILITIES_OBSERVER_SCHEMA_VERSION,
    recordType,
    mode,
    armConfiguration: { ...runtime.armConfiguration },
    seed: runtime.seed,
    policyId: runtime.policy.id,
    horizonWeeks: runtime.horizonWeeks,
    week,
    facilityManifestId: manifestId(manifest),
    facilityManifest: manifest.map((facility) => ({ ...facility })),
    initialSaveHash: runtime.initialSaveHash,
    sourceCommit: runtime.source.sourceCommit,
    sourceTree: runtime.source.sourceTree,
    worktreeDirty: runtime.source.worktreeDirty,
    runtime: runtime.source.runtime,
  }
}

function shadowEvidenceBase(
  runtime: ArmRuntime,
  capability: FacilityCapability,
  manifest: FacilitiesManifestEntry[],
  week: number = runtime.state.market.tick,
): FacilitiesShadowEvidenceBase {
  const { armConfiguration: sourceArmConfiguration, ...base } = evidenceBase(
    runtime,
    'shadow',
    'one-boundary-shadow',
    manifest,
    week,
  )
  return {
    ...base,
    sourceArmConfiguration,
    evaluatedShadowConfiguration: evaluatedShadowConfiguration(capability, week),
  }
}

function behaviorHash(state: GameState): string {
  const comparable: GameState = {
    ...state,
    operations: {
      ...state.operations,
      facilities: state.operations.facilities.filter(
        (facility) => !facility.id.startsWith('research-'),
      ),
    },
  }
  return stateHash(comparable)
}

function blockerKindFromReason(
  reason: string,
  capability: FacilityCapability | null,
): FacilitiesIntentRow['blockerKind'] {
  if (capability !== null) return 'capacity'
  if (/talent|writer|actor|director|craft|contract|freelancer|staff|roster|busy/i.test(reason)) {
    return 'staffing'
  }
  if (/afford|cash|solvency/i.test(reason)) return 'affordability'
  if (/review|ready|session|already owns|active production|capacity \(/i.test(reason)) {
    return 'lifecycle'
  }
  return 'other'
}

function shadowActionRejection(
  runtime: ArmRuntime,
  action: Action,
  ownerId: string,
  capability: FacilityCapability,
  shadowId: string,
  currentState: GameState,
): FacilitiesShadowRow {
  const currentHash = stateHash(currentState)
  const configured = withResearchCapacity(structuredClone(currentState), capability)
  const configuredHash = stateHash(configured)
  const rngBefore = currentState.rngState
  let admitted = false
  let shadowReason: string | null = null
  let shadowStateHash: string | null = null
  try {
    const shadowState = applyActions(configured, [structuredClone(action)])
    // C2a-M4: the shadow asks "would ONE more slot have admitted this?", so an
    // intent that merely joined the queue in the shadow world is not an
    // admission — the extra capacity did not relieve it.
    admitted = shadowState.productionQueue.length === configured.productionQueue.length
    shadowStateHash = stateHash(shadowState)
  } catch (error) {
    shadowReason = errorMessage(error)
  }
  const manifest = manifestOf(configured)
  return {
    ...shadowEvidenceBase(runtime, capability, manifest),
    recordType: 'shadow',
    mode: 'one-boundary-shadow',
    shadowId,
    boundaryKind: 'action-rejection',
    capability,
    ownerId,
    exactAction: structuredClone(action),
    currentStateHash: currentHash,
    configuredStateHash: configuredHash,
    shadowStateHash,
    configurationConsumedRng: configured.rngState !== rngBefore,
    admitted,
    shadowReason,
    currentRemainingTicks: null,
    shadowRemainingTicks: null,
  }
}

type AttemptResult = { accepted: boolean; capability: FacilityCapability | null }

function attemptAction(
  runtime: ArmRuntime,
  intentKind: FacilitiesIntentKind,
  ownerId: string,
  action: Action,
): AttemptResult {
  const intentId = `${runtime.seed}:${runtime.policy.id}:${runtime.armConfiguration.id}:${String(runtime.state.market.tick)}:intent-${String(runtime.intents.length).padStart(5, '0')}`
  const before = runtime.state
  let accepted = false
  let reason: string | null = null
  let capability: FacilityCapability | null = null
  try {
    const next = applyActions(before, [action])
    // ── C2a-M4: THIS OBSERVATORY DOES NOT QUEUE (charter §3.3, §11.8 item 10) ──
    //
    // The front doors now admit what they used to refuse (§3.3), and this
    // instrument's whole subject is what a studio CANNOT do in a given week —
    // its one-boundary shadow rows exist to prove that a refusal was capacity and
    // nothing else. A queued intent would erase the very boundary being measured.
    // So the arm declines the wait, rolls the admission back whole (nothing was
    // held while queued, so nothing is released), and records the refusal it has
    // always recorded. The C1 economy figures this instrument produced stay
    // reproducible for exactly this reason.
    if (next.productionQueue.length > before.productionQueue.length) {
      const queued = next.productionQueue[next.productionQueue.length - 1]!
      reason = `${queued.kind} declined the queue — no Development & Casting slot is available (C2a-M4 §3.3; this observatory does not queue)`
      capability = capacityFromReason(reason)
    } else {
      runtime.state = next
      accepted = true
    }
  } catch (error) {
    reason = errorMessage(error)
    capability = capacityFromReason(reason)
  }
  let shadowId: string | null = null
  if (
    runtime.captureEvidence &&
    !accepted &&
    capability !== null &&
    runtime.mode === 'current'
  ) {
    shadowId = `${intentId}:shadow`
    runtime.shadows.push(
      shadowActionRejection(runtime, action, ownerId, capability, shadowId, before),
    )
  }
  if (runtime.captureEvidence) {
    runtime.intents.push({
      ...evidenceBase(runtime, 'intent'),
      recordType: 'intent',
      mode: runtime.mode,
      intentId,
      intentKind,
      ownerId,
      action: structuredClone(action),
      accepted,
      reason,
      capacityBound: capability !== null,
      capability,
      blockerKind: reason === null ? null : blockerKindFromReason(reason, capability),
      targetPhase: null,
      shadowId,
      delayExposure: null,
    })
  }
  return { accepted, capability }
}

function recordUnavailableIntent(
  runtime: ArmRuntime,
  intentKind: FacilitiesIntentKind,
  ownerId: string,
  reason: string,
): void {
  if (!runtime.captureEvidence) return
  const intentId = `${runtime.seed}:${runtime.policy.id}:${runtime.armConfiguration.id}:${String(runtime.state.market.tick)}:intent-${String(runtime.intents.length).padStart(5, '0')}`
  runtime.intents.push({
    ...evidenceBase(runtime, 'intent'),
    recordType: 'intent',
    mode: runtime.mode,
    intentId,
    intentKind,
    ownerId,
    action: null,
    accepted: false,
    reason,
    capacityBound: false,
    capability: null,
    blockerKind: blockerKindFromReason(reason, null),
    targetPhase: null,
    shadowId: null,
    delayExposure: null,
  })
}

function projectById(state: GameState, projectId: string): ScriptProject {
  const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === projectId)
  if (project === undefined) {
    throw new Error(`facilities observatory: unknown screenplay project "${projectId}"`)
  }
  return project
}

function resolveDecisions(runtime: ArmRuntime): void {
  for (let guard = 0; guard < 100; guard++) {
    const decision = nextStudioDecision(runtime.state)
    if (decision === null) return
    if (decision.kind === 'scriptReview') {
      const project = projectById(runtime.state, decision.projectId)
      const rewrite =
        runtime.policy.rewriteBelow !== null &&
        project.rewriteCount === 0 &&
        project.assessment !== null &&
        project.assessment.perceivedStrength < runtime.policy.rewriteBelow
      const action: Action = rewrite
        ? { kind: 'requestScriptRewrite', projectId: project.id }
        : { kind: 'acceptScript', projectId: project.id }
      const result = attemptAction(
        runtime,
        rewrite ? 'script-rewrite' : 'script-accept',
        project.id,
        action,
      )
      if (!result.accepted) return
      if (!rewrite) {
        const milestone = runtime.milestones.get(project.id)
        if (milestone !== undefined && milestone.readyWeek === null) {
          milestone.readyWeek = runtime.state.market.tick
        }
      }
      continue
    }
    if (decision.kind === 'castingReview') {
      const result = attemptAction(
        runtime,
        'casting-acknowledgement',
        decision.sessionId,
        { kind: 'acknowledgeCastingSession', sessionId: decision.sessionId },
      )
      if (!result.accepted) return
      continue
    }
    const result = attemptAction(
      runtime,
      'production-operation',
      decision.productionId,
      decision.command,
    )
    if (!result.accepted) return
  }
  throw new Error('facilities observatory: decision-resolution guard exhausted')
}

function availableRoleTalent(
  state: GameState,
  role: CreativeRole,
  excluded: ReadonlySet<string>,
): Talent[] {
  const busy = busyTalentIds(state)
  const market = new Set(freelancerMarketIds(state))
  return state.talent
    .filter(
      (person) =>
        person.role === role &&
        !excluded.has(person.id) &&
        !busy.has(person.id) &&
        (isContracted(state, person.id) || market.has(person.id)),
    )
    .sort((a, b) => {
      const aContracted = isContracted(state, a.id)
      const bContracted = isContracted(state, b.id)
      if (aContracted !== bContracted) return aContracted ? -1 : 1
      const feeDelta = (aContracted ? 0 : freelancerFee(state, a)) - (bContracted ? 0 : freelancerFee(state, b))
      return feeDelta || compareId(a.id, b.id)
    })
}

function castingSlate(
  state: GameState,
  project: ScriptProject,
): CastingSlate | null {
  const actors = availableRoleTalent(state, 'actor', new Set([project.writerId]))
  if (actors.length < 3) return null
  return {
    lead: [actors[0]!.id, actors[1]!.id],
    antagonist: [actors[0]!.id, actors[2]!.id],
    support: [actors[1]!.id, actors[2]!.id],
  }
}

type PackageCastResult =
  | { ok: true; cast: Record<CastSlot, Talent> }
  | { ok: false; reason: string }

function packageCast(
  state: GameState,
  project: ScriptProject,
  actors: readonly Talent[],
): PackageCastResult {
  const session: CastingSession | undefined = state.castingSessions.sessions.find(
    (candidate) => candidate.projectId === project.id,
  )
  if (session?.status !== 'complete') {
    if (actors.length < 3) {
      return {
        ok: false,
        reason: `Package for ${project.id} needs three currently assignable primary Actors; ${String(actors.length)} are available`,
      }
    }
    return {
      ok: true,
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
    }
  }
  if (session.results === null) {
    throw new Error(`facilities observatory: complete casting session "${session.id}" has no results`)
  }
  const available = new Map(actors.map((actor) => [actor.id, actor]))
  const candidates: {
    cast: Record<CastSlot, Talent>
    estimate: number
    fee: number
    key: string
  }[] = []
  for (const lead of session.results.lead) {
    for (const antagonist of session.results.antagonist) {
      for (const support of session.results.support) {
        if (new Set([lead.talentId, antagonist.talentId, support.talentId]).size !== 3) continue
        const leadTalent = available.get(lead.talentId)
        const antagonistTalent = available.get(antagonist.talentId)
        const supportTalent = available.get(support.talentId)
        if (
          leadTalent === undefined ||
          antagonistTalent === undefined ||
          supportTalent === undefined
        ) {
          continue
        }
        const cast = {
          lead: leadTalent,
          antagonist: antagonistTalent,
          support: supportTalent,
        }
        const fee = Object.values(cast).reduce(
          (total, actor) => total + (isContracted(state, actor.id) ? 0 : freelancerFee(state, actor)),
          0,
        )
        candidates.push({
          cast,
          estimate: lead.estimate + antagonist.estimate + support.estimate,
          fee,
          key: `${lead.talentId}|${antagonist.talentId}|${support.talentId}`,
        })
      }
    }
  }
  candidates.sort(
    (a, b) => b.estimate - a.estimate || a.fee - b.fee || compareId(a.key, b.key),
  )
  const selected = candidates[0]
  if (selected === undefined) {
    return {
      ok: false,
      reason: `Camera-test evidence for ${project.id} has no currently assignable three-Actor slate combination`,
    }
  }
  return { ok: true, cast: selected.cast }
}

type PackageBuildResult =
  | { ok: true; production: GreenlightScriptProjectPayload }
  | { ok: false; reason: string }

function packageForReadyProject(
  state: GameState,
  project: ScriptProject,
): PackageBuildResult {
  if (project.status !== 'ready' || project.assessment === null) {
    return { ok: false, reason: `Screenplay ${project.id} is not an assessed Ready project` }
  }
  const excluded = new Set([project.writerId])
  const directors = availableRoleTalent(state, 'director', excluded)
  const craft = availableRoleTalent(state, 'craft', excluded)
  const actors = availableRoleTalent(state, 'actor', excluded)
  if (directors.length < 1) {
    return { ok: false, reason: `Package for ${project.id} has no assignable primary Director` }
  }
  if (craft.length < 1) {
    return { ok: false, reason: `Package for ${project.id} has no assignable primary Craft lead` }
  }
  const castResult = packageCast(state, project, actors)
  if (!castResult.ok) return castResult
  const concept = state.concepts.find((candidate) => candidate.id === project.conceptId)
  const writer = state.talent.find((person) => person.id === project.writerId)
  if (concept === undefined || writer === undefined) {
    throw new Error(`facilities observatory: ${project.id} lost its concept or writer authority`)
  }
  const castTalent = castResult.cast
  const multiplier = NEGATIVE_BUDGET_MULTIPLIERS[0]!
  const negative =
    multiplier * concept.baseNegativeCost * resolveShape(project.shape).budgetDemandMultiplier * state.era.costScale
  const inputs: ReceptionInputs = {
    concept,
    shape: project.shape,
    shapeEffects: resolveShape(project.shape),
    promise: project.promise,
    budget: { negative, marketing: 0 },
    writer,
    director: directors[0]!,
    cast: castTalent,
    craftHires: [craft[0]!],
    market: state.market,
    standing: state.studio.standing,
    era: state.era,
    scriptStrengthOverride: {
      perceived: readyScriptPerceivedStrength(state.scriptDevelopment, project.id),
    },
  }
  const marketing = marketingLevelsFor(state, inputs)[0]
  return {
    ok: true,
    production: {
      projectId: project.id,
      directorId: directors[0]!.id,
      craftIds: [craft[0]!.id],
      cast: {
        lead: castTalent.lead.id,
        antagonist: castTalent.antagonist.id,
        support: castTalent.support.id,
      },
      budget: { negative, marketing },
    },
  }
}

function attemptRenewals(runtime: ArmRuntime): void {
  const contracts = [...runtime.state.contracts].sort(
    (a, b) =>
      a.endWeekExclusive - b.endWeekExclusive || compareId(a.talentId, b.talentId),
  )
  for (const contract of contracts) {
    if (!renewalWindowOpen(contract, runtime.state.market.tick)) continue
    const key = `${contract.talentId}:${String(contract.endWeekExclusive)}`
    if (runtime.attemptedRenewals.has(key)) continue
    const result = attemptAction(runtime, 'contract-renewal', contract.talentId, {
      kind: 'renewContract',
      talentId: contract.talentId,
      termWeeks: 208,
    })
    if (result.accepted) runtime.attemptedRenewals.add(key)
  }
}

function readyProjects(state: GameState): ScriptProject[] {
  return state.scriptDevelopment.projects
    .filter((project) => project.status === 'ready')
    .sort((a, b) => compareId(a.id, b.id))
}

function sessionForProject(state: GameState, projectId: string) {
  return state.castingSessions.sessions.find((session) => session.projectId === projectId)
}

function attemptGreenlights(runtime: ArmRuntime): void {
  for (const project of readyProjects(runtime.state)) {
    if (runtime.state.studio.activeProductions.length >= runtime.policy.targetActiveProductions) return
    const session = sessionForProject(runtime.state, project.id)
    if (runtime.policy.auditions && session?.status !== 'complete') continue
    const packageResult = packageForReadyProject(runtime.state, project)
    if (!packageResult.ok) {
      recordUnavailableIntent(
        runtime,
        'production-greenlight',
        project.id,
        packageResult.reason,
      )
      continue
    }
    const beforeProductionIds = new Set(
      runtime.state.studio.activeProductions.map((candidate) => candidate.id),
    )
    const result = attemptAction(runtime, 'production-greenlight', project.id, {
      kind: 'greenlightScriptProject',
      production: packageResult.production,
    })
    if (!result.accepted) return
    const newProduction = runtime.state.studio.activeProductions.find(
      (candidate) => !beforeProductionIds.has(candidate.id),
    )
    const milestone = runtime.milestones.get(project.id)
    if (milestone !== undefined) milestone.greenlightWeek = runtime.state.market.tick
    if (newProduction === undefined) {
      throw new Error('facilities observatory: accepted greenlight created no production')
    }
  }
}

function attemptCasting(runtime: ArmRuntime): void {
  if (!runtime.policy.auditions) return
  for (const project of readyProjects(runtime.state)) {
    if (sessionForProject(runtime.state, project.id) !== undefined) continue
    const slate = castingSlate(runtime.state, project)
    if (slate === null) {
      recordUnavailableIntent(
        runtime,
        'casting-session',
        project.id,
        `Camera tests for ${project.id} need three currently assignable primary Actors`,
      )
      continue
    }
    const result = attemptAction(runtime, 'casting-session', project.id, {
      kind: 'startCastingSession',
      session: { projectId: project.id, slate },
    })
    if (!result.accepted && result.capability !== null) return
  }
}

function unusedConcepts(state: GameState) {
  const used = new Set(state.scriptDevelopment.projects.map((project) => project.conceptId))
  return state.concepts
    .filter((concept) => !used.has(concept.id))
    .sort(
      (a, b) =>
        a.baseNegativeCost - b.baseNegativeCost || compareId(a.id, b.id),
    )
}

function commissionPayload(
  state: GameState,
  writerId: string,
): CommissionScriptPayload | null {
  const concept = unusedConcepts(state)[0]
  if (concept === undefined) return null
  return {
    conceptId: concept.id,
    writerId,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [0, 0.8],
        kineticEnergy: [-0.7, 0.2],
      },
    },
  }
}

function attemptCommissions(runtime: ArmRuntime): void {
  const outstanding = (): number =>
    runtime.state.scriptDevelopment.projects.filter(
      (project) => project.status !== 'inProduction' && project.status !== 'produced',
    ).length
  while (outstanding() < runtime.policy.targetPipeline) {
    const busy = busyTalentIds(runtime.state)
    const writers = runtime.state.talent
      .filter(
        (person) =>
          person.role === 'writer' &&
          isContracted(runtime.state, person.id) &&
          !busy.has(person.id),
      )
      .sort((a, b) => compareId(a.id, b.id))
    const writer = writers[0]
    if (writer === undefined) {
      recordUnavailableIntent(
        runtime,
        'script-commission',
        'pipeline',
        'Desired screenplay commission has no currently contracted, unassigned primary Writer',
      )
      return
    }
    const project = commissionPayload(runtime.state, writer.id)
    if (project === null) {
      recordUnavailableIntent(
        runtime,
        'script-commission',
        'pipeline',
        'Desired screenplay commission has no unused Film Concept remaining',
      )
      return
    }
    const priorIds = new Set(runtime.state.scriptDevelopment.projects.map((candidate) => candidate.id))
    const result = attemptAction(runtime, 'script-commission', project.conceptId, {
      kind: 'commissionScript',
      project,
    })
    if (!result.accepted) return
    const created = runtime.state.scriptDevelopment.projects.find(
      (candidate) => !priorIds.has(candidate.id),
    )
    if (created === undefined) {
      throw new Error('facilities observatory: accepted commission created no project')
    }
    runtime.milestones.set(created.id, {
      projectId: created.id,
      commissionedWeek: created.commissionedWeek,
      readyWeek: null,
      greenlightWeek: null,
      releaseWeek: null,
    })
  }
}

function driveWeek(runtime: ArmRuntime): void {
  resolveDecisions(runtime)
  const staffingWeeks = staffingBoundaryWeeks(runtime)
  const atRenewalWindow =
    staffingWeeks !== null && runtime.state.market.tick === staffingWeeks.renewalWindowWeek
  const renewalLedgerStart = runtime.state.ledger.length
  if (atRenewalWindow) captureStaffingBoundary(runtime, 'renewal-window-pre', [])
  attemptRenewals(runtime)
  if (atRenewalWindow) {
    captureStaffingBoundary(
      runtime,
      'renewal-window-post',
      runtime.state.ledger.slice(renewalLedgerStart),
    )
  }
  attemptGreenlights(runtime)
  attemptCasting(runtime)
  // A completed camera-test decision can open a package in the same week only at the
  // start-of-week decision pass. Fresh camera tests correctly consume their full week.
  attemptCommissions(runtime)
}

function countByStatus<T extends string>(
  statuses: readonly T[],
  values: readonly T[],
): Record<T, number> {
  const out = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<T, number>
  for (const value of values) out[value]++
  return out
}

function staffingBoundaryWeeks(runtime: ArmRuntime): {
  expiryWeek: number
  renewalWindowWeek: number
} | null {
  if (runtime.initialCohort.length === 0) return null
  const expiryWeeks = new Set(
    runtime.initialCohort.map((contract) => contract.endWeekExclusive),
  )
  if (expiryWeeks.size !== 1) {
    throw new Error(
      'facilities observatory: governed staffing cohort does not share one expiry week',
    )
  }
  const expiryWeek = runtime.initialCohort[0]!.endWeekExclusive
  return {
    expiryWeek,
    renewalWindowWeek: expiryWeek - TUNING.HIRING_RENEWAL_WINDOW_WEEKS,
  }
}

function cohortId(runtime: ArmRuntime): string {
  return `staffing-cohort-${sha256(
    stableStringify(
      runtime.initialCohort
        .map((contract) => ({ ...contract }))
        .sort((a, b) => compareId(a.talentId, b.talentId)),
    ),
  ).slice(0, 16)}`
}

function activeContractsByRole(
  state: GameState,
  talentIds?: ReadonlySet<string>,
): Record<CreativeRole, number> {
  const counts: Record<CreativeRole, number> = { actor: 0, director: 0, writer: 0, craft: 0 }
  for (const contract of state.contracts) {
    if (!(contract.startWeek <= state.market.tick && state.market.tick < contract.endWeekExclusive)) {
      continue
    }
    if (talentIds !== undefined && !talentIds.has(contract.talentId)) continue
    const person = state.talent.find((candidate) => candidate.id === contract.talentId)
    if (person === undefined) {
      throw new Error(`facilities observatory: contract references unknown talent "${contract.talentId}"`)
    }
    counts[person.role]++
  }
  return counts
}

function captureStaffingBoundary(
  runtime: ArmRuntime,
  boundary: FacilitiesStaffingBoundary,
  transitionLedgerEntries: readonly LedgerEntry[],
): void {
  if (!runtime.captureEvidence) return
  const weeks = staffingBoundaryWeeks(runtime)
  if (weeks === null) return
  const calendar = studioCalendar(runtime.state)
  const ledgerTotal = runtime.state.ledger.reduce((sum, entry) => sum + entry.amount, 0)
  const cashReconciliationDelta = runtime.state.studio.cash - (TUNING.INITIAL_CASH + ledgerTotal)
  if (Math.abs(cashReconciliationDelta) > 1e-6) {
    throw new Error(
      `facilities observatory: staffing boundary ${boundary} failed cash reconciliation`,
    )
  }
  const cohortIds = new Set(runtime.initialCohort.map((contract) => contract.talentId))
  const activeContracts = runtime.state.contracts
    .filter(
      (contract) =>
        contract.startWeek <= runtime.state.market.tick &&
        runtime.state.market.tick < contract.endWeekExclusive,
    )
    .sort((a, b) => compareId(a.talentId, b.talentId))
  const activeContractTalentIds = activeContracts.map((contract) => contract.talentId)
  const activeCohortTalentIds = activeContractTalentIds.filter((talentId) =>
    cohortIds.has(talentId),
  )
  const developmentCasting = calendar.facilities.filter(
    (facility) => facility.capability === 'development-casting',
  )
  const capacity = developmentCasting.reduce((sum, facility) => sum + facility.capacity, 0)
  const occupied = developmentCasting.reduce((sum, facility) => sum + facility.occupied, 0)
  const ownerSlots = { production: 0, script: 0, casting: 0 }
  for (const facility of developmentCasting) {
    for (const slot of facility.slots) {
      if (slot.occupant !== null) ownerSlots[slot.occupant.owner]++
    }
  }
  const scripts = countByStatus(
    SCRIPT_STATUSES,
    runtime.state.scriptDevelopment.projects.map((project) => project.status),
  )
  const castingSessions = countByStatus(
    CASTING_STATUSES,
    runtime.state.castingSessions.sessions.map((session) => session.status),
  )
  const readyPackages = readyProjects(runtime.state).filter((project) => {
    const session = sessionForProject(runtime.state, project.id)
    if (session !== undefined && session.status !== 'complete') return false
    return packageForReadyProject(runtime.state, project).ok
  }).length
  runtime.staffingRows.push({
    ...evidenceBase(runtime, 'staffing'),
    recordType: 'staffing',
    mode: runtime.mode,
    boundary,
    staffingPolicyId: FACILITIES_STAFFING_POLICY_ID,
    cohortId: cohortId(runtime),
    expiryWeek: weeks.expiryWeek,
    renewalWindowWeek: weeks.renewalWindowWeek,
    stateHash: stateHash(runtime.state),
    rngState: runtime.state.rngState,
    cash: runtime.state.studio.cash,
    ledgerTotal,
    cashReconciliationDelta,
    activeContracts: activeContracts.length,
    activeContractsByRole: activeContractsByRole(runtime.state),
    activeContractTalentIds,
    activeCohortTalentIds,
    activeCohortByRole: activeContractsByRole(runtime.state, cohortIds),
    weeklyPayrollIfAdvanced: weeklyPayroll(runtime.state),
    weeklyOverheadIfAdvanced: weeklyOverhead(runtime.state),
    pipeline: {
      scripts,
      castingSessions,
      activeProductions: runtime.state.studio.activeProductions.length,
      readyPackages,
      staffingBlockedIntentsAtWeek: runtime.intents.filter(
        (intent) =>
          intent.week === runtime.state.market.tick && intent.blockerKind === 'staffing',
      ).length,
      capacityBlockedIntentsAtWeek: runtime.intents.filter(
        (intent) => intent.week === runtime.state.market.tick && intent.capacityBound,
      ).length,
    },
    developmentCasting: {
      capacity,
      occupied,
      idle: capacity - occupied,
      full: capacity > 0 && occupied === capacity,
      ownerSlots,
    },
    transitionLedgerEntries: transitionLedgerEntries.map((entry) => ({ ...entry })),
  })
}

function observeWeek(
  runtime: ArmRuntime,
  sampleKind: FacilitiesWeeklyRow['sampleKind'],
): void {
  const calendar = studioCalendar(runtime.state)
  const ledgerTotal = runtime.state.ledger.reduce((sum, entry) => sum + entry.amount, 0)
  const expectedCash = TUNING.INITIAL_CASH + ledgerTotal
  const delta = runtime.state.studio.cash - expectedCash
  if (Math.abs(delta) > 1e-6) {
    throw new Error(
      `facilities observatory: cash failed ledger reconciliation at week ${String(runtime.state.market.tick)} by ${String(delta)}`,
    )
  }
  const facilities: FacilitiesWeeklyFacility[] = calendar.facilities.map((facility) => {
    const ownerSlots = { production: 0, script: 0, casting: 0 }
    for (const slot of facility.slots) {
      if (slot.occupant !== null) ownerSlots[slot.occupant.owner]++
    }
    return {
      id: facility.facilityId,
      name: facility.facilityName,
      capability: facility.capability,
      capacity: facility.capacity,
      occupied: facility.occupied,
      idle: facility.available,
      full: facility.occupied === facility.capacity,
      ownerSlots,
    }
  })
  runtime.rows.push({
    ...evidenceBase(runtime, 'weekly'),
    recordType: 'weekly',
    mode: runtime.mode,
    sampleKind,
    behaviorHash: behaviorHash(runtime.state),
    stateHash: stateHash(runtime.state),
    rngState: runtime.state.rngState,
    cash: runtime.state.studio.cash,
    ledgerTotal,
    cashReconciliationDelta: delta,
    weeklyPayroll: weeklyPayroll(runtime.state),
    weeklyOverhead: weeklyOverhead(runtime.state),
    activeRunReceipts: expectedWeeklyRunRevenue(runtime.state),
    activeProductions: runtime.state.studio.activeProductions.length,
    releasedFilms: runtime.state.studio.releasedFilms.length,
    activeContracts: calendar.summary.activeContracts,
    activeContractIds: calendar.staffingHorizon.contracts.map((contract) => contract.talentId),
    renewalOpenContracts: calendar.staffingHorizon.contracts.filter(
      (contract) => contract.renewalOpen,
    ).length,
    expiryClusterWeek: calendar.staffingHorizon.busiestExpiry?.week ?? null,
    expiryClusterContracts: calendar.staffingHorizon.busiestExpiry?.contractCount ?? 0,
    scripts: countByStatus(
      SCRIPT_STATUSES,
      runtime.state.scriptDevelopment.projects.map((project) => project.status),
    ),
    castingSessions: countByStatus(
      CASTING_STATUSES,
      runtime.state.castingSessions.sessions.map((session) => session.status),
    ),
    facilities,
  })
}

function recordProductionHolds(
  runtime: ArmRuntime,
  beforeTick: GameState,
  afterTick: GameState,
): void {
  if (!runtime.captureEvidence) return
  const holdWeek = beforeTick.market.tick
  const payroll = weeklyPayroll(beforeTick, holdWeek)
  const overhead = weeklyOverhead(beforeTick)
  const activeRunReceipts = expectedWeeklyRunRevenue(beforeTick)
  const delayExposure: FacilitiesDelayExposure = {
    payroll,
    overhead,
    activeRunReceipts,
    netCommittedBurn: payroll + overhead - activeRunReceipts,
  }
  for (const workflow of afterTick.operations.workflows) {
    const blocker = workflow.blocker
    if (blocker?.kind !== 'facility-capacity') continue
    const production = afterTick.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )
    if (production === undefined) continue
    let shadowId: string | null = null
    if (runtime.mode === 'current') {
      shadowId = `${runtime.seed}:${runtime.policy.id}:current:${String(beforeTick.market.tick)}:hold:${workflow.productionId}:${blocker.capability}`
      const currentHash = stateHash(beforeTick)
      const configured = withResearchCapacity(
        structuredClone(beforeTick),
        blocker.capability,
      )
      const configuredHash = stateHash(configured)
      let shadowStateHash: string | null = null
      let shadowReason: string | null = null
      let shadowRemainingTicks: number | null = null
      let admitted = false
      try {
        const shadow = tick(configured)
        shadowStateHash = stateHash(shadow)
        const shadowProduction = shadow.studio.activeProductions.find(
          (candidate) => candidate.id === workflow.productionId,
        )
        shadowRemainingTicks = shadowProduction?.remainingTicks ?? null
        admitted =
          shadowProduction === undefined || shadowProduction.remainingTicks < production.remainingTicks
      } catch (error) {
        shadowReason = errorMessage(error)
      }
      const shadowManifest = manifestOf(configured)
      runtime.shadows.push({
        ...shadowEvidenceBase(runtime, blocker.capability, shadowManifest, holdWeek),
        recordType: 'shadow',
        mode: 'one-boundary-shadow',
        shadowId,
        boundaryKind: 'production-hold',
        capability: blocker.capability,
        ownerId: workflow.productionId,
        exactAction: null,
        currentStateHash: currentHash,
        configuredStateHash: configuredHash,
        shadowStateHash,
        configurationConsumedRng: configured.rngState !== beforeTick.rngState,
        admitted,
        shadowReason,
        currentRemainingTicks: production.remainingTicks,
        shadowRemainingTicks,
      })
    }
    runtime.intents.push(
      createFacilitiesProductionHoldIntent({
        base: {
          ...evidenceBase(runtime, 'intent', runtime.mode, runtime.manifest, holdWeek),
          recordType: 'intent',
          mode: runtime.mode,
        },
        workflow: { ...workflow, blocker },
        shadowId,
        delayExposure,
      }),
    )
  }
}

/** Build the exact structured intent row used by the production-hold recorder. */
export function createFacilitiesProductionHoldIntent(input: {
  base: FacilitiesProductionHoldIntentBase
  workflow: FacilitiesHeldWorkflow
  shadowId: string | null
  delayExposure: FacilitiesDelayExposure
}): FacilitiesIntentRow {
  const { base, workflow, shadowId, delayExposure } = input
  return {
    ...base,
    intentId: `${base.seed}:${base.policyId}:${base.armConfiguration.id}:${String(base.week)}:transition:${workflow.productionId}`,
    intentKind: 'production-transition',
    ownerId: workflow.productionId,
    action: null,
    accepted: false,
    reason: `Production held entering ${workflow.blocker.targetPhase}: no ${workflow.blocker.capability} capacity`,
    capacityBound: true,
    capability: workflow.blocker.capability,
    blockerKind: 'capacity',
    targetPhase: workflow.blocker.targetPhase,
    shadowId,
    delayExposure,
  }
}

function updateReleases(runtime: ArmRuntime): void {
  for (const project of runtime.state.scriptDevelopment.projects) {
    if (project.productionId === null) continue
    const release = runtime.state.studio.releasedFilms.find(
      (film) => film.productionId === project.productionId,
    )
    if (release === undefined) continue
    const milestone = runtime.milestones.get(project.id)
    if (milestone !== undefined && milestone.releaseWeek === null) {
      milestone.releaseWeek = release.releaseTick
    }
  }
}

function emptyCapabilitySummary(): Record<FacilityCapability, FacilitiesCapabilitySummary> {
  const make = (): FacilitiesCapabilitySummary => ({
    capacitySlotWeeks: 0,
    occupiedSlotWeeks: 0,
    idleSlotWeeks: 0,
    fullWeeks: 0,
    longestFullStreak: 0,
    ownerSlotWeeks: { production: 0, script: 0, casting: 0 },
  })
  return {
    'development-casting': make(),
    soundstage: make(),
    'set-scenery': make(),
    post: make(),
  }
}

function summarizeCapabilities(rows: readonly FacilitiesWeeklyRow[]) {
  const summary = emptyCapabilitySummary()
  const streak: Record<FacilityCapability, number> = {
    'development-casting': 0,
    soundstage: 0,
    'set-scenery': 0,
    post: 0,
  }
  for (const row of rows.filter((candidate) => candidate.sampleKind === 'interval-start')) {
    const byCapability = new Map<FacilityCapability, FacilitiesWeeklyFacility[]>()
    for (const facility of row.facilities) {
      const group = byCapability.get(facility.capability) ?? []
      group.push(facility)
      byCapability.set(facility.capability, group)
      const target = summary[facility.capability]
      target.capacitySlotWeeks += facility.capacity
      target.occupiedSlotWeeks += facility.occupied
      target.idleSlotWeeks += facility.idle
      target.ownerSlotWeeks.production += facility.ownerSlots.production
      target.ownerSlotWeeks.script += facility.ownerSlots.script
      target.ownerSlotWeeks.casting += facility.ownerSlots.casting
    }
    for (const capability of Object.keys(summary) as FacilityCapability[]) {
      const facilities = byCapability.get(capability) ?? []
      const full =
        facilities.length > 0 &&
        facilities.reduce((sum, facility) => sum + facility.occupied, 0) ===
          facilities.reduce((sum, facility) => sum + facility.capacity, 0)
      streak[capability] = full ? streak[capability] + 1 : 0
      if (full) summary[capability].fullWeeks++
      summary[capability].longestFullStreak = Math.max(
        summary[capability].longestFullStreak,
        streak[capability],
      )
    }
  }
  for (const capability of Object.keys(summary) as FacilityCapability[]) {
    const metric = summary[capability]
    if (metric.occupiedSlotWeeks + metric.idleSlotWeeks !== metric.capacitySlotWeeks) {
      throw new Error(`facilities observatory: ${capability} slot-week reconciliation failed`)
    }
  }
  return summary
}

function leadTimes(runtime: ArmRuntime): FacilitiesLeadTime[] {
  return [...runtime.milestones.values()]
    .sort((a, b) => compareId(a.projectId, b.projectId))
    .map((milestone) => ({
      ...milestone,
      commissionToReadyWeeks:
        milestone.readyWeek === null ? null : milestone.readyWeek - milestone.commissionedWeek,
      commissionToGreenlightWeeks:
        milestone.greenlightWeek === null
          ? null
          : milestone.greenlightWeek - milestone.commissionedWeek,
      commissionToReleaseWeeks:
        milestone.releaseWeek === null
          ? null
          : milestone.releaseWeek - milestone.commissionedWeek,
    }))
}

function zeroCapabilityCounts(): Record<FacilityCapability, number> {
  return { 'development-casting': 0, soundstage: 0, 'set-scenery': 0, post: 0 }
}

function staffingSnapshot(
  runtime: ArmRuntime,
  row: FacilitiesWeeklyRow,
  relation: FacilitiesStaffingSnapshot['relation'],
): FacilitiesStaffingSnapshot {
  const developmentCasting = row.facilities.filter(
    (facility) => facility.capability === 'development-casting',
  )
  const developmentCastingCapacity = developmentCasting.reduce(
    (sum, facility) => sum + facility.capacity,
    0,
  )
  const developmentCastingOccupied = developmentCasting.reduce(
    (sum, facility) => sum + facility.occupied,
    0,
  )
  const activeIds = new Set(row.activeContractIds)
  return {
    week: row.week,
    relation,
    activeContracts: row.activeContracts,
    initialCohortUnderContract: runtime.initialCohort.filter((contract) =>
      activeIds.has(contract.talentId),
    ).length,
    weeklyPayroll: row.weeklyPayroll,
    weeklyOverhead: row.weeklyOverhead,
    activeProductions: row.activeProductions,
    readyScripts: row.scripts.ready,
    activeScriptTasks: row.scripts.drafting + row.scripts.rewriting,
    activeCastingTasks: row.castingSessions.auditioning,
    developmentCastingCapacity,
    developmentCastingOccupied,
    developmentCastingFull:
      developmentCastingCapacity > 0 &&
      developmentCastingOccupied === developmentCastingCapacity,
    capacityRejectedIntentsAtWeek: runtime.intents.filter(
      (intent) => intent.week === row.week && intent.capacityBound,
    ).length,
    staffingBlockedIntentsAtWeek: runtime.intents.filter(
      (intent) => intent.week === row.week && intent.blockerKind === 'staffing',
    ).length,
  }
}

function staffingWindow(
  runtime: ArmRuntime,
  startWeek: number,
  endWeekExclusive: number,
): FacilitiesStaffingWindow | null {
  const rows = runtime.rows.filter(
    (row) =>
      row.sampleKind === 'interval-start' &&
      row.week >= startWeek &&
      row.week < endWeekExclusive,
  )
  if (rows.length !== endWeekExclusive - startWeek) return null
  const intents = runtime.intents.filter(
    (intent) => intent.week >= startWeek && intent.week < endWeekExclusive,
  )
  const payrollScheduledTotal = rows.reduce((sum, row) => sum + row.weeklyPayroll, 0)
  const overheadScheduledTotal = rows.reduce((sum, row) => sum + row.weeklyOverhead, 0)
  const payrollLedgerTotal = -runtime.state.ledger
    .filter(
      (entry) =>
        entry.kind === 'payroll' && entry.week >= startWeek && entry.week < endWeekExclusive,
    )
    .reduce((sum, entry) => sum + entry.amount, 0)
  const overheadLedgerTotal = -runtime.state.ledger
    .filter(
      (entry) =>
        entry.kind === 'overhead' && entry.week >= startWeek && entry.week < endWeekExclusive,
    )
    .reduce((sum, entry) => sum + entry.amount, 0)
  if (
    Math.abs(payrollScheduledTotal - payrollLedgerTotal) > 1e-6 ||
    Math.abs(overheadScheduledTotal - overheadLedgerTotal) > 1e-6
  ) {
    throw new Error(
      `facilities observatory: staffing window ${String(startWeek)}-${String(endWeekExclusive)} failed payroll/overhead ledger reconciliation`,
    )
  }
  const atStart = runtime.rows.find((row) => row.week === startWeek)
  const atEnd = runtime.rows.find((row) => row.week === endWeekExclusive)
  return {
    startWeek,
    endWeekExclusive,
    observedWeeks: rows.length,
    contractSlotWeeks: rows.reduce((sum, row) => sum + row.activeContracts, 0),
    payrollScheduledTotal,
    payrollLedgerTotal,
    overheadScheduledTotal,
    overheadLedgerTotal,
    staffingBlockedIntents: intents.filter((intent) => intent.blockerKind === 'staffing').length,
    capacityBlockedIntents: intents.filter((intent) => intent.capacityBound).length,
    screenplayCommissionsAccepted: intents.filter(
      (intent) => intent.intentKind === 'script-commission' && intent.accepted,
    ).length,
    rewritesAccepted: intents.filter(
      (intent) => intent.intentKind === 'script-rewrite' && intent.accepted,
    ).length,
    castingSessionsAccepted: intents.filter(
      (intent) => intent.intentKind === 'casting-session' && intent.accepted,
    ).length,
    greenlightsAccepted: intents.filter(
      (intent) => intent.intentKind === 'production-greenlight' && intent.accepted,
    ).length,
    releases:
      atStart === undefined || atEnd === undefined
        ? 0
        : atEnd.releasedFilms - atStart.releasedFilms,
    productionHoldWeeks: intents.filter(
      (intent) => intent.intentKind === 'production-transition',
    ).length,
    developmentCasting: summarizeCapabilities(rows)['development-casting'],
  }
}

function staffingStratum(runtime: ArmRuntime): FacilitiesStaffingStratum {
  const originalExpiryWeek =
    runtime.initialCohort.length === 0
      ? null
      : Math.min(...runtime.initialCohort.map((contract) => contract.endWeekExclusive))
  const renewalWindowWeek =
    originalExpiryWeek === null
      ? null
      : originalExpiryWeek - TUNING.HIRING_RENEWAL_WINDOW_WEEKS
  const cohortIds = runtime.initialCohort.map((contract) => contract.talentId).sort(compareId)
  const cohortIdSet = new Set(cohortIds)
  const renewalIntents = runtime.intents.filter(
    (intent) =>
      intent.intentKind === 'contract-renewal' && cohortIdSet.has(intent.ownerId),
  )
  const desired: { week: number; relation: FacilitiesStaffingSnapshot['relation'] }[] = []
  if (renewalWindowWeek !== null) {
    desired.push(
      { week: renewalWindowWeek - 1, relation: 'renewal-window-eve' },
      { week: renewalWindowWeek, relation: 'renewal-window-arrival' },
    )
  }
  if (originalExpiryWeek !== null) {
    desired.push(
      { week: originalExpiryWeek - 1, relation: 'expiry-eve' },
      { week: originalExpiryWeek, relation: 'expiry-arrival' },
      { week: originalExpiryWeek + 1, relation: 'post-expiry' },
    )
  }
  desired.push({ week: runtime.horizonWeeks, relation: 'horizon-arrival' })
  const seen = new Set<string>()
  const snapshots: FacilitiesStaffingSnapshot[] = []
  for (const wanted of desired) {
    const key = `${String(wanted.week)}:${wanted.relation}`
    if (seen.has(key)) continue
    seen.add(key)
    const row = runtime.rows.find((candidate) => candidate.week === wanted.week)
    if (row !== undefined) snapshots.push(staffingSnapshot(runtime, row, wanted.relation))
  }
  const expiryArrival =
    originalExpiryWeek === null
      ? undefined
      : runtime.rows.find((row) => row.week === originalExpiryWeek)
  const expiryEve =
    originalExpiryWeek === null
      ? undefined
      : runtime.rows.find((row) => row.week === originalExpiryWeek - 1)
  const expiryActive =
    expiryArrival === undefined ? null : new Set(expiryArrival.activeContractIds)
  return {
    originalExpiryWeek,
    renewalWindowWeek,
    initialCohortTalentIds: cohortIds,
    initialCohortWeeklyPayroll: runtime.initialCohort.reduce(
      (sum, contract) => sum + contract.weeklySalary,
      0,
    ),
    renewalAttempts: renewalIntents.length,
    renewalAcceptances: renewalIntents.filter((intent) => intent.accepted).length,
    renewalRejections: renewalIntents.filter((intent) => !intent.accepted).length,
    renewalAttemptWeeks: [...new Set(renewalIntents.map((intent) => intent.week))].sort(
      (a, b) => a - b,
    ),
    retainedAtExpiryTalentIds:
      expiryActive === null ? null : cohortIds.filter((talentId) => expiryActive.has(talentId)),
    releasedAtExpiryTalentIds:
      expiryActive === null ? null : cohortIds.filter((talentId) => !expiryActive.has(talentId)),
    expiryArrivalContractDelta:
      expiryArrival === undefined || expiryEve === undefined
        ? null
        : expiryArrival.activeContracts - expiryEve.activeContracts,
    expiryArrivalPayrollDelta:
      expiryArrival === undefined || expiryEve === undefined
        ? null
        : expiryArrival.weeklyPayroll - expiryEve.weeklyPayroll,
    snapshots,
    boundaryRows: runtime.staffingRows.map((row) => structuredClone(row)),
    preExpiryWindow:
      renewalWindowWeek === null || originalExpiryWeek === null
        ? null
        : staffingWindow(runtime, renewalWindowWeek, originalExpiryWeek),
    postExpiryWindow:
      originalExpiryWeek === null
        ? null
        : staffingWindow(runtime, originalExpiryWeek, originalExpiryWeek + 12),
    interpretation:
      'Separate staffing boundary: renewals are real policy actions; retained or released roster, payroll, pipeline, and facility pressure are observations. Extra facility capacity is not a repair for the Week-208 roster wall.',
  }
}

function buildArmSummary(
  runtime: ArmRuntime,
  initialRoster: Record<CreativeRole, number>,
  initialExpiryClusterWeek: number | null,
  initialExpiryClusterContracts: number,
): FacilitiesArmSummary {
  const ledgerTotal = runtime.state.ledger.reduce((sum, entry) => sum + entry.amount, 0)
  const finalCashDelta = runtime.state.studio.cash - (TUNING.INITIAL_CASH + ledgerTotal)
  if (Math.abs(finalCashDelta) > 1e-6) {
    throw new Error(
      `facilities observatory: final cash failed ledger reconciliation by ${String(finalCashDelta)}`,
    )
  }
  const accepted = runtime.intents.filter((intent) => intent.accepted).length
  const rejected = runtime.intents.length - accepted
  const capacityRejectedIntentsByCapability = zeroCapabilityCounts()
  const shadowsAdmittedByCapability = zeroCapabilityCounts()
  for (const intent of runtime.intents) {
    if (
      intent.capacityBound &&
      intent.capability !== null &&
      intent.intentKind !== 'production-transition'
    ) {
      capacityRejectedIntentsByCapability[intent.capability]++
    }
  }
  const productionHolds = summarizeFacilitiesProductionHolds(runtime.intents)
  for (const shadow of runtime.shadows) {
    if (shadow.admitted) shadowsAdmittedByCapability[shadow.capability]++
  }
  const developmentCastingRejectionWeeks = runtime.intents
    .filter(
      (intent) =>
        intent.capacityBound &&
        intent.capability === 'development-casting' &&
        intent.intentKind !== 'production-transition',
    )
    .map((intent) => intent.week)
  const developmentCastingRejectionExposure: FacilitiesAvailabilityRejectionExposure = {
    availabilityWeek: runtime.counterfactualAvailableWeek,
    fullHorizon: developmentCastingRejectionWeeks.length,
    beforeAvailability: developmentCastingRejectionWeeks.filter(
      (week) => week < runtime.counterfactualAvailableWeek,
    ).length,
    fromAvailabilityInclusive: developmentCastingRejectionWeeks.filter(
      (week) => week >= runtime.counterfactualAvailableWeek,
    ).length,
  }
  return {
    observedWeeks: runtime.rows.filter((row) => row.sampleKind === 'interval-start').length,
    arrivalWeekObserved: runtime.rows.some(
      (row) => row.week === runtime.horizonWeeks && row.sampleKind === 'horizon-arrival',
    ),
    initialRoster,
    initialExpiryClusterWeek,
    initialExpiryClusterContracts,
    finalCash: runtime.state.studio.cash,
    finalLedgerTotal: ledgerTotal,
    finalStateHash: stateHash(runtime.state),
    finalRngState: runtime.state.rngState,
    finalWeek: runtime.state.market.tick,
    scriptProjects: runtime.state.scriptDevelopment.projects.length,
    castingSessions: runtime.state.castingSessions.sessions.length,
    greenlights: runtime.intents.filter(
      (intent) => intent.intentKind === 'production-greenlight' && intent.accepted,
    ).length,
    releases: runtime.state.studio.releasedFilms.length,
    acceptedIntents: accepted,
    rejectedIntents: rejected,
    capacityRejectedIntents: runtime.intents.filter(
      (intent) => intent.capacityBound && intent.intentKind !== 'production-transition',
    ).length,
    capacityRejectedIntentsByCapability,
    developmentCastingRejectionExposure,
    productionHoldWeeks: productionHolds.productionHoldWeeks,
    productionHoldWeeksByCapability: productionHolds.productionHoldWeeksByCapability,
    uniqueHeldStudioWeeks: productionHolds.uniqueHeldStudioWeeks,
    holdDelayExposure: productionHolds.holdDelayExposure,
    oneBoundaryShadows: runtime.shadows.length,
    shadowsAdmitted: runtime.shadows.filter((shadow) => shadow.admitted).length,
    shadowsAdmittedByCapability,
    renewalAttempts: runtime.intents.filter(
      (intent) => intent.intentKind === 'contract-renewal',
    ).length,
    renewalRejections: runtime.intents.filter(
      (intent) => intent.intentKind === 'contract-renewal' && !intent.accepted,
    ).length,
    capability: summarizeCapabilities(runtime.rows),
    leadTimes: leadTimes(runtime),
    staffingStratum: staffingStratum(runtime),
  }
}

/**
 * Count per-production holds while charging studio-wide delay exposure once per week.
 * This is exported as a narrow deterministic seam for observatory regression fixtures.
 */
export function summarizeFacilitiesProductionHolds(
  intents: readonly FacilitiesIntentRow[],
): FacilitiesProductionHoldSummary {
  const productionHoldWeeksByCapability = zeroCapabilityCounts()
  const uniqueHeldStudioWeeks = new Set<number>()
  const exposedStudioWeeks = new Set<number>()
  const holdDelayExposure: FacilitiesDelayExposure = {
    payroll: 0,
    overhead: 0,
    activeRunReceipts: 0,
    netCommittedBurn: 0,
  }
  let productionHoldWeeks = 0

  for (const intent of intents) {
    if (intent.intentKind !== 'production-transition') continue
    productionHoldWeeks++
    uniqueHeldStudioWeeks.add(intent.week)
    if (intent.capability !== null) {
      productionHoldWeeksByCapability[intent.capability]++
    }
    if (intent.delayExposure === null || exposedStudioWeeks.has(intent.week)) continue
    exposedStudioWeeks.add(intent.week)
    holdDelayExposure.payroll += intent.delayExposure.payroll
    holdDelayExposure.overhead += intent.delayExposure.overhead
    holdDelayExposure.activeRunReceipts += intent.delayExposure.activeRunReceipts
    holdDelayExposure.netCommittedBurn += intent.delayExposure.netCommittedBurn
  }

  return {
    productionHoldWeeks,
    productionHoldWeeksByCapability,
    uniqueHeldStudioWeeks: uniqueHeldStudioWeeks.size,
    holdDelayExposure,
  }
}

type InitializedArm = {
  runtime: ArmRuntime
  initialStateHash: string
  initialRoster: Record<CreativeRole, number>
  initialExpiryClusterWeek: number | null
  initialExpiryClusterContracts: number
}

function initializeArm(
  input: RunFacilitiesArmInput,
  captureEvidence: boolean,
): InitializedArm {
  assertPolicyId(input.policyId)
  const horizonWeeks = assertHorizon(input.horizonWeeks ?? DEFAULT_FACILITIES_HORIZON_WEEKS)
  const counterfactualCapacityDelta = assertCapacityDelta(input.capacityDelta ?? 1)
  const counterfactualAvailableWeek = assertAvailableWeek(
    input.availableWeek ?? 0,
    horizonWeeks,
  )
  const policy = POLICY[input.policyId]
  const base = foundManagedStudio(input.seed, policy)
  const initialSaveHash = sha256(stableStringify(makeSave(structuredClone(base))))
  const initialStateHash = stateHash(base)
  const initialCalendar = studioCalendar(base)
  const state = base
  const manifest = manifestOf(state)
  const runtime: ArmRuntime = {
    state,
    mode: input.mode,
    armConfiguration: armConfiguration(
      input.mode,
      counterfactualCapacityDelta,
      counterfactualAvailableWeek,
    ),
    seed: input.seed,
    policy,
    horizonWeeks,
    initialSaveHash,
    manifest,
    manifestId: manifestId(manifest),
    counterfactualCapacityDelta,
    counterfactualAvailableWeek,
    counterfactualActivated: false,
    source: input.source,
    captureEvidence,
    initialCohort: base.contracts.map((contract) => ({
      talentId: contract.talentId,
      endWeekExclusive: contract.endWeekExclusive,
      weeklySalary: weeklySalary(contract.annualSalary),
    })),
    rows: [],
    intents: [],
    shadows: [],
    staffingRows: [],
    milestones: new Map(),
    attemptedRenewals: new Set(),
  }
  const initialRoster = roleCount(base)
  const initialExpiryClusterWeek = initialCalendar.staffingHorizon.busiestExpiry?.week ?? null
  const initialExpiryClusterContracts =
    initialCalendar.staffingHorizon.busiestExpiry?.contractCount ?? 0
  return {
    runtime,
    initialStateHash,
    initialRoster,
    initialExpiryClusterWeek,
    initialExpiryClusterContracts,
  }
}

function activateCounterfactualCapacityIfDue(runtime: ArmRuntime): void {
  if (
    runtime.mode !== 'counterfactual' ||
    runtime.counterfactualActivated ||
    runtime.state.market.tick !== runtime.counterfactualAvailableWeek
  ) {
    return
  }
  const cashBefore = runtime.state.studio.cash
  const ledgerBefore = stableStringify(runtime.state.ledger)
  const rngBefore = runtime.state.rngState
  const initialSaveHashBefore = runtime.initialSaveHash
  runtime.state = withResearchCapacity(
    runtime.state,
    'development-casting',
    runtime.counterfactualCapacityDelta,
  )
  if (
    runtime.state.studio.cash !== cashBefore ||
    stableStringify(runtime.state.ledger) !== ledgerBefore ||
    runtime.state.rngState !== rngBefore ||
    runtime.initialSaveHash !== initialSaveHashBefore
  ) {
    throw new Error(
      'facilities observatory: research capacity activation mutated cash, ledger, save identity, or RNG',
    )
  }
  runtime.manifest = manifestOf(runtime.state)
  runtime.manifestId = manifestId(runtime.manifest)
  runtime.counterfactualActivated = true
}

function executeArm(runtime: ArmRuntime): void {
  const horizonWeeks = runtime.horizonWeeks
  for (let week = 0; week < horizonWeeks; week++) {
    if (runtime.state.market.tick !== week) {
      throw new Error('facilities observatory: weekly controller clock diverged from market.tick')
    }
    // Availability is a start-of-week research configuration boundary. It is
    // installed before any policy action, including at Week 0.
    activateCounterfactualCapacityIfDue(runtime)
    driveWeek(runtime)
    if (runtime.captureEvidence) observeWeek(runtime, 'interval-start')
    const staffingWeeks = staffingBoundaryWeeks(runtime)
    const atExpiryEve =
      staffingWeeks !== null && runtime.state.market.tick === staffingWeeks.expiryWeek - 1
    const expiryLedgerStart = runtime.state.ledger.length
    if (atExpiryEve) captureStaffingBoundary(runtime, 'expiry-pre-tick', [])
    const beforeTick = runtime.state
    runtime.state = tick(runtime.state)
    recordProductionHolds(runtime, beforeTick, runtime.state)
    updateReleases(runtime)
    if (atExpiryEve) {
      captureStaffingBoundary(
        runtime,
        'expiry-post-tick',
        runtime.state.ledger.slice(expiryLedgerStart),
      )
    }
  }
  if (runtime.state.market.tick !== horizonWeeks) {
    throw new Error('facilities observatory: horizon arrival disagrees with market.tick')
  }
  // Week == horizon is a valid arrival-only sensitivity: expose the configured
  // manifest without granting a controller action or tick after activation.
  activateCounterfactualCapacityIfDue(runtime)
  if (runtime.captureEvidence) observeWeek(runtime, 'horizon-arrival')
}

/** Drive one deterministic policy arm through real public actions and weekly ticks. */
export function runFacilitiesArm(input: RunFacilitiesArmInput): FacilitiesArmResult {
  const initialized = initializeArm(input, true)
  const { runtime } = initialized
  executeArm(runtime)

  return {
    schemaVersion: FACILITIES_OBSERVER_SCHEMA_VERSION,
    seed: input.seed,
    policyId: input.policyId,
    mode: input.mode,
    armConfiguration: { ...runtime.armConfiguration },
    horizonWeeks: runtime.horizonWeeks,
    facilityManifestId: runtime.manifestId,
    facilityManifest: runtime.manifest.map((facility) => ({ ...facility })),
    initialSaveHash: runtime.initialSaveHash,
    initialStateHash: initialized.initialStateHash,
    rows: runtime.rows,
    intents: runtime.intents,
    shadows: runtime.shadows,
    staffingRows: runtime.staffingRows,
    summary: buildArmSummary(
      runtime,
      initialized.initialRoster,
      initialized.initialExpiryClusterWeek,
      initialized.initialExpiryClusterContracts,
    ),
  }
}

export type FacilitiesObserverNeutrality = {
  byteIdentical: boolean
  observedStateHash: string
  observerDisabledStateHash: string
  observedRngState: string
  observerDisabledRngState: string
  finalWeek: number
}

/**
 * Execute the same controller with and without evidence capture. The comparison is
 * over the complete stable-serialized engine state, not merely selected outcomes.
 */
export function verifyFacilitiesObserverNeutrality(
  input: RunFacilitiesArmInput,
): FacilitiesObserverNeutrality {
  const observed = initializeArm(input, true).runtime
  const observerDisabled = initializeArm(input, false).runtime
  executeArm(observed)
  executeArm(observerDisabled)
  const observedBytes = stableStringify(observed.state)
  const observerDisabledBytes = stableStringify(observerDisabled.state)
  return {
    byteIdentical: observedBytes === observerDisabledBytes,
    observedStateHash: sha256(observedBytes),
    observerDisabledStateHash: sha256(observerDisabledBytes),
    observedRngState: observed.state.rngState,
    observerDisabledRngState: observerDisabled.state.rngState,
    finalWeek: observed.state.market.tick,
  }
}

function firstRngDivergence(
  current: FacilitiesArmResult,
  counterfactual: FacilitiesArmResult,
): number | null {
  for (let index = 0; index < Math.min(current.rows.length, counterfactual.rows.length); index++) {
    if (current.rows[index]!.rngState !== counterfactual.rows[index]!.rngState) {
      return current.rows[index]!.week
    }
  }
  return null
}

function firstBehaviorDivergence(
  current: FacilitiesArmResult,
  counterfactual: FacilitiesArmResult,
): number | null {
  for (let index = 0; index < Math.min(current.rows.length, counterfactual.rows.length); index++) {
    if (current.rows[index]!.behaviorHash !== counterfactual.rows[index]!.behaviorHash) {
      return current.rows[index]!.week
    }
  }
  return null
}

function comparableIntent(intent: FacilitiesIntentRow): string {
  return stableStringify({
    week: intent.week,
    intentKind: intent.intentKind,
    ownerId: intent.ownerId,
    action: intent.action,
    accepted: intent.accepted,
    reason: intent.reason,
    capacityBound: intent.capacityBound,
    capability: intent.capability,
    blockerKind: intent.blockerKind,
    targetPhase: intent.targetPhase,
  })
}

function firstIntentDivergence(
  current: FacilitiesArmResult,
  counterfactual: FacilitiesArmResult,
): number | null {
  const length = Math.max(current.intents.length, counterfactual.intents.length)
  for (let index = 0; index < length; index++) {
    const currentIntent = current.intents[index]
    const counterfactualIntent = counterfactual.intents[index]
    if (
      currentIntent === undefined ||
      counterfactualIntent === undefined ||
      comparableIntent(currentIntent) !== comparableIntent(counterfactualIntent)
    ) {
      return Math.min(
        currentIntent?.week ?? Number.POSITIVE_INFINITY,
        counterfactualIntent?.week ?? Number.POSITIVE_INFINITY,
      )
    }
  }
  return null
}

function descriptiveOutcomeDelta(
  from: FacilitiesArmResult,
  to: FacilitiesArmResult,
): FacilitiesDescriptiveOutcomeDelta {
  return {
    interpretation: 'descriptive-after-policy-feedback',
    causal: false,
    capacityRejectedIntents:
      to.summary.capacityRejectedIntents - from.summary.capacityRejectedIntents,
    productionHoldWeeks:
      to.summary.productionHoldWeeks - from.summary.productionHoldWeeks,
    releases: to.summary.releases - from.summary.releases,
    scriptProjects: to.summary.scriptProjects - from.summary.scriptProjects,
    castingSessions: to.summary.castingSessions - from.summary.castingSessions,
    finalCash: to.summary.finalCash - from.summary.finalCash,
    developmentCastingOccupiedSlotWeeks:
      to.summary.capability['development-casting'].occupiedSlotWeeks -
      from.summary.capability['development-casting'].occupiedSlotWeeks,
  }
}

function pairOf(
  current: FacilitiesArmResult,
  counterfactual: FacilitiesArmResult,
): FacilitiesPairResult {
  if (current.seed !== counterfactual.seed || current.policyId !== counterfactual.policyId) {
    throw new Error('facilities observatory: cannot pair different seed/policy runs')
  }
  return {
    seed: current.seed,
    policyId: current.policyId,
    currentArmConfiguration: { ...current.armConfiguration },
    counterfactualArmConfiguration: { ...counterfactual.armConfiguration },
    currentManifestId: current.facilityManifestId,
    counterfactualManifestId: counterfactual.facilityManifestId,
    firstRngDivergenceWeek: firstRngDivergence(current, counterfactual),
    firstBehaviorDivergenceWeek: firstBehaviorDivergence(current, counterfactual),
    firstIntentDivergenceWeek: firstIntentDivergence(current, counterfactual),
    delta: descriptiveOutcomeDelta(current, counterfactual),
  }
}

function fourthSlotMarginalOf(
  plusOne: FacilitiesArmResult,
  plusTwo: FacilitiesArmResult,
): FacilitiesFourthSlotMarginalResult {
  if (plusOne.seed !== plusTwo.seed || plusOne.policyId !== plusTwo.policyId) {
    throw new Error('facilities observatory: cannot compare fourth-slot arms across seed/policy')
  }
  if (
    plusOne.armConfiguration.capacityDelta !== 1 ||
    plusTwo.armConfiguration.capacityDelta !== 2 ||
    plusOne.armConfiguration.availableWeek !== plusTwo.armConfiguration.availableWeek
  ) {
    throw new Error(
      'facilities observatory: fourth-slot marginal requires same-week configured +1 and +2 arms',
    )
  }
  return {
    seed: plusOne.seed,
    policyId: plusOne.policyId,
    interpretation: 'descriptive-after-policy-feedback',
    causal: false,
    fromArmConfiguration: {
      ...plusOne.armConfiguration,
      capacityDelta: 1,
    },
    toArmConfiguration: {
      ...plusTwo.armConfiguration,
      capacityDelta: 2,
    },
    fromManifestId: plusOne.facilityManifestId,
    toManifestId: plusTwo.facilityManifestId,
    firstRngDivergenceWeek: firstRngDivergence(plusOne, plusTwo),
    firstBehaviorDivergenceWeek: firstBehaviorDivergence(plusOne, plusTwo),
    firstIntentDivergenceWeek: firstIntentDivergence(plusOne, plusTwo),
    delta: descriptiveOutcomeDelta(plusOne, plusTwo),
  }
}

function deltaDistribution(values: readonly number[]): FacilitiesDeltaDistribution {
  const ordered = [...values].sort((a, b) => a - b)
  if (ordered.length === 0) {
    throw new Error('facilities observatory: descriptive delta distribution is empty')
  }
  const middle = Math.floor(ordered.length / 2)
  const median =
    ordered.length % 2 === 1
      ? ordered[middle]!
      : (ordered[middle - 1]! + ordered[middle]!) / 2
  const total = ordered.reduce((value, next) => value + next, 0)
  return {
    interpretation: 'descriptive-after-policy-feedback',
    pairCount: ordered.length,
    total,
    mean: total / ordered.length,
    median,
    min: ordered[0]!,
    max: ordered[ordered.length - 1]!,
    negativePairs: ordered.filter((value) => value < 0).length,
    zeroPairs: ordered.filter((value) => value === 0).length,
    positivePairs: ordered.filter((value) => value > 0).length,
  }
}

function aggregatePolicy(
  policyId: FacilitiesPolicyId,
  pairs: readonly FacilitiesPairResult[],
  runs: readonly FacilitiesArmResult[],
  availableWeek: number,
  capacityDelta: FacilitiesCapacityDelta,
): FacilitiesAggregatePolicy {
  const selectedPairs = pairs.filter((pair) => pair.policyId === policyId)
  const current = runs.filter((run) => run.policyId === policyId && run.mode === 'current')
  const counterfactual = runs.filter(
    (run) =>
      run.policyId === policyId &&
      run.mode === 'counterfactual' &&
      run.armConfiguration.capacityDelta === capacityDelta,
  )
  const sum = <T>(values: readonly T[], select: (value: T) => number): number =>
    values.reduce((total, value) => total + select(value), 0)
  const aggregateRejectionExposure = (
    selectedRuns: readonly FacilitiesArmResult[],
  ): FacilitiesRejectionExposureCounts => {
    if (
      selectedRuns.some(
        (run) =>
          run.summary.developmentCastingRejectionExposure.availabilityWeek !== availableWeek,
      )
    ) {
      throw new Error('facilities observatory: rejection exposure availability boundary diverged')
    }
    return {
      fullHorizon: sum(
        selectedRuns,
        (run) => run.summary.developmentCastingRejectionExposure.fullHorizon,
      ),
      beforeAvailability: sum(
        selectedRuns,
        (run) => run.summary.developmentCastingRejectionExposure.beforeAvailability,
      ),
      fromAvailabilityInclusive: sum(
        selectedRuns,
        (run) => run.summary.developmentCastingRejectionExposure.fromAvailabilityInclusive,
      ),
    }
  }
  const currentRejectionExposure = aggregateRejectionExposure(current)
  const counterfactualRejectionExposure = aggregateRejectionExposure(counterfactual)
  return {
    policyId,
    pairCount: selectedPairs.length,
    currentDevelopmentCastingRejectedIntents: sum(
      current,
      (run) => run.summary.capacityRejectedIntentsByCapability['development-casting'],
    ),
    counterfactualDevelopmentCastingRejectedIntents: sum(
      counterfactual,
      (run) => run.summary.capacityRejectedIntentsByCapability['development-casting'],
    ),
    developmentCastingRejectionsByAvailability: {
      availabilityWeek: availableWeek,
      current: currentRejectionExposure,
      counterfactual: counterfactualRejectionExposure,
    },
    admittedDevelopmentCastingBoundaryShadows: sum(
      current,
      (run) => run.summary.shadowsAdmittedByCapability['development-casting'],
    ),
    currentOtherCapabilityRejectedIntents: sum(
      current,
      (run) =>
        run.summary.capacityRejectedIntents -
        run.summary.capacityRejectedIntentsByCapability['development-casting'],
    ),
    counterfactualOtherCapabilityRejectedIntents: sum(
      counterfactual,
      (run) =>
        run.summary.capacityRejectedIntents -
        run.summary.capacityRejectedIntentsByCapability['development-casting'],
    ),
    currentProductionHoldWeeks: sum(current, (run) => run.summary.productionHoldWeeks),
    counterfactualProductionHoldWeeks: sum(
      counterfactual,
      (run) => run.summary.productionHoldWeeks,
    ),
    descriptivePairDeltas: {
      releases: deltaDistribution(selectedPairs.map((pair) => pair.delta.releases)),
      finalCash: deltaDistribution(selectedPairs.map((pair) => pair.delta.finalCash)),
      developmentCastingOccupiedSlotWeeks: deltaDistribution(
        selectedPairs.map((pair) => pair.delta.developmentCastingOccupiedSlotWeeks),
      ),
    },
  }
}

function aggregateFourthSlotPolicy(
  policyId: FacilitiesPolicyId,
  marginals: readonly FacilitiesFourthSlotMarginalResult[],
  runs: readonly FacilitiesArmResult[],
): FacilitiesFourthSlotAggregatePolicy {
  const selected = marginals.filter((marginal) => marginal.policyId === policyId)
  const plusOne = runs.filter(
    (run) => run.policyId === policyId && run.armConfiguration.capacityDelta === 1,
  )
  const plusTwo = runs.filter(
    (run) => run.policyId === policyId && run.armConfiguration.capacityDelta === 2,
  )
  const sum = <T>(values: readonly T[], select: (value: T) => number): number =>
    values.reduce((total, value) => total + select(value), 0)
  return {
    policyId,
    pairCount: selected.length,
    plusOneDevelopmentCastingRejectedIntents: sum(
      plusOne,
      (run) => run.summary.capacityRejectedIntentsByCapability['development-casting'],
    ),
    plusTwoDevelopmentCastingRejectedIntents: sum(
      plusTwo,
      (run) => run.summary.capacityRejectedIntentsByCapability['development-casting'],
    ),
    plusOneProductionHoldWeeks: sum(plusOne, (run) => run.summary.productionHoldWeeks),
    plusTwoProductionHoldWeeks: sum(plusTwo, (run) => run.summary.productionHoldWeeks),
    descriptiveFourthSlotDeltas: {
      releases: deltaDistribution(selected.map((marginal) => marginal.delta.releases)),
      finalCash: deltaDistribution(selected.map((marginal) => marginal.delta.finalCash)),
      developmentCastingOccupiedSlotWeeks: deltaDistribution(
        selected.map((marginal) => marginal.delta.developmentCastingOccupiedSlotWeeks),
      ),
    },
  }
}

/** Run seed-major, policy-major paired current/configured Development & Casting evidence. */
export function runFacilitiesCorpus(input: RunFacilitiesCorpusInput): FacilitiesCorpusResult {
  const horizonWeeks = assertHorizon(input.horizonWeeks ?? DEFAULT_FACILITIES_HORIZON_WEEKS)
  const capacityDelta = assertCapacityDelta(input.capacityDelta ?? 1)
  const availableWeek = assertAvailableWeek(input.availableWeek ?? 0, horizonWeeks)
  if (input.seeds.length === 0) {
    throw new Error('facilities observatory: at least one seed is required')
  }
  const seeds = [...input.seeds]
  if (new Set(seeds).size !== seeds.length || seeds.some((seed) => seed.length === 0)) {
    throw new Error('facilities observatory: seeds must be unique non-empty strings')
  }
  const policyIds = [...(input.policyIds ?? FACILITIES_POLICY_IDS)]
  if (policyIds.length === 0 || new Set(policyIds).size !== policyIds.length) {
    throw new Error('facilities observatory: policyIds must be unique and non-empty')
  }
  for (const policyId of policyIds) assertPolicyId(policyId)

  const runs: FacilitiesArmResult[] = []
  const pairs: FacilitiesPairResult[] = []
  const fourthSlotMarginals: FacilitiesFourthSlotMarginalResult[] = []
  for (const seed of seeds) {
    for (const policyId of policyIds) {
      const current = runFacilitiesArm({
        seed,
        policyId,
        mode: 'current',
        horizonWeeks,
        capacityDelta,
        availableWeek,
        source: input.source,
      })
      const counterfactual = runFacilitiesArm({
        seed,
        policyId,
        mode: 'counterfactual',
        horizonWeeks,
        capacityDelta,
        availableWeek,
        source: input.source,
      })
      runs.push(current, counterfactual)
      pairs.push(pairOf(current, counterfactual))
      if (capacityDelta === 2) {
        const plusOne = runFacilitiesArm({
          seed,
          policyId,
          mode: 'counterfactual',
          horizonWeeks,
          capacityDelta: 1,
          availableWeek,
          source: input.source,
        })
        runs.push(plusOne)
        fourthSlotMarginals.push(fourthSlotMarginalOf(plusOne, counterfactual))
      }
    }
  }
  const currentFacilityManifest = initialManifest()
  const counterfactualFacilityManifest = [
    ...initialManifest(),
    { ...researchFacility('development-casting', capacityDelta) },
  ].sort((a, b) => compareId(a.id, b.id))
  return {
    schemaVersion: FACILITIES_OBSERVER_SCHEMA_VERSION,
    provenance: {
      ...input.source,
      saveVersion: 10,
      operationsMode: 'managed',
      horizonWeeks,
      seeds,
      policyIds,
      maxConcurrentProductions: TUNING.MAX_CONCURRENT_PRODUCTIONS,
      productionTicks: TUNING.PRODUCTION_TICKS,
      productionPhaseIdentity: Array.from(
        { length: TUNING.PRODUCTION_TICKS },
        (_, index) => {
          const remainingTicks = TUNING.PRODUCTION_TICKS - index
          return {
            remainingTicks,
            phase: productionPhaseForRemainingTicks(remainingTicks),
          }
        },
      ),
      productionAllocationIdentity:
        'operations-v1: ascending production ID; retained soundstage on rehearsal-to-shooting; script and casting completions release shared slots before production allocation; blocked transitions retry on tick',
      armConfigurations: [
        armConfiguration('current', capacityDelta, availableWeek),
        armConfiguration('counterfactual', capacityDelta, availableWeek),
        ...(capacityDelta === 2
          ? [armConfiguration('counterfactual', 1, availableWeek)]
          : []),
      ],
      currentFacilityManifest,
      counterfactualFacilityManifest,
      counterfactualDelta: {
        facilityId: researchFacility('development-casting', capacityDelta).id,
        capability: 'development-casting',
        capacityDelta,
        availableWeek,
      },
    },
    runs,
    pairs,
    fourthSlotMarginals,
    aggregate: {
      runCount: runs.length,
      pairCount: pairs.length,
      policies: policyIds.map((policyId) =>
        aggregatePolicy(policyId, pairs, runs, availableWeek, capacityDelta),
      ),
      fourthSlotMarginal:
        capacityDelta === 2
          ? {
              interpretation: 'descriptive-after-policy-feedback',
              causal: false,
              fromCapacityDelta: 1,
              toCapacityDelta: 2,
              availableWeek,
              pairCount: fourthSlotMarginals.length,
              policies: policyIds.map((policyId) =>
                aggregateFourthSlotPolicy(policyId, fourthSlotMarginals, runs),
              ),
            }
          : null,
      boundaryStatement:
        `Research-only configured +${String(capacityDelta)} Development & Casting capacity, operational at the start of Week ${String(availableWeek)}. No construction price, duration, save, action, UI, production behavior, or macroeconomy certification is authorized; D-17B residuals remain open.`,
    },
  }
}
