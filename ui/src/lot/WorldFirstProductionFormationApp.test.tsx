import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLayoutEffect } from 'react'
import { App } from '../App.tsx'
import {
  advanceWeek,
  exportSaveJson,
  greenlight,
  greenlightScriptProject,
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
import { foundedRosterIds, newFoundedGame } from '../test/founding.ts'
import { applyActions, tick, type CommissionScriptPayload } from '../../../src/core/index.ts'
import type { LotRoute } from './navigation.ts'
import type { GreenlightFormationReceipt } from './snapshot/productionFormation.ts'
import * as formationSelectors from './snapshot/productionFormation.ts'

type LotProbeProps = {
  state: GameState
  entryFocus?:
    | 'studio-home'
    | 'selected-building'
    | 'advance-week'
    | 'publicity-campaign'
    | 'annex-work'
    | 'gate-arrivals'
    | 'stage-7-production'
    | 'gate-candidate'
    | 'production-formation'
  entryProductionFormation?: GreenlightFormationReceipt
  onNavigate: (route: LotRoute) => void
  onPresentationMount?: () => void | (() => void)
}

type GreenlitCallback = (
  next: GameState,
  receipt: GreenlightFormationReceipt | null,
) => void

const formationProbe = vi.hoisted(() => ({
  proposedNext: null as GameState | null,
  proposedReceipt: null as GreenlightFormationReceipt | null,
  newerState: null as GameState | null,
  firstGreenlitCallback: null as GreenlitCallback | null,
}))

// App is the unit under test. Keep both supporting Assembly and the large Lot host as typed
// boundary probes so hostile callback ordering can be driven without duplicating either owner.
vi.mock('./StudioLotScreen.tsx', () => ({
  default: (props: LotProbeProps) => {
    useLayoutEffect(
      () => props.onPresentationMount?.(),
      [props.onPresentationMount],
    )
    return (
      <main
        data-testid="formation-app-lot-probe"
        data-entry-focus={props.entryFocus}
        data-entry-production-id={props.entryProductionFormation?.productionId ?? 'none'}
        data-entry-director-id={props.entryProductionFormation?.directorId ?? 'none'}
        data-entry-lead-id={props.entryProductionFormation?.leadId ?? 'none'}
        data-entry-week={props.entryProductionFormation?.greenlightWeek ?? 'none'}
        data-entry-script-id={props.entryProductionFormation?.scriptProjectId ?? 'none'}
        data-state-week={props.state.market.tick}
        data-state-production-count={props.state.studio.activeProductions.length}
      >
        {props.entryProductionFormation !== undefined && (
          <p role="status" data-testid="formation-app-picture-formed">
            PICTURE FORMED
          </p>
        )}
        <button
          type="button"
          data-testid="formation-app-open-assembly"
          onClick={() => props.onNavigate({ kind: 'assembly' })}
        >
          Open Assembly
        </button>
        <button
          type="button"
          data-testid="formation-app-open-saves"
          onClick={() => props.onNavigate({ kind: 'saves' })}
        >
          Open Saves
        </button>
      </main>
    )
  },
}))

vi.mock('../screens/Assembly.tsx', () => ({
  Assembly: (props: {
    state: GameState
    onGreenlit: GreenlitCallback
    onCancel: () => void
    onStateChange?: (next: GameState) => void
  }) => {
    if (formationProbe.firstGreenlitCallback === null) {
      formationProbe.firstGreenlitCallback = props.onGreenlit
    }
    const accept = (receipt: GreenlightFormationReceipt | null) => {
      if (formationProbe.proposedNext === null) {
        throw new Error('formation App probe has no proposed successor')
      }
      props.onGreenlit(formationProbe.proposedNext, receipt)
    }
    return (
      <main
        data-testid="formation-app-assembly-probe"
        data-state-week={props.state.market.tick}
        data-state-production-count={props.state.studio.activeProductions.length}
      >
        <button
          type="button"
          data-testid="formation-app-accept-exact"
          onClick={() => accept(formationProbe.proposedReceipt)}
        >
          Accept exact greenlight
        </button>
        <button
          type="button"
          data-testid="formation-app-accept-mismatched"
          onClick={() => accept(
            formationProbe.proposedReceipt === null
              ? null
              : {
                  ...formationProbe.proposedReceipt,
                  productionId: `${formationProbe.proposedReceipt.productionId}-substitute`,
                },
          )}
        >
          Accept mismatched receipt
        </button>
        <button
          type="button"
          data-testid="formation-app-install-newer-state"
          onClick={() => {
            if (formationProbe.newerState === null) {
              throw new Error('formation App probe has no newer state')
            }
            props.onStateChange?.(formationProbe.newerState)
          }}
        >
          Install newer state
        </button>
        <button type="button" onClick={props.onCancel}>Cancel</button>
      </main>
    )
  },
}))

vi.mock('../screens/WritersRoom.tsx', () => ({
  WritersRoom: (props: {
    state: GameState
    onOpenPackage: (projectId: string) => void
  }) => {
    const ready = props.state.scriptDevelopment.projects.filter(
      (project) => project.status === 'ready',
    )
    return (
      <main data-testid="formation-app-writers-probe">
        <button
          type="button"
          disabled={ready.length !== 1}
          data-testid="formation-app-open-ready-package"
          onClick={() => {
            if (ready.length === 1) props.onOpenPackage(ready[0]!.id)
          }}
        >
          Open exact Ready package
        </button>
      </main>
    )
  },
  // C2a-M4 / F4 (§10): the host's retained commissioning workspace no longer
  // requires an IDLE screenplay board, so this suite's fixtures — which run with
  // work in flight — can now reach it. The module mock has to publish the same
  // exports the module does, or the App throws on a surface this suite is not
  // about. A probe, not a behaviour: this suite measures FORMATION.
  ScreenplayCommissionForm: () => <div data-testid="formation-app-commission-probe" />,
}))

function directPackage(
  state: GameState,
  options: { conceptIndex?: number; talentSlot?: number } = {},
): DraftPackage {
  const concept = state.concepts[options.conceptIndex ?? 0]!
  const talentSlot = options.talentSlot ?? 0
  const actors = foundedRosterIds(state, 'actor')
  const actorOffset = talentSlot * 3
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
    writerId: foundedRosterIds(state, 'writer')[talentSlot]!,
    directorId: foundedRosterIds(state, 'director')[talentSlot]!,
    cast: {
      lead: actors[actorOffset]!,
      antagonist: actors[actorOffset + 1]!,
      support: actors[actorOffset + 2]!,
    },
    craftIds: [foundedRosterIds(state, 'craft')[talentSlot]!],
    budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
  }
}

