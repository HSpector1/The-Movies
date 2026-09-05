// ── C2a-M1 · BYTE-PARITY OF THE V14 SAVE (§5.1, §5.3, §8, §12-M1) ───────────
//
// CHARTER (r3.2 §5.1): "No `seen`/`consumed` field ever (byte-parity, PF1 §2)."
// The prohibition is not fastidiousness about schema size — it is a consequence.
// A consumption marker written into `GameState` would make two identical
// playthroughs export different bytes, and §12-M1's gate is "M0A corpus
// byte-identity" plus "dual-run equality vs all 17 detectors."
//
// CHARTER (r3.2 §5.3): Tier W is "compacted as a pure function of `market.tick`".
// A pure function of the week is exactly what makes two runs of the same script
// agree: if compaction consulted anything else — arrival order, a cursor, a
// clock — the two exports would diverge at the first pruned row.
//
// WHAT IS PROVED HERE, and in what order:
//   (A) the same seeded managed script, run twice, exports the same bytes; the
//       bytes survive a round trip; and a different seed does NOT produce them,
//       so the equality is a fact about determinism rather than about an export
//       that discards everything interesting.
//   (B) a run interrupted by a save/load exports the same bytes as one that was
//       never interrupted (§5.4: the ledger "survives reload").
//   (C) every row a V14 export carries is inside the retention window or is
//       Tier D — the §5.3 law, read off a real exported file rather than a
//       forged one.
//
// (C) requires the M1 producers (§12-M1 "`studioEvents` phases 0–2" + "the
// Tier-D `wrapped` engine event"). Until they are wired the run has no rows and
// the assertions fail by their own non-vacuity guard, which is the contract
// reporting itself. The forged-row form of the same law is held at the boundary
// in `studio-events.contract.test.ts`.

import { beforeAll, describe, expect, it } from 'vitest'

import { applyActions, stableStringify } from '../../src/core/index.js'
import type { GameState } from '../../src/core/index.js'

import { operationsStudio, productionPayload, withCash } from './_contractFixtures.js'
import {
  isTierD,
  loadCoreModule,
  requireFunction,
  requireStudioEvents,
  runScriptedWeeks,
  studioEventWindowWeeks,
} from './_v14Contract.js'
import type { SaveModule } from './_v14Contract.js'

type Envelope = { saveVersion: number; state: Record<string, unknown> } & Record<string, unknown>

let core: SaveModule
let loadFailure: unknown = null

/** Long enough that the retention window has closed behind the run twice over. */
const RUN_WEEKS = 60
const HALFWAY = 30

beforeAll(async () => {
  try {
    core = await loadCoreModule()
  } catch (error) {
    loadFailure = error
  }
})

function requireCore(): SaveModule {
  if (loadFailure !== null) throw loadFailure
  return core
}

function makeSave(state: GameState): Envelope {
  return (
    requireFunction(requireCore(), 'makeSave', 'the live save boundary') as unknown as (
      s: GameState,
    ) => Envelope
  )(state)
}

function exportSave(save: Envelope): string {
  return (
    requireFunction(requireCore(), 'exportSave', '§17: the deterministic serializer') as unknown as (
      s: Envelope,
    ) => string
  )(save)
}

function importSave(json: string): Envelope {
  return (
    requireFunction(requireCore(), 'importSave', '§17: the load boundary') as unknown as (
      json: string,
    ) => Envelope
  )(json)
}

/**
 * ONE seeded managed script. Every run in this file is this function; nothing
 * about a run is decided outside it, so "the same script" is a fact rather than
 * an intention.
 */
function scriptedStart(seed: string): GameState {
  const founded = withCash(operationsStudio(seed), 50_000_000)
  return applyActions(founded, [{ kind: 'greenlight', production: productionPayload(founded) }])
}

const SEED = 'c2a-m1-byte-parity'

// ── (A) two identical runs export identical bytes ───────────────────────────

