// ── D-17B §5 / §6 (E4) — SaveFileV7 and the `publicity` ledger kind ───────────
// Authority: docs/D-17B-CANDIDATE-DESIGN-CONTRACT.md §5 (+ §0 escalation E4);
// Owner authorization §4 G ("save state strictly required for the Publicity mechanic")
// and §24 (existing version if safely possible, else bump deliberately; deterministic
// migration; no guessed history; replay determinism mandatory).
//
// V7 adds ONE field: `GameState.publicity`, a pair of cooldown clocks. Everything the
// house demands of a version bump is asserted here — deterministic and idempotent
// conversion, an untouched `rngState`, an unmutated input, no invented history, a loud
// unknown-version boundary that has MOVED to 8, and the frozen V6 shape staying frozen.

import { describe, expect, it } from 'vitest'
import { expectForwardHistoryTwin } from './_p08HistoryTwins.js'
import {
  applyActions,
  beginFounding,
  convertV5ToV6,
  convertV6ToV7,
  emptyPublicityState,
  economyEngaged,
  exportSave,
  financeTotals,
  FOUNDING_MINIMUMS,
  generateWorld,
  importSave,
  makeSaveV5,
  makeSaveV6,
  makeSaveV7,
  makeSaveV10,
  migrateToV6,
  migrateToV7,
  OracleAgent,
  periodSummary,
  stableStringify,
  tick,
  validateSave,
  validateSaveV7,
  convertV7ToV8,
  convertV8ToV9,
  convertV9ToV10,
  convertV10ToV11,
  convertV11ToV12,
  convertV12ToV13,
  convertV13ToV14,
  convertV14ToV15,
  convertV15ToV16,
  convertV16ToV17,
} from '../src/core/index.js'
import type {
  CreativeRole,
  GameState,
  GameStateV5,
  GameStateV6,
  GameStateV7,
  LedgerEntry,
  LedgerKindV10,
} from '../src/core/index.js'

// ── frozen-shape strip helpers (M8) ───────────────────────────────────────────
// Typed so an omission is a COMPILE error: a fixture that already carried `publicity`
// would make every migration assertion below vacuous.
function toV6(s: GameState): GameStateV6 {
  const { publicity: _publicity, operations: _operations, scriptDevelopment: _scripts, castingSessions: _casting, ...v6 } = makeSaveV10(s).state
  return v6
}
function toV7(s: GameState): GameStateV7 {
  const { operations: _operations, scriptDevelopment: _scripts, castingSessions: _casting, ...v7 } = makeSaveV10(s).state
  return v7
}
function frozenV7ToV6(s: GameStateV7): GameStateV6 {
  const { publicity: _publicity, ...v6 } = s
  return v6
}
function toV5(s: GameState): GameStateV5 {
  const { publicity: _publicity, operations: _operations, scriptDevelopment: _scripts, castingSessions: _casting, economyEngagedEver: _flag, ...v5 } = makeSaveV10(s).state
  return v5
}

function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  for (const t of [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]) {
    s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  }
  return applyActions(s, [{ kind: 'foundStudio' }])
}

const EMPTY = emptyPublicityState()

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17B/E4 — the empty publicity state is the seeded default everywhere', () => {
  it('a generated world carries it, and it means "never bought a campaign"', () => {
    const w = generateWorld('d17b-v7-world')
    expect(w.publicity).toEqual(EMPTY)
    expect(w.publicity.lastUsedWeek).toBeNull()
    expect(w.publicity.byTier.whisper).toBeNull()
    expect(w.publicity.byTier.push).toBeNull()
    expect(w.publicity.byTier.blitz).toBeNull()
  })

  it('a founded studio still carries it (founding invents no campaign history)', () => {
    expect(foundStudio('d17b-v7-found').publicity).toEqual(EMPTY)
  })

  it('ticking a headless world never creates campaign state (the action is engaged-only)', () => {
    let s = generateWorld('d17b-v7-headless')
    for (let t = 0; t < 20; t++) {
      s = applyActions(s, OracleAgent.chooseActions(s))
      s = tick(s)
    }
    expect(economyEngaged(s)).toBe(false)
    expect(s.publicity).toEqual(EMPTY)
    expect(s.ledger.some((e) => e.kind === 'publicity')).toBe(false)
  })

  it('emptyPublicityState() returns a FRESH object each call (no shared mutable default)', () => {
    expect(emptyPublicityState()).not.toBe(emptyPublicityState())
    expect(emptyPublicityState()).toEqual(emptyPublicityState())
  })
})

