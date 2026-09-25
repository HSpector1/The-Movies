// Drafted as the intended tests/p14bf2-acting-discipline.test.ts; installed and run in the core project since 957d2de.
// Gate: qualified B3/rules2 plus genuinely minted B2/rules1 corpus; B-F2 uses3.
// Existing D9 OQ-1 + companion4.2: acting-profile presence, not profession label.
// No candidate-pool, rival-policy, label, Save29/projection46 or P2 change.
// Record 600 (2026-09-21, Owner ruling on 578, D1 (a)): live evaluation moves3→4 for
// the class-aware scalar (class-restricted fixed-seat paths + shared residual capacity)
// inside the coordinated core/save/runtime/wire cutover. B-F2's own RED/GREEN evidence
// at3 stays where it was recorded; do not rewrite it. Only FRESH reads, attachments and
// freeze receipts below use4. Genuine evaluator1 fixtures and old root.version1 stay1.
// Classifications, bottlenecks, digests, fixtures, weeks and timeouts are untouched here;
// residual-buffer movements of fresh P1 reads are reconciled from evidence (600 §3 2(d)).
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions, hiringMarketIds, SKILL_ORDER, tick } from '../src/core/index.js'
import { attachPromise, promiseFeasibility, PROMISE_RULES_VERSION, type PromiseDraft } from '../src/core/promises.js'
import { currentProposals, submitProposal, withdrawProposal } from '../src/core/talentMarket.js'
import { exportSave, importSave, LIVE_SAVE_VERSION, loadSave, makeSave, migrateToV29, migrateToLive, validateSaveV29, validateSaveV34 } from '../src/core/save.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, CastSlot, GameState } from '../src/core/types.js'
import { buildTalentProvenance } from '../src/core/aging.js'
import { initialCareerLifecycle } from '../src/core/careerLifecycle.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './helpers/p14b2-fixtures.js'

type Crew = { leadId: string; writerId: string; directorId: string; antagonistId: string; supportId: string; craftId: string }
type Window = { castable: GameState; state: GameState; crew: Crew }
let cached: Window | undefined
function sign(state: GameState, role: 'writer' | 'director' | 'actor' | 'craft', termWeeks = 208) {
  for (let index = 0; index < 60; index++) {
    const person = hiringMarketIds(state, state.market.tick).map((id) => state.talent.find((p) => p.id === id))
      .find((p) => p?.role === role)
    if (person !== undefined) return { state: applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks }]), id: person.id }
    state = tick(state)
  }
  throw new Error(`UNEXECUTED B-F2 fixture premise: no real free-agent ${role} within60 weeks`)
}
function fixture(): Window {
  if (cached === undefined) {
    let state = fund(p13aGeneratedStudio())
    // TWO different writers: lead performs only acting on this production;
    // the separate screenplay writer preserves one-person/one-role law.
    const lead = sign(state, 'writer', 52); state = lead.state
    const writer = sign(state, 'writer'); state = writer.state
    const director = sign(state, 'director'); state = director.state
    const antagonist = sign(state, 'actor'); state = antagonist.state
    const support = sign(state, 'actor'); state = support.state
    const craft = sign(state, 'craft'); state = craft.state
    const crew = { leadId: lead.id, writerId: writer.id, directorId: director.id,
      antagonistId: antagonist.id, supportId: support.id, craftId: craft.id }
    expect(new Set(Object.values(crew)).size).toBe(6)
    const person = state.talent.find((p) => p.id === lead.id)!
    expect(person.role).toBe('writer')
    expect(Object.keys(person.skills.acting).sort()).toEqual([...SKILL_ORDER.acting].sort())
    const contract = state.contracts.find((row) => row.talentId === lead.id)
    assert.ok(contract)
    const start = contract.endWeekExclusive
    const stage = 'facility-soundstage-07' // existing B2 generated-world stage, guarded below
    expect(state.operations.facilities.some((f) => f.id === stage && f.capability === 'soundstage')).toBe(true)
    const mounted = state.sets.find((s) => s.mountedOn === stage && s.status !== 'retired')
    if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
    state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: stage } }])
    state = advanceTo(state, state.market.tick + TUNING.SET_BUILD_WEEKS_BAND_HIGH)
    expect(state.market.tick).toBeLessThanOrEqual(start - 7)
    const castable = state
    state = advanceTo(state, start - 7)
    state = submitProposal(state, { talentId: lead.id, issuerStudioId: player(state), termWeeks: 52, premiumTier: 1.25 })
    expect(state.studio.activeProductions).toEqual([])
    expect(state.promises.filter((p) => p.beneficiaryPersonId === lead.id)).toEqual([])
    validateSaveV34(makeSave(state))
    cached = { castable, state, crew }
  }
  return structuredClone(cached)
}
function draft(state: GameState, personId: string): PromiseDraft {
  const proposal = currentProposals(state, personId).find((p) => p.issuerStudioId === player(state))
  assert.ok(proposal)
  return { family: 'APPEARANCE_COUNT', issuerStudioId: player(state), beneficiaryPersonId: personId,
    predicate: { count: 1 }, windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + 40,
    startWeek: proposal.startWeek, termWeeks: proposal.termWeeks }
}
function payload(state: GameState, crew: Crew): Extract<Action, { kind: 'greenlight' }>['production'] {
  const concept = state.concepts[0]!
  const cast: Record<CastSlot, string> = { lead: crew.leadId, antagonist: crew.antagonistId, support: crew.supportId }
  return { conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    writerId: crew.writerId, directorId: crew.directorId, cast, craftIds: [crew.craftId],
    budget: { negative: concept.baseNegativeCost, marketing: 0 } }
}
function attach(state: GameState, personId: string) {
  const requested = draft(state, personId)
  return attachPromise(state, personId, player(state), requested)
}

