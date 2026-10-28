// ── P18 Sprint 12: the season's real paid work (contract §4-§5) ──────────────────────────────────────────
//
// Twelve counted units in the fixed blocks 3/1/1/4/3, at most one per advance, each one a real 25,000 expense on one
// ledger row joined to its receipt. Capacity comes from the week's one allocation sweep through the same occupancy
// owners as films (`tvSeason`): Development & Casting for scripts and preparation, the adopted sound stage with a
// standing set for rehearsal, stage + set + scenery for shooting, the adopted Post for post. The scripts milestone earns
// 120,000 and pays nothing (the advance covers it); picture lock earns 240,000 and pays 240,000. The writer leaves after
// scripts; the other five stay engaged (delivery, lateness and settlement are Sprint 13). RED at ecbc42c9 by assertion.

import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds } from '../src/core/employment.js'
import { prepareLiveWritingContext } from '../src/core/liveRetirementWriting.js'
import { assertNoDoubleBookedResourceSlots, occupiedResourceSlots } from '../src/core/occupancy.js'
import * as operations from '../src/core/operations.js'
import { facilityEngagements } from '../src/core/placement.js'
import { validatedLiveProfessionContext } from '../src/core/save.js'
import { repairSetRefusal, strikeSetRefusal } from '../src/core/sets.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import {
  BLOCK_ORDER, FIGURES, UNITS, agreement, attempt, request, season, seasonRoute, television, tvRows, withCash, type SeasonRoute,
} from './helpers/p18-route.js'

let route: SeasonRoute
/** The commissioned state, then the state after each advance until the twelfth unit or the final boundary. */
let weeks: GameState[] = []
beforeAll(() => {
  route = seasonRoute()
  const commissioned = attempt(route.state, request(route))
  if (commissioned.error !== undefined) return // each test asserts the commission itself first
  weeks = [commissioned.state]
  let state = commissioned.state
  const finalWeek = season(state).finalWeek
  while (season(state).work.creditedUnits < 12 && state.market.tick < finalWeek) {
    state = tick(state)
    weeks.push(state)
  }
}, 300_000)

const last = (): GameState => weeks[weeks.length - 1]!
const units = (state: GameState) => television(state)!.receipts.filter((r) => r.kind === 'unitCredited') as unknown as { receiptId: string; week: number; block: string; creditedUnits: number; amount: number }[]

describe('P18 work — twelve paid units in the contract blocks', () => {
  it('credits 3/1/1/4/3 units in block order, at most one per advance, inside [C, C + 20]', () => {
    expect(weeks.length, 'the lawful commission must be accepted').toBeGreaterThan(0)
    const done = last()
    expect(season(done).work, `stall ${JSON.stringify(season(done).work.stall)}`).toMatchObject({ creditedUnits: 12, block: 'post', blockCredited: UNITS.post })
    const expected = BLOCK_ORDER.flatMap((block) => Array.from({ length: UNITS[block] }, () => block))
    expect(units(done).map((r) => r.block)).toEqual(expected)
    expect(units(done).map((r) => r.creditedUnits)).toEqual(expected.map((_, i) => i + 1))
    const unitWeeks = units(done).map((r) => r.week)
    for (let i = 1; i < unitWeeks.length; i++) expect(unitWeeks[i]!).toBeGreaterThan(unitWeeks[i - 1]!)
    expect(unitWeeks[0]!).toBeGreaterThan(season(done).commitWeek)
    expect(unitWeeks.at(-1)!).toBeLessThanOrEqual(season(done).finalWeek)
    for (let i = 1; i < weeks.length; i++) {
      expect(season(weeks[i]!).work.creditedUnits - season(weeks[i - 1]!).work.creditedUnits).toBeLessThanOrEqual(1)
    }
  })

  it('every unit is one real 25,000 tvProductionSpend row in the advance it was credited, joined to its receipt', () => {
    expect(weeks.length).toBeGreaterThan(0)
    const done = last()
    const spend = tvRows(done, 'tvProductionSpend')
    expect(spend).toHaveLength(12)
    expect(spend.map((row) => [row.week, row.amount, row.note])).toEqual(units(done).map((r) => [r.week - 1, -FIGURES.unitSpend, r.receiptId]))
    for (let i = 1; i < weeks.length; i++) {
      const before = weeks[i - 1]!, after = weeks[i]!
      const added = after.ledger.slice(before.ledger.length)
      // The engine's money identity holds with the television rows in it: cash moves by exactly the rows written.
      expect(after.studio.cash - before.studio.cash).toBe(added.reduce((sum, row) => sum + row.amount, 0))
      const credited = season(after).work.creditedUnits - season(before).work.creditedUnits
      expect(added.filter((row) => row.kind === 'tvProductionSpend')).toHaveLength(credited)
    }
  })

  it('milestones: scripts earns 120,000 and pays 0; picture lock earns 240,000 and pays 240,000 (pay = max(0, E − P))', () => {
    expect(weeks.length).toBeGreaterThan(0)
    const afterScripts = weeks.find((s) => season(s).work.creditedUnits === UNITS.scripts)!
    expect(agreement(afterScripts)).toMatchObject({ earned: FIGURES.scripts, received: FIGURES.advance })
    expect(agreement(afterScripts).milestones).toEqual([{ kind: 'scripts', week: units(afterScripts).at(-1)!.week, earned: FIGURES.scripts, paid: 0 }])
    expect(tvRows(afterScripts, 'tvMilestonePayment')).toEqual([])
    const done = last()
    expect(agreement(done)).toMatchObject({ earned: FIGURES.scripts + FIGURES.pictureLock, received: FIGURES.advance + FIGURES.pictureLock })
    expect(agreement(done).milestones.map((m) => [m.kind, m.earned, m.paid])).toEqual([['scripts', FIGURES.scripts, 0], ['pictureLock', FIGURES.pictureLock, FIGURES.pictureLock]])
    const lockWeek = units(done)[UNITS.scripts + UNITS.preparation + UNITS.rehearsal + UNITS.shooting - 1]!.week
    expect(tvRows(done, 'tvMilestonePayment').map((row) => [row.week, row.amount])).toEqual([[lockWeek - 1, FIGURES.pictureLock]])
    // Delivery stays unearned at this checkpoint (Sprint 13): E = 360,000 < F.
    expect(agreement(done).earned).toBeLessThan(FIGURES.fee)
  })

  it('the writer is released when scripts completes; the other five stay engaged through the twelfth unit', () => {
    expect(weeks.length).toBeGreaterThan(0)
    const r = route.roster
    const afterScripts = weeks.find((s) => season(s).work.creditedUnits === UNITS.scripts)!
    expect(season(afterScripts).writerReleasedWeek).toBe(units(afterScripts).at(-1)!.week)
    expect(busyTalentIds(afterScripts).has(r.writerId)).toBe(false)
    for (const id of [r.directorId, r.cast.lead, r.cast.antagonist, r.cast.support, r.craftId]) {
      expect(busyTalentIds(afterScripts).has(id)).toBe(true)
      expect(busyTalentIds(last()).has(id)).toBe(true)
    }
    expect(season(weeks[0]!).writerReleasedWeek).toBeNull()
  })
})

