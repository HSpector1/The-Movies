# Project: Studio — M0A / M1A Build Contract (rev. 4)

> **AGENT INSTRUCTION — READ FIRST**
>
> Implement **phases 1–4 only** (§12). Stop after producing the M0A report and test results.
> Do not begin UI work, even if all tests pass, until explicitly approved.
>
> Implement as written. If anything here is undefined, contradictory, or unimplementable,
> **stop and report it** — do not resolve it yourself.
>
> §11 lists things not to build. That list is a decision, not an oversight.
>
> **rev. 4** = this document (the rev. 3 text below, unchanged) **plus the normative
> resolutions in `docs/rev4-open-questions.md`** — 56 audited gaps resolved, five
> owner decisions (D-1–D-5) recorded 2026-07-25. Read both before implementing any
> section. Where the two conflict, the resolutions document wins.

---

## 1. Scope

Two harnesses over one engine. **No UI coupling in the core** — no React, no DOM, no async, no I/O below the harness boundary.

- **M0A** — headless. Thousands of isolated film decisions under the exact M1A ruleset. Gates M1A.
- **M1A** — thin UI, same ruleset, human plays the film loop on repeat.

Both are **single-year**. Aging, cultural drift, career progression, and the studio economy are core to the full game and are specified in a later contract. They do not appear here and there is no flag for them — a one-year harness simply never exercises them. Do not add `SimulationFlags`.

---

## 2. Declarations

```ts
type Genre = 'comedy' | 'drama' | 'crime' | 'romance' | 'horror' | 'adventure'
type SegmentId = 'youngAdult' | 'family' | 'adult' | 'prestige'
type CulturalForce = 'escapism' | 'patriotism' | 'realism' | 'darkness' | 'optimism' | 'spectacle'
type CreativeRole = 'writer' | 'director' | 'actor' | 'craft'
type CastSlot = 'lead' | 'antagonist' | 'support'
type Range = [min: number, max: number]

const EPSILON = 1e-6
```

### 2.1 Creative space

Two nominal types, identity mapping for now. Not interchangeable; every conversion goes through the function.

```ts
type Persona = {          // a performer's natural expressive profile.
  warmth: number          // NOT ability. High warmth is "more warm", never "better".
  gravity: number         // all axes -1 .. +1
  physicality: number
}

type Expression = {       // what the work does
  intimacy: number        // -1 .. +1
  tonalWeight: number
  kineticEnergy: number
}

function personaToExpression(p: Persona): Expression {
  return { intimacy: p.warmth, tonalWeight: p.gravity, kineticEnergy: p.physicality }
}

function magnitude(e: Expression): number
function dot(a: Expression, b: Expression): number
function distance(a: Expression, b: Expression): number     // euclidean, 0 .. sqrt(12)
function personaDistance(a: Persona, b: Persona): number    // euclidean, 0 .. sqrt(12)

function safeCosine(a: Expression, b: Expression): number {
  const ma = magnitude(a), mb = magnitude(b)
  if (ma < EPSILON || mb < EPSILON) return 0
  return dot(a, b) / (ma * mb)
}
```

### 2.2 People

```ts
type Talent = {
  id: string
  name: string
  role: CreativeRole
  age: number
  actual: Persona      // natural expressive profile; does NOT represent execution quality
  perceived: Persona   // what audiences believe they are
  skill: number        // 0..100 — execution quality, independent of `actual`
  fame: number         // 0..100
  salary: number       // per production
  authored: boolean    // true if player-created (§10)
}
```

### 2.3 Concept, shape, promise

