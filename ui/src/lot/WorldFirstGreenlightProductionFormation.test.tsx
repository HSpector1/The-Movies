import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import type { GameState } from '../engine/adapter.ts'
import {
  advanceWeek,
  greenlight,
  studioLotSnapshot,
  type DraftPackage,
} from '../engine/adapter.ts'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import { foundedRosterIds, newFoundedGame } from '../test/founding.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import type { LotPersonState, StudioLotSnapshot } from './snapshot/StudioLotSnapshot.ts'
import {
  acceptedGreenlightFormationReceipt,
  type GreenlightFormationReceipt,
} from './snapshot/productionFormation.ts'

const adapterBoundary = vi.hoisted(() => ({
  transform: null as null | ((snapshot: StudioLotSnapshot) => StudioLotSnapshot),
}))

vi.mock('../engine/adapter.ts', async () => {
  const actual = await vi.importActual<typeof import('../engine/adapter.ts')>(
    '../engine/adapter.ts',
  )
  return {
    ...actual,
    studioLotSnapshot(state: Parameters<typeof actual.studioLotSnapshot>[0]) {
      const snapshot = actual.studioLotSnapshot(state)
      return adapterBoundary.transform?.(snapshot) ?? snapshot
    },
  }
})

type FakeViewOptions = {
  parent: HTMLElement
  snapshot: StudioLotSnapshot
  onReady?: () => void
  onHollywoodPerson?: (person: LotPersonState | null) => void
}

const renderer = vi.hoisted(() => {
  const controls = {
    autoReady: true,
    constructError: null as Error | null,
  }
  const instances: FakeStudioLotView[] = []

  class FakeStudioLotView {
    readonly opts: FakeViewOptions
    readonly snapshots: StudioLotSnapshot[] = []
    readonly selectedPeople: string[] = []
    clearedPersonSelections = 0
    destroyed = false

    constructor(opts: FakeViewOptions) {
      if (controls.constructError !== null) throw controls.constructError
      this.opts = opts
      this.snapshots.push(opts.snapshot)
      instances.push(this)
      if (controls.autoReady) queueMicrotask(() => opts.onReady?.())
    }

    ready() { this.opts.onReady?.() }
    setSnapshot(snapshot: StudioLotSnapshot) { this.snapshots.push(snapshot) }
    selectHollywoodPerson(id: string) { this.selectedPeople.push(id) }
    selectHollywoodProduction() { return true }
    selectHollywoodSceneryLoadIn() { return true }
    selectHollywoodAnnexPlace() { return true }
    select() {}
    clearSelection() {}
    clearHollywoodPersonSelection() { this.clearedPersonSelections++ }
    clearHollywoodPlaceSelection() {}
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
    destroy() { this.destroyed = true }
  }

  return { controls, instances, FakeStudioLotView }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeStudioLotView }))

function directPackage(state: GameState, lane = 0): DraftPackage {
  const concept = state.concepts[lane] ?? state.concepts[0]!
  const actors = foundedRosterIds(state, 'actor')
  const castStart = lane * 3
  return {
    conceptId: concept.id,
    shape: {
      opening: 'slowSetup',
      midpoint: 'revelation',
      ending: 'bittersweet',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [-0.5, 0.5],
        kineticEnergy: [-0.5, 0.5],
      },
    },
    writerId: foundedRosterIds(state, 'writer')[lane]!,
    directorId: foundedRosterIds(state, 'director')[lane]!,
    cast: {
      lead: actors[castStart]!,
      antagonist: actors[castStart + 1]!,
      support: actors[castStart + 2]!,
    },
    craftIds: [foundedRosterIds(state, 'craft')[lane]!],
    budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
  }
}

function acceptedFormation(seed: string): {
  before: GameState
  after: GameState
  receipt: GreenlightFormationReceipt
} {
  const before = applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
  const outcome = greenlight(before, directPackage(before))
  if (!outcome.ok) throw new Error(outcome.error)
  const receipt = acceptedGreenlightFormationReceipt(before, outcome.next)
  if (receipt === null) throw new Error('expected an exact accepted greenlight receipt')
  return { before, after: outcome.next, receipt }
}

