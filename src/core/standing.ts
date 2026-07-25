// ── §6 Standing ──────────────────────────────────────────────────────────────
// `updateStanding(standing, r, b, ctx): Standing` — the three-channel update,
// implemented verbatim per §6 with the rev. 4 B12 context parameter folded in.
//
// The three channels move on DIFFERENT causes by design (§6 / §14 differentiation
// gate): awareness on commercial surprise + star attention, prestige on critic
// score against the literal 60 anchor, confidence on commercial surprise less
// budget overrun. Nothing here samples, reads time, or touches state — pure
// scalar arithmetic over the passed-in FilmResult, benchmarks, and context.
//
// Rev. 4 references folded in:
//   §6   — the four deltas and their caps, each verbatim; the prestige "60" anchor
//          is literal-by-design (NOT a benchmark; see rev4-open-questions.md §3).
//   B12  — updateStanding gains a `ctx` context parameter carrying exactly what the
//          two normalized helpers need (the three cast fames + actual/required
//          negative). Benchmarks derive from the production's forecastSnapshot.
//   M2   — actualNegative = production.budget.negative; requiredNegative = the §5.1
//          requiredNegative the reception result computed. The adequacy cap
//          (§5.1, rewards to 1.15×) and this overrun penalty (>1.0×) price the
//          same choice on different channels — intended, not a conflict.

import { clamp, mean } from './math.js'
import type { FilmResult, Standing } from './types.js'

// §6: benchmarks derive from the forecast snapshot, not from realized results.
// expectedOpening / expectedCriticScore are carried but dormant in updateStanding
// (verbatim-by-design); only expectedTotal is read here.
export type ReleaseBenchmarks = {
  expectedOpening: number
  expectedTotal: number
  expectedCriticScore: number
}

// B12's rev. 4 context parameter. Carries exactly what the two §6 normalized
// helpers need and nothing more:
//   - the three cast members' fames (lead, antagonist, support), unweighted mean
//     → normalizedStarAttention;
//   - actualNegative / requiredNegative → normalizedBudgetOverrun.
export type StandingContext = {
  castFames: { lead: number; antagonist: number; support: number }
  actualNegative: number
  requiredNegative: number
}

// normalizedStarAttention = clamp(mean(cast fame)/100, 0, 1) — mean of the THREE
// cast members' fame (lead, antagonist, support), unweighted.
function normalizedStarAttention(ctx: StandingContext): number {
  return clamp(mean([ctx.castFames.lead, ctx.castFames.antagonist, ctx.castFames.support]) / 100, 0, 1)
}

// normalizedBudgetOverrun = clamp((actualNegative - requiredNegative)/max(requiredNegative,1), 0, 1).
function normalizedBudgetOverrun(ctx: StandingContext): number {
  return clamp((ctx.actualNegative - ctx.requiredNegative) / Math.max(ctx.requiredNegative, 1), 0, 1)
}

// §6 updateStanding — verbatim. Each delta clamped, each channel clamped to 0..100.
export function updateStanding(
  standing: Standing,
  r: FilmResult,
  b: ReleaseBenchmarks,
  ctx: StandingContext,
): Standing {
  const commercialSurprise = clamp(
    (r.boxOffice.total - b.expectedTotal) / Math.max(b.expectedTotal, 1),
    -1,
    1,
  )

  const awarenessDelta = clamp(6 * commercialSurprise + 2 * normalizedStarAttention(ctx), -8, 8)
  // The literal 60 anchor is verbatim-by-design — NOT a benchmark.
  const prestigeDelta = clamp((r.criticScore - 60) / 8, -7, 7)
  const confidenceDelta = clamp(5 * commercialSurprise - 2 * normalizedBudgetOverrun(ctx), -8, 8)

  return {
    audienceAwareness: clamp(standing.audienceAwareness + awarenessDelta, 0, 100),
    industryPrestige: clamp(standing.industryPrestige + prestigeDelta, 0, 100),
    commercialConfidence: clamp(standing.commercialConfidence + confidenceDelta, 0, 100),
  }
}
