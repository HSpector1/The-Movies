import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import {
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlight,
  newGame,
  productionBoard,
  requiredNegative,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
  studioCalendarBoard,
} from '../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  DraftPackage,
  GameState,
  StudioCalendarView,
} from '../engine/adapter.ts'
import { StudioCalendar, StudioCalendarPreview } from './StudioCalendar.tsx'
import { newFoundedGame } from '../test/founding.ts'
import { App } from '../App.tsx'
import { ProductionBoard } from '../components/ProductionBoard.tsx'
import { CastingRoom } from './CastingRoom.tsx'
import { Dashboard } from './Dashboard.tsx'
import { StudioRoster } from './StudioRoster.tsx'
import { WritersRoom } from './WritersRoom.tsx'

const activeSession = vi.hoisted(() => ({ state: null as GameState | null, saves: 0 }))
vi.mock('../engine/session.ts', () => ({
  clearActiveSession: () => { activeSession.state = null },
  saveActiveSession: (state: GameState) => {
    activeSession.state = state
    activeSession.saves += 1
  },
  loadActiveSession: () => activeSession.state
    ? { ok: true, state: activeSession.state, converted: false }
    : { ok: false, reason: 'none' },
}))

afterEach(() => {
  cleanup()
  activeSession.state = null
  activeSession.saves = 0
})

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

function commissionPayload(state: GameState): CommissionScriptPayload {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]!
  const writer = board.commission.writers.find((candidate) => candidate.available)!
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

function draftingStudio(seed: string): GameState {
  const state = managedStudio(seed)
  const commissioned = commissionScriptAction(state, commissionPayload(state))
  if (!commissioned.ok) throw new Error(commissioned.error)
  return commissioned.next
}

function auditioningStudio(seed: string): GameState {
  let state = advanceWeek(draftingStudio(seed)).next
  const accept = scriptProjectsBoard(state).sections.needsReview[0]!.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )!
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  state = accepted.next
  const project = castingSessionsBoard(state).sections.readyToPlan[0]!
  const ids = project.candidates.lead.map((candidate) => candidate.id)
  const started = startCastingSessionAction(state, {
    projectId: project.projectId,
    slate: {
      lead: [ids[0]!, ids[1]!],
      antagonist: [ids[0]!, ids[1]!],
      support: [ids[0]!, ids[2]!],
    },
  })
  if (!started.ok) throw new Error(started.error)
  return started.next
}

function directPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
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
    writerId: ids('writer')[0]!,
    directorId: ids('director')[0]!,
    craftIds: [ids('craft')[0]!],
    cast: {
      lead: ids('actor')[0]!,
      antagonist: ids('actor')[1]!,
      support: ids('actor')[2]!,
    },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

function productionDecisionStudio(seed: string): GameState {
  const founded = managedStudio(seed)
  const directGreenlightState: GameState = {
    ...founded,
    scriptDevelopment: { mode: 'legacy', projects: [] },
  }
  const greenlit = greenlight(directGreenlightState, directPackage(directGreenlightState))
  if (!greenlit.ok) throw new Error(greenlit.error)
  let state = greenlit.next
  for (let guard = 0; guard < 12; guard++) {
    if (studioCalendarBoard(state).nextDecision?.kind === 'productionOperation') return state
    state = advanceWeek(state).next
  }
  throw new Error('setup: production decision did not become due')
}

function theatricalRunStudio(seed: string): GameState {
  let state = newFoundedGame(seed)
  const greenlit = greenlight(state, directPackage(state))
  if (!greenlit.ok) throw new Error(greenlit.error)
  state = greenlit.next
  for (let guard = 0; guard < 24; guard++) {
    if (state.theatricalRuns.some((run) => run.status === 'active')) return state
    state = advanceWeek(state).next
  }
  throw new Error('setup: theatrical run did not open')
}

const CAPABILITY_COPY: Record<string, string> = {
  'development-casting': 'Development & Casting',
  soundstage: 'Soundstage',
  'set-scenery': 'Scenery Shop',
  post: 'Post Building',
}

const ACTIVITY_COPY: Record<string, string> = {
  development: 'Development',
  preProduction: 'Pre-production',
  rehearsal: 'Rehearsal',
  shooting: 'Shooting',
  postProduction: 'Post-production',
  releaseReady: 'Release Ready',
  drafting: 'Drafting',
  rewriting: 'Rewriting',
  auditioning: 'Auditioning',
}

