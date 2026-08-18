// ── C1-M6 CLAIM 1 — a SECOND ZONE, produced by DATA ALONE ────────────────────
//
// Owner ruling 4: "28×26 is the starting property, NOT the maximum; parcels are data;
// no coordinates-as-identity." This file is the engine half of the first claim's proof.
// The browser half is `ui/e2e/expanded-property-second-zone-v1.spec.ts`.
//
// The subject is the COMMITTED FIXTURE on disk — `ui/e2e/expanded-property-v1/
// week-0-south-yard-second-zone.save.json` — not a property this file builds for its
// own convenience. That matters: the fixture is what the browser loads, so proving the
// engine and the browser against the same bytes is what makes the two halves one claim.
//
// The evidence chain is closed here rather than trusted: the manifest's byteLength and
// sha256 are RE-COMPUTED from the file, and the file is put back through the live save
// boundary and asserted byte-identical. If the fixture is ever edited by hand, or the
// generator drifts from what it wrote, this file fails before any expandability claim
// is even reached.
//
// WHAT IS NOT CLAIMED: nothing here ships. `INITIAL_PROPERTY` is untouched and asserted
// so; the 28×26 starting lot is what a new studio still gets. Land acquisition is
// Campaign 3's mechanic, and this is a fixture-level architecture proof.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  INITIAL_PROPERTY,
  LEGACY_EXPANSION_PARCEL_ID,
  LOT_DEPTH,
  LOT_WIDTH,
  PLACEMENT_REJECTION_ORDER,
  parcelReservedBlueprintId,
  assertStudioPlacementInvariants,
  cellKey,
  commitPlacement,
  exportSave,
  importSave,
  makeSave,
  makeSaveV13,
  migrateToV14,
  parcelById,
  parcelHasRoadFrontage,
  placementWouldSeverLot,
  queryPlacement,
  stableStringify,
  studioPlacementView,
  tick,
  validateSaveV13,
} from '../src/core/index.js'
import {
  CRAFT_ANNEX_BLUEPRINT,
  DEVELOPMENT_CASTING_ANNEX_BLUEPRINT,
  DEVELOPMENT_OFFICE_3_BLUEPRINT,
} from '../src/core/tuning.js'
import type { GameState, LotCell, PlacementQuote } from '../src/core/index.js'

const ANNEX = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id
const FIXTURE_DIRECTORY = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'ui',
  'e2e',
  'expanded-property-v1',
)
const FIXTURE_ID = 'week-0-south-yard-second-zone'

type ManifestFixture = {
  id: string
  file: string
  saveVersion: number
  byteLength: number
  sha256: string
  seed: string
  claim: {
    bounds: { width: number; depth: number }
    parcelIds: string[]
    buildableParcelIds: string[]
    roadServedParcelIds: string[]
    structureIds: string[]
    placementCount: number
    zone: {
      name: string
      addedDepth: number
      addedRoads: number
      addedParcels: string[]
      buildSites: string[]
      unservedGround: string
      protectedGround: string
    }
  }
}

type Manifest = {
  schemaVersion: string
  generatedBy: string
  reproduceCommand: string
  authority: Record<string, unknown>
  fixtures: ManifestFixture[]
}

const manifest = JSON.parse(
  readFileSync(join(FIXTURE_DIRECTORY, 'manifest.json'), 'utf8'),
) as Manifest
const entry = manifest.fixtures.find((candidate) => candidate.id === FIXTURE_ID)!
const fixtureBytes = readFileSync(join(FIXTURE_DIRECTORY, entry.file), 'utf8')

/** The fixture world, through the live import boundary — never a hand-built state. */
function southYardStudio(): GameState {
  return migrateToV14(importSave(fixtureBytes)).state
}

/** The founding property's own answer to the same question, for the contrast. */
function foundingPropertyStudio(): GameState {
  const state = southYardStudio()
  return { ...state, property: JSON.parse(JSON.stringify(INITIAL_PROPERTY)) as GameState['property'] }
}

function at(gx: number, gy: number, blueprintId: string = ANNEX) {
  return { blueprintId, origin: { gx, gy } }
}

