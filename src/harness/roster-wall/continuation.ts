// Week-208 roster-wall exact-entry continuation observatory.
//
// ANALYSIS ONLY. Every arm imports the immutable Week-196 SaveFileV12 bytes afresh,
// applies one C0-C6 renewal policy before the unchanged operating controller, and
// advances only through the public tick. Nothing in this module mutates production
// constants, save authority, or a harvested entry object.

import { createHash } from 'node:crypto'
import {
  FOUNDING_MINIMUMS,
  TUNING,
  contractOffer,
  exportSave,
  importSave,
  makeSaveV12,
  renewalWindowOpen,
  stableStringify,
  weeklyOverhead,
  weeklyPayroll,
} from '../../core/index.js'
import type {
  CreativeRole,
  GameState,
  LedgerEntry,
} from '../../core/index.js'
import {
  ROSTER_WALL_ENTRY_WEEK,
  rosterWallPackageReadiness,
  runRosterWallOperatingWeek,
} from './campaign.js'
import type {
  RosterWallBoundaryStateProjection,
  RosterWallEntryHarvest,
  RosterWallOperatingPolicyId,
  RosterWallPolicyIntentProjection,
} from './campaign.js'
import {
  ROSTER_CONTINUATION_POLICY_IDS,
  applyRenewalPolicy,
  createRenewalPolicyMemory,
} from './renewal.js'
import type {
  RenewalIntentObservation,
  RenewalPolicyMemory,
  RosterContinuationPolicyId,
} from './renewal.js'
import type { RosterWallSourceProvenance } from './provenance.js'
import {
  ROSTER_WALL_EXPERIMENT_ID,
  ROSTER_WALL_OBSERVER_SCHEMA_VERSION,
  ROSTER_WALL_SEED_SET_ID,
  rosterWallCashReconciliation,
  rosterWallEntryId,
  rosterWallTheatricalReceiptReconciliation,
} from './schema.js'
import type {
  RosterWallCashReconciliation,
  RosterWallCommonEnvelope,
  RosterWallTheatricalReceiptReconciliation,
} from './schema.js'

export const ROSTER_WALL_PRIMARY_HORIZON = 260 as const
export const ROSTER_WALL_RECURRENCE_HORIZON = 428 as const

const ROLES = ['actor', 'director', 'writer', 'craft'] as const
const LONG_POLICY_IDS = [
  'C1-current-retry-all',
  'C5-spread-role-first',
  'C6-mixed-term-role-first',
] as const satisfies readonly RosterContinuationPolicyId[]

type RosterWallRecordType = 'weekly' | 'renewalIntent' | 'boundary' | 'pair'
type RosterWallBoundaryRelation =
  | 'window-eve'
  | 'window-arrival'
  | 'expiry-eve'
  | 'expiry-arrival'
  | 'post-expiry-12'
  | 'recurrence-window'
  | 'recurrence-post-expiry'

export type RosterWallRoleCoverage = Record<CreativeRole, number>

type RosterWallCommonRecord = RosterWallCommonEnvelope & {
  schemaVersion: typeof ROSTER_WALL_OBSERVER_SCHEMA_VERSION
  recordType: RosterWallRecordType
  mode: 'current'
  experimentId: typeof ROSTER_WALL_EXPERIMENT_ID
  seedSetId: typeof ROSTER_WALL_SEED_SET_ID
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  estatePolicyId: RosterWallEntryHarvest['estatePolicyId']
  foundingTermPolicyId: 'all-208'
  continuationPolicyId: RosterContinuationPolicyId
  horizonWeeks: number
  source: RosterWallSourceProvenance
  initialSaveHash: string
  entryId: string
  entryWeek: typeof ROSTER_WALL_ENTRY_WEEK
  entrySaveHash: string
  entryStateHash: string
  week: number
}

export type RosterWallWeeklyRecord = RosterWallCommonRecord & {
  recordType: 'weekly'
  arrivalWeek: number
  stateHashBefore: string
  stateHashAfterRenewals: string
  stateHashAfterActions: string
  stateHashAfterTick: string
  rngBefore: string
  rngAfterRenewals: string
  rngAfterActions: string
  rngAfterTick: string
  cashBefore: number
  cashAfterRenewals: number
  cashAfterActions: number
  cashAfterTick: number
  cashReconciliationBefore: RosterWallCashReconciliation
  cashReconciliationAfter: RosterWallCashReconciliation
  activeContractTalentIds: string[]
  roleCoverage: RosterWallRoleCoverage
  missingFoundingRoles: CreativeRole[]
  renewalOpenOwnerIds: string[]
  renewalOpenOwners: Array<{
    contractKey: string
    talentId: string
    signingBonus: number
  }>
  quotedRenewalObligation208: number
  renewalPressure: boolean
  renewalIntentIds: string[]
  scheduledPayroll: number
  ledgerPayroll: number
  scheduledOverhead: number
  ledgerOverhead: number
  signingBonusRows: LedgerEntry[]
  theatricalReceiptRows: LedgerEntry[]
  theatricalReceiptReconciliation: RosterWallTheatricalReceiptReconciliation
  transitionLedgerRows: LedgerEntry[]
  operatingIntents: RosterWallPolicyIntentProjection[]
  packageStaffabilityBlockers: RosterWallPolicyIntentProjection[]
  packageAffordabilityBlockers: RosterWallPolicyIntentProjection[]
  activeProductions: number
  activeTheatricalReceipts: number
  screenplayProjects: number
  castingSessions: number
  readyScreenplays: number
  packageReadyScreenplays: number
  freeAgentIdsInStateOrder: string[]
  construction: GameState['construction']
  economyEngagedEver: true
  absorbingNoDecisionState: false
  absorbingProbeReason: string
}

export type RosterWallRenewalIntentRecord = RosterWallCommonRecord &
  RenewalIntentObservation & {
    recordType: 'renewalIntent'
  }

export type RosterWallBoundaryRecord = RosterWallCommonRecord & {
  recordType: 'boundary'
  relation: RosterWallBoundaryRelation
  stateHash: string
  rngState: string
  arrivalWeek: number | null
  arrivalStateHash: string | null
  arrivalRngState: string | null
  arrivalCashReconciliation: RosterWallCashReconciliation | null
  cohortRetainedTalentIds: string[]
  cohortReleasedTalentIds: string[]
  cohortRoleCoverage: RosterWallRoleCoverage
  missingFoundingRoles: CreativeRole[]
  weeklyPayroll: number
  payrollDelta: number | null
  baseOverhead: number
  baseOverheadDelta: number | null
  employeeOverhead: number
  employeeOverheadDelta: number | null
  totalOverhead: number
  overheadDelta: number | null
  activeTheatricalReceipts: number
  activeProductions: number
  screenplayProjects: number
  castingSessions: number
  readyScreenplays: number
  packageReadyScreenplays: number
  packageStaffabilityBlockers: number
  packageAffordabilityBlockers: number
  transitionLedgerRows: LedgerEntry[]
  cashReconciliation: RosterWallCashReconciliation
}

export type RosterWallTaxonomySummary = {
  renewalPressureWeeks: number
  uniqueAcceptedOwners: number
  uniqueAcceptedOwnerKeys: string[]
  uniqueRejectedOwners: number
  uniqueRejectedOwnerKeys: string[]
  retryAttempts: number
  intendedOriginalCohortOwners: number
  intendedOriginalCohortOwnerKeys: string[]
  attemptedOriginalCohortOwners: number
  attemptedOriginalCohortOwnerKeys: string[]
  acceptedOriginalCohortOwners: number
  acceptedOriginalCohortOwnerKeys: string[]
  rejectedOriginalCohortOwners: number
  rejectedOriginalCohortOwnerKeys: string[]
  originalCohortRetryAttempts: number
  expiredIntendedOriginalCohortOwners: number
  expiredIntendedOriginalCohortOwnerKeys: string[]
  originalExpiryObserved: boolean
  voluntaryNoRenewalControl: boolean
  retainedOriginalCohort: number
  releasedOriginalCohort: number
  partialCohortWall: boolean
  fullInvoluntaryCohortWall: boolean
  contractRoleCoverageLoss: boolean
  missingFoundingRolesAtOriginalExpiry: CreativeRole[]
  packageStaffabilityBlockers: number
  packageAffordabilityBlockers: number
  absorbingNoDecisionWeeks: number
}

