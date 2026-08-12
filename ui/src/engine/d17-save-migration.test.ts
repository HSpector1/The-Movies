// ── D-17A / T10 — the ADAPTER load path recovers the persisted engagement fact ────
//
// `importSaveJson` is the only way a save reaches the running game, so the R2 closure is
// only real if a LITERAL V5 JSON file — the shape every existing player save is on disk
// right now — comes back with the right regime. These tests take real V5 JSON (not a
// V6 pretending to be one) through the adapter and assert the reconstructed fact.
//
// Runs under the `ui` vitest project because it imports the adapter.

import { describe, it, expect } from 'vitest'
import { exportSaveJson, importSaveJson } from './adapter.ts'
import { newFoundedGame } from '../test/founding.ts'
import {
  applyActions,
  exportSave,
  generateWorld,
  makeSaveV5,
  OracleAgent,
  tick,
} from '../../../src/core/index.ts'
import type { GameState, GameStateV5 } from '../../../src/core/index.ts'

// Strip the live state back to the FROZEN GameStateV5 shape a real V5 save carries.
function toV5(s: GameState): GameStateV5 {
  const { economyEngagedEver: _dropped, ...v5 } = s
  return v5
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
    s = tick(s)
  }
  return s
}

describe('D-17A: importSaveJson recovers economyEngagedEver from a literal V5 file', () => {
  it('an ENGAGED V5 save loads as an engaged V6 studio', () => {
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

  it('a V6 save round-trips through the adapter as NOT converted', () => {
    const state = newFoundedGame('d17-adapter-v6')
    const json = exportSaveJson(state)
    expect(JSON.parse(json).saveVersion).toBe(6)

    const r = importSaveJson(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.converted).toBe(false)
    expect(r.state.economyEngagedEver).toBe(true)
    expect(exportSaveJson(r.state)).toBe(json)
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
