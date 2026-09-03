export type RadioContentType = "DECORATIVE" | "FUNCTIONAL" | "PA_HELP" | "MILESTONE_STING";
export type SpeechOwner = "NONE" | "RADIO_VOICE" | "PA_HELP";

export interface FunctionalPayload {
  readonly ownerDomain: string;
  readonly eventId: string;
  readonly receiptId: string;
  readonly headline: string;
  readonly body: string;
  readonly priority: number;
  readonly expiresAt: string;
  readonly captionText: string;
  readonly spokenText: string;
  readonly source: "EXPLICIT_AUDIO_LAB_FIXTURE";
  readonly fixtureVersion: string;
  readonly locale: string;
  readonly createdAt: string;
  readonly deterministicSeed: string;
}

export interface RadioItem {
  readonly id: string;
  readonly contentType: RadioContentType;
  readonly category: string;
  readonly dayparts: readonly string[];
  readonly presenters: readonly string[];
  readonly priority: number;
  readonly cooldownSeconds: number;
  readonly categoryCooldownSeconds: number;
  readonly durationSeconds: number;
  readonly expiresAt: string | null;
  readonly coalesceKey: string | null;
  readonly captionText: string;
  readonly spokenText: string;
  readonly payload: FunctionalPayload | null;
  readonly ownerDomain: string | null;
  readonly eventId: string | null;
  readonly receiptId: string | null;
  readonly headline: string | null;
  readonly body: string | null;
  readonly speakerId: string;
  readonly speakerDisplayName: string;
  readonly speakerRole: "PROGRAMME_PRESENTER" | "PA_HELP_SPEAKER";
  readonly streamerSafeEligible: boolean;
}

export interface RadioHistoryItem {
  readonly id: string;
  readonly playedAtSeconds: number;
  readonly contentType?: RadioContentType;
  readonly category?: string;
  readonly presenterId?: string;
  readonly durationSeconds?: number;
}

export interface ActiveSpeech {
  readonly itemId: string;
  readonly owner: Exclude<SpeechOwner, "NONE">;
  readonly endsAtSeconds: number;
}

export interface RadioScheduleInput {
  readonly items: readonly RadioItem[];
  readonly nowSeconds: number;
  readonly nowIso: string;
  readonly daypart: string;
  readonly presenterId: string;
  readonly history: readonly RadioHistoryItem[];
  readonly radioEnabled: boolean;
  readonly streamerSafe: boolean;
  readonly activeSpeech?: ActiveSpeech | null;
}

export interface CandidateEvaluation {
  readonly id: string;
  readonly eligible: boolean;
  readonly reason: string;
}

export interface RadioScheduleDecision {
  readonly item: RadioItem | null;
  readonly speechOwner: SpeechOwner;
  readonly radioMusicGainDb: number;
  readonly scoreGainDb: number;
  readonly reason: string;
  readonly interruptedItemId: string | null;
  readonly coalescedItemIds: readonly string[];
  readonly candidateEvaluations: readonly CandidateEvaluation[];
  readonly rollingBudget: {
    readonly windowSeconds: 600;
    readonly startsBefore: number;
    readonly voicedSecondsBefore: number;
    readonly electiveStartsBefore: number;
    readonly electiveVoicedSecondsBefore: number;
  };
  readonly mechanicsMutated: false;
}

export const RADIO_LAWS = {
  rollingWindowSeconds: 600,
  maxStarts: 3,
  maxVoicedSeconds: 120,
  maxElectiveStarts: 2,
  maxElectiveVoicedSeconds: 75,
  minimumStartSpacingSeconds: 60,
} as const;

const typePriority: Record<RadioContentType, number> = {
  PA_HELP: 4,
  FUNCTIONAL: 3,
  MILESTONE_STING: 2,
  DECORATIVE: 1,
};

function newestReceipt(item: RadioItem): string {
  return item.payload?.receiptId ?? item.id;
}

export function coalesce(items: readonly RadioItem[]): RadioItem[] {
  const unkeyed: RadioItem[] = [];
  const keyed = new Map<string, RadioItem>();
  for (const item of items) {
    if (item.coalesceKey === null) {
      unkeyed.push(item);
      continue;
    }
    const previous = keyed.get(item.coalesceKey);
    if (
      previous === undefined ||
      item.priority > previous.priority ||
      (item.priority === previous.priority && newestReceipt(item) > newestReceipt(previous))
    ) keyed.set(item.coalesceKey, item);
  }
  return [...unkeyed, ...keyed.values()];
}

