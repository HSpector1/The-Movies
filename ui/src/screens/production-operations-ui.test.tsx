import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  advanceToNextEvent,
  advanceWeek,
  canFoundStudio,
  foundManagedStudioAction,
  foundStudioAction,
  foundingApplicantCards,
  greenlight,
  newGame,
  productionBoard,
  productionDecision,
  requiredNegative,
  runProductionCommand,
  signContractAction,
} from '../engine/adapter.ts'
import type { CreativeRole, DraftPackage, GameState } from '../engine/adapter.ts'
import { ProductionBoard } from '../components/ProductionBoard.tsx'
import { Dashboard } from './Dashboard.tsx'

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}
const RICH_FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 6,
  director: 2,
  writer: 2,
  craft: 2,
}

function readyToFound(
  seed: string,
  counts: Record<CreativeRole, number> = FOUNDING_COUNTS,
): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const ids = cards
      .filter((card) => card.profile.role === role)
      .slice(0, counts[role])
      .map((card) => card.profile.id)
    for (const id of ids) {
      const signed = signContractAction(state, id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  expect(canFoundStudio(state)).toBe(true)
  return state
}

function managedGame(
  seed: string,
  counts: Record<CreativeRole, number> = FOUNDING_COUNTS,
): GameState {
  const founded = foundManagedStudioAction(readyToFound(seed, counts))
  if (!founded.ok) throw new Error(founded.error)
  // This Production Operations V1 fixture intentionally exercises the frozen
  // direct-greenlight path. New-player activation itself is asserted separately
  // below; migrated studios may legitimately have managed operations with legacy
  // screenplay development until they explicitly activate it.
  return {
    ...founded.next,
    scriptDevelopment: { mode: 'legacy', projects: [] },
    castingSessions: { mode: 'legacy', sessions: [] },
  }
}

function legalPackage(state: GameState, slot = 0): DraftPackage {
  const concept = state.concepts[slot]!
  const ids = (role: CreativeRole) =>
    state.contracts
      .map((contract) => contract.talentId)
      .filter((id) => state.talent.find((candidate) => candidate.id === id)?.role === role)
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
    writerId: ids('writer')[slot]!,
    directorId: ids('director')[slot]!,
    craftIds: [ids('craft')[slot]!],
    cast: {
      lead: ids('actor')[slot * 3]!,
      antagonist: ids('actor')[slot * 3 + 1]!,
      support: ids('actor')[slot * 3 + 2]!,
    },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

function greenlightManaged(state: GameState, slot = 0): GameState {
  const result = greenlight(state, legalPackage(state, slot))
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function greenlitManagedGame(seed: string): GameState {
  return greenlightManaged(managedGame(seed))
}

function capacityHeldGame(seed: string): GameState {
  let state = managedGame(seed, RICH_FOUNDING_COUNTS)
  state = {
    ...state,
    operations: {
      ...state.operations,
      facilities: state.operations.facilities.filter(
        (facility) => facility.id !== 'facility-soundstage-12',
      ),
    },
  }
  state = greenlightManaged(state, 0)
  state = greenlightManaged(state, 1)
  state = advanceWeek(state).next // greenlight tick: skip
  state = advanceWeek(state).next // both enter Pre-production
  return advanceWeek(state).next // first enters Rehearsal; second waits for capacity
}

describe('Production Operations V1 UI boundary', () => {
  it('falls back to the stable board heading when a requested production is missing', async () => {
    const board = productionBoard(greenlitManagedGame('ops-ui-missing-production-focus'))

    render(
      <ProductionBoard
        board={board}
        focusProductionId="missing-production"
      />,
    )

    expect(screen.getByTestId(`active-${board.cards[0]!.productionId}`)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('production-board-heading')).toHaveFocus())
  })

  it('falls back to the stable board heading when a requested production ID is duplicated', async () => {
    const board = productionBoard(
      advanceToNextEvent(greenlitManagedGame('ops-ui-duplicate-production-focus')).next,
    )
    const card = board.cards[0]!
    const duplicateBoard = {
      ...board,
      cards: [card, { ...card, title: `${card.title} duplicate identity` }],
    }
    // The duplicate identity is deliberately malformed authority. React also
    // reports its duplicate render key, which is expected for this rejection case.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      render(
        <ProductionBoard
          board={duplicateBoard}
          focusProductionId={card.productionId}
        />,
      )

      expect(screen.getAllByTestId(`active-${card.productionId}`)).toHaveLength(2)
      await waitFor(() => expect(screen.getByTestId('production-board-heading')).toHaveFocus())
    } finally {
      consoleError.mockRestore()
    }
  })

  it('focuses exact identity independent of card order when two productions share a title', async () => {
    const board = productionBoard(greenlitManagedGame('ops-ui-same-title-focus'))
    const source = board.cards[0]!
    const targetId = 'same-title-exact-target'
    const target = {
      ...source,
      productionId: targetId,
      command: null,
    }
    const targetTestId = `production-status-${targetId}`

    for (const cards of [[source, target], [target, source]]) {
      const rendered = render(
        <ProductionBoard
          board={{ ...board, cards }}
          focusProductionId={targetId}
        />,
      )

      await waitFor(() => expect(screen.getByTestId(targetTestId)).toHaveFocus())
      expect(screen.getAllByText(source.title).length).toBeGreaterThanOrEqual(2)
      rendered.unmount()
    }
  })

  it('moves keyboard focus through the command chain and announces the final scheduled state', async () => {
    const initial = advanceToNextEvent(greenlitManagedGame('ops-ui-command-focus')).next
    const productionId = initial.studio.activeProductions[0]!.id

    function Harness() {
      const [state, setState] = useState(initial)
      return (
        <Dashboard
          state={state}
          onAssemble={() => {}}
          onAdvance={() => {}}
          onSimToEvent={() => {}}
          onCreateTalent={() => {}}
          onSaves={() => {}}
          onOpenAutopsy={() => {}}
          onProductionCommand={(command) => {
            const result = runProductionCommand(state, command)
            if (!result.ok) throw new Error(result.error)
            setState(result.next)
          }}
        />
      )
    }

    render(<Harness />)
    const assign = screen.getByTestId(
      `production-command-assignShootingDirector-${productionId}`,
    )
    assign.focus()
    fireEvent.click(assign)
    const clear = await screen.findByTestId(
      `production-command-clearSceneryLoadIn-${productionId}`,
    )
    await waitFor(() => expect(clear).toHaveFocus())

    fireEvent.click(clear)
    const schedule = await screen.findByTestId(
      `production-command-scheduleShootingTake-${productionId}`,
    )
    await waitFor(() => expect(schedule).toHaveFocus())

    fireEvent.click(schedule)
    const status = await screen.findByTestId(`production-status-${productionId}`)
    await waitFor(() => expect(status).toHaveTextContent('Take scheduled'))
    expect(status).toHaveAttribute('role', 'status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveFocus()
  })

  it('keeps legacy founding intact while the real wrapper activates both managed systems atomically', () => {
    const ready = readyToFound('ops-ui-founding')
    const before = JSON.stringify(ready)

    const legacy = foundStudioAction(ready)
    const managed = foundManagedStudioAction(ready)
    expect(legacy.ok).toBe(true)
    expect(managed.ok).toBe(true)
    if (!legacy.ok || !managed.ok) return

    expect(legacy.next.operations).toEqual({ mode: 'legacy', facilities: [], workflows: [] })
    expect(legacy.next.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] })
    expect(managed.next.operations.mode).toBe('managed')
    expect(managed.next.scriptDevelopment).toEqual({ mode: 'managed', projects: [] })
    expect(managed.next.operations.facilities.map((facility) => facility.name)).toEqual([
      'Development & Casting',
      'Post Building',
      'Scenery Shop',
      'Soundstage 7',
      'Soundstage 12',
    ])
    expect(managed.next.operations.workflows).toEqual([])
    expect(JSON.stringify(ready)).toBe(before)
  })

  it('projects phases, reservations, the locked director, and only the currently legal command', () => {
    const greenlit = greenlitManagedGame('ops-ui-board')
    const opening = productionBoard(greenlit).cards[0]!
    expect(opening.phaseLabel).toBe('Development')
    expect(opening.currentFacility).toBe('Development & Casting')
    expect(opening.weeksRemaining).toBe(8)
    expect(opening.director.name).not.toBe(opening.director.id)
    expect(opening.command).toBeNull()

    const stopped = advanceToNextEvent(greenlit)
    expect(stopped.stopReason).toBe('productionDecision')
    expect(stopped.weeks).toBe(4)
    expect(stopped.stopMessage).toContain(opening.title)
    expect(stopped.stopMessage).toContain('Call ')

    const shooting = productionBoard(stopped.next).cards[0]!
    expect(shooting.phaseLabel).toBe('Shooting')
    expect(shooting.currentFacility).toContain('Soundstage 7')
    expect(shooting.currentFacility).toContain('Scenery Shop')
    expect(shooting.shootingTaskStatus).toBe('unassigned')
    expect(shooting.command?.kind).toBe('assignShootingDirector')
    expect(shooting.command?.label).toContain('Soundstage 7')
    expect(shooting.command?.label).not.toContain('Scenery Shop')
    expect(shooting.blocker?.detail).toContain('Soundstage 7')
    expect(shooting.blocker?.detail).not.toContain('Scenery Shop')
    expect(shooting.blocker?.consequence).toContain('payroll and studio overhead continue')

    const beforePreflight = JSON.stringify(stopped.next)
    const preflight = advanceToNextEvent(stopped.next)
    expect(preflight.stopReason).toBe('productionDecision')
    expect(preflight.weeks).toBe(0)
    expect(preflight.summary.weeks).toBe(0)
    expect(preflight.summary.netCash).toBe(0)
    expect(preflight.next).toBe(stopped.next)
    expect(JSON.stringify(preflight.next)).toBe(beforePreflight)
  })

  it('names each two-film shooting command by its exact reserved soundstage, never the scenery shop', () => {
    let state = managedGame('ops-ui-two-destinations', RICH_FOUNDING_COUNTS)
    state = greenlightManaged(state, 0)
    state = greenlightManaged(state, 1)
    state = advanceWeek(state).next
    state = advanceWeek(state).next
    state = advanceWeek(state).next
    state = advanceWeek(state).next

    const cards = productionBoard(state).cards
    expect(cards).toHaveLength(2)
    expect(cards.map((card) => card.productionId)).toEqual(
      [...cards.map((card) => card.productionId)].sort(),
    )
    for (const card of cards) {
      const reservedStage = card.currentFacility.includes('Soundstage 7')
        ? 'Soundstage 7'
        : 'Soundstage 12'
      expect(card.currentFacility).toContain('Scenery Shop')
      expect(card.command?.label).toContain(reservedStage)
      expect(card.command?.label).not.toContain('Scenery Shop')
      expect(card.blocker?.detail).toContain(reservedStage)
      expect(card.blocker?.detail).not.toContain('Scenery Shop')
    }
  })

  it('runs the three-command shooting chain through engine actions and advances only once scheduled', () => {
    let state = advanceToNextEvent(greenlitManagedGame('ops-ui-chain')).next
    const heldRemaining = state.studio.activeProductions[0]!.remainingTicks

    const assign = productionDecision(state)!.command!
    const assigned = runProductionCommand(state, assign)
    expect(assigned.ok).toBe(true)
    if (!assigned.ok) return
    state = assigned.next
    expect(productionDecision(state)?.command?.kind).toBe('clearSceneryLoadIn')
    expect(productionDecision(state)?.shootingTaskStatus).toBe('blocked')
    expect(productionDecision(state)?.blocker?.detail).toContain('Soundstage 7')
    expect(productionDecision(state)?.blocker?.detail).not.toContain('Scenery Shop')

    const clear = runProductionCommand(state, productionDecision(state)!.command!)
    expect(clear.ok).toBe(true)
    if (!clear.ok) return
    state = clear.next
    expect(productionDecision(state)?.command?.kind).toBe('scheduleShootingTake')
    expect(productionDecision(state)?.shootingTaskStatus).toBe('ready')
    expect(productionDecision(state)?.blocker?.detail).toContain('Soundstage 7')
    expect(productionDecision(state)?.blocker?.detail).not.toContain('Scenery Shop')

    const schedule = runProductionCommand(state, productionDecision(state)!.command!)
    expect(schedule.ok).toBe(true)
    if (!schedule.ok) return
    state = schedule.next
    expect(productionDecision(state)).toBeNull()
    expect(productionBoard(state).cards[0]!.shootingTaskStatus).toBe('scheduled')

    state = advanceWeek(state).next
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(heldRemaining - 1)
    expect(productionBoard(state).cards[0]!.shootingTaskStatus).toBe('completed')
  })

  it('surfaces stale or mismatched shooting commands as data and leaves state byte-identical', () => {
    const state = advanceToNextEvent(greenlitManagedGame('ops-ui-reject')).next
    const productionId = state.studio.activeProductions[0]!.id
    const before = JSON.stringify(state)

    const staleClear = runProductionCommand(state, {
      kind: 'clearSceneryLoadIn',
      productionId,
      label: 'stale test command',
    })
    expect(staleClear.ok).toBe(false)
    if (!staleClear.ok) expect(staleClear.error).toContain('no active scenery-load-in blocker')

    const wrongDirector = runProductionCommand(state, {
      kind: 'assignShootingDirector',
      productionId,
      directorId: 'not-the-locked-director',
      label: 'invalid test command',
    })
    expect(wrongDirector.ok).toBe(false)
    if (!wrongDirector.ok) expect(wrongDirector.error).toContain('is not productionId')
    expect(JSON.stringify(state)).toBe(before)
  })

  it('keeps a non-actionable capacity warning visible without deadlocking unattended simulation', () => {
    const held = capacityHeldGame('ops-ui-capacity-warning')
    const warning = productionBoard(held).cards.find(
      (card) => card.blocker?.kind === 'facility-capacity',
    )!
    expect(warning.command).toBeNull()
    expect(warning.blocker?.detail).toMatch(/was available when .* was attempted/i)
    expect(warning.blocker?.detail).toMatch(/retry next week/i)
    expect(productionDecision(held)).toBeNull()

    const simulated = advanceToNextEvent(held)
    expect(simulated.weeks).toBeGreaterThan(0)
    expect(simulated.next).not.toBe(held)
    expect(simulated.stopReason).toBe('productionDecision')
    expect(simulated.productionDecision?.command).not.toBeNull()

    // This is an intentional configured-capacity research fixture (one canonical
    // soundstage removed), not a valid V11 player save. Render the narrow board that
    // owns the warning; the full Dashboard also projects the canonical Annex and
    // therefore correctly rejects this impossible production configuration.
    render(<ProductionBoard board={productionBoard(held)} onCommand={() => {}} />)
    expect(screen.getByTestId(`production-blocker-${warning.productionId}`)).toHaveTextContent(
      /retry next week/i,
    )
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
  })

  it('renders the board decision, disables unattended simulation, and emits the exact command', () => {
    const state = advanceToNextEvent(greenlitManagedGame('ops-ui-render')).next
    const card = productionBoard(state).cards[0]!
    const onCommand = vi.fn()

    render(
      <Dashboard
        state={state}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
        onProductionCommand={onCommand}
      />,
    )

    expect(screen.getByTestId(`production-phase-${card.productionId}`)).toHaveTextContent('Shooting')
    expect(screen.getByTestId(`production-facility-${card.productionId}`)).toHaveTextContent('Soundstage 7')
    expect(screen.getByTestId(`production-director-${card.productionId}`)).toHaveTextContent(card.director.name)
    expect(screen.getByTestId(`production-blocker-${card.productionId}`)).toHaveTextContent('Director call required')
    expect(screen.getByTestId('production-schedule-assumption')).toHaveTextContent('on-schedule eight-week')
    expect(screen.getByTestId('sim-to-event')).toBeDisabled()

    const button = screen.getByTestId(`production-command-assignShootingDirector-${card.productionId}`)
    fireEvent.click(button)
    expect(onCommand).toHaveBeenCalledWith(card.command)
  })
})
