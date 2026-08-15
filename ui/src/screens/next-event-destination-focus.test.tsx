import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import {
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
} from '../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  GameState,
} from '../engine/adapter.ts'
import { CastingRoom } from './CastingRoom.tsx'
import { Dashboard } from './Dashboard.tsx'
import { StudioRoster } from './StudioRoster.tsx'

afterEach(cleanup)

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

function auditioningStudio(seed: string): GameState {
  let state = managedStudio(seed)
  const scripts = scriptProjectsBoard(state)
  const concept = scripts.commission.concepts[0]!
  const writer = scripts.commission.writers.find((candidate) => candidate.available)!
  const payload: CommissionScriptPayload = {
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
  const commissioned = commissionScriptAction(state, payload)
  if (!commissioned.ok) throw new Error(commissioned.error)
  state = advanceWeek(commissioned.next).next

  const accept = scriptProjectsBoard(state).sections.needsReview[0]?.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (!accept) throw new Error('setup: accepted screenplay action missing')
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  state = accepted.next

  const project = castingSessionsBoard(state).sections.readyToPlan[0]
  if (!project) throw new Error('setup: casting-ready screenplay missing')
  const actors = project.candidates.lead.map((candidate) => candidate.id)
  const started = startCastingSessionAction(state, {
    projectId: project.projectId,
    slate: {
      lead: [actors[0]!, actors[1]!],
      antagonist: [actors[0]!, actors[1]!],
      support: [actors[0]!, actors[2]!],
    },
  })
  if (!started.ok) throw new Error(started.error)
  return started.next
}

function renderDashboard(
  state: GameState,
  focus: {
    focusSection?: 'finances' | 'releases'
    focusDashboard?: boolean
    focusRunId?: string
  },
) {
  const noop = () => {}
  return render(
    <Dashboard
      state={state}
      onAssemble={noop}
      onAdvance={noop}
      onSimToEvent={noop}
      onCreateTalent={noop}
      onSaves={noop}
      onOpenAutopsy={noop}
      {...focus}
    />,
  )
}

describe('lot-native next-event destination focus', () => {
  it('focuses a casting decision only when session and project form one exact match', async () => {
    const state = auditioningStudio('next-event-casting-focus')
    const before = exportSaveJson(state)
    const project = castingSessionsBoard(state).sections.auditioning[0]
    if (!project?.sessionId) throw new Error('setup: auditioning session identity missing')
    const noop = () => {}

    const exact = render(
      <CastingRoom
        state={state}
        onChange={noop}
        onOpenPackage={noop}
        onOpenRoster={noop}
        onBack={noop}
        focusCastingDecision={{
          sessionId: project.sessionId,
          projectId: project.projectId,
        }}
        focusProjectId="missing-project"
      />,
    )
    const status = screen.getByTestId(`casting-status-${project.projectId}`)
    await waitFor(() => expect(document.activeElement).toBe(status))
    exact.unmount()

    const wrongSession = render(
      <CastingRoom
        state={state}
        onChange={noop}
        onOpenPackage={noop}
        onOpenRoster={noop}
        onBack={noop}
        focusCastingDecision={{
          sessionId: `${project.sessionId}-missing`,
          projectId: project.projectId,
        }}
        focusProjectId={project.projectId}
      />,
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByTestId('casting-room-heading')),
    )
    wrongSession.unmount()

    render(
      <CastingRoom
        state={state}
        onChange={noop}
        onOpenPackage={noop}
        onOpenRoster={noop}
        onBack={noop}
        focusCastingDecision={{
          sessionId: project.sessionId,
          projectId: `${project.projectId}-missing`,
        }}
      />,
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByTestId('casting-room-heading')),
    )
    expect(exportSaveJson(state)).toBe(before)
  })

  it('focuses finance, releases, or the generic Dashboard root without changing state', async () => {
    const state = managedStudio('next-event-dashboard-focus')
    const before = exportSaveJson(state)

    const finances = renderDashboard(state, { focusSection: 'finances' })
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByTestId('dashboard-finances-heading')),
    )
    finances.unmount()

    const releases = renderDashboard(state, { focusSection: 'releases' })
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByTestId('dashboard-releases-heading')),
    )
    releases.unmount()

    const root = renderDashboard(state, { focusDashboard: true })
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByTestId('dashboard-heading')),
    )
    root.unmount()

    renderDashboard(state, { focusSection: 'finances', focusRunId: 'missing-run' })
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByTestId('theatrical-runs-heading')),
    )
    expect(exportSaveJson(state)).toBe(before)
  })

  it('focuses the generic roster heading unless an exact talent identity is supplied', async () => {
    const state = managedStudio('next-event-roster-focus')
    const before = exportSaveJson(state)
    const talentId = state.contracts[0]!.talentId
    const noop = () => {}

    const generic = render(
      <StudioRoster
        state={state}
        onChange={noop}
        onBack={noop}
        focusHeadingOnMount
      />,
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByTestId('roster-heading')),
    )
    generic.unmount()

    render(
      <StudioRoster
        state={state}
        onChange={noop}
        onBack={noop}
        focusTalentId={talentId}
        focusHeadingOnMount
      />,
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByTestId(`roster-card-${talentId}`)),
    )
    expect(exportSaveJson(state)).toBe(before)
  })
})
