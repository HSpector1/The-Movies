// ── PF1-M3 CONTRACT SUITE — the human save card ──────────────────────────────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M3 / §2 / §7 and from the
// frozen M3 interface, NOT from the implementation. It is expected to fail to
// COLLECT until OPUS-SHELL lands `ui/src/shell/saveCard.ts`; that red is
// contract-first behaviour, not a defect in this file.
//
// Governing charter law proved by this file:
//   • "Save presentation, the cheap set (engine save layer untouched): a human
//      save card (studio seed, week, cash, films released — DERIVED FROM LIVE
//      STATE, no envelope change)"                                      (§5-M3)
//   • "PRESENTATION REACTS TO TRUTH. PRESENTATION NEVER CREATES OR PERSISTS GAME
//      TRUTH."                                                     (§2, heading)
//   • "New suites: … save-card derivation"                                 (§7)
//
// FROZEN SIGNATURE UNDER TEST:
//   deriveSaveCard(state: GameState): {
//     studioName: string; seed: string; week: number;
//     cash: number; filmsReleased: number
//   }
//
// The returned data carries NO locale-dependent formatting: cash is a raw
// number and filmsReleased a raw count, so a French build and an English build
// derive the same card and only the render differs.
//
// HOW IT IS DRIVEN: the REAL engine through the REAL adapter, per the idiom the
// parity-proof suite establishes — a seeded new game, then a founded studio
// played forward through a real greenlight to a real release. Nothing is
// stubbed and no state is fabricated, so "matches the live state" is literally
// true of every fact pinned below.
//
// DETERMINISM: fixed seeds, no Math.random, no Date.now, no timers.

import { describe, expect, it } from 'vitest'
import { deriveSaveCard } from '../../shell/saveCard.ts'
import {
  advanceWeek,
  exportSaveJson,
  greenlight,
  newGame,
  requiredNegative,
  selectCash,
  selectReleasedFilms,
  selectWeek,
} from '../../engine/adapter.ts'
import type { CreativeRole, DraftPackage, GameState } from '../../engine/adapter.ts'
import { foundedRosterIds, newFoundedGame } from '../founding.ts'

const SEED = 'pf1-savecard-001'
const RELEASE_SEED = 'pf1-savecard-002'

/** The five fields the frozen interface names — nothing more, nothing less. */
const CARD_FIELDS = ['cash', 'filmsReleased', 'seed', 'studioName', 'week'] as const

/** A legal draft package for the founded roster (the session-test idiom). */
function draftPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]
  if (concept === undefined) throw new Error('save-card fixture: the world generated no concepts')
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const id = (role: CreativeRole, index: number): string => {
    const found = foundedRosterIds(state, role)[index]
    if (found === undefined) throw new Error(`save-card fixture: no ${role} at index ${index}`)
    return found
  }
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: id('writer', 0),
    directorId: id('director', 0),
    craftIds: [id('craft', 0)],
    cast: { lead: id('actor', 0), antagonist: id('actor', 1), support: id('actor', 2) },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

/** A founded studio played forward until its first picture has actually reached the screen. */
function stateWithARelease(seed: string): GameState {
  const founded = newFoundedGame(seed)
  const greenlit = greenlight(founded, draftPackage(founded))
  if (!greenlit.ok) throw new Error(`save-card fixture: greenlight failed — ${greenlit.error}`)
  let state = greenlit.next
  for (let guard = 0; guard < 40 && selectReleasedFilms(state).length === 0; guard += 1) {
    state = advanceWeek(state).next
  }
  if (selectReleasedFilms(state).length === 0) {
    throw new Error('save-card fixture: 40 weeks passed and no picture was released')
  }
  return state
}

const fresh = newGame(SEED)
const founded = newFoundedGame(SEED)
const released = stateWithARelease(RELEASE_SEED)

describe('PF1-M3 contract — the card is derived from the LIVE state', () => {
  it('seed is the state seed, verbatim', () => {
    expect(deriveSaveCard(fresh).seed).toBe(SEED)
    expect(deriveSaveCard(fresh).seed).toBe(fresh.seed)
    expect(deriveSaveCard(released).seed).toBe(RELEASE_SEED)
    expect(deriveSaveCard(released).seed).toBe(released.seed)
  })

  it('a different studio reports a different seed (the field is read, not hardcoded)', () => {
    expect(deriveSaveCard(fresh).seed).not.toBe(deriveSaveCard(released).seed)
  })

  it('week is market.tick (the authoritative clock), not a derived or offset number', () => {
    for (const state of [fresh, founded, released]) {
      expect(deriveSaveCard(state).week).toBe(state.market.tick)
      expect(deriveSaveCard(state).week).toBe(selectWeek(state))
    }
  })

  it('cash is studio.cash exactly, to the unit', () => {
    for (const state of [fresh, founded, released]) {
      expect(deriveSaveCard(state).cash).toBe(state.studio.cash)
      expect(deriveSaveCard(state).cash).toBe(selectCash(state))
    }
  })

  it('filmsReleased is the length of studio.releasedFilms', () => {
    for (const state of [fresh, founded, released]) {
      expect(deriveSaveCard(state).filmsReleased).toBe(state.studio.releasedFilms.length)
      expect(deriveSaveCard(state).filmsReleased).toBe(selectReleasedFilms(state).length)
    }
  })

  it('a brand-new studio has released nothing', () => {
    expect(selectReleasedFilms(fresh).length, 'fixture sanity').toBe(0)
    expect(deriveSaveCard(fresh).filmsReleased).toBe(0)
  })

  it('a studio that has released a picture reports a NON-ZERO count (not a hardcoded 0)', () => {
    expect(selectReleasedFilms(released).length, 'fixture sanity').toBeGreaterThan(0)
    expect(deriveSaveCard(released).filmsReleased).toBeGreaterThan(0)
  })

  it('the played-forward fixture really moved the clock and the money', () => {
    // Guards the three pins above against a vacuous pass in which every fixture
    // state happens to carry identical facts.
    expect(selectWeek(released)).toBeGreaterThan(selectWeek(fresh))
    expect(deriveSaveCard(released).week).not.toBe(deriveSaveCard(fresh).week)
    expect(deriveSaveCard(released).cash).not.toBe(deriveSaveCard(fresh).cash)
  })
})

