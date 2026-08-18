// ── §9 World generation (rev. 4) ─────────────────────────────────────────────
// Pure, deterministic `seed → GameState`. Given the same seed string, this
// module produces byte-identical state every time (§15.7). It draws randomness
// ONLY from the derived 'worldgen' substream via `stream(seed, 'worldgen', key)`
// (rng.ts); it never touches or advances the sim stream nor the
// 'candidates' / 'agent' / 'forecast' streams.
//
// Purity: no React/DOM/async/I/O; no unseeded RNG, no `Date`/time, no UUIDs, no
// OS entropy, no filesystem enumeration. Word lists are static TS imports consumed
// in declared array order (data/wordlists.ts). Every `Record` below is built in a
// fixed declared field order so `Object.keys(...)` iteration (which reception /
// forecast rely on) is stable.
//
// ── Determinism scheme (delegated engineering choice — documented, not escalated)
//
// STREAM KEYING: one keyed substream PER ASPECT, so each aspect's draw sequence is
// independent of how many draws every other aspect made. Each stream is consumed in
// a FIXED, DOCUMENTED field-draw order; the entity index is NOT folded into the key
// (a single stream per aspect is walked once per entity in generation order). Keys:
//
//   talent-persona      : per talent i, in id order, draws
//                           actual.warmth, actual.gravity, actual.physicality,
//                           perceived-noise warmth, perceived-noise gravity,
//                           perceived-noise physicality      (6 draws → 3 gaussians)
//   talent-skill        : per talent i, one truncatedNormal
//   talent-fame         : per talent i, one truncatedNormal
//   talent-age          : per talent i, one truncatedNormal
//   talent-name         : per talent i, two uniforms (first-name idx, last-name idx)
//   concept-genre       : per concept j, one uniform (genre idx)
//   concept-strength    : per concept j, one truncatedNormal (baselineStrength)
//   concept-originality  : per concept j, one truncatedNormal (originalityRaw)
//   concept-cost        : per concept j, one truncatedNormal (baseNegativeCost)
//   concept-roles       : per concept j, per slot in [lead, antagonist, support]:
//                           target.warmth, target.gravity, target.physicality (uniform),
//                           tolerance (uniform)             (4 draws/slot → 12/concept)
//   concept-title       : per concept j, two uniforms (lead idx, noun idx)
//   market              : one uniform (baseMarketValue)
//
// Talent generation ORDER (the "generation order" the ids and per-entity draw
// sequence follow) is the role split laid out end to end: 12 writers, then 10
// directors, then 28 actors, then 10 craft (B9). Talent i (0-based) draws its
// fields from every talent-* stream on its i-th visit.
//
// ID SCHEME: role/type-prefixed, zero-padded decimal index in generation order.
//   talent : `t-<role3>-NN`  e.g. t-wri-00 … t-wri-11, t-dir-00 …, t-act-00 …, t-cra-00 …
//   concept: `c-NN`          e.g. c-00 … c-29
// Index is per-role-block for talent (resets at each role block) and global for
// concepts. Zero-padded to 2 digits (max block is 28 actors → indices 00..27).
// Ids are unique by construction; names/titles may collide harmlessly (id is key).

