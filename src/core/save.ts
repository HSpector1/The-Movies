// ── §17 Save format + rev. 4 item M14 + D-9 SaveFileV2 (owner ruling) ─────────
// Historical V1/V2 foundation (the versioned union below now continues through V11):
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
  CASTING_RESULT_HALF_WIDTH,
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
  GameStateV9,
  GameStateV10,
  GameStateV11,
  GameStateV12,
  GameStateV13,
  GameStateV14,
  GameStateV2,
  GameStateV3,
  GameStateV4,
  GameStateV5,
  GameStateV6,
  GameStateV7,
  Genre,
  LedgerEntry,
  LedgerEntryV10,
  LedgerEntryV11,
  LedgerKind,
  OriginalScreenplays,
  ProductionQueueEntry,
  ProductionWorkflow,
  PropertyState,
  PublicityState,
  ScriptDevelopment,
  ScriptProject,
  StudioEventLog,
  StudioSet,
  CastingSessions,
  StudioOperations,
  StudioConstruction,
  StudioPlacement,
  GenreExperience,
  Persona,
  SkillProfiles,
  Talent,
  TheatricalRun,
  WorkHistory,
} from "./types.js";
import { legacyTheatricalRun } from "./economy.js";
import { assertNoDoubleBookedResourceSlots } from "./occupancy.js";
import {
  assertStudioOperationsInvariants,
  emptyStudioOperations,
} from "./operations.js";
import {
  nextProductionPhase,
  productionPhaseForRemainingTicksOrNull,
  requirementsForPhase,
} from "./productionPhases.js";
import {
  assertScriptDevelopmentInvariants,
  emptyScriptDevelopment,
} from "./scriptDevelopment.js";
import {
  ENDOWED_NEXT_SET_ID,
  endowedHouseSets,
  SET_TYPES,
} from "./sets.js";
import { emptyStudioEventLog, isTierDStudioEventKind } from "./studioEvents.js";
import {
  assertCastingSessionsInvariants,
  emptyCastingSessions,
} from "./castingSessions.js";
import {
  assertStudioPlacementInvariants,
  emptyStudioPlacement,
  footprintCells,
  initialManagedStudioPlacement,
} from "./placement.js";
import {
  INITIAL_PROPERTY,
  LEGACY_EXPANSION_PARCEL_ID,
  clonePropertyState,
  parcelById,
} from "./lot.js";
import {
  DEVELOPMENT_CASTING_ANNEX_BLUEPRINT,
  FACILITY_BLUEPRINTS,
  FACILITY_DEMOLITION_LEDGER_NOTE,
  FACILITY_OPEX_LEDGER_NOTE,
} from "./tuning.js";
import {
  ANNEX_CAPEX,
  ANNEX_DURATION_WEEKS,
  ANNEX_FACILITY_ID,
  ANNEX_LEDGER_NOTE,
  ANNEX_PARCEL_ID,
  ANNEX_PROJECT_ID,
  ANNEX_PROJECT_KIND,
  assertStudioConstructionInvariants,
  emptyStudioConstruction,
  historicalCashLedgerCheckpoint,
  initialManagedStudioConstruction,
} from "./construction.js";

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

// Script Projects V1 V9 envelope — the frozen GameStateV9 (V8 + authoritative
// screenplay-development state). New games no longer write V9.
export type SaveFileV9 = {
  saveVersion: 9;
  seed: string;
  state: GameStateV9;
  broadcastCache: BroadcastItem[];
};

// Casting Sessions V1 V10 envelope — the frozen GameStateV10 (V9 + authoritative
// audition-session state). V9 and V10 remain frozen and readable.
export type SaveFileV10 = {
  saveVersion: 10;
  seed: string;
  state: GameStateV10;
  broadcastCache: BroadcastItem[];
};

// Development & Casting Annex V1 V11 envelope — the FROZEN GameStateV11 (V10 plus
// the fixed-parcel project lifecycle). Anchored to GameStateV11 so Placement Core
// V12's placement root and widened ledger cannot leak into the accepted V11
// format. New games no longer write V11, but old V11 files remain readable.
export type SaveFileV11 = {
  saveVersion: 11;
  seed: string;
  state: GameStateV11;
  broadcastCache: BroadcastItem[];
};

// Placement Core V12 envelope — the FROZEN GameStateV12 (V11 plus the authored
// parcel map's placed-facility records). Anchored to GameStateV12 so C1-M1a's
// property root cannot leak into the accepted V12 format. New games no longer
// write V12, but old V12 files remain readable.
export type SaveFileV12 = {
  saveVersion: 12;
  seed: string;
  state: GameStateV12;
  broadcastCache: BroadcastItem[];
};

// Property State V13 envelope (C1-M1a) — the live GameState (V12 plus the studio
// property: bounds, roads, parcels, and the authored structures standing on it).
// Through V12 all of that was module constants, which is exactly why a V12 save
// could not describe a property that had ever changed. V1–V12 remain frozen and
// readable; a V12 file's property was implicit, and INITIAL_PROPERTY IS that
// implicit value, so the migration invents nothing.
export type SaveFileV13 = {
  saveVersion: 13;
  seed: string;
  state: GameStateV13;
  broadcastCache: BroadcastItem[];
};

