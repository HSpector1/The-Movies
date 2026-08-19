// ── C2a-M4 — THE QUEUE IS ON A SCREEN (charter §3.3, owner law 2, G16) ───────
//
// The cap is deleted. What replaced it is a queue, and owner law 2 is a promise
// about a SCREEN: *the player must know WHAT IS WAITING, WHAT IT NEEDS, WHAT
// OCCUPIES IT, and HOW TO RELIEVE THE BOTTLENECK.* A queue nobody can read is
// the "magically forbid" the owner ruled out, wearing a different coat.
//
// This suite proves the four facts are RENDERED, non-empty, for BOTH kinds of
// waiter the charter names — a picture held at a phase gate, and a pre-greenlight
// intent still at a front door — and that the remedy rows are actionable rather
// than decorative. It also holds the tycoon floor: no engine id, no capability
// token, no blocker kind ever reaches the screen.

import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { applyActions } from '../../../src/core/index.ts'
import {
  advanceWeek,
  commissionScriptAction,
  greenlight,
  studioQueueBoard,
  studioQueueHolderPlaces,
} from '../engine/adapter.ts'
import type { DraftPackage, GameState } from '../engine/adapter.ts'
import { StudioQueuePanel } from '../components/StudioQueuePanel.tsx'
import { StudioCalendar } from './StudioCalendar.tsx'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

/** A founded studio with managed facilities. The bare greenlight path (no Writers Room). */
function managed(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
}

/** The same studio with the Writers Room switched on, so commissions run the front door. */
function managedWithScripts(seed: string): GameState {
  return applyActions(managed(seed), [{ kind: 'activateScriptDevelopment' }])
}

function directPackage(state: GameState, lane = 0): DraftPackage {
  const concept = state.concepts[lane] ?? state.concepts[0]!
  const actors = foundedRosterIds(state, 'actor')
  const castStart = lane * 3
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
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

function greenlit(state: GameState, lane = 0): GameState {
  const outcome = greenlight(state, directPackage(state, lane))
  if (!outcome.ok) throw new Error(outcome.error)
  return outcome.next
}

function latestProductionId(state: GameState): string {
  const newest = state.studio.activeProductions[state.studio.activeProductions.length - 1]
  if (newest === undefined) throw new Error('expected a production in flight')
  return newest.id
}

function commission(state: GameState, lane: number): { state: GameState; queued: boolean } {
  const taken = new Set(state.scriptDevelopment.projects.map((project) => project.conceptId))
  const concept = state.concepts.filter((candidate) => !taken.has(candidate.id))[0]
  if (concept === undefined) throw new Error('expected an uncommissioned concept')
  const before = state.productionQueue.length
  const outcome = commissionScriptAction(state, {
    conceptId: concept.id,
    writerId: foundedRosterIds(state, 'writer')[lane]!,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
    },
  })
  if (!outcome.ok) throw new Error(outcome.error)
  return { state: outcome.next, queued: outcome.next.productionQueue.length > before }
}

/**
 * THE THIRD ORDER WAITS. Two screenplays under way hold BOTH of the founding lot's
 * Development & Casting slots; the third commission is not refused — under owner
 * law 1 there is no cap left to refuse it — so it joins the queue. This is the
 * ordinary contention of a small lot, not a forced state.
 */
function twoPicturesAndAQueuedCommission(seed: string): GameState {
  let state = managedWithScripts(seed)
  for (const lane of [0, 1]) {
    const step = commission(state, lane)
    if (step.queued) throw new Error(`commission ${String(lane)} queued before the lot was full`)
    state = step.state
  }
  const third = commission(state, 2)
  if (!third.queued) throw new Error('the third commission did not queue — the lot had room')
  return third.state
}

/** A picture with a free stage and nothing standing on it — the set-unavailable arm. */
function pictureWaitingForASet(seed: string): { state: GameState; productionId: string } {
  let state = managed(seed)
  const spare = state.sets.find((set) => set.mountedOn === 'facility-soundstage-12')
  if (spare === undefined) throw new Error('expected the endowed spare set')
  state = applyActions(state, [{ kind: 'strikeSet', setId: spare.id }])
  state = greenlit(state, 0)
  state = greenlit(state, 1)
  const second = latestProductionId(state)
  for (let week = 0; week < 40; week++) {
    const workflow = state.operations.workflows.find((w) => w.productionId === second)
    if (workflow?.blocker?.kind === 'set-unavailable') break
    state = advanceWeek(state).next
  }
  return { state, productionId: second }
}

