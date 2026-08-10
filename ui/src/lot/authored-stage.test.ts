// ── Authored Soundstage Pipeline Proof — the authored Stage B path ────────────
//
// These cover the seam the proof actually ships: the DEFAULT-OFF flag, and the
// registry re-point that swaps Stage B's texture WITHOUT moving the building.
// Scene-level behaviour that needs a real renderer (preload, load failure, and
// pixel-perfect hit testing against an image-backed texture) is proved in the
// browser by ui/e2e/authored-stage-proof.spec.ts, not stubbed here.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type Phaser from 'phaser'
import {
  bakeAllTextures,
  BUILDING_TEX,
  underDressedKey,
  pointStageBAtAuthored,
  AUTHORED_STAGE_B_KEY,
  AUTHORED_STAGE_B_UD_KEY,
} from './scene/assets'
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
    expect(after.originY).toBeCloseTo(246 / 374, 12)
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
