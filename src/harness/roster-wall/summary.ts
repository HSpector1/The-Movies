// Deterministic Week-208 roster-wall research summary.
//
// The accumulator consumes the exact serialized evidence rows. It retains only
// bounded entry/arm aggregates, so the complete corpus can be generated and
// independently re-summarized without loading rows.jsonl into memory.

import { FOUNDING_MINIMUMS, weeklySalary } from '../../core/index.js'
import type { CreativeRole } from '../../core/index.js'
import type {
  RosterWallAcceptedArtifactCounts,
  RosterWallAcceptedArtifactMatrix,
  RosterWallAcceptedArtifactSummary,
  RosterWallAcceptedRecordTypeCounts,
  RosterWallArtifactProfile,
} from './artifacts.js'
import type {
  RosterWallBoundaryRecord,
  RosterWallPairRecord,
  RosterWallRenewalIntentRecord,
  RosterWallRoleCoverage,
  RosterWallWeeklyRecord,
} from './continuation.js'
import type { RosterWallMechanicsFixtureRow } from './fixtures.js'
import type {
  RosterWallPlayerPolicyBoundaryRecord,
  RosterWallPlayerPolicyEntryRecord,
  RosterWallPlayerPolicyRenewalIntentRecord,
  RosterWallPlayerPolicyWeeklyRecord,
} from './player-policy.js'
import type { RosterWallSourceProvenance } from './provenance.js'
import {
  ROSTER_WALL_EXPERIMENT_ID,
  ROSTER_WALL_OBSERVER_SCHEMA_VERSION,
  ROSTER_WALL_SEED_SET_ID,
} from './schema.js'
import type {
  RosterWallEntryRecord,
  RosterWallWindowShadowRecord,
} from './schema.js'
import type { RosterWallArtifactRecord } from './records.js'

const ROLES = ['actor', 'director', 'writer', 'craft'] as const
export type RosterWallSummaryGovernance = {
  schemaVersion: typeof ROSTER_WALL_OBSERVER_SCHEMA_VERSION
  experimentId: typeof ROSTER_WALL_EXPERIMENT_ID
  seedSetId: typeof ROSTER_WALL_SEED_SET_ID
  profile: RosterWallArtifactProfile
  completeEvidence: boolean
  source: RosterWallSourceProvenance
  matrix: RosterWallAcceptedArtifactMatrix
}

export type RosterWallCashAtWindowStratum =
  | 'negative-cash'
  | 'no-owner-affordable'
  | 'some-owner-affordable'
  | 'minimum-role-coverage-affordable'
  | 'all-renewals-affordable'
  | 'unclassified'

export type RosterWallMetricDistribution = {
  n: number
  min: number | null
  p25: number | null
  median: number | null
  p75: number | null
  max: number | null
}

export type RosterWallPairSigns = {
  negative: number
  zero: number
  positive: number
}

export type RosterWallWarningFact = {
  entryId: string
  seed: string
  operatingPolicyId: string
  estatePolicyId: string
  week: number
  relation: string
  actionLegal: boolean
  cash: number
  aggregateAllRenewalSigningBonus: number
  minimumRoleCoverageSigningBonus: number
  weeklyBurn: number
  allRenewalsAffordableNow: boolean
  minimumRoleCoverageAffordableNow: boolean
  minimumRoleCoverageTalentIds: string[]
  owners: number
  ownersAffordableNow: number
  ownersWithLaterLegalFeasibleWeek: number
  ownerFacts: Array<{
    talentId: string
    role: CreativeRole
    signingBonus: number
    affordableNow: boolean
    earliestLaterLegalFeasibleWeek: number | null
  }>
}

export type RosterWallRunFact = {
  entryId: string
  seed: string
  operatingPolicyId: string
  estatePolicyId: string
  continuationPolicyId: string
  horizonWeeks: number
  cashAtWindowStratum: RosterWallCashAtWindowStratum
  taxonomyOutcome: string
  runs: 1
  cohorts: 1
  cohortOwners: number
  intendedOriginalOwners: number
  attemptedOriginalOwners: number
  acceptedOriginalOwners: number
  uniqueRejectedOriginalOwners: number
  originalRetryAttempts: number
  allAttemptedContractObligations: number
  allAcceptedContractObligations: number
  allUniqueRejectedContractObligations: number
  allRetryAttempts: number
  allAcceptedRenewals: number
  recurrenceAttemptedContractObligations: number
  recurrenceAcceptedContractObligations: number
  recurrenceUniqueRejectedContractObligations: number
  recurrenceRetryAttempts: number
  retainedOwners: number
  releasedOwners: number
  retainedOwnerIds: string[]
  releasedOwnerIds: string[]
  retainedOwnersByRole: Record<CreativeRole, number>
  releasedOwnersByRole: Record<CreativeRole, number>
  renewalPressureWeeks: number
  renewalPressureWeekNumbers: number[]
  recurrenceQuotedObligations: Array<{ week: number; signingBonus: number }>
  partialCohortWall: boolean
  fullInvoluntaryCohortWall: boolean
  contractRoleCoverageLoss: boolean
  missingFoundingRoles: CreativeRole[]
  roleCoverageLossWeeks: number
  roleCoverageLossWeekNumbers: number[]
  packageStaffabilityBlockers: number
  packageAffordabilityBlockers: number
  absorbingNoDecisionWeeks: number
  originalSigningBonusesPaid: number
  originalGuaranteedPayrollAccepted: number
  originalGuaranteedCashObligationAccepted: number
  allSigningBonusesPaid: number
  allGuaranteedPayrollAccepted: number
  allGuaranteedCashObligationAccepted: number
  recurrenceWindows: number
  recurrencePostExpiryBoundaries: number
  recurrenceWindowWeeks: number[]
  recurrencePostExpiryWeeks: number[]
  recurrencePostRoleCoverageLossWeeks: number[]
  expiryPayrollDelta: number
  expiryBaseOverheadDelta: number
  expiryEmployeeOverheadDelta: number
  firstPostExpiryDecisionStaffabilityBlockers: number
  firstPostExpiryDecisionAffordabilityBlockers: number
  postExpiry12DecisionStaffabilityBlockers: number
  postExpiry12DecisionAffordabilityBlockers: number
  finalCash: number | null
  finalRoleCoverage: RosterWallRoleCoverage | null
}

export type RosterWallAggregate = {
  dimension: string
  value: string
  runs: number
  cohorts: number
  intendedOriginalOwners: number
  attemptedOriginalOwners: number
  acceptedOriginalOwners: number
  uniqueRejectedOriginalOwners: number
  originalRetryAttempts: number
  allAttemptedContractObligations: number
  allAcceptedContractObligations: number
  allUniqueRejectedContractObligations: number
  allRetryAttempts: number
  partialCohortWalls: number
  fullInvoluntaryCohortWalls: number
  contractRoleCoverageLosses: number
  packageStaffabilityBlockers: number
  packageAffordabilityBlockers: number
}

export type RosterWallPairFact = {
  entryId: string
  seed: string
  operatingPolicyId: string
  estatePolicyId: 'vacant'
  comparedPolicyId: string
  horizonWeeks: number
  pairs: 1
  acceptedOwnerDelta: number
  uniqueRejectedOwnerDelta: number
  retryAttemptDelta: number
  retainedOwnerDelta: number
  missingRoleDelta: number
  signingBonusDelta: number
  payrollDelta: number
  employeeOverheadDelta: number
  staffabilityBlockerDelta: number
  affordabilityBlockerDelta: number
  finalCashDelta: number
  roleCoverageImprovedWithSameAcceptedHeadcount: boolean
}

export type RosterWallPairAggregate = {
  comparedPolicyId: string
  horizonWeeks: number
  pairs: number
  roleCoverageImprovedWithSameAcceptedHeadcount: number
  acceptedOwnerDelta: RosterWallMetricDistribution
  missingRoleDelta: RosterWallMetricDistribution
  retryAttemptDelta: RosterWallMetricDistribution
  signingBonusDelta: RosterWallMetricDistribution
  finalCashDelta: RosterWallMetricDistribution
  finalCashSigns: RosterWallPairSigns
  staffabilityBlockerDelta: RosterWallMetricDistribution
  affordabilityBlockerDelta: RosterWallMetricDistribution
}

export type RosterWallPlayerRunFact = {
  entryId: string
  seed: string
  operatingPolicyId: string
  estatePolicyId: 'vacant'
  runs: 1
  foundingOwners: number
  uniqueContractObligations: number
  uniqueAcceptedContractObligations: number
  uniqueAcceptedTalents: number
  uniqueRejectedContractObligations: number
  uniqueRejectedTalents: number
  retryAttempts: number
  acceptedRenewals: number
  totalQuotedSigningBonusObligation: number
  recurrenceWindows: number
  recurrencePostExpiryBoundaries: number
  recurrenceWindowWeeks: number[]
  recurrencePostExpiryWeeks: number[]
  totalSigningBonusesPaid: number
  guaranteedPayrollAccepted: number
  guaranteedCashObligationAccepted: number
  acceptedExpiryMoves: Array<{
    contractKey: string
    talentId: string
    role: CreativeRole
    acceptedWeek: number
    previousEndWeekExclusive: number
    nextEndWeekExclusive: number
    selectedTerm: number
    signingBonus: number
  }>
  packageStaffabilityBlockers: number
  packageAffordabilityBlockers: number
  finalActiveContractTalentIds: string[]
  finalCash: number | null
  finalRoleCoverage: RosterWallRoleCoverage | null
}

export type RosterWallFixtureAggregate = {
  cohortSize: number
  thresholdId: string
  continuationPolicyId: string
  rows: number
  applicableRows: number
  notApplicableRows: number
  acceptedOwners: number
  uniqueRejectedOwners: number
  retryAttempts: number
  invariantFailures: number
}

export type RosterWallResearchFinding = {
  status:
    | 'observed'
    | 'not-observed'
    | 'descriptive-only'
    | 'review-required'
    | 'not-authorized'
  numerator: number
  denominator: number
  statement: string
  facts: Record<string, boolean | number | string | null>
}

export type RosterWallResearchSummary = RosterWallAcceptedArtifactSummary & {
  denominators: {
    maximumEntries: number
    playerEntries: number
    continuationRuns: number
    cohorts: number
    intendedOriginalOwners: number
    attemptedOriginalOwners: number
    acceptedOriginalOwners: number
    uniqueRejectedOriginalOwners: number
    originalRetryAttempts: number
    allAttemptedContractObligations: number
    allAcceptedContractObligations: number
    allUniqueRejectedContractObligations: number
    allRetryAttempts: number
    exactPairs: number
    fixtureRows: number
  }
  invariantChecks: {
    evaluated: number
    failures: 0
    entryReplayRows: number
    cashReconciliationRows: number
    payrollLedgerAgreementRows: number
    overheadLedgerAgreementRows: number
    receiptLedgerAgreementRows: number
    renewalRngNeutralRows: number
    fixtureInvariantRows: number
  }
  warningFacts: RosterWallWarningFact[]
  runFacts: RosterWallRunFact[]
  strata: {
    bySeed: RosterWallAggregate[]
    byOperatingPolicy: RosterWallAggregate[]
    byEstate: RosterWallAggregate[]
    byContinuationPolicy: RosterWallAggregate[]
    byCashAtWindow: RosterWallAggregate[]
    byTaxonomyOutcome: RosterWallAggregate[]
  }
  exactVacantPairs: {
    facts: RosterWallPairFact[]
    aggregates: RosterWallPairAggregate[]
  }
  playerPolicy: {
    runFacts: RosterWallPlayerRunFact[]
    aggregatesByOperatingPolicy: Array<{
      operatingPolicyId: string
      runs: number
      foundingOwners: number
      uniqueContractObligations: number
      uniqueAcceptedContractObligations: number
      uniqueAcceptedTalents: number
      uniqueRejectedContractObligations: number
      uniqueRejectedTalents: number
      retryAttempts: number
      acceptedRenewals: number
      totalQuotedSigningBonusObligation: number
      recurrenceWindows: number
      recurrenceWindowWeeks: number[]
      recurrencePostExpiryWeeks: number[]
      totalSigningBonusesPaid: number
      guaranteedCashObligationAccepted: number
    }>
  }
  mechanicsFixtures: RosterWallFixtureAggregate[]
  hypotheses: Record<'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6', RosterWallResearchFinding>
  decisionGates: Record<
    'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7',
    RosterWallResearchFinding
  >
  interpretationBoundary: {
    researchOnly: true
    productionBehaviorChanged: false
    facilityCausalityEstimated: false
    implementationAuthorized: false
    separateContractAndOwnerAuthorizationRequired: true
    openMacroeconomyResiduals: string[]
  }
}

