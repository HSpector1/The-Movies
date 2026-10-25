// ── P16 r2 REDs: scope-aware rights authority, licence survival, the R4 surface, continuation links, refusal purity ──
//
// Review r1 (REVIEW-R1-FINDINGS.json) blockers F1/F27/F41 (a live licence survives the grantor's closure, estate
// sale and archival: 1362-O 5.3, contract §6 "Archival freezes unsold rights ... while preserving ... continuing
// licences", §7 E "live licences survive closure/sale/archive"), F5/F28/F42/F34/F55 (an exclusive R3 licence limits the
// greenlight continuation hook and branch authority: contract §3, P16A r3 "R3 ... limited by scoped exclusive term
// licence", 1367-O), F23 (a P16 refusal at a queued greenlight's dequeue leaves no event behind) and F62 (a refused
// greenlight changes nothing, proven through applyActions); majors F10/F35 (R4: television/merchandise scopes and
// nonexclusive grants, contract §3 "Exclusive or nonexclusive term licence") and F11 (a continuation with its own
// concept links to its parent property and mints no R1, contract §3).

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import * as sale from '../src/core/assetSale.js'
import * as estate from '../src/core/estate.js'
import * as licence from '../src/core/licence.js'
import * as rights from '../src/core/rights.js'
import { makeSave, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production } from '../src/core/types.js'
import { freePackage } from './_m4Fixtures.js'
import { detached, estateHandoffFor, greenlightPayload, industryContendedStudio, liveFromGenuine, mintRoute, STABLE } from './helpers/p16-fixtures.js'

type Subject = { right: 'R1'; propertyId: string } | { right: 'R2'; filmId: string }
const SEQUEL = { use: 'sequel' as const }
const REMAKE = { use: 'remake' as const }
const SPINOFF = { use: 'spinoff' as const }
const TV = { use: 'television' as const }

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [player, r01, r02, r03, r04] = [h.playerStudioId, ...h.identities.slice(1, 5).map((i) => i.studioId)] as [string, string, string, string, string]
  const week = state.market.tick
  const settled = (studioId: string) => h.films.find((f) => f.studioId === studioId && f.provenance === 'simulation/v1' && f.settledWeek !== null)!
  const property = (studioId: string): Subject => ({ right: 'R1', propertyId: rights.storyPropertyId(settled(studioId).conceptId) })
  const film = (studioId: string): Subject => ({ right: 'R2', filmId: settled(studioId).filmId })
  const at = (s: GameState, t: number): GameState => ({ ...s, market: { ...s.market, tick: t } })
  return { state, h, player, r01, r02, r03, r04, week, settled, property, film, at }
}

/** An exclusive R3 licence bought through the bilateral path (offer, acceptance, transaction), so the root is a lawful save. */
function licensed(state: GameState, grantor: string, grantee: string, subject: Subject, scope: { use: 'sequel' | 'remake' | 'spinoff' }, week: number, weeks = 104): GameState {
  const instrument = { kind: 'licence' as const, right: 'R3' as const, subject, scope, exclusive: true, startWeek: week, endWeekExclusive: week + weeks }
  const { state: offered, offer } = sale.makeOffer(state, { offerorId: grantee, counterpartyId: grantor, direction: 'buy', instrument, price: 1_000 }, week, STABLE)
  return sale.acceptOffer(offered, offer.id, grantor, week, STABLE)
}

