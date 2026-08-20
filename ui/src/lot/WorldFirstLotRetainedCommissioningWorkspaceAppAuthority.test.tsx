import type { ComponentProps } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App.tsx'
import {
  PROMISE_CENTERS,
  PROMISE_WIDTHS,
  advanceWeek,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  rangeFrom,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
} from '../engine/adapter.ts'
import type {
  ActionOutcome,
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  ScriptProjectsReadModel,
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
import * as punctuation from '../presentation/punctuate.ts'

type LotProps = ComponentProps<typeof StudioLotScreenType>
type CommissionFormProbeProps = {
  board: ScriptProjectsReadModel
  onSubmit: (payload: CommissionScriptPayload) => ActionOutcome
  onClose: () => void
  onError: (message: string) => void
}
type SavesProbeProps = {
  state: GameState
  onLoad: (next: GameState, details: { converted: boolean }) => void
  onNewGame: () => void
  onBack: () => void
}

const authorityProbe = vi.hoisted(() => ({
  lotProps: null as LotProps | null,
  formProps: null as CommissionFormProbeProps | null,
  savesProps: null as SavesProbeProps | null,
  trace: [] as string[],
  commissionCalls: [] as Array<{ state: GameState; payload: CommissionScriptPayload }>,
  rejectCommission: false,
  lotMounts: 0,
  lotUnmounts: 0,
  liveReceiptIdentities: new Set<object>(),
}))

vi.mock('../engine/adapter.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/adapter.ts')>()
  return {
    ...actual,
    commissionScriptAction(state: GameState, payload: CommissionScriptPayload) {
      authorityProbe.trace.push('dispatch')
      authorityProbe.commissionCalls.push({ state, payload })
      if (authorityProbe.rejectCommission) {
        return {
          ok: false as const,
          error: 'test-only screenplay commission rejection',
        }
      }
      return actual.commissionScriptAction(state, payload)
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

vi.mock('../screens/WritersRoom.tsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../screens/WritersRoom.tsx')>()
  const React = await import('react')
  return {
    ...actual,
    ScreenplayCommissionForm: (props: CommissionFormProbeProps) => {
      authorityProbe.formProps = props
      return React.createElement(actual.ScreenplayCommissionForm, props)
    },
  }
})

vi.mock('../screens/Saves.tsx', async () => {
  const React = await import('react')
  return {
    Saves: (props: SavesProbeProps) => {
      authorityProbe.savesProps = props
      return React.createElement(
        'div',
        { 'data-testid': 'mock-commission-authority-saves' },
        React.createElement(
          'button',
          { type: 'button', onClick: props.onBack, 'data-testid': 'mock-saves-back' },
          'Back to studio',
        ),
      )
    },
  }
})

vi.mock('./StudioLotScreen.tsx', async () => {
  const React = await import('react')
  return {
    default: (props: LotProps) => {
      authorityProbe.lotProps = props
      authorityProbe.trace.push('lot')
      const live = props.liveCommissionPresentation
      if (live !== undefined) authorityProbe.liveReceiptIdentities.add(live.identity)
      React.useLayoutEffect(() => {
        authorityProbe.lotMounts += 1
        return () => { authorityProbe.lotUnmounts += 1 }
      }, [])
      React.useLayoutEffect(
        () => props.onPresentationMount?.(),
        [props.onPresentationMount],
      )
      return React.createElement(
        'div',
        {
          'data-testid': 'mock-commission-authority-lot',
          'data-world-suspended': String(props.worldInputSuspended === true),
          'data-live-commission': live?.receipt.projectId ?? 'none',
        },
        React.createElement(
          'h1',
          { 'data-testid': 'lot-studio-heading', tabIndex: -1 },
          'Studio Lot',
        ),
        React.createElement(
          'button',
          {
            'data-testid': 'mock-commission-development',
            // C2a-M4 / F4 (§10): the COMMISSION verb has its own route now. This
            // probe stands for that verb — it is named for it — so it dispatches
            // the verb's intent rather than the generic Development route it used
            // to share.
            onClick: () => props.onNavigate({ kind: 'commissionScreenplay' }),
            type: 'button',
          },
          'Open Development',
        ),
        React.createElement('canvas', {
          'data-testid': 'mock-commission-authority-canvas',
        }),
      )
    },
  }
})

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}

