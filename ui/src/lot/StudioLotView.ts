// ── StudioLotView — the public, embeddable integration surface ────────────────
//
// This is the whole boundary the React host touches:
//
//     StudioLotSnapshot  →  new StudioLotView(...)  →  onAction / onSelect events
//
// The host constructs a view with a snapshot and a couple of callbacks, then feeds
// it new snapshots over time. It never touches Phaser, the scene, or any drawing.
// Buildings clicked in the lot surface here as `onSelect`; navigation intents
// surface as `onAction`. That is the entire contract.
//
// Extracted from the approved Studio Lot Spike (studio-lot-spike @ 3806ef6) for
// Gate D1. Presentation only: it owns no simulation rule, no GameState, no save.
// Phaser is loaded only because the React host `import()`s this module lazily, so
// nothing here reaches the eager application bundle.

import Phaser from 'phaser'
import { LotScene, type LotEvent, type CameraPreset, type CharacterInfo } from './scene/LotScene'
import type { MomentKind } from './scene/vignettes'
import type { StudioLotSnapshot, BuildingId, LotActionKind, ProductionCard } from './snapshot/StudioLotSnapshot'
import type { IdentityMode } from './identity/manifest'
import {
  HollywoodScene,
  type HollywoodFailureReason,
  type HollywoodGateVisitorPresentation,
  type HollywoodGateVisitorSelection,
  type HollywoodPerformance,
  type HollywoodPlaceSelection,
  type HollywoodProductionSelection,
  type HollywoodSceneryLoadInSelection,
} from './hollywood/HollywoodScene'
import {
  TycoonScene,
  type TycoonBuildMode,
  type TycoonEvent,
  type TycoonPlacementPreview,
} from './tycoon/TycoonScene'
import type { LotCellPoint } from './snapshot/StudioLotSnapshot'
import type { LotPersonState } from './snapshot/StudioLotSnapshot'
import { threeLotEnabled } from '../flags.ts'
import type { ThreeLotEvent, ThreeLotScene } from './three/ThreeLotScene'

export type { CameraPreset, CharacterInfo, MomentKind }
export type { HollywoodGateVisitorPresentation, HollywoodGateVisitorSelection }

export type SelectionInfo = {
  buildingId: BuildingId
  label: string
  blurb: string
  available: boolean
  action: LotActionKind
  production: ProductionCard | null
}

export type LotActionEvent = { buildingId: BuildingId; action: LotActionKind }

