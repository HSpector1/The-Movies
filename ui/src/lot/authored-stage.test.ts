// ── Authored Soundstage Pipeline Proof — the authored Stage B path ────────────
//
// These cover the seam the proof actually ships: the DEFAULT-OFF flag, and the
// registry re-point that swaps Stage B's texture WITHOUT moving the building.
// Scene-level behaviour that needs a real renderer (preload, load failure, and
// pixel-perfect hit testing against an image-backed texture) is proved in the
// browser by ui/e2e/authored-stage-proof.spec.ts, not stubbed here.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type Phaser from 'phaser'
import {
  bakeAllTextures,
  BUILDING_TEX,
  underDressedKey,
  pointStageBAtAuthored,
  AUTHORED_STAGE_B_KEY,
  AUTHORED_STAGE_B_UD_KEY,
} from './scene/assets'
import { TILE_W, TILE_H } from './scene/iso'
import { placedBuildings } from './scene/layout'
import {
  STUDIO_LOT_AUTHORED_STAGE_LS_KEY,
  studioLotAuthoredStageEnabled,
  setStudioLotAuthoredStageRollback,
} from '../flags'

/** Minimal Graphics recorder — the bake path never touches textures or the loader. */
function fakeScene(): Phaser.Scene {
  const g: Record<string, unknown> = {}
  for (const fn of [
    'fillStyle', 'lineStyle', 'beginPath', 'moveTo', 'lineTo', 'closePath',
    'fillPath', 'strokePath', 'fillRect', 'fillCircle', 'fillEllipse',
    'fillRoundedRect', 'strokeRoundedRect', 'strokeCircle',
  ]) g[fn] = () => g
  g.generateTexture = () => g
  g.destroy = () => g
  return {
    make: { graphics: () => g },
    add: { graphics: () => g },
    children: { list: [] },
  } as unknown as Phaser.Scene
}

const bakeDistinct = () => bakeAllTextures(fakeScene(), { distinctStages: true })

// ── the shipped authored assets, read from disk ───────────────────────────────
//
// The scene applies the PROCEDURAL Stage B's anchor to whatever authored texture
// arrives (LotScene.create → pointStageBAtAuthored). Nothing at runtime checks that
// the file it fetched is the size that anchor was computed for, so a wrongly-sized
// art drop used to be discovered by eye, in the browser. These read the committed
// PNGs' IHDR and make that a `npm test` failure instead.

