// Script Projects V1 — strict SaveFileV9 persistence and migration boundary.

import { describe, expect, it } from "vitest";
import {
  emptyWorkflowBindings,
  addManagedProductionWorkflow,
  applyActions,
  convertV1ToV2,
  convertV2ToV3,
  convertV3ToV4,
  convertV4ToV5,
  convertV5ToV6,
  convertV6ToV7,
  convertV7ToV8,
  convertV8ToV9,
  emptyLegacyScriptDevelopment,
  exportSave,
  generateWorld,
  importSave,
  initialManagedStudioConstruction,
  initialManagedStudioPlacement,
  initialManagedStudioOperations,
  makeSaveV9,
  makeSaveV8,
  migrateToV8,
  migrateToV9,
  OracleAgent,
  stableStringify,
  tick,
  validateSave,
  validateSaveV9,
} from "../src/core/index.js";
import type {
  FilmParticipant,
  GameState,
  Production,
  ScriptProject,
  SaveFile,
  Talent,
} from "../src/core/index.js";
import {
  makeLegacyCorpus,
  makeLegacySaveV1,
} from "./_legacyV1Fixtures.js";

function scriptProject(
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
    status: "review",
    rewriteCount: 0,
    commissionedWeek: 0,
    dueWeek: null,
    assessment: { actualStrength: 61.25, perceivedStrength: 57.75 },
    reservation: null,
    productionId: null,
    ...overrides,
  };
}

function managedState(seed: string, project?: ScriptProject): GameState {
  const state = generateWorld(seed);
  return {
    ...state,
    economyEngagedEver: true,
    operations: initialManagedStudioOperations(),
    construction: initialManagedStudioConstruction(),
    placement: initialManagedStudioPlacement(),
    scriptDevelopment: {
      mode: "managed",
      projects: project === undefined ? [] : [project],
    },
  };
}

function contractedWriterState(seed: string): GameState {
  const state = managedState(seed);
  const writer = state.talent.find((person) => person.role === "writer")!;
  return {
    ...state,
    contracts: [
      {
        talentId: writer.id,
        annualSalary: writer.salary,
        signingBonus: 0,
        startWeek: 0,
        endWeekExclusive: 104,
        termWeeks: 104,
      },
    ],
    scriptDevelopment: {
      mode: "managed",
      projects: [
        scriptProject(state, {
          writerId: writer.id,
          status: "drafting",
          rewriteCount: 0,
          dueWeek: 1,
          assessment: null,
          reservation: {
            projectId: "script-0000",
            facilityId: "facility-development-casting",
            capability: "development-casting",
            slot: 0,
          },
        }),
      ],
    },
  };
}

function clone<T>(value: T): T {
  return JSON.parse(stableStringify(value)) as T;
}

function participantSnapshot(
  state: GameState,
  talentId: string,
  role: FilmParticipant["role"],
  discipline: FilmParticipant["discipline"],
): FilmParticipant {
  return {
    talentId,
    name: state.talent.find((person) => person.id === talentId)!.name,
    role,
    discipline,
    greenlightOVR: 50,
    greenlightFit: 50,
    greenlightEP: { low: 40, high: 60, expected: 50 },
    freelancer: false,
  };
}

function withParticipantSnapshot(
  state: GameState,
  production: Production,
): Production {
  return {
    ...production,
    participants: {
      writer: participantSnapshot(state, production.writerId, "writer", "writing"),
      director: participantSnapshot(state, production.directorId, "director", "directing"),
      cast: {
        lead: participantSnapshot(state, production.cast.lead, "lead", "acting"),
        antagonist: participantSnapshot(
          state,
          production.cast.antagonist,
          "antagonist",
          "acting",
        ),
        support: participantSnapshot(state, production.cast.support, "support", "acting"),
      },
      craft: production.craftIds.map((talentId) =>
        participantSnapshot(state, talentId, "craft", "craft"),
      ),
    },
  };
}

function activeProductionState(seed: string): GameState {
  let state = generateWorld(seed);
  state = applyActions(state, OracleAgent.chooseActions(state));
  const production = withParticipantSnapshot(
    state,
    state.studio.activeProductions[0]!,
  );
  const operations = addManagedProductionWorkflow(
    initialManagedStudioOperations(),
    production,
  );
  return {
    ...state,
    economyEngagedEver: true,
    studio: {
      ...state.studio,
      activeProductions: state.studio.activeProductions.map((candidate) =>
        candidate.id === production.id ? production : candidate,
      ),
    },
    operations,
    construction: initialManagedStudioConstruction(),
    placement: initialManagedStudioPlacement(),
    scriptDevelopment: {
      mode: "managed",
      projects: [
        scriptProject(state, {
          conceptId: production.conceptId,
          writerId: production.writerId,
          shape: clone(production.shape),
          promise: clone(production.promise),
          status: "inProduction",
          productionId: production.id,
        }),
      ],
    },
  };
}

