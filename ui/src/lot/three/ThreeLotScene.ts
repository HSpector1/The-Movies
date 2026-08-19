// ── ThreeLotScene — the real-3D world renderer (Visual Tycoon Conversion Spike) ─
//
// A third world renderer behind the SAME seam the tycoon grid and the Hollywood
// plate stand behind: the host hands it a StudioLotSnapshot and receives semantic
// events; it owns no simulation rule, no GameState, no save. It consumes the SAME
// Phaser-free world model the 2D grid consumes — composeWorldBuildings, presence
// stands, zoning, dressing inventories, playback beats — so the two renderers can
// never disagree about WHAT stands on the property, only about how it is drawn.
//
// Laws carried over verbatim from the shipped renderer:
//   • presentation reacts to truth and never creates it — no timer, tween or frame
//     advances any task, production or build;
//   • deterministic: zero Math.random, zero Date.now in world composition — every
//     position derives from the snapshot, gridHash/gridNoise or the sceneSeed Rng;
//     the frame clock drives COSMETIC interpolation only (as the 2D scene's does);
//   • fail-neutral: a record the snapshot cannot account for produces no body;
//   • everything visible belongs to a system: named people stand at engine-claimed
//     sites, crews appear only where the engine publishes hot stages, construction
//     or freight, and nothing outside the wall is addressable;
//   • the camera keeps the tycoon grammar: wheel zoom at cursor inside the same
//     ZOOM_MIN..ZOOM_MAX band, drag pan, named framings, selection never zooms.

import {
  AmbientLight,
  Clock,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PCFSoftShadowMap,
  Plane,
  Raycaster,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  ACESFilmicToneMapping,
} from 'three'
import type { StudioLotSnapshot, BuildingId, LotPersonState, LotPlacedFacilityState } from '../snapshot/StudioLotSnapshot'
import { composeWorldBuildings, worldBounds, type WorldBuilding } from '../tycoon/buildings.ts'
import {
  CAMERA_FRAMINGS,
  PERSON_HOME,
  PERSON_HOME_JITTER,
  ZOOM_MAX,
  ZOOM_MIN,
  backlotDressing,
  establishedDressing,
  gridHash,
  landscaping,
  personHomeSlotOffset,
  type GridPoint,
} from '../tycoon/world.ts'
import { presenceStands, type PresencePersonHome, type PresenceStand } from '../tycoon/presence.ts'
import { PLAYBACK_DURATION_MS, personPositionAt } from '../tycoon/playback.ts'
import { lotBodyTheaterStates, lotSceneryHauls } from '../snapshot/weekTheater.ts'
import { lotPeopleForCompanyPresentation } from '../snapshot/productionCompany.ts'
import { Rng } from '../scene/rng.ts'
import { CAMERA_OFFSET_DIR, CAMERA_DISTANCE_M, SUN_OFFSET_DIR, TILE_M, gridToWorld, orthoHalfWidth } from './iso3d.ts'
import { buildMaterials, disposeMaterials, warm, type MaterialLedger } from './materials3d.ts'
import { BuildingFactory } from './buildings3d.ts'
import { PropFactory } from './props3d.ts'
import { CrewFactory, type CrewFigure, type CrewRole, type WorkingPose } from './crew3d.ts'
import { WebGLRenderer } from 'three'
import { WARM } from '../tycoon/palette.ts'

export type ThreeLotEvent =
  | { type: 'ready' }
  | { type: 'failure'; reason: 'scene-create-failed' | 'renderer-context-lost' }
  | { type: 'building'; buildingId: BuildingId }
  | { type: 'person'; person: LotPersonState | null }

export type ThreeLotSceneOptions = {
  parent: HTMLElement
  snapshot: StudioLotSnapshot
  onEvent: (e: ThreeLotEvent) => void
  reducedMotion?: boolean
}

type FigureRuntime = {
  figure: CrewFigure
  stand: PresenceStand
  fact: LotPersonState | null
}

