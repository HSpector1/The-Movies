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

/**
 * The nine FOUNDING places — the bodies (and the one graded parcel) every studio
 * starts with. These ids are frozen vocabulary: the world, the companion navigation,
 * the first-movie journey and every accepted receipt key on them verbatim.
 */
export type FoundingBuildingId =
  | 'admin' // studio administration
  | 'writers' // development
  | 'casting' // casting / talent
  | 'stage-a' // soundstage A
  | 'stage-b' // soundstage B
  | 'post' // production / post
  | 'theater' // screening theater
  | 'gate' // studio entrance / gate
  | 'expansion' // the legacy Annex parcel

/**
 * One addressable place on the lot (C1-M1b).
 *
 * OPEN, not a closed nine-union. A studio that builds a facility on the South Lawn has
 * a tenth addressable place, and an eleventh the week after that; a type that could not
 * say so was the reason a placed facility had no identity, no inspector and no receipt.
 * The founding ids above are preserved verbatim inside this alias, so nothing that keys
 * on them changed — but no code path may assume they are the only ones.
 *
 * A placed facility's id is `placed-<placementId>` (see `placedBuildingId`). The ONE
 * exception is the legacy Annex: a placement standing on the `expansion` parcel keeps
 * being addressed as `expansion`, exactly as the accepted Annex specs require.
 */
export type BuildingId = string

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

/** Exact Engine-owned publicity tier identity. */
export type LotPublicityTier = 'whisper' | 'push' | 'blitz'

/**
 * One field-exact publicity offer projected from the Engine read model. These
 * values are facts, not inputs for Lot-side pricing, lift, or legality rules.
 */
export type LotPublicityOffer = {
  tier: LotPublicityTier
  cost: number
  maxLift: number
  expectedLift: number
  pricePerPoint: number | null
  cooldownWeeks: number
  globalCooldownWeeks: number
  available: boolean
  availableWeek: number | null
  reason: string | null
}

/** Exact Calendar-owned capacity blocker for an Annex-reserved production. */
export type LotAnnexWorkBlocker = {
  kind: 'facility-capacity'
  headline: string
  detail: string
}

/** One exact current occupant of the Development & Casting Annex slot. */
export type LotAnnexWorkOccupant = {
  owner: 'production' | 'script' | 'casting'
  ownerId: string
  title: string
  activity: 'development' | 'preProduction' | 'drafting' | 'rewriting' | 'auditioning'
  workState: 'working' | 'held'
  statusLabel: string | null
  blocker: LotAnnexWorkBlocker | null
}

/** The canonical one-slot Annex row copied from the Engine's Studio Calendar. */
export type LotAnnexWork = {
  facilityId: 'facility-development-casting-annex'
  facilityName: 'Development & Casting Annex'
  capability: 'development-casting'
  capacity: 1
  occupied: 0 | 1
  available: 0 | 1
  slot: 0
  occupant: LotAnnexWorkOccupant | null
}

/** Identity-only request for the existing deep owner of validated Annex work. */
export type LotAnnexWorkOwnerIntent =
  | { owner: 'production'; ownerId: string }
  | { owner: 'script'; ownerId: string }
  | { owner: 'casting'; ownerId: string }

/** Fail-closed host context returned by `operationalAnnexWorkContext`. */
export type LotAnnexWorkContext =
  | {
      state: 'available'
      annexWork: LotAnnexWork
      occupant: null
      ownerIntent: null
    }
  | {
      state: 'working'
      annexWork: LotAnnexWork
      occupant: LotAnnexWorkOccupant & { workState: 'working' }
      ownerIntent: LotAnnexWorkOwnerIntent
    }
  | {
      state: 'held'
      annexWork: LotAnnexWork
      occupant: LotAnnexWorkOccupant & {
        owner: 'production'
        workState: 'held'
        statusLabel: string
        blocker: LotAnnexWorkBlocker
      }
      ownerIntent: { owner: 'production'; ownerId: string }
    }

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
  /**
   * The soundstage BODY this picture is on.
   *
   * Was the closed pair `'stage-a' | 'stage-b'` until C2a-M2. It is now the open
   * `BuildingId`, because a studio that builds a third soundstage has a third body a
   * picture can be shooting in, and a type that could not say so was the reason the
   * adapter threw on one. Which ids are actually stages is DERIVED, never assumed —
   * see `stageIdentity.ts` and the snapshot's own `stages` list.
   */
  stageId: BuildingId
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

/**
 * One SOUNDSTAGE this studio has, and the body on the property that is it (C2a-M2).
 *
 * Derived — never enumerated. The rules, the founding vocabulary and the honest law-12
 * gap live in `stageIdentity.ts`; only the shape lives here, because this file is the
 * one boundary the visual lot is allowed to touch.
 */
export type LotStageIdentity = {
  /** The engine facility id — `facility-soundstage-07`, or a built stage's own id. */
  facilityId: string
  /** The engine's own name for it. The single spoken authority (§3.1). */
  facilityName: string
  /** The world body that IS this stage. */
  buildingId: BuildingId
  /** Authored founding property, or a facility the studio built. */
  origin: 'founding' | 'placed'
  /** Whether a BODY stands here yet, or only a building site with no floor to shoot on. */
  standing: boolean
}