```ts
type RoleRequirement = { target: Persona; tolerance: number }   // tolerance 0.5 .. 3.0

type FilmConcept = {
  id: string
  title: string
  genre: Genre
  baselineStrength: number                            // 0..100
  originalityRaw: number                              // 0..100
  baseNegativeCost: number                            // currency
  requiredSlots: CastSlot[]
  roleRequirements: Record<CastSlot, RoleRequirement>
}

type FilmShape = {
  opening: 'immediateAction' | 'slowSetup' | 'mysteryHook'
  midpoint: 'reversal' | 'escalation' | 'revelation'
  ending: 'triumph' | 'bittersweet' | 'tragic' | 'ambiguous'
}

type ShapeOption = {
  expression: Expression
  openingReachMod: number      // percentage points
  craftMod: number
  budgetDemandMod: number
  originalityMod: number
  segmentAffinity: Partial<Record<SegmentId, number>>
}

type ShapeEffects = {
  expression: Expression
  openingReachMod: number             // clamped -15 .. +15
  craftMod: number                    // clamped -10 .. +10
  budgetDemandMultiplier: number      // clamped 0.80 .. 1.40
  originalityMod: number              // clamped -15 .. +15
  segmentAffinity: Record<SegmentId, number>   // each clamped -12 .. +12
}

type Promise = {
  genre: Genre
  intendedSegments: SegmentId[]
  ranges: { intimacy: Range; tonalWeight: Range; kineticEnergy: Range }
}

type Budget = { negative: number; marketing: number }
```

### 2.4 Production and result

```ts
type Production = {
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

type FilmResult = {
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
}
```

### 2.5 World and state

```ts
type Standing = {
  audienceAwareness: number       // 0..100
  industryPrestige: number
  commercialConfidence: number
}

type Segment = { id: SegmentId; share: number; taste: Expression }   // shares sum to 1
type CompetingRelease = { marketPressure: number }                   // 0..1

type MarketState = {
  tick: number
  forces: Record<CulturalForce, number>    // 0..100
  segments: Segment[]
  baseMarketValue: number                  // currency
  competingSlate: CompetingRelease[]
}

type EraConfig = {
  soundRequired: boolean
  televisionCompetition: boolean
  censorship: 'none' | 'code' | 'ratings'
  costScale: number
}

type Studio = {
  cash: number
  standing: Standing
  activeProductions: Production[]
  releasedFilms: FilmResult[]
}

type GameState = {
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
```

### 2.6 Actions

```ts
type Action =
  | { kind: 'greenlight';  production: Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'> }
  | { kind: 'cancel';      productionId: string }
  | { kind: 'createTalent'; talent: AuthoredTalentInput }      // §10
```

Late promise repositioning is **not** in this contract. It compared currency against score points and is not needed to validate the film loop.

---

## 3. Actions apply before simulation

```ts
applyActions(state: GameState, actions: Action[]): GameState   // pure; validates, then applies
tick(state: GameState): GameState                              // pure

// Harness and UI both:
state = applyActions(state, agent.chooseActions(state))
state = tick(state)
```

Tick pipeline, fixed order:

```
1. PRODUCTION  advance active productions
2. RELEASE     finished productions enter release
3. RECEPTION   resolve released films (§5)
4. STANDING    update the three channels (§6)
5. BROADCAST   select and render (§8)
```

Upkeep and cultural drift belong to the deferred economy contract and are absent here.

---

## 4. Shape aggregation

Required, and aggregates must be clamped — three stacked options otherwise exceed every individual bound.

```ts
function resolveShape(shape: FilmShape): ShapeEffects {
  const o = [SHAPE_OPTIONS[shape.opening], SHAPE_OPTIONS[shape.midpoint], SHAPE_OPTIONS[shape.ending]]
  return {
    expression: weightedMean([[o[0].expression, 0.30], [o[1].expression, 0.35], [o[2].expression, 0.35]]),
    openingReachMod: clamp(o[0].openingReachMod + 0.50*o[1].openingReachMod + 0.25*o[2].openingReachMod, -15, 15),
    craftMod: clamp(sum(o.map(x => x.craftMod)), -10, 10),
    budgetDemandMultiplier: clamp(product(o.map(x => x.budgetDemandMod)), 0.80, 1.40),
    originalityMod: clamp(sum(o.map(x => x.originalityMod)), -15, 15),
    segmentAffinity: clampEachSegment(sumBySegment(o), -12, 12),
  }
}
```

Seed table (`expression` as i, t, k):