export type RosterWallRecurrenceFact = {
  contractEndWeekExclusive: number
  windowArrivalWeek: number
  postExpiryObserved: boolean
}

export type RosterWallContinuationSummary = {
  finalWeek: number
  finalCash: number
  finalStateHash: string
  finalSaveHash: string
  finalRngState: string
  quotedUniqueOwnerObligation: number
  quotedOriginalCohortObligation: number
  quotedPolicyIntentObligation: number
  quotedOriginalCohortPolicyIntentObligation: number
  signingBonusesPaid: number
  theatricalReceiptsReceived: number
  existingRunReceiptsReceived: number
  openingRunReceiptsReceived: number
  retainedOriginalCohortTalentIds: string[]
  releasedOriginalCohortTalentIds: string[]
  originalCohortRoleCoverageAtExpiry: RosterWallRoleCoverage
  finalActiveContractTalentIds: string[]
  finalRoleCoverage: RosterWallRoleCoverage
  finalWeeklyPayroll: number
  finalBaseOverhead: number
  finalEmployeeOverhead: number
  finalTotalOverhead: number
  finalActiveTheatricalReceipts: number
  finalActiveProductions: number
  finalScreenplayProjects: number
  finalCastingSessions: number
  finalReadyScreenplays: number
  finalPackageReadyScreenplays: number
  finalCashReconciliation: RosterWallCashReconciliation
  taxonomy: RosterWallTaxonomySummary
  recurrence: RosterWallRecurrenceFact[]
  evaluatedInvariants: {
    freshEntrySaveHashExact: true
    freshEntryStateHashExact: true
    finalHorizonExact: true
    originalExpiryBoundaryCapturedWhenReached: true
    originalCohortPartitionExact: true
    finalCashReconciles: true
    renewalIntentsRngNeutral: true
    scheduledCostsMatchLedger: true
    scheduledReceiptsMatchLedger: true
    economyEngagementPreserved: true
  }
  invariantFailures: 0
}

export type RosterWallContinuationArm = {
  schemaVersion: typeof ROSTER_WALL_OBSERVER_SCHEMA_VERSION
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  estatePolicyId: RosterWallEntryHarvest['estatePolicyId']
  continuationPolicyId: RosterContinuationPolicyId
  horizonWeeks: number
  entryId: string
  entrySaveHash: string
  entryStateHash: string
  freshImportStateHash: string
  freshImportSaveHash: string
  referenceShadows: RosterWallEntryHarvest['shadows']
  weekly: RosterWallWeeklyRecord[]
  renewalIntents: RosterWallRenewalIntentRecord[]
  boundaries: RosterWallBoundaryRecord[]
  summary: RosterWallContinuationSummary
}

export type RunRosterWallContinuationInput = {
  harvest: RosterWallEntryHarvest
  continuationPolicyId: RosterContinuationPolicyId
  source: RosterWallSourceProvenance
  horizonWeeks?: number
}

export type RosterWallPairRecord = RosterWallCommonRecord & {
  recordType: 'pair'
  baselinePolicyId: 'C1-current-retry-all'
  comparedPolicyId: RosterContinuationPolicyId
  causalBoundaryLabel: 'renewal-policy-only-after-byte-identical-week-196-entry'
  facilityCausality: 'not-estimated-by-within-estate-policy-pair'
  estateInterpretation:
    | 'causal-renewal-policy-within-vacant-entry'
    | 'descriptive-renewal-policy-within-annex-entry'
  exactEntryPairedTableEligible: boolean
  commonEntry: {
    entrySaveHash: string
    entryStateHash: string
    cash: number
    cashReconciliation: RosterWallCashReconciliation
    rngState: string
    cohortTalentIds: string[]
    roleCoverage: RosterWallRoleCoverage
    weeklyPayroll: number
    baseOverhead: number
    employeeOverhead: number
    totalOverhead: number
    activeTheatricalReceipts: number
    activeProductions: number
    screenplayProjects: number
    castingSessions: number
    readyScreenplays: number
    packageReadyScreenplays: number
  }
  baseline: RosterWallTaxonomySummary
  compared: RosterWallTaxonomySummary
  retainedTalentIds: { baseline: string[]; compared: string[] }
  releasedTalentIds: { baseline: string[]; compared: string[] }
  roleCoverage: {
    baseline: RosterWallRoleCoverage
    compared: RosterWallRoleCoverage
    delta: RosterWallRoleCoverage
  }
  finalRoleCoverage: {
    baseline: RosterWallRoleCoverage
    compared: RosterWallRoleCoverage
    delta: RosterWallRoleCoverage
  }
  acceptedOwnerKeys: { baseline: string[]; compared: string[] }
  rejectedOwnerKeys: { baseline: string[]; compared: string[] }
  attemptedOriginalOwnerKeys: { baseline: string[]; compared: string[] }
  acceptedOriginalOwnerKeys: { baseline: string[]; compared: string[] }
  rejectedOriginalOwnerKeys: { baseline: string[]; compared: string[] }
  acceptedOwnerCounts: { baseline: number; compared: number; delta: number }
  rejectedOwnerCounts: { baseline: number; compared: number; delta: number }
  retryAttemptCounts: { baseline: number; compared: number; delta: number }
  intendedOriginalOwnerCounts: { baseline: number; compared: number; delta: number }
  attemptedOriginalOwnerCounts: { baseline: number; compared: number; delta: number }
  acceptedOriginalOwnerCounts: { baseline: number; compared: number; delta: number }
  rejectedOriginalOwnerCounts: { baseline: number; compared: number; delta: number }
  originalRetryAttemptCounts: { baseline: number; compared: number; delta: number }
  quotedObligationTotals: { baseline: number; compared: number; delta: number }
  quotedOriginalCohortObligationTotals: { baseline: number; compared: number; delta: number }
  quotedPolicyIntentObligationTotals: { baseline: number; compared: number; delta: number }
  quotedOriginalCohortPolicyIntentObligationTotals: {
    baseline: number
    compared: number
    delta: number
  }
  signingBonusTotals: { baseline: number; compared: number; delta: number }
  payroll: { baseline: number; compared: number; delta: number }
  baseOverhead: { baseline: number; compared: number; delta: number }
  employeeOverhead: { baseline: number; compared: number; delta: number }
  totalOverhead: { baseline: number; compared: number; delta: number }
  activeTheatricalReceipts: { baseline: number; compared: number; delta: number }
  theatricalReceiptsReceived: { baseline: number; compared: number; delta: number }
  activeProductions: { baseline: number; compared: number; delta: number }
  screenplayProjects: { baseline: number; compared: number; delta: number }
  castingSessions: { baseline: number; compared: number; delta: number }
  readyScreenplays: { baseline: number; compared: number; delta: number }
  packageReadyScreenplays: { baseline: number; compared: number; delta: number }
  packageStaffabilityBlockers: { baseline: number; compared: number; delta: number }
  packageAffordabilityBlockers: { baseline: number; compared: number; delta: number }
  finalCash: { baseline: number; compared: number; delta: number }
  finalStateHash: { baseline: string; compared: string; equal: boolean }
  finalRngState: { baseline: string; compared: string; equal: boolean }
  recurrence: { baseline: RosterWallRecurrenceFact[]; compared: RosterWallRecurrenceFact[] }
}

export type RosterWallContinuationCorpus = {
  arms: RosterWallContinuationArm[]
  pairs: RosterWallPairRecord[]
  observerNeutrality: {
    checkedArms: number
    byteIdenticalArms: number
    stateHashIdenticalArms: number
    rngStateIdenticalArms: number
    failures: 0
  }
}

/** Canonical artifact row order for one exact maximum-term entry. */
export function rosterWallContinuationRows(
  corpus: RosterWallContinuationCorpus,
  options: { includeDescriptiveAnnexPairs?: boolean } = {},
): Array<
  | RosterWallWeeklyRecord
  | RosterWallRenewalIntentRecord
  | RosterWallBoundaryRecord
  | RosterWallPairRecord
