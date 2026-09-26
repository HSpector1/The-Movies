// C.2-RM: public retirement facts only; no intent prediction or game-state writes.
import { campaignDate } from '../src/core/calendar.ts'
import { retirementRecordFor, retirementWindow } from '../src/core/careerLifecycle.ts'
import type { GameState, Talent } from '../src/core/types.ts'
import type { IndustryEmployment } from '../src/core/hollywoodTypes.ts'
import type { BridgePersonAlumni, BridgePersonLifecycle, BridgeMarketAttentionRowSnapshot } from './schema/bridge-schema.ts'

export function personLifecycle(state: GameState, person: Talent): BridgePersonLifecycle {
  const record = retirementRecordFor(state, person.id)
  const profession = record?.profession ?? person.role
  const window = retirementWindow(profession)!
  const status = record?.status ?? 'active'
  const line = status === 'retired' ? `Retired from ${profession} in Week ${record!.retiredWeek}.`
    : status === 'finishing_commitments' ? `Finishing existing commitments before retiring from ${profession}; no new work or contract may attach. Final completion is not yet known.`
      : status === 'announced' ? `Retirement from ${profession} announced; recorded boundary Week ${record!.effectiveWeek}. Existing obligations may finish afterward.`
        : `Active in ${profession}; no retirement announcement recorded.`
  const planningLine = `Retirement eligibility starts at age ${window.start}; age ${window.hard} is the announcement boundary, not automatic removal.`
    + (status === 'announced' && profession === 'writer' ? ' A currently contracted writer may begin writing and finish it after the recorded boundary.' : '')
  return {
    status, profession, eligibleAge: window.start, hardAge: window.hard, eligible: person.age >= window.start,
    line, planningLine, announcedWeek: record?.announcedWeek ?? null, effectiveWeek: record?.effectiveWeek ?? null,
    finishingFromWeek: record?.finishingFromWeek ?? null, retiredWeek: record?.retiredWeek ?? null,
    announcedLabel: record ? campaignDate(record.announcedWeek).label : null,
    effectiveLabel: record ? campaignDate(record.effectiveWeek).label : null,
    retiredLabel: record?.retiredWeek == null ? null : campaignDate(record.retiredWeek).label,
    extensionUsed: record?.extensionUsed ?? null, extendedFromWeek: record?.extendedFromWeek ?? null,
  }
}

/** One history pass per People projection; later ordinals break equal end dates. */
export function latestEmployers(state: GameState): ReadonlyMap<string, IndustryEmployment> {
  const result = new Map<string, IndustryEmployment>()
  for (const row of state.hollywood?.employment ?? []) {
    const prior = result.get(row.terms.talentId)
    if (prior === undefined || (row.endedWeek ?? row.terms.endWeekExclusive) >= (prior.endedWeek ?? prior.terms.endWeekExclusive)) result.set(row.terms.talentId, row)
  }
  return result
}

export function personAlumni(state: GameState, person: Talent, campaignCredits: number, authoredCredits: number, uncapturedFilms: number, last: IndustryEmployment | undefined): BridgePersonAlumni | null {
  const record = retirementRecordFor(state, person.id)
  if (record?.status !== 'retired' || record.retiredWeek === null) return null
  return {
    profession: record.profession, retiredWeek: record.retiredWeek, retiredLabel: campaignDate(record.retiredWeek).label,
    extensionUsed: record.extensionUsed, recordedCredits: campaignCredits + authoredCredits, authoredCredits, campaignCredits, uncapturedFilms,
    creditBasis: 'Recorded credits count each credited role on a released picture, including separately recorded authored starting credits.',
    recordingNotice: uncapturedFilms > 0 ? `${uncapturedFilms} earlier player films have no captured participants; this global recording gap cannot be assigned to a particular person.` : null,
    honorsNotice: 'Honors are not recorded.',
    lastEmployer: last ? { studioId: last.studioId, studioName: state.hollywood!.identities.find(s => s.studioId === last.studioId)!.name,
      fromWeek: last.terms.startWeek, toWeek: last.endedWeek ?? last.terms.endWeekExclusive } : null,
    filmographyRef: { view: 'person', targetId: person.id }, employmentRef: { view: 'employment', targetId: person.id },
  }
}

/** Presentation news retention only; never an automatic advance stop. */
export function retirementAttentionRows(state: GameState, week = state.market.tick): BridgeMarketAttentionRowSnapshot[] {
  const rows: { row: BridgeMarketAttentionRowSnapshot; order: number; week: number }[] = []
  for (const record of state.careerLifecycle?.records ?? []) {
    if (record.status === 'finishing_commitments') rows.push({ order: 0, week: record.finishingFromWeek!, row: {
      cause: 'finishingCommitments', talentId: record.personId, reason: `Finishing existing ${record.profession} commitments before retirement; final completion is not yet known.` } })
    if (record.status !== 'retired' && week >= record.announcedWeek && week - record.announcedWeek < 13) rows.push({ order: 1, week: record.announcedWeek, row: {
      cause: 'retirementAnnounced', talentId: record.personId, reason: `Retirement from ${record.profession} announced in Week ${record.announcedWeek}; recorded boundary Week ${record.effectiveWeek}.` } })
  }
  return rows.sort((a, b) => a.order - b.order || a.week - b.week || (a.row.talentId < b.row.talentId ? -1 : a.row.talentId > b.row.talentId ? 1 : 0)).map(item => item.row)
}
