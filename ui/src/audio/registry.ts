// ── Era music registry (PF1-M1) ──────────────────────────────────────────────
//
// DATA, not logic: era key → the tracks that era plays. When C4's decade march
// arrives, a new decade is a new row here and nothing else — no call site, no
// service change, no component change.
//
// The 2005 original recorded four separately performed era ensembles; the
// decade→ensemble mapping is absent from the corpus, so this registry adopts the
// four-bucket ARCHITECTURE as precedent and authors its own mapping as an original
// decision (charter §4). PF1 authors exactly one row, because the game is at 1948.

/** Era key (the year the studio's world reports) → its track list, in play order. */
export type EraMusicRegistry = Record<string, readonly string[]>

/**
 * The committed registry. Keys are year strings; a key is a decade anchor, not a
 * requirement that the world be in that exact year.
 */
export const ERA_MUSIC: EraMusicRegistry = {
  '1948': ['music-1948.m4a'],
}

function numericKey(key: string): number | null {
  if (!/^-?\d+$/.test(key.trim())) return null
  const value = Number(key.trim())
  return Number.isFinite(value) ? value : null
}

/**
 * The tracks an era plays: exact row, else the nearest EARLIER anchor, else the
 * first row in the registry.
 *
 * Total by construction. An unknown, future, malformed or empty era key still gets
 * music, because silence-by-accident is indistinguishable from a broken build. It
 * returns an empty list only if the registry itself is empty.
 */
export function musicTracksForEra(eraKey: string): readonly string[] {
  const exact = Object.prototype.hasOwnProperty.call(ERA_MUSIC, eraKey)
    ? ERA_MUSIC[eraKey]
    : undefined
  if (exact !== undefined) return exact

  const wanted = numericKey(eraKey)
  if (wanted !== null) {
    let bestKey: number | null = null
    let bestTracks: readonly string[] | undefined
    for (const [key, tracks] of Object.entries(ERA_MUSIC)) {
      const value = numericKey(key)
      if (value === null || value > wanted) continue
      if (bestKey === null || value > bestKey) {
        bestKey = value
        bestTracks = tracks
      }
    }
    if (bestTracks !== undefined) return bestTracks
  }

  // Nothing earlier exists (or the key is not a year at all): the registry's first
  // row is the studio's oldest music, which is the honest answer for "before 1948".
  const first = Object.values(ERA_MUSIC)[0]
  return first ?? []
}
