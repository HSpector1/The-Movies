// ── Test helper: found a studio (D-11) ───────────────────────────────────────
// Phase 5.2A makes `newGame(seed)` open the FOUNDING DRAFT (state.founding !== null):
// the player must hire an initial roster before the studio can staff films. Most
// component/integration tests need an already-FOUNDED studio (a roster in place) so
// they can assemble a film. `newFoundedGame(seed)` provides exactly that — a founded
// GameState with a generous, deterministic roster (enough for TWO concurrent films
// plus freelancers), signed from the deterministic applicant pool.
//
// This is TEST-ONLY setup. It uses only the public adapter surface (the same actions
// the UI dispatches), so it exercises the real employment path — it does not fabricate
// state. The assertions in each test are unchanged; only the game is founded first.

import {
  newGame,
  foundingApplicantCards,
  signContractAction,
  foundStudioAction,
} from '../engine/adapter.ts'
import type { GameState, CreativeRole } from '../engine/adapter.ts'

// How many of each role to sign at founding. Above the required minimums (5/1/2/1)
// so tests can stage two concurrent productions and still have bench + freelancers.
const FOUND_ROSTER: Record<CreativeRole, number> = {
  actor: 8,
  director: 2,
  writer: 3,
  craft: 2,
}

// A founded studio for `seed`: opens founding, signs the roster above from the
// deterministic applicant pool, and closes founding. Deterministic per seed.
export function newFoundedGame(seed: string, termWeeks = 104): GameState {
  let s = newGame(seed)
  const cards = foundingApplicantCards(s)
  const pickIds = (role: CreativeRole, n: number): string[] =>
    cards
      .filter((c) => c.profile.role === role)
      .slice(0, n)
      .map((c) => c.profile.id)
  const toSign: string[] = [
    ...pickIds('actor', FOUND_ROSTER.actor),
    ...pickIds('director', FOUND_ROSTER.director),
    ...pickIds('writer', FOUND_ROSTER.writer),
    ...pickIds('craft', FOUND_ROSTER.craft),
  ]
  for (const id of toSign) {
    const r = signContractAction(s, id, termWeeks)
    if (!r.ok) throw new Error(`newFoundedGame: signing ${id} failed — ${r.error}`)
    s = r.next
  }
  const f = foundStudioAction(s)
  if (!f.ok) throw new Error(`newFoundedGame: foundStudio failed — ${f.error}`)
  return f.next
}

// The ids the roster was signed with, for tests that need a specific roster member.
export function foundedRosterIds(state: GameState, role: CreativeRole): string[] {
  return state.contracts.map((c) => c.talentId).filter((id) => {
    const t = state.talent.find((x) => x.id === id)
    return t?.role === role
  })
}
