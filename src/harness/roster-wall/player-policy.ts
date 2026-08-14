// Week-208 roster-wall mixed-founding-term player-policy corpus.
//
// ANALYSIS ONLY. This descriptive arm exercises only legal public founding and
// renewal choices. It is deliberately not paired with the maximum-term corpus:
// 196 weeks of operating and renewal feedback precede its immutable entry save.

import { createHash } from 'node:crypto'
import {
  FOUNDING_MINIMUMS,
  TUNING,
  contractOffer,
  expectedWeeklyRunRevenue,
  exportSave,
  importSave,
  makeSaveV11,
  renewalWindowOpen,
  stableStringify,
  weeklyOverhead,
  weeklyPayroll,
  weeklySalary,
} from '../../core/index.js'
import type {
  CashLedgerCheckpoint,
  ContractOffer,
  CreativeRole,
  GameState,
  LedgerEntry,
  SaveFileV11,
} from '../../core/index.js'
import {
  ROSTER_WALL_ENTRY_WEEK,
  ROSTER_WALL_OPERATING_POLICY_IDS,
  foundRosterWallStudio,
  rosterWallPackageReadiness,
  runRosterWallOperatingWeek,
} from './campaign.js'
import type {
  RosterWallOperatingPolicyId,
  RosterWallPolicyIntentProjection,
} from './campaign.js'
import {
  applyRenewalPolicy,
  createRenewalPolicyMemory,
  renewalContractKey,
} from './renewal.js'
import {
  ROSTER_WALL_CANONICAL_SEEDS,
  rosterWallEntryId,
  rosterWallSerializedEvidenceRecord,
  rosterWallTheatricalReceiptReconciliation,
} from './schema.js'
import type {
  RosterWallCommonEnvelope,
  RosterWallSerializedEvidenceRecord,
  RosterWallTheatricalReceiptReconciliation,
} from './schema.js'
import type { RosterWallSourceProvenance } from './provenance.js'
import type {
  RenewalIntentObservation,
  RenewalPolicyMemory,
} from './renewal.js'

export const ROSTER_WALL_PLAYER_POLICY_HORIZON_WEEK = 428 as const
export const ROSTER_WALL_PLAYER_POLICY_LABEL =
  'descriptive-after-policy-feedback' as const

const ROLES = ['actor', 'director', 'writer', 'craft'] as const

export type PlayerPolicyCashReconciliation = {
  checkpoint: CashLedgerCheckpoint | null
  ledgerStart: number
  openingCash: number
  reconciledLedgerAmount: number
  expectedCash: number
  actualCash: number
  residual: number
  exact: boolean
}

export type PlayerPolicyRoleCoverage = {
  counts: Record<CreativeRole, number>
  minimums: Record<CreativeRole, number>
  missingRoles: CreativeRole[]
  retainedOwners: number
  satisfiesFoundingMinimums: boolean
}

export type PlayerPolicyFoundingMember = {
  talentId: string
  role: CreativeRole
  startWeek: 0
  endWeekExclusive: number
  termWeeks: 52 | 104 | 156 | 208
  annualSalary: number
  signingBonus: number
}

export type PlayerPolicyEntryRosterMember = {
  talentId: string
  role: CreativeRole
  startWeek: number
  endWeekExclusive: number
  termWeeks: number
  annualSalary: number
  signingBonus: number
}

export type PlayerPolicyEntryCohortProjection = PlayerPolicyEntryRosterMember & {
  weeklySalary: number
  renewalQuote208: ContractOffer
}

export type PlayerPolicyWeeklyOperationsProjection = {
  activeContractTalentIds: string[]
  activeContractKeys: string[]
  construction: GameState['construction']
  operationsFacilities: GameState['operations']['facilities']
  freeAgentIdsInStateOrder: string[]
  activeTheatricalReceipts: number
  activeReceiptProductionIds: string[]
  expectedWeeklyRunRevenue: number
  activeProductions: number
  activeProductionIds: string[]
  screenplayProjects: number
  activeScreenplayProjectIds: string[]
  castingSessions: number
  activeCastingSessionIds: string[]
  readyPackageProxyCount: number
  readyPackageProxyProjectIds: string[]
  readyPackageProxyBasis: 'ready-screenplay-projects'
}

export type PlayerPolicyRenewalEpisode = {
  contractKey: string
  talentId: string
  role: CreativeRole
  contractStartWeek: number
  contractEndWeekExclusive: number
  firstLegalWeek: number
  firstObservedWeek: number
  firstQuotedSigningBonus208: number
  acceptedWeek: number | null
  expiredUnrenewedWeek: number | null
  rejectedAttempts: number
}

export type PlayerPolicyExpiryMove = {
  talentId: string
  role: CreativeRole
  intentId: string
  recurrenceOrdinal: number
  acceptedWeek: number
  previousStartWeek: number
  previousEndWeekExclusive: number
  previousTermWeeks: number
  nextStartWeek: number
  nextEndWeekExclusive: number
  nextTermWeeks: 208
  signingBonusPaid: number
}

export type PlayerPolicyBoundaryObservation = {
  week: number
  relation:
    | 'window-arrival'
    | 'expiry-arrival'
    | 'recurrence-window'
    | 'recurrence-post-expiry'
  talentIds: string[]
  contractKeys: string[]
  roleCoverage: PlayerPolicyRoleCoverage
  cohortRetainedTalentIds: string[]
  cohortReleasedTalentIds: string[]
  cohortRoleCoverage: PlayerPolicyRoleCoverage
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
  expectedWeeklyRunRevenue: number
  activeProductions: number
  screenplayProjects: number
  castingSessions: number
  readyScreenplays: number
  packageReadyScreenplays: number
  packageStaffabilityBlockers: number
  packageAffordabilityBlockers: number
  transitionLedgerRows: LedgerEntry[]
  cash: PlayerPolicyCashReconciliation
  stateHash: string
  rngState: string
}

export type PlayerPolicyWeeklyObservation = {
  week: number
  startStateHash: string
  startRngState: string
  startCash: PlayerPolicyCashReconciliation
  stateHashAfterRenewals: string
  rngAfterRenewals: string
  cashAfterRenewals: PlayerPolicyCashReconciliation
  stateHashAfterActions: string
  rngAfterActions: string
  cashAfterActions: PlayerPolicyCashReconciliation
  activeContractTalentIds: string[]
  renewalOpenContractKeys: string[]
  renewalOpenTalentIds: string[]
  quotedSigningBonusObligation208: number
  renewalIntents: RenewalIntentObservation[]
  operatingIntents: RosterWallPolicyIntentProjection[]
  appendedLedger: LedgerEntry[]
  scheduledPayroll: number
  ledgerPayroll: number
  scheduledOverhead: number
  ledgerOverhead: number
  signingBonusRows: LedgerEntry[]
  theatricalReceiptRows: LedgerEntry[]
  theatricalReceiptReconciliation: RosterWallTheatricalReceiptReconciliation
  packageStaffabilityBlockers: RosterWallPolicyIntentProjection[]
  packageAffordabilityBlockers: RosterWallPolicyIntentProjection[]
  arrivalWeek: number
  arrivalStateHash: string
  arrivalRngState: string
  arrivalCash: PlayerPolicyCashReconciliation
  arrivalRoleCoverage: PlayerPolicyRoleCoverage
  operations: PlayerPolicyWeeklyOperationsProjection
}

