import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ForwardedRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { ConstructionCompletionNotice } from "../components/ConstructionCompletionNotice.tsx";
import type { ConstructionCompletionSummary } from "../engine/adapter.ts";
import type {
  LotCadenceFeedback,
  LotNextEventReceipt,
  LotNextEventWorldTarget,
} from "./snapshot/nextEvent.ts";
import { sameLotNextEventReceipt } from "./snapshot/nextEvent.ts";

export type LotNextEventRailAction = {
  label: string;
  onActivate: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  testId?: string;
};

export type LotNextEventRailFeedback = Extract<
  LotCadenceFeedback,
  { kind: "next-event-exact" | "next-event-neutral" }
>;

export type LotNextEventRailProps = {
  feedback: LotNextEventRailFeedback;
  /** The already-authorized command that can be completed without leaving the Lot. */
  worldAction?: LotNextEventRailAction | null;
  /** A supporting route for detail that cannot be expressed fully in the world. */
  deepAction?: LotNextEventRailAction | null;
  /** Fresh current detail such as a production phase/blocker; never a cached receipt substitute. */
  reasonDetail?: ReactNode;
  /** Exact unchanged deep return: the first Lot surface already owned completion/live notice. */
  restored?: boolean;
  /** Modal/world suspension clears every held rail gesture and makes its controls inert. */
  inputSuspended?: boolean;
  /** Renderer/context generations clear held input without disabling semantic fallback controls. */
  inputResetEpoch?: number;
  onDismiss: () => void;
  /** Neutral feedback has no event heading owner, so the host restores the stable Lot heading. */
  onRequestLotHeadingFocus?: () => void;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  // Intl can render negative zero even though it has no useful player-facing meaning.
  return currency.format(Object.is(value, -0) ? 0 : value);
}

function CurrencyValue({ value }: { value: number }) {
  return <data value={String(value)}>{formatCurrency(value)}</data>;
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref !== null) {
    ref.current = value;
  }
}

function targetKey(target: LotNextEventWorldTarget): string {
  switch (target.kind) {
    case "script":
      return `script:${target.projectId}:${target.title}`;
    case "casting":
      return `casting:${target.sessionId}:${target.projectId}:${target.title}`;
    case "production":
      return `production:${target.productionId}:${target.title}:${target.location}`;
    case "run-completed":
      return `run-completed:${target.runs.map((run) => `${run.productionId}:${run.title}`).join("|")}`;
    case "cash":
      return "cash";
    case "contracts":
      return `contracts:${target.change}`;
    case "construction":
      return `construction:${target.projectId}:${target.facilityId}:${target.name}`;
  }
}

function presentationKey(feedback: LotNextEventRailFeedback): string {
  if (feedback.kind === "next-event-neutral") {
    return `neutral:${feedback.toWeek}:${feedback.cashNow}:${feedback.stopMessage ?? ""}`;
  }
  const { receipt } = feedback;
  return `exact:${receipt.fromWeek}:${receipt.toWeek}:${receipt.stopReason}:${targetKey(receipt.target)}`;
}

const EXACT_FEEDBACK_KEYS = ["kind", "receipt"] as const;
const NEUTRAL_FEEDBACK_KEYS = [
  "kind",
  "toWeek",
  "cashNow",
  "stopMessage",
  "constructionCompletion",
] as const;
const COMPLETION_KEYS = [
  "projectId",
  "facilityId",
  "name",
  "completedWeek",
  "message",
] as const;

function hasExactOwnKeys(value: object, expected: readonly string[]): boolean {
  const actual = Reflect.ownKeys(value);
  return (
    actual.length === expected.length &&
    expected.every((key) => Object.prototype.hasOwnProperty.call(value, key))
  );
}

function cloneTarget(target: LotNextEventWorldTarget): LotNextEventWorldTarget {
  if (target.kind === "run-completed") {
    return {
      ...target,
      runs: target.runs.map((run) => ({ ...run })),
    };
  }
  return { ...target };
}

function cloneCompletion(
  completion: ConstructionCompletionSummary | null,
): ConstructionCompletionSummary | null {
  return completion === null ? null : { ...completion };
}

