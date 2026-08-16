// ── Placement Core V12 ───────────────────────────────────────────────────────
// The single construction authority. One authored parcel map (lot.ts), one TUNING
// blueprint catalog, one pure legality query, one commit that re-runs that query
// before it charges anything, one weekly completion pass, and one weekly operating
// charge. This module is pure: no RNG, no wall clock, no I/O, no caller-owned
// mutation, and it consumes ZERO bytes of `state.rngState`.
//
// THE RUNNER INVARIANT (CODE-MINING-LEDGER Entry 2, clean-room): `commitPlacement`
// calls `queryPlacement` itself and aborts on any rejection. There is exactly one
// implementation of legality and exactly one source of the charged cost — a caller
// (or a UI) can never supply either. A rejected commit returns the SAME state
// object by reference, so a refused build is provably byte-neutral.
//
// EVALUATE EVERY CELL (Entry 3): the query never fails fast. Every footprint cell
// gets its own verdict so a preview can paint green/red per cell, and `rejections`
// is the ordered set of every rule that failed. `primary` is the first rule in the
// binding order, which is why insufficient funds — always last — can never mask a
// domain failure.
//
// GHOSTS ARE REJECTED (Entry 2's cautionary tale): nothing here inserts a preview
// into simulation state. A preview is a pure query the UI runs per cursor move.

import { canAfford, economyEngaged, type Affordability } from './employment.js'
import { assertStudioConstructionInvariants } from './construction.js'
import {
  LEGACY_EXPANSION_PARCEL_ID,
  LOT_DEPTH,
  LOT_PARCELS,
  LOT_WIDTH,
  cellKey,
  isOnLot,
  parcelAt,
  parcelById,
  parcelHasRoadFrontage,
  placementWouldSeverLot,
} from './lot.js'
import {
  DEVELOPMENT_CASTING_ANNEX_BLUEPRINT,
  FACILITY_BLUEPRINTS,
  FACILITY_OPEX_LEDGER_NOTE,
} from './tuning.js'
import type {
  FacilityBlueprint,
  GameState,
  LedgerEntry,
  LotCell,
  LotParcel,
  PlacedFacility,
  PlacementCellVerdict,
  PlacementQuote,
  PlacementRejection,
  PlacementRequest,
  StudioFacility,
  StudioOperations,
  StudioPlacement,
} from './types.js'

/** The binding legality order. `primary` is the first entry present. */
export const PLACEMENT_REJECTION_ORDER: readonly PlacementRejection[] = [
  'unknownBlueprint',
  'offLot',
  'notOwned',
  'terrainUnbuildable',
  'occupied',
  'clearanceRing',
  'noRoadAccess',
  'seversLot',
  'insufficientFunds',
]

export function emptyStudioPlacement(): StudioPlacement {
  return { mode: 'legacy', nextPlacementId: 1, facilities: [] }
}

export function initialManagedStudioPlacement(): StudioPlacement {
  return { mode: 'managed', nextPlacementId: 1, facilities: [] }
}

export function blueprintById(blueprintId: string): FacilityBlueprint | null {
  for (const blueprint of FACILITY_BLUEPRINTS) {
    if (blueprint.id === blueprintId) return blueprint
  }
  return null
}

/**
 * The footprint's cells in fixed reading order (ascending gy, then gx). Flat grid:
 * no Z, no slopes, no rotation — the blueprint's rectangle is placed as authored.
 */
export function footprintCells(blueprint: FacilityBlueprint, origin: LotCell): LotCell[] {
  const cells: LotCell[] = []
  for (let dy = 0; dy < blueprint.footprint.depth; dy++) {
    for (let dx = 0; dx < blueprint.footprint.width; dx++) {
      cells.push({ gx: origin.gx + dx, gy: origin.gy + dy })
    }
  }
  return cells
}

/**
 * The occupancy index — DERIVED from placed facilities on every read and never
 * persisted (CODE-MINING-LEDGER Entry 3's standing law). Membership only; nothing
 * iterates it, so its insertion order is never observable.
 */
export function occupiedCellKeys(placement: StudioPlacement): ReadonlySet<string> {
  const keys = new Set<string>()
  for (const facility of placement.facilities) {
    for (const cell of facility.cells) keys.add(cellKey(cell))
  }
  return keys
}

