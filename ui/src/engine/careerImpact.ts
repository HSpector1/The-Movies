// ── D-14 Phase 2 — Career Impact presentation layer (READ-ONLY selectors) ─────
//
// The UI renders ONLY the frozen TalentCareerEvent records. It NEVER recomputes a
// delta from present-day talent state, current Star Power, present skills, forecast
// recomputation, or reconstructed assumptions. Machine reason codes are translated
// here into natural player-facing sentences; raw identifiers are never shown.

import type { CareerReasonCode, GameState, TalentCareerEvent } from '../../../src/core/index.ts'

/** A single skill's visible before→after for presentation. */
export type SkillDelta = { name: string; before: number; after: number; delta: number }

/** One participant's frozen career impact on one film, presentation-ready. */
export type CareerImpactRow = {
  eventId: string
  talentId: string
  name: string
  role: string // player-facing role label (e.g. "Lead")
  disciplineLabel: string // e.g. "Acting"
  ovrBefore: number
  ovrAfter: number
  ovrDelta: number
  starPowerBefore: number
  starPowerAfter: number
  starPowerDelta: number
  starPowerChanged: boolean
  changedSkills: SkillDelta[] // only skills whose visible value moved
  allSkills: SkillDelta[] // full before/after list for the expandable detail
  genreLabel: string
  genreExpBefore: number
  genreExpAfter: number
  genreExpChanged: boolean
  reasons: string[] // translated, player-facing "why it changed" sentences
  audienceScore: number
  criticScore: number
  realizedTotal: number
  realizedOpening: number
}

/** The film-centric Career Impact view, or an honest "not recorded" marker. */
export type FilmCareerImpact =
  | { available: true; filmId: string; rows: CareerImpactRow[] }
  | { available: false; filmId: string } // a pre-V5 / migrated film with no frozen event

const ROLE_LABEL: Record<string, string> = {
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
  director: 'Director',
  writer: 'Writer',
  craft: 'Craft',
}
const DISCIPLINE_LABEL: Record<string, string> = {
  acting: 'Acting',
  writing: 'Writing',
  directing: 'Directing',
  craft: 'Craft',
}
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const skillLabel = (k: string) => titleCase(k.replace(/([A-Z])/g, ' $1').trim())

/**
 * Translate the machine reason codes for one event into player-facing sentences.
 * Raw identifiers (substantialLeadExposure, …) are NEVER returned.
 */
export function translateReasons(ev: TalentCareerEvent): string[] {
  const out: string[] = []
  const has = (c: CareerReasonCode) => ev.reasonCodes.includes(c)
  if (has('substantialLeadExposure')) out.push('Lead billing created substantial exposure.')
  if (has('supportingRoleVisibility')) out.push(`A ${ROLE_LABEL[ev.role] ?? ev.role} role carried proportionally less commercial exposure.`)
  if (has('limitedAudienceReach')) out.push('The film did not reach a wide enough audience to move commercial recognition much.')
  if (has('strongAudienceResponse')) out.push('Audiences responded well, making the exposure valuable.')
  if (has('weakAudienceResponse')) out.push('Weak audience response limited the Star Power gain.')
  if (has('exceededCommercialExpectations')) out.push('The film beat its commercial expectation.')
  if (has('missedCommercialExpectations')) out.push('The film fell short of its commercial expectation.')
  if (has('establishedStarSaturation')) out.push('Already a well-known draw, so only a very large result would move recognition further.')
  // Craft note (development happened alongside Star Power).
  if (ev.ovrAfter > ev.ovrBefore) out.push(`${ROLE_LABEL[ev.role] ?? 'This'}-role experience improved craft.`)
  if (has('noMeaningfulCareerChange') && out.length === 0) out.push('The film did not materially change commercial recognition.')
  return out
}

const EPS = 0.05 // display threshold: a Star Power move below this reads as "No change".

function toRow(ev: TalentCareerEvent): CareerImpactRow {
  const allSkills: SkillDelta[] = Object.keys(ev.skillsBefore).map((name) => ({
    name: skillLabel(name),
    before: ev.skillsBefore[name] ?? 0,
    after: ev.skillsAfter[name] ?? 0,
    delta: (ev.skillsAfter[name] ?? 0) - (ev.skillsBefore[name] ?? 0),
  }))
  return {
    eventId: ev.eventId,
    talentId: ev.talentId,
    name: ev.talentId, // filled by the state-aware selector below
    role: ROLE_LABEL[ev.role] ?? ev.role,
    disciplineLabel: DISCIPLINE_LABEL[ev.discipline] ?? ev.discipline,
    ovrBefore: ev.ovrBefore,
    ovrAfter: ev.ovrAfter,
    ovrDelta: ev.ovrAfter - ev.ovrBefore,
    starPowerBefore: ev.starPowerBefore,
    starPowerAfter: ev.starPowerAfter,
    starPowerDelta: ev.starPowerDelta,
    starPowerChanged: Math.abs(ev.starPowerDelta) >= EPS,
    changedSkills: allSkills.filter((s) => s.delta !== 0),
    allSkills,
    genreLabel: titleCase(ev.genre),
    genreExpBefore: ev.genreExpBefore,
    genreExpAfter: ev.genreExpAfter,
    genreExpChanged: ev.genreExpAfter !== ev.genreExpBefore,
    reasons: translateReasons(ev),
    audienceScore: ev.audienceScore,
    criticScore: ev.criticScore,
    realizedTotal: ev.realizedTotal,
    realizedOpening: ev.realizedOpening,
  }
}

/** Film-centric Career Impact — the frozen events for one released film. */
export function filmCareerImpact(state: GameState, filmId: string): FilmCareerImpact {
  const events = state.careerEvents.filter((e) => e.filmId === filmId)
  if (events.length === 0) return { available: false, filmId } // pre-V5 / migrated film
  const nameById = new Map(state.talent.map((t) => [t.id, t.name]))
  const rows = events.map((ev) => {
    const row = toRow(ev)
    return { ...row, name: nameById.get(ev.talentId) ?? ev.talentId }
  })
  return { available: true, filmId, rows }
}

/** Talent-centric career history — the frozen events for one talent, most recent first. */
export function talentCareerHistory(state: GameState, talentId: string): CareerImpactRow[] {
  const nameById = new Map(state.talent.map((t) => [t.id, t.name]))
  return state.careerEvents
    .filter((e) => e.talentId === talentId)
    .slice()
    .sort((a, b) => b.releaseWeek - a.releaseWeek)
    .map((ev) => ({ ...toRow(ev), name: nameById.get(ev.talentId) ?? ev.talentId }))
}

/** Accessible signed delta text — never colour-only (§7/§8). */
export function deltaText(delta: number, decimals = 0): string {
  if (Math.abs(delta) < (decimals > 0 ? EPS : 0.5)) return 'No change'
  const v = Math.abs(delta).toFixed(decimals)
  return delta > 0 ? `+${v} increase` : `−${v} decrease`
}
