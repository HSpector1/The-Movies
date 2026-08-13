// Renderer-level regression for managed soundstage occupancy.
//
// The state helper has its own unit tests, but this suite deliberately crosses the
// presentation boundary: it constructs the real LotScene and invokes the real stage
// dressing / attention-badge paths. Phaser itself is the only stand-in because jsdom
// has no WebGL surface. Leaf object constructors are replaced with inert display
// objects so the assertions stay focused on LotScene's branching authority.

import { describe, expect, it, vi } from 'vitest'

const phaser = vi.hoisted(() => {
  class DisplayObject {
    readonly kind: string
    readonly text: string | null
    readonly list: DisplayObject[]
    readonly data: Record<string, unknown> = {}
    x = 0
    y = 0
    depth = 0
    width = 42
    height = 12
    alpha = 1
    tint: number | null = null
    visible = true
    destroyed = false

    constructor(kind: string, text: string | null = null, children: DisplayObject[] = []) {
      this.kind = kind
      this.text = text
      this.list = [...children]
    }

    add(...items: Array<DisplayObject | DisplayObject[]>): this {
      for (const item of items) this.list.push(...(Array.isArray(item) ? item : [item]))
      return this
    }

    destroy(): this {
      this.destroyed = true
      return this
    }

    clearTint(): this {
      this.tint = null
      return this
    }

    setAlpha(alpha: number): this {
      this.alpha = alpha
      return this
    }

    setTint(tint: number): this {
      this.tint = tint
      return this
    }

    setData(key: string, value: unknown): this {
      this.data[key] = value
      return this
    }

    getData(key: string): unknown {
      return this.data[key]
    }

    setPosition(x: number, y: number): this {
      this.x = x
      this.y = y
      return this
    }

    setDepth(depth: number): this {
      this.depth = depth
      return this
    }

    setVisible(visible: boolean): this {
      this.visible = visible
      return this
    }

    setOrigin(..._args: unknown[]): this {
      return this
    }

    fillStyle(..._args: unknown[]): this {
      return this
    }

    fillRoundedRect(..._args: unknown[]): this {
      return this
    }

    lineStyle(..._args: unknown[]): this {
      return this
    }

    strokeRoundedRect(..._args: unknown[]): this {
      return this
    }

    fillTriangle(..._args: unknown[]): this {
      return this
    }

    strokeCircle(..._args: unknown[]): this {
      return this
    }

    fillCircle(..._args: unknown[]): this {
      return this
    }

    beginPath(): this {
      return this
    }

    moveTo(..._args: unknown[]): this {
      return this
    }

    lineTo(..._args: unknown[]): this {
      return this
    }

    strokePath(): this {
      return this
    }
  }

  const display = (
    kind: string,
    text: string | null = null,
    children: DisplayObject[] = [],
  ): DisplayObject => new DisplayObject(kind, text, children)

  class FakeScene {
    readonly add = {
      graphics: () => display('graphics'),
      text: (x: number, y: number, text: string) =>
        display('text', text).setPosition(x, y),
      container: (x: number, y: number, children: DisplayObject[] = []) =>
        display('container', null, children).setPosition(x, y),
    }

    constructor(_key?: unknown) {}
  }

  const P = { Scene: FakeScene }
  return { P, display }
})

vi.mock('phaser', () => ({ default: phaser.P, ...phaser.P }))

import { COLORS } from './palette.ts'
import type { PlacedBuilding } from './layout.ts'
import { LotScene } from './LotScene.ts'
import type {
  AttentionState,
  BuildingId,
  ProductionCard,
  StudioLotSnapshot,
} from '../snapshot/StudioLotSnapshot.ts'
import { ALL_BUILDING_IDS } from '../snapshot/StudioLotSnapshot.ts'

type Display = ReturnType<typeof phaser.display>

type FakeProductionTag = {
  container: Display
  full: Display
  compact: Display
}

type FakeBuildingView = {
  spec: PlacedBuilding
  container: Display
  sprite: Display
  outline: Display
  label: Display
  recLight: Display
  doorGlow: Display | null
  prodTag: FakeProductionTag | null
  dressing: Display[]
}

type LotSceneHarness = {
  dressStage: (view: FakeBuildingView, production: ProductionCard | null) => void
  updateAttentionBadges: (snapshot: StudioLotSnapshot) => void
  views: Map<BuildingId, FakeBuildingView>
  attnBadges: Map<BuildingId, Display>
  identityMode: 'concept-a'
  identityFailed: boolean
  buildingTopY: (view: FakeBuildingView) => number
  makeDoorGlow: (view: FakeBuildingView) => Display
  placeProp: (...args: unknown[]) => Display
  makeProductionTag: (
    view: FakeBuildingView,
    production: ProductionCard,
    state: unknown,
  ) => FakeProductionTag
}