export type RosterWallPlayerPolicyEntryRecord = RosterWallCommonEnvelope & {
  recordType: 'entry'
  mode: 'player-policy'
  evidenceLabel: typeof ROSTER_WALL_PLAYER_POLICY_LABEL
  pairingEligible: false
  causalClaim: null
  cohort: PlayerPolicyEntryCohortProjection[]
  cash: number
  rngState: string
  economyEngagedEver: boolean
  cashReconciliation: PlayerPolicyCashReconciliation
  ledger: LedgerEntry[]
  cashLedgerCheckpoint: CashLedgerCheckpoint | null
  activeReceipts: {
    expectedThisWeek: number
    theatricalRuns: GameState['theatricalRuns']
  }
  activeCommitments: {
    productions: GameState['studio']['activeProductions']
    screenplayProjects: GameState['scriptDevelopment']['projects']
    castingSessions: GameState['castingSessions']['sessions']
  }
  construction: GameState['construction']
  operationsFacilities: GameState['operations']['facilities']
  roleCoverage: PlayerPolicyRoleCoverage
  entryFileSha256: string
  replay: PlayerPolicyEntryHarvest['replay']
}

export type RosterWallPlayerPolicyWeeklyRecord = RosterWallCommonEnvelope &
  Omit<PlayerPolicyWeeklyObservation, 'week' | 'renewalIntents'> & {
    recordType: 'weekly'
    mode: 'player-policy'
    evidenceLabel: typeof ROSTER_WALL_PLAYER_POLICY_LABEL
    renewalIntentIds: string[]
  }

export type RosterWallPlayerPolicyRenewalIntentRecord =
  RosterWallCommonEnvelope &
    RenewalIntentObservation & {
      recordType: 'renewalIntent'
      mode: 'player-policy'
      evidenceLabel: typeof ROSTER_WALL_PLAYER_POLICY_LABEL
    }

export type RosterWallPlayerPolicyBoundaryRecord = RosterWallCommonEnvelope &
  Omit<PlayerPolicyBoundaryObservation, 'week'> & {
    recordType: 'boundary'
    mode: 'player-policy'
    evidenceLabel: typeof ROSTER_WALL_PLAYER_POLICY_LABEL
  }

export type RosterWallPlayerPolicySerializedEvidence = {
  entry: RosterWallPlayerPolicyEntryRecord
  weekly: RosterWallPlayerPolicyWeeklyRecord[]
  renewalIntents: RosterWallPlayerPolicyRenewalIntentRecord[]
  boundaries: RosterWallPlayerPolicyBoundaryRecord[]
  rows: RosterWallSerializedEvidenceRecord[]
}

export type PlayerPolicyOwnerCadence = {
  talentId: string
  role: CreativeRole
  foundingExpiryWeek: number
  renewalAcceptedWeeks: number[]
  expirySequence: number[]
  rejectedAttempts: number
  activeAtHorizon: boolean
  horizonExpiryWeek: number | null
}

export type PlayerPolicyEntryHarvest = {
  week: typeof ROSTER_WALL_ENTRY_WEEK
  save: SaveFileV11
  saveBytes: string
  saveHash: string
  stateHash: string
  rngState: string
  cash: PlayerPolicyCashReconciliation
  roster: PlayerPolicyEntryRosterMember[]
  replay: {
    importedSaveVersion: 11
    importReexportByteIdentical: true
    remadeReexportByteIdentical: true
    freshContinuationImportStateHash: string
    freshContinuationImportMatchesEntry: true
  }
}

export type PlayerPolicyObserverNeutrality = {
  entryByteIdentical: boolean
  entryStateHashIdentical: boolean
  finalByteIdentical: boolean
  finalStateHashIdentical: boolean
  finalRngStateIdentical: boolean
  observedEntrySaveHash: string
  observerDisabledEntrySaveHash: string
  observedFinalSaveHash: string
  observerDisabledFinalSaveHash: string
}

export type RunRosterWallPlayerPolicyInput = {
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
}

export type RosterWallPlayerPolicyResult = {
  mode: 'player-policy'
  evidenceLabel: typeof ROSTER_WALL_PLAYER_POLICY_LABEL
  pairingEligible: false
  causalClaim: null
  seed: string
  operatingPolicyId: RosterWallOperatingPolicyId
  estatePolicyId: 'vacant'
  foundingTermPolicyId: 'round-robin-mixed'
  continuationPolicyId: 'C1-current-retry-all'
  renewalTermWeeks: 208
  horizonWeek: typeof ROSTER_WALL_PLAYER_POLICY_HORIZON_WEEK
  initialSaveHash: string
  foundingCohort: PlayerPolicyFoundingMember[]
  entry: PlayerPolicyEntryHarvest
  weekly: PlayerPolicyWeeklyObservation[]
  renewalEpisodes: PlayerPolicyRenewalEpisode[]
  expiryMoves: PlayerPolicyExpiryMove[]
  boundaryCadence: PlayerPolicyBoundaryObservation[]
  ownerCadence: PlayerPolicyOwnerCadence[]
  summary: {
    foundingOwners: number
    uniqueOwnersDue: number
    uniqueContractObligations: number
    totalSigningBonusObligation: number
    totalAttemptedSigningBonus: number
    totalSigningBonusPaid: number
    totalTheatricalReceipts: number
    existingRunTheatricalReceipts: number
    openingRunTheatricalReceipts: number
    receiptReconciliationFailures: 0
    acceptedRenewals: number
    uniqueAcceptedContractOwners: number
    uniqueAcceptedTalents: number
    retryAttempts: number
    /** Unique expiring-contract owners, keyed by talent/start/end. */
    uniqueRejectedOwners: number
    /** Descriptive people count; recurrence obligations remain distinct above. */
    uniqueRejectedTalents: number
    movedExpiries: number
    recurrenceMoves: number
    finalRoleCoverage: PlayerPolicyRoleCoverage
    finalCash: PlayerPolicyCashReconciliation
    finalStateHash: string
    finalRngState: string
    finalSaveHash: string
  }
  observerNeutrality: PlayerPolicyObserverNeutrality
}

export type RosterWallPlayerPolicyCorpus = {
  seedCount: 25
  operatingPolicyCount: 3
  entryCount: 75
  results: RosterWallPlayerPolicyResult[]
}

export function summarizePlayerPolicyRejectedOwners(
  intents: readonly Pick<
    RenewalIntentObservation,
    'accepted' | 'contractKey' | 'talentId'
  >[],
): { uniqueRejectedOwners: number; uniqueRejectedTalents: number } {
  const rejected = intents.filter((intent) => !intent.accepted)
  return {
    uniqueRejectedOwners: new Set(rejected.map((intent) => intent.contractKey)).size,
    uniqueRejectedTalents: new Set(rejected.map((intent) => intent.talentId)).size,
  }
}

type MutableRenewalEpisode = PlayerPolicyRenewalEpisode

type PlayerPolicyExecution = {
  initialSaveHash: string
  foundingCohort: PlayerPolicyFoundingMember[]
  entry: PlayerPolicyEntryHarvest
  weekly: PlayerPolicyWeeklyObservation[]
  episodes: Map<string, MutableRenewalEpisode>
  expiryMoves: PlayerPolicyExpiryMove[]
  boundaryCadence: PlayerPolicyBoundaryObservation[]
  finalState: GameState
  finalSaveBytes: string
  finalSaveHash: string
  finalStateHash: string
}

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function hashState(state: GameState): string {
  return sha256(stableStringify(state))
}

function activeContracts(state: GameState): GameState['contracts'] {
  return state.contracts
    .filter(
      (contract) =>
        contract.startWeek <= state.market.tick &&
        state.market.tick < contract.endWeekExclusive,
    )
    .sort((a, b) => compareId(a.talentId, b.talentId))
}

