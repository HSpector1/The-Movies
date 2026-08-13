// ── Gate D1: StudioLotScreen host lifecycle + component tests ─────────────────
// jsdom has no WebGL, so the Phaser view is mocked with a spy. These prove the host
// contract: the renderer is created once and destroyed on unmount, fed new snapshots,
// paused/resumed with tab visibility, driven by reduced-motion, and that navigation
// emits routes only (never mutating GameState). The companion navigation is asserted
// as the accessible, keyboard-operable backbone.

import { fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
} from '../../../src/core/index.ts'
import type { CreativeRole, GameState } from '../../../src/core/index.ts'
import { publicityDecision, runPublicity } from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'
import { setOperationHollywoodOverride } from '../flags.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import type { LotRoute } from './navigation.ts'

// A spy StudioLotView. Records construction, snapshots, lifecycle calls, and lets a
// test drive the onAction/onSelect callbacks the real view would emit.
const spy = vi.hoisted(() => {
  const instances: FakeInstance[] = []
  type Opts = {
    parent: HTMLElement
    snapshot: { selectedBuildingId: string | null; week: number }
    onAction?: (e: { buildingId: string; action: string }) => void
    onSelect?: (sel: unknown) => void
    onReady?: () => void
  }
  class FakeInstance {
    opts: Opts
    snapshots: unknown[] = []
    destroyed = false
    paused = 0
    resumed = 0
    reduced: boolean[] = []
    identityModes: string[] = []
    selected: string[] = []
    publicity: Array<{ ok: boolean; detail: string }> = []
    constructor(opts: Opts) {
      this.opts = opts
      this.snapshots.push(opts.snapshot)
      instances.push(this)
      queueMicrotask(() => opts.onReady?.())
    }
    setSnapshot(s: unknown) { this.snapshots.push(s) }
    select(id: string) { this.selected.push(id) }
    clearSelection() {}
    triggerAction() {}
    pause() { this.paused++ }
    resume() { this.resumed++ }
    pauseVignettes() {}
    setReducedMotion(on: boolean) { this.reduced.push(on) }
    setIdentityMode(mode: string) { this.identityModes.push(mode) }
    setSignageMasked() {}
    camera() {}
    showHollywoodPublicity(ok: boolean, detail: string) { this.publicity.push({ ok, detail }) }
    destroy() { this.destroyed = true }
  }
  return { instances, FakeInstance }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: spy.FakeInstance }))

// ── engine state fixtures ─────────────────────────────────────────────────────
function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

const baseState = foundStudio('host-1')
const nextState = tick(baseState) // week advances → different snapshot

function renderScreen(state: GameState = baseState) {
  const routes: LotRoute[] = []
  let exits = 0
  const utils = render(
    <StudioLotScreen state={state} onNavigate={(r) => routes.push(r)} onExit={() => { exits++ }} />,
  )
  return { ...utils, routes, exits: () => exits }
}
const latest = () => spy.instances[spy.instances.length - 1]!

afterEach(() => {
  spy.instances.length = 0
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('StudioLotScreen — host lifecycle + accessible companion navigation', () => {
  it('3. creates the renderer exactly once', async () => {
    renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    // a second effect pass / rerender must not create a second view
    expect(spy.instances.length).toBe(1)
  })

  it('4. setSnapshot updates the view when GameState changes', async () => {
    const { rerender } = renderScreen(baseState)
    await waitFor(() => expect(spy.instances.length).toBe(1))
    const before = latest().snapshots.length
    rerender(<StudioLotScreen state={nextState} onNavigate={() => {}} onExit={() => {}} />)
    await waitFor(() => expect(latest().snapshots.length).toBeGreaterThan(before))
    const last = latest().snapshots.at(-1) as { week: number }
    expect(last.week).toBe(nextState.market.tick)
  })

  it('5. + 6. pauses when the tab is hidden and resumes when visible', async () => {
    renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    const view = latest()
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(view.paused).toBeGreaterThan(0)
    hidden.mockReturnValue(false)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(view.resumed).toBeGreaterThan(0)
  })

  it('7. destroys the renderer on unmount', async () => {
    const { unmount } = renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    const view = latest()
    unmount()
    expect(view.destroyed).toBe(true)
  })

  it('8. repeated mount/unmount creates no duplicate live renderer', async () => {
    for (let i = 0; i < 3; i++) {
      const { unmount } = renderScreen()
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => expect(spy.instances.at(-1)?.destroyed).toBe(false))
      const live = spy.instances.filter((v) => !v.destroyed)
      expect(live.length).toBe(1) // only ever one live view at a time
      unmount()
    }
  })

  it('9. + 10. navigation emits a route only and never mutates GameState', async () => {
    const state = foundStudio('host-nav')
    const before = JSON.stringify(state)
    const routes: LotRoute[] = []
    render(<StudioLotScreen state={state} onNavigate={(r) => routes.push(r)} onExit={() => {}} />)
    await waitFor(() => expect(spy.instances.length).toBe(1))
    // The view emits a building's navigation intent; the host translates it to a route.
    latest().opts.onAction?.({ buildingId: 'admin', action: 'open-studio-overview' })
    expect(routes).toContainEqual({ kind: 'dashboard' })
    expect(JSON.stringify(state)).toBe(before) // GameState untouched
  })

  it('12. the companion navigation exposes every one of the nine destinations', async () => {
    const { getByTestId } = renderScreen()
    for (const id of ['gate', 'admin', 'casting', 'writers', 'stage-a', 'stage-b', 'post', 'theater', 'expansion']) {
      expect(getByTestId(`lot-nav-${id}`)).toBeInTheDocument()
    }
  })

  it('13. companion items are semantic, keyboard-operable buttons that navigate', async () => {
    const { getByTestId, routes } = renderScreen()
    const btn = getByTestId('lot-nav-writers') // Development → Assemble a Film
    expect(btn.tagName).toBe('BUTTON') // native Enter/Space activation
    expect(btn).not.toHaveAttribute('tabindex', '-1')
    btn.focus()
    expect(btn).toHaveFocus()
    fireEvent.click(btn) // the activation a keyboard Enter/Space performs on a button
    expect(routes).toContainEqual({ kind: 'assembly' })
  })

  it('11. restores the selected building when returning to the lot', async () => {
    // Select a building via the companion nav, unmount, then remount: the new view is
    // handed the restored selection (session-level UI state, never GameState).
    const { getByTestId, unmount } = renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    fireEvent.click(getByTestId('lot-nav-theater')) // records selection + navigates
    unmount()
    spy.instances.length = 0
    renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    const opts = latest().opts.snapshot as { selectedBuildingId: string | null }
    expect(opts.selectedBuildingId).toBe('theater')
    await waitFor(() => expect(latest().selected).toContain('theater'))
  })

  it('14. reduced-motion preference drives the view + container into reduced-motion', async () => {
    // Stub the media query BEFORE mount so prefersReducedMotion() reports reduce.
    const mql = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql))
    const { getByTestId } = renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    await waitFor(() => expect(latest().reduced).toContain(true))
    expect(getByTestId('studio-lot-screen').className).toContain('lot-reduced-motion')
  })

  it('12b. the return-to-dashboard control is present and calls onExit', async () => {
    const { getByTestId, exits } = renderScreen()
    fireEvent.click(getByTestId('lot-return-dashboard'))
    expect(exits()).toBe(1)
  })
})

