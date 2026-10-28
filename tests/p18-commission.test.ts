// ── P18 Sprint 12: commissioning one limited series' first season (contract §3-§5; decision 19A §3) ─────────
//
// One series, one six-episode season, ONE twelve-unit workload for one external commissioner. Acceptance asks P16 for
// the producer's live television production permission and has P16's licence producer mint the commissioner's exclusive
// distribution licence; it freezes credits on the exact P12 contracts, holds one Development & Casting slot through the
// shared occupancy owner, and pays the 120,000 advance once as recoupable cash. Every refusal names its cause before any
// write. RED at ecbc42c9 by assertion: the predecessor has no `commissionTvSeason` verb (its refusal text is compared).

import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds, weeklyPayroll } from '../src/core/employment.js'
import { FINANCE_CATEGORIES } from '../src/core/financeReport.js'
import { assertNoDoubleBookedResourceSlots, occupiedResourceSlots } from '../src/core/occupancy.js'
import type { GameState } from '../src/core/types.js'
import { greenlightPayload } from './helpers/p16-fixtures.js'
import { freshConcept, greenlightAs, sellTitle } from './helpers/p17-route.js'
import {
  COMMISSIONER, FIGURES, RULESET, agreement, attempt, commissioned, player, request, rosterIds, season, seasonRoute, sig, television,
  tvCommissionModule, tvRows, withCash, type SeasonRoute,
} from './helpers/p18-route.js'

let route: SeasonRoute
beforeAll(() => { route = seasonRoute() }, 240_000)

/** A refusal leaves its input byte for byte and names `pattern`. */
function refused(state: GameState, commission: ReturnType<typeof request>, pattern: RegExp): void {
  const before = sig(state)
  const result = attempt(state, commission)
  expect(result.error).toMatch(/^applyActions: commissionTvSeason rejected — /)
  expect(result.error).toMatch(pattern)
  expect(sig(state)).toBe(before)
}

describe('P18 commission — acceptance on the genuine P16 authorities', () => {
  it('writes one series and one six-episode season as one twelve-unit workload at commitment week C', () => {
    const C = route.state.market.tick
    const result = attempt(route.state, request(route))
    expect(result.error).toBeUndefined()
    const state = result.state!
    const root = television(state)!
    expect(root).toBeDefined()
    expect(root.series).toHaveLength(1)
    expect(root.seasons).toHaveLength(1)
    expect(root.series[0]).toMatchObject({ title: 'The Long Night', propertyId: route.propertyId, producerStudioId: player(state), createdWeek: C, seasonIds: [root.seasons[0]!.seasonId] })
    expect(season(state)).toMatchObject({
      seriesId: root.series[0]!.seriesId, producerStudioId: player(state), propertyId: route.propertyId, commissionerId: COMMISSIONER,
      seasonNumber: 1, episodes: 6, rulesetVersion: RULESET, adoptionId: route.adoptionId, status: 'live',
      commitWeek: C, dueWeek: C + FIGURES.dueWeeks, finalWeek: C + FIGURES.finalWeeks, setId: null, writerReleasedWeek: null,
      work: { block: 'scripts', creditedUnits: 0, blockCredited: 0, lastCreditedWeek: null, stall: null, stageHeldSinceWeek: null },
    })
    // Six is delivery metadata: no production, workflow or clock is created for the season.
    expect(state.studio.activeProductions).toEqual(route.state.studio.activeProductions)
    expect(state.operations.workflows).toEqual(route.state.operations.workflows)
  })

  it('the producer acts on its own live P16 title authority (televisionProduction), proved by permissionFor, not a payload', () => {
    const state = commissioned(route)
    expect(season(state).productionAuthority).toEqual({ via: 'title', licenceId: null })
    const title = state.rights.titleEvents.filter((e) => e.subject.right === 'R1' && (e.subject as { propertyId?: string }).propertyId === route.propertyId)
    expect(title.at(-1)).toMatchObject({ newHolder: player(state) })
  })

  it('P16 mints exactly one exclusive R4 televisionDistribution licence to the commissioner over [C, C + 72), at the disclosed zero consideration', () => {
    const C = route.state.market.tick
    const state = commissioned(route)
    const licences = state.rights.licences.filter((l) => !route.state.rights.licences.some((x) => x.id === l.id))
    expect(licences).toHaveLength(1)
    const licence = licences[0]!
    expect(licence.id).toBe(season(state).distributionLicenceId)
    expect(licence).toMatchObject({
      right: 'R4', subject: { right: 'R1', propertyId: route.propertyId }, scope: { use: 'televisionDistribution' }, exclusive: true,
      grantorId: player(state), granteeId: COMMISSIONER, startWeek: C, endWeekExclusive: C + FIGURES.finalWeeks + FIGURES.distributionWeeks, grantedWeek: C,
    })
    const tx = state.rights.transactions.find((t) => t.id === licence.transactionId)
    // UNRESOLVED (19A §3, Owner): the consideration. The zero is disclosed, never a hidden price; the agreement carries the money.
    expect(tx).toMatchObject({ kind: 'licenceGrant', payerId: COMMISSIONER, payeeId: player(state), amount: 0, offerId: null, licenceId: licence.id, titleEventIds: [] })
    // No title moves and no offer is written: the licence does not route through the studio-only offer path.
    expect(state.rights.titleEvents).toEqual(route.state.rights.titleEvents)
    expect(state.rights.offers).toEqual(route.state.rights.offers)
  })

  it('the commissioner is the versioned external party: no studio identity, business, facility, employee or account', () => {
    const state = commissioned(route)
    const h = state.hollywood!
    expect(season(state).commissionerId).toBe(COMMISSIONER)
    expect(agreement(state)).toMatchObject({ commissionerId: COMMISSIONER, studioId: player(state) })
    expect(h.identities.some((i) => i.studioId === COMMISSIONER)).toBe(false)
    expect(h.businesses.some((b) => b.studioId === COMMISSIONER)).toBe(false)
    expect(h.employment.some((row) => row.studioId === COMMISSIONER)).toBe(false)
    expect(JSON.stringify(h)).not.toContain(COMMISSIONER)
  })

  it('credits freeze each roster person on the exact P12 employment row that covers [C, C + 20); no new contract or payroll', () => {
    const C = route.state.market.tick
    const state = commissioned(route)
    const roles = ['writer', 'director', 'lead', 'antagonist', 'support', 'craft']
    expect(season(state).credits.map((c) => [c.role, c.talentId])).toEqual(roles.map((role, i) => [role, rosterIds(route.roster)[i]]))
    for (const credit of season(state).credits) {
      const row = state.hollywood!.employment.find((r) => r.contractId === credit.contractId)
      expect(row).toMatchObject({ studioId: player(state), endedWeek: null, terms: { talentId: credit.talentId } })
      expect(row!.terms.endWeekExclusive).toBeGreaterThanOrEqual(C + FIGURES.finalWeeks)
    }
    expect(state.contracts).toEqual(route.state.contracts)
    expect(weeklyPayroll(state, C)).toBe(weeklyPayroll(route.state, C))
  })
})

