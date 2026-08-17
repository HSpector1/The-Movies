// ── D-17A INDEPENDENT ADVERSARIAL TESTS — C. THE ENGAGEMENT CLIFF (R2) ────────
// Owner ruling R2 (docs/D-16-OWNER-RULINGS.md §2): engagement is "an explicit, persisted,
// monotonic gameplay fact; never derive enduring regime membership solely from mutable
// current collections." Contract T10: "Natural-expiry and fire-everyone no longer switch
// the economy off; active runs keep paying; the solvency gate stays enforced; overhead
// continues."  Ruling R3: `releaseTalent` stays UNGATED — a termination may intentionally
// drive current cash below zero.
//
// Both ways a studio can end up with zero contracts are driven here on REAL states, and
// the same four consequences are asserted on each:
//   1. overhead keeps being debited AFTER the last contract is gone;
//   2. an active theatrical run keeps paying weekly Studio Revenue to completion — no
//      frozen run, and never the headless single-lump `boxOffice` credit;
//   3. a later greenlight is judged by the ENGAGED branch (D-11.12 roster legality or the
//      D-12 solvency gate) — proven by the thrown message;
//   4. `economyEngaged(state)` is true at every step in between.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  economyEngaged,
  freelancerFee,
  freelancerMarketIds,
  generateWorld,
  tick,
  TUNING,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState } from '../src/core/index.js'

const ROSTER: Record<CreativeRole, number> = { actor: 6, director: 2, writer: 2, craft: 2 }

function foundStudio(seed: string, term: number): GameState {
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

function greenlight(s: GameState, negative: number, marketing: number): GameState {
  const a = rosterOf(s, 'actor')
  const w = rosterOf(s, 'writer')
  const d = rosterOf(s, 'director')
  const c = rosterOf(s, 'craft')
  const concept = s.concepts[0]!
  const out = applyActions(s, [
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
        writerId: w[0]!.id,
        directorId: d[0]!.id,
        cast: { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id } as Record<CastSlot, string>,
        craftIds: [c[0]!.id],
        budget: { negative, marketing },
      },
    },
  ])
  expect(out.studio.activeProductions.length).toBe(s.studio.activeProductions.length + 1)
  return out
}

/** A greenlight attempt using whatever people exist in the world — the studio has no roster left. */
function attemptGreenlightWithNoRoster(s: GameState): string {
  const actors = s.talent.filter((t) => t.role === 'actor').slice(0, 3)
  try {
    applyActions(s, [
      {
        kind: 'greenlight',
        production: {
          conceptId: s.concepts[0]!.id,
          shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
          promise: {
            genre: s.concepts[0]!.genre,
            intendedSegments: ['adult'],
            ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
          },
          writerId: s.talent.find((t) => t.role === 'writer')!.id,
          directorId: s.talent.find((t) => t.role === 'director')!.id,
          cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<
            CastSlot,
            string
          >,
          craftIds: [s.talent.find((t) => t.role === 'craft')!.id],
          budget: { negative: 1_000_000, marketing: 100_000 },
        },
      },
    ])
  } catch (e) {
    return (e as Error).message
  }
  return '' // no rejection at all
}

/** Advance, asserting the persisted regime fact never flips on the way. */
function advanceEngaged(s: GameState, n: number): GameState {
  let out = s
  for (let i = 0; i < n; i++) {
    out = tick(out)
    expect(economyEngaged(out)).toBe(true)
  }
  return out
}

const overheadAt = (s: GameState, week: number) =>
  s.ledger.filter((e) => e.kind === 'overhead' && e.week === week)

