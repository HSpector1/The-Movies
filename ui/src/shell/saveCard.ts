// ── The human save card (PF1-M3) ─────────────────────────────────────────────
//
// The save surface used to lead with the serialized envelope. This derives the five facts
// a player actually recognises their studio by, FROM LIVE STATE ONLY — no envelope field is
// read, no metadata is added to the save file, and the engine save layer is untouched. A
// card that read the JSON would be a second, weaker parser of the format; a card that
// carried its own persisted fields would be a schema change wearing a costume.
//
// `studioName` is the product brand because no per-studio name exists in GameState. Naming
// it here rather than in the view keeps the honest answer in one place, so the day a studio
// earns its own name this is the only line that changes.

import { STUDIO_LOT_BRAND } from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'

export type SaveCard = {
  studioName: string
  seed: string
  week: number
  cash: number
  filmsReleased: number
}

export function deriveSaveCard(state: GameState): SaveCard {
  return {
    studioName: STUDIO_LOT_BRAND,
    seed: state.seed,
    week: state.market.tick,
    cash: state.studio.cash,
    filmsReleased: state.studio.releasedFilms.length,
  }
}
