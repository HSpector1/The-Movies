// One qualified Director off-menu prefix:366 real calls, then twelve to481.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it, vi } from 'vitest'
import * as ticking from '../src/core/tick.js'
import { campaignDate } from '../src/core/calendar.js'
import { peopleProjection } from '../bridge/people.ts'
import { industryPage } from '../bridge/industry.ts'
import { marketPage } from '../bridge/market.ts'
import { relationshipBlockFor } from '../bridge/relationships.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { exportSave, makeSave } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { clone, FOCUS } from './helpers/p14c3-fixtures.js'
import { acceptedEvidence, reopenEvidence } from './helpers/p14c3-genuine-evidence-fixtures.js'
import { calendarCareer } from './helpers/p14c3-surface-fixtures.js'
import { offmenuAccounting, offmenuTerminal } from './helpers/p14c3-offmenu-extension-fixtures.js'

const id = FOCUS.director
let calls = 0
type Worlds = { at468: GameState; loaded468: GameState; at469: GameState; at480: GameState; at481: GameState; loaded481: GameState }
let cached: { ok: true; value: Worlds } | { ok: false; error: unknown } | undefined
function worlds(): Worlds {
  if (cached) { if (!cached.ok) throw cached.error; return clone(cached.value) }
  try {
    // Count the already-reviewed imported trajectory's real invocations; do not
    // silently subtract its157 setup calls or claim a cross-file cached prefix.
    const original = ticking.tick
    const spy = vi.spyOn(ticking, 'tick').mockImplementation((state, options) => {
      assert.ok(calls < 366 && state.market.tick === 103 + calls, 'one exact103→469 prefix')
      expect(options?.develop).toBe(true); calls++
      return original(state, options)
    })
    let terminal: ReturnType<typeof offmenuTerminal>
    try { terminal = offmenuTerminal('director') } finally { spy.mockRestore() }
    expect(calls).toBe(366)
    expect(offmenuAccounting()).toMatchObject({ completedPrefixes: ['director'], directTickCalls: { director: 209, writer: 0 } })
    let state = clone(terminal.at469), at480: GameState | undefined
    while (state.market.tick < 481) {
      assert.ok(calls < 378); calls++
      state = ticking.tick(state, { develop: true })
      if (state.market.tick === 480) at480 = clone(state)
    }
    assert.ok(at480); expect(calls).toBe(378)
    acceptedEvidence(state)
    const value = { at468: terminal.at468, loaded468: terminal.loaded468, at469: terminal.at469,
      at480, at481: state, loaded481: reopenEvidence(state) }
    for (const current of Object.values(value)) acceptedEvidence(current)
    cached = { ok: true, value }; return clone(value)
  } catch (error) { cached = { ok: false, error }; throw error }
}
function profile(state: GameState) {
  const row = peopleProjection(state).profiles.find(row => row.talentId === id)
  assert.ok(row)
  return row as typeof row & { professionCareer?: { status: string; professionRetirements: {
    profession: string; retiredWeek: number; retiredLabel: string; extensionUsed: boolean }[];
    industryRetiredWeek: number | null; lastChange: { week: number; fromProfession: string; toProfession: string } | null } }
}
function pages(state: GameState, view: IndustryQuery['view'], targetId: string | null = null) {
  const query: IndustryQuery = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: '1065-dual',
    requestId: 'read', expectedStateRevision: 0, type: 'industryQuery', view, targetId, page: 0, pageSize: 50, lane: 'recent', period: 'all' }
  const first = industryPage(state, '1065-dual', 0, query), result = [first]
  for (let page = 1; page < first.pageCount; page++) result.push(industryPage(state, '1065-dual', 0, { ...query, page }))
  for (const value of result) parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, value)
  return result
}
afterAll(() => console.info(JSON.stringify({ phase: '1065-dual-surface', actualTickCalls: calls, cap: 378,
  prefix: offmenuAccounting(), failed: cached?.ok === false })))