function playerPolicyOperationsProjection(
  state: GameState,
): PlayerPolicyWeeklyOperationsProjection {
  const contracts = activeContracts(state)
  const activeRuns = state.theatricalRuns
    .filter((run) => run.status === 'active')
    .sort((a, b) => compareId(a.productionId, b.productionId))
  const activeProjects = state.scriptDevelopment.projects
    .filter((project) => project.status !== 'produced')
    .sort((a, b) => compareId(a.id, b.id))
  const readyProjects = activeProjects.filter((project) => project.status === 'ready')
  const activeCastingSessions = state.castingSessions.sessions
    .filter((session) => session.status !== 'complete')
    .sort((a, b) => compareId(a.id, b.id))
  const construction = structuredClone(state.construction)
  construction.parcels.sort((a, b) => compareId(a.id, b.id))
  construction.projects.sort((a, b) => compareId(a.id, b.id))
  return {
    activeContractTalentIds: contracts.map((contract) => contract.talentId),
    activeContractKeys: contracts.map(renewalContractKey),
    construction,
    operationsFacilities: structuredClone(state.operations.facilities).sort((a, b) =>
      compareId(a.id, b.id),
    ),
    freeAgentIdsInStateOrder: [...state.freeAgents],
    activeTheatricalReceipts: activeRuns.length,
    activeReceiptProductionIds: activeRuns.map((run) => run.productionId),
    expectedWeeklyRunRevenue: expectedWeeklyRunRevenue(state),
    activeProductions: state.studio.activeProductions.length,
    activeProductionIds: state.studio.activeProductions
      .map((production) => production.id)
      .sort(compareId),
    screenplayProjects: state.scriptDevelopment.projects.length,
    activeScreenplayProjectIds: activeProjects.map((project) => project.id),
    castingSessions: state.castingSessions.sessions.length,
    activeCastingSessionIds: activeCastingSessions.map((session) => session.id),
    readyPackageProxyCount: readyProjects.length,
    readyPackageProxyProjectIds: readyProjects.map((project) => project.id),
    readyPackageProxyBasis: 'ready-screenplay-projects',
  }
}

function playerPolicyPackageBlockers(
  intents: readonly RosterWallPolicyIntentProjection[],
): {
  staffability: RosterWallPolicyIntentProjection[]
  affordability: RosterWallPolicyIntentProjection[]
} {
  const failedPackages = intents.filter(
    (intent) => intent.intentKind === 'production-greenlight' && !intent.accepted,
  )
  return {
    staffability: failedPackages
      .filter((intent) => intent.action === null)
      .map((intent) => structuredClone(intent)),
    affordability: failedPackages
      .filter(
        (intent) =>
          intent.action !== null && /cash|afford|solvency/i.test(intent.reason ?? ''),
      )
      .map((intent) => structuredClone(intent)),
  }
}

function transitionOutflow(
  rows: readonly LedgerEntry[],
  kind: LedgerEntry['kind'],
): number {
  let outflow = 0
  for (const row of rows) {
    if (row.kind === kind) outflow -= row.amount
  }
  return outflow
}

/** Exact V11 cash authority, including the optional historical checkpoint seam. */
export function reconcilePlayerPolicyCash(
  state: GameState,
): PlayerPolicyCashReconciliation {
  const checkpoint = state.cashLedgerCheckpoint ?? null
  const ledgerStart = checkpoint?.ledgerLength ?? 0
  if (
    !Number.isInteger(ledgerStart) ||
    ledgerStart < 0 ||
    ledgerStart > state.ledger.length
  ) {
    throw new Error(
      'roster-wall player policy: invalid SaveFileV11 cash-ledger checkpoint length',
    )
  }
  const openingCash = checkpoint?.cash ?? TUNING.INITIAL_CASH
  // Follow the engine's authoritative ordered fold. Computing the suffix sum
  // first changes floating-point association and can manufacture a tiny residual.
  let expectedCash = openingCash
  let reconciledLedgerAmount = 0
  for (let index = ledgerStart; index < state.ledger.length; index++) {
    const amount = state.ledger[index]!.amount
    reconciledLedgerAmount += amount
    expectedCash += amount
  }
  const residual = state.studio.cash - expectedCash
  return {
    checkpoint: checkpoint === null ? null : { ...checkpoint },
    ledgerStart,
    openingCash,
    reconciledLedgerAmount,
    expectedCash,
    actualCash: state.studio.cash,
    residual,
    exact: residual === 0,
  }
}

function assertCashReconciles(state: GameState, label: string): void {
  const reconciliation = reconcilePlayerPolicyCash(state)
  if (!reconciliation.exact) {
    throw new Error(
      `roster-wall player policy: cash/checkpoint mismatch at ${label} (${String(reconciliation.residual)})`,
    )
  }
}

function roleFor(state: GameState, talentId: string): CreativeRole {
  const talent = state.talent.find((candidate) => candidate.id === talentId)
  if (talent === undefined) {
    throw new Error(
      `roster-wall player policy: contract references unknown talent ${JSON.stringify(talentId)}`,
    )
  }
  return talent.role
}

export function playerPolicyRoleCoverage(
  state: GameState,
  onlyTalentIds?: ReadonlySet<string>,
): PlayerPolicyRoleCoverage {
  const counts: Record<CreativeRole, number> = {
    actor: 0,
    director: 0,
    writer: 0,
    craft: 0,
  }
  const contracts = activeContracts(state).filter(
    (contract) => onlyTalentIds === undefined || onlyTalentIds.has(contract.talentId),
  )
  for (const contract of contracts) counts[roleFor(state, contract.talentId)]++
  const missingRoles = ROLES.filter((role) => counts[role] < FOUNDING_MINIMUMS[role])
  return {
    counts,
    minimums: { ...FOUNDING_MINIMUMS },
    missingRoles,
    retainedOwners: contracts.length,
    satisfiesFoundingMinimums: missingRoles.length === 0,
  }
}

function foundingCohort(state: GameState): PlayerPolicyFoundingMember[] {
  return state.contracts
    .map((contract): PlayerPolicyFoundingMember => {
      if (
        contract.startWeek !== 0 ||
        !([52, 104, 156, 208] as const).includes(
          contract.termWeeks as 52 | 104 | 156 | 208,
        )
      ) {
        throw new Error('roster-wall player policy: founding term assignment is invalid')
      }
      return {
        talentId: contract.talentId,
        role: roleFor(state, contract.talentId),
        startWeek: 0,
        endWeekExclusive: contract.endWeekExclusive,
        termWeeks: contract.termWeeks as 52 | 104 | 156 | 208,
        annualSalary: contract.annualSalary,
        signingBonus: contract.signingBonus,
      }
    })
    .sort((a, b) => compareId(a.talentId, b.talentId))
}

function entryRoster(state: GameState): PlayerPolicyEntryRosterMember[] {
  return state.contracts
    .map((contract) => ({
      talentId: contract.talentId,
      role: roleFor(state, contract.talentId),
      startWeek: contract.startWeek,
      endWeekExclusive: contract.endWeekExclusive,
      termWeeks: contract.termWeeks,
      annualSalary: contract.annualSalary,
      signingBonus: contract.signingBonus,
    }))
    .sort((a, b) => compareId(a.talentId, b.talentId))
}

