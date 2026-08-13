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
  GameStateV2,
  GameStateV3,
  GameStateV4,
  GameStateV5,
  GameStateV6,
  Genre,
  LedgerKind,
  PublicityState,
  GenreExperience,
  Persona,
  SkillProfiles,
  Talent,
  TheatricalRun,
  WorkHistory,
} from './types.js'
import { legacyTheatricalRun } from './economy.js'

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

// The frozen V1 GameState — identical to the FROZEN GameStateV2 EXCEPT talent is
// TalentV1[]. Anchored to GameStateV2 (NOT the live GameState) so the D-11
// employment fields do NOT leak into the frozen V1 shape (D-11.16).
export type GameStateV1 = Omit<GameStateV2, 'talent'> & { talent: TalentV1[] }

export type SaveFileV1 = {
  saveVersion: 1
  seed: string
  state: GameStateV1
  broadcastCache: BroadcastItem[]
}

// The D-9 V2 envelope — FROZEN pre-employment shape (GameStateV2). D-9
// multi-discipline talent, no employment/contract/ledger/founding fields.
export type SaveFileV2 = {
  saveVersion: 2
  seed: string
  state: GameStateV2
  broadcastCache: BroadcastItem[]
}

// The D-11 V3 envelope — FROZEN pre-D-12 shape (GameStateV3: V2 + employment surface).
// Anchored to GameStateV3 so the D-12 `theatricalRuns` field does NOT leak into V3.
export type SaveFileV3 = {
  saveVersion: 3
  seed: string
  state: GameStateV3
  broadcastCache: BroadcastItem[]
}

// The D-12 V4 envelope — the frozen GameStateV4 (V3 + theatricalRuns). FROZEN + readable;
// D-14 no longer WRITES V4 (new games save V5), but old V4 saves load and upgrade cleanly.
export type SaveFileV4 = {
  saveVersion: 4
  seed: string
  state: GameStateV4
  broadcastCache: BroadcastItem[]
}

// The D-14 V5 envelope — the FROZEN GameStateV5 (V4 + careerEvents). Anchored to
// GameStateV5 (not the live GameState) so the D-17A `economyEngagedEver` field does NOT
// leak into the frozen V5 shape, exactly as V3/V4 are anchored. D-17A no longer WRITES
// V5 (new games save V6), but old V5 saves load and upgrade cleanly.
export type SaveFileV5 = {
  saveVersion: 5
  seed: string
  state: GameStateV5
  broadcastCache: BroadcastItem[]
}

// The D-17A V6 envelope — the FROZEN GameStateV6 (V5 + the persisted engagement fact, R2).
// Anchored to GameStateV6 (not the live GameState) so the D-17B `publicity` field does NOT
// leak into the frozen V6 shape, exactly as V3/V4/V5 are anchored. D-17B no longer WRITES
// V6 (new games save V7), but old V6 saves load and upgrade cleanly.
export type SaveFileV6 = {
  saveVersion: 6
  seed: string
  state: GameStateV6
  broadcastCache: BroadcastItem[]
}

// The D-17B V7 envelope — the live GameState (V6 + publicity cooldown state, E4).
// New games save as V7.
export type SaveFileV7 = {
  saveVersion: 7
  seed: string
  state: GameState
  broadcastCache: BroadcastItem[]
}

// Any envelope (the return of the version-dispatching validateSave/loadSave).
export type SaveFile =
  | SaveFileV1
  | SaveFileV2
  | SaveFileV3
  | SaveFileV4
  | SaveFileV5
  | SaveFileV6
  | SaveFileV7

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

