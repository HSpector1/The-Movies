// ── P16B RED: costed, dated, recipient-bound due diligence ──
//
// Authority: 1362-O §5.5 ("Keep rival finances private in general views. Authorize a bounded,
// costed, dated transaction-specific disclosure to a permitted bidder: the target's relevant
// assets, liabilities, rights and contract terms. No access to unrelated studios. Record who
// received the disclosure. Delegate the fee ... as provisional tuning"); P16 integration contract
// §6 (charge its real fee once; record recipient, target, week/version, scope, receipt id and
// stale/revalidation policy; reveal only what prices that deal; rival policies receive the same
// lawful event; public receipts do not expose the private body), §7 group M.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import * as sale from '../src/core/assetSale.js'
import * as dd from '../src/core/dueDiligence.js'
import { terminationCost } from '../src/core/employment.js'
import * as finance from '../src/core/rightsFinance.js'
import * as rights from '../src/core/rights.js'
import { subjectValueV1 } from '../src/core/propertyValuation.js'
import { convertV49ToV48, convertV50ToV49, convertV51ToV50, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { detached, liveFromGenuine, readersWith, STABLE } from './helpers/p16-fixtures.js'

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [player, r01, r02] = [h.playerStudioId, h.identities[1]!.studioId, h.identities[2]!.studioId]
  return { state, h, player, r01, r02, week: state.market.tick }
}
const FEE = TUNING.RIGHTS_DUE_DILIGENCE_FEE
const studioTarget = (studioId: string) => ({ kind: 'studio' as const, studioId })

