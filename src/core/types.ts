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

// §2.2 People
export type Talent = {
  id: string
  name: string
  role: CreativeRole
  age: number
  actual: Persona // natural expressive profile; does NOT represent execution quality
  perceived: Persona // what audiences believe they are
  skill: number // 0..100 — execution quality, independent of `actual`
  fame: number // 0..100
  salary: number // per production
  authored: boolean // true if player-created (§10)
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

export type GameState = {
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

// §2.6 Actions
export type Action =
  | {
      kind: 'greenlight'
      production: Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'>
    }
  | { kind: 'cancel'; productionId: string }
  | { kind: 'createTalent'; talent: AuthoredTalentInput } // §10

// §10 Authored talent
export type AuthoredTalentInput = {
  name: string
  role: CreativeRole
  age: number // 18..70
  actual: Persona // fully player-chosen
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
