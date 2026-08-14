// Week-208 roster-wall observatory: deterministic synthetic mechanics fixtures.
//
// ANALYSIS ONLY. These states are deliberately constructed and permanently labelled
// `mechanics-fixture`; they are not campaign entries and must never be pooled with
// campaign prevalence. The fixtures use the public renewal policy seam plus the public
// tick/read models to isolate contract-window, renewal, payroll, overhead, and expiry law.

import {
  FOUNDING_MINIMUMS,
  TUNING,
  activeContract,
  contractOffer,
  generateWorld,
  rosterCoverage,
  tick,
  weeklyOverhead,
  weeklyPayroll,
} from '../../core/index.js'
import type {
  Contract,
  CreativeRole,
  GameState,
  LedgerEntry,
} from '../../core/index.js'
import {
  ROSTER_CONTINUATION_POLICY_IDS,
  applyRenewalPolicy,
  createRenewalPolicyMemory,
  planRenewals,
} from './renewal.js'
import type {
  RenewalIntentObservation,
  RenewalPolicyMemory,
  RosterContinuationPolicyId,
} from './renewal.js'
import {
  ROSTER_WALL_EXPERIMENT_ID,
  ROSTER_WALL_OBSERVER_SCHEMA_VERSION,
  ROSTER_WALL_SEED_SET_ID,
  rosterWallSerializedEvidenceRecord,
} from './schema.js'
import type { RosterWallCommonEnvelope } from './schema.js'
import type { RosterWallSourceProvenance } from './provenance.js'

export const ROSTER_WALL_MECHANICS_SCHEMA_VERSION =
  ROSTER_WALL_OBSERVER_SCHEMA_VERSION
export const ROSTER_WALL_MECHANICS_RECORD_TYPE = 'mechanicsFixture' as const
export const ROSTER_WALL_MECHANICS_MODE = 'mechanics-fixture' as const
// Fixture-local sub-experiment identity. The serialized top-level experimentId
// remains the one canonical roster-wall experiment ID from schema.ts.
export const ROSTER_WALL_MECHANICS_EXPERIMENT_ID =
  'week-208-roster-wall-mechanics-fixtures-v1' as const
export const ROSTER_WALL_MECHANICS_ENTRY_WEEK = 196 as const
export const ROSTER_WALL_MECHANICS_EXPIRY_WEEK = 208 as const
export const ROSTER_WALL_MECHANICS_HORIZON_WEEKS = 12 as const

const ROLE_ORDER = ['actor', 'director', 'writer', 'craft'] as const

export type RosterWallMechanicsCohortSize = 1 | 7 | 13

export type RosterWallMechanicsCohortSpec = {
  cohortSize: RosterWallMechanicsCohortSize
  seed: string
  talentIds: readonly string[]
}

/**
 * Explicit IDs and roles are part of the frozen fixture input, not discovered from a
 * hiring-market sample. World generation guarantees these role-prefixed identities;
 * fixture construction asserts the mapping loudly before use.
 */
export const ROSTER_WALL_MECHANICS_FIXTURE_COHORTS = [
  {
    cohortSize: 1,
    seed: 'roster-wall-mechanics-cohort-01',
    talentIds: ['t-act-00'],
  },
  {
    cohortSize: 7,
    seed: 'roster-wall-mechanics-cohort-07',
    talentIds: [
      't-act-00',
      't-act-01',
      't-act-02',
      't-act-03',
      't-dir-00',
      't-wri-00',
      't-cra-00',
    ],
  },
  {
    cohortSize: 13,
    seed: 'roster-wall-mechanics-cohort-13',
    talentIds: [
      't-act-00',
      't-act-01',
      't-act-02',
      't-act-03',
      't-act-04',
      't-act-05',
      't-act-06',
      't-dir-00',
      't-dir-01',
      't-wri-00',
      't-wri-01',
      't-cra-00',
      't-cra-01',
    ],
  },
] as const satisfies readonly RosterWallMechanicsCohortSpec[]

export const ROSTER_WALL_MECHANICS_FIXTURE_COHORT_SIZES = [1, 7, 13] as const

export const ROSTER_WALL_MECHANICS_THRESHOLD_IDS = [
  'cash-negative-one',
  'cash-zero',
  'minimum-single-quote-minus-one',
  'minimum-single-quote-exact',
  'minimum-full-role-coverage-minus-one',
  'minimum-full-role-coverage-exact',
  'all-cohort-bonuses-minus-one',
  'all-cohort-bonuses-exact',
] as const

export type RosterWallMechanicsThresholdId =
  (typeof ROSTER_WALL_MECHANICS_THRESHOLD_IDS)[number]

// Only the one-person cohort cannot meet complete founding role coverage. Its two
// coverage thresholds are retained for every continuation policy as explicit N/A rows.
export const ROSTER_WALL_MECHANICS_FIXTURE_NOT_APPLICABLE_ROW_COUNT =
  2 * ROSTER_CONTINUATION_POLICY_IDS.length
export const ROSTER_WALL_MECHANICS_FIXTURE_EXECUTED_ROW_COUNT =
  ROSTER_WALL_MECHANICS_FIXTURE_COHORTS.length *
    ROSTER_WALL_MECHANICS_THRESHOLD_IDS.length *
    ROSTER_CONTINUATION_POLICY_IDS.length -
  ROSTER_WALL_MECHANICS_FIXTURE_NOT_APPLICABLE_ROW_COUNT

