// ── StudioLotSnapshot — the ONE boundary the visual lot is allowed to touch ────
//
// A NARROW, framework-neutral bag of presentation-ready facts. It is the only shape
// the visual lot ever consumes. It is deliberately NOT the GameState:
//
//   • It contains no formulas, no talent objects, no concept space, no forces,
//     no forecasts, no RNG state, no actions, no money maths.
//   • Every field is a display fact the lot can paint directly — a band, a label,
//     a fraction, a boolean. No number here needs the simulation to interpret it.
//
// The authoritative selector `studioLotSnapshot(state)` in ui/src/engine/adapter.ts
// translates the real, validated D-12 GameState into this snapshot at the engine
// boundary. The lot never sees GameState and never re-implements a simulation rule.
//
// This file imports nothing — it is a pure leaf type module, so both the adapter
// (engine boundary) and the Phaser view can depend on it without any coupling and
// without pulling Phaser into the eager bundle.

/** The nine addressable places on the lot. Stable ids the host can key on. */
export type BuildingId =
  | 'admin' // studio administration
  | 'writers' // development
  | 'casting' // casting / talent
  | 'stage-a' // soundstage A
  | 'stage-b' // soundstage B
  | 'post' // production / post
  | 'theater' // screening theater
  | 'gate' // studio entrance / gate
  | 'expansion' // open pad suggesting future growth

/**
 * Navigation intents a building emits to the host. These are requests to open a
 * screen — the lot does NOT know what the screen is or contains. The React host
 * (see ../navigation.ts) translates each intent into an existing app route.
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

/**
 * Canonical per-destination attention semantics (Gate D1 addendum §7). Every state
 * is paired in the UI with text + an icon/shape as well as colour — never colour
 * alone. In D1 the authoritative selector emits only states it can ground in real
 * engine truth: `warning` (financial pressure), `empty` (a vacant stage), `active`
 * (a lit stage / in-flight production), `positive`/`recently-completed` (a release),
 * `future` (the expansion pad) and `normal`. `decision-required` is part of the
 * contract for D2 readiness — the renderer and companion nav support it — but the
 * D1 selector never manufactures it, because phases 1–4 expose no per-production
 * decision. See the selector for the exact provenance of each value.
 */
export type AttentionState =
  | 'normal'
  | 'active'
  | 'positive'
  | 'warning'
  | 'decision-required'
  | 'empty'
  | 'future'
  | 'recently-completed'

/**
 * Canonical stage lifecycle labels (addendum §6). Only labels grounded in current
 * engine truth may be emitted. In D1 an occupied stage is always `filming` (a
 * production is an 8-week fire-and-forget timer that auto-releases); `available`
 * is represented by the ABSENCE of a card for that stage. `ready-for-release`,
 * `completed`, `decision-required` and `idle` are reserved for D2 — the renderer
 * supports them, the D1 selector does not emit them.
 */
export type StageState =
  | 'available'
  | 'filming'
  | 'decision-required'
  | 'ready-for-release'
  | 'completed'
  | 'idle'

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
  /** Canonical lifecycle label. D1: always 'filming'. */
  stageState?: StageState
  /** One concise attention reason, when the stage needs the player. D1: usually absent. */
  attentionReason?: string
}

/** Coarse reception band for a released film — a display badge, not a score. */
export type ReceptionBand = 'flop' | 'mixed' | 'hit' | 'smash'

/** One recently released film, for the marquee / theater. */
export type ReleasedCard = {
  id: string
  title: string
  /** Critical reception band derived from the authoritative criticScore — NOT box office. */
  reception: ReceptionBand
  /** Weeks since release, for recency ordering / "N weeks ago". */
  weeksAgo: number
}

/** A named person the Hollywood district can stage without exposing a core Talent object. */
export type LotPersonState = {
  id: string
  name: string
  role: 'director' | 'talent'
  /** Whether the person is attached to an authoritative active production or merely on the roster. */
  authority: 'active-production' | 'studio-roster' | 'district-managed'
  productionId: string | null
  productionTitle: string | null
}

/** The production workflow facts the lot may render without seeing GameState. */
export type LotProductionPhase =
  | 'legacy'
  | 'development'
  | 'preProduction'
  | 'rehearsal'
  | 'shooting'
  | 'postProduction'
  | 'releaseReady'

export type LotShootingTaskStatus =
  | 'unassigned'
  | 'blocked'
  | 'ready'
  | 'scheduled'
  | 'completed'

/** A legal, engine-owned operation the host can dispatch for this production. */
export type LotProductionCommand =
  | {
      kind: 'assignShootingDirector'
      productionId: string
      directorId: string
      label: string
    }
  | { kind: 'clearSceneryLoadIn'; productionId: string; label: string }
  | { kind: 'scheduleShootingTake'; productionId: string; label: string }