const OWNER_COPY: Record<string, string> = {
  production: 'production',
  script: 'screenplay',
  casting: 'casting session',
}

function expectExactFacilities(calendar: StudioCalendarView): Set<string> {
  const owners = new Set<string>()
  for (const facility of calendar.facilities) {
    const card = screen.getByTestId(`calendar-facility-${facility.facilityId}`)
    expect(within(card).getByText(facility.facilityName, { selector: 'strong' })).toBeInTheDocument()
    expect(
      within(card).getByText(CAPABILITY_COPY[facility.capability] ?? facility.capability, {
        selector: '.hint',
      }),
    ).toBeInTheDocument()
    expect(within(card).getByText(`${facility.occupied}/${facility.capacity}`, { selector: '.mono' })).toBeInTheDocument()

    for (const slot of facility.slots) {
      const slotCard = screen.getByTestId(`calendar-slot-${facility.facilityId}-${slot.slot}`)
      expect(slotCard).toHaveTextContent(`Slot ${slot.slot + 1}`)
      if (slot.occupant === null) {
        expect(slotCard).toHaveTextContent('Available')
        continue
      }
      owners.add(slot.occupant.owner)
      expect(slotCard).toHaveTextContent(slot.occupant.title)
      expect(slotCard).toHaveTextContent(
        `${ACTIVITY_COPY[slot.occupant.activity] ?? slot.occupant.activity} · ${OWNER_COPY[slot.occupant.owner]}`,
      )
    }
  }
  return owners
}

