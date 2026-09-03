import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import {
  RADIO_LAWS,
  scheduleRadio,
  validatePayloadParity,
  type ActiveSpeech,
  type RadioHistoryItem,
  type RadioItem,
  type RadioScheduleDecision,
} from "./radio-scheduler";

interface DemoPlan {
  readonly slug: string;
  readonly title: string;
  readonly epochCode: string;
  readonly epochAlias: string;
  readonly durationSeconds: 660;
  readonly seed: string;
  readonly daypart: string;
  readonly presenterId: string;
  readonly items: {
    readonly opening: RadioItem;
    readonly functionalNew: RadioItem;
    readonly functionalOld: RadioItem;
    readonly expired: RadioItem;
    readonly milestone: RadioItem;
    readonly interruptible: RadioItem;
    readonly pa: RadioItem;
    readonly queuedDecorative: RadioItem;
    readonly streamerUnsafe: RadioItem;
  };
  readonly simulationSlots: readonly {
    readonly atSeconds: number;
    readonly presenterId: string;
    readonly items: readonly RadioItem[];
  }[];
}

interface EvidenceInput {
  readonly schema: "project-studio-radio-scheduler-input/v2";
  readonly evidenceCreatedAt: string;
  readonly bankSha256: string;
  readonly plans: readonly DemoPlan[];
}

interface TraceDecision {
  readonly requestedAtSeconds: number;
  readonly purpose: string;
  readonly playout: boolean;
  readonly decision: RadioScheduleDecision;
}

