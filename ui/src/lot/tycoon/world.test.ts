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
  PERSON_HOME_JITTER,
  PERSON_HOME_SLOTS,
  PLACE_BY_BUILDING,
  PLAZA,
  chromeStrokeWidth,
  GHOST_FILL_ALPHA,
  GUIDANCE_MARKER_ALPHA_MAX,
  GUIDANCE_MARKER_ALPHA_MIN,
  GUIDANCE_MARKER_ALPHA_STATIC,
  GUIDANCE_MARKER_FILL_ALPHA,
  GUIDANCE_MARKER_PULSE_MS,
  GUIDANCE_MARKER_SPREAD,
  guidanceMarkerAlpha,
  PRESENCE_QUEUE_RANK,
  PRESENCE_ROUTES,
  presenceQueueSlotOffset,
  presenceSiteSlotOffset,
  ROADS,
  WORLD_PLACES,
  YARD_PADS,
  YARD_REGION,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_INSTITUTION_OF_FIT,
  ZOOM_PEOPLE_OF_FIT,
  clampZoom,
  establishedDressing,
  landscaping,
  lodBandFor,
  panCentreIntoView,
  personHomeSlotOffset,
  reframedZoom,
  type CameraView,
  type GridPoint,
  type Rect,
  type WorldBox,
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

// ── M1.5: parked people and the fit-relative LOD bands ───────────────────────

describe('tycoon world — parked staff presence (M1.5)', () => {
  // The studio's whole contracted roster now stands at these homes. Presence must never
  // put a person inside a building, and the seed jitter must not push one in either.
  const jitterCorners = (at: GridPoint): GridPoint[] => {
    const j = PERSON_HOME_JITTER
    return [
      { gx: at.gx - j, gy: at.gy - j },
      { gx: at.gx + j, gy: at.gy - j },
      { gx: at.gx + j, gy: at.gy + j },
      { gx: at.gx - j, gy: at.gy + j },
    ]
  }

  it('never parks anyone inside a building, for any slot a large roster can reach', () => {
    for (const home of Object.values(PERSON_HOME)) {
      for (let slot = 0; slot < 64; slot++) {
        const offset = personHomeSlotOffset(slot)
        const at = { gx: home.gx + offset.gx, gy: home.gy + offset.gy }
        for (const corner of jitterCorners(at)) {
          for (const place of WORLD_PLACES) {
            if (place.texKey === '') continue
            expect(
              `slot ${String(slot)} in ${place.buildingId}: ${insideFootprint(corner, place)}`,
            ).toBe(`slot ${String(slot)} in ${place.buildingId}: false`)
          }
        }
      }
    }
  })

  it('keeps every reachable parking slot on the graded property', () => {
    for (const home of Object.values(PERSON_HOME)) {
      for (let slot = 0; slot < 64; slot++) {
        const offset = personHomeSlotOffset(slot)
        for (const corner of jitterCorners({
          gx: home.gx + offset.gx,
          gy: home.gy + offset.gy,
        })) {
          expect(corner.gx).toBeGreaterThanOrEqual(0)
          expect(corner.gy).toBeGreaterThanOrEqual(0)
          expect(corner.gx).toBeLessThanOrEqual(LOT_W)
          expect(corner.gy).toBeLessThanOrEqual(LOT_D)
        }
      }
    }
  })

  it('gives the authored lattice its own distinct slot for a whole founding roster', () => {
    expect(PERSON_HOME_SLOTS.length).toBeGreaterThanOrEqual(16)
    const seen = new Set<string>()
    for (let slot = 0; slot < PERSON_HOME_SLOTS.length; slot++) {
      const offset = personHomeSlotOffset(slot)
      expect(offset).toEqual(PERSON_HOME_SLOTS[slot])
      seen.add(`${offset.gx.toFixed(3)},${offset.gy.toFixed(3)}`)
    }
    expect(seen.size).toBe(PERSON_HOME_SLOTS.length)
  })

  it('is deterministic and never negative or fractional in its slot index', () => {
    expect(personHomeSlotOffset(3)).toEqual(personHomeSlotOffset(3))
    expect(personHomeSlotOffset(-4)).toEqual(personHomeSlotOffset(0))
    expect(personHomeSlotOffset(2.7)).toEqual(personHomeSlotOffset(2))
    expect(personHomeSlotOffset(Number.NaN)).toEqual(personHomeSlotOffset(0))
  })
})