type EntryFact = {
  entryId: string
  mode: 'current' | 'player-policy'
  seed: string
  operatingPolicyId: string
  estatePolicyId: string
  cohortOwners: number
  originalContractKeys: Set<string>
  founderTalentIds: Set<string>
  cohortRoleByTalentId: Map<string, CreativeRole>
  cash: number
  cashStratum: RosterWallCashAtWindowStratum
  earliestFeasibleByTalentId: Map<string, number | null>
}

type MutableArmFact = {
  entryId: string
  seed: string
  operatingPolicyId: string
  estatePolicyId: string
  continuationPolicyId: string
  horizonWeeks: number
  weeklyRows: number
  pressureWeeks: Set<number>
  recurrenceSelectedTermQuoteByContractKey: Map<
    string,
    { windowWeek: number; signingBonus: number }
  >
  attemptedOwnerKeys: Set<string>
  acceptedOwnerKeys: Set<string>
  rejectedOwnerKeys: Set<string>
  rejectedAttempts: number
  acceptedRenewals: number
  signingBonusesPaid: number
  guaranteedPayrollAccepted: number
  guaranteedCashObligationAccepted: number
  originalRetryAttempts: number
  originalSigningBonusesPaid: number
  originalGuaranteedPayrollAccepted: number
  originalGuaranteedCashObligationAccepted: number
  retainedOwners: number | null
  releasedOwners: number | null
  retainedOwnerIds: string[] | null
  releasedOwnerIds: string[] | null
  missingFoundingRoles: CreativeRole[]
  roleCoverageLossWeekNumbers: Set<number>
  packageStaffabilityBlockers: number
  packageAffordabilityBlockers: number
  absorbingNoDecisionWeeks: number
  recurrenceWindows: number
  recurrencePostExpiryBoundaries: number
  recurrenceWindowWeeks: Set<number>
  recurrencePostExpiryWeeks: Set<number>
  recurrencePostRoleCoverageLossWeeks: Set<number>
  expiryPayrollDelta: number | null
  expiryBaseOverheadDelta: number | null
  expiryEmployeeOverheadDelta: number | null
  firstPostExpiryDecisionStaffabilityBlockers: number | null
  firstPostExpiryDecisionAffordabilityBlockers: number | null
  postExpiry12DecisionStaffabilityBlockers: number | null
  postExpiry12DecisionAffordabilityBlockers: number | null
  finalCash: number | null
  finalRoleCoverage: RosterWallRoleCoverage | null
  rejectedObservations: Array<{
    contractKey: string
    talentId: string
    actualWeek: number
  }>
}

type MutablePlayerFact = {
  entryId: string
  seed: string
  operatingPolicyId: string
  weeklyRows: number
  founderTalentIds: Set<string>
  contractObligations: Set<string>
  quotedObligationByContract: Map<string, number>
  acceptedOwnerKeys: Set<string>
  rejectedOwnerKeys: Set<string>
  acceptedTalentIds: Set<string>
  rejectedTalentIds: Set<string>
  retryAttempts: number
  acceptedRenewals: number
  signingBonusesPaid: number
  guaranteedPayrollAccepted: number
  guaranteedCashObligationAccepted: number
  acceptedExpiryMoves: RosterWallPlayerRunFact['acceptedExpiryMoves']
  recurrenceWindows: number
  recurrencePostExpiryBoundaries: number
  recurrenceWindowWeeks: Set<number>
  recurrencePostExpiryWeeks: Set<number>
  packageStaffabilityBlockers: number
  packageAffordabilityBlockers: number
  finalActiveContractTalentIds: string[]
  finalCash: number | null
  finalRoleCoverage: RosterWallRoleCoverage | null
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function missingRoles(coverage: Readonly<RosterWallRoleCoverage>): CreativeRole[] {
  return ROLES.filter((role) => coverage[role] < FOUNDING_MINIMUMS[role])
}

function zeroRoleCoverage(): RosterWallRoleCoverage {
  return { actor: 0, director: 0, writer: 0, craft: 0 }
}

function roleCountsForIds(
  ids: readonly string[],
  roles: ReadonlyMap<string, CreativeRole>,
): RosterWallRoleCoverage {
  const counts = zeroRoleCoverage()
  for (const id of ids) {
    const role = roles.get(id)
    if (role === undefined) {
      throw new Error(`roster-wall summary: cohort role is missing for ${id}`)
    }
    counts[role]++
  }
  return counts
}

function numeric(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`roster-wall summary: ${label} must be a finite number`)
  }
  return value
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`roster-wall summary: ${label} must be non-empty text`)
  }
  return value
}

function percentile(sorted: readonly number[], fraction: number): number | null {
  if (sorted.length === 0) return null
  const rank = Math.max(1, Math.ceil(sorted.length * fraction))
  return sorted[rank - 1]!
}

export function rosterWallMetricDistribution(
  values: readonly number[],
): RosterWallMetricDistribution {
  const sorted = [...values].sort((a, b) => a - b)
  return {
    n: sorted.length,
    min: sorted[0] ?? null,
    p25: percentile(sorted, 0.25),
    median: percentile(sorted, 0.5),
    p75: percentile(sorted, 0.75),
    max: sorted.at(-1) ?? null,
  }
}

export function rosterWallPairSigns(values: readonly number[]): RosterWallPairSigns {
  return {
    negative: values.filter((value) => value < 0).length,
    zero: values.filter((value) => value === 0).length,
    positive: values.filter((value) => value > 0).length,
  }
}

function initialRecordCounts(): RosterWallAcceptedRecordTypeCounts {
  return {
    entry: 0,
    weekly: 0,
    renewalIntent: 0,
    boundary: 0,
    windowShadow: 0,
    mechanicsFixture: 0,
    pair: 0,
  }
}

function armKey(row: {
  entryId: string | null
  continuationPolicyId: string | null
  horizonWeeks: number | null
}): string {
  return `${String(row.entryId)}|${String(row.continuationPolicyId)}|${String(row.horizonWeeks)}`
}

function contractKeyTalentId(contractKey: string): string {
  const separator = contractKey.indexOf(':')
  return separator < 0 ? contractKey : contractKey.slice(0, separator)
}

function contractKeyEndWeek(contractKey: string): number {
  const separator = contractKey.lastIndexOf(':')
  const endWeek = Number(contractKey.slice(separator + 1))
  if (separator < 0 || !Number.isSafeInteger(endWeek)) {
    throw new Error(`roster-wall summary: invalid contract key ${JSON.stringify(contractKey)}`)
  }
  return endWeek
}

function originalContractKey(talentId: string, startWeek: number, endWeekExclusive: number): string {
  return `${talentId}:${String(startWeek)}:${String(endWeekExclusive)}`
}

function stratumForShadow(shadow: RosterWallWindowShadowRecord['warning']): RosterWallCashAtWindowStratum {
  if (shadow.cash < 0) return 'negative-cash'
  if (shadow.allRenewalsAffordableNow) return 'all-renewals-affordable'
  if (shadow.minimumRoleCoverage.affordableNow) return 'minimum-role-coverage-affordable'
  if (shadow.owners.some((owner) => owner.affordableNow)) return 'some-owner-affordable'
  return 'no-owner-affordable'
}

function taxonomyOutcome(fact: Omit<RosterWallRunFact, 'taxonomyOutcome'>): string {
  if (fact.continuationPolicyId === 'C0-no-renewal') return 'voluntary-no-renewal-control'
  if (fact.fullInvoluntaryCohortWall) return 'full-involuntary-cohort-wall'
  if (fact.partialCohortWall) return 'partial-cohort-wall'
  if (fact.contractRoleCoverageLoss) return 'contract-role-coverage-loss'
  if (fact.renewalPressureWeeks > 0) return 'renewal-pressure-without-wall'
  return 'no-wall-observed'
}

function aggregateFacts(
  facts: readonly RosterWallRunFact[],
  dimension: string,
  valueFor: (fact: RosterWallRunFact) => string,
): RosterWallAggregate[] {
  const groups = new Map<string, RosterWallAggregate>()
  for (const fact of facts) {
    const value = valueFor(fact)
    const aggregate = groups.get(value) ?? {
      dimension,
      value,
      runs: 0,
      cohorts: 0,
      intendedOriginalOwners: 0,
      attemptedOriginalOwners: 0,
      acceptedOriginalOwners: 0,
      uniqueRejectedOriginalOwners: 0,
      originalRetryAttempts: 0,
      allAttemptedContractObligations: 0,
      allAcceptedContractObligations: 0,
      allUniqueRejectedContractObligations: 0,
      allRetryAttempts: 0,
      partialCohortWalls: 0,
      fullInvoluntaryCohortWalls: 0,
      contractRoleCoverageLosses: 0,
      packageStaffabilityBlockers: 0,
      packageAffordabilityBlockers: 0,
    }
    aggregate.runs += fact.runs
    aggregate.cohorts += fact.cohorts
    aggregate.intendedOriginalOwners += fact.intendedOriginalOwners
    aggregate.attemptedOriginalOwners += fact.attemptedOriginalOwners
    aggregate.acceptedOriginalOwners += fact.acceptedOriginalOwners
    aggregate.uniqueRejectedOriginalOwners += fact.uniqueRejectedOriginalOwners
    aggregate.originalRetryAttempts += fact.originalRetryAttempts
    aggregate.allAttemptedContractObligations += fact.allAttemptedContractObligations
    aggregate.allAcceptedContractObligations += fact.allAcceptedContractObligations
    aggregate.allUniqueRejectedContractObligations += fact.allUniqueRejectedContractObligations
    aggregate.allRetryAttempts += fact.allRetryAttempts
    aggregate.partialCohortWalls += Number(fact.partialCohortWall)
    aggregate.fullInvoluntaryCohortWalls += Number(fact.fullInvoluntaryCohortWall)
    aggregate.contractRoleCoverageLosses += Number(fact.contractRoleCoverageLoss)
    aggregate.packageStaffabilityBlockers += fact.packageStaffabilityBlockers
    aggregate.packageAffordabilityBlockers += fact.packageAffordabilityBlockers
    groups.set(value, aggregate)
  }
  return [...groups.values()].sort((a, b) => compareText(a.value, b.value))
}