// C2a-M1 SaveFileV14 — the live envelope (V13 plus the four Campaign-2 roots:
// the studio's Sets and their monotonic id counter, the production queue, the
// original-screenplay blueprints, and the studio's own event history). V13 joins
// V1–V12 as a frozen, readable historical format the moment this exists: a V13
// file's sets were not "empty", they were UNREPRESENTABLE, which is exactly why a
// V13 envelope may never carry them.
export type SaveFileV14 = {
  saveVersion: 14;
  seed: string;
  state: GameStateV14;
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
  | SaveFileV9
  | SaveFileV10
  | SaveFileV11
  | SaveFileV12
  | SaveFileV13
  | SaveFileV14;

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

// V1–V7 intentionally retain their historical tolerance for unrelated additive
// fields. V11 authoritative facts are the narrow exception: accepting them under
// an old version tag would allow a caller to discard real project, debit, or
// facility history during migration. Reject only those four owned signatures.
function rejectV11AuthorityAtHistoricalBoundary(
  state: Record<string, unknown>,
  label: string,
): void {
  if (Object.prototype.hasOwnProperty.call(state, "construction")) {
    throw new Error(
      `${label}: state.construction belongs only to SaveFileV11 and cannot appear at this historical boundary`,
    );
  }
  if (Object.prototype.hasOwnProperty.call(state, "cashLedgerCheckpoint")) {
    throw new Error(
      `${label}: state.cashLedgerCheckpoint belongs only to SaveFileV11 and cannot appear at this historical boundary`,
    );
  }
  if (Array.isArray(state.ledger)) {
    for (let i = 0; i < state.ledger.length; i++) {
      const entry = state.ledger[i];
      if (
        isRecord(entry) &&
        (entry.kind === "constructionCapex" ||
          Object.prototype.hasOwnProperty.call(entry, "constructionProjectId"))
      ) {
        throw new Error(
          `${label}: state.ledger[${String(i)}] contains SaveFileV11 construction authority`,
        );
      }
    }
  }
  if (isRecord(state.operations) && Array.isArray(state.operations.facilities)) {
    for (let i = 0; i < state.operations.facilities.length; i++) {
      const facility = state.operations.facilities[i];
      if (isRecord(facility) && facility.id === ANNEX_FACILITY_ID) {
        throw new Error(
          `${label}: state.operations.facilities[${String(i)}] contains the SaveFileV11 Annex facility`,
        );
      }
    }
  }
}

// The same posture one version on: SaveFileV12 owns the placement root, the
// weekly facility-operating ledger kind, and every catalog identity beyond the
// single canonical Annex. Accepting any of them under an older version tag would
// let a caller discard real placed-facility, occupancy, or operating history
// during migration. Copied deliberately from the V11 guard above (law 19).
function rejectV12AuthorityAtHistoricalBoundary(
  state: Record<string, unknown>,
  label: string,
): void {
  if (Object.prototype.hasOwnProperty.call(state, "placement")) {
    throw new Error(
      `${label}: state.placement belongs only to SaveFileV12 and cannot appear at this historical boundary`,
    );
  }
  if (Array.isArray(state.ledger)) {
    for (let i = 0; i < state.ledger.length; i++) {
      const entry = state.ledger[i];
      if (isRecord(entry) && entry.kind === "facilityOpex") {
        throw new Error(
          `${label}: state.ledger[${String(i)}] contains SaveFileV12 facility operating authority`,
        );
      }
      if (
        isRecord(entry) &&
        entry.kind === "constructionCapex" &&
        typeof entry.constructionProjectId === "string" &&
        entry.constructionProjectId !== ANNEX_PROJECT_ID
      ) {
        throw new Error(
          `${label}: state.ledger[${String(i)}] carries a SaveFileV12 catalog project id`,
        );
      }
    }
  }
  if (isRecord(state.operations) && Array.isArray(state.operations.facilities)) {
    for (let i = 0; i < state.operations.facilities.length; i++) {
      const facility = state.operations.facilities[i];
      const facilityId = isRecord(facility) ? facility.id : undefined;
      if (
        typeof facilityId === "string" &&
        FACILITY_BLUEPRINTS.some((blueprint) =>
          facilityId.startsWith(`${blueprint.facilityIdBase}-`),
        )
      ) {
        throw new Error(
          `${label}: state.operations.facilities[${String(i)}] contains a SaveFileV12 placed facility`,
        );
      }
    }
  }
}

// The same posture one version on again (C1-M1a): SaveFileV13 owns the property
// root. Accepting it under an older version tag would let a caller silently
// discard a property that had grown — new bounds, a purchased parcel, a road
// spur, a structure — while claiming to write a historical format. Copied
// deliberately from the V11 and V12 guards above (law 19).
//
// Only the root itself is guarded here. Unlike the V12 ledger and facility
// authority, V13 adds no new ledger kind and no new facility identity: a property
// leaves no trace anywhere else in the state, so there is no second place a
// historical boundary could leak it.
function rejectV13AuthorityAtHistoricalBoundary(
  state: Record<string, unknown>,
  label: string,
): void {
  if (Object.prototype.hasOwnProperty.call(state, "property")) {
    throw new Error(
      `${label}: state.property belongs only to SaveFileV13 and cannot appear at this historical boundary`,
    );
  }
  // C1-M3a: the demolition refund is V13-only ledger authority, exactly as
  // constructionCapex was V11-only and facilityOpex V12-only. Accepting one under
  // an older tag would let a caller keep the credit while discarding the
  // placement history that justifies it.
  if (Array.isArray(state.ledger)) {
    for (let i = 0; i < state.ledger.length; i++) {
      const entry = state.ledger[i];
      if (isRecord(entry) && entry.kind === "facilityDemolitionRefund") {
        throw new Error(
          `${label}: state.ledger[${String(i)}] contains SaveFileV13 facility demolition authority`,
        );
      }
    }
  }
}

// The same posture one version on again (C2a-M1) — and this time the roots LEAK
// IDENTITIES, which is why the V12 three-legged pattern is copied rather than the
// V13 root-only one. `studioEvents` Tier D names productions and films;
// `productionQueue` names script projects and payload identities; the set family
// spends real money. Accepting any of them under an older tag would let a caller
// keep the history while writing a format that cannot describe it, and a
// production id whose only trace was discarded is a production id the engine can
// hand out twice.
//
// LEG 1 of 3 — the VALIDATOR leg (leg 2 is `assertFrozenBuilderCanProjectV14State`
// on the write side; leg 3 is the version-aware widened-leaf rule threaded
// through `checkOperationsState` / `checkScriptDevelopmentShape`).
function rejectV14AuthorityAtHistoricalBoundary(
  state: Record<string, unknown>,
  label: string,
): void {
  for (const root of V14_ROOT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(state, root)) {
      throw new Error(
        `${label}: state.${root} belongs only to SaveFileV14 and cannot appear at this historical boundary`,
      );
    }
  }
  // The set capital family is V14-only ledger authority, exactly as
  // constructionCapex was V11-only, facilityOpex V12-only, and
  // facilityDemolitionRefund V13-only.
  if (Array.isArray(state.ledger)) {
    for (let i = 0; i < state.ledger.length; i++) {
      const entry = state.ledger[i];
      if (
        isRecord(entry) &&
        typeof entry.kind === "string" &&
        (V14_ONLY_LEDGER_KINDS as readonly string[]).includes(entry.kind)
      ) {
        throw new Error(
          `${label}: state.ledger[${String(i)}] contains SaveFileV14 set capital authority`,
        );
      }
    }
  }
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
  const state = checkEnvelope(s, "validateSaveV1");
  rejectV11AuthorityAtHistoricalBoundary(state, "validateSaveV1");
  rejectV12AuthorityAtHistoricalBoundary(state, "validateSaveV1");
  rejectV13AuthorityAtHistoricalBoundary(state, "validateSaveV1");
  rejectV14AuthorityAtHistoricalBoundary(state, "validateSaveV1");
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
  const state = checkEnvelope(s, "validateSaveV2");
  rejectV11AuthorityAtHistoricalBoundary(state, "validateSaveV2");
  rejectV12AuthorityAtHistoricalBoundary(state, "validateSaveV2");
  rejectV13AuthorityAtHistoricalBoundary(state, "validateSaveV2");
  rejectV14AuthorityAtHistoricalBoundary(state, "validateSaveV2");
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
  const state = checkEnvelope(s, "validateSaveV3");
  rejectV11AuthorityAtHistoricalBoundary(state, "validateSaveV3");
  rejectV12AuthorityAtHistoricalBoundary(state, "validateSaveV3");
  rejectV13AuthorityAtHistoricalBoundary(state, "validateSaveV3");
  rejectV14AuthorityAtHistoricalBoundary(state, "validateSaveV3");
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
  const state = checkEnvelope(s, "validateSaveV4");
  rejectV11AuthorityAtHistoricalBoundary(state, "validateSaveV4");
  rejectV12AuthorityAtHistoricalBoundary(state, "validateSaveV4");
  rejectV13AuthorityAtHistoricalBoundary(state, "validateSaveV4");
  rejectV14AuthorityAtHistoricalBoundary(state, "validateSaveV4");
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
  const state = checkEnvelope(s, "validateSaveV5");
  rejectV11AuthorityAtHistoricalBoundary(state, "validateSaveV5");
  rejectV12AuthorityAtHistoricalBoundary(state, "validateSaveV5");
  rejectV13AuthorityAtHistoricalBoundary(state, "validateSaveV5");
  rejectV14AuthorityAtHistoricalBoundary(state, "validateSaveV5");
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
  rejectV11AuthorityAtHistoricalBoundary(state, "validateSaveV6");
  rejectV12AuthorityAtHistoricalBoundary(state, "validateSaveV6");
  rejectV13AuthorityAtHistoricalBoundary(state, "validateSaveV6");
  rejectV14AuthorityAtHistoricalBoundary(state, "validateSaveV6");
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
  rejectV11AuthorityAtHistoricalBoundary(state, "validateSaveV7");
  rejectV12AuthorityAtHistoricalBoundary(state, "validateSaveV7");
  rejectV13AuthorityAtHistoricalBoundary(state, "validateSaveV7");
  rejectV14AuthorityAtHistoricalBoundary(state, "validateSaveV7");
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
const V11_LEDGER_KINDS = [...LEDGER_KINDS, "constructionCapex"] as const;
const V12_LEDGER_KINDS = [...V11_LEDGER_KINDS, "facilityOpex"] as const;
const V13_LEDGER_KINDS = [
  ...V12_LEDGER_KINDS,
  "facilityDemolitionRefund",
] as const;
// C2a-M1 (§8.3): the set capital family. Commissioning a set spends capital,
// standing sets cost money to keep, and striking one recovers a depreciated
// fraction — three facts about ONE entity, on three kinds, so the whole capital
// life of a set is an auditable trail rather than an untyped `production` row.
// No producer exists until M2; the kinds and their boundary legs land now.
const V14_ONLY_LEDGER_KINDS = [
  "setCapex",
  "setMaintenance",
  "setDemolitionRefund",
] as const;
const V14_LEDGER_KINDS = [
  ...V13_LEDGER_KINDS,
  ...V14_ONLY_LEDGER_KINDS,
] as const;
// The four roots SaveFileV14 owns. One list, read by the historical-boundary
// guard, the state-key list, and the frozen-builder guard, so the three legs can
// never disagree about what V14 authority IS.
const V14_ROOT_KEYS = [
  "sets",
  "nextSetId",
  "productionQueue",
  "originalScreenplays",
  "studioEvents",
] as const;

// Historical validators use the exact facility/ledger laws they shipped with.
// V11 reuses their exhaustive structural checks under this explicitly wider,
// Annex-only policy, then validates the construction root and all correlations.
type LiveStateValidationPolicy =
  | "historical"
  | "annex-v1"
  | "placement-v12"
  // C1-M3a: the live V13 policy. It differs from "placement-v12" in exactly one
  // way — it admits the `facilityDemolitionRefund` ledger kind — and it exists so
  // that admission cannot leak backwards. A genuine SaveFileV12 is still
  // validated under "placement-v12" and still refuses the row, which is what
  // makes the historical boundary real rather than nominal.
  | "property-v13"
  // C2a-M1: the live V14 policy. It differs from "property-v13" in exactly three
  // ways — it admits the set capital ledger kinds, it REQUIRES the widened
  // `ProductionWorkflow.bindings` and `ScriptProject.writerIds` leaves, and it
  // admits the `set-unavailable` blocker arm — and it exists so none of that can
  // leak backwards. A genuine SaveFileV13 is still validated under
  // "property-v13" and still refuses every one of them, which is what makes the
  // historical boundary real rather than nominal.
  | "sets-v14";

/** Every policy that knows about the placement root and its catalog project ids. */
function placementAwarePolicy(policy: LiveStateValidationPolicy): boolean {
  return (
    policy === "placement-v12" ||
    policy === "property-v13" ||
    policy === "sets-v14"
  );
}

/** Every policy that admits V13's property root and its demolition-refund ledger kind. */
function propertyAwarePolicy(policy: LiveStateValidationPolicy): boolean {
  return policy === "property-v13" || policy === "sets-v14";
}

/** The ONE policy that admits V14's roots, ledger kinds, and widened leaves. */
function setsAwarePolicy(policy: LiveStateValidationPolicy): boolean {
  return policy === "sets-v14";
}
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
  policy: LiveStateValidationPolicy = "historical",
): void {
  const entry = v8Record(value, label);
  const constructionAware = policy === "annex-v1" || placementAwarePolicy(policy);
  v8ExactKeys(
    entry,
    ["week", "kind", "amount", "note"],
    constructionAware
      ? ["talentId", "productionId", "constructionProjectId"]
      : ["talentId", "productionId"],
    label,
  );
  v8Integer(entry.week, `${label}.week`, 0);
  v8Enum(
    entry.kind,
    policy === "sets-v14"
      ? V14_LEDGER_KINDS
      : policy === "property-v13"
        ? V13_LEDGER_KINDS
        : policy === "placement-v12"
          ? V12_LEDGER_KINDS
          : policy === "annex-v1"
            ? V11_LEDGER_KINDS
            : LEDGER_KINDS,
    `${label}.kind`,
  );
  v8Number(entry.amount, `${label}.amount`);
  v8String(entry.note, `${label}.note`);
  if (Object.prototype.hasOwnProperty.call(entry, "talentId")) {
    const talentId = v8String(entry.talentId, `${label}.talentId`, true);
    if (!talentIds.has(talentId))
      v8Error(`${label}.talentId`, "references unknown talent");
  }
  v8OptionalString(entry, "productionId", label);
  if (placementAwarePolicy(policy)) {
    // Placement Core V12 widens the correlation to any catalog project id and adds
    // the weekly operating row. The exact identity, week, price, and note are
    // proved against the placement record by assertStudioPlacementInvariants; this
    // structural pass only enforces what a row may CARRY.
    const hasConstructionProjectId = Object.prototype.hasOwnProperty.call(
      entry,
      "constructionProjectId",
    );
    // C1-M3a: the refund shares the capex row's correlation field, because the
    // shared project id IS the link between committing capital and recovering it.
    const correlatedKind =
      entry.kind === "constructionCapex" ||
      (propertyAwarePolicy(policy) && entry.kind === "facilityDemolitionRefund");
    if (correlatedKind) {
      if (!hasConstructionProjectId) {
        v8Error(
          `${label}.constructionProjectId`,
          `is required for ${String(entry.kind)}`,
        );
      }
      v8String(entry.constructionProjectId, `${label}.constructionProjectId`, true);
      if (
        Object.prototype.hasOwnProperty.call(entry, "talentId") ||
        Object.prototype.hasOwnProperty.call(entry, "productionId")
      ) {
        v8Error(
          label,
          `${String(entry.kind)} cannot carry talentId or productionId`,
        );
      }
    } else if (hasConstructionProjectId) {
      v8Error(
        `${label}.constructionProjectId`,
        propertyAwarePolicy(policy)
          ? "is forbidden unless kind is constructionCapex or facilityDemolitionRefund"
          : "is forbidden unless kind is constructionCapex",
      );
    }
    if (propertyAwarePolicy(policy) && entry.kind === "facilityDemolitionRefund") {
      // A refund is the one INFLOW in the construction family. A negative or zero
      // "refund" would be a disguised charge; the exact depreciated amount and its
      // correlation to a real prior capex row are proved by the placement
      // invariants, which run over the whole state.
      if (typeof entry.amount !== "number" || !(entry.amount > 0)) {
        v8Error(`${label}.amount`, "must be a positive credit");
      }
      if (entry.note !== FACILITY_DEMOLITION_LEDGER_NOTE) {
        v8Error(
          `${label}.note`,
          `must equal ${JSON.stringify(FACILITY_DEMOLITION_LEDGER_NOTE)}`,
        );
      }
    }
    if (entry.kind === "facilityOpex") {
      if (
        Object.prototype.hasOwnProperty.call(entry, "talentId") ||
        Object.prototype.hasOwnProperty.call(entry, "productionId")
      ) {
        v8Error(
          label,
          "facilityOpex cannot carry talentId or productionId",
        );
      }
      if (entry.note !== FACILITY_OPEX_LEDGER_NOTE) {
        v8Error(
          `${label}.note`,
          `must equal ${JSON.stringify(FACILITY_OPEX_LEDGER_NOTE)}`,
        );
      }
    }
    // C2a-M1: what a SET capital row may carry. A set is not a facility and not
    // a film, so a set row correlates to neither: no talentId, no productionId,
    // and no constructionProjectId (the `else if` above already refuses that
    // one, since a set kind is never a `correlatedKind`). The set's own identity
    // travels in the note, which is why the note must say something. M2's
    // producers add the exact-note law when there are exact notes to pin.
    if ((V14_ONLY_LEDGER_KINDS as readonly string[]).includes(String(entry.kind))) {
      if (
        Object.prototype.hasOwnProperty.call(entry, "talentId") ||
        Object.prototype.hasOwnProperty.call(entry, "productionId")
      ) {
        v8Error(
          label,
          `${String(entry.kind)} cannot carry talentId or productionId`,
        );
      }
      v8String(entry.note, `${label}.note`, true);
      if (entry.kind === "setDemolitionRefund") {
        // The one INFLOW in the set family, exactly as facilityDemolitionRefund
        // is in the facility family. A negative or zero "refund" is a disguised
        // charge wearing a credit's name.
        if (typeof entry.amount !== "number" || !(entry.amount > 0)) {
          v8Error(`${label}.amount`, "must be a positive credit");
        }
      } else if (typeof entry.amount !== "number" || !(entry.amount < 0)) {
        v8Error(`${label}.amount`, "must be a debit");
      }
    }
  } else if (policy === "annex-v1") {
    const hasConstructionProjectId = Object.prototype.hasOwnProperty.call(
      entry,
      "constructionProjectId",
    );
    if (entry.kind === "constructionCapex") {
      if (!hasConstructionProjectId) {
        v8Error(
          `${label}.constructionProjectId`,
          "is required for constructionCapex",
        );
      }
      if (entry.constructionProjectId !== ANNEX_PROJECT_ID) {
        v8Error(
          `${label}.constructionProjectId`,
          `must equal ${JSON.stringify(ANNEX_PROJECT_ID)}`,
        );
      }
      if (
        Object.prototype.hasOwnProperty.call(entry, "talentId") ||
        Object.prototype.hasOwnProperty.call(entry, "productionId")
      ) {
        v8Error(
          label,
          "constructionCapex cannot carry talentId or productionId",
        );
      }
      if (entry.note !== ANNEX_LEDGER_NOTE) {
        v8Error(
          `${label}.note`,
          `must equal ${JSON.stringify(ANNEX_LEDGER_NOTE)}`,
        );
      }
    } else if (hasConstructionProjectId) {
      v8Error(
        `${label}.constructionProjectId`,
        "is forbidden unless kind is constructionCapex",
      );
    }
  }
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

function checkV8LiveState(
  state: Record<string, unknown>,
  policy: LiveStateValidationPolicy = "historical",
): void {
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
    v8LedgerEntry(ledger[i], `state.ledger[${i}]`, talentIds, policy);
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

// C2a-M0: `phaseForRemainingTicks`, `REQUIRED_CAPABILITIES`, and `NEXT_PHASE`
// used to be a SECOND copy of the engine's phase machinery, living here so the
// validator could refuse a malformed workflow without importing typed core logic.
// Two copies of one table is two tables, and C2 is about to change what a phase
// requires — so all three now come from `productionPhases.ts`, the single source
// `operations.ts` reads as well. The validator keeps its own reading of the
// countdown (null, not a throw) because it is holding untrusted JSON and owns the
// message; that is a named function over the shared table, not a second table.

/**
 * The V14 `ProductionWorkflow.bindings` leaf (§8.1). Structural, plus the ONE
 * cross-check that makes the leaf trustworthy: `stageFacilityId` MIRRORS the
 * workflow's live soundstage reservation. The reservation is the authority; the
 * binding is its record. A save that disagreed with itself about which stage a
 * picture stands on would be a save whose migration derivation (§8.3) is a guess.
 *
 * The other four fields are M2's and are only range-checked here: `setId`,
 * `lockedNovelty`, and `lockedUplift` are bound atomically with the stage at
 * rehearsal entry, and `requiresSetBinding` is minted at greenlight.
 */
function checkWorkflowBindings(
  value: unknown,
  label: string,
  soundstageFacilityIds: ReadonlySet<string>,
): void {
  if (!isRecord(value)) {
    throw new Error(`${label} must be a plain object`);
  }
  v8ExactKeys(
    value,
    [
      "requiresSetBinding",
      "stageFacilityId",
      "setId",
      "lockedNovelty",
      "lockedUplift",
      "heldSinceWeek",
    ],
    [],
    label,
  );
  v8Boolean(value.requiresSetBinding, `${label}.requiresSetBinding`);

  const expectedStage =
    soundstageFacilityIds.size === 1 ? [...soundstageFacilityIds][0]! : null;
  if (value.stageFacilityId !== expectedStage) {
    throw new Error(
      `${label}.stageFacilityId must be ${expectedStage === null ? "null" : JSON.stringify(expectedStage)} — the workflow's live soundstage reservation`,
    );
  }

  if (value.setId !== null) v8String(value.setId, `${label}.setId`, true);
  if (value.lockedNovelty !== null) {
    const lockedNovelty = v8Number(value.lockedNovelty, `${label}.lockedNovelty`);
    if (lockedNovelty < 0 || lockedNovelty > 1) {
      v8Error(`${label}.lockedNovelty`, "must be within [0, 1]");
    }
  }
  if (value.lockedUplift !== null) {
    v8Number(value.lockedUplift, `${label}.lockedUplift`);
  }
  if (value.heldSinceWeek !== null) {
    v8Integer(value.heldSinceWeek, `${label}.heldSinceWeek`, 0);
  }
  // A locked uplift term without a bound set is a snapshot of nothing.
  if (
    value.setId === null &&
    (value.lockedNovelty !== null || value.lockedUplift !== null)
  ) {
    throw new Error(
      `${label} cannot carry a locked uplift term without a bound set`,
    );
  }
}

// Validate the complete authoritative operations surface rather than accepting it as
// display-only data. A malformed reservation or workflow changes the release clock, so
// it must fail at import instead of silently overbooking a facility or desynchronizing a
// production. This is deliberately local to the save boundary; it consumes no RNG and
// mutates nothing.
function checkOperationsState(
  state: Record<string, unknown>,
  label: string,
  policy: LiveStateValidationPolicy = "historical",
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
    // LEG 3 of the V14 boundary (§8.3, the widened-leaf rule): the workflow key
    // list is VERSION-AWARE. Pre-V14 boundaries still refuse `bindings`
    // outright; V14 requires it. A leaf that is merely "allowed" on both sides
    // would make the historical boundary nominal — a V13 file could carry a
    // stage binding it has no schema for, and a V14 file could omit the leaf its
    // migrator promises is always there.
    v8ExactKeys(
      raw,
      setsAwarePolicy(policy)
        ? ["productionId", "phase", "reservations", "shootingTask", "blocker", "bindings"]
        : ["productionId", "phase", "reservations", "shootingTask", "blocker"],
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
    const expectedPhase = productionPhaseForRemainingTicksOrNull(
      production.remainingTicks,
    );
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
    const requiredCapabilities = [...requirementsForPhase(phase)].sort();
    if (!deepEqual(actualCapabilities, requiredCapabilities)) {
      throw new Error(
        `${itemLabel}.reservations must provide exactly ${requiredCapabilities.join(" + ") || "no facilities"} for ${phase}`,
      );
    }

    if (setsAwarePolicy(policy)) {
      checkWorkflowBindings(
        raw.bindings,
        `${itemLabel}.bindings`,
        soundstageFacilityIds,
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
        if (nextProductionPhase(phase) !== targetPhase) {
          throw new Error(
            `${itemLabel}.blocker.targetPhase must be the next scheduled phase`,
          );
        }
        if (!requirementsForPhase(targetPhase).includes(capability)) {
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
      } else if (blocker.kind === "set-unavailable" && setsAwarePolicy(policy)) {
        // The ONE new persisted blocker arm (§8.1), version-aware like
        // `bindings`: a pre-V14 boundary falls through to "invalid kind" and
        // refuses it. It carries NO capability, so it gets its own exact-key
        // list and is deliberately OUT of scope of the capability ∈
        // REQUIRED_CAPABILITIES cross-check above — a picture waiting on a SET
        // is not waiting on a facility slot. `occupiedBy` / `remedies` /
        // `alsoMissing` are derived studioQueueView fields and are never
        // persisted, which is why they are not in this list.
        v8ExactKeys(blocker, ["kind", "targetPhase"], [], `${itemLabel}.blocker`);
        const targetPhase = asPhase(
          blocker.targetPhase,
          `${itemLabel}.blocker.targetPhase`,
        );
        if (nextProductionPhase(phase) !== targetPhase) {
          throw new Error(
            `${itemLabel}.blocker.targetPhase must be the next scheduled phase`,
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
    policy === "annex-v1"
      ? {
          facilityPolicy: "annex-v1",
          annexOperational: facilities.has(ANNEX_FACILITY_ID),
        }
      : placementAwarePolicy(policy)
        ? // The exact V12 facility set is a function of the placement root, which
          // this nested frozen-V11 projection deliberately cannot see. The V12
          // validator proves it immediately afterwards through
          // assertStudioPlacementInvariants; here only the generic capacity,
          // reservation, and workflow law applies.
          { facilityPolicy: "configured" }
        : undefined,
  );
  return operations as StudioOperations;
}

// Production Operations V1 V8 validator. Operations affect countdown advancement and
// player-action legality, so the live envelope validates their full structural/cross-state
// invariants instead of defaulting corrupt current-version data.
function validateSaveV8WithPolicy(
  save: unknown,
  policy: LiveStateValidationPolicy,
): SaveFileV8 {
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
  checkV8LiveState(state, policy);
  checkOperationsState(state, "validateSaveV8", policy);
  v8AssertPlainJson(s.broadcastCache, "broadcastCache");
  return save as SaveFileV8;
}

export function validateSaveV8(save: unknown): SaveFileV8 {
  return validateSaveV8WithPolicy(save, "historical");
}

const V9_STATE_KEYS = [...V8_STATE_KEYS, "scriptDevelopment"] as const;
// C2a-M1 (owner ruling `00E`.9): the corpus bound on the pooled writers list.
const MAX_SCRIPT_WRITERS = 5;
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

function checkScriptDevelopmentShape(
  value: unknown,
  policy: LiveStateValidationPolicy = "historical",
): ScriptDevelopment {
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
    // LEG 3 of the V14 boundary (§8.3): `writerIds` is version-aware exactly as
    // `bindings` is. A V13 file has no schema for a writers list and REFUSES one;
    // a V14 file must carry it.
    v9ExactKeys(
      project,
      setsAwarePolicy(policy)
        ? [
            "id",
            "conceptId",
            "writerId",
            "writerIds",
            "shape",
            "promise",
            "status",
            "rewriteCount",
            "commissionedWeek",
            "dueWeek",
            "assessment",
            "reservation",
            "productionId",
          ]
        : [
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
    const writerId = v9String(project.writerId, `${label}.writerId`);
    if (setsAwarePolicy(policy)) {
      // The bounded pooling list (owner ruling `00E`.9). Its cap is the corpus
      // bound; `writerId` stays the project's attribution and must therefore be
      // the FIRST member, so the two can never name different authors.
      if (!Array.isArray(project.writerIds)) {
        v9Error(`${label}.writerIds`, "must be an array");
      }
      const writerIds = project.writerIds as unknown[];
      if (writerIds.length < 1 || writerIds.length > MAX_SCRIPT_WRITERS) {
        v9Error(
          `${label}.writerIds`,
          `must hold between 1 and ${String(MAX_SCRIPT_WRITERS)} writers`,
        );
      }
      const seen = new Set<string>();
      for (let w = 0; w < writerIds.length; w++) {
        const id = v9String(writerIds[w], `${label}.writerIds[${String(w)}]`);
        if (seen.has(id)) v9Error(`${label}.writerIds[${String(w)}]`, "is duplicated");
        seen.add(id);
      }
      if (writerIds[0] !== writerId) {
        v9Error(`${label}.writerIds[0]`, "must be the project's attributed writer");
      }
    }
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
function validateSaveV9WithPolicy(
  save: unknown,
  policy: LiveStateValidationPolicy,
): SaveFileV9 {
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
    validateSaveV8WithPolicy({
      saveVersion: 8,
      seed: save.seed,
      state: v8State,
      broadcastCache: save.broadcastCache,
    }, policy);
  } catch (error) {
    throw new Error(
      `validateSaveV9: frozen V8 state is invalid — ${(error as Error).message}`,
    );
  }

  const scriptDevelopment = checkScriptDevelopmentShape(
    rawScriptDevelopment,
    policy,
  );
  const typedState = state as GameStateV9;
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

export function validateSaveV9(save: unknown): SaveFileV9 {
  return validateSaveV9WithPolicy(save, "historical");
}

const V10_STATE_KEYS = [...V9_STATE_KEYS, "castingSessions"] as const;
const CASTING_SESSION_STATUSES = ["auditioning", "review", "complete"] as const;

function v10Error(label: string, message: string): never {
  throw new Error(`validateSaveV10: ${label} ${message}`);
}

function v10Record(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) return v10Error(label, "must be a plain object");
  return value;
}

function v10ExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  label: string,
): void {
  const allowed = new Set(required);
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      v10Error(label, `is missing required field ${JSON.stringify(key)}`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      v10Error(label, `has unknown field ${JSON.stringify(key)}`);
    }
  }
}

function v10String(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    return v10Error(label, "must be a non-empty string");
  }
  return value;
}

function v10Integer(
  value: unknown,
  label: string,
  min?: number,
  max?: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    return v10Error(label, "must be a finite integer");
  }
  if (min !== undefined && value < min) {
    v10Error(label, `must be at least ${String(min)}`);
  }
  if (max !== undefined && value > max) {
    v10Error(label, `must be at most ${String(max)}`);
  }
  return value;
}

function checkCastingResultShape(value: unknown, label: string): void {
  const result = v10Record(value, label);
  v10ExactKeys(result, ["talentId", "estimate", "low", "high"], label);
  v10String(result.talentId, `${label}.talentId`);
  const estimate = v10Integer(result.estimate, `${label}.estimate`, 0, 100);
  const low = v10Integer(result.low, `${label}.low`, 0, 100);
  const high = v10Integer(result.high, `${label}.high`, 0, 100);
  if (low !== Math.max(0, estimate - CASTING_RESULT_HALF_WIDTH)) {
    v10Error(`${label}.low`, "must equal estimate minus 6, clamped at 0");
  }
  if (high !== Math.min(100, estimate + CASTING_RESULT_HALF_WIDTH)) {
    v10Error(`${label}.high`, "must equal estimate plus 6, clamped at 100");
  }
}

function checkCastingPair(
  value: unknown,
  label: string,
  checkItem: (item: unknown, itemLabel: string) => void,
): void {
  if (!Array.isArray(value) || value.length !== 2) {
    v10Error(label, "must contain exactly two entries");
  }
  checkItem(value[0], `${label}[0]`);
  checkItem(value[1], `${label}[1]`);
}

function checkCastingSessionsShape(value: unknown): CastingSessions {
  const casting = v10Record(value, "state.castingSessions");
  v10ExactKeys(casting, ["mode", "sessions"], "state.castingSessions");
  if (casting.mode !== "legacy" && casting.mode !== "managed") {
    v10Error(
      "state.castingSessions.mode",
      'must be "legacy" or "managed"',
    );
  }
  if (!Array.isArray(casting.sessions)) {
    v10Error("state.castingSessions.sessions", "must be an array");
  }

  for (let i = 0; i < casting.sessions.length; i++) {
    const label = `state.castingSessions.sessions[${String(i)}]`;
    const session = v10Record(casting.sessions[i], label);
    v10ExactKeys(
      session,
      [
        "id",
        "projectId",
        "status",
        "slate",
        "startedWeek",
        "dueWeek",
        "reservation",
        "results",
      ],
      label,
    );
    v10String(session.id, `${label}.id`);
    v10String(session.projectId, `${label}.projectId`);
    if (!(CASTING_SESSION_STATUSES as readonly unknown[]).includes(session.status)) {
      v10Error(`${label}.status`, "is invalid");
    }

    const slate = v10Record(session.slate, `${label}.slate`);
    v10ExactKeys(slate, CAST_SLOTS, `${label}.slate`);
    for (const slot of CAST_SLOTS) {
      checkCastingPair(slate[slot], `${label}.slate.${slot}`, (candidate, candidateLabel) => {
        v10String(candidate, candidateLabel);
      });
    }

    v10Integer(session.startedWeek, `${label}.startedWeek`, 0);
    if (session.dueWeek !== null) {
      v10Integer(session.dueWeek, `${label}.dueWeek`, 0);
    }

    if (session.reservation !== null) {
      const reservation = v10Record(session.reservation, `${label}.reservation`);
      v10ExactKeys(
        reservation,
        ["sessionId", "facilityId", "capability", "slot"],
        `${label}.reservation`,
      );
      v10String(reservation.sessionId, `${label}.reservation.sessionId`);
      v10String(reservation.facilityId, `${label}.reservation.facilityId`);
      if (reservation.capability !== "development-casting") {
        v10Error(
          `${label}.reservation.capability`,
          'must be "development-casting"',
        );
      }
      v10Integer(reservation.slot, `${label}.reservation.slot`, 0);
    }

    if (session.results !== null) {
      const results = v10Record(session.results, `${label}.results`);
      v10ExactKeys(results, CAST_SLOTS, `${label}.results`);
      for (const slot of CAST_SLOTS) {
        checkCastingPair(
          results[slot],
          `${label}.results.${slot}`,
          checkCastingResultShape,
        );
      }
    }
  }
  return casting as CastingSessions;
}

// Casting Sessions V1 V10 validator. Validate the exact frozen V9 projection
// first, then the one new root. Structural checks happen before cross-state core
// invariants so malformed JSON never reaches typed simulation code.
function validateSaveV10WithPolicy(
  save: unknown,
  policy: LiveStateValidationPolicy,
): SaveFileV10 {
  if (!isRecord(save)) {
    throw new Error("validateSaveV10: save is not a plain object");
  }
  v10ExactKeys(
    save,
    ["saveVersion", "seed", "state", "broadcastCache"],
    "save",
  );
  if (save.saveVersion !== 10) {
    throw new Error(
      `validateSaveV10: expected saveVersion 10, got ${JSON.stringify(save.saveVersion)}`,
    );
  }
  const state = v10Record(
    checkEnvelope(save, "validateSaveV10"),
    "state",
  );
  v10ExactKeys(state, V10_STATE_KEYS, "state");

  const { castingSessions: rawCastingSessions, ...v9State } = state;
  try {
    validateSaveV9WithPolicy({
      saveVersion: 9,
      seed: save.seed,
      state: v9State,
      broadcastCache: save.broadcastCache,
    }, policy);
  } catch (error) {
    throw new Error(
      `validateSaveV10: frozen V9 state is invalid — ${(error as Error).message}`,
    );
  }

  const castingSessions = checkCastingSessionsShape(rawCastingSessions);
  const typedState = state as GameStateV10;
  try {
    assertCastingSessionsInvariants(castingSessions, {
      currentWeek: typedState.market.tick,
      operations: typedState.operations,
      scriptDevelopment: typedState.scriptDevelopment,
      talent: typedState.talent,
    });
    // C2a-M0 fail-closed (charter §3.2). This is the first point in the validator
    // where ALL THREE Development & Casting owners are typed and present, which is
    // why the cross-owner union check lands here rather than in the operations
    // validator above. Defense-in-depth: the per-owner walks inside the assertion
    // already refuse the collisions they can see; this one asks the union producer
    // the whole question, across every capability, in one place.
    assertNoDoubleBookedResourceSlots({
      operations: typedState.operations,
      scriptDevelopment: typedState.scriptDevelopment,
      castingSessions,
    });
  } catch (error) {
    throw new Error(`validateSaveV10: ${(error as Error).message}`);
  }
  return save as SaveFileV10;
}

export function validateSaveV10(save: unknown): SaveFileV10 {
  return validateSaveV10WithPolicy(save, "historical");
}

const V11_STATE_KEYS = [...V10_STATE_KEYS, "construction"] as const;
const V11_OPTIONAL_STATE_KEYS = ["cashLedgerCheckpoint"] as const;

function v11Error(label: string, message: string): never {
  throw new Error(`validateSaveV11: ${label} ${message}`);
}

function v11Record(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) return v11Error(label, "must be a plain object");
  return value;
}

function v11ExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  label: string,
  optional: readonly string[] = [],
): void {
  const allowed = new Set([...required, ...optional]);
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      v11Error(label, `is missing required field ${JSON.stringify(key)}`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      v11Error(label, `has unknown field ${JSON.stringify(key)}`);
    }
  }
}

function checkCashLedgerCheckpointShape(
  value: unknown,
  ledgerLength: number,
): void {
  const checkpoint = v11Record(value, "state.cashLedgerCheckpoint");
  v11ExactKeys(
    checkpoint,
    ["cash", "ledgerLength"],
    "state.cashLedgerCheckpoint",
  );
  if (typeof checkpoint.cash !== "number" || !Number.isFinite(checkpoint.cash)) {
    v11Error("state.cashLedgerCheckpoint.cash", "must be a finite number");
  }
  const length = v11Integer(
    checkpoint.ledgerLength,
    "state.cashLedgerCheckpoint.ledgerLength",
  );
  if (length > ledgerLength) {
    v11Error(
      "state.cashLedgerCheckpoint.ledgerLength",
      "cannot exceed state.ledger.length",
    );
  }
}

function v11Integer(value: unknown, label: string): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    return v11Error(label, "must be a non-negative finite integer");
  }
  return value;
}

