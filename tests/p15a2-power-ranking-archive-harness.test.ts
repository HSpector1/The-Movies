// ── P15A.2 Wave 2 slice 2a — the bounded natural-campaign harness, RED test (record 1356-C; r2 1356-C2; r3 1356-C3) ──
//
// Authority: 1356-A §5 "Size and retention" (480 records per 6,240 weeks, 13 to 6240; ten rows;
// stable film ids, at most four per row; nothing compacted) and §8 RED 17 (`rank-bounded-harness`:
// "the memoized natural campaign to 6240 holds 480 records of ≤ 10 rows and ≤ 4 counted films, and
// reports archive bytes and validator time"). Its own file, after the Wave 1 harness precedent
// (tests/p15a2-power-ranking-harness.test.ts), because the campaign is the heaviest run of the
// slice: run it alone, one heavy process at a time.
//
// RED MECHANISM. At BASE ff05430d no live state carries the `powerRanking` root, so the leaf fails
// on `archiveOf` at the first quarter, before the long run. With the step present it runs the
// whole campaign once (memoized), then measures. The bytes and the validator time are reported,
// not bounded: 1356-A §5 gives an estimate (1.1-1.4 MB) for the measurement to test, not a limit.
//
// BUDGET (1356-F3 item 2; 1356-F5). The parent's first single-file run of this leaf at the reference
// (1356-X, run alone) measured `campaignMs` 61,020. The ceiling is 300,000 ms, about five times that
// run (the 1353-F3 method used for Wave R), in place of 1356-F2's PROVISIONAL two hours. The leaf
// enforces it itself: its body is synchronous, and vitest 2.1.9 arms a test's timer only after the
// body returns (@vitest/runner `withTimeout`), so the `it` timeout cannot fire (1356-D3 D-1). The
// campaign throws a named CEILING error after any tick past CEILING_MS, and after validation the leaf
// asserts that the campaign, makeSave and validator times sum to at most CEILING_MS. The report line
// keeps the campaign's own milliseconds. Keep this file out of the broad core allowlist and run it
// alone.

import { performance } from 'node:perf_hooks'
import { describe, expect, it } from 'vitest'
import * as saveModule from '../src/core/save.js'
import { makeSave, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

type Archive = { snapshots: { week: number; rows: { studioId: string; countedFilmIds: string[] }[] }[] }
function archiveOf(state: GameState): Archive {
  const archive = (state as unknown as { powerRanking?: Archive }).powerRanking
  if (archive === undefined) throw new Error(`RED: the state at week ${state.market.tick} has no top-level powerRanking root (1356-A §5)`)
  return archive
}

const WEEKS = 6_240 // 1356-A §5: 13 to 6240, 480 quarters
const CEILING_MS = 300_000 // 1356-F3 item 2: about five times 1356-X's campaignMs 61,020, run alone; see BUDGET
let cached: GameState | null = null
let campaignMilliseconds = 0
/** The fresh natural campaign (p13aGeneratedStudio default seed, natural ticks only) to 6,240. */
function campaign(): GameState {
  if (cached === null) {
    const started = performance.now()
    let state = p13aGeneratedStudio()
    while (state.market.tick < WEEKS) {
      state = tick(state)
      if (state.market.tick === 13) archiveOf(state) // fail at the first quarter, not after the run
      const elapsed = performance.now() - started
      if (elapsed > CEILING_MS) {
        throw new Error(`CEILING: week ${state.market.tick} reached after ${Math.round(elapsed)} ms, past CEILING_MS ${CEILING_MS} (1356-F5)`)
      }
    }
    campaignMilliseconds = performance.now() - started
    cached = state
  }
  return cached
}

describe('p15a2 archive: the bounded natural campaign (1356-A §5; RED 17)', () => {
  it('rank-bounded-harness', () => {
    const state = campaign()
    const records = archiveOf(state).snapshots
    expect(records).toHaveLength(WEEKS / 13)
    expect(records[0]!.week).toBe(13)
    expect(records.at(-1)!.week).toBe(WEEKS)
    const identities = state.hollywood!.identities.length
    expect(identities).toBe(10) // the player and the nine authored rivals (hollywoodStartingData.ts)
    for (const record of records) {
      expect(record.rows.length, `record ${record.week}`).toBeLessThanOrEqual(identities)
      for (const row of record.rows) expect(row.countedFilmIds.length).toBeLessThanOrEqual(TUNING.POWER_RANKING_FILM_CAP)
    }
    const archiveBytes = Buffer.byteLength(stableStringify(archiveOf(state)))
    const started = performance.now()
    const save = makeSave(state) // validateSaveV(N): the frozen chain, then the archive's own validator
    const saveMilliseconds = performance.now() - started
    const validate = (saveModule as unknown as Record<string, (s: unknown) => unknown>)[`validateSaveV${saveModule.LIVE_SAVE_VERSION}`]!
    const again = performance.now()
    validate(save)
    const validatorMilliseconds = performance.now() - again
    const saveBytes = Buffer.byteLength(stableStringify(save))
    console.info(JSON.stringify({ proof: 'p15a2-power-ranking-archive-bounded-harness', weeks: WEEKS, records: records.length,
      archiveBytes, saveBytes, archiveShare: Math.round((archiveBytes / saveBytes) * 10_000) / 100,
      campaignMs: Math.round(campaignMilliseconds), makeSaveMs: Math.round(saveMilliseconds),
      validateSaveMs: Math.round(validatorMilliseconds) }))
    // The proof line prints first, so a breach still reports its measurements (1356-F5).
    expect(campaignMilliseconds + saveMilliseconds + validatorMilliseconds,
      `campaign ${Math.round(campaignMilliseconds)} + makeSave ${Math.round(saveMilliseconds)} + validate ${Math.round(validatorMilliseconds)} ms against CEILING_MS ${CEILING_MS}`)
      .toBeLessThanOrEqual(CEILING_MS)
    expect(archiveBytes).toBeGreaterThan(0)
  }, CEILING_MS)
})
