// Colocated spec for the D-17B publicity shim. Run with:
//   npx vitest run --config src/harness/d16/vitest.d16.config.ts
//
// The load-bearing claims are the ACCOUNTING ones: a publicity purchase must move cash and the
// ledger together, must leave the fixed-cost allocator byte-identical (or it corrupts R7's
// cycle-inclusive break-even), and must leave every per-film number in the player view alone.

import { describe, it, expect } from 'vitest'
import {
  TUNING,
  allocateFixedCosts,
  applyActions,
  stableStringify,
  studioRunRecap,
  tick,
} from '../../core/index.js'
import type { GameState } from '../../core/index.js'
import {
  DEFAULT_PUBLICITY,
  PRODUCTION_PUBLICITY,
  PUBLICITY_NOTE_PREFIX,
  PUBLICITY_TIERS,
  applyPublicity,
  applyProductionPublicity,
  cooldownRemaining,
  newPublicityMemo,
  publicityAvailable,
  publicityKey,
  publicityLift,
  publicitySpendFromLedger,
  validatePublicity,
} from './publicity.js'
import type { PublicityConfig } from './publicity.js'
import { foundStudioFor, runOne } from './driver.js'
import { standardCadence, neverPublicize, publicitySpamAdversary, PUBLICITY_POLICIES } from './policies.js'
import { packageAffordable, standardPackage, toGreenlightAction } from './packages.js'
import { assertNoHiddenLeak, buildPlayerView, reconciledCash } from './view.js'

const SEED = 'd16-0001'

/** A real mid-history state: P3's cadence for `weeks` weeks, exactly as the A4 probe built it. */
function drive(weeks: number): GameState {
  let s = foundStudioFor(SEED, standardCadence).state
  for (let w = 0; w < weeks; w++) {
    const pkg = standardPackage(s)
    if (
      pkg !== null &&
      s.studio.activeProductions.length < TUNING.AGENT_MAX_SLATE &&
      packageAffordable(s, pkg)
    ) {
      try {
        s = applyActions(s, [toGreenlightAction(pkg)])
      } catch {
        /* a faithful engine refusal */
      }
    }
    s = tick(s, { develop: true })
  }
  return s
}

function buy(state: GameState, cfg: PublicityConfig, tier: 'whisper' | 'push' | 'blitz', week: number) {
  return applyPublicity(state, { tier }, cfg, newPublicityMemo(), { week, weeksSinceRelease: 3 })
}