function withCashIdentity(state: GameState, cash: number): GameState {
  const amount = cash - state.studio.cash
  return {
    ...state,
    studio: { ...state.studio, cash },
    ledger: [
      ...state.ledger,
      {
        week: state.market.tick,
        kind: amount >= 0 ? ('studioRevenue' as const) : ('overhead' as const),
        amount,
        note: 'test fixture cash identity adjustment',
      },
    ],
  }
}

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17A/C — path 1: every contract expires NATURALLY', () => {
  // 52-week (CONTRACT_MIN_WEEKS) terms signed at week 0 → all expire entering week 52.
  // A film greenlit at week 48 releases at week 56 — AFTER the last contract is gone.
  function run(): GameState {
    let s = foundStudio('adv-c-natural', TUNING.CONTRACT_MIN_WEEKS)
    expect(s.contracts.every((c) => c.endWeekExclusive === TUNING.CONTRACT_MIN_WEEKS)).toBe(true)
    s = advanceEngaged(s, 48)
    expect(s.contracts.length).toBe(ROSTER.actor + ROSTER.director + ROSTER.writer + ROSTER.craft)
    s = greenlight(s, 1_000_000, 100_000)
    return advanceEngaged(s, 16) // through expiry (52), release (56) and the whole run
  }

  it('leaves zero contracts and still reports the economy as engaged', () => {
    const s = run()
    expect(s.contracts.length).toBe(0)
    expect(s.market.tick).toBe(64)
    expect(economyEngaged(s)).toBe(true)
    expect(s.economyEngagedEver).toBe(true)
  })

  it('keeps debiting weekly overhead after the last expiry (the base charge survives)', () => {
    const s = run()
    for (const week of [52, 55, 60, 63]) {
      const entries = overheadAt(s, week)
      expect(entries.length).toBe(1)
      // no employees left, so the charge is exactly the fixed base
      expect(entries[0]!.amount).toBe(-TUNING.OVERHEAD_BASE)
    }
    // and payroll correctly stops (there is nobody to pay) — overhead is NOT payroll
    expect(s.ledger.filter((e) => e.kind === 'payroll' && e.week >= 52).length).toBe(0)
  })

  it('opens and PAYS the post-cliff release weekly — no lump, no frozen run', () => {
    const s = run()
    const run0 = s.theatricalRuns.find((r) => r.productionId === s.studio.releasedFilms[0]!.productionId)!
    expect(run0.releaseTick).toBe(56) // released with zero contracts on the books
    expect(run0.economyModelVersion).toBe(TUNING.ECONOMY_MODEL_VERSION) // the D-12 model, not legacy
    expect(run0.status).toBe('completed')
    expect(run0.weekIndex).toBe(run0.totalWeeks) // not frozen

    expect(s.ledger.filter((e) => e.kind === 'boxOffice').length).toBe(0) // never the headless lump
    const paid = s.ledger.filter((e) => e.kind === 'studioRevenue' && e.productionId === run0.productionId)
    expect(paid.length).toBe(run0.totalWeeks) // exactly one payment per theatrical week
    expect(paid.map((e) => e.week)).toEqual(
      Array.from({ length: run0.totalWeeks }, (_, i) => run0.releaseTick + i),
    )
    const gross = run0.weeklyGross.reduce((a, b) => a + b, 0)
    expect(run0.cumulativeStudioRevenuePaid).toBeCloseTo(gross * TUNING.STUDIO_RENTAL_BLENDED, 2)
  })

  it('judges a later greenlight by the ENGAGED branch (D-11.12 / the solvency gate)', () => {
    const s = run()
    const message = attemptGreenlightWithNoRoster(s)
    expect(message).not.toBe('') // the attempt is rejected, not silently accepted
    expect(message).toMatch(/D-11\.12|D-11\.13|D-12 solvency gate/)
  })
})

