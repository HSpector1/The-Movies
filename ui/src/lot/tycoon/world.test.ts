// ── Tycoon world model — the spatial record, proven before any zone is created ──
//
// Shift law 10 makes grid hit geometry production law: hotspots pairwise disjoint,
// anchors honest about where a person may stand, and one owner per destination shared
// by the canvas and the semantic companion. All of that is decided by this data, and
// this data imports no Phaser, so it is checkable here rather than by eye.

import { describe, expect, it } from 'vitest'
import { ALL_BUILDING_IDS, type BuildingId } from '../snapshot/StudioLotSnapshot.ts'
import {
  AMBIENT_ROUTES,
  APRONS,
  CAMERA_FRAMINGS,
  DIRECTOR_ROUTE,
  EXPANSION_PADS,
  LOT_D,
  LOT_W,
  PATHS,
  PERSON_HOME,
  PERSON_HOME_SLOTS,
  PLACE_BY_BUILDING,
  PLAZA,
  ROADS,
  WORLD_PLACES,
  YARD_PADS,
  YARD_REGION,
  establishedDressing,
  landscaping,
  type GridPoint,
  type Rect,
  type WorldPlace,
} from './world.ts'

type Cell = { gx: number; gy: number }

function tiles(place: WorldPlace): Cell[] {
  const cells: Cell[] = []
  for (let gx = place.gx; gx < place.gx + place.fw; gx++) {
    for (let gy = place.gy; gy < place.gy + place.fd; gy++) cells.push({ gx, gy })
  }
  return cells
}

function insideFootprint(point: GridPoint, place: WorldPlace): boolean {
  return (
    point.gx >= place.gx &&
    point.gx <= place.gx + place.fw &&
    point.gy >= place.gy &&
    point.gy <= place.gy + place.fd
  )
}

function inRect(point: GridPoint, rect: Rect): boolean {
  return (
    point.gx >= rect.x0 && point.gx <= rect.x1 + 1 &&
    point.gy >= rect.y0 && point.gy <= rect.y1 + 1
  )
}

const allAnchors: { place: WorldPlace; name: string; at: GridPoint }[] = WORLD_PLACES.flatMap(
  (place) =>
    Object.entries(place.anchors).map(([name, at]) => ({ place, name, at })),
)

describe('tycoon world — destinations', () => {
  it('carries every addressable building exactly once', () => {
    const ids = WORLD_PLACES.map((place) => place.buildingId).sort()
    expect(ids).toEqual([...ALL_BUILDING_IDS].sort())
    expect(new Set(ids).size).toBe(ALL_BUILDING_IDS.length)
  })

  it('indexes every building id back to its own place', () => {
    for (const id of ALL_BUILDING_IDS) {
      expect(PLACE_BY_BUILDING[id as BuildingId]?.buildingId).toBe(id)
    }
  })

  it('keeps the Operation Hollywood place vocabulary for the semantic destinations', () => {
    expect(PLACE_BY_BUILDING['stage-a'].placeId).toBe('stage-7')
    expect(PLACE_BY_BUILDING.admin.placeId).toBe('publicity')
    expect(PLACE_BY_BUILDING.gate.placeId).toBe('studio-gate')
    expect(PLACE_BY_BUILDING.expansion.placeId).toBe('annex-parcel')
    expect(PLACE_BY_BUILDING.post.placeId).toBe('service-yard')
  })

  it('gives both engine soundstages a physical body and its own painted sign', () => {
    expect(PLACE_BY_BUILDING['stage-a'].label).toBe('STAGE 7')
    expect(PLACE_BY_BUILDING['stage-b'].label).toBe('STAGE 12')
    expect(PLACE_BY_BUILDING['stage-a'].texKey).not.toBe('')
    expect(PLACE_BY_BUILDING['stage-b'].texKey).not.toBe('')
    expect(PLACE_BY_BUILDING['stage-b'].fw).toBe(PLACE_BY_BUILDING['stage-a'].fw)
    expect(PLACE_BY_BUILDING['stage-b'].fd).toBe(PLACE_BY_BUILDING['stage-a'].fd)
  })

  it('leaves the expansion parcel unbuilt — the scene paints its lifecycle', () => {
    expect(PLACE_BY_BUILDING.expansion.texKey).toBe('')
  })
})

