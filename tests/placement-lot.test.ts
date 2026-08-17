// Placement Core V12 — the authored lot: the parcel map, the road network, and
// the two derived predicates legality depends on.
//
// The engine never imports presentation code, so the alignment between this
// parcel map and the M1 tycoon world (`ui/src/lot/tycoon/world.ts`) is authored
// by hand and asserted HERE, against the world's own numbers restated as literal
// expectations. If the renderer's geometry moves, these expectations are the
// place that says so.

import { describe, expect, it } from 'vitest'
import {
  INITIAL_PROPERTY,
  LEGACY_EXPANSION_PARCEL_ID,
  LOT_DEPTH,
  LOT_PARCELS,
  LOT_ROADS,
  LOT_WIDTH,
  cellKey,
  isOnLot,
  isRoadCell,
  parcelAt,
  parcelById,
  parcelHasRoadFrontage,
  placementWouldSeverLot,
  rectCells,
} from '../src/core/index.js'
import { clearanceRingCells, footprintCells } from '../src/core/placement.js'
import { DEVELOPMENT_CASTING_ANNEX_BLUEPRINT } from '../src/core/tuning.js'
import type { LotCell, LotRect } from '../src/core/index.js'

// The M1 tycoon world's own numbers, restated. `world.ts` declares LOT_W 28 /
// LOT_D 26, five ROADS rectangles (inclusive on both bounds, exactly as the
// renderer's ground rasterizer walks them), and nine building footprints placed
// half-open from their origin (`[gx, gx+fw) × [gy, gy+fd)`).
const M1_WORLD = {
  width: 28,
  depth: 26,
  roads: [
    { x0: 13, y0: 0, x1: 14, y1: 25 },
    { x0: 0, y0: 7, x1: 27, y1: 8 },
    { x0: 9, y0: 19, x1: 10, y1: 25 },
    { x0: 15, y0: 14, x1: 22, y1: 15 },
    { x0: 14, y0: 21, x1: 22, y1: 22 },
  ] as const satisfies readonly LotRect[],
  buildings: [
    { id: 'admin', gx: 9, gy: 2, fw: 3, fd: 3 },
    { id: 'writers', gx: 3, gy: 2, fw: 3, fd: 2 },
    { id: 'casting', gx: 3, gy: 9, fw: 3, fd: 2 },
    { id: 'stage-a', gx: 17, gy: 2, fw: 4, fd: 4 },
    { id: 'stage-b', gx: 17, gy: 9, fw: 4, fd: 4 },
    { id: 'post', gx: 18, gy: 18, fw: 3, fd: 2 },
    { id: 'theater', gx: 3, gy: 16, fw: 3, fd: 2 },
    { id: 'gate', gx: 8, gy: 23, fw: 3, fd: 1 },
    // The Annex expansion parcel's graded pad. It carries no building until a
    // placement completes on it, which is why it is the one world footprint the
    // parcel map is allowed to cover.
    { id: 'expansion', gx: 7, gy: 15, fw: 4, fd: 3 },
  ] as const,
} as const

function buildingCells(id: string): LotCell[] {
  const place = M1_WORLD.buildings.find((candidate) => candidate.id === id)!
  const cells: LotCell[] = []
  for (let gy = place.gy; gy < place.gy + place.fd; gy++) {
    for (let gx = place.gx; gx < place.gx + place.fw; gx++) cells.push({ gx, gy })
  }
  return cells
}

