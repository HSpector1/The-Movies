// ── Property State V13 (C1-M1a) — the proof obligations ──────────────────────
//
// This milestone makes the studio property engine STATE instead of module
// constants, and claims ZERO behaviour change. A claim like that is worth exactly
// what its evidence is worth, so this file is the evidence, in four parts:
//
//   (a) REPRESENTATION NEUTRALITY — the new representation decides every question
//       the constants decided, identically, and a migrated V12 world plays
//       byte-identically to a native V13 world of the same seed.
//   (b) SCALABILITY — nothing assumes eight structures or a small number of
//       placements. A property carrying twelve-plus placed facilities passes every
//       invariant, completes, is charged opex, and round-trips.
//   (c) EXPANDABILITY — a property with wider bounds and an extra parcel is
//       answered correctly by the same code with NO change to it. This is the
//       architecture proof; it is deliberately NOT a player-facing land purchase.
//   (d) The V13 save boundary itself: shape, domain law, migration, historical
//       guards, and byte-identical round-trips.
//
// Everything here is seeded and pure: no wall clock, no unseeded randomness.

import { describe, expect, it } from 'vitest'
import {
  INITIAL_PROPERTY,
  INITIAL_PROPERTY_STRUCTURES,
  LOT_DEPTH,
  LOT_PARCELS,
  LOT_ROADS,
  LOT_WIDTH,
  applyActions,
  cellKey,
  clonePropertyState,
  commitPlacement,
  convertV12ToV13,
  convertV13ToV14,
  exportSave,
  generateWorld,
  groundOccupiedCellKeys,
  importSave,
  initialProperty,
  isOnLot,
  isRoadCell,
  makeSave,
  makeSaveV7,
  makeSaveV11,
  makeSaveV12,
  migrateToV13,
  migrateToV14,
  occupiedCellKeys,
  parcelAt,
  parcelById,
  parcelHasRoadFrontage,
  placementWouldSeverLot,
  propertyStructureCellKeys,
  queryPlacement,
  stableStringify,
  structureCells,
  studioPlacementView,
  tick,
  validateSave,
  validateSaveV14,
  assertStudioPlacementInvariants,
  expectedWeeklyOperatingCostAt,
} from '../src/core/index.js'
import { DEVELOPMENT_CASTING_ANNEX_BLUEPRINT } from '../src/core/tuning.js'
import { INITIAL_STUDIO_FACILITIES } from '../src/core/operations.js'
import type { GameState, LotCell, PropertyState } from '../src/core/index.js'

const ANNEX = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id

/**
 * How many legal Annex placements the initial property's eight buildable parcels
 * hold under the deterministic greedy fill below — its true capacity, given a
 * 3×2 footprint and a one-cell clearance ring. Well past the eight-building
 * world this milestone had to stop being shaped by. The larger arm below pushes
 * far beyond it on a bigger property, so this number is a floor, not a ceiling.
 */
const PLACEMENT_FILL_COUNT = 12

function managedStudio(seed: string): GameState {
  const engaged: GameState = { ...generateWorld(seed), economyEngagedEver: true }
  return applyActions(engaged, [{ kind: 'activateStudioOperations' }])
}

function withCash(state: GameState, cash: number): GameState {
  const delta = cash - state.studio.cash
  return {
    ...state,
    studio: { ...state.studio, cash },
    ledger:
      delta === 0
        ? state.ledger
        : [
            ...state.ledger,
            {
              week: state.market.tick,
              kind: delta > 0 ? ('studioRevenue' as const) : ('overhead' as const),
              amount: delta,
              note: 'test fixture cash identity adjustment',
            },
          ],
  }
}

