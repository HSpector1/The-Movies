// ── C1-M1b — the world's building set is engine state, at any count ───────────
//
// The campaign's twice-found defect family is overly strict CLOSED-WORLD predicates:
// a nine-shaped union, a single-annex assumption, a first-placement-only world. This
// file is the acceptance surface for that family on the renderer side. Every case runs
// against a REAL managed studio driven through the engine's own commit and completion
// path — never a hand-written placement literal — and the headline case stands THREE
// facilities on three different parcels, because two is where a "one extra" assumption
// hides and three is where it dies.
//
// It also pins the milestone's other promise: at Week 0, on the initial property, the
// composed world is field-for-field what the hand-authored one was.

import { describe, expect, it } from 'vitest'
import {
  advanceWeek,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  placeFacilityAction,
  placementQuote,
  signContractAction,
  startDevelopmentCastingAnnexAction,
  studioCalendarBoard,
  studioLotSnapshot,
  studioPlacement,
} from '../../engine/adapter.ts'
import type { CreativeRole, GameState, PlacementRequest } from '../../engine/adapter.ts'
import {
  ALL_BUILDING_IDS,
  FOUNDING_BUILDING_IDS,
  buildingActionFor,
  buildingLabelFor,
  isFoundingBuildingId,
  placedBuildingId,
  placedFacilityIdOf,
} from '../snapshot/StudioLotSnapshot.ts'
import { operationalAnnexWorkContext } from '../snapshot/annexWork.ts'
import { lotBuildingInspectorContext } from '../buildingInspector.ts'
import {
  INITIAL_WORLD_BUILDINGS,
  LEGACY_ANNEX_PARCEL_ID,
  composeWorldBuildings,
  worldBounds,
  worldBuildingById,
} from './buildings.ts'
import { resolvePresenceSite } from './presence.ts'
import { PRESENTATION_BY_BUILDING, WORLD_PLACES, anchorsAt, placedAnchors } from './world.ts'

const COUNTS: Record<CreativeRole, number> = { actor: 3, director: 1, writer: 2, craft: 1 }

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

/**
 * The first LEGAL placement on a parcel the studio has not built on yet, taken from the
 * engine's own parcel map and its own quote. No coordinate in this file is authored.
 */
function nextPlacementRequest(state: GameState, usedParcels: readonly string[]): PlacementRequest {
  const view = studioPlacement(state)
  const blueprint = view.catalog[0]
  if (blueprint === undefined) throw new Error('the placement catalog is empty')
  for (const parcel of view.parcels) {
    if (parcel.id === LEGACY_ANNEX_PARCEL_ID) continue
    if (usedParcels.includes(parcel.id)) continue
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        const request = { blueprintId: blueprint.blueprintId, origin: { gx, gy } }
        if (placementQuote(state, request).ok) return request
      }
    }
  }
  throw new Error('no legal placement remains on an unused parcel')
}

function place(state: GameState, request: PlacementRequest): GameState {
  const committed = placeFacilityAction(state, request)
  if (!committed.ok) throw new Error(committed.error)
  return committed.next
}

/** Run the engine's own weeks until every committed placement is operational. */
function completeEveryPlacement(state: GameState): GameState {
  let current = state
  const last = Math.max(...studioPlacement(current).placements.map((p) => p.completesWeek))
  let guard = 0
  while (current.market.tick < last) {
    current = advanceWeek(current).next
    if (++guard > 400) throw new Error('placements never completed')
  }
  return current
}

/** A managed studio with THREE facilities standing on three different parcels. */
function threePlacedFacilities(seed: string): GameState {
  let state = managedStudio(seed)
  const used: string[] = []
  for (let index = 0; index < 3; index++) {
    const request = nextPlacementRequest(state, used)
    const quote = placementQuote(state, request)
    expect(quote.ok).toBe(true)
    used.push(quote.parcelId!)
    state = place(state, request)
  }
  expect(new Set(used).size).toBe(3)
  return completeEveryPlacement(state)
}