describe('D-17A/C — path 2: the studio FIRES EVERYONE mid-run', () => {
  function run(): { fired: GameState; finished: GameState } {
    let s = foundStudio('adv-c-fire', 156)
    s = greenlight(s, 1_500_000, 100_000)
    s = advanceEngaged(s, 10) // released at week 8; the run is active with weeks still owed
    const active = s.theatricalRuns.find((r) => r.status === 'active')
    expect(active).toBeDefined()
    expect(active!.weekIndex).toBeLessThan(active!.totalWeeks)

    for (const c of [...s.contracts]) {
      s = applyActions(s, [{ kind: 'releaseTalent', talentId: c.talentId }])
      expect(economyEngaged(s)).toBe(true)
    }
    const fired = s
    return { fired, finished: advanceEngaged(fired, 8) }
  }

  it('leaves zero contracts and still reports the economy as engaged', () => {
    const { fired, finished } = run()
    expect(fired.contracts.length).toBe(0)
    expect(economyEngaged(fired)).toBe(true)
    expect(finished.contracts.length).toBe(0)
    expect(economyEngaged(finished)).toBe(true)
  })

  it('keeps debiting weekly overhead after the firing', () => {
    const { fired, finished } = run()
    for (let week = fired.market.tick; week < finished.market.tick; week++) {
      const entries = overheadAt(finished, week)
      expect(entries.length).toBe(1)
      expect(entries[0]!.amount).toBe(-TUNING.OVERHEAD_BASE)
    }
  })

  it('pays the ALREADY-ACTIVE run to completion — no lump, no frozen run', () => {
    const { fired, finished } = run()
    const id = fired.studio.releasedFilms[0]!.productionId
    const before = fired.theatricalRuns.find((r) => r.productionId === id)!
    const after = finished.theatricalRuns.find((r) => r.productionId === id)!

    expect(after.status).toBe('completed')
    expect(after.weekIndex).toBe(after.totalWeeks)
    expect(after.weekIndex).toBeGreaterThan(before.weekIndex) // it kept moving after the firing
    expect(finished.ledger.filter((e) => e.kind === 'boxOffice').length).toBe(0)
    const paid = finished.ledger.filter((e) => e.kind === 'studioRevenue' && e.productionId === id)
    expect(paid.length).toBe(after.totalWeeks)
    // the weeks credited AFTER the roster was gone were really paid
    expect(paid.filter((e) => e.week >= fired.market.tick).length).toBe(after.totalWeeks - before.weekIndex)
  })

  it('judges a later greenlight by the ENGAGED branch (D-11.12 / the solvency gate)', () => {
    const { finished } = run()
    const message = attemptGreenlightWithNoRoster(finished)
    expect(message).not.toBe('')
    expect(message).toMatch(/D-11\.12|D-11\.13|D-12 solvency gate/)
  })

  it('R3: firing everyone is UNGATED and may legally drive cash below zero', () => {
    let s = foundStudio('adv-c-r3', 156)
    s = withCashIdentity(s, 1_000) // termination costs will dwarf this
    expect(s.contracts.length).toBeGreaterThan(0)
    for (const c of [...s.contracts]) {
      s = applyActions(s, [{ kind: 'releaseTalent', talentId: c.talentId }]) // must NOT throw
    }
    expect(s.contracts.length).toBe(0)
    expect(s.studio.cash).toBeLessThan(0) // the intended exception to D-12.11
    expect(economyEngaged(s)).toBe(true) // …and the studio is still a studio
    // the whole cost is on the ledger as terminations — nothing vanished
    const term = s.ledger.filter((e) => e.kind === 'termination')
    expect(term.length).toBe(ROSTER.actor + ROSTER.director + ROSTER.writer + ROSTER.craft)
    expect(1_000 + term.reduce((a, e) => a + e.amount, 0)).toBe(s.studio.cash)
  })
})

