// Economy Intervention Frontier 03 — renewal timing counterfactual.
//
// ANALYSIS ONLY.  This is deliberately a small adapter around the public renewal
// action and the frozen roster-wall operating controller. The phase arm changes
// only the cloned founding cohort's term/end dates with exact zero-sum offsets;
// founding prices are deliberately held fixed, so this is a controlled synthetic
// duration distribution rather than a legal save. It does not change an engine
// quote, action gate, tick, save format, or production tuning value.

import { createHash } from 'node:crypto'
import {
  applyActions,
  contractOffer,
  exportSave,
  importSave,
  makeSaveV14,
  stableStringify,
  TUNING,
  weeklyOverhead,
  weeklyPayroll,
} from '../../core/index.js'
import type { Contract, CreativeRole, GameState, LedgerEntry } from '../../core/index.js'
import {
  ROSTER_WALL_OPERATING_POLICY_IDS,
  foundRosterWallStudio,
  runRosterWallOperatingWeek,
} from '../roster-wall/campaign.js'
import type { RosterWallOperatingPolicyId } from '../roster-wall/campaign.js'
import {
  ROSTER_WALL_CANONICAL_SEEDS,
  rosterWallCashReconciliation,
  rosterWallTheatricalReceiptReconciliation,
} from '../roster-wall/schema.js'
import { distribution, rate } from '../economy-truth-audit/statistics.js'
import type { Distribution, RateEstimate } from '../economy-truth-audit/statistics.js'

export const RENEWAL_FRONTIER_SCHEMA_VERSION =
  'economy-intervention-frontier-renewal-v3' as const
export const RENEWAL_FRONTIER_CHECKPOINT_WEEK = 144 as const
export const RENEWAL_FRONTIER_HORIZON_WEEK = 442 as const
export const RENEWAL_FRONTIER_CURRENT_WINDOW_WEEKS = 12 as const
export const RENEWAL_FRONTIER_EARLY_WINDOW_WEEKS = 26 as const
export const RENEWAL_FRONTIER_SEEDS = [...ROSTER_WALL_CANONICAL_SEEDS] as const
export const RENEWAL_FRONTIER_OPERATING_POLICIES = [
  ...ROSTER_WALL_OPERATING_POLICY_IDS,
] as const

export type RenewalFrontierPhase = 'synchronized' | 'phased-zero-sum'
export type RenewalFrontierEligibilityWeeks = 12 | 26
export type RenewalFrontierPaymentTiming = 'full-now' | 'split-prior-expiry'

export type RenewalFrontierTreatment = {
  id: string
  phase: RenewalFrontierPhase
  eligibilityWeeks: RenewalFrontierEligibilityWeeks
  paymentTiming: RenewalFrontierPaymentTiming
}

export const RENEWAL_FRONTIER_TREATMENTS = [
  {
    id: 'sync-w12-full-now',
    phase: 'synchronized',
    eligibilityWeeks: 12,
    paymentTiming: 'full-now',
  },
  {
    id: 'sync-w12-split-prior-expiry',
    phase: 'synchronized',
    eligibilityWeeks: 12,
    paymentTiming: 'split-prior-expiry',
  },
  {
    id: 'sync-w26-full-now',
    phase: 'synchronized',
    eligibilityWeeks: 26,
    paymentTiming: 'full-now',
  },
  {
    id: 'sync-w26-split-prior-expiry',
    phase: 'synchronized',
    eligibilityWeeks: 26,
    paymentTiming: 'split-prior-expiry',
  },
  {
    id: 'phase-w12-full-now',
    phase: 'phased-zero-sum',
    eligibilityWeeks: 12,
    paymentTiming: 'full-now',
  },
  {
    id: 'phase-w12-split-prior-expiry',
    phase: 'phased-zero-sum',
    eligibilityWeeks: 12,
    paymentTiming: 'split-prior-expiry',
  },
  {
    id: 'phase-w26-full-now',
    phase: 'phased-zero-sum',
    eligibilityWeeks: 26,
    paymentTiming: 'full-now',
  },
  {
    id: 'phase-w26-split-prior-expiry',
    phase: 'phased-zero-sum',
    eligibilityWeeks: 26,
    paymentTiming: 'split-prior-expiry',
  },
] as const satisfies readonly RenewalFrontierTreatment[]

export type RenewalFrontierCheckpoint = {
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  week: typeof RENEWAL_FRONTIER_CHECKPOINT_WEEK
  saveBytes: string
  saveHash: string
  stateHash: string
  rngState: string
  cash: number
  cohortContractKeys: string[]
}

export type RenewalFrontierPhaseJournal = {
  talentId: string
  priorContractKey: string
  contractKey: string
  startWeek: number
  priorTermWeeks: number
  priorEndWeekExclusive: number
  offsetWeeks: -18 | -6 | 0 | 6 | 18
  termWeeks: number
  endWeekExclusive: number
}

export type RenewalFrontierPaymentRecord = {
  contractKey: string
  talentId: string
  acceptedWeek: number
  priorExpiryWeek: number
  quotedBonus: number
  paidNow: number
  deferred: number
  forcedPaymentWeek: number | null
  forcedPaymentAmount: number
}

export type RenewalFrontierPaymentJournalEntry = {
  kind: 'split-credit-before-acceptance' | 'forced-remainder-at-prior-expiry'
  contractKey: string
  talentId: string
  week: number
  amount: number
  cashBefore: number
  cashAfter: number
  checkpointCashAfter: number | null
  checkpointLedgerLength: number | null
}

