import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  commissionScriptAction,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  scriptProjectsBoard,
  signContractAction,
} from '../engine/adapter.ts'
import type { CreativeRole, GameState } from '../engine/adapter.ts'
import { ScreenplayCommissionForm, WritersRoom } from './WritersRoom.tsx'

afterEach(cleanup)

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
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

describe('ScreenplayCommissionForm shared action boundary', () => {
  it('emits the canonical explicit payload and reports acceptance before close', () => {
    const state = managedStudio('shared-commission-form-success')
    const board = scriptProjectsBoard(state)
    const events: string[] = []
    const onSubmit = vi.fn((payload) => {
      const result = commissionScriptAction(state, payload)
      if (result.ok) events.push(`accepted:${result.next.scriptDevelopment.projects[0]!.id}`)
      return result
    })
    const onError = vi.fn((message: string) => events.push(`error:${message}`))
    const onClose = vi.fn(() => events.push('close'))

    render(
      <ScreenplayCommissionForm
        board={board}
        onSubmit={onSubmit}
        onClose={onClose}
        onError={onError}
      />,
    )

    fireEvent.change(screen.getByTestId('script-shape-opening'), {
      target: { value: 'mysteryHook' },
    })
    fireEvent.click(screen.getByTestId('script-segment-family'))
    fireEvent.click(screen.getByTestId('commission-submit'))

    const concept = board.commission.concepts[0]!
    const writer = board.commission.writers.find((candidate) => candidate.available)!
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      conceptId: concept.id,
      writerId: writer.id,
      shape: {
        opening: 'mysteryHook',
        midpoint: 'reversal',
        ending: 'bittersweet',
      },
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult', 'family'],
        ranges: {
          intimacy: [-0.65, 0.15000000000000002],
          tonalWeight: [-0.65, 0.15000000000000002],
          kineticEnergy: [-0.65, 0.15000000000000002],
        },
      },
    })
    expect(events).toEqual(['accepted:script-0000', 'error:', 'close'])
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps the canonical draft open and surfaces the exact host action error', () => {
    const state = managedStudio('shared-commission-form-error')
    const exactError = 'commission rejected at the current App authority boundary'
    const onSubmit = vi.fn(() => ({ ok: false as const, error: exactError }))
    const onClose = vi.fn()
    const onError = vi.fn()

    render(
      <ScreenplayCommissionForm
        board={scriptProjectsBoard(state)}
        onSubmit={onSubmit}
        onClose={onClose}
        onError={onError}
      />,
    )

    fireEvent.change(screen.getByTestId('script-shape-ending'), {
      target: { value: 'tragic' },
    })
    fireEvent.click(screen.getByTestId('script-segment-family'))
    fireEvent.click(screen.getByTestId('commission-submit'))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(exactError)
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByTestId('commission-panel')).toBeInTheDocument()
    expect(screen.getByTestId('script-shape-ending')).toHaveValue('tragic')
    expect(screen.getByTestId('script-segment-family')).toBeChecked()
  })

  it('keeps standalone Writers Room on the shared form and reports its Engine successor', () => {
    const state = managedStudio('shared-commission-form-writers-room')
    const onChange = vi.fn()

    render(
      <WritersRoom
        state={state}
        onChange={onChange}
        onOpenPackage={() => {}}
        onBack={() => {}}
      />,
    )

    fireEvent.click(screen.getByTestId('commission-open'))
    fireEvent.click(screen.getByTestId('commission-submit'))

    expect(onChange).toHaveBeenCalledTimes(1)
    const accepted = onChange.mock.calls[0]![0] as GameState
    expect(accepted.scriptDevelopment.projects).toHaveLength(1)
    expect(accepted.scriptDevelopment.projects[0]).toMatchObject({
      id: 'script-0000',
      status: 'drafting',
      commissionedWeek: state.market.tick,
      dueWeek: state.market.tick + 1,
    })
    expect(screen.queryByTestId('commission-panel')).not.toBeInTheDocument()
  })
})