describe('P16B due diligence: one costed, dated, scoped disclosure event', () => {
  it('charges the fee exactly once, records recipient/target/week/scope/stale policy, and discloses only the target\'s relevant facts', () => {
    const { state, h, player, r01, week } = world()
    const { state: next, record } = dd.requestDiligence(state, { recipientId: player, target: studioTarget(r01), scope: ['rights', 'employment', 'liabilities'] }, week, STABLE)
    expect(next.studio.cash).toBe(state.studio.cash - FEE)
    const rows = next.ledger.filter((e) => e.kind === 'dueDiligenceFee')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ week, amount: -FEE, note: record.transactionId })
    const tx = next.rights.transactions.find((t) => t.id === record.transactionId)!
    expect(tx).toMatchObject({ kind: 'dueDiligence', payerId: player, payeeId: null, amount: FEE, subject: null })
    expect(record).toMatchObject({ recipientId: player, target: studioTarget(r01), week, scope: ['rights', 'employment', 'liabilities'], fee: FEE, staleFromWeek: week + TUNING.RIGHTS_DISCLOSURE_STALE_WEEKS })
    // Rights: every subject r01 holds, each with the same value the valuation consumer would price.
    const held = rights.subjectsHeldBy(rights.resolveTitles(state), state.rights.estates, r01, week)
    expect(record.body.rights.map((r) => r.subject)).toEqual(held)
    for (const row of record.body.rights) {
      const v = subjectValueV1(state, row.subject, week)
      expect(row.value).toBe(v.kind === 'available' ? v.value : null)
    }
    // Employment: exactly r01's live contracts with the lawful capped exit cost, nobody else's.
    const active = h.activeEmploymentOrdinals.map((i) => h.employment[i]!).filter((e) => e.studioId === r01 && e.endedWeek === null && e.terms.startWeek <= week && week < e.terms.endWeekExclusive)
    expect(record.body.employment!.map((e) => e.contractId).sort()).toEqual(active.map((e) => e.contractId).sort())
    for (const row of record.body.employment!) {
      const e = active.find((x) => x.contractId === row.contractId)!
      expect(row).toEqual({ contractId: e.contractId, talentId: e.terms.talentId, annualSalary: e.terms.annualSalary, startWeek: e.terms.startWeek, endWeekExclusive: e.terms.endWeekExclusive, exitCost: terminationCost(e.terms, week) })
    }
    // r2 (F7): the whole-dollar cash an absorption quote transfers at par is disclosed to the paying recipient.
    expect(record.body.liabilities).toEqual({ stage: 'stable', hasOutstandingLoan: false, weeklyFixedCost: finance.weeklyFixedCost(state, r01), cash: Math.floor(finance.studioCash(state, r01)) })
    // No unrelated studio leaks: every disclosed id belongs to the target.
    const otherIds = h.identities.map((i) => i.studioId).filter((id) => id !== r01)
    expect(JSON.stringify(record.body).split('"').some((s) => otherIds.includes(s))).toBe(false)
    expect(() => makeSave(next)).not.toThrow()
    expect(() => convertV49ToV48(convertV50ToV49(convertV51ToV50(makeSave(next))))).toThrow(/migrateToV48: cannot downgrade or discard a recorded rights root/)
    const reloaded = migrateToLive(importSave(stableStringify(makeSave(next)))).state as GameState
    expect(reloaded.rights.diligence).toEqual(next.rights.diligence)
  })

  it('a narrower scope discloses only that scope; the fee is the same real fee', () => {
    const { state, player, r01, week } = world()
    const { state: next, record } = dd.requestDiligence(state, { recipientId: player, target: studioTarget(r01), scope: ['rights'] }, week, STABLE)
    expect(record.body.employment).toBeNull()
    expect(record.body.liabilities).toBeNull()
    expect(record.body.rights.length).toBeGreaterThan(0)
    expect(next.studio.cash).toBe(state.studio.cash - FEE)
  })

  it('only the recipient can read the private body; everyone else gets null; public reads see no body', () => {
    const { state, player, r01, r02, week } = world()
    const { state: next, record } = dd.requestDiligence(state, { recipientId: player, target: studioTarget(r01), scope: ['rights', 'employment'] }, week, STABLE)
    expect(dd.disclosureFor(next, player, record.id)).toEqual(record)
    expect(dd.disclosureFor(next, r02, record.id)).toBeNull()
    expect(dd.disclosureFor(next, r01, record.id)).toBeNull()
    expect(dd.disclosureFor(next, player, 'rights-dd-99')).toBeNull()
    const receipt = dd.publicDiligenceReceipts(next)
    expect(receipt).toEqual([{ id: record.id, week, recipientId: player, target: studioTarget(r01), scope: record.scope, fee: FEE }])
    expect(JSON.stringify(receipt)).not.toContain('exitCost')
  })

  it('refuses by name: an ineligible recipient, an unknown or self target, an empty scope, or a fee that would break the current reserve; a refusal changes nothing', () => {
    const { state, player, r01, week } = world()
    const before = stableStringify(state)
    const input = { recipientId: player, target: studioTarget(r01), scope: ['rights' as const] }
    expect(dd.diligenceRefusal(state, input, week, STABLE)).toBeNull()
    expect(dd.diligenceRefusal(state, input, week, readersWith({}, [], 'recovery'))).toBe('recipientNotPermitted:stageNotStable:recovery')
    expect(dd.diligenceRefusal(state, { ...input, target: studioTarget('studio-nobody') }, week, STABLE)).toBe('unknownTarget')
    expect(dd.diligenceRefusal(state, { ...input, target: studioTarget(player) }, week, STABLE)).toBe('selfTarget')
    expect(dd.diligenceRefusal(state, { ...input, scope: [] }, week, STABLE)).toBe('emptyScope')
    const poor = { ...state, studio: { ...state.studio, cash: finance.postPurchaseReserve(state, player) + FEE - 1 } } as GameState
    expect(dd.diligenceRefusal(poor, input, week, STABLE)).toBe('insufficientCashAfterReserve')
    expect(() => dd.requestDiligence(poor, input, week, STABLE)).toThrow(/insufficientCashAfterReserve/)
    expect(stableStringify(state)).toBe(before)
  })

  it('a rival receives the same lawful event with the fee moved on its own account; a stale disclosure cannot back a binding offer', () => {
    const { state, h, r01, r02, week } = world()
    const { state: next, record } = dd.requestDiligence(state, { recipientId: r02, target: studioTarget(r01), scope: ['rights'] }, week, STABLE)
    const r02Account = next.hollywood!.businesses.find((b) => b.studioId === r02)!.account
    expect(r02Account.cash).toBe(state.hollywood!.businesses.find((b) => b.studioId === r02)!.account.cash - FEE)
    expect(r02Account.periods.reduce((s, p) => s + p.movements.dueDiligenceFee, 0)).toBe(-FEE)
    expect(dd.disclosureFor(next, r02, record.id)).toEqual(record)
    expect(() => makeSave(next)).not.toThrow()
    // A binding offer may cite the disclosure while it is fresh; from staleFromWeek on it refuses.
    const film = h.films.find((f) => f.studioId === r01 && f.provenance === 'simulation/v1' && f.settledWeek !== null)!
    const offer = { offerorId: r02, counterpartyId: r01, direction: 'buy' as const, instrument: { kind: 'title' as const, subject: { right: 'R2' as const, filmId: film.filmId } }, price: 1, disclosureId: record.id }
    expect(sale.offerRefusal(next, offer, week, STABLE)).toBeNull()
    const stale = detached(next)
    stale.rights.diligence[0]!.staleFromWeek = week
    expect(sale.offerRefusal(stale, offer, week, STABLE)).toBe('staleDisclosure')
    expect(sale.offerRefusal(next, { ...offer, offerorId: r01, counterpartyId: r02, instrument: { kind: 'title', subject: { right: 'R2', filmId: h.films.find((f) => f.studioId === r02 && f.provenance === 'simulation/v1' && f.settledWeek !== null)!.filmId } } }, week, STABLE)).toBe('disclosureNotHeld')
    expect(sale.offerRefusal(next, { ...offer, disclosureId: 'rights-dd-99' }, week, STABLE)).toBe('disclosureNotHeld')
  })

  it('the player\'s requestDueDiligence verb dispatches through applyActions and, while the P15B readers are unbound, refuses by name with no fee charged', () => {
    const { state, player, r01, week } = world()
    const before = stableStringify(state)
    expect(() => applyActions(state, [{ kind: 'requestDueDiligence', target: studioTarget(r01), scope: ['rights', 'liabilities'] }])).toThrow(/recipientNotPermitted:conditionUnavailable/)
    expect(stableStringify(state)).toBe(before)
    // The same verb's payload, through the same producer under bound readers: one record, one fee.
    const { state: next, record } = dd.requestDiligence(state, { recipientId: player, target: studioTarget(r01), scope: ['rights', 'liabilities'] }, week, STABLE)
    expect(next.rights.diligence).toEqual([record])
    expect(record).toMatchObject({ recipientId: player, week, fee: FEE })
    expect(next.studio.cash).toBe(state.studio.cash - FEE)
  })
})