describe('tycoon world — LOD bands recompute against the current fit (M1.5)', () => {
  // Playtest 1: opening a side panel resized the canvas and every building label vanished
  // at property scale. Fit moves with the box, so a band keyed to anything else lies.
  const FITS = [0.32, 0.45, 0.6, 0.667, 0.8, 1.0, 1.2, 1.45, 1.9]

  it('always reads the whole-property framing as an operations view', () => {
    for (const fit of FITS) {
      expect(`fit ${String(fit)}: ${lodBandFor(fit, fit)}`).toBe(`fit ${String(fit)}: operations`)
    }
  })

  it('still separates the three reading distances at every fit', () => {
    for (const fit of FITS) {
      expect(lodBandFor(fit * (ZOOM_INSTITUTION_OF_FIT - 0.05), fit)).toBe('institution')
      const peopleAbove = Math.max(1.0, fit * ZOOM_PEOPLE_OF_FIT)
      expect(lodBandFor(peopleAbove - 0.001, fit)).toBe('operations')
      expect(lodBandFor(peopleAbove, fit)).toBe('people')
    }
  })

  it('reads as operations rather than blanking the world when the fit cannot be computed', () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(lodBandFor(0.8, bad)).toBe('operations')
      expect(lodBandFor(bad, 0.8)).toBe('operations')
    }
  })

  it('keeps a resized default view in the operations band — the exact playtest defect', () => {
    // Host chrome opens/closes a side panel: the canvas box changes, so the fit changes.
    for (const previousFit of FITS) {
      for (const nextFit of FITS) {
        // What the old code did: hold the raw zoom. Where fit grew by more than the
        // institution margin, the default view fell out of the operations band entirely.
        const held = clampZoom(previousFit)
        const reframed = reframedZoom(previousFit, previousFit, nextFit)
        expect(
          `${String(previousFit)}→${String(nextFit)}: ${lodBandFor(reframed, nextFit)}`,
        ).toBe(`${String(previousFit)}→${String(nextFit)}: operations`)
        if (nextFit > previousFit / ZOOM_INSTITUTION_OF_FIT && nextFit <= ZOOM_MAX) {
          expect(lodBandFor(held, nextFit)).toBe('institution')
        }
      }
    }
  })

  it('holds a close framing’s RATIO to the property across a resize', () => {
    const previousFit = 0.6
    const nextFit = 0.45
    const zoomedIn = previousFit * 1.8
    const reframed = reframedZoom(zoomedIn, previousFit, nextFit)
    expect(reframed).toBeCloseTo(clampZoom(nextFit * 1.8), 6)
  })

  it('clamps every reframed zoom into the world’s absolute range', () => {
    expect(reframedZoom(1.8, 0.4, 1.9)).toBe(ZOOM_MAX)
    expect(reframedZoom(0.33, 1.9, 0.32)).toBe(ZOOM_MIN)
    expect(clampZoom(Number.NaN)).toBe(ZOOM_MIN)
    expect(clampZoom(99)).toBe(ZOOM_MAX)
    expect(clampZoom(-99)).toBe(ZOOM_MIN)
  })

  it('falls back to the fit, never to nothing, when a previous framing is unusable', () => {
    expect(reframedZoom(0, 0.6, 0.5)).toBe(clampZoom(0.5))
    expect(reframedZoom(0.6, 0, 0.5)).toBe(clampZoom(0.6))
    expect(reframedZoom(0.6, 0.6, Number.NaN)).toBe(clampZoom(0.6))
  })
})

// ── ONE CAMERA GRAMMAR: a selection pans, it never zooms ─────────────────────
//
// The defect this replaces: three plate-era retained contexts (Administration/publicity,
// the Gate, the Annex) answered a selection by setting zoom to twice the whole-property
// fit and re-centring — while the generic M1.5 building inspectors moved the camera not
// at all. Two grammars for one gesture, and the doubled zoom silently discarded whatever
// framing the player had arranged. `panCentreIntoView` is the whole of the replacement,
// and it never returns a zoom because the new grammar never has one to return.

