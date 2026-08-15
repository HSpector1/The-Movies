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
    tint = 0xffffff
    alpha = 1
    originX = 0
    originY = 0
    interactive = false
    handlers = new Map<string, Array<(...args: unknown[]) => void>>()

    constructor(x = 0, y = 0, texture = '') {
      this.x = x
      this.y = y
      this.texture = texture
    }

    setOrigin(x = 0.5, y = x) { this.originX = x; this.originY = y; return this }
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
    setTint(tint = 0xffffff) { this.tint = tint; return this }
    setTexture(texture: string, frame?: string | number) {
      this.texture = texture
      if (frame !== undefined) this.frame = frame
      return this
    }
    setFrame(frame: string | number) { this.frame = frame; return this }
    setPosition(x: number, y: number) { this.x = x; this.y = y; return this }
    setFlipX(flip = true) { this.flipX = flip; return this }
    setScale(scale: number) { this.scale = scale; return this }
    setAlpha(alpha: number) { this.alpha = alpha; return this }
    setText(text: string) { this.text = text; return this }
    setFillStyle(color: number) { this.fillColor = color; return this }
    setStrokeStyle() { return this }
    setName() { return this }
    destroy() { this.destroyed = true }
  }

  class Graphics extends DisplayObject {
    calls: Array<{ name: string; args: unknown[] }> = []
    constructor(private readonly onGenerate?: (key: string, width: number, height: number) => void) {
      super()
    }
    private record(name: string, args: unknown[]) { this.calls.push({ name, args }); return this }
    clear(...args: unknown[]) { return this.record('clear', args) }
    fillStyle(...args: unknown[]) { return this.record('fillStyle', args) }
    fillEllipse(...args: unknown[]) { return this.record('fillEllipse', args) }
    fillRoundedRect(...args: unknown[]) { return this.record('fillRoundedRect', args) }
    fillTriangle(...args: unknown[]) { return this.record('fillTriangle', args) }
    lineStyle(...args: unknown[]) { return this.record('lineStyle', args) }
    lineBetween(...args: unknown[]) { return this.record('lineBetween', args) }
    fillCircle(...args: unknown[]) { return this.record('fillCircle', args) }
    fillRect(...args: unknown[]) { return this.record('fillRect', args) }
    strokeRect(...args: unknown[]) { return this.record('strokeRect', args) }
    strokeCircle(...args: unknown[]) { return this.record('strokeCircle', args) }
    strokeRoundedRect(...args: unknown[]) { return this.record('strokeRoundedRect', args) }
    fillPoints(...args: unknown[]) { return this.record('fillPoints', args) }
    strokePoints(...args: unknown[]) { return this.record('strokePoints', args) }
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
    killedTweenTargets: unknown[] = []
    loaderHandlers = new Map<string, Array<(file: { key?: unknown }) => void>>()
    cacheJson = new Map<string, unknown>()
    children = { length: 0 }
    game = { canvas, loop: { rawDelta: 0, actualFps: 60 } }
    sceneVisible = true
    sceneActive = true
    scenePauses = 0
    scene = {
      isActive: () => this.sceneActive,
      setVisible: (visible: boolean) => { this.sceneVisible = visible },
      pause: () => { this.scenePauses++ },
    }
    input = {
      enabled: true,
      resetPointers: vi.fn(),
      keyboard: {
        enabled: true,
        resetKeys: vi.fn(),
      },
    }
    load = {
      on: (name: string, handler: (file: { key?: unknown }) => void) => {
        const handlers = this.loaderHandlers.get(name) ?? []
        handlers.push(handler)
        this.loaderHandlers.set(name, handlers)
      },
      emit: (name: string, file: { key?: unknown }) => {
        for (const handler of this.loaderHandlers.get(name) ?? []) handler(file)
      },
      json: () => {},
      spritesheet: () => {},
      image: (key: string, url: string) => {
        this.imageLoads.push({ key, url })
        this.textureSizes.set(key, { width: 0, height: 0, generated: false })
      },
    }
    cache = {
      json: {
        get: (key: string) => this.cacheJson.get(key),
      },
    }
    textures = {
      exists: (key: string) => this.textureSizes.has(key),
      get: (key: string) => {
        const size = this.textureSizes.get(key) ?? { width: 0, height: 0 }
        return {
          getSourceImage: () => ({ width: size.width, height: size.height }),
          has: () => false,
        }
      },
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
      killTweensOf: (target: unknown) => {
        this.killedTweenTargets.push(target)
      },
    }
    cameras = {
      main: {
        width: 1586,
        height: 992,
        scrollX: 0,
        scrollY: 0,
        zoom: 1,
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
    Loader: { Events: { FILE_LOAD_ERROR: 'loaderror' } },
    Math: {
      Linear: (a: number, b: number, t: number) => a + (b - a) * t,
      Clamp: (value: number, min: number, max: number) => globalThis.Math.max(min, globalThis.Math.min(max, value)),
      Easing: { Sine: { InOut: (value: number) => value } },
      Vector2: class Vector2 { constructor(public x: number, public y: number) {} },
    },
    Geom: {
      Polygon: class Polygon {},
      Circle: class Circle {
        static Contains() { return true }
        constructor(public x: number, public y: number, public radius: number) {}
      },
    },
  },
}))

import {
  HollywoodScene,
  type HollywoodEvent,
  type HollywoodGateVisitorPresentation,
} from './HollywoodScene.ts'
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
  LotAnnexWork,
  LotAnnexWorkOccupant,
  LotPersonState,
  LotProductionCompanyRole,
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
): ProductionOperationsState => {
  const productionId = overrides.productionId ?? 'production-1'
  return {
    productionId,
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
      productionId,
      directorId: 'director-1',
      label: 'Call June Hart to Soundstage 7',
    },
    ...overrides,
  }
}

const COMPANY_ROLE_ORDER = [
  'writer',
  'director',
  'lead',
  'antagonist',
  'support',
  'craft',
] as const satisfies readonly LotProductionCompanyRole[]

function companyFixture(
  productionId: string,
  title: string,
  locationBuildingId: 'stage-a' | 'stage-b',
) {
  const people = COMPANY_ROLE_ORDER.map((productionRole) => {
    const presentationRole = productionRole === 'director' ? 'director' : 'talent'
    return {
      id: `${productionId}-${productionRole}`,
      name: `${title} ${productionRole}`,
      role: presentationRole,
      authority: 'active-production',
      productionId,
      productionTitle: title,
    } satisfies LotPersonState
  })
  const byRole = (role: LotProductionCompanyRole) =>
    people[COMPANY_ROLE_ORDER.indexOf(role)]!
  const companyMembers = COMPANY_ROLE_ORDER.map((productionRole) => {
    const person = byRole(productionRole)
    return {
      productionRole,
      slotIndex: 0,
      talentId: person.id,
      name: person.name,
      presentationRole: person.role,
    }
  })
  return {
    people,
    operation: operation({
      productionId,
      title,
      locationBuildingId,
      facilityLabel: locationBuildingId === 'stage-a'
        ? 'Soundstage 7 + Scenery Shop'
        : 'Soundstage 12 + Scenery Shop',
      directorId: byRole('director').id,
      directorName: byRole('director').name,
      leadId: byRole('lead').id,
      leadName: byRole('lead').name,
      companyMembers,
      taskStatus: null,
      statusLabel: 'In production',
      blocker: null,
      currentCommand: null,
      attention: 'active',
    }),
  }
}

function companySnapshot(
  companies: ReturnType<typeof companyFixture>[],
): StudioLotSnapshot {
  return snapshot(
    companies.flatMap((company) => company.people),
    companies.map((company) => company.operation),
  )
}

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
    publicityOffers: [],
    annexWork: null,
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
  } as StudioLotSnapshot
}

function annexWork(occupant: LotAnnexWorkOccupant | null = null): LotAnnexWork {
  return {
    facilityId: 'facility-development-casting-annex',
    facilityName: 'Development & Casting Annex',
    capability: 'development-casting',
    capacity: 1,
    occupied: occupant === null ? 0 : 1,
    available: occupant === null ? 1 : 0,
    slot: 0,
    occupant,
  }
}

