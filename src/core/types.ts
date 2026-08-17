// ── §2 Declarations ─────────────────────────────────────────────────────────
// Verbatim from build-contract.md rev. 4 (§2.1–§2.6), with the rev. 4 type
// amendments folded in where the resolutions document (docs/rev4-open-questions.md)
// requires them (FilmResult gains conceptId/directorId per B12; SegmentForecast
// gains estimate per M7). Nothing here is behaviour — types and the §2 top-level
// primitives only.

// §2 top-level unions
export type Genre = 'comedy' | 'drama' | 'crime' | 'romance' | 'horror' | 'adventure'
export type SegmentId = 'youngAdult' | 'family' | 'adult' | 'prestige'
export type CulturalForce =
  | 'escapism'
  | 'patriotism'
  | 'realism'
  | 'darkness'
  | 'optimism'
  | 'spectacle'
export type CreativeRole = 'writer' | 'director' | 'actor' | 'craft'
export type CastSlot = 'lead' | 'antagonist' | 'support'
export type Range = [min: number, max: number]

// §2.1 Creative space
export type Persona = {
  // a performer's natural expressive profile. NOT ability. High warmth is
  // "more warm", never "better". all axes -1 .. +1
  warmth: number
  gravity: number
  physicality: number
}

export type Expression = {
  // what the work does. -1 .. +1
  intimacy: number
  tonalWeight: number
  kineticEnergy: number
}

// §2.2 People — D-9 Multi-Discipline Talent.
//
// D-9.1 vocab: four disciplines, six skills each (24 professional skills), every
// skill an integer 1..99 with a perceived/actual split. Reception (§5) reads
// actual; forecast (§7) reads perceived. See talentSummary.ts for the read-only
// summaries (OVR/Fit/Potential/…) and effectiveSkill (the §5/§7 substitute).

export type Discipline = 'acting' | 'writing' | 'directing' | 'craft'

// The six skill keys of each discipline, in fixed SKILL_ORDER (D-9.1).
export type ActingSkill =
  | 'actingTechnique'
  | 'emotionalRange'
  | 'dialogueDelivery'
  | 'comicTiming'
  | 'physicalPerformance'
  | 'screenPresence'
export type WritingSkill =
  | 'storyStructure'
  | 'characterDevelopment'
  | 'dialogue'
  | 'originality'
  | 'narrativePacing'
  | 'rewriting'
export type DirectingSkill =
  | 'visualStorytelling'
  | 'performanceDirection'
  | 'toneControl'
  | 'directingPacing'
  | 'productionManagement'
  | 'adaptability'
export type CraftSkill =
  | 'cinematography'
  | 'editing'
  | 'productionDesign'
  | 'soundAndMusic'
  | 'effectsExecution'
  | 'technicalCoordination'

// a perceived/actual pair for one professional skill (both 1..99)
export type SkillPair = { actual: number; perceived: number }

// all six skills of one discipline; keys fixed in SKILL_ORDER[discipline]
export type DisciplineSkills = Record<string, SkillPair> // 6 entries; keyed by that discipline's skill names

// per-discipline skill profiles (24 SkillPairs total). Field order fixed:
// acting → writing → directing → craft (D-9.16) so stableStringify is stable.
export type SkillProfiles = {
  acting: DisciplineSkills
  writing: DisciplineSkills
  directing: DisciplineSkills
  craft: DisciplineSkills
}

// hidden per-skill actual ceilings (1..99), one 6-vector per discipline (D-9.10)
export type Ceilings = {
  acting: Record<string, number>
  writing: Record<string, number>
  directing: Record<string, number>
  craft: Record<string, number>
}

// per-(discipline,genre) experience, perceived+actual (0..100) (D-9.9)
export type GenreExpEntry = { actual: number; perceived: number }
export type GenreExperience = Record<Discipline, Record<Genre, GenreExpEntry>>

export type DevRates = Record<Discipline, number> // 0.5..1.5 per discipline (D-9.10)
export type WorkHistory = Record<Discipline, number> // completed-production counters (D-9.9)

export type Talent = {
  id: string
  name: string
  role: CreativeRole // PRIMARY profession (unchanged; drives worldgen counts)
  age: number
  actual: Persona // temperament (unchanged; reception/roleFit source)
  perceived: Persona // temperament as believed (unchanged)
  fame: number // 0..100 STAR POWER (unchanged; separate from OVR)
  salary: number // per production; now from salaryCurve(talent) (D-9.13)
  authored: boolean // true if player-created (§10)

  // ── D-9 additions (all plain JSON) ──
  skills: SkillProfiles // 24 perceived/actual professional skills (§ D-9.1)
  ceilings: Ceilings // hidden per-skill actual ceilings (§ D-9.10)
  devRate: DevRates // per-discipline development rate (§ D-9.10)
  workEthic: number // 1..99 visible (§ D-9.11)
  genreExperience: GenreExperience // per (discipline,genre) perceived+actual (§ D-9.9)
  workHistory: WorkHistory // completed productions per discipline (§ D-9.9)

  // legacy scalar retained for back-compat & the V1→V2 migration proxy; NOT read
  // by §5/§7 after D-9 (OQ-5). Set to roleOVR(talent, primaryDiscipline) on
  // perceived skills. (Owner ruling: D-9 talent lives in SaveFileV2, NOT V1.)
  skill: number // = roleOVR(primary, perceived) proxy
}

// §10 authored-talent potential tiers (D-9.10 / D-9.14). 'GenerationalUpside' is
// reserved for authored talent only (worldgen never produces it).
export type PotentialTier =
  | 'Limited'
  | 'Steady'
  | 'Promising'
  | 'HighUpside'
  | 'ExceptionalUpside'
  | 'GenerationalUpside'

// Optional per-discipline authored specialist/generalist emphasis (D-9.14). The
// magnitude drives AUTHORED_BIAS_COST; a single spiked skill index within the
// primary discipline raises that skill and sags the others by biasMagnitude.
export type SkillBias = {
  discipline: Discipline // which discipline to emphasize (defaults to primary)
  skillIndex: number // 0..5 — the SKILL_ORDER index to spike
  magnitude: number // 0..1 — sharper specialist ⇒ larger, costlier
}

// §2.3 Concept, shape, promise
export type RoleRequirement = { target: Persona; tolerance: number } // tolerance 0.5 .. 3.0

export type FilmConcept = {
  id: string
  title: string
  genre: Genre
  baselineStrength: number // 0..100
  originalityRaw: number // 0..100
  baseNegativeCost: number // currency
  requiredSlots: CastSlot[]
  roleRequirements: Record<CastSlot, RoleRequirement>
}

export type FilmShape = {
  opening: 'immediateAction' | 'slowSetup' | 'mysteryHook'
  midpoint: 'reversal' | 'escalation' | 'revelation'
  ending: 'triumph' | 'bittersweet' | 'tragic' | 'ambiguous'
}

