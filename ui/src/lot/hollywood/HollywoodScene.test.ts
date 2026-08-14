import { describe, expect, it, vi } from 'vitest'

const fakePhaser = vi.hoisted(() => {
  const canvas = {}
  class DisplayObject {
    x: number
    y: number
    text = ''
    texture = ''
    frame: string | number | null = null
    scale = 1
    flipX = false
    depth = 0
    destroyed = false
    visible = true
    fillColor = 0
    interactive = false
    handlers = new Map<string, Array<(...args: unknown[]) => void>>()

    constructor(x = 0, y = 0, texture = '') {
      this.x = x
      this.y = y
      this.texture = texture
    }

    setOrigin() { return this }
    setDepth(depth: number) { this.depth = depth; return this }
    setInteractive() { this.interactive = true; return this }
    on<TArgs extends unknown[]>(name: string, handler: (...args: TArgs) => void) {
      const handlers = this.handlers.get(name) ?? []
      handlers.push(handler as (...args: unknown[]) => void)
      this.handlers.set(name, handlers)
      return this
    }
    emit(name: string, ...args: unknown[]) {
      for (const handler of this.handlers.get(name) ?? []) handler(...args)
      return this
    }
    setVisible(visible: boolean) { this.visible = visible; return this }
    setTint() { return this }
    setTexture(texture: string, frame?: string | number) {
      this.texture = texture
      if (frame !== undefined) this.frame = frame
      return this
    }
    setFrame(frame: string | number) { this.frame = frame; return this }
    setPosition(x: number, y: number) { this.x = x; this.y = y; return this }
    setFlipX(flip = true) { this.flipX = flip; return this }
    setScale(scale: number) { this.scale = scale; return this }
    setAlpha() { return this }
    setText(text: string) { this.text = text; return this }
    setFillStyle(color: number) { this.fillColor = color; return this }
    setStrokeStyle() { return this }
    setName() { return this }
    destroy() { this.destroyed = true }
  }

  class Graphics extends DisplayObject {
    constructor(private readonly onGenerate?: (key: string, width: number, height: number) => void) {
      super()
    }
    clear() { return this }
    fillStyle() { return this }
    fillEllipse() { return this }
    fillRoundedRect() { return this }
    fillTriangle() { return this }
    lineStyle() { return this }
    lineBetween() { return this }
    fillCircle() { return this }
    fillRect() { return this }
    strokeRect() { return this }
    strokeCircle() { return this }
    strokeRoundedRect() { return this }
    fillPoints() { return this }
    strokePoints() { return this }
    generateTexture(key: string, width: number, height: number) {
      this.onGenerate?.(key, width, height)
      return this
    }
  }

  class Tween {
    paused = 0
    resumed = 0
    pause() { this.paused++ }
    resume() { this.resumed++ }
  }

  class Scene {
    sprites: DisplayObject[] = []
    texts: DisplayObject[] = []
    zones: DisplayObject[] = []
    circles: DisplayObject[] = []
    rectangles: DisplayObject[] = []
    graphicsObjects: Graphics[] = []
    images: DisplayObject[] = []
    imageLoads: Array<{ key: string; url: string }> = []
    textureSizes = new Map<string, { width: number; height: number; generated: boolean }>()
    tweenAdds: unknown[] = []
    children = { length: 0 }
    game = { canvas, loop: { rawDelta: 0, actualFps: 60 } }
    scene = { isActive: () => true }
    load = {
      json: () => {},
      spritesheet: () => {},
      image: (key: string, url: string) => {
        this.imageLoads.push({ key, url })
        this.textureSizes.set(key, { width: 0, height: 0, generated: false })
      },
    }
    textures = {
      exists: (key: string) => this.textureSizes.has(key),
    }
    make = {
      graphics: () => new Graphics((key, width, height) => {
        this.textureSizes.set(key, { width, height, generated: true })
      }),
    }
    add = {
      image: (x: number, y: number, texture: string) => {
        const image = new DisplayObject(x, y, texture)
        this.images.push(image)
        return image
      },
      sprite: (x: number, y: number, texture: string) => {
        const sprite = new DisplayObject(x, y, texture)
        this.sprites.push(sprite)
        return sprite
      },
      text: (x: number, y: number, text: string) => {
        const label = new DisplayObject(x, y)
        label.text = text
        this.texts.push(label)
        return label
      },
      zone: (x: number, y: number) => {
        const zone = new DisplayObject(x, y)
        this.zones.push(zone)
        return zone
      },
      graphics: () => {
        const graphics = new Graphics()
        this.graphicsObjects.push(graphics)
        return graphics
      },
      rectangle: (x: number, y: number) => {
        const rectangle = new DisplayObject(x, y)
        this.rectangles.push(rectangle)
        return rectangle
      },
      circle: (x: number, y: number) => {
        const circle = new DisplayObject(x, y)
        this.circles.push(circle)
        return circle
      },
    }
    tweens = {
      add: (config: unknown) => {
        this.tweenAdds.push(config)
        return new Tween()
      },
    }
    cameras = {
      main: {
        centerOn: vi.fn(),
        setZoom: vi.fn(),
        pan: vi.fn(),
        zoomTo: vi.fn(),
      },
    }
  }

  return { canvas, DisplayObject, Graphics, Scene, Tween }
})