/** The StudioFacility one operational placement contributes. Fully derived. */
export function placedStudioFacility(placed: PlacedFacility): StudioFacility {
  const blueprint = blueprintById(placed.blueprintId)
  if (blueprint === null) {
    throw new Error(`placement: placed facility ${String(placed.id)} references unknown blueprint "${placed.blueprintId}"`)
  }
  return {
    id: placed.facilityId,
    name:
      placed.facilityId === blueprint.facilityIdBase
        ? blueprint.name
        : `${blueprint.name} ${String(placed.id)}`,
    capability: blueprint.capability,
    capacity: blueprint.capacity,
  }
}

/**
 * The operational placed facilities in the exact order the weekly completion pass
 * appends them: ascending completion week, then ascending placement id. The
 * facility-set invariant compares `operations.facilities` against
 * INITIAL_STUDIO_FACILITIES followed by this list, index for index.
 */
export function operationalPlacedFacilities(placement: StudioPlacement): PlacedFacility[] {
  return placement.facilities
    .filter((facility) => facility.status === 'operational')
    .sort((a, b) => (a.completesWeek !== b.completesWeek ? a.completesWeek - b.completesWeek : a.id - b.id))
}

/** Σ weekly operating cost of every OPERATIONAL placed facility. */
export function weeklyPlacementOperatingCost(placement: StudioPlacement): number {
  let total = 0
  for (const facility of placement.facilities) {
    if (facility.status !== 'operational') continue
    const blueprint = blueprintById(facility.blueprintId)
    if (blueprint === null) {
      throw new Error(`placement: operating cost references unknown blueprint "${facility.blueprintId}"`)
    }
    total += blueprint.weeklyOperatingCost
  }
  return total
}

/**
 * The regime a commit requires: managed operations AND managed placement AND an
 * engaged economy AND a founded studio. This is deliberately NOT a
 * `PlacementRejection` — the nine codes describe the placement itself, which is
 * what a build-mode preview asks about. Regime failures are caller errors: the
 * ACTION layer throws on them (like every other action), and the pure helper
 * returns the state unchanged so it can never half-apply.
 */
export function placementRegimeReady(state: GameState): boolean {
  return (
    state.placement.mode === 'managed' &&
    state.operations.mode === 'managed' &&
    state.founding === null &&
    economyEngaged(state)
  )
}

function distinctParcels(cells: readonly LotCell[]): LotParcel[] {
  const seen = new Set<string>()
  const parcels: LotParcel[] = []
  for (const cell of cells) {
    const parcel = parcelAt(cell)
    if (parcel === null || seen.has(parcel.id)) continue
    seen.add(parcel.id)
    parcels.push(parcel)
  }
  return parcels
}

/** The clearance cells around a footprint, in fixed reading order. */
export function clearanceRingCells(
  cells: readonly LotCell[],
  ring: number,
): LotCell[] {
  if (ring <= 0 || cells.length === 0) return []
  let x0 = Number.POSITIVE_INFINITY
  let y0 = Number.POSITIVE_INFINITY
  let x1 = Number.NEGATIVE_INFINITY
  let y1 = Number.NEGATIVE_INFINITY
  for (const cell of cells) {
    if (cell.gx < x0) x0 = cell.gx
    if (cell.gy < y0) y0 = cell.gy
    if (cell.gx > x1) x1 = cell.gx
    if (cell.gy > y1) y1 = cell.gy
  }
  const own = new Set(cells.map(cellKey))
  const out: LotCell[] = []
  for (let gy = y0 - ring; gy <= y1 + ring; gy++) {
    for (let gx = x0 - ring; gx <= x1 + ring; gx++) {
      const cell = { gx, gy }
      if (own.has(cellKey(cell)) || !isOnLot(cell)) continue
      out.push(cell)
    }
  }
  return out
}

function orderedRejections(found: ReadonlySet<PlacementRejection>): PlacementRejection[] {
  return PLACEMENT_REJECTION_ORDER.filter((code) => found.has(code))
}

/**
 * Pure legality + price. NEVER throws on an illegal request — illegality is
 * reported, which is the whole point of a preview. (A malformed GameState is a
 * different matter and is caught by the invariant checker at the action, tick,
 * and save boundaries.)
 */
