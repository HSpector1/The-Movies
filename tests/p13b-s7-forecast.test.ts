// ── P13B-S7 test 1: forecast text before/after the public announcement ──────
//
// Requirement-derived from "S7 — Forecast/replacement disclosure" in
// docs/engineering/playability-launch-review/plans/P13B-HEADLESS-PLAN.md, its
// "Refinement (coordinator, 2026-09-17 ≈21:45 ... supersedes the provisional
// bullets where they differ)" block and the restated "Tests" item 1: "forecast
// text before 884 shows 884..988 only (never 936); at/after 884 the exact 936;
// sound exact throughout."
//
// LAW PINNED (refinement, verbatim law restated): `technologyForecast(entry,
// week)` takes ONLY the catalogue entry and a week — never a GameState.
// `kind: 'exact'` whenever `week >= entry.publicWindow.announceWeek` OR the
// window is degenerate (`from === to`); otherwise `kind: 'window'` — so
// sound's `{416, 416, 416}` is exact at EVERY week including week 0, and its
// disclosure never becomes a two-bound window. Lighting's window is
// 884..988, announced at 884 (never revealing 936 before then); at/after 884
// it is exact `{commercialWeek: 936, announcedWeek: 884}` — `announcedWeek`
// is the catalogue's fixed announce week, not the current query week, so it
// does not change at 900/988/5000.
//
// CATALOGUE DATA (refinement): "publicWindow: { from, to, announceWeek }" on
// the catalogue entry — lighting 884..988 announced at 884 ("the S7 scope
// record's figure — a ±52-week window around the true commercial week; no
// corroborating transcription exists in this plan's R07 sections or on disk;
// CANDIDATE, companion wording owed"), sound `{ from: 416, to: 416,
// announceWeek: 416 }` (its commercial week is already public; nothing
// changes for sound). This file pins BOTH the catalogue data itself (case 1)
// and the disclosure function built on it (cases 2-4) as separate
// assertions, since "the catalogue entries do NOT yet carry `publicWindow`"
// is itself part of what S7-T2 must land.
//
// RED-by-design: `src/core/technologyDisclosure.ts` does not exist yet — no
// S7 engine increment is landed (S7-T1 precedes S7-T2 per the task list).
// `technologyForecast` is the ONLY import from that new module — the whole
// file fails at module resolution before any test body runs. Every other
// import below is from a REAL, EXISTING module (`technologyCatalogue.js`) —
// never a not-yet-existing named export of an existing module (which
// vite/esbuild would silently bind to `undefined` instead of failing
// resolution — the measured finding every P13B test-author file repeats).
//
// INTERPRETATIONS NAMED:
//   1. `technologyEntry(id)` (real, existing) supplies the `entry` argument;
//      this file never hand-authors a catalogue entry, so once S7-T2 adds
//      `publicWindow`/`replacementLabel` to the real catalogue this file
//      exercises the genuine data, not a synthetic stand-in.
//   2. Case 1 reads `entry.publicWindow` through an inline forward-looking
//      cast (`ForwardCatalogueEntry`), matching the established idiom
//      (`tests/p13b-s6-save-v26.test.ts`'s `(adoption as unknown as {
//      cancelledWeek: number | null })...`) for a field the CURRENT type
//      does not carry yet.
//   3. Expected numeric literals (884, 988, 936, 416) are hardcoded from the
//      plan's own law rather than re-derived from `entry.publicWindow` in
//      cases 2-4, so a wrongly-authored catalogue entry is caught here
//      rather than the test tautologically agreeing with whatever the
//      catalogue says.
//
// GAP NAMED (not invented around): the 884..988 window and its 884 announce
// week are recorded as CANDIDATE in the refinement itself, pending the
// companion document's own text — this file tests the number as currently
// authored, not as a claim that 884..988 is Owner-final.

import { describe, expect, it } from 'vitest'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
// RED-by-design: src/core/technologyDisclosure.ts does not exist yet — see
// this file's header. `technologyForecast` is the ONLY import from the new
// module.
import { technologyForecast } from '../src/core/technologyDisclosure.js'

type ForwardCatalogueEntry = { publicWindow: { from: number; to: number; announceWeek: number } }

describe('P13B-S7 forecast: window before announcement, exact at/after, sound exact throughout (test 1)', () => {
  it('catalogue data: lighting publicWindow 884..988 announced 884; sound publicWindow degenerate 416/416/416', () => {
    const lighting = (technologyEntry('lighting-control-01') as unknown as ForwardCatalogueEntry).publicWindow
    const sound = (technologyEntry('synchronized-sound') as unknown as ForwardCatalogueEntry).publicWindow
    expect(lighting).toEqual({ from: 884, to: 988, announceWeek: 884 })
    expect(sound).toEqual({ from: 416, to: 416, announceWeek: 416 })
  })

  it('lighting forecast is a window before 884 (week 0, researchableWeek 780, and the boundary week 883) — never reveals 936', () => {
    const entry = technologyEntry('lighting-control-01')
    for (const week of [0, 260, 780, 883]) {
      const forecast = technologyForecast(entry, week)
      expect(forecast).toEqual({ kind: 'window', fromWeek: 884, toWeek: 988 })
      expect(JSON.stringify(forecast)).not.toContain('936')
    }
  })

  it('lighting forecast becomes exact at week 884 and stays the same exact fact afterward (900, 988, 5000)', () => {
    const entry = technologyEntry('lighting-control-01')
    for (const week of [884, 900, 988, 5000]) {
      const forecast = technologyForecast(entry, week)
      expect(forecast).toEqual({ kind: 'exact', commercialWeek: 936, announcedWeek: 884 })
    }
  })

  it('sound forecast is exact at every week including week 0 (degenerate publicWindow) — never a two-bound window', () => {
    const entry = technologyEntry('synchronized-sound')
    for (const week of [0, 1, 259, 260, 415, 416, 1000]) {
      const forecast = technologyForecast(entry, week)
      expect(forecast).toEqual({ kind: 'exact', commercialWeek: 416, announcedWeek: 416 })
      expect((forecast as { kind: string }).kind).toBe('exact')
    }
  })
})
