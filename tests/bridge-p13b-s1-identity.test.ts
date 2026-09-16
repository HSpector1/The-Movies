import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds } from '../src/core/employment.js'
import { commitPlacement } from '../src/core/placement.js'
import { researchCandidates } from '../src/core/technology.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { laboratoryActionSpecs, laboratoryPage } from '../bridge/laboratory.ts'

// P13B-S1 plan test 6 (same-name identity), proved through the engine AND the
// Laboratory bridge page. It imports bridge/*.ts, so it follows the repository's
// bridge-class naming (tests/bridge*.test.ts): excluded from the root typecheck
// program and included in tsconfig.bridge.json, exactly like every other bridge test.

function identityEntry(seed: string): { state: GameState; laboratoryFacilityId: string } {
  let state = advanceTo(commitPlacement(p13aGeneratedStudio(seed), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } }), 12)
  const lab = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
  state = applyActions(state, [{ kind: 'installAcousticInstruments', laboratoryFacilityId: lab }])
  state = advanceTo(state, 260)
  return { state, laboratoryFacilityId: lab }
}

describe('P13B-S1 same-name identity (test 6)', () => {
  // Found by a disposable one-off scan (`npx vite-node`, then discarded) of
  // researchCandidates() names across seeds "p13b-identity-0000".."p13b-identity-2999":
  // seed "p13b-identity-0049" gives t-sci-01 and t-sci-06 the identical name "Ava Cabral".
  const SEED = 'p13b-identity-0049'
  const ID_A = 't-sci-01'
  const ID_B = 't-sci-06'
  let identity: GameState
  let identityLab: string
  beforeAll(() => {
    const built = identityEntry(SEED)
    identity = built.state
    identityLab = built.laboratoryFacilityId
  }, 120_000)

  it('seats, charges and reports two same-named Scientists distinctly by id, never collapsing them', () => {
    const candidates = researchCandidates(identity)
    expect(candidates.find(c => c.id === ID_A)!.name).toBe('Ava Cabral')
    expect(candidates.find(c => c.id === ID_B)!.name).toBe('Ava Cabral')

    let state = applyActions(identity, [
      { kind: 'recruitScientist', laboratoryFacilityId: identityLab, scientistId: ID_A },
      { kind: 'recruitScientist', laboratoryFacilityId: identityLab, scientistId: ID_B },
      { kind: 'assignResearchScientist', laboratoryFacilityId: identityLab, scientistId: ID_A },
      { kind: 'assignResearchScientist', laboratoryFacilityId: identityLab, scientistId: ID_B },
    ])
    const projectId = state.technology.projects[0]!.id
    state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek: 20_000 }])
    expect(state.technology.projects[0]!.seats.map(s => s.talentId)).toEqual([ID_A, ID_B])

    state = tick(state)
    const receipt = state.technology.projects[0]!.weeks.at(-1)!
    expect(receipt.seatTalentIds).toEqual([ID_A, ID_B])
    expect(busyTalentIds(state).has(ID_A)).toBe(true)
    expect(busyTalentIds(state).has(ID_B)).toBe(true)

    const specs = laboratoryActionSpecs(state)
    const releaseA = specs.find(s => s.action.kind === 'releaseResearchSeat' && s.action.scientistId === ID_A)
    const releaseB = specs.find(s => s.action.kind === 'releaseResearchSeat' && s.action.scientistId === ID_B)
    expect(releaseA?.action).toEqual({ kind: 'releaseResearchSeat', projectId, scientistId: ID_A })
    expect(releaseB?.action).toEqual({ kind: 'releaseResearchSeat', projectId, scientistId: ID_B })
    expect(releaseA!.id).not.toBe(releaseB!.id)

    const placedLab = state.placement.facilities.find(p => p.blueprintId === 'research-laboratory' && p.installation === undefined)!
    const page = laboratoryPage(state, `placed-${placedLab.id}`, [], 0, 50)
    expect(page.laboratory.seatLabel).toContain('2 of 4')
    expect(page.laboratory.scientistLabel.split('\n')).toHaveLength(2)
  })
})