export type StudioLotViewOptions = {
  /** Element the canvas mounts into. Must have a non-zero CSS size. */
  parent: HTMLElement
  snapshot: StudioLotSnapshot
  /** A building's navigation intent was invoked (host opens the matching screen). */
  onAction?: (e: LotActionEvent) => void
  /** Selection changed (host shows/updates an info panel). null = cleared. */
  onSelect?: (sel: SelectionInfo | null) => void
  /** An ambient/vignette character was inspected. null = dismissed. */
  onCharacter?: (info: CharacterInfo | null) => void
  /** A cosmetic activity cue (vignette toast). null = clear. */
  onActivity?: (text: string | null) => void
  /** Operation Hollywood semantic events, kept presentation-only at this boundary. */
  onHollywoodPerson?: (person: LotPersonState | null) => void
  onHollywoodPlace?: (place: HollywoodPlaceSelection) => void
  onHollywoodProduction?: (production: HollywoodProductionSelection) => void
  onHollywoodSceneryLoadIn?: (selection: HollywoodSceneryLoadInSelection) => void
  /** One physical Gate visitor identity; the host resolves all current candidate facts. */
  onHollywoodGateVisitor?: (selection: HollywoodGateVisitorSelection) => void
  /** The lot finished first paint. */
  onReady?: () => void
  /** Hollywood could not establish or retain a usable physical renderer. */
  onHollywoodFailure?: (reason: HollywoodFailureReason) => void
  /**
   * D1-B soundstage content gate, resolved by the host from ../flags.ts. Consumed once at
   * scene init (textures bake in create()), so it is not switchable on a live view.
   */
  distinctStages?: boolean
  /**
   * Authored Soundstage Pipeline Proof gate, resolved by the host from ../flags.ts.
   * DEFAULT OFF. Consumed once at scene init, like `distinctStages`.
   */
  authoredStage?: boolean
  /**
   * Authored Stage A content gate, resolved by the host from ../flags.ts.
   * DEFAULT ON. Consumed once at scene init, like the others.
   */
  authoredStageA?: boolean
  /** Phase II hybrid district presentation. Independent from the legacy D1 renderer. */
  hollywood?: boolean
  /**
   * Tycoon World Conversion M1: render the navigable isometric grid property instead of
   * the painted district plate. Requires `hollywood` (both worlds publish the same
   * semantic event contract); an explicit rollback returns the plate untouched.
   */
  tycoon?: boolean
  /**
   * A physical place was activated in the grid world. The host runs the SAME verb its
   * DOM companion list runs for that destination, so canvas intent and semantic
   * navigation can never route to different owners.
   */
  onWorldBuilding?: (buildingId: BuildingId) => void
  /**
   * Build Mode V1: a parcel of the studio's own ground was activated in the world. The
   * host lands the SAME in-world panel its companion control lands (shift law 10).
   */
  onWorldParcel?: (parcelId: string) => void
  /**
   * A build-mode origin was pointed at on the canvas. Presentation INTENT only — the
   * host owns the draft, runs the Engine's own `queryPlacement`, and hands the verdict
   * back down as a preview. Nothing here commits or enters simulation state.
   */
  onWorldBuildOrigin?: (parcelId: string | null, origin: LotCellPoint) => void
}

export type { TycoonBuildMode, TycoonPlacementPreview }

export class StudioLotView {
  private game: Phaser.Game | null
  private scene: LotScene | null = null
  /**
   * The active semantic world renderer. Both the tycoon grid world and the retained
   * Hollywood plate implement the same host-facing surface, so every command below is
   * written once against the union.
   */
  private hollywoodScene: HollywoodScene | TycoonScene | null = null
  /** Narrow handle for the commands only the grid world offers (camera framings). */
  private tycoonScene: TycoonScene | null = null
  /**
   * Visual Tycoon Conversion Spike: the real-3D world renderer, mounted at this same
   * seam behind its own DEFAULT-OFF proof flag. When it is live no Phaser game boots;
   * every host command below forwards to whichever renderer exists. Presentation only.
   */
  private threeScene: ThreeLotScene | null = null
  private readonly useThree: boolean
  private readonly worldSceneKey: 'hollywood' | 'tycoon'
  private pendingSnapshot: StudioLotSnapshot | null = null
  /** Snapshot handed to the currently booting scene; avoids repainting it at ready. */
  private sceneBootSnapshot: StudioLotSnapshot | null = null
  /** Latest transient Gate presentation, retained independently of renderer readiness. */
  private pendingGateVisitor: HollywoodGateVisitorPresentation | null = null
  private reducedMotion = false
  /** Modal overlays suspend world input without pausing or recreating the renderer. */
  private inputSuspended = false
  /** Suppress duplicate loader/create/context-loss reports within one renderer generation. */
  private hollywoodFailureReported = false
  private destroyed = false
  private readonly opts: StudioLotViewOptions

  constructor(opts: StudioLotViewOptions) {
    this.opts = opts
    this.worldSceneKey = opts.tycoon === true ? 'tycoon' : 'hollywood'
    this.useThree = opts.tycoon === true && threeLotEnabled()
    this.pendingSnapshot = opts.snapshot
    if (this.useThree) {
      this.game = null
      void this.bootThree()
    } else {
      this.game = this.boot()
    }
  }

