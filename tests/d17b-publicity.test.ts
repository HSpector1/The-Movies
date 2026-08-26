// ── D-17B §2 / §5 — the publicity campaign action ─────────────────────────────
// Authority: docs/D-17B-CANDIDATE-DESIGN-CONTRACT.md §2 (menu R21) and §5 (ledger/recap
// treatment); Owner authorization §4 B ("one player-controlled Publicity action/system"),
// §5 (campaign, not a facility), §8 (a decision, not a chore), §9 (a small legible tier
// set), §15 (the anti-spam gate) and §16 ("RECOVERY IS NOT FREE").
//
// What this file pins:
//   * every rejection path, by its NAMED reason;
//   * the lift SHAPE — `maxLift · (1 − A/100)^6` — at the awareness levels the contract
//     prices (A = 0 / 35 / 60), and its consequences: convex, saturating, never past 100;
//   * both cooldowns, per-tier AND global;
//   * cash ↔ ledger reconciliation, integer dollars, and studio-level (never per-film)
//     accounting through `financeTotals`, `periodSummary`, the recap and the allocator;
//   * live-save round-trip and replay determinism with publicity in the action sequence.

import { describe, expect, it } from 'vitest'
import {
  allocateFixedCosts,
  applyActions,
  beginFounding,
  economyEngaged,
  exportSave,
  financeTotals,
  FOUNDING_MINIMUMS,
  generateWorld,
  importSave,
  makeSave,
  periodSummary,
  publicityLiftAt,
  publicityOffer,
  publicityOffers,
  studioRunRecap,
  tick,
  TUNING,
} from '../src/core/index.js'
import type { CreativeRole, GameState, PublicityTier } from '../src/core/index.js'

const TIERS: readonly PublicityTier[] = ['whisper', 'push', 'blitz'] as const

function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  for (const t of [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]) {
    s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  }
  return applyActions(s, [{ kind: 'foundStudio' }])
}

/** A founded studio placed at a chosen week, awareness and cash — no ticking needed. */
function studioAt(seed: string, over: { week?: number; awareness?: number; cash?: number } = {}): GameState {
  const s = foundStudio(seed)
  const cash = over.cash ?? 100_000_000
  const cashAdjustment = cash - s.studio.cash
  return {
    ...s,
    market: { ...s.market, tick: over.week ?? s.market.tick },
    ledger:
      cashAdjustment === 0
        ? s.ledger
        : [
            ...s.ledger,
            {
              week: over.week ?? s.market.tick,
              kind: 'studioRevenue',
              amount: cashAdjustment,
              note: 'test fixture cash identity adjustment',
            },
          ],
    studio: {
      ...s.studio,
      cash,
      standing: { ...s.studio.standing, audienceAwareness: over.awareness ?? 40 },
    },
  }
}

const buy = (s: GameState, tier: PublicityTier): GameState => applyActions(s, [{ kind: 'publicity', tier }])
const awarenessOf = (s: GameState): number => s.studio.standing.audienceAwareness