describe('D-17A/C — post-cliff, the ENGAGED greenlight branch is fully live, gate included', () => {
  // Seed `fc-4` is chosen because at week 52 — the tick the last 52-week contract expires —
  // the rotating freelancer market happens to contain a legal crew (writer + director +
  // 3 actors + 1 craft lead). That lets the D-11.12 branch be satisfied with ZERO contracts,
  // so the engaged branch's OTHER rules can be tested on a rosterless studio.
  function postCliffWithLegalFreelancers() {
    let s = foundStudio('fc-4', TUNING.CONTRACT_MIN_WEEKS)
    s = advanceEngaged(s, 52)
    expect(s.contracts.length).toBe(0)
    expect(economyEngaged(s)).toBe(true)

    const market = s.talent.filter((t) => new Set(freelancerMarketIds(s)).has(t.id))
    const pick = (role: CreativeRole, n: number) => market.filter((t) => t.role === role).slice(0, n)
    const writer = pick('writer', 1)[0]!
    const director = pick('director', 1)[0]!
    const craft = pick('craft', 1)[0]!
    const actors = pick('actor', 3)
    expect(actors.length).toBe(3)

    const fees = [writer, director, ...actors, craft].reduce((a, t) => a + freelancerFee(s, t), 0)
    const commitment = 1_000_000 + 100_000 + fees
    const attempt = (st: GameState): GameState =>
      applyActions(st, [
        {
          kind: 'greenlight',
          production: {
            conceptId: st.concepts[0]!.id,
            shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
            promise: {
              genre: st.concepts[0]!.genre,
              intendedSegments: ['adult'],
              ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
            },
            writerId: writer.id,
            directorId: director.id,
            cast: {
              lead: actors[0]!.id,
              antagonist: actors[1]!.id,
              support: actors[2]!.id,
            } as Record<CastSlot, string>,
            craftIds: [craft.id],
            budget: { negative: 1_000_000, marketing: 100_000 },
          },
        },
      ])
    return { s, commitment, attempt }
  }

  it('charges the engaged freelancer fees and enforces the D-12 solvency gate at the boundary', () => {
    const { s, commitment, attempt } = postCliffWithLegalFreelancers()

    const ok = attempt(withCashIdentity(s, commitment))
    expect(ok.studio.activeProductions.length).toBe(1)
    expect(ok.studio.cash).toBe(0)
    expect(ok.ledger.filter((e) => e.kind === 'freelancerFee').length).toBe(6) // the ENGAGED cost model

    expect(() => attempt(withCashIdentity(s, commitment - 1))).toThrow(
      /D-12 solvency gate/,
    )
  })

  it('and that rosterless film still releases into a D-12 theatrical run, never a lump', () => {
    const { s, commitment, attempt } = postCliffWithLegalFreelancers()
    const done = advanceEngaged(attempt(withCashIdentity(s, commitment)), 16)
    const run0 = done.theatricalRuns[0]!
    expect(run0.economyModelVersion).toBe(TUNING.ECONOMY_MODEL_VERSION)
    expect(run0.status).toBe('completed')
    expect(done.ledger.filter((e) => e.kind === 'boxOffice').length).toBe(0)
    expect(
      done.ledger.filter((e) => e.kind === 'studioRevenue' && e.productionId === run0.productionId).length,
    ).toBe(run0.totalWeeks)
  })
})

describe('D-17A/C — the regime fact is MONOTONIC (never cleared by any of these paths)', () => {
  it('stays true from founding, through a full expiry, a firing, and further play', () => {
    let s = foundStudio('adv-c-monotonic', TUNING.CONTRACT_MIN_WEEKS)
    expect(economyEngaged(s)).toBe(true)
    s = advanceEngaged(s, 60) // past natural expiry of every contract
    expect(s.contracts.length).toBe(0)
    expect(economyEngaged(s)).toBe(true)
    s = advanceEngaged(s, 40) // long after — nothing re-derives the regime away
    expect(economyEngaged(s)).toBe(true)
    expect(s.economyEngagedEver).toBe(true)
  })

  it('a never-engaged headless world stays DISENGAGED (the M0A regime is untouched)', () => {
    const w = generateWorld('adv-c-headless')
    expect(economyEngaged(w)).toBe(false)
    expect(w.economyEngagedEver).toBe(false)
    expect(economyEngaged(tick(tick(w)))).toBe(false)
  })
})
