export type MusicContext = "NORMAL" | "ACTIVE" | "BLOCKED" | "WORKSPACE";
export type DensityMode = "FULL_MUSIC" | "BALANCED" | "SPARSE" | "OFF";
export type SpeechOwner = "NONE" | "RADIO_VOICE" | "PA_HELP";
export type MetadataConfidence = "HIGH" | "LOW";

export interface CueVariant {
  readonly id: string;
  readonly context: MusicContext;
  readonly relativePath: string;
  readonly sha256: string;
  readonly durationSeconds: number;
  readonly bpm: number | null;
  readonly beatsPerBar: number | null;
  readonly phraseBars: number | null;
  readonly metadataConfidence: MetadataConfidence;
  readonly available: boolean;
}

export interface CueBundle {
  readonly id: string;
  readonly commissioningAlias: string;
  readonly family: string;
  readonly variants: readonly CueVariant[];
  readonly classification: "HORIZONTAL_VARIANT_BUNDLE";
}

export interface AudioPresentationState {
  readonly musicEligibilitySet: readonly string[];
  readonly broadLotActivity: "IDLE" | "ACTIVE_PRODUCTION" | "LOAD_IN" | "BLOCKED_PRODUCTION";
  readonly workspaceDepth: number;
  readonly speechOwner: SpeechOwner;
  readonly paused: boolean;
  readonly focused: boolean;
  readonly density: DensityMode;
  readonly scoreEnabled: boolean;
  readonly currentBundleId: string | null;
  readonly currentVariant: MusicContext | null;
  readonly currentFamily: string | null;
  readonly currentCueStartedDsp: number | null;
  readonly contextStableSeconds: number;
  readonly historyBundleIds: readonly string[];
  readonly historyFamilies: readonly string[];
  readonly deterministicPresentationSeed: string;
  readonly nowDsp: number;
  readonly gameSpeed: 1 | 2 | 4;
  readonly simulatedDeviceReset: boolean;
}

export interface TransitionRequest {
  readonly type: "NONE" | "PHRASE_ALIGNED" | "SAFE_CROSSFADE" | "MIX_ONLY" | "STOP_AT_SAFE_BOUNDARY";
  readonly boundaryDsp: number | null;
  readonly crossfadeSeconds: number;
  readonly reason: string;
}

export interface AudioPresentationDecision {
  readonly selectedCueBundle: string | null;
  readonly selectedVariant: MusicContext | null;
  readonly requestedTransition: TransitionRequest;
  readonly targetGainsDb: Readonly<Record<"SCORE" | "RADIO_MUSIC" | "RADIO_VOICE" | "PA_HELP" | "AMBIENCE" | "ACTIVE_SFX" | "UI", number>>;
  readonly duckingState: "NONE" | "RADIO_DUCK" | "PA_PRIORITY_DUCK";
  readonly silenceDensityState: "PLAY" | "DETERMINISTIC_GAP" | "MUSIC_OFF" | "PAUSED";
  readonly refusalFallbackReason: string | null;
  readonly pitchScale: 1;
  readonly tempoScale: 1;
  readonly deterministicToken: string;
}

const MINIMUM_DWELL_SECONDS = 45;
const ACTIVE_HYSTERESIS_SECONDS = 8;
const BLOCKED_HYSTERESIS_SECONDS = 5;

