// ── D-17A INDEPENDENT ADVERSARIAL TESTS — F. CONTRACT-OBLIGATION TRUTH ────────
// Contract T5: "At contract offer/renewal time: the full remaining guaranteed obligation
// (weekly salary × term + signing bonus) and its runway consequence, from the same engine
// helpers the tick uses."  Quality requirement A: the claim must be the action.
//
// So the claim is never checked against a re-derivation of itself. Every figure is
// checked against what the ENGINE ACTUALLY DOES to the state when the offer is signed
// through `applyActions`, and against the payroll the TICK actually writes to the ledger.
// `postSigningRunway(state, offer).after` is checked for PARITY with `runway()` recomputed
// on the real post-signing state — same rule, real burn, real cash.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  contractOffer,
  contractOfferOptions,
  generateWorld,
  hiringMarketIds,
  offerObligation,
  postSigningRunway,
  runway,
  tick,
  TUNING,
  weeklyBurn,
  weeklyPayroll,
  weeklySalary,
} from '../src/core/index.js'
import type { CreativeRole, GameState } from '../src/core/index.js'

const ROSTER: Record<CreativeRole, number> = { actor: 6, director: 2, writer: 2, craft: 2 }

function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', ROSTER.actor),
    ...byRole('director', ROSTER.director),
    ...byRole('writer', ROSTER.writer),
    ...byRole('craft', ROSTER.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

/** The payroll amount the TICK actually debits for the week `state.market.tick`. */
function ledgerPayrollForThisWeek(s: GameState): number {
  const week = s.market.tick
  const e = tick(s).ledger.find((x) => x.kind === 'payroll' && x.week === week)
  return e === undefined ? 0 : -e.amount
}

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17A/F — the reported obligation is what signing actually costs', () => {
  it.each(TUNING.CONTRACT_TERM_OPTIONS)('term %i weeks: bonus, weekly salary and total match the action', (termWeeks) => {
    const s = foundStudio('adv-f-obligation')
    const talentId = hiringMarketIds(s)[0]!
    const offer = contractOffer(s, talentId, termWeeks)
    const ob = offerObligation(offer)

    // the arithmetic the contract names, against the ENGINE's own weekly-salary rule
    expect(ob.weeklySalary).toBe(weeklySalary(offer.annualSalary))
    expect(ob.guaranteedComp).toBe(ob.weeklySalary * offer.termWeeks)
    expect(ob.signingBonus).toBe(offer.signingBonus)
    expect(ob.total).toBe(ob.guaranteedComp + ob.signingBonus)

    // …and the action's real consequences
    const signed = applyActions(s, [{ kind: 'signContract', talentId, termWeeks }])
    expect(s.studio.cash - signed.studio.cash).toBe(ob.signingBonus) // the cash debit
    const bonusEntry = signed.ledger.find((e) => e.kind === 'signingBonus' && e.talentId === talentId)!
    expect(bonusEntry.amount).toBe(-ob.signingBonus) // …and its ledger record

    const contract = signed.contracts.find((c) => c.talentId === talentId)!
    expect(contract.endWeekExclusive - contract.startWeek).toBe(offer.termWeeks)
    expect(ledgerPayrollForThisWeek(signed) - ledgerPayrollForThisWeek(s)).toBe(ob.weeklySalary)
    expect(weeklyPayroll(signed) - weeklyPayroll(s)).toBe(ob.weeklySalary)
  })

  it('the obligation is the salary the tick keeps paying — summed over the whole term', () => {
    const s = foundStudio('adv-f-term-sum')
    const talentId = hiringMarketIds(s)[0]!
    const termWeeks = TUNING.CONTRACT_MIN_WEEKS
    const ob = offerObligation(contractOffer(s, talentId, termWeeks))

    let cur = applyActions(s, [{ kind: 'signContract', talentId, termWeeks }])
    const baseline = weeklyPayroll(s)
    let paidForThisTalent = 0
    for (let i = 0; i < termWeeks; i++) {
      paidForThisTalent += weeklyPayroll(cur) - baseline
      cur = tick(cur)
    }
    expect(paidForThisTalent).toBe(ob.guaranteedComp) // the full guarantee, week by week
    expect(cur.contracts.some((c) => c.talentId === talentId)).toBe(false) // …and then it ends
  })

  it('every offered term reports its own obligation (no single figure reused across rungs)', () => {
    const s = foundStudio('adv-f-rungs')
    const talentId = hiringMarketIds(s)[0]!
    const obligations = contractOfferOptions(s, talentId).map((o) => offerObligation(o))
    expect(obligations.length).toBe(TUNING.CONTRACT_TERM_OPTIONS.length)
    for (const [i, o] of contractOfferOptions(s, talentId).entries()) {
      expect(obligations[i]!.guaranteedComp).toBe(weeklySalary(o.annualSalary) * o.termWeeks)
    }
    expect(new Set(obligations.map((o) => o.total)).size).toBe(obligations.length)
  })
})