/** The exact key set a quote has always had. A grammar change would move this. */
const QUOTE_KEYS = [
  'blueprintId',
  'capability',
  'capacityDelta',
  'cellLegality',
  'cells',
  'completesOnWeek',
  'cost',
  'instanceCount',
  'maxInstances',
  'ok',
  'origin',
  'parcelId',
  'primary',
  'rejections',
  'unmetRequirements',
  'weeklyOperatingCost',
  'buildWeeks',
].sort()

function quoteKeys(quote: PlacementQuote): string[] {
  return Object.keys(quote).sort()
}

// ── the evidence chain ───────────────────────────────────────────────────────

describe('C1-M6 (1) — the committed second-zone fixture is what the generator claimed', () => {
  it('matches the manifest byte for byte, and names its own reproduction', () => {
    expect(manifest.schemaVersion).toBe('c1-m6-expanded-property-fixtures-v1')
    expect(manifest.generatedBy).toBe('scripts/gen-expanded-property-fixtures.mts')
    expect(manifest.reproduceCommand).toBe(
      'node_modules/.bin/vite-node scripts/gen-expanded-property-fixtures.mts',
    )
    // The generator claims no canvas anchor and no structural tuple — this fixture's
    // world differs from the pinned Week-0 studios BY DESIGN, and a digest of its
    // canvas would be a claim nobody could act on.
    expect(manifest.authority.claimsCanvasAnchors).toBe(false)
    expect(manifest.authority.claimsStructuralTuples).toBe(false)
    expect(manifest.authority.shipsToPlayers).toBe(false)
    expect(manifest.authority.initialPropertyUntouched).toBe(true)

    expect(Buffer.byteLength(fixtureBytes, 'utf8')).toBe(entry.byteLength)
    expect(createHash('sha256').update(fixtureBytes, 'utf8').digest('hex')).toBe(entry.sha256)
    expect(entry.saveVersion).toBe(13)
  })

  it('validates as SaveFileV13 and round-trips byte-identically at the live boundary', () => {
    const envelope = JSON.parse(fixtureBytes) as { saveVersion: number }
    expect(envelope.saveVersion).toBe(13)
    // The V13 validator runs the ONE placement authority over the whole state — property
    // bounds, every road and parcel rectangle, structure geometry, provides-links, and
    // every V12 placement law — against the property the FILE carries.
    expect(() => validateSaveV13(JSON.parse(fixtureBytes))).not.toThrow()

    // C2a-M1: the committed fixture is a GENUINE V13 file — the live format moved
    // on, the file did not. Migrating it up and writing it back down through the
    // frozen V13 builder reproduces its bytes exactly, which is the whole claim:
    // the migration adds only what a V13 file could never describe.
    const reloaded = migrateToV14(importSave(fixtureBytes))
    expect(reloaded.saveVersion).toBe(14)
    expect(exportSave(makeSaveV13(reloaded.state))).toBe(fixtureBytes)
    // …and the live V14 envelope round-trips byte-identically too, twice over.
    const liveJson = exportSave(makeSave(reloaded.state))
    expect(exportSave(makeSave(migrateToV14(importSave(liveJson)).state))).toBe(liveJson)
    expect(() => assertStudioPlacementInvariants(reloaded.state)).not.toThrow()
  })
})

// ── the zone itself ──────────────────────────────────────────────────────────

