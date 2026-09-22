// P14B.2 fixtures: live actions and generated receipts, never hand-bound promises.
// The sole economic bootstrap is explicit cash with an equal ledger entry.
import { expect } from 'vitest'
import { applyActions, hiringMarketIds, tick } from '../../src/core/index.js'
import { attachPromise, trustDescriptor, trustDrivers } from '../../src/core/promises.js'
import { caseForTalent, currentProposals, publicPreferredTerm, submitProposal, withdrawProposal } from '../../src/core/talentMarket.js'
import { makeSave, validateSaveV31 } from '../../src/core/save.js'
import { TUNING } from '../../src/core/tuning.js'
import type { CastSlot, GameState, ProfessionalPromise, SegmentId } from '../../src/core/types.js'
import { advanceTo, p13aGeneratedStudio } from '../../src/harness/p13a/fixtures.js'

export { advanceTo, p13aGeneratedStudio }
export const clone = <T>(value: T): T => structuredClone(value)
export const player = (state: GameState): string => state.hollywood!.playerStudioId
export function fund(state: GameState): GameState {
  const delta = 30_000_000 - state.studio.cash
  return { ...state, studio: { ...state.studio, cash: 30_000_000 }, ledger: [...state.ledger,
    { week: state.market.tick, kind: delta > 0 ? 'studioRevenue' : 'overhead', amount: delta, note: 'P14B.2 fixture disclosed cash bootstrap' }] }
}
function sign(state: GameState, role: 'actor' | 'writer' | 'director' | 'craft', termWeeks = 208) {
  for (let i = 0; i < 60; i++) {
    const person = hiringMarketIds(state, state.market.tick).map((id) => state.talent.find((p) => p.id === id)).find((p) => p?.role === role)
    if (person !== undefined) return { state: applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks }]), id: person.id }
    state = tick(state)
  }
  throw new Error(`P14B.2 fixture: no signable ${role}`)
}
export function promiseFor(state: GameState, talentId: string, studioId = player(state)): ProfessionalPromise {
  const result = [...state.promises].reverse().find((p) => p.beneficiaryPersonId === talentId && p.issuerStudioId === studioId)
  if (result === undefined) throw new Error('P14B.2 fixture: missing promise')
  return result
}
export function proposePromise(state: GameState, talentId: string, studioId = player(state)): GameState {
  state = submitProposal(state, { talentId, issuerStudioId: studioId, termWeeks: 52, premiumTier: 1.25 })
  const proposal = currentProposals(state, talentId).find((p) => p.issuerStudioId === studioId)!
  return attachPromise(state, talentId, studioId, { family: 'APPEARANCE_COUNT', predicate: { count: 1 },
    windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + 40 })
}
export function assertBinding(state: GameState, promise: ProfessionalPromise): void {
  if (promise.contractId === null) console.log('unbound fixture diagnostic', JSON.stringify({ promise,
    receipts: state.talentMarket.receipts.filter((r) => r.talentId === promise.beneficiaryPersonId) }))
  expect(promise.contractId).not.toBeNull()
  const employment = state.hollywood!.employment.find((e) => e.contractId === promise.contractId)
  expect(employment).toBeDefined()
  expect(employment!.studioId).toBe(promise.issuerStudioId)
  expect(employment!.terms.talentId).toBe(promise.beneficiaryPersonId)
  expect(employment!.terms.startWeek).toBe(promise.windowStartWeek)
  expect(state.talentMarket.receipts.some((r) => r.kind === 'settled' && r.talentId === promise.beneficiaryPersonId
    && r.studioId === promise.issuerStudioId && r.week === promise.windowStartWeek)).toBe(true)
  expect(currentProposals(state, promise.beneficiaryPersonId)).toEqual([])
}
export function assertOutcome(state: GameState, promise: ProfessionalPromise): void {
  const receipts = state.talentMarket.receipts.filter((r) => r.eventId === promise.outcomeEventId)
  expect(receipts).toHaveLength(1)
  expect(receipts[0]).toMatchObject({ kind: 'promiseOutcome', talentId: promise.beneficiaryPersonId,
    studioId: promise.issuerStudioId, week: promise.outcomeWeek })
}

export type RetentionFixture = { submitted: GameState; bound: GameState; scheduled: GameState; kept: GameState;
  outcomes: GameState; keptId: string; brokenId: string; directorId: string; productionId: string }
