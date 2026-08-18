// Casting Sessions V1 — strict SaveFileV10 persistence and migration boundary.

import { describe, expect, it } from "vitest";
import {
  generateWorld,
  initialManagedStudioOperations,
} from "../src/core/index.js";
import {
  convertV1ToV2,
  convertV2ToV3,
  convertV3ToV4,
  convertV4ToV5,
  convertV5ToV6,
  convertV6ToV7,
  convertV7ToV8,
  convertV8ToV9,
  convertV9ToV10,
  exportSave,
  importSave,
  makeSaveV9,
  makeSaveV10,
  migrateToV8,
  migrateToV9,
  migrateToV10,
  stableStringify,
  validateSave,
  validateSaveV10,
} from "../src/core/save.js";
import type { SaveFile } from "../src/core/save.js";
import type {
  CastingSession,
  GameState,
  ScriptProject,
  Talent,
} from "../src/core/index.js";
import {
  makeLegacyCorpus,
  makeLegacySaveV1,
} from "./_legacyV1Fixtures.js";

function clone<T>(value: T): T {
  return JSON.parse(stableStringify(value)) as T;
}

function readyProject(
  state: GameState,
  overrides: Partial<ScriptProject> = {},
): ScriptProject {
  const concept = state.concepts[0]!;
  const writer = state.talent.find((person) => person.role === "writer")!;
  return {
    id: "script-0000",
    conceptId: concept.id,
    writerId: writer.id,
    writerIds: [writer.id],
    shape: {
      opening: "slowSetup",
      midpoint: "revelation",
      ending: "bittersweet",
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ["adult"],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [-0.5, 0.5],
        kineticEnergy: [-0.5, 0.5],
      },
    },
    status: "ready",
    rewriteCount: 0,
    commissionedWeek: 0,
    dueWeek: null,
    assessment: { actualStrength: 62, perceivedStrength: 59 },
    reservation: null,
    productionId: null,
    ...overrides,
  };
}

function result(talentId: string, estimate = 50) {
  return {
    talentId,
    estimate,
    low: Math.max(0, estimate - 6),
    high: Math.min(100, estimate + 6),
  };
}

function castingSession(
  state: GameState,
  project: ScriptProject,
  status: CastingSession["status"],
): CastingSession {
  const actors = state.talent.filter((person) => person.role === "actor");
  const [a, b, c] = actors;
  if (a === undefined || b === undefined || c === undefined) {
    throw new Error("fixture requires three primary actors");
  }
  const slate: CastingSession["slate"] = {
    lead: [a.id, b.id],
    antagonist: [a.id, c.id],
    support: [b.id, c.id],
  };
  const results: NonNullable<CastingSession["results"]> = {
    lead: [result(a.id, 50), result(b.id, 64)],
    antagonist: [result(a.id, 58), result(c.id, 42)],
    support: [result(b.id, 73), result(c.id, 31)],
  };
  const auditioning = status === "auditioning";
  return {
    id: "casting-0000",
    projectId: project.id,
    status,
    slate,
    startedWeek: auditioning ? state.market.tick : state.market.tick - 1,
    dueWeek: auditioning ? state.market.tick + 1 : null,
    reservation: auditioning
      ? {
          sessionId: "casting-0000",
          facilityId: "facility-development-casting",
          capability: "development-casting",
          slot: 0,
        }
      : null,
    results: auditioning ? null : results,
  };
}

function managedState(
  seed: string,
  status: CastingSession["status"] = "complete",
): GameState {
  const generated = generateWorld(seed);
  const state =
    status === "auditioning"
      ? generated
      : { ...generated, market: { ...generated.market, tick: generated.market.tick + 1 } };
  const project = readyProject(state);
  return {
    ...state,
    economyEngagedEver: true,
    operations: initialManagedStudioOperations(),
    scriptDevelopment: { mode: "managed", projects: [project] },
    castingSessions: {
      mode: "managed",
      sessions: [castingSession(state, project, status)],
    },
  };
}

