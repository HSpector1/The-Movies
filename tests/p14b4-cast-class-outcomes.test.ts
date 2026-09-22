// Installed after T0 KEEP and exact remote preservation a76242f2f4bdfda98e38ec706e3110ad6a9bb957.
// Original inert-draft commentary below is retained as provenance; actual RED recorded separately.
// INERT / UNEXECUTED, pre-T0. Intended tests/p14b4-cast-class-outcomes.test.ts.
// Read-only preparation source:89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde.
// Reviewed plan SHA256:382252e23b6353acf602d87f38032ff961e9f7f9740bbfdf2b2ae368c30df4e4.
// Actual owner routes only: submit/attach/settle, tick, advanceManagedProductions,
// advancePromisesWeek, player cancel. No fake binding, first-take or outcome ID.
// Labeled synthetic outcome probes change selected OPEN promise MATERIAL only;
// they are not genuine historical tagged commitments or offerability evidence.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { applyActions, hiringMarketIds, tick } from '../src/core/index.js'
import { advancePromisesWeek, attachPromise } from '../src/core/promises.js'
import * as operationsModule from '../src/core/operations.js'
import { productionTechnologyView } from '../src/core/technologyProduction.js'
import { currentProposals, submitProposal } from '../src/core/talentMarket.js'
import { exportSave, importSave, makeSave, migrateToV31, validateSaveV29, validateSaveV31 } from '../src/core/save.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, CastSlot, GameState, ProfessionalPromise } from '../src/core/types.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './helpers/p14b2-fixtures.js'