describe('B-F2: settled has-acting-discipline law, not primary-role eligibility', () => {
  it('pins the live evaluator generation: 4 after record 600 (B-F2 landed the eligibility correction at3)', () => {
    expect(PROMISE_RULES_VERSION).toBe(4)
  })

  it('the real generated writer is lawfully cast as lead without relabeling or occupying two roles', () => {
    const { castable, crew } = fixture()
    const original = castable.talent.find((p) => p.id === crew.leadId)!
    expect(original.role).toBe('writer')
    const legal = applyActions(castable, [{ kind: 'greenlight', production: payload(castable, crew) }])
    expect(legal.studio.activeProductions.at(-1)!.cast.lead).toBe(crew.leadId)
    expect(legal.studio.activeProductions.at(-1)!.writerId).toBe(crew.writerId)
    expect(legal.talent.find((p) => p.id === crew.leadId)!.role).toBe('writer')
    validateSaveV34(makeSave(legal))
    const doubleRole = payload(castable, crew)
    doubleRole.writerId = crew.leadId
    expect(() => applyActions(castable, [{ kind: 'greenlight', production: doubleRole }]))
      .toThrow(/more than one role|exactly one role/)
  })

  it('a lawful non-primary actor receives an achievable P1 and the pure read changes no state or labels', () => {
    const { state, crew } = fixture()
    const bytes = JSON.stringify(state)
    const receipt = promiseFeasibility(state, draft(state, crew.leadId), state.market.tick)
    expect(receipt).toMatchObject({ rulesVersion: 4, week: state.market.tick,
      classification: 'REASONABLY_ACHIEVABLE', bottleneck: null })
    expect(promiseFeasibility(state, draft(state, crew.leadId), state.market.tick)).toEqual(receipt)
    expect(JSON.stringify(state)).toBe(bytes)
    expect(state.talent.find((p) => p.id === crew.leadId)!.role).toBe('writer')
  })

  it('unknown beneficiary refuses without treating a made-up identity as a cast participant', () => {
    const { state, crew } = fixture()
    const unknown = 'b-f2-deliberately-unknown-person'
    expect(state.talent.some((p) => p.id === unknown)).toBe(false)
    const before = JSON.stringify(state)
    const receipt = promiseFeasibility(state, { ...draft(state, crew.leadId), beneficiaryPersonId: unknown }, state.market.tick)
    expect(receipt).toMatchObject({ rulesVersion: 4, classification: 'IMPOSSIBLE', bottleneck: 'this person is not in the world' })
    expect(JSON.stringify(state)).toBe(before)
  })

  it('missing acting profile refuses and changes eligibility digest at identical week (INVALID PURE PROBE ONLY)', () => {
    const { state, crew } = fixture()
    const requested = draft(state, crew.leadId)
    const legalBytes = JSON.stringify(state)
    const valid = promiseFeasibility(state, requested, state.market.tick)
    expect(valid.classification).toBe('REASONABLY_ACHIEVABLE')
    const invalidProbe = structuredClone(state)
    const person = invalidProbe.talent.find((p) => p.id === crew.leadId)!
    expect(Reflect.deleteProperty(person.skills, 'acting')).toBe(true)
    expect(Object.hasOwn(person.skills, 'acting')).toBe(false)
    const invalidBytes = JSON.stringify(invalidProbe)
    // Deliberately violates Talent shape: never saved, loaded, ticked, cast or
    // asserted to be a lawful campaign. Only the defensive pure service sees it.
    const absent = promiseFeasibility(invalidProbe, requested, invalidProbe.market.tick)
    expect(absent).toMatchObject({ rulesVersion: 4, classification: 'IMPOSSIBLE' })
    expect(absent.bottleneck).toMatch(/acting|discipline/i)
    expect(absent.inputsDigest).not.toBe(valid.inputsDigest)
    expect(promiseFeasibility(invalidProbe, requested, invalidProbe.market.tick)).toEqual(absent)
    expect(JSON.stringify(invalidProbe)).toBe(invalidBytes)
    expect(JSON.stringify(state)).toBe(legalBytes)
  })

  it.each(['nonwhole-count', 'capacity', 'early-window', 'late-window'] as const)
  ('preserves unrelated %s refusal for the newly eligible writer', (control) => {
    const { state, crew } = fixture()
    const requested = draft(state, crew.leadId)
    const changed: PromiseDraft = control === 'nonwhole-count' ? { ...requested, predicate: { count: 0.5 } }
      : control === 'capacity' ? { ...requested, predicate: { count: 999 } }
      : control === 'early-window' ? { ...requested, windowStartWeek: requested.startWeek - 1 }
      : { ...requested, dueWeekExclusive: requested.startWeek + requested.termWeeks + 1 }
    const receipt = promiseFeasibility(state, changed, state.market.tick)
    expect(receipt.classification).toBe('IMPOSSIBLE')
    expect(receipt.bottleneck).toMatch(control === 'nonwhole-count' ? /whole picture/ : control === 'capacity' ? /many pictures/
      : control === 'early-window' ? /starts before/ : /outside/)
  })

  it('existing-path buffer and CURRENT reservations still constrain writer promises; withdrawal releases only the reservation', () => {
    const { state, crew } = fixture()
    const requested = draft(state, crew.leadId)
    const baseline = promiseFeasibility(state, requested, state.market.tick)
    expect(baseline.classification).toBe('REASONABLY_ACHIEVABLE')
    expect(promiseFeasibility(state, { ...requested, predicate: { count: 2 } }, state.market.tick).classification).toBe('FRAGILE')
    const attached = attach(state, crew.leadId)
    const promise = attached.promises[state.promises.length]!
    expect(promise.feasibilityReceipt).toEqual(baseline)
    expect(promiseFeasibility(attached, requested, state.market.tick).classification).toBe('FRAGILE')
    expect(promiseFeasibility(attached, { ...requested, promiseId: promise.promiseId }, state.market.tick)).toEqual(baseline)
    const withdrawn = withdrawProposal(attached, crew.leadId, player(attached))
    expect(withdrawn.promises).toEqual(attached.promises)
    expect(promiseFeasibility(withdrawn, requested, state.market.tick)).toEqual(baseline)
  })

  it('real winning writer P1 binds, then one completed scheduled cast take satisfies it with exact durable references', () => {
    const { state: opened, crew } = fixture()
    let state = attach(opened, crew.leadId)
    const promise = state.promises[opened.promises.length]!
    expect(promise).toMatchObject({ version: 4, contractId: null, outcome: null,
      feasibilityReceipt: { rulesVersion: 4, classification: 'REASONABLY_ACHIEVABLE' } })
    state = advanceTo(state, promise.windowStartWeek)
    const bound = state.promises.find((p) => p.promiseId === promise.promiseId)!
    expect(bound.contractId).not.toBeNull()
    expect(bound.feasibilityReceipt).toMatchObject({ rulesVersion: 4, week: state.market.tick,
      classification: 'REASONABLY_ACHIEVABLE' })
    expect(bound.outcome).toBeNull()
    expect(state.hollywood!.employment.find((e) => e.contractId === bound.contractId)).toMatchObject({
      studioId: player(state), terms: { talentId: crew.leadId, startWeek: promise.windowStartWeek } })
    expect(state.talentMarket.receipts).toContainEqual(expect.objectContaining({ kind: 'settled',
      talentId: crew.leadId, studioId: player(state), week: promise.windowStartWeek }))
    expect(currentProposals(state, crew.leadId)).toEqual([])
    state = applyActions(state, [{ kind: 'greenlight', production: payload(state, crew) }])
    const productionId = state.studio.activeProductions.at(-1)!.id
    expect(state.studio.activeProductions.at(-1)!.cast.lead).toBe(crew.leadId)
    state = tick(tick(tick(state)))
    const rehearsal = state.operations.workflows.find((w) => w.productionId === productionId)!
    expect(rehearsal.phase).toBe('rehearsal')
    state = applyActions(state, [{ kind: 'setProductionSetupRecipe', productionId,
      recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: rehearsal.planRevision }])
    for (let steps = 0; state.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks !== 5; steps++) {
      if (steps >= 40) throw new Error('UNEXECUTED B-F2 fixture premise: production never reached ready first take within40 ticks')
      state = tick(state)
    }
    expect(state.firstTakes.filter((t) => t.productionId === productionId)).toEqual([])
    expect(state.promises.find((p) => p.promiseId === promise.promiseId)!.outcome).toBeNull()
    state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId: crew.directorId },
      { kind: 'scheduleShootingTake', productionId }])
    expect(state.operations.workflows.find((w) => w.productionId === productionId)).toMatchObject({
      blocker: null, shootingTask: { status: 'scheduled' } })
    const scheduled = state
    state = tick(state)
    expect(state.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks).toBe(4)
    const takes = state.firstTakes.filter((t) => t.productionId === productionId)
    expect(takes).toHaveLength(1)
    const take = takes[0]!
    expect(take).toMatchObject({ studioId: player(state), week: scheduled.market.tick + 1, cast: { lead: crew.leadId } })
    expect(take.week).toBeGreaterThanOrEqual(promise.windowStartWeek)
    expect(take.week).toBeLessThan(promise.dueWeekExclusive)
    const kept = state.promises.find((p) => p.promiseId === promise.promiseId)!
    expect(kept).toMatchObject({ version: 4, contractId: bound.contractId, progress: 1,
      outcome: 'SATISFIED', outcomeWeek: take.week, evidenceRefs: [take.eventId] })
    const receipts = state.talentMarket.receipts.filter((r) => r.eventId === kept.outcomeEventId)
    expect(receipts).toHaveLength(1)
    expect(receipts[0]).toMatchObject({ kind: 'promiseOutcome', week: take.week,
      talentId: crew.leadId, studioId: player(state) })
    expect(state.talent.find((p) => p.id === crew.leadId)!.role).toBe('writer')
    const loaded = validateSaveV34(importSave(exportSave(makeSave(state)))).state
    expect(loaded.promises).toEqual(state.promises)
    expect(loaded.firstTakes).toEqual(state.firstTakes)
  })
})

