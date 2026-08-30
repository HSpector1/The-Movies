// ── C2a-M5 CONTRACT SUITE — the theater reaches the renderer intact ──────────
//
// Written from charter §4.2 and from the boundary law `presence` already
// established, NOT from the implementation:
//
//   *"Class-A (state projection — true of the settled week, renders identically
//   on load / after a batch / mid-playback)"*                             (§4.2)
//   *"presentation shows that truth; animation is evidence, not authority."*
//                                                                   (owner law 5)
//   *"player language describes filmmaking, never engine internals."*       (00G)
//
// The adapter is allowed to do exactly three things to the engine's projection:
// copy it, join the picture's TITLE, and carry the withholdings. This file pins
// all three and proves nothing else happened.

import { describe, expect, it } from 'vitest'
import { applyActions, studioWeekTheater } from '../../../../src/core/index.ts'
import type { GameState } from '../../../../src/core/index.ts'
import {
  newGame,
  studioLotSnapshot,
  studioWeekTheaterView,
} from '../../engine/adapter.ts'
import { LOT_PRESENCE_STATIC_BEAT } from '../../lot/snapshot/StudioLotSnapshot.ts'
import { contendedStudio } from '../../../../tests/_m4Fixtures.ts'
import { advance } from '../../../../tests/contracts/_contractFixtures.ts'

/** A legal, pressured studio walked far enough to have several subjects live. */
function walked(seed: string, weeks: number): GameState[] {
  const contended = contendedStudio(seed)
  let state: GameState = contended.state
  const struck = state.sets[1]
  if (struck !== undefined) {
    state = applyActions(state, [{ kind: 'strikeSet', setId: struck.id }])
    state = applyActions(state, [
      {
        kind: 'commissionSet',
        commission: { blueprintId: 'set-house-generic', stageFacilityId: struck.mountedOn },
      },
    ])
  }
  const seen: GameState[] = [state]
  for (let i = 0; i < weeks; i++) {
    for (const workflow of state.operations.workflows) {
      if (workflow.phase !== 'shooting' || workflow.shootingTask?.status !== 'unassigned') continue
      const production = state.studio.activeProductions.find(
        (candidate) => candidate.id === workflow.productionId,
      )!
      // P05A W1: due-at-call settles inside the Director call itself.
      state = applyActions(state, [
        {
          kind: 'assignShootingDirector',
          productionId: production.id,
          directorId: production.directorId,
        },
      ])
      const settled = state.operations.workflows.find(
        (candidate) => candidate.productionId === production.id,
      )
      if (settled?.shootingTask?.status === 'ready') {
        state = applyActions(state, [
          { kind: 'scheduleShootingTake', productionId: production.id },
        ])
      }
    }
    state = advance(state, 1)
    seen.push(state)
  }
  return seen
}

describe('C2a-M5 §4.2 — the adapter mirrors the engine, and adds nothing', () => {
  it('copies every subject the engine projected, in the engine’s own order', () => {
    for (const state of walked('c2a-m5-theater-mirror', 14)) {
      const engine = studioWeekTheater(state)
      const view = studioWeekTheaterView(state)
      expect(view).toBeDefined()
      expect(view!.week).toBe(engine.week)
      expect(view!.subjects.map((subject) => subject.id)).toEqual(
        engine.subjects.map((subject) => subject.id),
      )
      for (const [index, subject] of view!.subjects.entries()) {
        const source = engine.subjects[index]!
        expect(subject.kind).toBe(source.kind)
        expect(subject.facilityId).toBe(source.facilityId)
        expect(subject.facilityName).toBe(source.facilityName)
        expect(subject.productionId).toBe(source.productionId)
        expect(subject.phase).toBe(source.phase)
        expect(subject.setId).toBe(source.setId)
        expect(subject.weeksRemaining).toBe(source.weeksRemaining)
        expect(subject.distance).toBe(source.distance)
        expect(subject.reason).toBe(source.reason)
        expect(subject.beats).toEqual(source.beats)
      }
      expect(view!.withheld).toEqual(engine.withheld)
    }
  })

  it('joins a TITLE for every named picture — and never prints an id (`00F`)', () => {
    let titled = 0
    for (const state of walked('c2a-m5-theater-titles', 14)) {
      for (const subject of studioWeekTheaterView(state)!.subjects) {
        if (subject.productionId === null) {
          expect(subject.productionTitle).toBeNull()
          continue
        }
        titled += 1
        expect(subject.productionTitle).not.toBeNull()
        expect(subject.productionTitle).not.toBe(subject.productionId)
        expect(subject.productionTitle!.startsWith('prod-')).toBe(false)
      }
    }
    expect(titled).toBeGreaterThanOrEqual(1)
  })

  it('shares presence’s static beat, so the people and the work agree about "now"', () => {
    const state = walked('c2a-m5-theater-beat', 6).at(-1)!
    const view = studioWeekTheaterView(state)!
    expect(view.staticBeat).toBe(LOT_PRESENCE_STATIC_BEAT)
    expect(view.beatsPerWeek).toBe(studioWeekTheater(state).subjects[0]?.beats.length ?? 10)
  })

  it('rides on the lot snapshot in managed mode, and is ABSENT in legacy', () => {
    const state = walked('c2a-m5-theater-snapshot', 8).at(-1)!
    const snapshot = studioLotSnapshot(state)
    expect(snapshot.weekTheater).toBeDefined()
    expect(snapshot.weekTheater!.subjects.length).toBeGreaterThan(0)
    // Presence and the theater are computed from the SAME state in the SAME pass.
    expect(snapshot.weekTheater!.week).toBe(snapshot.presence?.week ?? snapshot.weekTheater!.week)

    const legacy = newGame('c2a-m5-theater-snapshot-legacy')
    expect(legacy.operations.mode).not.toBe('managed')
    expect(studioWeekTheaterView(legacy)).toBeUndefined()
    expect(studioLotSnapshot(legacy).weekTheater).toBeUndefined()
  })

  it('is CLASS A on the snapshot too: the settled week reads the same every time', () => {
    const state = walked('c2a-m5-theater-classa', 10).at(-1)!
    const once = JSON.stringify(studioLotSnapshot(state).weekTheater)
    const twice = JSON.stringify(studioLotSnapshot(state).weekTheater)
    expect(twice).toBe(once)
  })
})
