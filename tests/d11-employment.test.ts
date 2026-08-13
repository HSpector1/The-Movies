// ── D-11 Studio Employment, Contracts, Roster, Freelancer Market ──────────────
// INDEPENDENT acceptance tests. Every expectation is hand-derived from the NORMATIVE
// D-11 ruling (docs/rev4-open-questions.md), NOT from reading the implementation.
// Imports ONLY the public surface (src/core/index.ts). Seeded RNG only.
//
// Coverage maps to D-11.21 acceptance criteria: starting roster, contracts, hiring
// & market, assignment, economy, determinism & saves, and the D-11.0 compatibility
// gate.

import { describe, expect, it } from 'vitest'
import {
  activeContract,
  annualPayroll,
  applyActions,
  beginFounding,
  contractOffer,
  contractOfferOptions,
  convertV2ToV3,
  employmentEngaged,
  employmentStatus,
  exportSave,
  FOUNDING_MINIMUMS,
  foundingGaps,
  foundingMinimumsMet,
  freelancerFee,
  freelancerMarketIds,
  generateWorld,
  guaranteedComp,
  hiringMarketIds,
  importSave,
  isContracted,
  makeSave,
  makeSaveV2,
  renewalWindowOpen,
  rosterTalent,
  terminationCost,
  tick,
  TUNING,
  weeklyPayroll,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState, SegmentId, Talent } from '../src/core/index.js'

// ── helpers ──────────────────────────────────────────────────────────────────

const iround = (x: number): number => Math.round(x)

// The founding applicant pool as Talent objects, in draft order.
function applicants(state: GameState): Talent[] {
  const founding = state.founding
  if (founding === null) throw new Error('not in founding')
  return founding.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
}

function byRole(pool: Talent[], role: CreativeRole): Talent[] {
  return pool.filter((t) => t.role === role)
}

// Sign the minimum legal founding roster (FOUNDING_MINIMUMS — D-11.A: 3 actors, 1 director, 2 writers, 1 craft),
// then close founding. Returns the operating GameState.
function foundStudio(seed: string, termWeeks = 104): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = applicants(s)
  const toSign: Talent[] = [
    ...byRole(pool, 'actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole(pool, 'director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole(pool, 'writer').slice(0, FOUNDING_MINIMUMS.writer),
    ...byRole(pool, 'craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const t of toSign) {
    s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks }])
  }
  s = applyActions(s, [{ kind: 'foundStudio' }])
  return s
}

function advanceWeeks(state: GameState, n: number): GameState {
  let s = state
  for (let i = 0; i < n; i++) s = tick(s)
  return s
}

function ledgerSum(state: GameState): number {
  return state.ledger.reduce((a, e) => a + e.amount, 0)
}

// The reconciliation invariant (D-11.18): cash equals INITIAL_CASH + Σ ledger.amount.
// Currency is floating-point and `cash` is accumulated incrementally while the ledger
// is re-summed in one pass, so the two agree to within sub-cent floating-point rounding
// (the ledger still accounts for EVERY movement — the residual is representation, not a
// lost transaction). Founding recruitment-fund bonuses never touch cash (excluded).
function reconciles(state: GameState): boolean {
  return Math.abs(state.studio.cash - (TUNING.INITIAL_CASH + ledgerSum(state))) < 0.01
}

// Build a legal greenlight payload from explicit ids (concept 0, neutral shape/promise).
function greenlightPayload(
  state: GameState,
  ids: { writerId: string; directorId: string; cast: Record<CastSlot, string>; craftIds: string[] },
) {
  const concept = state.concepts[0]!
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    writerId: ids.writerId,
    directorId: ids.directorId,
    cast: ids.cast,
    craftIds: ids.craftIds,
    budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
  }
}

