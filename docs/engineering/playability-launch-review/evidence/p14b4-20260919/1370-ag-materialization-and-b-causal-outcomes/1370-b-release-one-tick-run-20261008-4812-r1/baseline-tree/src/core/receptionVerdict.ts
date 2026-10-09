// ── P07A W0 — the ONE canonical reception-verdict + shared film-finance module ──
//
// D3 ruling: there is NO universal Movie Quality score. Critic, Audience, and Business
// are three independent channels; they may correlate or disagree. This module is the
// single source of the reception-verdict *logic* that was previously forked across
// `ui/src/engine/adapter.ts` (the coarse lot band), `src/core/newspaper.ts` (critic
// tier + audience tier + critic stars), and the duplicated `filmCommittedCost` /
// `filmAudienceScore` helpers (studioRunRecap.ts + adapter.ts).
//
// Behavior is PRESERVED VERBATIM — every threshold and label below is copied from the
// accepted shipped implementations (D3: do not retune numbers because implementations
// disagreed). Pure: no RNG, no wall-clock, no state mutation. Unity consumes the result;
// Unity never independently classifies (the canonical bands are computed here in TS).

import { clamp } from './math.js'
import type { FilmResult, GameState, SegmentId } from './types.js'

// ── Critic channel ────────────────────────────────────────────────────────────

/** Critic stars — 0..5 in half-star steps from the 0..100 critic score (was newspaper.ts). */
export type CriticRating = { stars: number; score: number }
export function criticStars(criticScore: number): number {
  const raw = criticScore / 20
  const half = Math.round(raw * 2) / 2 // nearest half
  return clamp(half, 0, 5)
}

/**
 * Coarse critic reception BAND — the shipped lot/bridge reception verdict (was the
 * `lotReceptionBand` in ui/src/engine/adapter.ts, which feeds StudioLotSnapshot.reception
 * and therefore the bridge `reception` enum). Critic-only, NOT box office.
 */
export type ReceptionBand = 'flop' | 'mixed' | 'hit' | 'smash'
export const CRITIC_BAND_THRESHOLDS = { flopBelow: 40, mixedBelow: 60, hitBelow: 80 } as const
export function criticBand(criticScore: number): ReceptionBand {
  if (criticScore < CRITIC_BAND_THRESHOLDS.flopBelow) return 'flop'
  if (criticScore < CRITIC_BAND_THRESHOLDS.mixedBelow) return 'mixed'
  if (criticScore < CRITIC_BAND_THRESHOLDS.hitBelow) return 'hit'
  return 'smash'
}

/**
 * Editorial critic TIER — the finer 5-band used for newspaper headline selection
 * (was the internal `criticTier` in newspaper.ts, now canonical + exported). Distinct
 * granularity/thresholds from `criticBand`; both are accepted shipped behavior.
 */
export type CriticTier = 'pan' | 'mixed' | 'favorable' | 'strong' | 'rave'
export const CRITIC_TIER_THRESHOLDS = { panBelow: 35, mixedBelow: 55, favorableBelow: 70, strongBelow: 85 } as const
export function criticTier(score: number): CriticTier {
  if (score < CRITIC_TIER_THRESHOLDS.panBelow) return 'pan'
  if (score < CRITIC_TIER_THRESHOLDS.mixedBelow) return 'mixed'
  if (score < CRITIC_TIER_THRESHOLDS.favorableBelow) return 'favorable'
  if (score < CRITIC_TIER_THRESHOLDS.strongBelow) return 'strong'
  return 'rave'
}

// ── Audience channel ────────────────────────────────────────────────────────────

/** Audience reaction tier from the supported segment aggregate (was newspaper.ts). */
export type AudienceTier = 'hated' | 'disliked' | 'divided' | 'liked' | 'loved'
export const AUDIENCE_LABEL: Record<AudienceTier, string> = {
  hated: 'Audiences hated it',
  disliked: 'Audiences disliked it',
  divided: 'Audiences were divided',
  liked: 'Audiences liked it',
  loved: 'Audiences loved it',
}
export const AUDIENCE_TIER_THRESHOLDS = { hatedBelow: 30, dislikedBelow: 45, dividedBelow: 57, likedBelow: 72 } as const
export function audienceTier(aggregateScore: number): AudienceTier {
  if (aggregateScore < AUDIENCE_TIER_THRESHOLDS.hatedBelow) return 'hated'
  if (aggregateScore < AUDIENCE_TIER_THRESHOLDS.dislikedBelow) return 'disliked'
  if (aggregateScore < AUDIENCE_TIER_THRESHOLDS.dividedBelow) return 'divided'
  if (aggregateScore < AUDIENCE_TIER_THRESHOLDS.likedBelow) return 'liked'
  return 'loved'
}

/**
 * Share-weighted aggregate of per-segment scores (the supported aggregate; the full
 * autopsy keeps per-segment detail). Falls back to a plain mean if shares are absent.
 * (Was newspaper.ts `aggregateAudienceScore`.)
 */
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

/**
 * Share-weighted audience score of a released film over the live market segments.
 * Canonical consolidation of the two identical `filmAudienceScore` bodies that lived
 * in `src/core/studioRunRecap.ts` and `ui/src/engine/adapter.ts`.
 */
export function filmAudienceScore(state: GameState, film: FilmResult): number {
  let was = 0
  for (const seg of state.market.segments) was += seg.share * (film.segmentScores[seg.id] ?? 0)
  return was
}

// ── Business channel (committed cost) ───────────────────────────────────────────

/**
 * Committed cost of one released film = −Σ ledger[production|freelancerFee] for its id
 * (D-12 §3: negative production + marketing + engaged freelancer fees). Canonical
 * consolidation of the two identical `filmCommittedCost` bodies (studioRunRecap.ts +
 * adapter.ts). This is BOX-OFFICE-independent direct film commitment, not studio profit.
 */
export function filmCommittedCost(state: GameState, productionId: string): number {
  let c = 0
  for (const e of state.ledger) {
    if (e.productionId === productionId && (e.kind === 'production' || e.kind === 'freelancerFee')) {
      c -= e.amount
    }
  }
  return c
}