const CLASSES = ['lead', 'leadOrAntagonist'] as const
type SeatClass = typeof CLASSES[number]
const SLOTS = ['lead', 'antagonist', 'support'] as const
const p2 = (seatClass: SeatClass, count = 1) => ({
  family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' as const,
  predicate: { kind: 'castRoleCount' as const, count, seatClass },
})
const p1 = () => ({ family: 'APPEARANCE_COUNT' as const, predicate: { count: 1 } })
const legacyP2 = () => ({ family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' as const, predicate: { count: 1 } })
type Material = ReturnType<typeof p2> | ReturnType<typeof p1> | ReturnType<typeof legacyP2>
type Prepared = { state: GameState; studioId: string; productionId: string; promiseId: string; slot: CastSlot }
const BOUND_NAME = 'genuine-v29-bound-open-p1'
const BOUND_PINS = {
  gzip: '48ec1b4474c2d808cae8d689dde74b8695fa5a95f2b51499a384a189e7fb880e',
  raw: '9d1a1ea177f021477fbd73d401e76bbb4a0448a680253082a100c1e5246862d9',
  tested: '89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde',
  published: 'c06db6eae2a1350317c018c6f108d115dcba7b19',
}
const oldPath = (suffix: string) =>
  new URL('./fixtures/p14/genuine-v29-pre-p2/' + BOUND_NAME + suffix, import.meta.url)
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')

beforeAll(() => {
  assert.match(BOUND_PINS.gzip, /^[a-f0-9]{64}$/, 'T0 NOT COMPLETE: independent genuine gzip pin unset')
  assert.match(BOUND_PINS.raw, /^[a-f0-9]{64}$/, 'T0 NOT COMPLETE: independent genuine raw pin unset')
  assert.match(BOUND_PINS.tested, /^[a-f0-9]{40}$/, 'T0 NOT COMPLETE: accepted tested producer unset')
  assert.match(BOUND_PINS.published, /^[a-f0-9]{40}$/, 'T0 NOT COMPLETE: accepted published producer unset')
  for (const suffix of ['.json.gz', '.provenance.json']) {
    assert.ok(existsSync(oldPath(suffix)), 'T0 NOT COMPLETE: genuine bound-open corpus missing')
  }
})

function root(state: GameState, promiseId: string): ProfessionalPromise {
  const rows = state.promises.filter((p) => p.promiseId === promiseId)
  expect(rows).toHaveLength(1)
  return rows[0]!
}
function binding(state: GameState, promiseId: string): void {
  const promise = root(state, promiseId)
  assert.notEqual(promise.contractId, null)
  const rows = state.hollywood!.employment.filter((e) => e.contractId === promise.contractId)
  expect(rows).toHaveLength(1)
  expect(rows[0]!.studioId).toBe(promise.issuerStudioId)
  expect(rows[0]!.terms.talentId).toBe(promise.beneficiaryPersonId)
  expect(rows[0]!.terms.startWeek).toBeLessThanOrEqual(state.market.tick)
  expect(state.talentMarket.receipts).toContainEqual(expect.objectContaining({
    kind: 'settled', talentId: promise.beneficiaryPersonId, studioId: promise.issuerStudioId,
    week: rows[0]!.terms.startWeek,
  }))
}
function live(state: GameState): GameState {
  // Existing live writer is the governed strict V31 validation entry after B5.
  // Do not manually stamp a save version or invent a new outcome-test API.
  const validated = makeSave(state)
  expect(validated.saveVersion).toBe(31)
  return validated.state
}
function production(prepared: Prepared) {
  const rows = prepared.studioId === player(prepared.state) ? prepared.state.studio.activeProductions
    : prepared.state.hollywood!.businesses.find((b) => b.studioId === prepared.studioId)!.productions
  const found = rows.find((p) => p.id === prepared.productionId)
  assert.ok(found, 'fixture prerequisite: actual active production missing')
  return found
}
function takes(prepared: Prepared) {
  return prepared.state.firstTakes.filter((take) => take.productionId === prepared.productionId)
}
function outcomeReceipts(state: GameState, beneficiaryIds?: readonly string[]) {
  return state.talentMarket.receipts.filter((receipt) => receipt.kind === 'promiseOutcome'
    && (beneficiaryIds === undefined || beneficiaryIds.includes(receipt.talentId)))
}
function ownOutcome(state: GameState, promiseId: string) {
  binding(state, promiseId)
  const promise = root(state, promiseId)
  assert.notEqual(promise.outcomeEventId, null)
  const rows = state.talentMarket.receipts.filter((r) => r.eventId === promise.outcomeEventId)
  expect(rows).toHaveLength(1)
  expect(rows[0]).toMatchObject({ kind: 'promiseOutcome', week: promise.outcomeWeek,
    talentId: promise.beneficiaryPersonId, studioId: promise.issuerStudioId })
  expect(promise.evidenceRefs).not.toContain(promise.outcomeEventId)
  return rows[0]!
}
function satisfied(state: GameState, promiseId: string, evidence: readonly string[]) {
  const promise = root(state, promiseId)
  expect(promise).toMatchObject({ outcome: 'SATISFIED', progress: promise.predicate.count })
  expect(promise.evidenceRefs).toEqual(evidence)
  ownOutcome(state, promiseId)
  return promise
}

let oldBoundCache: { state: GameState; promiseId: string } | undefined
function oldBound() {
  if (oldBoundCache === undefined) {
    const compressed = readFileSync(oldPath('.json.gz'))
    const raw = gunzipSync(compressed).toString('utf8')
    expect(sha(compressed)).toBe(BOUND_PINS.gzip)
    expect(sha(raw)).toBe(BOUND_PINS.raw)
    const provenance = JSON.parse(readFileSync(oldPath('.provenance.json'), 'utf8'))
    expect(provenance.filename).toBe(BOUND_NAME + '.json.gz')
    expect(provenance.compressedSha256).toBe(BOUND_PINS.gzip)
    expect(provenance.uncompressedSha256).toBe(BOUND_PINS.raw)
    expect(provenance.authority).toMatchObject({ testedSourceSha: BOUND_PINS.tested,
      publishedRecoverySha: BOUND_PINS.published, saveVersion: 29, promiseRulesVersion: 3 })
    expect(provenance.observedHeadSha).toBe(BOUND_PINS.published)
    const saved = validateSaveV29(JSON.parse(raw)) // actual frozen old reader, before any variant
    expect(exportSave(saved)).toBe(raw)
    expect(provenance.focus).toHaveLength(2)
    const promiseId: unknown = provenance.focus[0].promiseId
    assert.ok(typeof promiseId === 'string')
    const state: GameState = structuredClone(migrateToV31(saved).state) // the governed lift: the empty relationship root only
    const promised = root(state, promiseId)
    expect(promised).toMatchObject({ family: 'APPEARANCE_COUNT', outcome: null, progress: 0, evidenceRefs: [] })
    expect(promised.feasibilityReceipt).toEqual(provenance.focus[0].originalFeasibilityReceipt)
    binding(state, promiseId)
    oldBoundCache = { state: live(state), promiseId }
  }
  return structuredClone(oldBoundCache)
}

function playerPayload(state: GameState, promiseId: string, slot: CastSlot, prefer: readonly string[] = []): Extract<Action, { kind: 'greenlight' }>['production'] {
  const promised = root(state, promiseId)
  const available = state.contracts.filter((c) => c.startWeek <= state.market.tick && state.market.tick < c.endWeekExclusive)
    .map((c) => state.talent.find((p) => p.id === c.talentId)!)
  const employed = available.filter((p) => p.role === 'actor' && p.id !== promised.beneficiaryPersonId).map((p) => p.id)
  // 600-T4 (record 616 R-6 (iv)): `prefer` is the player's CAST CHOICE for the complementary seats, in
  // order, before the default contract-order fill; each preferred person must already be an employed
  // non-focus actor on this state (no binding, contract or person is invented).
  for (const id of prefer) assert.ok(employed.includes(id), 'fixture prerequisite: preferred complementary actor is not an employed non-focus actor')
  const actorIds = [...prefer, ...employed.filter((id) => !prefer.includes(id))]
  assert.ok(actorIds.length >= 2, 'fixture prerequisite: two lawful complementary actors missing')
  const cast: Record<CastSlot, string> = { lead: '', antagonist: '', support: '' }
  cast[slot] = promised.beneficiaryPersonId
  for (const other of SLOTS.filter((candidate) => candidate !== slot)) cast[other] = actorIds.shift()!
  const writer = available.find((p) => p.role === 'writer')
  const director = available.find((p) => p.role === 'director')
  const craft = available.find((p) => p.role === 'craft')
  assert.ok(writer && director && craft, 'fixture prerequisite: real complementary crew missing')
  expect(new Set([writer.id, director.id, craft.id, ...Object.values(cast)]).size).toBe(6)
  const used = new Set([...state.studio.activeProductions.map((p) => p.conceptId),
    ...state.studio.releasedFilms.map((p) => p.conceptId), ...state.scriptDevelopment.projects.map((p) => p.conceptId)])
  const concept = state.concepts.find((c) => !used.has(c.id))
  assert.ok(concept, 'fixture prerequisite: no distinct unused existing stock concept')
  return { conceptId: concept.id, writerId: writer.id, directorId: director.id, cast, craftIds: [craft.id],
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    budget: { negative: concept.baseNegativeCost, marketing: 0 } }
}
function playerToFive(state: GameState, promiseId: string, slot: CastSlot, prefer: readonly string[] = []): Prepared {
  binding(state, promiseId)
  const payload = playerPayload(state, promiseId, slot, prefer)
  state = applyActions(state, [{ kind: 'greenlight', production: payload }])
  const productionId = state.studio.activeProductions.at(-1)!.id
  expect(state.firstTakes.some((take) => take.productionId === productionId)).toBe(false)
  state = tick(tick(tick(state)))
  const rehearsal = state.operations.workflows.find((w) => w.productionId === productionId)
  assert.ok(rehearsal)
  expect(rehearsal.phase).toBe('rehearsal')
  state = applyActions(state, [{ kind: 'setProductionSetupRecipe', productionId,
    recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: rehearsal.planRevision }])
  for (let steps = 0; state.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks !== 5; steps++) {
    if (steps >= 40) throw new Error('UNEXECUTED prerequisite: player never reached shooting entry within40 actual ticks')
    state = tick(state)
  }
  const prepared = { state: live(state), studioId: player(state), productionId, promiseId, slot }
  expect(production(prepared).cast[slot]).toBe(root(state, promiseId).beneficiaryPersonId)
  expect(takes(prepared)).toEqual([])
  expect(state.operations.workflows.find((w) => w.productionId === productionId)!.shootingTask?.status).toBe('unassigned')
  expect(productionTechnologyView(state, productionId).locked).toBe(true)
  expect(productionTechnologyView(state, productionId).lockedWeek).not.toBeNull()
  expect(root(state, promiseId).outcome).toBeNull()
  return prepared
}
const playerCache = new Map<CastSlot, Prepared>()
function playerAtFive(slot: CastSlot): Prepared {
  if (!playerCache.has(slot)) {
    const old = oldBound()
    playerCache.set(slot, playerToFive(old.state, old.promiseId, slot))
  }
  return structuredClone(playerCache.get(slot)!)
}

type RivalWorlds = { slots: Record<CastSlot, Prepared>; genuine: Prepared }
let rivalCache: RivalWorlds | undefined
function rivalWorlds(): RivalWorlds {
  if (rivalCache !== undefined) return structuredClone(rivalCache)
  // 600-T4 (record 616 R-6; 600-R Q6 (iii)): the default seed never meets `genuine` within 350 ticks (its
  // only bound tagged root is to a craft worker never cast; 600-T2 D.1). 'seed-b' is the first candidate
  // where THIS search meets both prerequisites: at w215 all three slots on ONE rival film
  // (studio-bc14baf6-r01:film:23) and genuine = that lead root (scan log 600-T4-scan-A-rival-seed-b-seed-d.log).
  // Slot mapping since the final seating preference landed (fc1c7b07, record 621; 619-T2 comment sweep, file run
  // once 23/23): lead promise-8 (r01-4, tagged leadOrAntagonist), antagonist promise-4 (r01-2, tagged
  // leadOrAntagonist), support promise-6 (r01-3, P1). Before it the antagonist was promise-6 and the support
  // promise-4 (a G10-a permutation on seed-b r01 f23; the search, the week, the film and `genuine` are unchanged).
  // Every other case in this file keeps its own default-seed chain.
  let state = p13aGeneratedStudio('seed-b')
  const slots: Partial<Record<CastSlot, Prepared>> = {}
  let genuine: Prepared | undefined
  for (let steps = 0; steps <= 350; steps++) {
    for (const business of state.hollywood!.businesses) for (const film of business.productions) {
      if (film.remainingTicks !== 5 || state.firstTakes.some((take) => take.productionId === film.id)) continue
      for (const slot of SLOTS) {
        const promise = state.promises.find((p) => p.issuerStudioId === business.studioId
          && p.beneficiaryPersonId === film.cast[slot] && p.contractId !== null && p.outcome === null
          && p.progress === 0 && p.windowStartWeek <= state.market.tick + 1 && state.market.tick + 1 < p.dueWeekExclusive)
        if (promise === undefined) continue
        const candidate = { state: structuredClone(state), studioId: business.studioId,
          productionId: film.id, promiseId: promise.promiseId, slot }
        binding(state, promise.promiseId)
        if (slots[slot] === undefined) slots[slot] = candidate
        const predicate = promise.predicate
        if (genuine === undefined && promise.family === 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'
          && 'kind' in predicate && predicate.kind === 'castRoleCount' && 'seatClass' in predicate
          && (slot === 'lead' || (slot === 'antagonist' && predicate.seatClass === 'leadOrAntagonist'))) genuine = candidate
      }
    }
    if (slots.lead !== undefined && slots.antagonist !== undefined && slots.support !== undefined && genuine !== undefined) {
      rivalCache = { slots: { lead: slots.lead, antagonist: slots.antagonist, support: slots.support }, genuine }
      return structuredClone(rivalCache)
    }
    if (steps < 350) state = tick(state)
  }
  throw new Error('UNEXECUTED natural rival prerequisites absent by350: actual bound OPEN roots in each cast slot AND genuine tagged eligible take required; no synthetic substitute')
}
function atFive(issuer: 'player' | 'rival', slot: CastSlot): Prepared {
  return issuer === 'player' ? playerAtFive(slot) : rivalWorlds().slots[slot]
}

function variant(base: Prepared, material: Material, window: { start?: number; due?: number } = {}): Prepared {
  // Explicit IN-MEMORY OUTCOME-OWNER VARIANT, not a lawful authoring claim:
  // only this genuinely bound OPEN root's family/predicate/window is changed.
  const before = JSON.stringify(base.state)
  const original = root(base.state, base.promiseId)
  binding(base.state, base.promiseId)
  expect(original).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [] })
  const changed = { ...original, ...material, windowStartWeek: window.start ?? original.windowStartWeek,
    dueWeekExclusive: window.due ?? original.dueWeekExclusive }
  const state = live({ ...structuredClone(base.state),
    promises: base.state.promises.map((p) => p.promiseId === original.promiseId ? structuredClone(changed) : structuredClone(p)) })
  expect(root(state, base.promiseId).feasibilityReceipt).toEqual(original.feasibilityReceipt)
  expect(root(state, base.promiseId).contractId).toBe(original.contractId)
  expect(state.hollywood!.employment).toEqual(base.state.hollywood!.employment)
  expect(state.firstTakes).toEqual(base.state.firstTakes)
  expect(state.talentMarket).toEqual(base.state.talentMarket)
  expect(JSON.stringify(base.state)).toBe(before)
  return { ...base, state }
}

