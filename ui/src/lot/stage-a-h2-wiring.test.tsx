// ── Stage A H2 proof flag — the wiring between the two proved endpoints ───────
//
// stage-a-h2.test.ts proves the ENDPOINTS: the flag is default-OFF and only a literal
// '1' turns it on, and the registry re-point swaps the texture without moving the
// building. Neither proves the SPAN between them, which is four plain assignments:
//
//   flags.ts  →  StudioLotScreen  →  StudioLotView  →  LotScene.init  →  preload()
//
// A dropped or renamed prop anywhere along that chain would leave both endpoint suites
// green while the proof silently did nothing in the real lot. This closes that gap.
//
// Every module in the chain runs for real. Phaser is the only stand-in — jsdom has no
// WebGL, so the renderer is faked at its module boundary — and the assertion is taken
// at the FAR end as behaviour, not as a private field: which images the scene actually
// asks for. That is the same question the browser proof asks, one layer down.

import { render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyActions, beginFounding, generateWorld } from '../../../src/core/index.ts'
import type { CreativeRole, GameState } from '../../../src/core/index.ts'

// ── the renderer stand-in ─────────────────────────────────────────────────────
// Faked at the 'phaser' module boundary rather than at ./StudioLotView.ts, so the real
// StudioLotView.boot() — the hop that actually hands the flag to the scene — is the code
// under test instead of a double. LotScene's only module-evaluation-time use of Phaser is
// `extends Phaser.Scene`, so a bare class is enough for the real scene module to load.
const phaser = vi.hoisted(() => {
  const sceneAdds: Array<{ key: string; data: Record<string, unknown> }> = []
  class FakeScene {
    constructor(_key?: unknown) {}
  }
  class FakeGame {
    events = {
      once: (name: string, cb: () => void) => {
        if (name === 'ready') queueMicrotask(cb)
      },
    }
    scene = {
      add: (key: string, _cls: unknown, _autoStart: boolean, data: Record<string, unknown>) => {
        sceneAdds.push({ key, data })
      },
    }
    scale = { resize: () => {} }
    destroy(_removeCanvas?: boolean) {}
  }
  const P = {
    AUTO: 0,
    Scene: FakeScene,
    Game: FakeGame,
    Scale: { RESIZE: 'RESIZE' },
    Loader: { Events: { FILE_LOAD_ERROR: 'loaderror' } },
  }
  return { sceneAdds, P }
})
vi.mock('phaser', () => ({ default: phaser.P, ...phaser.P }))

import { StudioLotScreen } from './StudioLotScreen.tsx'
import { LotScene, type LotSceneData } from './scene/LotScene.ts'
import { setStudioLotStageAH2Override } from '../flags.ts'

afterEach(() => {
  phaser.sceneAdds.length = 0
  setStudioLotStageAH2Override(false)
})

/** Minimum viable studio: the lot only needs to exist, not to be busy. */
function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  for (const t of [...byRole('actor', 6), ...byRole('director', 2), ...byRole('writer', 2), ...byRole('craft', 2)])
    s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

const noop = () => {}

/** Mount the real screen and return the scene configuration the real view handed over. */
async function sceneConfig(): Promise<LotSceneData> {
  render(<StudioLotScreen state={foundStudio('h2-wiring')} onNavigate={noop} onExit={noop} />)
  await waitFor(() => expect(phaser.sceneAdds).toHaveLength(1))
  expect(phaser.sceneAdds[0]!.key).toBe('lot')
  return phaser.sceneAdds[0]!.data as unknown as LotSceneData
}

/** Run the REAL scene's preload against that configuration and record what it fetches. */
function imagesRequested(data: LotSceneData): string[] {
  const scene = new LotScene()
  const urls: string[] = []
  Object.assign(scene, {
    load: { image: (_key: string, url: string) => urls.push(url), once: () => {} },
  })
  scene.init(data)
  scene.preload()
  return urls
}

const H2_NORMAL = '/lot/b-stage-a-h2.png'
const H2_WORN = '/lot/b-stage-a-h2-ud.png'

describe('Stage A H2 — the flag reaches the scene', () => {
  it('1. FLAG OFF (the default): the scene is configured procedural and fetches no H2 image', async () => {
    const data = await sceneConfig()
    expect(data.stageAH2).toBe(false)

    const urls = imagesRequested(data)
    expect(urls).not.toContain(H2_NORMAL)
    expect(urls).not.toContain(H2_WORN)
    expect(urls.some((u) => u.includes('b-stage-a-h2')), `fetched ${JSON.stringify(urls)}`).toBe(false)
  })

  it('2. FLAG ON: the scene is configured authored and fetches exactly the H2 pair', async () => {
    setStudioLotStageAH2Override(true)
    const data = await sceneConfig()
    expect(data.stageAH2).toBe(true)

    const urls = imagesRequested(data)
    expect(urls).toContain(H2_NORMAL)
    expect(urls).toContain(H2_WORN)
    expect(urls.filter((u) => u.includes('b-stage-a-h2'))).toHaveLength(2)
  })

  it('3. the flag is the ONLY thing that moves — Stage B is fetched identically either way', async () => {
    const off = imagesRequested(await sceneConfig())
    phaser.sceneAdds.length = 0
    setStudioLotStageAH2Override(true)
    const on = imagesRequested(await sceneConfig())

    // Stage B's authored pair is production content and default ON. It must appear in
    // both legs, unchanged, or the H2 proof has disturbed adopted art.
    const stageB = (urls: string[]) => urls.filter((u) => u.includes('b-stage-b'))
    expect(stageB(off)).toHaveLength(2)
    expect(stageB(on)).toEqual(stageB(off))
    // ...and the H2 pair is the entire difference between the two configurations.
    expect(on.filter((u) => !off.includes(u))).toEqual([H2_NORMAL, H2_WORN])
  })
})