function exactSave(state: GameState): {
  save: SaveFileV11
  bytes: string
  hash: string
  stateHash: string
  imported: SaveFileV11
} {
  const save = makeSaveV11(structuredClone(state))
  const bytes = exportSave(save)
  const imported = importSave(bytes)
  if (imported.saveVersion !== 11) {
    throw new Error('roster-wall player policy: entry did not import as SaveFileV11')
  }
  if (exportSave(imported) !== bytes) {
    throw new Error('roster-wall player policy: entry import/re-export changed bytes')
  }
  if (exportSave(makeSaveV11(structuredClone(imported.state))) !== bytes) {
    throw new Error('roster-wall player policy: remade entry save changed bytes')
  }
  assertCashReconciles(imported.state, `Week ${String(imported.state.market.tick)} save`)
  return {
    save,
    bytes,
    hash: sha256(bytes),
    stateHash: hashState(imported.state),
    imported,
  }
}

function harvestEntry(state: GameState): PlayerPolicyEntryHarvest {
  if (state.market.tick !== ROSTER_WALL_ENTRY_WEEK) {
    throw new Error('roster-wall player policy: entry harvest must occur at Week 196')
  }
  const exact = exactSave(state)
  const freshContinuationImportStateHash = hashState(exact.imported.state)
  if (freshContinuationImportStateHash !== exact.stateHash) {
    throw new Error('roster-wall player policy: fresh continuation import changed state')
  }
  return {
    week: ROSTER_WALL_ENTRY_WEEK,
    save: exact.save,
    saveBytes: exact.bytes,
    saveHash: exact.hash,
    stateHash: exact.stateHash,
    rngState: exact.imported.state.rngState,
    cash: reconcilePlayerPolicyCash(exact.imported.state),
    roster: entryRoster(exact.imported.state),
    replay: {
      importedSaveVersion: 11,
      importReexportByteIdentical: true,
      remadeReexportByteIdentical: true,
      freshContinuationImportStateHash,
      freshContinuationImportMatchesEntry: true,
    },
  }
}

function captureDueEpisodes(
  state: GameState,
  episodes: Map<string, MutableRenewalEpisode>,
): void {
  for (const contract of state.contracts) {
    if (!renewalWindowOpen(contract, state.market.tick)) continue
    const contractKey = renewalContractKey(contract)
    if (episodes.has(contractKey)) continue
    const talentId = contract.talentId
    episodes.set(contractKey, {
      contractKey,
      talentId,
      role: roleFor(state, talentId),
      contractStartWeek: contract.startWeek,
      contractEndWeekExclusive: contract.endWeekExclusive,
      firstLegalWeek: contract.endWeekExclusive - 12,
      firstObservedWeek: state.market.tick,
      firstQuotedSigningBonus208: contractOffer(state, talentId, 208).signingBonus,
      acceptedWeek: null,
      expiredUnrenewedWeek: null,
      rejectedAttempts: 0,
    })
  }
}

function playerPolicyOverheadParts(
  state: GameState,
): { base: number; employee: number; total: number } {
  const total = weeklyOverhead(state)
  return {
    base: total === 0 ? 0 : TUNING.OVERHEAD_BASE,
    employee: total === 0 ? 0 : TUNING.OVERHEAD_PER_EMPLOYEE * state.contracts.length,
    total,
  }
}

function playerPolicyBoundaryState(
  state: GameState,
  operatingPolicyId: RosterWallOperatingPolicyId,
  foundingTalentIds: ReadonlySet<string>,
  previousState: GameState | null,
  transitionLedgerRows: readonly LedgerEntry[],
  blockerCounts: { staffability: number; affordability: number },
): Omit<
  PlayerPolicyBoundaryObservation,
  'week' | 'relation' | 'talentIds' | 'contractKeys'
> {
  const activeTalentIds = new Set(activeContracts(state).map((contract) => contract.talentId))
  const cohortRetainedTalentIds = [...foundingTalentIds]
    .filter((talentId) => activeTalentIds.has(talentId))
    .sort(compareId)
  const cohortReleasedTalentIds = [...foundingTalentIds]
    .filter((talentId) => !activeTalentIds.has(talentId))
    .sort(compareId)
  const cohortRoleCoverage = playerPolicyRoleCoverage(state, foundingTalentIds)
  const overhead = playerPolicyOverheadParts(state)
  const previousOverhead =
    previousState === null ? null : playerPolicyOverheadParts(previousState)
  const packageReadiness = rosterWallPackageReadiness(state, operatingPolicyId)
  return {
    roleCoverage: playerPolicyRoleCoverage(state),
    cohortRetainedTalentIds,
    cohortReleasedTalentIds,
    cohortRoleCoverage,
    missingFoundingRoles: [...cohortRoleCoverage.missingRoles],
    weeklyPayroll: weeklyPayroll(state),
    payrollDelta:
      previousState === null ? null : weeklyPayroll(state) - weeklyPayroll(previousState),
    baseOverhead: overhead.base,
    baseOverheadDelta:
      previousOverhead === null ? null : overhead.base - previousOverhead.base,
    employeeOverhead: overhead.employee,
    employeeOverheadDelta:
      previousOverhead === null ? null : overhead.employee - previousOverhead.employee,
    totalOverhead: overhead.total,
    overheadDelta:
      previousOverhead === null ? null : overhead.total - previousOverhead.total,
    activeTheatricalReceipts: state.theatricalRuns.filter((run) => run.status === 'active')
      .length,
    expectedWeeklyRunRevenue: expectedWeeklyRunRevenue(state),
    activeProductions: state.studio.activeProductions.length,
    screenplayProjects: state.scriptDevelopment.projects.length,
    castingSessions: state.castingSessions.sessions.length,
    ...packageReadiness,
    packageStaffabilityBlockers: blockerCounts.staffability,
    packageAffordabilityBlockers: blockerCounts.affordability,
    transitionLedgerRows: transitionLedgerRows.map((row) => ({ ...row })),
    cash: reconcilePlayerPolicyCash(state),
    stateHash: hashState(state),
    rngState: state.rngState,
  }
}

function windowBoundary(
  state: GameState,
  operatingPolicyId: RosterWallOperatingPolicyId,
  foundingTalentIds: ReadonlySet<string>,
): PlayerPolicyBoundaryObservation[] {
  const arriving = state.contracts.filter(
    (contract) => contract.endWeekExclusive - state.market.tick === 12,
  )
  const founding = arriving.filter((contract) => contract.startWeek === 0)
  const recurrence = arriving.filter((contract) => contract.startWeek > 0)
  return [
    { contracts: founding, relation: 'window-arrival' as const },
    { contracts: recurrence, relation: 'recurrence-window' as const },
  ]
    .filter(({ contracts }) => contracts.length > 0)
    .map(({ contracts, relation }) => ({
      week: state.market.tick,
      relation,
      talentIds: contracts.map((contract) => contract.talentId).sort(compareId),
      contractKeys: contracts.map(renewalContractKey).sort(compareId),
      ...playerPolicyBoundaryState(
        state,
        operatingPolicyId,
        foundingTalentIds,
        null,
        [],
        { staffability: 0, affordability: 0 },
      ),
    }))
}

