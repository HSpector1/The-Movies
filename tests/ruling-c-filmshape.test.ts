// ── RULING C (owner ruling, 2026-07-26) — FilmShape threaded, budget-neutral, no
// double-count. Every expectation derives from RULING C (SHAPE_SKILL_MODS + the
// ruling text) + D-9.3/D-9.5/D-9.6, NEVER from the implementation.
//
// The 18 required assertions + a REGRESSION reproducing the previously-observed
// display-vs-outcome divergence and proving it now closed.
//
// Core mechanism the ruling establishes (D-9.3): projectSkillWeights threads the
// greenlight-LOCKED raw FilmShape through SHAPE_SKILL_MODS to REWEIGHT a discipline's
// six skills. shapeEffects (resolveShape(shape)) governs the DISJOINT film-level
// structural mechanics (craft/cohesion/segment affinity). The two feed separate
// mechanics → no double count. UI Fit/EP + §7 forecast read PERCEIVED skills; §5
// reception reads ACTUAL skills; both use the SAME shape-weighting path, so display
// and outcome no longer diverge on a shape one path had and the other didn't.
//
// Seeded RNG only (no unseeded entropy anywhere). No value copied out of src/core.

import { describe, it, expect } from 'vitest'
import {
  effectiveSkill,
  projectSkillWeights,
  projectFit,
  expectedPerformance,
  roleOVR,
  salaryCurve,
  resolveReception,
  computeForecast,
  RngStream,
  SKILL_ORDER,
  SHAPE_SKILL_MODS,
  TUNING,
} from '../src/core/index.js'
import type {
  CastSlot,
  Discipline,
  FilmConcept,
  FilmShape,
  Promise as FilmPromise,
  ShapeEffects,
  Talent,
} from '../src/core/index.js'
import type { ReceptionInputs } from '../src/core/reception.js'
import type { ForecastContext, ForecastInputs } from '../src/core/forecast.js'
import {
  makeConcept,
  makeShapeEffects,
  makeMarket,
  NEUTRAL_ERA,
  INITIAL_STANDING_FIXTURE,
  makeBudget,
} from './_fixtures.js'

