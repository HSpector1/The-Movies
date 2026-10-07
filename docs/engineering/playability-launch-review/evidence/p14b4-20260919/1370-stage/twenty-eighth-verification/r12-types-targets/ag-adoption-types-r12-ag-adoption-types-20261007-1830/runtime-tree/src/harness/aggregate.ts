// ── M0A §14 aggregator ────────────────────────────────────────────────────────
// Streaming aggregation of RunRecords into the eight §14 flags, the §15.1 corpus
// bounds, the §15.2 four-quadrant cells, and the confidence-tier distribution.
// Each RunRecord is folded in once (add) and the final verdicts are computed at
// the end (finalize) — the corpus need not hold all 2000 runs' full detail in one
// array (the caller streams records through this accumulator; only summary-level
// state lives here).
//
// Every flag's threshold is the rev. 4 operational definition, verbatim. No
// threshold is softened. Only Standing differentiation (D-2) is completion-
// blocking (N9); Standing correlation is a WARNING; the other six are report lines.

import { TUNING } from '../core/index.js'
import type { Confidence } from '../core/index.js'
import type { RunRecord, ReleaseRecord, OracleDecisionRecord, AgentName } from './run-driver.js'
import {
  PearsonAccumulator,
  BoundTracker,
  quadrantOf,
  profilesOccurring,
  STANDING_PROFILES,
  concentrationTuple,
  type QuadrantCell,
  type StandingProfileKey,
} from './measure.js'

// The confidence tiers, in a fixed order for stable reporting.
const TIERS: readonly Confidence[] = ['high', 'medium', 'low'] as const

// ── Flag verdict ──────────────────────────────────────────────────────────────
export type Verdict = 'PASS' | 'FAIL' | 'WARNING'

export type FlagResult = {
  name: string
  agentScope: string
  verdict: Verdict
  // The single determining statistic (or smallest set), as a machine object.
  statistic: Record<string, unknown>
  // Example reproduction seeds for a failure (empty when PASS).
  exampleSeeds: string[]
  // Free-text note (clause reference / caveats such as LOW SAMPLE).
  note: string
}

// ── The accumulator ───────────────────────────────────────────────────────────
export class CorpusAggregator {
  // Run counts.
  private runCountByAgent: Record<AgentName, number> = { random: 0, oracle: 0 }

  // ── B25 choice dominance (Oracle) ──────────────────────────────────────────
  // Per strategy signature: decisions won, and the running sum of (chosenROI −
  // bestOffSignatureROI) in ROI points over won decisions where BOTH are ROI-
  // eligible. Also track total comparable decisions.
  private sigWins = new Map<string, number>()
  private sigMarginSum = new Map<string, number>() // sum of margin (ROI points) over won-and-eligible decisions
  private sigMarginCount = new Map<string, number>() // count of won-and-eligible decisions
  private totalOracleDecisions = 0
  // Example seed per signature (first decision that signature won).
  private sigExampleSeed = new Map<string, string>()

  // ── B26 strategy concentration (Oracle) ────────────────────────────────────
  private concentrationCounts = new Map<string, number>()
  private oracleFilmCount = 0
  private concentrationExampleSeed = new Map<string, string>()

  // ── B27 dead cultural state (Oracle) ───────────────────────────────────────
  private oracleRuns = 0
  private oracleDeadRuns = 0
  private deadExampleSeeds: string[] = []

  // ── D-2 standing differentiation (BOTH, pooled) ────────────────────────────
  private pooledRunOutcomes = 0
  private profileOccurrences: Record<StandingProfileKey, number> = {
    prestigeHigh_awarenessLow: 0,
    awarenessHigh_prestigeLow: 0,
    confidenceHigh_prestigeLow: 0,
    confidenceLow_awarenessHigh: 0,
  }
  private profileExampleSeed: Partial<Record<StandingProfileKey, string>> = {}

