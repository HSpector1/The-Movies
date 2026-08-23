// Economy Diagnosis 02 — Week-208 causal timelines and liquidity bounds.
//
// The accepted roster-wall observatory remains the timing/order authority. This
// module adds only exact-pair diagnostics on the established 25-seed vacant
// matrix. Its liquidity treatments modify a cloned Week-196 analysis save and
// install a cash-ledger checkpoint; production code, constants, quotes, action
// gates and the original immutable entry are untouched.
//
// A treatment dollar is an EXOGENOUS ONE-TIME GRANT. It is intentionally an
// upper-bound causal probe, not a recommendation for a loan, bailout, discount,
// grace period or save change. Long-horizon recurrence is measured precisely so
// the grant cannot be misreported as a durable repair.

import { createHash } from 'node:crypto'
import {
  exportSave,
  importSave,
  makeSaveV14,
  stableStringify,
} from '../../core/index.js'
import type { CreativeRole, GameState } from '../../core/index.js'
import {
  ROSTER_WALL_CANONICAL_SEEDS,
  rosterWallCashReconciliation,
} from '../roster-wall/schema.js'
import {
  ROSTER_WALL_ENTRY_WEEK,
  ROSTER_WALL_OPERATING_POLICY_IDS,
  runRosterWallEntryCampaign,
} from '../roster-wall/campaign.js'
import type {
  RosterWallEntryHarvest,
  RosterWallOperatingPolicyId,
} from '../roster-wall/campaign.js'
import {
  runRosterWallContinuationArm,
} from '../roster-wall/continuation.js'
import type {
  RosterWallContinuationArm,
  RosterWallRoleCoverage,
} from '../roster-wall/continuation.js'
import type { RosterWallSourceProvenance } from '../roster-wall/provenance.js'
import {
  STATE_PACKAGE_OPTIONS,
  bareMinimumPackage,
  standardPackage,
} from '../d16/packages.js'
import { assessFinancialState } from '../d16/states.js'
import type { FinancialState } from '../d16/states.js'
import { distribution, rate } from '../economy-truth-audit/statistics.js'
import type {
  Distribution,
  RateEstimate,
} from '../economy-truth-audit/statistics.js'

export const DIAGNOSIS_RENEWAL_SCHEMA_VERSION =
  'economy-diagnosis-renewal-v2' as const

export const DIAGNOSIS_RENEWAL_SEEDS = [...ROSTER_WALL_CANONICAL_SEEDS] as const
export const DIAGNOSIS_RENEWAL_OPERATING_POLICIES = [
  ...ROSTER_WALL_OPERATING_POLICY_IDS,
] as const

export type RenewalTreatmentId =
  | 'current'
  | 'half-all-obligation-gap-grant'
  | 'minimum-role-gap-grant'
  | 'role-coverage-first-no-grant'
  | 'all-obligation-gap-grant'

const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex')

function financialState(state: GameState): FinancialState {
  return assessFinancialState(state, {
    bareMinimum: bareMinimumPackage(state, STATE_PACKAGE_OPTIONS),
    standard: standardPackage(state, STATE_PACKAGE_OPTIONS),
  }).state
}

function entryState(harvest: RosterWallEntryHarvest): GameState {
  const save = importSave(harvest.entrySaveBytes)
  if (save.saveVersion !== 14) {
    throw new Error('economy diagnosis renewal: expected SaveFileV14 entry')
  }
  return save.state
}

/**
 * Clone an immutable entry and add an analysis-only opening balance. A checkpoint
 * makes every subsequent cash movement reconcile without fabricating a production
 * ledger kind.
 */
