// ── §17 Save format + rev. 4 item M14 + D-9 SaveFileV2 (owner ruling) ─────────
// Historical V1/V2 foundation (the versioned union below now continues through V9):
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
// M14 divergence rules (shared by every version), all rejected loudly:
//   - unknown saveVersion
//   - envelope seed !== state.seed
//   - broadcastCache !== state.broadcastItems (deep equality; aired items only)
//
// stableStringify / deepEqual are UNCHANGED (byte-identity for §15.7).

import { clamp, smoothstep } from "./math.js";
import { RngStream, stream } from "./rng.js";
import { roleOVR } from "./talentSummary.js";
import {
  DISCIPLINE_ORDER,
  GENRE_ORDER,
  ROLE_TO_DISCIPLINE,
  SKILL_ORDER,
  TUNING,
} from "./tuning.js";
import type {
  BroadcastItem,
  Ceilings,
  CreativeRole,
  DevRates,
  Discipline,
  DisciplineSkills,
  GameState,
  GameStateV8,
  GameStateV2,
  GameStateV3,
  GameStateV4,
  GameStateV5,
  GameStateV6,
  GameStateV7,
  Genre,
  LedgerKind,
  PublicityState,
  ScriptDevelopment,
  StudioOperations,
  GenreExperience,
  Persona,
  SkillProfiles,
  Talent,
  TheatricalRun,
  WorkHistory,
} from "./types.js";
import { legacyTheatricalRun } from "./economy.js";
import {
  assertStudioOperationsInvariants,
  emptyStudioOperations,
} from "./operations.js";
import {
  assertScriptDevelopmentInvariants,
  emptyScriptDevelopment,
} from "./scriptDevelopment.js";

// ── Legacy (pre-D-9) talent + state shapes (SaveFileV1 typed honestly) ─────────
// The OLD talent scalar shape the frozen SaveFileV1 carries. Named TalentV1 so
// SaveFileV1 can be typed against old-shape data without pretending it is the new
// multi-discipline Talent.
export type TalentV1 = {
  id: string;
  name: string;
  role: CreativeRole;
  age: number;
  actual: Persona;
  perceived: Persona;
  skill: number; // 0..100 — the OLD scalar ability
  fame: number;
  salary: number;
  authored: boolean;
};

// The frozen V1 GameState — identical to the FROZEN GameStateV2 EXCEPT talent is
// TalentV1[]. Anchored to GameStateV2 (NOT the live GameState) so the D-11
// employment fields do NOT leak into the frozen V1 shape (D-11.16).
export type GameStateV1 = Omit<GameStateV2, "talent"> & { talent: TalentV1[] };

export type SaveFileV1 = {
  saveVersion: 1;
  seed: string;
  state: GameStateV1;
  broadcastCache: BroadcastItem[];
};

// The D-9 V2 envelope — FROZEN pre-employment shape (GameStateV2). D-9
// multi-discipline talent, no employment/contract/ledger/founding fields.
export type SaveFileV2 = {
  saveVersion: 2;
  seed: string;
  state: GameStateV2;
  broadcastCache: BroadcastItem[];
};

// The D-11 V3 envelope — FROZEN pre-D-12 shape (GameStateV3: V2 + employment surface).
// Anchored to GameStateV3 so the D-12 `theatricalRuns` field does NOT leak into V3.
export type SaveFileV3 = {
  saveVersion: 3;
  seed: string;
  state: GameStateV3;
  broadcastCache: BroadcastItem[];
};

// The D-12 V4 envelope — the frozen GameStateV4 (V3 + theatricalRuns). FROZEN + readable;
// D-14 no longer WRITES V4 (new games save V5), but old V4 saves load and upgrade cleanly.
export type SaveFileV4 = {
  saveVersion: 4;
  seed: string;
  state: GameStateV4;
  broadcastCache: BroadcastItem[];
};

// The D-14 V5 envelope — the FROZEN GameStateV5 (V4 + careerEvents). Anchored to
// GameStateV5 (not the live GameState) so the D-17A `economyEngagedEver` field does NOT
// leak into the frozen V5 shape, exactly as V3/V4 are anchored. D-17A no longer WRITES
// V5 (new games save V6), but old V5 saves load and upgrade cleanly.
export type SaveFileV5 = {
  saveVersion: 5;
  seed: string;
  state: GameStateV5;
  broadcastCache: BroadcastItem[];
};

// The D-17A V6 envelope — the FROZEN GameStateV6 (V5 + the persisted engagement fact, R2).
// Anchored to GameStateV6 (not the live GameState) so the D-17B `publicity` field does NOT
// leak into the frozen V6 shape, exactly as V3/V4/V5 are anchored. D-17B no longer WRITES
// V6 (new games save V7), but old V6 saves load and upgrade cleanly.
export type SaveFileV6 = {
  saveVersion: 6;
  seed: string;
  state: GameStateV6;
  broadcastCache: BroadcastItem[];
};

// The D-17B V7 envelope — the FROZEN GameStateV7 (V6 + publicity cooldown state, E4).
// Anchored to GameStateV7 so Production Operations V1 does NOT leak into the frozen
// accepted D-17B format. New games no longer write V7, but old V7 files remain readable.
export type SaveFileV7 = {
  saveVersion: 7;
  seed: string;
  state: GameStateV7;
  broadcastCache: BroadcastItem[];
};

// Production Operations V1 V8 envelope — the FROZEN GameStateV8 (V7 + authoritative
// operations mode/facilities/workflows). Script Projects V1 no longer writes V8.
export type SaveFileV8 = {
  saveVersion: 8;
  seed: string;
  state: GameStateV8;
  broadcastCache: BroadcastItem[];
};

// Script Projects V1 V9 envelope — the live GameState (V8 + authoritative
// screenplay-development state). New games save as V9.
export type SaveFileV9 = {
  saveVersion: 9;
  seed: string;
  state: GameState;
  broadcastCache: BroadcastItem[];
};

// Any envelope (the return of the version-dispatching validateSave/loadSave).
export type SaveFile =
  | SaveFileV1
  | SaveFileV2
  | SaveFileV3
  | SaveFileV4
  | SaveFileV5
  | SaveFileV6
  | SaveFileV7
  | SaveFileV8
  | SaveFileV9;

// ── Stable stringify (UNCHANGED) ─────────────────────────────────────────────
// Recursively serializes with object keys sorted lexicographically, so the same
// logical value always yields byte-identical JSON regardless of insertion order.
// Arrays keep their order (order is meaningful). Only the JSON-representable
// subset is expected here (the save is plain data); undefined-valued object
// properties are omitted exactly as JSON.stringify would omit them.
export function stableStringify(value: unknown): string {
  return build(value);
}

function build(v: unknown): string {
  if (v === null) return "null";
  const t = typeof v;
  if (t === "number") {
    // Match JSON.stringify: non-finite numbers serialize as null.
    return Number.isFinite(v) ? String(v) : "null";
  }
  if (t === "boolean") return v ? "true" : "false";
  if (t === "string") return JSON.stringify(v);
  if (t === "undefined" || t === "function") return "null"; // only reached inside arrays
  if (Array.isArray(v)) {
    return `[${v.map((el) => (el === undefined ? "null" : build(el))).join(",")}]`;
  }
  if (t === "object") {
    const obj = v as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const parts: string[] = [];
    for (const k of keys) {
      const val = obj[k];
      if (val === undefined || typeof val === "function") continue; // JSON omits these
      parts.push(`${JSON.stringify(k)}:${build(val)}`);
    }
    return `{${parts.join(",")}}`;
  }
  // bigint / symbol are not part of the save's data model
  throw new Error(`stableStringify: unsupported value of type ${t}`);
}

// ── Deep equality (UNCHANGED) ────────────────────────────────────────────────
// Structural equality over the JSON-representable save subset. Used for M14's
// broadcastCache ≡ state.broadcastItems check.
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    const ak = Object.keys(ao);
    const bk = Object.keys(bo);
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
      if (!Object.prototype.hasOwnProperty.call(bo, k)) return false;
      if (!deepEqual(ao[k], bo[k])) return false;
    }
    return true;
  }
  return false;
}

// ── Shared envelope-shape checks (version-agnostic) ──────────────────────────
// Enforce the three version-agnostic M14 divergence rules. Throws loudly.
function checkEnvelope(
  s: Record<string, unknown>,
  label: string,
): Record<string, unknown> {
  if (typeof s.seed !== "string") {
    throw new Error(`${label}: envelope seed is missing or not a string`);
  }
  if (s.state === null || typeof s.state !== "object") {
    throw new Error(`${label}: state is missing or not an object`);
  }
  const state = s.state as Record<string, unknown>;
  if (state.seed !== s.seed) {
    throw new Error(
      `${label}: envelope seed ${JSON.stringify(s.seed)} does not equal state.seed ${JSON.stringify(state.seed)}`,
    );
  }
  if (!Array.isArray(s.broadcastCache)) {
    throw new Error(`${label}: broadcastCache is missing or not an array`);
  }
  if (!Array.isArray(state.broadcastItems)) {
    throw new Error(
      `${label}: state.broadcastItems is missing or not an array`,
    );
  }
  if (!deepEqual(s.broadcastCache, state.broadcastItems)) {
    throw new Error(
      `${label}: broadcastCache does not deep-equal state.broadcastItems (M14: the two must be identical)`,
    );
  }
  return state;
}

// ── V1 validation (ORIGINAL rules, UNCHANGED) ────────────────────────────────
// Throws on any divergence; returns the narrowed SaveFileV1 (old-shape talent).
// The V1 rules are exactly the pre-D-9 rules; nothing about them changed.
export function validateSaveV1(save: unknown): SaveFileV1 {
  if (save === null || typeof save !== "object") {
    throw new Error("validateSaveV1: save is not an object");
  }
  const s = save as Record<string, unknown>;
  if (s.saveVersion !== 1) {
    throw new Error(
      `validateSaveV1: expected saveVersion 1, got ${JSON.stringify(s.saveVersion)}`,
    );
  }
  checkEnvelope(s, "validateSaveV1");
  return save as SaveFileV1;
}

// ── V2 validation (D-9 shape) ────────────────────────────────────────────────
// Same envelope rules as V1; the difference is the talent shape it carries (not
// re-validated field-by-field here — the save is plain data, as V1 was).
export function validateSaveV2(save: unknown): SaveFileV2 {
  if (save === null || typeof save !== "object") {
    throw new Error("validateSaveV2: save is not an object");
  }
  const s = save as Record<string, unknown>;
  if (s.saveVersion !== 2) {
    throw new Error(
      `validateSaveV2: expected saveVersion 2, got ${JSON.stringify(s.saveVersion)}`,
    );
  }
  checkEnvelope(s, "validateSaveV2");
  return save as SaveFileV2;
}

// ── V3 validation (D-11 shape) ───────────────────────────────────────────────
// Same envelope rules as V1/V2; the difference is the state carries the D-11
// employment surface (not re-validated field-by-field — the save is plain data).
export function validateSaveV3(save: unknown): SaveFileV3 {
  if (save === null || typeof save !== "object") {
    throw new Error("validateSaveV3: save is not an object");
  }
  const s = save as Record<string, unknown>;
  if (s.saveVersion !== 3) {
    throw new Error(
      `validateSaveV3: expected saveVersion 3, got ${JSON.stringify(s.saveVersion)}`,
    );
  }
  checkEnvelope(s, "validateSaveV3");
  return save as SaveFileV3;
}

// The D-12 V4 envelope validator (adds theatricalRuns; same envelope shape check).
export function validateSaveV4(save: unknown): SaveFileV4 {
  if (save === null || typeof save !== "object") {
    throw new Error("validateSaveV4: save is not an object");
  }
  const s = save as Record<string, unknown>;
  if (s.saveVersion !== 4) {
    throw new Error(
      `validateSaveV4: expected saveVersion 4, got ${JSON.stringify(s.saveVersion)}`,
    );
  }
  checkEnvelope(s, "validateSaveV4");
  return save as SaveFileV4;
}

// The D-14 V5 envelope validator (adds careerEvents; same envelope shape check).
export function validateSaveV5(save: unknown): SaveFileV5 {
  if (save === null || typeof save !== "object") {
    throw new Error("validateSaveV5: save is not an object");
  }
  const s = save as Record<string, unknown>;
  if (s.saveVersion !== 5) {
    throw new Error(
      `validateSaveV5: expected saveVersion 5, got ${JSON.stringify(s.saveVersion)}`,
    );
  }
  checkEnvelope(s, "validateSaveV5");
  return save as SaveFileV5;
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
  if (save === null || typeof save !== "object") {
    throw new Error("validateSaveV6: save is not an object");
  }
  const s = save as Record<string, unknown>;
  if (s.saveVersion !== 6) {
    throw new Error(
      `validateSaveV6: expected saveVersion 6, got ${JSON.stringify(s.saveVersion)}`,
    );
  }
  const state = checkEnvelope(s, "validateSaveV6");
  if (typeof state.economyEngagedEver !== "boolean") {
    throw new Error(
      `validateSaveV6: state.economyEngagedEver is missing or not a boolean (got ${JSON.stringify(state.economyEngagedEver)}) — the persisted engagement fact (R2) must be explicit; a missing value would silently disengage the studio economy`,
    );
  }
  return save as SaveFileV6;
}

