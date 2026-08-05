// ── D-15 Studio Run Recap — pure read-model tests ─────────────────────────────
// Every expectation is derived from the D-15 owner directive + the D-12 economy
// contract (contribution = Studio Revenue − committed cost; payroll/overhead not
// allocated per film) — not from the implementation. States are built by the REAL
// engine (found → greenlight → tick to completion), never hand-synthesized, so the
// recap is checked against authoritative frozen records.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  classifyContribution,
  financeTotals,
  generateWorld,
  studioRunRecap,
  tick,
  TUNING,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState } from '../src/core/index.js'

// ── real-engine found → cast → release helpers (mirrors d14-star-power.test.ts) ──
function foundEngaged(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const need: Record<CreativeRole, number> = { writer: 1, director: 1, actor: 3, craft: 1 }
  for (const role of ['actor', 'director', 'writer', 'craft'] as CreativeRole[]) {
    for (const t of pool.filter((x) => x.role === role).slice(0, need[role])) {
      s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 208 }])
    }
  }
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function contractedByRole(s: GameState) {
  const c = s.contracts.map((k) => s.talent.find((t) => t.id === k.talentId)!)
  const actors = c.filter((t) => t.role === 'actor').sort((a, b) => a.fame - b.fame)
  return {
    actors,
    writer: c.find((t) => t.role === 'writer')!,
    director: c.find((t) => t.role === 'director')!,
    craft: c.find((t) => t.role === 'craft')!,
  }
}

function releaseOneFilm(s0: GameState, leadId: string, negative = 5_000_000, marketing = 1_000_000): GameState {
  const { actors, writer, director, craft } = contractedByRole(s0)
  const others = actors.filter((a) => a.id !== leadId)
  const concept = s0.concepts[0]!
  let s = applyActions(s0, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'escalation', ending: 'triumph' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: writer.id,
        directorId: director.id,
        cast: { lead: leadId, antagonist: others[0]!.id, support: others[1]!.id } as Record<CastSlot, string>,
        craftIds: [craft.id],
        budget: { negative, marketing },
      },
    },
  ])
  const pid = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
  for (let k = 0; k < TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 8; k++) {
    s = tick(s, { develop: true })
    const run = s.theatricalRuns.find((r) => r.productionId === pid)
    if (run && run.status !== 'active') break
  }
  return s
}

/** Found a studio and release `n` films, all led by the same (lowest-fame) actor. */
function buildRun(seed: string, n: number): GameState {
  let s = foundEngaged(seed)
  const leadId = contractedByRole(s).actors[0]!.id
  for (let i = 0; i < n; i++) s = releaseOneFilm(s, leadId)
  return s
}

const clone = (s: GameState) => JSON.parse(JSON.stringify(s)) as GameState

describe('studioRunRecap — purity & determinism', () => {
  it('never mutates the state and does not advance the RNG', () => {
    const s = buildRun('recap-purity', 2)
    const before = JSON.stringify(s)
    const rngBefore = s.rngState
    studioRunRecap(s)
    expect(JSON.stringify(s)).toBe(before)
    expect(s.rngState).toBe(rngBefore)
  })

  it('is deterministic — same state → deep-equal recap', () => {
    const s = buildRun('recap-determinism', 2)
    expect(studioRunRecap(s)).toEqual(studioRunRecap(clone(s)))
  })

  it('does not recompute career events (frozen ledger preserved)', () => {
    const s = buildRun('recap-frozen', 2)
    const events = JSON.stringify(s.careerEvents)
    studioRunRecap(s)
    expect(JSON.stringify(s.careerEvents)).toBe(events)
  })
})

describe('studioRunRecap — capital reconciliation (D-12 §3)', () => {
  it('starting cash reconciles to INITIAL_CASH via the ledger invariant', () => {
    const s = buildRun('recap-start', 2)
    const r = studioRunRecap(s)
    expect(Math.round(r.summary.startingCash)).toBe(TUNING.INITIAL_CASH)
    // cashChange == Σ ledger (reconciliation)
    expect(Math.round(r.summary.cashChange)).toBe(Math.round(financeTotals(s).net))
  })

  it('per-film contributions sum to total film contribution (studio-revenue basis)', () => {
    const s = buildRun('recap-sum', 3)
    const r = studioRunRecap(s)
    const sum = r.films.reduce((a, f) => a + (f.contribution ?? 0), 0)
    expect(Math.abs(sum - r.summary.totalFilmContribution)).toBeLessThan(1) // whole-dollar rounding
  })

  it('total commitments = production + freelancer ledger; contribution = revenue − commitments', () => {
    const s = buildRun('recap-totals', 2)
    const r = studioRunRecap(s)
    const t = financeTotals(s)
    expect(Math.round(r.capital.totalCommitments)).toBe(Math.round(-(t.production + t.freelancerFee)))
    expect(Math.round(r.capital.totalStudioRevenue)).toBe(Math.round(t.studioRevenue))
    expect(Math.round(r.capital.totalFilmContribution)).toBe(
      Math.round(r.capital.totalStudioRevenue - r.capital.totalCommitments),
    )
  })

  it('current weekly burn = payroll + overhead (payroll/overhead NOT allocated per film)', () => {
    const s = buildRun('recap-burn', 1)
    const r = studioRunRecap(s)
    expect(Math.round(r.capital.currentWeeklyBurn)).toBe(
      Math.round(r.capital.currentWeeklyPayroll + r.capital.currentWeeklyOverhead),
    )
  })
})

