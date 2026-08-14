import { describe, expect, it, vi } from 'vitest'

const runtime = vi.hoisted(() => {
  class Events {
    handlers = new Map<string, () => void>()
    once(name: string, handler: () => void) { this.handlers.set(name, handler) }
    emit(name: string) { this.handlers.get(name)?.() }
  }

  class HollywoodScene {
    data: { reducedMotion?: boolean; onEvent: (event: { type: 'ready' }) => void } | null = null
    reduced: boolean[] = []
    telemetryResets = 0
    setReducedMotion(on: boolean) { this.reduced.push(on) }
    resetPerformanceTelemetry() { this.telemetryResets++ }
    applySnapshot() {}
  }

  class SceneManager {
    scenes = new Map<string, object>()
    paused = new Set<string>()
    add(key: string, SceneClass: new () => object, _autoStart: boolean, data: HollywoodScene['data']) {
      const scene = new SceneClass() as HollywoodScene
      scene.data = data
      this.scenes.set(key, scene)
      data?.onEvent({ type: 'ready' })
    }
    getScene(key: string) { return this.scenes.get(key) }
    isActive(key: string) { return this.scenes.has(key) && !this.paused.has(key) }
    isPaused(key: string) { return this.paused.has(key) }
    pause(key: string) { this.paused.add(key) }
    resume(key: string) { this.paused.delete(key) }
  }

  class Game {
    events = new Events()
    scene = new SceneManager()
    loop = { sleep: vi.fn(), wake: vi.fn() }
    destroy = vi.fn()
    constructor(_config: unknown) { games.push(this) }
  }

  const games: Game[] = []
  return { Game, HollywoodScene, games }
})

vi.mock('phaser', () => ({
  default: {
    AUTO: 0,
    Scale: { RESIZE: 0 },
    Game: runtime.Game,
  },
}))
vi.mock('./scene/LotScene', () => ({ LotScene: class LotScene {} }))
vi.mock('./hollywood/HollywoodScene', () => ({ HollywoodScene: runtime.HollywoodScene }))

import { StudioLotView } from './StudioLotView.ts'
import type { StudioLotSnapshot } from './snapshot/StudioLotSnapshot.ts'

const snapshot: StudioLotSnapshot = {
  studioName: 'Project: Studio',
  week: 1,
  cash: 1_000_000,
  cashBand: 'stable',
  standing: 'finding-footing',
  standingValues: { awareness: 20, prestige: 20, confidence: 20 },
  activeProductions: [],
  releasedFilms: [],
  releasePresence: 'none',
  latestReleaseTitle: null,
  people: [],
  buildings: [],
  selectedBuildingId: null,
  sceneSeed: 'studio-lot-view-hollywood-test',
}

describe('StudioLotView Hollywood lifecycle', () => {
  it('retains pre-ready reduced motion, forwards later changes, and pauses the Hollywood scene', () => {
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
    })
    const game = runtime.games.at(-1)!

    view.setReducedMotion(true)
    game.events.emit('ready')

    const scene = game.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>
    expect(scene.data?.reducedMotion).toBe(true)
    expect(scene.reduced).toEqual([true])

    view.setReducedMotion(false)
    expect(scene.reduced).toEqual([true, false])

    view.pause()
    expect(game.scene.isPaused('hollywood')).toBe(true)
    expect(game.loop.sleep).toHaveBeenCalledOnce()

    view.resume()
    expect(game.scene.isActive('hollywood')).toBe(true)
    expect(game.loop.wake).toHaveBeenCalledOnce()
    expect(scene.telemetryResets).toBe(1)
  })
})
