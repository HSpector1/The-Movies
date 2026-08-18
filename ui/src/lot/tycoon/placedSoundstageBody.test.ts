// ── C2a-M2 §3.1 — a soundstage the studio BUILT looks like a soundstage ──────
//
// Stage CLASSES are the art unit, not stage instances. The authored-PNG pipeline is a
// per-building, Art-Director-gated process with a private-repo source obligation and it
// does not scale to "N player-placed stages"; the C1-M5 per-blueprint table would need a
// new entry for every stage class anyone ever adds, keyed by a blueprint id the world
// would have to be taught. So the grid world dresses a body with no authored art of its
// own by WHAT IT IS — the engine's own capability term, joined off the committed
// blueprint — and one procedural Soundstage (Standard) body serves every soundstage a
// studio ever builds.
//
// The three claims under test:
//   1. the class body BAKES, once, idempotently, with the founding stage's own geometry;
//   2. a placed soundstage WEARS it — texture, footprint-derived anchors, world body;
//   3. everything else still gets the honest massing block (law 12), unchanged.

import type Phaser from 'phaser'
import { describe, expect, it } from 'vitest'
import { TYCOON_BUILDING_TEX, bakeBlueprintTexture } from './assets.ts'
import {
  DEFAULT_BLUEPRINT_PRESENTATION,
  PLACED_SOUNDSTAGE_TEX_KEY,
  blueprintPresentation,
  placedAnchors,
} from './world.ts'
import { composeWorldBuildings, worldBuildingById } from './buildings.ts'
import { resolvePresenceSite } from './presence.ts'
import type { LotPlacedFacilityState, StudioLotSnapshot } from '../snapshot/StudioLotSnapshot.ts'

// ── a Graphics recorder (the accepted `scene/assets.test.ts` pattern) ─────────

type Op = { fn: string; args: unknown[] }

function recorder(): {
  scene: Phaser.Scene
  ops: Op[]
  textures: { key: string; w: number; h: number }[]
  destroyed: () => number
} {
  const ops: Op[] = []
  const textures: { key: string; w: number; h: number }[] = []
  let destroyed = 0
  const g: Record<string, unknown> = {}
  for (const fn of [
    'fillStyle',
    'lineStyle',
    'beginPath',
    'moveTo',
    'lineTo',
    'closePath',
    'fillPath',
    'strokePath',
    'fillRect',
    'fillCircle',
    'fillEllipse',
    'fillRoundedRect',
    'strokeRoundedRect',
    'strokeCircle',
    'lineBetween',
  ]) {
    g[fn] = (...args: unknown[]) => {
      ops.push({ fn, args })
      return g
    }
  }
  g.generateTexture = (key: string, w: number, h: number) => {
    textures.push({ key, w, h })
    return g
  }
  g.destroy = () => {
    destroyed++
    return g
  }
  const scene = {
    make: { graphics: () => g },
    add: { graphics: () => g },
  } as unknown as Phaser.Scene
  return { scene, ops, textures, destroyed: () => destroyed }
}

/** One 4×4 soundstage the studio built, as the placement projection publishes it. */
function placedSoundstage(overrides: Partial<LotPlacedFacilityState> = {}): LotPlacedFacilityState {
  const cells: { gx: number; gy: number }[] = []
  for (let gy = 20; gy <= 23; gy++) for (let gx = 16; gx <= 19; gx++) cells.push({ gx, gy })
  return {
    id: 7,
    blueprintId: 'soundstage-standard',
    capability: 'soundstage',
    name: 'Soundstage 3',
    facilityId: 'facility-soundstage-3',
    parcelId: 'backlot-apron',
    origin: { gx: 16, gy: 20 },
    cells,
    status: 'operational',
    placedWeek: 30,
    completesWeek: 38,
    weeksRemaining: 0,
    progress01: 1,
    weeklyOperatingCost: 4_000,
    ...overrides,
  }
}

function snapshotWithBuiltStage(placed: LotPlacedFacilityState): StudioLotSnapshot {
  return {
    studioName: 'Project Studio',
    week: 40,
    cash: 6_000_000,
    cashBand: 'stable',
    standing: 'established',
    standingValues: { awareness: 40, prestige: 50, confidence: 60 },
    publicityOffers: [],
    annexWork: null,
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings: [],
    selectedBuildingId: null,
    sceneSeed: 'placed-soundstage',
    property: {
      bounds: { width: 28, depth: 26 },
      buildings: [
        {
          id: 'placed-7',
          label: placed.name,
          role: 'placed',
          origin: { gx: 16, gy: 20 },
          footprint: { width: 4, depth: 4 },
          placedFacilityId: placed.id,
          blueprintId: placed.blueprintId,
          capability: placed.capability,
          status: placed.status,
        },
      ],
    },
  } as unknown as StudioLotSnapshot
}

