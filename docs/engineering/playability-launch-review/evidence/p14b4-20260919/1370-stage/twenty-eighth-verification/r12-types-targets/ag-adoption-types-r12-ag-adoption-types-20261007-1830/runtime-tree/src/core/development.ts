// ── D-9.8 Development — the deterministic seeded per-release skill growth ──────
// Pure. Given a released production's key facts (the discipline a performer worked
// in, the concept/shapeEffects/promise, the requiredNegative and criticScore) and
// a talent, produce a NEW developed Talent. Draws ONLY from the DERIVED
// stream(seed,'develop', prodId+':'+talentId) — never the sim stream — so
// state.rngState is untouched and §15.7 replay is exact.
//
// Growth is confined to the discipline the talent performed (acting work never
// raises writing skills). Exercised skills = those with project weight ≥
// DEV_EXERCISE_THRESHOLD. Gains are small, bounded, ceiling-respecting, WE-modulated.

import { clamp, smoothstep } from './math.js'
import { type RngStream } from './rng.js'
import { ageRunwayMult, projectSkillWeights } from './talentSummary.js'
import { DISCIPLINE_ORDER, SKILL_ORDER, TUNING } from './tuning.js'
import type {
  Discipline,
  DisciplineSkills,
  FilmConcept,
  FilmShape,
  Genre,
  Promise as FilmPromise,
  ShapeEffects,
  Talent,
} from './types.js'

// The per-release facts development reads (all already computed by §5).
export type DevelopmentContext = {
  concept: FilmConcept
  // RULING C (2026-07-26): the greenlight-LOCKED FilmShape, so development weights
  // exercised skills through the SAME projectSkillWeights path as §5/§7. Shape may
  // change WHICH skills are exercised (the growth distribution), never the total
  // development budget (the per-film multipliers below are unchanged).
  shape: FilmShape
  shapeEffects: ShapeEffects
  promise: FilmPromise
  requiredNegative: number
  criticScore: number
}

// weMult(workEthic): DEV_WE_FLOOR + (DEV_WE_CEIL − DEV_WE_FLOOR)·(WE/99).
function weMult(workEthic: number): number {
  return TUNING.DEV_WE_FLOOR + (TUNING.DEV_WE_CEIL - TUNING.DEV_WE_FLOOR) * (workEthic / 99)
}

// Deep-copy a DisciplineSkills record so the update is immutable.
function copyDisciplineSkills(src: DisciplineSkills): DisciplineSkills {
  const out: DisciplineSkills = {}
  for (const key of Object.keys(src)) out[key] = { actual: src[key]!.actual, perceived: src[key]!.perceived }
  return out
}