// Shared V7 state validation. Kept label-parametric so V7 preserves its accepted error
// boundary while V8 inherits the exact same regime/publicity checks before validating its
// new authoritative operations state.
function checkV7State(state: Record<string, unknown>, label: string): void {
  if (typeof state.economyEngagedEver !== "boolean") {
    throw new Error(
      `${label}: state.economyEngagedEver is missing or not a boolean (got ${JSON.stringify(state.economyEngagedEver)}) — the persisted engagement fact (R2) must be explicit; a missing value would silently disengage the studio economy`,
    );
  }
  const publicity = state.publicity;
  if (publicity === null || typeof publicity !== "object") {
    throw new Error(`${label}: state.publicity is missing or not an object`);
  }
  const clocks = publicity as Record<string, unknown>;
  const validClock = (value: unknown): boolean =>
    value === null ||
    (typeof value === "number" && Number.isInteger(value) && value >= 0);
  if (!validClock(clocks.lastUsedWeek)) {
    throw new Error(
      `${label}: state.publicity.lastUsedWeek must be null or a non-negative integer (got ${JSON.stringify(clocks.lastUsedWeek)})`,
    );
  }
  const byTier = clocks.byTier;
  if (byTier === null || typeof byTier !== "object") {
    throw new Error(
      `${label}: state.publicity.byTier is missing or not an object`,
    );
  }
  const tierClocks = byTier as Record<string, unknown>;
  for (const tier of ["whisper", "push", "blitz"] as const) {
    if (!validClock(tierClocks[tier])) {
      throw new Error(
        `${label}: state.publicity.byTier.${tier} must be null or a non-negative integer (got ${JSON.stringify(tierClocks[tier])})`,
      );
    }
  }
}

// The D-17B V7 envelope validator inherits V6's mandatory regime-fact check and validates the
// complete publicity clock shape. A V7 file is never migrated/defaulted by migrateToV7: it
// passes through by identity. Accepting either field as missing would therefore not degrade a
// display — it would silently disengage the economy or crash the first publicity read. Both must
// fail loudly at the import boundary. Older V1–V6 files still receive deterministic defaults in
// their explicit converters.
export function validateSaveV7(save: unknown): SaveFileV7 {
  if (save === null || typeof save !== "object") {
    throw new Error("validateSaveV7: save is not an object");
  }
  const s = save as Record<string, unknown>;
  if (s.saveVersion !== 7) {
    throw new Error(
      `validateSaveV7: expected saveVersion 7, got ${JSON.stringify(s.saveVersion)}`,
    );
  }
  const state = checkEnvelope(s, "validateSaveV7");
  checkV7State(state, "validateSaveV7");
  return save as SaveFileV7;
}

const OPERATIONS_CAPABILITIES = [
  "development-casting",
  "soundstage",
  "set-scenery",
  "post",
] as const;
const OPERATIONS_PHASES = [
  "development",
  "preProduction",
  "rehearsal",
  "shooting",
  "postProduction",
  "releaseReady",
] as const;
const SHOOTING_TASK_STATUSES = [
  "unassigned",
  "blocked",
  "ready",
  "scheduled",
  "completed",
] as const;

type OperationsCapability = (typeof OPERATIONS_CAPABILITIES)[number];
type OperationsPhase = (typeof OPERATIONS_PHASES)[number];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const V8_STATE_KEYS = [
  "seed",
  "rngState",
  "market",
  "era",
  "studio",
  "talent",
  "concepts",
  "broadcastItems",
  "coverageContexts",
  "founding",
  "contracts",
  "ledger",
  "freeAgents",
  "theatricalRuns",
  "careerEvents",
  "economyEngagedEver",
  "publicity",
  "operations",
] as const;
const CREATIVE_ROLES = ["writer", "director", "actor", "craft"] as const;
const CAST_SLOTS = ["lead", "antagonist", "support"] as const;
const SEGMENT_IDS = ["youngAdult", "family", "adult", "prestige"] as const;
const CULTURAL_FORCES = [
  "escapism",
  "patriotism",
  "realism",
  "darkness",
  "optimism",
  "spectacle",
] as const;
const OPENINGS = ["immediateAction", "slowSetup", "mysteryHook"] as const;
const MIDPOINTS = ["reversal", "escalation", "revelation"] as const;
const ENDINGS = ["triumph", "bittersweet", "tragic", "ambiguous"] as const;
const FORECAST_BANDS = ["weak", "mixed", "strong"] as const;
const CONFIDENCES = ["low", "medium", "high"] as const;
const FORECAST_FACTORS = [
  "castFame",
  "roleFit",
  "directorSkill",
  "scriptStrength",
  "shapeAffinity",
  "segmentTaste",
  "culturalTiming",
  "unknownLead",
  "untestedDirectorGenre",
  "noSegmentHistory",
  "vaguePromise",
] as const;
const PARTICIPANT_ROLES = [
  "writer",
  "director",
  "lead",
  "antagonist",
  "support",
  "craft",
] as const;
const LEDGER_KINDS = [
  "production",
  "boxOffice",
  "payroll",
  "signingBonus",
  "termination",
  "freelancerFee",
  "studioRevenue",
  "overhead",
  "publicity",
] as const;
const CAREER_REASON_CODES = [
  "substantialLeadExposure",
  "supportingRoleVisibility",
  "limitedAudienceReach",
  "strongAudienceResponse",
  "weakAudienceResponse",
  "exceededCommercialExpectations",
  "missedCommercialExpectations",
  "establishedStarSaturation",
  "noMeaningfulCareerChange",
] as const;

function v8Error(label: string, message: string): never {
  const normalized = label.startsWith("validateSaveV8: ")
    ? label.slice("validateSaveV8: ".length)
    : label;
  throw new Error(`validateSaveV8: ${normalized} ${message}`);
}

function v8Record(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) return v8Error(label, "must be a plain object");
  return value;
}

function v8Array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) return v8Error(label, "must be an array");
  return value;
}

function v8ExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[],
  label: string,
): void {
  const allowed = new Set([...required, ...optional]);
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      v8Error(label, `is missing required field ${JSON.stringify(key)}`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key))
      v8Error(label, `has unknown field ${JSON.stringify(key)}`);
  }
}

function v8String(value: unknown, label: string, nonEmpty = false): string {
  if (typeof value !== "string" || (nonEmpty && value.length === 0)) {
    return v8Error(label, `must be ${nonEmpty ? "a non-empty " : "a "}string`);
  }
  return value;
}

function v8Boolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") return v8Error(label, "must be a boolean");
  return value;
}

function v8Number(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return v8Error(label, "must be a finite number");
  }
  return value;
}

function v8Integer(
  value: unknown,
  label: string,
  min?: number,
  max?: number,
): number {
  const number = v8Number(value, label);
  if (!Number.isInteger(number)) v8Error(label, "must be an integer");
  if (min !== undefined && number < min)
    v8Error(label, `must be at least ${min}`);
  if (max !== undefined && number > max)
    v8Error(label, `must be at most ${max}`);
  return number;
}

function v8Enum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): T {
  if (
    typeof value !== "string" ||
    !(allowed as readonly string[]).includes(value)
  ) {
    return v8Error(label, `must be one of ${allowed.join(", ")}`);
  }
  return value as T;
}

function v8OptionalString(
  record: Record<string, unknown>,
  key: string,
  label: string,
): void {
  if (Object.prototype.hasOwnProperty.call(record, key)) {
    v8String(record[key], `${label}.${key}`, true);
  }
}

function v8AssertPlainJson(value: unknown, label: string): void {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) v8Error(label, "contains a non-finite number");
    return;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(value, i)) {
        v8Error(label, `contains a sparse array hole at index ${i}`);
      }
      v8AssertPlainJson(value[i], `${label}[${i}]`);
    }
    return;
  }
  if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      v8AssertPlainJson(child, `${label}.${key}`);
    }
    return;
  }
  v8Error(label, `contains non-JSON value of type ${typeof value}`);
}

function v8NumberRecord(
  value: unknown,
  keys: readonly string[],
  label: string,
): Record<string, unknown> {
  const record = v8Record(value, label);
  v8ExactKeys(record, keys, [], label);
  for (const key of keys) v8Number(record[key], `${label}.${key}`);
  return record;
}

function v8StringArray(
  value: unknown,
  label: string,
  allowed?: ReadonlySet<string>,
): string[] {
  const array = v8Array(value, label);
  return array.map((entry, index) => {
    const string = v8String(entry, `${label}[${index}]`, true);
    if (allowed !== undefined && !allowed.has(string)) {
      v8Error(
        `${label}[${index}]`,
        `references unknown id ${JSON.stringify(string)}`,
      );
    }
    return string;
  });
}

function v8Persona(value: unknown, label: string): void {
  v8NumberRecord(value, ["warmth", "gravity", "physicality"], label);
}

function v8Expression(value: unknown, label: string): void {
  v8NumberRecord(value, ["intimacy", "tonalWeight", "kineticEnergy"], label);
}

function v8Range(value: unknown, label: string): void {
  const range = v8Array(value, label);
  if (range.length !== 2)
    v8Error(label, "must contain exactly two finite endpoints");
  v8Number(range[0], `${label}[0]`);
  v8Number(range[1], `${label}[1]`);
}

function v8FilmShape(value: unknown, label: string): void {
  const shape = v8Record(value, label);
  v8ExactKeys(shape, ["opening", "midpoint", "ending"], [], label);
  v8Enum(shape.opening, OPENINGS, `${label}.opening`);
  v8Enum(shape.midpoint, MIDPOINTS, `${label}.midpoint`);
  v8Enum(shape.ending, ENDINGS, `${label}.ending`);
}

function v8Promise(value: unknown, label: string): void {
  const promise = v8Record(value, label);
  v8ExactKeys(promise, ["genre", "intendedSegments", "ranges"], [], label);
  v8Enum(promise.genre, GENRE_ORDER, `${label}.genre`);
  const segments = v8Array(
    promise.intendedSegments,
    `${label}.intendedSegments`,
  );
  for (let i = 0; i < segments.length; i++) {
    v8Enum(segments[i], SEGMENT_IDS, `${label}.intendedSegments[${i}]`);
  }
  const ranges = v8Record(promise.ranges, `${label}.ranges`);
  v8ExactKeys(
    ranges,
    ["intimacy", "tonalWeight", "kineticEnergy"],
    [],
    `${label}.ranges`,
  );
  v8Range(ranges.intimacy, `${label}.ranges.intimacy`);
  v8Range(ranges.tonalWeight, `${label}.ranges.tonalWeight`);
  v8Range(ranges.kineticEnergy, `${label}.ranges.kineticEnergy`);
}

function v8Budget(value: unknown, label: string): void {
  v8NumberRecord(value, ["negative", "marketing"], label);
}

function v8Forecast(value: unknown, label: string): void {
  const forecast = v8Record(value, label);
  v8ExactKeys(
    forecast,
    ["segments", "expectedOpening", "expectedTotal", "expectedCriticScore"],
    [],
    label,
  );
  v8Number(forecast.expectedOpening, `${label}.expectedOpening`);
  v8Number(forecast.expectedTotal, `${label}.expectedTotal`);
  v8Number(forecast.expectedCriticScore, `${label}.expectedCriticScore`);
  const segments = v8Array(forecast.segments, `${label}.segments`);
  const seenSegments = new Set<string>();
  for (let i = 0; i < segments.length; i++) {
    const segmentLabel = `${label}.segments[${i}]`;
    const segment = v8Record(segments[i], segmentLabel);
    v8ExactKeys(
      segment,
      [
        "segmentId",
        "center",
        "estimate",
        "low",
        "high",
        "expectedBand",
        "confidence",
        "causalFactors",
        "uncertaintyFactors",
        "opening",
      ],
      [],
      segmentLabel,
    );
    const segmentId = v8Enum(
      segment.segmentId,
      SEGMENT_IDS,
      `${segmentLabel}.segmentId`,
    );
    if (seenSegments.has(segmentId)) {
      v8Error(`${segmentLabel}.segmentId`, "is duplicated");
    }
    if (segmentId !== SEGMENT_IDS[i]) {
      v8Error(
        `${segmentLabel}.segmentId`,
        `is out of canonical order (expected ${JSON.stringify(SEGMENT_IDS[i])} at index ${i})`,
      );
    }
    seenSegments.add(segmentId);
    for (const key of ["center", "estimate", "low", "high"] as const) {
      v8Number(segment[key], `${segmentLabel}.${key}`);
    }
    v8Enum(
      segment.expectedBand,
      FORECAST_BANDS,
      `${segmentLabel}.expectedBand`,
    );
    v8Enum(segment.confidence, CONFIDENCES, `${segmentLabel}.confidence`);
    for (const key of ["causalFactors", "uncertaintyFactors"] as const) {
      const factors = v8Array(segment[key], `${segmentLabel}.${key}`);
      for (let j = 0; j < factors.length; j++) {
        v8Enum(factors[j], FORECAST_FACTORS, `${segmentLabel}.${key}[${j}]`);
      }
    }
    v8NumberRecord(
      segment.opening,
      ["center", "estimate", "low", "high"],
      `${segmentLabel}.opening`,
    );
  }
  if (seenSegments.size !== SEGMENT_IDS.length) {
    v8Error(
      `${label}.segments`,
      "must contain each canonical segment exactly once",
    );
  }
}

