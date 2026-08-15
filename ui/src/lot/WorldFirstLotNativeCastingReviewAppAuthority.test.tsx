import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ComponentProps } from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App.tsx'
import {
  acknowledgeCastingSessionAction,
  advanceToNextEvent,
  exportSaveJson,
  importSaveJson,
  releaseTalentAction,
  type GameState,
} from '../engine/adapter.ts'
import {
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
} from '../engine/session.ts'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import type StudioLotScreenType from './StudioLotScreen.tsx'
import {
  sameLotNextEventReceipt,
  type LotCadenceFeedback,
  type LotNextEventReceipt,
} from './snapshot/nextEvent.ts'
import { currentLotCastingReviewContext } from './snapshot/castingReview.ts'

type LotProps = ComponentProps<typeof StudioLotScreenType>

const authorityProbe = vi.hoisted(() => ({
  lotProps: null as LotProps | null,
  trace: [] as string[],
  acknowledgeCalls: [] as Array<{ state: GameState; sessionId: string }>,
  rejectCastingAction: false,
  exitLotWhenSessionCompletes: null as string | null,
  unmountApp: null as (() => void) | null,
}))

vi.mock('../engine/adapter.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/adapter.ts')>()
  return {
    ...actual,
    acknowledgeCastingSessionAction(state: GameState, sessionId: string) {
      authorityProbe.acknowledgeCalls.push({ state, sessionId })
      if (authorityProbe.rejectCastingAction) {
        return { ok: false as const, error: 'test-only Casting acknowledgement rejection' }
      }
      return actual.acknowledgeCastingSessionAction(state, sessionId)
    },
  }
})

vi.mock('../engine/session.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/session.ts')>()
  return {
    ...actual,
    saveActiveSession(state: GameState) {
      authorityProbe.trace.push('save')
      return actual.saveActiveSession(state)
    },
  }
})

vi.mock('./StudioLotScreen.tsx', async () => {
  const React = await import('react')
  return {
    default: (props: LotProps) => {
      authorityProbe.lotProps = props
      authorityProbe.trace.push('lot')
      React.useLayoutEffect(
        () => props.onPresentationMount?.(),
        [props.onPresentationMount],
      )
      React.useLayoutEffect(() => {
        const sessionId = authorityProbe.exitLotWhenSessionCompletes
        if (
          sessionId !== null &&
          props.state.castingSessions.sessions.some(
            (session) => session.id === sessionId && session.status === 'complete',
          )
        ) {
          authorityProbe.exitLotWhenSessionCompletes = null
          props.onExit()
        }
      }, [props])
      return React.createElement('div', { 'data-testid': 'mock-casting-authority-lot' })
    },
  }
})

vi.mock('../screens/Assembly.tsx', async () => {
  const React = await import('react')
  return {
    Assembly: (props: { scriptProjectId?: string; onCancel: () => void }) => {
      authorityProbe.trace.push(`assembly:${props.scriptProjectId ?? 'none'}`)
      return React.createElement(
        'div',
        {
          'data-project-id': props.scriptProjectId,
          'data-testid': 'mock-casting-authority-assembly',
        },
        React.createElement('button', {
          'data-testid': 'mock-casting-authority-assembly-back',
          onClick: props.onCancel,
          type: 'button',
        }, 'Back to studio'),
      )
    },
  }
})

function fixtureState(): GameState {
  const bytes = readFileSync(
    join(process.cwd(), 'ui/e2e/lot-native-next-event-v1/casting-review.save.json'),
    'utf8',
  )
  const imported = importSaveJson(bytes)
  if (!imported.ok) throw new Error(imported.error)
  return imported.state
}

function reviewState(): GameState {
  const stopped = advanceToNextEvent(fixtureState())
  if (stopped.stopReason !== 'castingReview') {
    throw new Error('setup: expected the Casting review stop')
  }
  return stopped.next
}

function blockedReviewState(): GameState {
  const review = reviewState()
  const context = currentLotCastingReviewContext(review)
  if (context === null) throw new Error('setup: expected a clear Casting review')
  const released = releaseTalentAction(review, context.writer.id)
  if (!released.ok) throw new Error(released.error)
  const blocked = currentLotCastingReviewContext(released.next)
  if (blocked === null || blocked.action.opensPackage) {
    throw new Error('setup: expected the released writer to block Package Assembly')
  }
  return released.next
}

function exactFeedback(props: LotProps): Extract<
  LotCadenceFeedback,
  { kind: 'next-event-exact' }
> {
  const feedback = props.cadenceFeedback
  if (feedback?.kind !== 'next-event-exact') {
    throw new Error('setup: expected one exact Lot event')
  }
  return feedback
}

