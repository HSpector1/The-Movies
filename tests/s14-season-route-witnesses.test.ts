// ── Sprint 14 slice 1: cross-system witnesses on the natural P18 season route ─────────────────────────────────
//
// Authority: P18-FIRST-SEASON-CONTRACT.md §9 :135 ("deterministic replay and shared allocation order with no double
// spend/person/slot"), §7 :111 (a live rights sale and the licence that survives encumbered transfer), :139 (the
// natural route bounded to 72 advances from commitment; a missing admissible setup is a finding). Owner assignment
// p16-sprint5/OWNER-ASSIGNMENT.txt:146-154 and rules 1-3 (:180-186): reuse the existing route, add a case only for an
// uncovered adopted law or acceptance gap, measure and never force.
//
// Every case here is a MEASUREMENT or a CONTROL of behaviour the base 0774e16e already implements, not a RED: the laws
// exist in the code, and no test compared them before. A failure is a finding to record, never a reason to bend a case.
//
//   W1 (MEASUREMENT, replay)  the route built twice from SEED with the same action list (the commission, both film
//                             crews greenlit as Development & Casting frees, the player's shooting calls each week)
//                             gives the same exported save bytes at commitment, after 8 advances with the films
//                             contesting the season's owners, and at the season's terminal boundary. CONTROL: the
//                             same route from another seed exports different bytes at commitment.
//   W3 (MEASUREMENT, Owner)   the player sells the R1 title to a live rival after the scripts block. Today the season
//                             stalls on rights each week and the C + 20 deadline cancels it with the v1 settlement; the
//                             commissioner's R4 licence survives. Owner items: the classification of "authority ends"
//                             (block or cancel at once) and the contract-required automatic cancellation on grant loss,
//                             not implemented (p18-sprint13/RESULTS.md, ACCEPTANCE OPEN).
//   W4 (MEASUREMENT, sweep)   on W1's run, after every advance: no double-booked slot, no person engaged twice, the
//                             save validates (cash reconciles with the ledger), one 25,000 spend row per credited unit.
//
// Disclosed shortcut: the route's own P14B.2 fund rows (tests/helpers/p18-season-world.ts); nothing else is spliced.
// Budgets: each heavy build runs in a hook with the budget declared beside it; cases only compare stored results.

