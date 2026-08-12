// ── D-11.C Newspaper release reveal — pure, deterministic derivation ──────────
// The emotional headline layer shown once at a film's release. Derived ENTIRELY from
// the film's persisted record (FilmResult: criticScore, segmentScores, boxOffice,
// cohesion, participants, locked forecast) + its committed cost + concept title +
// segment shares — so the clipping reconstructs identically after save/reload, is tied
// to the correct film, and is immutable to later talent/studio change. Headlines are
// chosen from deterministic templates keyed to ACTUAL recorded thresholds and never
// contradict the numbers. The detailed autopsy remains the authoritative analysis.
//
// No RNG, no wall-clock, no state mutation. The underlying critic score is never changed.

import { clamp } from './math.js'
import type { FilmParticipant, FilmParticipants, FilmResult, SegmentId } from './types.js'

// Original fictional entertainment-industry newspaper (not a real publication).
export const NEWSPAPER_MASTHEAD = 'The Silver Screen Gazette'

// ── critic stars (D-11.C) — 0–5 in half-star steps from the 0–100 critic score ─
export type CriticRating = { stars: number; score: number }
export function criticStars(criticScore: number): number {
  const raw = criticScore / 20
  const half = Math.round(raw * 2) / 2 // nearest half
  return clamp(half, 0, 5)
}

// ── audience reaction (D-11.C) — from the supported segment aggregate ──────────
export type AudienceTier = 'hated' | 'disliked' | 'divided' | 'liked' | 'loved'
const AUDIENCE_LABEL: Record<AudienceTier, string> = {
  hated: 'Audiences hated it',
  disliked: 'Audiences disliked it',
  divided: 'Audiences were divided',
  liked: 'Audiences liked it',
  loved: 'Audiences loved it',
}
export function audienceTier(aggregateScore: number): AudienceTier {
  if (aggregateScore < 30) return 'hated'
  if (aggregateScore < 45) return 'disliked'
  if (aggregateScore < 57) return 'divided'
  if (aggregateScore < 72) return 'liked'
  return 'loved'
}

