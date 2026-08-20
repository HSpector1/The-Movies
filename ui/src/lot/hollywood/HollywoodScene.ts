import Phaser from 'phaser'
import type {
  BuildingId,
  LotPersonState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from '../snapshot/StudioLotSnapshot'
import { operationalAnnexWorkContext } from '../snapshot/annexWork.ts'
import { gateHiringCandidateContext } from '../snapshot/gateHiring.ts'
import {
  activeProductionCompanyContexts,
  lotPeopleForCompanyPresentation,
} from '../snapshot/productionCompany.ts'
import { sceneryLoadInContext } from '../snapshot/sceneryLoadIn.ts'
import { stage7ProductionDetailContext } from '../snapshot/stage7Production.ts'
import {
  FALLBACK_PEOPLE_DECODED_BYTES,
  GENERATED_VEHICLE_DECODED_BYTES,
  ROLE_ATLAS_DECODED_BYTES,
  ROLE_ATLAS_FRAME_COUNT,
  ROLE_ATLAS_FRAME_HEIGHT,
  ROLE_ATLAS_FRAME_WIDTH,
  ROLE_ATLAS_RENDER_SCALE,
  directionFromDelta,
  isRoleAtlasRuntimeManifest,
  roleAtlasFrame,
  type RoleAtlasDirection,
  type RoleAtlasRole,
  type RoleAtlasRuntimeManifest,
} from './roleAtlas.ts'

const MANIFEST_URL = '/lot/hollywood/district-manifest.json'
const ROLE_ATLAS_MANIFEST_URL = '/lot/hollywood/role-atlas-v1.json'
const ROLE_ATLAS_IMAGE_URL = '/lot/hollywood/role-atlas-v1.png'
const ROLE_ATLAS_CACHE_KEY = 'hollywood-role-atlas-manifest-v1'
const ROLE_ATLAS_TEXTURE_KEY = 'hollywood-role-atlas-v1'
const CAMERA_OCCLUDER_TEXTURE_KEY = 'hollywood-camera-dolly-occluder'
const DISTRICT_MANIFEST_CACHE_KEY = 'hollywood-manifest'
const DISTRICT_W = 1586
const DISTRICT_H = 992
const PERFORMANCE_WARMUP_FRAMES = 120
const PERFORMANCE_SAMPLE_FRAMES = 240
const FONT_SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif'
const FONT_SANS = 'Avenir, "Helvetica Neue", Arial, sans-serif'
const ANNEX_PLACE_ID = 'annex-parcel'
const ANNEX_BUILDING_ID = 'expansion'
const SERVICE_YARD_PLACE_ID = 'service-yard'
const SERVICE_YARD_BUILDING_ID = 'post'
const STAGE_7_PLACE_ID = 'stage-7'
const PUBLICITY_PLACE_ID = 'publicity'
const PUBLICITY_BUILDING_ID = 'admin'
const PUBLICITY_LABEL = 'Administration & Publicity'
const PUBLICITY_AFFORDANCES = ['work', 'meeting', 'publicity'] as const
const PUBLICITY_SELECTION_POLYGON = [
  [946, 174],
  [1586, 122],
  [1586, 510],
  [1050, 500],
  [920, 360],
] as const
const PUBLICITY_ENTRY_ANCHOR = [1338, 421] as const
const PUBLICITY_PHOTOCALL_ANCHOR = [1120, 481] as const
const PUBLICITY_QUEUE_ANCHOR = [930, 338] as const
const PUBLICITY_ACTIVITY_LABEL = 'Publicity call'
const PUBLICITY_ACTIVITY_AFFORDANCES = ['publicity'] as const
const PUBLICITY_ACTIVITY_ROLES = ['talent', 'publicist', 'photographer'] as const
const PUBLICITY_ACTIVITY_VISUAL_STATES = ['queue-forming', 'flash', 'press-moving'] as const
const GATE_PLACE_ID = 'studio-gate'
const GATE_BUILDING_ID = 'gate'
const GATE_LABEL = 'Studio Gate'
const GATE_AFFORDANCES = ['gate-security', 'arrival'] as const
const GATE_SELECTION_POLYGON = [
  [930, 570],
  [1586, 529],
  [1586, 992],
  [900, 992],
  [820, 900],
  [835, 720],
] as const
const GATE_GUARD_ANCHOR = [853, 720] as const
const GATE_ARRIVAL_ANCHOR = [1227, 844] as const
const GATE_FOREGROUND_LAYER = {
  id: 'gate-foreground-occluder',
  kind: 'occluder',
  depth: 90,
  output: 'gate-foreground-occluder.png',
  x: 568,
  y: 504,
  width: 1019,
  height: 489,
} as const
const SCENERY_SWEEP_DURATION_MS = 1_200
const SELECTED_PERSON_TINT = 0xffe6a0
const SELECTED_COMPANY_TINT = 0xbfe3d6
const OTHER_COMPANY_ALPHA = 0.72

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

export type HollywoodProductionSelection = {
  productionId: string
  locationBuildingId: 'stage-a'
}

export type HollywoodSceneryLoadInSelection = {
  productionId: string
  locationBuildingId: 'stage-a'
  placeId: 'service-yard'
}

/** Presentation-only Gate visitor. Every field is checked against the latest Lot snapshot. */
export type HollywoodGateVisitorPresentation = {
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

/** Canvas selection emits identity only; React re-resolves all current candidate facts. */
export type HollywoodGateVisitorSelection = {
  talentId: string
}

export type HollywoodEvent =
  | { type: 'ready' }
  | { type: 'failure'; reason: HollywoodFailureReason }
  | { type: 'person'; person: LotPersonState | null }
  | { type: 'place'; place: HollywoodPlaceSelection }
  | { type: 'production'; production: HollywoodProductionSelection }
  | { type: 'scenery-load-in'; sceneryLoadIn: HollywoodSceneryLoadInSelection }
  | { type: 'gate-visitor'; visitor: HollywoodGateVisitorSelection }
  | { type: 'activity'; text: string | null }

export type HollywoodFailureReason =
  | 'manifest-load-failed'
  | 'manifest-invalid'
  | 'scene-create-failed'
  | 'scene-boot-failed'
  | 'renderer-context-lost'

export type HollywoodSceneData = {
  snapshot: StudioLotSnapshot
  onEvent: (event: HollywoodEvent) => void
  reducedMotion?: boolean
}

type MovingActor = {
  sprite: Phaser.GameObjects.Sprite
  role: RoleAtlasRole
  direction: RoleAtlasDirection
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
  direction: RoleAtlasDirection
}

type RuntimeGateVisitor = {
  presentation: HollywoodGateVisitorPresentation
  sprite: Phaser.GameObjects.Sprite
}

type CosmeticRoute = {
  productionId: string
  personId: string
  elapsed: number
}

type CosmeticSceneryLoadIn = {
  productionId: string
  title: string
  elapsed: number
}

export type HollywoodPerformance = {
  /** Renderer identity for shared evidence chrome. Omitted by legacy callers. */
  rendererKind?: 'hollywood-2d' | 'three-3d'
  /** Number of post-warm-up wall-frame samples in the frozen sustained window. */
  frameSampleCount: number
  fps: number
  displayObjects: number
  /** Exact decoded RGBA budget; the MB value below is display-only rounding. */
  textureMemoryBytes: number
  textureMemoryMb: number
  districtTextureMemoryMb: number
  peopleTextureMemoryMb: number
  roleAtlasActive: boolean
  roleAtlasEncodedKb: number
  roleAtlasDecodedMb: number
  drawCalls: number
  frameMs: number
  p99FrameMs: number
  onePercentLowFps: number
  worstFrameMs: number
  updateMs: number
  worstUpdateMs: number
  renderMsEstimate: number
  dynamicActors: number
  /** Three exposes an exact GPU texture object count where decoded bytes are unknown. */
  textureCount?: number
}

export class HollywoodScene extends Phaser.Scene {
  private snapshot!: StudioLotSnapshot
  private emitEvent!: (event: HollywoodEvent) => void
  private manifest!: DistrictManifest
  private runtimePeople = new Map<string, RuntimePerson>()
  private gateVisitor: RuntimeGateVisitor | null = null
  private requestedGateVisitor: HollywoodGateVisitorPresentation | null = null
  private ambientActors: MovingActor[] = []
  private vehicle: Phaser.GameObjects.Sprite | null = null
  private vehicleTween: Phaser.Tweens.Tween | null = null
  private reducedMotion = false
  /** Input-only modal gate. Ambient actors, routes, and renderer telemetry stay live. */
  private inputSuspended = false
  private selectedPersonId: string | null = null
  private selectedPlaceId: string | null = null
  private selectedProductionId: string | null = null
  /**
   * Presentation-only company focus. This must never stand in for the physical
   * Stage 7/scenery selection above, which has its own independently proven seam.
   */
  private selectedCompanyProductionId: string | null = null
  /**
   * A route is visual acknowledgement of an already-accepted engine transition.
   * It never owns or advances a production/task status.
   */
  private cosmeticRoute: CosmeticRoute | null = null
  /** Diagrammatic acknowledgement of accepted Engine truth, never delivery authority. */
  private cosmeticSceneryLoadIn: CosmeticSceneryLoadIn | null = null
  private route: RoutePoint[] = []
  private activityGraphics: Phaser.GameObjects.Graphics | null = null
  private sceneryGraphics: Phaser.GameObjects.Graphics | null = null
  private selectionGraphics: Phaser.GameObjects.Graphics | null = null
  private flash: Phaser.GameObjects.Rectangle | null = null
  private stageStateText: Phaser.GameObjects.Text | null = null
  private stageLamp: Phaser.GameObjects.Arc | null = null
  private expansionGraphics: Phaser.GameObjects.Graphics | null = null
  private expansionLabel: Phaser.GameObjects.Text | null = null
  private expansionStatus: 'legacy' | 'vacant' | 'building' | 'operational' = 'legacy'
  private dragOrigin: { x: number; y: number; scrollX: number; scrollY: number } | null = null
  private fitZoom = 1
  private frameSamples: number[] = []
  private updateSamples: number[] = []
  private drawCallSamples: number[] = []
  private currentFrameDrawCalls = 0
  private drawPipelines: Phaser.Renderer.WebGL.WebGLPipeline[] = []
  private performanceWarmupFramesRemaining = PERFORMANCE_WARMUP_FRAMES
  private capturePerformanceFrame = false
  private worstFrameMs = 0
  private worstUpdateMs = 0
  private roleAtlasActive = false
  private roleAtlasManifest: RoleAtlasRuntimeManifest | null = null
  /** One bounded host-visible failure per scene lifetime; never an Engine event. */
  private failureReported = false
  /** Idempotent physical shutdown shared by scene- and View-originated failures. */
  private failureStateApplied = false
  /** LOADING rejects pause; one CREATING retry is required after any pre-ready failure. */
  private retryFailurePauseAtCreate = false

  init(data: HollywoodSceneData): void {
    this.snapshot = data.snapshot
    this.emitEvent = data.onEvent
    this.reducedMotion = data.reducedMotion === true
  }

  preload(): void {
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: { key?: unknown }) => {
      if (file?.key === DISTRICT_MANIFEST_CACHE_KEY) {
        this.reportFailure('manifest-load-failed')
      }
    })
    this.load.json(DISTRICT_MANIFEST_CACHE_KEY, MANIFEST_URL)
    this.load.json(ROLE_ATLAS_CACHE_KEY, ROLE_ATLAS_MANIFEST_URL)
    this.load.spritesheet(ROLE_ATLAS_TEXTURE_KEY, ROLE_ATLAS_IMAGE_URL, {
      frameWidth: ROLE_ATLAS_FRAME_WIDTH,
      frameHeight: ROLE_ATLAS_FRAME_HEIGHT,
    })
    this.load.image('hollywood-base', '/lot/hollywood/district-base.png')
    this.load.image('hollywood-truck', '/lot/hollywood/truck-occluder.png')
    this.load.image(CAMERA_OCCLUDER_TEXTURE_KEY, '/lot/hollywood/camera-dolly-occluder.png')
    this.load.image('hollywood-gate', '/lot/hollywood/gate-foreground-occluder.png')
  }

  create(): void {
    if (this.failureReported) {
      // A pre-ready failure can queue its first pause while Phaser is still in
      // LOADING, where Systems.pause rejects it. create() is entered as CREATING;
      // queue again here so the next manager update pauses the generation after
      // Phaser completes its mandatory CREATING → RUNNING transition.
      if (this.retryFailurePauseAtCreate) {
        this.retryFailurePauseAtCreate = false
        this.scene.pause()
      }
      return
    }
    const manifest = this.districtManifestFromCache()
    if (manifest === null) {
      this.reportFailure('manifest-invalid')
      return
    }

    try {
      this.manifest = manifest
      this.route = this.manifest.routes['street-to-stage-7'] ?? []
      this.buildActorTextures()
      this.roleAtlasActive = this.hasValidRoleAtlas()
      this.buildWorld()
      this.buildSemanticHotspots()
      this.buildPeople()
      this.buildAmbientLife()
      this.buildVehicle()
      this.bindCamera()
      this.resetPerformanceTelemetry()
      this.bindDrawCallTelemetry()
      this.events.on(Phaser.Scenes.Events.PAUSE, this.clearPublicityVisual, this)
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.clearPublicityVisual()
        this.events.off(Phaser.Scenes.Events.PAUSE, this.clearPublicityVisual, this)
      })
      this.applySnapshot(this.snapshot)
      this.setReducedMotion(this.reducedMotion)
      this.emitEvent({ type: 'ready' })
    } catch {
      // Scene setup happens after the React import/constructor promise has resolved.
      // Convert that otherwise-unobservable failure into one presentation-only signal.
      this.reportFailure('scene-create-failed')
    }
  }

  private districtManifestFromCache(): DistrictManifest | null {
    const value = this.cache.json.get(DISTRICT_MANIFEST_CACHE_KEY) as unknown
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
    const manifest = value as Partial<DistrictManifest>
    const canvas = manifest.canvas
    return (
      Number.isFinite(manifest.schemaVersion) &&
      typeof manifest.districtId === 'string' &&
      typeof canvas === 'object' &&
      canvas !== null &&
      Number.isFinite(canvas.width) &&
      Number.isFinite(canvas.height) &&
      Array.isArray(manifest.layers) &&
      Array.isArray(manifest.places) &&
      typeof manifest.routes === 'object' &&
      manifest.routes !== null &&
      !Array.isArray(manifest.routes) &&
      Array.isArray(manifest.activities) &&
      Number.isFinite(manifest.textureMemoryBytes)
    ) ? value as DistrictManifest : null
  }

  private reportFailure(reason: HollywoodFailureReason): void {
    if (this.failureReported) return
    this.failureReported = true
    if (reason === 'manifest-load-failed') this.retryFailurePauseAtCreate = true
    this.applyFailedPresentationState()
    this.emitEvent({ type: 'failure', reason })
  }

  /**
   * View-owned failures (notably WebGL context loss) cross the Phaser event seam
   * without first executing a Scene lifecycle callback. Make that generation just
   * as inert and invisible as a manifest/create failure before the View drops it.
   */
  failClosedFromHost(): void {
    this.failureReported = true
    // A host failure can arrive after SceneManager registration but before this
    // scene reaches create(). Its LOADING pause may be rejected, so arm the same
    // bounded CREATING retry as the manifest-loader failure path.
    this.retryFailurePauseAtCreate = true
    this.applyFailedPresentationState()
  }

  private applyFailedPresentationState(): void {
    if (this.failureStateApplied) return
    this.failureStateApplied = true
    // A partially-created scene must not leave an interactive polygon, outline,
    // or draw fragment behind the semantic fallback. This changes failure paths
    // only; the successful display-object and draw budgets are untouched.
    this.setInputSuspended(true)
    this.clearPublicityVisual()
    this.discardGateVisitor()
    this.clearPlaceSelection()
    this.scene.setVisible(false)
    // ScenePlugin queues this operation. During preload/create the manager will
    // first finish its lifecycle transition, then process the queued pause, so a
    // failed LOADING/CREATING generation cannot become a running orphan.
    this.scene.pause()
  }

  private buildWorld(): void {
    const textureByLayer: Record<string, string> = {
      'district-base': 'hollywood-base',
      'truck-occluder': 'hollywood-truck',
      'camera-dolly-occluder': CAMERA_OCCLUDER_TEXTURE_KEY,
      'gate-foreground-occluder': 'hollywood-gate',
    }
    for (const layer of this.manifest.layers) {
      const texture = textureByLayer[layer.id]
      if (!texture) continue
      this.add.image(layer.x, layer.y, texture).setOrigin(0).setDepth(layer.depth).setName(`tier:${layer.id}`)
    }

    this.activityGraphics = this.add.graphics().setDepth(84).setName('tier:stateful-activity')
    // Above the service truck and stage-camera occluders along these endpoints.
    // This object is deliberately draw-only: the existing depth-1 service-yard
    // polygon owns input, so a marker can never win Phaser's top-only hit test
    // over a named person travelling through the same world coordinate.
    this.sceneryGraphics = this.add.graphics().setDepth(80).setName('tier:stateful-scenery-load-in')
    this.selectionGraphics = this.add.graphics().setDepth(170).setName('tier:selection')
    this.flash = this.add.rectangle(
      PUBLICITY_PHOTOCALL_ANCHOR[0],
      PUBLICITY_PHOTOCALL_ANCHOR[1],
      190,
      130,
      0xfff7d6,
      1,
    ).setAlpha(0).setDepth(160).setName('tier:publicity-flash')
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
    const selectStage7 = (pointer: Phaser.Input.Pointer) => {
      if (!this.isCanvasPointer(pointer)) return
      pointer.event.stopPropagation?.()
      const place = this.canonicalStage7Place()
      if (place) this.selectStage7Surface(place)
    }
    this.stageLamp.setInteractive({ useHandCursor: true }).on('pointerdown', selectStage7)
    this.stageStateText.setInteractive({ useHandCursor: true }).on('pointerdown', selectStage7)
    this.expansionGraphics = this.add.graphics().setDepth(87).setName('tier:stateful-expansion')
    this.expansionLabel = this.add.text(0, 0, '', {
      fontFamily: FONT_SANS,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f5e7c6',
      backgroundColor: '#142820e8',
      padding: { x: 9, y: 6 },
      align: 'center',
    // Status is an actionable world affordance, so keep it above moving actors while
    // leaving the selected-place outline and person nameplates at their existing priority.
    }).setOrigin(0.5, 1).setDepth(169).setName('tier:stateful-expansion-label')
    const selectAnnex = (pointer: Phaser.Input.Pointer) => {
      if (!this.isCanvasPointer(pointer)) return
      pointer.event.stopPropagation?.()
      const place = this.canonicalAnnexPlace()
      if (place) this.selectAnnexSurface(place)
    }
    this.expansionLabel.setInteractive({ useHandCursor: true }).on('pointerdown', selectAnnex)
  }

  private buildSemanticHotspots(): void {
    const canonicalPublicity = this.canonicalPublicityPlace()
    const canonicalGate = this.canonicalGatePlace()
    for (const place of this.manifest.places) {
      // Administration & Publicity is a governed physical action surface, not a
      // generic place. Any record that claims part of that identity must validate
      // as the one complete canonical place/activity pair or receive no zone at all.
      if (this.isPublicityLikePlace(place) && place !== canonicalPublicity) continue
      // Gate identity includes its exact runtime canvas and foreground occluder. A
      // stale/source or partially-conflicting Gate record receives no input zone.
      if (this.isGateLikePlace(place) && place !== canonicalGate) continue
      const shape = new Phaser.Geom.Polygon(place.selectionPolygon.map(([x, y]) => ({ x, y })))
      // Zones render nothing, so keep their input ordering below every managed person.
      // At depth 150 the full-district polygons won Phaser's top-only hit test and
      // swallowed genuine pointer selection whenever a person stood over a place.
      const zone = this.add.zone(0, 0, DISTRICT_W, DISTRICT_H).setOrigin(0).setDepth(1)
      zone.setInteractive(shape, Phaser.Geom.Polygon.Contains)
      if (zone.input) zone.input.cursor = 'pointer'
      zone.on('pointerover', () => {
        if (this.isPublicityLikePlace(place) && place !== this.canonicalPublicityPlace()) return
        if (this.isGateLikePlace(place) && place !== this.canonicalGatePlace()) return
        this.drawPlaceOutline(place, false)
      })
      zone.on('pointerout', () => {
        const selected = this.selectedPlaceId === PUBLICITY_PLACE_ID
          ? this.canonicalPublicityPlace()
          : this.selectedPlaceId === GATE_PLACE_ID
            ? this.canonicalGatePlace()
          : this.manifest.places.find(
              (candidate) =>
                candidate.id === this.selectedPlaceId &&
                !this.isPublicityLikePlace(candidate) &&
                !this.isGateLikePlace(candidate),
            )
        if (selected) this.drawPlaceOutline(selected, true)
        else this.selectionGraphics?.clear()
      })
      zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!this.isCanvasPointer(pointer)) return
        pointer.event.stopPropagation?.()
        if (place.buildingId === 'stage-a') {
          this.selectStage7Surface(place)
          return
        }
        if (place.id === ANNEX_PLACE_ID || place.buildingId === ANNEX_BUILDING_ID) {
          this.selectAnnexSurface(place)
          return
        }
        if (place === this.canonicalServiceYardPlace()) {
          this.selectServiceYardSurface(place)
          return
        }
        if (place === this.canonicalPublicityPlace()) {
          if (this.selectPublicitySurface(place)) this.focusPlace(place)
          return
        }
        if (this.isGateLikePlace(place)) {
          const gate = this.canonicalGatePlace()
          if (place === gate) this.selectGateSurface(gate)
          return
        }
        this.selectGenericPlaceSurface(place)
      })
    }
  }

  /**
   * Exact consumed runtime Gate. The deliberately stale source polygon is never an
   * alternate authority, and malformed Gate truth fails locally without affecting
   * any unrelated Hollywood place.
   */
  private canonicalGatePlace(): Place | null {
    const manifest = this.manifest as unknown as {
      canvas?: unknown
      layers?: unknown
      places?: unknown
    } | null
    if (manifest === null || typeof manifest !== 'object') return null
    const canvas = manifest.canvas as { width?: unknown; height?: unknown } | null
    if (
      canvas === null ||
      typeof canvas !== 'object' ||
      !this.hasExactOwnKeys(canvas, ['width', 'height']) ||
      canvas.width !== DISTRICT_W ||
      canvas.height !== DISTRICT_H
    ) return null
    if (!Array.isArray(manifest.places) || !Array.isArray(manifest.layers)) return null

    const candidates = manifest.places.filter((candidate) => this.isGateLikePlace(candidate))
    if (candidates.length !== 1) return null
    const foregrounds = manifest.layers.filter((candidate) => this.isGateForegroundLikeLayer(candidate))
    if (foregrounds.length !== 1 || !this.isCanonicalGateForegroundLayer(foregrounds[0])) return null

    const place = candidates[0] as Place
    return (
      this.hasExactOwnKeys(place, [
        'id',
        'buildingId',
        'label',
        'selectionPolygon',
        'anchors',
        'affordances',
      ]) &&
      place.id === GATE_PLACE_ID &&
      place.buildingId === GATE_BUILDING_ID &&
      place.label === GATE_LABEL &&
      this.sameStrings(place.affordances, GATE_AFFORDANCES) &&
      this.sameAnchorKeys(place.anchors, ['guard', 'arrival']) &&
      this.sameAnchor(place.anchors?.guard, GATE_GUARD_ANCHOR) &&
      this.sameAnchor(place.anchors?.arrival, GATE_ARRIVAL_ANCHOR) &&
      this.validSelectionPolygon(place.selectionPolygon) &&
      this.samePolygon(place.selectionPolygon, GATE_SELECTION_POLYGON) &&
      !this.polygonSelfIntersects(place.selectionPolygon) &&
      this.pointInPolygon(GATE_ARRIVAL_ANCHOR, place.selectionPolygon)
    ) ? place : null
  }

  private isGateLikePlace(candidate: unknown): boolean {
    if (typeof candidate !== 'object' || candidate === null) return false
    const place = candidate as {
      id?: unknown
      buildingId?: unknown
      label?: unknown
      affordances?: unknown
      anchors?: unknown
    }
    const anchorKeys = typeof place.anchors === 'object' && place.anchors !== null && !Array.isArray(place.anchors)
      ? Object.keys(place.anchors)
      : []
    return place.id === GATE_PLACE_ID ||
      place.buildingId === GATE_BUILDING_ID ||
      place.label === GATE_LABEL ||
      (Array.isArray(place.affordances) &&
        (place.affordances.includes('gate-security') || place.affordances.includes('arrival'))) ||
      anchorKeys.includes('guard') ||
      anchorKeys.includes('arrival')
  }

  private isGateForegroundLikeLayer(candidate: unknown): boolean {
    if (typeof candidate !== 'object' || candidate === null) return false
    const layer = candidate as { id?: unknown; output?: unknown }
    return layer.id === GATE_FOREGROUND_LAYER.id || layer.output === GATE_FOREGROUND_LAYER.output
  }

  private isCanonicalGateForegroundLayer(candidate: unknown): candidate is RuntimeLayer {
    if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) return false
    const layer = candidate as Partial<RuntimeLayer>
    return this.hasExactOwnKeys(layer, [
      'id',
      'kind',
      'depth',
      'output',
      'x',
      'y',
      'width',
      'height',
    ]) &&
      layer.id === GATE_FOREGROUND_LAYER.id &&
      layer.kind === GATE_FOREGROUND_LAYER.kind &&
      layer.depth === GATE_FOREGROUND_LAYER.depth &&
      layer.output === GATE_FOREGROUND_LAYER.output &&
      layer.x === GATE_FOREGROUND_LAYER.x &&
      layer.y === GATE_FOREGROUND_LAYER.y &&
      layer.width === GATE_FOREGROUND_LAYER.width &&
      layer.height === GATE_FOREGROUND_LAYER.height
  }

  private canonicalAnnexPlace(): Place | null {
    return this.manifest?.places.find(
      (place) => place.id === ANNEX_PLACE_ID && place.buildingId === ANNEX_BUILDING_ID,
    ) ?? null
  }

  private canonicalServiceYardPlace(): Place | null {
    const place = this.uniqueRuntimePlace(SERVICE_YARD_PLACE_ID)
    if (place === null) return null
    return (
      place.buildingId === SERVICE_YARD_BUILDING_ID &&
      place.label === 'Scenery & Service' &&
      this.sameAnchor(place.anchors?.truck, [271, 626]) &&
      this.sameAnchor(place.anchors?.sceneryRack, [112, 404]) &&
      this.sameAnchor(place.anchors?.loadIn, [390, 584]) &&
      this.sameStrings(place.affordances, ['delivery', 'supply-scenery', 'load-in']) &&
      this.validSelectionPolygon(place.selectionPolygon)
    ) ? place : null
  }

  private canonicalStage7Place(): Place | null {
    const place = this.uniqueRuntimePlace(STAGE_7_PLACE_ID)
    if (place === null) return null
    return (
      place.buildingId === 'stage-a' &&
      place.label === 'Stage 7' &&
      this.sameAnchor(place.anchors?.entry, [586, 383]) &&
      this.sameAnchor(place.anchors?.crewCall, [662, 472]) &&
      this.sameAnchor(place.anchors?.camera, [558, 527]) &&
      this.sameAnchor(place.anchors?.service, [500, 500]) &&
      this.sameStrings(place.affordances, ['enter-stage', 'shoot', 'load-in']) &&
      this.validSelectionPolygon(place.selectionPolygon)
    ) ? place : null
  }

  /**
   * Exact accepted runtime Administration & Publicity identity. The deliberately
   * divergent runtime manifest owns these literals; exporter/source geometry is
   * not an alternate authority. A publicity-like duplicate fails the pair closed.
   */
  private canonicalPublicityPlace(): Place | null {
    const places = (this.manifest as unknown as { places?: unknown } | null)?.places
    if (!Array.isArray(places)) return null
    const candidates = places.filter((candidate) => this.isPublicityLikePlace(candidate))
    if (candidates.length !== 1) return null
    const place = candidates[0] as Place
    const activity = this.canonicalPublicityActivity()
    if (activity === null || activity.place !== place.id) return null
    return (
      place.id === PUBLICITY_PLACE_ID &&
      place.buildingId === PUBLICITY_BUILDING_ID &&
      place.label === PUBLICITY_LABEL &&
      this.sameStrings(place.affordances, PUBLICITY_AFFORDANCES) &&
      this.sameAnchorKeys(place.anchors, ['entry', 'photocall', 'queue']) &&
      this.sameAnchor(place.anchors?.entry, PUBLICITY_ENTRY_ANCHOR) &&
      this.sameAnchor(place.anchors?.photocall, PUBLICITY_PHOTOCALL_ANCHOR) &&
      this.sameAnchor(place.anchors?.queue, PUBLICITY_QUEUE_ANCHOR) &&
      this.validSelectionPolygon(place.selectionPolygon) &&
      this.samePolygon(place.selectionPolygon, PUBLICITY_SELECTION_POLYGON) &&
      !this.polygonSelfIntersects(place.selectionPolygon) &&
      this.pointInPolygon(PUBLICITY_PHOTOCALL_ANCHOR, place.selectionPolygon)
    ) ? place : null
  }

  private canonicalPublicityActivity(): Activity | null {
    const activities = (this.manifest as unknown as { activities?: unknown } | null)?.activities
    if (!Array.isArray(activities)) return null
    const candidates = activities.filter((candidate) => this.isPublicityLikeActivity(candidate))
    if (candidates.length !== 1) return null
    const activity = candidates[0] as Activity
    return (
      activity.id === PUBLICITY_PLACE_ID &&
      activity.label === PUBLICITY_ACTIVITY_LABEL &&
      activity.place === PUBLICITY_PLACE_ID &&
      this.sameStrings(activity.requiredAffordances, PUBLICITY_ACTIVITY_AFFORDANCES) &&
      this.sameStrings(activity.requiredRoles, PUBLICITY_ACTIVITY_ROLES) &&
      this.sameStrings(activity.visualStates, PUBLICITY_ACTIVITY_VISUAL_STATES)
    ) ? activity : null
  }

  private isPublicityLikePlace(candidate: unknown): boolean {
    if (typeof candidate !== 'object' || candidate === null) return false
    const place = candidate as {
      id?: unknown
      buildingId?: unknown
      label?: unknown
      affordances?: unknown
    }
    return place.id === PUBLICITY_PLACE_ID ||
      place.buildingId === PUBLICITY_BUILDING_ID ||
      place.label === PUBLICITY_LABEL ||
      (Array.isArray(place.affordances) && place.affordances.includes(PUBLICITY_PLACE_ID))
  }

  private isPublicityLikeActivity(candidate: unknown): boolean {
    if (typeof candidate !== 'object' || candidate === null) return false
    const activity = candidate as {
      id?: unknown
      label?: unknown
      place?: unknown
      requiredAffordances?: unknown
      requiredRoles?: unknown
    }
    return activity.id === PUBLICITY_PLACE_ID ||
      activity.label === PUBLICITY_ACTIVITY_LABEL ||
      activity.place === PUBLICITY_PLACE_ID ||
      (Array.isArray(activity.requiredAffordances) &&
        activity.requiredAffordances.includes(PUBLICITY_PLACE_ID)) ||
      (Array.isArray(activity.requiredRoles) &&
        (activity.requiredRoles.includes('publicist') ||
          activity.requiredRoles.includes('photographer')))
  }

  private uniqueRuntimePlace(id: string): Place | null {
    const places = (this.manifest as unknown as { places?: unknown } | null)?.places
    if (!Array.isArray(places)) return null
    const matches = places.filter((candidate) =>
      typeof candidate === 'object' &&
      candidate !== null &&
      (candidate as { id?: unknown }).id === id,
    )
    return matches.length === 1 ? matches[0] as Place : null
  }

  private sameAnchor(
    actual: unknown,
    expected: readonly [number, number],
  ): boolean {
    return Array.isArray(actual) &&
      actual.length === 2 &&
      actual[0] === expected[0] &&
      actual[1] === expected[1]
  }

  private sameStrings(actual: unknown, expected: readonly string[]): boolean {
    return Array.isArray(actual) &&
      actual.length === expected.length &&
      actual.every((value, index) => value === expected[index])
  }

  private hasExactOwnKeys(actual: object, expected: readonly string[]): boolean {
    const keys = Object.keys(actual)
    return keys.length === expected.length && expected.every((key) => Object.hasOwn(actual, key))
  }

  private sameAnchorKeys(actual: unknown, expected: readonly string[]): boolean {
    if (typeof actual !== 'object' || actual === null || Array.isArray(actual)) return false
    const keys = Object.keys(actual).sort()
    const expectedKeys = [...expected].sort()
    return keys.length === expectedKeys.length &&
      keys.every((key, index) => key === expectedKeys[index])
  }

  private samePolygon(
    actual: unknown,
    expected: readonly (readonly [number, number])[],
  ): actual is [number, number][] {
    return Array.isArray(actual) &&
      actual.length === expected.length &&
      actual.every((point, index) => this.sameAnchor(point, expected[index]!))
  }

  private validSelectionPolygon(actual: unknown): actual is [number, number][] {
    return Array.isArray(actual) &&
      actual.length >= 3 &&
      actual.every((point) =>
        Array.isArray(point) &&
        point.length === 2 &&
        Number.isFinite(point[0]) &&
        Number.isFinite(point[1]),
      )
  }

  private pointOnSegment(
    point: readonly [number, number],
    a: readonly [number, number],
    b: readonly [number, number],
  ): boolean {
    const cross = (point[1] - a[1]) * (b[0] - a[0]) -
      (point[0] - a[0]) * (b[1] - a[1])
    if (cross !== 0) return false
    return point[0] >= Math.min(a[0], b[0]) &&
      point[0] <= Math.max(a[0], b[0]) &&
      point[1] >= Math.min(a[1], b[1]) &&
      point[1] <= Math.max(a[1], b[1])
  }

  private segmentsIntersect(
    a: readonly [number, number],
    b: readonly [number, number],
    c: readonly [number, number],
    d: readonly [number, number],
  ): boolean {
    const orientation = (
      p: readonly [number, number],
      q: readonly [number, number],
      r: readonly [number, number],
    ) => Math.sign(
      (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]),
    )
    const o1 = orientation(a, b, c)
    const o2 = orientation(a, b, d)
    const o3 = orientation(c, d, a)
    const o4 = orientation(c, d, b)
    if (o1 !== o2 && o3 !== o4) return true
    return (o1 === 0 && this.pointOnSegment(c, a, b)) ||
      (o2 === 0 && this.pointOnSegment(d, a, b)) ||
      (o3 === 0 && this.pointOnSegment(a, c, d)) ||
      (o4 === 0 && this.pointOnSegment(b, c, d))
  }

  private polygonSelfIntersects(polygon: readonly (readonly [number, number])[]): boolean {
    for (let first = 0; first < polygon.length; first++) {
      const firstNext = (first + 1) % polygon.length
      for (let second = first + 1; second < polygon.length; second++) {
        const secondNext = (second + 1) % polygon.length
        if (first === second || firstNext === second || secondNext === first) continue
        if (this.segmentsIntersect(
          polygon[first]!,
          polygon[firstNext]!,
          polygon[second]!,
          polygon[secondNext]!,
        )) return true
      }
    }
    return false
  }

  private pointInPolygon(
    point: readonly [number, number],
    polygon: readonly (readonly [number, number])[],
  ): boolean {
    let inside = false
    for (
      let current = 0, previous = polygon.length - 1;
      current < polygon.length;
      previous = current++
    ) {
      const a = polygon[previous]!
      const b = polygon[current]!
      if (this.pointOnSegment(point, a, b)) return true
      const crosses = (a[1] > point[1]) !== (b[1] > point[1]) &&
        point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
      if (crosses) inside = !inside
    }
    return inside
  }

  /**
   * One exact scenery selection seam shared by the physical yard polygon and host.
   * The snapshot selector is re-run at activation time; scene state is never authority.
   */
  private selectSceneryLoadInSurface(place: Place, emitSelection = true): boolean {
    if (
      place !== this.canonicalServiceYardPlace() ||
      this.canonicalStage7Place() === null
    ) return false
    const scenery = sceneryLoadInContext(this.snapshot)
    if (scenery === null) return false
    this.selectProductionCompanyPresentation(scenery.operation.productionId)
    this.selectedProductionId = scenery.operation.productionId
    this.selectedPlaceId = place.id
    this.drawPlaceOutline(place, true)
    if (emitSelection) {
      this.emitEvent({
        type: 'scenery-load-in',
        sceneryLoadIn: {
          productionId: scenery.operation.productionId,
          locationBuildingId: 'stage-a',
          placeId: SERVICE_YARD_PLACE_ID,
        },
      })
    }
    return true
  }

  /** Marker and polygon share this physical seam, including the generic fallback. */
  private selectServiceYardSurface(place: Place): void {
    if (this.selectSceneryLoadInSurface(place)) return
    this.selectGenericPlaceSurface(place)
  }

  private selectGenericPlaceSurface(place: Place): void {
    this.clearProductionCompanySelection()
    this.selectedProductionId = null
    this.selectedPlaceId = place.id
    this.drawPlaceOutline(place, true)
    this.emitEvent({
      type: 'place',
      place: {
        id: place.id,
        buildingId: place.buildingId,
        label: place.label,
        affordances: place.affordances,
      },
    })
  }

  /** One exact Gate seam shared by the physical polygon and native host companion. */
  private selectGateSurface(place: Place, emitSelection = true): boolean {
    if (!this.selectionGraphics || place !== this.canonicalGatePlace()) return false
    this.clearProductionCompanySelection()
    this.selectedProductionId = null
    this.selectedPlaceId = GATE_PLACE_ID
    this.drawPlaceOutline(place, true)
    if (emitSelection) {
      this.emitEvent({
        type: 'place',
        place: {
          id: GATE_PLACE_ID,
          buildingId: GATE_BUILDING_ID,
          label: GATE_LABEL,
          affordances: [...GATE_AFFORDANCES],
        },
      })
    }
    return true
  }

  /** Host/DOM parity: paint only the exact accepted Gate and emit no feedback event. */
  selectGateFromHost(): boolean {
    const place = this.canonicalGatePlace()
    return place === null ? false : this.selectGateSurface(place, false)
  }

  /** Host/DOM parity: focus only the exact accepted Gate. */
  focusGateFromHost(): boolean {
    const place = this.canonicalGatePlace()
    if (place === null) return false
    this.focusPlace(place)
    return true
  }

  /**
   * One exact Administration & Publicity seam shared by the physical polygon and
   * the native host companion. Host parity suppresses only the feedback event;
   * canonical validation and selection outline remain identical. The physical
   * polygon focuses immediately; the host uses the existing explicit focus seam.
   */
  private selectPublicitySurface(place: Place, emitSelection = true): boolean {
    if (!this.selectionGraphics || place !== this.canonicalPublicityPlace()) return false
    this.clearProductionCompanySelection()
    this.selectedProductionId = null
    this.selectedPlaceId = PUBLICITY_PLACE_ID
    this.drawPlaceOutline(place, true)
    if (emitSelection) {
      this.emitEvent({
        type: 'place',
        place: {
          id: PUBLICITY_PLACE_ID,
          buildingId: PUBLICITY_BUILDING_ID,
          label: PUBLICITY_LABEL,
          affordances: [...PUBLICITY_AFFORDANCES],
        },
      })
    }
    return true
  }

  /** Host/DOM parity and physical-availability proof; never emits a feedback event. */
  selectPublicityFromHost(): boolean {
    const place = this.canonicalPublicityPlace()
    return place === null ? false : this.selectPublicitySurface(place, false)
  }

  /** Host/DOM parity: revalidate and paint exact service work without emitting an event. */
  selectSceneryLoadInFromHost(productionId: string): boolean {
    if (!this.selectionGraphics) return false
    const scenery = sceneryLoadInContext(this.snapshot)
    if (scenery?.operation.productionId !== productionId) return false
    const place = this.canonicalServiceYardPlace()
    return place === null ? false : this.selectSceneryLoadInSurface(place, false)
  }

  /**
   * One exact physical Annex selection seam shared by the parcel polygon and its
   * visible lifecycle label. The boolean suppresses only the host-parity event;
   * identity validation and outline selection remain identical.
   */
  private selectAnnexSurface(place: Place, emitSelection = true): boolean {
    if (place.id !== ANNEX_PLACE_ID || place.buildingId !== ANNEX_BUILDING_ID) return false
    this.clearProductionCompanySelection()
    this.selectedProductionId = null
    this.selectedPlaceId = place.id
    this.drawPlaceOutline(place, true)
    if (emitSelection) {
      this.emitEvent({
        type: 'place',
        place: {
          id: place.id,
          buildingId: place.buildingId,
          label: place.label,
          affordances: place.affordances,
        },
      })
    }
    return true
  }

  /** Host/DOM parity: select only the exact Annex place without re-emitting an event. */
  selectAnnexFromHost(): boolean {
    if (!this.selectionGraphics) return false
    const place = this.canonicalAnnexPlace()
    return place === null ? false : this.selectAnnexSurface(place, false)
  }

  /**
   * One physical Stage 7 selection seam. It resolves the latest snapshot at pointer
   * time and emits identity only; without exact managed authority it remains a place.
   */
  private selectStage7Surface(place: Place): void {
    if (place !== this.canonicalStage7Place()) return
    this.selectedPlaceId = place.id
    this.drawPlaceOutline(place, true)
    const operation = this.authoritativeStage7Operation(this.snapshot)
    if (operation !== null) {
      this.selectProductionCompanyPresentation(operation.productionId)
      this.selectedProductionId = operation.productionId
      this.emitEvent({
        type: 'production',
        production: {
          productionId: operation.productionId,
          locationBuildingId: 'stage-a',
        },
      })
      return
    }
    this.clearProductionCompanySelection()
    this.selectedProductionId = null
    this.emitEvent({
      type: 'place',
      place: {
        id: place.id,
        buildingId: place.buildingId,
        label: place.label,
        affordances: place.affordances,
      },
    })
  }

  /** Host/DOM parity: paint exact Stage 7 selection without re-emitting an event. */
  selectProductionFromHost(productionId: string): boolean {
    const operation = this.authoritativeStage7Operation(this.snapshot)
    if (operation?.productionId !== productionId) return false
    const place = this.canonicalStage7Place()
    if (place === null) return false
    this.selectProductionCompanyPresentation(operation.productionId)
    this.selectedProductionId = operation.productionId
    this.selectedPlaceId = place.id
    this.drawPlaceOutline(place, true)
    return true
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

  /**
   * WHAT THE RENDERER IS CURRENTLY HOLDING SELECTED (C1-M5 flake fix).
   *
   * A first-class read, deliberately not the debug seam: the host's repaint
   * reconciliation asks this before re-asserting a selection, so it must be as real
   * and as supported as the commands beside it. It reports the scene's own live
   * fields — there is no cached copy anywhere for them to drift from.
   */
  currentSelection(): { placeId: string | null; productionId: string | null; personId: string | null } {
    return {
      placeId: this.selectedPlaceId,
      productionId: this.selectedProductionId,
      personId: this.selectedPersonId,
    }
  }

  clearPlaceSelection(): void {
    this.selectedProductionId = null
    this.selectedPlaceId = null
    this.selectionGraphics?.clear()
  }

  /**
   * Resolve presentation focus only from the strict shared company selector. A
   * missing or malformed expanded claim clears this cue; it never borrows Stage 7,
   * title, array position, or the currently selected person as alternate authority.
   */
  private selectProductionCompanyPresentation(productionId: string): boolean {
    const contexts = activeProductionCompanyContexts(this.snapshot)
    const matches = contexts?.filter(
      (context) => context.operation.productionId === productionId,
    ) ?? []
    if (matches.length !== 1) {
      this.selectedCompanyProductionId = null
      this.paintPersonSelection()
      return false
    }
    this.selectedCompanyProductionId = productionId
    this.paintPersonSelection(contexts)
    return true
  }

  /** Host/DOM parity for phase-independent exact company focus. Emits no event. */
  selectProductionCompanyFromHost(productionId: string): boolean {
    return this.selectProductionCompanyPresentation(productionId)
  }

  /** Clear only company presentation; physical place/Stage selection is untouched. */
  clearProductionCompanySelection(): void {
    if (this.selectedCompanyProductionId === null) return
    this.selectedCompanyProductionId = null
    this.paintPersonSelection()
  }

  /**
   * Revalidate retained focus after every snapshot. Unrelated company removal keeps
   * the exact survivor; removal or corruption of the selected company clears neutral.
   */
  private reconcileProductionCompanySelection(): void {
    if (this.selectedCompanyProductionId === null) {
      this.paintPersonSelection()
      return
    }
    const contexts = activeProductionCompanyContexts(this.snapshot)
    const matches = contexts?.filter(
      (context) => context.operation.productionId === this.selectedCompanyProductionId,
    ) ?? []
    if (matches.length !== 1) this.selectedCompanyProductionId = null
    this.paintPersonSelection(contexts)
  }

  /**
   * Existing sprites own the complete cue: no Graphics, texture, badge, or draw owner.
   * The selected person remains gold and named; company peers are cool-highlighted;
   * every other visible person remains selectable at a bounded reduced emphasis.
   */
  private paintPersonSelection(
    contexts = activeProductionCompanyContexts(this.snapshot),
  ): void {
    const selectedCompany = contexts === null || this.selectedCompanyProductionId === null
      ? null
      : contexts.filter(
          (context) => context.operation.productionId === this.selectedCompanyProductionId,
        ).length === 1
        ? contexts.find(
            (context) => context.operation.productionId === this.selectedCompanyProductionId,
          ) ?? null
        : null
    const selectedCompanyPeople = new Set(
      selectedCompany?.members.map(({ person }) => person.id) ?? [],
    )

    for (const runtime of this.runtimePeople.values()) {
      const selectedPerson = runtime.fact.id === this.selectedPersonId
      const selectedCompanyMember = selectedCompanyPeople.has(runtime.fact.id)
      runtime.label.setVisible(selectedPerson)
      runtime.sprite
        .setTint(
          selectedPerson
            ? SELECTED_PERSON_TINT
            : selectedCompanyMember
              ? SELECTED_COMPANY_TINT
              : 0xffffff,
        )
        .setAlpha(
          selectedCompany === null || selectedPerson || selectedCompanyMember
            ? 1
            : OTHER_COMPANY_ALPHA,
        )
        .setScale(this.actorScale(
          selectedPerson ? 1.08 : selectedCompanyMember ? 1.03 : selectedCompany === null ? 1 : 0.96,
        ))
    }
  }

  private buildPeople(): void {
    this.reconcilePeople(lotPeopleForCompanyPresentation(this.snapshot))
  }

  private copyGateVisitor(
    visitor: HollywoodGateVisitorPresentation,
  ): HollywoodGateVisitorPresentation {
    return { ...visitor, offerTermWeeks: [...visitor.offerTermWeeks] }
  }

  private sameNumbers(actual: readonly number[], expected: readonly number[]): boolean {
    return actual.length === expected.length &&
      actual.every((value, index) => value === expected[index])
  }

  private gateVisitorMatchesLatest(visitor: HollywoodGateVisitorPresentation): boolean {
    if (
      typeof visitor !== 'object' ||
      visitor === null ||
      typeof visitor.talentId !== 'string' ||
      typeof visitor.name !== 'string' ||
      !['actor', 'director', 'writer', 'craft'].includes(visitor.marketRole) ||
      !['director', 'talent'].includes(visitor.presentationRole) ||
      visitor.employmentStatus !== 'freeAgent' ||
      typeof visitor.studioSeed !== 'string' ||
      !Number.isSafeInteger(visitor.marketWeek) ||
      !Array.isArray(visitor.offerTermWeeks) ||
      visitor.placeId !== GATE_PLACE_ID ||
      visitor.presentationRole !== (visitor.marketRole === 'director' ? 'director' : 'talent') ||
      this.canonicalGatePlace() === null
    ) return false

    const current = gateHiringCandidateContext(this.snapshot, visitor.talentId)
    if (current === null) return false
    return current.ownerIntent.talentId === visitor.talentId &&
      current.ownerIntent.studioSeed === visitor.studioSeed &&
      current.ownerIntent.name === visitor.name &&
      current.ownerIntent.creativeRole === visitor.marketRole &&
      current.marketWeek === visitor.marketWeek &&
      current.candidate.talentId === visitor.talentId &&
      current.candidate.name === visitor.name &&
      current.candidate.creativeRole === visitor.marketRole &&
      current.candidate.employmentStatus === visitor.employmentStatus &&
      this.sameNumbers(current.candidate.offerTermWeeks, visitor.offerTermWeeks)
  }

  private removeGateVisitorSprite(): void {
    this.gateVisitor?.sprite.destroy()
    this.gateVisitor = null
  }

  private discardGateVisitor(): void {
    this.requestedGateVisitor = null
    this.removeGateVisitorSprite()
  }

  private reconcileGateVisitor(): boolean {
    const requested = this.requestedGateVisitor
    if (requested === null || !this.gateVisitorMatchesLatest(requested)) {
      this.discardGateVisitor()
      return false
    }

    const presentation = this.copyGateVisitor(requested)
    if (this.gateVisitor !== null) {
      this.gateVisitor.presentation = presentation
      this.gateVisitor.sprite
        .setPosition(GATE_ARRIVAL_ANCHOR[0], GATE_ARRIVAL_ANCHOR[1])
        .setOrigin(0.5, 0.92)
        .setDepth(97)
        .setScale(this.actorScale(1))
      this.setActorFacing(
        this.gateVisitor.sprite,
        presentation.presentationRole,
        'south',
      )
      return true
    }

    const sprite = this.add.sprite(
      GATE_ARRIVAL_ANCHOR[0],
      GATE_ARRIVAL_ANCHOR[1],
      `hollywood-${presentation.presentationRole}`,
    ).setOrigin(0.5, 0.92).setDepth(97)
    sprite.setScale(this.actorScale(1))
    this.setActorFacing(sprite, presentation.presentationRole, 'south')
    sprite.setInteractive({ useHandCursor: true }).on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isCanvasPointer(pointer)) return
      if (!this.reconcileGateVisitor() || this.gateVisitor === null) return
      pointer.event.stopPropagation?.()
      this.emitEvent({
        type: 'gate-visitor',
        visitor: { talentId: this.gateVisitor.presentation.talentId },
      })
    })
    this.gateVisitor = { presentation, sprite }
    return true
  }

  /**
   * Retain only a complete current candidate request. Invalid/stale requests clear
   * physical state and can never resurrect from a later unrelated snapshot.
   */
  setGateVisitor(visitor: HollywoodGateVisitorPresentation | null): boolean {
    if (visitor === null) {
      this.discardGateVisitor()
      return true
    }
    if (!this.gateVisitorMatchesLatest(visitor)) {
      this.discardGateVisitor()
      return false
    }
    const requested = this.copyGateVisitor(visitor)
    this.requestedGateVisitor = requested
    return this.reconcileGateVisitor()
  }

  /**
   * Reconcile the narrow snapshot facts by stable person id. Hollywood owns only the
   * sprites: additions, changed display facts, and removals all follow the latest
   * authoritative snapshot without retaining a Talent or Production object.
   */
  private reconcilePeople(people: readonly LotPersonState[]): void {
    const identityCounts = new Map<string, number>()
    for (const person of people) {
      identityCounts.set(person.id, (identityCounts.get(person.id) ?? 0) + 1)
    }
    const uniquePeople = people.filter((person) => identityCounts.get(person.id) === 1)
    const nextById = new Map(uniquePeople.map((person) => [person.id, person]))

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
    const orderedPeople = [...uniquePeople].sort(
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
          existing.direction = 'south'
          existing.sprite.setScale(this.actorScale(1))
          this.setActorFacing(existing.sprite, person.role, existing.direction)
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
      sprite.setScale(this.actorScale(1))
      this.setActorFacing(sprite, person.role, 'south')
      sprite.setInteractive({ useHandCursor: true })
      sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!this.isCanvasPointer(pointer)) return
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
      this.runtimePeople.set(person.id, { fact: person, sprite, label, homeSlot, direction: 'south' })
    }
  }

  private buildAmbientLife(): void {
    const specs: Array<{ role: RoleAtlasRole; a: Point; b: Point; phase: number; speed: number }> = [
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
      const scaleMultiplier = spec.role === 'extra' ? 0.82 : 0.9
      const direction = directionFromDelta(spec.b.x - spec.a.x, spec.b.y - spec.a.y)
      sprite.setScale(this.actorScale(scaleMultiplier))
      this.setActorFacing(sprite, spec.role, direction)
      sprite.setDepth(52 + spec.a.y / 28)
      this.ambientActors.push({
        sprite,
        role: spec.role,
        direction,
        a: spec.a,
        b: spec.b,
        phase: spec.phase,
        speed: spec.speed,
      })
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

  private hasValidRoleAtlas(): boolean {
    this.roleAtlasManifest = null
    const candidate = this.cache.json.get(ROLE_ATLAS_CACHE_KEY) as unknown
    if (!isRoleAtlasRuntimeManifest(candidate) || !this.textures.exists(ROLE_ATLAS_TEXTURE_KEY)) {
      return false
    }
    const texture = this.textures.get(ROLE_ATLAS_TEXTURE_KEY)
    const source = texture.getSourceImage()
    if (source.width !== candidate.width || source.height !== candidate.height) return false
    if (source.width * source.height * 4 !== ROLE_ATLAS_DECODED_BYTES) return false
    for (let index = 0; index < ROLE_ATLAS_FRAME_COUNT; index++) {
      if (!texture.has(String(index))) return false
    }
    if (texture.has(String(ROLE_ATLAS_FRAME_COUNT))) return false
    this.roleAtlasManifest = candidate
    return true
  }

  private actorScale(multiplier: number): number {
    return (this.roleAtlasActive ? ROLE_ATLAS_RENDER_SCALE : 1) * multiplier
  }

  private setActorFacing(
    sprite: Phaser.GameObjects.Sprite,
    role: RoleAtlasRole,
    direction: RoleAtlasDirection,
  ): void {
    if (this.roleAtlasActive) {
      sprite.setTexture(ROLE_ATLAS_TEXTURE_KEY, roleAtlasFrame(role, direction))
      sprite.setFlipX(false)
      return
    }
    sprite.setTexture(`hollywood-${role}`)
    sprite.setFlipX(direction === 'west')
  }

  private loadedRoleAtlasBytes(): number {
    if (!this.textures.exists(ROLE_ATLAS_TEXTURE_KEY)) return 0
    const source = this.textures.get(ROLE_ATLAS_TEXTURE_KEY).getSourceImage()
    return source.width * source.height * 4
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
    this.scale.on('resize', () => this.preserveCameraOnResize())
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _over: unknown[], _dx: number, dy: number) => {
      if (!this.isCanvasPointer(pointer)) return
      const camera = this.cameras.main
      camera.setZoom(Phaser.Math.Clamp(camera.zoom * (dy > 0 ? 0.91 : 1.1), this.fitZoom * 0.85, this.fitZoom * 1.85))
    })
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isCanvasPointer(pointer)) return
      this.dragOrigin = { x: pointer.x, y: pointer.y, scrollX: this.cameras.main.scrollX, scrollY: this.cameras.main.scrollY }
    })
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isCanvasPointer(pointer)) return
      if (!pointer.isDown || !this.dragOrigin || pointer.getDistance() < 5) return
      this.cameras.main.scrollX = this.dragOrigin.scrollX - (pointer.x - this.dragOrigin.x) / this.cameras.main.zoom
      this.cameras.main.scrollY = this.dragOrigin.scrollY - (pointer.y - this.dragOrigin.y) / this.cameras.main.zoom
    })
    this.input.on('pointerup', () => { this.dragOrigin = null })
  }

  /** Phaser can observe document-level input even when a React overlay owns the hit. */
  private isCanvasPointer(pointer: Phaser.Input.Pointer): boolean {
    return !this.inputSuspended && pointer.event?.target === this.game.canvas
  }

  private fitCamera(): void {
    const camera = this.cameras.main
    this.fitZoom = Math.min(camera.width / DISTRICT_W, camera.height / DISTRICT_H)
    camera.setZoom(this.fitZoom)
    camera.centerOn(DISTRICT_W / 2, DISTRICT_H / 2)
  }

  private preserveCameraOnResize(): void {
    const camera = this.cameras.main
    const scrollX = camera.scrollX
    const scrollY = camera.scrollY
    const zoom = camera.zoom
    // React chrome can change the RESIZE canvas box when a transient rail appears.
    // That is not player consent to a new camera preset. Refresh only the bounds used
    // by future wheel clamping and restore the exact live transform.
    this.fitZoom = Math.min(camera.width / DISTRICT_W, camera.height / DISTRICT_H)
    camera.setZoom(zoom)
    camera.scrollX = scrollX
    camera.scrollY = scrollY
  }

  applySnapshot(snapshot: StudioLotSnapshot): void {
    const previousStage7 = this.authoritativeStage7Operation(this.snapshot)
    const previousScenery = sceneryLoadInContext(this.snapshot)
    this.snapshot = snapshot
    this.reconcileGateVisitor()
    if (!this.scene.isActive()) {
      // A transition received while the renderer is inactive becomes direct-load
      // truth when it resumes; it must not retain or replay an unseen ceremony.
      this.cosmeticSceneryLoadIn = null
      return
    }

    this.reconcilePeople(lotPeopleForCompanyPresentation(snapshot))
    const nextStage7 = this.authoritativeStage7Operation(snapshot)
    const nextScenery = sceneryLoadInContext(snapshot)
    if (
      this.selectedProductionId !== null &&
      (this.selectedPlaceId === SERVICE_YARD_PLACE_ID
        ? nextScenery?.operation.productionId !== this.selectedProductionId
        : nextStage7?.productionId !== this.selectedProductionId)
    ) this.clearPlaceSelection()
    if (
      this.cosmeticRoute !== null &&
      (nextStage7 === null ||
        nextStage7.productionId !== this.cosmeticRoute.productionId ||
        nextStage7.directorId !== this.cosmeticRoute.personId ||
        nextStage7.taskStatus !== 'blocked')
    ) {
      this.cosmeticRoute = null
    }
    if (
      this.cosmeticSceneryLoadIn !== null &&
      (nextScenery?.state !== 'ready' ||
        nextScenery.operation.productionId !== this.cosmeticSceneryLoadIn.productionId)
    ) {
      const cancelledSweep = this.cosmeticSceneryLoadIn
      this.cosmeticSceneryLoadIn = null
      // Scheduling is allowed while the flat is moving. Authoritative scheduled
      // truth cancels the drawing immediately, but the already-accepted clear still
      // receives its single acknowledgement rather than silently disappearing.
      const exactScheduledStage7 = this.authoritativeStage7Operation(snapshot)
      if (
        exactScheduledStage7?.productionId === cancelledSweep.productionId &&
        exactScheduledStage7.taskStatus === 'scheduled'
      ) this.announceCosmeticSceneryLoadIn(cancelledSweep)
    }

    const acceptedDirectorDispatch =
      previousStage7 !== null &&
      nextStage7 !== null &&
      previousStage7.productionId === nextStage7.productionId &&
      previousStage7.taskStatus === 'unassigned' &&
      nextStage7.taskStatus === 'blocked'
    if (acceptedDirectorDispatch) this.beginCosmeticDirectorRoute(nextStage7)

    const acceptedSceneryClear =
      previousScenery?.state === 'blocked' &&
      nextScenery?.state === 'ready' &&
      previousScenery.operation.productionId === nextScenery.operation.productionId

    this.syncPeopleToAuthoritativeSnapshot(nextStage7)
    this.reconcileProductionCompanySelection()
    this.paintAuthoritativeStage7(nextStage7)
    this.paintSceneryLoadIn(nextScenery)
    if (acceptedSceneryClear) this.beginCosmeticSceneryLoadIn(nextScenery.operation)
    this.paintExpansion(snapshot)
  }

  private paintSceneryLoadIn(context: ReturnType<typeof sceneryLoadInContext>): void {
    const g = this.sceneryGraphics
    if (!g) return
    g.clear()
    if (context === null) return
    const sourcePlace = this.canonicalServiceYardPlace()
    const destinationPlace = this.canonicalStage7Place()
    const source = sourcePlace?.anchors.loadIn
    const destination = destinationPlace?.anchors.service
    if (!source || !destination) return

    const [sourceX, sourceY] = source
    const [destinationX, destinationY] = destination
    const sweep = this.cosmeticSceneryLoadIn?.productionId === context.operation.productionId
      ? this.cosmeticSceneryLoadIn
      : null

    if (context.state === 'blocked') {
      // Amber relationship + paired flats + exclamation. The distinct source shapes
      // keep the hold readable without relying on colour alone. Keep the visible
      // source marker fully inside the authored service-yard polygon; the draw-only
      // graphics and the depth-1 polygon then remain one honest physical affordance.
      const markerX = sourceX - 12
      g.lineStyle(5, 0xd28d2d, 0.92).lineBetween(sourceX, sourceY, destinationX, destinationY)
      g.fillStyle(0x302416, 0.96).fillRect(markerX - 30, sourceY - 18, 46, 32)
      g.lineStyle(3, 0xf0c36d, 1).strokeRect(markerX - 30, sourceY - 18, 46, 32)
      g.fillStyle(0x8b4b20, 1).fillCircle(markerX, sourceY - 24, 13)
      g.lineStyle(4, 0xffefd0, 1).lineBetween(markerX, sourceY - 31, markerX, sourceY - 22)
      g.fillStyle(0xffefd0, 1).fillCircle(markerX, sourceY - 17, 2)
      g.lineStyle(3, 0xf0c36d, 0.9).strokeCircle(destinationX, destinationY, 18)
      return
    }

    // Ready truth is always painted immediately. The optional sweep only acknowledges
    // the already-accepted blocked → ready replacement and never gates the command.
    const markerX = sourceX - 12
    g.lineStyle(5, 0x61b47a, 0.88).lineBetween(sourceX, sourceY, destinationX, destinationY)
    g.fillStyle(0x274b35, 1).fillRect(markerX - 12, sourceY - 12, 24, 24)
    g.lineStyle(3, 0xbfe5ba, 1).strokeRect(markerX - 12, sourceY - 12, 24, 24)
    g.lineStyle(5, 0xe8f5d8, 1)
      .lineBetween(destinationX - 16, destinationY, destinationX - 5, destinationY + 12)
      .lineBetween(destinationX - 5, destinationY + 12, destinationX + 19, destinationY - 15)
    g.lineStyle(3, 0x61b47a, 0.92).strokeCircle(destinationX, destinationY, 27)
    if (sweep === null) return

    const progress = Phaser.Math.Clamp(sweep.elapsed / SCENERY_SWEEP_DURATION_MS, 0, 1)
    const eased = Phaser.Math.Easing.Sine.InOut(progress)
    const x = Phaser.Math.Linear(sourceX, destinationX, eased)
    const y = Phaser.Math.Linear(sourceY, destinationY, eased)
    g.fillStyle(0x382b1d, 1).fillRect(x - 22, y - 14, 44, 28)
    g.lineStyle(3, 0xf0c36d, 1).strokeRect(x - 22, y - 14, 44, 28)
    g.lineBetween(x, y - 14, x, y + 14)
  }

  private beginCosmeticSceneryLoadIn(operation: ProductionOperationsState): void {
    this.cosmeticSceneryLoadIn = {
      productionId: operation.productionId,
      title: operation.title,
      elapsed: 0,
    }
    if (this.reducedMotion) {
      this.finishCosmeticSceneryLoadIn()
      return
    }
    this.paintSceneryLoadIn(sceneryLoadInContext(this.snapshot))
  }

  private finishCosmeticSceneryLoadIn(): void {
    const sweep = this.cosmeticSceneryLoadIn
    if (!sweep) return
    this.cosmeticSceneryLoadIn = null
    this.paintSceneryLoadIn(sceneryLoadInContext(this.snapshot))
    this.announceCosmeticSceneryLoadIn(sweep)
  }

  private announceCosmeticSceneryLoadIn(sweep: CosmeticSceneryLoadIn): void {
    this.emitEvent({
      type: 'activity',
      text: `${sweep.title} scenery reached Soundstage 7. The shooting take is ready to schedule.`,
    })
  }

  /**
   * Paint the fixed Annex parcel from the same snapshot used by the DOM
   * companion. This is a decorative projection only: no animation or scene
   * interaction advances its clock, spends cash, or changes its lifecycle.
   */
  private paintExpansion(snapshot: StudioLotSnapshot): void {
    const fact = snapshot.buildings.find((building) => building.id === 'expansion')
    this.expansionStatus = fact?.constructionStatus ?? 'legacy'
    if (!this.expansionGraphics || !this.expansionLabel) return
    const place = this.manifest.places.find((candidate) => candidate.buildingId === 'expansion')
    if (!place) {
      this.expansionGraphics.clear()
      this.expansionLabel.setVisible(false)
      return
    }
    const points = place.selectionPolygon.map(([x, y]) => new Phaser.Math.Vector2(x, y))
    const xs = place.selectionPolygon.map(([x]) => x)
    const ys = place.selectionPolygon.map(([, y]) => y)
    const left = Math.min(...xs)
    const right = Math.max(...xs)
    const top = Math.min(...ys)
    const bottom = Math.max(...ys)
    const cx = (left + right) / 2
    const g = this.expansionGraphics
    g.clear()

    const status = this.expansionStatus
    // Work presence is presentation-only and fail-closed. Operational construction
    // remains visible when its narrow Calendar projection is absent or hostile, but
    // the scene must not invent Available, Working, or Held in that case.
    const work = status === 'operational'
      ? operationalAnnexWorkContext(snapshot)
      : null
    const progress = Math.max(0, Math.min(1, fact?.constructionProgress01 ?? 0))
    g.fillStyle(status === 'operational' ? 0x263e35 : 0x5a4b31, status === 'legacy' ? 0.12 : 0.26)
    g.fillPoints(points, true)
    g.lineStyle(status === 'legacy' ? 2 : 4, status === 'operational' ? 0xe0c77e : 0xc59c55, 0.94)
    g.strokePoints(points, true)

    if (status === 'vacant' || status === 'legacy') {
      // Survey stakes make the fixed footprint readable without pretending a
      // facility already exists.
      for (const [x, y] of place.selectionPolygon) {
        g.fillStyle(status === 'legacy' ? 0x756b55 : 0xe0c77e, 0.95)
        g.fillRect(x - 3, y - 15, 6, 20)
      }
    } else {
      const buildHeight = status === 'operational' ? 104 : 30 + Math.round(progress * 74)
      const width = Math.min(190, Math.max(110, right - left - 70))
      const baseY = bottom - 35
      g.fillStyle(0x3c352b, 0.98).fillRect(cx - width / 2 - 8, baseY, width + 16, 16)
      g.fillStyle(status === 'operational' ? 0xb8ae91 : 0x807257, 0.98)
      g.fillRect(cx - width / 2, baseY - buildHeight, width, buildHeight)
      g.fillStyle(0x2e493e, 1).fillRect(cx - width / 2 - 5, baseY - buildHeight - 10, width + 10, 12)
      g.lineStyle(3, 0xd6b96e, 0.95).strokeRect(cx - width / 2, baseY - buildHeight, width, buildHeight)
      if (status === 'building') {
        // Static scaffold is reduced-motion safe; progress is read from the
        // persisted integer week count and never from animation time.
        g.lineStyle(3, 0xd6b96e, 0.9)
        for (let x = cx - width / 2 - 14; x <= cx + width / 2 + 14; x += 36) {
          g.lineBetween(x, baseY - 116, x, baseY + 8)
        }
        for (let y = baseY - 108; y <= baseY; y += 27) {
          g.lineBetween(cx - width / 2 - 18, y, cx + width / 2 + 18, y)
        }
      } else {
        // A static window/work-light treatment makes exact current use readable at
        // world scale. It reuses this one retained Graphics object: no actor, route,
        // texture, animation clock, or additional display object is created.
        const windowColor = work?.state === 'working'
          ? 0xf0c66e
          : work?.state === 'held'
            ? 0xd58448
            : 0x294c45
        g.fillStyle(windowColor, 1)
        for (let x = cx - width / 2 + 18; x < cx + width / 2 - 10; x += 35) {
          g.fillRect(x, baseY - 62, 18, 28)
        }
        g.fillStyle(0x7b2c24, 1).fillRect(cx - 14, baseY - 45, 28, 45)
        if (work?.state === 'working' || work?.state === 'held') {
          g.fillStyle(work.state === 'working' ? 0xffe6a1 : 0xe4a05d, 1)
          g.fillCircle(cx, baseY - 53, 5)
        }
      }
    }

    const label =
      status === 'legacy'
        ? 'STUDIO DEVELOPMENT · UNMANAGED'
        : status === 'vacant'
          ? 'EXPANSION PARCEL · VACANT'
          : status === 'building'
            ? `ANNEX BUILDING · ${fact?.constructionProgressText ?? ''}`
            : work?.state === 'available'
              ? 'DEVELOPMENT & CASTING ANNEX · AVAILABLE'
              : work?.state === 'working'
                ? 'DEVELOPMENT & CASTING ANNEX · WORKING'
                : work?.state === 'held'
                  ? 'DEVELOPMENT & CASTING ANNEX · PRODUCTION HELD'
                  : 'DEVELOPMENT & CASTING ANNEX · OPERATIONAL'
    this.expansionLabel.setText(label).setPosition(cx, top - 8).setVisible(true)
  }

  /** Exact Soundstage 7 only. Presentation-assigned legacy stages never qualify. */
  private authoritativeStage7Operation(
    snapshot: StudioLotSnapshot,
  ): ProductionOperationsState | null {
    return stage7ProductionDetailContext(snapshot)?.operation ?? null
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
    runtime.direction = 'south'
    this.setActorFacing(runtime.sprite, runtime.fact.role, runtime.direction)
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
      const hasLegacyStage7 = this.snapshot.operationsMode !== 'managed' &&
        Array.isArray(this.snapshot.productionOperations) &&
        this.snapshot.productionOperations.some(
          (operation) => operation?.locationBuildingId === 'stage-a',
        )
      this.stageStateText?.setText(
        hasLegacyStage7 ? 'STAGE 7 · LEGACY DISPLAY SCHEDULE' : 'STAGE 7 · AVAILABLE',
      )
      this.stageLamp?.setFillStyle(hasLegacyStage7 ? 0x655634 : 0x2e754f, 1)
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
    director.label
      .setPosition(start.x, start.y - 72)
      .setVisible(this.selectedPersonId === operation.directorId)
    const next = this.route[1]!
    director.direction = directionFromDelta(next.x - start.x, next.y - start.y, director.direction)
    this.setActorFacing(director.sprite, director.fact.role, director.direction)
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
    const contexts = activeProductionCompanyContexts(this.snapshot)
    const companyMatches = contexts?.filter((context) =>
      context.members.some(({ person }) => person.id === personId)
    ) ?? []
    this.selectedCompanyProductionId = companyMatches.length === 1
      ? companyMatches[0]!.operation.productionId
      : null
    this.paintPersonSelection(contexts)
    this.emitEvent({ type: 'person', person: runtime.fact })
  }

  clearPersonSelection(): void {
    if (this.selectedPersonId === null) return
    this.selectedPersonId = null
    this.paintPersonSelection()
    this.emitEvent({ type: 'person', person: null })
  }

  /**
   * Local acknowledgement of an already-accepted App/Engine result. React owns
   * the sole live announcement; this method emits no event and changes no snapshot.
   */
  playPublicity(success: boolean, _detail?: string): boolean {
    const place = this.canonicalPublicityPlace()
    if (!success || place === null || !this.flash || !this.scene.isActive()) {
      this.clearPublicityVisual()
      return false
    }
    const photocall = place.anchors.photocall
    this.clearPublicityVisual()
    this.flash.setPosition(photocall[0], photocall[1])
    if (this.reducedMotion) return true
    this.flash.setAlpha(0.72)
    this.tweens.add({
      targets: this.flash,
      alpha: 0,
      duration: 420,
      repeat: 2,
      repeatDelay: 210,
      onComplete: () => this.flash?.setAlpha(0),
    })
    return true
  }

  private clearPublicityVisual(): void {
    if (!this.flash) return
    this.tweens.killTweensOf(this.flash)
    this.flash.setAlpha(0)
  }

  private focusPlace(place: Place): void {
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

  focus(placeId: string): void {
    if (placeId === PUBLICITY_PLACE_ID) {
      const publicity = this.canonicalPublicityPlace()
      if (publicity) this.focusPlace(publicity)
      return
    }
    if (placeId === GATE_PLACE_ID) {
      this.focusGateFromHost()
      return
    }
    const place = this.manifest.places.find((candidate) => candidate.id === placeId)
    if (!place || this.isPublicityLikePlace(place) || this.isGateLikePlace(place)) return
    this.focusPlace(place)
  }

  resetCamera(): void { this.fitCamera() }

  /**
   * Disable only world controls while a modal is open. Both transitions clear
   * Phaser pointer/key state and the local drag latch so no held gesture survives
   * the boundary; scene animation intentionally continues.
   */
  setInputSuspended(on: boolean): void {
    this.inputSuspended = on
    this.dragOrigin = null
    this.input.resetPointers()
    this.input.keyboard?.resetKeys()
    this.input.enabled = !on
    if (this.input.keyboard) this.input.keyboard.enabled = !on
  }

  /** Freeze Hollywood's ambient/tweened motion while preserving every control and fact. */
  setReducedMotion(on: boolean): void {
    this.reducedMotion = on
    if (on) {
      this.clearPublicityVisual()
      this.vehicleTween?.pause()
      if (this.roleAtlasActive) {
        for (const actor of this.ambientActors) {
          actor.direction = 'south'
          this.setActorFacing(actor.sprite, actor.role, actor.direction)
        }
      }
      if (this.cosmeticRoute) this.finishCosmeticDirectorRoute()
      if (this.cosmeticSceneryLoadIn) this.finishCosmeticSceneryLoadIn()
      return
    }
    this.vehicleTween?.resume()
  }

  /** Persistent Stage 7 truth owns this Graphics object exclusively. */
  private setShootingVisual(state: string): void {
    const activity = this.manifest.activities.find((candidate) => candidate.id === 'shooting')
    const place = activity ? this.manifest.places.find((candidate) => candidate.id === activity.place) : undefined
    if (!activity || !place || !activity.visualStates.includes(state) || !this.activityGraphics) return
    const anchor = place.anchors.crewCall
    if (!anchor) return
    const [x, y] = anchor
    const g = this.activityGraphics
    g.clear()
    g.fillStyle(0xffcb6b, state === 'take-in-progress' ? 0.48 : 0.24).fillEllipse(x, y, 230, 88)
    g.lineStyle(5, 0xe7c477, 0.9).lineBetween(x - 76, y + 29, x + 76, y - 28)
    g.fillStyle(0x1a2020, 1).fillCircle(x - 72, y + 28, 8).fillCircle(x + 74, y - 27, 8)
    if (state !== 'crew-call') {
      g.fillStyle(0x121919, 0.95).fillRect(x - 36, y - 21, 72, 44)
      g.lineStyle(3, 0xe2c273, 0.8).strokeRect(x - 36, y - 21, 72, 44)
    }
  }

  update(_time: number, delta: number): void {
    const updateStart = performance.now()
    this.capturePerformanceFrame = this.performanceWarmupFramesRemaining === 0
    if (!this.capturePerformanceFrame) {
      this.performanceWarmupFramesRemaining--
    } else {
      // Phaser smooths the callback delta by default. rawDelta is the actual wall-frame
      // interval and therefore the only honest input for p99, 1%-low, and worst-frame.
      const rawFrameMs = this.game?.loop?.rawDelta ?? delta
      if (Number.isFinite(rawFrameMs) && rawFrameMs > 0) {
        this.frameSamples.push(rawFrameMs)
        if (this.frameSamples.length > PERFORMANCE_SAMPLE_FRAMES) this.frameSamples.shift()
        this.worstFrameMs = Math.max(...this.frameSamples)
      }
    }

    if (!this.reducedMotion) {
      for (const actor of this.ambientActors) {
        const previousX = actor.sprite.x
        const previousY = actor.sprite.y
        actor.phase = (actor.phase + delta * actor.speed) % 1
        const t = (1 - Math.cos(actor.phase * Math.PI * 2)) / 2
        actor.sprite.x = Phaser.Math.Linear(actor.a.x, actor.b.x, t)
        actor.sprite.y = Phaser.Math.Linear(actor.a.y, actor.b.y, t) + Math.sin(actor.phase * Math.PI * 4) * 1.5
        actor.sprite.setDepth(52 + actor.sprite.y / 28)
        actor.direction = directionFromDelta(
          actor.sprite.x - previousX,
          actor.sprite.y - previousY,
          actor.direction,
        )
        if (this.roleAtlasActive) this.setActorFacing(actor.sprite, actor.role, actor.direction)
        else actor.sprite.setFlipX(actor.phase > 0.5)
      }
    }

    if (this.cosmeticRoute) this.updateCosmeticDirectorRoute(delta)
    if (this.cosmeticSceneryLoadIn) {
      this.cosmeticSceneryLoadIn.elapsed += delta
      if (this.cosmeticSceneryLoadIn.elapsed >= SCENERY_SWEEP_DURATION_MS) {
        this.finishCosmeticSceneryLoadIn()
      } else {
        this.paintSceneryLoadIn(sceneryLoadInContext(this.snapshot))
      }
    }

    if (this.capturePerformanceFrame) {
      const updateMs = performance.now() - updateStart
      this.updateSamples.push(updateMs)
      if (this.updateSamples.length > PERFORMANCE_SAMPLE_FRAMES) this.updateSamples.shift()
      this.worstUpdateMs = Math.max(...this.updateSamples)
    }
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
    const x = Phaser.Math.Linear(a.x, b.x, eased)
    const y = Phaser.Math.Linear(a.y, b.y, eased)
    runtime.sprite.setPosition(x, y)
    runtime.sprite.setDepth(local < 0.52 ? a.actorDepth : b.actorDepth)
    runtime.label.setPosition(x, y - 72)
    runtime.direction = directionFromDelta(b.x - a.x, b.y - a.y, runtime.direction)
    this.setActorFacing(runtime.sprite, runtime.fact.role, runtime.direction)
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

  private bindDrawCallTelemetry(): void {
    const renderer = this.game.renderer
    if (!('pipelines' in renderer)) return
    const webgl = renderer as Phaser.Renderer.WebGL.WebGLRenderer
    webgl.pipelines.pipelines.each((_key, pipeline) => {
      pipeline.on(
        Phaser.Renderer.WebGL.Pipelines.Events.BEFORE_FLUSH,
        this.capturePipelineDrawCalls,
        this,
      )
      this.drawPipelines.push(pipeline)
      return true
    })
    this.game.events.on(Phaser.Core.Events.PRE_RENDER, this.resetFrameDrawCalls, this)
    this.game.events.on(Phaser.Core.Events.POST_RENDER, this.commitFrameDrawCalls, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.PRE_RENDER, this.resetFrameDrawCalls, this)
      this.game.events.off(Phaser.Core.Events.POST_RENDER, this.commitFrameDrawCalls, this)
      for (const pipeline of this.drawPipelines) {
        pipeline.off(
          Phaser.Renderer.WebGL.Pipelines.Events.BEFORE_FLUSH,
          this.capturePipelineDrawCalls,
          this,
        )
      }
      this.drawPipelines = []
    })
  }

  private resetFrameDrawCalls(): void {
    this.currentFrameDrawCalls = 0
  }

  private capturePipelineDrawCalls(pipeline: Phaser.Renderer.WebGL.WebGLPipeline): void {
    this.currentFrameDrawCalls += Math.max(1, pipeline.batch.length)
  }

  private commitFrameDrawCalls(): void {
    if (!this.capturePerformanceFrame || this.currentFrameDrawCalls <= 0) return
    this.drawCallSamples.push(this.currentFrameDrawCalls)
    if (this.drawCallSamples.length > PERFORMANCE_SAMPLE_FRAMES) this.drawCallSamples.shift()
  }

  /**
   * Start a fresh sustained-measurement window after scene boot or a sleeping tab wakes.
   * The warm-up excludes texture upload and wake transients without smoothing measured stalls.
   */
  resetPerformanceTelemetry(): void {
    this.frameSamples = []
    this.updateSamples = []
    this.drawCallSamples = []
    this.currentFrameDrawCalls = 0
    this.performanceWarmupFramesRemaining = PERFORMANCE_WARMUP_FRAMES
    this.capturePerformanceFrame = false
    this.worstFrameMs = 0
    this.worstUpdateMs = 0
  }

  performanceStats(): HollywoodPerformance {
    const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
    const percentile = (values: number[], fraction: number) => {
      if (values.length === 0) return 0
      const sorted = [...values].sort((a, b) => a - b)
      return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] ?? 0
    }
    const frameMs = average(this.frameSamples)
    const p99FrameMs = percentile(this.frameSamples, 0.99)
    const updateMs = average(this.updateSamples)
    const roleAtlasBytes = this.loadedRoleAtlasBytes()
    const peopleTextureBytes = roleAtlasBytes + FALLBACK_PEOPLE_DECODED_BYTES
    const totalTextureBytes = this.manifest.textureMemoryBytes
      + peopleTextureBytes
      + GENERATED_VEHICLE_DECODED_BYTES
    return {
      rendererKind: 'hollywood-2d',
      frameSampleCount: this.frameSamples.length,
      fps: Math.round(frameMs ? 1000 / frameMs : this.game.loop.actualFps || 0),
      displayObjects: this.children.length,
      textureMemoryBytes: totalTextureBytes,
      textureMemoryMb: Math.round((totalTextureBytes / 1024 / 1024) * 10) / 10,
      districtTextureMemoryMb: Math.round((this.manifest.textureMemoryBytes / 1024 / 1024) * 10) / 10,
      peopleTextureMemoryMb: Math.round((peopleTextureBytes / 1024 / 1024) * 10) / 10,
      roleAtlasActive: this.roleAtlasActive,
      roleAtlasEncodedKb: Math.round((this.roleAtlasManifest?.atlasEncodedBytes ?? 0) / 1024),
      roleAtlasDecodedMb: Math.round((roleAtlasBytes / 1024 / 1024) * 10) / 10,
      drawCalls: Math.round(average(this.drawCallSamples)),
      frameMs: Math.round(frameMs * 100) / 100,
      p99FrameMs: Math.round(p99FrameMs * 100) / 100,
      onePercentLowFps: Math.round(p99FrameMs ? 1000 / p99FrameMs : 0),
      worstFrameMs: Math.round(this.worstFrameMs * 100) / 100,
      updateMs: Math.round(updateMs * 100) / 100,
      worstUpdateMs: Math.round(this.worstUpdateMs * 100) / 100,
      renderMsEstimate: Math.round(Math.max(0, frameMs - updateMs) * 100) / 100,
      dynamicActors: this.ambientActors.length +
        this.runtimePeople.size +
        (this.vehicle ? 1 : 0) +
        (this.gateVisitor ? 1 : 0),
    }
  }


  debugState(): {
    selectedPersonId: string | null
    selectedPlaceId: string | null
    selectedProductionId: string | null
    selectedCompanyProductionId: string | null
    stage7Operation: ProductionOperationsState | null
    routeProductionId: string | null
    sceneryLoadInState: 'blocked' | 'ready' | null
    scenerySweepProductionId: string | null
    scenerySweepElapsedMs: number | null
    manifestId: string
    routeDepths: number[]
    expansionStatus: 'legacy' | 'vacant' | 'building' | 'operational'
    roleAtlasActive: boolean
    gateVisitorTalentId: string | null
    gateVisitorPosition: { x: number; y: number; depth: number } | null
  } {
    return {
      selectedPersonId: this.selectedPersonId,
      selectedPlaceId: this.selectedPlaceId,
      selectedProductionId: this.selectedProductionId,
      selectedCompanyProductionId: this.selectedCompanyProductionId,
      stage7Operation: this.authoritativeStage7Operation(this.snapshot),
      routeProductionId: this.cosmeticRoute?.productionId ?? null,
      sceneryLoadInState: sceneryLoadInContext(this.snapshot)?.state ?? null,
      scenerySweepProductionId: this.cosmeticSceneryLoadIn?.productionId ?? null,
      scenerySweepElapsedMs: this.cosmeticSceneryLoadIn?.elapsed ?? null,
      manifestId: this.manifest.districtId,
      routeDepths: this.route.map((point) => point.actorDepth),
      expansionStatus: this.expansionStatus,
      roleAtlasActive: this.roleAtlasActive,
      gateVisitorTalentId: this.gateVisitor?.presentation.talentId ?? null,
      gateVisitorPosition: this.gateVisitor === null ? null : {
        x: this.gateVisitor.sprite.x,
        y: this.gateVisitor.sprite.y,
        depth: this.gateVisitor.sprite.depth,
      },
    }
  }
}
