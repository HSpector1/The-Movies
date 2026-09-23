// Installed after published additive7022ade and independent v2 KEEP a32ff490; original draft notes retained.
// INERT, UNEXECUTED. Intended tests/p14b4-material-evidence-core.test.ts.
// B4 plan382252; focused staging boundary, NOT a replacement for installed
// whole-save, real authoring/settlement, both-issuer, capacity or bridge tests.
// Uses the existing digest/outcome owners with actual validateSaveV31-admitted
// states. No makeSave/LIVE_SAVE_VERSION/rules4/attachment barrier and no new API.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { fnv1a64 } from '../src/core/math.js'
import { advancePromisesWeek, attachedPromiseDigest, promiseDigest } from '../src/core/promises.js'
import * as promisesModule from '../src/core/promises.js'
import * as operationsModule from '../src/core/operations.js'
import { convertV31ToV32, exportSave, migrateToV31, validateSaveV29, validateSaveV31, validateSaveV32 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { Action, CastSlot, GameState, GameStateV31, ProfessionalPromiseV30 } from '../src/core/types.js'

// P14B.7 sweep (735-T): `fixture()` stays the frozen V29->V31 proof (P14B.5's own
// migration contract, untouched below); `actualTakeInput()` then converts the
// SAME validated V31 state up to the live V32 boundary before feeding it to
// applyActions/tick, which require GameState (=GameStateV32). Two envelope
// families follow from that one fork -- Envelope/validateState/variant stay V31
// for the first describe block's staged material assertions; EnvelopeV32/
// validateStateV32/variantV32 carry the second describe block's real-gameplay
// exercise. `root`/`binding` are generic over either shape (only V32 adds a
// field neither reads), so they need no duplicate.
type Envelope = ReturnType<typeof validateSaveV31>
type EnvelopeV32 = ReturnType<typeof validateSaveV32>
const SLOTS = ['lead', 'antagonist', 'support'] as const
const CLASSES = ['lead', 'leadOrAntagonist'] as const
type SeatClass = typeof CLASSES[number]
const FAMILIES = ['APPEARANCE_COUNT', 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', 'DIRECTING_COUNT',
  'PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT'] as const
const p2 = (seatClass: SeatClass, count = 1) => ({ family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' as const,
  predicate: { kind: 'castRoleCount' as const, count, seatClass } })
const p1 = { family: 'APPEARANCE_COUNT', predicate: { count: 1 } } as const
const legacyP2 = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { count: 1 } } as const
type Material = ReturnType<typeof p2> | { family: ProfessionalPromiseV30['family']; predicate: { count: number } }
const clone = <T>(value: T): T => structuredClone(value)
const hash = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const path = (name: string) => new URL('./fixtures/p14/genuine-v29-pre-p2/' + name, import.meta.url)
const PINS = {
  'bound-open-p1': { gzip: '48ec1b4474c2d808cae8d689dde74b8695fa5a95f2b51499a384a189e7fb880e',
    raw: '9d1a1ea177f021477fbd73d401e76bbb4a0448a680253082a100c1e5246862d9',
    provenance: '18e72f4320a52739624675ca930348a4e575dafb3f565534fb7e1631de42c781' },
  'current-p1': { gzip: '4947c31baa8cf9b948edd3a75b246df56c6d924e6d624ef1e18591d977f4cca7',
    raw: '03017370f16d9d2cf211f5653650a6d41452f73f0e8b96bb4aa154a6a946f4ca',
    provenance: '8d971552112afe2c7e02501593b4fca03cd5d72be9d0b021bda20cbb175a0d89' },
} as const
function fixture(name: keyof typeof PINS) {
  const filename = 'genuine-v29-' + name
  const compressed = readFileSync(path(filename + '.json.gz'))
  const raw = gunzipSync(compressed).toString('utf8')
  const provenanceBytes = readFileSync(path(filename + '.provenance.json'))
  expect(hash(compressed)).toBe(PINS[name].gzip)
  expect(hash(raw)).toBe(PINS[name].raw)
  expect(hash(provenanceBytes)).toBe(PINS[name].provenance)
  const provenance = JSON.parse(provenanceBytes.toString('utf8'))
  expect(provenance.authority).toMatchObject({
    testedSourceSha: '89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde',
    publishedRecoverySha: 'c06db6eae2a1350317c018c6f108d115dcba7b19',
    saveVersion: 29, promiseRulesVersion: 3, protocolVersion: 4, projectionVersion: 46,
    schemaId: 'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c',
  })
  expect(provenance.observedHeadSha).toBe('c06db6eae2a1350317c018c6f108d115dcba7b19')
  const old = validateSaveV29(JSON.parse(raw)) // frozen admission BEFORE governed migration
  expect(exportSave(old)).toBe(raw)
  const migrated = migrateToV31(old)
  // P14B.5: the governed lift adds ONLY the empty relationship root (nothing recomputed).
  expect(migrated.state).toEqual({ ...old.state, relationships: [] })
  expect(validateSaveV31(migrated)).toEqual(migrated)
  const ids: string[] = []
  for (const focus of provenance.focus) {
    assert.equal(typeof focus.promiseId, 'string')
    const promise = root(migrated.state, focus.promiseId)
    expect(promise.feasibilityReceipt).toEqual(focus.originalFeasibilityReceipt)
    ids.push(focus.promiseId)
  }
  expect(ids.length).toBeGreaterThan(0)
  expect(new Set(ids).size).toBe(ids.length)
  return { old, migrated, ids }
}
function root<S extends GameStateV31>(state: S, id: string): S['promises'][number] {
  const matches = state.promises.filter((p) => p.promiseId === id)
  expect(matches).toHaveLength(1)
  return matches[0]!
}
function validateState(carrier: Envelope, state: GameStateV31): Envelope {
  // An explicit in-memory V31 input on the already governed carrier. This does
  // not stamp a historical fixture, invoke the still-V29 writer or strip tags.
  return validateSaveV31({ ...carrier, state, broadcastCache: state.broadcastItems })
}
function validateStateV32(carrier: EnvelopeV32, state: GameState): EnvelopeV32 {
  // The live-boundary twin of validateState above, for the second describe
  // block's real-gameplay states (genuinely V32-shaped once applyActions/tick
  // have touched them) -- same device, the frozen V31 reader untouched.
  return validateSaveV32({ ...carrier, state, broadcastCache: state.broadcastItems })
}
function binding(state: GameStateV31, promise: ProfessionalPromiseV30): void {
  assert.notEqual(promise.contractId, null)
  const rows = state.hollywood!.employment.filter((e) => e.contractId === promise.contractId)
  expect(rows).toHaveLength(1)
  expect(rows[0]!.studioId).toBe(promise.issuerStudioId)
  expect(rows[0]!.terms.talentId).toBe(promise.beneficiaryPersonId)
  expect(rows[0]!.terms.startWeek).toBeLessThanOrEqual(state.market.tick)
  expect(state.talentMarket.receipts).toContainEqual(expect.objectContaining({ kind: 'settled',
    talentId: promise.beneficiaryPersonId, studioId: promise.issuerStudioId, week: rows[0]!.terms.startWeek }))
}
function variant(carrier: Envelope, id: string, material: Material, window?: { start: number; due: number }): Envelope {
  const before = clone(carrier)
  const prior = root(carrier.state, id)
  expect(prior).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [], outcomeWeek: null, outcomeEventId: null, outcomeCause: null })
  const changed = { ...prior, ...material, windowStartWeek: window?.start ?? prior.windowStartWeek,
    dueWeekExclusive: window?.due ?? prior.dueWeekExclusive }
  const result = validateState(carrier, { ...clone(carrier.state),
    promises: carrier.state.promises.map((p) => p.promiseId === id ? clone(changed) : clone(p)) })
  expect(root(result.state, id).feasibilityReceipt).toEqual(prior.feasibilityReceipt)
  expect(root(result.state, id).version).toBe(prior.version)
  expect(root(result.state, id).contractId).toBe(prior.contractId)
  expect(result.state.hollywood!.employment).toEqual(carrier.state.hollywood!.employment)
  expect(result.state.firstTakes).toEqual(carrier.state.firstTakes)
  expect(result.state.talentMarket).toEqual(carrier.state.talentMarket)
  expect(carrier).toEqual(before)
  return result
}
function variantV32(carrier: EnvelopeV32, id: string, material: Material, window?: { start: number; due: number }): EnvelopeV32 {
  // The live-boundary twin of variant() above, byte-identical logic, for the
  // second describe block's carrier (genuinely V32 since actualTakeInput ran it
  // through real gameplay). Never used by the first (frozen V31) describe block.
  const before = clone(carrier)
  const prior = root(carrier.state, id)
  expect(prior).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [], outcomeWeek: null, outcomeEventId: null, outcomeCause: null })
  const changed = { ...prior, ...material, windowStartWeek: window?.start ?? prior.windowStartWeek,
    dueWeekExclusive: window?.due ?? prior.dueWeekExclusive }
  const result = validateStateV32(carrier, { ...clone(carrier.state),
    promises: carrier.state.promises.map((p) => p.promiseId === id ? clone(changed) : clone(p)) })
  expect(root(result.state, id).feasibilityReceipt).toEqual(prior.feasibilityReceipt)
  expect(root(result.state, id).version).toBe(prior.version)
  expect(root(result.state, id).contractId).toBe(prior.contractId)
  expect(result.state.hollywood!.employment).toEqual(carrier.state.hollywood!.employment)
  expect(result.state.firstTakes).toEqual(carrier.state.firstTakes)
  expect(result.state.talentMarket).toEqual(carrier.state.talentMarket)
  expect(carrier).toEqual(before)
  return result
}
const legacyDigest = (promise: ProfessionalPromiseV30) => fnv1a64(JSON.stringify([
  promise.family, promise.predicate.count, promise.windowStartWeek, promise.dueWeekExclusive,
]))
const taggedDigest = (promise: ProfessionalPromiseV30, seatClass: SeatClass) => fnv1a64(JSON.stringify([
  promise.family, promise.predicate.count, promise.windowStartWeek, promise.dueWeekExclusive, 'castRoleCount', seatClass,
]))