/**
 * One SET this studio owns, and the stage it stands on (C2a-M2, §3.1).
 *
 * A mirror of the engine's own `StudioSet`, plus two facts the engine already knows and
 * the lot must never re-answer: whether the set is in good enough repair to shoot on
 * (`usable`, the engine's own gate) and WHICH scenery shop's crew holds the work on it
 * (`sceneryFacilityId`, the engine's own derived slot assignment).
 *
 * Nothing here is a rule. The lot paints a set's name, its location, its condition and
 * its work; it decides no legality and it invents no set the engine did not record.
 */
export type LotSetState = {
  /** The engine set id — `set-0`. Stable, never recycled. */
  id: string
  /** The set's own name. A player's word for it, and the identity the world prints. */
  name: string
  /** WHAT KIND OF PLACE it is, in the studio's own words — "Graveyard", "City Street". */
  locationLabel: string
  /** The soundstage FACILITY it is mounted on. In V1 a stage carries at most one set. */
  mountedOnFacilityId: string
  status: 'under-construction' | 'standing' | 'retired'
  /** True while the work under way is a REPAIR of a set that has already stood. */
  repairing: boolean
  /** The engine week the work completes; null for an endowed set that was never built. */
  completesWeek: number | null
  /** Whole weeks of work left. 0 whenever nothing is under way. */
  weeksRemaining: number
  /** 0..100, SHOWN. */
  quality: number
  /** 0..100, SHOWN. Wears per production. */
  condition: number
  /** 0..1, SHOWN. Depletes when a picture that shot here reaches an audience. */
  novelty: number
  /** The ENGINE's own answer to "may a picture shoot on this?". Never re-derived here. */
  usable: boolean
  /**
   * The scenery-shop facility whose crew holds this set's work, or null when no work is
   * under way. The engine derives the slot; the lot only reports where the crew is.
   */
  sceneryFacilityId: string | null
}

/**
 * One PERMANENT (Tier D) thing that happened to this studio in the CURRENT week.
 *
 * Class A by construction (§4.2): the ledger is persisted engine truth, so a week's
 * worth of these renders identically on load, after a batch, and mid-playback. The lot
 * surfaces them through the badge / attention / caption channels it already has — no
 * new animation machinery — and nothing here is ever an input to anything.
 *
 * Only the kinds the world has words for are carried. A row the adapter cannot resolve
 * into a name a player would recognise is omitted rather than printed as an id.
 */
export type LotWeekEvent =
  | {
      kind: 'wrapped'
      /** The picture that finished shooting. */
      title: string
      /** The soundstage facility it wrapped on. */
      stageFacilityId: string
      /** The set it stood on, or null when it was bound to none. */
      setId: string | null
    }
  | { kind: 'setBuilt'; setId: string }
  | { kind: 'setRetired'; setId: string }

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

/** Exact current role inside one active production company. */
export type LotProductionCompanyRole =
  | 'writer'
  | 'director'
  | 'lead'
  | 'antagonist'
  | 'support'
  | 'craft'

/**
 * One strictly proven current company member. `presentationRole` selects an
 * existing Role Atlas appearance; it does not relabel the person's profession.
 */
export type LotProductionCompanyMember = {
  productionRole: LotProductionCompanyRole
  slotIndex: number
  talentId: string
  name: string
  presentationRole: 'director' | 'talent'
}

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

// ── P05A W2 — the CLOSED Production row (recon §5.3/§5.4/§6.1, charter W2) ───
//
// TypeScript owns every meaning below. Unity and the browser render these
// closed values and never reconstruct lifecycle, worksites, blockers, or
// remedies from raw strings, phases, positions, or history.

/**
 * The fourteen closed operational states (recon §5.4). The projection derives
 * them from phase + task + the one scenery classifier + queue truth; a state a
 * consumer does not recognize is rendered as withheld, never guessed.
 */
export type LotProductionOperationalState =
  | 'development-working'
  | 'pre-production-working'
  | 'rehearsal-working'
  | 'director-required'
  | 'scenery-in-transit'
  | 'scenery-arrival-pending'
  | 'legacy-load-in-acknowledgment'
  | 'ready-to-schedule'
  | 'shooting-working'
  | 'resource-wait'
  | 'wrapped-waiting-for-post'
  | 'post-handoff'
  | 'release-ready'
  | 'release-committed'
  | 'status-unavailable'

/** How exactly the projection could resolve this picture's CURRENT worksite. */
export type LotWorksiteResolution = 'exact' | 'none' | 'withheld'

/**
 * One exact-ID target a production names on the lot (recon §6.1). Selection
 * changes information only; a consumer re-resolves by `productionId` against
 * the newest snapshot at activation and never falls back to a former stage,
 * a first array member, a nearest body, or a title.
 */
export type LotProductionTarget = {
  relationship: 'current-work' | 'related'
  resourceKind: 'facility' | 'set'
  /** Facility id or set id — stable engine identity, never a display name. */
  resourceId: string
  /** Engine capability for a facility target; null for a set. */
  capability: string | null
  /** The engine's own name for the place/thing (§3.1). */
  label: string
  /** The exact world body, when uniquely resolvable; null withholds Locate. */
  buildingId: BuildingId | null
  locatable: boolean
  /** The safe stated reason when `locatable` is false. */
  reason: string | null
}