let retentionCache: RetentionFixture | undefined
export function retentionFixture(): RetentionFixture {
  if (retentionCache !== undefined) return retentionCache
  let state = fund(p13aGeneratedStudio())
  const kept = sign(state, 'actor', 52); state = kept.state
  const broken = sign(state, 'actor', 52); state = broken.state
  const writer = sign(state, 'writer'); state = writer.state
  const director = sign(state, 'director'); state = director.state
  const antagonist = sign(state, 'actor'); state = antagonist.state
  const support = sign(state, 'actor'); state = support.state
  const craft = sign(state, 'craft'); state = craft.state
  const start = state.contracts.find((c) => c.talentId === kept.id)!.endWeekExclusive
  expect(state.contracts.find((c) => c.talentId === broken.id)!.endWeekExclusive).toBe(start)
  const stage = 'facility-soundstage-07'
  const mounted = state.sets.find((s) => s.mountedOn === stage && s.status !== 'retired')
  if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
  state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: stage } }])
  state = advanceTo(state, state.market.tick + TUNING.SET_BUILD_WEEKS_BAND_HIGH)
  state = advanceTo(state, start - 7)
  state = proposePromise(state, kept.id)
  const submitted = proposePromise(state, broken.id)
  const bound = advanceTo(submitted, start)
  for (const id of [kept.id, broken.id]) assertBinding(bound, promiseFor(bound, id))
  state = bound
  const concept = state.concepts[0]!
  const cast: Record<CastSlot, string> = { lead: kept.id, antagonist: antagonist.id, support: support.id }
  state = applyActions(state, [{ kind: 'greenlight', production: {
    conceptId: concept.id, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    writerId: writer.id, directorId: director.id, cast, craftIds: [craft.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  } }])
  const productionId = state.studio.activeProductions.at(-1)!.id
  state = tick(tick(tick(state)))
  const rehearsal = state.operations.workflows.find((w) => w.productionId === productionId)!
  expect(rehearsal.phase).toBe('rehearsal')
  state = applyActions(state, [{ kind: 'setProductionSetupRecipe', productionId, recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: rehearsal.planRevision }])
  for (let count = 0; state.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks !== 5; count++) {
    if (count > 40) throw new Error('P14B.2 fixture: first take not reached')
    state = tick(state)
  }
  state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId: director.id }, { kind: 'scheduleShootingTake', productionId }])
  const scheduled = state
  const workflow = state.operations.workflows.find((w) => w.productionId === productionId)!
  expect(workflow.shootingTask?.status).toBe('scheduled')
  expect(workflow.blocker).toBeNull()
  expect(state.firstTakes.filter((t) => t.productionId === productionId)).toEqual([])
  state = tick(state)
  const keptState = state
  expect(state.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks).toBe(4)
  const take = state.firstTakes.filter((t) => t.productionId === productionId)
  expect(take).toHaveLength(1)
  expect(take[0]!.week).toBe(scheduled.market.tick + 1)
  expect(promiseFor(state, kept.id)).toMatchObject({ outcome: 'SATISFIED', outcomeWeek: take[0]!.week, evidenceRefs: [take[0]!.eventId] })
  expect(promiseFor(state, broken.id).outcome).toBeNull()
  assertOutcome(state, promiseFor(state, kept.id))
  state = applyActions(state, [{ kind: 'releaseTalent', talentId: broken.id }])
  expect(promiseFor(state, broken.id).outcome).toBe('BROKEN')
  assertOutcome(state, promiseFor(state, broken.id))
  expect(trustDrivers(state, kept.id, player(state), state.market.tick).map((d) => d.kind)).toContain('ranToEnd')
  validateSaveV31(JSON.parse(JSON.stringify(makeSave(state))))
  return retentionCache = { submitted, bound, scheduled, kept: keptState, outcomes: state,
    keptId: kept.id, brokenId: broken.id, directorId: director.id, productionId }
}

let historyCache: { open: GameState; withdrawn: GameState; second: GameState; talentId: string; withdrawnId: string } | undefined
export function historyFixture() {
  if (historyCache !== undefined) return historyCache
  const fixture = retentionFixture()
  const first = promiseFor(fixture.outcomes, fixture.keptId)
  const employment = fixture.outcomes.hollywood!.employment.find((e) => e.contractId === first.contractId)!
  const open = advanceTo(fixture.outcomes, employment.terms.endWeekExclusive - 8)
  const proposed = proposePromise(open, fixture.keptId)
  const withdrawnId = promiseFor(proposed, fixture.keptId).promiseId
  const withdrawn = withdrawProposal(proposed, fixture.keptId, player(proposed))
  const second = advanceTo(proposed, employment.terms.endWeekExclusive)
  assertBinding(second, promiseFor(second, fixture.keptId))
  expect(promiseFor(second, fixture.keptId).contractId).not.toBe(first.contractId)
  expect(withdrawn.promises.find((p) => p.promiseId === withdrawnId)!.contractId).toBeNull()
  return historyCache = { open, withdrawn, second, talentId: fixture.keptId, withdrawnId }
}