describe('tycoon world — hit geometry (shift law 10)', () => {
  it('places every footprint inside the graded property', () => {
    for (const place of WORLD_PLACES) {
      expect(place.gx).toBeGreaterThanOrEqual(0)
      expect(place.gy).toBeGreaterThanOrEqual(0)
      expect(place.gx + place.fw).toBeLessThanOrEqual(LOT_W)
      expect(place.gy + place.fd).toBeLessThanOrEqual(LOT_D)
      expect(place.fw).toBeGreaterThan(0)
      expect(place.fd).toBeGreaterThan(0)
    }
  })

  it('keeps every pair of footprints disjoint', () => {
    const owner = new Map<string, BuildingId>()
    for (const place of WORLD_PLACES) {
      for (const cell of tiles(place)) {
        const key = `${cell.gx},${cell.gy}`
        expect(owner.get(key)).toBeUndefined()
        owner.set(key, place.buildingId)
      }
    }
  })

  it('keeps the scenery yard region clear of every building footprint', () => {
    for (const place of WORLD_PLACES) {
      for (const cell of tiles(place)) {
        const inYard =
          cell.gx >= YARD_REGION.x0 && cell.gx <= YARD_REGION.x1 &&
          cell.gy >= YARD_REGION.y0 && cell.gy <= YARD_REGION.y1
        expect(inYard).toBe(false)
      }
    }
  })

  it('never puts a standing anchor inside a DIFFERENT place’s building', () => {
    for (const { place, name, at } of allAnchors) {
      for (const other of WORLD_PLACES) {
        if (other === place || other.texKey === '') continue
        expect(
          `${place.buildingId}.${name} inside ${other.buildingId}: ${insideFootprint(at, other)}`,
        ).toBe(`${place.buildingId}.${name} inside ${other.buildingId}: false`)
      }
    }
  })

  it('keeps every anchor inside the graded property', () => {
    for (const { at } of allAnchors) {
      expect(at.gx).toBeGreaterThanOrEqual(0)
      expect(at.gy).toBeGreaterThanOrEqual(0)
      expect(at.gx).toBeLessThanOrEqual(LOT_W)
      expect(at.gy).toBeLessThanOrEqual(LOT_D)
    }
  })

  it('puts the Stage 7 service anchor and the yard load-in anchor where the work is', () => {
    const stage = PLACE_BY_BUILDING['stage-a']
    const service = stage.anchors.service
    // In front of the elephant doors (the +gy face), never inside the stage.
    expect(service.gy).toBeGreaterThan(stage.gy + stage.fd)
    const loadIn = PLACE_BY_BUILDING.post.anchors.loadIn
    expect(inRect(loadIn, YARD_REGION)).toBe(true)
  })

  it('stands the gate arch across the boulevard, with arrival outside it', () => {
    const gate = PLACE_BY_BUILDING.gate
    const boulevard = ROADS.find((road) => road.x0 === 9 && road.x1 === 10)
    expect(boulevard).toBeDefined()
    // The arch spans the full width of the road it guards.
    expect(gate.gx).toBeLessThanOrEqual(boulevard!.x0)
    expect(gate.gx + gate.fw).toBeGreaterThan(boulevard!.x1)
    // A visitor waits on the public side; a hired one walks in.
    expect(gate.anchors.arrival.gy).toBeGreaterThan(gate.gy + gate.fd)
    expect(gate.anchors.inside.gy).toBeLessThan(gate.gy)
  })
})

describe('tycoon world — zoning and dressing', () => {
  const zones: [string, readonly Rect[]][] = [
    ['roads', ROADS],
    ['plaza', PLAZA],
    ['aprons', APRONS],
    ['paths', PATHS],
    ['expansion pads', EXPANSION_PADS],
    ['yard pads', YARD_PADS],
  ]

  it.each(zones)('keeps %s inside the property and well formed', (_name, rects) => {
    for (const rect of rects) {
      expect(rect.x0).toBeLessThanOrEqual(rect.x1)
      expect(rect.y0).toBeLessThanOrEqual(rect.y1)
      expect(rect.x0).toBeGreaterThanOrEqual(0)
      expect(rect.y0).toBeGreaterThanOrEqual(0)
      expect(rect.x1).toBeLessThan(LOT_W)
      expect(rect.y1).toBeLessThan(LOT_D)
    }
  })

  it('gives each soundstage a paved apron in front of its doors', () => {
    for (const id of ['stage-a', 'stage-b'] as const) {
      const stage = PLACE_BY_BUILDING[id]
      const apron = APRONS.find((rect) => rect.y0 === stage.gy + stage.fd)
      expect(apron).toBeDefined()
      expect(apron!.x0).toBeLessThanOrEqual(stage.gx)
      expect(apron!.x1).toBeGreaterThanOrEqual(stage.gx + stage.fw - 1)
    }
  })

  it('keeps every prop inside the property', () => {
    for (const prop of [...landscaping(), ...establishedDressing()]) {
      const slack = prop.jitter ?? 0
      expect(prop.gx - slack).toBeGreaterThanOrEqual(0)
      expect(prop.gy - slack).toBeGreaterThanOrEqual(0)
      expect(prop.gx + slack).toBeLessThanOrEqual(LOT_W)
      expect(prop.gy + slack).toBeLessThanOrEqual(LOT_D)
    }
  })

  it('keeps every prop out of a building footprint', () => {
    for (const prop of [...landscaping(), ...establishedDressing()]) {
      for (const place of WORLD_PLACES) {
        if (place.texKey === '') continue
        expect(
          `${prop.texKey}@${prop.gx},${prop.gy} in ${place.buildingId}: ` +
            `${insideFootprint(prop, place)}`,
        ).toBe(`${prop.texKey}@${prop.gx},${prop.gy} in ${place.buildingId}: false`)
      }
    }
  })
})

