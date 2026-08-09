// ── D1-B: the soundstage composer ─────────────────────────────────────────────
// Phaser cannot be imported under jsdom (it touches a real canvas at module load), which
// is why every lot module uses `import type`. Dropping assets.ts's one runtime Phaser call
// (the barrel-roof colour ramp) brings the whole baking layer under test: these specs drive
// bakeStageFromSpec with a Graphics recorder and assert the exact draw program.
//
// The point of the equivalence specs is the Checkpoint A claim: "Stage A re-expressed
// through the composer IS the soundstage that shipped." Every constant asserted below is
// transcribed from the pre-D1-B `bakeStage()` at base commit aadbd63:
//
//   const fw = 4, fd = 4, H = 78, rise = 34
//   beginBuilding(scene, fw, fd, H, rise)
//   drawWalls(b, fw, fd, H, K.buffRight, K.buffLeft)
//   barrelRoof(b, fw, fd, H, rise)                       // bands = 5
//   poly(g, [p(0.7, fd, 0), p(fw-0.7, fd, 0), p(fw-0.7, fd, H*0.72), p(0.7, fd, H*0.72)], K.stageDoor)
//   for (let i = 1; i < 5; i++) { const t = i / 5
//     stroke(g, [p(0.7 + t*(fw-1.4), fd, 0), p(0.7 + t*(fw-1.4), fd, H*0.72)], K.stageDoorSeam, 1.5) }

import type Phaser from 'phaser'
import { describe, expect, it } from 'vitest'
import { bakeStageFromSpec, BUILDING_TEX, bakeAllTextures } from './assets.ts'
import { LEGACY_STAGE, STAGE_A, STAGE_B, type StageSpec } from './stageSpec.ts'
import { COLORS as K } from './palette.ts'
import { TILE_W, TILE_H } from './iso.ts'

// ── a Graphics recorder ───────────────────────────────────────────────────────
type Op = { fn: string; args: number[] }