import { clamp } from './math.js'
import { emptyCastingSessions } from './castingSessions.js'
import { emptyStudioConstruction } from './construction.js'
import { emptyStudioPlacement } from './placement.js'
import { initialProperty } from './lot.js'
import { emptyStudioOperations } from './operations.js'
import { emptyScriptDevelopment } from './scriptDevelopment.js'
import { emptyStudioEventLog } from './studioEvents.js'
import { stream } from './rng.js'
import { RngStream } from './rng.js'
import {
  DISCIPLINE_ORDER,
  GEN_ADJACENCY,
  GEN_ARCHETYPE_MIX,
  GEN_SECONDARY_BANDS,
  GENRE_ORDER as GENRE_ORDER_D9,
  INITIAL_STANDING,
  ROLE_TO_DISCIPLINE,
  SKILL_ORDER,
  TUNING,
  WORLD_CONFIG,
} from './tuning.js'
import { ageRunwayMult, roleOVR } from './talentSummary.js'
import { emptyPublicityState } from './save.js'
import type {
  CastSlot,
  Ceilings,
  CulturalForce,
  DevRates,
  Discipline,
  DisciplineSkills,
  EraConfig,
  FilmConcept,
  GameState,
  Genre,
  GenreExperience,
  MarketState,
  Persona,
  RoleRequirement,
  Segment,
  SegmentId,
  SkillProfiles,
  Studio,
  Talent,
  WorkHistory,
} from './types.js'
import {
  FIRST_NAMES,
  LAST_NAMES,
  TITLE_LEAD,
  TITLE_NOUN,
} from './data/wordlists.js'

// ── Fixed declared orders (drive Record insertion + array iteration) ─────────

// §5.3 / reception & forecast iterate Object.keys(forces); this insertion order
// is the contract's canonical force order and MUST be this sequence.
const FORCE_ORDER: readonly CulturalForce[] = [
  'escapism',
  'patriotism',
  'realism',
  'darkness',
  'optimism',
  'spectacle',
] as const

// M4 — the six genres, in fixed order, indexed uniformly.
const GENRE_ORDER: readonly Genre[] = [
  'comedy',
  'drama',
  'crime',
  'romance',
  'horror',
  'adventure',
] as const

// B11 — every concept always gets exactly these three slots, in this order.
const SLOT_ORDER: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

// D-5 — segment order + shares (shares sum to 1); taste = TUNING.SEGMENT_TASTES[id].
const SEGMENT_ORDER: readonly { id: SegmentId; share: number }[] = [
  { id: 'youngAdult', share: 0.3 },
  { id: 'family', share: 0.25 },
  { id: 'adult', share: 0.3 },
  { id: 'prestige', share: 0.15 },
] as const

// B9 — role split, laid out in generation order. `prefix` is the 3-letter id tag.
const ROLE_BLOCKS: readonly { role: Talent['role']; prefix: string; count: number }[] = [
  { role: 'writer', prefix: 'wri', count: 12 },
  { role: 'director', prefix: 'dir', count: 10 },
  { role: 'actor', prefix: 'act', count: 28 },
  { role: 'craft', prefix: 'cra', count: 10 },
] as const

// ── B7 / D-9.13 salaryCurve ────────────────────────────────────────────────────
// D-9 redefines salary to come from professional ability (primary-discipline OVR,
// perceived) + star power (fame), kept convex/fame-dominant like B7 so D-1's ledger
// and M0A economics stay sane. The SALARY_* constants keep their B7 values; the ONLY
// change is `skill → primaryOVR`. Signature is now salaryCurve(talent) (D-9.13);
// callers (worldgen, actions authored) updated accordingly.
//
//   primaryOVR = roleOVR(talent, primaryDiscipline)   // 1..99, perceived
//   salary = SALARY_BASE + SALARY_SKILL_COEF·(primaryOVR/100)² + SALARY_FAME_COEF·(fame/100)²
export function salaryCurve(talent: Talent): number {
  const primaryDiscipline = ROLE_TO_DISCIPLINE[talent.role]
  const primaryOVR = roleOVR(talent, primaryDiscipline)
  const s = primaryOVR / 100
  const f = talent.fame / 100
  return TUNING.SALARY_BASE + TUNING.SALARY_SKILL_COEF * s * s + TUNING.SALARY_FAME_COEF * f * f
}

// Zero-pad an index to 2 digits (max generated block/global index is < 100).
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

// ── D-9 shared talent-record scaffolding (used by generation; migration/authored
// build their own records with the same fixed key order) ─────────────────────

const iround = (x: number): number => Math.round(x)