function acceptedSecondFormation(seed: string): {
  after: GameState
  firstReceipt: GreenlightFormationReceipt
  receipt: GreenlightFormationReceipt
} {
  const first = acceptedFormation(seed)
  let beforeSecond = first.after
  for (let week = 0; week < 4; week++) {
    beforeSecond = advanceWeek(beforeSecond).next
  }
  const outcome = greenlight(beforeSecond, directPackage(beforeSecond, 1))
  if (!outcome.ok) throw new Error(outcome.error)
  const receipt = acceptedGreenlightFormationReceipt(beforeSecond, outcome.next)
  if (receipt === null) throw new Error('expected an exact second greenlight receipt')
  return { after: outcome.next, firstReceipt: first.receipt, receipt }
}

function formationOperation(state: GameState, receipt: GreenlightFormationReceipt) {
  const matches = (studioLotSnapshot(state).productionOperations ?? []).filter(
    (operation) => operation.productionId === receipt.productionId,
  )
  if (matches.length !== 1) throw new Error('expected one exact formed production operation')
  return matches[0]!
}

function lotProps(
  state: GameState,
  receipt: GreenlightFormationReceipt,
  onAdvance: () => void = () => {},
) {
  return {
    state,
    entryFocus: 'production-formation' as const,
    entryProductionFormation: receipt,
    onNavigate: () => {},
    onExit: () => {},
    onAdvance,
  }
}

async function latestView(): Promise<InstanceType<typeof renderer.FakeStudioLotView>> {
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  return renderer.instances[0]!
}

beforeEach(() => {
  localStorage.clear()
  adapterBoundary.transform = null
  renderer.controls.autoReady = true
  renderer.controls.constructError = null
  renderer.instances.length = 0
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  adapterBoundary.transform = null
  renderer.controls.autoReady = true
  renderer.controls.constructError = null
  renderer.instances.length = 0
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  vi.restoreAllMocks()
})