export function withCashGrantAtEntry(
  harvest: RosterWallEntryHarvest,
  grant: number,
): RosterWallEntryHarvest {
  if (!Number.isFinite(grant) || grant < 0) {
    throw new Error(`economy diagnosis renewal: invalid grant ${String(grant)}`)
  }
  if (grant === 0) return harvest
  const state = structuredClone(entryState(harvest))
  state.studio.cash += grant
  state.cashLedgerCheckpoint = {
    cash: state.studio.cash,
    ledgerLength: state.ledger.length,
  }
  const entrySave = makeSaveV14(state)
  const entrySaveBytes = exportSave(entrySave)
  const entryStateHash = sha256(stableStringify(entrySave.state))
  const preEntryWindowEve = structuredClone(harvest.preEntryWindowEve)
  preEntryWindowEve.after = {
    ...preEntryWindowEve.after,
    stateHash: entryStateHash,
    cash: entrySave.state.studio.cash,
    cashReconciliation: rosterWallCashReconciliation(entrySave.state),
  }
  return {
    ...harvest,
    entrySave,
    entrySaveBytes,
    entrySaveHash: sha256(entrySaveBytes),
    entryStateHash,
    entryRngState: entrySave.state.rngState,
    preEntryWindowEve,
  }
}

type CompactArm = {
  treatmentId: RenewalTreatmentId
  continuationPolicyId: RosterWallContinuationArm['continuationPolicyId']
  horizonWeeks: number
  grant: number
  entrySaveHash: string
  finalCash: number
  finalStateHash: string
  finalRngState: string
  signingBonusesPaid: number
  retainedOriginalCohort: number
  releasedOriginalCohort: number
  acceptedOriginalOwners: number
  rejectedOriginalOwners: number
  originalRetryAttempts: number
  partialWall: boolean
  fullWall: boolean
  roleCoverageLoss: boolean
  missingRolesAtExpiry: CreativeRole[]
  packageStaffabilityBlockers: number
  packageAffordabilityBlockers: number
  finalActiveContracts: number
  finalRoleCoverage: RosterWallRoleCoverage
  recurrenceEnds: number[]
  invariantFailures: number
}

function compactArm(
  treatmentId: RenewalTreatmentId,
  grant: number,
  arm: RosterWallContinuationArm,
): CompactArm {
  const taxonomy = arm.summary.taxonomy
  return {
    treatmentId,
    continuationPolicyId: arm.continuationPolicyId,
    horizonWeeks: arm.horizonWeeks,
    grant,
    entrySaveHash: arm.entrySaveHash,
    finalCash: arm.summary.finalCash,
    finalStateHash: arm.summary.finalStateHash,
    finalRngState: arm.summary.finalRngState,
    signingBonusesPaid: arm.summary.signingBonusesPaid,
    retainedOriginalCohort: taxonomy.retainedOriginalCohort,
    releasedOriginalCohort: taxonomy.releasedOriginalCohort,
    acceptedOriginalOwners: taxonomy.acceptedOriginalCohortOwners,
    rejectedOriginalOwners: taxonomy.rejectedOriginalCohortOwners,
    originalRetryAttempts: taxonomy.originalCohortRetryAttempts,
    partialWall: taxonomy.partialCohortWall,
    fullWall: taxonomy.fullInvoluntaryCohortWall,
    roleCoverageLoss: taxonomy.contractRoleCoverageLoss,
    missingRolesAtExpiry: [...taxonomy.missingFoundingRolesAtOriginalExpiry],
    packageStaffabilityBlockers: taxonomy.packageStaffabilityBlockers,
    packageAffordabilityBlockers: taxonomy.packageAffordabilityBlockers,
    finalActiveContracts: arm.summary.finalActiveContractTalentIds.length,
    finalRoleCoverage: { ...arm.summary.finalRoleCoverage },
    recurrenceEnds: arm.summary.recurrence.map((fact) => fact.contractEndWeekExclusive),
    invariantFailures: arm.summary.invariantFailures,
  }
}

type TimelineWarning = {
  week: 156 | 182 | 196
  actionLegal: boolean
  cash: number
  weeklyBurn: number
  allRenewalObligation: number
  minimumRoleObligation: number
  allRenewalsAffordable: boolean
  minimumRoleAffordable: boolean
}

type TimelineWeek = {
  week: number
  arrivalWeek: number
  cashBefore: number
  cashAfterRenewals: number
  cashAfterActions: number
  cashAfterTick: number
  acceptedRenewals: number
  rejectedRenewals: number
  acceptedTalentIds: string[]
  rejectedTalentIds: string[]
  quotedOpenObligation: number
  payroll: number
  overhead: number
  theatricalReceipts: number
  activeContractsAfterTick: number
  missingRolesAfterTick: CreativeRole[]
  staffabilityBlockers: number
  affordabilityBlockers: number
}

