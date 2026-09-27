// 1030/1048/1063/1065: core-only, file-owned lazy routes. No bridge graph.
import assert from 'node:assert/strict'
import { expect } from 'vitest'
import { beginFounding } from '../../src/core/employment.js'
import { initializeHollywood } from '../../src/core/hollywood.js'
import { migrateToLive, exportSave, stableStringify } from '../../src/core/save.js'
import { studioCalendar } from '../../src/core/studioCalendar.js'
import { tick } from '../../src/core/tick.js'
import type { CreativeRole, GameState } from '../../src/core/types.js'
import { c4Fixture, envelopeV34 } from './p14c4-fixtures.js'
import { clone, DEFERRED_ACTOR, deferredBoundary, FOCUS, migrated, person, PRE207, SCIENTIST, scientistBoundary, sha } from './p14c3-fixtures.js'
import { acceptedEvidence, actEvidence, addYoungEvidence, greenlightEvidence, releaseEvidence, reopenEvidence } from './p14c3-genuine-evidence-fixtures.js'

export { FOCUS, SCIENTIST, DEFERRED_ACTOR }
export type CareerEvent = { eventId: string; kind: 'professionChanged' | 'industryRetired'; week: number;
  talentId: string; talentName: string; profession: CreativeRole; fromProfession: 'actor' | null; line: string }