function checkConstructionShape(
  value: unknown,
  policy: LiveStateValidationPolicy = "annex-v1",
): StudioConstruction {
  const construction = v11Record(value, "state.construction");
  v11ExactKeys(construction, ["mode", "parcels", "projects"], "state.construction");
  if (construction.mode !== "legacy" && construction.mode !== "managed") {
    v11Error("state.construction.mode", 'must be "legacy" or "managed"');
  }
  if (!Array.isArray(construction.parcels)) {
    v11Error("state.construction.parcels", "must be an array");
  }
  if (!Array.isArray(construction.projects)) {
    v11Error("state.construction.projects", "must be an array");
  }

  for (let i = 0; i < construction.parcels.length; i++) {
    const label = `state.construction.parcels[${String(i)}]`;
    const parcel = v11Record(construction.parcels[i], label);
    v11ExactKeys(parcel, ["id", "projectId"], label);
    if (parcel.id !== ANNEX_PARCEL_ID) {
      v11Error(`${label}.id`, `must equal ${JSON.stringify(ANNEX_PARCEL_ID)}`);
    }
    if (parcel.projectId !== null && parcel.projectId !== ANNEX_PROJECT_ID) {
      v11Error(
        `${label}.projectId`,
        `must be null or ${JSON.stringify(ANNEX_PROJECT_ID)}`,
      );
    }
  }

  if (placementAwarePolicy(policy) && construction.projects.length > 0) {
    v11Error(
      "state.construction.projects",
      "must be empty in SaveFileV12; placement owns every capital project",
    );
  }
  for (let i = 0; i < construction.projects.length; i++) {
    const label = `state.construction.projects[${String(i)}]`;
    const project = v11Record(construction.projects[i], label);
    v11ExactKeys(
      project,
      [
        "id",
        "kind",
        "parcelId",
        "facilityId",
        "status",
        "capex",
        "startedWeek",
        "dueWeek",
        "completedWeek",
      ],
      label,
    );
    if (project.id !== ANNEX_PROJECT_ID) {
      v11Error(`${label}.id`, `must equal ${JSON.stringify(ANNEX_PROJECT_ID)}`);
    }
    if (project.kind !== ANNEX_PROJECT_KIND) {
      v11Error(`${label}.kind`, `must equal ${JSON.stringify(ANNEX_PROJECT_KIND)}`);
    }
    if (project.parcelId !== ANNEX_PARCEL_ID) {
      v11Error(
        `${label}.parcelId`,
        `must equal ${JSON.stringify(ANNEX_PARCEL_ID)}`,
      );
    }
    if (project.facilityId !== ANNEX_FACILITY_ID) {
      v11Error(
        `${label}.facilityId`,
        `must equal ${JSON.stringify(ANNEX_FACILITY_ID)}`,
      );
    }
    if (project.status !== "building" && project.status !== "completed") {
      v11Error(`${label}.status`, 'must be "building" or "completed"');
    }
    if (project.capex !== ANNEX_CAPEX) {
      v11Error(`${label}.capex`, `must equal ${String(ANNEX_CAPEX)}`);
    }
    const startedWeek = v11Integer(project.startedWeek, `${label}.startedWeek`);
    const dueWeek = v11Integer(project.dueWeek, `${label}.dueWeek`);
    if (dueWeek !== startedWeek + ANNEX_DURATION_WEEKS) {
      v11Error(
        `${label}.dueWeek`,
        `must equal startedWeek + ${String(ANNEX_DURATION_WEEKS)}`,
      );
    }
    if (project.completedWeek !== null) {
      v11Integer(project.completedWeek, `${label}.completedWeek`);
    }
  }
  return construction as StudioConstruction;
}

