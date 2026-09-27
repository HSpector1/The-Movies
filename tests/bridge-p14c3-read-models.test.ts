// 1030/1048/1063: independent public surfaces; future fields use narrow views.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it } from 'vitest'
import { peopleProjection } from '../bridge/people.ts'
import { industryPage } from '../bridge/industry.ts'
import { marketPage } from '../bridge/market.ts'
import { relationshipBlockFor } from '../bridge/relationships.ts'
import { financeUpcoming } from '../bridge/finance-upcoming.ts'
import { retirementAttentionRows } from '../bridge/lifecycle.ts'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import type { JsonSchema } from '../bridge/schema/dsl.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { campaignDate } from '../src/core/calendar.js'
import { applyActions } from '../src/core/actions.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { exportSave, makeSave, stableStringify } from '../src/core/save.js'
import type { CreativeRole, GameState } from '../src/core/types.js'
import { clone, CONTINUOUS208, deferredBoundary, migrated } from './helpers/p14c3-fixtures.js'
import { acceptedEvidence } from './helpers/p14c3-genuine-evidence-fixtures.js'
import { DEFERRED_ACTOR, expectedCareerEvents, FOCUS, SCIENTIST, surfaceFixtures } from './helpers/p14c3-surface-fixtures.js'

type Retirement = { profession: CreativeRole; announcedWeek: number; effectiveWeek: number; retiredWeek: number; retiredLabel: string; extensionUsed: boolean }
type Change = { fromProfession: 'actor'; toProfession: 'director' | 'writer'; week: number; dateLabel: string; reason: string }
type Career = { status: 'working' | 'awaitingTransition' | 'pendingReconciliation' | 'retired'; line: string;
  recordingNotice: string | null; professionRetirements: Retirement[]; lastChange: Change | null;
  industryRetiredWeek: number | null; industryRetiredLabel: string | null }
type IndustryCareer = { careerStatus: Career['status']; careerLine: string; professionRetiredWeek: number | null;
  industryRetiredWeek: number | null; lastProfessionChangeWeek: number | null }
const f = surfaceFixtures('1065-bridge-read-models', 71)
afterAll(f.report)
function profile(state: GameState, id: string) {
  const row = peopleProjection(state).profiles.find(row => row.talentId === id)
  assert.ok(row)
  return row as typeof row & { professionCareer?: Career }
}
function career(state: GameState, id: string): Career {
  const value = profile(state, id).professionCareer
  expect(value, '946 required additive professionCareer').toBeDefined(); assert.ok(value)
  return value
}
function definition(name: string): JsonSchema {
  const defs = BRIDGE_SCHEMA.$defs as unknown as Record<string, JsonSchema>
  expect(defs[name], `946 required definition ${name}`).toBeDefined(); assert.ok(defs[name])
  return defs[name]
}
function page(state: GameState, view: IndustryQuery['view'], extra: Partial<IndustryQuery> = {}) {
  const query: IndustryQuery = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: '1065-read',
    requestId: 'read', expectedStateRevision: 0, type: 'industryQuery', view, targetId: null,
    page: 0, pageSize: 50, lane: 'recent', period: 'all', ...extra }
  return industryPage(state, '1065-read', 0, query)
}
function allPages(state: GameState, view: IndustryQuery['view'], extra: Partial<IndustryQuery> = {}) {
  const first = page(state, view, extra), pages = [first]
  for (let index = 1; index < first.pageCount; index++) pages.push(page(state, view, { ...extra, page: index }))
  for (const current of pages) parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, current)
  return pages
}
const attention = (state: GameState) => marketPage(state, { view: 'market', targetId: null }).attention
const careerAttention = (state: GameState) => attention(state).filter(row => ['professionChanged', 'industryRetired'].includes(String(row.cause)))
function retirementFacts(state: GameState, id: string): Retirement[] {
  return state.careerLifecycle.records.filter(row => row.personId === id && row.status === 'retired' && row.retiredWeek !== null)
    .sort((a, b) => a.retiredWeek! - b.retiredWeek! || a.profession.localeCompare(b.profession))
    .map(row => ({ profession: row.profession, announcedWeek: row.announcedWeek, effectiveWeek: row.effectiveWeek,
      retiredWeek: row.retiredWeek!, retiredLabel: campaignDate(row.retiredWeek!).label, extensionUsed: row.extensionUsed }))
}
function creditCount(state: GameState, id: string) {
  const authored = state.hollywood!.films.filter(row => row.provenance === 'authored-start/v1')
    .reduce((sum, row) => sum + row.credits.filter(credit => credit.talentId === id).length, 0)
  const industry = state.hollywood!.films.filter(row => row.provenance === 'simulation/v1')
    .reduce((sum, row) => sum + row.credits.filter(credit => credit.talentId === id).length, 0)
  const player = state.studio.releasedFilms.reduce((sum, row) => {
    const p = row.participants
    return sum + (p ? [p.writer, p.director, ...Object.values(p.cast), ...p.craft].filter(credit => credit.talentId === id).length : 0)
  }, 0)
  return { recordedCredits: authored + industry + player, authoredCredits: authored, campaignCredits: industry + player }
}

