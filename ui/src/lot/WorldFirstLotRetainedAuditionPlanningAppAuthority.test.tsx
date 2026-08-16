import type { ComponentProps } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App.tsx'
import {
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
} from '../engine/adapter.ts'
import type {
  ActionOutcome,
  CreativeRole,
  GameState,
  StartCastingSessionPayload,
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
import type { LotAuditionPlanningOrigin } from './StudioLotScreen.tsx'
import type { LotAuditionWorkspaceProps } from './LotAuditionWorkspace.tsx'
import type { CastingSlateDraft } from '../screens/CastingSlatePlanner.tsx'

type LotProps = ComponentProps<typeof StudioLotScreenType>
type SavesProbeProps = {
  state: GameState
  onLoad: (next: GameState, details: { converted: boolean }) => void
  onNewGame: () => void
  onBack: () => void
}

const authorityProbe = vi.hoisted(() => ({
  lotProps: null as LotProps | null,
  workspaceProps: null as LotAuditionWorkspaceProps | null,
  savesProps: null as SavesProbeProps | null,
  trace: [] as string[],
  actionCalls: [] as Array<{ state: GameState; payload: StartCastingSessionPayload }>,
  rejectAction: false,
  rejectReceipt: false,
  lotMounts: 0,
  lotUnmounts: 0,
  liveReceiptIdentities: new Set<object>(),
}))

vi.mock('../engine/adapter.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/adapter.ts')>()
  return {
    ...actual,
    startCastingSessionAction(state: GameState, payload: StartCastingSessionPayload) {
      authorityProbe.trace.push('dispatch')
      authorityProbe.actionCalls.push({ state, payload })
      if (authorityProbe.rejectAction) {
        return { ok: false as const, error: 'test-only camera-test rejection' }
      }
      return actual.startCastingSessionAction(state, payload)
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

vi.mock('./snapshot/auditionPlanning.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./snapshot/auditionPlanning.ts')>()
  return {
    ...actual,
    acceptedLotAuditionPlanningReceipt(
      before: GameState,
      after: GameState,
      payload: StartCastingSessionPayload,
    ) {
      return authorityProbe.rejectReceipt
        ? null
        : actual.acceptedLotAuditionPlanningReceipt(before, after, payload)
    },
  }
})

vi.mock('./LotAuditionWorkspace.tsx', async () => {
  const React = await import('react')
  return {
    LotAuditionWorkspace: (props: LotAuditionWorkspaceProps) => {
      authorityProbe.workspaceProps = props
      return React.createElement(
        'div',
        {
          role: 'dialog',
          'data-testid': 'mock-audition-workspace',
          'data-phase': props.phase,
        },
        React.createElement('span', null, props.project.title),
        props.phase === 'editing'
          ? React.createElement(
              React.Fragment,
              null,
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: props.onCancel,
                  'data-testid': 'mock-audition-cancel',
                },
                'Return to live Lot',
              ),
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: props.onOpenDetails,
                  'data-testid': 'mock-audition-details',
                },
                'Open full Casting Room details',
              ),
            )
          : React.createElement(
              'div',
              { 'data-testid': 'lot-audition-workspace-recording' },
              'Recording camera tests',
            ),
      )
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
        { 'data-testid': 'mock-audition-authority-saves' },
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
      const openerRef = React.useRef<HTMLButtonElement | null>(null)
      const live = props.liveAuditionPresentation
      if (live !== undefined) authorityProbe.liveReceiptIdentities.add(live.identity)
      React.useLayoutEffect(() => {
        authorityProbe.lotMounts += 1
        return () => { authorityProbe.lotUnmounts += 1 }
      }, [])
      React.useLayoutEffect(
        () => props.onPresentationMount?.(),
        [props.onPresentationMount],
      )
      const openCasting = () => {
        const opener = openerRef.current
        if (opener === null) throw new Error('mock: Casting opener is absent')
        const origin: LotAuditionPlanningOrigin = {
          opener,
          cue: {
            buildingId: 'casting',
            action: 'browse-talent',
            attention: 'positive',
            reason: 'auditions optional',
          },
        }
        const retained = props.onOpenAuditionPlanning?.(props.state, origin) ?? false
        if (!retained) props.onNavigate({ kind: 'castingRoom' })
      }
      return React.createElement(
        'div',
        {
          'data-testid': 'mock-audition-authority-lot',
          'data-world-suspended': String(props.worldInputSuspended === true),
          'data-live-audition': live?.receipt.sessionId ?? 'none',
        },
        React.createElement(
          'h1',
          { 'data-testid': 'lot-studio-heading', tabIndex: -1 },
          'Studio Lot',
        ),
        React.createElement(
          'button',
          {
            ref: openerRef,
            type: 'button',
            'data-testid': 'lot-nav-casting',
            'data-attention': 'positive',
            onClick: openCasting,
          },
          'Casting',
          React.createElement(
            'span',
            { 'data-testid': 'lot-nav-casting-state' },
            'Ready screenplay — auditions optional',
          ),
        ),
        React.createElement('canvas', {
          'data-testid': 'mock-audition-authority-canvas',
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

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
    if (selected.length !== FOUNDING_COUNTS[role]) throw new Error(`setup: missing ${role}`)
    for (const card of selected) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

function addReadyScreenplay(origin: GameState): GameState {
  let state = origin
  const commission = scriptProjectsBoard(state).commission
  const concept = commission.concepts[0]
  const writer = commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) throw new Error('setup: no commission')
  const commissioned = commissionScriptAction(state, {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: 'mysteryHook',
      midpoint: 'revelation',
      ending: 'bittersweet',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.4, 0.4],
        tonalWeight: [-0.4, 0.4],
        kineticEnergy: [-0.4, 0.4],
      },
    },
  })
  if (!commissioned.ok) throw new Error(commissioned.error)
  state = advanceWeek(commissioned.next).next
  const accept = scriptProjectsBoard(state).sections.needsReview[0]?.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (accept === undefined) throw new Error('setup: no screenplay acceptance')
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  return accepted.next
}

