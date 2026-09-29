// ── P15A.2 Wave 1 — the pure 6,240-week harness, RED tests (record 1351-C) ──
//
// Authority: 1350-A-p15a2-power-ranking-charter.md §5 item 16 ("a bounded pure
// harness over 6,240 weeks... 480 snapshots"); brief-1351-p15a2-red TESTS
// section ("a bounded pure harness over 6,240 weeks that calls
// computePowerRanking at every quarter boundary (480 snapshots) with a normal
// synthetic release stream and asserts bounded row counts and determinism").
//
// RED-BY-DESIGN: `src/core/powerRanking.ts` does not exist yet. Dynamic
// per-test import, same pattern and rationale as tests/p15a2-power-ranking.test.ts
// (see that file's header for the verified per-leaf-vs-whole-file rationale).
//
// PURITY: deterministic modular arithmetic release stream, no RNG anywhere
// (Wave 1 is `(inputs) => outputs` with no RNG, per 1350-A §3).

import { describe, expect, it } from 'vitest'

async function loadPowerRanking(): Promise<Record<string, unknown>> {
  return (await import('../src/core/powerRanking.js')) as unknown as Record<string, unknown>
}

function requireFn<T extends (...a: any[]) => any>(mod: Record<string, unknown>, name: string): T {
  const fn = mod[name]
  if (typeof fn !== 'function') {
    throw new Error(
      `RED: src/core/powerRanking.ts does not export a function named '${name}' (got ${typeof fn}). ` +
        'This guard exists so a partially-implemented module fails loudly per-leaf instead of a vacuous pass.',
    )
  }
  return fn as T
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(value as object).sort()) out[k] = canonicalize((value as Record<string, unknown>)[k])
    return out
  }
  return value
}

