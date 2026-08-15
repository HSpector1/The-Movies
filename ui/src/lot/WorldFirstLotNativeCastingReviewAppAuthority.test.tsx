import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ComponentProps } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App.tsx'
import {
  acknowledgeCastingSessionAction,
  advanceToNextEvent,
  createBalancedTalent,
  exportSaveJson,
  findConcept,
  greenlightScriptProject,
  importSaveJson,
  marketingMenu,
  releaseTalentAction,
  requiredNegative,
  scriptProjectsBoard,
  studioPool,
  freelancerPool,
  type DraftPackage,
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
import {
  acceptedGreenlightFormationReceipt,
  type GreenlightFormationReceipt,
} from './snapshot/productionFormation.ts'

type LotProps = ComponentProps<typeof StudioLotScreenType>
type AssemblyProbeProps = {
  state: GameState
  scriptProjectId?: string
  surface?: 'standalone' | 'lot-workspace'
  onGreenlit: (next: GameState, receipt: GreenlightFormationReceipt | null) => void
  onCancel: () => void
  onStateChange?: (next: GameState) => void
  onOpenProfile?: (personId: string) => void
}

const authorityProbe = vi.hoisted(() => ({
  lotProps: null as LotProps | null,
  trace: [] as string[],
  acknowledgeCalls: [] as Array<{ state: GameState; sessionId: string }>,
  rejectCastingAction: false,
  exitLotWhenSessionCompletes: null as string | null,
  unmountApp: null as (() => void) | null,
  assemblyProps: null as AssemblyProbeProps | null,
  lotMounts: 0,
  lotUnmounts: 0,
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
      React.useLayoutEffect(() => {
        authorityProbe.lotMounts += 1
        return () => { authorityProbe.lotUnmounts += 1 }
      }, [])
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
      return React.createElement(
        'div',
        {
          'data-testid': 'mock-casting-authority-lot',
          'data-world-suspended': String(props.worldInputSuspended === true),
          'data-state-productions': String(props.state.studio.activeProductions.length),
          'data-live-formation': props.liveFormationPresentation?.receipt.productionId ?? 'none',
        },
        React.createElement('div', { 'data-testid': 'mock-casting-authority-canvas' }),
      )
    },
  }
})

