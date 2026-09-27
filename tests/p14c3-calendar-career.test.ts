import { afterAll, describe, expect, it } from 'vitest'
import { studioCalendar } from '../src/core/studioCalendar.js'
import { exportSave, makeSave } from '../src/core/save.js'
import { clone, person } from './helpers/p14c3-fixtures.js'
import { calendarCareer, expectedCareerEvents, FOCUS, SCIENTIST, surfaceFixtures } from './helpers/p14c3-surface-fixtures.js'

const f = surfaceFixtures('1065-core-calendar', 15)
afterAll(f.report)
describe('C.3 Calendar career facts remain separate from committed operating work', () => {
  it('C1 publishes exact actual changes and finality with public identities, dates and ordered event keys', () => {
    const worlds = [f.changed(), f.scientist()]
    expect(worlds[0]!.careerLifecycle.professionChanges.filter(row => Object.values(FOCUS).some(id => id === row.personId))).toHaveLength(2)
    expect(worlds[1]!.careerLifecycle.industryRetirements.find(row => row.personId === SCIENTIST)).toMatchObject({ week: 671 })
    for (const state of worlds) {
      const rows = calendarCareer(state), expected = expectedCareerEvents(state)
      expect(rows.map(({ line: _line, ...row }) => row)).toEqual(expected)
      for (const row of rows) {
        expect(Object.keys(row).sort()).toEqual(['eventId', 'kind', 'week', 'talentId', 'talentName', 'profession', 'fromProfession', 'line'].sort())
        expect(row.talentName).toBe(person(state, row.talentId).name)
        expect(row.line).toMatch(new RegExp(row.profession, 'i'))
        expect(row.line).toContain(String(row.week))
      }
    }
  })
  it('C2 adds no commitment, reservation, cost, next boundary or decision and remains read-only', () => {
    for (const state of [f.changed(), f.scientist()]) {
      const before = exportSave(makeSave(state)), view = studioCalendar(state), events = calendarCareer(state)
      expect(events.length).toBeGreaterThan(0)
      expect(view.summary.committedEvents).toBe(view.commitments.length)
      const future = view.commitments.filter(row => row.week > state.market.tick).map(row => row.week)
      expect(view.summary.nextCommittedWeek).toBe(future.length ? Math.min(...future) : null)
      expect(view.commitments.some(row => ['professionChanged', 'industryRetired'].includes(row.kind))).toBe(false)
      expect(view.facilities.flatMap(row => row.slots).filter(row => row.occupant !== null)).toHaveLength(view.summary.occupiedSlots)
      expect(studioCalendar(state)).toEqual(view)
      expect(exportSave(makeSave(state))).toBe(before)
    }
  })
  it('C3 retains actual age0/12 news, drops age13, and filters a labelled future-event negative', () => {
    const worlds = [f.changed(208), f.changed(220), f.changed(221)]
    for (const [index, state] of worlds.entries()) {
      const expected = index < 2 ? 2 : 0
      expect(calendarCareer(state).filter(row => Object.values(FOCUS).some(id => id === row.talentId))).toHaveLength(expected)
      expect(state.careerLifecycle.professionChanges.filter(row => Object.values(FOCUS).some(id => id === row.personId))).toHaveLength(2)
    }
    // Typed read-only malformed filter input, not a saved or continued world.
    const future = clone(worlds[0]!)
    future.careerLifecycle = { ...future.careerLifecycle,
      professionChanges: future.careerLifecycle.professionChanges.map(row => ({ ...row, week: future.market.tick + 1 })) }
    expect(calendarCareer(future).filter(row => row.kind === 'professionChanged')).toEqual([])
  })
})
