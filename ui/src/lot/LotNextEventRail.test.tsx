import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ConstructionCompletionSummary,
  PeriodSummary,
} from "../engine/adapter.ts";
import { LotNextEventRail } from "./LotNextEventRail.tsx";
import type {
  LotNextEventReceipt,
  LotNextEventWorldTarget,
} from "./snapshot/nextEvent.ts";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const summary: PeriodSummary = {
  fromWeek: 10,
  toWeekInclusive: 12,
  weeks: 3,
  studioRevenue: 1_000.5,
  boxOfficeLump: 250.25,
  payroll: -300.75,
  overhead: -125.5,
  production: -700.25,
  publicity: -40.5,
  construction: -2_000.25,
  otherCash: -55.5,
  netCash: -1_971.999,
  releases: 0,
  completedRuns: 0,
};

function exactReceipt(
  target: LotNextEventWorldTarget = {
    kind: "production",
    productionId: "prod-44",
    title: "A Fraction of Midnight",
    location: "stage-12-semantic",
  },
): LotNextEventReceipt {
  return {
    fromWeek: 10,
    toWeek: 13,
    weeks: 3,
    stopReason:
      target.kind === "production" ? "productionDecision" : "runCompleted",
    stopMessage:
      "Stopped at Week 13: A Fraction of Midnight needs a production decision.",
    summary,
    cashNow: 1_234.5,
    completedRuns: [],
    constructionCompletion: null,
    target,
  };
}

function validExactReceipt(cashNow = 1_234.5): LotNextEventReceipt {
  return {
    ...exactReceipt(),
    summary: {
      ...summary,
      releases: 0,
      completedRuns: 0,
    },
    cashNow,
  };
}

const completion: ConstructionCompletionSummary = {
  projectId: "construction-development-casting-annex",
  facilityId: "facility-development-casting-annex",
  name: "Development & Casting Annex",
  completedWeek: 13,
  message:
    "Development & Casting Annex is Operational in Week 13. One shared Development & Casting slot is now available.",
};

