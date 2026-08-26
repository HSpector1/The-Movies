// Film Chronicle V1 — independent core contract tests.
//
// This suite intentionally exercises only the public core surface. It treats the
// Chronicle as a pure projection: persisted film/script/ledger facts go in; a
// detached, deterministic presentation record comes out. No test reaches into a
// private helper or reconstructs a second scoring/reception formula.

import { describe, expect, it } from "vitest";
import {
  applyActions,
  buildFilmChronicle,
  buildNewspaper,
  exportSave,
  generateWorld,
  importSave,
  initialManagedStudioConstruction,
  initialManagedStudioPlacement,
  initialManagedStudioOperations,
  makeSave,
  OracleAgent,
  stableStringify,
  tick,
  validateSave,
} from "../src/core/index.js";
import type {
  FilmChronicleInput,
  FilmChronicleLedgerInput,
  FilmChronicleScriptInput,
  FilmChronicleView,
  FilmParticipant,
  FilmParticipants,
  FilmResult,
  GameState,
  LedgerEntry,
  Promise as FilmPromise,
  ScriptProject,
  SegmentId,
} from "../src/core/index.js";

const SEGMENT_SCORES: Record<SegmentId, number> = {
  youngAdult: 61,
  family: 54,
  adult: 72,
  prestige: 66,
};

const RECEPTION: FilmChronicleInput["reception"] = {
  critic: { stars: 4, score: 81 },
  audience: { tier: "liked", label: "Audiences liked it", score: 64 },
};

const SHAPE = {
  opening: "slowSetup",
  midpoint: "reversal",
  ending: "bittersweet",
} as const;

const PROMISE: FilmPromise = {
  genre: "drama",
  intendedSegments: ["adult", "prestige"],
  ranges: {
    intimacy: [0.2, 0.7],
    tonalWeight: [0.4, 0.9],
    kineticEnergy: [-0.4, 0.1],
  },
};

function clone<T>(value: T): T {
  return JSON.parse(stableStringify(value)) as T;
}

function participant(
  role: FilmParticipant["role"],
  fit: number,
  talentId = `talent-${role}`,
  name = `${role} name`,
): FilmParticipant {
  const discipline =
    role === "writer"
      ? "writing"
      : role === "director"
        ? "directing"
        : role === "craft"
          ? "craft"
          : "acting";
  return {
    talentId,
    name,
    role,
    discipline,
    greenlightOVR: 57,
    greenlightFit: fit,
    greenlightEP: { low: 42, high: 68, expected: 55 },
    freelancer: false,
  };
}

function participants(overrides: Partial<FilmParticipants> = {}): FilmParticipants {
  return {
    writer: participant("writer", 70, "writer-a", "Willa Hart"),
    director: participant("director", 63, "director-a", "Dorian Vale"),
    cast: {
      lead: participant("lead", 44, "lead-a", "Lena March"),
      antagonist: participant("antagonist", 58, "antagonist-a", "Otis Crowe"),
      support: participant("support", 52, "support-a", "Mara Flint"),
    },
    craft: [participant("craft", 61, "craft-a", "Calder Reed")],
    ...overrides,
  };
}

function film(
  productionId = "production-a",
  people: FilmParticipants | undefined = participants(),
  overrides: Partial<FilmResult> = {},
): FilmResult {
  return {
    productionId,
    releaseTick: 9,
    delivered: { intimacy: -0.95, tonalWeight: -0.85, kineticEnergy: 0.99 },
    cohesion: 0.63,
    craft: 67,
    criticMean: 79,
    criticSigma: 7,
    criticScore: 81,
    reviewVariance: 2,
    segmentScores: { ...SEGMENT_SCORES },
    boxOffice: { opening: 4_200_000, total: 12_600_000 },
    conceptId: "concept-a",
    directorId: people?.director.talentId ?? "director-a",
    ...(people === undefined ? {} : { participants: people }),
    forecast: {
      expectedCriticScore: 73,
      expectedTotal: 11_000_000,
      expectedOpening: 3_800_000,
    },
    ...overrides,
  };
}

