// ── P15A.1 Wave 1 — the pure 6,240-week harness, RED tests (record 1346-C) ──
//
// Authority: 1323-A-p15a1-wave0-and-wave1-charter.md §4 (the pure 6,240-week
// harness: a normal stream and a hostile stream) and
// 1323-F-parent-p15a1-charter-adoption.md Amendment 3 (the harness assertions
// in operational form: bounded active set by recount from the release log, the
// work bound via the step counter, and determinism across two runs).
//
// RED-BY-DESIGN: `src/core/sharedMarket.ts` does not exist yet. Every leaf below
// is expected to fail. Dynamic per-test import (`loadMarket()`), not a static
// top-level import, so each leaf gets its own attributed failure instead of a
// whole-file collection error; see the header of tests/p15a1-shared-market.test.ts
// for the full pitfall rationale (verified directly against this tree).
//
// PURITY: no RNG anywhere in this file. The "normal stream" release schedule is
// deterministic modular arithmetic, not a seeded stream — Wave 1 is `(inputs) =>
// outputs` with no RNG at all, per 1323-A §3.
//
// REVISION 1346-C2 (this file): non-blocking note from review 1346-D — the hostile-batch
// leaf's own step assertion previously only checked an upper bound, which would tolerate
// steps.count===0 in isolation. Added a `toBeGreaterThan(0)` assertion here for
// self-containment; see 1346-C2-p15a1-red-revision.md.

import { describe, expect, it } from 'vitest'
import type { Genre } from '../src/core/types.js'

async function loadMarket(): Promise<Record<string, unknown>> {
  return (await import('../src/core/sharedMarket.js')) as unknown as Record<string, unknown>
}