function operationalAnnexSnapshot(
  occupant: LotAnnexWorkOccupant | null,
): StudioLotSnapshot {
  const current = snapshot([], [])
  current.week = 13
  current.buildings = [{
    id: 'expansion',
    available: true,
    attention: 'positive',
    constructionStatus: 'operational',
    constructionProgress01: 1,
    constructionProgressText: 'Operational since Week 13',
  }]
  current.annexWork = annexWork(occupant)
  return current
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
    schemaVersion: number
    districtId: string
    canvas: { width: number; height: number }
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
    routes: Record<string, Array<{ x: number; y: number; actorDepth: number; cue: string }>>
    activities: Array<{
      id: string
      label: string
      place: string
      requiredAffordances: string[]
      requiredRoles: string[]
      visualStates: string[]
    }>
    places: Array<{
      id: string
      buildingId: 'admin' | 'stage-a' | 'stage-b' | 'post' | 'expansion' | 'gate'
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
  vehicle: InstanceType<typeof fakePhaser.DisplayObject> | null
  flash: InstanceType<typeof fakePhaser.DisplayObject> | null
  stageStateText: InstanceType<typeof fakePhaser.DisplayObject> | null
  stageLamp: InstanceType<typeof fakePhaser.DisplayObject> | null
  activityGraphics: InstanceType<typeof fakePhaser.Graphics> | null
  sceneryGraphics: InstanceType<typeof fakePhaser.Graphics> | null
  selectionGraphics: InstanceType<typeof fakePhaser.Graphics> | null
  sceneActive: boolean
  scenePauses: number
  fitZoom: number
  expansionGraphics: InstanceType<typeof fakePhaser.Graphics> | null
  expansionLabel: InstanceType<typeof fakePhaser.DisplayObject> | null
  roleAtlasActive: boolean
  gateVisitor: {
    presentation: HollywoodGateVisitorPresentation
    sprite: InstanceType<typeof fakePhaser.DisplayObject>
  } | null
  requestedGateVisitor: HollywoodGateVisitorPresentation | null
  inputSuspended: boolean
  dragOrigin: { x: number; y: number; scrollX: number; scrollY: number } | null
  performanceWarmupFramesRemaining: number
  drawCallSamples: number[]
  preserveCameraOnResize: () => void
  buildWorld: () => void
  buildAmbientLife: () => void
  buildSemanticHotspots: () => void
  buildActorTextures: () => void
  drawPlaceOutline: (
    place: SceneHarness['manifest']['places'][number],
    selected: boolean,
  ) => void
  selectStage7Surface: (place: SceneHarness['manifest']['places'][number]) => void
  selectAnnexSurface: (place: {
    id: string
    buildingId: 'expansion'
    label: string
    affordances: string[]
  }, emitSelection?: boolean) => boolean
  selectSceneryLoadInSurface: (place: SceneHarness['manifest']['places'][number], emitSelection?: boolean) => boolean
  selectServiceYardSurface: (place: SceneHarness['manifest']['places'][number]) => void
  selectGenericPlaceSurface: (place: SceneHarness['manifest']['places'][number]) => void
  selectPublicitySurface: (
    place: SceneHarness['manifest']['places'][number],
    emitSelection?: boolean,
  ) => boolean
}

function harness(initial: StudioLotSnapshot, reducedMotion = false) {
  const events: HollywoodEvent[] = []
  const scene = new HollywoodScene()
  scene.init({ snapshot: initial, reducedMotion, onEvent: (event) => events.push(event) })
  const internals = scene as unknown as SceneHarness
  internals.manifest = {
    schemaVersion: 1,
    districtId: 'district',
    canvas: { width: 1586, height: 992 },
    textureMemoryBytes: 0,
    layers: [],
    routes: {
      'street-to-stage-7': [
        { x: 10, y: 20, actorDepth: 30, cue: 'street' },
        { x: 70, y: 80, actorDepth: 82, cue: 'enter-stage' },
      ],
    },
    activities: [{
      id: 'shooting',
      label: 'Stage 7 shooting',
      place: 'stage-7',
      requiredAffordances: ['enter-stage', 'shoot'],
      requiredRoles: ['director', 'talent', 'grip', 'camera-operator'],
      visualStates: ['crew-call', 'equipment-staged', 'take-in-progress'],
    }],
    places: [{
      id: 'stage-7',
      buildingId: 'stage-a',
      label: 'Stage 7',
      affordances: ['enter-stage', 'shoot', 'load-in'],
      anchors: {
        entry: [586, 383],
        crewCall: [662, 472],
        camera: [558, 527],
        service: [500, 500],
      },
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
  internals.sceneryGraphics = new fakePhaser.Graphics()
  scene.applySnapshot(initial)
  return { scene, internals, events }
}

function annexPlace(): SceneHarness['manifest']['places'][number] {
  return {
    id: 'annex-parcel',
    buildingId: 'expansion',
    label: 'Development & Casting Annex',
    affordances: ['develop-studio', 'construct-annex'],
    anchors: { site: [640, 790] },
    selectionPolygon: [[480, 680], [720, 640], [820, 710], [800, 870], [560, 915], [460, 825]],
  }
}

function serviceYardPlace(): SceneHarness['manifest']['places'][number] {
  return {
    id: 'service-yard',
    buildingId: 'post',
    label: 'Scenery & Service',
    affordances: ['delivery', 'supply-scenery', 'load-in'],
    anchors: {
      truck: [271, 626],
      sceneryRack: [112, 404],
      loadIn: [390, 584],
    },
    selectionPolygon: [[12, 350], [300, 350], [430, 520], [400, 700], [40, 720]],
  }
}

function publicityPlace(): SceneHarness['manifest']['places'][number] {
  return {
    id: 'publicity',
    buildingId: 'admin',
    label: 'Administration & Publicity',
    affordances: ['work', 'meeting', 'publicity'],
    anchors: {
      entry: [1338, 421],
      photocall: [1120, 481],
      queue: [930, 338],
    },
    selectionPolygon: [
      [946, 174],
      [1586, 122],
      [1586, 510],
      [1050, 500],
      [920, 360],
    ],
  }
}

function publicityActivity(): SceneHarness['manifest']['activities'][number] {
  return {
    id: 'publicity',
    label: 'Publicity call',
    place: 'publicity',
    requiredAffordances: ['publicity'],
    requiredRoles: ['talent', 'publicist', 'photographer'],
    visualStates: ['queue-forming', 'flash', 'press-moving'],
  }
}

function gatePlace(): SceneHarness['manifest']['places'][number] {
  return {
    id: 'studio-gate',
    buildingId: 'gate',
    label: 'Studio Gate',
    affordances: ['gate-security', 'arrival'],
    anchors: {
      guard: [853, 720],
      arrival: [1227, 844],
    },
    selectionPolygon: [
      [930, 570],
      [1586, 529],
      [1586, 992],
      [900, 992],
      [820, 900],
      [835, 720],
    ],
  }
}

function gateForegroundLayer(): SceneHarness['manifest']['layers'][number] {
  return {
    id: 'gate-foreground-occluder',
    kind: 'occluder',
    depth: 90,
    output: 'gate-foreground-occluder.png',
    x: 568,
    y: 504,
    width: 1019,
    height: 489,
  }
}

function installCanonicalGate(internals: SceneHarness): void {
  internals.manifest.places.push(gatePlace())
  internals.manifest.layers.push(gateForegroundLayer())
}

type GateCandidateFixture = {
  talentId: string
  name: string
  creativeRole: 'actor' | 'director' | 'writer' | 'craft'
  employmentStatus: 'freeAgent'
  offerTermWeeks: number[]
}

function gateCandidate(
  overrides: Partial<GateCandidateFixture> = {},
): GateCandidateFixture {
  return {
    talentId: 'visitor-1',
    name: 'Mara Voss',
    creativeRole: 'director',
    employmentStatus: 'freeAgent',
    offerTermWeeks: [26, 52, 104],
    ...overrides,
  }
}

function gateSnapshot(
  candidates: GateCandidateFixture[] = [gateCandidate()],
  overrides: Partial<StudioLotSnapshot> = {},
): StudioLotSnapshot {
  const current = snapshot([])
  const count = candidates.length
  return {
    ...current,
    buildings: [{
      id: 'gate',
      available: true,
      attention: count === 0 ? 'empty' : 'active',
      attentionReason: count === 0
        ? 'No candidates with current contract terms'
        : `${String(count)} candidate${count === 1 ? '' : 's'} with current contract terms`,
    }],
    gateHiringMarket: { candidates },
    ...overrides,
  } as StudioLotSnapshot
}

function gateVisitor(
  candidate: GateCandidateFixture = gateCandidate(),
  overrides: Partial<HollywoodGateVisitorPresentation> = {},
): HollywoodGateVisitorPresentation {
  return {
    talentId: candidate.talentId,
    name: candidate.name,
    marketRole: candidate.creativeRole,
    presentationRole: candidate.creativeRole === 'director' ? 'director' : 'talent',
    employmentStatus: 'freeAgent',
    studioSeed: 'hollywood-scene-test',
    marketWeek: 1,
    offerTermWeeks: [...candidate.offerTermWeeks],
    placeId: 'studio-gate',
    ...overrides,
  }
}

function blockedSceneryOperation(
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  return operation({
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
    ...overrides,
  })
}

function readySceneryOperation(
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  return operation({
    taskStatus: 'ready',
    statusLabel: 'Decision required',
    blocker: {
      kind: 'take-scheduling',
      headline: 'Schedule the shooting take',
      detail: 'Soundstage 7 is ready for the take.',
    },
    currentCommand: {
      kind: 'scheduleShootingTake',
      productionId: 'production-1',
      label: 'Schedule the shooting take',
    },
    ...overrides,
  })
}

describe('HollywoodScene snapshot authority', () => {
  function pointer(target: unknown = fakePhaser.canvas) {
    return { event: { stopPropagation: vi.fn(), target } }
  }

  function productionEvents(events: HollywoodEvent[]) {
    return events.filter((event) => event.type === 'production')
  }

  function sceneryEvents(events: HollywoodEvent[]) {
    return events.filter((event) => event.type === 'scenery-load-in')
  }

  it('reports an exact manifest load failure once and ignores optional asset failures', () => {
    const { scene, internals, events } = harness(snapshot([]))
    // Real Phaser is LOADING here, not active. The queued pause must still be issued.
    internals.sceneActive = false
    scene.preload()

    internals.load.emit('loaderror', { key: 'hollywood-role-atlas-manifest-v1' })
    expect(events).toEqual([])

    internals.load.emit('loaderror', { key: 'hollywood-manifest' })
    internals.load.emit('loaderror', { key: 'hollywood-manifest' })
    scene.create()

    expect(events).toEqual([{
      type: 'failure',
      reason: 'manifest-load-failed',
    }])
    expect(internals.graphicsObjects).toHaveLength(0)
    expect(internals.input.enabled).toBe(false)
    expect(internals.sceneVisible).toBe(false)
    expect(internals.scenePauses).toBe(2)
  })

  it('reports a loaded but structurally invalid manifest without entering scene setup', () => {
    const { scene, internals, events } = harness(snapshot([]))
    internals.cacheJson.set('hollywood-manifest', {
      schemaVersion: 1,
      districtId: 'broken-district',
      places: [],
    })

    scene.create()

    expect(events).toEqual([{
      type: 'failure',
      reason: 'manifest-invalid',
    }])
    expect(internals.graphicsObjects).toHaveLength(0)
    expect(internals.sceneVisible).toBe(false)
    expect(internals.scenePauses).toBe(1)
  })

  it('converts an exception during post-load scene creation into one bounded failure', () => {
    const { scene, internals, events } = harness(snapshot([]))
    internals.cacheJson.set('hollywood-manifest', internals.manifest)
    vi.spyOn(internals, 'buildActorTextures').mockImplementation(() => {
      throw new Error('forced post-load scene creation failure')
    })

    scene.create()
    scene.create()

    expect(events).toEqual([{
      type: 'failure',
      reason: 'scene-create-failed',
    }])
    expect(internals.graphicsObjects).toHaveLength(0)
    expect(internals.sceneVisible).toBe(false)
    expect(internals.scenePauses).toBe(1)
  })

  it('fails a live context-lost generation closed before it can repaint stale publicity', () => {
    const { scene, internals, events } = harness(snapshot([]))
    internals.manifest.places.push(publicityPlace())
    internals.manifest.activities.push(publicityActivity())
    internals.selectionGraphics = new fakePhaser.Graphics()
    internals.flash = new fakePhaser.DisplayObject()
    internals.flash.setAlpha(0.72)
    expect(scene.selectPublicityFromHost()).toBe(true)

    scene.failClosedFromHost()
    scene.failClosedFromHost()

    expect(events).toEqual([])
    expect(internals.input.enabled).toBe(false)
    expect(internals.input.keyboard.enabled).toBe(false)
    expect(internals.flash.alpha).toBe(0)
    expect(internals.selectionGraphics.calls.at(-1)).toEqual({ name: 'clear', args: [] })
    expect(scene.debugState().selectedPlaceId).toBeNull()
    expect(internals.sceneVisible).toBe(false)
    expect(internals.scenePauses).toBe(1)
  })

  it('retries the pause when a host failure lands after registration but before create', () => {
    const { scene, internals, events } = harness(snapshot([]))
    // Context loss may arrive from the View while Phaser still considers this
    // registered generation LOADING, where its first queued pause is rejected.
    internals.sceneActive = false

    scene.failClosedFromHost()
    scene.create()

    expect(events).toEqual([])
    expect(internals.graphicsObjects).toHaveLength(0)
    expect(internals.input.enabled).toBe(false)
    expect(internals.sceneVisible).toBe(false)
    expect(internals.scenePauses).toBe(2)
  })

  it('suspends world controls without stopping ambience and clears pointer/key/drag state on both edges', () => {
    const { scene, internals, events } = harness(snapshot([director()], [operation()]))
    internals.buildSemanticHotspots()
    internals.buildAmbientLife()
    const actor = internals.ambientActors[0]!
    const phaseBefore = actor.phase
    internals.dragOrigin = { x: 1, y: 2, scrollX: 3, scrollY: 4 }

    scene.setInputSuspended(true)

    expect(internals.inputSuspended).toBe(true)
    expect(internals.dragOrigin).toBeNull()
    expect(internals.input.enabled).toBe(false)
    expect(internals.input.keyboard.enabled).toBe(false)
    expect(internals.input.resetPointers).toHaveBeenCalledTimes(1)
    expect(internals.input.keyboard.resetKeys).toHaveBeenCalledTimes(1)

    // Direct emitter invocation bypasses Phaser's disabled plugin in this harness;
    // the scene guard still refuses the hit, while its ambient update remains live.
    internals.zones[0]!.emit('pointerdown', pointer())
    scene.update(0, 16)
    expect(events).toEqual([])
    expect(actor.phase).toBeGreaterThan(phaseBefore)

    internals.dragOrigin = { x: 5, y: 6, scrollX: 7, scrollY: 8 }
    scene.setInputSuspended(false)
    expect(internals.inputSuspended).toBe(false)
    expect(internals.dragOrigin).toBeNull()
    expect(internals.input.enabled).toBe(true)
    expect(internals.input.keyboard.enabled).toBe(true)
    expect(internals.input.resetPointers).toHaveBeenCalledTimes(2)
    expect(internals.input.keyboard.resetKeys).toHaveBeenCalledTimes(2)

    internals.zones[0]!.emit('pointerdown', pointer())
    expect(productionEvents(events)).toHaveLength(1)
  })

  it('preserves the exact live camera transform when surrounding React chrome resizes the canvas', () => {
    const { internals } = harness(snapshot([director()], [operation()]))
    const camera = internals.cameras.main
    camera.width = 960
    camera.height = 540
    camera.scrollX = 146.7946
    camera.scrollY = -22.375
    camera.zoom = 1.1875

    internals.preserveCameraOnResize()

    expect(camera.scrollX).toBe(146.7946)
    expect(camera.scrollY).toBe(-22.375)
    expect(camera.setZoom).toHaveBeenLastCalledWith(1.1875)
    expect(internals.fitZoom).toBeCloseTo(Math.min(960 / 1586, 540 / 992), 12)
  })

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

  it('routes the exact publicity polygon and host companion through one identity-only seam', () => {
    const { scene, internals, events } = harness(snapshot([]))
    const publicity = publicityPlace()
    internals.manifest.places.push(publicity)
    internals.manifest.activities.push(publicityActivity())
    const shared = vi.spyOn(internals, 'selectPublicitySurface')
    internals.buildWorld()
    internals.buildSemanticHotspots()

    expect(internals.flash).toMatchObject({ x: 1120, y: 481 })
    expect(internals.zones).toHaveLength(2)
    internals.zones[1]!.emit('pointerdown', pointer())

    expect(shared).toHaveBeenNthCalledWith(1, publicity)
    expect(events).toEqual([{
      type: 'place',
      place: {
        id: 'publicity',
        buildingId: 'admin',
        label: 'Administration & Publicity',
        affordances: ['work', 'meeting', 'publicity'],
      },
    }])
    expect(scene.debugState()).toMatchObject({
      selectedPlaceId: 'publicity',
      selectedProductionId: null,
    })

    const eventCount = events.length
    expect(scene.selectPublicityFromHost()).toBe(true)
    expect(shared).toHaveBeenNthCalledWith(2, publicity, false)
    expect(events).toHaveLength(eventCount)
    expect(internals.cameras.main.pan).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['missing activity', (_place: ReturnType<typeof publicityPlace>, activity: ReturnType<typeof publicityActivity>) => {
      activity.id = 'missing'
      activity.label = 'Missing'
      activity.place = 'missing'
      activity.requiredAffordances = []
      activity.requiredRoles = []
    }],
    ['wrong place id', (place: ReturnType<typeof publicityPlace>) => { place.id = 'publicity-drift' }],
    ['wrong building', (place: ReturnType<typeof publicityPlace>) => { place.buildingId = 'post' }],
    ['wrong label', (place: ReturnType<typeof publicityPlace>) => { place.label = 'Publicity Office' }],
    ['reordered affordances', (place: ReturnType<typeof publicityPlace>) => {
      place.affordances = ['publicity', 'meeting', 'work']
    }],
    ['wrong polygon point', (place: ReturnType<typeof publicityPlace>) => {
      place.selectionPolygon[4] = [921, 360]
    }],
    ['self-intersecting polygon', (place: ReturnType<typeof publicityPlace>) => {
      place.selectionPolygon = [
        [946, 174], [1586, 510], [1586, 122], [1050, 500], [920, 360],
      ]
    }],
    ['wrong entry anchor', (place: ReturnType<typeof publicityPlace>) => { place.anchors.entry = [1339, 421] }],
    ['wrong photocall anchor', (place: ReturnType<typeof publicityPlace>) => { place.anchors.photocall = [1120, 480] }],
    ['wrong queue anchor', (place: ReturnType<typeof publicityPlace>) => { place.anchors.queue = [931, 338] }],
    ['extra anchor', (place: ReturnType<typeof publicityPlace>) => { place.anchors.extra = [1120, 481] }],
    ['wrong activity label', (_place: ReturnType<typeof publicityPlace>, activity: ReturnType<typeof publicityActivity>) => {
      activity.label = 'Publicity calls'
    }],
    ['wrong activity place', (_place: ReturnType<typeof publicityPlace>, activity: ReturnType<typeof publicityActivity>) => {
      activity.place = 'stage-7'
    }],
    ['wrong activity affordances', (_place: ReturnType<typeof publicityPlace>, activity: ReturnType<typeof publicityActivity>) => {
      activity.requiredAffordances = ['meeting']
    }],
    ['wrong activity roles', (_place: ReturnType<typeof publicityPlace>, activity: ReturnType<typeof publicityActivity>) => {
      activity.requiredRoles = ['talent', 'photographer', 'publicist']
    }],
    ['wrong activity states', (_place: ReturnType<typeof publicityPlace>, activity: ReturnType<typeof publicityActivity>) => {
      activity.visualStates = ['flash', 'queue-forming', 'press-moving']
    }],
  ])('fails %s publicity identity closed with no hotspot, focus, outline, or flash', (_name, mutate) => {
    const { scene, internals, events } = harness(snapshot([]))
    const place = publicityPlace()
    const activity = publicityActivity()
    mutate(place, activity)
    internals.manifest.places.push(place)
    internals.manifest.activities.push(activity)
    internals.buildWorld()
    const stageGraphicsBefore = [...internals.activityGraphics!.calls]
    internals.buildSemanticHotspots()

    expect(internals.zones).toHaveLength(1)
    expect(scene.selectPublicityFromHost()).toBe(false)
    scene.focus('publicity')
    expect(internals.cameras.main.pan).not.toHaveBeenCalled()
    expect(scene.playPublicity(true, 'must not announce')).toBe(false)
    expect(internals.flash?.alpha).toBe(0)
    expect(internals.tweenAdds).toEqual([])
    expect(internals.activityGraphics!.calls).toEqual(stageGraphicsBefore)
    expect(events).toEqual([])
  })

  it('fails duplicate publicity-like places and activities closed instead of accepting first match', () => {
    for (const duplicate of ['place', 'activity'] as const) {
      const { scene, internals, events } = harness(snapshot([]))
      const place = publicityPlace()
      const activity = publicityActivity()
      internals.manifest.places.push(place)
      internals.manifest.activities.push(activity)
      if (duplicate === 'place') internals.manifest.places.push(publicityPlace())
      else internals.manifest.activities.push(publicityActivity())
      internals.buildWorld()
      internals.buildSemanticHotspots()

      expect(internals.zones).toHaveLength(1)
      expect(scene.selectPublicityFromHost()).toBe(false)
      expect(scene.playPublicity(true, 'must not announce')).toBe(false)
      expect(events).toEqual([])
    }
  })

  it('uses the retained flash locally without clearing or borrowing Stage 7 shooting graphics', () => {
    const scheduled = operation({ taskStatus: 'scheduled', statusLabel: 'Take scheduled' })
    const current = snapshot([director()], [scheduled])
    const { scene, internals, events } = harness(current)
    internals.manifest.places.push(publicityPlace())
    internals.manifest.activities.push(publicityActivity())
    internals.buildWorld()
    scene.applySnapshot(current)
    const shootingCalls = [...internals.activityGraphics!.calls]
    const objectCounts = {
      graphics: internals.graphicsObjects.length,
      rectangles: internals.rectangles.length,
    }
    const tweenCountBefore = internals.tweenAdds.length

    expect(scene.playPublicity(true, 'React owns this announcement')).toBe(true)

    expect(internals.activityGraphics!.calls).toEqual(shootingCalls)
    expect(internals.stageStateText?.text).toBe('STAGE 7 · TAKE SCHEDULED')
    expect(events).toEqual([])
    expect(internals.flash).toMatchObject({ x: 1120, y: 481, alpha: 0.72 })
    expect(internals.graphicsObjects).toHaveLength(objectCounts.graphics)
    expect(internals.rectangles).toHaveLength(objectCounts.rectangles)
    expect(internals.tweenAdds).toHaveLength(tweenCountBefore + 1)
    const publicityTween = internals.tweenAdds.at(-1) as { onComplete?: () => void }
    publicityTween.onComplete?.()
    expect(internals.flash?.alpha).toBe(0)

    const tweenCount = internals.tweenAdds.length
    expect(scene.playPublicity(false, 'Engine rejection')).toBe(false)
    expect(internals.tweenAdds).toHaveLength(tweenCount)
    expect(events).toEqual([])
  })

  it('suppresses the canonical accepted flash under reduced motion and clears an active cue', () => {
    const { scene, internals, events } = harness(snapshot([]))
    internals.manifest.places.push(publicityPlace())
    internals.manifest.activities.push(publicityActivity())
    internals.buildWorld()
    const vehicleTweenCount = internals.tweenAdds.length

    scene.setReducedMotion(true)
    expect(scene.playPublicity(true, 'React owns this announcement')).toBe(true)
    expect(internals.tweenAdds).toHaveLength(vehicleTweenCount)
    expect(internals.flash?.alpha).toBe(0)
    expect(events).toEqual([])

    scene.setReducedMotion(false)
    expect(scene.playPublicity(true, 'React owns this announcement')).toBe(true)
    expect(internals.flash?.alpha).toBe(0.72)
    scene.setReducedMotion(true)
    expect(internals.killedTweenTargets).toContain(internals.flash)
    expect(internals.flash?.alpha).toBe(0)
  })

  it('does not retain a publicity ceremony while the scene is inactive', () => {
    const { scene, internals, events } = harness(snapshot([]))
    internals.manifest.places.push(publicityPlace())
    internals.manifest.activities.push(publicityActivity())
    internals.buildWorld()
    internals.scene.isActive = () => false

    expect(scene.playPublicity(true, 'accepted while hidden')).toBe(false)
    expect(internals.flash?.alpha).toBe(0)
    expect(internals.tweenAdds).toEqual([])
    expect(events).toEqual([])
  })

  it('routes the physical service yard through one exact scenery identity seam in blocked and ready states', () => {
    const blocked = blockedSceneryOperation()
    const stage12 = blockedSceneryOperation({
      productionId: 'production-stage-12',
      locationBuildingId: 'stage-b',
      currentCommand: {
        kind: 'clearSceneryLoadIn',
        productionId: 'production-stage-12',
        label: 'Clear scenery load-in',
      },
    })
    const initial = snapshot([director()], [stage12, blocked])
    const { scene, internals, events } = harness(initial)
    internals.manifest.places.push(serviceYardPlace())
    internals.buildWorld()
    scene.applySnapshot(initial)
    expect(internals.sceneryGraphics!.calls).toContainEqual({
      name: 'fillRect',
      args: [348, 566, 46, 32],
    })
    expect(internals.sceneryGraphics!.calls).toContainEqual({
      name: 'fillCircle',
      args: [378, 560, 13],
    })
    const shared = vi.spyOn(internals, 'selectServiceYardSurface')
    internals.buildSemanticHotspots()

    const serviceZone = internals.zones[1]!
    serviceZone.emit('pointerdown', pointer())
    expect(internals.sceneryGraphics!.interactive).toBe(false)
    expect(shared).toHaveBeenCalledTimes(1)
    expect(sceneryEvents(events)).toEqual([{
      type: 'scenery-load-in',
      sceneryLoadIn: {
        productionId: blocked.productionId,
        locationBuildingId: 'stage-a',
        placeId: 'service-yard',
      },
    }])
    expect(scene.debugState()).toMatchObject({
      selectedPlaceId: 'service-yard',
      selectedProductionId: blocked.productionId,
      sceneryLoadInState: 'blocked',
    })
    const exact = sceneryEvents(events)[0]!
    if (exact.type !== 'scenery-load-in') throw new Error('expected scenery event')
    expect(Object.keys(exact.sceneryLoadIn).sort()).toEqual([
      'locationBuildingId',
      'placeId',
      'productionId',
    ])

    scene.applySnapshot(snapshot([director()], [stage12, readySceneryOperation()]))
    serviceZone.emit('pointerdown', pointer())
    expect(sceneryEvents(events)).toHaveLength(2)
    expect(scene.debugState().sceneryLoadInState).toBe('ready')

    // Stage 7 remains its own production selection and never emits the service event.
    internals.zones[0]!.emit('pointerdown', pointer())
    expect(sceneryEvents(events)).toHaveLength(2)
    expect(productionEvents(events)).toHaveLength(1)
  })

  it('preserves generic service-yard inspection whenever exact scenery authority is absent', () => {
    const { internals, events } = harness(snapshot([director()], [operation()]))
    internals.manifest.places.push(serviceYardPlace())
    internals.buildWorld()
    internals.buildSemanticHotspots()

    internals.zones[1]!.emit('pointerdown', pointer())

    expect(sceneryEvents(events)).toEqual([])
    expect(events.filter((event) => event.type === 'place')).toEqual([{
      type: 'place',
      place: {
        id: 'service-yard',
        buildingId: 'post',
        label: 'Scenery & Service',
        affordances: ['delivery', 'supply-scenery', 'load-in'],
      },
    }])
  })

  it('keeps the scenery marker draw-only so a routed named person wins pointer priority', () => {
    const blocked = blockedSceneryOperation()
    const { internals } = harness(snapshot([director()], [blocked]))
    internals.manifest.places.push(serviceYardPlace())
    internals.route = [
      { x: 411, y: 591, actorDepth: 50, cue: 'past-truck' },
      { x: 514, y: 535, actorDepth: 56, cue: 'behind-camera' },
    ]

    internals.buildWorld()
    internals.buildSemanticHotspots()

    const routedDirector = internals.runtimePeople.get('director-1')!.sprite
    routedDirector.setPosition(411, 591).setDepth(50)
    const serviceZone = internals.zones[1]!
    expect(internals.sceneryGraphics).toMatchObject({ depth: 80, interactive: false })
    expect(serviceZone.depth).toBeLessThan(routedDirector.depth)
    expect(routedDirector.interactive).toBe(true)
  })

  it('gives the host exact service-yard parity without feedback events or identity substitution', () => {
    const blocked = blockedSceneryOperation()
    const { scene, internals, events } = harness(snapshot([director()], [blocked]))
    const service = serviceYardPlace()
    internals.manifest.places.push(service)
    internals.buildWorld()
    const shared = vi.spyOn(internals, 'selectSceneryLoadInSurface')
    const eventCount = events.length

    expect(scene.selectSceneryLoadInFromHost(blocked.productionId)).toBe(true)
    expect(shared).toHaveBeenCalledWith(service, false)
    expect(scene.debugState()).toMatchObject({
      selectedPlaceId: 'service-yard',
      selectedProductionId: blocked.productionId,
    })
    expect(events).toHaveLength(eventCount)

    expect(scene.selectSceneryLoadInFromHost('another-production')).toBe(false)
    expect(events).toHaveLength(eventCount)

    const stage12 = blockedSceneryOperation({
      productionId: 'production-stage-12',
      locationBuildingId: 'stage-b',
      currentCommand: {
        kind: 'clearSceneryLoadIn',
        productionId: 'production-stage-12',
        label: 'Clear scenery load-in',
      },
    })
    scene.applySnapshot(snapshot([director()], [stage12]))
    expect(scene.selectSceneryLoadInFromHost(stage12.productionId)).toBe(false)
    expect(scene.debugState().selectedPlaceId).toBeNull()
  })

  it('fails physical scenery identity closed when the runtime service-yard literals drift', () => {
    const blocked = blockedSceneryOperation()
    const { scene, internals, events } = harness(snapshot([director()], [blocked]))
    const malformed = serviceYardPlace()
    malformed.anchors.loadIn = [391, 584]
    internals.manifest.places.push(malformed)
    internals.buildWorld()
    internals.buildSemanticHotspots()
    scene.applySnapshot(snapshot([director()], [blocked]))

    internals.zones[1]!.emit('pointerdown', pointer())

    expect(sceneryEvents(events)).toEqual([])
    expect(events).toContainEqual({
      type: 'place',
      place: {
        id: 'service-yard',
        buildingId: 'post',
        label: 'Scenery & Service',
        affordances: ['delivery', 'supply-scenery', 'load-in'],
      },
    })
    expect(scene.selectSceneryLoadInFromHost(blocked.productionId)).toBe(false)
    expect(scene.debugState().sceneryLoadInState).toBe('blocked')
    expect(internals.sceneryGraphics!.calls.at(-1)).toEqual({ name: 'clear', args: [] })
  })

  it('fails host scenery selection closed when the initial manifest omits service-yard', () => {
    const blocked = blockedSceneryOperation()
    const { scene, internals, events } = harness(snapshot([director()], [blocked]))
    // The harness manifest contains canonical Stage 7 but no service-yard.
    scene.applySnapshot(snapshot([director()], [blocked]))

    expect(() => scene.selectSceneryLoadInFromHost(blocked.productionId)).not.toThrow()
    expect(scene.selectSceneryLoadInFromHost(blocked.productionId)).toBe(false)
    expect(scene.debugState()).toMatchObject({
      selectedPlaceId: null,
      selectedProductionId: null,
      sceneryLoadInState: 'blocked',
    })
    expect(sceneryEvents(events)).toEqual([])
    expect(internals.sceneryGraphics!.calls.at(-1)).toEqual({ name: 'clear', args: [] })
  })

  it('fails exact service and destination identity closed for duplicate or malformed runtime records', () => {
    const blocked = blockedSceneryOperation()
    const { scene, internals, events } = harness(snapshot([director()], [blocked]))
    const service = serviceYardPlace()
    internals.manifest.places.push(service)
    internals.buildWorld()
    internals.buildSemanticHotspots()

    const duplicateService = serviceYardPlace()
    duplicateService.anchors.loadIn = [391, 584]
    internals.manifest.places.push(duplicateService)
    expect(() => scene.selectSceneryLoadInFromHost(blocked.productionId)).not.toThrow()
    expect(scene.selectSceneryLoadInFromHost(blocked.productionId)).toBe(false)
    expect(sceneryEvents(events)).toEqual([])

    internals.manifest.places.pop()
    const duplicateStage = {
      ...internals.manifest.places[0]!,
      label: 'Stage Seven',
      anchors: { ...internals.manifest.places[0]!.anchors },
      affordances: [...internals.manifest.places[0]!.affordances],
      selectionPolygon: [...internals.manifest.places[0]!.selectionPolygon],
    }
    internals.manifest.places.push(duplicateStage)
    expect(scene.selectSceneryLoadInFromHost(blocked.productionId)).toBe(false)
    expect(scene.selectProductionFromHost(blocked.productionId)).toBe(false)
    internals.zones[0]!.emit('pointerdown', pointer())
    expect(productionEvents(events)).toEqual([])

    internals.manifest.places.pop()
    service.affordances = undefined as unknown as string[]
    expect(() => scene.selectSceneryLoadInFromHost(blocked.productionId)).not.toThrow()
    expect(scene.selectSceneryLoadInFromHost(blocked.productionId)).toBe(false)

    ;(internals.manifest as unknown as { places: unknown }).places = null
    expect(() => scene.selectSceneryLoadInFromHost(blocked.productionId)).not.toThrow()
    expect(scene.selectSceneryLoadInFromHost(blocked.productionId)).toBe(false)
  })

  it('routes the Annex polygon and visible status label through one exact identity-only selection seam', () => {
    const { scene, internals, events } = harness(snapshot([]))
    internals.manifest.places.push(annexPlace())
    const shared = vi.spyOn(internals, 'selectAnnexSurface')
    internals.buildWorld()
    internals.buildSemanticHotspots()
    const objectCounts = {
      graphics: internals.graphicsObjects.length,
      texts: internals.texts.length,
      zones: internals.zones.length,
    }

    const overlayButton = {}
    internals.zones.at(-1)!.emit('pointerdown', pointer(overlayButton))
    internals.expansionLabel!.emit('pointerdown', pointer(overlayButton))
    expect(shared).not.toHaveBeenCalled()
    expect(events).toEqual([])

    internals.zones.at(-1)!.emit('pointerdown', pointer())
    internals.expansionLabel!.emit('pointerdown', pointer())

    expect(shared).toHaveBeenCalledTimes(2)
    expect(events).toEqual([
      {
        type: 'place',
        place: {
          id: 'annex-parcel',
          buildingId: 'expansion',
          label: 'Development & Casting Annex',
          affordances: ['develop-studio', 'construct-annex'],
        },
      },
      {
        type: 'place',
        place: {
          id: 'annex-parcel',
          buildingId: 'expansion',
          label: 'Development & Casting Annex',
          affordances: ['develop-studio', 'construct-annex'],
        },
      },
    ])
    expect(scene.debugState().selectedPlaceId).toBe('annex-parcel')
    expect(internals.expansionLabel!.interactive).toBe(true)
    expect({
      graphics: internals.graphicsObjects.length,
      texts: internals.texts.length,
      zones: internals.zones.length,
    }).toEqual(objectCounts)
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

  it('fails physical and host Stage 7 selection closed on duplicate or malformed shared authority', () => {
    const exact = operation({ productionId: 'production-stage-7' })
    const duplicateStage = operation({ productionId: 'other-stage-7' })
    const duplicateIdentity = operation({
      productionId: exact.productionId,
      locationBuildingId: 'stage-b',
      facilityLabel: 'Soundstage 12 + Scenery Shop',
    })
    const malformedCommand = operation({
      productionId: exact.productionId,
      currentCommand: {
        kind: 'assignShootingDirector',
        productionId: 'stale-production',
        directorId: exact.directorId,
        label: 'Call Director to Soundstage 7',
      },
    })

    for (const operations of [
      [exact, duplicateStage],
      [exact, duplicateIdentity],
      [malformedCommand],
    ]) {
      const { scene, internals, events } = harness(snapshot([director()], operations))
      internals.buildWorld()
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
      expect(scene.selectProductionFromHost(exact.productionId)).toBe(false)
      expect(scene.debugState().stage7Operation).toBeNull()
    }
  })

  it('lets the semantic host highlight only the exact Annex without re-emitting selection', () => {
    const { scene, internals, events } = harness(snapshot([]))
    const exact = annexPlace()
    internals.manifest.places.push(exact)

    expect(scene.selectAnnexFromHost()).toBe(false)
    internals.buildWorld()
    const eventCount = events.length
    const objectCounts = {
      graphics: internals.graphicsObjects.length,
      texts: internals.texts.length,
      zones: internals.zones.length,
    }

    expect(scene.selectAnnexFromHost()).toBe(true)
    expect(scene.debugState().selectedPlaceId).toBe('annex-parcel')
    expect(events).toHaveLength(eventCount)
    expect({
      graphics: internals.graphicsObjects.length,
      texts: internals.texts.length,
      zones: internals.zones.length,
    }).toEqual(objectCounts)

    scene.clearPlaceSelection()
    exact.id = 'not-the-annex'
    expect(scene.selectAnnexFromHost()).toBe(false)
    expect(scene.debugState().selectedPlaceId).toBeNull()
    expect(events).toHaveLength(eventCount)

    exact.id = 'annex-parcel'
    exact.buildingId = 'stage-a'
    expect(scene.selectAnnexFromHost()).toBe(false)
    expect(scene.debugState().selectedPlaceId).toBeNull()
    expect(events).toHaveLength(eventCount)
  })

  it('restores the selected Annex outline after another place hover ends without emitting selection', () => {
    const { scene, internals, events } = harness(snapshot([]))
    const annex = annexPlace()
    internals.manifest.places.push(annex)
    internals.buildWorld()
    internals.buildSemanticHotspots()
    const draw = vi.spyOn(internals, 'drawPlaceOutline')

    expect(scene.selectAnnexFromHost()).toBe(true)
    const eventCount = events.length
    draw.mockClear()

    internals.zones[0]!.emit('pointerover')
    expect(draw).toHaveBeenLastCalledWith(internals.manifest.places[0], false)
    internals.zones[0]!.emit('pointerout')

    expect(draw).toHaveBeenLastCalledWith(annex, true)
    expect(scene.debugState().selectedPlaceId).toBe('annex-parcel')
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

  it('adds exactly one draw-only scenery object and no texture request', () => {
    const { scene, internals } = harness(snapshot([], [blockedSceneryOperation()]))
    internals.manifest.places.push(serviceYardPlace())
    scene.preload()
    const textureRequests = [...internals.imageLoads]

    internals.buildWorld()

    // Activity, scenery, selection, and Annex are the complete persistent
    // Graphics budget. Scenery occupies one object and reuses the district art.
    expect(internals.graphicsObjects).toHaveLength(4)
    expect(internals.sceneryGraphics).toBe(internals.graphicsObjects[1])
    expect(internals.sceneryGraphics!.interactive).toBe(false)
    expect(internals.imageLoads).toEqual(textureRequests)
    expect(textureRequests).toHaveLength(4)
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
      frameSampleCount: 2,
      fps: 33,
      frameMs: 30,
      p99FrameMs: 50,
      onePercentLowFps: 20,
      worstFrameMs: 50,
    })

    scene.resetPerformanceTelemetry()
    expect(scene.performanceStats()).toMatchObject({
      frameSampleCount: 0,
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

  it('paints exact Available, Working, and Production Held Annex presence without an object-budget delta', () => {
    const available = operationalAnnexSnapshot(null)
    const { scene, internals } = harness(available)
    internals.manifest.places.push(annexPlace())
    internals.buildWorld()
    internals.children.length = 34
    const expansionGraphics = internals.expansionGraphics
    const expansionLabel = internals.expansionLabel
    const objectCounts = {
      graphics: internals.graphicsObjects.length,
      texts: internals.texts.length,
      zones: internals.zones.length,
      circles: internals.circles.length,
      rectangles: internals.rectangles.length,
      sprites: internals.sprites.length,
      images: internals.images.length,
    }
    const expectFrozenObjects = () => {
      expect(internals.expansionGraphics).toBe(expansionGraphics)
      expect(internals.expansionLabel).toBe(expansionLabel)
      expect({
        graphics: internals.graphicsObjects.length,
        texts: internals.texts.length,
        zones: internals.zones.length,
        circles: internals.circles.length,
        rectangles: internals.rectangles.length,
        sprites: internals.sprites.length,
        images: internals.images.length,
      }).toEqual(objectCounts)
      expect(scene.performanceStats().displayObjects).toBe(34)
    }

    expansionGraphics!.calls = []
    scene.applySnapshot(available)
    expect(expansionLabel!.text).toBe('DEVELOPMENT & CASTING ANNEX · AVAILABLE')
    expect(expansionGraphics!.calls).toContainEqual({ name: 'fillStyle', args: [0x294c45, 1] })
    expect(expansionGraphics!.calls.some((call) => call.name === 'fillCircle')).toBe(false)
    expectFrozenObjects()

    const working = operationalAnnexSnapshot({
      owner: 'script',
      ownerId: 'script-night-crossing',
      title: 'Night Crossing',
      activity: 'drafting',
      workState: 'working',
      statusLabel: null,
      blocker: null,
    })
    expansionGraphics!.calls = []
    scene.applySnapshot(working)
    expect(expansionLabel!.text).toBe('DEVELOPMENT & CASTING ANNEX · WORKING')
    expect(expansionGraphics!.calls).toContainEqual({ name: 'fillStyle', args: [0xf0c66e, 1] })
    expect(expansionGraphics!.calls).toContainEqual({ name: 'fillCircle', args: [640, 827, 5] })
    expectFrozenObjects()

    const held = operationalAnnexSnapshot({
      owner: 'production',
      ownerId: 'production-night-crossing',
      title: 'Night Crossing',
      activity: 'preProduction',
      workState: 'held',
      statusLabel: 'Held for Soundstage capacity',
      blocker: {
        kind: 'facility-capacity',
        headline: 'Soundstage capacity unavailable',
        detail: 'Night Crossing retains its Annex slot while it waits to move into shooting.',
      },
    })
    expansionGraphics!.calls = []
    scene.applySnapshot(held)
    expect(expansionLabel!.text).toBe('DEVELOPMENT & CASTING ANNEX · PRODUCTION HELD')
    expect(expansionGraphics!.calls).toContainEqual({ name: 'fillStyle', args: [0xd58448, 1] })
    expect(expansionGraphics!.calls).toContainEqual({ name: 'fillCircle', args: [640, 827, 5] })
    expectFrozenObjects()
  })

  it('fails null or malformed Operational Annex work closed to neutral Operational paint', () => {
    const neutral = operationalAnnexSnapshot(null)
    neutral.annexWork = null
    const { scene, internals } = harness(neutral)
    internals.manifest.places.push(annexPlace())
    internals.buildWorld()

    internals.expansionGraphics!.calls = []
    expect(() => scene.applySnapshot(neutral)).not.toThrow()
    expect(internals.expansionLabel!.text).toBe('DEVELOPMENT & CASTING ANNEX · OPERATIONAL')
    expect(internals.expansionGraphics!.calls).toContainEqual({
      name: 'fillStyle',
      args: [0x294c45, 1],
    })
    expect(internals.expansionGraphics!.calls.some((call) => call.name === 'fillCircle')).toBe(false)

    const contradictory = operationalAnnexSnapshot(null)
    contradictory.annexWork = {
      ...annexWork(null),
      occupied: 1,
      available: 0,
    } as LotAnnexWork
    internals.expansionGraphics!.calls = []
    expect(() => scene.applySnapshot(contradictory)).not.toThrow()
    expect(internals.expansionLabel!.text).toBe('DEVELOPMENT & CASTING ANNEX · OPERATIONAL')
    expect(internals.expansionGraphics!.calls.some((call) => call.name === 'fillCircle')).toBe(false)
  })

  it('emphasizes an exact selected company while keeping both complete companies visible and selectable', () => {
    const companyA = companyFixture('production-a', 'Shared Title', 'stage-a')
    const companyB = companyFixture('production-b', 'Shared Title', 'stage-b')
    const { scene, internals, events } = harness(companySnapshot([companyA, companyB]))
    const presentation = (id: string) => internals.runtimePeople.get(id)!

    expect(internals.runtimePeople).toHaveLength(12)
    expect(scene.selectProductionCompanyFromHost('production-a')).toBe(true)
    expect(scene.debugState().selectedCompanyProductionId).toBe('production-a')
    for (const person of companyA.people) {
      expect(presentation(person.id).sprite).toMatchObject({
        tint: 0xbfe3d6,
        alpha: 1,
        scale: 1.03,
        visible: true,
        interactive: true,
      })
      expect(presentation(person.id).label.visible).toBe(false)
    }
    for (const person of companyB.people) {
      expect(presentation(person.id).sprite).toMatchObject({
        tint: 0xffffff,
        alpha: 0.72,
        scale: 0.96,
        visible: true,
        interactive: true,
      })
    }

    expect(scene.selectProductionCompanyFromHost('production-b')).toBe(true)
    expect(scene.debugState().selectedCompanyProductionId).toBe('production-b')
    const selected = companyB.people.find((person) => person.id.endsWith('-writer'))!
    scene.selectPerson(selected.id)
    expect(scene.debugState()).toMatchObject({
      selectedPersonId: selected.id,
      selectedCompanyProductionId: 'production-b',
    })
    expect(presentation(selected.id).sprite).toMatchObject({
      tint: 0xffe6a0,
      alpha: 1,
      scale: 1.08,
    })
    expect(presentation(selected.id).label).toMatchObject({ visible: true, text: selected.name })
    expect(events.at(-1)).toEqual({ type: 'person', person: selected })
    expect(internals.runtimePeople.size).toBe(12)
  })

  it('keeps company identity, emphasis, and person homes stable across same-title array reversal', () => {
    const companyA = companyFixture('production-a', 'Same Title', 'stage-a')
    const companyB = companyFixture('production-b', 'Same Title', 'stage-b')
    const initial = companySnapshot([companyA, companyB])
    const { scene, internals } = harness(initial)
    const position = (id: string) => {
      const sprite = internals.runtimePeople.get(id)!.sprite
      return { x: sprite.x, y: sprite.y }
    }
    const homes = new Map(initial.people.map((person) => [person.id, position(person.id)]))

    expect(scene.selectProductionCompanyFromHost('production-b')).toBe(true)
    const reversed = companySnapshot([companyB, companyA])
    reversed.people = [...reversed.people].reverse()
    reversed.productionOperations = [...reversed.productionOperations!].reverse()
    scene.applySnapshot(reversed)

    expect(scene.debugState().selectedCompanyProductionId).toBe('production-b')
    for (const person of initial.people) expect(position(person.id)).toEqual(homes.get(person.id))
    for (const person of companyA.people) {
      expect(internals.runtimePeople.get(person.id)!.sprite).toMatchObject({ alpha: 0.72, visible: true })
    }
    for (const person of companyB.people) {
      expect(internals.runtimePeople.get(person.id)!.sprite).toMatchObject({
        tint: 0xbfe3d6,
        alpha: 1,
      })
    }
  })

  it('preserves a selected surviving company and clears only when that exact company disappears', () => {
    const companyA = companyFixture('production-a', 'Picture A', 'stage-a')
    const companyB = companyFixture('production-b', 'Picture B', 'stage-b')
    const { scene, internals } = harness(companySnapshot([companyA, companyB]))

    const selectedB = companyB.people.find((person) => person.id.endsWith('-support'))!
    scene.selectPerson(selectedB.id)
    scene.applySnapshot(companySnapshot([companyB]))
    expect(scene.debugState()).toMatchObject({
      selectedPersonId: selectedB.id,
      selectedCompanyProductionId: 'production-b',
    })
    for (const person of companyB.people) {
      expect(internals.runtimePeople.get(person.id)!.sprite).toMatchObject({
        tint: person.id === selectedB.id ? 0xffe6a0 : 0xbfe3d6,
        alpha: 1,
      })
    }

    scene.applySnapshot(companySnapshot([companyA]))
    expect(scene.debugState()).toMatchObject({
      selectedPersonId: null,
      selectedCompanyProductionId: null,
    })
    for (const person of companyA.people) {
      expect(internals.runtimePeople.get(person.id)!.sprite).toMatchObject({
        tint: 0xffffff,
        alpha: 1,
        scale: 1,
        visible: true,
      })
    }
  })

  it('fails malformed or absent expanded company truth closed to neutral presentation', () => {
    const company = companyFixture('production-a', 'Picture A', 'stage-a')
    const { scene, internals } = harness(companySnapshot([company]))
    expect(scene.selectProductionCompanyFromHost(company.operation.productionId)).toBe(true)

    const malformedMembers = company.operation.companyMembers!.map((member) => ({ ...member }))
    malformedMembers[0]!.name = 'Stale writer name'
    scene.applySnapshot(snapshot(company.people, [{
      ...company.operation,
      companyMembers: malformedMembers,
    }]))
    expect(scene.debugState().selectedCompanyProductionId).toBeNull()
    expect(scene.selectProductionCompanyFromHost(company.operation.productionId)).toBe(false)
    expect(internals.runtimePeople).toHaveLength(0)

    const compatibility = snapshot([director(), talent()], [operation({
      leadId: 'talent-1',
      leadName: 'Alex Vale',
    })])
    scene.applySnapshot(compatibility)
    expect(scene.selectProductionCompanyFromHost('production-1')).toBe(false)
    expect(scene.debugState().selectedCompanyProductionId).toBeNull()
    for (const runtime of internals.runtimePeople.values()) {
      expect(runtime.sprite).toMatchObject({ tint: 0xffffff, alpha: 1, scale: 1, visible: true })
    }
  })

  it('clears a selected person and every partial active-company sprite on duplicate identity', () => {
    const company = companyFixture('production-a', 'Picture A', 'stage-a')
    const { scene, internals, events } = harness(companySnapshot([company]))
    const selected = company.people[0]!
    scene.selectPerson(selected.id)
    expect(scene.debugState().selectedPersonId).toBe(selected.id)

    const duplicate = { ...selected, name: 'Hostile duplicate name' }
    scene.applySnapshot(snapshot([...company.people, duplicate], [company.operation]))

    expect(scene.debugState()).toMatchObject({
      selectedPersonId: null,
      selectedCompanyProductionId: null,
    })
    expect(internals.runtimePeople).toHaveLength(0)
    expect(events.at(-1)).toEqual({ type: 'person', person: null })
  })

  it('shares company emphasis with Stage 7 and scenery selection while generic places clear it', () => {
    const company = companyFixture('production-1', 'Night Crossing', 'stage-a')
    const blocked = blockedSceneryOperation({
      ...company.operation,
      productionId: 'production-1',
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
    const { scene, internals } = harness(snapshot(company.people, [blocked]))
    internals.selectionGraphics = new fakePhaser.Graphics()
    const serviceYard = serviceYardPlace()
    internals.manifest.places.push(serviceYard)

    internals.selectStage7Surface(internals.manifest.places[0]!)
    expect(scene.debugState()).toMatchObject({
      selectedProductionId: 'production-1',
      selectedCompanyProductionId: 'production-1',
    })
    scene.clearProductionCompanySelection()
    expect(scene.debugState()).toMatchObject({
      selectedProductionId: 'production-1',
      selectedCompanyProductionId: null,
    })
    expect(scene.selectProductionFromHost('production-1')).toBe(true)
    expect(scene.debugState()).toMatchObject({
      selectedProductionId: 'production-1',
      selectedCompanyProductionId: 'production-1',
    })

    scene.clearProductionCompanySelection()
    expect(internals.selectSceneryLoadInSurface(serviceYard)).toBe(true)
    expect(scene.debugState()).toMatchObject({
      selectedPlaceId: 'service-yard',
      selectedCompanyProductionId: 'production-1',
    })
    scene.clearProductionCompanySelection()
    expect(scene.selectSceneryLoadInFromHost('production-1')).toBe(true)
    expect(scene.debugState()).toMatchObject({
      selectedPlaceId: 'service-yard',
      selectedCompanyProductionId: 'production-1',
    })

    internals.selectGenericPlaceSurface(annexPlace())
    expect(scene.debugState().selectedCompanyProductionId).toBeNull()
    for (const runtime of internals.runtimePeople.values()) {
      expect(runtime.sprite).toMatchObject({ tint: 0xffffff, alpha: 1, scale: 1, visible: true })
    }
  })

  it('adds no display or draw owner when company selection changes', () => {
    const companyA = companyFixture('production-a', 'Picture A', 'stage-a')
    const companyB = companyFixture('production-b', 'Picture B', 'stage-b')
    const { scene, internals } = harness(companySnapshot([companyA, companyB]))
    const structure = {
      sprites: internals.sprites.length,
      texts: internals.texts.length,
      graphics: internals.graphicsObjects.length,
      rectangles: internals.rectangles.length,
      circles: internals.circles.length,
      images: internals.images.length,
    }

    scene.selectProductionCompanyFromHost('production-a')
    scene.selectPerson(companyA.people[0]!.id)
    scene.selectProductionCompanyFromHost('production-b')
    scene.clearProductionCompanySelection()

    expect({
      sprites: internals.sprites.length,
      texts: internals.texts.length,
      graphics: internals.graphicsObjects.length,
      rectangles: internals.rectangles.length,
      circles: internals.circles.length,
      images: internals.images.length,
    }).toEqual(structure)
    expect(structure).toMatchObject({ sprites: 12, texts: 12, graphics: 0 })
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

  it('keeps only the selected Director nameplate attached throughout the cosmetic dispatch route', () => {
    const before = snapshot([director(), talent()], [operation()])
    const { scene, internals } = harness(before)
    const managedDirector = internals.runtimePeople.get('director-1')!
    const unselectedTalent = internals.runtimePeople.get('talent-1')!

    scene.selectPerson('director-1')
    scene.applySnapshot(snapshot([director(), talent()], [operation({ taskStatus: 'blocked' })]))

    expect(scene.debugState().routeProductionId).toBe('production-1')
    expect(managedDirector.sprite).toMatchObject({ x: 70, y: 80 })
    expect(managedDirector.label).toMatchObject({ x: 70, y: 8, visible: true })
    scene.update(0, 0)
    expect(managedDirector.sprite).toMatchObject({ x: 10, y: 20 })
    expect(managedDirector.label).toMatchObject({ x: 10, y: -52, visible: true })
    expect(unselectedTalent.label.visible).toBe(false)

    scene.update(0, 650)
    expect(managedDirector.sprite).toMatchObject({ x: 40, y: 50 })
    expect(managedDirector.label).toMatchObject({ x: 40, y: -22, visible: true })
    expect(unselectedTalent.label.visible).toBe(false)

    scene.update(0, 650)
    expect(scene.debugState().routeProductionId).toBeNull()
    expect(managedDirector.sprite).toMatchObject({ x: 70, y: 80 })
    expect(managedDirector.label).toMatchObject({ x: 70, y: 8, visible: true })
    expect(unselectedTalent.label.visible).toBe(false)
  })

  it('keeps selected direct-loaded blocked truth at Stage 7 without inventing a route', () => {
    const blocked = snapshot([director(), talent()], [operation({ taskStatus: 'blocked' })])
    const { scene, internals } = harness(blocked)
    const managedDirector = internals.runtimePeople.get('director-1')!
    const unselectedTalent = internals.runtimePeople.get('talent-1')!

    scene.selectPerson('director-1')
    scene.applySnapshot(blocked)
    scene.update(0, 10_000)

    expect(scene.debugState().routeProductionId).toBeNull()
    expect(managedDirector.sprite).toMatchObject({ x: 70, y: 80 })
    expect(managedDirector.label).toMatchObject({ x: 70, y: 8, visible: true })
    expect(unselectedTalent.label.visible).toBe(false)
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

  it('paints direct blocked and ready scenery truth without replaying a sweep or announcement', () => {
    for (const [state, exact] of [
      ['blocked', blockedSceneryOperation()],
      ['ready', readySceneryOperation()],
    ] as const) {
      const initial = snapshot([director()], [exact])
      const { scene, internals, events } = harness(initial)
      internals.manifest.places.push(serviceYardPlace())
      internals.sceneryGraphics!.calls = []

      // Applying the same loaded truth is initialization, not a live accepted change.
      scene.applySnapshot(initial)
      expect(scene.debugState()).toMatchObject({
        sceneryLoadInState: state,
        scenerySweepProductionId: null,
        scenerySweepElapsedMs: null,
      })
      expect(internals.sceneryGraphics!.calls).toContainEqual({
        name: 'lineBetween',
        args: [390, 584, 500, 500],
      })
      expect(events.filter((event) => event.type === 'activity')).toEqual([])
      scene.update(0, 60_000)
      expect(scene.debugState().scenerySweepProductionId).toBeNull()
      expect(events.filter((event) => event.type === 'activity')).toEqual([])
    }
  })

  it('treats an inactive-renderer replacement as direct ready truth when rendering resumes', () => {
    const blocked = blockedSceneryOperation()
    const initial = snapshot([director()], [blocked])
    const { scene, internals, events } = harness(initial)
    internals.manifest.places.push(serviceYardPlace())
    scene.applySnapshot(initial)
    const eventCount = events.length
    const activityBefore = events.filter((event) => event.type === 'activity').length

    internals.scene.isActive = () => false
    const ready = snapshot([director()], [readySceneryOperation()])
    scene.applySnapshot(ready)
    expect(scene.debugState()).toMatchObject({
      sceneryLoadInState: 'ready',
      scenerySweepProductionId: null,
    })

    internals.scene.isActive = () => true
    scene.applySnapshot(ready)
    expect(scene.debugState()).toMatchObject({
      sceneryLoadInState: 'ready',
      scenerySweepProductionId: null,
    })
    expect(events).toHaveLength(eventCount)
    expect(events.filter((event) => event.type === 'activity')).toHaveLength(activityBefore)
  })

  it('runs one bounded presentation-only blocked-to-ready sweep and then announces arrival once', () => {
    const blocked = blockedSceneryOperation()
    const initial = snapshot([director()], [blocked])
    const { scene, internals, events } = harness(initial)
    internals.manifest.places.push(serviceYardPlace())
    scene.applySnapshot(initial)
    const eventCount = events.length

    scene.applySnapshot(snapshot([director()], [readySceneryOperation()]))
    expect(scene.debugState()).toMatchObject({
      sceneryLoadInState: 'ready',
      scenerySweepProductionId: blocked.productionId,
      scenerySweepElapsedMs: 0,
    })
    expect(internals.sceneryGraphics!.calls).toContainEqual({
      name: 'fillRect',
      args: [368, 570, 44, 28],
    })
    expect(events).toHaveLength(eventCount)

    scene.update(0, 1_199)
    expect(scene.debugState()).toMatchObject({
      scenerySweepProductionId: blocked.productionId,
      scenerySweepElapsedMs: 1_199,
    })
    expect(events).toHaveLength(eventCount)

    scene.update(0, 1)
    expect(scene.debugState()).toMatchObject({
      sceneryLoadInState: 'ready',
      scenerySweepProductionId: null,
      scenerySweepElapsedMs: null,
    })
    expect(events.slice(eventCount)).toEqual([{
      type: 'activity',
      text: 'Night Crossing scenery reached Soundstage 7. The shooting take is ready to schedule.',
    }])
    scene.update(0, 10_000)
    expect(events.slice(eventCount)).toHaveLength(1)
  })

  it('snaps an accepted scenery clear under reduced motion with identical ready truth', () => {
    const blocked = blockedSceneryOperation()
    const initial = snapshot([director()], [blocked])
    const { scene, internals, events } = harness(initial, true)
    internals.manifest.places.push(serviceYardPlace())
    scene.applySnapshot(initial)
    const eventCount = events.length

    scene.applySnapshot(snapshot([director()], [readySceneryOperation()]))

    expect(scene.debugState()).toMatchObject({
      sceneryLoadInState: 'ready',
      scenerySweepProductionId: null,
      scenerySweepElapsedMs: null,
    })
    expect(events.slice(eventCount)).toEqual([{
      type: 'activity',
      text: 'Night Crossing scenery reached Soundstage 7. The shooting take is ready to schedule.',
    }])
    expect(internals.sceneryGraphics!.calls).toContainEqual({
      name: 'lineBetween',
      args: [484, 500, 495, 512],
    })
  })

  it('cancels the scenery sweep immediately when scheduled truth replaces ready authority', () => {
    const blocked = blockedSceneryOperation()
    const initial = snapshot([director()], [blocked])
    const { scene, internals, events } = harness(initial)
    internals.manifest.places.push(serviceYardPlace())
    scene.applySnapshot(initial)
    const eventCount = events.length

    scene.applySnapshot(snapshot([director()], [readySceneryOperation()]))
    scene.update(0, 300)
    expect(scene.debugState().scenerySweepProductionId).toBe(blocked.productionId)

    scene.applySnapshot(snapshot([director()], [operation({
      taskStatus: 'scheduled',
      statusLabel: 'Take in progress',
      blocker: null,
      currentCommand: null,
    })]))
    expect(scene.debugState()).toMatchObject({
      sceneryLoadInState: null,
      scenerySweepProductionId: null,
      scenerySweepElapsedMs: null,
    })
    expect(internals.sceneryGraphics!.calls.at(-1)).toEqual({ name: 'clear', args: [] })
    expect(events.slice(eventCount)).toEqual([{
      type: 'activity',
      text: 'Night Crossing scenery reached Soundstage 7. The shooting take is ready to schedule.',
    }])
    scene.update(0, 10_000)
    scene.applySnapshot(snapshot([director()], [operation({
      taskStatus: 'scheduled',
      statusLabel: 'Take in progress',
      blocker: null,
      currentCommand: null,
    })]))
    expect(events.slice(eventCount)).toHaveLength(1)
  })

  it('fails the projection closed for Stage 12-only and duplicate Stage 7 authority', () => {
    const stage12 = blockedSceneryOperation({
      productionId: 'production-stage-12',
      locationBuildingId: 'stage-b',
      facilityLabel: 'Soundstage 12 + Scenery Shop',
      currentCommand: {
        kind: 'clearSceneryLoadIn',
        productionId: 'production-stage-12',
        label: 'Clear scenery load-in',
      },
    })
    const stage7 = blockedSceneryOperation()
    for (const operations of [
      [stage12],
      [stage12, stage7, blockedSceneryOperation({ productionId: 'duplicate-stage-7', currentCommand: {
        kind: 'clearSceneryLoadIn',
        productionId: 'duplicate-stage-7',
        label: 'Clear scenery load-in',
      } })],
    ]) {
      const initial = snapshot([director()], operations)
      const { scene, internals, events } = harness(initial)
      internals.manifest.places.push(serviceYardPlace())
      internals.sceneryGraphics!.calls = []
      scene.applySnapshot(initial)

      expect(scene.debugState()).toMatchObject({
        sceneryLoadInState: null,
        scenerySweepProductionId: null,
      })
      expect(internals.sceneryGraphics!.calls).toEqual([{ name: 'clear', args: [] }])
      expect(scene.selectSceneryLoadInFromHost(stage12.productionId)).toBe(false)
      expect(events.filter((event) => event.type === 'scenery-load-in')).toEqual([])
    }
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

    scene.selectPerson('director-1')
    scene.applySnapshot(snapshot([director()], [operation({ taskStatus: 'blocked' })]))
    expect(scene.debugState().routeProductionId).toBeNull()
    expect(scene.debugState().stage7Operation?.taskStatus).toBe('blocked')
    expect(internals.sprites[0]).toMatchObject({ x: 70, y: 80 })
    expect(internals.runtimePeople.get('director-1')!.label).toMatchObject({
      x: 70,
      y: 8,
      visible: true,
    })

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

  it('reuses one exact canonical Gate zone for physical selection, host paint, and focus', () => {
    const current = gateSnapshot()
    const { scene, internals, events } = harness(current)
    installCanonicalGate(internals)
    internals.selectionGraphics = new fakePhaser.Graphics()

    internals.buildSemanticHotspots()
    expect(internals.zones).toHaveLength(2) // existing Stage 7 + canonical Gate
    const physicalGate = internals.zones.at(-1)!
    physicalGate.emit('pointerdown', pointer())

    expect(events.filter((event) => event.type === 'place')).toEqual([{
      type: 'place',
      place: {
        id: 'studio-gate',
        buildingId: 'gate',
        label: 'Studio Gate',
        affordances: ['gate-security', 'arrival'],
      },
    }])
    expect(scene.debugState().selectedPlaceId).toBe('studio-gate')

    events.length = 0
    expect(scene.selectGateFromHost()).toBe(true)
    expect(events).toEqual([])
    expect(scene.focusGateFromHost()).toBe(true)
    expect(internals.cameras.main.pan).toHaveBeenCalledOnce()
  })

  it.each([
    ['missing Gate', (internals: SceneHarness) => { internals.manifest.places.pop() }],
    ['wrong canvas', (internals: SceneHarness) => { internals.manifest.canvas.width = 1585 }],
    ['unexpected canvas field', (internals: SceneHarness) => {
      Object.assign(internals.manifest.canvas, { scale: 1 })
    }],
    ['missing foreground', (internals: SceneHarness) => { internals.manifest.layers.pop() }],
    ['wrong foreground depth', (internals: SceneHarness) => {
      internals.manifest.layers.at(-1)!.depth = 91
    }],
    ['wrong foreground output', (internals: SceneHarness) => {
      internals.manifest.layers.at(-1)!.output = 'other.png'
    }],
    ['duplicate foreground', (internals: SceneHarness) => {
      internals.manifest.layers.push({ ...gateForegroundLayer(), id: 'gate-shadow' })
    }],
    ['wrong foreground bounds', (internals: SceneHarness) => {
      internals.manifest.layers.at(-1)!.x = 569
    }],
    ['unexpected foreground field', (internals: SceneHarness) => {
      Object.assign(internals.manifest.layers.at(-1)!, { opacity: 1 })
    }],
    ['wrong identity', (internals: SceneHarness) => {
      internals.manifest.places.at(-1)!.id = 'other-gate'
    }],
    ['unexpected Gate field', (internals: SceneHarness) => {
      Object.assign(internals.manifest.places.at(-1)!, { destination: 'hiring' })
    }],
    ['wrong anchor', (internals: SceneHarness) => {
      internals.manifest.places.at(-1)!.anchors.arrival = [1228, 844]
    }],
    ['unexpected anchor key', (internals: SceneHarness) => {
      internals.manifest.places.at(-1)!.anchors.queue = [1227, 844]
    }],
    ['reordered affordances', (internals: SceneHarness) => {
      internals.manifest.places.at(-1)!.affordances.reverse()
    }],
    ['stale source polygon', (internals: SceneHarness) => {
      internals.manifest.places.at(-1)!.selectionPolygon = [
        [593, 548], [1586, 529], [1586, 992], [574, 992],
      ]
    }],
    ['non-finite polygon', (internals: SceneHarness) => {
      internals.manifest.places.at(-1)!.selectionPolygon[0] = [Number.NaN, 570]
    }],
    ['self-intersecting polygon', (internals: SceneHarness) => {
      internals.manifest.places.at(-1)!.selectionPolygon = [
        [930, 570], [1586, 992], [1586, 529], [900, 992], [820, 900], [835, 720],
      ]
    }],
    ['Gate-like duplicate', (internals: SceneHarness) => {
      internals.manifest.places.push({
        ...gatePlace(),
        id: 'visitor-entrance',
        selectionPolygon: [[0, 0], [10, 0], [10, 10]],
      })
    }],
  ])('fails only malformed Gate truth closed: %s', (_label, mutate) => {
    const current = gateSnapshot()
    const { scene, internals, events } = harness(current)
    installCanonicalGate(internals)
    internals.selectionGraphics = new fakePhaser.Graphics()
    mutate(internals)

    internals.buildSemanticHotspots()
    expect(internals.zones).toHaveLength(1) // unrelated Stage 7 remains operational
    expect(scene.selectGateFromHost()).toBe(false)
    expect(scene.focusGateFromHost()).toBe(false)
    expect(scene.setGateVisitor(gateVisitor())).toBe(false)
    expect(scene.debugState().gateVisitorTalentId).toBeNull()
    expect(events).toEqual([])
  })

  it('renders exactly one stationary complete-provenance visitor and emits identity only', () => {
    const first = gateCandidate()
    const second = gateCandidate({
      talentId: 'visitor-2',
      name: 'Eli North',
      creativeRole: 'actor',
      offerTermWeeks: [13, 26],
    })
    const current = gateSnapshot([first, second])
    const { scene, internals, events } = harness(current)
    installCanonicalGate(internals)
    const textCount = internals.texts.length
    const zoneCount = internals.zones.length
    const tweenCount = internals.tweenAdds.length

    expect(scene.setGateVisitor(gateVisitor(first))).toBe(true)
    const sprite = internals.gateVisitor!.sprite
    expect(sprite).toMatchObject({
      x: 1227,
      y: 844,
      originX: 0.5,
      originY: 0.92,
      depth: 97,
      texture: 'hollywood-director',
      interactive: true,
    })
    expect(internals.texts).toHaveLength(textCount)
    expect(internals.zones).toHaveLength(zoneCount)
    expect(internals.tweenAdds).toHaveLength(tweenCount)
    expect(scene.performanceStats().dynamicActors).toBe(1)

    scene.update(0, 10_000)
    scene.setReducedMotion(true)
    expect(sprite).toMatchObject({ x: 1227, y: 844, depth: 97 })

    sprite.emit('pointerdown', pointer())
    expect(events.filter((event) => event.type === 'gate-visitor')).toEqual([{
      type: 'gate-visitor',
      visitor: { talentId: first.talentId },
    }])

    expect(scene.setGateVisitor(gateVisitor(second))).toBe(true)
    expect(internals.gateVisitor!.sprite).toBe(sprite)
    expect(internals.gateVisitor).toMatchObject({
      presentation: { talentId: second.talentId, presentationRole: 'talent' },
    })
    expect(sprite.texture).toBe('hollywood-talent')
    expect(scene.performanceStats().dynamicActors).toBe(1)

    expect(scene.setGateVisitor(null)).toBe(true)
    expect(sprite.destroyed).toBe(true)
    expect(scene.debugState().gateVisitorTalentId).toBeNull()
    expect(scene.performanceStats().dynamicActors).toBe(0)
  })

  it('holds the frozen one-production structural reference at exactly +1 visitor cost', () => {
    const current = gateSnapshot(undefined, { people: [director(), talent()] })
    const { scene, internals } = harness(current)
    installCanonicalGate(internals)

    // The fake Scene does not maintain Phaser's DisplayList length, so pin the
    // independently accepted preselection reference and advance it only by the
    // observed sprite delta from setGateVisitor below.
    internals.children.length = 34
    internals.manifest.textureMemoryBytes = 9_164_360
    internals.textureSizes.set('hollywood-role-atlas-v1', {
      width: 384,
      height: 1152,
      generated: false,
    })
    internals.ambientActors.length = 12
    internals.vehicle = new fakePhaser.DisplayObject()
    internals.drawCallSamples = [1]

    expect(scene.performanceStats()).toMatchObject({
      displayObjects: 34,
      dynamicActors: 15,
      textureMemoryBytes: 11_096_896,
      drawCalls: 1,
    })

    const spriteCount = internals.sprites.length
    expect(scene.setGateVisitor(gateVisitor())).toBe(true)
    expect(internals.sprites).toHaveLength(spriteCount + 1)
    internals.children.length += internals.sprites.length - spriteCount

    expect(scene.performanceStats()).toMatchObject({
      displayObjects: 35,
      dynamicActors: 16,
      textureMemoryBytes: 11_096_896,
      drawCalls: 1,
    })
    expect(internals.texts).toHaveLength(2)
    expect(internals.zones).toHaveLength(0)
    expect(internals.tweenAdds).toHaveLength(0)
  })

  it('rejects stale presentation provenance and never resurrects it from later snapshots', () => {
    const current = gateSnapshot()
    const { scene, internals } = harness(current)
    installCanonicalGate(internals)
    const exact = gateVisitor()

    for (const hostile of [
      { ...exact, studioSeed: 'another-studio' },
      { ...exact, marketWeek: 2 },
      { ...exact, name: 'Replacement Name' },
      { ...exact, offerTermWeeks: [26, 104] },
      { ...exact, presentationRole: 'talent' as const },
    ]) {
      expect(scene.setGateVisitor(hostile)).toBe(false)
      expect(scene.debugState().gateVisitorTalentId).toBeNull()
    }

    expect(scene.setGateVisitor(exact)).toBe(true)
    const priorSprite = internals.gateVisitor!.sprite
    scene.applySnapshot(gateSnapshot(undefined, { week: 2 }))
    expect(priorSprite.destroyed).toBe(true)
    expect(internals.requestedGateVisitor).toBeNull()

    scene.applySnapshot(current)
    expect(scene.debugState().gateVisitorTalentId).toBeNull()
  })

  it('uses the existing role atlas when active without changing visitor geometry', () => {
    const current = gateSnapshot()
    const { scene, internals } = harness(current)
    installCanonicalGate(internals)
    internals.roleAtlasActive = true

    expect(scene.setGateVisitor(gateVisitor())).toBe(true)
    expect(internals.gateVisitor!.sprite).toMatchObject({
      x: 1227,
      y: 844,
      depth: 97,
      texture: 'hollywood-role-atlas-v1',
      flipX: false,
    })
  })
})
