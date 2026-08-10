// ── Lane D: the authored-stage substitution ───────────────────────────────────
// Phaser cannot be imported under jsdom, so authoredStage.ts is written against the two
// tiny structural slices of a Scene it actually touches (a loader and a texture manager).
// That is what makes the mechanism testable here rather than only in a browser.
//
// What these specs are protecting:
//   • the flag is OFF unless asked, and OFF leaves the registry byte-identical;
//   • the substitution replaces exactly ONE stage and nothing else;
//   • fw/fd stay 4x4 — layout.ts:69-73 derives placement from them, so a wrong footprint
//     would silently MOVE the building rather than fail;
//   • bad metadata REFUSES the swap instead of applying it, so an unverified candidate
//     render degrades to the procedural stage;
//   • the authored anchor reproduces the baked stage's anchor, which is what keeps the
//     ground shadow, the 52%-face signage plaque and the hover label in place.

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type Phaser from 'phaser'
import { beforeEach, describe, expect, it } from 'vitest'
import { bakeAllTextures, BUILDING_TEX } from './assets.ts'
import {
  AUTHORED_STAGE,
  applyAuthoredStage,
  authoredStageOrigin,
  expectedAnchorY,
  expectedTextureWidth,
  isAuthoredStageTexture,
  queueAuthoredStage,
  validateAuthoredStage,
  type AuthoredStageMeta,
} from './authoredStage.ts'
import { TILE_W, TILE_H } from './iso.ts'

/** The bake needs a Graphics-shaped scene; it never adds anything to a display list. */
function bakeScene(): Phaser.Scene {
  const g: Record<string, unknown> = {}
  for (const fn of [
    'fillStyle', 'lineStyle', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'fillPath',
    'strokePath', 'fillRect', 'fillCircle', 'fillEllipse', 'fillRoundedRect',
    'strokeRoundedRect', 'strokeCircle',
  ]) {
    g[fn] = () => g
  }
  g.generateTexture = () => g
  g.destroy = () => g
  return { make: { graphics: () => g } } as unknown as Phaser.Scene
}

/** A texture manager holding exactly the images you name, at the sizes you name. */
function textureHost(loaded: Record<string, { width: number; height: number }>) {
  return {
    textures: {
      exists: (k: string) => Object.prototype.hasOwnProperty.call(loaded, k),
      get: (k: string) => ({ getSourceImage: () => loaded[k]! }),
    },
  }
}

/** A loader that records what was queued. */
function loaderHost() {
  const queued: { key: string; url: string }[] = []
  return { queued, load: { image: (key: string, url: string) => queued.push({ key, url }) } }
}

/**
 * The wired render's real dimensions — candidate A, 4x4 at the contract's 128 px/tile.
 * It is 4 px TALLER than the baked Stage B texture (378 vs 374): the authored massing
 * peaks higher, and the contract anchors on the ground, not on the canvas top. Kept in
 * sync with the file on disk by spec 14.
 */
const AUTHORED_PNG = { width: 512, height: 378 }
const loadedOk = () => textureHost({ [AUTHORED_STAGE.texKey]: AUTHORED_PNG })

beforeEach(() => {
  // Distinct stages: the mode the experiment runs in. Rebaked per test so one spec's
  // substitution cannot leak into the next.
  bakeAllTextures(bakeScene(), { distinctStages: true })
})