export const ROSTER_WALL_MECHANICS_FIXTURE_MATRIX = {
  cohortSizes: ROSTER_WALL_MECHANICS_FIXTURE_COHORT_SIZES,
  thresholdIds: ROSTER_WALL_MECHANICS_THRESHOLD_IDS,
  continuationPolicyIds: ROSTER_CONTINUATION_POLICY_IDS,
  cohortCount: ROSTER_WALL_MECHANICS_FIXTURE_COHORTS.length,
  thresholdsPerCohort: ROSTER_WALL_MECHANICS_THRESHOLD_IDS.length,
  policiesPerThreshold: ROSTER_CONTINUATION_POLICY_IDS.length,
  rowCount:
    ROSTER_WALL_MECHANICS_FIXTURE_COHORTS.length *
    ROSTER_WALL_MECHANICS_THRESHOLD_IDS.length *
    ROSTER_CONTINUATION_POLICY_IDS.length,
  executedRowCount: ROSTER_WALL_MECHANICS_FIXTURE_EXECUTED_ROW_COUNT,
  notApplicableRowCount: ROSTER_WALL_MECHANICS_FIXTURE_NOT_APPLICABLE_ROW_COUNT,
} as const

export const ROSTER_WALL_MECHANICS_FIXTURE_ROW_COUNT =
  ROSTER_WALL_MECHANICS_FIXTURE_MATRIX.rowCount

export type RosterWallMechanicsRoleComposition = Record<CreativeRole, number>

export type RosterWallMechanicsMissingRole = {
  role: CreativeRole
  required: number
  available: number
  missing: number
}

export type RosterWallMechanicsThreshold = {
  thresholdId: RosterWallMechanicsThresholdId
  applicability: 'applicable' | 'not-applicable'
  applicable: boolean
  value: number | null
  referenceAmount: number | null
  adjustment: -1 | 0
  basisTalentIds: string[]
  basisOffers: RosterWallMechanicsThresholdBasisOffer[]
  missingRoles: RosterWallMechanicsMissingRole[]
}

export type RosterWallMechanicsThresholdBasisOffer = {
  continuationPolicyId: RosterContinuationPolicyId
  policyOrderRank: number
  talentId: string
  role: CreativeRole
  selectedTerm: RenewalIntentObservation['selectedTerm']
  signingBonus: number
}

export type RosterWallMechanicsIndexedLedgerEntry = {
  ledgerIndex: number
  entry: LedgerEntry
}

export type RosterWallMechanicsTickLedger = {
  week: number
  activeTalentIdsBeforeTick: string[]
  activeTalentIdsAfterTick: string[]
  scheduledPayroll: number
  scheduledOverhead: number
  payrollRows: RosterWallMechanicsIndexedLedgerEntry[]
  overheadRows: RosterWallMechanicsIndexedLedgerEntry[]
  appendedLedger: RosterWallMechanicsIndexedLedgerEntry[]
}

export type RosterWallMechanicsPayrollOverheadLedger = {
  transitions: RosterWallMechanicsTickLedger[]
  payrollRowCount: number
  payrollTotal: number
  overheadRowCount: number
  overheadTotal: number
  finalPayrollWeek: number
  finalPayrollScheduled: number
  finalPayrollLedgerAmount: number
  finalOverheadScheduled: number
  finalOverheadLedgerAmount: number
}

export type RosterWallMechanicsOutcome = {
  entryCash: number
  finalCash: number
  entryRngState: string
  finalRngState: string
  finalWeek: number
  cohortTalentIds: string[]
  acceptedOwnerIds: string[]
  rejectedOwnerIds: string[]
  retryAttempts: number
  retainedTalentIds: string[]
  releasedTalentIds: string[]
  transferredFreeAgentIds: string[]
  finalFreeAgentIds: string[]
  signingBonusRows: RosterWallMechanicsIndexedLedgerEntry[]
}

export type RosterWallMechanicsExpectedInvariants = {
  executed: boolean
  entryWeek: number
  expiryWeekExclusive: number
  finalWeek: number | null
  cohortSize: number
  finalPayrollWeek: number | null
  acceptedSigningBonusRows: number | null
  notApplicableMissingRolesRetained: boolean
}

export type RosterWallMechanicsActualInvariants = {
  executed: boolean
  cohortSizeExact: boolean | null
  halfOpenExpiryExact: boolean | null
  finalPayrollMatched: boolean | null
  acceptedHaveExactlyOneSigningBonus: boolean | null
  rejectedHaveNoSigningBonus: boolean | null
  renewalRngUnchanged: boolean | null
  finalRngUnchangedWithoutProductions: boolean | null
  expiredTransferredToFreeAgents: boolean | null
  retainedEqualsAcceptedOwners: boolean | null
  payrollAndOverheadSeparate: boolean | null
  cashLedgerReconciles: boolean | null
  notApplicableMissingRolesRetained: boolean
  allPassed: boolean
}

