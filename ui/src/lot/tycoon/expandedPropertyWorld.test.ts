// ── C1-M6 — the composed world on a property bigger than the founding one ────
//
// The renderer-side half of the expandability proof. `buildings.ts` is the ONE join of
// engine geometry × presentation, and its contract is frozen: this file reads it, and
// changes nothing.
//
// Two questions, both asked against the COMMITTED fixtures rather than a snapshot this
// file invents, so the browser spec, the engine suites and this file are all talking
// about the same bytes:
//
//   1. does the join scale — does a property with twenty-two parcels, twenty-four
//      authored structures and a dozen placements compose, or is something still shaped
//      like the founding nine?
//   2. is a world id an IDENTITY — does `placed-<id>` follow the building when it moves,
//      and does a successor raised on the dead building's exact ground get its own?
//
// ONE HONEST BOUNDARY, recorded rather than papered over. `composeOne` refuses an
// authored body it has no presentation for ("borrowing another building's presentation
// would be a lie about what stands there"). So the sixteen fixture depots are real
// ENGINE ground — they occupy cells, the severance walk sees them, nothing may be built
// on them — and they are painted by nothing, because the renderer has never been taught
// to draw them. That is the documented fail-neutral law working, not a cap: the path a
// PLAYER grows a property along is placements, and placements compose at any count,
// which is what the first test measures.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  demolishFacilityAction,
  importSaveJson,
  moveFacilityAction,
  placeFacilityAction,
  placementQuote,
  studioLotSnapshot,
  studioPlacement,
} from '../../engine/adapter.ts'
import type { GameState } from '../../engine/adapter.ts'
import { placedBuildingId } from '../snapshot/StudioLotSnapshot.ts'
import { LEGACY_ANNEX_PARCEL_ID, composeWorldBuildings, worldBounds, worldBuildingById } from './buildings.ts'
import { PRESENTATION_BY_BUILDING } from './world.ts'

const FIXTURE_DIRECTORY = 'ui/e2e/expanded-property-v1'
const SOUTH_YARD_FILE = 'week-0-south-yard-second-zone.save.json'
const FAR_PROPERTY_FILE = 'week-0-far-property-twenty-two-parcels.save.json'
const ANNEX = 'development-casting-annex'
const SOUTH_YARD_EAST = { gx: 12, gy: 30 }
const SOUTH_YARD_WEST = { gx: 2, gy: 30 }

type Manifest = {
  fixtures: { file: string; byteLength: number; sha256: string }[]
}

const manifest = JSON.parse(
  readFileSync(join(FIXTURE_DIRECTORY, 'manifest.json'), 'utf8'),
) as Manifest

function fixtureState(file: string): GameState {
  const bytes = readFileSync(join(FIXTURE_DIRECTORY, file), 'utf8')
  const claimed = manifest.fixtures.find((candidate) => candidate.file === file)!
  // The same evidence chain the engine suites close, closed again here: this file is
  // reading the committed artefact, not a convenient copy of it.
  expect(Buffer.byteLength(bytes, 'utf8')).toBe(claimed.byteLength)
  expect(createHash('sha256').update(bytes, 'utf8').digest('hex')).toBe(claimed.sha256)
  const imported = importSaveJson(bytes)
  if (!imported.ok) throw new Error(imported.error)
  expect(imported.converted).toBe(false)
  return imported.state
}

function place(state: GameState, origin: { gx: number; gy: number }): GameState {
  expect(placementQuote(state, { blueprintId: ANNEX, origin }).ok).toBe(true)
  const committed = placeFacilityAction(state, { blueprintId: ANNEX, origin })
  if (!committed.ok) throw new Error(committed.error)
  return committed.next
}