describe('P18 commission — refusals, each by name, each leaving the state untouched', () => {
  it('producer authority: a property whose R1 title the player sold, and an unknown property', () => {
    const rival = route.state.hollywood!.identities.find((i) => i.studioId !== player(route.state))!.studioId
    const sold = sellTitle(route.state, route.propertyId, rival)
    refused(sold, request(route), new RegExp(`no television production authority over ${route.propertyId} at week \\d+ \\(noAuthority:${rival}\\)`))
    refused(route.state, request(route, { propertyId: 'story-property:no-such' }), /no television production authority over story-property:no-such/)
  })

  it('one active season per studio: a second commission while the first is live', () => {
    const state = commissioned(route)
    refused(state, request(route, { seriesTitle: 'Another' }), new RegExp(`one active season per studio: "${season(state).seasonId}" is live`))
  })

  it('sound chain: an unknown adoption, and the real chain while it is still installing', () => {
    refused(route.state, request(route, { adoptionId: 'adoption-no-such' }), /"adoption-no-such" is not this studio's operational synchronized-dialogue chain/)
    refused(route.installing, request(route), new RegExp(`"${route.adoptionId}" is not this studio's operational synchronized-dialogue chain`))
  })

  it('contracted people: distinct, the right profession, studio-contracted, and idle', () => {
    const r = route.roster
    refused(route.state, request(route, { roster: { ...r, craftId: r.directorId } }), /the six roster people must be distinct/)
    refused(route.state, request(route, { roster: { ...r, writerId: r.directorId, directorId: r.writerId } }), new RegExp(`"${r.directorId}" has no writer profile for the writer role`))
    const busy = busyTalentIds(route.state)
    const freelancer = route.state.talent.find((t) => t.role === 'writer' && !busy.has(t.id) && !route.state.contracts.some((c) => c.talentId === t.id))!
    refused(route.state, request(route, { roster: { ...r, writerId: freelancer.id } }), new RegExp(`"${freelancer.id}" is not studio-contracted at week`))
    // The film company seats the season's director: the ONE availability union refuses the season.
    const concept = freshConcept(route.state)
    const seated = applyActions(route.state, [{ kind: 'greenlight', production: { ...greenlightPayload(route.state, concept), directorId: r.directorId } }])
    refused(seated, request(route), new RegExp(`"${r.directorId}" is already engaged`))
  })

  it('affordability: the quote is the floor + twenty weeks of fixed obligations + the provision, before the advance', async () => {
    const tv = await tvCommissionModule()
    expect(tv).not.toBeNull()
    const C = route.state.market.tick
    const quote = tv!.tvAdmissionQuote(route.state, C)
    expect(quote).toMatchObject({ weeks: FIGURES.quoteWeeks, floor: FIGURES.floor, provision: FIGURES.provision })
    expect(quote.payroll).toBeGreaterThan(0)
    expect(quote.required).toBe(quote.floor + quote.payroll + quote.overhead + quote.facilityOpex + quote.loanInstallments + quote.provision)
    // One dollar short refuses (the advance never counts toward it); the exact figure is admitted.
    const short = withCash(route.state, quote.required - 1)
    refused(short, request(route), new RegExp(`cash ${quote.required - 1} is below the admission quote ${quote.required} .*the advance is not counted`))
    const exact = attempt(withCash(route.state, quote.required), request(route))
    expect(exact.error).toBeUndefined()
    expect(exact.state!.studio.cash).toBe(quote.required + FIGURES.advance)
  })

  it('affordability without the quote module: floor + provision alone is not enough once people are on payroll', () => {
    refused(withCash(route.state, FIGURES.floor + FIGURES.provision), request(route), /is below the admission quote/)
  })
})

describe('P18 commission — the advance is recoupable cash, never earned revenue', () => {
  it('cash rises by exactly 120,000 on one tvAdvance row; E = 0, P = 120,000, U = 120,000; no revenue row', () => {
    const C = route.state.market.tick
    const state = commissioned(route)
    expect(state.studio.cash - route.state.studio.cash).toBe(FIGURES.advance)
    const added = state.ledger.slice(route.state.ledger.length)
    expect(added).toEqual([{ week: C, kind: 'tvAdvance', amount: FIGURES.advance, note: expect.stringMatching(/^tv-receipt-\d+$/) }])
    expect(tvRows(state)).toHaveLength(1)
    expect(agreement(state)).toMatchObject({ earned: 0, received: FIGURES.advance, milestones: [] })
    expect(agreement(state).terms).toMatchObject({ fee: FIGURES.fee, advance: FIGURES.advance, unitSpend: FIGURES.unitSpend,
      milestones: { scripts: FIGURES.scripts, pictureLock: FIGURES.pictureLock, delivery: FIGURES.delivery }, dueWeek: C + 16, finalWeek: C + 20,
      lateDeductionPerWeek: 12_000, lateDeductionMax: 48_000, cancellationCharge: 120_000, distributionWeeks: 52 })
    expect(added.some((row) => row.kind === 'studioRevenue' || row.kind === 'boxOffice')).toBe(false)
    expect((FINANCE_CATEGORIES as Record<string, string>).tvAdvance).toMatch(/recoupable, unearned/)
    const receipts = television(state)!.receipts
    expect(receipts.map((r) => r.kind)).toEqual(['commissioned', 'advancePaid'])
    expect(receipts[1]).toMatchObject({ week: C, amount: FIGURES.advance, receiptId: added[0]!.note })
  })
})

describe('P18 commission — shared capacity and availability through the film owners', () => {
  it('the season holds one Development & Casting slot under the occupancy owner `tvSeason`, and its six people join the one busy union', () => {
    const state = commissioned(route)
    const [reservation] = season(state).reservations
    expect(season(state).reservations).toHaveLength(1)
    expect(reservation).toMatchObject({ capability: 'development-casting' })
    const claims = occupiedResourceSlots(state, { capability: 'development-casting' }).get(`${reservation!.facilityId}:${reservation!.slot}`)
    expect(claims?.map((c) => [c.owner, c.ownerId])).toEqual([['tvSeason', season(state).seasonId]])
    const busy = busyTalentIds(state)
    for (const id of rosterIds(route.roster)) expect(busy.has(id)).toBe(true)
    expect(() => assertNoDoubleBookedResourceSlots(state)).not.toThrow()
  })

  it('a film greenlit after the commission never takes the season\'s slot; a full Development & Casting floor refuses the season', () => {
    const state = commissioned(route)
    const held = season(state).reservations[0]!
    const film = greenlightAs(state, freshConcept(state))
    const claims = occupiedResourceSlots(film.state, { capability: 'development-casting' }).get(`${held.facilityId}:${held.slot}`)
    expect(claims?.map((c) => c.owner)).toEqual(['tvSeason'])
    expect(() => assertNoDoubleBookedResourceSlots(film.state)).not.toThrow()
    // Fill every Development & Casting slot with films, then ask for a season: refused, never queued.
    let full = route.state
    const capacity = full.operations.facilities.filter((f) => f.capability === 'development-casting').reduce((n, f) => n + f.capacity, 0)
    for (let i = 0; i < capacity && occupiedResourceSlots(full, { capability: 'development-casting' }).size < capacity; i++) full = greenlightAs(full, freshConcept(full)).state
    expect(occupiedResourceSlots(full, { capability: 'development-casting' }).size, 'premise: films hold every Development & Casting slot').toBe(capacity)
    refused(full, request(route), /no free development-casting slot for the scripts block this week; a season is never queued/)
  })
})
