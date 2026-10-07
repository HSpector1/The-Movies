// Colocated spec for the D-16 run driver. Run with:
//   npx vitest run --config src/harness/d16/vitest.d16.config.ts
//
// These lock the five things the B2 review found the driver got wrong. Each `describe`
// names its finding so a regression is attributable.

import { describe, it, expect } from 'vitest'
import { TUNING, applyActions, employmentEngaged, tick } from '../../core/index.js'
import type { GameState } from '../../core/index.js'
import { foundStudioFor, runOne } from './driver.js'
import { assertMarketingGridPristine, standardPackage, toGreenlightAction } from './packages.js'
import {
  cheapestViable,
  doNothing,
  exploitDisengage,
  forecastProfitMax,
  freelancerLean,
  publicitySpamAdversary,
  standardCadence,
  standardMinMkt,
} from './policies.js'
import { DEFAULT_PUBLICITY } from './publicity.js'
import { classifyFinancialState } from './states.js'

const SEEDS = ['d16-0001', 'd16-0002', 'd16-0003', 'd16-0004', 'd16-0005']

// ── B2-C2 ────────────────────────────────────────────────────────────────────
// The reconstructed multiplier must be the ENGINE's discoverability and nothing else:
//   m = clamp(exp(spread·z), DISC_FLOOR, DISC_CEIL) with spread ≥ 0   (reception.ts:643-646)
// which forces (a) m ∈ [0.2, 1.8], (b) sign(m−1) = sign(z), (c) m EXACTLY 1 whenever the
// spread is 0, (d) the implied spread ln(m)/z ∈ [0, DISC_SPREAD].
// Pre-fix the denominator was the PERCEIVED-skill forecast core, so all four failed.
describe('d16/driver — discoveryMultiplier is the D-13 draw, not the information gap (B2-C2)', () => {
  type Row = { m: number; z: number; pva: number }
  const rows: Row[] = []
  const supported: Row[] = []
  for (const seed of SEEDS) {
    for (const policy of [standardCadence, cheapestViable]) {
      for (const f of runOne({ seed, policy, horizonWeeks: 156 }).films) {
        if (f.discoveryMultiplier === null || f.discoveryZ === null) continue
        rows.push({ m: f.discoveryMultiplier, z: f.discoveryZ, pva: f.perceivedVsActualOpeningRatio! })
      }
    }
    // P5 buys $1M marketing on most films, so reachSupport clears DISC_SUPPORT_THRESHOLD and
    // the TRUE multiplier is exactly 1 — the single sharpest test of the reconstruction.
    for (const f of runOne({ seed, policy: forecastProfitMax, horizonWeeks: 156 }).films) {
      if (f.discoveryMultiplier === null || f.discoveryZ === null) continue
      supported.push({ m: f.discoveryMultiplier, z: f.discoveryZ, pva: f.perceivedVsActualOpeningRatio! })
    }
  }

  it('the corpus is not vacuous', () => {
    expect(rows.length).toBeGreaterThan(50)
    expect(supported.length).toBeGreaterThan(50)
  })

  it('never leaves the engine clamp [DISC_FLOOR, DISC_CEIL]', () => {
    const out = rows.concat(supported).filter((r) => r.m < TUNING.DISC_FLOOR - 1e-9 || r.m > TUNING.DISC_CEIL + 1e-9)
    expect(out.map((r) => r.m)).toEqual([])
  })

  it('always agrees in sign with the draw: sign(m − 1) === sign(z)', () => {
    const bad = rows
      .concat(supported)
      .filter((r) => Math.abs(r.m - 1) > 1e-9 && Math.sign(r.m - 1) !== Math.sign(r.z))
    expect(bad.map((r) => `m=${r.m} z=${r.z}`)).toEqual([])
  })

  it('implies a spread inside [0, DISC_SPREAD] — never a negative one', () => {
    const implied = rows
      .concat(supported)
      .filter((r) => Math.abs(r.z) > 0.2 && r.m > TUNING.DISC_FLOOR + 1e-9 && r.m < TUNING.DISC_CEIL - 1e-9)
      .map((r) => Math.log(r.m) / r.z)
    expect(implied.length).toBeGreaterThan(20)
    expect(implied.filter((v) => v < -1e-9)).toEqual([])
    expect(implied.filter((v) => v > TUNING.DISC_SPREAD + 1e-9)).toEqual([])
  })

  it('is EXACTLY 1 for well-supported films (spread === 0 ⇒ multiplier === 1)', () => {
    const exact = supported.filter((r) => r.m === 1)
    expect(exact.length).toBeGreaterThan(0)
  })

  it('emits the information gap SEPARATELY, and it is a different number from the draw', () => {
    const gaps = rows.map((r) => r.pva).filter((v) => Number.isFinite(v))
    expect(gaps.length).toBe(rows.length)
    // the perceived core is close to, but not equal to, the actual core
    expect(gaps.some((g) => g !== 1)).toBe(true)
    for (const g of gaps) expect(Math.abs(g - 1)).toBeLessThan(0.5)
  })
})