// Share-weighted aggregate of the per-segment scores (the supported aggregate; the full
// autopsy keeps the per-segment detail). Falls back to a plain mean if shares are absent.
export function aggregateAudienceScore(
  segmentScores: Record<SegmentId, number>,
  shares: Record<SegmentId, number>,
): number {
  let sum = 0
  let wsum = 0
  for (const id of Object.keys(segmentScores) as SegmentId[]) {
    const w = shares[id] ?? 0
    sum += (segmentScores[id] ?? 0) * w
    wsum += w
  }
  if (wsum > 0) return sum / wsum
  const vals = Object.values(segmentScores)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

// ── critic tier (internal, for headline selection) ────────────────────────────
type CriticTier = 'pan' | 'mixed' | 'favorable' | 'strong' | 'rave'
function criticTier(score: number): CriticTier {
  if (score < 35) return 'pan'
  if (score < 55) return 'mixed'
  if (score < 70) return 'favorable'
  if (score < 85) return 'strong'
  return 'rave'
}

type Delta = 'better' | 'worse' | 'asExpected'
function deltaOf(actual: number, expected: number, tol: number): Delta {
  if (actual > expected + tol) return 'better'
  if (actual < expected - tol) return 'worse'
  return 'asExpected'
}

// ── the newspaper view ────────────────────────────────────────────────────────
export type NewspaperView = {
  masthead: string
  week: number
  filmTitle: string
  headline: string
  subheadline: string
  critic: CriticRating
  audience: { tier: AudienceTier; label: string; score: number }
  // D-12 beta P3: opening-day truthfulness — what is PAID this week vs what is PROJECTED for the
  // full 6-week run. Never present projected full-run totals as already realized/banked.
  financial: {
    openingGross: number // opening-week theatrical gross
    studioRevenueThisWeek: number // Studio Revenue PAID this opening week (share × opening gross)
    projectedTotalGross: number // projected full-run theatrical gross
    projectedTotalStudioRevenue: number // projected full-run Studio Revenue (share × total gross)
    studioRevenueStillToCome: number // projected total − paid this week
    totalCommitment: number // Production Budget + Marketing + Freelancer Fees (direct film costs)
    projectedContribution: number // projected total Studio Revenue − total commitment (NOT realized)
    projectedContributionLabel: string // 'Projected profit' | 'Projected loss'
    disclosure: string
  }
  forecast: { expectedCritic: number; expectedTotal: number; criticDelta: Delta; boxDelta: Delta }
  callouts: string[]
  participants: FilmParticipants
}

export type NewspaperInput = {
  film: FilmResult
  conceptTitle: string
  committedCost: number
  segmentShares: Record<SegmentId, number>
  // D-12: the studio's PROJECTED full-run Studio Revenue for this film (blended rental share ×
  // total gross), read from its theatrical run. Absent for a pre-D-12 legacy film → full box office.
  studioRevenue?: number
  // D-12 beta P3: the opening-week gross + the locked run share, so the front page can separate
  // the Studio Revenue PAID this opening week from the projected full-run total.
  openingGross?: number
  studioShare?: number
  week?: number
}

const DISCLOSURE =
  'Only the opening week is banked so far. Full-run figures are PROJECTIONS. Studio Revenue is the studio’s blended rental share of box office, paid weekly across the theatrical run; distributor and exhibitor economics are abstracted into that share.'

const upper = (s: string) => s.toUpperCase()

// Every dimension the headline/callout rules read — all from the recorded result.
type Dims = {
  title: string
  critic: number
  criticTier: CriticTier
  aud: number
  audTier: AudienceTier
  boxOffice: number
  profit: number
  profitable: boolean
  criticDelta: Delta
  boxDelta: Delta
  cohesion: number
}

// Deterministic, priority-ordered headline rules. First match wins; each condition is a
// real threshold on the recorded numbers, so a chosen headline never contradicts them.
//
// D-17A FIX-PASS — LABEL TRUTHFULNESS, second half. `d.profitable` is the FULL-RUN PROJECTION
// made at release (projected total Studio Revenue − committed cost); at this moment only the
// opening week has been credited. The callouts below were relabelled in T2 ("is projected to
// finish in profit"), but `makeCallouts` only fires when fewer than three callouts exist,
// while the SUBHEADLINE always renders (`NewspaperReveal.tsx:160`) — and it still asserted
// settled results: "turned a profit", "the studio profited", "stayed in the black", "came out
// ahead", "took a loss", "finished in the red", "lost money". Wording only: every trigger,
// every threshold and every branch below is unchanged, and the templates stay deterministic.
function makeHeadline(d: DimsWithCost): { headline: string; subheadline: string } {
  const t = upper(`“${d.title}”`)
  const stars = criticStars(d.critic)
  const criticHigh = d.criticTier === 'strong' || d.criticTier === 'rave'
  const criticLow = d.criticTier === 'pan'
  const audHigh = d.audTier === 'liked' || d.audTier === 'loved'
  const audLow = d.audTier === 'hated' || d.audTier === 'disliked'

  // 1. Critics love it but audiences reject it.
  if (criticHigh && audLow) {
    return {
      headline: `CRITICS ADORE ${t} — BUT AUDIENCES STAY AWAY`,
      subheadline: `A ${stars}/5 critical darling that could not find a crowd${d.profitable ? ', though it is still on course to turn a profit.' : ' and is on course to lose money.'}`,
    }
  }
  // 2. Critics pan it but audiences show up.
  if (criticLow && audHigh) {
    return {
      headline: `CRITICS PAN ${t} — AUDIENCES PACK THEATERS`,
      subheadline: `Reviewers were unkind (${stars}/5), yet crowds turned out${d.profitable ? ' and the studio is projected to profit.' : ', though it is still projected to lose money.'}`,
    }
  }
  // 3. Surprise hit: profitable AND beat the box-office forecast.
  if (d.profitable && d.boxDelta === 'better' && d.profit >= 5_000_000) {
    return {
      headline: `STUDIO SCORES A SURPRISE HIT WITH ${t}`,
      subheadline: `${t} outran its forecast, drawing ${criticHigh ? 'strong reviews' : 'a mixed critical response'} and a projected healthy profit.`,
    }
  }
  // 4. Big smash: strong critics + strong audience + big profit.
  if (criticHigh && audHigh && d.profit >= 8_000_000) {
    return {
      headline: `${t} IS A SMASH — CRITICS AND CROWDS AGREE`,
      subheadline: `A ${stars}/5 crowd-pleaser and a projected major payday for the studio.`,
    }
  }
  // 5. Expensive flop: lost money with a poor reception.
  if (!d.profitable && (criticLow || audLow) && d.boxOffice < d.committedCostRef) {
    return {
      headline: `EXPENSIVE ${t} FAILS TO FIND ITS AUDIENCE`,
      subheadline: `${t} is not projected to cover its costs, and drew a ${stars}/5 critical response.`,
    }
  }
  // 6. Underperformed the forecast.
  if (d.boxDelta === 'worse') {
    return {
      headline: `${t} OPENS BELOW EXPECTATIONS`,
      subheadline: `The studio's latest fell short of its forecast${d.profitable ? ' but is projected to stay in the black.' : ' and is projected to finish in the red.'}`,
    }
  }
  // 7. Solid, profitable, well-liked.
  if (d.profitable && (criticHigh || audHigh)) {
    return {
      headline: `${t} OPENS TO A WARM RECEPTION`,
      subheadline: `A ${stars}/5 review and a solid opening point to a dependable earner for the studio.`,
    }
  }
  // 8. Fallback — mixed/unremarkable.
  return {
    headline: `${t} OPENS TO A MIXED RECEPTION`,
    subheadline: `Critics landed at ${stars}/5 and ${AUDIENCE_LABEL[d.audTier].toLowerCase()}; the studio ${d.profitable ? 'is on course to come out ahead.' : 'is on course to take a loss.'}`,
  }
}

// Dims carries committedCost for rule 5 without widening the public type.
type DimsWithCost = Dims & { committedCostRef: number }

function strongestWeakest(p: FilmParticipants): { strongest: FilmParticipant; weakest: FilmParticipant } {
  const all: FilmParticipant[] = [p.writer, p.director, p.cast.lead, p.cast.antagonist, p.cast.support, ...p.craft]
  let strongest = all[0]!
  let weakest = all[0]!
  for (const x of all) {
    if (x.greenlightFit > strongest.greenlightFit) strongest = x
    if (x.greenlightFit < weakest.greenlightFit) weakest = x
  }
  return { strongest, weakest }
}

// Two–three truthful callouts, drawn ONLY from recorded mechanics (cohesion, Fit,
// critic-audience divergence, forecast delta, profitability), in priority order.
function makeCallouts(d: Dims, film: FilmResult): string[] {
  const out: string[] = []
  const p = film.participants
  const criticRank = { pan: 0, mixed: 1, favorable: 2, strong: 3, rave: 4 }[d.criticTier]
  const audRank = { hated: 0, disliked: 1, divided: 2, liked: 3, loved: 4 }[d.audTier]

  if (Math.abs(criticRank - audRank) >= 2) {
    out.push(
      criticRank > audRank
        ? 'Critics were far warmer than the general audience.'
        : 'Audiences embraced a film the critics dismissed.',
    )
  }
  if (film.cohesion >= 0.6) out.push('Critics rewarded the film’s strong creative cohesion.')
  else if (film.cohesion < 0.4) out.push('A muddled creative brief undercut the film.')

  if (p) {
    const { strongest, weakest } = strongestWeakest(p)
    if (strongest.greenlightFit >= 70) {
      out.push(`${strongest.name}’s ${strongest.role} casting was a standout fit for the material.`)
    }
    if (weakest.greenlightFit < 45 && out.length < 3) {
      out.push(`${weakest.name} was a stretch in the ${weakest.role} role.`)
    }
  }
  if (out.length < 3) {
    if (d.boxDelta === 'better') out.push('The film outperformed its box-office forecast.')
    else if (d.boxDelta === 'worse') out.push('The film came in under its box-office forecast.')
  }
  if (out.length < 3) {
    // D-17A/T2 — LABEL TRUTHFULNESS. `profitable` is the FULL-RUN projection made at release
    // (projected total Studio Revenue − committed cost); at this moment only the opening week
    // has been credited, so "finished" claimed a settled result the studio has not banked.
    // The clipping already labels the figure itself "Projected film contribution"; this line
    // now agrees with it. Value and trigger unchanged.
    out.push(
      d.profitable
        ? 'Across its full run the release is projected to finish in profit.'
        : 'Across its full run the release is projected to finish at a loss.',
    )
  }
  return out.slice(0, 3)
}

// Build the newspaper view, or null for a film with no immutable record (legacy/M0A).
export function buildNewspaper(input: NewspaperInput): NewspaperView | null {
  const { film, conceptTitle, committedCost, segmentShares } = input
  if (film.participants === undefined) return null

  const critic = film.criticScore
  const aud = aggregateAudienceScore(film.segmentScores, segmentShares)
  const boxOffice = film.boxOffice.total
  // D-12 beta P3: separate what is BANKED this opening week from the PROJECTED full-run totals.
  const projectedTotalGross = boxOffice
  const share =
    input.studioShare ??
    (input.studioRevenue !== undefined && projectedTotalGross > 0 ? input.studioRevenue / projectedTotalGross : 1)
  const projectedTotalStudioRevenue = input.studioRevenue ?? projectedTotalGross * share
  const openingGross = input.openingGross ?? film.boxOffice.opening
  const studioRevenueThisWeek = openingGross * share
  const studioRevenueStillToCome = Math.max(0, projectedTotalStudioRevenue - studioRevenueThisWeek)
  // PROJECTED contribution (NOT realized until the run completes) = projected Studio Revenue − cost.
  const profit = projectedTotalStudioRevenue - committedCost
  const expectedCritic = film.forecast?.expectedCriticScore ?? critic
  const expectedTotal = film.forecast?.expectedTotal ?? boxOffice
  const criticDelta = deltaOf(critic, expectedCritic, 5)
  const boxDelta = deltaOf(boxOffice, expectedTotal, Math.max(1, expectedTotal * 0.1))

  const dims: DimsWithCost = {
    title: conceptTitle,
    critic,
    criticTier: criticTier(critic),
    aud,
    audTier: audienceTier(aud),
    boxOffice,
    profit,
    profitable: profit >= 0,
    criticDelta,
    boxDelta,
    cohesion: film.cohesion,
    committedCostRef: committedCost,
  }
  const { headline, subheadline } = makeHeadline(dims)

  return {
    masthead: NEWSPAPER_MASTHEAD,
    week: input.week ?? film.releaseTick,
    filmTitle: conceptTitle,
    headline,
    subheadline,
    critic: { stars: criticStars(critic), score: Math.round(critic) },
    audience: { tier: dims.audTier, label: AUDIENCE_LABEL[dims.audTier], score: Math.round(aud) },
    financial: {
      openingGross,
      studioRevenueThisWeek,
      projectedTotalGross,
      projectedTotalStudioRevenue,
      studioRevenueStillToCome,
      totalCommitment: committedCost,
      projectedContribution: profit,
      projectedContributionLabel: profit >= 0 ? 'Projected profit' : 'Projected loss',
      disclosure: DISCLOSURE,
    },
    forecast: { expectedCritic: Math.round(expectedCritic), expectedTotal, criticDelta, boxDelta },
    callouts: makeCallouts(dims, film),
    participants: film.participants,
  }
}