/** The contract's own lift formula, written out independently of actions.ts. */
function expectedLift(tier: PublicityTier, awareness: number): number {
  const spec = TUNING.PUBLICITY_TIERS[tier]
  return spec.maxLift * Math.pow(1 - awareness / 100, TUNING.PUBLICITY_SHAPE_EXP)
}

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17B §2 — the tier menu is the contract menu', () => {
  it('three tiers at the measured costs, lifts and cooldowns, plus the global cooldown', () => {
    expect(TUNING.PUBLICITY_TIERS.whisper).toEqual({ cost: 1_200_000, maxLift: 18, cooldownWeeks: 8 })
    expect(TUNING.PUBLICITY_TIERS.push).toEqual({ cost: 3_600_000, maxLift: 30, cooldownWeeks: 12 })
    expect(TUNING.PUBLICITY_TIERS.blitz).toEqual({ cost: 8_000_000, maxLift: 42, cooldownWeeks: 20 })
    expect(TUNING.PUBLICITY_SHAPE_EXP).toBe(6)
    expect(TUNING.PUBLICITY_GLOBAL_COOLDOWN_WEEKS).toBe(6)
  })

  it('every tier costs whole dollars, and cost/lift/cooldown all rise with the tier', () => {
    const specs = TIERS.map((t) => TUNING.PUBLICITY_TIERS[t])
    for (const spec of specs) expect(Number.isInteger(spec.cost)).toBe(true)
    for (let i = 1; i < specs.length; i++) {
      expect(specs[i]!.cost).toBeGreaterThan(specs[i - 1]!.cost)
      expect(specs[i]!.maxLift).toBeGreaterThan(specs[i - 1]!.maxLift)
      expect(specs[i]!.cooldownWeeks).toBeGreaterThan(specs[i - 1]!.cooldownWeeks)
    }
  })

  it('the authoritative read model exposes the same exact offer the action will execute', () => {
    const state = studioAt('pub-offer-parity', { week: 81, awareness: 30 })
    const offers = publicityOffers(state)
    expect(offers.map((offer) => offer.tier)).toEqual(TIERS)
    for (const offer of offers) {
      const spec = TUNING.PUBLICITY_TIERS[offer.tier]
      expect(offer.cost).toBe(spec.cost)
      expect(offer.maxLift).toBe(spec.maxLift)
      expect(offer.expectedLift).toBeCloseTo(expectedLift(offer.tier, 30), 12)
      expect(offer.expectedLift).toBe(publicityLiftAt(offer.tier, 30))
      expect(offer.pricePerPoint).toBeCloseTo(spec.cost / offer.expectedLift, 8)
      expect(offer.cooldownWeeks).toBe(spec.cooldownWeeks)
      expect(offer.globalCooldownWeeks).toBe(TUNING.PUBLICITY_GLOBAL_COOLDOWN_WEEKS)
      expect(offer.available).toBe(true)
      expect(offer.availableWeek).toBe(81)
      expect(offer.reason).toBeNull()

      const out = buy(state, offer.tier)
      expect(awarenessOf(out) - awarenessOf(state)).toBeCloseTo(offer.expectedLift, 12)
      expect(out.studio.cash).toBe(state.studio.cash - offer.cost)
    }
  })

  it('read-model availability agrees with every action rejection gate', () => {
    const drafting = beginFounding(generateWorld('pub-offer-drafting'))
    expect(publicityOffers(generateWorld('pub-offer-headless')).every((offer) => !offer.available)).toBe(true)
    expect(publicityOffers(drafting).every((offer) => !offer.available)).toBe(true)

    const broke = studioAt('pub-offer-broke', {
      cash: TUNING.PUBLICITY_TIERS.whisper.cost - 1,
    })
    for (const tier of TIERS) {
      const offer = publicityOffer(broke, tier)
      expect(offer.available).toBe(false)
      expect(() => buy(broke, tier)).toThrow()
    }

    const first = buy(studioAt('pub-offer-cooldown', { week: 40 }), 'whisper')
    const duringGlobal = { ...first, market: { ...first.market, tick: 42 } }
    for (const tier of TIERS) {
      const offer = publicityOffer(duringGlobal, tier)
      expect(offer.available).toBe(false)
      expect(offer.availableWeek).toBe(
        Math.max(
          40 + TUNING.PUBLICITY_GLOBAL_COOLDOWN_WEEKS,
          tier === 'whisper' ? 40 + TUNING.PUBLICITY_TIERS.whisper.cooldownWeeks : 42,
        ),
      )
      expect(() => buy(duringGlobal, tier)).toThrow()
    }
  })
})

