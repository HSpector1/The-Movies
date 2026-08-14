import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import { App } from '../App.tsx'
import {
  advanceWeek,
  exportSaveJson,
  greenlight,
  productionDecision,
  requiredNegative,
  runProductionCommand,
  studioLotSnapshot,
} from '../engine/adapter.ts'
import type { CreativeRole, DraftPackage, GameState } from '../engine/adapter.ts'
import {
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
} from '../engine/session.ts'
import {
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import { foundedRosterIds, newFoundedGame } from '../test/founding.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'

const renderer = vi.hoisted(() => {
  const controls = { constructError: null as Error | null }
  const instances: FakeView[] = []
  class FakeView {
    snapshots: Array<{ week: number }> = []
    destroyed = false
    cameraPresets: string[] = []
    reduced: boolean[] = []
    hollywoodPeopleSelected: string[] = []
    hollywoodPersonClears = 0
    constructor(options: {
      snapshot: { week: number }
      onReady?: () => void
    }) {
      if (controls.constructError !== null) throw controls.constructError
      this.snapshots.push(options.snapshot)
      instances.push(this)
      queueMicrotask(() => options.onReady?.())
    }
    setSnapshot(snapshot: { week: number }) { this.snapshots.push(snapshot) }
    select() {}
    clearSelection() {}
    clearHollywoodPersonSelection() { this.hollywoodPersonClears++ }
    clearHollywoodPlaceSelection() {}
    selectHollywoodPerson(id: string) { this.hollywoodPeopleSelected.push(id) }
    selectHollywoodProduction() {}
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion(on: boolean) { this.reduced.push(on) }
    setIdentityMode() {}
    setSignageMasked() {}
    camera(preset: string) { this.cameraPresets.push(preset) }
    showHollywoodPublicity() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    destroy() { this.destroyed = true }
  }
  return { controls, FakeView, instances }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const ids = (role: CreativeRole) => foundedRosterIds(state, role)
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.4, 0.4],
        tonalWeight: [-0.4, 0.4],
        kineticEnergy: [-0.4, 0.4],
      },
    },
    writerId: ids('writer')[0]!,
    directorId: ids('director')[0]!,
    craftIds: [ids('craft')[0]!],
    cast: {
      lead: ids('actor')[0]!,
      antagonist: ids('actor')[1]!,
      support: ids('actor')[2]!,
    },
    budget: {
      negative: requiredNegative(concept, shape, state),
      marketing: 400_000,
    },
  }
}