describe('studioRunRecap — film slate', () => {
  it('lists every released film, chronological, with consistent classification', () => {
    const s = buildRun('recap-slate', 3)
    const r = studioRunRecap(s)
    expect(r.films.length).toBe(s.studio.releasedFilms.length)
    for (let i = 1; i < r.films.length; i++) {
      expect(r.films[i]!.releaseWeek).toBeGreaterThanOrEqual(r.films[i - 1]!.releaseWeek)
    }
    for (const f of r.films) {
      if (f.contribution == null) {
        expect(f.classification).toBe('unknown')
      } else {
        expect(f.classification).toBe(classifyContribution(f.contribution, f.committedCost ?? 0))
      }
    }
    expect(r.summary.profitableFilmCount + r.summary.breakEvenFilmCount + r.summary.lossFilmCount).toBe(r.films.length)
  })
})

describe('studioRunRecap — talent development (frozen careerEvents only)', () => {
  it('one talent entry per distinct contributor in the career ledger', () => {
    const s = buildRun('recap-talent', 2)
    const r = studioRunRecap(s)
    const distinct = new Set(s.careerEvents.map((e) => e.talentId))
    expect(r.talent.length).toBe(distinct.size)
    for (const t of r.talent) {
      // begin→current derived from the first/last frozen event
      expect(typeof t.startOVR).toBe('number')
      expect(t.assignments).toBeGreaterThan(0)
      expect(t.positiveStarEvents + t.negligibleStarEvents + t.negativeStarEvents).toBe(t.assignments)
    }
  })
})

describe('studioRunRecap — strategy concentration', () => {
  it('detects a single recurring lead across the slate', () => {
    const s = buildRun('recap-conc', 3)
    const r = studioRunRecap(s)
    expect(r.concentration.filmCount).toBe(3)
    expect(r.concentration.topLead).not.toBeNull()
    expect(r.concentration.topLead!.count).toBe(3) // same lead every film
    expect(r.concentration.topLead!.share).toBeCloseTo(1, 5)
    // same single concept → one genre dominates
    expect(r.concentration.topGenre!.share).toBeCloseTo(1, 5)
  })
})

describe('studioRunRecap — current position & recovery classification', () => {
  it('healthy when a typical film is affordable and cash is not shrinking pressure', () => {
    const s = buildRun('recap-pos', 2)
    // give plenty of cash so both cheapest and typical are affordable
    const rich: GameState = { ...s, studio: { ...s.studio, cash: 200_000_000 } }
    const r = studioRunRecap(rich)
    expect(r.position.cheapest!.affordable).toBe(true)
    expect(r.position.typicalRecent!.affordable).toBe(true)
    expect(['healthy', 'constrained']).toContain(r.position.recovery)
  })

  it('noNormalProduction when cash cannot afford even the cheapest legal film', () => {
    const s = buildRun('recap-broke', 2)
    const broke: GameState = { ...s, studio: { ...s.studio, cash: 1 } }
    const r = studioRunRecap(broke)
    expect(r.position.cheapest!.affordable).toBe(false)
    expect(r.position.cheapest!.shortfall).toBeGreaterThan(0)
    expect(r.position.recovery).toBe('noNormalProduction')
    expect(r.position.recoveryReasons.length).toBeGreaterThan(0)
  })

  it('distinguishes cash-positive from able-to-finance-a-normal-film', () => {
    const s = buildRun('recap-tight', 3)
    const r0 = studioRunRecap(s)
    const cheapest = r0.position.cheapest!.commitment
    const typical = r0.position.typicalRecent!.commitment
    // set cash between cheapest and typical → cash positive, cheapest ok, typical not
    const tight: GameState = { ...s, studio: { ...s.studio, cash: (cheapest + typical) / 2 } }
    const r = studioRunRecap(tight)
    expect(r.position.currentCash).toBeGreaterThan(0)
    expect(r.position.cheapest!.affordable).toBe(true)
    expect(r.position.typicalRecent!.affordable).toBe(false)
    expect(r.position.typicalRecent!.shortfall).toBeGreaterThan(0)
    expect(r.warnings.some((w) => w.code === 'cashPositiveButNormalUnaffordable')).toBe(true)
  })

  it('reports incomplete when no films have been released', () => {
    const s = foundEngaged('recap-empty')
    const r = studioRunRecap(s)
    expect(r.films.length).toBe(0)
    expect(r.position.recovery).toBe('incomplete')
  })
})

