// ── D-9 read-only talent summaries + the §5/§7 effective-skill substitute ─────
// Pure, deterministic, stateless helpers over a Talent. Everything here is
// display/development input EXCEPT `effectiveSkill` and `projectSkillWeights`,
// which are the only functions §5 (reception) and §7 (forecast) call.
//
// The sim (§5/§7) reads ONLY effectiveSkill, roleFit (persona, unchanged), and
// fame (unchanged) — never OVR/Fit/Expected-Performance/Potential/WorkEthic/
// GenreExperience. Those are summaries or development inputs (D-9.0 invariant).
//
// Purity: no React/DOM/async/I/O; the ONLY randomness is the DERIVED per-talent
// 'worldgen' 'scout-<id>-<d>' stream used by the potential estimate (deterministic
// per (seed, talent, discipline)); it never touches the sim stream.

import { clamp, smoothstep } from './math.js'
import { stream } from './rng.js'
import { specificity } from './shape.js'
import {
  DISCIPLINE_ORDER,
  GENRE_SKILL_WEIGHTS,
  OVR_WEIGHTS,
  POTENTIAL_TIER_THRESHOLDS,
  PROMISE_MOD_THRESHOLDS,
  PROMISE_SKILL_MODS,
  ROLE_TO_DISCIPLINE,
  SHAPE_SKILL_MODS,
  SKILL_ORDER,
  SLOT_SKILL_MODS,
  TEMPER_BANDS,
  TUNING,
} from './tuning.js'
import type {
  CastSlot,
  Discipline,
  FilmConcept,
  FilmShape,
  Genre,
  Persona,
  Promise as FilmPromise,
  RoleRequirement,
  ShapeEffects,
  Talent,
} from './types.js'
import { personaDistance } from './vector.js'

export type SkillUse = 'actual' | 'perceived'

// ── shared helpers ─────────────────────────────────────────────────────────────

// The six actual|perceived skill values of a discipline, in SKILL_ORDER.
function skillVector(talent: Talent, discipline: Discipline, use: SkillUse): number[] {
  const keys = SKILL_ORDER[discipline]
  const profile = talent.skills[discipline]
  const out: number[] = new Array(keys.length)
  for (let i = 0; i < keys.length; i++) {
    out[i] = profile[keys[i]!]![use]
  }
  return out
}

// The six ceiling values of a discipline, in SKILL_ORDER.
function ceilingVector(talent: Talent, discipline: Discipline): number[] {
  const keys = SKILL_ORDER[discipline]
  const ceil = talent.ceilings[discipline]
  const out: number[] = new Array(keys.length)
  for (let i = 0; i < keys.length; i++) {
    out[i] = ceil[keys[i]!]!
  }
  return out
}

// Range midpoint helper.
function midpoint(r: readonly [number, number]): number {
  return (r[0] + r[1]) / 2
}

// ── D-9.2 Role OVR + tier ──────────────────────────────────────────────────────

// applyGates(x): enforce the upper-tier ceiling structure (D-9.2).
function applyGates(x: number, weightedMeanVal: number, minCore: number): number {
  let gate: number
  if (weightedMeanVal >= TUNING.OVR_GATE_99_MEAN && minCore >= TUNING.OVR_GATE_99_MINCORE) {
    gate = 99
  } else if (weightedMeanVal >= TUNING.OVR_GATE_95_MEAN && minCore >= TUNING.OVR_GATE_95_MINCORE) {
    gate = 95
  } else {
    gate = 94 // hard cap below the elite gate
  }
  return Math.min(x, gate)
}