describe('C2a-M2 — the Soundstage (Standard) class body', () => {
  it('bakes exactly once, at the founding stage’s own footprint and height', () => {
    delete TYCOON_BUILDING_TEX[PLACED_SOUNDSTAGE_TEX_KEY]
    const first = recorder()

    expect(bakeBlueprintTexture(first.scene, PLACED_SOUNDSTAGE_TEX_KEY)).toBe(true)
    expect(first.textures.map((texture) => texture.key)).toEqual([PLACED_SOUNDSTAGE_TEX_KEY])
    expect(first.destroyed()).toBe(1)

    // The founding stages' own geometry: 4 × 4, drawn from the same `bakeStage`.
    const meta = TYCOON_BUILDING_TEX[PLACED_SOUNDSTAGE_TEX_KEY]
    expect(meta).toEqual({
      key: PLACED_SOUNDSTAGE_TEX_KEY,
      originX: 0.5,
      originY: meta!.originY,
      fw: 4,
      fd: 4,
    })
    expect(TYCOON_BUILDING_TEX['tw-stage-a']).toBeUndefined()

    // Idempotent: a studio's fourth stage costs one sprite and zero further bytes.
    const second = recorder()
    expect(bakeBlueprintTexture(second.scene, PLACED_SOUNDSTAGE_TEX_KEY)).toBe(false)
    expect(second.textures).toHaveLength(0)
  })

  it('is reached by CAPABILITY, so no blueprint id has to be taught to the world', () => {
    // An id the renderer has never heard of, carrying the engine's own capability.
    expect(blueprintPresentation('soundstage-standard', 'soundstage').texKey).toBe(
      PLACED_SOUNDSTAGE_TEX_KEY,
    )
    expect(blueprintPresentation('a-stage-class-invented-next-year', 'soundstage').texKey).toBe(
      PLACED_SOUNDSTAGE_TEX_KEY,
    )
  })

  it('never borrows a body: an unauthored non-stage still gets the massing block', () => {
    // C2a-M2 §3.4 EXEMPLAR MOVED, CLAIM UNCHANGED. This assertion is about a capability
    // NOBODY HAS DRAWN, and it used `post` as its example. The §3.4 slate then gave the
    // post class a body of its own, so `post` stopped being an example of the thing
    // under test. A capability that genuinely has no body takes its place; the claim,
    // and its strength, are exactly what they were. (`placedSupportBodies.test.ts` is
    // where the three drawn support classes are proved.)
    expect(blueprintPresentation('some-future-blueprint', 'a-capability-nobody-drew')).toEqual(
      DEFAULT_BLUEPRINT_PRESENTATION,
    )
    expect(blueprintPresentation('some-future-blueprint', undefined)).toEqual(
      DEFAULT_BLUEPRINT_PRESENTATION,
    )
    expect(blueprintPresentation(null, null)).toEqual(DEFAULT_BLUEPRINT_PRESENTATION)
    // And an AUTHORED body for the exact blueprint still wins over its class.
    expect(blueprintPresentation('development-casting-annex', 'soundstage').texKey).toBe('tw-annex')
  })

  it('composes the built stage into the world wearing the stage body', () => {
    const placed = placedSoundstage()
    const world = composeWorldBuildings(snapshotWithBuiltStage(placed))
    const body = worldBuildingById(world, 'placed-7')

    expect(body).not.toBeNull()
    expect(body!.texKey).toBe(PLACED_SOUNDSTAGE_TEX_KEY)
    expect(body!.capability).toBe('soundstage')
    expect(body!.label).toBe('SOUNDSTAGE 3')
    expect({ fw: body!.fw, fd: body!.fd }).toEqual({ fw: 4, fd: 4 })
  })

  it('stands its crew at a 4×4 stage’s door, not at a 3×2 annex’s', () => {
    const stageAnchors = placedAnchors(
      { gx: 16, gy: 20 },
      { width: 4, depth: 4 },
      'soundstage-standard',
      'soundstage',
    )
    const massingAnchors = placedAnchors(
      { gx: 16, gy: 20 },
      { width: 4, depth: 4 },
      'soundstage-standard',
      undefined,
    )

    // Same frontage centre; a stage stands its people further out than the default.
    expect(stageAnchors.work!.gx).toBe(massingAnchors.work!.gx)
    expect(stageAnchors.work!.gy).toBeGreaterThan(massingAnchors.work!.gy)

    // And the presence layer resolves that same site off the engine's own cell list.
    const site = resolvePresenceSite('facility-soundstage-3', [placedSoundstage()])
    expect(site).not.toBeNull()
    expect(site!.kind).toBe('placed')
    expect(site!.work).toEqual(stageAnchors.work)
  })
})

