// ── World Inspector Default V1 (M1.5) — no building click ever ejects ─────────
//
// Playtest 1's loudest world-first violation: an ordinary building activation fell
// through to `dispatchRoute(BUILDING_ACTION[id])`, so an idle Stage 7 threw the player
// onto the Dashboard and Casting-without-an-eligible-session threw them into the full
// Casting Room. These specs pin the replacement law:
//
//   1. In the adopted grid world NO building activation navigates. Every place lands an
//      in-world context — a richer one where one exists, the generic World Inspector
//      otherwise. The retained painted plate and the legacy lot keep their old route.
//   2. The deep screens stay reachable, but ONLY from the inspector's explicit
//      "Open <deep screen> details" secondary action.
//   3. Canvas intent and semantic companion activation route to the same owner
//      (shift law 10): the renderer's `onWorldBuilding` seam lands the same panel.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import { App } from '../App.tsx'
import { clearActiveSession, saveActiveSession } from '../engine/session.ts'
import {
  advanceWeek,
  commissionScriptAction,
  foundingApplicantCards,
  foundManagedStudioAction,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  type CreativeRole,
} from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
  clearTycoonWorldOverride,
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
  setTycoonWorldOverride,
} from '../flags.ts'
import { newFoundedGame } from '../test/founding.ts'
import { StudioLotScreen, type LotAuditionPlanningOrigin } from './StudioLotScreen.tsx'
import { ALL_BUILDING_IDS, type BuildingId } from './snapshot/StudioLotSnapshot.ts'
import type { LotRoute } from './navigation.ts'
import { resetLotSelectedBuilding } from './snapshot/selectedBuildingSession.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'

type FakeOptions = {
  snapshot: unknown
  onReady?: () => void
  onWorldBuilding?: (buildingId: BuildingId) => void
}