describe('r2 F1/F27/F41: a live licence survives its grantor\'s closure, an estate sale and archival', () => {
  it('the licensee keeps exclusive authority while the grantor\'s estate holds, archives, or sells the title; only the title\'s own default authority changes', () => {
    const { state, player, r01, r02, week, property } = world()
    const P = property(r01)
    const granted = licensed(state, r01, r02, P, SEQUEL, week)
    const licenceId = granted.rights.licences[0]!.id
    expect(licence.permissionFor(granted, r02, P, 'R3', SEQUEL, week)).toEqual({ kind: 'permitted', via: 'licence', licenceId })
    // Closure with the licensed property in a lot: the lot names the licence it is sold subject to.
    const handoff = estateHandoffFor(granted, r01, week, [{ lotId: 'lot-p', subjects: [P], minimumBid: 1 }])
    expect(handoff.lots[0]!.encumbrances).toEqual([`licence:${licenceId}`])
    const opened = estate.openEstate(granted, handoff, week, STABLE).state
    expect(licence.permissionFor(opened, r02, P, 'R3', SEQUEL, week)).toEqual({ kind: 'permitted', via: 'licence', licenceId })
    const D = handoff.closesWeek
    // No bid: the property archives at D. The archive freezes the TITLE; the licensee's paid term continues.
    const archived = estate.resolveEstate({ ...opened, market: { ...opened.market, tick: D } } as GameState, handoff.estateId, D, STABLE)
    expect(rights.currentHolder(archived, P, D)).toMatchObject({ kind: 'holder', holderId: `estate:${r01}`, archived: true, tradeable: false })
    expect(licence.permissionFor(archived, r02, P, 'R3', SEQUEL, D)).toEqual({ kind: 'permitted', via: 'licence', licenceId })
    expect(rights.rightsAuthority(archived, P, 'R3', D, SEQUEL)).toEqual({ kind: 'authority', studioId: r02, via: 'licence', licenceId })
    expect(licence.licencesHeldBy(archived, r02, D).map((l) => l.id)).toEqual([licenceId])
    // An unlicensed use of an archived title has no authority at all.
    expect(licence.permissionFor(archived, r02, P, 'R3', REMAKE, D)).toEqual({ kind: 'refused', reason: 'archived' })
    // At the end of the term the grant lapses: nobody holds sequel authority over an archived title.
    const lapsed = archived.rights.licences[0]!.endWeekExclusive
    expect(licence.permissionFor({ ...archived, market: { ...archived.market, tick: lapsed } } as GameState, r02, P, 'R3', SEQUEL, lapsed)).toEqual({ kind: 'refused', reason: `expired:${licenceId}` })
    // An estate SALE moves the title subject to the licence: the buyer cannot use the licensed scope during the term.
    const bid = estate.submitEstateBid(opened, { estateId: handoff.estateId, lotId: 'lot-p', bidderId: player, amount: 10_000 }, week, STABLE).state
    const sold = estate.resolveEstate({ ...bid, market: { ...bid.market, tick: D } } as GameState, handoff.estateId, D, STABLE)
    expect(rights.currentHolder(sold, P, D)).toMatchObject({ kind: 'holder', holderId: player, tradeable: true })
    expect(licence.permissionFor(sold, r02, P, 'R3', SEQUEL, D)).toEqual({ kind: 'permitted', via: 'licence', licenceId })
    expect(licence.permissionFor(sold, player, P, 'R3', SEQUEL, D)).toEqual({ kind: 'refused', reason: `noAuthority:${r02}` })
    expect(licence.permissionFor(sold, player, P, 'R3', REMAKE, D)).toEqual({ kind: 'permitted', via: 'title', licenceId: null })
    expect(() => rights.validateRightsRoot(sold as unknown as Record<string, unknown>, 'r2')).not.toThrow()
  })

  it('a licensed property the handoff leaves pending (not offered) keeps its licensee\'s authority from the closure week on', () => {
    const { state, r01, r02, week, property, film } = world()
    const P = property(r01)
    const granted = licensed(state, r01, r02, P, SEQUEL, week)
    const licenceId = granted.rights.licences[0]!.id
    const handoff = estateHandoffFor(granted, r01, week, [{ lotId: 'lot-f', subjects: [film(r01)], minimumBid: 1 }])
    expect(handoff.pending.some((p) => p.subject.right === 'R1' && p.subject.propertyId === (P as { propertyId: string }).propertyId)).toBe(true)
    const opened = estate.openEstate(granted, handoff, week, STABLE).state
    expect(licence.permissionFor(opened, r02, P, 'R3', SEQUEL, week)).toEqual({ kind: 'permitted', via: 'licence', licenceId })
    expect(rights.currentHolder(opened, P, week)).toEqual({ kind: 'holder', holderId: r01, tradeable: false, archived: false, estate: { estateId: handoff.estateId, lotId: null } })
  })
})