describe('tycoon world — selection camera grammar', () => {
  /** A 1000×600 world view centred on the origin. */
  const view: CameraView = { centreX: 0, centreY: 0, width: 1000, height: 600 }
  const MARGIN = 50

  function box(minX: number, minY: number, maxX: number, maxY: number): WorldBox {
    return { minX, minY, maxX, maxY }
  }

  it('issues NO camera command for a target already comfortably in frame', () => {
    expect(panCentreIntoView(view, box(-100, -100, 100, 100), MARGIN)).toBeNull()
    // …right up to the last world unit of clearance the margin asks for.
    expect(panCentreIntoView(view, box(-450, -250, 450, 250), MARGIN)).toBeNull()
  })

  it('pans by the SMALLEST move that clears the frame edge, keeping the player’s framing', () => {
    // One unit past the comfortable right edge: the camera slides exactly one unit.
    expect(panCentreIntoView(view, box(-400, -200, 451, 200), MARGIN)).toEqual({ x: 1, y: 0 })
    // …and the same on the other three edges, one axis at a time.
    expect(panCentreIntoView(view, box(-451, -200, 400, 200), MARGIN)).toEqual({ x: -1, y: 0 })
    expect(panCentreIntoView(view, box(-400, -200, 400, 251), MARGIN)).toEqual({ x: 0, y: 1 })
    expect(panCentreIntoView(view, box(-400, -251, 400, 200), MARGIN)).toEqual({ x: 0, y: -1 })
  })

  it('brings a target that is entirely off-screen fully inside, margin and all', () => {
    const target = box(2000, 1200, 2200, 1400)
    const centre = panCentreIntoView(view, target, MARGIN)
    expect(centre).not.toBeNull()
    if (centre === null) throw new Error('unreachable')
    expect(target.minX - MARGIN).toBeGreaterThanOrEqual(centre.x - view.width / 2)
    expect(target.maxX + MARGIN).toBeLessThanOrEqual(centre.x + view.width / 2)
    expect(target.minY - MARGIN).toBeGreaterThanOrEqual(centre.y - view.height / 2)
    expect(target.maxY + MARGIN).toBeLessThanOrEqual(centre.y + view.height / 2)
  })

  it('moves only the axis that is out of frame', () => {
    // Off to the right, but vertically already fine: the camera must not drift in y.
    expect(panCentreIntoView(view, box(3000, -100, 3100, 100), MARGIN)?.y).toBe(0)
    expect(panCentreIntoView(view, box(-100, 3000, 100, 3100), MARGIN)?.x).toBe(0)
  })

  it('centres a target too large to frame, because nothing else can frame it', () => {
    expect(panCentreIntoView(view, box(-3000, -30, 5000, 30), MARGIN)).toEqual({ x: 1000, y: 0 })
    // …and still issues no command when that centre is where the camera already is:
    // an oversized target the player is already looking at the middle of is not a move.
    expect(panCentreIntoView(view, box(-4000, -20, 4000, 20), MARGIN)).toBeNull()
  })

  it('answers a bigger view with LESS movement — the same target, framed by zoom alone', () => {
    const target = box(900, 0, 1000, 100)
    const near = panCentreIntoView(view, target, MARGIN)
    const far = panCentreIntoView({ ...view, width: 3000, height: 1800 }, target, MARGIN)
    expect(near).not.toBeNull()
    // A view wide enough to already contain the target issues no command at all.
    expect(far).toBeNull()
  })

  it('never claims a camera command it cannot compute', () => {
    const target = box(9000, 0, 9100, 100)
    // A viewport that has not been measured yet (0) or cannot be read at all.
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(panCentreIntoView({ ...view, width: bad }, target, MARGIN)).toBeNull()
      expect(panCentreIntoView({ ...view, height: bad }, target, MARGIN)).toBeNull()
    }
    // A centre or an edge that is not a number at all. (0 and negatives are ordinary
    // world coordinates and must keep working — the isometric origin sits inside them.)
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(panCentreIntoView({ ...view, centreX: bad }, target, MARGIN)).toBeNull()
      expect(panCentreIntoView({ ...view, centreY: bad }, target, MARGIN)).toBeNull()
      expect(panCentreIntoView(view, box(bad, 0, 9100, 100), MARGIN)).toBeNull()
      expect(panCentreIntoView(view, box(9000, 0, 9100, bad), MARGIN)).toBeNull()
    }
    // A margin that cannot be read is dropped, not allowed to poison the answer.
    expect(panCentreIntoView(view, box(-400, -200, 400, 200), Number.NaN)).toBeNull()
    expect(panCentreIntoView(view, box(9000, 0, 9100, 100), Number.NaN)).toEqual({ x: 8600, y: 0 })
  })
})

