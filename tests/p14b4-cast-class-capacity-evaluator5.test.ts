// tests/p14b4-cast-class-capacity-evaluator5.test.ts — EVALUATOR-5 kernel-vocabulary case.
// Record 600 (2026-09-21, Owner ruling on 578, D1 (a)) §3 step 2(b): evaluator 4 is the
// class-aware scalar (class-restricted fixed-seat paths + shared residual capacity); the
// bounded joint certificate, UNCERTIFIED→FRAGILE and "not a guessed scalar maximum" are
// evaluator-5 law. The one live case below moved VERBATIM out of
// tests/p14b4-cast-class-capacity.test.ts (:279-288 at HEAD 5e6ac5dc) because the scalar
// cannot answer it: `activePromiseReservations` filters by beneficiary, so the antagonist
// person's bound lead-class claim is invisible to the SUPPORT target's read (537-A §3,
// 537-C Q2.1). By paper the evaluator-4 scalar returns FRAGILE 'the schedule leaves no spare
// picture inside the window' there; the expectation IMPOSSIBLE is the joint certificate.
//
// DISPOSITION: a LIVE it(...), executable, and a DESIGNATED failure until evaluator 5 lands.
// Today it stops at strict live V29 refusing `predicate.kind` inside shortVariants (536 stop
// point); after the coordinated cutover it stops at the IMPOSSIBLE assertion. A writer never
// rewrites it; test-author reconciles it from evidence when evaluator 5 is designed. The
// `pureRead` pin stays the copied `rulesVersion 4` so the post-cutover failure lands on the
// classification, not on a version literal for an evaluator nobody has designed (537 §3 (a):
// "the capacity pin moves at 5"; D2 (i-c): revisit only when evaluator 5 is designed).
// Helpers are COPIED, not imported: importing the live test file would register its cases
// here and couple the two files' failure sets. Same fixture world, same seed, same weeks.
// Authority: B4 plan (record-600 amendment) and 600 §2; no cap, fixture or timeout moves.
import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { applyActions, hiringMarketIds, tick } from '../src/core/index.js'
import { advancePromisesWeek, attachPromise, promiseFeasibility, type PromiseDraft } from '../src/core/promises.js'
import { currentProposals, submitProposal } from '../src/core/talentMarket.js'
import { makeSave } from '../src/core/save.js'
import { TUNING } from '../src/core/tuning.js'
import type { CastSlot, GameState, ProfessionalPromise } from '../src/core/types.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './helpers/p14b2-fixtures.js'
const SLOTS = ['lead', 'antagonist', 'support'] as const
const CLASSES = ['lead', 'leadOrAntagonist'] as const
type SeatClass = typeof CLASSES[number]
const p1 = (count = 1) => ({ family: 'APPEARANCE_COUNT' as const, predicate: { count } })
const p2 = (seatClass: SeatClass, count = 1) => ({
  family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' as const,
  predicate: { kind: 'castRoleCount' as const, count, seatClass },
})
type Material = ReturnType<typeof p1> | ReturnType<typeof p2>
type World = {
  opened: GameState; bound: GameState; ready: GameState
  actors: Record<CastSlot, string>; ids: Record<CastSlot, string>
  productionId: string; projects: readonly string[]
}