describe('Placement Core V12 — the authored lot', () => {
  it('matches the M1 tycoon world grid and road network exactly', () => {
    expect(LOT_WIDTH).toBe(M1_WORLD.width)
    expect(LOT_DEPTH).toBe(M1_WORLD.depth)
    expect(LOT_ROADS).toEqual(M1_WORLD.roads)
  })

  it('keeps every parcel inside the lot, pairwise disjoint, and off every road', () => {
    const owner = new Map<string, string>()
    for (const parcel of LOT_PARCELS) {
      expect(parcel.ownedFromStart).toBe(true)
      expect(parcel.id.length).toBeGreaterThan(0)
      expect(parcel.label.length).toBeGreaterThan(0)
      expect(['buildable', 'blocked']).toContain(parcel.terrain)
      expect(parcel.rect.x0).toBeLessThanOrEqual(parcel.rect.x1)
      expect(parcel.rect.y0).toBeLessThanOrEqual(parcel.rect.y1)
      for (const cell of rectCells(parcel.rect)) {
        expect(isOnLot(INITIAL_PROPERTY, cell)).toBe(true)
        expect(isRoadCell(INITIAL_PROPERTY, cell)).toBe(false)
        const key = cellKey(cell)
        expect(owner.get(key)).toBeUndefined()
        owner.set(key, parcel.id)
      }
    }
    // A coarse map, deliberately: ten parcels over 208 of the lot's 728 cells.
    expect(LOT_PARCELS).toHaveLength(10)
    expect(owner.size).toBe(208)
  })

  it('never covers an authored studio building except the Annex pad it replaces', () => {
    for (const building of M1_WORLD.buildings) {
      const covered = buildingCells(building.id).filter(
        (cell) => parcelAt(INITIAL_PROPERTY, cell) !== null,
      )
      if (building.id === 'expansion') {
        expect(covered).toHaveLength(buildingCells('expansion').length)
        for (const cell of covered) {
          expect(parcelAt(INITIAL_PROPERTY, cell)!.id).toBe(LEGACY_EXPANSION_PARCEL_ID)
        }
      } else {
        expect(covered).toEqual([])
      }
    }
  })

  it('preserves the legacy expansion parcel id, its graded pad, and its boulevard frontage', () => {
    const expansion = parcelById(INITIAL_PROPERTY, LEGACY_EXPANSION_PARCEL_ID)
    expect(expansion).not.toBeNull()
    expect(expansion!.terrain).toBe('buildable')
    // The renderer's graded pad is gy 15–17; the parcel adds the one-tile
    // frontage strip at gy 18 so the site genuinely fronts the studio boulevard.
    expect(expansion!.rect).toEqual({ x0: 7, y0: 15, x1: 10, y1: 18 })
    expect(parcelHasRoadFrontage(INITIAL_PROPERTY, expansion!)).toBe(true)
    // The frontage is the boulevard specifically: (9,19) and (10,19) are road.
    expect(isRoadCell(INITIAL_PROPERTY, { gx: 9, gy: 19 })).toBe(true)
    expect(isRoadCell(INITIAL_PROPERTY, { gx: 10, gy: 19 })).toBe(true)
  })

  it('exposes exactly one buildable parcel with no road frontage, so the rule binds', () => {
    const unserved = LOT_PARCELS.filter(
      (parcel) => parcel.terrain === 'buildable' && !parcelHasRoadFrontage(INITIAL_PROPERTY, parcel),
    )
    expect(unserved.map((parcel) => parcel.id)).toEqual(['north-back-lot'])
  })

  it('marks the courtyard and the scenery yard owned but unbuildable', () => {
    const blocked = LOT_PARCELS.filter((parcel) => parcel.terrain === 'blocked')
    expect(blocked.map((parcel) => parcel.id).sort()).toEqual([
      'courtyard',
      'service-yard',
    ])
    for (const parcel of blocked) expect(parcel.ownedFromStart).toBe(true)
  })

  it('resolves cells to parcels, unclaimed ground, and off-lot without throwing', () => {
    expect(parcelAt(INITIAL_PROPERTY, { gx: 7, gy: 15 })!.id).toBe(LEGACY_EXPANSION_PARCEL_ID)
    // Inside the lot, owned by nobody: the Administration building's footprint.
    expect(parcelAt(INITIAL_PROPERTY, { gx: 9, gy: 2 })).toBeNull()
    // Off the lot in every direction.
    for (const cell of [
      { gx: -1, gy: 0 },
      { gx: 0, gy: -1 },
      { gx: LOT_WIDTH, gy: 0 },
      { gx: 0, gy: LOT_DEPTH },
    ]) {
      expect(isOnLot(INITIAL_PROPERTY, cell)).toBe(false)
      expect(parcelAt(INITIAL_PROPERTY, cell)).toBeNull()
    }
    // Non-integer coordinates are off-lot, never rounded onto a parcel.
    expect(isOnLot(INITIAL_PROPERTY, { gx: 7.5, gy: 15 })).toBe(false)
    expect(parcelAt(INITIAL_PROPERTY, { gx: 7, gy: 15.5 })).toBeNull()
    expect(parcelById(INITIAL_PROPERTY, 'no-such-parcel')).toBeNull()
  })

  it('derives footprint cells in fixed reading order from a flat blueprint rectangle', () => {
    expect(footprintCells(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT, { gx: 7, gy: 15 })).toEqual([
      { gx: 7, gy: 15 },
      { gx: 8, gy: 15 },
      { gx: 9, gy: 15 },
      { gx: 7, gy: 16 },
      { gx: 8, gy: 16 },
      { gx: 9, gy: 16 },
    ])
  })

  it('derives the clearance ring around a footprint, clipped to the lot', () => {
    const cells = footprintCells(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT, { gx: 0, gy: 0 })
    const ring = clearanceRingCells(INITIAL_PROPERTY, cells, 1)
    // A 3×2 footprint at the lot's corner: the 5×4 expanded box minus the
    // footprint minus everything off-lot.
    expect(ring).toEqual([
      { gx: 3, gy: 0 },
      { gx: 3, gy: 1 },
      { gx: 0, gy: 2 },
      { gx: 1, gy: 2 },
      { gx: 2, gy: 2 },
      { gx: 3, gy: 2 },
    ])
    expect(clearanceRingCells(INITIAL_PROPERTY, cells, 0)).toEqual([])
    expect(clearanceRingCells(INITIAL_PROPERTY, [], 1)).toEqual([])
  })
})

