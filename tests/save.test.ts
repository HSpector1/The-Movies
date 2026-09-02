// Phase-1 test: §17 save format + rev. 4 M14.
//
// Contract sources:
//  - §17: type SaveFileV1 = { saveVersion: 1; seed; state; broadcastCache };
//    version validation, loud rejection of unknown versions, JSON export/import.
//  - M14: broadcastCache ≡ state.broadcastItems; envelope seed must equal
//    state.seed; load validation rejects any divergence loudly (same failure mode
//    as an unknown saveVersion); §15.7 byte-identity compares the full serialized
//    SaveFileV1.
//  - §15.7: same seed + same actions → byte-identical state and Broadcast copy.
//
// Fixture GameState values are INPUTS chosen here (per §2.5's type) — they are not
// expectations and are not derived from implementation. Seeded RNG only; no
// unseeded randomness is used to build any fixture.

import { describe, it, expect } from "vitest";
import {
  makeSave,
  makeSaveV14,
  makeSaveV15,
  loadSave,
  exportSave,
  importSave,
  generateWorld,
  applyActions,
  validateSave,
  validateSaveV15,
  migrateToV14,
  migrateToV15,
  convertV14ToV15,
  initialReleaseAuthority,
} from "../src/core/index.js";
import type {
  GameState,
  BroadcastItem,
  Talent,
  FilmConcept,
  Segment,
} from "../src/core/index.js";
import type { SaveFileV14, SaveFileV15, SaveFileV16 } from "../src/core/save.js";
import { initialProperty } from "../src/core/lot.js";
import { contendedStudio, freePackage } from "./_m4Fixtures.js";

// ── Minimal valid fixtures (all values are chosen inputs) ────────────────────

const SEED = "save-fixture-seed";

// A real D-9 (multi-discipline) Talent. New games save as V2, whose GameState carries
// the full Talent shape (24 skills, ceilings, dev rates, work ethic, genre experience,
// work history). Rather than hand-transcribe those 24-skill records (fragile, and a
// silent drift risk), source a genuine talent from a generated world and stamp the
// fixture's chosen id/persona/fame/salary onto it. The values remain chosen INPUTS.
const genWriter: Talent = generateWorld("save-fixture-world").talent.find(
  (t) => t.role === "writer",
)!;
const talent: Talent = {
  ...genWriter,
  id: "t1",
  name: "Fixture Writer",
  age: 40,
  actual: { warmth: 0.1, gravity: -0.2, physicality: 0.3 },
  perceived: { warmth: 0.1, gravity: -0.2, physicality: 0.3 },
  fame: 30,
  salary: 100_000,
  authored: false,
};

const concept: FilmConcept = {
  id: "c1",
  title: "Fixture Film",
  genre: "drama",
  baselineStrength: 60,
  originalityRaw: 55,
  baseNegativeCost: 4_500_000,
  requiredSlots: ["lead", "antagonist", "support"],
  roleRequirements: {
    lead: {
      target: { warmth: 0.2, gravity: 0.1, physicality: 0 },
      tolerance: 1.2,
    },
    antagonist: {
      target: { warmth: -0.3, gravity: 0.4, physicality: 0.1 },
      tolerance: 1.2,
    },
    support: {
      target: { warmth: 0.1, gravity: 0, physicality: 0.2 },
      tolerance: 1.2,
    },
  },
};

const segments: Segment[] = [
  {
    id: "youngAdult",
    share: 0.3,
    taste: { intimacy: -0.45, tonalWeight: -0.3, kineticEnergy: 0.75 },
  },
  {
    id: "family",
    share: 0.25,
    taste: { intimacy: 0.55, tonalWeight: -0.55, kineticEnergy: 0.2 },
  },
  {
    id: "adult",
    share: 0.3,
    taste: { intimacy: -0.2, tonalWeight: 0.45, kineticEnergy: -0.15 },
  },
  {
    id: "prestige",
    share: 0.15,
    taste: { intimacy: 0.4, tonalWeight: 0.7, kineticEnergy: -0.4 },
  },
];

