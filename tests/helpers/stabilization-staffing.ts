// Stabilization 2026-10-22: one staffing helper for the constructed-witness tests on the
// week-130 capture (L-04, L-05).
import { applyActions } from '../../src/core/actions.js'
import { assignmentRefusal } from '../../src/core/careerLifecycle.js'
import { busyTalentIds, hiringMarketIds } from '../../src/core/employment.js'
import { studioEmployerId } from '../../src/core/hollywood.js'
import type { GameState } from '../../src/core/types.js'

export type StaffRole = 'writer' | 'director' | 'actor' | 'craft'

/** Signs `count` people of one role from the hiring market (D-11.12: an engaged picture seats
 * contracted people or available freelancers; the week-130 capture's free people are neither).
 * When the market holds too few of a role, a real creator (`createTalent`, the 1368 route) adds one. */
export function signRole(state: GameState, role: StaffRole, count: number, used: Set<string>): { state: GameState; ids: string[] } {
  const ids: string[] = []
  const take = (id: string) => {
    state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 52 }])
    ids.push(id)
    used.add(id)
  }
  // One pick per pass from the CURRENT market: a signing re-slices the hiring market, so a list
  // read once goes stale (`signContract` refuses D-11.14). The market can also list a person the
  // one availability set still holds (the L-04 class); the slate and the gate refuse them, so skip.
  for (;;) {
    if (ids.length === count) break
    const busy = busyTalentIds(state)
    const id = hiringMarketIds(state).find((candidate) => {
      const person = state.talent.find((t) => t.id === candidate)!
      return person.role === role && !used.has(candidate) && !busy.has(candidate) && studioEmployerId(state, candidate) === null
        && (role === 'writer' || assignmentRefusal(state, candidate, state.market.tick, role) === null)
    })
    if (id === undefined) break
    take(id)
  }
  while (ids.length < count) {
    state = applyActions(state, [{ kind: 'createTalent', talent: {
      name: `Stabilization ${role} ${String(ids.length)}`, role, age: 40,
      actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55,
    } }])
    take(state.talent.at(-1)!.id)
  }
  return { state, ids }
}
