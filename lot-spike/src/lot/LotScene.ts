// ── LotScene — the isometric studio lot ───────────────────────────────────────
// Presentation only. It renders a StudioLotSnapshot: ground, composed buildings,
// landscaping, active productions on stages, and a little ambient life. It owns no
// simulation state — it reads facts and paints. Camera, hover/select, and action
// emission live here; the surrounding HTML chrome lives in the host.

import Phaser from 'phaser'
import { TILE_W, TILE_H, gridToScreen, depthFor, LAYER } from './iso'
import { COLORS as K } from './palette'
import { Rng } from './rng'
import { bakeAllTextures, BUILDING_TEX, PROP_TEX } from './assets'
import {
  LOT_W,
  LOT_D,
  ROADS,
  PLAZA,
  PATHS,
  EXPANSION_PADS,
  placedBuildings,
  landscaping,
  type PlacedBuilding,
  type Rect,
} from './layout'
import type {
  StudioLotSnapshot,
  BuildingId,
  ProductionCard,
  LotActionKind,
} from '../snapshot/StudioLotSnapshot'
import { BUILDING_ACTION } from '../snapshot/StudioLotSnapshot'

const hw = TILE_W / 2
const hh = TILE_H / 2

const ZOOM_MIN = 0.35
const ZOOM_MAX = 1.7

const FONT_SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif'
const FONT_SANS = 'Avenir, "Helvetica Neue", Arial, sans-serif'

/** Events the scene emits up to the host. */
export type LotEvent =
  | {
      type: 'selected'
      buildingId: BuildingId
      label: string
      blurb: string
      available: boolean
      action: LotActionKind
      production: ProductionCard | null
    }
  | { type: 'deselected' }
  | { type: 'action'; buildingId: BuildingId; action: LotActionKind }
  | { type: 'ready' }

export type LotSceneData = {
  snapshot: StudioLotSnapshot
  onEvent: (e: LotEvent) => void
}

type BuildingView = {
  spec: PlacedBuilding
  container: Phaser.GameObjects.Container
  sprite: Phaser.GameObjects.Sprite | null
  outline: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Container
  recLight: Phaser.GameObjects.Sprite | null
  prodTag: Phaser.GameObjects.Container | null
}

type Route = { gx: number; gy: number }[]

type Agent = {
  sprite: Phaser.GameObjects.Sprite
  route: Route
  speed: number
  dist: number
  bob: number
  kind: 'worker' | 'vehicle'
}

export class LotScene extends Phaser.Scene {
  private snapshot!: StudioLotSnapshot
  private emitEvent!: (e: LotEvent) => void

  private views = new Map<BuildingId, BuildingView>()
  private agents: Agent[] = []
  private routeLen = new WeakMap<object, number>()
  private originByKey = new Map<string, number>()

  private selected: BuildingId | null = null
  private hovered: BuildingId | null = null

  private dragging = false
  private dragMoved = false
  private dragStart = { x: 0, y: 0 }
  private scrollStart = { x: 0, y: 0 }

  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

  constructor() {
    super('lot')
  }

  init(data: LotSceneData): void {
    this.snapshot = data.snapshot
    this.emitEvent = data.onEvent
  }

  create(): void {
    bakeAllTextures(this)

    // remember the baked origins so placement matches the art exactly
    for (const t of Object.values(BUILDING_TEX)) this.originByKey.set(t.key, t.originY)
    for (const t of Object.values(PROP_TEX)) this.originByKey.set(t.key, t.originY)

    this.buildGround()
    this.buildBuildings()
    this.buildLandscaping()
    this.buildAgents()

    this.setupCamera()
    this.setupInput()

    this.applySnapshot(this.snapshot)
    this.resetCamera()

    this.emitEvent({ type: 'ready' })
  }

  private texMeta(key: string): { w: number; h: number; originY: number } {
    const img = this.textures.get(key).getSourceImage() as HTMLCanvasElement
    return { w: img.width, h: img.height, originY: this.originByKey.get(key) ?? 0.9 }
  }

  // ── ground ──────────────────────────────────────────────────────────────────

