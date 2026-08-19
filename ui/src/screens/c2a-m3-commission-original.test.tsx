// ── C2a-M3 — the second way to start a picture, in the surface a player uses ──
//
// The §12-M3 fantasy is *a writer goes to work and eventually hands me a new
// movie*, and its first half is a verb: COMMISSION AN ORIGINAL. These tests hold
// the commission form to four things, all of them player-visible:
//
//   1. the two supplies are offered, and picking ORIGINAL replaces the market
//      premise list with a creative DIRECTION the player chooses;
//   2. the payload that leaves the form is the engine's own action shape — no
//      conceptId, because the concept does not exist yet — and the state that
//      comes back has a screenplay in it with a title the studio's writers wrote;
//   3. the form states HOW LONG the writing takes and why, in the engine's own
//      numbers (`00E`.9 — writer experience buys TIME, never quality);
//   4. the exhaustion story INVERTS: with the market bought out, the surface that
//      used to say "continue with an existing project" now offers the path that
//      makes a thirty-first premise, and the Writers Room door stays open.
//
// Everything is driven through the real engine. No stub board, no hand-built
// state: a studio is founded the ordinary way, and where a bought-out market is
// needed it is bought out by commissioning every premise it has.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  advanceWeek,
  commissionScriptAction,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
} from '../engine/adapter.ts'
import type { CreativeRole, GameState } from '../engine/adapter.ts'
import {
  commissionOriginalScreenplayAction,
  originalCommissionOpen,
  originalDraftEstimate,
  screenplayIdentityForProject,
} from '../engine/screenplay.ts'
import { ScreenplayCommissionForm, WritersRoom } from './WritersRoom.tsx'

