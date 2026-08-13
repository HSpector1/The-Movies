// ── §6 Standing — owner ruling D-6 (supersedes the prior §6 standing formulas) ──
// `updateStanding(standing, r, b, ctx): Standing` — the three-channel update.
//
// D-6 (owner product decision, 2026-07-26) redefines what the three channels MEAN
// and drives each from an ABSOLUTE realized quantity so they can move in DIFFERENT
// directions after the same release. The prior §6 formulas keyed BOTH awareness and
// confidence off one shared `commercialSurprise` (realized-vs-forecast) term, which
// collapsed those two channels into one dimension (baseline M6 |r| ≈ 0.99), and
// anchored prestige to a fixed criticScore of 60 that the corpus almost never
// reaches (baseline prestige-high rate ≈ 0%) — so the D-2 differentiation gate could
// not pass. D-6 replaces all three with absolute realized signals. The old
// `commercialSurprise` (and its forecast benchmarks) is DELETED.
//
// Channel meanings (D-6) and their SOLE drivers:
//   Audience Awareness   = how visible / culturally noticeable the studio is.
//                          PRIMARY: absolute audience REACH (box-office vs the
//                          available market). SECONDARY: star attention. NOT forecast
//                          surprise. A widely-seen flop still makes the studio famous;
//                          a tiny profitable film does not.
//   Industry Prestige    = how artistically/critically respected the studio is.
//                          ONLY: absolute critical achievement (realized criticScore
//                          vs a REACHABLE neutral benchmark). NOT box office, profit,
//                          fame, or surprise. An acclaimed flop still gains prestige.
//   Commercial Confidence = the studio's reputation for making money with money.
//                          (D-17A/T8: NOT "how strongly financiers trust the studio" — there
//                          are no financiers in this game, and this channel has no mechanical
//                          effect on funding. Formulas below are byte-identical.)
//                          PRIMARY: realized PROFITABILITY (ROI on committed cost) and
//                          BUDGET DISCIPLINE. NOT absolute reach; does NOT reuse the
//                          awareness/commercial-surprise signal. A huge-grossing
//                          money-loser raises awareness while LOWERING confidence.
//
// Nothing here samples, reads time, or touches state — pure scalar arithmetic over
// the passed-in FilmResult and the ephemeral release context. Every constant is a
// named TUNING entry (no inlined magic numbers). The `ReleaseBenchmarks b` parameter
// is RETAINED in the signature (so the public shape and the tick cross-check are
// stable) even though D-6 no longer reads it — the forecast benchmarks are dormant
// under D-6, exactly as `expectedOpening`/`expectedCriticScore` were dormant before.

import { clamp, mean } from './math.js'
import { TUNING } from './tuning.js'
import type { FilmResult, Standing } from './types.js'

// Benchmarks derive from the forecast snapshot. RETAINED for signature/shape
// stability; DORMANT under D-6 (the prior commercialSurprise term that read
// expectedTotal is deleted). Kept so the tick cross-check and callers are unchanged.
export type ReleaseBenchmarks = {
  expectedOpening: number
  expectedTotal: number
  expectedCriticScore: number
}

// The ephemeral release context (B12): everything the D-6 formulas need, all
// ALREADY-EXISTING values captured at RELEASE in tick.ts and dropped at tick end
// (never persisted; GameState/save are untouched):
//   - castFames                 → star attention (secondary awareness contributor);
//   - actualNegative/requiredNegative → budget overrun (confidence discipline);
//   - baseMarketValue           → reach = boxOffice.total / baseMarketValue (awareness);
//   - marketing, salaries       → committed cost = negative + marketing + salaries,
//                                 with which profit and ROI are computed (confidence).
export type StandingContext = {
  castFames: { lead: number; antagonist: number; support: number }
  actualNegative: number
  requiredNegative: number
  baseMarketValue: number
  marketing: number
  salaries: number
  // D-17B §1 (E1): the ECONOMY REGIME at this release — `economyEngaged(state)`, the persisted
  // monotonic fact (D-17A/R2), captured at RELEASE exactly like every other value above. It is
  // EPHEMERAL context (B12): built in tick.ts and dropped at tick end; GameState and the save
  // are untouched. It selects the awareness reach pivot (see the delta below) and NOTHING else.
  engaged: boolean
}

// starAttention = clamp(mean(cast fame)/100, 0, 1) — unweighted mean of the three
// cast members' fame. Secondary awareness contributor (D-6).
function starAttention(ctx: StandingContext): number {
  return clamp(mean([ctx.castFames.lead, ctx.castFames.antagonist, ctx.castFames.support]) / 100, 0, 1)
}

// budgetOverrun = clamp((actualNegative − requiredNegative)/max(requiredNegative,1), 0, 1)
// — the fraction by which the film was over-funded past its requirement. Only the
// discipline (over-spend) direction is penalized; under-funding is not rewarded here.
function budgetOverrun(ctx: StandingContext): number {
  return clamp((ctx.actualNegative - ctx.requiredNegative) / Math.max(ctx.requiredNegative, 1), 0, 1)
}