function advance(state: GameState, weeks: number): GameState {
  let out = state
  for (let week = 0; week < weeks; week++) out = tick(out)
  return out
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

// The M1 tycoon world's own building numbers, restated as literals exactly as
// the road/parcel alignment already is. The engine never imports presentation
// code, so this is where "the renderer moved a building" becomes a test failure.
const M1_WORLD_BUILDINGS = [
  { id: 'admin', gx: 9, gy: 2, fw: 3, fd: 3 },
  { id: 'writers', gx: 3, gy: 2, fw: 3, fd: 2 },
  { id: 'casting', gx: 3, gy: 9, fw: 3, fd: 2 },
  { id: 'stage-a', gx: 17, gy: 2, fw: 4, fd: 4 },
  { id: 'stage-b', gx: 17, gy: 9, fw: 4, fd: 4 },
  { id: 'post', gx: 18, gy: 18, fw: 3, fd: 2 },
  { id: 'theater', gx: 3, gy: 16, fw: 3, fd: 2 },
  { id: 'gate', gx: 8, gy: 23, fw: 3, fd: 1 },
] as const

// ── (a) representation neutrality ────────────────────────────────────────────

describe('C1-M1a (a) — the property IS the constants, in a new representation', () => {
  it('seeds every fresh world with a deep COPY of the initial authored property', () => {
    const state = generateWorld('c1-m1a-fresh')
    expect(state.property).toEqual(INITIAL_PROPERTY)
    // A copy, never the frozen authored constant: a world must never be able to
    // reach back and edit the source of truth.
    expect(state.property).not.toBe(INITIAL_PROPERTY)
    expect(state.property.parcels).not.toBe(INITIAL_PROPERTY.parcels)
    expect(Object.isFrozen(INITIAL_PROPERTY)).toBe(true)
    expect(Object.isFrozen(INITIAL_PROPERTY.parcels)).toBe(true)
    // Two worlds never share property objects.
    const other = generateWorld('c1-m1a-fresh-2')
    expect(other.property).not.toBe(state.property)
    expect(other.property).toEqual(state.property)
  })

  it('rebuilds the initial property from the retained authored constants exactly', () => {
    expect(INITIAL_PROPERTY.bounds).toEqual({ width: LOT_WIDTH, depth: LOT_DEPTH })
    expect(INITIAL_PROPERTY.roads).toEqual(LOT_ROADS)
    expect(INITIAL_PROPERTY.parcels).toEqual(LOT_PARCELS)
    expect(INITIAL_PROPERTY.structures).toEqual(INITIAL_PROPERTY_STRUCTURES)
    expect(initialProperty()).toEqual(INITIAL_PROPERTY)
    expect(clonePropertyState(INITIAL_PROPERTY)).toEqual(INITIAL_PROPERTY)
  })

  it('owns the M1 renderer geometry for all eight authored structures, verbatim', () => {
    expect(INITIAL_PROPERTY.structures).toHaveLength(M1_WORLD_BUILDINGS.length)
    for (const building of M1_WORLD_BUILDINGS) {
      const structure = INITIAL_PROPERTY.structures.find(
        (candidate) => candidate.id === building.id,
      )
      expect(structure, `structure "${building.id}" is missing`).toBeDefined()
      expect(structure!.origin).toEqual({ gx: building.gx, gy: building.gy })
      expect(structure!.footprint).toEqual({ width: building.fw, depth: building.fd })
      // Every footprint lies wholly on the property.
      for (const cell of structureCells(structure!)) {
        expect(isOnLot(INITIAL_PROPERTY, cell)).toBe(true)
      }
    }
    // Three landmarks with no capacity, five founding bodies.
    const byRole = (role: string) =>
      INITIAL_PROPERTY.structures.filter((s) => s.role === role).map((s) => s.id).sort()
    expect(byRole('landmark')).toEqual(['admin', 'gate', 'theater'])
    expect(byRole('founding')).toEqual(['casting', 'post', 'stage-a', 'stage-b', 'writers'])
  })

  it('links every founding body to real facilities, each claimed exactly once', () => {
    const known = new Set(INITIAL_STUDIO_FACILITIES.map((facility) => facility.id))
    const claimed: string[] = []
    for (const structure of INITIAL_PROPERTY.structures) {
      for (const facilityId of structure.providesFacilityIds) {
        expect(known.has(facilityId), `unknown facility "${facilityId}"`).toBe(true)
        claimed.push(facilityId)
      }
    }
    // No facility has two homes.
    expect(new Set(claimed).size).toBe(claimed.length)
    // Today the five founding facilities are all housed. `casting` provides
    // nothing on purpose: the engine models ONE shared Development & Casting
    // facility whose body stands at Development (accepted M1.5 behaviour).
    expect(claimed.sort()).toEqual([...known].sort())
    expect(
      INITIAL_PROPERTY.structures.find((s) => s.id === 'casting')!.providesFacilityIds,
    ).toEqual([])
    // INITIAL_STUDIO_FACILITIES itself is untouched by this milestone.
    expect(INITIAL_STUDIO_FACILITIES.map((f) => f.id)).toEqual([
      'facility-development-casting',
      'facility-post-building',
      'facility-scenery-shop',
      'facility-soundstage-07',
      'facility-soundstage-12',
    ])
  })

  // The load-bearing fact behind the whole neutrality claim. If a parcel ever
  // overlapped a structure, adding structures to occupancy would have changed a
  // verdict — so this is asserted, never assumed.
  it('never lets an authored structure stand on a parcel, so occupancy gained nothing', () => {
    const structureKeys = propertyStructureCellKeys(INITIAL_PROPERTY)
    expect(structureKeys.size).toBe(68)
    for (const structure of INITIAL_PROPERTY.structures) {
      for (const cell of structureCells(structure)) {
        expect(
          parcelAt(INITIAL_PROPERTY, cell),
          `structure "${structure.id}" covers a parcel at ${cellKey(cell)}`,
        ).toBeNull()
      }
    }
    // Ground occupancy on an empty studio is exactly the structures.
    const empty = generateWorld('c1-m1a-occupancy')
    expect(occupiedCellKeys(empty.placement).size).toBe(0)
    expect(groundOccupiedCellKeys(empty.property, empty.placement)).toEqual(structureKeys)
  })

  it('decides every query verdict from state exactly as the constants decided it', () => {
    // The expectation side is computed ONLY from the retained authored constants,
    // never from state.property — so agreement is real evidence, not a tautology.
    const state = withCash(managedStudio('c1-m1a-grid'), 5_000_000)
    const constantParcelAt = (cell: LotCell) => {
      if (
        !Number.isInteger(cell.gx) ||
        !Number.isInteger(cell.gy) ||
        cell.gx < 0 ||
        cell.gy < 0 ||
        cell.gx >= LOT_WIDTH ||
        cell.gy >= LOT_DEPTH
      ) return null
      for (const parcel of LOT_PARCELS) {
        if (
          cell.gx >= parcel.rect.x0 && cell.gx <= parcel.rect.x1 &&
          cell.gy >= parcel.rect.y0 && cell.gy <= parcel.rect.y1
        ) return parcel
      }
      return null
    }

    let evaluated = 0
    let legal = 0
    const seenRejections = new Set<string>()
    for (let gy = -1; gy <= LOT_DEPTH; gy++) {
      for (let gx = -1; gx <= LOT_WIDTH; gx++) {
        const quote = queryPlacement(state, { blueprintId: ANNEX, origin: { gx, gy } })
        evaluated++
        if (quote.ok) legal++
        // Origin parcel agrees with the constant map.
        const expectedParcel = constantParcelAt({ gx, gy })
        expect(quote.parcelId).toBe(expectedParcel === null ? null : expectedParcel.id)
        // Every per-cell verdict agrees with the constant map, cell for cell.
        for (const verdict of quote.cellLegality) {
          const cell = verdict.cell
          const offLot =
            cell.gx < 0 || cell.gy < 0 || cell.gx >= LOT_WIDTH || cell.gy >= LOT_DEPTH
          const parcel = constantParcelAt(cell)
          const expectedRejection = offLot
            ? 'offLot'
            : parcel === null
              ? 'notOwned'
              : parcel.terrain === 'buildable'
                ? null
                : 'terrainUnbuildable'
          expect(verdict.rejection).toBe(expectedRejection)
          if (expectedRejection !== null) seenRejections.add(expectedRejection)
        }
        for (const rejection of quote.rejections) seenRejections.add(rejection)
      }
    }
    expect(evaluated).toBe((LOT_WIDTH + 2) * (LOT_DEPTH + 2))
    // A real, non-degenerate grid: some origins are legal and most are not, and
    // the sweep genuinely exercised every domain rule rather than agreeing about
    // one uniform verdict everywhere.
    expect(legal).toBeGreaterThan(0)
    expect(legal).toBeLessThan(evaluated)
    expect([...seenRejections].sort()).toEqual([
      'noRoadAccess',
      'notOwned',
      'offLot',
      'terrainUnbuildable',
    ])
  })

  it('keeps the severance walk verdict-identical with structures in the obstacle set', () => {
    // C1-M1a made the severance model more truthful (a soundstage IS impassable).
    // That is only acceptable because it changes nothing on this property — swept
    // here across every origin, structures in vs structures out.
    const structureKeys = propertyStructureCellKeys(INITIAL_PROPERTY)
    let swept = 0
    for (let gy = -2; gy <= LOT_DEPTH + 1; gy++) {
      for (let gx = -2; gx <= LOT_WIDTH + 1; gx++) {
        const cells: LotCell[] = []
        for (let dy = 0; dy < DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.footprint.depth; dy++) {
          for (let dx = 0; dx < DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.footprint.width; dx++) {
            cells.push({ gx: gx + dx, gy: gy + dy })
          }
        }
        swept++
        expect(
          placementWouldSeverLot(INITIAL_PROPERTY, structureKeys, cells),
          `severance disagreed at ${String(gx)},${String(gy)}`,
        ).toBe(placementWouldSeverLot(INITIAL_PROPERTY, new Set<string>(), cells))
      }
    }
    expect(swept).toBeGreaterThan(900)
  })

  it('reports the same road, frontage, and parcel answers the constants reported', () => {
    for (const parcel of LOT_PARCELS) {
      expect(parcelById(INITIAL_PROPERTY, parcel.id)).toEqual(parcel)
      // Frontage is unchanged: exactly one buildable parcel is unserved.
      expect(typeof parcelHasRoadFrontage(INITIAL_PROPERTY, parcel)).toBe('boolean')
    }
    const unserved = LOT_PARCELS.filter(
      (parcel) => parcel.terrain === 'buildable' && !parcelHasRoadFrontage(INITIAL_PROPERTY, parcel),
    )
    expect(unserved.map((parcel) => parcel.id)).toEqual(['north-back-lot'])
    // Road membership matches the authored rectangles exactly.
    let roadCells = 0
    for (let gy = 0; gy < LOT_DEPTH; gy++) {
      for (let gx = 0; gx < LOT_WIDTH; gx++) {
        const onRoad = LOT_ROADS.some(
          (road) => gx >= road.x0 && gx <= road.x1 && gy >= road.y0 && gy <= road.y1,
        )
        expect(isRoadCell(INITIAL_PROPERTY, { gx, gy })).toBe(onRoad)
        if (onRoad) roadCells++
      }
    }
    expect(roadCells).toBeGreaterThan(0)
  })

  it('reports the property, not the constants, through the placement read model', () => {
    const view = studioPlacementView(managedStudio('c1-m1a-view'))
    expect(view.lotWidth).toBe(LOT_WIDTH)
    expect(view.lotDepth).toBe(LOT_DEPTH)
    expect(view.parcels.map((parcel) => parcel.id)).toEqual(LOT_PARCELS.map((parcel) => parcel.id))
  })

  // The behavioural half of (a): a migrated V12 world and a native V13 world of
  // the same seed must be the SAME GAME, step for step, for a long run with real
  // actions in it — not merely equal at week zero.
  it('plays a migrated V12 world byte-identically to a native V13 world for 30+ weeks', () => {
    const seed = 'c1-m1a-neutrality'
    const native = withCash(managedStudio(seed), 5_000_000)

    // The V12 fixture: the same world, written through the FROZEN V12 builder,
    // which projects the property root away exactly as a real V12 file has none.
    const v12 = makeSaveV12(native)
    expect(v12.saveVersion).toBe(12)
    expect('property' in v12.state).toBe(false)

    const migrated = convertV13ToV14(convertV12ToV13(v12)).state
    // Migration reconstructs the property V12 held implicitly — nothing else.
    expect(migrated.property).toEqual(INITIAL_PROPERTY)
    expect(stableStringify(migrated)).toBe(stableStringify(native))

    // Now diverge nothing and simulate. A scripted action sequence with a real
    // placement, its completion, and its operating charges inside the window.
    const script = (state: GameState): GameState => {
      let out = advance(state, 2)
      out = applyActions(out, [
        { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: { gx: 7, gy: 15 } } },
      ])
      out = advance(out, 6)
      out = applyActions(out, [
        { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: { gx: 0, gy: 9 } } },
      ])
      // Past both completion weeks, so completions and opex are exercised.
      return advance(out, 26)
    }

    const fromNative = script(native)
    const fromMigrated = script(migrated)

    expect(fromMigrated.market.tick).toBe(34)
    expect(fromNative.market.tick).toBe(34)
    // Cash, ledger, RNG, productions, releases — and in fact every byte.
    expect(fromMigrated.studio.cash).toBe(fromNative.studio.cash)
    expect(fromMigrated.rngState).toBe(fromNative.rngState)
    expect(fromMigrated.ledger).toEqual(fromNative.ledger)
    expect(fromMigrated.studio.activeProductions).toEqual(fromNative.studio.activeProductions)
    expect(fromMigrated.studio.releasedFilms).toEqual(fromNative.studio.releasedFilms)
    expect(fromMigrated.operations.facilities).toEqual(fromNative.operations.facilities)
    expect(stableStringify(fromMigrated)).toBe(stableStringify(fromNative))

    // The run really did the work the script claims, so this is not vacuous.
    expect(fromNative.placement.facilities).toHaveLength(2)
    expect(fromNative.placement.facilities.every((f) => f.status === 'operational')).toBe(true)
    expect(fromNative.ledger.filter((e) => e.kind === 'constructionCapex')).toHaveLength(2)
    expect(
      fromNative.ledger.filter((e) => e.kind === 'facilityOpex').length,
    ).toBeGreaterThan(15)
    // The property itself never moved during play.
    expect(fromNative.property).toEqual(INITIAL_PROPERTY)
  })
})

