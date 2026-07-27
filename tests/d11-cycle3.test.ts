// ── D-11.C cycle-3 corrections — INDEPENDENT acceptance tests ────────────────
// Every expectation is hand-derived from ruling D-11.C (docs/rev4-open-questions.md):
//   PART 1 — Balanced Creator SPECIALIZATION: a professional skill FLOOR, archetype-shaped
//     baselines, a fixed 40-point allocation, potential/work-ethic as a SEPARATE tradeoff,
//     OVR DERIVED (never an input), and PERCENTILE calibration (a Balanced person is a
//     prospect, not a star). The engine is the sole validator (throws on invalid input).
//   PART 2 — Newspaper release derivation: pure, deterministic, keyed to the recorded
//     numbers; every headline branch is reachable and never contradicts the figures.
// Imports ONLY the public core surface. Seeded RNG only.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  generateWorld,
  roleOVR,
  SKILL_ORDER,
  TUNING,
  previewBalancedTalent,
  balancedBoostDiscipline,
  BALANCED_ARCHETYPES,
  buildNewspaper,
  criticStars,
  audienceTier,
  aggregateAudienceScore,
  NEWSPAPER_MASTHEAD,
} from '../src/core/index.js'
import type {
  GameState,
  BalancedTalentInput,
  CreativeRole,
  Discipline,
  FilmResult,
  SegmentId,
  Talent,
} from '../src/core/index.js'

// A full per-segment record (buildNewspaper / aggregateAudienceScore type their inputs as
// Record<SegmentId, number>, so every segment key must be present). Only 'adult' carries
// weight/score here; the rest are zero, so the aggregate reduces to the adult figure.
const seg = (adult: number): Record<SegmentId, number> => ({ adult, youngAdult: 0, family: 0, prestige: 0 })
const SHARES: Record<SegmentId, number> = { adult: 1, youngAdult: 0, family: 0, prestige: 0 }

// ── helpers ──────────────────────────────────────────────────────────────────

const roleFor: Record<Discipline, CreativeRole> = {
  acting: 'actor',
  writing: 'writer',
  directing: 'director',
  craft: 'craft',
}

function baseInput(over: Partial<BalancedTalentInput> = {}): BalancedTalentInput {
  return {
    name: 'Prospect',
    role: 'actor',
    age: 24,
    actual: { warmth: 0, gravity: 0, physicality: 0 },
    presetId: 'balancedActingProspect',
    potentialTier: 'Promising',
    workEthic: 60,
    allocation: {},
    ...over,
  }
}

function createdTalent(state: GameState, input: BalancedTalentInput): Talent {
  const next = applyActions(state, [{ kind: 'createBalancedTalent', talent: input }])
  const t = next.talent.find((x) => x.name === input.name && x.authored)
  if (!t) throw new Error('created talent not found in pool')
  return t
}

function allSkills(t: Talent): number[] {
  const out: number[] = []
  for (const d of Object.keys(SKILL_ORDER) as Discipline[]) {
    for (const k of SKILL_ORDER[d]) out.push(t.skills[d][k]!.actual)
  }
  return out
}

// ═══ PART 1 — Balanced specialization engine ════════════════════════════════

describe('D-11.C PART 1: a Balanced prospect is a valid, unsigned, authored talent', () => {
  it('createBalancedTalent adds exactly one authored actor with perceived===actual and a derived skill', () => {
    const state = generateWorld('c3e-valid')
    const before = state.talent.length
    const contractsBefore = state.contracts.length
    const next = applyActions(state, [{ kind: 'createBalancedTalent', talent: baseInput({ name: 'Ada Novak' }) }])
    expect(next.talent.length).toBe(before + 1)
    const t = next.talent.find((x) => x.name === 'Ada Novak')!
    expect(t.role).toBe('actor')
    expect(t.authored).toBe(true)
    expect(t.perceived).toEqual(t.actual)
    expect(Number.isInteger(t.skill)).toBe(true)
    expect(t.skill).toBe(roleOVR(t, 'acting'))
    // Creating never SIGNS: no contract added, none references the prospect.
    expect(next.contracts.length).toBe(contractsBefore)
    expect(next.contracts.some((c) => c.talentId === t.id)).toBe(false)
  })
})

