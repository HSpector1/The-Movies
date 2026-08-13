import Phaser from 'phaser'
import type {
  BuildingId,
  LotPersonState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from '../snapshot/StudioLotSnapshot'

const MANIFEST_URL = '/lot/hollywood/district-manifest.json'
const DISTRICT_W = 1586
const DISTRICT_H = 992
const FONT_SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif'
const FONT_SANS = 'Avenir, "Helvetica Neue", Arial, sans-serif'

type Point = { x: number; y: number }
type RoutePoint = Point & { actorDepth: number; cue: string }
type Place = {
  id: string
  buildingId: BuildingId
  label: string
  selectionPolygon: [number, number][]
  anchors: Record<string, [number, number]>
  affordances: string[]
}
type Activity = {
  id: string
  label: string
  place: string
  requiredAffordances: string[]
  requiredRoles: string[]
  visualStates: string[]
}
type RuntimeLayer = {
  id: string
  kind: 'baked' | 'occluder'
  depth: number
  output: string
  x: number
  y: number
  width: number
  height: number
}
type DistrictManifest = {
  schemaVersion: number
  districtId: string
  canvas: { width: number; height: number }
  layers: RuntimeLayer[]
  places: Place[]
  routes: Record<string, RoutePoint[]>
  activities: Activity[]
  textureMemoryBytes: number
}

export type HollywoodPlaceSelection = {
  id: string
  buildingId: BuildingId
  label: string
  affordances: string[]
}

export type HollywoodEvent =
  | { type: 'ready' }
  | { type: 'person'; person: LotPersonState | null }
  | { type: 'place'; place: HollywoodPlaceSelection }
  | { type: 'activity'; text: string | null }

export type HollywoodSceneData = {
  snapshot: StudioLotSnapshot
  onEvent: (event: HollywoodEvent) => void
  reducedMotion?: boolean
}

type MovingActor = {
  sprite: Phaser.GameObjects.Sprite
  a: Point
  b: Point
  phase: number
  speed: number
}

type RuntimePerson = {
  fact: LotPersonState
  sprite: Phaser.GameObjects.Sprite
  label: Phaser.GameObjects.Text
  /** Stable within this scene lifetime; prevents same-role people occupying one pixel. */
  homeSlot: number
}

type CosmeticRoute = {
  productionId: string
  personId: string
  elapsed: number
}

export type HollywoodPerformance = {
  fps: number
  displayObjects: number
  textureMemoryMb: number
  drawCalls: number
  frameMs: number
  worstFrameMs: number
  updateMs: number
  worstUpdateMs: number
  renderMsEstimate: number
  dynamicActors: number
}

export class HollywoodScene extends Phaser.Scene {
  private snapshot!: StudioLotSnapshot
  private emitEvent!: (event: HollywoodEvent) => void
  private manifest!: DistrictManifest
  private runtimePeople = new Map<string, RuntimePerson>()
  private ambientActors: MovingActor[] = []
  private vehicle: Phaser.GameObjects.Sprite | null = null
  private vehicleTween: Phaser.Tweens.Tween | null = null
  private reducedMotion = false
  private selectedPersonId: string | null = null
  private selectedPlaceId: string | null = null
  /**
   * A route is visual acknowledgement of an already-accepted engine transition.
   * It never owns or advances a production/task status.
   */
  private cosmeticRoute: CosmeticRoute | null = null
  private route: RoutePoint[] = []
  private activityGraphics: Phaser.GameObjects.Graphics | null = null
  private selectionGraphics: Phaser.GameObjects.Graphics | null = null
  private flash: Phaser.GameObjects.Rectangle | null = null
  private stageStateText: Phaser.GameObjects.Text | null = null
  private stageLamp: Phaser.GameObjects.Arc | null = null
  private dragOrigin: { x: number; y: number; scrollX: number; scrollY: number } | null = null
  private fitZoom = 1
  private frameSamples: number[] = []
  private updateSamples: number[] = []
  private worstFrameMs = 0
  private worstUpdateMs = 0

  init(data: HollywoodSceneData): void {
    this.snapshot = data.snapshot
    this.emitEvent = data.onEvent
    this.reducedMotion = data.reducedMotion === true
  }

  preload(): void {
    this.load.json('hollywood-manifest', MANIFEST_URL)
    this.load.image('hollywood-base', '/lot/hollywood/district-base.png')
    this.load.image('hollywood-truck', '/lot/hollywood/truck-occluder.png')
    this.load.image('hollywood-camera', '/lot/hollywood/camera-dolly-occluder.png')
    this.load.image('hollywood-gate', '/lot/hollywood/gate-foreground-occluder.png')
  }

  create(): void {
    this.manifest = this.cache.json.get('hollywood-manifest') as DistrictManifest
    this.route = this.manifest.routes['street-to-stage-7'] ?? []
    this.buildActorTextures()
    this.buildWorld()
    this.buildSemanticHotspots()
    this.buildPeople()
    this.buildAmbientLife()
    this.buildVehicle()
    this.bindCamera()
    this.applySnapshot(this.snapshot)
    this.setReducedMotion(this.reducedMotion)
    this.emitEvent({ type: 'ready' })
  }

  private buildWorld(): void {
    const textureByLayer: Record<string, string> = {
      'district-base': 'hollywood-base',
      'truck-occluder': 'hollywood-truck',
      'camera-dolly-occluder': 'hollywood-camera',
      'gate-foreground-occluder': 'hollywood-gate',
    }
    for (const layer of this.manifest.layers) {
      const texture = textureByLayer[layer.id]
      if (!texture) continue
      this.add.image(layer.x, layer.y, texture).setOrigin(0).setDepth(layer.depth).setName(`tier:${layer.id}`)
    }

    this.activityGraphics = this.add.graphics().setDepth(84).setName('tier:stateful-activity')
    this.selectionGraphics = this.add.graphics().setDepth(170).setName('tier:selection')
    this.flash = this.add.rectangle(1120, 475, 190, 130, 0xfff7d6, 0).setDepth(160)
    this.stageLamp = this.add.circle(740, 405, 9, 0x7a160f, 1).setDepth(86)
      .setStrokeStyle(3, 0xf2d6a1, 0.75)
    this.stageStateText = this.add.text(764, 392, 'STAGE 7 · AVAILABLE', {
      fontFamily: FONT_SANS,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f5e7c6',
      backgroundColor: '#1b3029dd',
      padding: { x: 9, y: 5 },
    }).setDepth(86)
  }

  private buildSemanticHotspots(): void {
    for (const place of this.manifest.places) {
      const shape = new Phaser.Geom.Polygon(place.selectionPolygon.map(([x, y]) => ({ x, y })))
      const zone = this.add.zone(0, 0, DISTRICT_W, DISTRICT_H).setOrigin(0).setDepth(150)
      zone.setInteractive(shape, Phaser.Geom.Polygon.Contains)
      zone.on('pointerover', () => this.drawPlaceOutline(place, false))
      zone.on('pointerout', () => {
        if (this.selectedPlaceId !== place.id) this.selectionGraphics?.clear()
      })
      zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation?.()
        this.selectedPlaceId = place.id
        this.drawPlaceOutline(place, true)
        this.emitEvent({
          type: 'place',
          place: { id: place.id, buildingId: place.buildingId, label: place.label, affordances: place.affordances },
        })
      })
    }
  }

  private drawPlaceOutline(place: Place, selected: boolean): void {
    if (!this.selectionGraphics) return
    this.selectionGraphics.clear()
    const points = place.selectionPolygon.map(([x, y]) => new Phaser.Math.Vector2(x, y))
    this.selectionGraphics.fillStyle(selected ? 0xd8b66a : 0xf3e4bd, selected ? 0.11 : 0.06)
    this.selectionGraphics.fillPoints(points, true)
    this.selectionGraphics.lineStyle(selected ? 5 : 3, selected ? 0xd8b66a : 0xf3e4bd, 0.92)
    this.selectionGraphics.strokePoints(points, true)
  }

  clearPlaceSelection(): void {
    this.selectedPlaceId = null
    this.selectionGraphics?.clear()
  }

  private buildPeople(): void {
    this.reconcilePeople(this.snapshot.people)
  }

  /**
   * Reconcile the narrow snapshot facts by stable person id. Hollywood owns only the
   * sprites: additions, changed display facts, and removals all follow the latest
   * authoritative snapshot without retaining a Talent or Production object.
   */
  private reconcilePeople(people: readonly LotPersonState[]): void {
    const nextById = new Map(people.map((person) => [person.id, person]))

    for (const [id, runtime] of this.runtimePeople) {
      if (nextById.has(id)) continue
      runtime.sprite.destroy()
      runtime.label.destroy()
      this.runtimePeople.delete(id)
      if (this.selectedPersonId === id) this.clearPersonSelection()
      if (this.cosmeticRoute?.personId === id) this.cosmeticRoute = null
    }

    // A fresh scene must produce the same slots even if an equivalent snapshot arrives
    // in a different array order. Existing people retain their slots across updates.
    const orderedPeople = [...people].sort(
      (a, b) => a.role.localeCompare(b.role) || a.id.localeCompare(b.id),
    )
    for (const person of orderedPeople) {
      const existing = this.runtimePeople.get(person.id)
      if (existing) {
        const nameChanged = existing.fact.name !== person.name
        const authorityChanged = existing.fact.authority !== person.authority
          || existing.fact.productionId !== person.productionId
        const roleChanged = existing.fact.role !== person.role
        const displayChanged = roleChanged
          || nameChanged
          || authorityChanged
          || existing.fact.productionTitle !== person.productionTitle

        existing.fact = person
        if (existing.label.text !== person.name) existing.label.setText(person.name)
        if (roleChanged) {
          existing.homeSlot = this.availablePersonHomeSlot(person.role, person.id)
          const p = this.personHome(person.role, existing.homeSlot)
          existing.sprite.setTexture(`hollywood-${person.role}`)
          this.placePerson(existing, p, 95)
        }
        if (this.cosmeticRoute?.personId === person.id && (roleChanged || authorityChanged)) {
          this.cosmeticRoute = null
        }
        if (displayChanged && this.selectedPersonId === person.id) {
          this.emitEvent({ type: 'person', person })
        }
        continue
      }

      const homeSlot = this.availablePersonHomeSlot(person.role, person.id)
      const p = this.personHome(person.role, homeSlot)
      const sprite = this.add.sprite(p.x, p.y, `hollywood-${person.role}`).setOrigin(0.5, 0.92).setDepth(95)
      sprite.setInteractive({ useHandCursor: true })
      sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation?.()
        this.selectPerson(person.id)
      })
      const label = this.add.text(p.x, p.y - 72, person.name, {
        fontFamily: FONT_SERIF,
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#f5e7c6',
        backgroundColor: '#10241fd9',
        padding: { x: 7, y: 4 },
      }).setOrigin(0.5, 1).setDepth(171).setVisible(false)
      this.runtimePeople.set(person.id, { fact: person, sprite, label, homeSlot })
    }
  }

  private buildAmbientLife(): void {
    const specs: Array<{ role: string; a: Point; b: Point; phase: number; speed: number }> = [
      { role: 'grip', a: { x: 388, y: 572 }, b: { x: 510, y: 516 }, phase: 0.1, speed: 0.00008 },
      { role: 'stagehand', a: { x: 486, y: 450 }, b: { x: 630, y: 420 }, phase: 0.4, speed: 0.00007 },
      { role: 'electrician', a: { x: 703, y: 446 }, b: { x: 744, y: 392 }, phase: 0.7, speed: 0.00009 },
      { role: 'camera', a: { x: 555, y: 540 }, b: { x: 610, y: 511 }, phase: 0.2, speed: 0.00006 },
      { role: 'publicity', a: { x: 1053, y: 485 }, b: { x: 1112, y: 465 }, phase: 0.65, speed: 0.00008 },
      { role: 'security', a: { x: 840, y: 717 }, b: { x: 874, y: 707 }, phase: 0.32, speed: 0.00005 },
      { role: 'extra', a: { x: 873, y: 342 }, b: { x: 922, y: 351 }, phase: 0.9, speed: 0.00004 },
      { role: 'grip', a: { x: 302, y: 661 }, b: { x: 392, y: 605 }, phase: 0.54, speed: 0.00007 },
      { role: 'stagehand', a: { x: 411, y: 432 }, b: { x: 473, y: 403 }, phase: 0.8, speed: 0.00006 },
      { role: 'publicity', a: { x: 1185, y: 502 }, b: { x: 1230, y: 480 }, phase: 0.15, speed: 0.00005 },
      { role: 'camera', a: { x: 1030, y: 498 }, b: { x: 1080, y: 484 }, phase: 0.47, speed: 0.00006 },
      { role: 'security', a: { x: 1440, y: 532 }, b: { x: 1395, y: 521 }, phase: 0.75, speed: 0.00005 },
    ]
    for (const spec of specs) {
      const sprite = this.add.sprite(spec.a.x, spec.a.y, `hollywood-${spec.role}`).setOrigin(0.5, 0.92)
      sprite.setScale(spec.role === 'extra' ? 0.82 : 0.9)
      sprite.setDepth(52 + spec.a.y / 28)
      this.ambientActors.push({ sprite, a: spec.a, b: spec.b, phase: spec.phase, speed: spec.speed })
    }
  }

  private buildVehicle(): void {
    this.vehicle = this.add.sprite(1510, 817, 'hollywood-car').setOrigin(0.5, 0.82).setDepth(96)
    this.vehicleTween = this.tweens.add({
      targets: this.vehicle,
      x: 1050,
      duration: 13000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
      hold: 5000,
      repeatDelay: 3500,
      onYoyo: () => this.vehicle?.setFlipX(true),
      onRepeat: () => this.vehicle?.setFlipX(false),
    })
    if (this.reducedMotion) this.vehicleTween.pause()
  }

  private buildActorTextures(): void {
    const roles = [
      ['director', 0x4d251b, 'fedora'],
      ['talent', 0x1f6656, 'wave'],
      ['grip', 0x35493b, 'cap'],
      ['stagehand', 0x6b4428, 'cap'],
      ['electrician', 0x314a56, 'tool'],
      ['camera', 0x2a2b2b, 'camera'],
      ['security', 0x173754, 'cap'],
      ['publicity', 0x73445d, 'flash'],
      ['extra', 0x6f5a45, 'hat'],
    ] as const
    for (const [role, color, prop] of roles) this.makePersonTexture(`hollywood-${role}`, color, prop)
    this.makeVehicleTexture()
  }

  private makePersonTexture(key: string, suit: number, prop: string): void {
    if (this.textures.exists(key)) return
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(0x000000, 0.25).fillEllipse(24, 68, 34, 9)
    g.fillStyle(0x15181a, 1).fillRoundedRect(15, 49, 8, 18, 3).fillRoundedRect(26, 49, 8, 18, 3)
    g.fillStyle(suit, 1).fillRoundedRect(11, 23, 28, 32, 6)
    g.fillStyle(0xede0c4, 1).fillTriangle(20, 23, 29, 23, 24, 37)
    g.fillStyle(suit, 1).fillRoundedRect(5, 28, 9, 27, 4).fillRoundedRect(36, 28, 9, 27, 4)
    g.fillStyle(0xd6a06f, 1).fillCircle(24, 15, 9)
    g.fillStyle(0x2a1a13, 1).fillEllipse(24, 10, 18, 8)
    if (prop === 'fedora' || prop === 'hat') {
      g.fillStyle(0x2b211c, 1).fillRoundedRect(13, 3, 22, 8, 3).fillRect(7, 9, 34, 4)
    } else if (prop === 'cap') {
      g.fillStyle(0x24323a, 1).fillEllipse(23, 8, 21, 10).fillRect(24, 9, 17, 3)
    }
    if (prop === 'camera') {
      g.fillStyle(0x111516, 1).fillRect(37, 29, 12, 10).fillCircle(49, 34, 5)
    } else if (prop === 'tool') {
      g.lineStyle(3, 0xe4bd6a, 1).lineBetween(41, 36, 48, 53)
    } else if (prop === 'flash') {
      g.fillStyle(0x181b1b, 1).fillRect(39, 31, 10, 8).fillStyle(0xffefb0, 1).fillCircle(44, 27, 4)
    } else if (prop === 'wave') {
      g.fillStyle(0xd6a06f, 1).fillCircle(44, 25, 5)
    }
    g.lineStyle(2, 0xf2e3c3, 0.48).strokeRoundedRect(11, 23, 28, 32, 6)
    g.generateTexture(key, 54, 74)
    g.destroy()
  }

  private makeVehicleTexture(): void {
    const key = 'hollywood-car'
    if (this.textures.exists(key)) return
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(0x000000, 0.3).fillEllipse(48, 37, 90, 12)
    g.fillStyle(0x11191d, 1).fillRoundedRect(3, 15, 90, 22, 10)
    g.fillStyle(0x1d292e, 1).fillRoundedRect(21, 4, 51, 23, 9)
    g.fillStyle(0xa9c0bd, 0.7).fillTriangle(28, 7, 44, 7, 44, 20).fillTriangle(49, 7, 66, 10, 66, 20)
    g.fillStyle(0x090b0c, 1).fillCircle(22, 36, 10).fillCircle(73, 36, 10)
    g.fillStyle(0xc8b36d, 1).fillCircle(5, 25, 3).fillCircle(91, 25, 3)
    g.lineStyle(2, 0xc7b47c, 0.5).strokeRoundedRect(3, 15, 90, 22, 10)
    g.generateTexture(key, 98, 49)
    g.destroy()
  }

  private bindCamera(): void {
    this.cameras.main.setBounds(-120, -90, DISTRICT_W + 240, DISTRICT_H + 180)
    this.fitCamera()
    this.scale.on('resize', () => this.fitCamera())
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _over: unknown[], _dx: number, dy: number) => {
      const camera = this.cameras.main
      camera.setZoom(Phaser.Math.Clamp(camera.zoom * (dy > 0 ? 0.91 : 1.1), this.fitZoom * 0.85, this.fitZoom * 1.85))
    })
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.dragOrigin = { x: pointer.x, y: pointer.y, scrollX: this.cameras.main.scrollX, scrollY: this.cameras.main.scrollY }
    })
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || !this.dragOrigin || pointer.getDistance() < 5) return
      this.cameras.main.scrollX = this.dragOrigin.scrollX - (pointer.x - this.dragOrigin.x) / this.cameras.main.zoom
      this.cameras.main.scrollY = this.dragOrigin.scrollY - (pointer.y - this.dragOrigin.y) / this.cameras.main.zoom
    })
    this.input.on('pointerup', () => { this.dragOrigin = null })
  }

  private fitCamera(): void {
    const camera = this.cameras.main
    this.fitZoom = Math.min(camera.width / DISTRICT_W, camera.height / DISTRICT_H)
    camera.setZoom(this.fitZoom)
    camera.centerOn(DISTRICT_W / 2, DISTRICT_H / 2)
  }

  applySnapshot(snapshot: StudioLotSnapshot): void {
    const previousStage7 = this.authoritativeStage7Operation(this.snapshot)
    this.snapshot = snapshot
    if (!this.scene.isActive()) return

    this.reconcilePeople(snapshot.people)
    const nextStage7 = this.authoritativeStage7Operation(snapshot)
    if (
      this.cosmeticRoute !== null &&
      (nextStage7 === null ||
        nextStage7.productionId !== this.cosmeticRoute.productionId ||
        nextStage7.directorId !== this.cosmeticRoute.personId ||
        nextStage7.taskStatus !== 'blocked')
    ) {
      this.cosmeticRoute = null
    }

    const acceptedDirectorDispatch =
      previousStage7 !== null &&
      nextStage7 !== null &&
      previousStage7.productionId === nextStage7.productionId &&
      previousStage7.taskStatus === 'unassigned' &&
      nextStage7.taskStatus === 'blocked'
    if (acceptedDirectorDispatch) this.beginCosmeticDirectorRoute(nextStage7)

    this.syncPeopleToAuthoritativeSnapshot(nextStage7)
    this.paintAuthoritativeStage7(nextStage7)
  }

  /** Exact Soundstage 7 only. Presentation-assigned legacy stages never qualify. */
  private authoritativeStage7Operation(
    snapshot: StudioLotSnapshot,
  ): ProductionOperationsState | null {
    if (snapshot.operationsMode !== 'managed') return null
    return snapshot.productionOperations.find(
      (operation) => operation.locationBuildingId === 'stage-a',
    ) ?? null
  }

  private availablePersonHomeSlot(role: LotPersonState['role'], personId: string): number {
    const used = new Set(
      [...this.runtimePeople.values()]
        .filter((runtime) => runtime.fact.id !== personId && runtime.fact.role === role)
        .map((runtime) => runtime.homeSlot),
    )
    let slot = 0
    while (used.has(slot)) slot++
    return slot
  }

  private personHome(role: LotPersonState['role'], slot: number): Point {
    // Four generous slots fit the authored plate; the arithmetic fallback remains
    // deterministic if a later operations milestone raises concurrency beyond four.
    const offsets: readonly Point[] = [
      { x: 0, y: 0 },
      { x: 92, y: -46 },
      { x: 184, y: 0 },
      { x: 276, y: -46 },
    ]
    const base = role === 'director' ? { x: 150, y: 806 } : { x: 1160, y: 535 }
    const offset = offsets[slot] ?? { x: (slot % 4) * 92, y: -Math.floor(slot / 4) * 82 }
    return { x: base.x + offset.x, y: base.y + offset.y }
  }

  private placePerson(runtime: RuntimePerson, point: Point, depth: number): void {
    runtime.sprite.setPosition(point.x, point.y).setDepth(depth)
    runtime.label.setPosition(point.x, point.y - 72)
  }

  /**
   * A loaded snapshot is sufficient to paint the scene. A saved blocked/ready/
   * scheduled/completed task appears at the Stage 7 destination immediately; no
   * transient route has to replay before the visible state becomes truthful.
   */
  private syncPeopleToAuthoritativeSnapshot(stage7: ProductionOperationsState | null): void {
    for (const runtime of this.runtimePeople.values()) {
      if (runtime.fact.id === this.cosmeticRoute?.personId) continue
      const home = this.personHome(runtime.fact.role, runtime.homeSlot)
      this.placePerson(runtime, home, 95)
    }
    if (stage7 === null || stage7.taskStatus === null || stage7.taskStatus === 'unassigned') return
    const director = this.runtimePeople.get(stage7.directorId)
    const destination = this.route.at(-1)
    if (director && destination) {
      this.placePerson(director, destination, destination.actorDepth)
    }
  }

  private paintAuthoritativeStage7(stage7: ProductionOperationsState | null): void {
    this.activityGraphics?.clear()
    if (stage7 === null) {
      const legacy = this.snapshot.operationsMode !== 'managed'
        ? this.snapshot.productionOperations?.find(
            (operation) => operation.locationBuildingId === 'stage-a',
          )
        : undefined
      this.stageStateText?.setText(
        legacy ? 'STAGE 7 · LEGACY DISPLAY SCHEDULE' : 'STAGE 7 · AVAILABLE',
      )
      this.stageLamp?.setFillStyle(legacy ? 0x655634 : 0x2e754f, 1)
      return
    }

    this.stageStateText?.setText(`STAGE 7 · ${stage7.statusLabel.toUpperCase()}`)
    switch (stage7.taskStatus) {
      case 'unassigned':
        this.stageLamp?.setFillStyle(0x7a160f, 1)
        break
      case 'blocked':
        this.stageLamp?.setFillStyle(0xc17c22, 1)
        this.setShootingVisual('crew-call')
        break
      case 'ready':
        this.stageLamp?.setFillStyle(0xb78b2d, 1)
        this.setShootingVisual('equipment-staged')
        break
      case 'scheduled':
        this.stageLamp?.setFillStyle(0x9b1f18, 1)
        this.setShootingVisual('take-in-progress')
        break
      case 'completed':
        this.stageLamp?.setFillStyle(0x2e754f, 1)
        this.setShootingVisual('equipment-staged')
        break
      case null:
        this.stageLamp?.setFillStyle(0x2e754f, 1)
        break
    }
  }

  private beginCosmeticDirectorRoute(operation: ProductionOperationsState): void {
    const director = this.runtimePeople.get(operation.directorId)
    const start = this.route[0]
    if (!director || director.fact.role !== 'director' || !start || this.route.length < 2) {
      this.cosmeticRoute = null
      return
    }
    director.sprite.setPosition(start.x, start.y).setDepth(start.actorDepth)
    director.label.setVisible(false)
    this.cosmeticRoute = {
      productionId: operation.productionId,
      personId: operation.directorId,
      elapsed: 0,
    }
    this.emitEvent({
      type: 'activity',
      text: `${operation.directorName} was dispatched to Soundstage 7.`,
    })
    if (this.reducedMotion) this.finishCosmeticDirectorRoute()
  }

  selectPerson(personId: string): void {
    const runtime = this.runtimePeople.get(personId)
    if (!runtime) return
    this.selectedPersonId = personId
    for (const person of this.runtimePeople.values()) {
      const selected = person.fact.id === personId
      person.label.setVisible(selected)
      person.sprite.setTint(selected ? 0xffe6a0 : 0xffffff)
    }
    this.emitEvent({ type: 'person', person: runtime.fact })
  }

  clearPersonSelection(): void {
    if (this.selectedPersonId === null) return
    this.selectedPersonId = null
    for (const person of this.runtimePeople.values()) {
      person.label.setVisible(false)
      person.sprite.setTint(0xffffff)
    }
    this.emitEvent({ type: 'person', person: null })
  }

  playPublicity(success: boolean, detail: string): void {
    if (!success) {
      this.emitEvent({ type: 'activity', text: detail })
      return
    }
    this.setActivityVisual('publicity', 'flash')
    this.emitEvent({ type: 'activity', text: detail })
    if (this.flash) {
      if (this.reducedMotion) {
        this.flash.setAlpha(0)
        return
      }
      this.flash.setAlpha(0.72)
      this.tweens.add({ targets: this.flash, alpha: 0, duration: 420, repeat: 2, repeatDelay: 210 })
    }
  }

  focus(placeId: string): void {
    const place = this.manifest.places.find((candidate) => candidate.id === placeId)
    if (!place) return
    const points = place.selectionPolygon
    const cx = points.reduce((sum, [x]) => sum + x, 0) / points.length
    const cy = points.reduce((sum, [, y]) => sum + y, 0) / points.length
    const zoom = Math.min(this.fitZoom * 1.35, this.fitZoom * 1.85)
    if (this.reducedMotion) {
      this.cameras.main.centerOn(cx, cy)
      this.cameras.main.setZoom(zoom)
      return
    }
    this.cameras.main.pan(cx, cy, 520, 'Sine.easeInOut')
    this.cameras.main.zoomTo(zoom, 520, 'Sine.easeInOut')
  }

  resetCamera(): void { this.fitCamera() }

  /** Freeze Hollywood's ambient/tweened motion while preserving every control and fact. */
  setReducedMotion(on: boolean): void {
    this.reducedMotion = on
    if (on) {
      this.vehicleTween?.pause()
      if (this.cosmeticRoute) this.finishCosmeticDirectorRoute()
      return
    }
    this.vehicleTween?.resume()
  }

  private setShootingVisual(state: string): void { this.setActivityVisual('shooting', state) }

  /** One generic activity painter proves both Shooting and Publicity read the same manifest vocabulary. */
  private setActivityVisual(activityId: string, state: string): void {
    const activity = this.manifest.activities.find((candidate) => candidate.id === activityId)
    const place = activity ? this.manifest.places.find((candidate) => candidate.id === activity.place) : undefined
    if (!activity || !place || !activity.visualStates.includes(state) || !this.activityGraphics) return
    const anchor = activityId === 'shooting' ? place.anchors.crewCall : place.anchors.photocall
    if (!anchor) return
    const [x, y] = anchor
    const g = this.activityGraphics
    g.clear()
    if (activityId === 'shooting') {
      g.fillStyle(0xffcb6b, state === 'take-in-progress' ? 0.48 : 0.24).fillEllipse(x, y, 230, 88)
      g.lineStyle(5, 0xe7c477, 0.9).lineBetween(x - 76, y + 29, x + 76, y - 28)
      g.fillStyle(0x1a2020, 1).fillCircle(x - 72, y + 28, 8).fillCircle(x + 74, y - 27, 8)
      if (state !== 'crew-call') {
        g.fillStyle(0x121919, 0.95).fillRect(x - 36, y - 21, 72, 44)
        g.lineStyle(3, 0xe2c273, 0.8).strokeRect(x - 36, y - 21, 72, 44)
      }
    } else {
      g.fillStyle(0xf7e4af, 0.23).fillEllipse(x, y, 210, 104)
      g.lineStyle(3, 0xd7b761, 0.9).strokeCircle(x, y, 43)
      g.fillStyle(0xf8eccd, 0.92).fillCircle(x, y, 8)
    }
  }

  update(_time: number, delta: number): void {
    const updateStart = performance.now()
    this.frameSamples.push(delta)
    if (this.frameSamples.length > 240) this.frameSamples.shift()
    this.worstFrameMs = Math.max(this.worstFrameMs, delta)

    if (!this.reducedMotion) {
      for (const actor of this.ambientActors) {
        actor.phase = (actor.phase + delta * actor.speed) % 1
        const t = (1 - Math.cos(actor.phase * Math.PI * 2)) / 2
        actor.sprite.x = Phaser.Math.Linear(actor.a.x, actor.b.x, t)
        actor.sprite.y = Phaser.Math.Linear(actor.a.y, actor.b.y, t) + Math.sin(actor.phase * Math.PI * 4) * 1.5
        actor.sprite.setDepth(52 + actor.sprite.y / 28)
        actor.sprite.setFlipX(actor.phase > 0.5)
      }
    }

    if (this.cosmeticRoute) this.updateCosmeticDirectorRoute(delta)

    const updateMs = performance.now() - updateStart
    this.updateSamples.push(updateMs)
    if (this.updateSamples.length > 240) this.updateSamples.shift()
    this.worstUpdateMs = Math.max(this.worstUpdateMs, updateMs)
  }

  private updateCosmeticDirectorRoute(delta: number): void {
    const routeState = this.cosmeticRoute
    if (!routeState) return
    const runtime = this.runtimePeople.get(routeState.personId)
    if (!runtime) {
      this.cosmeticRoute = null
      return
    }
    const segmentDuration = 1300
    routeState.elapsed += delta
    const rawSegment = routeState.elapsed / segmentDuration
    const seg = Math.min(this.route.length - 2, Math.floor(rawSegment))
    const local = Phaser.Math.Clamp(rawSegment - seg, 0, 1)
    const a = this.route[seg]!
    const b = this.route[seg + 1]!
    const eased = Phaser.Math.Easing.Sine.InOut(local)
    runtime.sprite.setPosition(Phaser.Math.Linear(a.x, b.x, eased), Phaser.Math.Linear(a.y, b.y, eased))
    runtime.sprite.setDepth(local < 0.52 ? a.actorDepth : b.actorDepth)
    runtime.sprite.setFlipX(b.x < a.x)
    if (rawSegment >= this.route.length - 1) {
      this.finishCosmeticDirectorRoute()
    }
  }

  private finishCosmeticDirectorRoute(): void {
    const routeState = this.cosmeticRoute
    const destination = this.route.at(-1)
    const runtime = routeState ? this.runtimePeople.get(routeState.personId) : undefined
    if (!routeState || !destination || !runtime) {
      this.cosmeticRoute = null
      return
    }
    this.placePerson(runtime, destination, destination.actorDepth)
    this.cosmeticRoute = null
    this.emitEvent({
      type: 'activity',
      text: `${runtime.fact.name} reached Soundstage 7. The engine-reported production status is unchanged.`,
    })
  }

  performanceStats(): HollywoodPerformance {
    const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
    const frameMs = average(this.frameSamples)
    const updateMs = average(this.updateSamples)
    const renderer = this.game.renderer as unknown as { drawCount?: number }
    return {
      fps: Math.round(this.game.loop.actualFps || (frameMs ? 1000 / frameMs : 0)),
      displayObjects: this.children.length,
      textureMemoryMb: Math.round((this.manifest.textureMemoryBytes / 1024 / 1024) * 10) / 10,
      drawCalls: renderer.drawCount ?? 0,
      frameMs: Math.round(frameMs * 100) / 100,
      worstFrameMs: Math.round(this.worstFrameMs * 100) / 100,
      updateMs: Math.round(updateMs * 100) / 100,
      worstUpdateMs: Math.round(this.worstUpdateMs * 100) / 100,
      renderMsEstimate: Math.round(Math.max(0, frameMs - updateMs) * 100) / 100,
      dynamicActors: this.ambientActors.length + this.runtimePeople.size + (this.vehicle ? 1 : 0),
    }
  }


  debugState(): {
    selectedPersonId: string | null
    selectedPlaceId: string | null
    stage7Operation: ProductionOperationsState | null
    routeProductionId: string | null
    manifestId: string
    routeDepths: number[]
  } {
    return {
      selectedPersonId: this.selectedPersonId,
      selectedPlaceId: this.selectedPlaceId,
      stage7Operation: this.authoritativeStage7Operation(this.snapshot),
      routeProductionId: this.cosmeticRoute?.productionId ?? null,
      manifestId: this.manifest.districtId,
      routeDepths: this.route.map((point) => point.actorDepth),
    }
  }
}
