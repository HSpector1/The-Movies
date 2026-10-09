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

import {
  criticStars,
  criticTier,
  audienceTier,
  aggregateAudienceScore,
  AUDIENCE_LABEL,
} from './receptionVerdict.js'
import type { AudienceTier, CriticRating, CriticTier } from './receptionVerdict.js'
import type {
  FilmParticipant,
  FilmParticipants,
  FilmResult,
  FilmShape,
  Genre,
  Promise as FilmPromise,
  SegmentId,
} from './types.js'

// Original fictional entertainment-industry newspaper (not a real publication).
export const NEWSPAPER_MASTHEAD = 'The Silver Screen Gazette'

// ── reception verdicts (P07A W0) — canonical source: ./receptionVerdict.js ─────
// criticStars / audienceTier / aggregateAudienceScore and the AudienceTier / CriticRating
// types are re-exported here so the public core/index.ts surface is unchanged. The
// threshold logic and labels now live in the single canonical module (D3).
export { criticStars, audienceTier, aggregateAudienceScore }
export type { AudienceTier, CriticRating }

// ── Film Chronicle V1 — pure, durable released-film identity ────────────────
// This is deliberately a narrow projection rather than a GameState selector. The
// adapter supplies only the exact persisted witnesses associated with one released
// film. Nothing here reads current talent, current employment, delivered expression,
// RNG, or wall-clock state.
export type FilmChronicleScriptInput = {
  productionId: string | null
  writerId: string
  shape: FilmShape
  promise: FilmPromise
  commissionedWeek: number
  rewriteCount: 0 | 1
}

export type FilmChronicleLedgerInput = {
  productionId: string | null
  week: number
  amount: number
}

export type FilmChronicleReception = {
  critic: CriticRating
  audience: { tier: AudienceTier; label: string; score: number }
}

export type FilmChronicleInput = {
  film: FilmResult
  conceptTitle: string
  genre: Genre | null
  producedScripts: readonly FilmChronicleScriptInput[]
  productionLedgerRows: readonly FilmChronicleLedgerInput[]
  currentWeek: number
  reception: FilmChronicleReception
}

export type FilmChronicleUnavailable = { available: false; message: string }

export type FilmChronicleCreativeRecord =
  | {
      available: true
      shape: FilmShape
      promise: FilmPromise
      commissionedWeek: number
      rewriteCount: 0 | 1
    }
  | FilmChronicleUnavailable

export type FilmChronicleCredits =
  | { available: true; participants: FilmParticipants }
  | FilmChronicleUnavailable

export type FilmChronicleProductionRecord =
  | {
      available: true
      commissionedWeek: number
      rewriteCount: 0 | 1
      greenlightWeek: number
      releaseWeek: number
      elapsedWeeks: number
    }
  | FilmChronicleUnavailable

export type FilmChronicleFit = {
  participant: FilmParticipant
  label: 'Standout fit' | 'Strongest fit' | 'Stretch fit' | 'Tightest fit'
  fit: number
}

export type FilmChroniclePackageRecord =
  | { available: true; strongest: FilmChronicleFit; weakest: FilmChronicleFit }
  | FilmChronicleUnavailable

export type FilmChronicleView = {
  productionId: string
  title: string
  genre: Genre | null
  reception: FilmChronicleReception
  creativeRecord: FilmChronicleCreativeRecord
  credits: FilmChronicleCredits
  productionRecord: FilmChronicleProductionRecord
  packageRecord: FilmChroniclePackageRecord
}

const CREATIVE_NOT_RECORDED = 'Creative brief not recorded for this older film'
const CREATIVE_UNAVAILABLE = 'Creative brief unavailable'
const CREDITS_UNAVAILABLE = 'Frozen film credits unavailable'
const CHRONOLOGY_NOT_RECORDED = 'Detailed production chronology not recorded for this film'
const CHRONOLOGY_UNAVAILABLE = 'Detailed production chronology unavailable'
const PACKAGE_UNAVAILABLE = 'Frozen package fit record unavailable'

function cloneShape(shape: FilmShape): FilmShape {
  return { opening: shape.opening, midpoint: shape.midpoint, ending: shape.ending }
}

function clonePromise(promise: FilmPromise): FilmPromise {
  return {
    genre: promise.genre,
    intendedSegments: [...promise.intendedSegments],
    ranges: {
      intimacy: [promise.ranges.intimacy[0], promise.ranges.intimacy[1]],
      tonalWeight: [promise.ranges.tonalWeight[0], promise.ranges.tonalWeight[1]],
      kineticEnergy: [promise.ranges.kineticEnergy[0], promise.ranges.kineticEnergy[1]],
    },
  }
}