describe('D-11.C PART 1 (C1): the professional skill FLOOR holds for every preset', () => {
  it('no skill of any archetype preview drops below BALANCED_CREATOR_SKILL_FLOOR', () => {
    for (const preset of BALANCED_ARCHETYPES) {
      const role = preset.appliesTo === 'any' ? 'actor' : roleFor[preset.appliesTo]
      const t = previewBalancedTalent(baseInput({ role, presetId: preset.id }), 'c3e-floor')
      for (const v of allSkills(t)) {
        expect(v).toBeGreaterThanOrEqual(TUNING.BALANCED_CREATOR_SKILL_FLOOR)
      }
    }
  })
})

describe('D-11.C PART 1 (C2): the 40-point specialization budget is enforced by the engine', () => {
  it('an allocation totalling exactly the budget is accepted', () => {
    const state = generateWorld('c3e-budget-ok')
    const B = TUNING.BALANCED_CREATOR_SPECIALIZATION_POINTS
    const input = baseInput({ name: 'AtBudget', allocation: { skills: { acting: [B, 0, 0, 0, 0, 0] } } })
    expect(() => applyActions(state, [{ kind: 'createBalancedTalent', talent: input }])).not.toThrow()
  })

  it('an allocation ONE point over the budget is REJECTED (thrown as data)', () => {
    const state = generateWorld('c3e-budget-over')
    const B = TUNING.BALANCED_CREATOR_SPECIALIZATION_POINTS
    const input = baseInput({ name: 'OverBudget', allocation: { skills: { acting: [B + 1, 0, 0, 0, 0, 0] } } })
    expect(() => applyActions(state, [{ kind: 'createBalancedTalent', talent: input }])).toThrow(/exceeds .* specialization points/i)
  })

  it('a negative or non-integer increment is rejected', () => {
    const state = generateWorld('c3e-badalloc')
    const neg = baseInput({ name: 'Neg', allocation: { skills: { acting: [-2, 0, 0, 0, 0, 0] } } })
    expect(() => applyActions(state, [{ kind: 'createBalancedTalent', talent: neg }])).toThrow(/non-negative integer/i)
    const frac = baseInput({ name: 'Frac', allocation: { skills: { acting: [1.5, 0, 0, 0, 0, 0] } } })
    expect(() => applyActions(state, [{ kind: 'createBalancedTalent', talent: frac }])).toThrow(/non-negative integer/i)
  })
})

describe('D-11.C PART 1: OVR is DERIVED — points are not OVR one-for-one', () => {
  it('spending the whole budget on ONE skill raises OVR far less than the points spent', () => {
    const B = TUNING.BALANCED_CREATOR_SPECIALIZATION_POINTS
    const base = previewBalancedTalent(baseInput(), 'c3e-derive')
    const spiked = previewBalancedTalent(
      baseInput({ allocation: { skills: { acting: [B, 0, 0, 0, 0, 0] } } }),
      'c3e-derive',
    )
    const gain = roleOVR(spiked, 'acting') - roleOVR(base, 'acting')
    expect(gain).toBeGreaterThan(0)
    expect(gain).toBeLessThan(B) // a lopsided spike moves OVR much less than +40
  })
})

describe('D-11.C PART 1: potential/work-ethic are a SEPARATE tradeoff, not bought with points', () => {
  it('changing work ethic changes workEthic but not the derived current skill', () => {
    const lo = previewBalancedTalent(baseInput({ workEthic: 20 }), 'c3e-we')
    const hi = previewBalancedTalent(baseInput({ workEthic: 90 }), 'c3e-we')
    expect(lo.workEthic).toBe(20)
    expect(hi.workEthic).toBe(90)
    expect(roleOVR(hi, 'acting')).toBe(roleOVR(lo, 'acting')) // WE affects growth, not current ability
  })

  it('changing potential tier changes the hidden ceiling but not the current skill', () => {
    const low = previewBalancedTalent(baseInput({ potentialTier: 'Limited' }), 'c3e-tier')
    const high = previewBalancedTalent(baseInput({ potentialTier: 'GenerationalUpside' }), 'c3e-tier')
    expect(roleOVR(high, 'acting')).toBe(roleOVR(low, 'acting')) // same current OVR
    // The primary ceiling band rises with the tier.
    const ceilMean = (t: Talent) => {
      const keys = SKILL_ORDER.acting
      return keys.reduce((a, k) => a + t.ceilings.acting[k]!, 0) / keys.length
    }
    expect(ceilMean(high)).toBeGreaterThan(ceilMean(low))
  })
})