vi.mock('../screens/Assembly.tsx', async () => {
  const React = await import('react')
  return {
    Assembly: (props: AssemblyProbeProps) => {
      authorityProbe.assemblyProps = props
      authorityProbe.trace.push(`assembly:${props.scriptProjectId ?? 'none'}`)
      return React.createElement(
        'div',
        {
          'data-project-id': props.scriptProjectId,
          'data-testid': 'mock-casting-authority-assembly',
          'data-surface': props.surface,
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

function exactGreenlight(state: GameState, projectId: string) {
  const locked = scriptProjectsBoard(state).packages.find(
    (candidate) => candidate.projectId === projectId,
  )
  if (locked === undefined) throw new Error('setup: exact Ready screenplay is absent')
  const available = (role: 'director' | 'actor' | 'craft') => [
    ...studioPool(state, role),
    ...freelancerPool(state, role).map((candidate) => candidate.talent),
  ].filter((candidate) => candidate.available)
  const director = available('director').find(
    (candidate) => candidate.id !== locked.writer.id,
  )
  const actors = available('actor').filter(
    (candidate) =>
      candidate.id !== locked.writer.id && candidate.id !== director?.id,
  ).slice(0, 3)
  const reserved = new Set([
    locked.writer.id,
    director?.id,
    ...actors.map((candidate) => candidate.id),
  ])
  const craft = available('craft').find((candidate) => !reserved.has(candidate.id))
  if (director === undefined || actors.length !== 3 || craft === undefined) {
    throw new Error('setup: exact Package company is unavailable')
  }
  const concept = findConcept(state, locked.concept.id)
  if (concept === undefined) throw new Error('setup: exact screenplay concept is absent')
  const negative = requiredNegative(concept, locked.lockedShape, state)
  const withoutMarketing: DraftPackage = {
    conceptId: locked.concept.id,
    shape: locked.lockedShape,
    promise: locked.lockedPromise,
    writerId: locked.writer.id,
    directorId: director.id,
    cast: {
      lead: actors[0]!.id,
      antagonist: actors[1]!.id,
      support: actors[2]!.id,
    },
    craftIds: [craft.id],
    budget: { negative, marketing: 0 },
  }
  const pkg: DraftPackage = {
    ...withoutMarketing,
    budget: {
      negative,
      marketing: marketingMenu(state, withoutMarketing, projectId).levels[1],
    },
  }
  const outcome = greenlightScriptProject(state, projectId, pkg)
  if (!outcome.ok) throw new Error(outcome.error)
  const receipt = acceptedGreenlightFormationReceipt(state, outcome.next)
  if (receipt === null) throw new Error('setup: exact formation receipt is absent')
  return { next: outcome.next, receipt }
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
  authorityProbe.assemblyProps = null
  authorityProbe.lotMounts = 0
  authorityProbe.lotUnmounts = 0
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
  authorityProbe.assemblyProps = null
  authorityProbe.lotMounts = 0
  authorityProbe.lotUnmounts = 0
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Lot-native Casting review — App commit and handoff authority', () => {
  it('commits the clear successor, invokes autosave, then opens the exact Package owner once', async () => {
    const before = fixtureState()
    const lot = await mountStudio(before)
    const canvas = screen.getByTestId('mock-casting-authority-canvas')
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
    expect(assembly).toHaveAttribute('data-surface', 'lot-workspace')
    expect(screen.getByTestId('mock-casting-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-casting-authority-canvas')).toBe(canvas)
    expect(screen.getByTestId('mock-casting-authority-lot')).toHaveAttribute(
      'data-world-suspended',
      'true',
    )
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)
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

  it('contains retained Lot profile tails while the Package and its nested Profile own input', async () => {
    const before = reviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null || !context.action.opensPackage) {
      throw new Error('setup: expected one clear pending Casting review')
    }
    await mountStudio(before)
    const prePackageLotProps = authorityProbe.lotProps!

    act(() => {
      expect(prePackageLotProps.onRunCastingReviewAction?.(
        prePackageLotProps.state,
        context,
        context.action,
        null,
      )?.ok).toBe(true)
    })
    await screen.findByTestId('mock-casting-authority-assembly')
    const suspendedLotProps = authorityProbe.lotProps!
    const assemblyProps = authorityProbe.assemblyProps!

    act(() => {
      prePackageLotProps.onOpenTalentProfile?.(context.writer.id)
      suspendedLotProps.onOpenTalentProfile?.(context.writer.id)
    })
    expect(screen.queryByTestId('talent-profile')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-package-workspace')).toBeInTheDocument()

    act(() => assemblyProps.onOpenProfile?.(context.writer.id))
    expect(await screen.findByTestId('talent-profile')).toBeInTheDocument()
    const profileCoveredLotProps = authorityProbe.lotProps!
    act(() => profileCoveredLotProps.onCloseTalentProfile?.(context.writer.id))
    expect(screen.getByTestId('talent-profile')).toBeInTheDocument()
    expect(screen.getByTestId('lot-package-workspace-layer')).toHaveAttribute('inert')

    fireEvent.click(screen.getByTestId('talent-profile-close'))
    await waitFor(() => expect(screen.queryByTestId('talent-profile')).not.toBeInTheDocument())
    expect(screen.getByTestId('lot-package-workspace')).toBeInTheDocument()
  })

  it('cancels only the optional Package open when a current Lot Profile wins the handoff boundary', async () => {
    const before = reviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null || !context.action.opensPackage) {
      throw new Error('setup: expected one clear pending Casting review')
    }
    const accepted = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!accepted.ok) throw new Error(accepted.error)
    await mountStudio(before)
    const reviewProps = authorityProbe.lotProps!
    const deferred: Array<() => void> = []
    vi.spyOn(window, 'queueMicrotask').mockImplementation((callback) => {
      deferred.push(callback)
    })

    act(() => {
      expect(reviewProps.onRunCastingReviewAction?.(
        reviewProps.state,
        context,
        context.action,
        null,
      )?.ok).toBe(true)
    })
    expect(deferred.length).toBeGreaterThanOrEqual(1)
    const acceptedLotProps = authorityProbe.lotProps!
    expect(acceptedLotProps.state).not.toBe(before)
    expect(exportSaveJson(acceptedLotProps.state)).toBe(exportSaveJson(accepted.next))

    act(() => acceptedLotProps.onOpenTalentProfile?.(context.writer.id))
    expect(await screen.findByTestId('talent-profile')).toBeInTheDocument()
    act(() => deferred.splice(0).forEach((callback) => callback()))

    expect(screen.queryByTestId('lot-package-workspace')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-casting-authority-assembly')).not.toBeInTheDocument()
    expect(screen.getByTestId('talent-profile')).toBeInTheDocument()
    expect(activeSessionBytes()).toBe(exportSaveJson(accepted.next))
  })

  it('accepts one exact Custom Talent successor without replacing the Lot, workspace, or Assembly owner', async () => {
    const before = reviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null || !context.action.opensPackage) {
      throw new Error('setup: expected one clear pending Casting review')
    }
    const lot = await mountStudio(before)
    const canvas = screen.getByTestId('mock-casting-authority-canvas')
    const reviewProps = authorityProbe.lotProps!
    act(() => {
      expect(reviewProps.onRunCastingReviewAction?.(
        reviewProps.state,
        context,
        context.action,
        null,
      )?.ok).toBe(true)
    })
    const assembly = await screen.findByTestId('mock-casting-authority-assembly')
    const assemblyProps = authorityProbe.assemblyProps!
    const created = createBalancedTalent(assemblyProps.state, {
      name: 'Workspace Prospect',
      age: 27,
      role: 'actor',
      actual: { warmth: 0, gravity: 0, physicality: 0 },
      presetId: 'balancedActingProspect',
      potentialTier: 'Promising',
      workEthic: 60,
      allocation: {},
    })
    if (!created.ok) throw new Error(created.error)

    act(() => assemblyProps.onStateChange?.(created.next))
    await waitFor(() => expect(activeSessionBytes()).toBe(exportSaveJson(created.next)))
    expect(screen.getByTestId('mock-casting-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-casting-authority-canvas')).toBe(canvas)
    expect(screen.getByTestId('mock-casting-authority-assembly')).toBe(assembly)
    expect(authorityProbe.assemblyProps?.state).toBe(created.next)
    expect(authorityProbe.lotProps?.state).toBe(created.next)
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)
    expect(screen.getByTestId('mock-casting-authority-lot')).toHaveAttribute(
      'data-world-suspended',
      'true',
    )
    expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()

    act(() => assemblyProps.onStateChange?.(before))
    expect(activeSessionBytes()).toBe(exportSaveJson(created.next))
    expect(authorityProbe.assemblyProps?.state).toBe(created.next)
  })

  it('keeps the committing successor above the same Lot until autosave, then publishes one live formation atomically', async () => {
    const before = reviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null || !context.action.opensPackage) {
      throw new Error('setup: expected one clear pending Casting review')
    }
    const acknowledged = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!acknowledged.ok) throw new Error(acknowledged.error)
    const lot = await mountStudio(before)
    const canvas = screen.getByTestId('mock-casting-authority-canvas')
    const lotProps = authorityProbe.lotProps!

    act(() => {
      expect(lotProps.onRunCastingReviewAction?.(
        lotProps.state,
        context,
        context.action,
        null,
      )?.ok).toBe(true)
    })
    await screen.findByTestId('mock-casting-authority-assembly')
    const assemblyProps = authorityProbe.assemblyProps!
    const accepted = exactGreenlight(assemblyProps.state, context.projectId)
    const deferred: Array<() => void> = []
    vi.spyOn(window, 'queueMicrotask').mockImplementation((callback) => {
      deferred.push(callback)
    })
    authorityProbe.trace.length = 0

    act(() => assemblyProps.onGreenlit(accepted.next, accepted.receipt))

    expect(screen.getByTestId('lot-package-workspace-committing')).toHaveTextContent(
      'GREENLIGHT ACCEPTED',
    )
    expect(screen.queryByTestId('mock-casting-authority-assembly')).not.toBeInTheDocument()
    expect(screen.getByTestId('mock-casting-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-casting-authority-canvas')).toBe(canvas)
    expect(screen.getByTestId('mock-casting-authority-lot')).toHaveAttribute(
      'data-world-suspended',
      'true',
    )
    expect(screen.getByTestId('mock-casting-authority-lot')).toHaveAttribute(
      'data-state-productions',
      '1',
    )
    expect(authorityProbe.trace).toContain('save')
    expect(activeSessionBytes()).toBe(exportSaveJson(accepted.next))
    expect(deferred.length).toBeGreaterThanOrEqual(1)

    act(() => deferred.forEach((callback) => callback()))
    await waitFor(() => expect(screen.queryByTestId('lot-package-workspace')).not.toBeInTheDocument())
    expect(screen.getByTestId('mock-casting-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-casting-authority-canvas')).toBe(canvas)
    expect(screen.getByTestId('mock-casting-authority-lot')).toHaveAttribute(
      'data-world-suspended',
      'false',
    )
    expect(screen.getByTestId('mock-casting-authority-lot')).toHaveAttribute(
      'data-live-formation',
      accepted.receipt.productionId,
    )
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)

    const liveIdentity = authorityProbe.lotProps?.liveFormationPresentation?.identity
    if (liveIdentity === undefined) throw new Error('expected one live formation identity')
    act(() => authorityProbe.lotProps?.onLiveFormationConsumed?.(liveIdentity))
    expect(authorityProbe.lotProps?.liveFormationPresentation).toBeUndefined()
    expect(screen.getByTestId('mock-casting-authority-lot')).toHaveAttribute(
      'data-live-formation',
      'none',
    )
  })

  it('commits a valid greenlight with a mismatched presentation receipt but exposes no formation guess', async () => {
    const before = reviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null || !context.action.opensPackage) {
      throw new Error('setup: expected one clear pending Casting review')
    }
    await mountStudio(before)
    const lotProps = authorityProbe.lotProps!
    act(() => {
      expect(lotProps.onRunCastingReviewAction?.(
        lotProps.state,
        context,
        context.action,
        null,
      )?.ok).toBe(true)
    })
    await screen.findByTestId('mock-casting-authority-assembly')
    const assemblyProps = authorityProbe.assemblyProps!
    const accepted = exactGreenlight(assemblyProps.state, context.projectId)

    act(() => assemblyProps.onGreenlit(accepted.next, {
      ...accepted.receipt,
      productionId: `${accepted.receipt.productionId}-substitute`,
    }))

    await waitFor(() => expect(screen.queryByTestId('lot-package-workspace')).not.toBeInTheDocument())
    expect(activeSessionBytes()).toBe(exportSaveJson(accepted.next))
    expect(screen.getByTestId('mock-casting-authority-lot')).toHaveAttribute(
      'data-state-productions',
      '1',
    )
    expect(screen.getByTestId('mock-casting-authority-lot')).toHaveAttribute(
      'data-live-formation',
      'none',
    )
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)
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