// Core OVR computation over an arbitrary 6-vector of skills (perceived skills for
// the display OVR; ceilings for the potential ceilingOVR). Weights = OVR_WEIGHTS[d].
function ovrCore(skills: number[], discipline: Discipline): number {
  const w = OVR_WEIGHTS[discipline]

  let weightedMeanVal = 0
  for (let i = 0; i < skills.length; i++) weightedMeanVal += w[i]! * skills[i]!

  // Weakness penalty — core-weighted RMS of deficits below the "no-weak-spot" line.
  let deficitSq = 0
  for (let i = 0; i < skills.length; i++) {
    const deficit = Math.max(0, TUNING.OVR_WEAKNESS_KNEE - skills[i]!)
    deficitSq += w[i]! * deficit * deficit
  }
  const weaknessPen = TUNING.OVR_WEAKNESS_COEF * Math.sqrt(deficitSq)

  // Breadth requirement — reward covering all six (core-weighted fraction ≥ floor).
  let breadth = 0
  for (let i = 0; i < skills.length; i++) {
    if (skills[i]! >= TUNING.OVR_BREADTH_FLOOR) breadth += w[i]!
  }
  const breadthPen = TUNING.OVR_BREADTH_COEF * (1 - breadth)

  const raw = weightedMeanVal - weaknessPen - breadthPen

  let minCore = Infinity
  for (const s of skills) if (s < minCore) minCore = s

  return clamp(Math.floor(applyGates(raw, weightedMeanVal, minCore)), 1, 99)
}

// D-9.2 — role OVR from PERCEIVED skills. Read-only display summary; the sim never
// reads it. Invariant to the selected film (skills only).
export function roleOVR(talent: Talent, discipline: Discipline): number {
  return ovrCore(skillVector(talent, discipline, 'perceived'), discipline)
}

// D-9.2 — player-facing tier label (display only).
export function roleTier(ovr: number): string {
  if (ovr >= 95) return 'Generational'
  if (ovr >= 90) return 'Elite'
  if (ovr >= 80) return 'Major-studio'
  if (ovr >= 70) return 'Strong'
  if (ovr >= 60) return 'Limited-or-developing'
  if (ovr >= 50) return 'Raw prospect'
  return 'Highly unproven'
}

// ── D-9.3 Project-relevant skill weights ───────────────────────────────────────

// Apply one nudge table (skill name → multiplier) into the per-skill mod vector.
function applyMods(
  mods: Record<string, number>,
  keys: readonly string[],
  out: number[],
): void {
  for (let i = 0; i < keys.length; i++) {
    const m = mods[keys[i]!]
    if (m !== undefined) out[i]! *= m
  }
}