describe('r2 F5/F28/F42: an exclusive R3 licence limits the greenlight continuation hook and branch authority', () => {
  it('a same-concept greenlight is a remake: an exclusive remake licensee holds that authority, so the R1 holder is refused; other licensed uses leave it with the holder', () => {
    const { state, r01, r02, week, property, settled } = world()
    const P = property(r01)
    const conceptId = settled(r01).conceptId
    const production = { id: 'r2-remake-probe', conceptId } as Production
    const sequelOnly = licensed(state, r01, r02, P, SEQUEL, week)
    // Sequel licensed away: a remake (same concept) stays the holder's.
    expect(rights.greenlightRightsRefusal(sequelOnly, r01, conceptId, week)).toBeNull()
    const linked = rights.mintStoryPropertyAtGreenlight(sequelOnly, { studioId: r01, production, week })
    expect(linked.rights.properties.find((p) => p.propertyId === (P as { propertyId: string }).propertyId)!.workLinks).toContain(production.id)
    // Remake licensed away exclusively: the holder's same-concept greenlight refuses, and nothing is written.
    const remake = licensed(state, r01, r02, P, REMAKE, week)
    expect(rights.greenlightRightsRefusal(remake, r01, conceptId, week)).toMatch(/no continuation authority/)
    const before = stableStringify(remake)
    expect(() => rights.mintStoryPropertyAtGreenlight(remake, { studioId: r01, production, week })).toThrow(/no continuation authority.*noAuthority:/)
    expect(stableStringify(remake)).toBe(before)
  })

  it('branch authority is the parent\'s spin-off authority: an exclusive spin-off licensee holds it during the term; the title holder again after it', () => {
    const { state, r01, r02, week, property } = world()
    const P = property(r01) as { right: 'R1'; propertyId: string }
    const branch = { parentPropertyId: P.propertyId, branch: 'character:lead' }
    expect(rights.branchAuthority(state, branch, week)).toEqual({ kind: 'authority', studioId: r01, via: 'parent', propertyId: P.propertyId, promoted: false, licenceId: null })
    const spun = licensed(state, r01, r02, P, SPINOFF, week, 10)
    const licenceId = spun.rights.licences[0]!.id
    expect(rights.branchAuthority(spun, branch, week)).toEqual({ kind: 'authority', studioId: r02, via: 'parent', propertyId: P.propertyId, promoted: false, licenceId })
    // branch authority and permissionFor agree, for both studios.
    expect(licence.permissionFor(spun, r02, P, 'R3', SPINOFF, week).kind).toBe('permitted')
    expect(licence.permissionFor(spun, r01, P, 'R3', SPINOFF, week)).toEqual({ kind: 'refused', reason: `noAuthority:${r02}` })
    const later = { ...spun, market: { ...spun.market, tick: week + 10 } } as GameState
    expect(rights.branchAuthority(later, branch, week + 10)).toMatchObject({ kind: 'authority', studioId: r01, licenceId: null })
  })
})

describe('r2 F11: a continuation with its own concept links to the parent property and mints no R1', () => {
  it('the holder and an exclusive licensee each link under permissionFor; the excluded holder is refused; the link mints nothing for the new concept; the release titles the film under the parent', () => {
    const { state, player, r01, r02, week, property } = world()
    const P = property(r01) as { right: 'R1'; propertyId: string }
    const conceptOf = (id: string) => ({ id: `r2-cont-${id}`, conceptId: `r2-continuation-concept-${id}` }) as Production
    // Default authority: the R1 holder links a sequel with its own concept.
    const held = rights.linkContinuationAtGreenlight(state, { studioId: r01, production: conceptOf('a'), parentPropertyId: P.propertyId, use: 'sequel', week })
    const parent = rights.resolveTitles(held).properties.find((p) => p.propertyId === P.propertyId)!
    expect(parent.workLinks).toContain('r2-cont-a')
    expect(held.rights.properties.some((p) => p.conceptId === 'r2-continuation-concept-a')).toBe(false)
    expect(held.rights.titleEvents.filter((e) => e.cause === 'genesis' && e.subject.right === 'R1' && e.subject.propertyId === rights.storyPropertyId('r2-continuation-concept-a'))).toEqual([])
    // A stranger is refused, naming who holds the use.
    expect(() => rights.linkContinuationAtGreenlight(state, { studioId: player, production: conceptOf('b'), parentPropertyId: P.propertyId, use: 'sequel', week })).toThrow(new RegExp(`noAuthority:${r01}`))
    // An exclusive sequel licensee links; the grantor is refused for that use but may still link a remake.
    const granted = licensed(state, r01, r02, P, SEQUEL, week)
    expect(rights.resolveTitles(rights.linkContinuationAtGreenlight(granted, { studioId: r02, production: conceptOf('c'), parentPropertyId: P.propertyId, use: 'sequel', week }))
      .properties.find((p) => p.propertyId === P.propertyId)!.workLinks).toContain('r2-cont-c')
    expect(() => rights.linkContinuationAtGreenlight(granted, { studioId: r01, production: conceptOf('d'), parentPropertyId: P.propertyId, use: 'sequel', week })).toThrow(new RegExp(`noAuthority:${r02}`))
    expect(() => rights.linkContinuationAtGreenlight(granted, { studioId: r01, production: conceptOf('e'), parentPropertyId: P.propertyId, use: 'remake', week })).not.toThrow()
    // A concept that already founded a property is not a continuation: re-parenting it would launder its title.
    const own = rights.storyPropertyId(world().settled(r02).conceptId)
    expect(() => rights.linkContinuationAtGreenlight(state, { studioId: r01, production: { id: 'r2-cont-f', conceptId: own.slice('story-property:'.length) } as Production, parentPropertyId: P.propertyId, use: 'sequel', week }))
      .toThrow(/already founded/)
    // The continuation film's R2 genesis names the PARENT property.
    const released = rights.mintFilmTitleAtRelease(held, { studioId: r01, filmId: 'r2-cont-a', conceptId: 'r2-continuation-concept-a', title: 'The Sequel', week })
    expect(released.rights.filmTitles.find((t) => t.filmId === 'r2-cont-a')!.propertyId).toBe(P.propertyId)
    expect(released.rights.properties.find((p) => p.propertyId === P.propertyId)!.workLinks.filter((l) => l === 'r2-cont-a')).toHaveLength(1)
  })
})