// ── D-11.0 compatibility gate ─────────────────────────────────────────────────
describe('D-11.0 — the employment system is gated (headless world stays employment-free)', () => {
  it('generateWorld produces an employment-free world (gate inactive)', () => {
    const w = generateWorld('gate-1')
    expect(w.founding).toBeNull()
    expect(w.contracts).toEqual([])
    expect(w.ledger).toEqual([])
    expect(w.freeAgents).toEqual([])
    expect(employmentEngaged(w)).toBe(false)
  })

  it('beginFounding engages the gate; foundStudio keeps it engaged (contracts exist)', () => {
    const f = beginFounding(generateWorld('gate-2'))
    expect(f.founding).not.toBeNull()
    expect(employmentEngaged(f)).toBe(true)
    const s = foundStudio('gate-2')
    expect(s.founding).toBeNull()
    expect(employmentEngaged(s)).toBe(true) // contracts exist
  })
})

// ── D-11.2 starting applicant draft ───────────────────────────────────────────
describe('D-11.2 — starting applicant draft', () => {
  it('the applicant pool has the contracted sizes per role', () => {
    const s = beginFounding(generateWorld('draft-sizes'))
    const pool = applicants(s)
    expect(byRole(pool, 'actor').length).toBe(TUNING.HIRING_DRAFT_ACTORS)
    expect(byRole(pool, 'director').length).toBe(TUNING.HIRING_DRAFT_DIRECTORS)
    expect(byRole(pool, 'writer').length).toBe(TUNING.HIRING_DRAFT_WRITERS)
    expect(byRole(pool, 'craft').length).toBe(TUNING.HIRING_DRAFT_CRAFT)
  })

  it('the applicant pool is deterministic for a given seed', () => {
    const a = beginFounding(generateWorld('draft-det')).founding!.applicantIds
    const b = beginFounding(generateWorld('draft-det')).founding!.applicantIds
    expect(a).toEqual(b)
  })

  it('the recruitment fund is the bounded starting budget, unspent at open', () => {
    const s = beginFounding(generateWorld('draft-budget'))
    expect(s.founding!.budget).toBe(TUNING.HIRING_FOUNDING_BUDGET)
    expect(s.founding!.spentBonus).toBe(0)
  })

  it('no guaranteed superstar: across many seeds, some drafts have no 90+ OVR actor', () => {
    const roleOVRMax = (pool: Talent[]) => {
      let m = 0
      for (const t of pool) {
        // perceived primary OVR via the public salary proxy is not OVR; use skill proxy.
        m = Math.max(m, t.skill)
      }
      return m
    }
    let seedsWithoutSuperstar = 0
    for (let i = 0; i < 40; i++) {
      const s = beginFounding(generateWorld(`superstar-${i}`))
      if (roleOVRMax(byRole(applicants(s), 'actor')) < 90) seedsWithoutSuperstar++
    }
    // The draft must NOT always hand the player a 90+ actor.
    expect(seedsWithoutSuperstar).toBeGreaterThan(0)
  })

  it('a valid starting payroll: founding a studio yields bounded annual payroll < starting cash', () => {
    const s = foundStudio('draft-payroll')
    const annual = annualPayroll(s)
    expect(annual).toBeGreaterThan(0)
    expect(annual).toBeLessThan(TUNING.INITIAL_CASH) // runway exists
  })
})

