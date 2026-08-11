// ── Authored Stage A H2 "Stage Front" proof — the runtime seam ────────────────
//
// Covers what this proof actually ships: a DEFAULT-OFF flag, the registry re-point that
// swaps Stage A's texture WITHOUT moving the building, and the CURRENT production export
// contract (standard §3A) on the committed files. Scene-level behaviour that needs a real
// renderer (preload, load failure, pixel-perfect hit testing against an image-backed
// texture) is proved in the browser, not stubbed here.
//
// These assert the RGBA contract, NOT the historical PNG-8 acceptance semantics.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type Phaser from 'phaser'
import {
  bakeAllTextures,
  BUILDING_TEX,
  underDressedKey,
  pointStageAAtAuthored,
  STAGE_A_H2_KEY,
  STAGE_A_H2_UD_KEY,
} from './scene/assets'
import { placedBuildings } from './scene/layout'
import {
  STUDIO_LOT_STAGE_A_H2_LS_KEY,
  studioLotStageAH2Enabled,
  setStudioLotStageAH2Override,
} from '../flags'

const here = dirname(fileURLToPath(import.meta.url))
const LOT = join(here, '..', '..', 'public', 'lot')
const H2 = { normal: join(LOT, 'b-stage-a-h2.png'), worn: join(LOT, 'b-stage-a-h2-ud.png') }

// Accepted H2 bytes — stage-a-h2-stage-front/MANIFEST.json @ source 3e7e4f7
// (Bounded Correction 1. Candidate 1 was c0b6306 / eefad8ad… / cdfe7911… — superseded
// because its front did not read as a stage at the management camera. The values BELOW
// this line are the only thing the correction moved: every tolerance, threshold and
// registration figure in this file is unchanged and still passes on its own terms.)
const ACCEPTED = {
  normal: { sha256: '98d4191c04a6a08fb3b252f508215e88649b4c7693e8a9375174a2f1d47ca0b9', bytes: 73067 },
  worn: { sha256: '2ed088351b6a60c0a06f6b86cd4100e339e33a8df3d6c8172dc3fca03a85f5d4', bytes: 69326 },
}

function chunks(file: string) {
  const buf = readFileSync(file)
  const types: string[] = []
  let i = 8
  while (i < buf.length) {
    const len = buf.readUInt32BE(i)
    types.push(buf.toString('latin1', i + 4, i + 8))
    i += 12 + len
  }
  return { types, w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), depth: buf[24], colourType: buf[25], interlace: buf[28] }
}

/** Decode via the pipeline tool's own dependency stack rather than a JS decoder. */
function decode(file: string) {
  const out = execFileSync('python3', ['-c', `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGBA")
sys.stdout.buffer.write(im.width.to_bytes(4,"big") + im.height.to_bytes(4,"big") + im.tobytes())
`, file], { maxBuffer: 64 * 1024 * 1024 })
  return { w: out.readUInt32BE(0), h: out.readUInt32BE(4), rgba: new Uint8Array(out.subarray(8)) }
}
const alphaOf = (d: { rgba: Uint8Array }) => d.rgba.filter((_, i) => i % 4 === 3)

function fakeScene(): Phaser.Scene {
  const g: Record<string, unknown> = {}
  for (const fn of ['fillStyle','lineStyle','beginPath','moveTo','lineTo','closePath','fillPath',
    'strokePath','fillRect','fillCircle','fillEllipse','fillRoundedRect','strokeRoundedRect','strokeCircle'])
    g[fn] = () => g
  g.generateTexture = () => g
  g.destroy = () => g
  return { make: { graphics: () => g }, add: { graphics: () => g }, children: { list: [] } } as unknown as Phaser.Scene
}
const bake = () => bakeAllTextures(fakeScene(), { distinctStages: true })

describe('Stage A H2 — the committed assets satisfy the CURRENT production export contract', () => {
  it('1. both are exactly the accepted H2 bytes from the frozen source', () => {
    for (const k of ['normal', 'worn'] as const) {
      const buf = readFileSync(H2[k])
      expect(createHash('sha256').update(buf).digest('hex'), k).toBe(ACCEPTED[k].sha256)
      expect(buf.byteLength, k).toBe(ACCEPTED[k].bytes)
    }
  })

  it('2. 8-bit truecolour RGBA, non-interlaced, at the size the scene anchors them at', () => {
    for (const k of ['normal', 'worn'] as const) {
      const c = chunks(H2[k])
      expect({ depth: c.depth, colourType: c.colourType, interlace: c.interlace }, k)
        .toEqual({ depth: 8, colourType: 6, interlace: 0 })
      expect({ w: c.w, h: c.h }, k).toEqual({ w: 512, h: 368 })
    }
  })

  it('3. neither is indexed — no PLTE, no tRNS', () => {
    for (const k of ['normal', 'worn'] as const) {
      const { types } = chunks(H2[k])
      expect(types, k).not.toContain('PLTE')
      expect(types, k).not.toContain('tRNS')
    }
  })

  it('4. the RGB channel carries the recovered 128-colour contract', () => {
    for (const k of ['normal', 'worn'] as const) {
      const d = decode(H2[k])
      const s = new Set<number>()
      for (let i = 0; i < d.rgba.length; i += 4)
        if (d.rgba[i + 3]! > 0) s.add((d.rgba[i]! << 16) | (d.rgba[i + 1]! << 8) | d.rgba[i + 2]!)
      expect(s.size, k).toBe(128)
    }
  })

  it('5. alpha is bit-identical between the two finishes', () => {
    // LotScene swaps the under-dressed texture WITHOUT re-running setInteractive, so a
    // differing alpha map would silently reshape the pixel-perfect hit area.
    const a = alphaOf(decode(H2.normal))
    const b = alphaOf(decode(H2.worn))
    expect(a.length).toBe(b.length)
    let differing = 0
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) differing++
    expect(differing).toBe(0)
  })

  it('6. alpha is lossless, not collapsed into a palette-sized set', () => {
    const values = new Set(alphaOf(decode(H2.normal)))
    expect(values.size).toBeGreaterThan(64)
    expect(values.has(255)).toBe(true)
  })

  it('7. registration is the approved one — inset, with a forecourt', () => {
    const d = decode(H2.normal)
    let minX = 512, maxX = -1, maxY = -1
    for (let y = 0; y < d.h; y++)
      for (let x = 0; x < d.w; x++)
        if (d.rgba[(y * d.w + x) * 4 + 3]! > 0) {  // alpha > 0 — what alphaTolerance:1 selects
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
        }
    const TOL = 1
    expect(Math.abs(minX - 15), `leftInset ${minX}`).toBeLessThanOrEqual(TOL)
    expect(Math.abs(511 - maxX - 15), `rightInset ${511 - maxX}`).toBeLessThanOrEqual(TOL)
    // 9 px above the footprint's near apex (row 367) — the deliberate forecourt setback
    expect(Math.abs(maxY - 358), `lowestOpaqueRow ${maxY}`).toBeLessThanOrEqual(TOL)
  })
})