export type ShapeOption = {
  expression: Expression
  openingReachMod: number // percentage points
  craftMod: number
  budgetDemandMod: number
  originalityMod: number
  segmentAffinity: Partial<Record<SegmentId, number>>
}

export type ShapeEffects = {
  expression: Expression
  openingReachMod: number // clamped -15 .. +15
  craftMod: number // clamped -10 .. +10
  budgetDemandMultiplier: number // clamped 0.80 .. 1.40
  originalityMod: number // clamped -15 .. +15
  segmentAffinity: Record<SegmentId, number> // each clamped -12 .. +12
}

// The contract keeps the name `Promise`. The core is sync-only so shadowing the
// global Promise is acceptable per rev. 4 (see build-contract.md rev. 4 note).
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Promise = {
  genre: Genre
  intendedSegments: SegmentId[]
  ranges: { intimacy: Range; tonalWeight: Range; kineticEnergy: Range }
}

export type Budget = { negative: number; marketing: number }

// ── D-11.A film-specific immutable participant history ────────────────────────
// Captured at the LOCKED greenlight (perceived values); frozen onto the released
// FilmResult so the autopsy renders each film's OWN participants — immune to later
// talent development / Star-Power / contract / availability changes. Optional +
// captured ONLY when employment is engaged, so old V3 saves and the M0A corpus
// (employment-free) are unaffected (autopsy falls back to the session snapshot).
export type FilmParticipantRole = 'writer' | 'director' | 'lead' | 'antagonist' | 'support' | 'craft'
export type FilmParticipant = {
  talentId: string
  name: string // displayed name AT GREENLIGHT (frozen; the person may rename/leave later)
  role: FilmParticipantRole
  discipline: Discipline // the ASSIGNED discipline (D-11.12 relevant discipline)
  greenlightOVR: number // perceived role OVR at greenlight
  greenlightFit: number // Project Fit for this exact assignment at greenlight
  greenlightEP: { low: number; high: number; expected: number } // Expected Performance band
  freelancer: boolean // engaged as a freelancer (true) vs studio-contracted (false)
}
export type FilmParticipants = {
  writer: FilmParticipant
  director: FilmParticipant
  cast: Record<CastSlot, FilmParticipant>
  craft: FilmParticipant[] // the Production/Craft Lead(s)
}

// §2.4 Production and result
export type Production = {
  id: string
  conceptId: string
  shape: FilmShape
  promise: Promise
  writerId: string
  directorId: string
  craftIds: string[]
  cast: Record<CastSlot, string>
  budget: Budget
  startTick: number
  remainingTicks: number
  forecastSnapshot: Forecast
  participants?: FilmParticipants // D-11.A — locked at greenlight (engaged games only)
}

export type FilmResult = {
  productionId: string
  releaseTick: number
  delivered: Expression
  cohesion: number
  craft: number
  criticMean: number
  criticSigma: number
  criticScore: number
  reviewVariance: number
  segmentScores: Record<SegmentId, number>
  boxOffice: { opening: number; total: number }
  // rev. 4 additions (B12): keep released films attributable after the Production
  // is gone (D-3's director-genre predicate needs them).
  conceptId: string
  directorId: string
  // D-11.A — the film's OWN immutable participant record (present iff captured at an
  // engaged greenlight). The autopsy renders from this; absent on M0A/legacy films.
  participants?: FilmParticipants
  // D-11.C — the LOCKED greenlight forecast, frozen here so the newspaper clipping can
  // compare actual vs expected and reconstruct after save/reload (captured with
  // participants; absent on M0A/legacy films). Additive optional field on V3.
  forecast?: { expectedCriticScore: number; expectedTotal: number; expectedOpening: number }
}

// §2.5 World and state
export type Standing = {
  audienceAwareness: number // 0..100
  industryPrestige: number
  commercialConfidence: number
}

export type Segment = { id: SegmentId; share: number; taste: Expression } // shares sum to 1
export type CompetingRelease = { marketPressure: number } // 0..1

export type MarketState = {
  tick: number
  forces: Record<CulturalForce, number> // 0..100
  segments: Segment[]
  baseMarketValue: number // currency
  competingSlate: CompetingRelease[]
}

export type EraConfig = {
  soundRequired: boolean
  televisionCompetition: boolean
  censorship: 'none' | 'code' | 'ratings'
  costScale: number
}

export type Studio = {
  cash: number
  standing: Standing
  activeProductions: Production[]
  releasedFilms: FilmResult[]
}

// ── D-12 theatrical runs ──────────────────────────────────────────────────────
// A film's multi-week theatrical run, LOCKED at release from already-resolved reception
// outputs (opening, legs) + TUNING. Kept as a HISTORY (never deleted); `status` filters
// active vs completed. `legacyCompleted` = a migrated V3 release (full-gross, paid once,
// never repaid). Additive; empty on M0A/legacy → byte-identical.
export type TheatricalRunStatus = 'active' | 'completed' | 'legacyCompleted'
export type TheatricalRun = {
  productionId: string
  conceptId: string
  releaseTick: number
  totalWeeks: number
  weekIndex: number // weeks credited so far (0-based); === totalWeeks when finished
  weeklyGross: number[] // locked; Σ = opening×legs (= FilmResult.boxOffice.total for D-12 runs)
  studioShare: number // locked blended rental share (1.0 for legacyCompleted)
  cumulativeGrossPaid: number
  cumulativeStudioRevenuePaid: number // Studio Revenue ACTUALLY credited to cash
  economyModelVersion: number // 1 = D-12 blended; 0 = legacy full-gross (migrated V3)
  status: TheatricalRunStatus
}

// ── D-11 Studio Employment, Contracts, Roster, Freelancer Market ──────────────
// Employment/contract/ledger/founding state lives on GameState (studio-relative),
// NOT on Talent (the person). Talent stays the shared "industry" population; the
// studio's relationship to each person is derived (employmentStatus) or recorded
// here (contracts / freeAgents / founding). See docs/rev4-open-questions.md D-11.

// Five explicit employment statuses (D-11.1). Derived, never stored per talent.
// The identifier space is deliberately extensible for future rival ownership; NO
// rival behavior is simulated this milestone.
export type EmploymentStatus =
  | 'contracted'
  | 'engagedFreelancer'
  | 'availableFreelancer'
  | 'freeAgent'
  | 'unavailable'

// A studio contract (D-11.4). Term stored in WEEKS (displayed in years). A contract
// is active while startWeek ≤ week < endWeekExclusive.
export type Contract = {
  talentId: string
  annualSalary: number // currency; paid weekly as round(annualSalary / TICKS_PER_YEAR)
  signingBonus: number // currency; paid ONCE at signing (D-11.5)
  startWeek: number // market.tick at signing
  endWeekExclusive: number // startWeek + termWeeks; active while week < this
  termWeeks: number // 52..208 (1..4 years)
}