export function queryPlacement(state: GameState, request: PlacementRequest): PlacementQuote {
  const origin = { gx: request.origin.gx, gy: request.origin.gy }
  const blueprint = blueprintById(request.blueprintId)
  if (blueprint === null) {
    return {
      ok: false,
      blueprintId: request.blueprintId,
      origin,
      parcelId: null,
      cells: [],
      cellLegality: [],
      cost: 0,
      weeklyOperatingCost: 0,
      buildWeeks: 0,
      completesOnWeek: state.market.tick,
      capability: null,
      capacityDelta: 0,
      rejections: ['unknownBlueprint'],
      primary: 'unknownBlueprint',
    }
  }

  const cells = footprintCells(blueprint, origin)
  const occupied = occupiedCellKeys(state.placement)
  const found = new Set<PlacementRejection>()

  // Per-cell legality, in the binding per-cell order. Every cell is evaluated.
  const cellLegality: PlacementCellVerdict[] = cells.map((cell) => {
    let rejection: PlacementRejection | null = null
    if (!isOnLot(cell)) {
      rejection = 'offLot'
    } else {
      const parcel = parcelAt(cell)
      if (parcel === null) rejection = 'notOwned'
      else if (parcel.terrain !== 'buildable') rejection = 'terrainUnbuildable'
      else if (occupied.has(cellKey(cell))) rejection = 'occupied'
    }
    if (rejection !== null) found.add(rejection)
    return { cell, ok: rejection === null, rejection }
  })

  // Clearance ring — other placed facilities may not sit inside it.
  for (const cell of clearanceRingCells(cells, blueprint.clearanceRing)) {
    if (occupied.has(cellKey(cell))) {
      found.add('clearanceRing')
      break
    }
  }

  // Road access is a property of the SITE: at least one owning parcel must front
  // a road. A footprint on no owned parcel at all trivially has no frontage.
  if (blueprint.requiresRoadAccess) {
    const parcels = distinctParcels(cells)
    if (!parcels.some((parcel) => parcelHasRoadFrontage(parcel))) found.add('noRoadAccess')
  }

  // The perimeter walk. Always evaluated; never short-circuited.
  if (placementWouldSeverLot(occupied, cells)) found.add('seversLot')

  // Money LAST — a domain failure always outranks affordability.
  if (!canAfford(state, blueprint.capex).ok) found.add('insufficientFunds')

  const rejections = orderedRejections(found)
  const originParcel = parcelAt(origin)
  return {
    ok: rejections.length === 0,
    blueprintId: blueprint.id,
    origin,
    parcelId: originParcel === null ? null : originParcel.id,
    cells,
    cellLegality,
    cost: blueprint.capex,
    weeklyOperatingCost: blueprint.weeklyOperatingCost,
    buildWeeks: blueprint.buildWeeks,
    completesOnWeek: state.market.tick + blueprint.buildWeeks,
    capability: blueprint.capability,
    capacityDelta: blueprint.capacity,
    rejections,
    primary: rejections[0] ?? null,
  }
}

function deriveIdentity(base: string, placementId: number, taken: ReadonlySet<string>): string {
  return taken.has(base) ? `${base}-${String(placementId)}` : base
}

/** Every facility id already spoken for, from both live authorities. */
function takenFacilityIds(state: GameState): ReadonlySet<string> {
  const taken = new Set<string>()
  for (const facility of state.operations.facilities) taken.add(facility.id)
  for (const placed of state.placement.facilities) taken.add(placed.facilityId)
  return taken
}

/** Every construction project id already spoken for, ledger included (law 20). */
function takenProjectIds(state: GameState): ReadonlySet<string> {
  const taken = new Set<string>()
  for (const entry of state.ledger) {
    if (entry.kind === 'constructionCapex') taken.add(entry.constructionProjectId)
  }
  for (const placed of state.placement.facilities) taken.add(placed.projectId)
  for (const project of state.construction.projects) taken.add(project.id)
  return taken
}

/**
 * Commit a placement. Re-queries internally, returns the SAME state by reference
 * on any rejection, and charges the cost the query computed — never a caller's.
 */
