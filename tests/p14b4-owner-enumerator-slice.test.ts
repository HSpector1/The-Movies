// P14B.4 record 558-T (T1): requirement-based RED for the ENUMERATOR slice of the
// detached owner adapter adopted in record 555 (§1 adopted law as refined by 555-B,
// §3 RED brief E1–E10 and additions (i)–(v), 555-B Q7 per-item refinements).
// THE MODULE UNDER TEST `src/core/promiseCapacityEnumerator.ts` DOES NOT EXIST at
// HEAD 267b7dc6 (source: first slice e753da22 + the 556 fixture reconciliation):
// this file is RED because the import below cannot resolve. Once the module lands,
// the FIRST case reports every missing export BY NAME (vite binds a missing named
// export of an EXISTING module to `undefined`; the typeof pin turns that into a
// named failure, never a spurious pass). Every later case actually calls the functions.
// Law pinned (555 §1): the fresh-take floor FRESH_TAKE_OFFSET = 5 derived from the
// phase owner; started floor now + (s ≥ now ? 1 : 0) + (r − 5) + 1; started-domain
// conditions (a′)/(b)/(c); BOTH certificate flags gated by the floor (555-B Q4);
// exact omission wordings; option β (no Ready-producer run); the enumerator tariff
// w_e (formula fixed below); saturation in the replay's own cut shape; ONE Started
// run to claims.horizonEndWeek; assembly adds claims.work once; the adapter's 5th
// parameter with the UNEXPORTED default and the canonical `limits` re-literal.
// NOT pinned: rulesVersion, Save30, REASONABLY_ACHIEVABLE for the 40-week baseline
// on `opened`, any Ready-producer run, the measured 108265/4225 (inequalities only).
// In-memory tagged variants only: no tagged state ever passes through `live()`/
// `makeSave` (23, 537-B G4). Builders COPIED, not imported (source file:lines inline):
//   world()          tests/p14b4-owner-adapter-first-slice.test.ts:66-183 (+ `unscheduled`, `writerId`)
//   twoWeek/rootDraft/variants  first-slice :186-216;  started source  :232-249;  CELLS :652-660
//   RED 7 hand assembly  first-slice :536-552;  RED 11 key pin  :711-712
//   natural chain    tests/p14b4-ready-replay-first-take.test.ts:129-190 (assign/schedule loop)
import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { applyActions, hiringMarketIds, tick } from '../src/core/index.js'
import * as enumeratorModule from '../src/core/promiseCapacityEnumerator.js'
import {
  FRESH_ADMISSION_OMISSION, FRESH_TAKE_OFFSET, classifyEnumeratedOffer, earliestStartedTakeWeek, enumerateOwnerTraces,
  type EnumeratedDomain,
} from '../src/core/promiseCapacityEnumerator.js'
import type { JointTraceCapacityInput } from '../src/core/promiseCapacityKernel.js'
import { replayStartedProductionPlans, type StartedOwnerReplayInput, type StartedOwnerReplayResult,
  type StartedOwnerSource } from '../src/core/promiseCapacityOwnerReplay.js'
import * as ownersModule from '../src/core/promiseCapacityOwners.js'
import {
  NO_ENUMERATOR_OMISSION, UNCERTIFIED_BOTTLENECK, assembleCapacityInput, capacityInputsDigest, classifyDetachedOffer,
  collectPromiseClaims, type CapacityLimits, type CollectedClaims, type DetachedOfferClassification,
  type EnumerationCoverage, type ProducerResult,
} from '../src/core/promiseCapacityOwners.js'
import { productionPhaseForRemainingTicksOrNull } from '../src/core/productionPhases.js'
import { attachPromise, type PromiseDraft } from '../src/core/promises.js'
import { makeSave } from '../src/core/save.js'
import { currentProposals, submitProposal } from '../src/core/talentMarket.js'
import { TUNING } from '../src/core/tuning.js'
import type { CastSlot, GameState, ProfessionalPromise, Production, ProductionWorkflow } from '../src/core/types.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './helpers/p14b2-fixtures.js'

const SLOTS = ['lead', 'antagonist', 'support'] as const
const PLAN_UNCERTIFIED = 'bounded capacity analysis could not certify this schedule' // plan :125-126, exact
const RIVAL_OMISSION = 'claims are collected for the player studio only; rival policy is not replayed' // owners :27
const LIMITS: CapacityLimits = { claims: 32, units: 64, alternatives: 1024, work: 200000, span: 220 }
/** 553-R item 1 / 555 §1: the adapter re-literals `limits` in this fixed order (the kernel's MAX_LIMITS order, kernel :117/:975). */
const CANONICAL_LIMIT_KEYS = ['claims', 'units', 'alternatives', 'work', 'span'] as const
/** 555 §1 exact wording (555-B Q3: drafting/review scripts named). */
const EXPECTED_FRESH_ADMISSION_OMISSION = 'any picture not started at source-now (Ready staffing alternatives, scripts in drafting/review, stock door, commissions) is not enumerated beyond the fresh-take floor'
/** 555 §1 exact wording (555-B Q2: facility acquisition named). */
const startedOmission = (productionId: string): string =>
  `started picture ${productionId}: lawful command timings and facility acquisition are not enumerated`
