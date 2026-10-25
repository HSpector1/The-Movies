// ── P16B: the P15B condition/loan readers are the ONE permitted-bidder fact source; unbound = fail closed ──
//
// Authority: P16 integration contract §6 ("Every buyer must pass permitted-bidder checks before disclosure,
// offer/bid submission and closing ... condition exactly `stable`, and no outstanding P15B distress loan ...
// The loan guard applies independently even if the stage is stable"); 1362-O §5.4; 1370-as REVIEW finding 2
// ("Integrate the actual P15B `conditionRecord` and `outstandingLoan` readers ... Removing the guard and
// defaulting to stable/no loan would be wrong").
//
// Explicit UNBOUND and hand-built readers below are isolated matrix unit controls.
// The shipping default is tested against real P15B producers in p16b-live-condition-readers.test.ts.

import { describe, expect, it } from 'vitest'
import * as acq from '../src/core/acquisition.js'
import { applyActions } from '../src/core/actions.js'
import * as sale from '../src/core/assetSale.js'
import * as dd from '../src/core/dueDiligence.js'
import { subjectValueV1 } from '../src/core/propertyValuation.js'
import * as finance from '../src/core/rightsFinance.js'
import { advanceRightsWeek } from '../src/core/rightsTick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { liveFromGenuine, readersOnly, readersWith, STABLE } from './helpers/p16-fixtures.js'

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [player, r01, r02, r03] = [h.playerStudioId, ...h.identities.slice(1, 4).map((i) => i.studioId)] as [string, string, string, string]
  const film = h.films.find((f) => f.studioId === r01 && f.provenance === 'simulation/v1' && f.settledWeek !== null)!
  const subject = { right: 'R2' as const, filmId: film.filmId }
  const valued = subjectValueV1(state, subject, state.market.tick)
  if (valued.kind !== 'available') throw new Error(valued.reason)
  const askPrice = Math.ceil((valued.value * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100)
  return { state, h, player, r01, r02, r03, week: state.market.tick, subject, askPrice }
}
const NOT_STABLE = ['warning', 'distress', 'recovery', 'closed'] as const
const studio = (studioId: string) => ({ kind: 'studio' as const, studioId })