/** One current holder of a resource this picture is waiting on (queue truth, verbatim). */
export type LotBlockerHolder = {
  resourceId: string
  ownerId: string
  title: string
  activity: string
  /** PROJECTED weeks until release, or null when the answer is not a countdown. */
  freesInWeeks: number | null
}

/**
 * One remedy ROUTE (recon §6.2): P05 remedies open/navigate to the canonical
 * Queue/Set/Scenery owner with exact context. They are never constructed into
 * commands from label text; commitment happens only in the owning surface.
 * `wait-for-holder` is process information, never a control.
 */
export type LotProductionRemedyRoute = {
  kind: 'open-queue' | 'open-scenery-shop' | 'open-set' | 'wait-for-holder'
  label: string
  /** Exact set for open-set repair/strike routes; null otherwise. */
  setId: string | null
  /** Exact holder for wait rows; null otherwise. */
  holderId: string | null
  /** PROJECTED weeks for wait rows; null otherwise or when unknown. */
  freesInWeeks: number | null
}

/**
 * The typed blocker anatomy (recon §5.3, annex §F): effect → cause →
 * consequence → holders → projected timing → remedy routes. Composed verbatim
 * from the engine's own queue/scenery truth.
 */
export type LotProductionBlockerAnatomy = {
  kind:
    | 'facility-capacity'
    | 'set-unavailable'
    | 'director-dispatch'
    | 'scenery-load-in'
    | 'take-scheduling'
  /** EFFECT — what cannot happen. */
  headline: string
  /** CAUSE — the exact refusing fact. */
  detail: string
  /** CONSEQUENCE — what holding means. */
  consequence: string
  holders: LotBlockerHolder[]
  /** PROJECTED weeks until the wait clears, or null when not a countdown. */
  projectedWeeks: number | null
  remedies: LotProductionRemedyRoute[]
}

/** A current-week or historical Wrap receipt — history, never current occupancy. */
export type LotProductionWrapReceipt = {
  wrappedWeek: number
  stageFacilityId: string
  setId: string | null
  /** True exactly when the receipt was stamped in the snapshot's own week. */
  currentWeek: boolean
}

/** Closed Stage presentation states (recon §5.5, §7.2). */
export type LotStagePresentationState =
  | 'withheld'
  | 'dark'
  | 'rehearsal'
  | 'load-in'
  | 'blocked'
  | 'shooting'
  | 'wrap'

/** The structured load-in logistics cue — exact endpoints, never a route claim. */
export type LotStageLogisticsCue = {
  kind: 'scenery-load-in'
  fromFacilityId: string
  toFacilityId: string
  distance: number
  weeksTotal: number
  weeksRemaining: number
  arrived: boolean
}

/**
 * One Stage-local row, keyed by exact Stage `facilityId` (recon §5.5). Unity's
 * N-Stage registry binds each row to its exact world body and withholds on
 * ambiguity without corrupting unrelated rows.
 */
export type LotStageProductionState = {
  stageFacilityId: string
  /** The exact world body, or null when no unambiguous body stands. */
  stageBuildingId: BuildingId | null
  facilityLabel: string
  /** The exact CURRENT holder, or null. Current ownership beats Wrap history. */
  holderProductionId: string | null
  holderTitle: string | null
  /** The live current Set, or null (explicit-grandfather live stages have none). */
  currentSetId: string | null
  presentationState: LotStagePresentationState
  /** TS-authored one-line holder copy for the nameplate, or null. */
  holderCopy: string | null
  /** Exact ids into `weekTheater.subjects` that concern THIS stage. */
  theaterSubjectIds: string[]
  /** Exact talentIds provably present at THIS stage for the current holder. */
  presenceTalentIds: string[]
  logistics: LotStageLogisticsCue | null
  /** A bounded historical receipt; never proof of current ownership. */
  wrapReceipt: LotProductionWrapReceipt | null
  /** Optional semantic presentation hint (e.g. reduced activity), TS-authored. */
  presentationHint: string | null
}

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
  /**
   * SUPERSEDED for placement by the W2 closed worksite model
   * (`worksiteResolution`/`primaryWorkTarget`): this legacy field still names
   * the PHASE's home building (e.g. `post` while merely queued for Post),
   * which recon §6.1 forbids as a "where is the work" answer. Retained for the
   * pre-W2 rail/receipt surfaces only; no new consumer may read it.
   */
  locationBuildingId: BuildingId
  facilityLabel: string
  directorId: string
  directorName: string
  /** Exact Lead actor identity for person-to-picture inspection. Older fixtures may omit it. */
  leadId?: string
  leadName?: string
  /**
   * Complete six-person current company, present only when the adapter proves
   * the entire managed production set atomically.
   */
  companyMembers?: readonly LotProductionCompanyMember[]
  taskStatus: LotShootingTaskStatus | null
  statusLabel: string
  blocker: {
    // C2a-M2: widened by ONE arm, additively, because the engine gained one. A
    // picture with a free stage and nothing built inside it waits on a SET, not on
    // a facility slot, and the lot may not fold the two together — the remedies
    // differ, and the world is where that difference becomes visible.
    kind:
      | 'facility-capacity'
      | 'set-unavailable'
      | 'director-dispatch'
      | 'scenery-load-in'
      | 'take-scheduling'
    headline: string
    detail: string
  } | null
  attention: AttentionState
  currentCommand: LotProductionCommand | null
  // ── P05A W2 closed-row extension (recon §5.3) ──────────────────────────────
  //
  // Additive. `studioLotSnapshot()` ALWAYS emits every field below (the wire
  // schema REQUIRES them, so an unemitted field fails closed at the bridge
  // boundary); they are optional here only so older hand-authored presentation
  // fixtures stay source-compatible, exactly like `leadId`/`companyMembers`.
  /** The concept behind the picture — exact id, already public on the board. */
  conceptId?: string
  /** One of the fourteen closed operational states. */
  operationalState?: LotProductionOperationalState
  /** TS-authored player copy for the operational state. */
  stateLabel?: string
  /** State-appropriate weeks (e.g. transit weeks remaining), or null. */
  stateWeeksRemaining?: number | null
  /** TS-authored next-milestone copy — never a percentage. */
  nextMilestone?: string
  worksiteResolution?: LotWorksiteResolution
  /** Exact currently OWNED worksites (live reservations), engine order. */
  ownedWorksites?: LotProductionTarget[]
  /** The policy-defined primary current work target, or null. */
  primaryWorkTarget?: LotProductionTarget | null
  /** Exact related (non-owned) targets: bound set, scenery source, queue rooms. */
  relatedTargets?: LotProductionTarget[]
  /** Everything Locate may offer for this picture, in stable order. */
  locateTargets?: LotProductionTarget[]
  /** The live Stage facility this picture currently holds, or null. */
  stageFacilityId?: string | null
  /** Its exact world body, or null when unresolvable (Locate withholds). */
  stageBuildingId?: BuildingId | null
  /** The live current Set, or null (explicit grandfather keeps null lawfully). */
  currentSetId?: string | null
  /** Full blocker anatomy, or null. Present exactly when `blocker` is. */
  blockerAnatomy?: LotProductionBlockerAnatomy | null
  /** Wrap receipt — history beside, never instead of, current occupancy. */
  wrapReceipt?: LotProductionWrapReceipt | null
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

