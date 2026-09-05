// ── C2a-M1 · THE STUDIO EVENT LEDGER (§5, §8.1) ─────────────────────────────
//
// CHARTER (r3.2 §5): "a persisted, engine-appended `studioEvents` ledger at a new
// V14 root."  Its pins, each one load-bearing:
//
//   §5.1  Appended only by `src/core`. "No `seen`/`consumed` field ever
//         (byte-parity, PF1 §2)."
//   §5.3  "Two-tier retention; Tier D is the identity-bearing tier. Tier D
//         permanent: premiere, wrapped, constructionCompleted, setBuilt,
//         setRetired. Tier W windowed by `STUDIO_EVENT_WINDOW_WEEKS` …
//         compacted as a pure function of `market.tick`; `nextSeq` never
//         rewinds."
//   §5.4  "Exact-once = idempotent-above-a-cursor (`lastConsumedSeq` OUTSIDE
//         GameState)" — which is WHY §5.1 forbids the two cursor fields: a
//         consumption marker written into the save would make two identical runs
//         export different bytes.
//   §5.5  "The M0A gate is preserved: the ledger is EMPTY on the legacy/headless
//         path (`operations.mode === 'managed'` gate)."
//
// WHERE THE ASSERTIONS LAND. Two places, deliberately:
//
//   (i)  THE SAVE BOUNDARY, with forged rows. At M1 phase 0 the root "lands
//        writing nothing" (§5.6), so a played world has no rows and every law
//        about rows would be vacuously true. A forged row that the V14 validator
//        ACCEPTS proves the charter's shape is the legal shape; the same row with
//        one field added, one week too old, or one sequence number reused proves
//        the refusal is real. That is the `_contractFixtures.ts` forgery
//        carve-out, used for exactly what it exists for.
//
//   (ii) A PLAYED RUN. §12-M1 lands "`studioEvents` phases 0–2" AND "the Tier-D
//        `wrapped` engine event", so by the end of this milestone a managed
//        studio that wraps a picture HAS history. Those assertions are stated
//        here and will fail until the producers are wired. That failure is the
//        contract reporting itself.
//
// CONTRACT-FIRST: every literal comes from the charter via `_v14Contract.ts`.

import { beforeAll, describe, expect, it } from 'vitest'

import { applyActions, stableStringify } from '../../src/core/index.js'
import type { GameState } from '../../src/core/index.js'

import { clone, operationsStudio, productionPayload, withCash } from './_contractFixtures.js'
import {
  CHARTER_STUDIO_EVENT_KINDS,
  charterStudioEventRow,
  FORBIDDEN_EVENT_ROW_KEYS,
  isTierD,
  isTierW,
  LEGACY_YEAR_WEEKS,
  legacyWorld,
  loadCoreModule,
  loadStudioEventsModule,
  requireFunction,
  requireStudioEvents,
  runScriptedWeeks,
  STUDIO_EVENT_ROW_KEYS,
  studioEventWindowWeeks,
  TIER_D_EVENT_KINDS,
  TIER_W_EVENT_KINDS,
} from './_v14Contract.js'
import type { SaveModule, StudioEventLogShape, StudioEventsModule } from './_v14Contract.js'

type Envelope = { saveVersion: number; state: Record<string, unknown> } & Record<string, unknown>

let core: SaveModule
let events: StudioEventsModule
let loadFailure: unknown = null

/** A managed studio, played far enough that the retention window has real depth. */
let managed: GameState
let managedSave: Envelope

beforeAll(async () => {
  try {
    core = await loadCoreModule()
    events = await loadStudioEventsModule()
  } catch (error) {
    loadFailure = error
    return
  }
  let state = withCash(operationsStudio('c2a-m1-events'), 50_000_000)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
  managed = runScriptedWeeks(state, 40)
  // P06A: the played world now carries `releaseCommitted` rows (V16-only Tier
  // D). This suite FORGES V14 envelopes to probe the frozen V14 shape law, so
  // its base envelope is a hand-projected V14 twin: same world, log filtered
  // to the kinds a real V14 file could carry — exactly the v13TwinOf
  // discipline one version on. The V16-only rows' own law is tested at the
  // live boundary (validateSaveV16), not here.
  const v14RepresentableLog = {
    ...managed.studioEvents,
    rows: managed.studioEvents.rows.filter((row) => row.kind !== 'releaseCommitted'),
  }
  managedSave = (
    requireFunction(core, 'makeSaveV14', '§8.1') as unknown as (s: GameState) => Envelope
  )({ ...managed, studioEvents: v14RepresentableLog })
})

function requireCore(): SaveModule {
  if (loadFailure !== null) throw loadFailure
  return core
}

function validateV14(save: unknown): unknown {
  return (
    requireFunction(requireCore(), 'validateSaveV14', '§8.1: the V14 boundary') as unknown as (
      s: unknown,
    ) => unknown
  )(save)
}