function expiryBoundary(
  before: GameState,
  after: GameState,
  operatingPolicyId: RosterWallOperatingPolicyId,
  foundingTalentIds: ReadonlySet<string>,
  transitionLedgerRows: readonly LedgerEntry[],
  blockerCounts: { staffability: number; affordability: number },
): PlayerPolicyBoundaryObservation[] {
  const afterTalentIds = new Set(after.contracts.map((contract) => contract.talentId))
  const released = before.contracts.filter(
    (contract) =>
      contract.endWeekExclusive === after.market.tick && !afterTalentIds.has(contract.talentId),
  )
  const founding = released.filter((contract) => contract.startWeek === 0)
  const recurrence = released.filter((contract) => contract.startWeek > 0)
  return [
    { contracts: founding, relation: 'expiry-arrival' as const },
    { contracts: recurrence, relation: 'recurrence-post-expiry' as const },
  ]
    .filter(({ contracts }) => contracts.length > 0)
    .map(({ contracts, relation }) => ({
      week: after.market.tick,
      relation,
      talentIds: contracts.map((contract) => contract.talentId).sort(compareId),
      contractKeys: contracts.map(renewalContractKey).sort(compareId),
      ...playerPolicyBoundaryState(
        after,
        operatingPolicyId,
        foundingTalentIds,
        before,
        transitionLedgerRows,
        blockerCounts,
      ),
    }))
}

function observeOpenContracts(state: GameState): {
  contractKeys: string[]
  talentIds: string[]
  obligation: number
} {
  const open = state.contracts
    .filter((contract) => renewalWindowOpen(contract, state.market.tick))
    .sort(
      (a, b) =>
        a.endWeekExclusive - b.endWeekExclusive || compareId(a.talentId, b.talentId),
    )
  return {
    contractKeys: open.map(renewalContractKey),
    talentIds: open.map((contract) => contract.talentId),
    obligation: open.reduce(
      (total, contract) =>
        total + contractOffer(state, contract.talentId, 208).signingBonus,
      0,
    ),
  }
}

function recordRenewalOutcomes(
  before: GameState,
  intents: readonly RenewalIntentObservation[],
  episodes: Map<string, MutableRenewalEpisode>,
  moves: PlayerPolicyExpiryMove[],
  moveCounts: Map<string, number>,
): void {
  const contracts = new Map(
    before.contracts.map((contract) => [renewalContractKey(contract), contract]),
  )
  for (const intent of intents) {
    const episode = episodes.get(intent.contractKey)
    if (episode === undefined) {
      throw new Error('roster-wall player policy: renewal intent has no due episode')
    }
    if (!intent.accepted) {
      episode.rejectedAttempts++
      continue
    }
    if (intent.selectedTerm !== 208 || intent.offer.termWeeks !== 208) {
      throw new Error('roster-wall player policy: maintenance used a non-208 renewal')
    }
    const previous = contracts.get(intent.contractKey)
    if (previous === undefined) {
      throw new Error('roster-wall player policy: accepted renewal lost its prior contract')
    }
    episode.acceptedWeek = intent.actualWeek
    const recurrenceOrdinal = (moveCounts.get(intent.talentId) ?? 0) + 1
    moveCounts.set(intent.talentId, recurrenceOrdinal)
    moves.push({
      talentId: intent.talentId,
      role: intent.role,
      intentId: intent.intentId,
      recurrenceOrdinal,
      acceptedWeek: intent.actualWeek,
      previousStartWeek: previous.startWeek,
      previousEndWeekExclusive: previous.endWeekExclusive,
      previousTermWeeks: previous.termWeeks,
      nextStartWeek: intent.offer.startWeek,
      nextEndWeekExclusive: intent.offer.endWeekExclusive,
      nextTermWeeks: 208,
      signingBonusPaid: intent.offer.signingBonus,
    })
  }
}

function markExpiredEpisodes(
  beforeTick: GameState,
  afterTick: GameState,
  episodes: Map<string, MutableRenewalEpisode>,
): void {
  const afterKeys = new Set(afterTick.contracts.map(renewalContractKey))
  for (const contract of beforeTick.contracts) {
    const key = renewalContractKey(contract)
    if (contract.endWeekExclusive !== afterTick.market.tick || afterKeys.has(key)) continue
    const episode = episodes.get(key)
    if (episode !== undefined && episode.acceptedWeek === null) {
      episode.expiredUnrenewedWeek = afterTick.market.tick
    }
  }
}

function runWeek(
  state: GameState,
  operatingPolicyId: RosterWallOperatingPolicyId,
  memory: RenewalPolicyMemory,
  captureObserver: boolean,
  episodes: Map<string, MutableRenewalEpisode>,
  moves: PlayerPolicyExpiryMove[],
  moveCounts: Map<string, number>,
  weekly: PlayerPolicyWeeklyObservation[],
  boundaries: PlayerPolicyBoundaryObservation[],
  foundingTalentIds: ReadonlySet<string>,
): { state: GameState; memory: RenewalPolicyMemory } {
  assertCashReconciles(state, `Week ${String(state.market.tick)} start`)
  captureDueEpisodes(state, episodes)
  const open = observeOpenContracts(state)
  if (captureObserver) {
    boundaries.push(...windowBoundary(state, operatingPolicyId, foundingTalentIds))
  }
  const ledgerLength = state.ledger.length
  const startStateHash = captureObserver ? hashState(state) : ''
  const startRngState = state.rngState
  const startCash = captureObserver ? reconcilePlayerPolicyCash(state) : null

  const renewal = applyRenewalPolicy(state, 'C1-current-retry-all', memory)
  recordRenewalOutcomes(state, renewal.intents, episodes, moves, moveCounts)
  assertCashReconciles(renewal.state, `Week ${String(state.market.tick)} after renewals`)
  const operating = runRosterWallOperatingWeek({
    state: renewal.state,
    operatingPolicyId,
    captureIntents: captureObserver,
  })
  assertCashReconciles(
    operating.stateAfterActions,
    `Week ${String(state.market.tick)} after operating actions`,
  )
  markExpiredEpisodes(operating.stateAfterActions, operating.stateAfterTick, episodes)
  assertCashReconciles(operating.stateAfterTick, `Week ${String(operating.stateAfterTick.market.tick)} arrival`)
  if (captureObserver) {
    const appendedLedger = operating.stateAfterTick.ledger
      .slice(ledgerLength)
      .map((entry) => ({ ...entry }))
    const scheduledPayroll = weeklyPayroll(operating.stateAfterActions)
    const scheduledOverhead = weeklyOverhead(operating.stateAfterActions)
    const ledgerPayroll = transitionOutflow(appendedLedger, 'payroll')
    const ledgerOverhead = transitionOutflow(appendedLedger, 'overhead')
    if (scheduledPayroll !== ledgerPayroll || scheduledOverhead !== ledgerOverhead) {
      throw new Error(
        'roster-wall player policy: scheduled payroll/overhead disagrees with transition ledger',
      )
    }
    const theatricalReceiptReconciliation = rosterWallTheatricalReceiptReconciliation(
      operating.stateAfterActions,
      operating.stateAfterTick,
      appendedLedger,
    )
    const blockers = playerPolicyPackageBlockers(operating.intents)
    boundaries.push(
      ...expiryBoundary(
        operating.stateAfterActions,
        operating.stateAfterTick,
        operatingPolicyId,
        foundingTalentIds,
        appendedLedger,
        {
          staffability: blockers.staffability.length,
          affordability: blockers.affordability.length,
        },
      ),
    )
    weekly.push({
      week: state.market.tick,
      startStateHash,
      startRngState,
      startCash: startCash!,
      stateHashAfterRenewals: hashState(renewal.state),
      rngAfterRenewals: renewal.state.rngState,
      cashAfterRenewals: reconcilePlayerPolicyCash(renewal.state),
      stateHashAfterActions: hashState(operating.stateAfterActions),
      rngAfterActions: operating.stateAfterActions.rngState,
      cashAfterActions: reconcilePlayerPolicyCash(operating.stateAfterActions),
      activeContractTalentIds: activeContracts(operating.stateAfterTick)
        .map((contract) => contract.talentId)
        .sort(compareId),
      renewalOpenContractKeys: open.contractKeys,
      renewalOpenTalentIds: open.talentIds,
      quotedSigningBonusObligation208: open.obligation,
      renewalIntents: renewal.intents.map((intent) => structuredClone(intent)),
      operatingIntents: operating.intents.map((intent) => structuredClone(intent)),
      appendedLedger,
      scheduledPayroll,
      ledgerPayroll,
      scheduledOverhead,
      ledgerOverhead,
      signingBonusRows: appendedLedger
        .filter((entry) => entry.kind === 'signingBonus')
        .map((entry) => ({ ...entry })),
      theatricalReceiptRows: appendedLedger
        .filter((entry) => entry.kind === 'studioRevenue' || entry.kind === 'boxOffice')
        .map((entry) => ({ ...entry })),
      theatricalReceiptReconciliation: { ...theatricalReceiptReconciliation },
      packageStaffabilityBlockers: blockers.staffability,
      packageAffordabilityBlockers: blockers.affordability,
      arrivalWeek: operating.stateAfterTick.market.tick,
      arrivalStateHash: hashState(operating.stateAfterTick),
      arrivalRngState: operating.stateAfterTick.rngState,
      arrivalCash: reconcilePlayerPolicyCash(operating.stateAfterTick),
      arrivalRoleCoverage: playerPolicyRoleCoverage(operating.stateAfterTick),
      operations: playerPolicyOperationsProjection(operating.stateAfterTick),
    })
  }
  return { state: operating.stateAfterTick, memory: renewal.memory }
}

