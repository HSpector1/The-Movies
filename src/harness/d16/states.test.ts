// Colocated spec for the D-16 financial-state classifier. Run with:
//   npx vitest run --config src/harness/d16/vitest.d16.config.ts

import { describe, it, expect } from 'vitest'
import {
  TUNING,
  applyActions,
  canAfford,
  cheapestPackageQuote,
  marketingLevelsFor,
  standardPackageQuote,
  studioRunRecap,
} from '../../core/index.js'
import type { GameState } from '../../core/index.js'
import { foundStudioFor } from './driver.js'
import { standardCadence } from './policies.js'
import {
  STATE_PACKAGE_OPTIONS,
  bareMinimumPackage,
  receptionInputsFor,
  standardPackage,
  withProductionMarketingMenu,
} from './packages.js'
import {
  HEALTHY_RUNWAY_WEEKS,
  RUNAWAY_MULTIPLE,
  STATE_SEVERITY,
  assessFinancialState,
  classifyFinancialState,
  runawayCash,
  summarizeEpisodes,
} from './states.js'
import { withTuningOverrides } from './experiment.js'
import type { FinancialState, StateSeriesPoint } from './states.js'

const FOUNDED: GameState = foundStudioFor('d16-states-fixture', standardCadence).state

function withCash(cash: number): GameState {
  return { ...FOUNDED, studio: { ...FOUNDED.studio, cash } }
}

describe('d16/states — the ladder is mutually exclusive and correctly ordered', () => {
  const bare = bareMinimumPackage(FOUNDED, STATE_PACKAGE_OPTIONS)
  const std = standardPackage(FOUNDED, STATE_PACKAGE_OPTIONS)

  it('the fixture can price both reference packages, and bare < standard', () => {
    expect(bare).not.toBeNull()
    expect(std).not.toBeNull()
    expect(bare!.committedCost).toBeLessThan(std!.committedCost)
  })

  it('insolvent — cash < 0 wins over everything else', () => {
    expect(classifyFinancialState(withCash(-1))).toBe('insolvent')
    expect(classifyFinancialState(withCash(-100_000_000))).toBe('insolvent')
  })

  it('noProduction — cash >= 0 but the bare minimum is unaffordable', () => {
    expect(classifyFinancialState(withCash(0))).toBe('noProduction')
    expect(classifyFinancialState(withCash(bare!.committedCost - 1))).toBe('noProduction')
  })

  it('bareMinOnly — the bare minimum is affordable, the standard package is not', () => {
    expect(classifyFinancialState(withCash(bare!.committedCost))).toBe('bareMinOnly')
    expect(classifyFinancialState(withCash(std!.committedCost - 1))).toBe('bareMinOnly')
  })

  it('constrained — standard affordable, but post-commitment runway < 26 weeks', () => {
    const a = assessFinancialState(withCash(std!.committedCost))
    expect(a.standardAffordable).toBe(true)
    expect(a.postStandardRunwayWeeks).not.toBeNull()
    expect(a.postStandardRunwayWeeks!).toBeLessThan(HEALTHY_RUNWAY_WEEKS)
    expect(a.state).toBe('constrained')
  })

  it('healthy — standard affordable AND >= 26 weeks of post-commitment runway', () => {
    const burn = 26 * 100_000 // comfortably above any founding-roster weekly burn
    expect(classifyFinancialState(withCash(std!.committedCost + burn + TUNING.INITIAL_CASH))).toBe('healthy')
  })

  it('walking cash upward visits the ladder monotonically and never skips backwards', () => {
    const seen: FinancialState[] = []
    const steps = [-1, 0, bare!.committedCost, std!.committedCost, TUNING.INITIAL_CASH * 5]
    for (const c of steps) {
      const s = classifyFinancialState(withCash(c))
      if (seen.length === 0 || seen[seen.length - 1] !== s) seen.push(s)
    }
    expect(seen).toEqual(['insolvent', 'noProduction', 'bareMinOnly', 'constrained', 'healthy'])
    for (let i = 1; i < seen.length; i++) {
      expect(STATE_SEVERITY[seen[i]!]).toBeGreaterThan(STATE_SEVERITY[seen[i - 1]!])
    }
  })

  it('the affordability inputs are the AUTHORITATIVE gate, not a lookalike (Lesson AC)', () => {
    const s = withCash(std!.committedCost)
    const a = assessFinancialState(s)
    expect(a.bareMinimumAffordable).toBe(canAfford(s, bare!.committedCost).ok)
    expect(a.standardAffordable).toBe(canAfford(s, std!.committedCost).ok)
  })

  it('exclusivity (a busy roster) is NOT reported as financial distress', () => {
    // Occupy every contracted talent by hand-marking a production, then re-classify:
    // the ladder must be unchanged because the classifier prices with ignoreBusy.
    const before = classifyFinancialState(withCash(TUNING.INITIAL_CASH))
    const busyState: GameState = {
      ...withCash(TUNING.INITIAL_CASH),
      studio: {
        ...FOUNDED.studio,
        cash: TUNING.INITIAL_CASH,
        activeProductions: [
          {
            id: 'prod-fake',
            conceptId: FOUNDED.concepts[0]!.id,
            shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
            promise: {
              genre: FOUNDED.concepts[0]!.genre,
              intendedSegments: ['adult'],
              ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
            },
            writerId: FOUNDED.contracts.find((c) => FOUNDED.talent.find((t) => t.id === c.talentId)?.role === 'writer')!.talentId,
            directorId: FOUNDED.contracts.find((c) => FOUNDED.talent.find((t) => t.id === c.talentId)?.role === 'director')!.talentId,
            craftIds: [FOUNDED.contracts.find((c) => FOUNDED.talent.find((t) => t.id === c.talentId)?.role === 'craft')!.talentId],
            cast: (() => {
              const actors = FOUNDED.contracts
                .filter((c) => FOUNDED.talent.find((t) => t.id === c.talentId)?.role === 'actor')
                .map((c) => c.talentId)
              return { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! }
            })(),
            budget: { negative: 1, marketing: 1 },
            startTick: 0,
            remainingTicks: 8,
            forecastSnapshot: { segments: [], expectedOpening: 0, expectedTotal: 0, expectedCriticScore: 0 },
          },
        ],
      },
    }
    expect(classifyFinancialState(busyState)).toBe(before)
  })
})