/** 555 §1 item (2): the replay's own cut shape (:2686-2687) with the enumerator's label. */
const ENUMERATOR_WORK_CUT = 'work limit before enumeration completed'
const TRACE_KEY = '558-started-shooting-5'
const EMPTY_PRODUCER: ProducerResult = { fixedHolds: [], attempts: [], preparationWork: 0, omissions: [] }
const COMPLETE: EnumerationCoverage = { existingCalendars: 'complete', allOwnerTraces: 'complete', omissions: [] }
const p1 = (count = 1) => ({ family: 'APPEARANCE_COUNT' as const, predicate: { count } })
const p2 = (seatClass: 'lead' | 'leadOrAntagonist', count = 1) => ({
  family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' as const, predicate: { kind: 'castRoleCount' as const, count, seatClass } })
type Material = ReturnType<typeof p1> | ReturnType<typeof p2>
type Patch = Partial<Material> & Partial<Pick<ProfessionalPromise, 'windowStartWeek' | 'dueWeekExclusive'>>
const clone = <T>(value: T): T => structuredClone(value)
const JOINT: Record<CastSlot, Material> = { lead: p2('lead'), antagonist: p2('leadOrAntagonist'), support: p1() }
const LEAD_CELL: Record<CastSlot, Material> = { lead: p2('lead'), antagonist: p1(), support: p1() }

// ── world(): first-slice :66-183 copy, extended with `unscheduled` (E5) and `writerId` (addition iii) ──
type World = { opened: GameState; unscheduled: GameState; ready: GameState; actors: Record<CastSlot, string>
  ids: Record<CastSlot, string>; productionId: string; projects: readonly string[]; directorId: string; craftId: string
  writerId: string; start: number }
const live = (state: GameState): GameState => makeSave(state).state
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
const commissionPayload = (state: GameState, writerId: string, conceptId: string) => {
  const concept = state.concepts.find((c) => c.id === conceptId)!
  return { conceptId, writerId, shape: { opening: 'slowSetup' as const, midpoint: 'revelation' as const, ending: 'bittersweet' as const },
    promise: { genre: concept.genre, intendedSegments: ['adult' as const], ranges: {
      intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] } } }
}
function readyScript(state: GameState, writerId: string, conceptId: string) {
  const oldIds = new Set(state.scriptDevelopment.projects.map((p) => p.id))
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(state, writerId, conceptId) }])
  const minted = state.scriptDevelopment.projects.filter((p) => !oldIds.has(p.id))
  expect(minted).toHaveLength(1)
  const projectId = minted[0]!.id
  for (let steps = 0; state.scriptDevelopment.projects.find((p) => p.id === projectId)!.status !== 'review'; steps++) {
    if (steps >= 20) throw new Error('UNEXECUTED fixture: actual screenplay never reached Review within20 ticks')
    state = tick(state)
  }
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  expect(state.scriptDevelopment.projects.find((p) => p.id === projectId)).toMatchObject({ status: 'ready', productionId: null })
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
  const starts = Object.values(actors).map((id) => state.contracts.find((c) => c.talentId === id)!.endWeekExclusive)
  expect(new Set(starts).size).toBe(1)
  const start = starts[0]!
  expect(state.studio.activeProductions).toEqual([])
  expect(state.operations.mode).toBe('managed')
  if (state.scriptDevelopment.mode === 'legacy') state = applyActions(state, [{ kind: 'activateScriptDevelopment' }])
  expect(state.scriptDevelopment.projects).toEqual([])
  const concepts = state.concepts.slice(0, 2)
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
    state = attachPromise(state, actors[slot], player(state), { ...p1(), windowStartWeek: start, dueWeekExclusive: start + 52 })
    const promised = currentRoot(state, actors[slot])
    expect(promised.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE')
    ids[slot] = promised.promiseId
  }
  state = advanceTo(state, start)
  for (const slot of SLOTS) {
    const promised = root(state, ids[slot])
    expect(promised).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [] })
    assert.notEqual(promised.contractId, null)
    expect(currentProposals(state, actors[slot])).toEqual([])
  }
  state = applyActions(state, [{ kind: 'greenlightScriptProject', production: {
    projectId: first.projectId, directorId: director.id, craftIds: [craft.id], cast: actors,
    budget: { negative: concepts[0]!.baseNegativeCost, marketing: 0 },
  } }])
  const film = state.studio.activeProductions.at(-1)
  assert.ok(film, 'UNEXECUTED fixture: greenlight was not actually admitted')
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
    state = tick(state)
  }
  // E5: the REAL state immediately before scheduleShootingTake (capacity test :172); status 'ready' fails condition (b).
  const unscheduled = structuredClone(state)
  expect(unscheduled.operations.workflows.find((w) => w.productionId === film.id)).toMatchObject({
    phase: 'shooting', blocker: null, shootingTask: { status: 'ready' } })
  state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: film.id }])
  expect(state.operations.workflows.find((w) => w.productionId === film.id)).toMatchObject({
    phase: 'shooting', blocker: null, shootingTask: { status: 'scheduled' } })
  expect(state.firstTakes.filter((t) => t.productionId === film.id)).toEqual([])
  cached = { opened: live(opened), unscheduled: live(unscheduled), ready: live(state), actors, ids, productionId: film.id,
    projects: [first.projectId, second.projectId], directorId: director.id, craftId: craft.id, writerId: writer.id, start }
  return structuredClone(cached)
}
// ── drafts, in-memory variants, the enumerator tariff, the Started producer reference ─────────
function rootDraft(state: GameState, id: string): PromiseDraft {
  const promised = root(state, id)
  return { family: promised.family, predicate: promised.predicate, issuerStudioId: promised.issuerStudioId,
    beneficiaryPersonId: promised.beneficiaryPersonId, promiseId: promised.promiseId,
    startWeek: promised.windowStartWeek, termWeeks: promised.dueWeekExclusive - promised.windowStartWeek,
    windowStartWeek: promised.windowStartWeek, dueWeekExclusive: promised.dueWeekExclusive }
}
const unbound = (draft: PromiseDraft): PromiseDraft => { const { promiseId: _self, ...rest } = draft; return rest }
/** first-slice :196-201: a fresh unbound P1 offer on the person's open proposal. */
function offer(state: GameState, personId: string): PromiseDraft {
  const proposal = currentProposals(state, personId).find((p) => p.issuerStudioId === player(state))
  assert.ok(proposal)
  return { ...p1(), issuerStudioId: player(state), beneficiaryPersonId: personId, startWeek: proposal.startWeek,
    termWeeks: proposal.termWeeks, windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + 40 }
}
/** LABELED in-memory variant (first-slice :204-210 WITHOUT live()): only material and window on the three ACTUAL bound
 * OPEN roots of `base` change; nothing is minted or admitted. */
function variantsOn(base: GameState, w: World, patches: Partial<Record<CastSlot, Patch>>): GameState {
  const changes = new Map<string, Patch>(SLOTS.flatMap((slot) => patches[slot] === undefined ? [] : [[w.ids[slot], patches[slot]!]]))
  return { ...clone(base), promises: base.promises.map((p) => {
    const chosen = changes.get(p.promiseId)
    return chosen === undefined ? clone(p) : { ...clone(p), ...chosen }
  }) }
}
function twoWeekOn(w: World, base: GameState, material: Record<CastSlot, Material>): GameState {
  const now = base.market.tick
  return variantsOn(base, w, { lead: { ...material.lead, windowStartWeek: now, dueWeekExclusive: now + 2 },
    antagonist: { ...material.antagonist, windowStartWeek: now, dueWeekExclusive: now + 2 },
    support: { ...material.support, windowStartWeek: now, dueWeekExclusive: now + 2 } })
}
const twoWeek = (w: World, material: Record<CastSlot, Material>): GameState => twoWeekOn(w, w.ready, material)
/** THE ENUMERATOR TARIFF THIS FILE FIXES (555 §1 item 2 "formula fixed by the RED"; precedent: 540 fixed the collection
 * tariff 1 + P + A + M×T). w_e = 1 + N + W + N×T where N = studio.activeProductions rows (every row is the issuer's own
 * picture: rival pictures live under hollywood businesses, hollywoodTick :252-259), W = operations.workflows rows (the
 * condition-(b) workflow lookup), T = firstTakes rows (the condition-(a′) issuer-matched take scan, once per picture).
 * Rival/absent-industry claims (555 §1 behaviour 1) scan nothing: w_e = 1. Charged and compared with limits.work BEFORE
 * any producer run; transferred into the Started producer's preparationWork seed (555 §1 item 3). */
function expectedEnumeratorWork(state: GameState, claims: CollectedClaims): number {
  if (claims.coverage.claimsAndHolds !== 'complete') return 1
  const N = state.studio.activeProductions.length, W = state.operations.workflows.length, T = state.firstTakes.length
  return 1 + N + W + N * T
}
// started test :112-119, verbatim
function startedSource(state: GameState): StartedOwnerSource<Production> {
  return { technology: state.technology, market: { tick: state.market.tick },
    placement: state.placement, property: state.property, hollywood: state.hollywood,
    operations: state.operations, sets: state.sets, releaseAuthority: state.releaseAuthority,
    scriptDevelopment: state.scriptDevelopment, castingSessions: state.castingSessions,
    construction: state.construction, physicalPlans: state.physicalPlans,
    productionQueue: state.productionQueue, founding: state.founding, firstTakes: state.firstTakes,
    concepts: state.concepts, studio: { activeProductions: state.studio.activeProductions } }
}
/** The ONE Started plan the enumerator runs (555 §1 behaviour 3): `commands: []`, producer limits picked from `limits`. */
function startedRef(state: GameState, claimPersonIds: readonly string[], horizonEndWeek: number, traceKey: string,
  preparationWork: number, limits: CapacityLimits = LIMITS): StartedOwnerReplayResult<Production> {
  const input: StartedOwnerReplayInput<Production> = { source: startedSource(state), issuerId: player(state), claimPersonIds,
    plans: [{ traceKey, commands: [] }], horizonEndWeek, preparationWork,
    limits: { work: limits.work, span: limits.span, alternatives: limits.alternatives } }
  return replayStartedProductionPlans(input)
}
let startedCache: StartedOwnerReplayResult<Production> | undefined
/** first-slice :253-263: the first slice's own Started run on w.ready to now+2 (its digest is the E3 control). */
function started(w: World): StartedOwnerReplayResult<Production> {
  if (startedCache === undefined) {
    const claims = collectPromiseClaims(w.ready, rootDraft(w.ready, w.ids.lead))
    const result = startedRef(w.ready, claims.claimPersonIds, w.ready.market.tick + 2, TRACE_KEY, 0)
    expect(result.attempts.map((a) => a.kind)).toEqual(['complete'])
    expect(result.omissions).toEqual([])
    startedCache = result
  }
  return startedCache
}
const traceKeyOf = (producer: ProducerResult): string => {
  const attempt = producer.attempts[0]
  assert.ok(attempt, 'the enumerator ran no Started attempt (555 §1 behaviour 3: exactly ONE Started run)')
  return attempt.kind === 'complete' ? attempt.trace.traceKey : attempt.traceKey
}
/** 555-B Q7 E4/E6: a Started run beyond now+2 on w.ready is UNMEASURED; certificate pins must fail HERE with the cut reason. */
function requireComplete(producer: ProducerResult, label: string): void {
  expect(producer.attempts, `${label}: exactly one Started attempt`).toHaveLength(1)
  const attempt = producer.attempts[0]!
  if (attempt.kind !== 'complete') throw new Error(`PRECONDITION (unmeasured, 555-B Q7) ${label}: the Started attempt was cut `
    + `${attempt.reason}: ${attempt.detail}; producer omissions ${JSON.stringify(producer.omissions)}`)
}
const noThrow = <T>(run: () => T): T => { let value: T | undefined; expect(() => { value = run() }).not.toThrow(); return value! }