describe('C1-M6 (1) — the property carries a second buildable zone', () => {
  it('is bigger than the founding property, and purely additively so', () => {
    const state = southYardStudio()
    const property = state.property

    expect(property.bounds).toEqual({ width: LOT_WIDTH, depth: 34 })
    expect(INITIAL_PROPERTY.bounds).toEqual({ width: LOT_WIDTH, depth: LOT_DEPTH })
    expect(property.bounds.depth).toBeGreaterThan(INITIAL_PROPERTY.bounds.depth)

    // Every founding road, parcel, and structure is carried through VERBATIM and in
    // its original order. The zone is added; nothing founding is rewritten.
    expect(stableStringify(property.roads.slice(0, INITIAL_PROPERTY.roads.length))).toBe(
      stableStringify(INITIAL_PROPERTY.roads),
    )
    expect(stableStringify(property.parcels.slice(0, INITIAL_PROPERTY.parcels.length))).toBe(
      stableStringify(INITIAL_PROPERTY.parcels),
    )
    expect(stableStringify(property.structures)).toBe(
      stableStringify(INITIAL_PROPERTY.structures),
    )

    // The zone, as the manifest describes it.
    expect(property.parcels.map((parcel) => parcel.id).slice(INITIAL_PROPERTY.parcels.length)).toEqual([
      'south-yard-west',
      'south-yard-east',
      'south-yard-back',
      'south-yard-tank',
    ])
    expect(entry.claim.zone.addedDepth).toBe(8)
    expect(entry.claim.zone.addedRoads).toBe(2)
    expect(entry.claim.parcelIds).toEqual(property.parcels.map((parcel) => parcel.id))
  })

  it('reproduces the founding property’s whole rule surface on the new ground', () => {
    const property = southYardStudio().property
    const west = parcelById(property, 'south-yard-west')!
    const east = parcelById(property, 'south-yard-east')!
    const back = parcelById(property, 'south-yard-back')!
    const tank = parcelById(property, 'south-yard-tank')!

    // Two road-served build sites…
    expect(west.terrain).toBe('buildable')
    expect(east.terrain).toBe('buildable')
    expect(parcelHasRoadFrontage(property, west)).toBe(true)
    expect(parcelHasRoadFrontage(property, east)).toBe(true)
    // …one buildable parcel no truck can reach, so `noRoadAccess` is live down here…
    expect(back.terrain).toBe('buildable')
    expect(parcelHasRoadFrontage(property, back)).toBe(false)
    // …and one owned-but-protected pad, so `terrainUnbuildable` has a real subject.
    expect(tank.terrain).toBe('blocked')
  })

  it('leaves the AUTHORED initial property completely untouched', () => {
    // The fixture is a savegame, not a change to what a new studio starts on.
    expect(INITIAL_PROPERTY.bounds).toEqual({ width: 28, depth: 26 })
    expect(INITIAL_PROPERTY.parcels).toHaveLength(10)
    expect(INITIAL_PROPERTY.parcels.map((parcel) => parcel.id)).not.toContain('south-yard-west')
    expect(Object.isFrozen(INITIAL_PROPERTY)).toBe(true)
    expect(Object.isFrozen(INITIAL_PROPERTY.parcels)).toBe(true)
  })
})

// ── legality accepts a build there ───────────────────────────────────────────

describe('C1-M6 (1) — placement legality accepts a build in the second zone', () => {
  it('calls legal, on ground that was OFF-LOT a property ago', () => {
    const state = southYardStudio()
    const origin = { gx: 12, gy: 30 } // the origin of `south-yard-east`

    // The identical request, against the founding property: this ground did not exist.
    expect(queryPlacement(foundingPropertyStudio(), at(origin.gx, origin.gy)).primary).toBe('offLot')

    const quote = queryPlacement(state, at(origin.gx, origin.gy))
    expect(quote.rejections).toEqual([])
    expect(quote.ok).toBe(true)
    expect(quote.parcelId).toBe('south-yard-east')
    expect(quote.cost).toBe(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capex)
    expect(quote.cells).toHaveLength(
      DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.footprint.width *
        DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.footprint.depth,
    )
    expect(quote.cellLegality.every((verdict) => verdict.ok)).toBe(true)
  })

  it('commits, completes, and pays its way, all on the new zone', () => {
    const state = southYardStudio()
    const committed = commitPlacement(state, at(12, 30))
    expect(committed).not.toBe(state)
    expect(committed.studio.cash).toBe(state.studio.cash - DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capex)

    const placed = committed.placement.facilities[0]!
    expect(placed.parcelId).toBe('south-yard-east')
    expect(placed.status).toBe('underConstruction')
    expect(() => assertStudioPlacementInvariants(committed)).not.toThrow()

    let operational = committed
    for (let week = 0; week < DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks; week++) {
      operational = tick(operational)
    }
    const finished = operational.placement.facilities[0]!
    expect(finished.status).toBe('operational')
    expect(finished.parcelId).toBe('south-yard-east')
    // The shared-capacity registry gained the facility, on ground the founding
    // property never had.
    expect(
      operational.operations.facilities.some((facility) => facility.id === finished.facilityId),
    ).toBe(true)
    expect(() => assertStudioPlacementInvariants(operational)).not.toThrow()

    // The read model the whole UI is built on reports the bigger property.
    const view = studioPlacementView(operational)
    expect(view.lotWidth).toBe(28)
    expect(view.lotDepth).toBe(34)
    expect(view.parcels.map((parcel) => parcel.id)).toContain('south-yard-east')
    expect(view.parcels.find((parcel) => parcel.id === 'south-yard-east')!.placedFacilityIds).toEqual([
      finished.id,
    ])

    // …and the whole grown world round-trips at the live boundary.
    const json = exportSave(makeSave(operational))
    const reloaded = migrateToV14(importSave(json))
    expect(exportSave(makeSave(reloaded.state))).toBe(json)
    expect(stableStringify(reloaded.state.property)).toBe(stableStringify(operational.property))
    expect(reloaded.state.placement.facilities).toEqual(operational.placement.facilities)
  })
})