/**
 * One narrow production-operations projection. `locationBuildingId` is already
 * resolved at the adapter boundary from the authoritative phase/reservation; the
 * lot must never infer a location from array order.
 */
export type ProductionOperationsState = {
  productionId: string
  title: string
  phase: LotProductionPhase
  phaseLabel: string
  /** Authoritative production countdown, projected without asking the lot to infer time. */
  weeksRemaining: number
  /** Authoritative normalized cycle progress for presentation only. */
  progress01: number
  locationBuildingId: BuildingId
  facilityLabel: string
  directorId: string
  directorName: string
  /** Exact Lead actor identity for person-to-picture inspection. Older fixtures may omit it. */
  leadId?: string
  leadName?: string
  taskStatus: LotShootingTaskStatus | null
  statusLabel: string
  blocker: {
    kind: 'facility-capacity' | 'director-dispatch' | 'scenery-load-in' | 'take-scheduling'
    headline: string
    detail: string
  } | null
  attention: AttentionState
  currentCommand: LotProductionCommand | null
}

/** Coarse theater presence (addendum §1). No payment counts, no revenue — presence only. */
export type ReleasePresence = 'none' | 'released' | 'now-showing'

/** Per-building availability + attention + look hints the lot paints. */
export type BuildingState = {
  id: BuildingId
  /** Is this place open/usable this snapshot? Closed buildings read as dimmed. */
  available: boolean
  /** Struggling look: plainer dressing, no banners, muted signage. */
  underDressed?: boolean
  /** Canonical attention state (addendum §7). Absent ⇒ treat as 'normal'. */
  attention?: AttentionState
  /** One concise reason string when attention warrants it (e.g. "Runway 3 weeks"). */
  attentionReason?: string
  /** Expansion-only authoritative physical lifecycle; absent on every other place. */
  constructionStatus?: 'legacy' | 'vacant' | 'building' | 'operational'
  /** Expansion-only, presentation-ready fraction. Core owns the integer clock. */
  constructionProgress01?: number
  /** Expansion-only DOM/canvas-equivalent progress or completion text. */
  constructionProgressText?: string
}

/**
 * The complete set of facts the visual lot renders. The adapter selector populates
 * it from GameState. Nothing here is a rule — change a field and the lot repaints.
 */
type StudioLotSnapshotBase = {
  /** Studio identity for the gate sign / top bar (product brand — no per-studio name exists in D1). */
  studioName: string
  /** Current in-world week (== market.tick). */
  week: number
  /** Authoritative current cash (studio.cash), for the Administration readout. */
  cash: number
  /** Coarse cash-status band derived from cash + runway (see LOT_CASH_BAND_THRESHOLDS). */
  cashBand: CashBand
  /** Coarse standing band derived from the three standing channels. */
  standing: StandingBand
  /** Authoritative 0..100 standing channels for the three meters. */
  standingValues: { awareness: number; prestige: number; confidence: number }
  /** Films shooting now — drives which stages are lit and their progress. */
  activeProductions: ProductionCard[]
  /** Recent releases — drives the theater marquee. */
  releasedFilms: ReleasedCard[]
  /** Coarse theater presence (none / released / now-showing). */
  releasePresence: ReleasePresence
  /** Latest relevant release title for the marquee, or null. */
  latestReleaseTitle: string | null
  /** Presentation-ready named people, projected from real engine talent/production identity. */
  people: LotPersonState[]
  /** Availability + attention + dressing per building (all nine present). */
  buildings: BuildingState[]
  /** Host-provided selection (UI session state — never GameState), or null. */
  selectedBuildingId: BuildingId | null
  /**
   * Explicit cosmetic seed. ALL ambient variation (worker start positions, prop
   * jitter, light phases) derives from this string. No Math.random anywhere.
   */
  sceneSeed: string
}

/**
 * Operation provenance is explicit on every adapter-created snapshot. The legacy
 * arm permits omitted fields only for older hand-authored presentation fixtures;
 * `studioLotSnapshot()` always emits all three fields in both modes.
 */
type StudioLotOperationsProjection =
  | {
      operationsMode: 'managed'
      stageAssignmentAuthority: 'engine'
      productionOperations: ProductionOperationsState[]
    }
  | {
      operationsMode?: 'legacy'
      stageAssignmentAuthority?: 'presentation'
      productionOperations?: ProductionOperationsState[]
    }

export type StudioLotSnapshot = StudioLotSnapshotBase & StudioLotOperationsProjection

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

/** Canonical destination names (Gate D1 addendum §5). The single source of truth for labels. */
export const BUILDING_LABELS: Record<BuildingId, string> = {
  gate: 'Studio Gate',
  admin: 'Administration',
  casting: 'Casting / Talent',
  writers: 'Development',
  'stage-a': 'Stage A',
  'stage-b': 'Stage B',
  post: 'Production / Post',
  theater: 'Theater',
  expansion: 'Development & Casting Annex',
}
