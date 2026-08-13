import { describe, expect, it, vi } from 'vitest'

const fakePhaser = vi.hoisted(() => {
  class DisplayObject {
    x: number
    y: number
    text = ''
    texture = ''
    destroyed = false
    visible = true

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
    destroy() { this.destroyed = true }
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

  return { DisplayObject, Scene, Tween }
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
import type { LotPersonState, StudioLotSnapshot } from '../snapshot/StudioLotSnapshot.ts'

const director = (overrides: Partial<LotPersonState> = {}): LotPersonState => ({
  id: 'director-1',
  name: 'Mara Voss',
  role: 'director',
  authority: 'active-production',
  productionId: 'production-1',
  productionTitle: 'The Violet Hour',
  ...overrides,
})

function snapshot(people: LotPersonState[]): StudioLotSnapshot {
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
  }
}

type SceneHarness = InstanceType<typeof fakePhaser.Scene> & {
  route: Array<{ x: number; y: number; actorDepth: number; cue: string }>
  manifest: {
    districtId: string
    activities: unknown[]
    places: Array<{
      id: string
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
  fitZoom: number
}

function harness(initial: StudioLotSnapshot, reducedMotion = false) {
  const events: HollywoodEvent[] = []
  const scene = new HollywoodScene()
  scene.init({ snapshot: initial, reducedMotion, onEvent: (event) => events.push(event) })
  const internals = scene as unknown as SceneHarness
  internals.manifest = { districtId: 'district', activities: [], places: [] }
  internals.route = [
    { x: 10, y: 20, actorDepth: 30, cue: 'street' },
    { x: 70, y: 80, actorDepth: 82, cue: 'enter-stage' },
  ]
  scene.applySnapshot(initial)
  return { scene, internals, events }
}

describe('HollywoodScene presentation authority', () => {
  it('reconciles people by id and clears selection/task when that authority disappears', () => {
    const first = snapshot([director()])
    const { scene, internals, events } = harness(first)

    scene.selectPerson('director-1')
    expect(scene.assignSelectedToStage7()).toBe(true)
    const originalSprite = internals.sprites[0]!

    scene.applySnapshot(snapshot([director({ name: 'Mara de Voss', productionTitle: 'Violet Hour II' })]))
    expect(internals.sprites).toHaveLength(1)
    expect(internals.texts[0]!.text).toBe('Mara de Voss')
    expect(events.filter((event) => event.type === 'person').at(-1)).toEqual({
      type: 'person',
      person: director({ name: 'Mara de Voss', productionTitle: 'Violet Hour II' }),
    })

    scene.applySnapshot(snapshot([]))
    expect(originalSprite.destroyed).toBe(true)
    expect(scene.debugState().selectedPersonId).toBeNull()
    expect(scene.debugState().task).toBeNull()
    expect(events).toContainEqual({ type: 'person', person: null })
    expect(events).toContainEqual({ type: 'task', task: null })
  })

  it('reduces ambient, camera, route, vehicle, and publicity motion without disabling the flow', () => {
    const { scene, internals } = harness(snapshot([director()]), true)
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
    internals.manifest.places = [{
      id: 'stage-7',
      selectionPolygon: [[0, 0], [100, 0], [100, 100], [0, 100]],
    }]
    internals.fitZoom = 1
    internals.flash = new fakePhaser.DisplayObject()

    scene.setReducedMotion(true)
    scene.update(0, 100)
    expect(vehicleTween.paused).toBe(1)
    expect(internals.ambientActors[0]!.phase).toBe(0.25)

    scene.selectPerson('director-1')
    expect(scene.assignSelectedToStage7()).toBe(true)
    expect(scene.debugState().task?.status).toBe('blocked')
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