  private buildGround(): void {
    const kinds = this.rasterizeGround()
    const corners = this.lotCorners()
    const minX = Math.min(...corners.map((c) => c.x)) - hw
    const minY = Math.min(...corners.map((c) => c.y))
    const maxX = Math.max(...corners.map((c) => c.x)) + hw
    const maxY = Math.max(...corners.map((c) => c.y)) + TILE_H

    const rt = this.add.renderTexture(minX, minY, maxX - minX, maxY - minY)
    rt.setOrigin(0, 0)
    rt.setDepth(-1_000_000)

    rt.beginDraw()
    for (let gy = 0; gy < LOT_D; gy++) {
      for (let gx = 0; gx < LOT_W; gx++) {
        const s = gridToScreen(gx + 0.5, gy + 0.5)
        rt.batchDraw(kinds[gy][gx], s.x - minX - hw, s.y - minY)
      }
    }
    rt.endDraw()
  }

  private rasterizeGround(): string[][] {
    const rng = new Rng(this.snapshot.sceneSeed + ':ground')
    const g: string[][] = []
    for (let gy = 0; gy < LOT_D; gy++) {
      g[gy] = []
      for (let gx = 0; gx < LOT_W; gx++) g[gy][gx] = rng.chance(0.22) ? 't-lawn2' : 't-lawn'
    }
    const paint = (rects: Rect[], key: string, lineKey?: string): void => {
      for (const r of rects) {
        const midX = Math.round((r.x0 + r.x1) / 2)
        const midY = Math.round((r.y0 + r.y1) / 2)
        for (let gy = r.y0; gy <= r.y1; gy++) {
          for (let gx = r.x0; gx <= r.x1; gx++) {
            if (gx < 0 || gy < 0 || gx >= LOT_W || gy >= LOT_D) continue
            const onMid = lineKey && (gx === midX || gy === midY)
            g[gy][gx] = onMid ? lineKey : key
          }
        }
      }
    }
    paint(EXPANSION_PADS, 't-dirt')
    paint(PLAZA, 't-plaza')
    paint(PATHS, 't-path')
    paint(ROADS, 't-road', 't-road-line')
    return g
  }

  // ── buildings ─────────────────────────────────────────────────────────────

  private buildBuildings(): void {
    for (const spec of placedBuildings()) {
      const center = gridToScreen(spec.gx + spec.fw / 2, spec.gy + spec.fd / 2)
      const container = this.add.container(center.x, center.y)
      container.setDepth(depthFor(spec.gx + spec.fw, spec.gy + spec.fd, LAYER.building))

      const outline = this.add.graphics()
      outline.setVisible(false)
      container.add(outline)

      let sprite: Phaser.GameObjects.Sprite | null = null
      let recLight: Phaser.GameObjects.Sprite | null = null
      let hitTarget: Phaser.GameObjects.GameObject

      if (spec.texKey) {
        const meta = this.texMeta(spec.texKey)

        const shadow = this.add.sprite(0, 0, 'p-shadow')
        shadow.setOrigin(0.5, 0.5)
        shadow.setScale(((spec.fw + spec.fd) / 2) * 0.9, ((spec.fw + spec.fd) / 2) * 0.5)
        shadow.setAlpha(0.45)
        container.add(shadow)

        sprite = this.add.sprite(0, 0, spec.texKey)
        sprite.setOrigin(0.5, meta.originY)
        sprite.setInteractive({ pixelPerfect: true, alphaTolerance: 1 })
        container.add(sprite)
        hitTarget = sprite

        if (spec.id === 'stage-a' || spec.id === 'stage-b') {
          const apexY = -meta.h * meta.originY + meta.h * 0.1
          recLight = this.add.sprite(meta.w * 0.16, apexY, 'p-bulb')
          recLight.setTint(K.recordingOff)
          recLight.setScale(1.2)
          container.add(recLight)
        }
      } else {
        // expansion pad — no massing, just a graded diamond + a stake
        const pad = this.add.graphics()
        this.drawFootprint(pad, spec, K.dirtEdge, true)
        pad.setInteractive(this.footprintPolygon(spec), Phaser.Geom.Polygon.Contains)
        container.add(pad)
        const stake = this.add.text(0, -14, 'FOR EXPANSION', {
          fontFamily: FONT_SANS,
          fontSize: '11px',
          color: '#6b5a3c',
        })
        stake.setOrigin(0.5, 1)
        container.add(stake)
        hitTarget = pad
      }

      const labelY = spec.texKey ? -this.texMeta(spec.texKey).h * this.texMeta(spec.texKey).originY - 12 : -34
      const label = this.makeLabel(spec.label)
      label.setPosition(0, labelY)
      label.setVisible(false)
      container.add(label)

      const view: BuildingView = { spec, container, sprite, outline, label, recLight, prodTag: null }
      this.views.set(spec.id, view)
      this.wireInteractive(hitTarget, spec.id)
    }
  }