> {
  const rows: Array<
    | RosterWallWeeklyRecord
    | RosterWallRenewalIntentRecord
    | RosterWallBoundaryRecord
    | RosterWallPairRecord
  > = []
  for (const arm of corpus.arms) {
    const phaseOrder: Record<'boundary' | 'renewalIntent' | 'weekly', number> = {
      boundary: 0,
      renewalIntent: 1,
      weekly: 2,
    }
    rows.push(
      ...[...arm.boundaries, ...arm.renewalIntents, ...arm.weekly].sort(
        (a, b) =>
          a.week - b.week ||
          phaseOrder[a.recordType] - phaseOrder[b.recordType] ||
          (a.recordType === 'renewalIntent' && b.recordType === 'renewalIntent'
            ? a.orderRank - b.orderRank || compareId(a.intentId, b.intentId)
            : a.recordType === 'boundary' && b.recordType === 'boundary'
              ? compareId(a.relation, b.relation)
              : 0),
      ),
    )
  }
  rows.push(
    ...corpus.pairs.filter(
      (pair) => pair.exactEntryPairedTableEligible || options.includeDescriptiveAnnexPairs,
    ),
  )
  return rows
}

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function sha256(bytes: string): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function stateHash(state: GameState): string {
  return sha256(stableStringify(state))
}

function assertInvariant(name: string, condition: boolean): true {
  if (!condition) {
    throw new Error(`roster-wall continuation invariant failed: ${name}`)
  }
  return true
}

function invariantFailureCount(invariants: Record<string, boolean>): 0 {
  const failures = Object.values(invariants).filter((value) => !value).length
  if (failures !== 0) {
    throw new Error(
      `roster-wall continuation: ${String(failures)} evaluated invariant(s) failed`,
    )
  }
  return 0
}

function activeContractIds(state: GameState): string[] {
  return state.contracts
    .filter(
      (contract) =>
        contract.startWeek <= state.market.tick && state.market.tick < contract.endWeekExclusive,
    )
    .map((contract) => contract.talentId)
    .sort(compareId)
}

function roleCoverage(state: GameState, onlyIds?: ReadonlySet<string>): RosterWallRoleCoverage {
  const active = new Set(activeContractIds(state))
  const result: RosterWallRoleCoverage = { actor: 0, director: 0, writer: 0, craft: 0 }
  for (const talent of state.talent) {
    if (!active.has(talent.id) || (onlyIds !== undefined && !onlyIds.has(talent.id))) continue
    result[talent.role]++
  }
  return result
}

function missingRoles(coverage: RosterWallRoleCoverage): CreativeRole[] {
  return ROLES.filter((role) => coverage[role] < FOUNDING_MINIMUMS[role])
}

function assertSource(source: RosterWallSourceProvenance): void {
  if (source.worktreeDirty !== false || source.saveVersion !== 12) {
    throw new Error('roster-wall continuation: accepted source must be clean SaveFileV12 authority')
  }
}

function assertPolicy(policyId: RosterContinuationPolicyId): void {
  if (!(ROSTER_CONTINUATION_POLICY_IDS as readonly string[]).includes(policyId)) {
    throw new Error(`roster-wall continuation: unknown policy ${String(policyId)}`)
  }
}

function assertHorizon(policyId: RosterContinuationPolicyId, horizonWeeks: number): void {
  if (!Number.isInteger(horizonWeeks) || horizonWeeks <= ROSTER_WALL_ENTRY_WEEK || horizonWeeks > 428) {
    throw new Error('roster-wall continuation: horizon must be an integer from 197 through 428')
  }
  if (horizonWeeks > ROSTER_WALL_PRIMARY_HORIZON && !(LONG_POLICY_IDS as readonly string[]).includes(policyId)) {
    throw new Error('roster-wall continuation: only C1, C5, and C6 have a governed long horizon')
  }
}

function loadFreshEntry(harvest: RosterWallEntryHarvest): GameState {
  // `importSave` is intentionally called for every execution. Do not replace this
  // with harvest.entrySave.state or a clone of a prior arm.
  const imported = importSave(harvest.entrySaveBytes)
  if (imported.saveVersion !== 12) {
    throw new Error('roster-wall continuation: immutable entry is not SaveFileV12')
  }
  const reexported = exportSave(imported)
  if (reexported !== harvest.entrySaveBytes || sha256(reexported) !== harvest.entrySaveHash) {
    throw new Error('roster-wall continuation: immutable entry bytes/hash changed on fresh import')
  }
  if (imported.state.market.tick !== ROSTER_WALL_ENTRY_WEEK) {
    throw new Error('roster-wall continuation: fresh entry is not the visible Week-196 arrival')
  }
  const importedState = imported.state
  if (stateHash(importedState) !== harvest.entryStateHash) {
    throw new Error('roster-wall continuation: fresh entry state hash disagrees with harvest')
  }
  rosterWallCashReconciliation(importedState)
  return structuredClone(importedState)
}

function commonRecord(
  input: RunRosterWallContinuationInput,
  recordType: RosterWallRecordType,
  week: number,
  horizonWeeks: number,
): RosterWallCommonRecord {
  return {
    schemaVersion: ROSTER_WALL_OBSERVER_SCHEMA_VERSION,
    recordType,
    mode: 'current',
    experimentId: ROSTER_WALL_EXPERIMENT_ID,
    seedSetId: ROSTER_WALL_SEED_SET_ID,
    seed: input.harvest.seed,
    operatingPolicyId: input.harvest.operatingPolicyId,
    estatePolicyId: input.harvest.estatePolicyId,
    foundingTermPolicyId: 'all-208',
    continuationPolicyId: input.continuationPolicyId,
    horizonWeeks,
    source: { ...input.source, authorityDiffPaths: [...input.source.authorityDiffPaths] },
    initialSaveHash: input.harvest.initialSaveHash,
    entryId: rosterWallEntryId(input.harvest, 'all-208'),
    entryWeek: ROSTER_WALL_ENTRY_WEEK,
    entrySaveHash: input.harvest.entrySaveHash,
    entryStateHash: input.harvest.entryStateHash,
    week,
  }
}

function renewalOpen(state: GameState): Array<{
  contractKey: string
  talentId: string
  signingBonus: number
  endWeekExclusive: number
}> {
  return state.contracts
    .filter((contract) => renewalWindowOpen(contract, state.market.tick))
    .map((contract) => ({
      contractKey: `${contract.talentId}:${String(contract.startWeek)}:${String(contract.endWeekExclusive)}`,
      talentId: contract.talentId,
      signingBonus: contractOffer(state, contract.talentId, 208).signingBonus,
      endWeekExclusive: contract.endWeekExclusive,
    }))
    .sort(
      (a, b) =>
        a.endWeekExclusive - b.endWeekExclusive || compareId(a.talentId, b.talentId),
    )
}

function packageBlockers(intents: readonly RosterWallPolicyIntentProjection[]): {
  staffability: RosterWallPolicyIntentProjection[]
  affordability: RosterWallPolicyIntentProjection[]
} {
  const failedPackages = intents.filter(
    (intent) => intent.intentKind === 'production-greenlight' && !intent.accepted,
  )
  // The unchanged controller emits action:null only when it could not assemble a
  // legal package. Once an exact action exists, a cash/solvency rejection is an
  // affordability blocker. These categories cannot overlap.
  const staffability = failedPackages.filter((intent) => intent.action === null)
  const affordability = failedPackages.filter(
    (intent) => intent.action !== null && /cash|afford|solvency/i.test(intent.reason ?? ''),
  )
  return {
    staffability: staffability.map((intent) => structuredClone(intent)),
    affordability: affordability.map((intent) => structuredClone(intent)),
  }
}

function activeReceiptCount(state: GameState): number {
  return state.theatricalRuns.filter((run) => run.status === 'active').length
}

function transitionCost(rows: readonly LedgerEntry[], kind: LedgerEntry['kind']): number {
  return -rows.filter((row) => row.kind === kind).reduce((sum, row) => sum + row.amount, 0)
}

function absorbingProbe(state: GameState): { absorbing: false; reason: string } {
  if (state.studio.cash >= 0) return { absorbing: false, reason: 'cash-is-not-negative' }
  if (activeContractIds(state).length > 0) return { absorbing: false, reason: 'active-contracts-remain' }
  if (activeReceiptCount(state) > 0) return { absorbing: false, reason: 'active-theatrical-receipts-remain' }
  // A true claim would require exhausting every public action. The current action
  // set contains cost-free talent creation, so this observer conservatively refuses
  // to claim absorption even in the three-condition substrate. One legal action is
  // sufficient to disprove an absorbing state; no speculative economic rescue is
  // inferred from that fact.
  return { absorbing: false, reason: 'cost-free-public-talent-creation-action-remains' }
}