// projectSkillWeights(discipline, concept, slot?, shapeEffects, promise, shape?): 6-vec, Σ=1.
// Pure; reads only concept/shape/promise — deterministic, no stream (D-9.3).
//
// THE single canonical shape-sensitive weighting function (RULING C, 2026-07-26):
// used by UI Fit/EP (perceived), §7 forecast (perceived), §5 reception (actual), and
// development. There is exactly ONE shape model. `shape` is now threaded from the
// greenlight-LOCKED Production.shape at every sim call site (reception/forecast/
// development), so UI and sim use identical formulas; the only forecast-vs-result
// difference is perceived-vs-actual skills. `shape` remains OPTIONAL only for the
// degenerate case of a caller with no film shape in hand; every live path supplies it.
// SHAPE_SKILL_MODS touches ONLY skill weights here — never a path ShapeEffects already
// governs (film-level craft/cohesion/segment affinity), so there is no double-count.
// `shapeEffects` is retained in the signature exactly as D-9.3 specifies (it is NOT
// read here — the shape nudges need the raw slot enum identity, which shapeEffects
// has resolved away; the two inputs feed disjoint mechanics).
export function projectSkillWeights(
  discipline: Discipline,
  concept: FilmConcept,
  slot: CastSlot | undefined,
  shapeEffects: ShapeEffects,
  promise: FilmPromise,
  shape?: FilmShape,
): number[] {
  void shapeEffects // present per D-9.3 signature; shape nudges need the raw slots
  const keys = SKILL_ORDER[discipline]
  const base = GENRE_SKILL_WEIGHTS[discipline][concept.genre]

  // Composite multiplicative modifier per skill (shape × promise × slot), clamped.
  const mods: number[] = new Array(keys.length).fill(1)

  // Shape → skill nudges (opening, midpoint, ending each contribute their table)
  // — applied ONLY when the raw FilmShape is supplied (see the GAP note above).
  if (shape !== undefined) {
    applyMods(SHAPE_SKILL_MODS[shape.opening] ?? {}, keys, mods)
    applyMods(SHAPE_SKILL_MODS[shape.midpoint] ?? {}, keys, mods)
    applyMods(SHAPE_SKILL_MODS[shape.ending] ?? {}, keys, mods)
  }

  // Promise → skill nudges (range midpoints + specificity).
  const tMid = midpoint(promise.ranges.tonalWeight)
  const kMid = midpoint(promise.ranges.kineticEnergy)
  const iMid = midpoint(promise.ranges.intimacy)
  if (tMid >= PROMISE_MOD_THRESHOLDS.tonalSerious) applyMods(PROMISE_SKILL_MODS.seriousTone, keys, mods)
  if (tMid <= PROMISE_MOD_THRESHOLDS.tonalLight) applyMods(PROMISE_SKILL_MODS.lightTone, keys, mods)
  if (kMid >= PROMISE_MOD_THRESHOLDS.kinetic) applyMods(PROMISE_SKILL_MODS.kinetic, keys, mods)
  if (iMid >= PROMISE_MOD_THRESHOLDS.intimate) applyMods(PROMISE_SKILL_MODS.intimate, keys, mods)
  if (specificity(promise) >= PROMISE_MOD_THRESHOLDS.specific) applyMods(PROMISE_SKILL_MODS.specific, keys, mods)

  // Cast slot → skill nudges (actors only).
  if (slot !== undefined) applyMods(SLOT_SKILL_MODS[slot], keys, mods)

  // Clamp the composite modifier, multiply into the base, normalize.
  const lo = 1 / TUNING.PROJECT_MOD_CLAMP
  const hi = TUNING.PROJECT_MOD_CLAMP
  const weighted: number[] = new Array(keys.length)
  let sum = 0
  for (let i = 0; i < keys.length; i++) {
    const m = clamp(mods[i]!, lo, hi)
    const wv = base[i]! * m
    weighted[i] = wv
    sum += wv
  }
  if (sum <= 0) {
    // Degenerate guard (never expected with positive base weights): uniform.
    return new Array(keys.length).fill(1 / keys.length)
  }
  for (let i = 0; i < keys.length; i++) weighted[i]! /= sum
  return weighted
}

// ── D-9.9 Genre experience accessor ─────────────────────────────────────────────

// genreExperience(talent, discipline, genre, use): 0..100, or 0 if absent.
export function genreExperience(
  talent: Talent,
  discipline: Discipline,
  genre: Genre,
  use: SkillUse,
): number {
  const disc = talent.genreExperience[discipline]
  if (disc === undefined) return 0
  const entry = disc[genre]
  if (entry === undefined) return 0
  return entry[use]
}

// workHistoryCount(talent, discipline): completed productions in that discipline
// this run (D-9.9). 0 → "Unproven in this role."
export function workHistoryCount(talent: Talent, discipline: Discipline): number {
  return talent.workHistory[discipline] ?? 0
}

// ── D-9.5 Effective skill (the §5/§7 substitute) ────────────────────────────────

// effectiveSkill(talent, discipline, concept, slot?, shapeEffects, promise, use) ∈ [0,100].
// use = 'actual' (reception §5) | 'perceived' (forecast §7). This is the ONLY
// ability quantity the sim reads. Stays in [0,100] → D-9.0 invariant holds.
export function effectiveSkill(
  talent: Talent,
  discipline: Discipline,
  concept: FilmConcept,
  slot: CastSlot | undefined,
  shapeEffects: ShapeEffects,
  promise: FilmPromise,
  use: SkillUse,
  shape?: FilmShape,
): number {
  const w = projectSkillWeights(discipline, concept, slot, shapeEffects, promise, shape)
  const skills = skillVector(talent, discipline, use)
  let base = 0
  for (let i = 0; i < skills.length; i++) base += w[i]! * skills[i]!

  const exp = genreExperience(talent, discipline, concept.genre, use)
  const expBonus = TUNING.EXP_SKILL_CAP * smoothstep(0, 100, exp)

  return clamp(base + expBonus, 0, 100)
}