function script(
  productionId = "production-a",
  overrides: Partial<FilmChronicleScriptInput> = {},
): FilmChronicleScriptInput {
  return {
    productionId,
    writerId: "writer-a",
    shape: clone(SHAPE),
    promise: clone(PROMISE),
    commissionedWeek: 2,
    rewriteCount: 1,
    ...overrides,
  };
}

function ledger(
  productionId = "production-a",
  week = 4,
  amount = -5_500_000,
): FilmChronicleLedgerInput {
  return { productionId, week, amount };
}

function input(overrides: Partial<FilmChronicleInput> = {}): FilmChronicleInput {
  return {
    film: film(),
    conceptTitle: "Echoes of Harvest",
    genre: "drama",
    producedScripts: [script()],
    productionLedgerRows: [ledger()],
    currentWeek: 15,
    reception: clone(RECEPTION),
    ...overrides,
  };
}

function expectAvailable<T extends { available: boolean }>(
  section: T,
): asserts section is Extract<T, { available: true }> {
  expect(section.available).toBe(true);
}

function expectUnavailable<T extends { available: boolean; message?: string }>(
  section: T,
): asserts section is Extract<T, { available: false }> {
  expect(section.available).toBe(false);
  if (!section.available) expect(section.message).toMatch(/unavailable|not recorded/i);
}

function completeView(overrides: Partial<FilmChronicleInput> = {}): FilmChronicleView {
  const view = buildFilmChronicle(input(overrides));
  expect(view).not.toBeNull();
  return view!;
}

describe("Film Chronicle V1 — pure complete projection", () => {
  it("projects exact persisted identity, creative record, chronology, credits, package and reception", () => {
    const source = input();
    const view = buildFilmChronicle(source);
    expect(view).not.toBeNull();
    if (view === null) return;

    expect(view.productionId).toBe("production-a");
    expect(view.title).toBe("Echoes of Harvest");
    expect(view.genre).toBe("drama");
    expect(view.reception).toEqual(RECEPTION);

    expectAvailable(view.creativeRecord);
    expect(view.creativeRecord.shape).toEqual(SHAPE);
    expect(view.creativeRecord.promise).toEqual(PROMISE);
    expect(view.creativeRecord.commissionedWeek).toBe(2);
    expect(view.creativeRecord.rewriteCount).toBe(1);

    expectAvailable(view.credits);
    expect(view.credits.participants).toEqual(source.film.participants);

    expectAvailable(view.productionRecord);
    expect(view.productionRecord).toMatchObject({
      commissionedWeek: 2,
      rewriteCount: 1,
      greenlightWeek: 4,
      releaseWeek: 9,
      elapsedWeeks: 5,
    });

    expectAvailable(view.packageRecord);
    expect(view.packageRecord.strongest).toMatchObject({
      fit: 70,
      label: "Standout fit",
      participant: { talentId: "writer-a", role: "writer" },
    });
    expect(view.packageRecord.weakest).toMatchObject({
      fit: 44,
      label: "Stretch fit",
      participant: { talentId: "lead-a", role: "lead" },
    });
  });

  it("is deterministic across fresh identities and ignores source collection order", () => {
    const otherScript = script("production-b", {
      writerId: "writer-b",
      commissionedWeek: 0,
      rewriteCount: 0,
    });
    const otherLedger = ledger("production-b", 1, -2_000_000);
    const forward = input({
      producedScripts: [otherScript, script()],
      productionLedgerRows: [otherLedger, ledger()],
    });
    const reversed = clone({
      ...forward,
      producedScripts: [...forward.producedScripts].reverse(),
      productionLedgerRows: [...forward.productionLedgerRows].reverse(),
    });

    expect(buildFilmChronicle(forward)).toEqual(buildFilmChronicle(reversed));
    expect(buildFilmChronicle(clone(forward))).toEqual(buildFilmChronicle(forward));
  });
});