function readyStudio(seed: string): GameState {
  return addReadyScreenplay(managedStudio(seed))
}

function twoReadyScreenplays(seed: string): GameState {
  return addReadyScreenplay(addReadyScreenplay(managedStudio(seed)))
}

function legalPayload(state: GameState): StartCastingSessionPayload {
  const project = castingSessionsBoard(state).sections.readyToPlan[0]
  const ids = project?.candidates.lead.map((candidate) => candidate.id) ?? []
  if (project === undefined || ids.length < 3) throw new Error('setup: no legal slate')
  return {
    projectId: project.projectId,
    slate: {
      lead: [ids[0]!, ids[1]!],
      antagonist: [ids[0]!, ids[1]!],
      support: [ids[0]!, ids[2]!],
    },
  }
}

function alternateLegalPayload(state: GameState): StartCastingSessionPayload {
  const payload = legalPayload(state)
  return {
    projectId: payload.projectId,
    slate: {
      lead: [...payload.slate.lead],
      antagonist: [...payload.slate.antagonist],
      support: [payload.slate.support[1], payload.slate.antagonist[1]],
    },
  }
}

function copyDraft(draft: CastingSlateDraft): CastingSlateDraft {
  return {
    lead: [...draft.lead],
    antagonist: [...draft.antagonist],
    support: [...draft.support],
  }
}

function currentEditingWorkspace(): LotAuditionWorkspaceProps {
  const workspace = authorityProbe.workspaceProps
  if (workspace === null || workspace.phase !== 'editing') {
    throw new Error('setup: expected current editing audition owner')
  }
  return workspace
}

function publishDraft(
  workspace: LotAuditionWorkspaceProps,
  draft: CastingSlateDraft,
): LotAuditionWorkspaceProps {
  act(() => workspace.onSlateChange?.(copyDraft(draft)))
  return currentEditingWorkspace()
}

function publishLegalDraftThroughCandidateToggles(
  workspace: LotAuditionWorkspaceProps,
  slate: StartCastingSessionPayload['slate'],
): LotAuditionWorkspaceProps {
  let owner = workspace
  let draft: CastingSlateDraft = { lead: [], antagonist: [], support: [] }
  for (const slot of ['lead', 'antagonist', 'support'] as const) {
    for (const talentId of slate[slot]) {
      draft = { ...draft, [slot]: [...draft[slot], talentId] }
      owner = publishDraft(owner, draft)
    }
  }
  return owner
}