type TimelineOwner = {
  talentId: string
  role: CreativeRole
  signingBonusAt196: number
  affordableAt196: boolean
  earliestLaterLegalFeasibleWeek: number | null
  acceptedWeek: number | null
  rejectedAttempts: number
  retainedAt208: boolean
}

export type RenewalTimeline = {
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  entryId: string
  entrySaveHash: string
  financialStateAt196: FinancialState
  classification: string
  warnings: TimelineWarning[]
  owners: TimelineOwner[]
  weeks196Through207: TimelineWeek[]
  snapshots: Array<{
    week: 208 | 220 | 260
    cash: number
    activeContracts: number
    missingRoles: CreativeRole[]
    staffabilityBlockers: number
    affordabilityBlockers: number
  }>
  outcome: CompactArm
}

function compactTimeline(
  harvest: RosterWallEntryHarvest,
  arm: RosterWallContinuationArm,
  stateAt196: FinancialState,
): RenewalTimeline {
  const warnings: TimelineWarning[] = harvest.shadows.map((shadow) => ({
    week: shadow.week,
    actionLegal: shadow.actionLegal,
    cash: shadow.cash,
    weeklyBurn: shadow.weeklyBurn,
    allRenewalObligation: shadow.aggregateAllRenewalSigningBonus,
    minimumRoleObligation: shadow.minimumRoleCoverage.signingBonus,
    allRenewalsAffordable: shadow.allRenewalsAffordableNow,
    minimumRoleAffordable: shadow.minimumRoleCoverage.affordableNow,
  }))
  const shadow196 = harvest.shadows.find((shadow) => shadow.week === 196)!
  const acceptedAt = new Map<string, number>()
  const rejectedAttempts = new Map<string, number>()
  for (const intent of arm.renewalIntents) {
    if (intent.accepted && !acceptedAt.has(intent.talentId)) {
      acceptedAt.set(intent.talentId, intent.actualWeek)
    }
    if (!intent.accepted) {
      rejectedAttempts.set(
        intent.talentId,
        (rejectedAttempts.get(intent.talentId) ?? 0) + 1,
      )
    }
  }
  const retained = new Set(arm.summary.retainedOriginalCohortTalentIds)
  const owners: TimelineOwner[] = harvest.cohort.map((member) => {
    const owner = shadow196.owners.find((candidate) => candidate.talentId === member.talentId)
    if (owner === undefined) {
      throw new Error(`economy diagnosis renewal: missing owner ${member.talentId} at Week 196`)
    }
    return {
      talentId: member.talentId,
      role: member.role,
      signingBonusAt196: owner.quote.signingBonus,
      affordableAt196: owner.affordableNow,
      earliestLaterLegalFeasibleWeek: owner.earliestLaterLegalFeasibleWeek,
      acceptedWeek: acceptedAt.get(member.talentId) ?? null,
      rejectedAttempts: rejectedAttempts.get(member.talentId) ?? 0,
      retainedAt208: retained.has(member.talentId),
    }
  })
  const weeks196Through207: TimelineWeek[] = arm.weekly
    .filter((week) => week.week >= 196 && week.week <= 207)
    .map((week) => {
      const intents = arm.renewalIntents.filter((intent) => intent.actualWeek === week.week)
      return {
        week: week.week,
        arrivalWeek: week.arrivalWeek,
        cashBefore: week.cashBefore,
        cashAfterRenewals: week.cashAfterRenewals,
        cashAfterActions: week.cashAfterActions,
        cashAfterTick: week.cashAfterTick,
        acceptedRenewals: intents.filter((intent) => intent.accepted).length,
        rejectedRenewals: intents.filter((intent) => !intent.accepted).length,
        acceptedTalentIds: intents.filter((intent) => intent.accepted).map((intent) => intent.talentId),
        rejectedTalentIds: intents.filter((intent) => !intent.accepted).map((intent) => intent.talentId),
        quotedOpenObligation: week.quotedRenewalObligation208,
        payroll: week.ledgerPayroll,
        overhead: week.ledgerOverhead,
        theatricalReceipts: week.theatricalReceiptReconciliation.ledgerTotal,
        activeContractsAfterTick: week.activeContractTalentIds.length,
        missingRolesAfterTick: [...week.missingFoundingRoles],
        staffabilityBlockers: week.packageStaffabilityBlockers.length,
        affordabilityBlockers: week.packageAffordabilityBlockers.length,
      }
    })
  const snapshots: RenewalTimeline['snapshots'] = []
  const addSnapshot = (week: 208 | 220 | 260): void => {
    if (week === 260) {
      const last = arm.weekly.find((row) => row.arrivalWeek === 260)
      if (last !== undefined) {
        snapshots.push({
          week,
          cash: last.cashAfterTick,
          activeContracts: last.activeContractTalentIds.length,
          missingRoles: [...last.missingFoundingRoles],
          staffabilityBlockers: last.packageStaffabilityBlockers.length,
          affordabilityBlockers: last.packageAffordabilityBlockers.length,
        })
      }
      return
    }
    const boundary = arm.boundaries.find((candidate) => candidate.week === week)
    if (boundary !== undefined) {
      snapshots.push({
        week,
        cash: boundary.cashReconciliation.actualCash,
        activeContracts: boundary.cohortRetainedTalentIds.length,
        missingRoles: [...boundary.missingFoundingRoles],
        staffabilityBlockers: boundary.packageStaffabilityBlockers,
        affordabilityBlockers: boundary.packageAffordabilityBlockers,
      })
    }
  }
  addSnapshot(208)
  addSnapshot(220)
  addSnapshot(260)
  return {
    seed: harvest.seed,
    operatingPolicyId: harvest.operatingPolicyId,
    entryId: arm.entryId,
    entrySaveHash: harvest.entrySaveHash,
    financialStateAt196: stateAt196,
    classification: '',
    warnings,
    owners,
    weeks196Through207,
    snapshots,
    outcome: compactArm('current', 0, arm),
  }
}