// ── Build Mode V1 (M2-UI) — the placement facts the world paints ─────────────
//
// These mirror the Engine's `studioPlacementView(state)` projection field for field.
// Nothing here is a rule: the lot never decides what may be built, only what stands
// on the property right now. Legality for a CANDIDATE placement is a separate pure
// `queryPlacement` call the host runs per draft revision, and its result never
// enters this snapshot — a ghost is a UI-only layer (CODE-MINING-LEDGER Entry 2).

/** One grid cell of the lot, in the renderer's own (gx, gy) convention. */
export type LotCellPoint = { gx: number; gy: number }

/** Inclusive grid rectangle, exactly as the Engine's parcel map authors it. */
export type LotGridRect = { x0: number; y0: number; x1: number; y1: number }

/** One authored parcel of the studio's own ground. */
export type LotParcelState = {
  id: string
  label: string
  terrain: 'buildable' | 'blocked'
  rect: LotGridRect
  roadFrontage: boolean
  occupiedCells: number
  placedFacilityIds: number[]
}

// ── Move & Demolish V1 (C1-M3b) — may this building be re-sited or taken down? ──
//
// The ENGINE decides the fact and the UI decides the words (C1-M3a's own law). These
// types carry the fact. They are the DESTINATION-INDEPENDENT half of the two verbs —
// the eligibility that gates whether the world offers them at all. A move's DESTINATION
// legality is a separate live `placementQuote(..., { movingPlacementId })` the host runs
// per draft revision, exactly like the build ghost, and it never enters this snapshot.

/**
 * One live claim on a facility, mirrored from the engine's own engagement guard.
 *
 * `'set'` is C2a-M2's addition and it is TWO holds: a set going up or being repaired
 * holds a scenery-shop slot, and a standing set holds the MOUNT on the stage it is
 * built on — which is why a stage carrying a set cannot be taken down until the set is
 * struck. The engine widened `FacilityEngagementKind` for it; this mirror has to follow,
 * or the boundary that copies one into the other stops compiling (it did).
 */
export type LotFacilityEngagement = {
  kind:
    | 'production'
    | 'shootingTask'
    | 'screenplay'
    | 'castingSession'
    | 'legacyConstructionProject'
    | 'set'
  /** The production, screenplay, session, or SET id holding it. */
  holderId: string
  /** The engine's own activity word, verbatim. */
  activity: string
  /**
   * What the work is called, resolved at the engine boundary from the Studio Calendar.
   * NULL when nothing could prove a title — the world then says so neutrally rather
   * than inventing a name for the thing standing in the player's way.
   */
  title: string | null
}

/** Why a facility may not be moved or demolished right now. */
export type LotFacilityMutationBlock = {
  code: 'regimeNotReady' | 'unknownPlacement' | 'foundingPlacement' | 'facilityEngaged'
  /** Every live claim, in the engine's fixed order. Empty for every other code. */
  holders: LotFacilityEngagement[]
}

/** Whether the two destructive verbs may be offered for one placed facility. */
export type LotFacilityMutation = {
  canMove: boolean
  canDemolish: boolean
  /** The engine's refusal, or null when both verbs are legal right now. */
  blocked: LotFacilityMutationBlock | null
  /** The exact credit a demolition would return. The engine's number, not a fraction. */
  demolitionRefund: number
}