function cloneParticipant(participant: FilmParticipant): FilmParticipant {
  return {
    talentId: participant.talentId,
    name: participant.name,
    role: participant.role,
    discipline: participant.discipline,
    greenlightOVR: participant.greenlightOVR,
    greenlightFit: participant.greenlightFit,
    greenlightEP: {
      low: participant.greenlightEP.low,
      high: participant.greenlightEP.high,
      expected: participant.greenlightEP.expected,
    },
    freelancer: participant.freelancer,
  }
}

function participantList(participants: FilmParticipants): FilmParticipant[] {
  return [
    participants.writer,
    participants.director,
    participants.cast.lead,
    participants.cast.antagonist,
    participants.cast.support,
    ...participants.craft,
  ]
}

function cloneParticipants(participants: FilmParticipants): FilmParticipants {
  return {
    writer: cloneParticipant(participants.writer),
    director: cloneParticipant(participants.director),
    cast: {
      lead: cloneParticipant(participants.cast.lead),
      antagonist: cloneParticipant(participants.cast.antagonist),
      support: cloneParticipant(participants.cast.support),
    },
    craft: participants.craft.map(cloneParticipant),
  }
}

function structurallyValidCredits(participants: FilmParticipants, film: FilmResult): boolean {
  if (
    participants.writer.role !== 'writer' ||
    participants.director.role !== 'director' ||
    participants.cast.lead.role !== 'lead' ||
    participants.cast.antagonist.role !== 'antagonist' ||
    participants.cast.support.role !== 'support' ||
    participants.craft.length === 0 ||
    participants.craft.some((participant) => participant.role !== 'craft') ||
    participants.director.talentId !== film.directorId
  ) {
    return false
  }
  const ids = participantList(participants).map((participant) => participant.talentId)
  return ids.length === new Set(ids).size
}

const CHRONICLE_ROLE_RANK: Record<FilmParticipant['role'], number> = {
  writer: 0,
  director: 1,
  lead: 2,
  antagonist: 3,
  support: 4,
  craft: 5,
}

function compareCanonicalParticipant(a: FilmParticipant, b: FilmParticipant): number {
  const roleDelta = CHRONICLE_ROLE_RANK[a.role] - CHRONICLE_ROLE_RANK[b.role]
  if (roleDelta !== 0) return roleDelta
  return a.talentId < b.talentId ? -1 : a.talentId > b.talentId ? 1 : 0
}

/**
 * Build one immutable released-film presentation projection. Returns null only for
 * pre-D-11.A films that have no frozen participant record. Malformed witnesses that
 * SaveFileV11 accepts fail their affected section closed rather than throwing.
 */
export function buildFilmChronicle(input: FilmChronicleInput): FilmChronicleView | null {
  const participants = input.film.participants
  if (participants === undefined) return null

  const linkedScripts = input.producedScripts.filter(
    (script) => script.productionId === input.film.productionId,
  )
  const linkedScript = linkedScripts.length === 1 ? linkedScripts[0] : undefined
  const writerCorrelates = linkedScript?.writerId === participants.writer.talentId
  const scriptValid = linkedScript !== undefined && writerCorrelates

  const creativeRecord: FilmChronicleCreativeRecord = scriptValid
    ? {
        available: true,
        shape: cloneShape(linkedScript.shape),
        promise: clonePromise(linkedScript.promise),
        commissionedWeek: linkedScript.commissionedWeek,
        rewriteCount: linkedScript.rewriteCount,
      }
    : {
        available: false,
        message: linkedScripts.length === 0 ? CREATIVE_NOT_RECORDED : CREATIVE_UNAVAILABLE,
      }

  // No Produced project is the expected honest path for an older participant-bearing
  // film. A duplicate link or exact-project writer mismatch is corruption, so identity
  // fails closed rather than treating it as a legacy absence.
  const creditCorrelationValid =
    structurallyValidCredits(participants, input.film) &&
    (linkedScripts.length === 0 || (linkedScripts.length === 1 && writerCorrelates))
  const credits: FilmChronicleCredits = creditCorrelationValid
    ? { available: true, participants: cloneParticipants(participants) }
    : { available: false, message: CREDITS_UNAVAILABLE }

  let productionRecord: FilmChronicleProductionRecord
  if (linkedScripts.length === 0) {
    productionRecord = { available: false, message: CHRONOLOGY_NOT_RECORDED }
  } else if (!scriptValid) {
    productionRecord = { available: false, message: CHRONOLOGY_UNAVAILABLE }
  } else {
    const matchingRows = input.productionLedgerRows.filter(
      (row) => row.productionId === input.film.productionId,
    )
    const witness = matchingRows.length === 1 ? matchingRows[0] : undefined
    const commissionedWeek = linkedScript.commissionedWeek
    const releaseWeek = input.film.releaseTick
    const chronologyValid =
      witness !== undefined &&
      Number.isInteger(witness.week) &&
      Number.isFinite(witness.amount) &&
      witness.amount < 0 &&
      Number.isInteger(commissionedWeek) &&
      Number.isInteger(releaseWeek) &&
      Number.isInteger(input.currentWeek) &&
      commissionedWeek + 1 + linkedScript.rewriteCount <= witness.week &&
      witness.week < releaseWeek &&
      releaseWeek <= input.currentWeek
    productionRecord = chronologyValid
      ? {
          available: true,
          commissionedWeek,
          rewriteCount: linkedScript.rewriteCount,
          greenlightWeek: witness.week,
          releaseWeek,
          elapsedWeeks: releaseWeek - witness.week,
        }
      : { available: false, message: CHRONOLOGY_UNAVAILABLE }
  }

  let packageRecord: FilmChroniclePackageRecord
  const canonicalParticipants = creditCorrelationValid
    ? participantList(participants).slice().sort(compareCanonicalParticipant)
    : []
  if (
    canonicalParticipants.length === 0 ||
    canonicalParticipants.some((participant) => !Number.isFinite(participant.greenlightFit))
  ) {
    packageRecord = { available: false, message: PACKAGE_UNAVAILABLE }
  } else {
    let strongest = canonicalParticipants[0]!
    let weakest = canonicalParticipants[0]!
    for (const participant of canonicalParticipants.slice(1)) {
      if (participant.greenlightFit > strongest.greenlightFit) strongest = participant
      if (participant.greenlightFit < weakest.greenlightFit) weakest = participant
    }
    packageRecord = {
      available: true,
      strongest: {
        participant: cloneParticipant(strongest),
        label: strongest.greenlightFit >= 70 ? 'Standout fit' : 'Strongest fit',
        fit: strongest.greenlightFit,
      },
      weakest: {
        participant: cloneParticipant(weakest),
        label: weakest.greenlightFit < 45 ? 'Stretch fit' : 'Tightest fit',
        fit: weakest.greenlightFit,
      },
    }
  }

  return {
    productionId: input.film.productionId,
    title: input.conceptTitle,
    genre: input.genre,
    reception: {
      critic: { stars: input.reception.critic.stars, score: input.reception.critic.score },
      audience: {
        tier: input.reception.audience.tier,
        label: input.reception.audience.label,
        score: input.reception.audience.score,
      },
    },
    creativeRecord,
    credits,
    productionRecord,
    packageRecord,
  }
}