describe('studioRunRecap — warnings & inflection points are structured, prioritised, bounded', () => {
  it('warnings carry code/severity/priority and are sorted by priority', () => {
    const s = buildRun('recap-warn', 3)
    const tight: GameState = { ...s, studio: { ...s.studio, cash: 1 } }
    const r = studioRunRecap(tight)
    for (const w of r.warnings) {
      expect(['important', 'caution', 'observation']).toContain(w.severity)
      expect(w.priority).toBeGreaterThan(0)
    }
    // sorted ascending by priority (highest importance first)
    for (let i = 1; i < r.warnings.length; i++) {
      expect(r.warnings[i]!.priority).toBeGreaterThanOrEqual(r.warnings[i - 1]!.priority)
    }
    // the top-priority warning under this broke state is that no NORMALLY-funded film is affordable
    expect(r.warnings[0]!.code).toBe('standardFilmUnaffordable')
  })

  it('inflection points are structured and capped, and open with the opening balance', () => {
    const s = buildRun('recap-infl', 3)
    const r = studioRunRecap(s)
    expect(r.inflectionPoints.length).toBeLessThanOrEqual(7)
    expect(r.inflectionPoints[0]!.kind).toBe('openingBalance')
    expect(Math.round(r.inflectionPoints[0]!.value)).toBe(TUNING.INITIAL_CASH)
    for (const p of r.inflectionPoints) expect(typeof p.value).toBe('number')
  })
})

describe('studioRunRecap — break-even classification', () => {
  it('classifies a negligible-return film as break-even, not profit', () => {
    // near-zero: within max($25k, 1% of commitment)
    expect(classifyContribution(8_000, 10_000_000)).toBe('breakEven') // 0.08% of commit
    expect(classifyContribution(-500, 30_000)).toBe('breakEven') // under the $25k floor
    // a meaningful positive/negative is NOT break-even
    expect(classifyContribution(530_000, 6_300_000)).toBe('positive') // 8.4% of commit
    expect(classifyContribution(-3_000_000, 4_400_000)).toBe('loss')
  })

  it('summary profit/break-even/loss counts partition the slate', () => {
    const s = buildRun('recap-partition', 3)
    const r = studioRunRecap(s)
    expect(r.summary.profitableFilmCount + r.summary.breakEvenFilmCount + r.summary.lossFilmCount).toBe(r.films.length)
  })
})

describe('studioRunRecap — capital timeline semantics', () => {
  it('exposes an opening balance distinct from end-of-week closes', () => {
    const s = buildRun('recap-timeline', 2)
    const r = studioRunRecap(s)
    expect(Math.round(r.capital.openingBalance)).toBe(TUNING.INITIAL_CASH)
    // end-of-week rows are post-ledger; week 0's close is below the opening after commitments
    const wk0 = r.capital.cashTimeline.find((c) => c.week === 0)
    if (wk0) expect(wk0.cash).toBeLessThan(r.capital.openingBalance)
  })

  it('contract-horizon-vs-runway flag is exposed for the current position', () => {
    const s = buildRun('recap-contract', 3)
    const broke: GameState = { ...s, studio: { ...s.studio, cash: 2_000_000 } }
    const r = studioRunRecap(broke)
    expect(typeof r.position.contractsOutliveRunway).toBe('boolean')
    expect(typeof r.position.waitingAloneWorsens).toBe('boolean')
  })
})

describe('studioRunRecap — authoritative affordability (bare-minimum vs standard film)', () => {
  it('exposes a bare-minimum package and a costlier standard film, with a reconciling breakdown', () => {
    const s = buildRun('recap-afford', 2)
    const r = studioRunRecap(s)
    expect(r.position.cheapest).not.toBeNull()
    expect(r.position.cheapestBreakdown).not.toBeNull()
    const b = r.position.cheapestBreakdown!
    // the all-in commitment reconciles to its mandatory components (negative + marketing + fees)
    expect(r.position.cheapest!.commitment).toBe(Math.round(b.negative + b.marketing + b.freelancerFees))
    // a standard-budget film is strictly more expensive than the bare minimum
    expect(r.position.standard!.commitment).toBeGreaterThan(r.position.cheapest!.commitment)
    expect(typeof r.position.contractedRosterCanFieldFilm).toBe('boolean')
  })

  it('a contracted roster that fields a film needs no freelancer fees', () => {
    const s = buildRun('recap-afford-roster', 1)
    const r = studioRunRecap(s)
    expect(r.position.contractedRosterCanFieldFilm).toBe(true)
    expect(r.position.cheapestBreakdown!.freelancerFees).toBe(0)
  })
})