const STAGE_A_SPEC: PlacedBuilding = {
  id: 'stage-a',
  texKey: 'b-stage',
  gx: 15,
  gy: 2,
  fw: 4,
  fd: 4,
  label: 'Stage A',
  blurb: 'Renderer regression fixture',
}

function production(overrides: Partial<ProductionCard> = {}): ProductionCard {
  return {
    id: 'prod-renderer-regression',
    title: 'The Occupied Stage',
    genre: 'Drama',
    stageId: 'stage-a',
    progress01: 0.5,
    weeksRemaining: 4,
    active: false,
    stageState: 'idle',
    ...overrides,
  }
}

function snapshot(
  card: ProductionCard,
  stageAttention: AttentionState = 'normal',
): StudioLotSnapshot {
  return {
    studioName: 'Renderer Test Pictures',
    week: 12,
    cash: 1_000_000,
    cashBand: 'stable',
    standing: 'finding-footing',
    standingValues: { awareness: 25, prestige: 20, confidence: 30 },
    activeProductions: [card],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings: ALL_BUILDING_IDS.map((id) => ({
      id,
      available: true,
      attention: id === 'stage-a' ? stageAttention : 'normal',
    })),
    selectedBuildingId: null,
    sceneSeed: 'lot-scene-production-occupancy',
    operationsMode: 'legacy',
    stageAssignmentAuthority: 'presentation',
    productionOperations: [],
  }
}

function makeView(): FakeBuildingView {
  return {
    spec: STAGE_A_SPEC,
    container: phaser.display('container'),
    sprite: phaser.display('sprite'),
    outline: phaser.display('graphics'),
    label: phaser.display('container'),
    recLight: phaser.display('rec-light'),
    doorGlow: null,
    prodTag: null,
    dressing: [],
  }
}

function renderHarness(card: ProductionCard, attention: AttentionState = 'normal') {
  const snap = snapshot(card, attention)
  const scene = new LotScene()
  scene.init({ snapshot: snap, onEvent: () => {} })

  const harness = scene as unknown as LotSceneHarness
  const view = makeView()
  harness.views.set('stage-a', view)

  // Keep the real control flow while replacing leaf display-object construction.
  harness.placeProp = () => phaser.display('prop')
  harness.makeDoorGlow = () => phaser.display('door-glow')
  harness.makeProductionTag = () => ({
    container: phaser.display('production-tag'),
    full: phaser.display('production-tag-full'),
    compact: phaser.display('production-tag-compact'),
  })
  harness.buildingTopY = () => -100

  return { harness, snap, view }
}

function badgeWord(badge: Display): string | null {
  return badge.list.find(({ kind }) => kind === 'text')?.text ?? null
}

describe('LotScene managed production occupancy renderer', () => {
  it.each([
    ['a rehearsal/capacity reservation', production(), 'OCCUPIED'],
    [
      'a shooting decision hold',
      production({ stageState: 'decision-required' }),
      'DECISION',
    ],
  ] as const)('keeps %s dressed and visibly occupied while REC remains off', (_name, card, word) => {
    const attention: AttentionState =
      card.stageState === 'decision-required' ? 'decision-required' : 'normal'
    const { harness, snap, view } = renderHarness(card, attention)

    harness.dressStage(view, card)

    expect(view.recLight.getData('on')).toBe(false)
    expect(view.recLight.tint).toBe(COLORS.recordingOff)
    expect(view.doorGlow).toBeNull()
    expect(view.dressing.length).toBeGreaterThan(0)
    expect(view.prodTag).not.toBeNull()

    harness.identityMode = 'concept-a'
    harness.identityFailed = false
    harness.updateAttentionBadges(snap)
    const badge = harness.attnBadges.get('stage-a')
    expect(badge).toBeDefined()
    expect(badgeWord(badge!)).toBe(word)
  })

  it('preserves the legacy filming presentation with REC, door glow, dressing, and ACTIVE badge', () => {
    const card = production({ active: true, stageState: 'filming' })
    const { harness, snap, view } = renderHarness(card, 'active')

    harness.dressStage(view, card)

    expect(view.recLight.getData('on')).toBe(true)
    expect(view.recLight.tint).toBe(COLORS.recordingOn)
    expect(view.doorGlow).not.toBeNull()
    expect(view.dressing.length).toBeGreaterThan(0)
    expect(view.prodTag).not.toBeNull()

    harness.identityMode = 'concept-a'
    harness.identityFailed = false
    harness.updateAttentionBadges(snap)
    const badge = harness.attnBadges.get('stage-a')
    expect(badge).toBeDefined()
    expect(badgeWord(badge!)).toBe('ACTIVE')
  })
})