  private footprintCorners(spec: PlacedBuilding): { x: number; y: number }[] {
    const rel = (a: number, b: number): { x: number; y: number } => ({
      x: (a - b) * hw,
      y: (a + b) * hh,
    })
    return [
      rel(-spec.fw / 2, -spec.fd / 2),
      rel(spec.fw / 2, -spec.fd / 2),
      rel(spec.fw / 2, spec.fd / 2),
      rel(-spec.fw / 2, spec.fd / 2),
    ]
  }

  private footprintPolygon(spec: PlacedBuilding): Phaser.Geom.Polygon {
    return new Phaser.Geom.Polygon(this.footprintCorners(spec).flatMap((c) => [c.x, c.y]))
  }

  private drawFootprint(
    g: Phaser.GameObjects.Graphics,
    spec: PlacedBuilding,
    color: number,
    dashed = false,
  ): void {
    const [N, E, S, W] = this.footprintCorners(spec)
    g.clear()
    if (dashed) {
      g.fillStyle(K.dirt, 0.5)
      g.fillPoints([N, E, S, W], true)
    }
    g.lineStyle(dashed ? 2 : 3, color, dashed ? 0.7 : 0.95)
    g.strokePoints([N, E, S, W], true, true)
  }

  private makeLabel(text: string): Phaser.GameObjects.Container {
    const t = this.add.text(0, 0, text, { fontFamily: FONT_SERIF, fontSize: '15px', color: '#f5ecd8' })
    t.setOrigin(0.5, 0.5)
    const padX = 9
    const bg = this.add.graphics()
    const w = t.width + padX * 2
    const h = t.height + 8
    bg.fillStyle(K.labelBg, 0.86)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 5)
    bg.lineStyle(1, K.brass, 0.7)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 5)
    return this.add.container(0, 0, [bg, t])
  }

  private wireInteractive(target: Phaser.GameObjects.GameObject, id: BuildingId): void {
    target.on('pointerover', () => {
      this.hovered = id
      this.refreshHighlights()
      if (!this.dragging) this.input.setDefaultCursor('pointer')
    })
    target.on('pointerout', () => {
      if (this.hovered === id) {
        this.hovered = null
        this.refreshHighlights()
        if (!this.dragging) this.input.setDefaultCursor('grab')
      }
    })
    target.on('pointerup', () => {
      if (this.dragMoved) return
      this.select(id)
    })
  }

  // ── landscaping ─────────────────────────────────────────────────────────────

  private buildLandscaping(): void {
    const rng = new Rng(this.snapshot.sceneSeed + ':props')
    for (const p of landscaping()) {
      const j = p.jitter ?? 0
      const gx = p.gx + (j ? rng.range(-j, j) : 0)
      const gy = p.gy + (j ? rng.range(-j, j) : 0)
      const s = gridToScreen(gx, gy)
      const spr = this.add.sprite(s.x, s.y, p.texKey)
      spr.setOrigin(0.5, this.originByKey.get(p.texKey) ?? 0.9)
      spr.setDepth(depthFor(gx, gy, LAYER.prop))
    }
  }

  // ── ambient agents ──────────────────────────────────────────────────────────

  private buildAgents(): void {
    const rng = new Rng(this.snapshot.sceneSeed + ':agents')
    const routes: Route[] = [
      [
        { gx: 8, gy: 11 },
        { gx: 10.5, gy: 11 },
        { gx: 10.5, gy: 13.5 },
        { gx: 8, gy: 13.5 },
      ],
      [
        { gx: 3, gy: 7.5 },
        { gx: 22, gy: 7.5 },
      ],
      [
        { gx: 12.5, gy: 3 },
        { gx: 12.5, gy: 17 },
      ],
      [
        { gx: 14, gy: 5 },
        { gx: 14, gy: 6.5 },
        { gx: 17, gy: 6.5 },
      ],
    ]
    for (let i = 0; i < 8; i++) {
      const route = routes[i % routes.length]
      const spr = this.add.sprite(0, 0, i % 2 ? 'p-worker2' : 'p-worker')
      spr.setOrigin(0.5, 0.94)
      this.agents.push({
        sprite: spr,
        route,
        speed: rng.range(0.6, 1.1),
        dist: rng.range(0, this.lenOf(route)),
        bob: rng.range(0, Math.PI * 2),
        kind: 'worker',
      })
    }
    const vroute: Route = [
      { gx: 12.5, gy: 17 },
      { gx: 12.5, gy: 7.5 },
      { gx: 21, gy: 7.5 },
      { gx: 12.5, gy: 7.5 },
    ]
    const veh = this.add.sprite(0, 0, 'p-vehicle')
    veh.setOrigin(0.5, 0.82)
    this.agents.push({ sprite: veh, route: vroute, speed: 2.4, dist: 0, bob: 0, kind: 'vehicle' })
  }

  private lenOf(route: Route): number {
    let v = this.routeLen.get(route)
    if (v === undefined) {
      v = 0
      for (let i = 0; i < route.length; i++) {
        const a = route[i]
        const b = route[(i + 1) % route.length]
        v += Math.hypot(b.gx - a.gx, b.gy - a.gy)
      }
      this.routeLen.set(route, v)
    }
    return v
  }

  private pointOnRoute(route: Route, dist: number): { gx: number; gy: number } {
    const total = this.lenOf(route)
    let d = ((dist % total) + total) % total
    for (let i = 0; i < route.length; i++) {
      const a = route[i]
      const b = route[(i + 1) % route.length]
      const seg = Math.hypot(b.gx - a.gx, b.gy - a.gy)
      if (d <= seg) {
        const t = seg === 0 ? 0 : d / seg
        return { gx: a.gx + (b.gx - a.gx) * t, gy: a.gy + (b.gy - a.gy) * t }
      }
      d -= seg
    }
    return route[0]
  }

  // ── camera + input ──────────────────────────────────────────────────────────

  private lotCorners(): { x: number; y: number }[] {
    return [
      gridToScreen(0, 0),
      gridToScreen(LOT_W, 0),
      gridToScreen(LOT_W, LOT_D),
      gridToScreen(0, LOT_D),
    ]
  }

  private setupCamera(): void {
    const corners = this.lotCorners()
    const minX = Math.min(...corners.map((c) => c.x)) - 500
    const minY = Math.min(...corners.map((c) => c.y)) - 400
    const maxX = Math.max(...corners.map((c) => c.x)) + 500
    const maxY = Math.max(...corners.map((c) => c.y)) + 500
    this.cameras.main.setBounds(minX, minY, maxX - minX, maxY - minY)
  }

  private setupInput(): void {
    this.input.setDefaultCursor('grab')
    this.input.mouse?.disableContextMenu()

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.dragging = true
      this.dragMoved = false
      this.dragStart = { x: p.x, y: p.y }
      this.scrollStart = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY }
      this.input.setDefaultCursor('grabbing')
    })
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.dragging) return
      const dx = p.x - this.dragStart.x
      const dy = p.y - this.dragStart.y
      if (Math.abs(dx) + Math.abs(dy) > 6) this.dragMoved = true
      const zoom = this.cameras.main.zoom
      this.cameras.main.setScroll(this.scrollStart.x - dx / zoom, this.scrollStart.y - dy / zoom)
    })
    const endDrag = (): void => {
      this.dragging = false
      this.input.setDefaultCursor(this.hovered ? 'pointer' : 'grab')
    }
    this.input.on('pointerup', endDrag)
    this.input.on('pointerupoutside', endDrag)

    this.input.on('wheel', (p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      const cam = this.cameras.main
      const before = cam.getWorldPoint(p.x, p.y)
      const next = Phaser.Math.Clamp(cam.zoom * (dy > 0 ? 0.9 : 1.1), ZOOM_MIN, ZOOM_MAX)
      cam.setZoom(next)
      const after = cam.getWorldPoint(p.x, p.y)
      cam.setScroll(cam.scrollX + (before.x - after.x), cam.scrollY + (before.y - after.y))
    })

    const kb = this.input.keyboard
    if (kb) {
      this.wasd = {
        up: kb.addKey('W'),
        down: kb.addKey('S'),
        left: kb.addKey('A'),
        right: kb.addKey('D'),
      }
      this.cursors = kb.createCursorKeys()
      kb.addKey('R').on('down', () => this.resetCamera())
    }
  }

  resetCamera(): void {
    const cam = this.cameras.main
    const corners = this.lotCorners()
    const minX = Math.min(...corners.map((c) => c.x))
    const minY = Math.min(...corners.map((c) => c.y)) - 170
    const maxX = Math.max(...corners.map((c) => c.x))
    const maxY = Math.max(...corners.map((c) => c.y)) + 120
    const zoom = Phaser.Math.Clamp(
      Math.min(this.scale.width / (maxX - minX), this.scale.height / (maxY - minY)) * 0.98,
      ZOOM_MIN,
      ZOOM_MAX,
    )
    cam.setZoom(zoom)
    cam.centerOn((minX + maxX) / 2, (minY + maxY) / 2)
  }

  // ── selection / highlight ─────────────────────────────────────────────────

  private select(id: BuildingId): void {
    this.selected = id
    this.refreshHighlights()
    const view = this.views.get(id)
    if (!view) return
    this.emitEvent({
      type: 'selected',
      buildingId: id,
      label: view.spec.label,
      blurb: view.spec.blurb,
      available: this.isAvailable(id),
      action: BUILDING_ACTION[id],
      production: this.productionFor(id),
    })
  }

  clearSelection(): void {
    this.selected = null
    this.refreshHighlights()
    this.emitEvent({ type: 'deselected' })
  }

  selectFromHost(id: BuildingId): void {
    this.select(id)
  }

  /** Host asks the lot to take a building's default navigation action. */
  triggerAction(id: BuildingId): void {
    this.emitEvent({ type: 'action', buildingId: id, action: BUILDING_ACTION[id] })
  }

  private refreshHighlights(): void {
    for (const [id, view] of this.views) {
      const isSel = id === this.selected
      const isHov = id === this.hovered
      const show = isSel || isHov
      view.outline.setVisible(show)
      if (show) this.drawFootprint(view.outline, view.spec, isSel ? K.selection : K.hover)
      view.label.setVisible(show)
      if (view.sprite) view.sprite.setY(isHov && !isSel ? -3 : 0)
    }
  }

  // ── snapshot application ────────────────────────────────────────────────────

  applySnapshot(snap: StudioLotSnapshot): void {
    this.snapshot = snap

    for (const [id, view] of this.views) {
      const available = this.isAvailable(id)
      if (view.sprite && id !== 'stage-a' && id !== 'stage-b') {
        view.sprite.setAlpha(available ? 1 : 0.5)
        view.sprite.clearTint()
        if (!available) view.sprite.setTint(0x9a927e)
      }
    }

    for (const stageId of ['stage-a', 'stage-b'] as const) {
      const view = this.views.get(stageId)
      if (view) this.setProduction(view, snap.activeProductions.find((p) => p.stageId === stageId) ?? null)
    }

    if (this.selected) {
      // refresh the panel details for the current selection under the new snapshot
      this.select(this.selected)
    } else if (snap.selectedBuildingId) {
      this.select(snap.selectedBuildingId)
    }
  }

  private setProduction(view: BuildingView, prod: ProductionCard | null): void {
    const available = this.isAvailable(view.spec.id)
    const working = !!prod && prod.active

    if (view.recLight) {
      view.recLight.setData('on', working)
      view.recLight.setTint(working ? K.recordingOn : K.recordingOff)
    }
    if (view.sprite) {
      view.sprite.clearTint()
      if (!available) {
        view.sprite.setAlpha(0.5)
        view.sprite.setTint(0x9a927e) // dark, closed stage
      } else {
        view.sprite.setAlpha(1)
        if (!working) view.sprite.setTint(0xe9e1cf) // open but idle: slightly muted
      }
    }
    if (view.prodTag) {
      view.prodTag.destroy()
      view.prodTag = null
    }
    if (prod) view.prodTag = this.makeProductionTag(view, prod)
  }

  private makeProductionTag(view: BuildingView, prod: ProductionCard): Phaser.GameObjects.Container {
    const meta = this.texMeta(view.spec.texKey)
    const topY = -meta.h * meta.originY - 14
    const w = 172
    const h = 56

    const bg = this.add.graphics()
    bg.fillStyle(K.labelBg, 0.92)
    bg.fillRoundedRect(-w / 2, -h, w, h, 6)
    bg.lineStyle(1.5, prod.active ? K.recordingOn : K.brass, 0.9)
    bg.strokeRoundedRect(-w / 2, -h, w, h, 6)
    bg.fillStyle(K.labelBg, 0.92)
    bg.fillTriangle(-6, -2, 6, -2, 0, 6)

    const title = this.add.text(-w / 2 + 11, -h + 8, prod.title, {
      fontFamily: FONT_SERIF,
      fontSize: '13px',
      color: '#f5ecd8',
    })
    const sub = this.add.text(-w / 2 + 11, -h + 27, `${prod.genre}  ·  ${prod.weeksRemaining} wks left`, {
      fontFamily: FONT_SANS,
      fontSize: '10px',
      color: '#c9bfa6',
    })
    const barW = w - 22
    const by = -13
    const bar = this.add.graphics()
    bar.fillStyle(0x000000, 0.4)
    bar.fillRoundedRect(-w / 2 + 11, by, barW, 6, 3)
    bar.fillStyle(prod.active ? K.recordingOn : K.brass, 0.95)
    bar.fillRoundedRect(-w / 2 + 11, by, Math.max(4, barW * prod.progress01), 6, 3)

    const tag = this.add.container(view.container.x, view.container.y + topY, [bg, title, sub, bar])
    tag.setDepth(LAYER.overlay + view.container.depth)
    return tag
  }

  private isAvailable(id: BuildingId): boolean {
    const b = this.snapshot.buildings.find((x) => x.id === id)
    return b ? b.available : true
  }

  private productionFor(id: BuildingId): ProductionCard | null {
    if (id !== 'stage-a' && id !== 'stage-b') return null
    return this.snapshot.activeProductions.find((p) => p.stageId === id) ?? null
  }

  // ── update loop (ambient + camera keys) ─────────────────────────────────────

  update(_time: number, delta: number): void {
    const dt = delta / 1000
    const t = this.time.now / 1000

    // smooth keyboard panning
    const cam = this.cameras.main
    let mx = 0
    let my = 0
    if (this.wasd) {
      if (this.wasd.left.isDown || this.cursors.left.isDown) mx -= 1
      if (this.wasd.right.isDown || this.cursors.right.isDown) mx += 1
      if (this.wasd.up.isDown || this.cursors.up.isDown) my -= 1
      if (this.wasd.down.isDown || this.cursors.down.isDown) my += 1
    }
    if (mx || my) {
      const sp = (520 * dt) / cam.zoom
      cam.setScroll(cam.scrollX + mx * sp, cam.scrollY + my * sp)
    }

    const busy = this.snapshot.standing === 'established' || this.snapshot.standing === 'prestige'
    const workerCount = busy ? 8 : 3

    let wi = 0
    for (const a of this.agents) {
      if (a.kind === 'worker') {
        const show = wi < workerCount
        a.sprite.setVisible(show)
        wi++
        if (!show) continue
      } else {
        a.sprite.setVisible(busy)
        if (!busy) continue
      }
      a.dist += a.speed * dt
      const pos = this.pointOnRoute(a.route, a.dist)
      const s = gridToScreen(pos.gx, pos.gy)
      const bob = a.kind === 'worker' ? Math.sin(t * 6 + a.bob) * 1.5 : 0
      a.sprite.setPosition(s.x, s.y + bob)
      a.sprite.setDepth(depthFor(pos.gx, pos.gy, LAYER.prop + 1))
    }

    for (const view of this.views.values()) {
      if (!view.recLight) continue
      if (view.recLight.getData('on')) {
        view.recLight.setAlpha(0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 4)))
      } else {
        view.recLight.setAlpha(0.45)
      }
    }
  }
}
