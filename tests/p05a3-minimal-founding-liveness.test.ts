// P05A.3 §18 — the no-reserve founding fixture.
//
// The audit finding this file exists to keep loud: every proof before P05A.3
// ran on `richFoundedStudio` (≥6 Actors — DOUBLE the player's legal minimum of
// 3) or signed the bridge's optional post-coverage reserve Actor, so no suite
// ever exercised a studio founded at the real player floor. That structural
// gap is exactly how the Owner's casting deadlock (three distinct Actors
// mandatory, two legal Actors alive, no hiring route on the wire) survived
// 4,800 green tests.
//
// `minimalFoundedStudio` founds with EXACTLY the founding minimums
// (3 Actors / 1 Director / 1 Writer / 1 Craft Lead). This suite drives it to
// its first natural scarcity wall and proves the liveness loop end to end:
//   1. founding at the minimum is legal and playable;
//   2. one greenlight later, the next picture publishes the package-staffing
//      blocker with the engine's exact counts — never a silent READY;
//   3. busy rows carry the authoritative return week;
//   4. the hiring market offers signable talent;
//   5. signContract rescues the package — the blocker disappears.
import { describe, expect, it } from 'vitest'

import {
  applyActions,
  castingPackageReadModel,
  contractOfferOptions,
  hiringMarketView,
  tick,
  type GameState,
} from '../src/core/index.js'
import {
  availableConceptId,
  availableWriterId,
  commissionPayload,
  contractedByRole,
  minimalFoundedStudio,
  minimalManagedStudio,
  withCash,
} from './contracts/_contractFixtures.js'

const SEED = 'p05a3-min-a'

/** Minimal studio, first picture greenlit with available people, second picture Ready. */
function studioAtTheWall(): { state: GameState; blockedProjectId: string } {
  let state = withCash(minimalManagedStudio(SEED), 50_000_000)
  state = applyActions(state, [
    {
      kind: 'commissionScript',
      project: commissionPayload(state, availableConceptId(state), availableWriterId(state)),
    },
  ])
  const first = state.scriptDevelopment.projects[0]!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: first }])

  const view = castingPackageReadModel(state).projects.find((p) => p.projectId === first)!
  const director = view.pools
    .find((p) => p.role === 'director')!
    .candidates.find((c) => c.available)!
  const craft = view.pools
    .find((p) => p.role === 'craftLead')!
    .candidates.find((c) => c.available)!
  const pools = ['lead', 'antagonist', 'support'].map(
    (role) => view.pools.find((p) => p.role === role)!,
  )
  const chosen: string[] = []
  for (const pool of pools) {
    chosen.push(pool.candidates.find((c) => c.available && !chosen.includes(c.talentId))!.talentId)
  }
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: {
        projectId: first,
        directorId: director.talentId,
        craftIds: [craft.talentId],
        cast: { lead: chosen[0]!, antagonist: chosen[1]!, support: chosen[2]! },
        budget: {
          negative: view.negativeOptions[0]!.amount,
          marketing: view.marketingOptions[0]!.amount,
        },
      },
    },
  ])

  state = applyActions(state, [
    {
      kind: 'commissionScript',
      project: commissionPayload(state, availableConceptId(state), availableWriterId(state)),
    },
  ])
  const second = state.scriptDevelopment.projects.find((p) => p.id !== first)!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: second }])
  return { state, blockedProjectId: second }
}

describe('P05A.3 §18 — the real player floor (no reserve, exact minimums)', () => {
  it('founding at the exact minimums is legal: 3 Actors, 1 Director, 1 Writer, 1 Craft Lead', () => {
    const state = minimalFoundedStudio(SEED)
    expect(state.founding).toBeNull()
    expect(contractedByRole(state, 'actor').length).toBe(3)
    expect(contractedByRole(state, 'director').length).toBe(1)
    expect(contractedByRole(state, 'writer').length).toBe(1)
    expect(contractedByRole(state, 'craft').length).toBe(1)
  })

  it('one greenlight later, the next picture is a NAMED staffing blocker — never a silent READY', () => {
    const { state, blockedProjectId } = studioAtTheWall()
    const view = castingPackageReadModel(state).projects.find(
      (p) => p.projectId === blockedProjectId,
    )!

    const staffing = view.readiness.blockers.find((b) => b.code === 'package-staffing')
    expect(staffing, 'the shortage must be a named blocker').toBeDefined()
    // The engine's exact counts and its writer-credit explanation, verbatim.
    expect(staffing!.message).toContain('Director (0 of 1 available)')
    expect(staffing!.message).toContain('writing credit')
    expect(staffing!.remedy).toContain('Sign suitable talent')
    expect(view.readiness.knownGatesClear).toBe(false)
    expect(view.readiness.willQueue).toBe(false)

    // §12 on the floor fixture too: the busy director is a VISIBLE row with
    // the authoritative return week, not an omission.
    const directorPool = view.pools.find((p) => p.role === 'director')!
    expect(directorPool.candidates.filter((c) => c.available)).toHaveLength(0)
    const busyDirector = directorPool.candidates.find((c) => !c.available)
    expect(busyDirector).toBeDefined()
    expect(busyDirector!.returnWeek).toBe(10)
  })

  it('the hiring market rescues the wall: signContract removes the staffing blocker', () => {
    const { state, blockedProjectId } = studioAtTheWall()
    const directors = hiringMarketView(state).filter((c) => c.role === 'director')
    expect(directors.length, 'the market must offer signable directors').toBeGreaterThan(0)
    expect(hiringMarketView(state).filter((c) => c.role === 'actor').length).toBeGreaterThan(0)

    const hire = directors[0]!
    const term = contractOfferOptions(state, hire.talentId)[0]!
    const rescued = applyActions(state, [
      { kind: 'signContract', talentId: hire.talentId, termWeeks: term.termWeeks },
    ])

    const view = castingPackageReadModel(rescued).projects.find(
      (p) => p.projectId === blockedProjectId,
    )!
    expect(view.readiness.blockers.find((b) => b.code === 'package-staffing')).toBeUndefined()
    const availableDirectors = view.pools
      .find((p) => p.role === 'director')!
      .candidates.filter((c) => c.available)
    expect(availableDirectors.map((c) => c.talentId)).toContain(hire.talentId)
  })
})