function v8Participant(
  value: unknown,
  label: string,
  talentIds: ReadonlySet<string>,
): void {
  const participant = v8Record(value, label);
  v8ExactKeys(
    participant,
    [
      "talentId",
      "name",
      "role",
      "discipline",
      "greenlightOVR",
      "greenlightFit",
      "greenlightEP",
      "freelancer",
    ],
    [],
    label,
  );
  const talentId = v8String(participant.talentId, `${label}.talentId`, true);
  if (!talentIds.has(talentId))
    v8Error(`${label}.talentId`, "references unknown talent");
  v8String(participant.name, `${label}.name`, true);
  v8Enum(participant.role, PARTICIPANT_ROLES, `${label}.role`);
  v8Enum(participant.discipline, DISCIPLINE_ORDER, `${label}.discipline`);
  v8Number(participant.greenlightOVR, `${label}.greenlightOVR`);
  v8Number(participant.greenlightFit, `${label}.greenlightFit`);
  v8NumberRecord(
    participant.greenlightEP,
    ["low", "high", "expected"],
    `${label}.greenlightEP`,
  );
  v8Boolean(participant.freelancer, `${label}.freelancer`);
}

function v8Participants(
  value: unknown,
  label: string,
  talentIds: ReadonlySet<string>,
): void {
  const participants = v8Record(value, label);
  v8ExactKeys(participants, ["writer", "director", "cast", "craft"], [], label);
  v8Participant(participants.writer, `${label}.writer`, talentIds);
  v8Participant(participants.director, `${label}.director`, talentIds);
  const cast = v8Record(participants.cast, `${label}.cast`);
  v8ExactKeys(cast, CAST_SLOTS, [], `${label}.cast`);
  for (const slot of CAST_SLOTS)
    v8Participant(cast[slot], `${label}.cast.${slot}`, talentIds);
  const craft = v8Array(participants.craft, `${label}.craft`);
  for (let i = 0; i < craft.length; i++) {
    v8Participant(craft[i], `${label}.craft[${i}]`, talentIds);
  }
}

function v8Production(
  value: unknown,
  label: string,
  talentIds: ReadonlySet<string>,
  conceptIds: ReadonlySet<string>,
): string {
  const production = v8Record(value, label);
  v8ExactKeys(
    production,
    [
      "id",
      "conceptId",
      "shape",
      "promise",
      "writerId",
      "directorId",
      "craftIds",
      "cast",
      "budget",
      "startTick",
      "remainingTicks",
      "forecastSnapshot",
    ],
    ["participants"],
    label,
  );
  const id = v8String(production.id, `${label}.id`, true);
  const conceptId = v8String(production.conceptId, `${label}.conceptId`, true);
  if (!conceptIds.has(conceptId))
    v8Error(`${label}.conceptId`, "references unknown concept");
  v8FilmShape(production.shape, `${label}.shape`);
  v8Promise(production.promise, `${label}.promise`);
  for (const key of ["writerId", "directorId"] as const) {
    const talentId = v8String(production[key], `${label}.${key}`, true);
    if (!talentIds.has(talentId))
      v8Error(`${label}.${key}`, "references unknown talent");
  }
  v8StringArray(production.craftIds, `${label}.craftIds`, talentIds);
  const cast = v8Record(production.cast, `${label}.cast`);
  v8ExactKeys(cast, CAST_SLOTS, [], `${label}.cast`);
  for (const slot of CAST_SLOTS) {
    const talentId = v8String(cast[slot], `${label}.cast.${slot}`, true);
    if (!talentIds.has(talentId))
      v8Error(`${label}.cast.${slot}`, "references unknown talent");
  }
  v8Budget(production.budget, `${label}.budget`);
  v8Integer(production.startTick, `${label}.startTick`, 0);
  v8Integer(
    production.remainingTicks,
    `${label}.remainingTicks`,
    1,
    TUNING.PRODUCTION_TICKS,
  );
  v8Forecast(production.forecastSnapshot, `${label}.forecastSnapshot`);
  if (Object.prototype.hasOwnProperty.call(production, "participants")) {
    v8Participants(production.participants, `${label}.participants`, talentIds);
  }
  return id;
}

function v8Talent(value: unknown, label: string): string {
  const talent = v8Record(value, label);
  v8ExactKeys(
    talent,
    [
      "id",
      "name",
      "role",
      "age",
      "actual",
      "perceived",
      "fame",
      "salary",
      "authored",
      "skills",
      "ceilings",
      "devRate",
      "workEthic",
      "genreExperience",
      "workHistory",
      "skill",
    ],
    [],
    label,
  );
  const id = v8String(talent.id, `${label}.id`, true);
  v8String(talent.name, `${label}.name`, true);
  v8Enum(talent.role, CREATIVE_ROLES, `${label}.role`);
  // Generated ages are continuous; only finiteness is a runtime requirement.
  v8Number(talent.age, `${label}.age`);
  v8Persona(talent.actual, `${label}.actual`);
  v8Persona(talent.perceived, `${label}.perceived`);
  for (const key of ["fame", "salary", "workEthic", "skill"] as const) {
    v8Number(talent[key], `${label}.${key}`);
  }
  v8Boolean(talent.authored, `${label}.authored`);

  const skills = v8Record(talent.skills, `${label}.skills`);
  const ceilings = v8Record(talent.ceilings, `${label}.ceilings`);
  const devRate = v8Record(talent.devRate, `${label}.devRate`);
  const workHistory = v8Record(talent.workHistory, `${label}.workHistory`);
  const genreExperience = v8Record(
    talent.genreExperience,
    `${label}.genreExperience`,
  );
  for (const record of [
    skills,
    ceilings,
    devRate,
    workHistory,
    genreExperience,
  ]) {
    v8ExactKeys(record, DISCIPLINE_ORDER, [], label);
  }
  for (const discipline of DISCIPLINE_ORDER) {
    const skillKeys = SKILL_ORDER[discipline];
    const disciplineSkills = v8Record(
      skills[discipline],
      `${label}.skills.${discipline}`,
    );
    const disciplineCeilings = v8Record(
      ceilings[discipline],
      `${label}.ceilings.${discipline}`,
    );
    v8ExactKeys(
      disciplineSkills,
      skillKeys,
      [],
      `${label}.skills.${discipline}`,
    );
    v8ExactKeys(
      disciplineCeilings,
      skillKeys,
      [],
      `${label}.ceilings.${discipline}`,
    );
    for (const skillKey of skillKeys) {
      const pair = v8Record(
        disciplineSkills[skillKey],
        `${label}.skills.${discipline}.${skillKey}`,
      );
      v8ExactKeys(
        pair,
        ["actual", "perceived"],
        [],
        `${label}.skills.${discipline}.${skillKey}`,
      );
      v8Number(pair.actual, `${label}.skills.${discipline}.${skillKey}.actual`);
      v8Number(
        pair.perceived,
        `${label}.skills.${discipline}.${skillKey}.perceived`,
      );
      v8Number(
        disciplineCeilings[skillKey],
        `${label}.ceilings.${discipline}.${skillKey}`,
      );
    }
    v8Number(devRate[discipline], `${label}.devRate.${discipline}`);
    v8Integer(workHistory[discipline], `${label}.workHistory.${discipline}`, 0);
    const disciplineExperience = v8Record(
      genreExperience[discipline],
      `${label}.genreExperience.${discipline}`,
    );
    v8ExactKeys(
      disciplineExperience,
      GENRE_ORDER,
      [],
      `${label}.genreExperience.${discipline}`,
    );
    for (const genre of GENRE_ORDER) {
      const pair = v8Record(
        disciplineExperience[genre],
        `${label}.genreExperience.${discipline}.${genre}`,
      );
      v8ExactKeys(
        pair,
        ["actual", "perceived"],
        [],
        `${label}.genreExperience.${discipline}.${genre}`,
      );
      v8Number(
        pair.actual,
        `${label}.genreExperience.${discipline}.${genre}.actual`,
      );
      v8Number(
        pair.perceived,
        `${label}.genreExperience.${discipline}.${genre}.perceived`,
      );
    }
  }
  return id;
}

function v8Concept(value: unknown, label: string): string {
  const concept = v8Record(value, label);
  v8ExactKeys(
    concept,
    [
      "id",
      "title",
      "genre",
      "baselineStrength",
      "originalityRaw",
      "baseNegativeCost",
      "requiredSlots",
      "roleRequirements",
    ],
    [],
    label,
  );
  const id = v8String(concept.id, `${label}.id`, true);
  v8String(concept.title, `${label}.title`, true);
  v8Enum(concept.genre, GENRE_ORDER, `${label}.genre`);
  v8Number(concept.baselineStrength, `${label}.baselineStrength`);
  v8Number(concept.originalityRaw, `${label}.originalityRaw`);
  v8Number(concept.baseNegativeCost, `${label}.baseNegativeCost`);
  const slots = v8Array(concept.requiredSlots, `${label}.requiredSlots`);
  for (let i = 0; i < slots.length; i++) {
    v8Enum(slots[i], CAST_SLOTS, `${label}.requiredSlots[${i}]`);
  }
  const requirements = v8Record(
    concept.roleRequirements,
    `${label}.roleRequirements`,
  );
  v8ExactKeys(requirements, CAST_SLOTS, [], `${label}.roleRequirements`);
  for (const slot of CAST_SLOTS) {
    const requirement = v8Record(
      requirements[slot],
      `${label}.roleRequirements.${slot}`,
    );
    v8ExactKeys(
      requirement,
      ["target", "tolerance"],
      [],
      `${label}.roleRequirements.${slot}`,
    );
    v8Persona(requirement.target, `${label}.roleRequirements.${slot}.target`);
    v8Number(
      requirement.tolerance,
      `${label}.roleRequirements.${slot}.tolerance`,
    );
  }
  return id;
}

function v8Market(value: unknown, label: string): void {
  const market = v8Record(value, label);
  v8ExactKeys(
    market,
    ["tick", "forces", "segments", "baseMarketValue", "competingSlate"],
    [],
    label,
  );
  v8Integer(market.tick, `${label}.tick`, 0);
  v8NumberRecord(market.forces, CULTURAL_FORCES, `${label}.forces`);
  v8Number(market.baseMarketValue, `${label}.baseMarketValue`);
  const segments = v8Array(market.segments, `${label}.segments`);
  const seenSegments = new Set<string>();
  for (let i = 0; i < segments.length; i++) {
    const segmentLabel = `${label}.segments[${i}]`;
    const segment = v8Record(segments[i], segmentLabel);
    v8ExactKeys(segment, ["id", "share", "taste"], [], segmentLabel);
    const id = v8Enum(segment.id, SEGMENT_IDS, `${segmentLabel}.id`);
    if (seenSegments.has(id)) v8Error(`${segmentLabel}.id`, "is duplicated");
    seenSegments.add(id);
    v8Number(segment.share, `${segmentLabel}.share`);
    v8Expression(segment.taste, `${segmentLabel}.taste`);
  }
  if (seenSegments.size !== SEGMENT_IDS.length) {
    v8Error(
      `${label}.segments`,
      "must contain each canonical segment exactly once",
    );
  }
  const competing = v8Array(market.competingSlate, `${label}.competingSlate`);
  for (let i = 0; i < competing.length; i++) {
    v8NumberRecord(
      competing[i],
      ["marketPressure"],
      `${label}.competingSlate[${i}]`,
    );
  }
}

function v8Era(value: unknown, label: string): void {
  const era = v8Record(value, label);
  v8ExactKeys(
    era,
    ["soundRequired", "televisionCompetition", "censorship", "costScale"],
    [],
    label,
  );
  v8Boolean(era.soundRequired, `${label}.soundRequired`);
  v8Boolean(era.televisionCompetition, `${label}.televisionCompetition`);
  v8Enum(
    era.censorship,
    ["none", "code", "ratings"] as const,
    `${label}.censorship`,
  );
  v8Number(era.costScale, `${label}.costScale`);
}

function v8FilmResult(
  value: unknown,
  label: string,
  talentIds: ReadonlySet<string>,
  conceptIds: ReadonlySet<string>,
): string {
  const film = v8Record(value, label);
  v8ExactKeys(
    film,
    [
      "productionId",
      "releaseTick",
      "delivered",
      "cohesion",
      "craft",
      "criticMean",
      "criticSigma",
      "criticScore",
      "reviewVariance",
      "segmentScores",
      "boxOffice",
      "conceptId",
      "directorId",
    ],
    ["participants", "forecast"],
    label,
  );
  const productionId = v8String(
    film.productionId,
    `${label}.productionId`,
    true,
  );
  v8Integer(film.releaseTick, `${label}.releaseTick`, 0);
  v8Expression(film.delivered, `${label}.delivered`);
  for (const key of [
    "cohesion",
    "craft",
    "criticMean",
    "criticSigma",
    "criticScore",
    "reviewVariance",
  ] as const) {
    v8Number(film[key], `${label}.${key}`);
  }
  v8NumberRecord(film.segmentScores, SEGMENT_IDS, `${label}.segmentScores`);
  v8NumberRecord(film.boxOffice, ["opening", "total"], `${label}.boxOffice`);
  const conceptId = v8String(film.conceptId, `${label}.conceptId`, true);
  if (!conceptIds.has(conceptId))
    v8Error(`${label}.conceptId`, "references unknown concept");
  const directorId = v8String(film.directorId, `${label}.directorId`, true);
  if (!talentIds.has(directorId))
    v8Error(`${label}.directorId`, "references unknown talent");
  if (Object.prototype.hasOwnProperty.call(film, "participants")) {
    v8Participants(film.participants, `${label}.participants`, talentIds);
  }
  if (Object.prototype.hasOwnProperty.call(film, "forecast")) {
    v8NumberRecord(
      film.forecast,
      ["expectedCriticScore", "expectedTotal", "expectedOpening"],
      `${label}.forecast`,
    );
  }
  return productionId;
}