// ── M3-UI: work/wait anchors and the authored presence commutes ───────────────

describe('tycoon world — presence anchors and commutes (M3-UI)', () => {
  /**
   * Strictly INSIDE a building's mass — the test the commutes have to pass. The
   * inclusive `insideFootprint` above is the right test for a standing anchor (it also
   * rejects standing on the wall line); a path only has to stay out of the body.
   */
  const insideBody = (point: GridPoint, place: WorldPlace): boolean =>
    point.gx > place.gx &&
    point.gx < place.gx + place.fw &&
    point.gy > place.gy &&
    point.gy < place.gy + place.fd

  /**
   * The Studio Gate is an ARCH standing across the boulevard — the road runs under it by
   * design (see WORLD_PLACES). It is the one body a path is supposed to pass through.
   */
  const solidPlaces = WORLD_PLACES.filter(
    (place) => place.texKey !== '' && place.buildingId !== 'gate',
  )

  const sampleSegment = (a: GridPoint, b: GridPoint): GridPoint[] => {
    const steps = 64
    const points: GridPoint[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      points.push({ gx: a.gx + (b.gx - a.gx) * t, gy: a.gy + (b.gy - a.gy) * t })
    }
    return points
  }

  it('gives every place a work anchor and a wait anchor', () => {
    for (const place of WORLD_PLACES) {
      expect(`${place.buildingId}.work`).toBe(
        place.anchors.work === undefined ? 'MISSING' : `${place.buildingId}.work`,
      )
      expect(`${place.buildingId}.wait`).toBe(
        place.anchors.wait === undefined ? 'MISSING' : `${place.buildingId}.wait`,
      )
    }
  })

  it('stands workers at the door, never inside the building’s own mass', () => {
    for (const place of WORLD_PLACES) {
      // The Annex parcel has no body of its own — its occupants stand ON the parcel.
      if (place.texKey === '') continue
      for (const key of ['work', 'wait'] as const) {
        const at = place.anchors[key]!
        expect(`${place.buildingId}.${key}: ${insideBody(at, place)}`).toBe(
          `${place.buildingId}.${key}: false`,
        )
      }
    }
  })

  it('puts the waiting queue OUTSIDE the door it is queueing for', () => {
    for (const place of WORLD_PLACES) {
      const work = place.anchors.work!
      const wait = place.anchors.wait!
      expect(`${place.buildingId} queue is elsewhere`).toBe(
        work.gx === wait.gx && work.gy === wait.gy
          ? `${place.buildingId} queue is on the door`
          : `${place.buildingId} queue is elsewhere`,
      )
    }
  })

  it('spreads co-located workers and queued people onto distinct points', () => {
    const work = new Set(
      Array.from({ length: 12 }, (_, i) => {
        const o = presenceSiteSlotOffset(i)
        return `${o.gx.toFixed(4)},${o.gy.toFixed(4)}`
      }),
    )
    expect(work.size).toBe(12)
    const queue = new Set(
      Array.from({ length: 12 }, (_, i) => {
        const o = presenceQueueSlotOffset(i)
        return `${o.gx.toFixed(4)},${o.gy.toFixed(4)}`
      }),
    )
    expect(queue.size).toBe(12)
    // A queue is a LINE: the first rank marches away in one consistent direction.
    for (let i = 1; i < PRESENCE_QUEUE_RANK; i++) {
      expect(presenceQueueSlotOffset(i).gx).toBeGreaterThan(presenceQueueSlotOffset(i - 1).gx)
      expect(presenceQueueSlotOffset(i).gy).toBeGreaterThan(presenceQueueSlotOffset(i - 1).gy)
    }
    expect(presenceSiteSlotOffset(-3)).toEqual(presenceSiteSlotOffset(0))
    expect(presenceQueueSlotOffset(Number.NaN)).toEqual(presenceQueueSlotOffset(0))
  })

  it('routes both home zones to every place on the property', () => {
    for (const role of ['director', 'talent'] as const) {
      for (const place of WORLD_PLACES) {
        expect(`${role}→${place.buildingId}`).toBe(
          PRESENCE_ROUTES[role][place.buildingId] === undefined
            ? `${role}→${place.buildingId} MISSING`
            : `${role}→${place.buildingId}`,
        )
      }
    }
  })

  it('keeps every commute waypoint inside the graded property', () => {
    for (const role of ['director', 'talent'] as const) {
      for (const waypoints of Object.values(PRESENCE_ROUTES[role])) {
        for (const at of waypoints ?? []) {
          expect(at.gx).toBeGreaterThanOrEqual(0)
          expect(at.gy).toBeGreaterThanOrEqual(0)
          expect(at.gx).toBeLessThanOrEqual(LOT_W)
          expect(at.gy).toBeLessThanOrEqual(LOT_D)
        }
      }
    }
  })

  it('never walks a commute THROUGH a building — the whole path, densely sampled', () => {
    for (const role of ['director', 'talent'] as const) {
      const home = PERSON_HOME[role]
      for (const place of WORLD_PLACES) {
        const full: GridPoint[] = [
          home,
          ...(PRESENCE_ROUTES[role][place.buildingId] ?? []),
          place.anchors.work!,
        ]
        for (let i = 1; i < full.length; i++) {
          for (const point of sampleSegment(full[i - 1]!, full[i]!)) {
            for (const body of solidPlaces) {
              expect(
                `${role}→${place.buildingId} @${point.gx.toFixed(2)},${point.gy.toFixed(2)}` +
                  ` in ${body.buildingId}: ${insideBody(point, body)}`,
              ).toBe(
                `${role}→${place.buildingId} @${point.gx.toFixed(2)},${point.gy.toFixed(2)}` +
                  ` in ${body.buildingId}: false`,
              )
            }
          }
        }
      }
    }
  })

  it('follows the studio’s own circulation rather than cutting across the lawn', () => {
    // Not every waypoint can be on pavement (the Casting forecourt has none), but the
    // SPINE must be: most of every commute stands on road, path, plaza, apron or pad.
    const circulation: readonly Rect[] = [
      ...ROADS,
      ...PATHS,
      ...PLAZA,
      ...APRONS,
      ...EXPANSION_PADS,
      ...YARD_PADS,
    ]
    const onCirculation = (at: GridPoint): boolean =>
      circulation.some(
        (rect) =>
          at.gx >= rect.x0 && at.gx < rect.x1 + 1 && at.gy >= rect.y0 && at.gy < rect.y1 + 1,
      )
    for (const role of ['director', 'talent'] as const) {
      for (const [buildingId, waypoints] of Object.entries(PRESENCE_ROUTES[role])) {
        const points = waypoints ?? []
        if (points.length === 0) continue
        const paved = points.filter(onCirculation).length
        expect(`${role}→${buildingId}: ${paved}/${points.length} paved`).toBe(
          paved * 2 >= points.length
            ? `${role}→${buildingId}: ${paved}/${points.length} paved`
            : `${role}→${buildingId}: MOSTLY OFF-ROAD`,
        )
      }
    }
  })
})

