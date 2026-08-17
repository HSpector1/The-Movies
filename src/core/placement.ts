// ── Placement Core V12 (+ C1-M1a property state) ─────────────────────────────
// The single construction authority. One parcel map, one TUNING blueprint
// catalog, one pure legality query, one commit that re-runs that query before it
// charges anything, one weekly completion pass, and one weekly operating charge.
// This module is pure: no RNG, no wall clock, no I/O, no caller-owned mutation,
// and it consumes ZERO bytes of `state.rngState`.
//
// C1-M1a: LEGALITY CONSULTS STATE, NEVER CONSTANTS. Every geometry question here
// is asked of `state.property` — the bounds, roads, parcels, and structures the
// GameState carries — not of the module constants in `lot.ts`. A property with an
// extra parcel and wider bounds is answered correctly by this same code, which is
// what stops today's 28×26 lot from being permanent architecture.
//
// OCCUPANCY INCLUDES STRUCTURES (C1-M1a). The occupancy index a query consults is
// placed facilities UNION the property's authored structures, so nothing can ever
// be built on top of the Gate or a soundstage — a guarantee V12 got for free from
// the parcel map happening not to overlap them, and which is now enforced.
//
// One rule deliberately does NOT see structures: the CLEARANCE RING. It is a
// separation rule BETWEEN PLACEMENTS ("other placed facilities may not sit inside
// it"), which is exactly what its invariant asserts. Extending it to the authored
// bodies would newly reject 311 origins — 21 of them with fully buildable
// footprints — and this milestone is behavior-neutral by contract, so the
// authored bodies are grandfathered out of it exactly as founding placements are
// grandfathered out of move/demolish until the C2 Flip. The cell-occupancy rule
// and the severance walk both DO see structures, and both were verified neutral
// on the initial property before the change landed.
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
import {
  annexCanonicalProductionIdCollision,
  assertStudioConstructionInvariants,
} from './construction.js'
import { persistedProductionIds } from './productionIdentity.js'
import {
  blueprintAtInstanceLimit,
  blueprintInstanceCount,
  blueprintMaxInstances,
  evaluateBlueprintRequirements,
} from './blueprintRequirements.js'
import {
  LEGACY_EXPANSION_PARCEL_ID,
  cellKey,
  isOnLot,
  parcelAt,
  parcelById,
  parcelHasRoadFrontage,
  placementWouldSeverLot,
  propertyOf,
  propertyStructureCellKeys,
  structureCells,
} from './lot.js'
import {
  DEVELOPMENT_CASTING_ANNEX_BLUEPRINT,
  FACILITY_BLUEPRINTS,
  FACILITY_OPEX_LEDGER_NOTE,
  TUNING,
} from './tuning.js'
import type {
  FacilityBlueprint,
  GameState,
  LedgerEntry,
  LotCell,
  LotParcel,
  LotRect,
  PlacedFacility,
  PlacementCellVerdict,
  PlacementQuote,
  PlacementRejection,
  PlacementRequest,
  PropertyState,
  UnmetRequirement,
  StudioFacility,
  StudioOperations,
  StudioPlacement,
} from './types.js'
import { INITIAL_STUDIO_FACILITIES } from './operations.js'

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
  // C1-M2. Both are studio-scope facts rather than site-scope ones, so they rank
  // below every geometry rule: when the cell under the cursor is also illegal,
  // "you cannot build HERE" is the more useful answer. Both outrank money under
  // the standing law that a domain failure never hides behind affordability.
  'requirementsUnmet',
  'instanceLimit',
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
 * The PLACEMENT occupancy index — DERIVED from placed facilities on every read
 * and never persisted (CODE-MINING-LEDGER Entry 3's standing law). Membership
 * only; nothing iterates it, so its insertion order is never observable.
 *
 * This is the player-created half of occupancy. The clearance-ring rule consults
 * exactly this, because a clearance ring separates PLACEMENTS from each other.
 */
export function occupiedCellKeys(placement: StudioPlacement): ReadonlySet<string> {
  const keys = new Set<string>()
  for (const facility of placement.facilities) {
    for (const cell of facility.cells) keys.add(cellKey(cell))
  }
  return keys
}

/**
 * ALL occupied ground (C1-M1a): placed facilities UNION the property's authored
 * structures. This is what "is something standing on this cell?" means, and it is
 * what the per-cell `occupied` verdict and the severance walk consult.
 *
 * Also derived on every read, never persisted — the structures are already in the
 * property root, so storing their cells again would create a second authority for
 * the same fact.
 */
export function groundOccupiedCellKeys(
  property: PropertyState,
  placement: StudioPlacement,
): ReadonlySet<string> {
  const keys = new Set<string>(propertyStructureCellKeys(property))
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

function distinctParcels(property: PropertyState, cells: readonly LotCell[]): LotParcel[] {
  const seen = new Set<string>()
  const parcels: LotParcel[] = []
  for (const cell of cells) {
    const parcel = parcelAt(property, cell)
    if (parcel === null || seen.has(parcel.id)) continue
    seen.add(parcel.id)
    parcels.push(parcel)
  }
  return parcels
}

/** The clearance cells around a footprint, in fixed reading order. */
export function clearanceRingCells(
  property: PropertyState,
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
      if (own.has(cellKey(cell)) || !isOnLot(property, cell)) continue
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
      unmetRequirements: [],
      instanceCount: 0,
      maxInstances: null,
    }
  }

  const property = propertyOf(state)
  const cells = footprintCells(blueprint, origin)
  // Ground occupancy (placements AND authored structures) answers "is a body
  // standing here?"; placement occupancy alone answers "is another PLACEMENT too
  // close?". See the module header for why the clearance ring keeps the narrower
  // input.
  const occupied = groundOccupiedCellKeys(property, state.placement)
  const placementOccupied = occupiedCellKeys(state.placement)
  const found = new Set<PlacementRejection>()

  // Per-cell legality, in the binding per-cell order. Every cell is evaluated.
  const cellLegality: PlacementCellVerdict[] = cells.map((cell) => {
    let rejection: PlacementRejection | null = null
    if (!isOnLot(property, cell)) {
      rejection = 'offLot'
    } else {
      const parcel = parcelAt(property, cell)
      if (parcel === null) rejection = 'notOwned'
      else if (parcel.terrain !== 'buildable') rejection = 'terrainUnbuildable'
      else if (occupied.has(cellKey(cell))) rejection = 'occupied'
    }
    if (rejection !== null) found.add(rejection)
    return { cell, ok: rejection === null, rejection }
  })

  // Clearance ring — other placed facilities may not sit inside it.
  for (const cell of clearanceRingCells(property, cells, blueprint.clearanceRing)) {
    if (placementOccupied.has(cellKey(cell))) {
      found.add('clearanceRing')
      break
    }
  }

  // Road access is a property of the SITE: at least one owning parcel must front
  // a road. A footprint on no owned parcel at all trivially has no frontage.
  if (blueprint.requiresRoadAccess) {
    const parcels = distinctParcels(property, cells)
    if (!parcels.some((parcel) => parcelHasRoadFrontage(property, parcel))) {
      found.add('noRoadAccess')
    }
  }

  // The perimeter walk. Always evaluated; never short-circuited.
  if (placementWouldSeverLot(property, occupied, cells)) found.add('seversLot')

  // C1-M2 — is this building unlocked at all, and is there room in its allowance?
  // Both are evaluated on EVERY query, exactly like the geometry rules: a preview
  // that only computes availability when geometry happens to pass cannot tell a
  // player why a catalog entry is greyed out before they pick a site.
  const availability = evaluateBlueprintRequirements(state, blueprint, FACILITY_BLUEPRINTS)
  if (!availability.available) found.add('requirementsUnmet')
  if (blueprintAtInstanceLimit(state.placement, blueprint)) found.add('instanceLimit')

  // Money LAST — a domain failure always outranks affordability.
  if (!canAfford(state, blueprint.capex).ok) found.add('insufficientFunds')

  const rejections = orderedRejections(found)
  const originParcel = parcelAt(property, origin)
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
    unmetRequirements: availability.unmet,
    instanceCount: blueprintInstanceCount(state.placement, blueprint.id),
    maxInstances: blueprintMaxInstances(blueprint),
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
  const parcel = parcelAt(propertyOf(state), quote.origin)
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

/**
 * The C1-M1a property laws. Invariants are EXTENDED, never weakened: everything
 * V12 asserted still holds, and the property root it never had now has to be
 * internally coherent too.
 *
 * Three groups:
 *   1. BOUNDS SANITY — a property has a positive integral grid, and every road
 *      and parcel rectangle is well-formed and inside it. Ground the engine
 *      cannot address is not ground.
 *   2. STRUCTURE GEOMETRY INTEGRITY — every structure has a positive integral
 *      footprint that lies wholly on the property, and no two structures overlap.
 *      (The related law "no structure overlaps a PLACEMENT" is what makes
 *      occupancy trustworthy — a forged save cannot stand a placement inside the
 *      Gate — but it is asserted separately at the END of the placement suite so
 *      it cannot preempt an existing V12 verdict about that same placement.)
 *   3. PROVIDES-LINKS INTEGRITY — every `providesFacilityIds` entry names a real
 *      `INITIAL_STUDIO_FACILITIES` facility, and no facility is claimed by two
 *      structures. A facility has exactly one home.
 *
 * Deliberately NOT asserted: that structures never overlap parcels. That is true
 * of the initial property and is the reason C1-M1a's occupancy change was
 * verdict-neutral, so it is proved directly in the neutrality tests — but making
 * it a law would forbid a future property that grades a parcel over demolished
 * ground, which is precisely the kind of cap this milestone exists to remove.
 */
/**
 * C1-M2 — the AUTHORED CATALOG's own coherence.
 *
 * This checks TUNING data, not savegame data, and that distinction is the point.
 * A blueprint with `maxInstances: 0` or a `date` requirement at week −5 is an
 * authoring mistake, and M4 is about to author a lot of these; catching it at
 * every action, tick, and save boundary is how it gets caught on the first run
 * rather than in a playtest.
 *
 * Deliberately NOT asserted: that existing placements respect `maxInstances`. A
 * blueprint is TUNING and a placement stores only its `blueprintId` — the standing
 * law is that a catalog correction can never invalidate history that already
 * happened (see `FacilityBlueprint`). If M4 tightens an allowance, saves that
 * predate the tightening must keep loading; the limit binds the NEXT build, which
 * is exactly where `queryPlacement` enforces it.
 */
function assertBlueprintCatalogInvariants(): void {
  const ids = new Set<string>()
  for (const blueprint of FACILITY_BLUEPRINTS) {
    const label = `blueprint "${blueprint.id}"`
    invariant(blueprint.id.length > 0, 'blueprint id must be non-empty')
    invariant(!ids.has(blueprint.id), `duplicate ${label}`)
    ids.add(blueprint.id)

    if (blueprint.maxInstances !== undefined) {
      invariant(
        Number.isInteger(blueprint.maxInstances) && blueprint.maxInstances >= 1,
        `${label} maxInstances must be an integer of at least 1 when present`,
      )
    }

    invariant(Array.isArray(blueprint.requires), `${label} requires must be a list`)
    for (const requirement of blueprint.requires) {
      switch (requirement.kind) {
        case 'date':
          invariant(
            Number.isInteger(requirement.week) && requirement.week >= 0,
            `${label} date requirement week must be a non-negative integer`,
          )
          break
        case 'facility':
          invariant(
            requirement.blueprintId.length > 0,
            `${label} facility requirement must name a blueprint`,
          )
          // A blueprint that requires itself can never be built, and the first
          // one would have to exist before it could exist.
          invariant(
            requirement.blueprintId !== blueprint.id,
            `${label} cannot require itself`,
          )
          break
        case 'structure':
          invariant(
            requirement.structureId.length > 0,
            `${label} structure requirement must name a structure`,
          )
          break
        case 'rank':
          invariant(requirement.tier.length > 0, `${label} rank requirement must name a tier`)
          break
        case 'certificate':
          invariant(
            requirement.certificateId.length > 0,
            `${label} certificate requirement must name a certificate`,
          )
          break
        case 'award':
          invariant(requirement.awardId.length > 0, `${label} award requirement must name an award`)
          break
        case 'research':
          invariant(requirement.packId.length > 0, `${label} research requirement must name a pack`)
          break
        case 'landZone':
          invariant(requirement.zoneId.length > 0, `${label} landZone requirement must name a zone`)
          break
        default:
          invariant(
            false,
            `${label} carries unknown requirement kind ${JSON.stringify(
              (requirement as { kind: unknown }).kind,
            )}`,
          )
      }
    }
  }
}

function assertPropertyInvariants(property: PropertyState): void {
  invariant(
    Number.isInteger(property.bounds.width) &&
      Number.isInteger(property.bounds.depth) &&
      property.bounds.width > 0 &&
      property.bounds.depth > 0,
    'property bounds must be positive integers',
  )

  const withinBounds = (rect: LotRect): boolean =>
    Number.isInteger(rect.x0) &&
    Number.isInteger(rect.y0) &&
    Number.isInteger(rect.x1) &&
    Number.isInteger(rect.y1) &&
    rect.x0 >= 0 &&
    rect.y0 >= 0 &&
    rect.x0 <= rect.x1 &&
    rect.y0 <= rect.y1 &&
    rect.x1 < property.bounds.width &&
    rect.y1 < property.bounds.depth

  for (let index = 0; index < property.roads.length; index++) {
    invariant(
      withinBounds(property.roads[index]!),
      `property road ${String(index)} is not a well-formed rectangle inside the property bounds`,
    )
  }

  const parcelIds = new Set<string>()
  for (const parcel of property.parcels) {
    invariant(parcel.id.length > 0, 'property parcel id must be non-empty')
    invariant(!parcelIds.has(parcel.id), `duplicate property parcel id "${parcel.id}"`)
    parcelIds.add(parcel.id)
    invariant(
      withinBounds(parcel.rect),
      `property parcel "${parcel.id}" is not a well-formed rectangle inside the property bounds`,
    )
  }

  const structureIds = new Set<string>()
  const structureCellOwner = new Map<string, string>()
  const providedBy = new Map<string, string>()
  const knownFacilityIds = new Set(INITIAL_STUDIO_FACILITIES.map((facility) => facility.id))
  for (const structure of property.structures) {
    const label = `property structure "${structure.id}"`
    invariant(structure.id.length > 0, 'property structure id must be non-empty')
    invariant(!structureIds.has(structure.id), `duplicate property structure id "${structure.id}"`)
    structureIds.add(structure.id)
    invariant(
      structure.role === 'landmark' || structure.role === 'founding',
      `${label} has unknown role ${String(structure.role)}`,
    )
    invariant(
      Number.isInteger(structure.footprint.width) &&
        Number.isInteger(structure.footprint.depth) &&
        structure.footprint.width > 0 &&
        structure.footprint.depth > 0,
      `${label} must have a positive integral footprint`,
    )
    invariant(
      Number.isInteger(structure.origin.gx) && Number.isInteger(structure.origin.gy),
      `${label} origin must be integral`,
    )
    for (const cell of structureCells(structure)) {
      invariant(isOnLot(property, cell), `${label} extends beyond the property bounds`)
      const key = cellKey(cell)
      const otherStructure = structureCellOwner.get(key)
      invariant(
        otherStructure === undefined,
        `${label} overlaps property structure "${String(otherStructure)}"`,
      )
      structureCellOwner.set(key, structure.id)
    }
    for (const facilityId of structure.providesFacilityIds) {
      invariant(
        knownFacilityIds.has(facilityId),
        `${label} provides unknown facility "${facilityId}"`,
      )
      const owner = providedBy.get(facilityId)
      invariant(
        owner === undefined,
        `facility "${facilityId}" is provided by both "${String(owner)}" and "${structure.id}"`,
      )
      providedBy.set(facilityId, structure.id)
    }
  }
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
export function assertStudioPlacementInvariants(
  state: GameState,
  // The committed facilities observatory projects arbitrary counterfactual
  // capacity, so it keeps its explicit `configured` escape hatch: every placement
  // law below still runs, only the exact operational facility SET is delegated to
  // the generic capacity check. Every live surface uses the default.
  options?: { facilityPolicy?: 'placement-v12' | 'configured' },
): void {
  const configured = (options?.facilityPolicy ?? 'placement-v12') === 'configured'
  const { placement, operations } = state
  if (placement === undefined || placement === null) {
    throw new Error('placement invariant: state.placement is missing')
  }
  // The authored catalog's own coherence, before anything is evaluated against it.
  assertBlueprintCatalogInvariants()
  const property = propertyOf(state)
  // The property's OWN coherence, first: it is the ground every placement law
  // below is evaluated against, so a malformed property must not be allowed to
  // produce a confusing downstream verdict. These laws cannot fire on a
  // well-formed property, so they never preempt an existing V12 diagnostic. The
  // one law that could — a structure overlapping a PLACEMENT — is deliberately
  // deferred to the end of this function, after every V12 placement law has had
  // its say, so C1-M1a adds diagnostics without reordering them.
  assertPropertyInvariants(property)
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
      ...(configured ? {} : { expectedFacilities: [] }),
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

    const originParcel = parcelAt(property, placed.origin)
    invariant(originParcel !== null, `${label} origin is not on an owned parcel`)
    invariant(placed.parcelId === originParcel.id, `${label} parcelId disagrees with its origin`)
    invariant(
      parcelById(property, placed.parcelId) !== null,
      `${label} references unknown parcel "${placed.parcelId}"`,
    )

    for (const cell of placed.cells) {
      const parcel = parcelAt(property, cell)
      invariant(parcel !== null, `${label} occupies unowned ground`)
      invariant(parcel.terrain === 'buildable', `${label} occupies unbuildable terrain`)
      const key = cellKey(cell)
      const owner = cellOwner.get(key)
      invariant(owner === undefined, `${label} overlaps placed facility ${String(owner)}`)
      cellOwner.set(key, placed.id)
    }

    if (blueprint.requiresRoadAccess) {
      invariant(
        distinctParcels(property, placed.cells).some((parcel) =>
          parcelHasRoadFrontage(property, parcel),
        ),
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
    // Law 20: a placement's identities are reserved against the longest-lived
    // identity authority. Persisted production history (active, released, ledger,
    // and canceled traces) may never already own one of them.
    for (const [label2, id] of [
      ['parcel', placed.parcelId],
      ['project', placed.projectId],
      ['facility', placed.facilityId],
    ] as const) {
      invariant(
        !persistedProductionIds(state).has(id),
        `canonical Annex id ${JSON.stringify(id)} collides with persisted production history (${label2})`,
      )
    }
    invariant(!facilityIds.has(placed.facilityId), `duplicate placed facility id "${placed.facilityId}"`)
    invariant(!projectIds.has(placed.projectId), `duplicate placement project id "${placed.projectId}"`)
    facilityIds.add(placed.facilityId)
    projectIds.add(placed.projectId)
  }

  // C1-M1a: no placement may stand where an authored structure already stands.
  // Under V12 this was true only by luck — the parcel map happened not to overlap
  // any building, so `notOwned`/`terrainUnbuildable` caught every such forgery
  // first. Now it is a law in its own right, and it holds even if a future
  // property grades a parcel next to a body. It runs AFTER every V12 placement
  // law so a forged save that is also off-parcel still reports the V12 verdict it
  // always reported; this can only ever ADD a rejection, never relabel one.
  const structureCellOwner = new Map<string, string>()
  for (const structure of property.structures) {
    for (const cell of structureCells(structure)) structureCellOwner.set(cellKey(cell), structure.id)
  }
  for (const placed of placement.facilities) {
    for (const cell of placed.cells) {
      const standing = structureCellOwner.get(cellKey(cell))
      invariant(
        standing === undefined,
        `placed facility ${String(placed.id)} overlaps property structure "${String(standing)}"`,
      )
    }
  }

  // Clearance rings hold between distinct placements, so a forged save cannot
  // recreate a configuration the query would have refused.
  for (const placed of placement.facilities) {
    const blueprint = blueprintById(placed.blueprintId)!
    for (const cell of clearanceRingCells(property, placed.cells, blueprint.clearanceRing)) {
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

  // A placed facility is appended only AFTER allocations on its completing
  // advance. A save may not retroactively move work that started before that
  // visible-week boundary onto the new facility. Ported verbatim in intent from
  // the V11 Annex law and generalized to every operational placement.
  for (const placed of placement.facilities) {
    if (placed.status !== 'operational') continue
    const availableWeek = placed.completesWeek
    for (const workflow of operations.workflows) {
      if (!workflow.reservations.some((reservation) => reservation.facilityId === placed.facilityId)) {
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
        (entry) => entry.kind === 'production' && entry.productionId === workflow.productionId,
      )
      // `startTick` is reservation-time evidence only for workflows that actually
      // claim a placed facility. Bound its relation to the stored countdown here
      // so a forged save cannot move that clock forward to launder a
      // pre-completion allocation.
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
        productionDebits.length === 1 && productionDebits[0]!.week === production.startTick,
        `production "${workflow.productionId}" placed-facility reservation disagrees with its authoritative greenlight week`,
      )
      invariant(
        productionDebits[0]!.week >= availableWeek,
        `production "${workflow.productionId}" cannot reserve the Annex before Week ${String(availableWeek)}`,
      )
    }
    for (const screenplay of state.scriptDevelopment.projects) {
      if (screenplay.reservation?.facilityId !== placed.facilityId) continue
      const reservationWeek =
        screenplay.status === 'drafting'
          ? screenplay.commissionedWeek
          : screenplay.status === 'rewriting' && screenplay.dueWeek !== null
            ? screenplay.dueWeek - 1
            : -1
      invariant(
        reservationWeek >= availableWeek,
        `screenplay "${screenplay.id}" cannot reserve the Annex before Week ${String(availableWeek)}`,
      )
    }
    for (const session of state.castingSessions.sessions) {
      if (session.reservation?.facilityId !== placed.facilityId) continue
      invariant(
        session.startedWeek >= availableWeek,
        `casting session "${session.id}" cannot reserve the Annex before Week ${String(availableWeek)}`,
      )
    }
  }

  assertStudioConstructionInvariants(state, {
    facilityPolicy: 'placement-v12',
    ...(configured
      ? {}
      : {
          expectedFacilities:
            operationalPlacedFacilities(placement).map(placedStudioFacility),
        }),
  })
}

// ── read model ───────────────────────────────────────────────────────────────

/**
 * The legacy Annex request: the `development-casting-annex` blueprint at the
 * origin of the legacy expansion parcel. This is the ONE definition the retained
 * `startDevelopmentCastingAnnex` action and its read model both use, which is why
 * V12 has no second copy of the Annex's legality.
 */
export function legacyAnnexPlacementRequest(property: PropertyState): PlacementRequest {
  const parcel = parcelById(property, LEGACY_EXPANSION_PARCEL_ID)
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
  assertStudioPlacementInvariants(state, {
    facilityPolicy: options?.facilityPolicy ?? 'placement-v12',
  })
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
      placementRegimeReady(state) &&
      annexCanonicalProductionIdCollision(state) === null &&
      queryPlacement(state, legacyAnnexPlacementRequest(propertyOf(state))).ok,
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
  /**
   * C1-M2 — the catalog's unlock surface, which C1-M5 renders.
   *
   * `available` and `unmet` answer "is this greyed out, and what do I tell the
   * player?" WITHOUT a site: a catalog list has no origin under a cursor, so it
   * can never get its answer from a placement quote. `unmet[].reason` is the copy
   * to show, in authored order.
   */
  available: boolean
  unmet: UnmetRequirement[]
  /** Placements of this blueprint that already stand, in any status. */
  instanceCount: number
  /** The authored allowance, or null when unlimited. */
  maxInstances: number | null
  /** True when the allowance is used up — a distinct, separately worded lock. */
  atInstanceLimit: boolean
  /**
   * True when the entry is buildable somewhere in principle right now: unlocked,
   * within its allowance, and affordable. It deliberately says nothing about
   * whether a legal SITE exists — that is a per-origin question and belongs to
   * `queryPlacement`. A catalog that claimed otherwise would be guessing.
   */
  buildable: boolean
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
  const property = propertyOf(state)
  const parcels: PlacementParcelView[] = property.parcels.map((parcel) => {
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
      roadFrontage: parcelHasRoadFrontage(property, parcel),
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
    lotWidth: property.bounds.width,
    lotDepth: property.bounds.depth,
    parcels,
    placements,
    catalog: FACILITY_BLUEPRINTS.map((blueprint) => {
      const availability = evaluateBlueprintRequirements(state, blueprint, FACILITY_BLUEPRINTS)
      const atLimit = blueprintAtInstanceLimit(state.placement, blueprint)
      const affordable = canAfford(state, blueprint.capex).ok
      return {
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
        affordable,
        available: availability.available,
        unmet: availability.unmet,
        instanceCount: blueprintInstanceCount(state.placement, blueprint.id),
        maxInstances: blueprintMaxInstances(blueprint),
        atInstanceLimit: atLimit,
        buildable: availability.available && !atLimit && affordable,
      }
    }),
    weeklyOperatingCost: weeklyPlacementOperatingCost(state.placement),
  }
}