function managedDirectStudio(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
}

function managedReadyStudio(seed: string): { state: GameState; projectId: string } {
  let state = applyActions(newFoundedGame(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
  const concept = state.concepts[0]!
  const project: CommissionScriptPayload = {
    conceptId: concept.id,
    writerId: foundedRosterIds(state, 'writer')[0]!,
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
  }
  state = applyActions(state, [{ kind: 'commissionScript', project }])
  state = tick(state)
  const projectId = state.scriptDevelopment.projects[0]!.id
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  return { state, projectId }
}

function acceptedTransition(before: GameState) {
  const outcome = greenlight(before, directPackage(before))
  if (!outcome.ok) throw new Error(outcome.error)
  const receipt = formationSelectors.acceptedGreenlightFormationReceipt(before, outcome.next)
  if (receipt === null) throw new Error('expected an exact managed formation receipt')
  return { after: outcome.next, receipt }
}

function acceptedReadyTransition(before: GameState, projectId: string) {
  const outcome = greenlightScriptProject(before, projectId, directPackage(before))
  if (!outcome.ok) throw new Error(outcome.error)
  const receipt = formationSelectors.acceptedGreenlightFormationReceipt(before, outcome.next)
  if (receipt === null) throw new Error('expected an exact Ready-screenplay formation receipt')
  return { after: outcome.next, receipt }
}

function installTransition(before: GameState) {
  const transition = acceptedTransition(before)
  formationProbe.proposedNext = transition.after
  formationProbe.proposedReceipt = transition.receipt
  formationProbe.newerState = advanceWeek(before).next
  return transition
}

async function restoreLotStudio(state: GameState) {
  saveActiveSession(state)
  render(<App />)
  return screen.findByTestId('formation-app-lot-probe')
}



async function expectSavedState(expected: GameState) {
  await waitFor(() => {
    const restored = loadActiveSession()
    expect(restored.ok).toBe(true)
    if (!restored.ok) throw new Error('expected a valid active session')
    expect(exportSaveJson(restored.state)).toBe(exportSaveJson(expected))
  })
}

beforeEach(() => {
  localStorage.clear()
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
  formationProbe.proposedNext = null
  formationProbe.proposedReceipt = null
  formationProbe.newerState = null
  formationProbe.firstGreenlitCallback = null
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  localStorage.clear()
})

describe('Greenlight production formation — App owner boundary', () => {
  it('independently accepts the exact current transition and gives only a Lot origin the typed receipt', async () => {
    const ready = managedReadyStudio('formation-app-exact-lot')
    const before = ready.state
    const { after, receipt } = acceptedReadyTransition(before, ready.projectId)
    formationProbe.proposedNext = after
    formationProbe.proposedReceipt = receipt
    const recompute = vi.spyOn(
      formationSelectors,
      'acceptedGreenlightFormationReceipt',
    )

    await restoreLotStudio(before)
    fireEvent.click(screen.getByTestId('formation-app-open-assembly'))
    fireEvent.click(await screen.findByTestId('formation-app-open-ready-package'))
    fireEvent.click(await screen.findByTestId('formation-app-accept-exact'))

    const returned = await screen.findByTestId('formation-app-lot-probe')
    expect(returned).toHaveAttribute('data-entry-focus', 'production-formation')
    expect(returned).toHaveAttribute('data-entry-production-id', receipt.productionId)
    expect(returned).toHaveAttribute('data-entry-director-id', receipt.directorId)
    expect(returned).toHaveAttribute('data-entry-lead-id', receipt.leadId)
    expect(returned).toHaveAttribute('data-entry-week', String(receipt.greenlightWeek))
    expect(returned).toHaveAttribute('data-entry-script-id', ready.projectId)
    expect(recompute).toHaveBeenCalledOnce()
    expect(exportSaveJson(recompute.mock.calls[0]![0])).toBe(exportSaveJson(before))
    expect(recompute.mock.calls[0]![1]).toBe(after)
    await expectSavedState(after)
  })

  it('accepts an exact-before Engine successor with a mismatched receipt only through generic Lot return', async () => {
    const before = managedDirectStudio('formation-app-mismatched-receipt')
    const { after } = installTransition(before)

    await restoreLotStudio(before)
    fireEvent.click(screen.getByTestId('formation-app-open-assembly'))
    fireEvent.click(await screen.findByTestId('formation-app-accept-mismatched'))

    const returned = await screen.findByTestId('formation-app-lot-probe')
    expect(returned).toHaveAttribute('data-entry-focus', 'selected-building')
    expect(returned).toHaveAttribute('data-entry-production-id', 'none')
    expect(returned).toHaveAttribute('data-state-production-count', '1')
    await expectSavedState(after)
  })

  it('does not replay formation after an ordinary non-modal Saves round trip', async () => {
    const ready = managedReadyStudio('formation-app-exact-lot')
    const before = ready.state
    const { after, receipt } = acceptedReadyTransition(before, ready.projectId)
    formationProbe.proposedNext = after
    formationProbe.proposedReceipt = receipt

    await restoreLotStudio(before)
    fireEvent.click(screen.getByTestId('formation-app-open-assembly'))
    fireEvent.click(await screen.findByTestId('formation-app-open-ready-package'))
    fireEvent.click(await screen.findByTestId('formation-app-accept-exact'))

    const formedLot = await screen.findByTestId('formation-app-lot-probe')
    expect(formedLot).toHaveAttribute('data-entry-focus', 'production-formation')
    expect(formedLot).toHaveAttribute('data-entry-production-id', receipt.productionId)
    expect(screen.getByTestId('formation-app-picture-formed')).toBeInTheDocument()

    // Use the existing public Lot -> Saves route and the real Saves Back control.
    // This is a non-modal supporting surface; the remounted Lot may show the saved
    // production, but the one-shot formation receipt must not survive the round trip.
    fireEvent.click(screen.getByTestId('formation-app-open-saves'))
    fireEvent.click(await screen.findByTestId('saves-back'))

    const returnedLot = await screen.findByTestId('formation-app-lot-probe')
    expect(returnedLot).not.toBe(formedLot)
    expect(returnedLot).toHaveAttribute('data-entry-focus', 'selected-building')
    expect(returnedLot).toHaveAttribute('data-entry-production-id', 'none')
    expect(returnedLot).toHaveAttribute('data-state-production-count', '1')
    expect(screen.queryByTestId('formation-app-picture-formed')).not.toBeInTheDocument()
    await expectSavedState(after)
  })

  it('clears formation across an accepted same-seed colliding-ID save replacement and Lot remount', async () => {
    const seed = 'formation-app-whole-state-replacement'
    const ready = managedReadyStudio(seed)
    const before = ready.state
    const { after, receipt } = acceptedReadyTransition(before, ready.projectId)
    formationProbe.proposedNext = after
    formationProbe.proposedReceipt = receipt

    // Build a different studio session from the same deterministic seed at the same week.
    // Its first production deliberately reuses the accepted production ID while naming a
    // different concept and participants, proving neither seed nor ID is presentation identity.
    let replacementBefore = managedDirectStudio(seed)
    while (replacementBefore.market.tick < receipt.greenlightWeek) {
      replacementBefore = advanceWeek(replacementBefore).next
    }
    expect(replacementBefore.market.tick).toBe(receipt.greenlightWeek)
    const replacementOutcome = greenlight(
      replacementBefore,
      directPackage(replacementBefore, { conceptIndex: 1, talentSlot: 1 }),
    )
    if (!replacementOutcome.ok) throw new Error(replacementOutcome.error)
    const replacement = replacementOutcome.next
    const acceptedProduction = after.studio.activeProductions.find(
      (production) => production.id === receipt.productionId,
    )!
    const collidingProduction = replacement.studio.activeProductions.find(
      (production) => production.id === receipt.productionId,
    )!
    expect(replacement.seed).toBe(after.seed)
    expect(collidingProduction.id).toBe(acceptedProduction.id)
    expect(collidingProduction.conceptId).not.toBe(acceptedProduction.conceptId)
    expect(collidingProduction.directorId).not.toBe(acceptedProduction.directorId)

    await restoreLotStudio(before)
    fireEvent.click(screen.getByTestId('formation-app-open-assembly'))
    fireEvent.click(await screen.findByTestId('formation-app-open-ready-package'))
    fireEvent.click(await screen.findByTestId('formation-app-accept-exact'))

    const formedLot = await screen.findByTestId('formation-app-lot-probe')
    expect(formedLot).toHaveAttribute('data-entry-focus', 'production-formation')
    expect(formedLot).toHaveAttribute('data-entry-production-id', receipt.productionId)
    expect(screen.getByTestId('formation-app-picture-formed')).toHaveTextContent(
      'PICTURE FORMED',
    )

    fireEvent.click(screen.getByTestId('formation-app-open-saves'))
    const importBox = await screen.findByTestId('saves-import-text')
    fireEvent.change(importBox, { target: { value: exportSaveJson(replacement) } })
    fireEvent.click(screen.getByTestId('saves-import'))

    const remountedLot = await screen.findByTestId('formation-app-lot-probe')
    expect(remountedLot).not.toBe(formedLot)
    expect(remountedLot).toHaveAttribute('data-entry-focus', 'studio-home')
    expect(remountedLot).toHaveAttribute('data-entry-production-id', 'none')
    expect(remountedLot).toHaveAttribute('data-entry-director-id', 'none')
    expect(remountedLot).toHaveAttribute('data-entry-lead-id', 'none')
    expect(remountedLot).toHaveAttribute('data-entry-script-id', 'none')
    expect(screen.queryByTestId('formation-app-picture-formed')).not.toBeInTheDocument()
    await expectSavedState(replacement)
  })

  it('keeps an exact receipt on the classic Lot compatibility return when Hollywood is rolled back', async () => {
    const before = managedDirectStudio('formation-app-classic-lot-return')
    const { after } = installTransition(before)
    setOperationHollywoodOverride(false)

    await restoreLotStudio(before)
    fireEvent.click(screen.getByTestId('formation-app-open-assembly'))
    fireEvent.click(await screen.findByTestId('formation-app-accept-exact'))

    const returned = await screen.findByTestId('formation-app-lot-probe')
    expect(returned).toHaveAttribute('data-entry-focus', 'selected-building')
    expect(returned).toHaveAttribute('data-entry-production-id', 'none')
    expect(returned).toHaveAttribute('data-state-production-count', '1')
    await expectSavedState(after)
  })

  it('rejects a stale retained callback without recomputing, overwriting newer state, or navigating', async () => {
    const before = managedDirectStudio('formation-app-stale-callback')
    const { after, receipt } = installTransition(before)
    const newer = formationProbe.newerState!
    const recompute = vi.spyOn(
      formationSelectors,
      'acceptedGreenlightFormationReceipt',
    )

    await restoreLotStudio(before)
    fireEvent.click(screen.getByTestId('formation-app-open-assembly'))
    const assembly = await screen.findByTestId('formation-app-assembly-probe')
    fireEvent.click(screen.getByTestId('formation-app-install-newer-state'))
    await waitFor(() => expect(assembly).toHaveAttribute(
      'data-state-week',
      String(newer.market.tick),
    ))

    const staleCallback = formationProbe.firstGreenlitCallback
    if (staleCallback === null) throw new Error('expected the first rendered callback')
    act(() => staleCallback(after, receipt))

    expect(screen.getByTestId('formation-app-assembly-probe')).toBeInTheDocument()
    expect(screen.queryByTestId('formation-app-lot-probe')).not.toBeInTheDocument()
    expect(recompute).not.toHaveBeenCalled()
    await expectSavedState(newer)
  })

  it('keeps an exact receipt generic for Dashboard rollback origin', async () => {
    const before = managedDirectStudio('formation-app-dashboard-origin')
    const { after } = installTransition(before)
    setStudioLotOverviewOverride(false)
    saveActiveSession(before)
    render(<App />)

    fireEvent.click(await screen.findByTestId('assemble-film'))
    fireEvent.click(await screen.findByTestId('formation-app-accept-exact'))

    expect(await screen.findByTestId('assemble-film')).toBeInTheDocument()
    expect(screen.queryByTestId('formation-app-lot-probe')).not.toBeInTheDocument()
    await expectSavedState(after)
  })

  it('preserves pure legacy greenlight as the existing generic Lot return with no managed claim', async () => {
    const before = newFoundedGame('formation-app-legacy-return')
    const outcome = greenlight(before, directPackage(before))
    if (!outcome.ok) throw new Error(outcome.error)
    expect(
      formationSelectors.acceptedGreenlightFormationReceipt(before, outcome.next),
    ).toBeNull()
    formationProbe.proposedNext = outcome.next
    formationProbe.proposedReceipt = null

    await restoreLotStudio(before)
    fireEvent.click(screen.getByTestId('formation-app-open-assembly'))
    fireEvent.click(await screen.findByTestId('formation-app-accept-exact'))

    const returned = await screen.findByTestId('formation-app-lot-probe')
    expect(returned).toHaveAttribute('data-entry-focus', 'selected-building')
    expect(returned).toHaveAttribute('data-entry-production-id', 'none')
    await expectSavedState(outcome.next)
  })
})