describe('authored stage — the asset declaration', () => {
  it('1. carries the frozen 4×4 footprint and the contract anchor for a 512×378 render', () => {
    const m = AUTHORED_STAGE.meta
    expect(m).toEqual({ anchorX: 256, anchorY: 250, fwTiles: 4, fdTiles: 4, pxPerTile: 128 })
    expect(m.pxPerTile).toBe(TILE_W)
    expect(m.pxPerTile / 2).toBe(TILE_H)
    // width  = (fw + fd) * TILE_W/2 ; anchorY = texH - (4×4 ground diamond) / 2
    expect(expectedTextureWidth(m)).toBe(AUTHORED_PNG.width)
    expect(expectedAnchorY(m, AUTHORED_PNG.height)).toBe(AUTHORED_PNG.height - 128)
    expect(m.anchorY).toBe(expectedAnchorY(m, AUTHORED_PNG.height))
  })

  it('2. resolves the PNG through the bundler — the lot’s first loaded asset', () => {
    expect(typeof AUTHORED_STAGE.url).toBe('string')
    expect(AUTHORED_STAGE.url.length).toBeGreaterThan(0)
    expect(AUTHORED_STAGE.url).toMatch(/authored-stage.*\.png$/)
  })

  it('3. uses a texture key that collides with no baked texture, worn variants included', () => {
    const baked = Object.values(BUILDING_TEX).map((t) => t.key)
    expect(baked).not.toContain(AUTHORED_STAGE.texKey)
    // `${key}-ud` must not exist either, or the under-dressed finish swap could steal it.
    expect(baked).not.toContain(`${AUTHORED_STAGE.texKey}-ud`)
    expect(isAuthoredStageTexture(AUTHORED_STAGE.texKey)).toBe(true)
    expect(isAuthoredStageTexture(BUILDING_TEX.stageB!.key)).toBe(false)
  })

  it('14. the declared metadata matches the PNG actually on disk', () => {
    // Everything above validates the metadata against a MOCK texture size. This reads the
    // real file's IHDR, so dropping in a candidate whose height differs without updating
    // `anchorY` fails here — at `npm test` — instead of silently degrading to the
    // procedural stage the first time somebody opens the lot with the flag on.
    // (resolved from the cwd, not from import.meta.url — under Vite's transform that URL is
    // an http one and readFileSync refuses it. Both plausible cwds are tried; if neither
    // holds the file the read throws, which is a loud failure rather than a silent skip.)
    const rel = 'ui/src/lot/scene/authored/authored-stage.png'
    const fromRoot = resolve(process.cwd(), rel)
    const png = readFileSync(existsSync(fromRoot) ? fromRoot : resolve(process.cwd(), '..', rel))
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG')
    const width = png.readUInt32BE(16)
    const height = png.readUInt32BE(20)
    expect({ width, height }).toEqual(AUTHORED_PNG)
    expect(validateAuthoredStage(AUTHORED_STAGE.meta, width, height, BUILDING_TEX.stageB)).toBeNull()
  })
})

describe('authored stage — the flag is off unless asked', () => {
  it('4. queues nothing when off, and the PNG under its texture key when on', () => {
    const off = loaderHost()
    expect(queueAuthoredStage(off, false)).toBe(false)
    expect(off.queued).toEqual([])

    const on = loaderHost()
    expect(queueAuthoredStage(on, true)).toBe(true)
    expect(on.queued).toEqual([{ key: AUTHORED_STAGE.texKey, url: AUTHORED_STAGE.url }])
  })

  it('5. off leaves the whole registry exactly as baked', () => {
    const before = structuredClone(BUILDING_TEX)
    expect(applyAuthoredStage(loadedOk(), false)).toEqual({ applied: false, reason: 'flag-off' })
    expect(BUILDING_TEX).toEqual(before)
  })

  it('6. on but never loaded (404, offline, cancelled) degrades to the procedural stage', () => {
    const before = structuredClone(BUILDING_TEX)
    const out = applyAuthoredStage(textureHost({}), true)
    expect(out).toEqual({ applied: false, reason: 'texture-missing' })
    expect(BUILDING_TEX).toEqual(before)
  })
})

describe('authored stage — the substitution', () => {
  it('7. replaces exactly one stage, keeps 4×4, and derives the origin from the file', () => {
    const stageABefore = BUILDING_TEX.stageA
    const others = Object.fromEntries(
      Object.entries(BUILDING_TEX).filter(([k]) => k !== 'stageB'),
    )

    expect(applyAuthoredStage(loadedOk(), true)).toEqual({ applied: true, reason: 'ok' })

    expect(BUILDING_TEX.stageB).toEqual({
      key: AUTHORED_STAGE.texKey,
      originX: 256 / 512,
      originY: 250 / 378,
      fw: 4,
      fd: 4,
    })
    // every other entry — Stage A included — is untouched, by identity not just by value
    expect(BUILDING_TEX.stageA).toBe(stageABefore)
    for (const [k, v] of Object.entries(others)) expect(BUILDING_TEX[k]).toBe(v)
  })

  it('8. anchors on the same GROUND point as the baked stage — band and shadow hold, and the plaque drift is bounded', () => {
    // Stage B bakes at 512×374 with its ground centre 128 px above the bottom row
    // (originY = (128 + 92 + 26) / 374). The authored render is 4 px TALLER, so the origin
    // *ratio* necessarily differs; what must never differ is the anchor's distance from the
    // bottom edge, because that is what stands the sprite on the ground.
    const BAKED_H = 374
    const bakedOriginY = BUILDING_TEX.stageB!.originY
    expect((1 - bakedOriginY) * BAKED_H).toBeCloseTo(128, 9)

    applyAuthoredStage(loadedOk(), true)
    const authoredOriginY = BUILDING_TEX.stageB!.originY
    expect((1 - authoredOriginY) * AUTHORED_PNG.height).toBeCloseTo(128, 9)
    expect(BUILDING_TEX.stageB!.originX).toBe(0.5)

    // The consequences, as numbers instead of an assumption:
    //   • ground shadow (LotScene:424) sits at the container origin  → unmoved;
    //   • accent band   (LotScene:565) h * (1 - originY) - 6         → 122 px on both;
    //   • stage plaque  (LotScene:521) faceY(0.52) = h * (0.52 - originY) → rides 1.92 px
    //     higher, because the render is 4 px taller. Bounded at 4 px here so a future
    //     candidate tall enough to sling the plaque off the face FAILS this spec instead
    //     of shipping a floating sign.
    const bandY = (h: number, oy: number) => h * (1 - oy) - 6
    expect(bandY(AUTHORED_PNG.height, authoredOriginY)).toBeCloseTo(bandY(BAKED_H, bakedOriginY), 9)

    const faceY = (h: number, oy: number, frac: number) => -h * oy + h * frac
    const drift =
      faceY(AUTHORED_PNG.height, authoredOriginY, 0.52) - faceY(BAKED_H, bakedOriginY, 0.52)
    expect(drift).toBeCloseTo(-1.92, 6)
    expect(Math.abs(drift)).toBeLessThan(4)
  })

  it('9. is idempotent — a second apply changes nothing', () => {
    applyAuthoredStage(loadedOk(), true)
    const after = structuredClone(BUILDING_TEX)
    expect(applyAuthoredStage(loadedOk(), true)).toEqual({ applied: true, reason: 'ok' })
    expect(BUILDING_TEX).toEqual(after)
  })
})