// ── E1 natural chain: first-take test :129-190 loop on w.opened (no setup recipe: setup null at creation, operations :614) ──
type Chain = { immediate: GameState; now: number; productionId: string; take: GameState['firstTakes'][number] }
let chainCache: Chain | undefined
function naturalChain(w: World): Chain {
  if (chainCache !== undefined) return structuredClone(chainCache)
  const opened = w.opened, now = opened.market.tick
  expect(opened.studio.activeProductions).toEqual([])
  const project = opened.scriptDevelopment.projects.find((p) => p.id === w.projects[0])!
  expect(project.status).toBe('ready')
  const concept = opened.concepts.find((c) => c.id === project.conceptId)!
  const immediate = applyActions(opened, [{ kind: 'greenlightScriptProject', production: {
    projectId: project.id, directorId: w.directorId, craftIds: [w.craftId], cast: w.actors,
    budget: { negative: concept.baseNegativeCost, marketing: 0 } } }])
  const film = immediate.studio.activeProductions.at(-1)
  assert.ok(film, 'UNEXECUTED fixture: the greenlight on w.opened was not actually admitted')
  expect(immediate.productionQueue).toEqual([])
  expect(film).toMatchObject({ startTick: now, remainingTicks: TUNING.PRODUCTION_TICKS }) // actions :344-345
  let state = immediate
  for (let guard = 0; guard < 16 && !state.firstTakes.some((t) => t.productionId === film.id); guard++) {
    const production: Production | undefined = state.studio.activeProductions.find((p) => p.id === film.id)
    const workflow: ProductionWorkflow | undefined = state.operations.workflows.find((row) => row.productionId === film.id)
    assert.ok(production && workflow)
    if (workflow.phase === 'shooting') {
      expect(production.remainingTicks).toBe(5)
      if (workflow.shootingTask?.status === 'unassigned') {
        state = applyActions(state, [{ kind: 'assignShootingDirector', productionId: film.id, directorId: production.directorId }])
      }
      if (state.operations.workflows.find((row) => row.productionId === film.id)!.shootingTask?.status === 'ready') {
        state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: film.id }])
      }
    }
    state = tick(state)
  }
  const takes = state.firstTakes.filter((t) => t.productionId === film.id)
  expect(takes, 'UNEXECUTED fixture: the natural chain recorded no first take within 16 real ticks').toHaveLength(1)
  chainCache = { immediate, now, productionId: film.id, take: takes[0]! }
  return structuredClone(chainCache)
}

// ── the 13 first-slice cells (:652-660) with 538 :33's observed class under complete coverage ──
type Cell = { name: string; target: CastSlot; material: Record<CastSlot, Material>; expected: 'FRAGILE' | 'IMPOSSIBLE' }
const eligible = (mask: 'lead' | 'leadOrAntagonist' | 'any', slot: CastSlot): boolean =>
  mask === 'any' || slot === 'lead' || (mask === 'leadOrAntagonist' && slot === 'antagonist')
const CELLS: readonly Cell[] = [
  ...SLOTS.flatMap((slot) => (['lead', 'leadOrAntagonist', 'any'] as const).map((mask): Cell => ({
    name: `matrix ${mask} target fixed in ${slot}, other two P1`, target: slot,
    material: { lead: p1(), antagonist: p1(), support: p1(), [slot]: mask === 'any' ? p1() : p2(mask) } as Record<CastSlot, Material>,
    expected: eligible(mask, slot) ? 'FRAGILE' : 'IMPOSSIBLE' }))),
  { name: 'joint lead+flexible+P1, target lead', target: 'lead', material: JOINT, expected: 'FRAGILE' },
  { name: 'joint lead+flexible+P1, target antagonist', target: 'antagonist', material: JOINT, expected: 'FRAGILE' },
  { name: 'joint lead+flexible+P1, target support', target: 'support', material: JOINT, expected: 'FRAGILE' },
  { name: 'conflicting fixed lead claims (RED 4), target support', target: 'support',
    material: { lead: p2('lead'), antagonist: p2('lead'), support: p1() }, expected: 'IMPOSSIBLE' },
]

describe('558-T surface (RED law: a missing module or export is named, never a spurious pass)', () => {
  it('surface (E10): every adopted export of promiseCapacityEnumerator.js exists with its runtime type; the adapter honours a 5th argument; NO_ENUMERATION is not exported; RED 11 key list unchanged', () => {
    const expected: readonly (readonly [string, unknown, 'function' | 'string' | 'number'])[] = [
      ['promiseCapacityEnumerator.FRESH_TAKE_OFFSET', FRESH_TAKE_OFFSET, 'number'],
      ['promiseCapacityEnumerator.FRESH_ADMISSION_OMISSION', FRESH_ADMISSION_OMISSION, 'string'],
      ['promiseCapacityEnumerator.earliestStartedTakeWeek', earliestStartedTakeWeek, 'function'],
      ['promiseCapacityEnumerator.enumerateOwnerTraces', enumerateOwnerTraces, 'function'],
      ['promiseCapacityEnumerator.classifyEnumeratedOffer', classifyEnumeratedOffer, 'function'],
      ['promiseCapacityOwners.assembleCapacityInput', assembleCapacityInput, 'function'],
      ['promiseCapacityOwners.collectPromiseClaims', collectPromiseClaims, 'function'],
      ['promiseCapacityOwners.capacityInputsDigest', capacityInputsDigest, 'function'],
      ['promiseCapacityOwners.NO_ENUMERATOR_OMISSION', NO_ENUMERATOR_OMISSION, 'string'],
    ]
    const missing = expected.filter(([, value, type]) => typeof value !== type).map(([name]) => `MISSING EXPORT: ${name}`)
    expect(missing).toEqual([])
    expect(Object.keys(enumeratorModule).sort()).toEqual(['FRESH_ADMISSION_OMISSION', 'FRESH_TAKE_OFFSET',
      'classifyEnumeratedOffer', 'earliestStartedTakeWeek', 'enumerateOwnerTraces'])
    // `export type EnumerationCoverage` adds no runtime key; the NO_ENUMERATION default stays unexported (555 §1).
    expect(Object.keys(ownersModule).sort()).toEqual(['NO_ENUMERATOR_OMISSION', 'UNCERTIFIED_BOTTLENECK', 'assembleCapacityInput',
      'capacityInputsDigest', 'classifyDetachedOffer', 'collectPromiseClaims', 'mapCapacityResult'])
    expect('NO_ENUMERATION' in ownersModule).toBe(false)
    expect(FRESH_ADMISSION_OMISSION).toBe(EXPECTED_FRESH_ADMISSION_OMISSION)
    expect(UNCERTIFIED_BOTTLENECK).toBe(PLAN_UNCERTIFIED)
    // 5-arity behaviour: the supplied certificate is carried and the fixed omission is dropped.
    const w = world(), claims = collectPromiseClaims(w.ready, rootDraft(w.ready, w.ids.lead))
    const five = assembleCapacityInput(claims, EMPTY_PRODUCER, claims.horizonEndWeek, LIMITS, COMPLETE)
    expect(five.coverage, 'assembleCapacityInput ignores its 5th parameter (555 §1 one-hunk extension)')
      .toEqual({ claimsAndHolds: 'complete', existingCalendars: 'complete', allOwnerTraces: 'complete', omissions: [] })
  })
})

