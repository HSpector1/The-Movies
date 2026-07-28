// ── Renderer-neutral presentation boundary ────────────────────────────────────
// The host mounts a renderer, feeds it snapshots, and receives intent events.
// The renderer NEVER owns simulation truth (cash, standing, outcomes, saves).
// This interface matches the one the 2.5D lot already satisfies, so the same
// StudioLotSnapshot can drive either a Phaser (2.5D) or a Three (3D) view — the
// hybrid architecture the experiment is validating.

import type { StudioLotSnapshot, BuildingId, CharacterInfo } from '../types/snapshot'

export type LotIntent =
  | { type: 'ready' }
  | { type: 'building-selected'; info: { id: BuildingId; label: string; available: boolean } | null }
  | { type: 'character-selected'; info: CharacterInfo | null }
  | { type: 'building-action'; id: BuildingId; action: string }
  | { type: 'return-to-overview' }

export interface StudioLotRenderer {
  mount(container: HTMLElement): void
  setSnapshot(snapshot: StudioLotSnapshot): void
  focusBuilding(buildingId: BuildingId): void
  focusCharacter(characterId: string): void
  returnToOverview(): void
  destroy(): void
}

export type StudioLotRendererOptions = {
  snapshot: StudioLotSnapshot
  onIntent?: (e: LotIntent) => void
  /** dev-only controls + debug hooks (never in an owner-facing build) */
  dev?: boolean
}