describe('D-17B/E4 — the frozen V7 envelope remains valid and isolated', () => {
  it('makeSaveV7 writes a real SaveFileV7 with no V8 operations field', () => {
    const save = makeSaveV7(toV7(foundStudio('d17b-v7-new')))
    expect(save.saveVersion).toBe(7)
    expect(save.state.publicity).toEqual(EMPTY)
    expect('operations' in save.state).toBe(false)
    expect(validateSave(save)).toBe(save)
    expect(validateSaveV7(save)).toBe(save)
  })

  it('validateSaveV7 rejects a non-7 envelope loudly', () => {
    const save = makeSaveV7(toV7(foundStudio('d17b-v7-badver')))
    expect(() => validateSaveV7({ ...save, saveVersion: 6 })).toThrow(/expected saveVersion 7/)
  })

  it('V7 through V16 are known, so the unknown-version boundary is now 17', () => {
    const save = makeSaveV7(toV7(foundStudio('d17b-v7-boundary')))
    expect(() => validateSave({ ...save, saveVersion: 18 })).toThrow(/unknown saveVersion 18/)
    expect(() => validateSave({ ...save, saveVersion: 18 })).toThrow(/unknown saveVersion 18/)
    // P06A (W1): 16 is now a KNOWN, LIVE version — dispatch reaches validateSaveV16, which
    // fails on this V7 payload's real shape mismatch (no releaseAuthority), not the
    // unknown-version boundary.
    expect(() => validateSave({ ...save, saveVersion: 16 })).toThrow(/releaseAuthority is missing/)
  })

  it('rejects a V7 whose inherited regime fact or publicity clocks are missing/corrupt', () => {
    const save = makeSaveV7(toV7(foundStudio('d17b-v7-missing')))
    const stripped = { ...save, state: frozenV7ToV6(save.state) }
    expect(() => validateSaveV7(stripped)).toThrow(/state\.publicity is missing/)
    expect(() =>
      validateSaveV7({ ...save, state: { ...save.state, economyEngagedEver: undefined } }),
    ).toThrow(/economyEngagedEver is missing/)
    expect(() =>
      validateSaveV7({
        ...save,
        state: {
          ...save.state,
          publicity: { ...save.state.publicity, byTier: { ...save.state.publicity.byTier, push: -1 } },
        },
      }),
    ).toThrow(/byTier\.push must be null or a non-negative integer/)
  })
})

describe('D-17B/E4 — convertV6ToV7 is deterministic, idempotent and non-destructive', () => {
  const live = foundStudio('d17b-v7-convert')
  const v6 = makeSaveV6(toV6(live))

  it('adds the EMPTY publicity state and changes nothing else', () => {
    const out = convertV6ToV7(v6)
    expect(out.saveVersion).toBe(7)
    expect(out.state.publicity).toEqual(EMPTY)
    const stripped = { ...out.state } as Record<string, unknown>
    delete stripped.publicity
    expect(stableStringify(stripped)).toBe(stableStringify(v6.state))
  })

  it('is deterministic and idempotent under stableStringify', () => {
    expect(stableStringify(convertV6ToV7(v6))).toBe(stableStringify(convertV6ToV7(v6)))
    const once = convertV6ToV7(v6)
    expect(stableStringify(migrateToV7(once))).toBe(stableStringify(once))
    expect(migrateToV7(once)).toBe(once) // a V7 passes through by identity
  })

  it('carries rngState through UNCHANGED (a resumed run replays identically)', () => {
    expect(convertV6ToV7(v6).state.rngState).toBe(v6.state.rngState)
  })

  it('never mutates the V6 input, which keeps its frozen shape', () => {
    const before = stableStringify(v6)
    convertV6ToV7(v6)
    expect(stableStringify(v6)).toBe(before)
    expect('publicity' in (v6.state as object)).toBe(false)
    expect(v6.saveVersion).toBe(6)
  })

  it('invents NO campaign history — a migrated studio has simply never bought one', () => {
    const out = convertV6ToV7(v6)
    expect(out.state.publicity.lastUsedWeek).toBeNull()
    expect(Object.values(out.state.publicity.byTier).every((v) => v === null)).toBe(true)
  })
})

