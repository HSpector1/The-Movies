import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import { App } from '../App.tsx'
import {
  advanceToNextEvent,
  advanceWeek,
  commissionScriptAction,
  exportSaveJson,
  greenlight,
  productionDecision,
  requiredNegative,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  startDevelopmentCastingAnnexAction,
  studioDevelopment,
  studioLotSnapshot,
  type CreativeRole,
  type DraftPackage,
  type GameState,
  type SimResult,
  type ScriptProjectActionView,
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
import { foundedRosterIds, newFoundedGame } from '../test/founding.ts'
import {
  getLotSelectedBuilding,
  resetLotSelectedBuilding,
} from './snapshot/selectedBuildingSession.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'

const adapterProbe = vi.hoisted(() => ({
  calls: [] as GameState[],
  scriptCalls: [] as Array<{ state: GameState; action: ScriptProjectActionView }>,
  transform: null as null | ((result: SimResult) => SimResult),
  rejectCurrentDecision: false,
  rejectScriptAction: false,
}))

vi.mock('../engine/adapter.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/adapter.ts')>()
  return {
    ...actual,
    advanceToNextEvent(state: GameState) {
      adapterProbe.calls.push(state)
      const result = actual.advanceToNextEvent(state)
      return adapterProbe.transform?.(result) ?? result
    },
    studioDecision(state: GameState) {
      return adapterProbe.rejectCurrentDecision
        ? null
        : actual.studioDecision(state)
    },
    runScriptProjectAction(state: GameState, action: ScriptProjectActionView) {
      adapterProbe.scriptCalls.push({ state, action })
      return adapterProbe.rejectScriptAction
        ? { ok: false as const, error: 'test-only screenplay action rejection' }
        : actual.runScriptProjectAction(state, action)
    },
  }
})

const renderer = vi.hoisted(() => {
  type Snapshot = { week: number }
  type Options = {
    snapshot: Snapshot
    onReady?: () => void
    onHollywoodFailure?: () => void
    onActivity?: (text: string) => void
  }
  const instances: FakeView[] = []
  const controls = { deferReady: false }

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
      if (!controls.deferReady) queueMicrotask(() => options.onReady?.())
    }

    setSnapshot(snapshot: Snapshot) {
      this.snapshots.push(snapshot)
    }
    select(id: string) {
      this.selected.push(id)
    }
    clearSelection() {}
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {}
    selectHollywoodPerson() {}
    selectHollywoodProduction(id: string) {
      this.productionSelections.push(id)
    }
    selectHollywoodAnnexPlace() {
      this.annexSelections += 1
      return true
    }
    selectHollywoodPublicityPlace() {
      this.publicitySelections += 1
      return true
    }
    selectHollywoodSceneryLoadIn() {
      return true
    }
    selectHollywoodGatePlace() {
      return true
    }
    focusHollywoodGate() {
      return true
    }
    focusHollywoodPlace() {
      return true
    }
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
    identityDebug() {
      return null
    }
    getDebugState() {
      return null
    }
    hollywoodPerformance() {
      return null
    }
    fail() {
      this.options.onHollywoodFailure?.()
    }
    ready() {
      this.options.onReady?.()
    }
    emitActivity(text: string) {
      this.options.onActivity?.(text)
    }
    destroy() {
      this.destroyed = true
    }
  }

  return { FakeView, instances, controls }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

const SHAPE = {
  opening: 'slowSetup',
  midpoint: 'reversal',
  ending: 'bittersweet',
} as const

function managedStudio(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [
    { kind: 'activateStudioOperations' },
  ])
}

function managedScriptStudio(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
}