export function calendarCareer(state: GameState): CareerEvent[] {
  const value = studioCalendar(state) as ReturnType<typeof studioCalendar> & { careerEvents?: CareerEvent[] }
  expect(value.careerEvents, '946 required separate Calendar career events').toBeDefined()
  assert.ok(Array.isArray(value.careerEvents))
  return value.careerEvents
}
type Cached<T> = { ok: true; value: T } | { ok: false; error: unknown }
export function surfaceFixtures(label: string, cap: 15 | 71) {
  const cache = new Map<string, Cached<unknown>>()
  const calls = { changed: 0, scientist: 0, deferred: 0, dormant: 0, film: 0 }
  const limits = { changed: 14, scientist: cap === 71 ? 14 : 1, deferred: cap === 71 ? 1 : 0,
    dormant: cap === 71 ? 2 : 0, film: cap === 71 ? 40 : 0 }
  const worlds = { changed: new Map<number, GameState>(), scientist: new Map<number, GameState>() }
  const total = () => Object.values(calls).reduce((sum, count) => sum + count, 0)
  function memo<T>(key: string, build: () => T): T {
    const found = cache.get(key) as Cached<T> | undefined
    if (found) { if (!found.ok) throw found.error; return clone(found.value) }
    try { const value = build(); cache.set(key, { ok: true, value }); return clone(value) }
    catch (error) { cache.set(key, { ok: false, error }); throw error }
  }
  function step(group: keyof typeof calls, state: GameState): GameState {
    assert.ok(calls[group] < limits[group] && total() < cap, `${label}/${group} actual setup-inclusive tick cap`)
    calls[group]++
    const after = tick(state, { develop: true })
    expect(after.market.tick).toBe(state.market.tick + 1)
    return after
  }
  function route(group: 'changed' | 'scientist', week: number): GameState {
    const start = group === 'changed' ? 207 : 670
    assert.ok(Number.isInteger(week) && week >= start && week <= start + limits[group])
    // Cache a failed step independently of its requesting leaf/end point. A later
    // request cannot rerun the same prefix after a deterministic setup failure.
    if (!worlds[group].has(start)) {
      const state = memo(`${group}/input`, () => {
        const input = group === 'changed' ? migrated(PRE207) : scientistBoundary()
        expect(input.market.tick).toBe(start); acceptedEvidence(input); return input
      })
      worlds[group].set(start, state)
    }
    for (let current = start + 1; current <= week; current++) if (!worlds[group].has(current)) {
      const after = memo(`${group}/${current}`, () => {
        const state = step(group, clone(worlds[group].get(current - 1)!))
        acceptedEvidence(state)
        return state
      })
      worlds[group].set(current, after)
    }
    return clone(worlds[group].get(week)!)
  }
  const changed = (week = 208) => route('changed', week)
  const scientist = (week = 671) => route('scientist', week)
  function deferred() {
    return memo('deferred', () => {
      const before = deferredBoundary(); acceptedEvidence(before)
      const state = step('deferred', before); acceptedEvidence(state)
      expect(state.market.tick).toBe(2601)
      expect(state.careerLifecycle.transitionEvaluations.find(row => row.personId === DEFERRED_ACTOR))
        .toMatchObject({ week: 2601, outcome: 'deferred', reason: 'noEligibleTarget' })
      return { before, state }
    })
  }
  function laterFilm() {
    return memo('later-film', () => {
      const origin = changed()
      let state = clone(origin)
      for (const id of Object.values(FOCUS)) state = actEvidence(state, { kind: 'signContract', talentId: id, termWeeks: 52 })
      const cast: string[] = []
      for (const slot of ['lead', 'antagonist', 'support']) {
        const added = addYoungEvidence(state, 'actor', `${label} ${slot}`)
        state = added.state; cast.push(added.id)
      }
      const craft = addYoungEvidence(state, 'craft', `${label} craft`); state = craft.state
      const made = greenlightEvidence(state, { directorId: FOCUS.director, writerId: FOCUS.writer,
        cast: { lead: cast[0]!, antagonist: cast[1]!, support: cast[2]! }, craftIds: [craft.id] })
      const released = releaseEvidence(made.state, made.productionId, FOCUS.director, current => step('film', current))
      const film = released.studio.releasedFilms.find(row => row.productionId === made.productionId)
      assert.ok(film && film.releaseTick > 208)
      expect(film.participants?.director.talentId).toBe(FOCUS.director)
      expect(film.participants?.cast.lead.talentId).toBe(cast[0])
      expect(released.relationships?.some(row => ((row.a === FOCUS.director && row.b === cast[0])
        || (row.b === FOCUS.director && row.a === cast[0])) && row.lastEventWeek > 208)).toBe(true)
      acceptedEvidence(released)
      return { origin, state: released, loaded: reopenEvidence(released), cast, productionId: made.productionId }
    })
  }
  function dormant() {
    return memo('dormant-compatibility', () => {
      const original = c4Fixture('genuine-v34-c4-null-hollywood'), originalEnvelope = envelopeV34(original)
      expect(original.market.tick).toBe(208); expect(original.hollywood).toBeNull()
      expect(original.careerLifecycle.records).toEqual([])
      const arranged = clone(original), id = 't-act-18'
      // 1048 explicit synthetic old retirement history; no natural notice claim.
      arranged.careerLifecycle = { ...arranged.careerLifecycle, records: [{ personId: id, profession: 'actor',
        intentRulesVersion: 1, cause: 'idleInWindow', announcedWeek: 52, ageAtAnnouncement: 61,
        effectiveWeek: 104, status: 'retired', finishingFromWeek: null, retiredWeek: 104 }] }
      expect({ ...arranged, careerLifecycle: original.careerLifecycle }).toEqual(original)
      const strict34 = envelopeV34(arranged), state = migrateToLive(strict34).state
      acceptedEvidence(state)
      expect(state.careerLifecycle.transitionBoundaryWeek).toBe(208)
      expect(state.careerLifecycle.transitionDue).toEqual([])
      expect(state.careerLifecycle.transitionEvaluations).toEqual([])
      const dormant209 = step('dormant', state); acceptedEvidence(dormant209)
      expect(dormant209.hollywood).toBeNull(); expect(dormant209.careerLifecycle.transitionDue).toEqual([])
      const activated = beginFounding(dormant209); acceptedEvidence(activated)
      expect(activated.hollywood).toMatchObject({ origin: 'migration', originWeek: 209 })
      expect(activated.founding).not.toBeNull()
      expect(activated.careerLifecycle.transitionDue).toEqual([{ personId: id, week: 210 }])
      expect(activated.careerLifecycle.transitionEvaluations).toEqual([])
      expect(stableStringify(initializeHollywood(activated, 'migration'))).toBe(stableStringify(activated))
      const reconciled = step('dormant', activated); acceptedEvidence(reconciled)
      expect(reconciled.founding).toEqual(activated.founding)
      expect(reconciled.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
        .toEqual([expect.objectContaining({ week: 210, outcome: 'deferred', inputs: expect.objectContaining({ actingFirstTakes: 0 }) })])
      expect(reconciled.careerLifecycle.transitionDue).toContainEqual({ personId: id, week: 262 })
      expect(reconciled.careerLifecycle.records.find(row => row.personId === id))
        .toEqual(state.careerLifecycle.records.find(row => row.personId === id))
      console.info(JSON.stringify({ phase: label, classification: '1048-synthetic-old34-compatibility',
        originalSha: sha(exportSave(originalEnvelope)), arrangedSha: sha(exportSave(strict34)),
        changedPath: 'state.careerLifecycle.records', personId: id, noticeIsNotNaturalBirthdayEvidence: true }))
      return { original: migrateToLive(originalEnvelope).state, state, dormant209, activated, reconciled, id }
    })
  }
  function report() { console.info(JSON.stringify({ phase: label, calls, total: total(), cap,
    failedSetups: [...cache].filter(([, value]) => !value.ok).map(([key]) => key) })) }
  return { changed, scientist, deferred, laterFilm, dormant, report }
}
export function expectedCareerEvents(state: GameState): Omit<CareerEvent, 'line'>[] {
  const rows: Omit<CareerEvent, 'line'>[] = [
    ...state.careerLifecycle.professionChanges.map(row => ({ eventId: row.id, kind: 'professionChanged' as const,
      week: row.week, talentId: row.personId, talentName: person(state, row.personId).name, profession: row.to, fromProfession: 'actor' as const })),
    ...state.careerLifecycle.industryRetirements.map(row => ({ eventId: `industry-retirement:${JSON.stringify(row.personId)}`,
      kind: 'industryRetired' as const, week: row.week, talentId: row.personId,
      talentName: person(state, row.personId).name, profession: row.profession, fromProfession: null })),
  ]
  return rows.filter(row => state.market.tick >= row.week && state.market.tick - row.week < 13)
    .sort((a, b) => b.week - a.week || (a.eventId < b.eventId ? -1 : a.eventId > b.eventId ? 1 : 0))
}