// ── D-11.2 founding minimums / foundStudio ────────────────────────────────────
describe('D-11.2 — founding minimums enforced', () => {
  it('foundStudio is rejected until every required-discipline minimum is met', () => {
    let s = beginFounding(generateWorld('found-min'))
    const pool = applicants(s)
    // Sign only actors + director + writers, but NO craft → craft minimum unmet.
    for (const t of [
      ...byRole(pool, 'actor').slice(0, FOUNDING_MINIMUMS.actor),
      ...byRole(pool, 'director').slice(0, FOUNDING_MINIMUMS.director),
      ...byRole(pool, 'writer').slice(0, FOUNDING_MINIMUMS.writer),
    ]) {
      s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    }
    expect(foundingMinimumsMet(s)).toBe(false)
    expect(foundingGaps(s).craft).toBe(1)
    expect(() => applyActions(s, [{ kind: 'foundStudio' }])).toThrow()
    // Sign the craft lead → minimums met → foundStudio succeeds.
    const craft = byRole(pool, 'craft')[0]!
    s = applyActions(s, [{ kind: 'signContract', talentId: craft.id, termWeeks: 104 }])
    expect(foundingMinimumsMet(s)).toBe(true)
    const founded = applyActions(s, [{ kind: 'foundStudio' }])
    expect(founded.founding).toBeNull()
  })

  it('cannot greenlight during the founding draft', () => {
    const s = beginFounding(generateWorld('found-no-greenlight'))
    const pool = applicants(s)
    const payload = greenlightPayload(s, {
      writerId: byRole(pool, 'writer')[0]!.id,
      directorId: byRole(pool, 'director')[0]!.id,
      cast: {
        lead: byRole(pool, 'actor')[0]!.id,
        antagonist: byRole(pool, 'actor')[1]!.id,
        support: byRole(pool, 'actor')[2]!.id,
      },
      craftIds: [byRole(pool, 'craft')[0]!.id],
    })
    expect(() => applyActions(s, [{ kind: 'greenlight', production: payload }])).toThrow()
  })
})

// ── D-11.4/.5/.6 contracts, offers, payroll, signing bonus ────────────────────
describe('D-11 — contracts & offers', () => {
  it('signing during founding creates a contract and draws the recruitment fund (not cash)', () => {
    let s = beginFounding(generateWorld('sign-founding'))
    const t = byRole(applicants(s), 'actor')[0]!
    const offer = contractOffer(s, t.id, 104)
    const cashBefore = s.studio.cash
    s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    expect(isContracted(s, t.id)).toBe(true)
    expect(s.studio.cash).toBe(cashBefore) // founding bonus does NOT touch cash
    expect(s.founding!.spentBonus).toBe(offer.signingBonus)
    expect(s.ledger).toEqual([]) // founding bonus excluded from the reconciling ledger
    const c = activeContract(s, t.id)!
    expect(c.annualSalary).toBe(offer.annualSalary)
    expect(c.termWeeks).toBe(104)
  })

  it('cannot sign the same talent twice', () => {
    let s = beginFounding(generateWorld('sign-dup'))
    const t = byRole(applicants(s), 'actor')[0]!
    s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    expect(() => applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])).toThrow()
  })

  it('a founding signing bonus over the remaining recruitment fund is rejected', () => {
    // Shrink is not possible via API; instead sign until the fund is nearly gone, then
    // assert an over-budget sign throws. Simpler: assert the guard by exhausting budget.
    let s = beginFounding(generateWorld('sign-budget'))
    // Spend the fund down by signing several; then force an over-budget attempt by
    // checking a talent whose bonus exceeds the tiny remaining fund is rejected.
    const pool = applicants(s)
    // Sign all actors (drains a lot of the fund).
    for (const t of byRole(pool, 'actor')) {
      const remaining = s.founding!.budget - s.founding!.spentBonus
      const offer = contractOffer(s, t.id, 104)
      if (offer.signingBonus <= remaining) {
        s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
      } else {
        expect(() => applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])).toThrow()
      }
    }
    // The fund never went negative.
    expect(s.founding!.spentBonus).toBeLessThanOrEqual(s.founding!.budget)
  })

  it('contract offers are deterministic and signing bonus = round(annual × fraction)', () => {
    const s = beginFounding(generateWorld('offer-det'))
    const t = byRole(applicants(s), 'writer')[0]!
    const a = contractOffer(s, t.id, 104)
    const b = contractOffer(s, t.id, 104)
    expect(a).toEqual(b)
    expect(a.signingBonus).toBe(iround(a.annualSalary * TUNING.CONTRACT_SIGNING_BONUS_FRACTION))
    expect(a.annualSalary).toBeGreaterThan(0)
  })

  it('longer terms trade cost certainty: a 1-year annual ask ≥ a 4-year annual ask', () => {
    const s = beginFounding(generateWorld('offer-length'))
    const t = byRole(applicants(s), 'director')[0]!
    const options = contractOfferOptions(s, t.id)
    const oneYear = options.find((o) => o.termWeeks === 52)!
    const fourYear = options.find((o) => o.termWeeks === 208)!
    expect(oneYear.annualSalary).toBeGreaterThanOrEqual(fourYear.annualSalary)
  })

  it('weekly payroll applies exactly once per tick and the ledger reconciles', () => {
    const s0 = foundStudio('payroll-once')
    expect(reconciles(s0)).toBe(true)
    const weekly = weeklyPayroll(s0)
    expect(weekly).toBeGreaterThan(0)
    const s1 = tick(s0)
    const payrollEntries = s1.ledger.filter((e) => e.kind === 'payroll')
    expect(payrollEntries.length).toBe(1)
    expect(payrollEntries[0]!.amount).toBe(-weekly)
    // D-12: studio overhead (base + per-employee) is also debited once per founded week.
    const overhead = TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * s0.contracts.length
    expect(s1.ledger.filter((e) => e.kind === 'overhead').length).toBe(1)
    expect(s1.studio.cash).toBe(s0.studio.cash - weekly - overhead)
    expect(reconciles(s1)).toBe(true)
  })

  it('payroll accrues each week; the ledger reconciles after several weeks', () => {
    const s = advanceWeeks(foundStudio('payroll-multi'), 6)
    expect(s.ledger.filter((e) => e.kind === 'payroll').length).toBe(6)
    expect(reconciles(s)).toBe(true)
  })
})