const broadcastItem: BroadcastItem = {
  subjectId: "p1",
  topic: "release",
  facts: {
    subjectId: "p1",
    filmId: "p1",
    forecastBand: "mixed",
    realizedBand: "strong",
    primaryCause: "craft",
    direction: "better",
  },
  template: "release-better",
  tick: 8,
};

// Build a fresh, well-formed GameState. `broadcastItems` and `broadcastCache`
// must be equal (M14), so both draw from the same source array.
function makeState(broadcastItems: BroadcastItem[]): GameState {
  return {
    seed: SEED,
    rngState: "123456789,2345678901,3456789012,987654321",
    market: {
      tick: 8,
      forces: {
        escapism: 50,
        patriotism: 50,
        realism: 50,
        darkness: 50,
        optimism: 50,
        spectacle: 50,
      },
      segments,
      baseMarketValue: 40_000_000,
      competingSlate: [],
    },
    era: {
      soundRequired: true,
      televisionCompetition: false,
      censorship: "none",
      costScale: 1.0,
    },
    studio: {
      cash: 20_000_000,
      standing: {
        audienceAwareness: 40,
        industryPrestige: 40,
        commercialConfidence: 50,
      },
      activeProductions: [],
      releasedFilms: [],
    },
    talent: [talent],
    concepts: [concept],
    broadcastItems,
    coverageContexts: [],
    // D-11 employment surface (empty fixture — no studio yet).
    founding: null,
    contracts: [],
    ledger: [],
    freeAgents: [],
    // D-12 economy surface (empty fixture — no theatrical runs yet).
    theatricalRuns: [],
    // D-14 career surface (empty fixture — no released films / career events yet).
    careerEvents: [],
    // D-17A/R2 persisted engagement fact (fixture is a never-engaged studio).
    economyEngagedEver: false,
    // D-17B/E4 publicity cooldown state (fixture has never bought a campaign).
    publicity: {
      lastUsedWeek: null,
      byTier: { whisper: null, push: null, blitz: null },
    },
    // Production Operations V1 live persistence. This never-engaged fixture stays legacy.
    operations: { mode: "legacy", facilities: [], workflows: [] },
    // Script Projects V1 live persistence. This never-engaged fixture stays legacy.
    scriptDevelopment: { mode: "legacy", projects: [] },
    // Casting Sessions V1 live persistence. This never-engaged fixture stays legacy.
    castingSessions: { mode: "legacy", sessions: [] },
    // Annex V1 live persistence. This never-engaged fixture owns no parcel or history.
    construction: { mode: "legacy", parcels: [], projects: [] },
    placement: { mode: "legacy", nextPlacementId: 1, facilities: [] },
    // C1-M1a: every live state carries its property.
    property: initialProperty(),
    // C2a-M1 SaveFileV14: a hand-built world owns no studio operations, so it
    // owns no sets, no queue, no screenplay provenance, and no history.
    sets: [],
    nextSetId: 0,
    productionQueue: [],
    originalScreenplays: { nextOrdinal: 0, blueprints: [] },
    studioEvents: { nextSeq: 0, rows: [] },
    // P06A: every live state carries a release authority root. This fixture
    // never committed a release, so it starts empty.
    releaseAuthority: initialReleaseAuthority(),
  };
}

// A well-formed save: envelope seed === state.seed, broadcastCache === broadcastItems.
// `makeSave` is the P06A live boundary: SaveFileV16. Every V1–V13-style shape
// assertion below is unchanged by the cutover — only the envelope's own version
// tag moved.
function wellFormedSave(): SaveFileV16 {
  const items = [broadcastItem];
  const state = makeState(items);
  return makeSave(state);
}

