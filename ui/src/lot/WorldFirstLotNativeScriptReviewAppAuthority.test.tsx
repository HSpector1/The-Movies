import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ComponentProps } from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App.tsx'
import {
  exportSaveJson,
  importSaveJson,
  type GameState,
} from '../engine/adapter.ts'
import {
  clearActiveSession,
  saveActiveSession,
} from '../engine/session.ts'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
} from '../flags.ts'
import type StudioLotScreenType from './StudioLotScreen.tsx'
import {
  sameLotNextEventReceipt,
  type LotCadenceFeedback,
  type LotNextEventReceipt,
} from './snapshot/nextEvent.ts'
import { currentLotScriptReviewContext } from './snapshot/scriptReview.ts'

type LotProps = ComponentProps<typeof StudioLotScreenType>

const lotProbe = vi.hoisted(() => ({ props: null as LotProps | null }))

vi.mock('./StudioLotScreen.tsx', async () => {
  const React = await import('react')
  return {
    default: (props: LotProps) => {
      lotProbe.props = props
      return React.createElement('div', { 'data-testid': 'mock-authority-lot' })
    },
  }
})

function fixtureState(): GameState {
  const bytes = readFileSync(
    join(process.cwd(), 'ui/e2e/lot-native-next-event-v1/script-review.save.json'),
    'utf8',
  )
  const imported = importSaveJson(bytes)
  if (!imported.ok) throw new Error(imported.error)
  return imported.state
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

beforeEach(() => {
  localStorage.clear()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  lotProbe.props = null
  saveActiveSession(fixtureState())
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  lotProbe.props = null
})

describe('Lot-native screenplay review — App event ownership', () => {
  it('consumes a malformed current presentation instead of retaining an inert event session', async () => {
    render(<App />)
    await screen.findByTestId('mock-authority-lot')
    const initial = lotProbe.props!

    act(() => {
      expect(initial.onSimToNextEvent?.(initial.state)).toBe(true)
    })
    await waitFor(() => expect(lotProbe.props?.cadenceFeedback?.kind).toBe('next-event-exact'))
    const reviewProps = lotProbe.props!
    const receipt = exactFeedback(reviewProps).receipt
    if (receipt.target.kind !== 'script') throw new Error('setup: expected a script receipt')
    const context = currentLotScriptReviewContext(reviewProps.state)
    const accept = context?.legalActions.find((action) => action.kind === 'acceptScript')
    if (context === null || accept === undefined) {
      throw new Error('setup: expected a current screenplay Accept action')
    }
    const bytes = exportSaveJson(reviewProps.state)
    const malformed = {
      ...receipt,
      target: { ...receipt.target, unexpectedAuthority: true },
    } as unknown as LotNextEventReceipt

    act(() => {
      expect(reviewProps.onInvalidateNextEvent?.(reviewProps.state, malformed)).toBe(false)
    })
    await waitFor(() => expect(lotProbe.props?.cadenceFeedback?.kind).toBe('next-event-neutral'))
    const neutralProps = lotProbe.props!
    expect(neutralProps.state).toBe(reviewProps.state)
    expect(exportSaveJson(neutralProps.state)).toBe(bytes)

    // This represents a later, explicit Development selection. If malformed ownership were
    // retained, App would reject this exact current pending action as an inert downgrade.
    act(() => {
      const result = neutralProps.onRunScriptReviewAction?.(
        neutralProps.state,
        context,
        accept,
        null,
      )
      expect(result?.ok).toBe(true)
    })
    await waitFor(() => expect(lotProbe.props?.state).not.toBe(neutralProps.state))
    expect(lotProbe.props?.cadenceFeedback).toBeNull()
  })

  it('never lets stale review detail/action closures demote a newer exact event', async () => {
    render(<App />)
    await screen.findByTestId('mock-authority-lot')
    const initial = lotProbe.props!

    act(() => {
      expect(initial.onSimToNextEvent?.(initial.state)).toBe(true)
    })
    await waitFor(() => expect(lotProbe.props?.cadenceFeedback?.kind).toBe('next-event-exact'))
    const reviewProps = lotProbe.props!
    const reviewReceipt = exactFeedback(reviewProps).receipt
    expect(reviewReceipt.target.kind).toBe('script')
    const reviewContext = currentLotScriptReviewContext(reviewProps.state)
    if (reviewContext === null) throw new Error('setup: screenplay review context is absent')
    const accept = reviewContext.legalActions.find((action) => action.kind === 'acceptScript')
    if (accept === undefined) throw new Error('setup: screenplay Accept is absent')

    act(() => {
      const accepted = reviewProps.onRunScriptReviewAction?.(
        reviewProps.state,
        reviewContext,
        accept,
        reviewReceipt,
      )
      expect(accepted?.ok).toBe(true)
    })
    await waitFor(() => expect(lotProbe.props?.state).not.toBe(reviewProps.state))
    const afterAccept = lotProbe.props!
    expect(afterAccept.cadenceFeedback).toBeNull()

    act(() => {
      expect(afterAccept.onSimToNextEvent?.(afterAccept.state)).toBe(true)
    })
    await waitFor(() => expect(lotProbe.props?.cadenceFeedback?.kind).toBe('next-event-exact'))
    const newerProps = lotProbe.props!
    const newerReceipt = exactFeedback(newerProps).receipt
    const newerBytes = exportSaveJson(newerProps.state)
    expect(sameLotNextEventReceipt(newerReceipt, reviewReceipt)).toBe(false)

    let deepResult: boolean | undefined
    act(() => {
      deepResult = reviewProps.onOpenNextEventDetails?.(
        reviewProps.state,
        reviewReceipt,
      )
    })
    expect(deepResult).toBe(false)
    expect(exportSaveJson(lotProbe.props!.state)).toBe(newerBytes)
    expect(lotProbe.props!.cadenceFeedback?.kind).toBe('next-event-exact')
    expect(sameLotNextEventReceipt(
      exactFeedback(lotProbe.props!).receipt,
      newerReceipt,
    )).toBe(true)

    let staleActionError = ''
    act(() => {
      const stale = reviewProps.onRunScriptReviewAction?.(
        reviewProps.state,
        reviewContext,
        accept,
        reviewReceipt,
      )
      expect(stale?.ok).toBe(false)
      if (stale !== undefined && !stale.ok) staleActionError = stale.error
    })
    expect(staleActionError).toContain('details changed')
    expect(exportSaveJson(lotProbe.props!.state)).toBe(newerBytes)
    expect(lotProbe.props!.cadenceFeedback?.kind).toBe('next-event-exact')
    expect(sameLotNextEventReceipt(
      exactFeedback(lotProbe.props!).receipt,
      newerReceipt,
    )).toBe(true)
  })
})