describe('D-17A/F — postSigningRunway.after IS the runway of the real post-signing state', () => {
  it.each(TUNING.CONTRACT_TERM_OPTIONS)('term %i weeks: before/after/burn/cash all match the actual state', (termWeeks) => {
    const s = foundStudio('adv-f-runway')
    const talentId = hiringMarketIds(s)[0]!
    const offer = contractOffer(s, talentId, termWeeks)

    const psr = postSigningRunway(s, offer)
    const signed = applyActions(s, [{ kind: 'signContract', talentId, termWeeks }])

    expect(psr.before).toEqual(runway(s)) // the R1 runway as it stands now
    expect(psr.after).toEqual(runway(signed)) // …and the SAME rule on the real state
    expect(psr.burnAfter).toBe(weeklyBurn(signed))
    expect(psr.cashAfter).toBe(signed.studio.cash)
  })

  it('holds a tick later too — the definitional identity is not a same-tick coincidence', () => {
    const s = foundStudio('adv-f-runway-later')
    const talentId = hiringMarketIds(s)[0]!
    const offer = contractOffer(s, talentId, 104)
    const psr = postSigningRunway(s, offer)
    const signed = applyActions(s, [{ kind: 'signContract', talentId, termWeeks: 104 }])
    const stepped = tick(signed)

    // burn' comes from the REAL state after a real week has been paid
    expect(weeklyBurn(stepped)).toBe(psr.burnAfter)
    expect(runway(stepped).netWeeklyCash).toBe(psr.after.netWeeklyCash)
    // cash fell by exactly the week the ledger says was charged
    const week = signed.market.tick
    const charged = stepped.ledger
      .filter((e) => (e.kind === 'payroll' || e.kind === 'overhead') && e.week === week)
      .reduce((a, e) => a - e.amount, 0)
    expect(charged).toBe(psr.burnAfter)
  })

  it('signing a MORE expensive person shortens the reported runway, and the state agrees', () => {
    const s = foundStudio('adv-f-order')
    const ids = hiringMarketIds(s)
    const priced = ids
      .map((id) => ({ id, offer: contractOffer(s, id, 104) }))
      .sort((a, b) => a.offer.annualSalary - b.offer.annualSalary)
    const cheap = priced[0]!
    const dear = priced[priced.length - 1]!
    expect(dear.offer.annualSalary).toBeGreaterThan(cheap.offer.annualSalary)

    const cheapAfter = postSigningRunway(s, cheap.offer).after
    const dearAfter = postSigningRunway(s, dear.offer).after
    expect(dearAfter.weeks!).toBeLessThanOrEqual(cheapAfter.weeks!)
    expect(dearAfter.netWeeklyCash).toBeLessThan(cheapAfter.netWeeklyCash)

    // parity with the real signings, in both directions
    expect(cheapAfter).toEqual(
      runway(applyActions(s, [{ kind: 'signContract', talentId: cheap.id, termWeeks: 104 }])),
    )
    expect(dearAfter).toEqual(
      runway(applyActions(s, [{ kind: 'signContract', talentId: dear.id, termWeeks: 104 }])),
    )
  })
})