export type RosterWallMechanicsFixtureRow = RosterWallCommonEnvelope & {
  schemaVersion: typeof ROSTER_WALL_MECHANICS_SCHEMA_VERSION
  recordType: typeof ROSTER_WALL_MECHANICS_RECORD_TYPE
  mode: typeof ROSTER_WALL_MECHANICS_MODE
  experimentId: typeof ROSTER_WALL_EXPERIMENT_ID
  seedSetId: typeof ROSTER_WALL_SEED_SET_ID
  seed: string
  operatingPolicyId: null
  estatePolicyId: null
  foundingTermPolicyId: null
  continuationPolicyId: RosterContinuationPolicyId
  horizonWeeks: typeof ROSTER_WALL_MECHANICS_HORIZON_WEEKS
  initialSaveHash: null
  entryId: null
  entryWeek: typeof ROSTER_WALL_MECHANICS_ENTRY_WEEK
  entrySaveHash: null
  entryStateHash: null
  week: typeof ROSTER_WALL_MECHANICS_ENTRY_WEEK
  fixtureExperimentId: typeof ROSTER_WALL_MECHANICS_EXPERIMENT_ID
  fixtureId: string
  cohortSize: RosterWallMechanicsCohortSize
  cohortTalentIds: string[]
  roleComposition: RosterWallMechanicsRoleComposition
  expiryWeekExclusive: typeof ROSTER_WALL_MECHANICS_EXPIRY_WEEK
  threshold: RosterWallMechanicsThreshold
  intents: RenewalIntentObservation[]
  outcome: RosterWallMechanicsOutcome | null
  finalRoleCoverage: RosterWallMechanicsRoleComposition | null
  payrollOverheadLedger: RosterWallMechanicsPayrollOverheadLedger | null
  expectedInvariants: RosterWallMechanicsExpectedInvariants
  actualInvariants: RosterWallMechanicsActualInvariants
}

type QuoteFact = {
  continuationPolicyId: RosterContinuationPolicyId
  policyOrderRank: number
  talentId: string
  role: CreativeRole
  selectedTerm: RenewalIntentObservation['selectedTerm']
  signingBonus: number
}

const EXISTING_FREE_AGENT_ID = 't-act-27'

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function emptyRoleComposition(): RosterWallMechanicsRoleComposition {
  return { actor: 0, director: 0, writer: 0, craft: 0 }
}

function canonicalRoleComposition(
  state: GameState,
  talentIds: readonly string[],
): RosterWallMechanicsRoleComposition {
  const composition = emptyRoleComposition()
  for (const talentId of talentIds) {
    const talent = state.talent.find((candidate) => candidate.id === talentId)
    if (talent === undefined) {
      throw new Error(`roster-wall mechanics fixture: unknown talent ${JSON.stringify(talentId)}`)
    }
    composition[talent.role]++
  }
  return composition
}

function cohortSpec(cohortSize: RosterWallMechanicsCohortSize): RosterWallMechanicsCohortSpec {
  const spec = ROSTER_WALL_MECHANICS_FIXTURE_COHORTS.find(
    (candidate) => candidate.cohortSize === cohortSize,
  )
  if (spec === undefined) {
    throw new Error(`roster-wall mechanics fixture: unsupported cohort size ${String(cohortSize)}`)
  }
  return spec
}

function assertExplicitRoles(state: GameState, spec: RosterWallMechanicsCohortSpec): void {
  for (const talentId of spec.talentIds) {
    const expectedRole = talentId.startsWith('t-act-')
      ? 'actor'
      : talentId.startsWith('t-dir-')
        ? 'director'
        : talentId.startsWith('t-wri-')
          ? 'writer'
          : talentId.startsWith('t-cra-')
            ? 'craft'
            : null
    const actualRole = state.talent.find((talent) => talent.id === talentId)?.role ?? null
    if (actualRole === null || actualRole !== expectedRole) {
      throw new Error(
        `roster-wall mechanics fixture: stable identity ${JSON.stringify(talentId)} expected role ${JSON.stringify(expectedRole)} but found ${JSON.stringify(actualRole)}`,
      )
    }
  }
  if (spec.talentIds.length !== spec.cohortSize) {
    throw new Error('roster-wall mechanics fixture: explicit cohort size disagrees with its ID list')
  }
  if (new Set(spec.talentIds).size !== spec.talentIds.length) {
    throw new Error('roster-wall mechanics fixture: explicit cohort repeats a talent ID')
  }
  if (spec.talentIds.includes(EXISTING_FREE_AGENT_ID)) {
    throw new Error('roster-wall mechanics fixture: cohort collides with the free-agent sentinel')
  }
}

function foundingContract(state: GameState, talentId: string): Contract {
  const offer = contractOffer(state, talentId, 208, 0)
  return {
    talentId,
    annualSalary: offer.annualSalary,
    signingBonus: offer.signingBonus,
    startWeek: 0,
    endWeekExclusive: ROSTER_WALL_MECHANICS_EXPIRY_WEEK,
    termWeeks: 208,
  }
}

/**
 * Build one labelled synthetic state at the Week-196 entry boundary. Direct state
 * construction is confined to this module. The cash checkpoint makes each chosen
 * threshold reconcile without inventing a ledger transaction.
 */
