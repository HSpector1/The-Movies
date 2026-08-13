// Frozen save builders are output boundaries: later live-state roots must never
// be mislabeled as fields owned by an earlier saveVersion.

import { describe, expect, it } from "vitest";
import {
  generateWorld,
  makeSaveV1,
  makeSaveV2,
  makeSaveV3,
  makeSaveV4,
  makeSaveV5,
  makeSaveV6,
  makeSaveV7,
  makeSaveV8,
  makeSaveV9,
  migrateToV9,
  stableStringify,
  validateSaveV6,
} from "../src/core/index.js";
import { migrateToV10 } from "../src/core/save.js";

const V2_ROOTS = [
  "seed",
  "rngState",
  "market",
  "era",
  "studio",
  "talent",
  "concepts",
  "broadcastItems",
  "coverageContexts",
] as const;
const V3_ROOTS = [
  ...V2_ROOTS,
  "founding",
  "contracts",
  "ledger",
  "freeAgents",
] as const;
const V4_ROOTS = [...V3_ROOTS, "theatricalRuns"] as const;
const V5_ROOTS = [...V4_ROOTS, "careerEvents"] as const;
const V6_ROOTS = [...V5_ROOTS, "economyEngagedEver"] as const;
const V7_ROOTS = [...V6_ROOTS, "publicity"] as const;
const V8_ROOTS = [...V7_ROOTS, "operations"] as const;
const V9_ROOTS = [...V8_ROOTS, "scriptDevelopment"] as const;

function sorted(values: readonly string[]): string[] {
  return [...values].sort();
}

describe("frozen save builders project exact historical roots", () => {
  it("makeSaveV1 through makeSaveV9 omit every later and unknown live-state root", () => {
    const live = {
      ...generateWorld("frozen-builder-projection"),
      futureV11State: { mustNotLeak: true },
    };
    const before = stableStringify(live);
    const cases = [
      { version: 1, save: makeSaveV1(live), roots: V2_ROOTS },
      { version: 2, save: makeSaveV2(live), roots: V2_ROOTS },
      { version: 3, save: makeSaveV3(live), roots: V3_ROOTS },
      { version: 4, save: makeSaveV4(live), roots: V4_ROOTS },
      { version: 5, save: makeSaveV5(live), roots: V5_ROOTS },
      { version: 6, save: makeSaveV6(live), roots: V6_ROOTS },
      { version: 7, save: makeSaveV7(live), roots: V7_ROOTS },
      { version: 8, save: makeSaveV8(live), roots: V8_ROOTS },
      { version: 9, save: makeSaveV9(live), roots: V9_ROOTS },
    ] as const;

    for (const { version, save, roots } of cases) {
      expect(save.saveVersion).toBe(version);
      expect(sorted(Object.keys(save.state))).toEqual(sorted(roots));
      expect(save.state).not.toBe(live);
      expect(save.state.market).toBe(live.market);
      expect(save.broadcastCache).toEqual(live.broadcastItems);
      expect("futureV11State" in save.state).toBe(false);
    }

    expect(stableStringify(live)).toBe(before);
    expect(live.scriptDevelopment).toEqual({ mode: "legacy", projects: [] });

    const migrated = migrateToV9(makeSaveV7(live));
    expect("futureV11State" in migrated.state).toBe(false);
    expect(migrated.state.scriptDevelopment).toEqual({ mode: "legacy", projects: [] });

    const current = migrateToV10(makeSaveV9(live));
    expect("futureV11State" in current.state).toBe(false);
    expect(current.state.castingSessions).toEqual({ mode: "legacy", sessions: [] });
  });

  it("does not harden a frozen validator against additive historical input", () => {
    const live = generateWorld("frozen-validator-compatibility");
    const v6 = makeSaveV6(live);
    const additiveV6 = {
      ...v6,
      state: {
        ...v6.state,
        publicity: live.publicity,
        operations: live.operations,
        scriptDevelopment: live.scriptDevelopment,
      },
    };

    expect(validateSaveV6(additiveV6)).toBe(additiveV6);
  });
});