// Development & Casting Annex V1 V11 validator. The frozen V10 projection is
// structurally validated under the exact Annex facility/ledger policy, never the
// research-only configured policy. Construction then owns lifecycle, capex, cash,
// and facility-presence correlations.
function validateSaveV11WithPolicy(
  save: unknown,
  policy: LiveStateValidationPolicy,
): SaveFileV11 {
  if (!isRecord(save)) {
    throw new Error("validateSaveV11: save is not a plain object");
  }
  v11ExactKeys(
    save,
    ["saveVersion", "seed", "state", "broadcastCache"],
    "save",
  );
  if (save.saveVersion !== 11) {
    throw new Error(
      `validateSaveV11: expected saveVersion 11, got ${JSON.stringify(save.saveVersion)}`,
    );
  }
  const state = v11Record(checkEnvelope(save, "validateSaveV11"), "state");
  v11ExactKeys(
    state,
    V11_STATE_KEYS,
    "state",
    V11_OPTIONAL_STATE_KEYS,
  );
  if (!placementAwarePolicy(policy)) {
    rejectV12AuthorityAtHistoricalBoundary(state, "validateSaveV11");
    rejectV13AuthorityAtHistoricalBoundary(state, "validateSaveV11");
    rejectV14AuthorityAtHistoricalBoundary(state, "validateSaveV11");
  }

  const hasCashLedgerCheckpoint = Object.prototype.hasOwnProperty.call(
    state,
    "cashLedgerCheckpoint",
  );
  const {
    construction: rawConstruction,
    cashLedgerCheckpoint: rawCashLedgerCheckpoint,
    ...v10State
  } = state;
  try {
    validateSaveV10WithPolicy(
      {
        saveVersion: 10,
        seed: save.seed,
        state: v10State,
        broadcastCache: save.broadcastCache,
      },
      placementAwarePolicy(policy) ? policy : "annex-v1",
    );
  } catch (error) {
    throw new Error(
      `validateSaveV11: frozen V10 state is invalid — ${(error as Error).message}`,
    );
  }

  checkConstructionShape(rawConstruction, policy);
  if (hasCashLedgerCheckpoint) {
    checkCashLedgerCheckpointShape(
      rawCashLedgerCheckpoint,
      (state.ledger as unknown[]).length,
    );
  }
  // Under the V12 policy this projection is a fragment of a larger state: the
  // construction/cash law it owns is proved by the placement authority, which the
  // V12 validator runs over the WHOLE state immediately after this returns.
  if (!placementAwarePolicy(policy)) {
    try {
      // The checker reads no V12 root, so a frozen V11 fragment is a valid input.
      assertStudioConstructionInvariants(state as unknown as GameState);
    } catch (error) {
      throw new Error(`validateSaveV11: ${(error as Error).message}`);
    }
  }
  return save as SaveFileV11;
}

export function validateSaveV11(save: unknown): SaveFileV11 {
  return validateSaveV11WithPolicy(save, "annex-v1");
}

const V12_STATE_KEYS = [...V11_STATE_KEYS, "placement"] as const;
const PLACEMENT_STATUSES = ["underConstruction", "operational"] as const;

function v12Error(label: string, message: string): never {
  throw new Error(`validateSaveV12: ${label} ${message}`);
}

function v12Record(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) return v12Error(label, "must be a plain object");
  return value;
}

function v12ExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  label: string,
  optional: readonly string[] = [],
): void {
  const allowed = new Set([...required, ...optional]);
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      v12Error(label, `is missing required field ${JSON.stringify(key)}`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      v12Error(label, `has unknown field ${JSON.stringify(key)}`);
    }
  }
}

function v12Integer(value: unknown, label: string, min = 0): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < min
  ) {
    return v12Error(label, `must be a finite integer no less than ${String(min)}`);
  }
  return value;
}

function v12Cell(value: unknown, label: string): void {
  const cell = v12Record(value, label);
  v12ExactKeys(cell, ["gx", "gy"], label);
  v12Integer(cell.gx, `${label}.gx`);
  v12Integer(cell.gy, `${label}.gy`);
}

// Structural shape only. Occupancy, footprint, terrain, clearance, road access,
// identity, capex, and operating correlations are DOMAIN law and belong to
// assertStudioPlacementInvariants, which runs over the whole state below.
function checkPlacementShape(value: unknown): StudioPlacement {
  const placement = v12Record(value, "state.placement");
  v12ExactKeys(
    placement,
    ["mode", "nextPlacementId", "facilities"],
    "state.placement",
  );
  if (placement.mode !== "legacy" && placement.mode !== "managed") {
    v12Error("state.placement.mode", 'must be "legacy" or "managed"');
  }
  v12Integer(placement.nextPlacementId, "state.placement.nextPlacementId", 1);
  if (!Array.isArray(placement.facilities)) {
    v12Error("state.placement.facilities", "must be an array");
  }
  for (let i = 0; i < placement.facilities.length; i++) {
    const label = `state.placement.facilities[${String(i)}]`;
    const placed = v12Record(placement.facilities[i], label);
    v12ExactKeys(
      placed,
      [
        "id",
        "blueprintId",
        "parcelId",
        "origin",
        "cells",
        "facilityId",
        "projectId",
        "status",
        "placedWeek",
        "completesWeek",
      ],
      label,
    );
    v12Integer(placed.id, `${label}.id`, 1);
    v8String(placed.blueprintId, `${label}.blueprintId`, true);
    v8String(placed.parcelId, `${label}.parcelId`, true);
    v12Cell(placed.origin, `${label}.origin`);
    if (!Array.isArray(placed.cells) || placed.cells.length === 0) {
      v12Error(`${label}.cells`, "must be a non-empty array");
    }
    for (let c = 0; c < placed.cells.length; c++) {
      v12Cell(placed.cells[c], `${label}.cells[${String(c)}]`);
    }
    v8String(placed.facilityId, `${label}.facilityId`, true);
    v8String(placed.projectId, `${label}.projectId`, true);
    if (
      placed.status !== PLACEMENT_STATUSES[0] &&
      placed.status !== PLACEMENT_STATUSES[1]
    ) {
      v12Error(
        `${label}.status`,
        `must be one of ${PLACEMENT_STATUSES.map((status) => JSON.stringify(status)).join(", ")}`,
      );
    }
    v12Integer(placed.placedWeek, `${label}.placedWeek`);
    v12Integer(placed.completesWeek, `${label}.completesWeek`);
  }
  return placement as unknown as StudioPlacement;
}

// Placement Core V12 validator. The frozen V11 projection is structurally
// validated under the placement policy (which widens the capex correlation, adds
// the operating row, and requires the V11 project root to have retired), then the
// placement authority proves the whole state: footprints, terrain, occupancy,
// clearance, road access, identity, lifecycle clock, capital and operating rows,
// cash reconciliation, and the exact operational facility set.
//
// C1-M1a adds the policy parameter, for exactly the reason validateSaveV11 has
// one. Under `property-v13` this runs as a FRAGMENT of a larger state: the
// placement law it owns is geometry against a property, and the property root
// lives one level up where this projection cannot see it. Proving placements here
// would prove them against INITIAL_PROPERTY — right for every V12 file (whose
// property was implicitly the constants) but WRONG for a V13 world whose property
// has grown. So the whole-state proof is deferred to `validateSaveV13`, which runs
// the same one authority over the state INCLUDING its property, immediately after
// this returns. Structure, envelope, and the frozen V11 law all still run here.
function validateSaveV12WithPolicy(
  save: unknown,
  policy: "placement-v12" | "property-v13" | "sets-v14",
): SaveFileV12 {
  if (!isRecord(save)) {
    throw new Error("validateSaveV12: save is not a plain object");
  }
  v12ExactKeys(
    save,
    ["saveVersion", "seed", "state", "broadcastCache"],
    "save",
  );
  if (save.saveVersion !== 12) {
    throw new Error(
      `validateSaveV12: expected saveVersion 12, got ${JSON.stringify(save.saveVersion)}`,
    );
  }
  const state = v12Record(checkEnvelope(save, "validateSaveV12"), "state");
  v12ExactKeys(state, V12_STATE_KEYS, "state", V11_OPTIONAL_STATE_KEYS);
  if (!propertyAwarePolicy(policy)) {
    rejectV13AuthorityAtHistoricalBoundary(state, "validateSaveV12");
  }
  if (!setsAwarePolicy(policy)) {
    rejectV14AuthorityAtHistoricalBoundary(state, "validateSaveV12");
  }

  const { placement: rawPlacement, ...v11State } = state;
  try {
    validateSaveV11WithPolicy(
      {
        saveVersion: 11,
        seed: save.seed,
        state: v11State,
        broadcastCache: save.broadcastCache,
      },
      // C1-M3a: thread the LIVE policy down so a V13 save's demolition-refund
      // rows survive the frozen-V12 projection, while a genuine V12 file is still
      // validated under "placement-v12" and still refuses them. C2a-M1 threads
      // "sets-v14" the same way, one version on.
      propertyAwarePolicy(policy) ? policy : "placement-v12",
    );
  } catch (error) {
    throw new Error(
      `validateSaveV12: frozen V11 state is invalid — ${(error as Error).message}`,
    );
  }

  checkPlacementShape(rawPlacement);
  if (!propertyAwarePolicy(policy)) {
    try {
      // A frozen V12 state carries no property root, so the authority reads the
      // initial authored property — which IS the property every V12 file was
      // written against. See `propertyOf`.
      assertStudioPlacementInvariants(state as unknown as GameState);
    } catch (error) {
      throw new Error(`validateSaveV12: ${(error as Error).message}`);
    }
  }
  return save as SaveFileV12;
}

export function validateSaveV12(save: unknown): SaveFileV12 {
  return validateSaveV12WithPolicy(save, "placement-v12");
}

// ── Property State V13 (C1-M1a) ──────────────────────────────────────────────

const V13_STATE_KEYS = [...V12_STATE_KEYS, "property"] as const;
const PROPERTY_STRUCTURE_ROLES = ["landmark", "founding"] as const;

function v13Error(label: string, message: string): never {
  throw new Error(`validateSaveV13: ${label} ${message}`);
}

function v13Rect(value: unknown, label: string): void {
  const rect = v12Record(value, label);
  v12ExactKeys(rect, ["x0", "y0", "x1", "y1"], label);
  for (const key of ["x0", "y0", "x1", "y1"] as const) {
    if (
      typeof rect[key] !== "number" ||
      !Number.isFinite(rect[key]) ||
      !Number.isInteger(rect[key])
    ) {
      v13Error(`${label}.${key}`, "must be a finite integer");
    }
  }
}

// Structural shape only, exactly as `checkPlacementShape` is. Bounds sanity,
// on-property containment, structure overlap, and the provides-links law are
// DOMAIN law and belong to assertStudioPlacementInvariants, which runs over the
// whole state below.
function checkPropertyShape(value: unknown): PropertyState {
  const property = v12Record(value, "state.property");
  v12ExactKeys(
    property,
    ["bounds", "roads", "parcels", "structures"],
    "state.property",
  );

  const bounds = v12Record(property.bounds, "state.property.bounds");
  v12ExactKeys(bounds, ["width", "depth"], "state.property.bounds");
  v12Integer(bounds.width, "state.property.bounds.width", 1);
  v12Integer(bounds.depth, "state.property.bounds.depth", 1);

  if (!Array.isArray(property.roads)) {
    v13Error("state.property.roads", "must be an array");
  }
  for (let i = 0; i < property.roads.length; i++) {
    v13Rect(property.roads[i], `state.property.roads[${String(i)}]`);
  }

  if (!Array.isArray(property.parcels)) {
    v13Error("state.property.parcels", "must be an array");
  }
  for (let i = 0; i < property.parcels.length; i++) {
    const label = `state.property.parcels[${String(i)}]`;
    const parcel = v12Record(property.parcels[i], label);
    v12ExactKeys(
      parcel,
      ["id", "label", "terrain", "rect", "ownedFromStart"],
      label,
    );
    v8String(parcel.id, `${label}.id`, true);
    v8String(parcel.label, `${label}.label`, true);
    if (parcel.terrain !== "buildable" && parcel.terrain !== "blocked") {
      v13Error(`${label}.terrain`, 'must be "buildable" or "blocked"');
    }
    v13Rect(parcel.rect, `${label}.rect`);
    // There is no land market: every parcel of the property is owned from week
    // zero, and `notOwned` means "not part of the property" (see lot.ts).
    if (parcel.ownedFromStart !== true) {
      v13Error(`${label}.ownedFromStart`, "must be true");
    }
  }

  if (!Array.isArray(property.structures)) {
    v13Error("state.property.structures", "must be an array");
  }
  for (let i = 0; i < property.structures.length; i++) {
    const label = `state.property.structures[${String(i)}]`;
    const structure = v12Record(property.structures[i], label);
    v12ExactKeys(
      structure,
      ["id", "label", "role", "origin", "footprint", "providesFacilityIds"],
      label,
    );
    v8String(structure.id, `${label}.id`, true);
    v8String(structure.label, `${label}.label`, true);
    if (
      structure.role !== PROPERTY_STRUCTURE_ROLES[0] &&
      structure.role !== PROPERTY_STRUCTURE_ROLES[1]
    ) {
      v13Error(
        `${label}.role`,
        `must be one of ${PROPERTY_STRUCTURE_ROLES.map((role) => JSON.stringify(role)).join(", ")}`,
      );
    }
    v12Cell(structure.origin, `${label}.origin`);
    const footprint = v12Record(structure.footprint, `${label}.footprint`);
    v12ExactKeys(footprint, ["width", "depth"], `${label}.footprint`);
    v12Integer(footprint.width, `${label}.footprint.width`, 1);
    v12Integer(footprint.depth, `${label}.footprint.depth`, 1);
    if (!Array.isArray(structure.providesFacilityIds)) {
      v13Error(`${label}.providesFacilityIds`, "must be an array");
    }
    for (let f = 0; f < structure.providesFacilityIds.length; f++) {
      v8String(
        structure.providesFacilityIds[f],
        `${label}.providesFacilityIds[${String(f)}]`,
        true,
      );
    }
  }

  return property as unknown as PropertyState;
}

// Property State V13 validator (C1-M1a). The frozen V12 projection is structurally
// validated under the property policy (which defers the placement geometry proof
// to this level, where the property is visible), the property root is structurally
// checked, and then the ONE placement authority proves the whole state: property
// bounds, road and parcel rectangles, structure geometry, provides-links, and
// every V12 placement law — this time against the property the state actually
// carries rather than the authored constants.
function validateSaveV13WithPolicy(
  save: unknown,
  policy: "property-v13" | "sets-v14",
): SaveFileV13 {
  if (!isRecord(save)) {
    throw new Error("validateSaveV13: save is not a plain object");
  }
  v12ExactKeys(
    save,
    ["saveVersion", "seed", "state", "broadcastCache"],
    "save",
  );
  if (save.saveVersion !== 13) {
    throw new Error(
      `validateSaveV13: expected saveVersion 13, got ${JSON.stringify(save.saveVersion)}`,
    );
  }
  const state = v12Record(checkEnvelope(save, "validateSaveV13"), "state");
  v12ExactKeys(state, V13_STATE_KEYS, "state", V11_OPTIONAL_STATE_KEYS);
  if (!setsAwarePolicy(policy)) {
    rejectV14AuthorityAtHistoricalBoundary(state, "validateSaveV13");
  }

  const { property: rawProperty, ...v12State } = state;
  try {
    validateSaveV12WithPolicy(
      {
        saveVersion: 12,
        seed: save.seed,
        state: v12State,
        broadcastCache: save.broadcastCache,
      },
      policy,
    );
  } catch (error) {
    throw new Error(
      `validateSaveV13: frozen V12 state is invalid — ${(error as Error).message}`,
    );
  }

  checkPropertyShape(rawProperty);
  try {
    assertStudioPlacementInvariants(state as unknown as GameState);
  } catch (error) {
    throw new Error(`validateSaveV13: ${(error as Error).message}`);
  }
  return save as SaveFileV13;
}

