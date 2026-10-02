// ── P15A.1 Wave 2 RED r3 (records 1355-C2, 1355-C3): phase identity survives a catalogue upgrade ──
//
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/): 1355-B2 Blocking 2
// and 1355-F3 (`market-phase-version-immutable`, annex K.1 `market-phase-catalogue-upgrade`); 1355-F2
// item 3 (a row keeps the version it was written under; versions are added, never rewritten); 1355-F4
// R4 and its ruling; 1355-F5 item 1 (binding). The leaf mocks `p15Phases.js` with `importOriginal` plus
// one added version-2 table and replaces nothing else, so 1356-C's module may freeze its tables.
// SEAM (1355-F5): every P15 validator resolves a row's phase entry as
// `P15_PHASE_TABLES[row.phaseOrderVersion]`, read through the module's exported binding. A validator
// that pins rows to the live version, or reads a table a helper closes over, refuses the v2-declared
// row and fails this leaf. A module mock is file-wide, so this leaf lives in its own file.
//
// RED BY DESIGN against 1063ab4f: `src/core/p15Phases.ts` and the `sharedMarket` root do not exist.
import { describe, expect, it, vi } from 'vitest'
import { makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { canon, MARKET_PHASE_ID, marketRoot, rivalRouteAt, type PersistedAssessment } from './helpers/p15a1-market-route.js'

type Entry = { phaseId: string; phaseOrdinal: number }
type Tables = Readonly<Record<number, readonly Entry[]>>

vi.mock('../src/core/p15Phases.js', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  const live = actual.P15_PHASE_ORDER_VERSION as number
  const known = actual.P15_PHASE_TABLES as Tables
  // Version live + 1 inserts a phase before every live phase, so each live phase moves up one ordinal.
  // Nothing else is replaced (1355-F5 item 1).
  return { ...actual, P15_PHASE_TABLES: { ...known, [live + 1]: [{ phaseId: 'p15x.reservedBeforeMarket', phaseOrdinal: 1 },
    ...known[live]!.map((entry) => ({ phaseId: entry.phaseId, phaseOrdinal: entry.phaseOrdinal + 1 }))] } }
})

describe('p15a1 market phase identity (1355-F3; 1355-F4 R4)', () => {
  it('market-phase-version-immutable: v1 rows keep their triple under a v2 table, a row declared v2 with v2\'s ordinal validates, a triple off its own version refuses by name', async () => {
    let phases: Record<string, unknown>
    try {
      phases = (await import('../src/core/p15Phases.js')) as unknown as Record<string, unknown>
    } catch (error) {
      throw new Error(`RED: src/core/p15Phases.ts cannot be loaded (1355-F2 item 3; 1356-C owns it): ${(error as Error).message}`)
    }
    const live = phases.P15_PHASE_ORDER_VERSION as number
    const tables = phases.P15_PHASE_TABLES as Tables
    const v1Ordinal = tables[live]!.find((entry) => entry.phaseId === MARKET_PHASE_ID)!.phaseOrdinal
    const v2Ordinal = tables[live + 1]!.find((entry) => entry.phaseId === MARKET_PHASE_ID)!.phaseOrdinal
    expect(v2Ordinal, 'premise: the added table moves the market batch').not.toBe(v1Ordinal)

    const state = rivalRouteAt(70)
    const rows = marketRoot(state).assessments
    expect(rows.length, 'premise: recorded assessments').toBeGreaterThan(0)
    for (const row of rows) expect([row.phaseId, row.phaseOrdinal, row.phaseOrderVersion]).toEqual([MARKET_PHASE_ID, v1Ordinal, live])
    // Rows written under the live version keep their triple and validate beside a later table; later
    // ticks write the live version and leave the old rows byte-identical.
    expect(() => makeSave(state)).not.toThrow()
    expect(canon(marketRoot(tick(tick(state))).assessments.slice(0, rows.length))).toBe(canon(rows))

    const withFirstRow = (edit: Partial<PersistedAssessment>): GameState => {
      const forged = structuredClone(state)
      Object.assign(marketRoot(forged).assessments[0]!, edit)
      return forged
    }
    // Read under its own version: a row declared v2 with v2's ordinal validates. A validator that
    // pins every row to the live version refuses it.
    expect(() => makeSave(withFirstRow({ phaseOrderVersion: live + 1, phaseOrdinal: v2Ordinal }))).not.toThrow()
    // A triple off its own version's entry refuses by name, either way round.
    expect(() => makeSave(withFirstRow({ phaseOrderVersion: live + 1, phaseOrdinal: v1Ordinal }))).toThrow(/phase/i)
    expect(() => makeSave(withFirstRow({ phaseOrdinal: v2Ordinal }))).toThrow(/phase/i)
  }, 600_000)
})
