// ── C2a-M2 — the §3.4 buildable slate ────────────────────────────────────────
//
// Four blueprints that close the build-path gap: before this milestone the
// catalog held ZERO soundstage, ZERO post and ZERO effective set-scenery, so a
// studio could add development desks and nothing else.
//
// Every number is pinned here, and so are the two GROUND constraints the §3.4
// placement sweep measured (`docs/c2-planning/16-placement-sweep.md`, published
// at HEAD f3d4313):
//
//   * a support building must be at most THREE cells wide — only three
//     road-served parcels are four wide and the two additional stages take the
//     only two that are available, so a four-wide support building makes the C2a
//     slate stop fitting and flips the dropped-spur verdict;
//   * the soundstage is 4x4 with clearance ring 1 and road access required —
//     the exact shape the sweep quoted at all 123 origins.
//
// The sweep is evidence, not folklore: these assertions are what stop a later
// price or size edit from silently invalidating it.

import { describe, expect, it } from 'vitest'
import {
  BASELINE_DEVELOPMENT_CASTING_BLUEPRINT,
  DEVELOPMENT_CASTING_ANNEX_BLUEPRINT,
  DEVELOPMENT_CASTING_HALL_BLUEPRINT,
  FACILITY_BLUEPRINTS,
  POST_BUILDING_BLUEPRINT,
  SCENERY_SHOP_BLUEPRINT,
  STAGE_BLUEPRINTS,
  STAGE_STANDARD_BLUEPRINT,
  TUNING,
} from '../src/core/tuning.js'
import { blueprintById } from '../src/core/index.js'
import type { FacilityBlueprint } from '../src/core/index.js'

const SLATE: readonly FacilityBlueprint[] = [
  STAGE_STANDARD_BLUEPRINT,
  POST_BUILDING_BLUEPRINT,
  SCENERY_SHOP_BLUEPRINT,
  BASELINE_DEVELOPMENT_CASTING_BLUEPRINT,
]

const SUPPORT: readonly FacilityBlueprint[] = [
  POST_BUILDING_BLUEPRINT,
  SCENERY_SHOP_BLUEPRINT,
  BASELINE_DEVELOPMENT_CASTING_BLUEPRINT,
]

