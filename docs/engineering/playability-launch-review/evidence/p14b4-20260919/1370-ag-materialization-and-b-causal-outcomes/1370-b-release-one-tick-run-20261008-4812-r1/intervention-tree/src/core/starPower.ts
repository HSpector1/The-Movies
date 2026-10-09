// ── D-14 Talent Career Impact — Star Power (fame) progression ─────────────────
//
// Star Power = commercial recognition / drawing power (Talent.fame, 0..100). It is
// SEPARATE from craft (skills/OVR). This module resolves how a single released film
// changes a participant's Star Power, and freezes the canonical TalentCareerEvent.
//
// Design invariants (owner directive §2–6):
//   • DETERMINISTIC — NO new RNG. The realized film outcome already carries the
//     uncertainty. Same inputs ⇒ same delta.
//   • Inputs are ONLY already-authoritative realized outcomes: realized reach (total
//     gross), the participant's FROZEN role, audience response, forecast comparison,
//     and current fame. NEVER profit / cash / marketing-$ / salary / authored flag /
//     studio standing / critic-as-primary.
//   • Applied at release, to affect FUTURE films only (the caller applies the new
//     fame to the post-development talent, so the film that caused it is untouched).
//   • Bounded: per-film delta ∈ [−STAR_POWER_MAX_LOSS, +STAR_POWER_MAX_GAIN]; fame
//     stays within [0, 100].
//   • Diminishing returns: unknowns gain fastest; values near 100 barely move.
//   • An obscure failure cannot meaningfully damage an unknown (loss scales with both
//     realized reach AND current fame — no exposure and no reputation ⇒ ~0 loss).

import { clamp } from './math.js'
import { roleOVR } from './talentSummary.js'
import { TUNING } from './tuning.js'
import type {
  CareerReasonCode,
  Discipline,
  FilmParticipant,
  FilmParticipants,
  FilmParticipantRole,
  Genre,
  Talent,
  TalentCareerEvent,
} from './types.js'

/** Flatten the frozen participant record into a stable-ordered array. */
export function flattenParticipants(p: FilmParticipants): FilmParticipant[] {
  return [p.writer, p.director, p.cast.lead, p.cast.antagonist, p.cast.support, ...p.craft]
}

/** Role-visibility weight from the FROZEN participant assignment (§5). Never OVR/fame. */
export function starPowerRoleWeight(role: FilmParticipantRole): number {
  return TUNING.STAR_POWER_ROLE_WEIGHTS[role]
}

export type StarPowerInput = {
  fameBefore: number // current Star Power (0..100)
  role: FilmParticipantRole
  realizedTotal: number // realized total theatrical gross ($) — the reach proxy
  audienceScore: number // weightedAudienceScore (0..100)
  expectedTotal: number | null // locked greenlight forecast expectedTotal, or null
}

export type StarPowerResult = {
  delta: number // clamped per-film change to fame
  gain: number // positive component (pre-net)
  loss: number // negative component magnitude (pre-net)
  reach01: number // realized reach in [0,1]
  forecastComparator: number // realizedTotal / expectedTotal (1 when no forecast)
  reasonCodes: CareerReasonCode[]
}

/**
 * Compute the deterministic per-film Star Power delta and the reason codes.
 * Pure: depends only on the realized outcome + role + current fame.
 */
export function computeStarPowerDelta(inp: StarPowerInput): StarPowerResult {
  const roleWeight = starPowerRoleWeight(inp.role)
  const fame = clamp(inp.fameBefore, 0, 100)

  // Realized reach in [0,1): a saturating map of total gross (more seen ⇒ more chance
  // to build recognition). Marketing enters ONLY through the reach it actually produced.
  const total = Math.max(0, inp.realizedTotal)
  const reach01 = total / (total + TUNING.STAR_POWER_REACH_HALF)

  // Audience response gates the VALUE of exposure. Below the floor ⇒ no gain; at "good"
  // ⇒ full; a rapturous response ⇒ up to AUD_MAX.
  const audGain = clamp(
    (inp.audienceScore - TUNING.STAR_POWER_AUD_FLOOR) /
      (TUNING.STAR_POWER_AUD_GOOD - TUNING.STAR_POWER_AUD_FLOOR),
    0,
    TUNING.STAR_POWER_AUD_MAX,
  )

  // Forecast performance is SECONDARY. Compare realized reach to the locked expectation.
  const forecastComparator =
    inp.expectedTotal && inp.expectedTotal > 0 ? total / inp.expectedTotal : 1
  const fcMult = clamp(
    1 + TUNING.STAR_POWER_FC_WEIGHT * (forecastComparator - 1),
    TUNING.STAR_POWER_FC_MIN,
    TUNING.STAR_POWER_FC_MAX,
  )

  // Diminishing returns: remaining headroom, convex so the top is very hard to reach.
  const room = Math.pow((100 - fame) / 100, TUNING.STAR_POWER_SAT_EXP)

  const gain = TUNING.STAR_POWER_BASE_GAIN * roleWeight * reach01 * audGain * fcMult * room

  // Visible-failure loss: a materially disliked, WIDELY-SEEN film can erode the draw of
  // an ALREADY-established star. Scales with reach (was it seen?) AND current fame (is
  // there reputation to lose?) — so an unknown's obscure flop is ~0.
  const poor = clamp(
    (TUNING.STAR_POWER_AUD_POOR - inp.audienceScore) / TUNING.STAR_POWER_AUD_POOR,
    0,
    1,
  )
  const established = Math.pow(fame / 100, TUNING.STAR_POWER_ESTAB_EXP)
  const loss = TUNING.STAR_POWER_ESTAB_LOSS * roleWeight * reach01 * poor * established

  const delta = clamp(gain - loss, -TUNING.STAR_POWER_MAX_LOSS, TUNING.STAR_POWER_MAX_GAIN)

  return {
    delta,
    gain,
    loss,
    reach01,
    forecastComparator,
    reasonCodes: deriveReasonCodes({ inp, roleWeight, reach01, audGain, forecastComparator, fame, delta }),
  }
}

