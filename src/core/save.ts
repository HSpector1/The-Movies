// ── §17 Save format + rev. 4 item M14 + D-9 SaveFileV2 (owner ruling) ─────────
// TWO save envelopes:
//   SaveFileV1 (saveVersion: 1) — FROZEN. Describes the OLD (pre-D-9) world, whose
//     talent is the legacy scalar shape (TalentV1). Its validation rules are the
//     ORIGINAL rules, UNCHANGED. There is NO in-place migration of a V1 file: a V1
//     save always reads back as a V1 save with old-shape talent.
//   SaveFileV2 (saveVersion: 2) — the D-9 world. Its state.talent is the new
//     multi-discipline Talent shape (types.ts). This is what D-9 games save as.
//
// The two are DELIBERATELY NOT byte-identical (they carry different talent shapes).
// `validateSave` dispatches on saveVersion and LOUDLY rejects any unknown version.
//
// V1 → V2 CONVERSION (D-9.15 formulas, owner-overridden target = a NEW V2 file):
//   convertV1ToV2 / importLegacyV1 take a VALIDATED V1 save and produce a NEW
//   SaveFileV2. They NEVER mutate the caller's V1 input. New talent fields are
//   derived ONLY from stable existing data + state.seed + the talent id, via
//   stream(seed, 'migrate', old.id + '-' + field) — no wall-clock/UUID/locale/
//   fs-order/entropy. The conversion is IDEMPOTENT (converting the same V1 twice
//   yields byte-identical V2 talent under stableStringify) and leaves rngState
//   untouched (a resumed run replays identically).
//
// M14 divergence rules (both versions), all rejected loudly:
//   - unknown saveVersion
//   - envelope seed !== state.seed
//   - broadcastCache !== state.broadcastItems (deep equality; aired items only)
//
// stableStringify / deepEqual are UNCHANGED (byte-identity for §15.7).

import { clamp, smoothstep } from './math.js'
import { stream, type RngStream } from './rng.js'
import { roleOVR } from './talentSummary.js'
import {
  DISCIPLINE_ORDER,
  GENRE_ORDER,
  ROLE_TO_DISCIPLINE,
  SKILL_ORDER,
  TUNING,
} from './tuning.js'
import type {
  BroadcastItem,
  Ceilings,
  CreativeRole,
  DevRates,
  Discipline,
  DisciplineSkills,
  GameState,
  Genre,
  GenreExperience,
  Persona,
  SkillProfiles,
  Talent,
  WorkHistory,
} from './types.js'

// ── Legacy (pre-D-9) talent + state shapes (SaveFileV1 typed honestly) ─────────
// The OLD talent scalar shape the frozen SaveFileV1 carries. Named TalentV1 so
// SaveFileV1 can be typed against old-shape data without pretending it is the new
// multi-discipline Talent.
export type TalentV1 = {
  id: string
  name: string
  role: CreativeRole
  age: number
  actual: Persona
  perceived: Persona
  skill: number // 0..100 — the OLD scalar ability
  fame: number
  salary: number
  authored: boolean
}

// The frozen V1 GameState — identical to GameState EXCEPT talent is TalentV1[].
export type GameStateV1 = Omit<GameState, 'talent'> & { talent: TalentV1[] }

export type SaveFileV1 = {
  saveVersion: 1
  seed: string
  state: GameStateV1
  broadcastCache: BroadcastItem[]
}

// The D-9 V2 envelope. state.talent is the new multi-discipline Talent[].
export type SaveFileV2 = {
  saveVersion: 2
  seed: string
  state: GameState
  broadcastCache: BroadcastItem[]
}

// Either envelope (the return of the version-dispatching validateSave/loadSave).
export type SaveFile = SaveFileV1 | SaveFileV2

// ── Stable stringify (UNCHANGED) ─────────────────────────────────────────────
// Recursively serializes with object keys sorted lexicographically, so the same
// logical value always yields byte-identical JSON regardless of insertion order.
// Arrays keep their order (order is meaningful). Only the JSON-representable
// subset is expected here (the save is plain data); undefined-valued object
// properties are omitted exactly as JSON.stringify would omit them.
export function stableStringify(value: unknown): string {
  return build(value)
}