export function validateSaveV13(save: unknown): SaveFileV13 {
  return validateSaveV13WithPolicy(save, "property-v13");
}

// ── Sets, queue, screenplays, and history — SaveFileV14 (C2a-M1) ─────────────

const V14_STATE_KEYS = [...V13_STATE_KEYS, ...V14_ROOT_KEYS] as const;
const SET_STATUSES = ["under-construction", "standing", "retired"] as const;
const STUDIO_EVENT_KINDS = [
  "wrapped",
  "premiere",
  "constructionCompleted",
  "setBuilt",
  "setRetired",
  "reservationGranted",
  "reservationReleased",
  "phaseEntered",
  "sceneryArrived",
  "queueAdmitted",
  "queueIntentExpired",
] as const;
const QUEUE_ENTRY_KINDS = [
  "commissionScript",
  "commissionOriginalScreenplay",
  "startCastingSession",
  "greenlightScriptProject",
] as const;

function v14Error(label: string, message: string): never {
  throw new Error(`validateSaveV14: ${label} ${message}`);
}

function v14Record(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) return v14Error(label, "must be a plain object");
  return value;
}

function v14Array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) return v14Error(label, "must be an array");
  return value;
}

function v14String(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    return v14Error(label, "must be a non-empty string");
  }
  return value;
}

function v14Integer(value: unknown, label: string, min = 0): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < min
  ) {
    return v14Error(label, `must be a finite integer no less than ${String(min)}`);
  }
  return value;
}

function v14Bounded(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    return v14Error(label, `must be a finite number within [${String(min)}, ${String(max)}]`);
  }
  return value;
}

/**
 * `state.sets` + `state.nextSetId` (§8.1). Structural, plus the identity law that
 * makes the counter meaningful: ids are `set-<n>` with `n < nextSetId`, and no id
 * repeats. `nextSetId` NEVER rolls back — that is what stops a struck set's id
 * from being handed to a different set later and quietly rewriting which picture
 * shot where.
 *
 * `mountedOn` is proved against the studio's real soundstages, because a set
 * mounted on a building that is not a stage is not a set anybody can shoot on.
 */
function checkSetsShape(
  value: unknown,
  nextSetIdRaw: unknown,
  soundstageFacilityIds: ReadonlySet<string>,
): readonly StudioSet[] {
  const sets = v14Array(value, "state.sets");
  const nextSetId = v14Integer(nextSetIdRaw, "state.nextSetId", 0);
  const ids = new Set<string>();
  const genres = [...GENRE_ORDER];
  for (let i = 0; i < sets.length; i++) {
    const label = `state.sets[${String(i)}]`;
    const set = v14Record(sets[i], label);
    v14ExactKeys(
      set,
      [
        "id",
        "name",
        "blueprintId",
        "mountedOn",
        "setType",
        "status",
        "completesWeek",
        "quality",
        "novelty",
        "condition",
        "genreWeights",
        "priorityGenre",
      ],
      label,
    );
    const id = v14String(set.id, `${label}.id`);
    if (ids.has(id)) v14Error(`${label}.id`, "is duplicated");
    ids.add(id);
    const ordinal = /^set-(0|[1-9][0-9]*)$/.exec(id);
    if (ordinal === null) {
      v14Error(`${label}.id`, 'must be "set-" followed by its mint ordinal');
    }
    if (Number(ordinal[1]) >= nextSetId) {
      v14Error(
        `${label}.id`,
        `was never minted — state.nextSetId is ${String(nextSetId)}`,
      );
    }
    v14String(set.name, `${label}.name`);
    v14String(set.blueprintId, `${label}.blueprintId`);
    const mountedOn = v14String(set.mountedOn, `${label}.mountedOn`);
    if (!soundstageFacilityIds.has(mountedOn)) {
      v14Error(`${label}.mountedOn`, "must name one of the studio's soundstages");
    }
    if (!(SET_TYPES as readonly string[]).includes(v14String(set.setType, `${label}.setType`))) {
      v14Error(`${label}.setType`, "is not in the authored SET_TYPES vocabulary");
    }
    if (!(SET_STATUSES as readonly unknown[]).includes(set.status)) {
      v14Error(`${label}.status`, "is invalid");
    }
    if (set.completesWeek !== null) {
      v14Integer(set.completesWeek, `${label}.completesWeek`, 0);
    }
    // A set still going up owes the player a completion week; a standing or
    // retired one is done being promised anything.
    if (set.status === "under-construction" && set.completesWeek === null) {
      v14Error(`${label}.completesWeek`, "is required while a set is under construction");
    }
    v14Bounded(set.quality, `${label}.quality`, 0, 100);
    v14Bounded(set.novelty, `${label}.novelty`, 0, 1);
    v14Bounded(set.condition, `${label}.condition`, 0, 100);
    const weights = v14Record(set.genreWeights, `${label}.genreWeights`);
    v14ExactKeys(weights, genres, `${label}.genreWeights`);
    for (const genre of genres) {
      v14Bounded(weights[genre], `${label}.genreWeights.${genre}`, 0, 1);
    }
    if (!genres.includes(set.priorityGenre as (typeof genres)[number])) {
      v14Error(`${label}.priorityGenre`, "is not a known genre");
    }
  }
  return sets as unknown as readonly StudioSet[];
}

function v14ExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  label: string,
): void {
  const allowed = new Set(required);
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      v14Error(label, `is missing required field ${JSON.stringify(key)}`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) v14Error(label, `has unknown field ${JSON.stringify(key)}`);
  }
}

/**
 * `state.productionQueue` (§8.1). Structural only, and deliberately so: a queued
 * intent's payload is REVALIDATED at dequeue against the state of that week, not
 * trusted because it was legal when it was admitted. What this proves is the
 * ordering law — ordinals are unique and strictly ascending, because the ordinal
 * IS the queue's fairness guarantee (§3.3) — and that no row carries a production
 * id, which it cannot, because no production exists before greenlight.
 */
function checkProductionQueueShape(value: unknown): readonly ProductionQueueEntry[] {
  const queue = v14Array(value, "state.productionQueue");
  let previousOrdinal = -1;
  for (let i = 0; i < queue.length; i++) {
    const label = `state.productionQueue[${String(i)}]`;
    const entry = v14Record(queue[i], label);
    const kind = entry.kind;
    if (!(QUEUE_ENTRY_KINDS as readonly unknown[]).includes(kind)) {
      v14Error(`${label}.kind`, "is not a known queue entry kind");
    }
    v14ExactKeys(
      entry,
      kind === "greenlightScriptProject"
        ? ["kind", "ordinal", "queuedWeek", "scriptProjectId", "payload"]
        : ["kind", "ordinal", "queuedWeek", "payload"],
      label,
    );
    const ordinal = v14Integer(entry.ordinal, `${label}.ordinal`, 0);
    if (ordinal <= previousOrdinal) {
      v14Error(`${label}.ordinal`, "must be strictly ascending — the ordinal is the queue order");
    }
    previousOrdinal = ordinal;
    v14Integer(entry.queuedWeek, `${label}.queuedWeek`, 0);
    if (kind === "greenlightScriptProject") {
      v14String(entry.scriptProjectId, `${label}.scriptProjectId`);
    }
    v14Record(entry.payload, `${label}.payload`);
    v8AssertPlainJson(entry.payload, label);
  }
  return queue as unknown as readonly ProductionQueueEntry[];
}

/**
 * `state.originalScreenplays` (§8.1). The blueprint root is APPEND-ONLY history:
 * ordinals are unique, `nextOrdinal` is above every minted one, and a concept id
 * appears at most once — a screenplay's provenance is minted exactly once and is
 * never re-minted (owner ruling `00E`.7).
 */
function checkOriginalScreenplaysShape(value: unknown): OriginalScreenplays {
  const root = v14Record(value, "state.originalScreenplays");
  v14ExactKeys(root, ["nextOrdinal", "blueprints"], "state.originalScreenplays");
  const nextOrdinal = v14Integer(root.nextOrdinal, "state.originalScreenplays.nextOrdinal", 0);
  const blueprints = v14Array(root.blueprints, "state.originalScreenplays.blueprints");
  const conceptIds = new Set<string>();
  const ordinals = new Set<number>();
  for (let i = 0; i < blueprints.length; i++) {
    const label = `state.originalScreenplays.blueprints[${String(i)}]`;
    const blueprint = v14Record(blueprints[i], label);
    v14ExactKeys(
      blueprint,
      [
        "conceptId",
        "ordinal",
        "mintedWeek",
        "projectId",
        "writerId",
        "generatedTitle",
        "renamedWeek",
        "beats",
        "officeTierAtMint",
      ],
      label,
    );
    const conceptId = v14String(blueprint.conceptId, `${label}.conceptId`);
    if (conceptIds.has(conceptId)) v14Error(`${label}.conceptId`, "is duplicated");
    conceptIds.add(conceptId);
    if (blueprint.ordinal !== null) {
      const ordinal = v14Integer(blueprint.ordinal, `${label}.ordinal`, 0);
      if (ordinal >= nextOrdinal) {
        v14Error(`${label}.ordinal`, "was never minted — it is at or above nextOrdinal");
      }
      if (ordinals.has(ordinal)) v14Error(`${label}.ordinal`, "is duplicated");
      ordinals.add(ordinal);
    }
    v14Integer(blueprint.mintedWeek, `${label}.mintedWeek`, 0);
    v14String(blueprint.projectId, `${label}.projectId`);
    v14String(blueprint.writerId, `${label}.writerId`);
    if (blueprint.generatedTitle !== null) {
      v14String(blueprint.generatedTitle, `${label}.generatedTitle`);
    }
    if (blueprint.renamedWeek !== null) {
      v14Integer(blueprint.renamedWeek, `${label}.renamedWeek`, 0);
    }
    const beats = v14Array(blueprint.beats, `${label}.beats`);
    for (let b = 0; b < beats.length; b++) {
      const beatLabel = `${label}.beats[${String(b)}]`;
      const beat = v14Record(beats[b], beatLabel);
      v14ExactKeys(beat, ["name", "requiredSetType"], beatLabel);
      v14String(beat.name, `${beatLabel}.name`);
      const setType = v14String(beat.requiredSetType, `${beatLabel}.requiredSetType`);
      if (!(SET_TYPES as readonly string[]).includes(setType)) {
        v14Error(
          `${beatLabel}.requiredSetType`,
          "is not in the authored SET_TYPES vocabulary",
        );
      }
    }
    v14String(blueprint.officeTierAtMint, `${label}.officeTierAtMint`);
  }
  return root as unknown as OriginalScreenplays;
}

/**
 * `state.studioEvents` (§5/§8.1). The laws that make the log trustworthy:
 *
 *   * `seq` is unique and STRICTLY ASCENDING, and every row's seq is below
 *     `nextSeq` — the counter never rewinds, so a consumer's cursor stays
 *     meaningful across a compaction.
 *   * NO row carries a `seen` or `consumed` field. That is enforced by the
 *     per-kind exact-key lists, and it is the reason two identical playthroughs
 *     export identical bytes.
 *   * Tier W rows are inside the retention window; Tier D rows may be any age.
 *     Compaction is a pure function of `market.tick`, so a row outside the window
 *     is a row the engine could not have produced.
 *   * No row is dated in the future.
 */
function checkStudioEventsShape(value: unknown, currentWeek: number): StudioEventLog {
  const log = v14Record(value, "state.studioEvents");
  v14ExactKeys(log, ["nextSeq", "rows"], "state.studioEvents");
  const nextSeq = v14Integer(log.nextSeq, "state.studioEvents.nextSeq", 0);
  const rows = v14Array(log.rows, "state.studioEvents.rows");
  const oldestKeptWeek = currentWeek - (TUNING.STUDIO_EVENT_WINDOW_WEEKS - 1);
  let previousSeq = -1;
  for (let i = 0; i < rows.length; i++) {
    const label = `state.studioEvents.rows[${String(i)}]`;
    const row = v14Record(rows[i], label);
    const kind = row.kind;
    if (!(STUDIO_EVENT_KINDS as readonly unknown[]).includes(kind)) {
      v14Error(`${label}.kind`, "is not a known studio event kind");
    }
    v14ExactKeys(row, ["seq", "week", "kind", ...studioEventPayloadKeys(kind as string)], label);
    const seq = v14Integer(row.seq, `${label}.seq`, 0);
    if (seq <= previousSeq) {
      v14Error(`${label}.seq`, "must be strictly ascending");
    }
    previousSeq = seq;
    if (seq >= nextSeq) {
      v14Error(`${label}.seq`, "is at or above nextSeq — the sequence never rewinds");
    }
    const week = v14Integer(row.week, `${label}.week`, 0);
    if (week > currentWeek) {
      v14Error(`${label}.week`, "is in the future");
    }
    if (!isTierDStudioEventKind(kind as never) && week < oldestKeptWeek) {
      v14Error(
        `${label}.week`,
        `is outside the ${String(TUNING.STUDIO_EVENT_WINDOW_WEEKS)}-week retention window and should have been compacted`,
      );
    }
    for (const key of studioEventPayloadKeys(kind as string)) {
      if (key === "setId" && kind === "wrapped") {
        if (row.setId !== null) v14String(row.setId, `${label}.setId`);
        continue;
      }
      if (key === "refund" || key === "ordinal") {
        v14Integer(row[key], `${label}.${key}`, key === "refund" ? 0 : 0);
        continue;
      }
      if (key === "phase") {
        if (!(OPERATIONS_PHASES as readonly unknown[]).includes(row.phase)) {
          v14Error(`${label}.phase`, "is not a known production phase");
        }
        continue;
      }
      v14String(row[key], `${label}.${key}`);
    }
  }
  return log as unknown as StudioEventLog;
}

/** The payload keys each event kind carries beyond `seq`/`week`/`kind`. */
function studioEventPayloadKeys(kind: string): readonly string[] {
  switch (kind) {
    case "wrapped":
      return ["productionId", "stageFacilityId", "setId"];
    case "premiere":
      return ["filmId"];
    case "constructionCompleted":
      return ["placementId"];
    case "setBuilt":
      return ["setId"];
    case "setRetired":
      return ["setId", "refund"];
    case "reservationGranted":
    case "reservationReleased":
      return ["ownerId", "resourceKey"];
    case "phaseEntered":
      return ["productionId", "phase"];
    case "sceneryArrived":
      return ["productionId"];
    case "queueAdmitted":
      return ["entryKind", "ordinal"];
    case "queueIntentExpired":
      return ["entryKind", "ordinal", "reason"];
    default:
      return [];
  }
}

/**
 * The C2a-M1 live validator. The frozen V13 projection is validated under the
 * sets policy — which is what admits the widened `bindings` / `writerIds` leaves
 * and the set capital ledger kinds one level down — and then the four new roots
 * receive their own exact-key, scalar, range, identity, and ordering checks.
 *
 * The GATE (§5 pin 6) is proved here rather than assumed: a legacy-mode studio
 * has no operations, and therefore no sets, no queue, and no history. A legacy
 * save carrying any of them is a save the engine could not have written.
 */