describe('P14B4 staged material owner, independent old formula and explicit class', () => {
  it.each(FAMILIES)('retains the exact old count-only %s formula and attached formula', (family) => {
    const { migrated, ids } = fixture('current-p1')
    const id = ids[0]!
    const input = variant(migrated, id, { family, predicate: { count: 1 } })
    const before = clone(input)
    const old = root(input.state, id)
    const expected = legacyDigest(old)
    expect(promiseDigest(old)).toBe(expected)
    expect(attachedPromiseDigest(input.state, [id])).toBe(fnv1a64(JSON.stringify([expected])))
    expect(attachedPromiseDigest(input.state, [])).toBe('')
    expect(input).toEqual(before)
  })

  it('kind/class are material; old classless P2 never aliases either new class; pure reads retain inputs', () => {
    const { migrated, ids } = fixture('current-p1')
    const id = ids[0]!
    const old = variant(migrated, id, legacyP2)
    const lead = variant(migrated, id, p2('lead'))
    const flexible = variant(migrated, id, p2('leadOrAntagonist'))
    const before = clone([old, lead, flexible])
    const materials = [old, lead, flexible].map((s) => promiseDigest(root(s.state, id)))
    expect(materials[0]).toBe(legacyDigest(root(old.state, id)))
    expect(materials[1]).toBe(taggedDigest(root(lead.state, id), 'lead'))
    expect(materials[2]).toBe(taggedDigest(root(flexible.state, id), 'leadOrAntagonist'))
    expect(new Set(materials).size).toBe(3)
    const attached = [old, lead, flexible].map((s) => attachedPromiseDigest(s.state, [id]))
    expect(new Set(attached).size).toBe(3)
    for (let index = 0; index < materials.length; index++) expect(attached[index]).toBe(fnv1a64(JSON.stringify([materials[index]])))
    expect([old, lead, flexible]).toEqual(before)
  })

  it('family, count and both window endpoints remain material without receipt/version repair', () => {
    const { migrated, ids } = fixture('current-p1')
    const id = ids[0]!
    const original = root(migrated.state, id)
    const lead = variant(migrated, id, p2('lead'))
    const candidates = [lead, variant(migrated, id, p2('lead', 2)),
      variant(migrated, id, p2('lead'), { start: original.windowStartWeek + 1, due: original.dueWeekExclusive }),
      variant(migrated, id, p2('lead'), { start: original.windowStartWeek, due: original.dueWeekExclusive - 1 })]
    const before = clone(candidates)
    const digests = candidates.map((candidate) => {
      const promise = root(candidate.state, id)
      expect(promiseDigest(promise)).toBe(taggedDigest(promise, 'lead'))
      expect(promise.feasibilityReceipt).toEqual(original.feasibilityReceipt)
      expect(promise.version).toBe(original.version)
      return attachedPromiseDigest(candidate.state, [id])
    })
    expect(new Set(digests).size).toBe(candidates.length)
    const oldP1 = variant(migrated, id, p1)
    const oldP2 = variant(migrated, id, legacyP2)
    expect(promiseDigest(root(oldP1.state, id))).not.toBe(promiseDigest(root(oldP2.state, id)))
    expect(candidates).toEqual(before)
  })
})

