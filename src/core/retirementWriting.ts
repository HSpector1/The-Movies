import type { ProfessionValidationContext } from './professionHistory.js'
//880-B: evidence for validating existing writing after natural employment expiry.
// This grants no action and changes no contract, assignment or retirement law.
import type { ScriptProject } from './types.js'
import { TUNING } from './tuning.js'

type WritingGrant = Readonly<{
  studioId: string; projectId: string; writerId: string; commissionedWeek: number; dueWeek: number
}>
export type RetirementWritingAuthority = Readonly<{
  week: number; playerStudioId: string; grants: readonly WritingGrant[]
}>

const record = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined
const rows = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.flatMap(item => { const row = record(item); return row ? [row] : [] }) : []
const evidenceWeek = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const identity = (value: unknown): value is string => typeof value === 'string' && value.length > 0

/** A cost gate, never permission. Only an unfinished task without employment at
 * its own studio can need the current profession-history proof. Idle worlds do
 * not scan their accumulated career history on every action or week. */
export function retirementWritingNeedsProfessionProof(input: unknown): boolean {
  const state = record(input), h = record(state?.hollywood), week = record(state?.market)?.tick
  if (!state || !h || !identity(h.playerStudioId) || !evidenceWeek(week)) return false
  const candidates = new Set<string>()
  const studios = [{ studioId: h.playerStudioId, development: state.scriptDevelopment }, ...rows(h.businesses)]
  for (const studio of studios) {
    if (!identity(studio.studioId)) continue
    for (const project of rows(record(studio.development)?.projects)) {
      if (project.status !== 'drafting' || !evidenceWeek(project.dueWeek) || project.dueWeek <= week
        || !Array.isArray(project.writerIds)) continue
      for (const writerId of project.writerIds) {
        if (!identity(writerId)) continue
        const employed = studio.studioId === h.playerStudioId
          ? rows(state.contracts).some(contract => contract.talentId === writerId
            && evidenceWeek(contract.startWeek) && contract.startWeek <= week
            && evidenceWeek(contract.endWeekExclusive) && week < contract.endWeekExclusive)
          : rows(h.employment).some(interval => {
            const terms = record(interval.terms)
            return interval.studioId === studio.studioId && interval.endedWeek === null
              && terms?.talentId === writerId && evidenceWeek(terms.startWeek) && terms.startWeek <= week
              && evidenceWeek(terms.endWeekExclusive) && week < terms.endWeekExclusive
          })
        if (!employed) candidates.add(writerId)
      }
    }
  }
  if (candidates.size === 0) return false
  const lifecycle = record(state.careerLifecycle)
  if (!lifecycle || !evidenceWeek(lifecycle.transitionBoundaryWeek)) return true
  for (const key of ['records', 'professionAnchors', 'professionChanges', 'transitionEvaluations', 'industryRetirements', 'transitionDue']) {
    const value = lifecycle[key]
    if (!Array.isArray(value) || value.some(row => !identity(record(row)?.personId))) return true
  }
  const people = rows(state.talent), anchors = rows(lifecycle.professionAnchors)
  const changes = rows(lifecycle.professionChanges), retirements = rows(lifecycle.records)
  for (const personId of candidates) {
    const peopleForId = people.filter(person => person.id === personId)
    const anchorsForId = anchors.filter(anchor => anchor.personId === personId)
    const recordsForId = retirements.filter(row => row.personId === personId)
    if (peopleForId.length !== 1 || anchorsForId.length !== 1
      || anchorsForId[0]!.profession !== peopleForId[0]!.role
      || changes.some(change => change.personId === personId)
      || recordsForId.length !== 1 || recordsForId[0]!.profession !== peopleForId[0]!.role) return true
  }
  return false
}

/** Called explicitly by current entry points only. Malformed input confers no
 * authority; the normal full validators still check every original field. */