function executePlayerPolicy(
  input: RunRosterWallPlayerPolicyInput,
  captureObserver: boolean,
): PlayerPolicyExecution {
  let state = foundRosterWallStudio(
    input.seed,
    input.operatingPolicyId,
    'round-robin-mixed',
  )
  const initialSaveHash = sha256(exportSave(makeSaveV11(structuredClone(state))))
  const founders = foundingCohort(state)
  const foundingTalentIds = new Set(founders.map((founder) => founder.talentId))
  const episodes = new Map<string, MutableRenewalEpisode>()
  const expiryMoves: PlayerPolicyExpiryMove[] = []
  const boundaryCadence: PlayerPolicyBoundaryObservation[] = []
  const weekly: PlayerPolicyWeeklyObservation[] = []
  const moveCounts = new Map<string, number>()
  let memory = createRenewalPolicyMemory(0)

  while (state.market.tick < ROSTER_WALL_ENTRY_WEEK) {
    const step = runWeek(
      state,
      input.operatingPolicyId,
      memory,
      captureObserver,
      episodes,
      expiryMoves,
      moveCounts,
      weekly,
      boundaryCadence,
      foundingTalentIds,
    )
    state = step.state
    memory = step.memory
  }

  const entry = harvestEntry(state)
  // The immutable save bytes, not the in-memory prehistory value, are the sole
  // continuation authority. C1 carries no schedule memory, so resetting its
  // descriptive harness memory at this seam cannot change the public policy.
  const freshEntry = importSave(entry.saveBytes)
  if (
    freshEntry.saveVersion !== 11 ||
    exportSave(freshEntry) !== entry.saveBytes ||
    sha256(exportSave(freshEntry)) !== entry.saveHash
  ) {
    throw new Error(
      'roster-wall player policy: continuation did not fresh-load the immutable entry bytes',
    )
  }
  state = freshEntry.state
  memory = createRenewalPolicyMemory(ROSTER_WALL_ENTRY_WEEK)
  if (hashState(state) !== entry.stateHash || state.rngState !== entry.rngState) {
    throw new Error('roster-wall player policy: continuation did not start from entry bytes')
  }

  while (state.market.tick < ROSTER_WALL_PLAYER_POLICY_HORIZON_WEEK) {
    const step = runWeek(
      state,
      input.operatingPolicyId,
      memory,
      captureObserver,
      episodes,
      expiryMoves,
      moveCounts,
      weekly,
      boundaryCadence,
      foundingTalentIds,
    )
    state = step.state
    memory = step.memory
  }

  const final = exactSave(state)
  return {
    initialSaveHash,
    foundingCohort: founders,
    entry,
    weekly,
    episodes,
    expiryMoves,
    boundaryCadence,
    finalState: final.imported.state,
    finalSaveBytes: final.bytes,
    finalSaveHash: final.hash,
    finalStateHash: final.stateHash,
  }
}

function ownerCadence(
  execution: PlayerPolicyExecution,
): PlayerPolicyOwnerCadence[] {
  const movesByOwner = new Map<string, PlayerPolicyExpiryMove[]>()
  for (const move of execution.expiryMoves) {
    const moves = movesByOwner.get(move.talentId) ?? []
    moves.push(move)
    movesByOwner.set(move.talentId, moves)
  }
  const rejectedByOwner = new Map<string, number>()
  for (const episode of execution.episodes.values()) {
    rejectedByOwner.set(
      episode.talentId,
      (rejectedByOwner.get(episode.talentId) ?? 0) + episode.rejectedAttempts,
    )
  }
  return execution.foundingCohort.map((founder) => {
    const moves = (movesByOwner.get(founder.talentId) ?? []).sort(
      (a, b) => a.recurrenceOrdinal - b.recurrenceOrdinal,
    )
    const active = execution.finalState.contracts.find(
      (contract) => contract.talentId === founder.talentId,
    )
    return {
      talentId: founder.talentId,
      role: founder.role,
      foundingExpiryWeek: founder.endWeekExclusive,
      renewalAcceptedWeeks: moves.map((move) => move.acceptedWeek),
      expirySequence: [
        founder.endWeekExclusive,
        ...moves.map((move) => move.nextEndWeekExclusive),
      ],
      rejectedAttempts: rejectedByOwner.get(founder.talentId) ?? 0,
      activeAtHorizon: active !== undefined,
      horizonExpiryWeek: active?.endWeekExclusive ?? null,
    }
  })
}

function observerNeutrality(
  observed: PlayerPolicyExecution,
  disabled: PlayerPolicyExecution,
): PlayerPolicyObserverNeutrality {
  return {
    entryByteIdentical: observed.entry.saveBytes === disabled.entry.saveBytes,
    entryStateHashIdentical: observed.entry.stateHash === disabled.entry.stateHash,
    finalByteIdentical: observed.finalSaveBytes === disabled.finalSaveBytes,
    finalStateHashIdentical: observed.finalStateHash === disabled.finalStateHash,
    finalRngStateIdentical:
      observed.finalState.rngState === disabled.finalState.rngState,
    observedEntrySaveHash: observed.entry.saveHash,
    observerDisabledEntrySaveHash: disabled.entry.saveHash,
    observedFinalSaveHash: observed.finalSaveHash,
    observerDisabledFinalSaveHash: disabled.finalSaveHash,
  }
}

/**
 * Run one vacant-estate mixed-founding-term player-policy arm through Week 428.
 * Results are descriptive after 196 weeks of policy feedback and explicitly
 * ineligible for maximum-term exact-entry causal pairing.
 */
