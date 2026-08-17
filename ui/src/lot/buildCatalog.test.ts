// ── C1-M5 — the catalog a player chooses from ────────────────────────────────
//
// The states below are the ENGINE's, driven through real actions on a real managed
// studio: a locked entry is locked because its prerequisite is genuinely not standing,
// and it unlocks because the studio genuinely built one — IN THE SAME SESSION, which is
// the campaign's stale-lock defect in its exact shape.
//
// The pure projection is also exercised directly on synthesized rows, because state
// precedence ("locked outranks spent outranks broke") is a rule about ORDER that a
// studio cannot easily be driven into all four corners of.

import { describe, expect, it } from 'vitest'
import {
  advanceWeek,
  developmentOfficeUplift,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  placeFacilityAction,
  placementQuote,
  signContractAction,
  studioCalendarBoard,
  studioLotSnapshot,
  studioPlacement,
} from '../engine/adapter.ts'
import type { CreativeRole, GameState, PlacementRequest } from '../engine/adapter.ts'
import { lotBuildCatalog, lotCatalogEntry, lotCatalogEntryFor, ownedLabelFor } from './buildCatalog.ts'
import type { LotBlueprintState } from './snapshot/StudioLotSnapshot.ts'
import { lotBuildingInspectorContext } from './buildingInspector.ts'
import { placedBuildingId } from './snapshot/StudioLotSnapshot.ts'
import { blueprintPresentation } from './tycoon/world.ts'
import { composeWorldBuildings, worldBuildingById } from './tycoon/buildings.ts'

const COUNTS: Record<CreativeRole, number> = { actor: 3, director: 1, writer: 3, craft: 1 }

/** The five blueprints M4 shipped, in the engine's own authored order. */
const CATALOG_IDS = [
  'development-casting-annex',
  'development-casting-hall',
  'development-office-2',
  'development-office-3',
  'craft-annex',
] as const

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

/** The first LEGAL origin for one blueprint, from the engine's own quote. */
function legalRequest(
  state: GameState,
  blueprintId: string,
  skip: readonly string[] = [],
): PlacementRequest {
  const view = studioPlacement(state)
  for (const parcel of view.parcels) {
    if (parcel.id === 'expansion' || skip.includes(parcel.id)) continue
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        const request = { blueprintId, origin: { gx, gy } }
        if (placementQuote(state, request).ok) return request
      }
    }
  }
  throw new Error(`no legal site for ${blueprintId}`)
}

function place(state: GameState, request: PlacementRequest): GameState {
  const committed = placeFacilityAction(state, request)
  if (!committed.ok) throw new Error(committed.error)
  return committed.next
}

function completeEverything(state: GameState): GameState {
  let current = state
  const last = Math.max(...studioPlacement(current).placements.map((p) => p.completesWeek))
  while (current.market.tick < last) current = advanceWeek(current).next
  return current
}

function catalogOf(state: GameState) {
  return lotBuildCatalog(studioLotSnapshot(state).placement)
}

/** A synthesized row, for the precedence rules a studio cannot easily be driven into. */
function row(overrides: Partial<LotBlueprintState> = {}): LotBlueprintState {
  return {
    blueprintId: 'test-blueprint',
    name: 'Test Building',
    capability: 'development-casting',
    capacity: 1,
    footprint: { width: 3, depth: 2 },
    clearanceRing: 1,
    requiresRoadAccess: true,
    buildWeeks: 8,
    cost: 500_000,
    weeklyOperatingCost: 2_000,
    affordable: true,
    effectSummary: 'Does a specific, testable thing.',
    available: true,
    unmet: [],
    instanceCount: 0,
    maxInstances: null,
    atInstanceLimit: false,
    buildable: true,
    owned: { operational: 0, underConstruction: 0 },
    ...overrides,
  }
}

