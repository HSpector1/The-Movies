// C.2c independent fixtures (823, 773 §10). Every default dated fact below comes
// from real create/sign/propose/attach/greenlight/tick routes. These are disposable
// generated campaigns, never a rewrite or re-mint of the outgoing corpus.
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { attachPromise } from '../../src/core/promises.js'
import { makeSave, validateSaveV36 } from '../../src/core/save.js'
import { currentProposals, submitProposal } from '../../src/core/talentMarket.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../../src/harness/p13a/fixtures.js'
import type { Action, CastSlot, CreativeRole, GameState, ProfessionalPromise } from '../../src/core/types.js'
import { fund } from './p14b2-fixtures.js'

export { advanceTo, tick }
export const C2C = { announcement: 104, effective: 156, lastAdmission: 147, cutoff: 148, due: 156 } as const
const STAGE = 'facility-soundstage-07'
export const owner = (state: GameState): string => state.hollywood!.playerStudioId

export function promiseById(state: GameState, id: string): ProfessionalPromise {
  const rows = state.promises.filter((p) => p.promiseId === id)
  expect(rows, `fixture premise: one promise ${id}`).toHaveLength(1)
  return rows[0]!
}

export function savedState(state: GameState): GameState {
  const written = makeSave(state)
  return validateSaveV36(JSON.parse(JSON.stringify(written))).state
}

export type C2cFixture = {
  submitted: GameState
  bound: GameState
  beforeAnnouncement: GameState
  announced: GameState
  lastAdmission: GameState
  actorId: string
  directorId: string
  writerId: string
  craftId: string
  antagonistId: string
  supportId: string
  promiseId: string
}
let cached: C2cFixture | undefined

/** One cached immutable source; each caller receives a detached campaign. The
 * retiring actor starts at 68, binds the renewal at 52, and turns 70 at 104.
 * An initial age 69 would announce at renewal week 52 and invalidate the offer,
 * so it is deliberately NOT used. [52,156) is the REAL carrying interval. */
export function c2cFixture(): C2cFixture {
  if (cached !== undefined) return structuredClone(cached)
  let state = fund(p13aGeneratedStudio('p14c2c-retirement-promises-01'))
  const roster: readonly { name: string; role: CreativeRole; age: number; termWeeks: number }[] = [
    { name: 'C2c Retiring Actor', role: 'actor', age: 68, termWeeks: 52 },
    { name: 'C2c Director', role: 'director', age: 40, termWeeks: 208 },
    { name: 'C2c Writer', role: 'writer', age: 40, termWeeks: 208 },
    { name: 'C2c Craft', role: 'craft', age: 40, termWeeks: 208 },
    { name: 'C2c Antagonist', role: 'actor', age: 30, termWeeks: 208 },
    { name: 'C2c Support', role: 'actor', age: 30, termWeeks: 208 },
  ]
  const ids: string[] = []
  for (const person of roster) {
    state = applyActions(state, [{ kind: 'createTalent', talent: {
      name: person.name, role: person.role, age: person.age,
      actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55,
    } }])
    const id = state.talent.find((p) => p.name === person.name)!.id
    ids.push(id)
    state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: person.termWeeks }])
  }
  const [actorId, directorId, writerId, craftId, antagonistId, supportId] = ids as [string, string, string, string, string, string]
  const mounted = state.sets.find((s) => s.mountedOn === STAGE && s.status !== 'retired')
  if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
  state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } }])
  state = advanceTo(state, TUNING.SET_BUILD_WEEKS_BAND_HIGH)
  state = advanceTo(state, 45)
  state = submitProposal(state, { talentId: actorId, issuerStudioId: owner(state), termWeeks: 104, premiumTier: 1.25 })
  expect(currentProposals(state, actorId).find((p) => p.issuerStudioId === owner(state))).toMatchObject({ startWeek: 52, termWeeks: 104 })
  const submitted = attachPromise(state, actorId, owner(state), {
    family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: 1, seatClass: 'lead' },
    windowStartWeek: 52, dueWeekExclusive: 156,
  })
  const promiseId = submitted.promises.at(-1)!.promiseId
  const bound = advanceTo(submitted, 52)
  const promise = promiseById(bound, promiseId)
  expect(promise.contractId, 'fixture premise: the real renewal must WIN, not merely carry an unaccepted promise').not.toBeNull()
  expect(bound.hollywood!.employment.find((e) => e.contractId === promise.contractId)).toMatchObject({
    studioId: owner(bound), terms: { talentId: actorId, startWeek: 52, endWeekExclusive: 156 },
  })
  expect(promise.outcome).toBeNull()
  expect(retirementRecordFor(bound, actorId)).toBeUndefined()
  const beforeAnnouncement = advanceTo(bound, 103)
  const announced = tick(beforeAnnouncement)
  expect(retirementRecordFor(announced, actorId)).toMatchObject({
    announcedWeek: 104, ageAtAnnouncement: 70, effectiveWeek: 156, status: 'announced', cause: 'hardBoundary',
  })
  const lastAdmission = advanceTo(announced, 147)
  savedState(lastAdmission)
  cached = { submitted, bound, beforeAnnouncement, announced, lastAdmission, actorId, directorId, writerId, craftId,
    antagonistId, supportId, promiseId }
  return structuredClone(cached)
}