describe('C.3 exact public career read models and retained history', () => {
  it('M1 requires additive exact public career DTOs while preserving existing credited development history', () => {
    const state = f.changed(), existing = profile(state, FOCUS.director).career
    // 1033/1068: the genuine outgoing films ran without development. Released
    // credits are real; a frozen development event must never be inferred.
    const events = [...state.careerEvents, ...(state.hollywood?.careerEvents ?? [])]
      .filter(row => row.talentId === FOCUS.director)
    const capturedCredits = creditCount(state, FOCUS.director).campaignCredits
    const uncapturedFilms = state.studio.releasedFilms.filter(row => row.participants === undefined).length
    expect(capturedCredits).toBeGreaterThan(0); expect(events).toEqual([]); expect(uncapturedFilms).toBe(0)
    expect(existing).toMatchObject({ rows: [], creditsWithoutEvents: capturedCredits,
      uncapturedFilms, provenance: 'partial' })
    expect(existing.provenanceNotice).toContain(String(capturedCredits))
    expect(existing.provenanceNotice).toMatch(/no recorded career change/)
    const expected = {
      StudioProfessionRetirement: ['profession', 'announcedWeek', 'effectiveWeek', 'retiredWeek', 'retiredLabel', 'extensionUsed'],
      StudioProfessionChange: ['fromProfession', 'toProfession', 'week', 'dateLabel', 'reason'],
      StudioPersonCareer: ['status', 'line', 'recordingNotice', 'professionRetirements', 'lastChange', 'industryRetiredWeek', 'industryRetiredLabel'],
    }
    for (const [name, keys] of Object.entries(expected)) {
      const schema = definition(name) as { properties: Record<string, unknown>; required: string[]; additionalProperties: boolean }
      expect(Object.keys(schema.properties).sort()).toEqual([...keys].sort())
      expect([...schema.required].sort()).toEqual([...keys].sort()); expect(schema.additionalProperties).toBe(false)
    }
    const schema = definition('StudioPersonCareer') as { properties: Record<string, { enum?: string[] }> }
    expect(schema.properties.status!.enum).toEqual(['working', 'awaitingTransition', 'pendingReconciliation', 'retired'])
    const industrySchema = definition('StudioIndustryPerson') as { properties: Record<string, { enum?: string[] }>; required: string[] }
    for (const field of ['careerStatus', 'careerLine', 'professionRetiredWeek', 'industryRetiredWeek', 'lastProfessionChangeWeek'])
      expect(industrySchema.required).toContain(field)
    expect(industrySchema.properties.careerStatus!.enum).toEqual(schema.properties.status!.enum)
    expect(industrySchema.properties.lifecycleStatus!.enum).toEqual(['active', 'announced', 'finishing_commitments', 'retired'])
    const retired = retirementFacts(state, FOCUS.director)[0]!, change: Change = { fromProfession: 'actor',
      toProfession: 'director', week: 208, dateLabel: campaignDate(208).label, reason: 'Recorded profession change.' }
    parseWireValue(definition('StudioProfessionRetirement'), { ...retired, profession: 'scientist' })
    for (const bad of [{ ...retired, profession: 'unknown' }, { ...retired, extensionUsed: 0 }, { ...retired, retiredWeek: null }])
      expect(() => parseWireValue(definition('StudioProfessionRetirement'), bad)).toThrow()
    for (const target of ['director', 'writer']) parseWireValue(definition('StudioProfessionChange'), { ...change, toProfession: target })
    for (const bad of [{ ...change, fromProfession: 'writer' }, { ...change, toProfession: 'actor' }, { ...change, week: null }])
      expect(() => parseWireValue(definition('StudioProfessionChange'), bad)).toThrow()
    const actualCareer = career(state, FOCUS.director)
    parseWireValue(definition('StudioPersonCareer'), { ...actualCareer, recordingNotice: null, lastChange: null,
      industryRetiredWeek: null, industryRetiredLabel: null })
    for (const bad of [{ ...actualCareer, status: null }, { ...actualCareer, line: null },
      { ...actualCareer, professionRetirements: null }, { ...actualCareer, line: '' }])
      expect(() => parseWireValue(definition('StudioPersonCareer'), bad)).toThrow()
    expect(profile(state, FOCUS.director).career).toEqual(existing)
    parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, new BridgeSession(state).snapshot())
    const good = profile(state, FOCUS.director)
    const missing: Partial<typeof good> = clone(good)
    delete missing.professionCareer
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioPersonProfileSnapshot, missing)).toThrow(/professionCareer|required/)
    expect(() => parseWireValue(definition('StudioPersonCareer'), { ...career(state, FOCUS.director), unknown: true })).toThrow(/unknown|additional|unexpected/i)
  })

  it('M2 distinguishes working Director/Writer from completed acting retirement even when newly employed', () => {
    const state = f.changed(), hired = applyActions(state, Object.values(FOCUS).map(talentId => ({ kind: 'signContract' as const, talentId, termWeeks: 52 })))
    acceptedEvidence(hired)
    for (const current of [state, hired]) for (const target of ['director', 'writer'] as const) {
      const id = FOCUS[target], p = profile(current, id), row = career(current, id)
      expect(p.lifecycle).toMatchObject({ status: 'active', profession: target, retiredWeek: null })
      expect(row).toMatchObject({ status: 'working', professionRetirements: retirementFacts(current, id),
        industryRetiredWeek: null, industryRetiredLabel: null,
        lastChange: { fromProfession: 'actor', toProfession: target, week: 208, dateLabel: campaignDate(208).label } })
      expect(row.professionRetirements).toHaveLength(1)
      expect(row.recordingNotice).toMatch(/207/)
      expect(row.lastChange!.reason.length).toBeGreaterThan(0)
      expect(p.alumni).toMatchObject({ profession: 'actor', retiredWeek: 208 })
      expect(current.careerLifecycle.professionChanges.filter(row => row.personId === id)).toHaveLength(1)
    }
    expect(hired.contracts.filter(row => Object.values(FOCUS).some(id => id === row.talentId))).toHaveLength(2)
  })

  it('M3 uses current disclosed relationships after genuine new-role work instead of freezing at old Actor retirement', () => {
    const work = f.laterFilm(), id = FOCUS.director, counterpart = work.cast[0]!
    for (const state of [work.state, work.loaded]) {
      const events = [...state.careerEvents, ...(state.hollywood?.careerEvents ?? [])]
        .filter(row => row.talentId === id)
        .sort((a, b) => b.releaseWeek - a.releaseWeek || (a.eventId < b.eventId ? -1 : a.eventId > b.eventId ? 1 : 0))
      const film = state.studio.releasedFilms.find(row => row.productionId === work.productionId)
      assert.ok(film)
      expect(events.some(row => row.filmId === film.productionId && row.releaseWeek > 208 && row.role === 'director')).toBe(true)
      const development = profile(state, id).career
      expect(development.rows.length).toBeGreaterThan(0)
      expect(development.rows.map(row => row.eventId)).toEqual(events.slice(0, 24).map(row => row.eventId))
      for (const event of events.slice(0, 24)) expect(development.rows.find(row => row.eventId === event.eventId))
        .toMatchObject({ filmId: event.filmId, filmTitle: event.filmTitle, releaseWeek: event.releaseWeek,
          releaseDateLabel: campaignDate(event.releaseWeek).label, genre: event.genre, discipline: event.discipline,
          ovrBefore: event.ovrBefore, ovrAfter: event.ovrAfter, reasonCodes: event.reasonCodes })
      const edge = state.relationships!.find(row => (row.a === id && row.b === counterpart) || (row.b === id && row.a === counterpart))
      assert.ok(edge); expect(edge.lastEventWeek).toBeGreaterThan(208)
      expect(state.contracts.some(row => row.talentId === counterpart && row.endWeekExclusive > state.market.tick)).toBe(true)
      const block = relationshipBlockFor(state, id, state.hollywood!.playerStudioId)
      expect(block).toMatchObject({ asOfWeek: null, asOfLabel: null, historicalTierNotice: null })
      expect(block.rows.find(row => row.counterpartId === counterpart)).toMatchObject({ sharedPictures: 1 })
      expect(block.rows.find(row => row.counterpartId === counterpart)?.tierLabel).not.toBe('No shared work recorded')
      expect(profile(state, id).collaborators).toEqual(block)
    }
  })

  it('M4 distinguishes retired670 profession from pending670 and actual final671 career without moving relationship asOf', () => {
    const worlds = [f.scientist(670), f.scientist(671)]
    expect(worlds[0]!.careerLifecycle.industryRetirements.filter(row => row.personId === SCIENTIST)).toEqual([])
    expect(worlds[1]!.careerLifecycle.industryRetirements.find(row => row.personId === SCIENTIST)).toMatchObject({ week: 671 })
    for (const [index, state] of worlds.entries()) {
      const row = career(state, SCIENTIST)
      expect(row.status).toBe(index === 0 ? 'pendingReconciliation' : 'retired')
      expect(row.industryRetiredWeek).toBe(index === 0 ? null : 671)
      expect(row.industryRetiredLabel).toBe(index === 0 ? null : campaignDate(671).label)
      expect(row.professionRetirements).toEqual(retirementFacts(state, SCIENTIST))
      expect(row.professionRetirements[0]!.retiredWeek).toBe(670)
      expect(relationshipBlockFor(state, SCIENTIST, state.hollywood!.playerStudioId))
        .toMatchObject({ asOfWeek: 670, asOfLabel: campaignDate(670).label })
    }
  })

  it('M5 distinguishes prospective old208 acting retirement and real zero-take deferred2601 from work or finality', () => {
    const old = migrated(CONTINUOUS208), deferred = f.deferred().state
    acceptedEvidence(old)
    expect(old.careerLifecycle.professionChanges).toEqual([])
    expect(old.careerLifecycle.transitionDue).toContainEqual({ personId: FOCUS.director, week: 209 })
    expect(deferred.careerLifecycle.transitionEvaluations.find(row => row.personId === DEFERRED_ACTOR))
      .toMatchObject({ week: 2601, outcome: 'deferred', inputs: expect.objectContaining({ actingFirstTakes: 0 }) })
    for (const [state, id] of [[old, FOCUS.director], [deferred, DEFERRED_ACTOR]] as const) {
      expect(career(state, id)).toMatchObject({ status: 'awaitingTransition', lastChange: null, industryRetiredWeek: null })
      expect(career(state, id).professionRetirements).toEqual(retirementFacts(state, id))
      expect(relationshipBlockFor(state, id, state.hollywood!.playerStudioId).asOfWeek)
        .toBe(retirementRecordFor(state, id, 'actor')!.retiredWeek)
    }
  })

  it('M6 classifies labelled strict34 dormant-retired compatibility before actual activation and due210', () => {
    const worlds = f.dormant()
    expect(career(worlds.original, worlds.id).status).toBe('working')
    for (const state of [worlds.state, worlds.dormant209]) {
      expect(state.hollywood).toBeNull(); expect(state.careerLifecycle.transitionDue).toEqual([])
      expect(career(state, worlds.id)).toMatchObject({ status: 'pendingReconciliation', lastChange: null, industryRetiredWeek: null })
    }
    expect(career(worlds.activated, worlds.id).status).toBe('awaitingTransition')
    expect(career(worlds.reconciled, worlds.id).status).toBe('awaitingTransition')
    expect(worlds.reconciled.founding).toEqual(worlds.activated.founding)
  })

  it('M7 pages all genuine alumni by latest completed profession and counts complete role credits, including working former actors', () => {
    const crowd = deferredBoundary(); acceptedEvidence(crowd)
    const expected = crowd.talent.map(talent => ({ talent, facts: retirementFacts(crowd, talent.id) }))
      .filter(row => row.facts.length > 0).map(row => ({ id: row.talent.id, week: row.facts.at(-1)!.retiredWeek }))
      .sort((a, b) => b.week - a.week || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    expect(expected.length).toBeGreaterThan(50)
    const rows = allPages(crowd, 'alumni').flatMap(row => row.people)
    const profiles = new Map(peopleProjection(crowd).profiles.map(row => [row.talentId, row]))
    expect(rows.map(row => row.talentId)).toEqual(expected.map(row => row.id))
    for (const row of rows) {
      const totals = creditCount(crowd, row.talentId)
      expect(row.creditCount).toBe(totals.recordedCredits)
      expect(profiles.get(row.talentId)?.alumni).toMatchObject({ ...totals,
        filmographyRef: { view: 'person', targetId: row.talentId }, employmentRef: { view: 'employment', targetId: row.talentId } })
    }
    expect(rows.some(row => row.creditCount > 24)).toBe(true)
    const state = applyActions(f.changed(), [{ kind: 'signContract', talentId: FOCUS.director, termWeeks: 52 }]); acceptedEvidence(state)
    const actual = allPages(state, 'alumni').flatMap(row => row.people).filter(row => row.talentId === FOCUS.director)
    expect(actual).toHaveLength(1)
    expect(actual[0] as typeof actual[number] & IndustryCareer).toMatchObject({ lifecycleStatus: 'active', retiredWeek: null,
      careerStatus: 'working', professionRetiredWeek: 208, industryRetiredWeek: null, lastProfessionChangeWeek: 208,
      employerStudioId: state.hollywood!.playerStudioId })
  })

  it('M8 retains actual change/finality attention for0/12 weeks only, with safe payloads and no Finance charge', () => {
    const worlds = [f.changed(208), f.changed(220), f.changed(221), f.scientist(671), f.scientist(683), f.scientist(684)]
    for (const state of worlds) {
      const before = exportSave(makeSave(state)), expected = expectedCareerEvents(state)
        .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'professionChanged' ? -1 : 1)
          || a.week - b.week || (a.talentId < b.talentId ? -1 : a.talentId > b.talentId ? 1 : 0))
      const rows = careerAttention(state)
      expect(rows.map(row => ({ cause: String(row.cause), talentId: row.talentId })))
        .toEqual(expected.map(row => ({ cause: row.kind, talentId: row.talentId })))
      for (const row of rows) expect(Object.keys(row).sort()).toEqual(['cause', 'talentId', 'reason'].sort())
      const all = attention(state), firstCareer = all.findIndex(row => ['professionChanged', 'industryRetired'].includes(String(row.cause)))
      if (expected.length > 0) expect(firstCareer).toBeGreaterThanOrEqual(0)
      if (firstCareer >= 0) expect(all.slice(firstCareer).some(row => ['finishingCommitments', 'retirementAnnounced'].includes(String(row.cause)))).toBe(false)
      const finance = financeUpcoming(state)
      expect(finance.windows.flatMap(row => row.rows).some(row => ['professionChanged', 'industryRetired'].includes(String(row.kind)))).toBe(false)
      expect(exportSave(makeSave(state))).toBe(before)
    }
    expect(career(f.changed(221), FOCUS.director).lastChange?.week).toBe(208)
    expect(career(f.scientist(684), SCIENTIST).industryRetiredWeek).toBe(671)
    // Explicit typed presentation counterexample only: contradictory concurrent
    // episode statuses are never admitted, saved or ticked as campaign history.
    const mixed = f.changed()
    mixed.careerLifecycle = { ...mixed.careerLifecycle,
      records: mixed.careerLifecycle.records.map(row => ({ ...row, retiredWeek: null, announcedWeek: 208,
        effectiveWeek: row.personId === FOCUS.director ? 208 : 260,
        status: row.personId === FOCUS.director ? 'finishing_commitments' as const : 'announced' as const,
        finishingFromWeek: row.personId === FOCUS.director ? 208 : null })),
      industryRetirements: [{ personId: FOCUS.writer, week: 208, profession: 'writer',
        source: { personId: FOCUS.writer, profession: 'writer' }, cause: 'noCatalogue', evaluationId: null }] }
    const ordered = retirementAttentionRows(mixed)
    expect(ordered.map(row => String(row.cause))).toEqual(['finishingCommitments', 'retirementAnnounced',
      'retirementAnnounced', 'professionChanged', 'professionChanged', 'industryRetired'])
    expect(ordered.filter(row => String(row.cause) === 'professionChanged').map(row => row.talentId))
      .toEqual([...Object.values(FOCUS)].sort())
  })

  it('M9 expires null-studio career news and separately retains actual old technology in genuine2600', () => {
    // Static1065 correction: degenerate sound416 has no announcement; the
    // actual first announcement is884. Reuse genuine2600 with zero added ticks.
    const oldTechnology = allPages(deferredBoundary(), 'pulse').flatMap(row => row.activities)
    expect(oldTechnology.some(row => row.eventId.startsWith('technology-announcement-') && row.week === 884 && row.studioId === null)).toBe(true)
    const worlds = [f.changed(), f.scientist(671), f.scientist(683), f.scientist(684)]
    for (const state of worlds) {
      const activities = allPages(state, 'pulse').flatMap(row => row.activities)
      const actual = activities.filter(row => 'careerKind' in row)
      const expected = expectedCareerEvents(state)
      expect(actual.map(row => row.eventId).sort()).toEqual(expected.map(row => row.eventId).sort())
      for (const event of expected) {
        expect(actual.find(row => row.eventId === event.eventId)).toMatchObject({ eventId: event.eventId, week: event.week,
          dateLabel: campaignDate(event.week).label, group: 'people', studioId: null, filmId: null, talentId: event.talentId, careerKind: event.kind })
      }
      const ranks = { releases: 0, people: 1, studios: 2, announcements: 3 }
      expect(activities).toEqual([...activities].sort((a, b) => ranks[a.group] - ranks[b.group] || b.week - a.week
        || (a.eventId < b.eventId ? -1 : a.eventId > b.eventId ? 1 : 0)))
      const own = allPages(state, 'history', { targetId: state.hollywood!.playerStudioId }).flatMap(row => row.activities)
      expect(own.some(row => expected.some(event => event.eventId === row.eventId))).toBe(false)
    }
    const at684 = allPages(f.scientist(684), 'pulse').flatMap(row => row.activities)
    expect(at684.filter(row => row.eventId.startsWith('technology-announcement-'))).toEqual([])
    expect(at684.some(row => row.eventId === `industry-retirement:${JSON.stringify(SCIENTIST)}`)).toBe(false)
  })

  it('M10 refuses private/unknown DTO members and invalid dates while repeated public reads preserve whole state', () => {
    const state = f.changed(), before = exportSave(makeSave(state)), value = career(state, FOCUS.director)
    expect(Object.keys(value).sort()).toEqual(['status', 'line', 'recordingNotice', 'professionRetirements', 'lastChange', 'industryRetiredWeek', 'industryRetiredLabel'].sort())
    for (const forbidden of ['inputs', 'inputsDigest', 'actingWitnesses', 'contextWitness', 'ceilings', 'annualSalary', 'magnitude']) {
      expect(JSON.stringify(value)).not.toContain(`"${forbidden}"`)
      expect(() => parseWireValue(definition('StudioPersonCareer'), { ...value, [forbidden]: 'private' })).toThrow()
    }
    for (const invalid of [{ ...value, status: 'unknown' }, { ...value, industryRetiredWeek: -1 },
      { ...value, lastChange: { ...value.lastChange, week: 1.5 } },
      { ...value, professionRetirements: [{ ...value.professionRetirements[0], retiredWeek: -1 }] }])
      expect(() => parseWireValue(definition('StudioPersonCareer'), invalid)).toThrow()
    const activities = allPages(state, 'pulse').flatMap(row => row.activities).filter(row => 'careerKind' in row)
    expect(activities.length).toBeGreaterThan(0)
    const texts = [value.line, value.recordingNotice ?? '', value.lastChange?.reason ?? '',
      ...careerAttention(state).map(row => row.reason), ...activities.flatMap(row => [row.headline, row.detail])].join('\n')
    const linked = state.careerLifecycle.transitionEvaluations.filter(row => Object.values(FOCUS).some(id => id === row.personId))
    expect(linked).toHaveLength(2)
    for (const question of linked) {
      expect(texts).not.toContain(question.inputsDigest)
      for (const target of question.inputs.targets) if (target.contextWitness.counterpartId !== null)
        expect(texts).not.toContain(target.contextWitness.counterpartId)
    }
    expect(texts).not.toMatch(/inputsDigest|contextWitness|actingWitnesses|ceilings|annualSalary|signingBonus/)
    for (const bad of [{ ...activities[0], careerKind: 'invented' }, { ...activities[0], inputsDigest: 'private' }, { ...activities[0], week: -1 }])
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryActivity, bad)).toThrow()
    expect(stableStringify(peopleProjection(state))).toBe(stableStringify(peopleProjection(state)))
    expect(exportSave(makeSave(state))).toBe(before)
  })
})