function v8BroadcastItem(value: unknown, label: string): void {
  const item = v8Record(value, label);
  v8ExactKeys(
    item,
    ["subjectId", "topic", "facts", "template", "tick"],
    ["generatedCopy"],
    label,
  );
  v8String(item.subjectId, `${label}.subjectId`, true);
  v8Enum(
    item.topic,
    ["release", "talent", "studio", "cultural"] as const,
    `${label}.topic`,
  );
  v8String(item.template, `${label}.template`);
  v8Integer(item.tick, `${label}.tick`, 0);
  v8OptionalString(item, "generatedCopy", label);
  const facts = v8Record(item.facts, `${label}.facts`);
  v8ExactKeys(
    facts,
    ["subjectId", "direction"],
    ["filmId", "forecastBand", "realizedBand", "primaryCause"],
    `${label}.facts`,
  );
  v8String(facts.subjectId, `${label}.facts.subjectId`, true);
  v8Enum(
    facts.direction,
    ["better", "worse", "asExpected"] as const,
    `${label}.facts.direction`,
  );
  v8OptionalString(facts, "filmId", `${label}.facts`);
  for (const key of ["forecastBand", "realizedBand"] as const) {
    if (Object.prototype.hasOwnProperty.call(facts, key)) {
      v8Enum(facts[key], FORECAST_BANDS, `${label}.facts.${key}`);
    }
  }
  if (Object.prototype.hasOwnProperty.call(facts, "primaryCause")) {
    v8Enum(
      facts.primaryCause,
      ["craft", "cohesion", "promise", "timing", "reach"] as const,
      `${label}.facts.primaryCause`,
    );
  }
}

function v8CoverageContext(value: unknown, label: string): void {
  const context = v8Record(value, label);
  v8ExactKeys(
    context,
    ["subjectId", "previousAngle", "previousResult", "lastMentionTick"],
    [],
    label,
  );
  v8String(context.subjectId, `${label}.subjectId`, true);
  v8Enum(
    context.previousAngle,
    ["doubt", "praise", "neutral"] as const,
    `${label}.previousAngle`,
  );
  if (context.previousResult !== null) {
    v8Enum(
      context.previousResult,
      ["better", "worse", "asExpected"] as const,
      `${label}.previousResult`,
    );
  }
  v8Integer(context.lastMentionTick, `${label}.lastMentionTick`, 0);
}

function v8Founding(
  value: unknown,
  label: string,
  talentIds: ReadonlySet<string>,
): void {
  if (value === null) return;
  const founding = v8Record(value, label);
  v8ExactKeys(founding, ["applicantIds", "budget", "spentBonus"], [], label);
  v8StringArray(founding.applicantIds, `${label}.applicantIds`, talentIds);
  v8Number(founding.budget, `${label}.budget`);
  v8Number(founding.spentBonus, `${label}.spentBonus`);
}

function v8Contract(
  value: unknown,
  label: string,
  talentIds: ReadonlySet<string>,
): void {
  const contract = v8Record(value, label);
  v8ExactKeys(
    contract,
    [
      "talentId",
      "annualSalary",
      "signingBonus",
      "startWeek",
      "endWeekExclusive",
      "termWeeks",
    ],
    [],
    label,
  );
  const talentId = v8String(contract.talentId, `${label}.talentId`, true);
  if (!talentIds.has(talentId))
    v8Error(`${label}.talentId`, "references unknown talent");
  v8Number(contract.annualSalary, `${label}.annualSalary`);
  v8Number(contract.signingBonus, `${label}.signingBonus`);
  v8Integer(contract.startWeek, `${label}.startWeek`, 0);
  v8Integer(contract.endWeekExclusive, `${label}.endWeekExclusive`, 0);
  v8Integer(contract.termWeeks, `${label}.termWeeks`, 0);
}

function v8LedgerEntry(
  value: unknown,
  label: string,
  talentIds: ReadonlySet<string>,
): void {
  const entry = v8Record(value, label);
  v8ExactKeys(
    entry,
    ["week", "kind", "amount", "note"],
    ["talentId", "productionId"],
    label,
  );
  v8Integer(entry.week, `${label}.week`, 0);
  v8Enum(entry.kind, LEDGER_KINDS, `${label}.kind`);
  v8Number(entry.amount, `${label}.amount`);
  v8String(entry.note, `${label}.note`);
  if (Object.prototype.hasOwnProperty.call(entry, "talentId")) {
    const talentId = v8String(entry.talentId, `${label}.talentId`, true);
    if (!talentIds.has(talentId))
      v8Error(`${label}.talentId`, "references unknown talent");
  }
  v8OptionalString(entry, "productionId", label);
}

function v8TheatricalRun(
  value: unknown,
  label: string,
  releasedIds: ReadonlySet<string>,
  conceptIds: ReadonlySet<string>,
): void {
  const run = v8Record(value, label);
  v8ExactKeys(
    run,
    [
      "productionId",
      "conceptId",
      "releaseTick",
      "totalWeeks",
      "weekIndex",
      "weeklyGross",
      "studioShare",
      "cumulativeGrossPaid",
      "cumulativeStudioRevenuePaid",
      "economyModelVersion",
      "status",
    ],
    [],
    label,
  );
  const productionId = v8String(
    run.productionId,
    `${label}.productionId`,
    true,
  );
  if (!releasedIds.has(productionId)) {
    v8Error(`${label}.productionId`, "references an unknown released film");
  }
  const conceptId = v8String(run.conceptId, `${label}.conceptId`, true);
  if (!conceptIds.has(conceptId))
    v8Error(`${label}.conceptId`, "references unknown concept");
  v8Integer(run.releaseTick, `${label}.releaseTick`, 0);
  const totalWeeks = v8Integer(run.totalWeeks, `${label}.totalWeeks`, 1);
  v8Integer(run.weekIndex, `${label}.weekIndex`, 0, totalWeeks);
  const weeklyGross = v8Array(run.weeklyGross, `${label}.weeklyGross`);
  if (weeklyGross.length !== totalWeeks) {
    v8Error(`${label}.weeklyGross`, "length must equal totalWeeks");
  }
  for (let i = 0; i < weeklyGross.length; i++) {
    v8Number(weeklyGross[i], `${label}.weeklyGross[${i}]`);
  }
  for (const key of [
    "studioShare",
    "cumulativeGrossPaid",
    "cumulativeStudioRevenuePaid",
  ] as const) {
    v8Number(run[key], `${label}.${key}`);
  }
  v8Integer(run.economyModelVersion, `${label}.economyModelVersion`, 0);
  v8Enum(
    run.status,
    ["active", "completed", "legacyCompleted"] as const,
    `${label}.status`,
  );
}

function v8CareerEvent(
  value: unknown,
  label: string,
  talentIds: ReadonlySet<string>,
  releasedIds: ReadonlySet<string>,
): void {
  const event = v8Record(value, label);
  v8ExactKeys(
    event,
    [
      "eventId",
      "talentId",
      "filmId",
      "filmTitle",
      "releaseWeek",
      "genre",
      "role",
      "billingWeight",
      "discipline",
      "ovrBefore",
      "ovrAfter",
      "skillsBefore",
      "skillsAfter",
      "skillDeltas",
      "genreExpBefore",
      "genreExpAfter",
      "workHistoryBefore",
      "workHistoryAfter",
      "starPowerBefore",
      "starPowerAfter",
      "starPowerDelta",
      "realizedOpening",
      "realizedTotal",
      "audienceScore",
      "criticScore",
      "forecastComparator",
      "reasonCodes",
    ],
    [],
    label,
  );
  v8String(event.eventId, `${label}.eventId`, true);
  const talentId = v8String(event.talentId, `${label}.talentId`, true);
  if (!talentIds.has(talentId))
    v8Error(`${label}.talentId`, "references unknown talent");
  const filmId = v8String(event.filmId, `${label}.filmId`, true);
  if (!releasedIds.has(filmId))
    v8Error(`${label}.filmId`, "references unknown released film");
  v8String(event.filmTitle, `${label}.filmTitle`, true);
  v8Integer(event.releaseWeek, `${label}.releaseWeek`, 0);
  v8Enum(event.genre, GENRE_ORDER, `${label}.genre`);
  v8Enum(event.role, PARTICIPANT_ROLES, `${label}.role`);
  v8Enum(event.discipline, DISCIPLINE_ORDER, `${label}.discipline`);
  for (const key of [
    "billingWeight",
    "ovrBefore",
    "ovrAfter",
    "genreExpBefore",
    "genreExpAfter",
    "workHistoryBefore",
    "workHistoryAfter",
    "starPowerBefore",
    "starPowerAfter",
    "starPowerDelta",
    "realizedOpening",
    "realizedTotal",
    "audienceScore",
    "criticScore",
    "forecastComparator",
  ] as const) {
    v8Number(event[key], `${label}.${key}`);
  }
  const discipline = v8Enum(
    event.discipline,
    DISCIPLINE_ORDER,
    `${label}.discipline`,
  );
  const skillKeys = SKILL_ORDER[discipline];
  v8NumberRecord(event.skillsBefore, skillKeys, `${label}.skillsBefore`);
  v8NumberRecord(event.skillsAfter, skillKeys, `${label}.skillsAfter`);
  v8NumberRecord(event.skillDeltas, skillKeys, `${label}.skillDeltas`);
  const reasons = v8Array(event.reasonCodes, `${label}.reasonCodes`);
  for (let i = 0; i < reasons.length; i++) {
    v8Enum(reasons[i], CAREER_REASON_CODES, `${label}.reasonCodes[${i}]`);
  }
}

function v8Publicity(value: unknown, label: string): void {
  const publicity = v8Record(value, label);
  v8ExactKeys(publicity, ["lastUsedWeek", "byTier"], [], label);
  const validateClock = (clock: unknown, clockLabel: string): void => {
    if (clock !== null) v8Integer(clock, clockLabel, 0);
  };
  validateClock(publicity.lastUsedWeek, `${label}.lastUsedWeek`);
  const byTier = v8Record(publicity.byTier, `${label}.byTier`);
  v8ExactKeys(byTier, ["whisper", "push", "blitz"], [], `${label}.byTier`);
  for (const tier of ["whisper", "push", "blitz"] as const) {
    validateClock(byTier[tier], `${label}.byTier.${tier}`);
  }
}

function checkV8LiveState(state: Record<string, unknown>): void {
  const label = "state";
  v8ExactKeys(state, V8_STATE_KEYS, [], label);
  v8AssertPlainJson(state, label);
  v8String(state.seed, "state.seed");
  const rngState = v8String(state.rngState, "state.rngState", true);
  try {
    RngStream.deserialize(rngState);
  } catch (error) {
    v8Error("state.rngState", `is invalid — ${(error as Error).message}`);
  }
  v8Market(state.market, "state.market");
  v8Era(state.era, "state.era");

  const talent = v8Array(state.talent, "state.talent");
  const talentIds = new Set<string>();
  for (let i = 0; i < talent.length; i++) {
    const id = v8Talent(talent[i], `state.talent[${i}]`);
    if (talentIds.has(id)) v8Error(`state.talent[${i}].id`, "is duplicated");
    talentIds.add(id);
  }

  const concepts = v8Array(state.concepts, "state.concepts");
  const conceptIds = new Set<string>();
  for (let i = 0; i < concepts.length; i++) {
    const id = v8Concept(concepts[i], `state.concepts[${i}]`);
    if (conceptIds.has(id)) v8Error(`state.concepts[${i}].id`, "is duplicated");
    conceptIds.add(id);
  }

  const studio = v8Record(state.studio, "state.studio");
  v8ExactKeys(
    studio,
    ["cash", "standing", "activeProductions", "releasedFilms"],
    [],
    "state.studio",
  );
  v8Number(studio.cash, "state.studio.cash");
  v8NumberRecord(
    studio.standing,
    ["audienceAwareness", "industryPrestige", "commercialConfidence"],
    "state.studio.standing",
  );
  const active = v8Array(
    studio.activeProductions,
    "state.studio.activeProductions",
  );
  const activeIds = new Set<string>();
  for (let i = 0; i < active.length; i++) {
    const id = v8Production(
      active[i],
      `state.studio.activeProductions[${i}]`,
      talentIds,
      conceptIds,
    );
    if (activeIds.has(id)) {
      v8Error(`state.studio.activeProductions[${i}].id`, "is duplicated");
    }
    activeIds.add(id);
  }
  const released = v8Array(studio.releasedFilms, "state.studio.releasedFilms");
  const releasedIds = new Set<string>();
  for (let i = 0; i < released.length; i++) {
    const id = v8FilmResult(
      released[i],
      `state.studio.releasedFilms[${i}]`,
      talentIds,
      conceptIds,
    );
    if (releasedIds.has(id))
      v8Error(`state.studio.releasedFilms[${i}].productionId`, "is duplicated");
    if (activeIds.has(id)) {
      v8Error(
        `state.studio.releasedFilms[${i}].productionId`,
        "is also an active production",
      );
    }
    releasedIds.add(id);
  }

  v8Founding(state.founding, "state.founding", talentIds);
  const contracts = v8Array(state.contracts, "state.contracts");
  for (let i = 0; i < contracts.length; i++) {
    v8Contract(contracts[i], `state.contracts[${i}]`, talentIds);
  }
  const ledger = v8Array(state.ledger, "state.ledger");
  for (let i = 0; i < ledger.length; i++) {
    v8LedgerEntry(ledger[i], `state.ledger[${i}]`, talentIds);
  }
  v8StringArray(state.freeAgents, "state.freeAgents", talentIds);
  const theatricalRuns = v8Array(state.theatricalRuns, "state.theatricalRuns");
  for (let i = 0; i < theatricalRuns.length; i++) {
    v8TheatricalRun(
      theatricalRuns[i],
      `state.theatricalRuns[${i}]`,
      releasedIds,
      conceptIds,
    );
  }
  const careerEvents = v8Array(state.careerEvents, "state.careerEvents");
  for (let i = 0; i < careerEvents.length; i++) {
    v8CareerEvent(
      careerEvents[i],
      `state.careerEvents[${i}]`,
      talentIds,
      releasedIds,
    );
  }
  const broadcasts = v8Array(state.broadcastItems, "state.broadcastItems");
  for (let i = 0; i < broadcasts.length; i++) {
    v8BroadcastItem(broadcasts[i], `state.broadcastItems[${i}]`);
  }
  const coverage = v8Array(state.coverageContexts, "state.coverageContexts");
  for (let i = 0; i < coverage.length; i++) {
    v8CoverageContext(coverage[i], `state.coverageContexts[${i}]`);
  }
  v8Boolean(state.economyEngagedEver, "state.economyEngagedEver");
  v8Publicity(state.publicity, "state.publicity");
  // `operations` receives exact-key and cross-state validation separately below.
  v8Record(state.operations, "state.operations");
}