function idleStudio(seed: string): GameState {
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
  const board = scriptProjectsBoard(founded.next)
  if (board.lotAttention.kind !== 'idle' || !board.commission.canStart) {
    throw new Error('setup: expected one founded idle screenplay commission')
  }
  return founded.next
}

function payloadFor(state: GameState): CommissionScriptPayload {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]
  const writer = board.commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) {
    throw new Error('setup: expected one exact screenplay commission payload')
  }
  const width = PROMISE_WIDTHS[1]
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: 'slowSetup',
      midpoint: 'reversal',
      ending: 'bittersweet',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: rangeFrom(PROMISE_CENTERS[1]!, width),
        tonalWeight: rangeFrom(PROMISE_CENTERS[1]!, width),
        kineticEnergy: rangeFrom(PROMISE_CENTERS[1]!, width),
      },
    },
  }
}

function commissionOnce(state: GameState): GameState {
  const result = commissionScriptAction(state, payloadFor(state))
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function activeStudio(seed: string): GameState {
  const state = commissionOnce(idleStudio(seed))
  if (scriptProjectsBoard(state).lotAttention.kind !== 'active-work') {
    throw new Error('setup: expected active screenplay work')
  }
  return state
}

function readyStudio(seed: string): GameState {
  const review = advanceWeek(activeStudio(seed)).next
  const action = scriptProjectsBoard(review).sections.needsReview[0]?.legalActions.find(
    (candidate) => candidate.kind === 'acceptScript',
  )
  if (action === undefined) throw new Error('setup: expected screenplay acceptance')
  const accepted = runScriptProjectAction(review, action)
  if (!accepted.ok) throw new Error(accepted.error)
  if (scriptProjectsBoard(accepted.next).lotAttention.kind !== 'ready-script') {
    throw new Error('setup: expected one Ready screenplay')
  }
  return accepted.next
}

function capacityStudio(seed: string): GameState {
  const state = commissionOnce(commissionOnce(idleStudio(seed)))
  if (scriptProjectsBoard(state).lotAttention.kind !== 'capacity-constraint') {
    throw new Error('setup: expected constrained Development capacity')
  }
  return state
}

function activeSessionBytes(): string {
  const loaded = loadActiveSession()
  if (!loaded.ok) throw new Error('setup: expected one active session')
  return exportSaveJson(loaded.state)
}

async function mountStudio(state: GameState) {
  saveActiveSession(state)
  authorityProbe.trace.length = 0
  authorityProbe.commissionCalls.length = 0
  const mounted = render(<App />)
  const lot = await screen.findByTestId('mock-commission-authority-lot')
  const canvas = screen.getByTestId('mock-commission-authority-canvas')
  await waitFor(() => expect(authorityProbe.trace).toContain('save'))
  await waitFor(() => expect(activeSessionBytes()).toBe(exportSaveJson(state)))
  authorityProbe.trace.length = 0
  authorityProbe.commissionCalls.length = 0
  return { ...mounted, lot, canvas }
}

async function openCommissionWorkspace() {
  const opener = screen.getByTestId('mock-commission-development')
  opener.focus()
  fireEvent.click(opener)
  await screen.findByTestId('lot-commission-workspace')
  if (authorityProbe.formProps === null) {
    throw new Error('setup: retained canonical commission form did not mount')
  }
  return { opener, form: authorityProbe.formProps }
}

beforeEach(() => {
  localStorage.clear()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
  authorityProbe.lotProps = null
  authorityProbe.formProps = null
  authorityProbe.savesProps = null
  authorityProbe.trace.length = 0
  authorityProbe.commissionCalls.length = 0
  authorityProbe.rejectCommission = false
  authorityProbe.lotMounts = 0
  authorityProbe.lotUnmounts = 0
  authorityProbe.liveReceiptIdentities.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  authorityProbe.lotProps = null
  authorityProbe.formProps = null
  authorityProbe.savesProps = null
  authorityProbe.trace.length = 0
  authorityProbe.commissionCalls.length = 0
  authorityProbe.rejectCommission = false
  authorityProbe.lotMounts = 0
  authorityProbe.lotUnmounts = 0
  authorityProbe.liveReceiptIdentities.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('World-first retained screenplay commissioning — App authority', () => {
  it('keeps one Lot and canvas mounted, suspends world input, and cancels byte-neutrally to its opener', async () => {
    const before = idleStudio('retained-commission-cancel')
    const { lot, canvas } = await mountStudio(before)
    const { opener } = await openCommissionWorkspace()

    expect(screen.getByTestId('mock-commission-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-commission-authority-canvas')).toBe(canvas)
    expect(screen.getByTestId('mock-commission-authority-lot')).toHaveAttribute(
      'data-world-suspended',
      'true',
    )
    expect(screen.getByTestId('commission-panel')).toBeInTheDocument()
    expect(screen.getByTestId('script-concept')).toBeInTheDocument()
    expect(screen.getByTestId('script-writer')).toBeInTheDocument()
    expect(screen.getByTestId('commission-submit')).toBeInTheDocument()
    expect(screen.getByTestId('recovery-notice')).toHaveAttribute('inert')
    expect(screen.getByTestId('recovery-notice')).toHaveAttribute('aria-hidden', 'true')
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)

    const suspended = authorityProbe.lotProps!
    act(() => {
      suspended.onAdvance()
      suspended.onNavigate({ kind: 'dashboard' })
      suspended.onOpenTalentProfile?.(before.talent[0]!.id)
    })
    expect(screen.getByTestId('lot-commission-workspace')).toBeInTheDocument()
    expect(screen.queryByTestId('talent-profile')).not.toBeInTheDocument()
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
    expect(authorityProbe.trace).not.toContain('save')

    fireEvent.click(screen.getByTestId('lot-commission-workspace-close'))
    await waitFor(() => {
      expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument()
      expect(opener).toHaveFocus()
    })
    expect(screen.getByTestId('mock-commission-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-commission-authority-canvas')).toBe(canvas)
    expect(screen.getByTestId('mock-commission-authority-lot')).toHaveAttribute(
      'data-world-suspended',
      'false',
    )
    expect(screen.getByTestId('recovery-notice')).not.toHaveAttribute('inert')
    expect(screen.getByTestId('recovery-notice')).not.toHaveAttribute('aria-hidden')
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
    expect(authorityProbe.commissionCalls).toHaveLength(0)
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)
  })

  it('rejects an old Lot navigation callback after a newer exact presentation mounts', async () => {
    const before = idleStudio('retained-commission-stale-lot-origin')
    const { lot: firstLot } = await mountStudio(before)
    const staleLotOwner = authorityProbe.lotProps!

    act(() => staleLotOwner.onNavigate({ kind: 'dashboard' }))
    expect(await screen.findByTestId('dashboard-heading')).toBeInTheDocument()
    expect(firstLot.isConnected).toBe(false)
    fireEvent.click(screen.getByTestId('back-to-studio-lot'))
    const replacementLot = await screen.findByTestId('mock-commission-authority-lot')
    expect(replacementLot).not.toBe(firstLot)
    const currentLotOwner = authorityProbe.lotProps!
    expect(currentLotOwner).not.toBe(staleLotOwner)

    act(() => staleLotOwner.onNavigate({ kind: 'assembly' }))
    expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument()
    expect(screen.queryByTestId('writers-room')).not.toBeInTheDocument()
    expect(screen.getByTestId('mock-commission-authority-lot')).toBe(replacementLot)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
    expect(authorityProbe.commissionCalls).toHaveLength(0)

    act(() => currentLotOwner.onNavigate({ kind: 'assembly' }))
    expect(await screen.findByTestId('lot-commission-workspace')).toBeInTheDocument()
  })

  it('rejects a navigation callback rendered against an older state in the same mounted Lot', async () => {
    const before = idleStudio('retained-commission-stale-state-origin')
    const { lot, canvas } = await mountStudio(before)
    const staleStateOwner = authorityProbe.lotProps!

    act(() => staleStateOwner.onAdvance())
    await waitFor(() => expect(authorityProbe.lotProps?.state.market.tick).toBe(1))
    const currentStateOwner = authorityProbe.lotProps!
    expect(currentStateOwner.state).not.toBe(staleStateOwner.state)
    expect(screen.getByTestId('mock-commission-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-commission-authority-canvas')).toBe(canvas)

    act(() => staleStateOwner.onNavigate({ kind: 'assembly' }))
    expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument()
    expect(screen.getByTestId('mock-commission-authority-lot')).toBe(lot)

    act(() => currentStateOwner.onNavigate({ kind: 'assembly' }))
    expect(await screen.findByTestId('lot-commission-workspace')).toBeInTheDocument()
  })

  it('dispatches once, rejects the same stale activation, autosaves before close, and publishes one consumable receipt', async () => {
    const before = idleStudio('retained-commission-accepted')
    const { lot, canvas } = await mountStudio(before)
    const renderedBefore = authorityProbe.lotProps!.state
    const payload = payloadFor(renderedBefore)
    const direct = commissionScriptAction(renderedBefore, payload)
    if (!direct.ok) throw new Error(direct.error)
    const { form } = await openCommissionWorkspace()
    const deferred: Array<() => void> = []
    vi.spyOn(window, 'queueMicrotask').mockImplementation((callback) => {
      deferred.push(callback)
    })
    authorityProbe.trace.length = 0
    authorityProbe.commissionCalls.length = 0

    let accepted: ActionOutcome | undefined
    let duplicate: ActionOutcome | undefined
    act(() => {
      accepted = form.onSubmit(payload)
      duplicate = form.onSubmit(payload)
    })

    expect(accepted?.ok).toBe(true)
    expect(duplicate).toEqual({
      ok: false,
      error: 'Screenplay commission is no longer owned by the live Studio Lot.',
    })
    expect(authorityProbe.commissionCalls).toEqual([{ state: renderedBefore, payload }])
    expect(screen.getByTestId('lot-commission-workspace-recording')).toHaveTextContent(
      'SCREENPLAY ACCEPTED',
    )
    expect(screen.getByTestId('mock-commission-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-commission-authority-canvas')).toBe(canvas)
    expect(screen.getByTestId('mock-commission-authority-lot')).toHaveAttribute(
      'data-world-suspended',
      'true',
    )
    expect(exportSaveJson(authorityProbe.lotProps!.state)).toBe(exportSaveJson(direct.next))
    expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))
    expect(authorityProbe.trace.indexOf('dispatch')).toBeGreaterThanOrEqual(0)
    expect(authorityProbe.trace.indexOf('save')).toBeGreaterThan(
      authorityProbe.trace.indexOf('dispatch'),
    )
    expect(deferred.length).toBeGreaterThanOrEqual(1)
    expect(authorityProbe.liveReceiptIdentities.size).toBe(0)

    act(() => {
      while (deferred.length > 0) deferred.shift()!()
    })
    await waitFor(() => {
      expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument()
      expect(authorityProbe.lotProps?.liveCommissionPresentation).toBeDefined()
    })
    const receiptOwner = authorityProbe.lotProps!
    const live = receiptOwner.liveCommissionPresentation
    if (live === undefined) throw new Error('expected one live screenplay commission receipt')
    expect(live.acceptedState).toBe(authorityProbe.lotProps!.state)
    expect(exportSaveJson(live.acceptedState)).toBe(exportSaveJson(direct.next))
    expect(live.receipt).toMatchObject({
      projectId: 'script-0000',
      conceptId: payload.conceptId,
      writerId: payload.writerId,
      commissionedWeek: renderedBefore.market.tick,
      dueWeek: renderedBefore.market.tick + 1,
    })
    expect(authorityProbe.liveReceiptIdentities).toEqual(new Set([live.identity]))
    expect(screen.getByTestId('mock-commission-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-commission-authority-canvas')).toBe(canvas)
    expect(screen.getByTestId('mock-commission-authority-lot')).toHaveAttribute(
      'data-world-suspended',
      'false',
    )

    act(() => receiptOwner.onNavigate({ kind: 'assembly' }))
    expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument()
    act(() => receiptOwner.onLiveCommissionConsumed?.(live.identity))
    await waitFor(() => {
      expect(authorityProbe.lotProps?.liveCommissionPresentation).toBeUndefined()
    })
    act(() => receiptOwner.onLiveCommissionConsumed?.(live.identity))
    expect(authorityProbe.liveReceiptIdentities.size).toBe(1)
    expect(authorityProbe.commissionCalls).toHaveLength(1)
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)
  })

  it('keeps an accepted successor when strict receipt presentation fails and guesses no witness', async () => {
    const before = idleStudio('retained-commission-neutral-receipt')
    const selectedConcept = scriptProjectsBoard(before).commission.concepts[0]
    const duplicateTitleConcept = before.concepts.find(
      (concept) => concept.id !== selectedConcept?.id,
    )
    if (selectedConcept === undefined || duplicateTitleConcept === undefined) {
      throw new Error('setup: expected two concepts for receipt ambiguity')
    }
    duplicateTitleConcept.title = selectedConcept.title
    const { lot, canvas } = await mountStudio(before)
    const renderedBefore = authorityProbe.lotProps!.state
    const payload = payloadFor(renderedBefore)
    const direct = commissionScriptAction(renderedBefore, payload)
    if (!direct.ok) throw new Error(direct.error)
    const { form } = await openCommissionWorkspace()
    const deferred: Array<() => void> = []
    vi.spyOn(window, 'queueMicrotask').mockImplementation((callback) => {
      deferred.push(callback)
    })
    authorityProbe.trace.length = 0
    authorityProbe.commissionCalls.length = 0

    let accepted: ActionOutcome | undefined
    act(() => { accepted = form.onSubmit(payload) })
    expect(accepted?.ok).toBe(true)
    const neutral = screen.getByTestId('lot-commission-workspace-recording')
    expect(neutral).toHaveTextContent('STUDIO UPDATED')
    expect(neutral).toHaveTextContent('could not be verified for presentation')
    expect(neutral).not.toHaveTextContent('SCREENPLAY ACCEPTED')
    expect(neutral).not.toHaveTextContent('SCREENPLAY QUEUED')
    act(() => deferred.splice(0).forEach((callback) => callback()))
    await waitFor(() => {
      expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument()
      expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))
    })
    expect(authorityProbe.commissionCalls).toEqual([{ state: renderedBefore, payload }])
    expect(authorityProbe.lotProps?.liveCommissionPresentation).toBeUndefined()
    expect(authorityProbe.liveReceiptIdentities).toEqual(new Set())
    expect(screen.getByTestId('mock-commission-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-commission-authority-canvas')).toBe(canvas)
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)
  })

  it('retains an exact queued successor with truthful copy, no commit cue, and no invented project', async () => {
    const before = capacityStudio('retained-commission-queued-success')
    const payload = payloadFor(before)
    const direct = commissionScriptAction(before, payload)
    if (!direct.ok) throw new Error(direct.error)
    expect(direct.next.productionQueue).toHaveLength(1)
    expect(direct.next.scriptDevelopment.projects).toEqual(before.scriptDevelopment.projects)
    const { lot } = await mountStudio(before)
    const { form } = await openCommissionWorkspace()
    const commitCue = vi.spyOn(punctuation, 'punctuateCommit')
    commitCue.mockClear()
    const deferred: Array<() => void> = []
    vi.spyOn(window, 'queueMicrotask').mockImplementation((callback) => {
      deferred.push(callback)
    })

    let accepted: ActionOutcome | undefined
    let duplicate: ActionOutcome | undefined
    act(() => {
      accepted = form.onSubmit(payload)
      duplicate = form.onSubmit(payload)
    })

    expect(accepted?.ok).toBe(true)
    expect(duplicate).toEqual({
      ok: false,
      error: 'Screenplay commission is no longer owned by the live Studio Lot.',
    })
    const recording = screen.getByTestId('lot-commission-workspace-recording')
    expect(recording).toHaveTextContent('SCREENPLAY QUEUED')
    expect(recording).toHaveTextContent('WHAT HAPPENED')
    expect(recording).toHaveTextContent('entered the production queue')
    expect(recording).toHaveTextContent('WHY IT MATTERS')
    expect(recording).toHaveTextContent('No writer, room, cash, or screenplay project identity')
    expect(recording).toHaveTextContent('WHAT NEXT')
    expect(recording).not.toHaveTextContent('SCREENPLAY ACCEPTED')
    expect(recording).not.toHaveTextContent('commission is secure')
    expect(commitCue).not.toHaveBeenCalledWith('commission', before.market.tick)
    expect(screen.getByTestId('mock-commission-authority-lot')).toBe(lot)
    expect(authorityProbe.commissionCalls).toHaveLength(1)
    expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))

    act(() => deferred.splice(0).forEach((callback) => callback()))
    await waitFor(() => {
      expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument()
    })
    expect(authorityProbe.lotProps?.liveCommissionPresentation).toBeUndefined()
    expect(authorityProbe.lotProps?.state.productionQueue).toHaveLength(1)
    expect(authorityProbe.lotProps?.state.scriptDevelopment.projects).toEqual(
      before.scriptDevelopment.projects,
    )
  })

  it('keeps an Engine rejection and draft in place, suppresses its duplicate, then permits a changed retry', async () => {
    const before = idleStudio('retained-commission-retry')
    const { lot, canvas } = await mountStudio(before)
    await openCommissionWorkspace()
    fireEvent.change(screen.getByTestId('script-shape-ending'), {
      target: { value: 'tragic' },
    })
    authorityProbe.rejectCommission = true

    fireEvent.click(screen.getByTestId('commission-submit'))

    expect(screen.getByTestId('lot-commission-workspace-error')).toHaveTextContent(
      'test-only screenplay commission rejection',
    )
    expect(screen.getByTestId('lot-commission-workspace')).toBeInTheDocument()
    expect(screen.getByTestId('script-shape-ending')).toHaveValue('tragic')
    expect(screen.getByTestId('mock-commission-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-commission-authority-canvas')).toBe(canvas)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
    expect(authorityProbe.commissionCalls).toHaveLength(1)

    authorityProbe.rejectCommission = false
    fireEvent.click(screen.getByTestId('commission-submit'))
    expect(screen.getByTestId('lot-commission-workspace-error')).toHaveTextContent(
      'test-only screenplay commission rejection',
    )
    expect(authorityProbe.commissionCalls).toHaveLength(1)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))

    fireEvent.click(screen.getByTestId('script-segment-family'))
    fireEvent.click(screen.getByTestId('commission-submit'))
    await waitFor(() => expect(activeSessionBytes()).not.toBe(exportSaveJson(before)))
    expect(authorityProbe.commissionCalls).toHaveLength(2)
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)
  })

  // ── F4 RE-BASE (charter §10, owned by C2a-M4) ───────────────────────────
  //
  // RETIRED: the `active-work` and `ready-script` arms of this fallback, which
  // asserted that a BUSY screenplay board sent the player out of the world and
  // into the full Writers Room. That is the seam §10 names — the interception
  // demanded an idle board — and it is exactly the "the world goes quiet" defect
  // the retained workspace was built to close.
  //
  // NAMED SUCCESSOR, immediately below: those two states KEEP the player in the
  // world and open the retained workspace, because the engine will commission
  // into any free Development & Casting room.
  //
  // A3 successor: capacity is no longer a fallback either. The authoritative
  // front door admits an otherwise-legal commission to the shared queue, so the
  // retained surface stays in the world for this state as well.
  it.each([['constrained capacity', capacityStudio, 'capacity-constraint']] as const)(
    'keeps %s IN THE WORLD and opens the retained queueable commission',
    async (_label, fixture, attention) => {
      const before = fixture(`retained-commission-fallback-${attention}`)
      const board = scriptProjectsBoard(before)
      expect(board.lotAttention.kind).toBe(attention)
      expect(board.capacity.available).toBe(0)
      expect(board.commission.canSubmitMarketIntent).toBe(true)
      expect(board.commission.willQueueIntent).toBe(true)
      const { lot } = await mountStudio(before)

      fireEvent.click(screen.getByTestId('mock-commission-development'))

      expect(await screen.findByTestId('lot-commission-workspace')).toBeInTheDocument()
      expect(screen.queryByTestId('writers-room')).not.toBeInTheDocument()
      expect(screen.getByTestId('commission-submit')).toHaveTextContent(
        'Queue screenplay commission',
      )
      expect(lot.isConnected).toBe(true)
      expect(activeSessionBytes()).toBe(exportSaveJson(before))
      expect(authorityProbe.commissionCalls).toHaveLength(0)
      expect(authorityProbe.lotMounts).toBe(1)
      expect(authorityProbe.lotUnmounts).toBe(0)
    },
  )

  it.each([
    ['active work', activeStudio, 'active-work'],
    ['a Ready screenplay', readyStudio, 'ready-script'],
  ] as const)(
    'F4: keeps %s IN THE WORLD and opens the retained workspace on a free room',
    async (_label, fixture, attention) => {
      const before = fixture(`retained-commission-f4-${attention}`)
      expect(scriptProjectsBoard(before).lotAttention.kind).toBe(attention)
      // The precondition that makes this legal, stated: a room is free.
      expect(scriptProjectsBoard(before).capacity.available).toBeGreaterThan(0)
      const { lot } = await mountStudio(before)

      fireEvent.click(screen.getByTestId('mock-commission-development'))

      expect(await screen.findByTestId('lot-commission-workspace')).toBeInTheDocument()
      expect(screen.queryByTestId('writers-room')).not.toBeInTheDocument()
      // The world never unmounted — that is the whole point of the retained surface.
      expect(lot.isConnected).toBe(true)
      expect(activeSessionBytes()).toBe(exportSaveJson(before))
      expect(authorityProbe.commissionCalls).toHaveLength(0)
      expect(authorityProbe.lotMounts).toBe(1)
      expect(authorityProbe.lotUnmounts).toBe(0)
    },
  )

  it('preserves the Operation Hollywood-off full Writers Room fallback', async () => {
    const before = idleStudio('retained-commission-hollywood-off')
    setOperationHollywoodOverride(false)
    const { lot } = await mountStudio(before)

    fireEvent.click(screen.getByTestId('mock-commission-development'))

    expect(await screen.findByTestId('writers-room')).toBeInTheDocument()
    expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument()
    expect(lot.isConnected).toBe(false)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
    expect(authorityProbe.commissionCalls).toHaveLength(0)
  })

  it('contains a closed workspace callback after a newer commission owner opens', async () => {
    const before = idleStudio('retained-commission-close-reopen')
    const payload = payloadFor(before)
    await mountStudio(before)
    const first = await openCommissionWorkspace()
    fireEvent.click(screen.getByTestId('lot-commission-workspace-close'))
    await waitFor(() => expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument())
    const second = await openCommissionWorkspace()
    expect(second.form).not.toBe(first.form)

    let stale: ActionOutcome | undefined
    act(() => { stale = first.form.onSubmit(payload) })
    expect(stale).toEqual({
      ok: false,
      error: 'Screenplay commission is no longer owned by the live Studio Lot.',
    })
    expect(screen.getByTestId('lot-commission-workspace')).toBeInTheDocument()
    expect(authorityProbe.formProps).toBe(second.form)
    expect(authorityProbe.commissionCalls).toHaveLength(0)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
  })

  it('clears a retained owner before an accepted whole-studio replacement can publish', async () => {
    const before = idleStudio('retained-commission-replacement-before')
    const replacement = idleStudio('retained-commission-replacement-after')
    const payload = payloadFor(before)
    await mountStudio(before)
    const lotOwner = authorityProbe.lotProps!
    act(() => lotOwner.onNavigate({ kind: 'saves' }))
    expect(await screen.findByTestId('mock-commission-authority-saves')).toBeInTheDocument()
    const staleAcceptedLoad = authorityProbe.savesProps?.onLoad
    if (staleAcceptedLoad === undefined) throw new Error('setup: accepted load callback is absent')
    fireEvent.click(screen.getByTestId('mock-saves-back'))
    await screen.findByTestId('mock-commission-authority-lot')
    const { form } = await openCommissionWorkspace()

    act(() => staleAcceptedLoad(replacement, { converted: false }))
    await waitFor(() => {
      expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument()
      expect(activeSessionBytes()).toBe(exportSaveJson(replacement))
    })
    expect(authorityProbe.lotProps?.state.seed).toBe(replacement.seed)

    let stale: ActionOutcome | undefined
    act(() => { stale = form.onSubmit(payload) })
    expect(stale).toEqual({
      ok: false,
      error: 'Screenplay commission is no longer owned by the live Studio Lot.',
    })
    expect(authorityProbe.commissionCalls).toHaveLength(0)
    expect(activeSessionBytes()).toBe(exportSaveJson(replacement))
  })

  it('contains retained callbacks after App teardown', async () => {
    const before = idleStudio('retained-commission-app-teardown')
    const payload = payloadFor(before)
    const mounted = await mountStudio(before)
    const { form } = await openCommissionWorkspace()

    act(() => mounted.unmount())
    let stale: ActionOutcome | undefined
    act(() => { stale = form.onSubmit(payload) })
    expect(stale).toEqual({
      ok: false,
      error: 'Screenplay commission is no longer owned by the live Studio Lot.',
    })
    expect(authorityProbe.commissionCalls).toHaveLength(0)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
  })

  it('contains a retained form callback after explicit replacement by the full Writers Room', async () => {
    const before = idleStudio('retained-commission-stale-details')
    const payload = payloadFor(before)
    const { lot } = await mountStudio(before)
    const { form } = await openCommissionWorkspace()

    fireEvent.click(screen.getByTestId('lot-commission-workspace-details'))
    expect(await screen.findByTestId('writers-room')).toBeInTheDocument()
    expect(lot.isConnected).toBe(false)

    let stale: ActionOutcome | undefined
    act(() => { stale = form.onSubmit(payload) })
    expect(stale).toEqual({
      ok: false,
      error: 'Screenplay commission is no longer owned by the live Studio Lot.',
    })
    expect(authorityProbe.commissionCalls).toHaveLength(0)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
    expect(screen.queryByTestId('lot-commission-workspace')).not.toBeInTheDocument()
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(1)
  })
})
