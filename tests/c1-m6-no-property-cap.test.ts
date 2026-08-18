// ── C1-M6 CLAIM 2 — no parcel or structure LIFETIME CAP ──────────────────────
//
// The campaign law this exists to hold: "28×26 is the starting property; architecture
// must not cap lifetime buildings at eight or assume one immutable boundary."
//
// C1-M1a already proved a property could carry 12+ and then 40+ PLACEMENTS. What it
// never pushed on is the other two counts — the property's own PARCELS (ten, forever)
// and its own STRUCTURES (eight, forever) — and eight is exactly the number the law
// names. So this file takes the committed FAR PROPERTY fixture: sixty by sixty,
// twenty-two parcels, twenty-four authored structures, twelve placements already
// standing, and pushes every lifecycle verb over it.
//
// Everything is authored deterministic data. No RNG is consumed anywhere here: the
// property is a fixture, the fill order is a fixed scan, and the only thing that moves
// is the engine.
//
// The claim is about the ENGINE. Where the renderer's join has its own boundary (an
// authored structure it has never been taught to draw is deliberately not drawn), that
// is proved separately and honestly in `ui/src/lot/tycoon/expandedPropertyWorld.test.ts`.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  INITIAL_PROPERTY,
  assertStudioPlacementInvariants,
  cellKey,
  commitPlacement,
  demolishFacility,
  demolishedFacilityHistory,
  expectedWeeklyOperatingCostAt,
  exportSave,
  groundOccupiedCellKeys,
  importSave,
  makeSave,
  makeSaveV13,
  migrateToV14,
  moveFacility,
  parcelAt,
  placementWouldSeverLot,
  propertyStructureCellKeys,
  queryPlacement,
  stableStringify,
  structureCells,
  studioPlacementView,
  tick,
  validateSaveV13,
} from '../src/core/index.js'
import { DEVELOPMENT_CASTING_ANNEX_BLUEPRINT, FACILITY_DEMOLITION_REFUND_FRACTION } from '../src/core/tuning.js'
import { INITIAL_STUDIO_FACILITIES } from '../src/core/operations.js'
import type { GameState, LedgerEntry, LotCell } from '../src/core/index.js'

const ANNEX = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id
const BUILD_WEEKS = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks
const FIXTURE_DIRECTORY = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'ui',
  'e2e',
  'expanded-property-v1',
)
const FIXTURE_ID = 'week-0-far-property-twenty-two-parcels'
/** Far past the founding eight, and past M1a's twelve, without being a stress test. */
const FILL_LIMIT = 36

type ManifestFixture = {
  id: string
  file: string
  byteLength: number
  sha256: string
  claim: {
    parcelCount: number
    structureCount: number
    placementCount: number
    farBeyondFounding: {
      foundingParcelCount: number
      foundingStructureCount: number
      parcelsAdded: number
      structuresAdded: number
    }
  }
}

const manifest = JSON.parse(
  readFileSync(join(FIXTURE_DIRECTORY, 'manifest.json'), 'utf8'),
) as { fixtures: ManifestFixture[] }
const entry = manifest.fixtures.find((candidate) => candidate.id === FIXTURE_ID)!
const fixtureBytes = readFileSync(join(FIXTURE_DIRECTORY, entry.file), 'utf8')

function farPropertyStudio(): GameState {
  return migrateToV14(importSave(fixtureBytes)).state
}

/** Cash adjustment that keeps the cash/ledger reconciliation true. */
function withCash(state: GameState, cash: number): GameState {
  const delta = cash - state.studio.cash
  if (delta === 0) return state
  const row: LedgerEntry = {
    week: state.market.tick,
    kind: delta > 0 ? 'studioRevenue' : 'overhead',
    amount: delta,
    note: 'C1-M6 fixture cash identity adjustment',
  }
  return { ...state, studio: { ...state.studio, cash }, ledger: [...state.ledger, row] }
}

function advance(state: GameState, weeks: number): GameState {
  let out = state
  for (let week = 0; week < weeks; week++) out = tick(out)
  return out
}

/**
 * Fill the property with legal placements, parcel by parcel in the property's own
 * order, at every origin its own quote calls legal. Cash is topped up between commits
 * because this proves the GEOMETRY scales, not that the economy affords it; every
 * placement still goes through the one real `commitPlacement` authority.
 */