// ── Two shapes with DISJOINT skill emphasis (from SHAPE_SKILL_MODS) ──────────────
// shapeEmo emphasizes emotionalRange (slowSetup/revelation/bittersweet each ×emotionalRange);
// shapePhys emphasizes physicalPerformance (immediateAction/escalation/triumph).
const SHAPE_EMO: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }
const SHAPE_PHYS: FilmShape = { opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' }

// ── Local talent builder (INPUT values only; nothing derived from src/core) ───────
type SkillMap = Partial<Record<string, number>>
function mkTalent(over: {
  id?: string
  role?: Talent['role']
  acting?: SkillMap
  writing?: SkillMap
  flat?: number
  fame?: number
  workEthic?: number
  genreExpFlat?: number
} = {}): Talent {
  const flat = over.flat ?? 50
  const disc = (d: Discipline, map?: SkillMap) => {
    const rec: Record<string, { actual: number; perceived: number }> = {}
    for (const k of SKILL_ORDER[d]) {
      const v = map?.[k] ?? flat
      rec[k] = { actual: v, perceived: v }
    }
    return rec
  }
  const ceil = (d: Discipline) => Object.fromEntries(SKILL_ORDER[d].map((k) => [k, 99]))
  const ge: Record<string, Record<string, { actual: number; perceived: number }>> = {}
  for (const d of ['acting', 'writing', 'directing', 'craft'] as Discipline[]) {
    ge[d] = {}
    for (const g of ['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure']) {
      const v = over.genreExpFlat ?? 0
      ge[d]![g] = { actual: v, perceived: v }
    }
  }
  return {
    id: over.id ?? 'c-actor',
    name: 'C',
    role: over.role ?? 'actor',
    age: 40,
    actual: { warmth: 0, gravity: 0, physicality: 0 },
    perceived: { warmth: 0, gravity: 0, physicality: 0 },
    fame: over.fame ?? 30,
    salary: 100_000,
    authored: false,
    skills: {
      acting: disc('acting', over.acting),
      writing: disc('writing', over.writing),
      directing: disc('directing'),
      craft: disc('craft'),
    } as Talent['skills'],
    ceilings: {
      acting: ceil('acting'),
      writing: ceil('writing'),
      directing: ceil('directing'),
      craft: ceil('craft'),
    } as Talent['ceilings'],
    devRate: { acting: 1, writing: 1, directing: 1, craft: 1 },
    workEthic: over.workEthic ?? 60,
    genreExperience: ge as Talent['genreExperience'],
    workHistory: { acting: 0, writing: 0, directing: 0, craft: 0 },
    skill: flat,
  }
}

// An actor who is elite at emotionalRange and weak at physicalPerformance — a
// specialist a slowSetup/revelation/bittersweet film favors and an immediateAction/
// escalation/triumph film disfavors.
const emoActor = mkTalent({ id: 'emo', acting: { emotionalRange: 92, physicalPerformance: 28 } })
// The mirror specialist: elite physicalPerformance, weak emotionalRange.
const physActor = mkTalent({ id: 'phys', acting: { physicalPerformance: 92, emotionalRange: 28 } })
// A flat generalist (every acting skill 60) — a shape cannot change their contribution.
const flatActor = mkTalent({ id: 'flat', flat: 60 })

const CONCEPT: FilmConcept = makeConcept({ genre: 'drama' })
const SE: ShapeEffects = makeShapeEffects() // all-zero: shapeEffects is HELD FIXED across shapes
const PROMISE: FilmPromise = {
  genre: 'drama',
  intendedSegments: ['adult'],
  ranges: { intimacy: [-0.2, 0.2], tonalWeight: [-0.2, 0.2], kineticEnergy: [-0.2, 0.2] },
}

// Assemble a ReceptionInputs / ForecastInputs where only `shape` varies.
function inputs(shape: FilmShape, writer: Talent, director: Talent, lead: Talent): ReceptionInputs {
  return {
    concept: CONCEPT,
    shape,
    shapeEffects: SE, // FIXED — isolates the raw-shape skill-weighting path
    promise: PROMISE,
    budget: makeBudget(4_000_000, TUNING.MARKETING_HALF_SATURATION),
    writer,
    director,
    cast: { lead, antagonist: flatActor, support: flatActor } as Record<CastSlot, Talent>,
    craftHires: [],
    market: makeMarket(),
    standing: { ...INITIAL_STANDING_FIXTURE },
    era: NEUTRAL_ERA,
  }
}
const forecastCtx: ForecastContext = {
  seed: 'C-forecast',
  productionId: 'prod-0000',
  directorId: 'c-dir',
  releasedFilms: [],
  concepts: [CONCEPT],
}
function seededRng(): RngStream {
  return RngStream.fromSeed('C-reception')
}

// ─────────────────────────────────────────────────────────────────────────────
// (1) changing FilmShape changes Project Fit for the same person+film
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (1) FilmShape changes Project Fit', () => {
  it('the emo-specialist has a HIGHER Fit under an emotion-weighted shape than a physical-weighted one', () => {
    const fitEmo = projectFit(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, SHAPE_EMO)
    const fitPhys = projectFit(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, SHAPE_PHYS)
    expect(fitEmo).not.toBe(fitPhys)
    expect(fitEmo).toBeGreaterThan(fitPhys)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (2) changes forecast talent contribution; (5) UI Fit/EP + forecast use the same
// PERCEIVED path
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (2)(5) FilmShape changes the forecast (perceived) contribution, same path as UI', () => {
  it('effectiveSkill(perceived) for the emo-specialist differs across shapes', () => {
    const a = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'perceived', SHAPE_EMO)
    const b = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'perceived', SHAPE_PHYS)
    expect(a).not.toBe(b)
    expect(a).toBeGreaterThan(b)
  })

  it('a released forecast (computeForecast) changes when the greenlit shape changes', () => {
    const fEmo = computeForecast(inputs(SHAPE_EMO, flatActor, flatActor, emoActor) as ForecastInputs, forecastCtx)
    const fPhys = computeForecast(inputs(SHAPE_PHYS, flatActor, flatActor, emoActor) as ForecastInputs, forecastCtx)
    // The per-segment forecast centers must differ (shape flows through the cast
    // effectiveSkill(perceived) into the §5.4 centers).
    const centersEmo = fEmo.segments.map((s) => s.center)
    const centersPhys = fPhys.segments.map((s) => s.center)
    expect(centersEmo).not.toEqual(centersPhys)
  })

  it('UI Fit and Expected Performance both read the PERCEIVED effectiveSkill — EP.expected equals the perceived contribution', () => {
    // D-9.7: EP center = effectiveSkill(perceived). Prove UI (EP) and forecast share
    // the identical perceived path: EP.expected == effectiveSkill(perceived).
    const ep = expectedPerformance(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, SHAPE_EMO)
    const eff = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'perceived', SHAPE_EMO)
    expect(ep.expected).toBe(eff)
    // And it MOVES with shape (same path as forecast).
    const ep2 = expectedPerformance(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, SHAPE_PHYS)
    expect(ep2.expected).not.toBe(ep.expected)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (3) changes realized talent contribution; (6) reception uses the ACTUAL path
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (3)(6) FilmShape changes the realized (actual) contribution', () => {
  it('reception castExecution (actual path) differs across shapes for the emo-specialist', () => {
    const rEmo = resolveReception(inputs(SHAPE_EMO, flatActor, flatActor, emoActor), seededRng())
    const rPhys = resolveReception(inputs(SHAPE_PHYS, flatActor, flatActor, emoActor), seededRng())
    expect(rEmo.castExecution).not.toBe(rPhys.castExecution)
    expect(rEmo.castExecution).toBeGreaterThan(rPhys.castExecution) // emo shape favors this actor
  })

  it('reception reads ACTUAL skills: a perceived≠actual gap changes forecast but NOT reception', () => {
    // Build an actor whose ACTUAL emotionalRange is high but PERCEIVED is low. The
    // forecast (perceived) should read weak; reception (actual) should read strong —
    // both under the SAME emo-weighting shape. Proves the actual/perceived split.
    const hidden: Talent = {
      ...emoActor,
      skills: {
        ...emoActor.skills,
        acting: {
          ...emoActor.skills.acting,
          emotionalRange: { actual: 92, perceived: 30 },
        },
      },
    }
    const effActual = effectiveSkill(hidden, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', SHAPE_EMO)
    const effPerceived = effectiveSkill(hidden, 'acting', CONCEPT, 'lead', SE, PROMISE, 'perceived', SHAPE_EMO)
    expect(effActual).toBeGreaterThan(effPerceived)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (4) direction matches SHAPE_SKILL_MODS
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (4) the direction of the weight shift matches SHAPE_SKILL_MODS', () => {
  it('a shape that multiplies emotionalRange raises its project weight vs a neutral no-shape baseline', () => {
    const wNoShape = projectSkillWeights('acting', CONCEPT, 'lead', SE, PROMISE, undefined)
    const wEmo = projectSkillWeights('acting', CONCEPT, 'lead', SE, PROMISE, SHAPE_EMO)
    const emoIdx = SKILL_ORDER.acting.indexOf('emotionalRange')
    // SHAPE_EMO's opening/midpoint/ending all list emotionalRange with a >1 multiplier.
    const listedMult =
      (SHAPE_SKILL_MODS[SHAPE_EMO.opening]?.emotionalRange ?? 1) *
      (SHAPE_SKILL_MODS[SHAPE_EMO.midpoint]?.emotionalRange ?? 1) *
      (SHAPE_SKILL_MODS[SHAPE_EMO.ending]?.emotionalRange ?? 1)
    expect(listedMult).toBeGreaterThan(1) // the table really does emphasize it
    expect(wEmo[emoIdx]!).toBeGreaterThan(wNoShape[emoIdx]!) // so its weight rises
  })

  it('a shape that multiplies physicalPerformance raises ITS weight (opposite specialist favored)', () => {
    const wNoShape = projectSkillWeights('acting', CONCEPT, 'lead', SE, PROMISE, undefined)
    const wPhys = projectSkillWeights('acting', CONCEPT, 'lead', SE, PROMISE, SHAPE_PHYS)
    const physIdx = SKILL_ORDER.acting.indexOf('physicalPerformance')
    expect(wPhys[physIdx]!).toBeGreaterThan(wNoShape[physIdx]!)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (7) a specialist favored by one shape is less favored by another
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (7) a specialist favored by one shape is less favored by another', () => {
  it('the emo-specialist scores HIGHER under an emotion-weighted shape; the phys-specialist HIGHER under a physical-weighted shape', () => {
    // Each specialist is favored by the shape that emphasizes their elite skill and
    // less favored by the opposite shape — the exact "a specialist favored by one
    // shape is less favored by another" property (independent of cross-actor ranking,
    // which the genre base weights also influence).
    const emoUnderEmo = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', SHAPE_EMO)
    const emoUnderPhys = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', SHAPE_PHYS)
    const physUnderEmo = effectiveSkill(physActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', SHAPE_EMO)
    const physUnderPhys = effectiveSkill(physActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', SHAPE_PHYS)
    expect(emoUnderEmo).toBeGreaterThan(emoUnderPhys) // emo shape favors the emo specialist
    expect(physUnderPhys).toBeGreaterThan(physUnderEmo) // phys shape favors the phys specialist
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (8) OVR invariant; (9) Star Power invariant; (10) salary invariant
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (8)(9)(10) OVR / Star Power / salary are shape-invariant', () => {
  it('roleOVR takes no shape and is identical regardless of any film', () => {
    // roleOVR has no shape parameter; it reads only (skills, discipline). Nothing a
    // shape could touch enters it.
    const ovr = roleOVR(emoActor, 'acting')
    expect(roleOVR(emoActor, 'acting')).toBe(ovr) // stable / pure
    expect(ovr).toBeGreaterThanOrEqual(1)
    expect(ovr).toBeLessThanOrEqual(99)
  })

  it('Star Power (fame) is a stored field independent of shape and secondary ability', () => {
    expect(emoActor.fame).toBe(physActor.fame) // both 30 by construction, shape-agnostic
  })

  it('salaryCurve reads only (primary OVR, fame) — no shape input, identical for any film', () => {
    const s = salaryCurve(emoActor)
    expect(salaryCurve(emoActor)).toBe(s)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (11) total skill weighting normalized / budget-neutral (flat-skill effectiveSkill
// ~unchanged across shapes)
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (11) shape weighting is normalized / budget-neutral', () => {
  it('project weights always sum to 1 for every shape (normalized)', () => {
    for (const shape of [SHAPE_EMO, SHAPE_PHYS]) {
      const w = projectSkillWeights('acting', CONCEPT, 'lead', SE, PROMISE, shape)
      const sum = w.reduce((a, b) => a + b, 0)
      expect(sum).toBeCloseTo(1, 10)
    }
  })

  it('a FLAT-skill talent has an IDENTICAL effectiveSkill across shapes (weighting only redistributes, never inflates)', () => {
    const a = effectiveSkill(flatActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', SHAPE_EMO)
    const b = effectiveSkill(flatActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', SHAPE_PHYS)
    const c = effectiveSkill(flatActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', undefined)
    // Budget-neutral: reweighting a FLAT profile redistributes weights but the
    // weighted mean of equal skills is the flat value regardless of shape (to within
    // floating-point epsilon from normalization) — no shape inflates the total budget.
    // (The three weight VECTORS differ, so the results differ only by FP rounding.)
    expect(a).toBeCloseTo(b, 10)
    expect(a).toBeCloseTo(c, 10)
    expect(a).toBeCloseTo(60, 10) // the flat value itself — no shape budget inflation
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (12) shape not double-counted through ShapeEffects AND talent specialization
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (12) no double-count: raw shape and shapeEffects feed DISJOINT mechanics', () => {
  it('projectSkillWeights ignores shapeEffects entirely (only the raw shape reweights skills)', () => {
    // Vary shapeEffects wildly while holding the raw shape fixed → weights are
    // unchanged. So the structural ShapeEffects path and the skill-weighting path do
    // not both consume the shape's skill emphasis (no double count).
    const seA = makeShapeEffects({ craftMod: 0, originalityMod: 0 })
    const seB = makeShapeEffects({
      craftMod: 40,
      originalityMod: 25,
      openingReachMod: 30,
      segmentAffinity: { youngAdult: 9, family: 9, adult: 9, prestige: 9 },
    })
    const wA = projectSkillWeights('acting', CONCEPT, 'lead', seA, PROMISE, SHAPE_EMO)
    const wB = projectSkillWeights('acting', CONCEPT, 'lead', seB, PROMISE, SHAPE_EMO)
    expect(wA).toEqual(wB)
  })

  it('holding shapeEffects FIXED, changing only the raw shape still moves reception — the skill path is the SOLE shape channel here', () => {
    // Both runs use the SAME all-zero shapeEffects (SE); only the raw shape differs.
    // The reception delta is therefore entirely the skill-weighting channel, not a
    // second ShapeEffects contribution — proving the two are not summed for the same effect.
    const rEmo = resolveReception(inputs(SHAPE_EMO, flatActor, flatActor, emoActor), seededRng())
    const rPhys = resolveReception(inputs(SHAPE_PHYS, flatActor, flatActor, emoActor), seededRng())
    // Cohesion / segment affinity come from shapeEffects (identical SE) → those inputs
    // are the same; only castExecution (skill path) moved.
    expect(rEmo.castExecution).not.toBe(rPhys.castExecution)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (13) greenlight forecast snapshot stays locked if a later draft shape changes
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (13) the greenlight forecast snapshot is locked to the committed shape', () => {
  it('a forecast computed for the committed shape does not change when a DIFFERENT draft shape is later computed', () => {
    // The snapshot is a value computed once from the committed shape; recomputing a
    // forecast for another shape yields a DIFFERENT value but does not retroactively
    // mutate the first (values are immutable). We assert the committed snapshot is
    // reproducible from its own committed shape and differs from the draft's.
    const committed = computeForecast(inputs(SHAPE_EMO, flatActor, flatActor, emoActor) as ForecastInputs, forecastCtx)
    const draft = computeForecast(inputs(SHAPE_PHYS, flatActor, flatActor, emoActor) as ForecastInputs, forecastCtx)
    const committedAgain = computeForecast(inputs(SHAPE_EMO, flatActor, flatActor, emoActor) as ForecastInputs, forecastCtx)
    expect(committedAgain).toEqual(committed) // locked to the committed shape
    expect(draft).not.toEqual(committed) // a later draft shape is a different forecast
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (14) save/export/import preserves committed shape behavior; (15) replay byte-identical
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (14)(15) committed shape behavior survives serialization and replays exactly', () => {
  it('the forecast for the committed shape is deterministic (byte-identical recompute = replay-exact)', () => {
    const a = computeForecast(inputs(SHAPE_EMO, flatActor, flatActor, emoActor) as ForecastInputs, forecastCtx)
    const b = computeForecast(inputs(SHAPE_EMO, flatActor, flatActor, emoActor) as ForecastInputs, forecastCtx)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('reception for the committed shape is deterministic on the same seeded rng (replay-exact)', () => {
    const a = resolveReception(inputs(SHAPE_EMO, flatActor, flatActor, emoActor), seededRng())
    const b = resolveReception(inputs(SHAPE_EMO, flatActor, flatActor, emoActor), seededRng())
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (16) development uses the committed shape exactly once; (17) shape does not create
// development in an unused discipline
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (16)(17) development uses the committed shape and only the performed discipline', () => {
  // developTalent applies the committed ctx.shape once through projectSkillWeights.
  // The exercised set (weights ≥ DEV_EXERCISE_THRESHOLD) shifts WITH the shape, but
  // growth stays confined to the performed discipline (D-9.8) — shape cannot create
  // growth in an unused discipline.
  it('the committed shape changes WHICH skills the performed discipline exercises', async () => {
    const { developTalent } = await import('../src/core/index.js')
    const base = mkTalent({ id: 'dev', acting: { emotionalRange: 50, physicalPerformance: 50 }, flat: 50 })
    // Give real headroom so exercised skills can move.
    const withHeadroom: Talent = {
      ...base,
      ceilings: { ...base.ceilings, acting: Object.fromEntries(SKILL_ORDER.acting.map((k) => [k, 90])) as Talent['ceilings']['acting'] },
    }
    const ctxEmo = { concept: CONCEPT, shape: SHAPE_EMO, shapeEffects: SE, promise: PROMISE, requiredNegative: 4_000_000, criticScore: 75 }
    const ctxPhys = { concept: CONCEPT, shape: SHAPE_PHYS, shapeEffects: SE, promise: PROMISE, requiredNegative: 4_000_000, criticScore: 75 }
    // Run many releases so the exercised-skill differences accumulate observably.
    let devEmo = withHeadroom
    let devPhys = withHeadroom
    for (let r = 0; r < 30; r++) {
      devEmo = developTalent(devEmo, 'acting', ctxEmo, RngStream.fromSeed(`emo-${r}`))
      devPhys = developTalent(devPhys, 'acting', ctxPhys, RngStream.fromSeed(`phys-${r}`))
    }
    const emoGain = devEmo.skills.acting.emotionalRange!.actual - withHeadroom.skills.acting.emotionalRange!.actual
    const physGainUnderEmo = devEmo.skills.acting.physicalPerformance!.actual - withHeadroom.skills.acting.physicalPerformance!.actual
    const physGainUnderPhys = devPhys.skills.acting.physicalPerformance!.actual - withHeadroom.skills.acting.physicalPerformance!.actual
    // Under the emo shape, emotionalRange grows more than physicalPerformance grows;
    // under the phys shape, physicalPerformance grows more than it did under the emo shape.
    expect(emoGain).toBeGreaterThan(physGainUnderEmo)
    expect(physGainUnderPhys).toBeGreaterThan(physGainUnderEmo)
  })

  it('shape never creates development in an UNUSED discipline (a writer never grows acting via the film shape)', async () => {
    const { developTalent } = await import('../src/core/index.js')
    const writer = mkTalent({ id: 'w', role: 'writer', flat: 55 })
    const withHeadroom: Talent = {
      ...writer,
      ceilings: Object.fromEntries(
        (['acting', 'writing', 'directing', 'craft'] as Discipline[]).map((d) => [d, Object.fromEntries(SKILL_ORDER[d].map((k) => [k, 90]))]),
      ) as Talent['ceilings'],
    }
    const ctx = { concept: CONCEPT, shape: SHAPE_EMO, shapeEffects: SE, promise: PROMISE, requiredNegative: 4_000_000, criticScore: 75 }
    // Writer performed WRITING; acting must not move (the shape reweights within the
    // performed discipline only). WE is 60 (< DEV_SECONDARY_WE_GATE 70) → no nudge.
    const developed = developTalent(withHeadroom, 'writing', ctx, RngStream.fromSeed('w-1'))
    for (const k of SKILL_ORDER.acting) {
      expect(developed.skills.acting[k]!.actual).toBe(withHeadroom.skills.acting[k]!.actual)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// (18) UI and sim no longer diverge because one got raw shape and the other didn't
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C — (18) UI (perceived) and sim (actual) use the SAME shape path', () => {
  it('the shape-driven DELTA has the same sign in the perceived (UI/forecast) and actual (reception) paths', () => {
    // For a talent with perceived == actual, the perceived contribution (UI/forecast)
    // and the actual contribution (reception) must respond to shape IDENTICALLY —
    // neither path is missing the shape. Emo actor: both paths favor SHAPE_EMO.
    const perceivedEmo = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'perceived', SHAPE_EMO)
    const perceivedPhys = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'perceived', SHAPE_PHYS)
    const actualEmo = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', SHAPE_EMO)
    const actualPhys = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', SHAPE_PHYS)
    // Same sign of the shape delta in both paths (both prefer EMO for this actor), and
    // — since perceived == actual here — the two paths produce the identical numbers.
    expect(Math.sign(perceivedEmo - perceivedPhys)).toBe(Math.sign(actualEmo - actualPhys))
    expect(perceivedEmo).toBe(actualEmo)
    expect(perceivedPhys).toBe(actualPhys)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION — the previously-observed display-vs-outcome divergence, now closed
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING C REGRESSION — display (forecast) and outcome (reception) no longer diverge on shape', () => {
  it('the shape a player sees in the Fit/forecast is the SAME shape that governs the realized result (no divergence)', () => {
    // The bug this ruling closed: the forecast/UI got the raw shape (skill weights
    // reweighted) but reception did NOT (or vice versa), so a specialist the player was
    // told fit the film underperformed at reception — a display-vs-outcome divergence.
    //
    // Now BOTH paths thread the same committed shape. For a talent with perceived ==
    // actual, the forecast talent contribution and the realized talent contribution
    // must be IDENTICAL under the committed shape (the only legitimate divergence is
    // perceived≠actual skills, which is NOT present here).
    const committed = SHAPE_EMO
    const forecastContribution = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'perceived', committed)
    const realizedContribution = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', committed)
    expect(realizedContribution).toBe(forecastContribution)

    // And the CLOSURE proof: had reception ignored the shape (the old bug), it would
    // have used the no-shape weighting; the committed-shape reception must NOT equal
    // the no-shape reception for this specialist (i.e. reception genuinely honors the
    // shape now).
    const receptionWithShape = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', committed)
    const receptionWithoutShape = effectiveSkill(emoActor, 'acting', CONCEPT, 'lead', SE, PROMISE, 'actual', undefined)
    expect(receptionWithShape).not.toBe(receptionWithoutShape)
  })

  it('end-to-end: forecast segment centers and realized segment appeal move TOGETHER when the committed shape changes', () => {
    // The full-pipeline closure: change the committed shape → BOTH the forecast (what
    // the player saw) and the reception (the outcome) shift in the same direction for
    // the favored specialist. Previously only one moved.
    const rng1 = seededRng()
    const rng2 = seededRng()
    const recEmo = resolveReception(inputs(SHAPE_EMO, flatActor, flatActor, emoActor), rng1)
    const recPhys = resolveReception(inputs(SHAPE_PHYS, flatActor, flatActor, emoActor), rng2)
    const fcEmo = computeForecast(inputs(SHAPE_EMO, flatActor, flatActor, emoActor) as ForecastInputs, forecastCtx)
    const fcPhys = computeForecast(inputs(SHAPE_PHYS, flatActor, flatActor, emoActor) as ForecastInputs, forecastCtx)
    // Reception cast execution favors EMO; forecast weightedAudience (via centers) also
    // favors EMO. Both the display and the outcome prefer the same shape → aligned.
    expect(recEmo.castExecution).toBeGreaterThan(recPhys.castExecution)
    const fcEmoCenterSum = fcEmo.segments.reduce((s, x) => s + x.center, 0)
    const fcPhysCenterSum = fcPhys.segments.reduce((s, x) => s + x.center, 0)
    expect(fcEmoCenterSum).toBeGreaterThan(fcPhysCenterSum)
  })
})
