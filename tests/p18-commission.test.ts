// ── P18 Sprint 12: commissioning one limited series' first season (contract §3-§5; decision 19A §3) ─────────
//
// One series, one six-episode season, ONE twelve-unit workload for one external commissioner. Acceptance asks P16 for
// the producer's live television production permission and has P16's licence producer mint the commissioner's exclusive
// distribution licence; it freezes credits on the exact P12 contracts, holds one Development & Casting slot through the
// shared occupancy owner, and pays the 120,000 advance once as recoupable cash. Every refusal names its cause before any
// write. RED at ecbc42c9 by assertion: the predecessor has no `commissionTvSeason` verb (its refusal text is compared).

import { beforeAll, describe, expect, it } from 'vitest'
import { absorptionRefusal, quoteAbsorption } from '../src/core/acquisition.js'
import { requestDiligence } from '../src/core/dueDiligence.js'
import { isOperatingStudio } from '../src/core/operatingState.js'
import { productionPhaseForRemainingTicksOrNull, requirementsForPhase } from '../src/core/productionPhases.js'
import { busyTalentIds, weeklyPayroll } from '../src/core/employment.js'
import { FINANCE_CATEGORIES } from '../src/core/financeReport.js'
import { prepareLiveWritingContext } from '../src/core/liveRetirementWriting.js'
import { permittedBidderRefusal } from '../src/core/rightsFinance.js'
import { validatedLiveProfessionContext } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { STABLE } from './helpers/p16-fixtures.js'
import { assertNoDoubleBookedResourceSlots, occupiedResourceSlots } from '../src/core/occupancy.js'
import type { GameState } from '../src/core/types.js'
import { sellTitle } from './helpers/p17-route.js'
import {
  COMMISSIONER, FIGURES, RULESET, agreement, attempt, commissioned, greenlightWith, player, request, rosterIds, season, seasonRoute, sig, television,
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
    // A buyer P16 permits this week (lane r3: the first identity was terminal by week 460, buyerNotPermitted:terminal).
    const week = route.state.market.tick
    const live = route.state.hollywood!.identities.find((i) => i.studioId !== player(route.state) && i.enteredWeek !== null
      && permittedBidderRefusal(route.state, i.studioId, week, STABLE) === null)
    expect(live, 'premise: a rival P16 permits to buy this week').toBeDefined()
    const rival = live!.studioId
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
    // A film crew seats the season's director: the ONE availability union refuses the season.
    const seated = greenlightWith(route.state, { ...route.crews[0]!, directorId: r.directorId }).state
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
    // Review should-fix 9: each component is what the next twenty advances actually charge. A clone ticks [C, C + 20)
    // without a commission, and its own mandatory ledger rows are summed by kind.
    let ahead = route.state
    for (let i = 0; i < FIGURES.quoteWeeks; i++) ahead = tick(ahead)
    const charged = ahead.ledger.slice(route.state.ledger.length).filter((row) => row.week >= C && row.week < C + FIGURES.quoteWeeks)
    // `0 - x`, never `-x`: an empty kind sums to 0 and `-0` fails toBe(0) (green-r5).
    const sum = (...kinds: string[]): number => 0 - charged.filter((row) => kinds.includes(row.kind)).reduce((total, row) => total + row.amount, 0)
    expect(quote.payroll, 'payroll and research payroll as charged').toBe(sum('payroll', 'researchPayroll'))
    expect(quote.overhead, 'studio overhead as charged').toBe(sum('overhead'))
    expect(quote.facilityOpex, 'facility operating cost as charged').toBe(sum('facilityOpex'))
    expect(quote.loanInstallments, 'loan installments as charged').toBe(sum('loanInstallment'))
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

describe('P18 commission — the request shape and the live profession proof', () => {
  it('refuses an extra request key, an extra roster key and a missing cast by name, never a bare TypeError (review should-fix 6)', () => {
    refused(route.state, { ...request(route), extra: 1 } as never, /the commission must carry exactly seriesTitle, propertyId, roster and adoptionId/)
    refused(route.state, request(route, { roster: { ...route.roster, extra: 'x' } as never }), /the roster must name exactly a writer, a director, a lead, an antagonist, a support and a craft lead/)
    const { cast: _cast, ...noCast } = route.roster
    refused(route.state, request(route, { roster: noCast as never }), /the roster must name exactly/)
  })

  it('a commissioned world still proves its live profession context, so retirement-writing authority survives (review blocking 1, P18-04)', () => {
    const state = commissioned(route)
    expect(() => validatedLiveProfessionContext(state)).not.toThrow()
    expect(prepareLiveWritingContext(state)).not.toMatchObject({ kind: 'rejected' }) // a refusal prints its reason (FIX-3)
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
    const film = greenlightWith(state, route.crews[0]!)
    const claims = occupiedResourceSlots(film.state, { capability: 'development-casting' }).get(`${held.facilityId}:${held.slot}`)
    expect(claims?.map((c) => c.owner)).toEqual(['tvSeason'])
    expect(() => assertNoDoubleBookedResourceSlots(film.state)).not.toThrow()
    // Fill every Development & Casting slot with films, then ask for a season: refused, never queued.
    let full = route.state
    const capacity = full.operations.facilities.filter((f) => f.capability === 'development-casting').reduce((n, f) => n + f.capacity, 0)
    for (const crew of route.crews) if (occupiedResourceSlots(full, { capability: 'development-casting' }).size < capacity) full = greenlightWith(full, crew).state
    expect(occupiedResourceSlots(full, { capability: 'development-casting' }).size, 'premise: films hold every Development & Casting slot').toBe(capacity)
    refused(full, request(route), /no free development-casting slot for the scripts block this week; a season is never queued/)
  })

  it('an absorption quote never seats a target picture on the season\'s Development & Casting slot (review item 3, FIX-3)', () => {
    // Films fill every Development & Casting slot the season leaves, as the case above does. A stable, loan-free rival
    // whose picture is in a phase that holds Development & Casting must then be refused `noCapacity:development-casting`.
    // RED at 5710f748: buyerOperations did not count the season's hold, so the allocator seated the picture on it.
    // STABLE readers, disclosed: they decide only the condition gates (stable, no loan), never the allocator verdict
    // under test. Retention is the explicit empty choice so the consent ask does not move with the consideration.
    let full = commissioned(route)
    const capacity = full.operations.facilities.filter((f) => f.capability === 'development-casting').reduce((n, f) => n + f.capacity, 0)
    for (const crew of route.crews) if (occupiedResourceSlots(full, { capability: 'development-casting' }).size < capacity) full = greenlightWith(full, crew).state
    const claims = [...occupiedResourceSlots(full, { capability: 'development-casting' }).values()].flat()
    expect(claims.length, 'premise: the season and films hold every Development & Casting slot').toBe(capacity)
    expect(claims.filter((c) => c.owner === 'tvSeason').map((c) => c.ownerId)).toEqual([season(full).seasonId])
    const week = full.market.tick
    const buyerId = player(full)
    const holdsDevelopment = (remainingTicks: number): boolean => {
      const phase = productionPhaseForRemainingTicksOrNull(remainingTicks)
      return phase !== null && requirementsForPhase(phase).includes('development-casting')
    }
    const tried: string[] = []
    let found: { targetId: string; productionId: string; quote: Extract<ReturnType<typeof quoteAbsorption>, { kind: 'quote' }> } | null = null
    for (const business of full.hollywood!.businesses) {
      const targetId = business.studioId
      const picture = business.productions.find((p) => holdsDevelopment(p.remainingTicks))
      if (picture === undefined || !isOperatingStudio(full, targetId)) continue
      const gate = absorptionRefusal(full, buyerId, targetId, week, STABLE)
      if (gate !== null) { tried.push(`${targetId}: ${gate}`); continue }
      let disclosed: ReturnType<typeof requestDiligence>
      try {
        disclosed = requestDiligence(full, { recipientId: buyerId, target: { kind: 'studio', studioId: targetId }, scope: ['rights', 'employment', 'liabilities'] }, week, STABLE)
      } catch (error) { tried.push(`${targetId}: ${(error as Error).message}`); continue } // reported in the premise message below
      const input = { buyerId, targetId, consideration: 0, retention: { kind: 'explicit' as const, contractIds: [] as string[] }, disclosureId: disclosed.record.id }
      const first = quoteAbsorption(disclosed.state, input, week, STABLE)
      const ask = first.kind === 'refusal' ? /^targetNotWilling:considerationBelowAsk:(\d+)$/.exec(first.refusal)?.[1] : '0'
      if (ask === undefined) { tried.push(`${targetId}: ${first.kind === 'refusal' ? first.refusal : 'quote'}`); continue }
      const quote = quoteAbsorption(disclosed.state, { ...input, consideration: Number(ask) }, week, STABLE)
      if (quote.kind !== 'quote') { tried.push(`${targetId}: ${quote.refusal}`); continue }
      found = { targetId, productionId: picture.id, quote }
      break
    }
    expect(found, `premise: a stable, loan-free rival with a picture holding Development & Casting at week ${week}; tried ${JSON.stringify(tried)}`).not.toBeNull()
    expect(found!.quote.productions.find((p) => p.productionId === found!.productionId)).toMatchObject({
      disposition: 'cancelRequired', reason: 'noCapacity:development-casting', blockedCapability: 'development-casting',
    })
  })
})
