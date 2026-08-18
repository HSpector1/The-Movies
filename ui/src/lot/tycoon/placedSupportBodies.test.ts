// ── C2a-M2 §3.4 — the three support buildings a studio can now put up ────────
//
// The Soundstage got its class body when the stage ruling landed. The other three
// entries on the §3.4 slate — Post Building, Scenery Shop, Development & Casting
// Office — had none, so a studio that spent $1,150,000 on a Post Building watched a
// grey massing block appear on its ground. Honest (law 12), and unacceptable: a player
// who pays for a building is owed a building.
//
// Every one of them is reached by CAPABILITY, exactly as the stage class is, so the
// world needs to be taught no new blueprint id. Three claims:
//
//   1. each class BAKES, once, idempotently, into its own key;
//   2. a placed facility of that capability WEARS it — sprite, footprint, anchors;
//   3. the two rules that were true before are still true: an AUTHORED body for a
//      specific blueprint still beats its class, and a capability nobody has drawn
//      still gets the honest massing block.

import type Phaser from 'phaser'
import { describe, expect, it } from 'vitest'
import { TYCOON_BUILDING_TEX, bakeBlueprintTexture } from './assets.ts'
import {
  BLUEPRINT_PRESENTATION,
  DEFAULT_BLUEPRINT_PRESENTATION,
  PLACED_DEVELOPMENT_CASTING_TEX_KEY,
  PLACED_POST_TEX_KEY,
  PLACED_SCENERY_TEX_KEY,
  PLACED_SOUNDSTAGE_TEX_KEY,
  blueprintPresentation,
} from './world.ts'
import { composeWorldBuildings, worldBuildingById } from './buildings.ts'
import type { LotPlacedFacilityState, StudioLotSnapshot } from '../snapshot/StudioLotSnapshot.ts'

type Op = { fn: string; args: unknown[] }

function recorder(): {
  scene: Phaser.Scene
  ops: Op[]
  textures: { key: string; w: number; h: number }[]
} {
  const ops: Op[] = []
  const textures: { key: string; w: number; h: number }[] = []
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
  g.destroy = () => g
  const scene = {
    make: { graphics: () => g },
    add: { graphics: () => g },
  } as unknown as Phaser.Scene
  return { scene, ops, textures }
}

/** One 3 × 2 support building the studio built, as the placement projection publishes it. */
function placedSupport(
  id: number,
  blueprintId: string,
  capability: string,
  name: string,
): LotPlacedFacilityState {
  const cells: { gx: number; gy: number }[] = []
  for (let gy = 20; gy <= 21; gy++) for (let gx = 3; gx <= 5; gx++) cells.push({ gx, gy })
  return {
    id,
    blueprintId,
    capability,
    name,
    facilityId: `facility-${blueprintId}-1`,
    parcelId: 'west-lawn',
    origin: { gx: 3, gy: 20 },
    cells,
    status: 'operational',
    placedWeek: 20,
    completesWeek: 34,
    weeksRemaining: 0,
    progress01: 1,
    weeklyOperatingCost: 5_000,
  }
}

function snapshotWith(placed: LotPlacedFacilityState[]): StudioLotSnapshot {
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
    sceneSeed: 'placed-support',
    property: {
      bounds: { width: 28, depth: 26 },
      buildings: placed.map((facility) => ({
        id: `placed-${String(facility.id)}`,
        label: facility.name,
        role: 'placed',
        origin: facility.origin,
        footprint: { width: 3, depth: 2 },
        placedFacilityId: facility.id,
        blueprintId: facility.blueprintId,
        capability: facility.capability,
        status: facility.status,
      })),
    },
  } as unknown as StudioLotSnapshot
}

const SLATE: readonly { capability: string; blueprintId: string; texKey: string; name: string }[] = [
  { capability: 'post', blueprintId: 'post-building', texKey: PLACED_POST_TEX_KEY, name: 'Post Building 2' },
  {
    capability: 'set-scenery',
    blueprintId: 'scenery-shop',
    texKey: PLACED_SCENERY_TEX_KEY,
    name: 'Scenery Shop 2',
  },
  {
    capability: 'development-casting',
    blueprintId: 'development-casting-office',
    texKey: PLACED_DEVELOPMENT_CASTING_TEX_KEY,
    name: 'Development & Casting Office',
  },
]