// ── D-9.6 Project Fit (perceived only; display) ─────────────────────────────────

// promiseTargetPersona(promise): map range midpoints back into persona axes
// (warmth ← iMid, gravity ← tMid, physicality ← kMid) (D-9.6).
function promiseTargetPersona(promise: FilmPromise): Persona {
  return {
    warmth: midpoint(promise.ranges.intimacy),
    gravity: midpoint(promise.ranges.tonalWeight),
    physicality: midpoint(promise.ranges.kineticEnergy),
  }
}

// temperamentMatch(talent, promise): 1 − clamp(personaDistance/TOLERANCE, 0, 1).
function temperamentMatch(talent: Talent, promise: FilmPromise): number {
  return (
    1 -
    clamp(
      personaDistance(talent.actual, promiseTargetPersona(promise)) / TUNING.TEMPER_TOLERANCE,
      0,
      1,
    )
  )
}

// roleFit for actors: 1 − clamp(personaDistance(actual, req.target)/tolerance, 0, 1).
// (Duplicated here to keep talentSummary independent of reception; identical rule.)
function actorRoleFit(talent: Talent, req: RoleRequirement): number {
  return 1 - clamp(personaDistance(talent.actual, req.target) / req.tolerance, 0, 1)
}

// Casting Sessions V1 shares this exact role-execution primitive with forecast
// and reception. Ability follows `use`; role fit deliberately continues to read
// actual persona in both paths, preserving the established simulation law.
export function castSlotExecution(
  talent: Talent,
  concept: FilmConcept,
  slot: CastSlot,
  shapeEffects: ShapeEffects,
  promise: FilmPromise,
  use: SkillUse,
  shape?: FilmShape,
): number {
  const ability = effectiveSkill(
    talent,
    'acting',
    concept,
    slot,
    shapeEffects,
    promise,
    use,
    shape,
  )
  return 0.6 * ability + 0.4 * 100 * actorRoleFit(talent, concept.roleRequirements[slot])
}

// projectFit(talent, discipline, concept, slot?, shapeEffects, promise): 0..100.
// Display only; the sim never reads it. Ability share ≥ 0.45 (never erased).
export function projectFit(
  talent: Talent,
  discipline: Discipline,
  concept: FilmConcept,
  slot: CastSlot | undefined,
  shapeEffects: ShapeEffects,
  promise: FilmPromise,
  shape?: FilmShape,
): number {
  const effP = effectiveSkill(
    talent,
    discipline,
    concept,
    slot,
    shapeEffects,
    promise,
    'perceived',
    shape,
  )
  const expShare = genreExperience(talent, discipline, concept.genre, 'perceived') / 100

  if (discipline === 'acting') {
    const req = slot !== undefined ? concept.roleRequirements[slot] : undefined
    const fit = req !== undefined ? actorRoleFit(talent, req) : 0
    return (
      100 *
      clamp(
        TUNING.FIT_ACTOR_ABILITY * (effP / 100) +
          TUNING.FIT_ACTOR_ROLEFIT * fit +
          TUNING.FIT_ACTOR_EXP * expShare,
        0,
        1,
      )
    )
  }

  if (discipline === 'craft') {
    return (
      100 *
      clamp(TUNING.FIT_CRAFT_ABILITY * (effP / 100) + TUNING.FIT_CRAFT_EXP * expShare, 0, 1)
    )
  }

  // writer / director: temperament enters weakly via the promise-target persona.
  const temper = temperamentMatch(talent, promise)
  return (
    100 *
    clamp(
      TUNING.FIT_CREW_ABILITY * (effP / 100) +
        TUNING.FIT_CREW_TEMPER * temper +
        TUNING.FIT_CREW_EXP * expShare,
      0,
      1,
    )
  )
}