export type RenewalDiagnosisCell = {
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  estatePolicyId: 'vacant'
  cashAt196: number
  financialStateAt196: FinancialState
  cashNegativeByWarning: { week156: boolean; week182: boolean; week196: boolean }
  allRenewalObligation: number
  minimumRoleObligation: number
  weeklyBurnAt196: number
  allGap: number
  minimumRoleGap: number
  baseline260: CompactArm
  halfGap260: CompactArm
  minimumRoleGap260: CompactArm
  roleOrder260: CompactArm
  fullGap260: CompactArm
  baseline428: CompactArm
  fullGap428: CompactArm
  zeroGrantIdentityAt260: boolean | null
  timeline: RenewalTimeline
}

function runArm(
  harvest: RosterWallEntryHarvest,
  policy: 'C1-current-retry-all' | 'C3-role-coverage-first',
  horizonWeeks: 260 | 428,
  source: RosterWallSourceProvenance,
): RosterWallContinuationArm {
  return runRosterWallContinuationArm({
    harvest,
    continuationPolicyId: policy,
    horizonWeeks,
    source,
  })
}

export function runRenewalDiagnosisCell(
  seed: string,
  operatingPolicyId: RosterWallOperatingPolicyId,
  source: RosterWallSourceProvenance,
): RenewalDiagnosisCell {
  const harvest = runRosterWallEntryCampaign({
    seed,
    operatingPolicyId,
    estatePolicyId: 'vacant',
  })
  const state196 = entryState(harvest)
  const financialStateAt196 = financialState(state196)
  const warning156 = harvest.shadows.find((shadow) => shadow.week === 156)!
  const warning182 = harvest.shadows.find((shadow) => shadow.week === 182)!
  const warning196 = harvest.shadows.find((shadow) => shadow.week === 196)!
  const allGap = Math.max(
    0,
    warning196.aggregateAllRenewalSigningBonus - warning196.cash,
  )
  const minimumRoleGap = Math.max(
    0,
    warning196.minimumRoleCoverage.signingBonus - warning196.cash,
  )
  const halfGap = allGap / 2
  const halfHarvest = withCashGrantAtEntry(harvest, halfGap)
  const minimumHarvest = withCashGrantAtEntry(harvest, minimumRoleGap)
  const fullHarvest = withCashGrantAtEntry(harvest, allGap)

  const baseline260Arm = runArm(harvest, 'C1-current-retry-all', 260, source)
  const halfGap260Arm = runArm(halfHarvest, 'C1-current-retry-all', 260, source)
  const minimumRoleGap260Arm = runArm(minimumHarvest, 'C1-current-retry-all', 260, source)
  const roleOrder260Arm = runArm(harvest, 'C3-role-coverage-first', 260, source)
  const fullGap260Arm = runArm(fullHarvest, 'C1-current-retry-all', 260, source)
  const baseline428Arm = runArm(harvest, 'C1-current-retry-all', 428, source)
  const fullGap428Arm = runArm(fullHarvest, 'C1-current-retry-all', 428, source)

  return {
    seed,
    operatingPolicyId,
    estatePolicyId: 'vacant',
    cashAt196: warning196.cash,
    financialStateAt196,
    cashNegativeByWarning: {
      week156: warning156.cash < 0,
      week182: warning182.cash < 0,
      week196: warning196.cash < 0,
    },
    allRenewalObligation: warning196.aggregateAllRenewalSigningBonus,
    minimumRoleObligation: warning196.minimumRoleCoverage.signingBonus,
    weeklyBurnAt196: warning196.weeklyBurn,
    allGap,
    minimumRoleGap,
    baseline260: compactArm('current', 0, baseline260Arm),
    halfGap260: compactArm('half-all-obligation-gap-grant', halfGap, halfGap260Arm),
    minimumRoleGap260: compactArm(
      'minimum-role-gap-grant',
      minimumRoleGap,
      minimumRoleGap260Arm,
    ),
    roleOrder260: compactArm(
      'role-coverage-first-no-grant',
      0,
      roleOrder260Arm,
    ),
    fullGap260: compactArm('all-obligation-gap-grant', allGap, fullGap260Arm),
    baseline428: compactArm('current', 0, baseline428Arm),
    fullGap428: compactArm('all-obligation-gap-grant', allGap, fullGap428Arm),
    zeroGrantIdentityAt260:
      allGap === 0
        ? baseline260Arm.summary.finalStateHash === fullGap260Arm.summary.finalStateHash &&
          baseline260Arm.summary.finalRngState === fullGap260Arm.summary.finalRngState
        : null,
    timeline: compactTimeline(harvest, baseline260Arm, financialStateAt196),
  }
}