function build(v: unknown): string {
  if (v === null) return 'null'
  const t = typeof v
  if (t === 'number') {
    // Match JSON.stringify: non-finite numbers serialize as null.
    return Number.isFinite(v) ? String(v) : 'null'
  }
  if (t === 'boolean') return v ? 'true' : 'false'
  if (t === 'string') return JSON.stringify(v)
  if (t === 'undefined' || t === 'function') return 'null' // only reached inside arrays
  if (Array.isArray(v)) {
    return `[${v.map((el) => (el === undefined ? 'null' : build(el))).join(',')}]`
  }
  if (t === 'object') {
    const obj = v as Record<string, unknown>
    const keys = Object.keys(obj).sort()
    const parts: string[] = []
    for (const k of keys) {
      const val = obj[k]
      if (val === undefined || typeof val === 'function') continue // JSON omits these
      parts.push(`${JSON.stringify(k)}:${build(val)}`)
    }
    return `{${parts.join(',')}}`
  }
  // bigint / symbol are not part of the save's data model
  throw new Error(`stableStringify: unsupported value of type ${t}`)
}

// ── Deep equality (UNCHANGED) ────────────────────────────────────────────────
// Structural equality over the JSON-representable save subset. Used for M14's
// broadcastCache ≡ state.broadcastItems check.
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return a === b
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ao = a as Record<string, unknown>
    const bo = b as Record<string, unknown>
    const ak = Object.keys(ao)
    const bk = Object.keys(bo)
    if (ak.length !== bk.length) return false
    for (const k of ak) {
      if (!Object.prototype.hasOwnProperty.call(bo, k)) return false
      if (!deepEqual(ao[k], bo[k])) return false
    }
    return true
  }
  return false
}

// ── Shared envelope-shape checks (version-agnostic) ──────────────────────────
// Enforce the three M14 divergence rules that both versions share. Throws loudly.
function checkEnvelope(s: Record<string, unknown>, label: string): Record<string, unknown> {
  if (typeof s.seed !== 'string') {
    throw new Error(`${label}: envelope seed is missing or not a string`)
  }
  if (s.state === null || typeof s.state !== 'object') {
    throw new Error(`${label}: state is missing or not an object`)
  }
  const state = s.state as Record<string, unknown>
  if (state.seed !== s.seed) {
    throw new Error(
      `${label}: envelope seed ${JSON.stringify(s.seed)} does not equal state.seed ${JSON.stringify(state.seed)}`,
    )
  }
  if (!Array.isArray(s.broadcastCache)) {
    throw new Error(`${label}: broadcastCache is missing or not an array`)
  }
  if (!Array.isArray(state.broadcastItems)) {
    throw new Error(`${label}: state.broadcastItems is missing or not an array`)
  }
  if (!deepEqual(s.broadcastCache, state.broadcastItems)) {
    throw new Error(
      `${label}: broadcastCache does not deep-equal state.broadcastItems (M14: the two must be identical)`,
    )
  }
  return state
}

// ── V1 validation (ORIGINAL rules, UNCHANGED) ────────────────────────────────
// Throws on any divergence; returns the narrowed SaveFileV1 (old-shape talent).
// The V1 rules are exactly the pre-D-9 rules; nothing about them changed.
export function validateSaveV1(save: unknown): SaveFileV1 {
  if (save === null || typeof save !== 'object') {
    throw new Error('validateSaveV1: save is not an object')
  }
  const s = save as Record<string, unknown>
  if (s.saveVersion !== 1) {
    throw new Error(
      `validateSaveV1: expected saveVersion 1, got ${JSON.stringify(s.saveVersion)}`,
    )
  }
  checkEnvelope(s, 'validateSaveV1')
  return save as SaveFileV1
}

// ── V2 validation (D-9 shape) ────────────────────────────────────────────────
// Same envelope rules as V1; the difference is the talent shape it carries (not
// re-validated field-by-field here — the save is plain data, as V1 was).
export function validateSaveV2(save: unknown): SaveFileV2 {
  if (save === null || typeof save !== 'object') {
    throw new Error('validateSaveV2: save is not an object')
  }
  const s = save as Record<string, unknown>
  if (s.saveVersion !== 2) {
    throw new Error(
      `validateSaveV2: expected saveVersion 2, got ${JSON.stringify(s.saveVersion)}`,
    )
  }
  checkEnvelope(s, 'validateSaveV2')
  return save as SaveFileV2
}