function overheadParts(state: GameState): { base: number; employee: number; total: number } {
  const total = weeklyOverhead(state)
  return {
    base: total === 0 ? 0 : TUNING.OVERHEAD_BASE,
    employee: total === 0 ? 0 : TUNING.OVERHEAD_PER_EMPLOYEE * state.contracts.length,
    total,
  }
}

function boundaryRecord(
  input: RunRosterWallContinuationInput,
  horizonWeeks: number,
  relation: RosterWallBoundaryRelation,
  state: GameState,
  cohortIds: ReadonlySet<string>,
  previousState: GameState | null,
  transitionLedgerRows: readonly LedgerEntry[],
  blockerCounts: { staffability: number; affordability: number },
): RosterWallBoundaryRecord {
  const active = new Set(activeContractIds(state))
  const retained = [...cohortIds].filter((id) => active.has(id)).sort(compareId)
  const released = [...cohortIds].filter((id) => !active.has(id)).sort(compareId)
  const coverage = roleCoverage(state, cohortIds)
  const overhead = overheadParts(state)
  const previousOverhead = previousState === null ? null : overheadParts(previousState)
  const packageReadiness = rosterWallPackageReadiness(
    state,
    input.harvest.operatingPolicyId,
  )
  return {
    ...commonRecord(input, 'boundary', state.market.tick, horizonWeeks),
    recordType: 'boundary',
    relation,
    stateHash: stateHash(state),
    rngState: state.rngState,
    arrivalWeek: null,
    arrivalStateHash: null,
    arrivalRngState: null,
    arrivalCashReconciliation: null,
    cohortRetainedTalentIds: retained,
    cohortReleasedTalentIds: released,
    cohortRoleCoverage: coverage,
    missingFoundingRoles: missingRoles(coverage),
    weeklyPayroll: weeklyPayroll(state),
    payrollDelta: previousState === null ? null : weeklyPayroll(state) - weeklyPayroll(previousState),
    baseOverhead: overhead.base,
    baseOverheadDelta:
      previousOverhead === null ? null : overhead.base - previousOverhead.base,
    employeeOverhead: overhead.employee,
    employeeOverheadDelta:
      previousOverhead === null ? null : overhead.employee - previousOverhead.employee,
    totalOverhead: overhead.total,
    overheadDelta: previousOverhead === null ? null : overhead.total - previousOverhead.total,
    activeTheatricalReceipts: activeReceiptCount(state),
    activeProductions: state.studio.activeProductions.length,
    screenplayProjects: state.scriptDevelopment.projects.length,
    castingSessions: state.castingSessions.sessions.length,
    ...packageReadiness,
    packageStaffabilityBlockers: blockerCounts.staffability,
    packageAffordabilityBlockers: blockerCounts.affordability,
    transitionLedgerRows: transitionLedgerRows.map((row) => ({ ...row })),
    cashReconciliation: rosterWallCashReconciliation(state),
  }
}

function preEntryBoundaryRecord(
  input: RunRosterWallContinuationInput,
  horizonWeeks: number,
  projection: RosterWallEntryHarvest['preEntryWindowEve'],
): RosterWallBoundaryRecord {
  if (
    projection.before.week !== 195 ||
    projection.after.week !== ROSTER_WALL_ENTRY_WEEK ||
    projection.after.stateHash !== input.harvest.entryStateHash ||
    projection.after.rngState !== input.harvest.entryRngState ||
    projection.after.cash !== input.harvest.entrySave.state.studio.cash ||
    projection.after.cashReconciliation.ledgerLength !==
      input.harvest.entrySave.state.ledger.length ||
    stableStringify(projection.transitionLedgerRows) !==
      stableStringify(
        input.harvest.entrySave.state.ledger.slice(
          projection.before.cashReconciliation.ledgerLength,
        ),
      )
  ) {
    throw new Error('roster-wall continuation: prehistory window-eve boundary disagrees with entry')
  }
  const blockers = packageBlockers(projection.operatingIntents)
  const before: RosterWallBoundaryStateProjection = projection.before
  const after: RosterWallBoundaryStateProjection = projection.after
  return {
    ...commonRecord(input, 'boundary', before.week, horizonWeeks),
    recordType: 'boundary',
    relation: 'window-eve',
    stateHash: before.stateHash,
    rngState: before.rngState,
    arrivalWeek: after.week,
    arrivalStateHash: after.stateHash,
    arrivalRngState: after.rngState,
    arrivalCashReconciliation: structuredClone(after.cashReconciliation),
    cohortRetainedTalentIds: [...before.cohortRetainedTalentIds],
    cohortReleasedTalentIds: [...before.cohortReleasedTalentIds],
    cohortRoleCoverage: { ...before.cohortRoleCoverage },
    missingFoundingRoles: [...before.missingFoundingRoles],
    weeklyPayroll: before.weeklyPayroll,
    payrollDelta: after.weeklyPayroll - before.weeklyPayroll,
    baseOverhead: before.baseOverhead,
    baseOverheadDelta: after.baseOverhead - before.baseOverhead,
    employeeOverhead: before.employeeOverhead,
    employeeOverheadDelta: after.employeeOverhead - before.employeeOverhead,
    totalOverhead: before.totalOverhead,
    overheadDelta: after.totalOverhead - before.totalOverhead,
    activeTheatricalReceipts: before.activeTheatricalReceipts,
    activeProductions: before.activeProductions,
    screenplayProjects: before.screenplayProjects,
    castingSessions: before.castingSessions,
    readyScreenplays: before.readyScreenplays,
    packageReadyScreenplays: before.packageReadyScreenplays,
    packageStaffabilityBlockers: blockers.staffability.length,
    packageAffordabilityBlockers: blockers.affordability.length,
    transitionLedgerRows: projection.transitionLedgerRows.map((row) => ({ ...row })),
    cashReconciliation: structuredClone(before.cashReconciliation),
  }
}

type ContinuationExecution = {
  arm: RosterWallContinuationArm
  finalState: GameState
  finalSaveBytes: string
}