export type RenewalFrontierMilestone = {
  week: 196 | 208 | 428 | 442
  stateHash: string
  rngState: string
  cash: number
  activeContracts: number
}

export type RenewalFrontierInvariants = {
  immutableCheckpointExact: boolean
  phaseOffsetsZeroSum: boolean
  phasePreservesCashSalaryRosterAndRng: boolean
  phaseContractTermEndInvariantExact: boolean
  cashReconciliationExact: boolean
  renewalActionsRngNeutral: boolean
  adapterRngNeutral: boolean
  scheduledCostsMatchLedger: boolean
  scheduledReceiptsMatchLedger: boolean
  splitPaymentsExactlyQuote: boolean
  forcedPaymentsAtPriorExpiry: boolean
  horizonExact: boolean
}

export type RenewalFrontierMetrics = {
  finalCash: number
  minimumCash: number
  finalActiveContracts: number
  finalAnyRoleLoss: boolean
  cashAtWeek428: number
  activeContractsAtWeek428: number
  anyRoleLossAtWeek428: boolean
  zeroRosterAtWeek428: boolean
  releases: number
  filmActivityWeeks: number
  uniqueAcceptedOwners: number
  everRejectedOwners: number
  retryAttempts: number
  originalAcceptedOwners: number
  originalEverRejectedOwners: number
  originalLostOwners: number
  originalRetryAttempts: number
  cashPrecheckRejectionAttempts: number
  publicActionRejectionAttempts: number
  publicActionRenewalWindowRejections: number
  publicActionSolvencyRejections: number
  publicActionOtherRejections: number
  recurrenceAttempts: number
  recurrenceAcceptedOwners: number
  selfFundedRecurrenceAcceptedOwners: number
  fullNowAffordableRecurrenceAcceptedOwners: number
  roleLossEver: boolean
  acceptedOriginalOwnersByWeek208: number
  anyRoleLossAtWeek208: boolean
  zeroRosterAtWeek208: boolean
  treatmentCohortEndWeek: number
  anyRoleLossAtTreatmentCohortEnd: boolean
  zeroRosterAtTreatmentCohortEnd: boolean
  zeroAcceptedOriginalRenewalsAtTreatmentCohortEnd: boolean
  zeroRosterEver: boolean
  packageStaffabilityBlockers: number
  packageAffordabilityBlockers: number
}

export type RenewalFrontierArm = {
  schemaVersion: typeof RENEWAL_FRONTIER_SCHEMA_VERSION
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  treatment: RenewalFrontierTreatment
  checkpoint: Pick<RenewalFrontierCheckpoint, 'week' | 'saveHash' | 'stateHash' | 'rngState' | 'cash'>
  phaseJournal: RenewalFrontierPhaseJournal[]
  payments: RenewalFrontierPaymentRecord[]
  paymentJournal: RenewalFrontierPaymentJournalEntry[]
  milestones: RenewalFrontierMilestone[]
  metrics: RenewalFrontierMetrics
  invariants: RenewalFrontierInvariants
  invariantFailures: number
}

export type RenewalFrontierCell = {
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  checkpoint: RenewalFrontierCheckpoint
  arms: RenewalFrontierArm[]
}

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function stateHash(state: GameState): string {
  return hash(stableStringify(state))
}

function contractKey(contract: Contract): string {
  return `${contract.talentId}:${String(contract.startWeek)}:${String(contract.endWeekExclusive)}`
}

function activeContracts(state: GameState): Contract[] {
  return state.contracts.filter(
    (contract) =>
      contract.startWeek <= state.market.tick && state.market.tick < contract.endWeekExclusive,
  )
}

function roleCoverage(state: GameState): Record<CreativeRole, number> {
  const active = new Set(activeContracts(state).map((contract) => contract.talentId))
  const coverage: Record<CreativeRole, number> = {
    actor: 0,
    director: 0,
    writer: 0,
    craft: 0,
  }
  for (const talent of state.talent) if (active.has(talent.id)) coverage[talent.role]++
  return coverage
}

function hasRoleLoss(state: GameState): boolean {
  const coverage = roleCoverage(state)
  // The founding minimums are intentionally written out here so this harness has
  // no hidden dependency on a future UI requirement.  They are the existing law.
  return coverage.actor < 1 || coverage.director < 1 || coverage.writer < 1 || coverage.craft < 1
}

function packageBlockers(intents: readonly { intentKind: string; accepted: boolean; action: unknown; reason: string | null }[]): {
  staffability: number
  affordability: number
} {
  const failed = intents.filter(
    (intent) => intent.intentKind === 'production-greenlight' && !intent.accepted,
  )
  return {
    staffability: failed.filter((intent) => intent.action === null).length,
    affordability: failed.filter(
      (intent) => intent.action !== null && /cash|afford|solvency/i.test(intent.reason ?? ''),
    ).length,
  }
}

function transitionCost(rows: readonly LedgerEntry[], kind: LedgerEntry['kind']): number {
  return -rows.filter((row) => row.kind === kind).reduce((sum, row) => sum + row.amount, 0)
}

