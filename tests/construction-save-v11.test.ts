// Development & Casting Annex — the strict persistence boundary, on both sides of
// the V12 bump. The frozen SaveFileV11 rules are unchanged and are still proved
// here against genuine V11 envelopes (`asV11Save` expresses a live state's Annex
// in the frozen fixed-parcel shape); the LIVE boundary is now SaveFileV12, whose
// Annex truth lives in the placement root.

import { describe, expect, it } from "vitest";
import { applyActions } from "../src/core/actions.js";
import {
  ANNEX_CAPEX,
  ANNEX_DURATION_WEEKS,
  ANNEX_FACILITY_ID,
  ANNEX_LEDGER_NOTE,
  ANNEX_PARCEL_ID,
  ANNEX_PROJECT_ID,
  emptyStudioConstruction,
  initialManagedStudioConstruction,
} from "../src/core/construction.js";
import { emptyStudioPlacement } from "../src/core/placement.js";
import {
  convertV10ToV11,
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
  makeSave,
  makeSaveV1,
  makeSaveV10,
  migrateToV4,
  migrateToV5,
  migrateToV6,
  migrateToV7,
  migrateToV8,
  migrateToV9,
  migrateToV10,
  makeSaveV11,
  migrateToV11,
  migrateToV13,
  stableStringify,
  validateSave,
  validateSaveV11,
  validateSaveV13,
  type SaveFile,
  type SaveFileV11,
} from "../src/core/save.js";
import { tick } from "../src/core/tick.js";
import type {
  GameState,
  GameStateV10,
  LedgerEntry,
  LedgerEntryV10,
  LedgerKindV10,
} from "../src/core/types.js";
import { generateWorld } from "../src/core/worldgen.js";
import {
  makeLegacyCorpus,
  makeLegacySaveV1,
} from "./_legacyV1Fixtures.js";

function clone<T>(value: T): T {
  return JSON.parse(stableStringify(value)) as T;
}

function managedVacant(seed: string): GameState {
  const engaged: GameState = {
    ...generateWorld(seed),
    economyEngagedEver: true,
  };
  return applyActions(engaged, [{ kind: "activateStudioOperations" }]);
}

function building(seed: string): GameState {
  return applyActions(managedVacant(seed), [
    { kind: "startDevelopmentCastingAnnex" },
  ]);
}

function advance(state: GameState, count: number): GameState {
  let next = state;
  for (let i = 0; i < count; i++) next = tick(next);
  return next;
}

// Express a live V12 state's Annex in the FROZEN V11 fixed-parcel shape, so the
// V11 validator's rules can still be exercised against real lifecycle states.
// Only used at weeks where no facility-operating row exists (the charge begins the
// week AFTER completion), so nothing about the ledger has to be rewritten.
function asV11Save(state: GameState): SaveFileV11 {
  const placed = state.placement.facilities[0];
  const construction =
    placed === undefined
      ? state.construction
      : {
          mode: "managed" as const,
          parcels: [{ id: ANNEX_PARCEL_ID, projectId: ANNEX_PROJECT_ID }],
          projects: [
            {
              id: ANNEX_PROJECT_ID,
              kind: "development-casting-annex" as const,
              parcelId: ANNEX_PARCEL_ID,
              facilityId: ANNEX_FACILITY_ID,
              status:
                placed.status === "operational"
                  ? ("completed" as const)
                  : ("building" as const),
              capex: ANNEX_CAPEX,
              startedWeek: placed.placedWeek,
              dueWeek: placed.completesWeek,
              completedWeek:
                placed.status === "operational" ? placed.completesWeek : null,
            },
          ],
        };
  return makeSaveV11({
    ...state,
    construction,
    placement: emptyStudioPlacement(),
  });
}

function ledgerIdentityCash(ledger: readonly { amount: number }[]): number {
  return ledger.reduce((sum, entry) => sum + entry.amount, 20_000_000);
}