describe('C.3 both genuinely completed profession episodes remain public', () => {
  it('B1 retains actual Actor260 and Director468 history with both extensions and one latest alumnus identity', () => {
    const f = worlds()
    for (const state of [f.at468, f.loaded468, f.at469]) {
      expect(state.careerLifecycle.records.filter(row => row.personId === id && row.status === 'retired'))
        .toEqual([expect.objectContaining({ profession: 'actor', retiredWeek: 260, extensionUsed: true }),
          expect.objectContaining({ profession: 'director', retiredWeek: 468, extensionUsed: true })])
      expect(state.careerLifecycle.industryRetirements.find(row => row.personId === id)).toMatchObject({ week: 468 })
      const p = profile(state), career = p.professionCareer
      expect(career).toBeDefined(); assert.ok(career)
      expect(career).toMatchObject({ status: 'retired', industryRetiredWeek: 468,
        lastChange: { week: 260, fromProfession: 'actor', toProfession: 'director' } })
      expect(career.professionRetirements.map(row => ({ profession: row.profession, retiredWeek: row.retiredWeek,
        retiredLabel: row.retiredLabel, extensionUsed: row.extensionUsed }))).toEqual([
        { profession: 'actor', retiredWeek: 260, retiredLabel: campaignDate(260).label, extensionUsed: true },
        { profession: 'director', retiredWeek: 468, retiredLabel: campaignDate(468).label, extensionUsed: true }])
      expect(p.alumni).toMatchObject({ profession: 'director', retiredWeek: 468, extensionUsed: true,
        filmographyRef: { view: 'person', targetId: id }, employmentRef: { view: 'employment', targetId: id } })
      expect(p.lifecycle).toMatchObject({ profession: 'director', status: 'retired', retiredWeek: 468 })
      const alumni = pages(state, 'alumni').flatMap(row => row.people).filter(row => row.talentId === id)
      expect(alumni).toHaveLength(1)
      expect(alumni[0]).toMatchObject({ professionRetiredWeek: 468, industryRetiredWeek: 468, lastProfessionChangeWeek: 260 })
      expect(JSON.stringify(career)).not.toMatch(/annualSalary|signingBonus|contractId|inputsDigest|contextWitness/)
    }
  })
  it('B2 retains actual finality at468/480 and expires it at481 in all three news surfaces', () => {
    const f = worlds(), eventId = `industry-retirement:${JSON.stringify(id)}`
    for (const [state, visible] of [[f.at468, true], [f.at480, true], [f.at481, false]] as const) {
      expect(calendarCareer(state).filter(row => row.eventId === eventId)).toHaveLength(visible ? 1 : 0)
      const pulse = pages(state, 'pulse').flatMap(row => row.activities)
      expect(pulse.filter(row => row.eventId === eventId)).toHaveLength(visible ? 1 : 0)
      expect(marketPage(state, { view: 'market', targetId: null }).attention
        .filter(row => row.talentId === id && String(row.cause) === 'industryRetired')).toHaveLength(visible ? 1 : 0)
      expect(profile(state).professionCareer?.lastChange?.week).toBe(260)
      expect(profile(state).professionCareer?.professionRetirements).toHaveLength(2)
      // Sound416 is degenerate and emits no announcement; the first actual
      // milestone is884. M9's genuine2600 input owns the positive old-row check.
      expect(pulse.filter(row => row.eventId.startsWith('technology-announcement-'))).toEqual([])
    }
  })
  it('B3 freezes final relationships at actual468, preserves both meanings and keeps reopened reads pure', () => {
    const f = worlds()
    for (const state of [f.at469, f.at481, f.loaded481]) {
      const before = exportSave(makeSave(state)), p = profile(state)
      expect(relationshipBlockFor(state, id, state.hollywood!.playerStudioId))
        .toMatchObject({ asOfWeek: 468, asOfLabel: campaignDate(468).label })
      expect(p.lifecycle).toMatchObject({ profession: 'director', retiredWeek: 468 })
      expect(p.professionCareer).toMatchObject({ status: 'retired', industryRetiredWeek: 468 })
      parseWireValue(BRIDGE_SCHEMA.$defs.StudioPersonProfileSnapshot, p)
      pages(state, 'person', id); pages(state, 'employment', id)
      expect(exportSave(makeSave(state))).toBe(before)
    }
    expect(exportSave(makeSave(f.loaded481))).toBe(exportSave(makeSave(f.at481)))
  })
})