type RenewalArmSummary = {
  treatmentId: RenewalTreatmentId
  continuationPolicyId: string
  horizonWeeks: number
  runs: number
  grant: Distribution
  finalCash: Distribution
  finalCashDeltaVsCurrent: Distribution
  finalCashDeltaNetOfGrant: Distribution
  acceptedOriginalOwners: Distribution
  rejectedOriginalOwners: Distribution
  originalRetryAttempts: Distribution
  signingBonusesPaid: Distribution
  fullWall: RateEstimate
  partialWall: RateEstimate
  roleCoverageLoss: RateEstimate
  zeroActiveContractsAtEnd: RateEstimate
  packageStaffabilityBlockers: Distribution
  packageAffordabilityBlockers: Distribution
  invariantFailures: number
}

function armSummary(
  cells: readonly RenewalDiagnosisCell[],
  select: (cell: RenewalDiagnosisCell) => CompactArm,
  baseline: (cell: RenewalDiagnosisCell) => CompactArm,
): RenewalArmSummary {
  const arms = cells.map(select)
  const bases = cells.map(baseline)
  const first = arms[0]
  if (first === undefined) throw new Error('economy diagnosis renewal: empty arm summary')
  return {
    treatmentId: first.treatmentId,
    continuationPolicyId: first.continuationPolicyId,
    horizonWeeks: first.horizonWeeks,
    runs: arms.length,
    grant: distribution(arms.map((arm) => arm.grant)),
    finalCash: distribution(arms.map((arm) => arm.finalCash)),
    finalCashDeltaVsCurrent: distribution(
      arms.map((arm, index) => arm.finalCash - bases[index]!.finalCash),
    ),
    finalCashDeltaNetOfGrant: distribution(
      arms.map(
        (arm, index) => arm.finalCash - bases[index]!.finalCash - arm.grant,
      ),
    ),
    acceptedOriginalOwners: distribution(arms.map((arm) => arm.acceptedOriginalOwners)),
    rejectedOriginalOwners: distribution(arms.map((arm) => arm.rejectedOriginalOwners)),
    originalRetryAttempts: distribution(arms.map((arm) => arm.originalRetryAttempts)),
    signingBonusesPaid: distribution(arms.map((arm) => arm.signingBonusesPaid)),
    fullWall: rate(arms.filter((arm) => arm.fullWall).length, arms.length),
    partialWall: rate(arms.filter((arm) => arm.partialWall).length, arms.length),
    roleCoverageLoss: rate(arms.filter((arm) => arm.roleCoverageLoss).length, arms.length),
    zeroActiveContractsAtEnd: rate(
      arms.filter((arm) => arm.finalActiveContracts === 0).length,
      arms.length,
    ),
    packageStaffabilityBlockers: distribution(
      arms.map((arm) => arm.packageStaffabilityBlockers),
    ),
    packageAffordabilityBlockers: distribution(
      arms.map((arm) => arm.packageAffordabilityBlockers),
    ),
    invariantFailures: arms.reduce((sum, arm) => sum + arm.invariantFailures, 0),
  }
}