let poachCache: { submitted: GameState; bound: GameState; beforeDue: GameState; due: GameState; outcome: GameState; talentId: string; incumbentId: string } | undefined
export function poachingFixture() {
  if (poachCache !== undefined) return poachCache
  const talentId = 'person-studio-5a47d054-r04-3'
  const incumbentId = 'studio-5a47d054-r04'
  let state = fund(p13aGeneratedStudio('p13-public-commercial-adoption'))
  // D3 (956a17f): a P1 scores no opportunity for a publicly unproven person, so
  // the player's compensation + term (2 bands) no longer outrank the incumbent's
  // trust + standing + incumbency (3) at the 208 freeze. The lawful lever is the
  // player's own record: this real 52-week contract runs to its end at 52, a
  // ranToEnd driver inside TRUST_HORIZON_WEEKS at 208, so the player's studio
  // fallback reads Reliable, trust ties, and the unproven tie order (opportunity
  // 0 = 0, then compensation 2 > 0) picks the player. Same lever as
  // p14b1-trust-chooser test 6; no synthetic standing, receipt or binding.
  const reliable = sign(state, 'actor', 52); state = reliable.state
  state = advanceTo(state, 196)
  expect(state.hollywood!.employment.some((e) => e.studioId === player(state) && e.terms.talentId === reliable.id
    && e.terms.endWeekExclusive === 52 && e.endedWeek === 52)).toBe(true)
  expect(trustDescriptor(state, talentId, player(state), state.market.tick)).toMatchObject({ label: 'Reliable', scope: 'studio' })
  expect(state.hollywood!.businesses.find((b) => b.studioId === incumbentId)!.account.cash).toBeGreaterThan(0)
  expect(publicPreferredTerm(state, talentId)).toBe(52)
  expect(trustDrivers(state, talentId, player(state), state.market.tick)).toEqual([])
  expect(caseForTalent(state, talentId)!.subjectStudioId).toBe(incumbentId)
  // Historical B2 construction: inherited accounting counted the incumbent's
  // abandoned earlier draft after revision; these real commissions supplied
  // enough paths for that observed fixture. B3 excludes abandoned reservations.
  // Preserve every commission and historical root/receipt in this same recipe.
  const writer = sign(state, 'writer'); state = writer.state
  const concept = state.concepts[0]!
  state = applyActions(state, [{ kind: 'activateScriptDevelopment' }, { kind: 'commissionScript', project: {
    conceptId: concept.id, writerId: writer.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
  } }])
  state = tick(state)
  const nextConcept = state.concepts[1]!
  state = applyActions(state, [{ kind: 'commissionScript', project: {
    conceptId: nextConcept.id, writerId: writer.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: nextConcept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
  } }])
  state = submitProposal(state, { talentId, issuerStudioId: incumbentId, termWeeks: 208, premiumTier: 1 })
  console.log('poaching pipeline premise', JSON.stringify({ week: state.market.tick,
    promises: state.promises.filter((p) => p.beneficiaryPersonId === talentId),
    scripts: state.scriptDevelopment, concepts: state.concepts.map((c) => c.id),
    stages: state.operations.facilities.filter((f) => f.capability === 'soundstage') }))
  const submitted = proposePromise(state, talentId)
  const bound = advanceTo(submitted, 208)
  const promise = promiseFor(bound, talentId)
  assertBinding(bound, promise)
  // Route pin under D3: the player wins on compensation and term only. The P1 is
  // a preference mismatch for this unproven person (opportunity 0, never a
  // reason) and trust ties on two Reliable records; a different route is a
  // moved premise, not a pass.
  expect(bound.talentMarket.receipts.find((r) => r.kind === 'settled' && r.talentId === talentId && r.week === 208)!.reasons)
    .toEqual(['their compensation band ranked above the others', 'their term matched what this person prefers'])
  expect(caseForTalent(bound, talentId)!.subjectStudioId).not.toBe(player(bound))
  expect(caseForTalent(bound, talentId)!.status).toBe('settled')
  expect(bound.hollywood!.employment.some((e) => e.studioId === incumbentId && e.terms.talentId === talentId && e.endedWeek === 208)).toBe(true)
  const beforeDue = advanceTo(bound, promise.dueWeekExclusive - 9)
  const due = tick(beforeDue)
  const outcome = advanceTo(due, promise.dueWeekExclusive)
  expect(promiseFor(outcome, talentId).outcome).toBe('BROKEN')
  assertOutcome(outcome, promiseFor(outcome, talentId))
  validateSaveV31(JSON.parse(JSON.stringify(makeSave(outcome))))
  return poachCache = { submitted, bound, beforeDue, due, outcome, talentId, incumbentId }
}

let rivalCache: { open: GameState; terminal: GameState; promise: ProfessionalPromise } | undefined
export function rivalFixture() {
  if (rivalCache !== undefined) return rivalCache
  let state = p13aGeneratedStudio()
  let open: GameState | undefined
  for (let week = 0; week <= 240; week++) {
    if (open === undefined && state.talentMarket.proposals.some((p) => p.issuerStudioId !== player(state) && p.promises.length > 0)) open = state
    const promise = state.promises.find((p) => p.issuerStudioId !== player(state) && p.outcome === 'SATISFIED')
    if (open !== undefined && promise !== undefined) {
      expect(state.promises.filter((p) => p.issuerStudioId === player(state))).toEqual([])
      assertOutcome(state, promise)
      validateSaveV31(JSON.parse(JSON.stringify(makeSave(state))))
      return rivalCache = { open, terminal: state, promise }
    }
    state = tick(state)
  }
  throw new Error('P14B.2 fixture: no natural rival-only promise outcome by 240')
}
