// D-17B Phase H — production execution and lab-agreement proofs.
// Production code owns every mechanic. The harness may measure it and compare its old
// pure shims, but production imports nothing from this directory.

import { describe, expect, it } from 'vitest'
import { TUNING, marketingLevelsFor, tick } from '../../core/index.js'
import { applyCounterFlow, newCounterFlowMemo } from './counterflow.js'
import { foundStudioFor, runOne } from './driver.js'
import {
  assertMarketingGridPristine,
  generatePackages,
  receptionInputsFor,
  withProductionMarketingMenu,
} from './packages.js'
import { publicitySpamAdversary, standardCadence } from './policies.js'

describe('D-17B Phase H — production candidate agreement', () => {
  it('production tick drift agrees with the selected lab Family-C step on an isolated week', () => {
    const founded = foundStudioFor('d17b-prod-drift', standardCadence).state
    const state = {
      ...founded,
      studio: {
        ...founded.studio,
        activeProductions: [],
        standing: { ...founded.studio.standing, audienceAwareness: 80 },
      },
    }
    const cfg = {
      family: 'C' as const,
      authorization: 'candidate' as const,
      kappa: TUNING.AWARENESS_DRIFT_RATE,
      baseline: TUNING.AWARENESS_DRIFT_ANCHOR,
      revertMode: 'pullDownOnly' as const,
    }
    const lab = applyCounterFlow(state, newCounterFlowMemo(state.market.tick, cfg), cfg, {
      seed: state.seed,
      week: state.market.tick + 1,
      aPre: 80,
      aPost: 80,
      releases: [],
      weeksSinceRelease: 1,
    })
    const production = tick(state, { develop: true })
    expect(production.studio.standing.audienceAwareness).toBe(
      lab.state.studio.standing.audienceAwareness,
    )
  })

  it('production package enumeration resolves every offered dollar amount through the exact core menu', () => {
    const state = foundStudioFor('d17b-prod-menu', standardCadence).state
    const packages = withProductionMarketingMenu(() =>
      generatePackages(state, { maxPackages: 120 }).packages,
    )
    expect(packages.length).toBeGreaterThan(0)
    for (const pkg of packages) {
      expect(marketingLevelsFor(state, receptionInputsFor(state, pkg))).toContain(pkg.marketing)
    }
    assertMarketingGridPristine('after production agreement enumeration')
  })

  it('a production corpus row uses real publicity ledger rows and no counter-flow shim', () => {
    const record = runOne({
      seed: 'd16-0001',
      policy: publicitySpamAdversary,
      horizonWeeks: 104,
      productionD17b: true,
    })
    expect(record.productionD17b).toBe(true)
    expect(record.counterFlow).toBeUndefined()
    expect(record.publicity!.count).toBeGreaterThan(0)
    expect(record.ledgerTotals.publicity).toBe(-record.publicity!.spend)
    expect(record.reconciliationOk).toBe(true)
    assertMarketingGridPristine('after production run')
  })

  it('fails loudly rather than double-applying a production mechanic and a lab shim', () => {
    expect(() =>
      runOne({
        seed: 'd16-0001',
        policy: standardCadence,
        horizonWeeks: 1,
        productionD17b: true,
        counterFlow: { family: 'C', authorization: 'candidate', kappa: 0.04, baseline: 35 },
      }),
    ).toThrow(/cannot be combined/)
  })
})