describe("LotNextEventRail", () => {
  it("presents the exact receipt, complete accounting, and world-before-deep action order", async () => {
    const world = vi.fn();
    const deep = vi.fn();
    const dismiss = vi.fn();
    const headingRef = { current: null as HTMLHeadingElement | null };
    const feedback = {
      kind: "next-event-exact" as const,
      receipt: exactReceipt(),
    };
    const view = render(
      <LotNextEventRail
        ref={headingRef}
        feedback={feedback}
        reasonDetail={
          <p>Shooting · Decision required · Director call required</p>
        }
        worldAction={{
          label: "Call director to Soundstage 12",
          onActivate: world,
        }}
        deepAction={{
          label: "Open Production Board details",
          onActivate: deep,
        }}
        onDismiss={dismiss}
      />,
    );

    const rail = screen.getByTestId("lot-next-event-rail");
    expect(screen.getByRole("heading", { level: 2, name: "NEXT EVENT" })).toBe(
      headingRef.current,
    );
    await waitFor(() => expect(headingRef.current).toHaveFocus());
    expect(screen.getByTestId("lot-next-event-stop-message")).toHaveTextContent(
      feedback.receipt.stopMessage,
    );
    expect(rail).toHaveTextContent("From week10");
    expect(rail).toHaveTextContent("To week13");
    expect(rail).toHaveTextContent("Advanced3 weeks");
    expect(rail).toHaveTextContent("$1,234.50");
    expect(rail).toHaveTextContent("A Fraction of Midnight");
    expect(rail).toHaveTextContent("Soundstage 12");
    // M-B copy law: the rail names the picture and its PLACE, never the engine id. The
    // id stays in the receipt the rail is built from, asserted structurally elsewhere.
    expect(rail).not.toHaveTextContent("prod-44");
    expect(
      screen.getByTestId("lot-next-event-reason-detail"),
    ).toHaveTextContent(
      "Shooting · Decision required · Director call required",
    );

    fireEvent.click(screen.getByText("Period accounting"));
    for (const label of [
      "Studio Revenue",
      "Legacy box-office lump",
      "Payroll",
      "Overhead",
      "Production spend",
      "Publicity",
      "Studio construction",
      "Other cash",
      "Net this period",
      "Releases",
      "Runs completed",
      "Cash now",
    ]) {
      expect(rail).toHaveTextContent(label);
    }
    expect(rail).toHaveTextContent(
      "Disengaged compatibility truth; not engaged Studio Revenue.",
    );
    expect(rail).toHaveTextContent(
      "Signing bonuses, freelancer fees, and termination.",
    );
    expect(rail).toHaveTextContent("$1,000.50");
    expect(rail).toHaveTextContent("$250.25");
    expect(rail).toHaveTextContent("-$1,972.00");
    expect(
      screen
        .getByTestId("lot-next-event-net-this-period")
        .querySelector("data"),
    ).toHaveAttribute("value", "-1971.999");

    const buttons = within(rail).getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual([
      "Call director to Soundstage 12",
      "Open Production Board details",
      "Dismiss",
    ]);
    fireEvent.click(buttons[0]!);
    await Promise.resolve();
    fireEvent.click(buttons[1]!);
    await Promise.resolve();
    fireEvent.click(buttons[2]!);
    expect(world).toHaveBeenCalledOnce();
    expect(deep).toHaveBeenCalledOnce();
    expect(dismiss).toHaveBeenCalledOnce();

    // An equal repaint is not a new event and must not steal focus again.
    buttons[2]!.focus();
    view.rerender(
      <LotNextEventRail
        ref={headingRef}
        feedback={{
          kind: "next-event-exact",
          receipt: { ...feedback.receipt },
        }}
        reasonDetail={
          <p>Shooting · Decision required · Director call required</p>
        }
        worldAction={{
          label: "Call director to Soundstage 12",
          onActivate: world,
        }}
        deepAction={{
          label: "Open Production Board details",
          onActivate: deep,
        }}
        onDismiss={dismiss}
      />,
    );
    expect(screen.getByTestId("lot-next-event-dismiss")).toHaveFocus();
  });

  it("retains every completed-run identity in receipt order", () => {
    const receipt = exactReceipt({
      kind: "run-completed",
      buildingId: "theater",
      runs: [
        { productionId: "run-b", title: "Second Billing" },
        { productionId: "run-a", title: "First Light" },
      ],
    });
    receipt.stopReason = "runCompleted";
    receipt.completedRuns =
      receipt.target.kind === "run-completed" ? receipt.target.runs : [];
    receipt.summary = {
      ...receipt.summary,
      completedRuns: receipt.completedRuns.length,
    };
    render(
      <LotNextEventRail
        feedback={{ kind: "next-event-exact", receipt }}
        deepAction={{ label: "Open Dashboard releases", onActivate: () => {} }}
        onDismiss={() => {}}
      />,
    );

    const rows = within(
      screen.getByTestId("lot-next-event-identity"),
    ).getAllByRole("listitem");
    // Order and completeness are the point of this spec; the identity line is now
    // player language rather than `Production run-b`. Both are still pinned exactly.
    expect(rows.map((row) => row.textContent)).toEqual([
      "Second BillingIts theatrical run has finished",
      "First LightIts theatrical run has finished",
    ]);
    expect(rows.map((row) => row.textContent).join(" ")).not.toContain("run-a");
  });

  it("defers focus and live ownership to the one construction completion notice", async () => {
    const receipt = exactReceipt({
      kind: "construction",
      projectId: completion.projectId,
      facilityId: completion.facilityId,
      name: completion.name,
      buildingId: "expansion",
    });
    receipt.stopReason = "constructionCompleted";
    receipt.constructionCompletion = completion;
    const view = render(
      <LotNextEventRail
        feedback={{ kind: "next-event-exact", receipt }}
        reasonDetail={<p>Duplicate completion copy must not render</p>}
        deepAction={{ label: "Open Studio Development", onActivate: () => {} }}
        onDismiss={() => {}}
      />,
    );

    const notices = screen.getAllByTestId("annex-completion-summary");
    expect(notices).toHaveLength(1);
    await waitFor(() => expect(notices[0]).toHaveFocus());
    expect(
      screen.getByRole("heading", { name: "NEXT EVENT" }),
    ).not.toHaveFocus();
    expect(
      screen.queryByTestId("lot-next-event-announcement"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(completion.message)).toHaveLength(1);
    expect(
      screen.queryByText("Duplicate completion copy must not render"),
    ).not.toBeInTheDocument();

    view.rerender(
      <LotNextEventRail
        feedback={{ kind: "next-event-exact", receipt }}
        restored
        deepAction={{ label: "Open Studio Development", onActivate: () => {} }}
        onDismiss={() => {}}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "NEXT EVENT" })).toHaveFocus(),
    );
    expect(
      screen.queryByTestId("annex-completion-summary"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("lot-next-event-announcement"),
    ).not.toBeInTheDocument();
  });

  it("keeps neutral feedback primitive-only and requests stable Lot focus once", () => {
    const focusLot = vi.fn();
    const deep = vi.fn();
    const feedback = {
      kind: "next-event-neutral" as const,
      toWeek: 530,
      cashNow: 77.25,
      stopMessage: "Stopped at Week 530: reached the simulation safety guard.",
      constructionCompletion: null,
    };
    const view = render(
      <LotNextEventRail
        feedback={feedback}
        deepAction={{ label: "Must not render", onActivate: deep }}
        reasonDetail={<p>Must not render</p>}
        onDismiss={() => {}}
        onRequestLotHeadingFocus={focusLot}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Week 530. The studio advanced to the next event.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("lot-next-event-stop-message")).toHaveTextContent(
      feedback.stopMessage,
    );
    expect(screen.getByTestId("lot-next-event-rail")).toHaveTextContent(
      "$77.25",
    );
    expect(screen.queryByText("Must not render")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("lot-next-event-accounting"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("lot-next-event-identity"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("lot-next-event-deep-action"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("lot-next-event-neutral-announcement"),
    ).toHaveTextContent(`${feedback.stopMessage} Final week 530.`);
    expect(focusLot).toHaveBeenCalledOnce();

    view.rerender(
      <LotNextEventRail
        feedback={{ ...feedback }}
        onDismiss={() => {}}
        onRequestLotHeadingFocus={focusLot}
      />,
    );
    expect(focusLot).toHaveBeenCalledOnce();
    expect(
      screen.getAllByTestId("lot-next-event-neutral-announcement"),
    ).toHaveLength(1);
  });

  it("lets an independently valid completion own focus on the neutral arm", async () => {
    const focusLot = vi.fn();
    render(
      <LotNextEventRail
        feedback={{
          kind: "next-event-neutral",
          toWeek: 13,
          cashNow: -0.5,
          stopMessage: null,
          constructionCompletion: completion,
        }}
        onDismiss={() => {}}
        onRequestLotHeadingFocus={focusLot}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Week 13. The studio advanced to the next event.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("lot-next-event-rail")).toHaveTextContent(
      "-$0.50",
    );
    expect(
      screen.queryByTestId("lot-next-event-accounting"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("lot-next-event-announcement"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("lot-next-event-neutral-announcement"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByTestId("annex-completion-summary")).toHaveLength(1);
    await waitFor(() =>
      expect(screen.getByTestId("annex-completion-summary")).toHaveFocus(),
    );
    expect(focusLot).not.toHaveBeenCalled();
  });

  it("rejects and seals a pointer/mouse tail when any closed receipt field changed, then accepts a later fresh boundary", async () => {
    const firstWorld = vi.fn();
    const secondWorld = vi.fn();
    const dismiss = vi.fn();
    const first = {
      kind: "next-event-exact" as const,
      receipt: validExactReceipt(1_234.5),
    };
    // `presentationKey` is deliberately identical. Only the full receipt
    // comparison can detect this accepted-result change.
    const second = {
      kind: "next-event-exact" as const,
      receipt: validExactReceipt(1_234.75),
    };
    const view = render(
      <LotNextEventRail
        feedback={first}
        worldAction={{ label: "Resume Stage 12", onActivate: firstWorld }}
        onDismiss={dismiss}
      />,
    );

    fireEvent.pointerDown(screen.getByTestId("lot-next-event-world-action"));
    view.rerender(
      <LotNextEventRail
        feedback={second}
        worldAction={{ label: "Resume Stage 12", onActivate: secondWorld }}
        onDismiss={dismiss}
      />,
    );
    // Mouse is the compatibility family for the original pointer gesture and
    // must not recapture the new presentation.
    fireEvent.mouseDown(screen.getByTestId("lot-next-event-world-action"));
    fireEvent.click(screen.getByTestId("lot-next-event-world-action"), {
      detail: 1,
    });
    expect(firstWorld).not.toHaveBeenCalled();
    expect(secondWorld).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("lot-next-event-world-action"), {
      detail: 0,
    });
    expect(secondWorld).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.pointerDown(screen.getByTestId("lot-next-event-world-action"));
    fireEvent.click(screen.getByTestId("lot-next-event-world-action"), {
      detail: 1,
    });
    expect(secondWorld).toHaveBeenCalledOnce();
  });

  it("keeps the first down token and invokes its captured callback, never the newest closure", () => {
    const firstWorld = vi.fn();
    const secondWorld = vi.fn();
    const feedback = {
      kind: "next-event-exact" as const,
      receipt: validExactReceipt(),
    };
    const view = render(
      <LotNextEventRail
        feedback={feedback}
        worldAction={{ label: "Resume Stage 12", onActivate: firstWorld }}
        onDismiss={() => {}}
      />,
    );

    fireEvent.pointerDown(screen.getByTestId("lot-next-event-world-action"));
    view.rerender(
      <LotNextEventRail
        feedback={{ ...feedback }}
        worldAction={{ label: "Resume Stage 12", onActivate: secondWorld }}
        onDismiss={() => {}}
      />,
    );
    // A second down before the first gesture settles cannot recapture B.
    fireEvent.pointerDown(screen.getByTestId("lot-next-event-world-action"));
    fireEvent.click(screen.getByTestId("lot-next-event-world-action"), {
      detail: 1,
    });

    expect(firstWorld).toHaveBeenCalledOnce();
    expect(secondWorld).not.toHaveBeenCalled();
  });

  it("consumes and seals a detail-greater-than-one token before any other slot can act", async () => {
    const world = vi.fn();
    const deep = vi.fn();
    render(
      <LotNextEventRail
        feedback={{ kind: "next-event-exact", receipt: validExactReceipt() }}
        worldAction={{ label: "Resume Stage 12", onActivate: world }}
        deepAction={{ label: "Open details", onActivate: deep }}
        onDismiss={() => {}}
      />,
    );

    fireEvent.pointerDown(screen.getByTestId("lot-next-event-world-action"));
    fireEvent.click(screen.getByTestId("lot-next-event-world-action"), {
      detail: 2,
    });
    fireEvent.click(screen.getByTestId("lot-next-event-deep-action"), {
      detail: 0,
    });
    expect(world).not.toHaveBeenCalled();
    expect(deep).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.click(screen.getByTestId("lot-next-event-deep-action"), {
      detail: 0,
    });
    expect(deep).toHaveBeenCalledOnce();
  });

  it("allows only one world/deep/dismiss claim before the presentation turn settles", async () => {
    const world = vi.fn();
    const deep = vi.fn();
    const dismiss = vi.fn();
    render(
      <LotNextEventRail
        feedback={{ kind: "next-event-exact", receipt: validExactReceipt() }}
        worldAction={{ label: "Resume Stage 12", onActivate: world }}
        deepAction={{ label: "Open details", onActivate: deep }}
        onDismiss={dismiss}
      />,
    );

    fireEvent.click(screen.getByTestId("lot-next-event-world-action"), {
      detail: 0,
    });
    fireEvent.click(screen.getByTestId("lot-next-event-deep-action"), {
      detail: 0,
    });
    fireEvent.click(screen.getByTestId("lot-next-event-dismiss"), {
      detail: 0,
    });
    expect(world).toHaveBeenCalledOnce();
    expect(deep).not.toHaveBeenCalled();
    expect(dismiss).not.toHaveBeenCalled();

    await Promise.resolve();
    fireEvent.click(screen.getByTestId("lot-next-event-deep-action"), {
      detail: 0,
    });
    expect(deep).toHaveBeenCalledOnce();
  });

  it("captures semantic key presentation without dispatching until click and rejects a replacement tail", async () => {
    const firstDeep = vi.fn();
    const secondDeep = vi.fn();
    const first = {
      kind: "next-event-exact" as const,
      receipt: validExactReceipt(1_234.5),
    };
    const second = {
      kind: "next-event-exact" as const,
      receipt: validExactReceipt(1_235.5),
    };
    const view = render(
      <LotNextEventRail
        feedback={first}
        deepAction={{ label: "Open Production Board", onActivate: firstDeep }}
        onDismiss={() => {}}
      />,
    );
    const firstButton = screen.getByTestId("lot-next-event-deep-action");

    fireEvent.keyDown(firstButton, { key: "Enter", repeat: false });
    expect(firstDeep).not.toHaveBeenCalled();
    view.rerender(
      <LotNextEventRail
        feedback={second}
        deepAction={{ label: "Open Production Board", onActivate: secondDeep }}
        onDismiss={() => {}}
      />,
    );
    const secondButton = screen.getByTestId("lot-next-event-deep-action");
    fireEvent.click(secondButton, { detail: 0 });
    expect(firstDeep).not.toHaveBeenCalled();
    expect(secondDeep).not.toHaveBeenCalled();

    fireEvent.keyUp(secondButton, { key: "Enter" });
    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.keyDown(secondButton, { key: " ", repeat: false });
    fireEvent.keyDown(secondButton, { key: " ", repeat: true });
    expect(secondDeep).not.toHaveBeenCalled();
    fireEvent.keyUp(secondButton, { key: " " });
    fireEvent.click(secondButton, { detail: 0 });
    expect(secondDeep).toHaveBeenCalledOnce();
  });

  it("does not let a presentation-A touch tail dismiss replacement B", async () => {
    const firstDismiss = vi.fn();
    const secondDismiss = vi.fn();
    const first = {
      kind: "next-event-neutral" as const,
      toWeek: 13,
      cashNow: 99,
      stopMessage: "Studio event details changed. Review the current lot.",
      constructionCompletion: null,
    };
    const second = {
      ...first,
      constructionCompletion: completion,
    };
    const view = render(
      <LotNextEventRail feedback={first} onDismiss={firstDismiss} />,
    );

    fireEvent.pointerDown(screen.getByTestId("lot-next-event-dismiss"));
    view.rerender(
      <LotNextEventRail feedback={second} onDismiss={secondDismiss} />,
    );
    fireEvent.touchStart(screen.getByTestId("lot-next-event-dismiss"));
    fireEvent.click(screen.getByTestId("lot-next-event-dismiss"), {
      detail: 1,
    });
    expect(firstDismiss).not.toHaveBeenCalled();
    expect(secondDismiss).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.pointerDown(screen.getByTestId("lot-next-event-dismiss"));
    fireEvent.click(screen.getByTestId("lot-next-event-dismiss"), {
      detail: 1,
    });
    expect(secondDismiss).toHaveBeenCalledOnce();
  });

  it("contains every physical start family before the world canvas", () => {
    const pointer = vi.fn();
    const mouse = vi.fn();
    const touch = vi.fn();
    render(
      <div onPointerDown={pointer} onMouseDown={mouse} onTouchStart={touch}>
        <LotNextEventRail
          feedback={{ kind: "next-event-exact", receipt: validExactReceipt() }}
          deepAction={{ label: "Open details", onActivate: () => {} }}
          onDismiss={() => {}}
        />
      </div>,
    );
    const button = screen.getByTestId("lot-next-event-deep-action");

    fireEvent.pointerDown(button);
    fireEvent.mouseDown(button);
    fireEvent.touchStart(button);
    expect(pointer).not.toHaveBeenCalled();
    expect(mouse).not.toHaveBeenCalled();
    expect(touch).not.toHaveBeenCalled();
  });

  it("clears a hidden-tab token and cannot dispatch it after visibility or unmount", async () => {
    const deep = vi.fn();
    const view = render(
      <LotNextEventRail
        feedback={{ kind: "next-event-exact", receipt: validExactReceipt() }}
        deepAction={{ label: "Open details", onActivate: deep }}
        onDismiss={() => {}}
      />,
    );
    let hidden = false;
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    const button = screen.getByTestId("lot-next-event-deep-action");

    fireEvent.pointerDown(button);
    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    await new Promise((resolve) => setTimeout(resolve, 5));
    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    fireEvent.mouseDown(button);
    fireEvent.click(button, { detail: 1 });
    expect(deep).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.pointerDown(button);
    fireEvent.click(button, { detail: 1 });
    expect(deep).toHaveBeenCalledOnce();
    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.pointerDown(button);
    view.unmount();
    fireEvent.click(button, { detail: 1 });
    expect(deep).toHaveBeenCalledOnce();
  });

  it("makes a suspended modal boundary inert and admits a later fresh AT click", async () => {
    const deep = vi.fn();
    const feedback = {
      kind: "next-event-exact" as const,
      receipt: validExactReceipt(),
    };
    const view = render(
      <LotNextEventRail
        feedback={feedback}
        deepAction={{ label: "Open details", onActivate: deep }}
        onDismiss={() => {}}
      />,
    );
    fireEvent.keyDown(screen.getByTestId("lot-next-event-deep-action"), {
      key: " ",
      repeat: false,
    });

    view.rerender(
      <LotNextEventRail
        feedback={feedback}
        deepAction={{ label: "Open details", onActivate: deep }}
        inputSuspended
        onDismiss={() => {}}
      />,
    );
    expect(screen.getByTestId("lot-next-event-rail")).toHaveAttribute("inert");
    expect(screen.getByTestId("lot-next-event-deep-action")).toBeDisabled();
    fireEvent.click(screen.getByTestId("lot-next-event-deep-action"), {
      detail: 0,
    });
    expect(deep).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 5));
    view.rerender(
      <LotNextEventRail
        feedback={feedback}
        deepAction={{ label: "Open details", onActivate: deep }}
        onDismiss={() => {}}
      />,
    );
    fireEvent.mouseDown(screen.getByTestId("lot-next-event-deep-action"));
    fireEvent.click(screen.getByTestId("lot-next-event-deep-action"), {
      detail: 1,
    });
    expect(deep).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("lot-next-event-deep-action"), {
      detail: 0,
    });
    expect(deep).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.click(screen.getByTestId("lot-next-event-deep-action"), {
      detail: 0,
    });
    expect(deep).toHaveBeenCalledOnce();
  });

  it("clears a held rail action across renderer/context generations without disabling fallback", async () => {
    const deep = vi.fn();
    const feedback = {
      kind: "next-event-exact" as const,
      receipt: validExactReceipt(),
    };
    const view = render(
      <LotNextEventRail
        feedback={feedback}
        deepAction={{ label: "Open details", onActivate: deep }}
        inputResetEpoch={0}
        onDismiss={() => {}}
      />,
    );
    fireEvent.pointerDown(screen.getByTestId("lot-next-event-deep-action"));

    view.rerender(
      <LotNextEventRail
        feedback={feedback}
        deepAction={{ label: "Open details", onActivate: deep }}
        inputResetEpoch={1}
        onDismiss={() => {}}
      />,
    );
    const button = screen.getByTestId("lot-next-event-deep-action");
    fireEvent.mouseDown(button);
    fireEvent.click(button, { detail: 1 });
    fireEvent.click(button, { detail: 0 });
    expect(deep).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.click(button, { detail: 0 });
    expect(deep).toHaveBeenCalledOnce();
  });

  it("keeps virtual AT activation available after bounded pointer and keyboard cancellation", async () => {
    const deep = vi.fn();
    render(
      <LotNextEventRail
        feedback={{ kind: "next-event-exact", receipt: validExactReceipt() }}
        deepAction={{ label: "Open details", onActivate: deep }}
        onDismiss={() => {}}
      />,
    );
    const button = screen.getByTestId("lot-next-event-deep-action");

    fireEvent.pointerDown(button);
    fireEvent.pointerCancel(button);
    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.mouseDown(button);
    fireEvent.click(button, { detail: 1 });
    expect(deep).not.toHaveBeenCalled();
    // Pointer cancellation requires a fresh primary pointer boundary even after
    // the task-local compatibility seal expires; switch/AT remains independent.
    fireEvent.click(button, { detail: 0 });
    expect(deep).toHaveBeenCalledOnce();

    await new Promise((resolve) => setTimeout(resolve, 5));
    button.focus();
    fireEvent.pointerDown(button);
    fireEvent.blur(button);
    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.mouseDown(button);
    fireEvent.click(button, { detail: 1 });
    expect(deep).toHaveBeenCalledOnce();
    fireEvent.pointerDown(button);
    fireEvent.click(button, { detail: 1 });
    expect(deep).toHaveBeenCalledTimes(2);

    await Promise.resolve();
    fireEvent.keyDown(button, { key: "Enter", repeat: false });
    fireEvent.blur(button);
    // Blur seals only the ambiguous current task. A later switch/AT click is
    // fresh and is never suppressed indefinitely.
    fireEvent.click(button, { detail: 0 });
    expect(deep).toHaveBeenCalledTimes(2);
    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.click(button, { detail: 0 });
    expect(deep).toHaveBeenCalledTimes(3);
  });
});