export function commitPlacement(state: GameState, request: PlacementRequest): GameState {
  if (!placementRegimeReady(state)) return state
  const quote = queryPlacement(state, request)
  if (!quote.ok) return state
  const blueprint = blueprintById(quote.blueprintId)
  if (blueprint === null) return state

  const id = state.placement.nextPlacementId
  const parcel = parcelAt(quote.origin)
  if (parcel === null) return state // unreachable: an ok quote owns its origin

  const facilityId = deriveIdentity(blueprint.facilityIdBase, id, takenFacilityIds(state))
  const projectId = deriveIdentity(blueprint.projectIdBase, id, takenProjectIds(state))
  const placed: PlacedFacility = {
    id,
    blueprintId: blueprint.id,
    parcelId: parcel.id,
    origin: quote.origin,
    cells: quote.cells,
    facilityId,
    projectId,
    status: 'underConstruction',
    placedWeek: state.market.tick,
    completesWeek: quote.completesOnWeek,
  }
  const entry: LedgerEntry = {
    week: state.market.tick,
    kind: 'constructionCapex',
    amount: -quote.cost,
    constructionProjectId: projectId,
    note: blueprint.ledgerNote,
  }

  return {
    ...state,
    studio: { ...state.studio, cash: state.studio.cash - quote.cost },
    ledger: [...state.ledger, entry],
    placement: {
      ...state.placement,
      nextPlacementId: id + 1,
      // Stored in ascending id order — ids are monotonic, so appending preserves it.
      facilities: [...state.placement.facilities, placed],
    },
  }
}

export type PlacementCompletion = {
  placement: StudioPlacement
  operations: StudioOperations
  completed: PlacedFacility[]
}

/**
 * The weekly completion pass. Runs BEFORE any capacity aggregation, exactly where
 * the V11 Annex completion ran: a site occupies land and contributes ZERO capacity
 * until this flips it (Entry 3's "capacity gated on is_active, not existence").
 * Completions within a week are applied in ascending placement id.
 */
export function completeDuePlacements(
  placement: StudioPlacement,
  operations: StudioOperations,
  arrivalWeek: number,
): PlacementCompletion {
  if (placement.mode !== 'managed' || placement.facilities.length === 0) {
    return { placement, operations, completed: [] }
  }
  const due = placement.facilities
    .filter((facility) => facility.status === 'underConstruction' && facility.completesWeek <= arrivalWeek)
    .sort((a, b) => a.id - b.id)
  if (due.length === 0) return { placement, operations, completed: [] }

  if (operations.mode !== 'managed') {
    throw new Error('tick: a placed facility cannot complete outside managed operations')
  }
  const facilities = [...operations.facilities]
  const completedIds = new Set<number>()
  const completed: PlacedFacility[] = []
  for (const facility of due) {
    if (facility.completesWeek < arrivalWeek) {
      throw new Error(
        `tick: placed facility ${String(facility.id)} missed its committed completion week ${String(facility.completesWeek)}`,
      )
    }
    if (facilities.some((existing) => existing.id === facility.facilityId)) {
      throw new Error(
        `tick: placed facility ${String(facility.id)} found its reserved facility id "${facility.facilityId}" already in use`,
      )
    }
    const completedFacility: PlacedFacility = { ...facility, status: 'operational' }
    completedIds.add(facility.id)
    completed.push(completedFacility)
    facilities.push(placedStudioFacility(completedFacility))
  }

  return {
    placement: {
      ...placement,
      facilities: placement.facilities.map((facility) =>
        completedIds.has(facility.id) ? { ...facility, status: 'operational' } : facility,
      ),
    },
    operations: { ...operations, facilities },
    completed,
  }
}

// ── invariants ───────────────────────────────────────────────────────────────

function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`placement invariant: ${message}`)
}

/** The opex a week SHOULD have been charged, from the durable placement record. */
export function expectedWeeklyOperatingCostAt(placement: StudioPlacement, week: number): number {
  let total = 0
  for (const facility of placement.facilities) {
    if (facility.completesWeek > week) continue
    const blueprint = blueprintById(facility.blueprintId)
    if (blueprint === null) continue
    total += blueprint.weeklyOperatingCost
  }
  return total
}

/**
 * The V12 whole-state authority. Owns the placement root, the construction/opex
 * ledger correlations, and the exact operational facility set; delegates the
 * shared cash, script, and casting law to the construction checker under its
 * placement policy, which is also what proves the V11 construction root has
 * genuinely retired (empty projects, vacant parcel).
 */