export function retirementWritingAuthority(input: unknown, professionContext?: ProfessionValidationContext): RetirementWritingAuthority | undefined {
  const state = record(input), h = record(state?.hollywood), lifecycle = record(state?.careerLifecycle)
  const week = record(state?.market)?.tick
  if (!state || !h || !lifecycle || !identity(h.playerStudioId) || !evidenceWeek(week)) return undefined
  const retiring = new Map<string, { effectiveWeek: number }>(), seen = new Set<string>(), ambiguous = new Set<string>()
  for (const row of rows(lifecycle.records)) {
    if (!identity(row.personId)) continue
    // Even a malformed second record makes this person's authority ambiguous.
    const key = professionContext ? JSON.stringify([row.personId, row.profession]) : row.personId
    if (seen.has(key)) { ambiguous.add(row.personId); retiring.delete(row.personId); continue }
    seen.add(key)
    if (ambiguous.has(row.personId) || professionContext && row.profession !== professionContext.professionAtWeek(row.personId, week)) continue
    if (row.intentRulesVersion !== 1 || row.retiredWeek !== null
      || !evidenceWeek(row.announcedWeek) || !evidenceWeek(row.effectiveWeek)
      || row.announcedWeek > week || row.effectiveWeek - row.announcedWeek < TUNING.RETIREMENT_NOTICE_WEEKS) continue
    const announced = row.status === 'announced' && week < row.effectiveWeek && row.finishingFromWeek === null
    const finishing = row.status === 'finishing_commitments' && row.effectiveWeek <= week && row.finishingFromWeek === row.effectiveWeek
    if (announced || finishing) retiring.set(row.personId, { effectiveWeek: row.effectiveWeek })
  }
  if (retiring.size === 0) return undefined
  const studios = [{ studioId: h.playerStudioId, development: state.scriptDevelopment }, ...rows(h.businesses)]
  const candidates: WritingGrant[] = []
  for (const studio of studios) {
    if (!identity(studio.studioId)) continue
    for (const project of rows(record(studio.development)?.projects)) {
      if (project.status !== 'drafting' || !identity(project.id) || !evidenceWeek(project.commissionedWeek)
        || !evidenceWeek(project.dueWeek) || project.dueWeek <= week || !Array.isArray(project.writerIds)) continue
      for (const writerId of project.writerIds) {
        if (!identity(writerId)) continue
        const retirement = retiring.get(writerId)
        if (!retirement || project.commissionedWeek >= retirement.effectiveWeek) continue
        candidates.push({ studioId: studio.studioId, projectId: project.id, writerId,
          commissionedWeek: project.commissionedWeek, dueWeek: project.dueWeek })
      }
    }
  }
  if (candidates.length === 0) return undefined
  const employment = rows(h.employment), receipts = rows(h.receipts)
  const grants = candidates.filter(candidate => employment.some(interval => {
    const terms = record(interval.terms)
    if (!terms || !identity(interval.contractId) || interval.studioId !== candidate.studioId || terms.talentId !== candidate.writerId
      || !evidenceWeek(terms.startWeek) || !evidenceWeek(terms.endWeekExclusive)
      || terms.startWeek > candidate.commissionedWeek || candidate.commissionedWeek >= terms.endWeekExclusive
      || interval.endedWeek !== terms.endWeekExclusive || terms.endWeekExclusive > week
      || terms.endWeekExclusive > retiring.get(candidate.writerId)!.effectiveWeek) return false
    // An actual expiry, never an early release, is the employment evidence.
    return receipts.some(receipt => receipt.kind === 'employment' && receipt.reason === 'expiry'
      && receipt.contractId === interval.contractId && receipt.talentId === candidate.writerId
      && receipt.studioId === candidate.studioId && receipt.fromStudioId === candidate.studioId
      && receipt.toStudioId === null && receipt.week === interval.endedWeek)
  })).map(grant => Object.freeze(grant))
  return grants.length === 0 ? undefined : Object.freeze({ week, playerStudioId: h.playerStudioId, grants: Object.freeze(grants) })
}

/** Collision-safe exact tuple and dates; an allowance cannot follow another task. */
export function permitsRetirementWriting(authority: RetirementWritingAuthority | undefined, studioId: string | undefined,
  week: number, project: ScriptProject, writerId: string): boolean {
  return authority !== undefined && authority.week === week && project.status === 'drafting'
    && authority.grants.some(grant => grant.studioId === studioId && grant.projectId === project.id && grant.writerId === writerId
      && grant.commissionedWeek === project.commissionedWeek && grant.dueWeek === project.dueWeek)
}