export function buildRosterWallMechanicsFixtureState(
  cohortSize: RosterWallMechanicsCohortSize,
  cash: number,
): GameState {
  if (!Number.isFinite(cash) || !Number.isInteger(cash)) {
    throw new Error('roster-wall mechanics fixture: cash must be a finite integer')
  }
  const spec = cohortSpec(cohortSize)
  const generated = generateWorld(spec.seed)
  assertExplicitRoles(generated, spec)
  const contracts = spec.talentIds.map((talentId) => foundingContract(generated, talentId))
  const checkpoint =
    cash === TUNING.INITIAL_CASH
      ? {}
      : { cashLedgerCheckpoint: { cash, ledgerLength: 0 } }
  return {
    ...generated,
    ...checkpoint,
    market: { ...generated.market, tick: ROSTER_WALL_MECHANICS_ENTRY_WEEK },
    studio: { ...generated.studio, cash },
    founding: null,
    contracts,
    ledger: [],
    freeAgents: [EXISTING_FREE_AGENT_ID],
    economyEngagedEver: true,
  }
}

function maximumTermQuoteFacts(
  state: GameState,
  talentIds: readonly string[],
  continuationPolicyId: RosterContinuationPolicyId,
): QuoteFact[] {
  return talentIds.map((talentId, policyOrderRank) => {
    const talent = state.talent.find((candidate) => candidate.id === talentId)
    if (talent === undefined) {
      throw new Error(`roster-wall mechanics fixture: quote references unknown ${talentId}`)
    }
    return {
      continuationPolicyId,
      policyOrderRank,
      talentId,
      role: talent.role,
      selectedTerm: 208,
      signingBonus: contractOffer(state, talentId, 208).signingBonus,
    }
  })
}

function policyQuoteFactsAtCash(
  cohortSize: RosterWallMechanicsCohortSize,
  continuationPolicyId: RosterContinuationPolicyId,
  cash: number,
): QuoteFact[] {
  const spec = cohortSpec(cohortSize)
  const baseline = buildRosterWallMechanicsFixtureState(cohortSize, cash)
  // C0 has no attempt order. Keep its counterfactual threshold quotes in the
  // fixture's frozen canonical cohort order, without pretending that it plans
  // renewal actions.
  if (continuationPolicyId === 'C0-no-renewal') {
    return maximumTermQuoteFacts(
      baseline,
      spec.talentIds,
      continuationPolicyId,
    )
  }

  // C4 and C5 inherit C3's cohort priority but gate the week on which each
  // candidate becomes eligible. At the Week-196 fixture boundary C4 plans no
  // actions and C5 exposes only its first scheduled action, so ask C3 for the
  // complete shared order used to rank the threshold basis.
  const orderingPolicy =
    continuationPolicyId === 'C4-last-legal-role-first' ||
    continuationPolicyId === 'C5-spread-role-first'
      ? 'C3-role-coverage-first'
      : continuationPolicyId
  const planned = planRenewals(
    baseline,
    orderingPolicy,
    createRenewalPolicyMemory(ROSTER_WALL_MECHANICS_ENTRY_WEEK),
  ).plans
  if (planned.length !== spec.talentIds.length) {
    throw new Error(
      `roster-wall mechanics fixture: ${continuationPolicyId} quote basis omitted a cohort owner`,
    )
  }
  return planned.map((plan, policyOrderRank) => ({
    continuationPolicyId,
    policyOrderRank,
    talentId: plan.talentId,
    role: plan.role,
    selectedTerm: plan.selectedTerm,
    signingBonus: plan.offer.signingBonus,
  }))
}

function sameQuoteFacts(a: readonly QuoteFact[], b: readonly QuoteFact[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (fact, index) =>
        fact.continuationPolicyId === b[index]!.continuationPolicyId &&
        fact.policyOrderRank === b[index]!.policyOrderRank &&
        fact.talentId === b[index]!.talentId &&
        fact.role === b[index]!.role &&
        fact.selectedTerm === b[index]!.selectedTerm &&
        fact.signingBonus === b[index]!.signingBonus,
    )
  )
}

function quoteBasisForThresholdCash(
  cohortSize: RosterWallMechanicsCohortSize,
  continuationPolicyId: RosterContinuationPolicyId,
  cash: number,
): QuoteFact[] {
  const quotes = policyQuoteFactsAtCash(cohortSize, continuationPolicyId, cash)
  const repeated = policyQuoteFactsAtCash(cohortSize, continuationPolicyId, cash)
  if (!sameQuoteFacts(quotes, repeated)) {
    throw new Error('roster-wall mechanics fixture: policy quote basis was nondeterministic')
  }
  return quotes
}

function thresholdReference(
  thresholdId: RosterWallMechanicsThresholdId,
  quotes: readonly QuoteFact[],
): { amount: number; basisOffers: QuoteFact[] } | null {
  if (
    thresholdId === 'cash-negative-one' ||
    thresholdId === 'cash-zero'
  ) return { amount: 0, basisOffers: [] }
  if (
    thresholdId === 'minimum-single-quote-minus-one' ||
    thresholdId === 'minimum-single-quote-exact'
  ) {
    const minimum = [...quotes].sort(
      (a, b) => a.signingBonus - b.signingBonus || compareId(a.talentId, b.talentId),
    )[0]!
    return { amount: minimum.signingBonus, basisOffers: [minimum] }
  }
  if (
    thresholdId === 'minimum-full-role-coverage-minus-one' ||
    thresholdId === 'minimum-full-role-coverage-exact'
  ) {
    const minimumCoverage = minimumFullRoleCoverage(quotes)
    if (minimumCoverage === null) return null
    return {
      amount: minimumCoverage.amount,
      basisOffers: minimumCoverage.talentIds.map((talentId) =>
        quotes.find((quote) => quote.talentId === talentId)!,
      ),
    }
  }
  return {
    amount: quotes.reduce((sum, quote) => sum + quote.signingBonus, 0),
    basisOffers: [...quotes],
  }
}