describe('P18 work — capacity through the same owners as films', () => {
  it('each block holds exactly its contract capabilities as `tvSeason` claims; stage and Post are the adopted chain\'s', () => {
    expect(weeks.length).toBeGreaterThan(0)
    const adoption = route.state.technology.adoptions.find((a) => a.id === route.adoptionId)!
    const capabilities: Record<string, string[]> = { scripts: ['development-casting'], preparation: ['development-casting'], rehearsal: ['soundstage'], shooting: ['soundstage', 'set-scenery'], post: ['post'] }
    let sawStage = false
    for (const state of weeks) {
      expect(() => assertNoDoubleBookedResourceSlots(state)).not.toThrow()
      const s = season(state)
      if (s.work.creditedUnits === 12) continue
      for (const reservation of s.reservations) {
        expect(capabilities[s.work.block]).toContain(reservation.capability)
        const claims = occupiedResourceSlots(state).get(`${reservation.facilityId}:${reservation.slot}`) ?? []
        expect(claims.map((c) => [c.owner, c.ownerId])).toEqual([['tvSeason', s.seasonId]])
        if (reservation.capability === 'soundstage') {
          sawStage = true
          expect(reservation.facilityId).toBe(adoption.stageFacilityId)
          expect(s.setId).not.toBeNull()
          const setClaims = [...occupiedResourceSlots(state).values()].flat().filter((c) => c.kind === 'set' && c.owner === 'tvSeason')
          expect(setClaims.map((c) => (c as { setId?: string }).setId)).toEqual([s.setId])
        }
        if (reservation.capability === 'post') expect(reservation.facilityId).toBe(adoption.postFacilityId)
      }
    }
    expect(sawStage, 'the season held the adopted stage during rehearsal or shooting').toBe(true)
    // The twelfth unit releases every slot; the people stay until the Sprint 13 delivery boundary.
    expect(season(last()).reservations).toEqual([])
  })

  it('while the season holds the stage, its set cannot be struck and the stage names the season as an engagement (review 12)', () => {
    expect(weeks.length).toBeGreaterThan(0)
    const held = weeks.find((state) => season(state).reservations.some((r) => r.capability === 'soundstage'))
    expect(held, 'premise: the season held the adopted stage in some week').toBeDefined()
    const s = season(held!)
    const stage = s.reservations.find((r) => r.capability === 'soundstage')!
    expect(strikeSetRefusal(held!, s.setId!)).toEqual({ code: 'setHeldByTelevision', setId: s.setId, seasonId: s.seasonId })
    // Repair answers by its earlier rules first (a whole house set is `alreadyWhole`); when it reaches the hold it names it.
    const repair = repairSetRefusal(held!, s.setId!)
    expect(repair === null ? null : repair.code).not.toBeNull()
    if (repair !== null && repair.code !== 'alreadyWhole' && repair.code !== 'notStanding') expect(repair).toEqual({ code: 'setHeldByTelevision', setId: s.setId, seasonId: s.seasonId })
    const engagements = facilityEngagements(held!, stage.facilityId)
    expect(engagements.filter((e) => e.kind === 'tvSeason').map((e) => e.holderId)).toContain(s.seasonId)
    expect(engagements.find((e) => e.kind === 'tvSeason')!.activity).toMatch(/television (rehearsal|shooting)|shooting a television season/)
  })

  it('films are served before a season on equal waits (pinned policy constant; ACCEPTANCE OPEN, see NOTES)', () => {
    expect((operations as Record<string, unknown>).SWEEP_KIND_RANK).toEqual({ production: 0, tvSeason: 1 })
  })

  it('the exported sweep serves the film before the season on an equal wait, and the longer wait first otherwise (FIX-3)', () => {
    // A pure call of advanceManagedProductions. The film id `zz-film` sorts AFTER `tv-season-1` under the ordinal law,
    // so only the kind rank can put the film first on a tie. The film has no workflow on purpose: the sweep throws by
    // name at its first visit, which makes the visit order observable without building a capacity contest. Disclosed
    // limit: this proves the service ORDER the slot contest depends on, not a contested slot changing hands.
    // RED at ecbc42c9 (no participants parameter: the longer-waiting season is never attempted) and on any build whose
    // comparator ignores kindRank (the season would be attempted first on the tie).
    expect(weeks.length, 'the lawful commission must be accepted').toBeGreaterThan(0)
    const ops = weeks[0]!.operations
    const week = weeks[0]!.market.tick
    const film = { id: 'zz-film', startTick: week - 5, remainingTicks: 10, directorId: null } as unknown as operations.ProductionClockView
    const filmWait = operations.productionWaitWeeks(film, week)
    const visit = (waitWeeks: number): number => {
      let attempts = 0
      const participant: operations.SweepParticipant = {
        id: 'tv-season-1', kind: 'tvSeason', waitWeeks, held: new Set<string>(),
        attempt: () => { attempts += 1; return null },
      }
      expect(() => operations.advanceManagedProductions(ops, [film], week, new Set<string>(), new Set<string>(), undefined, undefined, undefined, undefined, [participant]))
        .toThrow(/managed productionId "zz-film" has no authoritative workflow/)
      return attempts
    }
    expect(visit(filmWait), 'equal waits: the film is visited first, so the season is never attempted').toBe(0)
    expect(visit(filmWait + 1), 'the season waited longer: it is attempted before the film').toBe(1)
  })

  it('after paid work and a milestone the live profession proof still holds (review blocking 1, P18-04)', () => {
    expect(weeks.length).toBeGreaterThan(0)
    const done = last()
    expect(() => validatedLiveProfessionContext(done)).not.toThrow()
    expect(prepareLiveWritingContext(done)).not.toMatchObject({ kind: 'rejected' }) // a refusal prints its reason (FIX-3)
  })

  it('repair names the television hold on a worn standing set it holds (FIX-3; disclosed clone shortcut)', () => {
    // Shortcut, disclosed: on this route the season's set is whole while the season holds the stage, so repair answers
    // `alreadyWhole` first. The case lowers ONLY that set's condition on a structuredClone of the held week to reach
    // the hold rule; no engine verb wore it.
    expect(weeks.length).toBeGreaterThan(0)
    const held = weeks.find((state) => season(state).reservations.some((r) => r.capability === 'soundstage'))
    expect(held, 'premise: the season held the adopted stage in some week').toBeDefined()
    const s = season(held!)
    const worn = structuredClone(held!)
    const set = worn.sets.find((candidate) => candidate.id === s.setId)
    expect(set?.status, 'premise: the season stands on a standing set').toBe('standing')
    set!.condition = TUNING.SET_CONDITION_INITIAL - 1
    expect(repairSetRefusal(worn, s.setId!)).toEqual({ code: 'setHeldByTelevision', setId: s.setId, seasonId: s.seasonId })
  })

  it('a season person cannot be released early while the season engages them', () => {
    expect(weeks.length).toBeGreaterThan(0)
    const mid = weeks[Math.min(5, weeks.length - 1)]!
    expect(() => applyActions(mid, [{ kind: 'releaseTalent', talentId: route.roster.directorId }]))
      .toThrow(new RegExp(`engaged on live television season "${season(mid).seasonId}"`))
  })

  it('no available cash after the week\'s mandatory charges: the unit stalls on cash, writes no spend row and credits nothing', () => {
    expect(weeks.length).toBeGreaterThan(0)
    const mid = weeks[2]!
    const broke = tick(withCash(mid, 0))
    expect(season(broke).work.creditedUnits).toBe(season(mid).work.creditedUnits)
    expect(season(broke).work.stall).toMatchObject({ kind: 'cash', required: FIGURES.unitSpend })
    expect(tvRows(broke, 'tvProductionSpend')).toHaveLength(tvRows(mid, 'tvProductionSpend').length)
  })
})
