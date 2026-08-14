import { describe, expect, it, vi } from 'vitest'

const runtime = vi.hoisted(() => {
  type ProductionSelection = {
    productionId: string
    locationBuildingId: 'stage-a'
  }
  type SceneryLoadInSelection = ProductionSelection & { placeId: 'service-yard' }
  type GateVisitorSelection = { talentId: string }
  type GateVisitorPresentation = {
    talentId: string
    name: string
    marketRole: 'actor' | 'director' | 'writer' | 'craft'
    presentationRole: 'director' | 'talent'
    employmentStatus: 'freeAgent'
    studioSeed: string
    marketWeek: number
    offerTermWeeks: number[]
    placeId: 'studio-gate'
  }
  type Event =
    | { type: 'ready' }
    | {
        type: 'failure'
        reason:
          | 'manifest-load-failed'
          | 'manifest-invalid'
          | 'scene-create-failed'
          | 'scene-boot-failed'
          | 'renderer-context-lost'
      }
    | { type: 'production'; production: ProductionSelection }
    | { type: 'scenery-load-in'; sceneryLoadIn: SceneryLoadInSelection }
    | { type: 'gate-visitor'; visitor: GateVisitorSelection }

  class Events {
    handlers = new Map<string, () => void>()
    once(name: string, handler: () => void) { this.handlers.set(name, handler) }
    emit(name: string) { this.handlers.get(name)?.() }
  }

  class HollywoodScene {
    data: { reducedMotion?: boolean; onEvent: (event: Event) => void } | null = null
    reduced: boolean[] = []
    inputSuspensions: boolean[] = []
    productionSelections: string[] = []
    sceneryLoadInSelections: string[] = []
    sceneryLoadInSelectionResult = true
    annexSelections = 0
    annexSelectionResult = true
    publicitySelections = 0
    publicitySelectionResult = true
    gateSelections = 0
    gateSelectionResult = true
    gateFocuses = 0
    gateFocusResult = true
    gateVisitors: Array<GateVisitorPresentation | null> = []
    telemetryResets = 0
    failClosedCalls = 0
    snapshotsApplied: unknown[] = []
    setReducedMotion(on: boolean) { this.reduced.push(on) }
    setInputSuspended(on: boolean) { this.inputSuspensions.push(on) }
    resetPerformanceTelemetry() { this.telemetryResets++ }
    failClosedFromHost() { this.failClosedCalls++ }
    applySnapshot(snapshot: unknown) { this.snapshotsApplied.push(snapshot) }
    selectProductionFromHost(productionId: string) {
      this.productionSelections.push(productionId)
      return true
    }
    selectSceneryLoadInFromHost(productionId: string) {
      this.sceneryLoadInSelections.push(productionId)
      return this.sceneryLoadInSelectionResult
    }
    selectAnnexFromHost() {
      this.annexSelections++
      return this.annexSelectionResult
    }
    selectPublicityFromHost() {
      this.publicitySelections++
      return this.publicitySelectionResult
    }
    selectGateFromHost() {
      this.gateSelections++
      return this.gateSelectionResult
    }
    focusGateFromHost() {
      this.gateFocuses++
      return this.gateFocusResult
    }
    setGateVisitor(visitor: GateVisitorPresentation | null) {
      this.gateVisitors.push(visitor === null
        ? null
        : { ...visitor, offerTermWeeks: [...visitor.offerTermWeeks] })
      return true
    }
    emitProduction(production: ProductionSelection) {
      this.data?.onEvent({ type: 'production', production })
    }
    emitSceneryLoadIn(sceneryLoadIn: SceneryLoadInSelection) {
      this.data?.onEvent({ type: 'scenery-load-in', sceneryLoadIn })
    }
    emitGateVisitor(visitor: GateVisitorSelection) {
      this.data?.onEvent({ type: 'gate-visitor', visitor })
    }
    emitFailure(reason: Extract<Event, { type: 'failure' }>['reason']) {
      this.data?.onEvent({ type: 'failure', reason })
    }
  }

  class SceneManager {
    scenes = new Map<string, object>()
    paused = new Set<string>()
    startupEvent: Event = { type: 'ready' }
    addError: Error | null = null
    add(key: string, SceneClass: new () => object, _autoStart: boolean, data: HollywoodScene['data']) {
      if (this.addError) throw this.addError
      const scene = new SceneClass() as HollywoodScene
      scene.data = data
      this.scenes.set(key, scene)
      data?.onEvent(this.startupEvent)
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
    Core: { Events: { CONTEXT_LOST: 'contextlost' } },
    Game: runtime.Game,
  },
}))
vi.mock('./scene/LotScene', () => ({ LotScene: class LotScene {} }))
vi.mock('./hollywood/HollywoodScene', () => ({ HollywoodScene: runtime.HollywoodScene }))