  // ── M6 standing correlation (BOTH, per agent) ──────────────────────────────
  private pearson: Record<AgentName, { ap: PearsonAccumulator; ac: PearsonAccumulator; pc: PearsonAccumulator }> = {
    random: { ap: new PearsonAccumulator(), ac: new PearsonAccumulator(), pc: new PearsonAccumulator() },
    oracle: { ap: new PearsonAccumulator(), ac: new PearsonAccumulator(), pc: new PearsonAccumulator() },
  }

  // ── M8 forecast calibration (BOTH, pooled, by tier) ────────────────────────
  private tierForecastCount: Record<Confidence, number> = { high: 0, medium: 0, low: 0 }
  private tierCoveredCount: Record<Confidence, number> = { high: 0, medium: 0, low: 0 }
  // Example seed of a released film in a tier whose coverage misses (for repro).
  private calibrationExampleSeed: Partial<Record<Confidence, string>> = {}

  // ── M17 casting diversity (Random gate; Oracle for contrast) ───────────────
  private castingFractions: Record<AgentName, number[]> = { random: [], oracle: [] }

  // ── §15.1 corpus bounds ────────────────────────────────────────────────────
  private bounds: BoundTracker[] = [
    new BoundTracker({ name: 'craft', min: 0, max: 100 }),
    new BoundTracker({ name: 'cohesion', min: 0, max: 1 }),
    new BoundTracker({ name: 'criticScore', min: 0, max: 100 }),
    new BoundTracker({ name: 'segmentScore(realized)', min: 0, max: 100 }),
    new BoundTracker({ name: 'weightedAudienceScore', min: 0, max: 100 }),
    new BoundTracker({ name: 'forecast.low', min: 0, max: 100 }),
    new BoundTracker({ name: 'forecast.high', min: 0, max: 100 }),
    new BoundTracker({ name: 'forecast.estimate', min: 0, max: 100 }),
    new BoundTracker({ name: 'forecast.center', min: 0, max: 100 }),
  ]
  private boundByName = new Map<string, BoundTracker>()

  // ── §15.2 four-quadrant cells ──────────────────────────────────────────────
  private quadrantCounts: Record<QuadrantCell, number> = {
    lowCraft_lowCohesion: 0,
    lowCraft_highCohesion: 0,
    highCraft_lowCohesion: 0,
    highCraft_highCohesion: 0,
  }
  private quadrantExampleSeed: Partial<Record<QuadrantCell, string>> = {}

  // Self-check: total Oracle argmax divergences across the corpus (must be 0).
  private oracleArgmaxDivergences = 0

  // Total released films (context).
  private totalReleases = 0

  constructor() {
    for (const b of this.bounds) this.boundByName.set(b.spec.name, b)
  }

  // ── Fold one RunRecord in ───────────────────────────────────────────────────
  add(run: RunRecord): void {
    this.runCountByAgent[run.agent] += 1

    // ── D-2 (pooled across both agents) ───────────────────────────────────────
    this.pooledRunOutcomes += 1
    const occurring = profilesOccurring(run.endStanding)
    for (const key of STANDING_PROFILES) {
      if (occurring.has(key)) {
        this.profileOccurrences[key] += 1
        if (this.profileExampleSeed[key] === undefined) this.profileExampleSeed[key] = run.seed
      }
    }

    // ── B27 dead cultural state (Oracle rows only per §14) ────────────────────
    // deadAtTick0 is agent-independent, but the §14 flag is scoped to the Oracle
    // corpus — count it once per Oracle run.
    if (run.agent === 'oracle') {
      this.oracleRuns += 1
      if (run.deadAtTick0) {
        this.oracleDeadRuns += 1
        if (this.deadExampleSeeds.length < 5) this.deadExampleSeeds.push(run.seed)
      }
    }

    // ── M17 casting diversity ─────────────────────────────────────────────────
    const fraction = run.actorsEverCast / run.actorPoolSize
    this.castingFractions[run.agent].push(fraction)

    // ── Per-release folds (M6, M8, §15.1, §15.2) ──────────────────────────────
    for (const rel of run.releases) {
      this.foldRelease(run, rel)
    }

    // ── Oracle decision folds (B25, B26, self-check) ──────────────────────────
    if (run.agent === 'oracle') {
      this.oracleArgmaxDivergences += run.oracleArgmaxDivergences
      for (const dec of run.oracleDecisions) {
        this.foldOracleDecision(run, dec)
      }
    }
  }