/** Build and serialize an immutable Week-144 all-208 checkpoint from public harness seams. */
export function buildRenewalFrontierCheckpoint(
  seed: string,
  operatingPolicyId: RosterWallOperatingPolicyId,
): RenewalFrontierCheckpoint {
  let state = foundRosterWallStudio(seed, operatingPolicyId, 'all-208')
  while (state.market.tick < RENEWAL_FRONTIER_CHECKPOINT_WEEK) {
    state = runRosterWallOperatingWeek({
      state,
      operatingPolicyId,
      captureIntents: false,
    }).stateAfterTick
  }
  if (state.market.tick !== RENEWAL_FRONTIER_CHECKPOINT_WEEK) {
    throw new Error('renewal frontier: checkpoint did not arrive at Week 144')
  }
  rosterWallCashReconciliation(state)
  const saveBytes = exportSave(makeSaveV14(state))
  const imported = importSave(saveBytes)
  if (imported.saveVersion !== 14 || exportSave(imported) !== saveBytes) {
    throw new Error('renewal frontier: checkpoint SaveFileV14 replay failed')
  }
  return {
    seed,
    operatingPolicyId,
    week: RENEWAL_FRONTIER_CHECKPOINT_WEEK,
    saveBytes,
    saveHash: hash(saveBytes),
    stateHash: stateHash(state),
    rngState: state.rngState,
    cash: state.studio.cash,
    cohortContractKeys: state.contracts.map(contractKey).sort(compareId),
  }
}

function loadCheckpoint(checkpoint: RenewalFrontierCheckpoint): GameState {
  const imported = importSave(checkpoint.saveBytes)
  if (
    imported.saveVersion !== 14 ||
    exportSave(imported) !== checkpoint.saveBytes ||
    hash(checkpoint.saveBytes) !== checkpoint.saveHash ||
    stateHash(imported.state) !== checkpoint.stateHash ||
    imported.state.rngState !== checkpoint.rngState ||
    imported.state.market.tick !== checkpoint.week
  ) {
    throw new Error('renewal frontier: immutable Week-144 checkpoint changed')
  }
  rosterWallCashReconciliation(imported.state)
  return structuredClone(imported.state)
}

/** Deterministic symmetric pairs give any cohort an exact zero-sum phase plan. */
export function phaseOffsets(contracts: readonly Contract[]): Map<string, -18 | -6 | 0 | 6 | 18> {
  const ordered = [...contracts].sort((a, b) => compareId(a.talentId, b.talentId))
  const result = new Map<string, -18 | -6 | 0 | 6 | 18>()
  const pairs: ReadonlyArray<readonly [-18 | -6, 6 | 18]> = [
    [-18, 18],
    [-6, 6],
  ]
  let pairIndex = 0
  for (let index = 0; index < ordered.length; index += 2) {
    const first = ordered[index]!
    const second = ordered[index + 1]
    if (second === undefined) {
      result.set(contractKey(first), 0)
      continue
    }
    const pair = pairs[pairIndex % pairs.length]!
    result.set(contractKey(first), pair[0])
    result.set(contractKey(second), pair[1])
    pairIndex++
  }
  return result
}

function applyPhase(
  state: GameState,
  phase: RenewalFrontierPhase,
): { state: GameState; journal: RenewalFrontierPhaseJournal[]; exact: boolean } {
  const beforeCash = state.studio.cash
  const beforeRng = state.rngState
  const beforeRoster = state.contracts.map((contract) => ({
    talentId: contract.talentId,
    annualSalary: contract.annualSalary,
    signingBonus: contract.signingBonus,
    startWeek: contract.startWeek,
  }))
  const offsets = phase === 'synchronized' ? new Map<string, -18 | -6 | 0 | 6 | 18>() : phaseOffsets(state.contracts)
  const journal: RenewalFrontierPhaseJournal[] = []
  let beforeEndSum = 0
  let afterEndSum = 0
  const contracts = state.contracts.map((contract) => {
    const offset = offsets.get(contractKey(contract)) ?? 0
    beforeEndSum += contract.endWeekExclusive
    const termWeeks = contract.termWeeks + offset
    const endWeekExclusive = contract.endWeekExclusive + offset
    afterEndSum += endWeekExclusive
    const phasedContract =
      offset === 0 ? contract : { ...contract, termWeeks, endWeekExclusive }
    journal.push({
      talentId: contract.talentId,
      priorContractKey: contractKey(contract),
      contractKey: contractKey(phasedContract),
      startWeek: contract.startWeek,
      priorTermWeeks: contract.termWeeks,
      priorEndWeekExclusive: contract.endWeekExclusive,
      offsetWeeks: offset,
      termWeeks,
      endWeekExclusive,
    })
    return phasedContract
  })
  const phased = { ...state, contracts }
  const afterRoster = phased.contracts.map((contract) => ({
    talentId: contract.talentId,
    annualSalary: contract.annualSalary,
    signingBonus: contract.signingBonus,
    startWeek: contract.startWeek,
  }))
  const contractTermEndInvariantExact = phased.contracts.every(
    (contract) =>
      contract.termWeeks > 0 &&
      contract.endWeekExclusive === contract.startWeek + contract.termWeeks,
  )
  const exact =
    beforeEndSum === afterEndSum &&
    phased.studio.cash === beforeCash &&
    phased.rngState === beforeRng &&
    stableStringify(beforeRoster) === stableStringify(afterRoster) &&
    contractTermEndInvariantExact
  if (!exact) throw new Error('renewal frontier: phase treatment changed more than expiry timing')
  return { state: phased, journal: journal.sort((a, b) => compareId(a.talentId, b.talentId)), exact }
}

type PendingPayment = {
  paymentIndex: number
  contractKey: string
  talentId: string
  dueWeek: number
  amount: number
}

/**
 * The adapter never fabricates a production ledger kind.  It establishes (or
 * moves) the analysis checkpoint after the public action, so normal engine rows
 * still reconcile exactly while the journal makes every non-production cash move
 * reviewable.
 */
