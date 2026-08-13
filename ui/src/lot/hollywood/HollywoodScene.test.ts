import { describe, expect, it, vi } from 'vitest'

const fakePhaser = vi.hoisted(() => {
  class DisplayObject {
    x: number
    y: number
    text = ''
    texture = ''
    destroyed = false
    visible = true
    fillColor = 0

    constructor(x = 0, y = 0, texture = '') {
      this.x = x
      this.y = y
      this.texture = texture
    }

    setOrigin() { return this }
    setDepth() { return this }
    setInteractive() { return this }
    on() { return this }
    setVisible(visible: boolean) { this.visible = visible; return this }
    setTint() { return this }
    setTexture(texture: string) { this.texture = texture; return this }
    setPosition(x: number, y: number) { this.x = x; this.y = y; return this }
    setFlipX() { return this }
    setScale() { return this }
    setAlpha() { return this }
    setText(text: string) { this.text = text; return this }
    setFillStyle(color: number) { this.fillColor = color; return this }
    destroy() { this.destroyed = true }
  }

  class Graphics extends DisplayObject {
    clear() { return this }
    fillStyle() { return this }
    fillEllipse() { return this }
    lineStyle() { return this }
    lineBetween() { return this }
    fillCircle() { return this }
    fillRect() { return this }
    strokeRect() { return this }
    strokeCircle() { return this }
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
    tweenAdds: unknown[] = []
    scene = { isActive: () => true }
    add = {
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

  return { DisplayObject, Graphics, Scene, Tween }
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
import type {
  LotPersonState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from '../snapshot/StudioLotSnapshot.ts'

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
    activities: Array<{ id: string; place: string; visualStates: string[] }>
    places: Array<{
      id: string
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
}

function harness(initial: StudioLotSnapshot, reducedMotion = false) {
  const events: HollywoodEvent[] = []
  const scene = new HollywoodScene()
  scene.init({ snapshot: initial, reducedMotion, onEvent: (event) => events.push(event) })
  const internals = scene as unknown as SceneHarness
  internals.manifest = {
    districtId: 'district',
    activities: [{ id: 'shooting', place: 'stage-7', visualStates: ['crew-call', 'equipment-staged', 'take-in-progress'] }],
    places: [{ id: 'stage-7', anchors: { crewCall: [50, 60] }, selectionPolygon: [[0, 0], [100, 0], [100, 100], [0, 100]] }],
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