describe('C2a-M1 · parity (A) — the same seeded script exports the same bytes', () => {
  it('produces a byte-identical export from two independent runs', () => {
    requireCore()
    const first = runScriptedWeeks(scriptedStart(SEED), RUN_WEEKS)
    const second = runScriptedWeeks(scriptedStart(SEED), RUN_WEEKS)

    const firstJson = exportSave(makeSave(first))
    expect(exportSave(makeSave(second))).toBe(firstJson)
    // And at the state level, so a divergence cannot hide behind the envelope.
    expect(stableStringify(second)).toBe(stableStringify(first))

    // Non-vacuity: the run is a real campaign, not an empty world.
    expect(first.market.tick).toBe(RUN_WEEKS)
    expect(first.studio.releasedFilms.length).toBeGreaterThan(0)
    expect(first.ledger.length).toBeGreaterThan(RUN_WEEKS)
    expect(firstJson.length).toBeGreaterThan(10_000)
  })

  it('does NOT produce those bytes from a different seed', () => {
    // Otherwise (A) would be satisfied by an export that threw the game away.
    const other = runScriptedWeeks(scriptedStart(`${SEED}-other`), RUN_WEEKS)
    const same = runScriptedWeeks(scriptedStart(SEED), RUN_WEEKS)
    expect(exportSave(makeSave(other))).not.toBe(exportSave(makeSave(same)))
  })

  it('round-trips export → import → export byte-identically', () => {
    const played = runScriptedWeeks(scriptedStart(SEED), HALFWAY)
    const json = exportSave(makeSave(played))
    expect(exportSave(importSave(json))).toBe(json)
  })
})

// ── (B) a reload changes nothing ────────────────────────────────────────────

describe('C2a-M1 · parity (B) — the ledger survives a reload', () => {
  it('exports the same bytes whether or not the run was saved and loaded midway', () => {
    requireCore()
    const uninterrupted = runScriptedWeeks(scriptedStart(SEED), RUN_WEEKS)

    const midway = runScriptedWeeks(scriptedStart(SEED), HALFWAY)
    const reloaded = importSave(exportSave(makeSave(midway))).state as unknown as GameState
    const resumed = runScriptedWeeks(reloaded, RUN_WEEKS - HALFWAY)

    expect(resumed.market.tick).toBe(uninterrupted.market.tick)
    expect(
      exportSave(makeSave(resumed)),
      'C2a-M1 (§5.4): a run that was saved and loaded diverged from one that was not. ' +
        'Exact-once delivery is "idempotent above a cursor" precisely so that a reload ' +
        'costs the save nothing — a cursor written INTO the state would show up here.',
    ).toBe(exportSave(makeSave(uninterrupted)))
  })
})

// ── (C) the exported history obeys the window ───────────────────────────────

describe('C2a-M1 · parity (C) — every exported row is inside the window or Tier D', () => {
  it('holds the §5.3 retention law on a real exported file', () => {
    requireCore()
    const played = runScriptedWeeks(scriptedStart(SEED), RUN_WEEKS)
    const save = makeSave(played)
    const log = requireStudioEvents(save.state as unknown as object, 'the exported V14 save')
    const week = (save.state.market as { tick: number }).tick
    const oldestKept = week - (studioEventWindowWeeks() - 1)

    expect(
      log.rows.length,
      'C2a-M1 (§12-M1): a managed studio played for ' +
        `${String(RUN_WEEKS)} weeks exported an EMPTY studio event ledger. The M1 producers ` +
        '("`studioEvents` phases 0–2" + the Tier-D `wrapped` event) are what give this ' +
        'law a subject.',
    ).toBeGreaterThan(0)

    for (const row of log.rows) {
      if (isTierD(row.kind)) continue
      expect(
        row.week,
        `a Tier-W ${row.kind} row from week ${String(row.week)} survived past the window`,
      ).toBeGreaterThanOrEqual(oldestKept)
      expect(row.week).toBeLessThanOrEqual(week)
    }

    // Non-vacuity for the OTHER half of the law: Tier D really is exempt, which
    // can only be observed once a permanent row is older than the window.
    const permanentAndOld = log.rows.filter((row) => isTierD(row.kind) && row.week < oldestKept)
    expect(
      permanentAndOld.length,
      'no Tier-D row is older than the retention window, so "Tier D is permanent" is ' +
        'not actually being tested by this run',
    ).toBeGreaterThan(0)
  })

  it('re-validates what it wrote, at its own version', () => {
    const validateV15 = requireFunction(
      requireCore(),
      'validateSaveV18',
      '§8.1: the live boundary (P08A: V17)',
    ) as unknown as (save: unknown) => unknown
    const save = makeSave(runScriptedWeeks(scriptedStart(SEED), RUN_WEEKS))
    expect(save.saveVersion).toBe(18)
    expect(() => validateV15(save)).not.toThrow()
  })
})