// Build a DisciplineSkills record for one discipline from six actual values +
// a perceived-noise stream, in SKILL_ORDER. actual/perceived clamped 1..99.
function buildDisciplineSkills(
  discipline: Discipline,
  actuals: number[],
  perceivedS: RngStream,
  perceivedSD: number,
): DisciplineSkills {
  const keys = SKILL_ORDER[discipline]
  const out: DisciplineSkills = {}
  for (let i = 0; i < keys.length; i++) {
    const a = clamp(iround(actuals[i]!), 1, 99)
    const p = clamp(iround(a + perceivedS.gaussian(0, perceivedSD)), 1, 99)
    out[keys[i]!] = { actual: a, perceived: p }
  }
  return out
}

// Draw the six primary-discipline actual skill values (D-9.13 step 3): each
// ~ round(clamp(μ + N(0, SPREAD), 1, 99)); with prob SPECIALIST_P, spike one skill
// and sag two others (a peaked specialist profile with real weaknesses).
function drawDisciplineActuals(mu: number, skillS: RngStream, specialistS: RngStream): number[] {
  const raw: number[] = new Array(6)
  for (let i = 0; i < 6; i++) {
    raw[i] = clamp(mu + skillS.gaussian(0, TUNING.GEN_SKILL_SPREAD), 1, 99)
  }
  if (specialistS.next() < TUNING.GEN_SPECIALIST_P) {
    const spikeIdx = Math.floor(specialistS.next() * 6)
    const spike = specialistS.uniform(TUNING.GEN_SPECIALIST_SPIKE[0], TUNING.GEN_SPECIALIST_SPIKE[1])
    raw[spikeIdx] = clamp(raw[spikeIdx]! + spike, 1, 99)
    // sag two OTHER skills (fixed order: the two lowest-indexed indices ≠ spikeIdx)
    let sagged = 0
    for (let i = 0; i < 6 && sagged < 2; i++) {
      if (i === spikeIdx) continue
      const sag = specialistS.uniform(TUNING.GEN_SPECIALIST_SAG[0], TUNING.GEN_SPECIALIST_SAG[1])
      raw[i] = clamp(raw[i]! - sag, 1, 99)
      sagged++
    }
  }
  return raw
}

// RULING B archetype tags (frequencies in GEN_ARCHETYPE_MIX). The number of usable
// secondaries per archetype and the skill-center band used for them are fixed here.
type Archetype = 'ordinary' | 'adjacent' | 'prospect' | 'established' | 'triple'
const ARCHETYPE_ORDER: readonly Archetype[] = [
  'ordinary',
  'adjacent',
  'prospect',
  'established',
  'triple',
] as const
// How many usable secondaries each archetype grants.
const ARCHETYPE_USABLE: Record<Archetype, number> = {
  ordinary: 0,
  adjacent: 1,
  prospect: 1,
  established: 2,
  triple: 3,
}
// Which GEN_SECONDARY_BANDS band each usable-secondary archetype draws its center from.
const ARCHETYPE_BAND: Record<
  Exclude<Archetype, 'ordinary'>,
  keyof typeof GEN_SECONDARY_BANDS
> = {
  adjacent: 'adjacent',
  prospect: 'prospect',
  established: 'established',
  triple: 'triple',
}

// Select the archetype from a single [0,1) roll over the cumulative mixture (fixed
// ARCHETYPE_ORDER). Deterministic; the roll is the first 'talent-secondary' draw.
function selectArchetype(roll: number): Archetype {
  let acc = 0
  for (const a of ARCHETYPE_ORDER) {
    acc += GEN_ARCHETYPE_MIX[a]
    if (roll < acc) return a
  }
  return 'ordinary' // numerical-guard fallback (mix sums to 1)
}