// Develop ONE talent for ONE released production in the discipline they performed.
// Returns a NEW Talent (fresh nested skills/genreExperience/workHistory records).
// `devStream` is the per-(prod,talent) derived stream, consumed once per skill in
// SKILL_ORDER (the fixed draw order the ruling requires).
export function developTalent(
  talent: Talent,
  discipline: Discipline,
  ctx: DevelopmentContext,
  devStream: RngStream,
): Talent {
  const keys = SKILL_ORDER[discipline]
  const genre = ctx.concept.genre

  // Project weights for the performed discipline on THIS film (slot = undefined:
  // development uses the discipline-level weighting; actor slot is not threaded —
  // the exercised set is the same discipline-relevant emphasis).
  // RULING C: the LOCKED ctx.shape (raw FilmShape) is now threaded so SHAPE_SKILL_MODS
  // reweights the exercised set identically to §5/§7 — the shared weighting path.
  const w = projectSkillWeights(discipline, ctx.concept, undefined, ctx.shapeEffects, ctx.promise, ctx.shape)

  const wm = weMult(talent.workEthic)
  const ageMult = ageRunwayMult(talent.age)
  const devRateD = talent.devRate[discipline]

  // difficulty & result multipliers (film-level; same for every skill).
  const difficulty = clamp(
    ctx.requiredNegative / TUNING.DEV_DIFFICULTY_SCALE,
    TUNING.DEV_DIFF_MIN,
    TUNING.DEV_DIFF_MAX,
  )
  const resultMult =
    TUNING.DEV_RESULT_FLOOR +
    (1 - TUNING.DEV_RESULT_FLOOR) *
      smoothstep(TUNING.DEV_RESULT_LO, TUNING.DEV_RESULT_HI, ctx.criticScore)

  // Fresh copy of the performed discipline's skills; other disciplines are shared
  // by reference in the new SkillProfiles (only this discipline can change here,
  // except a small WE-gated secondary nudge below).
  const newSkills = { ...talent.skills }
  const developed = copyDisciplineSkills(talent.skills[discipline])
  newSkills[discipline] = developed

  // Per-skill gain, in fixed SKILL_ORDER (one draw per skill).
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!
    const a = developed[key]!.actual
    const c = talent.ceilings[discipline][key]!
    const u = devStream.next() // one draw per (talent,skill), fixed order

    if (a >= c) continue // already at ceiling

    const projW = w[i]!
    // D-9.8 exercised-set membership gate (fidelity fix, 2026-07-26): the ruling
    // defines exercised = { i : projWeightᵢ ≥ DEV_EXERCISE_THRESHOLD (0.10) }. Only
    // exercised skills receive opportunity; a sub-threshold skill gets ZERO (was
    // previously `opportunity = projW`, letting sub-0.10-weight skills still gain).
    const opportunity = projW >= TUNING.DEV_EXERCISE_THRESHOLD ? projW : 0
    if (opportunity <= 0) continue // not exercised on this film — no growth
    const headroom = c - a
    const diminishing =
      smoothstep(0, TUNING.DEV_HEADROOM_FULL, headroom) * (1 - TUNING.DEV_HIGHLEVEL_SLOW * (a / 99))

    const rawGain =
      TUNING.DEV_BASE_RATE *
      devRateD *
      opportunity *
      difficulty *
      resultMult *
      diminishing *
      ageMult *
      wm

    // Convert to an integer increment; WE lowers the landing threshold (raises odds).
    const threshold = 1 - wm * TUNING.DEV_LAND_BIAS
    const frac = rawGain - Math.floor(rawGain)
    const lands = frac > threshold * u ? 1 : 0
    const increment = Math.floor(rawGain) + lands
    if (increment <= 0) continue

    const newActual = Math.min(c, a + increment)
    const gained = newActual - a
    const newPerceived = clamp(
      developed[key]!.perceived + Math.round(TUNING.DEV_PERCEIVED_CATCHUP * gained),
      1,
      99,
    )
    developed[key] = { actual: newActual, perceived: newPerceived }
  }

  // Genre experience growth for the film's (discipline, genre) (D-9.8).
  const newGenreExp = { ...talent.genreExperience }
  const discGenreExp = { ...talent.genreExperience[discipline] } as Record<
    Genre,
    { actual: number; perceived: number }
  >
  const prevExp = discGenreExp[genre] ?? { actual: 0, perceived: 0 }
  const expActual = clamp(prevExp.actual + TUNING.DEV_EXP_GAIN * resultMult, 0, 100)
  const expPerceived = clamp(
    prevExp.perceived + TUNING.DEV_EXP_PERCEIVED_CATCHUP * (expActual - prevExp.actual),
    0,
    100,
  )
  discGenreExp[genre] = { actual: expActual, perceived: expPerceived }
  newGenreExp[discipline] = discGenreExp

  // Work history counter for the performed discipline (D-9.9).
  const newWorkHistory = { ...talent.workHistory }
  newWorkHistory[discipline] = (newWorkHistory[discipline] ?? 0) + 1

  // Secondary-discipline WE-gated passive nudge (D-9.8): high-WE talent grows OTHER
  // disciplines' below-ceiling skills a tiny amount. Bounded and rare. One extra
  // draw per candidate skill, in DISCIPLINE_ORDER then SKILL_ORDER (fixed).
  if (talent.workEthic >= TUNING.DEV_SECONDARY_WE_GATE) {
    for (const d of DISCIPLINE_ORDER) {
      if (d === discipline) continue
      let disciplineCopied = false
      let rec = newSkills[d]
      for (const key of SKILL_ORDER[d]) {
        const a = rec[key]!.actual
        const c = talent.ceilings[d][key]!
        const u = devStream.next()
        if (a >= c) continue
        // Small chance to gain +1: (WE−gate)/(99−gate) fraction of a single point.
        const p = (talent.workEthic - TUNING.DEV_SECONDARY_WE_GATE) / (99 - TUNING.DEV_SECONDARY_WE_GATE)
        // Scale down so this is genuinely rare (roughly ≤ p/8 chance per skill).
        if (u < p / 8) {
          if (!disciplineCopied) {
            rec = copyDisciplineSkills(talent.skills[d])
            newSkills[d] = rec
            disciplineCopied = true
          }
          const newActual = Math.min(c, a + 1)
          rec[key] = { actual: newActual, perceived: rec[key]!.perceived }
        }
      }
    }
  }

  return {
    ...talent,
    skills: newSkills,
    genreExperience: newGenreExp,
    workHistory: newWorkHistory,
  }
}
