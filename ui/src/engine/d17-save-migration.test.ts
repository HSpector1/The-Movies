// ── D-17A / T10 — the ADAPTER load path recovers the persisted engagement fact ────
//
// `importSaveJson` is the only way a save reaches the running game, so the R2 closure is
// only real if a LITERAL historical V5 JSON file comes back with the right regime.
// These tests take real V5 JSON (not a later state mislabeled as V5) through the
// adapter and assert the reconstructed fact at the current V11 boundary.
//
// Runs under the `ui` vitest project because it imports the adapter.

import { describe, it, expect } from 'vitest'
import { exportSaveJson, importSaveJson } from './adapter.ts'
import { newFoundedGame } from '../test/founding.ts'
import {
  applyActions,
  exportSave,
  generateWorld,
  makeSaveV2,
  makeSaveV5,
  makeSaveV8,
  makeSaveV10,
  OracleAgent,
  tick,
  validateSaveV2,
} from '../../../src/core/index.ts'
import type { GameState, GameStateV5, GameStateV8 } from '../../../src/core/index.ts'

// Frozen fixtures are exact projections. If a later root leaks into the old envelope,
// the migration test can pass even when the converter fails to reconstruct that root.
function toV5(s: GameState): GameStateV5 {
  const {
    economyEngagedEver: _economyEngagedEver,
    publicity: _publicity,
    operations: _operations,
    scriptDevelopment: _scriptDevelopment,
    castingSessions: _castingSessions,
    ...v5
  } = makeSaveV10(s).state
  return v5
}

function toV8(s: GameState): GameStateV8 {
  const { scriptDevelopment: _scriptDevelopment, castingSessions: _castingSessions, ...v8 } = makeSaveV10(s).state
  return v8
}

function v5Json(s: GameState): string {
  return exportSave(makeSaveV5(toV5(s)))
}

// A headless (never-engaged) world advanced far enough to release films on the D-1 path,
// so its ledger carries `production` + `boxOffice` — the kinds the predicate must ignore.
function headless(seed: string, weeks: number): GameState {
  let s = generateWorld(seed)
  for (let i = 0; i < weeks; i++) {
    s = applyActions(s, OracleAgent.chooseActions(s))
    // P06A W1: a picture at remainingTicks===1 HOLDS until explicitly committed to
    // release — commit every such picture immediately before the tick that would
    // otherwise have released it, so this headless walk still releases films.
    const ready = s.studio.activeProductions.filter((p) => p.remainingTicks === 1)
    if (ready.length > 0) {
      s = applyActions(
        s,
        ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
      )
    }
    s = tick(s)
  }
  return s
}

describe('V11: adapter migration preserves an honest pre-ledger cash checkpoint', () => {
  it('a played literal V2 save preserves its pre-ledger cash checkpoint when upgraded to V11', () => {
    const before = generateWorld('d17-adapter-v2-played-cash')
    const actions = OracleAgent.chooseActions(before)
    expect(actions.some((action) => action.kind === 'greenlight')).toBe(true)

    const played = applyActions(before, actions)
    expect(played.studio.cash).toBeLessThan(before.studio.cash)
    expect(played.ledger.length).toBeGreaterThan(0)

    // makeSaveV2 is the authoritative frozen projection: its literal JSON owns the
    // played cash/RNG, but predates the ledger and therefore cannot carry its rows.
    const json = exportSave(makeSaveV2(played))
    const literal = JSON.parse(json)
    expect(literal.saveVersion).toBe(2)
    expect('ledger' in literal.state).toBe(false)
    expect(() => validateSaveV2(literal)).not.toThrow()

    const legacyCash = literal.state.studio.cash
    const legacyRngState = literal.state.rngState
    const r = importSaveJson(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.converted).toBe(true)
    expect(r.state.studio.cash).toBe(legacyCash)
    expect(r.state.rngState).toBe(legacyRngState)
    expect(r.state.ledger).toEqual([])
    expect(Object.hasOwn(r.state, 'cashLedgerCheckpoint')).toBe(true)
    expect(r.state.cashLedgerCheckpoint).toEqual({ cash: legacyCash, ledgerLength: 0 })
  })
})

describe('D-17A: importSaveJson recovers economyEngagedEver from a literal V5 file', () => {
  it('an ENGAGED V5 save loads into the current state with engagement preserved', () => {
    const json = v5Json(newFoundedGame('d17-adapter-engaged'))
    expect(JSON.parse(json).saveVersion).toBe(5)
    expect('economyEngagedEver' in JSON.parse(json).state).toBe(false)

    const r = importSaveJson(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.converted).toBe(true) // the UI tells the player their save was upgraded
    expect(r.state.economyEngagedEver).toBe(true)
  })

  it('a NEVER-ENGAGED V5 save loads as a non-engaged studio (byte-identical behaviour)', () => {
    const s = headless('d17-adapter-headless', 30)
    expect(s.studio.releasedFilms.length).toBeGreaterThan(0)
    const json = v5Json(s)

    const r = importSaveJson(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.converted).toBe(true)
    expect(r.state.economyEngagedEver).toBe(false)
  })

  it('a CURRENT-version save round-trips through the adapter as NOT converted', () => {
    const state = newFoundedGame('d17-adapter-v10')
    const json = exportSaveJson(state)
    expect(JSON.parse(json).saveVersion).toBe(16) // P06A: new games save as SaveFileV16

    const r = importSaveJson(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.converted).toBe(false)
    expect(r.state.economyEngagedEver).toBe(true)
    expect(exportSaveJson(r.state)).toBe(json)
  })

  it('a literal V8 save upgrades to V16 with legacy screenplay, casting, construction, placement, and property state', () => {
    const state = newFoundedGame('d17-adapter-v8')
    const json = exportSave(makeSaveV8(toV8(state)))
    const parsed = JSON.parse(json)
    expect(parsed.saveVersion).toBe(8)
    expect('scriptDevelopment' in parsed.state).toBe(false)

    const r = importSaveJson(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.converted).toBe(true)
    expect(r.state.operations).toEqual(state.operations)
    expect(r.state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] })
    expect(r.state.castingSessions).toEqual({ mode: 'legacy', sessions: [] })
    expect(JSON.parse(exportSaveJson(r.state)).saveVersion).toBe(16) // P04A
  })

  it('a V5 file with a hand-added economyEngagedEver is still read as V5 (the flag is recomputed)', () => {
    // Defensive: the V5 envelope has no such field. A tampered one must not be trusted —
    // saveVersion 5 dispatches to validateSaveV5, and convertV5ToV6 recomputes from evidence.
    const s = headless('d17-adapter-tamper', 30)
    const parsed = JSON.parse(v5Json(s))
    parsed.state.economyEngagedEver = true // a lie: this studio never engaged

    const r = importSaveJson(JSON.stringify(parsed))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.economyEngagedEver).toBe(false)
  })
})