// ── V3 validation (D-11 shape) ───────────────────────────────────────────────
// Same envelope rules as V1/V2; the difference is the state carries the D-11
// employment surface (not re-validated field-by-field — the save is plain data).
export function validateSaveV3(save: unknown): SaveFileV3 {
  if (save === null || typeof save !== 'object') {
    throw new Error('validateSaveV3: save is not an object')
  }
  const s = save as Record<string, unknown>
  if (s.saveVersion !== 3) {
    throw new Error(
      `validateSaveV3: expected saveVersion 3, got ${JSON.stringify(s.saveVersion)}`,
    )
  }
  checkEnvelope(s, 'validateSaveV3')
  return save as SaveFileV3
}

// The D-12 V4 envelope validator (adds theatricalRuns; same envelope shape check).
export function validateSaveV4(save: unknown): SaveFileV4 {
  if (save === null || typeof save !== 'object') {
    throw new Error('validateSaveV4: save is not an object')
  }
  const s = save as Record<string, unknown>
  if (s.saveVersion !== 4) {
    throw new Error(`validateSaveV4: expected saveVersion 4, got ${JSON.stringify(s.saveVersion)}`)
  }
  checkEnvelope(s, 'validateSaveV4')
  return save as SaveFileV4
}

// The D-14 V5 envelope validator (adds careerEvents; same envelope shape check).
export function validateSaveV5(save: unknown): SaveFileV5 {
  if (save === null || typeof save !== 'object') {
    throw new Error('validateSaveV5: save is not an object')
  }
  const s = save as Record<string, unknown>
  if (s.saveVersion !== 5) {
    throw new Error(`validateSaveV5: expected saveVersion 5, got ${JSON.stringify(s.saveVersion)}`)
  }
  checkEnvelope(s, 'validateSaveV5')
  return save as SaveFileV5
}

// The D-17A V6 envelope validator (adds economyEngagedEver; same envelope shape check
// PLUS one field check).
//
// THE ONE DELIBERATE EXCEPTION to this module's "the save is plain data, not re-validated
// field-by-field" rule: `economyEngagedEver` MUST be a boolean. Every other field is
// descriptive — a missing one degrades a display. This one is a REGIME fact: absent (or
// non-boolean) it would read as falsy and silently DISENGAGE a real studio's D-12 economy
// — no overhead, no solvency gate, no weekly Studio Revenue — which is exactly the R2
// failure this milestone closes. A wrong regime must fail loudly at load, not quietly at
// play.
export function validateSaveV6(save: unknown): SaveFileV6 {
  if (save === null || typeof save !== 'object') {
    throw new Error('validateSaveV6: save is not an object')
  }
  const s = save as Record<string, unknown>
  if (s.saveVersion !== 6) {
    throw new Error(`validateSaveV6: expected saveVersion 6, got ${JSON.stringify(s.saveVersion)}`)
  }
  const state = checkEnvelope(s, 'validateSaveV6')
  if (typeof state.economyEngagedEver !== 'boolean') {
    throw new Error(
      `validateSaveV6: state.economyEngagedEver is missing or not a boolean (got ${JSON.stringify(state.economyEngagedEver)}) — the persisted engagement fact (R2) must be explicit; a missing value would silently disengage the studio economy`,
    )
  }
  return save as SaveFileV6
}

// The D-17B V7 envelope validator (adds `publicity`; same envelope shape check, and NO field
// check — see below).
//
// WHY THERE IS NO `publicity` FIELD CHECK, when V6 has one for `economyEngagedEver`
// (D-17B §5/E4, decided and recorded here). The V6 exception exists because
// `economyEngagedEver` is a REGIME fact: absent, it reads falsy and silently DISENGAGES a
// real studio's whole D-12 economy — no overhead, no solvency gate, no weekly Studio Revenue
// — which is a wrong-behaviour-in-silence hazard, so it must fail loudly at load.
// `publicity` is not that. It is a pair of COOLDOWN CLOCKS whose only meaning is "how recently
// did you buy a campaign", every field of which is legitimately `null` for a studio that has
// never bought one. A missing object therefore has an exactly-correct default — the empty
// state `convertV6ToV7` seeds — and defaulting it costs the player at most one prematurely
// available campaign, never a change of economic law. So this stays converter-only, and the
// module's "the save is plain data, not re-validated field-by-field" rule holds.
export function validateSaveV7(save: unknown): SaveFileV7 {
  if (save === null || typeof save !== 'object') {
    throw new Error('validateSaveV7: save is not an object')
  }
  const s = save as Record<string, unknown>
  if (s.saveVersion !== 7) {
    throw new Error(`validateSaveV7: expected saveVersion 7, got ${JSON.stringify(s.saveVersion)}`)
  }
  checkEnvelope(s, 'validateSaveV7')
  return save as SaveFileV7
}

