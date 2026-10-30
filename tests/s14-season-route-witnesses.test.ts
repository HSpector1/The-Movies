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
//                             contesting the season's owners, and at the season's terminal boundary. CONTROL (FIX-S14-W1
//                             item 1): a clone of the same build that leaves out one action after commitment (the
//                             first week's shooting calls that change anything) exports the same commitment bytes and
//                             different bytes after N. A second seed proves nothing: the seed itself is in the save
//                             envelope (save.ts:6830) and in state (worldgen.ts:729).
//   W3 (contract §7)          the player sells the R1 title to a live rival after the scripts block. The buyer is chosen
//                             through the existing STABLE condition readers (tests/helpers/p16-fixtures.ts:164), a P16
//                             test device that decides only which rival P16 permits as a bidder; it splices nothing. The
//                             producer's production authority ends with the sale, so the first advance after it cancels
//                             the season at once (cause 'rights') under the v1 settlement; the commissioner's R4 licence
//                             survives. Owner decision 7c (playtest-response/OWNER-RULING-20261028.md) implemented the
//                             contract's automatic cancellation on grant-authority loss; before it (Sprint 14) the season
//                             stalled on rights each week until the C + 20 deadline cancelled it.
//   W4 (MEASUREMENT, sweep)   on W1's run, after every advance: no double-booked slot, the film and writing arms of the
//                             busy union disjoint from the season's arm (through the readers), the save validates (cash
//                             reconciles with the ledger), one 25,000 spend row per credited unit. The contention premise
//                             counts only a week the season actually lost: a capacity or set stall, a film on the adopted
//                             stage in the rehearsal or shooting block, or both Post slots held in the post block.
//
// Disclosed shortcut: the route's own P14B.2 fund rows (tests/helpers/p18-season-world.ts); nothing else is spliced.
// Budgets (FIX-S14-W1): first measurements, s14-r1 at 0cf00e40 ran this file in 57.9 s with three route builds; it now
// builds twice and replays one clone. Declared 300 s top-level and 240 s per describe hook; never to be widened.

import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { activeProductionCompanyTalentIds, activeWritingAssignmentIds, busyTalentIds } from '../src/core/employment.js'
import { assertNoDoubleBookedResourceSlots, occupiedResourceSlots } from '../src/core/occupancy.js'
import { permittedBidderRefusal } from '../src/core/rightsFinance.js'
import { exportCurrentState, exportSave, makeSave, validateSaveV51 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { tvDistributionPermission, tvProductionPermission } from '../src/core/tvCommission.js'
import { tvEngagedTalentIds } from '../src/core/tvReaders.js'
import type { GameState } from '../src/core/types.js'
import { STABLE } from './helpers/p16-fixtures.js'
import { sellTitle } from './helpers/p17-route.js'
import { FIGURES, agreement, commissioned, greenlightWith, player, season, television, tickUntil, tvRows, type SeasonRoute } from './helpers/p18-route.js'
import { buildSeasonWorld, type FilmCrew } from './helpers/p18-season-world.js'
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
  /** CONTROL only: the week whose shooting calls were left out (null in the measured run). */
  skippedWeek: number | null
}

/** W1's one action list: commission, greenlight each crew as soon as a Development & Casting slot is free, and before
 * every advance make the player's shooting calls. Ticks until the season leaves `live` (delivery or the deadline).
 * `skipFirstCalls` (the CONTROL) leaves out the first week's shooting calls that would change the state, and nothing else. */
function contestedRun(route: SeasonRoute, skipFirstCalls = false): ContestedRun {
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
  let skippedWeek: number | null = null
  while (season(s).status === 'live') {
    if (s.market.tick >= finalWeek) throw new Error(`p18 W1: the season is still live at its final week ${finalWeek}`)
    const directed = directFilms(s)
    if (skipFirstCalls && skippedWeek === null && directed !== s) skippedWeek = s.market.tick
    else s = directed
    s = tick(s)
    greenlightWaiting()
    states.push(s)
  }
  return { states, greenlitWeeks, skippedWeek }
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
  let control: ContestedRun
  beforeAll(() => {
    a = bytesOf(runA)
    b = bytesOf(contestedRun(buildSeasonWorld()))
    control = contestedRun(structuredClone(routeA), true)
  }, 240_000)

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

  it('CONTROL: one action left out after commitment (the first week of shooting calls) keeps the commitment bytes and changes the bytes after N', () => {
    const commit = runA.states[0]!.market.tick
    expect(control.skippedWeek, 'premise: a week of shooting calls changed the state within the first N advances').not.toBeNull()
    expect(control.skippedWeek!).toBeGreaterThanOrEqual(commit)
    expect(control.skippedWeek!).toBeLessThan(commit + N)
    expect(exportCurrentState(control.states[0]!) === a.commitment, 'commitment bytes').toBe(true)
    expect(control.states.length, 'the control season ran past N advances').toBeGreaterThan(N)
    expect(exportCurrentState(control.states[N]!) === a.afterN, `bytes after ${N} advances`).toBe(false)
  })
})

