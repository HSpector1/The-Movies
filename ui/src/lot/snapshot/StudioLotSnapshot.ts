// ── StudioLotSnapshot — the ONE boundary this spike is allowed to touch ───────
//
// This is a NARROW, framework-neutral bag of presentation-ready facts. It is the
// only shape the visual lot ever consumes. It is deliberately NOT the GameState:
//
//   • It contains no formulas, no talent objects, no concept space, no forces,
//     no forecasts, no RNG state, no actions.
//   • Every field is a display fact the lot can paint directly — a band, a label,
//     a fraction, a boolean. No number here needs the simulation to interpret it.
//
// At integration time (after Phase 5) the host application translates the real,
// validated GameState into this snapshot at the application boundary. The lot
// never sees GameState and never re-implements a single simulation rule.
//
// See ./fromGameState.ts for a worked (types-only) translation demonstrating that
// the real GameState satisfies this boundary without any coupling.

/** The nine addressable places on the lot. Stable ids the host can key on. */
export type BuildingId =
  | 'admin' // studio administration
  | 'writers' // writers' building
  | 'casting' // casting office
  | 'stage-a' // soundstage 1
  | 'stage-b' // soundstage 2
  | 'post' // post-production
  | 'theater' // screening theater
  | 'gate' // studio entrance / gate
  | 'expansion' // open pad suggesting future growth

/**
 * Navigation intents a building emits to the host. These are requests to open a
 * screen — the lot does NOT know what the screen is or contains. Phase 5 wires
 * these to real screens; the spike wires them to prototype panels.
 */
export type LotActionKind =
  | 'open-studio-overview'
  | 'assemble-film'
  | 'browse-talent'
  | 'review-productions'
  | 'view-released-films'
  | 'view-expansion'

/** Coarse studio standing — a display band, not a simulation threshold. */
export type StandingBand = 'struggling' | 'finding-footing' | 'established' | 'prestige'

/** Coarse cash position — a display band, not an accounting value. */
export type CashBand = 'in-the-red' | 'tight' | 'stable' | 'flush'

/** One film currently shooting on a stage. */
export type ProductionCard = {
  id: string
  title: string
  genre: string // display label only (e.g. "Crime"), not the sim Genre union
  stageId: 'stage-a' | 'stage-b'
  /** Fraction complete, 0..1. Presentation only — how full the progress bar is. */
  progress01: number
  /** Whole weeks left, for the label "N weeks left". */
  weeksRemaining: number
  /** Is the stage lit and working this week (vs. paused/idle)? */
  active: boolean
}

/** Coarse reception band for a released film — a display badge, not a score. */
export type ReceptionBand = 'flop' | 'mixed' | 'hit' | 'smash'

/** One recently released film, for the marquee / theater. */
export type ReleasedCard = {
  id: string
  title: string
  reception: ReceptionBand
  /** Weeks since release, for recency ordering / "N weeks ago". */
  weeksAgo: number
}

/** Per-building availability + look hints the lot paints. */
export type BuildingState = {
  id: BuildingId
  /** Is this place open/usable this snapshot? Closed buildings read as dimmed. */
  available: boolean
  /** Struggling look: plainer dressing, no banners, muted signage. */
  underDressed?: boolean
}

/**
 * The complete set of facts the visual lot renders. Fixture data may populate it
 * for the spike; the host populates it from GameState later. Nothing here is a
 * rule — change a field and the lot simply repaints.
 */
export type StudioLotSnapshot = {
  /** Studio name for the gate sign / top bar. */
  studioName: string
  /** Current in-world week, for the top bar. */
  week: number
  standing: StandingBand
  cashBand: CashBand
  /** Films shooting now — drives which stages are lit and their progress. */
  activeProductions: ProductionCard[]
  /** Recent releases — drives the theater marquee. */
  releasedFilms: ReleasedCard[]
  /** Availability + dressing per building. */
  buildings: BuildingState[]
  /** Host-provided initial selection, or null. The view also tracks live clicks. */
  selectedBuildingId: BuildingId | null
  /**
   * Explicit cosmetic seed. ALL ambient variation (worker start positions, prop
   * jitter, light phases) derives from this string. No Math.random anywhere.
   */
  sceneSeed: string
}

/** Every building id, in a stable order — used for defaults and iteration. */
export const ALL_BUILDING_IDS: readonly BuildingId[] = [
  'admin',
  'writers',
  'casting',
  'stage-a',
  'stage-b',
  'post',
  'theater',
  'gate',
  'expansion',
] as const

/** Which navigation intent a building emits when its action is taken. */
export const BUILDING_ACTION: Record<BuildingId, LotActionKind> = {
  admin: 'open-studio-overview',
  writers: 'assemble-film',
  casting: 'browse-talent',
  'stage-a': 'review-productions',
  'stage-b': 'review-productions',
  post: 'review-productions',
  theater: 'view-released-films',
  gate: 'open-studio-overview',
  expansion: 'view-expansion',
}
