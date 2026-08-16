// Presence Projection V1 — determinism and neutrality.
//
// The projection is only allowed to exist because it cannot change anything:
// same state ⇒ same bytes, calling it leaves the state (and its save) untouched,
// and a tick is byte-identical whether or not presence was projected first.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  BEATS_PER_WEEK,
  makeSave,
  PRESENCE_DEPARTURE_WINDOW,
  stableStringify,
  studioPresence,
  tick,
} from '../src/core/index.js'
import type { GameState } from '../src/core/index.js'
import {
  activateManaged,
  cheapestConcepts,
  contractedByRole,
  foundedStudio,
  packagePayload,
  readyScript,
} from './_presenceFixtures.js'

function runningStudio(seed: string): GameState {
  let state = activateManaged(foundedStudio(seed, { actor: 6, director: 2, writer: 2, craft: 2 }))
  const concepts = cheapestConcepts(state, 2)
  const writers = contractedByRole(state, 'writer')
  const directors = contractedByRole(state, 'director')
  const crafts = contractedByRole(state, 'craft')
  const actors = contractedByRole(state, 'actor')
  const first = readyScript(state, concepts[0]!, writers[0]!.id)
  state = first.state
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: packagePayload(state, first.projectId, {
        directorId: directors[0]!.id,
        craftIds: [crafts[0]!.id],
        cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
      }),
    },
  ])
  state = tick(state)
  return tick(state)
}

describe('Presence Projection V1 — determinism', () => {
  it('returns byte-identical results for the same state and round-trips through JSON', () => {
    const state = runningStudio('presence-determinism')
    const a = studioPresence(state)
    const b = studioPresence(state)
    expect(a).toEqual(b)
    expect(stableStringify(a)).toBe(stableStringify(b))
    expect(JSON.parse(JSON.stringify(a))).toEqual(a)
    expect(JSON.stringify(JSON.parse(JSON.stringify(a)))).toBe(JSON.stringify(a))

    // Two independently built worlds from the same seed project the same week.
    const twin = runningStudio('presence-determinism')
    expect(stableStringify(studioPresence(twin))).toBe(stableStringify(a))
  })

  it('leaves the state, its save bytes, and rngState untouched', () => {
    const state = runningStudio('presence-neutrality')
    const stateBefore = stableStringify(state)
    const saveBefore = stableStringify(makeSave(state))
    const rngBefore = state.rngState

    studioPresence(state)
    studioPresence(state)

    expect(stableStringify(state)).toBe(stateBefore)
    expect(stableStringify(makeSave(state))).toBe(saveBefore)
    expect(state.rngState).toBe(rngBefore)
  })

  it('consumes zero simulation RNG: ticks are byte-identical either way', () => {
    let quiet = runningStudio('presence-rng-neutral')
    let observed = runningStudio('presence-rng-neutral')
    expect(stableStringify(observed)).toBe(stableStringify(quiet))

    for (let week = 0; week < 8; week++) {
      // The observed run projects presence between every tick; the quiet run
      // never does. Nothing may diverge — not state, not the save, not rngState.
      studioPresence(observed)
      quiet = tick(quiet)
      observed = tick(observed)
      studioPresence(observed)
      expect(observed.rngState).toBe(quiet.rngState)
      expect(stableStringify(observed)).toBe(stableStringify(quiet))
      expect(stableStringify(makeSave(observed))).toBe(stableStringify(makeSave(quiet)))
    }
  })

  it('derives the departure stagger from the seed and the week, never from state.rngState', () => {
    const state = runningStudio('presence-stagger')
    const departures = studioPresence(state)
      .people.filter((person) => person.engagement !== 'roster')
      .map((person) => person.beats.indexOf('travel'))
    expect(departures.length).toBeGreaterThan(0)
    for (const departure of departures) {
      expect(Number.isInteger(departure)).toBe(true)
      expect(departure).toBeGreaterThanOrEqual(0)
      expect(departure).toBeLessThan(PRESENCE_DEPARTURE_WINDOW)
    }

    // Over a run of weeks the stagger varies — it is a real derived stream keyed
    // per person and week, not a constant — and never leaves the window.
    const observed = new Set<number>()
    let staggeredWeeks = 0
    let walking = state
    for (let week = 0; week < 12; week++) {
      const thisWeek = new Set<number>()
      for (const person of studioPresence(walking).people) {
        if (person.engagement === 'roster') continue
        observed.add(person.beats.indexOf('travel'))
        thisWeek.add(person.beats.indexOf('travel'))
      }
      if (thisWeek.size > 1) staggeredWeeks += 1
      walking = tick(walking)
    }
    expect(observed.size).toBeGreaterThan(1)
    expect(staggeredWeeks).toBeGreaterThan(0)
    expect([...observed].every((beat) => beat >= 0 && beat < PRESENCE_DEPARTURE_WINDOW)).toBe(true)
    expect(BEATS_PER_WEEK).toBe(10)
  })
})