function greenlightOne(state: GameState): GameState {
  const result = greenlight(state, legalPackage(state))
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function scheduledStage7State(seed: string): GameState {
  let state = applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
  state = greenlightOne(state)
  for (let guard = 0; guard < 20; guard++) {
    const decision = productionDecision(state)
    if (decision?.command?.kind === 'assignShootingDirector') break
    state = advanceWeek(state).next
  }
  for (let i = 0; i < 3; i++) {
    const command = productionDecision(state)?.command
    if (!command) throw new Error(`expected shooting command ${String(i + 1)}`)
    const result = runProductionCommand(state, command)
    if (!result.ok) throw new Error(result.error)
    state = result.next
  }
  const operation = studioLotSnapshot(state).productionOperations?.[0]
  if (operation?.taskStatus !== 'scheduled' || operation.locationBuildingId !== 'stage-a') {
    throw new Error('expected a scheduled authoritative Stage 7 operation')
  }
  return state
}

function releaseNextState(seed: string): GameState {
  let state = greenlightOne(newFoundedGame(seed))
  for (let guard = 0; guard < 30; guard++) {
    const step = advanceWeek(state)
    if (step.released.length > 0) return state
    state = step.next
  }
  throw new Error('expected a release-next state')
}

beforeEach(() => {
  localStorage.clear()
  resetLotStageAssignment()
  renderer.instances.length = 0
  renderer.controls.constructError = null
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  clearActiveSession()
  localStorage.clear()
  resetLotStageAssignment()
  renderer.instances.length = 0
  renderer.controls.constructError = null
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('World-First Live Week Advance V1 — App authority and routing', () => {
  it('returns a real building-origin deep route to that exact companion focus', async () => {
    saveActiveSession(newFoundedGame('studio-home-real-selected-building-return'))

    render(<App />)
    await screen.findByTestId('studio-lot-screen')
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    fireEvent.click(await screen.findByTestId('assembly-back-dashboard'))

    await screen.findByTestId('studio-lot-screen')
    await waitFor(() => expect(screen.getByTestId('lot-nav-writers')).toHaveFocus())
    expect(screen.getByTestId('lot-nav-stage-a')).not.toHaveFocus()
  })

  for (const activation of ['pointer', 'keyboard'] as const) {
    it(`${activation} activation records Stage 7 through one exact App-owned tick`, async () => {
      const pre = scheduledStage7State(`live-week-stage7-${activation}`)
      const expected = advanceWeek(pre)
      expect(expected.released).toHaveLength(0)
      saveActiveSession(pre)

      render(<App />)
      const lot = await screen.findByTestId('studio-lot-screen')
      await waitFor(() => expect(renderer.instances).toHaveLength(1))
      const view = renderer.instances[0]!
      await waitFor(() => expect(view.snapshots.length).toBeGreaterThan(1))
      const snapshotsBefore = view.snapshots.length
      fireEvent.click(screen.getByTestId('lot-nav-stage-a'))
      const advance = screen.getByTestId('lot-advance-week')
      advance.focus()

      if (activation === 'pointer') {
        fireEvent.click(advance)
      } else {
        await userEvent.keyboard('{Enter}')
      }

      await waitFor(() => expect(screen.getByTestId('lot-week-update-announcement')).toHaveTextContent(
        `Week ${expected.next.market.tick}. Studio Lot updated.`,
      ))
      expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
      expect(screen.queryByTestId('no-week-releases')).not.toBeInTheDocument()
      expect(screen.getByText('Shooting beat completed')).toBeInTheDocument()
      expect(screen.getByTestId('lot-advance-week')).toBe(advance)
      expect(advance).toHaveFocus()
      expect(renderer.instances).toHaveLength(1)
      expect(view.destroyed).toBe(false)
      expect(view.cameraPresets).toEqual([])
      expect(view.snapshots).toHaveLength(snapshotsBefore + 1)
      expect(view.snapshots.at(-1)?.week).toBe(expected.next.market.tick)

      await waitFor(() => {
        const restored = loadActiveSession()
        expect(restored.ok).toBe(true)
        if (!restored.ok) return
        expect(exportSaveJson(restored.state)).toBe(exportSaveJson(expected.next))
        expect(restored.state.rngState).toBe(expected.next.rngState)
      })
      expect(exportSaveJson(pre)).toBe(exportSaveJson(expected.preTick))
    })
  }

  it('preserves the selected named person and production context through a same-world tick', async () => {
    const pre = scheduledStage7State('live-week-person-continuity')
    const expected = advanceWeek(pre)
    expect(expected.released).toHaveLength(0)
    const snapshot = studioLotSnapshot(pre)
    const operation = snapshot.productionOperations?.[0]
    if (!operation) throw new Error('expected an authoritative Stage 7 operation')
    const person = snapshot.people.find((candidate) => candidate.id === operation.directorId)
    if (!person) throw new Error('expected the named Stage 7 director in the lot')
    saveActiveSession(pre)

    render(<App />)
    const lot = await screen.findByTestId('studio-lot-screen')
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    const view = renderer.instances[0]!
    const personButton = screen.getByTestId(`hollywood-select-person-${person.id}`)
    fireEvent.click(personButton)
    expect(personButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { level: 3, name: person.name })).toBeInTheDocument()
    expect(screen.getByTestId('hollywood-person-work-facts')).toHaveTextContent('Role on pictureDirector')
    expect(screen.getByTestId('hollywood-person-work-facts')).toHaveTextContent(`Picture${operation.title}`)
    expect(view.hollywoodPeopleSelected).toEqual([person.id])
    const advance = screen.getByTestId('lot-advance-week')

    fireEvent.click(advance)
    await waitFor(() => expect(screen.getByTestId('lot-week-update-announcement')).toHaveTextContent(
      `Week ${expected.next.market.tick}. Studio Lot updated.`,
    ))

    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId(`hollywood-select-person-${person.id}`)).toBe(personButton)
    expect(personButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { level: 2, name: operation.title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: person.name })).toBeInTheDocument()
    expect(screen.getByTestId('hollywood-person-work-facts')).toHaveTextContent('Role on pictureDirector')
    expect(screen.getByTestId('hollywood-person-work-facts')).toHaveTextContent(`Picture${operation.title}`)
    expect(screen.getByTestId('hollywood-person-work-facts')).toHaveTextContent(
      'Production statusShooting beat completed',
    )
    expect(renderer.instances).toEqual([view])
    expect(view.hollywoodPeopleSelected).toEqual([person.id])
    expect(view.hollywoodPersonClears).toBe(0)
    expect(view.cameraPresets).toEqual([])
    expect(view.destroyed).toBe(false)
  })

  it('routes a real release without a Gazette to ReleaseResult and back to the initiating lot', async () => {
    const modern = releaseNextState('live-week-no-gazette')
    const legacyShape: GameState = {
      ...modern,
      studio: {
        ...modern.studio,
        activeProductions: modern.studio.activeProductions.map((production) => {
          const copy = { ...production }
          delete copy.participants
          return copy
        }),
      },
    }
    const expected = advanceWeek(legacyShape)
    expect(expected.released).toHaveLength(1)
    expect(expected.released[0]?.participants).toBeUndefined()
    saveActiveSession(legacyShape)

    render(<App />)
    await screen.findByTestId('studio-lot-screen')
    fireEvent.click(screen.getByTestId('lot-advance-week'))

    expect(screen.queryByTestId('newspaper-reveal')).not.toBeInTheDocument()
    expect(screen.getByTestId('release-list')).toBeInTheDocument()
    const title = legacyShape.concepts.find(
      (concept) => concept.id === expected.released[0]!.conceptId,
    )?.title
    if (!title) throw new Error('expected release title')
    expect(screen.getByRole('heading', { level: 2, name: title })).toHaveFocus()
    await waitFor(() => {
      const restored = loadActiveSession()
      expect(restored.ok).toBe(true)
      if (restored.ok) expect(exportSaveJson(restored.state)).toBe(exportSaveJson(expected.next))
    })

    fireEvent.click(screen.getByTestId('release-continue'))
    await screen.findByTestId('studio-lot-screen')
    expect(screen.getByTestId('lot-advance-week')).toHaveFocus()
  })

  it('consumes the freshly rendered App state across two deliberate lot activations', async () => {
    const pre = newFoundedGame('live-week-sequential-app')
    const first = advanceWeek(pre)
    const second = advanceWeek(first.next)
    expect(first.released).toHaveLength(0)
    expect(second.released).toHaveLength(0)
    saveActiveSession(pre)

    render(<App />)
    const lot = await screen.findByTestId('studio-lot-screen')
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    const view = renderer.instances[0]!
    const advance = screen.getByTestId('lot-advance-week')
    advance.focus()

    fireEvent.click(advance)
    await waitFor(() => expect(screen.getByTestId('lot-week-update-announcement')).toHaveTextContent(
      `Week ${first.next.market.tick}. Studio Lot updated.`,
    ))
    fireEvent.click(advance)
    await waitFor(() => expect(screen.getByTestId('lot-week-update-announcement')).toHaveTextContent(
      `Week ${second.next.market.tick}. Studio Lot updated.`,
    ))

    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('lot-advance-week')).toBe(advance)
    expect(advance).toHaveFocus()
    expect(renderer.instances).toEqual([view])
    expect(view.destroyed).toBe(false)
    expect(view.snapshots.at(-1)?.week).toBe(second.next.market.tick)
    await waitFor(() => {
      const restored = loadActiveSession()
      expect(restored.ok).toBe(true)
      if (!restored.ok) return
      expect(exportSaveJson(restored.state)).toBe(exportSaveJson(second.next))
      expect(restored.state.rngState).toBe(second.next.rngState)
    })
  })

  it('keeps reduced motion state/RNG/route/focus parity for an App-owned lot tick', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    const pre = newFoundedGame('live-week-reduced-motion')
    const expected = advanceWeek(pre)
    expect(expected.released).toHaveLength(0)
    saveActiveSession(pre)

    render(<App />)
    const lot = await screen.findByTestId('studio-lot-screen')
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    const view = renderer.instances[0]!
    await waitFor(() => expect(view.reduced).toContain(true))
    const advance = screen.getByTestId('lot-advance-week')
    advance.focus()
    fireEvent.click(advance)

    await waitFor(() => expect(screen.getByTestId('lot-week-update-announcement')).toHaveTextContent(
      `Week ${expected.next.market.tick}. Studio Lot updated.`,
    ))
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(advance).toHaveFocus()
    expect(renderer.instances).toEqual([view])
    await waitFor(() => {
      const restored = loadActiveSession()
      expect(restored.ok).toBe(true)
      if (!restored.ok) return
      expect(exportSaveJson(restored.state)).toBe(exportSaveJson(expected.next))
      expect(restored.state.rngState).toBe(expected.next.rngState)
    })
  })

  it('keeps the exact App-owned tick available when the renderer constructor fails', async () => {
    const pre = newFoundedGame('live-week-renderer-failure')
    const expected = advanceWeek(pre)
    expect(expected.released).toHaveLength(0)
    saveActiveSession(pre)
    renderer.controls.constructError = new Error('isolated renderer failure')

    render(<App />)
    const lot = await screen.findByTestId('studio-lot-screen')
    await screen.findByTestId('lot-canvas-fallback')
    expect(renderer.instances).toHaveLength(0)
    const advance = screen.getByTestId('lot-advance-week')
    advance.focus()
    fireEvent.click(advance)

    await waitFor(() => expect(screen.getByTestId('lot-week-update-announcement')).toHaveTextContent(
      `Week ${expected.next.market.tick}. Studio Lot updated.`,
    ))
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('lot-canvas-fallback')).toBeInTheDocument()
    expect(advance).toHaveFocus()
    await waitFor(() => {
      const restored = loadActiveSession()
      expect(restored.ok).toBe(true)
      if (!restored.ok) return
      expect(exportSaveJson(restored.state)).toBe(exportSaveJson(expected.next))
      expect(restored.state.rngState).toBe(expected.next.rngState)
    })
  })

  it('returns from a no-Gazette ReleaseResult Autopsy to the initiating lot', async () => {
    const modern = releaseNextState('live-week-release-result-autopsy')
    const pre: GameState = {
      ...modern,
      studio: {
        ...modern.studio,
        activeProductions: modern.studio.activeProductions.map((production) => {
          const copy = { ...production }
          delete copy.participants
          return copy
        }),
      },
    }
    const expected = advanceWeek(pre)
    const film = expected.released[0]
    if (!film) throw new Error('expected a release-next film')
    expect(film.participants).toBeUndefined()
    saveActiveSession(pre)

    render(<App />)
    await screen.findByTestId('studio-lot-screen')
    fireEvent.click(screen.getByTestId('lot-advance-week'))
    expect(screen.queryByTestId('newspaper-reveal')).not.toBeInTheDocument()
    expect(screen.getByTestId('release-list')).toBeInTheDocument()
    await waitFor(() => {
      const restored = loadActiveSession()
      expect(restored.ok).toBe(true)
      if (restored.ok) expect(exportSaveJson(restored.state)).toBe(exportSaveJson(expected.next))
    })

    fireEvent.click(screen.getByTestId(`open-autopsy-${film.productionId}`))
    expect(screen.getByTestId('autopsy')).toBeInTheDocument()
    const title = pre.concepts.find((concept) => concept.id === film.conceptId)?.title
    if (!title) throw new Error('expected release title')
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByTestId('autopsy-result-critic')).toHaveTextContent(
      `${Math.round(film.criticScore)}/100`,
    )

    fireEvent.click(screen.getByTestId('autopsy-back'))
    await screen.findByTestId('studio-lot-screen')
    expect(screen.getByTestId('lot-advance-week')).toHaveFocus()
  })
})