describe("Casting Sessions V1 — SaveFileV10", () => {
  it("writes frozen V10 explicitly and round-trips every session lifecycle byte-identically", () => {
    const states = [
      generateWorld("save-v10-legacy"),
      managedState("save-v10-auditioning", "auditioning"),
      managedState("save-v10-review", "review"),
      managedState("save-v10-complete", "complete"),
    ];

    for (const state of states) {
      const save = makeSaveV10(state);
      expect(save.saveVersion).toBe(10);
      expect(validateSave(save)).toBe(save);
      expect(validateSaveV10(save)).toBe(save);
      const json = exportSave(save);
      expect(exportSave(importSave(json))).toBe(json);
    }
  });

  it("positively projects frozen V9, then deep-clones it into legacy-empty V10", () => {
    const live = managedState("save-v10-frozen-v9", "complete") as GameState & {
      futureV11?: unknown;
    };
    live.futureV11 = { mustNotLeak: true };
    const v9 = makeSaveV9(live);
    expect(v9.saveVersion).toBe(9);
    expect("castingSessions" in v9.state).toBe(false);
    expect("futureV11" in v9.state).toBe(false);

    const before = stableStringify(v9);
    const v10 = convertV9ToV10(v9);
    expect(v10.state.castingSessions).toEqual({ mode: "legacy", sessions: [] });
    expect(v10.state.rngState).toBe(v9.state.rngState);
    expect(v10.state).not.toBe(v9.state);
    expect(v10.state.studio).not.toBe(v9.state.studio);
    v10.state.studio.cash += 1;
    expect(stableStringify(v9)).toBe(before);
  });

  it("migrates every V1–V9 envelope to V10, passes V10 by identity, and rejects historical downgrades", () => {
    const v1 = makeLegacySaveV1({
      seed: "save-v10-all-versions",
      talent: makeLegacyCorpus(12, "save-v10"),
    });
    const v2 = convertV1ToV2(v1);
    const v3 = convertV2ToV3(v2);
    const v4 = convertV3ToV4(v3);
    const v5 = convertV4ToV5(v4);
    const v6 = convertV5ToV6(v5);
    const v7 = convertV6ToV7(v6);
    const v8 = convertV7ToV8(v7);
    const v9 = convertV8ToV9(v8);
    const versions: readonly SaveFile[] = [v1, v2, v3, v4, v5, v6, v7, v8, v9];

    for (const source of versions) {
      const before = stableStringify(source);
      const migrated = migrateToV10(source);
      expect(migrated.saveVersion).toBe(10);
      expect(migrated.state.castingSessions).toEqual({ mode: "legacy", sessions: [] });
      expect(migrated.state.rngState).toBe(source.state.rngState);
      expect(stableStringify(source)).toBe(before);
    }

    const current = migrateToV10(v9);
    expect(migrateToV10(current)).toBe(current);
    expect(() => migrateToV9(current)).toThrow(/cannot downgrade SaveFileV10/);
    expect(() => migrateToV8(current)).toThrow(/cannot downgrade SaveFileV10/);
  });

  it("rejects missing, extra, malformed, and non-exact evidence fields", () => {
    const valid = makeSaveV10(managedState("save-v10-strict", "review"));

    const missing = clone(valid) as unknown as Record<string, unknown>;
    delete (missing.state as Record<string, unknown>).castingSessions;
    expect(() => validateSaveV10(missing)).toThrow(/castingSessions/);

    const extra = clone(valid);
    (extra.state.castingSessions.sessions[0] as unknown as Record<string, unknown>).future = true;
    expect(() => validateSaveV10(extra)).toThrow(/unknown field "future"/);

    const shortSlate = clone(valid);
    shortSlate.state.castingSessions.sessions[0]!.slate.lead.pop();
    expect(() => validateSaveV10(shortSlate)).toThrow(/slate\.lead.*exactly two/);

    const fractional = clone(valid);
    fractional.state.castingSessions.sessions[0]!.results!.lead[0].estimate = 50.5;
    expect(() => validateSaveV10(fractional)).toThrow(/estimate.*finite integer/);

    const falseBand = clone(valid);
    falseBand.state.castingSessions.sessions[0]!.results!.lead[0].low += 1;
    expect(() => validateSaveV10(falseBand)).toThrow(/low.*must equal estimate minus 6/);
  });

  it("rejects noncanonical IDs, duplicate project sessions, dangling or non-Actor candidates, and writer slates", () => {
    const valid = makeSaveV10(managedState("save-v10-crossrefs", "review"));

    const noncanonical = clone(valid);
    noncanonical.state.castingSessions.sessions[0]!.id = "casting-0004";
    expect(() => validateSaveV10(noncanonical)).toThrow(/casting-0000/);

    const duplicateProject = clone(valid);
    duplicateProject.state.castingSessions.sessions.push({
      ...clone(duplicateProject.state.castingSessions.sessions[0]!),
      id: "casting-0001",
    });
    expect(() => validateSaveV10(duplicateProject)).toThrow(/duplicate project/);

    const dangling = clone(valid);
    dangling.state.castingSessions.sessions[0]!.slate.lead[0] = "talent-missing";
    expect(() => validateSaveV10(dangling)).toThrow(/unknown talent/);

    const writer = valid.state.talent.find((person) => person.role === "writer")!;
    const nonActor = clone(valid);
    nonActor.state.castingSessions.sessions[0]!.slate.lead[0] = writer.id;
    expect(() => validateSaveV10(nonActor)).toThrow(/primary Actor/);

    const writerActor = clone(valid);
    const project = writerActor.state.scriptDevelopment.projects[0]!;
    const actor = writerActor.state.talent.find((person) => person.role === "actor")!;
    project.writerId = actor.id;
    writerActor.state.castingSessions.sessions[0]!.slate.lead[0] = actor.id;
    expect(() => validateSaveV10(writerActor)).toThrow(/locked writer/);
  });

  it("rejects lifecycle divergence, slate/result disagreement, and script-casting slot collisions", () => {
    const review = makeSaveV10(managedState("save-v10-lifecycle", "review"));

    const sameWeekReview = clone(review);
    sameWeekReview.state.castingSessions.sessions[0]!.startedWeek =
      sameWeekReview.state.market.tick;
    expect(() => validateSaveV10(sameWeekReview)).toThrow(
      /review session.*elapsed at least one week/i,
    );

    const sameWeekComplete = makeSaveV10(
      managedState("save-v10-same-week-complete", "complete"),
    );
    sameWeekComplete.state.castingSessions.sessions[0]!.startedWeek =
      sameWeekComplete.state.market.tick;
    expect(() => validateSaveV10(sameWeekComplete)).toThrow(
      /complete session.*elapsed at least one week/i,
    );

    const badReview = clone(review);
    badReview.state.castingSessions.sessions[0]!.dueWeek = 1;
    expect(() => validateSaveV10(badReview)).toThrow(/Review.*due week|review.*due week/i);

    const wrongResult = clone(review);
    const actors = wrongResult.state.talent.filter((person) => person.role === "actor");
    wrongResult.state.castingSessions.sessions[0]!.results!.lead[0].talentId =
      actors[3]!.id;
    expect(() => validateSaveV10(wrongResult)).toThrow(/result.*slate|slate.*result/i);

    const base = managedState("save-v10-slot-collision", "auditioning");
    const writers = base.talent.filter((person) => person.role === "writer") as Talent[];
    const second = readyProject(base, {
      id: "script-0001",
      conceptId: base.concepts[1]!.id,
      writerId: writers[1]!.id,
      promise: {
        ...base.scriptDevelopment.projects[0]!.promise,
        genre: base.concepts[1]!.genre,
      },
      status: "drafting",
      assessment: null,
      dueWeek: 1,
      reservation: {
        projectId: "script-0001",
        facilityId: "facility-development-casting",
        capability: "development-casting",
        slot: 0,
      },
    });
    const colliding: GameState = {
      ...base,
      contracts: [
        {
          talentId: writers[1]!.id,
          annualSalary: writers[1]!.salary,
          signingBonus: 0,
          startWeek: 0,
          endWeekExclusive: 104,
          termWeeks: 104,
        },
      ],
      scriptDevelopment: {
        mode: "managed",
        projects: [base.scriptDevelopment.projects[0]!, second],
      },
    };
    expect(() => makeSaveV10(colliding)).toThrow(/overbooked.*casting|casting.*overbooked/i);
  });
});