function policyAlignedThreshold(
  cohortSize: RosterWallMechanicsCohortSize,
  continuationPolicyId: RosterContinuationPolicyId,
  thresholdId: RosterWallMechanicsThresholdId,
): RosterWallMechanicsThreshold {
  const adjustment = thresholdId.endsWith('-minus-one') ? -1 : 0
  if (thresholdId === 'cash-negative-one' || thresholdId === 'cash-zero') {
    return applicableThreshold(
      thresholdId,
      thresholdId === 'cash-negative-one' ? -1 : 0,
      null,
      0,
      [],
    )
  }

  let cash: number = TUNING.INITIAL_CASH
  const visited = new Set<number>()
  for (let iteration = 0; iteration < 32; iteration++) {
    if (visited.has(cash)) {
      throw new Error(
        `roster-wall mechanics fixture: ${continuationPolicyId} ${thresholdId} quote threshold did not converge`,
      )
    }
    visited.add(cash)
    const quotes = quoteBasisForThresholdCash(cohortSize, continuationPolicyId, cash)
    const reference = thresholdReference(thresholdId, quotes)
    if (reference === null) {
      return notApplicableThreshold(
        thresholdId,
        adjustment,
        missingFoundingRoles(quotes),
      )
    }
    const nextCash = reference.amount + adjustment
    if (nextCash === cash) {
      return applicableThreshold(
        thresholdId,
        cash,
        reference.amount,
        adjustment,
        reference.basisOffers,
      )
    }
    cash = nextCash
  }
  throw new Error(
    `roster-wall mechanics fixture: ${continuationPolicyId} ${thresholdId} quote threshold exceeded convergence bound`,
  )
}

function missingFoundingRoles(quotes: readonly QuoteFact[]): RosterWallMechanicsMissingRole[] {
  const composition = emptyRoleComposition()
  for (const quote of quotes) composition[quote.role]++
  return ROLE_ORDER.flatMap((role) => {
    const required = FOUNDING_MINIMUMS[role]
    const available = composition[role]
    return available >= required
      ? []
      : [{ role, required, available, missing: required - available }]
  })
}

function compareIdLists(a: readonly string[], b: readonly string[]): number {
  for (let index = 0; index < Math.min(a.length, b.length); index++) {
    const delta = compareId(a[index]!, b[index]!)
    if (delta !== 0) return delta
  }
  return a.length - b.length
}

function minimumFullRoleCoverage(
  quotes: readonly QuoteFact[],
): { amount: number; talentIds: string[] } | null {
  if (missingFoundingRoles(quotes).length > 0) return null
  const canonical = [...quotes].sort((a, b) => compareId(a.talentId, b.talentId))
  let best: { amount: number; talentIds: string[] } | null = null
  for (let mask = 0; mask < 2 ** canonical.length; mask++) {
    const coverage = emptyRoleComposition()
    const talentIds: string[] = []
    let amount = 0
    for (let index = 0; index < canonical.length; index++) {
      if ((mask & 2 ** index) === 0) continue
      const quote = canonical[index]!
      coverage[quote.role]++
      amount += quote.signingBonus
      talentIds.push(quote.talentId)
    }
    if (!ROLE_ORDER.every((role) => coverage[role] >= FOUNDING_MINIMUMS[role])) continue
    if (
      best === null ||
      amount < best.amount ||
      (amount === best.amount && compareIdLists(talentIds, best.talentIds) < 0)
    ) {
      best = { amount, talentIds }
    }
  }
  return best
}

function applicableThreshold(
  thresholdId: RosterWallMechanicsThresholdId,
  value: number,
  referenceAmount: number | null,
  adjustment: -1 | 0,
  basisOffers: readonly QuoteFact[],
): RosterWallMechanicsThreshold {
  return {
    thresholdId,
    applicability: 'applicable',
    applicable: true,
    value,
    referenceAmount,
    adjustment,
    basisTalentIds: basisOffers.map((offer) => offer.talentId),
    basisOffers: basisOffers.map((offer) => ({ ...offer })),
    missingRoles: [],
  }
}

function notApplicableThreshold(
  thresholdId: RosterWallMechanicsThresholdId,
  adjustment: -1 | 0,
  missingRoles: readonly RosterWallMechanicsMissingRole[],
): RosterWallMechanicsThreshold {
  return {
    thresholdId,
    applicability: 'not-applicable',
    applicable: false,
    value: null,
    referenceAmount: null,
    adjustment,
    basisTalentIds: [],
    basisOffers: [],
    missingRoles: missingRoles.map((missing) => ({ ...missing })),
  }
}

/** Derive all eight named cash boundaries from this policy's exact Week-196 offers. */
export function deriveRosterWallMechanicsThresholds(
  cohortSize: RosterWallMechanicsCohortSize,
  continuationPolicyId: RosterContinuationPolicyId,
): RosterWallMechanicsThreshold[] {
  return ROSTER_WALL_MECHANICS_THRESHOLD_IDS.map((thresholdId) =>
    policyAlignedThreshold(cohortSize, continuationPolicyId, thresholdId),
  )
}