describe('r2 F10/F35: the R4 surface works for television and merchandise, exclusive or not, once its consumer is live', () => {
  it('the gate refuses every R4 grant by default; lifted, R4 grants follow their own law and permissionFor answers nonexclusive and exclusive grantees', () => {
    const { state, r01, r02, r03, r04, week, film, property } = world()
    const F = film(r01)
    const grant = (over: Partial<licence.LicenceGrant>): licence.LicenceGrant =>
      ({ right: 'R4', subject: F, scope: TV, exclusive: false, startWeek: week, endWeekExclusive: week + 52, grantorId: r01, granteeId: r02, ...over })
    const LIVE = { r4ConsumerLive: true }
    expect(licence.licenceGrantRefusal(state, grant({}), week)).toBe('r4ConsumerNotLive')
    // Lifted: R1 or R2 subjects, exclusive or not, television or merchandise; continuation uses are not R4 scopes.
    expect(licence.licenceGrantRefusal(state, grant({}), week, LIVE)).toBeNull()
    expect(licence.licenceGrantRefusal(state, grant({ subject: property(r01), scope: { use: 'merchandise' }, exclusive: true }), week, LIVE)).toBeNull()
    expect(licence.licenceGrantRefusal(state, grant({ scope: SEQUEL }), week, LIVE)).toBe('invalidScope')
    expect(licence.licenceGrantRefusal(state, grant({ grantorId: r03 }), week, LIVE)).toBe('grantorNotHolder')
    // Two nonexclusive television grantees: both permitted, and the holder keeps its own authority.
    let s = licence.mintLicence(state, grant({}), week, 'rights-tx-r4-a', LIVE).state
    s = licence.mintLicence(s, grant({ granteeId: r03 }), week, 'rights-tx-r4-b', LIVE).state
    expect(licence.permissionFor(s, r02, F, 'R4', TV, week)).toMatchObject({ kind: 'permitted', via: 'licence' })
    expect(licence.permissionFor(s, r03, F, 'R4', TV, week)).toMatchObject({ kind: 'permitted', via: 'licence' })
    expect(licence.permissionFor(s, r01, F, 'R4', TV, week)).toEqual({ kind: 'permitted', via: 'title', licenceId: null })
    expect(licence.permissionFor(s, r04, F, 'R4', TV, week)).toEqual({ kind: 'refused', reason: `noAuthority:${r01}` })
    // An exclusive grant cannot overlap a live nonexclusive one of the same use.
    expect(licence.licenceGrantRefusal(s, grant({ granteeId: r04, exclusive: true }), week, LIVE)).toBe('exclusiveOverlap')
    // Alone, an exclusive television grant excludes the holder for its term.
    const ex = licence.mintLicence(state, grant({ exclusive: true }), week, 'rights-tx-r4-c', LIVE)
    expect(licence.permissionFor(ex.state, r02, F, 'R4', TV, week)).toEqual({ kind: 'permitted', via: 'licence', licenceId: ex.licence.id })
    expect(licence.permissionFor(ex.state, r01, F, 'R4', TV, week)).toEqual({ kind: 'refused', reason: `noAuthority:${r02}` })
    // The bilateral path stays gated until P18 lifts it.
    expect(sale.offerRefusal(state, { offerorId: r02, counterpartyId: r01, direction: 'buy', instrument: { kind: 'licence', right: 'R4', subject: F, scope: TV, exclusive: false, startWeek: week, endWeekExclusive: week + 52 }, price: 1 }, week, STABLE)).toBe('r4ConsumerNotLive')
  })
})