export function validateSaveV14(save: unknown): SaveFileV14 {
  if (!isRecord(save)) {
    throw new Error("validateSaveV14: save is not a plain object");
  }
  v12ExactKeys(save, ["saveVersion", "seed", "state", "broadcastCache"], "save");
  if (save.saveVersion !== 14) {
    throw new Error(
      `validateSaveV14: expected saveVersion 14, got ${JSON.stringify(save.saveVersion)}`,
    );
  }
  const state = v14Record(checkEnvelope(save, "validateSaveV14"), "state");
  v12ExactKeys(state, V14_STATE_KEYS, "state", V11_OPTIONAL_STATE_KEYS);

  const {
    sets: rawSets,
    nextSetId: rawNextSetId,
    productionQueue: rawQueue,
    originalScreenplays: rawScreenplays,
    studioEvents: rawEvents,
    ...v13State
  } = state;
  try {
    validateSaveV13WithPolicy(
      {
        saveVersion: 13,
        seed: save.seed,
        state: v13State,
        broadcastCache: save.broadcastCache,
      },
      "sets-v14",
    );
  } catch (error) {
    throw new Error(
      `validateSaveV14: frozen V13 state is invalid — ${(error as Error).message}`,
    );
  }

  const typedState = state as unknown as GameStateV14;
  const managed = typedState.operations.mode === "managed";
  const soundstageFacilityIds = new Set<string>(
    typedState.operations.facilities
      .filter((facility) => facility.capability === "soundstage")
      .map((facility) => facility.id),
  );

  checkSetsShape(rawSets, rawNextSetId, soundstageFacilityIds);
  checkProductionQueueShape(rawQueue);
  checkOriginalScreenplaysShape(rawScreenplays);
  checkStudioEventsShape(rawEvents, typedState.market.tick);

  if (!managed) {
    // THE GATE. Legacy and headless worlds own no studio operations, so they own
    // no studio history — and that is exactly what keeps the M0A acceptance
    // corpus byte-identical across this bump without re-baselining it.
    if ((rawSets as unknown[]).length !== 0 || rawNextSetId !== 0) {
      v14Error("state.sets", "must be empty while studio operations are legacy");
    }
    if ((rawQueue as unknown[]).length !== 0) {
      v14Error("state.productionQueue", "must be empty while studio operations are legacy");
    }
    if (typedState.originalScreenplays.blueprints.length !== 0) {
      v14Error(
        "state.originalScreenplays.blueprints",
        "must be empty while studio operations are legacy",
      );
    }
    if (typedState.studioEvents.rows.length !== 0 || typedState.studioEvents.nextSeq !== 0) {
      v14Error("state.studioEvents", "must be empty while studio operations are legacy");
    }
  }

  return save as SaveFileV14;
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
  if (s.saveVersion === 10) return validateSaveV10(save);
  if (s.saveVersion === 11) return validateSaveV11(save);
  if (s.saveVersion === 12) return validateSaveV12(save);
  if (s.saveVersion === 13) return validateSaveV13(save);
  if (s.saveVersion === 14) return validateSaveV14(save);
  throw new Error(
    `validateSave: unknown saveVersion ${JSON.stringify(s.saveVersion)} (this build handles versions 1 through 14 only)`,
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

function historicalLedgerProjection(
  ledger: readonly LedgerEntry[],
): LedgerEntryV10[] {
  for (const entry of ledger) {
    if (
      entry.kind === "constructionCapex" ||
      Object.prototype.hasOwnProperty.call(entry, "constructionProjectId")
    ) {
      throw new Error(
        "frozen save projection cannot discard authoritative V11 construction ledger state",
      );
    }
    if (entry.kind === "facilityOpex") {
      throw new Error(
        "frozen save projection cannot discard authoritative V12 facility operating ledger state",
      );
    }
    if (entry.kind === "facilityDemolitionRefund") {
      throw new Error(
        "frozen save projection cannot discard authoritative V13 facility demolition ledger state",
      );
    }
  }
  // The discriminant and forbidden-correlation checks above narrow this exact
  // array logically; preserve its identity at the historical projection boundary.
  return ledger as readonly LedgerEntryV10[] as LedgerEntryV10[];
}

type HistoricalProjectionSource<T extends GameStateV3> = Omit<T, "ledger"> & {
  // Keep each mutable array intact rather than requiring the historical array
  // to be assignable to a mutable array of the wider element union. Both the
  // documented frozen state and live V11 state are valid positive inputs; the
  // runtime projector below rejects V11-only rows before narrowing the output.
  ledger: LedgerEntryV10[] | LedgerEntry[];
};

function projectStateV3(
  state: HistoricalProjectionSource<GameStateV3>,
): GameStateV3 {
  return {
    ...projectStateV2(state),
    founding: state.founding,
    contracts: state.contracts,
    ledger: historicalLedgerProjection(state.ledger),
    freeAgents: state.freeAgents,
  };
}

function projectStateV4(
  state: HistoricalProjectionSource<GameStateV4>,
): GameStateV4 {
  return {
    ...projectStateV3(state),
    theatricalRuns: state.theatricalRuns,
  };
}

function projectStateV5(
  state: HistoricalProjectionSource<GameStateV5>,
): GameStateV5 {
  return {
    ...projectStateV4(state),
    careerEvents: state.careerEvents,
  };
}

function projectStateV6(
  state: HistoricalProjectionSource<GameStateV6>,
): GameStateV6 {
  return {
    ...projectStateV5(state),
    economyEngagedEver: state.economyEngagedEver,
  };
}

function projectStateV7(
  state: HistoricalProjectionSource<GameStateV7>,
): GameStateV7 {
  return {
    ...projectStateV6(state),
    publicity: state.publicity,
  };
}

// ── The V14 LEAF projection (C2a-M1) ────────────────────────────────────────
//
// `ProductionWorkflow.bindings` and `ScriptProject.writerIds` are widened
// persisted LEAVES (§8.2), not roots — they ride inside `operations` and
// `scriptDevelopment`, which every frozen projection copies wholesale. A frozen
// envelope must carry the shape ITS OWN VERSION shipped, and the pre-V14
// validators enforce exactly that, so the leaves are enumerated away here.
//
// DROPPING THEM IS LOSSLESS BY CONSTRUCTION, which is why this is a projection
// and not a refusal:
//   * `assertFrozenBuilderCanProjectV14State` has already refused any state whose
//     bindings carry authority — a bound set, a locked uplift term, a
//     `requiresSetBinding` marker, a `set-unavailable` blocker;
//   * what remains, `stageFacilityId` and `heldSinceWeek`, is DERIVED from the
//     soundstage reservation the frozen envelope still carries — which is
//     precisely how §8.3 reconstructs it on the way back up;
//   * `writerIds` is `[writerId]`, and `writerId` is frozen V9 state.
// So the round trip puts back identical bytes.
//
// Positively enumerated, never clone-then-delete: a future leaf must be given a
// home here deliberately rather than surviving by omission.
function projectWorkflowPreV14(workflow: ProductionWorkflow): ProductionWorkflow {
  return {
    productionId: workflow.productionId,
    phase: workflow.phase,
    reservations: workflow.reservations,
    shootingTask: workflow.shootingTask,
    blocker: workflow.blocker,
  } as unknown as ProductionWorkflow;
}

function projectOperationsPreV14(operations: StudioOperations): StudioOperations {
  return {
    ...operations,
    workflows: operations.workflows.map(projectWorkflowPreV14),
  };
}

function projectScriptDevelopmentPreV14(
  development: ScriptDevelopment,
): ScriptDevelopment {
  return {
    ...development,
    projects: development.projects.map(
      (project) =>
        ({
          id: project.id,
          conceptId: project.conceptId,
          writerId: project.writerId,
          shape: project.shape,
          promise: project.promise,
          status: project.status,
          rewriteCount: project.rewriteCount,
          commissionedWeek: project.commissionedWeek,
          dueWeek: project.dueWeek,
          assessment: project.assessment,
          reservation: project.reservation,
          productionId: project.productionId,
        }) as unknown as ScriptProject,
    ),
  };
}

function projectStateV8(
  state: HistoricalProjectionSource<GameStateV8>,
): GameStateV8 {
  return {
    ...projectStateV7(state),
    operations: projectOperationsPreV14(state.operations),
  };
}

function projectStateV9(
  state: HistoricalProjectionSource<GameStateV9>,
): GameStateV9 {
  return {
    ...projectStateV8(state),
    scriptDevelopment: projectScriptDevelopmentPreV14(state.scriptDevelopment),
  };
}

function projectStateV10(
  state: HistoricalProjectionSource<GameStateV10>,
): GameStateV10 {
  return {
    ...projectStateV9(state),
    castingSessions: state.castingSessions,
  };
}

// The V11 ledger projection: a V12 value may cross this boundary only when it
// carries no V12-only row. Construction capex survives (V11 owned it) provided it
// still identifies the one canonical Annex project.
function historicalConstructionLedgerProjection(
  ledger: readonly LedgerEntry[],
): LedgerEntryV11[] {
  for (const entry of ledger) {
    if (entry.kind === "facilityOpex") {
      throw new Error(
        "frozen save projection cannot discard authoritative V12 facility operating ledger state",
      );
    }
    if (entry.kind === "facilityDemolitionRefund") {
      throw new Error(
        "frozen save projection cannot discard authoritative V13 facility demolition ledger state",
      );
    }
    if (
      entry.kind === "constructionCapex" &&
      entry.constructionProjectId !== ANNEX_PROJECT_ID
    ) {
      throw new Error(
        "frozen save projection cannot relabel an authoritative V12 catalog project as the canonical Annex",
      );
    }
  }
  return ledger as readonly LedgerEntryV11[] as LedgerEntryV11[];
}

type HistoricalProjectionSourceV11 = Omit<GameStateV11, "ledger"> & {
  ledger: LedgerEntryV11[] | LedgerEntry[];
  // A live V12 value is a valid positive input; `projectStateV11` never copies
  // this key and `assertFrozenBuilderCanProjectV12State` refuses any placement
  // root that is not empty, so no authority can be discarded here.
  placement?: StudioPlacement;
};

function projectStateV11(state: HistoricalProjectionSourceV11): GameStateV11 {
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
    founding: state.founding,
    contracts: state.contracts,
    ledger: historicalConstructionLedgerProjection(state.ledger),
    freeAgents: state.freeAgents,
    theatricalRuns: state.theatricalRuns,
    careerEvents: state.careerEvents,
    economyEngagedEver: state.economyEngagedEver,
    publicity: state.publicity,
    operations: projectOperationsPreV14(state.operations),
    scriptDevelopment: projectScriptDevelopmentPreV14(state.scriptDevelopment),
    castingSessions: state.castingSessions,
    construction: state.construction,
    ...(state.cashLedgerCheckpoint === undefined
      ? {}
      : { cashLedgerCheckpoint: state.cashLedgerCheckpoint }),
  };
}

type HistoricalProjectionSourceV12 = GameStateV12 & {
  // A live V13 value is a valid positive input; `projectStateV12` never copies
  // this key and `assertFrozenBuilderCanProjectV13State` refuses any property
  // that has grown beyond the authored initial one, so nothing can be discarded.
  property?: PropertyState;
};

// The frozen V12 projection. Enumerated positively (never a clone-then-delete)
// and deliberately NOT built on projectStateV11, whose ledger narrowing exists to
// refuse V12 rows at a historical boundary.
function projectStateV12(state: HistoricalProjectionSourceV12): GameStateV12 {
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
    founding: state.founding,
    contracts: state.contracts,
    ledger: state.ledger,
    freeAgents: state.freeAgents,
    theatricalRuns: state.theatricalRuns,
    careerEvents: state.careerEvents,
    economyEngagedEver: state.economyEngagedEver,
    publicity: state.publicity,
    operations: projectOperationsPreV14(state.operations),
    scriptDevelopment: projectScriptDevelopmentPreV14(state.scriptDevelopment),
    castingSessions: state.castingSessions,
    construction: state.construction,
    placement: state.placement,
    ...(state.cashLedgerCheckpoint === undefined
      ? {}
      : { cashLedgerCheckpoint: state.cashLedgerCheckpoint }),
  };
}

// The frozen V13 projection (C1-M1a). Same positive enumeration one version on,
// plus the property root that makes the studio's ground savable. FROZEN as of
// C2a-M1: it deliberately does not copy the four V14 roots, and
// `assertFrozenBuilderCanProjectV14State` refuses any state that would lose
// something real by having them dropped here.
function projectStateV13(state: GameStateV13): GameStateV13 {
  return {
    ...projectStateV12(state),
    property: state.property,
  };
}

// The live projection (C2a-M1). Positive enumeration again, one version on: the
// studio's sets and the counter that names them, the queue of admitted intents,
// the original-screenplay blueprints, and the studio's own history.
function projectStateV14(state: GameStateV14): GameStateV14 {
  return {
    ...projectStateV13(state),
    // The frozen projections below this one enumerate the widened V14 LEAVES
    // away, because a frozen envelope must carry its own version's shape. The
    // live envelope carries them, so they are restored here — positively, at the
    // one version that owns them.
    operations: state.operations,
    scriptDevelopment: state.scriptDevelopment,
    sets: state.sets,
    nextSetId: state.nextSetId,
    productionQueue: state.productionQueue,
    originalScreenplays: state.originalScreenplays,
    studioEvents: state.studioEvents,
  };
}

function assertFrozenBuilderCanProjectV11State(
  state: object,
  builder: string,
  targetVersion: number,
): void {
  const candidate = state as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(candidate, "construction")) {
    const construction = candidate.construction;
    const isEmptyLegacy = deepEqual(construction, emptyStudioConstruction());
    const isVacantManaged = deepEqual(
      construction,
      initialManagedStudioConstruction(),
    );
    if (!isEmptyLegacy && !isVacantManaged) {
      throw new Error(
        `${builder}: cannot downgrade or discard authoritative V11 construction history`,
      );
    }
  }

  if (Object.prototype.hasOwnProperty.call(candidate, "cashLedgerCheckpoint")) {
    const checkpoint = candidate.cashLedgerCheckpoint;
    const ledger = Array.isArray(candidate.ledger) ? candidate.ledger : [];
    if (
      !isRecord(checkpoint) ||
      typeof checkpoint.cash !== "number" ||
      !Number.isFinite(checkpoint.cash) ||
      typeof checkpoint.ledgerLength !== "number" ||
      !Number.isInteger(checkpoint.ledgerLength) ||
      checkpoint.ledgerLength < 0 ||
      checkpoint.ledgerLength > ledger.length
    ) {
      throw new Error(
        `${builder}: cannot project a malformed V11 cash-ledger checkpoint`,
      );
    }
    if (checkpoint.ledgerLength !== ledger.length) {
      throw new Error(
        `${builder}: cannot downgrade or move the authoritative V11 cash-ledger checkpoint after post-checkpoint activity`,
      );
    }
    const studio = isRecord(candidate.studio) ? candidate.studio : null;
    const prefixCash = ledger.reduce<number>((cash, raw) => {
      if (!isRecord(raw) || typeof raw.amount !== "number" || !Number.isFinite(raw.amount)) {
        throw new Error(
          `${builder}: cannot project a malformed historical ledger owned by the V11 cash-ledger checkpoint`,
        );
      }
      return cash + raw.amount;
    }, TUNING.INITIAL_CASH);
    if (
      studio === null ||
      typeof studio.cash !== "number" ||
      !Number.isFinite(studio.cash) ||
      studio.cash !== checkpoint.cash ||
      checkpoint.cash === prefixCash
    ) {
      throw new Error(
        `${builder}: cannot downgrade or repair a semantically invalid V11 cash-ledger checkpoint`,
      );
    }
    if (targetVersion < 3 && ledger.length > 0) {
      throw new Error(
        `${builder}: cannot discard the historical ledger prefix required by the V11 cash-ledger checkpoint`,
      );
    }
  }

  if (Array.isArray(candidate.ledger)) {
    for (const raw of candidate.ledger) {
      if (
        isRecord(raw) &&
        (raw.kind === "constructionCapex" ||
          Object.prototype.hasOwnProperty.call(raw, "constructionProjectId"))
      ) {
        throw new Error(
          `${builder}: cannot downgrade or discard authoritative V11 construction ledger state`,
        );
      }
    }
  }

  if (isRecord(candidate.operations) && Array.isArray(candidate.operations.facilities)) {
    if (
      candidate.operations.facilities.some(
        (facility) => isRecord(facility) && facility.id === ANNEX_FACILITY_ID,
      )
    ) {
      throw new Error(
        `${builder}: cannot downgrade or discard the operational V11 Annex facility`,
      );
    }
  }
}