function activeCohortTalentIds(state: GameState, cohortIds: readonly string[]): string[] {
  return cohortIds.filter((talentId) => activeContract(state, talentId) !== undefined)
}

function indexedRows(
  ledger: readonly LedgerEntry[],
  startIndex: number,
): RosterWallMechanicsIndexedLedgerEntry[] {
  return ledger.slice(startIndex).map((entry, offset) => ({
    ledgerIndex: startIndex + offset,
    entry: { ...entry },
  }))
}

function sumOutflow(rows: readonly RosterWallMechanicsIndexedLedgerEntry[]): number {
  return rows.reduce((sum, row) => sum - row.entry.amount, 0)
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareId)
}

function reconciledCash(state: GameState): number {
  const checkpoint = state.cashLedgerCheckpoint
  let cash = checkpoint?.cash ?? TUNING.INITIAL_CASH
  const start = checkpoint?.ledgerLength ?? 0
  for (let index = start; index < state.ledger.length; index++) {
    cash += state.ledger[index]!.amount
  }
  return cash
}

function executeFixture(
  cohortSize: RosterWallMechanicsCohortSize,
  cash: number,
  policyId: RosterContinuationPolicyId,
): {
  intents: RenewalIntentObservation[]
  outcome: RosterWallMechanicsOutcome
  finalRoleCoverage: RosterWallMechanicsRoleComposition
  payrollOverheadLedger: RosterWallMechanicsPayrollOverheadLedger
  expectedInvariants: RosterWallMechanicsExpectedInvariants
  actualInvariants: RosterWallMechanicsActualInvariants
} {
  const spec = cohortSpec(cohortSize)
  const entryState = buildRosterWallMechanicsFixtureState(cohortSize, cash)
  const entryRngState = entryState.rngState
  const initialLedgerLength = entryState.ledger.length
  let state = entryState
  let memory: RenewalPolicyMemory = createRenewalPolicyMemory(
    ROSTER_WALL_MECHANICS_ENTRY_WEEK,
  )
  const intents: RenewalIntentObservation[] = []
  const transitions: RosterWallMechanicsTickLedger[] = []

  while (state.market.tick < ROSTER_WALL_MECHANICS_EXPIRY_WEEK) {
    const renewalStep = applyRenewalPolicy(state, policyId, memory)
    state = renewalStep.state
    memory = renewalStep.memory
    intents.push(...renewalStep.intents.map((intent) => structuredClone(intent)))

    const week = state.market.tick
    const activeTalentIdsBeforeTick = activeCohortTalentIds(state, spec.talentIds)
    const scheduledPayroll = weeklyPayroll(state)
    const scheduledOverhead = weeklyOverhead(state)
    const ledgerLength = state.ledger.length
    const advanced = tick(state)
    const appendedLedger = indexedRows(advanced.ledger, ledgerLength)
    transitions.push({
      week,
      activeTalentIdsBeforeTick,
      activeTalentIdsAfterTick: activeCohortTalentIds(advanced, spec.talentIds),
      scheduledPayroll,
      scheduledOverhead,
      payrollRows: appendedLedger.filter((row) => row.entry.kind === 'payroll'),
      overheadRows: appendedLedger.filter((row) => row.entry.kind === 'overhead'),
      appendedLedger,
    })
    state = advanced
  }

  const acceptedIntents = intents.filter((intent) => intent.accepted)
  const rejectedIntents = intents.filter((intent) => !intent.accepted)
  const acceptedOwnerIds = uniqueSorted(acceptedIntents.map((intent) => intent.talentId))
  const rejectedOwnerIds = uniqueSorted(rejectedIntents.map((intent) => intent.talentId))
  const retainedTalentIds = activeCohortTalentIds(state, spec.talentIds)
  const releasedTalentIds = spec.talentIds.filter(
    (talentId) => !retainedTalentIds.includes(talentId),
  )
  const transferredFreeAgentIds = releasedTalentIds.filter((talentId) =>
    state.freeAgents.includes(talentId),
  )
  const signingBonusRows = indexedRows(state.ledger, initialLedgerLength).filter(
    (row) => row.entry.kind === 'signingBonus',
  )
  const payrollRows = transitions.flatMap((transition) => transition.payrollRows)
  const overheadRows = transitions.flatMap((transition) => transition.overheadRows)
  const finalTransition = transitions[transitions.length - 1]!
  const finalPayrollLedgerAmount = finalTransition.payrollRows.reduce(
    (sum, row) => sum + row.entry.amount,
    0,
  )
  const finalOverheadLedgerAmount = finalTransition.overheadRows.reduce(
    (sum, row) => sum + row.entry.amount,
    0,
  )
  const payrollOverheadLedger: RosterWallMechanicsPayrollOverheadLedger = {
    transitions,
    payrollRowCount: payrollRows.length,
    payrollTotal: sumOutflow(payrollRows),
    overheadRowCount: overheadRows.length,
    overheadTotal: sumOutflow(overheadRows),
    finalPayrollWeek: finalTransition.week,
    finalPayrollScheduled: finalTransition.scheduledPayroll,
    finalPayrollLedgerAmount,
    finalOverheadScheduled: finalTransition.scheduledOverhead,
    finalOverheadLedgerAmount,
  }

  const expectedReleasedIds = spec.talentIds.filter(
    (talentId) => !acceptedOwnerIds.includes(talentId),
  )
  const expectedInvariants: RosterWallMechanicsExpectedInvariants = {
    executed: true,
    entryWeek: ROSTER_WALL_MECHANICS_ENTRY_WEEK,
    expiryWeekExclusive: ROSTER_WALL_MECHANICS_EXPIRY_WEEK,
    finalWeek: ROSTER_WALL_MECHANICS_EXPIRY_WEEK,
    cohortSize,
    finalPayrollWeek: ROSTER_WALL_MECHANICS_EXPIRY_WEEK - 1,
    acceptedSigningBonusRows: acceptedIntents.length,
    notApplicableMissingRolesRetained: false,
  }
  const positiveInvariantFacts = {
    cohortSizeExact:
      entryState.contracts.length === cohortSize && spec.talentIds.length === cohortSize,
    halfOpenExpiryExact:
      finalTransition.week === ROSTER_WALL_MECHANICS_EXPIRY_WEEK - 1 &&
      finalTransition.activeTalentIdsBeforeTick.length === cohortSize &&
      expectedReleasedIds.every(
        (talentId) => !finalTransition.activeTalentIdsAfterTick.includes(talentId),
      ),
    finalPayrollMatched:
      finalTransition.payrollRows.length === 1 &&
      finalPayrollLedgerAmount === -finalTransition.scheduledPayroll,
    acceptedHaveExactlyOneSigningBonus:
      signingBonusRows.length === acceptedIntents.length &&
      acceptedIntents.every(
        (intent) =>
          intent.signingBonusLedgerEntry?.kind === 'signingBonus' &&
          intent.signingBonusLedgerIndex !== null &&
          signingBonusRows.some(
            (row) =>
              row.ledgerIndex === intent.signingBonusLedgerIndex &&
              row.entry.kind === 'signingBonus' &&
              row.entry.talentId === intent.talentId &&
              row.entry.amount === -intent.offer.signingBonus,
          ),
      ),
    rejectedHaveNoSigningBonus: rejectedIntents.every(
      (intent) =>
        intent.signingBonusLedgerIndex === null && intent.signingBonusLedgerEntry === null,
    ),
    renewalRngUnchanged: intents.every((intent) => intent.rngBefore === intent.rngAfter),
    finalRngUnchangedWithoutProductions: state.rngState === entryRngState,
    expiredTransferredToFreeAgents:
      transferredFreeAgentIds.length === releasedTalentIds.length &&
      releasedTalentIds.every((talentId) => state.freeAgents.includes(talentId)),
    retainedEqualsAcceptedOwners:
      retainedTalentIds.length === acceptedOwnerIds.length &&
      retainedTalentIds.every((talentId) => acceptedOwnerIds.includes(talentId)),
    payrollAndOverheadSeparate: transitions.every(
      (transition) =>
        transition.payrollRows.length === 1 &&
        transition.overheadRows.length === 1 &&
        transition.payrollRows.every((row) => row.entry.kind === 'payroll') &&
        transition.overheadRows.every((row) => row.entry.kind === 'overhead') &&
        transition.payrollRows.reduce((sum, row) => sum + row.entry.amount, 0) ===
          -transition.scheduledPayroll &&
        transition.overheadRows.reduce((sum, row) => sum + row.entry.amount, 0) ===
          -transition.scheduledOverhead,
    ),
    cashLedgerReconciles: state.studio.cash === reconciledCash(state),
  }
  const actualInvariants: RosterWallMechanicsActualInvariants = {
    executed: true,
    ...positiveInvariantFacts,
    notApplicableMissingRolesRetained: false,
    allPassed: Object.values(positiveInvariantFacts).every((value) => value),
  }
  const outcome: RosterWallMechanicsOutcome = {
    entryCash: cash,
    finalCash: state.studio.cash,
    entryRngState,
    finalRngState: state.rngState,
    finalWeek: state.market.tick,
    cohortTalentIds: [...spec.talentIds],
    acceptedOwnerIds,
    rejectedOwnerIds,
    retryAttempts: rejectedIntents.length,
    retainedTalentIds,
    releasedTalentIds,
    transferredFreeAgentIds,
    finalFreeAgentIds: [...state.freeAgents],
    signingBonusRows,
  }
  return {
    intents,
    outcome,
    finalRoleCoverage: rosterCoverage(state),
    payrollOverheadLedger,
    expectedInvariants,
    actualInvariants,
  }
}