// ── D-9.7 Expected Performance band (display) ───────────────────────────────────

export type PerformanceBand = { low: number; high: number; expected: number }

export function expectedPerformance(
  talent: Talent,
  discipline: Discipline,
  concept: FilmConcept,
  slot: CastSlot | undefined,
  shapeEffects: ShapeEffects,
  promise: FilmPromise,
  shape?: FilmShape,
): PerformanceBand {
  const center = effectiveSkill(
    talent,
    discipline,
    concept,
    slot,
    shapeEffects,
    promise,
    'perceived',
    shape,
  )
  const expPerceived = genreExperience(talent, discipline, concept.genre, 'perceived')
  const unproven = workHistoryCount(talent, discipline) === 0 ? 1 : 0
  const uncertainty =
    TUNING.EP_BASE_WIDTH +
    TUNING.EP_EXP_WIDTH * (1 - smoothstep(0, 100, expPerceived)) +
    TUNING.EP_UNPROVEN_WIDTH * unproven
  return {
    low: clamp(center - uncertainty, 0, 100),
    high: clamp(center + uncertainty, 0, 100),
    expected: center,
  }
}

// ── D-9.8 Creative Temperament summary (display; pure function of persona) ──────

// Bucket a persona-axis value ∈ [−1,1] into one of five bands by TEMPER_BANDS.
function bandIndex(value: number): number {
  const t = TEMPER_BANDS.thresholds
  if (value <= t[0]) return 0
  if (value <= t[1]) return 1
  if (value <= t[2]) return 2
  if (value <= t[3]) return 3
  return 4
}

// temperamentSummary(persona): a fixed sentence template over the three band words.
export function temperamentSummary(persona: Persona): string {
  const warmthWord = TEMPER_BANDS.warmth[bandIndex(persona.warmth)]
  const gravityWord = TEMPER_BANDS.gravity[bandIndex(persona.gravity)]
  const physicalityWord = TEMPER_BANDS.physicality[bandIndex(persona.physicality)]
  return `${gravityWord}, ${warmthWord} presence with ${physicalityWord} energy.`
}

// ── D-9.10 Potential (visible noisy estimate; never exposes the true ceiling) ──

// tierOf(upside): the label for an OVR-headroom above current (D-9.10).
function tierOf(upside: number): string {
  const T = POTENTIAL_TIER_THRESHOLDS
  if (upside < T.steady) return 'Limited'
  if (upside < T.promising) return 'Steady'
  if (upside < T.highUpside) return 'Promising'
  if (upside < T.exceptionalUpside) return 'High Upside'
  return 'Exceptional Upside'
}

// ceilingOVR: roleOVR-style summary computed on the CEILINGS (true hidden potential).
function ceilingOVR(talent: Talent, discipline: Discipline): number {
  return ovrCore(ceilingVector(talent, discipline), discipline)
}

// The noisy scouted estimate, deterministic per (seed, talent, discipline). The
// noise (POTENTIAL_SCOUT_SIGMA) can land above or below the truth; the band is
// centered on the estimate, never on the true ceilingOVR.
function scoutedEstOVR(talent: Talent, discipline: Discipline, seed: string): number {
  const cOVR = ceilingOVR(talent, discipline)
  const currentOVR = roleOVR(talent, discipline)
  const noise = stream(seed, 'worldgen', `scout-${talent.id}-${discipline}`).gaussian(
    0,
    TUNING.POTENTIAL_SCOUT_SIGMA,
  )
  return clamp(cOVR + noise, currentOVR, 99)
}