describe('PF1-M3 contract — the card carries DATA, not formatted text', () => {
  it('exposes exactly the five frozen fields', () => {
    expect(Object.keys(deriveSaveCard(released)).sort()).toEqual([...CARD_FIELDS])
  })

  it('cash is a finite raw number — never a locale-formatted string', () => {
    for (const state of [fresh, founded, released]) {
      const { cash } = deriveSaveCard(state)
      expect(typeof cash).toBe('number')
      expect(Number.isFinite(cash)).toBe(true)
    }
  })

  it('week and filmsReleased are raw non-negative integers', () => {
    for (const state of [fresh, founded, released]) {
      const card = deriveSaveCard(state)
      for (const [name, value] of [
        ['week', card.week],
        ['filmsReleased', card.filmsReleased],
      ] as const) {
        expect(typeof value, `${name} must be a number`).toBe('number')
        expect(Number.isInteger(value), `${name} must be an integer`).toBe(true)
        expect(value, `${name} must not be negative`).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('no numeric field arrives pre-formatted (no separators, symbols or units anywhere)', () => {
    for (const state of [fresh, founded, released]) {
      const card = deriveSaveCard(state)
      for (const value of [card.cash, card.week, card.filmsReleased]) {
        expect(typeof value).not.toBe('string')
      }
      // A raw number round-trips through JSON as a number; a formatted one would
      // arrive quoted. This is the locale-independence claim, mechanically.
      const roundTripped = JSON.parse(JSON.stringify(card)) as Record<string, unknown>
      expect(typeof roundTripped.cash).toBe('number')
      expect(typeof roundTripped.week).toBe('number')
      expect(typeof roundTripped.filmsReleased).toBe('number')
    }
  })

  it('seed is a non-empty string', () => {
    const { seed } = deriveSaveCard(released)
    expect(typeof seed).toBe('string')
    expect(seed.length).toBeGreaterThan(0)
  })

  // AMBIGUITY (flagged, not resolved): the frozen interface names a `studioName`
  // field but does not say what it derives from, and the engine has NO per-studio
  // name — `ui/src/engine/adapter.ts:5290` says so outright ("The studio has no
  // name field in D1, so the gate/top-bar identity is the product brand"). This
  // therefore pins only what both readings share: a real, non-empty identity that
  // is not the seed wearing a different hat.
  it('studioName is a non-empty string that is not merely the seed', () => {
    for (const state of [fresh, released]) {
      const { studioName, seed } = deriveSaveCard(state)
      expect(typeof studioName).toBe('string')
      expect(studioName.trim().length).toBeGreaterThan(0)
      expect(studioName).not.toBe(seed)
      expect(studioName).not.toBe('undefined')
      expect(studioName).not.toBe('null')
    }
  })
})

describe('PF1-M3 contract — the derivation is pure (§2: presentation never writes truth)', () => {
  it('the same state derives an identical card every time', () => {
    for (const state of [fresh, founded, released]) {
      const first = deriveSaveCard(state)
      const second = deriveSaveCard(state)
      expect(second).toEqual(first)
      expect(JSON.stringify(second)).toBe(JSON.stringify(first))
    }
  })

  it('deriving a card mutates NOTHING — the state serializes byte-identically after', () => {
    for (const state of [fresh, founded, released]) {
      const before = exportSaveJson(state)
      deriveSaveCard(state)
      deriveSaveCard(state)
      expect(exportSaveJson(state)).toBe(before)
    }
  })

  it('deriving a card draws nothing from the rng stream', () => {
    const before = released.rngState
    deriveSaveCard(released)
    expect(released.rngState).toBe(before)
  })

  it('two states derived from the same seed yield the same card (determinism)', () => {
    expect(deriveSaveCard(newFoundedGame(SEED))).toEqual(deriveSaveCard(newFoundedGame(SEED)))
  })

  it('returns a fresh object, so a caller mutating the card cannot corrupt the next read', () => {
    const first = deriveSaveCard(released)
    first.week = -999
    first.filmsReleased = -1
    const second = deriveSaveCard(released)
    expect(second.week).toBe(released.market.tick)
    expect(second.filmsReleased).toBe(released.studio.releasedFilms.length)
  })
})
