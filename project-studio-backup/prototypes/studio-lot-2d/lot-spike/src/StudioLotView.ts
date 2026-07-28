// ── StudioLotView — the public, embeddable integration surface ────────────────
//
// This is the whole boundary the host application touches:
//
//     StudioLotSnapshot  →  new StudioLotView(...)  →  onAction / onSelect events
//
// The host constructs a view with a snapshot and a couple of callbacks, then feeds
// it new snapshots over time. It never touches Phaser, the scene, or any drawing.
// Buildings clicked in the lot surface here as `onSelect`; navigation intents
// surface as `onAction`. That is the entire contract.

import Phaser from 'phaser'
import { LotScene, type LotEvent, type CameraPreset, type CharacterInfo } from './lot/LotScene'
import type { MomentKind } from './lot/vignettes'
import type { StudioLotSnapshot, BuildingId, LotActionKind, ProductionCard } from './snapshot/StudioLotSnapshot'

export type { CameraPreset, CharacterInfo, MomentKind }

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
  /** The lot finished first paint. */
  onReady?: () => void
}

export class StudioLotView {
  private game: Phaser.Game
  private scene: LotScene | null = null
  private pendingSnapshot: StudioLotSnapshot | null = null
  private readonly opts: StudioLotViewOptions

  constructor(opts: StudioLotViewOptions) {
    this.opts = opts
    this.pendingSnapshot = opts.snapshot
    this.game = this.boot()
  }

  private boot(): Phaser.Game {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this.opts.parent,
      // Transparent so the golden-hour CSS gradient on the mount element reads as
      // sky/atmosphere around the lot rather than a flat fill.
      transparent: true,
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
      render: { antialias: true, roundPixels: false, powerPreference: 'low-power' },
      scene: [],
    })
    game.events.once('ready', () => {
      game.scene.add('lot', LotScene, true, {
        snapshot: this.pendingSnapshot ?? this.opts.snapshot,
        onEvent: (e: LotEvent) => this.handleEvent(e),
      })
    })
    return game
  }

  private handleEvent(e: LotEvent): void {
    if (e.type === 'ready') {
      this.scene = this.game.scene.getScene('lot') as LotScene
      if (this.pendingSnapshot && this.pendingSnapshot !== this.opts.snapshot) {
        this.scene.applySnapshot(this.pendingSnapshot)
      }
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
  }

  /** Programmatically select a building (as if the user clicked it). */
  select(id: BuildingId): void {
    this.scene?.selectFromHost(id)
  }

  clearSelection(): void {
    this.scene?.clearSelection()
  }

  /** Invoke a building's default navigation action (fires onAction). */
  triggerAction(id: BuildingId): void {
    this.scene?.triggerAction(id)
  }

  resetCamera(): void {
    this.scene?.resetCamera()
  }

  /** Move the camera to a named framing (overview / production / wide). */
  camera(preset: CameraPreset): void {
    this.scene?.applyCameraPreset(preset)
  }

  /** Debug/testing: force a vignette (optionally jumped to a phase). */
  forceVignette(kind: MomentKind, phase?: string): boolean {
    return this.scene?.forceVignette(kind, phase) ?? false
  }

  /** Debug/testing: pause the automatic vignette scheduler. */
  pauseVignettes(p: boolean): void {
    this.scene?.setDirectorPaused(p)
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
  getDebugState(): { selected: BuildingId | null; activeTags: number; displayObjects: number } | null {
    return this.scene?.debugState() ?? null
  }

  /** Tear down and rebuild the game from scratch (leak/teardown check). */
  recreate(): void {
    this.scene = null
    this.game.destroy(true)
    this.game = this.boot()
  }

  destroy(): void {
    this.game.destroy(true)
  }
}