describe('C1-M1b — Week-0 parity: the composed world IS the authored one', () => {
  it('composes the initial property into exactly the hand-authored nine places', () => {
    const snapshot = studioLotSnapshot(managedStudio('c1-m1b-week-0-parity'))
    const composed = composeWorldBuildings(snapshot)

    expect(composed).toHaveLength(WORLD_PLACES.length)
    expect(composed.map((building) => building.buildingId)).toEqual(
      WORLD_PLACES.map((place) => place.buildingId),
    )
    for (const [index, place] of WORLD_PLACES.entries()) {
      const building = composed[index]!
      expect(building.placeId).toBe(place.placeId)
      expect(building.label).toBe(place.label)
      expect(building.texKey).toBe(place.texKey)
      expect(building.gx).toBe(place.gx)
      expect(building.gy).toBe(place.gy)
      expect(building.fw).toBe(place.fw)
      expect(building.fd).toBe(place.fd)
      // Bit-for-bit, not merely close: the world is painted from these numbers.
      expect(building.anchors).toEqual(place.anchors)
    }
    expect(worldBounds(snapshot)).toEqual({ width: 28, depth: 26 })
  })

  it('re-expresses an authored body’s anchors identically at its surveyed origin', () => {
    for (const place of WORLD_PLACES) {
      const presentation = PRESENTATION_BY_BUILDING[place.buildingId]!
      expect(anchorsAt(presentation, presentation.surveyedAt)).toEqual(presentation.anchors)
      // …and carries them with the body when it stands somewhere else.
      const moved = anchorsAt(presentation, {
        gx: presentation.surveyedAt.gx + 2,
        gy: presentation.surveyedAt.gy + 3,
      })
      for (const [name, point] of Object.entries(presentation.anchors)) {
        expect(moved[name]).toEqual({ gx: point.gx + 2, gy: point.gy + 3 })
      }
    }
  })

  it('falls back to the authored composition when a snapshot carries no property', () => {
    const snapshot = studioLotSnapshot(managedStudio('c1-m1b-property-less'))
    const { property: _dropped, ...propertyLess } = snapshot
    expect(composeWorldBuildings(propertyLess)).toEqual([...INITIAL_WORLD_BUILDINGS])
    expect(worldBounds(propertyLess)).toEqual({ width: 28, depth: 26 })
  })

  it('agrees with the ENGINE about where every authored body stands', () => {
    const snapshot = studioLotSnapshot(managedStudio('c1-m1b-engine-alignment'))
    const records = snapshot.property?.buildings ?? []
    // Eight authored structures; the Annex parcel is deliberately not one of them.
    expect(records.filter((record) => record.role !== 'placed')).toHaveLength(8)
    expect(records.some((record) => record.id === LEGACY_ANNEX_PARCEL_ID)).toBe(false)
    for (const record of records) {
      const authored = WORLD_PLACES.find((place) => place.buildingId === record.id)
      if (authored === undefined) throw new Error(`unauthored structure ${record.id}`)
      expect({ gx: record.origin.gx, gy: record.origin.gy }).toEqual({
        gx: authored.gx,
        gy: authored.gy,
      })
      expect(record.footprint).toEqual({ width: authored.fw, depth: authored.fd })
    }
  })
})

