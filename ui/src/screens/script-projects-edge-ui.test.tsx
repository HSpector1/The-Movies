import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { App } from '../App.tsx'
import {
  advanceWeek,
  assemblyAvailability,
  assessCreativeCohesion,
  commissionScriptAction,
  foundManagedStudioAction,
  freelancerPool,
  foundingApplicantCards,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  studioPool,
} from '../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  GameState,
} from '../engine/adapter.ts'
import { clearActiveSession, saveActiveSession } from '../engine/session.ts'
import { Assembly } from './Assembly.tsx'
import { StudioRoster } from './StudioRoster.tsx'
import { WritersRoom } from './WritersRoom.tsx'
import { setStudioLotOverviewOverride } from '../flags.ts'

const activeSession = vi.hoisted(() => ({ state: null as unknown }))
vi.mock('../engine/session.ts', () => ({
  clearActiveSession: () => { activeSession.state = null },
  saveActiveSession: (state: unknown) => { activeSession.state = state },
  loadActiveSession: () => activeSession.state
    ? { ok: true, state: activeSession.state, converted: false }
    : { ok: false, reason: 'none' },
}))

beforeEach(() => {
  clearActiveSession()
  setStudioLotOverviewOverride(false)
})
afterEach(() => {
  cleanup()
  clearActiveSession()
})

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}

function managedStudio(seed: string, writerCount = 1): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const count = role === 'writer' ? writerCount : FOUNDING_COUNTS[role]
    const ids = cards
      .filter((card) => card.profile.role === role)
      .slice(0, count)
      .map((card) => card.profile.id)
    for (const id of ids) {
      const signed = signContractAction(state, id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

function commissionPayload(
  state: GameState,
  writerId?: string,
): CommissionScriptPayload {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]!
  const writer = writerId
    ? board.commission.writers.find((candidate) => candidate.id === writerId)!
    : board.commission.writers.find((candidate) => candidate.available)!
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: 'immediateAction',
      midpoint: 'escalation',
      ending: 'triumph',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.65, 0.15],
        tonalWeight: [-0.65, 0.15],
        kineticEnergy: [-0.65, 0.15],
      },
    },
  }
}