/** Clearly labelled SYNTHETIC predicate/window variant of a real bound record.
 * No invented contract, first take, progress or outcome. The live writer must
 * accept the WHOLE variant before it can be used as an isolated test premise. */
export function withPromiseVariant(
  state: GameState, promiseId: string,
  changes: Partial<Pick<ProfessionalPromise, 'family' | 'predicate' | 'windowStartWeek' | 'dueWeekExclusive'>>,
): GameState {
  const base = promiseById(state, promiseId)
  expect(base.outcome, 'only OPEN fixture records may receive a declared predicate variant').toBeNull()
  return savedState({ ...state, promises: state.promises.map((p) => p.promiseId === promiseId
    ? { ...p, ...changes } as ProfessionalPromise : p) })
}

export function greenlightAction(f: C2cFixture, state: GameState, actorSlot: CastSlot = 'lead'): Action {
  const concept = state.concepts.find((c) => !state.studio.activeProductions.some((p) => p.conceptId === c.id)
    && !state.studio.releasedFilms.some((film) => film.conceptId === c.id))!
  const cast: Record<CastSlot, string> = { lead: f.actorId, antagonist: f.antagonistId, support: f.supportId }
  if (actorSlot !== 'lead') [cast.lead, cast[actorSlot]] = [cast[actorSlot], cast.lead]
  return { kind: 'greenlight', production: {
    conceptId: concept.id, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5],
    } },
    writerId: f.writerId, directorId: f.directorId, cast, craftIds: [f.craftId],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  } }
}

/** Real greenlight at the caller's current week, followed by managed production
 * and shooting scheduling. The production keeps its real default setup:null;
 * no optional multiweek setup recipe is commissioned. No clock/take is forged. */
export function toScheduledTake(f: C2cFixture, start: GameState, actorSlot: CastSlot = 'lead') {
  let state = applyActions(start, [greenlightAction(f, start, actorSlot)])
  const productionId = state.studio.activeProductions.at(-1)!.id
  state = tick(tick(tick(state)))
  const rehearsal = state.operations.workflows.find((w) => w.productionId === productionId)!
  expect(rehearsal.phase, 'fixture premise: the real picture must reach rehearsal').toBe('rehearsal')
  expect(rehearsal.setup).toBeNull()
  for (let steps = 0; state.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks !== 5; steps++) {
    if (steps >= 40) throw new Error('C2c fixture: real production did not reach its first shooting boundary within 40 ticks')
    state = tick(state)
  }
  expect(state.firstTakes.some((take) => take.productionId === productionId)).toBe(false)
  state = applyActions(state, [
    { kind: 'assignShootingDirector', productionId, directorId: f.directorId },
    { kind: 'scheduleShootingTake', productionId },
  ])
  expect(state.operations.workflows.find((w) => w.productionId === productionId)!.shootingTask?.status).toBe('scheduled')
  return { state, productionId }
}

export function ownOutcomeReceipt(state: GameState, promiseId: string) {
  const promise = promiseById(state, promiseId)
  expect(promise.outcomeEventId).not.toBeNull()
  const receipts = state.talentMarket.receipts.filter((r) => r.eventId === promise.outcomeEventId)
  expect(receipts).toHaveLength(1)
  expect(receipts[0]).toMatchObject({ kind: 'promiseOutcome', week: promise.outcomeWeek,
    talentId: promise.beneficiaryPersonId, studioId: promise.issuerStudioId })
  return receipts[0]!
}
