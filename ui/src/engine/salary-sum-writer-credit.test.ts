/**
 * P04A.3 — `salarySum` must follow the ENGINE down both branches.
 *
 * `applyGreenlight` charges differently depending on whether the money economy
 * is engaged:
 *
 *   engaged  — D-11.12/D-11.10: contracted talent cost nothing, each freelancer
 *              costs a one-film fee, and the CREDITED WRITER is not in that set
 *              at all (Owner ruling §8 — a completed screenplay's credit is not
 *              new labour).
 *   legacy   — D-1: `writer.salary + director.salary + …`, writer INCLUDED.
 *
 * `salarySum` is the number the player reads before committing, and its whole
 * contract is that it equals what the engine then takes. A hostile review found
 * that nothing pinned the split: deleting the `economyEngaged` branch failed no
 * test, because the only other caller computed its expectation by calling
 * `salarySum` itself. This file pins both directions directly.
 */
import { describe, expect, it } from 'vitest'

import { assignmentProjectCost, economyEngaged } from '../../../src/core/index.js'
import type { GameState } from '../../../src/core/index.js'
import { salarySum, type DraftPackageIds } from './adapter.js'
import {
  buildScenario,
  SEED,
} from '../../../tests/_p04a2WriterCreditFixtures.js'

function packageIds(scenario: ReturnType<typeof buildScenario>): DraftPackageIds {
  return {
    writerId: scenario.writerId,
    directorId: scenario.packageA.directorId,
    cast: scenario.packageA.cast,
    craftIds: scenario.packageA.craftIds,
  }
}

describe('P04A.3 — salarySum tracks the engine on both economy branches', () => {
  it('EXCLUDES the credited writer when the economy is engaged', () => {
    const scenario = buildScenario(SEED)
    // Lapse the writer's contract so their cost is non-zero and the exclusion is
    // measurable rather than vacuous.
    const state: GameState = {
      ...scenario.readyOnly,
      contracts: scenario.readyOnly.contracts.filter((c) => c.talentId !== scenario.writerId),
    }
    expect(economyEngaged(state)).toBe(true)

    const writerCost = assignmentProjectCost(state, scenario.writerId)
    expect(writerCost).toBeGreaterThan(0)

    const ids = packageIds(scenario)
    const seatCost =
      assignmentProjectCost(state, ids.directorId) +
      assignmentProjectCost(state, ids.cast.lead) +
      assignmentProjectCost(state, ids.cast.antagonist) +
      assignmentProjectCost(state, ids.cast.support) +
      (ids.craftIds ?? []).reduce((sum, id) => sum + assignmentProjectCost(state, id), 0)

    expect(salarySum(state, ids)).toBe(seatCost)
    expect(salarySum(state, ids)).not.toBe(seatCost + writerCost)
  })

  it('INCLUDES the writer on the legacy D-1 path, because the engine still debits them', () => {
    const scenario = buildScenario(SEED)
    const legacy: GameState = { ...scenario.readyOnly, economyEngagedEver: false, contracts: [] }
    expect(economyEngaged(legacy)).toBe(false)

    const ids = packageIds(scenario)
    const writerCost = assignmentProjectCost(legacy, ids.writerId)
    expect(writerCost).toBeGreaterThan(0)

    const seatCost =
      assignmentProjectCost(legacy, ids.directorId) +
      assignmentProjectCost(legacy, ids.cast.lead) +
      assignmentProjectCost(legacy, ids.cast.antagonist) +
      assignmentProjectCost(legacy, ids.cast.support) +
      (ids.craftIds ?? []).reduce((sum, id) => sum + assignmentProjectCost(legacy, id), 0)

    // Deleting the `if (!economyEngaged(state))` branch in salarySum fails HERE.
    expect(salarySum(legacy, ids)).toBe(seatCost + writerCost)
  })
})