// expectedPotentialTier(talent, discipline, seed): the visible tier label. Authored
// talent may show 'Generational Upside' (its stored ceilings can exceed the
// worldgen distribution); worldgen talent tops out at 'Exceptional Upside'.
export function expectedPotentialTier(talent: Talent, discipline: Discipline, seed: string): string {
  const estOVR = scoutedEstOVR(talent, discipline, seed)
  const currentOVR = roleOVR(talent, discipline)
  const base = tierOf(estOVR - currentOVR)
  if (
    talent.authored &&
    base === 'Exceptional Upside' &&
    estOVR - currentOVR >= POTENTIAL_TIER_THRESHOLDS.exceptionalUpside + 8
  ) {
    return 'Generational Upside'
  }
  return base
}

// expectedPotentialRange(talent, discipline, seed): the OVR band shown to the
// player, centered on the noisy estimate ± POTENTIAL_BAND_HALF (D-9.10).
export function expectedPotentialRange(
  talent: Talent,
  discipline: Discipline,
  seed: string,
): { low: number; high: number } {
  const estOVR = scoutedEstOVR(talent, discipline, seed)
  return {
    low: clamp(Math.round(estOVR - TUNING.POTENTIAL_BAND_HALF), 1, 99),
    high: clamp(Math.round(estOVR + TUNING.POTENTIAL_BAND_HALF), 1, 99),
  }
}

// ── D-9.11 Work Ethic label (display) ───────────────────────────────────────────

export function workEthicLabel(workEthic: number): string {
  if (workEthic <= 29) return 'Poor'
  if (workEthic <= 49) return 'Inconsistent'
  if (workEthic <= 69) return 'Professional'
  if (workEthic <= 84) return 'Driven'
  if (workEthic <= 94) return 'Exceptional'
  return 'Relentless'
}

// ── RULING B (2026-07-26) — Capability vs Career Identity (read-only summary) ───
// Distinguishes CAPABILITY (what the talent COULD do — a broad, usable OVR) from
// CAREER IDENTITY (what they have DEMONSTRABLY done — a usable OVR PLUS a real
// credit). A discipline with roleOVR ≥ CAPABILITY_OVR_MIN but workHistory == 0 is
// "Capable but Unproven"; it joins the career identity (e.g. "Actor / Writer") only
// once there is a demonstrated credit (workHistory > 0) at a usable OVR. No credits
// are fabricated — the identity reads only real workHistory counters.
export type DisciplineStanding = {
  discipline: Discipline
  ovr: number
  workHistory: number // completed productions in this discipline this run
  capable: boolean // ovr ≥ CAPABILITY_OVR_MIN (could do the job well)
  proven: boolean // has ≥1 demonstrated credit at a usable OVR (part of the identity)
  capableButUnproven: boolean // capable AND workHistory == 0 (the "Capable but Unproven" flag)
}

export type CareerIdentity = {
  primary: Discipline // the talent's PRIMARY profession (role → discipline)
  // every discipline the talent is a PROVEN part of, in DISCIPLINE_ORDER: usable OVR
  // with ≥1 real credit. The primary is included only if it too has a credit.
  identityDisciplines: Discipline[]
  // capable disciplines with NO credit yet (the "Capable but Unproven" set).
  capableButUnprovenDisciplines: Discipline[]
  // the full per-discipline breakdown (all four), in DISCIPLINE_ORDER, for the UI.
  disciplines: DisciplineStanding[]
}

// careerIdentity(talent): the read-only capability/identity breakdown. Pure; OVR is
// on perceived skills (the displayed OVR). The sim never reads this.
export function careerIdentity(talent: Talent): CareerIdentity {
  const primary = ROLE_TO_DISCIPLINE[talent.role]
  const disciplines: DisciplineStanding[] = []
  const identityDisciplines: Discipline[] = []
  const capableButUnprovenDisciplines: Discipline[] = []

  for (const d of DISCIPLINE_ORDER) {
    const ovr = roleOVR(talent, d)
    const wh = workHistoryCount(talent, d)
    const capable = ovr >= TUNING.CAPABILITY_OVR_MIN
    const proven = capable && wh > 0
    const capableButUnproven = capable && wh === 0
    disciplines.push({ discipline: d, ovr, workHistory: wh, capable, proven, capableButUnproven })
    if (proven) identityDisciplines.push(d)
    if (capableButUnproven) capableButUnprovenDisciplines.push(d)
  }

  return { primary, identityDisciplines, capableButUnprovenDisciplines, disciplines }
}

