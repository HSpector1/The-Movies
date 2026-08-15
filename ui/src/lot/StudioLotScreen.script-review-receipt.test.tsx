import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import {
  advanceToNextEvent,
  commissionScriptAction,
  exportSaveJson,
  scriptProjectsBoard,
  type GameState,
} from '../engine/adapter.ts'
import {
  clearOperationHollywoodOverride,
  setOperationHollywoodOverride,
} from '../flags.ts'
import { newFoundedGame } from '../test/founding.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import {
  acceptedLotNextEventReceipt,
  type LotCadenceFeedback,
  type LotNextEventReceipt,
} from './snapshot/nextEvent.ts'
import { resetLotSelectedBuilding } from './snapshot/selectedBuildingSession.ts'

vi.mock('./StudioLotView.ts', () => ({
  StudioLotView: class {
    constructor(options: { onReady?: () => void }) {
      queueMicrotask(() => options.onReady?.())
    }
    setSnapshot() {}
    setInputSuspended() {}
    clearSelection() {}
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {}
    select() {}
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() {}
    destroy() {}
  },
}))

const SHAPE = {
  opening: 'slowSetup',
  midpoint: 'reversal',
  ending: 'bittersweet',
} as const

function commissionedStudio(seed: string): GameState {
  const state = applyActions(newFoundedGame(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]
  const writer = board.commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) {
    throw new Error('setup: expected an available screenplay commission')
  }
  const result = commissionScriptAction(state, {
    conceptId: concept.id,
    writerId: writer.id,
    shape: SHAPE,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.65, 0.15],
        tonalWeight: [-0.65, 0.15],
        kineticEnergy: [-0.65, 0.15],
      },
    },
  })
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function exactScriptStop(seed: string): {
  state: GameState
  receipt: LotNextEventReceipt
} {
  const before = commissionedStudio(seed)
  const stopped = advanceToNextEvent(before)
  const receipt = acceptedLotNextEventReceipt(before, stopped)
  if (stopped.stopReason !== 'scriptReview' || receipt?.target.kind !== 'script') {
    throw new Error('setup: expected one exact script-review receipt')
  }
  return { state: stopped.next, receipt }
}

function withoutStopMessage(receipt: LotNextEventReceipt): unknown {
  const { stopMessage: _removed, ...malformed } = receipt
  return malformed
}

function decoratedTarget(receipt: LotNextEventReceipt): unknown {
  return {
    ...receipt,
    target: { ...receipt.target, unexpectedAuthority: true },
  }
}

function symbolDecorated(receipt: LotNextEventReceipt): unknown {
  const malformed = { ...receipt }
  Object.defineProperty(malformed, Symbol('unexpected-authority'), {
    value: true,
    enumerable: true,
  })
  return malformed
}

beforeEach(() => {
  localStorage.clear()
  resetLotSelectedBuilding()
  setOperationHollywoodOverride(false)
})

afterEach(() => {
  cleanup()
  clearOperationHollywoodOverride()
})

describe('StudioLotScreen — malformed exact script-review receipt boundary', () => {
  it.each([
    ['missing required field', withoutStopMessage],
    ['decorated target', decoratedTarget],
    ['symbol-decorated receipt', symbolDecorated],
  ])('demotes a %s without exposing or dispatching screenplay authority', async (_label, mutate) => {
    const { state, receipt } = exactScriptStop(`malformed-script-receipt-${_label}`)
    const beforeBytes = exportSaveJson(state)
    const malformed = mutate(receipt)
    const onInvalidateNextEvent = vi.fn(() => false)
    const onRunScriptReviewAction = vi.fn(() => ({
      ok: false as const,
      error: 'unexpected screenplay dispatch',
    }))
    const onOpenScriptReviewDetails = vi.fn(() => false)
    const onOpenNextEventDetails = vi.fn(() => false)
    const onNavigate = vi.fn()

    expect(() => render(
      <StudioLotScreen
        state={state}
        onNavigate={onNavigate}
        onExit={vi.fn()}
        onAdvance={vi.fn()}
        cadenceFeedback={{
          kind: 'next-event-exact',
          receipt: malformed,
        } as unknown as LotCadenceFeedback}
        onInvalidateNextEvent={onInvalidateNextEvent}
        onRunScriptReviewAction={onRunScriptReviewAction}
        onOpenScriptReviewDetails={onOpenScriptReviewDetails}
        onOpenNextEventDetails={onOpenNextEventDetails}
      />,
    )).not.toThrow()

    const rail = await screen.findByTestId('lot-next-event-rail')
    expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-neutral')
    expect(rail).toHaveTextContent('Studio event details changed. Review the current lot.')
    expect(screen.queryByTestId('lot-script-review-panel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-script-review-open-details')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-next-event-open-details')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Accept .* draft/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Request final rewrite' })).not.toBeInTheDocument()
    await waitFor(() => expect(onInvalidateNextEvent).toHaveBeenCalledOnce())
    expect(onInvalidateNextEvent).toHaveBeenCalledWith(state, malformed)
    expect(onRunScriptReviewAction).not.toHaveBeenCalled()
    expect(onOpenScriptReviewDetails).not.toHaveBeenCalled()
    expect(onOpenNextEventDetails).not.toHaveBeenCalled()
    expect(onNavigate).not.toHaveBeenCalled()
    expect(exportSaveJson(state)).toBe(beforeBytes)
  })
})
