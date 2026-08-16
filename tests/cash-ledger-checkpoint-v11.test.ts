// SaveFileV11 historical cash/ledger checkpoint regressions.
//
// V1/V2 persisted real studio cash before the employment ledger existed. The
// V2 -> V3 migration therefore cannot reconstruct the transactions that led to
// that balance. V11 records the validated historical boundary without inventing
// a ledger row, then reconciles every later cash movement from that checkpoint.

import { describe, expect, it } from "vitest";
import { emptyStudioPlacement } from "../src/core/placement.js";
import { applyActions } from "../src/core/actions.js";
import { OracleAgent } from "../src/core/agents.js";
import { financeTotals } from "../src/core/economyView.js";
import {
  beginFounding,
  FOUNDING_MINIMUMS,
} from "../src/core/employment.js";
import {
  ANNEX_CAPEX,
  ANNEX_DURATION_WEEKS,
  ANNEX_FACILITY_ID,
} from "../src/core/construction.js";
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
  makeSave,
  makeSaveV1,
  makeSaveV2,
  makeSaveV3,
  makeSaveV4,
  makeSaveV5,
  makeSaveV6,
  makeSaveV7,
  makeSaveV8,
  makeSaveV9,
  makeSaveV10,
  migrateToV11,
  migrateToV12,
  stableStringify,
  validateSaveV1,
  validateSaveV2,
  validateSaveV10,
  validateSaveV11,
  validateSaveV12,
  type SaveFile,
  type SaveFileV10,
  type SaveFileV11,
} from "../src/core/save.js";
import { tick } from "../src/core/tick.js";
import { studioRunRecap } from "../src/core/studioRunRecap.js";
import type { CreativeRole, GameState } from "../src/core/types.js";
import { generateWorld } from "../src/core/worldgen.js";
import {
  makeLegacyCorpus,
  makeLegacyStateV1,
} from "./_legacyV1Fixtures.js";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function advance(state: GameState, weeks: number): GameState {
  let current = state;
  for (let week = 0; week < weeks; week++) current = tick(current);
  return current;
}

function historicalLedger(save: SaveFile): readonly unknown[] {
  return "ledger" in save.state ? save.state.ledger : [];
}

function playedV2(seed: string): SaveFile {
  const world = generateWorld(seed);
  const choices = OracleAgent.chooseActions(world);
  expect(choices).toHaveLength(1);
  expect(choices[0]!.kind).toBe("greenlight");
  const played = applyActions(world, choices);
  expect(played.studio.cash).toBeLessThan(world.studio.cash);
  expect(played.studio.activeProductions).toHaveLength(1);
  expect(played.ledger).toHaveLength(1);

  const save = makeSaveV2(played);
  expect(validateSaveV2(save)).toBe(save);
  expect("ledger" in save.state).toBe(false);
  return save;
}

function checkpointedLegacyV11(seed: string): SaveFileV11 {
  const legacy = makeLegacyStateV1({
    seed,
    talent: makeLegacyCorpus(12, `${seed}-talent`),
  });
  legacy.studio.cash = 17_654_321;
  const v1 = makeSaveV1(legacy);
  expect(validateSaveV1(v1)).toBe(v1);
  const migrated = migrateToV11(v1);
  expect(migrated.state.cashLedgerCheckpoint).toEqual({
    cash: 17_654_321,
    ledgerLength: 0,
  });
  return migrated;
}

function managedMismatchedV10(seed: string): SaveFileV10 {
  const engaged: GameState = {
    ...generateWorld(seed),
    economyEngagedEver: true,
  };
  const managed = applyActions(engaged, [
    { kind: "activateStudioOperations" },
  ]);
  const historical = makeSaveV10(managed);
  historical.state.studio.cash = 18_250_000;
  expect(historical.state.ledger).toEqual([]);
  expect(validateSaveV10(historical)).toBe(historical);
  return historical;
}

