// ASTRA Sprint 19 (Owner decision D, 5c): engine-independent shared-market arithmetic and bounded reconciliation of the
// sealed engine-arithmetic eras. The retained failure: the Owner's Chrome-written P18 save (Save 51, week 428) carried one
// assessment of 72 whose factor differs from Node 20's Math.exp by one ULP (0.9743392133333503 vs …504), so Node refused
// the save. v3 prices through portableMath.ts (basic IEEE operations only); v1 and v2 rows reconcile within a documented
// allowance on the two transcendental-derived fields. Monetary fields, identities and recorded transactions are untouched.
import { describe, expect, it } from 'vitest'
import { portableExp, portablePow2 } from '../src/core/portableMath.js'
import { assessBatch, exposureWeight, liveMarketLaw, MARKET_LAWS, pressureFactor, SHARED_MARKET_DEFINITION, SHARED_MARKET_LAW_V1, SHARED_MARKET_LAW_V2 } from '../src/core/sharedMarket.js'
import { exportSave, importSave, makeSave, migrateToLive } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { marketRoot, routeAt, ROUTE_CAP_WEEK, type PersistedAssessment } from './helpers/p15a1-market-route.js'

/** Units in the last place between two doubles, measured on the second's exponent. */
const ulps = (a: number, b: number): number => (a === b ? 0 : Math.abs(a - b) / (2 ** (Math.floor(Math.log2(Math.abs(b))) - 52)))
/** x moved by n ULPs (n may be negative), measured on x's own binade. */
const nudge = (x: number, n: number): number => { let y = x; for (let i = 0; i < Math.abs(n); i++) y = y + Math.sign(n) * 2 ** (Math.floor(Math.log2(Math.abs(y))) - 52); return y }

describe('portableMath: basic operations only, within one ULP of the engine, exact where the law relies on it', () => {
  it('agrees with Math.exp and 2 ** y to within one ULP over the market\'s domain, and is exact at the anchors', () => {
    let worstExp = 0
    for (let p = 0; p <= 80; p += 0.0013) worstExp = Math.max(worstExp, ulps(portableExp(-p / 2), Math.exp(-p / 2)))
    let worstPow = 0
    for (let y = -30; y <= 2; y += 0.0011) worstPow = Math.max(worstPow, ulps(portablePow2(y), 2 ** y))
    expect(worstExp).toBeLessThanOrEqual(1)
    expect(worstPow).toBeLessThanOrEqual(1)
    expect(portableExp(0)).toBe(1)
    expect(portablePow2(0)).toBe(1)
    expect(portablePow2(-1)).toBe(0.5)
    expect(portablePow2(3)).toBe(8)
    expect(portablePow2(-13 / 13)).toBe(0.5)
    expect(portableExp(NaN)).toBeNaN()
    expect(portableExp(-800)).toBe(0)
    expect(portableExp(800)).toBe(Infinity)
  })

  it('reproduces the Owner-save divergence case: Node\'s exp and the portable exp agree there, Chrome\'s stored factor is one ULP away', () => {
    const pressure = 0.3752437440269083
    const chromeStored = 0.9743392133333503
    const portable = 1 - 0.15 * (1 - portableExp(-pressure / 2))
    expect(ulps(chromeStored, portable)).toBeLessThanOrEqual(1)
    expect(ulps(chromeStored, portable)).toBeGreaterThan(0)
  })
})

