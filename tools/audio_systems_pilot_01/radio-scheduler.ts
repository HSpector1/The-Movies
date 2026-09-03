export type RadioContentType = "DECORATIVE" | "FUNCTIONAL" | "PA_HELP" | "MILESTONE_STING";

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
}

export interface RadioItem {
  readonly id: string;
  readonly contentType: RadioContentType;
  readonly dayparts: readonly string[];
  readonly presenters: readonly string[];
  readonly priority: number;
  readonly cooldownSeconds: number;
  readonly expiresAt: string | null;
  readonly coalesceKey: string | null;
  readonly captionText: string;
  readonly spokenText: string;
  readonly payload: FunctionalPayload | null;
}

export interface RadioHistoryItem {
  readonly id: string;
  readonly playedAtSeconds: number;
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
}

export interface RadioScheduleDecision {
  readonly item: RadioItem | null;
  readonly speechOwner: "NONE" | "RADIO_VOICE" | "PA_HELP";
  readonly radioMusicGainDb: number;
  readonly scoreGainDb: number;
  readonly reason: string;
  readonly mechanicsMutated: false;
}

const typePriority: Record<RadioContentType, number> = {
  PA_HELP: 4,
  FUNCTIONAL: 3,
  MILESTONE_STING: 2,
  DECORATIVE: 1,
};

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
      (item.priority === previous.priority && (item.payload?.receiptId ?? item.id) > (previous.payload?.receiptId ?? previous.id))
    ) keyed.set(item.coalesceKey, item);
  }
  return [...unkeyed, ...keyed.values()];
}

export function scheduleRadio(input: RadioScheduleInput): RadioScheduleDecision {
  if (!input.radioEnabled) {
    return { item: null, speechOwner: "NONE", radioMusicGainDb: -80, scoreGainDb: 0, reason: "RADIO_DISABLED_MECHANICS_UNCHANGED", mechanicsMutated: false };
  }
  const now = Date.parse(input.nowIso);
  const latestHistory = new Map(input.history.map((item) => [item.id, item.playedAtSeconds]));
  const eligible = coalesce(input.items).filter((item) => {
    if (!item.dayparts.includes(input.daypart) || !item.presenters.includes(input.presenterId)) return false;
    if (item.expiresAt !== null && Date.parse(item.expiresAt) <= now) return false;
    const last = latestHistory.get(item.id);
    return last === undefined || input.nowSeconds - last >= item.cooldownSeconds;
  });
  eligible.sort((left, right) =>
    typePriority[right.contentType] - typePriority[left.contentType] ||
    right.priority - left.priority ||
    left.id.localeCompare(right.id),
  );
  const item = eligible[0] ?? null;
  if (item === null) {
    return { item: null, speechOwner: "NONE", radioMusicGainDb: input.streamerSafe ? -80 : 0, scoreGainDb: 0, reason: "NO_ELIGIBLE_ITEM_SILENCE", mechanicsMutated: false };
  }
  const speechOwner = item.contentType === "PA_HELP" ? "PA_HELP" : item.contentType === "MILESTONE_STING" ? "NONE" : "RADIO_VOICE";
  return {
    item,
    speechOwner,
    radioMusicGainDb: input.streamerSafe ? -80 : speechOwner === "PA_HELP" ? -22 : speechOwner === "RADIO_VOICE" ? -15 : 0,
    scoreGainDb: speechOwner === "PA_HELP" ? -18 : speechOwner === "RADIO_VOICE" ? -12 : 0,
    reason: item.contentType === "PA_HELP" ? "PA_PREEMPTS_RADIO" : `${item.contentType}_SELECTED`,
    mechanicsMutated: false,
  };
}

export function validatePayloadParity(payload: FunctionalPayload): boolean {
  return payload.captionText === payload.spokenText &&
    payload.ownerDomain.length > 0 && payload.eventId.length > 0 && payload.receiptId.length > 0;
}