// ── (b) scalability ──────────────────────────────────────────────────────────

/**
 * Fill the property greedily with legal Annex placements, in a fixed scan order.
 * Cash is topped up between commits because this proves the GEOMETRY scales, not
 * that the economy affords it; every placement still goes through the one real
 * `commitPlacement` authority and its full legality query.
 */
function fillWithPlacements(state: GameState, limit: number): GameState {
  let out = state
  for (let gy = 0; gy < out.property.bounds.depth && out.placement.facilities.length < limit; gy++) {
    for (let gx = 0; gx < out.property.bounds.width && out.placement.facilities.length < limit; gx++) {
      const topped = withCash(out, 50_000_000)
      const next = commitPlacement(topped, { blueprintId: ANNEX, origin: { gx, gy } })
      // commitPlacement returns the SAME object by reference when it refuses.
      if (next !== topped) out = next
    }
  }
  return out
}

describe('C1-M1a (b) — nothing assumes eight structures or a small placement count', () => {
  it('carries twelve-plus placed facilities through invariants, completion, opex, and save', () => {
    const filled = fillWithPlacements(withCash(managedStudio('c1-m1a-scale'), 50_000_000), 40)
    // The greedy fill is deterministic, so pin the exact count as well as the
    // floor: a refactor that quietly stopped placing would fail here, not pass.
    expect(filled.placement.facilities.length).toBeGreaterThanOrEqual(12)
    expect(filled.placement.facilities.length).toBe(PLACEMENT_FILL_COUNT)

    // Every placement is a real, legal, distinct site on real parcels.
    const cells = new Set<string>()
    for (const placed of filled.placement.facilities) {
      expect(placed.status).toBe('underConstruction')
      for (const cell of placed.cells) {
        expect(parcelAt(filled.property, cell)!.terrain).toBe('buildable')
        expect(cells.has(cellKey(cell))).toBe(false)
        cells.add(cellKey(cell))
      }
    }
    // Identity scaled too: the first keeps the canonical base, the rest suffix.
    const facilityIds = filled.placement.facilities.map((placed) => placed.facilityId)
    expect(new Set(facilityIds).size).toBe(facilityIds.length)
    expect(facilityIds[0]).toBe(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.facilityIdBase)

    expect(() => assertStudioPlacementInvariants(filled)).not.toThrow()

    // Weekly completion: all of them complete, and the facility set grows by the
    // same count. No path caps at eight.
    const operational = advance(filled, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks + 2)
    expect(operational.placement.facilities.every((placed) => placed.status === 'operational')).toBe(
      true,
    )
    expect(operational.operations.facilities).toHaveLength(
      INITIAL_STUDIO_FACILITIES.length + filled.placement.facilities.length,
    )
    expect(() => assertStudioPlacementInvariants(operational)).not.toThrow()

    // Opex is charged for every operational placement, from the durable record.
    const week = operational.market.tick - 1
    const expectedOpex =
      filled.placement.facilities.length * DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.weeklyOperatingCost
    expect(
      expectedWeeklyOperatingCostAt(operational.placement, operational.ledger, week),
    ).toBe(expectedOpex)
    const opexRow = operational.ledger.filter((entry) => entry.kind === 'facilityOpex').at(-1)!
    expect(opexRow.amount).toBe(-expectedOpex)

    // And it all round-trips byte-identically at the live boundary.
    const json = exportSave(makeSave(operational))
    const reloaded = migrateToV14(importSave(json))
    expect(reloaded.saveVersion).toBe(14)
    expect(exportSave(makeSave(reloaded.state))).toBe(json)
    expect(reloaded.state.property).toEqual(INITIAL_PROPERTY)
    expect(reloaded.state.placement.facilities).toEqual(operational.placement.facilities)
  })

  // Twelve is the INITIAL property's capacity, so on its own it could still be
  // read as "a small number". This arm removes that reading entirely: a larger
  // property carries far more placements through the identical code.
  it('carries far more than twelve when the property has room for them', () => {
    const roomy = clonePropertyState(INITIAL_PROPERTY)
    roomy.bounds = { width: 48, depth: 26 }
    roomy.roads = roomy.roads.map((road) =>
      road.x0 === 0 && road.y0 === 7 ? { ...road, x1: 47 } : road,
    )
    roomy.parcels = [
      ...roomy.parcels,
      {
        id: 'east-field',
        label: 'East Field',
        terrain: 'buildable',
        rect: { x0: 29, y0: 0, x1: 47, y1: 6 },
        ownedFromStart: true,
      },
      {
        id: 'south-east-field',
        label: 'South-East Field',
        terrain: 'buildable',
        rect: { x0: 29, y0: 9, x1: 47, y1: 20 },
        ownedFromStart: true,
      },
    ]
    const base: GameState = {
      ...withCash(managedStudio('c1-m1a-scale-large'), 50_000_000),
      property: roomy,
    }
    const filled = fillWithPlacements(base, 200)
    expect(filled.placement.facilities.length).toBeGreaterThan(40)
    expect(() => assertStudioPlacementInvariants(filled)).not.toThrow()

    const operational = advance(filled, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks + 1)
    expect(operational.placement.facilities.every((p) => p.status === 'operational')).toBe(true)
    expect(operational.operations.facilities).toHaveLength(
      INITIAL_STUDIO_FACILITIES.length + filled.placement.facilities.length,
    )
    expect(() => assertStudioPlacementInvariants(operational)).not.toThrow()

    const json = exportSave(makeSave(operational))
    expect(exportSave(makeSave(migrateToV14(importSave(json)).state))).toBe(json)
  })
})