import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds } from '../src/core/employment.js'
import { assertNoDoubleBookedResourceSlots, occupiedResourceSlots } from '../src/core/occupancy.js'
import { permittedBidderRefusal } from '../src/core/rightsFinance.js'
import { exportCurrentState, makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { tvDistributionPermission, tvProductionPermission } from '../src/core/tvCommission.js'
import { tvReservedPeople } from '../src/core/tvReaders.js'
import type { GameState } from '../src/core/types.js'
import { STABLE } from './helpers/p16-fixtures.js'
import { sellTitle } from './helpers/p17-route.js'
import { FIGURES, agreement, commissioned, greenlightWith, player, season, television, tickUntil, tvRows, type SeasonRoute } from './helpers/p18-route.js'
import { SEED, buildSeasonWorld, type FilmCrew } from './helpers/p18-season-world.js'

/** The CONTROL seed: the p13a world's own default seed, run through the same route. */
const OTHER_SEED = 'p13a-core-causal-01'
/** "After N advances with films contesting the season's owners": N, fixed before any run. */
const N = 8

const developmentCasting = (s: GameState): number => occupiedResourceSlots(s, { capability: 'development-casting' }).size
const developmentCastingCapacity = (s: GameState): number =>
  s.operations.facilities.filter((f) => f.capability === 'development-casting').reduce((n, f) => n + f.capacity, 0)

/** The player's shooting calls for this week, as the production board offers them (ui/src/engine/adapter.ts:930-1015):
 * call the locked director when the take is unassigned and nothing blocks it, then schedule a ready take. */
function directFilms(state: GameState): GameState {
  let s = state
  for (const workflow of s.operations.workflows) {
    const production = s.studio.activeProductions.find((p) => p.id === workflow.productionId)
    if (production === undefined || workflow.phase !== 'shooting' || workflow.shootingTask?.status !== 'unassigned' || workflow.blocker !== null) continue
    s = applyActions(s, [{ kind: 'assignShootingDirector', productionId: production.id, directorId: production.directorId }])
  }
  for (const workflow of s.operations.workflows) {
    if (workflow.phase !== 'shooting' || workflow.shootingTask?.status !== 'ready' || workflow.blocker !== null) continue
    s = applyActions(s, [{ kind: 'scheduleShootingTake', productionId: workflow.productionId }])
  }
  return s
}

type ContestedRun = {
  /** states[0] is the commitment week (the commission, then any film greenlit that week); then one state per advance. */
  states: GameState[]
  /** The week each crew's film was greenlit, in crew order (null if it never was). */
  greenlitWeeks: (number | null)[]
}

/** W1's one action list: commission, greenlight each crew as soon as a Development & Casting slot is free, and before
 * every advance make the player's shooting calls. Ticks until the season leaves `live` (delivery or the deadline). */
function contestedRun(route: SeasonRoute): ContestedRun {
  let s = commissioned(route)
  const crews: FilmCrew[] = route.crews
  const greenlitWeeks: (number | null)[] = crews.map(() => null)
  const greenlightWaiting = () => {
    for (let i = 0; i < crews.length; i++) {
      if (greenlitWeeks[i] !== null || developmentCasting(s) >= developmentCastingCapacity(s)) continue
      s = greenlightWith(s, crews[i]!).state
      greenlitWeeks[i] = s.market.tick
    }
  }
  greenlightWaiting()
  const states = [s]
  const finalWeek = season(s).finalWeek
  while (season(s).status === 'live') {
    if (s.market.tick >= finalWeek) throw new Error(`p18 W1: the season is still live at its final week ${finalWeek}`)
    s = tick(directFilms(s))
    greenlightWaiting()
    states.push(s)
  }
  return { states, greenlitWeeks }
}

type Bytes = { commitment: string; afterN: string; terminal: string; terminalStatus: string }
const bytesOf = (run: ContestedRun): Bytes => {
  const terminal = run.states[run.states.length - 1]!
  if (run.states.length <= N) throw new Error(`p18 W1: the season ended after ${run.states.length - 1} advances, before N = ${N}`)
  return { commitment: exportCurrentState(run.states[0]!), afterN: exportCurrentState(run.states[N]!), terminal: exportCurrentState(terminal), terminalStatus: season(terminal).status }
}

let routeA: SeasonRoute
let runA: ContestedRun
beforeAll(() => {
  routeA = buildSeasonWorld()
  runA = contestedRun(structuredClone(routeA))
}, 300_000)

describe('S14 W1 — same seed, same actions: byte identity on the P18 season route (MEASUREMENT; §9 :135)', () => {
  let a: Bytes
  let b: Bytes
  let other: { bytes: string } | { premise: string }
  beforeAll(() => {
    a = bytesOf(runA)
    b = bytesOf(contestedRun(buildSeasonWorld()))
    try {
      other = { bytes: exportCurrentState(commissioned(buildSeasonWorld(OTHER_SEED))) }
    } catch (error) {
      // Isolated, never swallowed: the CONTROL case below fails by this name while the identity cases still run.
      other = { premise: error instanceof Error ? error.message : String(error) }
    }
  }, 900_000)

  it('the films contest the season\'s owners within the measured window (premise of "after N advances")', () => {
    expect(runA.greenlitWeeks.every((w) => w !== null), `both crews' films are greenlit while the season is live: ${JSON.stringify(runA.greenlitWeeks)}`).toBe(true)
    expect(runA.greenlitWeeks[0], 'the first film is greenlit in the commitment week').toBe(runA.states[0]!.market.tick)
  })

  it('exports the same bytes at commitment, after N advances and at the terminal boundary', () => {
    expect(b.commitment === a.commitment, 'commitment bytes').toBe(true)
    expect(b.afterN === a.afterN, `bytes after ${N} advances`).toBe(true)
    expect(b.terminalStatus).toBe(a.terminalStatus)
    expect(['delivered', 'cancelled']).toContain(a.terminalStatus)
    expect(b.terminal === a.terminal, `terminal bytes (${a.terminalStatus})`).toBe(true)
  })

  it('CONTROL: another seed through the same route exports different bytes at commitment, so the comparison is not vacuous', () => {
    expect(other, `the ${OTHER_SEED} route reached its commission`).toHaveProperty('bytes')
    if (!('bytes' in other)) return
    expect(other.bytes === a.commitment, `${OTHER_SEED} versus ${SEED}`).toBe(false)
  })
})

describe('S14 W4 — shared allocation order: no double spend, person or slot after any advance (MEASUREMENT; §9 :135)', () => {
  type Week = { week: number; doubleBooked: string | null; twice: string[]; seasonPeopleNotBusy: string[]; save: string | null; spendRows: number; units: number; contested: boolean }
  let rows: Week[]
  beforeAll(() => {
    const adoption = routeA.state.technology.adoptions.find((x) => x.id === routeA.adoptionId)!
    const chain = [adoption.stageFacilityId, adoption.postFacilityId]
    rows = runA.states.map((s) => {
      let doubleBooked: string | null = null
      try { assertNoDoubleBookedResourceSlots(s) } catch (error) { doubleBooked = (error as Error).message }
      let save: string | null = null
      try { makeSave(s) } catch (error) { save = (error as Error).message }
      const seats = s.studio.activeProductions.flatMap((p) => [p.directorId, ...Object.values(p.cast), ...p.craftIds])
      const live = (s.television?.seasons ?? []).filter((x) => x.status === 'live')
      const seasonPeople = live.flatMap((x) => tvReservedPeople(x))
      const all = [...seats, ...seasonPeople]
      const busy = busyTalentIds(s)
      const filmOnChain = [...occupiedResourceSlots(s).entries()].some(([key, claims]) =>
        chain.some((facilityId) => facilityId !== null && key.startsWith(`${facilityId}:`)) && claims.some((c) => c.owner === 'production' || c.owner === 'shootingTask'))
      const stall = season(s).work.stall?.kind
      return {
        week: s.market.tick,
        doubleBooked,
        twice: [...new Set(all.filter((id, i) => all.indexOf(id) !== i))],
        seasonPeopleNotBusy: seasonPeople.filter((id) => !busy.has(id)),
        save,
        spendRows: tvRows(s, 'tvProductionSpend').filter((r) => r.amount === -FIGURES.unitSpend).length,
        units: television(s)!.receipts.filter((r) => r.kind === 'unitCredited').length,
        contested: live.length > 0 && (filmOnChain || stall === 'facility-capacity' || stall === 'set-unavailable'),
      }
    })
  }, 300_000)

  it('the films held the season\'s adopted stage or Post, or the season waited for capacity, in some live week (premise)', () => {
    expect(rows.some((r) => r.contested), JSON.stringify(rows.map((r) => [r.week, r.contested]))).toBe(true)
  })

  it('every advance: no slot booked twice, no person in two engagements, every season person in the busy union', () => {
    expect(rows.filter((r) => r.doubleBooked !== null).map((r) => [r.week, r.doubleBooked])).toEqual([])
    expect(rows.filter((r) => r.twice.length > 0).map((r) => [r.week, r.twice])).toEqual([])
    expect(rows.filter((r) => r.seasonPeopleNotBusy.length > 0).map((r) => [r.week, r.seasonPeopleNotBusy])).toEqual([])
  })

  it('every advance: the save validates (cash reconciles with the ledger) and each credited unit has exactly one spend row', () => {
    expect(rows.filter((r) => r.save !== null).map((r) => [r.week, r.save])).toEqual([])
    expect(rows.filter((r) => r.spendRows !== r.units).map((r) => [r.week, r.spendRows, r.units])).toEqual([])
    expect(rows[rows.length - 1]!.units, 'units credited over the run').toBeGreaterThan(0)
  })
})

describe('S14 W3 — an R1 title sale during a live season (MEASUREMENT; Owner: authority-ends classification, automatic cancellation on grant loss)', () => {
  let saleWeek: number
  let rival: string
  let atSale: GameState
  let sold: GameState
  let after: GameState[]
  beforeAll(() => {
    const route = structuredClone(routeA)
    // Mid-season: the first advance whose season has left the scripts block (the scripts milestone is earned).
    atSale = tickUntil(commissioned(route), (s) => season(s).work.block !== 'scripts', 20, 'the end of the scripts block')
    saleWeek = atSale.market.tick
    // A buyer P16 permits this week, chosen as p18-commission.test.ts:118-121 chooses it.
    const live = atSale.hollywood!.identities.find((i) => i.studioId !== player(atSale) && i.enteredWeek !== null
      && permittedBidderRefusal(atSale, i.studioId, saleWeek, STABLE) === null)
    if (live === undefined) throw new Error(`premise: no rival P16 permits to buy at week ${saleWeek}`)
    rival = live.studioId
    sold = sellTitle(atSale, route.propertyId, rival)
    after = []
    let s = sold
    const finalWeek = season(s).finalWeek
    while (season(s).status === 'live' && s.market.tick < finalWeek) {
      s = tick(s)
      after.push(s)
    }
  }, 300_000)

  it('the sale lands: the producer loses its production authority, the commissioner keeps its licence', () => {
    const propertyId = season(sold).propertyId
    const production = tvProductionPermission(sold, propertyId, saleWeek)
    expect(production.kind).not.toBe('permitted')
    expect(production).toMatchObject({ reason: `noAuthority:${rival}` })
    expect(tvDistributionPermission(sold, propertyId, saleWeek)).toMatchObject({ kind: 'permitted', licenceId: season(sold).distributionLicenceId })
  })

  it('measured today: every live advance stalls on rights, credits nothing and spends nothing', () => {
    const live = after.filter((s) => season(s).status === 'live')
    expect(live.length, 'live advances between the sale and the final boundary').toBeGreaterThan(0)
    for (const s of live) {
      expect(season(s).work.stall).toMatchObject({ kind: 'rights', reason: `production: noAuthority:${rival}` })
      expect(season(s).work.creditedUnits).toBe(season(sold).work.creditedUnits)
      expect(tvRows(s, 'tvProductionSpend')).toHaveLength(tvRows(sold, 'tvProductionSpend').length)
    }
  })

  it('measured today: the C + 20 deadline cancels it once with the v1 settlement; the commissioner\'s licence survives the cancellation', () => {
    const end = after[after.length - 1]!
    const s = season(end)
    const a = agreement(sold)
    expect(end.market.tick).toBe(season(sold).finalWeek)
    expect(s.status).toBe('cancelled')
    expect(s.cancellation).toEqual({ week: s.finalWeek, cause: 'deadline' })
    // U0 = P − E frozen at the cancellation; the funded route pays U0 then K in full.
    expect(agreement(end).settlement).toEqual({ week: s.finalWeek, refundDue: a.received - a.earned, refundPaid: a.received - a.earned,
      chargeDue: a.terms.cancellationCharge, chargePaid: a.terms.cancellationCharge, closureId: null })
    expect(television(end)!.receipts.filter((r) => r.kind === 'cancelled')).toHaveLength(1)
    expect(tvDistributionPermission(end, s.propertyId, end.market.tick)).toMatchObject({ kind: 'permitted', licenceId: s.distributionLicenceId })
    expect(() => makeSave(end)).not.toThrow()
  })
})
