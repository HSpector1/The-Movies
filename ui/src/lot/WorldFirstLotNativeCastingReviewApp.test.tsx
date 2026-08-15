import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App.tsx'
import * as adapter from '../engine/adapter.ts'
import {
  acknowledgeCastingSessionAction,
  advanceToNextEvent,
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  exportSaveJson,
  importSaveJson,
  releaseTalentAction,
  runScriptProjectAction,
  scriptProjectsBoard,
  startCastingSessionAction,
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
import { currentLotCastingReviewContext } from './snapshot/castingReview.ts'
import {
  resetLotSelectedBuilding,
} from './snapshot/selectedBuildingSession.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'

const renderer = vi.hoisted(() => {
  type Snapshot = { week: number }
  type Options = {
    snapshot: Snapshot
    onReady?: () => void
    onHollywoodFailure?: () => void
  }
  const instances: FakeView[] = []

  class FakeView {
    readonly options: Options
    snapshots: Snapshot[] = []
    destroyed = false
    selected: string[] = []
    productionSelections: string[] = []
    annexSelections = 0
    publicitySelections = 0

    constructor(options: Options) {
      this.options = options
      this.snapshots.push(options.snapshot)
      instances.push(this)
      queueMicrotask(() => options.onReady?.())
    }

    setSnapshot(snapshot: Snapshot) { this.snapshots.push(snapshot) }
    select(id: string) { this.selected.push(id) }
    clearSelection() {}
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {}
    selectHollywoodPerson() {}
    selectHollywoodProduction(id: string) { this.productionSelections.push(id) }
    selectHollywoodAnnexPlace() { this.annexSelections += 1; return true }
    selectHollywoodPublicityPlace() { this.publicitySelections += 1; return true }
    selectHollywoodSceneryLoadIn() { return true }
    selectHollywoodGatePlace() { return true }
    focusHollywoodGate() { return true }
    focusHollywoodPlace() { return true }
    setHollywoodGateVisitor() {}
    setInputSuspended() {}
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() {}
    showHollywoodPublicity() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    fail() { this.options.onHollywoodFailure?.() }
    destroy() { this.destroyed = true }
  }

  return { FakeView, instances }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

const SHAPE = {
  opening: 'slowSetup',
  midpoint: 'reversal',
  ending: 'bittersweet',
} as const

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
  const clear = currentLotCastingReviewContext(review)
  if (clear === null) throw new Error('setup: expected the clear review context')
  const released = releaseTalentAction(review, clear.writer.id)
  if (!released.ok) throw new Error(released.error)
  const blocked = currentLotCastingReviewContext(released.next)
  if (blocked === null || blocked.action.opensPackage) {
    throw new Error('setup: expected an ordinary Package blocker')
  }
  return released.next
}

function twoSameTitleCastingReviews(): GameState {
  let state = fixtureState()
  const commission = scriptProjectsBoard(state).commission
  const concept = commission.concepts[0]
  const writer = commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) {
    throw new Error('setup: expected a second screenplay commission')
  }
  const commissioned = commissionScriptAction(state, {
    conceptId: concept.id,
    writerId: writer.id,
    shape: SHAPE,
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
  const screenplay = scriptProjectsBoard(state).sections.needsReview[0]
  const accept = screenplay?.legalActions.find((action) => action.kind === 'acceptScript')
  if (screenplay === undefined || accept === undefined) {
    throw new Error('setup: second screenplay did not reach review')
  }
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  state = accepted.next

  const ready = castingSessionsBoard(state).sections.readyToPlan.find(
    (project) => project.projectId === screenplay.projectId,
  )
  const ids = ready?.candidates.lead.map((candidate) => candidate.id) ?? []
  if (ready === undefined || ids.length < 3) {
    throw new Error('setup: second screenplay has no legal Casting slate')
  }
  const started = startCastingSessionAction(state, {
    projectId: ready.projectId,
    slate: {
      lead: [ids[0]!, ids[1]!],
      antagonist: [ids[0]!, ids[1]!],
      support: [ids[0]!, ids[2]!],
    },
  })
  if (!started.ok) throw new Error(started.error)
  state = advanceWeek(started.next).next

  const reviews = castingSessionsBoard(state).sections.needsReview
  if (reviews.length !== 2) throw new Error('setup: expected two pending Casting reviews')
  const firstProject = state.scriptDevelopment.projects.find(
    (project) => project.id === reviews[0]!.projectId,
  )
  const secondProject = state.scriptDevelopment.projects.find(
    (project) => project.id === reviews[1]!.projectId,
  )
  if (firstProject === undefined || secondProject === undefined) {
    throw new Error('setup: reviewed screenplays are absent')
  }
  const firstTitle = state.concepts.find((entry) => entry.id === firstProject.conceptId)?.title
  if (firstTitle === undefined) throw new Error('setup: first Casting title is absent')
  const sameTitle = {
    ...state,
    concepts: state.concepts.map((entry) =>
      entry.id === secondProject.conceptId ? { ...entry, title: firstTitle } : entry,
    ),
  }
  const sameTitleReviews = castingSessionsBoard(sameTitle).sections.needsReview
  if (
    sameTitleReviews.length !== 2 ||
    sameTitleReviews[0]!.title !== sameTitleReviews[1]!.title ||
    sameTitleReviews[0]!.legalActions[0]?.kind !== 'acknowledgeCastingSession' ||
    sameTitleReviews[0]!.legalActions[0].opensPackage !== true
  ) throw new Error('setup: same-title Casting review authority is not clear')
  return sameTitle
}

function activeSessionBytes(): string {
  const loaded = loadActiveSession()
  if (!loaded.ok) throw new Error('setup: expected one active session')
  return exportSaveJson(loaded.state)
}

async function renderStudio(state: GameState) {
  saveActiveSession(state)
  render(<App />)
  const lot = await screen.findByTestId('studio-lot-screen')
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  return {
    lot,
    canvas: screen.getByTestId('studio-lot-canvas'),
    view: renderer.instances[0]!,
  }
}

function expectEarlierInDocument(earlier: HTMLElement, later: HTMLElement) {
  expect(
    earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).not.toBe(0)
}

function pickFirstEligible(testId: string) {
  const candidate = within(screen.getByTestId(testId))
    .getAllByRole('button')
    .find((button) =>
      button.hasAttribute('aria-pressed') && !(button as HTMLButtonElement).disabled)
  if (candidate === undefined) throw new Error(`setup: no eligible candidate in ${testId}`)
  fireEvent.click(candidate)
}

beforeEach(() => {
  localStorage.clear()
  clearActiveSession()
  resetLotStageAssignment()
  resetLotSelectedBuilding()
  renderer.instances.length = 0
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  resetLotStageAssignment()
  resetLotSelectedBuilding()
  renderer.instances.length = 0
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('World-First Lot-Native Casting Review Intervention V1 — App/Lot integration', () => {
  it('reviews all six event-owned observations in the Lot, keeps deep detail optional, then hands the clear successor to Package', async () => {
    const before = fixtureState()
    const stopped = advanceToNextEvent(before)
    if (stopped.stopReason !== 'castingReview') {
      throw new Error('setup: expected one future Casting review')
    }
    const context = currentLotCastingReviewContext(stopped.next)
    if (context === null || !context.action.opensPackage) {
      throw new Error('setup: expected one clear Casting acknowledgement')
    }
    const direct = acknowledgeCastingSessionAction(stopped.next, context.sessionId)
    if (!direct.ok) throw new Error(direct.error)

    await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))

    const panel = await screen.findByTestId('lot-casting-review-panel')
    expect(panel).toHaveAttribute('data-session-id', context.sessionId)
    expect(panel).toHaveAttribute('data-project-id', context.projectId)
    expect(screen.getByTestId('lot-next-event-identity')).toHaveTextContent(context.title)
    expect(screen.getByTestId('lot-next-event-identity')).toHaveTextContent(
      `Project ${context.projectId} · Session ${context.sessionId}`,
    )
    expect(screen.getByTestId('lot-casting-review-genre')).toHaveTextContent(context.genre)
    expect(screen.getByTestId('lot-casting-review-writer')).toHaveTextContent(context.writer.name)
    expect(screen.getByTestId('lot-casting-review-consequence')).toHaveTextContent(
      'results remain advisory and select no winner',
    )
    expect(within(panel).getAllByTestId(/lot-casting-review-row-/)).toHaveLength(6)

    for (const role of context.roles) {
      const rolePanel = screen.getByTestId(`lot-casting-review-role-${role.slot}`)
      expect(rolePanel).toHaveTextContent(role.label)
      role.evidence.forEach((evidence, index) => {
        expect(screen.getByTestId(`lot-casting-review-name-${role.slot}-${index}`))
          .toHaveTextContent(evidence.name)
        expect(screen.getByTestId(`lot-casting-review-talent-id-${role.slot}-${index}`))
          .toHaveTextContent(evidence.talentId)
        expect(screen.getByTestId(`lot-casting-review-estimate-${role.slot}-${index}`))
          .toHaveTextContent(`${evidence.estimate} · ${evidence.low}–${evidence.high}`)
        expect(screen.getByTestId(`lot-casting-review-fit-${role.slot}-${index}`))
          .toHaveTextContent(String(evidence.fit.score))
        expect(screen.getByTestId(`lot-casting-review-availability-${role.slot}-${index}`))
          .toHaveTextContent(evidence.availabilityLabel)
        for (const strength of evidence.strengths) expect(rolePanel).toHaveTextContent(strength)
        for (const concern of evidence.concerns) expect(rolePanel).toHaveTextContent(concern)
      })
    }
    expect(panel).not.toHaveTextContent(/combined score|recommended cast|ranked first/i)
    expect(screen.getByTestId('lot-casting-review-package-state')).toHaveTextContent(
      'Known package gates clear',
    )

    const worldAction = screen.getByTestId(
      `lot-casting-review-action-acknowledgeCastingSession-${context.sessionId}`,
    )
    const deepAction = screen.getByTestId('lot-next-event-open-details')
    expect(worldAction).toHaveTextContent('Take results to Package')
    expectEarlierInDocument(worldAction, deepAction)

    fireEvent.click(deepAction)
    expect(await screen.findByTestId('casting-room')).toBeInTheDocument()
    expect(screen.getByTestId(`casting-project-${context.projectId}`)).toHaveTextContent(context.title)
    await waitFor(() => expect(screen.getByTestId(`casting-status-${context.projectId}`)).toHaveFocus())
    fireEvent.click(screen.getByTestId('casting-room-back'))

    expect(await screen.findByTestId('lot-casting-review-panel')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'NEXT EVENT' })).toHaveFocus()
    const retainedLot = screen.getByTestId('studio-lot-screen')
    const retainedCanvas = screen.getByTestId('studio-lot-canvas')
    const retainedView = renderer.instances.at(-1)!
    fireEvent.click(screen.getByTestId(
      `lot-casting-review-action-acknowledgeCastingSession-${context.sessionId}`,
    ))

    expect(await screen.findByTestId('assembly-casting-handoff')).toHaveTextContent(
      `${context.title} casting review complete`,
    )
    expect(screen.getByTestId('assembly-casting-handoff')).toHaveTextContent(
      'Auditions did not select anyone',
    )
    await waitFor(() => expect(screen.getByTestId('assembly-talent-heading')).toHaveFocus())
    expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))
    expect(screen.getByTestId('lot-package-workspace')).toBeInTheDocument()
    expect(screen.getByTestId('studio-lot-screen')).toBe(retainedLot)
    expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute('inert')
    expect(screen.getByTestId('studio-lot-canvas')).toBe(retainedCanvas)
    expect(renderer.instances.at(-1)).toBe(retainedView)
    expect(retainedView.destroyed).toBe(false)

    const profileOpener = within(screen.getByTestId('picker-director'))
      .getAllByTestId(/^picker-open-profile-/)[0]!
    fireEvent.click(profileOpener)
    expect(await screen.findByTestId('talent-profile')).toBeInTheDocument()
    expect(screen.getByTestId('lot-package-workspace-layer')).toHaveAttribute('inert')
    expect(screen.getByTestId('lot-package-workspace-layer')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute('inert')
    fireEvent.click(screen.getByTestId('talent-profile-close'))
    await waitFor(() => expect(screen.queryByTestId('talent-profile')).not.toBeInTheDocument())
    await waitFor(() => expect(profileOpener).toHaveFocus())
    expect(screen.getByTestId('lot-package-workspace-layer')).not.toHaveAttribute('inert')

    fireEvent.click(screen.getByTestId('assembly-back'))
    expect(screen.getByTestId('studio-lot-screen')).toBe(retainedLot)
    expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute(
      'data-entry-focus',
      'next-event-reaction',
    )
    expect(screen.getByTestId('studio-lot-screen')).not.toHaveAttribute('inert')
    expect(screen.getByTestId('studio-lot-canvas')).toBe(retainedCanvas)
    expect(renderer.instances.at(-1)).toBe(retainedView)
    expect(screen.queryByTestId('lot-package-workspace')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-casting-review-success')).toBeInTheDocument()
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
  })

  it('greenlights the canonical Package into exact formation without replacing the Lot, canvas, or renderer', async () => {
    const before = reviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null || !context.action.opensPackage) {
      throw new Error('setup: expected one clear Casting acknowledgement')
    }
    const acknowledged = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!acknowledged.ok) throw new Error(acknowledged.error)

    const { lot, canvas, view } = await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    expect(await screen.findByTestId('lot-casting-review-panel')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId(
      `lot-casting-review-action-acknowledgeCastingSession-${context.sessionId}`,
    ))

    expect(await screen.findByTestId('lot-package-workspace')).toBeInTheDocument()
    expect(activeSessionBytes()).toBe(exportSaveJson(acknowledged.next))
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])

    pickFirstEligible('picker-director')
    pickFirstEligible('picker-lead')
    pickFirstEligible('picker-antagonist')
    pickFirstEligible('picker-support')
    pickFirstEligible('picker-craft')
    fireEvent.click(screen.getByTestId('assembly-next'))
    fireEvent.click(screen.getByTestId('assembly-next'))
    expect(screen.getByTestId('greenlight')).toBeEnabled()
    fireEvent.click(screen.getByTestId('greenlight'))

    await waitFor(() => {
      expect(screen.queryByTestId('lot-package-workspace')).not.toBeInTheDocument()
      expect(screen.getByTestId('hollywood-production-formation-witness')).toHaveTextContent(
        'PICTURE FORMED',
      )
    })
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-screen')).not.toHaveAttribute('inert')
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(view.destroyed).toBe(false)
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(context.title)
    expect(screen.getByTestId('lot-production-formation-announcement')).toHaveTextContent(
      `Picture formed: ${context.title}`,
    )

    const saved = loadActiveSession()
    expect(saved.ok).toBe(true)
    if (!saved.ok) throw new Error('expected accepted greenlight autosave')
    expect(saved.state.studio.activeProductions).toHaveLength(1)
    expect(saved.state.studio.activeProductions[0]?.conceptId).toBe(
      before.scriptDevelopment.projects.find((project) => project.id === context.projectId)
        ?.conceptId,
    )
  })

  it('keeps a blocked acknowledgement and every current remedy on the same mounted fallback Lot', async () => {
    const before = blockedReviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null || context.action.opensPackage) {
      throw new Error('setup: expected one blocked Casting review')
    }
    const direct = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!direct.ok) throw new Error(direct.error)

    const { view } = await renderStudio(before)
    act(() => view.fail())
    expect(await screen.findByTestId('lot-canvas-fallback')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    const panel = await screen.findByTestId('lot-casting-review-panel')
    expect(panel).toHaveAttribute('data-opens-package', 'false')
    expect(screen.getByTestId('lot-casting-review-package-state')).toHaveTextContent(
      'Package gates blocked',
    )
    for (const blocker of context.packageAvailability.blockers) {
      expect(screen.getByTestId('lot-casting-review-blockers')).toHaveTextContent(blocker.headline)
      expect(screen.getByTestId('lot-casting-review-blockers')).toHaveTextContent(blocker.detail)
      expect(screen.getByTestId('lot-casting-review-blockers')).toHaveTextContent(blocker.remedy)
    }

    fireEvent.click(screen.getByTestId('lot-casting-review-open-details'))
    expect(await screen.findByTestId('casting-room')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId(`casting-status-${context.projectId}`)).toHaveFocus())
    fireEvent.click(screen.getByTestId('casting-room-back'))
    expect(await screen.findByTestId('studio-lot-screen')).toHaveAttribute(
      'data-entry-focus',
      'casting-review',
    )
    expect(screen.getByTestId('lot-casting-review-heading')).toHaveTextContent(context.title)
    const returnedLot = screen.getByTestId('studio-lot-screen')
    const returnedCanvas = screen.getByTestId('studio-lot-canvas')
    const returnedView = renderer.instances.at(-1)!
    expect(returnedView).not.toBe(view)
    act(() => returnedView.fail())
    expect(await screen.findByTestId('lot-canvas-fallback')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId(
      `lot-casting-review-action-acknowledgeCastingSession-${context.sessionId}`,
    ))
    const success = await screen.findByTestId('lot-casting-review-success')
    expect(success).toHaveTextContent('casting review is complete')
    expect(success).toHaveTextContent('Persisted evidence remains available')
    expect(screen.getByTestId('lot-casting-review-blocked-success')).toHaveTextContent(
      'Six persisted camera-test observations remain available',
    )
    for (const blocker of context.packageAvailability.blockers) {
      expect(success).toHaveTextContent(blocker.headline)
      expect(success).toHaveTextContent(blocker.detail)
      expect(success).toHaveTextContent(blocker.remedy)
    }
    expect(screen.getByTestId('lot-casting-review-announcement')).toHaveTextContent(
      'Persisted evidence remains available',
    )
    expect(screen.getByTestId('studio-lot-screen')).toBe(returnedLot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(returnedCanvas)
    expect(renderer.instances.at(-1)).toBe(returnedView)
    expect(returnedView.destroyed).toBe(false)
    expect(screen.queryByTestId('assembly-steps')).not.toBeInTheDocument()
    expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))
  })

  it('keeps the complete blocked world action available in the Classic physical fallback', async () => {
    setOperationHollywoodOverride(false)
    const before = blockedReviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null) throw new Error('setup: expected one Classic Casting review')
    const direct = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!direct.ok) throw new Error(direct.error)

    const { lot, canvas, view } = await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    expect(await screen.findByTestId('lot-casting-review-context')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId(
      `lot-casting-review-action-acknowledgeCastingSession-${context.sessionId}`,
    ))

    expect(await screen.findByTestId('lot-casting-review-success')).toBeInTheDocument()
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(view.destroyed).toBe(false)
    expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))
  })

  it('preserves the clear Classic rollback route as standalone Package Assembly', async () => {
    setOperationHollywoodOverride(false)
    const before = reviewState()
    const context = currentLotCastingReviewContext(before)
    if (context === null || !context.action.opensPackage) {
      throw new Error('setup: expected one clear Classic Casting review')
    }
    const direct = acknowledgeCastingSessionAction(before, context.sessionId)
    if (!direct.ok) throw new Error(direct.error)

    const { lot, canvas, view } = await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    fireEvent.click(screen.getByTestId(
      `lot-casting-review-action-acknowledgeCastingSession-${context.sessionId}`,
    ))

    expect(await screen.findByTestId('assembly-casting-handoff')).toHaveTextContent(
      `${context.title} casting review complete`,
    )
    expect(screen.getByTestId('assembly-surface')).toHaveAttribute('data-surface', 'standalone')
    expect(screen.queryByTestId('lot-package-workspace')).not.toBeInTheDocument()
    expect(screen.queryByTestId('studio-lot-screen')).not.toBeInTheDocument()
    expect(lot).not.toBeInTheDocument()
    expect(canvas).not.toBeInTheDocument()
    expect(view.destroyed).toBe(true)
    expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))

    fireEvent.click(screen.getByTestId('assembly-back-dashboard'))
    expect(await screen.findByTestId('studio-lot-screen')).toBeInTheDocument()
  })

  it('rebuilds an imported pending review only after Casting is selected in the replacement Lot', async () => {
    const initial = fixtureState()
    const replacement = blockedReviewState()
    const context = currentLotCastingReviewContext(replacement)
    if (context === null) throw new Error('setup: imported Casting review is absent')

    const { lot: originalLot, view: originalView } = await renderStudio(initial)
    fireEvent.click(screen.getByTestId('lot-return-dashboard'))
    fireEvent.click(await screen.findByTestId('open-saves'))
    fireEvent.change(await screen.findByTestId('saves-import-text'), {
      target: { value: exportSaveJson(replacement) },
    })
    fireEvent.click(screen.getByTestId('saves-import'))

    const replacedLot = await screen.findByTestId('studio-lot-screen')
    expect(replacedLot).not.toBe(originalLot)
    expect(originalView.destroyed).toBe(true)
    expect(replacedLot).toHaveAttribute('data-entry-focus', 'studio-home')
    expect(screen.queryByTestId('lot-casting-review-panel')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-sim-to-next-event')).toBeDisabled()
    expect(activeSessionBytes()).toBe(exportSaveJson(replacement))

    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    expect(await screen.findByTestId('lot-casting-review-heading')).toHaveTextContent(context.title)
    expect(screen.getByTestId('lot-casting-review-panel')).toHaveAttribute(
      'data-session-id',
      context.sessionId,
    )
    expect(screen.getByTestId('lot-casting-review-panel')).toHaveAttribute(
      'data-project-id',
      context.projectId,
    )
    expect(activeSessionBytes()).toBe(exportSaveJson(replacement))
  })

  it('keeps a malformed current Casting decision neutral instead of falling through to Casting Room', async () => {
    const before = reviewState()
    const malformed = structuredClone(castingSessionsBoard(before)) as ReturnType<
      typeof castingSessionsBoard
    > & { hiddenAuthority?: boolean }
    malformed.hiddenAuthority = true
    vi.spyOn(adapter, 'castingSessionsBoard').mockReturnValue(malformed)

    const beforeBytes = exportSaveJson(before)
    const { lot } = await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-nav-casting'))

    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.queryByTestId('casting-room')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-casting-review-panel')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-nav-casting')).not.toHaveAttribute('aria-current')
    await waitFor(() => expect(screen.getByTestId('lot-studio-heading')).toHaveFocus())
    expect(activeSessionBytes()).toBe(beforeBytes)
  })

  it('keeps a thrown current-decision adapter neutral', async () => {
    const before = reviewState()
    const beforeBytes = exportSaveJson(before)
    vi.spyOn(adapter, 'studioDecision').mockImplementation(() => {
      throw new Error('test-only unavailable current Casting decision')
    })

    const { lot } = await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-nav-casting'))

    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.queryByTestId('casting-room')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-casting-review-panel')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('lot-studio-heading')).toHaveFocus())
    expect(activeSessionBytes()).toBe(beforeBytes)
  })

  it('preserves the established Casting Room route when no current studio decision exists', async () => {
    const noReview = fixtureState()
    expect(adapter.studioDecision(noReview)).toBeNull()
    await renderStudio(noReview)

    fireEvent.click(screen.getByTestId('lot-nav-casting'))

    expect(await screen.findByTestId('casting-room')).toBeInTheDocument()
    expect(activeSessionBytes()).toBe(exportSaveJson(noReview))
  })

  it('dispatches the first same-title session from the Lot and returns neutral instead of substituting the later review', async () => {
    const pending = twoSameTitleCastingReviews()
    const reviews = castingSessionsBoard(pending).sections.needsReview
    const focused = reviews[0]!
    const replacement = reviews[1]!
    expect(focused.title).toBe(replacement.title)
    expect(focused.sessionId).not.toBe(replacement.sessionId)
    expect(focused.projectId).not.toBe(replacement.projectId)

    const { lot, canvas, view } = await renderStudio(pending)
    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    expect(await screen.findByTestId('lot-casting-review-heading')).toHaveTextContent(focused.title)
    expect(screen.getByTestId('lot-casting-review-panel')).toHaveAttribute(
      'data-session-id',
      focused.sessionId,
    )
    const direct = acknowledgeCastingSessionAction(pending, focused.sessionId!)
    if (!direct.ok) throw new Error(direct.error)
    fireEvent.click(screen.getByTestId(
      `lot-casting-review-action-acknowledgeCastingSession-${focused.sessionId}`,
    ))
    expect(await screen.findByTestId('assembly-casting-handoff')).toHaveTextContent(focused.title)
    expect(activeSessionBytes()).toBe(exportSaveJson(direct.next))
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    fireEvent.click(screen.getByTestId('assembly-back'))

    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute(
      'data-entry-focus',
      'studio-home',
    )
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(screen.queryByTestId('lot-package-workspace')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-sim-to-next-event')).toBeDisabled()

    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    expect(await screen.findByTestId('lot-casting-review-panel')).toHaveAttribute(
      'data-session-id',
      replacement.sessionId,
    )
    expect(screen.getByTestId('lot-casting-review-panel')).toHaveAttribute(
      'data-project-id',
      replacement.projectId,
    )
  })
})