// ── (c) expandability ────────────────────────────────────────────────────────

describe('C1-M1a (c) — a bigger property works with no code change', () => {
  // Purely as DATA: wider bounds, an extra road spur, an extra parcel fronting
  // it. No engine change, no player-facing land purchase — the architecture proof.
  function expandedProperty(): PropertyState {
    const property = clonePropertyState(INITIAL_PROPERTY)
    property.bounds = { width: 34, depth: 26 }
    // Extend the studio avenue east into the new ground so the parcel is served.
    property.roads = property.roads.map((road) =>
      road.x0 === 0 && road.y0 === 7 ? { ...road, x1: 33 } : road,
    )
    property.parcels = [
      ...property.parcels,
      {
        id: 'east-annexe',
        label: 'East Annexe',
        terrain: 'buildable',
        // Reaches gy 6, so it is orthogonally adjacent to the extended avenue
        // at gy 7 and genuinely fronts it.
        rect: { x0: 29, y0: 2, x1: 32, y1: 6 },
        ownedFromStart: true,
      },
    ]
    return property
  }

  it('answers geometry on ground that did not exist before', () => {
    const property = expandedProperty()
    // The new ground is on the property; it was off it a moment ago.
    expect(isOnLot(property, { gx: 30, gy: 3 })).toBe(true)
    expect(isOnLot(INITIAL_PROPERTY, { gx: 30, gy: 3 })).toBe(false)
    expect(parcelAt(property, { gx: 30, gy: 3 })!.id).toBe('east-annexe')
    expect(parcelAt(INITIAL_PROPERTY, { gx: 30, gy: 3 })).toBeNull()
    expect(parcelById(property, 'east-annexe')).not.toBeNull()
    // The extended avenue is road, and it gives the new parcel frontage.
    expect(isRoadCell(property, { gx: 30, gy: 7 })).toBe(true)
    expect(parcelHasRoadFrontage(property, parcelById(property, 'east-annexe')!)).toBe(true)
    // The original property is untouched by any of this.
    expect(INITIAL_PROPERTY.bounds).toEqual({ width: LOT_WIDTH, depth: LOT_DEPTH })
    expect(INITIAL_PROPERTY.parcels).toHaveLength(10)
  })

  it('lets placement legality, commit, completion, and the invariants use it', () => {
    const base = withCash(managedStudio('c1-m1a-expand'), 5_000_000)
    const state: GameState = { ...base, property: expandedProperty() }

    // The same origin that is off-lot on the initial property is legal here.
    const origin = { gx: 29, gy: 2 }
    expect(queryPlacement(base, { blueprintId: ANNEX, origin }).primary).toBe('offLot')
    const quote = queryPlacement(state, { blueprintId: ANNEX, origin })
    expect(quote.rejections).toEqual([])
    expect(quote.ok).toBe(true)
    expect(quote.parcelId).toBe('east-annexe')

    // Commit it through the one real authority, then complete it.
    const committed = commitPlacement(state, { blueprintId: ANNEX, origin })
    expect(committed).not.toBe(state)
    expect(committed.placement.facilities[0]!.parcelId).toBe('east-annexe')
    expect(() => assertStudioPlacementInvariants(committed)).not.toThrow()

    const operational = advance(committed, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks)
    expect(operational.placement.facilities[0]!.status).toBe('operational')
    expect(
      operational.operations.facilities.some(
        (facility) => facility.id === DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.facilityIdBase,
      ),
    ).toBe(true)

    // The read model reports the bigger property, not the constants.
    const view = studioPlacementView(operational)
    expect(view.lotWidth).toBe(34)
    expect(view.parcels.map((parcel) => parcel.id)).toContain('east-annexe')

    // And an expanded property persists and round-trips like any other.
    const json = exportSave(makeSave(operational))
    const reloaded = migrateToV14(importSave(json))
    expect(reloaded.state.property.bounds).toEqual({ width: 34, depth: 26 })
    expect(reloaded.state.property.parcels).toHaveLength(11)
    expect(exportSave(makeSave(reloaded.state))).toBe(json)
  })

  it('refuses to write an expanded property into any historical format', () => {
    const state: GameState = {
      ...withCash(managedStudio('c1-m1a-expand-downgrade'), 5_000_000),
      property: expandedProperty(),
    }
    // A frozen builder may only drop a property that is still the authored one.
    expect(() => makeSaveV12(state)).toThrow(
      /cannot downgrade or discard an authoritative V13 property/,
    )
    // …and an unchanged property still projects cleanly, losing nothing.
    expect(() => makeSaveV12(withCash(managedStudio('c1-m1a-expand-ok'), 1))).not.toThrow()
  })
})