function fillToLimit(state: GameState, limit: number): GameState {
  let out = state
  for (const parcel of out.property.parcels) {
    if (parcel.terrain !== 'buildable') continue
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        if (out.placement.facilities.length >= limit) return out
        const topped = withCash(out, 50_000_000)
        const next = commitPlacement(topped, { blueprintId: ANNEX, origin: { gx, gy } })
        // `commitPlacement` returns the SAME object by reference when it refuses.
        if (next !== topped) out = next
      }
    }
  }
  return out
}

// ── the fixture ──────────────────────────────────────────────────────────────

describe('C1-M6 (2) — the committed far-property fixture', () => {
  it('matches the manifest and round-trips byte-identically at the live boundary', () => {
    expect(Buffer.byteLength(fixtureBytes, 'utf8')).toBe(entry.byteLength)
    expect(createHash('sha256').update(fixtureBytes, 'utf8').digest('hex')).toBe(entry.sha256)
    expect(() => validateSaveV13(JSON.parse(fixtureBytes))).not.toThrow()

    // C2a-M1: a genuine V13 fixture round-trips through the V14 migrator and back
    // down the frozen V13 builder without moving a byte.
    const reloaded = migrateToV14(importSave(fixtureBytes))
    expect(exportSave(makeSaveV13(reloaded.state))).toBe(fixtureBytes)
    expect(() => assertStudioPlacementInvariants(reloaded.state)).not.toThrow()
  })

  it('carries a property far beyond the founding counts', () => {
    const property = farPropertyStudio().property
    expect(property.bounds).toEqual({ width: 60, depth: 60 })
    expect(property.parcels.length).toBeGreaterThanOrEqual(20)
    expect(property.parcels).toHaveLength(entry.claim.parcelCount)
    // Eight is the number the campaign law names. Three times it, and nothing cares.
    expect(property.structures.length).toBeGreaterThanOrEqual(24)
    expect(property.structures).toHaveLength(entry.claim.structureCount)
    expect(INITIAL_PROPERTY.structures).toHaveLength(8)
    expect(INITIAL_PROPERTY.parcels).toHaveLength(10)
    expect(entry.claim.farBeyondFounding.parcelsAdded).toBe(12)
    expect(entry.claim.farBeyondFounding.structuresAdded).toBe(16)

    // Every parcel id and every structure id is distinct — the invariants say so, and
    // this says it out loud, because a duplicate is how a "cap" usually manifests.
    expect(new Set(property.parcels.map((parcel) => parcel.id)).size).toBe(property.parcels.length)
    expect(new Set(property.structures.map((s) => s.id)).size).toBe(property.structures.length)
  })
})

// ── two dozen structures are real ground ─────────────────────────────────────

