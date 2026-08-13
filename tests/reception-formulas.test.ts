// PHASE-2 test: hand-computed §5 formula fixtures + §4 resolveShape aggregation +
// §15.5 slot transform + §15.3 neutral stacking + §15.4 promise ordering + §5.6
// determinism / reviewVariance.
//
// Every expected number was derived on paper from the contract formulas BEFORE the
// assertion was written; the derivation is shown in each comment. No value is copied
// from src/core.

import { describe, it, expect } from 'vitest'
import {
  personaToExpression,
  resolveShape,
  RngStream,
  TUNING,
} from '../src/core/index.js'
import { castContribution, resolveReception } from '../src/core/reception.js'
import type { Persona } from '../src/core/index.js'
import {
  makeBudget,
  makeConcept,
  makeReceptionInputs,
  makeShapeEffects,
  makeTalent,
  promiseCentered,
  ZERO_PERSONA,
} from './_fixtures.js'
import type { CastSlot, Talent } from '../src/core/index.js'

const seed = () => RngStream.fromSeed('formula-seed')

// ─────────────────────────────────────────────────────────────────────────────
// §5.1  budgetAdequacy at 0.75 / 1.0 / 1.25 × requiredNegative  (M3 rationale)
// ─────────────────────────────────────────────────────────────────────────────
describe('§5.1 budgetAdequacy = 100*clamp(neg/req,0,1.15)/1.15', () => {
  // requiredNegative = baseNegativeCost * budgetDemandMultiplier * era.costScale.
  // Fixture: base 4,000,000, budgetMult 1.0, costScale 1.0 -> requiredNegative 4,000,000.
  const base = 4_000_000
  const mk = (mult: number) =>
    resolveReception(
      makeReceptionInputs({
        concept: makeConcept({ baseNegativeCost: base }),
        shapeEffects: makeShapeEffects({ budgetDemandMultiplier: 1.0 }),
        budget: makeBudget(mult * base, TUNING.MARKETING_HALF_SATURATION),
      }),
      seed(),
    )

  it('0.75× required -> 65.2 (100*0.75/1.15 = 65.2174)', () => {
    expect(mk(0.75).budgetAdequacy).toBeCloseTo(65.2, 1)
  })
  it('1.00× required -> 87.0 (100*1.0/1.15 = 86.9565)', () => {
    expect(mk(1.0).budgetAdequacy).toBeCloseTo(87.0, 1)
  })
  it('1.25× required -> 100 (clamp(1.25,0,1.15)/1.15 = 1)', () => {
    expect(mk(1.25).budgetAdequacy).toBeCloseTo(100, 1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §5.1  technical  (D-4)
// ─────────────────────────────────────────────────────────────────────────────
describe('§5.1 technical', () => {
  it('= 40 exactly when craftIds is empty (D-4)', () => {
    const r = resolveReception(makeReceptionInputs({ craftHires: [] }), seed())
    expect(r.technical).toBe(40)
  })
  it('= mean of craft skills otherwise', () => {
    // hires skills 30, 60, 90 -> mean 60.
    const r = resolveReception(
      makeReceptionInputs({
        craftHires: [
          makeTalent({ role: 'craft', skill: 30 }),
          makeTalent({ role: 'craft', skill: 60 }),
          makeTalent({ role: 'craft', skill: 90 }),
        ],
      }),
      seed(),
    )
    expect(r.technical).toBeCloseTo(60, 6)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §5.1  craft — one fully anchored numeric case
// ─────────────────────────────────────────────────────────────────────────────
describe('§5.1 craft — anchored numeric derivation', () => {
  it('uses a managed screenplay actual-strength override without changing legacy inputs', () => {
    const base = makeReceptionInputs({
      concept: makeConcept({ baselineStrength: 10 }),
      writer: makeTalent({ role: 'writer', skill: 10 }),
    })
    const legacy = resolveReception(base, seed())
    const managed = resolveReception(
      { ...base, scriptStrengthOverride: { actual: 88, perceived: 22 } },
      seed(),
    )
    expect(legacy.scriptStrength).toBeCloseTo(10, 6)
    expect(managed.scriptStrength).toBe(88)
    expect(managed.craft - legacy.craft).toBeCloseTo(0.3 * 78, 6)
  })

  it('craft = 0.30*script + 0.25*dir + 0.20*castExec + 0.15*tech + 0.10*budgetAdq + craftMod', () => {
    // Inputs chosen so every craft input is exactly known:
    //   baselineStrength 50, writer.skill 50 -> scriptStrength = 0.6*50 + 0.4*50 = 50
    //   director.skill 60                      -> directorExecution = 60
    //   cast skills all 70, roleFit all 1 (actual == target) ->
    //       castExecution = 0.6*70 + 0.4*100 = 82 (uniform across weighted slots)
    //   no craft hires                         -> technical = 40
    //   budget.negative = requiredNegative     -> budgetAdequacy = 100/1.15 = 86.9565
    //   craftMod injected = 0
    //   craft = 0.30*50 + 0.25*60 + 0.20*82 + 0.15*40 + 0.10*86.9565 + 0
    //         = 15 + 15 + 16.4 + 6 + 8.69565 = 61.09565
    const target: Persona = { warmth: 0.2, gravity: -0.1, physicality: 0.4 }
    const actorAt = (): Talent =>
      makeTalent({ role: 'actor', skill: 70, actual: { ...target } })
    const r = resolveReception(
      makeReceptionInputs({
        concept: makeConcept({
          baselineStrength: 50,
          baseNegativeCost: 4_000_000,
          roleRequirements: {
            lead: { target: { ...target }, tolerance: 1.0 },
            antagonist: { target: { ...target }, tolerance: 1.0 },
            support: { target: { ...target }, tolerance: 1.0 },
          } as Record<CastSlot, { target: Persona; tolerance: number }>,
        }),
        writer: makeTalent({ role: 'writer', skill: 50 }),
        director: makeTalent({ role: 'director', skill: 60 }),
        cast: {
          lead: actorAt(),
          antagonist: actorAt(),
          support: actorAt(),
        } as Record<CastSlot, Talent>,
        craftHires: [],
        budget: makeBudget(4_000_000, TUNING.MARKETING_HALF_SATURATION),
        shapeEffects: makeShapeEffects({ craftMod: 0, budgetDemandMultiplier: 1.0 }),
      }),
      seed(),
    )
    expect(r.scriptStrength).toBeCloseTo(50, 6)
    expect(r.directorExecution).toBeCloseTo(60, 6)
    expect(r.castExecution).toBeCloseTo(82, 6)
    expect(r.technical).toBe(40)
    expect(r.budgetAdequacy).toBeCloseTo(86.9565, 3)
    expect(r.craft).toBeCloseTo(61.09565, 3)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §15.5 / §5.2  Slot transform
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.5 slot transform — antagonist negates intimacy only', () => {
  const p: Persona = { warmth: 0.6, gravity: -0.3, physicality: 0.4 }

  it('antagonist contribution = personaToExpression(p) with intimacy negated', () => {
    // personaToExpression -> { intimacy 0.6, tonalWeight -0.3, kineticEnergy 0.4 }
    // antagonist transform multiplies intimacy by -1, others by +1.
    const e = personaToExpression(p)
    expect(castContribution(p, 'antagonist')).toEqual({
      intimacy: -e.intimacy,
      tonalWeight: e.tonalWeight,
      kineticEnergy: e.kineticEnergy,
    })
  })

  it('lead and support contributions are unchanged (identity)', () => {
    const e = personaToExpression(p)
    expect(castContribution(p, 'lead')).toEqual(e)
    expect(castContribution(p, 'support')).toEqual(e)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §15.3 / M12  Neutral stacking
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.3 neutral stacking (M12) — six {0,0,0} contributors', () => {
  it('cohesionContribution <= COHESION_CAP*0.5 and no NaN anywhere', () => {
    // Six zero contributors: all personas zero (personaToExpression -> {0,0,0}),
    // shape expression injected as {0,0,0} (M12 injection license). centroid = 0,
    // magnitude 0 < CENTROID_MIN_MAGNITUDE -> directionalAgreement 0 -> cohesion 0.
    // cohesionContribution = COHESION_CAP * smoothstep(0.35,0.85,0) = COHESION_CAP*0 = 0.
    // 0 <= COHESION_CAP*0.5 (= 8). No division-by-zero produces NaN anywhere.
    const zeroPerson = (role: Talent['role']): Talent =>
      makeTalent({ role, skill: 50, actual: { ...ZERO_PERSONA } })
    const r = resolveReception(
      makeReceptionInputs({
        writer: zeroPerson('writer'),
        director: zeroPerson('director'),
        cast: {
          lead: zeroPerson('actor'),
          antagonist: zeroPerson('actor'),
          support: zeroPerson('actor'),
        } as Record<CastSlot, Talent>,
        shapeEffects: makeShapeEffects({ expression: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 } }),
      }),
      seed(),
    )
    expect(r.cohesionContribution).toBeLessThanOrEqual(TUNING.COHESION_CAP * 0.5)
    // No NaN anywhere in the full pipeline output.
    const flat: number[] = []
    const walk = (v: unknown): void => {
      if (typeof v === 'number') flat.push(v)
      else if (v && typeof v === 'object') Object.values(v).forEach(walk)
    }
    walk(r)
    for (const n of flat) expect(Number.isNaN(n)).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §15.4 / M13  Promise ordering on boxOffice.total
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.4 promise ordering (M13) — precise-met > vague > precise-missed', () => {
  it('boxOffice.total is strictly ordered on the promise alone', () => {
    // Identical concept/cast/crew/shape/negative; marketing = MARKETING_HALF_SATURATION.
    // To center "precise-and-met" on the delivered vector, first observe `delivered`
    // from a run with a wide (neutral) promise — the promise never feeds `delivered`,
    // so delivered is identical across all three promise variants. This is a construction
    // input, not an asserted value.
    const base = {
      concept: makeConcept({ baseNegativeCost: 4_000_000 }),
      writer: makeTalent({ role: 'writer', skill: 60, actual: { warmth: 0.5, gravity: 0.2, physicality: -0.3 } }),
      director: makeTalent({ role: 'director', skill: 60, actual: { warmth: 0.4, gravity: 0.3, physicality: -0.2 } }),
      cast: {
        lead: makeTalent({ role: 'actor', skill: 60, fame: 50, actual: { warmth: 0.6, gravity: 0.1, physicality: -0.1 } }),
        antagonist: makeTalent({ role: 'actor', skill: 60, fame: 50, actual: { warmth: 0.3, gravity: 0.4, physicality: 0.0 } }),
        support: makeTalent({ role: 'actor', skill: 60, fame: 50, actual: { warmth: 0.5, gravity: 0.2, physicality: -0.2 } }),
      } as Record<CastSlot, Talent>,
      craftHires: [],
      budget: makeBudget(4_000_000, TUNING.MARKETING_HALF_SATURATION),
      shapeEffects: makeShapeEffects({ expression: { intimacy: 0.5, tonalWeight: 0.25, kineticEnergy: -0.2 } }),
    }

    const probe = resolveReception(
      makeReceptionInputs({ ...base, promise: promiseCentered([0, 0, 0], 2.0) }),
      seed(),
    )
    const d = probe.delivered
    const centers: [number, number, number] = [d.intimacy, d.tonalWeight, d.kineticEnergy]
    // Displace each center by +1.2 for precise-missed (M13: centers displaced 1.2).
    const displaced: [number, number, number] = [
      centers[0] + 1.2,
      centers[1] + 1.2,
      centers[2] + 1.2,
    ]

    // ReceptionResult exposes `total` at top level (boxOffice nesting is on FilmResult).
    const totalFor = (promise: ReturnType<typeof promiseCentered>) =>
      resolveReception(makeReceptionInputs({ ...base, promise }), seed()).total

    const preciseMet = totalFor(promiseCentered(centers, 0.4))
    const vague = totalFor(promiseCentered(centers, 2.0))
    const preciseMissed = totalFor(promiseCentered(displaced, 0.4))

    // §15.4 strict ordering.
    expect(preciseMet).toBeGreaterThan(vague)
    expect(vague).toBeGreaterThan(preciseMissed)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §4  resolveShape aggregation — one fully hand-computed triple
// ─────────────────────────────────────────────────────────────────────────────
describe('§4 resolveShape — (immediateAction, reversal, triumph) hand-computed', () => {
  const eff = resolveShape({ opening: 'immediateAction', midpoint: 'reversal', ending: 'triumph' })

  it('expression = weightedMean(0.30/0.35/0.35) of the three option vectors', () => {
    // immediateAction (-0.3,0.0,0.8), reversal (0.0,0.3,0.2), triumph (0.6,-0.3,0.3)
    // i: 0.30*-0.3 + 0.35*0.0 + 0.35*0.6 = -0.09 + 0.21 = 0.12
    // t: 0.30*0.0  + 0.35*0.3 + 0.35*-0.3 = 0.105 - 0.105 = 0.0
    // k: 0.30*0.8  + 0.35*0.2 + 0.35*0.3 = 0.24 + 0.07 + 0.105 = 0.415
    expect(eff.expression.intimacy).toBeCloseTo(0.12, 6)
    expect(eff.expression.tonalWeight).toBeCloseTo(0.0, 6)
    expect(eff.expression.kineticEnergy).toBeCloseTo(0.415, 6)
  })

  it('openingReachMod = clamp(12 + 0.5*2 + 0.25*10, -15, 15) = 15 (raw 18.5 clamps)', () => {
    // 12 + 1 + 2.5 = 15.5 -> clamp to 15.
    expect(eff.openingReachMod).toBe(15)
  })

  it('craftMod = clamp(-4 + 3 + -5, -10, 10) = -6', () => {
    expect(eff.craftMod).toBe(-6)
  })

  it('budgetDemandMultiplier = clamp(1.20*1.05*1.00, 0.80, 1.40) = 1.26', () => {
    expect(eff.budgetDemandMultiplier).toBeCloseTo(1.26, 6)
  })

  it('originalityMod = clamp(-5 + 5 + -8, -15, 15) = -8', () => {
    expect(eff.originalityMod).toBe(-8)
  })

  it('segmentAffinity summed then clamped ±12 per segment', () => {
    // youngAdult: +8 (immediateAction). family: +10 (triumph). adult: +4 (reversal).
    // prestige: -6 (immediateAction) + -8 (triumph) = -14 -> clamp to -12.
    expect(eff.segmentAffinity.youngAdult).toBe(8)
    expect(eff.segmentAffinity.family).toBe(10)
    expect(eff.segmentAffinity.adult).toBe(4)
    expect(eff.segmentAffinity.prestige).toBe(-12)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §4  resolveShape clamp stress — construct triples that exceed each bound unclamped
// ─────────────────────────────────────────────────────────────────────────────
describe('§4 resolveShape — five clamps, at stacked triples that would exceed them', () => {
  it('reach clamps to +15 (raw 18.5): immediateAction+escalation+triumph', () => {
    // 12 + 0.5*8 + 0.25*10 = 12 + 4 + 2.5 = 18.5 -> 15.
    const e = resolveShape({ opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' })
    expect(e.openingReachMod).toBe(15)
  })

  it('craftMod clamps to +10 (raw 21): slowSetup+revelation+tragic', () => {
    // 7 + 6 + 8 = 21 -> 10.
    const e = resolveShape({ opening: 'slowSetup', midpoint: 'revelation', ending: 'tragic' })
    expect(e.craftMod).toBe(10)
  })

  it('craftMod clamps to -10 (raw -11): immediateAction+escalation+triumph', () => {
    // -4 + -2 + -5 = -11 -> -10.
    const e = resolveShape({ opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' })
    expect(e.craftMod).toBe(-10)
  })

  it('originalityMod clamps to +15 (raw 23): mysteryHook+revelation+ambiguous', () => {
    // 6 + 7 + 10 = 23 -> 15.
    const e = resolveShape({ opening: 'mysteryHook', midpoint: 'revelation', ending: 'ambiguous' })
    expect(e.originalityMod).toBe(15)
  })

  it('originalityMod clamps to -15 (raw -19): immediateAction+escalation+triumph', () => {
    // -5 + -6 + -8 = -19 -> -15.
    const e = resolveShape({ opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' })
    expect(e.originalityMod).toBe(-15)
  })

  it('segmentAffinity clamps to +12 (raw prestige 25): slowSetup+revelation+tragic', () => {
    // prestige: 9 + 6 + 10 = 25 -> 12.
    const e = resolveShape({ opening: 'slowSetup', midpoint: 'revelation', ending: 'tragic' })
    expect(e.segmentAffinity.prestige).toBe(12)
  })

  it('segmentAffinity clamps to -12 (raw prestige -18): immediateAction+escalation+triumph', () => {
    // prestige: -6 + -4 + -8 = -18 -> -12.
    const e = resolveShape({ opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' })
    expect(e.segmentAffinity.prestige).toBe(-12)
  })

  it('budgetDemandMultiplier stays within [0.80,1.40] across all 36 legal triples', () => {
    // The five bounds M11 lists include the budget clamp. Legal FilmShape enums cannot
    // breach it (natural product range ~[0.812, 1.38] ⊂ [0.80, 1.40]) — see FINDING in
    // the report — so the M11 assertion here is the range over every constructible shape.
    const openings = ['immediateAction', 'slowSetup', 'mysteryHook'] as const
    const mids = ['reversal', 'escalation', 'revelation'] as const
    const ends = ['triumph', 'bittersweet', 'tragic', 'ambiguous'] as const
    for (const o of openings)
      for (const m of mids)
        for (const en of ends) {
          const e = resolveShape({ opening: o, midpoint: m, ending: en })
          expect(e.budgetDemandMultiplier).toBeGreaterThanOrEqual(0.8)
          expect(e.budgetDemandMultiplier).toBeLessThanOrEqual(1.4)
          // and every segment affinity within ±12
          for (const v of Object.values(e.segmentAffinity)) {
            expect(v).toBeGreaterThanOrEqual(-12)
            expect(v).toBeLessThanOrEqual(12)
          }
          expect(e.openingReachMod).toBeGreaterThanOrEqual(-15)
          expect(e.openingReachMod).toBeLessThanOrEqual(15)
        }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §5.6  Determinism + reviewVariance
// ─────────────────────────────────────────────────────────────────────────────
describe('§5.6 determinism and reviewVariance', () => {
  it('reviewVariance === criticScore − criticMean exactly', () => {
    const r = resolveReception(makeReceptionInputs({}), seed())
    expect(r.reviewVariance).toBeCloseTo(r.criticScore - r.criticMean, 9)
  })

  it('identical sim-stream state twice -> identical criticScore (seed-deterministic)', () => {
    const inp = makeReceptionInputs({})
    const a = resolveReception(inp, RngStream.fromSeed('same-stream'))
    const b = resolveReception(inp, RngStream.fromSeed('same-stream'))
    expect(a.criticScore).toBe(b.criticScore)
    expect(a.reviewVariance).toBe(b.reviewVariance)
  })

  it('criticScore is NOT variance-free (§5.6): differs when the stream state differs', () => {
    // A different stream state draws a different gaussian, so criticScore generally
    // differs from criticMean — the sampled term must not be removed (§5.6).
    const inp = makeReceptionInputs({})
    const a = resolveReception(inp, RngStream.fromSeed('stream-A'))
    const b = resolveReception(inp, RngStream.fromSeed('stream-B-different'))
    // criticMean is deterministic (same inputs) so it is identical...
    expect(a.criticMean).toBeCloseTo(b.criticMean, 9)
    // ...but the sampled criticScore is present and applied: at least one of the two
    // draws is off the mean (both exactly on the mean would mean no sampling).
    const offMean = a.criticScore !== a.criticMean || b.criticScore !== b.criticMean
    expect(offMean).toBe(true)
  })
})
