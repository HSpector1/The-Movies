// ── P08A — twin-continuity helper for tests that reload a PRIOR-version save ──
//
// Before P08, "a V7/V8 save reloads and continues identically to an uninterrupted
// run" was provable byte-for-byte on the live envelope. P08 records the studio's
// history FORWARD from an explicit boundary and never reconstructs the past
// (P08-REQ-006): a world that recorded from week 0 carries its founding row and
// every earlier receipt; a world migrated from a pre-P08 save carries only what
// happened after its migration week. Those two histories are DIFFERENT by law.
//
// So the twin claim splits into the two things that are actually true:
//   1. every pre-P08 byte is identical — the V16 projection of both worlds matches;
//   2. the migrated world's history begins exactly at the migration week and,
//      from there on, records EXACTLY the rows the unbroken world recorded
//      (identity numbering aside), in the same order.
import { expect } from 'vitest'
import { exportSave, makeSaveV16 } from '../src/core/index.js'
import type { GameState, StudioHistoryEvent } from '../src/core/index.js'

function stripIds(rows: readonly StudioHistoryEvent[]): unknown[] {
  return rows.map((row) => {
    const { eventId: _id, ...rest } = row
    return rest
  })
}

/** `migrated` was reloaded from a prior-version save at `boundaryWeek`; `native` never was. */
export function expectForwardHistoryTwin(
  migrated: GameState,
  native: GameState,
  boundaryWeek: number,
): void {
  expect(exportSave(makeSaveV16(migrated))).toBe(exportSave(makeSaveV16(native)))
  expect(migrated.studioHistory.recordingStartedWeek).toBe(boundaryWeek)
  // Folding is a function of which rows exist, so the forward comparison is only
  // meaningful while neither side has folded — every twin test here is far
  // shorter than the fold window.
  expect(migrated.studioHistory.rows.some((r) => r.kind === 'standingDriftFolded')).toBe(false)
  expect(native.studioHistory.rows.some((r) => r.kind === 'standingDriftFolded')).toBe(false)
  expect(stripIds(migrated.studioHistory.rows)).toEqual(
    stripIds(native.studioHistory.rows.filter((r) => r.week >= boundaryWeek)),
  )
}