describe('StudioLotScreen — authoritative D-17B publicity offer', () => {
  it('renders the exact current Whisper offer, availability, and both cooldowns', () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-offer')
    const offer = publicityDecision(state).find((candidate) => candidate.tier === 'whisper')!

    const { getByTestId } = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} onStateChange={() => {}} />,
    )

    const button = getByTestId('hollywood-publicity-whisper')
    const status = getByTestId('hollywood-publicity-whisper-status')
    expect(button).toHaveTextContent(moneyExact(offer.cost))
    expect(button).toHaveTextContent(`+${offer.expectedLift.toFixed(2)} awareness`)
    expect(button).toBeEnabled()
    expect(status).toHaveTextContent('Available now.')
    expect(status).toHaveTextContent(`Global cooldown: ${offer.globalCooldownWeeks} weeks`)
    expect(status).toHaveTextContent(`Whisper cooldown: ${offer.cooldownWeeks} weeks`)
  })

  it('replaces state only after success and preserves exact cash, awareness, ledger, and cooldown accounting', async () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-success')
    const before = JSON.stringify(state)
    const offer = publicityDecision(state).find((candidate) => candidate.tier === 'whisper')!
    let replacement: GameState | undefined

    const { getByTestId, rerender } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onStateChange={(next) => { replacement = next }}
      />,
    )
    fireEvent.click(getByTestId('hollywood-publicity-whisper'))

    expect(replacement).toBeDefined()
    const next = replacement!
    expect(next).not.toBe(state)
    expect(next.studio.cash).toBe(state.studio.cash - offer.cost)
    expect(next.studio.standing.audienceAwareness).toBeCloseTo(
      state.studio.standing.audienceAwareness + offer.expectedLift,
      12,
    )
    expect(next.ledger.at(-1)).toEqual({
      week: state.market.tick,
      kind: 'publicity',
      amount: -offer.cost,
      note: 'publicity: whisper',
    })
    expect(next.publicity.lastUsedWeek).toBe(state.market.tick)
    expect(next.publicity.byTier.whisper).toBe(state.market.tick)
    expect(JSON.stringify(state)).toBe(before)

    const cooldownOffer = publicityDecision(next).find((candidate) => candidate.tier === 'whisper')!
    expect(cooldownOffer.available).toBe(false)
    expect(cooldownOffer.availableWeek).toBe(state.market.tick + offer.cooldownWeeks)

    rerender(
      <StudioLotScreen
        state={next}
        onNavigate={() => {}}
        onExit={() => {}}
        onStateChange={(updated) => { replacement = updated }}
      />,
    )
    await waitFor(() => expect(getByTestId('hollywood-publicity-whisper')).toBeDisabled())
    expect(getByTestId('hollywood-publicity-whisper-status')).toHaveTextContent(cooldownOffer.reason!)
  })

  it('shows an authoritative rejection and cannot replace or mutate state', () => {
    setOperationHollywoodOverride(true)
    const founded = foundStudio('hollywood-publicity-rejected')
    const state: GameState = {
      ...founded,
      studio: { ...founded.studio, cash: 0 },
    }
    const before = JSON.stringify(state)
    const offer = publicityDecision(state).find((candidate) => candidate.tier === 'whisper')!
    const rejected = runPublicity(state, 'whisper')
    const onStateChange = vi.fn()

    expect(offer.available).toBe(false)
    expect(offer.reason).toBeTruthy()
    expect(rejected.ok).toBe(false)

    const { getByTestId } = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} onStateChange={onStateChange} />,
    )
    const button = getByTestId('hollywood-publicity-whisper')
    expect(button).toBeDisabled()
    expect(getByTestId('hollywood-publicity-whisper-status')).toHaveTextContent(offer.reason!)
    fireEvent.click(button)

    expect(onStateChange).not.toHaveBeenCalled()
    expect(JSON.stringify(state)).toBe(before)
  })
})