describe('558-T floor: FRESH_TAKE_OFFSET and earliestStartedTakeWeek', () => {
  it('E1 (555-B Q7): FRESH_TAKE_OFFSET === 5 is tied to the phase owner and the countdown; the started floor formula on plain Pick inputs', () => {
    expect(FRESH_TAKE_OFFSET).toBe(5)
    // The first Shooting count is the highest remainingTicks whose phase is 'shooting' (productionPhases :36-45); the take
    // branch is operations :1680's literal `=== 5`. Skip at admission (1) + decrements to 5 + the take sweep (1).
    const firstShooting = [8, 7, 6, 5, 4, 3, 2, 1].find((r) => productionPhaseForRemainingTicksOrNull(r) === 'shooting')
    expect(firstShooting).toBe(5)
    expect(FRESH_TAKE_OFFSET).toBe(1 + (TUNING.PRODUCTION_TICKS - firstShooting!) + 1)
    const now = 60
    expect(earliestStartedTakeWeek(now, { startTick: now, remainingTicks: TUNING.PRODUCTION_TICKS })).toBe(now + 5)
    expect(earliestStartedTakeWeek(now, { startTick: now, remainingTicks: 8 })).toBe(now + FRESH_TAKE_OFFSET)
    expect(earliestStartedTakeWeek(now, { startTick: now - 1, remainingTicks: 5 })).toBe(now + 1)
    expect(earliestStartedTakeWeek(now, { startTick: now - 1, remainingTicks: 6 })).toBe(now + 2)
    expect(earliestStartedTakeWeek(now, { startTick: now - 1, remainingTicks: 8 })).toBe(now + 4)
    expect(earliestStartedTakeWeek(now, { startTick: now - 3, remainingTicks: 7 })).toBe(now + 3)
    // Generalised started floor now + (s ≥ now ? 1 : 0) + (r − 5) + 1 (555 §1), r ≥ 5, admitted in an earlier week.
    for (const r of [5, 6, 7, 8]) for (const s of [now - 9, now - 4, now - 1]) {
      expect(earliestStartedTakeWeek(now, { startTick: s, remainingTicks: r }), `s=${s} r=${r}`).toBe(now + (r - 5) + 1)
    }
    // NOT asserted: equality with the scalar's WEEKS_TO_FIRST_TAKE (promises.ts :44-50 calls it a hypothesis) — observation only.
  })

  it('addition (iv) (555-B Q2): the remainingTicks < 5 arm of (a′) on plain Pick inputs — past the first Shooting week no NEW first take can ever be recorded (operations :1680 sole take branch; replay :690), so the floor is +Infinity', () => {
    // RESOLUTION fixed by this RED: the helper answers the minimum over an EMPTY set of lawful take weeks as +Infinity, which
    // makes condition (c) `floor ≥ horizon` hold for every horizon and folds the (a′) r < 5 arm into the same comparison.
    const now = 60
    for (const r of [4, 3, 2, 1]) for (const s of [now - 8, now - 1]) {
      expect(earliestStartedTakeWeek(now, { startTick: s, remainingTicks: r }), `s=${s} r=${r}`).toBe(Number.POSITIVE_INFINITY)
    }
    expect(earliestStartedTakeWeek(now, { startTick: now - 3, remainingTicks: 5 })).toBe(now + 1) // the boundary: r = 5 still fires
  })

  it('E1 (555-B Q7) natural chain LAW: a real greenlight on w.opened at now, assign/schedule at the earliest lawful boundaries, records its first take no earlier than now + FRESH_TAKE_OFFSET', () => {
    const w = world(), chain = naturalChain(w), immediate = chain.immediate
    const film = immediate.studio.activeProductions.find((p) => p.id === chain.productionId)!
    expect(chain.take).toMatchObject({ productionId: chain.productionId, studioId: player(immediate), cast: w.actors })
    expect(chain.take.week).toBeGreaterThanOrEqual(chain.now + FRESH_TAKE_OFFSET)
    expect(chain.take.week).toBeGreaterThanOrEqual(earliestStartedTakeWeek(chain.now, film))
    expect(earliestStartedTakeWeek(chain.now, film)).toBe(chain.now + FRESH_TAKE_OFFSET)
  })

  it('E1 (555-B Q7) natural chain OBSERVATION (fixture tightness, not law; 538 :60 predicts now+5, not shown native): the take lands exactly at now + 5', () => {
    const w = world(), chain = naturalChain(w)
    expect(chain.take.week, `OBSERVATION: natural-chain first take at week ${chain.take.week}, now ${chain.now}, now+5 = ${chain.now + 5} `
      + '(load-in distance / due-at-call settlement decide tightness; the E1 LAW case above is the floor pin)').toBe(chain.now + 5)
  })
})