function validInstant(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function validatePayloadParity(payload: FunctionalPayload): boolean {
  const nonEmpty = (value: unknown): value is string => typeof value === "string" && value.length > 0;
  return payload !== null && typeof payload === "object" &&
    nonEmpty(payload.captionText) && payload.captionText === payload.spokenText &&
    nonEmpty(payload.ownerDomain) && nonEmpty(payload.eventId) && nonEmpty(payload.receiptId) &&
    nonEmpty(payload.headline) && nonEmpty(payload.body) && Number.isFinite(payload.priority) &&
    nonEmpty(payload.expiresAt) && validInstant(payload.expiresAt) && payload.source === "EXPLICIT_AUDIO_LAB_FIXTURE" &&
    nonEmpty(payload.fixtureVersion) && nonEmpty(payload.locale) &&
    nonEmpty(payload.createdAt) && validInstant(payload.createdAt) &&
    nonEmpty(payload.deterministicSeed);
}

function isTypedVoiceItem(item: RadioItem): boolean {
  return item.contentType === "FUNCTIONAL" || item.contentType === "PA_HELP";
}

function validateSpeakerRole(item: RadioItem): boolean {
  return item.speakerId.length > 0 && item.speakerDisplayName.length > 0 &&
    item.speakerRole === (item.contentType === "PA_HELP" ? "PA_HELP_SPEAKER" : "PROGRAMME_PRESENTER");
}

export function validateRadioItemPayloadContract(item: RadioItem): boolean {
  if (!isTypedVoiceItem(item)) {
    return item.payload === null && item.ownerDomain === null && item.eventId === null &&
      item.receiptId === null && item.headline === null && item.body === null;
  }
  const payload = item.payload;
  if (payload === null || !validatePayloadParity(payload)) return false;
  return item.ownerDomain === payload.ownerDomain && item.eventId === payload.eventId &&
    item.receiptId === payload.receiptId && item.headline === payload.headline &&
    item.body === payload.body && item.priority === payload.priority &&
    item.expiresAt === payload.expiresAt && item.captionText === payload.captionText &&
    item.spokenText === payload.spokenText && item.coalesceKey === `${payload.ownerDomain}:${payload.eventId}`;
}

function emptyDecision(
  reason: string,
  input: RadioScheduleInput,
  evaluations: readonly CandidateEvaluation[],
  coalescedItemIds: readonly string[],
  budget: RadioScheduleDecision["rollingBudget"],
): RadioScheduleDecision {
  return {
    item: null,
    speechOwner: "NONE",
    radioMusicGainDb: input.streamerSafe || !input.radioEnabled ? -80 : 0,
    scoreGainDb: 0,
    reason,
    interruptedItemId: null,
    coalescedItemIds,
    candidateEvaluations: evaluations,
    rollingBudget: budget,
    mechanicsMutated: false,
  };
}

function isVoiced(item: RadioItem): boolean {
  return item.contentType !== "MILESTONE_STING";
}

function isElective(item: RadioItem): boolean {
  return item.contentType === "DECORATIVE";
}

function historyType(item: RadioHistoryItem): RadioContentType {
  return item.contentType ?? "DECORATIVE";
}

export function scheduleRadio(input: RadioScheduleInput): RadioScheduleDecision {
  const nowEpoch = Date.parse(input.nowIso);
  if (!Number.isFinite(nowEpoch)) throw new Error("INVALID_NOW_ISO");

  const windowStart = input.nowSeconds - RADIO_LAWS.rollingWindowSeconds;
  const windowHistory = input.history.filter((entry) => entry.playedAtSeconds > windowStart && entry.playedAtSeconds < input.nowSeconds);
  const voicedHistory = windowHistory.filter((entry) => historyType(entry) !== "MILESTONE_STING");
  const electiveHistory = voicedHistory.filter((entry) => historyType(entry) === "DECORATIVE");
  const budget: RadioScheduleDecision["rollingBudget"] = {
    windowSeconds: 600,
    startsBefore: voicedHistory.length,
    voicedSecondsBefore: voicedHistory.reduce((sum, entry) => sum + (entry.durationSeconds ?? 0), 0),
    electiveStartsBefore: electiveHistory.length,
    electiveVoicedSecondsBefore: electiveHistory.reduce((sum, entry) => sum + (entry.durationSeconds ?? 0), 0),
  };

  const coalesced = coalesce(input.items);
  const retainedIds = new Set(coalesced.map((item) => item.id));
  const coalescedItemIds = input.items.filter((item) => !retainedIds.has(item.id)).map((item) => item.id).sort();
  const latestById = new Map<string, number>();
  for (const entry of input.history) latestById.set(entry.id, Math.max(latestById.get(entry.id) ?? -Infinity, entry.playedAtSeconds));
  const lastVoicedStart = input.history
    .filter((entry) => historyType(entry) !== "MILESTONE_STING")
    .reduce((latest, entry) => Math.max(latest, entry.playedAtSeconds), -Infinity);
  const latestCategory = new Map<string, number>();
  for (const entry of input.history) {
    if (entry.category !== undefined) latestCategory.set(entry.category, Math.max(latestCategory.get(entry.category) ?? -Infinity, entry.playedAtSeconds));
  }

  const evaluations: CandidateEvaluation[] = [];
  const eligible: RadioItem[] = [];
  for (const item of coalesced) {
    let reason = "ELIGIBLE";
    if (!input.radioEnabled && item.contentType !== "PA_HELP" && item.contentType !== "MILESTONE_STING") reason = "RADIO_DISABLED_ITEM_SUPPRESSED";
    else if (!item.dayparts.includes(input.daypart)) reason = "DAYPART_INELIGIBLE";
    else if (!item.presenters.includes(input.presenterId) && item.contentType !== "PA_HELP" && item.contentType !== "MILESTONE_STING") reason = "PRESENTER_INELIGIBLE";
    else if (!validateSpeakerRole(item)) reason = "SPEAKER_ROLE_INVALID";
    else if (!validateRadioItemPayloadContract(item)) reason = isTypedVoiceItem(item)
      ? "TYPED_PAYLOAD_INVALID_OR_DIVERGENT"
      : "NONFUNCTIONAL_ITEM_OWNS_FUNCTIONAL_FIELDS";
    else if (item.expiresAt !== null && (!validInstant(item.expiresAt) || Date.parse(item.expiresAt) <= nowEpoch)) reason = "EXPIRED";
    else if (item.captionText !== item.spokenText) reason = "CAPTION_SPOKEN_DIVERGENCE";
    else if (item.durationSeconds < 0 || !Number.isFinite(item.durationSeconds)) reason = "INVALID_DURATION";
    else if (input.streamerSafe && !item.streamerSafeEligible) reason = "STREAMER_SAFE_INELIGIBLE";
    else if (input.nowSeconds - (latestById.get(item.id) ?? -Infinity) < item.cooldownSeconds) reason = "EXACT_ITEM_COOLDOWN";
    else if (input.nowSeconds - (latestCategory.get(item.category) ?? -Infinity) < item.categoryCooldownSeconds) reason = "CATEGORY_COOLDOWN";
    else if (
      isVoiced(item) &&
      input.nowSeconds - lastVoicedStart < RADIO_LAWS.minimumStartSpacingSeconds &&
      !(item.contentType === "PA_HELP" && input.activeSpeech?.owner === "RADIO_VOICE" && input.activeSpeech.endsAtSeconds > input.nowSeconds)
    ) reason = "GLOBAL_START_SPACING";
    else if (isVoiced(item) && budget.startsBefore + 1 > RADIO_LAWS.maxStarts) reason = "ROLLING_START_BUDGET";
    else if (isVoiced(item) && budget.voicedSecondsBefore + item.durationSeconds > RADIO_LAWS.maxVoicedSeconds) reason = "ROLLING_VOICE_DURATION_BUDGET";
    else if (isElective(item) && budget.electiveStartsBefore + 1 > RADIO_LAWS.maxElectiveStarts) reason = "ROLLING_ELECTIVE_START_BUDGET";
    else if (isElective(item) && budget.electiveVoicedSecondsBefore + item.durationSeconds > RADIO_LAWS.maxElectiveVoicedSeconds) reason = "ROLLING_ELECTIVE_DURATION_BUDGET";
    else if (input.activeSpeech !== undefined && input.activeSpeech !== null && input.activeSpeech.endsAtSeconds > input.nowSeconds && item.contentType !== "PA_HELP") reason = "GLOBAL_SPEECH_OWNER_BUSY";
    evaluations.push({ id: item.id, eligible: reason === "ELIGIBLE", reason });
    if (reason === "ELIGIBLE") eligible.push(item);
  }

  eligible.sort((left, right) =>
    typePriority[right.contentType] - typePriority[left.contentType] ||
    right.priority - left.priority ||
    newestReceipt(right).localeCompare(newestReceipt(left)) ||
    left.id.localeCompare(right.id),
  );
  const item = eligible[0] ?? null;
  if (item === null) {
    const reason = !input.radioEnabled ? "RADIO_DISABLED_MECHANICS_UNCHANGED" :
      evaluations.some((entry) => entry.reason.includes("BUDGET") || entry.reason === "GLOBAL_START_SPACING") ? "SPEECH_BUDGET_REQUIRES_SILENCE" :
      "NO_ELIGIBLE_ITEM_SILENCE";
    return emptyDecision(reason, input, evaluations, coalescedItemIds, budget);
  }

  const speechOwner: SpeechOwner = item.contentType === "PA_HELP" ? "PA_HELP" : item.contentType === "MILESTONE_STING" ? "NONE" : "RADIO_VOICE";
  const interruptedItemId = item.contentType === "PA_HELP" && input.activeSpeech?.owner === "RADIO_VOICE" && input.activeSpeech.endsAtSeconds > input.nowSeconds
    ? input.activeSpeech.itemId
    : null;
  const reason = item.contentType === "PA_HELP"
    ? interruptedItemId === null ? "PA_SELECTED" : "PA_PREEMPTS_RADIO"
    : `${item.contentType}_SELECTED`;
  return {
    item,
    speechOwner,
    radioMusicGainDb: input.streamerSafe ? -80 : speechOwner === "PA_HELP" ? -22 : speechOwner === "RADIO_VOICE" ? -15 : 0,
    scoreGainDb: speechOwner === "PA_HELP" ? -18 : speechOwner === "RADIO_VOICE" ? -12 : 0,
    reason,
    interruptedItemId,
    coalescedItemIds,
    candidateEvaluations: evaluations,
    rollingBudget: budget,
    mechanicsMutated: false,
  };
}
