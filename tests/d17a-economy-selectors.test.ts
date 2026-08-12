// ── D-17A economy read-model selectors — basic proofs (T1 / T3 / T4 / T5) ──────
// D-17A closes the "three near-copies of runway" defect (T1), adds the prospective
// cycle-inclusive break-even family (T3), promotes the recap's affordability scopes to a
// first-class selector (T4), and adds contract-obligation truth at signing (T5).
//
// These are the BASIC proofs (bounds, founding-guard behaviour, arithmetic identities,
// parity with the surfaces they were extracted from). An independent adversarial pass
// comes later. Seeded RNG only; public core surface only; nothing here mutates state.

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  TUNING,
  affordabilityScopes,
  applyActions,
  beginFounding,
  breakEvenGross,
  commitmentPreview,
  contractOffer,
  cycleInclusiveBreakEvenGross,
  expectedWeeklyRunRevenue,
  financeView,
  foundingRunwayPreview,
  generateWorld,
  guaranteedComp,
  offerObligation,
  postSigningRunway,
  projectedWeeklyOverhead,
  prospectiveCycleFixedCost,
  runway,
  studioRunRecap,
  tick,
  weeklyBurn,
  weeklyOverhead,
  weeklyPayroll,
  weeklySalary,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState } from '../src/core/index.js'

// ── fixtures (same construction the D-12 economy suite uses) ───────────────────
function openFounding(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return s
}
function foundStudio(seed: string): GameState {
  return applyActions(openFounding(seed), [{ kind: 'foundStudio' }])
}
function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts
    .map((c) => s.talent.find((t) => t.id === c.talentId)!)
    .filter((t) => t.role === role)
    .map((t) => t.id)
}
function greenlightOneFilm(s: GameState, marketing = 100_000): GameState {
  const concept = s.concepts[0]!
  const actors = rosterIds(s, 'actor')
  const cast = { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! } as Record<CastSlot, string>
  return applyActions(s, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: rosterIds(s, 'writer')[0]!,
        directorId: rosterIds(s, 'director')[0]!,
        cast,
        craftIds: [rosterIds(s, 'craft')[0]!],
        budget: { negative: concept.baseNegativeCost, marketing },
      },
    },
  ])
}

