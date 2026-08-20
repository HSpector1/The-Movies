// ── First-picture guidance in the live Studio Lot ─────────────────────────────
//
// The cold playtest's first dead end: through commissioning, drafting and auditions the
// top-left desk read "No active production / The studio lot is idle. Assemble a film to
// begin production." — a lie with no verb, in the exact frame a new player starts in.
//
// These specs pin the replacement against the REAL screen, the REAL adapter and the real
// selection/camera seams. The engine projection is injected at the adapter boundary (the
// same interception the other world-first App specs use) because the journey is engine
// truth, not something this host may derive.
//
// The first spec is the falsification: it fails against the old idle card by construction.

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import type { CreativeRole, GameState } from '../engine/adapter.ts'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
  clearTycoonWorldOverride,
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import { newFoundedGame } from '../test/founding.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import type { LotRoute } from './navigation.ts'
import { resetLotSelectedBuilding } from './snapshot/selectedBuildingSession.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'
import type { FirstFilmJourneyView } from './snapshot/firstFilmJourney.ts'

// The engine owns the journey; the adapter carries it on the lot snapshot. `override` is
// null for the REAL engine projection (the shipped path) and set only where a spec needs
// one exact stage, an absent projection, or a hostile one. Nothing here derives a fact.
const projection = vi.hoisted(() => ({
  override: null as null | { kind: 'absent' } | { kind: 'value'; value: unknown },
}))

vi.mock('../engine/adapter.ts', async () => {
  const actual = await vi.importActual<typeof import('../engine/adapter.ts')>(
    '../engine/adapter.ts',
  )
  return {
    ...actual,
    studioLotSnapshot(state: Parameters<typeof actual.studioLotSnapshot>[0]) {
      const snapshot = actual.studioLotSnapshot(state)
      const override = projection.override
      if (override === null) return snapshot
      if (override.kind === 'value') return { ...snapshot, firstFilmJourney: override.value }
      const { firstFilmJourney: _dropped, ...withoutJourney } = snapshot
      return withoutJourney
    },
  }
})

type FakeOptions = { snapshot: unknown; onReady?: () => void }

