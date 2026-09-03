import { describe, expect, it } from "vitest";
import {
  decideAudioPresentation,
  deterministicGapSeconds,
  deterministicShuffle,
  type AudioPresentationState,
  type CueBundle,
} from "./decision-model";
import {
  coalesce,
  scheduleRadio,
  validatePayloadParity,
  validateRadioItemPayloadContract,
  type FunctionalPayload,
  type RadioItem,
} from "./radio-scheduler";

const hash = "a".repeat(64);
const bundle: CueBundle = {
  id: "BUNDLE-EARLY",
  commissioningAlias: "acoustic_electrical_1920_1932",
  family: "FND-03",
  classification: "HORIZONTAL_VARIANT_BUNDLE",
  variants: (["NORMAL", "ACTIVE", "BLOCKED", "WORKSPACE"] as const).map((context) => ({
    id: `EARLY-${context}`,
    context,
    relativePath: `${context}.wav`,
    sha256: hash,
    durationSeconds: 60,
    bpm: 90,
    beatsPerBar: 4,
    phraseBars: 4,
    metadataConfidence: "HIGH" as const,
    available: true,
  })),
};

function state(overrides: Partial<AudioPresentationState> = {}): AudioPresentationState {
  return {
    musicEligibilitySet: [bundle.id],
    broadLotActivity: "IDLE",
    workspaceDepth: 0,
    speechOwner: "NONE",
    paused: false,
    focused: true,
    density: "FULL_MUSIC",
    scoreEnabled: true,
    currentBundleId: null,
    currentVariant: null,
    currentFamily: null,
    currentCueStartedDsp: null,
    contextStableSeconds: 100,
    historyBundleIds: [],
    historyFamilies: [],
    deterministicPresentationSeed: "TEST",
    nowDsp: 10,
    gameSpeed: 1,
    simulatedDeviceReset: false,
    ...overrides,
  };
}

describe("pure deterministic audio presentation", () => {
  it("replays exactly and uses a deterministic shuffle bag", () => {
    expect(deterministicShuffle([1, 2, 3, 4], "S")).toEqual(deterministicShuffle([1, 2, 3, 4], "S"));
    expect(decideAudioPresentation(state(), [bundle])).toEqual(decideAudioPresentation(state(), [bundle]));
  });

  it("holds Active through hysteresis and minimum dwell", () => {
    const decision = decideAudioPresentation(state({
      broadLotActivity: "ACTIVE_PRODUCTION",
      currentBundleId: bundle.id,
      currentVariant: "NORMAL",
      currentFamily: bundle.family,
      currentCueStartedDsp: 0,
      nowDsp: 20,
      contextStableSeconds: 2,
    }), [bundle]);
    expect(decision.selectedVariant).toBe("NORMAL");
    expect(decision.requestedTransition.type).toBe("NONE");
  });

  it("keeps workspace continuity without a cue restart", () => {
    const decision = decideAudioPresentation(state({ currentBundleId: bundle.id, currentVariant: "ACTIVE", workspaceDepth: 2 }), [bundle]);
    expect(decision.selectedVariant).toBe("ACTIVE");
    expect(decision.requestedTransition.type).toBe("MIX_ONLY");
  });

  it("fails closed for missing catalogue identity", () => {
    const missing = { ...bundle, variants: bundle.variants.map((variant) => ({ ...variant, available: false })) };
    const decision = decideAudioPresentation(state(), [missing]);
    expect(decision.selectedCueBundle).toBeNull();
    expect(decision.refusalFallbackReason).toMatch(/FAIL_CLOSED/);
  });

  it("uses silence law and never changes pitch or tempo at 4x", () => {
    expect(deterministicGapSeconds("FULL_MUSIC", "S", 1)).toBeGreaterThanOrEqual(8);
    expect(deterministicGapSeconds("FULL_MUSIC", "S", 1)).toBeLessThanOrEqual(20);
    expect(deterministicGapSeconds("BALANCED", "S", 1)).toBe(deterministicGapSeconds("BALANCED", "S", 1));
    expect(deterministicGapSeconds("SPARSE", "S", 1)).toBeGreaterThanOrEqual(120);
    expect(deterministicGapSeconds("SPARSE", "S", 1)).toBeLessThanOrEqual(300);
    const decision = decideAudioPresentation(state({ gameSpeed: 4 }), [bundle]);
    expect([decision.pitchScale, decision.tempoScale]).toEqual([1, 1]);
    expect(decideAudioPresentation(state({ density: "OFF" }), [bundle]).silenceDensityState).toBe("MUSIC_OFF");
  });

  it("applies voice and PA priority ducking", () => {
    expect(decideAudioPresentation(state({ speechOwner: "RADIO_VOICE" }), [bundle]).targetGainsDb.SCORE).toBe(-12);
    expect(decideAudioPresentation(state({ speechOwner: "PA_HELP" }), [bundle]).duckingState).toBe("PA_PRIORITY_DUCK");
  });
});