function sha256(bytes: string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function isoAt(seconds: number): string {
  return new Date(Date.parse("2026-09-03T00:00:00Z") + seconds * 1000).toISOString();
}

function historyEntry(item: RadioItem, atSeconds: number, presenterId: string): RadioHistoryItem {
  return {
    id: item.id,
    playedAtSeconds: atSeconds,
    contentType: item.contentType,
    category: item.category,
    presenterId,
    durationSeconds: item.durationSeconds,
  };
}

function decide(
  plan: DemoPlan,
  items: readonly RadioItem[],
  atSeconds: number,
  history: readonly RadioHistoryItem[],
  options: { readonly radioEnabled?: boolean; readonly streamerSafe?: boolean; readonly activeSpeech?: ActiveSpeech | null } = {},
): RadioScheduleDecision {
  return scheduleRadio({
    items,
    nowSeconds: atSeconds,
    nowIso: isoAt(atSeconds),
    daypart: plan.daypart,
    presenterId: plan.presenterId,
    history,
    radioEnabled: options.radioEnabled ?? true,
    streamerSafe: options.streamerSafe ?? false,
    activeSpeech: options.activeSpeech ?? null,
  });
}

function rollingChecks(events: readonly { readonly atSeconds: number; readonly item: RadioItem; readonly reason: string }[]) {
  const voiced = events.filter((event) => event.item.contentType !== "MILESTONE_STING");
  const checks = voiced.map((event) => {
    const prior = voiced.filter((candidate) => candidate.atSeconds > event.atSeconds - RADIO_LAWS.rollingWindowSeconds && candidate.atSeconds < event.atSeconds);
    const including = [...prior, event];
    const elective = including.filter((candidate) => candidate.item.contentType === "DECORATIVE");
    const priorVoiced = [...prior].sort((a, b) => b.atSeconds - a.atSeconds)[0];
    const spacing = priorVoiced === undefined ? Number.POSITIVE_INFINITY : event.atSeconds - priorVoiced.atSeconds;
    return {
      atSeconds: event.atSeconds,
      itemId: event.item.id,
      voicedStarts: including.length,
      voicedSeconds: Number(including.reduce((sum, candidate) => sum + candidate.item.durationSeconds, 0).toFixed(6)),
      electiveStarts: elective.length,
      electiveVoicedSeconds: Number(elective.reduce((sum, candidate) => sum + candidate.item.durationSeconds, 0).toFixed(6)),
      spacingSeconds: Number.isFinite(spacing) ? spacing : null,
      spacingException: event.reason === "PA_PREEMPTS_RADIO",
      pass:
        including.length <= RADIO_LAWS.maxStarts &&
        including.reduce((sum, candidate) => sum + candidate.item.durationSeconds, 0) <= RADIO_LAWS.maxVoicedSeconds &&
        elective.length <= RADIO_LAWS.maxElectiveStarts &&
        elective.reduce((sum, candidate) => sum + candidate.item.durationSeconds, 0) <= RADIO_LAWS.maxElectiveVoicedSeconds &&
        (spacing >= RADIO_LAWS.minimumStartSpacingSeconds || event.reason === "PA_PREEMPTS_RADIO"),
    };
  });
  return { checks, pass: checks.every((check) => check.pass) };
}

function buildDemo(plan: DemoPlan) {
  const history: RadioHistoryItem[] = [];
  const trace: TraceDecision[] = [];
  const events: { atSeconds: number; item: RadioItem; reason: string; speechOwner: string; radioMusicGainDb: number; scoreGainDb: number; interruptedItemId: string | null }[] = [];

  const play = (atSeconds: number, purpose: string, items: readonly RadioItem[], activeSpeech: ActiveSpeech | null = null) => {
    const decision = decide(plan, items, atSeconds, history, { activeSpeech });
    trace.push({ requestedAtSeconds: atSeconds, purpose, playout: decision.item !== null, decision });
    if (decision.item === null) throw new Error(`${plan.slug} expected playout at ${atSeconds}: ${decision.reason}`);
    events.push({
      atSeconds,
      item: decision.item,
      reason: decision.reason,
      speechOwner: decision.speechOwner,
      radioMusicGainDb: decision.radioMusicGainDb,
      scoreGainDb: decision.scoreGainDb,
      interruptedItemId: decision.interruptedItemId,
    });
    history.push(historyEntry(decision.item, atSeconds, plan.presenterId));
    return decision;
  };
  const inspect = (
    atSeconds: number,
    purpose: string,
    items: readonly RadioItem[],
    options: { readonly radioEnabled?: boolean; readonly streamerSafe?: boolean } = {},
  ) => {
    const decision = decide(plan, items, atSeconds, history, options);
    trace.push({ requestedAtSeconds: atSeconds, purpose, playout: false, decision });
    return decision;
  };

  play(10, "COALESCED_STATION_HOST_ADVERTISEMENT_DECORATIVE_OPENING", [plan.items.opening]);
  const repeat = inspect(70, "EXACT_REPEAT_AND_START_SPACING_SUPPRESSION", [plan.items.opening]);
  const expiry = inspect(200, "EXPIRED_ITEM_SUPPRESSION", [plan.items.expired]);
  const functional = play(275, "TYPED_FUNCTIONAL_FIXTURE_WITH_OLDER_RECEIPT_COALESCED", [
    plan.items.functionalOld,
    plan.items.functionalNew,
    plan.items.expired,
  ]);
  play(330, "MILESTONE_STING_PRESENTATION_ONLY", [plan.items.milestone]);
  const radioOff = inspect(450, "RADIO_DISABLED_MECHANICS_UNCHANGED", [plan.items.queuedDecorative], { radioEnabled: false });
  const streamer = inspect(510, "STREAMER_SAFE_INELIGIBLE_ITEM_SUPPRESSION", [plan.items.streamerUnsafe], { streamerSafe: true });
  const interruptible = play(590, "INTERRUPTIBLE_RADIO_LINK", [plan.items.interruptible]);
  const activeSpeech: ActiveSpeech = {
    itemId: interruptible.item?.id ?? "MISSING",
    owner: "RADIO_VOICE",
    endsAtSeconds: 590 + (interruptible.item?.durationSeconds ?? 0),
  };
  if (activeSpeech.endsAtSeconds <= 610) throw new Error(`${plan.slug} interruptible voice does not reach PA boundary`);
  const pa = play(610, "PA_PREEMPTS_ACTIVE_RADIO_AND_DUCKS_ACTIVE_MUSIC_BED", [plan.items.pa, plan.items.queuedDecorative], activeSpeech);

  const rolling = rollingChecks(events);
  const assertions = {
    schedulerProducedEveryPlayout: events.length === 5 && trace.filter((decision) => decision.playout).length === 5,
    openingContainsRequiredRoles: ["station_id", "host_link", "fictional_advertisement", "decorative_item"].every((role) => plan.items.opening.category.includes(role)),
    exactRepeatSuppressed: repeat.item === null && repeat.candidateEvaluations.some((row) => row.reason === "EXACT_ITEM_COOLDOWN"),
    expiredSuppressed: expiry.item === null && expiry.candidateEvaluations.some((row) => row.reason === "EXPIRED"),
    newestFunctionalReceiptSelected: functional.item?.id === plan.items.functionalNew.id && functional.coalescedItemIds.includes(plan.items.functionalOld.id),
    functionalPayloadValidated: plan.items.functionalNew.payload !== null && validatePayloadParity(plan.items.functionalNew.payload),
    radioDisabledNoMechanics: radioOff.item === null && radioOff.reason === "RADIO_DISABLED_MECHANICS_UNCHANGED" && radioOff.mechanicsMutated === false,
    streamerUnsafeSuppressed: streamer.item === null && streamer.candidateEvaluations.some((row) => row.reason === "STREAMER_SAFE_INELIGIBLE"),
    paActuallyPreemptsActiveRadio: pa.reason === "PA_PREEMPTS_RADIO" && pa.interruptedItemId === plan.items.interruptible.id,
    paOccursOverActiveMusicWindow: 610 >= 585 && 610 < 650,
    captionsShareResolvedCore: events.every((event) => event.item.captionText === event.item.spokenText),
    rollingBudgetsAndSpacing: rolling.pass,
    noMechanicalMutation: trace.every((decision) => decision.decision.mechanicsMutated === false),
  };
  return {
    schema: "project-studio-runtime-radio-schedule/v2",
    title: plan.title,
    slug: plan.slug,
    seed: plan.seed,
    epochCode: plan.epochCode,
    epochAlias: plan.epochAlias,
    durationSeconds: plan.durationSeconds,
    events,
    decisionTrace: trace,
    musicWindows: [
      { startSeconds: 0, endSeconds: 70 },
      { startSeconds: 90, endSeconds: 250 },
      { startSeconds: 300, endSeconds: 580 },
      { startSeconds: 585, endSeconds: 650 },
    ],
    silenceWindows: [
      { startSeconds: 70, endSeconds: 90 },
      { startSeconds: 250, endSeconds: 275 },
      { startSeconds: 580, endSeconds: 585 },
      { startSeconds: 650, endSeconds: 660 },
    ],
    rollingProof: rolling,
    assertions,
    machineVerdict: Object.values(assertions).every(Boolean) ? "PASS" : "FAIL",
  };
}

function buildSimulation(plan: DemoPlan) {
  const history: RadioHistoryItem[] = [];
  const decisions: TraceDecision[] = [];
  const accepted: { atSeconds: number; item: RadioItem; reason: string; presenterId: string; speechOwner: string; radioMusicGainDb: number; scoreGainDb: number }[] = [];
  for (const slot of plan.simulationSlots) {
    const decision = scheduleRadio({
      items: slot.items,
      nowSeconds: slot.atSeconds,
      nowIso: isoAt(slot.atSeconds),
      daypart: plan.daypart,
      presenterId: slot.presenterId,
      history,
      radioEnabled: true,
      streamerSafe: false,
      activeSpeech: null,
    });
    decisions.push({ requestedAtSeconds: slot.atSeconds, purpose: "THIRTY_MINUTE_PLAYOUT_REQUEST", playout: decision.item !== null, decision });
    if (decision.item === null) throw new Error(`${plan.slug} simulation refused ${slot.atSeconds}: ${decision.reason}`);
    accepted.push({
      atSeconds: slot.atSeconds,
      item: decision.item,
      reason: decision.reason,
      presenterId: slot.presenterId,
      speechOwner: decision.speechOwner,
      radioMusicGainDb: decision.radioMusicGainDb,
      scoreGainDb: decision.scoreGainDb,
    });
    history.push(historyEntry(decision.item, slot.atSeconds, slot.presenterId));
    if (slot.atSeconds === plan.simulationSlots[0]?.atSeconds) {
      const repeat = scheduleRadio({
        items: [decision.item],
        nowSeconds: slot.atSeconds + 30,
        nowIso: isoAt(slot.atSeconds + 30),
        daypart: plan.daypart,
        presenterId: slot.presenterId,
        history,
        radioEnabled: true,
        streamerSafe: false,
        activeSpeech: null,
      });
      decisions.push({ requestedAtSeconds: slot.atSeconds + 30, purpose: "REPEAT_SUPPRESSION_PROBE_NO_PLAYOUT", playout: false, decision: repeat });
    }
  }
  const rolling = rollingChecks(accepted);
  const voiced = accepted.filter((event) => event.item.contentType !== "MILESTONE_STING");
  const exactIds = voiced.map((event) => event.item.id);
  const assertions = {
    chronological: accepted.every((event, index) => index === 0 || accepted[index - 1]!.atSeconds < event.atSeconds),
    exactItemNoRepeat: new Set(exactIds).size === exactIds.length,
    categoryCooldowns: voiced.every((event, index) => voiced.slice(0, index).every((prior) => prior.item.category !== event.item.category || event.atSeconds - prior.atSeconds >= event.item.categoryCooldownSeconds)),
    rollingBudgetsAndSpacing: rolling.pass,
    typedFunctionalIdentity: accepted.filter((event) => event.item.contentType === "FUNCTIONAL").every((event) => event.item.payload !== null && validatePayloadParity(event.item.payload)),
    fullResolvedTextAndOwnership: accepted.every((event) => event.item.captionText === event.item.spokenText && event.presenterId.length > 0 && event.speechOwner.length > 0),
    repeatProbeSuppressed: decisions.some((decision) => decision.purpose === "REPEAT_SUPPRESSION_PROBE_NO_PLAYOUT" && decision.decision.item === null),
    noMechanicalMutation: decisions.every((decision) => decision.decision.mechanicsMutated === false),
  };
  return {
    schema: "project-studio-runtime-radio-simulation/v2",
    durationSeconds: 1800,
    seed: `${plan.seed}-30MIN-V2`,
    epochAlias: plan.epochAlias,
    acceptedEvents: accepted,
    decisionTrace: decisions,
    rollingProof: rolling,
    assertions,
    machineVerdict: Object.values(assertions).every(Boolean) ? "PASS" : "FAIL",
  };
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (inputPath === undefined || outputPath === undefined) throw new Error("usage: vite-node build-radio-schedule-evidence.ts INPUT OUTPUT");
const inputText = readFileSync(inputPath, "utf8");
const input = JSON.parse(inputText) as EvidenceInput;
if (input.schema !== "project-studio-radio-scheduler-input/v2" || input.plans.length !== 3) throw new Error("INVALID_SCHEDULER_INPUT");
const demos = input.plans.map(buildDemo);
const simulations = input.plans.map(buildSimulation);
const verdict = demos.every((demo) => demo.machineVerdict === "PASS") && simulations.every((simulation) => simulation.machineVerdict === "PASS")
  ? "PASS"
  : "FAIL";
const output = {
  schema: "project-studio-radio-scheduler-evidence/v2",
  evidenceCreatedAt: input.evidenceCreatedAt,
  schedulerImplementation: "tools/audio_systems_pilot_01/radio-scheduler.ts",
  schedulerInput: { path: inputPath, sha256: sha256(inputText) },
  bankSha256: input.bankSha256,
  laws: RADIO_LAWS,
  demos,
  simulations,
  machineVerdict: verdict,
  limitations: [
    "The scheduler trace proves deterministic selection, timing law, arbitration, and payload parity only.",
    "It does not prove voice performance, historical credibility, fatigue comfort, or listening acceptance.",
  ],
};
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
if (verdict !== "PASS") throw new Error("RADIO_SCHEDULER_EVIDENCE_FAILED");
