// ── D-17A INDEPENDENT ADVERSARIAL TESTS — A. ACTION PARITY ────────────────────
// Quality requirement A (contract §4): "every 'can do X' claim uses the authoritative
// action rules". `affordabilityScopes(state)` is the promoted claim surface (T4), so
// every figure it reports must survive being pushed against the REAL greenlight action
// at the exact solvency boundary, and its `commitment` figures must be reproducible by
// hand from the §13 grid + the ledger — never taken on trust from the selector.
//
// Expectations here are derived from:
//   • docs/D-17A-IMPLEMENTATION-CONTRACT.md §4 A, §6 ("action-parity"), T4;
//   • the ENGINE's own authoritative rules: `canAfford` (D-12.11 — cash after the
//     immediate transaction must be ≥ 0, i.e. an INCLUSIVE gate) and `applyGreenlight`
//     (immediate charge = negative + marketing + freelancer fees);
//   • the §13 negative grid, D-17B's regime-aware active marketing menu,
//     and `resolveShape`'s 36 legal shapes.
// Nothing is copied out of economyView.ts / studioRunRecap.ts.

import { describe, expect, it } from 'vitest'
import {
  affordabilityScopes,
  applyActions,
  beginFounding,
  cheapestPackageQuote,
  commitmentPreview,
  generateWorld,
  marketingLevelsFor,
  NEGATIVE_BUDGET_MULTIPLIERS,
  resolveShape,
  standardPackageQuote,
  tick,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, FilmShape, GameState } from '../src/core/index.js'

// ── real-state construction (the tests/d12-economy.test.ts idiom) ─────────────
const ROSTER: Record<CreativeRole, number> = { actor: 6, director: 2, writer: 2, craft: 2 }

function foundStudio(seed: string, term = 156): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', ROSTER.actor),
    ...byRole('director', ROSTER.director),
    ...byRole('writer', ROSTER.writer),
    ...byRole('craft', ROSTER.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: term }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function rosterOf(s: GameState, role: CreativeRole) {
  return s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role)
}

/** The cheapest concept — the one the bare-minimum package is priced from. */
function cheapestConceptId(s: GameState): string {
  let best = s.concepts[0]!
  for (const c of s.concepts) if (c.baseNegativeCost < best.baseNegativeCost) best = c
  return best.id
}

/** Greenlight through the REAL action. `slot` picks a disjoint crew so two films can overlap. */
function greenlight(
  s: GameState,
  conceptId: string,
  slot: number,
  negative: number,
  marketing: number,
): GameState {
  const a = rosterOf(s, 'actor')
  const w = rosterOf(s, 'writer')
  const d = rosterOf(s, 'director')
  const c = rosterOf(s, 'craft')
  const concept = s.concepts.find((x) => x.id === conceptId)!
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
        writerId: w[slot]!.id,
        directorId: d[slot]!.id,
        cast: {
          lead: a[slot * 3]!.id,
          antagonist: a[slot * 3 + 1]!.id,
          support: a[slot * 3 + 2]!.id,
        } as Record<CastSlot, string>,
        craftIds: [c[slot]!.id],
        budget: { negative, marketing },
      },
    },
  ])
}

const withCash = (s: GameState, cash: number): GameState => ({ ...s, studio: { ...s.studio, cash } })

// P06A (charter W1): the hold law means "tick until released" spins forever without the
// explicit commitment. This commits every ready picture before each tick so a slot can be
// reused by the next greenlight on schedule — committing at the ready week adds NO week
// (P06A W1).
function tickCommittingReady(s: GameState): GameState {
  const committed = new Set(s.releaseAuthority.commitments.map((r) => r.productionId))
  const ready = s.studio.activeProductions.filter((p) => p.remainingTicks === 1 && !committed.has(p.id))
  const next =
    ready.length === 0
      ? s
      : applyActions(s, ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })))
  return tick(next)
}

// ── hand-derived package figures (from the grid + resolveShape, not the selector) ──

/** Least budget-demand multiplier over ALL 36 legal story shapes (real resolveShape). */
function minShapeDemand(): number {
  const openings: FilmShape['opening'][] = ['immediateAction', 'slowSetup', 'mysteryHook']
  const midpoints: FilmShape['midpoint'][] = ['reversal', 'escalation', 'revelation']
  const endings: FilmShape['ending'][] = ['triumph', 'bittersweet', 'tragic', 'ambiguous']
  let min = Infinity
  for (const opening of openings)
    for (const midpoint of midpoints)
      for (const ending of endings)
        min = Math.min(min, resolveShape({ opening, midpoint, ending }).budgetDemandMultiplier)
  return min
}

const minBaseNeg = (s: GameState) => Math.min(...s.concepts.map((c) => c.baseNegativeCost))