// ── D-9.8 Development report (pure formatter over before/after talent) ──────────

// Human-friendly skill/discipline names for the report (display only).
const SKILL_LABELS: Record<string, string> = {
  actingTechnique: 'Acting Technique',
  emotionalRange: 'Emotional Range',
  dialogueDelivery: 'Dialogue Delivery',
  comicTiming: 'Comic Timing',
  physicalPerformance: 'Physical Performance',
  screenPresence: 'Screen Presence',
  storyStructure: 'Story Structure',
  characterDevelopment: 'Character Development',
  dialogue: 'Dialogue',
  originality: 'Originality',
  narrativePacing: 'Narrative Pacing',
  rewriting: 'Rewriting',
  visualStorytelling: 'Visual Storytelling',
  performanceDirection: 'Performance Direction',
  toneControl: 'Tone Control',
  directingPacing: 'Directing Pacing',
  productionManagement: 'Production Management',
  adaptability: 'Adaptability',
  cinematography: 'Cinematography',
  editing: 'Editing',
  productionDesign: 'Production Design',
  soundAndMusic: 'Sound and Music',
  effectsExecution: 'Effects Execution',
  technicalCoordination: 'Technical Coordination',
}

const DISCIPLINE_LABELS: Record<Discipline, string> = {
  acting: 'Actor',
  writing: 'Writer',
  directing: 'Director',
  craft: 'Craft',
}

const GENRE_LABELS: Record<Genre, string> = {
  comedy: 'Comedy',
  drama: 'Drama',
  crime: 'Crime',
  romance: 'Romance',
  horror: 'Horror',
  adventure: 'Adventure',
}

// developmentReport(before, after): per-skill rises, role-OVR changes, and genre
// experience gains for one talent. If nothing rose → "No measurable skill increase."
export function developmentReport(before: Talent, after: Talent): string[] {
  const lines: string[] = []
  const disciplines = ['acting', 'writing', 'directing', 'craft'] as const

  for (const d of disciplines) {
    const keys = SKILL_ORDER[d]
    // Per-skill rises.
    for (const key of keys) {
      const b = before.skills[d][key]!.actual
      const a = after.skills[d][key]!.actual
      if (a > b) lines.push(`${SKILL_LABELS[key] ?? key} +${a - b}`)
    }
    // Role-OVR change (over perceived, the displayed OVR).
    const bOVR = roleOVR(before, d)
    const aOVR = roleOVR(after, d)
    if (aOVR !== bOVR) lines.push(`${DISCIPLINE_LABELS[d]} OVR ${bOVR} → ${aOVR}`)
    // Genre experience gains.
    for (const g of Object.keys(GENRE_LABELS) as Genre[]) {
      const bExp = before.genreExperience[d]?.[g]?.actual ?? 0
      const aExp = after.genreExperience[d]?.[g]?.actual ?? 0
      const delta = Math.round(aExp) - Math.round(bExp)
      if (delta > 0) lines.push(`${GENRE_LABELS[g]} ${DISCIPLINE_LABELS[d].toLowerCase()} experience +${delta}`)
    }
  }

  if (lines.length === 0) return ['No measurable skill increase.']
  return lines
}

// ── D-9.8 age runway multiplier (shared by generation headroom + development) ──
// Decreasing, always-positive: 1.0 at age ≤ YOUNG, → AGE_FLOOR at age ≥ OLD.
export function ageRunwayMult(age: number): number {
  return (
    TUNING.DEV_AGE_FLOOR +
    (1 - TUNING.DEV_AGE_FLOOR) * (1 - smoothstep(TUNING.DEV_AGE_YOUNG, TUNING.DEV_AGE_OLD, age))
  )
}