/** The managed V14 save with its event log replaced by a forged one. */
function withLog(rows: readonly Record<string, unknown>[], nextSeq: number): Envelope {
  const forged = clone(managedSave)
  forged.state.studioEvents = { nextSeq, rows: clone(rows) }
  return forged
}

// P06A: `releaseCommitted` is a V16-only Tier-D kind — the frozen V14 boundary
// RIGHTLY refuses it, so its shape law is proven at ITS OWN boundary (the live
// V16 validator) through the same forged-log discipline. Every pre-existing
// kind keeps its V14-boundary probe untouched.
function validateAtOwningBoundary(kind: string, rows: readonly Record<string, unknown>[], nextSeq: number): void {
  if (kind === 'releaseCommitted') {
    const makeSaveLive = requireFunction(requireCore(), 'makeSave', 'P08A live boundary') as unknown as (
      s: GameState,
    ) => { state: Record<string, unknown> }
    const validateLive = requireFunction(requireCore(), 'validateSaveV17', 'P08A live boundary') as unknown as (
      save: unknown,
    ) => unknown
    const forged = clone(makeSaveLive(managed) as unknown as Envelope)
    forged.state.studioEvents = { nextSeq, rows: clone(rows) }
    validateLive(forged)
    return
  }
  validateV14(withLog(rows, nextSeq))
}

function currentWeek(): number {
  return (managedSave.state.market as { tick: number }).tick
}

// ── (A) §5.5 — the legacy/headless path has no history at all ───────────────

describe('C2a-M1 · events (A) — the legacy path yields an empty ledger', () => {
  it('records nothing across a seeded year, at every week of it', () => {
    requireCore()
    let state = legacyWorld('c2a-m1-events-legacy', 0)
    expect(state.operations.mode).toBe('legacy')

    const tickFn = requireFunction(core, 'tick', 'the engine step') as unknown as (
      s: GameState,
    ) => GameState
    for (let week = 1; week <= LEGACY_YEAR_WEEKS; week++) {
      state = tickFn(state)
      const log = requireStudioEvents(state, `legacy week ${String(week)}`)
      expect(log.rows, `the legacy path wrote history at week ${String(week)}`).toEqual([])
      expect(log.nextSeq, `legacy nextSeq moved at week ${String(week)}`).toBe(0)
    }
    // Non-vacuity: a year really passed and the world really ran.
    expect(state.market.tick).toBe(LEGACY_YEAR_WEEKS)
    expect(state.operations.mode).toBe('legacy')
    expect(state.talent.length).toBeGreaterThan(0)
  })

  it('refuses a legacy save that carries so much as one row', () => {
    // The §5.5 gate is `operations.mode === 'managed'`. A legacy file with history
    // is a file the engine could not have written, and the boundary says so.
    const makeV14 = requireFunction(requireCore(), 'makeSaveV14', '§8.1') as unknown as (
      s: GameState,
    ) => Envelope
    const legacySave = makeV14(legacyWorld('c2a-m1-events-legacy-forge', 8))
    expect(() => validateV14(legacySave)).not.toThrow()

    const forged = clone(legacySave)
    forged.state.studioEvents = {
      nextSeq: 1,
      rows: [charterStudioEventRow('premiere', 0, (forged.state.market as { tick: number }).tick)],
    }
    expect(() => validateV14(forged), 'a legacy save carried studio history').toThrow()
  })
})

// ── (B) §8.1 / §5.1 — the row schema, and the two fields that may never exist ─

