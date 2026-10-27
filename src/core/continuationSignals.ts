// ── P17 Recognition / Momentum / Fatigue — the canonical rev02 §5.2/§5.3/§8/§9/§11 calculator ──
//
// Canonical authority: revision 02 at f2eff6356fca3e6d5287e690bf2404867d638906,
// docs/research/p17-independent-verification-01/P17-INDEPENDENT-VERIFICATION-REPORT.md §5.2 (kernel,
// bands), §5.3 (awareness input, comparison terms), §5.7 (symbol index), §8, §9, §11; Owner choices in
// P17-RECOVERED-SPECIFICATION-STATE.md (0.35 quality-qualified floor; healthy reboot legal; dormant
// DirectSequel is a band, not a type). Every constant is a named TUNING entry copied from the calculator.
//
// Pure arithmetic over plain data: no RNG, no state, no I/O. Recognition and Fatigue are one scalar set
// per StoryProperty (`PropertyMeter`); Momentum is one scalar per continuity (`BranchMomentum`). The
// meters are O(1) running scalars reproducible from the lineage edges plus the public FilmResults.

import { clamp } from './math.js'
import { TUNING } from './tuning.js'
import type { ContinuationType, PropertyMeter } from './types.js'

export type { ContinuationType, PropertyMeter } from './types.js'

export const P17_CONTINUATION_TYPES = ['directSequel', 'prequel', 'remake', 'reboot', 'spinOff'] as const satisfies readonly ContinuationType[]

/** One continuity's fast meter: the fields a `FranchiseBranch` carries for Momentum and its release gaps. */
export type BranchMomentum = {
  momentum: number
  momentumUpdateWeek: number
  lastReleaseWeek: number | null
  priorGapWeeks: number | null
}

/** What one release contributes, read once from the public FilmResult (never written). */
export type ReleaseFacts = {
  installmentId: string
  week: number
  critic01: number
  audience01: number
  total: number
  /** The locked greenlight forecast's expectedTotal; null when the film carries none (comparator 1). */
  expectedTotal: number | null
}

export type ContinuationBand = 'new' | 'active' | 'activeAgain' | 'cooling' | 'dormant' | 'revivalCandidate'

const T = TUNING

export function emptyMeter(week: number): PropertyMeter {
  return { bestScore: 0, residualScoreSum: 0, peakInstallmentId: null, rPeak: 0, fatigue: 0, fatigueUpdateWeek: week, fatigueLastQuality: null, releaseCount: 0, firstFilmExempt: true }
}

export function emptyMomentum(week: number): BranchMomentum {
  return { momentum: 0, momentumUpdateWeek: week, lastReleaseWeek: null, priorGapWeeks: null }
}

// ── §5.2 inputs ──────────────────────────────────────────────────────────────
export function qualityOf(critic01: number, audience01: number): number {
  return T.P17_QUALITY_CRITIC_WEIGHT * critic01 + (1 - T.P17_QUALITY_CRITIC_WEIGHT) * audience01
}

/** The starPower.ts half-saturation reach helper, same constant, same meaning (rev02 §5.2, §17). */
export function reach01(total: number): number {
  const t = Math.max(0, total)
  return t / (t + T.STAR_POWER_REACH_HALF)
}

export function surpriseOf(total: number, expectedTotal: number | null, quality: number): number {
  const comparator = expectedTotal !== null && expectedTotal > 0 ? Math.max(0, total) / expectedTotal : 1
  return clamp(T.P17_SURPRISE_COMPARATOR_WEIGHT * (comparator - 1) + (quality - T.P17_SURPRISE_QUALITY_PIVOT), -1, 1)
}

export function similarityOf(type: ContinuationType): number {
  return T.P17_SIMILARITY[type]
}

function halfLifeDecay(deltaWeeks: number, halfLife: number): number {
  return Math.pow(2, -Math.max(0, deltaWeeks) / halfLife)
}

// ── Recognition: property-wide, peak-anchored, quality-gated, slow ────────────
function recognitionGate(q: number): number {
  return clamp((q - T.P17_RECOGNITION_GATE_LO) / T.P17_RECOGNITION_GATE_SPAN, 0, 1)
}

/** R(t) before the floor. */
export function recognitionAt(meter: PropertyMeter, week: number): number {
  const base = (meter.bestScore + T.P17_RECOGNITION_RESIDUAL_WEIGHT * meter.residualScoreSum) * Math.pow(2, -week / T.P17_RECOGNITION_HALF_LIFE_WEEKS)
  return clamp(100 * base, 0, 100)
}

/** R_reported = max(R, FLOOR·rPeak): the Owner-adopted durable floor of the quality-qualified peak. */
export function recognitionReported(meter: PropertyMeter, week: number): number {
  return Math.max(recognitionAt(meter, week), T.P17_RECOGNITION_FLOOR_FRACTION * meter.rPeak)
}

