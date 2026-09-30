// Record 1344-C: RED tests for test 11 "shelving-natural-route" and test 12
// "determinism" (1344-F Amendment 3), staged against BASE
// c214094478f47c3e861d757ef568a124cbf3bd71, branch wip/headless-program-20260916-ts.
// Authority: 1344-F Amendment 3 (governs over 1344-A §6 item 11's original text,
// which is withdrawn per the amendment — "industry films after week 140 exceed
// HEAD's 53" and any shelvings-per-year pin are explicitly NOT asserted here).
//
// HORIZON: week 130 (genuine fixture) to week 260, i.e. 130 further weeks — TWO full
// 52-week windows past the fixture, generous relative to 1344-F's own derived
// worst-case single-studio re-shelve cycle (hold 13 + SCRIPT_DRAFT_WEEKS_MIN 1 +
// threshold 13 = 27 weeks), matching the brief's own suggested example horizon.
// Measured wall-clock duration for this route is recorded in the handback (the
// 1344-P producer measured ~3.5s for a 130-tick run over this same seed).
//
// RED MECHANISM: see tests/p14d1-rival-shelving.test.ts header. This file does not
// repeat the TUNING/searchIndustryPackages/save.ts existence guard (already covered
// there); it adds its own minimal check for the one export it introduces new usage
// of (none beyond what the other two files already assert), so no separate block.

import { describe, expect, it } from 'vitest'
import { tick, TUNING } from '../src/core/index.js'
import * as saveModule from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import type { IndustryReceipt } from '../src/core/hollywoodTypes.js'
import { liveWeek130 } from './p14d1-rival-shelving-fixtures.js'

type ScreenplayShelvedReceipt = { eventId: string; week: number; studioId: string
  kind: 'screenplayShelved'; scriptProjectId: string; conceptId: string; rejections: number }
/** See tests/p14d1-rival-shelving.test.ts's identical helper for why this is a
 * plain boolean predicate (TS2677) rather than a `r is ...` type guard. */
const shelvedReceiptsOf = (receipts: readonly IndustryReceipt[]): ScreenplayShelvedReceipt[] =>
  receipts.filter(r => (r as unknown as { kind: string }).kind === 'screenplayShelved') as unknown as ScreenplayShelvedReceipt[]
/** Bare `TUNING_FUTURE.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS` access is a real, expected
 * tsc TS2339 until tuning.ts adds it (see the handback's type-gate section). */
const TUNING_FUTURE = TUNING as unknown as { HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS: number }

const HORIZON_WEEKS = 130 // 130 -> 260

function runNaturalRoute(): { finalState: GameState; weeklyStates: { week: number; state: GameState }[] } {
  let state = liveWeek130()
  const weeklyStates: { week: number; state: GameState }[] = [{ week: state.market.tick, state }]
  for (let i = 0; i < HORIZON_WEEKS; i++) {
    state = tick(state)
    weeklyStates.push({ week: state.market.tick, state })
  }
  return { finalState: state, weeklyStates }
}

