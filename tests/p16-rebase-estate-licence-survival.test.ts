// Added coverage; does not supersede the old pending test until all premises run. Default budget unchanged.
import { expect, it } from 'vitest'
import { actualEstatePrior } from './helpers/p16-actual-estate.js'
import { makeOffer, acceptOffer, offerRefusal } from '../src/core/assetSale.js'
import { permissionFor, licencesHeldBy } from '../src/core/licence.js'
import { currentHolder, rightsAuthority } from '../src/core/rights.js'
import { makeSave, stableStringify, exportCurrentState, importSave, migrateToLive } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { estateBidRefusal, submitEstateBid } from '../src/core/estate.js'
const R04 = 'studio-aca408ec-r04', R01 = 'studio-aca408ec-r01'
const P = { right: 'R1' as const, propertyId: 'story-property:studio-aca408ec-r04:concept:0' }
const SEQUEL = { use: 'sequel' as const }, REMAKE = { use: 'remake' as const }
it('actual closure and unsold archival preserve the existing paid exclusive licence, scope and expiry', () => {
  const prior = actualEstatePrior(), before = stableStringify(prior)
  const request = { offerorId: R01, counterpartyId: R04, direction: 'buy' as const, price: 1_000,
    instrument: { kind: 'licence' as const, right: 'R3' as const, subject: P, scope: SEQUEL,
      exclusive: true, startWeek: 162, endWeekExclusive: 266 } }
  expect(offerRefusal(prior, request, 162)).toBeNull()
  const offered = makeOffer(prior, request, 162)
  const granted = acceptOffer(offered.state, offered.offer.id, R04, 162)
  expect(stableStringify(prior)).toBe(before)
  makeSave(granted)
  const licence = granted.rights.licences.find(l => l.grantorId === R04 && l.granteeId === R01)!
  expect(licence).toBeDefined()
  const permission = { kind: 'permitted', via: 'licence', licenceId: licence.id }
  expect(permissionFor(granted, R01, P, 'R3', SEQUEL, 162)).toEqual(permission)
  let state = tick(granted)
  const closure = state.studioClosure.closures.find(c => c.studioId === R04)!
  expect(closure).toBeDefined(); expect(closure.closureWeek).toBe(163)
  const opened = state.rights.estates.find(e => e.closureId === closure.closureId)!
  expect(opened).toBeDefined()
  const lot = opened.lots.find(l => l.subjects.some(s => s.right === 'R1' && s.propertyId === P.propertyId))!
  expect(lot).toBeDefined(); expect(lot.encumbrances).toEqual([`licence:${licence.id}`])
  expect(permissionFor(state, R01, P, 'R3', SEQUEL, 163)).toEqual(permission)
  while (state.market.tick < opened.closesWeek - 1) {
    const old = state, bytes = stableStringify(old)
    state = tick(old); expect(stableStringify(old)).toBe(bytes)
  }
  const D = opened.closesWeek, beforeD = state
  state = tick(beforeD)
  makeSave(state)
  expect(currentHolder(state, P, D)).toMatchObject({ kind: 'holder', holderId: `estate:${R04}`, archived: true, tradeable: false })
  expect(permissionFor(state, R01, P, 'R3', SEQUEL, D)).toEqual(permission)
  expect(rightsAuthority(state, P, 'R3', D, SEQUEL)).toEqual({ kind: 'authority', studioId: R01, via: 'licence', licenceId: licence.id })
  expect(licencesHeldBy(state, R01, D).map(l => l.id)).toContain(licence.id)
  expect(permissionFor(state, R01, P, 'R3', REMAKE, D)).toEqual({ kind: 'refused', reason: 'archived' })
  // Read-only as-of term query, not a fabricated future save or tick.
  expect(permissionFor(state, R01, P, 'R3', SEQUEL, licence.endWeekExclusive)).toEqual({ kind: 'refused', reason: `expired:${licence.id}` })
  // Independent ordinary D successor: the title transfers subject to the same licence.
  const buyer = beforeD.hollywood!.playerStudioId
  const bid = { estateId: opened.estateId, lotId: lot.lotId, bidderId: buyer, amount: 13_000_000 }
  expect(lot.minimumBid).toBeLessThanOrEqual(bid.amount)
  expect(estateBidRefusal(beforeD, bid, D - 1)).toBeNull()
  const sold = tick(submitEstateBid(beforeD, bid, D - 1).state)
  makeSave(sold)
  expect(currentHolder(sold, P, D)).toMatchObject({ kind: 'holder', holderId: buyer, tradeable: true })
  expect(permissionFor(sold, R01, P, 'R3', SEQUEL, D)).toEqual(permission)
  expect(permissionFor(sold, buyer, P, 'R3', SEQUEL, D)).toEqual({ kind: 'refused', reason: `noAuthority:${R01}` })
  expect(permissionFor(sold, buyer, P, 'R3', REMAKE, D)).toEqual({ kind: 'permitted', via: 'title', licenceId: null })
  expect(sold.hollywood!.employment).toEqual(state.hollywood!.employment)
  expect(sold.hollywood!.activeEmploymentOrdinals).toEqual(state.hollywood!.activeEmploymentOrdinals)
  const text = exportCurrentState(state)
  expect(exportCurrentState(migrateToLive(importSave(text)).state)).toBe(text)
})
