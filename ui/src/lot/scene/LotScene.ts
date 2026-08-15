// ── LotScene — the living isometric studio lot ────────────────────────────────
// Presentation only. Renders a StudioLotSnapshot into a composed, grounded, and
// animated studio lot: framed terrain, foundation plinths, a hero gate, buildings
// with distinct silhouettes, production activity you can read without a card
// (open doors + spill light + gear + crew), deterministic ambient life (four
// roles + vehicles with dwell stops), and authored struggling/established
// dressing. Owns no simulation truth — it reads facts and paints.

import Phaser from 'phaser'
import { TILE_W, TILE_H, gridToScreen, depthFor, LAYER } from './iso'
import { COLORS as K } from './palette'
import { Rng } from './rng'
import {
  bakeAllTextures,
  BUILDING_TEX,
  PROP_TEX,
  underDressedKey,
  pointStageBAtAuthored,
  AUTHORED_STAGE_B_KEY,
  AUTHORED_STAGE_B_UD_KEY,
  pointStageAAtAuthored,
  AUTHORED_STAGE_A_KEY,
  AUTHORED_STAGE_A_UD_KEY,
} from './assets'
import {
  LOT_W,
  LOT_D,
  ROADS,
  PLAZA,
  PATHS,
  APRONS,
  EXPANSION_PADS,
  STAGE_APRONS,
  placedBuildings,
  landscaping,
  establishedDressing,
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
import {
  VignetteDirector,
  type VignetteHost,
  type MomentKind,
  type Inspect,
} from './vignettes'
import { manifestFor, type IdentityMode, type StudioIdentityManifest } from '../identity/manifest'
import { drawEmblem } from '../identity/emblem'
import {
  makePlaque,
  makeGateBanner,
  makeStageIdentifier,
  makeMarquee,
  makeAccentBand,
  makeAttentionBadge,
  type AttentionKind,
  type SignTier,
} from '../identity/signage'
import {
  productionStageStatusLabel,
  productionStageVisualState,
  type ProductionStageVisualState,
} from './productionStageState'

const hw = TILE_W / 2
const hh = TILE_H / 2

const ZOOM_MIN = 0.32
const ZOOM_MAX = 1.9

const FONT_SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif'
const FONT_SANS = 'Avenir, "Helvetica Neue", Arial, sans-serif'

/** A presentation-only description of an ambient/vignette character. */
export type CharacterInfo = {
  role: string
  activity: string
  production?: string
  building?: string
  description: string
}

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
  | { type: 'character'; info: CharacterInfo | null }
  | { type: 'activity'; text: string | null }
  | { type: 'ready' }

export type CameraPreset = 'overview' | 'production' | 'wide' | 'entrance' | 'theater'

export type LotSceneData = {
  snapshot: StudioLotSnapshot
  onEvent: (e: LotEvent) => void
  /**
   * D1-B soundstage content gate, resolved by the React host (the scene never reads flags
   * itself). Textures are baked in create(), before any setter could run, so this has to
   * arrive with the scene's init data. Absent/false ⇒ the pre-spike shared stage texture.
   */
  distinctStages?: boolean
  /**
   * Authored Soundstage Pipeline Proof gate, resolved by the React host from ../flags.ts.
   * DEFAULT OFF. When off, preload() fetches nothing and the lot is the production lot.
   */
  authoredStage?: boolean
  /**
   * Authored Stage A content gate, resolved by the React host from ../flags.ts.
   * DEFAULT ON. When rolled back, preload() fetches no authored Stage A image and Stage A
   * is the procedural build.
   */
  authoredStageA?: boolean
}

type ProdTag = {
  container: Phaser.GameObjects.Container
  full: Phaser.GameObjects.Container
  compact: Phaser.GameObjects.Container
}

type BuildingView = {
  spec: PlacedBuilding
  container: Phaser.GameObjects.Container
  sprite: Phaser.GameObjects.Sprite | null
  outline: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Container
  recLight: Phaser.GameObjects.Sprite | null
  doorGlow: Phaser.GameObjects.Graphics | null
  prodTag: ProdTag | null
  dressing: Phaser.GameObjects.GameObject[]
}

type Waypt = { gx: number; gy: number; dwell?: number }

type Agent = {
  sprite: Phaser.GameObjects.Sprite
  route: Waypt[]
  seg: number
  pos: number
  dwellLeft: number
  speed: number
  bob: number
  kind: 'worker' | 'vehicle'
  /** only visible when this stage is active (crew/loading); undefined = always */
  stageGate?: 'stage-a' | 'stage-b'
  /** only visible when the studio is busy */
  busyOnly?: boolean
  /** presentation-only inspection card data */
  inspect?: Inspect
}

export class LotScene extends Phaser.Scene {
  private snapshot!: StudioLotSnapshot
  private emitEvent!: (e: LotEvent) => void

  private views = new Map<BuildingId, BuildingView>()
  private agents: Agent[] = []
  private originByKey = new Map<string, number>()
  private establishedProps: Phaser.GameObjects.Sprite[] = []
  private gateLabel: Phaser.GameObjects.Text | null = null

  // ── D1-A studio identity (additive presentation layer) ──────────────────────
  private identityMode: IdentityMode = 'baseline'
  private identity: StudioIdentityManifest = manifestFor('concept-a')
  private identityFailed = false
  private identityBuilt = false
  /** all persistent identity display objects (signs/plaques/marquee/emblem), for show/hide */
  private identityObjects: Phaser.GameObjects.Container[] = []
  /** The Stage A / Stage B facade letters — the subset the review signage mask hides. */
  private stageSignObjects: Phaser.GameObjects.Container[] = []
  /** Review-only: hide every cue that names a stage, so distinctiveness is judged on art. */
  private signageMasked = false
  /** the theater marquee bulbs, for the reduced-motion-gated chase */
  private marqueeBulbs: Phaser.GameObjects.Arc[] = []
  private marqueeTitle: Phaser.GameObjects.Container | null = null
  private lastMarqueeTitle: string | null = null
  private marqueePhase = 0
  /** per-building attention badge containers (recreated on snapshot) */
  private attnBadges = new Map<BuildingId, Phaser.GameObjects.Container>()

  private selected: BuildingId | null = null
  private hovered: BuildingId | null = null
  private tagZoomBand = -1

  // ── pass-3: vignettes + character inspection ────────────────────────────────
  private director!: VignetteDirector
  private pool: Phaser.GameObjects.Sprite[] = []
  private poolUsed: boolean[] = []
  private marker: Phaser.GameObjects.Container | null = null
  private filmingHush = false
  private characterActive = false
  private reducedMotion = false
  /** Input-only modal gate. Ambient life and the scene update loop remain live. */
  private inputSuspended = false

  private dragging = false
  private dragMoved = false
  private dragStart = { x: 0, y: 0 }
  private scrollStart = { x: 0, y: 0 }

  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  /** D1-B content gate, supplied by the host at init(). Default OFF. */
  private distinctStages = false
  /** Authored-Stage-B proof gate, supplied by the host at init(). Default OFF. */
  private authoredStage = false
  /** True once the authored textures were confirmed present and Stage B was re-pointed. */
  private authoredStageActive = false
  /** True if an authored texture failed to load; the procedural fallback then stands. */
  private authoredStageLoadFailed = false
  /** Authored Stage A content gate, supplied by the host at init(). Default ON. */
  private authoredStageA = false
  /** True once the authored textures were confirmed present and Stage A was re-pointed. */
  private authoredStageAActive = false
  /** True if an authored Stage A texture failed to load; the procedural fallback stands. */
  private authoredStageALoadFailed = false
  constructor() {
    super('lot')
  }

  init(data: LotSceneData): void {
    this.snapshot = data.snapshot
    this.emitEvent = data.onEvent
    this.distinctStages = data.distinctStages === true
    this.authoredStage = data.authoredStage === true
    this.authoredStageA = data.authoredStageA === true
  }

  /**
   * The lot's ONLY image load, and only for the authored-Stage-B proof.
   *
   * With the proof flag off this method does nothing at all — no request is made and the
   * loader stays empty, so the production path is unchanged. With it on, Phaser guarantees
   * these finish before create(), which is what keeps texMeta()'s dimension read safe.
   * A failed fetch simply leaves the textures absent; create() checks before using them.
   */
  preload(): void {
    if (!this.authoredStage && !this.authoredStageA) return
    const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
    if (this.authoredStage) {
      this.load.image(AUTHORED_STAGE_B_KEY, `${base}lot/b-stage-b.png`)
      this.load.image(AUTHORED_STAGE_B_UD_KEY, `${base}lot/b-stage-b-ud.png`)
    }
    if (this.authoredStageA) {
      this.load.image(AUTHORED_STAGE_A_KEY, `${base}lot/b-stage-a-h2.png`)
      this.load.image(AUTHORED_STAGE_A_UD_KEY, `${base}lot/b-stage-a-h2-ud.png`)
    }
    // Never let a missing authored asset break the lot: swallow the error and fall through
    // to the procedural texture, which is always baked below. A rolled-back building never
    // reaches here, so it cannot fail. Attributed PER BUILDING — with two authored
    // buildings now shipping by default, one shared flag would report a Stage A failure as
    // a Stage B failure. Diagnostics only; the fallback itself is driven by
    // `textures.exists()` in create(), never by these fields.
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: { key?: string }) => {
      const key = file?.key ?? ''
      if (key === AUTHORED_STAGE_A_KEY || key === AUTHORED_STAGE_A_UD_KEY) {
        this.authoredStageALoadFailed = true
      } else {
        this.authoredStageLoadFailed = true
      }
    })
  }

  create(): void {
    bakeAllTextures(this, { distinctStages: this.distinctStages })
    // Authored-Stage-B proof: re-point the registry ONLY if both textures actually
    // arrived. Footprint and anchor come from the procedural entry, so placement, depth,
    // hit area and every overlay position are unchanged by the swap.
    if (
      this.authoredStage &&
      this.distinctStages &&
      this.textures.exists(AUTHORED_STAGE_B_KEY) &&
      this.textures.exists(AUTHORED_STAGE_B_UD_KEY)
    ) {
      pointStageBAtAuthored(AUTHORED_STAGE_B_KEY)
      this.authoredStageActive = true
    }
    // Stage A H2 proof: identical shape, identical guard. Presentation only — BuildingId,
    // footprint, origin, depth, hit area and every overlay position are untouched.
    if (
      this.authoredStageA &&
      this.distinctStages &&
      this.textures.exists(AUTHORED_STAGE_A_KEY) &&
      this.textures.exists(AUTHORED_STAGE_A_UD_KEY)
    ) {
      pointStageAAtAuthored(AUTHORED_STAGE_A_KEY)
      this.authoredStageAActive = true
    }
    for (const t of Object.values(BUILDING_TEX)) this.originByKey.set(t.key, t.originY)
    for (const t of Object.values(PROP_TEX)) this.originByKey.set(t.key, t.originY)
    // The under-dressed authored texture is not in BUILDING_TEX (nor is the procedural
    // one), so give it the same anchor its normal finish uses.
    if (this.authoredStageActive) {
      this.originByKey.set(AUTHORED_STAGE_B_UD_KEY, BUILDING_TEX.stageB.originY)
    }
    if (this.authoredStageAActive) {
      this.originByKey.set(AUTHORED_STAGE_A_UD_KEY, BUILDING_TEX.stageA.originY)
    }

    this.buildGround()
    this.buildBoundary()
    this.buildBuildings()
    // Identity is built lazily on the first non-baseline setIdentityMode() (D1-A flag).
    // With the flag off the host never switches mode, so nothing identity-related is
    // created and the baseline lot is byte-for-byte the shipped D1 scene.
    this.buildLandscaping()
    this.buildEstablishedDressing()
    this.buildAgents()
    this.buildVignetteSystem()

    this.setupCamera()
    this.setupInput()

    this.applySnapshot(this.snapshot)
    this.resetCamera()

    // React chrome (including the next-event rail) can resize the canvas without
    // expressing a player camera command. Preserve the exact live transform.
    const onResize = () => this.preserveCameraOnResize()
    this.scale.on('resize', onResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', onResize))

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.director?.destroy())
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.director?.destroy())

    this.emitEvent({ type: 'ready' })
  }

  private texMeta(key: string): { w: number; h: number; originY: number } {
    const img = this.textures.get(key).getSourceImage() as HTMLCanvasElement
    return { w: img.width, h: img.height, originY: this.originByKey.get(key) ?? 0.9 }
  }

  private lotCorners(): { x: number; y: number }[] {
    return [
      gridToScreen(0, 0),
      gridToScreen(LOT_W, 0),
      gridToScreen(LOT_W, LOT_D),
      gridToScreen(0, LOT_D),
    ]
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
    paint(APRONS, 't-apron')
    return g
  }

  /** A framing wall along the back edges + a low hedge along the front edges. */
  private buildBoundary(): void {
    const backWall = (
      a: { gx: number; gy: number },
      b: { gx: number; gy: number },
    ): void => {
      const wallH = 20
      const g = this.add.graphics()
      g.setDepth(-900_000)
      const pa = gridToScreen(a.gx, a.gy)
      const pb = gridToScreen(b.gx, b.gy)
      g.fillStyle(K.hedgeDark, 1)
      g.fillPoints([pa, pb, { x: pb.x, y: pb.y - 10 }, { x: pa.x, y: pa.y - 10 }], true)
      g.fillStyle(K.wallStuccoL, 1)
      g.fillPoints(
        [
          { x: pa.x, y: pa.y - 8 },
          { x: pb.x, y: pb.y - 8 },
          { x: pb.x, y: pb.y - 8 - wallH },
          { x: pa.x, y: pa.y - 8 - wallH },
        ],
        true,
      )
      g.fillStyle(K.wallCoping, 1)
      g.fillPoints(
        [
          { x: pa.x, y: pa.y - 8 - wallH },
          { x: pb.x, y: pb.y - 8 - wallH },
          { x: pb.x, y: pb.y - 12 - wallH },
          { x: pa.x, y: pa.y - 12 - wallH },
        ],
        true,
      )
    }
    // back-right (gy=0) and back-left (gx=0) walls, behind everything
    backWall({ gx: 0, gy: 0 }, { gx: LOT_W, gy: 0 })
    backWall({ gx: 0, gy: 0 }, { gx: 0, gy: LOT_D })

    // low perimeter hedge along the two FRONT edges (in front), with a gap at the
    // boulevard so the gate reads as the opening. Drawn per-tile for depth safety.
    const hedgeTile = (gx: number, gy: number, along: 'gx' | 'gy'): void => {
      const g = this.add.graphics()
      g.setDepth(depthFor(gx, gy, LAYER.prop))
      const p0 = gridToScreen(gx, gy)
      const p1 = along === 'gx' ? gridToScreen(gx + 1, gy) : gridToScreen(gx, gy + 1)
      const h = 13
      g.fillStyle(K.hedge, 1)
      g.fillPoints([p0, p1, { x: p1.x, y: p1.y - h }, { x: p0.x, y: p0.y - h }], true)
      g.fillStyle(K.hedgeDark, 1)
      g.fillPoints(
        [
          { x: p0.x, y: p0.y - h },
          { x: p1.x, y: p1.y - h },
          { x: p1.x, y: p1.y - h - 3 },
          { x: p0.x, y: p0.y - h - 3 },
        ],
        true,
      )
    }
    for (let gx = 0; gx < LOT_W; gx++) {
      if (gx >= 8 && gx <= 11) continue // gate opening on the boulevard
      hedgeTile(gx, LOT_D, 'gx') // front-left edge (gy = LOT_D)
    }
    for (let gy = 0; gy < LOT_D; gy++) hedgeTile(LOT_W, gy, 'gy') // front-right edge (gx = LOT_W)
  }

  // ── buildings ─────────────────────────────────────────────────────────────

  private buildBuildings(): void {
    for (const spec of placedBuildings()) {
      const center = gridToScreen(spec.gx + spec.fw / 2, spec.gy + spec.fd / 2)
      const container = this.add.container(center.x, center.y)
      container.setDepth(depthFor(spec.gx + spec.fw, spec.gy + spec.fd, LAYER.building))

      // foundation plinth (grounds the massing so it doesn't float)
      if (spec.texKey && spec.id !== 'gate') {
        const plinth = this.add.graphics()
        this.drawFootprint(plinth, spec, K.plinthEdge, false, 0.16, K.plinth)
        container.add(plinth)
      }

      const outline = this.add.graphics()
      outline.setVisible(false)
      container.add(outline)

      let sprite: Phaser.GameObjects.Sprite | null = null
      let recLight: Phaser.GameObjects.Sprite | null = null
      let hitTarget: Phaser.GameObjects.GameObject

      if (spec.texKey) {
        const meta = this.texMeta(spec.texKey)
        const shadow = this.add.sprite(0, 6, 'p-shadow')
        shadow.setOrigin(0.5, 0.5)
        shadow.setScale(((spec.fw + spec.fd) / 2) * 1.0, ((spec.fw + spec.fd) / 2) * 0.55)
        shadow.setAlpha(0.4)
        container.add(shadow)

        sprite = this.add.sprite(0, 0, spec.texKey)
        sprite.setOrigin(0.5, meta.originY)
        sprite.setInteractive({ pixelPerfect: true, alphaTolerance: 1 })
        container.add(sprite)
        hitTarget = sprite

        if (spec.id === 'stage-a' || spec.id === 'stage-b') {
          const apexY = -meta.h * meta.originY + meta.h * 0.12
          recLight = this.add.sprite(meta.w * 0.14, apexY, 'p-bulb')
          recLight.setTint(K.recordingOff)
          recLight.setScale(1.3)
          container.add(recLight)
        }
      } else {
        const pad = this.add.graphics()
        this.drawFootprint(pad, spec, K.dirtEdge, true)
        pad.setInteractive(this.footprintPolygon(spec), Phaser.Geom.Polygon.Contains)
        container.add(pad)
        const stake = this.add.text(0, -14, 'EXPANSION PARCEL', {
          fontFamily: FONT_SANS,
          fontSize: '11px',
          color: '#6b5a3c',
        })
        stake.setOrigin(0.5, 1)
        container.add(stake)
        hitTarget = pad
      }

      const labelY = spec.texKey
        ? -this.texMeta(spec.texKey).h * this.texMeta(spec.texKey).originY - 12
        : -34
      const label = this.makeLabel(spec.label)
      label.setPosition(0, labelY)
      label.setVisible(false)
      container.add(label)

      const view: BuildingView = {
        spec,
        container,
        sprite,
        outline,
        label,
        recLight,
        doorGlow: null,
        prodTag: null,
        dressing: [],
      }
      this.views.set(spec.id, view)
      this.wireInteractive(hitTarget, spec.id)
    }

    // studio-name lettering on the gate header (Text overlay; Graphics can't)
    const gate = this.views.get('gate')
    if (gate) {
      const meta = this.texMeta('p-gate')
      this.gateLabel = this.add.text(2, -meta.h * this.originByKey.get('p-gate')! + 30, '', {
        fontFamily: FONT_SERIF,
        fontSize: '13px',
        color: '#f5ecd8',
        fontStyle: 'bold',
      })
      this.gateLabel.setOrigin(0.5, 0.5)
      this.gateLabel.setLetterSpacing?.(1)
      gate.container.add(this.gateLabel)
    }
  }

  // ── D1-A studio identity layer ──────────────────────────────────────────────
  // Additive, presentation-only. Reads only the snapshot (never GameState), no rng,
  // no Math.random. Every element is built once and shown/hidden by mode. Any failure
  // degrades to the untouched base presentation (identityFailed → fallback).

  /** The y just above a building's roof, in its container space (matches the hover label). */
  private buildingTopY(view: BuildingView): number {
    const spec = view.spec
    if (spec.texKey) {
      const meta = this.texMeta(spec.texKey)
      return -meta.h * meta.originY - 12
    }
    return -30
  }

  private add2(o: Phaser.GameObjects.Container, view: BuildingView): void {
    o.setVisible(false)
    view.container.add(o)
    this.identityObjects.push(o)
  }

  /** Top of a building's face for a facade-mounted sign, in container space. */
  private faceY(view: BuildingView, frac: number): number {
    const meta = this.texMeta(view.spec.texKey)
    return -meta.h * meta.originY + meta.h * frac
  }

  private buildIdentity(): void {
    if (this.identityBuilt) return
    this.identityBuilt = true
    const m = this.identity
    this.identityFailed = false
    try {
      // ── Secondary / tertiary department orientation plaques (above the building) ──
      const deptTier: Partial<Record<BuildingId, SignTier>> = {
        admin: 'secondary',
        post: 'secondary',
        writers: 'tertiary',
        casting: 'tertiary',
        expansion: 'tertiary',
      }
      const deptLabel: Partial<Record<BuildingId, string>> = {
        admin: m.signage.administrationLabel,
        post: m.signage.postLabel,
        writers: m.signage.developmentLabel,
        casting: m.signage.castingLabel,
        expansion: m.signage.expansionLabel,
      }
      for (const key of Object.keys(deptLabel) as BuildingId[]) {
        const view = this.views.get(key)
        if (!view) continue
        const plaque = makePlaque(this, m, deptLabel[key]!, { tier: deptTier[key] ?? 'tertiary' })
        plaque.setPosition(0, this.buildingTopY(view))
        this.add2(plaque, view)
      }

      // ── PRIMARY landmark: Stage A / B — big facade identifier + base accent band ──
      for (const [id, letter] of [['stage-a', 'A'], ['stage-b', 'B']] as const) {
        const view = this.views.get(id)
        if (!view || !view.spec.texKey) continue
        const meta = this.texMeta(view.spec.texKey)
        const sign = makeStageIdentifier(this, m, letter)
        sign.setPosition(0, this.faceY(view, 0.52))
        this.add2(sign, view)
        // tracked separately so the review signage mask can hide the stage LETTER without
        // touching the rest of the identity (accent bands, plaques, gate, marquee)
        this.stageSignObjects.push(sign)
        const band = makeAccentBand(this, m, meta.w * 0.5)
        band.setPosition(0, meta.h * (1 - meta.originY) - 6)
        this.add2(band, view)
      }

      // ── PRIMARY landmark: Studio Gate — banner + enlarged emblem ──
      const gate = this.views.get('gate')
      if (gate && gate.spec.texKey) {
        const top = -this.texMeta(gate.spec.texKey).h * this.texMeta(gate.spec.texKey).originY
        const banner = makeGateBanner(this, m)
        banner.setPosition(2, top + 36)
        this.add2(banner, gate)
        const emblem = drawEmblem(this, m, { radius: 26 })
        emblem.setPosition(2, top - 8)
        this.add2(emblem, gate)
      }

      // ── PRIMARY landmark: Theater — base accent band; marquee built below ──
      const theater = this.views.get('theater')
      if (theater && theater.spec.texKey) {
        const meta = this.texMeta(theater.spec.texKey)
        const band = makeAccentBand(this, m, meta.w * 0.5)
        band.setPosition(0, meta.h * (1 - meta.originY) - 6)
        this.add2(band, theater)
      }
      this.refreshMarquee(this.snapshot)
    } catch {
      this.identityFailed = true
      this.hideIdentity()
    }
  }

  /** Rebuild the theater marquee canopy when its title changes (release presence). Title is
   * null when nothing is showing → the marquee reads THEATER (its static no-release state). */
  private refreshMarquee(snap: StudioLotSnapshot): void {
    const theater = this.views.get('theater')
    if (!theater || !theater.spec.texKey) return
    const title = snap.releasePresence !== 'none' ? snap.latestReleaseTitle ?? null : null
    if (this.marqueeTitle && title === this.lastMarqueeTitle) return
    this.lastMarqueeTitle = title
    if (this.marqueeTitle) {
      this.identityObjects = this.identityObjects.filter((o) => o !== this.marqueeTitle)
      this.marqueeTitle.destroy()
    }
    const marquee = makeMarquee(this, this.identity, title)
    marquee.setPosition(0, this.faceY(theater, 0.32))
    marquee.setVisible(this.identityMode === 'concept-a' && !this.identityFailed)
    theater.container.add(marquee)
    this.identityObjects.push(marquee)
    this.marqueeTitle = marquee
    this.marqueeBulbs = (marquee.getData('bulbs') as Phaser.GameObjects.Arc[]) ?? []
  }

  private clearAttentionBadges(): void {
    for (const b of this.attnBadges.values()) b.destroy()
    this.attnBadges.clear()
  }

  /** Render the snapshot's attention states in-canvas (shape + word + colour). No-op unless
   * Concept A is showing. One badge per building; priority warning > active > positive. */
  private updateAttentionBadges(snap: StudioLotSnapshot): void {
    this.clearAttentionBadges()
    if (this.identityMode !== 'concept-a' || this.identityFailed) return
    const add = (id: BuildingId, kind: AttentionKind) => {
      if (this.attnBadges.has(id)) return
      const view = this.views.get(id)
      if (!view) return
      const badge = makeAttentionBadge(this, this.identity, kind)
      badge.setPosition(0, this.buildingTopY(view) - 16)
      view.container.add(badge)
      this.attnBadges.set(id, badge)
    }
    for (const b of snap.buildings) if (b.attention === 'warning') add(b.id, 'warning')
    for (const b of snap.buildings) if (b.attention === 'decision-required') add(b.id, 'decision')
    for (const p of snap.activeProductions) {
      add(p.stageId, p.active ? 'active' : 'occupied')
    }
    if (snap.releasePresence !== 'none') add('theater', 'positive')
  }

  private hideIdentity(): void {
    for (const o of this.identityObjects) o.setVisible(false)
    this.clearAttentionBadges()
    if (this.gateLabel) this.gateLabel.setVisible(true)
  }

  /** Apply a review mode: baseline/fallback show the untouched base; concept-a shows identity. */
  private applyIdentityMode(mode: IdentityMode): void {
    this.identityMode = mode
    // 'fallback' exercises the real degradation path — mark identity failed and hide it, so
    // the shot proves the base lot (labels, navigation, selection) survives an identity fault.
    if (mode === 'fallback') this.identityFailed = true
    else if (mode === 'concept-a') this.identityFailed = false
    const show = mode === 'concept-a' && !this.identityFailed
    for (const o of this.identityObjects) o.setVisible(show)
    if (this.gateLabel) this.gateLabel.setVisible(!show)
    if (show) this.updateAttentionBadges(this.snapshot)
    else this.clearAttentionBadges()
    this.applySignageMask() // a mode change must not un-mask a review capture
  }

  /**
   * D1-B review tooling, default OFF, reachable only behind the soundstage proof gate.
   * Hides every in-canvas cue that NAMES a stage — the facade letter and the hover label —
   * so the Stage A/B distinctiveness gate is judged on architecture alone. It deliberately
   * hides nothing else: accent bands, plaques, the gate, the marquee and all production
   * dressing stay, so the buildings are still shown in their real context.
   */
  setSignageMasked(on: boolean): void {
    this.signageMasked = on
    this.applySignageMask()
  }

  private applySignageMask(): void {
    if (this.signageMasked) for (const o of this.stageSignObjects) o.setVisible(false)
    for (const id of ['stage-a', 'stage-b'] as const) {
      const view = this.views.get(id)
      if (view && this.signageMasked) view.label.setVisible(false)
    }
  }

  /** Public entry (via StudioLotView) to switch the review identity mode. Non-baseline
   * modes build the identity layer on first use; baseline never creates any identity object. */
  setIdentityMode(mode: IdentityMode): void {
    if (mode !== 'baseline') this.buildIdentity()
    this.applyIdentityMode(mode)
  }

  private footprintCorners(spec: PlacedBuilding, margin = 0): { x: number; y: number }[] {
    const fw = spec.fw + margin * 2
    const fd = spec.fd + margin * 2
    const rel = (a: number, b: number): { x: number; y: number } => ({
      x: (a - b) * hw,
      y: (a + b) * hh,
    })
    return [
      rel(-fw / 2, -fd / 2),
      rel(fw / 2, -fd / 2),
      rel(fw / 2, fd / 2),
      rel(-fw / 2, fd / 2),
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
    margin = 0,
    fill?: number,
  ): void {
    const [N, E, S, W] = this.footprintCorners(spec, margin)
    g.clear()
    if (fill !== undefined) {
      g.fillStyle(fill, 1)
      g.fillPoints([N, E, S, W], true)
    } else if (dashed) {
      g.fillStyle(K.dirt, 0.5)
      g.fillPoints([N, E, S, W], true)
    }
    g.lineStyle(dashed ? 2 : fill !== undefined ? 1.5 : 3, color, dashed ? 0.7 : fill !== undefined ? 0.6 : 0.95)
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
      if (this.inputSuspended) return
      this.hovered = id
      this.refreshHighlights()
      if (!this.dragging) this.input.setDefaultCursor('pointer')
    })
    target.on('pointerout', () => {
      if (this.inputSuspended) return
      if (this.hovered === id) {
        this.hovered = null
        this.refreshHighlights()
        if (!this.dragging) this.input.setDefaultCursor('grab')
      }
    })
    target.on('pointerup', () => {
      if (this.inputSuspended) return
      if (this.dragMoved) return
      this.select(id)
    })
  }

  // ── landscaping + established dressing ──────────────────────────────────────

  private placeProp(
    texKey: string,
    gx: number,
    gy: number,
    layer = LAYER.prop,
  ): Phaser.GameObjects.Sprite {
    const s = gridToScreen(gx, gy)
    const spr = this.add.sprite(s.x, s.y, texKey)
    spr.setOrigin(0.5, this.originByKey.get(texKey) ?? 0.9)
    spr.setDepth(depthFor(gx, gy, layer))
    return spr
  }

  private buildLandscaping(): void {
    const rng = new Rng(this.snapshot.sceneSeed + ':props')
    for (const p of landscaping()) {
      const j = p.jitter ?? 0
      const gx = p.gx + (j ? rng.range(-j, j) : 0)
      const gy = p.gy + (j ? rng.range(-j, j) : 0)
      this.placeProp(p.texKey, gx, gy)
    }
  }

  private buildEstablishedDressing(): void {
    const rng = new Rng(this.snapshot.sceneSeed + ':lush')
    for (const p of establishedDressing()) {
      const j = p.jitter ?? 0
      const gx = p.gx + (j ? rng.range(-j, j) : 0)
      const gy = p.gy + (j ? rng.range(-j, j) : 0)
      const spr = this.placeProp(p.texKey, gx, gy)
      spr.setVisible(false)
      this.establishedProps.push(spr)
    }
  }

  // ── ambient agents ──────────────────────────────────────────────────────────

  private buildAgents(): void {
    const rng = new Rng(this.snapshot.sceneSeed + ':agents')
    const addWorker = (
      role: string,
      route: Waypt[],
      opts: { stageGate?: 'stage-a' | 'stage-b'; busyOnly?: boolean } = {},
    ): void => {
      const spr = this.add.sprite(0, 0, role)
      spr.setOrigin(0.5, 0.95)
      this.agents.push({
        sprite: spr,
        route,
        seg: rng.int(0, route.length - 1),
        pos: rng.range(0, 1),
        dwellLeft: 0,
        speed: rng.range(0.55, 0.95),
        bob: rng.range(0, Math.PI * 2),
        kind: 'worker',
        ...opts,
      })
    }

    // office/creative staff strolling the plaza + boulevard
    addWorker('p-office', [
      { gx: 8, gy: 11, dwell: 1.2 },
      { gx: 10.5, gy: 11 },
      { gx: 10.5, gy: 13.5, dwell: 0.8 },
      { gx: 8, gy: 13.5 },
    ])
    addWorker('p-talent', [
      { gx: 9.5, gy: 16 },
      { gx: 9.5, gy: 11, dwell: 1.5 },
      { gx: 9.5, gy: 6.5 },
      { gx: 9.5, gy: 11 },
    ])
    // crew crossing the avenue between districts
    addWorker('p-crew', [
      { gx: 4, gy: 7.5 },
      { gx: 12, gy: 7.5, dwell: 0.6 },
      { gx: 20, gy: 7.5 },
    ])
    addWorker('p-grip', [
      { gx: 13.5, gy: 3 },
      { gx: 13.5, gy: 12, dwell: 1 },
      { gx: 13.5, gy: 16 },
    ])
    // extra life for a busy studio
    addWorker('p-office', [
      { gx: 6, gy: 6.4 },
      { gx: 2, gy: 6.4, dwell: 1 },
      { gx: 6, gy: 6.4 },
    ], { busyOnly: true })
    addWorker('p-talent', [
      { gx: 4, gy: 14 },
      { gx: 8, gy: 14, dwell: 1.2 },
    ], { busyOnly: true })

    // stage crews: loiter at the apron, visible only when the stage is shooting
    for (const stageId of ['stage-a', 'stage-b'] as const) {
      const a = STAGE_APRONS[stageId]
      addWorker('p-crew', [
        { gx: a.crew[0].gx, gy: a.crew[0].gy, dwell: 1.5 },
        { gx: a.gear.gx + 0.6, gy: a.gear.gy, dwell: 1.2 },
        { gx: a.crew[1].gx, gy: a.crew[1].gy, dwell: 1.8 },
      ], { stageGate: stageId })
      addWorker('p-grip', [
        { gx: a.crew[2].gx, gy: a.crew[2].gy, dwell: 1 },
        { gx: a.door.gx, gy: a.door.gy + 0.4, dwell: 2 },
      ], { stageGate: stageId })
    }
    // vehicles on the road network, with a dwell at a stage park
    const mkVehicle = (
      tex: string,
      route: Waypt[],
      opts: { busyOnly?: boolean } = {},
    ): void => {
      const spr = this.add.sprite(0, 0, tex)
      spr.setOrigin(0.5, 0.82)
      this.agents.push({
        sprite: spr,
        route,
        seg: 0,
        pos: rng.range(0, 1),
        dwellLeft: 0,
        speed: rng.range(2.0, 2.6),
        bob: 0,
        kind: 'vehicle',
        ...opts,
      })
    }
    // roadster circulating the boulevard + avenue
    mkVehicle('p-vehicle', [
      { gx: 9.5, gy: 20 },
      { gx: 9.5, gy: 7.5, dwell: 0.5 },
      { gx: 12.5, gy: 7.5 },
      { gx: 12.5, gy: 2 },
      { gx: 12.5, gy: 7.5 },
      { gx: 9.5, gy: 7.5 },
    ])
    // delivery van visiting stage-a apron (established)
    mkVehicle('p-van', [
      { gx: 20, gy: 7.5 },
      { gx: 15.5, gy: 7.5 },
      { gx: 15.5, gy: 6.4, dwell: 3 },
      { gx: 15.5, gy: 7.5 },
      { gx: 22, gy: 7.5 },
    ], { busyOnly: true })
    mkVehicle('p-golfcart', [
      { gx: 9.5, gy: 9 },
      { gx: 9.5, gy: 18, dwell: 1 },
      { gx: 9.5, gy: 9 },
      { gx: 9.5, gy: 6.5, dwell: 0.8 },
    ], { busyOnly: true })
  }

  private segLen(route: Waypt[], i: number): number {
    const a = route[i]
    const b = route[(i + 1) % route.length]
    return Math.hypot(b.gx - a.gx, b.gy - a.gy)
  }

  // ── pass-3: vignette system + character inspection ──────────────────────────

  private buildVignetteSystem(): void {
    // small reusable actor pool (no per-vignette churn)
    for (let i = 0; i < 10; i++) {
      const spr = this.add.sprite(0, 0, 'p-crew')
      spr.setOrigin(0.5, 0.95)
      spr.setVisible(false)
      this.makeInspectable(spr)
      this.pool.push(spr)
      this.poolUsed.push(false)
    }

    // ambient agents are inspectable too
    for (const a of this.agents) {
      a.sprite.setData('inspect', a.inspect ?? this.ambientInspect(a))
      this.makeInspectable(a.sprite)
    }

    // world-space activity marker (a small pin; never seizes the camera)
    const g = this.add.graphics()
    g.fillStyle(K.activityMark, 0.95)
    g.fillTriangle(-7, -12, 7, -12, 0, 0)
    g.lineStyle(1.5, K.labelBg, 0.8)
    g.strokeTriangle(-7, -12, 7, -12, 0, 0)
    g.fillStyle(K.labelBg, 0.9)
    g.fillCircle(0, -13, 2.2)
    const label = this.add.text(0, -26, '', {
      fontFamily: FONT_SANS,
      fontSize: '11px',
      color: '#f5ecd8',
      backgroundColor: '#241a12cc',
      padding: { x: 6, y: 3 },
    })
    label.setOrigin(0.5, 1)
    this.marker = this.add.container(0, 0, [label, g])
    this.marker.setDepth(LAYER.overlay + 500)
    this.marker.setVisible(false)

    const host: VignetteHost = {
      getSnapshot: () => this.snapshot,
      acquire: () => this.acquireActor(),
      release: (i) => this.releaseActor(i),
      setActor: (i, tex, gx, gy, opts) => this.setPoolActor(i, tex, gx, gy, opts),
      emphasizeStage: (id, on) => this.emphasizeStage(id, on),
      takeFlash: (gx, gy) => this.takeFlash(gx, gy),
      marker: (gx, gy, text) => this.showMarker(gx, gy, this.maskStageText(text)),
      clearMarker: () => this.hideMarker(),
      toast: (text) => this.emitEvent({ type: 'activity', text: text === null ? null : this.maskStageText(text) }),
      setFilmingHush: (on) => {
        this.filmingHush = on
      },
    }
    this.director = new VignetteDirector(host, this.snapshot.sceneSeed)
  }

  /**
   * Review signage mask: drop the letter from any presentation string that names a stage.
   * Vignette markers, activity toasts and character cards all print "Soundstage A/B", which
   * would hand the reviewer the answer the mask exists to withhold. Masking them here — at
   * the one place each crosses into presentation — leaves the vignette logic untouched.
   */
  private maskStageText(text: string): string {
    if (!this.signageMasked) return text
    return text.replace(/\b(Sound)?[Ss]tage [AB]\b/g, (m) => (m.startsWith('Sound') ? 'Soundstage' : 'Stage'))
  }

  private ambientInspect(a: Agent): Inspect {
    const key = a.sprite.texture.key
    const stage = a.stageGate
      ? this.maskStageText(a.stageGate === 'stage-a' ? 'Soundstage A' : 'Soundstage B')
      : undefined
    const base: Record<string, Inspect> = {
      'p-crew': { role: 'Production Crew', activity: 'On the lot', description: 'Moving between departments.' },
      'p-office': { role: 'Office Staff', activity: 'Crossing the lot', description: 'Carrying the day’s paperwork.' },
      'p-talent': { role: 'Talent', activity: 'Strolling the lot', description: 'Between calls.' },
      'p-grip': { role: 'Grip', activity: 'Hauling gear', description: 'Between stage and storage.' },
    }
    const info = base[key] ?? { role: 'Studio Staff', activity: 'On the lot', description: 'Part of studio life.' }
    return stage ? { ...info, activity: 'On set', building: stage } : info
  }

  private acquireActor(): number | null {
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.poolUsed[i]) {
        this.poolUsed[i] = true
        return i
      }
    }
    return null
  }

  private releaseActor(i: number): void {
    if (i < 0 || i >= this.pool.length) return
    this.poolUsed[i] = false
    this.pool[i].setVisible(false)
    this.pool[i].setData('inspect', null)
  }

  private setPoolActor(
    i: number,
    tex: string,
    gx: number,
    gy: number,
    opts: { hidden?: boolean; inspect?: Inspect; faceLeft?: boolean },
  ): void {
    const spr = this.pool[i]
    if (!spr) return
    if (spr.getData('tex') !== tex) {
      spr.setTexture(tex)
      spr.setData('tex', tex)
      spr.setInteractive({ pixelPerfect: false }) // refresh hit area to new frame
    }
    const s = gridToScreen(gx, gy)
    spr.setPosition(s.x, s.y)
    spr.setDepth(depthFor(gx, gy, LAYER.prop + 2))
    spr.setFlipX(!!opts.faceLeft)
    spr.setVisible(!opts.hidden)
    spr.setData('inspect', opts.inspect ?? null)
  }

  private emphasizeStage(id: 'stage-a' | 'stage-b', on: boolean): void {
    const view = this.views.get(id)
    if (view?.recLight) {
      view.recLight.setData('on', on || view.recLight.getData('on'))
      view.recLight.setScale(on ? 1.9 : 1.3)
    }
    if (view?.doorGlow) view.doorGlow.setAlpha(on ? 1 : 0.9)
  }

  private takeFlash(gx: number, gy: number): void {
    const s = gridToScreen(gx, gy)
    const flash = this.add.circle(s.x, s.y - 18, 13, K.takeFlash, 0.95)
    flash.setDepth(LAYER.overlay + 400)
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2.1,
      duration: 420,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    })
  }

  private showMarker(gx: number, gy: number, text: string): void {
    if (!this.marker) return
    const s = gridToScreen(gx, gy)
    this.marker.setPosition(s.x, s.y - 40)
    this.marker.setData('baseY', s.y - 40)
    const label = this.marker.list[0] as Phaser.GameObjects.Text
    label.setText(text)
    this.marker.setVisible(true)
  }

  private hideMarker(): void {
    this.marker?.setVisible(false)
  }

  private makeInspectable(spr: Phaser.GameObjects.Sprite): void {
    spr.setInteractive({ pixelPerfect: false })
    spr.on('pointerover', () => {
      if (this.inputSuspended) return
      if (!this.inspectAllowed()) return
      spr.setScale(spr.flipX ? -1.15 : 1.15, 1.15)
      if (!this.dragging) this.input.setDefaultCursor('help')
    })
    spr.on('pointerout', () => {
      if (this.inputSuspended) return
      spr.setScale(spr.flipX ? -1 : 1, 1)
      if (!this.dragging) this.input.setDefaultCursor(this.hovered ? 'pointer' : 'grab')
    })
    spr.on('pointerup', () => {
      if (this.inputSuspended) return
      if (this.dragMoved || !this.inspectAllowed()) return
      const info = spr.getData('inspect') as Inspect | null
      if (info) this.selectCharacter(info)
    })
  }

  private inspectAllowed(): boolean {
    return this.cameras.main.zoom >= 0.55
  }

  private selectCharacter(info: Inspect): void {
    this.characterActive = true
    if (this.selected) {
      this.selected = null
      this.refreshHighlights()
      this.emitEvent({ type: 'deselected' })
    }
    this.emitEvent({ type: 'character', info })
  }

  private clearCharacter(): void {
    if (!this.characterActive) return
    this.characterActive = false
    this.emitEvent({ type: 'character', info: null })
  }

  /** Debug: force a vignette (optionally jumped to a phase) for evidence/tests. */
  forceVignette(kind: MomentKind, phase?: string): boolean {
    return this.director?.force(kind, phase) ?? false
  }

  setDirectorPaused(p: boolean): void {
    this.director?.setPaused(p)
  }

  /**
   * Reduced-motion mode (Gate D1 / directive Phase 10). Freezes all non-essential
   * ambient motion — crew movement, pulsing lights, marker bob, vignettes — while
   * keeping every building, label, state and navigation fully readable and operable.
   * The per-frame motion multiplier in update() does the freezing; the vignette
   * director is paused here.
   */
  setReducedMotion(on: boolean): void {
    this.reducedMotion = on
    this.director?.setPaused(on)
  }

  /**
   * Disable Phaser's world controls while leaving the scene update loop alive.
   * Reset on both edges: a key or pointer held before modal entry must not remain
   * latched, and a release hidden by the modal must not leak into resumed input.
   */
  setInputSuspended(on: boolean): void {
    this.inputSuspended = on
    this.dragging = false
    this.dragMoved = false
    this.dragStart = { x: 0, y: 0 }
    this.scrollStart = { x: 0, y: 0 }
    this.hovered = null
    this.input.resetPointers()
    this.input.keyboard?.resetKeys()
    this.input.enabled = !on
    if (this.input.keyboard) this.input.keyboard.enabled = !on
    this.input.setDefaultCursor(on ? 'default' : 'grab')
    this.refreshHighlights()
  }

  seekVignette(t: number): void {
    this.director?.seek(t)
  }

  /** Screen position (CSS px) of the first visible inspectable character, for tests. */
  firstInspectableScreen(): { x: number; y: number; role: string } | null {
    const cam = this.cameras.main
    const w2s = (wx: number, wy: number): { x: number; y: number } => ({
      x: (wx - cam.worldView.x) * cam.zoom,
      y: (wy - cam.worldView.y) * cam.zoom,
    })
    const pick = (spr: Phaser.GameObjects.Sprite): { x: number; y: number; role: string } | null => {
      const info = spr.getData('inspect') as Inspect | null
      if (!spr.visible || !info) return null
      const p = w2s(spr.x, spr.y - 14)
      return { x: p.x, y: p.y, role: info.role }
    }
    for (const s of this.pool) {
      const r = pick(s)
      if (r) return r
    }
    for (const a of this.agents) {
      const r = pick(a.sprite)
      if (r) return r
    }
    return null
  }

  // ── camera + input ──────────────────────────────────────────────────────────

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
      if (this.inputSuspended) return
      this.dragging = true
      this.dragMoved = false
      this.dragStart = { x: p.x, y: p.y }
      this.scrollStart = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY }
      this.input.setDefaultCursor('grabbing')
    })
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.inputSuspended) return
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
      if (this.inputSuspended) return
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
      kb.addKey('R').on('down', () => {
        if (!this.inputSuspended) this.resetCamera()
      })
    }
  }

  resetCamera(): void {
    this.applyCameraPreset('overview')
  }

  /** Preserve player-authored pan/zoom across RESIZE-owned canvas reflow. */
  private preserveCameraOnResize(): void {
    const cam = this.cameras.main
    const zoom = cam.zoom
    const scrollX = cam.scrollX
    const scrollY = cam.scrollY
    cam.setZoom(zoom)
    cam.setScroll(scrollX, scrollY)
  }

  applyCameraPreset(preset: CameraPreset): void {
    const cam = this.cameras.main
    const corners = this.lotCorners()
    const minX = Math.min(...corners.map((c) => c.x))
    // Headroom above the ground diamond for building tops/labels; footroom below.
    // Tightened for D1 so the overview fills the frame (less dead sky) while still
    // clearing the tallest back-row building.
    const minY = Math.min(...corners.map((c) => c.y)) - 150
    const maxX = Math.max(...corners.map((c) => c.x))
    const maxY = Math.max(...corners.map((c) => c.y)) + 100
    const fit = Phaser.Math.Clamp(
      Math.min(this.scale.width / (maxX - minX), this.scale.height / (maxY - minY)),
      ZOOM_MIN,
      ZOOM_MAX,
    )
    if (preset === 'overview') {
      cam.setZoom(fit)
      cam.centerOn((minX + maxX) / 2, (minY + maxY) / 2)
    } else if (preset === 'wide') {
      cam.setZoom(Math.max(ZOOM_MIN, fit * 0.72))
      cam.centerOn((minX + maxX) / 2, (minY + maxY) / 2)
    } else if (preset === 'entrance') {
      // frame the studio gate + boulevard approach
      const c = gridToScreen(10, 17)
      cam.setZoom(Phaser.Math.Clamp(fit * 2.1, ZOOM_MIN, ZOOM_MAX))
      cam.centerOn(c.x, c.y)
    } else if (preset === 'theater') {
      // frame the screening theater forecourt (studio-reaction gatherings)
      const c = gridToScreen(5, 15)
      cam.setZoom(Phaser.Math.Clamp(fit * 2.0, ZOOM_MIN, ZOOM_MAX))
      cam.centerOn(c.x, c.y)
    } else {
      // production: frame the stage district
      const c = gridToScreen(16, 8)
      cam.setZoom(Phaser.Math.Clamp(fit * 1.9, ZOOM_MIN, ZOOM_MAX))
      cam.centerOn(c.x, c.y)
    }
  }

  // ── selection / highlight ─────────────────────────────────────────────────

  private select(id: BuildingId): void {
    this.clearCharacter() // building navigation supersedes character inspection
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

  triggerAction(id: BuildingId): void {
    this.emitEvent({ type: 'action', buildingId: id, action: BUILDING_ACTION[id] })
  }

  private refreshHighlights(): void {
    for (const [id, view] of this.views) {
      const isSel = id === this.selected
      const isHov = id === this.hovered
      const show = isSel || isHov
      view.outline.setVisible(show)
      if (show) this.drawFootprint(view.outline, view.spec, isSel ? K.selection : K.hover, false, 0.05)
      // the review signage mask keeps a stage's name hidden even on hover/selection
      const named = this.signageMasked && (id === 'stage-a' || id === 'stage-b')
      view.label.setVisible(show && !named)
      if (view.sprite) view.sprite.setY(isHov && !isSel ? -3 : 0)
    }
  }

  // ── snapshot application ────────────────────────────────────────────────────

  applySnapshot(snap: StudioLotSnapshot): void {
    this.snapshot = snap
    const busy = snap.standing === 'established' || snap.standing === 'prestige'

    // a new set of facts cancels in-flight cosmetic activity and clears cards
    this.clearCharacter()
    this.director?.onSnapshot()

    // building availability tint (non-stage)
    for (const [id, view] of this.views) {
      if (view.sprite && id !== 'stage-a' && id !== 'stage-b') {
        const available = this.isAvailable(id)
        view.sprite.clearTint()
        view.sprite.setAlpha(available ? 1 : 0.55)
        if (!available) view.sprite.setTint(0x9a927e)
      }
    }

    // stage production grammar
    for (const stageId of ['stage-a', 'stage-b'] as const) {
      const view = this.views.get(stageId)
      if (!view) continue
      this.applyStageFinish(view, snap)
      this.dressStage(view, snap.activeProductions.find((p) => p.stageId === stageId) ?? null)
    }
    this.dressExpansion(snap)

    // established dressing + marquee
    for (const spr of this.establishedProps) spr.setVisible(busy)
    const theater = this.views.get('theater')
    if (theater?.sprite) {
      const hasHit = snap.releasedFilms.some((f) => f.reception === 'hit' || f.reception === 'smash')
      theater.sprite.setTint(busy && hasHit ? 0xfff2cf : 0xffffff)
    }

    // gate lettering
    if (this.gateLabel) this.gateLabel.setText(snap.studioName.toUpperCase())

    if (this.selected) this.select(this.selected)
    else if (snap.selectedBuildingId) this.select(snap.selectedBuildingId)

    // D1-A identity: refresh marquee title + attention badges. Only when the identity layer
    // has been built (a non-baseline mode was selected) — baseline stays untouched D1.
    if (this.identityBuilt) {
      try {
        this.refreshMarquee(snap)
        if (this.identityMode === 'concept-a' && !this.identityFailed) this.updateAttentionBadges(snap)
      } catch {
        this.identityFailed = true
        this.hideIdentity()
      }
    }

    this.tagZoomBand = -1 // force tag layout refresh under new snapshot
  }

  /**
   * Paint the fixed expansion parcel from authoritative snapshot facts. The
   * decoration owns no clock or transition and is rebuilt on each snapshot, so
   * save/reload lands directly on Vacant, Building, or Operational.
   */
  private dressExpansion(snap: StudioLotSnapshot): void {
    const view = this.views.get('expansion')
    if (!view) return
    for (const object of view.dressing) object.destroy()
    view.dressing = []

    const fact = snap.buildings.find((building) => building.id === 'expansion')
    const status = fact?.constructionStatus ?? 'legacy'
    const progress = Math.max(0, Math.min(1, fact?.constructionProgress01 ?? 0))
    const group = this.add.container(0, 0)
    const art = this.add.graphics()

    if (status === 'legacy') {
      art.lineStyle(2, 0x796e59, 0.65)
      for (let x = -48; x <= 48; x += 16) art.lineBetween(x, -18, x + 24, 18)
    } else if (status === 'vacant') {
      art.lineStyle(2, 0xb99a58, 0.9)
      art.strokeRect(-54, -24, 108, 48)
      for (const x of [-54, 54]) {
        art.fillStyle(0xd4c08d, 1)
        art.fillRect(x - 2, -32, 4, 60)
      }
    } else {
      // Grounded foundation and a building mass that rises with the persisted
      // weekly progress. Operational is the same footprint at full height.
      const height = status === 'operational' ? 72 : 18 + Math.round(progress * 54)
      art.fillStyle(0x554b3c, 0.95)
      art.fillRect(-57, 13, 114, 12)
      art.fillStyle(status === 'operational' ? 0xc8b27e : 0x8e7b59, 1)
      art.fillRect(-48, 13 - height, 96, height)
      art.fillStyle(0x324a42, 1)
      art.fillRect(-42, 7 - height, 84, 7)
      art.lineStyle(2, 0xe0c47b, 0.9)
      art.strokeRect(-48, 13 - height, 96, height)
      if (status === 'building') {
        // Static scaffold: legible at reduced motion and never implies progress.
        art.lineStyle(2, 0xb99a58, 0.95)
        for (const x of [-56, -28, 0, 28, 56]) art.lineBetween(x, -58, x, 23)
        for (const y of [-52, -30, -8, 14]) art.lineBetween(-58, y, 58, y)
      } else {
        art.fillStyle(0x25403a, 1)
        for (const x of [-31, -10, 11, 32]) art.fillRect(x, -39, 12, 19)
        art.fillStyle(0x7b2d25, 1)
        art.fillRect(-8, -23, 16, 36)
      }
    }
    group.add(art)

    const label = this.add.text(
      0,
      status === 'operational' ? -72 : -48,
      status === 'legacy'
        ? 'UNMANAGED PARCEL'
        : status === 'vacant'
          ? 'VACANT PARCEL'
          : status === 'building'
            ? `ANNEX · ${fact?.constructionProgressText ?? 'BUILDING'}`
            : 'DEVELOPMENT & CASTING ANNEX',
      {
        fontFamily: FONT_SANS,
        fontSize: status === 'building' ? '9px' : '10px',
        fontStyle: 'bold',
        color: status === 'legacy' ? '#716955' : '#f2ddb0',
        backgroundColor: '#17221ddd',
        padding: { x: 7, y: 4 },
        align: 'center',
      },
    ).setOrigin(0.5, 1)
    group.add(label)
    view.container.add(group)
    view.dressing.push(group)
  }

  /**
   * Swap a stage to its under-dressed finish when the snapshot says the studio is
   * struggling. Both finishes are baked textures of the SAME building — same massing, roof
   * and doors — so this changes polish, never architecture, and costs no display object.
   * Only meaningful with the D1-B content gate on; the baseline lot has no worn variant.
   */
  private applyStageFinish(view: BuildingView, snap: StudioLotSnapshot): void {
    if (!this.distinctStages || !view.sprite || !view.spec.texKey) return
    const worn = snap.buildings.find((b) => b.id === view.spec.id)?.underDressed === true
    const key = worn ? underDressedKey(view.spec.texKey) : view.spec.texKey
    if (this.textures.exists(key) && view.sprite.texture.key !== key) view.sprite.setTexture(key)
  }

  private stageState(view: BuildingView, prod: ProductionCard | null): ProductionStageVisualState {
    return productionStageVisualState(this.isAvailable(view.spec.id), prod)
  }

  private dressStage(view: BuildingView, prod: ProductionCard | null): void {
    const state = this.stageState(view, prod)

    // clear previous dressing
    for (const o of view.dressing) o.destroy()
    view.dressing = []
    if (view.doorGlow) {
      view.doorGlow.destroy()
      view.doorGlow = null
    }
    if (view.prodTag) {
      view.prodTag.container.destroy()
      view.prodTag = null
    }

    // sprite tint by state
    if (view.sprite) {
      view.sprite.clearTint()
      if (state === 'closed') {
        view.sprite.setAlpha(0.5)
        view.sprite.setTint(0x8f8778)
      } else {
        view.sprite.setAlpha(1)
        if (state === 'vacant') view.sprite.setTint(0xece4d2)
        if (state === 'decision-required') view.sprite.setTint(0xf3dfb0)
      }
    }
    if (view.recLight) {
      view.recLight.setData('on', state === 'recording')
      view.recLight.setTint(state === 'recording' ? K.recordingOn : K.recordingOff)
    }

    if (state === 'closed' || state === 'vacant' || !prod) return

    // Every authoritative reservation keeps its title board, gear and van visible.
    // The open-door glow and REC light remain exclusive to an actual scheduled take.
    if (state === 'recording') {
      view.doorGlow = this.makeDoorGlow(view)
      view.container.add(view.doorGlow)
    }

    const a = STAGE_APRONS[view.spec.id as 'stage-a' | 'stage-b']
    const rng = new Rng(this.snapshot.sceneSeed + ':' + prod.id) // deterministic per film
    const gear: Array<[string, number, number]> = [
      ['p-cart', a.gear.gx, a.gear.gy],
      ['p-crate', a.gear.gx - 0.4, a.gear.gy + 0.3],
      ['p-light', a.gear.gx + 0.7, a.gear.gy - 0.2],
      ['p-cone', a.door.gx - 1.1, a.door.gy + 0.5],
      ['p-cone', a.door.gx + 1.2, a.door.gy + 0.5],
    ]
    for (const [tex, gx, gy] of gear) {
      const jx = rng.range(-0.08, 0.08)
      this.trackDressing(view, this.placeProp(tex, gx + jx, gy, LAYER.prop))
    }

    // title board (easel) with the film title
    const boardG = a.gear.gx - 1.0
    const board = this.placeProp('p-titleboard', boardG, a.gear.gy - 0.4, LAYER.prop)
    this.trackDressing(view, board)
    const bt = this.add.text(board.x, board.y - 34, this.truncate(prod.title, 12), {
      fontFamily: FONT_SERIF,
      fontSize: '9px',
      color: '#3a2f20',
      align: 'center',
    })
    bt.setOrigin(0.5, 0.5)
    bt.setDepth(board.depth + 1)
    this.trackDressing(view, bt)

    // parked production van at the park spot
    this.trackDressing(view, this.placeProp('p-van', a.park.gx, a.park.gy, LAYER.prop))

    // floating production tag (zoom-responsive)
    view.prodTag = this.makeProductionTag(view, prod, state)
  }

  private trackDressing(view: BuildingView, obj: Phaser.GameObjects.GameObject): void {
    view.dressing.push(obj)
  }

  private truncate(s: string, n: number): string {
    return s.length > n ? s.slice(0, n - 1) + '…' : s
  }

  /** Bright quad over the stage doors, drawn in the building container. */
  private makeDoorGlow(view: BuildingView): Phaser.GameObjects.Graphics {
    const spec = view.spec
    // door face is the +gy face; coords relative to the footprint ground-center.
    const H = 78
    const rel = (fgx: number, fgy: number, z: number): { x: number; y: number } => ({
      x: (fgx - spec.fw / 2 - (fgy - spec.fd / 2)) * hw,
      y: (fgx - spec.fw / 2 + (fgy - spec.fd / 2)) * hh - z,
    })
    const g = this.add.graphics()
    const y0 = 0
    const y1 = 0.62 * H
    const c0 = rel(0.85, spec.fd, y0)
    const c1 = rel(spec.fw - 0.85, spec.fd, y0)
    const c2 = rel(spec.fw - 0.85, spec.fd, y1)
    const c3 = rel(0.85, spec.fd, y1)
    g.fillStyle(K.stageInterior, 0.9)
    g.fillPoints([c0, c1, c2, c3], true)
    // warm rim
    g.lineStyle(2, K.marqueeBulb, 0.6)
    g.strokePoints([c0, c1, c2, c3], true, true)
    return g
  }

  private makeProductionTag(
    view: BuildingView,
    prod: ProductionCard,
    state: ProductionStageVisualState,
  ): ProdTag {
    const meta = this.texMeta(view.spec.texKey)
    const topY = -meta.h * meta.originY - 12

    // full card
    const w = 176
    const h = 58
    const full = this.add.container(0, 0)
    const bg = this.add.graphics()
    bg.fillStyle(K.labelBg, 0.93)
    bg.fillRoundedRect(-w / 2, -h, w, h, 6)
    const accent = state === 'recording' ? K.recordingOn : K.selection
    bg.lineStyle(1.5, accent, 0.9)
    bg.strokeRoundedRect(-w / 2, -h, w, h, 6)
    bg.fillStyle(K.labelBg, 0.93)
    bg.fillTriangle(-6, -2, 6, -2, 0, 7)
    const title = this.add.text(-w / 2 + 12, -h + 9, prod.title, {
      fontFamily: FONT_SERIF,
      fontSize: '13px',
      color: '#f5ecd8',
    })
    const status = productionStageStatusLabel(prod, state)
    const sub = this.add.text(-w / 2 + 12, -h + 28, `${status}  ·  ${prod.weeksRemaining} wks left`, {
      fontFamily: FONT_SANS,
      fontSize: '10px',
      color: '#c9bfa6',
    })
    const barW = w - 24
    const by = -13
    const bar = this.add.graphics()
    bar.fillStyle(0x000000, 0.4)
    bar.fillRoundedRect(-w / 2 + 12, by, barW, 6, 3)
    bar.fillStyle(accent, 0.95)
    bar.fillRoundedRect(-w / 2 + 12, by, Math.max(4, barW * prod.progress01), 6, 3)
    full.add([bg, title, sub, bar])

    // compact marker (far zoom): a small lit pill with the title
    const compact = this.add.container(0, 0)
    const cg = this.add.graphics()
    const ct = this.add.text(10, -9, this.truncate(prod.title, 16), {
      fontFamily: FONT_SANS,
      fontSize: '11px',
      color: '#f5ecd8',
    })
    ct.setOrigin(0, 0.5)
    const cw = ct.width + 24
    cg.fillStyle(K.labelBg, 0.9)
    cg.fillRoundedRect(-cw / 2 + 8, -16, cw, 20, 10)
    cg.fillStyle(accent, 1)
    cg.fillCircle(-cw / 2 + 18, -6, 3.5)
    ct.setPosition(-cw / 2 + 26, -6)
    compact.add([cg, ct])

    const container = this.add.container(view.container.x, view.container.y + topY, [full, compact])
    container.setDepth(LAYER.overlay + view.container.depth)
    return { container, full, compact }
  }

  private isAvailable(id: BuildingId): boolean {
    const b = this.snapshot.buildings.find((x) => x.id === id)
    return b ? b.available : true
  }

  private productionFor(id: BuildingId): ProductionCard | null {
    if (id !== 'stage-a' && id !== 'stage-b') return null
    return this.snapshot.activeProductions.find((p) => p.stageId === id) ?? null
  }

  // ── update loop ─────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 0.05)
    const t = this.time.now / 1000
    const cam = this.cameras.main
    // Reduced-motion: multiply every time-based ambient delta by 0 → the lot renders
    // static but fully readable. Navigation (keyboard pan below) is unaffected.
    const motion = this.reducedMotion ? 0 : 1

    // D1-A marquee bulb chase — decorative only. Under reduced motion (motion === 0) every
    // bulb sits fully lit (the static equivalent); otherwise a gentle deterministic chase runs.
    if (this.marqueeBulbs.length && this.identityMode === 'concept-a' && !this.identityFailed) {
      const primary = this.identity.palette.primary
      if (motion === 0) {
        for (const b of this.marqueeBulbs) b.setFillStyle(primary, 1)
      } else {
        this.marqueePhase += dt * 3
        const p = Math.floor(this.marqueePhase)
        for (let i = 0; i < this.marqueeBulbs.length; i++) {
          this.marqueeBulbs[i].setFillStyle(primary, (i + p) % 4 === 0 ? 0.4 : 1)
        }
      }
    }

    // keyboard panning
    let mx = 0
    let my = 0
    if (!this.inputSuspended && this.wasd) {
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
    const activeStages = new Set(
      this.snapshot.activeProductions.filter((p) => p.active).map((p) => p.stageId),
    )

    // agents
    for (const a of this.agents) {
      let show = true
      if (a.busyOnly && !busy) show = false
      if (a.stageGate && !activeStages.has(a.stageGate)) show = false
      a.sprite.setVisible(show)
      if (!show) continue

      if (a.dwellLeft > 0) {
        a.dwellLeft -= dt
      } else {
        const len = this.segLen(a.route, a.seg)
        // during a filming take, nearby life goes quiet
        const hush = this.filmingHush && a.kind === 'worker' ? 0.12 : 1
        a.pos += a.speed * hush * dt * motion
        if (a.pos >= len) {
          a.pos -= len
          a.seg = (a.seg + 1) % a.route.length
          const w = a.route[a.seg]
          if (w.dwell) a.dwellLeft = w.dwell
        }
      }
      const from = a.route[a.seg]
      const to = a.route[(a.seg + 1) % a.route.length]
      const len = this.segLen(a.route, a.seg) || 1
      const t01 = a.dwellLeft > 0 ? 0 : Phaser.Math.Clamp(a.pos / len, 0, 1)
      const gx = from.gx + (to.gx - from.gx) * t01
      const gy = from.gy + (to.gy - from.gy) * t01
      const s = gridToScreen(gx, gy)
      const bob = a.kind === 'worker' && a.dwellLeft <= 0 ? Math.sin(t * 6 + a.bob) * 1.4 * motion : 0
      a.sprite.setPosition(s.x, s.y + bob)
      a.sprite.setDepth(depthFor(gx, gy, LAYER.prop + 1))
    }

    // recording lights pulse
    for (const view of this.views.values()) {
      if (!view.recLight) continue
      view.recLight.setAlpha(
        view.recLight.getData('on') ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 4) * motion) : 0.4,
      )
    }

    // zoom-responsive production tags
    const band = cam.zoom < 0.55 ? 0 : cam.zoom < 1.15 ? 1 : 2
    if (band !== this.tagZoomBand) {
      this.tagZoomBand = band
      for (const view of this.views.values()) {
        if (!view.prodTag) continue
        view.prodTag.full.setVisible(band === 1)
        view.prodTag.compact.setVisible(band === 0)
        view.prodTag.container.setVisible(band !== 2)
      }
    }

    // vignette director + marker bob
    this.director?.update(dt * motion)
    if (this.marker?.visible) {
      const base = (this.marker.getData('baseY') as number) ?? this.marker.y
      this.marker.setY(base + Math.sin(t * 3) * 2 * motion)
    }
  }

  // ── debug (used by the headless verification harness) ────────────────────────

  debugState(): {
    selected: BuildingId | null
    activeTags: number
    displayObjects: number
    characterActive: boolean
    poolInUse: number
    vignette: ReturnType<VignetteDirector['debug']> | null
    /** Authored Stage B: which Stage B implementation actually rendered. */
    stageBTexture: string
    authoredStageActive: boolean
    authoredStageLoadFailed: boolean
    /** Authored Stage A: which Stage A implementation actually rendered. */
    stageATexture: string
    authoredStageAActive: boolean
    authoredStageALoadFailed: boolean
  } {
    let activeTags = 0
    for (const v of this.views.values()) if (v.prodTag) activeTags++
    return {
      selected: this.selected,
      activeTags,
      displayObjects: this.children.list.length,
      characterActive: this.characterActive,
      poolInUse: this.poolUsed.filter(Boolean).length,
      vignette: this.director?.debug() ?? null,
      stageBTexture: this.views.get('stage-b')?.sprite?.texture.key ?? '',
      authoredStageActive: this.authoredStageActive,
      authoredStageLoadFailed: this.authoredStageLoadFailed,
      stageATexture: this.views.get('stage-a')?.sprite?.texture.key ?? '',
      authoredStageAActive: this.authoredStageAActive,
      authoredStageALoadFailed: this.authoredStageALoadFailed,
    }
  }

  /** D1-A review: identity + coarse runtime stats for the dev performance panel. */
  identityDebug(): {
    mode: IdentityMode
    failed: boolean
    identityObjects: number
    attnBadges: number
    marqueeBulbs: number
    displayObjects: number
    fps: number
  } {
    return {
      mode: this.identityMode,
      failed: this.identityFailed,
      identityObjects: this.identityObjects.length,
      attnBadges: this.attnBadges.size,
      marqueeBulbs: this.marqueeBulbs.length,
      displayObjects: this.children.list.length,
      fps: Math.round(this.game.loop.actualFps),
    }
  }
}