describe('C2a-M2 §3.4 — each support class has a body of its own', () => {
  it('bakes once, idempotently, at the 3 × 2 footprint the blueprints author', () => {
    for (const entry of SLATE) {
      delete TYCOON_BUILDING_TEX[entry.texKey]
      const first = recorder()
      expect(bakeBlueprintTexture(first.scene, entry.texKey)).toBe(true)
      expect(first.textures.map((texture) => texture.key)).toEqual([entry.texKey])
      const meta = TYCOON_BUILDING_TEX[entry.texKey]
      expect(meta).toBeDefined()
      expect({ fw: meta!.fw, fd: meta!.fd }).toEqual({ fw: 3, fd: 2 })
      // A second request for a key already baked costs nothing and draws nothing.
      const second = recorder()
      expect(bakeBlueprintTexture(second.scene, entry.texKey)).toBe(false)
      expect(second.ops).toHaveLength(0)
    }
  })

  it('the four class bodies are four DIFFERENT bodies', () => {
    // The point of a class body is that a player can tell two buildings apart. Four
    // distinct keys, and — the claim that actually matters — four distinct drawings.
    const keys = [
      PLACED_SOUNDSTAGE_TEX_KEY,
      PLACED_POST_TEX_KEY,
      PLACED_SCENERY_TEX_KEY,
      PLACED_DEVELOPMENT_CASTING_TEX_KEY,
    ]
    expect(new Set(keys).size).toBe(4)
    const drawn = new Map<string, string>()
    for (const key of keys) {
      delete TYCOON_BUILDING_TEX[key]
      const scene = recorder()
      expect(bakeBlueprintTexture(scene.scene, key)).toBe(true)
      drawn.set(key, JSON.stringify(scene.ops))
    }
    expect(new Set(drawn.values()).size).toBe(4)
  })

  it('a placed facility wears its class body, and stands where the engine put it', () => {
    for (const [index, entry] of SLATE.entries()) {
      const placed = placedSupport(index + 1, entry.blueprintId, entry.capability, entry.name)
      expect(blueprintPresentation(placed.blueprintId, placed.capability).texKey).toBe(entry.texKey)
      const body = worldBuildingById(
        composeWorldBuildings(snapshotWith([placed])),
        `placed-${String(placed.id)}`,
      )
      expect(body).not.toBeNull()
      expect(body!.texKey).toBe(entry.texKey)
      expect({ fw: body!.fw, fd: body!.fd }).toEqual({ fw: 3, fd: 2 })
      // A 3 × 2 support building keeps the Annex's own standoffs: its people stand on
      // the centre line of the frontage (gx 3..5 ⇒ 4.5), the template's distance beyond
      // the front face (gy 21) — exactly where the Annex's own crew stand.
      expect(body!.anchors.work).toEqual({
        gx: 4.5,
        gy: 21 + DEFAULT_BLUEPRINT_PRESENTATION.anchors.workStandoff,
      })
    }
  })

  it('an AUTHORED body still beats its class, and an undrawn class still gets the block', () => {
    // The Craft Annex carries the `set-scenery` capability AND its own authored art.
    // The specific truth about that building wins — it does not become a scenery shop.
    expect(blueprintPresentation('craft-annex', 'set-scenery').texKey).toBe(
      BLUEPRINT_PRESENTATION['craft-annex']!.texKey,
    )
    expect(blueprintPresentation('craft-annex', 'set-scenery').texKey).not.toBe(PLACED_SCENERY_TEX_KEY)
    // The four C1 development blueprints keep their own bodies against the new class.
    for (const blueprintId of [
      'development-casting-annex',
      'development-office-2',
      'development-office-3',
      'development-casting-hall',
    ]) {
      expect(blueprintPresentation(blueprintId, 'development-casting').texKey).toBe(
        BLUEPRINT_PRESENTATION[blueprintId]!.texKey,
      )
    }
    // A capability nobody has drawn is still honest, and still refuses to bake.
    expect(blueprintPresentation('theme-park', 'roller-coaster')).toBe(DEFAULT_BLUEPRINT_PRESENTATION)
    expect(bakeBlueprintTexture(recorder().scene, 'tw-nobody-drew-this')).toBe(false)
  })
})