function notApplicableInvariants(
  cohortSize: RosterWallMechanicsCohortSize,
  threshold: RosterWallMechanicsThreshold,
): {
  expectedInvariants: RosterWallMechanicsExpectedInvariants
  actualInvariants: RosterWallMechanicsActualInvariants
} {
  const retained =
    !threshold.applicable &&
    threshold.value === null &&
    threshold.missingRoles.length > 0
  return {
    expectedInvariants: {
      executed: false,
      entryWeek: ROSTER_WALL_MECHANICS_ENTRY_WEEK,
      expiryWeekExclusive: ROSTER_WALL_MECHANICS_EXPIRY_WEEK,
      finalWeek: null,
      cohortSize,
      finalPayrollWeek: null,
      acceptedSigningBonusRows: null,
      notApplicableMissingRolesRetained: true,
    },
    actualInvariants: {
      executed: false,
      cohortSizeExact: null,
      halfOpenExpiryExact: null,
      finalPayrollMatched: null,
      acceptedHaveExactlyOneSigningBonus: null,
      rejectedHaveNoSigningBonus: null,
      renewalRngUnchanged: null,
      finalRngUnchangedWithoutProductions: null,
      expiredTransferredToFreeAgents: null,
      retainedEqualsAcceptedOwners: null,
      payrollAndOverheadSeparate: null,
      cashLedgerReconciles: null,
      notApplicableMissingRolesRetained: retained,
      allPassed: retained,
    },
  }
}