const LOT_ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'lot')
const AUTHORED_PNG = {
  normal: join(LOT_ASSETS, 'b-stage-b.png'),
  worn: join(LOT_ASSETS, 'b-stage-b-ud.png'),
} as const

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** IHDR: after the 8-byte signature, width = bytes 16–19 BE, height = 20–23 BE. */
function ihdr(file: string): { w: number; h: number } {
  const buf = readFileSync(file)
  expect(buf.subarray(0, 8).equals(PNG_SIGNATURE), `${file} is not a PNG`).toBe(true)
  expect(buf.subarray(12, 16).toString('ascii'), `${file}: first chunk must be IHDR`).toBe('IHDR')
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

/**
 * The anchor invariant, in pixels rather than as a ratio.
 *
 * `originY` is a FRACTION of the texture height, so asserting the ratio alone passes
 * for any texture that happens to be the height it was derived from and says nothing
 * about a texture of any other height. What the lot actually requires is that the
 * anchor lands on the near apex of the building's footprint diamond — exactly
 * ((fw+fd)/2) × (TILE_H/2) px above the bottom edge — for whatever height ships.
 */
const nearApexPx = (fw: number, fd: number) => ((fw + fd) / 2) * (TILE_H / 2)
/** A building's baked texture is (fw+fd) half-tiles wide. */
const texWidthPx = (fw: number, fd: number) => (fw + fd) * (TILE_W / 2)

/**
 * Alpha channel of a committed PNG, decoded without a dependency.
 *
 * Only what the shipped assets actually are: 8-bit RGBA, non-interlaced. Anything
 * else is rejected loudly rather than decoded wrongly — a change of encoding is a
 * deliberate art decision and should stop here rather than silently produce a
 * plausible-looking alpha map.
 */
function alphaOf(file: string): { w: number; h: number; a: Uint8Array } {
  const buf = readFileSync(file)
  expect(buf.subarray(0, 8).equals(PNG_SIGNATURE), `${file} is not a PNG`).toBe(true)
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  const [depth, colourType, , , interlace] = [buf[24], buf[25], buf[26], buf[27], buf[28]]
  expect({ depth, colourType, interlace }, `${file}: expected 8-bit RGBA, non-interlaced`)
    .toEqual({ depth: 8, colourType: 6, interlace: 0 })

  const idat: Buffer[] = []
  for (let p = 8; p + 8 <= buf.length; ) {
    const len = buf.readUInt32BE(p)
    const type = buf.subarray(p + 4, p + 8).toString('ascii')
    if (type === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + len))
    if (type === 'IEND') break
    p += 12 + len // length + type + data + CRC
  }
  const raw = inflateSync(Buffer.concat(idat))

  const BPP = 4
  const stride = w * BPP
  const out = new Uint8Array(w * h)
  const prev = new Uint8Array(stride)
  const line = new Uint8Array(stride)
  for (let y = 0, at = 0; y < h; y++) {
    const filter = raw[at++]
    for (let i = 0; i < stride; i++) {
      const x = raw[at + i]
      const a = i >= BPP ? line[i - BPP] : 0
      const b = prev[i]
      const c = i >= BPP ? prev[i - BPP] : 0
      let v: number
      switch (filter) {
        case 0: v = x; break
        case 1: v = x + a; break
        case 2: v = x + b; break
        case 3: v = x + ((a + b) >> 1); break
        case 4: {
          const pp = a + b - c
          const pa = Math.abs(pp - a)
          const pb = Math.abs(pp - b)
          const pc = Math.abs(pp - c)
          v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)
          break
        }
        default: throw new Error(`${file}: unknown PNG filter ${filter} on row ${y}`)
      }
      line[i] = v & 0xff
    }
    at += stride
    for (let x = 0; x < w; x++) out[y * w + x] = line[x * BPP + 3]
    prev.set(line)
  }
  return { w, h, a: out }
}

/**
 * Where the building's own pixels sit inside the canvas.
 *
 * Threshold is `> 0`, which is not an arbitrary choice: the sprite is registered with
 * `alphaTolerance: 1`, so every pixel counted here is exactly a pixel that can take a
 * click, and every pixel excluded is one that cannot.
 */
function registration(file: string) {
  const { w, h, a } = alphaOf(file)
  let minX = w
  let maxX = -1
  let lowestRow = -1
  let sumX = 0
  let n = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (a[y * w + x] === 0) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      lowestRow = y
      sumX += x
      n++
    }
  }
  const apex = { min: w, max: -1 }
  for (let x = 0; x < w; x++) {
    if (a[lowestRow * w + x] === 0) continue
    if (x < apex.min) apex.min = x
    if (x > apex.max) apex.max = x
  }
  return {
    lowestOpaqueRow: lowestRow,
    leftInset: minX,
    rightInset: w - 1 - maxX,
    nearApexCentreX: (apex.min + apex.max) / 2,
    centroidX: sumX / n,
    opaquePx: n,
  }
}

describe('authored Stage B — production content gate', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('1. is DEFAULT ON — the authored art is ordinary player content', () => {
    expect(studioLotAuthoredStageEnabled()).toBe(true)
  })

  it('2. an explicit rollback forces the procedural Stage B, and lifts again', () => {
    setStudioLotAuthoredStageRollback(true)
    expect(localStorage.getItem(STUDIO_LOT_AUTHORED_STAGE_LS_KEY)).toBe('0')
    expect(studioLotAuthoredStageEnabled()).toBe(false)
    setStudioLotAuthoredStageRollback(false)
    expect(studioLotAuthoredStageEnabled()).toBe(true)
  })

  it('3. only the literal rollback value turns it off', () => {
    for (const v of ['1', 'true', '', 'off', 'no']) {
      localStorage.setItem(STUDIO_LOT_AUTHORED_STAGE_LS_KEY, v)
      expect(studioLotAuthoredStageEnabled(), `value ${JSON.stringify(v)}`).toBe(true)
    }
    localStorage.setItem(STUDIO_LOT_AUTHORED_STAGE_LS_KEY, '0')
    expect(studioLotAuthoredStageEnabled()).toBe(false)
  })

  it('4. is not switched by the other lot flags', () => {
    localStorage.setItem('project-studio.flags.studio-lot-soundstages', '0')
    localStorage.setItem('project-studio.flags.studio-lot-soundstage-proof', '1')
    localStorage.setItem('project-studio.flags.studio-lot-overview', '1')
    expect(studioLotAuthoredStageEnabled()).toBe(true)
  })
})