// ── B2-C3 / C8 ───────────────────────────────────────────────────────────────
describe('d16/driver — the engagement cliff is declared, measured and attributable (B2-C3/C8)', () => {
  it('P16 doNothing declares its disengagement, so it is never flagged as a defect', () => {
    expect(doNothing.disengagementIntended).toBe(true)
    const rec = runOne({ seed: 'd16-0001', policy: doNothing, horizonWeeks: 260 })
    expect(rec.disengagementIntended).toBe(true)
    expect(rec.engagementCliffHit).toBe(false)
    // …and `engagedWeekFraction` still shows the truth: engaged for the 208 contract weeks only.
    expect(rec.engagedWeekFraction).toBeCloseTo(TUNING.CONTRACT_MAX_WEEKS / 260, 6)
  })

  it('P15 exploit reports engagedWeekFraction, not a meaningless "cliff 0 %"', () => {
    const rec = runOne({ seed: 'd16-0001', policy: exploitDisengage, horizonWeeks: 104 })
    expect(rec.disengagementIntended).toBe(true)
    expect(rec.engagementCliffHit).toBe(false)
    expect(rec.engagedWeekFraction).toBeGreaterThan(0)
    expect(rec.engagedWeekFraction).toBeLessThan(0.15)
  })

  // D-17B INSTRUMENT SPLIT — re-specified 2026-08-12 under Phase-A gate ruling 1, in the same
  // form D-17A/R2 re-specified the exploit test below it. THE CLAIM THIS TEST USED TO MAKE was
  // that P1's unpayable renewal is an "engagement cliff". It is not: post-R2 `economyEngaged`
  // is the persisted, monotonic regime and NEVER goes false, so nothing about the economy under
  // study changed — what happened is the WEEK-208 ROSTER WALL (A5 Finding 0). Reading the
  // retired `employmentEngaged` predicate here made the runner EXCLUDE 43.1 % of 312-week runs
  // from every distribution as "contaminated" when they were simply failing. The two facts are
  // now measured separately, and BOTH are asserted here: no cliff, a real wall, and the
  // employment collapse still visible in `engagedWeekFraction`.
  it('an unpayable renewal is a ROSTER WALL, not an engagement cliff — and it carries its week', () => {
    // P1 ends deeply negative, so past the 208-week contract wall it genuinely cannot pay a
    // renewal bonus. That is a faithful consequence — and it must be visible, not pooled.
    const rec = runOne({ seed: 'd16-0001', policy: cheapestViable, horizonWeeks: 260 })
    expect(rec.disengagementIntended).toBe(false)
    // the ECONOMY never disengaged: no cliff, and the cliff fields stay null
    expect(rec.engagementCliffHit).toBe(false)
    expect(rec.engagementCliffWeek).toBeNull()
    expect(rec.engagementCliffCash).toBeNull()
    // …but the WALL is real, is stamped, and is stamped past the contract wall
    expect(rec.rosterWallHit).toBe(true)
    expect(rec.rosterWallWeek).toBeGreaterThanOrEqual(TUNING.CONTRACT_MAX_WEEKS)
    // …and it happened with negative cash, which is what makes it a wall and not a choice
    const wall = rec.checkpoints.find((c) => c.week >= rec.rosterWallWeek!)
    expect(wall === undefined || wall.cash < 0).toBe(true)
    // the EMPLOYMENT signal — the thing the old flag actually measured — is undamaged
    expect(rec.engagedWeekFraction).toBeLessThan(1)
  })

  it('the roster-wall stamp is ABSENT (not false) on a run that never hits the wall', () => {
    const rec = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 104 })
    expect(rec.rosterWallHit).toBeUndefined()
    expect(rec.rosterWallWeek).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(rec, 'rosterWallHit')).toBe(false)
  })

  it('renewal at the FULL 12-week window keeps the healthy cadence policies engaged to 260 wk', () => {
    for (const seed of SEEDS) {
      const rec = runOne({ seed, policy: forecastProfitMax, horizonWeeks: 260 })
      if (!rec.engagementCliffHit) expect(rec.engagedWeekFraction).toBe(1)
    }
    // at least one seed must survive, or this assertion is vacuous
    expect(SEEDS.some((seed) => !runOne({ seed, policy: forecastProfitMax, horizonWeeks: 260 }).engagementCliffHit)).toBe(true)
  })
})

