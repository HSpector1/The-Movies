// Week-208 roster-wall evidence schema and canonical entry projection.
//
// ANALYSIS ONLY. These rows contain observed public engine facts; they never feed
// back into simulation behavior.

import {
  FOUNDING_MINIMUMS,
  TUNING,
  expectedWeeklyRunRevenue,
  weeklySalary,
} from '../../core/index.js'
import type {
  CreativeRole,
  GameState,
  GameStateV14,
  LedgerEntry,
} from '../../core/index.js'
import type {
  RosterWallEntryHarvest,
  RosterWallFoundingTermPolicyId,
  RosterWallTimingShadow,
} from './campaign.js'
import type { RosterContinuationPolicyId } from './renewal.js'
import {
  ROSTER_WALL_PRODUCTION_AUTHORITY,
} from './provenance.js'
import type { RosterWallSourceProvenance } from './provenance.js'
import type {
  RosterWallPlayerPolicyBoundaryRecord,
  RosterWallPlayerPolicyEntryRecord,
  RosterWallPlayerPolicyRenewalIntentRecord,
  RosterWallPlayerPolicyWeeklyRecord,
} from './player-policy.js'
import type { RosterWallMechanicsFixtureRow } from './fixtures.js'

export const ROSTER_WALL_OBSERVER_SCHEMA_VERSION = 'roster-wall-observer-v1' as const
export const ROSTER_WALL_EXPERIMENT_ID = 'week-208-roster-wall-v1' as const
export const ROSTER_WALL_SEED_SET_ID = 'canonical-facilities-25-v1' as const
export const ROSTER_WALL_CANONICAL_SEEDS = Array.from(
  { length: 25 },
  (_, index) => `facilities-${String(index + 1).padStart(4, '0')}`,
) as readonly string[]

export type RosterWallRecordType =
  | 'entry'
  | 'weekly'
  | 'renewalIntent'
  | 'boundary'
  | 'windowShadow'
  | 'mechanicsFixture'
  | 'pair'

export type RosterWallEvidenceMode =
  | 'current'
  | 'player-policy'
  | 'reference-shadow'
  | 'mechanics-fixture'

export type RosterWallEstatePolicyDimension =
  | RosterWallEntryHarvest['estatePolicyId']
  | null

export type RosterWallCommonEnvelope = {
  schemaVersion: typeof ROSTER_WALL_OBSERVER_SCHEMA_VERSION
  recordType: RosterWallRecordType
  mode: RosterWallEvidenceMode
  experimentId: typeof ROSTER_WALL_EXPERIMENT_ID
  seedSetId: typeof ROSTER_WALL_SEED_SET_ID
  seed: string | null
  operatingPolicyId: RosterWallEntryHarvest['operatingPolicyId'] | null
  estatePolicyId: RosterWallEstatePolicyDimension
  foundingTermPolicyId: RosterWallFoundingTermPolicyId | null
  continuationPolicyId: RosterContinuationPolicyId | null
  horizonWeeks: number | null
  source: RosterWallSourceProvenance
  initialSaveHash: string | null
  entryId: string | null
  entryWeek: number | null
  entrySaveHash: string | null
  entryStateHash: string | null
  week: number | null
}

export type RosterWallCashReconciliation = {
  authority: 'initial-cash-full-ledger' | 'save-v11-checkpoint-suffix'
  initialCash: number
  checkpointCash: number | null
  checkpointLedgerLength: number | null
  ledgerLength: number
  fullLedgerTotal: number
  suffixLedgerTotal: number
  expectedCash: number
  actualCash: number
  delta: number
}

export type RosterWallTheatricalReceiptReconciliation = {
  scheduledExistingReceipts: number
  scheduledOpeningReceipts: number
  scheduledTotal: number
  ledgerTotal: number
  ledgerRowCount: number
  delta: number
}