function applyAdapterCash(
  state: GameState,
  amount: number,
): { state: GameState; checkpointCash: number | null; checkpointLedgerLength: number | null } {
  const checkpoint = state.cashLedgerCheckpoint
  const nextCash = state.studio.cash + amount
  const nativeFullHistoryCash = state.ledger.reduce<number>(
    (cash, entry) => cash + entry.amount,
    TUNING.INITIAL_CASH,
  )
  // Once all deferred credits/debits net back to ordinary full-ledger cash, the
  // migration-only checkpoint must disappear.  Core rightly rejects a checkpoint
  // that no longer marks a real historical discontinuity.
  if (nextCash === nativeFullHistoryCash) {
    const next: GameState = {
      ...state,
      studio: { ...state.studio, cash: nextCash },
    }
    delete next.cashLedgerCheckpoint
    rosterWallCashReconciliation(next)
    return { state: next, checkpointCash: null, checkpointLedgerLength: null }
  }
  const nextCheckpoint =
    checkpoint === undefined
      ? { cash: nextCash, ledgerLength: state.ledger.length }
      : { cash: checkpoint.cash + amount, ledgerLength: checkpoint.ledgerLength }
  const next = {
    ...state,
    studio: { ...state.studio, cash: nextCash },
    cashLedgerCheckpoint: nextCheckpoint,
  }
  rosterWallCashReconciliation(next)
  return {
    state: next,
    checkpointCash: nextCheckpoint.cash,
    checkpointLedgerLength: nextCheckpoint.ledgerLength,
  }
}

function renewalCandidates(
  state: GameState,
  eligibilityWeeks: RenewalFrontierEligibilityWeeks,
): Contract[] {
  return activeContracts(state)
    .filter((contract) => {
      const remaining = contract.endWeekExclusive - state.market.tick
      return remaining > 0 && remaining <= eligibilityWeeks
    })
    .sort(
      (a, b) =>
        a.endWeekExclusive - b.endWeekExclusive || compareId(a.talentId, b.talentId),
    )
}

function captureMilestone(state: GameState): RenewalFrontierMilestone | null {
  if (state.market.tick !== 196 && state.market.tick !== 208 && state.market.tick !== 428 && state.market.tick !== 442) {
    return null
  }
  return {
    week: state.market.tick,
    stateHash: stateHash(state),
    rngState: state.rngState,
    cash: state.studio.cash,
    activeContracts: activeContracts(state).length,
  }
}