function requiredNonEmptyString(
  record: Record<string, unknown>,
  field: string,
  label: string,
): string {
  const value = record[field];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label}.${field} must be a non-empty string`);
  }
  return value;
}

function requiredArray(
  record: Record<string, unknown>,
  field: string,
  label: string,
): unknown[] {
  const value = record[field];
  if (!Array.isArray(value))
    throw new Error(`${label}.${field} is missing or not an array`);
  return value;
}

function asCapability(value: unknown, label: string): OperationsCapability {
  if (!(OPERATIONS_CAPABILITIES as readonly unknown[]).includes(value)) {
    throw new Error(
      `${label} must be a known facility capability (got ${JSON.stringify(value)})`,
    );
  }
  return value as OperationsCapability;
}

function asPhase(value: unknown, label: string): OperationsPhase {
  if (!(OPERATIONS_PHASES as readonly unknown[]).includes(value)) {
    throw new Error(
      `${label} must be a known production phase (got ${JSON.stringify(value)})`,
    );
  }
  return value as OperationsPhase;
}

function phaseForRemainingTicks(
  remainingTicks: number,
): OperationsPhase | null {
  if (remainingTicks === 8) return "development";
  if (remainingTicks === 7) return "preProduction";
  if (remainingTicks === 6) return "rehearsal";
  if (remainingTicks === 5 || remainingTicks === 4) return "shooting";
  if (remainingTicks === 3 || remainingTicks === 2) return "postProduction";
  if (remainingTicks === 1) return "releaseReady";
  return null;
}

const REQUIRED_CAPABILITIES: Readonly<
  Record<OperationsPhase, readonly OperationsCapability[]>
> = {
  development: ["development-casting"],
  preProduction: ["development-casting"],
  rehearsal: ["soundstage"],
  shooting: ["soundstage", "set-scenery"],
  postProduction: ["post"],
  releaseReady: [],
};

const NEXT_PHASE: Readonly<Partial<Record<OperationsPhase, OperationsPhase>>> =
  {
    development: "preProduction",
    preProduction: "rehearsal",
    rehearsal: "shooting",
    shooting: "postProduction",
    postProduction: "releaseReady",
  };

// Validate the complete authoritative operations surface rather than accepting it as
// display-only data. A malformed reservation or workflow changes the release clock, so
// it must fail at import instead of silently overbooking a facility or desynchronizing a
// production. This is deliberately local to the save boundary; it consumes no RNG and
// mutates nothing.
function checkOperationsState(
  state: Record<string, unknown>,
  label: string,
): StudioOperations {
  if (!isRecord(state.operations)) {
    throw new Error(`${label}: state.operations is missing or not an object`);
  }
  const operations = state.operations;
  v8ExactKeys(
    operations,
    ["mode", "facilities", "workflows"],
    [],
    `${label}: state.operations`,
  );
  if (operations.mode !== "legacy" && operations.mode !== "managed") {
    throw new Error(
      `${label}: state.operations.mode must be "legacy" or "managed" (got ${JSON.stringify(operations.mode)})`,
    );
  }
  const facilitiesRaw = requiredArray(
    operations,
    "facilities",
    `${label}: state.operations`,
  );
  const workflowsRaw = requiredArray(
    operations,
    "workflows",
    `${label}: state.operations`,
  );

  if (operations.mode === "legacy") {
    if (facilitiesRaw.length !== 0 || workflowsRaw.length !== 0) {
      throw new Error(
        `${label}: legacy operations must have empty facilities and workflows (migration never invents operational history)`,
      );
    }
    return operations as StudioOperations;
  }

  if (state.economyEngagedEver !== true || state.founding !== null) {
    throw new Error(
      `${label}: managed operations require a founded, economy-engaged studio`,
    );
  }

  const facilities = new Map<
    string,
    { capability: OperationsCapability; capacity: number }
  >();
  for (let i = 0; i < facilitiesRaw.length; i++) {
    const itemLabel = `${label}: state.operations.facilities[${i}]`;
    const raw = facilitiesRaw[i];
    if (!isRecord(raw)) throw new Error(`${itemLabel} is not an object`);
    v8ExactKeys(raw, ["id", "name", "capability", "capacity"], [], itemLabel);
    const id = requiredNonEmptyString(raw, "id", itemLabel);
    requiredNonEmptyString(raw, "name", itemLabel);
    if (facilities.has(id))
      throw new Error(`${label}: duplicate facility id ${JSON.stringify(id)}`);
    const capability = asCapability(raw.capability, `${itemLabel}.capability`);
    if (
      typeof raw.capacity !== "number" ||
      !Number.isInteger(raw.capacity) ||
      raw.capacity <= 0
    ) {
      throw new Error(`${itemLabel}.capacity must be a positive integer`);
    }
    facilities.set(id, { capability, capacity: raw.capacity });
  }
  for (const capability of OPERATIONS_CAPABILITIES) {
    if (
      ![...facilities.values()].some(
        (facility) => facility.capability === capability,
      )
    ) {
      throw new Error(
        `${label}: managed operations have no facility for ${capability}`,
      );
    }
  }

  if (
    !isRecord(state.studio) ||
    !Array.isArray(state.studio.activeProductions)
  ) {
    throw new Error(
      `${label}: state.studio.activeProductions is missing or not an array`,
    );
  }
  const productions = new Map<string, Record<string, unknown>>();
  for (let i = 0; i < state.studio.activeProductions.length; i++) {
    const raw = state.studio.activeProductions[i];
    const itemLabel = `${label}: state.studio.activeProductions[${i}]`;
    if (!isRecord(raw)) throw new Error(`${itemLabel} is not an object`);
    const id = requiredNonEmptyString(raw, "id", itemLabel);
    if (productions.has(id))
      throw new Error(
        `${label}: duplicate active production id ${JSON.stringify(id)}`,
      );
    productions.set(id, raw);
  }

  const workflowIds = new Set<string>();
  const occupiedSlots = new Set<string>();
  const taskIds = new Set<string>();
  for (let i = 0; i < workflowsRaw.length; i++) {
    const raw = workflowsRaw[i];
    const itemLabel = `${label}: state.operations.workflows[${i}]`;
    if (!isRecord(raw)) throw new Error(`${itemLabel} is not an object`);
    v8ExactKeys(
      raw,
      ["productionId", "phase", "reservations", "shootingTask", "blocker"],
      [],
      itemLabel,
    );
    const productionId = requiredNonEmptyString(raw, "productionId", itemLabel);
    if (workflowIds.has(productionId)) {
      throw new Error(
        `${label}: duplicate workflow for production ${JSON.stringify(productionId)}`,
      );
    }
    workflowIds.add(productionId);
    const production = productions.get(productionId);
    if (!production) {
      throw new Error(
        `${itemLabel} references missing active production ${JSON.stringify(productionId)}`,
      );
    }
    const phase = asPhase(raw.phase, `${itemLabel}.phase`);
    if (
      typeof production.remainingTicks !== "number" ||
      !Number.isInteger(production.remainingTicks)
    ) {
      throw new Error(
        `${itemLabel} owns a production with invalid remainingTicks`,
      );
    }
    const expectedPhase = phaseForRemainingTicks(production.remainingTicks);
    if (phase !== expectedPhase) {
      throw new Error(
        `${itemLabel}.phase ${JSON.stringify(phase)} disagrees with remainingTicks ${production.remainingTicks} (expected ${JSON.stringify(expectedPhase)})`,
      );
    }

    const reservationsRaw = requiredArray(raw, "reservations", itemLabel);
    const reservationCapabilities: OperationsCapability[] = [];
    const soundstageFacilityIds = new Set<string>();
    for (let j = 0; j < reservationsRaw.length; j++) {
      const reservation = reservationsRaw[j];
      const reservationLabel = `${itemLabel}.reservations[${j}]`;
      if (!isRecord(reservation))
        throw new Error(`${reservationLabel} is not an object`);
      v8ExactKeys(
        reservation,
        ["productionId", "facilityId", "capability", "slot", "phase"],
        [],
        reservationLabel,
      );
      if (reservation.productionId !== productionId) {
        throw new Error(
          `${reservationLabel}.productionId must match its owning workflow`,
        );
      }
      const facilityId = requiredNonEmptyString(
        reservation,
        "facilityId",
        reservationLabel,
      );
      const facility = facilities.get(facilityId);
      if (!facility) {
        throw new Error(
          `${reservationLabel} references missing facility ${JSON.stringify(facilityId)}`,
        );
      }
      const capability = asCapability(
        reservation.capability,
        `${reservationLabel}.capability`,
      );
      if (capability !== facility.capability) {
        throw new Error(
          `${reservationLabel}.capability disagrees with facility ${JSON.stringify(facilityId)}`,
        );
      }
      if (
        typeof reservation.slot !== "number" ||
        !Number.isInteger(reservation.slot) ||
        reservation.slot < 0 ||
        reservation.slot >= facility.capacity
      ) {
        throw new Error(
          `${reservationLabel}.slot must be an integer in [0, ${facility.capacity - 1}]`,
        );
      }
      if (reservation.phase !== phase) {
        throw new Error(
          `${reservationLabel}.phase must match its owning workflow phase`,
        );
      }
      const slotKey = `${facilityId}\u0000${reservation.slot}`;
      if (occupiedSlots.has(slotKey)) {
        throw new Error(
          `${label}: facility slot (${JSON.stringify(facilityId)}, ${reservation.slot}) is reserved more than once`,
        );
      }
      occupiedSlots.add(slotKey);
      reservationCapabilities.push(capability);
      if (capability === "soundstage") soundstageFacilityIds.add(facilityId);
    }
    const actualCapabilities = [...reservationCapabilities].sort();
    const requiredCapabilities = [...REQUIRED_CAPABILITIES[phase]].sort();
    if (!deepEqual(actualCapabilities, requiredCapabilities)) {
      throw new Error(
        `${itemLabel}.reservations must provide exactly ${requiredCapabilities.join(" + ") || "no facilities"} for ${phase}`,
      );
    }

    const task = raw.shootingTask;
    let taskRecord: Record<string, unknown> | null = null;
    if (task !== null) {
      if (!isRecord(task))
        throw new Error(`${itemLabel}.shootingTask must be null or an object`);
      taskRecord = task;
      v8ExactKeys(
        task,
        ["id", "productionId", "directorId", "soundstageFacilityId", "status"],
        [],
        `${itemLabel}.shootingTask`,
      );
      if (phase !== "shooting") {
        throw new Error(
          `${itemLabel}.shootingTask may exist only during shooting`,
        );
      }
      const taskId = requiredNonEmptyString(
        task,
        "id",
        `${itemLabel}.shootingTask`,
      );
      if (taskIds.has(taskId))
        throw new Error(
          `${label}: duplicate shooting task id ${JSON.stringify(taskId)}`,
        );
      taskIds.add(taskId);
      if (task.productionId !== productionId) {
        throw new Error(
          `${itemLabel}.shootingTask.productionId must match its owning workflow`,
        );
      }
      if (
        typeof production.directorId !== "string" ||
        task.directorId !== production.directorId
      ) {
        throw new Error(
          `${itemLabel}.shootingTask.directorId must be the production's locked director`,
        );
      }
      if (
        typeof task.soundstageFacilityId !== "string" ||
        !soundstageFacilityIds.has(task.soundstageFacilityId)
      ) {
        throw new Error(
          `${itemLabel}.shootingTask must target the production's reserved soundstage`,
        );
      }
      if (
        !(SHOOTING_TASK_STATUSES as readonly unknown[]).includes(task.status)
      ) {
        throw new Error(`${itemLabel}.shootingTask.status is invalid`);
      }
      if (production.remainingTicks === 4 && task.status !== "completed") {
        throw new Error(
          `${itemLabel}.shootingTask must be completed in the second shooting week`,
        );
      }
      if (production.remainingTicks === 5 && task.status === "completed") {
        throw new Error(
          `${itemLabel}.shootingTask cannot be completed before the first shooting week advances`,
        );
      }
    } else if (phase === "shooting") {
      throw new Error(`${itemLabel}.shootingTask is required during shooting`);
    }

    const blocker = raw.blocker;
    if (blocker !== null && !isRecord(blocker)) {
      throw new Error(`${itemLabel}.blocker must be null or an object`);
    }
    if (isRecord(blocker)) {
      if (blocker.kind === "facility-capacity") {
        v8ExactKeys(
          blocker,
          ["kind", "capability", "targetPhase"],
          [],
          `${itemLabel}.blocker`,
        );
        const capability = asCapability(
          blocker.capability,
          `${itemLabel}.blocker.capability`,
        );
        const targetPhase = asPhase(
          blocker.targetPhase,
          `${itemLabel}.blocker.targetPhase`,
        );
        if (NEXT_PHASE[phase] !== targetPhase) {
          throw new Error(
            `${itemLabel}.blocker.targetPhase must be the next scheduled phase`,
          );
        }
        if (!REQUIRED_CAPABILITIES[targetPhase].includes(capability)) {
          throw new Error(
            `${itemLabel}.blocker.capability is not required by its target phase`,
          );
        }
        if (taskRecord !== null && taskRecord.status !== "completed") {
          throw new Error(
            `${itemLabel} cannot have a capacity blocker before its shooting task completes`,
          );
        }
      } else if (blocker.kind === "scenery-load-in") {
        v8ExactKeys(blocker, ["kind", "taskId"], [], `${itemLabel}.blocker`);
        if (
          taskRecord === null ||
          taskRecord.status !== "blocked" ||
          blocker.taskId !== taskRecord.id
        ) {
          throw new Error(
            `${itemLabel}.blocker must reference its blocked shooting task`,
          );
        }
      } else {
        throw new Error(`${itemLabel}.blocker.kind is invalid`);
      }
    }
    if (
      taskRecord?.status === "blocked" &&
      (!isRecord(blocker) || blocker.kind !== "scenery-load-in")
    ) {
      throw new Error(
        `${itemLabel}.shootingTask status "blocked" requires its scenery-load-in blocker`,
      );
    }
    if (
      isRecord(blocker) &&
      blocker.kind === "scenery-load-in" &&
      taskRecord?.status !== "blocked"
    ) {
      throw new Error(
        `${itemLabel}.scenery-load-in blocker requires a blocked shooting task`,
      );
    }
  }

  if (workflowIds.size !== productions.size) {
    const missing = [...productions.keys()].filter(
      (id) => !workflowIds.has(id),
    );
    throw new Error(
      `${label}: managed active productions must have exactly one workflow${missing.length ? ` (missing ${missing.map((id) => JSON.stringify(id)).join(", ")})` : ""}`,
    );
  }
  // The canonical operations module owns exact V1 facility identity/order and every
  // cross-state lifecycle invariant. Calling it after the defensive shape checks above
  // prevents malformed JSON from reaching typed core logic while keeping save acceptance
  // in lockstep with the simulation's authoritative rules.
  assertStudioOperationsInvariants(
    operations as StudioOperations,
    state.studio.activeProductions as GameState["studio"]["activeProductions"],
  );
  return operations as StudioOperations;
}