| Option | expression | reach | craft | budget | orig | segmentAffinity |
|---|---|---|---|---|---|---|
| immediateAction | (-0.3, 0.0, +0.8) | +12 | -4 | 1.20 | -5 | youngAdult +8, prestige -6 |
| slowSetup | (+0.7, +0.3, -0.6) | -10 | +7 | 0.90 | +3 | prestige +9, youngAdult -8 |
| mysteryHook | (-0.2, +0.5, -0.1) | +4 | +2 | 1.00 | +6 | adult +7, family -5 |
| reversal | (0.0, +0.3, +0.2) | +2 | +3 | 1.05 | +5 | adult +4 |
| escalation | (-0.1, 0.0, +0.7) | +8 | -2 | 1.15 | -6 | youngAdult +7, prestige -4 |
| revelation | (+0.3, +0.5, -0.3) | -4 | +6 | 0.95 | +7 | prestige +6, family -4 |
| triumph | (+0.6, -0.3, +0.3) | +10 | -5 | 1.00 | -8 | family +10, prestige -8 |
| bittersweet | (+0.5, +0.5, -0.2) | -3 | +5 | 1.00 | +4 | adult +6 |
| tragic | (-0.1, +0.9, -0.1) | -8 | +8 | 1.00 | +6 | prestige +10, family -10 |
| ambiguous | (-0.3, +0.6, -0.4) | -10 | +4 | 0.95 | +10 | prestige +7, youngAdult -6, family -8 |

```ts
// Mean per-axis narrowness. NOT volume — a volume product lets one pinned axis
// plus two fully-vague axes score as maximally specific.
function specificity(p: Promise): number {
  const widths = [
    p.ranges.intimacy[1] - p.ranges.intimacy[0],
    p.ranges.tonalWeight[1] - p.ranges.tonalWeight[0],
    p.ranges.kineticEnergy[1] - p.ranges.kineticEnergy[0],
  ]
  return mean(widths.map(w => 1 - clamp(w / 2, 0, 1)))
}
```

---

## 5. Reception

Seed-deterministic, **not variance-free** (§5.6).

### 5.1 Craft

```ts
scriptStrength    = 0.60*concept.baselineStrength + 0.40*writer.skill        // 0..100
directorExecution = director.skill                                            // 0..100

roleFit(t, req)   = 1 - clamp(personaDistance(t.actual, req.target) / req.tolerance, 0, 1)   // 0..1
castExecution     = Σ_slot CAST_WEIGHT[slot] * (0.60*t.skill + 0.40*100*roleFit)
                    / Σ_slot CAST_WEIGHT[slot]                                // 0..100

technical         = craftIds.length ? mean(skill of craft hires) : 40         // 0..100

requiredNegative  = concept.baseNegativeCost * shapeEffects.budgetDemandMultiplier * era.costScale
budgetAdequacy    = 100 * clamp(budget.negative / requiredNegative, 0, 1.15) / 1.15   // 0..100

craft = clamp(0.30*scriptStrength + 0.25*directorExecution + 0.20*castExecution
            + 0.15*technical + 0.10*budgetAdequacy + shapeEffects.craftMod, 0, 100)
```

`CAST_WEIGHT = { lead: 1.0, antagonist: 0.6, support: 0.35 }`

### 5.2 Contributions and cohesion

Expressive contributors: writer, director, lead, antagonist, support, shape. Craft hires feed `technical` only and have **no vector**.

```ts
// Axis-specific, NOT whole-vector negation. Antagonistic contrast reverses relational
// warmth; it does not reverse tone or kinetics.
const SLOT_TRANSFORM: Record<CastSlot, Expression> = {
  lead:       { intimacy:  1, tonalWeight: 1, kineticEnergy: 1 },
  antagonist: { intimacy: -1, tonalWeight: 1, kineticEnergy: 1 },
  support:    { intimacy:  1, tonalWeight: 1, kineticEnergy: 1 },
}
castContribution(p, slot) = multiplyComponents(personaToExpression(p), SLOT_TRANSFORM[slot])

const ROLE_WEIGHT = { writer: 1.0, director: 1.6, lead: 1.4, antagonist: 0.8, support: 0.5, shape: 1.2 }
centroid = Σ(ROLE_WEIGHT[s] * contribution_s) / Σ(ROLE_WEIGHT[s])     // = `delivered`

directionalAgreement = magnitude(centroid) < CENTROID_MIN_MAGNITUDE
  ? 0
  : Σ(w * safeCosine(c, centroid)) / Σ(w)

expressiveStrength = clamp(mean(contributions.map(magnitude)) / EXPECTED_EXPRESSION, 0, 1)
cohesion = clamp(directionalAgreement, 0, 1) * lerp(EXPRESSION_FLOOR, 1.0, expressiveStrength)
```