// Pick one usable-secondary discipline by GEN_ADJACENCY weight over the still-
// available non-primary disciplines (a modest tendency, not a rule). One draw.
function pickAdjacentDiscipline(
  primary: Discipline,
  taken: readonly Discipline[],
  roll: number,
): Discipline {
  const candidates = DISCIPLINE_ORDER.filter((d) => d !== primary && !taken.includes(d))
  const weights = candidates.map((d) => GEN_ADJACENCY[primary][d] ?? 0.1)
  const total = weights.reduce((a, b) => a + b, 0)
  let r = roll * total
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]!
    if (r <= 0) return candidates[i]!
  }
  return candidates[candidates.length - 1]!
}

// Draw a weak-discipline 6-vector of actuals at μ_weak ~ truncatedNormal.
function drawWeakActuals(skillS: RngStream): number[] {
  const arr: number[] = new Array(6)
  for (let i = 0; i < 6; i++) {
    arr[i] = skillS.truncatedNormal(
      TUNING.GEN_WEAK_MEAN,
      TUNING.GEN_WEAK_SD,
      TUNING.GEN_WEAK_LO,
      TUNING.GEN_WEAK_HI,
    )
  }
  return arr
}

// Build the full 4-discipline SkillProfiles (D-9.13 steps 3–5, RULING B mixture).
// Primary at μ_primary (UNCHANGED distribution). Non-primary disciplines follow the
// archetype mixture: 0–3 "usable" secondaries at genuinely strong, broad centers
// (GEN_SECONDARY_BANDS, adjacency-weighted by GEN_ADJACENCY), the rest weak. The SAME
// roleOVR applies to every discipline — there is NO secondary-discipline OVR bonus;
// a usable secondary reads OVR ≥ 60 only when its generated SKILLS genuinely clear
// the weakness/breadth penalties.
//
// 'talent-secondary' draw order (fixed, documented): (1) one archetype roll; (2) one
// adjacency pick per usable secondary (in usable-slot order); (3) one center-jitter
// gaussian per usable discipline, walked in DISCIPLINE_ORDER (2 uniforms each). The
// skill actuals themselves still come from streams.skillS/specialistS in DISCIPLINE_ORDER
// (unchanged), so the primary draw sequence is byte-identical to before for the
// primary discipline.
function buildSkillProfiles(
  primary: Discipline,
  muPrimary: number,
  streams: {
    skillS: RngStream
    specialistS: RngStream
    secondaryS: RngStream
    perceivedS: RngStream
  },
): { skills: SkillProfiles; secondary: Discipline | null } {
  // (1) Archetype selection — the FIRST 'talent-secondary' draw.
  const archetype = selectArchetype(streams.secondaryS.next())
  const nUsable = ARCHETYPE_USABLE[archetype]

  // (2) Pick the usable secondary disciplines (adjacency-weighted, no duplicates).
  const usable: Discipline[] = []
  for (let n = 0; n < nUsable; n++) {
    usable.push(pickAdjacentDiscipline(primary, usable, streams.secondaryS.next()))
  }

  // (3) Center jitter per usable discipline, in DISCIPLINE_ORDER (stable). μ_sec =
  // clamp(c + corr·(μ_primary − 60) + N(0, sd), floor, cap). Modest primary-strength
  // correlation. Non-usable disciplines draw no jitter here.
  const muUsable = {} as Partial<Record<Discipline, number>>
  if (archetype !== 'ordinary') {
    const band = GEN_SECONDARY_BANDS[ARCHETYPE_BAND[archetype]]
    for (const d of DISCIPLINE_ORDER) {
      if (!usable.includes(d)) continue
      const jitter = streams.secondaryS.gaussian(0, band.sd)
      muUsable[d] = clamp(band.c + band.corr * (muPrimary - 60) + jitter, band.floor, band.cap)
    }
  }

  // Build each discipline's actuals, in DISCIPLINE_ORDER for stable draw order.
  const actualsByDiscipline = {} as Record<Discipline, number[]>
  for (const d of DISCIPLINE_ORDER) {
    if (d === primary) {
      actualsByDiscipline[d] = drawDisciplineActuals(muPrimary, streams.skillS, streams.specialistS)
    } else if (usable.includes(d)) {
      actualsByDiscipline[d] = drawDisciplineActuals(muUsable[d]!, streams.skillS, streams.specialistS)
    } else {
      actualsByDiscipline[d] = drawWeakActuals(streams.skillS)
    }
  }

  // Perceived skills (D-9.13 step 5), in DISCIPLINE_ORDER.
  const skills = {} as SkillProfiles
  for (const d of DISCIPLINE_ORDER) {
    skills[d] = buildDisciplineSkills(
      d,
      actualsByDiscipline[d],
      streams.perceivedS,
      TUNING.GEN_PERCEIVED_SD,
    )
  }
  // Report the PRIMARY usable secondary (highest-priority pick) for legacy callers;
  // null when ordinary. (Not consumed by the sim; kept for the return shape.)
  return { skills, secondary: usable.length > 0 ? usable[0]! : null }
}