function captureFeedback(
  feedback: LotNextEventRailFeedback,
): LotNextEventRailFeedback {
  if (feedback.kind === "next-event-neutral") {
    return {
      ...feedback,
      constructionCompletion: cloneCompletion(feedback.constructionCompletion),
    };
  }
  const { receipt } = feedback;
  return {
    kind: "next-event-exact",
    receipt: {
      ...receipt,
      summary: { ...receipt.summary },
      completedRuns: receipt.completedRuns.map((run) => ({ ...run })),
      constructionCompletion: cloneCompletion(receipt.constructionCompletion),
      target: cloneTarget(receipt.target),
    },
  };
}

function isClosedCompletion(
  completion: ConstructionCompletionSummary | null,
): boolean {
  return (
    completion !== null &&
    hasExactOwnKeys(completion, COMPLETION_KEYS) &&
    typeof completion.projectId === "string" &&
    completion.projectId.trim().length > 0 &&
    typeof completion.facilityId === "string" &&
    completion.facilityId.trim().length > 0 &&
    typeof completion.name === "string" &&
    completion.name.trim().length > 0 &&
    Number.isSafeInteger(completion.completedWeek) &&
    completion.completedWeek >= 0 &&
    typeof completion.message === "string" &&
    completion.message.trim().length > 0
  );
}

function isClosedNeutralFeedback(
  feedback: Extract<LotNextEventRailFeedback, { kind: "next-event-neutral" }>,
): boolean {
  return (
    hasExactOwnKeys(feedback, NEUTRAL_FEEDBACK_KEYS) &&
    Number.isSafeInteger(feedback.toWeek) &&
    feedback.toWeek >= 0 &&
    Number.isFinite(feedback.cashNow) &&
    (feedback.stopMessage === null ||
      (typeof feedback.stopMessage === "string" &&
        feedback.stopMessage.trim().length > 0)) &&
    (feedback.constructionCompletion === null ||
      (isClosedCompletion(feedback.constructionCompletion) &&
        feedback.constructionCompletion.completedWeek === feedback.toWeek))
  );
}

function sameCompletion(
  left: ConstructionCompletionSummary | null,
  right: ConstructionCompletionSummary | null,
): boolean {
  if (left === null || right === null) return left === right;
  return (
    isClosedCompletion(left) &&
    isClosedCompletion(right) &&
    left.projectId === right.projectId &&
    left.facilityId === right.facilityId &&
    left.name === right.name &&
    left.completedWeek === right.completedWeek &&
    left.message === right.message
  );
}

function sameFeedback(
  captured: LotNextEventRailFeedback,
  current: LotNextEventRailFeedback,
): boolean {
  if (captured.kind !== current.kind) return false;
  if (
    captured.kind === "next-event-exact" &&
    current.kind === "next-event-exact"
  ) {
    return (
      hasExactOwnKeys(captured, EXACT_FEEDBACK_KEYS) &&
      hasExactOwnKeys(current, EXACT_FEEDBACK_KEYS) &&
      sameLotNextEventReceipt(captured.receipt, current.receipt)
    );
  }
  if (
    captured.kind !== "next-event-neutral" ||
    current.kind !== "next-event-neutral"
  )
    return false;
  return (
    isClosedNeutralFeedback(captured) &&
    isClosedNeutralFeedback(current) &&
    captured.toWeek === current.toWeek &&
    Object.is(captured.cashNow, current.cashNow) &&
    captured.stopMessage === current.stopMessage &&
    sameCompletion(
      captured.constructionCompletion,
      current.constructionCompletion,
    )
  );
}

/**
 * The rail's subtitle line.
 *
 * M-B copy law: an id is provenance, not language. Every branch below used to print the
 * raw engine identifier a player never chose and cannot act on ("Project script-0000 ·
 * Session casting-0000" was the exact string the cold playtest reported). The identity of
 * an event to a player is its PICTURE and its PLACE, both already carried by the target;
 * the ids remain on the receipt and in the panels' `data-*` provenance attributes.
 */
