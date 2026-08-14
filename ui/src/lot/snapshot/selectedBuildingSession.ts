// ── Studio Lot selected-building session memory (presentation only) ───────────
//
// The selected building must outlive a StudioLotScreen mount so a bounded deep
// management route can return to the same physical source. It is not Engine truth,
// GameState, save data, URL state, or renderer state. Its lifetime is the loaded
// studio: App resets it only when an authoritative studio is replaced.
//
// This module deliberately imports only a type. App can eagerly reset the tiny
// presentation session without fetching StudioLotScreen, StudioLotView, or Phaser.

import type { BuildingId } from './StudioLotSnapshot.ts'

let selectedBuilding: BuildingId | null = null

/** Read the building selected in the current loaded studio's Lot session. */
export function getLotSelectedBuilding(): BuildingId | null {
  return selectedBuilding
}

/** Remember an exact building identity, or clear the current building selection. */
export function setLotSelectedBuilding(buildingId: BuildingId | null): void {
  selectedBuilding = buildingId
}

/** End the selected-building presentation lifetime at a real studio replacement. */
export function resetLotSelectedBuilding(): void {
  selectedBuilding = null
}