export function assertStudioPlacementInvariants(state: GameState): void {
  const { placement, operations } = state
  invariant(
    placement.mode === operations.mode,
    'placement mode must equal operations mode',
  )
  invariant(
    Number.isInteger(placement.nextPlacementId) && placement.nextPlacementId >= 1,
    'nextPlacementId must be a positive integer',
  )

  const capexRows = state.ledger.filter((entry) => entry.kind === 'constructionCapex')
  const opexRows = state.ledger.filter((entry) => entry.kind === 'facilityOpex')

  if (placement.mode === 'legacy') {
    invariant(placement.facilities.length === 0, 'legacy mode must have no placed facilities')
    invariant(placement.nextPlacementId === 1, 'legacy mode must not have reserved any id')
    invariant(capexRows.length === 0, 'legacy mode cannot have construction capex')
    invariant(opexRows.length === 0, 'legacy mode cannot have facility operating cost')
    assertStudioConstructionInvariants(state, {
      facilityPolicy: 'placement-v12',
      expectedFacilities: [],
    })
    return
  }

  invariant(placement.mode === 'managed', `unknown placement mode ${String(placement.mode)}`)

  const facilityIds = new Set<string>()
  const projectIds = new Set<string>()
  const cellOwner = new Map<string, number>()
  let previousId = 0
  for (const placed of placement.facilities) {
    const label = `placed facility ${String(placed.id)}`
    invariant(Number.isInteger(placed.id) && placed.id >= 1, `${label} id must be a positive integer`)
    invariant(placed.id > previousId, `${label} breaks ascending placement id order`)
    previousId = placed.id
    invariant(placed.id < placement.nextPlacementId, `${label} id is not reserved by nextPlacementId`)

    const blueprint = blueprintById(placed.blueprintId)
    invariant(blueprint !== null, `${label} references unknown blueprint "${placed.blueprintId}"`)

    invariant(
      Number.isInteger(placed.origin.gx) && Number.isInteger(placed.origin.gy),
      `${label} origin must be integral`,
    )
    const expectedCells = footprintCells(blueprint, placed.origin)
    invariant(
      placed.cells.length === expectedCells.length &&
        placed.cells.every(
          (cell, index) => cell.gx === expectedCells[index]!.gx && cell.gy === expectedCells[index]!.gy,
        ),
      `${label} cells disagree with its blueprint footprint at its origin`,
    )

    const originParcel = parcelAt(placed.origin)
    invariant(originParcel !== null, `${label} origin is not on an owned parcel`)
    invariant(placed.parcelId === originParcel.id, `${label} parcelId disagrees with its origin`)
    invariant(
      parcelById(placed.parcelId) !== null,
      `${label} references unknown parcel "${placed.parcelId}"`,
    )

    for (const cell of placed.cells) {
      const parcel = parcelAt(cell)
      invariant(parcel !== null, `${label} occupies unowned ground`)
      invariant(parcel.terrain === 'buildable', `${label} occupies unbuildable terrain`)
      const key = cellKey(cell)
      const owner = cellOwner.get(key)
      invariant(owner === undefined, `${label} overlaps placed facility ${String(owner)}`)
      cellOwner.set(key, placed.id)
    }

    if (blueprint.requiresRoadAccess) {
      invariant(
        distinctParcels(placed.cells).some((parcel) => parcelHasRoadFrontage(parcel)),
        `${label} requires road access its site does not have`,
      )
    }

    invariant(
      Number.isInteger(placed.placedWeek) && placed.placedWeek >= 0 && placed.placedWeek <= state.market.tick,
      `${label} placedWeek must be a non-negative integer at or before the current week`,
    )
    invariant(
      placed.completesWeek === placed.placedWeek + blueprint.buildWeeks,
      `${label} completesWeek must equal placedWeek + ${String(blueprint.buildWeeks)}`,
    )
    invariant(
      placed.status === 'underConstruction' || placed.status === 'operational',
      `${label} has unknown status ${String(placed.status)}`,
    )
    invariant(
      (placed.status === 'operational') === (placed.completesWeek <= state.market.tick),
      `${label} status disagrees with its committed completion week`,
    )

    invariant(
      placed.facilityId === blueprint.facilityIdBase ||
        placed.facilityId === `${blueprint.facilityIdBase}-${String(placed.id)}`,
      `${label} facilityId is not a canonical identity for its blueprint`,
    )
    invariant(
      placed.projectId === blueprint.projectIdBase ||
        placed.projectId === `${blueprint.projectIdBase}-${String(placed.id)}`,
      `${label} projectId is not a canonical identity for its blueprint`,
    )
    invariant(!facilityIds.has(placed.facilityId), `duplicate placed facility id "${placed.facilityId}"`)
    invariant(!projectIds.has(placed.projectId), `duplicate placement project id "${placed.projectId}"`)
    facilityIds.add(placed.facilityId)
    projectIds.add(placed.projectId)
  }

  // Clearance rings hold between distinct placements, so a forged save cannot
  // recreate a configuration the query would have refused.
  for (const placed of placement.facilities) {
    const blueprint = blueprintById(placed.blueprintId)!
    for (const cell of clearanceRingCells(placed.cells, blueprint.clearanceRing)) {
      const owner = cellOwner.get(cellKey(cell))
      invariant(
        owner === undefined || owner === placed.id,
        `placed facility ${String(placed.id)} violates its clearance ring against ${String(owner)}`,
      )
    }
  }

  // Every capital row corresponds to exactly one placement, at its exact week and
  // exact committed price. Placements are never removed, so this is total.
  const byProjectId = new Map(placement.facilities.map((placed) => [placed.projectId, placed]))
  const chargedProjects = new Set<string>()
  for (const entry of capexRows) {
    const placed = byProjectId.get(entry.constructionProjectId)
    invariant(
      placed !== undefined,
      `construction capex "${entry.constructionProjectId}" has no placed facility`,
    )
    const blueprint = blueprintById(placed.blueprintId)!
    invariant(entry.week === placed.placedWeek, 'construction capex week must equal placedWeek')
    invariant(entry.amount === -blueprint.capex, 'construction capex amount must equal the blueprint capex')
    invariant(entry.note === blueprint.ledgerNote, 'construction capex note is not canonical')
    invariant(
      !chargedProjects.has(entry.constructionProjectId),
      `construction capex "${entry.constructionProjectId}" is charged more than once`,
    )
    chargedProjects.add(entry.constructionProjectId)
  }
  for (const placed of placement.facilities) {
    invariant(
      chargedProjects.has(placed.projectId),
      `placed facility ${String(placed.id)} has no construction capex row`,
    )
  }

  // Operating cost is one aggregated row per week, and its amount is provable
  // from the durable placement record. Weeks with no row are legal: a migrated
  // V11 history predates the charge entirely.
  const opexWeeks = new Set<number>()
  for (const entry of opexRows) {
    invariant(
      Number.isInteger(entry.week) && entry.week >= 0 && entry.week < state.market.tick + 1,
      'facility operating cost week must be a non-negative integer no later than the current week',
    )
    invariant(!opexWeeks.has(entry.week), `week ${String(entry.week)} has more than one facility operating cost row`)
    opexWeeks.add(entry.week)
    invariant(entry.note === FACILITY_OPEX_LEDGER_NOTE, 'facility operating cost note is not canonical')
    const expected = expectedWeeklyOperatingCostAt(placement, entry.week)
    invariant(
      expected > 0 && entry.amount === -expected,
      `facility operating cost at week ${String(entry.week)} disagrees with the operational facilities of that week`,
    )
  }

  assertStudioConstructionInvariants(state, {
    facilityPolicy: 'placement-v12',
    expectedFacilities: operationalPlacedFacilities(placement).map(placedStudioFacility),
  })
}