  private foldRelease(run: RunRecord, rel: ReleaseRecord): void {
    this.totalReleases += 1

    // §15.1 bounds.
    this.boundByName.get('craft')!.observe(rel.craft, run.seed, run.agent)
    this.boundByName.get('cohesion')!.observe(rel.cohesion, run.seed, run.agent)
    this.boundByName.get('criticScore')!.observe(rel.criticScore, run.seed, run.agent)
    this.boundByName.get('weightedAudienceScore')!.observe(rel.weightedAudienceScore, run.seed, run.agent)
    for (const seg of rel.segments) {
      this.boundByName.get('segmentScore(realized)')!.observe(seg.realized, run.seed, run.agent)
      this.boundByName.get('forecast.low')!.observe(seg.low, run.seed, run.agent)
      this.boundByName.get('forecast.high')!.observe(seg.high, run.seed, run.agent)
      this.boundByName.get('forecast.estimate')!.observe(seg.estimate, run.seed, run.agent)
      this.boundByName.get('forecast.center')!.observe(seg.center, run.seed, run.agent)
    }

    // §15.2 quadrant.
    const cell = quadrantOf(rel.craft, rel.cohesion)
    this.quadrantCounts[cell] += 1
    if (this.quadrantExampleSeed[cell] === undefined) this.quadrantExampleSeed[cell] = run.seed

    // M6 per-release delta triple (per agent).
    const p = this.pearson[run.agent]
    p.ap.add(rel.deltaAwareness, rel.deltaPrestige)
    p.ac.add(rel.deltaAwareness, rel.deltaConfidence)
    p.pc.add(rel.deltaPrestige, rel.deltaConfidence)

    // M8 forecast calibration (pooled, by tier). Population = every SegmentForecast;
    // realized inside [low, high] counts as covered.
    const tier = rel.confidence
    for (const seg of rel.segments) {
      this.tierForecastCount[tier] += 1
      const covered = seg.realized >= seg.low && seg.realized <= seg.high
      if (covered) this.tierCoveredCount[tier] += 1
      else if (this.calibrationExampleSeed[tier] === undefined) this.calibrationExampleSeed[tier] = run.seed
    }
  }

  private foldOracleDecision(run: RunRecord, dec: OracleDecisionRecord): void {
    this.totalOracleDecisions += 1
    this.oracleFilmCount += 1

    // B25 signature wins + margin.
    this.sigWins.set(dec.chosenSignature, (this.sigWins.get(dec.chosenSignature) ?? 0) + 1)
    if (this.sigExampleSeed.get(dec.chosenSignature) === undefined) {
      this.sigExampleSeed.set(dec.chosenSignature, run.seed)
    }
    // Margin (ROI points) is defined over decisions the leading signature won; we
    // accumulate per-signature so any signature that turns out to lead has its
    // margin ready. Only add a margin sample when BOTH chosen ROI and best off-
    // signature ROI are ROI-eligible (D-1 excludes sub-floor cost from ROI stats).
    if (dec.chosenROI !== null && dec.bestOffSignatureROI !== null) {
      const marginPts = (dec.chosenROI - dec.bestOffSignatureROI) * 100
      this.sigMarginSum.set(
        dec.chosenSignature,
        (this.sigMarginSum.get(dec.chosenSignature) ?? 0) + marginPts,
      )
      this.sigMarginCount.set(
        dec.chosenSignature,
        (this.sigMarginCount.get(dec.chosenSignature) ?? 0) + 1,
      )
    }

    // B26 concentration tuple.
    const tuple = concentrationTuple({
      promiseSignVector: dec.chosenPromiseSignVector,
      negativeLevel: dec.chosenNegativeLevel,
      marketingLevel: dec.chosenMarketingLevel,
      topForecastCast: dec.topForecastCast,
    })
    this.concentrationCounts.set(tuple, (this.concentrationCounts.get(tuple) ?? 0) + 1)
    if (this.concentrationExampleSeed.get(tuple) === undefined) {
      this.concentrationExampleSeed.set(tuple, run.seed)
    }
  }