// The V15 fixture, built directly via `makeSaveV15` rather than through
// `makeSave` — kept distinct so the P04A describe block below still exercises
// the V15 machinery explicitly, independent of what `makeSave` defaults to.
function wellFormedV15Save(): SaveFileV15 {
  const items = [broadcastItem];
  const state = makeState(items);
  return makeSaveV15(state);
}

describe("§17 / §15.7 — export→import→export round-trips byte-identically", () => {
  it("string equality across a full export/import/export cycle", () => {
    const save = wellFormedSave();
    const firstExport = exportSave(save);
    expect(typeof firstExport).toBe("string");

    const reimported = importSave(firstExport);
    const secondExport = exportSave(reimported);

    expect(secondExport).toBe(firstExport);
  });

  it("loadSave accepts a well-formed save without throwing", () => {
    // Source: §17 — a valid SaveFileV1 loads cleanly.
    const save = wellFormedSave();
    expect(() => loadSave(save)).not.toThrow();
  });
});

describe("§17 — loud rejection of an unknown saveVersion", () => {
  it("throws on an unknown saveVersion (e.g. 17)", () => {
    // Source: §17 "loud rejection of unknown versions". Versions 1–15 are known;
    // P06A SaveFileV16 moved the unknown boundary from 15 to 16, so the
    // sentinel this test reaches for one version past the known ceiling moves
    // with it — 16 to 17.
    const save = wellFormedSave();
    const bad = { ...save, saveVersion: 17 } as unknown as SaveFileV14;
    expect(() => loadSave(bad)).toThrow();
  });
});

describe("M14 — loud rejection when envelope seed ≠ state.seed", () => {
  it("throws when the envelope seed diverges from state.seed", () => {
    // Source: M14 "the envelope seed must equal state.seed; load validation
    // rejects any divergence loudly (same failure mode as an unknown saveVersion)."
    const save = wellFormedSave();
    const bad: SaveFileV16 = { ...save, seed: "a-different-seed" };
    expect(() => loadSave(bad)).toThrow();
  });
});

describe("M14 — loud rejection when broadcastCache ≠ state.broadcastItems", () => {
  it("throws when broadcastCache diverges from state.broadcastItems", () => {
    // Source: M14 "broadcastCache ≡ state.broadcastItems ... rejects any
    // divergence loudly." Divergent content in the cache must be caught.
    const save = wellFormedSave();
    const divergentItem: BroadcastItem = {
      ...broadcastItem,
      template: "release-worse",
    };
    const bad: SaveFileV16 = { ...save, broadcastCache: [divergentItem] };
    expect(() => loadSave(bad)).toThrow();
  });

  it("throws when broadcastCache differs from state.broadcastItems by length", () => {
    // Source: M14 — any divergence (including cardinality) is rejected.
    const save = wellFormedSave();
    const bad: SaveFileV16 = { ...save, broadcastCache: [] };
    expect(() => loadSave(bad)).toThrow();
  });
});

