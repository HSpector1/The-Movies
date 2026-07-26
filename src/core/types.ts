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

// Financial ledger (D-11.18). Every cash movement is recorded so payroll never
// "silently disappears into production costs" and cash reconciles:
//   studio.cash === INITIAL_CASH + Σ ledger.amount
// (founding recruitment-fund signing bonuses are the one deliberate exception —
// they draw founding.budget, never cash, and are tracked in founding.spentBonus).
export type LedgerKind =
  | 'production' // negative + marketing debited at greenlight
  | 'boxOffice' // box-office total credited at release
  | 'payroll' // weekly Σ contracted salaries debited at tick
  | 'signingBonus' // operating-phase contract signing bonus debited at signing
  | 'termination' // early-release termination cost debited at release
  | 'freelancerFee' // one-film freelancer fee debited at greenlight

export type LedgerEntry = {
  week: number
  kind: LedgerKind
  amount: number // SIGNED: outflow negative, inflow positive
  talentId?: string
  productionId?: string
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

// The live D-11 state: the frozen V2 shape PLUS the employment surface.
export type GameState = GameStateV2 & {
  founding: FoundingState | null
  contracts: Contract[]
  ledger: LedgerEntry[]
  freeAgents: string[] // ids immediately signable (former employees; expired/released)
}

// §2.6 Actions
export type Action =
  | {
      kind: 'greenlight'
      production: Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'>
    }
  | { kind: 'cancel'; productionId: string }
  | { kind: 'createTalent'; talent: AuthoredTalentInput } // §10
  // ── D-11 employment actions ──
  | { kind: 'foundStudio' } // close the founding draft (minimums must be met)
  | { kind: 'signContract'; talentId: string; termWeeks: number } // sign to studio contract
  | { kind: 'renewContract'; talentId: string; termWeeks: number } // extend during renewal window
  | { kind: 'releaseTalent'; talentId: string } // early release (financial cost only)

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