vi.mock('phaser', () => ({
  default: {
    Scene: fakePhaser.Scene,
    Math: {
      Linear: (a: number, b: number, t: number) => a + (b - a) * t,
      Clamp: (value: number, min: number, max: number) => globalThis.Math.max(min, globalThis.Math.min(max, value)),
      Easing: { Sine: { InOut: (value: number) => value } },
      Vector2: class Vector2 { constructor(public x: number, public y: number) {} },
    },
    Geom: { Polygon: class Polygon {} },
  },
}))

import { HollywoodScene, type HollywoodEvent } from './HollywoodScene.ts'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
} from '../../../../src/core/index.ts'
import type { CreativeRole, GameState } from '../../../../src/core/index.ts'
import { runProductionCommand, studioLotSnapshot } from '../../engine/adapter.ts'
import type {
  LotPersonState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from '../snapshot/StudioLotSnapshot.ts'

function foundManagedEngineState(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = state.founding!.applicantIds.map(
    (id) => state.talent.find((candidate) => candidate.id === id)!,
  )
  const byRole = (role: CreativeRole, count: number) =>
    pool.filter((candidate) => candidate.role === role).slice(0, count)
  const hires = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const person of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks: 156 }])
  }
  return applyActions(applyActions(state, [{ kind: 'foundStudio' }]), [
    { kind: 'activateStudioOperations' },
  ])
}

function greenlightEngineFilm(state: GameState): GameState {
  const concept = state.concepts[0]!
  const ids = (role: CreativeRole) => state.contracts
    .map((contract) => state.talent.find((talent) => talent.id === contract.talentId)!)
    .filter((talent) => talent.role === role)
    .map((talent) => talent.id)
  const actors = ids('actor')
  return applyActions(state, [{
    kind: 'greenlight',
    production: {
      conceptId: concept.id,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: {
          intimacy: [-0.5, 0.5],
          tonalWeight: [-0.5, 0.5],
          kineticEnergy: [-0.5, 0.5],
        },
      },
      writerId: ids('writer')[0]!,
      directorId: ids('director')[0]!,
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
      craftIds: [ids('craft')[0]!],
      budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
    },
  }])
}

function advanceEngineState(state: GameState, weeks: number): GameState {
  let next = state
  for (let week = 0; week < weeks; week++) next = tick(next)
  return next
}

const director = (overrides: Partial<LotPersonState> = {}): LotPersonState => ({
  id: 'director-1',
  name: 'June Hart',
  role: 'director',
  authority: 'active-production',
  productionId: 'production-1',
  productionTitle: 'Night Crossing',
  ...overrides,
})

const talent = (overrides: Partial<LotPersonState> = {}): LotPersonState => ({
  id: 'talent-1',
  name: 'Alex Vale',
  role: 'talent',
  authority: 'active-production',
  productionId: 'production-1',
  productionTitle: 'Night Crossing',
  ...overrides,
})

