// Completed Wave5 replaces the historical player-deferral gate. Exact prior test bytes are preserved in the implementation packet.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../../../src/core/actions'
import { exportSave, importSave, makeSave, migrateToLive } from '../../../src/core/save'
import { tick } from '../../../src/core/tick'
import type { Action, GameState } from '../../../src/core/types'
import { closureOf, drainPlayer, drainRival, PLAYER, R04, R04_CLOSURE_WEEK, recordOf } from '../../../tests/helpers/p15b-live'
import { advanceWeek, importSaveJson } from './adapter'

// The genuine week-130 capture the core P15B routes use (tests/helpers/p15b-live.ts `base`), read by path: the jsdom
// project serves `import.meta.url` over http, so the core loader's file URL cannot be used here.
const week130 = (): GameState => migrateToLive(importSave(gunzipSync(readFileSync(resolve(process.cwd(),
  'tests/fixtures/p14/genuine-v42-pre-shelving/genuine-v42-rival-stall-week-130.json.gz'))).toString('utf8'))).state as GameState

describe('P15B completed Wave5 closure in the browser Studio Lot', () => {
  it('the Lot commits actual player and rival closure then refuses further operating ticks', () => {
    const start = week130()
    let state = drainPlayer(drainRival(start, R04, 10_000_000), Math.floor(start.studio.cash) + 1)
    expect(() => makeSave(state), 'constructed debit must admit before ticking').not.toThrow()
    while (state.market.tick < R04_CLOSURE_WEEK) state = advanceWeek(state).next
    expect(closureOf(state, R04)?.closureWeek).toBe(R04_CLOSURE_WEEK)
    expect(recordOf(state, PLAYER)!.condition).toMatchObject({ stage: 'closed', since: R04_CLOSURE_WEEK, week: R04_CLOSURE_WEEK })
    expect(closureOf(state, PLAYER)?.closureWeek).toBe(R04_CLOSURE_WEEK)
    expect(closureOf(state, PLAYER)?.endOfRun).toBe(state.campaignLegacy.endOfRun?.legacySnapshotId)
    const frozen = JSON.stringify(state)
    expect(() => advanceWeek(state)).toThrow(/read.only|closed/i)
    expect(JSON.stringify(state)).toBe(frozen)
    expect(() => makeSave(state)).not.toThrow()
  })

  it('the Lot admits an actual closed save as exact read-only history', () => {
    // The core player-closure route (one signed contract, drained to −1 at 130) advanced by the core tick.
    const start = week130()
    let state = drainPlayer(applyActions(start, [{ kind: 'signContract', talentId: start.freeAgents[0]!, termWeeks: 52 } as Action]), Math.floor(start.studio.cash) + 1)
    expect(() => makeSave(state), 'constructed debit must admit before ticking').not.toThrow()
    let before = state
    while (closureOf(state, PLAYER) === undefined && state.market.tick < R04_CLOSURE_WEEK + 1) { before = state; state = tick(state) }
    expect(closureOf(state, PLAYER)?.closureWeek).toBe(R04_CLOSURE_WEEK)
    const outcome = importSaveJson(exportSave(makeSave(state)))
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(exportSave(makeSave(outcome.state))).toBe(exportSave(makeSave(state)))
      expect(() => advanceWeek(outcome.state)).toThrow(/read.only|closed/i)
    }
    // The same campaign one week earlier still imports.
    expect(importSaveJson(exportSave(makeSave(before))).ok).toBe(true)
  })
})