// ── read model ───────────────────────────────────────────────────────────────

/**
 * The legacy Annex request: the `development-casting-annex` blueprint at the
 * origin of the legacy expansion parcel. This is the ONE definition the retained
 * `startDevelopmentCastingAnnex` action and its read model both use, which is why
 * V12 has no second copy of the Annex's legality.
 */
export function legacyAnnexPlacementRequest(): PlacementRequest {
  const parcel = parcelById(LEGACY_EXPANSION_PARCEL_ID)
  if (parcel === null) {
    throw new Error('placement: the legacy expansion parcel is missing from the lot')
  }
  return {
    blueprintId: DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id,
    origin: { gx: parcel.rect.x0, gy: parcel.rect.y0 },
  }
}

/** The Annex-class placement standing on the legacy expansion parcel, if any. */
export function legacyAnnexPlacement(placement: StudioPlacement): PlacedFacility | null {
  for (const placed of placement.facilities) {
    if (
      placed.blueprintId === DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id &&
      placed.parcelId === LEGACY_EXPANSION_PARCEL_ID
    ) {
      return placed
    }
  }
  return null
}

/**
 * The retained Development & Casting Annex read model, now a PROJECTION over the
 * placement root. Its shape is unchanged so every accepted surface built on it
 * keeps working; its truth comes from the one authority. `projectId`/`facilityId`
 * widen to `string` because a second Annex-class placement takes a suffixed
 * identity — the legacy-parcel placement still reports the exact V11 identities.
 */
