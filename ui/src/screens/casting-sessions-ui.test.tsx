import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import {
  acknowledgeCastingSessionAction,
  advanceToNextEvent,
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlightScriptProject,
  newGame,
  requiredNegative,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
} from '../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  DraftPackage,
  GameState,
  StartCastingSessionPayload,
} from '../engine/adapter.ts'
import { Assembly } from './Assembly.tsx'
import { CastingRoom } from './CastingRoom.tsx'
import { WritersRoom } from './WritersRoom.tsx'
import { App } from '../App.tsx'
import { resolveAction } from '../lot/navigation.ts'
import { setStudioLotOverviewOverride } from '../flags.ts'

const activeSession = vi.hoisted(() => ({ state: null as GameState | null }))
vi.mock('../engine/session.ts', () => ({
  clearActiveSession: () => { activeSession.state = null },
  saveActiveSession: (state: GameState) => { activeSession.state = state },
  loadActiveSession: () => activeSession.state
    ? { ok: true, state: activeSession.state, converted: false }
    : { ok: false, reason: 'none' },
}))

beforeEach(() => setStudioLotOverviewOverride(false))
afterEach(() => {
  cleanup()
  activeSession.state = null
})

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}

function managedStudio(seed: string, actorCount = FOUNDING_COUNTS.actor): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, role === 'actor' ? actorCount : FOUNDING_COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  expect(founded.next.operations.mode).toBe('managed')
  expect(founded.next.scriptDevelopment.mode).toBe('managed')
  expect(founded.next.castingSessions.mode).toBe('managed')
  return founded.next
}

function commissionPayload(state: GameState): CommissionScriptPayload {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]!
  const writer =
    board.commission.writers.find(
      (candidate) => candidate.available && candidate.primaryRole === 'writer',
    ) ?? board.commission.writers.find((candidate) => candidate.available)!
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
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

function readyStudio(seed: string, actorCount = FOUNDING_COUNTS.actor): GameState {
  let state = managedStudio(seed, actorCount)
  const commissioned = commissionScriptAction(state, commissionPayload(state))
  if (!commissioned.ok) throw new Error(commissioned.error)
  state = advanceWeek(commissioned.next).next
  const accept = scriptProjectsBoard(state).sections.needsReview[0]!.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )!
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  return accepted.next
}

function legalSlate(state: GameState): StartCastingSessionPayload {
  const project = castingSessionsBoard(state).sections.readyToPlan[0]!
  const ids = project.candidates.lead.map((candidate) => candidate.id)
  if (ids.length < 3) throw new Error('setup: fewer than three casting candidates')
  return {
    projectId: project.projectId,
    slate: {
      lead: [ids[0]!, ids[1]!],
      antagonist: [ids[0]!, ids[1]!],
      support: [ids[0]!, ids[2]!],
    },
  }
}

function reviewStudio(seed: string): GameState {
  const ready = readyStudio(seed)
  const started = startCastingSessionAction(ready, legalSlate(ready))
  if (!started.ok) throw new Error(started.error)
  return advanceWeek(started.next).next
}

function completeStudio(seed: string): GameState {
  const review = reviewStudio(seed)
  const sessionId = castingSessionsBoard(review).sections.needsReview[0]!.sessionId!
  const complete = acknowledgeCastingSessionAction(review, sessionId)
  if (!complete.ok) throw new Error(complete.error)
  return complete.next
}

function RoomHarness({
  initial,
  initialProjectId,
  onOpenPackage = () => {},
  onState,
}: {
  initial: GameState
  initialProjectId?: string
  onOpenPackage?: (projectId: string) => void
  onState?: (state: GameState) => void
}) {
  const [state, setState] = useState(initial)
  return (
    <CastingRoom
      state={state}
      {...(initialProjectId ? { initialProjectId } : {})}
      onChange={(next) => {
        onState?.(next)
        setState(next)
      }}
      onOpenPackage={onOpenPackage}
      onOpenRoster={() => {}}
      onBack={() => {}}
    />
  )
}