/** One facility standing on the lot — a construction site, or an operational building. */
export type LotPlacedFacilityState = {
  id: number
  blueprintId: string
  /**
   * What this facility IS, in the engine's own capability term — C2a-M2 §3.1.
   *
   * Joined from the committed blueprint, so it answers for a site under construction as
   * well as a finished body. The renderer dresses a body with no authored art by this
   * CLASS; absent ⇒ the honest massing block, exactly as before.
   */
  capability?: string
  name: string
  facilityId: string
  parcelId: string
  origin: LotCellPoint
  cells: LotCellPoint[]
  status: 'underConstruction' | 'operational'
  placedWeek: number
  completesWeek: number
  weeksRemaining: number
  /** Completed advances ÷ build weeks, 0..1. Presentation only; core owns the clock. */
  progress01: number
  weeklyOperatingCost: number
  /**
   * Move & Demolish eligibility (C1-M3b). Optional ONLY so the older hand-authored
   * presentation fixtures stay source-compatible; `studioLotSnapshot()` always emits it.
   * Absent ⇒ the world offers neither verb, which is the safe reading of "unknown".
   */
  mutation?: LotFacilityMutation
}

// ── Presence on the Lot V1 (M3-UI) — who is where, doing what, this week ─────
//
// A field-for-field mirror of the ENGINE's own `studioPresence(state)` projection
// (src/core/presence.ts), plus three strictly cross-checked presentation strings
// (`facilityName` / `workTitle` / `activity`) the adapter joins from the already
// accepted Studio Calendar for the SAME facility slot and the SAME owner id.
//
// Nothing here is a rule. The lot decides no attendance, invents no location and
// advances no beat: it renders the decomposition the engine already made. A person
// the engine WITHHELD is simply absent from `people` — the lot then claims no
// presence line for them at all (fail-neutral), while every already-accepted M1.5
// employment fact keeps rendering from its own source.

/** One integer beat of the engine's week decomposition. */
export type LotPresenceBeat = 'home' | 'travel' | 'at-site' | 'waiting'

/** Which authority claims the person's week. */
export type LotPresenceEngagement = 'production' | 'script' | 'casting' | 'roster'

/** What the person is credited as at the claimed site; null for an unclaimed week. */
export type LotPresenceCredit =
  | 'writer'
  | 'director'
  | 'lead'
  | 'antagonist'
  | 'support'
  | 'craft'
  | 'auditionee'
  | null

export type LotPresencePerson = {
  talentId: string
  name: string
  /** The person's PRIMARY profession, not the week's credit. */
  creativeRole: 'actor' | 'director' | 'writer' | 'craft'
  engagement: LotPresenceEngagement
  credit: LotPresenceCredit
  /** productionId | scriptProjectId | castingSessionId, or null for roster. */
  ownerId: string | null
  /** The ENGINE facility id claimed this week, or null for a roster week. */
  facilityId: string | null
  /** The exact reserved slot index at `facilityId`, or null. */
  slot: number | null
  /** Exactly `beatsPerWeek` entries, in beat order. */
  beats: LotPresenceBeat[]
  /** The engine's own queue reason, verbatim, or null. */
  blockedReason: string | null
  /** Calendar facility name for the claimed slot; null when unproven. */
  facilityName: string | null
  /** Calendar occupant title for the claimed slot; null when unproven. */
  workTitle: string | null
  /** Calendar occupant activity for the claimed slot; null when unproven. */
  activity: string | null
}

/** The engine's canonical decomposition of the CURRENT week, mirrored for the lot. */
export type LotPresenceProjection = {
  week: number
  /** The engine's BEATS_PER_WEEK. Carried so the renderer never assumes it. */
  beatsPerWeek: number
  /** The beat the STATIC lot renders — the middle of the working day. */
  staticBeat: number
  /** Ascending by talentId; each id appears at most once. */
  people: LotPresencePerson[]
  /** Ids the engine deliberately withheld. They claim no presence line. */
  withheldTalentIds: string[]
}

/**
 * The beat the STATIC lot renders — the middle of the engine's working day.
 *
 * The engine staggers departures across beats 0…2 and ends the working day at beat 8,
 * so beats 3…8 are the only ones where EVERY claimed person is provably at (or waiting
 * outside) their site. Beat 5 is the middle of that window: one beat, chosen once, so
 * the canvas and the DOM companion can never disagree about which instant "this week"
 * means. It is presentation law, not an engine number.
 */
export const LOT_PRESENCE_STATIC_BEAT = 5

// ── Studio Week Theater V1 (C2a-M5, charter §4.2) — what the PLANT is doing ──
//
// Presence's twin, mirrored at the same boundary and under the same law: a
// field-for-field copy of the ENGINE's own `studioWeekTheater(state)` projection
// (`src/core/studioWeekTheater.ts`), plus ONE strictly cross-checked presentation
// string — `productionTitle` — joined from the state the projection was taken
// from, on the SAME production id. A title that cannot be proven is dropped and
// the placement facts are kept (law 21: omitted atomically, never half-guessed).
//
// Nothing here is a rule. The lot decides no beat, invents no site, and advances
// no clock: it renders the decomposition the engine already made, and it may play
// the same track at 1×, 2× or 4× (§4.1) without the track changing — which is why
// the track is BEATS and not milliseconds.

