import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import {
  applyActions,
} from '../../../src/core/index.js'
import {
  newGame,
  scriptProjectsBoard,
  type GameState,
} from '../engine/adapter.ts'
import { contendedStudio, freeSlate } from '../../../tests/_m4Fixtures.js'
import { Assembly } from './Assembly.tsx'
import { WritersRoom } from './WritersRoom.tsx'

afterEach(cleanup)

function WritersRoomHarness({
  initial,
  onState,
}: {
  initial: GameState
  onState: (state: GameState) => void
}) {
  const [state, setState] = useState(initial)
  return (
    <WritersRoom
      state={state}
      onChange={(next) => {
        onState(next)
        setState(next)
      }}
      onOpenPackage={() => {}}
      onBack={() => {}}
    />
  )
}

function pickFirstEligible(testId: string): void {
  const choice = within(screen.getByTestId(testId))
    .getAllByRole('button')
    .find(
      (candidate) =>
        candidate.hasAttribute('aria-pressed') &&
        !(candidate as HTMLButtonElement).disabled,
    )
  if (choice === undefined) throw new Error(`fixture: no eligible choice in ${testId}`)
  fireEvent.click(choice)
}

function finishLockedPackage(): HTMLButtonElement {
  pickFirstEligible('picker-director')
  pickFirstEligible('picker-lead')
  pickFirstEligible('picker-antagonist')
  pickFirstEligible('picker-support')
  pickFirstEligible('picker-craft')
  fireEvent.click(screen.getByTestId('assembly-next'))
  fireEvent.click(screen.getByTestId('assembly-next'))
  return screen.getByTestId('greenlight') as HTMLButtonElement
}

