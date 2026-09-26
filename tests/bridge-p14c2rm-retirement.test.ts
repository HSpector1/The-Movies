// Independent 875 RM-A/B/C/H/I/J/K/M. Assertions come from lifecycle records and
// recorded public credits, never a production-generated expected snapshot.
import { describe, expect, it } from 'vitest'
import { peopleProjection, type BridgePersonProfileSnapshot } from '../bridge/people.ts'
import { marketPage } from '../bridge/market.ts'
import { industryPage } from '../bridge/industry.ts'
import { financeUpcoming } from '../bridge/finance-upcoming.ts'
import { relationshipBlockFor } from '../bridge/relationships.ts'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { campaignDate } from '../src/core/calendar.js'
import { applyActions } from '../src/core/actions.js'
import { contractEndRefusal, retirementRecordFor } from '../src/core/careerLifecycle.js'
import { tick } from '../src/core/tick.js'
import { submitProposal } from '../src/core/talentMarket.js'
import { studioCalendar } from '../src/core/studioCalendar.js'
import { migrateToLive } from '../src/core/save.js'
import { TUNING } from '../src/core/tuning.js'
import type { CreativeRole, GameState, RetirementStatus } from '../src/core/types.js'
import { c2Fixture } from './helpers/p14c2a-fixtures.js'
import { scientistFilm, scientistWorld } from './helpers/p14c2s-fixtures.js'
import { AXES, SCI, addPerson, admitted, advanceTo, bytes, extensionWorld, finishingWriter, freshWorld,
  frozenTies, multiRoleAlumnus, owner, retirementCrowd, scientistSnapshot } from './helpers/p14c2rm-fixtures.js'

type Lifecycle = { status: 'active' | RetirementStatus; profession: CreativeRole; eligibleAge: number; hardAge: number;
  eligible: boolean; line: string; planningLine: string; announcedWeek: number | null; effectiveWeek: number | null;
  finishingFromWeek: number | null; retiredWeek: number | null; announcedLabel: string | null; effectiveLabel: string | null;
  retiredLabel: string | null; extensionUsed: boolean | null; extendedFromWeek: number | null }
type Alumni = { profession: CreativeRole; retiredWeek: number; retiredLabel: string; extensionUsed: boolean;
  recordedCredits: number; authoredCredits: number; campaignCredits: number; uncapturedFilms: number;
  creditBasis: string; recordingNotice: string | null; honorsNotice: string;
  lastEmployer: { studioId: string; studioName: string; fromWeek: number; toWeek: number } | null;
  filmographyRef: { view: 'person'; targetId: string }; employmentRef: { view: 'employment'; targetId: string } }
type Profile = BridgePersonProfileSnapshot & { lifecycle: Lifecycle; alumni: Alumni | null }
type CalendarRetirement = { kind: 'retirement'; certainty: 'committed'; week: number; ownerId: string; occurrenceIndex: 0;
  talentId: string; talentName: string; profession: CreativeRole; status: 'announced' | 'finishing_commitments'; announcedWeek: number }
function profile(state: GameState, id: string): Profile {
  const row = peopleProjection(state).profiles.find(p => p.talentId === id)
  expect(row, 'persistent profile identity').toBeDefined()
  return row as Profile
}
function lifecycle(state: GameState, id: string): Lifecycle {
  const result = profile(state, id).lifecycle
  expect(result, '875 required lifecycle block').toBeDefined()
  return result
}
function calendarRetirements(state: GameState): CalendarRetirement[] {
  return studioCalendar(state).commitments.filter(row => String(row.kind) === 'retirement') as unknown as CalendarRetirement[]
}
function query(view: string, extra: Partial<IndustryQuery> = {}): IndustryQuery {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: 'c2rm-industry', requestId: 'read',
    expectedStateRevision: 0, type: 'industryQuery', view, targetId: null, page: 0, pageSize: 50,
    lane: 'recent', period: 'all', ...extra } as IndustryQuery
}
function industry(state: GameState, view: string, extra: Partial<IndustryQuery> = {}) {
  return industryPage(state, 'c2rm-industry', 0, query(view, extra))
}
function credits(state: GameState, id: string) {
  let authored = 0, campaign = 0, uncaptured = 0
  for (const film of state.hollywood?.films ?? []) {
    const count = film.credits.filter(row => row.talentId === id).length
    if (film.provenance === 'authored-start/v1') authored += count
    else campaign += count
  }
  for (const film of state.studio.releasedFilms) {
    const p = film.participants
    if (p === undefined) { uncaptured++; continue }
    campaign += [p.writer, p.director, p.cast.lead, p.cast.antagonist, p.cast.support, ...p.craft]
      .filter(row => row.talentId === id).length
  }
  return { recordedCredits: authored + campaign, authoredCredits: authored, campaignCredits: campaign, uncapturedFilms: uncaptured }
}
const causes = (state: GameState, id: string) => marketPage(state, { view: 'market', targetId: null }).attention
  .filter(row => row.talentId === id).map(row => String(row.cause))