// Build the hidden per-skill ceilings (D-9.13 step 6): ceiling = clamp(round(actual
// + headroom·ageRunwayMult(age)), actual, 99). Younger → more runway.
function buildCeilings(skills: SkillProfiles, age: number, headroomS: RngStream): Ceilings {
  const runway = ageRunwayMult(age)
  const out = {} as Ceilings
  for (const d of DISCIPLINE_ORDER) {
    const keys = SKILL_ORDER[d]
    const rec: Record<string, number> = {}
    for (const key of keys) {
      const a = skills[d][key]!.actual
      const headroom =
        headroomS.truncatedNormal(
          TUNING.GEN_HEADROOM_MEAN,
          TUNING.GEN_HEADROOM_SD,
          TUNING.GEN_HEADROOM_LO,
          TUNING.GEN_HEADROOM_HI,
        ) * runway
      rec[key] = clamp(iround(a + headroom), a, 99)
    }
    out[d] = rec
  }
  return out
}

// Build starting genre experience (D-9.13 step 11): primary (discipline,genre)
// pairs seeded small (scaled by age); secondary/weak disciplines start at 0.
function buildGenreExperience(
  primary: Discipline,
  age: number,
  expS: RngStream,
): GenreExperience {
  // expAgeMult: older talent gets slightly more starting experience (bounded).
  const expAgeMult = clamp(0.6 + (age - 20) / 60, 0.6, 1.4)
  const out = {} as GenreExperience
  for (const d of DISCIPLINE_ORDER) {
    const rec = {} as Record<Genre, { actual: number; perceived: number }>
    for (const g of GENRE_ORDER_D9) {
      if (d === primary) {
        const a = clamp(
          iround(
            expS.truncatedNormal(TUNING.GEN_EXP_MEAN, TUNING.GEN_EXP_SD, TUNING.GEN_EXP_LO, TUNING.GEN_EXP_HI) *
              expAgeMult,
          ),
          0,
          100,
        )
        const p = clamp(iround(a + expS.gaussian(0, TUNING.GEN_EXP_PERCEIVED_SD)), 0, 100)
        rec[g] = { actual: a, perceived: p }
      } else {
        rec[g] = { actual: 0, perceived: 0 }
      }
    }
    out[d] = rec
  }
  return out
}

// Build per-discipline dev rates (D-9.13 step 8): independent uniform draws.
function buildDevRates(devRateS: RngStream): DevRates {
  const out = {} as DevRates
  for (const d of DISCIPLINE_ORDER) {
    out[d] = clamp(devRateS.uniform(TUNING.DEV_RATE_MIN, TUNING.DEV_RATE_MAX), TUNING.DEV_RATE_MIN, TUNING.DEV_RATE_MAX)
  }
  return out
}

// All-zero work-history counters (D-9.9), in DISCIPLINE_ORDER.
function zeroWorkHistory(): WorkHistory {
  const out = {} as WorkHistory
  for (const d of DISCIPLINE_ORDER) out[d] = 0
  return out
}