export function runRosterWallPlayerPolicy(
  input: RunRosterWallPlayerPolicyInput,
): RosterWallPlayerPolicyResult {
  const observed = executePlayerPolicy(input, true)
  const disabled = executePlayerPolicy(input, false)
  const neutrality = observerNeutrality(observed, disabled)
  if (
    !neutrality.entryByteIdentical ||
    !neutrality.entryStateHashIdentical ||
    !neutrality.finalByteIdentical ||
    !neutrality.finalStateHashIdentical ||
    !neutrality.finalRngStateIdentical
  ) {
    throw new Error('roster-wall player policy: observer changed campaign behavior')
  }

  const episodes = [...observed.episodes.values()].sort(
    (a, b) =>
      a.firstObservedWeek - b.firstObservedWeek || compareId(a.contractKey, b.contractKey),
  )
  const intents = observed.weekly.flatMap((row) => row.renewalIntents)
  const accepted = intents.filter((intent) => intent.accepted)
  const rejected = intents.filter((intent) => !intent.accepted)
  const acceptedOwners = new Set(accepted.map((intent) => intent.talentId))
  const acceptedContractOwners = new Set(accepted.map((intent) => intent.contractKey))
  const rejectedOwnerCounts = summarizePlayerPolicyRejectedOwners(intents)
  const ownersDue = new Set(episodes.map((episode) => episode.talentId))
  const paidFromIntents = accepted.reduce(
    (total, intent) => total + intent.offer.signingBonus,
    0,
  )
  const paidFromLedger = observed.finalState.ledger
    .filter((entry) => entry.kind === 'signingBonus')
    .reduce((total, entry) => total + -entry.amount, 0)
  if (paidFromIntents !== paidFromLedger) {
    throw new Error('roster-wall player policy: signing-bonus intents and ledger disagree')
  }
  const finalCash = reconcilePlayerPolicyCash(observed.finalState)
  const totalTheatricalReceipts = observed.weekly.reduce(
    (total, row) => total + row.theatricalReceiptReconciliation.ledgerTotal,
    0,
  )
  const existingRunTheatricalReceipts = observed.weekly.reduce(
    (total, row) =>
      total + row.theatricalReceiptReconciliation.scheduledExistingReceipts,
    0,
  )
  const openingRunTheatricalReceipts = observed.weekly.reduce(
    (total, row) =>
      total + row.theatricalReceiptReconciliation.scheduledOpeningReceipts,
    0,
  )
  return {
    mode: 'player-policy',
    evidenceLabel: ROSTER_WALL_PLAYER_POLICY_LABEL,
    pairingEligible: false,
    causalClaim: null,
    seed: input.seed,
    operatingPolicyId: input.operatingPolicyId,
    estatePolicyId: 'vacant',
    foundingTermPolicyId: 'round-robin-mixed',
    continuationPolicyId: 'C1-current-retry-all',
    renewalTermWeeks: 208,
    horizonWeek: ROSTER_WALL_PLAYER_POLICY_HORIZON_WEEK,
    initialSaveHash: observed.initialSaveHash,
    foundingCohort: observed.foundingCohort,
    entry: observed.entry,
    weekly: observed.weekly,
    renewalEpisodes: episodes,
    expiryMoves: observed.expiryMoves,
    boundaryCadence: observed.boundaryCadence,
    ownerCadence: ownerCadence(observed),
    summary: {
      foundingOwners: observed.foundingCohort.length,
      uniqueOwnersDue: ownersDue.size,
      uniqueContractObligations: episodes.length,
      totalSigningBonusObligation: episodes.reduce(
        (total, episode) => total + episode.firstQuotedSigningBonus208,
        0,
      ),
      totalAttemptedSigningBonus: intents.reduce(
        (total, intent) => total + intent.offer.signingBonus,
        0,
      ),
      totalSigningBonusPaid: paidFromIntents,
      totalTheatricalReceipts,
      existingRunTheatricalReceipts,
      openingRunTheatricalReceipts,
      receiptReconciliationFailures: 0,
      acceptedRenewals: accepted.length,
      uniqueAcceptedContractOwners: acceptedContractOwners.size,
      uniqueAcceptedTalents: acceptedOwners.size,
      retryAttempts: rejected.length,
      ...rejectedOwnerCounts,
      movedExpiries: observed.expiryMoves.length,
      recurrenceMoves: observed.expiryMoves.filter(
        (move) => move.recurrenceOrdinal > 1,
      ).length,
      finalRoleCoverage: playerPolicyRoleCoverage(observed.finalState),
      finalCash,
      finalStateHash: observed.finalStateHash,
      finalRngState: observed.finalState.rngState,
      finalSaveHash: observed.finalSaveHash,
    },
    observerNeutrality: neutrality,
  }
}

function playerPolicyEntryId(result: RosterWallPlayerPolicyResult): string {
  return rosterWallEntryId(
    {
      seed: result.seed,
      operatingPolicyId: result.operatingPolicyId,
      estatePolicyId: result.estatePolicyId,
    },
    result.foundingTermPolicyId,
  )
}

function exactPlayerPolicyEntryState(result: RosterWallPlayerPolicyResult): GameState {
  const imported = importSave(result.entry.saveBytes)
  if (imported.saveVersion !== 11) {
    throw new Error('roster-wall player policy evidence: entry is not SaveFileV11')
  }
  const reexported = exportSave(imported)
  if (
    reexported !== result.entry.saveBytes ||
    sha256(reexported) !== result.entry.saveHash ||
    hashState(imported.state) !== result.entry.stateHash ||
    imported.state.market.tick !== ROSTER_WALL_ENTRY_WEEK
  ) {
    throw new Error(
      'roster-wall player policy evidence: immutable Week-196 entry bytes/hash/state disagree',
    )
  }
  assertCashReconciles(imported.state, 'serialized Week 196 entry')
  return imported.state
}

/** Full contract-governed Week-196 player-policy entry projection. */
export function projectRosterWallPlayerPolicyEntry(
  result: RosterWallPlayerPolicyResult,
  source: RosterWallSourceProvenance,
): RosterWallPlayerPolicyEntryRecord {
  const state = exactPlayerPolicyEntryState(result)
  const cohort = activeContracts(state).map(
    (contract): PlayerPolicyEntryCohortProjection => ({
      talentId: contract.talentId,
      role: roleFor(state, contract.talentId),
      startWeek: contract.startWeek,
      endWeekExclusive: contract.endWeekExclusive,
      termWeeks: contract.termWeeks,
      annualSalary: contract.annualSalary,
      signingBonus: contract.signingBonus,
      weeklySalary: weeklySalary(contract.annualSalary),
      renewalQuote208: structuredClone(contractOffer(state, contract.talentId, 208)),
    }),
  )
  const activeRuns = state.theatricalRuns
    .filter((run) => run.status === 'active')
    .map((run) => structuredClone(run))
    .sort((a, b) => compareId(a.productionId, b.productionId))
  const record = rosterWallSerializedEvidenceRecord(
    {
      recordType: 'entry',
      mode: 'player-policy',
      source,
      seed: result.seed,
      operatingPolicyId: result.operatingPolicyId,
      estatePolicyId: result.estatePolicyId,
      foundingTermPolicyId: result.foundingTermPolicyId,
      continuationPolicyId: result.continuationPolicyId,
      horizonWeeks: result.horizonWeek,
      initialSaveHash: result.initialSaveHash,
      entryId: playerPolicyEntryId(result),
      entryWeek: ROSTER_WALL_ENTRY_WEEK,
      entrySaveHash: result.entry.saveHash,
      entryStateHash: result.entry.stateHash,
      week: ROSTER_WALL_ENTRY_WEEK,
    },
    {
      evidenceLabel: ROSTER_WALL_PLAYER_POLICY_LABEL,
      pairingEligible: false as const,
      causalClaim: null,
      cohort,
      cash: state.studio.cash,
      rngState: state.rngState,
      economyEngagedEver: state.economyEngagedEver,
      cashReconciliation: reconcilePlayerPolicyCash(state),
      ledger: state.ledger.map((entry) => ({ ...entry })),
      cashLedgerCheckpoint:
        state.cashLedgerCheckpoint === undefined
          ? null
          : { ...state.cashLedgerCheckpoint },
      activeReceipts: {
        expectedThisWeek: expectedWeeklyRunRevenue(state),
        theatricalRuns: activeRuns,
      },
      activeCommitments: {
        productions: structuredClone(state.studio.activeProductions).sort((a, b) =>
          compareId(a.id, b.id),
        ),
        screenplayProjects: structuredClone(
          state.scriptDevelopment.projects.filter(
            (project) => project.status !== 'produced',
          ),
        ).sort((a, b) => compareId(a.id, b.id)),
        castingSessions: structuredClone(state.castingSessions.sessions).sort((a, b) =>
          compareId(a.id, b.id),
        ),
      },
      construction: playerPolicyOperationsProjection(state).construction,
      operationsFacilities: playerPolicyOperationsProjection(state).operationsFacilities,
      roleCoverage: playerPolicyRoleCoverage(state),
      entryFileSha256: result.entry.saveHash,
      replay: structuredClone(result.entry.replay),
    },
  )
  return record as RosterWallPlayerPolicyEntryRecord
}