// ── B2-C5 ────────────────────────────────────────────────────────────────────
describe('d16/driver — renewals are priced against a RUNNING cash figure (B2-C5)', () => {
  it('no renewContract is ever refused by the engine, over 208 weeks of the busiest policies', () => {
    for (const policy of [standardCadence, standardMinMkt]) {
      for (const seed of SEEDS) {
        const rec = runOne({ seed, policy, horizonWeeks: 208 })
        const renewalRejects = rec.rejections.filter((r) => r.kind === 'renewContract')
        expect(
          renewalRejects.map((r) => `${policy.name}/${seed} wk${r.week}: ${r.reason.slice(0, 60)}`),
        ).toEqual([])
      }
    }
  })

  it('records the ENGINE’s own reason for anything it does refuse', () => {
    // the field exists, is bounded, and is shaped for aggregation
    const rec = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 208 })
    expect(Array.isArray(rec.rejections)).toBe(true)
    expect(rec.rejections.length).toBeLessThanOrEqual(25)
    expect(rec.rejections.length === 0 || rec.rejectedActions > 0).toBe(true)
    if (rec.rejections.length === 0) expect(rec.rejectionsTruncated).toBe(false)
  })
})

// ── B2-H5 ────────────────────────────────────────────────────────────────────
describe('d16/driver — P9 really lets its short contracts lapse (B2-H5)', () => {
  it('drops to exactly ONE contract at week 52 and stays engaged on it', () => {
    let s: GameState = foundStudioFor('d16-0001', freelancerLean).state
    expect(s.contracts.length).toBeGreaterThan(1)
    const rec = runOne({ seed: 'd16-0001', policy: freelancerLean, horizonWeeks: 208 })
    expect(rec.engagementCliffHit).toBe(false)
    expect(rec.engagedWeekFraction).toBe(1)
    // renewal fires at most for the single retained CONTRACT_MAX_WEEKS hire
    expect(freelancerLean.roster.renewMinTermWeeks).toBe(TUNING.CONTRACT_MAX_WEEKS)
    // walk the contract count forward to confirm the lapse actually happens
    for (let w = 0; w < 60; w++) s = tick(s, { develop: true })
    expect(employmentEngaged(s)).toBe(true)
    expect(s.contracts.filter((c) => c.endWeekExclusive > s.market.tick).length).toBe(1)
  })

  it('MEASURES the resulting market thinness rather than hiding it', () => {
    const lean = runOne({ seed: 'd16-0001', policy: freelancerLean, horizonWeeks: 208 })
    const full = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 208 })
    // a one-person roster cannot field a film from a market with no writers/directors
    expect(lean.unstaffableWeeks).toBeGreaterThan(0)
    expect(lean.unstaffableWeeks).toBeGreaterThan(full.unstaffableWeeks)
    expect(Object.keys(lean.unstaffableRoleWeeks).length).toBeGreaterThan(0)
  })
})