describe('the live era v3 prices through portable arithmetic; v1 and v2 are sealed with the engine\'s', () => {
  it('names v3 live, keeps v2\'s seven numbers, and freezes v2 with the engine arithmetic', () => {
    expect(SHARED_MARKET_DEFINITION).toBe('p15a1-market-v3')
    const live = liveMarketLaw()
    expect(live.transcendentals).toBe('portable')
    const { definition: _d, transcendentals: _t, ...liveNumbers } = live
    const { definition: _d2, transcendentals: _t2, ...v2Numbers } = SHARED_MARKET_LAW_V2
    expect(liveNumbers).toEqual(v2Numbers)
    expect(SHARED_MARKET_LAW_V2.transcendentals).toBe('engine')
    expect(SHARED_MARKET_LAW_V1.transcendentals).toBe('engine')
    expect(Object.keys(MARKET_LAWS).sort()).toEqual(['p15a1-market-v1', 'p15a1-market-v2', 'p15a1-market-v3'])
    // The same seven numbers: v3 and v2 differ at most in the last bit.
    for (let p = 0; p <= 40; p += 0.37) expect(ulps(pressureFactor(p, live), pressureFactor(p, SHARED_MARKET_LAW_V2))).toBeLessThanOrEqual(1)
    for (let offset = 4; offset < 26; offset++) expect(ulps(exposureWeight(0, offset, live).weight, exposureWeight(0, offset, SHARED_MARKET_LAW_V2).weight)).toBeLessThanOrEqual(1)
  })
})

/** The state with its market rows replaced; `makeSave` runs the whole save validator on it (the retune test's pattern). */
function withRows(state: GameState, rows: PersistedAssessment[]): GameState {
  return { ...state, sharedMarket: { ...marketRoot(state), assessments: rows } } as unknown as GameState
}
const validates = (state: GameState): void => { makeSave(state) }
function sealedCopy(state: GameState, law: typeof SHARED_MARKET_LAW_V2): PersistedAssessment[] {
  // A labelled constructed record: what an engine of a sealed era would have written for these weeks (the same releases
  // priced under that era's law with the engine's arithmetic), week by week from the stored rows' own facts.
  const rows = marketRoot(state).assessments
  const out: PersistedAssessment[] = []
  let start = 0
  while (start < rows.length) {
    const week = rows[start]!.week
    let end = start
    while (end < rows.length && rows[end]!.week === week) end++
    const exposures = rows.slice(0, start).filter((r) => r.week > week - 26).map((r) => ({ releaseId: r.releaseId, studioId: r.studioId, genre: r.genre, releaseWeek: r.week }))
    const members = rows.slice(start, end)
    const priced = assessBatch(exposures, { week, members: members.map((r) => ({ releaseId: r.releaseId, studioId: r.studioId, genre: r.genre })) }, { law })
    members.forEach((row, k) => out.push({ ...row, ...priced[k]!, p15DomainSequence: row.p15DomainSequence, phaseId: row.phaseId, phaseOrdinal: row.phaseOrdinal, phaseOrderVersion: row.phaseOrderVersion }))
    start = end
  }
  return out
}

