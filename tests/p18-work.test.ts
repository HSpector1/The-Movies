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
import { assertNoDoubleBookedResourceSlots, occupiedResourceSlots } from '../src/core/occupancy.js'
import { tick } from '../src/core/tick.js'
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