function producedState(seed: string): GameState {
  let state = generateWorld(seed);
  state = applyActions(state, OracleAgent.chooseActions(state));
  const production = clone(state.studio.activeProductions[0]!);
  for (let i = 0; i < 12 && state.studio.activeProductions.length > 0; i++) {
    state = tick(state);
  }
  expect(state.studio.activeProductions).toHaveLength(0);
  expect(state.studio.releasedFilms.some((film) => film.productionId === production.id)).toBe(true);
  const participant = (
    talentId: string,
    role: "writer" | "director" | "lead" | "antagonist" | "support" | "craft",
    discipline: "writing" | "directing" | "acting" | "craft",
  ) => ({
    talentId,
    name: state.talent.find((person) => person.id === talentId)!.name,
    role,
    discipline,
    greenlightOVR: 50,
    greenlightFit: 50,
    greenlightEP: { low: 40, high: 60, expected: 50 },
    freelancer: false,
  });
  state = {
    ...state,
    studio: {
      ...state.studio,
      releasedFilms: state.studio.releasedFilms.map((film) =>
        film.productionId === production.id
          ? {
              ...film,
              participants: {
                writer: participant(production.writerId, "writer", "writing"),
                director: participant(production.directorId, "director", "directing"),
                cast: {
                  lead: participant(production.cast.lead, "lead", "acting"),
                  antagonist: participant(
                    production.cast.antagonist,
                    "antagonist",
                    "acting",
                  ),
                  support: participant(production.cast.support, "support", "acting"),
                },
                craft: production.craftIds.map((talentId) =>
                  participant(talentId, "craft", "craft"),
                ),
              },
            }
          : film,
      ),
    },
  };
  return {
    ...state,
    economyEngagedEver: true,
    operations: initialManagedStudioOperations(),
    construction: initialManagedStudioConstruction(),
    placement: initialManagedStudioPlacement(),
    scriptDevelopment: {
      mode: "managed",
      projects: [
        scriptProject(state, {
          conceptId: production.conceptId,
          writerId: production.writerId,
          shape: production.shape,
          promise: production.promise,
          status: "produced",
          productionId: production.id,
        }),
      ],
    },
  };
}