function executeContinuation(
  input: RunRosterWallContinuationInput,
  captureObserver: boolean,
): ContinuationExecution {
  assertSource(input.source)
  assertPolicy(input.continuationPolicyId)
  const horizonWeeks = input.horizonWeeks ?? ROSTER_WALL_PRIMARY_HORIZON
  assertHorizon(input.continuationPolicyId, horizonWeeks)
  let state = loadFreshEntry(input.harvest)
  const freshImportStateHash = stateHash(state)
  const freshImportSaveHash = sha256(exportSave(makeSaveV12(state)))
  const cohortIds = new Set(input.harvest.cohort.map((member) => member.talentId))
  const originalContractKeyByTalentId = new Map(
    input.harvest.cohort.map((member) => [
      member.talentId,
      `${member.talentId}:${String(member.startWeek)}:${String(member.endWeekExclusive)}`,
    ]),
  )
  const originalContractKeys = new Set(originalContractKeyByTalentId.values())
  const intendedOriginalContractKeys =
    input.continuationPolicyId === 'C0-no-renewal'
      ? new Set<string>()
      : new Set(originalContractKeys)
  let memory: RenewalPolicyMemory = createRenewalPolicyMemory(ROSTER_WALL_ENTRY_WEEK)
  const weekly: RosterWallWeeklyRecord[] = []
  const renewalIntents: RosterWallRenewalIntentRecord[] = []
  const boundaries: RosterWallBoundaryRecord[] = []
  const acceptedOwners = new Set<string>()
  const rejectedOwners = new Set<string>()
  const attemptedOriginalOwners = new Set<string>()
  const acceptedOriginalOwners = new Set<string>()
  const rejectedOriginalOwners = new Set<string>()
  const uniqueQuotedBonus = new Map<string, number>()
  const uniquePolicyIntentBonus = new Map<string, number>()
  const recurrenceEnds = new Set<number>()
  const recurrencePostObserved = new Set<number>()
  const renewalPressureWeeks = new Set<number>()
  let retryAttempts = 0
  let originalCohortRetryAttempts = 0
  let signingBonusesPaid = 0
  let theatricalReceiptsReceived = 0
  let existingRunReceiptsReceived = 0
  let openingRunReceiptsReceived = 0
  let staffabilityBlockers = 0
  let affordabilityBlockers = 0
  let absorbingNoDecisionWeeks = 0
  let originalExpiryBoundary: RosterWallBoundaryRecord | null = null
  let renewalIntentsRngNeutral = true
  let scheduledCostsMatchLedger = true
  let scheduledReceiptsMatchLedger = true
  let economyEngagementPreserved = true

  if (captureObserver) {
    boundaries.push(
      preEntryBoundaryRecord(input, horizonWeeks, input.harvest.preEntryWindowEve),
    )
    boundaries.push(
      boundaryRecord(input, horizonWeeks, 'window-arrival', state, cohortIds, null, [], {
        staffability: 0,
        affordability: 0,
      }),
    )
  }

  while (state.market.tick < horizonWeeks) {
    const before = state
    const startWeek = before.market.tick
    const ledgerStart = before.ledger.length
    const open = renewalOpen(before)
    if (open.length > 0) renewalPressureWeeks.add(startWeek)
    for (const owner of open) {
      const contract = before.contracts.find((candidate) => candidate.talentId === owner.talentId)
      if (contract !== undefined) {
        const key = `${contract.talentId}:${String(contract.startWeek)}:${String(contract.endWeekExclusive)}`
        if (!uniqueQuotedBonus.has(key)) uniqueQuotedBonus.set(key, owner.signingBonus)
      }
    }

    if (recurrenceEnds.has(startWeek + 12) && captureObserver) {
      boundaries.push(
        boundaryRecord(input, horizonWeeks, 'recurrence-window', before, cohortIds, null, [], {
          staffability: 0,
          affordability: 0,
        }),
      )
    }
    if (startWeek === 207 && captureObserver) {
      boundaries.push(
        boundaryRecord(input, horizonWeeks, 'expiry-eve', before, cohortIds, null, [], {
          staffability: 0,
          affordability: 0,
        }),
      )
    }

    const renewal = applyRenewalPolicy(before, input.continuationPolicyId, memory)
    memory = renewal.memory
    for (const intent of renewal.intents) {
      if (!uniquePolicyIntentBonus.has(intent.contractKey)) {
        uniquePolicyIntentBonus.set(intent.contractKey, intent.offer.signingBonus)
      }
      renewalIntentsRngNeutral &&= intent.rngBefore === intent.rngAfter
      if (originalContractKeys.has(intent.contractKey)) {
        attemptedOriginalOwners.add(intent.contractKey)
        if (intent.accepted) {
          acceptedOriginalOwners.add(intent.contractKey)
        } else {
          rejectedOriginalOwners.add(intent.contractKey)
          originalCohortRetryAttempts++
        }
      }
      if (intent.accepted) {
        acceptedOwners.add(intent.contractKey)
        signingBonusesPaid += intent.offer.signingBonus
        if (intent.offer.endWeekExclusive > 208) recurrenceEnds.add(intent.offer.endWeekExclusive)
      } else {
        rejectedOwners.add(intent.contractKey)
        retryAttempts++
      }
      if (captureObserver) {
        renewalIntents.push({
          ...commonRecord(input, 'renewalIntent', intent.actualWeek, horizonWeeks),
          ...structuredClone(intent),
          recordType: 'renewalIntent',
        })
      }
    }

    const operating = runRosterWallOperatingWeek({
      state: renewal.state,
      operatingPolicyId: input.harvest.operatingPolicyId,
      captureIntents: captureObserver,
    })
    const after = operating.stateAfterTick
    const transitionLedger = after.ledger.slice(ledgerStart)
    const blockers = packageBlockers(operating.intents)
    staffabilityBlockers += blockers.staffability.length
    affordabilityBlockers += blockers.affordability.length
    const probe = absorbingProbe(after)
    if (probe.absorbing) absorbingNoDecisionWeeks++

    const scheduledPayroll = weeklyPayroll(operating.stateAfterActions)
    const scheduledOverhead = weeklyOverhead(operating.stateAfterActions)
    const ledgerPayroll = transitionCost(transitionLedger, 'payroll')
    const ledgerOverhead = transitionCost(transitionLedger, 'overhead')
    if (scheduledPayroll !== ledgerPayroll || scheduledOverhead !== ledgerOverhead) {
      scheduledCostsMatchLedger = false
      throw new Error('roster-wall continuation: scheduled payroll/overhead disagrees with tick ledger')
    }
    const theatricalReceiptReconciliation = rosterWallTheatricalReceiptReconciliation(
      operating.stateAfterActions,
      after,
      transitionLedger,
    )
    scheduledReceiptsMatchLedger &&= theatricalReceiptReconciliation.delta === 0
    theatricalReceiptsReceived += theatricalReceiptReconciliation.ledgerTotal
    existingRunReceiptsReceived +=
      theatricalReceiptReconciliation.scheduledExistingReceipts
    openingRunReceiptsReceived +=
      theatricalReceiptReconciliation.scheduledOpeningReceipts
    if (after.rngState !== operating.stateAfterTick.rngState) {
      throw new Error('roster-wall continuation: impossible RNG alias divergence')
    }
    if (!after.economyEngagedEver) {
      economyEngagementPreserved = false
      throw new Error('roster-wall continuation: economy engagement reverted after roster attrition')
    }
    rosterWallCashReconciliation(after)

    if (captureObserver) {
      const coverage = roleCoverage(after)
      weekly.push({
        ...commonRecord(input, 'weekly', startWeek, horizonWeeks),
        recordType: 'weekly',
        arrivalWeek: after.market.tick,
        stateHashBefore: stateHash(before),
        stateHashAfterRenewals: stateHash(renewal.state),
        stateHashAfterActions: stateHash(operating.stateAfterActions),
        stateHashAfterTick: stateHash(after),
        rngBefore: before.rngState,
        rngAfterRenewals: renewal.state.rngState,
        rngAfterActions: operating.stateAfterActions.rngState,
        rngAfterTick: after.rngState,
        cashBefore: before.studio.cash,
        cashAfterRenewals: renewal.state.studio.cash,
        cashAfterActions: operating.stateAfterActions.studio.cash,
        cashAfterTick: after.studio.cash,
        cashReconciliationBefore: rosterWallCashReconciliation(before),
        cashReconciliationAfter: rosterWallCashReconciliation(after),
        activeContractTalentIds: activeContractIds(after),
        roleCoverage: coverage,
        missingFoundingRoles: missingRoles(coverage),
        renewalOpenOwnerIds: open.map((owner) => owner.talentId),
        renewalOpenOwners: open.map(({ contractKey, talentId, signingBonus }) => ({
          contractKey,
          talentId,
          signingBonus,
        })),
        quotedRenewalObligation208: open.reduce((sum, owner) => sum + owner.signingBonus, 0),
        renewalPressure: open.length > 0 || renewal.intents.length > 0,
        renewalIntentIds: renewal.intents.map((intent) => intent.intentId),
        scheduledPayroll,
        ledgerPayroll,
        scheduledOverhead,
        ledgerOverhead,
        signingBonusRows: transitionLedger.filter((row) => row.kind === 'signingBonus').map((row) => ({ ...row })),
        theatricalReceiptRows: transitionLedger
          .filter((row) => row.kind === 'studioRevenue' || row.kind === 'boxOffice')
          .map((row) => ({ ...row })),
        theatricalReceiptReconciliation: { ...theatricalReceiptReconciliation },
        transitionLedgerRows: transitionLedger.map((row) => ({ ...row })),
        operatingIntents: operating.intents.map((intent) => structuredClone(intent)),
        packageStaffabilityBlockers: blockers.staffability,
        packageAffordabilityBlockers: blockers.affordability,
        activeProductions: after.studio.activeProductions.length,
        activeTheatricalReceipts: activeReceiptCount(after),
        screenplayProjects: after.scriptDevelopment.projects.length,
        castingSessions: after.castingSessions.sessions.length,
        readyScreenplays: after.scriptDevelopment.projects.filter((project) => project.status === 'ready').length,
        packageReadyScreenplays: rosterWallPackageReadiness(
          after,
          input.harvest.operatingPolicyId,
        ).packageReadyScreenplays,
        freeAgentIdsInStateOrder: [...after.freeAgents],
        construction: structuredClone(after.construction),
        economyEngagedEver: true,
        absorbingNoDecisionState: false,
        absorbingProbeReason: probe.reason,
      })
    }

    if (after.market.tick === 208) {
      const record = boundaryRecord(
        input,
        horizonWeeks,
        'expiry-arrival',
        after,
        cohortIds,
        operating.stateAfterActions,
        transitionLedger,
        { staffability: blockers.staffability.length, affordability: blockers.affordability.length },
      )
      originalExpiryBoundary = record
      if (captureObserver) boundaries.push(record)
    }
    if (after.market.tick === 220 && captureObserver) {
      boundaries.push(
        boundaryRecord(input, horizonWeeks, 'post-expiry-12', after, cohortIds, operating.stateAfterActions, transitionLedger, {
          staffability: blockers.staffability.length,
          affordability: blockers.affordability.length,
        }),
      )
    }
    if (recurrenceEnds.has(after.market.tick)) {
      recurrencePostObserved.add(after.market.tick)
      if (captureObserver) {
        boundaries.push(
          boundaryRecord(input, horizonWeeks, 'recurrence-post-expiry', after, cohortIds, operating.stateAfterActions, transitionLedger, {
            staffability: blockers.staffability.length,
            affordability: blockers.affordability.length,
          }),
        )
      }
    }
    state = after
  }

  if (state.market.tick !== horizonWeeks) {
    throw new Error('roster-wall continuation: final arrival disagrees with requested horizon')
  }
  const finalSaveBytes = exportSave(makeSaveV12(state))
  const finalActive = new Set(activeContractIds(state))
  const expiry = originalExpiryBoundary
  const retainedAtExpiry = (
    expiry?.cohortRetainedTalentIds ?? [...cohortIds].filter((id) => finalActive.has(id))
  ).sort(compareId)
  const releasedAtExpiry = (
    expiry?.cohortReleasedTalentIds ?? [...cohortIds].filter((id) => !finalActive.has(id))
  ).sort(compareId)
  const expiryCoverage = expiry?.cohortRoleCoverage ?? roleCoverage(state, cohortIds)
  const missingAtExpiry = expiry?.missingFoundingRoles ?? missingRoles(expiryCoverage)
  const attemptedPolicy = input.continuationPolicyId !== 'C0-no-renewal'
  const originalExpiryObserved = expiry !== null
  const expiredIntendedOriginalOwnerKeys = releasedAtExpiry
    .map((talentId) => originalContractKeyByTalentId.get(talentId))
    .filter(
      (key): key is string => key !== undefined && intendedOriginalContractKeys.has(key),
    )
    .sort(compareId)
  const intendedOriginalOwnerKeys = [...intendedOriginalContractKeys].sort(compareId)
  const attemptedOriginalOwnerKeys = [...attemptedOriginalOwners].sort(compareId)
  const acceptedOriginalOwnerKeys = [...acceptedOriginalOwners].sort(compareId)
  const rejectedOriginalOwnerKeys = [...rejectedOriginalOwners].sort(compareId)
  const taxonomy: RosterWallTaxonomySummary = {
    renewalPressureWeeks: renewalPressureWeeks.size,
    uniqueAcceptedOwners: acceptedOwners.size,
    uniqueAcceptedOwnerKeys: [...acceptedOwners].sort(compareId),
    uniqueRejectedOwners: rejectedOwners.size,
    uniqueRejectedOwnerKeys: [...rejectedOwners].sort(compareId),
    retryAttempts,
    intendedOriginalCohortOwners: intendedOriginalOwnerKeys.length,
    intendedOriginalCohortOwnerKeys: intendedOriginalOwnerKeys,
    attemptedOriginalCohortOwners: attemptedOriginalOwnerKeys.length,
    attemptedOriginalCohortOwnerKeys: attemptedOriginalOwnerKeys,
    acceptedOriginalCohortOwners: acceptedOriginalOwnerKeys.length,
    acceptedOriginalCohortOwnerKeys: acceptedOriginalOwnerKeys,
    rejectedOriginalCohortOwners: rejectedOriginalOwnerKeys.length,
    rejectedOriginalCohortOwnerKeys: rejectedOriginalOwnerKeys,
    originalCohortRetryAttempts,
    expiredIntendedOriginalCohortOwners: expiredIntendedOriginalOwnerKeys.length,
    expiredIntendedOriginalCohortOwnerKeys: expiredIntendedOriginalOwnerKeys,
    originalExpiryObserved,
    voluntaryNoRenewalControl: !attemptedPolicy,
    retainedOriginalCohort: retainedAtExpiry.length,
    releasedOriginalCohort: releasedAtExpiry.length,
    partialCohortWall:
      attemptedPolicy &&
      originalExpiryObserved &&
      retainedAtExpiry.length > 0 &&
      (expiredIntendedOriginalOwnerKeys.length > 0 || rejectedOriginalOwners.size > 0),
    fullInvoluntaryCohortWall:
      attemptedPolicy &&
      originalExpiryObserved &&
      retainedAtExpiry.length === 0 &&
      attemptedOriginalOwners.size > 0,
    contractRoleCoverageLoss: missingAtExpiry.length > 0,
    missingFoundingRolesAtOriginalExpiry: [...missingAtExpiry],
    packageStaffabilityBlockers: staffabilityBlockers,
    packageAffordabilityBlockers: affordabilityBlockers,
    absorbingNoDecisionWeeks,
  }
  const recurrence = [...recurrenceEnds]
    .sort((a, b) => a - b)
    .map((endWeek): RosterWallRecurrenceFact => ({
      contractEndWeekExclusive: endWeek,
      windowArrivalWeek: endWeek - TUNING.HIRING_RENEWAL_WINDOW_WEEKS,
      postExpiryObserved: recurrencePostObserved.has(endWeek),
    }))
  const finalCoverage = roleCoverage(state)
  const finalOverhead = overheadParts(state)
  const finalPackageReadiness = rosterWallPackageReadiness(
    state,
    input.harvest.operatingPolicyId,
  )
  const finalCashReconciliation = rosterWallCashReconciliation(state)
  const evaluatedInvariants = {
    freshEntrySaveHashExact: assertInvariant(
      'fresh-entry-save-hash-exact',
      freshImportSaveHash === input.harvest.entrySaveHash,
    ),
    freshEntryStateHashExact: assertInvariant(
      'fresh-entry-state-hash-exact',
      freshImportStateHash === input.harvest.entryStateHash,
    ),
    finalHorizonExact: assertInvariant(
      'final-horizon-exact',
      state.market.tick === horizonWeeks,
    ),
    originalExpiryBoundaryCapturedWhenReached: assertInvariant(
      'original-expiry-boundary-captured-when-reached',
      horizonWeeks < 208 || originalExpiryBoundary !== null,
    ),
    originalCohortPartitionExact: assertInvariant(
      'original-cohort-partition-exact',
      retainedAtExpiry.length + releasedAtExpiry.length === cohortIds.size &&
        retainedAtExpiry.every((id) => !releasedAtExpiry.includes(id)),
    ),
    finalCashReconciles: assertInvariant(
      'final-cash-reconciles',
      Math.abs(finalCashReconciliation.delta) <= 1e-6,
    ),
    renewalIntentsRngNeutral: assertInvariant(
      'renewal-intents-rng-neutral',
      renewalIntentsRngNeutral,
    ),
    scheduledCostsMatchLedger: assertInvariant(
      'scheduled-costs-match-ledger',
      scheduledCostsMatchLedger,
    ),
    scheduledReceiptsMatchLedger: assertInvariant(
      'scheduled-receipts-match-ledger',
      scheduledReceiptsMatchLedger,
    ),
    economyEngagementPreserved: assertInvariant(
      'economy-engagement-preserved',
      economyEngagementPreserved,
    ),
  }
  const invariantFailures = invariantFailureCount(evaluatedInvariants)
  const summary: RosterWallContinuationSummary = {
    finalWeek: state.market.tick,
    finalCash: state.studio.cash,
    finalStateHash: stateHash(state),
    finalSaveHash: sha256(finalSaveBytes),
    finalRngState: state.rngState,
    quotedUniqueOwnerObligation: [...uniqueQuotedBonus.values()].reduce((sum, value) => sum + value, 0),
    quotedOriginalCohortObligation: [...originalContractKeys].reduce(
      (sum, key) => sum + (uniqueQuotedBonus.get(key) ?? 0),
      0,
    ),
    quotedPolicyIntentObligation: [...uniquePolicyIntentBonus.values()].reduce(
      (sum, value) => sum + value,
      0,
    ),
    quotedOriginalCohortPolicyIntentObligation: [...originalContractKeys].reduce(
      (sum, key) => sum + (uniquePolicyIntentBonus.get(key) ?? 0),
      0,
    ),
    signingBonusesPaid,
    theatricalReceiptsReceived,
    existingRunReceiptsReceived,
    openingRunReceiptsReceived,
    retainedOriginalCohortTalentIds: retainedAtExpiry,
    releasedOriginalCohortTalentIds: releasedAtExpiry,
    originalCohortRoleCoverageAtExpiry: { ...expiryCoverage },
    finalActiveContractTalentIds: [...finalActive].sort(compareId),
    finalRoleCoverage: finalCoverage,
    finalWeeklyPayroll: weeklyPayroll(state),
    finalBaseOverhead: finalOverhead.base,
    finalEmployeeOverhead: finalOverhead.employee,
    finalTotalOverhead: finalOverhead.total,
    finalActiveTheatricalReceipts: activeReceiptCount(state),
    finalActiveProductions: state.studio.activeProductions.length,
    finalScreenplayProjects: state.scriptDevelopment.projects.length,
    finalCastingSessions: state.castingSessions.sessions.length,
    finalReadyScreenplays: finalPackageReadiness.readyScreenplays,
    finalPackageReadyScreenplays: finalPackageReadiness.packageReadyScreenplays,
    finalCashReconciliation,
    taxonomy,
    recurrence,
    evaluatedInvariants,
    invariantFailures,
  }
  return {
    arm: {
      schemaVersion: ROSTER_WALL_OBSERVER_SCHEMA_VERSION,
      seed: input.harvest.seed,
      operatingPolicyId: input.harvest.operatingPolicyId,
      estatePolicyId: input.harvest.estatePolicyId,
      continuationPolicyId: input.continuationPolicyId,
      horizonWeeks,
      entryId: rosterWallEntryId(input.harvest, 'all-208'),
      entrySaveHash: input.harvest.entrySaveHash,
      entryStateHash: input.harvest.entryStateHash,
      freshImportStateHash,
      freshImportSaveHash,
      referenceShadows: structuredClone(input.harvest.shadows),
      weekly,
      renewalIntents,
      boundaries,
      summary,
    },
    finalState: state,
    finalSaveBytes,
  }
}