Cohesion answers only *does this film feel intentional*.

### 5.3 Critic score

```ts
const FORCE_VECTORS: Record<CulturalForce, Expression> = {   // tuning data
  escapism:   { intimacy:  0.2, tonalWeight: -0.6, kineticEnergy:  0.4 },
  patriotism: { intimacy:  0.1, tonalWeight:  0.5, kineticEnergy:  0.4 },
  realism:    { intimacy:  0.5, tonalWeight:  0.4, kineticEnergy: -0.4 },
  darkness:   { intimacy: -0.3, tonalWeight:  0.8, kineticEnergy:  0.0 },
  optimism:   { intimacy:  0.6, tonalWeight: -0.4, kineticEnergy:  0.1 },
  spectacle:  { intimacy: -0.4, tonalWeight:  0.1, kineticEnergy:  0.9 },
}

forceWeight = Σ_f (forces[f] / 100)
forceAlignment = forceWeight < EPSILON ? 0
  : Σ_f ((forces[f]/100) * safeCosine(delivered, FORCE_VECTORS[f])) / forceWeight    // -1..1

originalityRaw          = clamp(concept.originalityRaw + shapeEffects.originalityMod, 0, 100)
cohesionContribution    = COHESION_CAP * smoothstep(COHESION_SMOOTH_LO, COHESION_SMOOTH_HI, cohesion)
originalityContribution = remap(max(0, originalityRaw - 50), 0, 50, 0, ORIGINALITY_MAX_BONUS) * lerp(0.55, 1.0, cohesion)
                        - remap(max(0, 50 - originalityRaw), 0, 50, 0, DERIVATIVENESS_MAX_PENALTY)
timelinessContribution  = clamp(forceAlignment * 10, -10, 10)

criticMean     = 0.65*craft + cohesionContribution + originalityContribution + timelinessContribution
criticSigma    = CRITIC_SIGMA_BASE + (1 - cohesion) * 3
criticScore    = clamp(gaussian(criticMean, criticSigma, rng), 0, 100)
reviewVariance = criticScore - criticMean
```

### 5.4 Segment appeal

```ts
function distanceOutsideRange(v: number, r: Range): number {
  if (v < r[0]) return r[0] - v
  if (v > r[1]) return v - r[1]
  return 0
}
promiseMismatch = clamp(sqrt(Σ_axis square(distanceOutsideRange(delivered[axis], promise.ranges[axis]))) / sqrt(12), 0, 1)
mismatchPenalty = specificity(promise) * promiseMismatch * PROMISE_PENALTY_MAX

starDraw   = 100 * clamp(Σ_slot CAST_WEIGHT[slot] * (t.fame/100) / Σ CAST_WEIGHT, 0, 1)
segmentFit = 100 * (1 - clamp(distance(delivered, segment.taste) / sqrt(12), 0, 1))

segmentAppeal(s) = clamp(
    0.35*craft + 0.25*starDraw + 0.25*segmentFit(s) + 0.15*(timelinessContribution*5)
  + shapeEffects.segmentAffinity[s] - mismatchPenalty, 0, 100)
```

### 5.5 Box office

Marketing raises **awareness**, not appeal. "People understood the campaign" is not "people liked the film."

```ts
marketingQuality   = budget.marketing / (budget.marketing + MARKETING_HALF_SATURATION)   // 0..1
baseAwareness      = clamp(0.6*(standing.audienceAwareness/100) + 0.4*marketingQuality, 0, 1)
awarenessFactor    = clamp(baseAwareness * (1 + specificity(promise)*marketingQuality*PROMISE_MAX_BONUS/100), 0, 1)

appealCurve(a)     = pow(a/100, APPEAL_CURVE_EXP)
openingReachMult   = 1 + shapeEffects.openingReachMod / 100         // 0.85 .. 1.15

// M0A: competition is DISABLED. competitionFactor() returns 1.0 and competingSlate is empty.
competitionFactor  = 1.0

opening = baseMarketValue
        * Σ_s (segment.share * awarenessFactor * appealCurve(segmentAppeal(s)))
        * openingReachMult * competitionFactor

weightedAudienceScore = Σ_s (segment.share * segmentAppeal(s))
legs  = LEGS_MIN + (LEGS_MAX - LEGS_MIN) * (weightedAudienceScore / 100)
total = opening * legs
```

