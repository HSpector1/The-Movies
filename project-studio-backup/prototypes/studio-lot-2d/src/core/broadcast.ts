// ── §8 Broadcast (minimal deterministic core) ────────────────────────────────
// The phase-4 §8 surface: narrate release outcomes deterministically and maintain
// state.broadcastItems (aired items only). This module is PURE and deterministic:
// no React/DOM/async/IO, no time, no locale sort, no unseeded entropy. It reads
// ONLY the values passed to it plus the already-aired items handed in. It never
// draws from any RNG stream — broadcast is not a sampled process.
//
// What broadcast MUST NOT do (§8 + brief): change cash, standing, reception,
// forecast, or rngState; use an LLM; invent causal prose beyond the fixed
// primaryCause rule; be nondeterministic. The ONLY state it produces is a list of
// BroadcastItem (aired items).
//
// Rev. 4 references folded in:
//   B22 — phases 1–4 generate release-topic candidates only (one per released
//         film). The talent/studio/cultural editorialRelevance branches are
//         implemented for §8 completeness but are UNREACHABLE here (documented at
//         the branch). No other template families.
//   B23 — BroadcastFacts derivation: forecastBand = band(Σ_s segShare·estimate_s)
//         over the stored per-segment noisy estimates (M7); realizedBand =
//         band(weightedAudienceScore); direction by ordinal band comparison
//         (threshold-free); primaryCause by FIXED precedence.
//   B24 — ranking-factor inputs: magnitude vs the PRE-noise forecastCenter
//         (Σ_s segShare·center_s), prominence = leadFame/100, novelty over aired
//         release items in the window, cooldown over same-subject aired items.
//   M10 — novelty = clamp(1 − matching/BROADCAST_WINDOW, 0, 1).
//   M14 — state.broadcastItems holds aired items only; makeSave mirrors it into
//         broadcastCache. asExpected items never air, so replay is unaffected.
//
// Determinism note: segments are iterated in market order (the order the caller
// passes them, which tick threads as state.market.segments); no sort is performed
// here on floating-point quantities.

import { clamp, mean } from './math.js'
import { bandOf } from './forecast.js'
import { TUNING } from './tuning.js'
import type {
  BroadcastFacts,
  BroadcastItem,
  ForecastBand,
  Forecast,
  Segment,
  Standing,
} from './types.js'

// The two template ids for phases 1–4 (release-better / release-worse). No other
// template families (§8: "two crude templates").
export const RELEASE_BETTER_TEMPLATE_ID = 'release-better' as const
export const RELEASE_WORSE_TEMPLATE_ID = 'release-worse' as const

// The topic covered in phases 1–4 (B22 — release only).
type BroadcastTopic = 'release' | 'talent' | 'studio' | 'cultural'

// ── Ordinal band ranking (weak < mixed < strong) ─────────────────────────────
// direction compares realizedBand vs forecastBand on this ordinal scale (B23).
const BAND_ORDINAL: Record<ForecastBand, number> = { weak: 0, mixed: 1, strong: 2 }

// ── The explicit inputs one release candidate reads ──────────────────────────
// Everything broadcast needs for one released film, threaded from tick step 5.
// No state traversal below the harness boundary: all lookups are pre-resolved.
export type ReleaseBroadcastInputs = {
  // subjectId = filmId = productionId (B23).
  productionId: string
  // The production's forecast snapshot (holds per-segment center + noisy estimate).
  forecastSnapshot: Forecast
  // The market segments (share + id), iterated in market order for the two sums.
  segments: readonly Segment[]
  // Realized reception intermediates (all on the §5 ReceptionResult).
  weightedAudienceScore: number // 0..100
  mismatchPenalty: number
  cohesion: number
  timelinessContribution: number
  awarenessFactor: number
  // Lead cast member fame (0..100) → prominence.
  leadFame: number
  // Studio standing AS IT STANDS when step 5 runs (after step-4 STANDING updates).
  standing: Standing
  // Optional nicer copy: the concept title (looked up conceptId→state.concepts by
  // the caller). Crude and deterministic; omission is fine.
  conceptTitle?: string
  // The tick this release airs on (currentTick).
  tick: number
}