export class ThreeLotScene {
  private readonly opts: ThreeLotSceneOptions
  private renderer: WebGLRenderer
  private readonly scene = new Scene()
  private readonly camera: OrthographicCamera
  private readonly clock = new Clock()
  private readonly materials: MaterialLedger
  private readonly buildingFactory: BuildingFactory
  private readonly propFactory: PropFactory
  private readonly crewFactory: CrewFactory
  private readonly sun: DirectionalLight

  private snapshot: StudioLotSnapshot
  private lotW = 28
  private lotD = 26
  private buildings: WorldBuilding[] = []

  // scene graph slots — static rebuilt on structural change, dynamic every snapshot
  private groundSlot: { group: Group; dispose: () => void } | null = null
  private surroundSlot: Group | null = null
  private wallSlot: Group | null = null
  private buildingSlot = new Group()
  private dressingSlot = new Group()
  private theaterSlot = new Group()
  private peopleSlot = new Group()
  private structuralSignature = ''

  // camera state, in tycoon terms: a grid centre and an absolute zoom
  private camCentre: GridPoint = { ...CAMERA_FRAMINGS.overview.at }
  private camZoom = 1
  private viewW = 2
  private viewH = 2

  // presentation-only runtime
  private figures: FigureRuntime[] = []
  private playback: { startMs: number; speed: number; week: number } | null = null
  private nowMs = 0
  private reducedMotion: boolean
  private inputSuspended = false
  private destroyed = false
  private readyEmitted = false
  private selectionRing: Mesh
  private raycaster = new Raycaster()
  private fpsSamples: number[] = []
  private resizeObserver: ResizeObserver
  private disposers: Array<() => void> = []