describe('reconciliation: live rows exact; a sealed row\'s factor within one ULP, every other field exact', () => {
  const state = routeAt(ROUTE_CAP_WEEK)
  const rows = marketRoot(state).assessments
  const pressured = rows.findIndex((r) => r.factor < 1 && r.stockTerm > 0)
  if (rows.length === 0 || pressured < 0) throw new Error('premise: the market route holds a pressured assessment with a stock term')

  it('the route\'s own rows are v3 and validate; a v3 factor one ULP off is refused (the live era stays exact)', () => {
    expect(rows.every((r) => r.definitionVersion === 'p15a1-market-v3')).toBe(true)
    expect(() => validates(state)).not.toThrow()
    const off = rows.map((r, i) => (i === pressured ? { ...r, factor: nudge(r.factor, 1) } : r))
    expect(() => validates(withRows(state, off))).toThrow(/factor does not reconcile with p15a1-market-v3/)
  })

  it('a sealed v2 record validates as written by the engine, its factor one ULP off still validates, two ULPs or any other field off is refused', () => {
    const v2 = sealedCopy(state, SHARED_MARKET_LAW_V2)
    expect(v2.every((r) => r.definitionVersion === 'p15a1-market-v2')).toBe(true)
    expect(() => validates(withRows(state, v2))).not.toThrow()
    const oneOff = v2.map((r, i) => (i === pressured ? { ...r, factor: nudge(r.factor, 1) } : r))
    expect(() => validates(withRows(state, oneOff))).not.toThrow()
    const oneDown = v2.map((r, i) => (i === pressured ? { ...r, factor: nudge(r.factor, -1) } : r))
    expect(() => validates(withRows(state, oneDown))).not.toThrow()
    const twoOff = v2.map((r, i) => (i === pressured ? { ...r, factor: nudge(r.factor, 2) } : r))
    expect(() => validates(withRows(state, twoOff))).toThrow(/factor does not reconcile with p15a1-market-v2/)
    // The exact fields keep exact equality in a sealed era too: pressure, the stock term and the stock reason value.
    const pressureOff = v2.map((r, i) => (i === pressured ? { ...r, pressure: nudge(r.pressure, 1) } : r))
    expect(() => validates(withRows(state, pressureOff))).toThrow(/pressure does not reconcile with p15a1-market-v2/)
    const stockOff = v2.map((r, i) => (i === pressured ? { ...r, stockTerm: nudge(r.stockTerm, 1) } : r))
    expect(() => validates(withRows(state, stockOff))).toThrow(/stockTerm does not reconcile with p15a1-market-v2/)
    const reasonOff = v2.map((r, i) => (i === pressured ? { ...r, reasons: r.reasons.map((x) => (x.code === 'GENRE_SATURATION' ? { ...x, value: nudge(x.value, 1) } : x)) } : r))
    expect(() => validates(withRows(state, reasonOff))).toThrow(/reasons do not reconcile with p15a1-market-v2/)
    // A factor of exactly 1 (no pressure) is exact on every engine: a forged 1 − 2^-53 is refused (review finding 3).
    const unpressured = v2.findIndex((r) => r.factor === 1)
    expect(unpressured, 'premise: an unpressured row').toBeGreaterThanOrEqual(0)
    const forgedOne = v2.map((r, i) => (i === unpressured ? { ...r, factor: 1 - Number.EPSILON / 2 } : r))
    expect(() => validates(withRows(state, forgedOne))).toThrow(/factor does not reconcile with p15a1-market-v2/)
    // A live (v3) row relabelled as v2 inside its week's batch is refused by name (the batch is priced under its first
    // member's law; every member must name that law), wherever in the batch it sits.
    const relabelled = rows.map((r, i) => (i === pressured ? { ...r, definitionVersion: 'p15a1-market-v2' as const } : r))
    expect(() => validates(withRows(state, relabelled))).toThrow(/does not reconcile with p15a1-market-v/)
    const relabelledLast = rows.map((r, i) => (i === rows.length - 1 ? { ...r, definitionVersion: 'p15a1-market-v2' as const } : r))
    expect(() => validates(withRows(state, relabelledLast))).toThrow(/definitionVersion does not reconcile with p15a1-market-v/)
  })

  it('a sealed v1 record (the engine\'s arithmetic, maximum penalty 0.25) validates, and its factor one ULP off still validates', () => {
    const v1 = sealedCopy(state, SHARED_MARKET_LAW_V1)
    expect(v1.every((r) => r.definitionVersion === 'p15a1-market-v1')).toBe(true)
    expect(() => validates(withRows(state, v1))).not.toThrow()
    const oneOff = v1.map((r, i) => (i === pressured ? { ...r, factor: nudge(r.factor, -1) } : r))
    expect(() => validates(withRows(state, oneOff))).not.toThrow()
    const twoOff = v1.map((r, i) => (i === pressured ? { ...r, factor: nudge(r.factor, 2) } : r))
    expect(() => validates(withRows(state, twoOff))).toThrow(/factor does not reconcile with p15a1-market-v1/)
  })

  it('a v3 world saves, reloads byte for byte and continues deterministically', () => {
    const exported = exportSave(makeSave(state))
    const reloaded = migrateToLive(importSave(exported)).state
    expect(exportSave(makeSave(reloaded))).toBe(exported)
    const a = exportSave(makeSave(tick(tick(state))))
    const b = exportSave(makeSave(tick(tick(reloaded))))
    expect(a).toBe(b)
  }, 60_000)
})