const renderer = vi.hoisted(() => {
  const instances: FakeView[] = []
  class FakeView {
    readonly options: FakeOptions
    readonly selectedBuildings: string[] = []
    /** Every bring-into-view the host asked the world for, in order. */
    readonly framed: string[] = []
    cameraResets = 0
    destroyed = false
    constructor(options: FakeOptions) {
      this.options = options
      instances.push(this)
      queueMicrotask(() => options.onReady?.())
    }
    setSnapshot() {}
    setInputSuspended() {}
    select(id: string) { this.selectedBuildings.push(id) }
    clearSelection() {}
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {}
    selectHollywoodPerson() {}
    selectHollywoodProduction() { return true }
    selectHollywoodProductionCompany() { return true }
    clearHollywoodProductionCompanySelection() {}
    selectHollywoodSceneryLoadIn() { return true }
    selectHollywoodAnnexPlace() { return true }
    selectHollywoodPublicityPlace() { return true }
    selectHollywoodGatePlace() { return true }
    focusHollywoodGate() { this.framed.push('studio-gate'); return true }
    focusHollywoodPlace(id: string) { this.framed.push(id) }
    setHollywoodGateVisitor() { return true }
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() {}
    resetCamera() { this.cameraResets++ }
    showHollywoodPublicity() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    destroy() { this.destroyed = true }
  }
  return { instances, FakeView }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

/** A managed Week-0 studio: the exact shape the Owner's playtest started from. */
function managedWeekZero(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
}

async function onlyView() {
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  return renderer.instances[0]!
}

function renderLot(
  state: GameState,
  extra: {
    onOpenAuditionPlanning?: (state: GameState, origin: LotAuditionPlanningOrigin) => boolean
  } = {},
) {
  const routes: LotRoute[] = []
  const utils = render(
    <StudioLotScreen
      state={state}
      onNavigate={(route) => routes.push(route)}
      onExit={vi.fn()}
      onAdvance={vi.fn()}
      {...(extra.onOpenAuditionPlanning
        ? { onOpenAuditionPlanning: extra.onOpenAuditionPlanning }
        : {})}
    />,
  )
  return { ...utils, routes }
}

/**
 * A managed-EVERYTHING Week 0 — the exact studio the Owner's cold playtest started from,
 * and the one `managedWeekZero` above deliberately is not (that one keeps the legacy
 * direct-greenlight screenplay path, which publishes no commission legality at all).
 * Built by calling the real Engine actions in order — never by hand-editing state.
 */
function managedScriptWeekZero(seed: string): GameState {
  const required: Readonly<Record<CreativeRole, number>> = {
    actor: 3,
    director: 1,
    writer: 1,
    craft: 1,
  }
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards.filter((card) => card.profile.role === role).slice(0, required[role])
    if (selected.length !== required[role]) throw new Error(`setup: missing ${role}`)
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

/** One commission later: a writer is physically at Development, drafting. */
function draftingStudio(seed: string): GameState {
  const state = managedScriptWeekZero(seed)
  const commission = scriptProjectsBoard(state).commission
  const concept = commission.concepts[0]
  const writer = commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) throw new Error('setup: no commission')
  const started = commissionScriptAction(state, {
    conceptId: concept.id,
    writerId: writer.id,
    shape: { opening: 'mysteryHook', midpoint: 'revelation', ending: 'bittersweet' },
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
  if (!started.ok) throw new Error(started.error)
  return started.next
}

/**
 * A managed studio whose first screenplay has been accepted: the exact moment the
 * picture-guidance card starts saying "Plan auditions at Casting".
 */
function readyToPackageStudio(seed: string): GameState {
  const state = advanceWeek(draftingStudio(seed)).next
  const review = scriptProjectsBoard(state).sections.needsReview[0]
  const accept = review?.legalActions.find((action) => action.kind === 'acceptScript')
  if (review === undefined || accept === undefined) throw new Error('setup: no acceptance')
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  return accepted.next
}

/**
 * The panel's READING ORDER, as a player meets it: what is this → what is happening →
 * who is here → what can I do right now → how much room is left → deep details.
 */
const INSPECTOR_HIERARCHY: readonly (readonly [string, (el: Element) => boolean])[] = [
  ['description', (el) => el.classList.contains('hollywood-building-inspector-role')],
  ['status', (el) => el.getAttribute('data-testid') === 'lot-building-inspector-status'],
  ['attention', (el) => el.getAttribute('data-testid') === 'lot-building-inspector-attention'],
  ['occupants', (el) => el.getAttribute('data-testid') === 'lot-building-inspector-occupants'],
  [
    'actions',
    (el) => {
      const id = el.getAttribute('data-testid') ?? ''
      return (
        id.startsWith('lot-building-inspector-primary-') ||
        id.startsWith('lot-building-inspector-command-')
      )
    },
  ],
  ['capacity', (el) => el.getAttribute('data-testid') === 'lot-building-inspector-facts'],
  [
    'deep',
    (el) => (el.getAttribute('data-testid') ?? '').startsWith('lot-building-inspector-open-details-'),
  ],
]

function inspectorReadingOrder(panel: HTMLElement): string[] {
  const seen: string[] = []
  for (const element of Array.from(panel.querySelectorAll('*'))) {
    for (const [name, matches] of INSPECTOR_HIERARCHY) {
      if (matches(element) && seen[seen.length - 1] !== name) seen.push(name)
    }
  }
  return seen
}

/** Is `observed` the canonical order with some blocks simply absent? */
function isCanonicalSubsequence(observed: readonly string[]): boolean {
  let cursor = 0
  for (const block of observed) {
    const at = INSPECTOR_HIERARCHY.findIndex(([name]) => name === block)
    if (at < cursor) return false
    cursor = at
  }
  return true
}

/**
 * Every place lands SOME in-world context. Richer contexts keep precedence, so this
 * accepts either the generic inspector or the exact context that outranks it.
 */
const IN_WORLD_CONTEXT_TESTIDS = [
  'lot-building-inspector-context',
  'hollywood-gate-context',
  'hollywood-publicity-context',
  'lot-annex-context',
  'hollywood-scenery-load-in-context',
  'lot-script-review-context',
  'lot-casting-review-context',
  'hollywood-inspector',
] as const

/** The exact deep route each building's explicit secondary action still reaches. */
const DEEP_ROUTE: Record<BuildingId, LotRoute> = {
  admin: { kind: 'dashboard' },
  writers: { kind: 'assembly' },
  casting: { kind: 'castingRoom' },
  'stage-a': { kind: 'dashboard' },
  'stage-b': { kind: 'dashboard' },
  post: { kind: 'dashboard' },
  theater: { kind: 'dashboard' },
  gate: { kind: 'dashboard' },
  expansion: { kind: 'studioDevelopment' },
}

beforeEach(() => {
  localStorage.clear()
  clearActiveSession()
  resetLotSelectedBuilding()
  resetLotStageAssignment()
  renderer.instances.length = 0
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  clearActiveSession()
  renderer.instances.length = 0
  clearOperationHollywoodOverride()
  clearStudioLotOverviewOverride()
  clearTycoonWorldOverride()
  resetLotSelectedBuilding()
  resetLotStageAssignment()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('World Inspector Default V1 — no building click ever ejects', () => {
  it('never navigates from any of the nine places, and always lands an in-world context', async () => {
    for (const id of ALL_BUILDING_IDS) {
      const { routes, unmount } = renderLot(managedWeekZero('world-inspector-no-eject'))
      await onlyView()

      fireEvent.click(screen.getByTestId(`lot-nav-${id}`))

      expect(routes).toEqual([])
      const landed = IN_WORLD_CONTEXT_TESTIDS.some(
        (testId) => screen.queryByTestId(testId) !== null,
      )
      expect(landed, `${id} landed no in-world context`).toBe(true)
      unmount()
      renderer.instances.length = 0
      resetLotSelectedBuilding()
    }
  })

  it('lands the generic inspector — with name, role and live status — where no richer context applies', async () => {
    const inspected: BuildingId[] = ['writers', 'casting', 'stage-a', 'stage-b', 'post', 'theater']
    for (const id of inspected) {
      const { routes, unmount } = renderLot(managedWeekZero('world-inspector-generic'))
      await onlyView()

      fireEvent.click(screen.getByTestId(`lot-nav-${id}`))

      const panel = screen.getByTestId(`lot-building-inspector-${id}`)
      expect(panel).toBeInTheDocument()
      expect(screen.getByTestId('lot-building-inspector-heading')).toBeInTheDocument()
      expect(screen.getByTestId('lot-building-inspector-status').textContent ?? '').not.toBe('')
      expect(routes).toEqual([])
      unmount()
      renderer.instances.length = 0
      resetLotSelectedBuilding()
    }
  })

  it('reaches the canonical deep screen ONLY through the explicit details action', async () => {
    for (const id of ALL_BUILDING_IDS) {
      const { routes, unmount } = renderLot(managedWeekZero('world-inspector-deep'))
      await onlyView()

      fireEvent.click(screen.getByTestId(`lot-nav-${id}`))
      expect(routes).toEqual([])
      const details = screen.queryByTestId(`lot-building-inspector-open-details-${id}`)
      if (details !== null) {
        fireEvent.click(details)
        expect(routes).toEqual([DEEP_ROUTE[id]])
      }
      unmount()
      renderer.instances.length = 0
      resetLotSelectedBuilding()
    }
  })

  it('routes canvas intent and semantic companion activation to the same owner', async () => {
    const { routes } = renderLot(managedWeekZero('world-inspector-canvas-parity'))
    const view = await onlyView()

    act(() => { view.options.onWorldBuilding?.('stage-b') })
    expect(screen.getByTestId('lot-building-inspector-stage-b')).toBeInTheDocument()
    const fromCanvas = screen.getByTestId('lot-building-inspector-stage-b').textContent

    fireEvent.click(screen.getByTestId('lot-nav-theater'))
    fireEvent.click(screen.getByTestId('lot-nav-stage-b'))
    expect(screen.getByTestId('lot-building-inspector-stage-b').textContent).toBe(fromCanvas)
    expect(routes).toEqual([])
  })

  it('prints the shared Development & Casting occupancy and the stage’s own idle truth', async () => {
    renderLot(managedWeekZero('world-inspector-facts'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(screen.getByTestId('lot-building-inspector-facts')).toHaveTextContent(
      'Development & Casting',
    )
    expect(screen.getByTestId('lot-building-inspector-facts')).toHaveTextContent('slots in use')

    fireEvent.click(screen.getByTestId('lot-nav-stage-a'))
    expect(screen.getByTestId('lot-building-inspector-stage-a')).toHaveTextContent('Soundstage 7')
    expect(screen.getByTestId('lot-building-inspector-status')).toHaveTextContent(
      'no picture is shooting here',
    )
  })

  it('moves focus into the in-world panel it just opened', async () => {
    renderLot(managedWeekZero('world-inspector-focus'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-theater'))

    await waitFor(() =>
      expect(screen.getByTestId('lot-building-inspector-heading')).toHaveFocus(),
    )
  })

  it('keeps the legacy pre-Hollywood lot on its compatibility route', async () => {
    setOperationHollywoodOverride(false)
    const { routes } = renderLot(newFoundedGame('world-inspector-legacy'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-theater'))

    expect(routes).toEqual([{ kind: 'dashboard' }])
    expect(screen.queryByTestId('lot-building-inspector-theater')).not.toBeInTheDocument()
  })

  it('leaves the retained painted plate exactly as M1 left it', async () => {
    // The plate is the adopted world's rollback path, kept untouched by the M1 KEEP
    // ruling and pinned by the browser suite. The inspector belongs to the grid world.
    setTycoonWorldOverride(false)
    const { routes } = renderLot(managedWeekZero('world-inspector-plate'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-theater'))

    expect(routes).toEqual([{ kind: 'dashboard' }])
    expect(screen.queryByTestId('lot-building-inspector-theater')).not.toBeInTheDocument()
  })
})

// ── ONE CAMERA GRAMMAR + the way back ────────────────────────────────────────
//
// The red-team finding these pin: M1.5's generic building inspectors changed the camera
// not at all, while three plate-era retained contexts (Administration/publicity, the
// Gate, the Annex) answered the same gesture by jumping to twice the whole-property fit
// — silently discarding the player's framing and stranding about a third of the studio
// off-screen, with no player-facing way back (only an undocumented `R` on an
// aria-hidden canvas). The zoom half is now impossible by construction and proven in
// `tycoon/world.test.ts`; what belongs here is the host half: the retained contexts
// still ask the world to bring their place into view, an ordinary inspector still asks
// for nothing, and the world always carries one visible control that reframes it.

describe('the camera grammar — selection frames, and the whole property is always one control away', () => {
  it('carries one always-available whole-property control that names its shortcut', async () => {
    renderLot(managedWeekZero('camera-home-present'))
    await onlyView()

    const control = await screen.findByTestId('lot-camera-home')
    expect(control).toBeInTheDocument()
    expect(control).toHaveAccessibleName('Show the whole property. Keyboard shortcut R.')
    expect(control).toHaveAttribute('aria-keyshortcuts', 'R')
    expect(control).toHaveAttribute('title', 'Show the whole property (shortcut: R)')
    // It reads as a control, not as decoration: the visible words say what it does.
    expect(control).toHaveTextContent('Whole property')
    expect(control).toBeEnabled()
  })

  it('commands the camera and NOTHING else — no navigation, no selection, no simulation', async () => {
    const { routes } = renderLot(managedWeekZero('camera-home-command'))
    const view = await onlyView()
    const control = await screen.findByTestId('lot-camera-home')
    const selectedBefore = view.selectedBuildings.length

    fireEvent.click(control)

    expect(view.cameraResets).toBe(1)
    expect(routes).toEqual([])
    expect(view.selectedBuildings).toHaveLength(selectedBefore)
    expect(view.framed).toEqual([])
  })

  it('stays available while an in-world inspector is open — that is when a player is lost', async () => {
    renderLot(managedWeekZero('camera-home-with-inspector'))
    const view = await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-stage-b'))
    expect(screen.getByTestId('lot-building-inspector-stage-b')).toBeInTheDocument()

    const control = screen.getByTestId('lot-camera-home')
    expect(control).toBeEnabled()
    fireEvent.click(control)
    expect(view.cameraResets).toBe(1)
    // …and reframing the world does not close the panel the player was reading.
    expect(screen.getByTestId('lot-building-inspector-stage-b')).toBeInTheDocument()
  })

  it('contains pointer, mouse and touch down-events on the control (law 7)', async () => {
    // Over-canvas chrome owns its own presses. The exact containment shape every other
    // world control uses, applied to the newest one.
    const parentPointer = vi.fn()
    const parentMouse = vi.fn()
    const parentTouch = vi.fn()
    render(
      <div onPointerDown={parentPointer} onMouseDown={parentMouse} onTouchStart={parentTouch}>
        <StudioLotScreen
          state={managedWeekZero('camera-home-containment')}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => {}}
        />
      </div>,
    )
    await onlyView()
    const control = await screen.findByTestId('lot-camera-home')

    fireEvent.pointerDown(control)
    fireEvent.mouseDown(control)
    fireEvent.touchStart(control)

    expect(parentPointer).not.toHaveBeenCalled()
    expect(parentMouse).not.toHaveBeenCalled()
    expect(parentTouch).not.toHaveBeenCalled()
  })

  it('keeps the retained contexts asking the world to bring their place into view', async () => {
    // The seam itself is preserved — the repair is what the SCENE does with it (a
    // glide-pan at the current zoom), never the removal of the request.
    renderLot(managedWeekZero('camera-grammar-retained'))
    const view = await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-gate'))
    await waitFor(() => expect(view.framed).toEqual(['studio-gate']))
  })

  it('never asks the world to reframe for an ORDINARY inspector — the quiet half of the grammar', async () => {
    renderLot(managedWeekZero('camera-grammar-generic'))
    const view = await onlyView()

    for (const id of ['writers', 'casting', 'stage-a', 'stage-b', 'post', 'theater'] as const) {
      fireEvent.click(screen.getByTestId(`lot-nav-${id}`))
      expect(screen.getByTestId(`lot-building-inspector-${id}`)).toBeInTheDocument()
    }

    expect(view.framed).toEqual([])
  })

  it('does not claim a shortcut the retained plate never bound', async () => {
    // `TycoonScene` and the legacy `LotScene` both bind R to the overview reset; the
    // painted plate never has. The command is offered there; the promise is not.
    setTycoonWorldOverride(false)
    renderLot(managedWeekZero('camera-home-plate'))
    const view = await onlyView()

    const control = await screen.findByTestId('lot-camera-home')
    expect(control).toHaveAccessibleName('Show the whole property')
    expect(control).not.toHaveAttribute('aria-keyshortcuts')
    fireEvent.click(control)
    expect(view.cameraResets).toBe(1)
  })
})

// ── M-B: every important building answers "what can I do here RIGHT NOW" ─────
//
// The cold playtest's three dead-end seams all had the same shape: the world said what
// was happening and then went silent about what to do, leaving one unexplained ghost
// ("Open Assembly details") as the only control. These specs are written to FAIL against
// that inspector — the verbs did not exist, and the panel printed capacity before them.

describe('M-B — the buildings carry the verbs the guidance names', () => {
  it('reads in the player’s order: what is this → what is happening → who is here → what can I do → capacity → deep details', async () => {
    renderLot(managedScriptWeekZero('m-b-hierarchy-week-zero'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    const panel = screen.getByTestId('lot-building-inspector-writers')
    // Week 0: nobody is at Development yet, so the people block is honestly absent —
    // but the VERB is above the capacity readout, which is the inversion M-B fixes.
    expect(inspectorReadingOrder(panel)).toEqual([
      'description',
      'status',
      'attention',
      'actions',
      'capacity',
      'deep',
    ])
  })

  it('puts the people ahead of the paperwork once someone is actually working here', async () => {
    renderLot(draftingStudio('m-b-hierarchy-drafting'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    const panel = screen.getByTestId('lot-building-inspector-writers')
    const order = inspectorReadingOrder(panel)
    expect(order).toContain('occupants')
    expect(order.indexOf('occupants')).toBeLessThan(order.indexOf('capacity'))
    // C2a-M4 / F4 (§10) RE-BASE: the action slot used to hold a NOTE here, because
    // the verb was withheld while the Writers' Room held anything. It holds the
    // VERB now — the engine calls commissioning legal (another contracted person
    // can write, into the room that is free), and the world agrees with it. The
    // reading ORDER, which is what this test is about, is asserted unchanged.
    expect(order).toEqual([
      'description',
      'status',
      'attention',
      'occupants',
      'actions',
      'capacity',
      'deep',
    ])
    expect(screen.getByTestId('lot-building-inspector-primary-commission')).toHaveTextContent(
      'Commission a screenplay',
    )
    expect(
      screen.queryByTestId('lot-building-inspector-primary-note'),
    ).not.toBeInTheDocument()
    // The people group is its own block, and capacity did not swallow it.
    expect(screen.getByTestId('lot-building-inspector-occupants')).toHaveTextContent(
      'Who’s here this week',
    )
    expect(screen.getByTestId('lot-building-inspector-facts')).toHaveTextContent('slots in use')
  })

  it('never lets any place print its blocks out of the canonical order', async () => {
    for (const state of [
      managedScriptWeekZero('m-b-order-sweep-zero'),
      draftingStudio('m-b-order-sweep-drafting'),
      readyToPackageStudio('m-b-order-sweep-ready'),
    ]) {
      for (const id of ALL_BUILDING_IDS) {
        const { unmount } = renderLot(state)
        await onlyView()
        fireEvent.click(screen.getByTestId(`lot-nav-${id}`))
        const panel = screen.queryByTestId(`lot-building-inspector-${id}`)
        if (panel !== null) {
          const order = inspectorReadingOrder(panel)
          expect(isCanonicalSubsequence(order), `${id}: ${order.join(' → ')}`).toBe(true)
        }
        unmount()
        renderer.instances.length = 0
        resetLotSelectedBuilding()
      }
    }
  })

  it('offers Development the Commission verb at Week 0 — the first step of the whole game', async () => {
    const { routes } = renderLot(managedScriptWeekZero('m-b-commission-verb'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    const commission = screen.getByTestId('lot-building-inspector-primary-commission')
    expect(commission.tagName).toBe('BUTTON')
    expect(commission).toHaveAttribute('type', 'button')
    expect(commission).toHaveAccessibleName('Commission a screenplay')
    expect(commission).toBeEnabled()
    expect(routes).toEqual([])

    fireEvent.click(commission)

    // C2a-M4 / F4 (§10) RE-BASE, with its reason at the site. The verb used to
    // share `assembly` with every generic Development activation, and the point
    // of that sharing was "one intent, one landing surface". F4 widened THE VERB
    // and not the other callers — the engine now commissions on a free room, not
    // on an idle board — so a shared route can no longer carry the distinction.
    // The verb has its own route; what has NOT changed is that it stays in the
    // world and is intercepted into the retained commissioning workspace.
    expect(routes).toEqual([{ kind: 'commissionScreenplay' }])
    expect(screen.getByTestId('studio-lot-screen')).toBeInTheDocument()
  })

  it('routes the Commission verb to the commission intent, and the deep ghost to Development', async () => {
    // SUCCESSOR to "routes the Commission verb and the deep ghost to the same
    // owner". They are two intents now, and the difference is exactly the one F4
    // created: the verb commissions, the ghost opens Development. Both stay
    // owned by the host; neither invents a screen of its own.
    const { routes, unmount } = renderLot(managedScriptWeekZero('m-b-commission-parity'))
    await onlyView()
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    fireEvent.click(screen.getByTestId('lot-building-inspector-primary-commission'))
    expect(routes).toEqual([{ kind: 'commissionScreenplay' }])
    unmount()
    renderer.instances.length = 0
    resetLotSelectedBuilding()

    const second = renderLot(managedScriptWeekZero('m-b-commission-parity'))
    await onlyView()
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    fireEvent.click(screen.getByTestId('lot-building-inspector-open-details-writers'))

    expect(second.routes).toEqual([{ kind: 'assembly' }])
  })

  // ── F4 RE-BASE (charter §10, owned by C2a-M4) ────────────────────────────
  //
  // RETIRED: "withholds the Commission verb the moment the engine says
  // commissioning is illegal" (whose fixture was a BUSY board, not an illegal
  // one) and "tells the player WHY Development is not offering the verb"
  // (whose sentence — "Commissioning opens here again once it moves on" — is
  // false the moment a second room is free). Both encoded the seam §10 names.
  //
  // NAMED SUCCESSORS, both here: the verb is OFFERED while other work is in
  // flight, and it is withheld — with the engine's own reason in the verb's own
  // slot — when the rooms are actually full.
  it('F4: offers the Commission verb while a screenplay is already being written', async () => {
    const state = draftingStudio('m-b-commission-f4-drafting')
    // The precondition, stated: the board is busy AND a room is free.
    expect(scriptProjectsBoard(state).lotAttention.kind).not.toBe('idle')
    expect(scriptProjectsBoard(state).capacity.available).toBeGreaterThan(0)
    renderLot(state)
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(screen.getByTestId('lot-building-inspector-writers')).toBeInTheDocument()
    expect(screen.getByTestId('lot-building-inspector-primary-commission')).toHaveTextContent(
      'Commission a screenplay',
    )
  })

  it('F4: offers it with an accepted screenplay waiting on casting, too', async () => {
    const state = readyToPackageStudio('m-b-commission-f4-ready')
    expect(scriptProjectsBoard(state).lotAttention.kind).not.toBe('idle')
    expect(scriptProjectsBoard(state).capacity.available).toBeGreaterThan(0)
    renderLot(state)
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(screen.getByTestId('lot-building-inspector-primary-commission')).toHaveTextContent(
      'Commission a screenplay',
    )
    expect(
      screen.queryByTestId('lot-building-inspector-primary-note'),
    ).not.toBeInTheDocument()
  })

  it('names the picture in Casting’s audition verb, and prefers the retained in-world planner', async () => {
    // The retained planner proves its own exact origin and may refuse; the first call
    // (the building activation) refuses here so the inspector is what the player sees.
    const origins: LotAuditionPlanningOrigin[] = []
    const opens = vi.fn((_state: GameState, origin: LotAuditionPlanningOrigin): boolean => {
      origins.push(origin)
      return origins.length > 1
    })
    const { routes } = renderLot(readyToPackageStudio('m-b-plan-auditions'), {
      onOpenAuditionPlanning: opens,
    })
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    const plan = screen.getByTestId('lot-building-inspector-primary-plan-auditions')
    expect(plan.tagName).toBe('BUTTON')
    expect(plan.getAttribute('aria-label') ?? '').toMatch(/^Plan auditions for .+/)
    expect(plan).toHaveAccessibleName(plan.getAttribute('aria-label')!)

    fireEvent.click(plan)

    // The retained path took it: no deep navigation, and the world was never left.
    expect(opens).toHaveBeenCalledTimes(2)
    expect(routes).toEqual([])
    expect(screen.getByTestId('studio-lot-screen')).toBeInTheDocument()
    // …and it was offered as ITSELF. The verb is a first-class origin: it never borrows
    // the companion rail's identity to prove a press the player made somewhere else.
    const railOrigin = origins[0]!
    const verbOrigin = origins[1]!
    expect(railOrigin.openerKind).toBe('companion')
    expect(railOrigin.opener).toHaveAttribute('data-testid', 'lot-nav-casting')
    expect(verbOrigin.openerKind).toBe('inspector')
    expect(verbOrigin.opener).toBe(plan)
  })

  it('falls back to the existing deep Casting path rather than leaving a dead button', async () => {
    // No retained planner is wired at all — the verb must still do something honest.
    const { routes } = renderLot(readyToPackageStudio('m-b-plan-auditions-fallback'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    fireEvent.click(screen.getByTestId('lot-building-inspector-primary-plan-auditions'))

    expect(routes).toEqual([DEEP_ROUTE.casting])
  })

  it('reads the deep ghosts in plain language, never in internal screen names', async () => {
    renderLot(managedScriptWeekZero('m-b-deep-labels'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(screen.getByTestId('lot-building-inspector-open-details-writers')).toHaveTextContent(
      'Open Development details',
    )

    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    expect(screen.getByTestId('lot-building-inspector-open-details-casting')).toHaveTextContent(
      'Open Casting details',
    )
  })
})

// ── M-B defect repair — the Casting verb opens the planner as ITSELF ─────────
//
// Live-playtest defect: the inspector's "Plan auditions for <title>" verb was proven
// through the COMPANION RAIL — a different control the player never pressed and which
// need not be in a provable state. Whenever that proof failed, the retained planner
// refused and the verb ejected the player onto the full-screen Casting Room, with the
// world gone. An opener must prove ITSELF.
//
// These run the REAL App, so "over the live lot" means what it says: the lot screen is
// still mounted and no deep screen was ever reached.

describe('M-B — the audition verb is a first-class retained-planner origin', () => {
  /**
   * Make the companion rail's origin unprovable, deterministically and without touching
   * React's tree: a second node claims the rail's testid, so the rail's own uniqueness
   * proof correctly refuses. This models the live condition exactly — the verb is on
   * screen and the rail cannot vouch for it.
   */
  const injected: HTMLElement[] = []

  /** Injected nodes live outside React's container, so this suite removes its own. */
  function injectDecoy(testId: string): HTMLButtonElement {
    const decoy = document.createElement('button')
    decoy.setAttribute('data-testid', testId)
    document.body.insertBefore(decoy, document.body.firstChild)
    injected.push(decoy)
    return decoy
  }

  afterEach(() => {
    for (const node of injected.splice(0)) node.remove()
  })

  function shadowTheCompanionRail(): HTMLButtonElement {
    return injectDecoy('lot-nav-casting')
  }

  /** The real rail row, reachable while a decoy shares its testid. */
  function realCompanionRow(): HTMLButtonElement {
    const state = screen.getByTestId('lot-nav-casting-state')
    const row = state.closest('button')
    if (row === null) throw new Error('setup: the companion Casting row is absent')
    return row
  }

  async function bootLot(state: GameState) {
    saveActiveSession(state)
    render(<App />)
    await screen.findByTestId('studio-lot-screen')
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
  }

  it('opens the in-world planner over the live lot when the companion rail cannot vouch for it', async () => {
    await bootLot(readyToPackageStudio('m-b-origin-inspector'))
    shadowTheCompanionRail()

    // The rail refuses (correctly — it is no longer unique), so the building's own panel
    // is what the player is looking at. This is the exact live repro.
    fireEvent.click(realCompanionRow())
    expect(screen.getByTestId('lot-building-inspector-casting')).toBeInTheDocument()
    expect(screen.queryByTestId('lot-audition-workspace')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-building-inspector-primary-plan-auditions'))

    // BEFORE THE FIX this landed the full-screen Casting Room. The retained planner must
    // win whenever the planner context itself accepts.
    expect(screen.getByTestId('lot-audition-workspace')).toBeInTheDocument()
    expect(screen.getByTestId('casting-planner')).toBeInTheDocument()
    // …mounted OVER the live lot: the screen never changed and no deep surface was reached.
    expect(screen.getByTestId('studio-lot-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('casting-room-heading')).not.toBeInTheDocument()
    expect(screen.queryByTestId('writers-room')).not.toBeInTheDocument()
  })

  it('still refuses — and still never dead-ends — when the verb cannot prove ITSELF either', async () => {
    // The new arm is a second accepted opener, not a hole. With BOTH openers unprovable
    // the retained planner must refuse exactly as before, and the verb must still take
    // the player somewhere real rather than doing nothing.
    await bootLot(readyToPackageStudio('m-b-origin-both-unprovable'))
    shadowTheCompanionRail()
    fireEvent.click(realCompanionRow())
    expect(screen.getByTestId('lot-building-inspector-casting')).toBeInTheDocument()

    injectDecoy('lot-building-inspector-primary-plan-auditions')

    const verb = screen
      .getByTestId('lot-building-inspector-casting')
      .querySelector<HTMLButtonElement>(
        '[data-testid="lot-building-inspector-primary-plan-auditions"]',
      )
    expect(verb).not.toBeNull()
    fireEvent.click(verb!)

    expect(screen.queryByTestId('lot-audition-workspace')).not.toBeInTheDocument()
    expect(screen.getByTestId('casting-room-heading')).toBeInTheDocument()
  })

  it('keeps the companion rail a first-class origin of its own', async () => {
    // No weakening: with nothing shadowed, the rail still opens the retained planner
    // directly, exactly as it did before this repair.
    await bootLot(readyToPackageStudio('m-b-origin-companion'))

    fireEvent.click(screen.getByTestId('lot-nav-casting'))

    expect(screen.getByTestId('lot-audition-workspace')).toBeInTheDocument()
    expect(screen.getByTestId('studio-lot-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('casting-room-heading')).not.toBeInTheDocument()
  })
})