/** Execute one compact W144→W442 treatment from a freshly-imported checkpoint. */
export function runRenewalFrontierArm(
  checkpoint: RenewalFrontierCheckpoint,
  treatment: RenewalFrontierTreatment,
): RenewalFrontierArm {
  let state = loadCheckpoint(checkpoint)
  const immutableCheckpointExact =
    stateHash(state) === checkpoint.stateHash && state.rngState === checkpoint.rngState
  const phased = applyPhase(state, treatment.phase)
  state = phased.state
  const originalKeys = new Set(phased.journal.map((entry) => entry.contractKey))
  const treatmentCohortEndWeek = Math.max(
    ...phased.journal.map((entry) => entry.endWeekExclusive),
  )
  const originalAccepted = new Set<string>()
  const originalRejected = new Set<string>()
  const accepted = new Set<string>()
  const rejected = new Set<string>()
  const attempts = new Map<string, number>()
  const recurrenceAttempts = new Set<string>()
  const recurrenceAccepted = new Set<string>()
  const selfFundedRecurrenceAccepted = new Set<string>()
  const fullNowAffordableRecurrenceAccepted = new Set<string>()
  const payments: RenewalFrontierPaymentRecord[] = []
  const paymentJournal: RenewalFrontierPaymentJournalEntry[] = []
  const pending: PendingPayment[] = []
  const milestones: RenewalFrontierMilestone[] = []
  let minimumCash = state.studio.cash
  let releases = 0
  let filmActivityWeeks = 0
  let retryAttempts = 0
  let originalRetryAttempts = 0
  let cashPrecheckRejectionAttempts = 0
  let publicActionRejectionAttempts = 0
  let publicActionRenewalWindowRejections = 0
  let publicActionSolvencyRejections = 0
  let publicActionOtherRejections = 0
  let roleLossEver = hasRoleLoss(state)
  let acceptedOriginalOwnersByWeek208 = 0
  let anyRoleLossAtWeek208 = false
  let zeroRosterAtWeek208 = false
  let week208Observed = false
  let anyRoleLossAtTreatmentCohortEnd = false
  let zeroRosterAtTreatmentCohortEnd = false
  let zeroAcceptedOriginalRenewalsAtTreatmentCohortEnd = false
  let treatmentCohortEndObserved = false
  let cashAtWeek428 = state.studio.cash
  let activeContractsAtWeek428 = activeContracts(state).length
  let anyRoleLossAtWeek428 = hasRoleLoss(state)
  let zeroRosterAtWeek428 = activeContractsAtWeek428 === 0
  let week428Observed = false
  let zeroRosterEver = activeContracts(state).length === 0
  let packageStaffabilityBlockers = 0
  let packageAffordabilityBlockers = 0
  let cashReconciliationExact = true
  let renewalActionsRngNeutral = true
  let adapterRngNeutral = true
  let scheduledCostsMatchLedger = true
  let scheduledReceiptsMatchLedger = true

  const applyDuePayments = (): void => {
    const due = pending
      .filter((payment) => payment.dueWeek === state.market.tick)
      .sort((a, b) => compareId(a.contractKey, b.contractKey))
    for (const payment of due) {
      const rngBefore = state.rngState
      const cashBefore = state.studio.cash
      const adapted = applyAdapterCash(state, -payment.amount)
      state = adapted.state
      adapterRngNeutral &&= state.rngState === rngBefore
      const record = payments[payment.paymentIndex]!
      record.forcedPaymentWeek = state.market.tick
      record.forcedPaymentAmount = payment.amount
      paymentJournal.push({
        kind: 'forced-remainder-at-prior-expiry',
        contractKey: payment.contractKey,
        talentId: payment.talentId,
        week: state.market.tick,
        amount: -payment.amount,
        cashBefore,
        cashAfter: state.studio.cash,
        checkpointCashAfter: adapted.checkpointCash,
        checkpointLedgerLength: adapted.checkpointLedgerLength,
      })
    }
  }

  while (state.market.tick < RENEWAL_FRONTIER_HORIZON_WEEK) {
    applyDuePayments()
    rosterWallCashReconciliation(state)
    cashReconciliationExact &&= true
    const ledgerStart = state.ledger.length
    for (const candidate of renewalCandidates(state, treatment.eligibilityWeeks)) {
      const key = contractKey(candidate)
      const priorExpiryWeek = candidate.endWeekExclusive
      const remaining = priorExpiryWeek - state.market.tick
      const rngBefore = state.rngState
      const cashBefore = state.studio.cash
      const quote = contractOffer(state, candidate.talentId, 208)
      const paidNow =
        treatment.paymentTiming === 'full-now'
          ? quote.signingBonus
          : Math.floor(quote.signingBonus / 2)
      const deferred = quote.signingBonus - paidNow
      // The split arm changes liquidity timing rather than total obligation. A
      // temporary, journalled analysis credit lets the unchanged public action
      // see the deferred half; the exact credit is forced out at the old expiry.
      // If even the immediate half is unaffordable, nothing is credited or changed.
      if (state.studio.cash < paidNow) {
        cashPrecheckRejectionAttempts++
        attempts.set(key, (attempts.get(key) ?? 0) + 1)
        if (!originalKeys.has(key)) recurrenceAttempts.add(key)
        rejected.add(key)
        if (originalKeys.has(key)) originalRejected.add(key)
        retryAttempts++
        if (originalKeys.has(key)) originalRetryAttempts++
        continue
      }
      const splitCredit =
        treatment.paymentTiming === 'split-prior-expiry'
          ? applyAdapterCash(state, deferred)
          : null
      const renewalBase = splitCredit?.state ?? state
      const early = remaining > RENEWAL_FRONTIER_CURRENT_WINDOW_WEEKS
      const actionState = early
        ? {
            ...renewalBase,
            contracts: renewalBase.contracts.map((contract) =>
              contract === candidate
                ? {
                    ...contract,
                    termWeeks:
                      state.market.tick +
                      RENEWAL_FRONTIER_CURRENT_WINDOW_WEEKS -
                      contract.startWeek,
                    endWeekExclusive:
                      state.market.tick + RENEWAL_FRONTIER_CURRENT_WINDOW_WEEKS,
                  }
                : contract,
            ),
          }
        : renewalBase
      let next = state
      let acceptedNow = false
      try {
        // This remains the public engine action in both the current and early
        // windows.  The early case changes only the disposable cloned old expiry
        // long enough to prove the action's ordinary legal gate.
        next = applyActions(actionState, [
          { kind: 'renewContract', talentId: candidate.talentId, termWeeks: 208 },
        ])
        acceptedNow = true
      } catch (error) {
        publicActionRejectionAttempts++
        const message = error instanceof Error ? error.message : String(error)
        if (message.includes('renewal window')) publicActionRenewalWindowRejections++
        else if (message.includes('solvency gate')) publicActionSolvencyRejections++
        else publicActionOtherRejections++
        // A rejection must retain the real old expiry, rather than the temporary
        // adapter expiry used solely to enter the public action.
        next = state
      }
      renewalActionsRngNeutral &&= next.rngState === rngBefore
      attempts.set(key, (attempts.get(key) ?? 0) + 1)
      if (!originalKeys.has(key)) recurrenceAttempts.add(key)
      if (!acceptedNow) {
        rejected.add(key)
        if (originalKeys.has(key)) originalRejected.add(key)
        retryAttempts++
        if (originalKeys.has(key)) originalRetryAttempts++
        continue
      }
      state = next
      accepted.add(key)
      if (originalKeys.has(key)) originalAccepted.add(key)
      else {
        recurrenceAccepted.add(key)
        // No arm receives an outside grant: acceptance under its own equal-total
        // payment schedule is self-funded. Keep the stricter full-now comparator
        // separately so deferral cannot masquerade as restored ordinary liquidity.
        selfFundedRecurrenceAccepted.add(key)
        if (cashBefore >= quote.signingBonus) {
          fullNowAffordableRecurrenceAccepted.add(key)
        }
      }
      const payment: RenewalFrontierPaymentRecord = {
        contractKey: key,
        talentId: candidate.talentId,
        acceptedWeek: state.market.tick,
        priorExpiryWeek,
        quotedBonus: quote.signingBonus,
        paidNow,
        deferred,
        forcedPaymentWeek: null,
        forcedPaymentAmount: 0,
      }
      payments.push(payment)
      if (treatment.paymentTiming === 'split-prior-expiry') {
        if (splitCredit === null) {
          throw new Error('renewal frontier: accepted split renewal lacks its timing credit')
        }
        adapterRngNeutral &&= state.rngState === rngBefore
        paymentJournal.push({
          kind: 'split-credit-before-acceptance',
          contractKey: key,
          talentId: candidate.talentId,
          week: state.market.tick,
          amount: deferred,
          cashBefore,
          cashAfter: splitCredit.state.studio.cash,
          checkpointCashAfter: splitCredit.checkpointCash,
          checkpointLedgerLength: splitCredit.checkpointLedgerLength,
        })
        pending.push({
          paymentIndex: payments.length - 1,
          contractKey: key,
          talentId: candidate.talentId,
          dueWeek: priorExpiryWeek,
          amount: deferred,
        })
      }
    }
    const operating = runRosterWallOperatingWeek({
      state,
      operatingPolicyId: checkpoint.operatingPolicyId,
      // Intents are counted into compact staffability/affordability diagnostics
      // and never persisted as raw weekly traces in the aggregate.
      captureIntents: true,
    })
    const transition = operating.stateAfterTick.ledger.slice(ledgerStart)
    const scheduledPayroll = weeklyPayroll(operating.stateAfterActions)
    const scheduledOverhead = weeklyOverhead(operating.stateAfterActions)
    scheduledCostsMatchLedger &&=
      scheduledPayroll === transitionCost(transition, 'payroll') &&
      scheduledOverhead === transitionCost(transition, 'overhead')
    const receipts = rosterWallTheatricalReceiptReconciliation(
      operating.stateAfterActions,
      operating.stateAfterTick,
      transition,
    )
    scheduledReceiptsMatchLedger &&= receipts.delta === 0
    const blockers = packageBlockers(operating.intents)
    packageStaffabilityBlockers += blockers.staffability
    packageAffordabilityBlockers += blockers.affordability
    releases += operating.stateAfterTick.theatricalRuns.filter(
      (run) => run.releaseTick === operating.startWeek,
    ).length
    if (operating.stateAfterActions.studio.activeProductions.length > 0) filmActivityWeeks++
    state = operating.stateAfterTick
    rosterWallCashReconciliation(state)
    minimumCash = Math.min(minimumCash, state.studio.cash)
    roleLossEver ||= hasRoleLoss(state)
    zeroRosterEver ||= activeContracts(state).length === 0
    const milestone = captureMilestone(state)
    if (milestone !== null) milestones.push(milestone)
    if (!week208Observed && state.market.tick >= 208) {
      week208Observed = true
      acceptedOriginalOwnersByWeek208 = originalAccepted.size
      anyRoleLossAtWeek208 = hasRoleLoss(state)
      zeroRosterAtWeek208 = activeContracts(state).length === 0
    }
    if (!week428Observed && state.market.tick >= 428) {
      week428Observed = true
      cashAtWeek428 = state.studio.cash
      activeContractsAtWeek428 = activeContracts(state).length
      anyRoleLossAtWeek428 = hasRoleLoss(state)
      zeroRosterAtWeek428 = activeContractsAtWeek428 === 0
    }
    if (!treatmentCohortEndObserved && state.market.tick >= treatmentCohortEndWeek) {
      treatmentCohortEndObserved = true
      anyRoleLossAtTreatmentCohortEnd = hasRoleLoss(state)
      zeroRosterAtTreatmentCohortEnd = activeContracts(state).length === 0
      zeroAcceptedOriginalRenewalsAtTreatmentCohortEnd = originalAccepted.size === 0
    }
  }
  if (state.market.tick !== RENEWAL_FRONTIER_HORIZON_WEEK) {
    throw new Error('renewal frontier: final horizon did not arrive at Week 442')
  }
  const splitPaymentsExactlyQuote = payments.every(
    (payment) => payment.paidNow + payment.deferred === payment.quotedBonus,
  )
  const forcedPaymentsAtPriorExpiry = payments
    .filter((payment) => payment.deferred > 0 && payment.priorExpiryWeek <= RENEWAL_FRONTIER_HORIZON_WEEK)
    .every(
      (payment) =>
        payment.forcedPaymentWeek === payment.priorExpiryWeek &&
        payment.forcedPaymentAmount === payment.deferred,
    )
  const invariants: RenewalFrontierInvariants = {
    immutableCheckpointExact,
    phaseOffsetsZeroSum:
      phased.journal.reduce((sum, entry) => sum + entry.offsetWeeks, 0) === 0,
    phasePreservesCashSalaryRosterAndRng: phased.exact,
    phaseContractTermEndInvariantExact: phased.journal.every(
      (entry) => entry.endWeekExclusive === entry.startWeek + entry.termWeeks,
    ),
    cashReconciliationExact,
    renewalActionsRngNeutral,
    adapterRngNeutral,
    scheduledCostsMatchLedger,
    scheduledReceiptsMatchLedger,
    splitPaymentsExactlyQuote,
    forcedPaymentsAtPriorExpiry,
    horizonExact: state.market.tick === RENEWAL_FRONTIER_HORIZON_WEEK,
  }
  const invariantFailures = Object.values(invariants).filter((value) => !value).length
  return {
    schemaVersion: RENEWAL_FRONTIER_SCHEMA_VERSION,
    seed: checkpoint.seed,
    operatingPolicyId: checkpoint.operatingPolicyId,
    treatment: { ...treatment },
    checkpoint: {
      week: checkpoint.week,
      saveHash: checkpoint.saveHash,
      stateHash: checkpoint.stateHash,
      rngState: checkpoint.rngState,
      cash: checkpoint.cash,
    },
    phaseJournal: phased.journal,
    payments,
    paymentJournal,
    milestones,
    metrics: {
      finalCash: state.studio.cash,
      minimumCash,
      finalActiveContracts: activeContracts(state).length,
      finalAnyRoleLoss: hasRoleLoss(state),
      cashAtWeek428,
      activeContractsAtWeek428,
      anyRoleLossAtWeek428,
      zeroRosterAtWeek428,
      releases,
      filmActivityWeeks,
      uniqueAcceptedOwners: accepted.size,
      everRejectedOwners: rejected.size,
      retryAttempts,
      originalAcceptedOwners: originalAccepted.size,
      originalEverRejectedOwners: originalRejected.size,
      originalLostOwners: originalKeys.size - originalAccepted.size,
      originalRetryAttempts,
      cashPrecheckRejectionAttempts,
      publicActionRejectionAttempts,
      publicActionRenewalWindowRejections,
      publicActionSolvencyRejections,
      publicActionOtherRejections,
      recurrenceAttempts: recurrenceAttempts.size,
      recurrenceAcceptedOwners: recurrenceAccepted.size,
      selfFundedRecurrenceAcceptedOwners: selfFundedRecurrenceAccepted.size,
      fullNowAffordableRecurrenceAcceptedOwners:
        fullNowAffordableRecurrenceAccepted.size,
      roleLossEver,
      acceptedOriginalOwnersByWeek208,
      anyRoleLossAtWeek208,
      zeroRosterAtWeek208,
      treatmentCohortEndWeek,
      anyRoleLossAtTreatmentCohortEnd,
      zeroRosterAtTreatmentCohortEnd,
      zeroAcceptedOriginalRenewalsAtTreatmentCohortEnd,
      zeroRosterEver,
      packageStaffabilityBlockers,
      packageAffordabilityBlockers,
    },
    invariants,
    invariantFailures,
  }
}