// ═══════════════════════════════════════════════════════════════════════════════
// T1 — ONE runway / ONE burn
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T1 — weeklyBurn is the actual-charge basis', () => {
  it('is ZERO while a founding draft is open, even with a fully signed roster', () => {
    const drafting = openFounding('d17a-t1-a')
    expect(drafting.founding).not.toBeNull()
    expect(drafting.contracts.length).toBeGreaterThan(0)
    // the roster exists and is priced …
    expect(weeklyPayroll(drafting)).toBeGreaterThan(0)
    // … but the tick charges neither payroll (tick.ts:465) nor overhead (tick.ts:476).
    expect(weeklyOverhead(drafting)).toBe(0)
    expect(weeklyBurn(drafting)).toBe(0)
  })

  it('a founding tick really does debit nothing — the selector matches the engine', () => {
    const drafting = openFounding('d17a-t1-b')
    const before = drafting.studio.cash
    const after = tick(drafting)
    expect(after.studio.cash).toBe(before)
    expect(after.ledger).toHaveLength(drafting.ledger.length)
    expect(weeklyBurn(drafting)).toBe(0)
  })

  it('post-founding it is exactly payroll + overhead (the pre-D-17A identity is preserved)', () => {
    const founded = foundStudio('d17a-t1-c')
    expect(founded.founding).toBeNull()
    expect(weeklyBurn(founded)).toBe(weeklyPayroll(founded) + weeklyOverhead(founded))
    expect(weeklyBurn(founded)).toBeGreaterThan(0)
  })

  it('runway during founding is infinite (nothing is being charged yet)', () => {
    const drafting = openFounding('d17a-t1-d')
    const rw = runway(drafting)
    expect(rw.infinite).toBe(true)
    expect(rw.weeks).toBeNull()
    expect(rw.netWeeklyCash).toBe(0)
  })

  it('foundingRunwayPreview is UNCHANGED — the deliberate post-founding projection', () => {
    const drafting = openFounding('d17a-t1-e')
    const preview = foundingRunwayPreview(drafting)
    const projectedBurn = weeklyPayroll(drafting) + projectedWeeklyOverhead(drafting)
    expect(projectedBurn).toBeGreaterThan(0)
    expect(preview.infinite).toBe(false)
    expect(preview.weeks).toBe(Math.floor(drafting.studio.cash / projectedBurn))
    expect(preview.netWeeklyCash).toBe(-projectedBurn)
    // it is a PROJECTION past the founding gate, so it deliberately differs from live runway
    expect(preview.weeks).not.toBe(runway(drafting).weeks)
  })

  it('financeView reads the shared burn + runway, and stays self-consistent', () => {
    const founded = foundStudio('d17a-t1-f')
    const fv = financeView(founded)
    expect(fv.weeklyBurn).toBe(weeklyBurn(founded))
    expect(fv.weeklyBurn).toBe(fv.weeklyPayroll + fv.weeklyOverhead)
    expect(fv.netWeeklyCash).toBe(fv.expectedWeeklyRunRevenue - fv.weeklyBurn)
    expect(fv.runway).toEqual(runway(founded))

    // During a founding draft the COMPONENTS still report the contracted roster, while the
    // charge basis is 0 — burn and runway both come from the one authoritative rule.
    const drafting = openFounding('d17a-t1-f')
    const dv = financeView(drafting)
    expect(dv.weeklyPayroll).toBeGreaterThan(0)
    expect(dv.weeklyBurn).toBe(0)
    expect(dv.runway).toEqual(runway(drafting))
    expect(dv.runway.infinite).toBe(true)
  })

  it('commitmentPreview uses the shared rule: same burn/rev, cash reduced, floored at 0', () => {
    const founded = foundStudio('d17a-t1-g')
    const burn = weeklyBurn(founded)
    const rev = expectedWeeklyRunRevenue(founded)
    const amount = 1_000_000
    const p = commitmentPreview(founded, amount)
    expect(p.postWeeklyBurn).toBe(burn)
    expect(p.cashAfter).toBe(founded.studio.cash - amount)
    expect(p.postRunway.weeks).toBe(Math.floor((founded.studio.cash - amount) / (burn - rev)))
    expect(p.postRunway.netWeeklyCash).toBe(rev - burn)

    // an unaffordable commitment is still previewed, with the balance floored at 0 → 0 weeks
    const huge = commitmentPreview(founded, founded.studio.cash * 10)
    expect(huge.affordable).toBe(false)
    expect(huge.cashAfter).toBeLessThan(0)
    expect(huge.postRunway.weeks).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// T3 — prospective cycle-inclusive break-even
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T3 — prospectiveCycleFixedCost', () => {
  it('is (PRODUCTION_TICKS + THEATRICAL_WEEKS) x current burn at sole occupancy', () => {
    const founded = foundStudio('d17a-t3-a')
    const f = prospectiveCycleFixedCost(founded)
    expect(f.weeks).toBe(TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS)
    expect(f.concurrency).toBe(1)
    expect(f.weeklyBurn).toBe(weeklyBurn(founded))
    expect(f.amount).toBe(Math.round(f.weeks * f.weeklyBurn))
    expect(Number.isInteger(f.amount)).toBe(true)
    expect(f.amount).toBeGreaterThan(0)
  })

  it('shared occupancy halves the attributed amount and names its assumption', () => {
    const founded = foundStudio('d17a-t3-b')
    const sole = prospectiveCycleFixedCost(founded)
    const shared = prospectiveCycleFixedCost(founded, { concurrency: 2 })
    expect(shared.concurrency).toBe(2)
    expect(shared.amount).toBe(Math.round((sole.weeks * sole.weeklyBurn) / 2))
    expect(shared.amount).toBeLessThan(sole.amount)
  })

  it('during founding it uses the PROJECTED basis (the cycle will be paid post-founding)', () => {
    const drafting = openFounding('d17a-t3-c')
    const f = prospectiveCycleFixedCost(drafting)
    expect(weeklyBurn(drafting)).toBe(0)
    expect(f.weeklyBurn).toBe(weeklyPayroll(drafting) + projectedWeeklyOverhead(drafting))
    expect(f.amount).toBeGreaterThan(0)
  })

  it('a concurrency below 1 is clamped to sole occupancy (never divides by 0)', () => {
    const founded = foundStudio('d17a-t3-d')
    expect(prospectiveCycleFixedCost(founded, { concurrency: 0 }).amount).toBe(
      prospectiveCycleFixedCost(founded).amount,
    )
  })
})