const payload: FunctionalPayload = {
  ownerDomain: "P13_FIXTURE",
  eventId: "E",
  receiptId: "R1",
  headline: "H",
  body: "B",
  priority: 70,
  expiresAt: "2099-01-01T00:00:00Z",
  captionText: "Same text.",
  spokenText: "Same text.",
  source: "EXPLICIT_AUDIO_LAB_FIXTURE",
  fixtureVersion: "v1",
  locale: "en-US",
  createdAt: "2026-09-03T00:00:00Z",
  deterministicSeed: "TEST-SEED",
};

function radio(id: string, contentType: RadioItem["contentType"], priority: number, overrides: Partial<RadioItem> = {}): RadioItem {
  const typed = contentType === "FUNCTIONAL" || contentType === "PA_HELP";
  const defaultPayload: FunctionalPayload | null = typed ? {
    ...payload,
    eventId: id,
    receiptId: `${id}-R1`,
    headline: `${id} headline`,
    body: `${id} body`,
    priority,
  } : null;
  const selectedPayload = overrides.payload === undefined ? defaultPayload : overrides.payload;
  return {
    id,
    contentType,
    category: contentType,
    dayparts: ["MORNING"],
    presenters: ["P"],
    priority,
    cooldownSeconds: 100,
    categoryCooldownSeconds: 0,
    durationSeconds: 20,
    expiresAt: selectedPayload?.expiresAt ?? null,
    coalesceKey: selectedPayload === null ? null : `${selectedPayload.ownerDomain}:${selectedPayload.eventId}`,
    captionText: selectedPayload?.captionText ?? "Same text.",
    spokenText: selectedPayload?.spokenText ?? "Same text.",
    payload: selectedPayload,
    ownerDomain: selectedPayload?.ownerDomain ?? null,
    eventId: selectedPayload?.eventId ?? null,
    receiptId: selectedPayload?.receiptId ?? null,
    headline: selectedPayload?.headline ?? null,
    body: selectedPayload?.body ?? null,
    speakerId: contentType === "PA_HELP" ? "PA" : "P",
    speakerDisplayName: contentType === "PA_HELP" ? "PA Speaker" : "Presenter",
    speakerRole: contentType === "PA_HELP" ? "PA_HELP_SPEAKER" : "PROGRAMME_PRESENTER",
    streamerSafeEligible: true,
    ...overrides,
  };
}