export function runRenewalFrontierCell(
  seed: string,
  operatingPolicyId: RosterWallOperatingPolicyId,
): RenewalFrontierCell {
  const checkpoint = buildRenewalFrontierCheckpoint(seed, operatingPolicyId)
  return {
    seed,
    operatingPolicyId,
    checkpoint,
    arms: RENEWAL_FRONTIER_TREATMENTS.map((treatment) =>
      runRenewalFrontierArm(checkpoint, treatment),
    ),
  }
}

export function runRenewalFrontierCorpus(
  seeds: readonly string[] = RENEWAL_FRONTIER_SEEDS,
  operatingPolicies: readonly RosterWallOperatingPolicyId[] = RENEWAL_FRONTIER_OPERATING_POLICIES,
): RenewalFrontierCell[] {
  return seeds.flatMap((seed) =>
    operatingPolicies.map((operatingPolicyId) => runRenewalFrontierCell(seed, operatingPolicyId)),
  )
}

export type RenewalFrontierArmAggregate = {
  treatment: RenewalFrontierTreatment
  runs: number
  finalCash: Distribution
  minimumCash: Distribution
  finalActiveContracts: Distribution
  cashAtWeek428: Distribution
  activeContractsAtWeek428: Distribution
  releases: Distribution
  filmActivityWeeks: Distribution
  acceptedOwners: Distribution
  everRejectedOwners: Distribution
  originalLostOwners: Distribution
  retryAttempts: Distribution
  cashPrecheckRejectionAttempts: Distribution
  publicActionRejectionAttempts: Distribution
  recurrenceAcceptedOwners: Distribution
  selfFundedRecurrenceAcceptedOwners: Distribution
  fullNowAffordableRecurrenceAcceptedOwners: Distribution
  staffabilityBlockers: Distribution
  affordabilityBlockers: Distribution
  roleLossEver: RateEstimate
  finalAnyRoleLoss: RateEstimate
  anyRoleLossAtWeek428: RateEstimate
  zeroRosterAtWeek428: RateEstimate
  negativeCashAtEnd: RateEstimate
  nonnegativeCashAtEndAmongEverNegative: RateEstimate
  anyRoleLossAtWeek208: RateEstimate
  zeroRosterAtWeek208: RateEstimate
  anyRoleLossAtTreatmentCohortEnd: RateEstimate
  zeroRosterAtTreatmentCohortEnd: RateEstimate
  zeroAcceptedOriginalRenewalsAtTreatmentCohortEnd: RateEstimate
  zeroRosterEver: RateEstimate
  invariantFailures: number
}