function exemplar(
  candidates: readonly RenewalDiagnosisCell[],
  classification: string,
): RenewalTimeline | null {
  if (candidates.length === 0) return null
  const ordered = [...candidates].sort(
    (a, b) =>
      a.baseline260.finalCash - b.baseline260.finalCash ||
      a.seed.localeCompare(b.seed) ||
      a.operatingPolicyId.localeCompare(b.operatingPolicyId),
  )
  const selected = ordered[Math.floor((ordered.length - 1) / 2)]!
  return { ...selected.timeline, classification }
}

export type RenewalDiagnosisAggregate = {
  identity: 'D02-RENEWAL-LIQUIDITY-ORDER-75x-v2'
  experiment: {
    seeds: number
    operatingPolicies: number
    entries: number
    estate: 'vacant'
    entryWeek: typeof ROSTER_WALL_ENTRY_WEEK
    horizons: readonly [260, 428]
    treatmentBoundary: string
  }
  entry: {
    cashAt196: Distribution
    allRenewalObligation: Distribution
    minimumRoleObligation: Distribution
    weeklyBurnAt196: Distribution
    allGap: Distribution
    minimumRoleGap: Distribution
    negativeCashAt156: RateEstimate
    negativeCashAt182: RateEstimate
    negativeCashAt196: RateEstimate
    financialStatesAt196: Record<FinancialState, number>
  }
  arms: RenewalArmSummary[]
  liquidityAffected: {
    identity: 'entries-with-positive-all-obligation-gap-at-196'
    entries: number
    arms: RenewalArmSummary[]
    recurrence: {
      current428: RenewalArmSummary
      oneTimeFullGapGrant428: RenewalArmSummary
    }
  }
  recurrence: {
    current428: RenewalArmSummary
    oneTimeFullGapGrant428: RenewalArmSummary
  }
  zeroGrantIdentity: { checked: number; failures: number }
  wallDirection: {
    baselineFullWalls: number
    baselinePartialWalls: number
    healthyAt196Entries: number
    healthyAt196AnyWalls: number
    fullWallsCashNonnegativeAt156: number
    fullWallsCashNonnegativeAt182: number
    fullWallsCashNonnegativeAt196: number
    fullWallsAllRenewalsAffordableAt156: number
    fullWallsAllRenewalsAffordableAt182: number
    fullWallsMinimumRolesAffordableAt156: number
    fullWallsMinimumRolesAffordableAt182: number
    fullWallsByOperatingPolicy: Record<string, number>
  }
  timelines: {
    healthyToWall: RenewalTimeline | null
    distressedToWall: RenewalTimeline | null
    healthyNoWallControl: RenewalTimeline | null
    cashNonnegativeAt156ToWall: RenewalTimeline | null
    cashNonnegativeAt182ToWall: RenewalTimeline | null
    positiveCashToWallFallback: RenewalTimeline | null
  }
}