// Production Operations V1 V8 validator. Operations affect countdown advancement and
// player-action legality, so the live envelope validates their full structural/cross-state
// invariants instead of defaulting corrupt current-version data.
export function validateSaveV8(save: unknown): SaveFileV8 {
  if (!isRecord(save))
    throw new Error("validateSaveV8: save is not a plain object");
  const s = save;
  v8ExactKeys(
    s,
    ["saveVersion", "seed", "state", "broadcastCache"],
    [],
    "save",
  );
  if (s.saveVersion !== 8) {
    throw new Error(
      `validateSaveV8: expected saveVersion 8, got ${JSON.stringify(s.saveVersion)}`,
    );
  }
  const state = checkEnvelope(s, "validateSaveV8");
  if (!isRecord(state))
    throw new Error("validateSaveV8: state is not a plain object");
  checkV7State(state, "validateSaveV8");
  checkV8LiveState(state);
  checkOperationsState(state, "validateSaveV8");
  v8AssertPlainJson(s.broadcastCache, "broadcastCache");
  return save as SaveFileV8;
}

const V9_STATE_KEYS = [...V8_STATE_KEYS, "scriptDevelopment"] as const;
const SCRIPT_PROJECT_STATUSES = [
  "drafting",
  "review",
  "rewriting",
  "ready",
  "inProduction",
  "produced",
] as const;

function v9Error(label: string, message: string): never {
  throw new Error(`validateSaveV9: ${label} ${message}`);
}

function v9Record(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) return v9Error(label, "must be a plain object");
  return value;
}

function v9ExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  label: string,
): void {
  const allowed = new Set(required);
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      v9Error(label, `is missing required field ${JSON.stringify(key)}`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      v9Error(label, `has unknown field ${JSON.stringify(key)}`);
    }
  }
}

function v9String(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    return v9Error(label, "must be a non-empty string");
  }
  return value;
}

function v9Number(
  value: unknown,
  label: string,
  min?: number,
  max?: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return v9Error(label, "must be a finite number");
  }
  if (min !== undefined && value < min)
    v9Error(label, `must be at least ${String(min)}`);
  if (max !== undefined && value > max)
    v9Error(label, `must be at most ${String(max)}`);
  return value;
}

function v9Integer(
  value: unknown,
  label: string,
  min?: number,
  max?: number,
): number {
  const number = v9Number(value, label, min, max);
  if (!Number.isInteger(number)) v9Error(label, "must be an integer");
  return number;
}

function v9NullableInteger(
  value: unknown,
  label: string,
): number | null {
  if (value === null) return null;
  return v9Integer(value, label, 0);
}

function v9FilmShape(value: unknown, label: string): void {
  const shape = v9Record(value, label);
  v9ExactKeys(shape, ["opening", "midpoint", "ending"], label);
  if (!(OPENINGS as readonly unknown[]).includes(shape.opening))
    v9Error(`${label}.opening`, "is invalid");
  if (!(MIDPOINTS as readonly unknown[]).includes(shape.midpoint))
    v9Error(`${label}.midpoint`, "is invalid");
  if (!(ENDINGS as readonly unknown[]).includes(shape.ending))
    v9Error(`${label}.ending`, "is invalid");
}

function v9Promise(value: unknown, label: string): void {
  const promise = v9Record(value, label);
  v9ExactKeys(promise, ["genre", "intendedSegments", "ranges"], label);
  if (!(GENRE_ORDER as readonly unknown[]).includes(promise.genre))
    v9Error(`${label}.genre`, "is invalid");
  if (!Array.isArray(promise.intendedSegments))
    v9Error(`${label}.intendedSegments`, "must be an array");
  for (let i = 0; i < promise.intendedSegments.length; i++) {
    if (!(SEGMENT_IDS as readonly unknown[]).includes(promise.intendedSegments[i])) {
      v9Error(`${label}.intendedSegments[${String(i)}]`, "is invalid");
    }
  }
  const ranges = v9Record(promise.ranges, `${label}.ranges`);
  v9ExactKeys(
    ranges,
    ["intimacy", "tonalWeight", "kineticEnergy"],
    `${label}.ranges`,
  );
  for (const key of ["intimacy", "tonalWeight", "kineticEnergy"] as const) {
    const range = ranges[key];
    if (!Array.isArray(range) || range.length !== 2) {
      v9Error(`${label}.ranges.${key}`, "must contain exactly two endpoints");
    }
    v9Number(range[0], `${label}.ranges.${key}[0]`);
    v9Number(range[1], `${label}.ranges.${key}[1]`);
  }
}

function checkScriptDevelopmentShape(value: unknown): ScriptDevelopment {
  const development = v9Record(value, "state.scriptDevelopment");
  v9ExactKeys(development, ["mode", "projects"], "state.scriptDevelopment");
  if (development.mode !== "legacy" && development.mode !== "managed") {
    v9Error(
      "state.scriptDevelopment.mode",
      'must be "legacy" or "managed"',
    );
  }
  if (!Array.isArray(development.projects)) {
    v9Error("state.scriptDevelopment.projects", "must be an array");
  }
  for (let i = 0; i < development.projects.length; i++) {
    const label = `state.scriptDevelopment.projects[${String(i)}]`;
    const project = v9Record(development.projects[i], label);
    v9ExactKeys(
      project,
      [
        "id",
        "conceptId",
        "writerId",
        "shape",
        "promise",
        "status",
        "rewriteCount",
        "commissionedWeek",
        "dueWeek",
        "assessment",
        "reservation",
        "productionId",
      ],
      label,
    );
    v9String(project.id, `${label}.id`);
    v9String(project.conceptId, `${label}.conceptId`);
    v9String(project.writerId, `${label}.writerId`);
    v9FilmShape(project.shape, `${label}.shape`);
    v9Promise(project.promise, `${label}.promise`);
    if (!(SCRIPT_PROJECT_STATUSES as readonly unknown[]).includes(project.status)) {
      v9Error(`${label}.status`, "is invalid");
    }
    v9Integer(project.rewriteCount, `${label}.rewriteCount`, 0, 1);
    v9Integer(project.commissionedWeek, `${label}.commissionedWeek`, 0);
    v9NullableInteger(project.dueWeek, `${label}.dueWeek`);

    if (project.assessment !== null) {
      const assessment = v9Record(project.assessment, `${label}.assessment`);
      v9ExactKeys(
        assessment,
        ["actualStrength", "perceivedStrength"],
        `${label}.assessment`,
      );
      v9Number(
        assessment.actualStrength,
        `${label}.assessment.actualStrength`,
        0,
        100,
      );
      v9Number(
        assessment.perceivedStrength,
        `${label}.assessment.perceivedStrength`,
        0,
        100,
      );
    }

    if (project.reservation !== null) {
      const reservation = v9Record(
        project.reservation,
        `${label}.reservation`,
      );
      v9ExactKeys(
        reservation,
        ["projectId", "facilityId", "capability", "slot"],
        `${label}.reservation`,
      );
      v9String(reservation.projectId, `${label}.reservation.projectId`);
      v9String(reservation.facilityId, `${label}.reservation.facilityId`);
      if (reservation.capability !== "development-casting") {
        v9Error(
          `${label}.reservation.capability`,
          'must be "development-casting"',
        );
      }
      v9Integer(reservation.slot, `${label}.reservation.slot`, 0);
    }

    if (project.productionId !== null) {
      v9String(project.productionId, `${label}.productionId`);
    }
  }
  return development as ScriptDevelopment;
}

// Script Projects V1 V9 validator. The frozen V8 projection is validated through
// the exact historical V8 boundary first; the new field then receives exact-key,
// scalar, lifecycle, reference, package-correlation, and shared-capacity checks.
export function validateSaveV9(save: unknown): SaveFileV9 {
  if (!isRecord(save))
    throw new Error("validateSaveV9: save is not a plain object");
  v9ExactKeys(
    save,
    ["saveVersion", "seed", "state", "broadcastCache"],
    "save",
  );
  if (save.saveVersion !== 9) {
    throw new Error(
      `validateSaveV9: expected saveVersion 9, got ${JSON.stringify(save.saveVersion)}`,
    );
  }
  const state = v9Record(
    checkEnvelope(save, "validateSaveV9"),
    "state",
  );
  v9ExactKeys(state, V9_STATE_KEYS, "state");

  const { scriptDevelopment: rawScriptDevelopment, ...v8State } = state;
  try {
    validateSaveV8({
      saveVersion: 8,
      seed: save.seed,
      state: v8State,
      broadcastCache: save.broadcastCache,
    });
  } catch (error) {
    throw new Error(
      `validateSaveV9: frozen V8 state is invalid — ${(error as Error).message}`,
    );
  }

  const scriptDevelopment = checkScriptDevelopmentShape(rawScriptDevelopment);
  const typedState = state as GameState;
  try {
    assertScriptDevelopmentInvariants(scriptDevelopment, {
      currentWeek: typedState.market.tick,
      concepts: typedState.concepts,
      talent: typedState.talent,
      contracts: typedState.contracts,
      operations: typedState.operations,
      activeProductions: typedState.studio.activeProductions,
      releasedFilms: typedState.studio.releasedFilms,
    });
  } catch (error) {
    throw new Error(`validateSaveV9: ${(error as Error).message}`);
  }
  return save as SaveFileV9;
}

// ── Version-dispatching validation (LOUD rejection of unknown versions) ──────
// Returns the correctly-narrowed envelope for a known version; throws for any
// other saveVersion. Every version remains anchored to its own frozen or live
// state shape; the envelopes are deliberately not interchangeable.
export function validateSave(save: unknown): SaveFile {
  if (save === null || typeof save !== "object") {
    throw new Error("validateSave: save is not an object");
  }
  const s = save as Record<string, unknown>;
  if (s.saveVersion === 1) return validateSaveV1(save);
  if (s.saveVersion === 2) return validateSaveV2(save);
  if (s.saveVersion === 3) return validateSaveV3(save);
  if (s.saveVersion === 4) return validateSaveV4(save);
  if (s.saveVersion === 5) return validateSaveV5(save);
  if (s.saveVersion === 6) return validateSaveV6(save);
  if (s.saveVersion === 7) return validateSaveV7(save);
  if (s.saveVersion === 8) return validateSaveV8(save);
  if (s.saveVersion === 9) return validateSaveV9(save);
  throw new Error(
    `validateSave: unknown saveVersion ${JSON.stringify(s.saveVersion)} (this build handles versions 1, 2, 3, 4, 5, 6, 7, 8 and 9 only)`,
  );
}

// ── Build validated envelopes from state ─────────────────────────────────────

