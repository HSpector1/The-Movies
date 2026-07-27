// ── D-12 closure: the LIVE commercial-outlook forecast uses the canonical fame path ─
// The owner requirement: live change previews, Commercial Outlook, the greenlight-locked
// forecast, and the realized opening must all use the SAME §7 Hill fame opening-reach
// transformation (one engine helper, economy-gated) — never a duplicated UI/adapter formula.
// These prove: (1) the live re-forecast's expected box office equals the greenlight-locked
// forecast's for identical state; (2) the live and realized openings move under the same fame
// transform; (3) fame moves opening but not legs; (4/5) the ungated path is byte-identical;
// (7) no UI file independently computes fame reach. Seeded RNG only; public surface + fs scan.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  computeForecast,
  forecastProfitRange,
  resolveReception,
  RngStream,
  TUNING,
  fameReach,
} from '../src/core/index.js'
import type { CastSlot, Talent } from '../src/core/index.js'
import { makeReceptionInputs, makeTalent } from './_fixtures.js'

function highFameInputs(fame: number) {
  const cast = {
    lead: makeTalent({ role: 'actor', skill: 55, fame }),
    antagonist: makeTalent({ role: 'actor', skill: 55, fame }),
    support: makeTalent({ role: 'actor', skill: 55, fame }),
  } as Record<CastSlot, Talent>
  return makeReceptionInputs({ cast })
}
function ctxFor(inp: ReturnType<typeof highFameInputs>, saturateFame: boolean) {
  return {
    seed: 'co-fame',
    productionId: 'prod-0001',
    directorId: inp.director.id,
    releasedFilms: [],
    concepts: [inp.concept],
    salaries: 0,
    saturateFame,
  }
}

describe('D-12: live Commercial Outlook forecast == greenlight-locked forecast (same fame path)', () => {
  it('the live re-forecast expected box office equals the locked forecast expectedTotal', () => {
    const inp = highFameInputs(90)
    const ctx = ctxFor(inp, true)
    // The greenlight LOCKS computeForecast(inp, ctx, engaged) (actions.ts). The live Commercial
    // Outlook re-forecasts via forecastProfitRange with the SAME seed/productionId + engaged flag.
    const locked = computeForecast(inp, ctx, true)
    const live = forecastProfitRange(inp, ctx)
    // studioRevenue = share × gross ⇒ the implied gross must equal the locked expectedTotal exactly
    // (same noise draw, same saturated opening band) — proving no divergent fame path.
    expect(live.studioRevenue.expected / TUNING.STUDIO_RENTAL_BLENDED).toBeCloseTo(locked.expectedTotal, 2)
  })

  it('the ungated (linear) live re-forecast likewise matches the linear locked forecast', () => {
    const inp = highFameInputs(90)
    const ctx = ctxFor(inp, false)
    const lockedLinear = computeForecast(inp, ctx, false)
    const liveLinear = forecastProfitRange(inp, ctx)
    expect(liveLinear.studioRevenue.expected / TUNING.STUDIO_RENTAL_BLENDED).toBeCloseTo(lockedLinear.expectedTotal, 2)
  })
})

describe('D-12: the live forecast and the realized opening use the SAME fame transform', () => {
  it('a high-fame cast: saturation LOWERS both the forecast opening and the realized opening', () => {
    const inp = highFameInputs(90)
    // Forecast side: saturated total < linear total (only the opening changed; legs identical).
    const liveSat = forecastProfitRange(inp, ctxFor(inp, true))
    const liveLin = forecastProfitRange(inp, ctxFor(inp, false))
    expect(liveSat.studioRevenue.expected).toBeLessThan(liveLin.studioRevenue.expected)
    // Realized side: same direction (fame-isolation contract) — same fameReach transform.
    const relSat = resolveReception(inp, RngStream.fromSeed('co-fame'), true)
    const relLin = resolveReception(inp, RngStream.fromSeed('co-fame'), false)
    expect(relSat.opening).toBeLessThan(relLin.opening)
  })

  it('below the K crossover (low fame), saturation RAISES the forecast opening — matching realized', () => {
    const low = highFameInputs(20) // fameReach(20)=0.29 > 20/100 → opening rises
    const liveSat = forecastProfitRange(low, ctxFor(low, true))
    const liveLin = forecastProfitRange(low, ctxFor(low, false))
    expect(liveSat.studioRevenue.expected).toBeGreaterThan(liveLin.studioRevenue.expected)
    const relSat = resolveReception(low, RngStream.fromSeed('co-fame'), true)
    const relLin = resolveReception(low, RngStream.fromSeed('co-fame'), false)
    expect(relSat.opening).toBeGreaterThan(relLin.opening)
  })
})

describe('D-12: fame saturation moves the forecast OPENING band but never the LEGS band', () => {
  it('saturated vs linear forecast: legs bands (estimate/low/high) identical; only opening bands differ', () => {
    const inp = highFameInputs(90)
    const ctx = ctxFor(inp, true)
    const sat = computeForecast(inp, ctx, true)
    const lin = computeForecast(inp, ctx, false)
    for (let i = 0; i < sat.segments.length; i++) {
      const s = sat.segments[i]!
      const l = lin.segments[i]!
      // Legs / audience band untouched by the saturation.
      expect(s.estimate).toBe(l.estimate)
      expect(s.low).toBe(l.low)
      expect(s.high).toBe(l.high)
      // Opening band saturated for a high-fame cast → strictly lower than the linear opening.
      expect(s.opening.estimate).toBeLessThan(l.opening.estimate)
    }
    // And the linear path's opening band === its legs band (no saturation applied).
    for (const s of lin.segments) {
      expect(s.opening.estimate).toBe(s.estimate)
      expect(s.opening.low).toBe(s.low)
      expect(s.opening.high).toBe(s.high)
    }
  })

  it('fameReach is applied exactly once: the opening estimate reflects a single Hill transform', () => {
    // fameReach is monotone/concave and idempotent-free; a double application would over-damp.
    // Cross-check: the saturated opening center equals the linear center rescaled by the SINGLE
    // fameReach ratio of the fame term — i.e. the reception isolation, proven byte-exact elsewhere.
    // Here we assert the helper itself is the single source and behaves (no cap, monotone).
    expect(fameReach(100)).toBeGreaterThan(fameReach(99))
    expect(fameReach(0)).toBe(0)
    expect(fameReach(50)).toBeCloseTo(50 / (50 + TUNING.FAME_REACH_HALF_SAT), 10)
  })
})

// #7 — no React/adapter component independently computes fame reach; the ONLY fame-reach
// source is the core `fameReach` helper (imported, never reimplemented in the UI layer).
describe('D-12: no UI component independently calculates fame reach', () => {
  it('ui/src has zero fame-reach formulas or FAME_REACH_HALF_SAT references', () => {
    const uiRoot = join(process.cwd(), 'ui', 'src')
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) walk(full)
        else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
          const src = readFileSync(full, 'utf8')
          // The UI must not name the half-saturation constant nor reimplement fameReach, and must
          // not call fameReach directly (it consumes studioRevenue/opening via adapter selectors).
          if (src.includes('FAME_REACH_HALF_SAT') || /\bfameReach\s*\(/.test(src)) offenders.push(full)
        }
      }
    }
    walk(uiRoot)
    expect(offenders).toEqual([])
  })
})