describe('D-17B/E4 — migrateToV7 lifts every known version, and the chain still holds', () => {
  const live = foundStudio('d17b-v7-chain')

  it('a V5 file migrates all the way to V7 (V5→V6 reconstructs the regime, V6→V7 seeds publicity)', () => {
    const v5 = makeSaveV5(toV5(live))
    const out = migrateToV7(v5)
    expect(out.saveVersion).toBe(7)
    expect(out.state.economyEngagedEver).toBe(true) // the R2 reconstruction still runs
    expect(out.state.publicity).toEqual(EMPTY)
    expect(out.state.rngState).toBe(v5.state.rngState)
  })

  it('migrateToV6 still stops at V6 (the frozen intermediate is intact)', () => {
    const v6 = migrateToV6(makeSaveV5(toV5(live)))
    expect(v6.saveVersion).toBe(6)
    expect('publicity' in (v6.state as object)).toBe(false)
    expect(convertV5ToV6(makeSaveV5(toV5(live))).saveVersion).toBe(6)
  })

  it('export → import → migrate round-trips byte-identically', () => {
    const json = exportSave(makeSaveV7(toV7(live)))
    const imported = importSave(json)
    if (imported.saveVersion !== 7) throw new Error('expected V7')
    expect(exportSave(migrateToV7(imported))).toBe(json)
  })

  it('a V7 save reloads and continues identically to an uninterrupted run', () => {
    let a = foundStudio('d17b-v7-replay')
    for (let i = 0; i < 6; i++) a = tick(a)
    const reloaded = importSave(exportSave(makeSaveV7(toV7(a))))
    if (reloaded.saveVersion !== 7) throw new Error('expected V7')
    let split = convertV16ToV17(convertV15ToV16(convertV14ToV15(convertV13ToV14(convertV12ToV13(convertV11ToV12(convertV10ToV11(convertV9ToV10(convertV8ToV9(convertV7ToV8(reloaded)))))))))).state
    let continuous = a
    const boundaryWeek = split.market.tick
    for (let i = 0; i < 6; i++) {
      split = tick(split)
      continuous = tick(continuous)
    }
    // P08A: every pre-P08 byte is identical; the history records forward from
    // the reload week (see tests/_p08HistoryTwins.ts).
    expectForwardHistoryTwin(split, continuous, boundaryWeek)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
// The `publicity` LedgerKind — accounting plumbing only (the ACTION lands separately).
// ═════════════════════════════════════════════════════════════════════════════

function withLedger(state: GameState, entries: LedgerEntry[]): GameState {
  return { ...state, ledger: [...state.ledger, ...entries] }
}

const pubEntry = (week: number, amount: number): LedgerEntry => ({
  week,
  kind: 'publicity',
  amount,
  note: 'publicity: whisper',
})

describe('D-17B §5 — the publicity ledger kind is accounted for explicitly', () => {
  it('financeTotals gives it its OWN bucket and still reconciles', () => {
    const base = foundStudio('d17b-v7-totals')
    const s = withLedger(base, [pubEntry(3, -1_200_000), pubEntry(20, -3_600_000)])
    const before = financeTotals(base)
    const after = financeTotals(s)
    expect(after.publicity).toBe(-4_800_000)
    expect(after.net).toBe(before.net - 4_800_000)
    // it lands in NO other bucket
    expect(after.production).toBe(before.production)
    expect(after.overhead).toBe(before.overhead)
    expect(after.payroll).toBe(before.payroll)
    expect(after.signingBonus).toBe(before.signingBonus)
    expect(after.freelancerFee).toBe(before.freelancerFee)
    expect(after.termination).toBe(before.termination)
    expect(after.studioRevenue).toBe(before.studioRevenue)
    expect(after.boxOfficeLump).toBe(before.boxOfficeLump)
  })

  it('periodSummary has an EXPLICIT case — it never falls into otherCash', () => {
    const base = foundStudio('d17b-v7-period')
    const s = withLedger(base, [pubEntry(2, -1_200_000)])
    const before = periodSummary(base, 0, 10)
    const after = periodSummary(s, 0, 10)
    expect(after.publicity).toBe(-1_200_000)
    expect(after.otherCash).toBe(before.otherCash) // NOT absorbed by the catch-all
    expect(after.netCash).toBe(before.netCash - 1_200_000)
  })

  it('periodSummary respects the window like every other kind', () => {
    const s = withLedger(foundStudio('d17b-v7-window'), [pubEntry(2, -1_200_000), pubEntry(40, -8_000_000)])
    expect(periodSummary(s, 0, 10).publicity).toBe(-1_200_000)
    expect(periodSummary(s, 30, 50).publicity).toBe(-8_000_000)
    expect(periodSummary(s, 11, 29).publicity).toBe(0)
  })

  it('is ENGAGED-ONLY evidence: a V5 save carrying it reconstructs economyEngagedEver = true', () => {
    // save.ts decides every LedgerKind through a compile-exhaustive Record and marks
    // `publicity` true — its action gate means no headless save can carry this kind.
    const headlessish = generateWorld('d17b-v7-kindproof')
    const v5 = makeSaveV5({ ...toV5(headlessish), ledger: [pubEntry(1, -1_200_000)] })
    expect(convertV5ToV6(v5).state.economyEngagedEver).toBe(true)
  })

  it('a kind the headless path also writes is still NOT evidence (the predicate is unchanged)', () => {
    const headlessish = generateWorld('d17b-v7-kindproof-2')
    const notEvidence: LedgerKindV10[] = ['production', 'boxOffice']
    for (const kind of notEvidence) {
      const v5 = makeSaveV5({
        ...toV5(headlessish),
        ledger: [{ week: 1, kind, amount: -1, note: 'x' }],
      })
      expect(convertV5ToV6(v5).state.economyEngagedEver).toBe(false)
    }
  })
})