  // ── Finalize into the eight flags + §15 + tier distribution ─────────────────
  finalize(): AggregateSummary {
    return {
      runCounts: { ...this.runCountByAgent },
      totalReleases: this.totalReleases,
      totalOracleDecisions: this.totalOracleDecisions,
      oracleArgmaxSelfCheck: {
        divergences: this.oracleArgmaxDivergences,
        pass: this.oracleArgmaxDivergences === 0,
      },
      flags: [
        this.flagChoiceDominance(),
        this.flagStrategyConcentration(),
        this.flagDeadCulturalState(),
        this.flagStandingDifferentiation(),
        this.flagStandingCorrelation(),
        this.flagForecastCalibration(),
        this.flagCastingDiversity(),
        this.flagAuthoredTalent(),
      ],
      bounds: this.bounds.map((b) => ({
        name: b.spec.name,
        min: b.spec.min,
        max: b.spec.max,
        observedMin: b.count > 0 ? b.observedMin : null,
        observedMax: b.count > 0 ? b.observedMax : null,
        count: b.count,
        inRange: b.inRange,
        firstViolation:
          b.firstViolationSeed === null
            ? null
            : { seed: b.firstViolationSeed, agent: b.firstViolationAgent, value: b.firstViolationValue },
      })),
      quadrants: {
        cells: { ...this.quadrantCounts },
        examples: { ...this.quadrantExampleSeed },
        allNonEmpty: Object.values(this.quadrantCounts).every((c) => c > 0),
      },
      tierDistribution: this.tierDistribution(),
    }
  }

  // ── Flag 1: B25 choice dominance (Oracle) ──────────────────────────────────
  private flagChoiceDominance(): FlagResult {
    // Leading signature = most wins.
    let leadSig = ''
    let leadWins = 0
    for (const [sig, wins] of this.sigWins) {
      if (wins > leadWins) {
        leadWins = wins
        leadSig = sig
      }
    }
    const total = this.totalOracleDecisions
    const winShare = total > 0 ? leadWins / total : 0
    // Margin = mean over the decisions the leading signature won of (chosenROI −
    // best off-signature ROI), in ROI percentage points. Uses only won-and-ROI-
    // eligible decisions (D-1 floor exclusion).
    const marginSum = this.sigMarginSum.get(leadSig) ?? 0
    const marginCount = this.sigMarginCount.get(leadSig) ?? 0
    const margin = marginCount > 0 ? marginSum / marginCount : null

    // FLAG if winShare > 0.60 AND margin > 15.
    const fires = winShare > 0.6 && margin !== null && margin > 15
    return {
      name: 'Choice dominance (B25)',
      agentScope: 'Oracle',
      verdict: fires ? 'FAIL' : 'PASS',
      statistic: {
        leadingSignature: leadSig || null,
        leadWins,
        totalDecisions: total,
        winShare: round(winShare, 4),
        marginROIpoints: margin === null ? null : round(margin, 3),
        marginSampleCount: marginCount,
        thresholds: { winShare: '>0.60', margin: '>15' },
      },
      exampleSeeds: fires ? seedList(this.sigExampleSeed.get(leadSig)) : [],
      note:
        'D-1 ROI = profit/(negative+marketing+salaries); sub-floor cost (<ROI_COST_FLOOR=' +
        `${TUNING.ROI_COST_FLOOR}) excluded from ROI stats. Margin over won-and-ROI-eligible decisions.`,
    }
  }