describe("Film Chronicle V1 — bounded legacy and unavailable sections", () => {
  it("returns null for a pre-participant film instead of borrowing live talent", () => {
    const { participants: _frozenParticipants, ...legacy } = film("legacy");
    expect(buildFilmChronicle(input({ film: legacy }))).toBeNull();
  });

  it("keeps a participant-bearing legacy shell while creative and chronology say unavailable", () => {
    const view = completeView({ producedScripts: [], productionLedgerRows: [] });
    expect(view.title).toBe("Echoes of Harvest");
    expectAvailable(view.credits);
    expectAvailable(view.packageRecord);
    expectUnavailable(view.creativeRecord);
    expectUnavailable(view.productionRecord);
  });

  it("does not infer a missing Shape or Promise from delivered expression", () => {
    const cold = input({
      film: film("production-a", participants(), {
        delivered: { intimacy: -1, tonalWeight: -1, kineticEnergy: -1 },
      }),
      producedScripts: [],
    });
    const hot = input({
      film: film("production-a", participants(), {
        delivered: { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 },
      }),
      producedScripts: [],
    });
    const a = buildFilmChronicle(cold)!;
    const b = buildFilmChronicle(hot)!;
    expectUnavailable(a.creativeRecord);
    expectUnavailable(b.creativeRecord);
    expect(a.creativeRecord).toEqual(b.creativeRecord);
  });

  it("fails a duplicate exact script link closed rather than choosing by array order", () => {
    const first = script();
    const rival = script("production-a", {
      shape: { opening: "immediateAction", midpoint: "escalation", ending: "triumph" },
      commissionedWeek: 3,
      rewriteCount: 0,
    });
    const a = completeView({ producedScripts: [first, rival] });
    const b = completeView({ producedScripts: [rival, first] });
    expectUnavailable(a.creativeRecord);
    expectUnavailable(a.productionRecord);
    expect(a).toEqual(b);
  });
});

describe("Film Chronicle V1 — exact production-ledger witness", () => {
  it("accepts exactly one negative matching integer witness at the legal chronology boundaries", () => {
    const earliest = completeView({
      film: film("production-a", participants(), { releaseTick: 5 }),
      currentWeek: 5,
      producedScripts: [script("production-a", { commissionedWeek: 2, rewriteCount: 0 })],
      productionLedgerRows: [ledger("production-a", 3)],
    });
    expectAvailable(earliest.productionRecord);
    expect(earliest.productionRecord).toMatchObject({
      commissionedWeek: 2,
      rewriteCount: 0,
      greenlightWeek: 3,
      releaseWeek: 5,
      elapsedWeeks: 2,
    });
  });

  it.each([
    ["missing", []],
    ["duplicate", [ledger(), ledger("production-a", 5, -1)]],
    ["zero", [ledger("production-a", 4, 0)]],
    ["positive", [ledger("production-a", 4, 1)]],
    ["wrong film", [ledger("production-b", 4)]],
    ["fractional week", [ledger("production-a", 4.5)]],
    ["before screenplay could be accepted", [ledger("production-a", 3)]],
    ["at release rather than before it", [ledger("production-a", 9)]],
  ] as const)("marks chronology unavailable for a %s witness without throwing", (_name, rows) => {
    expect(() => completeView({ productionLedgerRows: [...rows] })).not.toThrow();
    expectUnavailable(completeView({ productionLedgerRows: [...rows] }).productionRecord);
  });

  it("marks chronology unavailable when release is in the future", () => {
    const view = completeView({
      film: film("production-a", participants(), { releaseTick: 16 }),
      currentWeek: 15,
    });
    expectUnavailable(view.productionRecord);
  });

  it("ignores unrelated films' rows but never substitutes one for the target", () => {
    const valid = completeView({
      productionLedgerRows: [ledger("production-b", 1), ledger("production-a", 4)],
    });
    expectAvailable(valid.productionRecord);
    expect(valid.productionRecord.greenlightWeek).toBe(4);

    const missingTarget = completeView({
      productionLedgerRows: [ledger("production-b", 4)],
    });
    expectUnavailable(missingTarget.productionRecord);
  });
});

