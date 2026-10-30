// ── P16B: licence.ts is the ONE licence producer for the four rights ──
//
// Authority: P16 integration contract §3 ("P16 is the sole title/licence writer. P17/P18 request and consume
// its facts. Use one Licence instrument with subject/right/scope, current lawful grantor, grantee, exclusivity,
// start/end-exclusive weeks, consideration, expiry/reversion terms and transaction provenance. No territorial
// subdivisions ... Refuse overlapping exclusive scopes, unknown subjects, expired permission, grants wider than
// the grantor holds and sublicensing absent explicit authority"; R3 "Exclusive term licence only"; R4 "no
// executable grant before the P18 consumer exists"); §7 group R; 1362-O §5.9; 1370-as REVIEW finding 7 (the
// four-right licence producer). P16A r3 four-right table.

import { describe, expect, it } from 'vitest'
import * as sale from '../src/core/assetSale.js'
import * as licence from '../src/core/licence.js'
import { subjectValueV1 } from '../src/core/propertyValuation.js'
import * as rights from '../src/core/rights.js'
import { makeSave, stableStringify } from '../src/core/save.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { liveFromGenuine, STABLE } from './helpers/p16-fixtures.js'

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [r01, r02, r03] = h.identities.slice(1, 4).map((i) => i.studioId) as [string, string, string]
  const week = state.market.tick
  const film = (studioId: string) => h.films.find((f) => f.studioId === studioId && f.provenance === 'simulation/v1' && f.settledWeek !== null)!
  const property = (studioId: string) => ({ right: 'R1' as const, propertyId: rights.storyPropertyId(film(studioId).conceptId) })
  const r2 = (studioId: string) => ({ right: 'R2' as const, filmId: film(studioId).filmId })
  const grant = (over: Partial<licence.LicenceGrant> = {}): licence.LicenceGrant =>
    ({ right: 'R3', subject: property(r01), scope: { use: 'sequel' }, exclusive: true, startWeek: week, endWeekExclusive: week + 52, grantorId: r01, granteeId: r02, ...over })
  const at = (s: GameState, tick: number): GameState => ({ ...s, market: { ...s.market, tick } })
  return { state, h, r01, r02, r03, week, film, property, r2, grant, at }
}
const SEQUEL = { use: 'sequel' as const }
const REMAKE = { use: 'remake' as const }