function activeSessionBytes(): string {
  const loaded = loadActiveSession()
  if (!loaded.ok) throw new Error('setup: expected one active session')
  return exportSaveJson(loaded.state)
}

async function mountStudio(state: GameState) {
  saveActiveSession(state)
  authorityProbe.trace.length = 0
  authorityProbe.acknowledgeCalls.length = 0
  const mounted = render(<App />)
  authorityProbe.unmountApp = mounted.unmount
  const lot = await screen.findByTestId('mock-casting-authority-lot')
  await waitFor(() => expect(activeSessionBytes()).toBe(exportSaveJson(state)))
  authorityProbe.trace.length = 0
  authorityProbe.acknowledgeCalls.length = 0
  return lot
}

beforeEach(() => {
  localStorage.clear()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
  authorityProbe.lotProps = null
  authorityProbe.trace.length = 0
  authorityProbe.acknowledgeCalls.length = 0
  authorityProbe.rejectCastingAction = false
  authorityProbe.exitLotWhenSessionCompletes = null
  authorityProbe.unmountApp = null
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  authorityProbe.lotProps = null
  authorityProbe.trace.length = 0
  authorityProbe.acknowledgeCalls.length = 0
  authorityProbe.rejectCastingAction = false
  authorityProbe.exitLotWhenSessionCompletes = null
  authorityProbe.unmountApp = null
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Lot-native Casting review — App commit and handoff authority', () => {
  it('commits the clear successor, invokes autosave, then opens the exact Package owner once', async () => {
    const before = fixtureState()
    await mountStudio(before)
    const initial = authorityProbe.lotProps!

    act(() => {
      expect(initial.onSimToNextEvent?.(initial.state)).toBe(true)
    })
    await waitFor(() => expect(authorityProbe.lotProps?.cadenceFeedback?.kind).toBe('next-event-exact'))
    const reviewProps = authorityProbe.lotProps!
    const receipt = exactFeedback(reviewProps).receipt
    const context = currentLotCastingReviewContext(reviewProps.state)
    if (receipt.target.kind !== 'casting' || context === null || !context.action.opensPackage) {
      throw new Error('setup: expected one clear event-owned Casting review')
    }
    const direct = acknowledgeCastingSessionAction(reviewProps.state, context.sessionId)
    if (!direct.ok) throw new Error(direct.error)
    authorityProbe.trace.length = 0
    authorityProbe.acknowledgeCalls.length = 0

    let firstResult: ReturnType<NonNullable<LotProps['onRunCastingReviewAction']>> | undefined
    let duplicateResult: ReturnType<NonNullable<LotProps['onRunCastingReviewAction']>> | undefined
    act(() => {
      firstResult = reviewProps.onRunCastingReviewAction?.(
        reviewProps.state,
        context,
        context.action,
        receipt,
      )
      duplicateResult = reviewProps.onRunCastingReviewAction?.(
        reviewProps.state,
        context,
        context.action,
        receipt,
      )
    })
    expect(firstResult?.ok).toBe(true)
    expect(duplicateResult?.ok).toBe(false)

    const assembly = await screen.findByTestId('mock-casting-authority-assembly')
    expect(assembly).toHaveAttribute('data-project-id', context.projectId)
    expect(authorityProbe.acknowledgeCalls).toHaveLength(1)
    expect(authorityProbe.acknowledgeCalls[0]).toEqual({
      state: reviewProps.state,
      sessionId: context.sessionId,
    })
    expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))

    const saveIndex = authorityProbe.trace.indexOf('save')
    const assemblyIndex = authorityProbe.trace.indexOf(`assembly:${context.projectId}`)
    const committedLotIndex = authorityProbe.trace
      .slice(0, saveIndex)
      .lastIndexOf('lot')
    expect(committedLotIndex).toBeGreaterThanOrEqual(0)
    expect(saveIndex).toBeGreaterThan(committedLotIndex)
    expect(assemblyIndex).toBeGreaterThan(saveIndex)
    expect(authorityProbe.trace.filter((entry) => entry.startsWith('assembly:'))).toHaveLength(1)
  })

  it('keeps a blocked accepted successor in the same mounted Lot and autosaves exact parity', async () => {
    const before = blockedReviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null || context.action.opensPackage) {
      throw new Error('setup: expected one blocked pending Casting review')
    }
    const direct = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!direct.ok) throw new Error(direct.error)
    const lot = await mountStudio(before)
    const reviewProps = authorityProbe.lotProps!
    authorityProbe.trace.length = 0
    authorityProbe.acknowledgeCalls.length = 0

    let result: ReturnType<NonNullable<LotProps['onRunCastingReviewAction']>> | undefined
    act(() => {
      result = reviewProps.onRunCastingReviewAction?.(
        reviewProps.state,
        context,
        context.action,
        null,
      )
    })
    expect(result?.ok).toBe(true)
    await waitFor(() => {
      expect(authorityProbe.lotProps?.state).not.toBe(before)
      expect(exportSaveJson(authorityProbe.lotProps!.state)).toBe(exportSaveJson(direct.next))
    })
    await waitFor(() => expect(activeSessionBytes()).toBe(exportSaveJson(direct.next)))

    expect(screen.getByTestId('mock-casting-authority-lot')).toBe(lot)
    expect(screen.queryByTestId('mock-casting-authority-assembly')).not.toBeInTheDocument()
    expect(authorityProbe.acknowledgeCalls).toHaveLength(1)
    expect(authorityProbe.acknowledgeCalls[0]).toEqual({
      state: before,
      sessionId: context.sessionId,
    })
    const saveIndex = authorityProbe.trace.indexOf('save')
    const committedLotIndex = authorityProbe.trace
      .slice(0, saveIndex)
      .lastIndexOf('lot')
    expect(committedLotIndex).toBeGreaterThanOrEqual(0)
    expect(saveIndex).toBeGreaterThan(committedLotIndex)
    expect(authorityProbe.trace.some((entry) => entry.startsWith('assembly:'))).toBe(false)
  })

  it('restores one rejected event ceremony and permits exactly one later fresh retry', async () => {
    await mountStudio(fixtureState())
    const initial = authorityProbe.lotProps!
    act(() => {
      expect(initial.onSimToNextEvent?.(initial.state)).toBe(true)
    })
    await waitFor(() => expect(authorityProbe.lotProps?.cadenceFeedback?.kind).toBe('next-event-exact'))
    const reviewProps = authorityProbe.lotProps!
    const receipt = exactFeedback(reviewProps).receipt
    const context = currentLotCastingReviewContext(reviewProps.state)
    if (receipt.target.kind !== 'casting' || context === null) {
      throw new Error('setup: expected one event-owned Casting review')
    }
    const reviewBytes = exportSaveJson(reviewProps.state)
    authorityProbe.trace.length = 0
    authorityProbe.acknowledgeCalls.length = 0
    authorityProbe.rejectCastingAction = true

    let rejected: ReturnType<NonNullable<LotProps['onRunCastingReviewAction']>> | undefined
    act(() => {
      rejected = reviewProps.onRunCastingReviewAction?.(
        reviewProps.state,
        context,
        context.action,
        receipt,
      )
    })
    expect(rejected).toEqual({
      ok: false,
      error: 'test-only Casting acknowledgement rejection',
    })
    await waitFor(() => expect(authorityProbe.lotProps?.cadenceFeedback?.kind).toBe('next-event-exact'))
    expect(exportSaveJson(authorityProbe.lotProps!.state)).toBe(reviewBytes)
    expect(activeSessionBytes()).toBe(reviewBytes)
    expect(authorityProbe.acknowledgeCalls).toHaveLength(1)
    expect(screen.queryByTestId('mock-casting-authority-assembly')).not.toBeInTheDocument()

    await new Promise((resolve) => setTimeout(resolve, 0))
    authorityProbe.rejectCastingAction = false
    const restoredProps = authorityProbe.lotProps!
    const restoredReceipt = exactFeedback(restoredProps).receipt
    const restoredContext = currentLotCastingReviewContext(restoredProps.state)
    if (restoredContext === null) throw new Error('setup: restored Casting context is absent')
    act(() => {
      const retried = restoredProps.onRunCastingReviewAction?.(
        restoredProps.state,
        restoredContext,
        restoredContext.action,
        restoredReceipt,
      )
      expect(retried?.ok).toBe(true)
    })

    await screen.findByTestId('mock-casting-authority-assembly')
    expect(authorityProbe.acknowledgeCalls).toHaveLength(2)
  })

  it('demotes a malformed Casting receipt neutrally, then permits only a later explicit pending action', async () => {
    await mountStudio(fixtureState())
    const initial = authorityProbe.lotProps!
    act(() => {
      expect(initial.onSimToNextEvent?.(initial.state)).toBe(true)
    })
    await waitFor(() => expect(authorityProbe.lotProps?.cadenceFeedback?.kind).toBe('next-event-exact'))
    const reviewProps = authorityProbe.lotProps!
    const receipt = exactFeedback(reviewProps).receipt
    const context = currentLotCastingReviewContext(reviewProps.state)
    if (receipt.target.kind !== 'casting' || context === null) {
      throw new Error('setup: expected one event-owned Casting review')
    }
    const reviewBytes = exportSaveJson(reviewProps.state)
    const malformed = {
      ...receipt,
      target: { ...receipt.target, unexpectedAuthority: true },
    } as unknown as LotNextEventReceipt

    act(() => {
      expect(reviewProps.onInvalidateNextEvent?.(reviewProps.state, malformed)).toBe(false)
    })
    await waitFor(() => expect(authorityProbe.lotProps?.cadenceFeedback?.kind).toBe('next-event-neutral'))
    const neutralProps = authorityProbe.lotProps!
    expect(exportSaveJson(neutralProps.state)).toBe(reviewBytes)
    expect(activeSessionBytes()).toBe(reviewBytes)
    expect(authorityProbe.acknowledgeCalls).toHaveLength(0)

    act(() => {
      const accepted = neutralProps.onRunCastingReviewAction?.(
        neutralProps.state,
        context,
        context.action,
        null,
      )
      expect(accepted?.ok).toBe(true)
    })
    await screen.findByTestId('mock-casting-authority-assembly')
    expect(authorityProbe.acknowledgeCalls).toHaveLength(1)
  })

  it('never lets stale Casting review closures demote or mutate a newer exact event', async () => {
    await mountStudio(fixtureState())
    const initial = authorityProbe.lotProps!
    act(() => {
      expect(initial.onSimToNextEvent?.(initial.state)).toBe(true)
    })
    await waitFor(() => expect(authorityProbe.lotProps?.cadenceFeedback?.kind).toBe('next-event-exact'))
    const reviewProps = authorityProbe.lotProps!
    const reviewReceipt = exactFeedback(reviewProps).receipt
    const reviewContext = currentLotCastingReviewContext(reviewProps.state)
    if (reviewReceipt.target.kind !== 'casting' || reviewContext === null) {
      throw new Error('setup: expected one event-owned Casting review')
    }

    act(() => {
      const accepted = reviewProps.onRunCastingReviewAction?.(
        reviewProps.state,
        reviewContext,
        reviewContext.action,
        reviewReceipt,
      )
      expect(accepted?.ok).toBe(true)
    })
    await screen.findByTestId('mock-casting-authority-assembly')
    act(() => {
      screen.getByTestId('mock-casting-authority-assembly-back').click()
    })
    await screen.findByTestId('mock-casting-authority-lot')
    const returnedProps = authorityProbe.lotProps!
    expect(returnedProps.cadenceFeedback).toBeNull()

    const expectedNewer = advanceToNextEvent(returnedProps.state)
    expect(expectedNewer.stopReason).not.toBe('limitReached')
    act(() => {
      expect(returnedProps.onSimToNextEvent?.(returnedProps.state)).toBe(true)
    })
    await waitFor(() => expect(authorityProbe.lotProps?.cadenceFeedback?.kind).toBe('next-event-exact'))
    const newerProps = authorityProbe.lotProps!
    const newerReceipt = exactFeedback(newerProps).receipt
    const newerBytes = exportSaveJson(newerProps.state)
    expect(sameLotNextEventReceipt(newerReceipt, reviewReceipt)).toBe(false)
    authorityProbe.acknowledgeCalls.length = 0

    let staleDeep: boolean | undefined
    let staleAction: ReturnType<NonNullable<LotProps['onRunCastingReviewAction']>> | undefined
    act(() => {
      staleDeep = reviewProps.onOpenNextEventDetails?.(
        reviewProps.state,
        reviewReceipt,
      )
      staleAction = reviewProps.onRunCastingReviewAction?.(
        reviewProps.state,
        reviewContext,
        reviewContext.action,
        reviewReceipt,
      )
    })
    expect(staleDeep).toBe(false)
    expect(staleAction?.ok).toBe(false)
    expect(authorityProbe.acknowledgeCalls).toHaveLength(0)
    expect(exportSaveJson(authorityProbe.lotProps!.state)).toBe(newerBytes)
    expect(activeSessionBytes()).toBe(newerBytes)
    expect(authorityProbe.lotProps!.cadenceFeedback?.kind).toBe('next-event-exact')
    expect(sameLotNextEventReceipt(
      exactFeedback(authorityProbe.lotProps!).receipt,
      newerReceipt,
    )).toBe(true)
  })

  it('invalidates retained Lot Casting callbacks synchronously when deep navigation starts', async () => {
    const before = reviewState()
    await mountStudio(before)
    const retained = authorityProbe.lotProps!
    const context = currentLotCastingReviewContext(retained.state)
    if (context === null) throw new Error('setup: expected one pending Casting review')
    const bytes = exportSaveJson(before)

    let opened: boolean | undefined
    let reopened: boolean | undefined
    let staleAction: ReturnType<NonNullable<LotProps['onRunCastingReviewAction']>> | undefined
    act(() => {
      opened = retained.onOpenCastingReviewDetails?.(retained.state, context)
      // The screen setter closes world authority synchronously, before React needs to render
      // the deep owner, so same-stack pointer/click tails cannot dispatch or navigate twice.
      staleAction = retained.onRunCastingReviewAction?.(
        retained.state,
        context,
        context.action,
        null,
      )
      reopened = retained.onOpenCastingReviewDetails?.(retained.state, context)
    })

    expect(opened).toBe(true)
    expect(staleAction).toEqual({
      ok: false,
      error: 'Casting review is no longer owned by the mounted Studio Lot.',
    })
    expect(reopened).toBe(false)
    await screen.findByTestId('casting-room')
    expect(screen.queryByTestId('mock-casting-authority-lot')).not.toBeInTheDocument()
    expect(authorityProbe.acknowledgeCalls).toHaveLength(0)
    expect(activeSessionBytes()).toBe(bytes)
  })

  it('keeps the committed clear successor and autosave but cancels Package after Lot drift', async () => {
    const before = reviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null || !context.action.opensPackage) {
      throw new Error('setup: expected one clear pending Casting review')
    }
    const direct = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!direct.ok) throw new Error(direct.error)
    await mountStudio(before)
    const reviewProps = authorityProbe.lotProps!
    authorityProbe.exitLotWhenSessionCompletes = context.sessionId
    authorityProbe.trace.length = 0
    authorityProbe.acknowledgeCalls.length = 0

    act(() => {
      const accepted = reviewProps.onRunCastingReviewAction?.(
        reviewProps.state,
        context,
        context.action,
        null,
      )
      expect(accepted?.ok).toBe(true)
    })

    await screen.findByTestId('dashboard-heading')
    await waitFor(() => expect(activeSessionBytes()).toBe(exportSaveJson(direct.next)))
    expect(screen.queryByTestId('mock-casting-authority-assembly')).not.toBeInTheDocument()
    expect(authorityProbe.acknowledgeCalls).toHaveLength(1)
    expect(authorityProbe.trace).toContain('save')
    expect(authorityProbe.trace.some((entry) => entry.startsWith('assembly:'))).toBe(false)
  })

  it('rejects retained Casting callbacks after the exact Lot presentation unmounts', async () => {
    const before = reviewState()
    await mountStudio(before)
    const retained = authorityProbe.lotProps!
    const context = currentLotCastingReviewContext(retained.state)
    if (context === null) throw new Error('setup: expected one pending Casting review')
    const bytes = exportSaveJson(before)

    act(() => authorityProbe.unmountApp?.())
    let staleDeep: boolean | undefined
    let staleAction: ReturnType<NonNullable<LotProps['onRunCastingReviewAction']>> | undefined
    act(() => {
      staleDeep = retained.onOpenCastingReviewDetails?.(retained.state, context)
      staleAction = retained.onRunCastingReviewAction?.(
        retained.state,
        context,
        context.action,
        null,
      )
    })

    expect(staleDeep).toBe(false)
    expect(staleAction).toEqual({
      ok: false,
      error: 'Casting review is no longer owned by the mounted Studio Lot.',
    })
    expect(authorityProbe.acknowledgeCalls).toHaveLength(0)
    expect(activeSessionBytes()).toBe(bytes)
  })

  it('rejects retained Casting commands synchronously behind the Talent Profile modal', async () => {
    const before = reviewState()
    await mountStudio(before)
    const retained = authorityProbe.lotProps!
    const context = currentLotCastingReviewContext(retained.state)
    if (context === null) throw new Error('setup: expected one pending Casting review')
    const personId = before.talent[0]?.id
    if (personId === undefined) throw new Error('setup: expected one Talent Profile owner')
    const bytes = exportSaveJson(before)

    let staleAction: ReturnType<NonNullable<LotProps['onRunCastingReviewAction']>> | undefined
    act(() => {
      retained.onOpenTalentProfile?.(personId)
      staleAction = retained.onRunCastingReviewAction?.(
        retained.state,
        context,
        context.action,
        null,
      )
    })

    expect(staleAction).toEqual({
      ok: false,
      error: 'Casting review is no longer owned by the mounted Studio Lot.',
    })
    await screen.findByRole('dialog')
    expect(authorityProbe.acknowledgeCalls).toHaveLength(0)
    expect(activeSessionBytes()).toBe(bytes)
  })
})