describe('Stage A H2 — the proof gate', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('8. is DEFAULT OFF — a proof is not player content', () => {
    expect(studioLotStageAH2Enabled()).toBe(false)
  })

  it('9. an explicit override turns it on, and clears again', () => {
    setStudioLotStageAH2Override(true)
    expect(localStorage.getItem(STUDIO_LOT_STAGE_A_H2_LS_KEY)).toBe('1')
    expect(studioLotStageAH2Enabled()).toBe(true)
    setStudioLotStageAH2Override(false)
    expect(studioLotStageAH2Enabled()).toBe(false)
  })

  it('10. only the literal "1" turns it on', () => {
    for (const v of ['0', 'true', 'yes', '']) {
      localStorage.setItem(STUDIO_LOT_STAGE_A_H2_LS_KEY, v)
      expect(studioLotStageAH2Enabled(), `value ${JSON.stringify(v)}`).toBe(false)
    }
  })
})

describe('Stage A H2 — the registry re-point', () => {
  beforeEach(() => bake())

  it('11. swaps ONLY the texture key — footprint and anchor are carried over', () => {
    const before = { ...BUILDING_TEX.stageA }
    pointStageAAtAuthored(STAGE_A_H2_KEY)
    const after = BUILDING_TEX.stageA
    expect(after.key).toBe(STAGE_A_H2_KEY)
    // Everything else in the registry entry is carried over verbatim — footprint drives
    // placement and depth, origin drives the anchor. Asserted field-by-field rather than
    // by object equality so a NEW field added later cannot slip through unchecked.
    expect(after.fw).toBe(before.fw)
    expect(after.fd).toBe(before.fd)
    expect(after.originX).toBe(before.originX)
    expect(after.originY).toBe(before.originY)
    expect(Object.keys(after).sort()).toEqual(Object.keys(before).sort())
  })

  it('12. the worn key resolves with no special case', () => {
    expect(STAGE_A_H2_UD_KEY).toBe(underDressedKey(STAGE_A_H2_KEY))
    expect(STAGE_A_H2_UD_KEY).toBe('b-stage-a-h2-ud')
  })

  it('13. leaves Stage B completely alone', () => {
    const before = { ...BUILDING_TEX.stageB }
    pointStageAAtAuthored(STAGE_A_H2_KEY)
    expect(BUILDING_TEX.stageB).toEqual(before)
  })

  it('14. keeps BuildingId, grid position and footprint — it is the SAME building', () => {
    const before = placedBuildings().find((b) => b.id === 'stage-a')!
    expect(before.texKey).toBe('b-stage-a')
    pointStageAAtAuthored(STAGE_A_H2_KEY)
    const after = placedBuildings().find((b) => b.id === 'stage-a')!
    // Identity and placement are the invariant. `texKey` is read LIVE from the registry,
    // so it MUST move — that is precisely the presentation swap, and asserting it
    // unchanged would assert the proof does nothing.
    expect(after.id).toBe('stage-a')
    expect({ gx: after.gx, gy: after.gy }).toEqual({ gx: before.gx, gy: before.gy })
    expect({ fw: after.fw, fd: after.fd }).toEqual({ fw: before.fw, fd: before.fd })
    expect(after.texKey).toBe(STAGE_A_H2_KEY)
  })

  it('15. a fresh bake restores the procedural Stage A — the fallback is always there', () => {
    pointStageAAtAuthored(STAGE_A_H2_KEY)
    expect(BUILDING_TEX.stageA.key).toBe(STAGE_A_H2_KEY)
    bake()
    expect(BUILDING_TEX.stageA.key).toBe('b-stage-a')
  })

  it('16. is a no-op if the registry has no Stage A entry to carry over', () => {
    const saved = BUILDING_TEX.stageA
    // @ts-expect-error deliberately exercising the guard
    BUILDING_TEX.stageA = undefined
    expect(() => pointStageAAtAuthored(STAGE_A_H2_KEY)).not.toThrow()
    BUILDING_TEX.stageA = saved
  })
})
