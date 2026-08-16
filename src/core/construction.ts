// Development & Casting Annex V1 — one fixed parcel, one fixed capital project,
// one monotonic completion. This module is pure: no RNG, wall clock, I/O, or
// caller-owned mutation. The constants below are the sole production authority
// for price, duration, and persisted identities.

import { assertCastingSessionsInvariants } from './castingSessions.js'
import {
  assertStudioOperationsInvariants,
  DEVELOPMENT_CASTING_ANNEX_FACILITY,
} from './operations.js'
import { TUNING } from './tuning.js'
import { assertScriptDevelopmentInvariants } from './scriptDevelopment.js'
import { persistedProductionIds } from './productionIdentity.js'
import type {
  CashLedgerCheckpoint,
  ConstructionProject,
  GameState,
  LedgerEntry,
  StudioConstruction,
  StudioFacility,
  StudioOperations,
} from './types.js'

export const ANNEX_PARCEL_ID = 'expansion' as const
export const ANNEX_PROJECT_ID = 'construction-development-casting-annex' as const
export const ANNEX_PROJECT_KIND = 'development-casting-annex' as const
export const ANNEX_FACILITY_ID = DEVELOPMENT_CASTING_ANNEX_FACILITY.id
export const ANNEX_NAME = DEVELOPMENT_CASTING_ANNEX_FACILITY.name
export const ANNEX_CAPEX = 780_000 as const
export const ANNEX_DURATION_WEEKS = 13 as const
export const ANNEX_CAPACITY_GAIN = DEVELOPMENT_CASTING_ANNEX_FACILITY.capacity
export const ANNEX_LEDGER_NOTE = 'Development & Casting Annex construction' as const

const ANNEX_RESERVED_IDS = [
  ANNEX_PARCEL_ID,
  ANNEX_PROJECT_ID,
  ANNEX_FACILITY_ID,
] as const

// V10 migration must preserve even an adversarial historical production ID, so
// a vacant V11 state is not intrinsically invalid. Starting the Annex reserves
// all three canonical IDs, however, and a building/completed V11 state may never
// coexist with production history that already owns one of them.
export function annexCanonicalProductionIdCollision(state: GameState): string | null {
  const productionIds = persistedProductionIds(state)
  return ANNEX_RESERVED_IDS.find((id) => productionIds.has(id)) ?? null
}

export function emptyStudioConstruction(): StudioConstruction {
  return { mode: 'legacy', parcels: [], projects: [] }
}

export function initialManagedStudioConstruction(): StudioConstruction {
  return {
    mode: 'managed',
    parcels: [{ id: ANNEX_PARCEL_ID, projectId: null }],
    projects: [],
  }
}

function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`construction invariant: ${message}`)
}

/**
 * Produce the one truthful V11 reconciliation checkpoint only when a frozen
 * historical state cannot reconcile from INITIAL_CASH. The checkpoint sits at
 * the end of the validated historical ledger: migration invents no transaction
 * and all V11-era movements remain exactly provable as an ordered suffix.
 */
export function historicalCashLedgerCheckpoint(
  cash: number,
  ledger: readonly LedgerEntry[],
): CashLedgerCheckpoint | undefined {
  const fullHistoryCash = ledger.reduce<number>(
    (sum, entry) => sum + entry.amount,
    TUNING.INITIAL_CASH,
  )
  return cash === fullHistoryCash
    ? undefined
    : { cash, ledgerLength: ledger.length }
}

function isExactAnnexFacility(operations: StudioOperations): boolean {
  const matches = operations.facilities.filter((facility) => facility.id === ANNEX_FACILITY_ID)
  if (matches.length !== 1) return false
  const facility = matches[0]!
  return (
    facility.name === DEVELOPMENT_CASTING_ANNEX_FACILITY.name &&
    facility.capability === DEVELOPMENT_CASTING_ANNEX_FACILITY.capability &&
    facility.capacity === DEVELOPMENT_CASTING_ANNEX_FACILITY.capacity
  )
}