  // ── Flag 2: B26 strategy concentration (Oracle) ────────────────────────────
  private flagStrategyConcentration(): FlagResult {
    let maxTuple = ''
    let maxFreq = 0
    for (const [tuple, freq] of this.concentrationCounts) {
      if (freq > maxFreq) {
        maxFreq = freq
        maxTuple = tuple
      }
    }
    const films = this.oracleFilmCount
    const share = films > 0 ? maxFreq / films : 0
    const fires = share > 0.7
    return {
      name: 'Strategy concentration (B26)',
      agentScope: 'Oracle',
      verdict: fires ? 'FAIL' : 'PASS',
      statistic: {
        oracleFilms: films,
        maxIdenticalTupleFreq: maxFreq,
        share: round(share, 4),
        threshold: '>0.70',
      },
      exampleSeeds: fires ? seedList(this.concentrationExampleSeed.get(maxTuple)) : [],
      note: 'Tuple = (promise axis signs, (negativeLevel,marketingLevel), top-forecast cast triple).',
    }
  }

  // ── Flag 3: B27 dead cultural state (Oracle) ───────────────────────────────
  private flagDeadCulturalState(): FlagResult {
    const runs = this.oracleRuns
    const deadFraction = runs > 0 ? this.oracleDeadRuns / runs : 0
    const fires = deadFraction > 0.5
    return {
      name: 'Dead cultural state (B27)',
      agentScope: 'Oracle',
      verdict: fires ? 'FAIL' : 'PASS',
      statistic: {
        oracleRuns: runs,
        deadRuns: this.oracleDeadRuns,
        deadFraction: round(deadFraction, 4),
        threshold: '>0.50',
      },
      exampleSeeds: fires ? this.deadExampleSeeds.slice() : [],
      note: 'Per run: tick 0 (INITIAL_STANDING, neutral forces), 500 packages; dead iff no package has expected profit ≥ 0.',
    }
  }

  // ── Flag 4: D-2 standing differentiation (BOTH, HARD FAIL) ──────────────────
  private flagStandingDifferentiation(): FlagResult {
    const denom = this.pooledRunOutcomes
    const rates: Record<StandingProfileKey, number> = {} as Record<StandingProfileKey, number>
    let reached = 0
    const failingExamples: string[] = []
    for (const key of STANDING_PROFILES) {
      const rate = denom > 0 ? this.profileOccurrences[key] / denom : 0
      rates[key] = round(rate, 4)
      if (rate >= 0.05) reached += 1
    }
    // HARD FAIL if fewer than 3 of the 4 profiles reach 5%.
    const fires = reached < 3
    // For a failure, list the seeds of the profiles that DID occur (repro anchors)
    // — the below-threshold ones are the diagnostic, so include any example seeds.
    if (fires) {
      for (const key of STANDING_PROFILES) {
        const s = this.profileExampleSeed[key]
        if (s !== undefined) failingExamples.push(`${key}:${s}`)
      }
    }
    return {
      name: 'Standing differentiation (D-2)',
      agentScope: 'Both (pooled)',
      verdict: fires ? 'FAIL' : 'PASS',
      statistic: {
        pooledRunOutcomes: denom,
        occurrenceRates: rates,
        profilesReaching5pct: reached,
        threshold: 'at least 3 of 4 profiles ≥ 5% (else HARD FAIL)',
        hardFail: true,
      },
      exampleSeeds: failingExamples,
      note: 'THE ONLY completion-blocking flag (N9). High = ≥60, low = ≤40 at end of run; occurrence floor 5% pooled across both agents.',
    }
  }