function requireFn<T extends (...a: any[]) => any>(mod: Record<string, unknown>, name: string): T {
  const fn = mod[name]
  if (typeof fn !== 'function') {
    throw new Error(
      `RED: src/core/sharedMarket.ts does not export a function named '${name}' (got ${typeof fn}). ` +
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

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

const GENRES: Genre[] = ['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure']

type ReleaseLogEntry = { releaseId: string; studioId: string; genre: Genre; releaseWeek: number }

// ── normal stream: nine rivals at about two releases a year plus the player ──
const WEEKS = 6240 // 120 years at 52 weeks/year
const RIVAL_COUNT = 9
const RIVAL_INTERVAL = 26 // 2 releases/year
const PLAYER_INTERVAL = 20

function buildReleaseLog(): ReleaseLogEntry[] {
  const log: ReleaseLogEntry[] = []
  for (let rival = 0; rival < RIVAL_COUNT; rival++) {
    const offset = rival * 3 // spreads the nine rivals across distinct residues mod 26,
    // deterministic and collision-free with each other; no RNG.
    for (let week = offset; week < WEEKS; week += RIVAL_INTERVAL) {
      log.push({
        releaseId: `RIVAL-${rival}-${pad(week, 5)}`,
        studioId: `RIVAL-${rival}`,
        genre: GENRES[rival % GENRES.length],
        releaseWeek: week,
      })
    }
  }
  let playerReleaseIndex = 0
  for (let week = 10; week < WEEKS; week += PLAYER_INTERVAL) {
    log.push({
      releaseId: `PLAYER-${pad(week, 5)}`,
      studioId: 'PLAYER',
      genre: GENRES[playerReleaseIndex % GENRES.length],
      releaseWeek: week,
    })
    playerReleaseIndex++
  }
  log.sort((a, b) => a.releaseWeek - b.releaseWeek || a.releaseId.localeCompare(b.releaseId))
  return log
}

async function runNormalStream(): Promise<{ exposures: unknown[]; allAssessments: unknown[]; releaseLog: ReleaseLogEntry[] }> {
  const market = await loadMarket()
  const assessBatch = requireFn<any>(market, 'assessBatch')
  const reduceExposures = requireFn<any>(market, 'reduceExposures')
  const releaseLog = buildReleaseLog()
  const byWeek = new Map<number, ReleaseLogEntry[]>()
  for (const r of releaseLog) {
    const list = byWeek.get(r.releaseWeek) ?? []
    list.push(r)
    byWeek.set(r.releaseWeek, list)
  }
  let exposures: any[] = []
  const allAssessments: unknown[] = []
  for (let week = 0; week < WEEKS; week++) {
    const members = (byWeek.get(week) ?? []).map((r) => ({ releaseId: r.releaseId, studioId: r.studioId, genre: r.genre }))
    if (members.length > 0) {
      const assessments = assessBatch(exposures, { week, members })
      allAssessments.push(...assessments)
    }
    const reduced = reduceExposures(exposures, { week, members })
    exposures = reduced.exposures
    // Amendment 3: bounded active set, checked by RECOUNT FROM THE RELEASE LOG (an
    // independently maintained record), not by trusting the running `exposures` value.
    const expectedActive = releaseLog.filter((r) => r.releaseWeek <= week && week - r.releaseWeek < 26).length
    expect(exposures.length).toBeLessThanOrEqual(expectedActive) // authority text: "at most"
    expect(exposures.length).toBe(expectedActive) // tighter check chosen here; see handback
  }
  return { exposures, allAssessments, releaseLog }
}

describe('p15a1 shared market: pure 6,240-week harness (1323-F Amendment 3)', () => {
  it(
    'market-harness-normal-stream-bounded-active-set-and-determinism',
    async () => {
      const run1 = await runNormalStream()
      const run2 = await runNormalStream()
      // determinism: two runs, byte-identical canonical JSON.
      expect(canonicalJSON(run1.allAssessments)).toBe(canonicalJSON(run2.allAssessments))
      expect(canonicalJSON(run1.exposures)).toBe(canonicalJSON(run2.exposures))
    },
    // explicit, justified budget: this leaf drives the pure law over two full
    // 6,240-week runs (>12,000 reduceExposures calls plus one assessBatch call per
    // release week); the core project's default is 5,000 ms. 20,000 ms is headroom
    // chosen without knowing the eventual production implementation's constant
    // factor, not a measured requirement — see the handback.
    20000,
  )

  it('market-harness-hostile-batch-work-bound-and-active-set', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const reduceExposures = requireFn<any>(market, 'reduceExposures')
    const week = 100000
    const ACTIVE_COUNT = 4000
    const STUDIO_COUNT = 64
    const activeExposures = Array.from({ length: ACTIVE_COUNT }, (_, i) => ({
      releaseId: `EXP-${pad(i, 5)}`,
      studioId: `S-${pad(i % STUDIO_COUNT, 2)}`,
      genre: GENRES[i % GENRES.length],
      releaseWeek: week - 1 - (i % 25), // offsets 1..25: all active (window tail or stock), never retired
    }))
    const hostileMembers = Array.from({ length: 512 }, (_, i) => ({
      releaseId: `BATCH-${pad(i, 4)}`,
      studioId: `S-${pad(i % STUDIO_COUNT, 2)}`,
      genre: GENRES[i % GENRES.length],
    }))
    const batch = { week, members: hostileMembers }

    const steps = { count: 0 }
    const assessments1 = assessBatch(activeExposures, batch, { steps })
    expect(assessments1).toHaveLength(512)
    // 1346-D non-blocking note: self-contained non-triviality (the sibling leaf
    // market-step-counter-basic already covers this at small scale, but this leaf
    // should not rely on that alone).
    expect(steps.count).toBeGreaterThan(0)
    // Amendment 3 work bound: at most (active exposures) + 2*(batch members)
    expect(steps.count).toBeLessThanOrEqual(ACTIVE_COUNT + 2 * hostileMembers.length)

    const reduced = reduceExposures(activeExposures, batch)
    const releaseLog = [
      ...activeExposures.map((e) => ({ releaseId: e.releaseId, releaseWeek: e.releaseWeek })),
      ...hostileMembers.map((m) => ({ releaseId: m.releaseId, releaseWeek: week })),
    ]
    const expectedActive = releaseLog.filter((r) => r.releaseWeek <= week && week - r.releaseWeek < 26).length
    expect(reduced.exposures.length).toBeLessThanOrEqual(expectedActive)
    expect(reduced.exposures.length).toBe(expectedActive)

    // determinism: a second run over deep-cloned inputs must match byte-for-byte in
    // canonical JSON, and produce the identical step count.
    const steps2 = { count: 0 }
    const activeExposuresClone = JSON.parse(JSON.stringify(activeExposures))
    const batchClone = JSON.parse(JSON.stringify(batch))
    const assessments2 = assessBatch(activeExposuresClone, batchClone, { steps: steps2 })
    expect(canonicalJSON(assessments2)).toBe(canonicalJSON(assessments1))
    expect(steps2.count).toBe(steps.count)
  })
})