describe('D-17B §2 — the lift shape: maxLift · (1 − A/100)^6', () => {
  it('matches the formula exactly at A = 0, 35 and 60 (the levels §2 prices)', () => {
    for (const awareness of [0, 35, 60]) {
      for (const tier of TIERS) {
        const out = buy(studioAt(`pub-shape-${tier}-${awareness}`, { awareness }), tier)
        expect(awarenessOf(out) - awareness).toBeCloseTo(expectedLift(tier, awareness), 10)
      }
    }
  })

  it('the price per awareness point rises steeply with awareness (§2: $67k at 0 → $1.43M at 40)', () => {
    const perPoint = (awareness: number): number =>
      TUNING.PUBLICITY_TIERS.whisper.cost / expectedLift('whisper', awareness)
    expect(perPoint(0)).toBeCloseTo(66_667, -3)
    expect(perPoint(35)).toBeCloseTo(884_000, -4)
    expect(perPoint(40)).toBeCloseTo(1_430_000, -4)
    // strictly increasing — the button gets worse the more you already have
    let previous = 0
    for (const a of [0, 10, 20, 30, 40, 50, 60, 70]) {
      const p = perPoint(a)
      expect(p).toBeGreaterThan(previous)
      previous = p
    }
  })

  it('never pushes awareness past 100, and buys almost nothing at the top', () => {
    for (const awareness of [95, 99, 100]) {
      const out = buy(studioAt(`pub-cap-${awareness}`, { awareness }), 'blitz')
      expect(awarenessOf(out)).toBeLessThanOrEqual(100)
      expect(awarenessOf(out)).toBeGreaterThanOrEqual(awareness)
    }
    expect(awarenessOf(buy(studioAt('pub-cap-exact', { awareness: 100 }), 'blitz'))).toBe(100)
  })

  it('is deterministic and consumes NO RNG (this milestone adds none)', () => {
    const base = studioAt('pub-det', { awareness: 22 })
    const a = buy(base, 'push')
    const b = buy(base, 'push')
    expect(awarenessOf(a)).toBe(awarenessOf(b))
    expect(a.rngState).toBe(base.rngState)
  })

  it('moves ONLY awareness — prestige, confidence and talent are untouched', () => {
    const base = studioAt('pub-isolation', { awareness: 30 })
    const out = buy(base, 'blitz')
    expect(out.studio.standing.industryPrestige).toBe(base.studio.standing.industryPrestige)
    expect(out.studio.standing.commercialConfidence).toBe(base.studio.standing.commercialConfidence)
    expect(out.talent).toBe(base.talent)
    expect(out.studio.activeProductions).toBe(base.studio.activeProductions)
    expect(out.theatricalRuns).toBe(base.theatricalRuns)
  })
})

describe('D-17B §2 — every rejection has a named reason', () => {
  it('rejects when the economy is NOT engaged (headless/M0A has no such action)', () => {
    const headless = generateWorld('pub-reject-headless')
    expect(economyEngaged(headless)).toBe(false)
    expect(() => buy(headless, 'whisper')).toThrow(/economy is not engaged/)
  })

  it('rejects during a founding draft', () => {
    const drafting = beginFounding(generateWorld('pub-reject-founding'))
    expect(drafting.founding).not.toBeNull()
    expect(() => buy(drafting, 'whisper')).toThrow(/founding draft/)
  })

  it('rejects when the studio cannot afford it — the D-12.11 solvency gate, not a bailout', () => {
    const spec = TUNING.PUBLICITY_TIERS.push
    const broke = studioAt('pub-reject-cash', { cash: spec.cost - 1 })
    expect(() => buy(broke, 'push')).toThrow(/Insufficient cash/)
    expect(() => buy(broke, 'push')).toThrow(/D-12 solvency gate/)
    // exactly affordable is LEGAL and lands on zero, never below
    const exact = studioAt('pub-reject-cash-exact', { cash: spec.cost })
    expect(buy(exact, 'push').studio.cash).toBe(0)
  })

  it('rejects an unknown tier', () => {
    const s = studioAt('pub-reject-tier')
    expect(() => applyActions(s, [{ kind: 'publicity', tier: 'megaphone' as PublicityTier }])).toThrow(
      /unknown tier/,
    )
  })

  it('rejects inside the PER-TIER cooldown and names the week it becomes available', () => {
    for (const tier of TIERS) {
      const spec = TUNING.PUBLICITY_TIERS[tier]
      const first = buy(studioAt(`pub-cd-${tier}`, { week: 100 }), tier)
      // far enough past the GLOBAL cooldown that the tier clock is what is being tested
      const justBefore = { ...first, market: { ...first.market, tick: 100 + spec.cooldownWeeks - 1 } }
      expect(() => buy(justBefore, tier)).toThrow(new RegExp(`next ${tier} campaign is available in week ${String(100 + spec.cooldownWeeks)}`))
      const exactlyOn = { ...first, market: { ...first.market, tick: 100 + spec.cooldownWeeks } }
      expect(() => buy(exactlyOn, tier)).not.toThrow()
    }
  })

  it('rejects inside the GLOBAL cooldown even for a DIFFERENT tier', () => {
    const g = TUNING.PUBLICITY_GLOBAL_COOLDOWN_WEEKS
    const first = buy(studioAt('pub-global', { week: 50 }), 'whisper')
    const justBefore = { ...first, market: { ...first.market, tick: 50 + g - 1 } }
    expect(() => buy(justBefore, 'blitz')).toThrow(/global cooldown/)
    expect(() => buy(justBefore, 'blitz')).toThrow(new RegExp(`available in week ${String(50 + g)}`))
    const exactlyOn = { ...first, market: { ...first.market, tick: 50 + g } }
    expect(() => buy(exactlyOn, 'blitz')).not.toThrow()
  })

  it('the ladder cannot be climbed as one purchase: back-to-back tiers are all blocked', () => {
    const s = buy(studioAt('pub-ladder', { week: 10 }), 'whisper')
    for (const tier of TIERS) expect(() => buy(s, tier)).toThrow(/cooldown/)
  })

  it('a rejected action changes NOTHING (no cash, no ledger, no stamps)', () => {
    const broke = studioAt('pub-reject-atomic', { cash: 10 })
    expect(() => buy(broke, 'whisper')).toThrow()
    expect(broke.studio.cash).toBe(10)
    expect(broke.ledger.some((e) => e.kind === 'publicity')).toBe(false)
    expect(broke.publicity.lastUsedWeek).toBeNull()
  })
})