function payload(state: GameStateV31, targetId: string, slot: CastSlot, otherBoundPromiseId: string): Extract<Action, { kind: 'greenlight' }>['production'] {
  const available = state.contracts.filter((c) => c.startWeek <= state.market.tick && state.market.tick < c.endWeekExclusive)
    .map((c) => state.talent.find((p) => p.id === c.talentId)!)
  let actors = available.filter((p) => p.role === 'actor' && p.id !== targetId).map((p) => p.id)
  assert.ok(actors.length >= 2, 'fixture: two actual complementary actors required')
  if (slot === 'lead') {
    // V1's real contract order12,13,09,08 omitted the second bound beneficiary08.
    // Select that genuinely bound person BEFORE greenlight, never rewrite cast.
    const other = root(state, otherBoundPromiseId)
    binding(state, other)
    expect(other.outcome).toBeNull()
    expect(other.beneficiaryPersonId).not.toBe(targetId)
    const contracted = available.find((p) => p.id === other.beneficiaryPersonId)
    assert.ok(contracted, 'fixture: second bound beneficiary lacks a current real contract')
    expect(contracted.skills.acting).toBeDefined()
    expect(actors).toContain(contracted.id)
    actors = [contracted.id, ...actors.filter((id) => id !== contracted.id)]
  }
  const cast: Record<CastSlot, string> = { lead: '', antagonist: '', support: '' }
  cast[slot] = targetId
  for (const other of SLOTS.filter((s) => s !== slot)) cast[other] = actors.shift()!
  const writer = available.find((p) => p.role === 'writer')
  const director = available.find((p) => p.role === 'director')
  const craft = available.find((p) => p.role === 'craft')
  assert.ok(writer && director && craft, 'fixture: actual complementary crew required')
  expect(new Set([writer.id, director.id, craft.id, ...Object.values(cast)]).size).toBe(6)
  const used = new Set([...state.studio.activeProductions.map((p) => p.conceptId),
    ...state.studio.releasedFilms.map((f) => f.conceptId), ...state.scriptDevelopment.projects.map((p) => p.conceptId)])
  const concept = state.concepts.find((c) => !used.has(c.id))
  assert.ok(concept, 'fixture: an actual unused legacy stock concept required')
  return { conceptId: concept.id, writerId: writer.id, directorId: director.id, cast, craftIds: [craft.id],
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    budget: { negative: concept.baseNegativeCost, marketing: 0 } }
}
type Prepared = { carrier: EnvelopeV32; id: string; ids: string[]; take: GameState['firstTakes'][number]; slot: CastSlot }
const cache = new Map<CastSlot, Prepared>()
function actualTakeInput(slot: CastSlot): Prepared {
  const cached = cache.get(slot)
  if (cached !== undefined) return clone(cached)
  const { migrated, ids } = fixture('bound-open-p1')
  expect(ids).toHaveLength(2)
  const id = ids[0]!
  const frozenState = clone(migrated.state) // 662-T2: the governed V31 lift of `old` (asserted above: the empty relationship root only)
  expect(frozenState.market.tick).toBe(52)
  expect(frozenState.operations.mode).toBe('managed')
  expect(frozenState.scriptDevelopment.mode).toBe('legacy') // separate mode authorities, evidence17
  expect(frozenState.scriptDevelopment.projects).toEqual([])
  expect(frozenState.studio.activeProductions).toEqual([])
  for (const promiseId of ids) {
    const promise = root(frozenState, promiseId)
    binding(frozenState, promise)
    expect(promise).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [] })
  }
  const otherBoundPromiseId = ids.find((candidate) => candidate !== id)
  assert.ok(otherBoundPromiseId, 'fixture: distinct second genuine bound root required')
  const production = payload(frozenState, root(frozenState, id).beneficiaryPersonId, slot, otherBoundPromiseId)
  // 735-T: the caller from here on is LIVE (applyActions/tick require GameState,
  // the V32 alias) -- lift the already-validated V31 state up through the lawful
  // conversion, never by softening validateSaveV31's own refusal above.
  const migratedV32: EnvelopeV32 = convertV31ToV32({ saveVersion: 31, seed: frozenState.seed, state: frozenState, broadcastCache: frozenState.broadcastItems })
  let state: GameState = migratedV32.state
  state = applyActions(state, [{ kind: 'greenlight', production }])
  const filmId = state.studio.activeProductions.at(-1)!.id
  expect(state.studio.activeProductions.at(-1)!.cast).toEqual(production.cast)
  state = tick(tick(tick(state)))
  const rehearsal = state.operations.workflows.find((w) => w.productionId === filmId)
  assert.ok(rehearsal)
  expect(rehearsal.phase).toBe('rehearsal')
  state = applyActions(state, [{ kind: 'setProductionSetupRecipe', productionId: filmId,
    recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: rehearsal.planRevision }])
  for (let count = 0; state.studio.activeProductions.find((p) => p.id === filmId)!.remainingTicks !== 5; count++) {
    if (count >= 40) throw new Error('UNEXECUTED fixture: actual film did not reach Shooting entry within40 ticks')
    state = tick(state)
  }
  state = applyActions(state, [{ kind: 'assignShootingDirector', productionId: filmId, directorId: production.directorId }])
  for (let count = 0; state.operations.workflows.find((w) => w.productionId === filmId)!.shootingTask?.status !== 'ready'; count++) {
    if (count >= 6) throw new Error('UNEXECUTED fixture: actual scenery never ready within6 ticks')
    expect(state.studio.activeProductions.find((p) => p.id === filmId)!.remainingTicks).toBe(5)
    expect(state.firstTakes.filter((t) => t.productionId === filmId)).toEqual([])
    state = tick(state)
  }
  state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: filmId }])
  expect(state.operations.workflows.find((w) => w.productionId === filmId)).toMatchObject({ blocker: null, shootingTask: { status: 'scheduled' } })
  expect(state.firstTakes.filter((t) => t.productionId === filmId)).toEqual([])
  let observed: GameState | undefined
  const transitions: { before: number; after: number | undefined; emitted: string[] }[] = []
  const advance = promisesModule.advancePromisesWeek
  const manage = operationsModule.advanceManagedProductions
  const takeSpy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
    const next = manage(...args)
    const before = args[1].find((p) => p.id === filmId)
    if (before !== undefined) transitions.push({ before: before.remainingTicks,
      after: next.productions.find((p) => p.id === filmId)?.remainingTicks,
      emitted: next.firstTakes.filter((p) => p.id === filmId).map((p) => p.id) })
    return next
  })
  const outcomeSpy = vi.spyOn(promisesModule, 'advancePromisesWeek').mockImplementation((input) => {
    if (input.firstTakes.some((t) => t.productionId === filmId)) {
      expect(observed).toBeUndefined()
      observed = clone(input) // actual durable take exists; outcomes have NOT been processed
    }
    return advance(input) // original still runs; never bypass a transition
  })
  try { tick(state) } finally { outcomeSpy.mockRestore(); takeSpy.mockRestore() }
  expect(transitions).toEqual([{ before: 5, after: 4, emitted: [filmId] }])
  assert.ok(observed, 'fixture: actual pre-outcome owner input absent')
  const carrier = validateStateV32(migratedV32, observed)
  const takes = carrier.state.firstTakes.filter((t) => t.productionId === filmId)
  expect(takes).toHaveLength(1)
  const take = takes[0]!
  expect(take.week).toBe(state.market.tick + 1)
  expect(take.cast).toEqual(production.cast)
  expect(take.cast[slot]).toBe(root(carrier.state, id).beneficiaryPersonId)
  expect(take.studioId).toBe(carrier.state.hollywood!.playerStudioId)
  for (const promiseId of ids) {
    const promise = root(carrier.state, promiseId)
    binding(carrier.state, promise)
    expect(promise).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [] })
    expect(promise.feasibilityReceipt).toEqual(root(frozenState, promiseId).feasibilityReceipt)
    expect(take.week).toBeGreaterThanOrEqual(promise.windowStartWeek)
    expect(take.week).toBeLessThan(promise.dueWeekExclusive)
  }
  const result = { carrier, id, ids, take, slot }
  cache.set(slot, clone(result))
  return result
}
function outcomes(state: GameState) { return state.talentMarket.receipts.filter((r) => r.kind === 'promiseOutcome') }
function evaluate(input: EnvelopeV32): GameState {
  validateSaveV32(input)
  const before = clone(input)
  const after = advancePromisesWeek(input.state) // existing structurally compatible public owner, no cast
  expect(input).toEqual(before)
  expect(after.firstTakes).toEqual(input.state.firstTakes)
  expect(after.rngState).toBe(input.state.rngState)
  expect(after.hollywood).toEqual(input.state.hollywood)
  expect(after.studio).toEqual(input.state.studio)
  expect(after.ledger).toEqual(input.state.ledger)
  return after
}
function ownOutcome(state: GameState, id: string) {
  const promise = root(state, id)
  binding(state, promise)
  assert.notEqual(promise.outcomeEventId, null)
  const own = outcomes(state).filter((r) => r.eventId === promise.outcomeEventId)
  expect(own).toHaveLength(1)
  expect(own[0]).toMatchObject({ talentId: promise.beneficiaryPersonId, studioId: promise.issuerStudioId, week: promise.outcomeWeek })
  expect(promise.evidenceRefs).not.toContain(promise.outcomeEventId)
  return own[0]!
}
function strictAndRepeat(carrier: EnvelopeV32, after: GameState): void {
  const validated = validateStateV32(carrier, after)
  const before = clone(validated)
  const twice = evaluate(validated)
  const third = evaluate(validateStateV32(carrier, twice))
  expect(outcomes(twice)).toEqual(outcomes(after)) // exact set, including orphan receipt regressions
  expect(outcomes(third)).toEqual(outcomes(after))
  expect(twice).toEqual(after)
  expect(third).toEqual(after)
  expect(validated).toEqual(before)
  validateStateV32(carrier, third)
}