function summarizeArms(arms: readonly RenewalFrontierArm[]): RenewalFrontierArmAggregate {
  const first = arms[0]
  if (first === undefined) throw new Error('renewal frontier: cannot aggregate an empty treatment')
  const count = (predicate: (arm: RenewalFrontierArm) => boolean): RateEstimate =>
    rate(arms.filter(predicate).length, arms.length)
  return {
    treatment: { ...first.treatment },
    runs: arms.length,
    finalCash: distribution(arms.map((arm) => arm.metrics.finalCash)),
    minimumCash: distribution(arms.map((arm) => arm.metrics.minimumCash)),
    finalActiveContracts: distribution(
      arms.map((arm) => arm.metrics.finalActiveContracts),
    ),
    cashAtWeek428: distribution(arms.map((arm) => arm.metrics.cashAtWeek428)),
    activeContractsAtWeek428: distribution(
      arms.map((arm) => arm.metrics.activeContractsAtWeek428),
    ),
    releases: distribution(arms.map((arm) => arm.metrics.releases)),
    filmActivityWeeks: distribution(arms.map((arm) => arm.metrics.filmActivityWeeks)),
    acceptedOwners: distribution(arms.map((arm) => arm.metrics.uniqueAcceptedOwners)),
    everRejectedOwners: distribution(arms.map((arm) => arm.metrics.everRejectedOwners)),
    originalLostOwners: distribution(arms.map((arm) => arm.metrics.originalLostOwners)),
    retryAttempts: distribution(arms.map((arm) => arm.metrics.retryAttempts)),
    cashPrecheckRejectionAttempts: distribution(
      arms.map((arm) => arm.metrics.cashPrecheckRejectionAttempts),
    ),
    publicActionRejectionAttempts: distribution(
      arms.map((arm) => arm.metrics.publicActionRejectionAttempts),
    ),
    recurrenceAcceptedOwners: distribution(
      arms.map((arm) => arm.metrics.recurrenceAcceptedOwners),
    ),
    selfFundedRecurrenceAcceptedOwners: distribution(
      arms.map((arm) => arm.metrics.selfFundedRecurrenceAcceptedOwners),
    ),
    fullNowAffordableRecurrenceAcceptedOwners: distribution(
      arms.map((arm) => arm.metrics.fullNowAffordableRecurrenceAcceptedOwners),
    ),
    staffabilityBlockers: distribution(
      arms.map((arm) => arm.metrics.packageStaffabilityBlockers),
    ),
    affordabilityBlockers: distribution(
      arms.map((arm) => arm.metrics.packageAffordabilityBlockers),
    ),
    roleLossEver: count((arm) => arm.metrics.roleLossEver),
    finalAnyRoleLoss: count((arm) => arm.metrics.finalAnyRoleLoss),
    anyRoleLossAtWeek428: count((arm) => arm.metrics.anyRoleLossAtWeek428),
    zeroRosterAtWeek428: count((arm) => arm.metrics.zeroRosterAtWeek428),
    negativeCashAtEnd: count((arm) => arm.metrics.finalCash < 0),
    nonnegativeCashAtEndAmongEverNegative: rate(
      arms.filter((arm) => arm.metrics.minimumCash < 0 && arm.metrics.finalCash >= 0).length,
      arms.filter((arm) => arm.metrics.minimumCash < 0).length,
    ),
    anyRoleLossAtWeek208: count((arm) => arm.metrics.anyRoleLossAtWeek208),
    zeroRosterAtWeek208: count((arm) => arm.metrics.zeroRosterAtWeek208),
    anyRoleLossAtTreatmentCohortEnd: count(
      (arm) => arm.metrics.anyRoleLossAtTreatmentCohortEnd,
    ),
    zeroRosterAtTreatmentCohortEnd: count(
      (arm) => arm.metrics.zeroRosterAtTreatmentCohortEnd,
    ),
    zeroAcceptedOriginalRenewalsAtTreatmentCohortEnd: count(
      (arm) => arm.metrics.zeroAcceptedOriginalRenewalsAtTreatmentCohortEnd,
    ),
    zeroRosterEver: count((arm) => arm.metrics.zeroRosterEver),
    invariantFailures: arms.reduce((sum, arm) => sum + arm.invariantFailures, 0),
  }
}

