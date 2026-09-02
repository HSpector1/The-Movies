// ── §8 Broadcast core — INDEPENDENT contract-derived tests (phase 4) ──────────
//
// SOURCE OF TRUTH: build-contract.md rev. 4 §8 + NORMATIVE docs/rev4-open-questions.md
// (B22/B23/B24/M10; where the two conflict the resolutions win). Every expectation
// below is derived from the CONTRACT, not from the implementation: the body of
// broadcast.ts / tick.ts / the harness was never read for values. Constructed
// fixtures use values the test author is free to choose; the assertions against
// them are the §8 formulas re-derived by hand and tune-proofed against TUNING.
//
// HARD RULES honoured: seeded RNG only (RngStream/stream — no unseeded draws, and
// the forbidden literal never appears in this file, not even in a comment); strict
// TS; imports ONLY the public surface (src/core/index.ts).
//
// Contract basis for the §8 core:
//   §8 / B24  magnitude    = clamp(|realized − forecastCenter| / 50, 0, 1),
//             forecastCenter = Σ_s share·center_s  (PRE-noise segment centers).
//   §8        prominence   = clamp(subjectFame/100, 0, 1)  [B24: lead fame/100].
//   §8        editorialRelevance(release)  = mean(audienceAwareness, commercialConfidence)/100
//                          (talent → prestige/100; studio → mean(all three)/100; cultural → 1).
//   §8 / M10  novelty      = clamp(1 − matching/BROADCAST_WINDOW, 0, 1),
//             matching     = same-topic aired items in the last BROADCAST_WINDOW ticks (B24).
//   §8        cooldown     = exp(−mentionsInWindow · BROADCAST_COOLDOWN_K),
//             mentions     = aired items with the same subjectId in the window (B24).
//   §8        rankScore    = magnitude·editorialRelevance·prominence·novelty·cooldown.
//   §8 / B23  air          = rankScore ≥ BROADCAST_THRESHOLD AND direction ≠ asExpected.
//   B23       forecastBand = band(Σ share·estimate_s) [noisy estimate]; realizedBand = band(WAS);
//             direction    = ordinal band compare (weak<mixed<strong); subjectId=filmId=productionId;
//             primaryCause = promise(mismatch≥6) ▸ cohesion(<COHESION_SMOOTH_LO) ▸ timing(|t|≥5)
//                            ▸ reach(awarenessFactor<0.35) ▸ craft.
//   B22       phases 1–4 generate release-topic candidates only; two templates only.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  bandOf,
  deriveFacts,
  editorialRelevance,
  evaluateReleaseBroadcast,
  generateWorld,
  OracleAgent,
  RandomAgent,
  rankRelease,
  RELEASE_BETTER_TEMPLATE_ID,
  RELEASE_WORSE_TEMPLATE_ID,
  releaseTemplateId,
  renderReleaseTemplate,
  tick,
  TUNING,
} from '../src/core/index.js'
import type {
  BroadcastFacts,
  BroadcastItem,
  Forecast,
  SegmentForecast,
  SegmentId,
  Segment,
  Standing,
} from '../src/core/index.js'
import type { ReleaseBroadcastInputs } from '../src/core/broadcast.js'

// §9 fixed segment shares (worldgen). Kept local so nothing is copied from src.
const SEGMENT_SHARES: Record<SegmentId, number> = {
  youngAdult: 0.3,
  family: 0.25,
  adult: 0.3,
  prestige: 0.15,
}
const SEGMENT_IDS: SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige']

// Market segments in worldgen order. taste is irrelevant to the §8 core (broadcast
// reads only share + id for the two sums), so a zero taste is fine here.
function makeSegments(): Segment[] {
  return SEGMENT_IDS.map((id) => ({
    id,
    share: SEGMENT_SHARES[id],
    taste: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 },
  }))
}

// A Forecast snapshot with every segment's pre-noise `center` set to `center` and
// its noisy `estimate` set to `estimate`. Both are test-chosen inputs; §8 reads
// center (for forecastCenter, B24) and estimate (for forecastBand, B23).
function makeSnapshot(center: number, estimate: number): Forecast {
  const segments: SegmentForecast[] = SEGMENT_IDS.map((id) => ({
    segmentId: id,
    center,
    estimate,
    low: Math.max(0, estimate - 10),
    high: Math.min(100, estimate + 10),
    expectedBand: bandOf(estimate),
    confidence: 'medium',
    causalFactors: [],
    uncertaintyFactors: [],
    // D-12: opening band === linear band for this §8 fixture (fame path irrelevant to broadcast).
    opening: { center, estimate, low: Math.max(0, estimate - 10), high: Math.min(100, estimate + 10) },
  }))
  return { segments, expectedOpening: 0, expectedTotal: 0, expectedCriticScore: 0 }
}

