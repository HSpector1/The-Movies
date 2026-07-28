// ── Three.js implementation of the renderer-neutral interface ─────────────────
import { createRoot, type Root } from 'react-dom/client'
import { SceneApp } from '../app/SceneApp'
import {
  state,
  setIntentSink,
  setSnapshot,
  selectBuilding,
  setCameraPreset,
  returnToOverview,
} from '../app/store'
import type { StudioLotRenderer, StudioLotRendererOptions } from './StudioLotRenderer'
import type { BuildingId } from '../types/snapshot'
import { disposeMaterials } from '../env/materials'

export class ThreeStudioLotRenderer implements StudioLotRenderer {
  private root: Root | null = null

  constructor(opts: StudioLotRendererOptions) {
    setIntentSink(opts.onIntent)
    state.dev = !!opts.dev
    setSnapshot(opts.snapshot)
  }

  mount(container: HTMLElement): void {
    this.root = createRoot(container)
    this.root.render(<SceneApp />)
  }

  setSnapshot(snapshot: StudioLotRendererOptions['snapshot']): void {
    setSnapshot(snapshot)
  }

  focusBuilding(buildingId: BuildingId): void {
    selectBuilding(buildingId)
  }

  focusCharacter(_characterId: string): void {
    // character selection is pointer-driven; "focus" frames the human-scale view
    setCameraPreset('human')
  }

  returnToOverview(): void {
    returnToOverview()
  }

  destroy(): void {
    this.root?.unmount()
    this.root = null
    // free the shared Meridian material cache so destroy()/re-mount doesn't leak GPU
    // programs (the cache is module-level and lazily rebuilt via mat() on re-mount).
    disposeMaterials()
  }
}