// Financial ledger (D-11.18). Every cash movement recorded after ledger authority
// began is retained so payroll never "silently disappears into production costs".
// Native studios reconcile from INITIAL_CASH. A V11 studio migrated from a genuine
// pre-ledger save may instead carry one explicit cash/ledger checkpoint; that
// checkpoint preserves opaque V1/V2 history without inventing a transaction.
// (founding recruitment-fund signing bonuses are the one deliberate exception —
// they draw founding.budget, never cash, and are tracked in founding.spentBonus).
export type LedgerKindV10 =
  | 'production' // negative + marketing debited at greenlight
  | 'boxOffice' // box-office total credited at release (LEGACY/M0A single-lump path only)
  | 'payroll' // weekly Σ contracted salaries debited at tick
  | 'signingBonus' // operating-phase contract signing bonus debited at signing
  | 'termination' // early-release termination cost debited at release
  | 'freelancerFee' // one-film freelancer fee debited at greenlight
  | 'studioRevenue' // D-12: weekly Studio Revenue cash receipt (blended share of weekly gross)
  | 'overhead' // D-12: weekly studio overhead (base + per-employee), engaged only
  // D-17B §2/§5: a publicity campaign purchase. A STUDIO-LEVEL cost, never a per-film
  // commitment — it carries no productionId and does NOT enter committed cost, film
  // contribution, or the fixed-cost allocator. Engaged-only, integer dollars.
  | 'publicity'

// Frozen V3–V10 ledger row. The never-typed correlation makes accidental V11
// authority a compile-time error even when an object is structurally wider.
export type LedgerEntryV10 = {
  week: number
  kind: LedgerKindV10
  amount: number // SIGNED: outflow negative, inflow positive
  talentId?: string
  productionId?: string
  constructionProjectId?: never
  note: string
}

export type LedgerKindV11 = LedgerKindV10 | 'constructionCapex'
export type LedgerKindV12 = LedgerKindV11 | 'facilityOpex'
// C1-M3a: the credit returned when a placed facility is demolished. Its own
// kind, never a negative capex and never generic revenue, so the whole capital
// life of a building — committed, operated, recovered — is one auditable trail
// correlated by `constructionProjectId`.
export type LedgerKind = LedgerKindV12 | 'facilityDemolitionRefund'

// Frozen V11 rows discriminate the one capital event and its exact correlation.
// Construction capex cannot masquerade as film/talent spend, while historical
// rows cannot carry constructionProjectId. SaveFileV11 stays anchored here so the
// V12 placement catalog's project ids can never be written under version 11.
export type LedgerEntryV11 =
  | LedgerEntryV10
  | {
      week: number
      kind: 'constructionCapex'
      amount: number
      talentId?: never
      productionId?: never
      constructionProjectId: 'construction-development-casting-annex'
      note: string
    }

// Live V12 rows. Construction capex now correlates to any catalog placement (the
// canonical Annex project id remains legal and is what the first Annex-class
// placement still uses), and the weekly operating cost of operational placed
// facilities is its own auditable kind carrying no per-film correlation.
export type LedgerEntry =
  | LedgerEntryV10
  | {
      week: number
      kind: 'constructionCapex'
      amount: number
      talentId?: never
      productionId?: never
      constructionProjectId: string
      note: string
    }
  | {
      week: number
      kind: 'facilityOpex'
      amount: number
      talentId?: never
      productionId?: never
      constructionProjectId?: never
      note: string
    }
  // C1-M3a. A POSITIVE amount — the only inflow in the construction family —
  // carrying the SAME `constructionProjectId` as the capex row it refunds. That
  // shared id is the whole correlation: exactly one refund per project, never a
  // refund without a prior capex, and never a refund for a facility still
  // standing. All three are asserted by the placement invariants.
  | {
      week: number
      kind: 'facilityDemolitionRefund'
      amount: number
      talentId?: never
      productionId?: never
      constructionProjectId: string
      note: string
    }

// The founding draft (D-11.2). Present only in a new PLAYER game until foundStudio
// closes it; null in the headless world (generateWorld stays employment-free).
export type FoundingState = {
  applicantIds: string[] // the bounded deterministic applicant pool
  budget: number // the recruitment fund (signing-bonus pool, separate from cash)
  spentBonus: number // recruitment-fund signing bonus spent so far
}

// The pre-employment state shape, FROZEN as SaveFileV2's state (D-11.16). Anchoring
// GameStateV1/V2 to this keeps the added employment fields out of the frozen shapes.
export type GameStateV2 = {
  seed: string
  rngState: string
  market: MarketState
  era: EraConfig
  studio: Studio
  talent: Talent[]
  concepts: FilmConcept[]
  broadcastItems: BroadcastItem[]
  coverageContexts: CoverageContext[]
}

// The D-11 employment surface, FROZEN as SaveFileV3's state (D-12.19). Anchoring
// SaveFileV3 to GameStateV3 (not the live GameState) keeps the D-12 `theatricalRuns`
// field out of the frozen V3 shape, exactly as GameStateV1/V2 are anchored.
export type GameStateV3 = GameStateV2 & {
  founding: FoundingState | null
  contracts: Contract[]
  ledger: LedgerEntryV10[]
  freeAgents: string[] // ids immediately signable (former employees; expired/released)
}

// The D-12 V4 surface: the frozen V3 surface PLUS theatrical runs (empty on M0A/legacy).
// Anchored so SaveFileV4 does NOT carry the D-14 careerEvents field.
export type GameStateV4 = GameStateV3 & {
  theatricalRuns: TheatricalRun[]
}

// The D-14 V5 surface: the V4 surface PLUS the append-only frozen career-event ledger
// (empty on M0A/legacy/non-engaged → byte-identical). FROZEN as SaveFileV5's state
// (D-17A/R2), so the D-17 `economyEngagedEver` field stays out of the frozen V5 shape,
// exactly as GameStateV1/V2/V3/V4 are anchored.
export type GameStateV5 = GameStateV4 & {
  careerEvents: TalentCareerEvent[]
}

// The D-17A V6 surface: the V5 surface PLUS the persisted engagement fact (R2).
// `economyEngagedEver` is an EXPLICIT, PERSISTED, MONOTONIC regime fact — set true at
// founding/first signing and never cleared — so enduring regime membership is never
// re-derived from mutable current collections (the D-16 engagement cliff: letting every
// contract expire silently switched the D-12 economy back off).
//
// FROZEN as SaveFileV6's state (D-17B/E4), so the D-17B `publicity` field stays out of the
// frozen V6 shape — exactly as GameStateV1/V2/V3/V4/V5 are anchored. SaveFileV6 is
// re-anchored to THIS alias by the same house precedent.
export type GameStateV6 = GameStateV5 & {
  economyEngagedEver: boolean
}

