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
  BufferGeometry,
  CircleGeometry,
  Clock,
  CylinderGeometry,
  DirectionalLight,
  DynamicDrawUsage,
  Euler,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  OrthographicCamera,
  PCFSoftShadowMap,
  Plane,
  PointLight,
  Quaternion,
  Raycaster,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  ACESFilmicToneMapping,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
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
  gridNoise,
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
import { buildAtmosphere, type AtmosphereBuild } from './atmosphere3d.ts'

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
  role: CrewRole
  pose: WorkingPose
  phase: number
}

type ActivityFigureRuntime = {
  figure: CrewFigure
  role: CrewRole
  pose: WorkingPose
  phase: number
}

const CREW_ROLE_COLOUR: Record<CrewRole, number> = {
  director: 0x643d31,
  actor: 0x9a665d,
  writer: 0x59656a,
  craft: 0x8a6840,
  grip: 0x505c47,
  electric: 0xa17432,
  camera: 0x394e5e,
  maintenance: 0x59624b,
  office: 0x62536c,
  pa: 0x6b6970,
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
  private readonly atmosphere: AtmosphereBuild

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
  private environmentSignature = ''
  private staticGeneration = 0

  // camera state, in tycoon terms: a grid centre and an absolute zoom
  private camCentre: GridPoint = { ...CAMERA_FRAMINGS.overview.at }
  private camZoom = 1
  private camTarget: GridPoint = { ...CAMERA_FRAMINGS.overview.at }
  private camTargetZoom = 1
  private camYaw = 0
  private camTargetYaw = 0
  private cameraInitialised = false
  private viewW = 2
  private viewH = 2

  // presentation-only runtime
  private figures: FigureRuntime[] = []
  private activityFigures: ActivityFigureRuntime[] = []
  private buildingBatchGeometries: BufferGeometry[] = []
  private dressingBatchGeometries: BufferGeometry[] = []
  private theaterBatchGeometries: BufferGeometry[] = []
  private wallBatchGeometries: BufferGeometry[] = []
  private readonly activitySpillGeometry = new CircleGeometry(1, 40)
  private readonly activitySpillMaterial = new MeshBasicMaterial({
    color: 0xffd68a,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  })
  private readonly crewShadowGeometry = new CircleGeometry(0.38, 14)
  private readonly crewShadowMaterial = new MeshBasicMaterial({
    color: 0x211a13,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  })
  private crewShadowMesh: InstancedMesh | null = null
  private readonly crewLodBodyGeometry = new CylinderGeometry(0.19, 0.27, 0.78, 7)
  private readonly crewLodHeadGeometry = new SphereGeometry(0.17, 8, 6)
  private readonly crewLodLegGeometry = new CylinderGeometry(0.075, 0.09, 0.68, 6)
  private readonly crewLodArmGeometry = new CylinderGeometry(0.06, 0.065, 0.64, 6)
  private readonly crewLodHatBrimGeometry = new CylinderGeometry(0.23, 0.23, 0.04, 10)
  private readonly crewLodHatCrownGeometry = new CylinderGeometry(0.13, 0.15, 0.16, 10)
  private readonly crewLodBodyMaterial = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.88 })
  private readonly crewLodHeadMaterial = new MeshStandardMaterial({ color: 0xc59a78, roughness: 0.84 })
  private readonly crewLodLegMaterial = new MeshStandardMaterial({ color: 0x413e3b, roughness: 0.9 })
  private readonly crewLodHatMaterial = new MeshStandardMaterial({ color: 0x3b352f, roughness: 0.88 })
  private crewLodBodyMesh: InstancedMesh | null = null
  private crewLodHeadMesh: InstancedMesh | null = null
  private crewLodLegMesh: InstancedMesh | null = null
  private crewLodArmMesh: InstancedMesh | null = null
  private crewLodHatBrimMesh: InstancedMesh | null = null
  private crewLodHatCrownMesh: InstancedMesh | null = null
  private playback: { startMs: number; speed: number; week: number } | null = null
  private nowMs = 0
  private reducedMotion: boolean
  private inputSuspended = false
  private destroyed = false
  private readyEmitted = false
  private selectedBuildingId: BuildingId | null = null
  private selectionBaseScale = 1
  private selectionRing: Mesh
  private guidanceTarget: BuildingId | null = null
  private guidanceBaseScale = 1
  private guidanceRing: Mesh
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
    this.renderer.toneMappingExposure = 0.98
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
    this.crewShadowGeometry.rotateX(-Math.PI / 2)
    this.crewLodBodyGeometry.translate(0, 0.96, 0)
    this.crewLodHeadGeometry.translate(0, 1.52, 0)

    this.atmosphere = buildAtmosphere(this.renderer)
    this.scene.background = this.atmosphere.fog.color
    this.scene.fog = this.atmosphere.fog
    this.scene.environment = this.atmosphere.environment.texture
    this.scene.add(this.atmosphere.sky)

    // One warm key plus a cooler sky / warm-ground fill.  The split keeps the period
    // afternoon while preserving colour and detail in faces that turn away from sun.
    this.sun = new DirectionalLight(warm(0xffe4bd), 2.15)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(2048, 2048)
    this.sun.shadow.bias = -0.00018
    this.sun.shadow.normalBias = 0.055
    this.scene.add(this.sun)
    this.scene.add(this.sun.target)
    const sky = new HemisphereLight(warm(0xcbd9d8), warm(0x806d50), 0.88)
    this.scene.add(sky)
    this.scene.add(new AmbientLight(warm(0xd8ccb5), 0.16))

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

    const guidanceGeo = new RingGeometry(0.9, 1, 40)
    this.guidanceRing = new Mesh(guidanceGeo, new MeshBasicMaterial({
      color: warm(0xffcc66),
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    }))
    this.guidanceRing.rotation.x = -Math.PI / 2
    this.guidanceRing.position.y = 0.045
    this.guidanceRing.visible = false
    this.scene.add(this.guidanceRing)

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

    const placementProgress = new Map<number, number>()
    for (const placed of snapshot.placement?.placements ?? []) {
      placementProgress.set(placed.id, placed.progress01)
    }

    const buildingRecords = this.buildings.map((b) => [
          b.buildingId,
          b.gx,
          b.gy,
          b.fw,
          b.fd,
          b.texKey,
          b.status,
          b.placedFacilityId === null ? null : placementProgress.get(b.placedFacilityId) ?? null,
        ])
    const signature = JSON.stringify([this.lotW, this.lotD, ...buildingRecords])
    const environmentSignature = JSON.stringify([
      this.lotW,
      this.lotD,
      ...buildingRecords.map((record) => record.slice(0, -1)),
    ])
    if (signature !== this.structuralSignature) {
      this.structuralSignature = signature
      if (environmentSignature !== this.environmentSignature) {
        this.environmentSignature = environmentSignature
        void this.rebuildStatic().catch(() => {
          if (!this.destroyed) this.opts.onEvent({ type: 'failure', reason: 'scene-create-failed' })
        })
        this.rebuildDressing()
      }
      this.rebuildBuildings()
    }
    this.rebuildTheater()
    this.rebuildPeople()
  }

  private async rebuildStatic(): Promise<void> {
    const generation = ++this.staticGeneration
    const { buildGround, buildPerimeterWall, buildSurround } = await import('./environment3d.ts')
    if (this.destroyed || generation !== this.staticGeneration) return
    const physicalBuildings = this.buildings.filter((building) => this.hasPhysicalBody(building))
    const nextGround = buildGround(this.lotW, this.lotD, physicalBuildings)
    const nextSurround = buildSurround(this.lotW, this.lotD, this.materials)
    const gate = physicalBuildings.find((b) => b.placeId === 'studio-gate')
    const nextWall = buildPerimeterWall(this.lotW, this.lotD, this.materials, gate)
    const nextWallGeometries = this.batchStaticMeshes(nextWall)
    if (this.destroyed || generation !== this.staticGeneration) {
      nextGround.dispose()
      for (const geometry of nextWallGeometries) geometry.dispose()
      return
    }
    if (this.groundSlot !== null) {
      this.scene.remove(this.groundSlot.group)
      this.groundSlot.dispose()
    }
    this.groundSlot = nextGround
    this.scene.add(this.groundSlot.group)
    if (this.surroundSlot !== null) this.scene.remove(this.surroundSlot)
    this.surroundSlot = nextSurround
    this.scene.add(this.surroundSlot)
    if (this.wallSlot !== null) this.scene.remove(this.wallSlot)
    for (const geometry of this.wallBatchGeometries) geometry.dispose()
    this.wallBatchGeometries = nextWallGeometries
    this.wallSlot = nextWall
    this.scene.add(this.wallSlot)

    // aim the sun and its shadow box at the property it lights
    const centre = gridToWorld(this.lotW / 2, this.lotD / 2)
    this.sun.position.copy(centre.clone().add(SUN_OFFSET_DIR.clone().multiplyScalar(260)))
    this.sun.target.position.copy(centre)
    const half = Math.max(this.lotW, this.lotD) * TILE_M * 0.72
    this.sun.shadow.camera.left = -half
    this.sun.shadow.camera.right = half
    this.sun.shadow.camera.top = half
    this.sun.shadow.camera.bottom = -half
    this.sun.shadow.camera.near = 10
    this.sun.shadow.camera.far = 600
    this.sun.shadow.camera.updateProjectionMatrix()
  }

  /** A parcel is addressable ground, not a building body. */
  private hasPhysicalBody(building: WorldBuilding): boolean {
    return !(building.role === 'parcel' && building.texKey.length === 0 && building.status === null)
  }

  private clearGroup(group: Group): void {
    for (const child of [...group.children]) group.remove(child)
  }

  private rebuildBuildings(): void {
    for (const geometry of this.buildingBatchGeometries) geometry.dispose()
    this.buildingBatchGeometries = []
    this.clearGroup(this.buildingSlot)
    const placementById = new Map<number, LotPlacedFacilityState>()
    for (const p of this.snapshot.placement?.placements ?? []) placementById.set(p.id, p)
    for (const building of this.buildings) {
      if (!this.hasPhysicalBody(building)) continue
      let body: Group
      if (building.status === 'underConstruction') {
        const placement = building.placedFacilityId !== null ? placementById.get(building.placedFacilityId) : undefined
        body = this.buildingFactory.construction(building.fw, building.fd, placement?.progress01 ?? 0)
      } else {
        body = this.buildingFactory.make(building)
      }
      const dynamicParts = [
        body.userData.hotOpenDoor,
        body.userData.hotClosedDoor,
        body.userData.hotLamp,
      ].filter((part): part is Object3D => part instanceof Object3D)
      this.buildingBatchGeometries.push(...this.batchStaticMeshes(body, dynamicParts))
      const centre = gridToWorld(building.gx + building.fw / 2, building.gy + building.fd / 2)
      body.position.copy(centre)
      body.userData.buildingId = building.buildingId
      body.userData.label = building.label
      this.buildingSlot.add(body)
    }
    if (this.selectedBuildingId !== null) this.selectFromHost(this.selectedBuildingId)
    if (this.guidanceTarget !== null) this.setGuidanceTarget(this.guidanceTarget)
  }

  /** Landscaping + backlot + established dressing, through the SAME inventories. */
  private rebuildDressing(): void {
    for (const geometry of this.dressingBatchGeometries) geometry.dispose()
    this.dressingBatchGeometries = []
    this.clearGroup(this.dressingSlot)
    const occupied = new Set<string>()
    for (const b of this.buildings) {
      if (!this.hasPhysicalBody(b)) continue
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
        ? (Math.round(gridNoise(prop.gx, prop.gy, 47) * 4) * Math.PI) / 2 + rng.range(-0.06, 0.06)
        : rng.range(0, Math.PI * 2)
      this.dressingSlot.add(body)
    })
    this.dressingBatchGeometries = this.batchStaticMeshes(this.dressingSlot)
  }

  /** Collapse non-interactive procedural meshes by shared material + vertex layout. */
  private batchStaticMeshes(root: Group, dynamicParts: readonly Object3D[] = []): BufferGeometry[] {
    root.updateMatrixWorld(true)
    for (const part of dynamicParts) {
      if (part.parent !== root) root.attach(part)
    }
    root.updateMatrixWorld(true)
    const dynamic = new Set(dynamicParts)
    const belongsToDynamicPart = (node: Object3D): boolean => {
      let cursor: Object3D | null = node
      while (cursor !== null && cursor !== root) {
        if (dynamic.has(cursor)) return true
        cursor = cursor.parent
      }
      return false
    }
    const source: Array<Mesh<BufferGeometry, Material>> = []
    let supported = true
    root.traverse((node) => {
      const mesh = node as Mesh
      if (!mesh.isMesh || belongsToDynamicPart(node)) return
      const kind = mesh as Mesh & { isSkinnedMesh?: boolean; isInstancedMesh?: boolean }
      if (kind.isSkinnedMesh === true || kind.isInstancedMesh === true || Array.isArray(mesh.material)) {
        supported = false
        return
      }
      source.push(mesh as Mesh<BufferGeometry, Material>)
    })
    if (!supported || source.length < 2) return []

    type Bucket = {
      material: Material
      geometries: BufferGeometry[]
      castShadow: boolean
      receiveShadow: boolean
    }
    const buckets = new Map<string, Bucket>()
    for (const mesh of source) {
      const attributes = Object.entries(mesh.geometry.attributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, attribute]) =>
          `${name}:${attribute.itemSize}:${String(attribute.normalized)}:${attribute.array.constructor.name}`,
        )
        .join('|')
      const key = `${mesh.material.uuid}:${mesh.geometry.index === null ? 'plain' : 'indexed'}:${attributes}`
      let bucket = buckets.get(key)
      if (bucket === undefined) {
        bucket = {
          material: mesh.material,
          geometries: [],
          castShadow: false,
          receiveShadow: false,
        }
      }
      const geometry = mesh.geometry.clone()
      geometry.applyMatrix4(mesh.matrixWorld)
      bucket.geometries.push(geometry)
      bucket.castShadow ||= mesh.castShadow
      bucket.receiveShadow ||= mesh.receiveShadow
      buckets.set(key, bucket)
    }

    const mergedGeometries: BufferGeometry[] = []
    const mergedMeshes: Mesh[] = []
    for (const bucket of buckets.values()) {
      const merged = mergeGeometries(bucket.geometries, false)
      for (const geometry of bucket.geometries) geometry.dispose()
      if (merged === null) continue
      const mesh = new Mesh(merged, bucket.material)
      mesh.castShadow = bucket.castShadow
      mesh.receiveShadow = bucket.receiveShadow
      mergedGeometries.push(merged)
      mergedMeshes.push(mesh)
    }
    if (mergedMeshes.length === 0) return []
    for (const child of [...root.children]) {
      if (!dynamic.has(child)) root.remove(child)
    }
    for (const mesh of mergedMeshes) root.add(mesh)
    return mergedGeometries
  }

  /** Crews, equipment and freight where the ENGINE says work is happening. */
  private rebuildTheater(): void {
    for (const geometry of this.theaterBatchGeometries) geometry.dispose()
    this.theaterBatchGeometries = []
    this.clearGroup(this.theaterSlot)
    this.activityFigures = []
    const byId = new Map(this.buildings.map((b) => [b.buildingId, b]))
    const states = lotBodyTheaterStates(this.snapshot)
    const seed = this.snapshot.sceneSeed ?? 'lot'

    const addFigure = (
      role: CrewRole,
      pose: WorkingPose,
      gx: number,
      gy: number,
      yaw: number,
      salt: number,
    ): CrewFigure => {
      const figure = this.crewFactory.person(role, gridHash(gx, gy, salt) * 10_000, pose)
      figure.root.position.copy(gridToWorld(gx, gy))
      figure.root.rotation.y = yaw
      // A restrained tycoon exaggeration: a person remains readable without becoming
      // a giant or changing any authoritative footprint.
      figure.root.scale.setScalar(1.14)
      this.theaterSlot.add(figure.root)
      this.activityFigures.push({
        figure,
        role,
        pose,
        phase: gridNoise(gx, gy, salt + 503),
      })
      return figure
    }

    const placeAsset = (
      file: Parameters<CrewFactory['prop']>[0],
      gx: number,
      gy: number,
      yaw = 0,
      scale = 1,
    ): Object3D | null => {
      const prop = this.crewFactory.prop(file)
      if (prop === null) return null
      prop.position.copy(gridToWorld(gx, gy))
      prop.rotation.y = yaw
      prop.scale.setScalar(scale)
      this.theaterSlot.add(prop)
      return prop
    }

    for (const b of this.buildings) {
      const body = this.buildingSlot.children.find((c) => c.userData.buildingId === b.buildingId)
      const lamp = body?.userData.hotLamp as Mesh | undefined
      if (lamp !== undefined) lamp.visible = false
      const openDoor = body?.userData.hotOpenDoor as Group | undefined
      const closedDoor = body?.userData.hotClosedDoor as Group | undefined
      if (openDoor !== undefined) openDoor.visible = false
      if (closedDoor !== undefined) closedDoor.visible = true
    }

    for (const state of states) {
      const building = byId.get(state.buildingId)
      if (building === undefined) continue
      const work = building.anchors['work'] ?? building.anchors['crewCall']
      if (work === undefined) continue
      const body = this.buildingSlot.children.find((c) => c.userData.buildingId === building.buildingId)
      const lamp = body?.userData.hotLamp as Mesh | undefined
      if (lamp !== undefined) lamp.visible = state.hot
      const openDoor = body?.userData.hotOpenDoor as Group | undefined
      const closedDoor = body?.userData.hotClosedDoor as Group | undefined
      if (openDoor !== undefined) openDoor.visible = state.hot
      if (closedDoor !== undefined) closedDoor.visible = !state.hot

      if (state.hot) {
        const centre = { gx: building.gx + building.fw / 2, gy: building.gy + building.fd / 2 }
        const faceBuilding = (gx: number, gy: number): number =>
          Math.atan2(gx - centre.gx, gy - centre.gy) + Math.PI
        const filming = this.snapshot.activeProductions.some(
          (production) => production.stageId === building.buildingId && production.active,
        )

        if (filming) {
          // The compact exterior unit reads as a working picture at management zoom:
          // identifiable jobs, camera, light, grip plant, set pieces and a warm door spill.
          const director = addFigure('director', 'direct', work.gx - 1.08, work.gy + 0.82, faceBuilding(work.gx - 1.08, work.gy + 0.82), 91)
          addFigure('camera', 'operate', work.gx - 0.38, work.gy + 1.18, faceBuilding(work.gx - 0.38, work.gy + 1.18), 92)
          const grip = addFigure('grip', 'haul', work.gx + 1.18, work.gy + 0.92, faceBuilding(work.gx + 1.18, work.gy + 0.92), 93)
          addFigure('electric', 'operate', work.gx + 1.48, work.gy - 0.08, faceBuilding(work.gx + 1.48, work.gy - 0.08), 94)
          const pa = addFigure('pa', 'wait', work.gx - 0.82, work.gy + 1.72, faceBuilding(work.gx - 0.82, work.gy + 1.72), 95)
          addFigure('actor', 'stand', work.gx + 0.28, work.gy + 1.82, faceBuilding(work.gx + 0.28, work.gy + 1.82), 96)
          this.crewFactory.attach(director, 'Prop_Megaphone_attach_hand_r.glb', 'handR')
          this.crewFactory.attach(pa, 'Prop_Slate_attach_hand_l.glb', 'handL')
          this.crewFactory.attach(grip, 'Prop_Boom_attach_hand_r.glb', 'handR')

          placeAsset('Prop_StudioCamera.glb', work.gx + 0.1, work.gy + 1.05, Math.PI, 1.12)
          placeAsset('Prop_DirectorsChair.glb', work.gx - 1.12, work.gy + 1.12, Math.PI * 0.9)
          placeAsset('Prop_Fresnel.glb', work.gx + 1.32, work.gy - 0.05, Math.PI * 0.72, 1.08)
          placeAsset('Prop_CStand.glb', work.gx + 1.45, work.gy + 0.72, Math.PI * 0.7)
          placeAsset('Prop_CableReel.glb', work.gx + 1.18, work.gy + 1.3, Math.PI * 0.35)
          for (let i = 0; i < 3; i++) {
            placeAsset('Prop_AppleBox_Full.glb', work.gx - 1.18 + i * 0.22, work.gy + 1.55, i * 0.35)
          }

          const flats = this.propFactory.make('tw-flats')
          if (flats !== null) {
            flats.position.copy(gridToWorld(work.gx + 2.0, work.gy + 0.92))
            flats.rotation.y = Math.PI * 0.35
            this.theaterSlot.add(flats)
          }
          const generator = this.propFactory.make('tw-genset')
          if (generator !== null) {
            generator.position.copy(gridToWorld(work.gx + 1.95, work.gy - 0.22))
            generator.rotation.y = Math.PI / 2
            this.theaterSlot.add(generator)
          }

          const spill = new Mesh(this.activitySpillGeometry, this.activitySpillMaterial)
          spill.rotation.x = -Math.PI / 2
          spill.position.copy(gridToWorld(work.gx + 0.2, work.gy + 0.45, 0.035))
          spill.scale.set(5.4, 3.0, 1)
          spill.renderOrder = 2
          this.theaterSlot.add(spill)
          const workLight = new PointLight(0xffd79a, 72, 18, 2)
          workLight.position.copy(gridToWorld(work.gx + 0.2, work.gy + 0.35, 3.4))
          this.theaterSlot.add(workLight)
        } else {
          // A held/hot stage can be rehearsal.  It gets a company, not a false camera unit.
          addFigure('director', 'direct', work.gx - 0.55, work.gy + 0.72, faceBuilding(work.gx - 0.55, work.gy + 0.72), 101)
          addFigure('actor', 'stand', work.gx + 0.18, work.gy + 0.86, faceBuilding(work.gx + 0.18, work.gy + 0.86), 102)
          addFigure('actor', 'stand', work.gx + 0.72, work.gy + 1.18, faceBuilding(work.gx + 0.72, work.gy + 1.18), 103)
          addFigure('pa', 'wait', work.gx - 0.72, work.gy + 1.42, faceBuilding(work.gx - 0.72, work.gy + 1.42), 104)
        }
      }

      if (state.building) {
        // A build in progress: explicit trades, material handling and plant, all gated
        // by the engine's construction subject rather than ambient decoration.
        const crew: Array<[CrewRole, WorkingPose, number, number]> = [
          ['craft', 'carry', -0.75, 0.75],
          ['maintenance', 'haul', 0.05, 1.08],
          ['craft', 'operate', 0.72, 0.6],
          ['pa', 'wait', -0.25, 1.62],
        ]
        for (const [index, [role, pose, dx, dy]] of crew.entries()) {
          addFigure(role, pose, work.gx + dx, work.gy + dy, Math.PI, 131 + index)
        }
        const siteProps: Array<[string, number, number, number]> = [
          ['tw-lumber', -1.35, 1.2, 0],
          ['tw-pallets', 1.12, 1.25, 0.3],
          ['tw-drums', 1.48, 0.25, 0],
          ['tw-barrier', -0.9, 1.9, 0.15],
          ['tw-crane', 1.65, 1.65, -0.65],
        ]
        for (const [key, dx, dy, yaw] of siteProps) {
          const prop = this.propFactory.make(key)
          if (prop === null) continue
          prop.position.copy(gridToWorld(work.gx + dx, work.gy + dy))
          prop.rotation.y = yaw
          this.theaterSlot.add(prop)
        }
      }
    }

    // Freight follows the exact published origin/destination and settled progress.
    const rngHaul = new Rng(`${seed}:haul3d`)
    for (const haul of lotSceneryHauls(this.snapshot)) {
      const to = byId.get(haul.to)
      if (to === undefined) continue
      const service = to.anchors['service'] ?? to.anchors['work']
      if (service === undefined) continue
      const truck = this.propFactory.make('tw-boxtruck')
      if (truck === null) continue
      const from = haul.from === null ? undefined : byId.get(haul.from)
      const origin = from?.anchors['service'] ?? from?.anchors['work'] ?? {
        gx: service.gx - 1.8,
        gy: service.gy + 2.2,
      }
      const destination = { gx: service.gx, gy: service.gy + 1.1 }
      const progress = Math.min(1, Math.max(0, haul.progress01))
      const lateral = rngHaul.range(-0.12, 0.12)
      const gx = origin.gx + (destination.gx - origin.gx) * progress + lateral
      const gy = origin.gy + (destination.gy - origin.gy) * progress - lateral
      truck.position.copy(gridToWorld(gx, gy))
      truck.rotation.y = Math.atan2(destination.gx - origin.gx, destination.gy - origin.gy)
      this.theaterSlot.add(truck)
      const crate = progress >= 0.7 ? this.propFactory.make('tw-cratestack') : null
      if (crate !== null && progress >= 0.7) {
        crate.position.copy(gridToWorld(service.gx + 1.1, service.gy + 1.3))
        this.theaterSlot.add(crate)
      }
    }
    const dynamicTheaterParts: Object3D[] = this.activityFigures.map((runtime) => runtime.figure.root)
    for (const child of this.theaterSlot.children) {
      if (child instanceof PointLight) dynamicTheaterParts.push(child)
    }
    this.theaterBatchGeometries = this.batchStaticMeshes(this.theaterSlot, dynamicTheaterParts)
    this.syncCrewShadows()
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
      figure.root.rotation.y = gridNoise(at.gx, at.gy, 63) * Math.PI * 2
      figure.root.userData.personFact = fact
      this.peopleSlot.add(figure.root)
      this.figures.push({
        figure,
        stand,
        fact,
        role,
        pose,
        phase: gridNoise(at.gx, at.gy, 607),
      })
    }
    this.syncCrewShadows()
  }

  /** One cheap grounded contact pass replaces hundreds of skinned shadow draws. */
  private syncCrewShadows(): void {
    if (this.crewShadowMesh !== null) this.scene.remove(this.crewShadowMesh)
    const count = this.figures.length + this.activityFigures.length
    if (count === 0) {
      this.crewShadowMesh = null
      this.syncCrewLod()
      return
    }
    const shadows = new InstancedMesh(this.crewShadowGeometry, this.crewShadowMaterial, count)
    shadows.name = 'crew contact shadows'
    shadows.renderOrder = 1
    shadows.frustumCulled = false
    shadows.instanceMatrix.setUsage(DynamicDrawUsage)
    this.crewShadowMesh = shadows
    this.scene.add(shadows)
    this.updateCrewShadows()
    this.syncCrewLod()
  }

  /** Management zoom uses two instanced silhouette draws; inspection zoom restores GLBs. */
  private syncCrewLod(): void {
    for (const mesh of [
      this.crewLodBodyMesh,
      this.crewLodHeadMesh,
      this.crewLodLegMesh,
      this.crewLodArmMesh,
      this.crewLodHatBrimMesh,
      this.crewLodHatCrownMesh,
    ]) {
      if (mesh !== null) this.scene.remove(mesh)
    }
    const runtimes = [...this.figures, ...this.activityFigures]
    if (runtimes.length === 0) {
      this.crewLodBodyMesh = null
      this.crewLodHeadMesh = null
      this.crewLodLegMesh = null
      this.crewLodArmMesh = null
      this.crewLodHatBrimMesh = null
      this.crewLodHatCrownMesh = null
      return
    }
    const bodies = new InstancedMesh(this.crewLodBodyGeometry, this.crewLodBodyMaterial, runtimes.length)
    const heads = new InstancedMesh(this.crewLodHeadGeometry, this.crewLodHeadMaterial, runtimes.length)
    const legs = new InstancedMesh(this.crewLodLegGeometry, this.crewLodLegMaterial, runtimes.length * 2)
    const arms = new InstancedMesh(this.crewLodArmGeometry, this.crewLodBodyMaterial, runtimes.length * 2)
    const hatBrims = new InstancedMesh(this.crewLodHatBrimGeometry, this.crewLodHatMaterial, runtimes.length)
    const hatCrowns = new InstancedMesh(this.crewLodHatCrownGeometry, this.crewLodHatMaterial, runtimes.length)
    bodies.name = 'management-distance crew bodies'
    heads.name = 'management-distance crew heads'
    legs.name = 'management-distance crew legs'
    arms.name = 'management-distance crew arms'
    hatBrims.name = 'management-distance crew hat brims'
    hatCrowns.name = 'management-distance crew hat crowns'
    for (const mesh of [bodies, heads, legs, arms, hatBrims, hatCrowns]) {
      mesh.castShadow = false
      mesh.receiveShadow = true
      mesh.frustumCulled = false
      mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    }
    runtimes.forEach((runtime, index) => {
      const colour = warm(CREW_ROLE_COLOUR[runtime.role])
      bodies.setColorAt(index, colour)
      arms.setColorAt(index * 2, colour)
      arms.setColorAt(index * 2 + 1, colour)
    })
    this.crewLodBodyMesh = bodies
    this.crewLodHeadMesh = heads
    this.crewLodLegMesh = legs
    this.crewLodArmMesh = arms
    this.crewLodHatBrimMesh = hatBrims
    this.crewLodHatCrownMesh = hatCrowns
    this.scene.add(bodies)
    this.scene.add(heads)
    this.scene.add(legs)
    this.scene.add(arms)
    this.scene.add(hatBrims)
    this.scene.add(hatCrowns)
    this.updateCrewLod()
  }

  /** Returns whether the detailed rig tier is visible this frame. */
  private updateCrewLod(): boolean {
    const detailed = this.camZoom >= 0.86
    const runtimes = [...this.figures, ...this.activityFigures]
    for (const runtime of runtimes) runtime.figure.root.visible = detailed
    const lodMeshes = [
      this.crewLodBodyMesh,
      this.crewLodHeadMesh,
      this.crewLodLegMesh,
      this.crewLodArmMesh,
      this.crewLodHatBrimMesh,
      this.crewLodHatCrownMesh,
    ]
    if (lodMeshes.some((mesh) => mesh === null)) return detailed
    for (const mesh of lodMeshes) if (mesh !== null) mesh.visible = !detailed
    if (detailed) return true

    const matrix = new Matrix4()
    const rootPosition = new Vector3()
    const partPosition = new Vector3()
    const scale = new Vector3()
    const localRotation = new Quaternion()
    const worldRotation = new Quaternion()
    const localEuler = new Euler()
    const setPart = (
      mesh: InstancedMesh | null,
      index: number,
      runtime: FigureRuntime | ActivityFigureRuntime,
      x: number,
      y: number,
      z: number,
      rx: number,
      rz: number,
      partScale = 1,
    ): void => {
      if (mesh === null) return
      partPosition.set(x, y, z).applyQuaternion(runtime.figure.root.quaternion).add(rootPosition)
      localEuler.set(rx, 0, rz)
      localRotation.setFromEuler(localEuler)
      worldRotation.copy(runtime.figure.root.quaternion).multiply(localRotation)
      scale.setScalar(runtime.figure.root.scale.x * partScale)
      matrix.compose(partPosition, worldRotation, scale)
      mesh.setMatrixAt(index, matrix)
    }
    runtimes.forEach((runtime, index) => {
      const figureScale = runtime.figure.root.scale.x
      const bob = this.reducedMotion
        ? 0
        : Math.sin(this.nowMs / 520 + runtime.phase * Math.PI * 2) * 0.025
      const stride = this.reducedMotion
        ? 0
        : Math.sin(this.nowMs / 470 + runtime.phase * Math.PI * 2)
      rootPosition.set(runtime.figure.root.position.x, bob, runtime.figure.root.position.z)
      scale.setScalar(figureScale)
      matrix.compose(rootPosition, runtime.figure.root.quaternion, scale)
      this.crewLodBodyMesh?.setMatrixAt(index, matrix)
      this.crewLodHeadMesh?.setMatrixAt(index, matrix)
      setPart(this.crewLodLegMesh, index * 2, runtime, -0.11, 0.38, 0, stride * 0.1, 0)
      setPart(this.crewLodLegMesh, index * 2 + 1, runtime, 0.11, 0.38, 0, -stride * 0.1, 0)
      const directLift = runtime.pose === 'direct' ? -1.05 : 0
      setPart(this.crewLodArmMesh, index * 2, runtime, -0.27, 1.04, 0, -stride * 0.08, -0.18)
      setPart(this.crewLodArmMesh, index * 2 + 1, runtime, 0.27, 1.04, 0, stride * 0.08, 0.18 + directLift)
      const hasHat = runtime.role !== 'actor' && runtime.role !== 'office'
      setPart(this.crewLodHatBrimMesh, index, runtime, 0, 1.69, 0, 0, 0, hasHat ? 1 : 0)
      setPart(this.crewLodHatCrownMesh, index, runtime, 0, 1.79, 0, 0, 0, hasHat ? 1 : 0)
    })
    for (const mesh of lodMeshes) if (mesh !== null) mesh.instanceMatrix.needsUpdate = true
    return false
  }

  private updateCrewShadows(): void {
    if (this.crewShadowMesh === null) return
    const figures = [
      ...this.figures.map((runtime) => runtime.figure),
      ...this.activityFigures.map((runtime) => runtime.figure),
    ]
    const matrix = new Matrix4()
    const position = new Vector3()
    const scale = new Vector3(1, 1, 0.62)
    figures.forEach((figure, index) => {
      position.set(figure.root.position.x, 0.035, figure.root.position.z)
      matrix.compose(position, figure.root.quaternion, scale)
      this.crewShadowMesh?.setMatrixAt(index, matrix)
    })
    this.crewShadowMesh.instanceMatrix.needsUpdate = true
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
    this.camTarget = this.clampCameraCentre({ gx, gy })
    this.camTargetZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))
    if (!this.cameraInitialised) {
      this.camCentre = { ...this.camTarget }
      this.camZoom = this.camTargetZoom
      this.cameraInitialised = true
    }
    this.updateCamera()
  }

  applyCameraPreset(preset: string): void {
    const framing = (CAMERA_FRAMINGS as Record<string, { at: GridPoint; scale: number }>)[preset]
    if (framing === undefined) return
    this.camTargetYaw = 0
    this.centerOnGrid(framing.at.gx, framing.at.gy, this.fitZoom() * framing.scale)
  }

  /** A bounded quarter-turn is useful when a tall foreground building hides a worksite. */
  rotateCameraQuarter(direction: -1 | 1): void {
    this.camTargetYaw += direction * (Math.PI / 2)
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

  private clampCameraCentre(point: GridPoint): GridPoint {
    const margin = 4
    return {
      gx: Math.min(this.lotW + margin, Math.max(-margin, point.gx)),
      gy: Math.min(this.lotD + margin, Math.max(-margin, point.gy)),
    }
  }

  private setCameraPose(centre: GridPoint, zoom: number, yaw = this.camYaw): void {
    const halfW = orthoHalfWidth(this.viewW, zoom)
    const halfH = halfW * (this.viewH / this.viewW)
    this.camera.left = -halfW
    this.camera.right = halfW
    this.camera.top = halfH
    this.camera.bottom = -halfH
    const target = gridToWorld(centre.gx, centre.gy)
    const offset = CAMERA_OFFSET_DIR.clone()
      .applyAxisAngle(new Vector3(0, 1, 0), yaw)
      .multiplyScalar(CAMERA_DISTANCE_M)
    this.camera.position.copy(target.clone().add(offset))
    this.camera.lookAt(target)
    this.camera.updateProjectionMatrix()
  }

  private updateCamera(): void {
    this.setCameraPose(this.camCentre, this.camZoom)
  }

  /** Frame-rate-independent target/current damping, following the game-camera pattern. */
  private stepCamera(dt: number): void {
    const alpha = 1 - Math.exp(-Math.min(0.05, dt) * 13)
    const nextGx = this.camCentre.gx + (this.camTarget.gx - this.camCentre.gx) * alpha
    const nextGy = this.camCentre.gy + (this.camTarget.gy - this.camCentre.gy) * alpha
    const nextZoom = this.camZoom + (this.camTargetZoom - this.camZoom) * alpha
    const yawDelta = Math.atan2(Math.sin(this.camTargetYaw - this.camYaw), Math.cos(this.camTargetYaw - this.camYaw))
    const nextYaw = this.camYaw + yawDelta * alpha
    const changed =
      Math.abs(nextGx - this.camCentre.gx) > 0.00001 ||
      Math.abs(nextGy - this.camCentre.gy) > 0.00001 ||
      Math.abs(nextZoom - this.camZoom) > 0.00001 ||
      Math.abs(nextYaw - this.camYaw) > 0.00001
    this.camCentre = { gx: nextGx, gy: nextGy }
    this.camZoom = nextZoom
    this.camYaw = nextYaw
    if (changed) this.updateCamera()
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
  private dragging: {
    x: number
    y: number
    startX: number
    startY: number
    moved: boolean
    mode: 'pan' | 'rotate'
  } | null = null
  private suppressClick = false
  private bindInput(): void {
    const el = this.renderer.domElement
    const down = (e: PointerEvent): void => {
      if (this.inputSuspended || e.target !== el) return
      if (e.button !== 0 && e.button !== 2) return
      this.dragging = {
        x: e.clientX,
        y: e.clientY,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        mode: e.button === 2 ? 'rotate' : 'pan',
      }
      el.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent): void => {
      if (this.dragging === null || this.inputSuspended) return
      const dx = e.clientX - this.dragging.x
      const dy = e.clientY - this.dragging.y
      const moved =
        this.dragging.moved ||
        Math.hypot(e.clientX - this.dragging.startX, e.clientY - this.dragging.startY) >= 5
      this.dragging = { ...this.dragging, x: e.clientX, y: e.clientY, moved }
      if (this.dragging.mode === 'rotate') this.camTargetYaw += dx * 0.007
      else this.panByScreenPixels(dx, dy)
    }
    const up = (e: PointerEvent): void => {
      this.suppressClick = this.dragging?.moved === true
      this.dragging = null
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    }
    const click = (e: MouseEvent): void => {
      if (this.inputSuspended || e.target !== el) return
      if (this.suppressClick) {
        this.suppressClick = false
        return
      }
      this.pick(e)
    }
    const wheel = (e: WheelEvent): void => {
      if (this.inputSuspended || e.target !== el) return
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      this.zoomAtPointer(factor, e)
    }
    const contextMenu = (e: MouseEvent): void => {
      if (e.target === el) e.preventDefault()
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('click', click)
    el.addEventListener('wheel', wheel, { passive: false })
    el.addEventListener('contextmenu', contextMenu)
    this.disposers.push(() => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('click', click)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('contextmenu', contextMenu)
    })
  }

  private panByScreenPixels(dxPx: number, dyPx: number): void {
    // screen right = (+gx, −gy)/√2, screen down = (+gx, +gy)·sin-corrected — derive
    // both from the camera's own basis so the math can never drift from the view.
    const mPerPx = orthoHalfWidth(this.viewW, this.camTargetZoom) / (this.viewW / 2)
    const up = new Vector3(0, 1, 0)
    const right = new Vector3(1, 0, -1).normalize().applyAxisAngle(up, this.camTargetYaw)
    const downDir = new Vector3(1, 0, 1).normalize().applyAxisAngle(up, this.camTargetYaw).multiplyScalar(2) // 30° foreshortening: ground distance is 2× screen px
    const delta = right
      .multiplyScalar(-dxPx * mPerPx)
      .add(downDir.multiplyScalar(-dyPx * mPerPx))
    this.camTarget = this.clampCameraCentre({
      gx: this.camTarget.gx + delta.x / TILE_M,
      gy: this.camTarget.gy + delta.z / TILE_M,
    })
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
    // Measure on the TARGET camera, then restore the current pose.  This keeps the
    // pointer's ground point anchored even while current values ease toward the target.
    const currentCentre = { ...this.camCentre }
    const currentZoom = this.camZoom
    this.setCameraPose(this.camTarget, this.camTargetZoom, this.camTargetYaw)
    const before = this.groundPointAt(e)
    const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, this.camTargetZoom * factor))
    this.camTargetZoom = nextZoom
    this.setCameraPose(this.camTarget, this.camTargetZoom, this.camTargetYaw)
    const after = this.groundPointAt(e)
    if (before !== null && after !== null) {
      this.camTarget = this.clampCameraCentre({
        gx: this.camTarget.gx + (before.x - after.x) / TILE_M,
        gy: this.camTarget.gy + (before.z - after.z) / TILE_M,
      })
    }
    this.setCameraPose(currentCentre, currentZoom)
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
    this.selectedBuildingId = id
    const centre = gridToWorld(building.gx + building.fw / 2, building.gy + building.fd / 2)
    this.selectionRing.position.set(centre.x, 0.06, centre.z)
    this.selectionBaseScale = (Math.max(building.fw, building.fd) / 2 + 0.6) * TILE_M
    this.selectionRing.scale.setScalar(this.selectionBaseScale)
    this.selectionRing.visible = true
  }

  clearPlaceSelection(): void {
    this.selectedBuildingId = null
    this.selectionRing.visible = false
  }

  /** Pan to one authoritative building without changing the player's zoom. */
  focusBuilding(id: BuildingId): boolean {
    const building = this.buildings.find((candidate) => candidate.buildingId === id)
    if (building === undefined) return false
    this.centerOnGrid(building.gx + building.fw / 2, building.gy + building.fd / 2, this.camTargetZoom)
    return true
  }

  /** Paint the Picture Journey destination without selecting or activating it. */
  setGuidanceTarget(id: BuildingId | null): boolean {
    const building = id === null
      ? undefined
      : this.buildings.find((candidate) => candidate.buildingId === id)
    this.guidanceTarget = building?.buildingId ?? null
    if (building === undefined) {
      this.guidanceRing.visible = false
      return false
    }
    const centre = gridToWorld(building.gx + building.fw / 2, building.gy + building.fd / 2)
    this.guidanceRing.position.set(centre.x, 0.045, centre.z)
    this.guidanceBaseScale = (Math.max(building.fw, building.fd) / 2 + 0.9) * TILE_M
    this.guidanceRing.scale.setScalar(this.guidanceBaseScale)
    this.guidanceRing.visible = true
    return true
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
    this.stepCamera(dt)
    const detailedCrew = this.updateCrewLod()

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
            if (detailedCrew) CrewFactory.walk(runtime.figure, (this.nowMs / 620 + runtime.phase) % 1)
          } else if (detailedCrew) {
            CrewFactory.work(runtime.figure, runtime.pose, (this.nowMs / 3_800 + runtime.phase) % 1)
          }
        }
      }
    } else if (!this.reducedMotion && detailedCrew) {
      for (const runtime of this.figures) {
        CrewFactory.work(runtime.figure, runtime.pose, (this.nowMs / 3_800 + runtime.phase) % 1)
      }
    }

    if (!this.reducedMotion && detailedCrew) {
      for (const runtime of this.activityFigures) {
        CrewFactory.work(runtime.figure, runtime.pose, (this.nowMs / 2_600 + runtime.phase) % 1)
      }
    }
    this.updateCrewShadows()

    // selection ring breathes gently — acknowledged, never load-bearing
    if (this.selectionRing.visible && !this.reducedMotion) {
      const pulse = 1 + Math.sin(this.nowMs / 420) * 0.03
      this.selectionRing.scale.setScalar(this.selectionBaseScale * pulse)
    }
    if (this.guidanceRing.visible && !this.reducedMotion) {
      const pulse = 1 + Math.sin(this.nowMs / 560) * 0.045
      this.guidanceRing.scale.setScalar(this.guidanceBaseScale * pulse)
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
    this.staticGeneration += 1
    this.renderer.setAnimationLoop(null)
    this.resizeObserver.disconnect()
    for (const dispose of this.disposers) dispose()
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost)
    this.scene.traverse((node) => {
      const mesh = node as Mesh
      if (mesh.isMesh) mesh.geometry?.dispose()
    })
    this.groundSlot?.dispose()
    for (const geometry of this.buildingBatchGeometries) geometry.dispose()
    for (const geometry of this.dressingBatchGeometries) geometry.dispose()
    for (const geometry of this.theaterBatchGeometries) geometry.dispose()
    for (const geometry of this.wallBatchGeometries) geometry.dispose()
    this.activitySpillGeometry.dispose()
    this.activitySpillMaterial.dispose()
    this.crewShadowGeometry.dispose()
    this.crewShadowMaterial.dispose()
    this.crewLodBodyGeometry.dispose()
    this.crewLodHeadGeometry.dispose()
    this.crewLodLegGeometry.dispose()
    this.crewLodArmGeometry.dispose()
    this.crewLodHatBrimGeometry.dispose()
    this.crewLodHatCrownGeometry.dispose()
    this.crewLodBodyMaterial.dispose()
    this.crewLodHeadMaterial.dispose()
    this.crewLodLegMaterial.dispose()
    this.crewLodHatMaterial.dispose()
    this.atmosphere.dispose()
    this.selectionRing.geometry.dispose()
    ;(this.selectionRing.material as Material).dispose()
    this.guidanceRing.geometry.dispose()
    ;(this.guidanceRing.material as Material).dispose()
    disposeMaterials(this.materials)
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