describe("runtime radio scheduler", () => {
  it("prioritizes PA, obeys cooldown and expiry, and never mutates mechanics", () => {
    const decision = scheduleRadio({
      items: [radio("D", "DECORATIVE", 20), radio("F", "FUNCTIONAL", 70), radio("PA", "PA_HELP", 100)],
      nowSeconds: 200,
      nowIso: "2026-09-03T00:00:00Z",
      daypart: "MORNING",
      presenterId: "P",
      history: [{ id: "D", playedAtSeconds: 100 }],
      radioEnabled: true,
      streamerSafe: false,
    });
    expect(decision.item?.id).toBe("PA");
    expect(decision.reason).toBe("PA_SELECTED");
    expect(decision.mechanicsMutated).toBe(false);
  });

  it("coalesces typed functional identity to the newest receipt", () => {
    const newer = { ...payload, receiptId: "R2" };
    const rows = coalesce([
      radio("F1", "FUNCTIONAL", 70, { coalesceKey: "P13:E", payload }),
      radio("F2", "FUNCTIONAL", 70, { coalesceKey: "P13:E", payload: newer }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].payload?.receiptId).toBe("R2");
  });

  it("requires caption/spoken parity and preserves disabled-radio behavior", () => {
    expect(validatePayloadParity(payload)).toBe(true);
    expect(validatePayloadParity({ ...payload, captionText: "Different" })).toBe(false);
    const decision = scheduleRadio({ items: [], nowSeconds: 0, nowIso: "2026-01-01T00:00:00Z", daypart: "MORNING", presenterId: "P", history: [], radioEnabled: false, streamerSafe: false });
    expect(decision.reason).toMatch(/MECHANICS_UNCHANGED/);
  });

  it("enforces global spacing and rolling voice and elective budgets", () => {
    const base = { items: [radio("D2", "DECORATIVE", 20)], nowIso: "2026-09-03T00:00:00Z", daypart: "MORNING", presenterId: "P", radioEnabled: true, streamerSafe: false } as const;
    expect(scheduleRadio({ ...base, nowSeconds: 50, history: [{ id: "D1", playedAtSeconds: 0, contentType: "DECORATIVE", category: "OTHER", durationSeconds: 20 }] }).reason).toBe("SPEECH_BUDGET_REQUIRES_SILENCE");
    const history = [
      { id: "D1", playedAtSeconds: 0, contentType: "DECORATIVE" as const, category: "A", durationSeconds: 30 },
      { id: "D0", playedAtSeconds: 100, contentType: "DECORATIVE" as const, category: "B", durationSeconds: 30 },
    ];
    const budgeted = scheduleRadio({ ...base, nowSeconds: 200, history });
    expect(budgeted.item).toBeNull();
    expect(budgeted.candidateEvaluations[0].reason).toBe("ROLLING_ELECTIVE_START_BUDGET");
  });

  it("lets PA preempt the one active radio owner and records the victim", () => {
    const decision = scheduleRadio({
      items: [radio("PA", "PA_HELP", 100)], nowSeconds: 610, nowIso: "2026-09-03T00:00:00Z",
      daypart: "MORNING", presenterId: "P", history: [], radioEnabled: true, streamerSafe: false,
      activeSpeech: { itemId: "QUEUED-RADIO", owner: "RADIO_VOICE", endsAtSeconds: 630 },
    });
    expect(decision.reason).toBe("PA_PREEMPTS_RADIO");
    expect(decision.interruptedItemId).toBe("QUEUED-RADIO");
  });

  it("fails closed for invalid typed functional parity before selection", () => {
    const invalid = radio("F", "FUNCTIONAL", 70, { payload: { ...payload, captionText: "Different" } });
    const decision = scheduleRadio({ items: [invalid], nowSeconds: 200, nowIso: "2026-09-03T00:00:00Z", daypart: "MORNING", presenterId: "P", history: [], radioEnabled: true, streamerSafe: false });
    expect(decision.item).toBeNull();
    expect(decision.candidateEvaluations[0].reason).toBe("TYPED_PAYLOAD_INVALID_OR_DIVERGENT");
  });

  it("requires the same exact typed payload contract for PA/help", () => {
    const valid = radio("PA", "PA_HELP", 100);
    expect(validateRadioItemPayloadContract(valid)).toBe(true);
    const missing = radio("PA", "PA_HELP", 100, { payload: null });
    const decision = scheduleRadio({ items: [missing], nowSeconds: 200, nowIso: "2026-09-03T00:00:00Z", daypart: "MORNING", presenterId: "P", history: [], radioEnabled: true, streamerSafe: false });
    expect(decision.item).toBeNull();
    expect(decision.candidateEvaluations[0].reason).toBe("TYPED_PAYLOAD_INVALID_OR_DIVERGENT");
  });

  it("refuses every top-level divergence from a typed payload", () => {
    const valid = radio("F", "FUNCTIONAL", 70);
    const corruptions: readonly Partial<RadioItem>[] = [
      { ownerDomain: "WRONG_OWNER" },
      { eventId: "WRONG_EVENT" },
      { receiptId: "WRONG_RECEIPT" },
      { headline: "Wrong headline" },
      { body: "Wrong body" },
      { priority: 71 },
      { expiresAt: "2098-01-01T00:00:00Z" },
      { captionText: "Wrong caption" },
      { spokenText: "Wrong speech" },
      { coalesceKey: "WRONG:KEY" },
    ];
    for (const corruption of corruptions) {
      const decision = scheduleRadio({ items: [{ ...valid, ...corruption }], nowSeconds: 200, nowIso: "2026-09-03T00:00:00Z", daypart: "MORNING", presenterId: "P", history: [], radioEnabled: true, streamerSafe: false });
      expect(decision.item).toBeNull();
      expect(decision.candidateEvaluations[0].reason).toBe("TYPED_PAYLOAD_INVALID_OR_DIVERGENT");
    }
  });

  it("refuses functional fields on decorative and milestone items", () => {
    for (const contentType of ["DECORATIVE", "MILESTONE_STING"] as const) {
      const invalid = radio("NONFUNCTIONAL", contentType, 20, { payload, ownerDomain: payload.ownerDomain });
      const decision = scheduleRadio({ items: [invalid], nowSeconds: 200, nowIso: "2026-09-03T00:00:00Z", daypart: "MORNING", presenterId: "P", history: [], radioEnabled: true, streamerSafe: false });
      expect(decision.item).toBeNull();
      expect(decision.candidateEvaluations[0].reason).toBe("NONFUNCTIONAL_ITEM_OWNS_FUNCTIONAL_FIELDS");
    }
  });
});