describe('558-T certificate: enumerateOwnerTraces on the started domain', () => {
  const refCache = new Map<string, StartedOwnerReplayResult<Production>>()
  const reference = (w: World, claims: CollectedClaims, key: string, seed: number) => {
    const id = `${key}|${seed}`
    if (!refCache.has(id)) refCache.set(id, startedRef(w.ready, claims.claimPersonIds, w.ready.market.tick + 2, key, seed))
    return refCache.get(id)!
  }
  it.each(CELLS)('E2: 2-week cell $name — ONE Started run seeded with w_e, byte-equal trace and holds, both flags complete, no omission, floors now+5', (cell) => {
    const w = world(), state = twoWeek(w, cell.material), now = state.market.tick
    const claims = collectPromiseClaims(state, rootDraft(state, w.ids[cell.target]))
    expect(claims.horizonEndWeek).toBe(now + 2)
    const domain: EnumeratedDomain = enumerateOwnerTraces(state, claims, LIMITS)
    expect(domain.floors).toEqual({ freshTakeWeek: now + FRESH_TAKE_OFFSET })
    expect(domain.work).toBe(expectedEnumeratorWork(state, claims))
    expect(domain.producer.attempts.map((a) => a.kind)).toEqual(['complete'])
    expect(domain.producer.omissions).toEqual([])
    const key = traceKeyOf(domain.producer)
    expect(key.length).toBeGreaterThan(0)
    const seeded = reference(w, claims, key, domain.work), attempt = domain.producer.attempts[0]!, expectedAttempt = seeded.attempts[0]!
    if (attempt.kind !== 'complete' || expectedAttempt.kind !== 'complete') throw new Error('E2: both runs must complete (538 scenario 1)')
    expect(attempt.trace).toEqual(expectedAttempt.trace)
    expect(domain.producer.fixedHolds).toEqual(seeded.fixedHolds)
    expect(domain.producer.preparationWork).toBe(seeded.preparationWork)
    expect(domain.producer.preparationWork).toBe(reference(w, claims, key, 0).preparationWork + domain.work) // tariff transferred, one sum
    expect(domain.producer.preparationWork).toBeLessThanOrEqual(200000)
    expect(domain.producer.fixedHolds.length).toBeGreaterThan(0)
    for (const hold of domain.producer.fixedHolds) expect(hold.until).toEqual({ week: now + 2, step: 0 }) // run to claims.horizonEndWeek (replay :755)
    expect(domain.enumeration).toEqual(COMPLETE)
  })

  it('E6 (555-B Q7): a later prior due sets the horizon — antagonist due now+4, target lead now+2 → run to now+4, certificate complete, class per E3', () => {
    const w = world(), now = w.ready.market.tick
    const state = variantsOn(w.ready, w, { lead: { ...p2('lead'), windowStartWeek: now, dueWeekExclusive: now + 2 },
      antagonist: { ...p1(), windowStartWeek: now, dueWeekExclusive: now + 4 }, support: { ...p1(), windowStartWeek: now, dueWeekExclusive: now + 2 } })
    const draft = rootDraft(state, w.ids.lead), claims = collectPromiseClaims(state, draft)
    expect(claims.horizonEndWeek).toBe(now + 4)
    const domain = enumerateOwnerTraces(state, claims, LIMITS)
    requireComplete(domain.producer, 'E6 Started run on w.ready to now+4 (crosses 4→3 post-production entry)')
    expect(domain.producer.fixedHolds.length).toBeGreaterThan(0)
    for (const hold of domain.producer.fixedHolds) expect(hold.until).toEqual({ week: now + 4, step: 0 })
    expect(domain.enumeration).toEqual(COMPLETE)
    const classified = classifyEnumeratedOffer(state, draft, LIMITS)
    expect(classified).toMatchObject({ classification: 'FRAGILE', kernel: { status: 'PROVEN_FRAGILE', reason: 'achievableProbeFailed' } })
    expect(classified.bottleneck).not.toBe(UNCERTIFIED_BOTTLENECK)
  })

  it('addition (i) (555-B Q7): a picture admitted THIS week on w.opened (startTick === now, remainingTicks 8) is bounded by condition (c) — floor now+5 ≥ a 2-week horizon → complete → PROVEN_IMPOSSIBLE', () => {
    const w = world(), { immediate, now, productionId } = naturalChain(w)
    const picture = immediate.studio.activeProductions.find((p) => p.id === productionId)!
    expect(picture).toMatchObject({ startTick: now, remainingTicks: 8 })
    expect(earliestStartedTakeWeek(now, picture)).toBe(now + FRESH_TAKE_OFFSET)
    const draft = { ...offer(immediate, w.actors.lead), windowStartWeek: now, dueWeekExclusive: now + 2 }
    const claims = collectPromiseClaims(immediate, draft)
    expect(claims.priorClaims).toEqual([])
    expect(claims.horizonEndWeek).toBe(now + 2)
    const domain = enumerateOwnerTraces(immediate, claims, LIMITS)
    requireComplete(domain.producer, 'addition (i) Started run on the admitted-this-week state to now+2 (development → pre-production)')
    expect(domain.enumeration).toEqual(COMPLETE)
    expect(domain.floors).toEqual({ freshTakeWeek: now + FRESH_TAKE_OFFSET })
    expect(classifyEnumeratedOffer(immediate, draft, LIMITS)).toMatchObject({ classification: 'IMPOSSIBLE',
      kernel: { status: 'PROVEN_IMPOSSIBLE', reason: 'completeCountFailure', scope: 'jointOfferOnly' } })
  })

  it('addition (ii) (555-B Q7): (a′) via the real tick(w.ready) — remainingTicks 4 with its issuer-matched receipt adds no NEW event; a fresh unbound 2-week draft is complete and IMPOSSIBLE', () => {
    const w = world(), settled = tick(w.ready), now = settled.market.tick
    const picture = settled.studio.activeProductions.find((p) => p.id === w.productionId)!
    expect(picture.remainingTicks).toBe(4)
    expect(settled.firstTakes.filter((t) => t.productionId === w.productionId)).toHaveLength(1)
    for (const slot of SLOTS) expect(root(settled, w.ids[slot]).outcome).toBe('SATISFIED')
    expect(earliestStartedTakeWeek(now, picture)).toBe(Number.POSITIVE_INFINITY)
    const draft = { ...unbound(rootDraft(settled, w.ids.lead)), windowStartWeek: now, dueWeekExclusive: now + 2 }
    const claims = collectPromiseClaims(settled, draft)
    expect(claims.priorClaims).toEqual([])
    expect(claims.target).toMatchObject({ state: 'unbound', count: 1, actualQualifiedCount: 0 })
    const domain = enumerateOwnerTraces(settled, claims, LIMITS)
    requireComplete(domain.producer, 'addition (ii) Started run on tick(w.ready) to now+2 (4→3 post-production, 3→2)')
    expect(domain.enumeration).toEqual(COMPLETE)
    expect(classifyEnumeratedOffer(settled, draft, LIMITS)).toMatchObject({ classification: 'IMPOSSIBLE',
      kernel: { status: 'PROVEN_IMPOSSIBLE', reason: 'completeCountFailure', scope: 'jointOfferOnly' } })
  })
})

describe('558-T classification: classifyEnumeratedOffer through the adapter', () => {
  it.each(CELLS)('E3: 2-week cell $name → $expected under the certificate (538 :33 observed classes); workUsed bounded; digest composed, preparationWork-independent, ≠ the first-slice digest', (cell) => {
    const w = world(), state = twoWeek(w, cell.material), now = state.market.tick
    const draft = rootDraft(state, w.ids[cell.target]), claims = collectPromiseClaims(state, draft)
    const domain = enumerateOwnerTraces(state, claims, LIMITS)
    requireComplete(domain.producer, `E3 ${cell.name}`)
    const classified = classifyEnumeratedOffer(state, draft, LIMITS)
    if (cell.expected === 'FRAGILE') {
      expect(classified).toMatchObject({ classification: 'FRAGILE', kernel: { status: 'PROVEN_FRAGILE', reason: 'achievableProbeFailed' } })
      expect(typeof classified.bottleneck).toBe('string')
      expect(classified.bottleneck).not.toBe(UNCERTIFIED_BOTTLENECK)
    } else {
      expect(classified).toMatchObject({ classification: 'IMPOSSIBLE',
        kernel: { status: 'PROVEN_IMPOSSIBLE', reason: 'completeCountFailure', scope: 'jointOfferOnly' } })
    }
    expect(classified.kernel.omissions).toEqual([])
    expect(classified.kernel.workUsed).toBeLessThanOrEqual(200000)
    expect(classified.kernel.workUsed).toBeGreaterThan(domain.producer.preparationWork)
    expect(classified).not.toHaveProperty('rulesVersion')
    expect(classified).not.toHaveProperty('week')
    // Composition law: collect → enumerate → assemble(5 args) → search → map; claims.work added exactly once (555 §1 item 5).
    const assembled = assembleCapacityInput(claims, domain.producer, claims.horizonEndWeek, LIMITS, domain.enumeration)
    expect(assembled.coverage).toEqual({ claimsAndHolds: 'complete', existingCalendars: 'complete', allOwnerTraces: 'complete', omissions: [] })
    expect(assembled.preparationWork).toBe(domain.producer.preparationWork + claims.work)
    expect(classified.inputsDigest).toBe(capacityInputsDigest(assembled))
    expect(capacityInputsDigest({ ...assembled, preparationWork: assembled.preparationWork + 1 })).toBe(classified.inputsDigest)
    expect(classified.inputsDigest).toMatch(/^[0-9a-f]{16}$/)
    expect(classified.inputsDigest).not.toBe(classifyDetachedOffer(claims, started(w), now + 2, LIMITS).inputsDigest) // coverage is inside the digest
  })

  it('E3 (PAPER, plan :106; 538 unmeasured): unbound(support) on the joint variant is IMPOSSIBLE — the person\'s own bound root becomes a prior with remaining 1 while the unbound target asks one more from the same single seat', () => {
    const w = world(), state = twoWeek(w, JOINT), draft = unbound(rootDraft(state, w.ids.support))
    const claims = collectPromiseClaims(state, draft)
    expect(claims.priorClaims).toHaveLength(3)
    expect(claims.target).toMatchObject({ promiseId: null, state: 'unbound', count: 1 })
    const domain = enumerateOwnerTraces(state, claims, LIMITS)
    requireComplete(domain.producer, 'E3 paper cell')
    expect(domain.enumeration).toEqual(COMPLETE)
    const classified = classifyEnumeratedOffer(state, draft, LIMITS)
    expect(classified.classification, `PAPER PIN (plan :106) — DO NOT LOOSEN: observed ${classified.classification} / kernel `
      + `${classified.kernel.status}${classified.kernel.reason === null ? '' : '/' + classified.kernel.reason}; report this class`).toBe('IMPOSSIBLE')
    expect(classified.kernel).toMatchObject({ status: 'PROVEN_IMPOSSIBLE', reason: 'completeCountFailure', scope: 'jointOfferOnly' })
  })
})