function renderQueue(state: GameState) {
  const view = studioQueueBoard(state)
  const result = render(
    <StudioQueuePanel view={view} places={studioQueueHolderPlaces(state)} />,
  )
  return { view, result }
}

describe('C2a-M4 — the queue panel answers all four of owner law 2’s questions', () => {
  it('renders every fact non-empty for a pre-greenlight intent still at the front door', () => {
    const state = twoPicturesAndAQueuedCommission('c2a-m4-queue-intent')
    const { view } = renderQueue(state)

    const intent = view.waiters.find((waiter) => waiter.kind === 'intent')
    expect(intent, 'a commission with both slots taken must WAIT, not be refused').toBeDefined()

    const row = screen.getByTestId(`queue-waiter-${intent!.id}`)
    // WHAT IS WAITING
    expect(within(row).getByTestId(`queue-waiter-title-${intent!.id}`).textContent).not.toBe('')
    // WHAT IT NEEDS
    expect(within(row).getByTestId(`queue-waiter-needs-${intent!.id}`).textContent).toContain(
      'Development & Casting',
    )
    // WHO OCCUPIES IT — and WHEN IT FREES, in the same sentence
    const holders = within(row).getByTestId(`queue-waiter-holders-${intent!.id}`)
    expect(holders.textContent).not.toBe('')
    expect(holders.textContent).toMatch(/frees in \d+ week|frees it this week|is /)
    // WHAT RELIEVES IT
    const remedies = within(row).getByTestId(`queue-remedies-${intent!.id}`)
    expect(remedies.textContent).toContain('What relieves it')
    expect(within(remedies).getAllByRole('listitem').length).toBeGreaterThan(0)
  })

  it('names the holder and the room it is standing in', () => {
    const state = twoPicturesAndAQueuedCommission('c2a-m4-queue-holder')
    const { view } = renderQueue(state)
    const intent = view.waiters.find((waiter) => waiter.kind === 'intent')!
    const holders = screen.getByTestId(`queue-waiter-holders-${intent.id}`)

    // The engine hands back a resource KEY; the panel says a place. Every holder
    // the engine names is a picture in a room the studio built, so the room's own
    // name must appear beside the picture's — "on Soundstage 7", not "on
    // facility-soundstage-07:0".
    const roomNames = [...studioQueueHolderPlaces(state).values()]
    expect(roomNames.length).toBeGreaterThan(0)
    const named = roomNames.some((room) => holders.textContent?.includes(room))
    expect(named, 'the holder must be placed in a room the player can find').toBe(true)
  })

  it('renders the four facts for a PICTURE held for want of scenery', () => {
    const { state, productionId } = pictureWaitingForASet('c2a-m4-queue-set')
    const { view } = renderQueue(state)

    const waiter = view.waiters.find((candidate) => candidate.id === productionId)
    expect(waiter, 'a picture with a stage and no set is a waiter').toBeDefined()

    const row = screen.getByTestId(`queue-waiter-${productionId}`)
    expect(within(row).getByTestId(`queue-waiter-needs-${productionId}`).textContent).toContain(
      'set',
    )
    expect(
      within(row).getByTestId(`queue-waiter-headline-${productionId}`).textContent,
    ).not.toBe('')
    const remedies = within(row).getByTestId(`queue-remedies-${productionId}`)
    // Scenery is the remedy that always exists for this hold: build some.
    expect(within(remedies).getAllByRole('listitem').length).toBeGreaterThan(0)
    expect(remedies.textContent).toContain('Commission')
  })

  it('states a price and a duration on every build remedy, and a WEEK on every wait', () => {
    const state = twoPicturesAndAQueuedCommission('c2a-m4-queue-prices')
    const { view } = renderQueue(state)
    const intent = view.waiters.find((waiter) => waiter.kind === 'intent')!
    const remedies = screen.getByTestId(`queue-remedies-${intent.id}`)

    const build = intent.remedies.find((remedy) => remedy.kind === 'build-blueprint')
    expect(build, 'more room is always a remedy for a room shortage').toBeDefined()
    const buildRow = within(remedies).getByTestId(
      `queue-remedy-${intent.id}-build-facility-${(build as { blueprintId: string }).blueprintId}`,
    )
    expect(buildRow.textContent).toMatch(/\$/)
    expect(buildRow.textContent).toMatch(/ready in \d+ week/)

    const wait = intent.remedies.find(
      (remedy) => remedy.kind === 'wait-for-holder' && remedy.freesInWeeks !== null,
    )
    expect(wait, 'a holder with a countdown is a remedy: wait for it').toBeDefined()
    const waitRow = within(remedies).getByTestId(
      `queue-remedy-${intent.id}-wait-${(wait as { ownerId: string }).ownerId}`,
    )
    // A player plans against a DATE. The delta alone is not a plan.
    expect(waitRow.textContent).toMatch(/Week \d+/)
  })

  it('routes a build remedy to a surface instead of stating it and stopping', () => {
    const state = twoPicturesAndAQueuedCommission('c2a-m4-queue-route')
    const view = studioQueueBoard(state)
    const onBuild = vi.fn()
    render(
      <StudioQueuePanel
        view={view}
        places={studioQueueHolderPlaces(state)}
        handlers={{ onBuild }}
      />,
    )
    const intent = view.waiters.find((waiter) => waiter.kind === 'intent')!
    const build = intent.remedies.find((remedy) => remedy.kind === 'build-blueprint') as {
      blueprintId: string
    }
    screen
      .getByTestId(`queue-remedy-act-${intent.id}-build-facility-${build.blueprintId}`)
      .click()
    expect(onBuild).toHaveBeenCalledTimes(1)
    expect(onBuild.mock.calls[0]![0].blueprintId).toBe(build.blueprintId)
  })

  it('never puts an engine id, a capability token or a blocker kind on the screen', () => {
    const { state } = pictureWaitingForASet('c2a-m4-queue-voice')
    renderQueue(state)
    const copy = screen.getByTestId('studio-queue').textContent ?? ''
    expect(copy).not.toContain('facility-')
    expect(copy).not.toContain('set-unavailable')
    expect(copy).not.toContain('facility-capacity')
    expect(copy).not.toContain('development-casting')
    expect(copy).not.toContain('prod-')
    expect(copy).not.toContain('undefined')
    expect(copy).not.toContain('NaN')
  })

  it('empties honestly when nothing is waiting', () => {
    const state = managed('c2a-m4-queue-clear')
    renderQueue(state)
    expect(screen.getByTestId('studio-queue-count').textContent).toBe('Clear')
    expect(screen.getByTestId('studio-queue-empty').textContent).toContain('No picture')
    expect(screen.queryByTestId('studio-queue-waiters')).toBeNull()
  })
})

