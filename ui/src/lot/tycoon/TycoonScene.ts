// ── TycoonScene — the Studio Lot as a navigable isometric property ────────────
//
// This scene replaces the fixed painted district (`../hollywood/HollywoodScene.ts`,
// retained behind its flag as rollback) with the thing the Owner's ruling asked for: a
// studio you look at from above, move a camera over, and click parts of.
//
// What it owns
//   • the whole graded property on a 28×26 isometric grid (`./world.ts`), with all nine
//     addressable places present as physical footprints, plus roads, plaza, aprons, the
//     Annex parcel and the Scenery & Service yard;
//   • a true tycoon camera — absolute zoom 0.32…1.90 at the cursor, drag / WASD / arrow
//     / edge pan, named framings, and three LOD bands;
//   • the SAME host-facing event and command surface Operation Hollywood established, so
//     every existing panel, verb and retained workspace keeps working unchanged.
//
// What it does NOT own: any simulation rule. It reads a `StudioLotSnapshot` and paints.
// No route timer, tween or update() tick advances a task, a production or a build
// (shift law 2). Every scene handler accepts only events whose native target is the game
// canvas (shift law 7), so over-canvas React chrome always wins its own clicks.

import Phaser from 'phaser'
import type {
  BuildingId,
  LotPersonState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from '../snapshot/StudioLotSnapshot'
import { ALL_BUILDING_IDS, BUILDING_LABELS } from '../snapshot/StudioLotSnapshot'
import { operationalAnnexWorkContext } from '../snapshot/annexWork.ts'
import { gateHiringCandidateContext } from '../snapshot/gateHiring.ts'
import {
  activeProductionCompanyContexts,
  lotPeopleForCompanyPresentation,
} from '../snapshot/productionCompany.ts'
import { sceneryLoadInContext } from '../snapshot/sceneryLoadIn.ts'
import { stage7ProductionDetailContext } from '../snapshot/stage7Production.ts'
import { TILE_H, TILE_W, gridToScreen } from '../scene/iso.ts'
import { Rng } from '../scene/rng.ts'
import {
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
} from '../hollywood/roleAtlas.ts'
import type {
  HollywoodEvent,
  HollywoodFailureReason,
  HollywoodGateVisitorPresentation,
  HollywoodPerformance,
} from '../hollywood/HollywoodScene.ts'
import { WARM as C } from './palette.ts'
import {
  AUTHORED_STAGE_A_KEY,
  AUTHORED_STAGE_B_KEY,
  FALLBACK_PEOPLE_BYTES,
  TYCOON_BUILDING_TEX,
  TYCOON_PROP_TEX,
  bakeTycoonTextures,
  pointStageAtAuthored,
} from './assets.ts'
import {
  AMBIENT_ROUTES,
  ANNEX_PLACE_ID,
  APRONS,
  CAMERA_FRAMINGS,
  DIRECTOR_ROUTE,
  EXPANSION_PADS,
  GATE_PLACE_ID,
  LOT_D,
  LOT_W,
  PARKING,
  PATHS,
  PERSON_HOME,
  PERSON_HOME_SLOTS,
  PLACE_BY_BUILDING,
  PLAZA,
  PUBLICITY_PLACE_ID,
  ROADS,
  SERVICE_YARD_PLACE_ID,
  STAGE_7_PLACE_ID,
  WORLD_PLACES,
  YARD_PADS,
  YARD_REGION,
  establishedDressing,
  landscaping,
  type CameraFraming,
  type GridPoint,
  type GroundKind,
  type Rect,
  type WorldPlace,
} from './world.ts'

const hw = TILE_W / 2
const hh = TILE_H / 2

/** Absolute camera zoom range — institution scale through person scale. */
const ZOOM_MIN = 0.32
const ZOOM_MAX = 1.9
/**
 * LOD band thresholds, crisp and hysteresis-free (code-mining ledger entry 4).
 *
 *   < 0.45   institution — silhouettes and status COLOUR only, no text at all.
 *   < 1.00   operations  — the default whole-property framing: names, status badges,
 *                          people at work, nameplate on the selected person only.
 *   ≥ 1.00   people      — nameplates on every named person; badges step aside.
 *
 * Chrome is counter-scaled to a constant SCREEN size inside its bands, so a label never
 * shrinks below legibility — it disappears instead.
 */
const ZOOM_PEOPLE = 1.0
/**
 * The institution band begins just BELOW the whole-property framing, so the default view
 * is always an operations view no matter what the host chrome does to the canvas box.
 * An absolute threshold cannot do this: the fit zoom moves with the window.
 */
const ZOOM_INSTITUTION_OF_FIT = 0.92

const FONT_SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif'
const FONT_SANS = 'Avenir, "Helvetica Neue", Arial, sans-serif'

/** The lit wall plane runs down-right at atan(hh/hw); painted signage lies along it. */
const WALL_ANGLE_DEG = (Math.atan2(hh, hw) * 180) / Math.PI

const ROLE_ATLAS_MANIFEST_URL = '/lot/hollywood/role-atlas-v1.json'
const ROLE_ATLAS_IMAGE_URL = '/lot/hollywood/role-atlas-v1.png'
const ROLE_ATLAS_CACHE_KEY = 'hollywood-role-atlas-manifest-v1'
const ROLE_ATLAS_TEXTURE_KEY = 'hollywood-role-atlas-v1'

const PERFORMANCE_WARMUP_FRAMES = 120
const PERFORMANCE_SAMPLE_FRAMES = 240
const SCENERY_SWEEP_DURATION_MS = 1_200
const ROUTE_SEGMENT_MS = 1_100
const SELECTED_PERSON_TINT = 0xffe6a0
const SELECTED_COMPANY_TINT = 0xbfe3d6
const OTHER_COMPANY_ALPHA = 0.72

const DEPTH = {
  ground: -1_000_000,
  buildingZoneBase: 0.5,
  yardZone: 0.2,
  worldOverlay: 200_000,
  selection: 700_000,
  label: 900_000,
  nameplate: 950_000,
  flash: 960_000,
} as const

type Point = { x: number; y: number }

export type TycoonEvent =
  | HollywoodEvent
  /** A physical place was activated: the host runs the exact same verb the DOM list runs. */
  | { type: 'building'; buildingId: BuildingId }

export type TycoonSceneData = {
  snapshot: StudioLotSnapshot
  onEvent: (event: TycoonEvent) => void
  reducedMotion?: boolean
}

type BuildingView = {
  place: WorldPlace
  sprite: Phaser.GameObjects.Sprite | null
  zone: Phaser.GameObjects.Zone
  label: Phaser.GameObjects.Text
  badge: Phaser.GameObjects.Text
  /** Status COLOUR, readable at every zoom including the institution band. */
  chip: Phaser.GameObjects.Arc
  sign: Phaser.GameObjects.Text | null
  lamp: Phaser.GameObjects.Arc | null
  /** World Y the counter-scaled chrome stack is laid out from. */
  chromeBaseY: number
  /** Screen-space silhouette used for the hit area and the selection ring. */
  silhouette: Point[]
  /** Screen-space ground diamond. */
  footprint: Point[]
}

type RuntimePerson = {
  fact: LotPersonState
  sprite: Phaser.GameObjects.Sprite
  label: Phaser.GameObjects.Text
  homeSlot: number
  direction: RoleAtlasDirection
}

type AmbientActor = {
  sprite: Phaser.GameObjects.Sprite
  role: RoleAtlasRole
  direction: RoleAtlasDirection
  a: GridPoint
  b: GridPoint
  phase: number
  speed: number
}

type CosmeticRoute = { productionId: string; personId: string; elapsed: number }
type CosmeticSceneryLoadIn = { productionId: string; title: string; elapsed: number }

export class TycoonScene extends Phaser.Scene {
  private snapshot!: StudioLotSnapshot
  private emitEvent!: (event: TycoonEvent) => void

  private buildings = new Map<BuildingId, BuildingView>()
  private runtimePeople = new Map<string, RuntimePerson>()
  private ambientActors: AmbientActor[] = []
  private gateVisitor: { presentation: HollywoodGateVisitorPresentation; sprite: Phaser.GameObjects.Sprite } | null = null
  private requestedGateVisitor: HollywoodGateVisitorPresentation | null = null
  private establishedProps: Phaser.GameObjects.Sprite[] = []
  private stageCars: Phaser.GameObjects.Sprite[] = []

  private selectionGraphics: Phaser.GameObjects.Graphics | null = null
  private sceneryGraphics: Phaser.GameObjects.Graphics | null = null
  private activityGraphics: Phaser.GameObjects.Graphics | null = null
  private expansionGraphics: Phaser.GameObjects.Graphics | null = null
  private expansionLabel: Phaser.GameObjects.Text | null = null
  private yardZone: Phaser.GameObjects.Zone | null = null
  private flash: Phaser.GameObjects.Rectangle | null = null

  private selectedPersonId: string | null = null
  private selectedPlaceId: string | null = null
  private selectedProductionId: string | null = null
  private selectedCompanyProductionId: string | null = null
  private expansionStatus: 'legacy' | 'vacant' | 'building' | 'operational' = 'legacy'

  private cosmeticRoute: CosmeticRoute | null = null
  private cosmeticSceneryLoadIn: CosmeticSceneryLoadIn | null = null

  private reducedMotion = false
  private inputSuspended = false
  private roleAtlasActive = false
  private roleAtlasManifest: RoleAtlasRuntimeManifest | null = null
  private authoredStages: string[] = []

  private dragging = false
  private dragMoved = false
  private dragStart: Point = { x: 0, y: 0 }
  private scrollStart: Point = { x: 0, y: 0 }
  private pointerScreen: Point | null = null
  private wasd: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key> | null = null
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null
  private lodBand: 'institution' | 'operations' | 'people' = 'operations'
  /** Zoom the on-canvas chrome was last counter-scaled for. */
  private chromeZoom = 1
  private fitCache: { w: number; h: number; zoom: number } | null = null

  private frameSamples: number[] = []
  private updateSamples: number[] = []
  private drawCallSamples: number[] = []
  private currentFrameDrawCalls = 0
  private drawPipelines: Phaser.Renderer.WebGL.WebGLPipeline[] = []
  private performanceWarmupFramesRemaining = PERFORMANCE_WARMUP_FRAMES
  private capturePerformanceFrame = false
  private worstFrameMs = 0
  private worstUpdateMs = 0
  private worldTextureBytes = 0

  private failureReported = false
  private failureStateApplied = false
  private retryFailurePauseAtCreate = false

  // ── lifecycle ───────────────────────────────────────────────────────────────

  init(data: TycoonSceneData): void {
    this.snapshot = data.snapshot
    this.emitEvent = data.onEvent
    this.reducedMotion = data.reducedMotion === true
  }

  preload(): void {
    const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
    // The people atlas is shipped art shared with the retained plate renderer. A failed
    // fetch is survivable: the procedural fallback silhouettes are always baked.
    this.load.json(ROLE_ATLAS_CACHE_KEY, ROLE_ATLAS_MANIFEST_URL)
    this.load.spritesheet(ROLE_ATLAS_TEXTURE_KEY, ROLE_ATLAS_IMAGE_URL, {
      frameWidth: ROLE_ATLAS_FRAME_WIDTH,
      frameHeight: ROLE_ATLAS_FRAME_HEIGHT,
    })
    this.load.image(AUTHORED_STAGE_A_KEY, `${base}lot/b-stage-a-h2.png`)
    this.load.image(AUTHORED_STAGE_B_KEY, `${base}lot/b-stage-b.png`)
  }

  create(): void {
    if (this.failureReported) {
      if (this.retryFailurePauseAtCreate) {
        this.retryFailurePauseAtCreate = false
        this.scene.pause()
      }
      return
    }
    try {
      bakeTycoonTextures(this)
      this.adoptAuthoredStages()
      this.roleAtlasActive = this.hasValidRoleAtlas()

      this.buildGround()
      this.buildBuildings()
      this.buildDressing()
      this.buildOverlays()
      this.buildPeople()
      this.buildAmbientLife()

      this.bindCamera()
      this.bindInput()
      this.measureWorldTextures()
      this.resetPerformanceTelemetry()
      this.bindDrawCallTelemetry()

      this.events.on(Phaser.Scenes.Events.PAUSE, this.clearPublicityVisual, this)
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.clearPublicityVisual()
        this.events.off(Phaser.Scenes.Events.PAUSE, this.clearPublicityVisual, this)
      })

      this.applySnapshot(this.snapshot)
      // Phaser is still CREATING here, so `scene.isActive()` is false and the transition
      // arm of applySnapshot deliberately declines to run. Paint current truth directly,
      // or the world's first frame would show construction defaults instead of facts.
      this.paintFromSnapshot()
      this.applyCameraPreset('overview')
      this.setReducedMotion(this.reducedMotion)
      this.emitEvent({ type: 'ready' })
    } catch {
      // Scene setup runs after the React lazy-import promise resolved, so a throw here
      // is otherwise unobservable. Convert it into the one presentation-only signal.
      this.reportFailure('scene-create-failed')
    }
  }

  private reportFailure(reason: HollywoodFailureReason): void {
    if (this.failureReported) return
    this.failureReported = true
    this.applyFailedPresentationState()
    this.emitEvent({ type: 'failure', reason })
  }

  /** View-owned failures (notably WebGL context loss) make this generation inert. */
  failClosedFromHost(): void {
    this.failureReported = true
    this.retryFailurePauseAtCreate = true
    this.applyFailedPresentationState()
  }

  private applyFailedPresentationState(): void {
    if (this.failureStateApplied) return
    this.failureStateApplied = true
    this.setInputSuspended(true)
    this.clearPublicityVisual()
    this.discardGateVisitor()
    this.clearPlaceSelection()
    this.scene.setVisible(false)
    this.scene.pause()
  }

  private adoptAuthoredStages(): void {
    const adopt = (stageKey: string, authoredKey: string): void => {
      if (!this.textures.exists(authoredKey)) return
      const source = this.textures.get(authoredKey).getSourceImage()
      if (!source || source.width !== 512) return
      pointStageAtAuthored(stageKey, authoredKey, source.height)
      this.authoredStages.push(authoredKey)
    }
    adopt('tw-stage-a', AUTHORED_STAGE_A_KEY)
    adopt('tw-stage-b', AUTHORED_STAGE_B_KEY)
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
    this.roleAtlasManifest = candidate
    return true
  }

  // ── geometry helpers ────────────────────────────────────────────────────────

  private world(gx: number, gy: number): Point {
    return gridToScreen(gx, gy)
  }

  /** Painter's-algorithm depth from the front-most grid corner. */
  private depthAt(gx: number, gy: number, bias = 0): number {
    return (gx + gy) * 16 + bias
  }

  private footprintPoints(place: WorldPlace): Point[] {
    const { gx, gy, fw, fd } = place
    return [
      this.world(gx, gy),
      this.world(gx + fw, gy),
      this.world(gx + fw, gy + fd),
      this.world(gx, gy + fd),
    ]
  }

  /**
   * The visible box silhouette: ground-left → ground-front → ground-right → top-right →
   * top-back → top-left. Used both as the pointer hit area and as the selection ring, so
   * what a player can click is exactly what a player can see (shift law 11).
   */
  private silhouettePoints(place: WorldPlace, height: number): Point[] {
    const [back, right, front, left] = this.footprintPoints(place)
    const up = (p: Point): Point => ({ x: p.x, y: p.y - height })
    return [left, front, right, up(right), up(back), up(left)]
  }

  private spriteHeight(texKey: string, fw: number, fd: number): number {
    const meta = TYCOON_BUILDING_TEX[texKey]
    if (!meta) return 60
    const image = this.textures.get(meta.key).getSourceImage()
    // texH = (fw+fd)*hh + wallHeight + roofHeadroom
    return Math.max(24, image.height - (fw + fd) * hh)
  }

  // ── ground ──────────────────────────────────────────────────────────────────

  private rasterizeGround(): GroundKind[][] {
    const rng = new Rng(`${this.snapshot.sceneSeed}:tycoon-ground`)
    const grid: GroundKind[][] = []
    for (let gy = 0; gy < LOT_D; gy++) {
      grid[gy] = []
      for (let gx = 0; gx < LOT_W; gx++) {
        grid[gy][gx] = rng.chance(0.24) ? 'tw-t-lawn2' : 'tw-t-lawn'
      }
    }
    const paint = (rects: readonly Rect[], key: GroundKind, lineKey?: GroundKind): void => {
      for (const r of rects) {
        const midX = Math.round((r.x0 + r.x1) / 2)
        const midY = Math.round((r.y0 + r.y1) / 2)
        for (let gy = r.y0; gy <= r.y1; gy++) {
          for (let gx = r.x0; gx <= r.x1; gx++) {
            if (gx < 0 || gy < 0 || gx >= LOT_W || gy >= LOT_D) continue
            const onMid = lineKey !== undefined && (gx === midX || gy === midY)
            grid[gy][gx] = onMid ? lineKey : key
          }
        }
      }
    }
    paint(EXPANSION_PADS, 'tw-t-dirt')
    paint(YARD_PADS, 'tw-t-gravel')
    paint(PARKING, 'tw-t-apron')
    paint(PLAZA, 'tw-t-plaza')
    paint(PATHS, 'tw-t-path')
    paint(ROADS, 'tw-t-road', 'tw-t-road-line')
    paint(APRONS, 'tw-t-apron')
    return grid
  }

  private buildGround(): void {
    const kinds = this.rasterizeGround()
    const corners = [
      this.world(0, 0),
      this.world(LOT_W, 0),
      this.world(LOT_W, LOT_D),
      this.world(0, LOT_D),
    ]
    const minX = Math.min(...corners.map((c) => c.x)) - hw - 320
    const minY = Math.min(...corners.map((c) => c.y)) - 200
    const maxX = Math.max(...corners.map((c) => c.x)) + hw + 320
    const maxY = Math.max(...corners.map((c) => c.y)) + TILE_H + 200

    const rt = this.add.renderTexture(minX, minY, maxX - minX, maxY - minY)
    rt.setOrigin(0, 0).setDepth(DEPTH.ground).setName('tier:ground')

    // The dry scrub the property was graded out of, so the lot sits in a landscape.
    const surround = this.make.graphics({ x: 0, y: 0 })
    surround.fillStyle(C.surround, 1)
    surround.fillRect(0, 0, maxX - minX, maxY - minY)
    surround.fillStyle(C.surroundEdge, 0.5)
    for (let i = 0; i < 26; i++) {
      const rng = new Rng(`${this.snapshot.sceneSeed}:scrub:${i}`)
      surround.fillEllipse(
        rng.range(0, maxX - minX),
        rng.range(0, maxY - minY),
        rng.range(60, 220),
        rng.range(24, 70),
      )
    }
    rt.beginDraw()
    rt.batchDraw(surround, 0, 0)
    rt.endDraw()
    surround.destroy()

    rt.beginDraw()
    for (let gy = 0; gy < LOT_D; gy++) {
      for (let gx = 0; gx < LOT_W; gx++) {
        const s = this.world(gx + 0.5, gy + 0.5)
        rt.batchDraw(kinds[gy][gx], s.x - minX - hw, s.y - minY)
      }
    }
    rt.endDraw()

    // Plinths, drop shadows and the perimeter wall are baked into the ground so they
    // cost no display object and can never sort between a building and its own footing.
    const decals = this.make.graphics({ x: 0, y: 0 })
    this.drawPerimeter(decals, minX, minY)
    for (const place of WORLD_PLACES) {
      if (place.texKey === '') continue
      const pts = this.footprintPoints(place).map((p) => ({ x: p.x - minX, y: p.y - minY }))
      const grow = (k: number): Point[] => {
        const cx = (pts[0].x + pts[2].x) / 2
        const cy = (pts[0].y + pts[2].y) / 2
        return pts.map((p) => ({ x: cx + (p.x - cx) * k, y: cy + (p.y - cy) * k }))
      }
      // soft drop shadow, thrown to the lower right by the upper-left key light
      for (const [k, a, dx, dy] of [
        [1.16, 0.1, 26, 13],
        [1.08, 0.13, 18, 9],
        [1.02, 0.16, 11, 6],
      ] as const) {
        decals.fillStyle(C.shadow, a)
        const s = grow(k).map((p) => ({ x: p.x + dx, y: p.y + dy }))
        decals.beginPath()
        decals.moveTo(s[0].x, s[0].y)
        for (let i = 1; i < s.length; i++) decals.lineTo(s[i].x, s[i].y)
        decals.closePath()
        decals.fillPath()
      }
      // foundation slab
      const slab = grow(1.05)
      decals.fillStyle(C.plaza, 1)
      decals.beginPath()
      decals.moveTo(slab[0].x, slab[0].y)
      for (let i = 1; i < slab.length; i++) decals.lineTo(slab[i].x, slab[i].y)
      decals.closePath()
      decals.fillPath()
      decals.lineStyle(1.5, C.plazaEdge, 0.85)
      decals.strokePath()
    }
    rt.beginDraw()
    rt.batchDraw(decals, 0, 0)
    rt.endDraw()
    decals.destroy()
  }

  /**
   * The studio wall. A tycoon property has to have an EDGE — without one the graded lot
   * dissolves into the surrounding scrub and the player never reads "this is mine".
   *
   * Back edges (gy = 0 and gx = 0) get a full stucco wall with terracotta coping; the two
   * camera-facing edges get a low kerb and hedge, so the wall never occludes the world.
   */
  private drawPerimeter(g: Phaser.GameObjects.Graphics, minX: number, minY: number): void {
    const at = (gx: number, gy: number, z = 0): Point => {
      const p = this.world(gx, gy)
      return { x: p.x - minX, y: p.y - minY - z }
    }
    const band = (a: Point, b: Point, height: number, face: number, cap: number): void => {
      const pts = [a, b, { x: b.x, y: b.y - height }, { x: a.x, y: a.y - height }]
      g.fillStyle(face, 1)
      g.beginPath()
      g.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y)
      g.closePath()
      g.fillPath()
      g.lineStyle(3, cap, 1)
      g.beginPath()
      g.moveTo(a.x, a.y - height)
      g.lineTo(b.x, b.y - height)
      g.strokePath()
    }
    // The two back walls, lit and shaded by the same upper-left key light as everything.
    band(at(0, 0), at(LOT_W, 0), 30, C.creamShade, C.terracotta)
    band(at(0, LOT_D), at(0, 0), 30, 0xdccbaa, C.terracotta)
    // Front edges: a kerb and a clipped hedge, low enough to see over.
    band(at(LOT_W, 0), at(LOT_W, LOT_D), 13, C.hedgeDark, C.hedge)
    band(at(LOT_W, LOT_D), at(0, LOT_D), 13, C.hedgeDark, C.hedge)
    // A pale kerb inside the whole boundary reads the property line at institution zoom.
    g.lineStyle(2.5, C.plaza, 0.75)
    g.beginPath()
    g.moveTo(at(0, 0).x, at(0, 0).y)
    g.lineTo(at(LOT_W, 0).x, at(LOT_W, 0).y)
    g.lineTo(at(LOT_W, LOT_D).x, at(LOT_W, LOT_D).y)
    g.lineTo(at(0, LOT_D).x, at(0, LOT_D).y)
    g.closePath()
    g.strokePath()
  }

  // ── buildings ───────────────────────────────────────────────────────────────

  private buildBuildings(): void {
    for (const place of WORLD_PLACES) {
      const meta = place.texKey === '' ? null : TYCOON_BUILDING_TEX[place.texKey]
      const height = place.texKey === '' ? 0 : this.spriteHeight(place.texKey, place.fw, place.fd)
      const footprint = this.footprintPoints(place)
      const silhouette = this.silhouettePoints(place, height)
      const frontDepth = this.depthAt(place.gx + place.fw, place.gy + place.fd, 4)

      let sprite: Phaser.GameObjects.Sprite | null = null
      if (meta) {
        const anchor = this.world(place.gx + place.fw / 2, place.gy + place.fd / 2)
        sprite = this.add
          .sprite(anchor.x, anchor.y, meta.key)
          .setOrigin(meta.originX, meta.originY)
          .setDepth(frontDepth)
          .setName(`building:${place.buildingId}`)
      }

      // Hit areas live in a dedicated low band ordered by footprint depth: front-most
      // building wins where silhouettes overlap, and every person, visitor and yard
      // marker sits above them, so a person is never swallowed by the place behind them.
      const zoneDepth =
        DEPTH.buildingZoneBase + ((place.gx + place.gy) / (LOT_W + LOT_D)) * 0.4
      const shape = new Phaser.Geom.Polygon(silhouette.map((p) => ({ x: p.x, y: p.y })))
      const zone = this.add
        .zone(0, 0, 1, 1)
        .setOrigin(0)
        .setDepth(zoneDepth)
        .setName(`hit:${place.buildingId}`)
      zone.setInteractive(shape, Phaser.Geom.Polygon.Contains)
      if (zone.input) zone.input.cursor = 'pointer'
      zone.on('pointerover', () => {
        if (this.inputSuspended) return
        if (this.selectedPlaceId === null) this.drawSelectionRing(place, false)
      })
      zone.on('pointerout', () => {
        if (this.selectedPlaceId === null) this.selectionGraphics?.clear()
      })
      zone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (!this.isCanvasPointer(pointer) || this.dragMoved) return
        pointer.event.stopPropagation?.()
        this.activatePlace(place)
      })

      const top = this.world(place.gx + place.fw / 2, place.gy + place.fd / 2)
      // Chrome is a stack laid out from one base line, re-measured whenever the counter
      // scale changes, so a name and its status can never collide at any zoom.
      const chromeBaseY = top.y - height - 30
      const label = this.add
        .text(top.x, chromeBaseY, BUILDING_LABELS[place.buildingId], {
          fontFamily: FONT_SANS,
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#f6ebd2',
          backgroundColor: '#241d14dd',
          padding: { x: 8, y: 4 },
        })
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.label)
        .setName(`label:${place.buildingId}`)
      const badge = this.add
        .text(top.x, chromeBaseY + 3, '', {
          fontFamily: FONT_SANS,
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#f6ebd2',
          backgroundColor: '#3f6a4add',
          padding: { x: 7, y: 3 },
        })
        // Grows DOWNWARD from the base line; the name grows upward from it.
        .setOrigin(0.5, 0)
        .setDepth(DEPTH.label)
        .setVisible(false)
        .setName(`badge:${place.buildingId}`)
      badge.setData('want', false)
      const chip = this.add
        .circle(top.x, chromeBaseY - 34, 7, C.lampAvailable, 1)
        .setStrokeStyle(2.5, 0x241d14, 0.85)
        .setDepth(DEPTH.label)
        .setVisible(false)
        .setName(`chip:${place.buildingId}`)
      chip.setData('status', false)

      const sign = meta === null ? null : this.buildWallSign(place, height)
      const lamp =
        place.buildingId === 'stage-a' || place.buildingId === 'stage-b'
          ? this.buildStageLamp(place)
          : null

      this.buildings.set(place.buildingId, {
        place,
        sprite,
        zone,
        label,
        badge,
        chip,
        sign,
        lamp,
        chromeBaseY,
        silhouette,
        footprint,
      })
    }
  }

  /**
   * Painted signage on the lit wall. Graphics cannot draw text, so the bake lays down a
   * dark sign FIELD and this lays the studio's own lettering onto it, rotated onto the
   * wall plane and slightly foreshortened.
   */
  private buildWallSign(place: WorldPlace, height: number): Phaser.GameObjects.Text | null {
    // Height of the sign band as a fraction of the drawn sprite height, tuned per
    // building so the lettering lands on its painted field (and, for the two authored
    // stage images, on their blank upper wall).
    const zFrac: Partial<Record<BuildingId, number>> = {
      admin: 0.34,
      writers: 0.52,
      casting: 0.52,
      post: 0.58,
      theater: 0.39,
      'stage-a': 0.56,
      'stage-b': 0.6,
      gate: 0.7,
    }
    const frac = zFrac[place.buildingId]
    if (frac === undefined) return null
    const anchor = this.world(place.gx + place.fw / 2, place.gy + place.fd)
    const size = place.fw >= 4 ? 21 : 15
    const text =
      place.buildingId === 'gate' ? this.snapshot.studioName.toUpperCase() : place.label
    return this.add
      .text(anchor.x, anchor.y - height * frac, text, {
        fontFamily: FONT_SANS,
        fontSize: `${size}px`,
        fontStyle: 'bold',
        color: '#f2e2bd',
      })
      .setOrigin(0.5, 0.5)
      // Squash then rotate onto the 2:1 wall plane: the lettering lies on the wall
      // instead of floating in front of it.
      .setScale(1, 0.86)
      .setAngle(WALL_ANGLE_DEG)
      .setDepth(this.depthAt(place.gx + place.fw, place.gy + place.fd, 5))
      .setName(`sign:${place.buildingId}`)
  }

  private buildStageLamp(place: WorldPlace): Phaser.GameObjects.Arc {
    const anchor = place.anchors.lamp ?? { gx: place.gx, gy: place.gy + place.fd }
    const p = this.world(anchor.gx, anchor.gy)
    return this.add
      .circle(p.x, p.y - 96, 9, C.lampAvailable, 1)
      .setStrokeStyle(3, C.lampGlass, 0.8)
      .setDepth(this.depthAt(place.gx + place.fw, place.gy + place.fd, 6))
      .setName(`lamp:${place.buildingId}`)
  }

  // ── dressing ────────────────────────────────────────────────────────────────

  private placeProp(spec: { texKey: string; gx: number; gy: number; jitter?: number }, index: number): Phaser.GameObjects.Sprite | null {
    const meta = TYCOON_PROP_TEX[spec.texKey]
    if (!meta) return null
    const rng = new Rng(`${this.snapshot.sceneSeed}:prop:${index}:${spec.texKey}`)
    const j = spec.jitter ?? 0
    const gx = spec.gx + (j === 0 ? 0 : rng.range(-j, j))
    const gy = spec.gy + (j === 0 ? 0 : rng.range(-j, j))
    const p = this.world(gx, gy)
    return this.add
      .sprite(p.x, p.y, meta.key)
      .setOrigin(meta.originX, meta.originY)
      .setDepth(this.depthAt(gx, gy, 6))
  }

  private buildDressing(): void {
    landscaping().forEach((spec, index) => this.placeProp(spec, index))
    establishedDressing().forEach((spec, index) => {
      const sprite = this.placeProp(spec, 1000 + index)
      if (sprite) {
        sprite.setVisible(false)
        this.establishedProps.push(sprite)
      }
    })
    // Two studio cars on the boulevard: the lot is a place people arrive at.
    for (const [i, at] of [
      { gx: 10.2, gy: 20.4 },
      { gx: 8.7, gy: 22.6 },
    ].entries()) {
      const sprite = this.placeProp({ texKey: 'tw-car', gx: at.gx, gy: at.gy }, 2000 + i)
      if (sprite) this.stageCars.push(sprite)
    }
  }

  // ── overlays ────────────────────────────────────────────────────────────────

  private buildOverlays(): void {
    this.selectionGraphics = this.add.graphics().setDepth(DEPTH.selection).setName('tier:selection')
    this.sceneryGraphics = this.add.graphics().setDepth(DEPTH.worldOverlay).setName('tier:scenery-load-in')
    this.activityGraphics = this.add.graphics().setDepth(DEPTH.worldOverlay - 1).setName('tier:stage-activity')

    const annex = PLACE_BY_BUILDING.expansion
    this.expansionGraphics = this.add
      .graphics()
      .setDepth(this.depthAt(annex.gx + annex.fw, annex.gy + annex.fd, 3))
      .setName('tier:expansion')
    const annexTop = this.world(annex.gx + annex.fw / 2, annex.gy + annex.fd / 2)
    this.expansionLabel = this.add
      .text(annexTop.x, annexTop.y - 120, '', {
        fontFamily: FONT_SANS,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#f6ebd2',
        backgroundColor: '#241d14ee',
        padding: { x: 8, y: 5 },
        align: 'center',
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.label)
      .setName('tier:expansion-label')

    const publicity = PLACE_BY_BUILDING.admin
    const photocall = publicity.anchors.photocall
    const flashAt = this.world(photocall.gx, photocall.gy)
    this.flash = this.add
      .rectangle(flashAt.x, flashAt.y - 30, 190, 120, 0xfff7d6, 1)
      .setAlpha(0)
      .setDepth(DEPTH.flash)
      .setName('tier:publicity-flash')

    // The Scenery & Service yard is a place, not decoration: it owns its own hit area
    // below the buildings so the Post block always wins where the two would overlap.
    const yardPolygon = this.rectPolygon(YARD_REGION)
    this.yardZone = this.add
      .zone(0, 0, 1, 1)
      .setOrigin(0)
      .setDepth(DEPTH.yardZone)
      .setName('hit:service-yard')
    this.yardZone.setInteractive(
      new Phaser.Geom.Polygon(yardPolygon),
      Phaser.Geom.Polygon.Contains,
    )
    if (this.yardZone.input) this.yardZone.input.cursor = 'pointer'
    this.yardZone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.isCanvasPointer(pointer) || this.dragMoved) return
      pointer.event.stopPropagation?.()
      if (this.selectSceneryLoadInSurface()) return
      this.activatePlace(PLACE_BY_BUILDING.post)
    })
  }

  private rectPolygon(rect: Rect): Point[] {
    return [
      this.world(rect.x0, rect.y0),
      this.world(rect.x1 + 1, rect.y0),
      this.world(rect.x1 + 1, rect.y1 + 1),
      this.world(rect.x0, rect.y1 + 1),
    ]
  }

  // ── selection ───────────────────────────────────────────────────────────────

  private drawSelectionRing(place: WorldPlace, selected: boolean): void {
    const g = this.selectionGraphics
    if (!g) return
    const view = this.buildings.get(place.buildingId)
    if (!view) return
    g.clear()
    const foot = view.footprint.map((p) => new Phaser.Math.Vector2(p.x, p.y))
    g.fillStyle(selected ? C.selection : C.hover, selected ? 0.2 : 0.1)
    g.fillPoints(foot, true)
    g.lineStyle(selected ? 4 : 2.5, selected ? C.selection : C.hover, 0.95)
    g.strokePoints(foot, true)
    if (view.sprite) {
      const sil = view.silhouette.map((p) => new Phaser.Math.Vector2(p.x, p.y))
      g.lineStyle(selected ? 3 : 2, selected ? C.selection : C.hover, selected ? 0.85 : 0.5)
      g.strokePoints(sil, true)
    }
  }

  /**
   * ONE activation seam for a physical place. Every canvas click and every host command
   * lands here or in a `*FromHost` method that shares its painting, so the canvas and the
   * DOM companion can never route the same destination to different owners (law 10).
   */
  private activatePlace(place: WorldPlace): void {
    this.selectedPlaceId = place.placeId
    this.drawSelectionRing(place, true)
    if (place.buildingId === 'post' && this.selectSceneryLoadInSurface()) return
    this.clearProductionCompanySelection()
    this.selectedProductionId = null
    this.emitEvent({ type: 'building', buildingId: place.buildingId })
  }

  clearPlaceSelection(): void {
    this.selectedProductionId = null
    this.selectedPlaceId = null
    this.selectionGraphics?.clear()
  }

  /** Host/DOM parity: paint a place without emitting an event. */
  selectFromHost(buildingId: BuildingId): boolean {
    const place = PLACE_BY_BUILDING[buildingId]
    if (!place) return false
    this.selectedPlaceId = place.placeId
    this.drawSelectionRing(place, true)
    return true
  }

  selectAnnexFromHost(): boolean {
    return this.selectFromHost('expansion')
  }

  selectPublicityFromHost(): boolean {
    return this.selectFromHost('admin')
  }

  selectGateFromHost(): boolean {
    return this.selectFromHost('gate')
  }

  focusGateFromHost(): boolean {
    this.focusPlace(PLACE_BY_BUILDING.gate)
    return true
  }

  /** Host/DOM parity: paint exact Stage 7 selection without re-emitting an event. */
  selectProductionFromHost(productionId: string): boolean {
    const operation = this.authoritativeStage7Operation(this.snapshot)
    if (operation?.productionId !== productionId) return false
    this.selectProductionCompanyPresentation(operation.productionId)
    this.selectedProductionId = operation.productionId
    return this.selectFromHost('stage-a')
  }

  /** Host/DOM parity for phase-independent exact company focus. Emits no event. */
  selectProductionCompanyFromHost(productionId: string): boolean {
    return this.selectProductionCompanyPresentation(productionId)
  }

  /**
   * The exact scenery seam shared by the yard hit area and the host. The snapshot
   * selector is re-run at activation time; scene state is never authority.
   */
  private selectSceneryLoadInSurface(emitSelection = true): boolean {
    const scenery = sceneryLoadInContext(this.snapshot)
    if (scenery === null) return false
    this.selectProductionCompanyPresentation(scenery.operation.productionId)
    this.selectedProductionId = scenery.operation.productionId
    this.selectedPlaceId = SERVICE_YARD_PLACE_ID
    this.drawSelectionRing(PLACE_BY_BUILDING.post, true)
    if (emitSelection) {
      this.emitEvent({
        type: 'scenery-load-in',
        sceneryLoadIn: {
          productionId: scenery.operation.productionId,
          locationBuildingId: 'stage-a',
          placeId: 'service-yard',
        },
      })
    }
    return true
  }

  selectSceneryLoadInFromHost(productionId: string): boolean {
    const scenery = sceneryLoadInContext(this.snapshot)
    if (scenery?.operation.productionId !== productionId) return false
    return this.selectSceneryLoadInSurface(false)
  }

  // ── people ──────────────────────────────────────────────────────────────────

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
    sprite.setTexture(`tw-person-${role}`)
    sprite.setFlipX(direction === 'west')
  }

  private personHome(role: LotPersonState['role'], slot: number): GridPoint {
    const base = PERSON_HOME[role]
    const offset = PERSON_HOME_SLOTS[slot] ?? {
      gx: (slot % 3) * 0.95,
      gy: Math.floor(slot / 3) * 0.9,
    }
    return { gx: base.gx + offset.gx, gy: base.gy + offset.gy }
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

  private placePerson(runtime: RuntimePerson, at: GridPoint): void {
    const p = this.world(at.gx, at.gy)
    runtime.direction = 'south'
    this.setActorFacing(runtime.sprite, runtime.fact.role, runtime.direction)
    runtime.sprite.setPosition(p.x, p.y).setDepth(this.depthAt(at.gx, at.gy, 7))
    runtime.label.setPosition(p.x, p.y - 74)
  }

  private buildPeople(): void {
    this.reconcilePeople(lotPeopleForCompanyPresentation(this.snapshot))
  }

  private reconcilePeople(people: readonly LotPersonState[]): void {
    const counts = new Map<string, number>()
    for (const person of people) counts.set(person.id, (counts.get(person.id) ?? 0) + 1)
    const unique = people.filter((person) => counts.get(person.id) === 1)
    const nextById = new Map(unique.map((person) => [person.id, person]))

    for (const [id, runtime] of this.runtimePeople) {
      if (nextById.has(id)) continue
      runtime.sprite.destroy()
      runtime.label.destroy()
      this.runtimePeople.delete(id)
      if (this.selectedPersonId === id) this.clearPersonSelection()
      if (this.cosmeticRoute?.personId === id) this.cosmeticRoute = null
    }

    const ordered = [...unique].sort(
      (a, b) => a.role.localeCompare(b.role) || a.id.localeCompare(b.id),
    )
    for (const person of ordered) {
      const existing = this.runtimePeople.get(person.id)
      if (existing) {
        const roleChanged = existing.fact.role !== person.role
        const authorityChanged =
          existing.fact.authority !== person.authority ||
          existing.fact.productionId !== person.productionId
        const displayChanged =
          roleChanged ||
          authorityChanged ||
          existing.fact.name !== person.name ||
          existing.fact.productionTitle !== person.productionTitle
        existing.fact = person
        if (existing.label.text !== person.name) existing.label.setText(person.name)
        if (roleChanged) {
          existing.homeSlot = this.availablePersonHomeSlot(person.role, person.id)
          existing.sprite.setScale(this.actorScale(1))
          this.placePerson(existing, this.personHome(person.role, existing.homeSlot))
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
      const at = this.personHome(person.role, homeSlot)
      const p = this.world(at.gx, at.gy)
      const sprite = this.add
        .sprite(p.x, p.y, `tw-person-${person.role}`)
        .setOrigin(0.5, 0.92)
        .setDepth(this.depthAt(at.gx, at.gy, 7))
      sprite.setScale(this.actorScale(1))
      this.setActorFacing(sprite, person.role, 'south')
      sprite.setInteractive({ useHandCursor: true })
      sprite.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (!this.isCanvasPointer(pointer) || this.dragMoved) return
        pointer.event.stopPropagation?.()
        this.selectPerson(person.id)
      })
      const label = this.add
        .text(p.x, p.y - 74, person.name, {
          fontFamily: FONT_SERIF,
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#f6ebd2',
          backgroundColor: '#241d14e0',
          padding: { x: 7, y: 4 },
        })
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.nameplate)
        .setVisible(false)
      this.runtimePeople.set(person.id, { fact: person, sprite, label, homeSlot, direction: 'south' })
    }
  }

  selectPerson(personId: string): void {
    const runtime = this.runtimePeople.get(personId)
    if (!runtime) return
    this.selectedPersonId = personId
    const contexts = activeProductionCompanyContexts(this.snapshot)
    const matches =
      contexts?.filter((context) =>
        context.members.some(({ person }) => person.id === personId),
      ) ?? []
    this.selectedCompanyProductionId =
      matches.length === 1 ? matches[0]!.operation.productionId : null
    this.paintPersonSelection(contexts)
    this.emitEvent({ type: 'person', person: runtime.fact })
  }

  clearPersonSelection(): void {
    if (this.selectedPersonId === null) return
    this.selectedPersonId = null
    this.paintPersonSelection()
    this.emitEvent({ type: 'person', person: null })
  }

  private selectProductionCompanyPresentation(productionId: string): boolean {
    const contexts = activeProductionCompanyContexts(this.snapshot)
    const matches =
      contexts?.filter((context) => context.operation.productionId === productionId) ?? []
    if (matches.length !== 1) {
      this.selectedCompanyProductionId = null
      this.paintPersonSelection()
      return false
    }
    this.selectedCompanyProductionId = productionId
    this.paintPersonSelection(contexts)
    return true
  }

  clearProductionCompanySelection(): void {
    if (this.selectedCompanyProductionId === null) return
    this.selectedCompanyProductionId = null
    this.paintPersonSelection()
  }

  private reconcileProductionCompanySelection(): void {
    if (this.selectedCompanyProductionId === null) {
      this.paintPersonSelection()
      return
    }
    const contexts = activeProductionCompanyContexts(this.snapshot)
    const matches =
      contexts?.filter(
        (context) => context.operation.productionId === this.selectedCompanyProductionId,
      ) ?? []
    if (matches.length !== 1) this.selectedCompanyProductionId = null
    this.paintPersonSelection(contexts)
  }

  private paintPersonSelection(
    contexts = activeProductionCompanyContexts(this.snapshot),
  ): void {
    const selectedCompany =
      contexts === null || this.selectedCompanyProductionId === null
        ? null
        : contexts.filter(
              (context) => context.operation.productionId === this.selectedCompanyProductionId,
            ).length === 1
          ? contexts.find(
              (context) => context.operation.productionId === this.selectedCompanyProductionId,
            ) ?? null
          : null
    const companyPeople = new Set(selectedCompany?.members.map(({ person }) => person.id) ?? [])
    const showAllNames = this.lodBand === 'people'

    for (const runtime of this.runtimePeople.values()) {
      const selectedPerson = runtime.fact.id === this.selectedPersonId
      const companyMember = companyPeople.has(runtime.fact.id)
      runtime.label.setVisible(selectedPerson || showAllNames)
      runtime.sprite
        .setTint(
          selectedPerson
            ? SELECTED_PERSON_TINT
            : companyMember
              ? SELECTED_COMPANY_TINT
              : 0xffffff,
        )
        .setAlpha(
          selectedCompany === null || selectedPerson || companyMember ? 1 : OTHER_COMPANY_ALPHA,
        )
        .setScale(
          this.actorScale(
            selectedPerson ? 1.08 : companyMember ? 1.03 : selectedCompany === null ? 1 : 0.96,
          ),
        )
    }
  }

  // ── ambient life ────────────────────────────────────────────────────────────

  private buildAmbientLife(): void {
    AMBIENT_ROUTES.forEach((spec, index) => {
      const rng = new Rng(`${this.snapshot.sceneSeed}:ambient:${index}`)
      const p = this.world(spec.a.gx, spec.a.gy)
      const direction = directionFromDelta(
        spec.b.gx - spec.a.gx - (spec.b.gy - spec.a.gy),
        spec.b.gx - spec.a.gx + (spec.b.gy - spec.a.gy),
      )
      const sprite = this.add
        .sprite(p.x, p.y, `tw-person-${spec.role}`)
        .setOrigin(0.5, 0.92)
        .setDepth(this.depthAt(spec.a.gx, spec.a.gy, 7))
      sprite.setScale(this.actorScale(spec.role === 'extra' ? 0.84 : 0.92))
      this.setActorFacing(sprite, spec.role, direction)
      this.ambientActors.push({
        sprite,
        role: spec.role,
        direction,
        a: spec.a,
        b: spec.b,
        phase: rng.next(),
        speed: rng.range(0.00004, 0.00009),
      })
    })
  }

  // ── gate visitor ────────────────────────────────────────────────────────────

  private copyGateVisitor(
    visitor: HollywoodGateVisitorPresentation,
  ): HollywoodGateVisitorPresentation {
    return { ...visitor, offerTermWeeks: [...visitor.offerTermWeeks] }
  }

  private sameNumbers(actual: readonly number[], expected: readonly number[]): boolean {
    return actual.length === expected.length && actual.every((v, i) => v === expected[i])
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
      visitor.presentationRole !== (visitor.marketRole === 'director' ? 'director' : 'talent')
    ) return false

    const current = gateHiringCandidateContext(this.snapshot, visitor.talentId)
    if (current === null) return false
    return (
      current.ownerIntent.talentId === visitor.talentId &&
      current.ownerIntent.studioSeed === visitor.studioSeed &&
      current.ownerIntent.name === visitor.name &&
      current.ownerIntent.creativeRole === visitor.marketRole &&
      current.marketWeek === visitor.marketWeek &&
      current.candidate.talentId === visitor.talentId &&
      current.candidate.name === visitor.name &&
      current.candidate.creativeRole === visitor.marketRole &&
      current.candidate.employmentStatus === visitor.employmentStatus &&
      this.sameNumbers(current.candidate.offerTermWeeks, visitor.offerTermWeeks)
    )
  }

  private discardGateVisitor(): void {
    this.requestedGateVisitor = null
    this.gateVisitor?.sprite.destroy()
    this.gateVisitor = null
  }

  private reconcileGateVisitor(): boolean {
    const requested = this.requestedGateVisitor
    if (requested === null || !this.gateVisitorMatchesLatest(requested)) {
      this.discardGateVisitor()
      return false
    }
    const presentation = this.copyGateVisitor(requested)
    const arrival = PLACE_BY_BUILDING.gate.anchors.arrival
    const at = this.world(arrival.gx, arrival.gy)
    const depth = this.depthAt(arrival.gx, arrival.gy, 8)
    if (this.gateVisitor !== null) {
      this.gateVisitor.presentation = presentation
      this.gateVisitor.sprite
        .setPosition(at.x, at.y)
        .setOrigin(0.5, 0.92)
        .setDepth(depth)
        .setScale(this.actorScale(1))
      this.setActorFacing(this.gateVisitor.sprite, presentation.presentationRole, 'north')
      return true
    }
    const sprite = this.add
      .sprite(at.x, at.y, `tw-person-${presentation.presentationRole}`)
      .setOrigin(0.5, 0.92)
      .setDepth(depth)
    sprite.setScale(this.actorScale(1))
    this.setActorFacing(sprite, presentation.presentationRole, 'north')
    sprite.setInteractive({ useHandCursor: true }).on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.isCanvasPointer(pointer) || this.dragMoved) return
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

  setGateVisitor(visitor: HollywoodGateVisitorPresentation | null): boolean {
    if (visitor === null) {
      this.discardGateVisitor()
      return true
    }
    if (!this.gateVisitorMatchesLatest(visitor)) {
      this.discardGateVisitor()
      return false
    }
    this.requestedGateVisitor = this.copyGateVisitor(visitor)
    return this.reconcileGateVisitor()
  }

  // ── snapshot → world ────────────────────────────────────────────────────────

  private authoritativeStage7Operation(
    snapshot: StudioLotSnapshot,
  ): ProductionOperationsState | null {
    return stage7ProductionDetailContext(snapshot)?.operation ?? null
  }

  applySnapshot(snapshot: StudioLotSnapshot): void {
    const previousStage7 = this.authoritativeStage7Operation(this.snapshot)
    const previousScenery = sceneryLoadInContext(this.snapshot)
    this.snapshot = snapshot
    this.reconcileGateVisitor()
    if (!this.scene.isActive()) {
      this.cosmeticSceneryLoadIn = null
      return
    }

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
    ) this.cosmeticRoute = null

    if (
      this.cosmeticSceneryLoadIn !== null &&
      (nextScenery?.state !== 'ready' ||
        nextScenery.operation.productionId !== this.cosmeticSceneryLoadIn.productionId)
    ) {
      const cancelled = this.cosmeticSceneryLoadIn
      this.cosmeticSceneryLoadIn = null
      const scheduled = this.authoritativeStage7Operation(snapshot)
      if (
        scheduled?.productionId === cancelled.productionId &&
        scheduled.taskStatus === 'scheduled'
      ) this.announceSceneryLoadIn(cancelled)
    }

    const acceptedDirectorDispatch =
      previousStage7 !== null &&
      nextStage7 !== null &&
      previousStage7.productionId === nextStage7.productionId &&
      previousStage7.taskStatus === 'unassigned' &&
      nextStage7.taskStatus === 'blocked'
    if (acceptedDirectorDispatch && nextStage7 !== null) this.beginDirectorRoute(nextStage7)

    const acceptedSceneryClear =
      previousScenery?.state === 'blocked' &&
      nextScenery?.state === 'ready' &&
      previousScenery.operation.productionId === nextScenery.operation.productionId

    this.paintFromSnapshot()
    if (acceptedSceneryClear && nextScenery !== null) {
      this.beginSceneryLoadIn(nextScenery.operation)
    }
  }

  /**
   * Repaint every world surface from the retained snapshot. Pure projection: it starts
   * no ceremony and consumes no transition, so it is safe to run both on the first frame
   * and after every accepted replacement.
   */
  private paintFromSnapshot(): void {
    const stage7 = this.authoritativeStage7Operation(this.snapshot)
    this.reconcilePeople(lotPeopleForCompanyPresentation(this.snapshot))
    this.syncPeopleToSnapshot(stage7)
    this.reconcileProductionCompanySelection()
    this.paintBuildingStates(this.snapshot, stage7)
    this.paintSceneryLoadIn(sceneryLoadInContext(this.snapshot))
    this.paintExpansion(this.snapshot)
  }

  private syncPeopleToSnapshot(stage7: ProductionOperationsState | null): void {
    for (const runtime of this.runtimePeople.values()) {
      if (runtime.fact.id === this.cosmeticRoute?.personId) continue
      this.placePerson(runtime, this.personHome(runtime.fact.role, runtime.homeSlot))
    }
    if (stage7 === null || stage7.taskStatus === null || stage7.taskStatus === 'unassigned') return
    const director = this.runtimePeople.get(stage7.directorId)
    const destination = DIRECTOR_ROUTE.at(-1)
    // A saved blocked/ready/scheduled/completed task is painted at the destination
    // immediately: no transient walk has to replay before the world is truthful.
    if (director && destination) this.placePerson(director, destination)
  }

  /** Building availability, attention badges, status chips and the two stage lamps. */
  private paintBuildingStates(
    snapshot: StudioLotSnapshot,
    stage7: ProductionOperationsState | null,
  ): void {
    const established = snapshot.standing === 'established' || snapshot.standing === 'prestige'
    for (const prop of this.establishedProps) prop.setVisible(established)

    // The gate beam carries the studio's own name, from the snapshot.
    const gateSign = this.buildings.get('gate')?.sign
    const studioName = snapshot.studioName.toUpperCase()
    if (gateSign && gateSign.text !== studioName) gateSign.setText(studioName)

    for (const id of ALL_BUILDING_IDS) {
      const view = this.buildings.get(id)
      if (!view) continue
      const fact = snapshot.buildings.find((building) => building.id === id)
      const attention = fact?.attention ?? 'normal'
      const available = fact?.available !== false
      view.sprite?.setAlpha(available ? 1 : 0.78)
      view.sign?.setAlpha(available ? 1 : 0.6)
      const reason = fact?.attentionReason ?? null
      if (attention === 'normal' || reason === null) {
        this.setBadge(view, null, 'normal')
      } else {
        this.setBadge(view, reason, attention)
      }
    }

    this.paintStageStatus('stage-a', stage7)
    this.paintStageStatus('stage-b', null)
    this.applyChromeVisibility()
  }

  private setBadge(
    view: BuildingView,
    text: string | null,
    attention: 'normal' | 'decision-required' | 'opportunity' | 'watch' | string,
  ): void {
    const colour =
      attention === 'decision-required'
        ? C.lampFilming
        : attention === 'opportunity'
          ? C.lampAvailable
          : C.lampHeld
    if (text === null) {
      view.badge.setData('want', false)
      view.chip.setData('status', false).setVisible(false)
      return
    }
    view.badge.setText(text).setBackgroundColor(
      attention === 'decision-required'
        ? '#8b3b32ee'
        : attention === 'opportunity'
          ? '#3f6a4aee'
          : '#7a5c22ee',
    )
    view.badge.setData('want', true)
    view.chip.setData('status', true).setFillStyle(colour, 1).setVisible(true)
  }

  private paintStageStatus(
    id: 'stage-a' | 'stage-b',
    stage7: ProductionOperationsState | null,
  ): void {
    const view = this.buildings.get(id)
    if (!view?.lamp) return
    const sign = view.place.label
    const card = this.snapshot.activeProductions.find((production) => production.stageId === id)

    if (id === 'stage-a' && stage7 !== null) {
      const colour =
        stage7.taskStatus === 'unassigned'
          ? C.lampFilming
          : stage7.taskStatus === 'blocked' || stage7.taskStatus === 'ready'
            ? C.lampHeld
            : stage7.taskStatus === 'scheduled'
              ? C.lampFilming
              : C.lampAvailable
      view.lamp.setFillStyle(colour, 1)
      view.chip.setData('status', true).setFillStyle(colour, 1).setVisible(true)
      view.badge
        .setText(`${sign} · ${stage7.statusLabel.toUpperCase()}`)
        .setBackgroundColor('#7a5c22ee')
        .setData('want', true)
      this.paintStageActivity(stage7.taskStatus)
      return
    }

    const filming = card !== undefined && card.active
    const colour = filming ? C.lampFilming : card ? C.lampIdle : C.lampAvailable
    view.lamp.setFillStyle(colour, 1)
    view.chip.setData('status', true).setFillStyle(colour, 1).setVisible(true)
    view.badge
      .setText(`${sign} · ${filming ? 'FILMING' : card ? 'IDLE' : 'AVAILABLE'}`)
      .setBackgroundColor(filming ? '#7a5c22ee' : '#3f6a4aee')
      .setData('want', true)
    if (id === 'stage-a') this.activityGraphics?.clear()
  }

  /** Crew-call / staged-gear / take-in-progress cue on the Stage 7 apron. */
  private paintStageActivity(status: ProductionOperationsState['taskStatus']): void {
    const g = this.activityGraphics
    if (!g) return
    g.clear()
    if (status === null || status === 'unassigned') return
    const anchor = PLACE_BY_BUILDING['stage-a'].anchors.crewCall
    const p = this.world(anchor.gx, anchor.gy)
    g.fillStyle(0xffcb6b, status === 'scheduled' ? 0.4 : 0.2)
    g.fillEllipse(p.x, p.y, 210, 100)
    g.lineStyle(5, 0xe7c477, 0.85)
    g.lineBetween(p.x - 66, p.y + 30, p.x + 66, p.y - 30)
    g.fillStyle(0x241d14, 1)
    g.fillCircle(p.x - 66, p.y + 30, 8)
    g.fillCircle(p.x + 66, p.y - 30, 8)
    if (status !== 'blocked') {
      g.fillStyle(0x1a1913, 0.92)
      g.fillRect(p.x - 34, p.y - 22, 68, 44)
      g.lineStyle(3, 0xe2c273, 0.85)
      g.strokeRect(p.x - 34, p.y - 22, 68, 44)
    }
  }

  private paintSceneryLoadIn(context: ReturnType<typeof sceneryLoadInContext>): void {
    const g = this.sceneryGraphics
    if (!g) return
    g.clear()
    if (context === null) return
    const yard = PLACE_BY_BUILDING.post.anchors.loadIn
    const dock = PLACE_BY_BUILDING['stage-a'].anchors.service
    const source = this.world(yard.gx, yard.gy)
    const destination = this.world(dock.gx, dock.gy)

    if (context.state === 'blocked') {
      g.lineStyle(5, 0xd28d2d, 0.9).lineBetween(source.x, source.y, destination.x, destination.y)
      g.fillStyle(0x302416, 0.96).fillRect(source.x - 34, source.y - 20, 48, 34)
      g.lineStyle(3, 0xf0c36d, 1).strokeRect(source.x - 34, source.y - 20, 48, 34)
      g.fillStyle(0x8b4b20, 1).fillCircle(source.x - 10, source.y - 30, 13)
      g.lineStyle(4, 0xffefd0, 1).lineBetween(source.x - 10, source.y - 37, source.x - 10, source.y - 28)
      g.fillStyle(0xffefd0, 1).fillCircle(source.x - 10, source.y - 23, 2)
      g.lineStyle(3, 0xf0c36d, 0.9).strokeCircle(destination.x, destination.y, 20)
      return
    }

    g.lineStyle(5, 0x61b47a, 0.85).lineBetween(source.x, source.y, destination.x, destination.y)
    g.fillStyle(0x274b35, 1).fillRect(source.x - 14, source.y - 14, 28, 28)
    g.lineStyle(3, 0xbfe5ba, 1).strokeRect(source.x - 14, source.y - 14, 28, 28)
    g.lineStyle(5, 0xe8f5d8, 1)
      .lineBetween(destination.x - 16, destination.y, destination.x - 5, destination.y + 12)
      .lineBetween(destination.x - 5, destination.y + 12, destination.x + 19, destination.y - 15)
    g.lineStyle(3, 0x61b47a, 0.9).strokeCircle(destination.x, destination.y, 28)

    const sweep =
      this.cosmeticSceneryLoadIn?.productionId === context.operation.productionId
        ? this.cosmeticSceneryLoadIn
        : null
    if (sweep === null) return
    const progress = Phaser.Math.Clamp(sweep.elapsed / SCENERY_SWEEP_DURATION_MS, 0, 1)
    const eased = Phaser.Math.Easing.Sine.InOut(progress)
    const x = Phaser.Math.Linear(source.x, destination.x, eased)
    const y = Phaser.Math.Linear(source.y, destination.y, eased)
    g.fillStyle(0x382b1d, 1).fillRect(x - 24, y - 15, 48, 30)
    g.lineStyle(3, 0xf0c36d, 1).strokeRect(x - 24, y - 15, 48, 30)
    g.lineBetween(x, y - 15, x, y + 15)
  }

  private beginSceneryLoadIn(operation: ProductionOperationsState): void {
    this.cosmeticSceneryLoadIn = {
      productionId: operation.productionId,
      title: operation.title,
      elapsed: 0,
    }
    if (this.reducedMotion) {
      this.finishSceneryLoadIn()
      return
    }
    this.paintSceneryLoadIn(sceneryLoadInContext(this.snapshot))
  }

  private finishSceneryLoadIn(): void {
    const sweep = this.cosmeticSceneryLoadIn
    if (!sweep) return
    this.cosmeticSceneryLoadIn = null
    this.paintSceneryLoadIn(sceneryLoadInContext(this.snapshot))
    this.announceSceneryLoadIn(sweep)
  }

  private announceSceneryLoadIn(sweep: CosmeticSceneryLoadIn): void {
    this.emitEvent({
      type: 'activity',
      text: `${sweep.title} scenery reached Soundstage 7. The shooting take is ready to schedule.`,
    })
  }

  /** The Annex parcel: vacant survey stakes → scaffolded build → operational facility. */
  private paintExpansion(snapshot: StudioLotSnapshot): void {
    const fact = snapshot.buildings.find((building) => building.id === 'expansion')
    this.expansionStatus = fact?.constructionStatus ?? 'legacy'
    const g = this.expansionGraphics
    const label = this.expansionLabel
    if (!g || !label) return
    const place = PLACE_BY_BUILDING.expansion
    const pts = this.footprintPoints(place)
    const vecs = pts.map((p) => new Phaser.Math.Vector2(p.x, p.y))
    const left = Math.min(...pts.map((p) => p.x))
    const right = Math.max(...pts.map((p) => p.x))
    const top = Math.min(...pts.map((p) => p.y))
    const bottom = Math.max(...pts.map((p) => p.y))
    const cx = (left + right) / 2
    const status = this.expansionStatus
    const work = status === 'operational' ? operationalAnnexWorkContext(snapshot) : null
    const progress = Math.max(0, Math.min(1, fact?.constructionProgress01 ?? 0))

    g.clear()
    g.fillStyle(status === 'operational' ? 0x3d5a44 : 0x8a7248, status === 'legacy' ? 0.14 : 0.3)
    g.fillPoints(vecs, true)
    g.lineStyle(status === 'legacy' ? 2 : 4, status === 'operational' ? C.brass : 0xc59c55, 0.95)
    g.strokePoints(vecs, true)

    if (status === 'vacant' || status === 'legacy') {
      for (const p of pts) {
        g.fillStyle(status === 'legacy' ? 0x8a8069 : C.brass, 0.95)
        g.fillRect(p.x - 3, p.y - 18, 6, 22)
      }
    } else {
      const height = status === 'operational' ? 118 : 34 + Math.round(progress * 84)
      const width = Math.min(210, Math.max(120, right - left - 90))
      const baseY = (top + bottom) / 2 + 34
      g.fillStyle(0x3c352b, 0.98).fillRect(cx - width / 2 - 9, baseY, width + 18, 17)
      g.fillStyle(status === 'operational' ? C.cream : 0x9d8a68, 1)
      g.fillRect(cx - width / 2, baseY - height, width, height)
      g.fillStyle(status === 'operational' ? C.creamShade : 0x83714f, 1)
      g.fillRect(cx + width / 2 - 34, baseY - height, 34, height)
      g.fillStyle(C.terracotta, 1).fillRect(cx - width / 2 - 6, baseY - height - 12, width + 12, 14)
      g.lineStyle(3, C.brass, 0.95).strokeRect(cx - width / 2, baseY - height, width, height)
      if (status === 'building') {
        g.lineStyle(3, C.brass, 0.9)
        for (let x = cx - width / 2 - 14; x <= cx + width / 2 + 14; x += 38) {
          g.lineBetween(x, baseY - 128, x, baseY + 8)
        }
        for (let y = baseY - 120; y <= baseY; y += 29) {
          g.lineBetween(cx - width / 2 - 18, y, cx + width / 2 + 18, y)
        }
      } else {
        const windowColour =
          work?.state === 'working' ? C.windowLit : work?.state === 'held' ? 0xd58448 : C.glassDeep
        g.fillStyle(windowColour, 1)
        for (let x = cx - width / 2 + 20; x < cx + width / 2 - 44; x += 36) {
          g.fillRect(x, baseY - 70, 20, 30)
        }
        g.fillStyle(0x7b2c24, 1).fillRect(cx - 16, baseY - 50, 32, 50)
        if (work?.state === 'working' || work?.state === 'held') {
          g.fillStyle(work.state === 'working' ? 0xffe6a1 : 0xe4a05d, 1)
          g.fillCircle(cx, baseY - 58, 6)
        }
      }
    }

    const text =
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
    // The parcel carries its own lifecycle caption; its generic building chrome would
    // only repeat it.
    label.setText(text).setPosition(cx, top - 6)
    const annexView = this.buildings.get('expansion')
    if (annexView) {
      annexView.label.setVisible(false)
      annexView.badge.setData('want', false)
      annexView.badge.setVisible(false)
      annexView.chip.setData('status', false).setVisible(false)
    }
  }

  // ── cosmetic director route ─────────────────────────────────────────────────

  private beginDirectorRoute(operation: ProductionOperationsState): void {
    const director = this.runtimePeople.get(operation.directorId)
    const start = DIRECTOR_ROUTE[0]
    if (!director || director.fact.role !== 'director' || !start || DIRECTOR_ROUTE.length < 2) {
      this.cosmeticRoute = null
      return
    }
    this.placePerson(director, start)
    director.label.setVisible(
      this.selectedPersonId === operation.directorId || this.lodBand === 'people',
    )
    this.cosmeticRoute = {
      productionId: operation.productionId,
      personId: operation.directorId,
      elapsed: 0,
    }
    this.emitEvent({
      type: 'activity',
      text: `${operation.directorName} was dispatched to Soundstage 7.`,
    })
    if (this.reducedMotion) this.finishDirectorRoute()
  }

  private updateDirectorRoute(delta: number): void {
    const route = this.cosmeticRoute
    if (!route) return
    const runtime = this.runtimePeople.get(route.personId)
    if (!runtime) {
      this.cosmeticRoute = null
      return
    }
    route.elapsed += delta
    const raw = route.elapsed / ROUTE_SEGMENT_MS
    const seg = Math.min(DIRECTOR_ROUTE.length - 2, Math.floor(raw))
    const local = Phaser.Math.Clamp(raw - seg, 0, 1)
    const a = DIRECTOR_ROUTE[seg]!
    const b = DIRECTOR_ROUTE[seg + 1]!
    const eased = Phaser.Math.Easing.Sine.InOut(local)
    const gx = Phaser.Math.Linear(a.gx, b.gx, eased)
    const gy = Phaser.Math.Linear(a.gy, b.gy, eased)
    const p = this.world(gx, gy)
    runtime.sprite.setPosition(p.x, p.y).setDepth(this.depthAt(gx, gy, 7))
    runtime.label.setPosition(p.x, p.y - 74)
    runtime.direction = directionFromDelta(
      b.gx - a.gx - (b.gy - a.gy),
      b.gx - a.gx + (b.gy - a.gy),
      runtime.direction,
    )
    this.setActorFacing(runtime.sprite, runtime.fact.role, runtime.direction)
    if (raw >= DIRECTOR_ROUTE.length - 1) this.finishDirectorRoute()
  }

  private finishDirectorRoute(): void {
    const route = this.cosmeticRoute
    const destination = DIRECTOR_ROUTE.at(-1)
    const runtime = route ? this.runtimePeople.get(route.personId) : undefined
    if (!route || !destination || !runtime) {
      this.cosmeticRoute = null
      return
    }
    this.placePerson(runtime, destination)
    this.cosmeticRoute = null
    this.emitEvent({
      type: 'activity',
      text: `${runtime.fact.name} reached Soundstage 7. The engine-reported production status is unchanged.`,
    })
  }

  // ── publicity ───────────────────────────────────────────────────────────────

  /** Local acknowledgement of an already-accepted App/Engine result. Emits no event. */
  playPublicity(success: boolean, _detail?: string): boolean {
    if (!success || !this.flash || !this.scene.isActive()) {
      this.clearPublicityVisual()
      return false
    }
    this.clearPublicityVisual()
    if (this.reducedMotion) return true
    this.flash.setAlpha(0.7)
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

  // ── camera + input ──────────────────────────────────────────────────────────

  private worldExtent(): { minX: number; minY: number; maxX: number; maxY: number } {
    const corners = [
      this.world(0, 0),
      this.world(LOT_W, 0),
      this.world(LOT_W, LOT_D),
      this.world(0, LOT_D),
    ]
    return {
      minX: Math.min(...corners.map((c) => c.x)),
      // headroom for building tops and their counter-scaled labels, footroom so the
      // near corner of the property is never clipped by the frame
      minY: Math.min(...corners.map((c) => c.y)) - 175,
      maxX: Math.max(...corners.map((c) => c.x)),
      maxY: Math.max(...corners.map((c) => c.y)) + 150,
    }
  }

  /** Zoom at which the whole graded property fits the current canvas. Memoized per box. */
  private fitZoom(): number {
    const w = this.scale.width
    const h = this.scale.height
    if (this.fitCache !== null && this.fitCache.w === w && this.fitCache.h === h) {
      return this.fitCache.zoom
    }
    const e = this.worldExtent()
    const zoom = Phaser.Math.Clamp(
      Math.min(w / (e.maxX - e.minX), h / (e.maxY - e.minY)),
      ZOOM_MIN,
      ZOOM_MAX,
    )
    this.fitCache = { w, h, zoom }
    return zoom
  }

  private bindCamera(): void {
    const e = this.worldExtent()
    this.cameras.main.setBounds(
      e.minX - 420,
      e.minY - 320,
      e.maxX - e.minX + 840,
      e.maxY - e.minY + 640,
    )
    this.cameras.main.setBackgroundColor(C.haze)
    this.scale.on('resize', this.preserveCameraOnResize, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.preserveCameraOnResize, this)
    })
  }

  private preserveCameraOnResize(): void {
    // React chrome can change the RESIZE canvas box. That is not a camera command.
    const camera = this.cameras.main
    const { scrollX, scrollY, zoom } = camera
    camera.setZoom(zoom)
    camera.setScroll(scrollX, scrollY)
  }

  private bindInput(): void {
    this.input.setDefaultCursor('grab')
    this.input.mouse?.disableContextMenu()

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isCanvasPointer(pointer)) return
      this.dragging = true
      this.dragMoved = false
      this.dragStart = { x: pointer.x, y: pointer.y }
      this.scrollStart = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY }
      this.input.setDefaultCursor('grabbing')
    })
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointerScreen = this.inputSuspended ? null : { x: pointer.x, y: pointer.y }
      if (this.inputSuspended || !this.dragging) return
      const dx = pointer.x - this.dragStart.x
      const dy = pointer.y - this.dragStart.y
      if (Math.abs(dx) + Math.abs(dy) > 6) this.dragMoved = true
      if (!this.dragMoved) return
      const zoom = this.cameras.main.zoom
      this.cameras.main.setScroll(this.scrollStart.x - dx / zoom, this.scrollStart.y - dy / zoom)
    })
    const endDrag = (): void => {
      this.dragging = false
      this.input.setDefaultCursor('grab')
      // Phaser delivers a game object's `pointerup` BEFORE this plugin-level one, so the
      // click that ended a pan has already been declined by the time the latch clears.
      this.dragMoved = false
    }
    this.input.on('pointerup', endDrag)
    this.input.on('pointerupoutside', endDrag)
    this.input.on('gameout', () => { this.pointerScreen = null })

    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _over: unknown[], _dx: number, dy: number) => {
      if (!this.isCanvasPointer(pointer)) return
      // Zoom AT THE CURSOR: sample the world point under the pointer, change zoom, force
      // the camera matrix to refresh, then scroll by the delta so the point stays put.
      const camera = this.cameras.main
      const before = camera.getWorldPoint(pointer.x, pointer.y)
      camera.setZoom(Phaser.Math.Clamp(camera.zoom * (dy > 0 ? 0.9 : 1.1), ZOOM_MIN, ZOOM_MAX))
      camera.preRender()
      const after = camera.getWorldPoint(pointer.x, pointer.y)
      camera.setScroll(camera.scrollX + (before.x - after.x), camera.scrollY + (before.y - after.y))
    })

    const keyboard = this.input.keyboard
    if (keyboard) {
      this.wasd = {
        up: keyboard.addKey('W'),
        down: keyboard.addKey('S'),
        left: keyboard.addKey('A'),
        right: keyboard.addKey('D'),
      }
      this.cursors = keyboard.createCursorKeys()
      keyboard.addKey('R').on('down', () => {
        if (!this.inputSuspended) this.resetCamera()
      })
    }
  }

  /** Phaser can observe document-level input even when React chrome owns the hit. */
  private isCanvasPointer(pointer: Phaser.Input.Pointer): boolean {
    return !this.inputSuspended && pointer.event?.target === this.game.canvas
  }

  resetCamera(): void {
    this.applyCameraPreset('overview')
  }

  applyCameraPreset(preset: CameraFraming): void {
    const framing = CAMERA_FRAMINGS[preset] ?? CAMERA_FRAMINGS.overview
    const camera = this.cameras.main
    const fit = this.fitZoom()
    const at = this.world(framing.at.gx, framing.at.gy)
    camera.setZoom(Phaser.Math.Clamp(fit * framing.scale, ZOOM_MIN, ZOOM_MAX))
    if (preset === 'overview' || preset === 'wide') {
      const e = this.worldExtent()
      camera.centerOn((e.minX + e.maxX) / 2, (e.minY + e.maxY) / 2)
      return
    }
    camera.centerOn(at.x, at.y)
  }

  private focusPlace(place: WorldPlace): void {
    const camera = this.cameras.main
    const at = this.world(place.gx + place.fw / 2, place.gy + place.fd / 2)
    const zoom = Phaser.Math.Clamp(this.fitZoom() * 2.0, ZOOM_MIN, ZOOM_MAX)
    if (this.reducedMotion) {
      camera.setZoom(zoom)
      camera.centerOn(at.x, at.y)
      return
    }
    camera.pan(at.x, at.y, 520, 'Sine.easeInOut')
    camera.zoomTo(zoom, 520, 'Sine.easeInOut')
  }

  /** Host focus by place id, using the Hollywood place vocabulary. */
  focus(placeId: string): void {
    const place =
      placeId === PUBLICITY_PLACE_ID
        ? PLACE_BY_BUILDING.admin
        : placeId === GATE_PLACE_ID
          ? PLACE_BY_BUILDING.gate
          : placeId === ANNEX_PLACE_ID
            ? PLACE_BY_BUILDING.expansion
            : placeId === STAGE_7_PLACE_ID
              ? PLACE_BY_BUILDING['stage-a']
              : placeId === SERVICE_YARD_PLACE_ID
                ? PLACE_BY_BUILDING.post
                : WORLD_PLACES.find((candidate) => candidate.placeId === placeId) ?? null
    if (place) this.focusPlace(place)
  }

  setInputSuspended(on: boolean): void {
    this.inputSuspended = on
    this.dragging = false
    this.dragMoved = false
    this.pointerScreen = null
    this.input.resetPointers()
    this.input.keyboard?.resetKeys()
    this.input.enabled = !on
    if (this.input.keyboard) this.input.keyboard.enabled = !on
  }

  setReducedMotion(on: boolean): void {
    this.reducedMotion = on
    if (!on) return
    this.clearPublicityVisual()
    if (this.roleAtlasActive) {
      for (const actor of this.ambientActors) {
        actor.direction = 'south'
        this.setActorFacing(actor.sprite, actor.role, actor.direction)
      }
    }
    if (this.cosmeticRoute) this.finishDirectorRoute()
    if (this.cosmeticSceneryLoadIn) this.finishSceneryLoadIn()
  }

  // ── frame ───────────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    const updateStart = performance.now()
    this.capturePerformanceFrame = this.performanceWarmupFramesRemaining === 0
    if (!this.capturePerformanceFrame) {
      this.performanceWarmupFramesRemaining--
    } else {
      const rawFrameMs = this.game?.loop?.rawDelta ?? delta
      if (Number.isFinite(rawFrameMs) && rawFrameMs > 0) {
        this.frameSamples.push(rawFrameMs)
        if (this.frameSamples.length > PERFORMANCE_SAMPLE_FRAMES) this.frameSamples.shift()
        this.worstFrameMs = Math.max(...this.frameSamples)
      }
    }

    this.updateCameraPan(delta)
    this.updateLod()

    if (!this.reducedMotion) {
      for (const actor of this.ambientActors) {
        actor.phase = (actor.phase + delta * actor.speed) % 1
        const t = (1 - Math.cos(actor.phase * Math.PI * 2)) / 2
        const gx = Phaser.Math.Linear(actor.a.gx, actor.b.gx, t)
        const gy = Phaser.Math.Linear(actor.a.gy, actor.b.gy, t)
        const p = this.world(gx, gy)
        actor.sprite.setPosition(p.x, p.y)
        actor.sprite.setDepth(this.depthAt(gx, gy, 7))
        const forward = actor.phase < 0.5
        const dgx = (forward ? 1 : -1) * (actor.b.gx - actor.a.gx)
        const dgy = (forward ? 1 : -1) * (actor.b.gy - actor.a.gy)
        actor.direction = directionFromDelta(dgx - dgy, dgx + dgy, actor.direction)
        if (this.roleAtlasActive) this.setActorFacing(actor.sprite, actor.role, actor.direction)
        else actor.sprite.setFlipX(actor.direction === 'west')
      }
    }

    if (this.cosmeticRoute) this.updateDirectorRoute(delta)
    if (this.cosmeticSceneryLoadIn) {
      this.cosmeticSceneryLoadIn.elapsed += delta
      if (this.cosmeticSceneryLoadIn.elapsed >= SCENERY_SWEEP_DURATION_MS) {
        this.finishSceneryLoadIn()
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

  private updateCameraPan(delta: number): void {
    if (this.inputSuspended) return
    const camera = this.cameras.main
    const dt = Math.min(delta / 1000, 0.05)
    let mx = 0
    let my = 0
    if (this.wasd && this.cursors) {
      if (this.wasd.left.isDown || this.cursors.left.isDown) mx -= 1
      if (this.wasd.right.isDown || this.cursors.right.isDown) mx += 1
      if (this.wasd.up.isDown || this.cursors.up.isDown) my -= 1
      if (this.wasd.down.isDown || this.cursors.down.isDown) my += 1
    }
    // Edge scroll: only while the pointer is genuinely over the canvas. `isOver` is the
    // guard that matters — a pointer parked near an edge and then moved onto React chrome
    // stops producing canvas moves, and a stale position would otherwise scroll forever.
    const p = this.pointerScreen
    if (p !== null && !this.dragging && this.input.manager.isOver) {
      const margin = 26
      const w = this.scale.width
      const h = this.scale.height
      if (p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h) {
        if (p.x < margin) mx -= 1
        else if (p.x > w - margin) mx += 1
        if (p.y < margin) my -= 1
        else if (p.y > h - margin) my += 1
      }
    }
    if (mx === 0 && my === 0) return
    const speed = (900 * dt) / camera.zoom
    camera.setScroll(camera.scrollX + mx * speed, camera.scrollY + my * speed)
  }

  /**
   * Three reading distances, plus constant-screen-size chrome.
   *
   * Institution: silhouettes and status colour, no text and no person-level detail.
   * Operations: the working studio. People: nameplates on everyone.
   */
  private updateLod(): void {
    const zoom = this.cameras.main.zoom
    const institutionBelow = this.fitZoom() * ZOOM_INSTITUTION_OF_FIT
    const band: 'institution' | 'operations' | 'people' =
      zoom < institutionBelow ? 'institution' : zoom < ZOOM_PEOPLE ? 'operations' : 'people'
    const bandChanged = band !== this.lodBand
    this.lodBand = band

    // Counter-scale so on-canvas chrome keeps a constant SCREEN size: text never shrinks
    // below legibility, it is hidden instead (code-mining ledger entry 4, rule 1).
    if (Math.abs(zoom - this.chromeZoom) > 0.001) {
      this.chromeZoom = zoom
      const inv = 1 / zoom
      for (const view of this.buildings.values()) {
        view.label.setScale(inv)
        view.badge.setScale(inv)
        view.chip.setScale(inv)
        view.lamp?.setScale(inv)
        // Re-stack: status chip, then the name, then the status line under it.
        view.label.setY(view.chromeBaseY)
        view.badge.setY(view.chromeBaseY + 3 * inv)
        view.chip.setY(view.chromeBaseY - view.label.height * inv - 10 * inv)
      }
      this.expansionLabel?.setScale(inv)
      for (const runtime of this.runtimePeople.values()) runtime.label.setScale(inv)
    }

    if (!bandChanged) return
    const institution = band === 'institution'
    for (const actor of this.ambientActors) actor.sprite.setVisible(!institution)
    for (const car of this.stageCars) car.setVisible(!institution)
    for (const view of this.buildings.values()) view.sign?.setVisible(!institution)
    this.applyChromeVisibility()
    this.paintPersonSelection()
  }

  /** One owner of on-canvas chrome visibility, so a repaint and a zoom cannot disagree. */
  private applyChromeVisibility(): void {
    const band = this.lodBand
    const text = band !== 'institution'
    for (const view of this.buildings.values()) {
      const wantBadge = view.badge.getData('want') === true
      // The Annex parcel carries its own lifecycle caption instead of generic chrome.
      view.label.setVisible(text && view.place.buildingId !== 'expansion')
      view.badge.setVisible(band === 'operations' && wantBadge)
      // Status colour survives every band; at institution scale it is the only readout.
      view.chip.setVisible(view.chip.getData('status') === true)
    }
    this.expansionLabel?.setVisible(text)
  }

  // ── telemetry ───────────────────────────────────────────────────────────────

  private measureWorldTextures(): void {
    let bytes = 0
    for (const key of this.textures.getTextureKeys()) {
      if (key === ROLE_ATLAS_TEXTURE_KEY) continue
      const source = this.textures.get(key).getSourceImage()
      if (source && typeof source.width === 'number' && typeof source.height === 'number') {
        bytes += source.width * source.height * 4
      }
    }
    this.worldTextureBytes = bytes
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
    const average = (values: number[]): number =>
      values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
    const percentile = (values: number[], fraction: number): number => {
      if (values.length === 0) return 0
      const sorted = [...values].sort((a, b) => a - b)
      return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] ?? 0
    }
    const frameMs = average(this.frameSamples)
    const p99FrameMs = percentile(this.frameSamples, 0.99)
    const updateMs = average(this.updateSamples)
    const roleAtlasBytes = this.textures.exists(ROLE_ATLAS_TEXTURE_KEY)
      ? (() => {
          const source = this.textures.get(ROLE_ATLAS_TEXTURE_KEY).getSourceImage()
          return source.width * source.height * 4
        })()
      : 0
    // The fallback silhouettes are baked into this scene's texture manager, so they are
    // already inside `worldTextureBytes`. Attribute them to PEOPLE in the breakdown and
    // subtract them from the world figure, so the two parts sum to the exact total.
    const peopleBytes = roleAtlasBytes + FALLBACK_PEOPLE_BYTES
    const worldBytes = Math.max(0, this.worldTextureBytes - FALLBACK_PEOPLE_BYTES)
    const totalBytes = this.worldTextureBytes + roleAtlasBytes
    return {
      frameSampleCount: this.frameSamples.length,
      fps: Math.round(frameMs ? 1000 / frameMs : this.game.loop.actualFps || 0),
      displayObjects: this.children.length,
      textureMemoryBytes: totalBytes,
      textureMemoryMb: Math.round((totalBytes / 1024 / 1024) * 10) / 10,
      districtTextureMemoryMb: Math.round((worldBytes / 1024 / 1024) * 10) / 10,
      peopleTextureMemoryMb: Math.round((peopleBytes / 1024 / 1024) * 10) / 10,
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
      dynamicActors:
        this.ambientActors.length + this.runtimePeople.size + (this.gateVisitor ? 1 : 0),
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
      manifestId: 'tycoon-lot-v1',
      routeDepths: DIRECTOR_ROUTE.map((point) => this.depthAt(point.gx, point.gy, 7)),
      expansionStatus: this.expansionStatus,
      roleAtlasActive: this.roleAtlasActive,
      gateVisitorTalentId: this.gateVisitor?.presentation.talentId ?? null,
      gateVisitorPosition:
        this.gateVisitor === null
          ? null
          : {
              x: this.gateVisitor.sprite.x,
              y: this.gateVisitor.sprite.y,
              depth: this.gateVisitor.sprite.depth,
            },
    }
  }

  /** Evidence seam: how many authored stage images actually rendered. */
  authoredStageKeys(): string[] {
    return [...this.authoredStages]
  }
}
