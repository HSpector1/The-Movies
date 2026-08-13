// Production Operations V1 — SaveFileV8 persistence boundary.
//
// V1–V7 are frozen. V8 adds exactly the authoritative operations surface. A V7
// migration records explicit legacy/empty mode and invents no facilities, workflows,
// reservations, tasks, or blockers. Current-version managed data is validated loudly
// because it controls the production countdown and action legality.

import { describe, expect, it } from "vitest";
import {
  applyActions,
  beginFounding,
  convertV1ToV2,
  convertV2ToV3,
  convertV3ToV4,
  convertV4ToV5,
  convertV5ToV6,
  convertV6ToV7,
  convertV7ToV8,
  emptyLegacyOperations,
  exportSave,
  FOUNDING_MINIMUMS,
  generateWorld,
  importSave,
  initialManagedStudioOperations,
  makeSave,
  makeSaveV1,
  makeSaveV2,
  makeSaveV3,
  makeSaveV4,
  makeSaveV7,
  migrateToV8,
  OracleAgent,
  stableStringify,
  tick,
  validateSave,
  validateSaveV8,
} from "../src/core/index.js";
import type {
  CastSlot,
  CreativeRole,
  GameState,
  GameStateV7,
  SaveFile,
  SaveFileV7,
  SegmentId,
  Talent,
} from "../src/core/index.js";
import {
  makeLegacyCorpus,
  makeLegacySaveV1,
  toLegacyTalent,
} from "./_legacyV1Fixtures.js";

function toV7(state: GameState): GameStateV7 {
  const { operations: _operations, ...v7 } = state;
  return v7;
}

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map((id) =>
    state.talent.find((talent) => talent.id === id)!,
  );
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role);
}

function foundedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed));
  const pool = applicants(state);
  const hires = [
    ...byRole(pool, "actor").slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole(pool, "director").slice(0, FOUNDING_MINIMUMS.director),
    ...byRole(pool, "writer").slice(0, FOUNDING_MINIMUMS.writer),
    ...byRole(pool, "craft").slice(0, FOUNDING_MINIMUMS.craft),
  ];
  for (const hire of hires) {
    state = applyActions(state, [
      { kind: "signContract", talentId: hire.id, termWeeks: 104 },
    ]);
  }
  return applyActions(state, [{ kind: "foundStudio" }]);
}

