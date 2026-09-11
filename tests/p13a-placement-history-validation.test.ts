import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { assertStudioPlacementInvariants, commitPlacement, demolishFacility, expectedWeeklyOperatingCostAt } from '../src/core/placement.js'
import { tick } from '../src/core/tick.js'
import { DEVELOPMENT_CASTING_ANNEX_BLUEPRINT } from '../src/core/tuning.js'
import { generateWorld } from '../src/core/worldgen.js'

describe('P13A bounded historical facility-charge validation', () => {
  it('preserves every exact weekly charge across a real build, demolition, idle gap and replacement', () => {
    const generated = generateWorld('p13a-history-reuse-equivalence')
    let state = initializeHollywood(applyActions({ ...generated, economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }]), 'fresh')
    state = commitPlacement(state, { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    while (state.market.tick < 20) state = tick(state)
    const lab = state.placement.facilities[0]!
    state = demolishFacility(state, { placementId: lab.id })
    expect(state.placement.facilities).toHaveLength(0)
    state = commitPlacement(state, { blueprintId: DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id, origin: { gx: 0, gy: 9 } })
    const replacement = state.placement.facilities[0]!
    expect(replacement.completesWeek).toBe(20 + DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks)
    while (state.market.tick < 40) state = tick(state)
    const expected = (week: number) => week >= 12 && week < 20 ? 3_000 :
      week >= replacement.completesWeek ? DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.weeklyOperatingCost : 0
    for (let week = 0; week < 40; week++) {
      expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, week)).toBe(expected(week))
      const charged = state.ledger.filter(row => row.kind === 'facilityOpex' && row.week === week)
      expect(charged.map(row => row.amount)).toEqual(expected(week) === 0 ? [] : [-expected(week)])
    }
    expect(() => assertStudioPlacementInvariants(state)).not.toThrow()
    // Every historical row is still independently checked by the reused-history
    // validation pass, including rows for the demolished Laboratory.
    for (const charge of state.ledger.filter(row => row.kind === 'facilityOpex')) {
      const forged = { ...state, studio: { ...state.studio, cash: state.studio.cash - 1 },
        ledger: state.ledger.map(row => row === charge ? { ...row, amount: row.amount - 1 } : row) }
      expect(() => assertStudioPlacementInvariants(forged)).toThrow(/facility operating cost.*disagrees/)
    }
  })
})