// ── Talent generation (§9, B9, D-9.13, N3) ───────────────────────────────────
function generateTalent(seed: string): Talent[] {
  const persona = stream(seed, 'worldgen', 'talent-persona')
  const skillS = stream(seed, 'worldgen', 'talent-skill') // primary center μ_primary (unchanged distribution)
  const fameS = stream(seed, 'worldgen', 'talent-fame')
  const ageS = stream(seed, 'worldgen', 'talent-age')
  const nameS = stream(seed, 'worldgen', 'talent-name')

  // D-9.13 new substreams (one per aspect, walked once per talent in gen order).
  const profileS = stream(seed, 'worldgen', 'talent-skillprofile')
  const specialistS = stream(seed, 'worldgen', 'talent-skillprofile-spec')
  const secondaryS = stream(seed, 'worldgen', 'talent-secondary')
  const perceivedS = stream(seed, 'worldgen', 'talent-skillprofile-perceived')
  const ceilingsS = stream(seed, 'worldgen', 'talent-ceilings')
  const workethicS = stream(seed, 'worldgen', 'talent-workethic')
  const devrateS = stream(seed, 'worldgen', 'talent-devrate')
  const genreexpS = stream(seed, 'worldgen', 'talent-genreexp')

  const talent: Talent[] = []
  for (const block of ROLE_BLOCKS) {
    for (let idx = 0; idx < block.count; idx++) {
      // persona: actual axes ~ uniform(-1,1); perceived = clamp(actual + N(0,0.25), -1, 1)
      const actual: Persona = {
        warmth: persona.uniform(-1, 1),
        gravity: persona.uniform(-1, 1),
        physicality: persona.uniform(-1, 1),
      }
      const perceived: Persona = {
        warmth: clamp(actual.warmth + persona.gaussian(0, 0.25), -1, 1),
        gravity: clamp(actual.gravity + persona.gaussian(0, 0.25), -1, 1),
        physicality: clamp(actual.physicality + persona.gaussian(0, 0.25), -1, 1),
      }

      // D-9.13 step 2 — primary skill center from the SAME distribution the old
      // scalar `talent-skill` used (preserves primary-ability center for D-6).
      const muPrimary = skillS.truncatedNormal(
        TUNING.GEN_SKILL_MEAN,
        TUNING.GEN_SKILL_SD,
        TUNING.GEN_SKILL_LO,
        TUNING.GEN_SKILL_HI,
      )
      const fame = fameS.truncatedNormal(40, 22, 0, 95)
      const age = ageS.truncatedNormal(38, 10, 20, 70)

      const primaryDiscipline = ROLE_TO_DISCIPLINE[block.role]

      // Steps 3–5: skill profiles (primary + secondary + weak; perceived split).
      const { skills } = buildSkillProfiles(primaryDiscipline, muPrimary, {
        skillS: profileS,
        specialistS,
        secondaryS,
        perceivedS,
      })

      // Step 6: ceilings (age-scaled headroom, ⊥ work ethic).
      const ceilings = buildCeilings(skills, age, ceilingsS)

      // Step 7: work ethic (own stream, ⊥ skills/ceilings/fame).
      const workEthic = clamp(
        iround(workethicS.truncatedNormal(TUNING.GEN_WE_MEAN, TUNING.GEN_WE_SD, 1, 99)),
        1,
        99,
      )

      // Step 8: dev rates (independent per discipline).
      const devRate = buildDevRates(devrateS)

      // Step 11: starting genre experience (primary pairs only, age-scaled).
      const genreExperience = buildGenreExperience(primaryDiscipline, age, genreexpS)

      const first = FIRST_NAMES[Math.floor(nameS.next() * FIRST_NAMES.length)]!
      const last = LAST_NAMES[Math.floor(nameS.next() * LAST_NAMES.length)]!

      // Assemble WITHOUT skill/salary first, then set the legacy proxy + salary
      // from roleOVR on the finished perceived skills (steps 9/12/13).
      const t: Talent = {
        id: `t-${block.prefix}-${pad2(idx)}`,
        name: `${first} ${last}`,
        role: block.role,
        age,
        actual,
        perceived,
        fame,
        salary: 0, // set below
        authored: false,
        skills,
        ceilings,
        devRate,
        workEthic,
        genreExperience,
        workHistory: zeroWorkHistory(),
        skill: 0, // set below
      }
      // Step 12: legacy scalar = roleOVR(primary, perceived) proxy.
      t.skill = roleOVR(t, primaryDiscipline)
      // D-9.13 salary redefinition: salaryCurve(talent).
      t.salary = salaryCurve(t)

      talent.push(t)
    }
  }
  return talent
}