/** One integer beat of the plant's week. Closed vocabulary. */
export type LotTheaterBeat = 'idle' | 'travel' | 'working' | 'waiting' | 'clearing'

/** The manufacturing loop's subjects (§4.2's named list). */
export type LotTheaterSubjectKind =
  | 'scenery-in-transit'
  | 'stage-hot'
  | 'stage-dark'
  | 'set-mounting'
  | 'set-struck'
  | 'wrap-clearing'
  | 'company-waiting'
  | 'queue-waiting'
  | 'construction-progressing'

export type LotTheaterSubject = {
  kind: LotTheaterSubjectKind
  /** Stable within a week and across identical weeks. */
  id: string
  /** The ENGINE facility id this happens at, or null. */
  facilityId: string | null
  /** The ENGINE's own name for it (§3.1), or null. Never invented here. */
  facilityName: string | null
  /** The picture, when the engine names one. */
  productionId: string | null
  /** Its spoken title, when the join proved it. Never an id (`00F`). */
  productionTitle: string | null
  /** Its phase, when there is one. */
  phase: string | null
  /** The set, when there is one. */
  setId: string | null
  /** Whole weeks of this work still ahead, or null for "the engine does not know". */
  weeksRemaining: number | null
  /** Grid cells a load-in is travelling; null for every other subject. */
  distance: number | null
  /** The engine's own waiting reason, verbatim, or null. */
  reason: string | null
  /** Exactly `beatsPerWeek` entries, in beat order. */
  beats: LotTheaterBeat[]
}

/** The engine's canonical reading of what the plant is doing, mirrored for the lot. */
export type LotWeekTheater = {
  week: number
  /** The engine's BEATS_PER_WEEK. Carried so the renderer never assumes it. */
  beatsPerWeek: number
  /** The beat the STATIC lot renders — shared with presence, by construction. */
  staticBeat: number
  /** Ascending by id; each id appears at most once. */
  subjects: LotTheaterSubject[]
  /** Subjects the engine deliberately withheld, with the reason it stated. */
  withheld: { subjectId: string | null; reason: string }[]
}

/** One buildable blueprint the catalog offers. */
/** One unmet requirement, in the engine's own player copy (C1-M5). */
export type LotBlueprintUnmet = {
  /** The sentence to SHOW, verbatim. Never a code name, never re-worded here. */
  reason: string
  /**
   * Whether the requirement is something a studio can work toward, or something the
   * game does not contain yet. The catalog styles the two differently and says
   * neither of them itself — C1-M2 added this field so no surface has to sniff strings.
   */
  notYetAttainable: boolean
}

/** How many of one blueprint the studio already has, split honestly (C1-M5). */
export type LotBlueprintOwned = {
  operational: number
  underConstruction: number
}

export type LotBlueprintState = {
  blueprintId: string
  name: string
  capability: string
  capacity: number
  footprint: { width: number; depth: number }
  clearanceRing: number
  requiresRoadAccess: boolean
  buildWeeks: number
  cost: number
  weeklyOperatingCost: number
  affordable: boolean
  /**
   * The engine-authored sentence saying what this building DOES. Player copy, shown
   * VERBATIM: the catalog invariant refuses a blueprint that cannot write one, so the
   * lot never has to invent a description for a building it does not understand.
   */
  effectSummary: string
  /** Unlocked? `unmet` carries the sentences when it is not. */
  available: boolean
  unmet: LotBlueprintUnmet[]
  /** Placements of this blueprint that already stand, in any status. */
  instanceCount: number
  /** The authored allowance, or null when unlimited. */
  maxInstances: number | null
  /** The allowance is used up — a separately worded lock, not a lack of money. */
  atInstanceLimit: boolean
  /**
   * C1-M8 — the NAME of the operational building that makes this one add nothing
   * right now, or null. The engine's own answer, from the effects authority that
   * decides the effect itself; the lot never works it out from a name or a tier
   * number. It qualifies the effect sentence, and locks nothing.
   */
  supersededBy: string | null
  /** Buildable somewhere in principle: unlocked, within allowance, affordable. */
  buildable: boolean
  /** The same count as `instanceCount`, told apart so the list can be honest. */
  owned: LotBlueprintOwned
}

// ── Property Geometry V1 (C1-M1b) — WHAT stands on the lot, and WHERE ────────
//
// Through M1a the renderer's own `world.ts` was the authority for which buildings
// existed and where they stood: nine hand-authored footprints, a closed set. The engine
// now owns that geometry (`state.property.structures`), so the snapshot carries it and
// the renderer keeps only PRESENTATION (textures, ground anchors, signage, zoning).
//
// Nothing here is a rule. It is the engine's own answer to "what physically occupies my
// ground this week", restated in the renderer's grid vocabulary. Footprints are
// HALF-OPEN from the origin (`[gx, gx+width) × [gy, gy+depth)`), exactly as the engine
// authors them and exactly as the renderer's building rectangles always were — NOT the
// inclusive convention `LotGridRect` uses for ground zones.