function recorder() {
  const ops: Op[] = []
  const textures: Array<{ key: string; w: number; h: number }> = []
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
  ]) {
    g[fn] = (...args: number[]) => {
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
  /** `make.graphics` deliberately never adds to the display list — see GraphicsCreator. */
  const added: unknown[] = []
  const scene = {
    make: { graphics: () => g },
    add: {
      graphics: () => {
        added.push(g)
        return g
      },
    },
    children: { list: added },
  } as unknown as Phaser.Scene
  return { scene, ops, textures, added, destroyedCount: () => destroyed }
}

/** Only the ops that carry colour/width, for readable colour assertions. */
const styles = (ops: Op[]) => ops.filter((o) => o.fn === 'fillStyle' || o.fn === 'lineStyle')

const hw = TILE_W / 2
const hh = TILE_H / 2

/** The projector `beginBuilding` sets up, re-derived here from the spec alone. */
function projector(spec: StageSpec) {
  const { fd } = spec.bays
  const H = spec.wallH
  const topExtra = spec.roof.rise
  const ox = fd * hw
  const oy = H + topExtra
  return (gx: number, gy: number, z: number) => ({
    x: (gx - gy) * hw + ox,
    y: (gx + gy) * hh - z + oy,
  })
}

describe('D1-B composer — Stage A through the composer IS the shipped soundstage', () => {
  it('1. bakes one texture under the spec key, with the shipped footprint and origin', () => {
    const r = recorder()
    const baked = bakeStageFromSpec(r.scene, LEGACY_STAGE)

    expect(r.textures).toHaveLength(1)
    expect(r.textures[0]!.key).toBe('b-stage')
    expect(baked).toEqual({ key: 'b-stage', originX: 0.5, originY: baked.originY, fw: 4, fd: 4 })

    // texW/texH/originY as beginBuilding computes them for fw=4, fd=4, H=78, topExtra=34
    const texW = (4 + 4) * hw
    const texH = (4 + 4) * hh + 78 + 34
    expect(r.textures[0]!.w).toBe(Math.ceil(texW))
    expect(r.textures[0]!.h).toBe(Math.ceil(texH))
    expect(baked.originY).toBeCloseTo((((4 + 4) / 2) * hh + 78 + 34) / texH, 12)
    expect(r.destroyedCount()).toBe(1) // the scratch Graphics is always released
  })

  it('2. draws walls → barrel roof → doors → seams, in that order, in the shipped colours', () => {
    const r = recorder()
    bakeStageFromSpec(r.scene, LEGACY_STAGE)
    const s = styles(r.ops)

    // walls: lit face, shadow face, then the 8%-alpha corner seam
    expect(s[0]).toEqual({ fn: 'fillStyle', args: [K.buffRight, 1] })
    expect(s[1]).toEqual({ fn: 'fillStyle', args: [K.buffLeft, 1] })
    expect(s[2]).toEqual({ fn: 'lineStyle', args: [1, 0x000000, 0.08] })

    // barrel roof: 6 bands (i = 0..5). Band 0 is the eave colour; bands 1..5 ramp
    // buffLeft → 0xf3e6c6. These six values were checked against Phaser's own
    // Interpolate.ColorWithColor + GetColor and are bit-identical.
    const roof = s.slice(3, 9)
    expect(roof.map((o) => o.args[0])).toEqual([
      K.buff, 0xbdad82, 0xcabb93, 0xd8c9a4, 0xe5d7b5, 0xf3e6c6,
    ])
    expect(roof.every((o) => o.fn === 'fillStyle')).toBe(true)

    // doors: one filled quad, then four seams at width 1.5
    expect(s[9]).toEqual({ fn: 'fillStyle', args: [K.stageDoor, 1] })
    const seams = s.slice(10)
    expect(seams).toHaveLength(4)
    expect(seams.every((o) => o.fn === 'lineStyle')).toBe(true)
    expect(seams.every((o) => o.args[0] === 1.5 && o.args[1] === K.stageDoorSeam)).toBe(true)
  })

  it('3. the door geometry is exactly the shipped geometry', () => {
    const r = recorder()
    bakeStageFromSpec(r.scene, LEGACY_STAGE)
    const p = projector(LEGACY_STAGE)
    const fw = 4,
      fd = 4,
      H = 78
    const doorH = H * 0.72

    // the door quad is the moveTo/lineTo run that follows the door fillStyle
    const i = r.ops.findIndex((o) => o.fn === 'fillStyle' && o.args[0] === K.stageDoor)
    const quad = r.ops.slice(i + 1, i + 6) // beginPath, moveTo, lineTo ×3
    const pts = quad.filter((o) => o.fn === 'moveTo' || o.fn === 'lineTo').map((o) => o.args)
    const want = [p(0.7, fd, 0), p(fw - 0.7, fd, 0), p(fw - 0.7, fd, doorH), p(0.7, fd, doorH)]
    expect(pts).toEqual(want.map((q) => [q.x, q.y]))

    // the four seams sit at 0.7 + (i/5)·(fw − 1.4)
    const seamXs = r.ops
      .map((o, n) => ({ o, n }))
      .filter(({ o }) => o.fn === 'lineStyle' && o.args[1] === K.stageDoorSeam)
      .map(({ n }) => r.ops[n + 2]!.args[0])
    expect(seamXs).toEqual([1, 2, 3, 4].map((k) => p(0.7 + (k / 5) * (fw - 1.4), fd, 0).x))
  })

  it('4. STAGE_A emits an IDENTICAL draw program to the legacy stage (key aside)', () => {
    const a = recorder()
    const legacy = recorder()
    bakeStageFromSpec(a.scene, STAGE_A)
    bakeStageFromSpec(legacy.scene, LEGACY_STAGE)

    expect(a.ops).toEqual(legacy.ops)
    expect(a.textures[0]!.w).toBe(legacy.textures[0]!.w)
    expect(a.textures[0]!.h).toBe(legacy.textures[0]!.h)
    expect(a.textures[0]!.key).toBe('b-stage-a')
    expect(legacy.textures[0]!.key).toBe('b-stage')
  })

  it('5. the composer is deterministic — two bakes of one spec are identical', () => {
    const x = recorder()
    const y = recorder()
    bakeStageFromSpec(x.scene, STAGE_A)
    bakeStageFromSpec(y.scene, STAGE_A)
    expect(x.ops).toEqual(y.ops)
  })

  it('6. a spec change actually changes the art (the composer is really parameterised)', () => {
    const base = recorder()
    const taller = recorder()
    bakeStageFromSpec(base.scene, LEGACY_STAGE)
    bakeStageFromSpec(taller.scene, { ...LEGACY_STAGE, key: 'b-probe', wallH: 120 })
    expect(taller.ops).not.toEqual(base.ops)
    expect(taller.textures[0]!.h).toBeGreaterThan(base.textures[0]!.h)
  })
})

describe('D1-B content gate — default OFF is the pre-spike lot', () => {
  it('7. flag OFF bakes ONE shared stage texture and both stages point at it', () => {
    const r = recorder()
    bakeAllTextures(r.scene)
    expect(BUILDING_TEX.stageA.key).toBe('b-stage')
    expect(BUILDING_TEX.stageB.key).toBe('b-stage')
    expect(BUILDING_TEX.stageA).toBe(BUILDING_TEX.stageB)
    expect(r.textures.filter((t) => t.key.startsWith('b-stage'))).toHaveLength(1)
  })

  it('8. flag ON bakes one texture per stage, under distinct keys', () => {
    const r = recorder()
    bakeAllTextures(r.scene, { distinctStages: true })
    expect(BUILDING_TEX.stageA.key).toBe('b-stage-a')
    expect(BUILDING_TEX.stageB.key).toBe('b-stage-b')
    const stageTex = r.textures.filter((t) => t.key.startsWith('b-stage')).map((t) => t.key)
    expect(stageTex.sort()).toEqual(['b-stage-a', 'b-stage-b'])
  })

  it('9. baking costs ZERO top-level display objects in either mode', () => {
    const off = recorder()
    bakeAllTextures(off.scene)
    expect(off.added).toHaveLength(0)

    const on = recorder()
    bakeAllTextures(on.scene, { distinctStages: true })
    expect(on.added).toHaveLength(0)
  })

  it('10. every stage spec keeps the 4×4 footprint the lot layout reserves', () => {
    for (const spec of [LEGACY_STAGE, STAGE_A, STAGE_B]) {
      expect(spec.bays).toEqual({ fw: 4, fd: 4 })
    }
  })
})