// ── M3-UI: legibility of world-space chrome across the reading distances ─────

describe('tycoon world — chrome legibility (M3-UI)', () => {
  it('counter-scales a world-space stroke so its SCREEN weight is constant', () => {
    // Playtest 3: at institution scale a 2px world stroke is two thirds of a pixel, and
    // the build ghost's per-cell verdicts smeared into one another.
    expect(chromeStrokeWidth(2, ZOOM_MIN)).toBeCloseTo(2 / ZOOM_MIN, 6)
    expect(chromeStrokeWidth(2, ZOOM_MIN) * ZOOM_MIN).toBeCloseTo(2, 6)
    expect(chromeStrokeWidth(3.5, 0.5) * 0.5).toBeCloseTo(3.5, 6)
  })

  it('never fattens a hairline when the camera zooms IN past 1:1', () => {
    expect(chromeStrokeWidth(2, 1)).toBe(2)
    expect(chromeStrokeWidth(2, ZOOM_MAX)).toBe(2)
  })

  it('refuses to draw a nonsense stroke rather than throwing at paint time', () => {
    expect(chromeStrokeWidth(2, Number.NaN)).toBe(2)
    expect(chromeStrokeWidth(2, 0)).toBe(2)
    expect(chromeStrokeWidth(0, 0.5)).toBe(0)
    expect(chromeStrokeWidth(Number.NaN, 0.5)).toBe(0)
  })

  it('deepens the ghost fill exactly where a tile is too small to carry an outline', () => {
    expect(GHOST_FILL_ALPHA.institution).toBeGreaterThan(GHOST_FILL_ALPHA.operations)
    expect(GHOST_FILL_ALPHA.operations).toBe(GHOST_FILL_ALPHA.people)
    for (const alpha of Object.values(GHOST_FILL_ALPHA)) {
      expect(alpha).toBeGreaterThan(0)
      expect(alpha).toBeLessThan(1)
    }
  })
})