// ── B2-C10 ───────────────────────────────────────────────────────────────────
describe('d16/driver — a RESUMED run is accounted to itself (B2-C10)', () => {
  // Build a "save" by running 86 weeks, exactly like the Week-86 owner save's shape,
  // without depending on a gitignored artifact.
  // Take a real mid-history state: found, greenlight one film so the save carries released
  // history, then tick to week 86 exactly as the owner save did.
  const seeded = (): GameState => {
    let s = foundStudioFor('d16-0002', standardCadence).state
    const pkg = standardPackage(s)!
    s = applyActions(s, [toGreenlightAction(pkg)])
    for (let w = 0; w < 86; w++) s = tick(s, { develop: true })
    return s
  }

  it('counts only the films THIS run released, and slices relative to its own start', () => {
    const save = seeded()
    const priorFilms = save.studio.releasedFilms.length
    expect(priorFilms).toBeGreaterThan(0) // the save really does carry history
    const rec = runOne({
      seed: 'd16-0002',
      policy: standardCadence,
      horizonWeeks: 120,
      initialState: save,
    })
    expect(rec.startWeek).toBe(86)
    expect(rec.filmsReleasedAtStart).toBe(priorFilms)
    // the save's own history is EXCLUDED — pre-fix this reported the save's 9 films as the
    // policy's, with filmsGreenlit = 0.
    expect(rec.filmsReleased).toBeGreaterThanOrEqual(0)
    expect(rec.filmsReleased).toBeLessThanOrEqual(rec.filmsGreenlit)
    // slices are RELATIVE — 52 and 104 both fire even though the run opened at tick 86
    expect(Object.keys(rec.slices).sort()).toEqual(['104', '52'])
    expect(rec.slices['52']!.week).toBe(86 + 52)
    expect(rec.slices['104']!.week).toBe(86 + 104)
    expect(rec.slices['52']!.weeksElapsed).toBe(52)
  })

  it('measures runaway success against the run’s OWN opening cash', () => {
    const save = seeded()
    const rec = runOne({
      seed: 'd16-0002',
      policy: standardCadence,
      horizonWeeks: 60,
      initialState: save,
    })
    expect(rec.openingCash).toBe(save.studio.cash)
    expect(rec.episodes.runawayThreshold).toBeCloseTo(3 * save.studio.cash, 6)
    expect(rec.episodes.runawayThreshold).not.toBe(3 * TUNING.INITIAL_CASH)
  })

  it('a FRESH run is unchanged: opening cash is INITIAL_CASH and slices are absolute-equal', () => {
    const rec = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 208 })
    expect(rec.startWeek).toBe(0)
    expect(rec.openingCash).toBe(TUNING.INITIAL_CASH)
    expect(rec.filmsReleasedAtStart).toBe(0)
    expect(rec.episodes.runawayThreshold).toBe(3 * TUNING.INITIAL_CASH)
    for (const [k, s] of Object.entries(rec.slices)) expect(s.week).toBe(Number(k))
  })
})