export function runRosterWallContinuationArm(
  input: RunRosterWallContinuationInput,
): RosterWallContinuationArm {
  return executeContinuation(input, true).arm
}

export function verifyRosterWallContinuationObserverNeutrality(
  input: RunRosterWallContinuationInput,
): {
  byteIdentical: boolean
  observedStateHash: string
  observerDisabledStateHash: string
  observedSaveHash: string
  observerDisabledSaveHash: string
  observedRngState: string
  observerDisabledRngState: string
  finalWeek: number
} {
  const observed = executeContinuation(input, true)
  const disabled = executeContinuation(input, false)
  return {
    byteIdentical:
      stableStringify(observed.finalState) === stableStringify(disabled.finalState) &&
      observed.finalSaveBytes === disabled.finalSaveBytes,
    observedStateHash: stateHash(observed.finalState),
    observerDisabledStateHash: stateHash(disabled.finalState),
    observedSaveHash: sha256(observed.finalSaveBytes),
    observerDisabledSaveHash: sha256(disabled.finalSaveBytes),
    observedRngState: observed.finalState.rngState,
    observerDisabledRngState: disabled.finalState.rngState,
    finalWeek: observed.finalState.market.tick,
  }
}

function retainedIds(arm: RosterWallContinuationArm, cohortIds: readonly string[]): string[] {
  const boundary = arm.boundaries.find((row) => row.relation === 'expiry-arrival')
  if (boundary !== undefined) return [...boundary.cohortRetainedTalentIds]
  return cohortIds.filter((id) => arm.summary.retainedOriginalCohortTalentIds.includes(id))
}