// ── the quote grammar is unchanged ───────────────────────────────────────────
//
// "Unchanged" is two separate claims and both are proved: the VOCABULARY (the ordered
// rejection codes) is identical, and every one of those codes is LIVE on the new
// ground, meaning exactly what it means on the old. A zone that could only ever be
// legal or off-lot would be a hole in the rule set, not an expansion of the property.

describe('C1-M6 (1) — the quote grammar is unchanged in the second zone', () => {
  it('pins the identical ordered vocabulary', () => {
    expect(PLACEMENT_REJECTION_ORDER).toEqual([
      'unknownBlueprint',
      'offLot',
      'notOwned',
      'terrainUnbuildable',
      // C1-M8 extends the vocabulary by one GROUND code (`groundReserved`), which
      // this fixture answers on its own ground below. Nothing else moved.
      'groundReserved',
      'occupied',
      'clearanceRing',
      'noRoadAccess',
      'seversLot',
      'requirementsUnmet',
      'instanceLimit',
      'insufficientFunds',
    ])
  })

  it('answers a new-zone quote with the identical quote shape', () => {
    const state = southYardStudio()
    const founding = queryPlacement(state, at(3, 19)) // `south-lawn`, the old zone
    const newZone = queryPlacement(state, at(12, 30)) // `south-yard-east`, the new one
    const unknown = queryPlacement(state, at(12, 30, 'no-such-blueprint'))
    expect(quoteKeys(founding)).toEqual(QUOTE_KEYS)
    expect(quoteKeys(newZone)).toEqual(QUOTE_KEYS)
    expect(quoteKeys(unknown)).toEqual(QUOTE_KEYS)
    expect(founding.ok).toBe(true)
    expect(newZone.ok).toBe(true)
  })

  it('keeps every rejection code live on the new ground, in the binding order', () => {
    const state = southYardStudio()
    const seen = new Set<string>()
    const record = (quote: PlacementQuote): PlacementQuote => {
      for (const code of quote.rejections) seen.add(code)
      // The ordering law holds for every one of these, on the new ground.
      const indices = quote.rejections.map((code) => PLACEMENT_REJECTION_ORDER.indexOf(code))
      expect(indices).toEqual([...indices].sort((a, b) => a - b))
      expect(quote.primary).toBe(quote.rejections[0] ?? null)
      return quote
    }

    // unknownBlueprint — a catalog miss, addressed at a new-zone origin.
    expect(record(queryPlacement(state, at(12, 30, 'no-such-blueprint'))).primary).toBe(
      'unknownBlueprint',
    )
    // offLot — the footprint runs off the BOTTOM of the grown property.
    expect(record(queryPlacement(state, at(12, 33))).rejections).toContain('offLot')
    // notOwned — new ground that belongs to no parcel.
    expect(record(queryPlacement(state, at(0, 26))).rejections).toContain('notOwned')
    // terrainUnbuildable — the protected tank pad, which answers WORD FOR WORD as the
    // founding property's protected courtyard does: owned, not buildable, and (like the
    // courtyard) with no road touching it either. Same two codes, same order, on two
    // pieces of ground eight rows and one milestone apart.
    const courtyard = record(queryPlacement(state, at(7, 10)))
    const tankPad = record(queryPlacement(state, at(22, 30)))
    expect(tankPad.rejections).toEqual(['terrainUnbuildable', 'noRoadAccess'])
    expect(tankPad.rejections).toEqual(courtyard.rejections)
    // noRoadAccess — the unserved back ground. Exactly one thing is wrong with it.
    expect(record(queryPlacement(state, at(23, 26))).rejections).toEqual(['noRoadAccess'])
    // requirementsUnmet — a locked catalog entry is locked in the new zone too.
    expect(
      record(queryPlacement(state, at(12, 30, DEVELOPMENT_OFFICE_3_BLUEPRINT.id))).rejections,
    ).toEqual(['requirementsUnmet'])

    // occupied + clearanceRing — against a building the studio actually put there.
    const built = commitPlacement(state, at(12, 30))
    expect(built).not.toBe(state)
    expect(record(queryPlacement(built, at(12, 30))).rejections).toContain('occupied')
    expect(record(queryPlacement(built, at(15, 30))).rejections).toEqual(['clearanceRing'])

    // instanceLimit — an allowance used up by a building standing in the NEW zone.
    const craft = commitPlacement(state, at(12, 30, CRAFT_ANNEX_BLUEPRINT.id))
    expect(craft).not.toBe(state)
    expect(record(queryPlacement(craft, at(2, 30, CRAFT_ANNEX_BLUEPRINT.id))).rejections).toEqual([
      'instanceLimit',
    ])

    // insufficientFunds — always last, never masking a domain failure.
    const poor: GameState = { ...state, studio: { ...state.studio, cash: 1_000 } }
    expect(record(queryPlacement(poor, at(12, 30))).rejections).toEqual(['insufficientFunds'])
    expect(record(queryPlacement(poor, at(22, 30))).rejections).toEqual([
      'terrainUnbuildable',
      'noRoadAccess',
      'insufficientFunds',
    ])

    // groundReserved — C1-M8. This code belongs to ground an authored contract HOLDS,
    // and the grown property still holds exactly the one the founding property did: the
    // legacy Annex pad, carried by PARCEL ID rather than by coordinates, with the new
    // zone adding none of its own. A generic blueprint is refused there on the grown
    // property exactly as on the founding one — growing the property may not quietly
    // hand the contract's ground to something else.
    expect(
      state.property.parcels
        .filter((parcel) => parcelReservedBlueprintId(parcel.id) !== null)
        .map((parcel) => parcel.id),
    ).toEqual([LEGACY_EXPANSION_PARCEL_ID])
    const reserved = record(queryPlacement(state, at(7, 15, CRAFT_ANNEX_BLUEPRINT.id)))
    expect(reserved.primary).toBe('groundReserved')
    expect(reserved.cellLegality.every((verdict) => verdict.rejection === 'groundReserved')).toBe(
      true,
    )
    // …and the contract's OWN blueprint still answers `ok` on its own ground.
    expect(queryPlacement(state, at(7, 15)).ok).toBe(true)

    // seversLot — the severance walk BINDS on the new ground. It is asked of the one
    // authority directly, exactly as `placement-lot.test.ts` asks it: the clearance
    // ring keeps two placements a cell apart, so a placement-built bottleneck cannot
    // be constructed through commits. What matters is that the rule sees the new
    // property, and it does.
    const property = state.property
    const candidate: LotCell[] = [
      { gx: 25, gy: 32 },
      { gx: 26, gy: 32 },
      { gx: 25, gy: 33 },
      { gx: 26, gy: 33 },
    ]
    // On open new ground it severs nothing…
    expect(placementWouldSeverLot(property, new Set<string>(), candidate)).toBe(false)
    // …but with the ground above it already occupied, the same candidate seals the
    // last two cells of the property's new south-east corner off from everything
    // else, and the walk says so.
    const blocked = new Set<string>(
      [
        { gx: 25, gy: 31 },
        { gx: 26, gy: 31 },
        { gx: 27, gy: 31 },
        { gx: 24, gy: 32 },
        { gx: 24, gy: 33 },
      ].map(cellKey),
    )
    expect(placementWouldSeverLot(property, blocked, candidate)).toBe(true)
    seen.add('seversLot')

    // Every code in the vocabulary was exercised on, or against, the new zone.
    expect([...seen].sort()).toEqual([...PLACEMENT_REJECTION_ORDER].sort())
  })
})