describe('C1-M1b — THREE placed facilities are three first-class world citizens', () => {
  it('gives each its own id, label, ground and anchors, on the snapshot and in the world', () => {
    const state = threePlacedFacilities('c1-m1b-three-placed')
    const snapshot = studioLotSnapshot(state)
    const placements = studioPlacement(state).placements
    expect(placements).toHaveLength(3)
    expect(new Set(placements.map((placed) => placed.parcelId)).size).toBe(3)

    const records = (snapshot.property?.buildings ?? []).filter(
      (record) => record.role === 'placed',
    )
    expect(records).toHaveLength(3)
    expect(records.map((record) => record.id)).toEqual(
      placements.map((placed) => placedBuildingId(placed.id)),
    )
    // Distinct ids, distinct engine names, distinct ground — no id collapses onto another.
    expect(new Set(records.map((record) => record.id)).size).toBe(3)
    expect(new Set(records.map((record) => record.label)).size).toBe(3)

    const composed = composeWorldBuildings(snapshot)
    expect(composed).toHaveLength(WORLD_PLACES.length + 3)
    // Paint order: the authored reading order, then the Annex parcel, then placements
    // by ascending placement id.
    expect(composed.slice(0, WORLD_PLACES.length).map((building) => building.buildingId)).toEqual(
      WORLD_PLACES.map((place) => place.buildingId),
    )

    for (const placed of placements) {
      const id = placedBuildingId(placed.id)
      expect(placedFacilityIdOf(id)).toBe(placed.id)
      expect(isFoundingBuildingId(id)).toBe(false)

      const building = worldBuildingById(composed, id)
      if (building === null) throw new Error(`no composed body for ${id}`)
      expect(building.role).toBe('placed')
      expect(building.placedFacilityId).toBe(placed.id)
      expect(building.blueprintId).toBe(placed.blueprintId)
      expect(building.status).toBe('operational')
      expect(building.label).toBe(placed.name.toUpperCase())
      expect({ gx: building.gx, gy: building.gy }).toEqual(placed.origin)
      // Its anchors are the blueprint's own template over the engine's own footprint.
      expect(building.anchors).toEqual(
        placedAnchors(
          { gx: building.gx, gy: building.gy },
          { width: building.fw, depth: building.fd },
          placed.blueprintId,
        ),
      )

      // …and the world's own label lookup names it from the engine, not from a table.
      expect(buildingLabelFor(id, snapshot.property)).toBe(placed.name)
      expect(buildingActionFor(id)).toBe('view-expansion')
    }
  })

  it('carries an availability and attention record for each, alongside the founding nine', () => {
    const state = threePlacedFacilities('c1-m1b-three-building-states')
    const snapshot = studioLotSnapshot(state)
    const placements = studioPlacement(state).placements

    for (const id of FOUNDING_BUILDING_IDS) {
      expect(snapshot.buildings.filter((building) => building.id === id)).toHaveLength(1)
    }
    for (const placed of placements) {
      const matches = snapshot.buildings.filter(
        (building) => building.id === placedBuildingId(placed.id),
      )
      expect(matches).toHaveLength(1)
      expect(matches[0]!.available).toBe(true)
      expect(matches[0]!.attention).toBe('normal')
      expect(matches[0]!.attentionReason).toBe('Operational')
    }
    expect(snapshot.buildings).toHaveLength(FOUNDING_BUILDING_IDS.length + 3)
    expect(new Set(snapshot.buildings.map((building) => building.id)).size).toBe(
      snapshot.buildings.length,
    )
  })

  it('inspects each of the three as itself — name, ground, cost and capacity', () => {
    const state = threePlacedFacilities('c1-m1b-three-inspector')
    const snapshot = studioLotSnapshot(state)
    const calendar = studioCalendarBoard(state)
    const placements = studioPlacement(state).placements

    const seen = new Set<string>()
    for (const placed of placements) {
      const context = lotBuildingInspectorContext(
        snapshot,
        placedBuildingId(placed.id),
        calendar,
        null,
      )
      expect(context.buildingId).toBe(placedBuildingId(placed.id))
      expect(context.label).toBe(placed.name)
      // C1-M5: "what is this" is the blueprint's own authored effect sentence — the
      // same words the catalog used to sell it. The NAME is the heading above it.
      expect(context.role).toBe(
        snapshot.placement!.catalog.find((entry) => entry.blueprintId === placed.blueprintId)!
          .effectSummary,
      )
      expect(context.status).toContain(placed.name)
      expect(context.deepLabel).toBe('Studio Development')
      seen.add(context.label)

      const detail = (key: string): string | undefined =>
        context.facts.find((fact) => fact.key === key)?.detail
      expect(detail('placed:name')).toBe(placed.name)
      expect(detail('placed:progress')).toBe(
        `Operational since Week ${String(placed.completesWeek)}`,
      )
      expect(detail('placed:opex')).toBeDefined()
      // Its OWN facility's slot record, not another facility's.
      expect(detail(`facility:${placed.facilityId}`)).toBeDefined()
      for (const other of placements) {
        if (other.facilityId === placed.facilityId) continue
        expect(detail(`facility:${other.facilityId}`)).toBeUndefined()
      }
    }
    // Three panels, three different facilities — none collapsed onto the first.
    expect(seen.size).toBe(3)
  })

  it('resolves a distinct presence site for each, from its own blueprint template', () => {
    const state = threePlacedFacilities('c1-m1b-three-presence')
    const snapshot = studioLotSnapshot(state)
    const placements = snapshot.placement?.placements ?? []
    expect(placements).toHaveLength(3)
    const composed = composeWorldBuildings(snapshot)

    const sites = placements.map((placed) =>
      resolvePresenceSite(placed.facilityId, placements, composed),
    )
    for (const [index, site] of sites.entries()) {
      const placed = placements[index]!
      if (site === null) throw new Error('a standing facility resolved no presence site')
      if (site.kind !== 'placed') throw new Error('a built facility resolved to an authored place')
      expect(site.placedId).toBe(placed.id)
      const building = worldBuildingById(composed, placedBuildingId(placed.id))!
      const anchors = placedAnchors(
        { gx: building.gx, gy: building.gy },
        { width: building.fw, depth: building.fd },
        placed.blueprintId,
      )
      expect(site.work).toEqual(anchors.work)
      expect(site.wait).toEqual(anchors.wait)
    }
    const keys = sites.map((site) => (site?.kind === 'placed' ? site.placedId : null))
    expect(new Set(keys).size).toBe(3)
  })

  it('reports a truthful construction countdown before any of them is finished', () => {
    let state = managedStudio('c1-m1b-three-under-construction')
    const used: string[] = []
    for (let index = 0; index < 3; index++) {
      const request = nextPlacementRequest(state, used)
      used.push(placementQuote(state, request).parcelId!)
      state = place(state, request)
    }
    const snapshot = studioLotSnapshot(state)
    const placements = studioPlacement(state).placements
    expect(placements.every((placed) => placed.status === 'underConstruction')).toBe(true)

    for (const placed of placements) {
      const id = placedBuildingId(placed.id)
      const building = worldBuildingById(composeWorldBuildings(snapshot), id)
      expect(building?.status).toBe('underConstruction')

      const context = lotBuildingInspectorContext(snapshot, id, studioCalendarBoard(state), null)
      expect(context.status).toContain('under construction')
      expect(
        context.facts.find((fact) => fact.key === 'placed:progress')?.detail,
      ).toContain(`due Week ${String(placed.completesWeek)}`)
      // A building site is not open for business, and the snapshot says so.
      const fact = snapshot.buildings.find((entry) => entry.id === id)
      expect(fact?.available).toBe(false)
      expect(fact?.attention).toBe('active')
    }
  })
})