// The same guard one version on. A frozen builder may cross this boundary only
// when the state carries no authoritative V12 placement history: an empty legacy
// or empty managed placement root loses nothing, anything else would discard a
// real placed facility, its land, its debit, or its operating charges.
function assertFrozenBuilderCanProjectV12State(
  state: object,
  builder: string,
): void {
  const candidate = state as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(candidate, "placement")) {
    const placement = candidate.placement;
    const isEmptyLegacy = deepEqual(placement, emptyStudioPlacement());
    const isEmptyManaged = deepEqual(placement, initialManagedStudioPlacement());
    if (!isEmptyLegacy && !isEmptyManaged) {
      throw new Error(
        `${builder}: cannot downgrade or discard authoritative V12 placement history`,
      );
    }
  }
  if (Array.isArray(candidate.ledger)) {
    for (const raw of candidate.ledger) {
      if (!isRecord(raw)) continue;
      if (raw.kind === "facilityOpex") {
        throw new Error(
          `${builder}: cannot downgrade or discard authoritative V12 facility operating ledger state`,
        );
      }
      if (
        raw.kind === "constructionCapex" &&
        typeof raw.constructionProjectId === "string" &&
        raw.constructionProjectId !== ANNEX_PROJECT_ID
      ) {
        throw new Error(
          `${builder}: cannot downgrade or relabel an authoritative V12 catalog project`,
        );
      }
    }
  }
  if (isRecord(candidate.operations) && Array.isArray(candidate.operations.facilities)) {
    for (const facility of candidate.operations.facilities) {
      const facilityId = isRecord(facility) ? facility.id : undefined;
      if (
        typeof facilityId === "string" &&
        FACILITY_BLUEPRINTS.some((blueprint) =>
          facilityId.startsWith(`${blueprint.facilityIdBase}-`),
        )
      ) {
        throw new Error(
          `${builder}: cannot downgrade or discard an operational V12 placed facility`,
        );
      }
    }
  }
}

// The same guard one version on again (C1-M1a). A frozen builder may cross this
// boundary only when the state's property is still the INITIAL authored property
// — the exact value every ≤V12 file implicitly carried, so projecting it away
// loses nothing and `convertV12ToV13` puts back the identical bytes. A property
// that has grown (wider bounds, a new parcel, a new or removed structure) has no
// home in any historical format and may never be silently dropped to write one.
function assertFrozenBuilderCanProjectV13State(
  state: object,
  builder: string,
): void {
  const candidate = state as Record<string, unknown>;
  if (Array.isArray(candidate.ledger)) {
    for (const raw of candidate.ledger) {
      if (isRecord(raw) && raw.kind === "facilityDemolitionRefund") {
        throw new Error(
          `${builder}: cannot downgrade or discard authoritative V13 facility demolition ledger state`,
        );
      }
    }
  }
  if (Object.prototype.hasOwnProperty.call(candidate, "property")) {
    if (!deepEqual(candidate.property, INITIAL_PROPERTY)) {
      throw new Error(
        `${builder}: cannot downgrade or discard an authoritative V13 property`,
      );
    }
  }
}

// LEG 2 of the V14 historical boundary (C2a-M1) — the WRITE side. The validator
// leg refuses V14 authority ARRIVING under an old tag; this one refuses V14
// authority LEAVING through an old builder.
//
// A frozen builder may cross this boundary only when the state carries no
// authoritative V14 history: no standing or retired set, no counter that has
// handed out an id, no queued intent, no minted blueprint, no recorded event, no
// set capital row, and no workflow that has bound anything. Every one of those is
// a fact with no home in any historical format, and none of them may be silently
// dropped to write one.
//
// The endowment is deliberately NOT an exemption. Two house sets and
// `nextSetId: 2` are real state a V13 file cannot describe — `convertV13ToV14`
// puts them back on the way up, but that is a migration, not a round trip.
function assertFrozenBuilderCanProjectV14State(
  state: object,
  builder: string,
): void {
  const candidate = state as Record<string, unknown>;
  if (Array.isArray(candidate.ledger)) {
    for (const raw of candidate.ledger) {
      if (
        isRecord(raw) &&
        typeof raw.kind === "string" &&
        (V14_ONLY_LEDGER_KINDS as readonly string[]).includes(raw.kind)
      ) {
        throw new Error(
          `${builder}: cannot downgrade or discard authoritative V14 set capital ledger state`,
        );
      }
    }
  }
  // The ENDOWMENT is not authoritative history — it is the exact value every
  // managed studio carries before it has done anything, and `convertV13ToV14`
  // puts back the identical bytes. This is the same exemption V12 grants the
  // vacant managed placement root and V13 grants `INITIAL_PROPERTY`: a state
  // that has built nothing loses nothing by crossing the boundary. A studio that
  // has built, struck, or re-mounted a set has moved off it and is refused.
  if (Object.prototype.hasOwnProperty.call(candidate, "sets")) {
    const isLegacyEmpty =
      deepEqual(candidate.sets, []) && candidate.nextSetId === 0;
    const isUntouchedEndowment =
      deepEqual(candidate.sets, endowedHouseSets()) &&
      candidate.nextSetId === ENDOWED_NEXT_SET_ID;
    if (!isLegacyEmpty && !isUntouchedEndowment) {
      throw new Error(
        `${builder}: cannot downgrade or discard authoritative V14 sets`,
      );
    }
  }
  if (Array.isArray(candidate.productionQueue) && candidate.productionQueue.length > 0) {
    throw new Error(
      `${builder}: cannot downgrade or discard the authoritative V14 production queue`,
    );
  }
  if (isRecord(candidate.originalScreenplays)) {
    const screenplays = candidate.originalScreenplays;
    if (
      (Array.isArray(screenplays.blueprints) && screenplays.blueprints.length > 0) ||
      screenplays.nextOrdinal !== 0
    ) {
      throw new Error(
        `${builder}: cannot downgrade or discard authoritative V14 screenplay provenance`,
      );
    }
  }
  if (isRecord(candidate.studioEvents)) {
    const events = candidate.studioEvents;
    if (
      (Array.isArray(events.rows) && events.rows.length > 0) ||
      events.nextSeq !== 0
    ) {
      throw new Error(
        `${builder}: cannot downgrade or discard authoritative V14 studio history`,
      );
    }
  }
  if (isRecord(candidate.operations) && Array.isArray(candidate.operations.workflows)) {
    for (const workflow of candidate.operations.workflows) {
      if (!isRecord(workflow) || !isRecord(workflow.bindings)) continue;
      const bindings = workflow.bindings;
      if (
        bindings.requiresSetBinding === true ||
        bindings.setId !== null ||
        bindings.lockedNovelty !== null ||
        bindings.lockedUplift !== null
      ) {
        throw new Error(
          `${builder}: cannot downgrade or discard an authoritative V14 set binding`,
        );
      }
      if (isRecord(workflow.blocker) && workflow.blocker.kind === "set-unavailable") {
        throw new Error(
          `${builder}: cannot downgrade or discard an authoritative V14 set-unavailable blocker`,
        );
      }
    }
  }
}

// Build a validated V1 envelope from a legacy GameStateV1 (broadcastCache mirrors
// the state's aired items, per M14). Kept so V1 fixtures/back-compat are typed.
export function makeSaveV1(state: GameStateV1 | GameState): SaveFileV1 {
  assertFrozenBuilderCanProjectV11State(state, "makeSaveV1", 1);
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV1");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV1");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV1");
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
export function makeSaveV2(state: GameStateV2 | GameState): SaveFileV2 {
  assertFrozenBuilderCanProjectV11State(state, "makeSaveV2", 2);
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV2");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV2");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV2");
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
export function makeSaveV3(
  state: HistoricalProjectionSource<GameStateV3>,
): SaveFileV3 {
  assertFrozenBuilderCanProjectV11State(state, "makeSaveV3", 3);
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV3");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV3");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV3");
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
export function makeSaveV4(
  state: HistoricalProjectionSource<GameStateV4>,
): SaveFileV4 {
  assertFrozenBuilderCanProjectV11State(state, "makeSaveV4", 4);
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV4");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV4");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV4");
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
export function makeSaveV5(
  state: HistoricalProjectionSource<GameStateV5>,
): SaveFileV5 {
  assertFrozenBuilderCanProjectV11State(state, "makeSaveV5", 5);
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV5");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV5");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV5");
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
export function makeSaveV6(
  state: HistoricalProjectionSource<GameStateV6>,
): SaveFileV6 {
  assertFrozenBuilderCanProjectV11State(state, "makeSaveV6", 6);
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV6");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV6");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV6");
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
export function makeSaveV7(
  state: HistoricalProjectionSource<GameStateV7>,
): SaveFileV7 {
  assertFrozenBuilderCanProjectV11State(state, "makeSaveV7", 7);
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV7");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV7");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV7");
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

// Build a validated frozen V8 envelope. Positive projection is required because
// structural typing permits every later live root here.
export function makeSaveV8(
  state: HistoricalProjectionSource<GameStateV8>,
): SaveFileV8 {
  assertFrozenBuilderCanProjectV11State(state, "makeSaveV8", 8);
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV8");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV8");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV8");
  const frozenState = projectStateV8(state);
  const save: SaveFileV8 = {
    saveVersion: 8,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV8(save);
}

// Build a validated frozen V9 envelope. Casting state belongs only to V10 and
// must never leak under the historical version number.
export function makeSaveV9(
  state: HistoricalProjectionSource<GameStateV9>,
): SaveFileV9 {
  assertFrozenBuilderCanProjectV11State(state, "makeSaveV9", 9);
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV9");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV9");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV9");
  const frozenState = projectStateV9(state);
  const save: SaveFileV9 = {
    saveVersion: 9,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV9(save);
}

// Build a frozen V10 envelope. Current V11 values may cross this projection only
// while their construction state is empty/vacant and therefore loses no history.
export function makeSaveV10(
  state: HistoricalProjectionSource<GameStateV10>,
): SaveFileV10 {
  assertFrozenBuilderCanProjectV11State(state, "makeSaveV10", 10);
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV10");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV10");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV10");
  const frozenState = projectStateV10(state);
  const save: SaveFileV10 = {
    saveVersion: 10,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV10(save);
}

// Build a frozen V11 envelope. Placement state belongs only to V12; a current
// value may cross this projection only while its placement root is empty and
// therefore loses no history.
export function makeSaveV11(
  state: HistoricalProjectionSourceV11,
): SaveFileV11 {
  assertFrozenBuilderCanProjectV12State(state, "makeSaveV11");
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV11");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV11");
  const frozenState = projectStateV11(state);
  const save: SaveFileV11 = {
    saveVersion: 11,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV11(save);
}

// Build a frozen V12 envelope. The property root belongs only to V13; a current
// value may cross this projection only while its property is still the initial
// authored one and therefore loses no history.
export function makeSaveV12(
  state: HistoricalProjectionSourceV12,
): SaveFileV12 {
  assertFrozenBuilderCanProjectV13State(state, "makeSaveV12");
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV12");
  const frozenState = projectStateV12(state);
  const save: SaveFileV12 = {
    saveVersion: 12,
    seed: frozenState.seed,
    state: frozenState,
    broadcastCache: frozenState.broadcastItems,
  };
  return validateSaveV12(save);
}

// Build the current V13 envelope (C1-M1a). Live state already owns an explicit
// property root, so this boundary never invents migration defaults.
export function makeSaveV13(state: GameStateV13): SaveFileV13 {
  // FROZEN as of C2a-M1: V13 is now a historical format, so writing one is a
  // downgrade and gets the same guard every other frozen builder has.
  assertFrozenBuilderCanProjectV14State(state, "makeSaveV13");
  const currentState = projectStateV13(state);
  const save: SaveFileV13 = {
    saveVersion: 13,
    seed: currentState.seed,
    state: currentState,
    broadcastCache: currentState.broadcastItems,
  };
  return validateSaveV13(save);
}

// Build the current V14 envelope (C2a-M1). Live state already owns explicit sets,
// queue, screenplay, and history roots, so this is a projection with no
// synthesis: nothing is invented on the way out.
export function makeSaveV14(state: GameState): SaveFileV14 {
  const currentState = projectStateV14(state);
  const save: SaveFileV14 = {
    saveVersion: 14,
    seed: currentState.seed,
    state: currentState,
    broadcastCache: currentState.broadcastItems,
  };
  return validateSaveV14(save);
}

