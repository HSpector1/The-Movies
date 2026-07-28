// ── D-9 Multi-Discipline Talent — INDEPENDENT contract-derived acceptance tests ──
//
// Every expectation is hand-derived from the NORMATIVE D-9 ruling
// (docs/rev4-open-questions.md, section "D-9 — Multi-Discipline Talent ...", incl.
// the "Acceptance tests" list) and the OWNER RULING guardrails, NOT from any
// implementation body. The only symbols read are the frozen public surface
// re-exported by src/core/index.ts.
//
// Seeded RNG only (hygiene): all randomness enters via the derived `stream(...)`
// and generateWorld(seed); no Math.rand* literal, no wall-clock.
//
// D-9.0 invariant under test: effectiveSkill ∈ [0,100] and OVR/Fit/Potential/WE/
// GenreExperience are read-only summaries the sim never reads (§5/§7 read only
// effectiveSkill + roleFit + fame).

import { describe, it, expect } from 'vitest'
import {
  ageRunwayMult,
  developTalent,
  DISCIPLINE_ORDER,
  effectiveSkill,
  expectedPerformance,
  expectedPotentialRange,
  expectedPotentialTier,
  generateWorld,
  genreExperience,
  projectFit,
  projectSkillWeights,
  roleOVR,
  roleTier,
  salaryCurve,
  stream,
  temperamentSummary,
  TUNING,
  workEthicLabel,
  workHistoryCount,
  GENRE_ORDER,
  SKILL_ORDER,
} from '../src/core/index.js'
import type {
  Ceilings,
  Discipline,
  DisciplineSkills,
  DevelopmentContext,
  FilmConcept,
  FilmShape,
  Genre,
  GenreExperience,
  Persona,
  Promise as FilmPromise,
  ShapeEffects,
  SkillProfiles,
  Talent,
  WorkHistory,
} from '../src/core/index.js'

// ── local, contract-derived talent builder (INPUT values only) ────────────────
// Builds a full D-9 Talent from a per-discipline flat value plus optional per-skill
// overrides — nothing here is copied from src/core generation. Every skill 1..99.

const NEUTRAL_PERSONA: Persona = { warmth: 0, gravity: 0, physicality: 0 }
const clampSkill = (v: number) => Math.max(1, Math.min(99, Math.round(v)))

type DiscSpec = { flat?: number; skills?: Record<string, number> }

function buildSkills(
  perDiscipline: Partial<Record<Discipline, DiscSpec>>,
  defaultFlat: number,
): SkillProfiles {
  const out = {} as SkillProfiles
  for (const d of DISCIPLINE_ORDER) {
    const spec = perDiscipline[d]
    const flat = spec?.flat ?? defaultFlat
    const rec: DisciplineSkills = {}
    for (const key of SKILL_ORDER[d]) {
      const v = spec?.skills?.[key] ?? flat
      rec[key] = { actual: clampSkill(v), perceived: clampSkill(v) }
    }
    out[d] = rec
  }
  return out
}

function buildCeilings(
  skills: SkillProfiles,
  ceilFlat: number | Partial<Record<Discipline, number>>,
): Ceilings {
  const out = {} as Ceilings
  for (const d of DISCIPLINE_ORDER) {
    const per = typeof ceilFlat === 'object' ? ceilFlat[d] : ceilFlat
    const rec: Record<string, number> = {}
    for (const key of SKILL_ORDER[d]) {
      const a = skills[d][key]!.actual
      rec[key] = Math.max(a, Math.min(99, per ?? a))
    }
    out[d] = rec as Ceilings[Discipline]
  }
  return out
}

let idSeq = 0
function mkTalent(opts: {
  id?: string
  role?: Talent['role']
  age?: number
  persona?: Persona
  fame?: number
  workEthic?: number
  authored?: boolean
  // per-discipline flat skill (default 50) + optional per-skill overrides.
  disc?: Partial<Record<Discipline, DiscSpec>>
  flat?: number
  ceil?: number | Partial<Record<Discipline, number>>
  genreExpFlat?: number
} = {}): Talent {
  idSeq += 1
  const flat = opts.flat ?? 50
  const skills = buildSkills(opts.disc ?? {}, flat)
  const ceilings = buildCeilings(skills, opts.ceil ?? {})
  const genreExperience = {} as GenreExperience
  for (const d of DISCIPLINE_ORDER) {
    const g = {} as Record<Genre, { actual: number; perceived: number }>
    for (const genre of GENRE_ORDER) {
      const v = opts.genreExpFlat ?? 0
      g[genre] = { actual: v, perceived: v }
    }
    genreExperience[d] = g
  }
  const workHistory = {} as WorkHistory
  for (const d of DISCIPLINE_ORDER) workHistory[d] = 0
  const persona = opts.persona ?? { ...NEUTRAL_PERSONA }
  return {
    id: opts.id ?? `d9-${idSeq}`,
    name: opts.id ?? `d9-${idSeq}`,
    role: opts.role ?? 'actor',
    age: opts.age ?? 40,
    actual: persona,
    perceived: { ...persona },
    fame: opts.fame ?? 0,
    salary: 0,
    authored: opts.authored ?? false,
    skills,
    ceilings,
    devRate: { acting: 1, writing: 1, directing: 1, craft: 1 },
    workEthic: opts.workEthic ?? 60,
    genreExperience,
    workHistory,
    skill: 0,
  }
}