function complete(prepared: Prepared) {
  let state = prepared.state
  const beforeFilm = production(prepared)
  expect(beforeFilm.remainingTicks).toBe(5)
  expect(takes(prepared)).toEqual([])
  expect(productionTechnologyView(state, prepared.productionId, prepared.studioId).locked).toBe(true)
  if (prepared.studioId === player(state)) {
    state = applyActions(state, [{ kind: 'assignShootingDirector', productionId: prepared.productionId, directorId: beforeFilm.directorId },
      { kind: 'scheduleShootingTake', productionId: prepared.productionId }])
    expect(state.firstTakes.some((take) => take.productionId === prepared.productionId)).toBe(false)
  }
  const advance = operationsModule.advanceManagedProductions
  const observed: { before: number; after: number | undefined; status: string | null; blocker: unknown; emitted: string[] }[] = []
  const spy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
    const result = advance(...args) // unchanged actual owner arguments and result
    const film = args[1].find((p) => p.id === prepared.productionId)
    if (film !== undefined) {
      const workflow = args[0].workflows.find((w) => w.productionId === film.id)
      observed.push({ before: film.remainingTicks,
        after: result.productions.find((p) => p.id === film.id)?.remainingTicks,
        status: workflow?.shootingTask?.status ?? null, blocker: workflow?.blocker ?? null,
        emitted: result.firstTakes.filter((p) => p.id === film.id).map((p) => p.id) })
    }
    return result
  })
  let after: GameState
  try { after = tick(state) } finally { spy.mockRestore() }
  expect(observed).toEqual([{ before: 5, after: 4, status: 'scheduled', blocker: null, emitted: [prepared.productionId] }])
  const rows = after.firstTakes.filter((take) => take.productionId === prepared.productionId)
  expect(rows).toHaveLength(1)
  const take = rows[0]!
  expect(take).toMatchObject({ productionId: prepared.productionId, studioId: prepared.studioId,
    week: state.market.tick + 1, directorId: beforeFilm.directorId, cast: beforeFilm.cast })
  return { state: live(after), take }
}

