// PHASE-2 test: §5 reception pipeline — M11 bounded-term ranges.
//
// One range assertion per bounded term, at CONSTRUCTED EXTREMES (not just typical
// inputs). Every bound is the contract's stated range (build-contract.md §5 + §16
// TUNING + rev4-open-questions M11). No expected value is copied from src/core.
//
// The sim stream (§5.3 critic gaussian) is seeded; the only sampled term is criticScore,
// so every non-critic term is deterministic and its bound holds on every draw.

import { describe, it, expect } from 'vitest'
import { RngStream, TUNING } from '../src/core/index.js'
import { resolveReception } from '../src/core/reception.js'
import type { ReceptionResult } from '../src/core/reception.js'
import {
  makeBudget,
  makeConcept,
  makeReceptionInputs,
  makeShapeEffects,
  makeTalent,
  promiseCentered,
  req,
  widePromise,
} from './_fixtures.js'
import type { CastSlot, Persona, RoleRequirement, Talent } from '../src/core/index.js'

const rng = () => RngStream.fromSeed('bounds-seed')

// Extreme persona vectors used to push distance/cosine terms to their limits.
const HOT: Persona = { warmth: 1, gravity: 1, physicality: 1 }
const COLD: Persona = { warmth: -1, gravity: -1, physicality: -1 }

function run(over: Parameters<typeof makeReceptionInputs>[0]): ReceptionResult {
  return resolveReception(makeReceptionInputs(over), rng())
}

// Construct a battery of extreme worlds so every bounded term is exercised at both
// ends across the set.
function extremeCases(): ReceptionResult[] {
  const out: ReceptionResult[] = []

  // (a) Everything minimal: zero skills, zero baseline, huge role mismatch, no budget.
  const badReq = (): Record<CastSlot, RoleRequirement> =>
    ({
      lead: req(HOT, 0.5), // tight tolerance, actual COLD -> roleFit 0
      antagonist: req(HOT, 0.5),
      support: req(HOT, 0.5),
    }) as Record<CastSlot, RoleRequirement>
  const cold = (role: Talent['role']): Talent =>
    makeTalent({ role, skill: 20, fame: 0, actual: { ...COLD } })
  out.push(
    run({
      concept: makeConcept({
        baselineStrength: 20,
        originalityRaw: 5,
        roleRequirements: badReq(),
      }),
      writer: cold('writer'),
      director: cold('director'),
      cast: {
        lead: cold('actor'),
        antagonist: cold('actor'),
        support: cold('actor'),
      } as Record<CastSlot, Talent>,
      budget: makeBudget(0, 0),
      shapeEffects: makeShapeEffects({
        craftMod: -10,
        originalityMod: -15,
        openingReachMod: -15,
        budgetDemandMultiplier: 1.4,
        segmentAffinity: { youngAdult: -12, family: -12, adult: -12, prestige: -12 },
      }),
      promise: promiseCentered([0.9, 0.9, 0.9], 0.4), // tight promise the film misses
    }),
  )

  // (b) Everything maximal: max skills, max fame, perfect role fit, over budget.
  const perfectReq = (): Record<CastSlot, RoleRequirement> =>
    ({
      lead: req(HOT, 3.0),
      antagonist: req(HOT, 3.0),
      support: req(HOT, 3.0),
    }) as Record<CastSlot, RoleRequirement>
  const hot = (role: Talent['role']): Talent =>
    makeTalent({ role, skill: 95, fame: 95, actual: { ...HOT } })
  out.push(
    run({
      concept: makeConcept({
        baselineStrength: 95,
        originalityRaw: 100,
        roleRequirements: perfectReq(),
      }),
      writer: hot('writer'),
      director: hot('director'),
      cast: {
        lead: hot('actor'),
        antagonist: hot('actor'),
        support: hot('actor'),
      } as Record<CastSlot, Talent>,
      craftHires: [makeTalent({ role: 'craft', skill: 95 })],
      budget: makeBudget(100_000_000, 5_000_000), // way over required -> adequacy clamps at 100
      shapeEffects: makeShapeEffects({
        craftMod: 10,
        originalityMod: 15,
        openingReachMod: 15,
        budgetDemandMultiplier: 0.8,
        segmentAffinity: { youngAdult: 12, family: 12, adult: 12, prestige: 12 },
        expression: { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 },
      }),
      promise: widePromise(),
    }),
  )

  // (c) Mixed / typical to catch mid-range values landing in-band.
  out.push(run({}))

  // (d) craft hires with wildly different skills -> technical is a mean, in [0,100].
  out.push(
    run({
      craftHires: [
        makeTalent({ role: 'craft', skill: 0 }),
        makeTalent({ role: 'craft', skill: 100 }),
      ],
    }),
  )

  return out
}