describe('Placement Core V12 — the perimeter-walk severance rule', () => {
  // The rule is live code on every query. On the current ten-parcel map no legal
  // placement can sever the lot: the buildable parcels are small, separated by
  // open ground and roads, and the roads themselves are never ownable. These
  // cases therefore drive the algorithm directly, over synthetic occupancy, so
  // the rule is proved rather than assumed.

  it('accepts an ordinary placement on open ground', () => {
    const cells = footprintCells(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT, { gx: 7, gy: 15 })
    expect(placementWouldSeverLot(INITIAL_PROPERTY, new Set<string>(), cells)).toBe(false)
  })

  it('accepts a placement in a lot corner, where the ring has under two passable cells', () => {
    // Wall the corner off entirely: the ring around the candidate is either
    // off-lot or blocked, so there is nothing left to disconnect.
    const blocked = new Set<string>([
      cellKey({ gx: 3, gy: 0 }),
      cellKey({ gx: 3, gy: 1 }),
      cellKey({ gx: 0, gy: 2 }),
      cellKey({ gx: 1, gy: 2 }),
      cellKey({ gx: 2, gy: 2 }),
      cellKey({ gx: 3, gy: 2 }),
    ])
    const cells = footprintCells(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT, { gx: 0, gy: 0 })
    expect(placementWouldSeverLot(INITIAL_PROPERTY, blocked, cells)).toBe(false)
  })

  it('REJECTS a placement that completes a wall across the lot', () => {
    // Occupy every column of row 5 except gx 10, 11, 12 — then place a 3×2
    // footprint into that gap. The wall closes and the lot is cut in two.
    const blocked = new Set<string>()
    for (let gx = 0; gx < LOT_WIDTH; gx++) {
      if (gx >= 10 && gx <= 12) continue
      blocked.add(cellKey({ gx, gy: 5 }))
      blocked.add(cellKey({ gx, gy: 6 }))
    }
    const candidate = footprintCells(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT, { gx: 10, gy: 5 })
    // The gap is open before the placement …
    expect(placementWouldSeverLot(INITIAL_PROPERTY, blocked, [])).toBe(false)
    // … and closed by it.
    expect(placementWouldSeverLot(INITIAL_PROPERTY, blocked, candidate)).toBe(true)
  })

  it('accepts the same wall when one gap cell remains open', () => {
    const blocked = new Set<string>()
    for (let gx = 0; gx < LOT_WIDTH; gx++) {
      if (gx >= 10 && gx <= 13) continue
      blocked.add(cellKey({ gx, gy: 5 }))
      blocked.add(cellKey({ gx, gy: 6 }))
    }
    const candidate = footprintCells(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT, { gx: 10, gy: 5 })
    expect(placementWouldSeverLot(INITIAL_PROPERTY, blocked, candidate)).toBe(false)
  })

  it('is structurally satisfiable everywhere a real placement can legally land', () => {
    // The documented current-map fact, asserted rather than assumed: for every
    // buildable parcel and every origin whose footprint fits inside it, the
    // perimeter walk passes on an empty lot.
    let originsChecked = 0
    for (const parcel of LOT_PARCELS) {
      if (parcel.terrain !== 'buildable') continue
      for (const origin of rectCells(parcel.rect)) {
        const cells = footprintCells(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT, origin)
        if (!cells.every((cell) => parcelAt(INITIAL_PROPERTY, cell)?.id === parcel.id)) continue
        originsChecked++
        expect(placementWouldSeverLot(INITIAL_PROPERTY, new Set<string>(), cells)).toBe(false)
      }
    }
    expect(originsChecked).toBeGreaterThan(0)
  })
})