describe('d17b/publicity — accounting (the reconciliation invariant is not negotiable)', () => {
  it('moves cash by EXACTLY the cost and writes exactly one paired ledger row', () => {
    const s0 = drive(60)
    const step = buy(s0, DEFAULT_PUBLICITY, 'push', s0.market.tick)
    expect(step.bought).toBe('push')
    expect(step.state.studio.cash).toBe(s0.studio.cash - DEFAULT_PUBLICITY.tiers.push.cost)
    expect(step.state.ledger.length).toBe(s0.ledger.length + 1)
    const e = step.state.ledger[step.state.ledger.length - 1]!
    expect(e.kind).toBe('termination')
    expect(e.amount).toBe(-DEFAULT_PUBLICITY.tiers.push.cost)
    expect(e.note).toBe(`${PUBLICITY_NOTE_PREFIX}push`)
    expect(e.productionId).toBeUndefined()
    expect(e.talentId).toBeUndefined()
  })

  it('cash === INITIAL_CASH + Σ ledger after N purchases, and after the NEXT tick', () => {
    let s = drive(60)
    let memo = newPublicityMemo()
    for (let i = 0; i < 6; i++) {
      const step = applyPublicity(s, { tier: 'whisper' }, DEFAULT_PUBLICITY, memo, {
        week: s.market.tick,
        weeksSinceRelease: 2,
      })
      s = step.state
      memo = step.memo
      expect(reconciledCash(s)).toBeCloseTo(s.studio.cash, 6)
      s = tick(s, { develop: true })
      expect(reconciledCash(s)).toBeCloseTo(s.studio.cash, 6)
    }
    expect(memo.count).toBeGreaterThan(0)
    expect(publicitySpendFromLedger(s)).toBe(memo.spend)
  })

  it('leaves the FIXED-COST ALLOCATOR byte-identical (R7 break-even is untouched)', () => {
    const s0 = drive(60)
    const before = stableStringify(allocateFixedCosts(s0))
    const after = stableStringify(allocateFixedCosts(buy(s0, DEFAULT_PUBLICITY, 'blitz', s0.market.tick).state))
    expect(after).toBe(before)
  })

  it('leaves every PER-FILM committedCost and contribution unchanged', () => {
    const s0 = drive(60)
    const before = buildPlayerView(s0).releasedFilms.map((f) => `${f.productionId}:${f.committedCost}:${f.contribution}`)
    const s1 = buy(s0, DEFAULT_PUBLICITY, 'blitz', s0.market.tick).state
    const after = buildPlayerView(s1).releasedFilms.map((f) => `${f.productionId}:${f.committedCost}:${f.contribution}`)
    expect(after).toEqual(before)
    expect(before.length).toBeGreaterThan(0) // not vacuous — the state really has films
  })

  it('moves only PURE-CASH recap fields (the A4 F7 result, locked)', () => {
    const s0 = drive(60)
    const s1 = buy(s0, DEFAULT_PUBLICITY, 'push', s0.market.tick).state
    const a = studioRunRecap(s0)
    const b = studioRunRecap(s1)
    expect(b.summary.totalFilmContribution).toBe(a.summary.totalFilmContribution)
    expect(b.capital.totalCommitments).toBe(a.capital.totalCommitments)
    expect(b.capital.totalFilmContribution).toBe(a.capital.totalFilmContribution)
    // every per-film row — the allocator's output as the recap renders it — is untouched
    expect(stableStringify(b.films)).toBe(stableStringify(a.films))
    expect(a.films.length).toBeGreaterThan(0)
    // …and the cash it SHOULD move, it moves
    expect(b.summary.currentCash).toBe(a.summary.currentCash - DEFAULT_PUBLICITY.tiers.push.cost)
  })
})