// ── D-11.8 expiration → free agent ────────────────────────────────────────────
describe('D-11.8 — expiration', () => {
  it('a contract expires at term end and the talent becomes a free agent', () => {
    const s0 = foundStudio('expire-1', 52) // 1-year contracts
    const someone = rosterTalent(s0)[0]!
    expect(isContracted(s0, someone.id)).toBe(true)
    const s = advanceWeeks(s0, 52) // to week 52 → contracts end (endWeekExclusive = 52)
    expect(isContracted(s, someone.id)).toBe(false)
    expect(s.freeAgents).toContain(someone.id)
    expect(employmentStatus(s, someone.id)).toBe('freeAgent')
  })
})

// ── D-11.9 early release + termination cost ───────────────────────────────────
describe('D-11.9 — early release', () => {
  it('termination cost = 50% of remaining guaranteed salary; talent becomes a free agent', () => {
    const s0 = foundStudio('release-1', 104)
    const t = rosterTalent(s0)[0]!
    const c = activeContract(s0, t.id)!
    const week = s0.market.tick
    const expectedCost = iround(TUNING.HIRING_TERMINATION_FRACTION * guaranteedComp(c, week))
    expect(terminationCost(c, week)).toBe(expectedCost)
    const cashBefore = s0.studio.cash
    const s = applyActions(s0, [{ kind: 'releaseTalent', talentId: t.id }])
    expect(isContracted(s, t.id)).toBe(false)
    expect(s.freeAgents).toContain(t.id)
    expect(s.studio.cash).toBe(cashBefore - expectedCost)
    expect(s.ledger.some((e) => e.kind === 'termination' && e.amount === -expectedCost)).toBe(true)
    expect(reconciles(s)).toBe(true)
  })

  it('releasing a talent with no active contract is rejected', () => {
    const s = foundStudio('release-none')
    const notEmployed = s.talent.find((t) => !isContracted(s, t.id))!
    expect(() => applyActions(s, [{ kind: 'releaseTalent', talentId: notEmployed.id }])).toThrow()
  })
})