function numericPair(
  baseline: number,
  compared: number,
): { baseline: number; compared: number; delta: number } {
  return { baseline, compared, delta: compared - baseline }
}

function coveragePair(
  baseline: RosterWallRoleCoverage,
  compared: RosterWallRoleCoverage,
): RosterWallPairRecord['roleCoverage'] {
  return {
    baseline: { ...baseline },
    compared: { ...compared },
    delta: {
      actor: compared.actor - baseline.actor,
      director: compared.director - baseline.director,
      writer: compared.writer - baseline.writer,
      craft: compared.craft - baseline.craft,
    },
  }
}

function pairRecord(
  input: RunRosterWallContinuationInput,
  baseline: RosterWallContinuationArm,
  compared: RosterWallContinuationArm,
): RosterWallPairRecord {
  if (
    baseline.continuationPolicyId !== 'C1-current-retry-all' ||
    baseline.horizonWeeks !== compared.horizonWeeks ||
    baseline.entrySaveHash !== compared.entrySaveHash ||
    baseline.entryStateHash !== compared.entryStateHash ||
    compared.entrySaveHash !== input.harvest.entrySaveHash ||
    compared.entryStateHash !== input.harvest.entryStateHash
  ) {
    throw new Error('roster-wall continuation: pair does not share C1 horizon and exact entry')
  }
  const cohortIds = input.harvest.cohort.map((member) => member.talentId).sort(compareId)
  const baselineRetained = retainedIds(baseline, cohortIds)
  const comparedRetained = retainedIds(compared, cohortIds)
  const entryState = input.harvest.entrySave.state
  const entryOverhead = overheadParts(entryState)
  const entryReadiness = rosterWallPackageReadiness(
    entryState,
    input.harvest.operatingPolicyId,
  )
  return {
    ...commonRecord(
      { ...input, continuationPolicyId: compared.continuationPolicyId },
      'pair',
      compared.horizonWeeks,
      compared.horizonWeeks,
    ),
    recordType: 'pair',
    baselinePolicyId: 'C1-current-retry-all',
    comparedPolicyId: compared.continuationPolicyId,
    causalBoundaryLabel: 'renewal-policy-only-after-byte-identical-week-196-entry',
    facilityCausality: 'not-estimated-by-within-estate-policy-pair',
    estateInterpretation:
      input.harvest.estatePolicyId === 'vacant'
        ? 'causal-renewal-policy-within-vacant-entry'
        : 'descriptive-renewal-policy-within-annex-entry',
    exactEntryPairedTableEligible: input.harvest.estatePolicyId === 'vacant',
    commonEntry: {
      entrySaveHash: compared.entrySaveHash,
      entryStateHash: compared.entryStateHash,
      cash: entryState.studio.cash,
      cashReconciliation: rosterWallCashReconciliation(entryState),
      rngState: entryState.rngState,
      cohortTalentIds: cohortIds,
      roleCoverage: roleCoverage(entryState),
      weeklyPayroll: weeklyPayroll(entryState),
      baseOverhead: entryOverhead.base,
      employeeOverhead: entryOverhead.employee,
      totalOverhead: entryOverhead.total,
      activeTheatricalReceipts: activeReceiptCount(entryState),
      activeProductions: entryState.studio.activeProductions.length,
      screenplayProjects: entryState.scriptDevelopment.projects.length,
      castingSessions: entryState.castingSessions.sessions.length,
      ...entryReadiness,
    },
    baseline: structuredClone(baseline.summary.taxonomy),
    compared: structuredClone(compared.summary.taxonomy),
    retainedTalentIds: { baseline: baselineRetained, compared: comparedRetained },
    releasedTalentIds: {
      baseline: cohortIds.filter((id) => !baselineRetained.includes(id)),
      compared: cohortIds.filter((id) => !comparedRetained.includes(id)),
    },
    roleCoverage: coveragePair(
      baseline.summary.originalCohortRoleCoverageAtExpiry,
      compared.summary.originalCohortRoleCoverageAtExpiry,
    ),
    finalRoleCoverage: coveragePair(
      baseline.summary.finalRoleCoverage,
      compared.summary.finalRoleCoverage,
    ),
    acceptedOwnerKeys: {
      baseline: [...baseline.summary.taxonomy.uniqueAcceptedOwnerKeys],
      compared: [...compared.summary.taxonomy.uniqueAcceptedOwnerKeys],
    },
    rejectedOwnerKeys: {
      baseline: [...baseline.summary.taxonomy.uniqueRejectedOwnerKeys],
      compared: [...compared.summary.taxonomy.uniqueRejectedOwnerKeys],
    },
    attemptedOriginalOwnerKeys: {
      baseline: [...baseline.summary.taxonomy.attemptedOriginalCohortOwnerKeys],
      compared: [...compared.summary.taxonomy.attemptedOriginalCohortOwnerKeys],
    },
    acceptedOriginalOwnerKeys: {
      baseline: [...baseline.summary.taxonomy.acceptedOriginalCohortOwnerKeys],
      compared: [...compared.summary.taxonomy.acceptedOriginalCohortOwnerKeys],
    },
    rejectedOriginalOwnerKeys: {
      baseline: [...baseline.summary.taxonomy.rejectedOriginalCohortOwnerKeys],
      compared: [...compared.summary.taxonomy.rejectedOriginalCohortOwnerKeys],
    },
    acceptedOwnerCounts: numericPair(
      baseline.summary.taxonomy.uniqueAcceptedOwners,
      compared.summary.taxonomy.uniqueAcceptedOwners,
    ),
    rejectedOwnerCounts: numericPair(
      baseline.summary.taxonomy.uniqueRejectedOwners,
      compared.summary.taxonomy.uniqueRejectedOwners,
    ),
    retryAttemptCounts: numericPair(
      baseline.summary.taxonomy.retryAttempts,
      compared.summary.taxonomy.retryAttempts,
    ),
    intendedOriginalOwnerCounts: numericPair(
      baseline.summary.taxonomy.intendedOriginalCohortOwners,
      compared.summary.taxonomy.intendedOriginalCohortOwners,
    ),
    attemptedOriginalOwnerCounts: numericPair(
      baseline.summary.taxonomy.attemptedOriginalCohortOwners,
      compared.summary.taxonomy.attemptedOriginalCohortOwners,
    ),
    acceptedOriginalOwnerCounts: numericPair(
      baseline.summary.taxonomy.acceptedOriginalCohortOwners,
      compared.summary.taxonomy.acceptedOriginalCohortOwners,
    ),
    rejectedOriginalOwnerCounts: numericPair(
      baseline.summary.taxonomy.rejectedOriginalCohortOwners,
      compared.summary.taxonomy.rejectedOriginalCohortOwners,
    ),
    originalRetryAttemptCounts: numericPair(
      baseline.summary.taxonomy.originalCohortRetryAttempts,
      compared.summary.taxonomy.originalCohortRetryAttempts,
    ),
    quotedObligationTotals: numericPair(
      baseline.summary.quotedUniqueOwnerObligation,
      compared.summary.quotedUniqueOwnerObligation,
    ),
    quotedOriginalCohortObligationTotals: numericPair(
      baseline.summary.quotedOriginalCohortObligation,
      compared.summary.quotedOriginalCohortObligation,
    ),
    quotedPolicyIntentObligationTotals: numericPair(
      baseline.summary.quotedPolicyIntentObligation,
      compared.summary.quotedPolicyIntentObligation,
    ),
    quotedOriginalCohortPolicyIntentObligationTotals: numericPair(
      baseline.summary.quotedOriginalCohortPolicyIntentObligation,
      compared.summary.quotedOriginalCohortPolicyIntentObligation,
    ),
    signingBonusTotals: numericPair(
      baseline.summary.signingBonusesPaid,
      compared.summary.signingBonusesPaid,
    ),
    payroll: numericPair(
      baseline.summary.finalWeeklyPayroll,
      compared.summary.finalWeeklyPayroll,
    ),
    baseOverhead: numericPair(
      baseline.summary.finalBaseOverhead,
      compared.summary.finalBaseOverhead,
    ),
    employeeOverhead: numericPair(
      baseline.summary.finalEmployeeOverhead,
      compared.summary.finalEmployeeOverhead,
    ),
    totalOverhead: numericPair(
      baseline.summary.finalTotalOverhead,
      compared.summary.finalTotalOverhead,
    ),
    activeTheatricalReceipts: numericPair(
      baseline.summary.finalActiveTheatricalReceipts,
      compared.summary.finalActiveTheatricalReceipts,
    ),
    theatricalReceiptsReceived: numericPair(
      baseline.summary.theatricalReceiptsReceived,
      compared.summary.theatricalReceiptsReceived,
    ),
    activeProductions: numericPair(
      baseline.summary.finalActiveProductions,
      compared.summary.finalActiveProductions,
    ),
    screenplayProjects: numericPair(
      baseline.summary.finalScreenplayProjects,
      compared.summary.finalScreenplayProjects,
    ),
    castingSessions: numericPair(
      baseline.summary.finalCastingSessions,
      compared.summary.finalCastingSessions,
    ),
    readyScreenplays: numericPair(
      baseline.summary.finalReadyScreenplays,
      compared.summary.finalReadyScreenplays,
    ),
    packageReadyScreenplays: numericPair(
      baseline.summary.finalPackageReadyScreenplays,
      compared.summary.finalPackageReadyScreenplays,
    ),
    packageStaffabilityBlockers: numericPair(
      baseline.summary.taxonomy.packageStaffabilityBlockers,
      compared.summary.taxonomy.packageStaffabilityBlockers,
    ),
    packageAffordabilityBlockers: numericPair(
      baseline.summary.taxonomy.packageAffordabilityBlockers,
      compared.summary.taxonomy.packageAffordabilityBlockers,
    ),
    finalCash: numericPair(baseline.summary.finalCash, compared.summary.finalCash),
    finalStateHash: {
      baseline: baseline.summary.finalStateHash,
      compared: compared.summary.finalStateHash,
      equal: baseline.summary.finalStateHash === compared.summary.finalStateHash,
    },
    finalRngState: {
      baseline: baseline.summary.finalRngState,
      compared: compared.summary.finalRngState,
      equal: baseline.summary.finalRngState === compared.summary.finalRngState,
    },
    recurrence: {
      baseline: structuredClone(baseline.summary.recurrence),
      compared: structuredClone(compared.summary.recurrence),
    },
  }
}