describe('tycoon world — movement and framing', () => {
  it('runs the cosmetic director route from the front office to the Stage 7 doors', () => {
    expect(DIRECTOR_ROUTE.length).toBeGreaterThanOrEqual(2)
    const start = DIRECTOR_ROUTE[0]!
    const end = DIRECTOR_ROUTE.at(-1)!
    expect(Math.abs(start.gx - PERSON_HOME.director.gx)).toBeLessThan(1.5)
    expect(Math.abs(start.gy - PERSON_HOME.director.gy)).toBeLessThan(1.5)
    const entry = PLACE_BY_BUILDING['stage-a'].anchors.entry
    expect(Math.abs(end.gx - entry.gx)).toBeLessThan(0.6)
    expect(Math.abs(end.gy - entry.gy)).toBeLessThan(0.6)
  })

  it('keeps every route and patrol point inside the property', () => {
    const points: GridPoint[] = [
      ...DIRECTOR_ROUTE,
      ...AMBIENT_ROUTES.flatMap((route) => [route.a, route.b]),
      ...PERSON_HOME_SLOTS.map((slot) => ({
        gx: PERSON_HOME.director.gx + slot.gx,
        gy: PERSON_HOME.director.gy + slot.gy,
      })),
      ...PERSON_HOME_SLOTS.map((slot) => ({
        gx: PERSON_HOME.talent.gx + slot.gx,
        gy: PERSON_HOME.talent.gy + slot.gy,
      })),
    ]
    for (const point of points) {
      expect(point.gx).toBeGreaterThanOrEqual(0)
      expect(point.gy).toBeGreaterThanOrEqual(0)
      expect(point.gx).toBeLessThanOrEqual(LOT_W)
      expect(point.gy).toBeLessThanOrEqual(LOT_D)
    }
  })

  it('never parks a named person inside a building', () => {
    for (const home of Object.values(PERSON_HOME)) {
      for (const slot of PERSON_HOME_SLOTS) {
        const at = { gx: home.gx + slot.gx, gy: home.gy + slot.gy }
        for (const place of WORLD_PLACES) {
          if (place.texKey === '') continue
          expect(`${at.gx},${at.gy} in ${place.buildingId}: ${insideFootprint(at, place)}`).toBe(
            `${at.gx},${at.gy} in ${place.buildingId}: false`,
          )
        }
      }
    }
  })

  it('frames the whole property by default and offers the named alternatives', () => {
    expect(CAMERA_FRAMINGS.overview.scale).toBe(1)
    expect(CAMERA_FRAMINGS.wide.scale).toBeLessThan(1)
    for (const preset of ['production', 'entrance', 'theater'] as const) {
      expect(CAMERA_FRAMINGS[preset].scale).toBeGreaterThan(1)
      expect(CAMERA_FRAMINGS[preset].at.gx).toBeLessThanOrEqual(LOT_W)
      expect(CAMERA_FRAMINGS[preset].at.gy).toBeLessThanOrEqual(LOT_D)
    }
    // Each close framing sits near the place it is named for.
    expect(CAMERA_FRAMINGS.production.at.gx).toBeGreaterThan(PLACE_BY_BUILDING['stage-a'].gx - 2)
    expect(CAMERA_FRAMINGS.entrance.at.gy).toBeGreaterThan(PLACE_BY_BUILDING.gate.gy - 4)
    expect(CAMERA_FRAMINGS.theater.at.gx).toBeLessThan(PLACE_BY_BUILDING.theater.gx + 4)
  })
})
