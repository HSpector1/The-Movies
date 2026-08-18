// ── The browser never speaks again — one test per site (PF1-M3) ──────────────
//
// Nine native dialogs used to answer for this studio: eight bare `alert()` calls and one
// `window.confirm`. They are replaced IN PLACE, and each site is proven here on its own —
// no bulk substitution, because these sites are not interchangeable. Three of them sat on
// paths where the alert's BLOCKING semantics mattered (the dispatch either had already
// happened or deliberately had not), so those tests assert the state and the ordering, not
// merely that a sentence appeared.
//
// Some of the refusal branches are defensive by design — they exist to survive a hostile
// or incoherent boundary, and the product's own controls are disabled in front of them.
// Those are reached the only honest way: by replacing the exact boundary function with one
// that fails, and leaving everything else real.

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLayoutEffect, type ComponentProps } from 'react'
import type StudioLotScreenType from '../lot/StudioLotScreen.tsx'
import { App } from '../App.tsx'
import { advanceWeek, exportSaveJson, greenlight, requiredNegative } from '../engine/adapter.ts'
import type { CreativeRole, DraftPackage, GameState } from '../engine/adapter.ts'
import { ACTIVE_SESSION_KEY, hasActiveSession, saveActiveSession } from '../engine/session.ts'
import { setStudioLotOverviewOverride } from '../flags.ts'
import { foundedRosterIds, newFoundedGame } from '../test/founding.ts'

const probe = vi.hoisted(() => ({
  failPublicity: null as string | null,
  failProductionCommand: null as string | null,
  throwStudioDecision: false,
  throwAdvanceToNextEvent: false,
  blankNextEvent: false,
  noNewspaper: false,
  noFilmRecord: false,
  lotSimResults: [] as boolean[],
  autosaveStates: [] as string[],
}))

vi.mock('../engine/adapter.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/adapter.ts')>()
  return {
    ...actual,
    runPublicity(state: GameState, tier: Parameters<typeof actual.runPublicity>[1]) {
      return probe.failPublicity === null
        ? actual.runPublicity(state, tier)
        : { ok: false as const, error: probe.failPublicity }
    },
    runProductionCommand(
      state: GameState,
      command: Parameters<typeof actual.runProductionCommand>[1],
    ) {
      return probe.failProductionCommand === null
        ? actual.runProductionCommand(state, command)
        : { ok: false as const, error: probe.failProductionCommand }
    },
    studioDecision(state: GameState) {
      if (probe.throwStudioDecision) throw new Error('hostile decision boundary')
      return actual.studioDecision(state)
    },
    advanceToNextEvent(state: GameState) {
      if (probe.throwAdvanceToNextEvent) throw new Error('hostile adapter boundary')
      return actual.advanceToNextEvent(state)
    },
    releaseNewspaper(state: GameState, film: Parameters<typeof actual.releaseNewspaper>[1]) {
      return probe.noNewspaper ? null : actual.releaseNewspaper(state, film)
    },
    filmRecordView(state: GameState, film: Parameters<typeof actual.filmRecordView>[1]) {
      return probe.noFilmRecord ? null : actual.filmRecordView(state, film)
    },
  }
})

// The "exact event details were unavailable" branch is defensive: the real selectors always
// produce one of the three presentations. Withholding all three is the only way to reach it.
vi.mock('../lot/snapshot/nextEvent.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lot/snapshot/nextEvent.ts')>()
  return {
    ...actual,
    acceptedLotNextEventReceipt: (...args: Parameters<typeof actual.acceptedLotNextEventReceipt>) =>
      probe.blankNextEvent ? null : actual.acceptedLotNextEventReceipt(...args),
    acceptedLotNextEventGuardNeutral: (
      ...args: Parameters<typeof actual.acceptedLotNextEventGuardNeutral>
    ) => (probe.blankNextEvent ? null : actual.acceptedLotNextEventGuardNeutral(...args)),
    lotNextEventNeutralFeedback: (
      ...args: Parameters<typeof actual.lotNextEventNeutralFeedback>
    ) => (probe.blankNextEvent ? null : actual.lotNextEventNeutralFeedback(...args)),
  }
})