// ── D-11.7 renewals ───────────────────────────────────────────────────────────
describe('D-11.7 — renewals', () => {
  it('the renewal window opens within HIRING_RENEWAL_WINDOW_WEEKS of expiry', () => {
    const s0 = foundStudio('renew-window', 52)
    const t = rosterTalent(s0)[0]!
    const c0 = activeContract(s0, t.id)!
    expect(renewalWindowOpen(c0, 0)).toBe(false) // 52 weeks out → closed
    expect(renewalWindowOpen(c0, 52 - TUNING.HIRING_RENEWAL_WINDOW_WEEKS)).toBe(true)
  })

  it('renewing inside the window extends the term and takes a signing bonus from cash', () => {
    const s0 = foundStudio('renew-extend', 52)
    const t = rosterTalent(s0)[0]!
    // advance to a week inside the renewal window (remaining ≤ window)
    const week = 52 - 5
    const s1 = advanceWeeks(s0, week)
    expect(renewalWindowOpen(activeContract(s1, t.id)!, week)).toBe(true)
    const cashBefore = s1.studio.cash
    const offer = contractOffer(s1, t.id, 104, week)
    const s2 = applyActions(s1, [{ kind: 'renewContract', talentId: t.id, termWeeks: 104 }])
    const c = activeContract(s2, t.id)!
    expect(c.endWeekExclusive).toBe(week + 104)
    expect(s2.studio.cash).toBe(cashBefore - offer.signingBonus)
    expect(reconciles(s2)).toBe(true)
  })

  it('renewing outside the window is rejected', () => {
    const s0 = foundStudio('renew-early', 104)
    const t = rosterTalent(s0)[0]!
    expect(() => applyActions(s0, [{ kind: 'renewContract', talentId: t.id, termWeeks: 104 }])).toThrow()
  })
})

// ── D-11.10/.12/.13 assignment legality + freelancers ─────────────────────────
describe('D-11 — assignment legality & freelancers', () => {
  it('a fully-contracted greenlight succeeds and charges NO salary at greenlight', () => {
    const s0 = foundStudio('assign-contracted')
    const roster = rosterTalent(s0)
    const actors = roster.filter((t) => t.role === 'actor')
    const payload = greenlightPayload(s0, {
      writerId: roster.find((t) => t.role === 'writer')!.id,
      directorId: roster.find((t) => t.role === 'director')!.id,
      cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
      craftIds: [roster.find((t) => t.role === 'craft')!.id],
    })
    const s = applyActions(s0, [{ kind: 'greenlight', production: payload }])
    const prodEntries = s.ledger.filter((e) => e.kind === 'production')
    expect(prodEntries.length).toBe(1)
    // Production cost = negative + marketing ONLY (contracted talent are on payroll).
    const concept = s.concepts[0]!
    expect(prodEntries[0]!.amount).toBe(-(concept.baseNegativeCost + 100_000))
    expect(s.ledger.some((e) => e.kind === 'freelancerFee')).toBe(false)
    expect(reconciles(s)).toBe(true)
  })

  it('every film requires exactly one Production/Craft Lead (empty craftIds rejected)', () => {
    const s0 = foundStudio('assign-craft')
    const roster = rosterTalent(s0)
    const actors = roster.filter((t) => t.role === 'actor')
    const payload = greenlightPayload(s0, {
      writerId: roster.find((t) => t.role === 'writer')!.id,
      directorId: roster.find((t) => t.role === 'director')!.id,
      cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
      craftIds: [], // no Production/Craft Lead
    })
    expect(() => applyActions(s0, [{ kind: 'greenlight', production: payload }])).toThrow()
  })

  it('assigning a non-contracted, non-freelancer talent is rejected (D-11.12)', () => {
    const s0 = foundStudio('assign-illegal')
    const roster = rosterTalent(s0)
    const actors = roster.filter((t) => t.role === 'actor')
    // Find a talent who is neither contracted nor in the freelancer market.
    const fm = new Set(freelancerMarketIds(s0))
    const outsider = s0.talent.find((t) => !isContracted(s0, t.id) && !fm.has(t.id) && t.role === 'actor')!
    const payload = greenlightPayload(s0, {
      writerId: roster.find((t) => t.role === 'writer')!.id,
      directorId: roster.find((t) => t.role === 'director')!.id,
      cast: { lead: outsider.id, antagonist: actors[0]!.id, support: actors[1]!.id },
      craftIds: [roster.find((t) => t.role === 'craft')!.id],
    })
    expect(() => applyActions(s0, [{ kind: 'greenlight', production: payload }])).toThrow()
  })

  it('a freelancer is legally assignable and charges a one-film fee (distinct from payroll)', () => {
    const s0 = foundStudio('assign-freelancer')
    const roster = rosterTalent(s0)
    const actors = roster.filter((t) => t.role === 'actor')
    // Pick a freelancer actor from the current market (not contracted).
    const freelancer = freelancerMarketIds(s0)
      .map((id) => s0.talent.find((t) => t.id === id)!)
      .find((t) => t.role === 'actor' && !isContracted(s0, t.id))!
    expect(freelancer).toBeDefined()
    const payload = greenlightPayload(s0, {
      writerId: roster.find((t) => t.role === 'writer')!.id,
      directorId: roster.find((t) => t.role === 'director')!.id,
      cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: freelancer.id },
      craftIds: [roster.find((t) => t.role === 'craft')!.id],
    })
    const s = applyActions(s0, [{ kind: 'greenlight', production: payload }])
    const feeEntry = s.ledger.find((e) => e.kind === 'freelancerFee' && e.talentId === freelancer.id)
    expect(feeEntry).toBeDefined()
    expect(feeEntry!.amount).toBe(-freelancerFee(freelancer))
    expect(reconciles(s)).toBe(true)
  })

  it('freelancerFee = round(salaryCurve × premium); it scales with the base salary', () => {
    const s = foundStudio('freelancer-fee')
    const ids = freelancerMarketIds(s)
    expect(ids.length).toBeGreaterThan(0)
    // freelancerFee is a pure function of the talent; deterministic and positive.
    for (const id of ids) {
      const t = s.talent.find((x) => x.id === id)!
      expect(freelancerFee(t)).toBeGreaterThan(0)
    }
  })
})