// ── D-17B §2/§5/§6 — publicity campaign state (SaveFileV7) ────────────────────
// The three legible tiers of the ONE authorized player Publicity action (contract §2;
// Owner authorization §4 B / §5 "PUBLICITY CAMPAIGN, not a Publicity Office facility").
export type PublicityTier = 'whisper' | 'push' | 'blitz'

// The MINIMUM persisted state the mechanic needs (authorization §4 G: "save state strictly
// required for the Publicity mechanic"). Cooldowns are the only thing publicity remembers:
// the awareness lift itself lands on `studio.standing.audienceAwareness` and the cash on the
// ledger, both of which already persist. `null` = never used.
//   lastUsedWeek — the GLOBAL cooldown clock (PUBLICITY_GLOBAL_COOLDOWN_WEEKS).
//   byTier       — the per-tier cooldown clocks, one entry per tier, always present.
export type PublicityState = {
  lastUsedWeek: number | null
  byTier: { whisper: number | null; push: number | null; blitz: number | null }
}

// The frozen D-17B V7 surface: V6 plus publicity cooldown state. SaveFileV7 remains
// anchored here when managed studio operations add the next live-state field.
export type GameStateV7 = GameStateV6 & {
  publicity: PublicityState
}

// ── Production Operations V1 (SaveFileV8) ────────────────────────────────────
export type StudioOperationsMode = 'legacy' | 'managed'
export type FacilityCapability =
  | 'development-casting'
  | 'soundstage'
  | 'set-scenery'
  | 'post'

export type StudioFacility = {
  id: string
  name: string
  capability: FacilityCapability
  capacity: number
}

export type ProductionPhase =
  | 'development'
  | 'preProduction'
  | 'rehearsal'
  | 'shooting'
  | 'postProduction'
  | 'releaseReady'

export type FacilityReservation = {
  productionId: string
  facilityId: string
  capability: FacilityCapability
  slot: number
  phase: ProductionPhase
}

export type ShootingTaskStatus = 'unassigned' | 'blocked' | 'ready' | 'scheduled' | 'completed'
export type ShootingTask = {
  id: string
  productionId: string
  directorId: string
  soundstageFacilityId: string
  status: ShootingTaskStatus
}

export type ProductionBlocker =
  | {
      kind: 'facility-capacity'
      capability: FacilityCapability
      targetPhase: ProductionPhase
    }
  | {
      kind: 'scenery-load-in'
      taskId: string
    }

export type ProductionWorkflow = {
  productionId: string
  phase: ProductionPhase
  reservations: FacilityReservation[]
  shootingTask: ShootingTask | null
  blocker: ProductionBlocker | null
}

export type StudioOperations = {
  mode: StudioOperationsMode
  facilities: StudioFacility[]
  workflows: ProductionWorkflow[]
}

// The frozen Production Operations V1 state. SaveFileV8 remains anchored here so
// Script Projects V1 cannot leak into its recursive state shape.
export type GameStateV8 = GameStateV7 & {
  operations: StudioOperations
}

// ── Script Projects V1 (SaveFileV9) ──────────────────────────────────────────
export type ScriptDevelopmentMode = 'legacy' | 'managed'
export type ScriptProjectStatus =
  | 'drafting'
  | 'review'
  | 'rewriting'
  | 'ready'
  | 'inProduction'
  | 'produced'
export type ScriptRewriteCount = 0 | 1

export type ScriptAssessment = {
  actualStrength: number
  perceivedStrength: number
}

// A screenplay task owns one exact slot in Development & Casting. `projectId`
// makes the reservation independently auditable at save and shared-capacity
// boundaries; the project status says whether the task is drafting or rewriting.
export type ScriptReservation = {
  projectId: string
  facilityId: string
  capability: 'development-casting'
  slot: number
}

export type ScriptProject = {
  id: string
  conceptId: string
  writerId: string
  shape: FilmShape
  promise: Promise
  status: ScriptProjectStatus
  rewriteCount: ScriptRewriteCount
  commissionedWeek: number
  // Persisted timing authority for the one-week Draft/Rewrite law. Present only
  // while work is active; cleared when the task enters Review.
  dueWeek: number | null
  assessment: ScriptAssessment | null
  reservation: ScriptReservation | null
  productionId: string | null
}

export type ScriptDevelopment = {
  mode: ScriptDevelopmentMode
  projects: ScriptProject[]
}

export type CommissionScriptPayload = {
  conceptId: string
  writerId: string
  shape: FilmShape
  promise: Promise
}

// The screenplay owns concept/shape/promise/writer. The package command supplies
// only the remaining production choices, preventing a UI from substituting facts.
export type GreenlightScriptProjectPayload = {
  projectId: string
  directorId: string
  craftIds: string[]
  cast: Record<CastSlot, string>
  budget: Budget
}

// Generalized, player-readable screenplay assignment truth. The display label is
// deliberately resolved by core so roster surfaces never invent a raw-id reason.
export type ScriptWriterAssignment = {
  talentId: string
  projectId: string
  status: 'drafting' | 'rewriting'
  title: string
  label: string
}

// Exact shared Development & Casting occupancy for read models and diagnostics.
export type DevelopmentCastingOccupancy = {
  facilityId: string
  facilityName: string
  slot: number
  owner: 'production' | 'script' | 'casting'
  ownerId: string
  activity: 'production-development' | 'drafting' | 'rewriting' | 'auditioning'
}

// The live V9 state. Legacy worlds carry an explicit empty screenplay surface;
// managed mode is activated only at the governed player-studio boundary.
export type GameStateV9 = GameStateV8 & {
  scriptDevelopment: ScriptDevelopment
}

// ── Casting Sessions V1 (SaveFileV10) ───────────────────────────────────────
export type CastingSessionsMode = 'legacy' | 'managed'
export type CastingSessionStatus = 'auditioning' | 'review' | 'complete'

export type CastingReservation = {
  sessionId: string
  facilityId: string
  capability: 'development-casting'
  slot: number
}

export type CastingSlate = Record<CastSlot, [string, string]>

// Persisted camera-test evidence deliberately excludes hidden execution truth,
// talent attributes, RNG state, and the run seed.
export type AuditionResult = {
  talentId: string
  estimate: number
  low: number
  high: number
}

export type CastingResults = Record<CastSlot, [AuditionResult, AuditionResult]>

export type CastingSession = {
  id: string
  projectId: string
  status: CastingSessionStatus
  slate: CastingSlate
  startedWeek: number
  dueWeek: number | null
  reservation: CastingReservation | null
  results: CastingResults | null
}

export type CastingSessions = {
  mode: CastingSessionsMode
  sessions: CastingSession[]
}