describe('P16B permitted bidders read P15B condition and loan records through one bound reader pair', () => {
  it('the explicit UNBOUND negative fixture fails closed: no record for anyone, every bidder refused by name, the loan reader throws if consulted', () => {
    const { state, player, r01, week } = world()
    expect(finance.UNBOUND_CORPORATE_CONDITION_READERS.conditionRecord(state, r01)).toBeUndefined()
    expect(() => finance.UNBOUND_CORPORATE_CONDITION_READERS.outstandingLoan(state, r01, week)).toThrow(/P15B loan reader is not bound/)
    expect(finance.conditionFactsFor(state, r01, week, finance.UNBOUND_CORPORATE_CONDITION_READERS)).toBeNull()
    expect(finance.permittedBidderRefusal(state, player, week, finance.UNBOUND_CORPORATE_CONDITION_READERS)).toBe('conditionUnavailable')
    expect(finance.permittedBidderRefusal(state, r01, week, finance.UNBOUND_CORPORATE_CONDITION_READERS)).toBe('conditionUnavailable')
    // Nothing is assumed stable: the bidder's own record must exist.
    expect(finance.permittedBidderRefusal(state, r01, week, readersOnly({ [player]: 'stable' }))).toBe('conditionUnavailable')
    expect(finance.permittedBidderRefusal(state, player, week, readersOnly({ [player]: 'stable' }))).toBeNull()
  })

  it('bound to P15B-shaped records, the first-slice matrix holds: exactly stable and no outstanding loan, the stage refusal first', () => {
    const { state, player, r01, week } = world()
    expect(finance.permittedBidderRefusal(state, r01, week, STABLE)).toBeNull()
    expect(finance.permittedBidderRefusal(state, player, week, STABLE)).toBeNull()
    expect(finance.conditionFactsFor(state, r01, week, STABLE)).toEqual({ stage: 'stable', hasOutstandingLoan: false })
    for (const stage of NOT_STABLE) expect(finance.permittedBidderRefusal(state, r01, week, readersWith({ [r01]: stage }))).toBe(`stageNotStable:${stage}`)
    expect(finance.permittedBidderRefusal(state, r01, week, readersWith({}, [r01]))).toBe('outstandingDistressLoan')
    expect(finance.conditionFactsFor(state, r01, week, readersWith({}, [r01]))).toEqual({ stage: 'stable', hasOutstandingLoan: true })
    expect(finance.permittedBidderRefusal(state, r01, week, readersWith({ [r01]: 'warning' }, [r01]))).toBe('stageNotStable:warning')
    // The identity law still runs first: an unentered identity and an unknown studio never reach the readers.
    expect(finance.permittedBidderRefusal(state, state.hollywood!.identities[9]!.studioId, week, STABLE)).toBe('notOperating')
    expect(finance.permittedBidderRefusal(state, 'studio-nobody', week, STABLE)).toBe('unknownStudio')
  })

  it('default entries refuse a genuinely migrated studio without an evaluated record; explicit UNBOUND revalidation rejects the weekly phase', () => {
    const { state, player, r01, r03, week, subject, askPrice } = world()
    expect(finance.corporateConditionReaders.conditionRecord(state, player)).toBeUndefined()
    expect(finance.corporateConditionReaders.conditionRecord(state, r01)).toBeUndefined()
    const buy = { offerorId: player, counterpartyId: r01, direction: 'buy' as const, instrument: { kind: 'title' as const, subject }, price: askPrice }
    expect(sale.offerRefusal(state, buy, week)).toBe('buyerNotPermitted:conditionUnavailable')
    expect(() => applyActions(state, [{ kind: 'makeRightsOffer', offer: { counterpartyId: r01, direction: 'buy', instrument: { kind: 'title', subject }, price: askPrice } }])).toThrow(/buyerNotPermitted:conditionUnavailable/)
    expect(dd.diligenceRefusal(state, { recipientId: player, target: studio(r01), scope: ['rights'] }, week)).toBe('recipientNotPermitted:conditionUnavailable')
    expect(acq.absorptionRefusal(state, player, r03, week)).toBe('buyerNotPermitted:conditionUnavailable')
    // Explicit negative phase control: an offer made under STABLE is revalidated by UNBOUND, without claiming a default full-tick refusal.
    const { state: offered, offer } = sale.makeOffer(state, buy, week, STABLE)
    expect(offered.rights.offers.find((o) => o.id === offer.id)!.status).toBe('open')
    const answered = advanceRightsWeek(offered, week, finance.UNBOUND_CORPORATE_CONDITION_READERS)
    expect(answered.rights.offers.find((o) => o.id === offer.id)).toMatchObject({ status: 'rejected', refusal: 'buyerNotPermitted:conditionUnavailable', transactionId: null })
    expect(answered.rights.transactions).toHaveLength(offered.rights.transactions.length)
    // The same boundary advanced under bound readers closes it: one transaction, the title moved.
    const closed = advanceRightsWeek(offered, week, STABLE)
    expect(closed.rights.offers.find((o) => o.id === offer.id)).toMatchObject({ status: 'accepted' })
    expect(closed.rights.transactions).toHaveLength(offered.rights.transactions.length + 1)
  })

  it('the readers also answer for the OTHER party: a liabilities disclosure and an absorption target need the target\'s record', () => {
    const { state, player, r01, r03, week } = world()
    const onlyPlayer = readersOnly({ [player]: 'stable' })
    expect(dd.diligenceRefusal(state, { recipientId: player, target: studio(r01), scope: ['liabilities'] }, week, onlyPlayer)).toBe('targetConditionUnavailable')
    expect(dd.diligenceRefusal(state, { recipientId: player, target: studio(r01), scope: ['rights', 'employment'] }, week, onlyPlayer)).toBeNull()
    const { record } = dd.requestDiligence(state, { recipientId: player, target: studio(r01), scope: ['liabilities'] }, week, readersWith({}, [r01]))
    expect(record.body.liabilities).toMatchObject({ stage: 'stable', hasOutstandingLoan: true })
    expect(acq.absorptionRefusal(state, player, r03, week, onlyPlayer)).toBe('targetConditionUnavailable')
    expect(acq.absorptionRefusal(state, player, r03, week, readersWith({ [r03]: 'distress' }))).toBe('targetNotStable:distress')
    expect(acq.absorptionRefusal(state, player, r03, week, readersWith({}, [r03]))).toBe('targetOutstandingLoan')
    expect(acq.absorptionRefusal(state, player, r03, week, STABLE)).toBeNull()
    // A reader pair is a function of the state it is handed, never of hidden module state (review F63: readers that READ
    // the state they are handed, and two states that answer differently through the same pair).
    const fromState: finance.CorporateConditionReaders = {
      conditionRecord: (s, studioId) => (studioId === s.hollywood!.playerStudioId && s.studio.cash < 0 ? { condition: { stage: 'distress' } } : { condition: { stage: 'stable' } }),
      outstandingLoan: () => undefined,
    }
    const broke = { ...state, studio: { ...state.studio, cash: -1 } } as GameState
    expect(finance.permittedBidderRefusal(state, player, week, fromState)).toBeNull()
    expect(finance.permittedBidderRefusal(broke, player, week, fromState)).toBe('stageNotStable:distress')
  })
})