function deriveReasonCodes(a: {
  inp: StarPowerInput
  roleWeight: number
  reach01: number
  audGain: number
  forecastComparator: number
  fame: number
  delta: number
}): CareerReasonCode[] {
  const codes: CareerReasonCode[] = []
  // Exposure / billing.
  if (a.inp.role === 'lead') codes.push('substantialLeadExposure')
  else codes.push('supportingRoleVisibility')
  // Reach.
  if (a.reach01 < 0.25) codes.push('limitedAudienceReach')
  // Audience response.
  if (a.audGain >= 0.75) codes.push('strongAudienceResponse')
  else if (a.inp.audienceScore < TUNING.STAR_POWER_AUD_FLOOR) codes.push('weakAudienceResponse')
  // Forecast (secondary).
  if (a.forecastComparator >= TUNING.STAR_POWER_FC_EXCEED) codes.push('exceededCommercialExpectations')
  else if (a.forecastComparator <= TUNING.STAR_POWER_FC_MISS) codes.push('missedCommercialExpectations')
  // Saturation.
  if (a.fame >= 70) codes.push('establishedStarSaturation')
  // Net.
  if (Math.abs(a.delta) < TUNING.STAR_POWER_NEGLIGIBLE) codes.push('noMeaningfulCareerChange')
  return codes
}

/** Perceived (visible) skills of one discipline as a plain number map. */
function visibleSkills(talent: Talent, discipline: Discipline): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [name, pair] of Object.entries(talent.skills[discipline])) out[name] = pair.perceived
  return out
}

export type CareerEventInput = {
  talentBefore: Talent // pre-development, pre-fame-update talent
  talentAfter: Talent // post-development, post-fame-update talent
  role: FilmParticipantRole
  discipline: Discipline
  filmId: string
  filmTitle: string
  releaseWeek: number
  genre: Genre
  realizedOpening: number
  realizedTotal: number
  audienceScore: number
  criticScore: number
  sp: StarPowerResult
}

/** Freeze the canonical TalentCareerEvent from the before/after snapshots + outcome. */
export function buildTalentCareerEvent(c: CareerEventInput): TalentCareerEvent {
  const skillsBefore = visibleSkills(c.talentBefore, c.discipline)
  const skillsAfter = visibleSkills(c.talentAfter, c.discipline)
  const skillDeltas: Record<string, number> = {}
  for (const k of Object.keys(skillsBefore)) skillDeltas[k] = (skillsAfter[k] ?? 0) - (skillsBefore[k] ?? 0)
  return {
    eventId: `${c.filmId}:${c.talentBefore.id}`,
    talentId: c.talentBefore.id,
    filmId: c.filmId,
    filmTitle: c.filmTitle,
    releaseWeek: c.releaseWeek,
    genre: c.genre,
    role: c.role,
    billingWeight: starPowerRoleWeight(c.role),
    discipline: c.discipline,
    ovrBefore: roleOVR(c.talentBefore, c.discipline),
    ovrAfter: roleOVR(c.talentAfter, c.discipline),
    skillsBefore,
    skillsAfter,
    skillDeltas,
    genreExpBefore: c.talentBefore.genreExperience[c.discipline][c.genre].perceived,
    genreExpAfter: c.talentAfter.genreExperience[c.discipline][c.genre].perceived,
    workHistoryBefore: c.talentBefore.workHistory[c.discipline],
    workHistoryAfter: c.talentAfter.workHistory[c.discipline],
    starPowerBefore: c.talentBefore.fame,
    starPowerAfter: c.talentAfter.fame,
    starPowerDelta: c.talentAfter.fame - c.talentBefore.fame,
    realizedOpening: c.realizedOpening,
    realizedTotal: c.realizedTotal,
    audienceScore: c.audienceScore,
    criticScore: c.criticScore,
    forecastComparator: c.sp.forecastComparator,
    reasonCodes: c.sp.reasonCodes,
  }
}

/** Map a FilmParticipantRole to the discipline it performs (for OVR/skill snapshots). */
export function roleDiscipline(role: FilmParticipantRole): Discipline {
  switch (role) {
    case 'writer':
      return 'writing'
    case 'director':
      return 'directing'
    case 'lead':
    case 'antagonist':
    case 'support':
      return 'acting'
    case 'craft':
      return 'craft'
  }
}