describe('P14B4 staged outcome owner: real completed take, synthetic MATERIAL only', () => {
  it.each(CLASSES.flatMap((seatClass) => SLOTS.map((slot) => ({ seatClass, slot }))))('$seatClass against actual $slot', ({ seatClass, slot }) => {
    const prepared = actualTakeInput(slot)
    const input = variantV32(prepared.carrier, prepared.id, p2(seatClass))
    const after = evaluate(input)
    const promise = root(after, prepared.id)
    const matches = slot === 'lead' || (seatClass === 'leadOrAntagonist' && slot === 'antagonist')
    if (matches) {
      expect(promise).toMatchObject({ outcome: 'SATISFIED', progress: 1, evidenceRefs: [prepared.take.eventId], outcomeWeek: prepared.take.week })
      ownOutcome(after, prepared.id)
    } else {
      expect(promise).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [], outcomeEventId: null })
      expect(outcomes(after).filter((r) => r.talentId === promise.beneficiaryPersonId && r.studioId === promise.issuerStudioId))
        .toEqual(outcomes(input.state).filter((r) => r.talentId === promise.beneficiaryPersonId && r.studioId === promise.issuerStudioId))
    }
    expect(promise.feasibilityReceipt).toEqual(root(input.state, prepared.id).feasibilityReceipt)
    expect(promise.version).toBe(root(input.state, prepared.id).version)
    strictAndRepeat(input, after)
  })

  it.each([p1, legacyP2])('actual support still qualifies for old count-only $family', (material) => {
    const prepared = actualTakeInput('support')
    const input = variantV32(prepared.carrier, prepared.id, material)
    const after = evaluate(input)
    expect(root(after, prepared.id)).toMatchObject({ outcome: 'SATISFIED', progress: 1, evidenceRefs: [prepared.take.eventId] })
    ownOutcome(after, prepared.id)
    strictAndRepeat(input, after)
  })

  it('two genuinely bound people share one take but get exactly two distinct own outcome receipts', () => {
    const prepared = actualTakeInput('lead')
    const lead = root(prepared.carrier.state, prepared.id)
    const other = prepared.ids.find((id) => root(prepared.carrier.state, id).beneficiaryPersonId === prepared.take.cast.antagonist)
    assert.ok(other, 'UNEXECUTED fixture: second genuine bound OPEN beneficiary must actually occupy antagonist')
    expect(root(prepared.carrier.state, other).contractId).not.toBe(lead.contractId)
    const input = variantV32(variantV32(prepared.carrier, prepared.id, p2('lead')), other, p2('leadOrAntagonist'))
    const after = evaluate(input)
    const roots = [prepared.id, other].map((id) => root(after, id))
    for (const promise of roots) {
      expect(promise).toMatchObject({ outcome: 'SATISFIED', progress: 1, evidenceRefs: [prepared.take.eventId] })
      ownOutcome(after, promise.promiseId)
    }
    expect(new Set(roots.map((p) => p.outcomeEventId)).size).toBe(2)
    const newReceipts = outcomes(after).filter((r) => !outcomes(input.state).some((old) => old.eventId === r.eventId))
    expect(newReceipts.map((r) => r.eventId).sort()).toEqual(roots.map((p) => p.outcomeEventId).sort())
    strictAndRepeat(input, after)
  })

  it('a real take at window start counts; the same real take at due-exclusive does not', () => {
    const prepared = actualTakeInput('lead')
    const original = root(prepared.carrier.state, prepared.id)
    const start = variantV32(prepared.carrier, prepared.id, p2('lead'), { start: prepared.take.week, due: original.dueWeekExclusive })
    const excluded = variantV32(prepared.carrier, prepared.id, p2('lead'), { start: original.windowStartWeek, due: prepared.take.week })
    const kept = evaluate(start)
    expect(root(kept, prepared.id)).toMatchObject({ outcome: 'SATISFIED', progress: 1, evidenceRefs: [prepared.take.eventId] })
    ownOutcome(kept, prepared.id)
    const broken = evaluate(excluded)
    expect(root(broken, prepared.id)).toMatchObject({ outcome: 'BROKEN', progress: 0, evidenceRefs: [], outcomeWeek: prepared.take.week })
    ownOutcome(broken, prepared.id)
    strictAndRepeat(start, kept)
    strictAndRepeat(excluded, broken)
  })
})
