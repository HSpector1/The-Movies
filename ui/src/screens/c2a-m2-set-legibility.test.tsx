// ── C2a-M2 §12-M2 LEGIBILITY — "the package/greenlight surface names the bound
//    set and shows quality/novelty/condition/fit with the projected uplift" ─────
//
// Four things are proved here, and the first is the one the rest rest on:
//
//   1. THE PLAN IS NOT A GUESS. `packageSetPlan` claims to name the set a picture
//      greenlit now would stand on. That claim is checked the only way it can be —
//      greenlight a picture, run the weeks, and assert the set the ENGINE bound is
//      the set the plan named. A prediction nobody checks is a lie with a schedule.
//   2. THE SURFACE SAYS ALL FIVE THINGS the gate names: the set's NAME, its quality,
//      its novelty, its condition, its fit, and the projected uplift.
//   3. EVERY NUMBER SHIPS WITH ITS DRIVERS AND ONE ACTIONABLE RESPONSE
//      (RCT3-DIAGNOSTICS-001). Not "most of them" — every one, at every state.
//   4. FIT IS ADVISORY (§3.1) AND THE GREENLIGHT IS NEVER BLOCKED BY SCENERY. A
//      picture with nowhere to shoot is still greenlit; it waits at rehearsal. The
//      copy has to say so, because a player sent to build a set to "unblock" a
//      greenlight that was never blocked has been lied to.

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { advanceWeek, greenlight } from '../engine/adapter.ts'
import type { DraftPackage, GameState } from '../engine/adapter.ts'
import { applyActions } from '../../../src/core/index.ts'
import {
  SET_UPLIFT_MAX,
  SET_CONDITION_UNUSABLE_THRESHOLD,
  SET_CONDITION_WEAR_PER_PRODUCTION,
  packageSetPlan,
  sceneryBoard,
} from '../engine/sets.ts'
import {
  SET_ADVISORY_NOTE,
  picturesBeforeRepair,
  setBlockCopy,
  setDriverLines,
  upliftShare,
} from '../presentation/setVoice.ts'
import { SetStagePanel } from '../components/SetStagePanel.tsx'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

function managed(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
}