// ── D-17B ────────────────────────────────────────────────────────────────────
// Every new row field must be ABSENT (not null, not false) when its instrument did not fire,
// or the 300×208 neutral corpus stops hashing to the d17a-final SHA.
describe('d17b/driver — the frozen row schema', () => {
  it('emits NONE of the new blocks on a neutral run', () => {
    const rec = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 104 })
    for (const k of ['awareness', 'publicity', 'counterFlow', 'rosterWallHit', 'rosterWallWeek', 'captures']) {
      expect(Object.prototype.hasOwnProperty.call(rec, k), `${k} must be absent`).toBe(false)
    }
    // …and nothing new sneaks into the serialized form either
    const keys = Object.keys(JSON.parse(JSON.stringify(rec)) as Record<string, unknown>)
    expect(keys).not.toContain('awareness')
    expect(keys).not.toContain('rosterWallHit')
  })

  it('awareness.timeInBand sums to EXACTLY horizonWeeks, and the bands partition the stock', () => {
    for (const horizon of [52, 104]) {
      const rec = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: horizon, awarenessStats: true })
      const a = rec.awareness!
      const total = Object.values(a.timeInBand).reduce((x, y) => x + y, 0)
      expect(total).toBe(horizon)
      expect(a.weeksAtFloor).toBe(a.timeInBand['0'])
      expect(a.min).toBeLessThanOrEqual(a.max)
      expect(a.positiveWeeks + a.negativeWeeks).toBeLessThanOrEqual(horizon)
    }
  })

  it('durableRecovery is present exactly when the run entered distress', () => {
    const calm = runOne({ seed: 'd16-0001', policy: doNothing, horizonWeeks: 104 })
    expect(calm.episodes.distressEntryWeek).toBeNull()
    expect(calm.durableRecovery).toBeUndefined()
    const rough = runOne({ seed: 'd16-0001', policy: cheapestViable, horizonWeeks: 260 })
    expect(rough.episodes.distressEntryWeek).not.toBeNull()
    expect(rough.durableRecovery).toBeDefined()
    // the strict form can never be true where the G8 form is false
    expect(rough.durableRecovery!.at103Strict && !rough.durableRecovery!.at103).toBe(false)
  })

  it('the publicity note-sum equals the shim tally on a real run (the driver’s own assert)', () => {
    const rec = runOne({
      seed: 'd16-0001',
      policy: publicitySpamAdversary,
      horizonWeeks: 156,
      publicity: DEFAULT_PUBLICITY,
    })
    expect(rec.publicity!.count).toBeGreaterThan(0)
    // the driver throws if these disagree, so reaching here IS the assertion; check the
    // arithmetic anyway, from the ledger totals the row carries
    expect(rec.ledgerTotals['termination']).toBe(-rec.publicity!.spend)
    expect(rec.publicity!.spend).toBe(
      rec.publicity!.spendByTier.whisper + rec.publicity!.spendByTier.push + rec.publicity!.spendByTier.blitz,
    )
  })

  it('captureAt harvests states whose classifier label is the one that was asked for', () => {
    const rec = runOne({
      seed: 'd16-0001',
      policy: cheapestViable,
      horizonWeeks: 260,
      captureAt: { states: ['bareMinOnly', 'noProduction'], firstOnly: true, maxPerRun: 4 },
    })
    expect(rec.captures!.length).toBeGreaterThan(0)
    expect(rec.captures!.length).toBeLessThanOrEqual(4)
    for (const c of rec.captures!) {
      expect(['bareMinOnly', 'noProduction']).toContain(c.state)
      // the captured GameState really is at that week, and re-classifies the same way
      expect(c.gameState.market.tick).toBe(c.week)
      expect(classifyFinancialState(c.gameState)).toBe(c.state)
    }
    // firstOnly means one capture per class at most
    expect(new Set(rec.captures!.map((c) => c.state)).size).toBe(rec.captures!.length)
  })

  it('--slice-weeks style custom slices are honoured, and stay RELATIVE to the run’s start', () => {
    const rec = runOne({
      seed: 'd16-0001',
      policy: standardCadence,
      horizonWeeks: 260,
      sliceWeeks: [52, 104, 208, 260, 312],
    })
    expect(Object.keys(rec.slices).sort((a, b) => Number(a) - Number(b))).toEqual(['52', '104', '208', '260'])
    expect(rec.slices['260']!.week).toBe(260)
    expect(rec.slices['260']!.weeksElapsed).toBe(260)
    // 312 is past the horizon, so it is clipped rather than emitted empty
    expect(rec.slices['312']).toBeUndefined()
  })

  it('a CAPACITY-ANCHORED grid re-resolves every week and moves what the policy commits', () => {
    const fixed = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 104 })
    const anchored = runOne({
      seed: 'd16-0001',
      policy: standardCadence,
      horizonWeeks: 104,
      marketingGrid: (capacity: number) => [
        Math.max(1, Math.round(1.3 * capacity)),
        Math.max(2, Math.round(2.0 * capacity)),
        Math.max(3, Math.round(2.5 * capacity)),
      ],
    })
    const fixedMkt = new Set(fixed.films.map((f) => f.marketing))
    const anchoredMkt = new Set(anchored.films.map((f) => f.marketing))
    expect(fixedMkt).toEqual(new Set([400_000]))
    expect(anchoredMkt.has(400_000)).toBe(false)
    // the rungs really did MOVE between weeks (that is the whole point of anchoring)
    expect(anchoredMkt.size).toBeGreaterThan(1)
    expect(anchored.reconciliationOk).toBe(true)
    // and the process-global grid is restored afterwards
    assertMarketingGridPristine('after capacity-anchored run')
  })
})