// ── Version-dispatching validation (LOUD rejection of unknown versions) ──────
// Returns the correctly-narrowed envelope for a known version; throws for any
// other saveVersion. The three versions carry DIFFERENT shapes (V1 legacy scalar
// talent, V2 D-9 talent, V3 D-9 talent + D-11 employment); they are NOT identical.
export function validateSave(save: unknown): SaveFile {
  if (save === null || typeof save !== 'object') {
    throw new Error('validateSave: save is not an object')
  }
  const s = save as Record<string, unknown>
  if (s.saveVersion === 1) return validateSaveV1(save)
  if (s.saveVersion === 2) return validateSaveV2(save)
  if (s.saveVersion === 3) return validateSaveV3(save)
  if (s.saveVersion === 4) return validateSaveV4(save)
  if (s.saveVersion === 5) return validateSaveV5(save)
  if (s.saveVersion === 6) return validateSaveV6(save)
  if (s.saveVersion === 7) return validateSaveV7(save)
  throw new Error(
    `validateSave: unknown saveVersion ${JSON.stringify(s.saveVersion)} (this build handles versions 1, 2, 3, 4, 5, 6 and 7 only)`,
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

// Build a validated V2 envelope from a FROZEN (pre-employment) GameStateV2. Kept
// so V2 fixtures / the V1→V2 conversion stay typed against the frozen shape.
export function makeSaveV2(state: GameStateV2): SaveFileV2 {
  const save: SaveFileV2 = {
    saveVersion: 2,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  }
  return validateSaveV2(save)
}

// Build a validated V3 envelope from a FROZEN GameStateV3 (pre-D-12). Kept typed against
// the frozen shape for the V2→V3 conversion and V3 fixtures.
export function makeSaveV3(state: GameStateV3): SaveFileV3 {
  const save: SaveFileV3 = {
    saveVersion: 3,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  }
  return validateSaveV3(save)
}

// Build a validated V4 envelope from a FROZEN GameStateV4 (pre-D-14). Kept typed against
// the frozen shape for the V3→V4 conversion and V4 fixtures. D-14 no longer writes V4.
export function makeSaveV4(state: GameStateV4): SaveFileV4 {
  const save: SaveFileV4 = {
    saveVersion: 4,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  }
  return validateSaveV4(save)
}

// Build a validated V5 envelope from a FROZEN GameStateV5 (pre-D-17A). Kept typed against
// the frozen shape for the V4→V5 conversion and V5 fixtures. D-17A no longer writes V5.
export function makeSaveV5(state: GameStateV5): SaveFileV5 {
  const save: SaveFileV5 = {
    saveVersion: 5,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  }
  return validateSaveV5(save)
}

// Build a validated V6 envelope from a FROZEN GameStateV6 (pre-D-17B). Kept typed against the
// frozen shape for the V5→V6 conversion and V6 fixtures. D-17B no longer writes V6.
export function makeSaveV6(state: GameStateV6): SaveFileV6 {
  const save: SaveFileV6 = {
    saveVersion: 6,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  }
  return validateSaveV6(save)
}

// Build a validated V7 envelope from the live (D-17B) GameState. This is what new games use.
export function makeSaveV7(state: GameState): SaveFileV7 {
  const save: SaveFileV7 = {
    saveVersion: 7,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  }
  return validateSaveV7(save)
}

// makeSave — the D-17B default. New games save as V7.
export function makeSave(state: GameState): SaveFileV7 {
  return makeSaveV7(state)
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

  const newState: GameStateV2 = {
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

// ═══════════════════════════════════════════════════════════════════════════════
// D-11.16 — deterministic V2 → V3 conversion (same precedent as D-9.15).
//   Input:  a validated SaveFileV2 (pre-employment shape).
//   Output: a NEW SaveFileV3. The V2 input is NEVER mutated.
//   A converted legacy save has NO employment (founding: null, contracts/ledger/
//   freeAgents empty), so the D-11.0 engagement gate stays inactive until its first
//   signing — legacy play continues open-pool. rngState is copied through UNCHANGED;
//   the conversion is deterministic and idempotent (byte-identical under
//   stableStringify); the original file is never overwritten.
// ═══════════════════════════════════════════════════════════════════════════════
export function convertV2ToV3(v2: SaveFileV2): SaveFileV3 {
  const validated = validateSaveV2(v2) // defensive: never trust an unvalidated input
  const oldState = validated.state

  const newState: GameStateV3 = {
    ...oldState,
    // D-11 employment surface — empty on conversion (no employment in a V2 save).
    founding: null,
    contracts: [],
    ledger: [],
    freeAgents: [],
    // rngState carried through UNCHANGED — the resumed run replays identically.
  }

  return makeSaveV3(newState)
}

// importLegacyV2 — parse a legacy V2 JSON string and return a NEW SaveFileV3.
// Loudly rejects anything that is not a valid V2 save. Input untouched.
export function importLegacyV2(json: string): SaveFileV3 {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (e) {
    throw new Error(`importLegacyV2: not valid JSON — ${(e as Error).message}`)
  }
  const v2 = validateSaveV2(parsed)
  return convertV2ToV3(v2)
}

// importLegacyV1ToV3 — parse a legacy V1 JSON string and return a NEW SaveFileV3
// (via V1 → V2 → V3). Deterministic and idempotent. Input untouched.
export function importLegacyV1ToV3(json: string): SaveFileV3 {
  return convertV2ToV3(importLegacyV1(json))
}

// ═══════════════════════════════════════════════════════════════════════════════
// D-12 — deterministic V3 → V4 conversion.
//   Each already-released film becomes a `legacyCompleted` TheatricalRun: it already
//   received the FULL gross once under V3, so it is recorded (studioShare 1.0, model 0)
//   and NEVER repaid. Unreleased/active productions carry no run and transition to the
//   D-12 model only at their next new-economy release. rngState carried UNCHANGED; input
//   never mutated; idempotent (byte-identical under stableStringify on repeat).
// ═══════════════════════════════════════════════════════════════════════════════
export function convertV3ToV4(v3: SaveFileV3): SaveFileV4 {
  const validated = validateSaveV3(v3) // defensive: never trust an unvalidated input
  const oldState = validated.state
  const theatricalRuns: TheatricalRun[] = oldState.studio.releasedFilms.map((f) => legacyTheatricalRun(f))
  const newState: GameStateV4 = {
    ...oldState,
    theatricalRuns,
    // rngState carried through UNCHANGED — the resumed run replays identically.
  }
  return makeSaveV4(newState)
}

// ═══════════════════════════════════════════════════════════════════════════════
// D-14 — deterministic V4 → V5 conversion.
//   Adds an EMPTY career-event ledger. Preserves ALL current talent values (fame,
//   skills, everything) exactly; synthesizes NO fictional historical deltas and grants
//   NO fame for prior films. Detailed career history is available only from the
//   migration point forward. rngState carried UNCHANGED; input never mutated; idempotent
//   (byte-identical under stableStringify on repeat).
// ═══════════════════════════════════════════════════════════════════════════════
export function convertV4ToV5(v4: SaveFileV4): SaveFileV5 {
  const validated = validateSaveV4(v4) // defensive: never trust an unvalidated input
  const oldState = validated.state
  // NOTE: this literal is a FROZEN GameStateV5 — it must NOT carry the D-17A
  // `economyEngagedEver` field. The V5→V6 step reconstructs that fact (convertV5ToV6).
  const newState: GameStateV5 = {
    ...oldState,
    careerEvents: [], // empty ledger — no invented pre-D-14 history; fame preserved as-is.
  }
  return makeSaveV5(newState)
}

// ═══════════════════════════════════════════════════════════════════════════════
// D-17A / R2 — deterministic V5 → V6 conversion (the engagement-cliff closure).
//   Adds the persisted, monotonic `economyEngagedEver` fact. A V5 save does not carry
//   it, so it is RECONSTRUCTED from evidence that only an engaged studio can have
//   produced (proven exact for all five save classes in the Phase-0 migration proof):
//     • an open founding draft;
//     • any contract (past or present is not recoverable — a current one is proof);
//     • any ledger entry of an ENGAGED-ONLY kind (payroll/overhead/signingBonus/
//       termination/freelancerFee/studioRevenue). `boxOffice` and `production` are
//       DELIBERATELY EXCLUDED: the headless/M0A path writes both;
//     • any theatrical run recorded under the D-12 economy model (version ≥ 1) — a
//       migrated V3 run is `legacyCompleted` at model 0 and proves nothing.
//   A never-engaged (headless/M0A/legacy) save reconstructs to FALSE and every branch
//   behaves exactly as before. rngState carried UNCHANGED; input never mutated;
//   deterministic and idempotent (byte-identical under stableStringify on repeat).
// ═══════════════════════════════════════════════════════════════════════════════

// The ledger kinds ONLY an engaged studio can write (D-11/D-12 economics). Excludes
// `production` and `boxOffice`, which the non-engaged D-1 path also writes.
//
// D-17B §5 (binding): typed `ReadonlySet<LedgerKind>` so that adding a LedgerKind makes the
// membership decision a COMPILE-TIME question rather than a silently-omitted string. Every
// kind's membership is decided explicitly here, and the reason is the same one D-17A used:
// could the HEADLESS/M0A path ever write it?
const ENGAGED_KINDS: ReadonlySet<LedgerKind> = new Set<LedgerKind>([
  'payroll',
  'overhead',
  'signingBonus',
  'termination',
  'freelancerFee',
  'studioRevenue',
  // D-17B §5: publicity is ENGAGED-ONLY by construction — `applyPublicity` rejects when the
  // economy is not engaged, so no headless/M0A save can carry this kind. It is therefore
  // valid evidence of engagement and IS a member.
  'publicity',
])

export function convertV5ToV6(v5: SaveFileV5): SaveFileV6 {
  const validated = validateSaveV5(v5) // defensive: never trust an unvalidated input
  const oldState = validated.state
  const everEngaged =
    oldState.founding !== null ||
    oldState.contracts.length > 0 ||
    oldState.ledger.some((e) => ENGAGED_KINDS.has(e.kind)) ||
    oldState.theatricalRuns.some((r) => r.economyModelVersion >= 1)
  // NOTE: this literal is a FROZEN GameStateV6 — it must NOT carry the D-17B `publicity`
  // field. The V6→V7 step seeds that (convertV6ToV7).
  const newState: GameStateV6 = {
    ...oldState,
    economyEngagedEver: everEngaged,
    // rngState carried through by the spread, UNCHANGED — the resumed run replays identically.
  }
  return makeSaveV6(newState)
}

// ═══════════════════════════════════════════════════════════════════════════════
// D-17B / E4 — deterministic V6 → V7 conversion (the publicity mechanic's save state).
//   Adds the EMPTY publicity state: `lastUsedWeek: null` and every tier `null`. Nothing is
//   reconstructed and nothing is guessed — a V6 save predates the mechanic, so it has no
//   campaign history, and "never used" is the exact truth rather than an approximation
//   (contrast the V5→V6 step, which had to RECONSTRUCT a regime fact from evidence).
//   Consequence for the player: a migrated studio may buy its first campaign immediately,
//   which is correct — it has never bought one.
//   Deterministic, idempotent (byte-identical under stableStringify on repeat), `rngState`
//   carried through UNCHANGED, and the V6 input is never mutated.
// ═══════════════════════════════════════════════════════════════════════════════

/** The empty publicity state — no campaign ever bought. The ONE place it is spelled out. */
export function emptyPublicityState(): PublicityState {
  return { lastUsedWeek: null, byTier: { whisper: null, push: null, blitz: null } }
}

export function convertV6ToV7(v6: SaveFileV6): SaveFileV7 {
  const validated = validateSaveV6(v6) // defensive: never trust an unvalidated input
  const oldState = validated.state
  const newState: GameState = {
    ...oldState,
    publicity: emptyPublicityState(),
    // rngState carried through by the spread, UNCHANGED — the resumed run replays identically.
  }
  return makeSaveV7(newState)
}

// importLegacyV{3,2,1}ToV4 — parse a legacy JSON string and return a NEW SaveFileV4.
export function importLegacyV3ToV4(json: string): SaveFileV4 {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (e) {
    throw new Error(`importLegacyV3ToV4: not valid JSON — ${(e as Error).message}`)
  }
  return convertV3ToV4(validateSaveV3(parsed))
}
export function importLegacyV2ToV4(json: string): SaveFileV4 {
  return convertV3ToV4(importLegacyV2(json))
}
export function importLegacyV1ToV4(json: string): SaveFileV4 {
  return convertV3ToV4(importLegacyV1ToV3(json))
}

// migrateToV4 — bring ANY known save version up to V4. V4 passes through; V1/V2/V3
// migrate deterministically. Idempotent. (Retained; the live entry is now migrateToV6.)
export function migrateToV4(save: SaveFileV1 | SaveFileV2 | SaveFileV3 | SaveFileV4): SaveFileV4 {
  if (save.saveVersion === 4) return save
  if (save.saveVersion === 3) return convertV3ToV4(save)
  if (save.saveVersion === 2) return convertV3ToV4(convertV2ToV3(save))
  return convertV3ToV4(convertV2ToV3(convertV1ToV2(save)))
}

// migrateToV5 — bring ANY known pre-V6 save version up to V5. V5 passes through; V1–V4
// migrate deterministically. Idempotent. The V4→V5 step only adds an empty career ledger
// (fame + all talent state preserved exactly). (Retained; the live entry is migrateToV6.)
export function migrateToV5(save: SaveFileV1 | SaveFileV2 | SaveFileV3 | SaveFileV4 | SaveFileV5): SaveFileV5 {
  if (save.saveVersion === 5) return save
  return convertV4ToV5(migrateToV4(save))
}

// migrateToV6 — bring ANY known pre-V7 save version up to V6. V6 passes through; V1–V5
// migrate deterministically. Idempotent. The V5→V6 step reconstructs the persisted engagement
// fact (R2) — never-engaged saves get `false` and keep behaving byte-identically.
// (Retained; the live entry is now migrateToV7.)
export function migrateToV6(
  save: SaveFileV1 | SaveFileV2 | SaveFileV3 | SaveFileV4 | SaveFileV5 | SaveFileV6,
): SaveFileV6 {
  if (save.saveVersion === 6) return save
  return convertV5ToV6(migrateToV5(save))
}

// migrateToV7 — bring ANY known save version up to the live V7 (the load-to-play entry).
// V7 passes through; V1–V6 migrate deterministically. Idempotent. The V6→V7 step only seeds
// the empty publicity state, so a migrated save behaves exactly as before until the player
// buys a campaign.
export function migrateToV7(save: SaveFile): SaveFileV7 {
  if (save.saveVersion === 7) return save
  return convertV6ToV7(migrateToV6(save))
}
