import { actualEstatePrior } from './helpers/p16-actual-estate.js'
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
import { makeSave, stableStringify, exportCurrentState, importSave, migrateToLive } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { signRole } from './helpers/stabilization-staffing.js'
import { conditionRecord } from '../src/core/corporateConditionLive.js'
import { resolveShape } from '../src/core/shape.js'
import type { Action, FilmShape, GameState, Production } from '../src/core/types.js'
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
    const R04='studio-aca408ec-r04',R01='studio-aca408ec-r01',P={right:'R1' as const,propertyId:'story-property:studio-aca408ec-r04:concept:0'}
  const prior = actualEstatePrior(), before = stableStringify(prior)
  const request = { offerorId: R01, counterpartyId: R04, direction: 'buy' as const, price: 1_000,
    instrument: { kind: 'licence' as const, right: 'R3' as const, subject: P, scope: SEQUEL,
      exclusive: true, startWeek: 162, endWeekExclusive: 266 } }
  expect(sale.offerRefusal(prior, request, 162)).toBeNull()
  const offered = sale.makeOffer(prior, request, 162)
  const granted = sale.acceptOffer(offered.state, offered.offer.id, R04, 162)
  expect(stableStringify(prior)).toBe(before)
  makeSave(granted)
  const grantedLicence = granted.rights.licences.find(l => l.grantorId === R04 && l.granteeId === R01)!
  expect(grantedLicence).toBeDefined()
  const permission = { kind: 'permitted', via: 'licence', licenceId: grantedLicence.id }
  expect(licence.permissionFor(granted, R01, P, 'R3', SEQUEL, 162)).toEqual(permission)
  let state = tick(granted)
  const closure = state.studioClosure.closures.find(c => c.studioId === R04)!
  expect(closure).toBeDefined(); expect(closure.closureWeek).toBe(163)
  const opened = state.rights.estates.find(e => e.closureId === closure.closureId)!
  expect(opened).toBeDefined()
  const lot = opened.lots.find(l => l.subjects.some(s => s.right === 'R1' && s.propertyId === P.propertyId))!
  expect(lot).toBeDefined(); expect(lot.encumbrances).toEqual([`licence:${grantedLicence.id}`])
  expect(licence.permissionFor(state, R01, P, 'R3', SEQUEL, 163)).toEqual(permission)
  while (state.market.tick < opened.closesWeek - 1) {
    const old = state, bytes = stableStringify(old)
    state = tick(old); expect(stableStringify(old)).toBe(bytes)
  }
  const D = opened.closesWeek, beforeD = state
  state = tick(beforeD)
  makeSave(state)
  expect(rights.currentHolder(state, P, D)).toMatchObject({ kind: 'holder', holderId: `estate:${R04}`, archived: true, tradeable: false })
  expect(licence.permissionFor(state, R01, P, 'R3', SEQUEL, D)).toEqual(permission)
  expect(rights.rightsAuthority(state, P, 'R3', D, SEQUEL)).toEqual({ kind: 'authority', studioId: R01, via: 'licence', licenceId: grantedLicence.id })
  expect(licence.licencesHeldBy(state, R01, D).map(l => l.id)).toEqual([grantedLicence.id])
  expect(licence.permissionFor(state, R01, P, 'R3', REMAKE, D)).toEqual({ kind: 'refused', reason: 'archived' })
  // Read-only as-of term query, not a fabricated future save or tick.
  expect(licence.permissionFor(state, R01, P, 'R3', SEQUEL, grantedLicence.endWeekExclusive)).toEqual({ kind: 'refused', reason: `expired:${grantedLicence.id}` })
  // Independent ordinary D successor: the title transfers subject to the same licence.
  const buyer = beforeD.hollywood!.playerStudioId
  const bid = { estateId: opened.estateId, lotId: lot.lotId, bidderId: buyer, amount: 13_000_000 }
  expect(lot.minimumBid).toBeLessThanOrEqual(bid.amount)
  expect(estate.estateBidRefusal(beforeD, bid, D - 1)).toBeNull()
  const sold = tick(estate.submitEstateBid(beforeD, bid, D - 1).state)
  makeSave(sold)
  expect(()=>rights.validateRightsRoot(sold as unknown as Record<string,unknown>,'r2')).not.toThrow()
  expect(rights.currentHolder(sold, P, D)).toMatchObject({ kind: 'holder', holderId: buyer, tradeable: true })
  expect(licence.permissionFor(sold, R01, P, 'R3', SEQUEL, D)).toEqual(permission)
  expect(licence.permissionFor(sold, buyer, P, 'R3', SEQUEL, D)).toEqual({ kind: 'refused', reason: `noAuthority:${R01}` })
  expect(licence.permissionFor(sold, buyer, P, 'R3', REMAKE, D)).toEqual({ kind: 'permitted', via: 'title', licenceId: null })
  expect(sold.hollywood!.employment).toEqual(state.hollywood!.employment)
  expect(sold.hollywood!.activeEmploymentOrdinals).toEqual(state.hollywood!.activeEmploymentOrdinals)
  const text = exportCurrentState(state)
  expect(exportCurrentState(migrateToLive(importSave(text)).state)).toBe(text)
  })

  // Replaces the inadmissible synthetic handoff; actual pending reason is activeProduction.
  it('a paid sequel licence survives actual player closure while its original owner’s unscheduled remake makes the title pending', () => {
    const R01 = 'studio-aca408ec-r01'
    const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }
    const prior = actualEstatePrior(), original = stableStringify(prior)
    let state = prior
    const player = state.hollywood!.playerStudioId, week = state.market.tick
    expect(week).toBe(162)
    expect(state.scriptDevelopment.mode).toBe('legacy')
    expect(state.operations.mode).toBe('managed')
    expect(state.studio.activeProductions).toEqual([])
    expect(state.studio.releasedFilms).toEqual([])
    const used = new Set<string>()
    const writer = signRole(state, 'writer', 1, used); state = writer.state
    const director = signRole(state, 'director', 1, used); state = director.state
    const actors = signRole(state, 'actor', 3, used); state = actors.state
    const craft = signRole(state, 'craft', 1, used); state = craft.state
    const concept = state.concepts[0]!
    const greenlight: Action & { kind: 'greenlight' } = { kind: 'greenlight', production: {
      conceptId: concept.id, shape: SHAPE,
      promise: { genre: concept.genre, intendedSegments: ['adult'],
        ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] } },
      writerId: writer.ids[0]!, directorId: director.ids[0]!, craftIds: [craft.ids[0]!],
      cast: { lead: actors.ids[0]!, antagonist: actors.ids[1]!, support: actors.ids[2]! },
      budget: { negative: concept.baseNegativeCost * resolveShape(SHAPE).budgetDemandMultiplier * state.era.costScale, marketing: 0 },
    } }
    const firstCash = state.studio.cash
    state = applyActions(state, [greenlight])
    const cancelledId = state.studio.activeProductions.at(-1)!.id
    expect(state.studio.cash).toBe(firstCash - greenlight.production.budget.negative)
    const paidOnce = state.studio.cash
    state = applyActions(state, [{ kind: 'cancel', productionId: cancelledId }])
    expect(state.studio.cash).toBe(paidOnce)
    const subject = { right: 'R1' as const, propertyId: rights.storyPropertyId(concept.id) }
    expect(licence.blockingEncumbrance(state, subject)).toBeNull()
    expect(rights.currentHolder(state, subject, week)).toMatchObject({ holderId: player, tradeable: true })
    makeSave(state)

    // R01 is the buyer/payer/licensee. The player is the seller/payee/grantor and keeps R1.
    const request = { offerorId: R01, counterpartyId: player, direction: 'buy' as const, price: 1_000,
      instrument: { kind: 'licence' as const, right: 'R3' as const, subject, scope: SEQUEL,
        exclusive: true, startWeek: week, endWeekExclusive: week + 104 } }
    expect(sale.offerRefusal(state, request, week)).toBeNull()
    const beforeGrant = state.studio.cash
    const buyerCash = state.hollywood!.businesses.find(b => b.studioId === R01)!.account.cash
    const offered = sale.makeOffer(state, request, week)
    state = sale.acceptOffer(offered.state, offered.offer.id, player, week)
    const grantedLicence = state.rights.licences.find(l => l.grantorId === player && l.granteeId === R01 && l.subject.right === 'R1' && l.subject.propertyId === subject.propertyId)!
    expect(grantedLicence).toBeDefined()
    expect(state.rights.transactions.find(t => t.id === grantedLicence.transactionId)).toMatchObject({
      kind: 'licenceGrant', payerId: R01, payeeId: player, amount: 1_000, licenceId: grantedLicence.id,
    })
    expect(state.studio.cash).toBe(beforeGrant + 1_000)
    expect(state.hollywood!.businesses.find(b => b.studioId === R01)!.account.cash).toBe(buyerCash - 1_000)
    const licensed = { kind: 'permitted', via: 'licence', licenceId: grantedLicence.id }
    expect(licence.permissionFor(state, R01, subject, 'R3', SEQUEL, week)).toEqual(licensed)
    expect(licence.permissionFor(state, player, subject, 'R3', REMAKE, week)).toEqual({ kind: 'permitted', via: 'title', licenceId: null })
    makeSave(state)

    // All required company seats have real contracts, so the unchanged greenlight owes no freelancer fees.
    // This one declared policy spends the available whole dollars; no price/seed/clock search follows.
    const available = state.studio.cash, filmBudget = Math.floor(available)
    expect(filmBudget).toBeGreaterThan(0)
    const beforeProductionRows = state.ledger.length
    state = applyActions(state, [{ ...greenlight, production: { ...greenlight.production,
      budget: { negative: filmBudget, marketing: 0 } } }])
    const productionId = state.studio.activeProductions.at(-1)!.id
    expect(productionId).not.toBe(cancelledId)
    expect(state.studio.cash).toBe(available - filmBudget)
    expect(state.studio.cash).toBeGreaterThanOrEqual(0)
    expect(state.studio.cash).toBeLessThan(1)
    expect(state.ledger.slice(beforeProductionRows)).toEqual([
      { week, kind: 'production', amount: -filmBudget, productionId, note: 'negative + marketing' },
    ])
    expect(licence.blockingEncumbrance(state, subject)).toBe('activeProduction')
    expect(licence.permissionFor(state, R01, subject, 'R3', SEQUEL, week)).toEqual(licensed)
    makeSave(state)

    // The capture has managed operations despite legacy script development. Entering Shooting
    // creates an unassigned task; no assignment/load-in/take action is issued here, so the real
    // first-take gate holds this remake at 5. Payroll/overhead then causes actual player closure.
    // This is not a distress pause or a picture that reached the separate Release Ready gate.
    const expectedClosure = week + 33
    for (let i = 0; i < 33; i++) state = tick(state)
    const closure = state.studioClosure.closures.find(c => c.studioId === player)!
    expect(state.market.tick).toBe(expectedClosure)
    expect(closure).toBeDefined()
    expect(closure.closureWeek).toBe(expectedClosure)
    expect(conditionRecord(state, player)?.condition.stage).toBe('closed')
    expect(state.corporateCondition.loans.filter(l => l.studioId === player)).toEqual([])
    expect(state.studio.activeProductions.find(p => p.id === productionId)).toMatchObject({ conceptId: concept.id, remainingTicks: 5 })
    expect(state.operations.workflows.find(w => w.productionId === productionId)).toMatchObject({
      phase: 'shooting', shootingTask: { status: 'unassigned', directorId: director.ids[0]! }, blocker: null,
    })
    expect(state.studio.releasedFilms).toEqual([])
    expect(state.releaseAuthority.commitments).toEqual([])
    expect(closure.dispositions).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectKind: 'production', subjectId: productionId, status: 'applied' }),
    ]))
    const estate = state.rights.estates.find(e => e.closureId === closure.closureId)!
    expect(estate).toBeDefined()
    expect(estate.pending).toContainEqual({ subject, reason: 'activeProduction', status: 'pending' })
    expect(estate.lots.flatMap(l => l.subjects)).not.toContainEqual(subject)
    expect(licence.permissionFor(state, R01, subject, 'R3', SEQUEL, expectedClosure)).toEqual(licensed)
    expect(rights.currentHolder(state, subject, expectedClosure)).toEqual({ kind: 'holder', holderId: player,
      tradeable: false, archived: false, estate: { estateId: estate.estateId, lotId: null } })
    makeSave(state)
    const saved = exportCurrentState(state)
    expect(exportCurrentState(migrateToLive(importSave(saved)).state)).toBe(saved)
    expect(stableStringify(prior)).toBe(original)
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