describe("Film Chronicle V1 — credit correlation and two-film isolation", () => {
  it("a script-writer mismatch fails every script-dependent and identity section closed", () => {
    const view = completeView({
      producedScripts: [script("production-a", { writerId: "writer-from-another-film" })],
    });
    expectUnavailable(view.creativeRecord);
    expectUnavailable(view.productionRecord);
    expectUnavailable(view.credits);
    expectUnavailable(view.packageRecord);
  });

  it("director mismatch, wrong role, and duplicate people fail credits/package only", () => {
    const cases: FilmResult[] = [];

    cases.push(film("production-a", participants(), { directorId: "director-other" }));

    const wrongRole = participants();
    wrongRole.cast.lead = {
      ...wrongRole.cast.lead,
      role: "support",
    } as FilmParticipant;
    cases.push(film("production-a", wrongRole));

    const duplicate = participants();
    duplicate.cast.lead = {
      ...duplicate.cast.lead,
      talentId: duplicate.director.talentId,
    };
    cases.push(film("production-a", duplicate));

    for (const malformedFilm of cases) {
      const view = completeView({ film: malformedFilm });
      expectAvailable(view.creativeRecord);
      expectAvailable(view.productionRecord);
      expectUnavailable(view.credits);
      expectUnavailable(view.packageRecord);
    }
  });

  it("does not leak a rejected frozen credit through legacy newspaper callouts", () => {
    const malformed = participants({
      director: participant("director", 99, "rejected-director", "REJECTED CREDIT NAME"),
    });
    const target = film("production-a", malformed, { directorId: "actual-director" });
    const paper = buildNewspaper({
      film: target,
      conceptTitle: "Echoes of Harvest",
      genre: "drama",
      producedScripts: [script()],
      productionLedgerRows: [ledger()],
      currentWeek: 15,
      committedCost: 5_500_000,
      segmentShares: { youngAdult: 0.25, family: 0.25, adult: 0.25, prestige: 0.25 },
    });
    expect(paper).not.toBeNull();
    expect(paper!.chronicle.credits.available).toBe(false);
    expect(stableStringify(paper!.callouts)).not.toContain("REJECTED CREDIT NAME");
  });

  it("selects only the named film when two films' scripts and ledger rows are interleaved", () => {
    const scriptB = script("production-b", {
      writerId: "writer-b",
      shape: { opening: "mysteryHook", midpoint: "revelation", ending: "tragic" },
      promise: {
        genre: "horror",
        intendedSegments: ["youngAdult"],
        ranges: {
          intimacy: [-0.9, -0.4],
          tonalWeight: [0.7, 1],
          kineticEnergy: [0.5, 1],
        },
      },
      commissionedWeek: 0,
      rewriteCount: 0,
    });
    const a = completeView({
      producedScripts: [scriptB, script()],
      productionLedgerRows: [ledger("production-b", 1), ledger("production-a", 4)],
    });
    const reversed = completeView({
      producedScripts: [script(), scriptB],
      productionLedgerRows: [ledger("production-a", 4), ledger("production-b", 1)],
    });

    expect(a).toEqual(reversed);
    expectAvailable(a.creativeRecord);
    expect(a.creativeRecord.shape).toEqual(SHAPE);
    expect(a.creativeRecord.promise.genre).toBe("drama");
    expect(stableStringify(a)).not.toContain("writer-b");
    expect(stableStringify(a)).not.toContain("mysteryHook");
  });

  it("keeps two released films' frozen credits disjoint in both projection directions", () => {
    const peopleA = participants();
    const peopleB: FilmParticipants = {
      writer: participant("writer", 66, "writer-b", "B Writer"),
      director: participant("director", 71, "director-b", "B Director"),
      cast: {
        lead: participant("lead", 62, "lead-b", "B Lead"),
        antagonist: participant("antagonist", 57, "antagonist-b", "B Antagonist"),
        support: participant("support", 49, "support-b", "B Support"),
      },
      craft: [participant("craft", 60, "craft-b", "B Craft")],
    };
    const scriptA = script();
    const scriptB = script("production-b", {
      writerId: "writer-b",
      shape: { opening: "mysteryHook", midpoint: "revelation", ending: "tragic" },
      commissionedWeek: 0,
      rewriteCount: 0,
    });
    const scripts = [scriptB, scriptA];
    const rows = [ledger("production-b", 1), ledger("production-a", 4)];

    const viewA = buildFilmChronicle(
      input({
        film: film("production-a", peopleA),
        producedScripts: scripts,
        productionLedgerRows: rows,
      }),
    )!;
    const viewB = buildFilmChronicle(
      input({
        film: film("production-b", peopleB, {
          conceptId: "concept-b",
          releaseTick: 8,
        }),
        conceptTitle: "The Other Picture",
        genre: "horror",
        producedScripts: [...scripts].reverse(),
        productionLedgerRows: [...rows].reverse(),
      }),
    )!;

    expectAvailable(viewA.credits);
    expectAvailable(viewB.credits);
    expect(viewA.credits.participants.writer.name).toBe("Willa Hart");
    expect(viewB.credits.participants.writer.name).toBe("B Writer");
    expect(stableStringify(viewA)).not.toContain("B Writer");
    expect(stableStringify(viewB)).not.toContain("Willa Hart");
    expectAvailable(viewA.creativeRecord);
    expectAvailable(viewB.creativeRecord);
    expect(viewA.creativeRecord.shape.opening).toBe("slowSetup");
    expect(viewB.creativeRecord.shape.opening).toBe("mysteryHook");
  });
});