// Autosave is real, and observed: three of these sites need "did the studio get written
// down, and in what order" answered, not assumed.
vi.mock('../engine/session.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/session.ts')>()
  return {
    ...actual,
    saveActiveSession(state: GameState) {
      const ok = actual.saveActiveSession(state)
      probe.autosaveStates.push(exportSaveJson(state))
      return ok
    },
  }
})

type MockLotProps = ComponentProps<typeof StudioLotScreenType>

// Phaser stays out of an App-contract test. The probe emits exactly the callbacks the real
// topbar emits, and republishes the props App computed so suspension is observable.
vi.mock('../lot/StudioLotScreen.tsx', () => ({
  default: (props: MockLotProps) => {
    useLayoutEffect(() => props.onPresentationMount?.(), [props.onPresentationMount])
    return (
      <main
        data-testid="lot-probe"
        data-week={props.state.market.tick}
        data-suspended={props.worldInputSuspended ? 'true' : 'false'}
      >
        <button
          type="button"
          data-testid="lot-sim-probe"
          onClick={() => {
            probe.lotSimResults.push(props.onSimToNextEvent?.(props.state) ?? false)
          }}
        >
          Sim to next event
        </button>
        <button
          type="button"
          data-testid="lot-settings-probe"
          onClick={() => props.onOpenSettings?.()}
        >
          Settings
        </button>
        <button
          type="button"
          data-testid="lot-saves-probe"
          onClick={() => props.onNavigate({ kind: 'saves' })}
        >
          Saves
        </button>
      </main>
    )
  },
}))

// The Dashboard's own enablement rules are tested elsewhere. Here the actual Dashboard
// renders, plus probes that call the EXACT props App handed it — so App's refusal handling
// is what is under test, not whether the engine happened to offer a tier this week.
vi.mock('../screens/Dashboard.tsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../screens/Dashboard.tsx')>()
  return {
    ...actual,
    Dashboard: (props: Parameters<typeof actual.Dashboard>[0]) => (
      <>
        <actual.Dashboard {...props} canOpenAutopsy={() => true} />
        <button
          type="button"
          data-testid="publicity-probe"
          onClick={() => props.onPublicize?.('whisper')}
        >
          Run publicity
        </button>
        <button
          type="button"
          data-testid="production-command-probe"
          onClick={() =>
            props.onProductionCommand?.({
              kind: 'scheduleShootingTake',
              productionId: 'prod-unknown',
              label: 'Schedule a take',
            })
          }
        >
          Production command
        </button>
      </>
    ),
  }
})