describe('C1-M6 (2) — twenty-four authored structures behave as ground, not as scenery', () => {
  it('puts every structure in the occupancy index and refuses to build on any of them', () => {
    const state = farPropertyStudio()
    const property = state.property
    const structureKeys = propertyStructureCellKeys(property)
    const ground = groundOccupiedCellKeys(property, state.placement)

    let cells = 0
    for (const structure of property.structures) {
      for (const cell of structureCells(structure)) {
        cells++
        expect(structureKeys.has(cellKey(cell))).toBe(true)
        expect(ground.has(cellKey(cell))).toBe(true)
      }
    }
    // 8 founding bodies + 16 depots × 4 cells each.
    expect(structureKeys.size).toBe(cells)

    for (const structure of property.structures) {
      const cell = structureCells(structure)[0]!
      expect(ground.has(cellKey(cell))).toBe(true)
    }
  })

  it('refuses a build that would stand on one of them, on ground graded over it', () => {
    const state = farPropertyStudio()
    // A parcel graded OVER existing bodies — authored the same way the fixture's zones
    // were, as pure data. The invariants deliberately permit this: forbidding it would
    // forbid a future property that grades a parcel over demolished ground, which is
    // exactly the kind of cap this milestone exists to remove.
    const overlaid: GameState = {
      ...state,
      property: {
        ...state.property,
        parcels: [
          ...state.property.parcels,
          {
            id: 'depot-overlay',
            label: 'Depot Overlay',
            terrain: 'buildable',
            // Covers six depots, and reaches the east avenue at gy 7, so the site
            // genuinely fronts a road and `occupied` is the only thing wrong with it.
            rect: { x0: 28, y0: 0, x1: 31, y1: 6 },
            ownedFromStart: true,
          },
        ],
      },
    }
    expect(() => assertStudioPlacementInvariants(overlaid)).not.toThrow()

    const quote = queryPlacement(overlaid, { blueprintId: ANNEX, origin: { gx: 28, gy: 0 } })
    expect(quote.rejections).toEqual(['occupied'])
    expect(quote.parcelId).toBe('depot-overlay')
    // Per cell, and named: the engine refuses because a BODY is standing there.
    for (const verdict of quote.cellLegality) {
      const onDepot = propertyStructureCellKeys(overlaid.property).has(cellKey(verdict.cell))
      expect(verdict.ok).toBe(!onDepot)
      expect(verdict.rejection).toBe(onDepot ? 'occupied' : null)
    }
    // …and the commit refuses byte-neutrally, exactly as it does anywhere else.
    expect(commitPlacement(overlaid, { blueprintId: ANNEX, origin: { gx: 28, gy: 0 } })).toBe(
      overlaid,
    )
  })

  it('lets the severance walk see all two dozen of them', () => {
    const state = farPropertyStudio()
    const property = state.property
    const candidate: LotCell[] = [
      { gx: 32, gy: 20 },
      { gx: 33, gy: 20 },
    ]
    // Open ground severs nothing whether or not the structures are in the index…
    expect(
      placementWouldSeverLot(property, propertyStructureCellKeys(property), candidate),
    ).toBe(false)
    // …and the walk is genuinely reading the set it was handed: seal a two-cell pocket
    // in the far south-east corner of the sixty-by-sixty property and it says so.
    const corner: LotCell[] = [
      { gx: 57, gy: 58 },
      { gx: 58, gy: 58 },
      { gx: 57, gy: 59 },
      { gx: 58, gy: 59 },
    ]
    const blocked = new Set<string>(
      [
        { gx: 57, gy: 57 },
        { gx: 58, gy: 57 },
        { gx: 59, gy: 57 },
        { gx: 56, gy: 58 },
        { gx: 56, gy: 59 },
      ].map(cellKey),
    )
    expect(placementWouldSeverLot(property, new Set<string>(), corner)).toBe(false)
    expect(placementWouldSeverLot(property, blocked, corner)).toBe(true)
  })
})

// ── the whole lifecycle, at scale ────────────────────────────────────────────