describe('558-T honesty: the floor edge, the unforced started picture, the queue', () => {
  const dueAt = (w: World, due: number): GameState => {
    const now = w.ready.market.tick
    return variantsOn(w.ready, w, { lead: { ...p2('lead'), windowStartWeek: now, dueWeekExclusive: due },
      antagonist: { ...p1(), windowStartWeek: now, dueWeekExclusive: now + 2 }, support: { ...p1(), windowStartWeek: now, dueWeekExclusive: now + 2 } })
  }
  it('E4 (555-B Q4): target due exactly now + FRESH_TAKE_OFFSET is still complete (half-open: a fresh take at now+5 lies outside) and classifies PROVEN_FRAGILE', () => {
    const w = world(), now = w.ready.market.tick, state = dueAt(w, now + FRESH_TAKE_OFFSET)
    const draft = rootDraft(state, w.ids.lead), claims = collectPromiseClaims(state, draft)
    expect(claims.horizonEndWeek).toBe(now + FRESH_TAKE_OFFSET)
    const domain = enumerateOwnerTraces(state, claims, LIMITS)
    requireComplete(domain.producer, 'E4 Started run on w.ready to now+5 (crosses wrap: 4→3→2→1)')
    expect(domain.floors).toEqual({ freshTakeWeek: now + FRESH_TAKE_OFFSET })
    for (const hold of domain.producer.fixedHolds) expect(hold.until).toEqual({ week: now + FRESH_TAKE_OFFSET, step: 0 })
    expect(domain.enumeration).toEqual(COMPLETE)
    const classified = noThrow(() => classifyEnumeratedOffer(state, draft, LIMITS))
    expect(classified).toMatchObject({ classification: 'FRAGILE', kernel: { status: 'PROVEN_FRAGILE', reason: 'achievableProbeFailed' } })
    expect(classified.bottleneck).not.toBe(UNCERTIFIED_BOTTLENECK)
  })

  it('E4 (555-B Q4): beyond the floor BOTH flags are incomplete with exactly the fresh-admission omission; the Started run to now+6 is complete (loud precondition); UNCERTIFIED/domainIncomplete, no horizon-guard throw', () => {
    const w = world(), now = w.ready.market.tick, state = dueAt(w, now + FRESH_TAKE_OFFSET + 1)
    const draft = rootDraft(state, w.ids.lead), claims = collectPromiseClaims(state, draft)
    expect(claims.horizonEndWeek).toBe(now + 6)
    const domain = enumerateOwnerTraces(state, claims, LIMITS)
    requireComplete(domain.producer, 'E4 Started run on w.ready to now+6 (crosses wrap AND the 1→0 release sweep)')
    expect(domain.producer.omissions).toEqual([])
    for (const hold of domain.producer.fixedHolds) expect(hold.until).toEqual({ week: now + 6, step: 0 })
    expect(domain.enumeration).toEqual({ existingCalendars: 'incomplete', allOwnerTraces: 'incomplete', omissions: [FRESH_ADMISSION_OMISSION] })
    const classified = noThrow(() => classifyEnumeratedOffer(state, draft, LIMITS))
    expect(classified).toMatchObject({ classification: 'FRAGILE', bottleneck: UNCERTIFIED_BOTTLENECK,
      kernel: { status: 'UNCERTIFIED', reason: 'domainIncomplete' } })
    expect(classified.kernel.omissions).toContain(FRESH_ADMISSION_OMISSION)
    expect(classified.kernel.omissions).not.toContain(NO_ENUMERATOR_OMISSION)
    expect(classified.kernel.workUsed).toBeLessThanOrEqual(200000)
  })

  it('E5 (555-B Q7): the real state before scheduleShootingTake (status ready, blocker null, remainingTicks 5) fails (b) → the started-picture omission names w.productionId, both flags incomplete, UNCERTIFIED/domainIncomplete, no throw', () => {
    const w = world(), state = twoWeekOn(w, w.unscheduled, LEAD_CELL), now = state.market.tick
    expect(now).toBe(w.ready.market.tick)
    expect(state.operations.workflows.find((row) => row.productionId === w.productionId)).toMatchObject({
      phase: 'shooting', blocker: null, shootingTask: { status: 'ready' } })
    expect(state.studio.activeProductions.find((p) => p.id === w.productionId)!.remainingTicks).toBe(5)
    expect(state.firstTakes.filter((t) => t.productionId === w.productionId)).toEqual([])
    const draft = rootDraft(state, w.ids.lead), claims = collectPromiseClaims(state, draft)
    expect(claims.horizonEndWeek).toBe(now + 2)
    const domain = noThrow(() => enumerateOwnerTraces(state, claims, LIMITS))
    requireComplete(domain.producer, 'E5 Started run on w.unscheduled to now+2 (no take fires: the :1680 branch continues on a ready task)')
    expect(domain.enumeration).toEqual({ existingCalendars: 'incomplete', allOwnerTraces: 'incomplete', omissions: [startedOmission(w.productionId)] })
    const classified = noThrow(() => classifyEnumeratedOffer(state, draft, LIMITS))
    expect(classified).toMatchObject({ classification: 'FRAGILE', bottleneck: UNCERTIFIED_BOTTLENECK,
      kernel: { status: 'UNCERTIFIED', reason: 'domainIncomplete' } })
    expect(classified.kernel.omissions).toContain(startedOmission(w.productionId))
    expect(classified.kernel.omissions).not.toContain(NO_ENUMERATOR_OMISSION)
  })

  it('addition (iii) (555-B Q7): a non-empty production queue is the producer\'s context cut (replay :624) → both flags incomplete → UNCERTIFIED/domainIncomplete; built by three real commands at now on the admitted-this-week state — the fixture writer\'s commission fills the last Development & Casting slot, a market writer is signed, and that writer\'s commission is the one queueable refusal (scriptDevelopment :311) the front door admits to the queue (actions :1634-1645)', () => {
    const w = world(), { immediate, now } = naturalChain(w)
    // 561-T observed on this fixture (option (a) of the 560-W hand-back): FOUNDING_DEVELOPMENT_CASTING_CAPACITY is 2 (tuning :632,
    // operations :90); on `immediate` the admitted picture's development workflow holds slot 0 (occupancy :409-421) and both Ready
    // scripts hold no reservation (occupancy :441), so ONE commission is admitted at once and the queue stays empty — the RED's
    // single-commission construction was UNCONSTRUCTIBLE. The fixture writer's commission takes slot 1; a second commission needs
    // an idle writer (scriptDevelopment :289-298), signed from the hiring market at the SAME tick (no advance: the picture is
    // still admitted THIS week); its commission is refused at the slot (scriptDevelopment :311) and queued whole with nothing
    // minted or held (productionQueue :12-16).
    const concepts = immediate.concepts.filter((c) => !immediate.scriptDevelopment.projects.some((p) => p.conceptId === c.id))
    assert.ok(concepts.length >= 2, 'UNCONSTRUCTIBLE: the fixture has fewer than two uncommissioned concepts to commission')
    const filled = applyActions(immediate, [{ kind: 'commissionScript', project: commissionPayload(immediate, w.writerId, concepts[0]!.id) }])
    expect(filled.productionQueue).toEqual([]) // slot 1 was free: admitted at once, not queued
    expect(filled.scriptDevelopment.projects).toHaveLength(immediate.scriptDevelopment.projects.length + 1)
    const writer = hiringMarketIds(filled, filled.market.tick).map((id) => filled.talent.find((p) => p.id === id)).find((p) => p?.role === 'writer')
    assert.ok(writer, 'UNCONSTRUCTIBLE: no second writer in the hiring market at now (a second commission needs an idle writer)')
    const signed = applyActions(filled, [{ kind: 'signContract', talentId: writer.id, termWeeks: 52 }])
    expect(signed.market.tick).toBe(now)
    const queued = applyActions(signed, [{ kind: 'commissionScript', project: commissionPayload(signed, writer.id, concepts[1]!.id) }])
    expect(queued.productionQueue).toMatchObject([{ kind: 'commissionScript', queuedWeek: now }])
    expect(queued.scriptDevelopment.projects).toHaveLength(filled.scriptDevelopment.projects.length) // nothing minted while queued
    expect(queued.productionQueue).toHaveLength(1)
    expect(queued.studio.activeProductions).toEqual(immediate.studio.activeProductions)
    const draft = { ...offer(queued, w.actors.lead), windowStartWeek: now, dueWeekExclusive: now + 2 }
    const claims = collectPromiseClaims(queued, draft)
    expect(claims.coverage.claimsAndHolds).toBe('complete')
    const domain = noThrow(() => enumerateOwnerTraces(queued, claims, LIMITS))
    expect(domain.producer.attempts).toHaveLength(1)
    expect(domain.producer.attempts[0]).toMatchObject({ kind: 'cut', reason: 'unsupportedContext', detail: 'current queue may admit new work' })
    expect(domain.producer.omissions).toContain('current queue may admit new work')
    expect(domain.enumeration).toMatchObject({ existingCalendars: 'incomplete', allOwnerTraces: 'incomplete' })
    const classified = noThrow(() => classifyEnumeratedOffer(queued, draft, LIMITS))
    expect(classified).toMatchObject({ classification: 'FRAGILE', bottleneck: UNCERTIFIED_BOTTLENECK,
      kernel: { status: 'UNCERTIFIED', reason: 'domainIncomplete' } })
    expect(classified.kernel.omissions).toContain('unsupportedContext: current queue may admit new work')
  })
})