const CASES = extremeCases()

function forEachCase(fn: (r: ReceptionResult) => void) {
  for (const r of CASES) fn(r)
}

describe('§5.1 craft-input bounds [0..100]', () => {
  it('scriptStrength in [0,100]', () =>
    forEachCase((r) => {
      // 0.60*baselineStrength + 0.40*writer.skill, both in [0,100] -> in [0,100].
      expect(r.scriptStrength).toBeGreaterThanOrEqual(0)
      expect(r.scriptStrength).toBeLessThanOrEqual(100)
    }))

  it('directorExecution in [0,100]', () =>
    forEachCase((r) => {
      expect(r.directorExecution).toBeGreaterThanOrEqual(0)
      expect(r.directorExecution).toBeLessThanOrEqual(100)
    }))

  it('castExecution in [0,100]', () =>
    forEachCase((r) => {
      expect(r.castExecution).toBeGreaterThanOrEqual(0)
      expect(r.castExecution).toBeLessThanOrEqual(100)
    }))

  it('technical in [0,100]', () =>
    forEachCase((r) => {
      expect(r.technical).toBeGreaterThanOrEqual(0)
      expect(r.technical).toBeLessThanOrEqual(100)
    }))

  it('budgetAdequacy in [0,100]', () =>
    forEachCase((r) => {
      expect(r.budgetAdequacy).toBeGreaterThanOrEqual(0)
      expect(r.budgetAdequacy).toBeLessThanOrEqual(100)
    }))

  it('craft in [0,100] (explicitly clamped in §5.1)', () =>
    forEachCase((r) => {
      expect(r.craft).toBeGreaterThanOrEqual(0)
      expect(r.craft).toBeLessThanOrEqual(100)
    }))
})

describe('§5.1 roleFit [0,1] at constructed extremes', () => {
  it('roleFit is 0 when the mismatch exceeds tolerance and 1 when perfect', () => {
    // actual COLD vs target HOT, tolerance 0.5: distance sqrt(12)/0.5 >> 1 -> clamp -> roleFit 0.
    // actual HOT vs target HOT: distance 0 -> roleFit 1.
    // We can only observe roleFit's effect via castExecution, so check the two bounding
    // worlds land at the arithmetic bounds of castExecution for uniform skill.
    // Uniform skill 40, all roleFit=1 -> castExecution = 0.6*40 + 0.4*100 = 64.
    const perfect = run({
      concept: makeConcept({
        roleRequirements: {
          lead: req(HOT, 3.0),
          antagonist: req(HOT, 3.0),
          support: req(HOT, 3.0),
        } as Record<CastSlot, RoleRequirement>,
      }),
      cast: {
        lead: makeTalent({ role: 'actor', skill: 40, actual: { ...HOT } }),
        antagonist: makeTalent({ role: 'actor', skill: 40, actual: { ...HOT } }),
        support: makeTalent({ role: 'actor', skill: 40, actual: { ...HOT } }),
      } as Record<CastSlot, Talent>,
    })
    expect(perfect.castExecution).toBeCloseTo(64, 6)
    // Uniform skill 40, all roleFit=0 -> castExecution = 0.6*40 + 0 = 24.
    const missed = run({
      concept: makeConcept({
        roleRequirements: {
          lead: req(HOT, 0.5),
          antagonist: req(HOT, 0.5),
          support: req(HOT, 0.5),
        } as Record<CastSlot, RoleRequirement>,
      }),
      cast: {
        lead: makeTalent({ role: 'actor', skill: 40, actual: { ...COLD } }),
        antagonist: makeTalent({ role: 'actor', skill: 40, actual: { ...COLD } }),
        support: makeTalent({ role: 'actor', skill: 40, actual: { ...COLD } }),
      } as Record<CastSlot, Talent>,
    })
    expect(missed.castExecution).toBeCloseTo(24, 6)
  })
})

