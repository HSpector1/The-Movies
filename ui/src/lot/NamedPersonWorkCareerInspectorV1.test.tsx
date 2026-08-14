import { useState } from 'react'
import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
} from '../../../src/core/index.ts'
import type { CreativeRole, GameState } from '../../../src/core/index.ts'
import * as adapter from '../engine/adapter.ts'
import { setOperationHollywoodOverride } from '../flags.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import type {
  BuildingId,
  LotPersonState,
  StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'

type FakeViewOptions = {
  parent: HTMLElement
  snapshot: StudioLotSnapshot
  onReady?: () => void
  onHollywoodPerson?: (person: LotPersonState | null) => void
  onHollywoodPlace?: (place: {
    id: string
    buildingId: BuildingId
    label: string
    affordances: string[]
  } | null) => void
}

// The existing Lot host tests establish this boundary with a renderer test double.
// Keep a real DOM canvas in this smaller double so modal suspension can also prove
// that the world node and view identity survive prop transitions.
const viewHarness = vi.hoisted(() => {
  class FakeStudioLotView {
    readonly opts: FakeViewOptions
    readonly canvas: HTMLCanvasElement
    readonly inputSuspension: boolean[] = []
    readonly selectedPeople: string[] = []
    destroyed = false

    constructor(opts: FakeViewOptions) {
      this.opts = opts
      this.canvas = document.createElement('canvas')
      this.canvas.dataset.testid = 'named-person-live-world-canvas'
      opts.parent.appendChild(this.canvas)
      viewHarness.instances.push(this)
      queueMicrotask(() => opts.onReady?.())
    }

    setSnapshot() {}
    select() {}
    clearSelection() {}
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    camera() {}
    showHollywoodPublicity() {}
    selectHollywoodProduction() {}
    selectHollywoodAnnexPlace() { return true }
    selectHollywoodSceneryLoadIn() { return true }
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {}
    selectHollywoodPerson(id: string) { this.selectedPeople.push(id) }
    setInputSuspended(on: boolean) { this.inputSuspension.push(on) }

    destroy() {
      this.destroyed = true
      this.canvas.remove()
    }
  }

  return {
    FakeStudioLotView,
    instances: [] as FakeStudioLotView[],
  }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: viewHarness.FakeStudioLotView }))

function foundManagedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((talent) => talent.id === id)!,
  )
  const byRole = (role: CreativeRole, count: number) =>
    applicants.filter((talent) => talent.role === role).slice(0, count)
  const hires = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) {
    state = applyActions(state, [{
      kind: 'signContract',
      talentId: hire.id,
      termWeeks: 156,
    }])
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [{ kind: 'activateStudioOperations' }])
}

function contractedIds(state: GameState, role: CreativeRole): string[] {
  return state.contracts
    .map((contract) => state.talent.find((talent) => talent.id === contract.talentId)!)
    .filter((talent) => talent.role === role)
    .map((talent) => talent.id)
}

/**
 * Public greenlight law allows every talent to practise every discipline. Swap
 * the primary Writer and Director so the person occupying the exact Director
 * slot has a Writer career home without creating a hostile state.
 */
function crossDisciplineShooting(seed: string): GameState {
  let state = foundManagedStudio(seed)
  const concept = state.concepts[0]!
  const actors = contractedIds(state, 'actor')
  const primaryDirector = contractedIds(state, 'director')[0]!
  const primaryWriter = contractedIds(state, 'writer')[0]!
  state = applyActions(state, [{
    kind: 'greenlight',
    production: {
      conceptId: concept.id,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: {
          intimacy: [-0.5, 0.5],
          tonalWeight: [-0.5, 0.5],
          kineticEnergy: [-0.5, 0.5],
        },
      },
      writerId: primaryDirector,
      directorId: primaryWriter,
      cast: {
        lead: actors[0]!,
        antagonist: actors[1]!,
        support: actors[2]!,
      },
      craftIds: [contractedIds(state, 'craft')[0]!],
      budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
    },
  }])
  for (let week = 0; week < 4; week++) state = tick(state)
  return state
}