function commissionScriptIn(state: GameState): GameState {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]
  const writer = board.commission.writers.find(
    (candidate) => candidate.available,
  )
  if (concept === undefined || writer === undefined) {
    throw new Error('setup: expected one available screenplay commission')
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

function commissionedStudio(seed: string): GameState {
  return commissionScriptIn(managedScriptStudio(seed))
}

function pendingFirstDraftReview(seed: string): GameState {
  const stopped = advanceToNextEvent(commissionedStudio(seed))
  if (stopped.stopReason !== 'scriptReview' || stopped.scriptDecision === null) {
    throw new Error('setup: expected a first-draft screenplay review')
  }
  return stopped.next
}

function pendingFinalDraftReview(seed: string): GameState {
  const first = pendingFirstDraftReview(seed)
  const rewrite = scriptProjectsBoard(first).nextDecision?.legalActions.find(
    (action) => action.kind === 'requestScriptRewrite',
  )
  if (rewrite === undefined) throw new Error('setup: expected a legal final rewrite')
  const requested = runScriptProjectAction(first, rewrite)
  if (!requested.ok) throw new Error(requested.error)
  const reviewed = advanceWeek(requested.next).next
  const decision = scriptProjectsBoard(reviewed).nextDecision
  if (
    decision === null ||
    !decision.legalActions.some((action) => action.kind === 'acceptScript') ||
    decision.legalActions.some((action) => action.kind === 'requestScriptRewrite')
  ) throw new Error('setup: expected a final-draft review')
  return reviewed
}

function twoPendingReviews(seed: string): GameState {
  let state = managedScriptStudio(seed)
  state = commissionScriptIn(state)
  state = commissionScriptIn(state)
  state = advanceWeek(state).next
  if (scriptProjectsBoard(state).sections.needsReview.length !== 2) {
    throw new Error('setup: expected two simultaneous screenplay reviews')
  }
  return state
}

function operationalAnnexCommissionedStudio(seed: string): GameState {
  const started = startDevelopmentCastingAnnexAction(managedScriptStudio(seed))
  if (!started.ok) throw new Error(started.error)
  let state = started.next
  for (let week = 0; week < 13; week += 1) state = advanceWeek(state).next
  if (studioDevelopment(state).status !== 'operational') {
    throw new Error('setup: expected the Development & Casting Annex to be Operational')
  }
  return commissionScriptIn(state)
}

function pendingAnnexRewriteReview(seed: string): GameState {
  let state = operationalAnnexCommissionedStudio(seed)
  const stopped = advanceToNextEvent(state)
  if (stopped.stopReason !== 'scriptReview' || stopped.scriptDecision === null) {
    throw new Error('setup: expected the Annex screenplay to reach review')
  }
  state = stopped.next
  const reviewed = scriptProjectsBoard(state).sections.needsReview[0]
  if (reviewed === undefined) throw new Error('setup: expected one reviewed screenplay')

  for (let index = 0; index < 2; index += 1) {
    const board = scriptProjectsBoard(state)
    const concept = board.commission.concepts[0]
    const writer = board.commission.writers.find(
      (candidate) => candidate.available && candidate.id !== reviewed.writer.id,
    )
    if (concept === undefined || writer === undefined) {
      throw new Error('setup: expected another writer and concept for base-slot occupancy')
    }
    const commissioned = commissionScriptAction(state, {
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
    if (!commissioned.ok) throw new Error(commissioned.error)
    state = commissioned.next
  }

  const board = scriptProjectsBoard(state)
  const rewrite = board.nextDecision?.legalActions.find(
    (action) => action.kind === 'requestScriptRewrite',
  )
  if (rewrite === undefined || board.capacity.available !== 1) {
    throw new Error('setup: expected one Annex slot and a legal rewrite')
  }
  const base = board.capacity.facilities.find(
    (facility) => facility.facilityId === 'facility-development-casting',
  )
  if (base === undefined || base.occupied !== base.capacity) {
    throw new Error('setup: expected both base Development & Casting slots occupied')
  }
  return state
}

function legalPackage(state: GameState, slot = 0): DraftPackage {
  const concept = state.concepts[slot]!
  const id = (role: CreativeRole, index: number) =>
    foundedRosterIds(state, role)[index]!
  return {
    conceptId: concept.id,
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
    writerId: id('writer', slot),
    directorId: id('director', slot),
    craftIds: [id('craft', slot)],
    cast: {
      lead: id('actor', slot * 3),
      antagonist: id('actor', slot * 3 + 1),
      support: id('actor', slot * 3 + 2),
    },
    budget: {
      negative: requiredNegative(concept, SHAPE, state),
      marketing: 400_000,
    },
  }
}

function managedWithLegacyDevelopment(seed: string): GameState {
  const state = managedStudio(seed)
  return {
    ...state,
    scriptDevelopment: { mode: 'legacy', projects: [] },
    castingSessions: { mode: 'legacy', sessions: [] },
  }
}

function resolveShootingChain(state: GameState): GameState {
  let current = state
  for (let step = 0; step < 3; step += 1) {
    const command = productionDecision(current)?.command
    if (command === null || command === undefined) {
      throw new Error(`setup: expected shooting command ${String(step + 1)}`)
    }
    const result = runProductionCommand(current, command)
    if (!result.ok) throw new Error(result.error)
    current = result.next
  }
  return current
}

function releaseConstructionCoevent(seed: string): GameState {
  let state = managedWithLegacyDevelopment(seed)
  const started = startDevelopmentCastingAnnexAction(state)
  if (!started.ok) throw new Error(started.error)
  state = started.next
  for (let week = 0; week < 4; week += 1) state = advanceWeek(state).next
  const greenlit = greenlight(state, legalPackage(state))
  if (!greenlit.ok) throw new Error(greenlit.error)
  state = greenlit.next
  for (let week = 0; week < 4; week += 1) state = advanceWeek(state).next
  if (productionDecision(state)?.command?.kind !== 'assignShootingDirector') {
    throw new Error('setup: expected the aligned shooting decision')
  }
  state = resolveShootingChain(state)
  for (let week = 0; week < 4; week += 1) state = advanceWeek(state).next
  if (
    studioDevelopment(state).completedAdvances !== 12 ||
    state.studio.activeProductions[0]?.remainingTicks !== 1
  ) {
    throw new Error('setup: expected release/Annex completion on the next tick')
  }
  return state
}

function constructionBefore(seed: string): GameState {
  const started = startDevelopmentCastingAnnexAction(
    managedWithLegacyDevelopment(seed),
  )
  if (!started.ok) throw new Error(started.error)
  return started.next
}

function scriptReviewConstructionCoevent(seed: string): GameState {
  const started = startDevelopmentCastingAnnexAction(managedScriptStudio(seed))
  if (!started.ok) throw new Error(started.error)
  let state = started.next
  for (let week = 0; week < 12; week += 1) state = advanceWeek(state).next
  const development = studioDevelopment(state)
  if (
    development.status !== 'building' ||
    development.completedAdvances !== 12 ||
    development.remainingAdvances !== 1
  ) {
    throw new Error('setup: expected Annex completion on the next tick')
  }
  return commissionScriptIn(state)
}

function stage7DecisionBefore(seed: string): GameState {
  const state = managedWithLegacyDevelopment(seed)
  const greenlit = greenlight(state, legalPackage(state))
  if (!greenlit.ok) throw new Error(greenlit.error)
  const stopped = advanceToNextEvent(greenlit.next)
  if (stopped.stopReason !== 'productionDecision' || stopped.weeks <= 0) {
    throw new Error('setup: expected a future Stage 7 production decision')
  }
  const operation = (
    studioLotSnapshot(stopped.next).productionOperations ?? []
  ).find(
    (candidate) =>
      candidate.productionId === stopped.productionDecision?.productionId,
  )
  if (operation?.locationBuildingId !== 'stage-a') {
    throw new Error(
      'setup: expected the first managed production to reserve Stage 7',
    )
  }
  return greenlit.next
}

function stage12DecisionBefore(seed: string): GameState {
  let state = managedWithLegacyDevelopment(seed)
  const firstGreenlight = greenlight(state, legalPackage(state, 0))
  if (!firstGreenlight.ok) throw new Error(firstGreenlight.error)
  state = advanceWeek(firstGreenlight.next).next
  const secondGreenlight = greenlight(state, legalPackage(state, 1))
  if (!secondGreenlight.ok) throw new Error(secondGreenlight.error)

  const firstStop = advanceToNextEvent(secondGreenlight.next)
  if (firstStop.stopReason !== 'productionDecision' || firstStop.weeks <= 0) {
    throw new Error('setup: expected the earlier Stage 7 decision')
  }
  state = firstStop.next
  for (let step = 0; step < 3; step += 1) {
    const decision = productionDecision(state)
    if (decision?.command === null || decision === null) {
      throw new Error(`setup: expected Stage 7 command ${String(step + 1)}`)
    }
    const operation = (
      studioLotSnapshot(state).productionOperations ?? []
    ).find((candidate) => candidate.productionId === decision.productionId)
    if (operation?.locationBuildingId !== 'stage-a') {
      throw new Error(
        'setup: Stage 12 became actionable before Stage 7 was scheduled',
      )
    }
    const commanded = runProductionCommand(state, decision.command)
    if (!commanded.ok) throw new Error(commanded.error)
    state = commanded.next
  }
  if (productionDecision(state) !== null) {
    throw new Error('setup: expected one decision-free week before Stage 12')
  }
  const secondStop = advanceToNextEvent(state)
  const secondOperation = (
    studioLotSnapshot(secondStop.next).productionOperations ?? []
  ).find(
    (candidate) =>
      candidate.productionId === secondStop.productionDecision?.productionId,
  )
  if (
    secondStop.stopReason !== 'productionDecision' ||
    secondStop.weeks <= 0 ||
    secondOperation?.locationBuildingId !== 'stage-b'
  ) {
    throw new Error(
      'setup: expected the staggered second production to stop at Stage 12',
    )
  }
  return state
}

function limitBefore(seed: string): GameState {
  // The canonical 520 guard is reachable only when no earlier subsystem event exists.
  // Remove the test-founder's short-lived contracts, leaving a valid founded idle studio
  // with no decision, production, run, cash crossing, renewal, or expiry to pre-empt it.
  const state = newFoundedGame(seed)
  const cash = 1_000_000_000_000
  return {
    ...state,
    contracts: [],
    studio: { ...state.studio, cash },
    ledger: [
      ...state.ledger,
      {
        week: state.market.tick,
        kind: 'termination',
        amount: cash - state.studio.cash,
        note: 'test-only cash reconciliation for the 520-week guard',
      },
    ],
  }
}

function resetAdapterProbe() {
  adapterProbe.calls.length = 0
  adapterProbe.scriptCalls.length = 0
  adapterProbe.transform = null
  adapterProbe.rejectCurrentDecision = false
  adapterProbe.rejectScriptAction = false
}

function currentSessionBytes(): string {
  const restored = loadActiveSession()
  expect(restored.ok).toBe(true)
  if (!restored.ok) throw new Error('expected a valid active studio session')
  return exportSaveJson(restored.state)
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

beforeEach(() => {
  localStorage.clear()
  resetLotStageAssignment()
  resetLotSelectedBuilding()
  renderer.instances.length = 0
  renderer.controls.deferReady = false
  resetAdapterProbe()
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  localStorage.clear()
  resetLotStageAssignment()
  resetLotSelectedBuilding()
  renderer.instances.length = 0
  renderer.controls.deferReady = false
  resetAdapterProbe()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('World-First Lot-Native Next-Event Cadence V1 — App/Lot integration', () => {
  it('keeps an exact non-release stop on one mounted world, contains a stale repeat, and returns from the exact deep owner', async () => {
    const before = commissionedStudio('lot-native-next-event-script')
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('scriptReview')
    const projectId = expected.scriptDecision?.projectId
    if (projectId === undefined)
      throw new Error('setup: expected a screenplay decision')
    resetAdapterProbe()

    const { lot, canvas, view } = await renderStudio(before)
    const control = screen.getByTestId('lot-sim-to-next-event')

    // Two native activations in one React stack retain the old rendered closure. App's exact
    // object/ref claim must make the second one stale before it can call the adapter again.
    act(() => {
      ;(control as HTMLButtonElement).click()
      ;(control as HTMLButtonElement).click()
    })

    const rail = await screen.findByTestId('lot-next-event-rail')
    expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-exact')
    expect(screen.getByTestId('lot-next-event-identity')).toHaveTextContent(
      expected.scriptDecision!.title,
    )
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(view.destroyed).toBe(false)
    expect(view.snapshots.at(-1)?.week).toBe(expected.toWeek)
    expect(adapterProbe.calls).toHaveLength(1)
    expect(exportSaveJson(adapterProbe.calls[0]!)).toBe(exportSaveJson(before))
    expect(currentSessionBytes()).toBe(exportSaveJson(expected.next))

    act(() =>
      view.emitActivity('A renderer route finished after the event stop.'),
    )
    expect(
      screen.getByTestId('hollywood-activity-announcement'),
    ).toHaveTextContent('')
    expect(
      screen.queryByTestId('hollywood-activity-message'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-next-event-open-details'))
    expect(
      await screen.findByTestId(`script-card-${projectId}`),
    ).toHaveTextContent(expected.scriptDecision!.title)
    await waitFor(() =>
      expect(
        screen.getByTestId(`script-action-acceptScript-${projectId}`),
      ).toHaveFocus(),
    )
    expect(adapterProbe.calls).toHaveLength(1)

    fireEvent.click(screen.getByTestId('writers-room-back'))

    const returnedRail = await screen.findByTestId('lot-next-event-rail')
    expect(returnedRail).toHaveAttribute(
      'data-feedback-kind',
      'next-event-exact',
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'NEXT EVENT' }),
    ).toHaveFocus()
    expect(currentSessionBytes()).toBe(exportSaveJson(expected.next))
    expect(adapterProbe.calls).toHaveLength(1)

    expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute(
      'data-entry-focus',
      'next-event-reaction',
    )
    fireEvent.click(screen.getByTestId('lot-advance-week'))
    await waitFor(() =>
      expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute(
        'data-entry-focus',
        'studio-home',
      ),
    )
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
  })

  it('accepts a newly surfaced first draft in the mounted Lot with direct-adapter parity', async () => {
    const before = commissionedStudio('lot-native-script-review-event-accept')
    const stopped = advanceToNextEvent(before)
    const action = stopped.scriptDecision?.legalActions.find(
      (candidate) => candidate.kind === 'acceptScript',
    )
    if (stopped.stopReason !== 'scriptReview' || action === undefined) {
      throw new Error('setup: expected an actionable first-draft review')
    }
    const direct = runScriptProjectAction(stopped.next, action)
    if (!direct.ok) throw new Error(direct.error)
    resetAdapterProbe()

    const { lot, canvas, view } = await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    const worldAction = await screen.findByTestId(
      `lot-script-review-action-acceptScript-${action.projectId}`,
    )
    const deepAction = screen.getByTestId('lot-next-event-open-details')
    expectEarlierInDocument(worldAction, deepAction)
    expect(screen.getByTestId('lot-script-review-estimate')).toHaveTextContent('Est.')
    expect(screen.getByTestId('lot-script-review-announcement')).toBeEmptyDOMElement()

    fireEvent.click(worldAction)

    const feedback = await screen.findByTestId('lot-script-review-feedback')
    expect(feedback).toHaveAttribute('data-feedback-kind', 'success')
    expect(feedback).toHaveTextContent('Ready to package')
    expect(screen.getByTestId('lot-script-review-announcement')).toHaveTextContent(
      'Ready to package',
    )
    expect(feedback).not.toHaveAttribute('aria-live')
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(view.destroyed).toBe(false)
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
    expect(screen.queryByTestId('writers-room')).not.toBeInTheDocument()
    expect(adapterProbe.scriptCalls).toHaveLength(1)
    expect(exportSaveJson(adapterProbe.scriptCalls[0]!.state)).toBe(
      exportSaveJson(stopped.next),
    )
    expect(adapterProbe.scriptCalls[0]!.action).toEqual(action)
    expect(currentSessionBytes()).toBe(exportSaveJson(direct.next))
  })

  it('requests the legal final rewrite from a newly surfaced review and reports its exact base slot', async () => {
    const before = commissionedStudio('lot-native-script-review-event-rewrite')
    const stopped = advanceToNextEvent(before)
    const action = stopped.scriptDecision?.legalActions.find(
      (candidate) => candidate.kind === 'requestScriptRewrite',
    )
    if (stopped.stopReason !== 'scriptReview' || action === undefined) {
      throw new Error('setup: expected a legal final rewrite')
    }
    const direct = runScriptProjectAction(stopped.next, action)
    if (!direct.ok) throw new Error(direct.error)
    const expectedFacility = scriptProjectsBoard(direct.next).capacity.facilities
      .flatMap((facility) => facility.slots.map((slot) => ({ facility, slot })))
      .find(({ slot }) =>
        slot.occupant?.owner === 'script' &&
        slot.occupant.ownerId === action.projectId,
      )
    if (expectedFacility === undefined) throw new Error('setup: expected rewrite occupancy')
    expect(expectedFacility.facility.facilityId).toBe('facility-development-casting')
    resetAdapterProbe()

    const { lot, canvas, view } = await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    fireEvent.click(await screen.findByTestId(
      `lot-script-review-action-requestScriptRewrite-${action.projectId}`,
    ))

    const facts = await screen.findByTestId('lot-script-review-rewrite-success')
    expect(facts).toHaveTextContent(expectedFacility.facility.facilityName)
    expect(facts).toHaveTextContent(`Week ${
      scriptProjectsBoard(direct.next).sections.inDevelopment[0]!.dueWeek
    }`)
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(view.destroyed).toBe(false)
    expect(adapterProbe.scriptCalls).toHaveLength(1)
    expect(currentSessionBytes()).toBe(exportSaveJson(direct.next))
  })

  it('uses and repaints the operational Annex only when the accepted rewrite owns its exact slot', async () => {
    const pending = pendingAnnexRewriteReview('lot-native-script-review-annex-rewrite')
    const decision = scriptProjectsBoard(pending).nextDecision
    const action = decision?.legalActions.find(
      (candidate) => candidate.kind === 'requestScriptRewrite',
    )
    if (decision === null || action === undefined) {
      throw new Error('setup: expected an Annex-bound rewrite action')
    }
    const direct = runScriptProjectAction(pending, action)
    if (!direct.ok) throw new Error(direct.error)
    const occupancy = scriptProjectsBoard(direct.next).capacity.facilities
      .flatMap((facility) => facility.slots.map((slot) => ({ facility, slot })))
      .find(({ slot }) =>
        slot.occupant?.owner === 'script' &&
        slot.occupant.ownerId === action.projectId,
      )
    if (occupancy === undefined) throw new Error('setup: expected exact rewrite occupancy')
    expect(occupancy.facility.facilityId).toBe('facility-development-casting-annex')
    resetAdapterProbe()

    await renderStudio(pending)
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    fireEvent.click(await screen.findByTestId(
      `lot-script-review-action-requestScriptRewrite-${action.projectId}`,
    ))

    const facts = await screen.findByTestId('lot-script-review-rewrite-success')
    expect(facts).toHaveTextContent('Development & Casting Annex')
    expect(screen.getByTestId('lot-nav-expansion-state')).toHaveTextContent('Working')
    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    expect(await screen.findByTestId('lot-annex-current-work')).toHaveTextContent('Working')
    expect(screen.getByTestId('lot-annex-current-work')).toHaveTextContent(decision.title)
    expect(adapterProbe.scriptCalls).toHaveLength(1)
    expect(currentSessionBytes()).toBe(exportSaveJson(direct.next))
  })

  it('opens an already-pending final review from Development, returns by exact identity, and accepts it in the same Lot', async () => {
    const pending = pendingFinalDraftReview('lot-native-script-review-pending-final')
    const decision = scriptProjectsBoard(pending).nextDecision
    const action = decision?.legalActions.find(
      (candidate) => candidate.kind === 'acceptScript',
    )
    if (decision === null || action === undefined) {
      throw new Error('setup: expected a final-draft accept action')
    }
    const direct = runScriptProjectAction(pending, action)
    if (!direct.ok) throw new Error(direct.error)
    resetAdapterProbe()

    const { lot, canvas, view } = await renderStudio(pending)
    const pendingBytes = currentSessionBytes()
    expect(screen.getByTestId('lot-sim-to-next-event')).toBeDisabled()
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(currentSessionBytes()).toBe(pendingBytes)
    expect(await screen.findByTestId('lot-script-review-state')).toHaveTextContent('Final draft')
    expect(
      screen.queryByTestId(`lot-script-review-action-requestScriptRewrite-${action.projectId}`),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-script-review-open-details'))
    expect(await screen.findByTestId(`script-card-${action.projectId}`)).toHaveTextContent(
      decision.title,
    )
    fireEvent.click(screen.getByTestId('writers-room-back'))
    expect(currentSessionBytes()).toBe(pendingBytes)
    expect(await screen.findByTestId('studio-lot-screen')).toHaveAttribute(
      'data-entry-focus',
      'script-review',
    )
    expect(screen.getByTestId('lot-script-review-heading')).toHaveTextContent(decision.title)
    const returnedLot = screen.getByTestId('studio-lot-screen')
    const returnedCanvas = screen.getByTestId('studio-lot-canvas')
    const returnedView = renderer.instances.at(-1)!
    expect(returnedLot).not.toBe(lot)
    expect(returnedCanvas).not.toBe(canvas)
    expect(returnedView).not.toBe(view)

    fireEvent.click(screen.getByTestId(
      `lot-script-review-action-acceptScript-${action.projectId}`,
    ))
    expect(await screen.findByTestId('lot-script-review-feedback')).toHaveTextContent(
      'Ready to package',
    )
    expect(screen.getByTestId('studio-lot-screen')).toBe(returnedLot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(returnedCanvas)
    expect(renderer.instances.at(-1)).toBe(returnedView)
    expect(returnedView.destroyed).toBe(false)
    expect(adapterProbe.scriptCalls).toHaveLength(1)
    expect(currentSessionBytes()).toBe(exportSaveJson(direct.next))
  })

  it('rebuilds an imported pending review only after the player selects Development in the replacement Lot', async () => {
    const initial = commissionedStudio('lot-native-script-review-import-origin')
    const replacement = pendingFinalDraftReview('lot-native-script-review-import-replacement')
    const decision = scriptProjectsBoard(replacement).nextDecision
    if (decision === null) throw new Error('setup: imported review is absent')
    resetAdapterProbe()

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
    expect(screen.queryByTestId('lot-script-review-panel')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-sim-to-next-event')).toBeDisabled()
    expect(currentSessionBytes()).toBe(exportSaveJson(replacement))

    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(await screen.findByTestId('lot-script-review-heading')).toHaveTextContent(
      decision.title,
    )
    expect(screen.getByTestId('lot-script-review-state')).toHaveTextContent('Final draft')
    expect(currentSessionBytes()).toBe(exportSaveJson(replacement))
    expect(adapterProbe.scriptCalls).toHaveLength(0)
  })

  it('returns neutral instead of substituting the next screenplay after the focused deep review is accepted', async () => {
    const pending = twoPendingReviews('lot-native-script-review-no-substitution')
    const board = scriptProjectsBoard(pending)
    const focused = board.nextDecision
    const replacement = board.sections.needsReview[1]
    if (focused === null || replacement === undefined) {
      throw new Error('setup: expected focused and replacement screenplay reviews')
    }
    resetAdapterProbe()

    await renderStudio(pending)
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    fireEvent.click(await screen.findByTestId('lot-script-review-open-details'))
    fireEvent.click(await screen.findByTestId(
      `script-action-acceptScript-${focused.projectId}`,
    ))
    fireEvent.click(screen.getByTestId('writers-room-back'))

    expect(await screen.findByTestId('studio-lot-screen')).toHaveAttribute(
      'data-entry-focus',
      'studio-home',
    )
    expect(screen.queryByTestId('lot-script-review-panel')).not.toBeInTheDocument()
    // No REVIEW surface may substitute the next screenplay. The picture-guidance card is
    // not a review surface: naming the studio's current picture is the engine's own
    // journey projection, and it is excluded here rather than being asserted away.
    expect(
      screen
        .queryAllByRole('heading', { name: replacement.title })
        .filter((heading) => heading.closest('[data-testid="lot-picture-guidance"]') === null),
    ).toEqual([])
    expect(screen.getByTestId('lot-sim-to-next-event')).toBeDisabled()
  })

  it('keeps the pending screenplay action complete when the Hollywood renderer fails', async () => {
    const pending = pendingFirstDraftReview('lot-native-script-review-renderer-failure')
    const action = scriptProjectsBoard(pending).nextDecision?.legalActions[0]
    if (action === undefined) throw new Error('setup: expected a screenplay action')
    const direct = runScriptProjectAction(pending, action)
    if (!direct.ok) throw new Error(direct.error)
    resetAdapterProbe()

    const { lot, canvas, view } = await renderStudio(pending)
    act(() => view.fail())
    expect(await screen.findByTestId('lot-canvas-fallback')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    fireEvent.click(await screen.findByTestId(
      `lot-script-review-action-${action.kind}-${action.projectId}`,
    ))

    expect(await screen.findByTestId('lot-script-review-feedback')).toHaveAttribute(
      'data-feedback-kind',
      'success',
    )
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(currentSessionBytes()).toBe(exportSaveJson(direct.next))
  })

  it('keeps the same Lot-native screenplay review and action in Classic semantic fallback', async () => {
    setOperationHollywoodOverride(false)
    const pending = pendingFirstDraftReview('lot-native-script-review-classic')
    const action = scriptProjectsBoard(pending).nextDecision?.legalActions[0]
    if (action === undefined) throw new Error('setup: expected a screenplay action')
    const direct = runScriptProjectAction(pending, action)
    if (!direct.ok) throw new Error(direct.error)
    resetAdapterProbe()

    const { lot, canvas, view } = await renderStudio(pending)
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(await screen.findByTestId('lot-script-review-context')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId(
      `lot-script-review-action-${action.kind}-${action.projectId}`,
    ))

    expect(await screen.findByTestId('lot-script-review-feedback')).toHaveAttribute(
      'data-feedback-kind',
      'success',
    )
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(currentSessionBytes()).toBe(exportSaveJson(direct.next))
  })

  it('contains same-stack duplicate screenplay activation when the Engine rejects', async () => {
    const pending = pendingFirstDraftReview('lot-native-script-review-rejection-tail')
    const action = scriptProjectsBoard(pending).nextDecision?.legalActions[0]
    if (action === undefined) throw new Error('setup: expected a screenplay action')
    resetAdapterProbe()
    adapterProbe.rejectScriptAction = true
    await renderStudio(pending)
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    const control = await screen.findByTestId(
      `lot-script-review-action-${action.kind}-${action.projectId}`,
    )

    act(() => {
      ;(control as HTMLButtonElement).click()
      ;(control as HTMLButtonElement).click()
    })

    expect(adapterProbe.scriptCalls).toHaveLength(1)
    expect(await screen.findByTestId('lot-script-review-feedback')).toHaveTextContent(
      'test-only screenplay action rejection',
    )
    expect(currentSessionBytes()).toBe(exportSaveJson(pending))
  })

  it('restores the exact next-event screenplay ceremony after Engine rejection and permits a fresh retry', async () => {
    const before = commissionedStudio('lot-native-script-review-event-rejection')
    const stopped = advanceToNextEvent(before)
    const action = stopped.scriptDecision?.legalActions[0]
    if (stopped.stopReason !== 'scriptReview' || action === undefined) {
      throw new Error('setup: expected an event-owned screenplay action')
    }
    resetAdapterProbe()
    adapterProbe.rejectScriptAction = true
    await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    const actionId = `lot-script-review-action-${action.kind}-${action.projectId}`
    fireEvent.click(await screen.findByTestId(actionId))

    expect(screen.getByTestId('lot-next-event-rail')).toHaveAttribute(
      'data-feedback-kind',
      'next-event-exact',
    )
    expect(screen.getByTestId('lot-script-review-feedback')).toHaveTextContent(
      'test-only screenplay action rejection',
    )
    expect(adapterProbe.scriptCalls).toHaveLength(1)
    expect(currentSessionBytes()).toBe(exportSaveJson(stopped.next))

    await new Promise((resolve) => setTimeout(resolve, 0))
    adapterProbe.rejectScriptAction = false
    fireEvent.click(screen.getByTestId(actionId))
    expect(await screen.findByTestId('lot-script-review-feedback')).toHaveAttribute(
      'data-feedback-kind',
      'success',
    )
    expect(adapterProbe.scriptCalls).toHaveLength(2)
  })

  it('does not replay an already-Operational Annex announcement across an unchanged exact deep return', async () => {
    const before = operationalAnnexCommissionedStudio(
      'lot-native-next-event-operational-unchanged-return',
    )
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('scriptReview')
    expect(expected.constructionCompletion).toBeNull()
    expect(studioDevelopment(expected.next).status).toBe('operational')
    resetAdapterProbe()
    await renderStudio(before)

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    await screen.findByTestId('lot-next-event-rail')
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')

    fireEvent.click(screen.getByTestId('lot-next-event-open-details'))
    await screen.findByTestId('writers-room')
    fireEvent.click(screen.getByTestId('writers-room-back'))

    const returnedRail = await screen.findByTestId('lot-next-event-rail')
    expect(returnedRail).toHaveAttribute(
      'data-feedback-kind',
      'next-event-exact',
    )
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('consumes a script/completion co-event through a deep state successor without replaying either Annex announcement', async () => {
    const before = scriptReviewConstructionCoevent(
      'lot-native-next-event-script-construction-coevent',
    )
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('scriptReview')
    expect(expected.weeks).toBe(1)
    expect(expected.constructionCompletion?.completedWeek).toBe(expected.toWeek)
    expect(studioDevelopment(expected.next).status).toBe('operational')
    const projectId = expected.scriptDecision?.projectId
    const acceptAction = expected.scriptDecision?.legalActions.find(
      (action) => action.kind === 'acceptScript',
    )
    if (projectId === undefined || acceptAction === undefined) {
      throw new Error('setup: expected an actionable screenplay decision')
    }
    const accepted = runScriptProjectAction(expected.next, acceptAction)
    if (!accepted.ok) throw new Error(accepted.error)
    resetAdapterProbe()
    await renderStudio(before)

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    await screen.findByTestId('lot-next-event-rail')
    expect(screen.getAllByTestId('annex-completion-summary')).toHaveLength(1)
    expect(screen.getByTestId('annex-completion-summary')).toHaveFocus()
    expect(screen.getByTestId('lot-next-event-identity')).toHaveTextContent(
      expected.scriptDecision!.title,
    )
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')

    fireEvent.click(screen.getByTestId('lot-next-event-open-details'))
    const accept = await screen.findByTestId(
      `script-action-acceptScript-${projectId}`,
    )
    await waitFor(() => expect(accept).toHaveFocus())
    fireEvent.click(accept)
    const openPackage = await screen.findByTestId(
      `script-action-openPackage-${projectId}`,
    )
    await waitFor(() => expect(openPackage).toHaveFocus())
    expect(screen.getByTestId(`script-status-${projectId}`)).toHaveTextContent(
      'Ready to package',
    )
    expect(currentSessionBytes()).toBe(exportSaveJson(accepted.next))

    fireEvent.click(screen.getByTestId('writers-room-back'))
    expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute(
      'data-entry-focus',
      'studio-home',
    )
    await waitFor(() =>
      expect(screen.getByTestId('lot-studio-heading')).toHaveFocus(),
    )
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')
    expect(currentSessionBytes()).toBe(exportSaveJson(accepted.next))
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('cancels a held rail action across renderer failure while preserving fresh semantic fallback', async () => {
    const before = commissionedStudio(
      'lot-native-next-event-renderer-failure-tail',
    )
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('scriptReview')
    resetAdapterProbe()
    const { view } = await renderStudio(before)

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    const deep = await screen.findByTestId('lot-next-event-open-details')
    fireEvent.pointerDown(deep)
    act(() => view.fail())
    await screen.findByTestId('lot-canvas-fallback')
    fireEvent.mouseDown(deep)
    fireEvent.click(deep, { detail: 1 })

    expect(screen.getByTestId('lot-next-event-rail')).toBeInTheDocument()
    expect(screen.queryByTestId('writers-room')).not.toBeInTheDocument()
    expect(adapterProbe.calls).toHaveLength(1)

    await new Promise((resolve) => window.setTimeout(resolve, 0))
    fireEvent.click(screen.getByTestId('lot-next-event-open-details'), {
      detail: 0,
    })
    expect(await screen.findByTestId('writers-room')).toBeInTheDocument()
  })

  it('disables the sole native control with the current decision reason while preserving one-week play', async () => {
    const before = commissionedStudio('lot-native-next-event-eligibility')
    const stopped = advanceToNextEvent(before)
    expect(stopped.stopReason).toBe('scriptReview')
    resetAdapterProbe()
    await renderStudio(stopped.next)

    const control = screen.getByTestId('lot-sim-to-next-event')
    expect(control).toBeDisabled()
    expect(control).toHaveAttribute(
      'aria-describedby',
      'lot-next-event-disabled-reason',
    )
    expect(
      screen.getByTestId('lot-next-event-disabled-reason'),
    ).toHaveTextContent(
      `Select Development and review ${stopped.scriptDecision!.title} in the live Studio Lot before simming to another event.`,
    )
    expect(screen.getByTestId('lot-advance-week')).toBeEnabled()
    fireEvent.click(control)
    expect(adapterProbe.calls).toHaveLength(0)
  })

  it('names the exact pending production problem when next-event cadence is disabled', async () => {
    const stopped = advanceToNextEvent(
      stage7DecisionBefore('lot-native-next-event-production-eligibility'),
    )
    const decision = stopped.productionDecision
    if (decision?.command === null || decision === null) {
      throw new Error('setup: expected one pending production problem')
    }
    resetAdapterProbe()
    await renderStudio(stopped.next)

    const control = screen.getByTestId('lot-sim-to-next-event')
    const reason = screen.getByTestId('lot-next-event-disabled-reason')
    expect(control).toBeDisabled()
    expect(reason).toHaveTextContent(decision.title)
    expect(reason).toHaveTextContent(
      decision.blocker?.headline ?? decision.command.label,
    )
    expect(reason).toHaveTextContent(decision.currentFacility)
    fireEvent.click(control)
    expect(adapterProbe.calls).toHaveLength(0)
  })

  it('rejects pointer-cancel compatibility recapture while keeping a fresh virtual activation', async () => {
    const before = commissionedStudio(
      'lot-native-next-event-pointer-cancel-tail',
    )
    resetAdapterProbe()
    await renderStudio(before)
    const control = screen.getByTestId('lot-sim-to-next-event')

    fireEvent.pointerDown(control)
    fireEvent.pointerCancel(control)
    await new Promise((resolve) => window.setTimeout(resolve, 5))
    fireEvent.mouseDown(control)
    fireEvent.click(control, { detail: 1 })
    expect(adapterProbe.calls).toHaveLength(0)

    fireEvent.click(control, { detail: 0 })
    await screen.findByTestId('lot-next-event-rail')
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('rejects a delayed compatibility tail after pointer blur and accepts a fresh physical boundary', async () => {
    const before = commissionedStudio(
      'lot-native-next-event-pointer-blur-tail',
    )
    resetAdapterProbe()
    await renderStudio(before)
    const control = screen.getByTestId('lot-sim-to-next-event')

    fireEvent.pointerDown(control)
    fireEvent.blur(control)
    await new Promise((resolve) => window.setTimeout(resolve, 5))
    fireEvent.mouseDown(control)
    fireEvent.click(control, { detail: 1 })
    expect(adapterProbe.calls).toHaveLength(0)

    fireEvent.pointerDown(control)
    fireEvent.click(control, { detail: 1 })
    await screen.findByTestId('lot-next-event-rail')
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('rejects a delayed hidden-tab compatibility tail and accepts a later fresh pointer boundary', async () => {
    const before = commissionedStudio('lot-native-next-event-hidden-tail')
    resetAdapterProbe()
    await renderStudio(before)
    let hidden = false
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    const control = screen.getByTestId('lot-sim-to-next-event')

    fireEvent.pointerDown(control)
    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    await new Promise((resolve) => window.setTimeout(resolve, 5))
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    fireEvent.mouseDown(control)
    fireEvent.click(control, { detail: 1 })
    expect(adapterProbe.calls).toHaveLength(0)

    await new Promise((resolve) => window.setTimeout(resolve, 5))
    fireEvent.pointerDown(control)
    fireEvent.click(control, { detail: 1 })
    await screen.findByTestId('lot-next-event-rail')
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('cannot recapture a delayed pointer tail onto an authoritative replacement state', async () => {
    const before = limitBefore('lot-native-next-event-replacement-tail')
    resetAdapterProbe()
    await renderStudio(before)
    fireEvent.pointerDown(screen.getByTestId('lot-sim-to-next-event'))
    fireEvent.click(screen.getByTestId('lot-advance-week'))

    const replacementControl = screen.getByTestId('lot-sim-to-next-event')
    fireEvent.mouseDown(replacementControl)
    fireEvent.click(replacementControl, { detail: 1 })
    expect(adapterProbe.calls).toHaveLength(0)

    await new Promise((resolve) => window.setTimeout(resolve, 0))
    fireEvent.click(replacementControl, { detail: 0 })
    await screen.findByTestId('lot-next-event-rail')
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('revalidates an exact deep route against current truth and demotes stale detail without leaving the world', async () => {
    const before = commissionedStudio('lot-native-next-event-stale-deep-route')
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('scriptReview')
    resetAdapterProbe()
    const { lot, canvas, view } = await renderStudio(before)

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    await screen.findByTestId('lot-next-event-open-details')
    const acceptedBytes = exportSaveJson(expected.next)
    await waitFor(() => expect(currentSessionBytes()).toBe(acceptedBytes))

    adapterProbe.rejectCurrentDecision = true
    fireEvent.click(screen.getByTestId('lot-next-event-open-details'))

    const rail = await screen.findByTestId('lot-next-event-rail')
    expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-neutral')
    expect(screen.getByTestId('lot-next-event-stop-message')).toHaveTextContent(
      'Studio event details changed. Review the current lot.',
    )
    expect(
      screen.queryByTestId('lot-next-event-open-details'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('writers-room')).not.toBeInTheDocument()
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(currentSessionBytes()).toBe(acceptedBytes)
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('physically orients an exact Stage 7 decision and keeps the world command before either deep route', async () => {
    const before = stage7DecisionBefore('lot-native-next-event-stage-7')
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('productionDecision')
    expect(expected.weeks).toBeGreaterThan(0)
    const decision = expected.productionDecision
    if (decision?.command === null || decision === null) {
      throw new Error('setup: expected one exact Stage 7 command')
    }
    const operation = (
      studioLotSnapshot(expected.next).productionOperations ?? []
    ).find((candidate) => candidate.productionId === decision.productionId)
    expect(operation?.locationBuildingId).toBe('stage-a')
    resetAdapterProbe()

    const { view } = await renderStudio(before)
    const selectionsBefore = view.productionSelections.length
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))

    await screen.findByTestId(
      `hollywood-production-command-${decision.command.kind}`,
    )
    await waitFor(() =>
      expect(view.productionSelections.slice(selectionsBefore)).toContain(
        decision.productionId,
      ),
    )
    const command = screen.getByTestId(
      `hollywood-production-command-${decision.command.kind}`,
    )
    const railDeep = screen.getByTestId('lot-next-event-open-details')
    expect(
      screen.getByTestId('hollywood-stage7-production-heading'),
    ).toHaveTextContent(decision.title)
    expect(screen.getByTestId('lot-nav-stage-a')).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(
      screen.getByTestId('lot-next-event-reason-detail'),
    ).toHaveTextContent(decision.blocker?.headline ?? decision.statusLabel)
    expectEarlierInDocument(command, railDeep)
    expect(
      screen.queryByTestId(
        `hollywood-open-production-details-${decision.productionId}`,
      ),
    ).not.toBeInTheDocument()
    expect(adapterProbe.calls).toHaveLength(1)

    fireEvent.click(railDeep)
    const boardCommand = await screen.findByTestId(
      `production-command-${decision.command.kind}-${decision.productionId}`,
    )
    await waitFor(() => expect(boardCommand).toHaveFocus())
    expect(
      screen.getByTestId(`active-${decision.productionId}`),
    ).toHaveTextContent(decision.title)
  })

  it('dismisses an exact Stage 7 reaction into a neutral world instead of retaining event-owned selection', async () => {
    const before = stage7DecisionBefore(
      'lot-native-next-event-stage-7-dismiss',
    )
    const expected = advanceToNextEvent(before)
    const decision = expected.productionDecision
    if (decision?.command === null || decision === null) {
      throw new Error('setup: expected one exact Stage 7 command')
    }
    resetAdapterProbe()
    const { view } = await renderStudio(before)

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    await screen.findByTestId('hollywood-stage7-production-heading')
    expect(view.productionSelections).toContain(decision.productionId)

    fireEvent.click(screen.getByTestId('lot-next-event-dismiss'))
    await waitFor(() =>
      expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument(),
    )
    expect(
      screen.queryByTestId('hollywood-stage7-production-heading'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-production-idle')).toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `hollywood-open-production-details-${decision.productionId}`,
      ),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-sim-to-next-event')).toBeDisabled()
    expect(screen.getByTestId('lot-studio-heading')).toHaveFocus()
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('consumes one exact event world command before Engine dispatch and rejects its same-stack tail', async () => {
    const before = stage7DecisionBefore(
      'lot-native-next-event-stage-7-world-command',
    )
    const stopped = advanceToNextEvent(before)
    const command = stopped.productionDecision?.command
    if (command === null || command === undefined) {
      throw new Error('setup: expected one exact event command')
    }
    const commanded = runProductionCommand(stopped.next, command)
    if (!commanded.ok) throw new Error(commanded.error)
    resetAdapterProbe()
    await renderStudio(before)

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    const worldCommand = await screen.findByTestId(
      `hollywood-production-command-${command.kind}`,
    )
    act(() => {
      ;(worldCommand as HTMLButtonElement).click()
      ;(worldCommand as HTMLButtonElement).click()
    })

    await waitFor(() =>
      expect(currentSessionBytes()).toBe(exportSaveJson(commanded.next)),
    )
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('retains the exact event world command on Classic Lot rollback without inventing Hollywood presence', async () => {
    const before = stage7DecisionBefore(
      'lot-native-next-event-classic-production-command',
    )
    const stopped = advanceToNextEvent(before)
    const command = stopped.productionDecision?.command
    if (command === null || command === undefined) {
      throw new Error('setup: expected one exact Classic-compatible command')
    }
    const commanded = runProductionCommand(stopped.next, command)
    if (!commanded.ok) throw new Error(commanded.error)
    resetAdapterProbe()
    setOperationHollywoodOverride(false)
    await renderStudio(before)

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    const worldCommand = await screen.findByTestId(
      `hollywood-production-command-${command.kind}`,
    )
    const deep = screen.getByTestId('lot-next-event-open-details')
    expectEarlierInDocument(worldCommand, deep)
    expect(screen.getByTestId('studio-lot-screen')).not.toHaveClass(
      'lot-hollywood',
    )
    fireEvent.click(worldCommand)
    await waitFor(() =>
      expect(currentSessionBytes()).toBe(exportSaveJson(commanded.next)),
    )
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
  })

  it('keeps an exact Stage 12 decision semantic without painting or substituting the Stage 7 production', async () => {
    const before = stage12DecisionBefore('lot-native-next-event-stage-12')
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('productionDecision')
    expect(expected.weeks).toBeGreaterThan(0)
    const decision = expected.productionDecision
    if (decision?.command === null || decision === null) {
      throw new Error('setup: expected one exact Stage 12 command')
    }
    const operations =
      studioLotSnapshot(expected.next).productionOperations ?? []
    const stage12 = operations.find(
      (candidate) => candidate.productionId === decision.productionId,
    )
    const stage7 = operations.find(
      (candidate) => candidate.locationBuildingId === 'stage-a',
    )
    expect(stage12?.locationBuildingId).toBe('stage-b')
    if (stage7 === undefined)
      throw new Error('setup: expected the earlier Stage 7 production')
    resetAdapterProbe()

    const { view } = await renderStudio(before)
    const selectionsBefore = view.productionSelections.length
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))

    const command = await screen.findByTestId(
      `hollywood-production-command-${decision.command.kind}`,
    )
    const railDeep = screen.getByTestId('lot-next-event-open-details')
    expect(screen.getByTestId('hollywood-stage-12-fallback')).toHaveTextContent(
      `${decision.currentFacility} is authoritative`,
    )
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent(
      decision.title,
    )
    expect(
      screen.getByTestId(
        `hollywood-select-production-${decision.productionId}`,
      ),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByTestId(`hollywood-select-production-${stage7.productionId}`),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.queryByTestId('hollywood-stage7-production-heading'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `hollywood-open-production-details-${decision.productionId}`,
      ),
    ).not.toBeInTheDocument()
    expect(view.productionSelections.slice(selectionsBefore)).toEqual([])
    expect(screen.getByTestId('lot-nav-stage-a')).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByTestId('lot-nav-stage-b')).not.toHaveAttribute(
      'aria-current',
    )
    expectEarlierInDocument(command, railDeep)
    expect(adapterProbe.calls).toHaveLength(1)

    fireEvent.click(railDeep)
    const boardCommand = await screen.findByTestId(
      `production-command-${decision.command.kind}-${decision.productionId}`,
    )
    await waitFor(() => expect(boardCommand).toHaveFocus())
    expect(
      screen.getByTestId(`active-${decision.productionId}`),
    ).toHaveTextContent(decision.title)
  })

  it('clears an unrelated selected production when a neutral event becomes the sole orientation', async () => {
    const before = stage12DecisionBefore(
      'lot-native-next-event-neutral-sole-orientation',
    )
    const operations = studioLotSnapshot(before).productionOperations ?? []
    if (operations.length < 2)
      throw new Error('setup: expected two selectable productions')
    const selected = operations[0]!
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('productionDecision')
    resetAdapterProbe()
    adapterProbe.transform = (result) => ({
      ...result,
      summary: { ...result.summary, fromWeek: result.summary.fromWeek + 1 },
    })
    await renderStudio(before)

    fireEvent.click(
      screen.getByTestId(
        `hollywood-select-production-${selected.productionId}`,
      ),
    )
    expect(
      screen.getByTestId('hollywood-current-production'),
    ).toHaveTextContent(selected.title)
    expect(
      screen.getByTestId(`hollywood-task-status-${selected.productionId}`),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    const rail = await screen.findByTestId('lot-next-event-rail')
    expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-neutral')
    await waitFor(() =>
      expect(
        screen.getByTestId('hollywood-production-idle'),
      ).toBeInTheDocument(),
    )
    expect(
      screen.queryByTestId('hollywood-current-production'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(`hollywood-task-status-${selected.productionId}`),
    ).not.toBeInTheDocument()
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('keeps a generic contract stop spatially neutral, claims no person, and focuses the Roster heading', async () => {
    const before = newFoundedGame('lot-native-next-event-contract', 52)
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('renewalWindow')
    resetAdapterProbe()

    const { lot, view } = await renderStudio(before)
    const selectedBefore = view.selected.length
    const productionsBefore = view.productionSelections.length
    const publicityBefore = view.publicitySelections
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))

    const rail = await screen.findByTestId('lot-next-event-rail')
    expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-exact')
    expect(screen.getByTestId('lot-next-event-identity')).toHaveTextContent(
      'A renewal window opened',
    )
    expect(
      screen.getByTestId('lot-next-event-reason-detail'),
    ).toHaveTextContent('No person identity is inferred.')
    for (const contract of before.contracts) {
      const name = before.talent.find(
        (candidate) => candidate.id === contract.talentId,
      )?.name
      if (name !== undefined) expect(rail).not.toHaveTextContent(name)
    }
    expect(
      lot.querySelector('[data-testid^="lot-nav-"][aria-current="true"]'),
    ).toBeNull()
    expect(
      lot.querySelector(
        '[data-testid^="hollywood-select-person-"][aria-pressed="true"]',
      ),
    ).toBeNull()
    expect(view.selected.slice(selectedBefore)).toEqual([])
    expect(view.productionSelections.slice(productionsBefore)).toEqual([])
    expect(view.publicitySelections).toBe(publicityBefore)
    expect(adapterProbe.calls).toHaveLength(1)

    fireEvent.click(screen.getByTestId('lot-next-event-open-details'))
    const rosterHeading = await screen.findByTestId('roster-heading')
    await waitFor(() => expect(rosterHeading).toHaveFocus())
  })

  it('orients a cash stop to Administration and focuses the supporting Finances section', async () => {
    const before = newFoundedGame('lot-native-next-event-cash', 400)
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('cashNegative')
    const secondExpected = advanceToNextEvent(expected.next)
    expect(secondExpected.released).toHaveLength(0)
    resetAdapterProbe()

    const { view } = await renderStudio(before)
    const publicityBefore = view.publicitySelections
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))

    await screen.findByTestId('lot-next-event-rail')
    expect(screen.getByTestId('lot-next-event-identity')).toHaveTextContent(
      'Studio cash crossed below $0',
    )
    expect(
      screen.getByTestId('lot-next-event-reason-detail'),
    ).toHaveTextContent('Administration')
    await waitFor(() =>
      expect(view.publicitySelections).toBeGreaterThan(publicityBefore),
    )
    expect(screen.getByTestId('lot-nav-admin')).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(adapterProbe.calls).toHaveLength(1)

    fireEvent.click(screen.getByTestId('lot-next-event-open-details'))
    const finances = await screen.findByTestId('dashboard-finances-heading')
    await waitFor(() => expect(finances).toHaveFocus())

    fireEvent.click(screen.getByTestId('back-to-studio-lot'))
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 2, name: 'NEXT EVENT' }),
      ).toHaveFocus(),
    )
    expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute(
      'data-entry-focus',
      'next-event-reaction',
    )

    // Renderer readiness deliberately seals any pre-ready gesture through one task.
    // After that boundary, a fresh primary pointer start must drive the same mounted Lot.
    await new Promise((resolve) => window.setTimeout(resolve, 5))
    const successorControl = screen.getByTestId('lot-sim-to-next-event')
    fireEvent.pointerDown(successorControl)
    fireEvent.click(successorControl, { detail: 1 })
    await waitFor(() => expect(adapterProbe.calls).toHaveLength(2))
    const successorRail = await screen.findByTestId('lot-next-event-rail')
    expect(successorRail).toHaveAttribute(
      'data-feedback-kind',
      secondExpected.stopReason === 'limit'
        ? 'next-event-neutral'
        : 'next-event-exact',
    )
    if (secondExpected.stopReason !== 'limit') {
      expect(
        screen.getByRole('heading', { level: 2, name: 'NEXT EVENT' }),
      ).toHaveFocus()
      expect(screen.getByTestId('lot-studio-heading')).not.toHaveFocus()
    }
    expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute(
      'data-entry-focus',
      'next-event-reaction',
    )
    expect(currentSessionBytes()).toBe(exportSaveJson(secondExpected.next))
  })

  it('accepts only neutral final facts when the primary receipt is malformed and retains one independently valid completion', async () => {
    const before = constructionBefore(
      'lot-native-next-event-neutral-completion',
    )
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('constructionCompleted')
    expect(expected.constructionCompletion).not.toBeNull()
    resetAdapterProbe()
    adapterProbe.transform = (result) => ({
      ...result,
      summary: {
        ...result.summary,
        fromWeek: result.summary.fromWeek + 1,
      },
    })

    const { lot, canvas, view } = await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))

    const rail = await screen.findByTestId('lot-next-event-rail')
    expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-neutral')
    expect(screen.getAllByTestId('annex-completion-summary')).toHaveLength(1)
    expect(screen.getByTestId('annex-completion-summary')).toHaveFocus()
    expect(
      screen.queryByTestId('lot-next-event-accounting'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('lot-next-event-identity'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('lot-next-event-open-details'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(currentSessionBytes()).toBe(exportSaveJson(expected.next))

    fireEvent.click(screen.getByTestId('lot-next-event-dismiss'))
    expect(
      screen.queryByTestId('annex-completion-summary'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('drops a malformed completion before non-release suppression or focus ownership', async () => {
    const before = constructionBefore(
      'lot-native-next-event-invalid-completion',
    )
    const expected = advanceToNextEvent(before)
    expect(expected.constructionCompletion).not.toBeNull()
    resetAdapterProbe()
    adapterProbe.transform = (result) => ({
      ...result,
      constructionCompletion: {
        ...result.constructionCompletion!,
        completedWeek: result.toWeek + 1,
      },
    })

    await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))

    const rail = await screen.findByTestId('lot-next-event-rail')
    expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-neutral')
    expect(
      screen.queryByTestId('annex-completion-summary'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')
    expect(
      screen.getByTestId('lot-next-event-neutral-announcement'),
    ).toBeInTheDocument()
    expect(currentSessionBytes()).toBe(exportSaveJson(expected.next))
    expect(adapterProbe.calls).toHaveLength(1)

    fireEvent.click(screen.getByTestId('lot-next-event-dismiss'))
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')
  })

  it('renders the exact 520-week guard as neutral and never fabricates a deep event target', async () => {
    const before = limitBefore('lot-native-next-event-limit')
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('limit')
    expect(expected.weeks).toBe(520)
    expect(expected.guardHit).toBe(true)
    resetAdapterProbe()
    const { lot, canvas, view } = await renderStudio(before)

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))

    const rail = await screen.findByTestId('lot-next-event-rail')
    expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-neutral')
    expect(screen.getByTestId('lot-next-event-stop-message')).toHaveTextContent(
      expected.stopMessage,
    )
    expect(
      screen.queryByTestId('lot-next-event-accounting'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('lot-next-event-identity'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('lot-next-event-open-details'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(currentSessionBytes()).toBe(exportSaveJson(expected.next))
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('keeps the canonical release route, owns a simultaneous completion once, and returns receipt-free to the Lot control', async () => {
    const before = releaseConstructionCoevent(
      'lot-native-next-event-release-coevent',
    )
    const expected = advanceToNextEvent(before)
    expect(expected.stopReason).toBe('release')
    expect(expected.released).toHaveLength(1)
    expect(expected.constructionCompletion?.completedWeek).toBe(expected.toWeek)
    resetAdapterProbe()
    await renderStudio(before)

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))

    expect(await screen.findByTestId('newspaper-reveal')).toBeInTheDocument()
    expect(screen.getAllByTestId('annex-completion-summary')).toHaveLength(1)
    expect(screen.getByTestId('annex-completion-summary')).toHaveFocus()
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
    expect(adapterProbe.calls).toHaveLength(1)

    fireEvent.click(screen.getByTestId('newspaper-continue'))
    expect(await screen.findByTestId('release-list')).toBeInTheDocument()
    expect(
      screen.queryByTestId('annex-completion-summary'),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('release-continue'))

    await screen.findByTestId('studio-lot-screen')
    await waitFor(() =>
      expect(screen.getByTestId('lot-sim-to-next-event')).toHaveFocus(),
    )
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('annex-completion-summary'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')
    expect(currentSessionBytes()).toBe(exportSaveJson(expected.next))
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('never forwards a malformed completion into the release chain', async () => {
    const before = releaseConstructionCoevent(
      'lot-native-next-event-release-invalid-completion',
    )
    const expected = advanceToNextEvent(before)
    expect(expected.released).toHaveLength(1)
    expect(expected.constructionCompletion).not.toBeNull()
    resetAdapterProbe()
    adapterProbe.transform = (result) => ({
      ...result,
      constructionCompletion: {
        ...result.constructionCompletion!,
        completedWeek: result.toWeek + 1,
      },
    })
    await renderStudio(before)

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    expect(await screen.findByTestId('newspaper-reveal')).toBeInTheDocument()
    expect(
      screen.queryByTestId('annex-completion-summary'),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('newspaper-continue'))
    expect(await screen.findByTestId('release-list')).toBeInTheDocument()
    expect(
      screen.queryByTestId('annex-completion-summary'),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('release-continue'))
    await screen.findByTestId('studio-lot-screen')
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')
    expect(adapterProbe.calls).toHaveLength(1)
  })

  it('preserves the exact live-world reaction after a rejected import or declined restart', async () => {
    const seed = 'lot-native-next-event-rejected-replacement'
    const release = advanceToNextEvent(releaseConstructionCoevent(seed))
    expect(release.stopReason).toBe('release')
    expect(studioDevelopment(release.next).status).toBe('operational')
    const before = release.next
    const stopped = advanceToNextEvent(before)
    expect(stopped.stopReason).toBe('runCompleted')
    expect(stopped.released).toHaveLength(0)
    const acceptedBytes = exportSaveJson(stopped.next)

    resetAdapterProbe()
    await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    expect(await screen.findByTestId('lot-next-event-rail')).toHaveAttribute(
      'data-feedback-kind',
      'next-event-exact',
    )
    expect(currentSessionBytes()).toBe(acceptedBytes)
    expect(adapterProbe.calls).toHaveLength(1)

    async function openSavesFromExactReaction() {
      fireEvent.click(screen.getByTestId('lot-next-event-open-details'))
      const releasesHeading = await screen.findByTestId(
        'dashboard-releases-heading',
      )
      await waitFor(() => expect(releasesHeading).toHaveFocus())
      fireEvent.click(screen.getByTestId('open-saves'))
      await screen.findByTestId('saves-import-text')
    }

    async function expectExactReactionRestored() {
      const returnedRail = await screen.findByTestId('lot-next-event-rail')
      expect(returnedRail).toHaveAttribute(
        'data-feedback-kind',
        'next-event-exact',
      )
      expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute(
        'data-entry-focus',
        'next-event-reaction',
      )
      await waitFor(() =>
        expect(
          screen.getByRole('heading', { level: 2, name: 'NEXT EVENT' }),
        ).toHaveFocus(),
      )
      expect(
        screen.getByTestId('lot-annex-operational-announcement'),
      ).toHaveTextContent('')
      expect(currentSessionBytes()).toBe(acceptedBytes)
      expect(adapterProbe.calls).toHaveLength(1)
    }

    await openSavesFromExactReaction()
    fireEvent.change(screen.getByTestId('saves-import-text'), {
      target: { value: '{"saveVersion":11}' },
    })
    fireEvent.click(screen.getByTestId('saves-import'))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This save was rejected:',
    )
    expect(currentSessionBytes()).toBe(acceptedBytes)
    fireEvent.click(screen.getByTestId('saves-back'))
    await expectExactReactionRestored()

    await openSavesFromExactReaction()
    // PF1-M3 re-pin (Owner-approved, charter §5-M3 "the browser never speaks again"): the
    // declined restart is declined in the product's own dialog. The point of this assertion is
    // unchanged — the player was asked, said no, and the exact live-world reaction survived.
    fireEvent.click(screen.getByTestId('restart-game'))
    expect(screen.getByTestId('confirm-dialog')).toHaveTextContent('Start a new studio?')
    fireEvent.click(screen.getByTestId('confirm-dialog-cancel'))
    expect(screen.getByTestId('saves-import-text')).toBeInTheDocument()
    expect(currentSessionBytes()).toBe(acceptedBytes)
    fireEvent.click(screen.getByTestId('saves-back'))
    await expectExactReactionRestored()
  })

  it('clears every next-event transient across an accepted same-seed same-week whole-studio replacement', async () => {
    const seed = 'lot-native-next-event-same-seed-replacement'
    const release = advanceToNextEvent(releaseConstructionCoevent(seed))
    expect(release.stopReason).toBe('release')
    expect(release.constructionCompletion).not.toBeNull()
    expect(studioDevelopment(release.next).status).toBe('operational')
    const before = release.next
    const stopped = advanceToNextEvent(before)
    expect(stopped.stopReason).toBe('runCompleted')
    expect(stopped.released).toHaveLength(0)
    expect(studioDevelopment(stopped.next).status).toBe('operational')

    let replacement = constructionBefore(seed)
    while (replacement.market.tick < stopped.next.market.tick) {
      replacement = advanceWeek(replacement).next
    }
    expect(replacement.seed).toBe(stopped.next.seed)
    expect(replacement.market.tick).toBe(stopped.next.market.tick)
    expect(exportSaveJson(replacement)).not.toBe(exportSaveJson(stopped.next))
    expect(studioDevelopment(replacement).status).toBe('operational')

    resetAdapterProbe()
    const { lot: originalLot, view: originalView } = await renderStudio(before)
    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    expect(screen.getByTestId('lot-nav-expansion')).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(getLotSelectedBuilding()).toBe('expansion')

    fireEvent.click(screen.getByTestId('lot-sim-to-next-event'))
    const rail = await screen.findByTestId('lot-next-event-rail')
    expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-exact')
    expect(screen.getByTestId('lot-next-event-identity')).toHaveTextContent(
      stopped.completedRuns[0]!.title,
    )
    expect(
      screen.getByTestId('lot-annex-operational-announcement'),
    ).toHaveTextContent('')
    const staleControl = screen.getByTestId('lot-sim-to-next-event')
    fireEvent.pointerDown(staleControl)

    fireEvent.click(screen.getByTestId('lot-next-event-open-details'))
    const releasesHeading = await screen.findByTestId(
      'dashboard-releases-heading',
    )
    await waitFor(() => expect(releasesHeading).toHaveFocus())
    fireEvent.click(screen.getByTestId('open-saves'))
    renderer.controls.deferReady = true
    fireEvent.change(await screen.findByTestId('saves-import-text'), {
      target: { value: exportSaveJson(replacement) },
    })
    fireEvent.click(screen.getByTestId('saves-import'))

    const replacedLot = await screen.findByTestId('studio-lot-screen')
    expect(replacedLot).not.toBe(originalLot)
    expect(replacedLot).toHaveAttribute('data-entry-focus', 'studio-home')
    expect(originalView.destroyed).toBe(true)
    await waitFor(() => expect(renderer.instances).toHaveLength(2))
    expect(screen.queryByTestId('lot-next-event-rail')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-next-event-identity')).not.toBeInTheDocument()
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-next-event-announcement')).not.toBeInTheDocument()
    expect(getLotSelectedBuilding()).toBeNull()
    expect(currentSessionBytes()).toBe(exportSaveJson(replacement))
    await waitFor(() =>
      expect(
        screen.getByTestId('lot-annex-operational-announcement'),
      ).toHaveTextContent('Development & Casting Annex is Operational.'),
    )

    const replacementControl = screen.getByTestId('lot-sim-to-next-event')
    expect(screen.getByTestId('lot-canvas-loading')).toBeInTheDocument()
    fireEvent.mouseDown(replacementControl)
    fireEvent.click(replacementControl, { detail: 1 })
    fireEvent.touchStart(replacementControl)
    fireEvent.click(replacementControl, { detail: 1 })
    expect(adapterProbe.calls).toHaveLength(1)

    act(() => renderer.instances[1]!.ready())
    await waitFor(() =>
      expect(screen.queryByTestId('lot-canvas-loading')).not.toBeInTheDocument(),
    )
    await new Promise((resolve) => window.setTimeout(resolve, 5))
    fireEvent.mouseDown(replacementControl)
    fireEvent.click(replacementControl, { detail: 1 })
    expect(adapterProbe.calls).toHaveLength(1)

    fireEvent.pointerDown(replacementControl)
    fireEvent.click(replacementControl, { detail: 1 })
    await waitFor(() => expect(adapterProbe.calls).toHaveLength(2))
    await screen.findByTestId('lot-next-event-rail')
  })
})