describe('§5.2 contribution / cohesion bounds', () => {
  it('directionalAgreement in [-1,1]', () =>
    forEachCase((r) => {
      expect(r.directionalAgreement).toBeGreaterThanOrEqual(-1)
      expect(r.directionalAgreement).toBeLessThanOrEqual(1)
    }))

  it('expressiveStrength in [0,1]', () =>
    forEachCase((r) => {
      expect(r.expressiveStrength).toBeGreaterThanOrEqual(0)
      expect(r.expressiveStrength).toBeLessThanOrEqual(1)
    }))

  it('cohesion in [0,1]', () =>
    forEachCase((r) => {
      expect(r.cohesion).toBeGreaterThanOrEqual(0)
      expect(r.cohesion).toBeLessThanOrEqual(1)
    }))
})

describe('§5.3 critic-side bounds', () => {
  it('forceAlignment in [-1,1]', () =>
    forEachCase((r) => {
      expect(r.forceAlignment).toBeGreaterThanOrEqual(-1)
      expect(r.forceAlignment).toBeLessThanOrEqual(1)
    }))

  it('originalityRaw (effective) in [0,100]', () =>
    forEachCase((r) => {
      // clamp(concept.originalityRaw + shapeEffects.originalityMod, 0, 100)
      expect(r.originalityRaw).toBeGreaterThanOrEqual(0)
      expect(r.originalityRaw).toBeLessThanOrEqual(100)
    }))

  it('cohesionContribution in [0, COHESION_CAP]', () =>
    forEachCase((r) => {
      expect(r.cohesionContribution).toBeGreaterThanOrEqual(0)
      expect(r.cohesionContribution).toBeLessThanOrEqual(TUNING.COHESION_CAP)
    }))

  it('originalityContribution in [-DERIVATIVENESS_MAX_PENALTY, +ORIGINALITY_MAX_BONUS]', () =>
    forEachCase((r) => {
      expect(r.originalityContribution).toBeGreaterThanOrEqual(-TUNING.DERIVATIVENESS_MAX_PENALTY)
      expect(r.originalityContribution).toBeLessThanOrEqual(TUNING.ORIGINALITY_MAX_BONUS)
    }))

  it('timelinessContribution in [-10, +10]', () =>
    forEachCase((r) => {
      expect(r.timelinessContribution).toBeGreaterThanOrEqual(-10)
      expect(r.timelinessContribution).toBeLessThanOrEqual(10)
    }))

  it('criticSigma in [CRITIC_SIGMA_BASE, CRITIC_SIGMA_BASE+3]', () =>
    forEachCase((r) => {
      // criticSigma = CRITIC_SIGMA_BASE + (1 - cohesion)*3, cohesion in [0,1].
      expect(r.criticSigma).toBeGreaterThanOrEqual(TUNING.CRITIC_SIGMA_BASE)
      expect(r.criticSigma).toBeLessThanOrEqual(TUNING.CRITIC_SIGMA_BASE + 3)
    }))

  it('criticScore in [0,100] (explicitly clamped)', () =>
    forEachCase((r) => {
      expect(r.criticScore).toBeGreaterThanOrEqual(0)
      expect(r.criticScore).toBeLessThanOrEqual(100)
    }))
})

