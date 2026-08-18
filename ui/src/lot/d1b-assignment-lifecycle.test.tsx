// ── D1-B: the stage-assignment memory has a LIFETIME, and it ends with the game ──
//
// stageAssignment.test.ts proves the resolver. d1b-soundstage-wiring.test.tsx proves the lot
// screen uses it in both flag positions. This file proves the third thing, which is the one
// that was wrong: the memory must outlive the lot SCREEN but must NOT outlive the loaded
// GAME.
//
// Why it can go wrong at all: core allocates production ids as `prod-<tick>` (actions.ts),
// unique within a game and colliding freely across games; and the app replaces GameState in
// place — "Start a new studio" and loading a save never reload the page. So a slot held by a
// departed studio's film could be inherited by an unrelated new studio's film greenlit in the
// same week, and that studio's first picture would open on Stage B with Stage A dark.
//
// Every case below drives the REAL boundary in App.tsx — the start screen's New studio and
// the Saves import — not a test-only reset hook. Cases B and C fail on 9c4d060.

import { render, fireEvent, screen, waitFor, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions, beginFounding, generateWorld, tick } from '../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../../../src/core/index.ts'
import { exportSaveJson, studioLotSnapshot } from '../engine/adapter.ts'
import type { StudioLotSnapshot } from './snapshot/StudioLotSnapshot.ts'
import { lotStageAssignment, resetLotStageAssignment } from './snapshot/stageAssignment.ts'
import {
  getLotSelectedBuilding,
  resetLotSelectedBuilding,
  setLotSelectedBuilding,
} from './snapshot/selectedBuildingSession.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import { App } from '../App.tsx'
import { ACTIVE_SESSION_KEY } from '../engine/session.ts'
import { setStudioLotOverviewOverride } from '../flags.ts'

const spy = vi.hoisted(() => {
  const instances: Array<{ snapshots: StudioLotSnapshot[] }> = []
  class FakeInstance {
    snapshots: StudioLotSnapshot[] = []
    constructor(opts: { snapshot: StudioLotSnapshot; onReady?: () => void }) {
      this.snapshots = [opts.snapshot]
      instances.push(this)
      queueMicrotask(() => opts.onReady?.())
    }
    setSnapshot(s: StudioLotSnapshot) { this.snapshots.push(s) }
    select() {}
    clearSelection() {}
    pause() {}
    resume() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() {}
    destroy() {}
  }
  return { instances, FakeInstance }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: spy.FakeInstance }))