describe('C2a-M2 — a built soundstage says what a soundstage says', () => {
  function inspectorSnapshot(
    operations: Record<string, unknown>[],
  ): StudioLotSnapshot {
    const placed = placedSoundstage()
    const base = snapshotWithBuiltStage(placed) as unknown as Record<string, unknown>
    return {
      ...base,
      operationsMode: 'managed',
      stageAssignmentAuthority: 'engine',
      productionOperations: operations,
      stages: [
        {
          facilityId: 'facility-soundstage-3',
          facilityName: 'Soundstage 3',
          buildingId: 'placed-7',
          origin: 'placed',
          standing: true,
        },
      ],
      buildings: [{ id: 'placed-7', available: true, attention: 'normal' }],
      placement: {
        mode: 'managed',
        currentWeek: 40,
        buildEnabled: true,
        lotWidth: 28,
        lotDepth: 26,
        parcels: [],
        placements: [placed],
        catalog: [],
        weeklyOperatingCost: 4_000,
      },
    } as unknown as StudioLotSnapshot
  }

  it('is dark when nothing shoots in it, and names the picture when one does', async () => {
    const { lotBuildingInspectorContext } = await import('../buildingInspector.ts')

    const dark = lotBuildingInspectorContext(inspectorSnapshot([]), 'placed-7', null, null)
    expect(dark.status).toBe('The stage is dark — no picture is shooting here.')

    const busy = lotBuildingInspectorContext(
      inspectorSnapshot([
        {
          productionId: 'prod-1',
          title: 'Ravine',
          phase: 'shooting',
          phaseLabel: 'Principal photography',
          weeksRemaining: 4,
          progress01: 0.5,
          locationBuildingId: 'placed-7',
          facilityLabel: 'Soundstage 3',
          directorId: 'dir-1',
          directorName: 'A Director',
          taskStatus: 'scheduled',
          statusLabel: 'Shooting on Soundstage 3',
          blocker: null,
          attention: 'active',
          currentCommand: null,
        },
      ]),
      'placed-7',
      null,
      null,
    )
    expect(busy.status).toBe('Ravine · Shooting on Soundstage 3')
    // The sign on the building is the engine's own name, never an invented one.
    expect(busy.label).toBe('Soundstage 3')
  })
})

// ── §3.1 — the PLATE origin's honest fallback (rollback-world maintenance) ────
//
// The plate origin (flag 5178) is the rollback renderer. Its building list is a static
// authored nine and its stage aprons are hand-measured against the painted plate, so it
// composes NO placed bodies at all — and law 27a forbids authoring plate cells for a
// body the painting does not contain. The M2 render gate is the GRID origin; the plate
// gate is this test.
//
// The requirement is that the plate is HONEST rather than silent-and-wrong: it renders
// the founding stages exactly as it always has, and a picture on a stage the studio
// BUILT composes nothing on the plate rather than dressing another stage's apron with
// someone else's picture (law 12).

describe('C2a-M2 §3.1 — the plate origin renders founding stages and stays honest about the rest', () => {
  it('dresses the founding stages and composes nothing for a built one', async () => {
    const { VignetteDirector } = await import('../scene/vignettes.ts')
    const { STAGE_APRONS } = await import('../scene/layout.ts')

    // The plate's authored ground is the founding two, and only the founding two.
    expect(Object.keys(STAGE_APRONS).sort()).toEqual(['stage-a', 'stage-b'])

    const card = (id: string, stageId: string) => ({
      id,
      title: `Picture on ${stageId}`,
      genre: 'Drama',
      stageId,
      progress01: 0.4,
      weeksRemaining: 5,
      active: true,
    })

    function directorFor(stageId: string): {
      director: InstanceType<typeof VignetteDirector>
      snapshot: StudioLotSnapshot
    } {
      const snapshot = {
        studioName: 'Project Studio',
        week: 40,
        cash: 6_000_000,
        cashBand: 'stable',
        standing: 'prestige',
        standingValues: { awareness: 70, prestige: 70, confidence: 70 },
        publicityOffers: [],
        annexWork: null,
        activeProductions: [card('prod-1', stageId)],
        releasedFilms: [],
        releasePresence: 'none',
        latestReleaseTitle: null,
        people: [],
        buildings: [],
        selectedBuildingId: null,
        sceneSeed: 'plate-fallback',
      } as unknown as StudioLotSnapshot
      const host = {
        getSnapshot: () => snapshot,
        acquire: () => 0,
        release: () => undefined,
        setActor: () => undefined,
        emphasizeStage: () => undefined,
        takeFlash: () => undefined,
        marker: () => undefined,
        clearMarker: () => undefined,
        toast: () => undefined,
        setFilmingHush: () => undefined,
      }
      return {
        director: new VignetteDirector(host as never, 'plate-seed'),
        snapshot,
      }
    }

    // A founding stage: the plate composes its established vignettes, unchanged.
    for (const founding of ['stage-a', 'stage-b']) {
      const { director } = directorFor(founding)
      expect(director.force('filming-beat')).toBe(true)
      expect(director.force('stage-preparation')).toBe(true)
      director.destroy()
    }

    // A stage the studio BUILT: the plate has no ground for it and composes nothing.
    // Silence, not a lie — the grid origin is where that body is drawn.
    const built = directorFor('placed-7')
    expect(built.director.force('filming-beat')).toBe(false)
    expect(built.director.force('stage-preparation')).toBe(false)
    expect(built.director.force('production-arrival')).toBe(false)
    expect(built.director.debug().active).toBeNull()
    built.director.destroy()
  })
})