describe('C.2-RM planning and actual retirement announcements', () => {
  it.each([
    ['actor', 60, 70], ['director', 65, 75], ['writer', 65, 75], ['craft', 62, 72], ['scientist', 62, 72],
  ] as const)('%s profile states literal eligibility %i/hard%i without inventing intent', (role, start, hard) => {
    //Scientist recruitment has its own fixed pool; the public creative creator
    //does not accept that role. Use real materialized ages61 and62 from its corpus.
    const inputs: { state: GameState; id: string; eligible: boolean }[] = []
    if (role === 'scientist') {
      inputs.push({ state: scientistWorld(), id: SCI, eligible: false },
        { state: scientistSnapshot(617), id: SCI, eligible: true })
    } else {
      const low = addPerson(freshWorld(`c2rm-window-${role}`), 'Before window', role, start - 1)
      const high = addPerson(low.state, 'Eligible without intent', role, start)
      const state = admitted(high.state)
      inputs.push({ state, id: low.id, eligible: false }, { state, id: high.id, eligible: true })
    }
    for (const { state, id, eligible } of inputs) {
      const before = bytes(state)
      expect(retirementRecordFor(state, id)).toBeUndefined()
      expect(lifecycle(state, id)).toMatchObject({ status: 'active', profession: role,
        eligibleAge: start, hardAge: hard, eligible, announcedWeek: null, effectiveWeek: null,
        finishingFromWeek: null, retiredWeek: null, announcedLabel: null, effectiveLabel: null,
        retiredLabel: null, extensionUsed: null, extendedFromWeek: null })
      expect(lifecycle(state, id).planningLine.length).toBeGreaterThan(0)
      expect(profile(state, id).alumni).toBeNull()
      expect(bytes(state)).toBe(before)
    }
  })

  it('a genuine old save lifted past hard age stays active until an actual recorded announcement', () => {
    const old = c2Fixture('genuine-v33-c2-hard-boundary-and-idle-window')
    const state = migrateToLive({ saveVersion: 33, seed: old.seed, state: old, broadcastCache: old.broadcastItems } as Parameters<typeof migrateToLive>[0]).state
    const person = state.talent.find(row => row.age >= 80 && retirementRecordFor(state, row.id) === undefined)
    expect(person, 'genuine old-save premise: past-hard unrecorded person').toBeDefined()
    expect(lifecycle(state, person!.id)).toMatchObject({ status: 'active', eligible: true, announcedWeek: null, effectiveWeek: null })
    expect(profile(state, person!.id).alumni).toBeNull()
  })

  it('natural Scientist announcement is immediate on real Calendar, with honest finite Finance exclusion', () => {
    const before = scientistSnapshot(617), state = scientistSnapshot(618), original = bytes(state)
    expect(lifecycle(before, SCI)).toMatchObject({ status: 'active', announcedWeek: null })
    expect(lifecycle(state, SCI)).toMatchObject({ status: 'announced', profession: 'scientist', announcedWeek: 618,
      effectiveWeek: 670, announcedLabel: campaignDate(618).label, effectiveLabel: campaignDate(670).label,
      retiredWeek: null, extensionUsed: false })
    expect(calendarRetirements(state).filter(row => row.talentId === SCI)).toEqual([{
      kind: 'retirement', certainty: 'committed', week: 670, ownerId: SCI, occurrenceIndex: 0,
      talentId: SCI, talentName: state.talent.find(row => row.id === SCI)!.name, profession: 'scientist',
      status: 'announced', announcedWeek: 618,
    }])
    const roster = peopleProjection(state).roster.rows.find(row => row.talentId === SCI)
    expect(roster).toMatchObject({ lifecycleStatus: 'announced' })
    expect(causes(state, SCI)).toContain('retirementAnnounced')
    for (const window of financeUpcoming(state).windows) {
      expect(window.toWeekInclusive).toBe(618 + window.windowWeeks - 1)
      expect(window.rows.some(row => row.route?.targetId === SCI && String(row.kind) === 'retirement')).toBe(false)
    }
    const at619 = tick(state)
    expect(financeUpcoming(at619).windows.find(row => row.windowWeeks === 52)!.rows.find(row =>
      row.route?.targetId === SCI && String(row.kind) === 'retirement')).toMatchObject({ week: 670, weeklyOperatingCostChange: null,
        route: { kind: 'profile', targetId: SCI } })
    expect(calendarRetirements(extensionWorld('exact', 52)).find(row => row.talentId === AXES.exact.personId)?.week).toBe(150)
    expect(bytes(state)).toBe(original)
  })

  it('announcement news lasts exactly13 weeks even without a case; profiles and Calendar persist afterward', () => {
    for (const [week, visible] of [[618, true], [630, true], [631, false]] as const) {
      const state = advanceTo(scientistSnapshot(618), week)
      const news = causes(state, SCI).filter(cause => cause === 'retirementAnnounced')
      expect(news).toHaveLength(visible ? 1 : 0)
      expect(lifecycle(state, SCI).announcedWeek).toBe(618)
      expect(calendarRetirements(state).filter(row => row.talentId === SCI)).toHaveLength(1)
    }
    const retired = scientistSnapshot(670)
    expect(causes(retired, SCI)).not.toContain('retirementAnnounced')
    expect(causes(retired, SCI)).not.toContain('finishingCommitments')
    expect(calendarRetirements(retired).some(row => row.talentId === SCI)).toBe(false)
  })
})