export type RosterWallEntryRecord = RosterWallCommonEnvelope & {
  recordType: 'entry'
  mode: 'current' | 'player-policy'
  cohort: RosterWallEntryHarvest['cohort']
  cash: number
  rngState: string
  economyEngagedEver: boolean
  cashReconciliation: RosterWallCashReconciliation
  ledger: LedgerEntry[]
  cashLedgerCheckpoint: GameState['cashLedgerCheckpoint'] | null
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
  // Placement Core V12: the capital-project authority moved here. `construction`
  // above is retained (and now always the vacant registry) so the record's frozen
  // shape still reads, but the Annex's real lifecycle lives in this field.
  placement: GameState['placement']
  operationsFacilities: GameState['operations']['facilities']
  roleCoverage: Record<CreativeRole, number>
  entryFileSha256: string
  replay: RosterWallEntryHarvest['replay']
}

export type RosterWallWindowShadowRecord = RosterWallCommonEnvelope & {
  recordType: 'windowShadow'
  mode: 'reference-shadow'
  warning: RosterWallTimingShadow
}

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function orderedLedgerFold(openingCash: number, entries: readonly LedgerEntry[]): number {
  let cash = openingCash
  for (const entry of entries) cash += entry.amount
  return cash
}

/** Reconcile native and historical-checkpoint V11 cash in authoritative array order. */
// Accepts the live GameState AND the frozen GameStateV14 shape. Callers now
// feed it a genuine SaveFileV17 entry read straight off the Week-196 harvest;
// the V14 arm of the union is kept only because this is a pure ledger/cash/
// market read with no dependency on P06A's `releaseAuthority` root, so
// widening it costs nothing and there is no reason to narrow it back.
export function rosterWallCashReconciliation(
  state: GameState | GameStateV14,
): RosterWallCashReconciliation {
  const checkpoint = state.cashLedgerCheckpoint
  const ledgerLength = state.ledger.length
  const fullLedgerTotal = orderedLedgerFold(0, state.ledger)
  const checkpointLedgerLength = checkpoint?.ledgerLength ?? 0
  if (
    !Number.isInteger(checkpointLedgerLength) ||
    checkpointLedgerLength < 0 ||
    checkpointLedgerLength > ledgerLength
  ) {
    throw new Error('roster-wall schema: invalid SaveFileV14 cash-ledger checkpoint length')
  }
  const suffix = state.ledger.slice(checkpointLedgerLength)
  const suffixLedgerTotal = orderedLedgerFold(0, suffix)
  const openingCash = checkpoint?.cash ?? TUNING.INITIAL_CASH
  // Cash authority is an ordered fold from the applicable opening balance. Do
  // not regroup the ledger into a subtotal before adding it to opening cash:
  // that changes floating-point association and can manufacture a residual.
  const expectedCash = orderedLedgerFold(openingCash, suffix)
  const delta = state.studio.cash - expectedCash
  if (delta !== 0) {
    throw new Error(
      `roster-wall schema: cash reconciliation failed at Week ${String(state.market.tick)} by ${String(delta)}`,
    )
  }
  return {
    authority:
      checkpoint === undefined
        ? 'initial-cash-full-ledger'
        : 'save-v11-checkpoint-suffix',
    initialCash: TUNING.INITIAL_CASH,
    checkpointCash: checkpoint?.cash ?? null,
    checkpointLedgerLength: checkpoint?.ledgerLength ?? null,
    ledgerLength,
    fullLedgerTotal,
    suffixLedgerTotal,
    expectedCash,
    actualCash: state.studio.cash,
    delta,
  }
}

/**
 * Reconcile the receipts scheduled by locked theatrical runs to the exact tick
 * ledger. Existing runs and films released during this transition are kept
 * separate, while both totals follow the engine's theatrical-run array order.
 */