function foundedManagedMismatchedV10(seed: string): SaveFileV10 {
  let state = beginFounding(generateWorld(seed));
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((talent) => talent.id === id)!,
  );
  const roles: readonly CreativeRole[] = ["actor", "director", "writer", "craft"];
  for (const role of roles) {
    for (const talent of applicants.filter((person) => person.role === role).slice(0, FOUNDING_MINIMUMS[role])) {
      state = applyActions(state, [
        { kind: "signContract", talentId: talent.id, termWeeks: 104 },
      ]);
    }
  }
  state = applyActions(state, [{ kind: "foundStudio" }]);
  state = applyActions(state, [{ kind: "activateStudioOperations" }]);
  const historical = makeSaveV10(state);
  historical.state.studio.cash -= 1_234.5;
  expect(validateSaveV10(historical)).toBe(historical);
  return historical;
}

describe("SaveFileV11 cash/ledger checkpoint — historical migration", () => {
  it("migrates an authentic played V2 without fabricating the missing production ledger row", () => {
    const source = playedV2("checkpoint-played-v2");
    expect(source.saveVersion).toBe(2);
    const before = stableStringify(source);

    const first = migrateToV11(source);
    const second = migrateToV11(source);

    expect(first.state.studio.cash).toBe(source.state.studio.cash);
    expect(first.state.studio.activeProductions).toEqual(
      source.state.studio.activeProductions,
    );
    expect(first.state.ledger).toEqual([]);
    expect(first.state.cashLedgerCheckpoint).toEqual({
      cash: source.state.studio.cash,
      ledgerLength: 0,
    });
    expect(stableStringify(first)).toBe(stableStringify(second));
    expect(stableStringify(source)).toBe(before);
    expect(validateSaveV11(first)).toBe(first);
  });

  it("preserves validator-accepted non-opening cash through every V1-V10 descendant", () => {
    const legacy = makeLegacyStateV1({
      seed: "checkpoint-all-historical-versions",
      talent: makeLegacyCorpus(12, "checkpoint-history"),
    });
    legacy.studio.cash = 16_123_456;
    const v1 = makeSaveV1(legacy);
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
      const sourceRows = clone(historicalLedger(source));
      const first = migrateToV11(source);
      const second = migrateToV11(source);

      expect(first.state.cashLedgerCheckpoint).toEqual({
        cash: 16_123_456,
        ledgerLength: sourceRows.length,
      });
      expect(first.state.studio.cash).toBe(16_123_456);
      expect(first.state.ledger).toEqual(sourceRows);
      expect(stableStringify(first)).toBe(stableStringify(second));
      expect(stableStringify(source)).toBe(before);
      expect(first).not.toBe(source);
      expect(first.state).not.toBe(source.state);
      expect(validateSaveV11(first)).toBe(first);
    }
  });

  it("keeps native and existing reconciled V11 files on the original omitted-field shape", () => {
    const nativeWorld = generateWorld("checkpoint-native-omission");
    const native = makeSave(nativeWorld);
    expect("cashLedgerCheckpoint" in native.state).toBe(false);
    expect(validateSaveV12(native)).toBe(native);
    expect(migrateToV12(native)).toBe(native);

    const played = applyActions(
      nativeWorld,
      OracleAgent.chooseActions(nativeWorld),
    );
    const reconciled = makeSave(played);
    expect(reconciled.state.ledger).toHaveLength(1);
    expect("cashLedgerCheckpoint" in reconciled.state).toBe(false);
    expect(validateSaveV12(reconciled)).toBe(reconciled);

    const json = exportSave(reconciled);
    const imported = importSave(json);
    expect(exportSave(imported)).toBe(json);
    expect("cashLedgerCheckpoint" in imported.state).toBe(false);
    expect(migrateToV12(imported)).toBe(imported);
  });

  it("rejects malformed and redundant checkpoints at the exact V11 boundary", () => {
    const valid = checkpointedLegacyV11("checkpoint-malformed");
    const malformed: Array<[unknown, RegExp]> = [
      [null, /cashLedgerCheckpoint.*plain object/],
      [{ ledgerLength: 0 }, /cashLedgerCheckpoint.*missing required field "cash"/],
      [{ cash: valid.state.studio.cash }, /cashLedgerCheckpoint.*missing required field "ledgerLength"/],
      [{ cash: "17654321", ledgerLength: 0 }, /cashLedgerCheckpoint\.cash.*finite number/],
      [{ cash: valid.state.studio.cash, ledgerLength: -1 }, /cashLedgerCheckpoint\.ledgerLength.*non-negative finite integer/],
      [{ cash: valid.state.studio.cash, ledgerLength: 0.5 }, /cashLedgerCheckpoint\.ledgerLength.*non-negative finite integer/],
      [{ cash: valid.state.studio.cash, ledgerLength: 1 }, /cashLedgerCheckpoint\.ledgerLength.*cannot exceed/],
      [
        { cash: valid.state.studio.cash, ledgerLength: 0, invented: true },
        /cashLedgerCheckpoint.*unknown field "invented"/,
      ],
    ];

    for (const [checkpoint, expected] of malformed) {
      const bad = clone(valid) as unknown as {
        state: Record<string, unknown>;
      };
      bad.state.cashLedgerCheckpoint = checkpoint;
      expect(() => validateSaveV11(bad)).toThrow(expected);
    }

    const nonFinite = clone(valid);
    nonFinite.state.cashLedgerCheckpoint!.cash = Number.POSITIVE_INFINITY;
    expect(() => validateSaveV11(nonFinite)).toThrow(
      /cashLedgerCheckpoint\.cash.*finite number/,
    );

    const explicitUndefined = clone(valid) as unknown as {
      state: Record<string, unknown>;
    };
    explicitUndefined.state.cashLedgerCheckpoint = undefined;
    expect(() => validateSaveV11(explicitUndefined)).toThrow(
      /cashLedgerCheckpoint.*plain object/,
    );

    const redundant = clone(makeSave(generateWorld("checkpoint-redundant")));
    redundant.state.cashLedgerCheckpoint = {
      cash: redundant.state.studio.cash,
      ledgerLength: redundant.state.ledger.length,
    };
    expect(() => validateSaveV12(redundant)).toThrow(
      /checkpoint must encode a genuine historical reconciliation boundary/,
    );
  });
});