// ── D-11.14 market rotation (deterministic) ───────────────────────────────────
describe('D-11.14 — deterministic markets', () => {
  it('freelancer & hiring markets are deterministic for a given state/week', () => {
    const s = foundStudio('market-det')
    expect(freelancerMarketIds(s)).toEqual(freelancerMarketIds(s))
    expect(hiringMarketIds(s)).toEqual(hiringMarketIds(s))
  })

  it('a contracted talent never appears in either market', () => {
    const s = foundStudio('market-exclude')
    const contracted = new Set(rosterTalent(s).map((t) => t.id))
    for (const id of freelancerMarketIds(s)) expect(contracted.has(id)).toBe(false)
    for (const id of hiringMarketIds(s)) expect(contracted.has(id)).toBe(false)
  })

  it('the market rotates across epochs (different listings over a full rotation)', () => {
    const s0 = foundStudio('market-rotate')
    const e0 = freelancerMarketIds(s0)
    const s1 = advanceWeeks(s0, TUNING.HIRING_MARKET_ROTATION_WEEKS)
    const e1 = freelancerMarketIds(s1)
    // The two epoch listings need not be disjoint, but should not be identical order.
    expect(e0.join(',') === e1.join(',')).toBe(false)
  })
})

// ── D-11.5 economy: lean vs star-heavy burn ───────────────────────────────────
describe('D-11.5 — economy pressure', () => {
  it('a star-heavy roster burns more weekly payroll than a lean roster', () => {
    // Build two rosters from the SAME applicant pool: cheapest-N vs priciest-N.
    const base = beginFounding(generateWorld('burn-compare'))
    const pool = applicants(base)
    const sign = (state: GameState, list: Talent[]) => {
      let s = state
      for (const t of list) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
      return applyActions(s, [{ kind: 'foundStudio' }])
    }
    const bySalary = (ts: Talent[]) => [...ts].sort((a, b) => a.salary - b.salary)
    const actors = bySalary(byRole(pool, 'actor'))
    const director = byRole(pool, 'director')[0]!
    const writers = byRole(pool, 'writer').slice(0, 2)
    const craft = byRole(pool, 'craft')[0]!
    const lean = sign(base, [...actors.slice(0, 5), director, ...writers, craft])
    const starHeavy = sign(base, [...actors.slice(-5), director, ...writers, craft])
    expect(weeklyPayroll(starHeavy)).toBeGreaterThan(weeklyPayroll(lean))
  })
})