describe('Casting Sessions V1 — player-facing flow', () => {
  it('keeps direct package assembly beside the optional audition route', () => {
    const state = readyStudio('casting-dual-route')
    const projectId = scriptProjectsBoard(state).sections.readyToPackage[0]!.projectId
    const openPackage = vi.fn()
    const planAuditions = vi.fn()

    render(
      <WritersRoom
        state={state}
        onChange={() => {}}
        onOpenPackage={openPackage}
        onPlanAuditions={planAuditions}
        onBack={() => {}}
      />,
    )

    fireEvent.click(screen.getByTestId(`script-action-openPackage-${projectId}`))
    fireEvent.click(screen.getByTestId(`script-action-planAuditions-${projectId}`))
    expect(openPackage).toHaveBeenCalledWith(projectId)
    expect(planAuditions).toHaveBeenCalledWith(projectId)
  })

  it('does not advertise or deep-link an audition planner with fewer than three primary Actors', () => {
    const ready = readyStudio('casting-illegal-deep-link')
    const projectId = castingSessionsBoard(ready).sections.readyToPlan[0]!.projectId
    const primaryActors = ready.talent.filter((talent) => talent.role === 'actor')
    const blocked: GameState = {
      ...ready,
      talent: ready.talent.map((talent) =>
        talent.role === 'actor' && !primaryActors.slice(0, 2).some((actor) => actor.id === talent.id)
          ? { ...talent, role: 'director' }
          : talent,
      ),
    }
    const card = scriptProjectsBoard(blocked).sections.readyToPackage.find(
      (candidate) => candidate.projectId === projectId,
    )!
    expect(card.legalActions.map((action) => action.kind)).not.toContain('planAuditions')

    render(
      <WritersRoom
        state={blocked}
        onChange={() => {}}
        onOpenPackage={() => {}}
        onPlanAuditions={() => {}}
        onBack={() => {}}
      />,
    )
    expect(screen.queryByTestId(`script-action-planAuditions-${projectId}`)).not.toBeInTheDocument()

    cleanup()
    const room = render(
      <CastingRoom
        state={blocked}
        initialProjectId={projectId}
        onChange={() => {}}
        onOpenPackage={() => {}}
        onOpenRoster={() => {}}
        onBack={() => {}}
      />,
    )
    expect(screen.queryByTestId('casting-planner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('casting-start')).not.toBeInTheDocument()
    expect(screen.getByTestId(`casting-session-blockers-${projectId}`)).toHaveTextContent(
      'At least three currently available primary Actors',
    )

    room.rerender(
      <CastingRoom
        state={ready}
        initialProjectId={projectId}
        onChange={() => {}}
        onOpenPackage={() => {}}
        onOpenRoster={() => {}}
        onBack={() => {}}
      />,
    )
    // The component instance retains the rejected deep-link state; only a current
    // legal Plan action exposed by the project card may open a planner.
    expect(screen.queryByTestId('casting-planner')).not.toBeInTheDocument()
  })

  it('queues a prepared slate if shared capacity becomes full before Start', () => {
    const ready = readyStudio('casting-live-capacity-guard')
    const project = castingSessionsBoard(ready).sections.readyToPlan[0]!
    const ids = project.candidates.lead.map((candidate) => candidate.id)
    const onChange = vi.fn()
    const onBack = vi.fn()
    const room = render(
      <CastingRoom
        state={ready}
        initialProjectId={project.projectId}
        onChange={onChange}
        onOpenPackage={() => {}}
        onOpenRoster={() => {}}
        onBack={onBack}
      />,
    )
    for (const slot of ['lead', 'antagonist'] as const) {
      fireEvent.click(screen.getByTestId(`casting-candidate-${slot}-${ids[0]}`))
      fireEvent.click(screen.getByTestId(`casting-candidate-${slot}-${ids[1]}`))
    }
    fireEvent.click(screen.getByTestId(`casting-candidate-support-${ids[0]}`))
    fireEvent.click(screen.getByTestId(`casting-candidate-support-${ids[2]}`))
    expect(screen.getByTestId('casting-start')).toBeEnabled()

    const first = commissionScriptAction(ready, commissionPayload(ready))
    if (!first.ok) throw new Error(first.error)
    const second = commissionScriptAction(first.next, commissionPayload(first.next))
    if (!second.ok) throw new Error(second.error)
    expect(castingSessionsBoard(second.next).capacity.available).toBe(0)
    room.rerender(
      <CastingRoom
        state={second.next}
        initialProjectId={project.projectId}
        onChange={onChange}
        onOpenPackage={() => {}}
        onOpenRoster={() => {}}
        onBack={onBack}
      />,
    )

    expect(screen.getByTestId('casting-planner')).toBeInTheDocument()
    expect(screen.getByTestId('casting-start')).toBeEnabled()
    expect(screen.getByTestId(`casting-session-blockers-${project.projectId}`)).toHaveTextContent(
      'starting auditions now joins the queue',
    )
    fireEvent.click(screen.getByTestId('casting-start'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]![0].productionQueue).toMatchObject([
      { kind: 'startCastingSession', payload: { projectId: project.projectId } },
    ])
    expect(screen.getByText(/Auditions joined the Development & Casting queue/)).toBeInTheDocument()
    expect(onBack).toHaveBeenCalledTimes(1)

    const queuedState = onChange.mock.calls[0]![0]
    room.rerender(
      <CastingRoom
        state={queuedState}
        initialProjectId={project.projectId}
        onChange={onChange}
        onOpenPackage={() => {}}
        onOpenRoster={() => {}}
        onBack={onBack}
      />,
    )
    expect(screen.queryByTestId('casting-planner')).not.toBeInTheDocument()
    expect(screen.queryByTestId(`casting-plan-${project.projectId}`)).not.toBeInTheDocument()
    expect(screen.getByTestId(`casting-session-blockers-${project.projectId}`)).toHaveTextContent(
      'already waiting in the Development & Casting queue',
    )

    room.unmount()
    render(
      <CastingRoom
        state={queuedState}
        initialProjectId={project.projectId}
        onChange={onChange}
        onOpenPackage={() => {}}
        onOpenRoster={() => {}}
        onBack={onBack}
      />,
    )
    expect(screen.queryByTestId('casting-planner')).not.toBeInTheDocument()
    expect(screen.queryByTestId(`casting-plan-${project.projectId}`)).not.toBeInTheDocument()
  })

  it('disables a prepared slate when a selected actor becomes busy but planning stays legal', () => {
    let state = readyStudio('casting-stale-selected-actor', 6)
    const targetProject = castingSessionsBoard(state).sections.readyToPlan[0]!

    const commissioned = commissionScriptAction(state, commissionPayload(state))
    if (!commissioned.ok) throw new Error(commissioned.error)
    state = advanceWeek(commissioned.next).next
    const secondReview = scriptProjectsBoard(state).sections.needsReview.find(
      (project) => project.projectId !== targetProject.projectId,
    )!
    const accept = secondReview.legalActions.find((action) => action.kind === 'acceptScript')!
    const accepted = runScriptProjectAction(state, accept)
    if (!accepted.ok) throw new Error(accepted.error)
    state = accepted.next

    const currentTarget = castingSessionsBoard(state).sections.readyToPlan.find(
      (project) => project.projectId === targetProject.projectId,
    )!
    const actorIds = currentTarget.candidates.lead.map((candidate) => candidate.id)
    if (actorIds.length < 6) throw new Error('setup: stale-selection fixture needs six actors')
    const onChange = vi.fn()
    const room = render(
      <CastingRoom
        state={state}
        initialProjectId={targetProject.projectId}
        onChange={onChange}
        onOpenPackage={() => {}}
        onOpenRoster={() => {}}
        onBack={() => {}}
      />,
    )
    for (const [slot, pair] of [
      ['lead', [actorIds[0]!, actorIds[1]!]],
      ['antagonist', [actorIds[0]!, actorIds[2]!]],
      ['support', [actorIds[1]!, actorIds[2]!]],
    ] as const) {
      for (const id of pair) fireEvent.click(screen.getByTestId(`casting-candidate-${slot}-${id}`))
    }
    expect(screen.getByTestId('casting-start')).toBeEnabled()

    const secondPackage = scriptProjectsBoard(state).packages.find(
      (candidate) => candidate.projectId !== targetProject.projectId,
    )!
    const concept = state.concepts.find(
      (candidate) => candidate.id === secondPackage.concept.id,
    )!
    const contracted = new Set(state.contracts.map((contract) => contract.talentId))
    const contractedId = (role: CreativeRole) => state.talent.find(
      (talent) => talent.role === role && contracted.has(talent.id),
    )!.id
    const pkg: DraftPackage = {
      conceptId: secondPackage.concept.id,
      shape: secondPackage.lockedShape,
      promise: secondPackage.lockedPromise,
      writerId: secondPackage.writer.id,
      directorId: contractedId('director'),
      craftIds: [contractedId('craft')],
      cast: {
        lead: actorIds[0]!,
        antagonist: actorIds[3]!,
        support: actorIds[4]!,
      },
      budget: {
        negative: requiredNegative(concept, secondPackage.lockedShape, state),
        marketing: 0,
      },
    }
    const greenlit = greenlightScriptProject(state, secondPackage.projectId, pkg)
    if (!greenlit.ok) throw new Error(greenlit.error)
    const refreshedTarget = castingSessionsBoard(greenlit.next).sections.readyToPlan.find(
      (project) => project.projectId === targetProject.projectId,
    )!
    expect(refreshedTarget.legalActions.map((action) => action.kind)).toContain('planAuditions')
    expect(refreshedTarget.candidates.lead.length).toBeGreaterThanOrEqual(3)
    expect(refreshedTarget.candidates.lead.map((candidate) => candidate.id)).not.toContain(
      actorIds[0],
    )

    room.rerender(
      <CastingRoom
        state={greenlit.next}
        initialProjectId={targetProject.projectId}
        onChange={onChange}
        onOpenPackage={() => {}}
        onOpenRoster={() => {}}
        onBack={() => {}}
      />,
    )
    expect(screen.queryByTestId(`casting-candidate-lead-${actorIds[0]}`)).not.toBeInTheDocument()
    expect(screen.getByTestId('casting-start')).toBeDisabled()
    fireEvent.click(screen.getByTestId('casting-start'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('plans exact role pairs, enforces three distinct people, and starts without fee or hold', async () => {
    const initial = readyStudio('casting-plan-ui')
    const project = castingSessionsBoard(initial).sections.readyToPlan[0]!
    const ids = project.candidates.lead.map((candidate) => candidate.id)
    let latest = initial
    render(
      <RoomHarness
        initial={initial}
        initialProjectId={project.projectId}
        onState={(state) => { latest = state }}
      />,
    )

    expect(screen.getByTestId('casting-consequence')).toHaveTextContent('One week')
    expect(screen.getByTestId('casting-consequence')).toHaveTextContent('no audition fee')
    expect(screen.getByTestId('casting-consequence')).toHaveTextContent(
      'do not sign, pay, reserve, or mark an actor busy',
    )
    expect(screen.getByTestId('casting-plan-screenplay-context')).toHaveTextContent(
      'audition evidence, not a cast assignment',
    )
    expect(screen.getByTestId('casting-plan-screenplay-context')).toHaveTextContent(
      'Final Lead, Antagonist, and Support must be three different performers',
    )

    for (const slot of ['lead', 'antagonist'] as const) {
      fireEvent.click(screen.getByTestId(`casting-candidate-${slot}-${ids[0]}`))
      fireEvent.click(screen.getByTestId(`casting-candidate-${slot}-${ids[1]}`))
    }
    fireEvent.click(screen.getByTestId(`casting-candidate-support-${ids[0]}`))
    fireEvent.click(screen.getByTestId(`casting-candidate-support-${ids[1]}`))
    expect(screen.getByTestId('casting-unique-count')).toHaveTextContent('2 different actors')
    expect(screen.getByTestId('casting-start')).toBeDisabled()

    fireEvent.click(screen.getByTestId(`casting-candidate-support-${ids[1]}`))
    fireEvent.click(screen.getByTestId(`casting-candidate-support-${ids[2]}`))
    expect(screen.getByTestId('casting-unique-count')).toHaveTextContent('3 different actors')
    expect(screen.getByTestId('casting-start')).toBeEnabled()

    const cashBefore = initial.studio.cash
    const ledgerBefore = initial.ledger.length
    fireEvent.click(screen.getByTestId('casting-start'))

    const status = await screen.findByTestId(`casting-status-${project.projectId}`)
    await waitFor(() => expect(status).toHaveTextContent('Auditioning'))
    expect(status).toHaveFocus()
    expect(screen.getByTestId(`casting-due-${project.projectId}`)).toHaveTextContent(
      `Due Week ${initial.market.tick + 1}`,
    )
    expect(screen.getByTestId('casting-capacity-summary')).toHaveTextContent(
      '1 of 2 slots occupied · 1 available',
    )
    expect(latest.studio.cash).toBe(cashBefore)
    expect(latest.ledger).toHaveLength(ledgerBefore)
    expect(latest.castingSessions.sessions[0]!.status).toBe('auditioning')
    expect(
      castingSessionsBoard(latest).sections.auditioning[0]!.candidates.lead.every(
        (candidate) => candidate.available,
      ),
    ).toBe(true)
  })

  it('stops at review, shows only Est. evidence beside Fit, then opens a blank package', async () => {
    const initial = reviewStudio('casting-review-ui')
    const project = castingSessionsBoard(initial).sections.needsReview[0]!
    const openPackage = vi.fn()
    let latest = initial
    const { container } = render(
      <RoomHarness
        initial={initial}
        onOpenPackage={openPackage}
        onState={(state) => { latest = state }}
      />,
    )

    const first = project.results!.lead[0]!
    const evidence = screen.getByTestId(`casting-result-lead-${first.talentId}`)
    expect(screen.getByTestId(`casting-results-${project.projectId}`)).toHaveTextContent(
      'same person under more than one role means they tested for each',
    )
    expect(screen.getByTestId(`casting-results-${project.projectId}`)).toHaveTextContent(
      'Lead, Antagonist, and Support must still be three different performers',
    )
    expect(evidence).toHaveTextContent(`Est. ${first.estimate}`)
    expect(evidence).toHaveTextContent(`Camera-test range ${first.low}–${first.high}`)
    expect(evidence).toHaveTextContent(`Fit ${first.fit.score}`)
    expect(container.textContent).not.toContain('actual')
    expect(container.textContent).not.toContain('rngState')
    expect(container.textContent).not.toContain('ceiling')
    for (const slot of ['lead', 'antagonist', 'support'] as const) {
      expect(project.results![slot]).toHaveLength(2)
    }

    const stopped = advanceToNextEvent(initial)
    expect(stopped.stopReason).toBe('castingReview')
    expect(stopped.weeks).toBe(0)
    expect(stopped.stopMessage).toContain('Casting Room')

    const acknowledge = screen.getByTestId(`casting-acknowledge-${project.projectId}`)
    expect(project.packageAvailability?.blockers).toEqual([])
    expect(acknowledge).toHaveTextContent('Take results to Package')
    fireEvent.click(acknowledge)
    expect(latest.castingSessions.sessions[0]!.status).toBe('complete')
    expect(openPackage).toHaveBeenCalledWith(project.projectId)

    cleanup()
    render(
      <Assembly
        state={latest}
        scriptProjectId={project.projectId}
        onGreenlit={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(screen.getByTestId('assembly-casting-evidence')).toHaveTextContent('Camera-test evidence')
    expect(screen.getByTestId('assembly-casting-evidence')).toHaveTextContent(
      'Auditions did not preselect anyone',
    )
    for (const slot of ['lead', 'antagonist', 'support'] as const) {
      const choices = within(screen.getByTestId(`picker-${slot}`))
        .getAllByRole('button')
        .filter((button) => button.hasAttribute('aria-pressed'))
      expect(choices.length).toBeGreaterThan(0)
      expect(choices.every((button) => button.getAttribute('aria-pressed') === 'false')).toBe(true)
    }
  })

  it('hands completed review to an announced, focused blank package after navigation', async () => {
    const initial = reviewStudio('casting-accessible-handoff')
    const project = castingSessionsBoard(initial).sections.needsReview[0]!
    activeSession.state = initial
    render(<App />)

    fireEvent.click(screen.getByTestId('open-casting-room'))
    fireEvent.click(screen.getByTestId(`casting-acknowledge-${project.projectId}`))

    expect(await screen.findByTestId('assembly-casting-handoff')).toHaveTextContent(
      `${project.title} casting review complete`,
    )
    expect(screen.getByTestId('assembly-casting-handoff')).toHaveTextContent(
      'Auditions did not select anyone',
    )
    await waitFor(() => expect(screen.getByTestId('assembly-talent-heading')).toHaveFocus())
    expect(screen.getByTestId('assembly-talent-heading')).toHaveAttribute(
      'aria-describedby',
      'assembly-casting-handoff',
    )
  })

  it('keeps completed evidence visible as history', () => {
    const initial = completeStudio('casting-history-ui')
    const project = castingSessionsBoard(initial).sections.history[0]!
    render(<RoomHarness initial={initial} />)

    expect(screen.getByTestId('casting-section-history-cards')).toBeInTheDocument()
    expect(screen.getByTestId(`casting-results-${project.projectId}`)).toBeInTheDocument()
    expect(screen.getByTestId(`casting-open-package-${project.projectId}`)).toBeInTheDocument()
  })

  it('keeps historical evidence when a tested actor is no longer currently available', () => {
    const complete = completeStudio('casting-stale-evidence')
    const project = castingSessionsBoard(complete).sections.history[0]!
    const staleId = project.results!.lead[0]!.talentId
    const screenplay = scriptProjectsBoard(complete).packages.find(
      (candidate) => candidate.projectId === project.projectId,
    )!
    const concept = complete.concepts.find((candidate) => candidate.id === screenplay.concept.id)!
    const slateIds = [...new Set(
      (['lead', 'antagonist', 'support'] as const)
        .flatMap((slot) => project.candidates[slot].map((candidate) => candidate.id)),
    )]
    const actorIds = [staleId, ...slateIds.filter((id) => id !== staleId)].slice(0, 3)
    const contracted = new Set(complete.contracts.map((contract) => contract.talentId))
    const contractedId = (role: CreativeRole) => complete.talent.find(
      (talent) => talent.role === role && contracted.has(talent.id),
    )!.id
    const pkg: DraftPackage = {
      conceptId: screenplay.concept.id,
      shape: screenplay.lockedShape,
      promise: screenplay.lockedPromise,
      writerId: screenplay.writer.id,
      directorId: contractedId('director'),
      craftIds: [contractedId('craft')],
      cast: {
        lead: actorIds[0]!,
        antagonist: actorIds[1]!,
        support: actorIds[2]!,
      },
      budget: {
        negative: requiredNegative(concept, screenplay.lockedShape, complete),
        marketing: 0,
      },
    }
    const greenlit = greenlightScriptProject(complete, project.projectId, pkg)
    if (!greenlit.ok) throw new Error(greenlit.error)

    render(<RoomHarness initial={greenlit.next} />)
    const evidence = screen.getByTestId(`casting-result-lead-${staleId}`)
    expect(evidence).toHaveTextContent('Est.')
    expect(evidence).toHaveTextContent('Current status:')
    expect(evidence).toHaveTextContent('Currently assigned to another production or screenplay')
  })

  it('routes Dashboard, Writers Room, and the Casting / Talent lot destination to the real room', () => {
    const initial = readyStudio('casting-app-routes')
    const projectId = castingSessionsBoard(initial).sections.readyToPlan[0]!.projectId
    activeSession.state = initial
    render(<App />)

    fireEvent.click(screen.getByTestId('open-casting-room'))
    expect(screen.getByTestId('casting-room')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('casting-room-back'))
    fireEvent.click(screen.getByTestId('assemble-film'))
    fireEvent.click(screen.getByTestId(`script-action-planAuditions-${projectId}`))
    expect(screen.getByTestId('casting-room')).toBeInTheDocument()
    expect(screen.getByTestId('casting-planner')).toBeInTheDocument()

    expect(resolveAction('browse-talent')).toEqual({
      route: { kind: 'castingRoom' },
      navLabel: 'Open Casting Room',
    })
  })

  it('returns a newly completed sim-to-event stop to the Casting Room', () => {
    const ready = readyStudio('casting-summary-route')
    const started = startCastingSessionAction(ready, legalSlate(ready))
    if (!started.ok) throw new Error(started.error)
    activeSession.state = started.next
    render(<App />)

    fireEvent.click(screen.getByTestId('sim-to-event'))
    expect(screen.getByTestId('period-summary')).toBeInTheDocument()
    expect(screen.getByTestId('stop-reason')).toHaveTextContent('Casting Room')
    fireEvent.click(screen.getByTestId('period-continue'))
    expect(screen.getByTestId('casting-room')).toBeInTheDocument()
    expect(screen.getByTestId('casting-section-needsReview-cards')).toBeInTheDocument()
  })
})
