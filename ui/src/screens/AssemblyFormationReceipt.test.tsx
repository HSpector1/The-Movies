import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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
import * as engineAdapter from '../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  GameState,
} from '../engine/adapter.ts'
import {
  acceptedGreenlightFormationReceipt,
  type GreenlightFormationReceipt,
} from '../lot/snapshot/productionFormation.ts'
import { newFoundedGame } from '../test/founding.ts'
import { Assembly } from './Assembly.tsx'

afterEach(cleanup)

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const applicants = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const ids = applicants
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
      .map((candidate) => candidate.profile.id)
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

function readyScreenplay(seed: string): { state: GameState; projectId: string } {
  let state = managedStudio(seed)
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]!
  const writer = board.commission.writers.find((candidate) => candidate.available)!
  const payload: CommissionScriptPayload = {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: 'immediateAction',
      midpoint: 'escalation',
      ending: 'triumph',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.65, 0.15],
        tonalWeight: [-0.65, 0.15],
        kineticEnergy: [-0.65, 0.15],
      },
    },
  }
  const commissioned = commissionScriptAction(state, payload)
  if (!commissioned.ok) throw new Error(commissioned.error)
  state = advanceWeek(commissioned.next).next
  const accept = scriptProjectsBoard(state).sections.needsReview[0]?.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (!accept) throw new Error('setup: commissioned screenplay did not reach review')
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  state = accepted.next
  const projectId = scriptProjectsBoard(state).packages[0]?.projectId
  if (!projectId) throw new Error('setup: accepted screenplay did not become Ready')
  return { state, projectId }
}

function pickFirstEligible(testId: string): HTMLElement {
  const button = within(screen.getByTestId(testId))
    .getAllByRole('button')
    .find(
      (candidate) =>
        candidate.hasAttribute('aria-pressed') &&
        !(candidate as HTMLButtonElement).disabled,
    )
  if (!button) throw new Error(`setup: no eligible candidate in ${testId}`)
  fireEvent.click(button)
  return button
}

function finishManagedReadyPackage(): HTMLButtonElement {
  pickFirstEligible('picker-director')
  pickFirstEligible('picker-lead')
  pickFirstEligible('picker-antagonist')
  pickFirstEligible('picker-support')
  pickFirstEligible('picker-craft')
  fireEvent.click(screen.getByTestId('assembly-next'))
  fireEvent.click(screen.getByTestId('assembly-next'))
  return screen.getByTestId('greenlight') as HTMLButtonElement
}

function finishLegacyDirectPackage(): HTMLButtonElement {
  fireEvent.click(within(screen.getByTestId('concept-grid')).getAllByRole('button')[0]!)
  fireEvent.click(screen.getByTestId('assembly-next'))
  fireEvent.click(screen.getByTestId('assembly-next'))
  fireEvent.click(screen.getByTestId('assembly-next'))
  pickFirstEligible('picker-writer')
  pickFirstEligible('picker-director')
  pickFirstEligible('picker-lead')
  pickFirstEligible('picker-antagonist')
  pickFirstEligible('picker-support')
  pickFirstEligible('picker-craft')
  fireEvent.click(screen.getByTestId('assembly-next'))
  fireEvent.click(screen.getByTestId('assembly-next'))
  return screen.getByTestId('greenlight') as HTMLButtonElement
}

describe('Assembly production-formation handoff', () => {
  it('emits the strict exact receipt for one accepted managed Ready-screenplay greenlight', () => {
    const { state, projectId } = readyScreenplay('assembly-formation-managed')
    const onGreenlit = vi.fn()
    render(
      <Assembly
        state={state}
        scriptProjectId={projectId}
        onGreenlit={onGreenlit}
        onCancel={() => {}}
      />,
    )

    const greenlightButton = finishManagedReadyPackage()
    expect(greenlightButton).toBeEnabled()
    fireEvent.click(greenlightButton)

    expect(onGreenlit).toHaveBeenCalledTimes(1)
    const [next, receipt] = onGreenlit.mock.calls[0] as [
      GameState,
      GreenlightFormationReceipt | null,
    ]
    const added = next.studio.activeProductions.filter(
      (production) =>
        !state.studio.activeProductions.some((prior) => prior.id === production.id),
    )
    expect(added).toHaveLength(1)
    expect(receipt).toEqual({
      productionId: added[0]!.id,
      directorId: added[0]!.directorId,
      leadId: added[0]!.cast.lead,
      greenlightWeek: state.market.tick,
      scriptProjectId: projectId,
    })
    expect(receipt).toEqual(acceptedGreenlightFormationReceipt(state, next))
  })

  it('releases the synchronous gate after Engine rejection, then accepts one legacy callback with a null special receipt despite event tails', () => {
    const state = newFoundedGame('assembly-formation-legacy-retry')
    expect(state.operations.mode).toBe('legacy')
    const onGreenlit = vi.fn()
    const greenlightCalls = vi.spyOn(engineAdapter, 'greenlight')
    const view = render(
      <Assembly state={state} onGreenlit={onGreenlit} onCancel={() => {}} />,
    )
    finishLegacyDirectPackage()

    // Keep the completed draft mounted but replace the prop with a state for which the real
    // Engine rejects greenlight. Assembly owns no founding legality preview, so the native
    // button remains the action path and exercises the rejection-release branch directly.
    const founding = newGame('assembly-formation-rejection-source').founding
    if (founding === null) throw new Error('setup: new game did not open founding')
    const rejectedState: GameState = { ...state, founding }
    view.rerender(
      <Assembly state={rejectedState} onGreenlit={onGreenlit} onCancel={() => {}} />,
    )
    fireEvent.click(screen.getByTestId('greenlight'))
    expect(onGreenlit).not.toHaveBeenCalled()
    // C2a-M2/R4: the refusal is still announced at the same alert, but in the studio's
    // language. This assertion used to read /founding draft/i — which passed only
    // because the engine's own throw was rendered verbatim (the 00F defect). It now
    // pins the voiced refusal AND the absence of the engine string it replaced.
    const refused = screen.getByTestId('greenlight-refusal')
    expect(refused).toHaveAttribute('role', 'alert')
    expect(refused).toHaveAttribute('data-refusal', 'greenlight-before-founding')
    expect(refused).toHaveTextContent('The studio is not founded yet')
    expect(refused).toHaveTextContent('Finish the founding roster and found the studio.')
    expect(refused.textContent ?? '').not.toContain('applyActions')
    fireEvent.click(screen.getByTestId('greenlight'))
    fireEvent.click(screen.getByTestId('greenlight'))
    expect(greenlightCalls).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('greenlight-refusal')).toHaveTextContent(
      'The studio is not founded yet',
    )

    // The rejected attempt must not poison retry. Restore the exact legal state and send the
    // kinds of compatibility/cross-key tails that can follow one accepted native click.
    view.rerender(
      <Assembly state={state} onGreenlit={onGreenlit} onCancel={() => {}} />,
    )
    const greenlightButton = screen.getByTestId('greenlight')
    fireEvent.click(greenlightButton)
    fireEvent.keyDown(greenlightButton, { key: 'Enter', repeat: true })
    fireEvent.keyDown(greenlightButton, { key: ' ', repeat: true })
    fireEvent.click(greenlightButton)

    expect(greenlightCalls).toHaveBeenCalledTimes(2)
    expect(onGreenlit).toHaveBeenCalledTimes(1)
    const [next, receipt] = onGreenlit.mock.calls[0] as [GameState, unknown]
    expect(next).not.toBe(state)
    expect(receipt).toBeNull()
    expect(acceptedGreenlightFormationReceipt(state, next)).toBeNull()
  })
})