describe('C2a-M1 · events (B) — every row carries exactly the keys §8.1 gives it', () => {
  it('partitions all eleven kinds into Tier D and Tier W, with no overlap and no gap', () => {
    expect(TIER_D_EVENT_KINDS.length + TIER_W_EVENT_KINDS.length).toBe(
      CHARTER_STUDIO_EVENT_KINDS.length,
    )
    expect(CHARTER_STUDIO_EVENT_KINDS.length).toBe(12)
    for (const kind of CHARTER_STUDIO_EVENT_KINDS) {
      expect(isTierD(kind) !== isTierW(kind), `${kind} is in neither tier or in both`).toBe(true)
      expect(Object.keys(STUDIO_EVENT_ROW_KEYS), `${kind} has no §8.1 key list`).toContain(kind)
    }
    // The engine's own tier reading must agree with the charter's, or the two
    // tables have already drifted.
    for (const kind of CHARTER_STUDIO_EVENT_KINDS) {
      expect(events.isTierDStudioEventKind(kind), kind).toBe(isTierD(kind))
    }
  })

  for (const kind of CHARTER_STUDIO_EVENT_KINDS) {
    it(`accepts a legal ${kind} row and refuses the same row plus a cursor field`, () => {
      requireCore()
      const week = currentWeek()
      const row = charterStudioEventRow(kind, 0, week)
      expect(Object.keys(row).sort()).toEqual([...STUDIO_EVENT_ROW_KEYS[kind]!].sort())

      // The shape the charter states is the shape ITS OWN boundary accepts…
      expect(() => validateAtOwningBoundary(kind, [row], 1), `${kind} row refused`).not.toThrow()

      // …and §5.1's prohibition is enforced by an EXACT key list, which is the
      // only form of "never" a later maintainer cannot quietly widen.
      for (const forbidden of FORBIDDEN_EVENT_ROW_KEYS) {
        const forged = { ...row, [forbidden]: false }
        expect(
          () => validateAtOwningBoundary(kind, [forged], 1),
          `a ${kind} row carrying "${forbidden}" was accepted — §5.1 forbids it forever`,
        ).toThrow()
      }
    })
  }

  it('accepts every kind in one log at its owning boundary, so no kind is legal only alone', () => {
    const week = currentWeek()
    // The eleven V14-representable kinds together at the frozen V14 boundary…
    const v14Rows = CHARTER_STUDIO_EVENT_KINDS.filter((kind) => kind !== 'releaseCommitted').map(
      (kind, index) => charterStudioEventRow(kind, index, week),
    )
    expect(() => validateV14(withLog(v14Rows, v14Rows.length))).not.toThrow()
    // …and all twelve together at the live V16 boundary (P06A). The V15+
    // boundary demands the widened queueIntentExpired subjectId leaf, so the
    // live form of that one row carries its honest null.
    const allRows = CHARTER_STUDIO_EVENT_KINDS.map((kind, index) => {
      const row = charterStudioEventRow(kind, index, week)
      return row.kind === 'queueIntentExpired' ? { ...row, subjectId: null } : row
    })
    expect(() => validateAtOwningBoundary('releaseCommitted', allRows, allRows.length)).not.toThrow()
  })
})

// ── (C) §5.3 — the sequence never rewinds ───────────────────────────────────

describe('C2a-M1 · events (C) — nextSeq is strictly monotonic and never reissued', () => {
  it('refuses a reused, descending, or at-the-counter sequence number', () => {
    requireCore()
    const week = currentWeek()
    const first = charterStudioEventRow('premiere', 0, week)
    const second = charterStudioEventRow('setBuilt', 1, week)

    expect(() => validateV14(withLog([first, second], 2))).not.toThrow()

    // A row AT the counter means the next append would reissue its number.
    expect(() => validateV14(withLog([charterStudioEventRow('premiere', 1, week)], 1))).toThrow()
    // Two rows with the same seq: one identity, two facts.
    expect(() =>
      validateV14(withLog([first, charterStudioEventRow('setBuilt', 0, week)], 5)),
    ).toThrow()
    // Descending.
    expect(() => validateV14(withLog([second, first], 5))).toThrow()
    // A row from the future is not history.
    expect(() =>
      validateV14(withLog([charterStudioEventRow('premiere', 0, week + 1)], 1)),
    ).toThrow()
  })

  it('carries nextSeq through compaction untouched, and renumbers nothing', () => {
    const week = currentWeek()
    const window = studioEventWindowWeeks()
    const log: StudioEventLogShape = {
      nextSeq: 9,
      rows: [
        charterStudioEventRow('premiere', 0, 0),
        charterStudioEventRow('phaseEntered', 3, 0),
        charterStudioEventRow('sceneryArrived', 5, week - window + 1),
        charterStudioEventRow('setBuilt', 7, week),
      ],
    }
    const compacted = events.compactStudioEvents(clone(log), week)

    // Compaction removes rows; it never renumbers them and never rewinds the
    // counter — a reissued `seq` is a reissued identity.
    expect(compacted.nextSeq).toBe(log.nextSeq)
    expect(compacted.rows.map((row) => row.seq)).toEqual([0, 5, 7])
    for (const row of compacted.rows) {
      const original = log.rows.find((entry) => entry.seq === row.seq)!
      expect(stableStringify(row)).toBe(stableStringify(original))
    }
    // Strictly ascending, still, and still below the counter.
    const sequences = compacted.rows.map((row) => row.seq)
    expect([...sequences].sort((a, b) => a - b)).toEqual(sequences)
    for (const seq of sequences) expect(seq).toBeLessThan(compacted.nextSeq)
  })
})

// ── (D) §5.3 — the two-tier retention law ───────────────────────────────────