describe('C1-M1b — the legacy Annex contract survives every other placement', () => {
  it('keeps `expansion` as the Annex with two more facilities standing elsewhere', () => {
    let state = managedStudio('c1-m1b-legacy-annex-plus-two')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    const used: string[] = []
    for (let index = 0; index < 2; index++) {
      const request = nextPlacementRequest(state, used)
      used.push(placementQuote(state, request).parcelId!)
      state = place(state, request)
    }
    state = completeEveryPlacement(state)

    const placements = studioPlacement(state).placements
    expect(placements).toHaveLength(3)
    const legacy = placements.filter((placed) => placed.parcelId === LEGACY_ANNEX_PARCEL_ID)
    expect(legacy).toHaveLength(1)

    const snapshot = studioLotSnapshot(state)
    // The legacy Annex is NEVER given a placed id: it is addressed as `expansion`.
    const placedIds = (snapshot.property?.buildings ?? [])
      .filter((record) => record.role === 'placed')
      .map((record) => record.placedFacilityId)
    expect(placedIds).not.toContain(legacy[0]!.id)
    expect(placedIds).toHaveLength(2)
    expect(snapshot.buildings.filter((building) => building.id === 'expansion')).toHaveLength(1)

    // Every accepted `expansion` fact still reads exactly as the Annex specs pin it.
    const annexFact = snapshot.buildings.find((building) => building.id === 'expansion')!
    expect(annexFact.constructionStatus).toBe('operational')
    expect(annexFact.constructionProgress01).toBe(1)
    expect(annexFact.constructionProgressText).toBe(
      `Operational since Week ${String(legacy[0]!.completesWeek)}`,
    )
    expect(ALL_BUILDING_IDS).toContain('expansion')
    expect(buildingActionFor('expansion')).toBe('view-expansion')
    expect(buildingLabelFor('expansion', snapshot.property)).toBe('Development & Casting Annex')

    // The one-slot Annex work projection still resolves through the extra facilities.
    const work = operationalAnnexWorkContext(snapshot)
    expect(work).not.toBeNull()
    expect(work?.annexWork.facilityId).toBe('facility-development-casting-annex')
    expect(work?.annexWork.capacity).toBe(1)

    // And the world still paints ONE body on that ground: the parcel place itself.
    const composed = composeWorldBuildings(snapshot)
    expect(composed.filter((building) => building.buildingId === 'expansion')).toHaveLength(1)
    expect(worldBuildingById(composed, 'expansion')?.role).toBe('parcel')
    expect(composed).toHaveLength(WORLD_PLACES.length + 2)

    // The retained Annex inspector is untouched by the neighbours.
    const context = lotBuildingInspectorContext(
      snapshot,
      'expansion',
      studioCalendarBoard(state),
      null,
    )
    expect(context.label).toBe('Development & Casting Annex')
    expect(context.deepLabel).toBe('Studio Development')
  })
})