  /** Boot the 3D spike renderer. Lazy import keeps three out of every other path. */
  private async bootThree(): Promise<void> {
    try {
      const { ThreeLotScene } = await import('./three/ThreeLotScene.ts')
      if (this.destroyed) return
      const snapshot = this.pendingSnapshot ?? this.opts.snapshot
      this.sceneBootSnapshot = snapshot
      this.threeScene = new ThreeLotScene({
        parent: this.opts.parent,
        snapshot,
        reducedMotion: this.reducedMotion,
        onEvent: (e: ThreeLotEvent) => {
          if (!this.destroyed) this.handleThreeEvent(e)
        },
      })
    } catch {
      this.reportHollywoodFailure('scene-boot-failed')
    }
  }

  private handleThreeEvent(e: ThreeLotEvent): void {
    if (e.type === 'failure') {
      this.reportHollywoodFailure(e.reason)
      return
    }
    if (e.type === 'ready') {
      if (this.hollywoodFailureReported) return
      this.threeScene?.setReducedMotion(this.reducedMotion)
      this.threeScene?.setInputSuspended(this.inputSuspended)
      if (this.pendingSnapshot && this.pendingSnapshot !== this.sceneBootSnapshot) {
        this.threeScene?.applySnapshot(this.pendingSnapshot)
      }
      this.sceneBootSnapshot = this.pendingSnapshot
      this.opts.onReady?.()
      return
    }
    if (e.type === 'building') this.opts.onWorldBuilding?.(e.buildingId)
    else if (e.type === 'person') this.opts.onHollywoodPerson?.(e.person)
  }