describe('558-T guards: rival issuer, absent industry, raised cap, short span, tariff saturation', () => {
  it('E7: a rival issuer or an absent industry runs no producer (attempts [], work 1), both flags incomplete, the rival omission carried, FRAGILE/UNCERTIFIED, never a throw', () => {
    const w = world(), state = twoWeek(w, LEAD_CELL), now = state.market.tick
    const rivalId = state.hollywood!.businesses[0]!.studioId
    expect(rivalId).not.toBe(player(state))
    const cases: readonly { label: string; state: GameState; draft: PromiseDraft }[] = [
      { label: 'rival issuer', state, draft: { ...rootDraft(state, w.ids.lead), issuerStudioId: rivalId } },
      { label: 'absent industry', state: { ...state, hollywood: null }, draft: rootDraft(state, w.ids.lead) },
    ]
    for (const c of cases) {
      const claims = collectPromiseClaims(c.state, c.draft)
      expect(claims.coverage, c.label).toEqual({ claimsAndHolds: 'incomplete', omissions: [RIVAL_OMISSION] })
      const domain = noThrow(() => enumerateOwnerTraces(c.state, claims, LIMITS))
      expect(domain.producer.attempts, c.label).toEqual([])
      expect(domain.work, c.label).toBe(1)
      expect(domain.work).toBe(expectedEnumeratorWork(c.state, claims))
      expect(domain.enumeration, c.label).toMatchObject({ existingCalendars: 'incomplete', allOwnerTraces: 'incomplete' })
      expect(domain.floors).toEqual({ freshTakeWeek: now + FRESH_TAKE_OFFSET })
      const classified = noThrow(() => classifyEnumeratedOffer(c.state, c.draft, LIMITS))
      expect(classified, c.label).toMatchObject({ classification: 'FRAGILE', bottleneck: UNCERTIFIED_BOTTLENECK,
        kernel: { status: 'UNCERTIFIED', reason: 'domainIncomplete' } })
      expect(classified.kernel.omissions).toContain(RIVAL_OMISSION)
    }
  })

  it('E9 (555-B Q7): limits.work 200001 surfaces the Started producer\'s own refusal (replay :2679) unrelabelled — not the kernel\'s message, not a cut', () => {
    const w = world(), state = twoWeek(w, LEAD_CELL), draft = rootDraft(state, w.ids.lead), claims = collectPromiseClaims(state, draft)
    const raised: CapacityLimits = { ...LIMITS, work: 200001 }
    const thrown = (run: () => unknown): string => {
      try { run() } catch (error) { return (error as Error).message }
      throw new Error('E9: the raised cap was accepted or relabelled as a cut instead of thrown')
    }
    for (const message of [thrown(() => enumerateOwnerTraces(state, claims, raised)), thrown(() => classifyEnumeratedOffer(state, draft, raised))]) {
      expect(message).toMatch(/limits may only lower the published caps/)
      expect(message).not.toMatch(/work limit exceeds the governed maximum/) // the kernel's guard (:977) is never reached
    }
    expect(() => enumerateOwnerTraces(state, claims, LIMITS)).not.toThrow()
  })

  it('E9 (555-B Q7): a span below the horizon distance is the producer\'s sizeLimit cut before any plan (replay :549); the certificate stays incomplete and the kernel answers UNCERTIFIED/sizeLimit (:1013), never PROVEN_*', () => {
    const w = world(), state = twoWeek(w, LEAD_CELL), draft = rootDraft(state, w.ids.lead), claims = collectPromiseClaims(state, draft)
    const short: CapacityLimits = { ...LIMITS, span: 1 }
    expect(claims.horizonEndWeek - claims.now.week).toBeGreaterThan(short.span)
    const domain = noThrow(() => enumerateOwnerTraces(state, claims, short))
    expect(domain.producer.attempts).toEqual([])
    expect(domain.producer.omissions).toEqual(['sizeLimit', 'replay span exceeds limit']) // first-slice RED 15 shape
    expect(domain.enumeration).toMatchObject({ existingCalendars: 'incomplete', allOwnerTraces: 'incomplete' })
    const classified = noThrow(() => classifyEnumeratedOffer(state, draft, short))
    expect(classified).toMatchObject({ classification: 'FRAGILE', bottleneck: UNCERTIFIED_BOTTLENECK, kernel: { status: 'UNCERTIFIED', reason: 'sizeLimit' } })
    expect(classified.kernel.omissions).toContain('replay span exceeds limit')
  })

  it('addition (v) (555-B Q5): w_e is charged and saturated against limits.work BEFORE any run — the replay\'s cut shape (:2686-2687) with the enumerator label, both flags incomplete, kernel UNCERTIFIED/workLimit at workUsed = limit', () => {
    const w = world(), state = twoWeek(w, LEAD_CELL), draft = rootDraft(state, w.ids.lead), claims = collectPromiseClaims(state, draft)
    const tiny: CapacityLimits = { ...LIMITS, work: 1 }
    expect(expectedEnumeratorWork(state, claims)).toBeGreaterThan(tiny.work)
    const domain = noThrow(() => enumerateOwnerTraces(state, claims, tiny))
    expect(domain.producer).toMatchObject({ fixedHolds: [], attempts: [], preparationWork: tiny.work })
    expect([...domain.producer.omissions, ...domain.enumeration.omissions]).toContain(ENUMERATOR_WORK_CUT)
    expect(domain.enumeration).toMatchObject({ existingCalendars: 'incomplete', allOwnerTraces: 'incomplete' })
    expect(domain.work).toBe(expectedEnumeratorWork(state, claims)) // RESOLUTION: `work` reports the charged tariff; the bill is the saturated producer.preparationWork
    const classified = noThrow(() => classifyEnumeratedOffer(state, draft, tiny))
    expect(classified).toMatchObject({ classification: 'FRAGILE', bottleneck: UNCERTIFIED_BOTTLENECK,
      kernel: { status: 'UNCERTIFIED', reason: 'workLimit', workUsed: tiny.work } })
  })
})