export type RenewalFrontierAggregate = {
  schemaVersion: typeof RENEWAL_FRONTIER_SCHEMA_VERSION
  experiment: {
    checkpointWeek: typeof RENEWAL_FRONTIER_CHECKPOINT_WEEK
    horizonWeek: typeof RENEWAL_FRONTIER_HORIZON_WEEK
    seeds: number
    operatingPolicies: number
    cells: number
    treatmentCells: number
  }
  arms: RenewalFrontierArmAggregate[]
  byOperatingPolicy: Array<{
    operatingPolicyId: RosterWallOperatingPolicyId
    arms: RenewalFrontierArmAggregate[]
  }>
}

/** Compact aggregate only; raw per-week state never leaves the analysis runner. */
export function aggregateRenewalFrontier(cells: readonly RenewalFrontierCell[]): RenewalFrontierAggregate {
  const allArms = cells.flatMap((cell) => cell.arms)
  const treatmentArms = RENEWAL_FRONTIER_TREATMENTS.map((treatment) =>
    summarizeArms(allArms.filter((arm) => arm.treatment.id === treatment.id)),
  )
  const policies = [...new Set(cells.map((cell) => cell.operatingPolicyId))].sort(compareId) as RosterWallOperatingPolicyId[]
  return {
    schemaVersion: RENEWAL_FRONTIER_SCHEMA_VERSION,
    experiment: {
      checkpointWeek: RENEWAL_FRONTIER_CHECKPOINT_WEEK,
      horizonWeek: RENEWAL_FRONTIER_HORIZON_WEEK,
      seeds: new Set(cells.map((cell) => cell.seed)).size,
      operatingPolicies: policies.length,
      cells: cells.length,
      treatmentCells: allArms.length,
    },
    arms: treatmentArms,
    byOperatingPolicy: policies.map((operatingPolicyId) => ({
      operatingPolicyId,
      arms: RENEWAL_FRONTIER_TREATMENTS.map((treatment) =>
        summarizeArms(
          allArms.filter(
            (arm) =>
              arm.operatingPolicyId === operatingPolicyId && arm.treatment.id === treatment.id,
          ),
        ),
      ),
    })),
  }
}