// committedCost = negative + marketing + Σ(writer+director+cast salaries) — the D-1
// cost basis for ROI, floored to avoid a degenerate denominator (CONFIDENCE_COST_FLOOR).
function committedCost(ctx: StandingContext): number {
  return ctx.actualNegative + ctx.marketing + ctx.salaries
}

// §6 updateStanding — D-6. Each delta clamped to its channel's TUNING cap; each
// channel value clamped to 0..100. INITIAL_STANDING (40/40/50) is unchanged.
export function updateStanding(
  standing: Standing,
  r: FilmResult,
  _b: ReleaseBenchmarks,
  ctx: StandingContext,
): Standing {
  // ── Awareness: absolute reach (primary) + star attention (secondary) ─────────
  // reach = boxOffice.total / baseMarketValue, normalized so AWARENESS_REACH_SCALE
  // reads as "fully visible" (≈ corpus p90 reach). The NEUTRAL offset lets a
  // small-reach film contribute ~0 or slightly negative, so awareness can stay low.
  const reach = clamp(
    r.boxOffice.total / Math.max(ctx.baseMarketValue, 1) / TUNING.AWARENESS_REACH_SCALE,
    0,
    1,
  )
  // D-17B §1 (E1) — the REGIME SPLIT on the pivot ONLY. The D-6 formula SHAPE is untouched:
  // the same two terms, the same weights, the same ±AWARENESS_DELTA_CAP. Engaged play pivots
  // at AWARENESS_REACH_NEUTRAL_ENGAGED (0.45) — the recovery-side half of the D-17B design,
  // measured jointly with the step-5.5 drift (corpus floor-week share 18.32% → 2.26%). The
  // DISENGAGED/M0A branch keeps the legacy AWARENESS_REACH_NEUTRAL (0.58) byte-identically,
  // which is what makes the M0A acceptance corpus identical BY CONSTRUCTION rather than by
  // re-baselining. ESCALATION E1 (contract §0): the split needs an explicit R4 extension;
  // recorded fallback if declined = unconditional 0.45 + re-baselined corpus + the
  // byte-identity gate struck (a ruling outcome, NOT code — see tuning.ts).
  const reachNeutral = ctx.engaged
    ? TUNING.AWARENESS_REACH_NEUTRAL_ENGAGED
    : TUNING.AWARENESS_REACH_NEUTRAL
  const awarenessDelta = clamp(
    TUNING.AWARENESS_REACH_WEIGHT * (reach - reachNeutral) +
      TUNING.AWARENESS_STAR_WEIGHT * starAttention(ctx),
    -TUNING.AWARENESS_DELTA_CAP,
    TUNING.AWARENESS_DELTA_CAP,
  )

  // ── Prestige: absolute critical achievement vs a REACHABLE benchmark ─────────
  // (criticScore − BENCHMARK)/SCALE. BENCHMARK sits near the corpus criticScore
  // median so above-benchmark films raise prestige and below-benchmark films lower
  // it — both extremes reachable (the prior fixed 60 was above ~p90, so prestige
  // only ever fell). No box office / profit / fame / surprise term.
  const prestigeDelta = clamp(
    (r.criticScore - TUNING.PRESTIGE_CRITIC_BENCHMARK) / TUNING.PRESTIGE_CRITIC_SCALE,
    -TUNING.PRESTIGE_DELTA_CAP,
    TUNING.PRESTIGE_DELTA_CAP,
  )

  // ── Confidence: realized ROI (primary) less a budget-discipline penalty ──────
  // ROI = profit / max(cost, floor); roiSignal ∈ [−1,+1]. disciplinePenalty scales
  // with the over-funding fraction. No absolute-reach term; does NOT reuse any
  // awareness/commercial-surprise signal.
  const cost = Math.max(committedCost(ctx), TUNING.CONFIDENCE_COST_FLOOR)
  const roi = (r.boxOffice.total - committedCost(ctx)) / cost
  const roiSignal = clamp(roi / TUNING.CONFIDENCE_ROI_SCALE, -1, 1)
  const disciplinePenalty = TUNING.CONFIDENCE_DISCIPLINE_WEIGHT * clamp(budgetOverrun(ctx), 0, 1)
  const confidenceDelta = clamp(
    TUNING.CONFIDENCE_ROI_WEIGHT * roiSignal - disciplinePenalty,
    -TUNING.CONFIDENCE_DELTA_CAP,
    TUNING.CONFIDENCE_DELTA_CAP,
  )

  return {
    audienceAwareness: clamp(standing.audienceAwareness + awarenessDelta, 0, 100),
    industryPrestige: clamp(standing.industryPrestige + prestigeDelta, 0, 100),
    commercialConfidence: clamp(standing.commercialConfidence + confidenceDelta, 0, 100),
  }
}