export type StudioConstructionView = {
  mode: 'legacy' | 'managed'
  status: 'legacy' | 'vacant' | 'building' | 'operational'
  parcelId: string | null
  projectId: string | null
  facilityId: string | null
  name: string
  capex: number
  durationWeeks: number
  currentWeek: number
  cash: number
  cashAfter: number
  affordability: Affordability
  canStart: boolean
  startedWeek: number | null
  dueWeek: number | null
  completedWeek: number | null
  completedAdvances: number
  remainingAdvances: number
  currentDevelopmentCastingCapacity: number
  completedCapacityGain: 0 | 1
  consequence: string
}

export function studioConstructionView(
  state: GameState,
  // The committed facilities observatory projects arbitrary counterfactual
  // capacity and therefore keeps its explicit `configured` policy, exactly as it
  // did under V11. Every live surface uses the default: the full V12 authority.
  options?: { facilityPolicy?: 'placement-v12' | 'configured' },
): StudioConstructionView {
  if ((options?.facilityPolicy ?? 'placement-v12') === 'configured') {
    assertStudioConstructionInvariants(state, { facilityPolicy: 'configured' })
  } else {
    assertStudioPlacementInvariants(state)
  }
  const blueprint = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT
  const placed = legacyAnnexPlacement(state.placement)
  const status =
    state.placement.mode === 'legacy'
      ? 'legacy'
      : placed === null
        ? 'vacant'
        : placed.status === 'underConstruction'
          ? 'building'
          : 'operational'
  const completedAdvances =
    placed === null
      ? 0
      : placed.status === 'operational'
        ? blueprint.buildWeeks
        : Math.max(0, Math.min(blueprint.buildWeeks, state.market.tick - placed.placedWeek))
  const remainingAdvances =
    placed === null || placed.status === 'operational'
      ? 0
      : Math.max(0, Math.min(blueprint.buildWeeks, placed.completesWeek - state.market.tick))
  const affordability = canAfford(state, blueprint.capex)
  const currentDevelopmentCastingCapacity = state.operations.facilities
    .filter((facility) => facility.capability === 'development-casting')
    .reduce((sum, facility) => sum + facility.capacity, 0)

  return {
    mode: state.placement.mode,
    status,
    parcelId: state.placement.mode === 'managed' ? LEGACY_EXPANSION_PARCEL_ID : null,
    projectId: placed?.projectId ?? null,
    facilityId: placed?.facilityId ?? null,
    name: blueprint.name,
    capex: blueprint.capex,
    durationWeeks: blueprint.buildWeeks,
    currentWeek: state.market.tick,
    cash: state.studio.cash,
    cashAfter: state.studio.cash - blueprint.capex,
    affordability,
    canStart:
      placementRegimeReady(state) && queryPlacement(state, legacyAnnexPlacementRequest()).ok,
    startedWeek: placed?.placedWeek ?? null,
    dueWeek: placed?.completesWeek ?? null,
    completedWeek: placed === null || placed.status !== 'operational' ? null : placed.completesWeek,
    completedAdvances,
    remainingAdvances,
    currentDevelopmentCastingCapacity,
    completedCapacityGain: status === 'operational' ? 1 : 0,
    consequence:
      status === 'legacy'
        ? 'Studio Development becomes available after managed studio operations are activated.'
        : status === 'vacant'
          ? 'Build one additional shared Development & Casting slot. This does not raise the production ceiling or guarantee another release.'
          : status === 'building'
            ? 'Construction is committed. The Annex becomes available after the completing weekly advance; no work is reallocated during that advance.'
            : 'The Annex is operational and contributes one shared Development & Casting slot.',
  }
}