describe('C2a-M4 — the queue panel is on the Studio Calendar', () => {
  it('renders beside the occupancy board it is waiting on', () => {
    const state = twoPicturesAndAQueuedCommission('c2a-m4-queue-calendar')
    render(<StudioCalendar state={state} onNavigate={() => {}} onBack={() => {}} />)
    expect(screen.getByTestId('studio-queue')).toBeTruthy()
    expect(screen.getByTestId('studio-queue-waiters')).toBeTruthy()
  })

  it('routes a room remedy into the build catalog and scenery to the Scenery Shop', () => {
    const state = twoPicturesAndAQueuedCommission('c2a-m4-queue-calendar-route')
    const onNavigate = vi.fn()
    render(<StudioCalendar state={state} onNavigate={onNavigate} onBack={() => {}} />)
    const view = studioQueueBoard(state)
    const intent = view.waiters.find((waiter) => waiter.kind === 'intent')!
    const build = intent.remedies.find((remedy) => remedy.kind === 'build-blueprint') as {
      blueprintId: string
    }
    screen
      .getByTestId(`queue-remedy-act-${intent.id}-build-facility-${build.blueprintId}`)
      .click()
    expect(onNavigate).toHaveBeenCalledWith({
      kind: 'buildCatalog',
      blueprintId: build.blueprintId,
    })
  })
})
