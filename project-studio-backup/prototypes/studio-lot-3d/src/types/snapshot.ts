// ── Fixture presentation contract ─────────────────────────────────────────────
// PROVENANCE: the shape of StudioLotSnapshot is adapted (trimmed) from the 2.5D
// lot's presentation contract in `studio-lot-spike` @ commit 3806ef6
// (src/snapshot/StudioLotSnapshot.ts). It is copied here as a small,
// presentation-only TypeScript interface per the execution authorization (§3).
// This spike owns NO simulation truth — it reads a fixture snapshot and paints.

export type BuildingId =
  | 'gate'
  | 'admin'
  | 'stage-a'
  | 'theater'
  | 'writers'
  | 'casting'
  | 'backlot'

export type StandingBand = 'struggling' | 'finding-footing' | 'established' | 'prestige'

export type ProductionCard = {
  id: string
  title: string
  genre: string
  stageId: 'stage-a'
  progress01: number
  weeksRemaining: number
  active: boolean
}

export type BuildingState = {
  id: BuildingId
  available: boolean
}

export type StudioLotSnapshot = {
  studioName: string
  standing: StandingBand
  activeProductions: ProductionCard[]
  buildings: BuildingState[]
  /** deterministic cosmetic seed — all variation derives from this. No Math.random. */
  sceneSeed: string
}

/** Presentation-only character descriptor surfaced on inspection (fixture only). */
export type CharacterInfo = {
  id: string
  role: string
  activity: string
  production?: string
  building?: string
}