// ── Concept generation (§9, M4, B8, B11, N3) ─────────────────────────────────
function generateConcepts(seed: string): FilmConcept[] {
  const genreS = stream(seed, 'worldgen', 'concept-genre')
  const strengthS = stream(seed, 'worldgen', 'concept-strength')
  const originalityS = stream(seed, 'worldgen', 'concept-originality')
  const costS = stream(seed, 'worldgen', 'concept-cost')
  const rolesS = stream(seed, 'worldgen', 'concept-roles')
  const titleS = stream(seed, 'worldgen', 'concept-title')

  const concepts: FilmConcept[] = []
  for (let j = 0; j < WORLD_CONFIG.conceptCount; j++) {
    const genre = GENRE_ORDER[Math.floor(genreS.next() * GENRE_ORDER.length)]!
    const baselineStrength = strengthS.truncatedNormal(60, 15, 20, 95)
    const originalityRaw = originalityS.truncatedNormal(55, 20, 5, 100)
    // B8 — baseNegativeCost
    const baseNegativeCost = costS.truncatedNormal(4_500_000, 1_500_000, 2_000_000, 9_000_000)

    // roleRequirements built in FIXED slot order (B11): target axes uniform(-1,1),
    // tolerance uniform(0.8, 1.8).
    const roleRequirements = {} as Record<CastSlot, RoleRequirement>
    for (const slot of SLOT_ORDER) {
      const target: Persona = {
        warmth: rolesS.uniform(-1, 1),
        gravity: rolesS.uniform(-1, 1),
        physicality: rolesS.uniform(-1, 1),
      }
      const tolerance = rolesS.uniform(0.8, 1.8)
      roleRequirements[slot] = { target, tolerance }
    }

    const lead = TITLE_LEAD[Math.floor(titleS.next() * TITLE_LEAD.length)]!
    const noun = TITLE_NOUN[Math.floor(titleS.next() * TITLE_NOUN.length)]!

    concepts.push({
      id: `c-${pad2(j)}`,
      title: `${lead} ${noun}`,
      genre,
      baselineStrength,
      originalityRaw,
      baseNegativeCost,
      requiredSlots: [...SLOT_ORDER],
      roleRequirements,
    })
  }
  return concepts
}

// ── Market generation (§9, D-5, N3) ──────────────────────────────────────────
function generateMarket(seed: string): MarketState {
  // forces: all 50, built in FIXED force order (insertion order matters).
  const forces = {} as Record<CulturalForce, number>
  for (const force of FORCE_ORDER) {
    forces[force] = 50
  }

  // segments: fixed order + shares; taste = TUNING.SEGMENT_TASTES[id] (D-5).
  const segments: Segment[] = SEGMENT_ORDER.map(({ id, share }) => ({
    id,
    share,
    taste: TUNING.SEGMENT_TASTES[id],
  }))

  const marketS = stream(seed, 'worldgen', 'market')
  const [lo, hi] = WORLD_CONFIG.marketValueRange
  const baseMarketValue = marketS.uniform(lo, hi)

  return {
    tick: 0,
    forces,
    segments,
    baseMarketValue,
    competingSlate: [],
  }
}