describe('authored Stage B — texture keys', () => {
  it('4. the worn key is the ordinary underDressed key, so no special case is needed', () => {
    expect(AUTHORED_STAGE_B_UD_KEY).toBe(underDressedKey(AUTHORED_STAGE_B_KEY))
    expect(AUTHORED_STAGE_B_UD_KEY).toBe('b-stage-b-authored-ud')
  })

  it('5. the authored keys never collide with the procedural ones', () => {
    bakeDistinct()
    expect(AUTHORED_STAGE_B_KEY).not.toBe(BUILDING_TEX.stageB.key)
    expect(AUTHORED_STAGE_B_KEY).not.toBe(BUILDING_TEX.stageA.key)
  })
})

describe('authored Stage B — registry re-point', () => {
  beforeEach(bakeDistinct)

  it('6. swaps ONLY the texture key — footprint and anchor are carried over', () => {
    const before = { ...BUILDING_TEX.stageB }
    pointStageBAtAuthored(AUTHORED_STAGE_B_KEY)
    const after = BUILDING_TEX.stageB
    expect(after.key).toBe(AUTHORED_STAGE_B_KEY)
    expect(after.fw).toBe(before.fw)
    expect(after.fd).toBe(before.fd)
    expect(after.originX).toBe(before.originX)
    expect(after.originY).toBe(before.originY)
    // the governed Stage B contract, restated so a drift shows up here
    expect(after.fw).toBe(4)
    expect(after.fd).toBe(4)
    // NOT the bare ratio: the ratio is only meaningful against a height, so assert the
    // invariant it stands for — the anchor sits on the footprint's near apex, in px.
    const { h } = ihdr(AUTHORED_PNG.normal)
    expect(h * (1 - after.originY)).toBeCloseTo(nearApexPx(after.fw, after.fd), 1)
  })

  it('7. leaves Stage A completely alone', () => {
    const a = { ...BUILDING_TEX.stageA }
    pointStageBAtAuthored(AUTHORED_STAGE_B_KEY)
    expect(BUILDING_TEX.stageA).toEqual(a)
    expect(BUILDING_TEX.stageA.key).toBe('b-stage-a')
  })

  it('8. keeps BuildingId, grid position and footprint — it is the SAME building', () => {
    const before = placedBuildings().find((b) => b.id === 'stage-b')!
    pointStageBAtAuthored(AUTHORED_STAGE_B_KEY)
    const after = placedBuildings().find((b) => b.id === 'stage-b')!
    expect(after.id).toBe('stage-b')
    expect(after.gx).toBe(before.gx)
    expect(after.gy).toBe(before.gy)
    expect(after.fw).toBe(before.fw)
    expect(after.fd).toBe(before.fd)
    expect(after.label).toBe(before.label)
    expect(after.texKey).toBe(AUTHORED_STAGE_B_KEY)
    // no second gameplay building is introduced
    expect(placedBuildings().filter((b) => b.id === 'stage-b')).toHaveLength(1)
    expect(placedBuildings()).toHaveLength(9)
  })

  it('9. is deterministic — same input, same registry state', () => {
    pointStageBAtAuthored(AUTHORED_STAGE_B_KEY)
    const first = { ...BUILDING_TEX.stageB }
    bakeDistinct()
    pointStageBAtAuthored(AUTHORED_STAGE_B_KEY)
    expect(BUILDING_TEX.stageB).toEqual(first)
  })

  it('10. a fresh bake restores the procedural Stage B — the fallback is always there', () => {
    pointStageBAtAuthored(AUTHORED_STAGE_B_KEY)
    expect(BUILDING_TEX.stageB.key).toBe(AUTHORED_STAGE_B_KEY)
    bakeDistinct()
    expect(BUILDING_TEX.stageB.key).toBe('b-stage-b')
  })

  it('11. bakes the procedural Stage B pair regardless, so a failed load has somewhere to land', () => {
    // baking is what guarantees the fallback; the authored path never replaces it
    expect(BUILDING_TEX.stageB.key).toBe('b-stage-b')
    expect(underDressedKey(BUILDING_TEX.stageB.key)).toBe('b-stage-b-ud')
  })
})