// ── Fatigue: one scalar per StoryProperty, satiation-gated, quality-scaled paydown ──
function fatigueHalfLife(lastQuality: number | null): number {
  const excellence = lastQuality === null ? 0 : clamp((lastQuality - T.P17_FATIGUE_PAYDOWN_Q_FLOOR) / T.P17_FATIGUE_PAYDOWN_Q_SPAN, 0, 1)
  return T.P17_FATIGUE_HALF_LIFE_BASE_WEEKS / (1 + T.P17_FATIGUE_PAYDOWN_COEF * excellence)
}

export function fatigueAt(meter: PropertyMeter, week: number): number {
  if (meter.fatigue === 0) return 0
  return meter.fatigue * halfLifeDecay(week - meter.fatigueUpdateWeek, fatigueHalfLife(meter.fatigueLastQuality))
}

function satiationGate(q: number): number {
  return q >= T.P17_FATIGUE_SATIATION_Q ? 0 : clamp((T.P17_FATIGUE_SATIATION_Q - q) / T.P17_FATIGUE_SATIATION_SPAN, 0, 1)
}

/**
 * Register one release on a property meter. Recognition registers always; Fatigue accrues at the
 * continuation's similarity unless this is the StoryProperty's first-ever film (C5) or the caller asks
 * for a Recognition-only registration (a spin-off's release registers on its parent's Recognition while
 * its Fatigue lives on the SubProperty, rev02 §5.4 Case B / §9).
 */
export function registerRelease(meter: PropertyMeter, facts: ReleaseFacts, opts: { similarity: number; recognitionOnly?: boolean }): PropertyMeter {
  const q = qualityOf(facts.critic01, facts.audience01)
  const score = reach01(facts.total) * q * recognitionGate(q) * Math.pow(2, facts.week / T.P17_RECOGNITION_HALF_LIFE_WEEKS)
  let bestScore = meter.bestScore
  let residualScoreSum = meter.residualScoreSum
  let peakInstallmentId = meter.peakInstallmentId
  if (score > bestScore) {
    residualScoreSum += bestScore
    bestScore = score
    peakInstallmentId = facts.installmentId
  } else {
    residualScoreSum += score
  }
  const withRecognition: PropertyMeter = { ...meter, bestScore, residualScoreSum, peakInstallmentId }
  const rPeak = Math.max(meter.rPeak, recognitionAt(withRecognition, facts.week))
  if (opts.recognitionOnly) return { ...withRecognition, rPeak }
  const founding = meter.firstFilmExempt && meter.releaseCount === 0
  const accrual = founding ? 0 : 100 * opts.similarity * (1 - q) * satiationGate(q)
  const fatigue = fatigueAt(meter, facts.week) + accrual
  return {
    ...withRecognition,
    rPeak,
    fatigue,
    fatigueUpdateWeek: facts.week,
    fatigueLastQuality: q,
    releaseCount: meter.releaseCount + 1,
  }
}

// ── Momentum: per continuity, fast, decays to neutral ────────────────────────
export function momentumAt(m: BranchMomentum, week: number): number {
  if (m.momentum === 0) return 0
  return m.momentum * halfLifeDecay(week - m.momentumUpdateWeek, T.P17_MOMENTUM_HALF_LIFE_WEEKS)
}

export function registerBranchRelease<B extends BranchMomentum>(m: B, facts: ReleaseFacts): B {
  const q = qualityOf(facts.critic01, facts.audience01)
  return {
    ...m,
    momentum: momentumAt(m, facts.week) + 100 * surpriseOf(facts.total, facts.expectedTotal, q),
    momentumUpdateWeek: facts.week,
    priorGapWeeks: m.lastReleaseWeek === null ? null : facts.week - m.lastReleaseWeek,
    lastReleaseWeek: facts.week,
  }
}

// ── §5.3 the one awareness input ─────────────────────────────────────────────
export function awarenessInput(v: { recognition: number; momentum: number; fatigue: number }): number {
  const positive = clamp(T.P17_AWARENESS_RECOGNITION_WEIGHT * (v.recognition / 100) + T.P17_AWARENESS_MOMENTUM_WEIGHT * (Math.max(v.momentum, 0) / 100), 0, 1)
  return positive * (1 - T.P17_FATIGUE_AWARENESS_WEIGHT * (Math.min(v.fatigue, 100) / 100))
}

/** remakeComparison01 = 0.5·q_ref·2^(−age/260 wk), applied as × (1 − comparison) on the awareness input. */
export function remakeComparison(qRef: number, ageWeeks: number): number {
  return T.P17_REMAKE_COMPARISON_WEIGHT * qRef * halfLifeDecay(ageWeeks, T.P17_REMAKE_HALF_LIFE_WEEKS)
}