// ── critic tier — canonical source: ./receptionVerdict.js (imported above) ─────

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
  chronicle: FilmChronicleView
}

export type NewspaperInput = {
  film: FilmResult
  conceptTitle: string
  // Film Chronicle V1. Optional only to preserve the original low-level newspaper
  // helper call surface; the GameState adapter always supplies the exact witnesses.
  genre?: Genre | null
  producedScripts?: readonly FilmChronicleScriptInput[]
  productionLedgerRows?: readonly FilmChronicleLedgerInput[]
  currentWeek?: number
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

// Two–three truthful callouts, drawn ONLY from recorded mechanics (cohesion, Fit,
// critic-audience divergence, forecast delta, profitability), in priority order.
function makeCallouts(
  d: Dims,
  film: FilmResult,
  packageRecord: FilmChroniclePackageRecord,
): string[] {
  const out: string[] = []
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

  if (packageRecord.available) {
    const { strongest, weakest } = packageRecord
    if (strongest.fit >= 70) {
      out.push(
        `${strongest.participant.name}’s ${strongest.participant.role} casting was a standout fit for the material.`,
      )
    }
    if (weakest.fit < 45 && out.length < 3) {
      out.push(
        `${weakest.participant.name} was a stretch in the ${weakest.participant.role} role.`,
      )
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

  // Compute reception once, then hand those exact recorded verdict values to the
  // Chronicle. Chronicle V1 has no second audience aggregation or threshold family.
  const criticRating: CriticRating = { stars: criticStars(critic), score: Math.round(critic) }
  const audience = { tier: dims.audTier, label: AUDIENCE_LABEL[dims.audTier], score: Math.round(aud) }
  const chronicle = buildFilmChronicle({
    film,
    conceptTitle,
    genre: input.genre ?? null,
    producedScripts: input.producedScripts ?? [],
    productionLedgerRows: input.productionLedgerRows ?? [],
    currentWeek: input.currentWeek ?? input.week ?? film.releaseTick,
    reception: { critic: criticRating, audience },
  })
  // The participant guard above is the Chronicle eligibility guard too.
  if (chronicle === null) return null

  return {
    masthead: NEWSPAPER_MASTHEAD,
    week: input.week ?? film.releaseTick,
    filmTitle: conceptTitle,
    headline,
    subheadline,
    critic: criticRating,
    audience,
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
    // Person-bearing callouts use only the same validated frozen credits the
    // Chronicle bills. A failed correlation may keep general result commentary,
    // but it must never leak or grade the rejected raw participant record.
    callouts: makeCallouts(
      dims,
      film,
      chronicle.packageRecord,
    ),
    participants: cloneParticipants(film.participants),
    chronicle,
  }
}
