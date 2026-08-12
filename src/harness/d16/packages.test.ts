// Colocated spec for the D-16 package generator. Run with:
//   npx vitest run --config src/harness/d16/vitest.d16.config.ts
//
// THE LOAD-BEARING TEST IS `committedCost` PARITY (Lesson AC): the generator's cost must
// equal the exact cash the real greenlight action deducts, and its affordability must
// equal the engine's own gate. Everything else here guards determinism and bounds.

import { describe, it, expect } from 'vitest'
import {
  RngStream,
  TUNING,
  applyActions,
  canAfford,
  commitmentPreview,
  economyEngaged,
  employmentEngaged,
  forecastCenters,
  resolveReception,
  resolveShape,
  tick,
} from '../../core/index.js'
import type { FilmShape, GameState } from '../../core/index.js'
import { foundStudioFor, runOne } from './driver.js'
import { exploitDisengage, standardCadence } from './policies.js'
import {
  DEFAULT_PACKAGE_OPTIONS,
  activeMarketingGrid,
  awarenessConditionedCapacity,
  bareMinimumPackage,
  evaluatePackage,
  generatePackages,
  minBudgetDemandMultiplier,
  oracleExpectedContribution,
  packageAffordable,
  perceivedExpectedContribution,
  receptionInputsFor,
  shapeFor,
  shippedMarketingGrid,
  standardPackage,
  studioShareFor,
  toGreenlightAction,
  withMarketingGrid,
} from './packages.js'
import type { D16Package, MarketingGrid } from './packages.js'

const FOUNDED: GameState = foundStudioFor('d16-pkg-fixture', standardCadence).state

/**
 * B2-H4. On a freshly founded fixture the roster is fully contracted, so EVERY package in
 * the default 162 has `freelancerFees === 0` — the parity spec below therefore only ever
 * exercised `negative + marketing` and left the ONLY non-trivial cost term untested, while
 * real runs commit it constantly (28/147 P3 greenlights, 59/167 P4, $7.95M of `freelancerFee`
 * ledger in one 208-week P3 run).
 *
 * This fixture reproduces the real situation: keep a film in flight so the roster is busy,
 * and let the visible freelancer market rotate, until the generator actually returns
 * fee-bearing options. Deterministic (fixed seed, fixed policy, fixed loop).
 */
function feeBearingFixture(): { state: GameState; withFees: D16Package[]; week: number } {
  let s = foundStudioFor('d16-0001', standardCadence).state
  for (let w = 0; w < 60; w++) {
    const withFees = generatePackages(s).packages.filter(
      (p) => p.freelancerFees > 0 && packageAffordable(s, p),
    )
    if (withFees.length > 0) return { state: s, withFees, week: s.market.tick }
    const std = standardPackage(s)
    if (
      std !== null &&
      s.studio.activeProductions.length < TUNING.MAX_CONCURRENT_PRODUCTIONS &&
      packageAffordable(s, std)
    ) {
      s = applyActions(s, [toGreenlightAction(std)])
    }
    s = tick(s, { develop: true })
  }
  throw new Error('d16/packages.test: no affordable fee-bearing package within 60 weeks')
}