// ── M-D: the guidance world marker's own arithmetic ──────────────────────────

describe('tycoon world — the guidance marker (M-D)', () => {
  it('breathes slowly between two bounded alphas, and never flashes', () => {
    // Explicitly ignorable, never a mobile-game blink: one full breath is well over two
    // seconds and the marker is never fully transparent at any point in it.
    expect(GUIDANCE_MARKER_PULSE_MS).toBeGreaterThanOrEqual(2_000)
    for (let step = 0; step <= 64; step++) {
      const alpha = guidanceMarkerAlpha((GUIDANCE_MARKER_PULSE_MS * step) / 64, false)
      expect(alpha).toBeGreaterThanOrEqual(GUIDANCE_MARKER_ALPHA_MIN)
      expect(alpha).toBeLessThanOrEqual(GUIDANCE_MARKER_ALPHA_MAX)
    }
    // A cosine ease: dimmest at the start of the cycle, brightest at its middle.
    expect(guidanceMarkerAlpha(0, false)).toBeCloseTo(GUIDANCE_MARKER_ALPHA_MIN, 6)
    expect(guidanceMarkerAlpha(GUIDANCE_MARKER_PULSE_MS / 2, false)).toBeCloseTo(
      GUIDANCE_MARKER_ALPHA_MAX,
      6,
    )
    // …and it is periodic, so a long-lived marker never drifts brighter or dimmer.
    expect(guidanceMarkerAlpha(GUIDANCE_MARKER_PULSE_MS * 7, false)).toBeCloseTo(
      guidanceMarkerAlpha(0, false),
      6,
    )
  })

  it('is STATIC under reduced motion, at every point of the cycle', () => {
    for (const elapsed of [0, 1, 640, GUIDANCE_MARKER_PULSE_MS / 2, GUIDANCE_MARKER_PULSE_MS * 3]) {
      expect(guidanceMarkerAlpha(elapsed, true)).toBe(GUIDANCE_MARKER_ALPHA_STATIC)
    }
    // Still lit: reduced motion hides no cue, it only stops the movement.
    expect(GUIDANCE_MARKER_ALPHA_STATIC).toBeGreaterThan(GUIDANCE_MARKER_ALPHA_MIN)
    expect(GUIDANCE_MARKER_ALPHA_STATIC).toBeLessThanOrEqual(GUIDANCE_MARKER_ALPHA_MAX)
  })

  it('stands still rather than throwing over a clock it cannot read', () => {
    expect(guidanceMarkerAlpha(Number.NaN, false)).toBe(GUIDANCE_MARKER_ALPHA_STATIC)
    expect(guidanceMarkerAlpha(Number.POSITIVE_INFINITY, false)).toBe(GUIDANCE_MARKER_ALPHA_STATIC)
    expect(guidanceMarkerAlpha(-1, false)).toBe(GUIDANCE_MARKER_ALPHA_STATIC)
  })

  it('deepens its pool exactly where the property is smallest on screen', () => {
    expect(GUIDANCE_MARKER_FILL_ALPHA.institution).toBeGreaterThan(
      GUIDANCE_MARKER_FILL_ALPHA.operations,
    )
    expect(GUIDANCE_MARKER_FILL_ALPHA.operations).toBeGreaterThan(GUIDANCE_MARKER_FILL_ALPHA.people)
    for (const alpha of Object.values(GUIDANCE_MARKER_FILL_ALPHA)) {
      expect(alpha).toBeGreaterThan(0)
      // A soft pool of light, never a solid tile of colour over the world.
      expect(alpha).toBeLessThan(0.5)
    }
  })

  it('spreads beyond the building it lights, so the pool is never hidden under it', () => {
    expect(GUIDANCE_MARKER_SPREAD.inner).toBeGreaterThan(1)
    expect(GUIDANCE_MARKER_SPREAD.outer).toBeGreaterThan(GUIDANCE_MARKER_SPREAD.inner)
    // …and stays on its own ground: a footprint spread this far still sits well inside
    // the plaza/road margin the world lays around every building.
    expect(GUIDANCE_MARKER_SPREAD.outer).toBeLessThan(1.75)
  })
})