describe("Film Chronicle V1 — canonical Fit boundaries and ties", () => {
  function withFits(fits: {
    writer: number;
    director: number;
    lead: number;
    antagonist: number;
    support: number;
    craft: number;
  }): FilmParticipants {
    return {
      writer: participant("writer", fits.writer, "writer-a"),
      director: participant("director", fits.director, "director-a"),
      cast: {
        lead: participant("lead", fits.lead, "lead-a"),
        antagonist: participant("antagonist", fits.antagonist, "antagonist-a"),
        support: participant("support", fits.support, "support-a"),
      },
      craft: [participant("craft", fits.craft, "craft-a")],
    };
  }

  it("uses exact 70 standout and 45 stretch boundaries", () => {
    const at = completeView({
      film: film(
        "production-a",
        withFits({ writer: 70, director: 60, lead: 45, antagonist: 55, support: 57, craft: 58 }),
      ),
    });
    expectAvailable(at.packageRecord);
    expect(at.packageRecord.strongest.label).toBe("Standout fit");
    expect(at.packageRecord.weakest.label).toBe("Tightest fit");

    const outside = completeView({
      film: film(
        "production-a",
        withFits({ writer: 69, director: 60, lead: 44, antagonist: 55, support: 57, craft: 58 }),
      ),
    });
    expectAvailable(outside.packageRecord);
    expect(outside.packageRecord.strongest.label).toBe("Strongest fit");
    expect(outside.packageRecord.weakest.label).toBe("Stretch fit");
  });

  it("keeps decimal Fits exact on both sides of the visible thresholds", () => {
    const view = completeView({
      film: film(
        "production-a",
        withFits({ writer: 69.6, director: 60, lead: 44.6, antagonist: 55, support: 57, craft: 58 }),
      ),
    });
    expectAvailable(view.packageRecord);
    expect(view.packageRecord.strongest).toMatchObject({ fit: 69.6, label: "Strongest fit" });
    expect(view.packageRecord.weakest).toMatchObject({ fit: 44.6, label: "Stretch fit" });
  });

  it("breaks equal Fits by canonical role rank, then craft talent ID", () => {
    const people = withFits({
      writer: 80,
      director: 80,
      lead: 55,
      antagonist: 30,
      support: 30,
      craft: 30,
    });
    people.craft = [
      participant("craft", 30, "craft-z"),
      participant("craft", 30, "craft-a"),
    ];
    const view = completeView({ film: film("production-a", people) });
    expectAvailable(view.packageRecord);
    expect(view.packageRecord.strongest.participant.role).toBe("writer");
    expect(view.packageRecord.weakest.participant.role).toBe("antagonist");

    const craftOnlyTie = participants({
      writer: participant("writer", 80, "writer-a"),
      director: participant("director", 70, "director-a"),
      cast: {
        lead: participant("lead", 60, "lead-a"),
        antagonist: participant("antagonist", 55, "antagonist-a"),
        support: participant("support", 50, "support-a"),
      },
      craft: [
        participant("craft", 20, "craft-z"),
        participant("craft", 20, "craft-a"),
      ],
    });
    const craftView = completeView({ film: film("production-a", craftOnlyTie) });
    expectAvailable(craftView.packageRecord);
    expect(craftView.packageRecord.weakest.participant.talentId).toBe("craft-a");
  });

  it("uses the same canonical package witness in newspaper Fit callouts", () => {
    const people = participants({
      writer: participant("writer", 60, "writer-a"),
      director: participant("director", 61, "director-a"),
      cast: {
        lead: participant("lead", 62, "lead-a"),
        antagonist: participant("antagonist", 63, "antagonist-a"),
        support: participant("support", 64, "support-a"),
      },
      craft: [
        participant("craft", 80, "craft-z", "Craft Z"),
        participant("craft", 80, "craft-a", "Craft A"),
      ],
    });
    const paper = buildNewspaper({
      film: film("production-a", people),
      conceptTitle: "Echoes of Harvest",
      genre: "drama",
      producedScripts: [script()],
      productionLedgerRows: [ledger()],
      currentWeek: 15,
      committedCost: 5_500_000,
      segmentShares: { youngAdult: 0.25, family: 0.25, adult: 0.25, prestige: 0.25 },
    })!;
    expectAvailable(paper.chronicle.packageRecord);
    expect(paper.chronicle.packageRecord.strongest.participant.talentId).toBe("craft-a");
    expect(stableStringify(paper.callouts)).toContain("Craft A");
    expect(stableStringify(paper.callouts)).not.toContain("Craft Z");
  });
});

