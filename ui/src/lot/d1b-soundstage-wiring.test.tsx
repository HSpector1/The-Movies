// ── D1-B: the stage-assignment fix is actually WIRED, in both gate positions ──
// stageAssignment.test.ts proves the resolver. This proves the host uses it: that the
// correction reaches BOTH the Phaser view (via the snapshots pushed to it) and the DOM
// companion navigation, and that with the content gate OFF the screen still behaves
// exactly as the pre-spike lot.

import { render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyActions, beginFounding, generateWorld, tick } from '../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../../../src/core/index.ts'
import { studioLotSnapshot } from '../engine/adapter.ts'
import type { StudioLotSnapshot } from './snapshot/StudioLotSnapshot.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import { setStudioLotSoundstagesOverride } from '../flags.ts'

const spy = vi.hoisted(() => {
  const instances: Array<{ snapshots: StudioLotSnapshot[]; distinctStages: boolean }> = []
  class FakeInstance {
    snapshots: StudioLotSnapshot[] = []
    distinctStages: boolean
    constructor(opts: { snapshot: StudioLotSnapshot; distinctStages?: boolean; onReady?: () => void }) {
      this.snapshots = [opts.snapshot]
      this.distinctStages = opts.distinctStages === true
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

afterEach(() => {
  spy.instances.length = 0
  setStudioLotSoundstagesOverride(false)
})

// ── engine fixtures ───────────────────────────────────────────────────────────
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

/** Every GameState from "both films shooting" through "film A released, B alone". */
function timeline(seed: string): { states: GameState[]; filmBId: string } {
  let s = greenlightFilm(foundStudioRich(seed), 0, 0)
  s = tick(s)
  s = tick(s)
  s = greenlightFilm(s, 1, 1)
  const states: GameState[] = [s]
  const filmBId = studioLotSnapshot(s).activeProductions.find((p) => p.stageId === 'stage-b')!.id
  for (let i = 0; i < 20; i++) {
    s = tick(s)
    states.push(s)
    const live = studioLotSnapshot(s).activeProductions
    if (live.length === 1 && live[0]!.id === filmBId) break
  }
  return { states, filmBId }
}

const noop = () => {}

/**
 * Drive the screen through the timeline; return the DOM + the view's snapshot log.
 * The Phaser view is created inside a dynamic import(), and the host only pushes new
 * snapshots once onReady has flipped canvasReady — so both have to settle before the
 * timeline is replayed, or nothing would reach the renderer.
 */
async function runTimeline(states: GameState[]) {
  const { getByTestId, queryByText, rerender } = render(
    <StudioLotScreen state={states[0]!} onNavigate={noop} onExit={noop} />,
  )
  await waitFor(() => expect(spy.instances[0]).toBeDefined())
  await waitFor(() => expect(queryByText('Preparing the lot…')).toBeNull())
  for (const s of states.slice(1)) {
    rerender(<StudioLotScreen state={s} onNavigate={noop} onExit={noop} />)
  }
  return { getByTestId, view: spy.instances[0]! }
}

describe('D1-B wiring — content gate ON', () => {
  it('the corrected assignment reaches the Phaser view AND the companion navigation', async () => {
    setStudioLotSoundstagesOverride(true)
    const { states, filmBId } = timeline('wire-1')
    const { getByTestId, view } = await runTimeline(states)

    // the last snapshot handed to the renderer keeps film B on Stage B
    const last = view.snapshots[view.snapshots.length - 1]!
    expect(last.activeProductions).toHaveLength(1)
    expect(last.activeProductions[0]!.id).toBe(filmBId)
    expect(last.activeProductions[0]!.stageId).toBe('stage-b')
    expect(view.distinctStages).toBe(true)

    // ...and the accessible companion navigation agrees: B is the busy stage
    expect(getByTestId('lot-nav-stage-b').getAttribute('data-attention')).toBe('active')
    expect(getByTestId('lot-nav-stage-a').getAttribute('data-attention')).toBe('empty')
  })
})

describe('D1-B wiring — content gate OFF is the pre-spike lot', () => {
  it('the array-order arrangement is untouched, and the view is told stages are shared', async () => {
    const { states, filmBId } = timeline('wire-1')
    const { getByTestId, view } = await runTimeline(states)

    // unchanged pre-existing behaviour: the survivor migrates to Stage A
    const last = view.snapshots[view.snapshots.length - 1]!
    expect(last.activeProductions[0]!.id).toBe(filmBId)
    expect(last.activeProductions[0]!.stageId).toBe('stage-a')
    expect(view.distinctStages).toBe(false)

    expect(getByTestId('lot-nav-stage-a').getAttribute('data-attention')).toBe('active')
    expect(getByTestId('lot-nav-stage-b').getAttribute('data-attention')).toBe('empty')
  })
})