describe('D-17B §2 — the cooldown stamps are the only thing publicity persists', () => {
  it('a purchase stamps BOTH clocks with the current week', () => {
    const s = buy(studioAt('pub-stamp', { week: 77 }), 'push')
    expect(s.publicity.lastUsedWeek).toBe(77)
    expect(s.publicity.byTier.push).toBe(77)
    expect(s.publicity.byTier.whisper).toBeNull()
    expect(s.publicity.byTier.blitz).toBeNull()
  })

  it('a later purchase of another tier advances the global clock and leaves the first tier stamp', () => {
    const first = buy(studioAt('pub-stamp-2', { week: 20 }), 'whisper')
    const later = buy({ ...first, market: { ...first.market, tick: 40 } }, 'blitz')
    expect(later.publicity.byTier.whisper).toBe(20)
    expect(later.publicity.byTier.blitz).toBe(40)
    expect(later.publicity.lastUsedWeek).toBe(40)
  })

  it('never mutates the input state', () => {
    const base = studioAt('pub-immutable', { week: 5 })
    const before = JSON.stringify(base.publicity)
    buy(base, 'whisper')
    expect(JSON.stringify(base.publicity)).toBe(before)
  })

  it('survives a tick unchanged (the tick has no publicity step)', () => {
    const s = buy(studioAt('pub-survives'), 'whisper')
    expect(tick(s).publicity).toEqual(s.publicity)
  })
})