afterEach(cleanup)

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 2,
  craft: 1,
}

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const ids = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
      .map((card) => card.profile.id)
    for (const id of ids) {
      const signed = signContractAction(state, id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

function availableWriterId(state: GameState): string {
  const board = scriptProjectsBoard(state)
  const writer =
    board.commission.writers.find((candidate) => candidate.available && candidate.primaryRole === 'writer') ??
    board.commission.writers.find((candidate) => candidate.available)
  if (writer === undefined) throw new Error('fixture: no writer is available')
  return writer.id
}

/**
 * A studio that has bought the market out.
 *
 * Every one of the world's premises is claimed the only way the game allows —
 * commission, wait a week, accept, commission the next — so the exhaustion this
 * asserts is the engine's own, reached by playing rather than by editing state.
 */
function marketBoughtOut(seed: string): GameState {
  let state = managedStudio(seed)
  for (let guard = 0; guard < 64; guard += 1) {
    const board = scriptProjectsBoard(state)
    if (board.commission.concepts.length === 0) return state
    const concept = board.commission.concepts[0]!
    const writerId = availableWriterId(state)
    const commissioned = commissionScriptAction(state, {
      conceptId: concept.id,
      writerId,
      shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
      },
    })
    if (!commissioned.ok) throw new Error(commissioned.error)
    state = advanceWeek(commissioned.next).next
    const card = scriptProjectsBoard(state).sections.needsReview[0]
    if (card !== undefined) {
      const accept = card.legalActions.find((action) => action.kind === 'acceptScript')
      if (accept !== undefined) {
        const accepted = runScriptProjectAction(state, accept)
        if (!accepted.ok) throw new Error(accepted.error)
        state = accepted.next
      }
    }
  }
  throw new Error('fixture: the market never ran out')
}

describe('C2a-M3 — commissioning an original screenplay', () => {
  it('offers both supplies, and choosing the original replaces the premise list with a creative direction', () => {
    const state = managedStudio('m3-commission-both-supplies')
    const board = scriptProjectsBoard(state)

    render(
      <ScreenplayCommissionForm
        board={board}
        original={{
          open: originalCommissionOpen(board),
          estimateFor: (input) => originalDraftEstimate(state, input),
          submit: () => ({ ok: false, error: 'not submitted in this test' }),
        }}
        onSubmit={() => ({ ok: false, error: 'not submitted in this test' })}
        onClose={() => undefined}
        onError={() => undefined}
      />,
    )

    // The market path is the default while the market has premises to sell.
    expect(screen.getByTestId('script-concept')).toBeTruthy()
    expect(screen.queryByTestId('script-direction')).toBeNull()

    fireEvent.click(screen.getByTestId('script-source-original'))

    // …and the original path asks for a DIRECTION instead of a premise.
    expect(screen.queryByTestId('script-concept')).toBeNull()
    const direction = screen.getByTestId('script-direction') as HTMLSelectElement
    expect(direction.options.length).toBe(6)
    expect(screen.getByTestId('commission-submit').textContent).toBe(
      'Commission an original screenplay',
    )
    expect(screen.getByTestId('commission-source-note').textContent).toContain(
      'Your own writer invents the premise',
    )
  })

  it('sends the engine action shape and comes back with a screenplay the studio wrote', () => {
    const state = managedStudio('m3-commission-original-payload')
    const board = scriptProjectsBoard(state)
    const writerId = availableWriterId(state)
    const submitted: unknown[] = []
    let next: GameState | null = null

    render(
      <ScreenplayCommissionForm
        board={board}
        original={{
          open: originalCommissionOpen(board),
          estimateFor: (input) => originalDraftEstimate(state, input),
          submit: (payload) => {
            submitted.push(payload)
            const result = commissionOriginalScreenplayAction(state, payload)
            if (result.ok) next = result.next
            return result
          },
        }}
        onSubmit={() => ({ ok: false, error: 'the market path is not under test here' })}
        onClose={() => undefined}
        onError={() => undefined}
      />,
    )

    fireEvent.click(screen.getByTestId('script-source-original'))
    fireEvent.change(screen.getByTestId('script-direction'), { target: { value: 'crime' } })
    fireEvent.change(screen.getByTestId('script-writer'), { target: { value: writerId } })
    fireEvent.click(screen.getByTestId('commission-submit'))

    expect(submitted).toHaveLength(1)
    const payload = submitted[0] as Record<string, unknown>
    // NO conceptId — the concept is minted at commit, so there is nothing to name.
    expect(Object.keys(payload).sort()).toEqual(['genre', 'promise', 'shape', 'writerId'])
    expect(payload.genre).toBe('crime')
    expect(payload.writerId).toBe(writerId)

    const committed = next as GameState | null
    if (committed === null) throw new Error('the engine refused the commission')
    expect(committed.concepts.length).toBe(state.concepts.length + 1)
    const project = committed.scriptDevelopment.projects.at(-1)!
    const identity = screenplayIdentityForProject(committed, project.id)!
    expect(identity.provenance.origin).toBe('original')
    expect(identity.provenance.label).toBe(
      `An Original Screenplay by ${identity.provenance.writerName ?? ''}`,
    )
    // The studio's writers named it, and the name is a real title.
    expect(identity.provenance.generatedTitle).toBe(identity.title)
    expect(identity.title.length).toBeGreaterThan(0)
    expect(identity.beats).toHaveLength(7)
  })

  it('states how long the writing takes, in the engine’s own weeks, and what shortens it', () => {
    const state = managedStudio('m3-commission-weeks-sentence')
    const board = scriptProjectsBoard(state)
    const writerId = availableWriterId(state)
    const expected = originalDraftEstimate(state, { writerId, genre: 'comedy' })

    render(
      <ScreenplayCommissionForm
        board={board}
        original={{
          open: originalCommissionOpen(board),
          estimateFor: (input) => originalDraftEstimate(state, input),
          submit: () => ({ ok: false, error: 'not submitted in this test' }),
        }}
        onSubmit={() => ({ ok: false, error: 'not submitted in this test' })}
        onClose={() => undefined}
        onError={() => undefined}
      />,
    )

    fireEvent.click(screen.getByTestId('script-source-original'))
    fireEvent.change(screen.getByTestId('script-direction'), { target: { value: 'comedy' } })
    fireEvent.change(screen.getByTestId('script-writer'), { target: { value: writerId } })

    expect(screen.getByTestId('commission-writing-weeks').textContent).toBe(
      `An original at this office: about ${String(expected.weeks)} ${
        expected.weeks === 1 ? 'week' : 'weeks'
      } of writing.`,
    )
    // The consequence sentence is the ENGINE'S, counting the same weeks.
    expect(screen.getByTestId('commission-consequence').textContent).toContain(
      expected.consequence,
    )
    expect(screen.getByTestId('commission-pace-note').textContent).toBe(expected.pace)
  })

  it('inverts the exhaustion story: the bought-out market offers the original path as the remedy', () => {
    const state = marketBoughtOut('m3-exhaustion-inversion')
    const board = scriptProjectsBoard(state)

    // The engine's own successor blocker — no longer terminal.
    const blocker = board.commission.blockers.find((entry) => entry.kind === 'no-concepts')!
    expect(blocker.remedy).toBe(
      'Commission an original screenplay — put one of your writers on a new picture.',
    )
    expect(board.commission.canStart).toBe(false)
    expect(originalCommissionOpen(board)).toBe(true)

    const onChange = vi.fn()
    render(
      <WritersRoom
        state={state}
        onChange={onChange}
        onOpenPackage={() => undefined}
        onBack={() => undefined}
      />,
    )

    // The door is NOT shut. C1 disabled this button the moment the market ran dry.
    expect((screen.getByTestId('commission-open') as HTMLButtonElement).disabled).toBe(false)
    // …and the remedy the blocker names is a control beside it.
    fireEvent.click(screen.getByTestId('writers-room-commission-original'))
    expect(screen.getByTestId('script-direction')).toBeTruthy()
    expect(screen.queryByTestId('script-concept')).toBeNull()
    // The exhaustion blocker is not printed against a path it does not apply to.
    expect(screen.queryByText('The market has no unclaimed premises left')).toBeNull()
  })

  it('writes a real screenplay from the Writers Room, end to end', () => {
    let state = marketBoughtOut('m3-writers-room-original-end-to-end')
    const before = state.concepts.length

    render(
      <WritersRoom
        state={state}
        onChange={(next) => { state = next }}
        onOpenPackage={() => undefined}
        onBack={() => undefined}
      />,
    )

    fireEvent.click(screen.getByTestId('writers-room-commission-original'))
    fireEvent.click(screen.getByTestId('commission-submit'))

    expect(state.concepts.length).toBe(before + 1)
    const project = state.scriptDevelopment.projects.at(-1)!
    const identity = screenplayIdentityForProject(state, project.id)!
    expect(identity.provenance.origin).toBe('original')
    expect(identity.conceptId.startsWith('concept-orig-')).toBe(true)
  })
})