type RosterWallMechanicsFixturePayload = Omit<
  RosterWallMechanicsFixtureRow,
  keyof RosterWallCommonEnvelope
>

function serializedFixtureRow(
  source: RosterWallSourceProvenance,
  spec: RosterWallMechanicsCohortSpec,
  continuationPolicyId: RosterContinuationPolicyId,
  payload: RosterWallMechanicsFixturePayload,
): RosterWallMechanicsFixtureRow {
  return rosterWallSerializedEvidenceRecord(
    {
      recordType: ROSTER_WALL_MECHANICS_RECORD_TYPE,
      mode: ROSTER_WALL_MECHANICS_MODE,
      source,
      seed: spec.seed,
      operatingPolicyId: null,
      estatePolicyId: null,
      foundingTermPolicyId: null,
      continuationPolicyId,
      horizonWeeks: ROSTER_WALL_MECHANICS_HORIZON_WEEKS,
      initialSaveHash: null,
      entryWeek: ROSTER_WALL_MECHANICS_ENTRY_WEEK,
      entrySaveHash: null,
      entryStateHash: null,
      week: ROSTER_WALL_MECHANICS_ENTRY_WEEK,
    },
    payload,
  ) as RosterWallMechanicsFixtureRow
}

/**
 * Generate the complete deterministic 3 × 8 × 7 mechanics matrix. Every value is
 * plain canonical data: no dates, platform paths, or unordered sets. Every
 * artifact-facing row passes through the central accepted-source envelope.
 */
export function runRosterWallMechanicsFixtures(
  source: RosterWallSourceProvenance,
): RosterWallMechanicsFixtureRow[] {
  const rows: RosterWallMechanicsFixtureRow[] = []
  for (const spec of ROSTER_WALL_MECHANICS_FIXTURE_COHORTS) {
    const baseline = buildRosterWallMechanicsFixtureState(spec.cohortSize, TUNING.INITIAL_CASH)
    const roleComposition = canonicalRoleComposition(baseline, spec.talentIds)
    const thresholdsByPolicy = Object.fromEntries(
      ROSTER_CONTINUATION_POLICY_IDS.map((continuationPolicyId) => [
        continuationPolicyId,
        deriveRosterWallMechanicsThresholds(spec.cohortSize, continuationPolicyId),
      ]),
    ) as Record<RosterContinuationPolicyId, RosterWallMechanicsThreshold[]>
    for (let thresholdIndex = 0; thresholdIndex < ROSTER_WALL_MECHANICS_THRESHOLD_IDS.length; thresholdIndex++) {
      for (const continuationPolicyId of ROSTER_CONTINUATION_POLICY_IDS) {
        const threshold = thresholdsByPolicy[continuationPolicyId][thresholdIndex]!
        if (threshold.thresholdId !== ROSTER_WALL_MECHANICS_THRESHOLD_IDS[thresholdIndex]) {
          throw new Error('roster-wall mechanics fixture: policy threshold order drifted')
        }
        const fixtureId = [
          'mechanics-fixture',
          `cohort-${String(spec.cohortSize).padStart(2, '0')}`,
          threshold.thresholdId,
          continuationPolicyId,
        ].join(':')
        if (!threshold.applicable || threshold.value === null) {
          const invariants = notApplicableInvariants(spec.cohortSize, threshold)
          rows.push(
            serializedFixtureRow(source, spec, continuationPolicyId, {
              fixtureExperimentId: ROSTER_WALL_MECHANICS_EXPERIMENT_ID,
              fixtureId,
              cohortSize: spec.cohortSize,
              cohortTalentIds: [...spec.talentIds],
              roleComposition: { ...roleComposition },
              expiryWeekExclusive: ROSTER_WALL_MECHANICS_EXPIRY_WEEK,
              threshold: structuredClone(threshold),
              intents: [],
              outcome: null,
              finalRoleCoverage: null,
              payrollOverheadLedger: null,
              ...invariants,
            }),
          )
          continue
        }
        const executed = executeFixture(
          spec.cohortSize,
          threshold.value,
          continuationPolicyId,
        )
        rows.push(
          serializedFixtureRow(source, spec, continuationPolicyId, {
            fixtureExperimentId: ROSTER_WALL_MECHANICS_EXPERIMENT_ID,
            fixtureId,
            cohortSize: spec.cohortSize,
            cohortTalentIds: [...spec.talentIds],
            roleComposition: { ...roleComposition },
            expiryWeekExclusive: ROSTER_WALL_MECHANICS_EXPIRY_WEEK,
            threshold: structuredClone(threshold),
            ...executed,
          }),
        )
      }
    }
  }
  if (rows.length !== ROSTER_WALL_MECHANICS_FIXTURE_ROW_COUNT) {
    throw new Error('roster-wall mechanics fixture: generated matrix has the wrong row count')
  }
  return rows
}
