// ── D-17A/T13 — the recap's ADDITIVE studio-economic fields ────────────────────
// Owner ruling R7 makes the player-facing headline studio-economic, so the D-15 recap gains a
// labelled managerial layer. It is ADDITIVE: `contribution`, `roi`, `classification`,
// `classifyContribution`, `totalFilmContribution`, `bestFilm`/`worstFilm` and every existing
// InflectionKind are untouched (condition C3) — the direct-cost figure is still the direct-cost
// figure, and payroll/overhead are still never folded into it (D-12 §3/§8).
//
// The load-bearing proof is the reconciliation line: the studio-level totals must satisfy
//     totalAllocatedFixedCost + idleFixedCost === totalLedgerFixedCost
// exactly, and that must equal the actual ledger.

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  TUNING,
  allocateFixedCosts,
  applyActions,
  beginFounding,
  classifyContribution,
  generateWorld,
  studioRunRecap,
  tick,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState } from '../src/core/index.js'

function foundStudio(seed: string): GameState {
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
  return applyActions(s, [{ kind: 'foundStudio' }])
}
function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts
    .map((c) => s.talent.find((t) => t.id === c.talentId)!)
    .filter((t) => t.role === role)
    .map((t) => t.id)
}
function greenlight(s: GameState, conceptIndex: number): GameState {
  const concept = s.concepts[conceptIndex]!
  const actors = rosterIds(s, 'actor')
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
        cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! } as Record<CastSlot, string>,
        craftIds: [rosterIds(s, 'craft')[0]!],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}
// P06A (charter W1): the hold law means "tick until released" spins forever without the
// explicit commitment. This commits every ready picture before each tick so this slate
// still releases on its original timeline — committing at the ready week adds NO week
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

function advance(s: GameState, n: number): GameState {
  let out = s
  for (let i = 0; i < n; i++) out = tickCommittingReady(out)
  return out
}

/** A run with two released films (sequential), some idle weeks, and a completed slate. */
function slate(seed: string): GameState {
  let s = foundStudio(seed)
  s = advance(s, 2) // idle before the first greenlight
  s = greenlight(s, 0)
  s = advance(s, TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 1)
  s = greenlight(s, 1)
  s = advance(s, TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 3)
  return s
}

describe('D-17A/T13 — recap fixed-cost reconciliation', () => {
  it('totalAllocated + idle === totalLedger, and that IS the ledger', () => {
    const s = slate('d17a-recap-a')
    const r = studioRunRecap(s)
    const cap = r.capital
    expect(cap.totalAllocatedFixedCost + cap.idleFixedCost).toBe(cap.totalLedgerFixedCost)
    expect(cap.totalLedgerFixedCost).toBe(cap.totalPayroll + cap.totalOverhead)
    let fromLedger = 0
    for (const e of s.ledger) if (e.kind === 'payroll' || e.kind === 'overhead') fromLedger -= e.amount
    expect(cap.totalLedgerFixedCost).toBe(fromLedger)
    expect(cap.idleFixedCost).toBeGreaterThan(0) // the fixture really does have idle weeks
    expect(cap.fixedCostAllocationBasis).toBe('ledgerProRata')
  })

  it('per-film allocations are integers, non-negative, and sum into the studio total', () => {
    const s = slate('d17a-recap-b')
    const r = studioRunRecap(s)
    expect(r.films.length).toBe(2)
    for (const f of r.films) {
      expect(Number.isInteger(f.allocatedFixedCost)).toBe(true)
      expect(f.allocatedFixedCost).toBeGreaterThan(0)
      expect(f.allocatedWeeks).toBeGreaterThan(0)
      expect(f.allocatedWeeks).toBeLessThanOrEqual(TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS)
      expect(f.allocationBasis).toBe('ledgerProRata')
    }
    const alloc = allocateFixedCosts(s)
    for (const f of r.films) {
      expect(f.allocatedFixedCost).toBe(alloc.perFilm[f.productionId]!.allocated)
      expect(f.allocatedWeeks).toBe(alloc.perFilm[f.productionId]!.allocatedWeeks)
    }
    // every released film's share is inside the studio total (which also covers in-flight work)
    const releasedSum = r.films.reduce((a, f) => a + f.allocatedFixedCost, 0)
    expect(releasedSum).toBeLessThanOrEqual(r.capital.totalAllocatedFixedCost)
  })

  it('studioEconomicResult is contribution − allocatedFixedCost, and is the HARSHER figure', () => {
    const s = slate('d17a-recap-c')
    const r = studioRunRecap(s)
    for (const f of r.films) {
      if (f.contribution == null) {
        expect(f.studioEconomicResult).toBeNull()
        continue
      }
      expect(f.studioEconomicResult).toBeCloseTo(f.contribution - f.allocatedFixedCost, 6)
      // fixed cost is real money, so the studio-economic view can only be worse
      expect(f.studioEconomicResult!).toBeLessThan(f.contribution)
    }
  })

  it('C3 — the DIRECT-cost layer is untouched by the additive fields', () => {
    const s = slate('d17a-recap-d')
    const r = studioRunRecap(s)
    for (const f of r.films) {
      // contribution is still Studio Revenue − committed cost, with NO fixed cost folded in
      expect(f.contribution).toBeCloseTo(f.studioRevenue! - f.committedCost!, 6)
      // classification still reads the DIRECT contribution, not the studio-economic one
      expect(f.classification).toBe(classifyContribution(f.contribution!, f.committedCost!))
      expect(f.roi).toBeCloseTo(Math.round((f.contribution! / f.committedCost!) * 100) / 100, 6)
    }
    // and the studio-level direct total is still Studio Revenue − committed cost
    expect(r.summary.totalFilmContribution).toBeCloseTo(
      r.capital.totalStudioRevenue - r.capital.totalCommitments,
      6,
    )
    // best/worst films are still ranked by the DIRECT contribution
    const byContribution = [...r.films].sort((a, b) => b.contribution! - a.contribution!)
    expect(r.summary.bestFilm!.productionId).toBe(byContribution[0]!.productionId)
    expect(r.summary.worstFilm!.productionId).toBe(byContribution[byContribution.length - 1]!.productionId)
  })

  it('reconciles on a studio with NO films at all (idle carries everything)', () => {
    const s = advance(foundStudio('d17a-recap-e'), 6)
    const r = studioRunRecap(s)
    expect(r.films).toHaveLength(0)
    expect(r.capital.totalAllocatedFixedCost).toBe(0)
    expect(r.capital.idleFixedCost).toBe(r.capital.totalLedgerFixedCost)
    expect(r.capital.totalLedgerFixedCost).toBeGreaterThan(0)
  })

  it('reconciles at week 0, before anything has been charged', () => {
    const r = studioRunRecap(foundStudio('d17a-recap-f'))
    expect(r.capital.totalLedgerFixedCost).toBe(0)
    expect(r.capital.totalAllocatedFixedCost).toBe(0)
    expect(r.capital.idleFixedCost).toBe(0)
  })
})