export type PlacementParcelView = {
  id: string
  label: string
  terrain: LotParcel['terrain']
  rect: LotParcel['rect']
  roadFrontage: boolean
  occupiedCells: number
  placedFacilityIds: number[]
}

export type PlacedFacilityView = {
  id: number
  blueprintId: string
  name: string
  facilityId: string
  parcelId: string
  origin: LotCell
  cells: LotCell[]
  status: PlacedFacility['status']
  placedWeek: number
  completesWeek: number
  weeksRemaining: number
  weeklyOperatingCost: number
}

export type PlacementCatalogView = {
  blueprintId: string
  name: string
  capability: FacilityBlueprint['capability']
  capacity: number
  footprint: FacilityBlueprint['footprint']
  clearanceRing: number
  requiresRoadAccess: boolean
  buildWeeks: number
  cost: number
  weeklyOperatingCost: number
  affordable: boolean
}

export type StudioPlacementView = {
  mode: StudioPlacement['mode']
  currentWeek: number
  cash: number
  buildEnabled: boolean
  lotWidth: number
  lotDepth: number
  parcels: PlacementParcelView[]
  placements: PlacedFacilityView[]
  catalog: PlacementCatalogView[]
  weeklyOperatingCost: number
}

/**
 * The one snapshot a build-mode surface needs. It re-derives everything from
 * state; nothing here is stored, and no preview lives in simulation state.
 */
export function studioPlacementView(state: GameState): StudioPlacementView {
  const parcels: PlacementParcelView[] = LOT_PARCELS.map((parcel) => {
    const ids: number[] = []
    let cells = 0
    for (const placed of state.placement.facilities) {
      let touches = false
      for (const cell of placed.cells) {
        const inside =
          cell.gx >= parcel.rect.x0 &&
          cell.gx <= parcel.rect.x1 &&
          cell.gy >= parcel.rect.y0 &&
          cell.gy <= parcel.rect.y1
        if (inside) {
          cells++
          touches = true
        }
      }
      if (touches) ids.push(placed.id)
    }
    return {
      id: parcel.id,
      label: parcel.label,
      terrain: parcel.terrain,
      rect: parcel.rect,
      roadFrontage: parcelHasRoadFrontage(parcel),
      occupiedCells: cells,
      placedFacilityIds: ids,
    }
  })

  const placements: PlacedFacilityView[] = state.placement.facilities.map((placed) => {
    const blueprint = blueprintById(placed.blueprintId)
    if (blueprint === null) {
      throw new Error(`placement view: unknown blueprint "${placed.blueprintId}"`)
    }
    return {
      id: placed.id,
      blueprintId: placed.blueprintId,
      name: placedStudioFacility(placed).name,
      facilityId: placed.facilityId,
      parcelId: placed.parcelId,
      origin: placed.origin,
      cells: placed.cells,
      status: placed.status,
      placedWeek: placed.placedWeek,
      completesWeek: placed.completesWeek,
      weeksRemaining:
        placed.status === 'operational' ? 0 : Math.max(0, placed.completesWeek - state.market.tick),
      weeklyOperatingCost: blueprint.weeklyOperatingCost,
    }
  })

  return {
    mode: state.placement.mode,
    currentWeek: state.market.tick,
    cash: state.studio.cash,
    buildEnabled: placementRegimeReady(state),
    lotWidth: LOT_WIDTH,
    lotDepth: LOT_DEPTH,
    parcels,
    placements,
    catalog: FACILITY_BLUEPRINTS.map((blueprint) => ({
      blueprintId: blueprint.id,
      name: blueprint.name,
      capability: blueprint.capability,
      capacity: blueprint.capacity,
      footprint: blueprint.footprint,
      clearanceRing: blueprint.clearanceRing,
      requiresRoadAccess: blueprint.requiresRoadAccess,
      buildWeeks: blueprint.buildWeeks,
      cost: blueprint.capex,
      weeklyOperatingCost: blueprint.weeklyOperatingCost,
      affordable: canAfford(state, blueprint.capex).ok,
    })),
    weeklyOperatingCost: weeklyPlacementOperatingCost(state.placement),
  }
}