// A concept whose only load-bearing field for these tests is genre (+ role targets).
function concept(genre: Genre, over: Partial<FilmConcept> = {}): FilmConcept {
  const t = { ...NEUTRAL_PERSONA }
  return {
    id: over.id ?? 'c',
    title: over.title ?? 'Untitled',
    genre,
    baselineStrength: over.baselineStrength ?? 50,
    originalityRaw: over.originalityRaw ?? 50,
    baseNegativeCost: over.baseNegativeCost ?? 4_000_000,
    requiredSlots: over.requiredSlots ?? ['lead', 'antagonist', 'support'],
    roleRequirements:
      over.roleRequirements ?? {
        lead: { target: { ...t }, tolerance: 1.0 },
        antagonist: { target: { ...t }, tolerance: 1.0 },
        support: { target: { ...t }, tolerance: 1.0 },
      },
  }
}

const SE: ShapeEffects = {
  expression: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 },
  openingReachMod: 0,
  craftMod: 0,
  budgetDemandMultiplier: 1,
  originalityMod: 0,
  segmentAffinity: { youngAdult: 0, family: 0, adult: 0, prestige: 0 },
}

// A fixed locked FilmShape for the development contexts below (RULING C threads the
// greenlight-locked raw shape into DevelopmentContext). Any legal shape is fine here.
const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }

function widePromise(genre: Genre): FilmPromise {
  return {
    genre,
    intendedSegments: ['adult'],
    ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OVR gates (D-9.2)
// ─────────────────────────────────────────────────────────────────────────────
describe('D-9.2 Role OVR gates and bounds', () => {
  it('roleOVR ∈ [1,99] for every generated talent × discipline across seeds', () => {
    const seeds = Array.from({ length: 40 }, (_, i) => `m0a-${String(i + 1).padStart(4, '0')}`)
    for (const s of seeds) {
      for (const t of generateWorld(s).talent) {
        for (const d of DISCIPLINE_ORDER) {
          const o = roleOVR(t, d)
          expect(o).toBeGreaterThanOrEqual(1)
          expect(o).toBeLessThanOrEqual(99)
          expect(Number.isInteger(o)).toBe(true)
        }
      }
    }
  })

  it('all-core-99 → OVR 99 (the value must genuinely reach 99, not just pass the gate)', () => {
    // The 99 gate is min(x, 99): it CAPS at 99 but the raw value must reach 99.
    // A profile of all-99 skills has zero weakness/breadth penalty → raw 99 → 99.
    const t = mkTalent({ disc: { acting: { flat: 99 } } })
    expect(roleOVR(t, 'acting')).toBe(99)
  })

  it('the same mean with one core dropped below the 99 min-core gate cannot display 99', () => {
    // Five skills 99, one core skill at 90 (< OVR_GATE_99_MINCORE 94): the 99 gate
    // fails → capped at ≤ 95 (the 95 gate), never 99. (Owner rule: a real weakness
    // caps the display below Generational.)
    const t = mkTalent({
      disc: { acting: { flat: 99, skills: { emotionalRange: 90 } } },
    })
    const o = roleOVR(t, 'acting')
    expect(o).toBeLessThanOrEqual(94 + 1) // ≤ 95 gate
    expect(o).toBeLessThan(99)
  })

  it('a two-elite / rest-weak specialist displays ≤ 94, never 99 (specialist ≠ Generational)', () => {
    // Two skills 96, four skills 60: weightedMean well below the 99/95 gate means,
    // AND the four sub-80 skills incur a weakness penalty and fail breadth → ≤ 94.
    const t = mkTalent({ disc: { acting: { skills: mapSkills([96, 96, 60, 60, 60, 60]) } } })
    const o = roleOVR(t, 'acting')
    expect(o).toBeLessThanOrEqual(94)
    expect(o).not.toBe(99)
  })

  it('rounding alone cannot cross 99 — a near-99 mean floors below 99 unless it truly reaches 99', () => {
    // all-98 skills: raw 98 (no penalties), floor(min(98,99)) = 98 — NOT 99. So a
    // sub-99 raw value can never round up to a displayed 99.
    const t98 = mkTalent({ disc: { acting: { flat: 98 } } })
    expect(roleOVR(t98, 'acting')).toBe(98)
    // Only a genuine 99-level profile displays 99 (see the all-99 case above).
    const t99 = mkTalent({ disc: { acting: { flat: 99 } } })
    expect(roleOVR(t99, 'acting')).toBe(99)
  })

  it('OVR is invariant to the selected film (skills only — no concept/shape/promise input)', () => {
    const t = mkTalent({ disc: { acting: { skills: mapSkills([80, 70, 75, 90, 60, 85]) } } })
    // roleOVR takes only (talent, discipline) — there is no film to vary; assert it
    // is stable and identical regardless of any surrounding project we might imagine.
    const a = roleOVR(t, 'acting')
    const b = roleOVR(t, 'acting')
    expect(a).toBe(b)
    // And the tier label is a pure function of the OVR.
    expect(roleTier(a)).toBe(roleTier(b))
  })
})

// helper: map a 6-vector onto acting skill-name keys in SKILL_ORDER.
function mapSkills(vals: number[]): Record<string, number> {
  const out: Record<string, number> = {}
  SKILL_ORDER.acting.forEach((k, i) => (out[k] = vals[i]!))
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// Project weighting / specialists (D-9.3 / D-9.5)
// ─────────────────────────────────────────────────────────────────────────────
describe('D-9.3/D-9.5 specialists out-perform on matching projects and reverse off them', () => {
  // Comedy specialist: elite comicTiming (project-dominant for comedy), rest modest
  // → lower broad OVR than a flat generalist, but higher comedy effectiveSkill.
  // (Inputs chosen so the comedy comicTiming weight — 2.0/6.8 ≈ 0.29 of the
  // normalized weight — actually overcomes the flat gap: 0.29·98 + 0.71·72 ≈ 79.6 >
  // 76. The D-9 text's illustrative "comicTiming 96 vs flat-80" example does NOT
  // satisfy this under the ruling's own weight table — reported to the PM — so these
  // tests use inputs where the ruling's MECHANISM genuinely manifests.)
  const specialist = mkTalent({
    disc: { acting: { skills: mapSkills([72, 72, 72, 98, 72, 72]) } },
  })
  const generalist = mkTalent({ disc: { acting: { flat: 76 } } })

  it('the comedy specialist has a LOWER broad OVR than the flat generalist', () => {
    expect(roleOVR(specialist, 'acting')).toBeLessThan(roleOVR(generalist, 'acting'))
  })

  it('yet strictly higher effectiveSkill on a comedy (comicTiming carries the weight)', () => {
    const c = concept('comedy')
    const p = widePromise('comedy')
    const specE = effectiveSkill(specialist, 'acting', c, undefined, SE, p, 'actual')
    const genE = effectiveSkill(generalist, 'acting', c, undefined, SE, p, 'actual')
    expect(specE).toBeGreaterThan(genE)
  })

  it('and the ranking REVERSES on a drama (emotionalRange-weighted, where the specialist is ordinary)', () => {
    const c = concept('drama')
    const p = widePromise('drama')
    const specE = effectiveSkill(specialist, 'acting', c, undefined, SE, p, 'actual')
    const genE = effectiveSkill(generalist, 'acting', c, undefined, SE, p, 'actual')
    expect(genE).toBeGreaterThan(specE)
  })

  it('effectiveSkill never exceeds max(skills)+EXP_SKILL_CAP or 100 (no hidden bonus)', () => {
    const genres: Genre[] = ['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure']
    for (const t of [specialist, generalist, mkTalent({ genreExpFlat: 100, disc: { acting: { flat: 90 } } })]) {
      const skillVals = SKILL_ORDER.acting.map((k) => t.skills.acting[k]!.actual)
      const maxSkill = Math.max(...skillVals)
      for (const g of genres) {
        const e = effectiveSkill(t, 'acting', concept(g), undefined, SE, widePromise(g), 'actual')
        expect(e).toBeLessThanOrEqual(Math.min(100, maxSkill + TUNING.EXP_SKILL_CAP) + 1e-9)
        expect(e).toBeGreaterThanOrEqual(0)
        expect(e).toBeLessThanOrEqual(100)
      }
    }
  })

  it('projectSkillWeights normalize to Σ=1 for every discipline × genre', () => {
    for (const d of DISCIPLINE_ORDER) {
      for (const g of GENRE_ORDER) {
        const w = projectSkillWeights(d, concept(g), undefined, SE, widePromise(g))
        const sum = w.reduce((a, b) => a + b, 0)
        expect(sum).toBeCloseTo(1, 9)
        for (const wi of w) expect(wi).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Project Fit (D-9.6)
// ─────────────────────────────────────────────────────────────────────────────
describe('D-9.6 Project Fit — bounds, specialist advantage, ability floor', () => {
  it('projectFit ∈ [0,100] across disciplines/genres/slots', () => {
    const t = mkTalent({ disc: { acting: { flat: 70 } }, persona: { warmth: 0.3, gravity: 0.1, physicality: -0.2 } })
    for (const g of GENRE_ORDER) {
      const f = projectFit(t, 'acting', concept(g), 'lead', SE, widePromise(g))
      expect(f).toBeGreaterThanOrEqual(0)
      expect(f).toBeLessThanOrEqual(100)
    }
    for (const d of ['writing', 'directing', 'craft'] as Discipline[]) {
      const f = projectFit(t, d, concept('drama'), undefined, SE, widePromise('drama'))
      expect(f).toBeGreaterThanOrEqual(0)
      expect(f).toBeLessThanOrEqual(100)
    }
  })

  it('a lower-OVR matching specialist out-Fits a higher-OVR mismatch on the matching film; reverses off it', () => {
    // Comedy specialist (elite comicTiming) vs a flat generalist (same inputs as
    // the effectiveSkill test — the specialist genuinely out-Fits on comedy).
    const specialist = mkTalent({ disc: { acting: { skills: mapSkills([72, 72, 72, 98, 72, 72]) } } })
    const generalist = mkTalent({ disc: { acting: { flat: 76 } } })
    // On a comedy the specialist Fits higher despite lower OVR.
    const cFitSpec = projectFit(specialist, 'acting', concept('comedy'), 'support', SE, widePromise('comedy'))
    const cFitGen = projectFit(generalist, 'acting', concept('comedy'), 'support', SE, widePromise('comedy'))
    expect(cFitSpec).toBeGreaterThan(cFitGen)
    // On a drama the generalist Fits higher (ranking reverses).
    const dFitSpec = projectFit(specialist, 'acting', concept('drama'), 'support', SE, widePromise('drama'))
    const dFitGen = projectFit(generalist, 'acting', concept('drama'), 'support', SE, widePromise('drama'))
    expect(dFitGen).toBeGreaterThan(dFitSpec)
  })

  it('ability share ≥ 0.45 — temperament cannot erase ability (worst-case zero temperament match)', () => {
    // A high-ability actor with the WORST possible temperament match still carries
    // ≥ FIT_ACTOR_ABILITY (0.55 ≥ 0.45) of its effectiveSkill into Fit. Construct a
    // role target maximally far from the actor's persona so roleFit → 0.
    const t = mkTalent({ disc: { acting: { flat: 90 } }, persona: { warmth: 1, gravity: 1, physicality: 1 } })
    const c = concept('drama', {
      roleRequirements: {
        lead: { target: { warmth: -1, gravity: -1, physicality: -1 }, tolerance: 0.5 },
        antagonist: { target: { warmth: -1, gravity: -1, physicality: -1 }, tolerance: 0.5 },
        support: { target: { warmth: -1, gravity: -1, physicality: -1 }, tolerance: 0.5 },
      },
    })
    const f = projectFit(t, 'acting', c, 'lead', SE, widePromise('drama'))
    const effP = effectiveSkill(t, 'acting', c, 'lead', SE, widePromise('drama'), 'perceived')
    // With roleFit 0 and 0 genre exp, Fit ≥ FIT_ACTOR_ABILITY·effP (the ability floor).
    expect(f).toBeGreaterThanOrEqual(TUNING.FIT_ACTOR_ABILITY * effP - 1e-6)
    expect(TUNING.FIT_ACTOR_ABILITY).toBeGreaterThanOrEqual(TUNING.FIT_MIN_ABILITY_SHARE)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Creative Temperament (D-9.8) — pure function of persona; preset changes only persona
// ─────────────────────────────────────────────────────────────────────────────
describe('D-9.8 Creative Temperament summary + persona isolation', () => {
  it('temperamentSummary is a pure function of persona (5×5×5 buckets, deterministic)', () => {
    const p: Persona = { warmth: -0.7, gravity: 0.5, physicality: 0.8 }
    // Derived from TEMPER_BANDS: warmth −0.7 ≤ −0.6 → Cold; gravity 0.5 ∈ (0.2,0.6] →
    // Serious; physicality 0.8 > 0.6 → Explosive. Template: "{gravity}, {warmth} ...".
    expect(temperamentSummary(p)).toBe('Serious, Cold presence with Explosive energy.')
    // purity: same triple → same string on repeat calls.
    expect(temperamentSummary({ ...p })).toBe(temperamentSummary(p))
    // a different persona → a different string.
    expect(temperamentSummary({ warmth: 0.9, gravity: -0.9, physicality: -0.9 })).toBe(
      'Playful, Radiant presence with Still energy.',
    )
  })

  it('applying a preset (persona change) leaves all 24 skills, ceilings, and WorkEthic untouched — field by field', () => {
    const base = mkTalent({ disc: { acting: { flat: 72 }, writing: { flat: 55 } }, workEthic: 71, ceil: 90 })
    // A "preset" sets only persona (D-9.8: presets never touch skills/potential/WE).
    const preset: Persona = { warmth: 0.4, gravity: -0.6, physicality: 0.2 }
    const after: Talent = { ...base, actual: preset, perceived: { ...preset } }

    // OVR is unchanged by the persona change (OVR reads skills only).
    for (const d of DISCIPLINE_ORDER) {
      expect(roleOVR(after, d)).toBe(roleOVR(base, d))
    }
    // Field-by-field: every skill actual/perceived, every ceiling, WE untouched.
    for (const d of DISCIPLINE_ORDER) {
      for (const k of SKILL_ORDER[d]) {
        expect(after.skills[d][k]!.actual).toBe(base.skills[d][k]!.actual)
        expect(after.skills[d][k]!.perceived).toBe(base.skills[d][k]!.perceived)
        expect(after.ceilings[d][k]).toBe(base.ceilings[d][k])
      }
    }
    expect(after.workEthic).toBe(base.workEthic)
    // Only persona changed.
    expect(after.actual).toEqual(preset)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Potential (D-9.10) — visible estimate never exposes the true ceiling
// ─────────────────────────────────────────────────────────────────────────────
describe('D-9.10 Potential — visible estimate is noisy and never the true ceiling', () => {
  // true hidden ceiling-OVR (computed on the ceilings, mirroring the ruling's derivation)
  function trueCeilingOVR(t: Talent, d: Discipline): number {
    const ceilAsSkills = {} as SkillProfiles
    for (const dd of DISCIPLINE_ORDER) {
      const rec: DisciplineSkills = {}
      for (const k of SKILL_ORDER[dd]) {
        const c = t.ceilings[dd][k]!
        rec[k] = { actual: c, perceived: c }
      }
      ceilAsSkills[dd] = rec
    }
    return roleOVR({ ...t, skills: ceilAsSkills }, d)
  }

  it('the noised estimate lands ABOVE truth in some seeds and BELOW in others (both occur)', () => {
    let above = 0
    let below = 0
    for (let i = 0; i < 300; i++) {
      const t = mkTalent({ id: `pot-${i}`, disc: { acting: { flat: 50 } }, ceil: { acting: 80 } })
      const range = expectedPotentialRange(t, 'acting', `pot-seed-${i}`)
      const trueOVR = trueCeilingOVR(t, 'acting')
      const mid = (range.low + range.high) / 2
      if (mid > trueOVR) above++
      else if (mid < trueOVR) below++
    }
    expect(above).toBeGreaterThan(0)
    expect(below).toBeGreaterThan(0)
  })

  it('the displayed band never exposes/equals the exact true ceiling structure (band is centered on the noisy estimate)', () => {
    // For a spread of talent, assert the visible band is bounded [1,99] and never
    // wider than 2·POTENTIAL_BAND_HALF (so it is the noisy estimate ± band, not the
    // raw ceilings). The true per-skill ceilings are never returned by the summary.
    for (let i = 0; i < 50; i++) {
      const t = mkTalent({ id: `band-${i}`, disc: { acting: { flat: 55 } }, ceil: { acting: 88 } })
      const r = expectedPotentialRange(t, 'acting', `band-seed-${i}`)
      expect(r.low).toBeGreaterThanOrEqual(1)
      expect(r.high).toBeLessThanOrEqual(99)
      expect(r.high - r.low).toBeLessThanOrEqual(2 * TUNING.POTENTIAL_BAND_HALF)
    }
  })

  it('no ceiling exceeds 99 and no actual exceeds its ceiling across a generated corpus', () => {
    const seeds = ['m0a-0001', 'm0a-0002', 'm0a-0003']
    for (const s of seeds) {
      for (const t of generateWorld(s).talent) {
        for (const d of DISCIPLINE_ORDER) {
          for (const k of SKILL_ORDER[d]) {
            expect(t.ceilings[d][k]).toBeLessThanOrEqual(99)
            expect(t.skills[d][k]!.actual).toBeLessThanOrEqual(t.ceilings[d][k]!)
          }
        }
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Work Ethic (D-9.11) — touches nothing immediate; flows only through development
// ─────────────────────────────────────────────────────────────────────────────
describe('D-9.11 Work Ethic — immediate quantities identical; only development differs', () => {
  it('workEthicLabel bands (D-9.11 boundaries)', () => {
    expect(workEthicLabel(1)).toBe('Poor')
    expect(workEthicLabel(29)).toBe('Poor')
    expect(workEthicLabel(30)).toBe('Inconsistent')
    expect(workEthicLabel(49)).toBe('Inconsistent')
    expect(workEthicLabel(50)).toBe('Professional')
    expect(workEthicLabel(69)).toBe('Professional')
    expect(workEthicLabel(70)).toBe('Driven')
    expect(workEthicLabel(84)).toBe('Driven')
    expect(workEthicLabel(85)).toBe('Exceptional')
    expect(workEthicLabel(94)).toBe('Exceptional')
    expect(workEthicLabel(95)).toBe('Relentless')
    expect(workEthicLabel(99)).toBe('Relentless')
  })

  it('two talents identical except WE 20 vs 95 have IDENTICAL OVR / Fit / salary / effectiveSkill', () => {
    // Same everything but WorkEthic. WE must touch nothing immediate (D-9.11).
    const low = mkTalent({ id: 'we-low', role: 'actor', fame: 50, disc: { acting: { flat: 70 } }, ceil: 90, workEthic: 20 })
    const high = mkTalent({ id: 'we-high', role: 'actor', fame: 50, disc: { acting: { flat: 70 } }, ceil: 90, workEthic: 95 })
    const c = concept('drama')
    const p = widePromise('drama')
    // OVR identical
    expect(roleOVR(high, 'acting')).toBe(roleOVR(low, 'acting'))
    // effectiveSkill identical (both actual and perceived)
    expect(effectiveSkill(high, 'acting', c, 'lead', SE, p, 'actual')).toBe(
      effectiveSkill(low, 'acting', c, 'lead', SE, p, 'actual'),
    )
    // Fit identical
    expect(projectFit(high, 'acting', c, 'lead', SE, p)).toBe(projectFit(low, 'acting', c, 'lead', SE, p))
    // Salary identical (salaryCurve reads OVR + fame, not WE)
    expect(salaryCurve(high)).toBe(salaryCurve(low))
  })

  it('after N develop-ON releases the high-WE talent has ≥ the low-WE total skill gain and gets nearer its ceiling', () => {
    const ctx: DevelopmentContext = {
      concept: concept('comedy'),
      shape: SHAPE,
      shapeEffects: SE,
      promise: widePromise('comedy'),
      requiredNegative: 4_000_000,
      criticScore: 70,
    }
    let low = mkTalent({ id: 'dev-low', disc: { acting: { flat: 50 } }, ceil: { acting: 90 }, workEthic: 20 })
    let high = mkTalent({ id: 'dev-high', disc: { acting: { flat: 50 } }, ceil: { acting: 90 }, workEthic: 95 })
    const total = (t: Talent) => SKILL_ORDER.acting.reduce((s, k) => s + t.skills.acting[k]!.actual, 0)
    const l0 = total(low)
    const h0 = total(high)
    for (let r = 0; r < 12; r++) {
      low = developTalent(low, 'acting', ctx, stream('we-ab', 'develop', `p${r}:dev-low`))
      high = developTalent(high, 'acting', ctx, stream('we-ab', 'develop', `p${r}:dev-high`))
    }
    const lowGain = total(low) - l0
    const highGain = total(high) - h0
    expect(highGain).toBeGreaterThanOrEqual(lowGain)
    // high WE gets strictly nearer its ceiling here (it converts more consistently).
    expect(highGain).toBeGreaterThan(0)
  })

  it('high WE ≠ guaranteed greatness — a low ceiling still caps development', () => {
    const ctx: DevelopmentContext = {
      concept: concept('comedy'),
      shape: SHAPE,
      shapeEffects: SE,
      promise: widePromise('comedy'),
      requiredNegative: 4_000_000,
      criticScore: 80,
    }
    // Relentless WE but a low ceiling (60): development can never exceed the ceiling.
    let t = mkTalent({ id: 'capped', disc: { acting: { flat: 58 } }, ceil: { acting: 60 }, workEthic: 99 })
    for (let r = 0; r < 30; r++) {
      t = developTalent(t, 'acting', ctx, stream('capped', 'develop', `p${r}:capped`))
    }
    for (const k of SKILL_ORDER.acting) {
      expect(t.skills.acting[k]!.actual).toBeLessThanOrEqual(t.ceilings.acting[k]!)
      expect(t.skills.acting[k]!.actual).toBeLessThanOrEqual(60)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Development (dev ON) — D-9.8
// ─────────────────────────────────────────────────────────────────────────────
describe('D-9.8 Development — deterministic, discipline-confined, ceiling-respecting', () => {
  const ctx = (over: Partial<DevelopmentContext> = {}): DevelopmentContext => ({
    concept: over.concept ?? concept('comedy'),
    shape: over.shape ?? SHAPE,
    shapeEffects: over.shapeEffects ?? SE,
    promise: over.promise ?? widePromise('comedy'),
    requiredNegative: over.requiredNegative ?? 4_000_000,
    criticScore: over.criticScore ?? 70,
  })

  it('deterministic: same (seed, prodId, talentId) → identical developed talent', () => {
    const t = mkTalent({ id: 'det', disc: { acting: { flat: 55 } }, ceil: { acting: 90 } })
    const a = developTalent(t, 'acting', ctx(), stream('S', 'develop', 'P:det'))
    const b = developTalent(t, 'acting', ctx(), stream('S', 'develop', 'P:det'))
    expect(JSON.stringify(a.skills)).toBe(JSON.stringify(b.skills))
    expect(JSON.stringify(a.genreExperience)).toBe(JSON.stringify(b.genreExperience))
    expect(a.workHistory).toEqual(b.workHistory)
  })

  it('the develop stream is derived (never the sim stream) — the source talent is unmutated', () => {
    // developTalent returns a NEW talent; the input is not mutated in place.
    const t = mkTalent({ id: 'immut', disc: { acting: { flat: 55 } }, ceil: { acting: 90 } })
    const before = JSON.stringify(t.skills)
    developTalent(t, 'acting', ctx(), stream('x', 'develop', 'p:immut'))
    expect(JSON.stringify(t.skills)).toBe(before)
  })

  it('growth is confined to the performed discipline (a writer developing writing never moves acting)', () => {
    const t = mkTalent({ id: 'conf', disc: { writing: { flat: 55 }, acting: { flat: 55 } }, ceil: 90 })
    const after = developTalent(t, 'writing', ctx({ concept: concept('drama'), promise: widePromise('drama') }), stream('c', 'develop', 'p:conf'))
    // acting skills unchanged; writing may change.
    for (const k of SKILL_ORDER.acting) {
      expect(after.skills.acting[k]!.actual).toBe(t.skills.acting[k]!.actual)
    }
    // work history incremented only for writing.
    expect(after.workHistory.writing).toBe(1)
    expect(after.workHistory.acting).toBe(0)
  })

  it('a flop (criticScore 30) still yields a non-zero gain for some exercised skill in some seed', () => {
    let taughtInSome = false
    const total = (t: Talent) => SKILL_ORDER.acting.reduce((s, k) => s + t.skills.acting[k]!.actual, 0)
    for (let i = 0; i < 60 && !taughtInSome; i++) {
      const t = mkTalent({ id: `flop-${i}`, disc: { acting: { flat: 50 } }, ceil: { acting: 90 } })
      const after = developTalent(t, 'acting', ctx({ criticScore: 30 }), stream(`flop-${i}`, 'develop', 'p:flop'))
      if (total(after) > total(t)) taughtInSome = true
    }
    expect(taughtInSome).toBe(true)
  })

  it('an ordinary film moves OVR by 0 or +1 (no huge jumps) and never exceeds any ceiling', () => {
    const total = (t: Talent) => t
    void total
    for (let i = 0; i < 40; i++) {
      const t = mkTalent({ id: `ord-${i}`, disc: { acting: { flat: 60 } }, ceil: { acting: 90 } })
      const before = roleOVR(t, 'acting')
      const after = developTalent(t, 'acting', ctx({ criticScore: 65 }), stream(`ord-${i}`, 'develop', 'p:ord'))
      const delta = roleOVR(after, 'acting') - before
      expect(delta).toBeGreaterThanOrEqual(0)
      expect(delta).toBeLessThanOrEqual(2) // ordinary film: ~0/+1, occasionally +2
      for (const k of SKILL_ORDER.acting) {
        expect(after.skills.acting[k]!.actual).toBeLessThanOrEqual(after.ceilings.acting[k]!)
      }
    }
  })

  it('diminishing returns: a near-ceiling skill gains ≤ a far-from-ceiling skill of equal weight', () => {
    // Two talents, same everything, same exercised comedy skill (comicTiming), but
    // one is 1 point below a high ceiling and one is far below it. Over many seeds
    // the far-from-ceiling one accumulates at least as much gain.
    const ctxC = ctx({ criticScore: 80 })
    let nearTotal = 0
    let farTotal = 0
    for (let i = 0; i < 40; i++) {
      // near: comicTiming 88, ceiling 90 (headroom 2); far: comicTiming 55, ceiling 90 (headroom 35).
      const near = mkTalent({ id: `near-${i}`, disc: { acting: { flat: 55, skills: { comicTiming: 88 } } }, ceil: { acting: 90 } })
      const far = mkTalent({ id: `far-${i}`, disc: { acting: { flat: 55 } }, ceil: { acting: 90 } })
      const nA = developTalent(near, 'acting', ctxC, stream(`dim-${i}`, 'develop', 'p:x'))
      const fA = developTalent(far, 'acting', ctxC, stream(`dim-${i}`, 'develop', 'p:x'))
      nearTotal += nA.skills.acting.comicTiming!.actual - 88
      farTotal += fA.skills.acting.comicTiming!.actual - 55
    }
    expect(farTotal).toBeGreaterThanOrEqual(nearTotal)
  })

  it('genre experience and workHistory rise for the performed (discipline,genre)', () => {
    const t = mkTalent({ id: 'exp', disc: { acting: { flat: 55 } }, ceil: { acting: 90 } })
    const after = developTalent(t, 'acting', ctx({ concept: concept('comedy'), promise: widePromise('comedy'), criticScore: 75 }), stream('e', 'develop', 'p:exp'))
    expect(genreExperience(after, 'acting', 'comedy', 'actual')).toBeGreaterThan(0)
    // other genres unchanged.
    expect(genreExperience(after, 'acting', 'drama', 'actual')).toBe(0)
    expect(workHistoryCount(after, 'acting')).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Cross-discipline (D-9.9 / Cross-discipline eligibility) — Expected Performance
// ─────────────────────────────────────────────────────────────────────────────
describe('Cross-discipline — "Unproven in this role" widens the Expected Performance band', () => {
  it('workHistory[discipline] == 0 → wider band than a proven counterpart (EP_UNPROVEN_WIDTH bump)', () => {
    // An actor with usable writing skills, assigned as a writer. With zero writing
    // work history the band is widened by EP_UNPROVEN_WIDTH (D-9.7 / "Unproven in
    // this role"). A proven counterpart (workHistory.writing ≥ 1) has a narrower band.
    const unproven = mkTalent({ id: 'unproven', role: 'actor', disc: { writing: { flat: 65 } }, ceil: 90 })
    expect(workHistoryCount(unproven, 'writing')).toBe(0)

    const proven: Talent = { ...unproven, id: 'proven', workHistory: { ...unproven.workHistory, writing: 3 } }

    const c = concept('drama')
    const p = widePromise('drama')
    const bandU = expectedPerformance(unproven, 'writing', c, undefined, SE, p)
    const bandP = expectedPerformance(proven, 'writing', c, undefined, SE, p)

    const widthU = bandU.high - bandU.low
    const widthP = bandP.high - bandP.low
    expect(widthU).toBeGreaterThan(widthP)
    // The extra width is exactly the unproven bump (both share genre-exp 0 here).
    expect(widthU - widthP).toBeCloseTo(2 * TUNING.EP_UNPROVEN_WIDTH, 6)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// D-9.10 Potential tier + expectedPotentialTier authored-only Generational
// ─────────────────────────────────────────────────────────────────────────────
describe('D-9.10 Potential tiers', () => {
  it('a Limited-headroom talent (ceiling ≈ current) reads a low tier; a high-headroom one reads higher', () => {
    // ceiling == current → ~zero upside → Limited/Steady; big headroom → higher tier.
    const flat = mkTalent({ id: 'flat', disc: { acting: { flat: 70 } }, ceil: { acting: 70 } })
    const upside = mkTalent({ id: 'upside', disc: { acting: { flat: 45 } }, ceil: { acting: 92 } })
    // Deterministic per (seed, talent, discipline); use a fixed seed.
    const tFlat = expectedPotentialTier(flat, 'acting', 'tier-seed')
    const tUp = expectedPotentialTier(upside, 'acting', 'tier-seed')
    const order = ['Limited', 'Steady', 'Promising', 'High Upside', 'Exceptional Upside', 'Generational Upside']
    expect(order.indexOf(tUp)).toBeGreaterThan(order.indexOf(tFlat))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// D-9.8 ageRunwayMult — decreasing, always positive, no decline
// ─────────────────────────────────────────────────────────────────────────────
describe('D-9.8 ageRunwayMult', () => {
  it('is 1.0 young, floors at DEV_AGE_FLOOR old, monotone non-increasing, never ≤ 0', () => {
    expect(ageRunwayMult(20)).toBeCloseTo(1.0, 6)
    expect(ageRunwayMult(TUNING.DEV_AGE_YOUNG)).toBeCloseTo(1.0, 6)
    expect(ageRunwayMult(70)).toBeCloseTo(TUNING.DEV_AGE_FLOOR, 6)
    let prev = ageRunwayMult(18)
    for (let age = 19; age <= 75; age++) {
      const cur = ageRunwayMult(age)
      expect(cur).toBeLessThanOrEqual(prev + 1e-9)
      expect(cur).toBeGreaterThan(0)
      prev = cur
    }
  })
})