function sign(state: GameState, role: 'actor' | 'writer' | 'director' | 'craft', termWeeks = 208) {
  for (let steps = 0; steps < 60; steps++) {
    const person = hiringMarketIds(state, state.market.tick).map((id) => state.talent.find((p) => p.id === id)).find((p) => p?.role === role)
    if (person !== undefined) return { state: applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks }]), id: person.id }
    state = tick(state)
  }
  throw new Error('UNEXECUTED prerequisite: no actual hireable ' + role + ' within60 weeks')
}
function realPlayerPromise(seatClass: SeatClass): { state: GameState; promiseId: string } {
  let state = fund(p13aGeneratedStudio())
  const target = sign(state, 'actor', 52); state = target.state
  for (const role of ['writer', 'director', 'actor', 'actor', 'craft'] as const) state = sign(state, role).state
  const contract = state.contracts.find((c) => c.talentId === target.id)
  assert.ok(contract)
  const start = contract.endWeekExclusive
  const stage = 'facility-soundstage-07'
  expect(state.operations.facilities.some((f) => f.id === stage && f.capability === 'soundstage')).toBe(true)
  const mounted = state.sets.find((s) => s.mountedOn === stage && s.status !== 'retired')
  if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
  state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: stage } }])
  state = advanceTo(state, state.market.tick + TUNING.SET_BUILD_WEEKS_BAND_HIGH)
  expect(state.market.tick).toBeLessThanOrEqual(start - 7)
  state = advanceTo(state, start - 7)
  state = submitProposal(state, { talentId: target.id, issuerStudioId: player(state), termWeeks: 52, premiumTier: 1.25 })
  state = attachPromise(state, target.id, player(state), { ...p2(seatClass),
    windowStartWeek: start, dueWeekExclusive: start + 40 })
  const proposal = currentProposals(state, target.id).find((p) => p.issuerStudioId === player(state))!
  expect(proposal.promises).toHaveLength(1)
  const promiseId = proposal.promises[0]!
  expect(root(state, promiseId)).toMatchObject({ version: 4, contractId: null, predicate: p2(seatClass).predicate,
    feasibilityReceipt: { rulesVersion: 4, classification: 'REASONABLY_ACHIEVABLE' } })
  state = advanceTo(state, start)
  binding(state, promiseId)
  expect(root(state, promiseId).feasibilityReceipt).toMatchObject({ rulesVersion: 4, week: start, classification: 'REASONABLY_ACHIEVABLE' })
  expect(root(state, promiseId).outcome).toBeNull()
  expect(currentProposals(state, target.id)).toEqual([])
  return { state: live(state), promiseId }
}