### 5.6 Determinism

Seed-deterministic, not variance-free. The autopsy must expose `criticMean`, `criticSigma`, `reviewVariance`. No random modifier may be applied after resolution or omitted from the breakdown. Do not remove the sampled term to make outcomes "clean."

---

## 6. Standing

```ts
const INITIAL_STANDING: Standing = { audienceAwareness: 40, industryPrestige: 40, commercialConfidence: 50 }

type ReleaseBenchmarks = { expectedOpening: number; expectedTotal: number; expectedCriticScore: number }
// Benchmarks derive from the forecast snapshot, not from realized results.

function updateStanding(standing: Standing, r: FilmResult, b: ReleaseBenchmarks): Standing {
  const commercialSurprise = clamp((r.boxOffice.total - b.expectedTotal) / max(b.expectedTotal, 1), -1, 1)
  const awarenessDelta  = clamp(6*commercialSurprise + 2*normalizedStarAttention(r), -8, 8)
  const prestigeDelta   = clamp((r.criticScore - 60) / 8, -7, 7)
  const confidenceDelta = clamp(5*commercialSurprise - 2*normalizedBudgetOverrun(r), -8, 8)
  return {
    audienceAwareness:    clamp(standing.audienceAwareness + awarenessDelta, 0, 100),
    industryPrestige:     clamp(standing.industryPrestige + prestigeDelta, 0, 100),
    commercialConfidence: clamp(standing.commercialConfidence + confidenceDelta, 0, 100),
  }
}

normalizedStarAttention(r)  = clamp(mean cast fame / 100, 0, 1)
normalizedBudgetOverrun(r)  = clamp((actualNegative - requiredNegative) / max(requiredNegative,1), 0, 1)
```

The three channels must move on **different** causes. That is the point of §9's differentiation gate.

---

## 7. Forecast

Computed at greenlight from **greenlight-available information only**. It must not reference realized scores.

```ts
type Confidence = 'low' | 'medium' | 'high'
type ForecastBand = 'weak' | 'mixed' | 'strong'      // <40 | 40–70 | >70

type SegmentForecast = {
  segmentId: SegmentId
  center: number; low: number; high: number
  expectedBand: ForecastBand
  confidence: Confidence
  causalFactors: ForecastFactorKey[]
  uncertaintyFactors: ForecastFactorKey[]
}
type Forecast = { segments: SegmentForecast[]; expectedOpening: number; expectedTotal: number; expectedCriticScore: number }

const FORECAST_SIGMA = { high: 5, medium: 10, low: 16 }
const CONFIDENCE_INTERVAL_WIDTH = { high: 8, medium: 15, low: 24 }

// Deterministic estimate from known quantities: craft inputs, cast fame, promise, shape,
// segment tastes, current forces. Uses the §5 pipeline with no sampled terms.
forecastCenter   = expectedSegmentAppealAtGreenlight(production, market, talent)
forecastEstimate = forecastCenter + gaussian(0, FORECAST_SIGMA[confidence], rng)
low  = clamp(forecastEstimate - CONFIDENCE_INTERVAL_WIDTH[confidence], 0, 100)
high = clamp(forecastEstimate + CONFIDENCE_INTERVAL_WIDTH[confidence], 0, 100)

confidencePoints = knownLeadTrackRecord + knownDirectorGenreRecord + establishedSegmentHistory + promiseIsSpecific
confidence = confidencePoints >= 3 ? 'high' : confidencePoints >= 2 ? 'medium' : 'low'
```

Calibration test: `realizedSegmentScore` falls within `[low, high]`.

---

## 8. Broadcast (minimal deterministic core)

Required in phase 4 — the replay test depends on it. Full presentation is deferred.

```ts
type BroadcastFacts = {
  subjectId: string
  filmId?: string
  forecastBand?: ForecastBand
  realizedBand?: ForecastBand
  primaryCause?: 'craft' | 'cohesion' | 'promise' | 'timing' | 'reach'
  direction: 'better' | 'worse' | 'asExpected'
}
type BroadcastItem = {
  subjectId: string
  topic: 'release' | 'talent' | 'studio' | 'cultural'
  facts: BroadcastFacts
  template: string          // canonical, cached in save
  generatedCopy?: string    // never in this contract
  tick: number
}
type CoverageContext = {
  subjectId: string
  previousAngle: 'doubt' | 'praise' | 'neutral'
  previousResult: 'better' | 'worse' | 'asExpected' | null
  lastMentionTick: number
}
```

