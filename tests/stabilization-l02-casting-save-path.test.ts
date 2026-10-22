// Stabilization 2026-10-22, audit finding L-02 (PEOPLE-01), the save path.
//
// The independent review of the first L-02 repair found that the relaxed slate law reached the
// tick and the actions but not `makeSave`: the frozen V10 validator (reached by every live save
// through the era chain) kept the strict "primary Actor today" rule, so a campaign with a
// recorded actor→director change of a review/complete candidate played on but could not be
// saved. The recorded profession history now travels down the chain like `retirementWriting`.
//
// This witness is natural: the genuine C.3 campaign (tests/helpers/p14c3-dual-extension-fixtures,
// subject `authored-0000`, an Actor contracted 208–260 who retires from acting at 260 and
// becomes a Director through a real transition evaluation). Between 208 and 260 the player runs
// one casting session that slates the subject and acknowledges it; at 260 the transition rewrites
// the role; the session's slate is history and every later save must admit.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds } from '../src/core/employment.js'
import { professionAtWeek } from '../src/core/professionTransitions.js'
import { prepareLiveWritingContext } from '../src/core/liveRetirementWriting.js'
import { exportSave, importSave, makeSave, validatedLiveProfessionContext } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { CastingSlate, GameState } from '../src/core/types.js'
import { actorSettlement } from './helpers/p14c3-dual-extension-fixtures.js'
import { FOCUS, person } from './helpers/p14c3-fixtures.js'
import { signRole } from './helpers/stabilization-staffing.js'

const SUBJECT = FOCUS.director
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const
const RANGES = { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] }

function advanceTo(state: GameState, week: number): GameState {
  while (state.market.tick < week) state = tick(state, { develop: true })
  return state
}
/** The player's contracted people of one role who are free to be slated (not seated, drafting or researching). */
function roster(state: GameState, role: string): string[] {
  const busy = busyTalentIds(state)
  return state.contracts.map((c) => c.talentId).filter((id) => person(state, id).role === role && !busy.has(id))
}
describe('L-02 on the save path: a recorded profession change of an acknowledged slate candidate saves', () => {
  let complete: GameState, changed: GameState, sessionId: string
  beforeAll(() => {
    let s = actorSettlement('director')
    expect(s.market.tick).toBe(208)
    expect(person(s, SUBJECT)).toMatchObject({ role: 'actor' })
    expect(busyTalentIds(s).has(SUBJECT), 'premise: the subject is free to be slated at 208').toBe(false)
    const used = new Set<string>([SUBJECT])
    const writer = signRole(s, 'writer', 1, used); s = writer.state
    // Three more slate actors signed now, at 208, from the market's free people; whoever is still
    // free when the session starts is slated (the engine's own busy set decides, that week).
    const others = roster(s, 'actor').filter((id) => id !== SUBJECT && id !== FOCUS.writer)
    const more = signRole(s, 'actor', Math.max(0, 3 - others.length), used); s = more.state
    const signedActors = [...others, ...more.ids]
    s = applyActions(s, [{ kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
    const concept = s.concepts[0]!
    s = applyActions(s, [{ kind: 'commissionScript', project: {
      conceptId: concept.id, writerId: writer.ids[0]!, shape: SHAPE, promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: RANGES },
    } }])
    const projectId = s.scriptDevelopment.projects.at(-1)!.id
    for (let n = 0; s.scriptDevelopment.projects.find((p) => p.id === projectId)!.status !== 'review'; n++) {
      if (n >= 30) throw new Error('route premise: the draft did not reach review within 30 ticks')
      s = tick(s, { develop: true })
    }
    s = applyActions(s, [{ kind: 'acceptScript', projectId }])
    // The slate is drawn from the people free at THIS week (the engine's own busy set), not at 208.
    expect(busyTalentIds(s).has(SUBJECT), 'premise: the subject is free to be slated').toBe(false)
    const busyNow = busyTalentIds(s)
    const actors = signedActors.filter((id) => !busyNow.has(id)).slice(0, 3)
    expect(actors, 'premise: three signed actors are free when the session starts').toHaveLength(3)
    const [a, b, c] = actors as [string, string, string]
    const slate: CastingSlate = { lead: [SUBJECT, a], antagonist: [b, c], support: [c, SUBJECT] }
    s = applyActions(s, [{ kind: 'startCastingSession', session: { projectId, slate } }])
    sessionId = s.castingSessions.sessions.find((x) => x.projectId === projectId)!.id
    for (let n = 0; s.castingSessions.sessions.find((x) => x.id === sessionId)!.status !== 'review'; n++) {
      if (n >= 30) throw new Error('route premise: the session did not reach review within 30 ticks')
      s = tick(s, { develop: true })
    }
    complete = applyActions(s, [{ kind: 'acknowledgeCastingSession', sessionId }])
    expect(complete.market.tick).toBeLessThan(260)
    changed = advanceTo(complete, 261)
  }, 120_000)

  it('premise: the acknowledged session names the subject, who was an Actor when it started and is a Director now', () => {
    const session = complete.castingSessions.sessions.find((x) => x.id === sessionId)!
    expect(session.status).toBe('complete')
    expect([...session.slate.lead, ...session.slate.support]).toContain(SUBJECT)
    expect(person(complete, SUBJECT).role).toBe('actor')
    expect(person(changed, SUBJECT).role).toBe('director')
    expect(changed.careerLifecycle.professionChanges.filter((row) => row.personId === SUBJECT))
      .toEqual([expect.objectContaining({ week: 260, from: 'actor', to: 'director' })])
    expect(professionAtWeek(changed, SUBJECT, session.startedWeek)).toBe('actor')
    expect(changed.castingSessions.sessions.find((x) => x.id === sessionId)).toMatchObject({ status: 'complete' })
  })

  it('every save after the change admits and round-trips (the frozen V10 check reads the recorded history)', () => {
    expect(() => makeSave(changed)).not.toThrow()
    // The validated live profession context is the chain the retirement-writing authority runs
    // when its gate trips (liveRetirementWriting.ts turns a failure there into 'rejected'). On
    // this world the gate does not trip (kind 'legacy'), so the chain is asserted directly.
    expect(prepareLiveWritingContext(changed).kind).toBe('legacy')
    expect(() => validatedLiveProfessionContext(changed)).not.toThrow()
    const reloaded = importSave(exportSave(makeSave(changed))).state as GameState
    expect(reloaded.market.tick).toBe(changed.market.tick)
    expect(person(reloaded, SUBJECT).role).toBe('director')
    const later = tick(changed, { develop: true })
    expect(() => makeSave(later)).not.toThrow()
  })
})