const OLD_CORPUS = './fixtures/p14/genuine-v29-pre-b3-evaluator1/'
const OLD_NAME = 'genuine-v29-evaluator1-role-label-refused-p1'
// Actual accepted-B2 T0 bytes, independently hashed as gzip and raw streams;
// compressed bytes also match fixture checkpoint9c605dc's Git object.
const OLD_PINS = {
  compressedSha256: 'febd33112d57128c67a025237add374aeb7925d94a7d941bd4b303b3fedc0367',
  rawSha256: '0272162ec2746cefb1a7910487d6d30642c8743f9853d61a73ebef469a3df2b3',
  testedSourceSha: '7f89f75bad5a450b50340e3ab074a913c3ef2744',
  publishedRecoverySha: '034065b4f6e4ef0f9f53750a343568e32f54d9ab',
} as const
const oldPath = (suffix: string) => new URL(`${OLD_CORPUS}${OLD_NAME}${suffix}`, import.meta.url)
const oldManifestPath = new URL(`${OLD_CORPUS}MANIFEST.json`, import.meta.url)
function oldRefusal() {
  const compressed = readFileSync(oldPath('.json.gz'))
  const raw = gunzipSync(compressed).toString('utf8')
  const provenance = JSON.parse(readFileSync(oldPath('.provenance.json'), 'utf8'))
  const manifest = JSON.parse(readFileSync(oldManifestPath, 'utf8'))
  const hash = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
  expect(hash(compressed)).toBe(OLD_PINS.compressedSha256)
  expect(hash(raw)).toBe(OLD_PINS.rawSha256)
  expect(hash(compressed)).toBe(provenance.compressedSha256)
  expect(hash(raw)).toBe(provenance.uncompressedSha256)
  expect(provenance.filename).toBe(`${OLD_NAME}.json.gz`)
  expect(provenance.authority).toMatchObject({ phase: 'qualified B2 evaluator1 before B3 or B-F2',
    saveVersion: 29, promiseRulesVersion: 1, projectionVersion: 46, protocolVersion: 4,
    schemaId: 'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c' })
  expect(provenance.authority.testedSourceSha).toBe(OLD_PINS.testedSourceSha)
  expect(provenance.authority.publishedRecoverySha).toBe(OLD_PINS.publishedRecoverySha)
  expect(provenance.observedHeadSha).toBe(OLD_PINS.publishedRecoverySha)
  expect(manifest.authority).toEqual(provenance.authority)
  expect(manifest.fixtures).toHaveLength(3)
  expect(manifest.fixtures).toContainEqual(expect.objectContaining({ filename: `${OLD_NAME}.json.gz`,
    compressedSha256: OLD_PINS.compressedSha256, uncompressedSha256: OLD_PINS.rawSha256 }))
  expect(provenance.focus).toHaveLength(1)
  const save = validateSaveV29(JSON.parse(raw))
  const focused = save.state.promises.find((p) => p.promiseId === provenance.focus[0].promiseId)
  assert.ok(focused)
  expect(focused).toMatchObject({ family: 'APPEARANCE_COUNT', version: 1, contractId: null, outcome: null,
    feasibilityReceipt: { rulesVersion: 1, classification: 'IMPOSSIBLE',
      bottleneck: 'this person takes no cast seat under the greenlight law' } })
  expect(focused.feasibilityReceipt).toEqual(provenance.focus[0].originalFeasibilityReceipt)
  return { raw, save, focused }
}