export type ConstructionInvariantOptions = {
  // `configured` exists only so the committed research observatory can continue
  // projecting arbitrary counterfactual capacity. SaveFileV11 always uses the
  // default exact Annex V1 policy; SaveFileV12 always uses `placement-v12`.
  facilityPolicy?: 'annex-v1' | 'configured' | 'placement-v12'
  // Supplied with `placement-v12`: the exact operational placed facilities that
  // must follow the initial five, in the order the weekly completion pass appends
  // them. The placement authority owns that list; this checker only enforces it.
  // OMITTING it selects the research observatory's configured-capacity arm, the
  // same behaviour-neutral escape hatch the V11 `configured` policy provided.
  expectedFacilities?: readonly StudioFacility[]
}

// Shared action/tick/read/save boundary. Outer exact-key checking belongs to the
// save validator; this checker owns lifecycle, accounting, and facility truth.
export function assertStudioConstructionInvariants(
  state: GameState,
  options?: ConstructionInvariantOptions,
): void {
  const { construction, operations } = state
  invariant(construction.mode === operations.mode, 'construction mode must equal operations mode')

  // Placement Core V12 owns the capital-project catalog, so under its policy the
  // capex row's project identity, price, and note are proved against the placement
  // record instead of the single canonical Annex project. Everything else in this
  // checker — the retired construction root, cash reconciliation, and the shared
  // script/casting law — is enforced identically under both policies.
  const placementOwned = (options?.facilityPolicy ?? 'annex-v1') === 'placement-v12'

  const constructionRows = state.ledger.filter((entry) => entry.kind === 'constructionCapex')
  for (const entry of state.ledger) {
    if (entry.kind === 'constructionCapex') {
      if (placementOwned) continue
      invariant(
        entry.constructionProjectId === ANNEX_PROJECT_ID,
        'construction capex must identify the canonical project',
      )
      invariant(entry.talentId === undefined, 'construction capex cannot identify talent')
      invariant(entry.productionId === undefined, 'construction capex cannot identify a production')
      invariant(entry.note === ANNEX_LEDGER_NOTE, 'construction capex note must equal the canonical note')
    } else {
      invariant(
        !Object.prototype.hasOwnProperty.call(entry, 'constructionProjectId'),
        `ledger kind "${entry.kind}" cannot carry constructionProjectId`,
      )
    }
  }

  const annexFacilities = operations.facilities.filter(
    (facility) => facility.id === ANNEX_FACILITY_ID,
  )

  if (placementOwned) {
    // The V11 fixed-parcel project lifecycle has RETIRED into `state.placement`.
    // What survives here is the mode and the legacy parcel registry, kept so the
    // V11 root's shape (and every read model over it) stays valid across the bump.
    invariant(
      construction.projects.length === 0,
      'SaveFileV12 retires the V11 construction project root; placement owns every project',
    )
    if (construction.mode === 'legacy') {
      invariant(construction.parcels.length === 0, 'legacy mode must have no parcels')
    } else {
      invariant(construction.mode === 'managed', `unknown mode ${String(construction.mode)}`)
      invariant(construction.parcels.length === 1, 'managed mode must have exactly one parcel')
      const parcel = construction.parcels[0]!
      invariant(parcel.id === ANNEX_PARCEL_ID, 'managed parcel id must be expansion')
      invariant(
        parcel.projectId === null,
        'SaveFileV12 retires the V11 parcel/project link; placement owns occupancy',
      )
    }
    const expectedFacilities = options?.expectedFacilities
    assertStudioOperationsInvariants(
      operations,
      state.studio.activeProductions,
      expectedFacilities === undefined
        ? { facilityPolicy: 'configured' }
        : { facilityPolicy: 'placement-v12', placedFacilities: expectedFacilities },
    )
  } else if (construction.mode === 'legacy') {
    invariant(construction.parcels.length === 0, 'legacy mode must have no parcels')
    invariant(construction.projects.length === 0, 'legacy mode must have no projects')
    invariant(annexFacilities.length === 0, 'legacy mode cannot have an Annex facility')
    invariant(constructionRows.length === 0, 'legacy mode cannot have construction capex')
    assertStudioOperationsInvariants(operations, state.studio.activeProductions)
  } else {
    invariant(construction.mode === 'managed', `unknown mode ${String(construction.mode)}`)
    invariant(construction.parcels.length === 1, 'managed mode must have exactly one parcel')
    const parcel = construction.parcels[0]!
    invariant(parcel.id === ANNEX_PARCEL_ID, 'managed parcel id must be expansion')
    invariant(construction.projects.length <= 1, 'managed mode permits at most one project')

    const project = construction.projects[0]
    if (project === undefined) {
      invariant(parcel.projectId === null, 'vacant parcel projectId must be null')
      invariant(annexFacilities.length === 0, 'vacant parcel cannot have an Annex facility')
      invariant(constructionRows.length === 0, 'vacant parcel cannot have construction capex')
    } else {
      const identityCollision = annexCanonicalProductionIdCollision(state)
      invariant(
        identityCollision === null,
        `canonical Annex id ${JSON.stringify(identityCollision)} collides with persisted production history`,
      )
      invariant(project.id === ANNEX_PROJECT_ID, 'project id is not canonical')
      invariant(project.kind === ANNEX_PROJECT_KIND, 'project kind is not canonical')
      invariant(project.parcelId === ANNEX_PARCEL_ID, 'project parcel id is not canonical')
      invariant(project.facilityId === ANNEX_FACILITY_ID, 'project facility id is not canonical')
      invariant(project.capex === ANNEX_CAPEX, 'project capex is not canonical')
      invariant(
        Number.isInteger(project.startedWeek) && project.startedWeek >= 0,
        'startedWeek must be a non-negative integer',
      )
      invariant(
        Number.isInteger(project.dueWeek) &&
          project.dueWeek === project.startedWeek + ANNEX_DURATION_WEEKS,
        'dueWeek must equal startedWeek + 13',
      )
      invariant(parcel.projectId === project.id, 'project must permanently own its parcel')
      invariant(constructionRows.length === 1, 'a project requires exactly one construction-capex row')
      const capex = constructionRows[0]!
      invariant(capex.week === project.startedWeek, 'construction capex week must equal startedWeek')
      invariant(capex.amount === -ANNEX_CAPEX, 'construction capex amount must be -780000')
      invariant(capex.note === ANNEX_LEDGER_NOTE, 'construction capex note is not canonical')

      if (project.status === 'building') {
        invariant(project.completedWeek === null, 'building project completedWeek must be null')
        invariant(
          project.startedWeek <= state.market.tick && state.market.tick < project.dueWeek,
          'building project clock must satisfy startedWeek <= currentWeek < dueWeek',
        )
        invariant(annexFacilities.length === 0, 'building project cannot have an Annex facility')
      } else {
        invariant(project.status === 'completed', `unknown project status ${String(project.status)}`)
        const annexAvailableWeek = project.completedWeek
        invariant(
          annexAvailableWeek === project.dueWeek,
          'completedWeek must equal the committed dueWeek',
        )
        invariant(project.dueWeek <= state.market.tick, 'completed project cannot be in the future')
        invariant(annexFacilities.length === 1, 'completed project must have exactly one Annex facility')
        invariant(isExactAnnexFacility(operations), 'completed Annex facility differs from canonical truth')

        // The Annex is appended only after allocations on its completing
        // advance. A V11 save may not retroactively move work that started
        // before that visible-week boundary onto the new facility.
        for (const workflow of operations.workflows) {
          if (!workflow.reservations.some((reservation) => reservation.facilityId === ANNEX_FACILITY_ID)) {
            continue
          }
          const production = state.studio.activeProductions.find(
            (candidate) => candidate.id === workflow.productionId,
          )
          const elapsedProgress =
            production === undefined
              ? Number.POSITIVE_INFINITY
              : TUNING.PRODUCTION_TICKS - production.remainingTicks
          const productionDebits = state.ledger.filter(
            (entry) =>
              entry.kind === 'production' &&
              entry.productionId === workflow.productionId,
          )
          // `startTick` is reservation-time evidence only for workflows that
          // actually claim the Annex. Bound its relation to the stored countdown
          // here so a forged save cannot move that clock forward to launder a
          // pre-completion allocation. Non-Annex historical states remain under
          // their existing compatibility law.
          invariant(
            production !== undefined &&
              Number.isInteger(production.startTick) &&
              production.startTick >= 0 &&
              production.startTick <= state.market.tick,
            `production "${workflow.productionId}" has an invalid or future startTick`,
          )
          invariant(
            Number.isInteger(production.remainingTicks) &&
              production.remainingTicks >= 1 &&
              production.remainingTicks <= TUNING.PRODUCTION_TICKS,
            `production "${workflow.productionId}" has an invalid remainingTicks`,
          )
          invariant(
            elapsedProgress <= state.market.tick - production.startTick,
            `production "${workflow.productionId}" advanced farther than its startTick permits`,
          )
          invariant(
            productionDebits.length === 1 &&
              productionDebits[0]!.week === production.startTick,
            `production "${workflow.productionId}" Annex reservation disagrees with its authoritative greenlight week`,
          )
          invariant(
            productionDebits[0]!.week >= annexAvailableWeek,
            `production "${workflow.productionId}" cannot reserve the Annex before Week ${String(annexAvailableWeek)}`,
          )
        }
        for (const screenplay of state.scriptDevelopment.projects) {
          if (screenplay.reservation?.facilityId !== ANNEX_FACILITY_ID) continue
          const reservationWeek =
            screenplay.status === 'drafting'
              ? screenplay.commissionedWeek
              : screenplay.status === 'rewriting' && screenplay.dueWeek !== null
                ? screenplay.dueWeek - 1
                : -1
          invariant(
            reservationWeek >= annexAvailableWeek,
            `screenplay "${screenplay.id}" cannot reserve the Annex before Week ${String(annexAvailableWeek)}`,
          )
        }
        for (const session of state.castingSessions.sessions) {
          if (session.reservation?.facilityId !== ANNEX_FACILITY_ID) continue
          invariant(
            session.startedWeek >= annexAvailableWeek,
            `casting session "${session.id}" cannot reserve the Annex before Week ${String(annexAvailableWeek)}`,
          )
        }
      }
    }

    if ((options?.facilityPolicy ?? 'annex-v1') === 'configured') {
      assertStudioOperationsInvariants(operations, state.studio.activeProductions, {
        facilityPolicy: 'configured',
      })
    } else {
      assertStudioOperationsInvariants(operations, state.studio.activeProductions, {
        facilityPolicy: 'annex-v1',
        annexOperational: project?.status === 'completed',
      })
    }
  }

  // Re-run the two existing shared authorities over the now-verified facility
  // set. Casting's occupancy seed includes productions and active screenplay
  // work, so this is the canonical three-owner collision proof after Annex V1.
  // Calendar has always been a canonical projection over otherwise-valid stored
  // arrays regardless of their presentation order. Validate an ordered, immutable
  // projection here so Annex V1 retains that read-model law; the exact save
  // validators separately enforce persisted array order before reaching us.
  const orderedScriptDevelopment = {
    ...state.scriptDevelopment,
    projects: [...state.scriptDevelopment.projects].sort((a, b) =>
      a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
    ),
  }
  const orderedCastingSessions = {
    ...state.castingSessions,
    sessions: [...state.castingSessions.sessions].sort((a, b) =>
      a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
    ),
  }
  assertScriptDevelopmentInvariants(orderedScriptDevelopment, {
    currentWeek: state.market.tick,
    concepts: state.concepts,
    talent: state.talent,
    contracts: state.contracts,
    operations: state.operations,
    activeProductions: state.studio.activeProductions,
    releasedFilms: state.studio.releasedFilms,
  })
  assertCastingSessionsInvariants(orderedCastingSessions, {
    currentWeek: state.market.tick,
    operations: state.operations,
    scriptDevelopment: orderedScriptDevelopment,
    talent: state.talent,
  })

  // Native and already-reconciled histories retain the original full-ledger
  // identity. A migrated pre-ledger history may carry one exact checkpoint at
  // the end of its validated historical prefix; every V11-era movement,
  // especially construction capex, must remain in the reconciled suffix.
  const checkpoint = state.cashLedgerCheckpoint
  let ledgerStart = 0
  let ledgerCash: number = TUNING.INITIAL_CASH
  if (checkpoint !== undefined) {
    invariant(
      checkpoint !== null && typeof checkpoint === 'object',
      'cash-ledger checkpoint must be an object',
    )
    invariant(
      Number.isFinite(checkpoint.cash),
      'cash-ledger checkpoint cash must be finite',
    )
    invariant(
      Number.isInteger(checkpoint.ledgerLength) && checkpoint.ledgerLength >= 0,
      'cash-ledger checkpoint length must be a non-negative integer',
    )
    invariant(
      checkpoint.ledgerLength <= state.ledger.length,
      'cash-ledger checkpoint cannot extend beyond the ordered ledger',
    )

    const historicalPrefixCash = state.ledger
      .slice(0, checkpoint.ledgerLength)
      .reduce<number>((sum, entry) => sum + entry.amount, TUNING.INITIAL_CASH)
    invariant(
      checkpoint.cash !== historicalPrefixCash,
      'cash-ledger checkpoint must encode a genuine historical reconciliation boundary',
    )
    invariant(
      state.ledger
        .slice(0, checkpoint.ledgerLength)
        .every((entry) => entry.kind !== 'constructionCapex'),
      'construction capex cannot predate the V11 cash-ledger checkpoint',
    )
    ledgerStart = checkpoint.ledgerLength
    ledgerCash = checkpoint.cash
  }
  for (let i = ledgerStart; i < state.ledger.length; i++) {
    ledgerCash += state.ledger[i]!.amount
  }
  invariant(
    Number.isFinite(state.studio.cash) && state.studio.cash === ledgerCash,
    checkpoint === undefined
      ? 'studio cash must equal initial cash plus the ordered ledger'
      : 'studio cash must equal the historical checkpoint plus the ordered post-checkpoint ledger',
  )
}

