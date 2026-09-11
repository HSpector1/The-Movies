import { describe, expect, it } from 'vitest'
import { peopleProjection } from '../bridge/people.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds } from '../src/core/employment.js'
import { makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import { operationsStudio, productionPayload } from './contracts/_contractFixtures.js'

function assertAvailability(state: GameState, talentId: string, expected: string) {
  const original = makeSave(state)
  const projection = peopleProjection(state)
  const profile = projection.profiles.find(person => person.talentId === talentId)!
  const row = projection.roster.rows.find(person => person.talentId === talentId)!
  expect(profile.employment.availability).toBe(expected)
  expect(row.availability).toBe(expected)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioPersonProfileSnapshot, profile)).toEqual(profile)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioRosterRowSnapshot, row)).toEqual(row)
  expect(makeSave(state)).toEqual(original)
  return profile
}

describe('P13A shared profile and roster current-work availability', () => {
  it('shows the actual Scientist working after a funded advance, then available when research is paused without changing employment', () => {
    let state = p13aResearchReady()
    const project = state.technology.projects[0]!
    const scientistId = project.scientistId
    const before = assertAvailability(state, scientistId, 'Available')
    state = applyActions(state, [{kind: 'beginResearch', projectId: project.id, budgetPerWeek: 10_000}])
    const working = assertAvailability(state, scientistId, 'Working')
    expect({...working.employment, availability: before.employment.availability}).toEqual(before.employment)
    state = tick(state)
    const advanced = assertAvailability(state, scientistId, 'Working')
    expect(busyTalentIds(state).has(scientistId)).toBe(true)
    expect(advanced.work).toMatchObject({kind: 'assigned', assignmentKind: 'research', assignmentId: project.id})
    expect(advanced.presence).toMatchObject({onLot: true, engagement: 'research', facilityId: project.laboratoryFacilityId, canLocate: true})
    expect(advanced.profession).toBe('scientist')
    expect(advanced.primaryDiscipline).toBe('research')
    const contracts = state.contracts
    state = applyActions(state, [{kind: 'pauseResearch', projectId: project.id}])
    const paused = assertAvailability(state, scientistId, 'Available')
    expect({...paused.employment, availability: advanced.employment.availability}).toEqual(advanced.employment)
    expect(state.contracts).toEqual(contracts)
    expect(busyTalentIds(state).has(scientistId)).toBe(false)
    expect(state.technology.projects[0]).toMatchObject({status: 'paused', verifiedWork: 1.5, expenditure: 10_000})
    state = applyActions(state, [{kind: 'resumeResearch', projectId: project.id}])
    assertAvailability(state, scientistId, 'Working')
  }, 30_000)

  it('preserves a credited writer as available while the actual director, cast and craft company are working', () => {
    const base = operationsStudio('p13-profile-historical-writer-credit')
    const payload = productionPayload(base)
    const state = applyActions(base, [{kind: 'greenlight', production: payload}])
    const busy = busyTalentIds(state)
    expect(busy.has(payload.writerId)).toBe(false)
    const writer = assertAvailability(state, payload.writerId, 'Available')
    expect(writer.work).toMatchObject({kind: 'assigned', assignmentKind: 'production'})
    expect(writer.employment.status).toBe('contracted')
    for (const id of [payload.directorId, ...Object.values(payload.cast), ...payload.craftIds]) {
      expect(busy.has(id)).toBe(true)
      const profile = assertAvailability(state, id, 'Working')
      expect(profile.employment.status).toBe('contracted')
    }
  })
})