All ranking factors normalize 0..1:

```ts
magnitude  = clamp(abs(realized - forecastCenter) / 50, 0, 1)
prominence = clamp(subjectFameOrStanding / 100, 0, 1)
novelty    = 1 - (matching items in last BROADCAST_WINDOW ticks) / BROADCAST_WINDOW
cooldown   = exp(-mentionsInWindow * BROADCAST_COOLDOWN_K)
editorialRelevance = release  → mean(audienceAwareness, commercialConfidence)/100
                   | talent   → industryPrestige/100
                   | studio   → mean(all three)/100
                   | cultural → 1

rankScore = magnitude * editorialRelevance * prominence * novelty * cooldown
air       = rankScore >= BROADCAST_THRESHOLD
```

Threshold, not top-N — some ticks produce nothing. Phase 4 needs **two crude templates** (release-better, release-worse). No LLM in this contract at all.

---

## 9. World generation

Seeded and reproducible, or the instrumentation measures the generator rather than the mechanics.

```ts
const WORLD_CONFIG = { talentCount: 60, conceptCount: 30, marketValueRange: [20_000_000, 80_000_000] }

talent.actual axes        ~ uniform(-1, 1)
talent.perceived axes     ~ clamp(actual + normal(0, 0.25), -1, 1)
talent.skill              ~ truncatedNormal(60, 15, 20, 95)
talent.fame               ~ truncatedNormal(40, 22, 0, 95)
talent.age                ~ truncatedNormal(38, 10, 20, 70)
talent.salary             = salaryCurve(skill, fame)
concept.baselineStrength  ~ truncatedNormal(60, 15, 20, 95)
concept.originalityRaw    ~ truncatedNormal(55, 20, 5, 100)
concept.roleRequirements  target ~ uniform(-1,1); tolerance ~ uniform(0.8, 1.8)
segment shares            = fixed: youngAdult .30, family .25, adult .30, prestige .15
segment tastes            = fixed seed table
forces                    = fixed neutral baseline (all 50)
studio.standing           = INITIAL_STANDING
market.baseMarketValue    ~ uniform(marketValueRange)
```

---

## 10. Authored talent

The player may create talent. **Persona is authored; capability is earned.**

```ts
type AuthoredTalentInput = {
  name: string
  role: CreativeRole
  age: number              // 18..70
  actual: Persona          // fully player-chosen
}
```

On creation: `perceived = actual`, `skill = AUTHORED_START_SKILL`, `fame = AUTHORED_START_FAME`, `salary = salaryCurve(...)`, `authored = true`.

The player never sets `skill` or `fame`. Authored talent begins as an unknown and becomes valuable only through being cast and performing. This preserves the scarcity that makes casting a decision — self-authored optimal stars would dissolve it.

Instrumentation must report authored-talent usage separately so their effect on balance is visible.

---

## 11. Explicit non-goals

Do not build, scaffold, or abstract for: chemistry, readable memories, production incidents, contract negotiation, the lot, rival studios as agents, awards season, scene composition, screenplay generation, visual output, library economics, receivership, `SimulationFlags`, the studio economy, cultural drift, aging and career progression, late promise repositioning, competition modelling, LLM integration of any kind, onboarding, tutorial, accessibility, mobile layout.

If one appears necessary for M0A or M1A to work, **report it as a finding**.

---

## 12. Build order

1. Declarations, `TUNING`, seeded RNG, save validation
2. Reception (§5) and forecast (§7) pipelines, unit test per bounded term
3. `applyActions` / `tick`, world generation (§9), RandomAgent + OracleAgent (§13)
4. Instrumentation (§14) + minimal deterministic Broadcast core (§8) — **STOP. Produce the report and test results.**
5. *(requires approval)* M1A UI: concept → shape → promise → cast → budget → release → autopsy, plus the talent creator
6. *(requires approval)* Broadcast presentation and the prediction → result → revision cycle

---

## 13. Agents and the decision grid

The action space must be finite or neither agent is well-defined.