function pkg(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const id = (r: CreativeRole, i: number) => foundedRosterIds(state, r)[i]!
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: id('writer', 0),
    directorId: id('director', 0),
    craftIds: [id('craft', 0)],
    cast: { lead: id('actor', 0), antagonist: id('actor', 1), support: id('actor', 2) },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

function releasedStudio(seed: string): GameState {
  const g = greenlight(newFoundedGame(seed), pkg(newFoundedGame(seed)))
  if (!g.ok) throw new Error(g.error)
  let s = g.next
  for (let guard = 0; guard < 60 && s.studio.releasedFilms.length === 0; guard++) {
    s = advanceWeek(s).next
  }
  if (s.studio.releasedFilms.length === 0) throw new Error('no release')
  return s
}

beforeEach(() => {
  probe.failPublicity = null
  probe.failProductionCommand = null
  probe.throwStudioDecision = false
  probe.throwAdvanceToNextEvent = false
  probe.blankNextEvent = false
  probe.noNewspaper = false
  probe.noFilmRecord = false
  probe.lotSimResults = []
  probe.autosaveStates = []
  localStorage.clear()
  setStudioLotOverviewOverride(false)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  setStudioLotOverviewOverride(false)
})

async function mountLot(state: GameState): Promise<void> {
  setStudioLotOverviewOverride(true)
  saveActiveSession(state)
  render(<App />)
  await screen.findByTestId('lot-probe')
  // The mount's own autosave is not part of what these sites are being asked about.
  probe.autosaveStates = []
}

describe('PF1-M3 — no site speaks through the browser (site by site)', () => {
  it('site 1/9 — a refused publicity campaign is said by the studio, dismissibly', () => {
    probe.failPublicity = 'The studio will not buy the same campaign twice in one week.'
    saveActiveSession(newFoundedGame('notice-publicity'))
    render(<App />)

    expect(screen.queryByTestId('app-notice')).toBeNull()
    fireEvent.click(screen.getByTestId('publicity-probe'))

    const notice = screen.getByTestId('app-notice')
    expect(notice).toHaveAttribute('role', 'alert')
    expect(notice).toHaveTextContent('The studio will not buy the same campaign twice in one week.')
    fireEvent.click(screen.getByTestId('app-notice-dismiss'))
    expect(screen.queryByTestId('app-notice')).toBeNull()
  })

  it('site 2/9 — a refused production command surfaces the engine’s exact reason', () => {
    probe.failProductionCommand = 'That soundstage is already carrying a picture.'
    saveActiveSession(newFoundedGame('notice-production-command'))
    render(<App />)

    fireEvent.click(screen.getByTestId('production-command-probe'))
    expect(screen.getByTestId('app-notice')).toHaveTextContent(
      'That soundstage is already carrying a picture.',
    )
  })

  it('site 3/9 — a decision check that throws refuses WITHOUT dispatching (blocking-site order)', async () => {
    // The alert here was BLOCKING and the early return came after it. Nothing may be
    // dispatched and nothing may be autosaved: the studio must be exactly where it was.
    const state = newFoundedGame('notice-decision-throw')
    await mountLot(state)
    const weekBefore = screen.getByTestId('lot-probe').getAttribute('data-week')
    const bytesBefore = localStorage.getItem(ACTIVE_SESSION_KEY)

    probe.throwStudioDecision = true
    fireEvent.click(screen.getByTestId('lot-sim-probe'))

    expect(screen.getByTestId('app-notice')).toHaveTextContent(
      'The studio could not verify whether a decision is already waiting.',
    )
    expect(probe.lotSimResults).toEqual([false]) // the lot was told the run did not happen
    expect(probe.autosaveStates).toHaveLength(0) // nothing was written down
    expect(screen.getByTestId('lot-probe').getAttribute('data-week')).toBe(weekBefore)
    expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(bytesBefore)
  })

  it('site 4/9 — an adapter that throws refuses WITHOUT dispatching, and frees the lot', async () => {
    const state = newFoundedGame('notice-advance-throw')
    await mountLot(state)
    const bytesBefore = localStorage.getItem(ACTIVE_SESSION_KEY)

    probe.throwAdvanceToNextEvent = true
    fireEvent.click(screen.getByTestId('lot-sim-probe'))

    expect(screen.getByTestId('app-notice')).toHaveTextContent(
      'The studio could not advance to the next event. The current lot is unchanged.',
    )
    expect(probe.lotSimResults).toEqual([false])
    expect(probe.autosaveStates).toHaveLength(0)
    expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(bytesBefore)

    // The activation claim was released with the refusal, not with its acknowledgement:
    // a second attempt runs for real the moment the boundary is healthy again.
    probe.throwAdvanceToNextEvent = false
    fireEvent.click(screen.getByTestId('lot-sim-probe'))
    expect(probe.lotSimResults[1]).toBe(true)
    expect(probe.autosaveStates.length).toBeGreaterThan(0)
  })

  it('site 5/9 — a blank event presentation says so AFTER the week has been committed', async () => {
    // This alert blocked AFTER the dispatch. The successor is authoritative and already
    // autosaved; the notice is an admission about presentation, never a rollback.
    const state = newFoundedGame('notice-blank-next-event')
    await mountLot(state)
    const weekBefore = Number(screen.getByTestId('lot-probe').getAttribute('data-week'))

    probe.blankNextEvent = true
    fireEvent.click(screen.getByTestId('lot-sim-probe'))

    expect(screen.getByTestId('app-notice')).toHaveTextContent(
      'The studio advanced, but exact event details were unavailable. Review the current lot.',
    )
    expect(probe.lotSimResults).toEqual([true])
    // Order: the state was replaced and written down, and only then was the notice shown.
    expect(probe.autosaveStates.length).toBeGreaterThan(0)
    expect(Number(screen.getByTestId('lot-probe').getAttribute('data-week'))).toBeGreaterThan(
      weekBefore,
    )
  })

  it('site 6/9 — a film with no archived front page says so', () => {
    const state = releasedStudio('notice-no-clipping')
    const film = state.studio.releasedFilms[0]!
    probe.noNewspaper = true
    saveActiveSession(state)
    render(<App />)

    fireEvent.click(screen.getByTestId(`clipping-${film.productionId}`))
    expect(screen.getByTestId('app-notice')).toHaveTextContent('This film has no archived front page')
    expect(screen.queryByTestId('newspaper')).toBeNull()
  })

  it('site 7/9 — a film with no frozen record says so instead of opening a Chronicle', () => {
    const state = releasedStudio('notice-no-chronicle')
    const film = state.studio.releasedFilms[0]!
    probe.noFilmRecord = true
    saveActiveSession(state)
    render(<App />)

    fireEvent.click(screen.getByTestId(`chronicle-${film.productionId}`))
    expect(screen.getByTestId('app-notice')).toHaveTextContent(
      'This older film predates the frozen participant record required for a Film Chronicle.',
    )
    expect(screen.queryByTestId('film-record')).toBeNull()
  })

  it('site 8/9 — an autopsy with no retained snapshot explains what it needs', () => {
    // Restored films have no session snapshot, so the real control is disabled in front of
    // this branch. The probe re-enables it to prove what the branch itself now does.
    const state = releasedStudio('notice-no-autopsy')
    const film = state.studio.releasedFilms[0]!
    saveActiveSession(state)
    render(<App />)

    fireEvent.click(screen.getByTestId(`autopsy-${film.productionId}`))
    expect(screen.getByTestId('app-notice')).toHaveTextContent(
      'The full autopsy needs the studio state from just before this film released.',
    )
  })

  it('site 9/9 — the destructive verb is answered in the product, with two named buttons', async () => {
    saveActiveSession(newFoundedGame('notice-confirm'))
    render(<App />)
    fireEvent.click(screen.getByTestId('open-saves'))
    fireEvent.click(screen.getByTestId('restart-game'))

    const dialog = screen.getByTestId('confirm-dialog')
    expect(dialog).toHaveAttribute('role', 'dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByTestId('confirm-dialog-confirm')).toHaveTextContent('Start a new studio')
    expect(screen.getByTestId('confirm-dialog-cancel')).toHaveTextContent('Keep this studio')
    // Cancel is the safe answer, so cancel is where focus lands.
    await waitFor(() => expect(screen.getByTestId('confirm-dialog-cancel')).toHaveFocus())

    fireEvent.keyDown(dialog, { key: 'Escape' }) // Escape means cancel, never "yes"
    expect(screen.queryByTestId('confirm-dialog')).toBeNull()
    expect(hasActiveSession()).toBe(true)

    fireEvent.click(screen.getByTestId('restart-game'))
    fireEvent.click(screen.getByTestId('confirm-dialog-confirm'))
    expect(screen.getByTestId('new-game')).toBeInTheDocument()
    expect(hasActiveSession()).toBe(false)
  })
})

describe('PF1-M3 — a notice is news, and news expires', () => {
  it('a refusal survives its own action and expires on the next one', async () => {
    probe.failPublicity = 'The studio will not buy the same campaign twice in one week.'
    saveActiveSession(newFoundedGame('notice-epoch'))
    render(<App />)

    fireEvent.click(screen.getByTestId('publicity-probe'))
    expect(screen.getByTestId('app-notice')).toBeInTheDocument()

    // Advancing a week is an authoritative state replacement — the next thing the player did.
    fireEvent.click(screen.getByTestId('advance-week'))
    await waitFor(() => expect(screen.queryByTestId('app-notice')).toBeNull())
  })
})