  private boot(): Phaser.Game {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this.opts.parent,
      // Transparent so the CSS gradient on the mount element reads as sky/atmosphere
      // around the lot rather than a flat fill.
      transparent: true,
      // PF1-M1: the product owns exactly one AudioContext, and it is not this one.
      // Phaser would otherwise instantiate a WebAudio sound manager it never uses,
      // while the studio's sound is served by ui/src/audio — which outlives this
      // renderer (lazy mount, rollback gates, fail-closed context-loss teardown).
      audio: { noAudio: true },
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
      // The grid world pans continuously over baked isometric tiles, where sub-pixel
      // sampling shimmers; the painted plate does not and keeps its existing setting.
      render: {
        antialias: true,
        roundPixels: this.opts.tycoon === true,
        powerPreference: 'low-power',
      },
      scene: [],
    })
    if (this.opts.hollywood) {
      game.events.once(Phaser.Core.Events.CONTEXT_LOST, () => {
        if (this.destroyed || game !== this.game) return
        this.reportHollywoodFailure('renderer-context-lost')
      })
    }
    game.events.once('ready', () => {
      if (this.destroyed || game !== this.game || this.hollywoodFailureReported) return
      if (this.opts.hollywood) {
        try {
          const snapshot = this.pendingSnapshot ?? this.opts.snapshot
          this.sceneBootSnapshot = snapshot
          const onEvent = (e: TycoonEvent) => {
            if (!this.destroyed && game === this.game) this.handleHollywoodEvent(e)
          }
          if (this.worldSceneKey === 'tycoon') {
            game.scene.add('tycoon', TycoonScene, true, {
              snapshot,
              onEvent,
              reducedMotion: this.reducedMotion,
            })
          } else {
            game.scene.add('hollywood', HollywoodScene, true, {
              snapshot,
              onEvent,
              reducedMotion: this.reducedMotion,
            })
          }
        } catch {
          // SceneManager failures happen after StudioLotView construction, outside
          // React's lazy-import promise. Surface them through the same exact seam.
          this.reportHollywoodFailure('scene-boot-failed')
        }
        return
      }
      const snapshot = this.pendingSnapshot ?? this.opts.snapshot
      this.sceneBootSnapshot = snapshot
      game.scene.add('lot', LotScene, true, {
        snapshot,
        onEvent: (e: LotEvent) => this.handleEvent(e),
        distinctStages: this.opts.distinctStages === true,
        authoredStage: this.opts.authoredStage === true,
        authoredStageA: this.opts.authoredStageA === true,
      })
    })
    return game
  }

  private handleHollywoodEvent(e: TycoonEvent): void {
    if (e.type === 'failure') {
      this.reportHollywoodFailure(e.reason)
      return
    }
    if (e.type === 'ready') {
      if (this.hollywoodFailureReported || this.game === null) return
      const scene = this.game.scene.getScene(this.worldSceneKey)
      this.hollywoodScene = scene as HollywoodScene | TycoonScene
      this.tycoonScene = this.worldSceneKey === 'tycoon' ? (scene as TycoonScene) : null
      this.hollywoodScene.setReducedMotion(this.reducedMotion)
      this.hollywoodScene.setInputSuspended(this.inputSuspended)
      if (this.pendingSnapshot && this.pendingSnapshot !== this.sceneBootSnapshot) {
        this.hollywoodScene.applySnapshot(this.pendingSnapshot)
      }
      this.sceneBootSnapshot = this.pendingSnapshot
      this.reconcilePendingGateVisitor()
      this.opts.onReady?.()
      return
    }
    if (e.type === 'building') this.opts.onWorldBuilding?.(e.buildingId)
    else if (e.type === 'parcel') this.opts.onWorldParcel?.(e.parcelId)
    else if (e.type === 'build-origin') this.opts.onWorldBuildOrigin?.(e.parcelId, e.origin)
    else if (e.type === 'person') this.opts.onHollywoodPerson?.(e.person)
    else if (e.type === 'place') this.opts.onHollywoodPlace?.(e.place)
    else if (e.type === 'production') this.opts.onHollywoodProduction?.(e.production)
    else if (e.type === 'scenery-load-in') this.opts.onHollywoodSceneryLoadIn?.(e.sceneryLoadIn)
    else if (e.type === 'gate-visitor') this.opts.onHollywoodGateVisitor?.(e.visitor)
    else if (e.type === 'activity') this.opts.onActivity?.(e.text)
  }

  private reconcilePendingGateVisitor(): boolean {
    if (this.hollywoodScene === null) return this.pendingGateVisitor === null
    const accepted = this.hollywoodScene.setGateVisitor(this.pendingGateVisitor)
    // A live scene has independently rejected this provenance against current
    // snapshot/manifest truth. Do not retain it for a later accidental resurrection.
    if (!accepted && this.pendingGateVisitor !== null) this.pendingGateVisitor = null
    return accepted
  }

  private reportHollywoodFailure(reason: HollywoodFailureReason): void {
    if (this.hollywoodFailureReported || this.destroyed || !this.opts.hollywood) return
    this.hollywoodFailureReported = true
    let failedScene = this.hollywoodScene
    if (!failedScene && this.game !== null) {
      try {
        failedScene = this.game.scene.getScene(this.worldSceneKey) as HollywoodScene | TycoonScene
      } catch {
        // A SceneManager boot failure may occur before the scene is registered.
      }
    }
    try {
      failedScene?.failClosedFromHost()
      this.threeScene?.failClosedFromHost()
    } finally {
      this.hollywoodScene = null
      this.tycoonScene = null
      this.threeScene = null
      this.opts.onHollywoodFailure?.(reason)
    }
  }

  private handleEvent(e: LotEvent): void {
    if (e.type === 'ready') {
      if (this.game === null) return
      this.scene = this.game.scene.getScene('lot') as LotScene
      this.scene.setInputSuspended(this.inputSuspended)
      if (this.pendingSnapshot && this.pendingSnapshot !== this.sceneBootSnapshot) {
        this.scene.applySnapshot(this.pendingSnapshot)
      }
      this.sceneBootSnapshot = this.pendingSnapshot
      this.opts.onReady?.()
      return
    }
    if (e.type === 'selected') {
      this.opts.onSelect?.({
        buildingId: e.buildingId,
        label: e.label,
        blurb: e.blurb,
        available: e.available,
        action: e.action,
        production: e.production,
      })
      return
    }
    if (e.type === 'deselected') {
      this.opts.onSelect?.(null)
      return
    }
    if (e.type === 'character') {
      this.opts.onCharacter?.(e.info)
      return
    }
    if (e.type === 'activity') {
      this.opts.onActivity?.(e.text)
      return
    }
    if (e.type === 'action') {
      this.opts.onAction?.({ buildingId: e.buildingId, action: e.action })
    }
  }

  /** Feed the lot a new set of facts. The lot repaints; it computes nothing. */
  setSnapshot(snapshot: StudioLotSnapshot): void {
    this.pendingSnapshot = snapshot
    this.scene?.applySnapshot(snapshot)
    this.hollywoodScene?.applySnapshot(snapshot)
    this.threeScene?.applySnapshot(snapshot)
    if (this.hollywoodScene) this.reconcilePendingGateVisitor()
  }

  /**
   * Retain the latest complete Gate presentation across lazy readiness/recreation.
   * The scene independently checks every field against its latest snapshot.
   */
  setHollywoodGateVisitor(visitor: HollywoodGateVisitorPresentation | null): boolean {
    this.pendingGateVisitor = visitor === null
      ? null
      : {
          ...visitor,
          offerTermWeeks: Array.isArray(visitor.offerTermWeeks)
            ? [...visitor.offerTermWeeks]
            : [],
        }
    return this.hollywoodScene === null
      ? visitor === null
      : this.reconcilePendingGateVisitor()
  }

  /** Programmatically select a building (as if the user clicked it). Emits no event. */
  select(id: BuildingId): void {
    this.scene?.selectFromHost(id)
    this.tycoonScene?.selectFromHost(id)
    this.threeScene?.selectFromHost(id)
  }

  clearSelection(): void {
    this.scene?.clearSelection()
    this.tycoonScene?.clearPlaceSelection()
    this.threeScene?.clearPlaceSelection()
  }

  /** Invoke a building's default navigation action (fires onAction). */
  triggerAction(id: BuildingId): void {
    this.scene?.triggerAction(id)
  }

  resetCamera(): void {
    this.scene?.resetCamera()
    this.hollywoodScene?.resetCamera()
    this.threeScene?.resetCamera()
  }

  /** Move the camera to a named framing (overview / production / wide / entrance / theater). */
  camera(preset: CameraPreset): void {
    this.scene?.applyCameraPreset(preset)
    this.tycoonScene?.applyCameraPreset(preset)
    this.threeScene?.applyCameraPreset(preset)
  }

  /** Presentation-only quarter turns for inspecting service faces in real 3D. */
  rotateCamera(direction: -1 | 1): void {
    this.threeScene?.rotateCameraQuarter(direction)
  }

  /**
   * D1-B review tooling: hide the in-canvas cues that name a stage. Default OFF and only
   * ever called by the host behind the soundstage proof gate.
   */
  setSignageMasked(on: boolean): void {
    this.scene?.setSignageMasked(on)
  }

  /**
   * Pause the whole renderer when the lot is hidden (React unmount-to-background,
   * tab hidden). Stops the RAF loop entirely so a backgrounded lot costs no CPU,
   * and freezes the scene + ambient scheduler. Idempotent.
   */
  pause(): void {
    if (this.threeScene !== null) {
      this.threeScene.pause()
      return
    }
    if (this.game === null) return
    this.pauseVignettes(true)
    if (this.game.scene.isActive('lot')) this.game.scene.pause('lot')
    if (this.game.scene.isActive(this.worldSceneKey)) this.game.scene.pause(this.worldSceneKey)
    this.game.loop.sleep()
  }

  /** Resume after `pause()` — wake the RAF loop, unfreeze the scene + ambient. */
  resume(): void {
    if (this.threeScene !== null) {
      this.threeScene.resume()
      this.threeScene.setInputSuspended(this.inputSuspended)
      if (this.pendingSnapshot) this.threeScene.applySnapshot(this.pendingSnapshot)
      return
    }
    if (this.game === null) return
    this.game.loop.wake()
    if (this.game.scene.isPaused('lot')) this.game.scene.resume('lot')
    // A failed Hollywood generation may still be registered by Phaser, but its
    // host seam is deliberately null. Never reactivate that hidden/inert orphan.
    if (this.hollywoodScene && this.game.scene.isPaused(this.worldSceneKey)) {
      this.game.scene.resume(this.worldSceneKey)
    }
    // Scene visibility and modal input are independent. Reasserting the retained
    // input state prevents a Phaser lifecycle resume from reviving controls behind
    // an overlay while leaving the renderer itself free to wake normally.
    this.scene?.setInputSuspended(this.inputSuspended)
    this.hollywoodScene?.setInputSuspended(this.inputSuspended)
    if (this.hollywoodScene && this.pendingSnapshot) {
      this.hollywoodScene.applySnapshot(this.pendingSnapshot)
      this.reconcilePendingGateVisitor()
    }
    this.hollywoodScene?.resetPerformanceTelemetry()
    this.pauseVignettes(false)
  }

  /** Debug/testing: force a vignette (optionally jumped to a phase). */
  forceVignette(kind: MomentKind, phase?: string): boolean {
    return this.scene?.forceVignette(kind, phase) ?? false
  }

  /** Pause the automatic vignette scheduler (also used by reduced-motion). */
  pauseVignettes(p: boolean): void {
    this.scene?.setDirectorPaused(p)
  }

  /** Reduced-motion mode — freeze non-essential ambient motion; readability intact. */
  setReducedMotion(on: boolean): void {
    this.reducedMotion = on
    this.scene?.setReducedMotion(on)
    this.hollywoodScene?.setReducedMotion(on)
    this.threeScene?.setReducedMotion(on)
  }

  /**
   * Suspend only world input while a modal owns interaction. The scene remains
   * mounted and animated; the retained value is applied after lazy readiness and
   * after `recreate()` builds a replacement scene.
   */
  setInputSuspended(on: boolean): void {
    this.inputSuspended = on
    this.scene?.setInputSuspended(on)
    this.hollywoodScene?.setInputSuspended(on)
    this.threeScene?.setInputSuspended(on)
  }

  /** D1-A review: switch the studio-identity mode (baseline | concept-a | fallback). */
  setIdentityMode(mode: IdentityMode): void {
    this.scene?.setIdentityMode(mode)
  }

  /** Debug/testing: screen position of the first visible inspectable character. */
  firstInspectableScreen(): { x: number; y: number; role: string } | null {
    return this.scene?.firstInspectableScreen() ?? null
  }

  /** Debug/testing: seek the active vignette to an absolute time (frame sequences). */
  seekVignette(t: number): void {
    this.scene?.seekVignette(t)
  }

  /** Introspection for tests/verification (selection, active tags, object count). */
  getDebugState(): ReturnType<LotScene['debugState']> | null {
    return this.scene?.debugState() ?? null
  }

  /** D1-A review: identity + coarse runtime stats for the dev performance panel. */
  identityDebug(): ReturnType<LotScene['identityDebug']> | null {
    return this.scene?.identityDebug() ?? null
  }

  /** Tear down and rebuild the game from scratch (leak/teardown check). */
  recreate(): void {
    this.scene = null
    this.hollywoodScene = null
    this.tycoonScene = null
    this.threeScene?.destroy()
    this.threeScene = null
    this.game?.destroy(true)
    this.hollywoodFailureReported = false
    if (this.useThree) {
      this.game = null
      void this.bootThree()
    } else {
      this.game = this.boot()
    }
  }

  destroy(): void {
    this.destroyed = true
    this.scene = null
    this.hollywoodScene = null
    this.tycoonScene = null
    this.threeScene?.destroy()
    this.threeScene = null
    this.game?.destroy(true)
  }

  selectHollywoodPerson(id: string): void { this.hollywoodScene?.selectPerson(id) }
  selectHollywoodProduction(id: string): boolean {
    return this.hollywoodScene?.selectProductionFromHost(id) ?? false
  }
  /** Emphasize one exact complete company independently of physical Stage 7 selection. */
  selectHollywoodProductionCompany(id: string): boolean {
    return this.hollywoodScene?.selectProductionCompanyFromHost(id) ?? false
  }
  /** Clear only presentation company focus; physical place and person state stay intact. */
  clearHollywoodProductionCompanySelection(): void {
    this.hollywoodScene?.clearProductionCompanySelection()
  }
  /** Paint exact Scenery & Service work from the host without re-emitting a scene event. */
  selectHollywoodSceneryLoadIn(id: string): boolean {
    return this.hollywoodScene?.selectSceneryLoadInFromHost(id) ?? false
  }
  /** Paint the exact canonical Annex place from the host without emitting a scene event. */
  selectHollywoodAnnexPlace(): boolean {
    return this.hollywoodScene?.selectAnnexFromHost() ?? false
  }
  /** Select exact Administration & Publicity and report physical availability. */
  selectHollywoodPublicityPlace(): boolean {
    return this.hollywoodScene?.selectPublicityFromHost() ?? false
  }
  /** Paint the exact canonical Studio Gate without re-emitting a scene event. */
  selectHollywoodGatePlace(): boolean {
    return this.hollywoodScene?.selectGateFromHost() ?? false
  }
  /** Focus only the exact canonical Studio Gate and report physical availability. */
  focusHollywoodGate(): boolean {
    return this.hollywoodScene?.focusGateFromHost() ?? false
  }
  /**
   * What the WORLD is currently holding selected, or null when no scene is live.
   *
   * The host's repaint reconciliation reads this before re-asserting a selection: an
   * effect that exists to RESTORE a selection the renderer lost has nothing to do when
   * the renderer still holds it. Read from the scene every time — the host must never
   * keep its own copy of what the renderer is showing, which is the stale-identity trap
   * this seam exists to avoid.
   */
  worldSelection(): { placeId: string | null; productionId: string | null; personId: string | null } | null {
    return this.hollywoodScene?.currentSelection() ?? null
  }

  clearHollywoodPersonSelection(): void { this.hollywoodScene?.clearPersonSelection() }
  clearHollywoodPlaceSelection(): void { this.hollywoodScene?.clearPlaceSelection() }

  showHollywoodPublicity(success: boolean, detail: string): void {
    this.hollywoodScene?.playPublicity(success, detail)
  }

  focusHollywoodPlace(id: string): void { this.hollywoodScene?.focus(id) }

  /** Pan to one snapshot-owned building at the player's current zoom. */
  focusBuilding(buildingId: BuildingId): boolean {
    return this.tycoonScene?.focusBuilding(buildingId) ?? this.threeScene?.focusBuilding(buildingId) ?? false
  }

  /** Reward close inspection in real 3D; older renderers retain their production framing. */
  frameBuilding(buildingId: BuildingId, relativeScale = 3.15, yaw?: number): boolean {
    if (this.threeScene !== null) {
      return yaw === undefined
        ? this.threeScene.frameBuilding(buildingId, relativeScale)
        : this.threeScene.frameBuilding(buildingId, relativeScale, yaw)
    }
    this.camera('production')
    return this.tycoonScene?.focusBuilding(buildingId) ?? false
  }

  /** Reward close inspection of one snapshot-owned mounted scenery kit. */
  frameMountedSet(buildingId: BuildingId, relativeScale = 4.05): boolean {
    return this.threeScene?.frameMountedSet(buildingId, relativeScale) ?? false
  }

  hollywoodPerformance(): HollywoodPerformance | null {
    return this.hollywoodScene?.performanceStats() ?? this.threeScene?.performanceStats() ?? null
  }

  /** Evidence-only: begin a fresh sustained Hollywood frame window at a known UI boundary. */
  resetHollywoodPerformance(): void {
    this.hollywoodScene?.resetPerformanceTelemetry()
    this.threeScene?.resetPerformanceTelemetry()
  }

  /** Debug/evidence seam: exact snapshot-derived Hollywood state, no GameState access. */
  hollywoodDebugState(): ReturnType<HollywoodScene['debugState']> | null {
    return this.hollywoodScene?.debugState() ?? null
  }

  // ── Build Mode V1 ──────────────────────────────────────────────────────────
  // Grid-world only. The painted plate has no parcel substrate, so every command
  // below is a no-op there and reports it, exactly as `camera()` already does.

  /** Paint a parcel from the host without emitting a scene event. */
  selectWorldParcel(parcelId: string): boolean {
    return this.tycoonScene?.selectParcelFromHost(parcelId) ?? false
  }

  clearWorldParcelSelection(): void {
    this.tycoonScene?.clearParcelSelection()
  }

  focusWorldParcel(parcelId: string): boolean {
    return this.tycoonScene?.focusParcel(parcelId) ?? false
  }

  /** Enter/leave the bounded in-world build flow. */
  setWorldBuildMode(mode: TycoonBuildMode | null): void {
    this.tycoonScene?.setBuildMode(mode)
  }

  /** Hand the world the current ghost. Nothing here enters simulation state. */
  setWorldPlacementPreview(preview: TycoonPlacementPreview | null): void {
    this.tycoonScene?.setPlacementPreview(preview)
  }

  // ── Guidance World Marker V1 (M-D) ─────────────────────────────────────────

  /**
   * Name the ONE building the picture's next step points at, or `null` for none.
   *
   * Presentation state, handed down exactly like the build ghost: the host decides it
   * from the engine's own journey projection, the world only paints it, and nothing here
   * enters simulation state or completes any work. Returns whether a marker is actually
   * standing on the property (the world declines a building that already carries the red
   * decision badge, and the painted plate has no property to mark at all).
   */
  setWorldGuidanceTarget(buildingId: BuildingId | null): boolean {
    return this.tycoonScene?.setGuidanceTarget?.(buildingId) ?? this.threeScene?.setGuidanceTarget(buildingId) ?? false
  }

  // ── Presence on the Lot V1 ─────────────────────────────────────────────────
  // Grid-world only. The painted plate has no property to walk across, so both
  // commands are no-ops there and report it, exactly as the build seams already do.

  /**
   * Play ONE week's beat timeline in the world. `week` is the week the host believes
   * the world is now showing; the scene refuses if that is not the week its own
   * projection describes, so a stale intent can never replay an old commute.
   *
   * Returns true only when a playback actually began (false under reduced motion, on
   * the plate, and whenever the world simply shows the settled week instead).
   */
  playPresenceWeek(week: number): boolean {
    return this.tycoonScene?.playPresenceWeek(week) ?? this.threeScene?.playPresenceWeek(week) ?? false
  }

  /**
   * Living Turn V1 (§4.1): set the pace the witnessed week plays at. Presentation
   * only — it scales the beat clock and is read by nothing that decides anything.
   */
  setPlaybackSpeed(speed: number): boolean {
    return this.tycoonScene?.setPlaybackSpeed(speed) ?? this.threeScene?.setPlaybackSpeed(speed) ?? false
  }

  /** Abandon a running playback and settle on the week's own truth. Idempotent. */
  skipPresencePlayback(): boolean {
    return this.tycoonScene?.skipPresencePlayback() ?? this.threeScene?.skipPresencePlayback() ?? false
  }

  /** Evidence seam: the live camera's grid → screen transform (browser suite). */
  worldProjection(): ReturnType<TycoonScene['worldProjection']> | null {
    return this.tycoonScene?.worldProjection() ?? null
  }

  /** Evidence seam: where a named cell's centre lands, as a fraction of the canvas. */
  worldCellFraction(gx: number, gy: number): { fx: number; fy: number } | null {
    return this.tycoonScene?.cellViewportFraction(gx, gy) ?? null
  }

  /** Evidence seam: where an EXACT grid point lands — a person stands on a fraction. */
  worldPointFraction(gx: number, gy: number): { fx: number; fy: number } | null {
    return this.tycoonScene?.gridPointViewportFraction(gx, gy) ?? null
  }

  /** Debug/evidence seam for the grid world specifically. */
  tycoonDebugState(): ReturnType<TycoonScene['debugState']> | null {
    return this.tycoonScene?.debugState() ?? null
  }
}
