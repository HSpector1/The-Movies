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

function stripTalentAge(v16: { state: { talent: readonly Record<string, unknown>[] } }): unknown {
  return {
    ...v16,
    state: {
      ...v16.state,
      talent: v16.state.talent.map((person) => {
        const rest = { ...person }
        delete rest.age
        return rest
      }),
    },
  }
}

/** `migrated` was reloaded from a prior-version save at `boundaryWeek`; `native` never was.
 *
 * P14C.1 (record 771, approved_behavioral_change), `ageResidue` (default false,
 * unchanged strict behavior for every other caller): a reload through an
 * envelope OLDER than V33 re-bases the birthday clock at the reload week
 * (contract 762 §6 — `convertV32ToV33`/`liftHistoricalState`'s
 * `legacy_age_anchor` law anchors on the stored age AT THE RELOAD WEEK, not at
 * the person's true genesis week). When `boundaryWeek > 0` this delays every
 * migrated birthday by exactly `boundaryWeek` weeks relative to the native
 * world's true schedule — a residue NO fixture repair removes (measured on two
 * call sites: d17b-save-v7's "V7 save reloads" case, boundaryWeek 6; and
 * production-operations-save-v8's "round-trips a blocked shooting task" case).
 * Since the run window in both is far short of 52 weeks, at most one birthday
 * can separate the two schedules for any one person, and the native side is
 * never behind — proved exactly, not assumed, by both callers passing.
 */
export function expectForwardHistoryTwin(
  migrated: GameState,
  native: GameState,
  boundaryWeek: number,
  options: { ageResidue?: boolean } = {},
): void {
  if (options.ageResidue) {
    const migratedV16 = JSON.parse(exportSave(makeSaveV16(migrated))) as { state: { talent: readonly { id: string; age: number }[] } }
    const nativeV16 = JSON.parse(exportSave(makeSaveV16(native))) as { state: { talent: readonly { id: string; age: number }[] } }
    expect(JSON.stringify(stripTalentAge(migratedV16))).toBe(JSON.stringify(stripTalentAge(nativeV16)))
    expect(migratedV16.state.talent.length).toBe(nativeV16.state.talent.length)
    for (let i = 0; i < nativeV16.state.talent.length; i++) {
      const nativePerson = nativeV16.state.talent[i]!
      const migratedPerson = migratedV16.state.talent[i]!
      expect(migratedPerson.id, `talent[${String(i)}] id`).toBe(nativePerson.id)
      const diff = nativePerson.age - migratedPerson.age
      const label = `${nativePerson.id}: native age ${String(nativePerson.age)} vs migrated age ${String(migratedPerson.age)} — expected native - migrated in {0,1}`
      expect(diff, label).toBeGreaterThanOrEqual(0)
      expect(diff, label).toBeLessThanOrEqual(1)
    }
  } else {
    expect(exportSave(makeSaveV16(migrated))).toBe(exportSave(makeSaveV16(native)))
  }
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