  // ── Flag 5: M6 standing correlation (BOTH, WARNING) ────────────────────────
  private flagStandingCorrelation(): FlagResult {
    const perAgent: Record<string, { awarenessPrestige: number | null; awarenessConfidence: number | null; prestigeConfidence: number | null; sampleCount: number }> = {}
    let anyExceeds = false
    for (const agent of ['random', 'oracle'] as AgentName[]) {
      const p = this.pearson[agent]
      const ap = p.ap.correlation()
      const ac = p.ac.correlation()
      const pc = p.pc.correlation()
      perAgent[agent] = {
        awarenessPrestige: ap === null ? null : round(ap, 4),
        awarenessConfidence: ac === null ? null : round(ac, 4),
        prestigeConfidence: pc === null ? null : round(pc, 4),
        sampleCount: p.ap.count,
      }
      for (const r of [ap, ac, pc]) {
        if (r !== null && Math.abs(r) > 0.9) anyExceeds = true
      }
    }
    return {
      name: 'Standing correlation (M6)',
      agentScope: 'Both (per agent)',
      verdict: anyExceeds ? 'WARNING' : 'PASS',
      statistic: { perAgent, threshold: '|r| > 0.9 → WARNING' },
      exampleSeeds: [],
      note: 'Pearson over per-release delta triples (Δaware, Δprestige, Δconf), pooled per agent. WARNING only (N9).',
    }
  }

  // ── Flag 6: M8 forecast calibration (BOTH) ─────────────────────────────────
  private flagForecastCalibration(): FlagResult {
    const totalForecasts = this.tierForecastCount.high + this.tierForecastCount.medium + this.tierForecastCount.low
    const coverage: Record<Confidence, { count: number; covered: number; coverage: number | null; share: number; lowSample: boolean }> = {} as Record<Confidence, { count: number; covered: number; coverage: number | null; share: number; lowSample: boolean }>
    for (const tier of TIERS) {
      const count = this.tierForecastCount[tier]
      const covered = this.tierCoveredCount[tier]
      const share = totalForecasts > 0 ? count / totalForecasts : 0
      coverage[tier] = {
        count,
        covered,
        coverage: count > 0 ? round(covered / count, 4) : null,
        share: round(share, 4),
        lowSample: share < 0.05,
      }
    }
    // FLAG if high outside 80–90 OR low outside 55–65 (bands are % → 0.80–0.90,
    // 0.55–0.65). A LOW SAMPLE tier's coverage is noise, not a pass/fail — do not
    // fire on a low-sample tier.
    const highCov = coverage.high.coverage
    const lowCov = coverage.low.coverage
    const highOut =
      !coverage.high.lowSample && highCov !== null && (highCov < 0.8 || highCov > 0.9)
    const lowOut = !coverage.low.lowSample && lowCov !== null && (lowCov < 0.55 || lowCov > 0.65)
    const fires = highOut || lowOut
    const examples: string[] = []
    if (highOut && this.calibrationExampleSeed.high !== undefined) examples.push(`high:${this.calibrationExampleSeed.high}`)
    if (lowOut && this.calibrationExampleSeed.low !== undefined) examples.push(`low:${this.calibrationExampleSeed.low}`)
    return {
      name: 'Forecast calibration (M8)',
      agentScope: 'Both (pooled)',
      verdict: fires ? 'FAIL' : 'PASS',
      statistic: {
        coverageByTier: coverage,
        bands: { high: '80–90%', medium: '65–75%', low: '55–65%' },
        gate: 'high outside 80–90 OR low outside 55–65 (LOW SAMPLE tiers exempt)',
      },
      exampleSeeds: examples,
      note: 'Population = every SegmentForecast of every released film, both agents pooled, grouped by film confidence tier; covered = realized ∈ [low,high]. Tiers <5% of corpus marked LOW SAMPLE.',
    }
  }

