import { describe, expect, it, vi } from 'vitest'

const runtime = vi.hoisted(() => {
  type ProductionSelection = {
    productionId: string
    locationBuildingId: 'stage-a'
  }
  type Event =
    | { type: 'ready' }
    | { type: 'production'; production: ProductionSelection }

  class Events {
    handlers = new Map<string, () => void>()
    once(name: string, handler: () => void) { this.handlers.set(name, handler) }
    emit(name: string) { this.handlers.get(name)?.() }
  }

  class HollywoodScene {
    data: { reducedMotion?: boolean; onEvent: (event: Event) => void } | null = null
    reduced: boolean[] = []
    productionSelections: string[] = []
    annexSelections = 0
    annexSelectionResult = true
    telemetryResets = 0
    setReducedMotion(on: boolean) { this.reduced.push(on) }
    resetPerformanceTelemetry() { this.telemetryResets++ }
    applySnapshot() {}
    selectProductionFromHost(productionId: string) {
      this.productionSelections.push(productionId)
      return true
    }
    selectAnnexFromHost() {
      this.annexSelections++
      return this.annexSelectionResult
    }
    emitProduction(production: ProductionSelection) {
      this.data?.onEvent({ type: 'production', production })
    }
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
  it('forwards exact production identity and keeps host highlighting presentation-only', () => {
    const onHollywoodProduction = vi.fn()
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
      onHollywoodProduction,
    })
    const game = runtime.games.at(-1)!
    game.events.emit('ready')
    const scene = game.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>
    const exact = {
      productionId: 'production-stage-7',
      locationBuildingId: 'stage-a' as const,
    }

    scene.emitProduction(exact)

    expect(onHollywoodProduction).toHaveBeenCalledOnce()
    expect(onHollywoodProduction).toHaveBeenCalledWith(exact)

    onHollywoodProduction.mockClear()
    expect(view.selectHollywoodProduction(exact.productionId)).toBe(true)
    expect(scene.productionSelections).toEqual([exact.productionId])
    expect(onHollywoodProduction).not.toHaveBeenCalled()
  })

  it('selects the exact Annex without an event and returns false while unavailable', () => {
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
    })
    const game = runtime.games.at(-1)!

    expect(view.selectHollywoodAnnexPlace()).toBe(false)
    game.events.emit('ready')
    const scene = game.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>

    expect(view.selectHollywoodAnnexPlace()).toBe(true)
    expect(scene.annexSelections).toBe(1)

    scene.annexSelectionResult = false
    expect(view.selectHollywoodAnnexPlace()).toBe(false)
    expect(scene.annexSelections).toBe(2)
  })

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