export function rosterWallTheatricalReceiptReconciliation(
  beforeTick: GameState,
  afterTick: GameState,
  transitionLedgerRows: readonly LedgerEntry[],
): RosterWallTheatricalReceiptReconciliation {
  if (afterTick.market.tick !== beforeTick.market.tick + 1) {
    throw new Error('roster-wall schema: theatrical receipt transition did not advance one week')
  }
  const beforeByProductionId = new Map(
    beforeTick.theatricalRuns.map((run) => [run.productionId, run]),
  )
  const expectedRows: Array<{
    productionId: string
    amount: number
    origin: 'existing' | 'opening'
  }> = []
  for (const afterRun of afterTick.theatricalRuns) {
    const beforeRun = beforeByProductionId.get(afterRun.productionId)
    if (beforeRun?.status === 'active') {
      expectedRows.push({
        productionId: beforeRun.productionId,
        amount: (beforeRun.weeklyGross[beforeRun.weekIndex] ?? 0) * beforeRun.studioShare,
        origin: 'existing',
      })
    } else if (
      beforeRun === undefined &&
      afterRun.releaseTick === beforeTick.market.tick &&
      afterRun.economyModelVersion !== 0
    ) {
      expectedRows.push({
        productionId: afterRun.productionId,
        amount: (afterRun.weeklyGross[0] ?? 0) * afterRun.studioShare,
        origin: 'opening',
      })
    }
  }
  const ledgerRows = transitionLedgerRows.filter(
    (row) => row.kind === 'studioRevenue' || row.kind === 'boxOffice',
  )
  if (
    ledgerRows.length !== expectedRows.length ||
    expectedRows.some((expected, index) => {
      const actual = ledgerRows[index]
      return (
        actual?.kind !== 'studioRevenue' ||
        actual.productionId !== expected.productionId ||
        actual.amount !== expected.amount
      )
    })
  ) {
    throw new Error('roster-wall schema: scheduled theatrical receipts disagree with tick ledger')
  }
  let scheduledExistingReceipts = 0
  let scheduledOpeningReceipts = 0
  let scheduledTotal = 0
  for (const expected of expectedRows) {
    if (expected.origin === 'existing') scheduledExistingReceipts += expected.amount
    else scheduledOpeningReceipts += expected.amount
    scheduledTotal += expected.amount
  }
  if (scheduledExistingReceipts !== expectedWeeklyRunRevenue(beforeTick)) {
    throw new Error(
      'roster-wall schema: existing-run receipt schedule disagrees with the public revenue read model',
    )
  }
  let ledgerTotal = 0
  for (const row of ledgerRows) ledgerTotal += row.amount
  const delta = ledgerTotal - scheduledTotal
  if (delta !== 0) {
    throw new Error(
      `roster-wall schema: theatrical receipt reconciliation failed by ${String(delta)}`,
    )
  }
  return {
    scheduledExistingReceipts,
    scheduledOpeningReceipts,
    scheduledTotal,
    ledgerTotal,
    ledgerRowCount: ledgerRows.length,
    delta,
  }
}

export function rosterWallRoleCoverage(
  state: GameState,
  week: number = state.market.tick,
): Record<CreativeRole, number> {
  const activeIds = new Set(
    state.contracts
      .filter((contract) => contract.startWeek <= week && week < contract.endWeekExclusive)
      .map((contract) => contract.talentId),
  )
  const coverage: Record<CreativeRole, number> = {
    actor: 0,
    director: 0,
    writer: 0,
    craft: 0,
  }
  for (const talent of state.talent) {
    if (activeIds.has(talent.id)) coverage[talent.role]++
  }
  return coverage
}

export function rosterWallMissingFoundingRoles(
  coverage: Readonly<Record<CreativeRole, number>>,
): CreativeRole[] {
  const roles = ['actor', 'director', 'writer', 'craft'] as const
  return roles.filter((role) => coverage[role] < FOUNDING_MINIMUMS[role])
}

export function rosterWallEntryId(
  harvest: Pick<RosterWallEntryHarvest, 'seed' | 'operatingPolicyId' | 'estatePolicyId'>,
  foundingTermPolicyId: RosterWallFoundingTermPolicyId,
): string {
  const prefix = foundingTermPolicyId === 'all-208' ? 'maximum' : 'player'
  return `${prefix}.${harvest.seed}.${harvest.operatingPolicyId}.${harvest.estatePolicyId}.${foundingTermPolicyId}`
}