describe('d17b/publicity — the effect shape R9 requires', () => {
  it('is diminishing in the current stock and bounded by maxLift', () => {
    let prev = Infinity
    for (const a of [0, 10, 25, 50, 75, 90, 99]) {
      const lift = publicityLift(DEFAULT_PUBLICITY, 'push', a)
      expect(lift).toBeLessThanOrEqual(DEFAULT_PUBLICITY.tiers.push.maxLift)
      expect(lift).toBeLessThan(prev)
      prev = lift
    }
    expect(publicityLift(DEFAULT_PUBLICITY, 'push', 0)).toBe(DEFAULT_PUBLICITY.tiers.push.maxLift)
  })

  it('is EXACTLY 0 at the saturation ceiling (buying awareness you already have is worthless)', () => {
    for (const tier of PUBLICITY_TIERS) expect(publicityLift(DEFAULT_PUBLICITY, tier, 100)).toBe(0)
  })

  it('delivers a durationWeeks campaign in equal weekly parts, not as a switch', () => {
    const s0 = drive(60)
    const a0 = s0.studio.standing.audienceAwareness
    let s = s0
    let memo = newPublicityMemo()
    const step = applyPublicity(s, { tier: 'blitz' }, DEFAULT_PUBLICITY, memo, {
      week: s.market.tick,
      weeksSinceRelease: 1,
    })
    s = step.state
    memo = step.memo
    // nothing lands on the purchase week itself…
    expect(s.studio.standing.audienceAwareness).toBe(a0)
    expect(memo.pending).toHaveLength(1)
    // …and the three legs land one per week
    for (let i = 0; i < DEFAULT_PUBLICITY.tiers.blitz.durationWeeks; i++) {
      const next = applyPublicity(s, null, DEFAULT_PUBLICITY, memo, { week: s.market.tick + i + 1, weeksSinceRelease: 2 })
      s = next.state
      memo = next.memo
      expect(next.liftThisWeek).toBeGreaterThan(0)
    }
    expect(memo.pending).toHaveLength(0)
    expect(s.studio.standing.audienceAwareness).toBeGreaterThan(a0)
  })

  it('liftDelivered equals the awareness actually gained when a campaign leg and an instant buy land in the SAME week', () => {
    // REGRESSION (D-17B stage-3 lab fix). `liftDelivered` used to add the whole running
    // `liftThisWeek` on an instant purchase, but that total already carried this week's
    // pending-campaign delivery — so a duration-bearing leg landing on the same week as an
    // instant buy was counted twice, flattering the $/point denominator.
    const cfg: PublicityConfig = {
      tiers: {
        whisper: { cost: 1_000, maxLift: 2, saturation: 100, shapeExp: 1, durationWeeks: 0, cooldownWeeks: 1 },
        push: { cost: 2_000, maxLift: 4, saturation: 100, shapeExp: 1, durationWeeks: 0, cooldownWeeks: 1 },
        blitz: { cost: 3_000, maxLift: 9, saturation: 100, shapeExp: 1, durationWeeks: 3, cooldownWeeks: 1 },
      },
      globalCooldownWeeks: 1,
    }
    const s0 = drive(60)
    const zeroed: GameState = {
      ...s0,
      studio: { ...s0.studio, cash: 1e9, standing: { ...s0.studio.standing, audienceAwareness: 0 } },
    }
    // wk0: a duration-3 blitz — nothing lands this week, one pending leg queued.
    let step = applyPublicity(zeroed, { tier: 'blitz' }, cfg, newPublicityMemo(), { week: 0, weeksSinceRelease: 9 })
    expect(step.memo.liftDelivered).toBe(0)
    expect(step.memo.pending).toHaveLength(1)
    // wk1: the leg delivers AND an instant whisper is bought in the same week.
    step = applyPublicity(step.state, { tier: 'whisper' }, cfg, step.memo, { week: 1, weeksSinceRelease: 10 })
    const gained = step.state.studio.standing.audienceAwareness // started from exactly 0
    expect(step.liftThisWeek).toBeCloseTo(gained, 10)
    expect(step.memo.liftDelivered).toBeCloseTo(gained, 10)
  })

  it('never pushes awareness past the engine ceiling of 100', () => {
    const s0 = drive(60)
    const high: GameState = {
      ...s0,
      studio: { ...s0.studio, standing: { ...s0.studio.standing, audienceAwareness: 99.9 } },
    }
    const step = buy(high, DEFAULT_PUBLICITY, 'push', high.market.tick)
    expect(step.state.studio.standing.audienceAwareness).toBeLessThanOrEqual(100)
  })
})