/** Run all seven primary continuations, plus governed C1/C5/C6 Week-428 arms when requested. */
export function runRosterWallContinuationCorpus(input: {
  harvest: RosterWallEntryHarvest
  source: RosterWallSourceProvenance
  includeLongHorizon?: boolean
}): RosterWallContinuationCorpus {
  const armInputs: RunRosterWallContinuationInput[] = ROSTER_CONTINUATION_POLICY_IDS.map(
    (continuationPolicyId) => ({
      harvest: input.harvest,
      continuationPolicyId,
      source: input.source,
      horizonWeeks: ROSTER_WALL_PRIMARY_HORIZON,
    }),
  )
  if (input.includeLongHorizon ?? true) {
    for (const continuationPolicyId of LONG_POLICY_IDS) {
      armInputs.push({
          harvest: input.harvest,
          continuationPolicyId,
          source: input.source,
          horizonWeeks: ROSTER_WALL_RECURRENCE_HORIZON,
      })
    }
  }
  const arms: RosterWallContinuationArm[] = []
  let byteIdenticalArms = 0
  let stateHashIdenticalArms = 0
  let rngStateIdenticalArms = 0
  for (const armInput of armInputs) {
    const observed = executeContinuation(armInput, true)
    const disabled = executeContinuation(armInput, false)
    const byteIdentical = observed.finalSaveBytes === disabled.finalSaveBytes
    const stateHashIdentical =
      stateHash(observed.finalState) === stateHash(disabled.finalState)
    const rngStateIdentical =
      observed.finalState.rngState === disabled.finalState.rngState
    if (!byteIdentical || !stateHashIdentical || !rngStateIdentical) {
      throw new Error(
        `roster-wall continuation: observer changed ${armInput.continuationPolicyId} Week-${String(armInput.horizonWeeks)} behavior`,
      )
    }
    byteIdenticalArms++
    stateHashIdenticalArms++
    rngStateIdenticalArms++
    arms.push(observed.arm)
  }
  const baselines = new Map(
    arms
      .filter((arm) => arm.continuationPolicyId === 'C1-current-retry-all')
      .map((arm) => [arm.horizonWeeks, arm]),
  )
  const pairs = arms
    .filter((arm) => arm.continuationPolicyId !== 'C1-current-retry-all')
    .map((arm) => {
      const baseline = baselines.get(arm.horizonWeeks)
      if (baseline === undefined) throw new Error('roster-wall continuation: missing C1 pair baseline')
      return pairRecord(
        {
          harvest: input.harvest,
          continuationPolicyId: arm.continuationPolicyId,
          source: input.source,
          horizonWeeks: arm.horizonWeeks,
        },
        baseline,
        arm,
      )
    })
  return {
    arms,
    pairs,
    observerNeutrality: {
      checkedArms: arms.length,
      byteIdenticalArms,
      stateHashIdenticalArms,
      rngStateIdenticalArms,
      failures: 0,
    },
  }
}
