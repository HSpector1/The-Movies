// ── C2a-M2 — the board tells the truth about scenery ─────────────────────────
//
// The north star is "I can physically watch multiple films compete for real
// production resources". A Set is one of those resources from this milestone on,
// and the Production Board is where competition for it becomes watchable.
//
// TWO THINGS ARE PROVED, and the first is a defect this suite exists because of.
//
//   1. A PICTURE HELD FOR WANT OF A SET SAID "ON SCHEDULE". The engine's
//      `set-unavailable` blocker arm shipped with M2 and matched no branch in the
//      board's read-model, so a picture that could not shoot fell through every
//      case and kept the default status. That is a false sentence at the exact
//      state it matters most, with no reason beside it and no remedy — G12 and
//      owner law 2 in one. It now reads "Waiting for a set", says a stage is free
//      and nothing is built on it, and names the Scenery Shop.
//   2. A PICTURE THAT IS SHOOTING NAMES THE SET IT STANDS ON. Not the stage alone
//      — the set, by name, with the stage it is mounted on.

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { applyActions } from '../../../src/core/index.ts'
import { advanceWeek, greenlight, productionBoard } from '../engine/adapter.ts'
import type { DraftPackage, GameState } from '../engine/adapter.ts'
import { ProductionBoard } from '../components/ProductionBoard.tsx'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

function managed(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
}

function directPackage(state: GameState, lane = 0): DraftPackage {
  const concept = state.concepts[lane] ?? state.concepts[0]!
  const actors = foundedRosterIds(state, 'actor')
  const castStart = lane * 3
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
    },
    writerId: foundedRosterIds(state, 'writer')[lane]!,
    directorId: foundedRosterIds(state, 'director')[lane]!,
    cast: {
      lead: actors[castStart]!,
      antagonist: actors[castStart + 1]!,
      support: actors[castStart + 2]!,
    },
    craftIds: [foundedRosterIds(state, 'craft')[lane]!],
    budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
  }
}

function latestProductionId(state: GameState): string {
  const active = state.studio.activeProductions
  const newest = active[active.length - 1]
  if (newest === undefined) throw new Error('expected a production in flight')
  return newest.id
}

function greenlit(state: GameState, lane = 0): GameState {
  const outcome = greenlight(state, directPackage(state, lane))
  if (!outcome.ok) throw new Error(outcome.error)
  return outcome.next
}

/** Advance until this picture reports the blocker asked about, or give up. */
function advanceUntilBlocked(state: GameState, productionId: string, weeks = 40): GameState {
  let current = state
  for (let week = 0; week < weeks; week++) {
    const workflow = current.operations.workflows.find((w) => w.productionId === productionId)
    if (workflow?.blocker?.kind === 'set-unavailable') return current
    current = advanceWeek(current).next
  }
  return current
}

describe('C2a-M2 — a picture waiting for a set says so', () => {
  it('reports the set-unavailable hold instead of calling it On schedule', () => {
    // A studio with two stages and ONE usable set: the second picture reaches a
    // free stage with nothing on it, which is precisely the `set-unavailable` arm.
    let state = managed('c2a-m2-board-1')
    const spare = state.sets.find((set) => set.mountedOn === 'facility-soundstage-12')!
    state = applyActions(state, [{ kind: 'strikeSet', setId: spare.id }])
    state = greenlit(state, 0)
    const first = latestProductionId(state)
    state = greenlit(state, 1)
    const second = latestProductionId(state)
    expect(second).not.toBe(first)

    state = advanceUntilBlocked(state, second)
    const workflow = state.operations.workflows.find((w) => w.productionId === second)!
    expect(workflow.blocker?.kind).toBe('set-unavailable')

    const board = productionBoard(state)
    const card = board.cards.find((row) => row.productionId === second)!
    expect(card.statusLabel).toBe('Waiting for a set')
    expect(card.statusLabel).not.toBe('On schedule')
    expect(card.blocker).not.toBeNull()
    expect(card.blocker!.kind).toBe('set-unavailable')
    expect(card.blocker!.detail).toContain('Scenery Shop')
    expect(card.boundSet).toBeNull()

    render(<ProductionBoard board={board} />)
    const rendered = screen.getByTestId(`production-blocker-${second}`)
    expect(rendered.textContent).toContain('nothing to shoot on')
    expect(rendered.textContent).toContain('Scenery Shop')
    expect(screen.getByTestId(`production-status-${second}`).textContent).toBe('Waiting for a set')
  })

  it('never renders an engine id or a capability name in the hold copy', () => {
    let state = managed('c2a-m2-board-2')
    const spare = state.sets.find((set) => set.mountedOn === 'facility-soundstage-12')!
    state = applyActions(state, [{ kind: 'strikeSet', setId: spare.id }])
    state = greenlit(state, 0)
    state = greenlit(state, 1)
    const second = latestProductionId(state)
    state = advanceUntilBlocked(state, second)

    const card = productionBoard(state).cards.find((row) => row.productionId === second)!
    const copy = `${card.blocker?.headline ?? ''} ${card.blocker?.detail ?? ''}`
    expect(copy).not.toContain('facility-')
    expect(copy).not.toContain('set-unavailable')
    expect(copy).not.toContain('rehearsal')
    expect(copy).not.toContain('undefined')
  })
})

describe('C2a-M2 — a picture that is shooting names the set it stands on', () => {
  it('carries the set name and its stage once the picture is bound', () => {
    let state = greenlit(managed('c2a-m2-board-3'), 0)
    const productionId = latestProductionId(state)
    for (let week = 0; week < 40; week++) {
      const workflow = state.operations.workflows.find((w) => w.productionId === productionId)
      if (workflow?.bindings.setId != null) break
      state = advanceWeek(state).next
    }
    const workflow = state.operations.workflows.find((w) => w.productionId === productionId)!
    expect(workflow.bindings.setId).not.toBeNull()

    const board = productionBoard(state)
    const card = board.cards.find((row) => row.productionId === productionId)!
    const bound = state.sets.find((set) => set.id === workflow.bindings.setId)!
    expect(card.boundSet).not.toBeNull()
    expect(card.boundSet!.setId).toBe(bound.id)
    expect(card.boundSet!.name).toBe(bound.name)
    expect(card.boundSet!.stageName).toBe(
      state.operations.facilities.find((f) => f.id === bound.mountedOn)!.name,
    )

    render(<ProductionBoard board={board} />)
    const cell = screen.getByTestId(`production-set-${productionId}`)
    expect(cell.textContent).toContain(bound.name)
    expect(cell.textContent).toContain(card.boundSet!.stageName)
    // The value carries the fact; the metric it sits in carries the label, so a
    // player reads "Standing on" beside it rather than a bare pair of names.
    const metric = cell.closest('.metric')
    expect(metric).not.toBeNull()
    expect(within(metric as HTMLElement).getByText('Standing on')).toBeInTheDocument()
  })

  it('shows no set line at all for a picture bound to none', () => {
    const state = greenlit(managed('c2a-m2-board-4'), 0)
    const productionId = latestProductionId(state)
    const board = productionBoard(state)
    const card = board.cards.find((row) => row.productionId === productionId)!
    // Freshly greenlit: in development, bound to nothing. An absence, not a blank.
    expect(card.boundSet).toBeNull()
    render(<ProductionBoard board={board} />)
    expect(screen.queryByTestId(`production-set-${productionId}`)).toBeNull()
  })
})