describe("Film Chronicle V1 — deep anti-aliasing and information integrity", () => {
  it("returns fresh nested values, ignores extra hidden fields, and preserves input + RNG bytes", () => {
    const base = generateWorld("film-chronicle-aliasing");
    const sourceFilm = film();
    const hiddenProject = {
      ...script(),
      status: "produced",
      dueWeek: null,
      assessment: {
        actualStrength: 98.7654321,
        perceivedStrength: 41.2345678,
      },
      reservation: null,
      id: "script-hidden-proof",
    } as ScriptProject;
    const sourceLedger = {
      ...ledger(),
      kind: "production",
      note: "negative + marketing",
    } as LedgerEntry;
    const source: GameState = {
      ...base,
      studio: { ...base.studio, releasedFilms: [sourceFilm] },
      scriptDevelopment: { mode: "managed", projects: [hiddenProject] },
      ledger: [sourceLedger],
    };
    const sourceReception = clone(RECEPTION);
    const narrowInput: FilmChronicleInput = {
      film: source.studio.releasedFilms[0]!,
      conceptTitle: "Echoes of Harvest",
      genre: "drama",
      // A full ScriptProject is structurally valid input. The projection must copy only
      // its narrow public fields and never leak the hidden assessment payload.
      producedScripts: source.scriptDevelopment.projects,
      productionLedgerRows: source.ledger.map((row) => ({
        productionId: row.productionId ?? null,
        week: row.week,
        amount: row.amount,
      })),
      currentWeek: 15,
      reception: sourceReception,
    };
    const sourceBefore = stableStringify(source);
    const inputBefore = stableStringify(narrowInput);
    const rngBefore = source.rngState;

    const first = buildFilmChronicle(narrowInput)!;
    const pristine = clone(first);
    const second = buildFilmChronicle(narrowInput)!;
    expect(second).toEqual(pristine);
    expect(second).not.toBe(first);
    expect(second.reception).not.toBe(narrowInput.reception);
    expect(second.reception.critic).not.toBe(narrowInput.reception.critic);
    expect(second.reception.audience).not.toBe(narrowInput.reception.audience);

    expectAvailable(second.creativeRecord);
    expect(second.creativeRecord.shape).not.toBe(hiddenProject.shape);
    expect(second.creativeRecord.promise).not.toBe(hiddenProject.promise);
    expect(second.creativeRecord.promise.intendedSegments).not.toBe(
      hiddenProject.promise.intendedSegments,
    );
    expect(second.creativeRecord.promise.ranges).not.toBe(hiddenProject.promise.ranges);
    expect(second.creativeRecord.promise.ranges.intimacy).not.toBe(
      hiddenProject.promise.ranges.intimacy,
    );
    expect(second.creativeRecord.promise.ranges.tonalWeight).not.toBe(
      hiddenProject.promise.ranges.tonalWeight,
    );
    expect(second.creativeRecord.promise.ranges.kineticEnergy).not.toBe(
      hiddenProject.promise.ranges.kineticEnergy,
    );

    expectAvailable(second.credits);
    const sourcePeople = sourceFilm.participants!;
    const copiedPeople = second.credits.participants;
    expect(copiedPeople).not.toBe(sourcePeople);
    expect(copiedPeople.writer).not.toBe(sourcePeople.writer);
    expect(copiedPeople.writer.greenlightEP).not.toBe(sourcePeople.writer.greenlightEP);
    expect(copiedPeople.director).not.toBe(sourcePeople.director);
    expect(copiedPeople.cast).not.toBe(sourcePeople.cast);
    expect(copiedPeople.cast.lead).not.toBe(sourcePeople.cast.lead);
    expect(copiedPeople.cast.antagonist).not.toBe(sourcePeople.cast.antagonist);
    expect(copiedPeople.cast.support).not.toBe(sourcePeople.cast.support);
    expect(copiedPeople.craft).not.toBe(sourcePeople.craft);
    expect(copiedPeople.craft[0]).not.toBe(sourcePeople.craft[0]);

    expectAvailable(second.packageRecord);
    expect(second.packageRecord.strongest.participant).not.toBe(sourcePeople.writer);
    expect(second.packageRecord.weakest.participant).not.toBe(sourcePeople.cast.lead);

    // Mutate all representative nested outputs. A third projection must still equal
    // the pristine view, and neither the direct input nor its owning state may move.
    second.reception.critic.score = -999;
    second.reception.audience.label = "MUTATED";
    second.creativeRecord.shape.opening = "immediateAction";
    second.creativeRecord.promise.intendedSegments.push("family");
    second.creativeRecord.promise.ranges.intimacy[0] = -1;
    copiedPeople.writer.name = "MUTATED";
    copiedPeople.writer.greenlightEP.low = -999;
    copiedPeople.cast.lead.talentId = "MUTATED";
    copiedPeople.craft.push(participant("craft", 1, "mutant"));
    second.packageRecord.strongest.participant.name = "MUTATED";

    expect(buildFilmChronicle(narrowInput)).toEqual(pristine);
    expect(stableStringify(source)).toBe(sourceBefore);
    expect(stableStringify(narrowInput)).toBe(inputBefore);
    expect(source.rngState).toBe(rngBefore);
    expect(stableStringify(pristine)).not.toContain("98.7654321");
    expect(stableStringify(pristine)).not.toContain("actualStrength");
    expect(stableStringify(pristine)).not.toContain("rngState");
    expect(stableStringify(pristine)).not.toContain("delivered");
  });
});