function ReasonIdentity({ target }: { target: LotNextEventWorldTarget }) {
  switch (target.kind) {
    case "script":
      return (
        <div
          className="lot-next-event-identity"
          data-testid="lot-next-event-identity"
        >
          <span className="lot-next-event-kicker">Screenplay review</span>
          <strong>{target.title}</strong>
          <span>Waiting for your decision at Development</span>
        </div>
      );
    case "casting":
      return (
        <div
          className="lot-next-event-identity"
          data-testid="lot-next-event-identity"
        >
          <span className="lot-next-event-kicker">Casting review</span>
          <strong>{target.title}</strong>
          <span>The camera tests are in, at Casting</span>
        </div>
      );
    case "production":
      return (
        <div
          className="lot-next-event-identity"
          data-testid="lot-next-event-identity"
        >
          <span className="lot-next-event-kicker">Production decision</span>
          <strong>{target.title}</strong>
          <span>
            {target.location === "stage-7" ? "Soundstage 7" : "Soundstage 12"}
          </span>
        </div>
      );
    case "run-completed":
      return (
        <div
          className="lot-next-event-identity"
          data-testid="lot-next-event-identity"
        >
          <span className="lot-next-event-kicker">
            Theatrical run completed
          </span>
          <ul className="lot-next-event-runs">
            {target.runs.map((run) => (
              <li key={run.productionId}>
                <strong>{run.title}</strong>
                <span>Its theatrical run has finished</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "cash":
      return (
        <div
          className="lot-next-event-identity"
          data-testid="lot-next-event-identity"
        >
          <span className="lot-next-event-kicker">Cash threshold</span>
          <strong>Studio cash crossed below $0</strong>
        </div>
      );
    case "contracts":
      return (
        <div
          className="lot-next-event-identity"
          data-testid="lot-next-event-identity"
        >
          <span className="lot-next-event-kicker">Studio contracts</span>
          <strong>
            {target.change === "expired"
              ? "A talent contract ended"
              : "A renewal window opened"}
          </strong>
        </div>
      );
    case "construction":
      return (
        <div
          className="lot-next-event-identity"
          data-testid="lot-next-event-identity"
        >
          <span className="lot-next-event-kicker">Studio development</span>
          <strong>{target.name}</strong>
          <span>Construction on the lot has finished</span>
        </div>
      );
  }
}

type SummaryRow = {
  label: string;
  value: number;
  explanation?: string;
  count?: boolean;
};

function PeriodAccounting({ receipt }: { receipt: LotNextEventReceipt }) {
  const { summary } = receipt;
  const rows: SummaryRow[] = [
    { label: "Studio Revenue", value: summary.studioRevenue },
    {
      label: "Legacy box-office lump",
      value: summary.boxOfficeLump,
      explanation:
        "Disengaged compatibility truth; not engaged Studio Revenue.",
    },
    { label: "Payroll", value: summary.payroll },
    { label: "Overhead", value: summary.overhead },
    { label: "Production spend", value: summary.production },
    { label: "Publicity", value: summary.publicity },
    { label: "Studio construction", value: summary.construction },
    {
      label: "Other cash",
      value: summary.otherCash,
      explanation: "Signing bonuses, freelancer fees, and termination.",
    },
    { label: "Net this period", value: summary.netCash },
    { label: "Releases", value: summary.releases, count: true },
    { label: "Runs completed", value: summary.completedRuns, count: true },
    { label: "Cash now", value: receipt.cashNow },
  ];

  return (
    <details
      className="lot-next-event-accounting"
      data-testid="lot-next-event-accounting"
    >
      <summary>Period accounting</summary>
      <p className="lot-next-event-accounting-range">
        Ledger weeks {summary.fromWeek}–{summary.toWeekInclusive} ·{" "}
        {summary.weeks} {summary.weeks === 1 ? "week" : "weeks"}
      </p>
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            data-testid={`lot-next-event-${row.label.toLowerCase().replaceAll(" ", "-")}`}
          >
            <dt>
              {row.label}
              {row.explanation && <small>{row.explanation}</small>}
            </dt>
            <dd>
              {row.count ? row.value : <CurrencyValue value={row.value} />}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

type RailActionSlot = "world" | "deep" | "dismiss";
type RailStartFamily = "pointer" | "mouse" | "touch" | "keyboard";

type CapturedRailAction = {
  slot: RailActionSlot;
  label: string;
  disabled: boolean;
  ariaLabel: string | null;
  testId: string;
  activate: () => void;
};

type CapturedRailPresentation = {
  family: RailStartFamily;
  feedback: LotNextEventRailFeedback;
  action: CapturedRailAction;
};

type HeldRailKey = {
  slot: RailActionSlot;
  key: "Enter" | " ";
};

function capturedAction(
  slot: Exclude<RailActionSlot, "dismiss">,
  action: LotNextEventRailAction,
): CapturedRailAction {
  return {
    slot,
    label: action.label,
    disabled: action.disabled === true,
    ariaLabel: action.ariaLabel ?? null,
    testId: action.testId ?? `lot-next-event-${slot}-action`,
    activate: action.onActivate,
  };
}

function capturedDismiss(onDismiss: () => void): CapturedRailAction {
  return {
    slot: "dismiss",
    label: "Dismiss",
    disabled: false,
    ariaLabel: null,
    testId: "lot-next-event-dismiss",
    activate: onDismiss,
  };
}

function sameActionPresentation(
  captured: CapturedRailAction,
  current: CapturedRailAction,
): boolean {
  return (
    captured.slot === current.slot &&
    captured.label === current.label &&
    captured.disabled === current.disabled &&
    captured.ariaLabel === current.ariaLabel &&
    captured.testId === current.testId
  );
}

type RailInteractionBoundary = {
  onPointerDown: (event: SyntheticEvent<HTMLButtonElement>) => void;
  onMouseDown: (event: SyntheticEvent<HTMLButtonElement>) => void;
  onTouchStart: (event: SyntheticEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: SyntheticEvent<HTMLButtonElement>) => void;
  onTouchCancel: (event: SyntheticEvent<HTMLButtonElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onBlur: (event: SyntheticEvent<HTMLButtonElement>) => void;
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
};

function RailAction({
  action,
  kind,
  boundary,
  inputSuspended,
}: {
  action: LotNextEventRailAction;
  kind: "world" | "deep";
  boundary: RailInteractionBoundary;
  inputSuspended: boolean;
}) {
  return (
    <button
      type="button"
      className={
        kind === "world"
          ? "primary lot-next-event-action"
          : "ghost lot-next-event-action"
      }
      disabled={inputSuspended || action.disabled}
      aria-label={action.ariaLabel}
      data-testid={action.testId ?? `lot-next-event-${kind}-action`}
      {...boundary}
    >
      {action.label}
    </button>
  );
}

function containWorldInput(event: SyntheticEvent) {
  event.stopPropagation();
}

/**
 * A bounded semantic receipt attached to the live Lot. Simulation stays App/Engine-owned;
 * this component only presents an already-validated exact or neutral cadence result.
 */
export const LotNextEventRail = forwardRef<
  HTMLHeadingElement,
  LotNextEventRailProps
>(function LotNextEventRail(
  {
    feedback,
    worldAction = null,
    deepAction = null,
    reasonDetail,
    restored = false,
    inputSuspended = false,
    inputResetEpoch = 0,
    onDismiss,
    onRequestLotHeadingFocus,
  },
  forwardedHeadingRef,
) {
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const focusedPresentationRef = useRef<string | null>(null);
  const capturedPresentationRef = useRef<CapturedRailPresentation | null>(null);
  const heldKeyRef = useRef<HeldRailKey | null>(null);
  const inputSuspendedRef = useRef(inputSuspended);
  inputSuspendedRef.current = inputSuspended;
  const presentationClaimedRef = useRef(false);
  const presentationClaimEpochRef = useRef(0);
  const keyboardSettlementTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const keyboardSettlementEpochRef = useRef(0);
  const virtualTailSealedRef = useRef(false);
  const virtualTailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const virtualTailEpochRef = useRef(0);
  const physicalStartSuppressedRef = useRef(false);
  const physicalStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const physicalStartEpochRef = useRef(0);
  const physicalPrimaryBoundaryRequiredRef = useRef(false);
  const previouslySuspendedRef = useRef(inputSuspended);
  const previousInputResetEpochRef = useRef(inputResetEpoch);
  const documentWasHiddenRef = useRef(false);
  const key = `${presentationKey(feedback)}:${restored ? "restored" : "fresh"}`;
  const receipt =
    feedback.kind === "next-event-exact" ? feedback.receipt : null;
  const neutralFeedback =
    feedback.kind === "next-event-neutral" ? feedback : null;
  const receiptCompletion =
    feedback.kind === "next-event-exact"
      ? feedback.receipt.constructionCompletion
      : feedback.constructionCompletion;
  const completion = restored ? null : receiptCompletion;

  const setHeadingRef = useCallback(
    (node: HTMLHeadingElement | null) => {
      headingRef.current = node;
      assignRef(forwardedHeadingRef, node);
    },
    [forwardedHeadingRef],
  );

  useEffect(() => {
    if (inputSuspended) return;
    if (focusedPresentationRef.current === key) return;
    focusedPresentationRef.current = key;
    if (completion !== null) return;
    if (feedback.kind === "next-event-exact") {
      headingRef.current?.focus();
    } else {
      onRequestLotHeadingFocus?.();
    }
  }, [
    completion,
    feedback.kind,
    inputSuspended,
    key,
    onRequestLotHeadingFocus,
  ]);

  const cancelKeyboardSettlement = useCallback(() => {
    keyboardSettlementEpochRef.current += 1;
    if (keyboardSettlementTimerRef.current !== null) {
      clearTimeout(keyboardSettlementTimerRef.current);
      keyboardSettlementTimerRef.current = null;
    }
  }, []);

  const clearVirtualTailSeal = useCallback(() => {
    virtualTailEpochRef.current += 1;
    virtualTailSealedRef.current = false;
    if (virtualTailTimerRef.current !== null) {
      clearTimeout(virtualTailTimerRef.current);
      virtualTailTimerRef.current = null;
    }
  }, []);

  const sealVirtualTailForTask = useCallback(() => {
    virtualTailSealedRef.current = true;
    const epoch = ++virtualTailEpochRef.current;
    if (virtualTailTimerRef.current !== null) {
      clearTimeout(virtualTailTimerRef.current);
    }
    virtualTailTimerRef.current = setTimeout(() => {
      if (virtualTailEpochRef.current === epoch) {
        virtualTailSealedRef.current = false;
        virtualTailTimerRef.current = null;
      }
    }, 0);
  }, []);

  const clearPhysicalStartSuppression = useCallback(() => {
    physicalStartEpochRef.current += 1;
    physicalStartSuppressedRef.current = false;
    if (physicalStartTimerRef.current !== null) {
      clearTimeout(physicalStartTimerRef.current);
      physicalStartTimerRef.current = null;
    }
  }, []);

  const suppressPhysicalStartsForTask = useCallback(() => {
    physicalStartSuppressedRef.current = true;
    const epoch = ++physicalStartEpochRef.current;
    if (physicalStartTimerRef.current !== null) {
      clearTimeout(physicalStartTimerRef.current);
    }
    physicalStartTimerRef.current = setTimeout(() => {
      if (physicalStartEpochRef.current === epoch) {
        physicalStartSuppressedRef.current = false;
        physicalStartTimerRef.current = null;
      }
    }, 0);
  }, []);

  const claimPresentationTurn = useCallback((): boolean => {
    if (presentationClaimedRef.current) return false;
    presentationClaimedRef.current = true;
    const epoch = ++presentationClaimEpochRef.current;
    queueMicrotask(() => {
      if (presentationClaimEpochRef.current === epoch) {
        presentationClaimedRef.current = false;
      }
    });
    return true;
  }, []);

  const clearAllInput = useCallback(
    (sealVirtualTail: boolean) => {
      const heldPhysicalStart =
        capturedPresentationRef.current !== null &&
        capturedPresentationRef.current.family !== "keyboard";
      capturedPresentationRef.current = null;
      heldKeyRef.current = null;
      cancelKeyboardSettlement();
      presentationClaimEpochRef.current += 1;
      presentationClaimedRef.current = false;
      if (sealVirtualTail) sealVirtualTailForTask();
      else clearVirtualTailSeal();
      if (sealVirtualTail || heldPhysicalStart) suppressPhysicalStartsForTask();
    },
    [
      cancelKeyboardSettlement,
      clearVirtualTailSeal,
      sealVirtualTailForTask,
      suppressPhysicalStartsForTask,
    ],
  );

  useLayoutEffect(() => {
    if (previousInputResetEpochRef.current === inputResetEpoch) return;
    previousInputResetEpochRef.current = inputResetEpoch;
    physicalPrimaryBoundaryRequiredRef.current = true;
    clearAllInput(true);
  }, [clearAllInput, inputResetEpoch]);

  const scheduleKeyboardSettlement = useCallback(
    (key?: string) => {
      const held = heldKeyRef.current;
      if (held === null || (key !== undefined && held.key !== key)) return;
      const captured = capturedPresentationRef.current;
      cancelKeyboardSettlement();
      const epoch = ++keyboardSettlementEpochRef.current;
      keyboardSettlementTimerRef.current = setTimeout(() => {
        if (keyboardSettlementEpochRef.current !== epoch) return;
        keyboardSettlementTimerRef.current = null;
        if (heldKeyRef.current === held) heldKeyRef.current = null;
        if (
          capturedPresentationRef.current === captured &&
          captured?.family === "keyboard"
        ) {
          capturedPresentationRef.current = null;
        }
        sealVirtualTailForTask();
      }, 0);
    },
    [cancelKeyboardSettlement, sealVirtualTailForTask],
  );

  useEffect(() => {
    const onDocumentKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        scheduleKeyboardSettlement(event.key);
      }
    };
    const onVisibility = () => {
      const hidden = document.hidden;
      if (hidden || documentWasHiddenRef.current) {
        physicalPrimaryBoundaryRequiredRef.current = true;
        clearAllInput(true);
      }
      documentWasHiddenRef.current = hidden;
    };
    document.addEventListener("keyup", onDocumentKeyUp, true);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    return () => {
      document.removeEventListener("keyup", onDocumentKeyUp, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [clearAllInput, scheduleKeyboardSettlement]);

  useEffect(() => {
    if (inputSuspended || previouslySuspendedRef.current) {
      physicalPrimaryBoundaryRequiredRef.current = true;
      clearAllInput(true);
    }
    previouslySuspendedRef.current = inputSuspended;
  }, [clearAllInput, inputSuspended]);

  useEffect(
    () => () => {
      capturedPresentationRef.current = null;
      heldKeyRef.current = null;
      presentationClaimEpochRef.current += 1;
      presentationClaimedRef.current = false;
      cancelKeyboardSettlement();
      clearVirtualTailSeal();
      clearPhysicalStartSuppression();
    },
    [
      cancelKeyboardSettlement,
      clearPhysicalStartSuppression,
      clearVirtualTailSeal,
    ],
  );

  const captureStart = (
    event: SyntheticEvent<HTMLButtonElement>,
    action: CapturedRailAction,
    family: Exclude<RailStartFamily, "keyboard">,
  ) => {
    containWorldInput(event);
    if (
      inputSuspendedRef.current ||
      document.hidden ||
      action.disabled ||
      presentationClaimedRef.current ||
      physicalStartSuppressedRef.current ||
      (physicalPrimaryBoundaryRequiredRef.current && family !== "pointer") ||
      capturedPresentationRef.current !== null ||
      heldKeyRef.current !== null
    ) {
      return;
    }
    cancelKeyboardSettlement();
    clearVirtualTailSeal();
    if (family === "pointer") {
      physicalPrimaryBoundaryRequiredRef.current = false;
    }
    capturedPresentationRef.current = {
      family,
      feedback: captureFeedback(feedback),
      action,
    };
  };

  const cancelStart = (
    event: SyntheticEvent<HTMLButtonElement>,
    action: CapturedRailAction,
  ) => {
    containWorldInput(event);
    const captured = capturedPresentationRef.current;
    if (
      captured !== null &&
      captured.family !== "keyboard" &&
      captured.action.slot === action.slot
    ) {
      physicalPrimaryBoundaryRequiredRef.current = true;
      capturedPresentationRef.current = null;
      suppressPhysicalStartsForTask();
    }
  };

  const captureSemanticKey = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    action: CapturedRailAction,
  ) => {
    containWorldInput(event);
    if (event.key !== "Enter" && event.key !== " ") return;
    if (
      inputSuspendedRef.current ||
      document.hidden ||
      action.disabled ||
      event.repeat ||
      presentationClaimedRef.current ||
      heldKeyRef.current !== null ||
      capturedPresentationRef.current !== null
    ) {
      event.preventDefault();
      return;
    }
    cancelKeyboardSettlement();
    clearVirtualTailSeal();
    heldKeyRef.current = { slot: action.slot, key: event.key };
    capturedPresentationRef.current = {
      family: "keyboard",
      feedback: captureFeedback(feedback),
      action,
    };
    // The native button remains the sole dispatcher. The document-level keyup
    // settles in a later task so Space's post-keyup native click keeps its token.
  };

  const containSemanticKeyUp = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    containWorldInput(event);
  };

  const cancelActionStart = (
    event: SyntheticEvent<HTMLButtonElement>,
    action: CapturedRailAction,
  ) => {
    containWorldInput(event);
    const captured = capturedPresentationRef.current;
    const held = heldKeyRef.current;
    if (captured?.action.slot === action.slot || held?.slot === action.slot) {
      const heldPhysicalStart =
        captured !== null && captured.family !== "keyboard";
      capturedPresentationRef.current = null;
      heldKeyRef.current = null;
      cancelKeyboardSettlement();
      sealVirtualTailForTask();
      if (heldPhysicalStart) {
        physicalPrimaryBoundaryRequiredRef.current = true;
        suppressPhysicalStartsForTask();
      }
    }
  };

  const consumeAndSeal = () => {
    capturedPresentationRef.current = null;
    heldKeyRef.current = null;
    cancelKeyboardSettlement();
    sealVirtualTailForTask();
    suppressPhysicalStartsForTask();
    claimPresentationTurn();
  };

  const dispatchClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    currentAction: CapturedRailAction,
  ) => {
    containWorldInput(event);
    if (
      inputSuspendedRef.current ||
      document.hidden ||
      currentAction.disabled
    ) {
      clearAllInput(true);
      return;
    }
    if (event.detail > 1) {
      consumeAndSeal();
      return;
    }
    if (presentationClaimedRef.current) return;

    const captured = capturedPresentationRef.current;
    capturedPresentationRef.current = null;
    let acceptedAction: CapturedRailAction;
    if (captured !== null) {
      if (
        !sameActionPresentation(captured.action, currentAction) ||
        !sameFeedback(captured.feedback, feedback)
      ) {
        consumeAndSeal();
        return;
      }
      acceptedAction = captured.action;
    } else {
      // A detail-zero click with no start token is the fresh AT/switch path.
      // Physical/compatibility tails must prove their contained start.
      if (
        event.detail !== 0 ||
        heldKeyRef.current !== null ||
        virtualTailSealedRef.current
      ) {
        return;
      }
      const virtualFeedback = captureFeedback(feedback);
      if (!sameFeedback(virtualFeedback, feedback)) return;
      acceptedAction = currentAction;
    }

    if (!claimPresentationTurn()) return;
    acceptedAction.activate();
  };

  const boundaryFor = (
    action: CapturedRailAction,
  ): RailInteractionBoundary => ({
    onPointerDown: (event) => captureStart(event, action, "pointer"),
    onMouseDown: (event) => captureStart(event, action, "mouse"),
    onTouchStart: (event) => captureStart(event, action, "touch"),
    onPointerCancel: (event) => cancelStart(event, action),
    onTouchCancel: (event) => cancelStart(event, action),
    onKeyDown: (event) => captureSemanticKey(event, action),
    onKeyUp: containSemanticKeyUp,
    onBlur: (event) => cancelActionStart(event, action),
    onClick: (event) => dispatchClick(event, action),
  });

  return (
    <section
      className={`lot-next-event-rail ${receipt === null ? "is-neutral" : "is-exact"}`}
      aria-labelledby={headingId}
      data-testid="lot-next-event-rail"
      data-feedback-kind={feedback.kind}
      inert={inputSuspended || undefined}
      onPointerDown={containWorldInput}
      onMouseDown={containWorldInput}
      onTouchStart={containWorldInput}
    >
      {receipt !== null ? (
        <>
          <header className="lot-next-event-header">
            <p className="lot-next-event-overline">Studio Chronicle</p>
            <h2 id={headingId} ref={setHeadingRef} tabIndex={-1}>
              NEXT EVENT
            </h2>
          </header>

          <p
            className="lot-next-event-message"
            data-testid="lot-next-event-stop-message"
          >
            {receipt.stopMessage}
          </p>

          <dl className="lot-next-event-facts" aria-label="Simulation result">
            <div>
              <dt>From week</dt>
              <dd>{receipt.fromWeek}</dd>
            </div>
            <div>
              <dt>To week</dt>
              <dd>{receipt.toWeek}</dd>
            </div>
            <div>
              <dt>Advanced</dt>
              <dd>
                {receipt.weeks} {receipt.weeks === 1 ? "week" : "weeks"}
              </dd>
            </div>
            <div>
              <dt>Cash now</dt>
              <dd>
                <CurrencyValue value={receipt.cashNow} />
              </dd>
            </div>
          </dl>

          <ReasonIdentity target={receipt.target} />
          {receipt.target.kind !== "construction" && reasonDetail && (
            <div
              className="lot-next-event-reason-detail"
              data-testid="lot-next-event-reason-detail"
            >
              {reasonDetail}
            </div>
          )}

          {completion !== null && (
            <ConstructionCompletionNotice completion={completion} />
          )}

          {(worldAction !== null || deepAction !== null) && (
            <div
              className="lot-next-event-actions"
              aria-label="Next event actions"
            >
              {worldAction !== null && (
                <RailAction
                  action={worldAction}
                  kind="world"
                  boundary={boundaryFor(capturedAction("world", worldAction))}
                  inputSuspended={inputSuspended}
                />
              )}
              {deepAction !== null && (
                <RailAction
                  action={deepAction}
                  kind="deep"
                  boundary={boundaryFor(capturedAction("deep", deepAction))}
                  inputSuspended={inputSuspended}
                />
              )}
            </div>
          )}

          <PeriodAccounting receipt={receipt} />

          {completion === null && !restored && (
            <p
              className="visually-hidden"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              data-testid="lot-next-event-announcement"
            >
              {receipt.stopMessage} Final week {receipt.toWeek}.
            </p>
          )}
        </>
      ) : neutralFeedback !== null ? (
        <>
          <h2 id={headingId} ref={setHeadingRef} tabIndex={-1}>
            Week {neutralFeedback.toWeek}. The studio advanced to the next
            event.
          </h2>
          {neutralFeedback.stopMessage !== null && (
            <p
              className="lot-next-event-message"
              data-testid="lot-next-event-stop-message"
            >
              {neutralFeedback.stopMessage}
            </p>
          )}
          <p className="lot-next-event-neutral-cash">
            Cash now <CurrencyValue value={neutralFeedback.cashNow} />
          </p>
          {completion !== null && (
            <ConstructionCompletionNotice completion={completion} />
          )}
          {completion === null && (
            <p
              className="visually-hidden"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              data-testid="lot-next-event-neutral-announcement"
            >
              {neutralFeedback.stopMessage === null
                ? `Week ${neutralFeedback.toWeek}. The studio advanced to the next event.`
                : `${neutralFeedback.stopMessage} Final week ${neutralFeedback.toWeek}.`}
            </p>
          )}
        </>
      ) : null}

      <button
        type="button"
        className="ghost lot-next-event-dismiss"
        data-testid="lot-next-event-dismiss"
        disabled={inputSuspended}
        {...boundaryFor(capturedDismiss(onDismiss))}
      >
        Dismiss
      </button>
    </section>
  );
});
