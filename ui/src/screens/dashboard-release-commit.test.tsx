// P06A W5 (browser player route) — the release-commitment affordance.
//
// The regression the ui-floor repair lanes surfaced and correctly refused to
// paper over: under the hold law a Release Ready picture holds forever, and the
// browser had NO control to commit it (P04 lesson 4 — no engine capability may
// be unreachable from a visible surface). This proves the exact control now
// exists, names the exact title, dispatches the exact-id commitment, and that
// holding (Advance one week) stays legal beside it.

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Dashboard } from './Dashboard.tsx'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  nextStudioDecision,
  tick,
} from '../../../src/core/index.ts'
import type { CastSlot, GameState, SegmentId } from '../../../src/core/index.ts'

function foundedManaged(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
  const byRole = (role: string) => applicants.filter((t) => t.role === role)
  for (const hire of [
    ...byRole('actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole('director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole('writer').slice(0, FOUNDING_MINIMUMS.writer),
    ...byRole('craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [{ kind: 'activateStudioOperations' }])
}

function payload(state: GameState) {
  const contracted = state.contracts.map((c) => state.talent.find((t) => t.id === c.talentId)!)
  const byRole = (role: string) => contracted.filter((t) => t.role === role)
  const actors = byRole('actor')
  const concept = state.concepts[0]!
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    writerId: byRole('writer')[0]!.id,
    directorId: byRole('director')[0]!.id,
    cast: {
      lead: actors[0]!.id,
      antagonist: actors[1]!.id,
      support: actors[2]!.id,
    } satisfies Record<CastSlot, string>,
    craftIds: [byRole('craft')[0]!.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

/** A managed studio holding one uncommitted Release Ready picture. */
function releaseReadyStudio(seed: string): GameState {
  let state = applyActions(foundedManaged(seed), [{ kind: 'greenlight', production: payload(foundedManaged(seed)) }])
  for (let guard = 0; guard < 30; guard++) {
    let decision = nextStudioDecision(state)
    while (decision !== null && decision.kind === 'productionOperation') {
      state = applyActions(state, [decision.command])
      decision = nextStudioDecision(state)
    }
    if (state.studio.activeProductions[0]!.remainingTicks === 1) return state
    state = tick(state)
  }
  throw new Error('never reached Release Ready')
}

describe('P06A — the browser release-commit affordance', () => {
  it('renders an exact-title commit control at Release Ready and dispatches the exact id', () => {
    const state = releaseReadyStudio('dash-release-commit')
    const id = state.studio.activeProductions[0]!.id
    const decision = nextStudioDecision(state)
    expect(decision?.kind).toBe('releaseReview')

    const onCommit = vi.fn()
    render(<Dashboard state={state} onCommitPictureToRelease={onCommit} onAdvance={() => {}} onAssemble={() => {}} onSimToEvent={() => {}} onCreateTalent={() => {}} onSaves={() => {}} onOpenAutopsy={() => {}} />)

    const commit = screen.getByTestId('release-commit')
    expect(commit.textContent).toContain('to release')
    // Holding stays legal — Advance one week is still present beside the commit.
    expect(screen.getByTestId('advance-week')).toBeInTheDocument()
    // Sim-to-next-event is held at the decision.
    expect(screen.getByTestId('sim-to-event')).toBeDisabled()

    fireEvent.click(commit)
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith(id)
  })

  it('shows no commit control when nothing is Release Ready', () => {
    const state = foundedManaged('dash-no-release')
    render(<Dashboard state={state} onCommitPictureToRelease={() => {}} onAdvance={() => {}} onAssemble={() => {}} onSimToEvent={() => {}} onCreateTalent={() => {}} onSaves={() => {}} onOpenAutopsy={() => {}} />)
    expect(screen.queryByTestId('release-commit')).not.toBeInTheDocument()
  })
})