// Assemble ReleaseBroadcastInputs from test-chosen pieces.
function makeInputs(over: {
  productionId?: string
  center?: number
  estimate?: number
  weightedAudienceScore?: number
  leadFame?: number
  standing?: Standing
  mismatchPenalty?: number
  cohesion?: number
  timelinessContribution?: number
  awarenessFactor?: number
  conceptTitle?: string
  tick?: number
} = {}): ReleaseBroadcastInputs {
  const center = over.center ?? 40
  const estimate = over.estimate ?? center
  const base: ReleaseBroadcastInputs = {
    productionId: over.productionId ?? 'p1',
    forecastSnapshot: makeSnapshot(center, estimate),
    segments: makeSegments(),
    weightedAudienceScore: over.weightedAudienceScore ?? 40,
    mismatchPenalty: over.mismatchPenalty ?? 0,
    cohesion: over.cohesion ?? 0.8,
    timelinessContribution: over.timelinessContribution ?? 0,
    awarenessFactor: over.awarenessFactor ?? 0.9,
    leadFame: over.leadFame ?? 100,
    standing:
      over.standing ??
      ({ audienceAwareness: 90, industryPrestige: 50, commercialConfidence: 90 } as Standing),
    tick: over.tick ?? 20,
  }
  // conceptTitle is optional (exactOptionalPropertyTypes): only set it when provided.
  return over.conceptTitle === undefined ? base : { ...base, conceptTitle: over.conceptTitle }
}