function fnv1a(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function deterministicUnit(seed: string): number {
  let value = fnv1a(seed) || 0x6d2b79f5;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 0x1_0000_0000;
}

export function deterministicShuffle<T>(values: readonly T[], seed: string): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(deterministicUnit(`${seed}:${index}`) * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function targetContext(state: AudioPresentationState): MusicContext {
  if (state.workspaceDepth > 0) return "WORKSPACE";
  if (state.broadLotActivity === "BLOCKED_PRODUCTION") return "BLOCKED";
  if (state.broadLotActivity === "ACTIVE_PRODUCTION" || state.broadLotActivity === "LOAD_IN") return "ACTIVE";
  return "NORMAL";
}

function chooseBundle(state: AudioPresentationState, bundles: readonly CueBundle[]): CueBundle | null {
  const eligible = bundles.filter((bundle) => state.musicEligibilitySet.includes(bundle.id));
  if (eligible.length === 0) return null;
  const recentIds = new Set(state.historyBundleIds.slice(-Math.min(eligible.length - 1, 3)));
  const recentFamily = state.historyFamilies.at(-1) ?? null;
  const preferred = eligible.filter((bundle) => !recentIds.has(bundle.id) && bundle.family !== recentFamily);
  const fallback = eligible.filter((bundle) => !recentIds.has(bundle.id));
  const pool = preferred.length > 0 ? preferred : fallback.length > 0 ? fallback : eligible;
  return deterministicShuffle(pool, `${state.deterministicPresentationSeed}:bundle:${state.historyBundleIds.length}`)[0] ?? null;
}

function nextPhraseBoundary(nowDsp: number, variant: CueVariant): number | null {
  if (
    variant.metadataConfidence !== "HIGH" ||
    variant.bpm === null || variant.bpm <= 0 ||
    variant.beatsPerBar === null || variant.beatsPerBar <= 0 ||
    variant.phraseBars === null || variant.phraseBars <= 0
  ) return null;
  const phraseSeconds = (60 / variant.bpm) * variant.beatsPerBar * variant.phraseBars;
  return Math.ceil((nowDsp + 0.1) / phraseSeconds) * phraseSeconds;
}

function densityGap(state: AudioPresentationState): boolean {
  if (state.density === "FULL_MUSIC") return false;
  if (state.density === "OFF") return true;
  const threshold = state.density === "BALANCED" ? 0.18 : 0.42;
  return deterministicUnit(`${state.deterministicPresentationSeed}:density:${state.historyBundleIds.length}`) < threshold;
}

function baseGains(speechOwner: SpeechOwner): AudioPresentationDecision["targetGainsDb"] {
  if (speechOwner === "PA_HELP") {
    return { SCORE: -18, RADIO_MUSIC: -22, RADIO_VOICE: -12, PA_HELP: 0, AMBIENCE: -9, ACTIVE_SFX: -10, UI: -5 };
  }
  if (speechOwner === "RADIO_VOICE") {
    return { SCORE: -12, RADIO_MUSIC: -15, RADIO_VOICE: 0, PA_HELP: -80, AMBIENCE: -7, ACTIVE_SFX: -7, UI: -4 };
  }
  return { SCORE: 0, RADIO_MUSIC: 0, RADIO_VOICE: 0, PA_HELP: 0, AMBIENCE: 0, ACTIVE_SFX: 0, UI: 0 };
}

export function decideAudioPresentation(
  state: AudioPresentationState,
  bundles: readonly CueBundle[],
): AudioPresentationDecision {
  const token = `${fnv1a(JSON.stringify(state)).toString(16).padStart(8, "0")}`;
  const common = {
    targetGainsDb: baseGains(state.speechOwner),
    duckingState: state.speechOwner === "PA_HELP" ? "PA_PRIORITY_DUCK" as const : state.speechOwner === "RADIO_VOICE" ? "RADIO_DUCK" as const : "NONE" as const,
    pitchScale: 1 as const,
    tempoScale: 1 as const,
    deterministicToken: token,
  };
  if (state.paused || !state.focused) {
    return {
      ...common,
      selectedCueBundle: state.currentBundleId,
      selectedVariant: state.currentVariant,
      requestedTransition: { type: "NONE", boundaryDsp: null, crossfadeSeconds: 0, reason: "LIFECYCLE_SUSPENDED_RETAIN_LOGICAL_TRANSPORT" },
      silenceDensityState: "PAUSED",
      refusalFallbackReason: null,
    };
  }
  if (!state.scoreEnabled || state.density === "OFF") {
    return {
      ...common,
      selectedCueBundle: null,
      selectedVariant: null,
      requestedTransition: { type: "STOP_AT_SAFE_BOUNDARY", boundaryDsp: state.nowDsp + 0.1, crossfadeSeconds: 2, reason: "MUSIC_OFF_PRESENTATION_SETTING" },
      silenceDensityState: "MUSIC_OFF",
      refusalFallbackReason: null,
    };
  }
  const bundle = state.currentBundleId
    ? bundles.find((candidate) => candidate.id === state.currentBundleId && state.musicEligibilitySet.includes(candidate.id)) ?? chooseBundle(state, bundles)
    : chooseBundle(state, bundles);
  if (bundle === null) {
    return {
      ...common,
      selectedCueBundle: null,
      selectedVariant: null,
      requestedTransition: { type: "NONE", boundaryDsp: null, crossfadeSeconds: 0, reason: "NO_ELIGIBLE_CUE" },
      silenceDensityState: "DETERMINISTIC_GAP",
      refusalFallbackReason: "MISSING_OR_EMPTY_MUSIC_ELIGIBILITY_SET_FAIL_CLOSED_TO_AMBIENCE_OR_SILENCE",
    };
  }
  if (densityGap(state) && state.currentBundleId === null) {
    return {
      ...common,
      selectedCueBundle: null,
      selectedVariant: null,
      requestedTransition: { type: "NONE", boundaryDsp: null, crossfadeSeconds: 0, reason: "AUTHORED_DETERMINISTIC_DENSITY_GAP" },
      silenceDensityState: "DETERMINISTIC_GAP",
      refusalFallbackReason: null,
    };
  }
  let context = targetContext(state);
  if (context === "WORKSPACE" && state.currentVariant !== null && state.currentBundleId === bundle.id) {
    return {
      ...common,
      selectedCueBundle: bundle.id,
      selectedVariant: state.currentVariant,
      requestedTransition: { type: "MIX_ONLY", boundaryDsp: null, crossfadeSeconds: 1.5, reason: "WORKSPACE_CONTINUITY_NO_CUE_RESTART" },
      silenceDensityState: "PLAY",
      refusalFallbackReason: null,
    };
  }
  const hysteresis = context === "BLOCKED" ? BLOCKED_HYSTERESIS_SECONDS : context === "ACTIVE" ? ACTIVE_HYSTERESIS_SECONDS : 0;
  const dwell = state.currentCueStartedDsp === null ? Number.POSITIVE_INFINITY : state.nowDsp - state.currentCueStartedDsp;
  if (state.currentVariant !== null && context !== state.currentVariant && (state.contextStableSeconds < hysteresis || dwell < MINIMUM_DWELL_SECONDS)) {
    context = state.currentVariant;
  }
  const variant = bundle.variants.find((candidate) => candidate.context === context) ?? null;
  if (variant === null || !variant.available || !/^[a-f0-9]{64}$/.test(variant.sha256)) {
    return {
      ...common,
      selectedCueBundle: null,
      selectedVariant: null,
      requestedTransition: { type: "NONE", boundaryDsp: null, crossfadeSeconds: 0, reason: "EXACT_VARIANT_IDENTITY_UNAVAILABLE" },
      silenceDensityState: "DETERMINISTIC_GAP",
      refusalFallbackReason: "MISSING_FILE_OR_HASH_IDENTITY_FAIL_CLOSED_NO_SILENT_SUBSTITUTION",
    };
  }
  const unchanged = state.currentBundleId === bundle.id && state.currentVariant === context;
  if (unchanged) {
    return {
      ...common,
      selectedCueBundle: bundle.id,
      selectedVariant: context,
      requestedTransition: {
        type: "NONE",
        boundaryDsp: null,
        crossfadeSeconds: 0,
        reason: state.simulatedDeviceReset
          ? "CURRENT_CUE_CONTINUES_TRANSPORT_OWNS_DEVICE_RESET_RECOVERY"
          : "CURRENT_CUE_CONTINUES",
      },
      silenceDensityState: "PLAY",
      refusalFallbackReason: null,
    };
  }
  const phrase = nextPhraseBoundary(state.nowDsp, variant);
  return {
    ...common,
    selectedCueBundle: bundle.id,
    selectedVariant: context,
    requestedTransition: phrase === null
      ? { type: "SAFE_CROSSFADE", boundaryDsp: state.nowDsp + 0.1, crossfadeSeconds: 2, reason: "LOW_METADATA_CONFIDENCE" }
      : { type: "PHRASE_ALIGNED", boundaryDsp: phrase, crossfadeSeconds: 2, reason: "TRUSTWORTHY_PHRASE_METADATA" },
    silenceDensityState: "PLAY",
    refusalFallbackReason: null,
  };
}

export function deterministicGapSeconds(mode: DensityMode, seed: string, sequence: number): number {
  if (mode === "OFF") return Number.POSITIVE_INFINITY;
  const [minimum, maximum] = mode === "FULL_MUSIC" ? [8, 20] : mode === "BALANCED" ? [35, 95] : [120, 300];
  return Math.round(minimum + deterministicUnit(`${seed}:gap:${sequence}`) * (maximum - minimum));
}