  constructor(opts: ThreeLotSceneOptions) {
    this.opts = opts
    this.snapshot = opts.snapshot
    this.reducedMotion = opts.reducedMotion === true

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.12
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFSoftShadowMap
    this.renderer.domElement.style.display = 'block'
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    opts.parent.appendChild(this.renderer.domElement)
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost)

    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 2_000)
    this.materials = buildMaterials()
    this.buildingFactory = new BuildingFactory(this.materials)
    this.propFactory = new PropFactory(this.materials)
    this.crewFactory = new CrewFactory()

    // one warm key light + valley sky fill — the palette's own single-sun law
    this.sun = new DirectionalLight(warm(0xffe3b8), 2.35)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(4096, 4096)
    this.sun.shadow.bias = -0.0004
    this.sun.shadow.normalBias = 0.03
    this.scene.add(this.sun)
    this.scene.add(this.sun.target)
    const sky = new HemisphereLight(warm(0xf3e4c2), warm(0x8f7f5f), 0.85)
    this.scene.add(sky)
    this.scene.add(new AmbientLight(warm(WARM.haze), 0.22))

    this.scene.add(this.buildingSlot)
    this.scene.add(this.dressingSlot)
    this.scene.add(this.theaterSlot)
    this.scene.add(this.peopleSlot)

    const ringGeo = new RingGeometry(0.9, 1, 40)
    this.selectionRing = new Mesh(ringGeo, new MeshBasicMaterial({ color: warm(WARM.selection), transparent: true, opacity: 0.85 }))
    this.selectionRing.rotation.x = -Math.PI / 2
    this.selectionRing.position.y = 0.06
    this.selectionRing.visible = false
    this.scene.add(this.selectionRing)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(opts.parent)

    try {
      this.applySnapshot(this.snapshot)
      this.resize()
      this.applyCameraPreset('overview')
      this.bindInput()
      this.renderer.setAnimationLoop(this.frame)
    } catch {
      this.opts.onEvent({ type: 'failure', reason: 'scene-create-failed' })
      return
    }

    // crew art loads async; the world stands without it and adopts it on arrival
    const baseUrl = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
    void this.crewFactory.load(baseUrl).then(() => {
      if (this.destroyed) return
      this.rebuildPeople()
      this.rebuildTheater()
      this.emitReadyOnce()
    })
    // never hold the host hostage to an asset fetch
    setTimeout(() => this.emitReadyOnce(), 6_000)
  }

  private emitReadyOnce(): void {
    if (this.readyEmitted || this.destroyed) return
    this.readyEmitted = true
    this.opts.onEvent({ type: 'ready' })
  }

  private onContextLost = (): void => {
    if (this.destroyed) return
    this.opts.onEvent({ type: 'failure', reason: 'renderer-context-lost' })
  }

  // ── snapshot application: the ONE engine-state entry point ─────────────────
  applySnapshot(snapshot: StudioLotSnapshot): void {
    this.snapshot = snapshot
    const bounds = worldBounds(snapshot)
    this.lotW = bounds.width
    this.lotD = bounds.depth
    this.buildings = composeWorldBuildings(snapshot)

    const signature = JSON.stringify(
      this.buildings.map((b) => [b.buildingId, b.gx, b.gy, b.fw, b.fd, b.texKey, b.status]),
    )
    if (signature !== this.structuralSignature) {
      this.structuralSignature = signature
      this.rebuildStatic()
      this.rebuildBuildings()
      this.rebuildDressing()
    }
    this.rebuildTheater()
    this.rebuildPeople()
  }

  private async rebuildStatic(): Promise<void> {
    const { buildGround, buildPerimeterWall, buildSurround } = await import('./environment3d.ts')
    if (this.destroyed) return
    if (this.groundSlot !== null) {
      this.scene.remove(this.groundSlot.group)
      this.groundSlot.dispose()
    }
    this.groundSlot = buildGround(this.lotW, this.lotD, this.buildings)
    this.scene.add(this.groundSlot.group)
    if (this.surroundSlot === null) {
      this.surroundSlot = buildSurround(this.lotW, this.lotD, this.materials)
      this.scene.add(this.surroundSlot)
    }
    if (this.wallSlot !== null) this.scene.remove(this.wallSlot)
    const gate = this.buildings.find((b) => b.placeId === 'studio-gate')
    this.wallSlot = buildPerimeterWall(this.lotW, this.lotD, this.materials, gate)
    this.scene.add(this.wallSlot)

    // aim the sun and its shadow box at the property it lights
    const centre = gridToWorld(this.lotW / 2, this.lotD / 2)
    this.sun.position.copy(centre.clone().add(SUN_OFFSET_DIR.clone().multiplyScalar(260)))
    this.sun.target.position.copy(centre)
    const half = Math.max(this.lotW, this.lotD) * TILE_M * 0.85
    this.sun.shadow.camera.left = -half
    this.sun.shadow.camera.right = half
    this.sun.shadow.camera.top = half
    this.sun.shadow.camera.bottom = -half
    this.sun.shadow.camera.near = 10
    this.sun.shadow.camera.far = 600
    this.sun.shadow.camera.updateProjectionMatrix()
  }

  private clearGroup(group: Group): void {
    for (const child of [...group.children]) group.remove(child)
  }

  private rebuildBuildings(): void {
    this.clearGroup(this.buildingSlot)
    const placementById = new Map<number, LotPlacedFacilityState>()
    for (const p of this.snapshot.placement?.placements ?? []) placementById.set(p.id, p)
    for (const building of this.buildings) {
      let body: Group
      if (building.status === 'underConstruction') {
        const placement = building.placedFacilityId !== null ? placementById.get(building.placedFacilityId) : undefined
        body = this.buildingFactory.construction(building.fw, building.fd, placement?.progress01 ?? 0)
      } else {
        body = this.buildingFactory.make(building)
      }
      const centre = gridToWorld(building.gx + building.fw / 2, building.gy + building.fd / 2)
      body.position.copy(centre)
      body.userData.buildingId = building.buildingId
      body.userData.label = building.label
      this.buildingSlot.add(body)
    }
  }

  /** Landscaping + backlot + established dressing, through the SAME inventories. */
  private rebuildDressing(): void {
    this.clearGroup(this.dressingSlot)
    const occupied = new Set<string>()
    for (const b of this.buildings) {
      for (let gx = Math.floor(b.gx); gx < b.gx + b.fw; gx++) {
        for (let gy = Math.floor(b.gy); gy < b.gy + b.fd; gy++) occupied.add(`${gx}:${gy}`)
      }
    }
    const seed = this.snapshot.sceneSeed ?? 'lot'
    const placements = [...landscaping(), ...backlotDressing(), ...establishedDressing()]
    placements.forEach((prop, i) => {
      // dressing yields to real bodies — it may never make ground look taken
      if (occupied.has(`${Math.floor(prop.gx)}:${Math.floor(prop.gy)}`)) return
      const body =
        this.buildingFactory.makeLargeProp(prop.texKey, '') ?? this.propFactory.make(prop.texKey)
      if (body === null) return
      const rng = new Rng(`${seed}:prop3d:${i}:${prop.texKey}`)
      const j = prop.jitter ?? 0
      const at = gridToWorld(prop.gx + rng.range(-j, j), prop.gy + rng.range(-j, j))
      body.position.copy(at)
      const vehicle = /sedan|car|truck|van|trailer|crane/.test(prop.texKey)
      body.rotation.y = vehicle
        ? (Math.round(gridHash(prop.gx, prop.gy, 47) * 4) * Math.PI) / 2 + rng.range(-0.06, 0.06)
        : rng.range(0, Math.PI * 2)
      this.dressingSlot.add(body)
    })
  }

  /** Crews, equipment and freight where the ENGINE says work is happening. */
  private rebuildTheater(): void {
    this.clearGroup(this.theaterSlot)
    const byId = new Map(this.buildings.map((b) => [b.buildingId, b]))
    const states = lotBodyTheaterStates(this.snapshot)
    const seed = this.snapshot.sceneSeed ?? 'lot'

    for (const b of this.buildings) {
      const lamp = this.buildingSlot.children.find((c) => c.userData.buildingId === b.buildingId)
        ?.userData.hotLamp as Mesh | undefined
      if (lamp !== undefined) lamp.visible = false
    }

    for (const state of states) {
      const building = byId.get(state.buildingId)
      if (building === undefined) continue
      const work = building.anchors['work'] ?? building.anchors['crewCall']
      if (work === undefined) continue
      const body = this.buildingSlot.children.find((c) => c.userData.buildingId === building.buildingId)
      const lamp = body?.userData.hotLamp as Mesh | undefined
      if (lamp !== undefined) lamp.visible = state.hot

      if (state.hot) {
        // a shooting company: director, camera, grip, electric — at the apron
        const cluster: Array<[CrewRole, WorkingPose, number, number]> = [
          ['director', 'direct', -1.6, 0.4],
          ['camera', 'operate', -0.4, 0.9],
          ['grip', 'haul', 1.4, 0.5],
          ['electric', 'operate', 2.4, -0.3],
          ['pa', 'wait', 0.6, 1.8],
        ]
        cluster.forEach(([role, pose, dx, dy], k) => {
          const fig = this.crewFactory.person(role, gridHash(work.gx + dx, work.gy + dy, 91 + k) * 1_000, pose)
          const at = gridToWorld(work.gx + dx * 0.45, work.gy + dy * 0.45)
          fig.root.position.copy(at)
          fig.root.rotation.y = Math.atan2(work.gx + dx * 0.45 - (building.gx + building.fw / 2), work.gy + dy * 0.45 - (building.gy + building.fd / 2)) + Math.PI
          this.theaterSlot.add(fig.root)
        })
        if (this.crewFactory.loaded) {
          const cam = this.crewFactory.prop('Prop_StudioCamera.glb')
          if (cam !== null) {
            cam.position.copy(gridToWorld(work.gx - 0.4 * 0.45, work.gy + 0.9 * 0.45 + 0.28))
            cam.rotation.y = Math.PI
            this.theaterSlot.add(cam)
          }
          const chair = this.crewFactory.prop('Prop_DirectorsChair.glb')
          if (chair !== null) {
            chair.position.copy(gridToWorld(work.gx - 2.2 * 0.45, work.gy + 1.1 * 0.45))
            this.theaterSlot.add(chair)
          }
        }
        const rig = this.propFactory.make('tw-arcrig')
        if (rig !== null) {
          rig.position.copy(gridToWorld(work.gx + 1.4, work.gy - 0.6))
          rig.rotation.y = Math.PI * 0.75
          this.theaterSlot.add(rig)
        }
      }

      if (state.building) {
        // a build in progress: carpenters and maintenance at the fence line
        const crew: Array<[CrewRole, WorkingPose, number]> = [
          ['craft', 'carry', 0],
          ['maintenance', 'haul', 1],
          ['pa', 'wait', 2],
        ]
        for (const [role, pose, k] of crew) {
          const fig = this.crewFactory.person(role, gridHash(work.gx, work.gy, 131 + k) * 1_000, pose)
          fig.root.position.copy(gridToWorld(work.gx + (k - 1) * 0.6, work.gy + 0.5 + gridHash(work.gx, k, 133) * 0.4))
          fig.root.rotation.y = Math.PI + (k - 1) * 0.4
          this.theaterSlot.add(fig.root)
        }
        const lumber = this.propFactory.make('tw-lumber')
        if (lumber !== null) {
          lumber.position.copy(gridToWorld(work.gx - 1.2, work.gy + 1.1))
          this.theaterSlot.add(lumber)
        }
      }
    }

    // freight: a haul the engine published stands as a loaded truck at its destination
    const rngHaul = new Rng(`${seed}:haul3d`)
    for (const haul of lotSceneryHauls(this.snapshot)) {
      const to = byId.get(haul.to)
      if (to === undefined) continue
      const service = to.anchors['service'] ?? to.anchors['work']
      if (service === undefined) continue
      const truck = this.propFactory.make('tw-boxtruck')
      if (truck === null) continue
      truck.position.copy(gridToWorld(service.gx + rngHaul.range(-0.3, 0.3), service.gy + 1.1))
      truck.rotation.y = Math.PI / 2
      this.theaterSlot.add(truck)
      const crate = this.propFactory.make('tw-crate')
      if (crate !== null) {
        crate.position.copy(gridToWorld(service.gx + 1.1, service.gy + 1.3))
        this.theaterSlot.add(crate)
      }
    }
  }

  /** Named people at the stands the engine's own presence projection claims. */
  private rebuildPeople(): void {
    this.clearGroup(this.peopleSlot)
    this.figures = []
    const people = lotPeopleForCompanyPresentation(this.snapshot)
    const seed = this.snapshot.sceneSeed ?? 'lot'
    const homes = new Map<string, PresencePersonHome>()
    const slotByRole = new Map<string, number>()
    const factById = new Map<string, LotPersonState>()
    for (const person of people) {
      const slot = slotByRole.get(person.role) ?? 0
      slotByRole.set(person.role, slot + 1)
      const base = PERSON_HOME[person.role]
      const offset = personHomeSlotOffset(slot)
      const rng = new Rng(`${seed}:person-home:${person.id}`)
      homes.set(person.id, {
        role: person.role,
        home: {
          gx: base.gx + offset.gx + rng.range(-PERSON_HOME_JITTER, PERSON_HOME_JITTER),
          gy: base.gy + offset.gy + rng.range(-PERSON_HOME_JITTER, PERSON_HOME_JITTER),
        },
      })
      factById.set(person.id, person)
    }
    const beat = this.snapshot.presence?.staticBeat ?? 5
    const stands = presenceStands(
      this.snapshot.presence,
      this.snapshot.placement?.placements ?? [],
      homes,
      beat,
      this.buildings,
    )
    const creativeById = new Map<string, string>()
    for (const p of this.snapshot.presence?.people ?? []) creativeById.set(p.talentId, p.creativeRole)
    for (const stand of stands) {
      const fact = factById.get(stand.talentId) ?? null
      const creative = creativeById.get(stand.talentId)
      const role: CrewRole =
        creative === 'director' ? 'director'
        : creative === 'writer' ? 'writer'
        : creative === 'craft' ? 'craft'
        : fact?.role === 'director' ? 'director'
        : 'actor'
      const pose: WorkingPose = stand.stance === 'waiting' ? 'wait' : 'stand'
      const figure = this.crewFactory.person(role, gridHash(stand.destination?.gx ?? 3, stand.destination?.gy ?? 3, 61) * 1_000 + stand.talentId.length, pose)
      const at = stand.destination ?? stand.path[0] ?? { gx: 3, gy: 3 }
      figure.root.position.copy(gridToWorld(at.gx, at.gy))
      figure.root.rotation.y = gridHash(at.gx, at.gy, 63) * Math.PI * 2
      figure.root.userData.personFact = fact
      this.peopleSlot.add(figure.root)
      this.figures.push({ figure, stand, fact })
    }
  }

  // ── the witnessed week (Class-B presentation, engine beats only) ────────────
  playPresenceWeek(week: number): boolean {
    if (this.reducedMotion) return false
    if (this.snapshot.presence?.week !== week) return false
    if (this.figures.length === 0) return false
    this.playback = { startMs: this.nowMs, speed: 1, week }
    return true
  }

  setPlaybackSpeed(speed: number): boolean {
    if (this.playback === null) return false
    this.playback.speed = Math.max(0.25, Math.min(4, speed))
    return true
  }

  skipPresencePlayback(): boolean {
    if (this.playback === null) return false
    this.playback = null
    this.rebuildPeople()
    return true
  }

  // ── camera: tycoon grammar on an orthographic frustum ───────────────────────
  centerOnGrid(gx: number, gy: number, zoom: number): void {
    this.camCentre = { gx, gy }
    this.camZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))
    this.updateCamera()
  }

  applyCameraPreset(preset: string): void {
    const framing = (CAMERA_FRAMINGS as Record<string, { at: GridPoint; scale: number }>)[preset]
    if (framing === undefined) return
    this.centerOnGrid(framing.at.gx, framing.at.gy, this.fitZoom() * framing.scale)
  }

  resetCamera(): void {
    this.applyCameraPreset('overview')
  }

  /** The zoom that fits the whole property — same definition the 2D world uses. */
  private fitZoom(): number {
    const extentW = (this.lotW + this.lotD) * 64 + 840
    const extentH = (this.lotW + this.lotD) * 32 + 640
    const fit = Math.min(this.viewW / extentW, this.viewH / extentH)
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, fit))
  }

  private updateCamera(): void {
    const halfW = orthoHalfWidth(this.viewW, this.camZoom)
    const halfH = halfW * (this.viewH / this.viewW)
    this.camera.left = -halfW
    this.camera.right = halfW
    this.camera.top = halfH
    this.camera.bottom = -halfH
    const target = gridToWorld(this.camCentre.gx, this.camCentre.gy)
    this.camera.position.copy(target.clone().add(CAMERA_OFFSET_DIR.clone().multiplyScalar(CAMERA_DISTANCE_M)))
    this.camera.lookAt(target)
    this.camera.updateProjectionMatrix()
  }

  private resize(): void {
    const rect = this.opts.parent.getBoundingClientRect()
    this.viewW = Math.max(2, rect.width)
    this.viewH = Math.max(2, rect.height)
    this.renderer.setPixelRatio(Math.min(2, globalThis.devicePixelRatio ?? 1))
    this.renderer.setSize(this.viewW, this.viewH, false)
    this.updateCamera()
  }

  // ── input: canvas-target events only (shift law 7) ──────────────────────────
  private dragging: { x: number; y: number } | null = null
  private bindInput(): void {
    const el = this.renderer.domElement
    const down = (e: PointerEvent): void => {
      if (this.inputSuspended || e.target !== el) return
      this.dragging = { x: e.clientX, y: e.clientY }
      el.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent): void => {
      if (this.dragging === null || this.inputSuspended) return
      const dx = e.clientX - this.dragging.x
      const dy = e.clientY - this.dragging.y
      this.dragging = { x: e.clientX, y: e.clientY }
      this.panByScreenPixels(dx, dy)
    }
    const up = (e: PointerEvent): void => {
      const wasDrag = this.dragging !== null
      this.dragging = null
      if (this.inputSuspended || e.target !== el || !wasDrag) return
    }
    const click = (e: MouseEvent): void => {
      if (this.inputSuspended || e.target !== el) return
      this.pick(e)
    }
    const wheel = (e: WheelEvent): void => {
      if (this.inputSuspended || e.target !== el) return
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      this.zoomAtPointer(factor, e)
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('click', click)
    el.addEventListener('wheel', wheel, { passive: false })
    this.disposers.push(() => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('click', click)
      el.removeEventListener('wheel', wheel)
    })
  }

  private panByScreenPixels(dxPx: number, dyPx: number): void {
    // screen right = (+gx, −gy)/√2, screen down = (+gx, +gy)·sin-corrected — derive
    // both from the camera's own basis so the math can never drift from the view.
    const mPerPx = orthoHalfWidth(this.viewW, this.camZoom) / (this.viewW / 2)
    const right = new Vector3(1, 0, -1).normalize()
    const downDir = new Vector3(1, 0, 1).normalize().multiplyScalar(2) // 30° foreshortening: ground distance is 2× screen px
    const delta = right
      .multiplyScalar(-dxPx * mPerPx)
      .add(downDir.multiplyScalar(-dyPx * mPerPx))
    this.camCentre = {
      gx: this.camCentre.gx + delta.x / TILE_M,
      gy: this.camCentre.gy + delta.z / TILE_M,
    }
    this.updateCamera()
  }

  private groundPointAt(e: { clientX: number; clientY: number }): Vector3 | null {
    const rect = this.renderer.domElement.getBoundingClientRect()
    const ndc = new Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    )
    this.raycaster.setFromCamera(ndc, this.camera)
    const hit = new Vector3()
    const ok = this.raycaster.ray.intersectPlane(new Plane(new Vector3(0, 1, 0), 0), hit)
    return ok === null ? null : hit
  }

  private zoomAtPointer(factor: number, e: WheelEvent): void {
    const before = this.groundPointAt(e)
    this.camZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, this.camZoom * factor))
    this.updateCamera()
    const after = this.groundPointAt(e)
    if (before !== null && after !== null) {
      this.camCentre = {
        gx: this.camCentre.gx + (before.x - after.x) / TILE_M,
        gy: this.camCentre.gy + (before.z - after.z) / TILE_M,
      }
      this.updateCamera()
    }
  }

  private pick(e: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect()
    const ndc = new Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    )
    this.raycaster.setFromCamera(ndc, this.camera)
    const people = this.raycaster.intersectObjects(this.peopleSlot.children, true)
    if (people.length > 0) {
      let node: Object3D | null = people[0].object
      while (node !== null && node.userData.personFact === undefined) node = node.parent
      const fact = (node?.userData.personFact ?? null) as LotPersonState | null
      if (fact !== null) {
        this.opts.onEvent({ type: 'person', person: fact })
        return
      }
    }
    const hits = this.raycaster.intersectObjects(this.buildingSlot.children, true)
    if (hits.length === 0) return
    let node: Object3D | null = hits[0].object
    while (node !== null && node.userData.buildingId === undefined) node = node.parent
    if (node === null) return
    this.selectFromHost(node.userData.buildingId as BuildingId)
    this.opts.onEvent({ type: 'building', buildingId: node.userData.buildingId as BuildingId })
  }

  // ── host command surface (parity with the grid world where the spike reaches) ─
  selectFromHost(id: BuildingId): void {
    const building = this.buildings.find((b) => b.buildingId === id)
    if (building === undefined) return
    const centre = gridToWorld(building.gx + building.fw / 2, building.gy + building.fd / 2)
    this.selectionRing.position.set(centre.x, 0.06, centre.z)
    this.selectionRing.scale.setScalar((Math.max(building.fw, building.fd) / 2 + 0.6) * TILE_M)
    this.selectionRing.visible = true
  }

  clearPlaceSelection(): void {
    this.selectionRing.visible = false
  }

  setReducedMotion(on: boolean): void {
    this.reducedMotion = on
    if (on) this.playback = null
  }

  setInputSuspended(on: boolean): void {
    this.inputSuspended = on
    if (on) this.dragging = null
  }

  failClosedFromHost(): void {
    this.destroy()
  }

  performanceStats(): {
    frameSampleCount: number
    fps: number
    displayObjects: number
    drawCalls: number
    textureMemoryBytes: number
  } {
    let objects = 0
    this.scene.traverse(() => objects++)
    const fps =
      this.fpsSamples.length === 0
        ? 0
        : Math.round(1_000 / (this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length))
    return {
      frameSampleCount: this.fpsSamples.length,
      fps,
      displayObjects: objects,
      drawCalls: this.renderer.info.render.calls,
      textureMemoryBytes: this.renderer.info.memory.textures,
    }
  }

  // ── the frame: cosmetics only — nothing here advances any truth ─────────────
  private frame = (): void => {
    if (this.destroyed) return
    const dt = this.clock.getDelta()
    this.nowMs += dt * 1_000
    if (this.fpsSamples.push(dt * 1_000) > 120) this.fpsSamples.shift()

    if (this.playback !== null && !this.reducedMotion) {
      const elapsed = (this.nowMs - this.playback.startMs) * this.playback.speed
      if (elapsed >= PLAYBACK_DURATION_MS) {
        this.playback = null
        this.rebuildPeople()
      } else {
        for (const runtime of this.figures) {
          const pos = personPositionAt(runtime.stand.beats, runtime.stand.path, elapsed)
          runtime.figure.root.position.copy(gridToWorld(pos.at.gx, pos.at.gy))
          if (pos.moving) {
            runtime.figure.root.rotation.y = Math.atan2(pos.heading.dgx, pos.heading.dgy)
            CrewFactory.walk(runtime.figure, (this.nowMs / 620) % 1)
          }
        }
      }
    }

    // selection ring breathes gently — acknowledged, never load-bearing
    if (this.selectionRing.visible && !this.reducedMotion) {
      const pulse = 1 + Math.sin(this.nowMs / 420) * 0.03
      this.selectionRing.scale.setScalar(this.selectionRing.scale.x * 0.995 + this.selectionRing.scale.x * pulse * 0.005)
    }

    this.renderer.render(this.scene, this.camera)
  }

  pause(): void {
    this.renderer.setAnimationLoop(null)
  }

  resume(): void {
    if (!this.destroyed) this.renderer.setAnimationLoop(this.frame)
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.renderer.setAnimationLoop(null)
    this.resizeObserver.disconnect()
    for (const dispose of this.disposers) dispose()
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost)
    this.scene.traverse((node) => {
      const mesh = node as Mesh
      if (mesh.isMesh) mesh.geometry?.dispose()
    })
    this.groundSlot?.dispose()
    disposeMaterials(this.materials)
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