// ── (d) the V13 save boundary ────────────────────────────────────────────────

describe('C1-M1a (d) — SaveFileV13', () => {
  it('writes V13 by default and round-trips every lifecycle state byte-identically', () => {
    const started = commitPlacement(
      withCash(managedStudio('c1-m1a-save-lifecycles'), 5_000_000),
      { blueprintId: ANNEX, origin: { gx: 7, gy: 15 } },
    )
    const states = [
      generateWorld('c1-m1a-save-legacy'),
      managedStudio('c1-m1a-save-vacant'),
      started,
      advance(started, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks),
      advance(started, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks + 3),
    ]
    for (const state of states) {
      const save = makeSave(state)
      // C2a-M1: the LIVE envelope is now V14. The property root and every claim
      // this case makes about it are unchanged — only which version writes it.
      expect(save.saveVersion).toBe(14)
      expect(validateSave(save)).toBe(save)
      expect(validateSaveV14(save)).toBe(save)
      expect(save.state.property).toEqual(INITIAL_PROPERTY)
      const json = exportSave(save)
      expect(exportSave(importSave(json))).toBe(json)
      expect(exportSave(migrateToV14(importSave(json)))).toBe(json)
    }
  })

  it('projects the property root positively, dropping unknown future fields', () => {
    const withFuture = {
      ...managedStudio('c1-m1a-save-projection'),
      futureV14: { mustNotLeak: true },
    }
    const save = makeSave(withFuture)
    expect('futureV14' in save.state).toBe(false)
    expect(Object.keys(save.state).sort()).toContain('property')
  })

  it('rejects a malformed property root structurally, before any domain rule', () => {
    const valid = makeSave(managedStudio('c1-m1a-save-shape'))
    const cases: ReadonlyArray<[string, (save: typeof valid) => void, RegExp]> = [
      [
        'missing root',
        (save) => {
          delete (save.state as unknown as Record<string, unknown>).property
        },
        /state is missing required field "property"/,
      ],
      [
        'not an object',
        (save) => {
          ;(save.state as unknown as Record<string, unknown>).property = 7
        },
        /state\.property must be a plain object/,
      ],
      [
        'unknown field',
        (save) => {
          ;(save.state.property as unknown as Record<string, unknown>).future = true
        },
        /state\.property has unknown field "future"/,
      ],
      [
        'zero width',
        (save) => {
          save.state.property.bounds.width = 0
        },
        /state\.property\.bounds\.width must be a finite integer no less than 1/,
      ],
      [
        'non-integer road bound',
        (save) => {
          save.state.property.roads[0]!.x1 = 7.5
        },
        /state\.property\.roads\[0\]\.x1 must be a finite integer/,
      ],
      [
        'bad terrain',
        (save) => {
          ;(save.state.property.parcels[0] as unknown as Record<string, unknown>).terrain = 'swamp'
        },
        /terrain must be "buildable" or "blocked"/,
      ],
      [
        'unowned parcel',
        (save) => {
          ;(save.state.property.parcels[0] as unknown as Record<string, unknown>).ownedFromStart =
            false
        },
        /ownedFromStart must be true/,
      ],
      [
        'unknown structure role',
        (save) => {
          ;(save.state.property.structures[0] as unknown as Record<string, unknown>).role = 'shed'
        },
        /role must be one of/,
      ],
      [
        'zero-depth footprint',
        (save) => {
          save.state.property.structures[0]!.footprint.depth = 0
        },
        /footprint\.depth must be a finite integer no less than 1/,
      ],
      [
        'non-string provided facility',
        (save) => {
          ;(save.state.property.structures[3] as unknown as Record<string, unknown>)
            .providesFacilityIds = [7]
        },
        /providesFacilityIds\[0\]/,
      ],
    ]
    for (const [, mutate, expected] of cases) {
      const bad = clone(valid)
      mutate(bad)
      expect(() => validateSaveV14(bad)).toThrow(expected)
    }
  })

  it('rejects a semantically forged property root', () => {
    const valid = makeSave(managedStudio('c1-m1a-save-semantics'))
    const cases: ReadonlyArray<[string, (save: typeof valid) => void, RegExp]> = [
      [
        'road outside the bounds',
        (save) => {
          save.state.property.roads[0]!.x1 = 99
        },
        /property road 0 is not a well-formed rectangle inside the property bounds/,
      ],
      [
        'inverted parcel rectangle',
        (save) => {
          save.state.property.parcels[0]!.rect.x1 = save.state.property.parcels[0]!.rect.x0 - 1
        },
        /is not a well-formed rectangle inside the property bounds/,
      ],
      [
        'duplicate parcel id',
        (save) => {
          save.state.property.parcels[1]!.id = save.state.property.parcels[0]!.id
        },
        /duplicate property parcel id/,
      ],
      [
        'structure off the property',
        (save) => {
          save.state.property.structures[0]!.origin.gx = 27
        },
        /extends beyond the property bounds/,
      ],
      [
        'two structures on the same ground',
        (save) => {
          save.state.property.structures[1]!.origin = { ...save.state.property.structures[2]!.origin }
        },
        /overlaps property structure/,
      ],
      [
        'duplicate structure id',
        (save) => {
          save.state.property.structures[1]!.id = save.state.property.structures[0]!.id
        },
        /duplicate property structure id/,
      ],
      [
        'provides a facility that does not exist',
        (save) => {
          save.state.property.structures[3]!.providesFacilityIds = ['facility-imaginary']
        },
        /provides unknown facility "facility-imaginary"/,
      ],
      [
        'two structures claiming the same facility',
        (save) => {
          save.state.property.structures[4]!.providesFacilityIds = [
            ...save.state.property.structures[3]!.providesFacilityIds,
          ]
        },
        /is provided by both/,
      ],
    ]
    for (const [, mutate, expected] of cases) {
      const bad = clone(valid)
      mutate(bad)
      expect(() => validateSaveV14(bad)).toThrow(expected)
    }
  })

  it('refuses a placement standing inside an authored structure', () => {
    const state = commitPlacement(withCash(managedStudio('c1-m1a-structure-clash'), 5_000_000), {
      blueprintId: ANNEX,
      origin: { gx: 7, gy: 15 },
    })
    const forged = clone(makeSave(state))
    // Move the Theater onto the Annex's ground. Nothing may stand in a body.
    forged.state.property.structures.find((s) => s.id === 'theater')!.origin = { gx: 7, gy: 15 }
    expect(() => validateSaveV14(forged)).toThrow(
      /placed facility 1 overlaps property structure "theater"/,
    )
  })

  it('reconstructs the property a V12 file was already played on, inventing nothing', () => {
    const native = withCash(managedStudio('c1-m1a-migration'), 2_000_000)
    const v12 = makeSaveV12(native)
    const before = stableStringify(v12)
    const v13 = convertV12ToV13(v12)

    expect(v13.saveVersion).toBe(13)
    expect(v13.state.property).toEqual(INITIAL_PROPERTY)
    // …and a deep copy, never the frozen constant.
    expect(v13.state.property).not.toBe(INITIAL_PROPERTY)
    // Not one other byte moved.
    expect(v13.state.rngState).toBe(v12.state.rngState)
    expect(v13.state.market.tick).toBe(v12.state.market.tick)
    expect(v13.state.studio.cash).toBe(v12.state.studio.cash)
    expect(v13.state.ledger).toEqual(v12.state.ledger)
    expect(v13.state.placement).toEqual(v12.state.placement)
    expect(v13.state.operations).toEqual(v12.state.operations)
    // The input is never mutated, and the conversion is deterministic.
    expect(stableStringify(v12)).toBe(before)
    expect(stableStringify(convertV12ToV13(v12))).toBe(stableStringify(v13))
    expect(migrateToV13(v13)).toBe(v13) // idempotent by identity
  })

  it('lifts every historical version through the whole frozen chain to V13', () => {
    const v12 = makeSaveV12(managedStudio('c1-m1a-chain'))
    const direct = migrateToV13(v12)
    expect(direct.saveVersion).toBe(13)
    expect(stableStringify(direct)).toBe(stableStringify(convertV12ToV13(v12)))
    expect(direct.state.property).toEqual(INITIAL_PROPERTY)
  })

  it('refuses the V13 property root at every historical boundary (law 19)', () => {
    // Grafted onto genuinely FROZEN envelopes, so the property root is the first
    // violation and the guard is what we actually observe. (A live state grafted
    // onto V1 would trip the older V11/V12 guards first, which is correct but
    // proves nothing about this one.)
    const state = managedStudio('c1-m1a-boundary')
    // V1–V7 carry loose envelopes, so the guard itself is what rejects the root.
    const v7 = makeSaveV7(state)
    for (const version of [1, 2, 3, 4, 5, 6, 7]) {
      const forged = clone(v7) as unknown as Record<string, unknown>
      forged.saveVersion = version
      ;(forged.state as Record<string, unknown>).property = clone(INITIAL_PROPERTY)
      expect(() => validateSave(forged)).toThrow(
        /state\.property belongs only to SaveFileV13 and cannot appear at this historical boundary/,
      )
    }
    // V11 and V12 close their state shape exactly, so they refuse it by their own
    // closed-world rule before the guard is even reached. Either way it never lands.
    for (const save of [makeSaveV11(state), makeSaveV12(state)] as const) {
      const forged = clone(save) as unknown as Record<string, unknown>
      ;(forged.state as Record<string, unknown>).property = clone(INITIAL_PROPERTY)
      expect(() => validateSave(forged)).toThrow(/state has unknown field "property"/)
    }
  })

  it('moves the unknown-version boundary from 14 to 15', () => {
    const live = makeSave(managedStudio('c1-m1a-unknown'))
    expect(() => validateSave({ ...live, saveVersion: 15 })).toThrow(
      /unknown saveVersion 15.*versions 1 through 14 only/,
    )
  })
})