describe('P14B4 genuine submit/settle/take routes, no synthetic commitments', () => {
  it.each(CLASSES)('PLAYER: actual offered %s P2 settles and the real class-compatible take satisfies it', (seatClass) => {
    const bound = realPlayerPromise(seatClass)
    const prepared = playerToFive(bound.state, bound.promiseId, seatClass === 'lead' ? 'lead' : 'antagonist')
    expect(root(prepared.state, bound.promiseId).outcome).toBeNull()
    const after = complete(prepared)
    satisfied(after.state, bound.promiseId, [after.take.eventId])
    const reloaded = validateSaveV31(importSave(exportSave(makeSave(after.state))))
    expect(reloaded.state.promises).toEqual(after.state.promises)
  })

  it('RIVAL: a genuinely naturally authored tagged commitment binds and qualifies through the real scheduled owner transition', () => {
    const prepared = rivalWorlds().genuine
    const original = structuredClone(root(prepared.state, prepared.promiseId))
    expect(original.family).toBe('LEAD_OR_SIGNIFICANT_ROLE_COUNT')
    expect(original.version).toBe(4)
    expect(original.feasibilityReceipt.rulesVersion).toBe(4)
    binding(prepared.state, original.promiseId)
    const after = complete(prepared)
    const kept = satisfied(after.state, original.promiseId, [after.take.eventId])
    expect(kept.predicate).toEqual(original.predicate)
    expect(kept.contractId).toBe(original.contractId)
  })
})