function frozenParticipant(
  state: GameState,
  talentId: string,
  role: FilmParticipant["role"],
  fit: number,
): FilmParticipant {
  const person = state.talent.find((candidate) => candidate.id === talentId)!;
  const discipline =
    role === "writer"
      ? "writing"
      : role === "director"
        ? "directing"
        : role === "craft"
          ? "craft"
          : "acting";
  return {
    talentId,
    name: person.name,
    role,
    discipline,
    greenlightOVR: 55,
    greenlightFit: fit,
    greenlightEP: { low: 40, high: 65, expected: 52 },
    freelancer: false,
  };
}

function validProducedState(seed: string): { state: GameState; productionId: string } {
  // Advance once so a commissionedWeek=0 screenplay can legally precede the real
  // production debit at Week 1. The film itself is released by the real engine.
  let state = tick(generateWorld(seed));
  state = applyActions(state, OracleAgent.chooseActions(state));
  const production = clone(state.studio.activeProductions[0]!);
  expect(production.startTick).toBe(1);

  for (let i = 0; i < 20 && state.studio.activeProductions.length > 0; i++) {
    state = tick(state);
  }
  const released = state.studio.releasedFilms.find(
    (candidate) => candidate.productionId === production.id,
  )!;
  expect(released).toBeDefined();

  const frozen: FilmParticipants = {
    writer: frozenParticipant(state, production.writerId, "writer", 72),
    director: frozenParticipant(state, production.directorId, "director", 68),
    cast: {
      lead: frozenParticipant(state, production.cast.lead, "lead", 64),
      antagonist: frozenParticipant(state, production.cast.antagonist, "antagonist", 59),
      support: frozenParticipant(state, production.cast.support, "support", 47),
    },
    craft: production.craftIds.map((talentId) =>
      frozenParticipant(state, talentId, "craft", 61),
    ),
  };
  const project: ScriptProject = {
    id: "script-0000",
    conceptId: production.conceptId,
    writerId: production.writerId,
    writerIds: [production.writerId],
    shape: clone(production.shape),
    promise: clone(production.promise),
    status: "produced",
    rewriteCount: 0,
    commissionedWeek: 0,
    dueWeek: null,
    assessment: { actualStrength: 62, perceivedStrength: 58 },
    reservation: null,
    productionId: production.id,
  };

  state = {
    ...state,
    economyEngagedEver: true,
    studio: {
      ...state.studio,
      releasedFilms: state.studio.releasedFilms.map((candidate) =>
        candidate.productionId === production.id
          ? { ...candidate, directorId: production.directorId, participants: frozen }
          : candidate,
      ),
    },
    operations: initialManagedStudioOperations(),
    construction: initialManagedStudioConstruction(),
    placement: initialManagedStudioPlacement(),
    scriptDevelopment: { mode: "managed", projects: [project] },
  };
  return { state, productionId: production.id };
}