export type StartCastingSessionPayload = {
  projectId: string
  slate: CastingSlate
}

// SaveFileV9 stays recursively frozen above. SaveFileV10 owns the one new root.
export type GameStateV10 = GameStateV9 & {
  castingSessions: CastingSessions
}

// ── Development & Casting Annex V1 (SaveFileV11) ─────────────────────────
export type ConstructionMode = 'legacy' | 'managed'
export type ConstructionParcelId = 'expansion'
export type ConstructionProjectId = 'construction-development-casting-annex'
export type ConstructionProjectKind = 'development-casting-annex'
export type ConstructionFacilityId = 'facility-development-casting-annex'
export type ConstructionProjectStatus = 'building' | 'completed'

export type ConstructionParcel = {
  id: ConstructionParcelId
  projectId: ConstructionProjectId | null
}

export type ConstructionProject = {
  id: ConstructionProjectId
  kind: ConstructionProjectKind
  parcelId: ConstructionParcelId
  facilityId: ConstructionFacilityId
  status: ConstructionProjectStatus
  capex: 780000
  startedWeek: number
  dueWeek: number
  completedWeek: number | null
}

export type StudioConstruction = {
  mode: ConstructionMode
  parcels: ConstructionParcel[]
  projects: ConstructionProject[]
}

// SaveFileV11 compatibility checkpoint. V1/V2 legitimately persisted cash but no
// ledger, and the frozen V2→V3 law preserved that cash while seeding an empty
// ledger. When such history cannot reconcile from INITIAL_CASH, migration records
// the exact cash and ledger length at the V11 boundary. Every later cash movement
// must reconcile exactly from this point; no balancing ledger row is fabricated.
export type CashLedgerCheckpoint = {
  cash: number
  ledgerLength: number
}

// SaveFileV10 remains recursively frozen above. SaveFileV11 owns the construction
// root and one optional migration-only cash/ledger checkpoint. Native and already-
// reconciled states omit the checkpoint, preserving the original V11 byte shape.
export type GameStateV11 = Omit<GameStateV10, 'ledger'> & {
  ledger: LedgerEntryV11[]
  construction: StudioConstruction
  cashLedgerCheckpoint?: CashLedgerCheckpoint
}

// ── Placement Core V12 ───────────────────────────────────────────────────────
// The tycoon build surface: an authored coarse parcel map over the studio lot, a
// TUNING blueprint catalog, and monotonic placed-facility records. Occupancy is
// DERIVED from `placement.facilities[].cells` and is never persisted.

/** One grid cell of the studio lot. Integer coordinates only; there is no Z. */
export type LotCell = { gx: number; gy: number }

/** An INCLUSIVE grid rectangle (both bounds are inside the rectangle). */
export type LotRect = { x0: number; y0: number; x1: number; y1: number }

/** Buildable ground, or owned-but-protected ground the studio will not build on. */
export type ParcelTerrain = 'buildable' | 'blocked'

export type LotParcel = {
  id: string
  label: string
  terrain: ParcelTerrain
  rect: LotRect
  // There is no land market this milestone: the studio owns its whole lot from
  // week zero, so this is uniformly true and `notOwned` means "not the property".
  ownedFromStart: true
}

// ── C1-M2 blueprint requirements — the declarative unlock schema ─────────────
// LAW: what unlocks a building is DATA on the blueprint, never a branch in code.
//
// WHY: the recovered original engine gated its catalog with a numbered `requires`
// list per blueprint (its 2005 data carries date_ and facility_ kinds). That shape
// is right, and it is right for the same reason our property became state: a gate
// expressed as data can be authored, inspected, explained to the player, and added
// to without editing the evaluator. A gate expressed as an `if` cannot.
//
// THE HONEST-EVALUATION RULE: five of these kinds name systems that do not exist
// yet (rank and certificates and awards in C3, research in C4, land zones with C3
// acquisition). They are declared NOW so the vocabulary is fixed and M4 can author
// against it, and they evaluate today as honestly UNMET with a reason that says
// the gate is not yet attainable. They never throw and they are never silently
// treated as satisfied. When C3/C4 land, each activates by adding a state accessor
// to the evaluator — no new kind, no new rejection code, no UI change.

/**
 * One authored precondition on a blueprint. A blueprint is available when EVERY
 * requirement in its list is met; an empty list means always available.
 *
 * The id-bearing kinds carry DISPLAY-READY ids (`tier: 'Respected Studio Head'`),
 * not slugs. The evaluator renders them into player copy verbatim because it has
 * no name table for systems that do not exist yet, and inventing one now would be
 * a second place for that vocabulary to live. M4 authors them as the words the
 * player should read.
 */
export type BlueprintRequirement =
  /** Available from an absolute week of the studio calendar. */
  | { kind: 'date'; week: number }
  /** At least one OPERATIONAL placement of that blueprint exists. */
  | { kind: 'facility'; blueprintId: string }
  /** A named property structure exists (founding or landmark). */
  | { kind: 'structure'; structureId: string }
  /** Studio Rank gate. The rank system lands in C3. */
  | { kind: 'rank'; tier: string }
  /** Achievement Certificate gate. Certificates land in C3. */
  | { kind: 'certificate'; certificateId: string }
  /** Award gate. Awards land in C3. */
  | { kind: 'award'; awardId: string }
  /** Research completion gate. Research lands in C4. */
  | { kind: 'research'; packId: string }
  /** Property zone ownership gate. Land acquisition lands in C3. */
  | { kind: 'landZone'; zoneId: string }

export type BlueprintRequirementKind = BlueprintRequirement['kind']

/**
 * One requirement that is NOT met, with the copy a player should be shown.
 *
 * `reason` is product copy, not a diagnostic: it is the locked-reason vocabulary
 * the catalog UI renders verbatim (C1-M5). It never names an internal code, a
 * milestone, or a campaign. Engine-side messages stay in the invariant strings.
 *
 * `notYetAttainable` separates "you have not done this yet" from "no amount of
 * play can do this yet, because the system does not exist". Both are unmet and
 * both block, but a catalog that renders them identically would be lying about
 * which one is a goal. M5 is free to style them differently; the distinction is
 * computed here so it cannot drift.
 */
export type UnmetRequirement = {
  requirement: BlueprintRequirement
  reason: string
  notYetAttainable: boolean
}

/** The result of evaluating a blueprint's whole requirement list. */
export type BlueprintAvailability = {
  available: boolean
  /** Unmet requirements in AUTHORED order — stable, so UI order never churns. */
  unmet: UnmetRequirement[]
}

/**
 * A catalog entry. Blueprints are authored TUNING constants, never persisted:
 * a placed facility stores only its `blueprintId`, so a catalog correction can
 * never rewrite a committed cost, duration, or footprint that already happened.
 */