describe('558-T purity: no mutation, determinism, permutation invariance, the tariff formula', () => {
  it('E8: structuredClone equality before/after, repeated calls equal, reversed promises/firstTakes/proposals identical, w_e === 1 + N + W + N×T', () => {
    const w = world(), state = twoWeek(w, JOINT), draft = rootDraft(state, w.ids.support)
    const before = { state: clone(state), draft: clone(draft), limits: clone(LIMITS) }
    const claims = collectPromiseClaims(state, draft), claimsBefore = clone(claims)
    const domain = enumerateOwnerTraces(state, claims, LIMITS), domainBefore = clone(domain)
    const classified = classifyEnumeratedOffer(state, draft, LIMITS)
    expect(state).toEqual(before.state)
    expect(draft).toEqual(before.draft)
    expect(LIMITS).toEqual(before.limits)
    expect(Object.keys(LIMITS)).toEqual([...CANONICAL_LIMIT_KEYS])
    expect(claims).toEqual(claimsBefore)
    expect(domain).toEqual(domainBefore)
    expect(enumerateOwnerTraces(state, claims, LIMITS)).toEqual(domain)
    expect(classifyEnumeratedOffer(state, draft, LIMITS)).toEqual(classified)
    const shuffled: GameState = { ...state, promises: [...state.promises].reverse(), firstTakes: [...state.firstTakes].reverse(),
      talentMarket: { ...state.talentMarket, proposals: [...state.talentMarket.proposals].reverse() } }
    const permuted = collectPromiseClaims(shuffled, draft)
    expect(permuted).toEqual(claims)
    expect(enumerateOwnerTraces(shuffled, permuted, LIMITS)).toEqual(domain)
    expect(classifyEnumeratedOffer(shuffled, draft, LIMITS)).toEqual(classified)
    expect(domain.work).toBe(expectedEnumeratorWork(state, claims))
    expect(domain.work).toBe(1 + state.studio.activeProductions.length + state.operations.workflows.length
      + state.studio.activeProductions.length * state.firstTakes.length)
    expect(state.studio.activeProductions).toHaveLength(1) // one started picture on w.ready
    expect(domain.producer.preparationWork).toBeGreaterThanOrEqual(domain.work) // the tariff sits inside the producer bill
    expect(domain.producer.preparationWork).toBe(
      startedRef(state, claims.claimPersonIds, claims.horizonEndWeek, traceKeyOf(domain.producer), 0).preparationWork + domain.work)
  })
})

describe('558-T limits: assembleCapacityInput 5th parameter, default byte-identity, canonical limits', () => {
  it('E10 (555-B Q6/Q7): with the 5th argument assembly carries the supplied flags and omissions and drops NO_ENUMERATOR_OMISSION; without it the default reproduces RED 7\'s hand assembly; `limits` is re-literalled in canonical order and the digest ignores the caller\'s key order', () => {
    const w = world(), state = twoWeek(w, LEAD_CELL), now = state.market.tick
    const claims = collectPromiseClaims(state, rootDraft(state, w.ids.lead))
    const result = started(w), attempt = result.attempts[0]!
    if (attempt.kind !== 'complete') throw new Error('558: the Started plan on w.ready must complete (538 scenario 1)')
    // first-slice RED 7 hand assembly :541-546, verbatim
    const hand: JointTraceCapacityInput = { mode: 'jointOwnerTraces', now: { week: now, step: 0 },
      horizonEndWeek: now + 2, issuerId: player(state),
      target: claims.target, priorClaims: claims.priorClaims, foreignDebits: [], traces: [attempt.trace], fixedHolds: result.fixedHolds,
      coverage: { claimsAndHolds: 'complete', existingCalendars: 'incomplete', allOwnerTraces: 'incomplete',
        omissions: [NO_ENUMERATOR_OMISSION] },
      preparationWork: result.preparationWork + claims.work, limits: LIMITS }
    const four = assembleCapacityInput(claims, result, now + 2, LIMITS)
    expect(four).toEqual(hand)
    const supplied: EnumerationCoverage = { existingCalendars: 'complete', allOwnerTraces: 'incomplete', omissions: ['558 supplied omission'] }
    const five = assembleCapacityInput(claims, result, now + 2, LIMITS, supplied)
    expect(five.coverage).toEqual({ claimsAndHolds: 'complete', existingCalendars: 'complete', allOwnerTraces: 'incomplete',
      omissions: ['558 supplied omission'] })
    expect(five.coverage.omissions).not.toContain(NO_ENUMERATOR_OMISSION)
    const { coverage: _fiveCoverage, ...fiveRest } = five
    const { coverage: _handCoverage, ...handRest } = hand
    expect(fiveRest).toEqual(handRest) // the certificate changes coverage and nothing else
    // omissions: sorted unique union of claims ∪ producer ∪ cuts ∪ enumeration (owners :162 law extended)
    const dup: EnumerationCoverage = { existingCalendars: 'incomplete', allOwnerTraces: 'incomplete', omissions: ['zeta 558', 'alpha 558', 'alpha 558'] }
    expect(assembleCapacityInput(claims, result, now + 2, LIMITS, dup).coverage.omissions).toEqual(['alpha 558', 'zeta 558'])
    // a producer cut with the 5th argument still makes claimsAndHolds incomplete and carries the cut
    const cutProducer: ProducerResult = { fixedHolds: [], attempts: [{ kind: 'cut', traceKey: 'x', reason: 'sizeLimit', detail: 'replay span exceeds limit' }],
      preparationWork: 0, omissions: [] }
    expect(assembleCapacityInput(claims, cutProducer, now + 2, LIMITS, COMPLETE).coverage).toMatchObject({ claimsAndHolds: 'incomplete',
      omissions: ['sizeLimit: replay span exceeds limit'] }) // the certificate over a cut is the ENUMERATOR's responsibility (555 §1), not pinned here
    // canonical limits (E9 refinement, 555-B Q6): key order fixed, values equal, digest independent of the caller's literal order
    const permuted = { span: 220, work: 200000, claims: 32, units: 64, alternatives: 1024 } as CapacityLimits
    const viaPermuted = assembleCapacityInput(claims, result, now + 2, permuted, supplied)
    expect(viaPermuted.limits).toEqual(LIMITS)
    expect(Object.keys(viaPermuted.limits)).toEqual([...CANONICAL_LIMIT_KEYS])
    expect(Object.keys(five.limits)).toEqual([...CANONICAL_LIMIT_KEYS])
    expect(Object.keys(four.limits)).toEqual([...CANONICAL_LIMIT_KEYS])
    expect(capacityInputsDigest(viaPermuted)).toBe(capacityInputsDigest(five))
    expect(Object.keys(permuted)).toEqual(['span', 'work', 'claims', 'units', 'alternatives']) // the caller's object is untouched
    const draft = rootDraft(state, w.ids.lead)
    const a: DetachedOfferClassification = classifyEnumeratedOffer(state, draft, LIMITS)
    expect(classifyEnumeratedOffer(state, draft, permuted).inputsDigest).toBe(a.inputsDigest)
  })
})