export type ConstructionCompletion = {
  construction: StudioConstruction
  operations: StudioOperations
  completed: boolean
}

// Called exactly once in the weekly pipeline, after script/casting/production
// allocation. It never reallocates existing work and adds no ledger entry.
export function completeDueConstruction(
  construction: StudioConstruction,
  operations: StudioOperations,
  arrivalWeek: number,
): ConstructionCompletion {
  if (construction.mode === 'legacy' || construction.projects.length === 0) {
    return { construction, operations, completed: false }
  }
  const project = construction.projects[0]!
  if (project.status === 'completed' || project.dueWeek > arrivalWeek) {
    return { construction, operations, completed: false }
  }
  if (project.dueWeek < arrivalWeek) {
    throw new Error(
      `tick: Annex construction missed its committed completion week ${String(project.dueWeek)}`,
    )
  }
  if (operations.mode !== 'managed') {
    throw new Error('tick: Annex construction cannot complete outside managed operations')
  }
  if (operations.facilities.some((facility) => facility.id === ANNEX_FACILITY_ID)) {
    throw new Error('tick: Annex construction found its reserved facility id already in use')
  }

  const completedProject: ConstructionProject = {
    ...project,
    status: 'completed',
    completedWeek: arrivalWeek,
  }
  return {
    construction: {
      ...construction,
      parcels: construction.parcels.map((parcel) => ({ ...parcel })),
      projects: [completedProject],
    },
    operations: {
      ...operations,
      facilities: [
        ...operations.facilities,
        { ...DEVELOPMENT_CASTING_ANNEX_FACILITY },
      ],
    },
    completed: true,
  }
}