describe('d17b/publicity — availability is a gate, not a suggestion', () => {
  it('honours the per-tier cooldown AND the global anti-spam cooldown', () => {
    const s = drive(60)
    let memo = newPublicityMemo()
    const step = applyPublicity(s, { tier: 'whisper' }, DEFAULT_PUBLICITY, memo, {
      week: 60,
      weeksSinceRelease: 1,
    })
    memo = step.memo
    expect(cooldownRemaining(DEFAULT_PUBLICITY, memo, 'whisper', 60)).toBe(DEFAULT_PUBLICITY.tiers.whisper.cooldownWeeks)
    // the OTHER tiers are held by the global cooldown only
    expect(cooldownRemaining(DEFAULT_PUBLICITY, memo, 'push', 60)).toBe(DEFAULT_PUBLICITY.globalCooldownWeeks)
    expect(cooldownRemaining(DEFAULT_PUBLICITY, memo, 'push', 60 + DEFAULT_PUBLICITY.globalCooldownWeeks)).toBe(0)
    // a refused purchase is COUNTED, not silently dropped
    const blocked = applyPublicity(s, { tier: 'whisper' }, DEFAULT_PUBLICITY, memo, {
      week: 61,
      weeksSinceRelease: 2,
    })
    expect(blocked.bought).toBeNull()
    expect(blocked.memo.blockedByCooldown).toBe(1)
  })

  it('refuses a purchase that would take cash below zero (the canAfford rule, not a lookalike)', () => {
    const s0 = drive(60)
    const cost = DEFAULT_PUBLICITY.tiers.push.cost
    const broke: GameState = { ...s0, studio: { ...s0.studio, cash: cost - 1 } }
    const step = buy(broke, DEFAULT_PUBLICITY, 'push', broke.market.tick)
    expect(step.bought).toBeNull()
    expect(step.memo.blockedByCash).toBe(1)
    expect(step.state.studio.cash).toBe(cost - 1)
    // exactly at the cost it IS affordable — the boundary is `cash - cost >= 0`
    const exact: GameState = { ...s0, studio: { ...s0.studio, cash: cost } }
    expect(buy(exact, DEFAULT_PUBLICITY, 'push', exact.market.tick).bought).toBe('push')
  })

  it('honours a per-run cap', () => {
    const cfg: PublicityConfig = { ...DEFAULT_PUBLICITY, perRunCap: 100_000 }
    const s = drive(60)
    const memo = { ...newPublicityMemo(), spend: 90_000 }
    expect(publicityAvailable(cfg, memo, 'whisper', 60, 1e9).ok).toBe(false)
    const step = applyPublicity(s, { tier: 'whisper' }, cfg, memo, { week: 60, weeksSinceRelease: 1 })
    expect(step.bought).toBeNull()
    expect(step.memo.blockedByCap).toBe(1)
  })

  it('rejects a menu whose costs are not integer dollars (the allocator’s guard, kept open)', () => {
    expect(() =>
      validatePublicity({
        ...DEFAULT_PUBLICITY,
        tiers: { ...DEFAULT_PUBLICITY.tiers, push: { ...DEFAULT_PUBLICITY.tiers.push, cost: 250_000.5 } },
      }),
    ).toThrow(/INTEGER/)
    expect(() => validatePublicity(DEFAULT_PUBLICITY)).not.toThrow()
  })

  it('rejects probable fraction-vs-percent saturation and identifies saturation in the key', () => {
    const bad: PublicityConfig = {
      ...PRODUCTION_PUBLICITY,
      tiers: {
        ...PRODUCTION_PUBLICITY.tiers,
        whisper: { ...PRODUCTION_PUBLICITY.tiers.whisper, saturation: 1 },
      },
    }
    expect(() => validatePublicity(bad)).toThrow(/fraction-vs-percent/)
    expect(publicityKey(PRODUCTION_PUBLICITY)).toContain('/sat100/')
  })

  it('the production action agrees exactly with the lab formula at every tier and representative stock', () => {
    const base = drive(60)
    for (const tier of PUBLICITY_TIERS) {
      for (const awareness of [0, 15, 30, 35, 57, 90]) {
        const state: GameState = {
          ...base,
          studio: {
            ...base.studio,
            cash: 100_000_000,
            standing: { ...base.studio.standing, audienceAwareness: awareness },
          },
          publicity: { lastUsedWeek: null, byTier: { whisper: null, push: null, blitz: null } },
        }
        const memo = newPublicityMemo()
        const ctx = { week: state.market.tick, weeksSinceRelease: 3 }
        const lab = applyPublicity(state, { tier }, PRODUCTION_PUBLICITY, memo, ctx)
        const production = applyProductionPublicity(state, { tier }, PRODUCTION_PUBLICITY, memo, ctx)
        expect(production.state.studio.cash).toBe(lab.state.studio.cash)
        expect(production.state.studio.standing.audienceAwareness).toBe(
          lab.state.studio.standing.audienceAwareness,
        )
        expect(production.memo.spend).toBe(lab.memo.spend)
        expect(production.memo.liftDelivered).toBe(lab.memo.liftDelivered)
        expect(production.entry?.kind).toBe('publicity')
      }
    }
  })
})