describe('C1-M5 — the catalog lists every blueprint, in the studio’s own words', () => {
  it('offers all five, in engine order, each stating what it does', () => {
    const catalog = catalogOf(managedStudio('c1-m5-catalog-shape'))
    expect(catalog.map((entry) => entry.blueprintId)).toEqual([...CATALOG_IDS])
    for (const entry of catalog) {
      // The engine's authored sentence, shown VERBATIM — a full sentence, never a
      // code name, and never re-worded by the list.
      expect(entry.effectSummary.length).toBeGreaterThan(20)
      expect(entry.effectSummary.endsWith('.')).toBe(true)
      expect(entry.effectSummary).not.toMatch(/[a-z]-[a-z]+-[a-z]/)
      expect(entry.cost).toBeGreaterThan(0)
      expect(entry.buildWeeks).toBeGreaterThan(0)
    }
    // A brand-new studio can afford and start four of them; only the office tier
    // gated on another building is out of reach.
    expect(catalog.filter((entry) => entry.state === 'buildable').map((e) => e.blueprintId)).toEqual([
      'development-casting-annex',
      'development-casting-hall',
      'development-office-2',
      'craft-annex',
    ])
  })

  it('states the four blocked states in the engine’s own binding order', () => {
    expect(lotCatalogEntry(row())?.state).toBe('buildable')
    expect(lotCatalogEntry(row({ affordable: false }))?.state).toBe('unaffordable')
    expect(lotCatalogEntry(row({ atInstanceLimit: true }))?.state).toBe('at-limit')
    expect(
      lotCatalogEntry(
        row({ available: false, unmet: [{ reason: 'Needs a thing.', notYetAttainable: false }] }),
      )?.state,
    ).toBe('locked')
    // A studio that is BOTH locked out and broke is told the domain reason, because
    // that is the one it has to solve first — the engine binds them in that order.
    const both = lotCatalogEntry(
      row({
        available: false,
        unmet: [{ reason: 'Needs a thing.', notYetAttainable: false }],
        affordable: false,
        atInstanceLimit: true,
      }),
    )
    expect(both?.state).toBe('locked')
    expect(both?.lockReasons.map((lock) => lock.reason)).toEqual(['Needs a thing.'])
    expect(both?.limitReason).toBeNull()
    expect(both?.affordabilityReason).toBeNull()
    // Only a buildable entry is a way in.
    for (const state of [
      row({ affordable: false }),
      row({ atInstanceLimit: true }),
      row({ available: false, unmet: [{ reason: 'x.', notYetAttainable: true }] }),
    ]) {
      expect(lotCatalogEntry(state)?.selectable).toBe(false)
    }
    expect(lotCatalogEntry(row())?.selectable).toBe(true)
  })

  it('counts what the studio owns without calling a hole in the ground a building', () => {
    expect(ownedLabelFor({ operational: 0, underConstruction: 0 })).toBeNull()
    expect(ownedLabelFor({ operational: 1, underConstruction: 0 })).toBe('1 owned')
    expect(ownedLabelFor({ operational: 0, underConstruction: 1 })).toBe('1 building')
    expect(ownedLabelFor({ operational: 2, underConstruction: 1 })).toBe('2 owned · 1 building')

    // …and the same, driven through a real build.
    let state = managedStudio('c1-m5-owned-counts')
    state = place(state, legalRequest(state, 'development-casting-annex'))
    const building = lotCatalogEntryFor(
      studioLotSnapshot(state).placement,
      'development-casting-annex',
    )!
    expect(building.owned).toEqual({ operational: 0, underConstruction: 1 })
    expect(building.ownedLabel).toBe('1 building')

    state = completeEverything(state)
    const standing = lotCatalogEntryFor(
      studioLotSnapshot(state).placement,
      'development-casting-annex',
    )!
    expect(standing.owned).toEqual({ operational: 1, underConstruction: 0 })
    expect(standing.ownedLabel).toBe('1 owned')
    // The Annex stacks, so owning one does not spend an allowance it does not have.
    expect(standing.state).toBe('buildable')
  })
})