describe('authored Stage B — the shipped assets on disk', () => {
  beforeEach(bakeDistinct)

  it('12. both PNGs are exactly the size the scene anchors them at', () => {
    const { fw, fd, originY } = BUILDING_TEX.stageB
    const expectW = texWidthPx(fw, fd)
    // height is not free either: it is whatever puts the near apex under the anchor
    const expectH = Math.round(nearApexPx(fw, fd) / (1 - originY))
    for (const [finish, file] of Object.entries(AUTHORED_PNG)) {
      const { w, h } = ihdr(file)
      expect({ finish, w, h }).toEqual({ finish, w: expectW, h: expectH })
    }
    // and that is the 512x374 the art pipeline ships, stated once so the derivation
    // above cannot quietly agree with itself about the wrong number
    expect([expectW, expectH]).toEqual([512, 374])
  })

  it('13. the anchor lands on the footprint near apex for BOTH authored finishes', () => {
    // The scene gives the worn texture the same originY as the normal one
    // (LotScene.create), so the invariant has to hold for each file independently.
    pointStageBAtAuthored(AUTHORED_STAGE_B_KEY)
    const { fw, fd, originY } = BUILDING_TEX.stageB
    const apex = nearApexPx(fw, fd)
    expect(apex).toBe(128)
    for (const [finish, file] of Object.entries(AUTHORED_PNG)) {
      const { h } = ihdr(file)
      const anchorAboveBottom = h * (1 - originY)
      expect(Math.abs(anchorAboveBottom - apex), `${finish}: anchor ${anchorAboveBottom}px above bottom, want ${apex}px`)
        .toBeLessThanOrEqual(0.5)
    }
  })

  it('14. the worn finish has identical dimensions to the normal one', () => {
    const normal = ihdr(AUTHORED_PNG.normal)
    const worn = ihdr(AUTHORED_PNG.worn)
    // a worn texture of a different size would be anchored by the same originY and
    // would silently shift the building the moment a stage goes under-dressed
    expect(worn).toEqual(normal)
  })

  /**
   * 15. REGISTRATION LOCK — the Director-approved Candidate A placement.
   *
   * Tests 12–14 gate the CANVAS: right size, matching pair, anchor on the near apex.
   * They cannot see where the building sits INSIDE that canvas, and Candidate A does
   * not fill its 4×4 footprint diamond — it is inset, with a plinth forecourt in front.
   * That is the approved design, reviewed from the shipped frames, not a defect.
   *
   * Which is exactly why it needs pinning. An asset can be 512×374 with a perfect
   * anchor and still put the building somewhere else entirely, and nothing above would
   * notice. These are the measured values of the approved art: a future drop that
   * registers differently fails here and goes to art review instead of to the lot.
   *
   * Only the normal finish is measured. Test (alpha bit-exactness, e2e) already
   * establishes the worn file's alpha is identical, so the lock transfers to it.
   */
  it('15. the authored art keeps its approved registration inside the canvas', () => {
    const r = registration(AUTHORED_PNG.normal)
    const TOLERANCE = 1

    // approved Candidate A registration, measured on the adopted asset
    const APPROVED = {
      lowestOpaqueRow: 364, // 9px above the footprint near apex — the forecourt setback
      leftInset: 18, //  from the diamond's left side apex (canvas x 0)
      rightInset: 31, //  from the diamond's right side apex (canvas x 511)
      nearApexCentreX: 274.5, // the building's own near corner, right of the anchor's 256
      centroidX: 254.58, // where the opaque mass actually balances
    } as const

    for (const [key, want] of Object.entries(APPROVED)) {
      const got = r[key as keyof typeof APPROVED]
      expect(Math.abs(got - want), `${key}: ${got}, approved ${want} (±${TOLERANCE}px)`)
        .toBeLessThanOrEqual(TOLERANCE)
    }
  })
})