describe('C.2-RM obligations, retired discovery and public boundaries', () => {
  it('actual held Scientist work stays finishing through overdue E, then real cancel/tick retires without deleting identity', () => {
    const f = scientistFilm(), held = advanceTo(f.held, 729), before = bytes(held)
    expect(lifecycle(held, SCI)).toMatchObject({ status: 'finishing_commitments', effectiveWeek: 728, finishingFromWeek: 728, retiredWeek: null })
    expect(lifecycle(held, SCI).line).toMatch(/finish/i)
    expect(profile(held, SCI).alumni).toBeNull()
    expect(peopleProjection(held).roster.rows.find(row => row.talentId === SCI)).toMatchObject({ lifecycleStatus: 'finishing_commitments' })
    expect(calendarRetirements(held).find(row => row.talentId === SCI)).toMatchObject({ week: 728, status: 'finishing_commitments' })
    for (const window of financeUpcoming(held).windows) expect(window.rows.find(row =>
      row.route?.targetId === SCI && String(row.kind) === 'retirement')).toMatchObject({ week: 728, weeklyOperatingCostChange: null })
    expect(causes(held, SCI).filter(cause => cause === 'finishingCommitments')).toHaveLength(1)
    expect(bytes(held)).toBe(before)
    const retired = tick(applyActions(held, [{ kind: 'cancel', productionId: f.productionId }]))
    expect(lifecycle(retired, SCI)).toMatchObject({ status: 'retired', retiredWeek: 730 })
    expect(peopleProjection(retired).roster.rows.some(row => row.talentId === SCI)).toBe(false)
    expect(profile(retired, SCI).presence.canLocate).toBe(false)
    expect(profile(retired, SCI).employment.offersAvailable).toBe(false)
    expect(industry(retired, 'person', { targetId: SCI }).people[0]).toMatchObject({ talentId: SCI, lifecycleStatus: 'retired', retiredWeek: 730 })
    expect(retired.talent.some(row => row.id === SCI)).toBe(true)
  })

  it('a naturally announced contracted writer can start genuine writing at E−1 and finishes it after E', () => {
    const f = finishingWriter()
    expect(lifecycle(f.commissioned, f.writerId).planningLine).toMatch(/writ/i)
    expect(lifecycle(f.finishing, f.writerId)).toMatchObject({ status: 'finishing_commitments', effectiveWeek: 312, retiredWeek: null })
    expect(profile(f.finishing, f.writerId).work).toMatchObject({ kind: 'assigned', assignmentKind: 'script' })
    expect(peopleProjection(f.finishing).roster.rows.find(row => row.talentId === f.writerId)).toMatchObject({ lifecycleStatus: 'finishing_commitments' })
    const retired = admitted(advanceTo(f.finishing, f.dueWeek))
    expect(lifecycle(retired, f.writerId)).toMatchObject({ status: 'retired', retiredWeek: f.dueWeek })
    expect(profile(retired, f.writerId).alumni?.retiredWeek).toBe(f.dueWeek)
  })

  it('a lawful original screenplay crossing E remains a saveable whole live campaign while its writer finishes', () => {
    const f = finishingWriter()
    expect(retirementRecordFor(f.finishing, f.writerId)).toMatchObject({ status: 'finishing_commitments', effectiveWeek: 312 })
    expect(f.finishing.scriptDevelopment.projects.some(row => row.writerId === f.writerId && row.status === 'drafting' && row.dueWeek! > 312)).toBe(true)
    //878's actual failure is retained as a standalone regression. No task deletion,
    //invented contract or expectation of rejection may conceal this contradiction.
    expect(() => admitted(f.finishing)).not.toThrow()
  })

  it('unavailable ordinary windows disappear before/open/after the final extension while actual expiry stays', () => {
    const facts = AXES.gap
    const base = extensionWorld(), accepted = advanceTo(submitProposal(base, { talentId: facts.personId,
      issuerStudioId: facts.issuer, termWeeks: 58, premiumTier: 1.1 }), 98)
    for (const state of [extensionWorld('gap', 80), base, accepted]) {
      const calendar = studioCalendar(state)
      expect(calendar.commitments.some(row => row.kind === 'contractRenewal' && row.talentId === facts.personId)).toBe(false)
      expect(calendar.commitments.some(row => row.kind === 'contractExpiry' && row.talentId === facts.personId)).toBe(true)
      expect(calendar.staffingHorizon.contracts.find(row => row.talentId === facts.personId)).toMatchObject({ renewalOpen: false, renewalWindowWeek: null })
      for (const window of financeUpcoming(state).windows) expect(window.rows.some(row =>
        row.kind === 'contractRenewal' && row.route?.targetId === facts.personId)).toBe(false)
      const contract = profile(state, facts.personId).employment.contract!
      expect(contract.renewalOpen).toBe(false)
      expect(contract.renewalLine).not.toMatch(/renewal open|opens in/i)
    }
    expect(causes(accepted, facts.personId)).not.toContain('retirementExtensionOpen')
  })

  it('a naturally announced actor retains an exactly capped lawful ordinary renewal, then loses it one week later', () => {
    const made = addPerson(freshWorld('c2rm-lawful-capped-renewal'), 'C2RM Exact Cap', 'actor', 69)
    let state = advanceTo(made.state, 2)
    state = applyActions(state, [{ kind: 'signContract', talentId: made.id, termWeeks: 52 }])
    expect(state.contracts.find(row => row.talentId === made.id)).toMatchObject({ startWeek: 2, endWeekExclusive: 54 })
    state = admitted(advanceTo(state, 52))
    expect(retirementRecordFor(state, made.id), 'natural hard70 announcement').toMatchObject({ announcedWeek: 52, effectiveWeek: 104 })
    expect(contractEndRefusal(state, made.id, 104)).toBeNull()
    const renewed = admitted(applyActions(state, [{ kind: 'renewContract', talentId: made.id, termWeeks: 52 }]))
    expect(renewed.contracts.find(row => row.talentId === made.id)).toMatchObject({ startWeek: 52, endWeekExclusive: 104 })
    expect(retirementRecordFor(renewed, made.id)?.extensionUsed).toBe(false)
    expect(profile(state, made.id).employment.contract).toMatchObject({ renewalOpen: true })
    expect(studioCalendar(state).staffingHorizon.contracts.find(row => row.talentId === made.id))
      .toMatchObject({ renewalOpen: true, renewalWindowWeek: 42, endWeekExclusive: 54 })
    expect(studioCalendar(state).commitments.some(row => row.kind === 'contractRenewal' && row.talentId === made.id)).toBe(true)
    for (const window of financeUpcoming(state).windows) expect(window.rows.some(row =>
      row.kind === 'contractRenewal' && row.route?.targetId === made.id)).toBe(true)
    //An independent untaken branch loses the exact fit; no clock/record edit.
    const later = admitted(tick(state))
    expect(contractEndRefusal(later, made.id, 105)).not.toBeNull()
    expect(profile(later, made.id).employment.contract?.renewalOpen).toBe(false)
    expect(studioCalendar(later).commitments.some(row => row.kind === 'contractRenewal' && row.talentId === made.id)).toBe(false)
  })

  it('65 actual retirement boundaries remain in Calendar, bounded Finance rows count exact overflow, and alumni paginate deterministically', () => {
    const f = retirementCrowd(), state = f.near, before = bytes(state)
    expect(calendarRetirements(f.announced).filter(row => f.ids.includes(row.talentId))).toHaveLength(65)
    // A controlled no-construction/no-set-work fixture makes the finite event oracle explicit.
    expect(state.placement.facilities.some(row => row.status === 'underConstruction' || row.completesWeek === state.market.tick)).toBe(false)
    expect(state.sets.some(row => row.status === 'under-construction')).toBe(false)
    for (const window of financeUpcoming(state).windows) {
      const retirementCount = state.careerLifecycle.records.filter(row => row.status !== 'retired' && row.effectiveWeek <= window.toWeekInclusive
        && (row.effectiveWeek >= state.market.tick || row.status === 'finishing_commitments')).length
      const live = state.contracts.filter(row => row.startWeek <= state.market.tick && state.market.tick < row.endWeekExclusive)
      const expiries = live.filter(row => row.endWeekExclusive <= window.toWeekInclusive).length
      const renewals = live.filter(row => {
        const opens = Math.max(row.startWeek, row.endWeekExclusive - TUNING.HIRING_RENEWAL_WINDOW_WEEKS)
        return opens <= window.toWeekInclusive && TUNING.CONTRACT_TERM_OPTIONS.some(term =>
          contractEndRefusal(state, row.talentId, Math.max(state.market.tick, opens) + term) === null)
      }).length
      expect(retirementCount).toBeGreaterThanOrEqual(65)
      expect(window.rows).toHaveLength(64)
      expect(window.remainingRows).toBe(retirementCount + expiries + renewals - 64)
      expect(window.notice).toMatch(/profile|retirement/i)
      expect(window.rows).toEqual([...window.rows].sort((a, b) => a.week - b.week || a.id.localeCompare(b.id)))
    }
    expect(bytes(state)).toBe(before)
    const expected = f.retired.careerLifecycle.records.filter(row => row.status === 'retired')
      .sort((a, b) => b.retiredWeek! - a.retiredWeek! || a.personId.localeCompare(b.personId)).map(row => row.personId)
    const pages = Array.from({ length: Math.ceil(expected.length / 17) }, (_, page) => industry(f.retired, 'alumni', { page, pageSize: 17 }))
    expect(pages.flatMap(page => page.people.map(row => row.talentId))).toEqual(expected)
    for (const page of pages) {
      expect(page.totalRows).toBe(expected.length)
      expect(page.pageCount).toBe(Math.ceil(expected.length / 17))
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, page)).toEqual(page)
    }
    expect(() => industry(f.retired, 'alumni', { page: pages.length, pageSize: 17 })).toThrow(/outside/i)
    const session = new BridgeSession(f.retired, 'c2rm-industry')
    for (const invalid of [{ pageSize: 0 }, { pageSize: 51 }, { targetId: f.ids[0] }]) {
      expect(session.industry({ ...query('alumni'), ...invalid })).toMatchObject({ accepted: false })
    }
    const projection = peopleProjection(f.retired)
    expect(projection.roster.rows.some(row => expected.includes(row.talentId))).toBe(false)
    expect(projection.profiles.filter(row => f.ids.slice(0, 2).includes(row.talentId))).toHaveLength(2)
    for (const id of f.ids.slice(0, 2)) expect(profile(f.retired, id)).toMatchObject({ name: 'C2RM Same Name', nameShared: true })
    for (const population of ['employed', 'freelancer', 'known'] as const) expect(projection.roster.counts[population])
      .toBe(projection.roster.rows.filter(row => row.population === population).length)
  })
})

