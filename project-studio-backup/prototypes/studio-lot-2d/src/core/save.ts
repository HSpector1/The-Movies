// ── §17 Save format + rev. 4 item M14 ────────────────────────────────────────
// SaveFileV1, version validation with LOUD rejection, and JSON export/import with
// deterministic key ordering (stable stringify) so §15.7 byte-identity is
// achievable. No migration functions yet (§17: a 1→2 migration cannot be tested
// before version 2 exists). No fs — export/import take and return strings.
//
// M14 divergence rules, all rejected loudly:
//   - unknown saveVersion
//   - envelope seed !== state.seed
//   - broadcastCache !== state.broadcastItems (deep equality; aired items only)

import type { BroadcastItem, GameState } from './types.js'

export type SaveFileV1 = {
  saveVersion: 1
  seed: string
  state: GameState
  broadcastCache: BroadcastItem[]
}

// ── Stable stringify ─────────────────────────────────────────────────────────
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

// ── Deep equality ────────────────────────────────────────────────────────────
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

// ── Validation ───────────────────────────────────────────────────────────────
// Throws with a descriptive error on any divergence. Returns the narrowed
// SaveFileV1 on success. The `save` parameter is typed `unknown` because it may
// arrive from importSave (an untrusted JSON string).
export function validateSave(save: unknown): SaveFileV1 {
  if (save === null || typeof save !== 'object') {
    throw new Error('validateSave: save is not an object')
  }
  const s = save as Record<string, unknown>

  if (s.saveVersion !== 1) {
    throw new Error(
      `validateSave: unknown saveVersion ${JSON.stringify(s.saveVersion)} (this build handles version 1 only; no migration functions exist yet)`,
    )
  }
  if (typeof s.seed !== 'string') {
    throw new Error('validateSave: envelope seed is missing or not a string')
  }
  if (s.state === null || typeof s.state !== 'object') {
    throw new Error('validateSave: state is missing or not an object')
  }
  const state = s.state as Record<string, unknown>
  if (state.seed !== s.seed) {
    throw new Error(
      `validateSave: envelope seed ${JSON.stringify(s.seed)} does not equal state.seed ${JSON.stringify(state.seed)}`,
    )
  }
  if (!Array.isArray(s.broadcastCache)) {
    throw new Error('validateSave: broadcastCache is missing or not an array')
  }
  if (!Array.isArray(state.broadcastItems)) {
    throw new Error('validateSave: state.broadcastItems is missing or not an array')
  }
  if (!deepEqual(s.broadcastCache, state.broadcastItems)) {
    throw new Error(
      'validateSave: broadcastCache does not deep-equal state.broadcastItems (M14: the two must be identical)',
    )
  }
  return save as SaveFileV1
}

// Build a validated save envelope from a GameState (broadcastCache mirrors the
// state's aired broadcast items, per M14).
export function makeSave(state: GameState): SaveFileV1 {
  const save: SaveFileV1 = {
    saveVersion: 1,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  }
  return validateSave(save)
}

// Validate then return the save (the load-path entry point). Kept distinct from
// validateSave so the intent at call sites is legible.
export function loadSave(save: unknown): SaveFileV1 {
  return validateSave(save)
}

// Serialize a save to a deterministic JSON string (stable key order → §15.7).
// Validates first so an invalid save never reaches disk-shaped output.
export function exportSave(save: SaveFileV1): string {
  validateSave(save)
  return stableStringify(save)
}

// Parse a JSON string and validate it as a SaveFileV1 (loud rejection on any
// divergence). Throws on malformed JSON too.
export function importSave(json: string): SaveFileV1 {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (e) {
    throw new Error(`importSave: not valid JSON — ${(e as Error).message}`)
  }
  return validateSave(parsed)
}