function publishAlternateSupportThroughCandidateToggles(
  workspace: LotAuditionWorkspaceProps,
  original: StartCastingSessionPayload['slate'],
  alternate: StartCastingSessionPayload['slate'],
): LotAuditionWorkspaceProps {
  const removedOriginal: CastingSlateDraft = {
    lead: [...original.lead],
    antagonist: [...original.antagonist],
    support: [original.support[1]],
  }
  const afterRemoval = publishDraft(workspace, removedOriginal)
  return publishDraft(afterRemoval, alternate)
}

function activeSessionBytes(): string {
  const loaded = loadActiveSession()
  if (!loaded.ok) throw new Error('setup: no active session')
  return exportSaveJson(loaded.state)
}

async function mountStudio(state: GameState) {
  saveActiveSession(state)
  authorityProbe.trace.length = 0
  authorityProbe.actionCalls.length = 0
  const mounted = render(<App />)
  const lot = await screen.findByTestId('mock-audition-authority-lot')
  const canvas = screen.getByTestId('mock-audition-authority-canvas')
  await waitFor(() => expect(authorityProbe.trace).toContain('save'))
  await waitFor(() => expect(activeSessionBytes()).toBe(exportSaveJson(state)))
  authorityProbe.trace.length = 0
  authorityProbe.actionCalls.length = 0
  return { ...mounted, lot, canvas }
}

async function openWorkspace() {
  const opener = screen.getByTestId('lot-nav-casting') as HTMLButtonElement
  opener.focus()
  fireEvent.click(opener)
  await screen.findByTestId('mock-audition-workspace')
  const workspace = authorityProbe.workspaceProps
  if (workspace === null || workspace.phase !== 'editing') {
    throw new Error('setup: retained audition workspace did not open')
  }
  return { opener, workspace }
}