describe('r2 F62/F23: a rights refusal at greenlight is pure — at the front door and at a queued greenlight\'s dequeue', () => {
  it('after the player sells a concept\'s R1, its re-greenlight through applyActions refuses by name and the state is byte-identical', () => {
    const route = mintRoute()
    const h = route.greenlit.hollywood!
    const r01 = h.identities[1]!.studioId
    const P = { right: 'R1' as const, propertyId: rights.storyPropertyId(route.conceptId) }
    const cancelled = applyActions(route.greenlit, [{ kind: 'cancel', productionId: route.productionId }])
    const offered = sale.makeOffer(cancelled, { offerorId: h.playerStudioId, counterpartyId: r01, direction: 'sell', instrument: { kind: 'title', subject: P }, price: 0 }, 0, STABLE)
    const soldState = sale.answerRivalOffers(offered.state, 0, STABLE)
    expect(soldState.rights.offers[0]!.status).toBe('accepted')
    expect(rights.currentHolder(soldState, P, 0)).toMatchObject({ holderId: r01 })
    const concept = soldState.concepts.find((c) => c.id === route.conceptId)!
    const before = stableStringify(soldState)
    expect(() => applyActions(soldState, [{ kind: 'greenlight', production: greenlightPayload(soldState, concept) }])).toThrow(/no continuation authority over story-property:.*noAuthority:/)
    expect(stableStringify(soldState)).toBe(before)
  })

  it('a queued greenlight whose concept\'s R1 is sold while it waits expires at dequeue with the rights reason and leaves no event naming a production that never existed', () => {
    const fixture = industryContendedStudio('p16-r2-phantom-01')
    let s = fixture.state
    const h = s.hollywood!
    const r01 = h.identities[1]!.studioId
    const [prodA] = fixture.productionIds as [string, string]
    const projectA = s.scriptDevelopment.projects.find((p) => p.productionId === prodA)!
    const propertyId = rights.storyPropertyId(projectA.conceptId)
    // Cancel A (its screenplay returns to Ready), refill the slot, then queue A's re-greenlight behind full slots.
    s = applyActions(s, [{ kind: 'cancel', productionId: prodA }])
    s = applyActions(s, [{ kind: 'greenlightScriptProject', production: freePackage(s, fixture.readyProjectIds[0]!) }])
    s = applyActions(s, [{ kind: 'greenlightScriptProject', production: freePackage(s, projectA.id) }])
    expect(s.productionQueue.map((q) => q.kind)).toEqual(['greenlightScriptProject'])
    // Sell A's R1 to a rival while the intent waits (the rival answers under bound readers).
    const offered = sale.makeOffer(s, { offerorId: h.playerStudioId, counterpartyId: r01, direction: 'sell', instrument: { kind: 'title', subject: { right: 'R1', propertyId } }, price: 0 }, s.market.tick, STABLE)
    s = sale.answerRivalOffers(offered.state, s.market.tick, STABLE)
    expect(rights.currentHolder(s, { right: 'R1', propertyId }, s.market.tick)).toMatchObject({ holderId: r01 })
    const seqBefore = new Set(s.studioEvents.rows.map((r) => r.seq))
    let t = s
    for (let i = 0; i < 4 && t.productionQueue.length > 0; i++) t = tick(t)
    expect(t.productionQueue).toEqual([])
    const fresh = t.studioEvents.rows.filter((r) => !seqBefore.has(r.seq))
    const expired = fresh.filter((r) => r.kind === 'queueIntentExpired')
    expect(expired).toHaveLength(1)
    expect(JSON.stringify(expired[0])).toMatch(/no continuation authority/)
    const live = new Set([...t.studio.activeProductions.map((p) => p.id), ...t.studio.releasedFilms.map((f) => f.productionId)])
    const orphans = fresh.filter((r) => 'productionId' in r && typeof r.productionId === 'string' && !live.has(r.productionId))
    expect(orphans).toEqual([])
    expect(() => makeSave(t)).not.toThrow()
  })
})

describe('r2: the continuation hook and the R1 holder agree with permissionFor at every week of a licence term', () => {
  it('the holder regains remake authority the week an exclusive remake licence lapses', () => {
    const { state, r01, r02, week, property, settled } = world()
    const P = property(r01)
    const granted = licensed(state, r01, r02, P, REMAKE, week, 3)
    const conceptId = settled(r01).conceptId
    for (const w of [week, week + 1, week + 2]) expect(rights.greenlightRightsRefusal({ ...granted, market: { ...granted.market, tick: w } } as GameState, r01, conceptId, w)).not.toBeNull()
    const after = detached({ ...granted, market: { ...granted.market, tick: week + 3 } }) as GameState
    expect(rights.greenlightRightsRefusal(after, r01, conceptId, week + 3)).toBeNull()
  })
})
