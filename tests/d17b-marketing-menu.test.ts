// D-17B §4 — production marketing-menu contract tests.
//
// The engaged menu is a package-specific triple at {1.3, 2.4, 3.7} times the
// film's measured efficient marketing capacity. The disengaged/M0A menu stays the
// legacy fixed grid. Exact charged dollars use Math.round and strict +$1 guards.

import { describe, expect, it } from 'vitest'
import {
  MARKETING_BUDGET_LEVELS,
  TUNING,
  computeBoxOffice,
  forecastCenters,
  generateCandidates,
  generateWorld,
  marketingCapacityFor,
  marketingLevelsFor,
  marketingMenuFromCapacity,
  packageReceptionInputs,
  stableStringify,
} from '../src/core/index.js'
import type { GameState } from '../src/core/index.js'

function engaged(state: GameState): GameState {
  return { ...state, economyEngagedEver: true }
}

describe('D-17B marketing menu — exact rung arithmetic', () => {
  it('uses the authorized multipliers and lab-exact rounding', () => {
    expect(TUNING.MARKETING_MENU_MULTIPLIERS).toEqual([1.3, 2.4, 3.7])
    expect(marketingMenuFromCapacity(123_456.7)).toEqual([
      Math.round(1.3 * 123_456.7),
      Math.round(2.4 * 123_456.7),
      Math.round(3.7 * 123_456.7),
    ])
  })

  it('keeps all three charged amounts positive and strictly ascending at collision-sized capacities', () => {
    expect(marketingMenuFromCapacity(0)).toEqual([1, 2, 3])
    for (const capacity of [0, 0.1, 0.25, 1, TUNING.MARKETING_CAPACITY_MIN]) {
      const [a, b, c] = marketingMenuFromCapacity(capacity)
      expect(Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c)).toBe(true)
      expect(a).toBeGreaterThan(0)
      expect(b).toBeGreaterThan(a)
      expect(c).toBeGreaterThan(b)
    }
  })
})

describe('D-17B marketing menu — production capacity parity and regime split', () => {
  it('anchors on the same capacity returned by the production box-office pass', () => {
    const state = engaged(generateWorld('d17b-menu-capacity'))
    const pkg = generateCandidates(state, state.market.tick)[0]!
    const inp = packageReceptionInputs(state, pkg)
    const centers = forecastCenters(inp, true, true)
    const box = computeBoxOffice(
      centers.centers,
      inp.market.segments,
      inp.market.baseMarketValue,
      inp.standing,
      inp.promise,
      inp.budget,
      inp.shapeEffects,
      centers.centersOpening,
      true,
    )

    expect(marketingCapacityFor(state, inp)).toBe(box.marketingCapacity)
    expect(marketingLevelsFor(state, inp)).toEqual(marketingMenuFromCapacity(box.marketingCapacity))
  })

  it('maps every engaged candidate rung index through that candidate own active menu', () => {
    const state = engaged(generateWorld('d17b-menu-candidates'))
    for (const pkg of generateCandidates(state, state.market.tick).slice(0, 80)) {
      const menu = marketingLevelsFor(state, packageReceptionInputs(state, pkg))
      expect(pkg.budget.marketing).toBe(menu[pkg.marketingLevel])
    }
  })

  it('preserves the disengaged/M0A fixed menu and candidate bytes', () => {
    const state = generateWorld('d17b-menu-m0a')
    expect(marketingLevelsFor(state, null)).toEqual([...MARKETING_BUDGET_LEVELS])
    const a = stableStringify(generateCandidates(state, state.market.tick))
    const b = stableStringify(generateCandidates(state, state.market.tick))
    expect(b).toBe(a)
    for (const pkg of generateCandidates(state, state.market.tick).slice(0, 80)) {
      expect(pkg.budget.marketing).toBe(MARKETING_BUDGET_LEVELS[pkg.marketingLevel])
    }
  })
})