describe('S14 W4 — shared allocation order: no double spend, person or slot after any advance (MEASUREMENT; §9 :135)', () => {
  type Week = { week: number; block: string; doubleBooked: string | null; shared: string[]; seasonPeopleNotBusy: string[]; save: string | null; spendRows: number; units: number; contested: boolean }
  let rows: Week[]
  beforeAll(() => {
    const adoption = routeA.state.technology.adoptions.find((x) => x.id === routeA.adoptionId)!
    const stage = adoption.stageFacilityId
    const post = adoption.postFacilityId
    const filmOwner = (owner: string): boolean => owner === 'production' || owner === 'shootingTask'
    rows = runA.states.map((s) => {
      let doubleBooked: string | null = null
      try { assertNoDoubleBookedResourceSlots(s) } catch (error) { doubleBooked = (error as Error).message }
      let save: string | null = null
      try { makeSave(s) } catch (error) { save = (error as Error).message }
      // FIX-S14-W1 item 3: the film and writing arms of the busy union against the season's arm, each through its reader.
      const filmAndWriting = new Set([...activeProductionCompanyTalentIds(s), ...activeWritingAssignmentIds(s)])
      const seasonPeople = [...tvEngagedTalentIds(s.television)]
      const busy = busyTalentIds(s)
      // FIX-S14-W1 item 2: a week counts only if the season lost it to a film. Post has two slots (tuning.ts:684), so a
      // film on Post contests only when every Post slot is held in the season's post block.
      const sx = season(s)
      const live = sx.status === 'live'
      const slots = [...occupiedResourceSlots(s).entries()]
      const filmOn = (facilityId: string | null) => facilityId !== null && slots.some(([key, claims]) => key.startsWith(`${facilityId}:`) && claims.some((c) => filmOwner(c.owner)))
      const postCapacity = s.operations.facilities.find((f) => f.id === post)?.capacity ?? 0
      const postFull = post !== null && slots.filter(([key, claims]) => key.startsWith(`${post}:`) && claims.length > 0).length >= postCapacity
      const stall = sx.work.stall?.kind
      return {
        week: s.market.tick,
        block: sx.work.block,
        doubleBooked,
        shared: seasonPeople.filter((id) => filmAndWriting.has(id)),
        seasonPeopleNotBusy: seasonPeople.filter((id) => !busy.has(id)),
        save,
        spendRows: tvRows(s, 'tvProductionSpend').filter((r) => r.amount === -FIGURES.unitSpend).length,
        units: television(s)!.receipts.filter((r) => r.kind === 'unitCredited').length,
        contested: live && (stall === 'facility-capacity' || stall === 'set-unavailable'
          || ((sx.work.block === 'rehearsal' || sx.work.block === 'shooting') && filmOn(stage))
          || (sx.work.block === 'post' && postFull && filmOn(post))),
      }
    })
  }, 240_000)

  it('premise: in some live week the season lost a block to a film (a capacity or set stall, the adopted stage in rehearsal or shooting, or a full Post in post)', () => {
    expect(rows.some((r) => r.contested), JSON.stringify(rows.map((r) => [r.week, r.block, r.contested]))).toBe(true)
  })

  it('every advance: no slot booked twice; the film and writing arms of the busy union never share a person with the season\'s arm', () => {
    expect(rows.filter((r) => r.doubleBooked !== null).map((r) => [r.week, r.doubleBooked])).toEqual([])
    expect(rows.filter((r) => r.shared.length > 0).map((r) => [r.week, r.shared])).toEqual([])
  })

  it('structural premise, not a measurement: busyTalentIds adds the season\'s arm by construction (employment.ts:195)', () => {
    expect(rows.filter((r) => r.seasonPeopleNotBusy.length > 0).map((r) => [r.week, r.seasonPeopleNotBusy])).toEqual([])
  })

  it('every advance: the save validates (cash reconciles with the ledger) and each credited unit has exactly one spend row', () => {
    expect(rows.filter((r) => r.save !== null).map((r) => [r.week, r.save])).toEqual([])
    expect(rows.filter((r) => r.spendRows !== r.units).map((r) => [r.week, r.spendRows, r.units])).toEqual([])
    expect(rows[rows.length - 1]!.units, 'units credited over the run').toBeGreaterThan(0)
  })
})