// A frozen builder is a projection boundary, not a type assertion. TypeScript's
// structural assignability permits a later GameState to be passed wherever an
// earlier state is expected, and V1–V7 validators intentionally retain historical
// compatibility rather than rejecting every additive root. Constructing each old
// root from an allowlist prevents present and future fields from being mislabeled
// under an older saveVersion without changing what old files the validators accept.
function projectStateV1(state: GameStateV1): GameStateV1 {
  return {
    seed: state.seed,
    rngState: state.rngState,
    market: state.market,
    era: state.era,
    studio: state.studio,
    talent: state.talent,
    concepts: state.concepts,
    broadcastItems: state.broadcastItems,
    coverageContexts: state.coverageContexts,
  };
}

function projectStateV2(state: GameStateV2): GameStateV2 {
  return {
    seed: state.seed,
    rngState: state.rngState,
    market: state.market,
    era: state.era,
    studio: state.studio,
    talent: state.talent,
    concepts: state.concepts,
    broadcastItems: state.broadcastItems,
    coverageContexts: state.coverageContexts,
  };
}

function projectStateV3(state: GameStateV3): GameStateV3 {
  return {
    ...projectStateV2(state),
    founding: state.founding,
    contracts: state.contracts,
    ledger: state.ledger,
    freeAgents: state.freeAgents,
  };
}

function projectStateV4(state: GameStateV4): GameStateV4 {
  return {
    ...projectStateV3(state),
    theatricalRuns: state.theatricalRuns,
  };
}

function projectStateV5(state: GameStateV5): GameStateV5 {
  return {
    ...projectStateV4(state),
    careerEvents: state.careerEvents,
  };
}

function projectStateV6(state: GameStateV6): GameStateV6 {
  return {
    ...projectStateV5(state),
    economyEngagedEver: state.economyEngagedEver,
  };
}

function projectStateV7(state: GameStateV7): GameStateV7 {
  return {
    ...projectStateV6(state),
    publicity: state.publicity,
  };
}

// Build a validated V1 envelope from a legacy GameStateV1 (broadcastCache mirrors
// the state's aired items, per M14). Kept so V1 fixtures/back-compat are typed.
export function makeSaveV1(state: GameStateV1): SaveFileV1 {
  const frozenState = projectStateV1(state);
  const save: SaveFileV1 = {
    saveVersion: 1,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV1(save);
}

// Build a validated V2 envelope from a FROZEN (pre-employment) GameStateV2. Kept
// so V2 fixtures / the V1→V2 conversion stay typed against the frozen shape.
export function makeSaveV2(state: GameStateV2): SaveFileV2 {
  const frozenState = projectStateV2(state);
  const save: SaveFileV2 = {
    saveVersion: 2,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV2(save);
}

// Build a validated V3 envelope from a FROZEN GameStateV3 (pre-D-12). Kept typed against
// the frozen shape for the V2→V3 conversion and V3 fixtures.
export function makeSaveV3(state: GameStateV3): SaveFileV3 {
  const frozenState = projectStateV3(state);
  const save: SaveFileV3 = {
    saveVersion: 3,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV3(save);
}

// Build a validated V4 envelope from a FROZEN GameStateV4 (pre-D-14). Kept typed against
// the frozen shape for the V3→V4 conversion and V4 fixtures. D-14 no longer writes V4.
export function makeSaveV4(state: GameStateV4): SaveFileV4 {
  const frozenState = projectStateV4(state);
  const save: SaveFileV4 = {
    saveVersion: 4,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV4(save);
}

// Build a validated V5 envelope from a FROZEN GameStateV5 (pre-D-17A). Kept typed against
// the frozen shape for the V4→V5 conversion and V5 fixtures. D-17A no longer writes V5.
export function makeSaveV5(state: GameStateV5): SaveFileV5 {
  const frozenState = projectStateV5(state);
  const save: SaveFileV5 = {
    saveVersion: 5,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV5(save);
}

// Build a validated V6 envelope from a FROZEN GameStateV6 (pre-D-17B). Kept typed against the
// frozen shape for the V5→V6 conversion and V6 fixtures. D-17B no longer writes V6.
export function makeSaveV6(state: GameStateV6): SaveFileV6 {
  const frozenState = projectStateV6(state);
  const save: SaveFileV6 = {
    saveVersion: 6,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV6(save);
}

// Build a validated V7 envelope from the FROZEN D-17B GameStateV7. Kept typed against
// that frozen shape for V6→V7 conversion and V7 fixtures. V8 no longer writes V7.
export function makeSaveV7(state: GameStateV7): SaveFileV7 {
  // Structural typing permits present and future live roots where GameStateV7 is
  // expected. Use the same positive allowlist as the other frozen builders so no
  // later field can be mislabeled as V7 or make this builder's output unmigratable.
  const frozenState = projectStateV7(state);
  const save: SaveFileV7 = {
    saveVersion: 7,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV7(save);
}

// Build a validated frozen V8 envelope. Structural typing permits a live V9 state,
// so explicitly project away `scriptDevelopment`: a V8 export must never masquerade
// as V9 or silently create a future migration data-loss trap.
export function makeSaveV8(state: GameStateV8 | GameState): SaveFileV8 {
  const { scriptDevelopment: _scriptDevelopment, ...frozenState } = state as
    GameStateV8 & { scriptDevelopment?: unknown };
  const save: SaveFileV8 = {
    saveVersion: 8,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV8(save);
}

// Build a validated V9 envelope from the live GameState.
export function makeSaveV9(state: GameState): SaveFileV9 {
  const save: SaveFileV9 = {
    saveVersion: 9,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  };
  return validateSaveV9(save);
}

// makeSave — the Script Projects V1 live boundary. Frozen V8 values must cross
// convertV8ToV9/migrateToV9 explicitly; the default builder never invents state.
export function makeSave(state: GameState): SaveFileV9 {
  return makeSaveV9(state);
}

// ── Load / export / import ───────────────────────────────────────────────────

// Validate then return the save (the load-path entry point), dispatching on
// version. Kept distinct from validateSave so intent at call sites is legible.
export function loadSave(save: unknown): SaveFile {
  return validateSave(save);
}

// Serialize a save to a deterministic JSON string (stable key order → §15.7).
// Validates first (either version) so an invalid save never reaches output.
export function exportSave(save: SaveFile): string {
  validateSave(save);
  return stableStringify(save);
}

// Parse a JSON string and validate it as a SaveFile (loud rejection on any
// divergence, including unknown version). Throws on malformed JSON too.
export function importSave(json: string): SaveFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new Error(`importSave: not valid JSON — ${(e as Error).message}`);
  }
  return validateSave(parsed);
}

// ═══════════════════════════════════════════════════════════════════════════════
// D-9.15 (owner-overridden) — deterministic V1 → V2 conversion.
//   Input:  a validated SaveFileV1 (old-shape talent).
//   Output: a NEW SaveFileV2 (new-shape talent). The V1 input is NEVER mutated.
//   Derivation: for each talent, all new fields from stream(seed,'migrate',
//   old.id + '-' + field). rngState is copied through UNCHANGED (replay-exact).
// ═══════════════════════════════════════════════════════════════════════════════

const iround = (x: number): number => Math.round(x);

// A migrate stream for one talent + one field key: stream(seed, 'migrate',
// old.id + '-' + field). Distinct key family per (talent, field) so migration
// draws never collide with worldgen or sim draws (D-9.15).
function migrateStream(seed: string, oldId: string, field: string): RngStream {
  return stream(seed, "migrate", `${oldId}-${field}`);
}

// Build a DisciplineSkills record from six actual centers + a perceived stream.
function buildDisciplineSkillsFromCenters(
  discipline: Discipline,
  centers: number[],
  perceivedS: RngStream,
): DisciplineSkills {
  const keys = SKILL_ORDER[discipline];
  const out: DisciplineSkills = {};
  for (let i = 0; i < keys.length; i++) {
    const a = clamp(iround(centers[i]!), 1, 99);
    const p = clamp(
      iround(a + perceivedS.gaussian(0, TUNING.MIGRATE_PERCEIVED_SD)),
      1,
      99,
    );
    out[keys[i]!] = { actual: a, perceived: p };
  }
  return out;
}

// Convert ONE old-shape talent to the new D-9 Talent, deterministically.
// Field-draw order follows D-9.15's numbered steps; each step keys its own
// migrate stream so draw counts are independent of what other steps drew.
export function migrateTalent(old: TalentV1, seed: string): Talent {
  const primary: Discipline = ROLE_TO_DISCIPLINE[old.role];

  // Step 2 — primary skills centered on old.skill (per-skill variation; not all
  // identical). Center draws from the 'skill' key; perceived from the 'perceived' key.
  const skillS = migrateStream(seed, old.id, "skill");
  const perceivedS = migrateStream(seed, old.id, "perceived");

  // Step 4 — secondary/weak disciplines. Decide secondary from the 'secondary' key.
  const secondaryS = migrateStream(seed, old.id, "secondary");
  const others = DISCIPLINE_ORDER.filter((d) => d !== primary);
  let secondary: Discipline | null = null;
  let muSecondary = 0;
  if (secondaryS.next() < TUNING.MIGRATE_SECONDARY_P) {
    secondary = others[Math.floor(secondaryS.next() * others.length)]!;
    const penalty = secondaryS.uniform(
      TUNING.MIGRATE_SECONDARY_PENALTY[0],
      TUNING.MIGRATE_SECONDARY_PENALTY[1],
    );
    muSecondary = clamp(old.skill - penalty, 20, 90);
  }

  // Per-discipline actual centers, then skills (perceived split), in DISCIPLINE_ORDER.
  const skills = {} as SkillProfiles;
  for (const d of DISCIPLINE_ORDER) {
    const centers: number[] = new Array(6);
    if (d === primary) {
      for (let i = 0; i < 6; i++) {
        centers[i] = clamp(
          old.skill + skillS.gaussian(0, TUNING.MIGRATE_SKILL_SD),
          1,
          99,
        );
      }
    } else if (d === secondary) {
      for (let i = 0; i < 6; i++) {
        centers[i] = clamp(
          muSecondary + skillS.gaussian(0, TUNING.MIGRATE_SKILL_SD),
          1,
          99,
        );
      }
    } else {
      // weak discipline: each skill drawn at μ ~ N(MIGRATE_WEAK_MEAN, MIGRATE_WEAK_SD)
      for (let i = 0; i < 6; i++) {
        centers[i] = clamp(
          skillS.gaussian(TUNING.MIGRATE_WEAK_MEAN, TUNING.MIGRATE_WEAK_SD),
          1,
          99,
        );
      }
    }
    skills[d] = buildDisciplineSkillsFromCenters(d, centers, perceivedS);
  }

  // Step 5 — ceilings: clamp(round(max(actual, actual + headroom·ageRunwayMult)),
  // actual, 99). ageRunwayMult inlined via the shared talentSummary curve would
  // create a cycle; use the same closed form directly here.
  const ageMult = ageRunwayMultLocal(old.age);
  const headroomS = migrateStream(seed, old.id, "headroom");
  const ceilings = {} as Ceilings;
  for (const d of DISCIPLINE_ORDER) {
    const keys = SKILL_ORDER[d];
    const rec: Record<string, number> = {};
    for (const key of keys) {
      const a = skills[d][key]!.actual;
      const headroom =
        headroomS.truncatedNormal(
          TUNING.MIGRATE_HEADROOM_MEAN,
          TUNING.MIGRATE_HEADROOM_SD,
          TUNING.GEN_HEADROOM_LO,
          TUNING.GEN_HEADROOM_HI,
        ) * ageMult;
      rec[key] = clamp(iround(a + headroom), a, 99);
    }
    ceilings[d] = rec;
  }

  // Step 6 — work ethic (own migrate key; independent of skill/fame).
  const weS = migrateStream(seed, old.id, "workethic");
  const workEthic = clamp(
    iround(
      weS.truncatedNormal(TUNING.MIGRATE_WE_MEAN, TUNING.MIGRATE_WE_SD, 1, 99),
    ),
    1,
    99,
  );

  // Step 7 — dev rates: uniform(DEV_RATE_MIN, DEV_RATE_MAX) per discipline.
  const devrateS = migrateStream(seed, old.id, "devrate");
  const devRate = {} as DevRates;
  for (const d of DISCIPLINE_ORDER) {
    devRate[d] = clamp(
      devrateS.uniform(TUNING.DEV_RATE_MIN, TUNING.DEV_RATE_MAX),
      TUNING.DEV_RATE_MIN,
      TUNING.DEV_RATE_MAX,
    );
  }

  // Step 8 — genre experience defaults: primary (discipline,genre) seeded small
  // (scaled by old.age); secondary/weak at 0.
  const expS = migrateStream(seed, old.id, "genreexp");
  const expAgeMult = clamp(0.6 + (old.age - 20) / 60, 0.6, 1.4);
  const genreExperience = {} as GenreExperience;
  for (const d of DISCIPLINE_ORDER) {
    const rec = {} as Record<Genre, { actual: number; perceived: number }>;
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
        );
        const p = clamp(
          iround(a + expS.gaussian(0, TUNING.GEN_EXP_PERCEIVED_SD)),
          0,
          100,
        );
        rec[g] = { actual: a, perceived: p };
      } else {
        rec[g] = { actual: 0, perceived: 0 };
      }
    }
    genreExperience[d] = rec;
  }

  // Step 9 — workHistory all-zero (no pre-migration completed work recorded).
  const workHistory = {} as WorkHistory;
  for (const d of DISCIPLINE_ORDER) workHistory[d] = 0;

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
  };
  t.skill = roleOVR(t, primary);
  return t;
}

// ageRunwayMult local closed form (D-9.8) — duplicated here to avoid a save→
// talentSummary→worldgen import cycle; identical curve.
function ageRunwayMultLocal(age: number): number {
  return (
    TUNING.DEV_AGE_FLOOR +
    (1 - TUNING.DEV_AGE_FLOOR) *
      (1 - smoothstep(TUNING.DEV_AGE_YOUNG, TUNING.DEV_AGE_OLD, age))
  );
}

// Convert a VALIDATED SaveFileV1 into a NEW SaveFileV2. The V1 input is NEVER
// mutated: a fresh state object is built, talent are freshly migrated, and the
// rngState string is carried through UNCHANGED (a resumed run replays identically).
// Deterministic and idempotent: converting the same V1 twice yields V2 talent that
// are byte-identical under stableStringify.
export function convertV1ToV2(v1: SaveFileV1): SaveFileV2 {
  const validated = validateSaveV1(v1); // defensive: never trust an unvalidated input
  const oldState = validated.state;
  const seed = oldState.seed;

  const migratedTalent: Talent[] = oldState.talent.map((old) =>
    migrateTalent(old, seed),
  );

  const newState: GameStateV2 = {
    ...oldState,
    talent: migratedTalent, // the ONLY field whose shape changes
    // rngState carried through UNCHANGED — the resumed run replays identically.
  };

  return makeSaveV2(newState);
}

// importLegacyV1 — parse a legacy V1 JSON string and return a NEW SaveFileV2.
// Loudly rejects anything that is not a valid V1 save. The input string is
// untouched; the returned V2 is a fresh object.
export function importLegacyV1(json: string): SaveFileV2 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new Error(`importLegacyV1: not valid JSON — ${(e as Error).message}`);
  }
  const v1 = validateSaveV1(parsed);
  return convertV1ToV2(v1);
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
  const validated = validateSaveV2(v2); // defensive: never trust an unvalidated input
  const oldState = validated.state;

  const newState: GameStateV3 = {
    ...oldState,
    // D-11 employment surface — empty on conversion (no employment in a V2 save).
    founding: null,
    contracts: [],
    ledger: [],
    freeAgents: [],
    // rngState carried through UNCHANGED — the resumed run replays identically.
  };

  return makeSaveV3(newState);
}