describe('C1-M5 — a lock that a studio can actually clear', () => {
  it('locks Office III with its own sentence, then unlocks it IN THE SAME SESSION', () => {
    let state = managedStudio('c1-m5-office-tier-unlock')

    // LOCKED, and the reason is the engine's own player copy — no code names.
    const locked = lotCatalogEntryFor(studioLotSnapshot(state).placement, 'development-office-3')!
    expect(locked.state).toBe('locked')
    expect(locked.selectable).toBe(false)
    expect(locked.lockReasons).toHaveLength(1)
    expect(locked.lockReasons[0]!.reason.length).toBeGreaterThan(10)
    expect(locked.lockReasons[0]!.reason).not.toMatch(/development-office-2/)
    // It is something the studio can WORK TOWARD, not something the game lacks.
    expect(locked.lockReasons[0]!.notYetAttainable).toBe(false)

    // Building the prerequisite is not enough — it must be OPERATIONAL.
    state = place(state, legalRequest(state, 'development-office-2'))
    const midBuild = lotCatalogEntryFor(studioLotSnapshot(state).placement, 'development-office-3')!
    expect(midBuild.state).toBe('locked')
    expect(midBuild.lockReasons).toHaveLength(1)

    // …and when it completes, the catalog answers differently on the very next read.
    // THE STALE-LOCK DEFECT: nothing is memoised, so no surface can keep showing the
    // old answer to a studio that has changed since it was computed.
    state = completeEverything(state)
    const unlocked = lotCatalogEntryFor(studioLotSnapshot(state).placement, 'development-office-3')!
    expect(unlocked.state).toBe('buildable')
    expect(unlocked.selectable).toBe(true)
    expect(unlocked.lockReasons).toEqual([])

    // And the tier that unlocked it is now spent: one is all the studio may have.
    const spent = lotCatalogEntryFor(studioLotSnapshot(state).placement, 'development-office-2')!
    expect(spent.state).toBe('at-limit')
    expect(spent.selectable).toBe(false)
    expect(spent.limitReason).toBe('The studio builds only one of these, and it already has it.')
    expect(spent.ownedLabel).toBe('1 owned')
  })

  it('names the highest standing tier in the commission form’s line, and only then', () => {
    let state = managedStudio('c1-m5-office-uplift-line')
    expect(developmentOfficeUplift(state)).toBeNull()

    state = completeEverything(place(state, legalRequest(state, 'development-office-2')))
    const tier2 = developmentOfficeUplift(state)
    expect(tier2).not.toBeNull()
    expect(tier2!.name).toBe('Development Office II')
    expect(tier2!.points).toBeGreaterThan(0)

    state = completeEverything(place(state, legalRequest(state, 'development-office-3')))
    const tier3 = developmentOfficeUplift(state)
    // The tiers REPLACE one another, so the higher one is named and its number wins.
    expect(tier3!.name).toBe('Development Office III')
    expect(tier3!.points).toBeGreaterThan(tier2!.points)
  })
})