describe("Script Projects V1 — SaveFileV9", () => {
  it("makes V9 by default and round-trips legacy and every managed lifecycle class byte-identically", () => {
    const drafting = contractedWriterState("save-v9-drafting");
    const reviewBase = managedState("save-v9-review");
    const review = managedState(
      "save-v9-review",
      scriptProject(reviewBase),
    );
    const rewritingBase = contractedWriterState("save-v9-rewriting");
    const rewriting: GameState = {
      ...rewritingBase,
      scriptDevelopment: {
        mode: "managed",
        projects: [
          {
            ...rewritingBase.scriptDevelopment.projects[0]!,
            status: "rewriting",
            rewriteCount: 1,
            assessment: { actualStrength: 63, perceivedStrength: 59 },
          },
        ],
      },
    };
    const readyBase = managedState("save-v9-ready");
    const ready = managedState(
      "save-v9-ready",
      scriptProject(readyBase, { status: "ready" }),
    );
    const states = [
      generateWorld("save-v9-legacy"),
      drafting,
      review,
      rewriting,
      ready,
      activeProductionState("save-v9-in-production"),
      producedState("save-v9-produced"),
    ];

    for (const state of states) {
      const save = makeSaveV9(state);
      expect(save.saveVersion).toBe(9);
      expect(validateSave(save)).toBe(save);
      expect(validateSaveV9(save)).toBe(save);
      const json = exportSave(save);
      expect(exportSave(importSave(json))).toBe(json);
    }

    const longRewrite = makeSaveV9(rewriting);
    longRewrite.state.scriptDevelopment.projects[0]!.dueWeek =
      longRewrite.state.market.tick + 4;
    expect(() => validateSaveV9(longRewrite)).toThrow(/rewriting project.*invalid due week/);
  });

  it("freezes V8 by stripping screenplay state, then migrates a deep-cloned legacy-empty V9", () => {
    const base = managedState("save-v9-project-v8");
    const live = managedState(
      "save-v9-project-v8",
      scriptProject(base, { status: "ready" }),
    );
    const v8 = makeSaveV8(live);
    expect(v8.saveVersion).toBe(8);
    expect("scriptDevelopment" in v8.state).toBe(false);
    expect(exportSave(v8)).not.toContain('"scriptDevelopment"');

    const before = stableStringify(v8);
    const v9 = convertV8ToV9(v8);
    expect(v9.state.scriptDevelopment).toEqual(emptyLegacyScriptDevelopment());
    expect(v9.state.rngState).toBe(v8.state.rngState);
    expect(v9.state).not.toBe(v8.state);
    expect(v9.state.studio).not.toBe(v8.state.studio);
    v9.state.studio.cash += 1;
    expect(stableStringify(v8)).toBe(before);
  });

  it("migrates every V1–V8 envelope to V9 and passes V9 by identity", () => {
    const v1 = makeLegacySaveV1({
      seed: "save-v9-all-versions",
      talent: makeLegacyCorpus(12, "save-v9"),
    });
    const v2 = convertV1ToV2(v1);
    const v3 = convertV2ToV3(v2);
    const v4 = convertV3ToV4(v3);
    const v5 = convertV4ToV5(v4);
    const v6 = convertV5ToV6(v5);
    const v7 = convertV6ToV7(v6);
    const v8 = convertV7ToV8(v7);
    const versions: readonly SaveFile[] = [v1, v2, v3, v4, v5, v6, v7, v8];
    for (const source of versions) {
      const before = stableStringify(source);
      const migrated = migrateToV9(source);
      expect(migrated.saveVersion).toBe(9);
      expect(migrated.state.scriptDevelopment).toEqual({ mode: "legacy", projects: [] });
      expect(migrated.state.rngState).toBe(source.state.rngState);
      expect(stableStringify(source)).toBe(before);
    }
    const current = makeSaveV9(generateWorld("save-v9-identity"));
    expect(migrateToV9(current)).toBe(current);
  });

  it("rejects unknown version 15 and refuses to downgrade V9 through migrateToV8", () => {
    const save = makeSaveV9(generateWorld("save-v9-boundary"));
    expect(() => validateSave({ ...save, saveVersion: 15 })).toThrow(
      /unknown saveVersion 15/,
    );
    expect(() => validateSave({ ...save, saveVersion: 15 })).toThrow(
      /versions 1 through 14 only/,
    );
    expect(() => migrateToV8(save)).toThrow(/cannot downgrade SaveFileV9/);
  });

  it("rejects missing/extra screenplay fields, malformed lifecycle values, and non-finite assessments", () => {
    const base = managedState("save-v9-strict");
    const save = makeSaveV9(managedState("save-v9-strict", scriptProject(base)));

    const missing = clone(save) as unknown as Record<string, unknown>;
    const missingState = missing.state as Record<string, unknown>;
    delete missingState.scriptDevelopment;
    expect(() => validateSaveV9(missing)).toThrow(/scriptDevelopment/);

    const extra = clone(save);
    (extra.state.scriptDevelopment.projects[0] as unknown as Record<string, unknown>).future = true;
    expect(() => validateSaveV9(extra)).toThrow(/unknown field "future"/);

    const badStatus = clone(save);
    (badStatus.state.scriptDevelopment.projects[0] as unknown as Record<string, unknown>).status = "polishing";
    expect(() => validateSaveV9(badStatus)).toThrow(/status is invalid/);

    const badScore = clone(save);
    badScore.state.scriptDevelopment.projects[0]!.assessment!.actualStrength = Number.NaN;
    expect(() => validateSaveV9(badScore)).toThrow(/actualStrength.*finite number/);

    const future = clone(save);
    future.state.scriptDevelopment.projects[0]!.commissionedWeek = 1;
    expect(() => validateSaveV9(future)).toThrow(/future commission week/);
  });

  it("rejects noncanonical order, duplicate concepts, dangling references, and lifecycle correlations", () => {
    const base = managedState("save-v9-crossrefs");
    const first = scriptProject(base);
    const second = scriptProject(base, {
      id: "script-0001",
      conceptId: base.concepts[1]!.id,
      writerId: base.talent.filter((person) => person.role === "writer")[1]!.id,
      promise: {
        ...first.promise,
        genre: base.concepts[1]!.genre,
      },
    });
    const valid = makeSaveV9({
      ...base,
      scriptDevelopment: { mode: "managed", projects: [first, second] },
    });

    const wrongOrder = clone(valid);
    wrongOrder.state.scriptDevelopment.projects.reverse();
    expect(() => validateSaveV9(wrongOrder)).toThrow(/project at index 0 must be script-0000/);

    const duplicateConcept = clone(valid);
    duplicateConcept.state.scriptDevelopment.projects[1]!.conceptId = first.conceptId;
    duplicateConcept.state.scriptDevelopment.projects[1]!.promise.genre = first.promise.genre;
    expect(() => validateSaveV9(duplicateConcept)).toThrow(/duplicate concept link/);

    const danglingWriter = clone(valid);
    danglingWriter.state.scriptDevelopment.projects[0]!.writerId = "talent-missing";
    expect(() => validateSaveV9(danglingWriter)).toThrow(/unknown writer/);

    const badDraft = clone(valid);
    Object.assign(badDraft.state.scriptDevelopment.projects[0]!, {
      status: "drafting",
      assessment: null,
      dueWeek: 1,
      reservation: null,
    });
    expect(() => validateSaveV9(badDraft)).toThrow(/active project.*has no reservation/);

    const danglingProduction = clone(valid);
    Object.assign(danglingProduction.state.scriptDevelopment.projects[0]!, {
      status: "inProduction",
      productionId: "prod-missing",
    });
    expect(() => validateSaveV9(danglingProduction)).toThrow(/does not link an active production/);
  });

  it("rejects a managed production without its matching writer snapshot and stays saveable through release", () => {
    const valid = activeProductionState("save-v9-production-participant");

    const missingSnapshot = clone(valid);
    delete missingSnapshot.studio.activeProductions[0]!.participants;
    expect(() => makeSaveV9(missingSnapshot)).toThrow(/production participant snapshot/);

    const wrongWriter = clone(valid);
    wrongWriter.studio.activeProductions[0]!.participants!.writer.talentId =
      wrongWriter.talent.find(
        (person) =>
          person.id !== wrongWriter.scriptDevelopment.projects[0]!.writerId,
      )!.id;
    expect(() => makeSaveV9(wrongWriter)).toThrow(/production participant snapshot/);

    const releaseReady = clone(valid);
    releaseReady.market.tick = 1;
    releaseReady.studio.activeProductions[0]!.remainingTicks = 1;
    releaseReady.operations.workflows[0] = {
      productionId: releaseReady.studio.activeProductions[0]!.id,
      phase: "releaseReady",
      reservations: [],
      shootingTask: null,
      blocker: null,
      bindings: emptyWorkflowBindings(),
    };
    const released = tick(releaseReady);
    expect(released.scriptDevelopment.projects[0]!.status).toBe("produced");
    expect(() => makeSaveV9(released)).not.toThrow();
  });

  it("rejects shared Development & Casting slot collisions across scripts and productions", () => {
    const base = managedState("save-v9-slot-collision");
    const writers = base.talent.filter((person) => person.role === "writer") as Talent[];
    const contracts = writers.slice(0, 2).map((writer) => ({
      talentId: writer.id,
      annualSalary: writer.salary,
      signingBonus: 0,
      startWeek: 0,
      endWeekExclusive: 104,
      termWeeks: 104,
    }));
    const first = scriptProject(base, {
      status: "drafting",
      assessment: null,
      dueWeek: 1,
      reservation: {
        projectId: "script-0000",
        facilityId: "facility-development-casting",
        capability: "development-casting",
        slot: 0,
      },
    });
    const second = scriptProject(base, {
      id: "script-0001",
      conceptId: base.concepts[1]!.id,
      writerId: writers[1]!.id,
      promise: { ...first.promise, genre: base.concepts[1]!.genre },
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
    const corrupt = {
      ...base,
      contracts,
      scriptDevelopment: { mode: "managed" as const, projects: [first, second] },
    };
    expect(() => makeSaveV9(corrupt)).toThrow(/overbooked across scripts\/productions/);

    const withProduction = activeProductionState("save-v9-production-slot-collision");
    const production = withProduction.studio.activeProductions[0]!;
    const productionTalent = new Set([
      production.writerId,
      production.directorId,
      production.cast.lead,
      production.cast.antagonist,
      production.cast.support,
      ...production.craftIds,
    ]);
    const spareWriter = withProduction.talent.find(
      (person) => person.role === "writer" && !productionTalent.has(person.id),
    )!;
    const concept = withProduction.concepts.find(
      (candidate) =>
        candidate.id !== withProduction.scriptDevelopment.projects[0]!.conceptId,
    )!;
    const collidingProject = scriptProject(withProduction, {
      id: "script-0001",
      conceptId: concept.id,
      writerId: spareWriter.id,
      promise: { ...first.promise, genre: concept.genre },
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
    expect(() =>
      makeSaveV9({
        ...withProduction,
        contracts: [
          {
            talentId: spareWriter.id,
            annualSalary: spareWriter.salary,
            signingBonus: 0,
            startWeek: 0,
            endWeekExclusive: 104,
            termWeeks: 104,
          },
        ],
        scriptDevelopment: {
          mode: "managed",
          projects: [
            withProduction.scriptDevelopment.projects[0]!,
            collidingProject,
          ],
        },
      }),
    ).toThrow(/overbooked across scripts\/productions/);
  });
});