export type FacilityBlueprint = {
  id: string
  name: string
  capability: FacilityCapability
  /** Capacity ONE operational placement of this blueprint contributes. */
  capacity: number
  /** Flat rectangular footprint in cells. No Z, no slopes, no rotation in V12. */
  footprint: { width: number; depth: number }
  /** Cells that must stay clear of other placed facilities around the footprint. */
  clearanceRing: number
  requiresRoadAccess: boolean
  buildWeeks: number
  capex: number
  weeklyOperatingCost: number
  /** Identity bases; the first placement of the blueprint uses them verbatim. */
  facilityIdBase: string
  projectIdBase: string
  ledgerNote: string
  /**
   * C1-M2: everything that must be true before this may be built. An EMPTY list
   * means unconditionally available, which is what every V12 blueprint was.
   */
  requires: readonly BlueprintRequirement[]
  /**
   * C1-M2: how many of this blueprint may stand at once. ABSENT means unlimited,
   * which is the proven V12 behaviour and stays the default.
   *
   * Counted over PLACEMENTS of this blueprint in every status: a site under
   * construction has already reserved its instance, because the alternative lets
   * a player queue five of a one-per-studio building and discover the problem
   * only when the fourth completes.
   *
   * Founding structures never count toward it. A structure is PROPERTY — authored
   * ground the studio starts with — not a placement, and the two are deliberately
   * different things (C1-M1a). A blueprint that says "one per studio" is a rule
   * about what this studio may BUILD; the bodies it was founded with are not
   * builds, have no blueprint, and cost nothing to keep. If a future blueprint
   * genuinely needs to count a founding body, that is a `structure` requirement,
   * which is exactly the kind that exists for it.
   */
  maxInstances?: number
}

export type PlacementStatus = 'underConstruction' | 'operational'

export type PlacedFacility = {
  /** Monotonic, never reused. Reserved through `StudioPlacement.nextPlacementId`. */
  id: number
  blueprintId: string
  /** The parcel owning the ORIGIN cell. */
  parcelId: string
  origin: LotCell
  /** Every occupied cell, in fixed reading order (ascending gy, then gx). */
  cells: LotCell[]
  /** The `StudioFacility.id` this placement contributes once operational. */
  facilityId: string
  /** The `constructionCapex` ledger correlation id. */
  projectId: string
  status: PlacementStatus
  placedWeek: number
  completesWeek: number
}

export type StudioPlacementMode = 'legacy' | 'managed'

export type StudioPlacement = {
  mode: StudioPlacementMode
  nextPlacementId: number
  facilities: PlacedFacility[]
}

/**
 * The eleven rejection codes, in their binding legality ORDER. `primary` is the
 * first of these present in a quote; money is always last, so a placement that is
 * both illegal and unaffordable reports the domain failure.
 *
 * C1-M2 adds `requirementsUnmet` and `instanceLimit`, both BEFORE
 * `insufficientFunds` under the standing law that a domain failure outranks
 * affordability. They sit after the geometry rules because geometry is about THIS
 * site and these two are about the studio: told "you cannot build here" and "you
 * cannot build this yet", a player needs the site answer first when both are true
 * of the cell under the cursor. `requirementsUnmet` outranks `instanceLimit`
 * because an unmet requirement means the building is not unlocked at all, which
 * is a larger fact than having used up its allowance.
 */
export type PlacementRejection =
  | 'unknownBlueprint'
  | 'offLot'
  | 'notOwned'
  | 'terrainUnbuildable'
  | 'occupied'
  | 'clearanceRing'
  | 'noRoadAccess'
  | 'seversLot'
  | 'requirementsUnmet'
  | 'instanceLimit'
  | 'insufficientFunds'

/** Per-cell verdict. Every cell is evaluated; the query never fails fast. */
export type PlacementCellVerdict = {
  cell: LotCell
  ok: boolean
  rejection: PlacementRejection | null
}

export type PlacementRequest = { blueprintId: string; origin: LotCell }

export type PlacementQuote = {
  ok: boolean
  blueprintId: string
  origin: LotCell
  /** The parcel owning the origin cell, or null when it owns none. */
  parcelId: string | null
  cells: LotCell[]
  cellLegality: PlacementCellVerdict[]
  /** The authoritative capital cost. A commit charges THIS, never a caller value. */
  cost: number
  weeklyOperatingCost: number
  buildWeeks: number
  completesOnWeek: number
  capability: FacilityCapability | null
  capacityDelta: number
  rejections: PlacementRejection[]
  primary: PlacementRejection | null
  /**
   * C1-M2: why the blueprint is locked, if it is — the player-facing copy behind
   * a `requirementsUnmet` rejection. Empty whenever every requirement is met, so
   * a caller can read it without first checking `rejections`.
   */
  unmetRequirements: UnmetRequirement[]
  /** C1-M2: placements of this blueprint that already exist, in any status. */
  instanceCount: number
  /** C1-M2: the blueprint's allowance, or null when it is unlimited. */
  maxInstances: number | null
}

// SaveFileV11 remains recursively frozen above. SaveFileV12 owns the placement
// root and widens the live ledger to the catalog's construction/opex rows.
export type GameStateV12 = Omit<GameStateV11, 'ledger'> & {
  ledger: LedgerEntry[]
  placement: StudioPlacement
}

// ── C1-M1a Property State ────────────────────────────────────────────────────
// LAW: the studio property is engine STATE, not module constants.
//
// WHY: through V12 the lot's dimensions, roads, and parcel map were authored
// module constants, and the eight physical studio buildings existed only in the
// renderer. That made three things architecturally impossible: the property could
// never grow (a constant is not a savegame), today's buildings were privileged
// (invisible to legality, so nothing could reason about them), and the engine had
// no answer to "what physically stands on this ground?".
//
// Under V13 a GameState carries its whole property. The constants in `lot.ts`
// remain, but only as THE INITIAL AUTHORED PROPERTY — the data a fresh state is
// seeded from and the value `convertV12ToV13` synthesizes. No logic closes over
// them any more: every geometry predicate takes the property it is asked about.
//
// This milestone is deliberately BEHAVIOR-NEUTRAL. Nothing here lets a player buy
// land, move a structure, or build differently than they could under V12; the
// representation changed, the game did not.

/**
 * Why a structure stands on the property.
 *
 * `landmark` — a civic body with no engine capacity (the Gate, Administration,
 * the Theater). It occupies ground and nothing else.
 * `founding` — a working body the studio started with, whose engine capacity is
 * one or more entries of `INITIAL_STUDIO_FACILITIES` (see `providesFacilityIds`).
 *
 * The two differ ONLY by this field. A landmark is not a lesser kind of thing: it
 * is a structure that provides no facility, which is exactly `providesFacilityIds`
 * being empty. The role is retained because M1b's inspector and C2's Founding Flip
 * both need to know which bodies were authored as the studio's founding plant.
 */