// ── Version-dispatching validation (LOUD rejection of unknown versions) ──────
// Returns the correctly-narrowed envelope for a known version; throws for any
// other saveVersion. V1 and V2 are NOT byte-identical (different talent shapes).
export function validateSave(save: unknown): SaveFile {
  if (save === null || typeof save !== 'object') {
    throw new Error('validateSave: save is not an object')
  }
  const s = save as Record<string, unknown>
  if (s.saveVersion === 1) return validateSaveV1(save)
  if (s.saveVersion === 2) return validateSaveV2(save)
  throw new Error(
    `validateSave: unknown saveVersion ${JSON.stringify(s.saveVersion)} (this build handles versions 1 and 2 only)`,
  )
}

// ── Build validated envelopes from state ─────────────────────────────────────

// Build a validated V1 envelope from a legacy GameStateV1 (broadcastCache mirrors
// the state's aired items, per M14). Kept so V1 fixtures/back-compat are typed.
export function makeSaveV1(state: GameStateV1): SaveFileV1 {
  const save: SaveFileV1 = {
    saveVersion: 1,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  }
  return validateSaveV1(save)
}

// Build a validated V2 envelope from a (D-9) GameState. This is what D-9 games use.
export function makeSaveV2(state: GameState): SaveFileV2 {
  const save: SaveFileV2 = {
    saveVersion: 2,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  }
  return validateSaveV2(save)
}

// makeSave — the D-9 default. New games save as V2.
export function makeSave(state: GameState): SaveFileV2 {
  return makeSaveV2(state)
}

// ── Load / export / import ───────────────────────────────────────────────────

// Validate then return the save (the load-path entry point), dispatching on
// version. Kept distinct from validateSave so intent at call sites is legible.
export function loadSave(save: unknown): SaveFile {
  return validateSave(save)
}

// Serialize a save to a deterministic JSON string (stable key order → §15.7).
// Validates first (either version) so an invalid save never reaches output.
export function exportSave(save: SaveFile): string {
  validateSave(save)
  return stableStringify(save)
}

// Parse a JSON string and validate it as a SaveFile (loud rejection on any
// divergence, including unknown version). Throws on malformed JSON too.
export function importSave(json: string): SaveFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (e) {
    throw new Error(`importSave: not valid JSON — ${(e as Error).message}`)
  }
  return validateSave(parsed)
}

// ═══════════════════════════════════════════════════════════════════════════════
// D-9.15 (owner-overridden) — deterministic V1 → V2 conversion.
//   Input:  a validated SaveFileV1 (old-shape talent).
//   Output: a NEW SaveFileV2 (new-shape talent). The V1 input is NEVER mutated.
//   Derivation: for each talent, all new fields from stream(seed,'migrate',
//   old.id + '-' + field). rngState is copied through UNCHANGED (replay-exact).
// ═══════════════════════════════════════════════════════════════════════════════

const iround = (x: number): number => Math.round(x)

// A migrate stream for one talent + one field key: stream(seed, 'migrate',
// old.id + '-' + field). Distinct key family per (talent, field) so migration
// draws never collide with worldgen or sim draws (D-9.15).
function migrateStream(seed: string, oldId: string, field: string): RngStream {
  return stream(seed, 'migrate', `${oldId}-${field}`)
}

// Build a DisciplineSkills record from six actual centers + a perceived stream.
function buildDisciplineSkillsFromCenters(
  discipline: Discipline,
  centers: number[],
  perceivedS: RngStream,
): DisciplineSkills {
  const keys = SKILL_ORDER[discipline]
  const out: DisciplineSkills = {}
  for (let i = 0; i < keys.length; i++) {
    const a = clamp(iround(centers[i]!), 1, 99)
    const p = clamp(iround(a + perceivedS.gaussian(0, TUNING.MIGRATE_PERCEIVED_SD)), 1, 99)
    out[keys[i]!] = { actual: a, perceived: p }
  }
  return out
}