beforeEach(() => {
  localStorage.clear()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
  authorityProbe.lotProps = null
  authorityProbe.workspaceProps = null
  authorityProbe.savesProps = null
  authorityProbe.trace.length = 0
  authorityProbe.actionCalls.length = 0
  authorityProbe.rejectAction = false
  authorityProbe.rejectReceipt = false
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
  authorityProbe.workspaceProps = null
  authorityProbe.savesProps = null
  authorityProbe.trace.length = 0
  authorityProbe.actionCalls.length = 0
  authorityProbe.rejectAction = false
  authorityProbe.rejectReceipt = false
  authorityProbe.lotMounts = 0
  authorityProbe.lotUnmounts = 0
  authorityProbe.liveReceiptIdentities.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('World-first retained audition planning — App authority', () => {
  it('keeps one Lot/canvas mounted and cancels byte-neutrally to the exact Casting opener', async () => {
    const before = readyStudio('retained-audition-cancel')
    const { lot, canvas } = await mountStudio(before)
    const { opener } = await openWorkspace()

    expect(screen.getByTestId('mock-audition-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-audition-authority-canvas')).toBe(canvas)
    expect(lot).toHaveAttribute('data-world-suspended', 'true')
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
    expect(screen.getByTestId('mock-audition-workspace')).toBeInTheDocument()
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
    expect(authorityProbe.actionCalls).toHaveLength(0)

    fireEvent.click(screen.getByTestId('mock-audition-cancel'))
    await waitFor(() => {
      expect(screen.queryByTestId('mock-audition-workspace')).not.toBeInTheDocument()
      expect(opener).toHaveFocus()
    })
    expect(screen.getByTestId('mock-audition-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-audition-authority-canvas')).toBe(canvas)
    expect(lot).toHaveAttribute('data-world-suspended', 'false')
    expect(screen.getByTestId('recovery-notice')).not.toHaveAttribute('inert')
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)
  })

  it('dispatches once, autosaves before close, and publishes one exact consumable receipt', async () => {
    const before = readyStudio('retained-audition-accepted')
    const payload = legalPayload(before)
    const direct = startCastingSessionAction(before, payload)
    if (!direct.ok) throw new Error(direct.error)
    const { lot, canvas } = await mountStudio(before)
    const { workspace: openedWorkspace } = await openWorkspace()
    const workspace = publishLegalDraftThroughCandidateToggles(
      openedWorkspace,
      payload.slate,
    )
    const deferred: Array<() => void> = []
    vi.spyOn(window, 'queueMicrotask').mockImplementation((callback) => {
      deferred.push(callback)
    })
    authorityProbe.trace.length = 0
    authorityProbe.actionCalls.length = 0

    let accepted: ActionOutcome | undefined
    let duplicate: ActionOutcome | undefined
    act(() => {
      accepted = workspace.onSubmit(payload.slate)
      duplicate = workspace.onSubmit(payload.slate)
    })

    expect(accepted?.ok).toBe(true)
    expect(duplicate).toEqual({
      ok: false,
      error: 'Audition planning is no longer owned by the live Studio Lot.',
    })
    expect(authorityProbe.actionCalls).toHaveLength(1)
    expect(authorityProbe.actionCalls[0]?.payload).toEqual(payload)
    expect(exportSaveJson(authorityProbe.actionCalls[0]!.state)).toBe(exportSaveJson(before))
    expect(screen.getByTestId('lot-audition-workspace-recording')).toBeInTheDocument()
    expect(screen.getByTestId('mock-audition-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-audition-authority-canvas')).toBe(canvas)
    expect(lot).toHaveAttribute('data-world-suspended', 'true')
    expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))
    expect(authorityProbe.trace.indexOf('save')).toBeGreaterThan(
      authorityProbe.trace.indexOf('dispatch'),
    )
    expect(authorityProbe.liveReceiptIdentities.size).toBe(0)

    act(() => {
      while (deferred.length > 0) deferred.shift()!()
    })
    await waitFor(() => {
      expect(screen.queryByTestId('mock-audition-workspace')).not.toBeInTheDocument()
      expect(authorityProbe.lotProps?.liveAuditionPresentation).toBeDefined()
    })
    const owner = authorityProbe.lotProps!
    const live = owner.liveAuditionPresentation
    if (live === undefined) throw new Error('expected one live audition receipt')
    expect(live.acceptedState).toBe(owner.state)
    expect(live.receipt).toMatchObject({
      sessionId: 'casting-0000',
      projectId: payload.projectId,
      startedWeek: before.market.tick,
      dueWeek: before.market.tick + 1,
      facilityId: 'facility-development-casting',
      slot: 0,
    })
    expect(live.receipt.reads).toHaveLength(6)
    expect(authorityProbe.liveReceiptIdentities).toEqual(new Set([live.identity]))
    expect(screen.getByTestId('mock-audition-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-audition-authority-canvas')).toBe(canvas)
    expect(lot).toHaveAttribute('data-world-suspended', 'false')

    act(() => owner.onLiveAuditionConsumed?.(live.identity))
    await waitFor(() => expect(authorityProbe.lotProps?.liveAuditionPresentation).toBeUndefined())
    act(() => owner.onLiveAuditionConsumed?.(live.identity))
    expect(authorityProbe.actionCalls).toHaveLength(1)
    expect(authorityProbe.lotMounts).toBe(1)
    expect(authorityProbe.lotUnmounts).toBe(0)
  })

  it('keeps an exact rejection across hidden and unchanged tails, then retries only the genuinely revised slate', async () => {
    const before = readyStudio('retained-audition-rejection-cache')
    const payload = legalPayload(before)
    const alternate = alternateLegalPayload(before)
    await mountStudio(before)
    const { workspace: openedWorkspace } = await openWorkspace()
    const workspace = publishLegalDraftThroughCandidateToggles(
      openedWorkspace,
      payload.slate,
    )
    authorityProbe.rejectAction = true

    let rejected: ActionOutcome | undefined
    let repeated: ActionOutcome | undefined
    act(() => {
      rejected = workspace.onSubmit(payload.slate)
      repeated = workspace.onSubmit(payload.slate)
    })
    expect(rejected).toEqual({ ok: false, error: 'test-only camera-test rejection' })
    expect(repeated).toEqual(rejected)
    expect(authorityProbe.actionCalls).toHaveLength(1)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))

    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    let hiddenTail: ActionOutcome | undefined
    act(() => { hiddenTail = workspace.onSubmit(payload.slate) })
    expect(hiddenTail).toEqual(rejected)
    expect(authorityProbe.actionCalls).toHaveLength(1)

    const ownerBeforeUnchangedTail = authorityProbe.workspaceProps
    act(() => workspace.onSlateChange?.(copyDraft(payload.slate)))
    expect(authorityProbe.workspaceProps).toBe(ownerBeforeUnchangedTail)
    let unchangedTail: ActionOutcome | undefined
    act(() => { unchangedTail = workspace.onSubmit(payload.slate) })
    expect(unchangedTail).toEqual(rejected)
    expect(authorityProbe.actionCalls).toHaveLength(1)

    const removedOriginal: CastingSlateDraft = {
      lead: [...payload.slate.lead],
      antagonist: [...payload.slate.antagonist],
      support: [payload.slate.support[1]],
    }
    const revisedAfterRemoval = publishDraft(workspace, removedOriginal)
    expect(revisedAfterRemoval).not.toBe(workspace)

    const ownerBeforeStaleTail = authorityProbe.workspaceProps
    act(() => workspace.onSlateChange?.(copyDraft(alternate.slate)))
    expect(authorityProbe.workspaceProps).toBe(ownerBeforeStaleTail)

    const revised = publishDraft(revisedAfterRemoval, alternate.slate)
    authorityProbe.rejectAction = false
    let accepted: ActionOutcome | undefined
    act(() => { accepted = revised.onSubmit(alternate.slate) })
    expect(accepted?.ok).toBe(true)
    expect(authorityProbe.actionCalls).toHaveLength(2)
    expect(authorityProbe.actionCalls[1]?.payload).toEqual(alternate)
    await waitFor(() => expect(activeSessionBytes()).not.toBe(exportSaveJson(before)))
  })

  it('submits only the exact draft currently owned by App', async () => {
    const before = readyStudio('retained-audition-exact-current-draft')
    const payload = legalPayload(before)
    const alternate = alternateLegalPayload(before)
    await mountStudio(before)
    const { workspace: openedWorkspace } = await openWorkspace()
    const originalOwner = publishLegalDraftThroughCandidateToggles(
      openedWorkspace,
      payload.slate,
    )
    const revisedOwner = publishAlternateSupportThroughCandidateToggles(
      originalOwner,
      payload.slate,
      alternate.slate,
    )

    let mismatched: ActionOutcome | undefined
    act(() => { mismatched = revisedOwner.onSubmit(payload.slate) })
    expect(mismatched?.ok).toBe(false)
    expect(authorityProbe.actionCalls).toHaveLength(0)
    expect(authorityProbe.workspaceProps).toBe(revisedOwner)
    expect(screen.getByTestId('mock-audition-workspace')).toHaveAttribute(
      'data-phase',
      'editing',
    )

    let accepted: ActionOutcome | undefined
    act(() => { accepted = revisedOwner.onSubmit(alternate.slate) })
    expect(accepted?.ok).toBe(true)
    expect(authorityProbe.actionCalls).toHaveLength(1)
    expect(authorityProbe.actionCalls[0]?.payload).toEqual(alternate)
    await waitFor(() => {
      expect(screen.queryByTestId('mock-audition-workspace')).not.toBeInTheDocument()
    })
  })

  it('contains an old submit callback after a genuine draft revision', async () => {
    const before = readyStudio('retained-audition-stale-submit-revision')
    const payload = legalPayload(before)
    await mountStudio(before)
    const { workspace: openedWorkspace } = await openWorkspace()
    const oldOwner = publishLegalDraftThroughCandidateToggles(openedWorkspace, payload.slate)
    const currentOwner = publishDraft(oldOwner, {
      lead: [...payload.slate.lead],
      antagonist: [...payload.slate.antagonist],
      support: [payload.slate.support[1]],
    })

    let stale: ActionOutcome | undefined
    act(() => { stale = oldOwner.onSubmit(payload.slate) })
    expect(stale).toEqual({
      ok: false,
      error: 'Audition planning is no longer owned by the live Studio Lot.',
    })
    expect(authorityProbe.actionCalls).toHaveLength(0)
    expect(authorityProbe.workspaceProps).toBe(currentOwner)
    expect(screen.getByTestId('mock-audition-workspace')).toHaveAttribute(
      'data-phase',
      'editing',
    )
  })

  it('contains an old cancel callback after a genuine draft revision', async () => {
    const before = readyStudio('retained-audition-stale-cancel-revision')
    const payload = legalPayload(before)
    const { lot } = await mountStudio(before)
    const { workspace: openedWorkspace } = await openWorkspace()
    const oldOwner = publishLegalDraftThroughCandidateToggles(openedWorkspace, payload.slate)
    const currentOwner = publishDraft(oldOwner, {
      lead: [...payload.slate.lead],
      antagonist: [...payload.slate.antagonist],
      support: [payload.slate.support[1]],
    })

    act(() => oldOwner.onCancel())
    expect(authorityProbe.workspaceProps).toBe(currentOwner)
    expect(screen.getByTestId('mock-audition-workspace')).toHaveAttribute(
      'data-phase',
      'editing',
    )
    expect(screen.getByTestId('mock-audition-authority-lot')).toBe(lot)
    expect(lot).toHaveAttribute('data-world-suspended', 'true')
    expect(activeSessionBytes()).toBe(exportSaveJson(before))

    act(() => currentOwner.onCancel())
    await waitFor(() => {
      expect(screen.queryByTestId('mock-audition-workspace')).not.toBeInTheDocument()
    })
  })

  it('contains an old details callback after a genuine draft revision', async () => {
    const before = readyStudio('retained-audition-stale-details-revision')
    const payload = legalPayload(before)
    const { lot } = await mountStudio(before)
    const { workspace: openedWorkspace } = await openWorkspace()
    const oldOwner = publishLegalDraftThroughCandidateToggles(openedWorkspace, payload.slate)
    const currentOwner = publishDraft(oldOwner, {
      lead: [...payload.slate.lead],
      antagonist: [...payload.slate.antagonist],
      support: [payload.slate.support[1]],
    })

    act(() => oldOwner.onOpenDetails())
    expect(authorityProbe.workspaceProps).toBe(currentOwner)
    expect(screen.getByTestId('mock-audition-workspace')).toHaveAttribute(
      'data-phase',
      'editing',
    )
    expect(screen.queryByTestId('casting-room')).not.toBeInTheDocument()
    expect(screen.getByTestId('mock-audition-authority-lot')).toBe(lot)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))

    act(() => currentOwner.onOpenDetails())
    expect(await screen.findByTestId('casting-room')).toBeInTheDocument()
  })

  it('keeps an accepted successor when receipt presentation fails and guesses no witness', async () => {
    const before = readyStudio('retained-audition-neutral-receipt')
    const payload = legalPayload(before)
    const direct = startCastingSessionAction(before, payload)
    if (!direct.ok) throw new Error(direct.error)
    const { lot, canvas } = await mountStudio(before)
    const { workspace: openedWorkspace } = await openWorkspace()
    const workspace = publishLegalDraftThroughCandidateToggles(
      openedWorkspace,
      payload.slate,
    )
    authorityProbe.rejectReceipt = true
    authorityProbe.actionCalls.length = 0

    let accepted: ActionOutcome | undefined
    act(() => { accepted = workspace.onSubmit(payload.slate) })
    expect(accepted?.ok).toBe(true)
    await waitFor(() => {
      expect(screen.queryByTestId('mock-audition-workspace')).not.toBeInTheDocument()
      expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))
    })
    expect(authorityProbe.lotProps?.liveAuditionPresentation).toBeUndefined()
    expect(authorityProbe.liveReceiptIdentities).toEqual(new Set())
    expect(screen.getByTestId('mock-audition-authority-lot')).toBe(lot)
    expect(screen.getByTestId('mock-audition-authority-canvas')).toBe(canvas)
    expect(authorityProbe.actionCalls).toHaveLength(1)
  })

  it('opens the exact project in full Casting details without starting a session', async () => {
    const before = readyStudio('retained-audition-details')
    const payload = legalPayload(before)
    const { lot } = await mountStudio(before)
    const { workspace } = await openWorkspace()

    fireEvent.click(screen.getByTestId('mock-audition-details'))
    expect(await screen.findByTestId('casting-room')).toBeInTheDocument()
    expect(screen.getByTestId('casting-planner')).toHaveTextContent(workspace.project.title)
    expect(lot.isConnected).toBe(false)
    expect(authorityProbe.actionCalls).toHaveLength(0)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))

    let stale: ActionOutcome | undefined
    act(() => { stale = workspace.onSubmit(payload.slate) })
    expect(stale).toEqual({
      ok: false,
      error: 'Audition planning is no longer owned by the live Studio Lot.',
    })
    expect(authorityProbe.actionCalls).toHaveLength(0)
  })

  it('contains a stale workspace callback after an accepted whole-studio replacement', async () => {
    const before = readyStudio('retained-audition-cancel')
    const replacement = structuredClone(before)
    const payload = legalPayload(before)
    await mountStudio(before)
    const lotOwner = authorityProbe.lotProps!
    act(() => lotOwner.onNavigate({ kind: 'saves' }))
    expect(await screen.findByTestId('mock-audition-authority-saves')).toBeInTheDocument()
    const acceptedLoad = authorityProbe.savesProps?.onLoad
    if (acceptedLoad === undefined) throw new Error('setup: no load callback')
    fireEvent.click(screen.getByTestId('mock-saves-back'))
    await screen.findByTestId('mock-audition-authority-lot')
    await waitFor(() => {
      expect(authorityProbe.lotMounts).toBe(2)
      expect(authorityProbe.lotUnmounts).toBe(1)
    })
    const { workspace } = await openWorkspace()

    act(() => acceptedLoad(replacement, { converted: false }))
    await waitFor(() => {
      expect(screen.queryByTestId('mock-audition-workspace')).not.toBeInTheDocument()
      expect(activeSessionBytes()).toBe(exportSaveJson(replacement))
    })
    let stale: ActionOutcome | undefined
    act(() => { stale = workspace.onSubmit(payload.slate) })
    expect(stale).toEqual({
      ok: false,
      error: 'Audition planning is no longer owned by the live Studio Lot.',
    })
    expect(authorityProbe.actionCalls).toHaveLength(0)
  })

  it('blocks retained audition planning while an exact next-event session owns the Lot transition', async () => {
    const beforeCasting = twoReadyScreenplays('retained-audition-next-event-owner')
    const castingPayload = legalPayload(beforeCasting)
    const started = startCastingSessionAction(beforeCasting, castingPayload)
    if (!started.ok) throw new Error(started.error)
    expect(castingSessionsBoard(started.next).sections.readyToPlan.length).toBeGreaterThan(0)

    const { lot } = await mountStudio(started.next)
    const beforeNextEvent = authorityProbe.lotProps!
    act(() => {
      expect(beforeNextEvent.onSimToNextEvent?.(beforeNextEvent.state)).toBe(true)
    })
    await waitFor(() => {
      expect(authorityProbe.lotProps?.cadenceFeedback?.kind).toBe('next-event-exact')
    })
    const nextEventOwner = authorityProbe.lotProps!
    expect(castingSessionsBoard(nextEventOwner.state).sections.readyToPlan.length).toBeGreaterThan(0)

    fireEvent.click(screen.getByTestId('lot-nav-casting'))

    expect(screen.queryByTestId('mock-audition-workspace')).not.toBeInTheDocument()
    expect(await screen.findByTestId('casting-room')).toBeInTheDocument()
    expect(lot.isConnected).toBe(false)
    expect(authorityProbe.actionCalls).toHaveLength(0)
  })

  it('preserves the full Casting Room fallback when Operation Hollywood is off', async () => {
    const before = readyStudio('retained-audition-hollywood-off')
    setOperationHollywoodOverride(false)
    const { lot } = await mountStudio(before)

    fireEvent.click(screen.getByTestId('lot-nav-casting'))

    expect(await screen.findByTestId('casting-room')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-audition-workspace')).not.toBeInTheDocument()
    expect(lot.isConnected).toBe(false)
    expect(authorityProbe.actionCalls).toHaveLength(0)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
  })

  it('contains retained callbacks after App teardown', async () => {
    const before = readyStudio('retained-audition-cancel')
    const payload = legalPayload(before)
    const mounted = await mountStudio(before)
    const { workspace } = await openWorkspace()

    act(() => mounted.unmount())
    let stale: ActionOutcome | undefined
    act(() => { stale = workspace.onSubmit(payload.slate) })
    expect(stale).toEqual({
      ok: false,
      error: 'Audition planning is no longer owned by the live Studio Lot.',
    })
    expect(authorityProbe.actionCalls).toHaveLength(0)
    expect(activeSessionBytes()).toBe(exportSaveJson(before))
  })
})