describe('§5.4 segment-appeal bounds', () => {
  it('promiseMismatch in [0,1]', () =>
    forEachCase((r) => {
      expect(r.promiseMismatch).toBeGreaterThanOrEqual(0)
      expect(r.promiseMismatch).toBeLessThanOrEqual(1)
    }))

  it('mismatchPenalty in [0, PROMISE_PENALTY_MAX]', () =>
    forEachCase((r) => {
      // specificity in [0,1] * promiseMismatch in [0,1] * PROMISE_PENALTY_MAX.
      expect(r.mismatchPenalty).toBeGreaterThanOrEqual(0)
      expect(r.mismatchPenalty).toBeLessThanOrEqual(TUNING.PROMISE_PENALTY_MAX)
    }))

  it('starDraw in [0,100]', () =>
    forEachCase((r) => {
      expect(r.starDraw).toBeGreaterThanOrEqual(0)
      expect(r.starDraw).toBeLessThanOrEqual(100)
    }))

  it('segmentFit in [0,100] for every segment', () =>
    forEachCase((r) => {
      for (const s of Object.values(r.segmentFit)) {
        expect(s).toBeGreaterThanOrEqual(0)
        expect(s).toBeLessThanOrEqual(100)
      }
    }))

  it('segmentAppeal in [0,100] for every segment', () =>
    forEachCase((r) => {
      for (const s of Object.values(r.segmentAppeal)) {
        expect(s).toBeGreaterThanOrEqual(0)
        expect(s).toBeLessThanOrEqual(100)
      }
    }))
})

describe('§5.5 box-office factor bounds', () => {
  it('marketingQuality in [0,1]', () =>
    forEachCase((r) => {
      expect(r.marketingQuality).toBeGreaterThanOrEqual(0)
      expect(r.marketingQuality).toBeLessThanOrEqual(1)
    }))

  it('baseAwareness in [0,1]', () =>
    forEachCase((r) => {
      expect(r.baseAwareness).toBeGreaterThanOrEqual(0)
      expect(r.baseAwareness).toBeLessThanOrEqual(1)
    }))

  it('awarenessFactor in [0,1]', () =>
    forEachCase((r) => {
      expect(r.awarenessFactor).toBeGreaterThanOrEqual(0)
      expect(r.awarenessFactor).toBeLessThanOrEqual(1)
    }))

  it('openingReachMult in [0.85, 1.15]', () =>
    forEachCase((r) => {
      // 1 + shapeEffects.openingReachMod/100, openingReachMod clamped [-15,+15].
      expect(r.openingReachMult).toBeGreaterThanOrEqual(0.85)
      expect(r.openingReachMult).toBeLessThanOrEqual(1.15)
    }))

  it('legs in [LEGS_MIN, LEGS_MAX]', () =>
    forEachCase((r) => {
      // LEGS_MIN + (LEGS_MAX-LEGS_MIN)*(weightedAudienceScore/100), score in [0,100].
      expect(r.legs).toBeGreaterThanOrEqual(TUNING.LEGS_MIN)
      expect(r.legs).toBeLessThanOrEqual(TUNING.LEGS_MAX)
    }))
})

describe('§2.1 distance bound propagates: segmentFit uses distance/sqrt(12) in [0,1]', () => {
  it('a film maximally distant from a segment taste scores segmentFit >= 0', () => {
    // segmentFit = 100*(1 - clamp(distance/sqrt(12),0,1)); the clamp guarantees >= 0
    // even for the maximal-distance construction. Covered structurally by the extreme
    // COLD-everything case above; assert the floor holds there.
    const coldWorld = CASES[0]
    for (const v of Object.values(coldWorld.segmentFit)) {
      expect(v).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('M11 technical special value (D-4): pinned at 40 with no craft hires', () => {
  it('technical === 40 exactly when craftHires is empty', () => {
    const r = run({ craftHires: [] })
    expect(r.technical).toBe(40)
  })
})