function commission(state: GameState, writerId?: string): GameState {
  const result = commissionScriptAction(state, commissionPayload(state, writerId))
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function acceptFirstReview(state: GameState): GameState {
  const action = scriptProjectsBoard(state).sections.needsReview[0]?.legalActions.find(
    (candidate) => candidate.kind === 'acceptScript',
  )
  if (!action) throw new Error('setup: no screenplay acceptance action')
  const result = runScriptProjectAction(state, action)
  if (!result.ok) throw new Error(result.error)
  return result.next
}

// A Ready package whose credited writer is BOTH drafting another screenplay and out
// of contract, with both shared Development/Casting slots occupied.
//
// RE-POINTED for P04A.2 (Owner ruling A/B/C). The "writer is drafting another
// screenplay" half used to publish a `writer-assignment` blocker on this Ready
// package; it no longer does, and must not — a greenlight engages nobody's writing
// time, it locks a permanent credit on a screenplay that is already finished. The
// drafting setup is kept ON PURPOSE so this fixture also pins that absence. The
// blockers this spec renders are `writer-contract` (still law for `package`: the
// engine really does require `isContracted(project.writerId)` at greenlight) and
// `facility-capacity`.
function readyPackageBlockedByScriptWork(seed: string) {
  let state = managedStudio(seed, 2)
  const writerIds = scriptProjectsBoard(state).commission.writers
    .filter((writer) => writer.available)
    .map((writer) => writer.id)
  state = commission(state, writerIds[0])
  state = acceptFirstReview(advanceWeek(state).next)
  const readyId = scriptProjectsBoard(state).packages[0]!.projectId
  const creditedWriterId = state.scriptDevelopment.projects.find(
    (project) => project.id === readyId,
  )!.writerId
  expect(creditedWriterId).toBe(writerIds[0])
  state = commission(state, writerIds[0])
  state = commission(state, writerIds[1])
  // The credited writer of the Ready package leaves the studio's contract list.
  const lapsed: GameState = {
    ...state,
    contracts: state.contracts.filter(
      (contract) => contract.talentId !== creditedWriterId,
    ),
  }
  return { state: lapsed, readyId, creditedWriterId, draftingState: state }
}

function pickFirstEligible(testId: string) {
  const button = within(screen.getByTestId(testId))
    .getAllByRole('button')
    .find((candidate) =>
      candidate.hasAttribute('aria-pressed') && !(candidate as HTMLButtonElement).disabled,
    )
  if (!button) throw new Error(`setup: no eligible choice in ${testId}`)
  fireEvent.click(button)
}

describe('managed screenplay gate truth', () => {
  it('disables greenlight and renders every Ready-package blocker with its remedy', () => {
    const { state, readyId, creditedWriterId, draftingState } =
      readyPackageBlockedByScriptWork('script-package-gates')

    // P04A.2: the credited writer being busy DRAFTING another screenplay publishes no
    // package blocker at all — a Writer credit is not an active writing assignment.
    const draftingOnly = scriptProjectsBoard(draftingState).packages.find(
      (candidate) => candidate.projectId === readyId,
    )!
    expect(
      draftingState.scriptDevelopment.projects
        .filter((project) => project.status === 'drafting')
        .map((project) => project.writerId),
    ).toContain(creditedWriterId)
    expect(draftingOnly.availability.blockers.map((blocker) => blocker.kind)).toEqual([
      'facility-capacity',
    ])

    const locked = scriptProjectsBoard(state).packages.find(
      (candidate) => candidate.projectId === readyId,
    )!
    expect(locked.availability.blockers.map((blocker) => blocker.kind)).toEqual([
      'writer-contract',
      'facility-capacity',
    ])

    const onGreenlit = vi.fn()
    render(
      <Assembly
        state={state}
        scriptProjectId={readyId}
        onGreenlit={onGreenlit}
        onCancel={() => {}}
      />,
    )
    pickFirstEligible('picker-director')
    pickFirstEligible('picker-lead')
    pickFirstEligible('picker-antagonist')
    pickFirstEligible('picker-support')
    pickFirstEligible('picker-craft')
    fireEvent.click(screen.getByTestId('assembly-next'))
    fireEvent.click(screen.getByTestId('assembly-next'))

    expect(screen.getByTestId('greenlight')).toBeDisabled()
    const rendered = screen.getByTestId('script-package-blockers')
    for (const blocker of locked.availability.blockers) {
      expect(rendered).toHaveTextContent(blocker.headline)
      expect(rendered).toHaveTextContent(blocker.detail)
      expect(rendered).toHaveTextContent(blocker.remedy)
    }
    const expectedCohesion = assessCreativeCohesion(
      state.concepts.find((concept) => concept.id === locked.concept.id)!,
      locked.lockedShape,
      locked.lockedPromise,
    )
    expect(screen.getByTestId('pkg-cohesion-score')).toHaveTextContent(
      `${expectedCohesion.score.toFixed(0)} · ${expectedCohesion.tier}`,
    )
    fireEvent.click(screen.getByTestId('greenlight'))
    expect(onGreenlit).not.toHaveBeenCalled()
  })

  it('returns a screenplay-review Weekly Summary directly to the Writers Room', () => {
    saveActiveSession(commission(managedStudio('script-summary-return')))
    render(<App />)

    fireEvent.click(screen.getByTestId('sim-to-event'))
    expect(screen.getByTestId('period-summary')).toBeInTheDocument()
    expect(screen.getByTestId('stop-reason')).toHaveTextContent('Writers’ Room')
    fireEvent.click(screen.getByTestId('period-continue'))
    expect(screen.getByTestId('writers-room')).toBeInTheDocument()
  })

  it('names a contracted writer’s active screenplay in the Assembly availability reason', () => {
    let state = managedStudio('script-busy-blurb')
    const writerId = scriptProjectsBoard(state).commission.writers.find(
      (writer) => writer.available && writer.primaryRole === 'writer',
    )!.id
    state = commission(state, writerId)
    const writerName = state.talent.find((talent) => talent.id === writerId)!.name
    const title = scriptProjectsBoard(state).sections.inDevelopment[0]!.title
    const contracted = new Set(state.contracts.map((contract) => contract.talentId))
    state = {
      ...state,
      talent: state.talent.map((talent) =>
        talent.role === 'writer' && !contracted.has(talent.id)
          ? { ...talent, role: 'actor' }
          : talent,
      ),
    }

    const availability = assemblyAvailability(state)
    expect(studioPool(state, 'writer')).toHaveLength(1)
    expect(studioPool(state, 'writer')[0]!.available).toBe(false)
    expect(freelancerPool(state, 'writer')).toHaveLength(0)
    expect(availability.canAssemble).toBe(false)
    expect(availability.missingRoles[0]).toBe('writer')
    expect(availability.reason).toContain(`${writerName} is Drafting ${title}`)
    expect(availability.reason).toContain('until the screenplay reaches review')
    expect(availability.reason).not.toContain(writerId)
  })

  it('names screenplay work on the roster and prevents an inevitably rejected early release', () => {
    let state = managedStudio('script-roster-assignment')
    const writerId = scriptProjectsBoard(state).commission.writers.find(
      (writer) => writer.available,
    )!.id
    state = commission(state, writerId)
    const assignment = scriptProjectsBoard(state).sections.inDevelopment[0]!

    render(
      <StudioRoster
        state={state}
        onChange={() => {}}
        onBack={() => {}}
      />,
    )

    expect(screen.getByTestId(`roster-assignment-${writerId}`)).toHaveTextContent(
      `Drafting ${assignment.title}`,
    )
    expect(screen.getByTestId(`roster-assignment-${writerId}`)).toHaveTextContent(
      'until the screenplay reaches review',
    )
    expect(screen.getByTestId(`roster-release-${writerId}`)).toBeDisabled()
  })

  it.each([
    ['actor', ['picker-lead', 'picker-antagonist', 'picker-support']],
    ['director', ['picker-director']],
    ['craft', ['picker-craft']],
  ] as const)(
    'excludes a locked primary-%s writer from every other package credit',
    (primaryRole, pickerIds) => {
    let state = managedStudio(`script-cross-discipline-${primaryRole}`)
    const contractedIds = new Set(state.contracts.map((contract) => contract.talentId))
    const crossDisciplineWriter = state.talent.find(
      (talent) => talent.role === primaryRole && contractedIds.has(talent.id),
    )!
    state = commission(state, crossDisciplineWriter.id)
    state = acceptFirstReview(advanceWeek(state).next)
    const readyId = scriptProjectsBoard(state).packages[0]!.projectId

    render(
      <Assembly
        state={state}
        scriptProjectId={readyId}
        onGreenlit={() => {}}
        onCancel={() => {}}
      />,
    )

    for (const pickerId of pickerIds) {
      const candidate = within(screen.getByTestId(pickerId)).getByTestId(
        `talent-${crossDisciplineWriter.id}`,
      )
      expect(candidate).toBeDisabled()
      expect(candidate).toHaveTextContent(
        'Already assigned elsewhere on this picture — one person can hold only one role per production.',
      )
    }
    },
  )

  it('shows a locked-writer staffing shortage before package navigation', () => {
    let state = managedStudio('script-cross-discipline-staffing')
    const contractedIds = new Set(state.contracts.map((contract) => contract.talentId))
    const directorWriter = state.talent.find(
      (talent) => talent.role === 'director' && contractedIds.has(talent.id),
    )!
    state = commission(state, directorWriter.id)
    state = acceptFirstReview(advanceWeek(state).next)
    state = {
      ...state,
      talent: state.talent.map((talent) =>
        talent.id !== directorWriter.id && talent.role === 'director'
          ? { ...talent, role: 'actor' }
          : talent,
      ),
    }

    const card = scriptProjectsBoard(state).sections.readyToPackage[0]!
    const blocker = card.blockers.find((candidate) => candidate.kind === 'package-staffing')!
    expect(card.legalActions.map((action) => action.kind)).toEqual(['planAuditions'])

    render(
      <WritersRoom
        state={state}
        onChange={() => {}}
        onOpenPackage={() => {}}
        onBack={() => {}}
      />,
    )

    const rendered = screen.getByTestId(`script-blockers-${card.projectId}`)
    expect(rendered).toHaveTextContent(blocker.headline)
    expect(rendered).toHaveTextContent(directorWriter.name)
    expect(rendered).toHaveTextContent('Director (0 of 1 available)')
    expect(rendered).toHaveTextContent(blocker.remedy)
    expect(
      screen.queryByTestId(`script-action-openPackage-${card.projectId}`),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId(`script-action-planAuditions-${card.projectId}`),
    ).toBeInTheDocument()
  })
})