function canonicalJSON(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

type FilmFixture = {
  filmId: string
  studioId: string
  releaseTick: number
  runEndedByWeek: boolean
  criticScore: number
  totalGross: number
  authoredPreCampaign: boolean
}
type StudioFixture = { studioId: string; enteredWeek: number; cash: number; weeklyFixedCost: number }
type InputFixture = {
  week: number
  originWeek: number
  baseMarketValue: number
  studios: StudioFixture[]
  films: FilmFixture[]
}

const BMV = 1_000_000
const WEEKS = 6240 // 120 years at 52 weeks/year; 6240/13 = 480 quarter boundaries exactly.
const THEATRICAL_WEEKS = 6 // tuning.ts:463, reused here only as a test-side realism rule for
// runEndedByWeek -- Wave 1 itself takes runEndedByWeek as an explicit pure input per snapshot.

const ROSTER: Array<{ studioId: string; enteredWeek: number; interval: number; cash: number; weeklyFixedCost: number }> = [
  { studioId: 'S0', enteredWeek: 0, interval: 30, cash: 20_000, weeklyFixedCost: 400 },
  { studioId: 'S1', enteredWeek: 26, interval: 34, cash: 15_000, weeklyFixedCost: 600 },
  { studioId: 'S2', enteredWeek: 208, interval: 38, cash: 50_000, weeklyFixedCost: 300 },
  { studioId: 'S3', enteredWeek: 520, interval: 42, cash: 8_000, weeklyFixedCost: 200 },
]

const BAND_LABELS = new Set(['inTheRed', 'strained', 'stable', 'thriving'])

// Deterministic modular release stream: each studio releases every `interval`
// weeks starting 5 weeks after it enters. No RNG.
function buildReleaseLog(): FilmFixture[] {
  const log: FilmFixture[] = []
  let globalIndex = 0
  for (const s of ROSTER) {
    for (let week = s.enteredWeek + 5; week < WEEKS; week += s.interval) {
      const critic = 30 + ((globalIndex * 17) % 71) // deterministic 30..100
      const grossFraction = (globalIndex % 11) / 10 // deterministic 0.0..1.0 step 0.1
      log.push({
        filmId: `${s.studioId}-${String(week).padStart(5, '0')}`,
        studioId: s.studioId,
        releaseTick: week,
        runEndedByWeek: false, // recomputed per snapshot in runHarness()
        criticScore: critic,
        totalGross: grossFraction * BMV,
        authoredPreCampaign: false,
      })
      globalIndex++
    }
  }
  return log
}

async function runHarness(): Promise<{ snapshots: any[] }> {
  const mod = await loadPowerRanking()
  const computePowerRanking = requireFn<(input: InputFixture) => any>(mod, 'computePowerRanking')
  const releaseLog = buildReleaseLog()
  const snapshots: any[] = []
  for (let week = 0; week < WEEKS; week += 13) {
    const knownStudios: StudioFixture[] = ROSTER.filter((s) => s.enteredWeek <= week).map((s) => ({
      studioId: s.studioId,
      enteredWeek: s.enteredWeek,
      cash: s.cash,
      weeklyFixedCost: s.weeklyFixedCost,
    }))
    const knownFilms: FilmFixture[] = releaseLog
      .filter((f) => f.releaseTick < week)
      .map((f) => ({ ...f, runEndedByWeek: f.releaseTick + THEATRICAL_WEEKS <= week }))
    const input: InputFixture = { week, originWeek: 0, baseMarketValue: BMV, studios: knownStudios, films: knownFilms }
    snapshots.push(computePowerRanking(input))
  }
  return { snapshots }
}

describe('p15a2 power ranking: bounded 6,240-week harness (1350-A §5 item 16)', () => {
  it(
    'power-ranking-bounded-harness-480-snapshots-row-counts-and-value-bounds',
    async () => {
      const { snapshots } = await runHarness()
      expect(snapshots.length).toBe(480) // 6240/13
      let weekCursor = -13
      for (const snapshot of snapshots) {
        weekCursor += 13
        expect(snapshot.week).toBe(weekCursor)
        expect(snapshot.windowStartWeek).toBe(weekCursor - 52)
        const expectedRosterSize = ROSTER.filter((s) => s.enteredWeek <= weekCursor).length
        expect(snapshot.rows.length).toBe(expectedRosterSize)
        if (!snapshot.available) {
          for (const row of snapshot.rows) {
            expect(row.ranked).toBe(false)
            expect(row.rank).toBeNull()
          }
        }
        for (const row of snapshot.rows) {
          expect(row.filmsTenths).toBeGreaterThanOrEqual(0)
          expect(row.filmsTenths).toBeLessThanOrEqual(100)
          expect(row.releasesTenths).toBeGreaterThanOrEqual(0)
          expect(row.releasesTenths).toBeLessThanOrEqual(100)
          expect(row.releases).toBeGreaterThanOrEqual(0)
          expect(row.countedFilmIds.length).toBeLessThanOrEqual(4) // POWER_RANKING_FILM_CAP
          expect(row.pointsTenths).toBe(row.filmsTenths + row.releasesTenths)
          expect(row.pointsTenths).toBeGreaterThanOrEqual(0)
          expect(row.pointsTenths).toBeLessThanOrEqual(200)
          expect(row.rank === null || (Number.isInteger(row.rank) && row.rank >= 1)).toBe(true)
          expect(typeof row.ranked).toBe('boolean')
          expect(BAND_LABELS.has(row.band)).toBe(true)
          expect(row.honors).toBe('notRecorded')
          expect(row.distressStage).toBe('notRecorded')
        }
      }
    },
    30_000, // explicit headroom for 480 pure computePowerRanking calls; not a performance requirement.
  )

  it(
    'power-ranking-bounded-harness-determinism-two-runs',
    async () => {
      const run1 = await runHarness()
      const run2 = await runHarness()
      expect(canonicalJSON(run1.snapshots)).toBe(canonicalJSON(run2.snapshots))
    },
    30_000,
  )
})