describe("Development & Casting Annex V1 — SaveFileV11", () => {
  it("keeps V11 ledger authority outside the frozen V3–V10 type vocabulary", () => {
    const historicalKind: LedgerKindV10 = "publicity";
    const historicalRow: LedgerEntryV10 = {
      week: 0,
      kind: historicalKind,
      amount: -1,
      note: "historical",
    };
    const capitalRow: LedgerEntry = {
      week: 0,
      kind: "constructionCapex",
      amount: -ANNEX_CAPEX,
      constructionProjectId: "construction-development-casting-annex",
      note: ANNEX_LEDGER_NOTE,
    };

    // @ts-expect-error SaveFileV10's kind vocabulary cannot name V11 capex.
    const invalidHistoricalKind: LedgerKindV10 = "constructionCapex";
    // @ts-expect-error A historical row cannot carry V11's project correlation.
    const invalidHistoricalCorrelation: LedgerEntryV10 = { week: 0, kind: "publicity", amount: -1, constructionProjectId: "construction-development-casting-annex", note: "forged" };
    // @ts-expect-error Live V11 ledger authority cannot be assigned to frozen V10 state.
    const invalidFrozenState: GameStateV10 = building("save-v11-static-boundary");

    expect(historicalRow.kind).toBe("publicity");
    expect(capitalRow.kind).toBe("constructionCapex");
    expect(invalidHistoricalKind).toBe("constructionCapex");
    expect(invalidHistoricalCorrelation.constructionProjectId).toBe(
      "construction-development-casting-annex",
    );
    expect(invalidFrozenState.seed).toBe("save-v11-static-boundary");
  });

  it("writes V12 by default and round-trips legacy, vacant, building, and completed lifecycle states", () => {
    const started = building("save-v11-lifecycles");
    const states = [
      generateWorld("save-v11-legacy"),
      managedVacant("save-v11-vacant"),
      started,
      advance(started, ANNEX_DURATION_WEEKS),
    ];

    for (const state of states) {
      const save = makeSave(state);
      expect(save.saveVersion).toBe(13);
      expect(validateSave(save)).toBe(save);
      expect(validateSaveV13(save)).toBe(save);
      const json = exportSave(save);
      expect(exportSave(importSave(json))).toBe(json);
    }
  });

  it("keeps the Annex absent through twelve advances and persists exact completion on the thirteenth", () => {
    const started = building("save-v11-clock");
    const input = stableStringify(started);
    const week12 = advance(started, 12);
    expect(stableStringify(started)).toBe(input);
    expect(week12.construction.projects).toEqual([]);
    expect(week12.placement.facilities[0]).toMatchObject({
      status: "underConstruction",
      placedWeek: 0,
      completesWeek: 13,
      parcelId: ANNEX_PARCEL_ID,
      facilityId: ANNEX_FACILITY_ID,
      projectId: ANNEX_PROJECT_ID,
    });
    expect(
      week12.operations.facilities.some(
        (facility) => facility.id === ANNEX_FACILITY_ID,
      ),
    ).toBe(false);
    expect(() => makeSave(week12)).not.toThrow();

    const week13 = tick(week12);
    expect(week13.placement.facilities[0]).toMatchObject({
      status: "operational",
      placedWeek: 0,
      completesWeek: 13,
    });
    expect(
      week13.operations.facilities.filter(
        (facility) => facility.id === ANNEX_FACILITY_ID,
      ),
    ).toHaveLength(1);
    expect(() => makeSave(week13)).not.toThrow();
  });

  it("round-trips and continues byte-identically at start, S+12, and S+13", () => {
    const started = building("save-v11-boundary-replay");
    const states = [started, advance(started, 12), advance(started, 13)];

    for (const state of states) {
      const json = exportSave(makeSave(state));
      const imported = migrateToV13(importSave(json)).state;
      expect(exportSave(makeSave(imported))).toBe(json);
      expect(exportSave(makeSave(tick(imported)))).toBe(
        exportSave(makeSave(tick(state))),
      );
    }
  });

  it("converts V10 deterministically from validated operations mode without inventing history", () => {
    const legacyV10 = makeSaveV10(generateWorld("save-v11-migrate-legacy"));
    const managedV10 = makeSaveV10(managedVacant("save-v11-migrate-managed"));

    for (const [source, expected] of [
      [legacyV10, emptyStudioConstruction()],
      [managedV10, initialManagedStudioConstruction()],
    ] as const) {
      const before = stableStringify(source);
      const first = convertV10ToV11(source);
      const second = convertV10ToV11(source);
      expect(first.state.construction).toEqual(expected);
      expect(first.state.rngState).toBe(source.state.rngState);
      expect(first.state).not.toBe(source.state);
      expect(first.state.studio).not.toBe(source.state.studio);
      expect(stableStringify(first)).toBe(stableStringify(second));
      expect(stableStringify(source)).toBe(before);
    }
  });

  it("migrates V1–V10, passes V11 by identity, and rejects every historical downgrade", () => {
    const v1 = makeLegacySaveV1({
      seed: "save-v11-all-versions",
      talent: makeLegacyCorpus(12, "save-v11"),
    });
    const v2 = convertV1ToV2(v1);
    const v3 = convertV2ToV3(v2);
    const v4 = convertV3ToV4(v3);
    const v5 = convertV4ToV5(v4);
    const v6 = convertV5ToV6(v5);
    const v7 = convertV6ToV7(v6);
    const v8 = convertV7ToV8(v7);
    const v9 = convertV8ToV9(v8);
    const v10 = convertV9ToV10(v9);
    const sources: readonly SaveFile[] = [
      v1,
      v2,
      v3,
      v4,
      v5,
      v6,
      v7,
      v8,
      v9,
      v10,
    ];

    for (const source of sources) {
      const before = stableStringify(source);
      const migrated = migrateToV11(source);
      expect(migrated.saveVersion).toBe(11);
      expect(migrated.state.construction).toEqual(emptyStudioConstruction());
      expect(migrated.state.rngState).toBe(source.state.rngState);
      expect(stableStringify(source)).toBe(before);
    }

    const current = migrateToV11(v10);
    expect(migrateToV11(current)).toBe(current);
    for (const downgrade of [
      migrateToV4,
      migrateToV5,
      migrateToV6,
      migrateToV7,
      migrateToV8,
      migrateToV9,
      migrateToV10,
    ]) {
      expect(() => downgrade(current)).toThrow(/cannot downgrade SaveFileV11/);
    }
  });

  it("rejects only V11-owned authority under every historical version tag", () => {
    const v1 = makeLegacySaveV1({
      seed: "save-v11-historical-authority",
      talent: makeLegacyCorpus(12, "save-v11-historical"),
    });
    const v2 = convertV1ToV2(v1);
    const v3 = convertV2ToV3(v2);
    const v4 = convertV3ToV4(v3);
    const v5 = convertV4ToV5(v4);
    const v6 = convertV5ToV6(v5);
    const v7 = convertV6ToV7(v6);

    for (const historical of [v1, v2, v3, v4, v5, v6, v7] as const) {
      const forged = clone(historical) as unknown as {
        state: Record<string, unknown>;
      };
      forged.state.construction = emptyStudioConstruction();
      expect(() => validateSave(forged)).toThrow(
        /state\.construction belongs only to SaveFileV11/,
      );
    }

    const forgedLedger = clone(v7) as unknown as {
      state: { ledger: Array<Record<string, unknown>> };
    };
    forgedLedger.state.ledger.push({
      week: 0,
      kind: "constructionCapex",
      amount: -ANNEX_CAPEX,
      constructionProjectId: "construction-development-casting-annex",
      note: ANNEX_LEDGER_NOTE,
    });
    expect(() => validateSave(forgedLedger)).toThrow(
      /ledger\[0\].*SaveFileV11 construction authority/,
    );

    const forgedFacility = clone(v7) as unknown as {
      state: Record<string, unknown>;
    };
    forgedFacility.state.operations = {
      mode: "managed",
      facilities: [{ id: ANNEX_FACILITY_ID }],
      workflows: [],
    };
    expect(() => validateSave(forgedFacility)).toThrow(
      /contains the SaveFileV11 Annex facility/,
    );
  });

  it("strictly rejects malformed parcel, project, ledger, cash, and facility truth", () => {
    const valid = asV11Save(building("save-v11-strict"));

    const cases: Array<[string, (save: SaveFileV11) => void, RegExp]> = [
      [
        "unknown construction field",
        (save) => {
          (save.state.construction as unknown as Record<string, unknown>).future = true;
        },
        /construction.*unknown field "future"/,
      ],
      [
        "noncanonical parcel",
        (save) => {
          (save.state.construction.parcels[0] as { id: string }).id = "elsewhere";
        },
        /parcel.*id.*must equal/,
      ],
      [
        "wrong duration",
        (save) => {
          save.state.construction.projects[0]!.dueWeek += 1;
        },
        /dueWeek.*startedWeek \+ 13/,
      ],
      [
        "wrong capex",
        (save) => {
          (save.state.construction.projects[0] as { capex: number }).capex =
            ANNEX_CAPEX + 1;
        },
        /capex.*780000/,
      ],
      [
        "missing debit",
        (save) => {
          save.state.ledger = [];
          save.state.studio.cash = ledgerIdentityCash(save.state.ledger);
        },
        /project requires exactly one construction-capex row/,
      ],
      [
        "wrong debit amount",
        (save) => {
          save.state.ledger[0]!.amount = -ANNEX_CAPEX + 1;
          save.state.studio.cash = ledgerIdentityCash(save.state.ledger);
        },
        /construction capex amount must be -780000/,
      ],
      [
        "wrong debit note",
        (save) => {
          save.state.ledger[0]!.note = `${ANNEX_LEDGER_NOTE}!`;
        },
        /note.*must equal/,
      ],
      [
        "missing project correlation",
        (save) => {
          delete save.state.ledger[0]!.constructionProjectId;
        },
        /constructionProjectId.*required/,
      ],
      [
        "capital row with film correlation",
        (save) => {
          save.state.ledger[0]!.productionId = "production-forbidden";
        },
        /constructionCapex cannot carry talentId or productionId/,
      ],
      [
        "cash divergence",
        (save) => {
          save.state.studio.cash += 1;
        },
        /studio cash must equal initial cash plus the ordered ledger/,
      ],
    ];

    for (const [, mutate, expected] of cases) {
      const bad = clone(valid);
      mutate(bad);
      expect(() => validateSaveV11(bad)).toThrow(expected);
    }

    const completed = asV11Save(advance(building("save-v11-facility"), 13));
    const mutated = clone(completed);
    mutated.state.operations.facilities.find(
      (facility) => facility.id === ANNEX_FACILITY_ID,
    )!.capacity = 2;
    expect(() => validateSaveV11(mutated)).toThrow(/Annex V1 facility.*differs/);

    const configured = clone(completed);
    configured.state.operations.facilities.push({
      id: "facility-research-only",
      name: "Research-only facility",
      capability: "development-casting",
      capacity: 1,
    });
    expect(() => validateSaveV11(configured)).toThrow(
      /Annex V1 facility count disagrees/,
    );

    const wrongCorrelation = clone(valid);
    (wrongCorrelation.state.ledger as unknown as Array<Record<string, unknown>>)[0] = {
      ...(wrongCorrelation.state.ledger[0] as unknown as Record<string, unknown>),
      kind: "overhead",
    };
    expect(() => validateSaveV11(wrongCorrelation)).toThrow(
      /constructionProjectId.*forbidden/,
    );
  });

  it.each(["building", "completed"] as const)(
    "rejects every canonical Annex ID in persisted production history while %s",
    (status) => {
      const state =
        status === "building"
          ? building(`save-v11-id-${status}`)
          : advance(building(`save-v11-id-${status}`), ANNEX_DURATION_WEEKS);

      for (const reservedId of [
        ANNEX_PARCEL_ID,
        ANNEX_PROJECT_ID,
        ANNEX_FACILITY_ID,
      ]) {
        const forgedV11 = clone(asV11Save(state));
        forgedV11.state.ledger.push({
          week: forgedV11.state.market.tick,
          kind: "production",
          amount: 0,
          productionId: reservedId,
          note: "forged persisted production identity",
        });
        expect(() => validateSaveV11(forgedV11)).toThrow(
          /canonical Annex id .*collides with persisted production history/,
        );

        // The same law, one version on: the placement authority reserves the
        // parcel, project, and facility identity against the same history.
        const forgedV13 = clone(makeSave(state));
        forgedV13.state.ledger.push({
          week: forgedV13.state.market.tick,
          kind: "production",
          amount: 0,
          productionId: reservedId,
          note: "forged persisted production identity",
        });
        expect(() => validateSaveV13(forgedV13)).toThrow(
          /canonical Annex id .*collides with persisted production history/,
        );
      }
    },
  );

  it("lets frozen builders omit only empty/vacant V11 state and rejects authoritative history", () => {
    const legacy = generateWorld("save-v11-frozen-legacy");
    const vacant = managedVacant("save-v11-frozen-vacant");
    expect("construction" in makeSaveV1(legacy).state).toBe(false);
    expect("construction" in makeSaveV10(vacant).state).toBe(false);

    const started = building("save-v11-frozen-building");
    expect(() => makeSaveV1(started)).toThrow(/cannot downgrade.*construction/i);
    expect(() => makeSaveV10(started)).toThrow(/cannot downgrade.*construction/i);
    const completed = advance(started, ANNEX_DURATION_WEEKS);
    expect(() => makeSaveV10(completed)).toThrow(/cannot downgrade.*construction/i);

    const forgedV10 = makeSaveV10(vacant);
    (forgedV10.state.ledger as unknown as Array<Record<string, unknown>>).push({
      week: 0,
      kind: "constructionCapex",
      amount: -ANNEX_CAPEX,
      constructionProjectId: "construction-development-casting-annex",
      note: ANNEX_LEDGER_NOTE,
    });
    expect(() => makeSaveV10(forgedV10.state)).toThrow(
      /cannot downgrade.*construction ledger/i,
    );
  });

  it("positively projects V12 and rejects unknown future versions", () => {
    const withFuture = {
      ...managedVacant("save-v11-projection"),
      futureV13: { mustNotLeak: true },
    };
    const save = makeSave(withFuture);
    expect("futureV13" in save.state).toBe(false);
    expect(() => validateSave({ ...save, saveVersion: 14 })).toThrow(
      /unknown saveVersion 14.*versions 1 through 13 only/,
    );
  });
});
