// ── D1-A: the studio-identity review selector (host wiring) ──────────────────────
// jsdom has no WebGL, so StudioLotView is mocked. These prove the DEV-ONLY review UI:
//   • it appears ONLY when the identity-proof flag is on;
//   • it offers EXACTLY the four directive modes (no more, no fewer);
//   • selecting a mode drives the renderer's setIdentityMode / setReducedMotion correctly;
//   • switching modes never mutates GameState (pure presentation);
//   • the companion navigation stays fully operable in every mode.

import { fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
} from '../../../src/core/index.ts'
import type { CreativeRole, GameState } from '../../../src/core/index.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import type { LotRoute } from './navigation.ts'
import { setStudioLotIdentityOverride } from '../flags.ts'

const spy = vi.hoisted(() => {
  const instances: Fake[] = []
  type Opts = { snapshot: unknown; onReady?: () => void }
  class Fake {
    opts: Opts
    identityModes: string[] = []
    reduced: boolean[] = []
    constructor(opts: Opts) {
      this.opts = opts
      instances.push(this)
      queueMicrotask(() => opts.onReady?.())
    }
    setSnapshot() {}
    select() {}
    clearSelection() {}
    triggerAction() {}
    pause() {}
    resume() {}
    setReducedMotion(on: boolean) { this.reduced.push(on) }
    setIdentityMode(mode: string) { this.identityModes.push(mode) }
    identityDebug() { return { mode: 'concept-a', failed: false, identityObjects: 8, attnBadges: 0, marqueeBulbs: 14, displayObjects: 120, fps: 60 } }
    destroy() {}
  }
  return { instances, Fake }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: spy.Fake }))

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

const baseState = foundStudio('identity-1')
const latest = () => spy.instances[spy.instances.length - 1]!

function renderScreen(state: GameState = baseState) {
  const routes: LotRoute[] = []
  const utils = render(
    <StudioLotScreen state={state} onNavigate={(r) => routes.push(r)} onExit={() => {}} />,
  )
  return { ...utils, routes }
}

afterEach(() => {
  spy.instances.length = 0
  setStudioLotIdentityOverride(false)
  vi.restoreAllMocks()
})

describe('D1-A identity review selector', () => {
  it('is ABSENT when the identity-proof flag is off (default)', () => {
    const { queryByTestId } = renderScreen()
    expect(queryByTestId('lot-review-mode')).toBeNull()
  })

  it('ordinary player use (no flag): NO review control renders and identity stays off', async () => {
    // Production isolation: with the dev flag off, the lot + companion nav work, but none of the
    // review controls appear and the renderer is never driven into a non-baseline identity mode.
    const { queryByTestId, getByTestId } = renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    expect(queryByTestId('lot-review-mode')).toBeNull()
    expect(queryByTestId('lot-perf-panel')).toBeNull()
    expect(queryByTestId('lot-review-hide')).toBeNull()
    expect(queryByTestId('lot-review-show')).toBeNull()
    // the lot itself is fully present
    expect(getByTestId('lot-companion-nav')).toBeInTheDocument()
    // and the renderer was never asked for a non-baseline identity mode
    expect(latest().identityModes).toEqual([])
  })

  it('appears with EXACTLY the four directive modes when the flag is on', async () => {
    setStudioLotIdentityOverride(true)
    const { getByTestId, queryByTestId } = renderScreen()
    await waitFor(() => expect(getByTestId('lot-review-mode')).toBeInTheDocument())
    for (const key of ['baseline', 'concept-a', 'fallback', 'reduced']) {
      expect(getByTestId(`lot-review-${key}`)).toBeInTheDocument()
    }
    // no fifth option smuggled in
    expect(queryByTestId('lot-review-concept-b')).toBeNull()
    expect(queryByTestId('lot-review-concept-c')).toBeNull()
  })

  it('the Hide control removes the overlay; the restore pill brings it back', async () => {
    setStudioLotIdentityOverride(true)
    const { getByTestId, queryByTestId } = renderScreen()
    await waitFor(() => expect(getByTestId('lot-review-mode')).toBeInTheDocument())
    fireEvent.click(getByTestId('lot-review-hide'))
    expect(queryByTestId('lot-review-mode')).toBeNull()
    expect(getByTestId('lot-review-show')).toBeInTheDocument()
    fireEvent.click(getByTestId('lot-review-show'))
    expect(getByTestId('lot-review-mode')).toBeInTheDocument()
  })

  it('defaults to Concept A and drives the renderer on ready', async () => {
    setStudioLotIdentityOverride(true)
    renderScreen()
    await waitFor(() => expect(latest().identityModes).toContain('concept-a'))
  })

  it('each mode drives setIdentityMode / setReducedMotion correctly', async () => {
    setStudioLotIdentityOverride(true)
    const { getByTestId } = renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    const view = latest()

    fireEvent.click(getByTestId('lot-review-baseline'))
    await waitFor(() => expect(view.identityModes.at(-1)).toBe('baseline'))

    fireEvent.click(getByTestId('lot-review-fallback'))
    await waitFor(() => expect(view.identityModes.at(-1)).toBe('fallback'))

    fireEvent.click(getByTestId('lot-review-reduced'))
    // reduced-motion mode maps to Concept A identity with reduced motion forced on
    await waitFor(() => expect(view.identityModes.at(-1)).toBe('concept-a'))
    expect(view.reduced.at(-1)).toBe(true)

    fireEvent.click(getByTestId('lot-review-concept-a'))
    await waitFor(() => expect(view.identityModes.at(-1)).toBe('concept-a'))
    expect(view.reduced.at(-1)).toBe(false)
  })

  it('switching review modes never mutates GameState', async () => {
    setStudioLotIdentityOverride(true)
    const state = foundStudio('identity-immutable')
    const before = JSON.stringify(state)
    const routes: LotRoute[] = []
    const { getByTestId } = render(
      <StudioLotScreen state={state} onNavigate={(r) => routes.push(r)} onExit={() => {}} />,
    )
    await waitFor(() => expect(getByTestId('lot-review-mode')).toBeInTheDocument())
    for (const key of ['baseline', 'fallback', 'reduced', 'concept-a']) {
      fireEvent.click(getByTestId(`lot-review-${key}`))
    }
    expect(JSON.stringify(state)).toBe(before)
  })

  it('the companion navigation still routes while the review selector is active', async () => {
    setStudioLotIdentityOverride(true)
    const { getByTestId, routes } = renderScreen()
    await waitFor(() => expect(getByTestId('lot-review-mode')).toBeInTheDocument())
    fireEvent.click(getByTestId('lot-review-fallback'))
    fireEvent.click(getByTestId('lot-nav-writers')) // Development → Assemble a Film
    expect(routes).toContainEqual({ kind: 'assembly' })
  })
})