import { StudioLotView } from './StudioLotView.ts'
import type {
  LotPublicityOffer,
  StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'

function publicityOffersAtWeek(week: number): LotPublicityOffer[] {
  const unavailable = {
    globalCooldownWeeks: 6,
    available: false,
    availableWeek: week,
    reason: 'Insufficient cash for this campaign.',
  } as const
  return [
    {
      tier: 'whisper',
      cost: 1_200_000,
      maxLift: 18,
      expectedLift: 4.718592000000002,
      pricePerPoint: 254_313.15104166657,
      cooldownWeeks: 8,
      ...unavailable,
    },
    {
      tier: 'push',
      cost: 3_600_000,
      maxLift: 30,
      expectedLift: 7.864320000000003,
      pricePerPoint: 457_763.6718749998,
      cooldownWeeks: 12,
      ...unavailable,
    },
    {
      tier: 'blitz',
      cost: 8_000_000,
      maxLift: 42,
      expectedLift: 11.010048000000005,
      pricePerPoint: 726_609.0029761902,
      cooldownWeeks: 20,
      ...unavailable,
    },
  ]
}

const snapshot: StudioLotSnapshot = {
  studioName: 'Project: Studio',
  week: 1,
  cash: 1_000_000,
  cashBand: 'stable',
  standing: 'finding-footing',
  standingValues: { awareness: 20, prestige: 20, confidence: 20 },
  publicityOffers: publicityOffersAtWeek(1),
  annexWork: null,
  activeProductions: [],
  releasedFilms: [],
  releasePresence: 'none',
  latestReleaseTitle: null,
  people: [],
  buildings: [],
  selectedBuildingId: null,
  sceneSeed: 'studio-lot-view-hollywood-test',
}

const visitor = (
  overrides: Partial<import('./StudioLotView.ts').HollywoodGateVisitorPresentation> = {},
): import('./StudioLotView.ts').HollywoodGateVisitorPresentation => ({
  talentId: 'visitor-1',
  name: 'Mara Voss',
  marketRole: 'director',
  presentationRole: 'director',
  employmentStatus: 'freeAgent',
  studioSeed: snapshot.sceneSeed,
  marketWeek: snapshot.week,
  offerTermWeeks: [26, 52, 104],
  placeId: 'studio-gate',
  ...overrides,
})

describe('StudioLotView Hollywood lifecycle', () => {
  it('forwards one exact scene failure and never promotes that generation to ready', () => {
    const onHollywoodFailure = vi.fn()
    const onReady = vi.fn()
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
      onHollywoodFailure,
      onReady,
    })
    const game = runtime.games.at(-1)!
    game.scene.startupEvent = { type: 'failure', reason: 'manifest-invalid' }

    game.events.emit('ready')

    const scene = game.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>
    scene.emitFailure('scene-create-failed')
    expect(onHollywoodFailure).toHaveBeenCalledOnce()
    expect(onHollywoodFailure).toHaveBeenCalledWith('manifest-invalid')
    expect(onReady).not.toHaveBeenCalled()
    expect(view.selectHollywoodPublicityPlace()).toBe(false)
  })

  it('surfaces a synchronous SceneManager boot failure after View construction', () => {
    const onHollywoodFailure = vi.fn()
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
      onHollywoodFailure,
    })
    const game = runtime.games.at(-1)!
    game.scene.addError = new Error('forced scene-manager boot failure')

    game.events.emit('ready')

    expect(onHollywoodFailure).toHaveBeenCalledOnce()
    expect(onHollywoodFailure).toHaveBeenCalledWith('scene-boot-failed')
    expect(view.selectHollywoodPublicityPlace()).toBe(false)
  })

  it('reports renderer context loss once and clears the physical scene seam', () => {
    const onHollywoodFailure = vi.fn()
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
      onHollywoodFailure,
    })
    const game = runtime.games.at(-1)!
    game.events.emit('ready')
    expect(view.selectHollywoodPublicityPlace()).toBe(true)

    game.events.emit('contextlost')
    game.events.emit('contextlost')

    expect(onHollywoodFailure).toHaveBeenCalledOnce()
    expect(onHollywoodFailure).toHaveBeenCalledWith('renderer-context-lost')
    expect(view.selectHollywoodPublicityPlace()).toBe(false)
    const scene = game.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>
    expect(scene.inputSuspensions).toEqual([false])
    expect(scene.failClosedCalls).toBe(1)

    // Visibility lifecycle wakes the renderer loop but must never resume the
    // registered, failed Hollywood generation whose live host seam is now null.
    game.scene.paused.add('hollywood')
    view.pause()
    view.resume()
    expect(game.loop.wake).toHaveBeenCalledOnce()
    expect(game.scene.isPaused('hollywood')).toBe(true)
  })

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

  it('reports exact publicity physical availability through the host-selection return value', () => {
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
    })
    const game = runtime.games.at(-1)!

    expect(view.selectHollywoodPublicityPlace()).toBe(false)
    game.events.emit('ready')
    const scene = game.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>

    expect(view.selectHollywoodPublicityPlace()).toBe(true)
    expect(scene.publicitySelections).toBe(1)

    scene.publicitySelectionResult = false
    expect(view.selectHollywoodPublicityPlace()).toBe(false)
    expect(scene.publicitySelections).toBe(2)

    view.recreate()
    expect(view.selectHollywoodPublicityPlace()).toBe(false)
  })

  it('starts a fresh Hollywood evidence window only when the live scene exists', () => {
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
    })
    const game = runtime.games.at(-1)!

    view.resetHollywoodPerformance()
    game.events.emit('ready')
    const scene = game.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>
    expect(scene.telemetryResets).toBe(0)

    view.resetHollywoodPerformance()
    expect(scene.telemetryResets).toBe(1)
  })

  it('forwards exact scenery identity and returns truthful host-selection parity', () => {
    const onHollywoodSceneryLoadIn = vi.fn()
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
      onHollywoodSceneryLoadIn,
    })
    const game = runtime.games.at(-1)!

    expect(view.selectHollywoodSceneryLoadIn('production-stage-7')).toBe(false)
    game.events.emit('ready')
    const scene = game.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>
    const exact = {
      productionId: 'production-stage-7',
      locationBuildingId: 'stage-a' as const,
      placeId: 'service-yard' as const,
    }

    scene.emitSceneryLoadIn(exact)
    expect(onHollywoodSceneryLoadIn).toHaveBeenCalledOnce()
    expect(onHollywoodSceneryLoadIn).toHaveBeenCalledWith(exact)

    onHollywoodSceneryLoadIn.mockClear()
    expect(view.selectHollywoodSceneryLoadIn(exact.productionId)).toBe(true)
    expect(scene.sceneryLoadInSelections).toEqual([exact.productionId])
    expect(onHollywoodSceneryLoadIn).not.toHaveBeenCalled()

    scene.sceneryLoadInSelectionResult = false
    expect(view.selectHollywoodSceneryLoadIn(exact.productionId)).toBe(false)
    expect(scene.sceneryLoadInSelections).toEqual([exact.productionId, exact.productionId])
    expect(onHollywoodSceneryLoadIn).not.toHaveBeenCalled()
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
    expect(scene.snapshotsApplied).toEqual([snapshot])
    expect(scene.telemetryResets).toBe(1)
  })

  it('retains modal input suspension across delayed readiness, visibility resume, and recreation', () => {
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
    })
    const firstGame = runtime.games.at(-1)!

    // The modal may open before Phaser finishes its lazy boot.
    view.setInputSuspended(true)
    firstGame.events.emit('ready')
    const firstScene = firstGame.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>
    expect(firstScene.inputSuspensions).toEqual([true])

    // Visibility lifecycle may sleep and wake the renderer, but it must not clear
    // the independently retained modal boundary.
    view.pause()
    view.resume()
    expect(firstGame.scene.isActive('hollywood')).toBe(true)
    expect(firstScene.inputSuspensions).toEqual([true, true])

    // A renderer replacement also receives the retained value only when ready.
    view.recreate()
    const replacementGame = runtime.games.at(-1)!
    expect(replacementGame).not.toBe(firstGame)
    replacementGame.events.emit('ready')
    const replacementScene = replacementGame.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>
    expect(replacementScene.inputSuspensions).toEqual([true])

    view.setInputSuspended(false)
    expect(replacementScene.inputSuspensions).toEqual([true, false])
  })

  it('retains only the latest complete visitor across delayed readiness and recreation', () => {
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
    })
    const firstGame = runtime.games.at(-1)!
    const first = visitor()
    const latest = visitor({
      talentId: 'visitor-2',
      name: 'Eli North',
      marketRole: 'actor',
      presentationRole: 'talent',
      offerTermWeeks: [13, 26],
    })

    expect(view.setHollywoodGateVisitor(first)).toBe(false)
    expect(view.setHollywoodGateVisitor(latest)).toBe(false)
    latest.offerTermWeeks.push(999) // the View must retain an independent copy
    firstGame.events.emit('ready')

    const firstScene = firstGame.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>
    expect(firstScene.gateVisitors).toEqual([visitor({
      talentId: 'visitor-2',
      name: 'Eli North',
      marketRole: 'actor',
      presentationRole: 'talent',
      offerTermWeeks: [13, 26],
    })])

    expect(view.setHollywoodGateVisitor(first)).toBe(true)
    view.recreate()
    const replacementGame = runtime.games.at(-1)!
    replacementGame.events.emit('ready')
    const replacementScene = replacementGame.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>
    expect(replacementScene.gateVisitors).toEqual([first])

    expect(view.setHollywoodGateVisitor(null)).toBe(true)
    expect(replacementScene.gateVisitors.at(-1)).toBeNull()
  })

  it('forwards identity-only visitor selection and exposes exact Gate host parity', () => {
    const onHollywoodGateVisitor = vi.fn()
    const view = new StudioLotView({
      parent: document.createElement('div'),
      snapshot,
      hollywood: true,
      onHollywoodGateVisitor,
    })
    const game = runtime.games.at(-1)!

    expect(view.selectHollywoodGatePlace()).toBe(false)
    expect(view.focusHollywoodGate()).toBe(false)
    game.events.emit('ready')
    const scene = game.scene.getScene('hollywood') as InstanceType<typeof runtime.HollywoodScene>

    expect(view.selectHollywoodGatePlace()).toBe(true)
    expect(view.focusHollywoodGate()).toBe(true)
    expect(scene.gateSelections).toBe(1)
    expect(scene.gateFocuses).toBe(1)

    scene.emitGateVisitor({ talentId: 'visitor-1' })
    expect(onHollywoodGateVisitor).toHaveBeenCalledOnce()
    expect(onHollywoodGateVisitor).toHaveBeenCalledWith({ talentId: 'visitor-1' })

    scene.gateSelectionResult = false
    scene.gateFocusResult = false
    expect(view.selectHollywoodGatePlace()).toBe(false)
    expect(view.focusHollywoodGate()).toBe(false)
  })
})