describe('B-F2: genuine old role-refusal evidence survives, fresh evaluations use the live evaluator (4 after record 600)', () => {
  beforeAll(() => {
    for (const suffix of ['.json.gz', '.provenance.json']) assert.ok(existsSync(oldPath(suffix)),
      'T0 NOT COMPLETE: actual accepted-B2 role-refusal corpus missing; not a B-F2 behavioral RED')
    assert.ok(existsSync(oldManifestPath), 'T0 NOT COMPLETE: actual committed corpus manifest missing')
  })

  it('valid load preserves the old erroneous receipt/root/digest bytes exactly without repairing history', () => {
    const { raw, save, focused } = oldRefusal()
    expect(exportSave(loadSave(JSON.parse(raw)))).toBe(raw)
    expect(exportSave(importSave(raw))).toBe(raw)
    const loaded = migrateToV29(importSave(raw))
    expect(exportSave(loaded)).toBe(raw)
    // 600-T2 (record 600, C9/C10): the live writer stamps Save30, so "makeSave
    // reproduces the raw V29 bytes" is a moved premise. The invariant kept: the
    // live writer's output IS the governed V29->V30 migration of the raw corpus,
    // which differs from raw by the version tag alone (no repaired receipt, root
    // or digest); the V29 half above stays byte-identical.
    // 662-T2 (P14B.5, R-VERSION): the live writer now stamps Save31; the governed
    // V29->V31 migration differs from raw by the version tag AND the EMPTY
    // relationship root alone (nothing recomputed, plan :725-781). The live writer
    // fed the V29-loaded state plus that empty root reproduces the governed bytes.
    // 735-T (P14B.7, R-VERSION): the live writer now stamps Save32; the governed
    // V29->V32 migration differs from raw by the version tag, the EMPTY
    // relationship root, AND `supersededByPromiseId: null` on every existing
    // promise (nothing else recomputed). The live writer fed the V29-loaded state
    // plus those two additive fields reproduces the governed bytes.
    // 763-R8 (P14C.1, R-VERSION): the live writer now stamps Save33. The governed
    // lift adds C.1's provenance root AND floors every stored age against it — the
    // first step in this chain that changes a VALUE rather than only adding a field,
    // so the expected shape below names both, derived from the fixture's own people
    // rather than read back off the output.
    // 776-S9 (P14C.2a, R-VERSION): the live writer now stamps Save34. The governed
    // lift adds the empty career-lifecycle root, opened at this envelope's own
    // tick — an additive field, like V31's and V32's, not a value change.
    const governed = migrateToLive(importSave(raw))
    expect(governed.saveVersion).toBe(LIVE_SAVE_VERSION)
    const parsedRaw = JSON.parse(raw)
    const addedFieldsRaw = (promise: Record<string, unknown>) => ({ ...promise, supersededByPromiseId: null })
    const rawPeople = parsedRaw.state.talent as { id: string; age: number }[]
    expect(JSON.parse(exportSave(governed))).toEqual({ ...parsedRaw, saveVersion: LIVE_SAVE_VERSION, state: { ...parsedRaw.state,
      relationships: [], promises: (parsedRaw.state.promises as Record<string, unknown>[]).map(addedFieldsRaw),
      talent: rawPeople.map((person) => ({ ...person, age: Math.floor(person.age) })),
      talentProvenance: buildTalentProvenance(rawPeople, parsedRaw.state.market.tick as number, 'legacy_age_anchor'),
      careerLifecycle: initialCareerLifecycle(parsedRaw.state.market.tick as number) } })
    const addedFieldsLoaded = (promise: typeof loaded.state.promises[number]) => ({ ...promise, supersededByPromiseId: null })
    const liftedV32 = { ...loaded.state, relationships: [], promises: loaded.state.promises.map(addedFieldsLoaded) }
    expect(exportSave(makeSave({ ...liftedV32,
      talent: liftedV32.talent.map((person) => ({ ...person, age: Math.floor(person.age) })),
      talentProvenance: buildTalentProvenance(liftedV32.talent, liftedV32.market.tick, 'legacy_age_anchor'),
      // P14C.2a (776 S9): the same additive step `governed` above also carries.
      careerLifecycle: initialCareerLifecycle(liftedV32.market.tick) })))
      .toBe(exportSave(governed))
    expect(loaded.state.promises).toEqual(save.state.promises)
    expect(loaded.state.talentMarket).toEqual(save.state.talentMarket)
    const writer = loaded.state.talent.find((p) => p.id === focused.beneficiaryPersonId)!
    expect(writer.role).toBe('writer')
    expect(Object.keys(writer.skills.acting).sort()).toEqual([...SKILL_ORDER.acting].sort())
  })

  it('actual resubmit/attach evaluates afresh under4 but keeps the original version1 refusal untouched', () => {
    const { save, focused: old } = oldRefusal()
    const state = migrateToLive(save).state
    const originalRoots = JSON.stringify(state.promises)
    const proposal = currentProposals(state, old.beneficiaryPersonId).find((p) => p.issuerStudioId === old.issuerStudioId)
    assert.ok(proposal)
    expect(proposal.promises).toEqual([old.promiseId])
    const revised = submitProposal(state, { talentId: proposal.talentId, issuerStudioId: proposal.issuerStudioId,
      termWeeks: proposal.termWeeks, premiumTier: proposal.premiumTier })
    const requested: PromiseDraft = { family: 'APPEARANCE_COUNT', issuerStudioId: old.issuerStudioId,
      beneficiaryPersonId: old.beneficiaryPersonId, predicate: { count: old.predicate.count },
      windowStartWeek: old.windowStartWeek, dueWeekExclusive: old.dueWeekExclusive,
      startWeek: proposal.startWeek, termWeeks: proposal.termWeeks }
    const fresh = promiseFeasibility(revised, requested, revised.market.tick)
    expect(fresh.rulesVersion).toBe(4)
    expect(fresh.bottleneck).not.toBe(old.feasibilityReceipt.bottleneck)
    // The natural rival may still be FRAGILE/IMPOSSIBLE for an actual remaining
    // constraint. Do not assert ACHIEVABLE or automatic casting from eligibility.
    const attached = attachPromise(revised, old.beneficiaryPersonId, old.issuerStudioId, requested)
    expect(attached.promises).toHaveLength(state.promises.length + 1)
    const newRoot = attached.promises[state.promises.length]!
    expect(newRoot).toMatchObject({ promiseId: `promise-${state.promises.length}`, version: 4,
      contractId: null, outcome: null, feasibilityReceipt: fresh })
    expect(JSON.stringify(attached.promises.slice(0, state.promises.length))).toBe(originalRoots)
    expect(attached.talent.find((p) => p.id === old.beneficiaryPersonId)!.role).toBe('writer')
    expect(validateSaveV34(importSave(exportSave(makeSave(attached)))).state.promises).toEqual(attached.promises)
  })
})