describe('C2a-M1 · events (D) — Tier W is windowed, Tier D is permanent', () => {
  it('names the window as a TUNING constant, not a literal at the compaction site', () => {
    expect(studioEventWindowWeeks()).toBeGreaterThan(0)
  })

  it('refuses a Tier-W row older than the window and accepts the oldest kept week', () => {
    requireCore()
    const week = currentWeek()
    const window = studioEventWindowWeeks()
    expect(week, 'the fixture must be played past the window or this proves nothing').toBeGreaterThan(
      window,
    )

    for (const kind of TIER_W_EVENT_KINDS) {
      expect(
        () => validateV14(withLog([charterStudioEventRow(kind, 0, week - window)], 1)),
        `a ${kind} row older than the window survived compaction`,
      ).toThrow()
      expect(
        () => validateV14(withLog([charterStudioEventRow(kind, 0, week - window + 1)], 1)),
        `a ${kind} row inside the window was wrongly refused`,
      ).not.toThrow()
    }
  })

  it('keeps every Tier-D row forever, however old', () => {
    requireCore()
    // Week 0 is older than any window the studio will ever have.
    for (const kind of TIER_D_EVENT_KINDS) {
      expect(
        () => validateAtOwningBoundary(kind, [charterStudioEventRow(kind, 0, 0)], 1),
        `${kind} is the identity-bearing tier and may never be pruned`,
      ).not.toThrow()
    }
  })

  it('compacts as a PURE function of market.tick — same tick, same retained rows', () => {
    const week = currentWeek()
    const window = studioEventWindowWeeks()
    const build = (): StudioEventLogShape => ({
      nextSeq: 12,
      rows: [
        ...TIER_D_EVENT_KINDS.map((kind, index) => charterStudioEventRow(kind, index, 0)),
        ...TIER_W_EVENT_KINDS.map((kind, index) =>
          charterStudioEventRow(kind, TIER_D_EVENT_KINDS.length + index, 0),
        ),
      ],
    })

    const once = events.compactStudioEvents(build(), week)
    // Same input built independently, same week: byte-identical answer.
    expect(stableStringify(events.compactStudioEvents(build(), week))).toBe(stableStringify(once))
    // Idempotent at the same week — compaction has already reached its fixed point.
    expect(stableStringify(events.compactStudioEvents(clone(once), week))).toBe(
      stableStringify(once),
    )

    // Every Tier-D row survived; every Tier-W row from week 0 is gone.
    expect(once.rows.map((row) => row.kind)).toEqual([...TIER_D_EVENT_KINDS])
    for (const row of once.rows) expect(isTierD(row.kind)).toBe(true)

    // …and non-vacuity: the window really did the removing.
    expect(build().rows.length).toBeGreaterThan(once.rows.length)
    const stillEarly = events.compactStudioEvents(build(), window - 1)
    expect(stillEarly.rows.length).toBe(build().rows.length)
  })
})

// ── (E) §12-M1 — the engine actually writes the history ─────────────────────

describe('C2a-M1 · events (E) — a managed studio accumulates its own history', () => {
  it('appends the Tier-D `wrapped` row §12-M1 names, and a premiere with it', () => {
    requireCore()
    // Non-vacuity first: the run really wrapped and released a picture.
    expect(
      managed.studio.releasedFilms.length,
      'the scripted run must release a picture or this proves nothing',
    ).toBeGreaterThan(0)

    const log = requireStudioEvents(managed, 'the played managed studio')
    const kinds = new Set(log.rows.map((row) => row.kind))
    expect(
      kinds.has('wrapped'),
      'C2a-M1 (§12-M1): "the Tier-D `wrapped` engine event" lands in this milestone. A ' +
        'managed studio that carried a picture through to release recorded no wrap.',
    ).toBe(true)
    expect(log.nextSeq).toBeGreaterThan(0)
    expect(log.rows.length).toBeGreaterThan(0)
  })

  it('gives every appended row exactly its §8.1 own-key list — no cursor field anywhere', () => {
    const log = requireStudioEvents(managed, 'the played managed studio')
    expect(log.rows.length, 'no rows were appended; the key law has no subject').toBeGreaterThan(0)
    for (const row of log.rows) {
      const expected = STUDIO_EVENT_ROW_KEYS[row.kind]
      expect(expected, `the engine appended an unknown kind ${row.kind}`).toBeDefined()
      expect(Object.keys(row).sort()).toEqual([...expected!].sort())
      for (const forbidden of FORBIDDEN_EVENT_ROW_KEYS) {
        expect(forbidden in row, `row ${String(row.seq)} carries "${forbidden}"`).toBe(false)
      }
    }
  })

  it('keeps nextSeq strictly ahead of every row it ever issued', () => {
    const log = requireStudioEvents(managed, 'the played managed studio')
    expect(log.rows.length).toBeGreaterThan(0)
    let previous = -1
    for (const row of log.rows) {
      expect(row.seq).toBeGreaterThan(previous)
      previous = row.seq
    }
    expect(log.nextSeq).toBeGreaterThan(previous)
  })
})