describe('A3 retained-client queue admission parity', () => {
  it('submits one market commission under capacity-only contention and suppresses the queued premise on reopen', async () => {
    const { state: before } = contendedStudio('a3-retained-market-queue')
    const availability = scriptProjectsBoard(before).commission
    expect(availability.blockers.map((blocker) => blocker.kind)).toEqual([
      'facility-capacity',
    ])
    expect(availability.canStart).toBe(false)
    expect(availability.canSubmitMarketIntent).toBe(true)
    expect(availability.willQueueIntent).toBe(true)
    const targetConceptId = availability.concepts[0]!.id
    let accepted = before

    render(
      <WritersRoomHarness
        initial={before}
        onState={(next) => { accepted = next }}
      />,
    )

    expect(screen.getByTestId('commission-open')).toBeEnabled()
    fireEvent.click(screen.getByTestId('commission-open'))
    expect(screen.getByTestId('commission-submit')).toHaveTextContent(
      'Queue screenplay commission',
    )
    expect(screen.getByTestId('commission-consequence')).toHaveTextContent(
      'No writer, screenplay identity, cost, or room is committed',
    )
    expect(screen.getByTestId('commission-consequence')).not.toHaveTextContent(
      'the writer and one Development & Casting slot are occupied',
    )
    expect(screen.getByTestId('commission-submit')).toBeEnabled()
    fireEvent.click(screen.getByTestId('commission-submit'))

    await waitFor(() => expect(accepted).not.toBe(before))
    const added = accepted.productionQueue.filter(
      (entry) => !before.productionQueue.some((prior) => prior.ordinal === entry.ordinal),
    )
    expect(added).toEqual([
      expect.objectContaining({
        kind: 'commissionScript',
        payload: expect.objectContaining({ conceptId: targetConceptId }),
      }),
    ])
    expect(accepted.scriptDevelopment.projects).toEqual(before.scriptDevelopment.projects)
    expect(accepted.studio.activeProductions).toEqual(before.studio.activeProductions)
    expect(accepted.operations.workflows).toEqual(before.operations.workflows)
    expect(accepted.concepts).toEqual(before.concepts)
    expect(accepted.originalScreenplays).toEqual(before.originalScreenplays)
    expect(accepted.studio.cash).toBe(before.studio.cash)
    expect(screen.getByTestId('writers-room-commission-receipt')).toHaveTextContent(
      'Screenplay commission joined the Development & Casting queue',
    )
    expect(screen.getByTestId('writers-room-commission-receipt')).toHaveTextContent(
      'No writer, project identity, or cost is committed until it starts',
    )

    fireEvent.click(screen.getByTestId('commission-open'))
    const reopenedConcepts = Array.from(
      (screen.getByTestId('script-concept') as HTMLSelectElement).options,
      (option) => option.value,
    )
    expect(reopenedConcepts).not.toContain(targetConceptId)
    expect(
      accepted.productionQueue.filter(
        (entry) =>
          entry.kind === 'commissionScript' && entry.payload.conceptId === targetConceptId,
      ),
    ).toHaveLength(1)
  })

  it('submits one original commission under capacity-only contention without minting or committing anything', async () => {
    const { state: before } = contendedStudio('a3-retained-original-queue')
    const availability = scriptProjectsBoard(before).commission
    expect(availability.canSubmitOriginalIntent).toBe(true)
    let accepted = before

    render(
      <WritersRoomHarness
        initial={before}
        onState={(next) => { accepted = next }}
      />,
    )

    fireEvent.click(screen.getByTestId('commission-open'))
    fireEvent.click(screen.getByTestId('script-source-original'))
    expect(screen.getByTestId('commission-submit')).toHaveTextContent(
      'Queue original screenplay commission',
    )
    expect(screen.getByTestId('commission-consequence')).toHaveTextContent(
      'No writer, screenplay identity, cost, or room is committed',
    )
    expect(screen.getByTestId('commission-submit')).toBeEnabled()
    fireEvent.click(screen.getByTestId('commission-submit'))

    await waitFor(() => expect(accepted).not.toBe(before))
    const added = accepted.productionQueue.filter(
      (entry) => !before.productionQueue.some((prior) => prior.ordinal === entry.ordinal),
    )
    expect(added).toEqual([
      expect.objectContaining({ kind: 'commissionOriginalScreenplay' }),
    ])
    expect(accepted.scriptDevelopment.projects).toEqual(before.scriptDevelopment.projects)
    expect(accepted.studio.activeProductions).toEqual(before.studio.activeProductions)
    expect(accepted.operations.workflows).toEqual(before.operations.workflows)
    expect(accepted.concepts).toEqual(before.concepts)
    expect(accepted.originalScreenplays.nextOrdinal).toBe(
      before.originalScreenplays.nextOrdinal,
    )
    expect(accepted.studio.cash).toBe(before.studio.cash)
    expect(screen.getByTestId('writers-room-commission-receipt')).toHaveTextContent(
      'Original screenplay commission joined the Development & Casting queue',
    )
    expect(screen.getByTestId('writers-room-commission-receipt')).toHaveTextContent(
      'No writer, premise, project identity, or cost is committed until it starts',
    )
  })

  it('keeps non-capacity screenplay blockers closed', () => {
    const state = newGame('a3-retained-commission-hard-blocker')
    const availability = scriptProjectsBoard(state).commission
    expect(availability.blockers.some((blocker) => blocker.kind !== 'facility-capacity')).toBe(true)
    expect(availability.canSubmitMarketIntent).toBe(false)
    expect(availability.canSubmitOriginalIntent).toBe(false)

    render(
      <WritersRoom
        state={state}
        onChange={() => {}}
        onOpenPackage={() => {}}
        onBack={() => {}}
      />,
    )
    expect(screen.getByTestId('commission-open')).toBeDisabled()
  })

  it('submits one contended greenlight, emits no fake formation receipt, and closes the exact package on fresh reopen', () => {
    const { state: before, readyProjectIds } = contendedStudio(
      'a3-retained-greenlight-queue',
    )
    const projectId = readyProjectIds[0]!
    const beforePackage = scriptProjectsBoard(before).packages.find(
      (candidate) => candidate.projectId === projectId,
    )!
    expect(beforePackage.availability.blockers.map((blocker) => blocker.kind)).toEqual([
      'facility-capacity',
    ])
    expect(beforePackage.availability.knownGatesClear).toBe(false)
    expect(beforePackage.availability.canSubmitGreenlightIntent).toBe(true)
    expect(beforePackage.availability.willQueueGreenlightIntent).toBe(true)
    const onGreenlit = vi.fn()

    render(
      <Assembly
        state={before}
        scriptProjectId={projectId}
        onGreenlit={onGreenlit}
        onCancel={() => {}}
      />,
    )

    const greenlight = finishLockedPackage()
    expect(greenlight).toBeEnabled()
    expect(greenlight).toHaveTextContent('Queue this greenlight')
    expect(screen.getByTestId('greenlight-queue-notice')).toHaveTextContent(
      'This greenlight will join the Development & Casting queue',
    )
    expect(screen.getByTestId('greenlight-queue-notice')).toHaveTextContent(
      'No production identity, budget, or talent commitment is made until it starts',
    )
    fireEvent.click(greenlight)

    expect(onGreenlit).toHaveBeenCalledTimes(1)
    const [accepted, formationReceipt] = onGreenlit.mock.calls[0] as [GameState, unknown]
    expect(formationReceipt).toBeNull()
    const added = accepted.productionQueue.filter(
      (entry) => !before.productionQueue.some((prior) => prior.ordinal === entry.ordinal),
    )
    expect(added).toEqual([
      expect.objectContaining({
        kind: 'greenlightScriptProject',
        scriptProjectId: projectId,
        payload: expect.objectContaining({ projectId }),
      }),
    ])
    expect(accepted.studio.activeProductions).toEqual(before.studio.activeProductions)
    expect(accepted.operations.workflows).toEqual(before.operations.workflows)
    expect(accepted.scriptDevelopment.projects).toEqual(before.scriptDevelopment.projects)
    expect(accepted.studio.cash).toBe(before.studio.cash)

    cleanup()
    const acceptedPackage = scriptProjectsBoard(accepted).packages.find(
      (candidate) => candidate.projectId === projectId,
    )!
    expect(acceptedPackage.availability.canSubmitGreenlightIntent).toBe(false)
    expect(acceptedPackage.availability.blockers).toContainEqual(
      expect.objectContaining({
        kind: 'greenlight-queued',
        headline: 'Greenlight already queued',
      }),
    )
    render(
      <Assembly
        state={accepted}
        scriptProjectId={projectId}
        onGreenlit={vi.fn()}
        onCancel={() => {}}
      />,
    )
    const reopenedGreenlight = finishLockedPackage()
    expect(reopenedGreenlight).toBeDisabled()
    expect(screen.getByTestId('script-package-blocker-greenlight-queued')).toHaveTextContent(
      'This exact screenplay package already has a greenlight intent waiting',
    )
    expect(
      accepted.productionQueue.filter(
        (entry) =>
          entry.kind === 'greenlightScriptProject' && entry.scriptProjectId === projectId,
      ),
    ).toHaveLength(1)
  })

  it('keeps an unfinished casting session as a hard greenlight blocker even when capacity is full', () => {
    const fixture = contendedStudio('a3-retained-casting-hard-blocker')
    const projectId = fixture.readyProjectIds[0]!
    let state = applyActions(fixture.state, [
      { kind: 'cancel', productionId: fixture.productionIds[0]! },
    ])
    state = applyActions(state, [
      {
        kind: 'startCastingSession',
        session: freeSlate(state, projectId),
      },
    ])
    const availability = scriptProjectsBoard(state).packages.find(
      (candidate) => candidate.projectId === projectId,
    )!.availability
    expect(availability.blockers).toContainEqual(
      expect.objectContaining({ kind: 'casting-session' }),
    )
    expect(availability.developmentCastingSlotAvailable).toBe(false)
    expect(availability.canSubmitGreenlightIntent).toBe(false)
    expect(availability.willQueueGreenlightIntent).toBe(false)

    render(
      <Assembly
        state={state}
        scriptProjectId={projectId}
        onGreenlit={vi.fn()}
        onCancel={() => {}}
      />,
    )
    const greenlight = finishLockedPackage()
    expect(greenlight).toBeDisabled()
    expect(screen.getByTestId('script-package-blocker-casting-session')).toHaveTextContent(
      'Casting session must be reviewed',
    )
  })
})