/** A reboot pays 0.4× the remake term, only against a recent (< 416 wk) AND strong (q ≥ 0.65) prior film. */
export function rebootComparison(qRef: number, ageWeeks: number): number {
  if (!(ageWeeks < T.P17_REBOOT_REF_RECENT_WEEKS) || !(qRef >= T.P17_REBOOT_REF_STRONG_Q)) return 0
  return T.P17_REBOOT_PARTIAL_WEIGHT * remakeComparison(qRef, ageWeeks)
}

/** 0.75 + 0.25·credit (§11); exactly 1 when no association exists (no continuity credit before a branch's third film). */
export function continuityMultiplier(credit: number | null): number {
  if (credit === null) return 1
  return T.P17_CONTINUITY_CREDIT_FLOOR + (1 - T.P17_CONTINUITY_CREDIT_FLOOR) * clamp(credit, 0, 1)
}

export function composeInheritedAwareness(v: { recognition: number; momentum: number; fatigue: number; comparison01: number; continuityCredit: number | null }): number {
  return clamp(awarenessInput(v) * (1 - clamp(v.comparison01, 0, 1)) * continuityMultiplier(v.continuityCredit), 0, 1)
}

/**
 * The ONE P07 entry (CONTRACT GAP (P17): rev02 §7/§17 name the entry — `preMarketingAwarenessOf` and the
 * organic awareness term — but not its arithmetic; "P07 keeps the formula". Narrowest reading with no new
 * constant: the inherited awareness raises the studio's audience awareness by probabilistic OR, so a
 * known property is simply "already visible". Callers branch on ABSENCE before calling this, which is
 * what keeps the zero-continuation path bit-identical.)
 */
export function continuationAwareness(audienceAwareness: number, inheritedAwareness01: number): number {
  const a = clamp(audienceAwareness, 0, 100) / 100
  const i = clamp(inheritedAwareness01, 0, 1)
  return 100 * (1 - (1 - a) * (1 - i))
}

// ── §5.2 bands — derived, never stored ───────────────────────────────────────
export function branchBand(m: BranchMomentum, meter: PropertyMeter, week: number): ContinuationBand {
  if (m.lastReleaseWeek === null) return 'new'
  const since = week - m.lastReleaseWeek
  if (since >= T.P17_DORMANT_WEEKS) return recognitionReported(meter, week) >= T.P17_REVIVAL_R_BAR ? 'revivalCandidate' : 'dormant'
  const momentum = momentumAt(m, week)
  if (m.priorGapWeeks !== null && m.priorGapWeeks >= T.P17_DORMANT_WEEKS && since < T.P17_REACT_WINDOW_WEEKS && momentum >= 0) return 'activeAgain'
  if (momentum < T.P17_MOMENTUM_COOL || fatigueAt(meter, week) >= T.P17_FATIGUE_HOT) return 'cooling'
  return 'active'
}

/** Open = NEW with a greenlit, unreleased installment, or fewer than DORMANT_WEEKS past its last release. */
export function isContinuityOpen(m: BranchMomentum, hasUnreleasedInstallment: boolean, week: number): boolean {
  if (hasUnreleasedInstallment) return true
  if (m.lastReleaseWeek === null) return false
  return week - m.lastReleaseWeek < T.P17_DORMANT_WEEKS
}

// ── §9 SubProperty seed ──────────────────────────────────────────────────────
export function hookTransferFraction(hookWeight: number): number {
  return T.P17_SPINOFF_TRANSFER_BASE + T.P17_SPINOFF_TRANSFER_HOOK_COEF * clamp(hookWeight, 0, 1)
}

/** R_sp = fraction·R_parent, F_sp = 0.5·F_parent, M_sp = 0 (on its branch); the parent is never consumed. */
export function seedSubPropertyMeter(parent: PropertyMeter, hookWeight: number, week: number): PropertyMeter {
  const rSeed = hookTransferFraction(hookWeight) * recognitionReported(parent, week)
  return {
    bestScore: (rSeed / 100) * Math.pow(2, week / T.P17_RECOGNITION_HALF_LIFE_WEEKS),
    residualScoreSum: 0,
    peakInstallmentId: null,
    rPeak: rSeed,
    fatigue: T.P17_SPINOFF_FATIGUE_INHERIT * fatigueAt(parent, week),
    fatigueUpdateWeek: week,
    fatigueLastQuality: parent.fatigueLastQuality,
    releaseCount: 0,
    // C5: the audience has seen this story before — a spin-off's founding film accrues at its own similarity.
    firstFilmExempt: false,
  }
}