describe('d16/packages — authoritative cost parity (Lesson AC)', () => {
  it('committedCost equals the EXACT cash the real greenlight action deducts', () => {
    const gen = generatePackages(FOUNDED)
    expect(gen.packages.length).toBeGreaterThan(0)
    let checked = 0
    for (const pkg of gen.packages.slice(0, 12)) {
      if (!packageAffordable(FOUNDED, pkg)) continue
      const after = applyActions(FOUNDED, [toGreenlightAction(pkg)])
      const deducted = FOUNDED.studio.cash - after.studio.cash
      expect(deducted).toBeCloseTo(pkg.committedCost, 6)
      checked += 1
    }
    expect(checked).toBeGreaterThan(0)
  })

  // B2-H4: the freelancer-fee leg — the third and only non-trivial term of committedCost.
  it('the FREELANCER-FEE leg is exact too: cash delta and the ledger rows both match', () => {
    const { state, withFees, week } = feeBearingFixture()
    expect(withFees.length).toBeGreaterThan(0)
    expect(week).toBeGreaterThan(0) // the fixture really had to advance to find them
    let checked = 0
    for (const pkg of withFees.slice(0, 12)) {
      expect(pkg.freelancerFees).toBeGreaterThan(0)
      // the fee leg is the whole of committedCost that is not negative + marketing
      expect(pkg.committedCost - pkg.budget.negative - pkg.budget.marketing).toBeCloseTo(
        pkg.freelancerFees,
        6,
      )
      const after = applyActions(state, [toGreenlightAction(pkg)])
      expect(state.studio.cash - after.studio.cash).toBeCloseTo(pkg.committedCost, 6)
      // …and the engine wrote exactly that much as `freelancerFee` ledger rows.
      let fee = 0
      for (let i = state.ledger.length; i < after.ledger.length; i++) {
        const e = after.ledger[i]!
        if (e.kind === 'freelancerFee') fee += -e.amount
      }
      expect(fee).toBeCloseTo(pkg.freelancerFees, 6)
      expect(pkg.freelancerIds.length).toBeGreaterThan(0)
      checked += 1
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('affordability equals canAfford and commitmentPreview on the same amount', () => {
    const pkg = standardPackage(FOUNDED)
    expect(pkg).not.toBeNull()
    expect(packageAffordable(FOUNDED, pkg!)).toBe(canAfford(FOUNDED, pkg!.committedCost).ok)
    expect(commitmentPreview(FOUNDED, pkg!.committedCost).affordable).toBe(packageAffordable(FOUNDED, pkg!))
  })

  it('a package that the gate rejects is also rejected by the engine', () => {
    const pkg = standardPackage(FOUNDED)!
    const broke: GameState = { ...FOUNDED, studio: { ...FOUNDED.studio, cash: pkg.committedCost - 1 } }
    expect(packageAffordable(broke, pkg)).toBe(false)
    expect(() => applyActions(broke, [toGreenlightAction(pkg)])).toThrow(/solvency gate/)
  })

  it('every generated package is legally greenlightable (one craft lead, distinct cast, staffed)', () => {
    const gen = generatePackages(FOUNDED)
    for (const pkg of gen.packages) {
      expect(pkg.craftIds).toHaveLength(1)
      const ids = [pkg.writerId, pkg.directorId, pkg.cast.lead, pkg.cast.antagonist, pkg.cast.support, ...pkg.craftIds]
      expect(new Set(ids).size).toBe(ids.length)
      expect(pkg.promise.genre).toBe(FOUNDED.concepts.find((c) => c.id === pkg.conceptId)!.genre)
    }
  })
})

describe('d16/packages — determinism and bounds', () => {
  it('is deterministic: two calls produce byte-identical package ids in the same order', () => {
    const a = generatePackages(FOUNDED).packages.map((p) => p.id)
    const b = generatePackages(FOUNDED).packages.map((p) => p.id)
    expect(a).toEqual(b)
    expect(new Set(a).size).toBe(a.length)
  })

  it('is bounded by maxPackages and reports truncation rather than hiding it', () => {
    const gen = generatePackages(FOUNDED)
    expect(gen.packages.length).toBeLessThanOrEqual(DEFAULT_PACKAGE_OPTIONS.maxPackages)
    expect(gen.packages.length).toBeLessThanOrEqual(200)
    const tiny = generatePackages(FOUNDED, { maxPackages: 5 })
    expect(tiny.packages).toHaveLength(5)
    expect(tiny.truncated).toBe(true)
  })

  it('the default profile spans the full budget grid on both axes', () => {
    const gen = generatePackages(FOUNDED)
    expect(new Set(gen.packages.map((p) => p.negIndex))).toEqual(new Set([0, 1, 2]))
    expect(new Set(gen.packages.map((p) => p.marketing))).toEqual(new Set([100_000, 400_000, 1_000_000]))
  })
})

describe('d16/packages — representative shapes', () => {
  const ALL: FilmShape[] = []
  for (const opening of ['immediateAction', 'slowSetup', 'mysteryHook'] as const) {
    for (const midpoint of ['reversal', 'escalation', 'revelation'] as const) {
      for (const ending of ['triumph', 'bittersweet', 'tragic', 'ambiguous'] as const) {
        ALL.push({ opening, midpoint, ending })
      }
    }
  }

  it('there are exactly 36 legal shapes and minDemand really is the minimum', () => {
    expect(ALL).toHaveLength(36)
    const demands = ALL.map((s) => resolveShape(s).budgetDemandMultiplier)
    expect(minBudgetDemandMultiplier()).toBeCloseTo(Math.min(...demands), 12)
    expect(shapeFor('highDemand').effects.budgetDemandMultiplier).toBeCloseTo(Math.max(...demands), 12)
  })

  it('neutralDemand is the LEGAL shape closest to 1.0 (the recap models an unbuildable 1.0)', () => {
    const demands = ALL.map((s) => resolveShape(s).budgetDemandMultiplier)
    const best = Math.min(...demands.map((d) => Math.abs(d - 1)))
    expect(Math.abs(shapeFor('neutralDemand').effects.budgetDemandMultiplier - 1)).toBeCloseTo(best, 12)
    // and no legal shape is exactly 1.0
    expect(demands.some((d) => d === 1)).toBe(false)
  })
})

describe('d16/packages — the bare-minimum and standard references', () => {
  it('bare minimum is 0.75x on the min-demand shape at $100k, and cheaper than standard', () => {
    const bare = bareMinimumPackage(FOUNDED)!
    const std = standardPackage(FOUNDED)!
    expect(bare.negMult).toBe(0.75)
    expect(bare.marketing).toBe(100_000)
    expect(bare.shapeKey).toBe('minDemand')
    expect(std.negMult).toBe(1)
    expect(std.marketing).toBe(400_000)
    expect(bare.committedCost).toBeLessThan(std.committedCost)
  })

  it('caller options OVERRIDE the reference defaults (this is how the marketing probes work)', () => {
    const min = standardPackage(FOUNDED, { marketingLevels: [100_000] })!
    const max = standardPackage(FOUNDED, { marketingLevels: [1_000_000] })!
    expect(min.marketing).toBe(100_000)
    expect(max.marketing).toBe(1_000_000)
    expect(max.committedCost - min.committedCost).toBeCloseTo(900_000, 6)
  })
})

describe('d16/packages — player-visible evaluation', () => {
  it('the evaluation is built from the player surface and is internally consistent', () => {
    const pkg = standardPackage(FOUNDED)!
    const e = evaluatePackage(FOUNDED, pkg)
    expect(e.engaged).toBe(true)
    expect(e.committedCost).toBe(pkg.committedCost)
    expect(e.profit.committedCost).toBeCloseTo(pkg.committedCost, 6)
    expect(e.centerProfit).toBeCloseTo(e.profit.studioRevenue.expected - pkg.committedCost, 6)
    expect(e.profit.studioRevenueIsFullBoxOffice).toBe(false)
    expect(e.breakEvenGross).toBeCloseTo(pkg.committedCost / 0.52, 4)
    expect(e.preview.amount).toBe(pkg.committedCost)
    expect(e.profit.studioRevenue.low).toBeLessThanOrEqual(e.profit.studioRevenue.expected)
    expect(e.profit.studioRevenue.expected).toBeLessThanOrEqual(e.profit.studioRevenue.high)
  })

  // B2-C9: `forecastProfitRange` ALWAYS applies the 0.52 share; only the forecast CORE
  // follows the `engaged` flag. On the disengaged path the engine credits 100 % of gross,
  // so a package priced at 0.52 there is understated ~1.92× before the core difference.
  it('prices a DISENGAGED state at 100 % of gross, not the 0.52 rental share', () => {
    expect(studioShareFor(true)).toBe(TUNING.STUDIO_RENTAL_BLENDED)
    expect(studioShareFor(false)).toBe(1)
    const naked: GameState = { ...FOUNDED, founding: null, contracts: [] }
    expect(employmentEngaged(naked)).toBe(false)
    const pkg = generatePackages(naked, { maxPackages: 1 }).packages[0]!
    const e = evaluatePackage(naked, pkg)
    expect(e.engaged).toBe(false)
    // the centre is the FULL gross centre, i.e. the 0.52-scaled band un-scaled
    expect(e.centerProfit).toBeCloseTo(
      e.profit.studioRevenue.expected / TUNING.STUDIO_RENTAL_BLENDED - pkg.committedCost,
      6,
    )
    // break-even gross with a 100 % share is simply the cost
    expect(e.breakEvenGross).toBeCloseTo(pkg.committedCost, 6)
  })

  // D-17A / Owner ruling R2 — THE CLIFF THIS TEST DOCUMENTED IS CLOSED; re-specified
  // 2026-08-12. This test used to compare the exploit's forecast centre against money it
  // realized on the legacy 100 %-of-gross path. That path is no longer reachable: with
  // `economyEngaged` a PERSISTED, monotonic fact, shedding every contract leaves the studio
  // ENGAGED, so the engaged greenlight path (and with it D-11.12) still applies and refuses
  // the exploit's open-pool casting. It releases nothing, so there is no forecast-vs-realized
  // universe left to compare — what must be proven now is that the regime did not revert.
  it('an exploit run can no longer reach the 100 %-of-gross path at all (D-17A/R2)', () => {
    const rec = runOne({ seed: 'd16-0001', policy: exploitDisengage, horizonWeeks: 104 })
    expect(rec.filmsGreenlit).toBe(0)
    expect(rec.filmsReleased).toBe(0)
    expect(rec.films).toHaveLength(0)
    expect(rec.rejectedActions).toBeGreaterThan(0)
    expect(rec.rejections[0]!.kind).toBe('greenlight')
    expect(rec.rejections[0]!.reason).toContain('neither studio-contracted nor an available freelancer')
    // the persisted regime survives losing every contract…
    const shed: GameState = { ...FOUNDED, founding: null, contracts: [] }
    expect(employmentEngaged(shed)).toBe(false)
    expect(economyEngaged(shed)).toBe(true)
    // …so the engine kept charging overhead and never credited a legacy full-gross lump.
    expect(rec.ledgerTotals['overhead']).toBeLessThan(0)
    expect(rec.ledgerTotals['boxOffice']).toBeUndefined()
    expect(rec.ledgerTotals['studioRevenue']).toBeUndefined()
  })
})

// ── B2-C1: the oracle must actually be omniscient ────────────────────────────
describe('d16/packages — the ORACLE reads hidden information', () => {
  it('oracleExpectedContribution IS the actual-skill core, not the perceived forecast core', () => {
    const gen = generatePackages(FOUNDED, { maxPackages: 24 })
    expect(gen.packages.length).toBeGreaterThan(0)
    for (const pkg of gen.packages.slice(0, 8)) {
      const inp = receptionInputsFor(FOUNDED, pkg)
      const truth = resolveReception(inp, RngStream.deserialize(FOUNDED.rngState), true, true, 0)
      expect(oracleExpectedContribution(FOUNDED, pkg)).toBeCloseTo(
        truth.total * TUNING.STUDIO_RENTAL_BLENDED - pkg.committedCost,
        6,
      )
    }
  })

  it('the perceived core DIFFERS from the actual core — so the oracle has a real advantage', () => {
    const gen = generatePackages(FOUNDED, { maxPackages: 24 })
    let differing = 0
    for (const pkg of gen.packages.slice(0, 12)) {
      const inp = receptionInputsFor(FOUNDED, pkg)
      const truth = resolveReception(inp, RngStream.deserialize(FOUNDED.rngState), true, true, 0)
      const perceivedCenters = forecastCenters(inp, true, true)
      // the perceived core is what the PLAYER's evaluate() is built on
      expect(perceivedCenters.centers).toBeDefined()
      if (Math.abs(oracleExpectedContribution(FOUNDED, pkg) - perceivedExpectedContribution(FOUNDED, pkg)) > 1) {
        differing += 1
      }
      expect(Number.isFinite(truth.total)).toBe(true)
    }
    expect(differing).toBeGreaterThan(0)
  })

  it('is PURE: it never advances the shared sim stream and repeats exactly', () => {
    const pkg = standardPackage(FOUNDED)!
    const before = FOUNDED.rngState
    const a = oracleExpectedContribution(FOUNDED, pkg)
    const b = oracleExpectedContribution(FOUNDED, pkg)
    expect(a).toBe(b)
    expect(FOUNDED.rngState).toBe(before)
  })
})

// ── D-17B · the marketing-grid override (A4 §5) ──────────────────────────────
describe('d17b/packages — the ACTIVE marketing grid is resolved at generation time', () => {
  it('the default resolves to the shipped triple and reproduces today’s package ids exactly', () => {
    expect(activeMarketingGrid()).toEqual(shippedMarketingGrid())
    expect([...activeMarketingGrid()]).toEqual([...DEFAULT_PACKAGE_OPTIONS.marketingLevels])
    const ids = generatePackages(FOUNDED).packages.map((p) => p.id)
    const inScope = withMarketingGrid(shippedMarketingGrid(), () => generatePackages(FOUNDED).packages.map((p) => p.id))
    expect(inScope).toEqual(ids)
    // the shipped menu really is on every id (the assertion above is not vacuous)
    for (const rung of shippedMarketingGrid()) expect(ids.some((id) => id.endsWith(`|m${String(rung)}`))).toBe(true)
  })

  it('a swept grid moves the enumerated menu, the bare minimum and the standard package', () => {
    const swept: MarketingGrid = [200_000, 700_000, 2_000_000]
    const bareBefore = bareMinimumPackage(FOUNDED)!.budget.marketing
    const stdBefore = standardPackage(FOUNDED)!.budget.marketing
    withMarketingGrid(swept, () => {
      const menu = new Set(generatePackages(FOUNDED).packages.map((p) => p.budget.marketing))
      expect([...menu].sort((a, b) => a - b)).toEqual([...swept])
      expect(bareMinimumPackage(FOUNDED)!.budget.marketing).toBe(swept[0])
      expect(standardPackage(FOUNDED)!.budget.marketing).toBe(swept[1])
    })
    // …and restores
    expect(bareMinimumPackage(FOUNDED)!.budget.marketing).toBe(bareBefore)
    expect(standardPackage(FOUNDED)!.budget.marketing).toBe(stdBefore)
  })

  it('an EXPLICIT caller option still wins (that is how the controlled marketing probes pin a rung)', () => {
    withMarketingGrid([200_000, 700_000, 2_000_000], () => {
      const pinned = generatePackages(FOUNDED, { marketingLevels: [400_000] }).packages
      expect(new Set(pinned.map((p) => p.budget.marketing))).toEqual(new Set([400_000]))
      expect(standardPackage(FOUNDED, { marketingLevels: [123_456] })!.budget.marketing).toBe(123_456)
    })
  })

  it('the capacity hint is positive, grid-INDEPENDENT, and is the box-office marketingCapacity', () => {
    const pkg = standardPackage(FOUNDED, { ignoreBusy: true })!
    const base = awarenessConditionedCapacity(FOUNDED, pkg)
    expect(base).toBeGreaterThan(0)
    // capacity is a function of pre-marketing awareness only, so it cannot depend on the menu
    // (that is what makes a capacity-anchored menu non-circular)
    const swept = withMarketingGrid([200_000, 700_000, 2_000_000], () =>
      awarenessConditionedCapacity(FOUNDED, standardPackage(FOUNDED, { ignoreBusy: true })!),
    )
    expect(swept).toBe(base)
    // it sits inside the engine's own capacity band
    expect(base).toBeGreaterThanOrEqual(TUNING.MARKETING_CAPACITY_MIN)
    expect(base).toBeLessThanOrEqual(TUNING.MARKETING_CAPACITY_MAX)
  })
})