// importLegacyV2 — parse a legacy V2 JSON string and return a NEW SaveFileV3.
// Loudly rejects anything that is not a valid V2 save. Input untouched.
export function importLegacyV2(json: string): SaveFileV3 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new Error(`importLegacyV2: not valid JSON — ${(e as Error).message}`);
  }
  const v2 = validateSaveV2(parsed);
  return convertV2ToV3(v2);
}

// importLegacyV1ToV3 — parse a legacy V1 JSON string and return a NEW SaveFileV3
// (via V1 → V2 → V3). Deterministic and idempotent. Input untouched.
export function importLegacyV1ToV3(json: string): SaveFileV3 {
  return convertV2ToV3(importLegacyV1(json));
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
  const validated = validateSaveV3(v3); // defensive: never trust an unvalidated input
  const oldState = validated.state;
  const theatricalRuns: TheatricalRun[] = oldState.studio.releasedFilms.map(
    (f) => legacyTheatricalRun(f),
  );
  const newState: GameStateV4 = {
    ...oldState,
    theatricalRuns,
    // rngState carried through UNCHANGED — the resumed run replays identically.
  };
  return makeSaveV4(newState);
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
  const validated = validateSaveV4(v4); // defensive: never trust an unvalidated input
  const oldState = validated.state;
  // NOTE: this literal is a FROZEN GameStateV5 — it must NOT carry the D-17A
  // `economyEngagedEver` field. The V5→V6 step reconstructs that fact (convertV5ToV6).
  const newState: GameStateV5 = {
    ...oldState,
    careerEvents: [], // empty ledger — no invented pre-D-14 history; fame preserved as-is.
  };
  return makeSaveV5(newState);
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
  "payroll",
  "overhead",
  "signingBonus",
  "termination",
  "freelancerFee",
  "studioRevenue",
  // D-17B §5: publicity is ENGAGED-ONLY by construction — `applyPublicity` rejects when the
  // economy is not engaged, so no headless/M0A save can carry this kind. It is therefore
  // valid evidence of engagement and IS a member.
  "publicity",
]);

export function convertV5ToV6(v5: SaveFileV5): SaveFileV6 {
  const validated = validateSaveV5(v5); // defensive: never trust an unvalidated input
  const oldState = validated.state;
  const everEngaged =
    oldState.founding !== null ||
    oldState.contracts.length > 0 ||
    oldState.ledger.some((e) => ENGAGED_KINDS.has(e.kind)) ||
    oldState.theatricalRuns.some((r) => r.economyModelVersion >= 1);
  // NOTE: this literal is a FROZEN GameStateV6 — it must NOT carry the D-17B `publicity`
  // field. The V6→V7 step seeds that (convertV6ToV7).
  const newState: GameStateV6 = {
    ...oldState,
    economyEngagedEver: everEngaged,
    // rngState carried through by the spread, UNCHANGED — the resumed run replays identically.
  };
  return makeSaveV6(newState);
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
  return {
    lastUsedWeek: null,
    byTier: { whisper: null, push: null, blitz: null },
  };
}

export function convertV6ToV7(v6: SaveFileV6): SaveFileV7 {
  const validated = validateSaveV6(v6); // defensive: never trust an unvalidated input
  const oldState = validated.state;
  const newState: GameStateV7 = {
    ...oldState,
    publicity: emptyPublicityState(),
    // rngState carried through by the spread, UNCHANGED — the resumed run replays identically.
  };
  return makeSaveV7(newState);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Production Operations V1 — deterministic V7 → V8 conversion.
//   Adds the exact EMPTY legacy operations state. A V7 save predates authoritative
//   production workflows, so migration invents no facilities, reservations, tasks,
//   blockers, or phase history. The old eight-week countdown continues unchanged.
//   Deterministic, idempotent through migrateToV8, rngState unchanged, input untouched.
// ═══════════════════════════════════════════════════════════════════════════════

/** The exact migrated operations state. Fresh on every call; no shared mutable default. */
export function emptyLegacyOperations(): StudioOperations {
  return emptyStudioOperations();
}

function clonePlainJson<T>(value: T): T {
  // Save state is contractually plain JSON. The stable serializer gives a fresh,
  // deterministic tree without platform-specific structured-clone behavior.
  return JSON.parse(stableStringify(value)) as T;
}

function backfillLegacyForecastOpeningBands(state: GameStateV7): GameStateV7 {
  // SegmentForecast.opening was added as an additive read-model field while V1–V4
  // remained frozen/readable. A real save written before that addition can therefore
  // carry an active production whose locked forecast has only the original linear band.
  // Do not recompute history from today's mutable market/standing/talent: preserve the
  // persisted band as the deterministic legacy fallback and leave the authoritative
  // expectedOpening/expectedTotal untouched. Current forecasts that already carry the
  // opening band pass through byte-for-byte.
  let stateChanged = false;
  const activeProductions = state.studio.activeProductions.map((production) => {
    let productionChanged = false;
    const segments = production.forecastSnapshot.segments.map((segment) => {
      if (Object.prototype.hasOwnProperty.call(segment, "opening"))
        return segment;
      productionChanged = true;
      return {
        ...segment,
        opening: {
          center: segment.center,
          estimate: segment.estimate,
          low: segment.low,
          high: segment.high,
        },
      };
    });
    if (!productionChanged) return production;
    stateChanged = true;
    return {
      ...production,
      forecastSnapshot: { ...production.forecastSnapshot, segments },
    };
  });
  if (!stateChanged) return state;
  return {
    ...state,
    studio: { ...state.studio, activeProductions },
  };
}

export function convertV7ToV8(v7: SaveFileV7): SaveFileV8 {
  const validated = validateSaveV7(v7); // defensive; do not trust extra live-shape fields
  const oldState = backfillLegacyForecastOpeningBands(
    clonePlainJson(validated.state),
  );
  const newState: GameStateV8 = {
    ...oldState,
    // Override any hand-added field on the V7 envelope. Version 7 never owned this
    // fact, so migration must seed the exact legacy default rather than trust it.
    operations: emptyLegacyOperations(),
    // rngState carried through by the spread, UNCHANGED.
  };
  return makeSaveV8(newState);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Script Projects V1 — deterministic V8 → V9 conversion.
//   Adds exactly the EMPTY legacy screenplay state. A V8 save predates managed
//   screenplay projects, so migration never infers projects from concepts,
//   operations workflows, active productions, or released films. The entire
//   validated V8 state is deep-cloned; rngState remains byte-identical and the
//   caller's envelope is never mutated.
// ═══════════════════════════════════════════════════════════════════════════════

/** The exact migrated screenplay state. Fresh on every call. */
export function emptyLegacyScriptDevelopment(): ScriptDevelopment {
  return emptyScriptDevelopment();
}

export function convertV8ToV9(v8: SaveFileV8): SaveFileV9 {
  const validated = validateSaveV8(v8);
  const oldState = clonePlainJson(validated.state);
  const newState: GameState = {
    ...oldState,
    // Override any hand-added field on a forged V8 value. Version 8 never owned
    // screenplay state and therefore always migrates to the exact legacy default.
    scriptDevelopment: emptyLegacyScriptDevelopment(),
  };
  return makeSaveV9(newState);
}

// importLegacyV{3,2,1}ToV4 — parse a legacy JSON string and return a NEW SaveFileV4.
export function importLegacyV3ToV4(json: string): SaveFileV4 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new Error(
      `importLegacyV3ToV4: not valid JSON — ${(e as Error).message}`,
    );
  }
  return convertV3ToV4(validateSaveV3(parsed));
}
export function importLegacyV2ToV4(json: string): SaveFileV4 {
  return convertV3ToV4(importLegacyV2(json));
}
export function importLegacyV1ToV4(json: string): SaveFileV4 {
  return convertV3ToV4(importLegacyV1ToV3(json));
}

// migrateToV4 — bring ANY known save version up to V4. V4 passes through; V1/V2/V3
// migrate deterministically. Idempotent. Retained as a historical boundary; the
// live load-to-play entry is migrateToV9.
export function migrateToV4(
  save: SaveFileV1 | SaveFileV2 | SaveFileV3 | SaveFileV4,
): SaveFileV4 {
  if (save.saveVersion === 4) return save;
  if (save.saveVersion === 3) return convertV3ToV4(save);
  if (save.saveVersion === 2) return convertV3ToV4(convertV2ToV3(save));
  return convertV3ToV4(convertV2ToV3(convertV1ToV2(save)));
}

// migrateToV5 — bring ANY known pre-V6 save version up to V5. V5 passes through; V1–V4
// migrate deterministically. Idempotent. The V4→V5 step only adds an empty career ledger
// (fame + all talent state preserved exactly). Retained as a historical boundary;
// the live load-to-play entry is migrateToV9.
export function migrateToV5(
  save: SaveFileV1 | SaveFileV2 | SaveFileV3 | SaveFileV4 | SaveFileV5,
): SaveFileV5 {
  if (save.saveVersion === 5) return save;
  return convertV4ToV5(migrateToV4(save));
}

// migrateToV6 — bring ANY known pre-V7 save version up to V6. V6 passes through; V1–V5
// migrate deterministically. Idempotent. The V5→V6 step reconstructs the persisted engagement
// fact (R2) — never-engaged saves get `false` and keep behaving byte-identically.
// Retained as a historical boundary; the live load-to-play entry is migrateToV9.
export function migrateToV6(
  save:
    SaveFileV1 | SaveFileV2 | SaveFileV3 | SaveFileV4 | SaveFileV5 | SaveFileV6,
): SaveFileV6 {
  if (save.saveVersion === 6) return save;
  return convertV5ToV6(migrateToV5(save));
}

// migrateToV7 — bring any pre-V8 save version up to the frozen V7 shape.
// V7 passes through; V1–V6 migrate deterministically. Idempotent. The V6→V7 step only seeds
// the empty publicity state, so a migrated save behaves exactly as before until the player
// buys a campaign. Retained as a historical boundary; the live load-to-play entry
// is migrateToV9.
export function migrateToV7(
  save:
    | SaveFileV1
    | SaveFileV2
    | SaveFileV3
    | SaveFileV4
    | SaveFileV5
    | SaveFileV6
    | SaveFileV7,
): SaveFileV7 {
  if (save.saveVersion === 7) return save;
  return convertV6ToV7(migrateToV6(save));
}

// migrateToV8 — retained historical PRE-V9 boundary. V8 passes through by identity;
// V1–V7 migrate deterministically. A V9 file is rejected loudly: this function may
// never silently discard authoritative screenplay state.
export function migrateToV8(save: SaveFile): SaveFileV8 {
  if (save.saveVersion === 9) {
    throw new Error(
      "migrateToV8: cannot downgrade SaveFileV9 or discard scriptDevelopment",
    );
  }
  if (save.saveVersion === 8) return save;
  return convertV7ToV8(migrateToV7(save));
}

// migrateToV9 — live load-to-play migration. V9 passes through by identity;
// V1–V8 migrate through every frozen boundary and receive exactly legacy/empty
// screenplay state at the final step.
export function migrateToV9(save: SaveFile): SaveFileV9 {
  if (save.saveVersion === 9) return save;
  return convertV8ToV9(migrateToV8(save));
}