describe('shelving-natural-route (1344-F Amendment 3): week 130 -> week 260 on p13a-core-causal-01', () => {
  it('at least one screenplayShelved receipt occurs', () => {
    const { finalState } = runNaturalRoute()
    const shelvings = shelvedReceiptsOf(finalState.hollywood!.receipts)
    expect(shelvings.length, 'route/RED premise: at least one shelving in 130 weeks from the genuine stalled fixture').toBeGreaterThanOrEqual(1)
  }, 60_000)

  it('no commission by a shelving studio within 13 weeks after any of its shelvings', () => {
    const { finalState, weeklyStates } = runNaturalRoute()
    const shelvings = shelvedReceiptsOf(finalState.hollywood!.receipts)
    expect(shelvings.length).toBeGreaterThanOrEqual(1)
    // "A commission happened for studio S at week w" is observed as growth in
    // b.development.projects.length between consecutive weekly snapshots (the only
    // durable trace of a commission in this state shape; there is no dedicated
    // receipt kind for it).
    const commissionsByStudio = new Map<string, number[]>()
    for (let i = 1; i < weeklyStates.length; i++) {
      const prev = weeklyStates[i - 1]!.state, cur = weeklyStates[i]!.state
      for (const b of cur.hollywood!.businesses) {
        const before = prev.hollywood!.businesses.find(row => row.studioId === b.studioId)!
        if (b.development.projects.length > before.development.projects.length) {
          const weeks = commissionsByStudio.get(b.studioId) ?? []
          weeks.push(prev.market.tick)
          commissionsByStudio.set(b.studioId, weeks)
        }
      }
    }
    for (const receipt of shelvings) {
      const commissionWeeks = commissionsByStudio.get(receipt.studioId) ?? []
      const violating = commissionWeeks.filter(w => w >= receipt.week && w < receipt.week + TUNING_FUTURE.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS)
      expect(violating, `studio ${receipt.studioId} shelved at week ${receipt.week}: no commission in [${receipt.week}, ${receipt.week + TUNING_FUTURE.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS})`).toEqual([])
    }
  }, 60_000)

  it('every shelved screenplay keeps its ScriptProject and cost row through the final week', () => {
    const { finalState } = runNaturalRoute()
    const shelvings = shelvedReceiptsOf(finalState.hollywood!.receipts)
    expect(shelvings.length).toBeGreaterThanOrEqual(1)
    for (const receipt of shelvings) {
      const b = finalState.hollywood!.businesses.find(row => row.studioId === receipt.studioId)!
      const ordinal = b.development.projects.findIndex(p => p.id === receipt.scriptProjectId)
      expect(ordinal, `${receipt.scriptProjectId} still has a ScriptProject at the final week`).toBeGreaterThanOrEqual(0)
      expect(b.projects[ordinal], `${receipt.scriptProjectId} still has a RivalProjectCosts row at the final week`).toBeDefined()
      expect(b.projects[ordinal]!.scriptProjectId).toBe(receipt.scriptProjectId)
    }
  }, 60_000)

  it('per studio, at most four shelvings in any 52-week window', () => {
    const { finalState } = runNaturalRoute()
    const shelvings = shelvedReceiptsOf(finalState.hollywood!.receipts)
    expect(shelvings.length).toBeGreaterThanOrEqual(1)
    const byStudio = new Map<string, number[]>()
    for (const r of shelvings) byStudio.set(r.studioId, [...(byStudio.get(r.studioId) ?? []), r.week].sort((a, b) => a - b))
    for (const [studioId, weeks] of byStudio) {
      for (let i = 0; i < weeks.length; i++) {
        const windowCount = weeks.filter(w => w >= weeks[i]! && w < weeks[i]! + 52).length
        expect(windowCount, `${studioId}: at most 4 shelvings in the 52-week window starting week ${weeks[i]}`).toBeLessThanOrEqual(4)
      }
    }
  }, 60_000)

  // Deliberately NOT asserted, per 1344-F Amendment 3: film counts, "industry films
  // after week 140 exceed HEAD's 53", or a specific shelvings-per-year pin. These are
  // measurement, reported in the handback with no pin, not a RED test expectation.
})

describe('determinism (1344-A §6 item 12): two runs of the natural route are byte-identical', () => {
  it('exportSave(makeSave(...)) is identical across two independent runs of the same 130-week route', () => {
    const runA = runNaturalRoute().finalState
    const runB = runNaturalRoute().finalState
    // CLASSIFICATION NOTE: this leaf is expected to PASS at RED too — tick()'s
    // determinism (same seed, same route, no Math.random/Date.now) does not depend on
    // the shelving law existing; it is a general invariant this test pins as a
    // regression guard that must continue to hold once GREEN lands real
    // screenplayShelving state and receipts (which themselves must stay deterministic).
    const bytesA = saveModule.exportSave(saveModule.makeSave(runA))
    const bytesB = saveModule.exportSave(saveModule.makeSave(runB))
    expect(bytesA).toBe(bytesB)
  }, 120_000)
})