function playerPolicyEvidenceEnvelope(
  result: RosterWallPlayerPolicyResult,
  source: RosterWallSourceProvenance,
  recordType: 'weekly' | 'renewalIntent' | 'boundary',
  week: number,
) {
  return {
    recordType,
    mode: 'player-policy' as const,
    source,
    seed: result.seed,
    operatingPolicyId: result.operatingPolicyId,
    estatePolicyId: result.estatePolicyId,
    foundingTermPolicyId: result.foundingTermPolicyId,
    continuationPolicyId: result.continuationPolicyId,
    horizonWeeks: result.horizonWeek,
    initialSaveHash: result.initialSaveHash,
    entryId: playerPolicyEntryId(result),
    entryWeek: ROSTER_WALL_ENTRY_WEEK,
    entrySaveHash: result.entry.saveHash,
    entryStateHash: result.entry.stateHash,
    week,
  }
}

/**
 * Adapt the descriptive player-policy run into artifact-facing entry, weekly,
 * intent, and boundary rows. Simulation results stay source-free; only this
 * accepted-source seam can create serialized evidence.
 */
export function serializeRosterWallPlayerPolicyEvidence(
  result: RosterWallPlayerPolicyResult,
  source: RosterWallSourceProvenance,
): RosterWallPlayerPolicySerializedEvidence {
  const entry = projectRosterWallPlayerPolicyEntry(result, source)
  const weekly = result.weekly.map((observation): RosterWallPlayerPolicyWeeklyRecord => {
    const {
      week,
      renewalIntents,
      ...projection
    } = observation
    return rosterWallSerializedEvidenceRecord(
      playerPolicyEvidenceEnvelope(result, source, 'weekly', week),
      {
        evidenceLabel: ROSTER_WALL_PLAYER_POLICY_LABEL,
        ...structuredClone(projection),
        renewalIntentIds: renewalIntents.map((intent) => intent.intentId),
      },
    ) as RosterWallPlayerPolicyWeeklyRecord
  })
  const renewalIntents = result.weekly.flatMap((observation) =>
    observation.renewalIntents.map(
      (intent): RosterWallPlayerPolicyRenewalIntentRecord =>
        rosterWallSerializedEvidenceRecord(
          playerPolicyEvidenceEnvelope(
            result,
            source,
            'renewalIntent',
            intent.actualWeek,
          ),
          {
            evidenceLabel: ROSTER_WALL_PLAYER_POLICY_LABEL,
            ...structuredClone(intent),
          },
        ) as RosterWallPlayerPolicyRenewalIntentRecord,
    ),
  )
  const boundaries = result.boundaryCadence.map(
    (observation): RosterWallPlayerPolicyBoundaryRecord => {
      const { week, ...projection } = observation
      return rosterWallSerializedEvidenceRecord(
        playerPolicyEvidenceEnvelope(result, source, 'boundary', week),
        {
          evidenceLabel: ROSTER_WALL_PLAYER_POLICY_LABEL,
          ...structuredClone(projection),
        },
      ) as RosterWallPlayerPolicyBoundaryRecord
    },
  )
  return {
    entry,
    weekly,
    renewalIntents,
    boundaries,
    rows: [entry, ...weekly, ...renewalIntents, ...boundaries],
  }
}

const PLAYER_POLICY_EVIDENCE_PHASE_ORDER = {
  boundary: 0,
  renewalIntent: 1,
  weekly: 2,
} as const

/** Canonical artifact order for one player-policy entry's non-entry rows. */
export function orderedRosterWallPlayerPolicyEvidenceRows(
  evidence: RosterWallPlayerPolicySerializedEvidence,
): Array<
  | RosterWallPlayerPolicyBoundaryRecord
  | RosterWallPlayerPolicyRenewalIntentRecord
  | RosterWallPlayerPolicyWeeklyRecord
> {
  return [
    ...evidence.boundaries,
    ...evidence.renewalIntents,
    ...evidence.weekly,
  ].sort(
    (a, b) =>
      (a.week ?? -1) - (b.week ?? -1) ||
      PLAYER_POLICY_EVIDENCE_PHASE_ORDER[a.recordType] -
        PLAYER_POLICY_EVIDENCE_PHASE_ORDER[b.recordType] ||
      (a.recordType === 'renewalIntent' && b.recordType === 'renewalIntent'
        ? a.orderRank - b.orderRank || compareId(a.intentId, b.intentId)
        : a.recordType === 'boundary' && b.recordType === 'boundary'
          ? compareId(a.relation, b.relation)
          : 0),
  )
}

/** Run the frozen 25-seed × three-policy descriptive matrix in canonical order. */
export function validateRosterWallPlayerPolicyCorpusSeeds(
  inputSeeds: readonly string[],
): string[] {
  if (inputSeeds.length !== 25) {
    throw new Error('roster-wall player policy: corpus requires exactly 25 seeds')
  }
  if (inputSeeds.some((seed) => seed === '')) {
    throw new Error('roster-wall player policy: corpus seeds must be non-empty')
  }
  const seeds = [...inputSeeds].sort(compareId)
  if (new Set(seeds).size !== seeds.length) {
    throw new Error('roster-wall player policy: corpus seeds must be unique')
  }
  if (
    seeds.some((seed, index) => seed !== ROSTER_WALL_CANONICAL_SEEDS[index])
  ) {
    throw new Error(
      'roster-wall player policy: corpus seeds must equal the canonical facilities-0001 through facilities-0025 set',
    )
  }
  return seeds
}

export function runRosterWallPlayerPolicyCorpus(
  inputSeeds: readonly string[],
): RosterWallPlayerPolicyCorpus {
  const seeds = validateRosterWallPlayerPolicyCorpusSeeds(inputSeeds)
  const results = seeds.flatMap((seed) =>
    ROSTER_WALL_OPERATING_POLICY_IDS.map((operatingPolicyId) =>
      runRosterWallPlayerPolicy({ seed, operatingPolicyId }),
    ),
  )
  if (results.length !== 75) {
    throw new Error('roster-wall player policy: corpus matrix did not produce 75 entries')
  }
  return {
    seedCount: 25,
    operatingPolicyCount: 3,
    entryCount: 75,
    results,
  }
}