function lotProps(state: GameState) {
  return {
    state,
    onNavigate: () => {},
    onExit: () => {},
    onAdvance: () => {},
  }
}

function selectedPeople(snapshot: StudioLotSnapshot) {
  const director = snapshot.people.find((person) => person.role === 'director')!
  const lead = snapshot.people.find((person) => person.role === 'talent')!
  return { director, lead }
}

beforeEach(() => {
  setOperationHollywoodOverride(true)
  viewHarness.instances.length = 0
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  setOperationHollywoodOverride(false)
  viewHarness.instances.length = 0
})

describe('World-First Named Person Work & Career Inspector V1', () => {
  it('shows exact managed Director and Lead facts, permits an exact cross-discipline profile, and emits only that ID', async () => {
    const state = crossDisciplineShooting('named-person-exact-facts')
    const snapshot = adapter.studioLotSnapshot(state)
    const operation = snapshot.productionOperations![0]!
    const { director, lead } = selectedPeople(snapshot)
    const directorTalent = state.talent.find((talent) => talent.id === director.id)!
    expect(directorTalent.role).toBe('writer')

    const onOpenTalentProfile = vi.fn()
    const screen = render(
      <StudioLotScreen
        {...lotProps(state)}
        onOpenTalentProfile={onOpenTalentProfile}
      />,
    )
    await waitFor(() => expect(viewHarness.instances).toHaveLength(1))

    fireEvent.click(screen.getByTestId(`hollywood-select-person-${director.id}`))
    const directorFacts = within(screen.getByTestId('hollywood-person-work-facts'))
    expect(directorFacts.getByText('Director')).toBeInTheDocument()
    expect(directorFacts.getByText(operation.title)).toBeInTheDocument()
    expect(directorFacts.getByText(operation.phaseLabel)).toBeInTheDocument()
    expect(directorFacts.getByText(operation.facilityLabel)).toBeInTheDocument()
    expect(directorFacts.getByText(operation.statusLabel)).toBeInTheDocument()
    expect(directorFacts.getByText(`${operation.weeksRemaining} production weeks remaining`)).toBeInTheDocument()
    expect(directorFacts.getByText(operation.taskStatus!)).toBeInTheDocument()
    expect(screen.getByTestId('hollywood-person-career-summary')).toHaveTextContent(
      `Engaged on ${operation.title}`,
    )
    expect(screen.getByTestId('hollywood-person-career-summary')).toHaveTextContent(
      'Writer · not yet proven',
    )
    fireEvent.click(screen.getByTestId(`hollywood-open-talent-profile-${director.id}`))
    expect(onOpenTalentProfile).toHaveBeenLastCalledWith(director.id)

    fireEvent.click(screen.getByTestId(`hollywood-select-person-${lead.id}`))
    const leadFacts = within(screen.getByTestId('hollywood-person-work-facts'))
    expect(leadFacts.getByText('Lead actor')).toBeInTheDocument()
    expect(leadFacts.getByText(operation.title)).toBeInTheDocument()
    expect(leadFacts.getByText(operation.phaseLabel)).toBeInTheDocument()
    expect(leadFacts.getByText(operation.facilityLabel)).toBeInTheDocument()
    expect(leadFacts.getByText(operation.statusLabel)).toBeInTheDocument()
    expect(leadFacts.getByText(`${operation.weeksRemaining} production weeks remaining`)).toBeInTheDocument()
    expect(leadFacts.queryByText('Director task')).not.toBeInTheDocument()
    expect(screen.queryByTestId(`hollywood-task-status-${operation.productionId}`)).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-person-career-summary')).toHaveTextContent(
      'Actor · not yet proven',
    )
    fireEvent.click(screen.getByTestId(`hollywood-open-talent-profile-${lead.id}`))
    expect(onOpenTalentProfile.mock.calls).toEqual([[director.id], [lead.id]])
  })

  it('withholds career copy and profile handoff when whole-studio assignment identity is ambiguous', () => {
    const valid = crossDisciplineShooting('named-person-ambiguous-assignment')
    const production = valid.studio.activeProductions[0]!
    const state: GameState = {
      ...valid,
      studio: {
        ...valid.studio,
        activeProductions: [{
          ...production,
          // Hostile accepted-state shape: one ID now fills two active roles. The
          // exact operation participant still joins, but the profile gate must not.
          writerId: production.directorId,
        }],
      },
    }
    const snapshot = adapter.studioLotSnapshot(state)
    const director = selectedPeople(snapshot).director
    const onOpenTalentProfile = vi.fn()
    const screen = render(
      <StudioLotScreen
        {...lotProps(state)}
        onOpenTalentProfile={onOpenTalentProfile}
      />,
    )

    fireEvent.click(screen.getByTestId(`hollywood-select-person-${director.id}`))
    expect(screen.getByTestId('hollywood-person-work-facts')).toHaveTextContent(
      snapshot.productionOperations![0]!.title,
    )
    expect(screen.getByTestId('hollywood-person-career-summary')).toHaveTextContent(
      'Assignment details unavailable',
    )
    expect(screen.getByTestId('hollywood-person-career-summary')).toHaveTextContent(
      'Career details unavailable',
    )
    expect(screen.queryByTestId(`hollywood-open-talent-profile-${director.id}`)).not.toBeInTheDocument()
    expect(onOpenTalentProfile).not.toHaveBeenCalled()
  })

  it('withholds assignment, career, and profile handoff when current-work projection is unavailable', () => {
    const state = crossDisciplineShooting('named-person-unavailable-work')
    const snapshot = adapter.studioLotSnapshot(state)
    const director = selectedPeople(snapshot).director
    const operation = { ...snapshot.productionOperations![0]! }
    delete operation.leadId
    delete operation.leadName
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue({
      ...snapshot,
      productionOperations: [operation],
    })
    const onOpenTalentProfile = vi.fn()
    const screen = render(
      <StudioLotScreen
        {...lotProps(state)}
        onOpenTalentProfile={onOpenTalentProfile}
      />,
    )

    fireEvent.click(screen.getByTestId(`hollywood-select-person-${director.id}`))
    expect(screen.getByTestId('hollywood-person-work-unavailable')).toBeInTheDocument()
    expect(screen.getByTestId('hollywood-person-career-summary')).toHaveTextContent(
      'Assignment details unavailable',
    )
    expect(screen.getByTestId('hollywood-person-career-summary')).toHaveTextContent(
      'Career details unavailable',
    )
    expect(screen.queryByTestId(`hollywood-open-talent-profile-${director.id}`)).not.toBeInTheDocument()
    expect(onOpenTalentProfile).not.toHaveBeenCalled()
  })

  it('keeps one mounted world and selected person while modal input suspension turns on and off', async () => {
    const state = crossDisciplineShooting('named-person-mounted-world')
    const snapshot = adapter.studioLotSnapshot(state)
    const director = selectedPeople(snapshot).director
    const stableNavigate = () => {}
    const stableExit = () => {}
    const stableAdvance = () => {}
    const screen = render(
      <StudioLotScreen
        state={state}
        onNavigate={stableNavigate}
        onExit={stableExit}
        onAdvance={stableAdvance}
        worldInputSuspended={false}
      />,
    )
    await waitFor(() => expect(viewHarness.instances).toHaveLength(1))
    const view = viewHarness.instances[0]!
    const canvas = screen.getByTestId('named-person-live-world-canvas')
    fireEvent.click(screen.getByTestId(`hollywood-select-person-${director.id}`))

    screen.rerender(
      <StudioLotScreen
        state={state}
        onNavigate={stableNavigate}
        onExit={stableExit}
        onAdvance={stableAdvance}
        worldInputSuspended
      />,
    )
    await waitFor(() => expect(view.inputSuspension.at(-1)).toBe(true))
    expect(viewHarness.instances).toEqual([view])
    expect(screen.getByTestId('named-person-live-world-canvas')).toBe(canvas)
    expect(screen.getByTestId(`hollywood-select-person-${director.id}`)).toHaveAttribute('aria-pressed', 'true')
    expect(view.destroyed).toBe(false)

    screen.rerender(
      <StudioLotScreen
        state={state}
        onNavigate={stableNavigate}
        onExit={stableExit}
        onAdvance={stableAdvance}
        worldInputSuspended={false}
      />,
    )
    await waitFor(() => expect(view.inputSuspension.at(-1)).toBe(false))
    expect(viewHarness.instances).toEqual([view])
    expect(screen.getByTestId('named-person-live-world-canvas')).toBe(canvas)
    expect(screen.getByTestId(`hollywood-select-person-${director.id}`)).toHaveAttribute('aria-pressed', 'true')
  })

  it('withholds Director dispatch from the selected Lead while retaining exact Director and picture interventions', async () => {
    const initial = crossDisciplineShooting('named-person-lead-command-focus')
    const { director, lead } = selectedPeople(adapter.studioLotSnapshot(initial))
    const dispatched: string[] = []

    function Host() {
      const [state, setState] = useState(initial)
      return (
        <StudioLotScreen
          {...lotProps(state)}
          onProductionCommand={(command) => {
            dispatched.push(command.kind)
            const result = adapter.runProductionCommand(state, command)
            if (!result.ok) throw new Error(result.error)
            setState(result.next)
          }}
        />
      )
    }

    const screen = render(<Host />)

    // The production-level Studio Desk retains the legal operation command.
    expect(screen.getByTestId('hollywood-production-command-assignShootingDirector')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId(`hollywood-select-person-${lead.id}`))
    expect(screen.queryByTestId('hollywood-production-command-assignShootingDirector')).not.toBeInTheDocument()
    expect(dispatched).toEqual([])

    fireEvent.click(screen.getByTestId(`hollywood-select-person-${director.id}`))
    fireEvent.click(screen.getByTestId('hollywood-production-command-assignShootingDirector'))
    const clear = await screen.findByTestId('hollywood-production-command-clearSceneryLoadIn')
    await waitFor(() => expect(clear).toHaveFocus())

    // Clear and Schedule belong to the picture, not exclusively to its Director.
    fireEvent.click(screen.getByTestId(`hollywood-select-person-${lead.id}`))
    fireEvent.click(clear)
    const schedule = await screen.findByTestId('hollywood-production-command-scheduleShootingTake')
    await waitFor(() => expect(schedule).toHaveFocus())
    fireEvent.click(schedule)

    const personStatus = screen.getByTestId('hollywood-person-inspector-status')
    await waitFor(() => expect(personStatus).toHaveFocus())
    expect(screen.queryByTestId(/^hollywood-task-status-/)).not.toBeInTheDocument()
    expect(dispatched).toEqual([
      'assignShootingDirector',
      'clearSceneryLoadIn',
      'scheduleShootingTake',
    ])
  })

  it('closes once and moves focus to the surviving named-people group when the open person disappears', async () => {
    const state = crossDisciplineShooting('named-person-disappears')
    const completeSnapshot = adapter.studioLotSnapshot(state)
    const { director, lead } = selectedPeople(completeSnapshot)
    let currentSnapshot = completeSnapshot
    vi.spyOn(adapter, 'studioLotSnapshot').mockImplementation(() => currentSnapshot)
    const onOpen = vi.fn()
    const onClose = vi.fn()

    function Host({ revision }: { revision: number }) {
      const [openId, setOpenId] = useState<string | null>(null)
      return (
        <StudioLotScreen
          {...lotProps(state)}
          key="retained-lot"
          onOpenTalentProfile={(personId) => {
            onOpen(personId)
            setOpenId(personId)
          }}
          onCloseTalentProfile={(personId) => {
            onClose(personId)
            setOpenId((current) => current === personId ? null : current)
          }}
          openTalentProfileId={openId}
          worldInputSuspended={openId !== null}
          advanceFeedback={revision < 0 ? { week: revision, constructionCompletion: null } : null}
        />
      )
    }

    const screen = render(<Host revision={0} />)
    fireEvent.click(screen.getByTestId(`hollywood-select-person-${director.id}`))
    fireEvent.click(screen.getByTestId(`hollywood-open-talent-profile-${director.id}`))
    expect(onOpen).toHaveBeenCalledWith(director.id)

    currentSnapshot = {
      ...completeSnapshot,
      people: [lead],
    }
    screen.rerender(<Host revision={1} />)

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(onClose).toHaveBeenCalledWith(director.id)
    await waitFor(() => expect(
      screen.getByRole('group', { name: 'Named studio people' }),
    ).toHaveFocus())
    expect(screen.queryByTestId(`hollywood-select-person-${director.id}`)).not.toBeInTheDocument()
    expect(screen.getByTestId(`hollywood-select-person-${lead.id}`)).toHaveAttribute('aria-pressed', 'false')

    currentSnapshot = completeSnapshot
    screen.rerender(<Host revision={2} />)
    await waitFor(() => expect(
      screen.getByTestId(`hollywood-select-person-${director.id}`),
    ).toHaveAttribute('aria-pressed', 'false'))
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId(`hollywood-open-talent-profile-${director.id}`)).not.toBeInTheDocument()
  })

  it('clears a raw open ID when the full handoff becomes invalid and never auto-reopens it', async () => {
    const valid = crossDisciplineShooting('named-person-stale-profile-handoff')
    const snapshot = adapter.studioLotSnapshot(valid)
    const director = selectedPeople(snapshot).director
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue(snapshot)
    const missingProfile: GameState = {
      ...valid,
      talent: valid.talent.filter((person) => person.id !== director.id),
    }
    const production = valid.studio.activeProductions[0]!
    const ambiguousAssignment: GameState = {
      ...valid,
      studio: {
        ...valid.studio,
        activeProductions: [{ ...production, writerId: production.directorId }],
      },
    }
    const onOpen = vi.fn()
    const onClose = vi.fn()

    function Host({ state }: { state: GameState }) {
      const [openId, setOpenId] = useState<string | null>(null)
      return (
        <StudioLotScreen
          {...lotProps(state)}
          onOpenTalentProfile={(personId) => {
            onOpen(personId)
            setOpenId(personId)
          }}
          onCloseTalentProfile={(personId) => {
            onClose(personId)
            setOpenId((current) => current === personId ? null : current)
          }}
          openTalentProfileId={openId}
          worldInputSuspended={openId !== null}
        />
      )
    }

    const screen = render(<Host state={valid} />)
    fireEvent.click(screen.getByTestId(`hollywood-select-person-${director.id}`))
    fireEvent.click(screen.getByTestId(`hollywood-open-talent-profile-${director.id}`))
    screen.rerender(<Host state={missingProfile} />)
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))

    screen.rerender(<Host state={valid} />)
    await waitFor(() => expect(
      screen.getByTestId(`hollywood-open-talent-profile-${director.id}`),
    ).toBeInTheDocument())
    expect(onOpen).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId(`hollywood-open-talent-profile-${director.id}`))
    screen.rerender(<Host state={ambiguousAssignment} />)
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(2))
    expect(onClose).toHaveBeenNthCalledWith(1, director.id)
    expect(onClose).toHaveBeenNthCalledWith(2, director.id)
    expect(screen.queryByTestId(`hollywood-open-talent-profile-${director.id}`)).not.toBeInTheDocument()

    screen.rerender(<Host state={valid} />)
    await waitFor(() => expect(
      screen.getByTestId(`hollywood-open-talent-profile-${director.id}`),
    ).toBeInTheDocument())
    expect(onOpen).toHaveBeenCalledTimes(2)
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