export type PropertyStructureRole = 'landmark' | 'founding'

/**
 * One authored physical body standing on the property.
 *
 * Geometry is ENGINE-OWNED pure data: `origin` + `footprint` are the same numbers
 * the M1 renderer authored, lifted here verbatim so the engine no longer depends
 * on presentation code to know what physically occupies its ground. The renderer
 * keeps presentation metadata (textures, ground anchors, signage) and, from M1b,
 * consumes these positions rather than authoring its own.
 *
 * Footprints are HALF-OPEN from the origin (`[gx, gx+width) × [gy, gy+depth)`),
 * matching both the renderer's building rectangles and `FacilityBlueprint`. This
 * is deliberately NOT the inclusive convention `LotRect` uses for ground zones.
 *
 * `providesFacilityIds` is the link between a body and the engine capacity that
 * works inside it. It is a list because one body can house several facilities (the
 * Production / Post building holds both Post and the Scenery Shop). Every id must
 * name an `INITIAL_STUDIO_FACILITIES` entry and may be claimed by exactly one
 * structure — a facility has one home.
 */
export type PropertyStructure = {
  id: string
  label: string
  role: PropertyStructureRole
  /** Half-open footprint origin, in the same grid as parcels and placements. */
  origin: LotCell
  /** Half-open footprint extent. No Z, no slopes, no rotation. */
  footprint: { width: number; depth: number }
  /** `StudioFacility.id`s whose bodies stand here. Empty for a landmark. */
  providesFacilityIds: string[]
}

/**
 * The studio property: everything the engine knows about its own ground.
 *
 * `bounds` is the addressable grid. `roads` is circulation (never ownable land, so
 * roads are deliberately not parcels). `parcels` is the coarse ownership map that
 * placement legality reads. `structures` is what physically stands there.
 *
 * All four are STATE. A property with a wider `bounds` and an extra parcel is a
 * valid property and every predicate in `lot.ts` answers correctly about it with
 * no code change — that is the whole point of this milestone, and it is asserted
 * by the expandability test rather than left as an aspiration.
 */
export type PropertyState = {
  bounds: { width: number; depth: number }
  roads: LotRect[]
  parcels: LotParcel[]
  structures: PropertyStructure[]
}

// SaveFileV12 remains recursively frozen above. SaveFileV13 owns the property
// root: the bounds, roads, parcel map, and authored structures that V12 held as
// module constants. A migrated V12 world receives INITIAL_PROPERTY, which IS
// those constants — so the migration invents nothing.
export type GameStateV13 = GameStateV12 & {
  property: PropertyState
}

export type GameState = GameStateV13

// ── D-14 Talent Career Impact — frozen career-event record (§7) ───────────────
// The ONE canonical persisted record of a participant's outcome on one released film.
// Autopsy (film-centric) and Talent Profile (talent-centric) BOTH render from this —
// they never recompute a delta from present-day talent state. eventId is stable so a
// reload/re-render cannot duplicate it.
export type CareerReasonCode =
  | 'substantialLeadExposure' // Lead billing created meaningful exposure
  | 'supportingRoleVisibility' // a smaller-billing role, proportionally less opportunity
  | 'limitedAudienceReach' // the film did not reach enough viewers to move recognition
  | 'strongAudienceResponse' // audiences responded well; exposure was valuable
  | 'weakAudienceResponse' // poor audience response limited the gain
  | 'exceededCommercialExpectations' // realized reach materially beat the locked forecast
  | 'missedCommercialExpectations' // realized reach materially missed the locked forecast
  | 'establishedStarSaturation' // already near the top; large results are needed to move
  | 'noMeaningfulCareerChange' // nothing material changed this release

export type TalentCareerEvent = {
  eventId: string // `${filmId}:${talentId}` — stable + unique per (film, participant)
  talentId: string
  filmId: string // productionId of the released film
  filmTitle: string // concept title, snapshotted at release
  releaseWeek: number
  genre: Genre
  role: FilmParticipantRole
  billingWeight: number // the role-visibility weight applied (§5)
  discipline: Discipline // the discipline the participant performed in
  ovrBefore: number // perceived role OVR in `discipline` before this release's development
  ovrAfter: number
  skillsBefore: Record<string, number> // visible (perceived) skills of `discipline` before
  skillsAfter: Record<string, number>
  skillDeltas: Record<string, number>
  genreExpBefore: number // perceived (discipline, genre) experience before
  genreExpAfter: number
  workHistoryBefore: number // completed-production counter for `discipline` before
  workHistoryAfter: number
  starPowerBefore: number // fame before the update
  starPowerAfter: number // fame after the update (clamped 0..100)
  starPowerDelta: number // starPowerAfter − starPowerBefore
  realizedOpening: number
  realizedTotal: number
  audienceScore: number // weightedAudienceScore (0..100)
  criticScore: number // recorded for context only — NOT a primary Star Power input in v1
  forecastComparator: number // realizedTotal / locked expectedTotal (1 when no forecast)
  reasonCodes: CareerReasonCode[]
}

// §2.6 Actions
export type Action =
  | {
      kind: 'greenlight'
      production: Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'>
    }
  | { kind: 'cancel'; productionId: string }
  | { kind: 'createTalent'; talent: AuthoredTalentInput } // §10 (legacy budget creator)
  | { kind: 'createBalancedTalent'; talent: BalancedTalentInput } // §10 / D-11.C (Balanced specialization)
  | { kind: 'createCustomTalent'; talent: CustomTalentInput } // §10 / D-11.A (Full Custom)
  // ── D-11 employment actions ──
  | { kind: 'foundStudio' } // close the founding draft (minimums must be met)
  | { kind: 'signContract'; talentId: string; termWeeks: number } // sign to studio contract
  | { kind: 'renewContract'; talentId: string; termWeeks: number } // extend during renewal window
  | { kind: 'releaseTalent'; talentId: string } // early release (financial cost only)
  // ── D-17B §2 publicity action (the ONE authorized paid awareness lever) ──
  | { kind: 'publicity'; tier: PublicityTier }
  // ── Production Operations V1 ──
  | { kind: 'activateStudioOperations' }
  | { kind: 'assignShootingDirector'; productionId: string; directorId: string }
  | { kind: 'clearSceneryLoadIn'; productionId: string }
  | { kind: 'scheduleShootingTake'; productionId: string }
  // ── Script Projects V1 ──
  | { kind: 'activateScriptDevelopment' }
  | { kind: 'commissionScript'; project: CommissionScriptPayload }
  | { kind: 'requestScriptRewrite'; projectId: string }
  | { kind: 'acceptScript'; projectId: string }
  | { kind: 'greenlightScriptProject'; production: GreenlightScriptProjectPayload }
  // ── Casting Sessions V1 ──
  | { kind: 'activateCastingSessions' }
  | { kind: 'startCastingSession'; session: StartCastingSessionPayload }
  | { kind: 'acknowledgeCastingSession'; sessionId: string }
  // ── Development & Casting Annex V1 ──
  // Retained and still legal in V12, where it is an ALIAS for placing the
  // `development-casting-annex` blueprint at the legacy expansion parcel's origin.
  | { kind: 'startDevelopmentCastingAnnex' }
  // ── Placement Core V12 ──
  | { kind: 'placeFacility'; placement: PlacementRequest }