export type RosterWallEnvelopeInput = {
  recordType: RosterWallRecordType
  mode: RosterWallEvidenceMode
  source: RosterWallSourceProvenance
  harvest?: RosterWallEntryHarvest
  seed?: string | null
  operatingPolicyId?: RosterWallEntryHarvest['operatingPolicyId'] | null
  estatePolicyId?: RosterWallEstatePolicyDimension
  entryId?: string
  foundingTermPolicyId?: RosterWallFoundingTermPolicyId | null
  continuationPolicyId?: RosterContinuationPolicyId | null
  horizonWeeks?: number | null
  initialSaveHash?: string | null
  entryWeek?: number | null
  entrySaveHash?: string | null
  entryStateHash?: string | null
  week?: number | null
}

function assertAcceptedSource(source: RosterWallSourceProvenance): void {
  if (
    source.worktreeDirty !== false ||
    source.saveVersion !== 17 ||
    source.productionAuthorityCommit !== ROSTER_WALL_PRODUCTION_AUTHORITY ||
    source.branch.length === 0 ||
    source.commit.length === 0 ||
    source.tree.length === 0 ||
    source.runtime.length === 0 ||
    source.productionAuthorityTree.length === 0
  ) {
    throw new Error(
      'roster-wall schema: serialized evidence requires an accepted clean SaveFileV17 source',
    )
  }
}

export function rosterWallEnvelope(input: RosterWallEnvelopeInput): RosterWallCommonEnvelope {
  assertAcceptedSource(input.source)
  const harvest = input.harvest
  return {
    schemaVersion: ROSTER_WALL_OBSERVER_SCHEMA_VERSION,
    recordType: input.recordType,
    mode: input.mode,
    experimentId: ROSTER_WALL_EXPERIMENT_ID,
    seedSetId: ROSTER_WALL_SEED_SET_ID,
    seed: input.seed ?? harvest?.seed ?? null,
    operatingPolicyId:
      input.operatingPolicyId ?? harvest?.operatingPolicyId ?? null,
    estatePolicyId: input.estatePolicyId ?? harvest?.estatePolicyId ?? null,
    foundingTermPolicyId: input.foundingTermPolicyId ?? null,
    continuationPolicyId: input.continuationPolicyId ?? null,
    horizonWeeks: input.horizonWeeks ?? null,
    source: {
      ...input.source,
      authorityDiffPaths: [...input.source.authorityDiffPaths],
    },
    initialSaveHash: input.initialSaveHash ?? harvest?.initialSaveHash ?? null,
    entryId: input.entryId ?? null,
    entryWeek: input.entryWeek ?? harvest?.entryWeek ?? null,
    entrySaveHash: input.entrySaveHash ?? harvest?.entrySaveHash ?? null,
    entryStateHash: input.entryStateHash ?? harvest?.entryStateHash ?? null,
    week: input.week ?? null,
  }
}

const COMMON_ENVELOPE_KEYS = new Set<keyof RosterWallCommonEnvelope>([
  'schemaVersion',
  'recordType',
  'mode',
  'experimentId',
  'seedSetId',
  'seed',
  'operatingPolicyId',
  'estatePolicyId',
  'foundingTermPolicyId',
  'continuationPolicyId',
  'horizonWeeks',
  'source',
  'initialSaveHash',
  'entryId',
  'entryWeek',
  'entrySaveHash',
  'entryStateHash',
  'week',
])

/**
 * The one adapter used by every serialized roster-wall evidence row. It owns
 * the common envelope so a payload cannot omit, shadow, or relabel a governed
 * dimension. Non-applicable values therefore serialize as explicit `null`.
 */
export function rosterWallSerializedEvidenceRecord<TPayload extends object>(
  envelopeInput: RosterWallEnvelopeInput,
  payload: TPayload,
): RosterWallCommonEnvelope & TPayload {
  for (const key of Object.keys(payload)) {
    if (COMMON_ENVELOPE_KEYS.has(key as keyof RosterWallCommonEnvelope)) {
      throw new Error(
        `roster-wall schema: serialized payload may not override envelope field ${JSON.stringify(key)}`,
      )
    }
  }
  return {
    ...rosterWallEnvelope(envelopeInput),
    ...structuredClone(payload),
  }
}