// Convert ONE old-shape talent to the new D-9 Talent, deterministically.
// Field-draw order follows D-9.15's numbered steps; each step keys its own
// migrate stream so draw counts are independent of what other steps drew.
export function migrateTalent(old: TalentV1, seed: string): Talent {
  const primary: Discipline = ROLE_TO_DISCIPLINE[old.role]

  // Step 2 — primary skills centered on old.skill (per-skill variation; not all
  // identical). Center draws from the 'skill' key; perceived from the 'perceived' key.
  const skillS = migrateStream(seed, old.id, 'skill')
  const perceivedS = migrateStream(seed, old.id, 'perceived')

  // Step 4 — secondary/weak disciplines. Decide secondary from the 'secondary' key.
  const secondaryS = migrateStream(seed, old.id, 'secondary')
  const others = DISCIPLINE_ORDER.filter((d) => d !== primary)
  let secondary: Discipline | null = null
  let muSecondary = 0
  if (secondaryS.next() < TUNING.MIGRATE_SECONDARY_P) {
    secondary = others[Math.floor(secondaryS.next() * others.length)]!
    const penalty = secondaryS.uniform(
      TUNING.MIGRATE_SECONDARY_PENALTY[0],
      TUNING.MIGRATE_SECONDARY_PENALTY[1],
    )
    muSecondary = clamp(old.skill - penalty, 20, 90)
  }

  // Per-discipline actual centers, then skills (perceived split), in DISCIPLINE_ORDER.
  const skills = {} as SkillProfiles
  for (const d of DISCIPLINE_ORDER) {
    const centers: number[] = new Array(6)
    if (d === primary) {
      for (let i = 0; i < 6; i++) {
        centers[i] = clamp(old.skill + skillS.gaussian(0, TUNING.MIGRATE_SKILL_SD), 1, 99)
      }
    } else if (d === secondary) {
      for (let i = 0; i < 6; i++) {
        centers[i] = clamp(muSecondary + skillS.gaussian(0, TUNING.MIGRATE_SKILL_SD), 1, 99)
      }
    } else {
      // weak discipline: each skill drawn at μ ~ N(MIGRATE_WEAK_MEAN, MIGRATE_WEAK_SD)
      for (let i = 0; i < 6; i++) {
        centers[i] = clamp(
          skillS.gaussian(TUNING.MIGRATE_WEAK_MEAN, TUNING.MIGRATE_WEAK_SD),
          1,
          99,
        )
      }
    }
    skills[d] = buildDisciplineSkillsFromCenters(d, centers, perceivedS)
  }

  // Step 5 — ceilings: clamp(round(max(actual, actual + headroom·ageRunwayMult)),
  // actual, 99). ageRunwayMult inlined via the shared talentSummary curve would
  // create a cycle; use the same closed form directly here.
  const ageMult = ageRunwayMultLocal(old.age)
  const headroomS = migrateStream(seed, old.id, 'headroom')
  const ceilings = {} as Ceilings
  for (const d of DISCIPLINE_ORDER) {
    const keys = SKILL_ORDER[d]
    const rec: Record<string, number> = {}
    for (const key of keys) {
      const a = skills[d][key]!.actual
      const headroom =
        headroomS.truncatedNormal(
          TUNING.MIGRATE_HEADROOM_MEAN,
          TUNING.MIGRATE_HEADROOM_SD,
          TUNING.GEN_HEADROOM_LO,
          TUNING.GEN_HEADROOM_HI,
        ) * ageMult
      rec[key] = clamp(iround(a + headroom), a, 99)
    }
    ceilings[d] = rec
  }

  // Step 6 — work ethic (own migrate key; independent of skill/fame).
  const weS = migrateStream(seed, old.id, 'workethic')
  const workEthic = clamp(
    iround(weS.truncatedNormal(TUNING.MIGRATE_WE_MEAN, TUNING.MIGRATE_WE_SD, 1, 99)),
    1,
    99,
  )

  // Step 7 — dev rates: uniform(DEV_RATE_MIN, DEV_RATE_MAX) per discipline.
  const devrateS = migrateStream(seed, old.id, 'devrate')
  const devRate = {} as DevRates
  for (const d of DISCIPLINE_ORDER) {
    devRate[d] = clamp(
      devrateS.uniform(TUNING.DEV_RATE_MIN, TUNING.DEV_RATE_MAX),
      TUNING.DEV_RATE_MIN,
      TUNING.DEV_RATE_MAX,
    )
  }

  // Step 8 — genre experience defaults: primary (discipline,genre) seeded small
  // (scaled by old.age); secondary/weak at 0.
  const expS = migrateStream(seed, old.id, 'genreexp')
  const expAgeMult = clamp(0.6 + (old.age - 20) / 60, 0.6, 1.4)
  const genreExperience = {} as GenreExperience
  for (const d of DISCIPLINE_ORDER) {
    const rec = {} as Record<Genre, { actual: number; perceived: number }>
    for (const g of GENRE_ORDER) {
      if (d === primary) {
        const a = clamp(
          iround(
            expS.truncatedNormal(
              TUNING.GEN_EXP_MEAN,
              TUNING.GEN_EXP_SD,
              TUNING.GEN_EXP_LO,
              TUNING.GEN_EXP_HI,
            ) * expAgeMult,
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
    genreExperience[d] = rec
  }

  // Step 9 — workHistory all-zero (no pre-migration completed work recorded).
  const workHistory = {} as WorkHistory
  for (const d of DISCIPLINE_ORDER) workHistory[d] = 0

  // Assemble. name/age/role/fame/actual/perceived preserved exactly (Step 1 & the
  // ruling's preservation list). salary/authored kept as-is (Step 10). Legacy
  // `skill` retained for shape but reset to roleOVR(primary, perceived) so it is a
  // faithful proxy of the new profile (Step 12/D-9.13 spirit) — a documented,
  // deterministic choice; salary is NOT recomputed (no ledger drift on load, Step 10).
  const t: Talent = {
    id: old.id,
    name: old.name,
    role: old.role,
    age: old.age,
    actual: { ...old.actual },
    perceived: { ...old.perceived },
    fame: old.fame,
    salary: old.salary, // unchanged (Step 10) — no ledger drift on load
    authored: old.authored,
    skills,
    ceilings,
    devRate,
    workEthic,
    genreExperience,
    workHistory,
    skill: old.skill, // set to the proxy below
  }
  t.skill = roleOVR(t, primary)
  return t
}

// ageRunwayMult local closed form (D-9.8) — duplicated here to avoid a save→
// talentSummary→worldgen import cycle; identical curve.
function ageRunwayMultLocal(age: number): number {
  return (
    TUNING.DEV_AGE_FLOOR +
    (1 - TUNING.DEV_AGE_FLOOR) * (1 - smoothstep(TUNING.DEV_AGE_YOUNG, TUNING.DEV_AGE_OLD, age))
  )
}

// Convert a VALIDATED SaveFileV1 into a NEW SaveFileV2. The V1 input is NEVER
// mutated: a fresh state object is built, talent are freshly migrated, and the
// rngState string is carried through UNCHANGED (a resumed run replays identically).
// Deterministic and idempotent: converting the same V1 twice yields V2 talent that
// are byte-identical under stableStringify.
export function convertV1ToV2(v1: SaveFileV1): SaveFileV2 {
  const validated = validateSaveV1(v1) // defensive: never trust an unvalidated input
  const oldState = validated.state
  const seed = oldState.seed

  const migratedTalent: Talent[] = oldState.talent.map((old) => migrateTalent(old, seed))

  const newState: GameState = {
    ...oldState,
    talent: migratedTalent, // the ONLY field whose shape changes
    // rngState carried through UNCHANGED — the resumed run replays identically.
  }

  return makeSaveV2(newState)
}

// importLegacyV1 — parse a legacy V1 JSON string and return a NEW SaveFileV2.
// Loudly rejects anything that is not a valid V1 save. The input string is
// untouched; the returned V2 is a fresh object.
export function importLegacyV1(json: string): SaveFileV2 {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (e) {
    throw new Error(`importLegacyV1: not valid JSON — ${(e as Error).message}`)
  }
  const v1 = validateSaveV1(parsed)
  return convertV1ToV2(v1)
}