describe('C1-M6 — the world composes a property far past the founding one', () => {
  it('reports the bounds the snapshot describes, at two different property sizes', () => {
    expect(worldBounds(studioLotSnapshot(fixtureState(SOUTH_YARD_FILE)))).toEqual({
      width: 28,
      depth: 34,
    })
    expect(worldBounds(studioLotSnapshot(fixtureState(FAR_PROPERTY_FILE)))).toEqual({
      width: 60,
      depth: 60,
    })
  })

  it('composes every placed facility on a twenty-two-parcel property, in placement order', () => {
    const state = fixtureState(FAR_PROPERTY_FILE)
    const placements = studioPlacement(state).placements
    expect(placements.length).toBeGreaterThanOrEqual(12)

    const composed = composeWorldBuildings(studioLotSnapshot(state))
    const placed = composed.filter((building) => building.role === 'placed')
    expect(placed).toHaveLength(placements.length)
    // Ascending placement id — the paint order `buildings.ts` pins.
    expect(placed.map((building) => building.placedFacilityId)).toEqual(
      [...placements.map((row) => row.id)].sort((a, b) => a - b),
    )
    for (const building of placed) {
      const engine = placements.find((row) => row.id === building.placedFacilityId)!
      expect(building.buildingId).toBe(placedBuildingId(engine.id))
      expect(building.placeId).toBe(placedBuildingId(engine.id))
      expect(building.blueprintId).toBe(engine.blueprintId)
      expect(building.status).toBe(engine.status)
      expect({ gx: building.gx, gy: building.gy }).toEqual(engine.origin)
      // Every one of them is addressable on its own, at this count.
      expect(worldBuildingById(composed, building.buildingId)).toBe(building)
    }
    expect(new Set(placed.map((building) => building.buildingId)).size).toBe(placed.length)
  })

  it('draws the authored bodies it knows, and honestly draws nothing for the ones it does not', () => {
    const state = fixtureState(FAR_PROPERTY_FILE)
    const property = state.property
    expect(property.structures.length).toBeGreaterThanOrEqual(24)

    const records = studioLotSnapshot(state).property!.buildings
    // The ENGINE publishes all of them: the projection caps nothing.
    expect(records.filter((record) => record.role !== 'placed')).toHaveLength(
      property.structures.length,
    )

    const composed = composeWorldBuildings(studioLotSnapshot(state))
    const authored = composed.filter((building) => building.role !== 'placed')
    const drawable = property.structures.filter(
      (structure) => PRESENTATION_BY_BUILDING[structure.id] !== undefined,
    )
    // …and the join draws exactly the ones it has presentation for, plus the retained
    // legacy Annex parcel. A depot the renderer was never taught to draw produces NO
    // body rather than a borrowed one — the documented fail-neutral law.
    expect(authored.map((building) => building.buildingId).sort()).toEqual(
      [...drawable.map((structure) => structure.id), LEGACY_ANNEX_PARCEL_ID].sort(),
    )
    expect(drawable).toHaveLength(8)
    expect(property.structures.length - drawable.length).toBe(16)
    for (const structure of property.structures) {
      if (PRESENTATION_BY_BUILDING[structure.id] !== undefined) continue
      expect(worldBuildingById(composed, structure.id)).toBeNull()
    }
  })
})

describe('C1-M6 — a world id is an identity, not a coordinate', () => {
  it('keeps `placed-<id>` across a move and changes only where the body stands', () => {
    const built = place(fixtureState(SOUTH_YARD_FILE), SOUTH_YARD_EAST)
    const id = studioPlacement(built).placements[0]!.id
    const before = worldBuildingById(composeWorldBuildings(studioLotSnapshot(built)), placedBuildingId(id))!
    expect(before.gx).toBe(SOUTH_YARD_EAST.gx)
    expect(before.gy).toBe(SOUTH_YARD_EAST.gy)

    const moved = moveFacilityAction(built, { placementId: id, origin: SOUTH_YARD_WEST })
    if (!moved.ok) throw new Error(moved.error)
    const after = worldBuildingById(
      composeWorldBuildings(studioLotSnapshot(moved.next)),
      placedBuildingId(id),
    )!

    // The world still addresses the same building by the same id…
    expect(after.buildingId).toBe(before.buildingId)
    expect(after.placeId).toBe(before.placeId)
    expect(after.placedFacilityId).toBe(before.placedFacilityId)
    expect(after.blueprintId).toBe(before.blueprintId)
    expect(after.label).toBe(before.label)
    expect(after.texKey).toBe(before.texKey)
    expect(after.status).toBe(before.status)
    expect(after.role).toBe('placed')
    // …and only its ground, and the anchors that hang off its ground, moved with it.
    expect({ gx: after.gx, gy: after.gy }).toEqual(SOUTH_YARD_WEST)
    expect(after.fw).toBe(before.fw)
    expect(after.fd).toBe(before.fd)
    for (const [name, point] of Object.entries(before.anchors)) {
      expect(after.anchors[name]).toEqual({
        gx: point.gx + (SOUTH_YARD_WEST.gx - SOUTH_YARD_EAST.gx),
        gy: point.gy + (SOUTH_YARD_WEST.gy - SOUTH_YARD_EAST.gy),
      })
    }
  })

  it('gives a successor raised on the dead building’s exact ground its own world id', () => {
    const built = place(fixtureState(SOUTH_YARD_FILE), SOUTH_YARD_EAST)
    const deadId = studioPlacement(built).placements[0]!.id
    const demolished = demolishFacilityAction(built, { placementId: deadId })
    if (!demolished.ok) throw new Error(demolished.error)
    expect(
      worldBuildingById(
        composeWorldBuildings(studioLotSnapshot(demolished.next)),
        placedBuildingId(deadId),
      ),
    ).toBeNull()

    // Same origin, same cells, same parcel. A different building.
    const rebuilt = place(demolished.next, SOUTH_YARD_EAST)
    const successorId = studioPlacement(rebuilt).placements[0]!.id
    expect(successorId).not.toBe(deadId)
    const composed = composeWorldBuildings(studioLotSnapshot(rebuilt))
    expect(worldBuildingById(composed, placedBuildingId(deadId))).toBeNull()
    const successor = worldBuildingById(composed, placedBuildingId(successorId))!
    expect(successor.gx).toBe(SOUTH_YARD_EAST.gx)
    expect(successor.gy).toBe(SOUTH_YARD_EAST.gy)
    expect(successor.buildingId).toBe(placedBuildingId(successorId))
  })
})