function productionPayload(state: GameState) {
  const population = state.contracts.map((contract) =>
    state.talent.find((talent) => talent.id === contract.talentId)!,
  );
  const actors = byRole(population, "actor");
  const concept = state.concepts[0]!;
  return {
    conceptId: concept.id,
    shape: {
      opening: "slowSetup",
      midpoint: "revelation",
      ending: "bittersweet",
    } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ["adult"] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    writerId: byRole(population, "writer")[0]!.id,
    directorId: byRole(population, "director")[0]!.id,
    cast: {
      lead: actors[0]!.id,
      antagonist: actors[1]!.id,
      support: actors[2]!.id,
    } satisfies Record<CastSlot, string>,
    craftIds: [byRole(population, "craft")[0]!.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  };
}

function managedShootingState(seed: string): GameState {
  let state = foundedStudio(seed);
  state = applyActions(state, [{ kind: "activateStudioOperations" }]);
  state = applyActions(state, [
    { kind: "greenlight", production: productionPayload(state) },
  ]);
  state = tick(state); // greenlight tick: skip
  state = tick(state); // Development → Pre-production
  state = tick(state); // Pre-production → Rehearsal
  state = tick(state); // Rehearsal → Shooting
  return state;
}

function preOpeningBandSaves() {
  const world = generateWorld("save-v8-pre-opening-band");
  const greenlit = applyActions(world, OracleAgent.chooseActions(world));
  const historical = JSON.parse(stableStringify(greenlit)) as GameState;
  for (const production of historical.studio.activeProductions) {
    for (const segment of production.forecastSnapshot.segments) {
      delete (
        segment as Omit<typeof segment, "opening"> & { opening?: unknown }
      ).opening;
    }
  }
  const {
    founding,
    contracts,
    ledger,
    freeAgents,
    theatricalRuns,
    careerEvents: _careerEvents,
    economyEngagedEver: _economyEngagedEver,
    publicity: _publicity,
    operations: _operations,
    ...v2State
  } = historical;
  const v3State = {
    ...v2State,
    founding,
    contracts,
    ledger,
    freeAgents,
  };
  return [
    makeSaveV1({ ...v2State, talent: historical.talent.map(toLegacyTalent) }),
    makeSaveV2(v2State),
    makeSaveV3(v3State),
    makeSaveV4({ ...v3State, theatricalRuns }),
  ] as const;
}

function recordAt(
  root: unknown,
  path: readonly (string | number)[],
): Record<string, unknown> {
  let current = root;
  for (const key of path) {
    if (current === null || typeof current !== "object") {
      throw new Error(`test fixture path ${path.join(".")} is not an object`);
    }
    current = (current as Record<string, unknown>)[String(key)];
  }
  if (
    current === null ||
    typeof current !== "object" ||
    Array.isArray(current)
  ) {
    throw new Error(`test fixture path ${path.join(".")} is not a record`);
  }
  return current as Record<string, unknown>;
}

describe("Production Operations V1 — the V8 envelope", () => {
  it("makeSave writes V8, validates it, and exports/imports byte-identically", () => {
    const state = generateWorld("save-v8-default");
    expect(state.operations).toEqual(emptyLegacyOperations());
    const save = makeSave(state);
    expect(save.saveVersion).toBe(8);
    expect(validateSave(save)).toBe(save);
    expect(validateSaveV8(save)).toBe(save);
    const json = exportSave(save);
    expect(exportSave(importSave(json))).toBe(json);
  });

  it("moves the loud unknown-version boundary to 9", () => {
    const save = makeSave(generateWorld("save-v8-boundary"));
    expect(() => validateSave({ ...save, saveVersion: 9 })).toThrow(
      /unknown saveVersion 9/,
    );
    expect(() => validateSave({ ...save, saveVersion: 9 })).toThrow(
      /1, 2, 3, 4, 5, 6, 7 and 8 only/,
    );
  });

  it("rejects missing or malformed current-version operations instead of defaulting them", () => {
    const save = makeSave(generateWorld("save-v8-invalid"));
    const noOperations = { ...save, state: { ...save.state } } as Record<
      string,
      unknown
    >;
    delete (noOperations.state as Record<string, unknown>).operations;
    expect(() => validateSaveV8(noOperations)).toThrow(
      /missing required field "operations"/,
    );
    expect(() =>
      validateSaveV8({
        ...save,
        state: {
          ...save.state,
          operations: { mode: "future", facilities: [], workflows: [] },
        },
      }),
    ).toThrow(/mode must be "legacy" or "managed"/);
    expect(() =>
      validateSaveV8({
        ...save,
        state: {
          ...save.state,
          operations: {
            mode: "legacy",
            facilities: [{ id: "invented" }],
            workflows: [],
          },
        },
      }),
    ).toThrow(/legacy operations must have empty facilities and workflows/);
  });

  it("rejects truncated legacy-mode state and array-shaped object impostors", () => {
    const save = makeSave(generateWorld("save-v8-strict-live-state"));
    const truncated = JSON.parse(exportSave(save));
    delete truncated.state.studio;
    expect(() => validateSaveV8(truncated)).toThrow(
      /missing required field "studio"/,
    );

    const arrayEnvelope = Object.assign([], save);
    expect(() => validateSaveV8(arrayEnvelope)).toThrow(
      /save is not a plain object/,
    );

    const arrayState = Object.assign([], save.state);
    expect(() => validateSaveV8({ ...save, state: arrayState })).toThrow(
      /state is not a plain object/,
    );
  });

  it("rejects non-finite runtime numbers and their null JSON equivalent", () => {
    const save = makeSave(generateWorld("save-v8-finite"));
    expect(() =>
      validateSaveV8({
        ...save,
        state: {
          ...save.state,
          studio: { ...save.state.studio, cash: Number.POSITIVE_INFINITY },
        },
      }),
    ).toThrow(/state\.studio\.cash.*finite number/);

    const jsonCorruption = JSON.parse(exportSave(save));
    jsonCorruption.state.market.tick = null;
    expect(() => validateSaveV8(jsonCorruption)).toThrow(
      /state\.market\.tick.*finite number/,
    );
  });
});

describe("Production Operations V1 — frozen V7 to live V8 migration", () => {
  const live = foundedStudio("save-v8-migrate");
  const v7 = makeSaveV7(toV7(live));

  it("adds exactly legacy/empty operations and changes nothing else", () => {
    const out = convertV7ToV8(v7);
    expect(out.saveVersion).toBe(8);
    expect(out.state.operations).toEqual({
      mode: "legacy",
      facilities: [],
      workflows: [],
    });
    const stripped = { ...out.state } as Record<string, unknown>;
    delete stripped.operations;
    expect(stableStringify(stripped)).toBe(stableStringify(v7.state));
  });

  it("is deterministic, non-destructive, replay-safe, and idempotent at V8", () => {
    const before = stableStringify(v7);
    const first = convertV7ToV8(v7);
    const second = convertV7ToV8(v7);
    expect(stableStringify(first)).toBe(stableStringify(second));
    expect(first.state.rngState).toBe(v7.state.rngState);
    expect(stableStringify(v7)).toBe(before);
    expect("operations" in v7.state).toBe(false);
    expect(migrateToV8(first)).toBe(first);
  });

  it("ignores a hand-added operations field on a V7 envelope rather than trusting history V7 never owned", () => {
    const tampered = {
      ...v7,
      state: { ...v7.state, operations: initialManagedStudioOperations() },
    } as unknown as SaveFileV7;
    const out = convertV7ToV8(tampered);
    expect(out.state.operations).toEqual(emptyLegacyOperations());
  });

  it("makeSaveV7 projects a live state onto the frozen shape", () => {
    const managed = applyActions(foundedStudio("save-v7-project"), [
      { kind: "activateStudioOperations" },
    ]);
    // GameState structurally extends GameStateV7, so this is a legal TypeScript call.
    const frozen = makeSaveV7(managed);
    expect("operations" in frozen.state).toBe(false);
    expect(exportSave(frozen)).not.toContain('"operations"');
  });

  it("deep-clones migrated state so mutating V8 cannot mutate the V7 source", () => {
    const source = makeSaveV7(toV7(foundedStudio("save-v8-no-alias")));
    const before = stableStringify(source);
    const migrated = convertV7ToV8(source);
    expect(migrated.state.studio).not.toBe(source.state.studio);
    expect(migrated.state.talent).not.toBe(source.state.talent);
    expect(migrated.state.talent[0]).not.toBe(source.state.talent[0]);
    migrated.state.studio.cash += 1;
    migrated.state.talent[0]!.name = "Mutated only after migration";
    expect(stableStringify(source)).toBe(before);
  });

  it("migrates every frozen version through the existing chain to V8 legacy mode", () => {
    const v1 = makeLegacySaveV1({
      seed: "save-v8-all-versions",
      talent: makeLegacyCorpus(12, "save-v8"),
    });
    const v2 = convertV1ToV2(v1);
    const v3 = convertV2ToV3(v2);
    const v4 = convertV3ToV4(v3);
    const v5 = convertV4ToV5(v4);
    const v6 = convertV5ToV6(v5);
    const frozenV7 = convertV6ToV7(v6);
    const versions: readonly SaveFile[] = [v1, v2, v3, v4, v5, v6, frozenV7];
    for (const source of versions) {
      const out = migrateToV8(source);
      expect(out.saveVersion).toBe(8);
      expect(out.state.operations).toEqual(emptyLegacyOperations());
      expect(out.state.rngState).toBe(source.state.rngState);
    }
  });

  it("backfills the additive opening band in legitimate pre-a104970 V1–V4 active forecasts", () => {
    for (const source of preOpeningBandSaves()) {
      const before = stableStringify(source);
      const lockedBefore =
        source.state.studio.activeProductions[0]!.forecastSnapshot;
      const oldSegment = lockedBefore.segments[0]!;
      expect(Object.prototype.hasOwnProperty.call(oldSegment, "opening")).toBe(
        false,
      );

      const migrated = migrateToV8(source);
      expect(validateSaveV8(migrated)).toBe(migrated);
      const lockedAfter =
        migrated.state.studio.activeProductions[0]!.forecastSnapshot;
      const segment = lockedAfter.segments[0]!;
      expect(segment.opening).toEqual({
        center: oldSegment.center,
        estimate: oldSegment.estimate,
        low: oldSegment.low,
        high: oldSegment.high,
      });
      expect(lockedAfter.expectedOpening).toBe(lockedBefore.expectedOpening);
      expect(lockedAfter.expectedTotal).toBe(lockedBefore.expectedTotal);
      expect(stableStringify(source)).toBe(before);
    }
  });

  it("preserves an already-present saturated opening band byte-for-byte", () => {
    let live = foundedStudio("save-v8-current-opening-band");
    live = applyActions(live, [
      { kind: "greenlight", production: productionPayload(live) },
    ]);
    const production = live.studio.activeProductions[0]!;
    expect(
      production.forecastSnapshot.segments.some(
        (segment) =>
          stableStringify(segment.opening) !==
          stableStringify({
            center: segment.center,
            estimate: segment.estimate,
            low: segment.low,
            high: segment.high,
          }),
      ),
    ).toBe(true);
    const v7 = makeSaveV7(toV7(live));
    const before = stableStringify(
      v7.state.studio.activeProductions[0]!.forecastSnapshot.segments.map(
        (segment) => segment.opening,
      ),
    );
    const migrated = convertV7ToV8(v7);
    expect(
      stableStringify(
        migrated.state.studio.activeProductions[0]!.forecastSnapshot.segments.map(
          (segment) => segment.opening,
        ),
      ),
    ).toBe(before);
  });

  it("preserves an active V7 production countdown and continuation exactly", () => {
    const world = generateWorld("save-v8-active-legacy");
    const greenlit = applyActions(world, OracleAgent.chooseActions(world));
    expect(greenlit.studio.activeProductions).toHaveLength(1);
    const remaining = greenlit.studio.activeProductions[0]!.remainingTicks;
    const migrated = convertV7ToV8(makeSaveV7(toV7(greenlit))).state;
    expect(migrated.studio.activeProductions[0]!.remainingTicks).toBe(
      remaining,
    );
    expect(migrated.operations).toEqual(emptyLegacyOperations());

    let continuous = greenlit;
    let resumed = migrated;
    for (let week = 0; week < 10; week++) {
      continuous = tick(continuous);
      resumed = tick(resumed);
    }
    expect(exportSave(makeSave(resumed))).toBe(
      exportSave(makeSave(continuous)),
    );
  });
});

describe("Production Operations V1 — managed state validation and continuation", () => {
  it("round-trips a blocked shooting task with its real director and reservations", () => {
    let state = managedShootingState("save-v8-managed");
    const production = state.studio.activeProductions[0]!;
    state = applyActions(state, [
      {
        kind: "assignShootingDirector",
        productionId: production.id,
        directorId: production.directorId,
      },
    ]);
    const json = exportSave(makeSave(state));
    const imported = importSave(json);
    if (imported.saveVersion !== 8) throw new Error("expected V8");
    expect(exportSave(imported)).toBe(json);
    expect(imported.state.operations.workflows[0]!.shootingTask?.status).toBe(
      "blocked",
    );
    expect(imported.state.operations.workflows[0]!.blocker?.kind).toBe(
      "scenery-load-in",
    );

    let continuous = state;
    let resumed = imported.state;
    const actions = [
      { kind: "clearSceneryLoadIn", productionId: production.id } as const,
      { kind: "scheduleShootingTake", productionId: production.id } as const,
    ];
    continuous = applyActions(continuous, actions);
    resumed = applyActions(resumed, actions);
    for (let week = 0; week < 5; week++) {
      continuous = tick(continuous);
      resumed = tick(resumed);
    }
    expect(exportSave(makeSave(resumed))).toBe(
      exportSave(makeSave(continuous)),
    );
  });

  it("rejects facility truth drift plus orphaned, missing, and phase-mismatched workflows", () => {
    const state = managedShootingState("save-v8-managed-invalid");
    const save = makeSave(state);
    const changedCapacity = JSON.parse(exportSave(save));
    changedCapacity.state.operations.facilities[0].capacity = 99;
    expect(() => validateSaveV8(changedCapacity)).toThrow(
      /managed facility at index 0 differs/,
    );

    const reorderedFacilities = JSON.parse(exportSave(save));
    reorderedFacilities.state.operations.facilities.reverse();
    expect(() => validateSaveV8(reorderedFacilities)).toThrow(
      /managed facility at index 0 differs/,
    );

    const orphan = JSON.parse(exportSave(save));
    orphan.state.operations.workflows[0].productionId = "orphan-production";
    expect(() => validateSaveV8(orphan)).toThrow(
      /references missing active production/,
    );

    const missing = JSON.parse(exportSave(save));
    missing.state.operations.workflows = [];
    expect(() => validateSaveV8(missing)).toThrow(/exactly one workflow/);

    const wrongPhase = JSON.parse(exportSave(save));
    wrongPhase.state.operations.workflows[0].phase = "postProduction";
    expect(() => validateSaveV8(wrongPhase)).toThrow(
      /disagrees with remainingTicks/,
    );
  });

  it("validates every active production field and authoritative reference", () => {
    const save = makeSave(managedShootingState("save-v8-production-shape"));

    const noStart = JSON.parse(exportSave(save));
    delete noStart.state.studio.activeProductions[0].startTick;
    expect(() => validateSaveV8(noStart)).toThrow(
      /missing required field "startTick"/,
    );

    const noForecast = JSON.parse(exportSave(save));
    delete noForecast.state.studio.activeProductions[0].forecastSnapshot;
    expect(() => validateSaveV8(noForecast)).toThrow(
      /missing required field "forecastSnapshot"/,
    );

    const unknownConcept = JSON.parse(exportSave(save));
    unknownConcept.state.studio.activeProductions[0].conceptId =
      "missing-concept";
    expect(() => validateSaveV8(unknownConcept)).toThrow(
      /conceptId.*unknown concept/,
    );

    const unknownDirector = JSON.parse(exportSave(save));
    unknownDirector.state.studio.activeProductions[0].directorId =
      "missing-director";
    expect(() => validateSaveV8(unknownDirector)).toThrow(
      /directorId.*unknown talent/,
    );

    const nonFiniteBudget = JSON.parse(exportSave(save));
    nonFiniteBudget.state.studio.activeProductions[0].budget.negative = null;
    expect(() => validateSaveV8(nonFiniteBudget)).toThrow(
      /budget\.negative.*finite number/,
    );
  });

  it("rejects overbooked or out-of-range reservations", () => {
    const state = managedShootingState("save-v8-reservation-invalid");
    const save = makeSave(state);

    const overbooked = JSON.parse(exportSave(save));
    overbooked.state.operations.workflows[0].reservations.push({
      ...overbooked.state.operations.workflows[0].reservations[0],
    });
    expect(() => validateSaveV8(overbooked)).toThrow(/reserved more than once/);

    const outsideCapacity = JSON.parse(exportSave(save));
    outsideCapacity.state.operations.workflows[0].reservations[0].slot = 99;
    expect(() => validateSaveV8(outsideCapacity)).toThrow(
      /slot must be an integer/,
    );
  });

  it("rejects wrong director, stage, task identity, and blocker lifecycle", () => {
    const state = managedShootingState("save-v8-task-invalid");
    const save = makeSave(state);

    const wrongDirector = JSON.parse(exportSave(save));
    wrongDirector.state.operations.workflows[0].shootingTask.directorId =
      "not-the-director";
    expect(() => validateSaveV8(wrongDirector)).toThrow(/locked director/);

    const wrongStage = JSON.parse(exportSave(save));
    wrongStage.state.operations.workflows[0].shootingTask.soundstageFacilityId =
      "facility-post-building";
    expect(() => validateSaveV8(wrongStage)).toThrow(/reserved soundstage/);

    const wrongTaskId = JSON.parse(exportSave(save));
    wrongTaskId.state.operations.workflows[0].shootingTask.id =
      "shooting:not-canonical";
    expect(() => validateSaveV8(wrongTaskId)).toThrow(
      /task id is not canonical/,
    );

    const invalidStatus = JSON.parse(exportSave(save));
    invalidStatus.state.operations.workflows[0].shootingTask.status =
      "teleported";
    expect(() => validateSaveV8(invalidStatus)).toThrow(
      /shootingTask\.status is invalid/,
    );

    const missingBlocker = JSON.parse(exportSave(save));
    missingBlocker.state.operations.workflows[0].shootingTask.status =
      "blocked";
    expect(() => validateSaveV8(missingBlocker)).toThrow(
      /requires its scenery-load-in blocker/,
    );

    const staleBlocker = JSON.parse(exportSave(save));
    staleBlocker.state.operations.workflows[0].shootingTask.status = "blocked";
    staleBlocker.state.operations.workflows[0].blocker = {
      kind: "scenery-load-in",
      taskId: "shooting:stale",
    };
    expect(() => validateSaveV8(staleBlocker)).toThrow(
      /must reference its blocked shooting task/,
    );
  });

  it("rejects unknown fields at every V8 operations record level", () => {
    let state = managedShootingState("save-v8-operations-exact-keys");
    const production = state.studio.activeProductions[0]!;
    state = applyActions(state, [
      {
        kind: "assignShootingDirector",
        productionId: production.id,
        directorId: production.directorId,
      },
    ]);
    const json = exportSave(makeSave(state));
    const paths: readonly (readonly (string | number)[])[] = [
      ["state", "operations"],
      ["state", "operations", "facilities", 0],
      ["state", "operations", "workflows", 0],
      ["state", "operations", "workflows", 0, "reservations", 0],
      ["state", "operations", "workflows", 0, "shootingTask"],
      ["state", "operations", "workflows", 0, "blocker"],
    ];
    for (const path of paths) {
      const corrupted = JSON.parse(json);
      recordAt(corrupted, path).futureField = "must require SaveFileV9";
      expect(() => validateSaveV8(corrupted)).toThrow(
        /unknown field "futureField"/,
      );
    }
  });
});