describe('d16/states — production D-17B menu alignment', () => {
  it('the harness bare minimum and the recap quote each use their own exact package menu', () => {
    const recap = studioRunRecap(FOUNDED)
    const bare = withProductionMarketingMenu(() => bareMinimumPackage(FOUNDED, STATE_PACKAGE_OPTIONS))
    const quote = cheapestPackageQuote(FOUNDED)!
    expect(recap.position.cheapest).not.toBeNull()
    expect(bare).not.toBeNull()
    expect(bare!.marketing).toBe(marketingLevelsFor(FOUNDED, receptionInputsFor(FOUNDED, bare!))[0])
    expect(recap.position.cheapest!.commitment).toBe(Math.round(
      quote.breakdown.negative + quote.breakdown.marketing + quote.breakdown.freelancerFees,
    ))
    const exactCommitment =
      quote.breakdown.negative + quote.breakdown.marketing + quote.breakdown.freelancerFees
    const exact = { ...FOUNDED, studio: { ...FOUNDED.studio, cash: exactCommitment } }
    expect(() => applyActions(exact, [{ kind: 'greenlight', production: quote.production }])).not.toThrow()
  })

  it('the buildable standard package resolves its own middle rung, not the recap floor or a static grid', () => {
    const recap = studioRunRecap(FOUNDED)
    const std = withProductionMarketingMenu(() => standardPackage(FOUNDED, STATE_PACKAGE_OPTIONS))
    const quote = standardPackageQuote(FOUNDED)!
    expect(std).not.toBeNull()
    expect(recap.position.standard).not.toBeNull()
    expect(std!.marketing).toBe(marketingLevelsFor(FOUNDED, receptionInputsFor(FOUNDED, std!))[1])
    expect(recap.position.standardBreakdown).toEqual(quote.breakdown)
  })
})