describe('C1-M6 (2) — composition, legality, completion, move, demolish, save, at scale', () => {
  it('fills far past the founding count and completes every one of them', () => {
    const filled = fillToLimit(farPropertyStudio(), FILL_LIMIT)
    expect(filled.placement.facilities).toHaveLength(FILL_LIMIT)
    expect(filled.placement.facilities.length).toBeGreaterThan(INITIAL_PROPERTY.structures.length * 4)

    // Every one is a real, legal, distinct site on a real buildable parcel.
    const cells = new Set<string>()
    for (const placed of filled.placement.facilities) {
      for (const cell of placed.cells) {
        expect(parcelAt(filled.property, cell)!.terrain).toBe('buildable')
        expect(cells.has(cellKey(cell))).toBe(false)
        cells.add(cellKey(cell))
      }
    }
    // Identity scaled with them: the first takes the canonical base, the rest suffix.
    const facilityIds = filled.placement.facilities.map((placed) => placed.facilityId)
    expect(new Set(facilityIds).size).toBe(facilityIds.length)
    const projectIds = filled.placement.facilities.map((placed) => placed.projectId)
    expect(new Set(projectIds).size).toBe(projectIds.length)
    expect(() => assertStudioPlacementInvariants(filled)).not.toThrow()

    const operational = advance(withCash(filled, 50_000_000), BUILD_WEEKS + 1)
    expect(operational.placement.facilities.every((placed) => placed.status === 'operational')).toBe(
      true,
    )
    expect(operational.operations.facilities).toHaveLength(
      INITIAL_STUDIO_FACILITIES.length + FILL_LIMIT,
    )
    expect(() => assertStudioPlacementInvariants(operational)).not.toThrow()

    // Opex is charged for all of them, from the durable record.
    const week = operational.market.tick - 1
    expect(expectedWeeklyOperatingCostAt(operational.placement, operational.ledger, week)).toBe(
      FILL_LIMIT * DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.weeklyOperatingCost,
    )

    // The read model reports the whole property, not a founding-sized slice of it.
    const view = studioPlacementView(operational)
    expect(view.lotWidth).toBe(60)
    expect(view.lotDepth).toBe(60)
    expect(view.parcels).toHaveLength(operational.property.parcels.length)
    expect(view.placements).toHaveLength(FILL_LIMIT)

    // …and the whole thing round-trips byte-identically.
    const json = exportSave(makeSave(operational))
    const reloaded = migrateToV14(importSave(json))
    expect(exportSave(makeSave(reloaded.state))).toBe(json)
    expect(stableStringify(reloaded.state.property)).toBe(stableStringify(operational.property))
    expect(reloaded.state.placement.facilities).toEqual(operational.placement.facilities)
  })

  it('moves and demolishes anywhere on it, with the ledger correlations intact', () => {
    const operational = advance(
      withCash(fillToLimit(farPropertyStudio(), FILL_LIMIT), 50_000_000),
      BUILD_WEEKS + 1,
    )

    // ── move: every fifth building, to the first legal origin on a DIFFERENT parcel ──
    let moved = operational
    const movedIds: number[] = []
    for (const placed of operational.placement.facilities.filter((_, index) => index % 5 === 0)) {
      const destination = (() => {
        for (const parcel of moved.property.parcels) {
          if (parcel.terrain !== 'buildable' || parcel.id === placed.parcelId) continue
          for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
            for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
              const quote = queryPlacement(
                moved,
                { blueprintId: placed.blueprintId, origin: { gx, gy } },
                { movingPlacementId: placed.id },
              )
              if (quote.ok) return { gx, gy }
            }
          }
        }
        return null
      })()
      expect(destination).not.toBeNull()
      const next = moveFacility(moved, { placementId: placed.id, origin: destination! })
      expect(next).not.toBe(moved)
      movedIds.push(placed.id)
      moved = next
    }
    expect(movedIds.length).toBeGreaterThanOrEqual(7)
    expect(() => assertStudioPlacementInvariants(moved)).not.toThrow()
    // A move is a change of address: same count, same identities, same ledger.
    expect(moved.placement.facilities).toHaveLength(FILL_LIMIT)
    expect(moved.placement.facilities.map((placed) => placed.facilityId)).toEqual(
      operational.placement.facilities.map((placed) => placed.facilityId),
    )
    expect(stableStringify(moved.ledger)).toBe(stableStringify(operational.ledger))
    expect(stableStringify(moved.operations.facilities)).toBe(
      stableStringify(operational.operations.facilities),
    )

    // ── demolish: every third building, from wherever it now stands ──
    let demolished = moved
    const demolishedRecords = moved.placement.facilities.filter((_, index) => index % 3 === 0)
    const nextIdBefore = moved.placement.nextPlacementId
    for (const placed of demolishedRecords) {
      const next = demolishFacility(demolished, { placementId: placed.id })
      expect(next).not.toBe(demolished)
      demolished = next
    }
    expect(demolishedRecords.length).toBeGreaterThanOrEqual(12)
    expect(demolished.placement.facilities).toHaveLength(FILL_LIMIT - demolishedRecords.length)
    expect(() => assertStudioPlacementInvariants(demolished)).not.toThrow()
    // Ids are never reused, however many come down.
    expect(demolished.placement.nextPlacementId).toBe(nextIdBefore)

    // Every demolition is reconstructable from the two ledger rows that bracket it,
    // and each one is matched to its OWN construction project.
    const history = demolishedFacilityHistory(demolished.ledger)
    expect(history).toHaveLength(demolishedRecords.length)
    expect(new Set(history.map((row) => row.projectId)).size).toBe(demolishedRecords.length)
    expect([...history.map((row) => row.projectId)].sort()).toEqual(
      [...demolishedRecords.map((placed) => placed.projectId)].sort(),
    )
    for (const row of history) expect(row.blueprint.id).toBe(ANNEX)

    // Capital is strictly lossy at every scale.
    const refunded = demolished.ledger
      .filter((row) => row.kind === 'facilityDemolitionRefund')
      .reduce((total, row) => total + row.amount, 0)
    expect(refunded).toBe(
      demolishedRecords.length *
        Math.round(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capex * FACILITY_DEMOLITION_REFUND_FRACTION),
    )
    expect(refunded).toBeLessThan(demolishedRecords.length * DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capex)

    // …and the survivors, on a property this size, still round-trip byte-identically.
    const json = exportSave(makeSave(demolished))
    const reloaded = migrateToV14(importSave(json))
    expect(exportSave(makeSave(reloaded.state))).toBe(json)
    expect(reloaded.state.property.parcels).toHaveLength(demolished.property.parcels.length)
    expect(reloaded.state.property.structures).toHaveLength(demolished.property.structures.length)
  })
})