/** Bare minimum: LOWEST grid multiplier × the engine's own requiredNegative (§5: concept base
 *  × shape budgetDemandMultiplier × era costScale, in that grouping — reception.ts:220), at the
 *  least demanding of the 36 legal shapes. A fully contracted roster hires no freelancers. */
function handCheapestNegative(s: GameState): number {
  const requiredNegative = minBaseNeg(s) * minShapeDemand() * s.era.costScale
  return NEGATIVE_BUDGET_MULTIPLIERS[0] * requiredNegative
}
/** A standard film: default (1.0×) grid multiplier, neutral shape demand, default marketing rung. */
function handStandardNegative(s: GameState): number {
  return Math.round(NEGATIVE_BUDGET_MULTIPLIERS[1] * minBaseNeg(s) * 1.0 * s.era.costScale)
}

/** committed cost of a released film, straight off the ledger (D-12 §3). */
function ledgerCommittedCost(s: GameState, productionId: string): number {
  let c = 0
  for (const e of s.ledger) {
    if (e.productionId === productionId && (e.kind === 'production' || e.kind === 'freelancerFee')) c -= e.amount
  }
  return c
}

const median = (xs: number[]): number => {
  const v = [...xs].sort((a, b) => a - b)
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m]! : (v[m - 1]! + v[m]!) / 2
}

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17A/A — affordabilityScopes.cheapest is the real greenlight action at the boundary', () => {
  it('cash === commitment: the gate is INCLUSIVE — the claim says affordable AND the action succeeds', () => {
    const base = foundStudio('adv-a-boundary')
    const scopes0 = affordabilityScopes(base)
    const pkg = scopes0.cheapestBreakdown!
    expect(pkg).not.toBeNull()
    expect(scopes0.contractedRosterCanFieldFilm).toBe(true)
    expect(pkg.freelancerFees).toBe(0) // a complete contracted roster hires nobody

    const commitment = pkg.negative + pkg.marketing + pkg.freelancerFees
    const at = withCash(base, commitment)

    // The CLAIM.
    const claim = affordabilityScopes(at).cheapest!
    expect(claim.affordable).toBe(true)
    expect(claim.shortfall).toBe(0)

    // The ACTION, on the very same package.
    const done = greenlight(at, cheapestConceptId(at), 0, pkg.negative, pkg.marketing)
    expect(done.studio.activeProductions.length).toBe(1)
    expect(done.studio.cash).toBe(0) // exactly to zero is legal (D-12.11)
  })

  it('cash === commitment − 1: the claim says NOT affordable (shortfall 1) AND the action is rejected', () => {
    const base = foundStudio('adv-a-boundary')
    const pkg = affordabilityScopes(base).cheapestBreakdown!
    const commitment = pkg.negative + pkg.marketing + pkg.freelancerFees
    const at = withCash(base, commitment - 1)

    const claim = affordabilityScopes(at).cheapest!
    expect(claim.affordable).toBe(false)
    expect(claim.shortfall).toBe(1)

    expect(() => greenlight(at, cheapestConceptId(at), 0, pkg.negative, pkg.marketing)).toThrow(
      /solvency gate/i,
    )
  })

  it('the reported shortfall equals the real gate deficit for an arbitrary gap', () => {
    const base = foundStudio('adv-a-shortfall')
    const pkg = affordabilityScopes(base).cheapestBreakdown!
    const commitment = pkg.negative + pkg.marketing + pkg.freelancerFees
    for (const gap of [1, 7, 250_000, 1_000_000]) {
      const at = withCash(base, commitment - gap)
      const claim = affordabilityScopes(at).cheapest!
      expect(claim.affordable).toBe(false)
      expect(claim.shortfall).toBe(Math.round(gap))
      expect(() => greenlight(at, cheapestConceptId(at), 0, pkg.negative, pkg.marketing)).toThrow(
        /solvency gate/i,
      )
    }
  })
})