describe('D-17A/T3 — cycleInclusiveBreakEvenGross', () => {
  it('direct is the unchanged helper; cycle-inclusive adds the fixed cost, then divides by share', () => {
    const founded = foundStudio('d17a-t3-e')
    const committed = 3_000_000
    const be = cycleInclusiveBreakEvenGross(founded, committed)
    expect(be.direct).toBe(breakEvenGross(committed))
    expect(be.fixedCost).toEqual(prospectiveCycleFixedCost(founded))
    expect(be.cycleInclusive).toBe(breakEvenGross(committed + be.fixedCost.amount))
    expect(be.cycleInclusive).toBeGreaterThan(be.direct)
    // the gap IS the fixed cost, grossed up by the rental share
    expect(be.cycleInclusive - be.direct).toBeCloseTo(be.fixedCost.amount / TUNING.STUDIO_RENTAL_BLENDED, 6)
  })

  it('honours the concurrency option end to end', () => {
    const founded = foundStudio('d17a-t3-f')
    const shared = cycleInclusiveBreakEvenGross(founded, 3_000_000, { concurrency: 2 })
    expect(shared.fixedCost.concurrency).toBe(2)
    expect(shared.cycleInclusive).toBe(breakEvenGross(3_000_000 + shared.fixedCost.amount))
    expect(shared.cycleInclusive).toBeLessThan(cycleInclusiveBreakEvenGross(founded, 3_000_000).cycleInclusive)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// T4 — affordability scopes (recap parity)
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T4 — affordabilityScopes', () => {
  it('is BIT-IDENTICAL to the recap position it was extracted from (engaged fixture)', () => {
    let s = foundStudio('d17a-t4-a')
    s = greenlightOneFilm(s)
    for (let i = 0; i < 20; i++) s = tick(s)
    const recap = studioRunRecap(s)
    const scopes = affordabilityScopes(s)
    expect(recap.summary.releasedFilmCount).toBeGreaterThan(0) // the fixture really is engaged
    expect(scopes.cheapest).toEqual(recap.position.cheapest)
    expect(scopes.standard).toEqual(recap.position.standard)
    expect(scopes.recentTypical).toEqual(recap.position.typicalRecent)
    expect(scopes.cheapestBreakdown).toEqual(recap.position.cheapestBreakdown)
    expect(scopes.standardBreakdown).toEqual(recap.position.standardBreakdown)
    expect(scopes.contractedRosterCanFieldFilm).toBe(recap.position.contractedRosterCanFieldFilm)
  })

  it('uses the ENGINE solvency gate: affordable ⟺ commitmentPreview says so, and shortfall reconciles', () => {
    const founded = foundStudio('d17a-t4-b')
    const scopes = affordabilityScopes(founded)
    for (const scope of [scopes.cheapest, scopes.standard, scopes.recentTypical]) {
      if (scope == null) continue
      const p = commitmentPreview(founded, scope.commitment)
      expect(scope.affordable).toBe(p.affordable)
      expect(scope.shortfall).toBe(p.affordable ? 0 : Math.round(Math.max(0, -p.cashAfter)))
      expect(scope.shortfall).toBeGreaterThanOrEqual(0)
    }
  })

  it('recentTypical is null before any film has released; cheapest ≤ standard', () => {
    const founded = foundStudio('d17a-t4-c')
    const scopes = affordabilityScopes(founded)
    expect(scopes.recentTypical).toBeNull()
    expect(scopes.cheapest!.commitment).toBeLessThanOrEqual(scopes.standard!.commitment)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// T5 — contract-obligation truth at signing
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T5 — offerObligation', () => {
  it('is weeklySalary x term + signing bonus, from the engine helper', () => {
    const founded = foundStudio('d17a-t5-a')
    const free = founded.talent.find((t) => !founded.contracts.some((c) => c.talentId === t.id))!
    const offer = contractOffer(founded, free.id, 104)
    const ob = offerObligation(offer)
    expect(ob.weeklySalary).toBe(weeklySalary(offer.annualSalary))
    expect(ob.guaranteedComp).toBe(ob.weeklySalary * offer.termWeeks)
    expect(ob.signingBonus).toBe(offer.signingBonus)
    expect(ob.total).toBe(ob.guaranteedComp + ob.signingBonus)
    expect(ob.total).toBeGreaterThan(ob.signingBonus)
    // it IS the engine's own guaranteedComp, evaluated at the offer's start week
    expect(ob.guaranteedComp).toBe(
      guaranteedComp(
        {
          talentId: offer.talentId,
          annualSalary: offer.annualSalary,
          signingBonus: offer.signingBonus,
          startWeek: offer.startWeek,
          endWeekExclusive: offer.endWeekExclusive,
          termWeeks: offer.termWeeks,
        },
        offer.startWeek,
      ),
    )
  })

  it('scales linearly in the term (the same weekly salary, more weeks)', () => {
    const founded = foundStudio('d17a-t5-b')
    const free = founded.talent.find((t) => !founded.contracts.some((c) => c.talentId === t.id))!
    const short = offerObligation({ ...contractOffer(founded, free.id, 52), termWeeks: 52 })
    const long = offerObligation({ ...contractOffer(founded, free.id, 52), termWeeks: 104 })
    expect(long.guaranteedComp).toBe(short.guaranteedComp * 2)
  })
})

describe('D-17A/T5 — postSigningRunway', () => {
  it('adds the weekly salary + per-employee overhead to burn and takes the bonus out of cash', () => {
    const founded = foundStudio('d17a-t5-c')
    const free = founded.talent.find((t) => !founded.contracts.some((c) => c.talentId === t.id))!
    const offer = contractOffer(founded, free.id, 104)
    const r = postSigningRunway(founded, offer)
    expect(r.before).toEqual(runway(founded))
    expect(r.burnAfter).toBe(weeklyBurn(founded) + weeklySalary(offer.annualSalary) + TUNING.OVERHEAD_PER_EMPLOYEE)
    expect(r.cashAfter).toBe(founded.studio.cash - offer.signingBonus)
    const net = r.burnAfter - expectedWeeklyRunRevenue(founded)
    expect(r.after.weeks).toBe(Math.floor(Math.max(0, r.cashAfter) / net))
    expect(r.after.weeks!).toBeLessThan(r.before.weeks!) // signing shortens the runway
  })

  it('a RENEWAL prices only the DELTA in weekly salary (the seat already exists)', () => {
    const founded = foundStudio('d17a-t5-d')
    const existing = founded.contracts[0]!
    const offer = contractOffer(founded, existing.talentId, 104)
    const r = postSigningRunway(founded, offer, { replacesContract: existing })
    expect(r.burnAfter).toBe(
      weeklyBurn(founded) + weeklySalary(offer.annualSalary) - weeklySalary(existing.annualSalary),
    )
    // no new seat ⇒ no additional per-employee overhead
    expect(r.burnAfter).not.toBe(
      weeklyBurn(founded) +
        weeklySalary(offer.annualSalary) -
        weeklySalary(existing.annualSalary) +
        TUNING.OVERHEAD_PER_EMPLOYEE,
    )
  })

  it('never reports negative weeks, and reports infinite when revenue covers the new burn', () => {
    let s = foundStudio('d17a-t5-e')
    s = greenlightOneFilm(s, 1_000_000)
    for (let i = 0; i < 9; i++) s = tick(s)
    const free = s.talent.find((t) => !s.contracts.some((c) => c.talentId === t.id))!
    const r = postSigningRunway(s, contractOffer(s, free.id, 52))
    if (r.after.weeks != null) expect(r.after.weeks).toBeGreaterThanOrEqual(0)
    else expect(r.after.infinite).toBe(true)
  })
})