export function aggregateRenewalDiagnosis(
  cells: readonly RenewalDiagnosisCell[],
): RenewalDiagnosisAggregate {
  const stateCounts = Object.fromEntries(
    ['healthy', 'constrained', 'bareMinOnly', 'noProduction', 'insolvent'].map((state) => [state, 0]),
  ) as Record<FinancialState, number>
  for (const cell of cells) stateCounts[cell.financialStateAt196]++
  const healthyWall = cells.filter(
    (cell) => cell.financialStateAt196 === 'healthy' && cell.baseline260.fullWall,
  )
  const distressedWall = cells.filter(
    (cell) => cell.financialStateAt196 !== 'healthy' && cell.baseline260.fullWall,
  )
  const healthyNoWall = cells.filter(
    (cell) =>
      cell.financialStateAt196 === 'healthy' &&
      !cell.baseline260.fullWall &&
      !cell.baseline260.partialWall,
  )
  const positiveCashWall = cells.filter(
    (cell) => cell.cashAt196 >= 0 && cell.baseline260.fullWall,
  )
  const cashNonnegative156Wall = cells.filter(
    (cell) => !cell.cashNegativeByWarning.week156 && cell.baseline260.fullWall,
  )
  const cashNonnegative182Wall = cells.filter(
    (cell) => !cell.cashNegativeByWarning.week182 && cell.baseline260.fullWall,
  )
  const fullWalls = cells.filter((cell) => cell.baseline260.fullWall)
  const partialWalls = cells.filter((cell) => cell.baseline260.partialWall)
  const healthyEntries = cells.filter((cell) => cell.financialStateAt196 === 'healthy')
  const fullWallsByOperatingPolicy = Object.fromEntries(
    DIAGNOSIS_RENEWAL_OPERATING_POLICIES.map((policy) => [
      policy,
      fullWalls.filter((cell) => cell.operatingPolicyId === policy).length,
    ]),
  )
  const fullWallWarningCount = (
    week: 156 | 182,
    select: (warning: TimelineWarning) => boolean,
  ): number =>
    fullWalls.filter((cell) => {
      const warning = cell.timeline.warnings.find((candidate) => candidate.week === week)
      return warning !== undefined && select(warning)
    }).length
  const identities = cells.filter((cell) => cell.zeroGrantIdentityAt260 !== null)
  const current260 = armSummary(cells, (cell) => cell.baseline260, (cell) => cell.baseline260)
  const current428 = armSummary(cells, (cell) => cell.baseline428, (cell) => cell.baseline428)
  const full428 = armSummary(cells, (cell) => cell.fullGap428, (cell) => cell.baseline428)
  const affected = cells.filter((cell) => cell.allGap > 0)
  const affectedCurrent260 = armSummary(
    affected,
    (cell) => cell.baseline260,
    (cell) => cell.baseline260,
  )
  return {
    identity: 'D02-RENEWAL-LIQUIDITY-ORDER-75x-v2',
    experiment: {
      seeds: new Set(cells.map((cell) => cell.seed)).size,
      operatingPolicies: new Set(cells.map((cell) => cell.operatingPolicyId)).size,
      entries: cells.length,
      estate: 'vacant',
      entryWeek: ROSTER_WALL_ENTRY_WEEK,
      horizons: [260, 428],
      treatmentBoundary:
        'analysis-only exogenous cash at immutable Week-196 entry; quote/action/tick/RNG law unchanged',
    },
    entry: {
      cashAt196: distribution(cells.map((cell) => cell.cashAt196)),
      allRenewalObligation: distribution(cells.map((cell) => cell.allRenewalObligation)),
      minimumRoleObligation: distribution(cells.map((cell) => cell.minimumRoleObligation)),
      weeklyBurnAt196: distribution(cells.map((cell) => cell.weeklyBurnAt196)),
      allGap: distribution(cells.map((cell) => cell.allGap)),
      minimumRoleGap: distribution(cells.map((cell) => cell.minimumRoleGap)),
      negativeCashAt156: rate(
        cells.filter((cell) => cell.cashNegativeByWarning.week156).length,
        cells.length,
      ),
      negativeCashAt182: rate(
        cells.filter((cell) => cell.cashNegativeByWarning.week182).length,
        cells.length,
      ),
      negativeCashAt196: rate(
        cells.filter((cell) => cell.cashNegativeByWarning.week196).length,
        cells.length,
      ),
      financialStatesAt196: stateCounts,
    },
    arms: [
      current260,
      armSummary(cells, (cell) => cell.halfGap260, (cell) => cell.baseline260),
      armSummary(cells, (cell) => cell.minimumRoleGap260, (cell) => cell.baseline260),
      armSummary(cells, (cell) => cell.roleOrder260, (cell) => cell.baseline260),
      armSummary(cells, (cell) => cell.fullGap260, (cell) => cell.baseline260),
    ],
    liquidityAffected: {
      identity: 'entries-with-positive-all-obligation-gap-at-196',
      entries: affected.length,
      arms: [
        affectedCurrent260,
        armSummary(affected, (cell) => cell.halfGap260, (cell) => cell.baseline260),
        armSummary(
          affected,
          (cell) => cell.minimumRoleGap260,
          (cell) => cell.baseline260,
        ),
        armSummary(affected, (cell) => cell.roleOrder260, (cell) => cell.baseline260),
        armSummary(affected, (cell) => cell.fullGap260, (cell) => cell.baseline260),
      ],
      recurrence: {
        current428: armSummary(
          affected,
          (cell) => cell.baseline428,
          (cell) => cell.baseline428,
        ),
        oneTimeFullGapGrant428: armSummary(
          affected,
          (cell) => cell.fullGap428,
          (cell) => cell.baseline428,
        ),
      },
    },
    recurrence: {
      current428,
      oneTimeFullGapGrant428: full428,
    },
    zeroGrantIdentity: {
      checked: identities.length,
      failures: identities.filter((cell) => cell.zeroGrantIdentityAt260 === false).length,
    },
    wallDirection: {
      baselineFullWalls: fullWalls.length,
      baselinePartialWalls: partialWalls.length,
      healthyAt196Entries: healthyEntries.length,
      healthyAt196AnyWalls: healthyEntries.filter(
        (cell) => cell.baseline260.fullWall || cell.baseline260.partialWall,
      ).length,
      fullWallsCashNonnegativeAt156: cashNonnegative156Wall.length,
      fullWallsCashNonnegativeAt182: cashNonnegative182Wall.length,
      fullWallsCashNonnegativeAt196: positiveCashWall.length,
      fullWallsAllRenewalsAffordableAt156: fullWallWarningCount(
        156,
        (warning) => warning.allRenewalsAffordable,
      ),
      fullWallsAllRenewalsAffordableAt182: fullWallWarningCount(
        182,
        (warning) => warning.allRenewalsAffordable,
      ),
      fullWallsMinimumRolesAffordableAt156: fullWallWarningCount(
        156,
        (warning) => warning.minimumRoleAffordable,
      ),
      fullWallsMinimumRolesAffordableAt182: fullWallWarningCount(
        182,
        (warning) => warning.minimumRoleAffordable,
      ),
      fullWallsByOperatingPolicy,
    },
    timelines: {
      healthyToWall: exemplar(healthyWall, 'formal-healthy-at-196-to-full-wall'),
      distressedToWall: exemplar(distressedWall, 'not-healthy-at-196-to-full-wall'),
      healthyNoWallControl: exemplar(healthyNoWall, 'formal-healthy-at-196-no-wall-control'),
      cashNonnegativeAt156ToWall: exemplar(
        cashNonnegative156Wall,
        'cash-nonnegative-at-156-to-full-wall; not-a-formal-health-classification',
      ),
      cashNonnegativeAt182ToWall: exemplar(
        cashNonnegative182Wall,
        'cash-nonnegative-at-182-to-full-wall; not-a-formal-health-classification',
      ),
      positiveCashToWallFallback: exemplar(positiveCashWall, 'cash-nonnegative-at-196-to-full-wall'),
    },
  }
}