/** What kind of body a world building is. */
export type LotWorldBuildingRole =
  /** A civic body with no engine capacity behind it (Gate, Administration, Theater). */
  | 'landmark'
  /** A founding body that houses the studio's starting plant. */
  | 'founding'
  /** Graded ground the studio addresses as a place, with no body on it yet. */
  | 'parcel'
  /** A facility the studio built. Its id is `placed-<placementId>`. */
  | 'placed'

/** One addressable physical body on the property. */
export type LotWorldBuilding = {
  id: BuildingId
  /** The canonical destination name. For a placed facility, the engine's own name. */
  label: string
  role: LotWorldBuildingRole
  /** Half-open footprint origin, in the renderer's own (gx, gy) grid. */
  origin: LotCellPoint
  footprint: { width: number; depth: number }
  /** Placed facilities only: which `LotPlacedFacilityState` this body is. */
  placedFacilityId?: number
  /** Placed facilities only: which blueprint's presentation template it wears. */
  blueprintId?: string
  /**
   * Placed facilities only: what this body IS, in the engine's own capability term
   * (`soundstage`, `post`, `set-scenery`, `development-casting`) — C2a-M2.
   *
   * The renderer dresses a body it has no authored art for by CLASS rather than by
   * blueprint id: one procedural soundstage body serves every soundstage a studio ever
   * builds, at one texture and zero per-instance bytes (§3.1's stage-CLASS art unit).
   * Absent ⇒ the honest massing block, exactly as before.
   */
  capability?: string
  /**
   * Placed facilities only: whether a BODY stands here yet, or only a building site.
   *
   * The renderer needs it before it paints: a site's hit area is the graded pad it
   * actually is, and a finished facility's is the silhouette it actually has. Status
   * detail — the countdown, the progress, the weekly cost — stays on the placement
   * projection, which is the authority that owns it.
   */
  status?: 'underConstruction' | 'operational'
}

/** Everything the engine says about the shape of its own ground this week. */
export type LotPropertyProjection = {
  /** The addressable grid. 28×26 is where a studio STARTS, not a constant. */
  bounds: { width: number; depth: number }
  /**
   * Every body standing on the property, in a stable order: the authored structures in
   * engine order, then the legacy Annex parcel, then placed facilities by ascending
   * placement id. Ids are unique.
   */
  buildings: LotWorldBuilding[]
}

/** The id prefix every non-legacy placed facility is addressed by. */
export const PLACED_BUILDING_ID_PREFIX = 'placed-'

/** The world id of one placed facility. Stable across weeks: the engine owns the id. */
export function placedBuildingId(placementId: number): BuildingId {
  return `${PLACED_BUILDING_ID_PREFIX}${String(placementId)}`
}

/**
 * Which placement a world id names, or null when the id is not a placed facility.
 *
 * Strict on purpose: `placed-`, `placed-x` and `placed-01` are not placement ids, and a
 * caller that treated them as one would address a facility that does not exist.
 */
export function placedFacilityIdOf(id: BuildingId): number | null {
  if (typeof id !== 'string' || !id.startsWith(PLACED_BUILDING_ID_PREFIX)) return null
  const raw = id.slice(PLACED_BUILDING_ID_PREFIX.length)
  if (!/^(?:0|[1-9][0-9]*)$/.test(raw)) return null
  const parsed = Number(raw)
  return Number.isSafeInteger(parsed) ? parsed : null
}

/** The complete placement truth of the property this week. */
export type LotPlacementProjection = {
  mode: 'legacy' | 'managed'
  currentWeek: number
  /** May a placement be committed at all this week (managed regime, engaged economy)? */
  buildEnabled: boolean
  lotWidth: number
  lotDepth: number
  parcels: LotParcelState[]
  placements: LotPlacedFacilityState[]
  catalog: LotBlueprintState[]
  weeklyOperatingCost: number
}

/** One exact, currently signable contract-market visitor the Gate may present. */
export type LotGateHiringCandidate = {
  talentId: string
  name: string
  creativeRole: 'actor' | 'director' | 'writer' | 'craft'
  employmentStatus: 'freeAgent'
  /** Exact current term identities only; complete money truth remains in Hiring. */
  offerTermWeeks: number[]
}