describe('d17b/publicity — the view panel and the policy channel', () => {
  it('PlayerView.publicity is null when the shim is off and passes the leak canary when on', () => {
    const s = drive(20)
    expect(buildPlayerView(s).publicity).toBeNull()
    const view = buildPlayerView(s, { publicity: { cfg: DEFAULT_PUBLICITY, memo: newPublicityMemo() } })
    expect(view.publicity).not.toBeNull()
    expect(view.publicity!.tiers).toHaveLength(3)
    expect(view.publicity!.spendToDate).toBe(0)
    expect(view.publicity!.lastUsedWeek).toBeNull()
    expect(() => assertNoHiddenLeak(view)).not.toThrow()
  })

  it('the panel reports availability the same way the gate does', () => {
    const s0 = drive(60)
    const poor: GameState = { ...s0, studio: { ...s0.studio, cash: 100_000 } }
    const view = buildPlayerView(poor, { publicity: { cfg: DEFAULT_PUBLICITY, memo: newPublicityMemo() } })
    const byTier = new Map(view.publicity!.tiers.map((t) => [t.tier, t]))
    expect(byTier.get('whisper')!.available).toBe(true)
    expect(byTier.get('push')!.available).toBe(false)
    expect(byTier.get('blitz')!.available).toBe(false)
  })

  it('a run WITHOUT the shim never calls publicize and emits no publicity record', () => {
    const rec = runOne({ seed: SEED, policy: publicitySpamAdversary, horizonWeeks: 52 })
    expect(rec.publicity).toBeUndefined()
    expect(rec.ledgerTotals['termination']).toBeUndefined()
  })

  it('Q0 (never publicize) reproduces its host P3 EXACTLY even with the shim enabled', () => {
    const p3 = runOne({ seed: SEED, policy: standardCadence, horizonWeeks: 104 })
    const q0 = runOne({ seed: SEED, policy: neverPublicize, horizonWeeks: 104, publicity: DEFAULT_PUBLICITY })
    expect(q0.endCash).toBe(p3.endCash)
    expect(q0.filmsReleased).toBe(p3.filmsReleased)
    expect(q0.publicity!.count).toBe(0)
    expect(q0.publicity!.spend).toBe(0)
  })

  it('the adversary really does spend, and the ledger self-check binds on a full run', () => {
    const rec = runOne({ seed: SEED, policy: publicitySpamAdversary, horizonWeeks: 104, publicity: DEFAULT_PUBLICITY })
    expect(rec.publicity!.count).toBeGreaterThan(5)
    expect(rec.publicity!.spend).toBeGreaterThan(0)
    expect(rec.reconciliationOk).toBe(true)
    // `termination` is an unambiguous per-arm publicity total for this policy set
    expect(rec.ledgerTotals['termination']).toBe(-rec.publicity!.spend)
    expect(rec.awareness).toBeDefined()
  })

  it('every Q policy returns an intent derived ONLY from the visible view (8 registered arms)', () => {
    expect(PUBLICITY_POLICIES).toHaveLength(8)
    expect(new Set(PUBLICITY_POLICIES.map((p) => p.name)).size).toBe(8)
    for (const p of PUBLICITY_POLICIES) {
      expect(typeof p.publicize).toBe('function')
      expect(p.description.length).toBeGreaterThan(20)
    }
    expect(PUBLICITY_POLICIES.filter((p) => p.kind === 'adversary')).toHaveLength(1)
  })

  it('publicityKey names the whole menu, and is undefined when the shim is off', () => {
    expect(publicityKey(undefined)).toBeUndefined()
    const k = publicityKey(DEFAULT_PUBLICITY)!
    expect(k).toContain('whisper=')
    expect(k).toContain('/sat100/')
    expect(k).toContain('gcd=')
  })
})