describe('D-17A/A — the standard scope is the same action at a MARKETING-heavier shape', () => {
  it('cash one dollar under the standard commitment: cheapest passes, standard fails, both actions agree', () => {
    const base = foundStudio('adv-a-standard')
    const scopes0 = affordabilityScopes(base)
    const cheap = scopes0.cheapestBreakdown!
    const std = scopes0.standardBreakdown!
    const stdCommitment = std.negative + std.marketing + std.freelancerFees
    expect(stdCommitment).toBeGreaterThan(cheap.negative + cheap.marketing + cheap.freelancerFees)

    const at = withCash(base, stdCommitment - 1)
    const scopes = affordabilityScopes(at)
    expect(scopes.standard!.affordable).toBe(false)
    expect(scopes.standard!.shortfall).toBe(1)
    expect(scopes.cheapest!.affordable).toBe(true)

    // The action agrees on BOTH sides of the same state.
    expect(() => greenlight(at, cheapestConceptId(at), 0, std.negative, std.marketing)).toThrow(
      /solvency gate/i,
    )
    const ok = greenlight(at, cheapestConceptId(at), 0, cheap.negative, cheap.marketing)
    expect(ok.studio.activeProductions.length).toBe(1)
  })

  it('a marketing-only shortfall: identical negative, one rung up, is rejected with the SAME reason string', () => {
    const base = foundStudio('adv-a-mkt')
    const cheap = affordabilityScopes(base).cheapestBreakdown!
    const at = withCash(base, cheap.negative + cheap.marketing) // affordable at the LOW rung
    expect(affordabilityScopes(at).cheapest!.affordable).toBe(true)

    // Same package, next marketing rung — nothing else changes.
    const activeMenu = marketingLevelsFor(at, null)
    const bumped = cheap.negative + activeMenu[1]
    const preview = commitmentPreview(at, bumped)
    expect(preview.affordable).toBe(false)
    expect(preview.cashAfter).toBeCloseTo(cheap.marketing - activeMenu[1], 6) // exactly the rung gap (FP negative cost is unrounded)

    let thrown = ''
    try {
      greenlight(at, cheapestConceptId(at), 0, cheap.negative, activeMenu[1])
    } catch (e) {
      thrown = (e as Error).message
    }
    expect(thrown).toContain(preview.reason!) // the surface quotes the engine's own reason verbatim
    expect(thrown).toMatch(/D-12 solvency gate/)
  })
})

describe('D-17A/A — the reported figures are hand-derivable from the grid and the ledger', () => {
  it('cheapest = grid[0] × cheapest concept × min shape demand × era scale + active marketing rung[0]', () => {
    const s = foundStudio('adv-a-hand')
    const scopes = affordabilityScopes(s)
    const quote = cheapestPackageQuote(s)!
    const negative = handCheapestNegative(s)

    expect(scopes.cheapestBreakdown!.negative).toBeCloseTo(negative, 8)
    expect(scopes.cheapestBreakdown!.marketing).toBe(quote.production.budget.marketing)
    expect(scopes.cheapestBreakdown!.freelancerFees).toBe(0)
    expect(scopes.cheapest!.commitment).toBe(Math.round(negative + quote.production.budget.marketing))
  })

  it('standard = grid[1] × cheapest concept × neutral demand × era scale + active marketing rung[1]', () => {
    const s = foundStudio('adv-a-hand')
    const scopes = affordabilityScopes(s)
    const quote = standardPackageQuote(s)!
    const negative = handStandardNegative(s)

    expect(scopes.standardBreakdown).toEqual({
      negative,
      marketing: quote.production.budget.marketing,
      freelancerFees: 0,
    })
    expect(scopes.standard!.commitment).toBe(Math.round(negative + quote.production.budget.marketing))
  })

  it('recentTypical is the MEDIAN committed cost of the last THREE releases, off the ledger', () => {
    let s = foundStudio('adv-a-typical')
    // Four releases with deliberately distinct commitments so the window is observable.
    const budgets: [number, number][] = [
      [2_000_000, 100_000], // oldest — MUST fall out of the window
      [2_500_000, 200_000],
      [3_000_000, 300_000],
      [3_500_000, 400_000],
    ]
    const cheapId = cheapestConceptId(s)
    budgets.forEach(([negative, marketing], i) => {
      s = greenlight(s, cheapId, i % 2, negative, marketing)
      for (let k = 0; k < 9; k++) s = tickCommittingReady(s)
    })
    expect(s.studio.releasedFilms.length).toBe(4)

    // Hand-derive: newest-first, positive only, last three, median.
    const costs = [...s.studio.releasedFilms]
      .sort((a, b) => b.releaseTick - a.releaseTick)
      .map((f) => ledgerCommittedCost(s, f.productionId))
      .filter((c) => c > 0)
    expect(costs.length).toBe(4)
    const lastThree = costs.slice(0, 3)
    expect(lastThree).toEqual([3_900_000, 3_300_000, 2_700_000]) // the oldest 2_100_000 is excluded
    const expected = median(lastThree)
    expect(expected).toBe(3_300_000)

    const claim = affordabilityScopes(s).recentTypical!
    expect(claim.commitment).toBe(Math.round(expected))

    // …and that figure obeys the same inclusive gate the action does.
    expect(affordabilityScopes(withCash(s, expected)).recentTypical!.affordable).toBe(true)
    const under = affordabilityScopes(withCash(s, expected - 1)).recentTypical!
    expect(under.affordable).toBe(false)
    expect(under.shortfall).toBe(1)
  })

  it('recentTypical is null before anything has released (no invented history)', () => {
    const s = foundStudio('adv-a-typical-empty')
    expect(affordabilityScopes(s).recentTypical).toBeNull()
  })
})
