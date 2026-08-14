// ── Adopted Stage A content gate — the wiring between the two proved endpoints ─
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
import { setStudioLotAuthoredStageARollback } from '../flags.ts'

afterEach(() => {
  phaser.sceneAdds.length = 0
  setStudioLotAuthoredStageARollback(false)
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
  render(
    <StudioLotScreen
      state={foundStudio('h2-wiring')}
      onNavigate={noop}
      onExit={noop}
      onAdvance={noop}
    />,
  )
  await waitFor(() => expect(phaser.sceneAdds).toHaveLength(1))
  expect(phaser.sceneAdds[0]!.key).toBe('lot')
  return phaser.sceneAdds[0]!.data as unknown as LotSceneData
}

/** Run the REAL scene's preload against that configuration and record what it fetches. */
function imagesRequested(data: LotSceneData): string[] {
  const scene = new LotScene()
  const urls: string[] = []
  Object.assign(scene, {
    // Mirrors exactly the loader surface preload() uses: queue images, register the
    // per-building failure handler. Nothing else is stubbed, so a new loader call in
    // production code surfaces here as a failure rather than being silently absorbed.
    load: { image: (_key: string, url: string) => urls.push(url), on: () => {}, once: () => {} },
  })
  scene.init(data)
  scene.preload()
  return urls
}

const A_NORMAL = '/lot/b-stage-a-h2.png'
const A_WORN = '/lot/b-stage-a-h2-ud.png'

describe('Stage A — the adopted gate reaches the scene', () => {
  it('1. DEFAULT (no override): the scene is configured AUTHORED and fetches exactly the pair', async () => {
    const data = await sceneConfig()
    expect(data.authoredStageA).toBe(true)

    const urls = imagesRequested(data)
    expect(urls).toContain(A_NORMAL)
    expect(urls).toContain(A_WORN)
    expect(urls.filter((u) => u.includes('b-stage-a-h2'))).toHaveLength(2)
  })

  it('2. EXPLICIT ROLLBACK: the scene is configured procedural and fetches no authored Stage A', async () => {
    setStudioLotAuthoredStageARollback(true)
    const data = await sceneConfig()
    expect(data.authoredStageA).toBe(false)

    const urls = imagesRequested(data)
    expect(urls).not.toContain(A_NORMAL)
    expect(urls).not.toContain(A_WORN)
    // A rolled-back building must cost nothing: it never reaches the loader at all.
    expect(urls.some((u) => u.includes('b-stage-a-h2')), `fetched ${JSON.stringify(urls)}`).toBe(false)
  })

  it('3. the rollback is the ONLY thing that moves — Stage B is fetched identically either way', async () => {
    const dflt = imagesRequested(await sceneConfig())
    phaser.sceneAdds.length = 0
    setStudioLotAuthoredStageARollback(true)
    const rolledBack = imagesRequested(await sceneConfig())

    // Stage B's authored pair is production content and default ON. It must appear in
    // both legs, unchanged, or rolling Stage A back has disturbed adopted Stage B art.
    const stageB = (urls: string[]) => urls.filter((u) => u.includes('b-stage-b'))
    expect(stageB(dflt)).toHaveLength(2)
    expect(stageB(rolledBack)).toEqual(stageB(dflt))
    // ...and the Stage A pair is the entire difference between the two configurations.
    expect(dflt.filter((u) => !rolledBack.includes(u))).toEqual([A_NORMAL, A_WORN])
  })
})