function inputFromState(state: GameState, productionId: string): FilmChronicleInput {
  const target = state.studio.releasedFilms.find(
    (candidate) => candidate.productionId === productionId,
  )!;
  const concept = state.concepts.find((candidate) => candidate.id === target.conceptId)!;
  const shares = Object.fromEntries(
    state.market.segments.map((segment) => [segment.id, segment.share]),
  ) as Record<SegmentId, number>;
  const committedCost = state.ledger
    .filter(
      (entry) =>
        entry.productionId === productionId &&
        (entry.kind === "production" || entry.kind === "freelancerFee"),
    )
    .reduce((sum, entry) => sum - entry.amount, 0);
  const newspaper = buildNewspaper({
    film: target,
    conceptTitle: concept.title,
    committedCost,
    segmentShares: shares,
    week: target.releaseTick,
  })!;

  return {
    film: target,
    conceptTitle: concept.title,
    genre: concept.genre,
    producedScripts: state.scriptDevelopment.projects
      .filter(
        (project): project is ScriptProject & { productionId: string } =>
          project.status === "produced" && project.productionId !== null,
      )
      .map((project) => ({
        productionId: project.productionId,
        writerId: project.writerId,
        shape: project.shape,
        promise: project.promise,
        commissionedWeek: project.commissionedWeek,
        rewriteCount: project.rewriteCount,
      })),
    productionLedgerRows: state.ledger
      .filter((entry) => entry.kind === "production")
      .map((entry) => ({
        productionId: entry.productionId ?? null,
        week: entry.week,
        amount: entry.amount,
      })),
    currentWeek: state.market.tick,
    reception: {
      critic: newspaper.critic,
      audience: newspaper.audience,
    },
  };
}

describe("Film Chronicle V1 — SaveFileV11 durability", () => {
  it("reconstructs a deep-equal Chronicle after an exact V11 export/import round-trip", () => {
    const { state, productionId } = validProducedState("film-chronicle-save-v11");
    const envelope = makeSave(state);
    expect(envelope.saveVersion).toBe(15);
    expect(validateSave(envelope)).toBe(envelope);

    const beforeState = stableStringify(state);
    const rngBefore = state.rngState;
    const before = buildFilmChronicle(inputFromState(state, productionId));
    expect(before).not.toBeNull();
    expectAvailable(before!.creativeRecord);
    expectAvailable(before!.productionRecord);

    const restored = importSave(exportSave(envelope));
    expect(restored.saveVersion).toBe(15);
    if (restored.saveVersion !== 15) return;
    const after = buildFilmChronicle(inputFromState(restored.state, productionId));

    expect(after).toEqual(before);
    expect(stableStringify(state)).toBe(beforeState);
    expect(state.rngState).toBe(rngBefore);
    expect(restored.state.rngState).toBe(rngBefore);
  });
});