// Weighted mean of a per-segment constant (all-equal ⇒ just that constant, since
// shares sum to 1). Kept explicit so the test states its own arithmetic.
function weightedConstant(v: number): number {
  return SEGMENT_IDS.reduce((acc, id) => acc + SEGMENT_SHARES[id] * v, 0)
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCTED AIR FIXTURES (owner-required): prove BOTH better and worse air.
// ─────────────────────────────────────────────────────────────────────────────
describe('§8 constructed air fixtures — a qualifying release AIRS (better & worse)', () => {
  // BETTER: forecast weak (center=30, estimate=30 ⇒ both bands weak), realized
  // strong (WAS=80). direction = strong > weak = 'better'. magnitude = |80−30|/50
  // = 1. prominence = 100/100 = 1. relevance = mean(90,90)/100 = 0.9. novelty = 1,
  // cooldown = 1 (no aired history). rankScore = 0.9 ≥ 0.45 ⇒ AIRS.
  it('release-better: qualifying inputs air with topic release, direction better, correct template', () => {
    const inp = makeInputs({
      productionId: 'film-better',
      center: 30,
      estimate: 30,
      weightedAudienceScore: 80,
      leadFame: 100,
      standing: { audienceAwareness: 90, industryPrestige: 50, commercialConfidence: 90 },
      tick: 12,
    })
    const item = evaluateReleaseBroadcast(inp, [])
    expect(item).not.toBeNull()
    const it0 = item as BroadcastItem
    expect(it0.topic).toBe('release')
    expect(it0.subjectId).toBe('film-better')
    expect(it0.tick).toBe(12)
    expect(it0.facts.direction).toBe('better')
    expect(it0.facts.subjectId).toBe('film-better')
    expect(it0.facts.filmId).toBe('film-better')
    expect(it0.facts.forecastBand).toBe('weak')
    expect(it0.facts.realizedBand).toBe('strong')
    // template = release-better and equals the deterministic renderer's output.
    expect(it0.template).toBe(renderReleaseTemplate(inp, it0.facts))
    expect(releaseTemplateId(it0.facts)).toBe(RELEASE_BETTER_TEMPLATE_ID)
  })

  // WORSE: forecast strong (center=80, estimate=80), realized weak (WAS=30).
  // direction = weak < strong = 'worse'. magnitude = |30−80|/50 = 1. Same
  // prominence/relevance/novelty/cooldown ⇒ rankScore 0.9 ≥ 0.45 ⇒ AIRS.
  it('release-worse: qualifying inputs air with topic release, direction worse, correct template', () => {
    const inp = makeInputs({
      productionId: 'film-worse',
      center: 80,
      estimate: 80,
      weightedAudienceScore: 30,
      leadFame: 100,
      standing: { audienceAwareness: 90, industryPrestige: 50, commercialConfidence: 90 },
      tick: 7,
    })
    const item = evaluateReleaseBroadcast(inp, [])
    expect(item).not.toBeNull()
    const it0 = item as BroadcastItem
    expect(it0.topic).toBe('release')
    expect(it0.subjectId).toBe('film-worse')
    expect(it0.facts.direction).toBe('worse')
    expect(it0.facts.forecastBand).toBe('strong')
    expect(it0.facts.realizedBand).toBe('weak')
    expect(it0.template).toBe(renderReleaseTemplate(inp, it0.facts))
    expect(releaseTemplateId(it0.facts)).toBe(RELEASE_WORSE_TEMPLATE_ID)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// deriveFacts (B23)
// ─────────────────────────────────────────────────────────────────────────────
describe('§8/B23 deriveFacts — bands, direction, subject identity', () => {
  it('forecastBand from Σ share·estimate; realizedBand from WAS; subjectId=filmId=productionId', () => {
    // estimate=65 (all segments) ⇒ Σ share·estimate = 65 ⇒ band(65)=mixed.
    // WAS=80 ⇒ band(80)=strong. direction = strong > mixed = better.
    const inp = makeInputs({
      productionId: 'subject-x',
      center: 50,
      estimate: 65,
      weightedAudienceScore: 80,
    })
    const f = deriveFacts(inp)
    expect(f.forecastBand).toBe(bandOf(weightedConstant(65)))
    expect(f.forecastBand).toBe('mixed')
    expect(f.realizedBand).toBe(bandOf(80))
    expect(f.realizedBand).toBe('strong')
    expect(f.direction).toBe('better')
    expect(f.subjectId).toBe('subject-x')
    expect(f.filmId).toBe('subject-x')
  })

  it('equal bands ⇒ direction asExpected (band comparison is threshold-free)', () => {
    // estimate=50 ⇒ band mixed; WAS=60 ⇒ band mixed. Different numbers, same band.
    const inp = makeInputs({ estimate: 50, weightedAudienceScore: 60 })
    const f = deriveFacts(inp)
    expect(f.forecastBand).toBe('mixed')
    expect(f.realizedBand).toBe('mixed')
    expect(f.direction).toBe('asExpected')
  })

  it('worse: realized band below forecast band', () => {
    const inp = makeInputs({ estimate: 80, weightedAudienceScore: 50 })
    const f = deriveFacts(inp)
    expect(f.forecastBand).toBe('strong')
    expect(f.realizedBand).toBe('mixed')
    expect(f.direction).toBe('worse')
  })

  // primaryCause FIXED precedence (B23) — one input hitting EACH of the 5 branches.
  // Higher-precedence conditions are held false in each case.
  describe('primaryCause fixed precedence (5 branches)', () => {
    it("'promise' when mismatchPenalty ≥ 6 (dominates all lower causes)", () => {
      const f = deriveFacts(
        makeInputs({
          mismatchPenalty: 6,
          cohesion: 0.1, // would trigger cohesion, but promise wins
          timelinessContribution: 9, // would trigger timing
          awarenessFactor: 0.1, // would trigger reach
        }),
      )
      expect(f.primaryCause).toBe('promise')
    })

    it("'cohesion' when cohesion < COHESION_SMOOTH_LO and mismatch < 6", () => {
      const belowLo = TUNING.COHESION_SMOOTH_LO - 0.01
      const f = deriveFacts(
        makeInputs({
          mismatchPenalty: 5.9,
          cohesion: belowLo,
          timelinessContribution: 9,
          awarenessFactor: 0.1,
        }),
      )
      expect(f.primaryCause).toBe('cohesion')
    })

    it("'timing' when |timelinessContribution| ≥ 5 and higher causes false", () => {
      const f = deriveFacts(
        makeInputs({
          mismatchPenalty: 0,
          cohesion: TUNING.COHESION_SMOOTH_LO + 0.1, // ≥ LO ⇒ cohesion branch false
          timelinessContribution: -5, // |−5| ≥ 5
          awarenessFactor: 0.1,
        }),
      )
      expect(f.primaryCause).toBe('timing')
    })

    it("'reach' when awarenessFactor < 0.35 and higher causes false", () => {
      const f = deriveFacts(
        makeInputs({
          mismatchPenalty: 0,
          cohesion: 0.8,
          timelinessContribution: 0,
          awarenessFactor: 0.34,
        }),
      )
      expect(f.primaryCause).toBe('reach')
    })

    it("'craft' otherwise (no higher condition fires)", () => {
      const f = deriveFacts(
        makeInputs({
          mismatchPenalty: 0,
          cohesion: 0.8,
          timelinessContribution: 0,
          awarenessFactor: 0.9,
        }),
      )
      expect(f.primaryCause).toBe('craft')
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// rankRelease (B24 / M10) — hand-computed factors.
// ─────────────────────────────────────────────────────────────────────────────
describe('§8/B24/M10 rankRelease — each factor hand-computed', () => {
  it('magnitude, prominence, editorialRelevance, novelty, cooldown, rankScore, air', () => {
    // center=30 ⇒ forecastCenter = Σ share·30 = 30. WAS=80 ⇒ magnitude=|80−30|/50=1.
    // leadFame=70 ⇒ prominence=0.7. standing (aware=80, conf=60) ⇒ relevance=0.7.
    // no aired history ⇒ novelty=1, cooldown=1. rankScore=1·0.7·0.7·1·1=0.49 ≥ 0.45 ⇒ air.
    const inp = makeInputs({
      center: 30,
      estimate: 30,
      weightedAudienceScore: 80,
      leadFame: 70,
      standing: { audienceAwareness: 80, industryPrestige: 50, commercialConfidence: 60 },
    })
    const facts = deriveFacts(inp)
    const r = rankRelease(inp, facts, [])
    expect(r.forecastCenter).toBeCloseTo(30, 10)
    expect(r.magnitude).toBeCloseTo(1, 10)
    expect(r.prominence).toBeCloseTo(0.7, 10)
    expect(r.editorialRelevance).toBeCloseTo(0.7, 10)
    expect(r.novelty).toBeCloseTo(1, 10)
    expect(r.cooldown).toBeCloseTo(1, 10)
    expect(r.rankScore).toBeCloseTo(1 * 0.7 * 0.7 * 1 * 1, 10)
    expect(r.rankScore).toBeCloseTo(0.49, 10)
    expect(r.air).toBe(true)
  })

  it('forecastCenter uses PRE-noise centers, not the noisy estimates', () => {
    // center=30, estimate=90 (deliberately different). B24 says magnitude compares
    // against the forecast CENTER (deterministic), not the estimate. So with WAS=30
    // ⇒ magnitude = |30 − 30(center)|/50 = 0, NOT |30 − 90(estimate)|/50 = 1.2.
    const inp = makeInputs({ center: 30, estimate: 90, weightedAudienceScore: 30 })
    const facts = deriveFacts(inp)
    const r = rankRelease(inp, facts, [])
    expect(r.forecastCenter).toBeCloseTo(30, 10)
    expect(r.magnitude).toBeCloseTo(0, 10)
  })

  it('magnitude clamps to 1 when |realized − center| exceeds 50', () => {
    // center=10, WAS=95 ⇒ raw |95−10|/50 = 1.7 ⇒ clamp to 1.
    const inp = makeInputs({ center: 10, estimate: 10, weightedAudienceScore: 95 })
    const r = rankRelease(inp, deriveFacts(inp), [])
    expect(r.magnitude).toBe(1)
  })

  it('editorialRelevance for release = mean(awareness, confidence)/100 (branch checks)', () => {
    const standing: Standing = {
      audienceAwareness: 80,
      industryPrestige: 60,
      commercialConfidence: 40,
    }
    // release → mean(80,40)/100 = 0.6
    expect(editorialRelevance('release', standing)).toBeCloseTo((80 + 40) / 2 / 100, 10)
    // talent → prestige/100 = 0.6
    expect(editorialRelevance('talent', standing)).toBeCloseTo(60 / 100, 10)
    // studio → mean(all three)/100 = (80+60+40)/3/100
    expect(editorialRelevance('studio', standing)).toBeCloseTo((80 + 60 + 40) / 3 / 100, 10)
    // cultural → 1
    expect(editorialRelevance('cultural', standing)).toBe(1)
  })

  it('novelty = clamp(1 − matching/BROADCAST_WINDOW, 0, 1) with constructed aired history', () => {
    const inp = makeInputs({ tick: 20 })
    const facts = deriveFacts(inp)
    // Two aired RELEASE items inside the window (same tick), plus one clearly OUTSIDE.
    const aired: BroadcastItem[] = [
      airedItem('other-a', 'release', 20),
      airedItem('other-b', 'release', 19),
      airedItem('other-c', 'release', 20 - TUNING.BROADCAST_WINDOW - 5), // outside window
    ]
    const r = rankRelease(inp, facts, aired)
    // matching = 2 in-window release items ⇒ novelty = 1 − 2/6.
    expect(r.novelty).toBeCloseTo(1 - 2 / TUNING.BROADCAST_WINDOW, 10)
  })

  it('cooldown = exp(−mentionsInWindow · BROADCAST_COOLDOWN_K) with same-subject history', () => {
    const inp = makeInputs({ productionId: 'subj', tick: 20 })
    const facts = deriveFacts(inp)
    // Two in-window aired items with the SAME subjectId ⇒ mentions = 2. A different
    // subject and an out-of-window same-subject item must NOT count.
    const aired: BroadcastItem[] = [
      airedItem('subj', 'release', 20),
      airedItem('subj', 'release', 18),
      airedItem('elsewhere', 'release', 20),
      airedItem('subj', 'release', 20 - TUNING.BROADCAST_WINDOW - 3), // outside window
    ]
    const r = rankRelease(inp, facts, aired)
    expect(r.cooldown).toBeCloseTo(Math.exp(-2 * TUNING.BROADCAST_COOLDOWN_K), 10)
  })

  function airedItem(subjectId: string, topic: BroadcastItem['topic'], tickN: number): BroadcastItem {
    return {
      subjectId,
      topic,
      facts: { subjectId, direction: 'better' } as BroadcastFacts,
      template: 'x',
      tick: tickN,
    }
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Threshold + asExpected gating.
// ─────────────────────────────────────────────────────────────────────────────
describe('§8 threshold + asExpected gating', () => {
  // With magnitude=1, prominence=1, novelty=1, cooldown=1, rankScore = relevance.
  // relevance = mean(awareness, confidence)/100. So we can place rankScore exactly
  // at / just below / just above BROADCAST_THRESHOLD by choosing the two channels.
  const T = TUNING.BROADCAST_THRESHOLD

  function relevanceInputs(sumOfTwoChannels: number): ReleaseBroadcastInputs {
    // audienceAwareness + commercialConfidence = sum ⇒ relevance = (sum/2)/100.
    return makeInputs({
      center: 30,
      estimate: 30,
      weightedAudienceScore: 80, // magnitude 1, direction better
      leadFame: 100,
      standing: {
        audienceAwareness: sumOfTwoChannels / 2,
        industryPrestige: 50,
        commercialConfidence: sumOfTwoChannels / 2,
      },
    })
  }

  it('rankScore just below BROADCAST_THRESHOLD does NOT air', () => {
    // relevance = T − 0.01 ⇒ sum = 2·100·(T−0.01).
    const sum = 2 * 100 * (T - 0.01)
    const inp = relevanceInputs(sum)
    const r = rankRelease(inp, deriveFacts(inp), [])
    expect(r.rankScore).toBeCloseTo(T - 0.01, 10)
    expect(r.air).toBe(false)
    expect(evaluateReleaseBroadcast(inp, [])).toBeNull()
  })

  it('rankScore exactly at BROADCAST_THRESHOLD DOES air (air uses ≥)', () => {
    const sum = 2 * 100 * T // relevance exactly T
    const inp = relevanceInputs(sum)
    const r = rankRelease(inp, deriveFacts(inp), [])
    expect(r.rankScore).toBeCloseTo(T, 10)
    expect(r.air).toBe(true)
    expect(evaluateReleaseBroadcast(inp, [])).not.toBeNull()
  })

  it('rankScore above BROADCAST_THRESHOLD airs', () => {
    const sum = 2 * 100 * (T + 0.2)
    const inp = relevanceInputs(sum)
    const r = rankRelease(inp, deriveFacts(inp), [])
    expect(r.rankScore).toBeCloseTo(T + 0.2, 10)
    expect(r.air).toBe(true)
  })

  it('an asExpected-direction item NEVER airs, regardless of rankScore', () => {
    // Force asExpected (same band) but with a HUGE would-be rankScore: estimate and
    // WAS both land in 'mixed' (50/60), max standing + fame ⇒ magnitude>0 possible.
    // center=50, WAS=60 ⇒ magnitude=|60−50|/50=0.2; relevance=1; prominence=1 ⇒
    // rankScore=0.2 which is < T anyway, so make magnitude big while staying same
    // band: center=41 (band mixed), estimate=41 (mixed), WAS=69 (mixed) ⇒ magnitude
    // = |69−41|/50 = 0.56, relevance=1, prominence=1 ⇒ rankScore=0.56 ≥ T. Yet
    // direction asExpected (both mixed) ⇒ MUST NOT air.
    const inp = makeInputs({
      center: 41,
      estimate: 41,
      weightedAudienceScore: 69,
      leadFame: 100,
      standing: { audienceAwareness: 100, industryPrestige: 100, commercialConfidence: 100 },
    })
    const facts = deriveFacts(inp)
    expect(facts.direction).toBe('asExpected')
    const r = rankRelease(inp, facts, [])
    expect(r.rankScore).toBeGreaterThanOrEqual(T) // would qualify on score alone
    expect(r.air).toBe(false) // but asExpected never airs
    expect(evaluateReleaseBroadcast(inp, [])).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic ordering / window semantics / determinism.
// ─────────────────────────────────────────────────────────────────────────────
describe('§8/B24 window semantics + determinism', () => {
  it('matching / mentions counts respect the window (in vs out)', () => {
    const inp = makeInputs({ productionId: 's', tick: 30 })
    const facts = deriveFacts(inp)
    // All same subject: 3 in-window (release) + 3 out-of-window. novelty counts
    // in-window release items; cooldown counts in-window same-subject items.
    const inWin: BroadcastItem[] = [30, 29, 28].map((t) => mk('s', 'release', t))
    const outWin: BroadcastItem[] = [
      30 - TUNING.BROADCAST_WINDOW - 1,
      30 - TUNING.BROADCAST_WINDOW - 2,
      30 - TUNING.BROADCAST_WINDOW - 3,
    ].map((t) => mk('s', 'release', t))
    const r = rankRelease(inp, facts, [...inWin, ...outWin])
    // 3 in-window release ⇒ novelty = 1 − 3/6; 3 in-window same-subject ⇒ mentions 3.
    expect(r.novelty).toBeCloseTo(1 - 3 / TUNING.BROADCAST_WINDOW, 10)
    expect(r.cooldown).toBeCloseTo(Math.exp(-3 * TUNING.BROADCAST_COOLDOWN_K), 10)
  })

  it('same inputs ⇒ same result (determinism)', () => {
    const a = evaluateReleaseBroadcast(
      makeInputs({ center: 30, estimate: 30, weightedAudienceScore: 80 }),
      [],
    )
    const b = evaluateReleaseBroadcast(
      makeInputs({ center: 30, estimate: 30, weightedAudienceScore: 80 }),
      [],
    )
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  function mk(subjectId: string, topic: BroadcastItem['topic'], tickN: number): BroadcastItem {
    return {
      subjectId,
      topic,
      facts: { subjectId, direction: 'better' } as BroadcastFacts,
      template: 'x',
      tick: tickN,
    }
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Templates.
// ─────────────────────────────────────────────────────────────────────────────
describe('§8 templates — release-better / release-worse render deterministically and differ', () => {
  it('renderReleaseTemplate is deterministic and differs by direction', () => {
    const betterInp = makeInputs({ center: 30, estimate: 30, weightedAudienceScore: 80 })
    const worseInp = makeInputs({ center: 80, estimate: 80, weightedAudienceScore: 30 })
    const bf = deriveFacts(betterInp)
    const wf = deriveFacts(worseInp)
    expect(bf.direction).toBe('better')
    expect(wf.direction).toBe('worse')
    // deterministic
    expect(renderReleaseTemplate(betterInp, bf)).toBe(renderReleaseTemplate(betterInp, bf))
    // better and worse copy differ
    expect(renderReleaseTemplate(betterInp, bf)).not.toBe(renderReleaseTemplate(worseInp, wf))
  })

  it('releaseTemplateId returns better/worse ids and undefined for asExpected', () => {
    const better = deriveFacts(makeInputs({ center: 30, estimate: 30, weightedAudienceScore: 80 }))
    const worse = deriveFacts(makeInputs({ center: 80, estimate: 80, weightedAudienceScore: 30 }))
    const asExpected = deriveFacts(makeInputs({ estimate: 50, weightedAudienceScore: 60 }))
    expect(better.direction).toBe('better')
    expect(worse.direction).toBe('worse')
    expect(asExpected.direction).toBe('asExpected')
    expect(releaseTemplateId(better)).toBe(RELEASE_BETTER_TEMPLATE_ID)
    expect(releaseTemplateId(worse)).toBe(RELEASE_WORSE_TEMPLATE_ID)
    expect(releaseTemplateId(asExpected)).toBeUndefined()
    // the two ids are distinct
    expect(RELEASE_BETTER_TEMPLATE_ID).not.toBe(RELEASE_WORSE_TEMPLATE_ID)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// INERT-IN-CORPUS proof (contract-forced, B24) — this records the M0A finding.
// ─────────────────────────────────────────────────────────────────────────────
describe('§8 broadcast is INERT in the natural M0A corpus (contract-forced)', () => {
  // WHY (unit-level identity): realized weightedAudienceScore is a share-weighted
  // sum of segmentAppeal(s); segmentAppeal has NO sampled term and is standing-
  // independent, so the realized WAS EQUALS the deterministic forecastCenter
  // (Σ share·center) exactly. Then magnitude = |WAS − forecastCenter|/50 ≡ 0, so
  // rankScore ≡ 0 < BROADCAST_THRESHOLD ⇒ nothing airs. Here we prove the identity
  // that forces inertness: when WAS == forecastCenter, magnitude and rankScore are 0.
  it('identity: realized WAS == forecastCenter ⇒ magnitude 0 ⇒ rankScore 0 ⇒ no air', () => {
    const center = 62
    const inp = makeInputs({
      center,
      estimate: center,
      weightedAudienceScore: center, // the forced identity
      leadFame: 100,
      standing: { audienceAwareness: 100, industryPrestige: 100, commercialConfidence: 100 },
    })
    const facts = deriveFacts(inp)
    const r = rankRelease(inp, facts, [])
    // forecastCenter == center and WAS == center, so magnitude ≡ 0 to fp precision.
    // (The share-weighted sum Σ share·center accumulates a ~1e-16 rounding residue,
    // so the identity holds to floating-point epsilon, not bit-exactly — that is the
    // contract identity, and it is still far below BROADCAST_THRESHOLD.)
    expect(r.forecastCenter).toBeCloseTo(center, 10)
    expect(r.magnitude).toBeCloseTo(0, 12)
    expect(r.rankScore).toBeCloseTo(0, 12)
    expect(r.rankScore).toBeLessThan(TUNING.BROADCAST_THRESHOLD)
    // direction is asExpected too (identical bands) — belt and braces.
    expect(facts.direction).toBe('asExpected')
    expect(evaluateReleaseBroadcast(inp, [])).toBeNull()
  })

  // CORPUS-level: drive full years for BOTH agents and assert broadcastItems is
  // EMPTY at year end. Representative sample of seeds (the harness runs the
  // authoritative 1,000); a handful suffices to demonstrate the forced-zero.
  it('full-year runs produce ZERO broadcast items (both agents, representative seeds)', () => {
    const seeds = ['inert-1', 'inert-2', 'inert-3', 'inert-4']
    for (const [label, agent] of [
      ['Oracle', OracleAgent],
      ['Random', RandomAgent],
    ] as const) {
      for (const seed of seeds) {
        let state = generateWorld(`${seed}-${label}`)
        for (let t = 0; t < TUNING.TICKS_PER_YEAR; t++) {
          state = applyActions(state, agent.chooseActions(state))
          // P06A W1 hold law: a production at remainingTicks===1 HOLDS until an
          // explicit commitPictureToRelease. Neither corpus agent knows about the
          // hold (§13 agents only ever greenlight-or-nothing), so this drive commits
          // every ready picture before each tick — committing advances no time.
          const ready = state.studio.activeProductions.filter((p) => p.remainingTicks === 1)
          if (ready.length > 0) {
            state = applyActions(
              state,
              ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
            )
          }
          state = tick(state)
        }
        // At least one film released, or the assertion is vacuous.
        expect(state.studio.releasedFilms.length).toBeGreaterThan(0)
        // Yet no broadcast item aired: magnitude ≡ 0 for every release.
        expect(state.broadcastItems).toEqual([])
      }
    }
  })
})