describe('C1-M5 — every new blueprint is a fully presented world citizen', () => {
  it('gives each its own body and template, and none of them borrows another’s', () => {
    const texKeys = CATALOG_IDS.map((id) => blueprintPresentation(id).texKey)
    expect(new Set(texKeys).size).toBe(CATALOG_IDS.length)
    for (const key of texKeys) expect(key).not.toBe('')
    // The Hall is the biggest development body, so its people stand further out.
    expect(blueprintPresentation('development-casting-hall').anchors.workStandoff).toBeGreaterThan(
      blueprintPresentation('development-casting-annex').anchors.workStandoff,
    )
    // An unauthored blueprint still gets an honest default rather than a borrowed body.
    expect(blueprintPresentation('no-such-blueprint').texKey).toBe('')
  })

  it('inspects an effect-only office honestly — no capacity it does not have', () => {
    let state = managedStudio('c1-m5-office-inspector')
    state = completeEverything(place(state, legalRequest(state, 'development-office-2')))
    const snapshot = studioLotSnapshot(state)
    const placed = snapshot.placement!.placements[0]!
    expect(placed.blueprintId).toBe('development-office-2')

    const context = lotBuildingInspectorContext(
      snapshot,
      placedBuildingId(placed.id),
      studioCalendarBoard(state),
      null,
    )
    expect(context.label).toBe('Development Office II')
    // WHAT IS THIS — the same sentence the catalog sold it with.
    expect(context.role).toBe(
      lotCatalogEntryFor(snapshot.placement, 'development-office-2')!.effectSummary,
    )
    // WHAT IS HAPPENING — operational, and nothing invented about occupancy.
    expect(context.status).toBe('Development Office II is operational.')
    // NO slot facts: it provides no shared capacity, so it reports none.
    expect(context.facts.some((fact) => fact.key.startsWith('facility:'))).toBe(false)
    expect(context.facts.some((fact) => fact.key.startsWith('slot:'))).toBe(false)
    expect(context.occupantFacts).toEqual([])
    // …but its real facts are all there.
    expect(context.facts.find((fact) => fact.key === 'placed:opex')).toBeDefined()
    // It is still a first-class body: move and demolish are offered.
    expect(context.primaryActions.map((action) => action.kind)).toEqual(['move', 'demolish'])
    // …and it stands in the world with its own footprint.
    const body = worldBuildingById(composeWorldBuildings(snapshot), placedBuildingId(placed.id))
    expect(body?.texKey).toBe('tw-office-2')
    expect({ fw: body!.fw, fd: body!.fd }).toEqual({ fw: 3, fd: 2 })
  })

  it('reports real capacity where a blueprint really has it', () => {
    let state = managedStudio('c1-m5-hall-inspector')
    state = completeEverything(place(state, legalRequest(state, 'development-casting-hall')))
    const snapshot = studioLotSnapshot(state)
    const placed = snapshot.placement!.placements[0]!
    const context = lotBuildingInspectorContext(
      snapshot,
      placedBuildingId(placed.id),
      studioCalendarBoard(state),
      null,
    )
    // The Hall DOES add shared slots, so the Calendar has a row for it and the panel
    // prints it — the difference from the office tier is real, not cosmetic.
    expect(context.facts.some((fact) => fact.key === `facility:${placed.facilityId}`)).toBe(true)
    const body = worldBuildingById(composeWorldBuildings(snapshot), placedBuildingId(placed.id))
    expect(body?.texKey).toBe('tw-hall')
    expect({ fw: body!.fw, fd: body!.fd }).toEqual({ fw: 4, fd: 3 })
  })

  it('survives a second placement world and a demolished prerequisite', () => {
    // Two DIFFERENT blueprints standing at once, on two parcels — the "second
    // placement" shape the campaign's defect family keeps reappearing in.
    let state = managedStudio('c1-m5-second-placement')
    const first = legalRequest(state, 'craft-annex')
    state = place(state, first)
    const firstParcel = studioPlacement(state).placements[0]!.parcelId
    state = place(state, legalRequest(state, 'development-office-2', [firstParcel]))
    state = completeEverything(state)

    const catalog = catalogOf(state)
    expect(catalog).toHaveLength(CATALOG_IDS.length)
    // Both are spent (each allows one), and each says so for its own reason.
    for (const id of ['craft-annex', 'development-office-2']) {
      const entry = catalog.find((row2) => row2.blueprintId === id)!
      expect(entry.state).toBe('at-limit')
      expect(entry.ownedLabel).toBe('1 owned')
    }
    // …and the tier they unlocked is genuinely open now.
    expect(catalog.find((row2) => row2.blueprintId === 'development-office-3')!.state).toBe(
      'buildable',
    )
    // Two distinct bodies stand in the world, wearing two distinct textures.
    const composed = composeWorldBuildings(studioLotSnapshot(state))
    const placedBodies = composed.filter((building) => building.role === 'placed')
    expect(placedBodies).toHaveLength(2)
    expect(new Set(placedBodies.map((building) => building.texKey)).size).toBe(2)
  })
})