// makeSave — the C2a-M1 live boundary. Frozen V13 values must cross
// convertV13ToV14/migrateToV14 explicitly.
export function makeSave(state: GameState): SaveFileV14 {
  return makeSaveV14(state);
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
// Compile-exhaustive by kind: adding a LedgerKind now fails until its engagement
// evidence status is decided explicitly. `production` and `boxOffice` are the
// two false entries because the never-engaged D-1 path can write both. Publicity
// and Annex capex are managed-player-only by their owning action gates.
const LEDGER_KIND_PROVES_ENGAGEMENT = {
  production: false,
  boxOffice: false,
  payroll: true,
  signingBonus: true,
  termination: true,
  freelancerFee: true,
  studioRevenue: true,
  overhead: true,
  publicity: true,
  constructionCapex: true,
  // V12: a placed facility can only exist in a founded, engaged, managed studio,
  // so its weekly operating charge is decisive engagement evidence.
  facilityOpex: true,
  // C1-M3a: demolishing one requires having built one, so the refund is decisive
  // engagement evidence for exactly the same reason its capex row is.
  facilityDemolitionRefund: true,
  // C2a-M1: a set can only exist in a founded, engaged, managed studio — the
  // endowment is minted by `activateStudioOperations` and by nothing else — so
  // every row in the set capital family is decisive engagement evidence for
  // exactly the reason the facility family's rows are.
  setCapex: true,
  setMaintenance: true,
  setDemolitionRefund: true,
} as const satisfies Record<LedgerKind, boolean>;

function ledgerKindProvesEngagement(kind: LedgerKind): boolean {
  return LEDGER_KIND_PROVES_ENGAGEMENT[kind];
}

export function convertV5ToV6(v5: SaveFileV5): SaveFileV6 {
  const validated = validateSaveV5(v5); // defensive: never trust an unvalidated input
  const oldState = validated.state;
  const everEngaged =
    oldState.founding !== null ||
    oldState.contracts.length > 0 ||
    oldState.ledger.some((e) => ledgerKindProvesEngagement(e.kind)) ||
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
  const newState: GameStateV9 = {
    ...oldState,
    // Override any hand-added field on a forged V8 value. Version 8 never owned
    // screenplay state and therefore always migrates to the exact legacy default.
    scriptDevelopment: emptyLegacyScriptDevelopment(),
  };
  return makeSaveV9(newState);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Casting Sessions V1 — deterministic V9 → V10 conversion.
//   Adds exactly the EMPTY legacy casting state. V9 predates authoritative
//   sessions, so migration never infers audition history from projects, talent,
//   productions, contracts, or the freelancer market. Input is deep-cloned,
//   rngState is byte-identical, and the caller's envelope remains untouched.
// ═══════════════════════════════════════════════════════════════════════════════

export function convertV9ToV10(v9: SaveFileV9): SaveFileV10 {
  const validated = validateSaveV9(v9);
  const oldState = clonePlainJson(validated.state);
  const newState: GameStateV10 = {
    ...oldState,
    castingSessions: emptyCastingSessions(),
  };
  return makeSaveV10(newState);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Development & Casting Annex V1 — deterministic V10 → V11 conversion.
//   A frozen V10 file owns no construction history. Legacy operations therefore
//   remain legacy-empty; managed operations receive exactly the vacant authored
//   parcel. No project, debit, facility, date, or reservation is inferred.
// ═══════════════════════════════════════════════════════════════════════════════

export function convertV10ToV11(v10: SaveFileV10): SaveFileV11 {
  const validated = validateSaveV10(v10);
  const oldState = clonePlainJson(validated.state);
  const construction =
    oldState.operations.mode === "managed"
      ? initialManagedStudioConstruction()
      : emptyStudioConstruction();
  const cashLedgerCheckpoint = historicalCashLedgerCheckpoint(
    oldState.studio.cash,
    oldState.ledger,
  );
  const newState: GameStateV11 = {
    ...oldState,
    construction,
    ...(cashLedgerCheckpoint === undefined ? {} : { cashLedgerCheckpoint }),
  };
  return makeSaveV11(newState);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Placement Core V12 — deterministic V11 → V12 conversion.
//   The V11 fixed-parcel Annex lifecycle MOVES onto the parcel map; it is not
//   duplicated and it is not thrown away. A legacy (unmanaged) world receives the
//   empty placement root; a managed world with a vacant parcel receives the empty
//   managed root and its parcel stays free; a managed world with a building or
//   completed Annex becomes exactly ONE placed facility standing on the legacy
//   expansion parcel with the same weeks, the same status, the same facility id,
//   and the same construction-capex correlation — so every reservation and every
//   ledger row it already owns keeps pointing at the same thing. The retired V11
//   project root is emptied and its parcel link cleared. No week, price, debit, or
//   reservation is invented; rngState is byte-identical.
// ═══════════════════════════════════════════════════════════════════════════════

export function convertV11ToV12(v11: SaveFileV11): SaveFileV12 {
  const validated = validateSaveV11(v11);
  const oldState = clonePlainJson(validated.state);
  const project = oldState.construction.projects[0];

  let placement: StudioPlacement;
  let construction: StudioConstruction;
  if (oldState.construction.mode === "legacy") {
    placement = emptyStudioPlacement();
    construction = emptyStudioConstruction();
  } else if (project === undefined) {
    placement = initialManagedStudioPlacement();
    construction = initialManagedStudioConstruction();
  } else {
    // A V11 file's property was the initial authored one (V11 predates the
    // property root entirely), so its legacy parcel is looked up there.
    const parcel = parcelById(INITIAL_PROPERTY, LEGACY_EXPANSION_PARCEL_ID);
    if (parcel === null) {
      throw new Error(
        "convertV11ToV12: the legacy expansion parcel is missing from the authored lot",
      );
    }
    const origin = { gx: parcel.rect.x0, gy: parcel.rect.y0 };
    placement = {
      mode: "managed",
      nextPlacementId: 2,
      facilities: [
        {
          id: 1,
          blueprintId: DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id,
          parcelId: parcel.id,
          origin,
          cells: footprintCells(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT, origin),
          facilityId: project.facilityId,
          projectId: project.id,
          status: project.status === "completed" ? "operational" : "underConstruction",
          placedWeek: project.startedWeek,
          completesWeek: project.dueWeek,
        },
      ],
    };
    construction = initialManagedStudioConstruction();
  }

  const newState: GameStateV12 = {
    ...oldState,
    construction,
    placement,
  };
  return makeSaveV12(newState);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Property State V13 (C1-M1a) — deterministic V12 → V13 conversion.
//   V12 had a property; it just had no way to say so. Its bounds, roads, parcel
//   map, and buildings were module constants that every V12 file was written
//   against, which is why every V12 world in existence stands on exactly one
//   property: the initial authored one. `INITIAL_PROPERTY` IS those constants,
//   so synthesizing it here reconstructs a fact rather than inventing a default —
//   the same posture as V5→V6 reconstructing the engagement fact.
//   Nothing else moves: no cash, no week, no ledger row, no placement, no
//   reservation, and rngState is byte-identical. A migrated world plays on
//   exactly the ground it was already playing on.
// ═══════════════════════════════════════════════════════════════════════════════

export function convertV12ToV13(v12: SaveFileV12): SaveFileV13 {
  const validated = validateSaveV12(v12);
  const oldState = clonePlainJson(validated.state);
  const newState: GameStateV13 = {
    ...oldState,
    // A deep copy, never the frozen constant: a savegame's property is its own
    // mutable state and must not alias the authored source of truth.
    property: clonePropertyState(INITIAL_PROPERTY),
  };
  return makeSaveV13(newState);
}

// ══════════════════════════════════════════════════════════════════════════════
// C2a-M1 — deterministic V13 → V14 conversion (charter §8.3).
//
// EVERY derivation here is a FACT the V13 state already carries, or a compat
// device the charter names. Nothing is guessed:
//
//   bindings.stageFacilityId := the workflow's LIVE soundstage reservation when
//     one is held (rehearsal AND shooting — a rehearsal-phase save has no
//     shootingTask, so reading the task would silently miss half the cases),
//     else null.
//   bindings.lockedNovelty / lockedUplift := null. A migrated picture never bound
//     a set, so there is no snapshot to reconstruct and inventing one would put a
//     number on the film's strength that nothing earned.
//   bindings.heldSinceWeek := the migration week. A recorded migration fact: this
//     is the first week the engine can honestly say it has been watching.
//   bindings.requiresSetBinding := FALSE for every migrated workflow. THE
//     GRANDFATHER: an in-flight production keeps `facility-scenery-shop`
//     byte-for-byte and never acquires a set. A picture halfway through shooting
//     cannot retroactively be told it needed a standing set it was never offered.
//   writerIds := [writerId]. The project has exactly one writer and always did.
//   sets := the TWO endowed house sets for MANAGED-mode saves, empty for legacy;
//     nextSetId := 2 and 0 respectively. Founding capacity is therefore exactly
//     today's, so every sealed spec runs unmodified.
//   productionQueue := empty; originalScreenplays := empty (nextOrdinal 0);
//     studioEvents := empty. A migrated studio's history starts the week it
//     migrates, because inventing rows for events nobody observed would be
//     manufacturing history.
//
// ZERO RNG is consumed and `rngState` is byte-identical: a resumed run replays
// exactly as it would have.
// ══════════════════════════════════════════════════════════════════════════════

export function convertV13ToV14(v13: SaveFileV13): SaveFileV14 {
  const validated = validateSaveV13(v13);
  const oldState = clonePlainJson(validated.state);
  const migrationWeek = oldState.market.tick;
  const managed = oldState.operations.mode === "managed";

  const operations = {
    ...oldState.operations,
    workflows: oldState.operations.workflows.map((workflow) => {
      const stage = workflow.reservations.find(
        (reservation) => reservation.capability === "soundstage",
      );
      return {
        ...workflow,
        bindings: {
          requiresSetBinding: false,
          stageFacilityId: stage === undefined ? null : stage.facilityId,
          setId: null,
          lockedNovelty: null,
          lockedUplift: null,
          heldSinceWeek: migrationWeek,
        },
      };
    }),
  };

  const scriptDevelopment = {
    ...oldState.scriptDevelopment,
    projects: oldState.scriptDevelopment.projects.map((project) => ({
      ...project,
      writerIds: [project.writerId],
    })),
  };

  const newState: GameStateV14 = {
    ...oldState,
    operations,
    scriptDevelopment,
    sets: managed ? endowedHouseSets() : [],
    nextSetId: managed ? ENDOWED_NEXT_SET_ID : 0,
    productionQueue: [],
    originalScreenplays: { nextOrdinal: 0, blueprints: [] },
    studioEvents: emptyStudioEventLog(),
  };
  return makeSaveV14(newState);
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
// live load-to-play entry is migrateToV11.
export function migrateToV4(
  save: SaveFile,
): SaveFileV4 {
  if (save.saveVersion > 4) {
    throw new Error(
      `migrateToV4: cannot downgrade SaveFileV${String(save.saveVersion)} or discard newer authoritative state`,
    );
  }
  if (save.saveVersion === 4) return save;
  if (save.saveVersion === 3) return convertV3ToV4(save);
  if (save.saveVersion === 2) return convertV3ToV4(convertV2ToV3(save));
  if (save.saveVersion === 1) {
    return convertV3ToV4(convertV2ToV3(convertV1ToV2(save)));
  }
  throw new Error("migrateToV4: unreachable save version");
}

// migrateToV5 — bring ANY known pre-V6 save version up to V5. V5 passes through; V1–V4
// migrate deterministically. Idempotent. The V4→V5 step only adds an empty career ledger
// (fame + all talent state preserved exactly). Retained as a historical boundary;
// the live load-to-play entry is migrateToV11.
export function migrateToV5(
  save: SaveFile,
): SaveFileV5 {
  if (save.saveVersion > 5) {
    throw new Error(
      `migrateToV5: cannot downgrade SaveFileV${String(save.saveVersion)} or discard newer authoritative state`,
    );
  }
  if (save.saveVersion === 5) return save;
  return convertV4ToV5(migrateToV4(save));
}

// migrateToV6 — bring ANY known pre-V7 save version up to V6. V6 passes through; V1–V5
// migrate deterministically. Idempotent. The V5→V6 step reconstructs the persisted engagement
// fact (R2) — never-engaged saves get `false` and keep behaving byte-identically.
// Retained as a historical boundary; the live load-to-play entry is migrateToV11.
export function migrateToV6(
  save: SaveFile,
): SaveFileV6 {
  if (save.saveVersion > 6) {
    throw new Error(
      `migrateToV6: cannot downgrade SaveFileV${String(save.saveVersion)} or discard newer authoritative state`,
    );
  }
  if (save.saveVersion === 6) return save;
  return convertV5ToV6(migrateToV5(save));
}

// migrateToV7 — bring any pre-V8 save version up to the frozen V7 shape.
// V7 passes through; V1–V6 migrate deterministically. Idempotent. The V6→V7 step only seeds
// the empty publicity state, so a migrated save behaves exactly as before until the player
// buys a campaign. Retained as a historical boundary; the live load-to-play entry
// is migrateToV9.
export function migrateToV7(
  save: SaveFile,
): SaveFileV7 {
  if (save.saveVersion > 7) {
    throw new Error(
      `migrateToV7: cannot downgrade SaveFileV${String(save.saveVersion)} or discard newer authoritative state`,
    );
  }
  if (save.saveVersion === 7) return save;
  return convertV6ToV7(migrateToV6(save));
}

// migrateToV8 — retained historical PRE-V9 boundary. V8 passes through by identity;
// V1–V7 migrate deterministically. Newer files are rejected loudly: this function
// may never silently discard authoritative screenplay or casting state.
export function migrateToV8(save: SaveFile): SaveFileV8 {
  if (
    save.saveVersion === 9 ||
    save.saveVersion === 10 ||
    save.saveVersion === 11 ||
    save.saveVersion === 12 ||
    save.saveVersion === 13 ||
    save.saveVersion === 14
  ) {
    throw new Error(
      `migrateToV8: cannot downgrade SaveFileV${String(save.saveVersion)} or discard newer authoritative state`,
    );
  }
  if (save.saveVersion === 8) return save;
  return convertV7ToV8(migrateToV7(save));
}

// migrateToV9 — retained historical PRE-V10 boundary. V9 passes through by
// identity; V1–V8 migrate forward. V10 is rejected rather than silently losing
// authoritative casting history.
export function migrateToV9(save: SaveFile): SaveFileV9 {
  if (
    save.saveVersion === 10 ||
    save.saveVersion === 11 ||
    save.saveVersion === 12 ||
    save.saveVersion === 13 ||
    save.saveVersion === 14
  ) {
    throw new Error(
      `migrateToV9: cannot downgrade SaveFileV${String(save.saveVersion)} or discard newer authoritative state`,
    );
  }
  if (save.saveVersion === 9) return save;
  return convertV8ToV9(migrateToV8(save));
}

// migrateToV10 — retained historical PRE-V11 boundary. V10 passes through by
// identity; V1–V9 cross every frozen boundary and receive exactly legacy-empty
// casting state only at the final V9→V10 step. V11 is rejected, never downgraded.
export function migrateToV10(save: SaveFile): SaveFileV10 {
  if (
    save.saveVersion === 11 ||
    save.saveVersion === 12 ||
    save.saveVersion === 13 ||
    save.saveVersion === 14
  ) {
    throw new Error(
      `migrateToV10: cannot downgrade SaveFileV${String(save.saveVersion)} or discard construction, placement, and property state`,
    );
  }
  if (save.saveVersion === 10) return save;
  return convertV9ToV10(migrateToV9(save));
}

// migrateToV11 — retained historical PRE-V12 boundary. V11 passes through by
// identity; V1–V10 cross every frozen boundary and receive only the truthful
// empty or vacant construction default selected by their validated operations
// mode. V12 is rejected, never downgraded: a placed facility, its land, its
// debit, and its operating history have no V11 home.
export function migrateToV11(save: SaveFile): SaveFileV11 {
  if (
    save.saveVersion === 12 ||
    save.saveVersion === 13 ||
    save.saveVersion === 14
  ) {
    throw new Error(
      `migrateToV11: cannot downgrade SaveFileV${String(save.saveVersion)} or discard placement and property state`,
    );
  }
  if (save.saveVersion === 11) return save;
  return convertV10ToV11(migrateToV10(save));
}

// migrateToV12 — retained historical PRE-V13 boundary. V12 passes through by
// identity; V1–V11 cross every frozen boundary, then receive the placement root
// their own validated construction history implies at the final V11→V12 step.
// V13 is rejected, never downgraded: a property that has grown has no V12 home.
export function migrateToV12(save: SaveFile): SaveFileV12 {
  if (save.saveVersion === 13 || save.saveVersion === 14) {
    throw new Error(
      `migrateToV12: cannot downgrade SaveFileV${String(save.saveVersion)} or discard property, set, queue, screenplay, and studio-history state`,
    );
  }
  if (save.saveVersion === 12) return save;
  return convertV11ToV12(migrateToV11(save));
}

// migrateToV13 — live load-to-play migration (C1-M1a). V13 passes through by
// identity; V1–V12 cross every frozen boundary, then receive the initial authored
// property at the final V12→V13 step — which is the property they were already
// implicitly played on.
// migrateToV14 — the LIVE load-to-play migration (C2a-M1). V14 passes through by
// identity; V1–V13 cross every frozen boundary, then receive the four Campaign-2
// roots at the final V13→V14 step — including the two endowed house sets, which
// are the compatibility device that keeps founding capacity exactly what it has
// always been.
export function migrateToV14(save: SaveFile): SaveFileV14 {
  if (save.saveVersion === 14) return save;
  return convertV13ToV14(migrateToV13(save));
}

export function migrateToV13(save: SaveFile): SaveFileV13 {
  if (save.saveVersion === 14) {
    throw new Error(
      "migrateToV13: cannot downgrade SaveFileV14 or discard set, queue, screenplay, and studio-history state",
    );
  }
  if (save.saveVersion === 13) return save;
  return convertV12ToV13(migrateToV12(save));
}