// §10 Authored talent — extended per D-9.14 (creation budget). `actual` persona
// stays fully player-chosen; potential/workEthic/skillBias/secondary share a
// bounded creation budget (AUTHORED_BUDGET). The player never sets skills/fame
// directly — they are derived from the tier + bias (D-9.14).
export type AuthoredTalentInput = {
  name: string
  role: CreativeRole
  age: number // 18..70
  actual: Persona // temperament, fully player-chosen (or a preset, D-9.8)
  potentialTier: PotentialTier // hidden ceilings drawn from the tier band (D-9.10/14)
  workEthic: number // 1..99, player-chosen numerically (D-9.11)
  skillBias?: SkillBias // optional per-discipline emphasis (specialist vs generalist)
  secondaryDiscipline?: CreativeRole // optional; costs budget (D-9.14)
}

// §10 / D-11.A Full Custom talent — the player edits the AUTHORITATIVE underlying
// attributes DIRECTLY (no creation budget). perceived = actual at creation. Skills are
// six values per discipline in SKILL_ORDER (1..99). Ceilings default to the skill value
// (no hidden upside) unless supplied; genre experience defaults to 0. May deliberately
// produce a powerful/unbalanced person. OVR is always DERIVED from these skills (never
// an input); Fit is never stored (it is film/assignment-dependent). See D-11.A (A3).
export type CustomTalentInput = {
  name: string
  role: CreativeRole // primary profession
  age: number // 18..70
  actual: Persona // Creative Temperament
  workEthic: number // 1..99
  fame: number // 0..100 Star Power
  skills: Record<Discipline, number[]> // 6 per discipline in SKILL_ORDER, each 1..99
  ceilings?: Partial<Record<Discipline, number[]>> // optional per-skill potential ceilings (≥ skill, ≤ 99)
  genreExperience?: Partial<Record<Discipline, Partial<Record<Genre, number>>>> // optional 0..100
}

// §10 / D-11.C — an archetype preset: the profession-shaped Balanced-Career BASELINE
// before the player spends specialization points. Populates ONLY authoritative
// underlying values (no hidden modifiers / permanent bonuses). See BALANCED_ARCHETYPES.
export type ArchetypePreset = {
  id: string
  label: string
  appliesTo: Discipline | 'any' // profession-specific, or a cross-profession career path
  primarySkills: number[] // 6 baseline values (SKILL_ORDER) for the primary discipline (OVR ≈ 38–45)
  secondaryBaseline: number // non-primary skills baseline (secondary OVR ≈ 15–28; ≥ SKILL_FLOOR)
  secondaryBoost?: { role: CreativeRole; skills: number[] } // multi-hyphenate: one raised secondary
  genreBaseline: Partial<Record<Genre, number>> // small primary-discipline genre experience
  defaultPotentialTier: PotentialTier
  defaultWorkEthic: number
  fame: number
}

// §10 / D-11.C — Balanced-Career creation: an archetype baseline + a 40-point allocation
// + separately-chosen Potential/Work Ethic. Skills start at BALANCED_CREATOR_SKILL_FLOOR;
// OVR is DERIVED from the resulting skills (never an input). Creation ≠ signing (D-11.A).
export type BalancedTalentInput = {
  name: string
  role: CreativeRole
  age: number // 18..70
  actual: Persona
  presetId: string // an ArchetypePreset id
  potentialTier: PotentialTier // player-chosen tradeoff — NOT bought with specialization points
  workEthic: number // player-chosen tradeoff — NOT bought with points
  allocation: {
    // the specialization budget (+1 per authoritative point), total ≤ SPECIALIZATION_POINTS
    skills?: Partial<Record<Discipline, number[]>> // per-skill increments (SKILL_ORDER)
    genre?: Partial<Record<Discipline, Partial<Record<Genre, number>>>> // per-genre increments
  }
}

// ── §7 Forecast types ───────────────────────────────────────────────────────
export type Confidence = 'low' | 'medium' | 'high'
export type ForecastBand = 'weak' | 'mixed' | 'strong' // <40 | 40–70 | >70

// rev. 4 item B14: the ForecastFactorKey union.
export type ForecastFactorKey =
  | 'castFame'
  | 'roleFit'
  | 'directorSkill'
  | 'scriptStrength'
  | 'shapeAffinity'
  | 'segmentTaste'
  | 'culturalTiming'
  | 'unknownLead'
  | 'untestedDirectorGenre'
  | 'noSegmentHistory'
  | 'vaguePromise'

export type SegmentForecast = {
  segmentId: SegmentId
  center: number
  // rev. 4 item M7: the noisy per-segment estimate the studio believes.
  estimate: number
  low: number
  high: number
  expectedBand: ForecastBand
  confidence: Confidence
  causalFactors: ForecastFactorKey[]
  uncertaintyFactors: ForecastFactorKey[]
  // D-12: the fame-saturated OPENING appeal band (=== the linear {center,estimate,low,high} above
  // unless the economy is engaged → byte-identical). Feeds ONLY the opening-reach computation; the
  // linear band above still feeds legs / audience. Lets a live re-forecast reproduce the same
  // saturated opening the greenlight-locked forecast and realized release use (single fame helper).
  opening: { center: number; estimate: number; low: number; high: number }
}

export type Forecast = {
  segments: SegmentForecast[]
  expectedOpening: number
  expectedTotal: number
  expectedCriticScore: number
}

// ── §8 Broadcast types ──────────────────────────────────────────────────────
export type BroadcastFacts = {
  subjectId: string
  filmId?: string
  forecastBand?: ForecastBand
  realizedBand?: ForecastBand
  primaryCause?: 'craft' | 'cohesion' | 'promise' | 'timing' | 'reach'
  direction: 'better' | 'worse' | 'asExpected'
}

export type BroadcastItem = {
  subjectId: string
  topic: 'release' | 'talent' | 'studio' | 'cultural'
  facts: BroadcastFacts
  template: string // canonical, cached in save
  generatedCopy?: string // never in this contract
  tick: number
}

export type CoverageContext = {
  subjectId: string
  previousAngle: 'doubt' | 'praise' | 'neutral'
  previousResult: 'better' | 'worse' | 'asExpected' | null
  lastMentionTick: number
}