// ── B23: BroadcastFacts derivation ───────────────────────────────────────────
// forecastBand from the share-weighted mean of the per-segment NOISY estimates
// (M7 — the studio's belief); realizedBand from the realized weightedAudienceScore.
// Both quantities are convex combinations of 0..100 scores, so §7's thresholds
// (<40 weak / 40–70 mixed / >70 strong) via bandOf apply coherently.
//
// Segments are aligned to the snapshot by segmentId; iteration follows market
// order (deterministic; no sort).
export function deriveFacts(inp: ReleaseBroadcastInputs): BroadcastFacts {
  const estimateBySegment = new Map(inp.forecastSnapshot.segments.map((s) => [s.segmentId, s.estimate]))

  let forecastEstimateWeighted = 0
  for (const seg of inp.segments) {
    const estimate = estimateBySegment.get(seg.id)
    if (estimate === undefined) {
      // A snapshot missing a market segment is a harness bug, not a game event
      // (mirrors the loud-rejection posture in tick/actions).
      throw new Error(`broadcast: forecastSnapshot has no estimate for segment "${seg.id}"`)
    }
    forecastEstimateWeighted += seg.share * estimate
  }

  const forecastBand = bandOf(forecastEstimateWeighted)
  const realizedBand = bandOf(inp.weightedAudienceScore)

  // direction: ordinal-compare realizedBand vs forecastBand on weak<mixed<strong.
  const realizedRank = BAND_ORDINAL[realizedBand]
  const forecastRank = BAND_ORDINAL[forecastBand]
  const direction: BroadcastFacts['direction'] =
    realizedRank > forecastRank ? 'better' : realizedRank < forecastRank ? 'worse' : 'asExpected'

  // primaryCause by FIXED precedence (B23):
  //   'promise'  if mismatchPenalty ≥ 6
  //   'cohesion' if cohesion < COHESION_SMOOTH_LO
  //   'timing'   if |timelinessContribution| ≥ 5
  //   'reach'    if awarenessFactor < 0.35
  //   'craft'    otherwise
  let primaryCause: BroadcastFacts['primaryCause']
  if (inp.mismatchPenalty >= 6) {
    primaryCause = 'promise'
  } else if (inp.cohesion < TUNING.COHESION_SMOOTH_LO) {
    primaryCause = 'cohesion'
  } else if (Math.abs(inp.timelinessContribution) >= 5) {
    primaryCause = 'timing'
  } else if (inp.awarenessFactor < 0.35) {
    primaryCause = 'reach'
  } else {
    primaryCause = 'craft'
  }

  return {
    subjectId: inp.productionId,
    filmId: inp.productionId,
    forecastBand,
    realizedBand,
    primaryCause,
    direction,
  }
}

// ── B24: forecastCenter (PRE-noise, for magnitude) ───────────────────────────
// forecastCenter = Σ_s segShare·center_s over the pre-noise segment centers.
// §8's "magnitude compares realized against the forecast center" (the
// deterministic quantity), distinct from B23's noisy-estimate forecastBand.
function forecastCenter(inp: ReleaseBroadcastInputs): number {
  const centerBySegment = new Map(inp.forecastSnapshot.segments.map((s) => [s.segmentId, s.center]))
  let weighted = 0
  for (const seg of inp.segments) {
    const center = centerBySegment.get(seg.id)
    if (center === undefined) {
      throw new Error(`broadcast: forecastSnapshot has no center for segment "${seg.id}"`)
    }
    weighted += seg.share * center
  }
  return weighted
}