describe('C.2-RM alumni evidence and disclosure', () => {
  it('an actual release and real retirement preserve credit/promise/employer routes and invent no honors', () => {
    const f = multiRoleAlumnus(), original = bytes(f.state), row = profile(f.state, f.personId)
    const expected = credits(f.state, f.personId)
    expect(expected.campaignCredits, 'actual lead credit').toBeGreaterThanOrEqual(1)
    expect(row.alumni).toMatchObject({ ...expected, profession: 'actor', retiredWeek: 156,
      retiredLabel: campaignDate(156).label, extensionUsed: false, filmographyRef: { view: 'person', targetId: f.personId },
      employmentRef: { view: 'employment', targetId: f.personId } })
    expect(row.alumni!.creditBasis).toMatch(/credit/i)
    expect(row.alumni!.honorsNotice).toMatch(/unrecorded|not recorded/i)
    const film = industry(f.state, 'film', { targetId: f.filmId })
    expect(film.credits.filter(credit => credit.talentId === f.personId)).toHaveLength(1)
    expect(industry(f.state, 'person', { targetId: f.personId }).people[0]!.creditCount).toBe(expected.recordedCredits)
    expect(industry(f.state, 'person', { targetId: f.personId }).films.some(film => film.filmId === f.filmId)).toBe(true)
    expect(industry(f.state, 'employment', { targetId: f.personId }).activities.length).toBeGreaterThan(0)
    expect(row.promises.some(promise => promise.promiseId === f.promiseId)).toBe(true)
    const intervals = f.state.hollywood!.employment.map((interval, ordinal) => ({ interval, ordinal }))
      .filter(({ interval }) => interval.terms.talentId === f.personId)
      .sort((a, b) => (b.interval.endedWeek ?? b.interval.terms.endWeekExclusive) - (a.interval.endedWeek ?? a.interval.terms.endWeekExclusive) || b.ordinal - a.ordinal)
    const last = intervals[0]!.interval
    expect(row.alumni!.lastEmployer).toEqual({ studioId: last.studioId,
      studioName: f.state.hollywood!.identities.find(studio => studio.studioId === last.studioId)!.name,
      fromWeek: last.terms.startWeek, toWeek: last.endedWeek ?? last.terms.endWeekExclusive })
    expect(bytes(f.state)).toBe(original)
  })

  it('SYNTHETIC validated imported role-credit variant counts two roles on one actual film, not one distinct film', () => {
    const f = multiRoleAlumnus(), source = credits(f.state, f.personId), expected = credits(f.multiRole, f.personId)
    expect(expected.recordedCredits).toBe(source.recordedCredits + 1)
    expect(industry(f.multiRole, 'film', { targetId: f.filmId }).credits.filter(row => row.talentId === f.personId)).toHaveLength(2)
    expect(profile(f.multiRole, f.personId).alumni).toMatchObject(expected)
    expect(industry(f.multiRole, 'person', { targetId: f.personId }).people[0]!.creditCount).toBe(expected.recordedCredits)
  })

  it('a genuine long-career alumnus counts the complete >24 credit record, not the bounded profile rows', () => {
    const state = extensionWorld('rival', 2600)
    const candidates = state.careerLifecycle.records.filter(row => row.status === 'retired').map(row => ({ id: row.personId, counts: credits(state, row.personId) }))
      .sort((a, b) => b.counts.recordedCredits - a.counts.recordedCredits || a.id.localeCompare(b.id))
    expect(candidates[0]?.counts.recordedCredits, 'unmeasured corpus premise: a genuinely retired >24-credit person must exist').toBeGreaterThan(24)
    const chosen = candidates[0]!, row = profile(state, chosen.id)
    expect(row.career.rows.length).toBeLessThanOrEqual(24)
    expect(row.alumni).toMatchObject(chosen.counts)
    expect(row.alumni!.recordedCredits).toBeGreaterThan(row.career.rows.length)
    expect(industry(state, 'person', { targetId: chosen.id }).people[0]!.creditCount).toBe(chosen.counts.recordedCredits)
  })

  it('natural retired tiers stay fixed across real drift while lawful current employment changes disclosure', () => {
    const f = frozenTies()
    for (const state of [f.retired, f.later, f.rehired]) {
      const block = profile(state, f.personId).collaborators
      expect(block).toMatchObject({ asOfWeek: 156, asOfLabel: campaignDate(156).label, historicalTierNotice: null })
      expect(block.rows.find(row => row.counterpartId === f.counterpartId)?.tierLabel).toBe(f.retiredTier)
    }
    expect(profile(f.hidden, f.personId).collaborators.rows.some(row => row.counterpartId === f.counterpartId)).toBe(false)
    const wire = JSON.stringify(profile(f.hidden, f.personId).collaborators)
    expect(wire).not.toContain(f.counterpartId)
    for (const token of ['"closeness":', '"edgeId":', 'relationship-edge-', '"relationships":', '"lastEventWeek":', '"peakTier":']) expect(wire).not.toContain(token)
  })

  it('SYNTHETIC imported newer edge withholds unreconstructible retirement tier, with no hidden-counterpart notice leak', () => {
    const f = frozenTies()
    const alter = (state: GameState) => admitted({ ...state, relationships: state.relationships.map(edge =>
      (edge.a === f.personId && edge.b === f.counterpartId) || (edge.b === f.personId && edge.a === f.counterpartId)
        ? { ...edge, lastEventWeek: 400 } : edge) })
    const visible = profile(alter(f.later), f.personId).collaborators
    expect(visible.rows.find(row => row.counterpartId === f.counterpartId)).toMatchObject({ tierLabel: null, sign: 0, drivers: [] })
    expect(visible).toMatchObject({ asOfWeek: 156 })
    expect((visible as unknown as { historicalTierNotice: string | null }).historicalTierNotice).toMatch(/unavailable|not recorded|cannot/i)
    const hidden = profile(alter(f.hidden), f.personId).collaborators
    expect((hidden as unknown as { historicalTierNotice: string | null }).historicalTierNotice).toBeNull()
    expect(JSON.stringify(hidden)).not.toContain(f.counterpartId)
  })

  it('active/no-root/no-edge collaborator reads retain honest gaps and current as-of nulls', () => {
    const state = freshWorld('c2rm-no-root'), personId = state.talent[0]!.id
    expect(profile(state, personId).collaborators).toMatchObject({ asOfWeek: null, asOfLabel: null, historicalTierNotice: null })
    const { relationships: _oldRoot, ...oldReaderShape } = state
    const historical = relationshipBlockFor(oldReaderShape as GameState, personId, owner(state))
    expect(historical.rows.every(row => row.tierLabel === null)).toBe(true)
    const empty = relationshipBlockFor(admitted({ ...state, relationships: [] }), personId, owner(state))
    expect(empty.rows.every(row => row.tierLabel === null)).toBe(true)
  })

  it('whole snapshots validate and campaign-local people with identical ids never share lifecycle data', () => {
    const a = extensionWorld('gap', 52), b = extensionWorld('exact', 52), id = 'authored-0000'
    for (const state of [a, b, a, b]) {
      const before = bytes(state), expected = state === a ? 104 : 150
      expect(lifecycle(state, id).effectiveWeek).toBe(expected)
      const snapshot = new BridgeSession(state, `c2rm-${expected}`).snapshot()
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)).toEqual(snapshot)
      expect(bytes(state)).toBe(before)
    }
    const rival = extensionWorld('rival')
    const publicDtos = JSON.stringify({ people: peopleProjection(rival), alumni: industry(rival, 'alumni'), calendar: calendarRetirements(rival) })
    for (const token of ['"verifiedWork":', '"seatTalentIds":', '"budgetPerWeek":', '"researchCapacity":', '"edgeId":']) expect(publicDtos).not.toContain(token)
  })
})