beforeEach(() => {
  spy.instances.length = 0
  localStorage.clear()
  setStudioLotOverviewOverride(false)
  // Each case states its own starting memory explicitly; nothing leaks between them.
  resetLotStageAssignment()
  resetLotSelectedBuilding()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ── engine fixtures (the same public surface the other lot tests use) ─────────
function foundStudioRich(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [...byRole('actor', 6), ...byRole('director', 2), ...byRole('writer', 2), ...byRole('craft', 2)]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}
function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts
    .map((c) => s.talent.find((t) => t.id === c.talentId)!)
    .filter((t) => t.role === role)
    .map((t) => t.id)
}
function greenlightFilm(s: GameState, conceptIndex: number, slot = 0): GameState {
  const concept = s.concepts[conceptIndex]!
  const actors = rosterIds(s, 'actor')
  const a = slot * 3
  const cast = { lead: actors[a]!, antagonist: actors[a + 1]!, support: actors[a + 2]! } as Record<CastSlot, string>
  return applyActions(s, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: rosterIds(s, 'writer')[slot]!,
        directorId: rosterIds(s, 'director')[slot]!,
        cast,
        craftIds: [rosterIds(s, 'craft')[slot]!],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}

/**
 * GAME 1. Film A greenlit, film B greenlit two weeks later, then ticked until A has released
 * and B is shooting alone — the array compaction that used to migrate B onto Stage A.
 * Returns every GameState along the way plus the survivor's production id.
 */
function gameOne(seed: string): { states: GameState[]; survivorId: string } {
  let s = greenlightFilm(foundStudioRich(seed), 0, 0)
  s = tick(s)
  s = tick(s)
  s = greenlightFilm(s, 1, 1)
  const states: GameState[] = [s]
  const survivorId = studioLotSnapshot(s).activeProductions.find((p) => p.stageId === 'stage-b')!.id
  for (let i = 0; i < 20; i++) {
    s = tick(s)
    states.push(s)
    const live = studioLotSnapshot(s).activeProductions
    if (live.length === 1 && live[0]!.id === survivorId) break
  }
  return { states, survivorId }
}

/**
 * GAME 2 — an unrelated studio, different seed, whose FIRST EVER film is greenlit on the same
 * week game 1's survivor was. Ids are `prod-<tick>`, so the id collides. The adapter puts a
 * lone production on Stage A; only stale memory could put it anywhere else.
 */
function gameTwoCollidingWith(survivorId: string, seed: string): GameState {
  let s = foundStudioRich(seed)
  for (let i = 0; i < 2; i++) s = tick(s)
  s = greenlightFilm(s, 0, 0)
  const snap = studioLotSnapshot(s)
  expect(snap.activeProductions).toHaveLength(1)
  // The collision is the whole point of the fixture — assert it rather than assume it, so a
  // future change to id allocation fails this test loudly instead of passing vacuously.
  expect(snap.activeProductions[0]!.id).toBe(survivorId)
  expect(snap.activeProductions[0]!.stageId).toBe('stage-a') // the adapter's own arrangement
  return s
}

const noop = () => {}

/** Mount the lot screen on a state, let it settle, and return the mocked view. */
async function openLot(state: GameState) {
  const utils = render(
    <StudioLotScreen state={state} onNavigate={noop} onExit={noop} onAdvance={noop} />,
  )
  await waitFor(() => expect(spy.instances[spy.instances.length - 1]).toBeDefined())
  await waitFor(() => expect(utils.queryByText('Preparing the lot…')).toBeNull())
  return { utils, view: spy.instances[spy.instances.length - 1]! }
}

/** The stage a production is shown on, as the Phaser view was last told. */
const shownOn = (view: { snapshots: StudioLotSnapshot[] }, id: string) =>
  view.snapshots[view.snapshots.length - 1]!.activeProductions.find((p) => p.id === id)?.stageId

/** Drive game 1 to "survivor alone on Stage B", leaving the real memory primed. */
async function primeFromGameOne(states: GameState[], survivorId: string) {
  const { utils, view } = await openLot(states[0]!)
  for (const s of states.slice(1)) {
    utils.rerender(
      <StudioLotScreen state={s} onNavigate={noop} onExit={noop} onAdvance={noop} />,
    )
  }
  expect(shownOn(view, survivorId)).toBe('stage-b')
  expect(lotStageAssignment.slotFor(survivorId)).toBe('stage-b')
  return utils
}

// ── CASE A — SAME GAME: leaving and re-entering the lot must NOT forget ───────
describe('CASE A — the memory outlives the lot screen within one game', () => {
  it('a survivor keeps Stage B across a full unmount and remount of the lot', async () => {
    const { states, survivorId } = gameOne('lifecycle-a')
    const utils = await primeFromGameOne(states, survivorId)

    // The player leaves the lot for the dashboard: the screen really unmounts.
    utils.unmount()

    // ...ticks a week off-lot, then comes back. Without persistent memory the survivor would
    // snap onto Stage A here, because the adapter now reports it at array index 0.
    const alone = states[states.length - 1]!
    expect(studioLotSnapshot(alone).activeProductions[0]!.stageId).toBe('stage-a') // raw truth
    const { utils: back, view } = await openLot(alone)

    expect(shownOn(view, survivorId)).toBe('stage-b')
    expect(back.getByTestId('lot-nav-stage-b').getAttribute('data-attention')).toBe('active')
    expect(back.getByTestId('lot-nav-stage-a').getAttribute('data-attention')).toBe('empty')
  })
})

// ── CASE B — NEW GAME: the real "Start a new studio" → "New studio" boundary ──
describe('CASE B — a new studio does not inherit the previous studio’s stages', () => {
  it('clears the memory at the real new-game boundary, colliding id and all', async () => {
    const { states, survivorId } = gameOne('lifecycle-b1')
    const g2 = gameTwoCollidingWith(survivorId, 'lifecycle-b2')
    const utils = await primeFromGameOne(states, survivorId)
    setLotSelectedBuilding('theater')
    utils.unmount()

    // Boot the app into game 1 and take the route a player actually takes: Saves →
    // "Start a new studio" (confirmed) → the start screen → "New studio".
    // PF1-M3 re-pin (Owner-approved, charter §5-M3 "the browser never speaks again"): the
    // destructive confirmation is the product's own dialog now, so the route a player takes
    // is a real button rather than a stubbed browser global. Same boundary, same wipe.
    localStorage.setItem(ACTIVE_SESSION_KEY, exportSaveJson(states[states.length - 1]!))
    render(<App />)
    fireEvent.click(screen.getByTestId('open-saves'))
    fireEvent.click(screen.getByTestId('restart-game'))
    fireEvent.click(screen.getByTestId('confirm-dialog-confirm'))
    fireEvent.change(screen.getByTestId('seed-input'), { target: { value: 'lifecycle-b2' } })
    fireEvent.click(screen.getByTestId('new-game'))

    expect(lotStageAssignment.slotFor(survivorId)).toBeUndefined()
    expect(getLotSelectedBuilding()).toBeNull()
    cleanup()

    // The new studio eventually greenlights a film with the SAME id. It must start fresh.
    const { utils: fresh, view } = await openLot(g2)
    expect(shownOn(view, survivorId)).toBe('stage-a')
    expect(fresh.getByTestId('lot-nav-stage-a').getAttribute('data-attention')).toBe('active')
    expect(fresh.getByTestId('lot-nav-stage-b').getAttribute('data-attention')).toBe('empty')
  })

  it('keeps both presentation memories when New Studio is declined', async () => {
    const { states, survivorId } = gameOne('lifecycle-b-decline')
    const utils = await primeFromGameOne(states, survivorId)
    setLotSelectedBuilding('theater')
    utils.unmount()

    vi.spyOn(window, 'confirm').mockReturnValue(false)
    localStorage.setItem(ACTIVE_SESSION_KEY, exportSaveJson(states[states.length - 1]!))
    render(<App />)
    fireEvent.click(screen.getByTestId('open-saves'))
    fireEvent.click(screen.getByTestId('restart-game'))

    expect(screen.getByTestId('saves-import')).toBeInTheDocument()
    expect(lotStageAssignment.slotFor(survivorId)).toBe('stage-b')
    expect(getLotSelectedBuilding()).toBe('theater')
  })
})

// ── CASE C — LOAD SAVE: the real Saves import boundary ───────────────────────
describe('CASE C — a loaded save does not inherit the previous studio’s stages', () => {
  it('clears the memory when another save is successfully loaded', async () => {
    const { states, survivorId } = gameOne('lifecycle-c1')
    const g2 = gameTwoCollidingWith(survivorId, 'lifecycle-c2')
    const utils = await primeFromGameOne(states, survivorId)
    setLotSelectedBuilding('theater')
    utils.unmount()

    // Boot into game 1, then import game 2 through the real Saves control.
    localStorage.setItem(ACTIVE_SESSION_KEY, exportSaveJson(states[states.length - 1]!))
    render(<App />)
    fireEvent.click(screen.getByTestId('open-saves'))
    fireEvent.change(screen.getByTestId('saves-import-text'), {
      target: { value: exportSaveJson(g2) },
    })
    fireEvent.click(screen.getByTestId('saves-import'))
    expect(screen.getByTestId('dash-week')).toBeInTheDocument() // the load was accepted

    expect(lotStageAssignment.slotFor(survivorId)).toBeUndefined()
    expect(getLotSelectedBuilding()).toBeNull()
    cleanup()

    const { utils: fresh, view } = await openLot(g2)
    expect(shownOn(view, survivorId)).toBe('stage-a')
    expect(fresh.getByTestId('lot-nav-stage-a').getAttribute('data-attention')).toBe('active')
    expect(fresh.getByTestId('lot-nav-stage-b').getAttribute('data-attention')).toBe('empty')
  })

  it('a REJECTED import keeps the live studio’s stages — reset only on success', async () => {
    const { states, survivorId } = gameOne('lifecycle-c1')
    const utils = await primeFromGameOne(states, survivorId)
    setLotSelectedBuilding('theater')
    utils.unmount()

    localStorage.setItem(ACTIVE_SESSION_KEY, exportSaveJson(states[states.length - 1]!))
    render(<App />)
    fireEvent.click(screen.getByTestId('open-saves'))
    fireEvent.change(screen.getByTestId('saves-import-text'), {
      target: { value: '{"not":"a save"}' },
    })
    fireEvent.click(screen.getByTestId('saves-import'))

    // The previous studio is still live, so its presentation memory must be untouched.
    expect(screen.getByTestId('saves-import')).toBeInTheDocument() // still on Saves; load refused
    expect(lotStageAssignment.slotFor(survivorId)).toBe('stage-b')
    expect(getLotSelectedBuilding()).toBe('theater')
  })
})