// ── §8 editorialRelevance ────────────────────────────────────────────────────
// release  → mean(audienceAwareness, commercialConfidence)/100
// talent   → industryPrestige/100
// studio   → mean(all three)/100
// cultural → 1
//
// Only the 'release' branch is reachable in phases 1–4 (B22). The other three are
// implemented for §8 completeness and are UNREACHABLE here — no phase-1–4 event
// produces a talent/studio/cultural item.
export function editorialRelevance(topic: BroadcastTopic, standing: Standing): number {
  switch (topic) {
    case 'release':
      return mean([standing.audienceAwareness, standing.commercialConfidence]) / 100
    case 'talent': // UNREACHABLE in phases 1–4 (B22): no talent items generated.
      return standing.industryPrestige / 100
    case 'studio': // UNREACHABLE in phases 1–4 (B22): no studio items generated.
      return (
        mean([
          standing.audienceAwareness,
          standing.industryPrestige,
          standing.commercialConfidence,
        ]) / 100
      )
    case 'cultural': // UNREACHABLE in phases 1–4 (B22): no cultural items generated.
      return 1
  }
}

// ── Window predicate ─────────────────────────────────────────────────────────
// Window boundary reading (documented): an aired item counts as "in the window"
// at currentTick iff airedTick > currentTick − BROADCAST_WINDOW. With
// BROADCAST_WINDOW = 6 and a film airing at currentTick T, the window is the six
// ticks {T-5, T-4, T-3, T-2, T-1, T} — i.e. the current tick and the five
// immediately preceding it. (T itself qualifies, so same-tick earlier aired items
// are counted — the brief requires later same-tick releases to see earlier ones.)
function inWindow(airedTick: number, currentTick: number): boolean {
  return airedTick > currentTick - TUNING.BROADCAST_WINDOW
}

// ── §8 ranking + air decision (B24 / M10) ────────────────────────────────────
// All factors normalize 0..1.
//   forecastCenter = Σ_s segShare·center_s (PRE-noise)
//   magnitude   = clamp(|weightedAudienceScore − forecastCenter| / 50, 0, 1)
//   prominence  = clamp(leadFame/100, 0, 1)
//   editorialRelevance = release branch = mean(awareness, confidence)/100
//   novelty     = clamp(1 − matching/BROADCAST_WINDOW, 0, 1)   (M10)
//     matching  = ALREADY-AIRED items (aired earlier + earlier this tick) with
//                 topic 'release' and airedTick in the window.
//   cooldown    = exp(−mentionsInWindow · BROADCAST_COOLDOWN_K)
//     mentions  = aired items with the SAME subjectId in the window (0 for a
//                 first-time film → cooldown = 1).
//   rankScore   = magnitude · editorialRelevance · prominence · novelty · cooldown
//   air         = rankScore ≥ BROADCAST_THRESHOLD  AND  direction ≠ asExpected
export type RankingBreakdown = {
  forecastCenter: number
  magnitude: number
  prominence: number
  editorialRelevance: number
  novelty: number
  cooldown: number
  rankScore: number
  air: boolean
}

export function rankRelease(
  inp: ReleaseBroadcastInputs,
  facts: BroadcastFacts,
  aired: readonly BroadcastItem[],
): RankingBreakdown {
  const center = forecastCenter(inp)
  const magnitude = clamp(Math.abs(inp.weightedAudienceScore - center) / 50, 0, 1)
  const prominence = clamp(inp.leadFame / 100, 0, 1)
  const relevance = editorialRelevance('release', inp.standing)

  // matching: aired release items within the window (M10 novelty).
  let matching = 0
  // mentionsInWindow: aired items with the same subjectId within the window.
  let mentionsInWindow = 0
  for (const item of aired) {
    if (!inWindow(item.tick, inp.tick)) continue
    if (item.topic === 'release') matching++
    if (item.subjectId === inp.productionId) mentionsInWindow++
  }

  const novelty = clamp(1 - matching / TUNING.BROADCAST_WINDOW, 0, 1)
  const cooldown = Math.exp(-mentionsInWindow * TUNING.BROADCAST_COOLDOWN_K)

  const rankScore = magnitude * relevance * prominence * novelty * cooldown

  // asExpected items NEVER air (the two-template contract covers better/worse only).
  const air = facts.direction !== 'asExpected' && rankScore >= TUNING.BROADCAST_THRESHOLD

  return {
    forecastCenter: center,
    magnitude,
    prominence,
    editorialRelevance: relevance,
    novelty,
    cooldown,
    rankScore,
    air,
  }
}