/** Narrow Gate projection over the canonical current Hiring market. */
export type LotGateHiringMarket = {
  candidates: LotGateHiringCandidate[]
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
  /** Exact current Engine publicity offers, copied without Lot-side inference. */
  publicityOffers: LotPublicityOffer[]
  /** Exact Operational Annex slot truth, or null before the Annex is operational. */
  annexWork: LotAnnexWork | null
  /**
   * Build Mode V1 placement truth. Optional ONLY so the older hand-authored
   * presentation fixtures stay source-compatible; `studioLotSnapshot()` always emits it.
   */
  placement?: LotPlacementProjection
  /**
   * Property Geometry V1 truth — what physically stands on the lot and where (C1-M1b).
   *
   * Optional ONLY so the older hand-authored presentation fixtures stay source-
   * compatible; `studioLotSnapshot()` always emits it. A consumer that finds it absent
   * falls back to the INITIAL authored composition (see ../tycoon/buildings.ts), which
   * is exactly what a property-less state means — the same seam the engine's own
   * `propertyOf(state)` fallback uses.
   */
  property?: LotPropertyProjection
  /**
   * Presence on the Lot V1 truth. Optional ONLY so the older hand-authored
   * presentation fixtures stay source-compatible; `studioLotSnapshot()` always emits
   * it in managed mode and omits it in legacy mode (legacy holds no reservations the
   * engine projection can read, so there is nothing honest to claim).
   */
  presence?: LotPresenceProjection
  /**
   * Studio Week Theater V1 truth (C2a-M5, §4.2) — what the PLANT is doing this
   * week. Optional on exactly the same terms as `presence`: always emitted in
   * managed mode, omitted in legacy mode, where there is no plant to watch.
   */
  weekTheater?: LotWeekTheater
  /**
   * Every SOUNDSTAGE this studio has, derived from the engine's own facilities and the
   * bodies standing for them (C2a-M2, §3.1). In engine facility order.
   *
   * Optional ONLY so the older hand-authored presentation fixtures stay source-
   * compatible, and omitted in legacy mode, where operations hold no facilities to
   * derive from and the stages are exactly the two authored founding bodies. Read it
   * through `stageIdentity.ts`, which applies that fallback in one place.
   */
  stages?: LotStageIdentity[]
  /**
   * Every SET this studio owns, in the engine's own `state.sets` order (C2a-M2, §3.1).
   *
   * Optional ONLY so the older hand-authored presentation fixtures stay source-
   * compatible, and omitted in legacy mode, where a studio holds no sets at all.
   * Absent and empty therefore mean the same thing to every consumer: nothing stands
   * on this studio's stages, which is a fact the world states rather than hides.
   */
  sets?: LotSetState[]
  /**
   * The permanent things that happened to this studio THIS week (§4.2 Class A).
   *
   * Optional and omitted in legacy mode for the same reason as `sets`: a world with no
   * studio operations keeps no studio history. Absent ⇒ nothing to report.
   */
  weekEvents?: LotWeekEvent[]
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
  /** Optional only so legacy hand-authored fixtures remain source-compatible. */
  gateHiringMarket?: LotGateHiringMarket
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
      /**
       * P05A W2 — the Stage-local collection, keyed by exact Stage facilityId
       * (recon §5.5), one row per soundstage this studio has. `studioLotSnapshot()`
       * always emits it in managed mode; optional only for older fixtures.
       */
      stageProductions?: LotStageProductionState[]
    }
  | {
      operationsMode?: 'legacy'
      stageAssignmentAuthority?: 'presentation'
      productionOperations?: ProductionOperationsState[]
      stageProductions?: LotStageProductionState[]
    }

export type StudioLotSnapshot = StudioLotSnapshotBase & StudioLotOperationsProjection

/**
 * The nine FOUNDING ids, in a stable order — used for defaults and iteration.
 *
 * This is the CLOSED set, and it is closed on purpose: it names the places every studio
 * starts with, which is what the companion navigation, the first-movie journey and the
 * accepted receipts are written against. It is NOT "every building" any more — ask the
 * snapshot's own `property.buildings` for that (C1-M1b).
 */
export const FOUNDING_BUILDING_IDS: readonly FoundingBuildingId[] = [
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

/**
 * Retained name for `FOUNDING_BUILDING_IDS`, same values in the same order.
 *
 * Typed as `readonly BuildingId[]` so every existing `.includes(someBuildingId)` membership
 * test still compiles against the open id type. Read it as "the founding ids": since
 * C1-M1b it has never been every id on the property.
 */
export const ALL_BUILDING_IDS: readonly BuildingId[] = FOUNDING_BUILDING_IDS

/** Whether an open world id is one of the nine founding places. */
export function isFoundingBuildingId(id: BuildingId): id is FoundingBuildingId {
  return (FOUNDING_BUILDING_IDS as readonly string[]).includes(id)
}

/** Which navigation intent each FOUNDING building emits when its action is taken. */
export const BUILDING_ACTION: Record<FoundingBuildingId, LotActionKind> = {
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

/**
 * The navigation intent for ANY world id (C1-M1b).
 *
 * A placed facility the studio built is studio development: the same deep destination
 * the Annex parcel already opens, and the only screen that owns building on the lot.
 * That is a default, not a guess — every placed facility genuinely lives there.
 */
export function buildingActionFor(id: BuildingId): LotActionKind {
  return isFoundingBuildingId(id) ? BUILDING_ACTION[id] : 'view-expansion'
}

/** Canonical destination names (Gate D1 addendum §5). The single source of truth for labels. */
export const BUILDING_LABELS: Record<FoundingBuildingId, string> = {
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

/**
 * The canonical name of ANY world id (C1-M1b).
 *
 * A founding place reads from the frozen table above; a placed facility reads its name
 * from the ENGINE — `LotWorldBuilding.label` is `PlacedFacility.name`, which is the
 * de-duplicated identity the engine already assigned ("Development & Casting Annex 2").
 * A name is never invented: an id the snapshot cannot account for gets no name at all.
 */
export function buildingLabelFor(
  id: BuildingId,
  property?: LotPropertyProjection | null,
): string | null {
  if (isFoundingBuildingId(id)) return BUILDING_LABELS[id]
  const buildings = property?.buildings
  if (!Array.isArray(buildings)) return null
  const matches = buildings.filter((building) => building?.id === id)
  // Two bodies claiming one id is contradictory truth: name neither.
  if (matches.length !== 1) return null
  const label = matches[0]!.label
  return typeof label === 'string' && label.trim().length > 0 ? label : null
}