```ts
const NEGATIVE_BUDGET_MULTIPLIERS = [0.75, 1.0, 1.25]
const MARKETING_BUDGET_LEVELS = [100_000, 400_000, 1_000_000]
const PROMISE_WIDTHS  = [0.4, 0.8, 1.4, 2.0]
const PROMISE_CENTERS = [-0.75, -0.25, 0.25, 0.75]
rangeFrom(center, width) = [clamp(center - width/2, -1, 1), clamp(center + width/2, -1, 1)]

const CANDIDATE_CONFIG = {
  maxWritersPerConcept: 5, maxDirectorsPerConcept: 5,
  maxActorsPerSlot: 8, maxPackagesPerDecision: 500,
}
```

Both agents draw from the **same** generated candidate package set.

- **RandomAgent** — uniform over candidates. Coverage, reachability, boundedness.
- **OracleAgent** — scores candidates by expected value with variance excluded. Explicitly omniscient. Dominance and concentration only.

---

## 14. Instrumentation

Report over ≥1,000 seeded runs. Not a CSV.

| Flag | Agent | Condition |
|---|---|---|
| Choice dominance | Oracle | one option wins >60% of comparable decisions with margin >15 |
| Strategy concentration | Oracle | >70% of films share promise axis signs, budget level, and top-forecast cast |
| Dead cultural state | Oracle | of 500 sampled packages, none has expected profit ≥ 0 |
| Standing differentiation | Both | **fewer than 3 of 4 asymmetric profiles occur** (hard fail) |
| Standing correlation | Both | pairwise >0.9 (warning only) |
| Forecast calibration | Both | high-confidence outside 80–90%; low outside 55–65% |
| Casting diversity | Random | <25% of talent pool ever cast |
| Authored-talent effect | Both | authored talent appears in >50% of Oracle-optimal packages |

Asymmetric profiles: high prestige/low awareness, high awareness/low prestige, high confidence/low prestige, low confidence/high awareness.

---

## 15. Acceptance tests

1. **Bounds.** Every term stays in range across 1,000 runs.
2. **Four quadrants.** uniform+dull, varied+structured, talented+contradictory, uniform+capable all producible and distinguishable. If uniform+dull cannot exist, cohesion is swallowing craft.
3. **Neutral stacking.** Six `{0,0,0}` contributors score ≤ `COHESION_CAP * 0.5`, no NaN anywhere.
4. **Promise.** precise-and-met > vague > precise-and-missed.
5. **Slot transform.** Antagonist contribution equals `personaToExpression(p)` with intimacy negated and other axes unchanged. *(Tests the specified transform only — a warm antagonist may be perfectly coherent as a charming manipulator.)*
6. **Forecast independence.** The forecast pipeline must produce identical output when realized-score computation is stubbed out. Any dependence on release-time results is a failure.
7. **Replay.** Same seed + same actions → byte-identical state and Broadcast copy.

---

## 16. Tuning

```ts
export const TUNING = {
  COHESION_CAP: 16, COHESION_SMOOTH_LO: 0.35, COHESION_SMOOTH_HI: 0.85,
  EXPECTED_EXPRESSION: 0.55, EXPRESSION_FLOOR: 0.65, CENTROID_MIN_MAGNITUDE: 0.15,
  CRITIC_SIGMA_BASE: 4, ORIGINALITY_MAX_BONUS: 12, DERIVATIVENESS_MAX_PENALTY: 4,
  PROMISE_MAX_BONUS: 12, PROMISE_PENALTY_MAX: 18,
  MARKETING_HALF_SATURATION: 400_000, APPEAL_CURVE_EXP: 1.8,
  LEGS_MIN: 1.8, LEGS_MAX: 4.0,
  AUTHORED_START_SKILL: 35, AUTHORED_START_FAME: 5,
  BROADCAST_THRESHOLD: 0.45, BROADCAST_COOLDOWN_K: 0.7, BROADCAST_WINDOW: 6,
}
```

---

## 17. Save format

```ts
type SaveFileV1 = { saveVersion: 1; seed: string; state: GameState; broadcastCache: BroadcastItem[] }
```

Version validation, loud rejection of unknown versions, JSON export/import. **No migration functions yet** — a 1→2 migration cannot be tested before version 2 exists.