describe('C2a-M2 — the §3.4 slate closes the build-path gap', () => {
  it('ships one blueprint for each capability the catalog could not reach', () => {
    for (const blueprint of SLATE) {
      expect(blueprintById(blueprint.id)).toBe(blueprint)
      expect(FACILITY_BLUEPRINTS).toContain(blueprint)
    }
    expect(STAGE_STANDARD_BLUEPRINT.capability).toBe('soundstage')
    expect(POST_BUILDING_BLUEPRINT.capability).toBe('post')
    expect(SCENERY_SHOP_BLUEPRINT.capability).toBe('set-scenery')
    expect(BASELINE_DEVELOPMENT_CASTING_BLUEPRINT.capability).toBe('development-casting')
    // Each of the three genuinely NEW capabilities is now buildable, and each is
    // buildable at a REAL capacity — a capacity-0 entry would be an effect
    // building wearing a capability's name.
    for (const blueprint of SLATE) expect(blueprint.capacity).toBeGreaterThan(0)
  })

  it('names the stage classes as their own list', () => {
    expect(STAGE_BLUEPRINTS).toEqual([STAGE_STANDARD_BLUEPRINT])
    for (const blueprint of STAGE_BLUEPRINTS) expect(blueprint.capability).toBe('soundstage')
  })

  it('pins every authored number to its TUNING constant', () => {
    const pinned = [
      [
        STAGE_STANDARD_BLUEPRINT,
        TUNING.STAGE_STANDARD_CAPEX,
        TUNING.STAGE_STANDARD_BUILD_WEEKS,
        TUNING.STAGE_STANDARD_WEEKLY_OPERATING_COST,
        TUNING.STAGE_STANDARD_SIMULTANEOUS_PRODUCTIONS,
        TUNING.STAGE_STANDARD_FOOTPRINT_WIDTH,
        TUNING.STAGE_STANDARD_FOOTPRINT_DEPTH,
        TUNING.STAGE_STANDARD_CLEARANCE,
      ],
      [
        POST_BUILDING_BLUEPRINT,
        TUNING.POST_BUILDING_CAPEX,
        TUNING.POST_BUILDING_BUILD_WEEKS,
        TUNING.POST_BUILDING_WEEKLY_OPERATING_COST,
        TUNING.POST_BUILDING_CAPACITY,
        TUNING.POST_BUILDING_FOOTPRINT_WIDTH,
        TUNING.POST_BUILDING_FOOTPRINT_DEPTH,
        TUNING.POST_BUILDING_CLEARANCE,
      ],
      [
        SCENERY_SHOP_BLUEPRINT,
        TUNING.SCENERY_SHOP_CAPEX,
        TUNING.SCENERY_SHOP_BUILD_WEEKS,
        TUNING.SCENERY_SHOP_WEEKLY_OPERATING_COST,
        TUNING.SCENERY_SHOP_CAPACITY,
        TUNING.SCENERY_SHOP_FOOTPRINT_WIDTH,
        TUNING.SCENERY_SHOP_FOOTPRINT_DEPTH,
        TUNING.SCENERY_SHOP_CLEARANCE,
      ],
      [
        BASELINE_DEVELOPMENT_CASTING_BLUEPRINT,
        TUNING.BASELINE_DEVELOPMENT_CASTING_CAPEX,
        TUNING.BASELINE_DEVELOPMENT_CASTING_BUILD_WEEKS,
        TUNING.BASELINE_DEVELOPMENT_CASTING_WEEKLY_OPERATING_COST,
        TUNING.BASELINE_DEVELOPMENT_CASTING_CAPACITY,
        TUNING.BASELINE_DEVELOPMENT_CASTING_FOOTPRINT_WIDTH,
        TUNING.BASELINE_DEVELOPMENT_CASTING_FOOTPRINT_DEPTH,
        TUNING.BASELINE_DEVELOPMENT_CASTING_CLEARANCE,
      ],
    ] as const
    for (const [
      blueprint,
      capex,
      weeks,
      opex,
      capacity,
      width,
      depth,
      ring,
    ] of pinned) {
      const label = blueprint.id
      expect(blueprint.capex, label).toBe(capex)
      expect(blueprint.buildWeeks, label).toBe(weeks)
      expect(blueprint.weeklyOperatingCost, label).toBe(opex)
      expect(blueprint.capacity, label).toBe(capacity)
      expect(blueprint.footprint, label).toEqual({ width, depth })
      expect(blueprint.clearanceRing, label).toBe(ring)
      // Every one of these is a construction site before it is a building, and a
      // site needs truck access.
      expect(blueprint.requiresRoadAccess, label).toBe(true)
    }
  })

  it('holds every authored number inside its stated range', () => {
    for (const blueprint of SLATE) {
      const label = blueprint.id
      expect(Number.isInteger(blueprint.capex), label).toBe(true)
      expect(blueprint.capex, label).toBeGreaterThan(0)
      expect(Number.isInteger(blueprint.buildWeeks), label).toBe(true)
      expect(blueprint.buildWeeks, label).toBeGreaterThanOrEqual(1)
      expect(Number.isInteger(blueprint.weeklyOperatingCost), label).toBe(true)
      expect(blueprint.weeklyOperatingCost, label).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(blueprint.capacity), label).toBe(true)
      expect(Number.isInteger(blueprint.clearanceRing), label).toBe(true)
      expect(blueprint.clearanceRing, label).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(blueprint.footprint.width), label).toBe(true)
      expect(Number.isInteger(blueprint.footprint.depth), label).toBe(true)
      expect(blueprint.footprint.width, label).toBeGreaterThanOrEqual(1)
      expect(blueprint.footprint.depth, label).toBeGreaterThanOrEqual(1)
      // Cash is the ONLY active gate: rank, certificate, award, research and land
      // are all still unattainable kinds, so declaring one would put an
      // unreachable promise on a catalog card.
      expect(blueprint.requires, label).toEqual([])
      // A whole sentence in the player's language, ending in a full stop.
      expect(blueprint.effectSummary.trim().endsWith('.'), label).toBe(true)
      expect(blueprint.effectSummary, label).not.toMatch(
        /blueprintId|capacity:|TUNING|operational placement|facilityId|C2a/,
      )
    }
  })

  it('honours the sweep: the stage is 4x4, and NO support building is 4 wide', () => {
    expect(STAGE_STANDARD_BLUEPRINT.footprint).toEqual({ width: 4, depth: 4 })
    expect(STAGE_STANDARD_BLUEPRINT.clearanceRing).toBe(1)
    for (const blueprint of SUPPORT) {
      expect(
        blueprint.footprint.width,
        `${blueprint.id} is wider than the sweep's three-cell ceiling`,
      ).toBeLessThanOrEqual(3)
    }
  })

  it('leaves the ground question answered without a spur — no new parcel is authored', () => {
    // §3.4's condition was "if the sweep shows the C2a slate does not fit". It
    // fits (case A: two stages + Post + Scenery + office, all road-served), so
    // the pre-authorized north-back-lot road spur is DROPPED and this milestone
    // authors no ground at all. The parcel that would have carried it is still
    // road-less and still refuses every origin.
    const northBackLot = 'north-back-lot'
    expect(FACILITY_BLUEPRINTS.every((blueprint) => blueprint.id !== northBackLot)).toBe(true)
  })

  it('takes the founding names verbatim, per the display-name ruling', () => {
    // §3.1: the engine facility name is the single spoken authority. The buildable
    // Post Building and Scenery Shop are second instances of the founding class
    // and say so by carrying the founding names exactly.
    expect(POST_BUILDING_BLUEPRINT.name).toBe('Post Building')
    expect(SCENERY_SHOP_BLUEPRINT.name).toBe('Scenery Shop')
    expect(STAGE_STANDARD_BLUEPRINT.name).toBe('Soundstage')
    // …and a built stage is never anonymous beside Soundstage 7 and Soundstage 12.
    expect(STAGE_STANDARD_BLUEPRINT.numberedInstances).toBe(true)
  })

  it('never lets a new entry silently retire an incumbent', () => {
    // The baseline office is the closest thing in the catalog to the Hall and to
    // the Annex, and it is deliberately not a free upgrade to either: dearer per
    // slot than the Hall, dearer in absolute terms than the Annex. A catalog entry
    // that dominates a frozen owner-law building on every axis would quietly
    // delete a decision the player already made.
    const office = BASELINE_DEVELOPMENT_CASTING_BLUEPRINT
    const hall = DEVELOPMENT_CASTING_HALL_BLUEPRINT
    const annex = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT
    expect(office.capacity).toBe(hall.capacity)
    expect(office.capex).toBeGreaterThan(hall.capex)
    expect(office.capex).toBeGreaterThan(annex.capex)
    // What it buys instead is time and — the constraint the sweep proved actually
    // binds — three-cell-wide ground.
    expect(office.buildWeeks).toBeLessThan(hall.buildWeeks)
    expect(office.footprint.width).toBeLessThan(hall.footprint.width)
  })

  it('prices the soundstage at the top of the catalog, because it is', () => {
    // It is the only entry that adds a production LINE rather than a slot inside
    // one, and the only 4x4 body on the lot.
    for (const blueprint of FACILITY_BLUEPRINTS) {
      if (blueprint.id === STAGE_STANDARD_BLUEPRINT.id) continue
      expect(STAGE_STANDARD_BLUEPRINT.capex, blueprint.id).toBeGreaterThan(blueprint.capex)
      expect(
        STAGE_STANDARD_BLUEPRINT.weeklyOperatingCost,
        blueprint.id,
      ).toBeGreaterThan(blueprint.weeklyOperatingCost)
    }
    expect(STAGE_STANDARD_BLUEPRINT.capacity).toBe(TUNING.FOUNDING_SOUNDSTAGE_CAPACITY)
  })

  it('reproduces the founding capacities on the two second-instance buildings', () => {
    expect(POST_BUILDING_BLUEPRINT.capacity).toBe(TUNING.FOUNDING_POST_CAPACITY)
    expect(SCENERY_SHOP_BLUEPRINT.capacity).toBe(TUNING.FOUNDING_SCENERY_CAPACITY)
    expect(BASELINE_DEVELOPMENT_CASTING_BLUEPRINT.capacity).toBe(
      TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY,
    )
  })

  it('keeps every identity unique across the whole widened catalog', () => {
    const ids = new Set<string>()
    const facilityBases = new Set<string>()
    const projectBases = new Set<string>()
    const notes = new Set<string>()
    for (const blueprint of FACILITY_BLUEPRINTS) {
      expect(ids.has(blueprint.id), blueprint.id).toBe(false)
      expect(facilityBases.has(blueprint.facilityIdBase), blueprint.id).toBe(false)
      expect(projectBases.has(blueprint.projectIdBase), blueprint.id).toBe(false)
      expect(notes.has(blueprint.ledgerNote), blueprint.id).toBe(false)
      ids.add(blueprint.id)
      facilityBases.add(blueprint.facilityIdBase)
      projectBases.add(blueprint.projectIdBase)
      notes.add(blueprint.ledgerNote)
    }
  })

  it('keeps every facility id base clear of the FOUNDING facility ids', () => {
    // The frozen historical-boundary guards detect a placed facility by the prefix
    // `${facilityIdBase}-`. A base of `facility-soundstage` would make the
    // founding `facility-soundstage-07` and `-12` look like V12 placements to
    // every one of those guards — which is exactly the collision this asserts is
    // gone, in both directions.
    const founding = [
      'facility-development-casting',
      'facility-post-building',
      'facility-scenery-shop',
      'facility-soundstage-07',
      'facility-soundstage-12',
    ]
    for (const blueprint of FACILITY_BLUEPRINTS) {
      for (const foundingId of founding) {
        expect(
          foundingId.startsWith(`${blueprint.facilityIdBase}-`),
          `${foundingId} would be read as a placement of ${blueprint.id}`,
        ).toBe(false)
      }
    }
  })
})