/** The production the studio has just greenlit — the newest one it is running. */
function latestProductionId(state: GameState): string {
  const active = state.studio.activeProductions
  const newest = active[active.length - 1]
  if (newest === undefined) throw new Error('expected a production in flight')
  return newest.id
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

/** Run the weeks until this production is standing on something, or give up. */
function advanceUntilBound(
  state: GameState,
  productionId: string,
  weeks = 40,
): { state: GameState; setId: string | null } {
  let current = state
  for (let week = 0; week < weeks; week++) {
    const workflow = current.operations.workflows.find((w) => w.productionId === productionId)
    if (workflow?.bindings.setId != null) return { state: current, setId: workflow.bindings.setId }
    current = advanceWeek(current).next
  }
  const workflow = current.operations.workflows.find((w) => w.productionId === productionId)
  return { state: current, setId: workflow?.bindings.setId ?? null }
}

describe('C2a-M2 §12-M2 — the plan names the set the engine actually binds', () => {
  it('the set `packageSetPlan` names before greenlight is the set bound at rehearsal', () => {
    const before = managed('c2a-m2-plan-1')
    const pkg = directPackage(before)
    const plan = packageSetPlan(before, pkg.promise.genre)

    expect(plan.required).toBe(true)
    expect(plan.planned).not.toBeNull()

    const outcome = greenlight(before, pkg)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    const productionId = latestProductionId(outcome.next)
    const bound = advanceUntilBound(outcome.next, productionId)

    expect(bound.setId).not.toBeNull()
    expect(bound.setId).toBe(plan.planned!.setId)
  })

  it('the uplift the plan projected is the uplift the engine locked at bind', () => {
    const before = managed('c2a-m2-plan-2')
    const pkg = directPackage(before)
    const plan = packageSetPlan(before, pkg.promise.genre)
    const outcome = greenlight(before, pkg)
    if (!outcome.ok) throw new Error(outcome.error)
    const productionId = latestProductionId(outcome.next)
    const bound = advanceUntilBound(outcome.next, productionId)
    const workflow = bound.state.operations.workflows.find((w) => w.productionId === productionId)!

    expect(workflow.bindings.lockedUplift).toBeCloseTo(plan.planned!.upliftPoints, 10)
    expect(workflow.bindings.lockedNovelty).toBeCloseTo(plan.planned!.novelty, 10)
  })

  it('a second picture is planned onto the OTHER stage while the first holds one', () => {
    const before = managed('c2a-m2-plan-3')
    const first = greenlight(before, directPackage(before))
    if (!first.ok) throw new Error(first.error)
    const firstId = latestProductionId(first.next)
    const held = advanceUntilBound(first.next, firstId)

    const secondPkg = directPackage(held.state, 1)
    const plan = packageSetPlan(held.state, secondPkg.promise.genre)
    expect(plan.planned).not.toBeNull()
    expect(plan.planned!.setId).not.toBe(held.setId)
  })
})

describe('C2a-M2 §12-M2 — the surface names the set and shows the whole stat block', () => {
  it('names the set, its location and its stage, and shows all four readings', () => {
    const state = managed('c2a-m2-surface-1')
    const plan = packageSetPlan(state, state.concepts[0]!.genre)
    render(<SetStagePanel plan={plan} />)

    const panel = screen.getByTestId('pkg-set')
    expect(within(panel).getByTestId('pkg-set-identity').textContent).toContain(
      plan.planned!.name,
    )
    expect(within(panel).getByTestId('pkg-set-identity').textContent).toContain(
      plan.planned!.stageName,
    )
    expect(within(panel).getByTestId('pkg-set-identity').textContent).toContain(
      plan.planned!.locationLabel,
    )

    for (const key of ['quality', 'fit', 'condition', 'novelty']) {
      expect(within(panel).getByTestId(`pkg-set-driver-${key}`)).toBeInTheDocument()
    }
  })

  it('shows the projected uplift, and states it against its own maximum', () => {
    const state = managed('c2a-m2-surface-2')
    const plan = packageSetPlan(state, state.concepts[0]!.genre)
    render(<SetStagePanel plan={plan} />)

    const value = screen.getByTestId('pkg-set-uplift-value').textContent ?? ''
    expect(value).toContain(`+${plan.planned!.upliftPoints.toFixed(1)}`)
    expect(screen.getByTestId('pkg-set-uplift-headline').textContent).toContain(
      `+${plan.maxUplift.toFixed(1)}`,
    )
    expect(screen.getByTestId('pkg-set-uplift-share')).toBeInTheDocument()
  })

  it('renders nothing at all for a studio whose pictures are not bound to sets', () => {
    const state = newFoundedGame('c2a-m2-surface-3')
    const plan = packageSetPlan(state, state.concepts[0]!.genre)
    expect(plan.required).toBe(false)
    const { container } = render(<SetStagePanel plan={plan} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('C2a-M2 — every number ships with its drivers and one response', () => {
  it('all four driver rows carry a non-empty WHY and a non-empty WHAT YOU CAN DO', () => {
    const state = managed('c2a-m2-drivers-1')
    const plan = packageSetPlan(state, state.concepts[0]!.genre)
    render(<SetStagePanel plan={plan} />)

    for (const key of ['quality', 'fit', 'condition', 'novelty']) {
      const row = screen.getByTestId(`pkg-set-driver-${key}`)
      const response = within(row).getByTestId(`pkg-set-response-${key}`)
      expect((response.textContent ?? '').trim().length).toBeGreaterThan(0)
      // The WHY column sits between the reading and the response; the row as a
      // whole must carry more than bare numbers.
      expect((row.textContent ?? '').length).toBeGreaterThan(60)
    }
  })

  it('every driver of every standing set, at every genre, has a response', () => {
    const state = managed('c2a-m2-drivers-2')
    for (const genre of [null, 'drama', 'crime', 'horror'] as const) {
      const plan = packageSetPlan(state, genre)
      for (const set of plan.standing) {
        for (const line of setDriverLines(set, plan)) {
          expect(line.driver.trim().length).toBeGreaterThan(0)
          expect(line.response.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('no player-facing sentence carries an engine id', () => {
    const state = managed('c2a-m2-drivers-3')
    const plan = packageSetPlan(state, state.concepts[0]!.genre)
    render(<SetStagePanel plan={plan} />)
    const text = screen.getByTestId('pkg-set').textContent ?? ''
    expect(text).not.toContain('facility-')
    expect(text).not.toContain('set-')
    expect(text).not.toContain('production-')
    expect(text).not.toContain('undefined')
    expect(text).not.toContain('NaN')
  })
})

describe('C2a-M2 §3.1 — fit is advisory, and scenery never blocks a greenlight', () => {
  it('the panel states the advisory law verbatim', () => {
    const state = managed('c2a-m2-advisory-1')
    const plan = packageSetPlan(state, state.concepts[0]!.genre)
    render(<SetStagePanel plan={plan} />)
    expect(screen.getByTestId('pkg-set-advisory').textContent).toBe(SET_ADVISORY_NOTE)
  })

  it('a worn-out set is reported with a repair, not a refusal, and the wait note stands', () => {
    const state = managed('c2a-m2-advisory-2')
    // Wear both endowed sets under the threshold — the state a studio reaches by
    // shooting, reproduced directly so the assertion is about the SURFACE.
    const worn: GameState = {
      ...state,
      sets: state.sets.map((set) => ({
        ...set,
        condition: SET_CONDITION_UNUSABLE_THRESHOLD - 1,
      })),
    }
    const plan = packageSetPlan(worn, worn.concepts[0]!.genre)
    expect(plan.planned).toBeNull()
    expect(plan.block?.code).toBe('setWorn')

    render(<SetStagePanel plan={plan} />)
    expect(screen.getByTestId('pkg-set-block-response').textContent).toContain('repair')
    const wait = screen.getByTestId('pkg-set-wait-note').textContent ?? ''
    expect(wait).toContain('does not stop the greenlight')
  })

  it('a bare stage asks for a set to be commissioned, and names the stage', () => {
    const state = managed('c2a-m2-advisory-3')
    const bare: GameState = { ...state, sets: [] }
    const plan = packageSetPlan(bare, bare.concepts[0]!.genre)
    expect(plan.block?.code).toBe('stageBare')
    render(<SetStagePanel plan={plan} />)
    const stageName = bare.operations.facilities.find((f) => f.capability === 'soundstage')!.name
    expect(screen.getByTestId('pkg-set-block-headline').textContent).toContain(stageName)
    expect(screen.getByTestId('pkg-set-block-response').textContent).toContain('Scenery Shop')
  })

  it('every block arm produces a headline, a reason and an actionable response', () => {
    const arms = [
      { code: 'noStages' as const },
      { code: 'stagesBusy' as const },
      { code: 'stageBare' as const, stageName: 'Soundstage 12' },
      {
        code: 'setBuilding' as const,
        stageName: 'Soundstage 12',
        setName: 'Graveyard',
        weeksRemaining: 3,
      },
      {
        code: 'setBuilding' as const,
        stageName: 'Soundstage 12',
        setName: 'Graveyard',
        weeksRemaining: null,
      },
      {
        code: 'setWorn' as const,
        stageName: 'Soundstage 7',
        setName: 'Stage 7 House Set',
        condition: 31,
      },
      { code: 'setInUse' as const, stageName: 'Soundstage 7', setName: 'Stage 7 House Set' },
    ]
    for (const arm of arms) {
      const copy = setBlockCopy(arm)
      expect(copy.headline.trim().length).toBeGreaterThan(0)
      expect(copy.reason.trim().length).toBeGreaterThan(0)
      expect(copy.response.trim().length).toBeGreaterThan(0)
      // No arm may present itself as a refusal of the greenlight.
      expect(copy.headline.toLowerCase()).not.toContain('cannot greenlight')
      expect(copy.response).not.toContain('undefined')
    }
  })
})

describe('C2a-M2 — bounded presentation terms', () => {
  it('the projected uplift never exceeds its authored maximum, on any set or genre', () => {
    const state = managed('c2a-m2-bounds-1')
    const board = sceneryBoard(state)
    expect(board.available).toBe(true)
    for (const genre of [null, 'comedy', 'drama', 'crime', 'romance', 'horror', 'adventure'] as const) {
      const plan = packageSetPlan(state, genre)
      for (const set of [...plan.standing, ...plan.underWork]) {
        expect(set.upliftPoints).toBeGreaterThanOrEqual(0)
        expect(set.upliftPoints).toBeLessThanOrEqual(SET_UPLIFT_MAX)
        expect(set.fit).toBeGreaterThanOrEqual(0)
        expect(set.fit).toBeLessThanOrEqual(1)
        expect(set.noveltyFactor).toBeGreaterThan(0)
        expect(set.noveltyFactor).toBeLessThanOrEqual(1)
      }
      for (const offer of plan.bestBuildable === null ? [] : [plan.bestBuildable]) {
        expect(offer.upliftPoints).toBeLessThanOrEqual(SET_UPLIFT_MAX)
      }
    }
  })

  it('`upliftShare` is 0..1 whatever it is handed', () => {
    for (const [points, max] of [
      [0, 10],
      [5.7, 10],
      [10, 10],
      [99, 10],
      [-3, 10],
      [5, 0],
    ]) {
      const share = upliftShare(points!, max!)
      expect(share).toBeGreaterThanOrEqual(0)
      expect(share).toBeLessThanOrEqual(1)
    }
  })

  it('`picturesBeforeRepair` counts exactly the bindings the engine would still allow', () => {
    // The engine's own rule, walked: a set is bindable while condition >= threshold,
    // and each wrap costs the per-production wear.
    for (let condition = 0; condition <= 100; condition++) {
      let remaining = condition
      let allowed = 0
      while (remaining >= SET_CONDITION_UNUSABLE_THRESHOLD) {
        allowed += 1
        remaining -= SET_CONDITION_WEAR_PER_PRODUCTION
      }
      expect(picturesBeforeRepair(condition)).toBe(allowed)
    }
    expect(picturesBeforeRepair(0)).toBe(0)
    expect(picturesBeforeRepair(100)).toBeGreaterThan(0)
    expect(picturesBeforeRepair(100)).toBeLessThanOrEqual(
      Math.floor(100 / SET_CONDITION_WEAR_PER_PRODUCTION) + 1,
    )
  })
})