function live(state: GameState): GameState {
  // The governed strict live writer admits actual fixture facts before probing.
  // Save-version pins belong to the separate boundary tests, not fixture setup.
  return makeSave(state).state
}
function root(state: GameState, id: string): ProfessionalPromise {
  const rows = state.promises.filter((p) => p.promiseId === id)
  expect(rows).toHaveLength(1)
  return rows[0]!
}
function currentRoot(state: GameState, personId: string): ProfessionalPromise {
  const proposal = currentProposals(state, personId).find((p) => p.issuerStudioId === player(state))
  assert.ok(proposal)
  expect(proposal.promises).toHaveLength(1)
  return root(state, proposal.promises[0]!)
}
function sign(state: GameState, role: 'actor' | 'writer' | 'director' | 'craft', termWeeks: number) {
  for (let steps = 0; steps < 60; steps++) {
    const person = hiringMarketIds(state, state.market.tick).map((id) => state.talent.find((p) => p.id === id))
      .find((p) => p?.role === role)
    if (person !== undefined) return { state: applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks }]), id: person.id }
    state = tick(state)
  }
  throw new Error('UNEXECUTED fixture: no lawful hireable ' + role + ' within60 ticks')
}
function readyScript(state: GameState, writerId: string, conceptId: string) {
  const concept = state.concepts.find((c) => c.id === conceptId)!
  const oldIds = new Set(state.scriptDevelopment.projects.map((p) => p.id))
  state = applyActions(state, [{ kind: 'commissionScript', project: {
    conceptId, writerId, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
  } }])
  const minted = state.scriptDevelopment.projects.filter((p) => !oldIds.has(p.id))
  expect(minted).toHaveLength(1) // actual admission, not a queued request counted as a picture
  const projectId = minted[0]!.id
  expect(minted[0]!.status).toBe('drafting')
  expect(minted[0]!.dueWeek).not.toBeNull()
  for (let steps = 0; state.scriptDevelopment.projects.find((p) => p.id === projectId)!.status !== 'review'; steps++) {
    if (steps >= 20) throw new Error('UNEXECUTED fixture: actual screenplay never reached Review within20 ticks')
    state = tick(state)
  }
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  expect(state.scriptDevelopment.projects.find((p) => p.id === projectId)).toMatchObject({
    status: 'ready', productionId: null, reservation: null,
  })
  expect(state.scriptDevelopment.projects.find((p) => p.id === projectId)!.assessment).not.toBeNull()
  return { state, projectId }
}
let cached: World | undefined
function world(): World {
  if (cached !== undefined) return structuredClone(cached)
  let state = fund(p13aGeneratedStudio())
  const lead = sign(state, 'actor', 52); state = lead.state
  const antagonist = sign(state, 'actor', 52); state = antagonist.state
  const support = sign(state, 'actor', 52); state = support.state
  const writer = sign(state, 'writer', 208); state = writer.state
  const director = sign(state, 'director', 208); state = director.state
  const craft = sign(state, 'craft', 208); state = craft.state
  const actors = { lead: lead.id, antagonist: antagonist.id, support: support.id }
  expect(new Set([...Object.values(actors), writer.id, director.id, craft.id]).size).toBe(6)
  for (const id of Object.values(actors)) expect(state.talent.find((p) => p.id === id)!.skills.acting).toBeDefined()
  const starts = Object.values(actors).map((id) => state.contracts.find((c) => c.talentId === id)!.endWeekExclusive)
  expect(new Set(starts).size).toBe(1)
  const start = starts[0]!
  expect(state.studio.activeProductions).toEqual([])
  expect(state.operations.mode).toBe('managed')
  if (state.scriptDevelopment.mode === 'legacy') state = applyActions(state, [{ kind: 'activateScriptDevelopment' }])
  expect(state.scriptDevelopment.mode).toBe('managed')
  expect(state.scriptDevelopment.projects).toEqual([])
  const concepts = state.concepts.slice(0, 2)
  expect(concepts).toHaveLength(2)
  const first = readyScript(state, writer.id, concepts[0]!.id); state = first.state
  const second = readyScript(state, writer.id, concepts[1]!.id); state = second.state
  const stage = 'facility-soundstage-07'
  const mounted = state.sets.find((s) => s.mountedOn === stage && s.status !== 'retired')
  if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
  state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: stage } }])
  state = advanceTo(state, state.market.tick + TUNING.SET_BUILD_WEEKS_BAND_HIGH)
  expect(state.market.tick).toBeLessThanOrEqual(start - 7)
  state = advanceTo(state, start - 7)
  for (const id of Object.values(actors)) {
    state = submitProposal(state, { talentId: id, issuerStudioId: player(state), termWeeks: 52, premiumTier: 1.25 })
  }
  const opened = structuredClone(state)
  const ids: Record<CastSlot, string> = { lead: '', antagonist: '', support: '' }
  for (const slot of SLOTS) {
    state = attachPromise(state, actors[slot], player(state), {
      ...p1(), windowStartWeek: start, dueWeekExclusive: start + 52,
    })
    const promised = currentRoot(state, actors[slot])
    expect(promised.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE')
    ids[slot] = promised.promiseId
  }
  state = advanceTo(state, start)
  for (const slot of SLOTS) {
    const promised = root(state, ids[slot])
    expect(promised).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [] })
    assert.notEqual(promised.contractId, null)
    const employment = state.hollywood!.employment.find((e) => e.contractId === promised.contractId)
    expect(employment).toMatchObject({ studioId: player(state), terms: { talentId: actors[slot], startWeek: start } })
    expect(state.talentMarket.receipts).toContainEqual(expect.objectContaining({
      kind: 'settled', week: start, studioId: player(state), talentId: actors[slot],
    }))
    expect(currentProposals(state, actors[slot])).toEqual([])
  }
  const bound = live(state)
  state = applyActions(state, [{ kind: 'greenlightScriptProject', production: {
    projectId: first.projectId, directorId: director.id, craftIds: [craft.id], cast: actors,
    budget: { negative: concepts[0]!.baseNegativeCost, marketing: 0 },
  } }])
  const film = state.studio.activeProductions.at(-1)
  assert.ok(film, 'UNEXECUTED fixture: greenlight was not actually admitted')
  expect(state.studio.activeProductions).toHaveLength(1)
  expect(state.scriptDevelopment.projects.find((p) => p.id === first.projectId)).toMatchObject({
    status: 'inProduction', productionId: film.id,
  })
  state = tick(tick(tick(state)))
  const rehearsal = state.operations.workflows.find((w) => w.productionId === film.id)
  assert.ok(rehearsal)
  expect(rehearsal.phase).toBe('rehearsal')
  state = applyActions(state, [{ kind: 'setProductionSetupRecipe', productionId: film.id,
    recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: rehearsal.planRevision }])
  for (let steps = 0; state.studio.activeProductions.find((p) => p.id === film.id)!.remainingTicks !== 5; steps++) {
    if (steps >= 40) throw new Error('UNEXECUTED fixture: actual managed film never reached first Shooting week within40 ticks')
    state = tick(state)
  }
  state = applyActions(state, [{ kind: 'assignShootingDirector', productionId: film.id, directorId: director.id }])
  for (let steps = 0; state.operations.workflows.find((w) => w.productionId === film.id)!.shootingTask?.status !== 'ready'; steps++) {
    if (steps >= 6) throw new Error('UNEXECUTED fixture: physical scenery did not arrive within6 actual ticks; no manual bypass')
    expect(state.studio.activeProductions.find((p) => p.id === film.id)!.remainingTicks).toBe(5)
    expect(state.firstTakes.filter((t) => t.productionId === film.id)).toEqual([])
    state = tick(state)
  }
  state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: film.id }])
  expect(state.operations.workflows.find((w) => w.productionId === film.id)).toMatchObject({
    phase: 'shooting', blocker: null, shootingTask: { status: 'scheduled' },
  })
  expect(state.firstTakes.filter((t) => t.productionId === film.id)).toEqual([])
  expect(state.studio.activeProductions.find((p) => p.id === film.id)!.cast).toEqual(actors)
  expect(state.scriptDevelopment.projects.find((p) => p.id === second.projectId)!.status).toBe('ready')
  for (const slot of SLOTS) {
    const promised = root(state, ids[slot])
    const employment = state.hollywood!.employment.find((e) => e.contractId === promised.contractId)!
    expect(employment.terms.endWeekExclusive).toBeGreaterThan(state.market.tick + 2)
    expect(promised.outcome).toBeNull()
  }
  cached = { opened: live(opened), bound, ready: live(state), actors, ids,
    productionId: film.id, projects: [first.projectId, second.projectId] }
  return structuredClone(cached)
}
function pureRead(state: GameState, draft: PromiseDraft) {
  const before = structuredClone(state), terms = structuredClone(draft)
  const result = promiseFeasibility(state, draft, state.market.tick)
  expect(state).toEqual(before)
  expect(draft).toEqual(terms)
  expect(result.rulesVersion).toBe(4)
  expect(result.week).toBe(state.market.tick)
  return result
}
function shortVariants(w: World, material: Record<CastSlot, Material>): GameState {
  // LABELED in-memory outcome/capacity-owner probe, not authored commitment history:
  // only material on three ACTUAL bound OPEN roots changes. No receipt/contract/
  // production/cast/take is invented. Future strict writer must admit it first.
  const original = JSON.stringify(w.ready)
  const changes = new Map(SLOTS.map((slot) => [w.ids[slot], material[slot]]))
  const state = live({ ...structuredClone(w.ready), promises: w.ready.promises.map((p) => {
    const chosen = changes.get(p.promiseId)
    return chosen === undefined ? structuredClone(p) : { ...structuredClone(p), ...chosen,
      windowStartWeek: w.ready.market.tick, dueWeekExclusive: w.ready.market.tick + 2 }
  }) })
  expect(state.hollywood!.employment).toEqual(w.ready.hollywood!.employment)
  expect(state.talentMarket).toEqual(w.ready.talentMarket)
  expect(state.firstTakes).toEqual(w.ready.firstTakes)
  for (const slot of SLOTS) {
    expect(root(state, w.ids[slot]).feasibilityReceipt).toEqual(root(w.ready, w.ids[slot]).feasibilityReceipt)
    expect(root(state, w.ids[slot]).contractId).toBe(root(w.ready, w.ids[slot]).contractId)
  }
  expect(JSON.stringify(w.ready)).toBe(original)
  return state
}
function shortDraft(w: World, state: GameState, slot: CastSlot): PromiseDraft {
  const promised = root(state, w.ids[slot])
  return { family: promised.family, predicate: promised.predicate, issuerStudioId: promised.issuerStudioId,
    beneficiaryPersonId: promised.beneficiaryPersonId, promiseId: promised.promiseId,
    startWeek: promised.windowStartWeek, termWeeks: 2,
    windowStartWeek: promised.windowStartWeek, dueWeekExclusive: promised.dueWeekExclusive }
}

describe('P14B4 evaluator-5 kernel vocabulary (record 600 §3 2(b)): the joint certificate the scalar cannot issue', () => {
  it('a conflicting fixed lead claim makes the joint offer impossible, not a target-specific BROKEN winner choice', () => {
    const w = world()
    const state = shortVariants(w, { lead: p2('lead'), antagonist: p2('lead'), support: p1() })
    expect(pureRead(state, shortDraft(w, state, 'support')).classification).toBe('IMPOSSIBLE')
    // The support person's own physical predicate still has the actual next take.
    // Never resolve that joint conflict by marking some bound beneficiary broken.
    const repeated = advancePromisesWeek(state)
    expect(repeated.promises).toEqual(state.promises)
    expect(repeated.talentMarket.receipts).toEqual(state.talentMarket.receipts)
  })

  it.todo('evaluator 5: a FRAGILE fixed-cast read carries a CERTIFIED bottleneck from a complete-domain bounded search, never the UNCERTIFIED string \'bounded capacity analysis could not certify this schedule\' as a guessed scalar maximum (plan feasibility contract; 537-C Q2.2; the three `bottleneck !== UNKNOWN_CAP` lines in the live file hold at evaluator 4 only by construction)')
})