describe('D-17B §5 — cash, ledger and the studio-level accounting', () => {
  it('cash falls by exactly the cost, and the ledger entry reconciles', () => {
    for (const tier of TIERS) {
      const base = studioAt(`pub-cash-${tier}`, { week: 12 })
      const out = buy(base, tier)
      const spec = TUNING.PUBLICITY_TIERS[tier]
      expect(out.studio.cash).toBe(base.studio.cash - spec.cost)
      const added = out.ledger.slice(base.ledger.length)
      expect(added).toHaveLength(1)
      expect(added[0]).toEqual({ week: 12, kind: 'publicity', amount: -spec.cost, note: `publicity: ${tier}` })
      expect(Number.isInteger(added[0]!.amount)).toBe(true)
      // a STUDIO-level cost: it carries no film
      expect(added[0]!.productionId).toBeUndefined()
      // the reconciliation invariant still holds: cash − start === Σ ledger
      expect(financeTotals(out).net - financeTotals(base).net).toBe(-spec.cost)
    }
  })

  it('financeTotals and periodSummary both give it its own line', () => {
    const base = studioAt('pub-view', { week: 4 })
    const out = buy(base, 'blitz')
    expect(financeTotals(out).publicity).toBe(-TUNING.PUBLICITY_TIERS.blitz.cost)
    const p = periodSummary(out, 0, 10)
    expect(p.publicity).toBe(-TUNING.PUBLICITY_TIERS.blitz.cost)
    expect(p.otherCash).toBe(periodSummary(base, 0, 10).otherCash) // NOT absorbed
    expect(p.production).toBe(periodSummary(base, 0, 10).production)
  })

  it('the fixed-cost allocator is INERT to it (it reads payroll/overhead only)', () => {
    const base = studioAt('pub-alloc', { week: 3 })
    const out = buy(base, 'push')
    const before = allocateFixedCosts(base)
    const after = allocateFixedCosts(out)
    expect(after.total).toBe(before.total)
    expect(after.idle).toBe(before.idle)
    expect(after.perFilm).toEqual(before.perFilm)
  })

  it('the recap reports it in the capital story and NOWHERE in the film economics', () => {
    const base = studioAt('pub-recap', { week: 6 })
    const out = buy(base, 'push')
    const rBefore = studioRunRecap(base)
    const rAfter = studioRunRecap(out)
    const cost = TUNING.PUBLICITY_TIERS.push.cost

    expect(rAfter.capital.totalPublicity).toBe(cost) // positive, like payroll/overhead
    expect(rBefore.capital.totalPublicity).toBe(0)
    // it is a studio-level cost: NOT a film commitment, NOT film contribution
    expect(rAfter.capital.totalCommitments).toBe(rBefore.capital.totalCommitments)
    expect(rAfter.capital.totalFilmContribution).toBe(rBefore.capital.totalFilmContribution)
    expect(rAfter.summary.totalFilmContribution).toBe(rBefore.summary.totalFilmContribution)
    expect(rAfter.films.map((f) => f.studioEconomicResult)).toEqual(
      rBefore.films.map((f) => f.studioEconomicResult),
    )
    // …and it does not leak into the fixed-cost identity
    expect(rAfter.capital.totalLedgerFixedCost).toBe(rBefore.capital.totalLedgerFixedCost)
    // …but the cash story DOES carry it, automatically, because it is a ledger entry
    expect(rAfter.capital.currentCash).toBe(rBefore.capital.currentCash - cost)
    const week6 = rAfter.capital.cashTimeline.find((p) => p.week === 6)
    expect(week6).toBeDefined()
    const week6Before = rBefore.capital.cashTimeline.find((p) => p.week === 6)
    expect(week6!.cash).toBe((week6Before?.cash ?? rBefore.capital.startingCash) - cost)
  })
})

describe('D-17B §2/§6 — save round-trip and replay determinism', () => {
  it('a bought campaign survives export → import byte-identically, stamps and all', () => {
    const s = buy(studioAt('pub-roundtrip', { week: 9 }), 'whisper')
    const json = exportSave(makeSave(s))
    const back = importSave(json)
    if (back.saveVersion !== 15) throw new Error('expected V15')
    expect(back.state.publicity).toEqual(s.publicity)
    expect(back.state.studio.cash).toBe(s.studio.cash)
    expect(exportSave(makeSave(back.state))).toBe(json)
  })

  it('a mixed sequence of ticks and campaigns replays identically from the same seed', () => {
    const run = (): GameState => {
      let s = foundStudio('pub-replay')
      s = studioAt('pub-replay')
      for (let w = 0; w < 30; w++) {
        if (w === 2) s = buy(s, 'whisper')
        if (w === 12) s = buy(s, 'push')
        if (w === 24) s = buy(s, 'blitz')
        s = tick(s)
      }
      return s
    }
    expect(exportSave(makeSave(run()))).toBe(exportSave(makeSave(run())))
  })

  it('a reload mid-run continues identically to an uninterrupted run (campaign included)', () => {
    let base = foundStudio('pub-reload')
    base = studioAt('pub-reload')
    for (let w = 0; w < 5; w++) base = tick(base)
    const mid = buy(base, 'push')

    const reloaded = importSave(exportSave(makeSave(mid)))
    if (reloaded.saveVersion !== 15) throw new Error('expected V15')
    let split = reloaded.state
    let continuous = mid
    for (let w = 0; w < 8; w++) {
      split = tick(split)
      continuous = tick(continuous)
    }
    expect(exportSave(makeSave(split))).toBe(exportSave(makeSave(continuous)))
  })

  it('the cooldown clocks survive a reload — a reload cannot buy a second campaign early', () => {
    const s = buy(studioAt('pub-reload-cd', { week: 30 }), 'blitz')
    const back = importSave(exportSave(makeSave(s)))
    if (back.saveVersion !== 15) throw new Error('expected V15')
    const soon = { ...back.state, market: { ...back.state.market, tick: 31 } }
    expect(() => buy(soon, 'whisper')).toThrow(/global cooldown/)
    expect(() => buy(soon, 'blitz')).toThrow(/cooldown/)
  })
})