describe("SaveFileV11 cash/ledger checkpoint — post-migration authority", () => {
  it("prevents every frozen builder from moving a checkpoint after later gameplay", () => {
    const migrated = migrateToV12(playedV2("checkpoint-frozen-projection"));
    const checkpoint = migrated.state.cashLedgerCheckpoint!;
    let continued = migrated.state;
    for (let week = 0; week < 30 && continued.studio.activeProductions.length > 0; week++) {
      continued = tick(continued);
    }
    expect(continued.studio.activeProductions).toHaveLength(0);
    expect(continued.ledger.length).toBeGreaterThan(checkpoint.ledgerLength);
    expect(() => makeSave(continued)).not.toThrow();

    const builders: ReadonlyArray<(state: GameState) => SaveFile> = [
      makeSaveV1,
      makeSaveV2,
      makeSaveV3,
      makeSaveV4,
      makeSaveV5,
      makeSaveV6,
      makeSaveV7,
      makeSaveV8,
      makeSaveV9,
      makeSaveV10,
    ];
    for (const builder of builders) {
      expect(() => builder(continued)).toThrow(
        /cannot downgrade or move the authoritative V11 cash-ledger checkpoint after post-checkpoint activity/,
      );
    }
  });

  it("prevents every frozen builder from laundering an invalid checkpoint", () => {
    const valid = checkpointedLegacyV11("checkpoint-frozen-laundering");
    const invalid = clone(valid);
    invalid.state.cashLedgerCheckpoint!.cash += 1;
    expect(() => validateSaveV11(invalid)).toThrow(
      /studio cash must equal the historical checkpoint plus the ordered post-checkpoint ledger/,
    );

    const builders: ReadonlyArray<(state: GameState) => SaveFile> = [
      makeSaveV1,
      makeSaveV2,
      makeSaveV3,
      makeSaveV4,
      makeSaveV5,
      makeSaveV6,
      makeSaveV7,
      makeSaveV8,
      makeSaveV9,
      makeSaveV10,
    ];
    for (const builder of builders) {
      // Deliberately NOT migrated: the point is an invalid checkpoint reaching a
      // frozen builder unvalidated. The empty placement root is the V12 shape a
      // placement-free history carries.
      expect(() =>
        builder({ ...invalid.state, placement: emptyStudioPlacement() }),
      ).toThrow(
        /cannot downgrade or repair a semantically invalid V11 cash-ledger checkpoint/,
      );
    }

    const redundant = clone(makeSave(generateWorld("checkpoint-frozen-redundant")));
    redundant.state.cashLedgerCheckpoint = {
      cash: redundant.state.studio.cash,
      ledgerLength: redundant.state.ledger.length,
    };
    for (const builder of builders) {
      expect(() => builder(redundant.state)).toThrow(
        /cannot downgrade or repair a semantically invalid V11 cash-ledger checkpoint/,
      );
    }
  });

  it("retains a nonempty historical checkpoint prefix only through ledger-owning builders", () => {
    const world = generateWorld("checkpoint-prefix-projection");
    const played = applyActions(world, OracleAgent.chooseActions(world));
    const historical = makeSaveV10(played);
    historical.state.studio.cash -= 1_234;
    expect(validateSaveV10(historical)).toBe(historical);
    const migrated = migrateToV11(historical);
    expect(migrated.state.cashLedgerCheckpoint).toEqual({
      cash: historical.state.studio.cash,
      ledgerLength: historical.state.ledger.length,
    });
    expect(historical.state.ledger.length).toBeGreaterThan(0);

    const live = migrateToV12(migrated).state;
    const totals = financeTotals(live);
    const recap = studioRunRecap(live);
    const impliedOpening = Math.round(
      (migrated.state.studio.cash - totals.net) * 100,
    ) / 100;
    expect(totals.net).toBe(
      migrated.state.ledger.reduce((sum, entry) => sum + entry.amount, 0),
    );
    expect(recap.capital.openingBalance).toBe(impliedOpening);
    expect(recap.capital.cashTimeline.at(-1)!.cash).toBe(
      Math.round(migrated.state.studio.cash * 100) / 100,
    );
    expect(recap.summary.cashChange).toBe(Math.round(totals.net * 100) / 100);

    expect(() => makeSaveV1(migrated.state)).toThrow(
      /cannot discard the historical ledger prefix required by the V11 cash-ledger checkpoint/,
    );
    expect(() => makeSaveV2(migrated.state)).toThrow(
      /cannot discard the historical ledger prefix required by the V11 cash-ledger checkpoint/,
    );

    const liveState = migrateToV12(migrated).state;
    const ledgerBuilders: ReadonlyArray<(state: GameState) => SaveFile> = [
      makeSaveV3,
      makeSaveV4,
      makeSaveV5,
      makeSaveV6,
      makeSaveV7,
      makeSaveV8,
      makeSaveV9,
      makeSaveV10,
    ];
    for (const builder of ledgerBuilders) {
      const remigrated = migrateToV12(builder(liveState));
      expect(remigrated.state.cashLedgerCheckpoint).toEqual(
        migrated.state.cashLedgerCheckpoint,
      );
      expect(remigrated.state.ledger).toEqual(migrated.state.ledger);
      expect(remigrated.state.studio.cash).toBe(migrated.state.studio.cash);
    }
  });

  it("anchors cash and rejects checkpoint, cash, boundary, and suffix tampering", () => {
    const migrated = migrateToV12(
      managedMismatchedV10("checkpoint-tampering"),
    );
    const started = applyActions(migrated.state, [
      { kind: "startDevelopmentCastingAnnex" },
    ]);
    const settled = tick(started);
    const valid = makeSave(settled);
    const checkpoint = valid.state.cashLedgerCheckpoint!;
    const overheadIndex = valid.state.ledger.findIndex(
      (entry, index) =>
        index >= checkpoint.ledgerLength && entry.kind === "overhead",
    );
    expect(overheadIndex).toBeGreaterThan(checkpoint.ledgerLength);

    const changedAnchor = clone(valid);
    changedAnchor.state.cashLedgerCheckpoint!.cash += 1;
    expect(() => validateSaveV12(changedAnchor)).toThrow(
      /studio cash must equal the historical checkpoint plus the ordered post-checkpoint ledger/,
    );

    const changedCash = clone(valid);
    changedCash.state.studio.cash += 1;
    expect(() => validateSaveV12(changedCash)).toThrow(
      /studio cash must equal the historical checkpoint plus the ordered post-checkpoint ledger/,
    );

    const movedBoundary = clone(valid);
    movedBoundary.state.cashLedgerCheckpoint!.ledgerLength += 1;
    expect(() => validateSaveV12(movedBoundary)).toThrow(
      /construction capex cannot predate the V11 cash-ledger checkpoint/,
    );

    const changedSuffix = clone(valid);
    changedSuffix.state.ledger[overheadIndex]!.amount -= 1;
    expect(() => validateSaveV12(changedSuffix)).toThrow(
      /studio cash must equal the historical checkpoint plus the ordered post-checkpoint ledger/,
    );
  });

  it("preserves exact checkpoint reconciliation through managed payroll and overhead suffixes", () => {
    const migrated = migrateToV12(
      foundedManagedMismatchedV10("checkpoint-managed-suffix"),
    );
    const checkpoint = clone(migrated.state.cashLedgerCheckpoint!);
    let state = migrated.state;
    for (let week = 0; week < 40; week++) {
      state = tick(state);
      expect(state.cashLedgerCheckpoint).toEqual(checkpoint);
      expect(() => makeSave(state)).not.toThrow();
    }
    const suffix = state.ledger.slice(checkpoint.ledgerLength);
    expect(suffix.some((entry) => entry.kind === "payroll")).toBe(true);
    expect(suffix.some((entry) => entry.kind === "overhead")).toBe(true);
    expect(state.studio.cash).toBe(
      suffix.reduce((cash, entry) => cash + entry.amount, checkpoint.cash),
    );
  });

  it("starts and completes the Annex from a mismatched managed V10 with exactly one post-checkpoint capex", () => {
    const source = managedMismatchedV10("checkpoint-annex-lifecycle");
    const sourceBefore = stableStringify(source);
    const migrated = migrateToV12(source);
    const checkpoint = migrated.state.cashLedgerCheckpoint!;

    expect(checkpoint).toEqual({
      cash: source.state.studio.cash,
      ledgerLength: source.state.ledger.length,
    });
    expect(migrated.state.ledger).toEqual(source.state.ledger);
    expect(stableStringify(source)).toBe(sourceBefore);

    const cashBefore = migrated.state.studio.cash;
    const started = applyActions(migrated.state, [
      { kind: "startDevelopmentCastingAnnex" },
    ]);
    expect(started.cashLedgerCheckpoint).toEqual(checkpoint);
    expect(started.studio.cash).toBe(cashBefore - ANNEX_CAPEX);
    expect(started.ledger.slice(checkpoint.ledgerLength)).toEqual([
      expect.objectContaining({
        kind: "constructionCapex",
        amount: -ANNEX_CAPEX,
        week: started.market.tick,
      }),
    ]);
    expect(() => makeSave(started)).not.toThrow();

    const completed = advance(started, ANNEX_DURATION_WEEKS);
    expect(completed.cashLedgerCheckpoint).toEqual(checkpoint);
    expect(
      completed.ledger.filter((entry) => entry.kind === "constructionCapex"),
    ).toHaveLength(1);
    expect(
      completed.operations.facilities.filter(
        (facility) => facility.id === ANNEX_FACILITY_ID,
      ),
    ).toHaveLength(1);
    expect(completed.construction.projects).toEqual([]);
    expect(completed.placement.facilities[0]).toMatchObject({
      status: "operational",
      completesWeek: completed.market.tick,
    });
    expect(() => makeSave(completed)).not.toThrow();

    for (const state of [migrated.state, started, completed]) {
      const json = exportSave(makeSave(state));
      const imported = importSave(json);
      expect(exportSave(imported)).toBe(json);
      expect(exportSave(migrateToV12(imported))).toBe(json);
    }
  });
});