describe('S14 W3 — an R1 title sale during a live season cancels it at once (contract §7; Owner decision 7c)', () => {
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
  }, 240_000)

  it('the sale lands: the producer loses its production authority, the commissioner keeps its licence', () => {
    const propertyId = season(sold).propertyId
    const production = tvProductionPermission(sold, propertyId, saleWeek)
    expect(production.kind).not.toBe('permitted')
    expect(production).toMatchObject({ reason: `noAuthority:${rival}` })
    expect(tvDistributionPermission(sold, propertyId, saleWeek)).toMatchObject({ kind: 'permitted', licenceId: season(sold).distributionLicenceId })
  })

  it('the first advance after the sale cancels the season at once (cause rights): nothing credited or spent, U0 then K paid, people and slots released', () => {
    // RED before Owner decision 7c: the season stayed live on a rights stall until the C + 20 deadline (Sprint 14 measurement).
    expect(after.length, 'advances between the sale and the terminal state').toBe(1)
    const end = after[0]!
    const s = season(end)
    const a = agreement(sold)
    const boundary = saleWeek + 1
    expect(end.market.tick).toBe(boundary)
    expect(s.status).toBe('cancelled')
    expect(s.cancellation).toEqual({ week: boundary, cause: 'rights' })
    expect(s.work.creditedUnits).toBe(season(sold).work.creditedUnits)
    expect(s.work.stall).toBeNull()
    expect(s.reservations).toEqual([])
    expect(tvRows(end, 'tvProductionSpend')).toHaveLength(tvRows(sold, 'tvProductionSpend').length)
    // U0 = P − E frozen at the cancellation (zero here: the scripts milestone recouped the advance before the sale); the
    // funded route pays U0 then K in full, each paid amount on its own row dated the advance week T − 1.
    const refund = a.received - a.earned
    expect(agreement(end).settlement).toEqual({ week: boundary, refundDue: refund, refundPaid: refund,
      chargeDue: a.terms.cancellationCharge, chargePaid: a.terms.cancellationCharge, closureId: null })
    expect(television(end)!.receipts.filter((r) => r.kind === 'cancelled')).toEqual([expect.objectContaining({ week: boundary, cause: 'rights', refundDue: refund, chargeDue: a.terms.cancellationCharge })])
    expect(tvRows(end).filter((row) => row.kind === 'tvAdvanceRefund' || row.kind === 'tvCancellationCharge').map((row) => [row.kind, -row.amount, row.week]))
      .toEqual([...(refund > 0 ? [['tvAdvanceRefund', refund, saleWeek]] : []), ['tvCancellationCharge', a.terms.cancellationCharge, saleWeek]])
    expect(tvDistributionPermission(end, s.propertyId, end.market.tick)).toMatchObject({ kind: 'permitted', licenceId: s.distributionLicenceId })
    expect(() => makeSave(end)).not.toThrow()
  })

  it('the validator accepts the tick causes only at a boundary after C and before the final week (review FIX-1 items 7, 9)', () => {
    const end = after[0]!
    const envelope = () => JSON.parse(exportSave(makeSave(end))) as { state: { television: { seasons: { cancellation: { week: number; cause: string } }[]; receipts: { kind: string; cause?: string }[] } } }
    expect(() => validateSaveV51(envelope())).not.toThrow()
    // The season's cause and its agreement's 'cancelled' receipt must agree (the validator replays the receipt), so both flip.
    const asParticipant = envelope(); asParticipant.state.television.seasons[0]!.cancellation.cause = 'participant'
    for (const r of asParticipant.state.television.receipts) if (r.kind === 'cancelled') r.cause = 'participant'
    // The same money and boundary rule as 'rights': the record is accepted on reload, cause by cause.
    expect(() => validateSaveV51(asParticipant)).not.toThrow()
    // A cause that is not one of the five is refused by name before any money rule.
    const bogus = envelope(); bogus.state.television.seasons[0]!.cancellation.cause = 'bogus'
    expect(() => validateSaveV51(bogus)).toThrow(/cancellation/)
    const atCommit = envelope(); atCommit.state.television.seasons[0]!.cancellation.week = season(end).commitWeek
    // The season credited work before the sale, so the week-order rule (a cancellation before the last credited week) refuses
    // this record first; a season that credited nothing is refused by the tick-cause rule itself. Either refusal is by name.
    expect(() => validateSaveV51(atCommit)).toThrow(/cancellation (shape or week|cause rights at week \d+ disagrees with its final boundary)/)
  })

  it('after the cancellation a further advance works, credits and charges nothing on the agreement', () => {
    const end = after[0]!
    const later = tick(end)
    expect(season(later).status).toBe('cancelled')
    expect(television(later)!.receipts.filter((r) => r.kind === 'cancelled')).toHaveLength(1)
    expect(tvRows(later)).toHaveLength(tvRows(end).length)
    expect(() => makeSave(later)).not.toThrow()
  })
})