// P04A §2.5: `makeSave`/`exportSaveJson` now emit SaveFileV15 — the live
// cutover has landed. SaveFileV15 validates, round-trips, and both
// `convertV14ToV15`/`migrateToV15` migrate a real V14 file forward. These
// tests exercise the V15 machinery directly (via `makeSaveV15`), independent
// of which envelope `makeSave` currently defaults to.
describe("P04A §2.5 — SaveFileV15 identity-bearing queue expiry", () => {
  it("makeSaveV15 emits a valid SaveFileV15 envelope, and it round-trips byte-identically", () => {
    const save = wellFormedV15Save();
    expect(save.saveVersion).toBe(15);
    const firstExport = exportSave(save);
    const reimported = importSave(firstExport);
    expect(reimported.saveVersion).toBe(15);
    expect(exportSave(reimported)).toBe(firstExport);
  });

  it("validateSaveV15 requires subjectId (string or null) on every queueIntentExpired row, and rejects it missing", () => {
    const save = wellFormedV15Save();
    expect(() => validateSaveV15(save)).not.toThrow();

    // A genuine managed studio, driven only through public actions (the same
    // fixtures C2a-M4's own admission suite uses): queue a greenlight, then
    // cancel it, producing one authentic queueIntentExpired row with a real
    // subjectId.
    const { state, readyProjectIds } = contendedStudio("save-v15-shape");
    const projectId = readyProjectIds[0]!;
    const payload = freePackage(state, projectId);
    const queued = applyActions(state, [
      { kind: "greenlightScriptProject", production: payload },
    ]);
    const cancelled = applyActions(queued, [
      { kind: "cancelQueuedIntent", ordinal: queued.productionQueue[0]!.ordinal },
    ]);
    const expiredRow = cancelled.studioEvents.rows.find(
      (row) => row.kind === "queueIntentExpired",
    );
    expect(expiredRow).toMatchObject({ subjectId: projectId });

    const validSave = makeSaveV15(cancelled);
    expect(() => validateSaveV15(validSave)).not.toThrow();

    // Forge the row back to the pre-P04A shape (no subjectId key at all) and
    // confirm V15 refuses it — the leaf is required, never merely tolerated.
    const forgedRows = validSave.state.studioEvents.rows.map((row) => {
      if (row.kind !== "queueIntentExpired") return row;
      const { subjectId: _subjectId, ...rest } = row;
      return rest;
    });
    const forged = {
      ...validSave,
      state: { ...validSave.state, studioEvents: { ...validSave.state.studioEvents, rows: forgedRows } },
    };
    expect(() => validateSaveV15(forged)).toThrow(/subjectId/);
  });

  it("migrates a V14 save forward with subjectId: null on a pre-existing queueIntentExpired row", () => {
    // The same genuine managed-studio scenario, but this time captured as a
    // GENUINE V14 file: a real pre-P04A V14 save never recorded a subject, so
    // the fixture strips the field back off before building the V14 envelope
    // — never guessed, honestly absent — exactly what `makeSaveV14` (the
    // still-live V14 builder) accepts.
    const { state, readyProjectIds } = contendedStudio("save-v15-migration");
    const projectId = readyProjectIds[0]!;
    const payload = freePackage(state, projectId);
    const queued = applyActions(state, [
      { kind: "greenlightScriptProject", production: payload },
    ]);
    const cancelled = applyActions(queued, [
      { kind: "cancelQueuedIntent", ordinal: queued.productionQueue[0]!.ordinal },
    ]);
    const liveRow = cancelled.studioEvents.rows.find(
      (row) => row.kind === "queueIntentExpired",
    );
    expect(liveRow).toMatchObject({ subjectId: projectId });

    const v14Rows = cancelled.studioEvents.rows.map((row) => {
      if (row.kind !== "queueIntentExpired") return row;
      const { subjectId: _subjectId, ...rest } = row;
      return rest;
    });
    const v14State = {
      ...cancelled,
      studioEvents: { ...cancelled.studioEvents, rows: v14Rows },
    };
    const v14Save = makeSaveV14(v14State as unknown as GameState);
    expect(v14Save.saveVersion).toBe(14);

    const migrated = migrateToV15(v14Save);
    expect(migrated.saveVersion).toBe(15);
    expect(
      migrated.state.studioEvents.rows.find((row) => row.kind === "queueIntentExpired"),
    ).toMatchObject({ subjectId: null });

    // convertV14ToV15 directly, same result.
    const converted = convertV14ToV15(v14Save);
    expect(
      converted.state.studioEvents.rows.find((row) => row.kind === "queueIntentExpired"),
    ).toMatchObject({ subjectId: null });
  });

  it("rejects an unknown saveVersion 17 with the updated range, and rejects downgrading V15 to V14", () => {
    const save = wellFormedV15Save();
    expect(() => validateSave({ ...save, saveVersion: 17 })).toThrow(
      /versions 1 through 16 only/,
    );
    expect(() => migrateToV14(save)).toThrow(/cannot downgrade SaveFileV15/);
  });
});