describe('P14B4 labeled outcome-owner probes on real bound roots and actual casts', () => {
  const matrix = (['player', 'rival'] as const).flatMap((issuer) =>
    CLASSES.flatMap((seatClass) => SLOTS.map((slot) => ({ issuer, seatClass, slot,
      qualifies: slot === 'lead' || (seatClass === 'leadOrAntagonist' && slot === 'antagonist') }))))
  it.each(matrix)('$issuer $seatClass with actual $slot seat: qualification=$qualifies', ({ issuer, seatClass, slot, qualifies }) => {
    const prepared = variant(atFive(issuer, slot), p2(seatClass))
    const after = complete(prepared)
    expect(after.take.cast[slot]).toBe(root(after.state, prepared.promiseId).beneficiaryPersonId)
    if (qualifies) satisfied(after.state, prepared.promiseId, [after.take.eventId])
    else expect(root(after.state, prepared.promiseId)).toMatchObject({
      progress: 0, evidenceRefs: [], outcome: null, outcomeWeek: null, outcomeEventId: null })
  })

  it.each(['player', 'rival'] as const)('%s support qualifies for P1 and shape-legacy count-only P2, not tagged P2', (issuer) => {
    for (const material of [p1(), legacyP2()]) {
      const prepared = variant(atFive(issuer, 'support'), material)
      const receiptBefore = structuredClone(root(prepared.state, prepared.promiseId).feasibilityReceipt)
      const after = complete(prepared)
      const kept = satisfied(after.state, prepared.promiseId, [after.take.eventId])
      expect(kept.predicate).toEqual({ count: 1 })
      expect(kept.feasibilityReceipt).toEqual(receiptBefore)
    }
  })

  it('shooting entry/technology lock and an unscheduled tick produce no first take or tagged-P2 outcome', () => {
    const prepared = variant(playerAtFive('lead'), p2('lead'))
    expect(productionTechnologyView(prepared.state, prepared.productionId).locked).toBe(true)
    const held = tick(prepared.state)
    expect(held.studio.activeProductions.find((p) => p.id === prepared.productionId)!.remainingTicks).toBe(5)
    expect(held.firstTakes.filter((take) => take.productionId === prepared.productionId)).toEqual([])
    expect(root(held, prepared.promiseId)).toEqual(root(prepared.state, prepared.promiseId))
    const completed = complete({ ...prepared, state: live(held) })
    satisfied(completed.state, prepared.promiseId, [completed.take.eventId])
  })

  it.each(['player', 'rival'] as const)('%s half-open window counts start, excludes before-start and excludes due', (issuer) => {
    const base = atFive(issuer, 'lead')
    const nextWeek = base.state.market.tick + 1
    const original = root(base.state, base.promiseId)
    expect(original.dueWeekExclusive).toBeGreaterThan(nextWeek + 1)
    const atStart = variant(base, p2('lead'), { start: nextWeek })
    const startResult = complete(atStart)
    expect(startResult.take.week).toBe(nextWeek)
    satisfied(startResult.state, base.promiseId, [startResult.take.eventId])
    const beforeStart = variant(base, p2('lead'), { start: nextWeek + 1 })
    const early = complete(beforeStart)
    expect(root(early.state, base.promiseId)).toMatchObject({ progress: 0, outcome: null, evidenceRefs: [] })
    const later = advancePromisesWeek(tick(early.state))
    expect(root(later, base.promiseId)).toMatchObject({ progress: 0, outcome: null, evidenceRefs: [] })
    const atDue = variant(base, p2('lead'), { due: nextWeek })
    const dueResult = complete(atDue)
    expect(dueResult.take.week).toBe(nextWeek)
    expect(root(dueResult.state, base.promiseId)).toMatchObject({ progress: 0, outcome: 'BROKEN',
      outcomeWeek: nextWeek, evidenceRefs: [] })
    ownOutcome(dueResult.state, base.promiseId)
  })

  it('count2 requires TWO real distinct productions; repeated owner passes/ticks on one picture never add another event', () => {
    const initial = variant(playerAtFive('lead'), p2('lead', 2))
    const first = complete(initial)
    expect(root(first.state, initial.promiseId)).toMatchObject({ progress: 1, outcome: null })
    const repeated = advancePromisesWeek(advancePromisesWeek(tick(first.state)))
    expect(root(repeated, initial.promiseId)).toMatchObject({ progress: 1, outcome: null })
    expect(repeated.firstTakes.filter((take) => take.productionId === initial.productionId)).toHaveLength(1)
    const cancelled = applyActions(repeated, [{ kind: 'cancel', productionId: initial.productionId }])
    expect(root(cancelled, initial.promiseId)).toMatchObject({ progress: 1, outcome: null })
    const secondReady = playerToFive(cancelled, initial.promiseId, 'lead')
    expect(secondReady.productionId).not.toBe(initial.productionId)
    expect(secondReady.state.market.tick + 1).toBeLessThan(root(secondReady.state, initial.promiseId).dueWeekExclusive)
    const second = complete(secondReady)
    expect(second.take.productionId).not.toBe(first.take.productionId)
    satisfied(second.state, initial.promiseId, [first.take.eventId, second.take.eventId])
  })

  it('two genuinely bound beneficiaries share one completed take but receive DISTINCT own outcome receipts exactly once', () => {
    // 600-T4 (record 616 R-6 (iv)): a CAST CHOICE, never an invented binding. The issuer's other genuinely
    // bound OPEN beneficiary is read from the state (the frozen fixture carries exactly one); playerPayload's
    // contract-order fill seats that person third, so the player chooses them for the antagonist seat
    // through the same playerPayload/greenlight route (scan log 600-T4-scan-B-second-beneficiary.log).
    const old = oldBound()
    const others = old.state.promises.filter((p) => p.issuerStudioId === player(old.state) && p.promiseId !== old.promiseId
      && p.contractId !== null && p.outcome === null).map((p) => p.beneficiaryPersonId)
    expect(others).toHaveLength(1)
    let prepared = variant(playerToFive(old.state, old.promiseId, 'lead', others), p2('lead'))
    const film = production(prepared)
    const other = prepared.state.promises.find((p) => p.issuerStudioId === prepared.studioId
      && p.beneficiaryPersonId === film.cast.antagonist && p.contractId !== null && p.outcome === null)
    assert.ok(other, 'UNEXECUTED prerequisite: actual second bound OPEN beneficiary is not in antagonist; never invent a binding')
    const both = variant({ ...prepared, promiseId: other.promiseId, slot: 'antagonist' }, p2('leadOrAntagonist'))
    prepared = { ...prepared, state: both.state }
    const after = complete(prepared)
    const left = satisfied(after.state, prepared.promiseId, [after.take.eventId])
    const right = satisfied(after.state, other.promiseId, [after.take.eventId])
    expect(left.outcomeEventId).not.toBe(right.outcomeEventId)
    const original = [structuredClone(left), structuredClone(right)]
    const allAtTake = structuredClone(outcomeReceipts(after.state))
    const sameWeek = advancePromisesWeek(advancePromisesWeek(after.state))
    expect(sameWeek.market.tick).toBe(after.state.market.tick)
    expect(outcomeReceipts(sameWeek)).toEqual(allAtTake)
    expect([root(sameWeek, left.promiseId), root(sameWeek, right.promiseId)]).toEqual(original)
    const beneficiaries = [left.beneficiaryPersonId, right.beneficiaryPersonId]
    const affectedBeforeTick = structuredClone(outcomeReceipts(sameWeek, beneficiaries))
    const later = tick(sameWeek)
    // Other people may legitimately settle outcomes on this real later tick.
    expect(outcomeReceipts(later, beneficiaries)).toEqual(affectedBeforeTick)
    const allAfterTick = structuredClone(outcomeReceipts(later))
    const again = advancePromisesWeek(advancePromisesWeek(later))
    expect(again.market.tick).toBe(later.market.tick)
    expect(outcomeReceipts(again)).toEqual(allAfterTick)
    expect([root(again, left.promiseId), root(again, right.promiseId)]).toEqual(original)
    ownOutcome(again, left.promiseId)
    ownOutcome(again, right.promiseId)
    live(again)
  })

  it('first take THEN real player cancellation never un-satisfies or rewrites the evidence/outcome', () => {
    const prepared = variant(playerAtFive('lead'), p2('lead'))
    const after = complete(prepared)
    const kept = structuredClone(satisfied(after.state, prepared.promiseId, [after.take.eventId]))
    const outcome = structuredClone(ownOutcome(after.state, kept.promiseId))
    const affectedBeforeCancel = structuredClone(outcomeReceipts(after.state, [kept.beneficiaryPersonId]))
    const cancelled = applyActions(after.state, [{ kind: 'cancel', productionId: prepared.productionId }])
    expect(cancelled.studio.activeProductions.some((p) => p.id === prepared.productionId)).toBe(false)
    expect(root(cancelled, kept.promiseId)).toEqual(kept)
    expect(cancelled.firstTakes.find((take) => take.eventId === after.take.eventId)).toEqual(after.take)
    expect(ownOutcome(cancelled, kept.promiseId)).toEqual(outcome)
    expect(outcomeReceipts(cancelled, [kept.beneficiaryPersonId])).toEqual(affectedBeforeCancel)
    const allAfterCancel = structuredClone(outcomeReceipts(cancelled))
    const sameWeek = advancePromisesWeek(advancePromisesWeek(cancelled))
    expect(sameWeek.market.tick).toBe(cancelled.market.tick)
    expect(outcomeReceipts(sameWeek)).toEqual(allAfterCancel)
    expect(root(sameWeek, kept.promiseId)).toEqual(kept)
    live(cancelled)
    live(sameWeek)
  })
})