describe('D-11.C PART 1: preview matches commit, and construction is deterministic', () => {
  it('previewBalancedTalent equals the pooled talent (same seed) except for id', () => {
    const state = generateWorld('c3e-preview')
    const input = baseInput({ name: 'Mirror', allocation: { skills: { acting: [3, 3, 2, 0, 0, 0] } } })
    const committed = createdTalent(state, input)
    const preview = previewBalancedTalent(input, state.seed)
    expect(roleOVR(preview, 'acting')).toBe(roleOVR(committed, 'acting'))
    expect(allSkills(preview)).toEqual(allSkills(committed))
    expect(preview.salary).toBe(committed.salary)
  })

  it('two identical creations on the same seed produce byte-identical talent', () => {
    const input = baseInput({ name: 'Twin', allocation: { skills: { acting: [5, 4, 0, 0, 0, 0] } } })
    const a = createdTalent(generateWorld('c3e-det'), input)
    const b = createdTalent(generateWorld('c3e-det'), input)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})

describe('D-11.C PART 1: invalid Balanced input is rejected loudly (engine is the sole authority)', () => {
  it('empty name, bad role, out-of-range age/workEthic, and unknown preset all throw', () => {
    const state = generateWorld('c3e-invalid')
    const run = (input: BalancedTalentInput) => () => applyActions(state, [{ kind: 'createBalancedTalent', talent: input }])
    expect(run(baseInput({ name: '   ' }))).toThrow(/non-empty name/i)
    expect(run(baseInput({ role: 'gaffer' as CreativeRole }))).toThrow(/not a valid CreativeRole/i)
    expect(run(baseInput({ age: 5 }))).toThrow(/age .* out of range/i)
    expect(run(baseInput({ workEthic: 200 }))).toThrow(/workEthic .* out of range/i)
    expect(run(baseInput({ presetId: 'nope' }))).toThrow(/unknown presetId/i)
  })
})

describe('D-11.C PART 1 (C6): PERCENTILE calibration — a Balanced default is a lower-middle prospect', () => {
  it('the default focused actor lands well below the top decile of the generated acting population', () => {
    // Build the primary benchmark: every generated actor's primary (acting) OVR across
    // several worlds — the working-age, signable, matching-profession population.
    const pop: number[] = []
    for (let i = 0; i < 20; i++) {
      const w = generateWorld(`c3e-pop-${i}`)
      for (const t of w.talent) if (t.role === 'actor') pop.push(roleOVR(t, 'acting'))
    }
    pop.sort((a, b) => a - b)
    const percentileOf = (v: number) => (pop.filter((x) => x < v).length / pop.length) * 100

    const preview = previewBalancedTalent(baseInput(), 'c3e-calib')
    const ovr = roleOVR(preview, 'acting')
    const pct = percentileOf(ovr)
    // Controlling target: pre-spec ≈ 30–50th; assert a tolerant band that still guards the
    // rule (not a floor-scraper, and NOT a star — comfortably below the top decile).
    expect(pct).toBeGreaterThan(10)
    expect(pct).toBeLessThan(75)
  })
})

describe('D-11.C PART 1: multi-hyphenate boost lands on a genuinely SECONDARY discipline', () => {
  it('balancedBoostDiscipline remaps a boost colliding with the primary onto an adjacent discipline', () => {
    const mh = BALANCED_ARCHETYPES.find((p) => p.id === 'multiHyphenateProspect')!
    // The preset boosts a "director"; for a director primary that collides, so it must
    // remap to a DIFFERENT discipline; for an actor primary it stays on directing.
    expect(balancedBoostDiscipline(mh, 'directing')).not.toBe('directing')
    expect(balancedBoostDiscipline(mh, 'directing')).toBe('writing')
    expect(balancedBoostDiscipline(mh, 'acting')).toBe('directing')
    // A focused preset (no secondary boost) yields null.
    const focused = BALANCED_ARCHETYPES.find((p) => p.id === 'comedyProspect')!
    expect(balancedBoostDiscipline(focused, 'acting')).toBeNull()
  })

  it('a DIRECTOR multi-hyphenate is boosted in the remapped discipline (writing), not just baseline', () => {
    const mh = previewBalancedTalent(baseInput({ role: 'director', presetId: 'multiHyphenateProspect' }), 'c3e-mh')
    const focused = previewBalancedTalent(baseInput({ role: 'director', presetId: 'balancedDirectingProspect' }), 'c3e-mh')
    // The multi-hyphenate's SECONDARY (writing) OVR sits meaningfully above a focused
    // director's writing OVR — the boost genuinely landed on the remapped discipline.
    expect(roleOVR(mh, 'writing')).toBeGreaterThan(roleOVR(focused, 'writing'))
  })
})

// ═══ PART 2 — Newspaper derivation ═══════════════════════════════════════════

describe('D-11.C PART 2: criticStars maps 0–100 → 0–5 half-steps, clamped', () => {
  it.each([
    [0, 0],
    [10, 0.5],
    [30, 1.5],
    [49, 2.5],
    [50, 2.5],
    [100, 5],
    [-20, 0],
    [140, 5],
  ])('criticStars(%i) === %f', (score, stars) => {
    expect(criticStars(score)).toBe(stars)
  })
})

describe('D-11.C PART 2: audienceTier thresholds are exact', () => {
  it.each([
    [0, 'hated'],
    [29, 'hated'],
    [30, 'disliked'],
    [44, 'disliked'],
    [45, 'divided'],
    [56, 'divided'],
    [57, 'liked'],
    [71, 'liked'],
    [72, 'loved'],
    [100, 'loved'],
  ])('audienceTier(%i) === %s', (score, tier) => {
    expect(audienceTier(score)).toBe(tier)
  })
})

describe('D-11.C PART 2: aggregateAudienceScore is a share-weighted mean', () => {
  it('weights segment scores by share and falls back to a plain mean when shares are absent', () => {
    // 80 @ share .25 and 40 @ share .75 → 50 (family/prestige carry zero share).
    const scores: Record<SegmentId, number> = { adult: 80, youngAdult: 40, family: 0, prestige: 0 }
    const shares: Record<SegmentId, number> = { adult: 0.25, youngAdult: 0.75, family: 0, prestige: 0 }
    expect(aggregateAudienceScore(scores, shares)).toBeCloseTo(50, 6)
    // All shares zero → plain mean of the four segment scores ((60+40+50+50)/4 = 50).
    const flat: Record<SegmentId, number> = { adult: 60, youngAdult: 40, family: 50, prestige: 50 }
    const noShares: Record<SegmentId, number> = { adult: 0, youngAdult: 0, family: 0, prestige: 0 }
    expect(aggregateAudienceScore(flat, noShares)).toBeCloseTo(50, 6)
  })
})

// A minimal FilmResult carrying only the fields buildNewspaper reads. Cast through unknown
// so the test stays decoupled from unrelated FilmResult fields.
type Over = {
  criticScore?: number
  audience?: number
  total?: number
  cost?: number
  expectedCritic?: number
  expectedTotal?: number
  cohesion?: number
  participants?: unknown
}
function mkFilm(o: Over = {}): FilmResult {
  const mkP = (name: string, role: string, discipline: string, fit: number) => ({
    talentId: `t-${name}`,
    name,
    role,
    discipline,
    greenlightOVR: 50,
    greenlightFit: fit,
    greenlightEP: { low: 40, high: 70, expected: 55 },
    freelancer: false,
  })
  const participants =
    o.participants ??
    {
      writer: mkP('Writer', 'writer', 'writing', 50),
      director: mkP('Director', 'director', 'directing', 50),
      cast: {
        lead: mkP('Lead', 'lead', 'acting', 50),
        antagonist: mkP('Antag', 'antagonist', 'acting', 50),
        support: mkP('Support', 'support', 'acting', 50),
      },
      craft: [mkP('Craft', 'craft', 'craft', 50)],
    }
  return {
    productionId: 'p1',
    conceptId: 'c1',
    releaseTick: 8,
    criticScore: o.criticScore ?? 50,
    segmentScores: seg(o.audience ?? 50),
    boxOffice: { opening: (o.total ?? 10_000_000) / 2, total: o.total ?? 10_000_000 },
    cohesion: o.cohesion ?? 0.5,
    forecast: {
      expectedCriticScore: o.expectedCritic ?? 50,
      expectedTotal: o.expectedTotal ?? (o.total ?? 10_000_000),
      expectedOpening: (o.expectedTotal ?? (o.total ?? 10_000_000)) / 2,
    },
    participants,
  } as unknown as FilmResult
}
const view = (o: Over, cost: number, title = 'Test Film') =>
  buildNewspaper({ film: mkFilm({ ...o, cost }), conceptTitle: title, committedCost: cost, segmentShares: SHARES })!

describe('D-11.C PART 2: buildNewspaper is pure, guarded, and financially consistent', () => {
  it('returns null for a film with no immutable participant record', () => {
    const legacy = { ...mkFilm(), participants: undefined } as unknown as FilmResult
    expect(buildNewspaper({ film: legacy, conceptTitle: 'X', committedCost: 1, segmentShares: SHARES })).toBeNull()
  })

  it('is deterministic — same input yields a deep-equal view', () => {
    const a = view({ criticScore: 62, audience: 55, total: 12_000_000 }, 5_000_000)
    const b = view({ criticScore: 62, audience: 55, total: 12_000_000 }, 5_000_000)
    expect(a).toEqual(b)
  })

  it('masthead is the fixed paper; stars and audience tier match the pure derivations', () => {
    const v = view({ criticScore: 62, audience: 66, total: 12_000_000 }, 5_000_000)
    expect(v.masthead).toBe(NEWSPAPER_MASTHEAD)
    expect(v.critic.stars).toBe(criticStars(62))
    expect(v.audience.tier).toBe(audienceTier(aggregateAudienceScore(seg(66), SHARES)))
  })

  it('profit sign and label follow box office minus committed cost', () => {
    const profit = view({ total: 20_000_000 }, 5_000_000)
    expect(profit.financial.profit).toBe(15_000_000)
    expect(profit.financial.label).toBe('Profit')
    const loss = view({ total: 2_000_000 }, 8_000_000)
    expect(loss.financial.profit).toBe(-6_000_000)
    expect(loss.financial.label).toBe('Loss')
  })

  it('the week comes from the input when supplied, else the release tick', () => {
    const withWeek = buildNewspaper({ film: mkFilm(), conceptTitle: 'X', committedCost: 1, segmentShares: SHARES, week: 42 })!
    expect(withWeek.week).toBe(42)
    const noWeek = view({}, 1)
    expect(noWeek.week).toBe(8) // releaseTick
  })
})

describe('D-11.C PART 2: every headline branch is reachable and never contradicts the numbers', () => {
  it('critics love it, audiences reject it', () => {
    const v = view({ criticScore: 82, audience: 20, total: 6_000_000 }, 4_000_000)
    expect(v.headline).toContain('CRITICS ADORE')
    expect(v.headline).toContain('AUDIENCES STAY AWAY')
  })

  it('critics pan it, audiences pack theaters', () => {
    const v = view({ criticScore: 20, audience: 82, total: 6_000_000 }, 4_000_000)
    expect(v.headline).toContain('CRITICS PAN')
    expect(v.headline).toContain('PACK THEATERS')
  })

  it('surprise hit — profitable and beat the box-office forecast', () => {
    const v = view({ criticScore: 50, audience: 50, total: 30_000_000, expectedTotal: 10_000_000 }, 5_000_000)
    expect(v.headline).toContain('SURPRISE HIT')
  })

  it('smash — strong critics, strong audience, big profit (forecast met, not beaten)', () => {
    const v = view({ criticScore: 82, audience: 82, total: 20_000_000, expectedTotal: 20_000_000 }, 5_000_000)
    expect(v.headline).toContain('IS A SMASH')
  })

  it('expensive flop — lost money, poor reception, under its cost', () => {
    const v = view({ criticScore: 20, audience: 20, total: 2_000_000, expectedTotal: 2_000_000 }, 10_000_000)
    expect(v.headline).toContain('EXPENSIVE')
    expect(v.headline).toContain('FAILS TO FIND ITS AUDIENCE')
  })

  it('below expectations — under the box-office forecast', () => {
    const v = view({ criticScore: 50, audience: 50, total: 5_000_000, expectedTotal: 20_000_000 }, 3_000_000)
    expect(v.headline).toContain('OPENS BELOW EXPECTATIONS')
  })

  it('warm reception — profitable and well-reviewed, forecast met', () => {
    const v = view({ criticScore: 78, audience: 50, total: 12_000_000, expectedTotal: 12_000_000 }, 5_000_000)
    expect(v.headline).toContain('WARM RECEPTION')
  })

  it('mixed reception — the unremarkable fallback', () => {
    const v = view({ criticScore: 50, audience: 50, total: 10_000_000, expectedTotal: 10_000_000 }, 8_000_000)
    expect(v.headline).toContain('MIXED RECEPTION')
  })

  it('2–3 truthful callouts are produced, drawn from the recorded mechanics', () => {
    const v = view({ criticScore: 82, audience: 20, total: 6_000_000, cohesion: 0.3 }, 4_000_000)
    expect(v.callouts.length).toBeGreaterThanOrEqual(2)
    expect(v.callouts.length).toBeLessThanOrEqual(3)
  })
})