function finding(
  status: RosterWallResearchFinding['status'],
  numerator: number,
  denominator: number,
  statement: string,
  facts: RosterWallResearchFinding['facts'] = {},
): RosterWallResearchFinding {
  return { status, numerator, denominator, statement, facts }
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value !== null && typeof value === 'object') {
    const object = value as Record<string, unknown>
    return `{${Object.keys(object)
      .sort(compareText)
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export class RosterWallSummaryAccumulator {
  private readonly governance: RosterWallSummaryGovernance
  private readonly counts: RosterWallAcceptedArtifactCounts = {
    entries: 0,
    rows: 0,
    recordTypes: initialRecordCounts(),
  }
  private readonly entries = new Map<string, EntryFact>()
  private readonly warnings: RosterWallWarningFact[] = []
  private readonly arms = new Map<string, MutableArmFact>()
  private readonly players = new Map<string, MutablePlayerFact>()
  private readonly pairs: RosterWallPairFact[] = []
  private readonly fixtures = new Map<string, RosterWallFixtureAggregate>()
  private entryReplayRows = 0
  private cashReconciliationRows = 0
  private payrollLedgerAgreementRows = 0
  private overheadLedgerAgreementRows = 0
  private receiptLedgerAgreementRows = 0
  private renewalRngNeutralRows = 0
  private fixtureInvariantRows = 0
  private finished = false

  constructor(governance: RosterWallSummaryGovernance) {
    if (governance.completeEvidence !== (governance.profile === 'complete')) {
      throw new Error('roster-wall summary: completeEvidence disagrees with profile')
    }
    this.governance = structuredClone(governance)
  }

  observe(row: RosterWallArtifactRecord): void {
    if (this.finished) throw new Error('roster-wall summary: accumulator is already finished')
    this.counts.rows++
    this.counts.recordTypes[row.recordType]++
    if (row.recordType === 'entry') {
      this.counts.entries++
      this.observeEntry(row)
      return
    }
    if (row.recordType === 'windowShadow') {
      this.observeShadow(row)
      return
    }
    if (row.recordType === 'mechanicsFixture') {
      this.observeFixture(row)
      return
    }
    if (row.recordType === 'pair') {
      this.observePair(row)
      return
    }
    if (row.mode === 'player-policy') {
      if (row.recordType === 'weekly') this.observePlayerWeekly(row)
      else if (row.recordType === 'renewalIntent') this.observePlayerIntent(row)
      else this.observePlayerBoundary(row)
      return
    }
    if (row.recordType === 'weekly') this.observeCurrentWeekly(row)
    else if (row.recordType === 'renewalIntent') this.observeCurrentIntent(row)
    else this.observeCurrentBoundary(row)
  }

  finish(): RosterWallResearchSummary {
    if (this.finished) throw new Error('roster-wall summary: accumulator is already finished')
    this.finished = true
    const runFacts = [...this.arms.values()]
      .map((arm) => this.finishArm(arm))
      .sort(
        (a, b) =>
          compareText(a.seed, b.seed) ||
          compareText(a.operatingPolicyId, b.operatingPolicyId) ||
          compareText(a.estatePolicyId, b.estatePolicyId) ||
          a.horizonWeeks - b.horizonWeeks ||
          compareText(a.continuationPolicyId, b.continuationPolicyId),
      )
    const playerFacts = [...this.players.values()]
      .map((player) => this.finishPlayer(player))
      .sort(
        (a, b) =>
          compareText(a.seed, b.seed) || compareText(a.operatingPolicyId, b.operatingPolicyId),
      )
    const pairFacts = [...this.pairs].sort(
      (a, b) =>
        compareText(a.seed, b.seed) ||
        compareText(a.operatingPolicyId, b.operatingPolicyId) ||
        a.horizonWeeks - b.horizonWeeks ||
        compareText(a.comparedPolicyId, b.comparedPolicyId),
    )
    const pairAggregates = this.pairAggregates(pairFacts)
    const fixtures = [...this.fixtures.values()].sort(
      (a, b) =>
        a.cohortSize - b.cohortSize ||
        compareText(a.thresholdId, b.thresholdId) ||
        compareText(a.continuationPolicyId, b.continuationPolicyId),
    )
    const currentC1 = runFacts.filter(
      (fact) => fact.continuationPolicyId === 'C1-current-retry-all' && fact.horizonWeeks === 260,
    )
    const c1Rejected = this.currentC1RejectedOwnerFacts()
    const neverFeasible = c1Rejected.filter((owner) => owner.earliestFeasibleWeek === null)
    const earlierFeasibleLaterRejected = this.earlierFeasibleLaterRejectedFacts()
    const orderingPairs = pairFacts.filter((pair) =>
      ['C2-cheapest-bonus-first', 'C3-role-coverage-first'].includes(pair.comparedPolicyId),
    )
    const roleImprovedOrderingPairs = orderingPairs.filter(
      (pair) => pair.roleCoverageImprovedWithSameAcceptedHeadcount,
    )
    const c2RoleImprovedPairs = roleImprovedOrderingPairs.filter(
      (pair) => pair.comparedPolicyId === 'C2-cheapest-bonus-first',
    )
    const c3RoleImprovedPairs = roleImprovedOrderingPairs.filter(
      (pair) => pair.comparedPolicyId === 'C3-role-coverage-first',
    )
    const longRuns = runFacts.filter((fact) => fact.horizonWeeks === 428)
    const displacementLongRuns = longRuns.filter((fact) =>
      ['C5-spread-role-first', 'C6-mixed-term-role-first'].includes(
        fact.continuationPolicyId,
      ),
    )
    const recurrenceRuns = displacementLongRuns.filter(
      (fact) => fact.recurrenceWindows > 0 || fact.recurrencePostExpiryBoundaries > 0,
    )
    const c6LongRuns = longRuns.filter(
      (fact) => fact.continuationPolicyId === 'C6-mixed-term-role-first',
    )
    const c6OperationallyCovered = c6LongRuns.filter(
      (fact) =>
        fact.finalRoleCoverage !== null &&
        missingRoles(fact.finalRoleCoverage).length === 0 &&
        fact.roleCoverageLossWeeks === 0 &&
        fact.packageStaffabilityBlockers === 0,
    )
    const all208Entries = [...this.entries.values()].filter((entry) => entry.mode === 'current')
    const synchronized = all208Entries.filter(
      (entry) =>
        entry.originalContractKeys.size > 0 &&
        [...entry.originalContractKeys].every((key) => key.endsWith(':0:208')),
    )
    const windowWarnings = this.warnings.filter((warning) => warning.week === 196)
    const hypotheses: RosterWallResearchSummary['hypotheses'] = {
      H1: finding(
        synchronized.length > 0 ? 'review-required' : 'not-observed',
        synchronized.length,
        all208Entries.length,
        'All-208 synchronization is observed and exact obligation/burn/affordability facts are reported; materiality remains review-required because no threshold is invented.',
        {
          materialityThresholdFrozen: false,
          windowRuns: windowWarnings.length,
          allRenewalsAffordableRuns: windowWarnings.filter(
            (warning) => warning.allRenewalsAffordableNow,
          ).length,
          minimumRoleCoverageAffordableRuns: windowWarnings.filter(
            (warning) => warning.minimumRoleCoverageAffordableNow,
          ).length,
          medianAllRenewalObligation:
            rosterWallMetricDistribution(
              windowWarnings.map((warning) => warning.aggregateAllRenewalSigningBonus),
            ).median,
          medianWeeklyBurn: rosterWallMetricDistribution(
            windowWarnings.map((warning) => warning.weeklyBurn),
          ).median,
        },
      ),
      H2: finding(
        neverFeasible.length > 0 ? 'observed' : 'not-observed',
        neverFeasible.length,
        c1Rejected.length,
        'C1 rejected owners with no affordable legal week are classified as insolvency substrate; retries remain a separate denominator.',
        {
          originalRetryAttempts: currentC1.reduce(
            (sum, run) => sum + run.originalRetryAttempts,
            0,
          ),
        },
      ),
      H3: finding(
        roleImprovedOrderingPairs.length > 0 ? 'observed' : 'not-observed',
        roleImprovedOrderingPairs.length,
        orderingPairs.length,
        'Exact vacant pairs report whether C2 ordering or C3 bounded selection changes role coverage at the same accepted headcount; this does not assert an identical affordable subset.',
        {
          c2OrderingPairs: c2RoleImprovedPairs.length,
          c3DecisionSupportPairs: c3RoleImprovedPairs.length,
          fixedAffordableSubsetProven: false,
        },
      ),
      H4: finding(
        earlierFeasibleLaterRejected.length > 0 ? 'observed' : 'not-observed',
        earlierFeasibleLaterRejected.length,
        this.originalNonC0RejectedOwnerArmCount(),
        'Earlier-action evidence requires the same owner to be feasible in a legal week and rejected at a later observed attempt.',
        { outsideWindowShadowsAuthorizeEarlierAction: false },
      ),
      H5: finding(
        recurrenceRuns.length > 0 ? 'observed' : 'not-observed',
        recurrenceRuns.length,
        displacementLongRuns.length,
        'Week-428 C5/C6 arms expose displaced renewal windows, exact named recurrence weeks, retry work, role coverage, signing bonuses, and guaranteed accepted-contract obligation.',
        {
          materialityThresholdFrozen: false,
          recurrenceWindowWeeks: [...new Set(recurrenceRuns.flatMap((run) => run.recurrenceWindowWeeks))]
            .sort((a, b) => a - b)
            .join(','),
          recurrenceRetryAttempts: recurrenceRuns.reduce(
            (sum, run) => sum + run.recurrenceRetryAttempts,
            0,
          ),
          recurrenceQuotedSigningBonus: recurrenceRuns.reduce(
            (sum, run) =>
              sum +
              run.recurrenceQuotedObligations.reduce(
                (runSum, obligation) => runSum + obligation.signingBonus,
                0,
              ),
            0,
          ),
          recurrencePostRoleCoverageLossRuns: recurrenceRuns.filter(
            (run) => run.recurrencePostRoleCoverageLossWeeks.length > 0,
          ).length,
        },
      ),
      H6: finding(
        'descriptive-only',
        runFacts.filter((fact) => fact.estatePolicyId === 'annex-start-week-0').length,
        runFacts.length,
        'Vacant and Annex estates are separate descriptive strata; Annex rows never enter the exact-pair table.',
        { facilityCausalityEstimated: false },
      ),
    }
    const decisionGates: RosterWallResearchSummary['decisionGates'] = {
      D1: finding(
        neverFeasible.length > 0 ? 'observed' : 'not-observed',
        neverFeasible.length,
        c1Rejected.length,
        'No-feasible-week owners are insolvency substrate; ordering, warning, and reminder claims are killed for those owners.',
      ),
      D2: finding(
        roleImprovedOrderingPairs.length > 0 ? 'review-required' : 'not-observed',
        roleImprovedOrderingPairs.length,
        orderingPairs.length,
        'Any surviving C2 order or C3 selection result is bounded planning/decision-support evidence only; an identical affordable subset is not inferred and no economy retune is authorized.',
        {
          c2OrderingPairs: c2RoleImprovedPairs.length,
          c3DecisionSupportPairs: c3RoleImprovedPairs.length,
          fixedAffordableSubsetProven: false,
        },
      ),
      D3: finding(
        earlierFeasibleLaterRejected.length > 0 ? 'review-required' : 'not-observed',
        earlierFeasibleLaterRejected.length,
        this.originalNonC0RejectedOwnerArmCount(),
        'A wider-warning candidate requires exact legal earlier feasibility and review of displaced recurrence.',
        { equallyMaterialThresholdFrozen: false },
      ),
      D4: finding(
        recurrenceRuns.length > 0 ? 'review-required' : 'not-observed',
        recurrenceRuns.length,
        displacementLongRuns.length,
        'Observed C5/C6 recurrence is reported as postponement or cadence change, not resolution; material equivalence remains review-required without an invented threshold.',
        {
          materialityThresholdFrozen: false,
          recurrenceRetryAttempts: recurrenceRuns.reduce(
            (sum, run) => sum + run.recurrenceRetryAttempts,
            0,
          ),
          recurrencePostRoleCoverageLossRuns: recurrenceRuns.filter(
            (run) => run.recurrencePostRoleCoverageLossWeeks.length > 0,
          ).length,
        },
      ),
      D5: finding(
        c6OperationallyCovered.length > 0 ? 'review-required' : 'not-observed',
        c6OperationallyCovered.length,
        c6LongRuns.length,
        'C6 survives this first screen only with final Week-428 role coverage and zero measured staffability blockers; renewal frequency, retries, bonuses, and guaranteed obligation remain disclosed for review.',
        {
          roleCoverageLossRuns: c6LongRuns.filter(
            (run) => run.roleCoverageLossWeeks > 0,
          ).length,
          staffabilityBlockerRuns: c6LongRuns.filter(
            (run) => run.packageStaffabilityBlockers > 0,
          ).length,
          affordabilityBlockerRuns: c6LongRuns.filter(
            (run) => run.packageAffordabilityBlockers > 0,
          ).length,
          recurrenceWindows: c6LongRuns.reduce(
            (sum, run) => sum + run.recurrenceWindows,
            0,
          ),
          allRetryAttempts: c6LongRuns.reduce(
            (sum, run) => sum + run.allRetryAttempts,
            0,
          ),
          allSigningBonusesPaid: c6LongRuns.reduce(
            (sum, run) => sum + run.allSigningBonusesPaid,
            0,
          ),
          allGuaranteedCashObligationAccepted: c6LongRuns.reduce(
            (sum, run) => sum + run.allGuaranteedCashObligationAccepted,
            0,
          ),
        },
      ),
      D6: finding(
        'descriptive-only',
        0,
        runFacts.filter((fact) => fact.estatePolicyId === 'annex-start-week-0').length,
        'Estate differences do not estimate facility causality and authorize no Annex tuning.',
      ),
      D7: finding(
        'not-authorized',
        0,
        1,
        'Any core, UI, save, or tuning candidate requires a separate implementation contract and explicit Owner authorization.',
      ),
    }
    const denominators = {
      maximumEntries: all208Entries.length,
      playerEntries: [...this.entries.values()].filter((entry) => entry.mode === 'player-policy').length,
      continuationRuns: runFacts.length,
      cohorts: runFacts.reduce((sum, fact) => sum + fact.cohorts, 0),
      intendedOriginalOwners: runFacts.reduce(
        (sum, fact) => sum + fact.intendedOriginalOwners,
        0,
      ),
      attemptedOriginalOwners: runFacts.reduce(
        (sum, fact) => sum + fact.attemptedOriginalOwners,
        0,
      ),
      acceptedOriginalOwners: runFacts.reduce(
        (sum, fact) => sum + fact.acceptedOriginalOwners,
        0,
      ),
      uniqueRejectedOriginalOwners: runFacts.reduce(
        (sum, fact) => sum + fact.uniqueRejectedOriginalOwners,
        0,
      ),
      originalRetryAttempts: runFacts.reduce(
        (sum, fact) => sum + fact.originalRetryAttempts,
        0,
      ),
      allAttemptedContractObligations: runFacts.reduce(
        (sum, fact) => sum + fact.allAttemptedContractObligations,
        0,
      ),
      allAcceptedContractObligations: runFacts.reduce(
        (sum, fact) => sum + fact.allAcceptedContractObligations,
        0,
      ),
      allUniqueRejectedContractObligations: runFacts.reduce(
        (sum, fact) => sum + fact.allUniqueRejectedContractObligations,
        0,
      ),
      allRetryAttempts: runFacts.reduce((sum, fact) => sum + fact.allRetryAttempts, 0),
      exactPairs: pairFacts.length,
      fixtureRows: fixtures.reduce((sum, fixture) => sum + fixture.rows, 0),
    }
    const evaluated =
      this.entryReplayRows +
      this.cashReconciliationRows +
      this.payrollLedgerAgreementRows +
      this.overheadLedgerAgreementRows +
      this.receiptLedgerAgreementRows +
      this.renewalRngNeutralRows +
      this.fixtureInvariantRows
    return {
      ...structuredClone(this.governance),
      counts: structuredClone(this.counts),
      invariantFailures: 0,
      denominators,
      invariantChecks: {
        evaluated,
        failures: 0,
        entryReplayRows: this.entryReplayRows,
        cashReconciliationRows: this.cashReconciliationRows,
        payrollLedgerAgreementRows: this.payrollLedgerAgreementRows,
        overheadLedgerAgreementRows: this.overheadLedgerAgreementRows,
        receiptLedgerAgreementRows: this.receiptLedgerAgreementRows,
        renewalRngNeutralRows: this.renewalRngNeutralRows,
        fixtureInvariantRows: this.fixtureInvariantRows,
      },
      warningFacts: [...this.warnings].sort(
        (a, b) =>
          compareText(a.seed, b.seed) ||
          compareText(a.operatingPolicyId, b.operatingPolicyId) ||
          compareText(a.estatePolicyId, b.estatePolicyId) ||
          a.week - b.week,
      ),
      runFacts,
      strata: {
        bySeed: aggregateFacts(runFacts, 'seed', (fact) => fact.seed),
        byOperatingPolicy: aggregateFacts(
          runFacts,
          'operatingPolicyId',
          (fact) => fact.operatingPolicyId,
        ),
        byEstate: aggregateFacts(runFacts, 'estatePolicyId', (fact) => fact.estatePolicyId),
        byContinuationPolicy: aggregateFacts(
          runFacts,
          'continuationPolicyId',
          (fact) => fact.continuationPolicyId,
        ),
        byCashAtWindow: aggregateFacts(
          runFacts,
          'cashAtWindowStratum',
          (fact) => fact.cashAtWindowStratum,
        ),
        byTaxonomyOutcome: aggregateFacts(
          runFacts,
          'taxonomyOutcome',
          (fact) => fact.taxonomyOutcome,
        ),
      },
      exactVacantPairs: { facts: pairFacts, aggregates: pairAggregates },
      playerPolicy: {
        runFacts: playerFacts,
        aggregatesByOperatingPolicy: this.playerAggregates(playerFacts),
      },
      mechanicsFixtures: fixtures,
      hypotheses,
      decisionGates,
      interpretationBoundary: {
        researchOnly: true,
        productionBehaviorChanged: false,
        facilityCausalityEstimated: false,
        implementationAuthorized: false,
        separateContractAndOwnerAuthorizationRequired: true,
        openMacroeconomyResiduals: [
          'cash runaway',
          'top-studio economic immortality',
          'week-208 synchronized roster wall',
          'P5 dominance',
          'world-led variance',
          'cheap-film purpose',
          'premium-film purpose',
          'remaining menu breadth',
          'formal G12 timing',
        ],
      },
    }
  }

  private observeEntry(row: RosterWallEntryRecord | RosterWallPlayerPolicyEntryRecord): void {
    const entryId = stringValue(row.entryId, 'entry.entryId')
    if (this.entries.has(entryId)) throw new Error(`roster-wall summary: duplicate entry ${entryId}`)
    const cohort = row.cohort
    const originalContractKeys = new Set<string>()
    const founderTalentIds = new Set<string>()
    const cohortRoleByTalentId = new Map<string, CreativeRole>()
    for (const member of cohort) {
      originalContractKeys.add(
        originalContractKey(member.talentId, member.startWeek, member.endWeekExclusive),
      )
      if (member.startWeek === 0) founderTalentIds.add(member.talentId)
      cohortRoleByTalentId.set(member.talentId, member.role)
    }
    this.entries.set(entryId, {
      entryId,
      mode: row.mode,
      seed: stringValue(row.seed, 'entry.seed'),
      operatingPolicyId: stringValue(row.operatingPolicyId, 'entry.operatingPolicyId'),
      estatePolicyId: stringValue(row.estatePolicyId, 'entry.estatePolicyId'),
      cohortOwners: cohort.length,
      originalContractKeys,
      founderTalentIds,
      cohortRoleByTalentId,
      cash: numeric(row.cash, 'entry.cash'),
      cashStratum: 'unclassified',
      earliestFeasibleByTalentId: new Map(),
    })
    if (row.entryFileSha256 !== row.entrySaveHash) {
      throw new Error(`roster-wall summary: entry ${entryId} file hash disagrees`)
    }
    this.entryReplayRows++
  }

  private observeShadow(row: RosterWallWindowShadowRecord): void {
    const entry = this.requireEntry(row.entryId)
    const warning = row.warning
    if (warning.observationConsumedRng || warning.noActionStateHashBefore !== warning.noActionStateHashAfter || warning.rngBefore !== warning.rngAfter) {
      throw new Error(`roster-wall summary: shadow ${entry.entryId} mutated state or RNG`)
    }
    if (warning.week === 196) {
      entry.cashStratum = stratumForShadow(warning)
      entry.earliestFeasibleByTalentId = new Map(
        warning.owners.map((owner) => [owner.talentId, owner.earliestLaterLegalFeasibleWeek]),
      )
    }
    this.warnings.push({
      entryId: entry.entryId,
      seed: entry.seed,
      operatingPolicyId: entry.operatingPolicyId,
      estatePolicyId: entry.estatePolicyId,
      week: warning.week,
      relation: warning.warningRelation,
      actionLegal: warning.actionLegal,
      cash: warning.cash,
      aggregateAllRenewalSigningBonus: warning.aggregateAllRenewalSigningBonus,
      minimumRoleCoverageSigningBonus: warning.minimumRoleCoverage.signingBonus,
      weeklyBurn: warning.weeklyBurn,
      allRenewalsAffordableNow: warning.allRenewalsAffordableNow,
      minimumRoleCoverageAffordableNow: warning.minimumRoleCoverage.affordableNow,
      minimumRoleCoverageTalentIds: [...warning.minimumRoleCoverage.talentIds],
      owners: warning.owners.length,
      ownersAffordableNow: warning.owners.filter((owner) => owner.affordableNow).length,
      ownersWithLaterLegalFeasibleWeek: warning.owners.filter(
        (owner) => owner.earliestLaterLegalFeasibleWeek !== null,
      ).length,
      ownerFacts: warning.owners.map((owner) => ({
        talentId: owner.talentId,
        role: owner.role,
        signingBonus: owner.quote.signingBonus,
        affordableNow: owner.affordableNow,
        earliestLaterLegalFeasibleWeek: owner.earliestLaterLegalFeasibleWeek,
      })),
    })
  }

  private ensureArm(row: RosterWallWeeklyRecord | RosterWallRenewalIntentRecord | RosterWallBoundaryRecord): MutableArmFact {
    const key = armKey(row)
    const existing = this.arms.get(key)
    if (existing !== undefined) return existing
    const entry = this.requireEntry(row.entryId)
    const policy = stringValue(row.continuationPolicyId, 'continuation.continuationPolicyId')
    if (row.horizonWeeks === null) throw new Error('roster-wall summary: continuation lacks horizon')
    const created: MutableArmFact = {
      entryId: entry.entryId,
      seed: entry.seed,
      operatingPolicyId: entry.operatingPolicyId,
      estatePolicyId: entry.estatePolicyId,
      continuationPolicyId: policy,
      horizonWeeks: row.horizonWeeks,
      weeklyRows: 0,
      pressureWeeks: new Set(),
      recurrenceSelectedTermQuoteByContractKey: new Map(),
      attemptedOwnerKeys: new Set(),
      acceptedOwnerKeys: new Set(),
      rejectedOwnerKeys: new Set(),
      rejectedAttempts: 0,
      acceptedRenewals: 0,
      signingBonusesPaid: 0,
      guaranteedPayrollAccepted: 0,
      guaranteedCashObligationAccepted: 0,
      originalRetryAttempts: 0,
      originalSigningBonusesPaid: 0,
      originalGuaranteedPayrollAccepted: 0,
      originalGuaranteedCashObligationAccepted: 0,
      retainedOwners: null,
      releasedOwners: null,
      retainedOwnerIds: null,
      releasedOwnerIds: null,
      missingFoundingRoles: [],
      roleCoverageLossWeekNumbers: new Set(),
      packageStaffabilityBlockers: 0,
      packageAffordabilityBlockers: 0,
      absorbingNoDecisionWeeks: 0,
      recurrenceWindows: 0,
      recurrencePostExpiryBoundaries: 0,
      recurrenceWindowWeeks: new Set(),
      recurrencePostExpiryWeeks: new Set(),
      recurrencePostRoleCoverageLossWeeks: new Set(),
      expiryPayrollDelta: null,
      expiryBaseOverheadDelta: null,
      expiryEmployeeOverheadDelta: null,
      firstPostExpiryDecisionStaffabilityBlockers: null,
      firstPostExpiryDecisionAffordabilityBlockers: null,
      postExpiry12DecisionStaffabilityBlockers: null,
      postExpiry12DecisionAffordabilityBlockers: null,
      finalCash: null,
      finalRoleCoverage: null,
      rejectedObservations: [],
    }
    this.arms.set(key, created)
    return created
  }

  private observeCurrentWeekly(row: RosterWallWeeklyRecord): void {
    const arm = this.ensureArm(row)
    arm.weeklyRows++
    if (row.renewalPressure) arm.pressureWeeks.add(row.week)
    arm.packageStaffabilityBlockers += row.packageStaffabilityBlockers.length
    arm.packageAffordabilityBlockers += row.packageAffordabilityBlockers.length
    if (row.week === 208) {
      arm.firstPostExpiryDecisionStaffabilityBlockers =
        row.packageStaffabilityBlockers.length
      arm.firstPostExpiryDecisionAffordabilityBlockers =
        row.packageAffordabilityBlockers.length
    }
    if (row.week === 220) {
      arm.postExpiry12DecisionStaffabilityBlockers =
        row.packageStaffabilityBlockers.length
      arm.postExpiry12DecisionAffordabilityBlockers =
        row.packageAffordabilityBlockers.length
    }
    if (row.missingFoundingRoles.length > 0) {
      arm.roleCoverageLossWeekNumbers.add(row.arrivalWeek)
    }
    arm.absorbingNoDecisionWeeks += Number(row.absorbingNoDecisionState)
    arm.finalCash = row.cashAfterTick
    arm.finalRoleCoverage = { ...row.roleCoverage }
    if (row.cashReconciliationBefore.delta !== 0 || row.cashReconciliationAfter.delta !== 0) {
      throw new Error('roster-wall summary: continuation cash reconciliation failed')
    }
    this.cashReconciliationRows += 2
    if (row.scheduledPayroll !== row.ledgerPayroll) {
      throw new Error('roster-wall summary: continuation payroll disagrees with ledger')
    }
    if (row.scheduledOverhead !== row.ledgerOverhead) {
      throw new Error('roster-wall summary: continuation overhead disagrees with ledger')
    }
    this.payrollLedgerAgreementRows++
    this.overheadLedgerAgreementRows++
    if (row.theatricalReceiptReconciliation.delta !== 0) {
      throw new Error('roster-wall summary: continuation receipts disagree with ledger')
    }
    this.receiptLedgerAgreementRows++
  }

  private observeCurrentIntent(row: RosterWallRenewalIntentRecord): void {
    const arm = this.ensureArm(row)
    const entry = this.requireEntry(row.entryId)
    const original = entry.originalContractKeys.has(row.contractKey)
    arm.attemptedOwnerKeys.add(row.contractKey)
    if (
      !original &&
      !arm.recurrenceSelectedTermQuoteByContractKey.has(row.contractKey)
    ) {
      arm.recurrenceSelectedTermQuoteByContractKey.set(row.contractKey, {
        windowWeek: contractKeyEndWeek(row.contractKey) - 12,
        signingBonus: row.offer.signingBonus,
      })
    }
    if (row.rngBefore !== row.rngAfter) {
      throw new Error('roster-wall summary: renewal intent consumed RNG')
    }
    this.renewalRngNeutralRows++
    if (row.accepted) {
      arm.acceptedOwnerKeys.add(row.contractKey)
      arm.acceptedRenewals++
      arm.signingBonusesPaid += row.offer.signingBonus
      const payroll = weeklySalary(row.offer.annualSalary) * row.selectedTerm
      arm.guaranteedPayrollAccepted += payroll
      arm.guaranteedCashObligationAccepted += payroll + row.offer.signingBonus
      if (original) {
        arm.originalSigningBonusesPaid += row.offer.signingBonus
        arm.originalGuaranteedPayrollAccepted += payroll
        arm.originalGuaranteedCashObligationAccepted += payroll + row.offer.signingBonus
      }
    } else {
      arm.rejectedOwnerKeys.add(row.contractKey)
      arm.rejectedAttempts++
      if (original) arm.originalRetryAttempts++
      arm.rejectedObservations.push({
        contractKey: row.contractKey,
        talentId: row.talentId,
        actualWeek: row.actualWeek,
      })
    }
  }

  private observeCurrentBoundary(row: RosterWallBoundaryRecord): void {
    const arm = this.ensureArm(row)
    if (row.relation === 'expiry-arrival') {
      arm.retainedOwners = row.cohortRetainedTalentIds.length
      arm.releasedOwners = row.cohortReleasedTalentIds.length
      arm.retainedOwnerIds = [...row.cohortRetainedTalentIds]
      arm.releasedOwnerIds = [...row.cohortReleasedTalentIds]
      arm.missingFoundingRoles = [...row.missingFoundingRoles]
      arm.expiryPayrollDelta = row.payrollDelta
      arm.expiryBaseOverheadDelta = row.baseOverheadDelta
      arm.expiryEmployeeOverheadDelta = row.employeeOverheadDelta
    }
    if (row.relation === 'recurrence-window') {
      arm.recurrenceWindows++
      arm.recurrenceWindowWeeks.add(row.week)
    }
    if (row.relation === 'recurrence-post-expiry') {
      arm.recurrencePostExpiryBoundaries++
      arm.recurrencePostExpiryWeeks.add(row.week)
      if (row.missingFoundingRoles.length > 0) {
        arm.recurrencePostRoleCoverageLossWeeks.add(row.week)
      }
    }
    if (
      row.cashReconciliation.delta !== 0 ||
      (row.arrivalCashReconciliation !== null && row.arrivalCashReconciliation.delta !== 0)
    ) {
      throw new Error('roster-wall summary: boundary cash reconciliation failed')
    }
    this.cashReconciliationRows += 1 + Number(row.arrivalCashReconciliation !== null)
  }

  private ensurePlayer(row: {
    entryId: string | null
    seed: string | null
    operatingPolicyId: string | null
  }): MutablePlayerFact {
    const entry = this.requireEntry(row.entryId)
    const existing = this.players.get(entry.entryId)
    if (existing !== undefined) return existing
    const created: MutablePlayerFact = {
      entryId: entry.entryId,
      seed: entry.seed,
      operatingPolicyId: entry.operatingPolicyId,
      weeklyRows: 0,
      founderTalentIds: new Set(entry.founderTalentIds),
      contractObligations: new Set(),
      quotedObligationByContract: new Map(),
      acceptedOwnerKeys: new Set(),
      rejectedOwnerKeys: new Set(),
      acceptedTalentIds: new Set(),
      rejectedTalentIds: new Set(),
      retryAttempts: 0,
      acceptedRenewals: 0,
      signingBonusesPaid: 0,
      guaranteedPayrollAccepted: 0,
      guaranteedCashObligationAccepted: 0,
      acceptedExpiryMoves: [],
      recurrenceWindows: 0,
      recurrencePostExpiryBoundaries: 0,
      recurrenceWindowWeeks: new Set(),
      recurrencePostExpiryWeeks: new Set(),
      packageStaffabilityBlockers: 0,
      packageAffordabilityBlockers: 0,
      finalActiveContractTalentIds: [],
      finalCash: null,
      finalRoleCoverage: null,
    }
    this.players.set(entry.entryId, created)
    return created
  }

  private observePlayerWeekly(row: RosterWallPlayerPolicyWeeklyRecord): void {
    const player = this.ensurePlayer(row)
    player.weeklyRows++
    for (const key of row.renewalOpenContractKeys) {
      player.contractObligations.add(key)
      const talentId = contractKeyTalentId(key)
      if (key.includes(':0:')) player.founderTalentIds.add(talentId)
    }
    player.packageStaffabilityBlockers += row.packageStaffabilityBlockers.length
    player.packageAffordabilityBlockers += row.packageAffordabilityBlockers.length
    player.finalActiveContractTalentIds = [...row.activeContractTalentIds]
    player.finalCash = row.arrivalCash.actualCash
    player.finalRoleCoverage = { ...row.arrivalRoleCoverage.counts }
    if (!row.startCash.exact || !row.cashAfterRenewals.exact || !row.cashAfterActions.exact || !row.arrivalCash.exact) {
      throw new Error('roster-wall summary: player-policy cash reconciliation failed')
    }
    this.cashReconciliationRows += 4
    if (row.scheduledPayroll !== row.ledgerPayroll) {
      throw new Error('roster-wall summary: player-policy payroll disagrees with ledger')
    }
    if (row.scheduledOverhead !== row.ledgerOverhead) {
      throw new Error('roster-wall summary: player-policy overhead disagrees with ledger')
    }
    this.payrollLedgerAgreementRows++
    this.overheadLedgerAgreementRows++
    if (row.theatricalReceiptReconciliation.delta !== 0) {
      throw new Error('roster-wall summary: player-policy receipts disagree with ledger')
    }
    this.receiptLedgerAgreementRows++
  }

  private observePlayerIntent(row: RosterWallPlayerPolicyRenewalIntentRecord): void {
    const player = this.ensurePlayer(row)
    player.contractObligations.add(row.contractKey)
    if (!player.quotedObligationByContract.has(row.contractKey)) {
      player.quotedObligationByContract.set(row.contractKey, row.offer.signingBonus)
    }
    if (row.contractKey.includes(':0:')) player.founderTalentIds.add(row.talentId)
    if (row.rngBefore !== row.rngAfter) {
      throw new Error('roster-wall summary: player-policy renewal intent consumed RNG')
    }
    this.renewalRngNeutralRows++
    if (row.accepted) {
      player.acceptedRenewals++
      player.acceptedOwnerKeys.add(row.contractKey)
      player.acceptedTalentIds.add(row.talentId)
      player.signingBonusesPaid += row.offer.signingBonus
      const payroll = weeklySalary(row.offer.annualSalary) * row.selectedTerm
      player.guaranteedPayrollAccepted += payroll
      player.guaranteedCashObligationAccepted += payroll + row.offer.signingBonus
      player.acceptedExpiryMoves.push({
        contractKey: row.contractKey,
        talentId: row.talentId,
        role: row.role,
        acceptedWeek: row.actualWeek,
        previousEndWeekExclusive: contractKeyEndWeek(row.contractKey),
        nextEndWeekExclusive: row.offer.endWeekExclusive,
        selectedTerm: row.selectedTerm,
        signingBonus: row.offer.signingBonus,
      })
    } else {
      player.rejectedOwnerKeys.add(row.contractKey)
      player.rejectedTalentIds.add(row.talentId)
      player.retryAttempts++
    }
  }

  private observePlayerBoundary(row: RosterWallPlayerPolicyBoundaryRecord): void {
    const player = this.ensurePlayer(row)
    for (const key of row.contractKeys) {
      player.contractObligations.add(key)
      if (key.includes(':0:')) player.founderTalentIds.add(contractKeyTalentId(key))
    }
    if (row.relation === 'recurrence-window') {
      player.recurrenceWindows++
      player.recurrenceWindowWeeks.add(numeric(row.week, 'player boundary week'))
    }
    if (row.relation === 'recurrence-post-expiry') {
      player.recurrencePostExpiryBoundaries++
      player.recurrencePostExpiryWeeks.add(numeric(row.week, 'player boundary week'))
    }
    if (!row.cash.exact) throw new Error('roster-wall summary: player boundary cash failed')
    this.cashReconciliationRows++
  }

  private observePair(row: RosterWallPairRecord): void {
    if (!row.exactEntryPairedTableEligible || row.estatePolicyId !== 'vacant') {
      throw new Error('roster-wall summary: descriptive Annex pair entered exact pair evidence')
    }
    const baselineMissing = missingRoles(row.roleCoverage.baseline).length
    const comparedMissing = missingRoles(row.roleCoverage.compared).length
    this.pairs.push({
      entryId: stringValue(row.entryId, 'pair.entryId'),
      seed: stringValue(row.seed, 'pair.seed'),
      operatingPolicyId: stringValue(row.operatingPolicyId, 'pair.operatingPolicyId'),
      estatePolicyId: 'vacant',
      comparedPolicyId: row.comparedPolicyId,
      horizonWeeks: numeric(row.horizonWeeks, 'pair.horizonWeeks'),
      pairs: 1,
      acceptedOwnerDelta: row.acceptedOriginalOwnerCounts.delta,
      uniqueRejectedOwnerDelta: row.rejectedOriginalOwnerCounts.delta,
      retryAttemptDelta: row.originalRetryAttemptCounts.delta,
      retainedOwnerDelta:
        row.retainedTalentIds.compared.length - row.retainedTalentIds.baseline.length,
      missingRoleDelta: comparedMissing - baselineMissing,
      signingBonusDelta: row.signingBonusTotals.delta,
      payrollDelta: row.payroll.delta,
      employeeOverheadDelta: row.employeeOverhead.delta,
      staffabilityBlockerDelta: row.packageStaffabilityBlockers.delta,
      affordabilityBlockerDelta: row.packageAffordabilityBlockers.delta,
      finalCashDelta: row.finalCash.delta,
      roleCoverageImprovedWithSameAcceptedHeadcount:
        comparedMissing < baselineMissing && row.acceptedOriginalOwnerCounts.delta === 0,
    })
  }

  private observeFixture(row: RosterWallMechanicsFixtureRow): void {
    if (!row.actualInvariants.allPassed) {
      throw new Error(`roster-wall summary: mechanics fixture ${row.fixtureId} failed invariants`)
    }
    const thresholdId = row.threshold.thresholdId
    const policy = stringValue(row.continuationPolicyId, 'fixture.continuationPolicyId')
    const key = `${String(row.cohortSize)}|${thresholdId}|${policy}`
    const aggregate = this.fixtures.get(key) ?? {
      cohortSize: row.cohortSize,
      thresholdId,
      continuationPolicyId: policy,
      rows: 0,
      applicableRows: 0,
      notApplicableRows: 0,
      acceptedOwners: 0,
      uniqueRejectedOwners: 0,
      retryAttempts: 0,
      invariantFailures: 0,
    }
    aggregate.rows++
    if (row.threshold.applicable) {
      aggregate.applicableRows++
      aggregate.acceptedOwners += row.outcome?.acceptedOwnerIds.length ?? 0
      aggregate.uniqueRejectedOwners += row.outcome?.rejectedOwnerIds.length ?? 0
      aggregate.retryAttempts += row.outcome?.retryAttempts ?? 0
    } else {
      aggregate.notApplicableRows++
    }
    this.fixtureInvariantRows++
    this.fixtures.set(key, aggregate)
  }

  private requireEntry(entryId: string | null): EntryFact {
    const id = stringValue(entryId, 'record.entryId')
    const entry = this.entries.get(id)
    if (entry === undefined) throw new Error(`roster-wall summary: row precedes entry ${id}`)
    return entry
  }

  private finishArm(arm: MutableArmFact): RosterWallRunFact {
    const entry = this.entries.get(arm.entryId)!
    if (arm.weeklyRows !== arm.horizonWeeks - 196) {
      throw new Error(
        `roster-wall summary: continuation arm weekly coverage is incomplete: ${arm.entryId}|${arm.continuationPolicyId}|${String(arm.horizonWeeks)}`,
      )
    }
    const intendedOriginalOwners =
      arm.continuationPolicyId === 'C0-no-renewal' ? 0 : entry.cohortOwners
    const originalAttempted = [...arm.attemptedOwnerKeys].filter((key) =>
      entry.originalContractKeys.has(key),
    )
    const originalAccepted = [...arm.acceptedOwnerKeys].filter((key) =>
      entry.originalContractKeys.has(key),
    )
    const originalRejected = [...arm.rejectedOwnerKeys].filter((key) =>
      entry.originalContractKeys.has(key),
    )
    const recurrenceAttempted = [...arm.attemptedOwnerKeys].filter(
      (key) => !entry.originalContractKeys.has(key),
    )
    const recurrenceAccepted = [...arm.acceptedOwnerKeys].filter(
      (key) => !entry.originalContractKeys.has(key),
    )
    const recurrenceRejected = [...arm.rejectedOwnerKeys].filter(
      (key) => !entry.originalContractKeys.has(key),
    )
    if (
      arm.retainedOwners === null ||
      arm.releasedOwners === null ||
      arm.retainedOwnerIds === null ||
      arm.releasedOwnerIds === null ||
      arm.expiryPayrollDelta === null ||
      arm.expiryBaseOverheadDelta === null ||
      arm.expiryEmployeeOverheadDelta === null ||
      arm.firstPostExpiryDecisionStaffabilityBlockers === null ||
      arm.firstPostExpiryDecisionAffordabilityBlockers === null ||
      arm.postExpiry12DecisionStaffabilityBlockers === null ||
      arm.postExpiry12DecisionAffordabilityBlockers === null
    ) {
      throw new Error(
        `roster-wall summary: continuation arm lacks required expiry/post-expiry boundaries: ${arm.entryId}|${arm.continuationPolicyId}|${String(arm.horizonWeeks)}`,
      )
    }
    const retained = arm.retainedOwners
    const released = arm.releasedOwners
    const partial =
      intendedOriginalOwners > 0 &&
      retained > 0 &&
      (released > 0 || originalRejected.length > 0)
    const full =
      intendedOriginalOwners > 0 && retained === 0 && originalAttempted.length > 0
    const recurrenceQuotedObligations = [...arm.recurrenceWindowWeeks]
      .sort((a, b) => a - b)
      .map((week) => {
        const matchingQuotes = [
          ...arm.recurrenceSelectedTermQuoteByContractKey.values(),
        ].filter((quote) => quote.windowWeek === week)
        if (matchingQuotes.length === 0) {
          throw new Error(
            `roster-wall summary: recurrence boundary lacks selected-term obligation at Week ${String(week)}`,
          )
        }
        return {
          week,
          signingBonus: matchingQuotes.reduce(
            (total, quote) => total + quote.signingBonus,
            0,
          ),
        }
      })
    const base = {
      entryId: arm.entryId,
      seed: arm.seed,
      operatingPolicyId: arm.operatingPolicyId,
      estatePolicyId: arm.estatePolicyId,
      continuationPolicyId: arm.continuationPolicyId,
      horizonWeeks: arm.horizonWeeks,
      cashAtWindowStratum: entry.cashStratum,
      runs: 1 as const,
      cohorts: 1 as const,
      cohortOwners: entry.cohortOwners,
      intendedOriginalOwners,
      attemptedOriginalOwners: originalAttempted.length,
      acceptedOriginalOwners: originalAccepted.length,
      uniqueRejectedOriginalOwners: originalRejected.length,
      originalRetryAttempts: arm.originalRetryAttempts,
      allAttemptedContractObligations: arm.attemptedOwnerKeys.size,
      allAcceptedContractObligations: arm.acceptedOwnerKeys.size,
      allUniqueRejectedContractObligations: arm.rejectedOwnerKeys.size,
      allRetryAttempts: arm.rejectedAttempts,
      allAcceptedRenewals: arm.acceptedRenewals,
      recurrenceAttemptedContractObligations: recurrenceAttempted.length,
      recurrenceAcceptedContractObligations: recurrenceAccepted.length,
      recurrenceUniqueRejectedContractObligations: recurrenceRejected.length,
      recurrenceRetryAttempts: arm.rejectedAttempts - arm.originalRetryAttempts,
      retainedOwners: retained,
      releasedOwners: released,
      retainedOwnerIds: [...arm.retainedOwnerIds],
      releasedOwnerIds: [...arm.releasedOwnerIds],
      retainedOwnersByRole: roleCountsForIds(arm.retainedOwnerIds, entry.cohortRoleByTalentId),
      releasedOwnersByRole: roleCountsForIds(arm.releasedOwnerIds, entry.cohortRoleByTalentId),
      renewalPressureWeeks: arm.pressureWeeks.size,
      renewalPressureWeekNumbers: [...arm.pressureWeeks].sort((a, b) => a - b),
      recurrenceQuotedObligations,
      partialCohortWall: partial,
      fullInvoluntaryCohortWall: full,
      contractRoleCoverageLoss: arm.missingFoundingRoles.length > 0,
      missingFoundingRoles: [...arm.missingFoundingRoles],
      roleCoverageLossWeeks: arm.roleCoverageLossWeekNumbers.size,
      roleCoverageLossWeekNumbers: [...arm.roleCoverageLossWeekNumbers].sort((a, b) => a - b),
      packageStaffabilityBlockers: arm.packageStaffabilityBlockers,
      packageAffordabilityBlockers: arm.packageAffordabilityBlockers,
      absorbingNoDecisionWeeks: arm.absorbingNoDecisionWeeks,
      originalSigningBonusesPaid: arm.originalSigningBonusesPaid,
      originalGuaranteedPayrollAccepted: arm.originalGuaranteedPayrollAccepted,
      originalGuaranteedCashObligationAccepted:
        arm.originalGuaranteedCashObligationAccepted,
      allSigningBonusesPaid: arm.signingBonusesPaid,
      allGuaranteedPayrollAccepted: arm.guaranteedPayrollAccepted,
      allGuaranteedCashObligationAccepted: arm.guaranteedCashObligationAccepted,
      recurrenceWindows: arm.recurrenceWindows,
      recurrencePostExpiryBoundaries: arm.recurrencePostExpiryBoundaries,
      recurrenceWindowWeeks: [...arm.recurrenceWindowWeeks].sort((a, b) => a - b),
      recurrencePostExpiryWeeks: [...arm.recurrencePostExpiryWeeks].sort((a, b) => a - b),
      recurrencePostRoleCoverageLossWeeks: [
        ...arm.recurrencePostRoleCoverageLossWeeks,
      ].sort((a, b) => a - b),
      expiryPayrollDelta: arm.expiryPayrollDelta,
      expiryBaseOverheadDelta: arm.expiryBaseOverheadDelta,
      expiryEmployeeOverheadDelta: arm.expiryEmployeeOverheadDelta,
      firstPostExpiryDecisionStaffabilityBlockers:
        arm.firstPostExpiryDecisionStaffabilityBlockers,
      firstPostExpiryDecisionAffordabilityBlockers:
        arm.firstPostExpiryDecisionAffordabilityBlockers,
      postExpiry12DecisionStaffabilityBlockers:
        arm.postExpiry12DecisionStaffabilityBlockers,
      postExpiry12DecisionAffordabilityBlockers:
        arm.postExpiry12DecisionAffordabilityBlockers,
      finalCash: arm.finalCash,
      finalRoleCoverage: arm.finalRoleCoverage === null ? null : { ...arm.finalRoleCoverage },
    }
    return { ...base, taxonomyOutcome: taxonomyOutcome(base) }
  }

  private finishPlayer(player: MutablePlayerFact): RosterWallPlayerRunFact {
    if (player.weeklyRows !== 428) {
      throw new Error(
        `roster-wall summary: player-policy run lacks 428 weekly rows: ${player.entryId}`,
      )
    }
    if (player.quotedObligationByContract.size !== player.contractObligations.size) {
      throw new Error(
        `roster-wall summary: player-policy contract obligations lack exact first quotes: ${player.entryId}`,
      )
    }
    return {
      entryId: player.entryId,
      seed: player.seed,
      operatingPolicyId: player.operatingPolicyId,
      estatePolicyId: 'vacant',
      runs: 1,
      foundingOwners: player.founderTalentIds.size,
      uniqueContractObligations: player.contractObligations.size,
      uniqueAcceptedContractObligations: player.acceptedOwnerKeys.size,
      uniqueAcceptedTalents: player.acceptedTalentIds.size,
      uniqueRejectedContractObligations: player.rejectedOwnerKeys.size,
      uniqueRejectedTalents: player.rejectedTalentIds.size,
      retryAttempts: player.retryAttempts,
      acceptedRenewals: player.acceptedRenewals,
      totalQuotedSigningBonusObligation: [...player.quotedObligationByContract.values()]
        .reduce((total, amount) => total + amount, 0),
      recurrenceWindows: player.recurrenceWindows,
      recurrencePostExpiryBoundaries: player.recurrencePostExpiryBoundaries,
      recurrenceWindowWeeks: [...player.recurrenceWindowWeeks].sort((a, b) => a - b),
      recurrencePostExpiryWeeks: [...player.recurrencePostExpiryWeeks].sort((a, b) => a - b),
      totalSigningBonusesPaid: player.signingBonusesPaid,
      guaranteedPayrollAccepted: player.guaranteedPayrollAccepted,
      guaranteedCashObligationAccepted: player.guaranteedCashObligationAccepted,
      acceptedExpiryMoves: [...player.acceptedExpiryMoves].sort(
        (a, b) =>
          a.acceptedWeek - b.acceptedWeek ||
          compareText(a.talentId, b.talentId) ||
          compareText(a.contractKey, b.contractKey),
      ),
      packageStaffabilityBlockers: player.packageStaffabilityBlockers,
      packageAffordabilityBlockers: player.packageAffordabilityBlockers,
      finalActiveContractTalentIds: [...player.finalActiveContractTalentIds],
      finalCash: player.finalCash,
      finalRoleCoverage:
        player.finalRoleCoverage === null ? null : { ...player.finalRoleCoverage },
    }
  }

  private pairAggregates(facts: readonly RosterWallPairFact[]): RosterWallPairAggregate[] {
    const groups = new Map<string, RosterWallPairFact[]>()
    for (const fact of facts) {
      const key = `${fact.comparedPolicyId}|${String(fact.horizonWeeks)}`
      const group = groups.get(key) ?? []
      group.push(fact)
      groups.set(key, group)
    }
    return [...groups.entries()]
      .sort(([a], [b]) => compareText(a, b))
      .map(([, group]) => ({
        comparedPolicyId: group[0]!.comparedPolicyId,
        horizonWeeks: group[0]!.horizonWeeks,
        pairs: group.length,
        roleCoverageImprovedWithSameAcceptedHeadcount: group.filter(
          (fact) => fact.roleCoverageImprovedWithSameAcceptedHeadcount,
        ).length,
        acceptedOwnerDelta: rosterWallMetricDistribution(
          group.map((fact) => fact.acceptedOwnerDelta),
        ),
        missingRoleDelta: rosterWallMetricDistribution(
          group.map((fact) => fact.missingRoleDelta),
        ),
        retryAttemptDelta: rosterWallMetricDistribution(
          group.map((fact) => fact.retryAttemptDelta),
        ),
        signingBonusDelta: rosterWallMetricDistribution(
          group.map((fact) => fact.signingBonusDelta),
        ),
        finalCashDelta: rosterWallMetricDistribution(group.map((fact) => fact.finalCashDelta)),
        finalCashSigns: rosterWallPairSigns(group.map((fact) => fact.finalCashDelta)),
        staffabilityBlockerDelta: rosterWallMetricDistribution(
          group.map((fact) => fact.staffabilityBlockerDelta),
        ),
        affordabilityBlockerDelta: rosterWallMetricDistribution(
          group.map((fact) => fact.affordabilityBlockerDelta),
        ),
      }))
  }

  private playerAggregates(facts: readonly RosterWallPlayerRunFact[]): RosterWallResearchSummary['playerPolicy']['aggregatesByOperatingPolicy'] {
    const groups = new Map<string, RosterWallResearchSummary['playerPolicy']['aggregatesByOperatingPolicy'][number]>()
    for (const fact of facts) {
      const aggregate = groups.get(fact.operatingPolicyId) ?? {
        operatingPolicyId: fact.operatingPolicyId,
        runs: 0,
        foundingOwners: 0,
        uniqueContractObligations: 0,
        uniqueAcceptedContractObligations: 0,
        uniqueAcceptedTalents: 0,
        uniqueRejectedContractObligations: 0,
        uniqueRejectedTalents: 0,
        retryAttempts: 0,
        acceptedRenewals: 0,
        totalQuotedSigningBonusObligation: 0,
        recurrenceWindows: 0,
        recurrenceWindowWeeks: [],
        recurrencePostExpiryWeeks: [],
        totalSigningBonusesPaid: 0,
        guaranteedCashObligationAccepted: 0,
      }
      aggregate.runs++
      aggregate.foundingOwners += fact.foundingOwners
      aggregate.uniqueContractObligations += fact.uniqueContractObligations
      aggregate.uniqueAcceptedContractObligations +=
        fact.uniqueAcceptedContractObligations
      aggregate.uniqueAcceptedTalents += fact.uniqueAcceptedTalents
      aggregate.uniqueRejectedContractObligations +=
        fact.uniqueRejectedContractObligations
      aggregate.uniqueRejectedTalents += fact.uniqueRejectedTalents
      aggregate.retryAttempts += fact.retryAttempts
      aggregate.acceptedRenewals += fact.acceptedRenewals
      aggregate.totalQuotedSigningBonusObligation += fact.totalQuotedSigningBonusObligation
      aggregate.recurrenceWindows += fact.recurrenceWindows
      aggregate.recurrenceWindowWeeks = [...new Set([
        ...aggregate.recurrenceWindowWeeks,
        ...fact.recurrenceWindowWeeks,
      ])].sort((a, b) => a - b)
      aggregate.recurrencePostExpiryWeeks = [...new Set([
        ...aggregate.recurrencePostExpiryWeeks,
        ...fact.recurrencePostExpiryWeeks,
      ])].sort((a, b) => a - b)
      aggregate.totalSigningBonusesPaid += fact.totalSigningBonusesPaid
      aggregate.guaranteedCashObligationAccepted += fact.guaranteedCashObligationAccepted
      groups.set(fact.operatingPolicyId, aggregate)
    }
    return [...groups.values()].sort((a, b) =>
      compareText(a.operatingPolicyId, b.operatingPolicyId),
    )
  }

  private currentC1RejectedOwnerFacts(): Array<{
    ownerKey: string
    earliestFeasibleWeek: number | null
  }> {
    const result = new Map<string, { ownerKey: string; earliestFeasibleWeek: number | null }>()
    for (const arm of this.arms.values()) {
      if (arm.continuationPolicyId !== 'C1-current-retry-all' || arm.horizonWeeks !== 260) continue
      const entry = this.entries.get(arm.entryId)!
      for (const key of arm.rejectedOwnerKeys) {
        if (!entry.originalContractKeys.has(key)) continue
        const ownerKey = `${entry.entryId}|${key}`
        result.set(ownerKey, {
          ownerKey,
          earliestFeasibleWeek:
            entry.earliestFeasibleByTalentId.get(contractKeyTalentId(key)) ?? null,
        })
      }
    }
    return [...result.values()].sort((a, b) => compareText(a.ownerKey, b.ownerKey))
  }

  private earlierFeasibleLaterRejectedFacts(): string[] {
    const result = new Set<string>()
    for (const arm of this.arms.values()) {
      // The entry feasibility shadow quotes the intended 208-week renewal.
      // Restrict to one primary-horizon observation per C1-C5 policy: C6 uses
      // mixed terms, and Week-428 duplicates the same original decision prefix.
      if (
        arm.horizonWeeks !== 260 ||
        arm.continuationPolicyId === 'C0-no-renewal' ||
        arm.continuationPolicyId === 'C6-mixed-term-role-first'
      ) continue
      const entry = this.entries.get(arm.entryId)!
      for (const rejected of arm.rejectedObservations) {
        if (!entry.originalContractKeys.has(rejected.contractKey)) continue
        const earliest = entry.earliestFeasibleByTalentId.get(rejected.talentId) ?? null
        if (earliest !== null && earliest < rejected.actualWeek) {
          result.add(
            `${entry.entryId}|${arm.continuationPolicyId}|${arm.horizonWeeks}|${rejected.contractKey}`,
          )
        }
      }
    }
    return [...result].sort(compareText)
  }

  private originalNonC0RejectedOwnerArmCount(): number {
    let total = 0
    for (const arm of this.arms.values()) {
      if (
        arm.horizonWeeks !== 260 ||
        arm.continuationPolicyId === 'C0-no-renewal' ||
        arm.continuationPolicyId === 'C6-mixed-term-role-first'
      ) continue
      const entry = this.entries.get(arm.entryId)!
      total += [...arm.rejectedOwnerKeys].filter((key) =>
        entry.originalContractKeys.has(key),
      ).length
    }
    return total
  }
}

/**
 * Reject a skeletal or relabelled summary before accepted finalization. Artifact
 * verification can instantiate `RosterWallSummaryAccumulator`, stream each row
 * through `observe`, call `finish`, and compare with this same validator.
 */
export function validateRosterWallResearchSummary(
  value: unknown,
  expected: RosterWallSummaryGovernance & { counts: RosterWallAcceptedArtifactCounts },
): RosterWallResearchSummary {
  if (!isRecord(value)) throw new Error('roster-wall summary: summary.json is not an object')
  for (const key of [
    'schemaVersion',
    'experimentId',
    'seedSetId',
    'profile',
    'completeEvidence',
    'source',
    'matrix',
    'counts',
    'invariantFailures',
    'denominators',
    'invariantChecks',
    'warningFacts',
    'runFacts',
    'strata',
    'exactVacantPairs',
    'playerPolicy',
    'mechanicsFixtures',
    'hypotheses',
    'decisionGates',
    'interpretationBoundary',
  ]) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      throw new Error(`roster-wall summary: summary.json lacks ${key}`)
    }
  }
  const governedProjection = {
    schemaVersion: value['schemaVersion'],
    experimentId: value['experimentId'],
    seedSetId: value['seedSetId'],
    profile: value['profile'],
    completeEvidence: value['completeEvidence'],
    source: value['source'],
    matrix: value['matrix'],
    counts: value['counts'],
  }
  if (canonicalJson(governedProjection) !== canonicalJson(expected)) {
    throw new Error('roster-wall summary: governed summary facts disagree with manifest')
  }
  if (value['invariantFailures'] !== 0) {
    throw new Error('roster-wall summary: invariantFailures must be zero')
  }
  if (!isRecord(value['hypotheses']) || !isRecord(value['decisionGates'])) {
    throw new Error('roster-wall summary: H/D findings are missing')
  }
  const hypothesisKeys = Object.keys(value['hypotheses']).sort(compareText)
  const gateKeys = Object.keys(value['decisionGates']).sort(compareText)
  if (
    canonicalJson(hypothesisKeys) !== canonicalJson(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']) ||
    canonicalJson(gateKeys) !== canonicalJson(['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'])
  ) {
    throw new Error('roster-wall summary: exact H1-H6/D1-D7 keys are required')
  }
  for (const [id, raw] of [
    ...Object.entries(value['hypotheses']),
    ...Object.entries(value['decisionGates']),
  ]) {
    if (
      !isRecord(raw) ||
      !Number.isSafeInteger(raw['numerator']) ||
      (raw['numerator'] as number) < 0 ||
      !Number.isSafeInteger(raw['denominator']) ||
      (raw['denominator'] as number) < 0 ||
      typeof raw['statement'] !== 'string' ||
      raw['statement'].length === 0
    ) {
      throw new Error(`roster-wall summary: finding ${id} lacks an exact denominator`)
    }
  }
  if (
    !Array.isArray(value['runFacts']) ||
    !isRecord(value['strata']) ||
    !isRecord(value['exactVacantPairs']) ||
    !isRecord(value['playerPolicy']) ||
    !Array.isArray(value['mechanicsFixtures']) ||
    !isRecord(value['interpretationBoundary']) ||
    value['interpretationBoundary']['researchOnly'] !== true ||
    value['interpretationBoundary']['productionBehaviorChanged'] !== false ||
    value['interpretationBoundary']['facilityCausalityEstimated'] !== false ||
    value['interpretationBoundary']['implementationAuthorized'] !== false
  ) {
    throw new Error('roster-wall summary: evidence strata or research boundary is invalid')
  }
  return value as RosterWallResearchSummary
}

export function assertRosterWallResearchSummaryMatches(
  value: unknown,
  recomputed: RosterWallResearchSummary,
): RosterWallResearchSummary {
  const validated = validateRosterWallResearchSummary(value, {
    schemaVersion: recomputed.schemaVersion,
    experimentId: recomputed.experimentId,
    seedSetId: recomputed.seedSetId,
    profile: recomputed.profile,
    completeEvidence: recomputed.completeEvidence,
    source: recomputed.source,
    matrix: recomputed.matrix,
    counts: recomputed.counts,
  })
  if (canonicalJson(validated) !== canonicalJson(recomputed)) {
    throw new Error('roster-wall summary: summary.json does not match streamed evidence rows')
  }
  return validated
}

function dollars(value: number | null): string {
  if (value === null) return 'n/a'
  const rounded = Math.round(value)
  return rounded < 0
    ? `-$${Math.abs(rounded).toLocaleString('en-US')}`
    : `$${rounded.toLocaleString('en-US')}`
}

function listText(values: readonly string[]): string {
  return values.length === 0 ? 'none' : values.join(', ')
}

function roleCoverageText(coverage: Readonly<RosterWallRoleCoverage>): string {
  return ROLES.map((role) => `${role} ${String(coverage[role])}`).join('; ')
}

/** Generate summary.md solely from deterministic summary.json facts. */
export function renderRosterWallSummaryMarkdown(
  summary: RosterWallResearchSummary,
): string {
  const lines = [
    '# Week-208 Roster Wall Observatory',
    '',
    `Profile: \`${summary.profile}\`; complete evidence: \`${String(summary.completeEvidence)}\`.`,
    '',
    `Source commit: \`${summary.source.commit}\`; production authority: \`${summary.source.productionAuthorityCommit}\`.`,
    '',
    '## Evidence coverage',
    '',
    '| Maximum entries | Player-policy entries | Continuation runs | Exact vacant pairs | Fixture rows | Evidence rows | Invariant failures |',
    '| ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    `| ${String(summary.denominators.maximumEntries)} | ${String(summary.denominators.playerEntries)} | ${String(summary.denominators.continuationRuns)} | ${String(summary.denominators.exactPairs)} | ${String(summary.denominators.fixtureRows)} | ${String(summary.counts.rows)} | ${String(summary.invariantFailures)} |`,
    '',
    '## Player-visible warning horizons',
    '',
    '| Week | Runs | Action legal | Median cash | Median all-renewal obligation | Median minimum-role obligation | Median weekly burn |',
    '| ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]
  for (const week of [156, 182, 196]) {
    const facts = summary.warningFacts.filter((fact) => fact.week === week)
    lines.push(
      `| ${String(week)} | ${String(facts.length)} | ${String(facts.filter((fact) => fact.actionLegal).length)} / ${String(facts.length)} | ${dollars(rosterWallMetricDistribution(facts.map((fact) => fact.cash)).median)} | ${dollars(rosterWallMetricDistribution(facts.map((fact) => fact.aggregateAllRenewalSigningBonus)).median)} | ${dollars(rosterWallMetricDistribution(facts.map((fact) => fact.minimumRoleCoverageSigningBonus)).median)} | ${dollars(rosterWallMetricDistribution(facts.map((fact) => fact.weeklyBurn)).median)} |`,
    )
  }
  lines.push(
    '',
    'Weeks 156 and 182 are read-only warning horizons outside the legal action window. Cash covering a quote there is not a legal renewal action.',
    '',
    '## Representative player-view warnings',
    '',
    '| Seed | Policy | Estate | Warning | Cash | All-renewal obligation | Individually affordable owners | Minimum-role subset (jointly affordable?) | Earliest legal feasibility |',
    '| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |',
  )
  const representativeSeed = summary.matrix.canonicalSeeds[0]
  const representativeRuns = representativeSeed === undefined
    ? []
    : summary.runFacts.filter(
      (fact) =>
        fact.seed === representativeSeed &&
        fact.continuationPolicyId === 'C1-current-retry-all' &&
        fact.horizonWeeks === 260,
    )
  for (const run of representativeRuns) {
    for (const warning of summary.warningFacts.filter(
      (fact) => fact.entryId === run.entryId,
    )) {
      const affordable = warning.ownerFacts
        .filter((owner) => owner.affordableNow)
        .map((owner) => owner.talentId)
      const laterFeasible = warning.ownerFacts
        .filter((owner) => owner.earliestLaterLegalFeasibleWeek !== null)
        .map(
          (owner) =>
            `${owner.talentId}@${String(owner.earliestLaterLegalFeasibleWeek)}`,
        )
      lines.push(
        `| ${run.seed} | ${run.operatingPolicyId} | ${run.estatePolicyId} | ${String(warning.week)} | ${dollars(warning.cash)} | ${dollars(warning.aggregateAllRenewalSigningBonus)} | ${listText(affordable)} (${String(affordable.length)} / ${String(warning.owners)}; individual quotes only) | ${listText(warning.minimumRoleCoverageTalentIds)} at ${dollars(warning.minimumRoleCoverageSigningBonus)} (${warning.minimumRoleCoverageAffordableNow ? 'yes' : 'no'}) | ${listText(laterFeasible)} |`,
      )
    }
  }
  lines.push(
    '',
    '## Representative original-expiry consequences',
    '',
    '| Seed | Policy | Estate | Retained IDs (roles) | Released IDs (roles) | Unique rejected owners / retry clicks | Payroll Δ | Base / employee overhead Δ | Package blockers first post-expiry decision → Week 220 decision |',
    '| --- | --- | --- | --- | --- | ---: | ---: | --- | --- |',
  )
  for (const run of representativeRuns) {
    lines.push(
      `| ${run.seed} | ${run.operatingPolicyId} | ${run.estatePolicyId} | ${listText(run.retainedOwnerIds)} (${roleCoverageText(run.retainedOwnersByRole)}) | ${listText(run.releasedOwnerIds)} (${roleCoverageText(run.releasedOwnersByRole)}) | ${String(run.uniqueRejectedOriginalOwners)} / ${String(run.originalRetryAttempts)} | ${dollars(run.expiryPayrollDelta)} | ${dollars(run.expiryBaseOverheadDelta)} / ${dollars(run.expiryEmployeeOverheadDelta)} | staff ${String(run.firstPostExpiryDecisionStaffabilityBlockers)} → ${String(run.postExpiry12DecisionStaffabilityBlockers)}; affordability ${String(run.firstPostExpiryDecisionAffordabilityBlockers)} → ${String(run.postExpiry12DecisionAffordabilityBlockers)} |`,
    )
  }
  lines.push(
    '',
    '## Current retry-all outcomes by estate',
    '',
    '| Estate | Runs | Intended original owners | Attempted original owners | Unique rejected original owners | Original retry attempts | Partial walls | Full involuntary walls | Role-coverage losses |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  )
  const c1ByEstate = aggregateFacts(
    summary.runFacts.filter(
      (fact) => fact.continuationPolicyId === 'C1-current-retry-all' && fact.horizonWeeks === 260,
    ),
    'estatePolicyId',
    (fact) => fact.estatePolicyId,
  )
  for (const row of c1ByEstate) {
    lines.push(
      `| ${row.value} | ${String(row.runs)} | ${String(row.intendedOriginalOwners)} | ${String(row.attemptedOriginalOwners)} | ${String(row.uniqueRejectedOriginalOwners)} | ${String(row.originalRetryAttempts)} | ${String(row.partialCohortWalls)} | ${String(row.fullInvoluntaryCohortWalls)} | ${String(row.contractRoleCoverageLosses)} |`,
    )
  }
  lines.push(
    '',
    '## Exact vacant renewal-policy pairs',
    '',
    '| Compared policy | Horizon | Pairs | Role improvements at same accepted headcount | Missing-role Δ median | Retry Δ median | Signing-bonus Δ median | Final-cash Δ median | Final-cash signs (- / 0 / +) |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  )
  for (const row of summary.exactVacantPairs.aggregates) {
    lines.push(
      `| ${row.comparedPolicyId} | ${String(row.horizonWeeks)} | ${String(row.pairs)} | ${String(row.roleCoverageImprovedWithSameAcceptedHeadcount)} | ${String(row.missingRoleDelta.median ?? 'n/a')} | ${String(row.retryAttemptDelta.median ?? 'n/a')} | ${dollars(row.signingBonusDelta.median)} | ${dollars(row.finalCashDelta.median)} | ${String(row.finalCashSigns.negative)} / ${String(row.finalCashSigns.zero)} / ${String(row.finalCashSigns.positive)} |`,
    )
  }
  lines.push(
    '',
    '## Week-428 recurrence cadence',
    '',
    '| Policy | Estate | Runs | Renewal-window weeks | Post-expiry weeks | Quoted recurrence obligation | Recurrence obligations attempted / rejected | Recurrence retry clicks | Post-recurrence role-loss runs | All-horizon signing bonuses | All-horizon guaranteed cash obligation |',
    '| --- | --- | ---: | --- | --- | ---: | --- | ---: | ---: | ---: | ---: |',
  )
  const cadenceGroups = new Map<string, {
    policy: string
    estate: string
    runs: number
    windowWeeks: Set<number>
    postWeeks: Set<number>
    quoted: number
    attempted: number
    rejected: number
    retries: number
    roleLossRuns: number
    bonuses: number
    guaranteed: number
  }>()
  for (const run of summary.runFacts.filter((fact) => fact.horizonWeeks === 428)) {
    const key = `${run.continuationPolicyId}|${run.estatePolicyId}`
    const group = cadenceGroups.get(key) ?? {
      policy: run.continuationPolicyId,
      estate: run.estatePolicyId,
      runs: 0,
      windowWeeks: new Set<number>(),
      postWeeks: new Set<number>(),
      quoted: 0,
      attempted: 0,
      rejected: 0,
      retries: 0,
      roleLossRuns: 0,
      bonuses: 0,
      guaranteed: 0,
    }
    group.runs++
    for (const week of run.recurrenceWindowWeeks) group.windowWeeks.add(week)
    for (const week of run.recurrencePostExpiryWeeks) group.postWeeks.add(week)
    group.quoted += run.recurrenceQuotedObligations.reduce(
      (sum, obligation) => sum + obligation.signingBonus,
      0,
    )
    group.attempted += run.recurrenceAttemptedContractObligations
    group.rejected += run.recurrenceUniqueRejectedContractObligations
    group.retries += run.recurrenceRetryAttempts
    group.roleLossRuns += Number(run.recurrencePostRoleCoverageLossWeeks.length > 0)
    group.bonuses += run.allSigningBonusesPaid
    group.guaranteed += run.allGuaranteedCashObligationAccepted
    cadenceGroups.set(key, group)
  }
  for (const group of [...cadenceGroups.values()].sort(
    (a, b) => compareText(a.policy, b.policy) || compareText(a.estate, b.estate),
  )) {
    lines.push(
      `| ${group.policy} | ${group.estate} | ${String(group.runs)} | ${[...group.windowWeeks].sort((a, b) => a - b).join(', ') || 'none'} | ${[...group.postWeeks].sort((a, b) => a - b).join(', ') || 'none'} | ${dollars(group.quoted)} | ${String(group.attempted)} / ${String(group.rejected)} | ${String(group.retries)} | ${String(group.roleLossRuns)} | ${dollars(group.bonuses)} | ${dollars(group.guaranteed)} |`,
    )
  }
  lines.push(
    '',
    '## Mixed-founding player-policy cadence (descriptive after policy feedback)',
    '',
    '| Operating policy | Runs | Founding people | Contract obligations | Accepted obligations / people | Rejected obligations / people | Retry attempts | Accepted renewals | Quoted obligation | Recurrence weeks | Signing bonuses paid | Guaranteed accepted cash obligation |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |',
  )
  for (const row of summary.playerPolicy.aggregatesByOperatingPolicy) {
    lines.push(
      `| ${row.operatingPolicyId} | ${String(row.runs)} | ${String(row.foundingOwners)} | ${String(row.uniqueContractObligations)} | ${String(row.uniqueAcceptedContractObligations)} / ${String(row.uniqueAcceptedTalents)} | ${String(row.uniqueRejectedContractObligations)} / ${String(row.uniqueRejectedTalents)} | ${String(row.retryAttempts)} | ${String(row.acceptedRenewals)} | ${dollars(row.totalQuotedSigningBonusObligation)} | ${row.recurrenceWindowWeeks.length === 0 ? 'none' : row.recurrenceWindowWeeks.join(', ')} | ${dollars(row.totalSigningBonusesPaid)} | ${dollars(row.guaranteedCashObligationAccepted)} |`,
    )
  }
  lines.push(
    '',
    '### Representative mixed-term runs',
    '',
    '| Seed | Policy | Final active people | Final role coverage | Every accepted expiry move (accepted week: talent role old→next) | Observed recurrence windows / arrivals | Staffability / affordability blockers | Final cash |',
    '| --- | --- | --- | --- | --- | --- | --- | ---: |',
  )
  for (const run of summary.playerPolicy.runFacts.filter(
    (fact) => fact.seed === representativeSeed,
  )) {
    lines.push(
      `| ${run.seed} | ${run.operatingPolicyId} | ${listText(run.finalActiveContractTalentIds)} | ${run.finalRoleCoverage === null ? 'n/a' : roleCoverageText(run.finalRoleCoverage)} | ${listText(run.acceptedExpiryMoves.map((move) => `${String(move.acceptedWeek)}: ${move.talentId} ${move.role} ${String(move.previousEndWeekExclusive)}→${String(move.nextEndWeekExclusive)}`))} | ${listText(run.recurrenceWindowWeeks.map(String))} / ${listText(run.recurrencePostExpiryWeeks.map(String))} | ${String(run.packageStaffabilityBlockers)} / ${String(run.packageAffordabilityBlockers)} | ${dollars(run.finalCash)} |`,
    )
  }
  lines.push(
    '',
    '## H1-H6',
    '',
    '| Hypothesis | Status | Numerator | Denominator | Bounded finding |',
    '| --- | --- | ---: | ---: | --- |',
  )
  for (const id of ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'] as const) {
    const row = summary.hypotheses[id]
    lines.push(`| ${id} | ${row.status} | ${String(row.numerator)} | ${String(row.denominator)} | ${row.statement} |`)
  }
  lines.push(
    '',
    '## D1-D7',
    '',
    '| Gate | Status | Numerator | Denominator | Bounded decision evidence |',
    '| --- | --- | ---: | ---: | --- |',
  )
  for (const id of ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'] as const) {
    const row = summary.decisionGates[id]
    lines.push(`| ${id} | ${row.status} | ${String(row.numerator)} | ${String(row.denominator)} | ${row.statement} |`)
  }
  lines.push(
    '',
    '## Governing interpretation boundary',
    '',
    '- This is behavior-neutral research, not an implementation authorization or complete economy-balance certification.',
    '- Vacant/Annex differences are descriptive; no facility-causal estimate is made.',
    '- C0 voluntary attrition is never counted as an involuntary wall.',
    '- Unique rejected owners and retry attempts retain separate denominators.',
    '- Materiality and equally-material displacement have no invented threshold; exact evidence remains subject to review.',
    `- Open residuals: ${summary.interpretationBoundary.openMacroeconomyResiduals.join('; ')}.`,
    '',
  )
  return lines.join('\n')
}