// ── §9 entry point ───────────────────────────────────────────────────────────
export function generateWorld(seed: string): GameState {
  // era (B10): neutral era; the three non-costScale fields are inert data here.
  const era: EraConfig = {
    soundRequired: true,
    televisionCompetition: false,
    censorship: 'none',
    costScale: 1.0,
  }

  // studio (D-1, N3): INITIAL_CASH, INITIAL_STANDING, empty production/library.
  const studio: Studio = {
    cash: TUNING.INITIAL_CASH,
    standing: { ...INITIAL_STANDING },
    activeProductions: [],
    releasedFilms: [],
  }

  return {
    seed,
    // The INITIAL sim-stream state. Worldgen does NOT consume this stream; it
    // draws only from derived 'worldgen' substreams, so this is fromSeed's exact
    // starting state (nothing has advanced it).
    rngState: RngStream.fromSeed(seed).serialize(),
    market: generateMarket(seed),
    era,
    studio,
    talent: generateTalent(seed),
    concepts: generateConcepts(seed),
    broadcastItems: [],
    coverageContexts: [],
    // ── D-11 employment surface — EMPTY here (D-11.0: generateWorld stays
    // employment-free so the headless M0A corpus never engages the gate and stays
    // byte-identical). A PLAYER game opens the founding draft via beginFounding().
    founding: null,
    contracts: [],
    ledger: [],
    freeAgents: [],
    // ── D-12 economy — EMPTY here (gated the same way; the headless corpus never
    // opens a theatrical run, so it stays byte-identical on the single-lump path).
    theatricalRuns: [],
    // ── D-14 career events — EMPTY here (engaged-only; non-engaged never appends).
    careerEvents: [],
    // ── D-17A/R2 engagement fact — FALSE here, and this is the ONLY place it is ever
    // set false. The headless M0A world never engages the economy; a PLAYER game flips
    // it true (monotonically, forever) at beginFounding / the first signContract.
    economyEngagedEver: false,
    // ── D-17B §2/§6 publicity — the EMPTY state (no campaign ever bought). Same shape a
    // V6→V7 migration seeds; a headless/M0A world can never buy one (the action is
    // engaged-only), so this stays empty for the whole acceptance corpus.
    publicity: emptyPublicityState(),
    // Production Operations V1: headless and legacy worlds remain on the exact
    // countdown path until an eligible founded studio explicitly activates it.
    operations: emptyStudioOperations(),
    // Script Projects V1: headless and migrated worlds remain on the exact legacy
    // concept-to-greenlight path until a founded player studio explicitly activates it.
    scriptDevelopment: emptyScriptDevelopment(),
    // Casting Sessions V1: headless worlds carry an explicit legacy-empty surface.
    // Player activation is governed separately after founding.
    castingSessions: emptyCastingSessions(),
    // Development & Casting Annex V1: headless worlds own no managed parcel,
    // project history, facility, or capital debit.
    construction: emptyStudioConstruction(),
    // Placement Core V12: headless worlds own no placed facility and have
    // reserved no placement identity.
    placement: emptyStudioPlacement(),
    // C1-M1a: every world — headless, migrated, or player — carries its own
    // property. A fresh state gets a deep COPY of the initial authored property,
    // never the frozen constant, so state is always independently mutable and no
    // world can reach back and edit the authored source of truth.
    property: initialProperty(),
    // ── C2a-M1 SaveFileV14 ──────────────────────────────────────────────────
    // A headless world owns no physical production capacity beyond its legacy
    // countdown: no sets are endowed until a founded studio activates managed
    // operations, so `nextSetId` has handed out nothing. The queue, the original
    // screenplays, and the studio's own history are all EMPTY here — and the
    // event log staying empty on this path is exactly what keeps the M0A
    // acceptance corpus byte-identical (§5 pin 5).
    sets: [],
    nextSetId: 0,
    productionQueue: [],
    originalScreenplays: { nextOrdinal: 0, blueprints: [] },
    studioEvents: emptyStudioEventLog(),
  }
}