const renderer = vi.hoisted(() => {
  const instances: FakeView[] = []
  class FakeView {
    readonly options: FakeOptions
    /** Every building the host asked the world to paint as selected, in order. */
    readonly selectedBuildings: string[] = []
    /** Every place the host asked the world to bring into frame, in order. */
    readonly framed: string[] = []
    cameraPresets: string[] = []
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
    camera(preset: string) { this.cameraPresets.push(preset) }
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

function managedWeekZero(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
}

function rosterIds(state: GameState, role: CreativeRole): string[] {
  return state.contracts
    .map((contract) => state.talent.find((talent) => talent.id === contract.talentId)!)
    .filter((talent) => talent.role === role)
    .map((talent) => talent.id)
}

/** A studio with a real greenlit picture — the post-greenlight half of the slot contract. */
function greenlitStudio(seed: string): GameState {
  const state = managedWeekZero(seed)
  const concept = state.concepts[0]!
  const actors = rosterIds(state, 'actor')
  return applyActions(state, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: rosterIds(state, 'writer')[0]!,
        directorId: rosterIds(state, 'director')[0]!,
        cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
        craftIds: [rosterIds(state, 'craft')[0]!],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}

function journey(overrides: Partial<FirstFilmJourneyView> = {}): FirstFilmJourneyView {
  return {
    stage: 'drafting',
    beat: 'screenplay-writing',
    scriptProjectId: 'script-0000',
    pictureTitle: 'A Season of Archipelago',
    ordinal: 1,
    headline: 'Screenplay — drafting',
    whatHappened: 'The screenplay was commissioned.',
    whyItMatters: 'The writer is preparing the script for casting.',
    detail: 'Writer: Lauren Ravel · Due Week 1',
    next: { kind: 'commission', label: 'Commission a screenplay at Development', site: 'development' },
    waiting: null,
    blocked: null,
    ...overrides,
  }
}

function renderLot(state: GameState) {
  const routes: LotRoute[] = []
  const utils = render(
    <StudioLotScreen
      state={state}
      onNavigate={(route) => routes.push(route)}
      onExit={vi.fn()}
      onAdvance={vi.fn()}
    />,
  )
  return { ...utils, routes }
}

async function onlyView() {
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  return renderer.instances[0]!
}

beforeEach(() => {
  localStorage.clear()
  resetLotSelectedBuilding()
  resetLotStageAssignment()
  renderer.instances.length = 0
  projection.override = null
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  renderer.instances.length = 0
  projection.override = null
  clearOperationHollywoodOverride()
  clearStudioLotOverviewOverride()
  clearTycoonWorldOverride()
  resetLotSelectedBuilding()
  resetLotStageAssignment()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('Picture guidance owns the desk before the first greenlight', () => {
  // FALSIFICATION: against the old idle card this fails on every assertion below.
  it('names the picture and its next step instead of calling the lot idle', async () => {
    projection.override = { kind: 'value', value: journey() }
    renderLot(managedWeekZero('picture-guidance-drafting'))
    await onlyView()

    const desk = screen.getByTestId('hollywood-production-idle')
    expect(desk).not.toHaveTextContent('No active production')
    expect(desk).not.toHaveTextContent('The studio lot is idle')
    expect(desk).not.toHaveTextContent('Assemble a film to begin production')

    expect(screen.getByRole('region', { name: 'Picture guidance' })).toBeInTheDocument()
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toHaveTextContent('PICTURE JOURNEY')
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toHaveTextContent('PICTURE 1')
    expect(screen.getByTestId('lot-picture-guidance-title')).toHaveTextContent('A Season of Archipelago')
    expect(screen.getByTestId('lot-picture-guidance-headline')).toHaveTextContent('Screenplay — drafting')
    expect(screen.getByTestId('lot-picture-guidance-detail')).toHaveTextContent('Writer: Lauren Ravel · Due Week 1')
  })

  it('states the imperative step before a screenplay exists', async () => {
    projection.override = { kind: 'value', value: journey({
      stage: 'no-picture',
      pictureTitle: null,
      headline: 'No screenplay',
      detail: null,
    }) }
    renderLot(managedWeekZero('picture-guidance-no-picture'))
    await onlyView()

    expect(screen.getByTestId('lot-picture-guidance-title')).toHaveTextContent('No picture yet')
    expect(
      screen.getByRole('button', { name: 'Commission a screenplay at Development' }),
    ).toBeInTheDocument()
  })
})

describe('The shipped path carries the engine\'s own projection', () => {
  // No override: the REAL adapter, the REAL core projection. This is the wiring proof —
  // if the adapter stopped emitting the journey, only this spec would notice.
  it('shows a fresh managed studio its first picture and a real next step', async () => {
    renderLot(managedWeekZero('picture-guidance-engine-wired'))
    await onlyView()

    const card = screen.getByTestId('lot-picture-guidance')
    expect(card).toHaveAttribute('data-guidance-stage', 'no-picture')
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toHaveTextContent('PICTURE JOURNEY')
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toHaveTextContent('PICTURE 1')
    expect(screen.getByTestId('lot-picture-guidance-title')).toHaveTextContent('No picture yet')
    // Engine copy is not pinned here — only that a real imperative step exists and names
    // a destination the renderer can address.
    const step = screen.getByTestId('lot-picture-guidance-next')
    expect(step).toHaveAttribute('data-guidance-kind', 'commission')
    expect(step.textContent?.trim().length ?? 0).toBeGreaterThan(0)
  })
})

describe('The next step points at the world — it never teleports to a screen', () => {
  it('pans to Development and selects it, landing its in-world context', async () => {
    projection.override = { kind: 'value', value: journey({
      stage: 'no-picture',
      pictureTitle: null,
      headline: 'No screenplay',
      detail: null,
    }) }
    const { routes } = renderLot(managedWeekZero('picture-guidance-pan-development'))
    const view = await onlyView()

    fireEvent.click(screen.getByTestId('lot-picture-guidance-next'))

    // Selection: the same seam an ordinary click on the building uses.
    expect(view.selectedBuildings).toContain('writers')
    // Camera: a PAN to the physical place, by the world's own place vocabulary.
    expect(view.framed).toContain('development')
    // Never a zoom command, never a teleport, never a full-screen management screen.
    expect(view.cameraPresets).toEqual([])
    expect(view.cameraResets).toBe(0)
    expect(routes).toEqual([])
    expect(screen.getByTestId('lot-building-inspector-writers')).toBeInTheDocument()
  })

  it('pans to Casting for a casting step', async () => {
    projection.override = { kind: 'value', value: journey({
      stage: 'ready-to-package',
      headline: 'Screenplay accepted',
      detail: null,
      next: { kind: 'plan-auditions', label: 'Plan auditions at Casting', site: 'casting' },
    }) }
    const { routes } = renderLot(managedWeekZero('picture-guidance-pan-casting'))
    const view = await onlyView()

    fireEvent.click(screen.getByRole('button', { name: 'Plan auditions at Casting' }))

    expect(view.selectedBuildings).toContain('casting')
    expect(view.framed).toContain('casting-office')
    expect(routes).toEqual([])
  })

  it('never duplicates the week-advance control', async () => {
    projection.override = { kind: 'value', value: journey({
      stage: 'auditioning',
      headline: 'Auditions running',
      detail: null,
      next: { kind: 'advance-week', label: 'Wait for the audition results', site: null },
      waiting: {
        untilWeek: 2,
        reason: 'The camera tests finish in Week 2 — advance the week.',
      },
    }) }
    renderLot(managedWeekZero('picture-guidance-waiting'))
    await onlyView()

    expect(screen.queryByTestId('lot-picture-guidance-next')).not.toBeInTheDocument()
    // ONE quiet line about the wait, in the engine's own words. The card used to add a
    // second "Waiting — advance the week" underneath it (live-playtest finding).
    expect(screen.getByTestId('lot-picture-guidance-waiting').textContent).toBe(
      'The camera tests finish in Week 2 — advance the week.',
    )
    expect(screen.queryByTestId('lot-picture-guidance-status')).not.toBeInTheDocument()
  })
})

describe('The Picture Journey survives greenlight beside the production readout', () => {
  it('keeps the next step visible while retaining the existing production facts', async () => {
    projection.override = { kind: 'value', value: journey({
      stage: 'in-production',
      beat: 'shooting',
      headline: 'SHOOTING',
      whatHappened: 'Principal photography is underway.',
      whyItMatters: 'The company is now making the picture on its reserved stage.',
      next: null,
    }) }
    renderLot(greenlitStudio('picture-guidance-greenlit'))
    await onlyView()

    const card = screen.getByTestId('hollywood-current-production')
    expect(card).toBeInTheDocument()
    expect(screen.queryByTestId('hollywood-production-idle')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-picture-guidance')).toBeInTheDocument()
    expect(screen.getByTestId('lot-picture-guidance-headline')).toHaveTextContent('SHOOTING')
    expect(screen.getByTestId('lot-picture-guidance-status')).toHaveTextContent('No action required.')
    // The operation readout still carries phase and its own progress meter.
    expect(card).toHaveTextContent('Phase')
    expect(card).toHaveTextContent('Weeks left')
  })
})

describe('Honest degradation at the projection boundary', () => {
  it('keeps the studio-truth idle card when no projection is present at all', async () => {
    projection.override = { kind: 'absent' }
    renderLot(managedWeekZero('picture-guidance-absent'))
    await onlyView()

    const desk = screen.getByTestId('hollywood-production-idle')
    expect(desk).toHaveTextContent('No active production')
    expect(screen.queryByTestId('lot-picture-guidance')).not.toBeInTheDocument()
  })

  it('claims nothing at all when a projection is present but malformed', async () => {
    projection.override = { kind: 'value', value: { ...journey(), stage: 'daydreaming' } }
    renderLot(managedWeekZero('picture-guidance-malformed'))
    await onlyView()

    const desk = screen.getByTestId('hollywood-production-idle')
    // A projection it cannot trust must not silently become the old lie.
    expect(desk).not.toHaveTextContent('The studio lot is idle')
    expect(screen.getByTestId('lot-picture-guidance')).toHaveAttribute(
      'data-guidance-stage',
      'unavailable',
    )
    expect(screen.queryByTestId('lot-picture-guidance-next')).not.toBeInTheDocument()
  })
})