describe('P16B licence producer: the four-right instrument boundaries', () => {
  it('R1/R2 move only by whole-title sale; R3 is an exclusive term licence on a property with an enumerated continuation use; R4 has no executable grant before P18', () => {
    const { state, r01, r2, grant, week } = world()
    expect(licence.R3_USES).toEqual(['sequel', 'remake', 'spinoff'])
    // Decision 19A §3 (P18): the television use is split into production and distribution.
    expect(licence.R4_USES).toEqual(['televisionProduction', 'televisionDistribution', 'merchandise'])
    expect(licence.licenceGrantRefusal(state, grant(), week)).toBeNull()
    expect(licence.licenceGrantRefusal(state, grant({ subject: r2(r01) }), week)).toBe('r3RequiresProperty')
    expect(licence.licenceGrantRefusal(state, grant({ exclusive: false }), week)).toBe('r3RequiresExclusive')
    for (const use of licence.R4_USES) expect(licence.licenceGrantRefusal(state, grant({ scope: { use } }), week)).toBe('invalidScope')
    expect(licence.licenceGrantRefusal(state, grant({ right: 'R4', scope: { use: 'televisionProduction' } }), week)).toBe('r4ConsumerNotLive')
    expect(licence.licenceGrantRefusal(state, grant({ right: 'R4', subject: r2(r01), scope: { use: 'merchandise' }, exclusive: false }), week)).toBe('r4ConsumerNotLive')
    // Terms: whole weeks, half-open, starting no earlier than the grant week, strictly positive length.
    expect(licence.licenceGrantRefusal(state, grant({ startWeek: week - 1 }), week)).toBe('invalidTerm')
    expect(licence.licenceGrantRefusal(state, grant({ endWeekExclusive: week }), week)).toBe('invalidTerm')
    expect(licence.licenceGrantRefusal(state, grant({ endWeekExclusive: week + 0.5 }), week)).toBe('invalidTerm')
    expect(licence.licenceGrantRefusal(state, grant({ granteeId: r01 }), week)).toBe('selfGrant')
    expect(licence.licenceGrantRefusal(state, grant({ subject: { right: 'R1', propertyId: 'story-property:no-such-concept' } }), week)).toBe('unknownSubject')
  })

  it('only the current R1 holder grants: a non-holder, a grantee sub-licensing and an overlapping exclusive use are refused; a different use or an adjacent term is not', () => {
    const { state, r02, r03, grant, week } = world()
    expect(licence.licenceGrantRefusal(state, grant({ grantorId: r03 }), week)).toBe('grantorNotHolder')
    const { state: granted } = licence.mintLicence(state, grant(), week, 'rights-tx-fixture')
    // Sublicensing absent explicit authority: the exclusive grantee is not the holder.
    expect(licence.licenceGrantRefusal(granted, grant({ grantorId: r02, granteeId: r03 }), week)).toBe('grantorNotHolder')
    expect(licence.licenceGrantRefusal(granted, grant({ granteeId: r03, startWeek: week + 10, endWeekExclusive: week + 20 }), week)).toBe('exclusiveOverlap')
    expect(licence.licenceGrantRefusal(granted, grant({ granteeId: r03, scope: REMAKE }), week)).toBeNull()
    expect(licence.licenceGrantRefusal(granted, grant({ granteeId: r03, startWeek: week + 52, endWeekExclusive: week + 60 }), week)).toBeNull()
  })

  it('mintLicence is the one writer: the exact allocated id, every field, the allocator advanced once, nothing else touched, refusals thrown by name', () => {
    const { state, r01, r02, property, grant, week } = world()
    const before = stableStringify(state)
    const n = state.rights.nextId
    const { state: granted, licence: l } = licence.mintLicence(state, grant(), week, 'rights-tx-fixture')
    expect(l).toEqual({ id: `rights-licence-${n}`, right: 'R3', subject: property(r01), scope: SEQUEL, exclusive: true, grantorId: r01, granteeId: r02,
      startWeek: week, endWeekExclusive: week + 52, grantedWeek: week, transactionId: 'rights-tx-fixture' })
    expect(granted.rights.licences).toEqual([l])
    expect(granted.rights.nextId).toBe(n + 1)
    expect(stableStringify({ ...granted, rights: { ...granted.rights, licences: [], nextId: n } })).toBe(before)
    expect(stableStringify(state)).toBe(before)
    expect(() => licence.mintLicence(state, grant({ exclusive: false }), week, 'rights-tx-fixture')).toThrow(/r3RequiresExclusive/)
    expect(() => licence.mintLicence(granted, grant({ granteeId: r02 }), week, 'rights-tx-fixture-2')).toThrow(/exclusiveOverlap/)
  })

  it('permissionFor is the live check a consumer makes at every boundary: scoped exclusive authority moves to the grantee for the term and reverts to the holder at expiry', () => {
    const { state, r01, r02, r03, property, r2, grant, at, week } = world()
    const { state: granted, licence: l } = licence.mintLicence(state, grant(), week, 'rights-tx-fixture')
    expect(licence.permissionFor(granted, r02, property(r01), 'R3', SEQUEL, week)).toEqual({ kind: 'permitted', via: 'licence', licenceId: l.id })
    expect(licence.permissionFor(granted, r01, property(r01), 'R3', SEQUEL, week)).toEqual({ kind: 'refused', reason: `noAuthority:${r02}` })
    expect(licence.permissionFor(granted, r01, property(r01), 'R3', REMAKE, week)).toEqual({ kind: 'permitted', via: 'title', licenceId: null })
    expect(licence.permissionFor(granted, r02, property(r01), 'R3', REMAKE, week)).toEqual({ kind: 'refused', reason: `noAuthority:${r01}` })
    expect(licence.permissionFor(granted, r03, property(r01), 'R3', SEQUEL, week)).toEqual({ kind: 'refused', reason: `noAuthority:${r02}` })
    // Status by week, and reversion: at the end-exclusive week the title answers again and the lapsed grantee is told its grant expired.
    expect([week - 1, week, week + 51, week + 52].map((w) => licence.licenceStatus(l, w))).toEqual(['pending', 'inForce', 'inForce', 'expired'])
    const later = at(granted, week + 52)
    expect(licence.permissionFor(later, r02, property(r01), 'R3', SEQUEL, week + 52)).toEqual({ kind: 'refused', reason: `expired:${l.id}` })
    expect(licence.permissionFor(later, r01, property(r01), 'R3', SEQUEL, week + 52)).toEqual({ kind: 'permitted', via: 'title', licenceId: null })
    expect(licence.licencesHeldBy(granted, r02, week).map((x) => x.id)).toEqual([l.id])
    expect(licence.licencesHeldBy(later, r02, week + 52)).toEqual([])
    expect(licence.licencesHeldBy(granted, r01, week)).toEqual([])
    // R4 questions resolve from the relevant R1/R2 holder and carry no grant yet; unknown subjects and future weeks refuse by name.
    expect(licence.permissionFor(granted, r01, r2(r01), 'R4', { use: 'televisionProduction' }, week)).toEqual({ kind: 'permitted', via: 'title', licenceId: null })
    expect(licence.permissionFor(granted, r02, r2(r01), 'R4', { use: 'televisionProduction' }, week)).toEqual({ kind: 'refused', reason: `noAuthority:${r01}` })
    expect(licence.permissionFor(granted, r01, { right: 'R1', propertyId: 'story-property:no-such' }, 'R3', SEQUEL, week)).toEqual({ kind: 'refused', reason: 'unknownSubject' })
    expect(licence.permissionFor(granted, r02, property(r01), 'R3', SEQUEL, week + 1)).toEqual({ kind: 'refused', reason: 'futureWeek' })
  })

  it('the bilateral sale closes through the producer: the licence a closed R3 offer records is exactly mintLicence\'s, and the refusal names are the producer\'s', () => {
    const { state, r01, r02, property, grant, week } = world()
    const valued = subjectValueV1(state, property(r01), week)
    if (valued.kind !== 'available') throw new Error(valued.reason)
    const price = Math.ceil((valued.value * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100)
    const instrument = { kind: 'licence' as const, right: 'R3' as const, subject: property(r01), scope: SEQUEL, exclusive: true, startWeek: week, endWeekExclusive: week + 52 }
    const { state: offered, offer } = sale.makeOffer(state, { offerorId: r02, counterpartyId: r01, direction: 'buy', instrument, price }, week, STABLE)
    const closed = sale.acceptOffer(offered, offer.id, r01, week, STABLE)
    expect(closed.rights.licences).toHaveLength(1)
    const l = closed.rights.licences[0]!
    const tx = closed.rights.transactions.find((t) => t.licenceId === l.id)!
    expect(tx).toMatchObject({ kind: 'licenceGrant', payerId: r02, payeeId: r01, amount: price })
    const direct = licence.mintLicence({ ...state, rights: { ...state.rights, nextId: Number(l.id.slice('rights-licence-'.length)) } }, grant(), week, tx.id).licence
    expect(l).toEqual(direct)
    expect(sale.offerRefusal(state, { offerorId: r02, counterpartyId: r01, direction: 'buy', instrument: { ...instrument, exclusive: false }, price }, week, STABLE)).toBe('r3RequiresExclusive')
    expect(sale.offerRefusal(state, { offerorId: r02, counterpartyId: r01, direction: 'buy', instrument: { ...instrument, right: 'R4', scope: { use: 'televisionProduction' } }, price }, week, STABLE)).toBe('r4ConsumerNotLive')
    expect(() => makeSave(closed)).not.toThrow()
  })
})