describe('Studio Calendar V1 — player surface', () => {
  it('renders exact managed slots, committed/conditional semantics, and focuses its heading without mutating state', async () => {
    const state = draftingStudio('calendar-managed')
    const before = exportSaveJson(state)
    const calendar = studioCalendarBoard(state)

    render(<StudioCalendar state={state} onNavigate={() => {}} onBack={() => {}} />)

    const heading = screen.getByRole('heading', { level: 1, name: /Studio Calendar & Capacity Board/i })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByTestId('calendar-utilization')).toHaveTextContent(
      `${calendar.summary.occupiedSlots} of ${calendar.summary.facilityCapacity} slots occupied`,
    )
    expect(expectExactFacilities(calendar)).toContain('script')
    const soundstage7 = calendar.facilities.find((facility) => facility.facilityName === 'Soundstage 7')
    const soundstage12 = calendar.facilities.find((facility) => facility.facilityName === 'Soundstage 12')
    if (!soundstage7 || !soundstage12) throw new Error('setup: distinct soundstages missing')
    expect(screen.getByTestId(`calendar-facility-${soundstage7.facilityId}`)).toHaveTextContent('Soundstage 7')
    expect(screen.getByTestId(`calendar-facility-${soundstage12.facilityId}`)).toHaveTextContent('Soundstage 12')
    expect(screen.getByTestId(`calendar-facility-${soundstage7.facilityId}`)).not.toHaveTextContent('Soundstage 12')
    expect(screen.getByTestId(`calendar-facility-${soundstage12.facilityId}`)).not.toHaveTextContent('Soundstage 7')
    expect(screen.getByText('Committed')).toBeInTheDocument()
    expect(screen.getByText('Conditional')).toBeInTheDocument()
    const firstContract = calendar.staffingHorizon.contracts[0]!
    const firstContractCard = screen.getByTestId(`calendar-contract-${firstContract.talentId}`)
    expect(
      within(firstContractCard).getByText(
        `Renewal opens Week ${firstContract.renewalWindowWeek} · exclusive end Week ${firstContract.endWeekExclusive}`,
      ),
    ).toBeInTheDocument()
    expect(
      within(firstContractCard).getByRole('button', {
        name: `Open ${firstContract.talentName} staffing details in Studio Roster`,
      }),
    ).toBeInTheDocument()
    expect(exportSaveJson(state)).toBe(before)
  })

  it('routes a committed screenplay boundary by durable identity and keeps every same-week event', () => {
    const state = draftingStudio('calendar-commitment-route')
    const calendar = studioCalendarBoard(state)
    const scriptDue = calendar.commitments.find((event) => event.kind === 'scriptDue')
    if (!scriptDue || scriptDue.kind !== 'scriptDue') throw new Error('setup: no script due event')
    const sameWeek = calendar.commitments.filter((event) => event.week === scriptDue.week)
    const navigate = vi.fn()

    render(<StudioCalendar state={state} onNavigate={navigate} onBack={() => {}} />)

    expect(screen.getByTestId('calendar-commitments').children).toHaveLength(calendar.commitments.length)
    for (const event of sameWeek) {
      expect(
        screen.getByTestId(`calendar-event-open-${event.kind}-${event.ownerId}-${event.occurrenceIndex}`),
      ).toBeInTheDocument()
    }
    const routeButton = screen.getByTestId(
      `calendar-event-open-${scriptDue.kind}-${scriptDue.ownerId}-${scriptDue.occurrenceIndex}`,
    )
    expect(routeButton).toHaveAccessibleName(`Open ${scriptDue.title} in Writers Room`)
    fireEvent.click(routeButton)
    expect(navigate).toHaveBeenCalledWith({ kind: 'script', projectId: scriptDue.projectId })
  })

  it('labels legacy mode without inventing the managed facility set', () => {
    const state = newFoundedGame('calendar-legacy')
    const calendar = studioCalendarBoard(state)
    expect(calendar.mode).toBe('legacy')

    render(<StudioCalendar state={state} onNavigate={() => {}} onBack={() => {}} />)

    expect(screen.getByTestId('calendar-legacy')).toHaveTextContent('No managed facilities')
    expect(screen.getByTestId('calendar-no-facilities')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-utilization')).toHaveTextContent('No managed facilities')
  })

  it('shows the compact Dashboard preview facts and opens the full screen', () => {
    const state = draftingStudio('calendar-preview')
    const open = vi.fn()
    render(<StudioCalendarPreview state={state} onOpen={open} />)

    expect(screen.getByTestId('calendar-preview')).toHaveTextContent(`Week ${state.market.tick}`)
    expect(screen.getByTestId('calendar-preview')).toHaveTextContent('Next committed boundary')
    expect(screen.getByTestId('calendar-preview')).toHaveTextContent('Facility utilization')
    expect(screen.getByTestId('calendar-preview')).toHaveTextContent('Busiest staffing expiry')
    fireEvent.click(screen.getByTestId('open-studio-calendar'))
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('opens from Dashboard, then routes the exact screenplay decision and focuses its live owner action', async () => {
    const review = advanceWeek(draftingStudio('calendar-app-focus')).next
    const decision = studioCalendarBoard(review).nextDecision
    if (!decision || decision.kind !== 'scriptReview') throw new Error('setup: no screenplay review')
    activeSession.state = review

    render(<App />)
    fireEvent.click(screen.getByTestId('open-studio-calendar'))
    const calendarHeading = screen.getByRole('heading', { level: 1, name: /Studio Calendar & Capacity Board/i })
    await waitFor(() => expect(document.activeElement).toBe(calendarHeading))
    const decisionButton = screen.getByTestId('calendar-next-decision-open')
    expect(decisionButton).toHaveAccessibleName(`Open screenplay review: ${decision.title} needs screenplay review`)
    fireEvent.click(decisionButton)

    const ownerAction = screen.getByTestId(`script-action-acceptScript-${decision.projectId}`)
    await waitFor(() => expect(document.activeElement).toBe(ownerAction))
  })

  it('routes due casting work to the named live session and focuses its status', async () => {
    const state = auditioningStudio('calendar-casting-focus')
    const event = studioCalendarBoard(state).commitments.find(
      (candidate) => candidate.kind === 'castingDue',
    )
    if (!event || event.kind !== 'castingDue') throw new Error('setup: no casting due event')
    activeSession.state = state

    render(<App />)
    fireEvent.click(screen.getByTestId('open-studio-calendar'))
    const routeButton = screen.getByTestId(
      `calendar-event-open-${event.kind}-${event.ownerId}-${event.occurrenceIndex}`,
    )
    expect(routeButton).toHaveAccessibleName(`Open ${event.title} in Casting Room`)
    fireEvent.click(routeButton)

    const status = screen.getByTestId(`casting-status-${event.projectId}`)
    await waitFor(() => expect(document.activeElement).toBe(status))
  })

  it('renders exact casting occupancy without substituting the owner or facility identity', () => {
    const state = auditioningStudio('calendar-casting-occupancy')
    const calendar = studioCalendarBoard(state)
    render(<StudioCalendar state={state} onNavigate={() => {}} onBack={() => {}} />)

    const owners = expectExactFacilities(calendar)
    expect(owners).toContain('casting')
    const castingSlot = calendar.facilities
      .flatMap((facility) => facility.slots)
      .find((slot) => slot.occupant?.owner === 'casting')
    if (!castingSlot || !castingSlot.occupant) throw new Error('setup: casting has no reservation')
    expect(
      screen.getByTestId(`calendar-slot-${castingSlot.facilityId}-${castingSlot.slot}`),
    ).toHaveTextContent(`${castingSlot.occupant.title}Auditioning · casting session`)
  })

  it('routes a contract boundary to the exact roster card and focuses it', async () => {
    const state = managedStudio('calendar-contract-focus')
    const event = studioCalendarBoard(state).commitments.find(
      (candidate) => candidate.kind === 'contractExpiry',
    )
    if (!event || event.kind !== 'contractExpiry') throw new Error('setup: no contract expiry')
    activeSession.state = state

    render(<App />)
    fireEvent.click(screen.getByTestId('open-studio-calendar'))
    const routeButton = screen.getByTestId(
      `calendar-event-open-${event.kind}-${event.ownerId}-${event.occurrenceIndex}`,
    )
    expect(routeButton).toHaveAccessibleName(
      `Open ${event.talentName} contract expiry in Studio Roster`,
    )
    fireEvent.click(routeButton)

    const card = screen.getByTestId(`roster-card-${event.talentId}`)
    await waitFor(() => expect(document.activeElement).toBe(card))
  })

  it('routes the authoritative production decision to its live command and focuses it', async () => {
    const state = productionDecisionStudio('calendar-production-focus')
    const decision = studioCalendarBoard(state).nextDecision
    if (!decision || decision.kind !== 'productionOperation') {
      throw new Error('setup: no production decision')
    }
    activeSession.state = state

    render(<App />)
    fireEvent.click(screen.getByTestId('open-studio-calendar'))
    const outlook = studioCalendarBoard(state).productionOutlook.find(
      (candidate) => candidate.productionId === decision.productionId,
    )
    if (!outlook) throw new Error('setup: production missing from outlook')
    expect(
      screen.getByRole('button', { name: `View ${outlook.title} on Production Board` }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('calendar-next-decision-open'))

    const command = screen.getAllByTestId(/^production-command-/).find(
      (candidate) => candidate.getAttribute('data-testid')?.endsWith(decision.productionId),
    )
    expect(command).toBeDefined()
    await waitFor(() => expect(document.activeElement).toBe(command))
  })

  it('renders exact production occupancy without substituting its named soundstage', () => {
    const state = productionDecisionStudio('calendar-production-occupancy')
    const calendar = studioCalendarBoard(state)
    render(<StudioCalendar state={state} onNavigate={() => {}} onBack={() => {}} />)

    const owners = expectExactFacilities(calendar)
    expect(owners).toContain('production')
    const productionSlots = calendar.facilities.flatMap((facility) =>
      facility.slots.filter((slot) => slot.occupant?.owner === 'production'),
    )
    expect(productionSlots.length).toBeGreaterThan(0)
    for (const slot of productionSlots) {
      const exactFacility = calendar.facilities.find((facility) => facility.facilityId === slot.facilityId)!
      expect(screen.getByTestId(`calendar-facility-${slot.facilityId}`)).toHaveTextContent(
        exactFacility.facilityName,
      )
    }
  })

  it('routes a locked theatrical receipt to the exact active run and focuses it', async () => {
    const state = theatricalRunStudio('calendar-run-focus')
    const event = studioCalendarBoard(state).commitments.find(
      (candidate) => candidate.kind === 'theatricalReceipt',
    )
    if (!event || event.kind !== 'theatricalReceipt') {
      throw new Error('setup: no theatrical receipt')
    }
    activeSession.state = state

    render(<App />)
    fireEvent.click(screen.getByTestId('open-studio-calendar'))
    const routeButton = screen.getByTestId(
      `calendar-event-open-${event.kind}-${event.ownerId}-${event.occurrenceIndex}`,
    )
    expect(routeButton).toHaveAccessibleName(
      `Open ${event.title} theatrical run for payment ${event.paymentOrdinal}`,
    )
    fireEvent.click(routeButton)

    const run = screen.getByTestId(`run-${event.productionId}`)
    await waitFor(() => expect(document.activeElement).toBe(run))
  })

  it('falls back to destination headings when routed identities disappeared and renders live legality', async () => {
    const state = managedStudio('calendar-disappeared-focus')
    const onChange = vi.fn()
    const noop = () => {}

    const writers = render(
      <WritersRoom
        state={state}
        onChange={onChange}
        onOpenPackage={noop}
        onPlanAuditions={noop}
        onBack={noop}
        focusProjectId="missing-project"
      />,
    )
    const writersHeading = screen.getByTestId('writers-room-heading')
    await waitFor(() => expect(document.activeElement).toBe(writersHeading))
    expect(screen.getByText('No screenplay is waiting for a studio decision.')).toBeInTheDocument()
    writers.unmount()

    const casting = render(
      <CastingRoom
        state={state}
        onChange={onChange}
        onOpenPackage={noop}
        onOpenRoster={noop}
        onBack={noop}
        focusProjectId="missing-project"
      />,
    )
    const castingHeading = screen.getByTestId('casting-room-heading')
    await waitFor(() => expect(document.activeElement).toBe(castingHeading))
    expect(screen.getByText('No audition results are waiting for review.')).toBeInTheDocument()
    casting.unmount()

    const roster = render(
      <StudioRoster
        state={state}
        onChange={onChange}
        onBack={noop}
        focusTalentId="missing-talent"
      />,
    )
    const rosterHeading = screen.getByTestId('roster-heading')
    await waitFor(() => expect(document.activeElement).toBe(rosterHeading))
    expect(screen.getAllByTestId(/^roster-card-/)).toHaveLength(state.contracts.length)
    roster.unmount()

    const production = render(
      <ProductionBoard board={productionBoard(state)} focusProductionId="missing-production" />,
    )
    const productionHeading = screen.getByTestId('production-board-heading')
    await waitFor(() => expect(document.activeElement).toBe(productionHeading))
    expect(screen.getByTestId('no-active')).toHaveTextContent('Nothing in production')
    production.unmount()

    render(
      <Dashboard
        state={state}
        onAssemble={noop}
        onAdvance={noop}
        onSimToEvent={noop}
        onCreateTalent={noop}
        onSaves={noop}
        onOpenAutopsy={noop}
        focusRunId="missing-run"
      />,
    )
    const runsHeading = screen.getByTestId('theatrical-runs-heading')
    await waitFor(() => expect(document.activeElement).toBe(runsHeading))
    expect(screen.getByTestId('no-runs')).toHaveTextContent('No films in theaters')
  })

  it('keeps SaveFileV10 and autosave bytes unchanged through full App calendar navigation', async () => {
    const state = draftingStudio('calendar-byte-neutral-navigation')
    const event = studioCalendarBoard(state).commitments.find(
      (candidate) => candidate.kind === 'scriptDue',
    )
    if (!event || event.kind !== 'scriptDue') throw new Error('setup: no script due event')
    const before = exportSaveJson(state)
    activeSession.state = state

    render(<App />)
    await waitFor(() => expect(activeSession.saves).toBeGreaterThan(0))
    const savesAfterMount = activeSession.saves
    expect(exportSaveJson(activeSession.state!)).toBe(before)

    fireEvent.click(screen.getByTestId('open-studio-calendar'))
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('heading', { level: 1, name: /Studio Calendar & Capacity Board/i }),
      ),
    )
    expect(activeSession.saves).toBe(savesAfterMount)
    expect(exportSaveJson(activeSession.state!)).toBe(before)

    fireEvent.click(
      screen.getByTestId(
        `calendar-event-open-${event.kind}-${event.ownerId}-${event.occurrenceIndex}`,
      ),
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByTestId(`script-status-${event.projectId}`)),
    )
    expect(activeSession.saves).toBe(savesAfterMount)
    expect(exportSaveJson(activeSession.state!)).toBe(before)
  })
})
