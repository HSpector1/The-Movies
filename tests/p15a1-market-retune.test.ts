// ── 1365: P15A.1(c) activation and the G2 retune (1361-F5 ruling 3; 1355-A §3.4 item 5) ──
//
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/): 1361-G2-X
// (verdict Retune), 1361-F5 ruling 3 (the tuning amendment under D-1323-1's delegation; the
// Owner's named weaker alternative is maximum penalty 0.15, 1323-F:61-63) and Amendment 1 ((c)'s
// retune removes the b-r2 guard), 1355-A §3.4 item 5 (a retune bumps the definition, freezes v1's
// seven numbers for old records and adds an old-law fixture).
//
// RED-BY-DESIGN against 6510c971 + the (c) hunks: the definition is still v1, the penalty 0.25,
// and sharedMarket.ts exports no frozen v1 law. The five law leaves fail on their own requirement
// (RED-FIRST-EVIDENCE §2). The rest are not RED leaves: market-retune-guard-removed passes at that
// base because the (c) hunks already remove the b-r2 guard, so it is a regression control that the
// guard stays gone; the two storage leaves are measurements.
//
// Exposure policy across the version boundary (1355-A §3.4 item 5 "needs a policy that the retune
// owns"): an exposure is a release fact (id, studio, genre, week) and carries no law; the batch
// week's definition prices it. `reconcileLaw` already rebuilds exposures from stored rows of any
// version and runs the law of the week's rows, so a v1 row stands as an exposure to a v2 batch.
import { describe, expect, it } from 'vitest'
import { p15PhaseTriple } from '../src/core/p15Phases.js'
import { exportSave, makeSave, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { canon, MARKET_PHASE_ID, marketRoot, rivalRouteAt, routeAt, ROUTE_CAP_WEEK, type PersistedAssessment } from './helpers/p15a1-market-route.js'

type Law = {
  definition: string; windowWeights: readonly number[]; stockStart: number; stockHalfLifeWeeks: number
  retireAfterWeeks: number; factorMaxPenalty: number; pressureScale: number; studioWindowCap: number
}
type Member = { releaseId: string; studioId: string; genre: PersistedAssessment['genre'] }
type Exposure = Member & { releaseWeek: number }
type AssessBatch = (exposures: readonly Exposure[], batch: { week: number; members: readonly Member[] }, options?: { law?: Law }) => PersistedAssessment[]
type PressureFactor = (pressure: number, law?: Law) => number

async function loadMarket(): Promise<Record<string, unknown>> {
  return (await import('../src/core/sharedMarket.js')) as unknown as Record<string, unknown>
}
function requireExport<T>(mod: Record<string, unknown>, name: string): T {
  if (!(name in mod) || mod[name] === undefined) throw new Error(`RED: src/core/sharedMarket.ts does not export '${name}' (1355-A §3.4 item 5; 1365)`)
  return mod[name] as T
}

// The two eras as literals, never the live exports (the campaignLegacy.ts precedent).
const V1: Law = { definition: 'p15a1-market-v1', windowWeights: [1, 0.55, 0.55, 0.2], stockStart: 0.2, stockHalfLifeWeeks: 13,
  retireAfterWeeks: 26, factorMaxPenalty: 0.25, pressureScale: 2, studioWindowCap: 1 }
const V2: Law = { ...V1, definition: 'p15a1-market-v2', factorMaxPenalty: 0.15 }
const formula = (law: Law, P: number): number => 1 - law.factorMaxPenalty * (1 - Math.exp(-P / law.pressureScale))
const HEAVY = 240_000

/** The same rows re-priced under `law`, week by week from the stored rows alone (the validator's
 * own reconstruction): sequences and the phase triple are kept, the law fields and the
 * definition replaced. */
function repriced(rows: readonly PersistedAssessment[], law: Law, assess: AssessBatch): PersistedAssessment[] {
  const out: PersistedAssessment[] = []
  for (let start = 0; start < rows.length;) {
    const week = rows[start]!.week
    let end = start
    while (end < rows.length && rows[end]!.week === week) end++
    const exposures = rows.filter((row) => row.week < week && week - row.week < law.retireAfterWeeks)
      .map((row) => ({ releaseId: row.releaseId, studioId: row.studioId, genre: row.genre, releaseWeek: row.week }))
    const members = rows.slice(start, end)
    const lawRows = assess(exposures, { week, members: members.map(({ releaseId, studioId, genre }) => ({ releaseId, studioId, genre })) }, { law })
    members.forEach((row, k) => out.push({ ...row, ...lawRows[k]!, p15DomainSequence: row.p15DomainSequence, ...p15PhaseTriple(MARKET_PHASE_ID) }))
    start = end
  }
  return out
}
const withRows = (state: GameState, rows: readonly PersistedAssessment[]): GameState =>
  ({ ...state, sharedMarket: { ...marketRoot(state), assessments: rows } }) as unknown as GameState

/** The first route week whose tick appends at least one row, and the week after it. */
function weekWithReleases(from: number): number {
  for (let week = from; week < ROUTE_CAP_WEEK; week++) {
    if (marketRoot(rivalRouteAt(week + 1)).assessments.length > marketRoot(rivalRouteAt(week)).assessments.length) return week
  }
  throw new Error('route premise: no week with a release')
}

describe('1365 retune: the definition and the frozen eras (1355-A §3.4 item 5)', () => {
  it('market-retune-definition-v2: the live definition is p15a1-market-v2 and TUNING holds v2\'s seven numbers', async () => {
    const market = await loadMarket()
    expect(requireExport<string>(market, 'SHARED_MARKET_DEFINITION')).toBe('p15a1-market-v2')
    const seven = {
      windowWeights: TUNING.SHARED_MARKET_WINDOW_WEIGHTS, stockStart: TUNING.SHARED_MARKET_STOCK_START,
      stockHalfLifeWeeks: TUNING.SHARED_MARKET_STOCK_HALF_LIFE_WEEKS, retireAfterWeeks: TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS,
      factorMaxPenalty: TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY, pressureScale: TUNING.SHARED_MARKET_PRESSURE_SCALE,
      studioWindowCap: TUNING.SHARED_MARKET_STUDIO_WINDOW_CAP,
    }
    const { definition: _d, ...v2Numbers } = V2
    expect(canon(seven)).toBe(canon(v2Numbers))
    // The live law reads exactly those numbers under the live definition.
    const live = requireExport<() => Law>(market, 'liveMarketLaw')()
    expect(canon(live)).toBe(canon(V2))
  })

  it('market-retune-v1-frozen: v1\'s seven numbers are a frozen, reachable law, and the era table holds exactly v1 and v2', async () => {
    const market = await loadMarket()
    const v1 = requireExport<Law>(market, 'SHARED_MARKET_LAW_V1')
    expect(canon(v1)).toBe(canon(V1))
    expect(Object.isFrozen(v1), 'v1 is frozen').toBe(true)
    const laws = requireExport<Record<string, () => Law>>(market, 'MARKET_LAWS')
    expect(Object.keys(laws).sort()).toEqual(['p15a1-market-v1', 'p15a1-market-v2'])
    expect(canon(laws['p15a1-market-v1']!())).toBe(canon(V1))
    expect(canon(laws['p15a1-market-v2']!())).toBe(canon(V2))
  })

  it('market-retune-factor-range: the live factor is 1 − 0.15·(1 − e^(−P/2)) in [0.85, 1]; the v1 law still prices 0.25', async () => {
    const market = await loadMarket()
    const pressureFactor = requireExport<PressureFactor>(market, 'pressureFactor')
    const v1 = requireExport<Law>(market, 'SHARED_MARKET_LAW_V1')
    expect(pressureFactor(0)).toBe(1)
    const grid = [0, 0.5, 1, 2, 4, 8, 16, 20, 32, 50, 72, 100, 150, 200, 300, 500, 750, 1000]
    const values = grid.map((P) => pressureFactor(P))
    for (const [i, P] of grid.entries()) {
      expect(values[i]!).toBeCloseTo(formula(V2, P), 12)
      expect(values[i]!).toBeGreaterThanOrEqual(0.85)
      expect(values[i]!).toBeLessThanOrEqual(1)
      if (i > 0) expect(values[i]!).toBeLessThanOrEqual(values[i - 1]!)
      if (P <= 20) expect(values[i]!).toBeGreaterThan(0.85)
      expect(pressureFactor(P, v1)).toBeCloseTo(formula(V1, P), 12)
    }
    // 1323-A §3's v1 prose, now a fact of the frozen law: about 0.90 / 0.84 / 0.78 at P = 1 / 2 / 4.
    expect(pressureFactor(1, v1)).toBeCloseTo(0.9, 2)
    expect(pressureFactor(2, v1)).toBeCloseTo(0.84, 2)
    expect(pressureFactor(4, v1)).toBeCloseTo(0.78, 2)
  })
})

describe('1365 retune: the old-law fixture and the version boundary', () => {
  it('market-retune-old-law-fixture: v1 rows reconcile under v1 only; v2 rows under v2 only', async () => {
    const market = await loadMarket()
    const assess = requireExport<AssessBatch>(market, 'assessBatch')
    const v1 = requireExport<Law>(market, 'SHARED_MARKET_LAW_V1')
    const week = weekWithReleases(20) + 1
    const live = rivalRouteAt(week)
    const liveRows = marketRoot(live).assessments
    expect(liveRows.length, 'premise: recorded assessments').toBeGreaterThan(0)
    expect(new Set(liveRows.map((row) => row.definitionVersion))).toEqual(new Set(['p15a1-market-v2']))
    expect(() => makeSave(live)).not.toThrow()
    // The old-law fixture: the same releases priced by the frozen v1 law, labelled v1. It validates.
    const v1Rows = repriced(liveRows, v1, assess)
    expect(v1Rows.some((row, i) => row.factor !== liveRows[i]!.factor), 'premise: the retune moved a factor').toBe(true)
    const oldLaw = withRows(live, v1Rows)
    expect(() => makeSave(oldLaw)).not.toThrow()
    // v1 numbers under a v2 label refuse by name, and v2 numbers under a v1 label refuse by name.
    const moved = v1Rows.findIndex((row, i) => row.factor !== liveRows[i]!.factor)
    const relabelled = v1Rows.map((row, i) => (i === moved ? { ...row, definitionVersion: 'p15a1-market-v2' as never } : row))
    expect(() => makeSave(withRows(live, relabelled))).toThrow(/does not reconcile with p15a1-market-v2/)
    const forged = liveRows.map((row, i) => (i === moved ? { ...row, definitionVersion: 'p15a1-market-v1' as never } : row))
    expect(() => makeSave(withRows(live, forged))).toThrow(/does not reconcile with p15a1-market-v1/)
    // An unknown definition refuses by name.
    const unknown = liveRows.map((row, i) => (i === moved ? { ...row, definitionVersion: 'p15a1-market-v3' as never } : row))
    expect(() => makeSave(withRows(live, unknown))).toThrow(/definitionVersion p15a1-market-v3 is unknown/)
  }, HEAVY)

  it('market-retune-mixed-eras: v1 rows are exposures to a live v2 batch; the mixed root validates and ticks on', async () => {
    const market = await loadMarket()
    const assess = requireExport<AssessBatch>(market, 'assessBatch')
    const v1 = requireExport<Law>(market, 'SHARED_MARKET_LAW_V1')
    const week = weekWithReleases(20)
    const pre = rivalRouteAt(week)
    const before = marketRoot(pre).assessments
    const mixedPre = withRows(pre, repriced(before, v1, assess))
    const post = tick(mixedPre)
    const rows = marketRoot(post).assessments
    expect(rows.length).toBeGreaterThan(before.length)
    expect(rows.slice(0, before.length).every((row) => row.definitionVersion === 'p15a1-market-v1')).toBe(true)
    const appended = rows.slice(before.length)
    expect(appended.every((row) => row.definitionVersion === 'p15a1-market-v2' && row.week === week)).toBe(true)
    // The appended rows equal the live route's own rows for that week: the old rows priced the
    // batch exactly as exposures, whatever law they were stored under.
    const liveAppended = marketRoot(rivalRouteAt(week + 1)).assessments.slice(before.length)
    expect(canon(appended)).toBe(canon(liveAppended))
    expect(() => makeSave(post)).not.toThrow()
    expect(() => makeSave(tick(post))).not.toThrow()
  }, HEAVY)
})

describe('1365 activation: the held-batch guard is gone and rows persist within their bound', () => {
  it('market-retune-guard-removed: a root that already holds rows ticks and appends; recordedFromWeek stays', () => {
    const week = weekWithReleases(20)
    const pre = rivalRouteAt(week)
    const root = marketRoot(pre)
    expect(root.assessments.length, 'premise: rows already recorded').toBeGreaterThan(0)
    let post: GameState | null = null
    expect(() => { post = tick(pre) }).not.toThrow(/already holds market assessments/)
    const after = marketRoot(post!)
    expect(after.recordedFromWeek).toBe(root.recordedFromWeek)
    expect(after.assessments.length).toBeGreaterThan(root.assessments.length)
    expect(canon(after.assessments.slice(0, root.assessments.length))).toBe(canon(root.assessments))
  }, HEAVY)

  it('market-retune-storage-row-bound: every persisted row is at most 700 bytes as stableStringify writes it (measured 476-529 B/row at the ruled shape)', () => {
    const rows = marketRoot(rivalRouteAt(ROUTE_CAP_WEEK)).assessments
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(Buffer.byteLength(stableStringify(row))).toBeLessThanOrEqual(700)
      expect(row.reasons.length).toBeLessThanOrEqual(5)
      for (const reason of row.reasons) expect(reason.sourceReleaseIds.length).toBeLessThanOrEqual(5)
    }
  }, HEAVY)

  it('market-retune-storage-root-share: the root\'s share of the save, measured as G2 measured it (1355-A §5 budget 2%), on both in-lane routes at week 160', () => {
    // 1361-F5 ruling 3 routes seed-b's 2.33-3.12% share to a storage fix. This leaf measures the same
    // ratio (stableStringify(sharedMarket) bytes over exportSave bytes) on the routes this lane can run
    // and pins the measured values as ceilings: the rival route meets the budget, the held route does
    // not. The exact numeric gap at the ruled row shape is declared in the 1370-AR REPORT; closing it
    // needs a row-shape decision (1355-F2), not tuning.
    const share = (state: GameState): { rows: number; rootBytes: number; saveBytes: number; share: number } => {
      const root = marketRoot(state)
      const rootBytes = Buffer.byteLength(stableStringify(root))
      const saveBytes = Buffer.byteLength(exportSave(makeSave(state)))
      return { rows: root.assessments.length, rootBytes, saveBytes, share: rootBytes / saveBytes }
    }
    const rival = share(rivalRouteAt(ROUTE_CAP_WEEK))
    const held = share(routeAt(ROUTE_CAP_WEEK))
    console.info(`1365 storage: rival route ${JSON.stringify(rival)}; held route ${JSON.stringify(held)}`)
    expect(rival.rows).toBeGreaterThan(0)
    expect(held.rows).toBeGreaterThan(0)
    // MEASUREMENT PIN, ceilings only. The parent deferred 1361-F5 ruling 3's storage row-shape fix to a
    // measured follow-up, the seed-b G2 read-out after landing (parent ruling 2026-10-11 R-C), so this
    // leaf records the share and never pins the held route above the 2% budget.
    // Measured at r1, 2026-10-10 (share-measure.log in the 1370-AR package):
    //   rival route: 47 rows, 22,362 B of a 1,139,272 B save = 1.963%
    //   held route:  64 rows, 33,841 B of a 1,400,810 B save = 2.416%
    // Re-measured on the r4 source, 2026-10-11 (evidence/r4/share-measure-r4.log; the saves grew by R8's
    // recovery roots and the Save47 root):
    //   rival route: 47 rows, 22,362 B of a 1,142,402 B save = 1.957%
    //   held route:  64 rows, 33,841 B of a 1,401,438 B save = 2.415% (above the 2% budget: the deferred item)
    expect(rival.share).toBeLessThanOrEqual(0.02)
    expect(held.share).toBeLessThanOrEqual(0.025)
  }, HEAVY)
})
