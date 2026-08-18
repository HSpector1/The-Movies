import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  makeSave,
  validateSaveV13,
  tick,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState, SegmentId, Talent } from '../src/core/index.js'

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function foundedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
  const hires = [
    ...byRole(pool, 'actor').slice(0, Math.max(6, FOUNDING_MINIMUMS.actor)),
    ...byRole(pool, 'director').slice(0, Math.max(2, FOUNDING_MINIMUMS.director)),
    ...byRole(pool, 'writer').slice(0, Math.max(3, FOUNDING_MINIMUMS.writer)),
    ...byRole(pool, 'craft').slice(0, Math.max(2, FOUNDING_MINIMUMS.craft)),
  ]
  for (const hire of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function productionPayload(state: GameState, offset = 0) {
  const concept = state.concepts[offset]!
  const pool = state.contracts.map((c) => state.talent.find((t) => t.id === c.talentId)!)
  const actors = byRole(pool, 'actor')
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    writerId: byRole(pool, 'writer')[offset]!.id,
    directorId: byRole(pool, 'director')[offset]!.id,
    cast: {
      lead: actors[offset * 3]!.id,
      antagonist: actors[offset * 3 + 1]!.id,
      support: actors[offset * 3 + 2]!.id,
    } satisfies Record<CastSlot, string>,
    craftIds: [byRole(pool, 'craft')[offset]!.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

describe('probe', () => {
  it('greenlights on a founded managed studio and saves', () => {
    let state = applyActions(foundedStudio('probe-seed'), [{ kind: 'activateStudioOperations' }])
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
    expect(state.operations.workflows).toHaveLength(1)
    const save = makeSave(state)
    expect(validateSaveV13(save)).toBe(save)
    state = tick(state)
    state = tick(state)
    expect(state.operations.workflows[0]!.phase).toBe('preProduction')
    const save2 = makeSave(state)
    expect(validateSaveV13(save2)).toBe(save2)
  })
})