// ── Templates ────────────────────────────────────────────────────────────────
// Two crude, fixed-format, deterministic templates keyed by direction. `template`
// holds the canonical rendered copy (§3-refutation: the template field IS the
// rendered string; generatedCopy is never set in this contract).
//
// A film "subject" string: the concept title if the caller supplied one, else the
// productionId — crude but deterministic either way.
function subjectLabel(inp: ReleaseBroadcastInputs): string {
  return inp.conceptTitle !== undefined ? inp.conceptTitle : inp.productionId
}

// Band → a crude fixed word. Kept local so the copy never depends on locale.
const BAND_WORD: Record<ForecastBand, string> = { weak: 'weak', mixed: 'mixed', strong: 'strong' }

// primaryCause → a crude fixed phrase for the copy.
const CAUSE_PHRASE: Record<NonNullable<BroadcastFacts['primaryCause']>, string> = {
  promise: 'a promise it did not keep',
  cohesion: 'a lack of cohesion',
  timing: 'its cultural timing',
  reach: 'limited reach',
  craft: 'its craft',
}

export function renderReleaseTemplate(inp: ReleaseBroadcastInputs, facts: BroadcastFacts): string {
  const label = subjectLabel(inp)
  const forecastWord = facts.forecastBand !== undefined ? BAND_WORD[facts.forecastBand] : 'unknown'
  const realizedWord = facts.realizedBand !== undefined ? BAND_WORD[facts.realizedBand] : 'unknown'
  const causeWord = facts.primaryCause !== undefined ? CAUSE_PHRASE[facts.primaryCause] : 'unknown factors'

  // Two fixed formats, keyed by direction. (asExpected never reaches here — it does
  // not air — but the switch is total for type-safety.)
  switch (facts.direction) {
    case 'better':
      return `${label} outperformed its ${forecastWord} forecast, landing ${realizedWord}, on ${causeWord}.`
    case 'worse':
      return `${label} fell short of its ${forecastWord} forecast, landing ${realizedWord}, on ${causeWord}.`
    case 'asExpected':
      return `${label} landed as expected (${realizedWord}).`
  }
}

// The template id keyed by direction (release-better / release-worse). asExpected
// items never air, so they have no template id here.
export function releaseTemplateId(facts: BroadcastFacts): string | undefined {
  if (facts.direction === 'better') return RELEASE_BETTER_TEMPLATE_ID
  if (facts.direction === 'worse') return RELEASE_WORSE_TEMPLATE_ID
  return undefined
}

// ── Public entry: evaluate one released film ─────────────────────────────────
// Derives facts, ranks against the already-aired items, and returns the aired
// BroadcastItem (or null if it does not air). PURE — reads only its inputs and the
// aired list. The caller (tick step 5) accumulates aired items so later same-tick
// releases see earlier same-tick aired items in their window.
export function evaluateReleaseBroadcast(
  inp: ReleaseBroadcastInputs,
  aired: readonly BroadcastItem[],
): BroadcastItem | null {
  const facts = deriveFacts(inp)
  const ranking = rankRelease(inp, facts, aired)
  if (!ranking.air) return null

  const template = renderReleaseTemplate(inp, facts)

  return {
    subjectId: inp.productionId,
    topic: 'release',
    facts,
    template,
    tick: inp.tick,
  }
}