describe('World-First Greenlight Production Formation — Studio Lot boundary', () => {
  it('consumes a live formation once in the same mounted Lot after modal suspension clears', async () => {
    const { before, after, receipt } = acceptedFormation('formation-lot-live-retained')
    const identity = {}
    const consumed = vi.fn()
    const baseProps = {
      entryFocus: 'studio-home' as const,
      onNavigate: () => {},
      onExit: () => {},
      onAdvance: () => {},
      onLiveFormationConsumed: consumed,
    }
    const rendered = render(<StudioLotScreen {...baseProps} state={before} />)
    const view = await latestView()
    const lot = screen.getByTestId('studio-lot-screen')
    const canvas = screen.getByTestId('studio-lot-canvas')

    rendered.rerender(
      <StudioLotScreen
        {...baseProps}
        state={after}
        worldInputSuspended
        liveFormationPresentation={{ identity, acceptedState: after, receipt }}
      />,
    )
    expect(consumed).not.toHaveBeenCalled()
    expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()

    rendered.rerender(
      <StudioLotScreen
        {...baseProps}
        state={after}
        liveFormationPresentation={{ identity, acceptedState: after, receipt }}
      />,
    )

    await waitFor(() => expect(consumed).toHaveBeenCalledOnce())
    expect(consumed).toHaveBeenCalledWith(identity)
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(view.destroyed).toBe(false)
    expect(view.selectedPeople).toContain(receipt.directorId)
    expect(screen.getByTestId('hollywood-production-formation-witness')).toHaveTextContent(
      'PICTURE FORMED',
    )

    rendered.rerender(
      <StudioLotScreen
        {...baseProps}
        state={after}
        liveFormationPresentation={{ identity, acceptedState: after, receipt }}
      />,
    )
    expect(consumed).toHaveBeenCalledOnce()
    expect(renderer.instances).toEqual([view])
  })

  it('consumes a stale live receipt without selecting or substituting a formation', async () => {
    const { after, receipt } = acceptedFormation('formation-lot-live-stale')
    const identity = {}
    const consumed = vi.fn()
    const stale = { ...receipt, productionId: `${receipt.productionId}-missing` }

    render(
      <StudioLotScreen
        state={after}
        entryFocus="studio-home"
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        liveFormationPresentation={{ identity, acceptedState: after, receipt: stale }}
        onLiveFormationConsumed={consumed}
      />,
    )
    const view = await latestView()

    await waitFor(() => expect(consumed).toHaveBeenCalledOnce())
    expect(view.selectedPeople).toEqual([])
    expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-production-formation-announcement')).toHaveTextContent('')
    expect(screen.getByTestId('lot-studio-heading')).toHaveFocus()
  })

  it('returns to the exact formed picture, frames its Director in the ready world, and keeps its Lead independently selectable', async () => {
    const { after, receipt } = acceptedFormation('formation-lot-exact-entry')
    const operation = formationOperation(after, receipt)
    const snapshot = studioLotSnapshot(after)
    const director = snapshot.people.find((person) => person.id === receipt.directorId)!
    const lead = snapshot.people.find((person) => person.id === receipt.leadId)!

    render(<StudioLotScreen {...lotProps(after, receipt)} />)
    const view = await latestView()

    await waitFor(() => expect(view.selectedPeople).toContain(receipt.directorId))
    const directorButton = screen.getByTestId(`hollywood-select-person-${receipt.directorId}`)
    expect(directorButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('hollywood-person-inspector-status')).toHaveFocus()

    const picture = within(screen.getByTestId('hollywood-current-production'))
    expect(picture.getByRole('heading', { name: operation.title })).toBeInTheDocument()
    expect(picture.getByTestId('hollywood-production-formation-witness')).toHaveTextContent(
      'PICTURE FORMED',
    )
    expect(picture.getByText('Phase').closest('div')).toHaveTextContent('Development')
    expect(picture.getByText('Production facilities').closest('div')).toHaveTextContent(
      operation.facilityLabel,
    )
    expect(picture.getByText('Status').closest('div')).toHaveTextContent(operation.statusLabel)
    expect(picture.getByText('Weeks left').closest('div')).toHaveTextContent('8')
    expect(picture.getByText('Director').closest('div')).toHaveTextContent(director.name)
    expect(picture.getByText('Lead').closest('div')).toHaveTextContent(lead.name)
    expect(screen.getByTestId('lot-production-formation-announcement')).toHaveTextContent(
      `Picture formed: ${operation.title}. Director ${director.name}. Lead ${lead.name}.`,
    )

    fireEvent.click(directorButton)
    expect(picture.getByTestId('hollywood-production-formation-witness')).toBeInTheDocument()
    expect(picture.getByText('Status').closest('div')).toHaveTextContent(operation.statusLabel)

    fireEvent.click(screen.getByTestId(`hollywood-select-person-${receipt.leadId}`))
    expect(screen.getByTestId(`hollywood-select-person-${receipt.leadId}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const leadFacts = within(screen.getByTestId('hollywood-person-work-facts'))
    expect(leadFacts.getByText('Lead actor')).toBeInTheDocument()
    expect(leadFacts.getByText(operation.title)).toBeInTheDocument()
    expect(leadFacts.queryByText('Director task')).not.toBeInTheDocument()
    expect(screen.queryByTestId('hollywood-production-command-assignShootingDirector'))
      .not.toBeInTheDocument()
    expect(picture.getByTestId('hollywood-production-formation-witness')).toBeInTheDocument()
    expect(picture.getByText('Status').closest('div')).toHaveTextContent(operation.statusLabel)
    expect(screen.getByTestId('lot-production-formation-announcement')).toHaveTextContent(
      `Picture formed: ${operation.title}. Director ${director.name}. Lead ${lead.name}.`,
    )
  })

  it('selects the receipt-owned second picture and Director instead of the array-first active production', async () => {
    const { after, firstReceipt, receipt } = acceptedSecondFormation(
      'formation-lot-two-active-pictures',
    )
    const snapshot = studioLotSnapshot(after)
    const operations = snapshot.productionOperations ?? []
    const exact = formationOperation(after, receipt)
    const first = formationOperation(after, firstReceipt)

    expect(operations).toHaveLength(2)
    expect(operations[0]?.productionId).toBe(firstReceipt.productionId)
    expect(receipt.productionId).not.toBe(firstReceipt.productionId)
    expect(exact.directorId).not.toBe(first.directorId)

    render(<StudioLotScreen {...lotProps(after, receipt)} />)
    const view = await latestView()

    await waitFor(() => expect(view.selectedPeople).toContain(receipt.directorId))
    expect(new Set(view.selectedPeople)).toEqual(new Set([receipt.directorId]))
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(exact.title)
    expect(screen.getByTestId('hollywood-current-production')).not.toHaveTextContent(first.title)
    expect(screen.getByTestId(`hollywood-select-person-${receipt.directorId}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByTestId(`hollywood-select-person-${first.directorId}`)).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByTestId('hollywood-person-work-facts')).toHaveTextContent(exact.title)
    expect(screen.getByTestId('hollywood-production-formation-witness')).toBeInTheDocument()

    // Re-selecting the exact formed picture is still related context. Choosing the
    // other active picture is the explicit unrelated world selection that consumes it.
    fireEvent.click(screen.getByTestId(`hollywood-select-production-${receipt.productionId}`))
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(exact.title)
    expect(screen.getByTestId('hollywood-production-formation-witness')).toBeInTheDocument()
    expect(within(screen.getByTestId('hollywood-current-production')).getByText('Status'))
      .toBeInTheDocument()

    fireEvent.click(screen.getByTestId(`hollywood-select-production-${firstReceipt.productionId}`))
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(first.title)
    expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-production-formation-announcement').textContent).toBe('')
  })

  it.each([
    'missing operation',
    'duplicate operation',
    'missing Director',
    'duplicate Lead',
  ] as const)(
    'clears mounted formation to neutral after %s invalidates the exact join, without selecting another picture',
    async (hostility) => {
      const { after, firstReceipt, receipt } = acceptedSecondFormation(
        `formation-lot-mounted-${hostility.replaceAll(' ', '-')}`,
      )
      const rendered = render(<StudioLotScreen {...lotProps(after, receipt)} />)
      const view = await latestView()
      await waitFor(() => expect(view.selectedPeople).toContain(receipt.directorId))
      // Duplicate operation rows still reach the pre-existing production rail
      // long enough for React to report their duplicate key. Duplicate people
      // are now removed by the strict presentation boundary before rendering,
      // so they must not be required to produce a console warning.
      const duplicateKeyWarning = hostility === 'duplicate operation'
        ? vi.spyOn(console, 'error').mockImplementation(() => {})
        : null

      adapterBoundary.transform = (snapshot) => {
        const operations = snapshot.productionOperations ?? []
        const exactOperation = operations.find(
          (operation) => operation.productionId === receipt.productionId,
        )!
        const director = snapshot.people.find((person) => person.id === receipt.directorId)!
        const lead = snapshot.people.find((person) => person.id === receipt.leadId)!
        if (hostility === 'missing operation') {
          return {
            ...snapshot,
            productionOperations: operations.filter(
              (operation) => operation.productionId !== receipt.productionId,
            ),
          }
        }
        if (hostility === 'duplicate operation') {
          return {
            ...snapshot,
            productionOperations: [...operations, { ...exactOperation }],
          }
        }
        if (hostility === 'missing Director') {
          return {
            ...snapshot,
            people: snapshot.people.filter((person) => person.id !== director.id),
          }
        }
        return { ...snapshot, people: [...snapshot.people, { ...lead }] }
      }

      rendered.rerender(<StudioLotScreen {...lotProps({ ...after }, receipt)} />)

      await waitFor(() => expect(screen.getByTestId('hollywood-production-idle'))
        .toHaveTextContent('No active production'))
      expect(screen.queryByTestId('hollywood-current-production')).not.toBeInTheDocument()
      expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()
      expect(screen.getByTestId('lot-production-formation-announcement').textContent).toBe('')
      expect(screen.getByTestId('lot-studio-heading')).toHaveFocus()
      expect(view.clearedPersonSelections).toBeGreaterThan(0)
      expect(new Set(view.selectedPeople)).toEqual(new Set([receipt.directorId]))
      expect(view.selectedPeople).not.toContain(firstReceipt.directorId)
      if (duplicateKeyWarning !== null) {
        expect(duplicateKeyWarning).toHaveBeenCalled()
        expect(duplicateKeyWarning.mock.calls.every(([message]) =>
          String(message).includes('same key'))).toBe(true)
        duplicateKeyWarning.mockRestore()
      }
    },
  )

  it('rejects a stale receipt to an explicit neutral Lot with no replacement picture or acknowledgement', async () => {
    const { after, receipt } = acceptedFormation('formation-lot-stale-entry')
    const stale: GreenlightFormationReceipt = {
      ...receipt,
      productionId: `${receipt.productionId}-missing`,
    }

    render(<StudioLotScreen {...lotProps(after, stale)} />)
    const view = await latestView()

    await waitFor(() => expect(screen.getByTestId('lot-studio-heading')).toHaveFocus())
    expect(screen.getByTestId('hollywood-production-idle')).toHaveTextContent(
      'No active production',
    )
    expect(screen.queryByTestId('hollywood-current-production')).not.toBeInTheDocument()
    expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-production-formation-announcement').textContent).toBe('')
    expect(view.selectedPeople).toEqual([])
  })

  it('does not replay a consumed formation witness across repeated renderer readiness, ordinary rerender, or profile open/close suspension', async () => {
    const { after, receipt } = acceptedFormation('formation-lot-profile-no-replay')
    const onOpenTalentProfile = vi.fn()
    const baseProps = {
      ...lotProps(after, receipt),
      onOpenTalentProfile,
      openTalentProfileId: null as string | null,
      worldInputSuspended: false,
    }
    const rendered = render(<StudioLotScreen {...baseProps} />)
    const view = await latestView()
    expect(screen.getByTestId('hollywood-production-formation-witness')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-advance-week'))
    expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-production-formation-announcement').textContent).toBe('')

    // A live Phaser generation may report readiness again after internal recreation.
    // Readiness may restore current physical selection, but it cannot recreate the
    // already-consumed transient ceremony in React.
    act(() => {
      view.ready()
      view.ready()
    })
    expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-production-formation-announcement').textContent).toBe('')

    fireEvent.click(screen.getByTestId(`hollywood-open-talent-profile-${receipt.directorId}`))
    expect(onOpenTalentProfile).toHaveBeenCalledOnce()
    expect(onOpenTalentProfile).toHaveBeenCalledWith(receipt.directorId)
    rendered.rerender(
      <StudioLotScreen
        {...baseProps}
        openTalentProfileId={receipt.directorId}
        worldInputSuspended
      />,
    )
    rendered.rerender(<StudioLotScreen {...baseProps} />)

    expect(screen.getByTestId('hollywood-current-production')).toBeInTheDocument()
    expect(screen.getByTestId(`hollywood-select-person-${receipt.directorId}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-production-formation-announcement').textContent).toBe('')
  })

  it('does not infer a formation ceremony when the accepted post-greenlight state is freshly remounted without its transient receipt', async () => {
    const { after, receipt } = acceptedFormation('formation-lot-fresh-remount')
    const operation = formationOperation(after, receipt)
    const first = render(<StudioLotScreen {...lotProps(after, receipt)} />)
    await latestView()
    expect(screen.getByTestId('hollywood-production-formation-witness')).toBeInTheDocument()

    first.unmount()
    expect(renderer.instances[0]?.destroyed).toBe(true)

    render(
      <StudioLotScreen
        state={after}
        entryFocus="studio-home"
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
      />,
    )
    await waitFor(() => expect(renderer.instances).toHaveLength(2))

    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(operation.title)
    expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-production-formation-announcement').textContent).toBe('')
  })

  it('retains exact semantic picture and person facts when renderer construction is rejected', async () => {
    renderer.controls.constructError = new Error('renderer rejected formation')
    const { after, receipt } = acceptedFormation('formation-lot-renderer-rejection')
    const operation = formationOperation(after, receipt)

    render(<StudioLotScreen {...lotProps(after, receipt)} />)

    expect(await screen.findByTestId('lot-canvas-fallback')).toBeInTheDocument()
    expect(renderer.instances).toHaveLength(0)
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(operation.title)
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(
      operation.phaseLabel,
    )
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(
      operation.directorName,
    )
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(
      operation.leadName ?? '',
    )
    expect(screen.getByTestId(`hollywood-select-person-${receipt.directorId}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByTestId('hollywood-person-work-facts')).toHaveTextContent(operation.title)
    expect(screen.getByTestId('hollywood-production-formation-witness')).toHaveTextContent(
      'PICTURE FORMED',
    )
  })

  it('keeps the exact picture and Director through mounted Engine advance while consuming the one-shot witness', async () => {
    const { after, receipt } = acceptedFormation('formation-lot-mounted-advance')
    const operation = formationOperation(after, receipt)

    function Harness() {
      const [state, setState] = useState(after)
      return (
        <StudioLotScreen
          {...lotProps(state, receipt, () => setState((current) => advanceWeek(current).next))}
        />
      )
    }

    render(<Harness />)
    const view = await latestView()
    await waitFor(() => expect(view.selectedPeople).toContain(receipt.directorId))
    expect(screen.getByTestId('hollywood-production-formation-witness')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-advance-week'))

    await waitFor(() => expect(screen.getByText('Studio Chronicle · Hollywood, 1948 · Week 1'))
      .toBeInTheDocument())
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(operation.title)
    expect(screen.getByTestId(`hollywood-select-person-${receipt.directorId}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByTestId('hollywood-person-inspector-status')).toHaveTextContent(
      operation.title,
    )
    expect(screen.queryByTestId('hollywood-production-formation-witness')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-production-formation-announcement').textContent).toBe('')
  })

  it('reconciles delayed renderer readiness against the latest still-valid phase, never the mount snapshot', async () => {
    renderer.controls.autoReady = false
    const { after, receipt } = acceptedFormation('formation-lot-delayed-ready')
    const weekTwo = advanceWeek(advanceWeek(after).next).next
    const latestOperation = formationOperation(weekTwo, receipt)
    const rendered = render(<StudioLotScreen {...lotProps(after, receipt)} />)
    const view = await latestView()

    expect(view.selectedPeople).toEqual([])
    rendered.rerender(<StudioLotScreen {...lotProps(weekTwo, receipt)} />)
    await waitFor(() => expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(
      latestOperation.title,
    ))
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(
      latestOperation.phaseLabel,
    )
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(
      String(latestOperation.weeksRemaining),
    )

    act(() => view.ready())

    await waitFor(() => expect(view.selectedPeople.length).toBeGreaterThan(0))
    expect(new Set(view.selectedPeople)).toEqual(new Set([receipt.directorId]))
    expect(view.snapshots.at(-1)?.week).toBe(weekTwo.market.tick)
    expect(screen.getByTestId(`hollywood-select-person-${receipt.directorId}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