const operation = (
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState => ({
  productionId: 'production-1',
  title: 'Night Crossing',
  phase: 'shooting',
  phaseLabel: 'Shooting',
  weeksRemaining: 5,
  progress01: 3 / 8,
  locationBuildingId: 'stage-a',
  facilityLabel: 'Soundstage 7 + Scenery Shop',
  directorId: 'director-1',
  directorName: 'June Hart',
  taskStatus: 'unassigned',
  statusLabel: 'Decision required',
  blocker: {
    kind: 'director-dispatch',
    headline: 'Director call required',
    detail: 'June Hart has not been dispatched.',
  },
  attention: 'decision-required',
  currentCommand: {
    kind: 'assignShootingDirector',
    productionId: 'production-1',
    directorId: 'director-1',
    label: 'Call June Hart to Soundstage 7',
  },
  ...overrides,
})

function snapshot(
  people: LotPersonState[],
  operations: ProductionOperationsState[] = [],
): StudioLotSnapshot {
  return {
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
    people,
    buildings: [],
    selectedBuildingId: null,
    sceneSeed: 'hollywood-scene-test',
    operationsMode: 'managed',
    stageAssignmentAuthority: 'engine',
    productionOperations: operations,
  }
}

type SceneHarness = InstanceType<typeof fakePhaser.Scene> & {
  runtimePeople: Map<string, {
    fact: LotPersonState
    sprite: InstanceType<typeof fakePhaser.DisplayObject>
    label: InstanceType<typeof fakePhaser.DisplayObject>
    homeSlot: number
  }>
  route: Array<{ x: number; y: number; actorDepth: number; cue: string }>
  manifest: {
    districtId: string
    textureMemoryBytes: number
    layers: Array<{
      id: string
      kind: 'baked' | 'occluder'
      depth: number
      output: string
      x: number
      y: number
      width: number
      height: number
    }>
    activities: Array<{ id: string; place: string; visualStates: string[] }>
    places: Array<{
      id: string
      buildingId: 'stage-a'
      label: string
      affordances: string[]
      anchors: Record<string, [number, number]>
      selectionPolygon: [number, number][]
    }>
  }
  ambientActors: Array<{
    sprite: InstanceType<typeof fakePhaser.DisplayObject>
    a: { x: number; y: number }
    b: { x: number; y: number }
    phase: number
    speed: number
  }>
  vehicleTween: InstanceType<typeof fakePhaser.Tween> | null
  flash: InstanceType<typeof fakePhaser.DisplayObject> | null
  stageStateText: InstanceType<typeof fakePhaser.DisplayObject> | null
  stageLamp: InstanceType<typeof fakePhaser.DisplayObject> | null
  activityGraphics: InstanceType<typeof fakePhaser.Graphics> | null
  fitZoom: number
  expansionGraphics: InstanceType<typeof fakePhaser.Graphics> | null
  expansionLabel: InstanceType<typeof fakePhaser.DisplayObject> | null
  roleAtlasActive: boolean
  performanceWarmupFramesRemaining: number
  buildWorld: () => void
  buildAmbientLife: () => void
  buildSemanticHotspots: () => void
  buildActorTextures: () => void
  selectStage7Surface: (place: {
    id: string
    buildingId: 'stage-a'
    label: string
    affordances: string[]
  }) => void
}

function harness(initial: StudioLotSnapshot, reducedMotion = false) {
  const events: HollywoodEvent[] = []
  const scene = new HollywoodScene()
  scene.init({ snapshot: initial, reducedMotion, onEvent: (event) => events.push(event) })
  const internals = scene as unknown as SceneHarness
  internals.manifest = {
    districtId: 'district',
    textureMemoryBytes: 0,
    layers: [],
    activities: [{ id: 'shooting', place: 'stage-7', visualStates: ['crew-call', 'equipment-staged', 'take-in-progress'] }],
    places: [{
      id: 'stage-7',
      buildingId: 'stage-a',
      label: 'Stage 7',
      affordances: ['enter-stage', 'shoot', 'load-in'],
      anchors: { crewCall: [50, 60] },
      selectionPolygon: [[0, 0], [100, 0], [100, 100], [0, 100]],
    }],
  }
  internals.route = [
    { x: 10, y: 20, actorDepth: 30, cue: 'street' },
    { x: 70, y: 80, actorDepth: 82, cue: 'enter-stage' },
  ]
  internals.stageStateText = new fakePhaser.DisplayObject()
  internals.stageLamp = new fakePhaser.DisplayObject()
  internals.activityGraphics = new fakePhaser.Graphics()
  scene.applySnapshot(initial)
  return { scene, internals, events }
}

describe('HollywoodScene snapshot authority', () => {
  function pointer(target: unknown = fakePhaser.canvas) {
    return { event: { stopPropagation: vi.fn(), target } }
  }

  function productionEvents(events: HollywoodEvent[]) {
    return events.filter((event) => event.type === 'production')
  }

  it('routes the Stage 7 polygon, lamp, and status through one exact identity-only selection seam', () => {
    const exact = operation()
    const { internals, events } = harness(snapshot([director()], [exact]))
    const shared = vi.spyOn(internals, 'selectStage7Surface')
    internals.buildWorld()
    internals.buildSemanticHotspots()

    internals.zones[0]!.emit('pointerdown', pointer())
    internals.stageLamp!.emit('pointerdown', pointer())
    internals.stageStateText!.emit('pointerdown', pointer())

    expect(shared).toHaveBeenCalledTimes(3)
    expect(productionEvents(events)).toEqual([
      {
        type: 'production',
        production: { productionId: exact.productionId, locationBuildingId: 'stage-a' },
      },
      {
        type: 'production',
        production: { productionId: exact.productionId, locationBuildingId: 'stage-a' },
      },
      {
        type: 'production',
        production: { productionId: exact.productionId, locationBuildingId: 'stage-a' },
      },
    ])
    for (const event of productionEvents(events)) {
      if (event.type !== 'production') throw new Error('expected production event')
      expect(Object.keys(event.production).sort()).toEqual(['locationBuildingId', 'productionId'])
    }
  })

  it('ignores scene hits whose native event belongs to an over-canvas DOM control', () => {
    const exact = operation()
    const { scene, internals, events } = harness(snapshot([director()], [exact]))
    internals.buildWorld()
    internals.buildSemanticHotspots()

    const overlayButton = {}
    internals.zones[0]!.emit('pointerdown', pointer(overlayButton))
    internals.stageLamp!.emit('pointerdown', pointer(overlayButton))
    internals.stageStateText!.emit('pointerdown', pointer(overlayButton))
    expect(events).toEqual([])

    const canvas = (scene as unknown as { game: { canvas: unknown } }).game.canvas
    internals.stageStateText!.emit('pointerdown', pointer(canvas))
    expect(productionEvents(events)).toEqual([{
      type: 'production',
      production: { productionId: exact.productionId, locationBuildingId: 'stage-a' },
    }])
  })

  it('keeps ordinary Stage 7 place selection when no managed Stage 7 operation exists', () => {
    const { internals, events } = harness(snapshot([]))
    internals.buildSemanticHotspots()

    internals.zones[0]!.emit('pointerdown', pointer())

    expect(productionEvents(events)).toEqual([])
    expect(events).toContainEqual({
      type: 'place',
      place: {
        id: 'stage-7',
        buildingId: 'stage-a',
        label: 'Stage 7',
        affordances: ['enter-stage', 'shoot', 'load-in'],
      },
    })
  })

  it('never borrows a Stage 12 operation for the physical Stage 7 selection seam', () => {
    const stage12 = operation({
      productionId: 'production-stage-12',
      locationBuildingId: 'stage-b',
      facilityLabel: 'Soundstage 12 + Scenery Shop',
    })
    const { internals, events } = harness(snapshot([director()], [stage12]))
    internals.buildWorld()
    internals.buildSemanticHotspots()

    internals.zones[0]!.emit('pointerdown', pointer())
    internals.stageLamp!.emit('pointerdown', pointer())
    internals.stageStateText!.emit('pointerdown', pointer())

    expect(productionEvents(events)).toEqual([])
    expect(events.filter((event) => event.type === 'place')).toHaveLength(3)
  })

  it('selects exact Stage 7 identity with Stage 12 first and reads the latest snapshot at click time', () => {
    const stage12 = operation({
      productionId: 'production-stage-12',
      locationBuildingId: 'stage-b',
      facilityLabel: 'Soundstage 12 + Scenery Shop',
    })
    const firstStage7 = operation({ productionId: 'production-stage-7-old' })
    const { scene, internals, events } = harness(
      snapshot([director()], [stage12, firstStage7]),
    )
    internals.buildSemanticHotspots()

    const latestStage7 = operation({
      productionId: 'production-stage-7-latest',
      title: 'Latest Stage 7 Picture',
    })
    scene.applySnapshot(snapshot([director()], [stage12, latestStage7]))
    internals.zones[0]!.emit('pointerdown', pointer())

    expect(productionEvents(events)).toEqual([
      {
        type: 'production',
        production: {
          productionId: 'production-stage-7-latest',
          locationBuildingId: 'stage-a',
        },
      },
    ])
  })

  it('lets the semantic host highlight only exact current Stage 7 without re-emitting selection', () => {
    const exact = operation({ productionId: 'production-stage-7' })
    const { scene, internals, events } = harness(snapshot([director()], [exact]))
    internals.buildWorld()
    const eventCount = events.length

    expect(scene.selectProductionFromHost(exact.productionId)).toBe(true)
    expect(scene.debugState().selectedPlaceId).toBe('stage-7')
    expect(events).toHaveLength(eventCount)

    expect(scene.selectProductionFromHost('production-not-on-stage-7')).toBe(false)
    expect(events).toHaveLength(eventCount)

    scene.applySnapshot(snapshot([director()], [{
      ...exact,
      locationBuildingId: 'stage-b',
      facilityLabel: 'Soundstage 12 + Scenery Shop',
    }]))
    expect(scene.selectProductionFromHost(exact.productionId)).toBe(false)
    expect(events).toHaveLength(eventCount)
  })

  it('uses one validated atlas frame per existing actor while generated textures remain fallback', () => {
    const { scene, internals } = harness(snapshot([]))
    internals.roleAtlasActive = true
    scene.applySnapshot(snapshot([director(), talent()], [operation()]))

    const managedDirector = internals.runtimePeople.get('director-1')!.sprite
    const managedTalent = internals.runtimePeople.get('talent-1')!.sprite
    expect(managedDirector).toMatchObject({
      texture: 'hollywood-role-atlas-v1',
      frame: 0,
      scale: 74 / 128,
      flipX: false,
    })
    expect(managedTalent).toMatchObject({ texture: 'hollywood-role-atlas-v1', frame: 4 })

    scene.applySnapshot(snapshot([
      director({ role: 'talent' }),
      talent(),
    ]))
    expect(managedDirector).toMatchObject({
      texture: 'hollywood-role-atlas-v1',
      frame: 4,
      scale: 74 / 128,
      x: 1252,
      y: 489,
    })
    scene.applySnapshot(snapshot([director(), talent()], [operation()]))
    expect(managedDirector).toMatchObject({
      texture: 'hollywood-role-atlas-v1',
      frame: 0,
      x: 150,
      y: 806,
    })

    internals.buildAmbientLife()
    const grip = internals.ambientActors[0]!
    expect(grip.sprite).toMatchObject({
      texture: 'hollywood-role-atlas-v1',
      frame: 9,
      scale: (74 / 128) * 0.9,
    })
    grip.phase = 0.49
    grip.sprite.setPosition(grip.b.x, grip.b.y)
    scene.update(0, 500)
    expect(grip.sprite.frame).toBe(11)

    scene.setReducedMotion(true)
    expect(grip.sprite.frame).toBe(8)

    internals.route = [
      { x: 142, y: 805, actorDepth: 30, cue: 'going' },
      { x: 244, y: 682, actorDepth: 30, cue: 'behind-truck' },
      { x: 411, y: 591, actorDepth: 50, cue: 'past-truck' },
      { x: 514, y: 535, actorDepth: 56, cue: 'behind-camera' },
      { x: 658, y: 469, actorDepth: 78, cue: 'past-camera' },
      { x: 586, y: 383, actorDepth: 82, cue: 'enter-stage' },
    ]
    scene.setReducedMotion(false)
    scene.applySnapshot(snapshot([director(), talent()], [operation({ taskStatus: 'blocked' })]))
    scene.update(0, 1)
    expect(managedDirector.frame).toBe(2)
    const governedRouteFrames: number[] = [managedDirector.frame as number]
    for (let segment = 1; segment < internals.route.length - 1; segment++) {
      scene.update(0, 1300)
      governedRouteFrames.push(managedDirector.frame as number)
    }
    expect(governedRouteFrames).toEqual([2, 1, 1, 1, 2])
    scene.update(0, 1300)
    expect(managedDirector.frame).toBe(0)
    expect(managedDirector).toMatchObject({ x: 586, y: 383, depth: 82 })
    expect(scene.debugState().roleAtlasActive).toBe(true)

    const activeActorObjects = internals.sprites.length
    const fallback = harness(snapshot([]))
    fallback.scene.applySnapshot(snapshot([director(), talent()], [operation()]))
    fallback.internals.buildAmbientLife()
    expect(fallback.internals.sprites).toHaveLength(activeActorObjects)
  })

  it('keeps the existing generated actor path when no valid atlas was activated', () => {
    const { internals } = harness(snapshot([director()]))
    expect(internals.roleAtlasActive).toBe(false)
    expect(internals.runtimePeople.get('director-1')!.sprite).toMatchObject({
      texture: 'hollywood-director',
      scale: 1,
      flipX: false,
    })
  })

  it('keeps invisible place hit areas below managed people in pointer ordering', () => {
    const { internals } = harness(snapshot([director()]))
    internals.buildSemanticHotspots()

    expect(internals.zones).toHaveLength(1)
    expect(internals.zones[0]!.depth).toBeLessThan(
      internals.runtimePeople.get('director-1')!.sprite.depth,
    )
  })

  it('keeps the camera-person fallback distinct from the camera-dolly occluder', () => {
    const { scene, internals } = harness(snapshot([]))
    scene.preload()
    internals.buildActorTextures()

    expect(internals.imageLoads).toContainEqual({
      key: 'hollywood-camera-dolly-occluder',
      url: '/lot/hollywood/camera-dolly-occluder.png',
    })
    expect(internals.textureSizes.get('hollywood-camera')).toEqual({
      width: 54,
      height: 74,
      generated: true,
    })
  })

  it('measures unsmoothed wall-frame intervals and resets the sustained window', () => {
    const { scene, internals } = harness(snapshot([]))
    internals.performanceWarmupFramesRemaining = 0

    internals.game.loop.rawDelta = 50
    scene.update(0, 8)
    internals.game.loop.rawDelta = 10
    scene.update(0, 8)

    expect(scene.performanceStats()).toMatchObject({
      fps: 33,
      frameMs: 30,
      p99FrameMs: 50,
      onePercentLowFps: 20,
      worstFrameMs: 50,
    })

    scene.resetPerformanceTelemetry()
    expect(scene.performanceStats()).toMatchObject({
      frameMs: 0,
      p99FrameMs: 0,
      worstFrameMs: 0,
    })
  })

  it('paints and reports the authoritative fixed Annex parcel lifecycle', () => {
    const initial = snapshot([], [])
    initial.buildings = [{
      id: 'expansion',
      available: true,
      attention: 'empty',
      constructionStatus: 'vacant',
      constructionProgress01: 0,
      constructionProgressText: 'Vacant expansion parcel',
    }]
    const { scene, internals } = harness(initial)
    internals.manifest.places.push({
      id: 'annex-parcel',
      anchors: { site: [640, 790] },
      selectionPolygon: [[480, 680], [720, 640], [820, 710], [800, 870], [560, 915], [460, 825]],
      buildingId: 'expansion',
    } as never)
    internals.expansionGraphics = new fakePhaser.Graphics()
    internals.expansionLabel = new fakePhaser.DisplayObject()
    scene.applySnapshot(initial)
    expect(scene.debugState().expansionStatus).toBe('vacant')
    expect(internals.expansionLabel.text).toBe('EXPANSION PARCEL · VACANT')

    const building: StudioLotSnapshot = {
      ...initial,
      week: 6,
      buildings: [{
        id: 'expansion',
        available: true,
        attention: 'active',
        constructionStatus: 'building',
        constructionProgress01: 6 / 13,
        constructionProgressText: '6 of 13 weekly advances complete',
      }],
    }
    scene.applySnapshot(building)
    expect(scene.debugState().expansionStatus).toBe('building')
    expect(internals.expansionLabel.text).toContain('6 of 13 weekly advances complete')

    scene.applySnapshot({
      ...building,
      week: 13,
      buildings: [{
        id: 'expansion',
        available: true,
        attention: 'positive',
        constructionStatus: 'operational',
        constructionProgress01: 1,
        constructionProgressText: 'Operational since Week 13',
      }],
    })
    expect(scene.debugState().expansionStatus).toBe('operational')
    expect(internals.expansionLabel.text).toContain('OPERATIONAL')
  })

  it('gives concurrent same-role people stable, non-overlapping authoritative homes', () => {
    const people = [
      director(),
      director({ id: 'director-2', name: 'Robin March', productionId: 'production-2' }),
      talent(),
      talent({ id: 'talent-2', name: 'Lee North', productionId: 'production-2' }),
    ]
    const { scene, internals } = harness(snapshot(people))
    const position = (id: string) => {
      const sprite = internals.runtimePeople.get(id)!.sprite
      return { x: sprite.x, y: sprite.y }
    }
    const initial = new Map(people.map((person) => [person.id, position(person.id)]))

    const key = (point: { x: number; y: number }) => JSON.stringify(point)
    expect(new Set([position('director-1'), position('director-2')].map(key))).toHaveLength(2)
    expect(new Set([position('talent-1'), position('talent-2')].map(key))).toHaveLength(2)

    // Snapshot ordering is not presentation authority and cannot reshuffle the people.
    scene.applySnapshot(snapshot([...people].reverse()))
    for (const person of people) expect(position(person.id)).toEqual(initial.get(person.id))

    // A loaded Stage 7 task moves only its real director; returning to unassigned restores
    // that director's own stable slot rather than the other director's home.
    scene.applySnapshot(snapshot(people, [operation({ taskStatus: 'blocked' })]))
    expect(position('director-1')).toEqual({ x: 70, y: 80 })
    expect(position('director-2')).toEqual(initial.get('director-2'))
    scene.applySnapshot(snapshot(people, [operation({ taskStatus: 'unassigned' })]))
    expect(position('director-1')).toEqual(initial.get('director-1'))
    expect(position('director-2')).toEqual(initial.get('director-2'))
  })

  it('reconciles people and clears selection when snapshot authority disappears', () => {
    const first = snapshot([director()])
    const { scene, internals, events } = harness(first)

    scene.selectPerson('director-1')
    const originalSprite = internals.sprites[0]!

    scene.applySnapshot(snapshot([director({ name: 'June de Hart', productionTitle: 'Night Crossing II' })]))
    expect(internals.sprites).toHaveLength(1)
    expect(internals.texts[0]!.text).toBe('June de Hart')
    expect(events.filter((event) => event.type === 'person').at(-1)).toEqual({
      type: 'person',
      person: director({ name: 'June de Hart', productionTitle: 'Night Crossing II' }),
    })

    scene.applySnapshot(snapshot([]))
    expect(originalSprite.destroyed).toBe(true)
    expect(scene.debugState().selectedPersonId).toBeNull()
    expect(events).toContainEqual({ type: 'person', person: null })
  })

  it('routes only a real unassigned-to-blocked Soundstage 7 transition and never changes task status', () => {
    const before = snapshot([director()], [operation()])
    const { scene, internals } = harness(before)
    const blocked = operation({
      taskStatus: 'blocked',
      statusLabel: 'Production hold',
      blocker: {
        kind: 'scenery-load-in',
        headline: 'Scenery load-in blocking camera',
        detail: 'The camera mark is blocked.',
      },
      currentCommand: {
        kind: 'clearSceneryLoadIn',
        productionId: 'production-1',
        label: 'Clear scenery load-in',
      },
    })

    scene.applySnapshot(snapshot([director()], [blocked]))
    expect(scene.debugState().routeProductionId).toBe('production-1')
    expect(scene.debugState().stage7Operation?.taskStatus).toBe('blocked')

    scene.update(0, 10_000)
    expect(scene.debugState().routeProductionId).toBeNull()
    expect(scene.debugState().stage7Operation?.taskStatus).toBe('blocked')
    expect(internals.stageStateText?.text).toContain('PRODUCTION HOLD')
    expect(internals.sprites[0]).toMatchObject({ x: 70, y: 80 })
  })

  it('keeps the exact successor command legal while the cosmetic director route is still moving', () => {
    const unassignedState = advanceEngineState(
      greenlightEngineFilm(foundManagedEngineState('hollywood-route-command-independence')),
      4,
    )
    const unassignedSnapshot = studioLotSnapshot(unassignedState)
    const unassignedOperation = unassignedSnapshot.productionOperations!.find(
      (candidate) => candidate.locationBuildingId === 'stage-a',
    )!
    expect(unassignedOperation.currentCommand?.kind).toBe('assignShootingDirector')
    const assigned = runProductionCommand(unassignedState, unassignedOperation.currentCommand!)
    if (!assigned.ok) throw new Error(assigned.error)

    const { scene } = harness(unassignedSnapshot)
    const blockedSnapshot = studioLotSnapshot(assigned.next)
    scene.applySnapshot(blockedSnapshot)
    expect(scene.debugState().routeProductionId).toBe(unassignedOperation.productionId)
    const blockedOperation = blockedSnapshot.productionOperations!.find(
      (candidate) => candidate.productionId === unassignedOperation.productionId,
    )!
    expect(blockedOperation.taskStatus).toBe('blocked')
    expect(blockedOperation.currentCommand?.kind).toBe('clearSceneryLoadIn')

    const inputBefore = JSON.stringify(assigned.next)
    const whileRoute = runProductionCommand(assigned.next, blockedOperation.currentCommand!)
    const withoutRoute = runProductionCommand(assigned.next, blockedOperation.currentCommand!)
    expect(JSON.stringify(whileRoute)).toBe(JSON.stringify(withoutRoute))
    expect(JSON.stringify(assigned.next)).toBe(inputBefore)
    if (!whileRoute.ok) throw new Error(whileRoute.error)

    scene.applySnapshot(studioLotSnapshot(whileRoute.next))
    expect(scene.debugState().routeProductionId).toBeNull()
    expect(scene.debugState().stage7Operation?.taskStatus).toBe('ready')
  })

  it('does not route or paint Stage 7 from an authoritative Soundstage 12 operation', () => {
    const stage12 = operation({
      locationBuildingId: 'stage-b',
      facilityLabel: 'Soundstage 12 + Scenery Shop',
    })
    const { scene, internals } = harness(snapshot([director()], [stage12]))

    scene.applySnapshot(snapshot([director()], [{ ...stage12, taskStatus: 'blocked' }]))
    expect(scene.debugState().routeProductionId).toBeNull()
    expect(scene.debugState().stage7Operation).toBeNull()
    expect(internals.stageStateText?.text).toBe('STAGE 7 · AVAILABLE')
  })

  it('loads blocked/ready/scheduled/completed snapshots directly and cannot auto-complete them', () => {
    for (const taskStatus of ['blocked', 'ready', 'scheduled', 'completed'] as const) {
      const exact = operation({ taskStatus, statusLabel: `Exact ${taskStatus}` })
      const { scene, internals } = harness(snapshot([director()], [exact]))
      scene.update(0, 60_000)
      expect(scene.debugState().stage7Operation?.taskStatus).toBe(taskStatus)
      expect(scene.debugState().routeProductionId).toBeNull()
      expect(internals.stageStateText?.text).toBe(`STAGE 7 · EXACT ${taskStatus.toUpperCase()}`)
    }
  })

  it('reduces ambient, camera, route, vehicle, and publicity motion without changing authority', () => {
    const before = snapshot([director()], [operation()])
    const { scene, internals } = harness(before, true)
    const vehicleTween = new fakePhaser.Tween()
    const ambientSprite = new fakePhaser.DisplayObject(0, 0)
    internals.vehicleTween = vehicleTween
    internals.ambientActors = [{
      sprite: ambientSprite,
      a: { x: 0, y: 0 },
      b: { x: 100, y: 100 },
      phase: 0.25,
      speed: 0.001,
    }]
    internals.fitZoom = 1
    internals.flash = new fakePhaser.DisplayObject()

    scene.setReducedMotion(true)
    scene.update(0, 100)
    expect(vehicleTween.paused).toBe(1)
    expect(internals.ambientActors[0]!.phase).toBe(0.25)

    scene.applySnapshot(snapshot([director()], [operation({ taskStatus: 'blocked' })]))
    expect(scene.debugState().routeProductionId).toBeNull()
    expect(scene.debugState().stage7Operation?.taskStatus).toBe('blocked')
    expect(internals.sprites[0]).toMatchObject({ x: 70, y: 80 })

    scene.focus('stage-7')
    expect(internals.cameras.main.centerOn).toHaveBeenCalledWith(50, 50)
    expect(internals.cameras.main.pan).not.toHaveBeenCalled()

    const tweenCount = internals.tweenAdds.length
    scene.playPublicity(true, 'Publicity call complete')
    expect(internals.tweenAdds).toHaveLength(tweenCount)

    scene.setReducedMotion(false)
    scene.update(0, 100)
    expect(vehicleTween.resumed).toBe(1)
    expect(internals.ambientActors[0]!.phase).not.toBe(0.25)
  })
})