describe('authored stage — a render that disagrees with its metadata is REFUSED', () => {
  const base = AUTHORED_STAGE.meta
  const withMeta = (m: Partial<AuthoredStageMeta>) => ({ ...AUTHORED_STAGE, meta: { ...base, ...m } })

  it('10. validates the honest case and rejects every dishonest one', () => {
    const baked = BUILDING_TEX.stageB
    expect(validateAuthoredStage(base, 512, 378, baked)).toBeNull()
    expect(validateAuthoredStage({ ...base, fwTiles: 5 }, 512, 378, baked)).toBe('footprint-mismatch')
    expect(validateAuthoredStage({ ...base, fdTiles: 3 }, 512, 378, baked)).toBe('footprint-mismatch')
    expect(validateAuthoredStage(base, 640, 378, baked)).toBe('width-mismatch')
    expect(validateAuthoredStage({ ...base, anchorX: 200 }, 512, 378, baked)).toBe('anchor-x-off-centre')
    // the metadata against the render it REPLACED (374 px): the ground centre moved, refuse
    expect(validateAuthoredStage(base, 512, 374, baked)).toBe('anchor-y-off-ground')
    // …and against a much taller one: the ground centre is no longer at 250
    expect(validateAuthoredStage(base, 512, 420, baked)).toBe('anchor-y-off-ground')
    expect(validateAuthoredStage({ ...base, pxPerTile: 0 }, 512, 378, baked)).toBe('bad-pxPerTile')
    expect(validateAuthoredStage(base, 0, 378, baked)).toBe('bad-texture-size')
  })

  it('11. a wrong footprint does NOT move the lot — the swap is declined instead', () => {
    const before = structuredClone(BUILDING_TEX)
    const out = applyAuthoredStage(loadedOk(), true, withMeta({ fwTiles: 6, fdTiles: 6 }))
    expect(out).toEqual({ applied: false, reason: 'footprint-mismatch' })
    expect(BUILDING_TEX).toEqual(before)
  })

  it('12. a candidate whose height changed without its anchor is declined', () => {
    const before = structuredClone(BUILDING_TEX)
    const taller = textureHost({ [AUTHORED_STAGE.texKey]: { width: 512, height: 420 } })
    expect(applyAuthoredStage(taller, true)).toEqual({ applied: false, reason: 'anchor-y-off-ground' })
    expect(BUILDING_TEX).toEqual(before)

    // …and the SAME render is accepted once its metadata is corrected to texH - 128.
    const fixed = withMeta({ anchorY: 420 - 128 })
    expect(applyAuthoredStage(taller, true, fixed)).toEqual({ applied: true, reason: 'ok' })
    expect(BUILDING_TEX.stageB!.originY).toBeCloseTo(292 / 420, 12)
  })

  it('13. the origin helper is a pure anchor/size ratio', () => {
    expect(authoredStageOrigin(base, 512, 378)).toEqual({ originX: 0.5, originY: 250 / 378 })
  })
})