/** Contract-wide discriminated union accepted by rows.jsonl. */
export type RosterWallSerializedEvidenceRecord =
  | RosterWallEntryRecord
  | RosterWallWindowShadowRecord
  | RosterWallPlayerPolicyEntryRecord
  | RosterWallPlayerPolicyWeeklyRecord
  | RosterWallPlayerPolicyRenewalIntentRecord
  | RosterWallPlayerPolicyBoundaryRecord
  | RosterWallMechanicsFixtureRow

export function makeRosterWallEntryRecord(
  harvest: RosterWallEntryHarvest,
  source: RosterWallSourceProvenance,
  foundingTermPolicyId: RosterWallFoundingTermPolicyId,
  mode: 'current' | 'player-policy',
): RosterWallEntryRecord {
  const entryId = rosterWallEntryId(harvest, foundingTermPolicyId)
  // `harvest.entrySave` is the live SaveFileV17 shape `harvestSave` produces, so
  // `.state` is already the live GameState core's `expectedWeeklyRunRevenue`
  // needs — no migration required. This read model does not serialize
  // `state.releaseAuthority` (it is not one of the fields below), so whether the
  // harvested entry carries a real release commitment is simply not represented
  // in this record.
  const state = harvest.entrySave.state
  const activeTheatricalRuns = state.theatricalRuns
    .filter((run) => run.status === 'active')
    .map((run) => structuredClone(run))
    .sort((a, b) => compareId(a.productionId, b.productionId))
  return rosterWallSerializedEvidenceRecord(
    {
      recordType: 'entry',
      mode,
      source,
      harvest,
      entryId,
      foundingTermPolicyId,
      week: harvest.entryWeek,
    },
    {
      cohort: harvest.cohort.map((member) => structuredClone(member)),
      cash: state.studio.cash,
      rngState: state.rngState,
      economyEngagedEver: state.economyEngagedEver,
      cashReconciliation: rosterWallCashReconciliation(state),
      ledger: state.ledger.map((entry) => ({ ...entry })),
      cashLedgerCheckpoint:
        state.cashLedgerCheckpoint === undefined
          ? null
          : { ...state.cashLedgerCheckpoint },
      activeReceipts: {
        expectedThisWeek: expectedWeeklyRunRevenue(state),
        theatricalRuns: activeTheatricalRuns,
      },
      activeCommitments: {
        productions: structuredClone(state.studio.activeProductions),
        screenplayProjects: structuredClone(
          state.scriptDevelopment.projects.filter(
            (project) => project.status !== 'produced',
          ),
        ),
        castingSessions: structuredClone(state.castingSessions.sessions),
      },
      construction: structuredClone(state.construction),
      placement: structuredClone(state.placement),
      operationsFacilities: structuredClone(state.operations.facilities),
      roleCoverage: rosterWallRoleCoverage(state),
      entryFileSha256: harvest.entrySaveHash,
      replay: { ...harvest.replay },
    },
  ) as RosterWallEntryRecord
}

export function makeRosterWallShadowRecords(
  harvest: RosterWallEntryHarvest,
  source: RosterWallSourceProvenance,
  foundingTermPolicyId: RosterWallFoundingTermPolicyId,
  entryId: string = rosterWallEntryId(harvest, foundingTermPolicyId),
): RosterWallWindowShadowRecord[] {
  return harvest.shadows.map(
    (warning) =>
      rosterWallSerializedEvidenceRecord(
        {
          recordType: 'windowShadow',
          mode: 'reference-shadow',
          source,
          harvest,
          entryId,
          foundingTermPolicyId,
          week: warning.week,
        },
        { warning: structuredClone(warning) },
      ) as RosterWallWindowShadowRecord,
  )
}

/** Canonical weekly salary projection used by entry/fixture schema tests. */
export function rosterWallCohortWeeklySalary(harvest: RosterWallEntryHarvest): number {
  return harvest.cohort.reduce(
    (total, member) => total + weeklySalary(member.annualSalary),
    0,
  )
}