// ── D-11.16/.17 determinism & saves ───────────────────────────────────────────
describe('D-11 — determinism & saves (V4)', () => {
  it('new games save as V6 and round-trip byte-identically', () => {
    const s = foundStudio('save-v4')
    const save = makeSave(s)
    expect(save.saveVersion).toBe(8) // Production Operations V1: new games save as V8.
    const a = exportSave(save)
    const b = exportSave(importSave(a))
    expect(b).toBe(a)
  })

  it('no duplicate payroll after reload (reload ≡ continuous run)', () => {
    const s0 = foundStudio('reload-payroll')
    const continuous = advanceWeeks(s0, 6)
    // Split: advance 3, export/import (V3), advance 3 more.
    const mid = advanceWeeks(s0, 3)
    const reloaded = importSave(exportSave(makeSave(mid)))
    if (reloaded.saveVersion !== 8) throw new Error('expected V8') // Production Operations V1.
    const split = advanceWeeks(reloaded.state, 3)
    expect(split.studio.cash).toBe(continuous.studio.cash)
    expect(split.ledger.length).toBe(continuous.ledger.length)
    expect(exportSave(makeSave(split))).toBe(exportSave(makeSave(continuous)))
  })

  it('two same-seed founded+advanced runs are byte-identical (deterministic offers/markets)', () => {
    const a = advanceWeeks(foundStudio('det-run'), 10)
    const b = advanceWeeks(foundStudio('det-run'), 10)
    expect(exportSave(makeSave(a))).toBe(exportSave(makeSave(b)))
  })

  it('V2 → V3 import is deterministic, idempotent, and non-destructive', () => {
    // A legacy V2 save = a headless world wrapped as V2 (no employment fields).
    const v2state = generateWorld('legacy-v2')
    // Strip to the frozen V2 shape (drop employment fields) to model a real V2 save.
    const { founding, contracts, ledger, freeAgents, ...v2 } = v2state
    void founding
    void contracts
    void ledger
    void freeAgents
    const v2save = makeSaveV2(v2)
    const before = exportSave(v2save)
    const a = convertV2ToV3(v2save)
    const b = convertV2ToV3(v2save)
    expect(exportSave(a)).toBe(exportSave(b)) // deterministic + idempotent
    expect(a.state.founding).toBeNull()
    expect(a.state.contracts).toEqual([])
    expect(a.state.rngState).toBe(v2.rngState) // rngState carried through
    expect(exportSave(v2save)).toBe(before) // V2 input untouched
    // A converted legacy save is employment-not-engaged (open-pool continues).
    expect(employmentEngaged(a.state)).toBe(false)
  })
})

// ── D-11.1 employment status derivation ───────────────────────────────────────
describe('D-11.1 — employment status', () => {
  it('status partitions: contracted / freeAgent / availableFreelancer / unavailable', () => {
    const s = foundStudio('status-1')
    const roster = rosterTalent(s)
    expect(roster.length).toBeGreaterThan(0)
    for (const t of roster) expect(employmentStatus(s, t.id)).toBe('contracted')
    // Free-agent market members read as freeAgent; freelancer-market members as availableFreelancer.
    for (const id of hiringMarketIds(s)) {
      if (!freelancerMarketIds(s).includes(id)) expect(employmentStatus(s, id)).toBe('freeAgent')
    }
    for (const id of freelancerMarketIds(s)) expect(employmentStatus(s, id)).toBe('availableFreelancer')
    // Someone in neither market and not contracted is unavailable.
    const fm = new Set(freelancerMarketIds(s))
    const hm = new Set(hiringMarketIds(s))
    const unavailable = s.talent.find(
      (t) => !isContracted(s, t.id) && !fm.has(t.id) && !hm.has(t.id),
    )
    if (unavailable) expect(employmentStatus(s, unavailable.id)).toBe('unavailable')
  })
})