describe('d16/states — episode derivation', () => {
  const pt = (week: number, state: FinancialState, cash: number): StateSeriesPoint => ({ week, state, cash })

  it('detects distress entry, full recovery and partial recovery from the first distress week', () => {
    const s = summarizeEpisodes([
      pt(0, 'healthy', 20e6),
      pt(1, 'constrained', 10e6),
      pt(2, 'bareMinOnly', 2e6), // distress entry
      pt(3, 'noProduction', 1e6),
      pt(4, 'constrained', 5e6), // partial recovery
      pt(5, 'healthy', 30e6), // full recovery
    ])
    expect(s.distressEntryWeek).toBe(2)
    expect(s.partialRecoveryWeek).toBe(4)
    expect(s.recoveryWeek).toBe(5)
    expect(s.weeksToPartialRecovery).toBe(2)
    expect(s.weeksToRecovery).toBe(3)
    expect(s.recovered).toBe(true)
    expect(s.partiallyRecovered).toBe(true)
  })

  it('never reports recovery without a prior distress entry', () => {
    const s = summarizeEpisodes([pt(0, 'healthy', 20e6), pt(1, 'healthy', 25e6)])
    expect(s.distressEntryWeek).toBeNull()
    expect(s.recoveryWeek).toBeNull()
    expect(s.recovered).toBe(false)
    expect(s.terminalDecline).toBe(false)
  })

  it('terminalDecline requires BOTH a terminal state and a non-positive final-quarter slope', () => {
    const declining = summarizeEpisodes([
      pt(0, 'healthy', 20e6),
      pt(1, 'bareMinOnly', 8e6),
      pt(2, 'noProduction', 3e6),
      pt(3, 'noProduction', 1e6),
    ])
    expect(declining.terminalDecline).toBe(true)

    // Ends in noProduction but cash is RISING over the final quarter ⇒ not terminal.
    const rising = summarizeEpisodes([
      pt(0, 'healthy', 20e6),
      pt(1, 'noProduction', 1e6),
      pt(2, 'noProduction', 2e6),
      pt(3, 'noProduction', 9e6),
    ])
    expect(rising.terminalDecline).toBe(false)
  })

  it('runawaySuccess fires at 3x INITIAL_CASH and counts weeks per state', () => {
    const bar = runawayCash()
    expect(bar).toBe(RUNAWAY_MULTIPLE * TUNING.INITIAL_CASH)
    const s = summarizeEpisodes([
      pt(0, 'healthy', TUNING.INITIAL_CASH),
      pt(1, 'healthy', bar),
      pt(2, 'constrained', bar - 1),
    ])
    expect(s.runawaySuccess).toBe(true)
    expect(s.runawayThreshold).toBe(bar)
    expect(s.weeksHealthy).toBe(2)
    expect(s.weeksConstrained).toBe(1)
    expect(s.maxCash).toBe(bar)
    expect(s.endState).toBe('constrained')
  })

  // B2-M6 REGRESSION. `RUNAWAY_CASH` used to be a module-load constant, so it kept reading
  // $60M inside a sanctioned `INITIAL_CASH` counterfactual and silently corrupted
  // `runawaySuccess` / `runawayRate` on exactly the sweep it was built for.
  it('the runaway threshold follows a live INITIAL_CASH override, and the run may set its own', () => {
    expect(runawayCash()).toBe(60_000_000)
    withTuningOverrides(
      { INITIAL_CASH: 5_000_000 },
      () => {
        expect(TUNING.INITIAL_CASH).toBe(5_000_000)
        expect(runawayCash()).toBe(15_000_000)
        const s = summarizeEpisodes([pt(0, 'healthy', 5e6), pt(1, 'healthy', 16e6)])
        expect(s.runawayThreshold).toBe(15_000_000)
        expect(s.runawaySuccess).toBe(true)
      },
      { regeneratesWorlds: true },
    )
    expect(runawayCash()).toBe(60_000_000)

    // …and a run that OPENED somewhere else (a resumed save) is measured against its own bar.
    const resumed = summarizeEpisodes([pt(86, 'bareMinOnly', 2_833_923), pt(90, 'healthy', 9_000_000)], {
      runawayCash: runawayCash(2_833_923),
    })
    expect(resumed.runawayThreshold).toBeCloseTo(8_501_769, 6)
    expect(resumed.runawaySuccess).toBe(true)
  })

  it('handles an empty series without throwing', () => {
    const s = summarizeEpisodes([])
    expect(s.endState).toBeNull()
    expect(s.recovered).toBe(false)
    expect(s.runawaySuccess).toBe(false)
    expect(Number.isNaN(s.minCash)).toBe(true)
  })
})