  // ── Flag 7: M17 casting diversity (Random gate) ────────────────────────────
  private flagCastingDiversity(): FlagResult {
    const randomMedian = median(this.castingFractions.random)
    const oracleMedian = median(this.castingFractions.oracle)
    // FLAG if the MEDIAN across the RANDOM runs < 0.25.
    const fires = randomMedian !== null && randomMedian < 0.25
    return {
      name: 'Casting diversity (M17)',
      agentScope: 'Random (gate); Oracle for contrast',
      verdict: fires ? 'FAIL' : 'PASS',
      statistic: {
        randomMedianFraction: randomMedian === null ? null : round(randomMedian, 4),
        oracleMedianFraction: oracleMedian === null ? null : round(oracleMedian, 4),
        threshold: 'random median < 0.25',
        actorPoolDenominator: 28,
      },
      exampleSeeds: [],
      note: 'Per run: |actors ever cast| / 28. Median across RANDOM runs is the gate; Oracle median reported for contrast only.',
    }
  }

  // ── Flag 8: Authored-talent effect (BOTH) — not exercised ──────────────────
  private flagAuthoredTalent(): FlagResult {
    // The M0A agents never emit createTalent, so authored talent never enters
    // headless runs (§3 recorded refutation). Report "not exercised" — 0
    // appearances in Oracle-optimal packages. Do NOT fabricate a number.
    return {
      name: 'Authored-talent effect',
      agentScope: 'Both',
      verdict: 'PASS',
      statistic: {
        status: 'not exercised',
        appearancesInOracleOptimalPackages: 0,
        reason: 'M0A agents never emit createTalent; authored talent never enters headless runs (by design, this contract).',
      },
      exampleSeeds: [],
      note: 'Reported as "not exercised" per §14 / §3 recorded refutation. No number fabricated.',
    }
  }

  private tierDistribution(): {
    tiers: Record<Confidence, { count: number; share: number; lowSample: boolean }>
    total: number
  } {
    const total = this.tierForecastCount.high + this.tierForecastCount.medium + this.tierForecastCount.low
    const tiers: Record<Confidence, { count: number; share: number; lowSample: boolean }> = {} as Record<Confidence, { count: number; share: number; lowSample: boolean }>
    for (const tier of TIERS) {
      const count = this.tierForecastCount[tier]
      const share = total > 0 ? count / total : 0
      tiers[tier] = { count, share: round(share, 4), lowSample: share < 0.05 }
    }
    return { tiers, total }
  }
}

// ── The machine summary shape (summary.json) ──────────────────────────────────
export type AggregateSummary = {
  runCounts: Record<AgentName, number>
  totalReleases: number
  totalOracleDecisions: number
  oracleArgmaxSelfCheck: { divergences: number; pass: boolean }
  flags: FlagResult[]
  bounds: Array<{
    name: string
    min: number
    max: number
    observedMin: number | null
    observedMax: number | null
    count: number
    inRange: boolean
    firstViolation: { seed: string; agent: string | null; value: number | null } | null
  }>
  quadrants: {
    cells: Record<QuadrantCell, number>
    examples: Partial<Record<QuadrantCell, string>>
    allNonEmpty: boolean
  }
  tierDistribution: {
    tiers: Record<Confidence, { count: number; share: number; lowSample: boolean }>
    total: number
  }
}

// ── small numeric helpers (deterministic) ─────────────────────────────────────
function round(x: number, dp: number): number {
  const f = Math.pow(10, dp)
  return Math.round(x * f) / f
}

function seedList(s: string | undefined): string[] {
  return s === undefined ? [] : [s]
}

// Median of a numeric array (returns null for empty). Sorts a COPY numerically
// (no locale sort). Deterministic given identical input order.
function median(xs: number[]): number | null {
  if (xs.length === 0) return null
  const sorted = xs.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[mid]!
  return (sorted[mid - 1]! + sorted[mid]!) / 2
}
