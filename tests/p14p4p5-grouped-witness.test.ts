// 1275-A/B: fixed shared stock company and public P1 waivers; quote-time bounds only after actual60.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import * as promiseOwner from '../src/core/promises.js'
import * as opportunityOwner from '../src/core/opportunityPromises.js'
import type { PromiseDraft, PromiseAttachment } from '../src/core/promises.js'
import * as tickOwner from '../src/core/tick.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import type { Action, FirstTakeReceipt, FirstTakeSubject, GameState, Production, ProfessionalPromise, PromiseClassification } from '../src/core/types.js'

const INPUT = new URL('./fixtures/p14/genuine-v31-pre-b7/', import.meta.url)
const HARD_ADVANCES = 8, HARD_ACTIONS = 6, HARD_QUOTES = 8, TIMEOUT = 60_000
const WRITER = 't-wri-03', DIRECTOR = 't-dir-01', CRAFT = 't-cra-01'
const CAST = { lead: 't-act-09', antagonist: 't-act-08', support: 't-act-12' }
const IDLE = 't-act-13'
const clone = <T>(value: T): T => structuredClone(value)
const stable = saves.stableStringify
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const emit = (kind: string, value: unknown): void => console.info(`1275-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { attempted: 0, reserved: 0, invoked: 0, completed: 0, outside: 0,
  actionAttempts: 0, actionsAccepted: 0, explicitQuotes: 0, returnedQuotes: 0 }
const operations: { week: number; action: Action; accepted: boolean }[] = []
const cache = new Map<string, { ok: true; value: GameState } | { ok: false; error: unknown }>()
let permit: { from: number; used: boolean } | undefined
let restoreTick: (() => void) | undefined
let oldReceipts: GameState['firstTakes'] = [], originalRoots: GameState['promises'] = []
let stockId: string | undefined
const expectedSuffix: { receipt: FirstTakeReceipt; subject: FirstTakeSubject }[] = []
const tickTrace: { from: number; to: number; added: typeof expectedSuffix }[] = []
beforeAll(() => {
  const actual = tickOwner.tick
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation((state, options) => {
    count.attempted++
    if (!permit) { count.outside++; throw new Error('1275: advance outside the sole Q19 route') }
    assert.equal(permit.used, false); permit.used = true
    assert.ok(count.attempted <= HARD_ADVANCES && count.reserved < HARD_ADVANCES, 'hard8 before real invocation')
    assert.equal(state.market.tick, permit.from); assert.equal(permit.from, 52 + count.reserved)
    count.reserved++; count.invoked++
    const next = actual(state, options)
    expect(next.market.tick).toBe(state.market.tick + 1); count.completed++
    return next
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: HARD_ADVANCES, hardActions: HARD_ACTIONS, hardExplicitQuotes: HARD_QUOTES,
    historicalPrefixAdvances: 0, simulationHelperImported: false, tickDevelopmentOption: 'default false',
    phases: [...cache].map(([name, row]) => ({ name, complete: row.ok,
      ...(!row.ok ? { failure: String(row.error) } : {}) })), operations, tickTrace })
  expect(count.outside).toBe(0); expect(count.attempted).toBeLessThanOrEqual(HARD_ADVANCES)
  expect(count.actionAttempts).toBeLessThanOrEqual(HARD_ACTIONS); expect(count.explicitQuotes).toBeLessThanOrEqual(HARD_QUOTES)
})
function memo(name: string, build: () => GameState): GameState {
  const old = cache.get(name)
  if (old) { if (!old.ok) throw old.error; return clone(old.value) }
  try { const value = build(); cache.set(name, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(name, { ok: false, error }); throw error }
}
function admitted(state: GameState): void {
  const before = stable(state), save = saves.makeSave(state)
  expect(save.saveVersion).toBe(40); expect(saves.validateSaveV40(save)).toBe(save)
  const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.validateSaveV40(imported)
  expect(current).toBe(imported); expect(saves.exportSave(current)).toBe(raw)
  expect(current.state.firstTakeSubjects).toEqual(state.firstTakeSubjects)
  expect(stable(state)).toBe(before)
}
function rootAuthority(row: GameState['promises'][number]) {
  return { promiseId: row.promiseId, family: row.family, issuerStudioId: row.issuerStudioId,
    beneficiaryPersonId: row.beneficiaryPersonId, contractId: row.contractId, predicate: clone(row.predicate),
    version: row.version, windowStartWeek: row.windowStartWeek, dueWeekExclusive: row.dueWeekExclusive,
    feasibilityReceipt: clone(row.feasibilityReceipt) }
}
function retainedRoots(state: GameState): void {
  for (const old of originalRoots) {
    const rows = state.promises.filter(row => row.promiseId === old.promiseId)
    expect(rows).toHaveLength(1); expect(rootAuthority(rows[0]!)).toEqual(rootAuthority(old))
  }
}
function suffix(state: GameState): void {
  expect(state.firstTakes.slice(0, 20)).toEqual(oldReceipts)
  expect(state.firstTakes.slice(20)).toEqual(expectedSuffix.map(row => row.receipt))
  expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 20, facts: expectedSuffix.map(row => row.subject) })
  retainedRoots(state)
}
function ownerFacts(state: GameState) {
  const owners = [{ studioId: issuer(state), productions: state.studio.activeProductions,
    development: state.scriptDevelopment, concepts: state.concepts }, ...state.hollywood!.businesses.map(row => ({
      studioId: row.studioId, productions: row.productions, development: row.development, concepts: state.hollywood!.concepts }))]
  return owners.flatMap(owner => owner.productions.map(production => {
    const concept = owner.concepts.find(row => row.id === production.conceptId); assert.ok(concept)
    const linked = owner.development.projects.filter(row => row.productionId === production.id)
    return { studioId: owner.studioId, production: clone(production), concept: clone(concept), mode: owner.development.mode,
      linked: clone(linked) }
  }))
}
function advance(state: GameState): GameState {
  const prior = bytes(state), priorTakes = clone(state.firstTakes), priorFacts = clone(state.firstTakeSubjects.facts)
  const beforeOwners = ownerFacts(state), from = state.market.tick
  assert.equal(permit, undefined); permit = { from, used: false }
  let next: GameState
  try { next = tickOwner.tick(clone(state)) } finally { permit = undefined }
  expect(bytes(state)).toBe(prior); expect(next.firstTakes.slice(0, priorTakes.length)).toEqual(priorTakes)
  const afterOwners = ownerFacts(next)
  const added = next.firstTakes.slice(priorTakes.length).map(receipt => {
    const owner = beforeOwners.find(row => row.studioId === receipt.studioId && row.production.id === receipt.productionId)
      ?? afterOwners.find(row => row.studioId === receipt.studioId && row.production.id === receipt.productionId)
    assert.ok(owner, 'new receipt must join an actual issuing production, never another owner with a reused project ID')
    expect(receipt.week).toBe(next.market.tick)
    expect(receipt.directorId).toBe(owner.production.directorId); expect(receipt.cast).toEqual(owner.production.cast)
    expect(owner.linked.length).toBeLessThanOrEqual(1)
    if (owner.mode === 'managed') expect(owner.linked).toHaveLength(1)
    for (const project of owner.linked) expect(project.conceptId).toBe(owner.concept.id)
    const subject: FirstTakeSubject = { eventId: receipt.eventId, conceptId: owner.concept.id,
      genre: owner.concept.genre, scriptProjectId: owner.linked[0]?.id ?? null }
    return { receipt: clone(receipt), subject }
  })
  expectedSuffix.push(...added); tickTrace.push({ from, to: next.market.tick, added: clone(added) })
  emit('ADVANCE', { from, to: next.market.tick, added, actualSubjectRoot: next.firstTakeSubjects,
    ownProduction: next.studio.activeProductions.find(row => row.id === stockId) ?? null,
    ownWorkflow: next.operations.workflows.find(row => row.productionId === stockId) ?? null })
  // An append/admission failure after an actual tick is a persistence failure, not an invented setup success.
  expect(next.firstTakeSubjects.facts.slice(0, priorFacts.length)).toEqual(priorFacts)
  suffix(next); admitted(next); return next
}
function act(state: GameState, action: Action, verify: (next: GameState) => void): GameState {
  assert.ok(count.actionAttempts < HARD_ACTIONS, 'only the six prospectively fixed public mutations')
  const prior = bytes(state), request = stable(action)
  const operation = { week: state.market.tick, action: clone(action), accepted: false }
  operations.push(operation); count.actionAttempts++; emit('ACTION-ATTEMPT', operation)
  const next = core.applyActions(clone(state), [clone(action)])
  expect(bytes(state)).toBe(prior); expect(stable(action)).toBe(request)
  expect(next.market.tick).toBe(state.market.tick); expect(next.productionQueue).toEqual(state.productionQueue)
  expect(next.firstTakes).toEqual(state.firstTakes); expect(next.firstTakeSubjects).toEqual(state.firstTakeSubjects)
  admitted(next); suffix(next); verify(next)
  operation.accepted = true; count.actionsAccepted++
  emit('ACTION-ACCEPTED', { ...operation, ownProduction: next.studio.activeProductions.find(row => row.id === stockId) ?? null,
    ownWorkflow: next.operations.workflows.find(row => row.productionId === stockId) ?? null,
    releaseAuthority: next.releaseAuthority }); return next
}
function production(state: GameState): Production {
  assert.ok(stockId); const rows = state.studio.activeProductions.filter(row => row.id === stockId)
  expect(rows).toHaveLength(1); return rows[0]!
}
function workflow(state: GameState) {
  assert.ok(stockId); const rows = state.operations.workflows.filter(row => row.productionId === stockId)
  expect(rows).toHaveLength(1); return rows[0]!
}
function idleCrew(state: GameState) {
  const specs = [[WRITER, 'writer', 'writing', 40], [DIRECTOR, 'director', 'directing', 68],
    [CAST.lead, 'actor', 'acting', 25], [CAST.antagonist, 'actor', 'acting', 38],
    [CAST.support, 'actor', 'acting', 56], [IDLE, 'actor', 'acting', 40], [CRAFT, 'craft', 'craft', 45]] as const
  const owners = [{ studioId: issuer(state), productions: state.studio.activeProductions, development: state.scriptDevelopment },
    ...state.hollywood!.businesses.map(row => ({ studioId: row.studioId, productions: row.productions, development: row.development }))]
  return specs.map(([id, role, skill, age]) => {
    const talent = state.talent.find(row => row.id === id); assert.ok(talent)
    expect(talent.role).toBe(role); expect(talent.age).toBe(age); expect(Number.isSafeInteger(talent.age)).toBe(true)
    const provenance = state.talentProvenance.rows.find(row => row.personId === id); assert.ok(provenance)
    expect(talent.age).toBe(core.ageAt(provenance, 52)); assert.ok(talent.skills[skill])
    expect(core.assignmentRefusal(state, id, 52, role)).toBeNull()
    expect(core.retirementRecordFor(state, id)).toBeUndefined(); expect(core.retirementRecordFor(state, id, role)).toBeUndefined()
    const contract = activeContract(state, id); assert.ok(contract)
    expect(contract).toMatchObject({ talentId: id, startWeek: (id === CAST.lead || id === CAST.antagonist) ? 52 : 13,
      endWeekExclusive: (id === CAST.lead || id === CAST.antagonist) ? 104 : 221, termWeeks: (id === CAST.lead || id === CAST.antagonist) ? 52 : 208 })
    const employments = state.hollywood!.employment.filter(row => row.terms.talentId === id && row.terms.startWeek <= 52
      && row.terms.endWeekExclusive > 52 && (row.endedWeek === null || row.endedWeek > 52))
    expect(employments).toHaveLength(1); expect(employments[0]!.studioId).toBe(issuer(state)); expect(employments[0]!.terms).toEqual(contract)
    const engagements = {
      productions: owners.flatMap(owner => owner.productions.filter(row => row.directorId === id || Object.values(row.cast).includes(id)
        || row.craftIds.includes(id)).map(row => ({ studioId: owner.studioId, productionId: row.id }))),
      writing: owners.flatMap(owner => owner.development.projects.filter(row => ['drafting', 'rewriting'].includes(row.status)
        && row.writerIds.includes(id)).map(row => ({ studioId: owner.studioId, projectId: row.id }))),
      research: state.technology.projects.filter(row => row.status === 'active' && row.seats.some(seat => seat.talentId === id
        && seat.releasedWeek === null)).map(row => row.id),
    }
    expect(engagements).toEqual({ productions: [], writing: [], research: [] }); expect(busyTalentIds(state).has(id)).toBe(false)
    return { id, role, age, provenance, profile: talent.skills[skill], contract, employmentId: employments[0]!.contractId, engagements }
  })
}
function input52(): GameState {
  return memo('genuine31-to40:52', () => {
    const pins = [
      ['MANIFEST.json', 57343, 'e48480c30d4dab1775e1728f5e254443dc4343727efb4130ca17cce9166284c7'],
      ['genuine-v31-bound-open-p1.provenance.json', 8210, '84172a3f26ece7ca62af118ed2fc86ce467fba3c12d3b9c9f584776fd8a92905'],
      ['genuine-v31-bound-open-p1.json.gz', 88981, '6b5d54b485cdf661118506dcc26d42fd798fb29721154709a6bd208fd4ab769b'],
    ] as const
    for (const [file, length, digest] of pins) { const data = readFileSync(new URL(file, INPUT)); expect(data.length).toBe(length); expect(sha(data)).toBe(digest) }
    const provenance = JSON.parse(readFileSync(new URL('genuine-v31-bound-open-p1.provenance.json', INPUT), 'utf8')) as {
      campaignSource: string; recipe: { generatedCampaignOnly: boolean; economicInput: string }; authority: {
        testedSourceSha: string; publishedRecoverySha: string } }
    expect(provenance.campaignSource).toBe('generated test campaigns only; never Owner saves')
    expect(provenance.recipe).toMatchObject({ generatedCampaignOnly: true, economicInput: 'explicit fund helper cash delta with matching ledger' })
    expect(provenance.authority).toMatchObject({ testedSourceSha: 'caa8cdb39c4f92598777b7b54f84b23cde03cc40',
      publishedRecoverySha: '152ee9a4be0502d6a1d1f6cf50573660717b0c98' })
    const raw = gunzipSync(readFileSync(new URL('genuine-v31-bound-open-p1.json.gz', INPUT))).toString('utf8')
    expect(Buffer.byteLength(raw)).toBe(753251); expect(sha(raw)).toBe('0ff9044f4529b3821efe3be92911bce10768fa03ff08653db2ac4ac0dda000eb')
    const parsed: unknown = JSON.parse(raw), old = saves.validateSaveV31(parsed), prior = stable(old)
    expect(old).toBe(parsed); expect(saves.exportSave(old)).toBe(raw)
    expect(old.state.talent.find(row => row.id === CAST.antagonist)?.age).toBe(38.16262775009736)
    const state = saves.migrateToLive(old).state
    expect(stable(old)).toBe(prior); admitted(state)
    expect(state.market.tick).toBe(52); expect(state.studio.cash).toBe(23525721); expect(issuer(state)).toBe('studio-aca408ec-player')
    expect(state.firstTakes).toEqual(old.state.firstTakes); expect(state.firstTakes).toHaveLength(20)
    expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 20, facts: [] })
    oldReceipts = clone(state.firstTakes); originalRoots = clone(state.promises)
    expect(state.promises).toHaveLength(2)
    for (const [i, id] of ['t-act-09', 't-act-08'].entries()) {
      const row = state.promises[i]!, oldRow = old.state.promises[i]!
      expect(row).toMatchObject(oldRow)
      expect(row).toMatchObject({ promiseId: `promise-${i}`, beneficiaryPersonId: id, family: 'APPEARANCE_COUNT',
        issuerStudioId: issuer(state), predicate: { count: 1 }, progress: 0, outcome: null, evidenceRefs: [], version: 4,
        windowStartWeek: 52, dueWeekExclusive: 92, feasibilityReceipt: { rulesVersion: 4, week: 52, classification: 'REASONABLY_ACHIEVABLE', bottleneck: null } })
      assert.ok(row.contractId)
      const employment = state.hollywood!.employment.find(e => e.contractId === row.contractId); assert.ok(employment)
      expect(employment).toMatchObject({ studioId: issuer(state), terms: { talentId: id, startWeek: 52, endWeekExclusive: 104 } })
    }
    expect(state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] })
    expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] })
    expect(state.operations).toMatchObject({ mode: 'managed', workflows: [] }); expect(state.studio.activeProductions).toEqual([])
    expect(state.productionQueue).toEqual([]); expect(state.releaseAuthority).toEqual({ commitments: [] }); expect(state.technology.adoptions).toEqual([])
    for (const [id, salary, bonus] of [[CAST.lead, 820195, 147635], [CAST.antagonist, 193244, 34784], [IDLE, 1249804, 224965]] as const) {
      expect(activeContract(state, id)).toMatchObject({ annualSalary: salary, signingBonus: bonus })
    }
    const crew = idleCrew(state), claims = resourceClaimsOf(occupiedResourceSlots({ operations: state.operations, placement: state.placement,
      technology: state.technology, construction: state.construction, scriptDevelopment: state.scriptDevelopment,
      castingSessions: state.castingSessions, sets: state.sets }))
    expect(claims.filter(row => row.kind === 'facility')).toEqual([])
    for (const capability of ['development-casting', 'soundstage', 'set-scenery', 'post']) {
      expect(state.operations.facilities.some(row => row.capability === capability && row.capacity > 0)).toBe(true)
    }
    expect(state.sets.find(row => row.id === 'set-2')).toMatchObject({ status: 'standing', mountedOn: 'facility-soundstage-07', blueprintId: 'set-grand-ballroom' })
    const concept = state.concepts.find(row => row.id === 'c-00'); assert.ok(concept)
    expect(concept).toMatchObject({ title: 'Ghosts of Serpent', genre: 'comedy', baseNegativeCost: 4164354.4863039134 })
    emit('INPUT', { source: provenance.campaignSource, economicInput: provenance.recipe.economicInput, week: 52, cash: state.studio.cash,
      crew, claims, concept, oldPromises: state.promises, oldReceiptCount: oldReceipts.length, firstTakeSubjects: state.firstTakeSubjects,
      migratedBytes: Buffer.byteLength(bytes(state)), migratedSha256: sha(bytes(state)) })
    return state
  })
}
function greenlit52(): GameState {
  return memo('stock-greenlit52', () => {
    const state = input52(), concept = state.concepts.find(row => row.id === 'c-00'); assert.ok(concept)
    const negative = concept.baseNegativeCost; expect(state.studio.cash).toBeGreaterThan(negative)
    return act(state, { kind: 'greenlight', production: { conceptId: concept.id, writerId: WRITER, directorId: DIRECTOR,
      cast: CAST, craftIds: [CRAFT], shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: { genre: 'comedy', intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
      budget: { negative, marketing: 0 } } }, next => {
      expect(next.studio.activeProductions).toHaveLength(1); const made = next.studio.activeProductions[0]!
      expect(made).toMatchObject({ conceptId: 'c-00', writerId: WRITER, directorId: DIRECTOR, cast: CAST,
        craftIds: [CRAFT], startTick: 52, remainingTicks: 8, budget: { negative, marketing: 0 } })
      expect(next.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] }); expect(next.studio.cash).toBe(state.studio.cash - negative)
      expect(next.ledger.slice(state.ledger.length)).toEqual([expect.objectContaining({ kind: 'production', week: 52, amount: -negative, productionId: made.id })])
      stockId = made.id; expect(workflow(next).blocker).toBeNull(); assert.ok(made.participants)
    })
  })
}
function rehearsal55(): GameState {
  return memo('recipe55', () => {
    let state = greenlit52()
    for (const from of [52, 53, 54]) { expect(state.market.tick).toBe(from); state = advance(state) }
    const plan = workflow(state); expect(state.market.tick).toBe(55); expect(plan.phase).toBe('rehearsal'); expect(plan.blocker).toBeNull(); expect(plan.planRevision).toBe(0)
    return act(state, { kind: 'setProductionSetupRecipe', productionId: production(state).id,
      recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: plan.planRevision }, next => {
      expect(workflow(next).setup?.recipeId).toBe('ballroom-reveal-lighting-01')
    })
  })
}
function scheduled60(): GameState {
  return memo('scheduled60', () => {
    let state = rehearsal55()
    for (const from of [55, 56, 57, 58, 59]) { expect(state.market.tick).toBe(from); state = advance(state) }
    expect(state.market.tick).toBe(60); expect(production(state).remainingTicks).toBe(5)
    expect(workflow(state)).toMatchObject({ phase: 'shooting', blocker: null, shootingTask: { status: 'unassigned', directorId: DIRECTOR } })
    expect(state.firstTakes.filter(row => row.studioId === issuer(state) && row.productionId === stockId)).toEqual([])
    state = act(state, { kind: 'assignShootingDirector', productionId: production(state).id, directorId: DIRECTOR }, next => {
      expect(workflow(next)).toMatchObject({ blocker: null, shootingTask: { status: 'ready', directorId: DIRECTOR } })
    })
    return act(state, { kind: 'scheduleShootingTake', productionId: production(state).id }, next => {
      expect(workflow(next)).toMatchObject({ phase: 'shooting', blocker: null, shootingTask: { status: 'scheduled' } })
      expect(production(next).remainingTicks).toBe(5)
    })
  })
}
function retained(state: GameState, id: string): ProfessionalPromise {
  const rows = state.promises.filter(row => row.promiseId === id); expect(rows).toHaveLength(1); return rows[0]!
}
function openPair(state: GameState): ProfessionalPromise[] {
  return ['promise-0', 'promise-1'].map((id, index) => {
    const original = retained(state, id)
    const row = original.outcome === 'WAIVED' ? retained(state, original.supersededByPromiseId!) : original
    expect(row).toMatchObject({ family: 'APPEARANCE_COUNT', predicate: { count: 1 }, version: 4,
      issuerStudioId: issuer(state), beneficiaryPersonId: index === 0 ? CAST.lead : CAST.antagonist,
      progress: 0, outcome: null, evidenceRefs: [], contractId: original.contractId,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null, rulesVersion: 4 } })
    assert.ok(row.contractId)
    const employment = state.hollywood!.employment.find(e => e.contractId === row.contractId); assert.ok(employment)
    expect(employment).toMatchObject({ studioId: issuer(state), endedWeek: null,
      terms: { talentId: row.beneficiaryPersonId, startWeek: 52, endWeekExclusive: 104, termWeeks: 52 } })
    return row
  })
}
function allOwners(state: GameState) {
  return [{ studioId: issuer(state), productions: state.studio.activeProductions, development: state.scriptDevelopment,
    workflows: state.operations.workflows }, ...state.hollywood!.businesses.map(row => ({ studioId: row.studioId,
      productions: row.productions, development: row.development, workflows: row.operations.workflows }))]
}
function physicalFacts(state: GameState, personId: string) {
  expect(state.market.tick).toBe(60); suffix(state); admitted(state)
  const p = production(state), w = workflow(state)
  expect(state.studio.activeProductions).toEqual([p])
  expect(p).toMatchObject({ conceptId: 'c-00', writerId: WRITER, directorId: DIRECTOR, cast: CAST,
    craftIds: [CRAFT], startTick: 52, remainingTicks: 5 })
  expect(w).toMatchObject({ phase: 'shooting', blocker: null, shootingTask: { status: 'scheduled', directorId: DIRECTOR } })
  expect(state.firstTakes.filter(row => row.studioId === issuer(state))).toEqual([])
  expect(state.releaseAuthority.commitments).toEqual([])
  expect(state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] })
  expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] }); expect(state.productionQueue).toEqual([])
  const heldConcept = state.concepts.find(row => row.id === p.conceptId); assert.ok(heldConcept)
  expect(heldConcept.genre).toBe('comedy')
  const used = new Set([...state.studio.activeProductions, ...state.studio.releasedFilms].map(row => row.conceptId))
  const drama = state.concepts.filter(row => row.genre === 'drama' && !used.has(row.id))
  expect(drama.map(row => row.id)).toEqual(['c-16', 'c-22', 'c-26'])
  const talent = state.talent.find(row => row.id === personId); assert.ok(talent?.skills.acting)
  const provenance = state.talentProvenance.rows.find(row => row.personId === personId); assert.ok(provenance)
  expect(talent.age).toBe(core.ageAt(provenance, 60)); expect(Number.isSafeInteger(talent.age)).toBe(true)
  expect(talent.role).toBe('actor')
  const current = core.retirementRecordFor(state, personId), acting = core.retirementRecordFor(state, personId, 'actor')
  expect(current).toBeUndefined(); expect(acting).toBeUndefined()
  const assignment = core.assignmentRefusal(state, personId, 60, 'actor'); expect(assignment).toBeNull()
  const contract = activeContract(state, personId); assert.ok(contract)
  expect(contract).toMatchObject({ talentId: personId, startWeek: personId === IDLE ? 13 : 52,
    endWeekExclusive: personId === IDLE ? 221 : 104, termWeeks: personId === IDLE ? 208 : 52 })
  const employment = state.hollywood!.employment.filter(row => row.terms.talentId === personId
    && row.terms.startWeek <= 60 && row.terms.endWeekExclusive > 60 && (row.endedWeek === null || row.endedWeek > 60))
  expect(employment).toHaveLength(1); expect(employment[0]!.studioId).toBe(issuer(state)); expect(employment[0]!.terms).toEqual(contract)
  const company = allOwners(state).flatMap(owner => owner.productions.map(row => ({ studioId: owner.studioId,
    production: clone(row), member: row.directorId === personId || Object.values(row.cast).includes(personId) || row.craftIds.includes(personId) })))
  expect(company.filter(row => row.member).map(row => row.production.id)).toEqual(personId === IDLE ? [] : [p.id])
  const writing = allOwners(state).flatMap(owner => owner.development.projects.filter(row =>
    ['drafting', 'rewriting'].includes(row.status) && row.writerIds.includes(personId)).map(row => ({ studioId: owner.studioId, project: clone(row) })))
  const research = state.technology.projects.filter(row => row.status === 'active'
    && row.seats.some(seat => seat.talentId === personId && seat.releasedWeek === null))
  expect(writing).toEqual([]); expect(research).toEqual([])
  const claims = resourceClaimsOf(occupiedResourceSlots(state))
  const expectedFacility = state.operations.workflows.flatMap(row => {
    const result: { owner: string; ownerId: string; facilityId: string; slot: number | null; capability: string | null }[] =
      row.reservations.map(r => ({ owner: 'production', ownerId: row.productionId, facilityId: r.facilityId, slot: r.slot, capability: r.capability }))
    if (row.shootingTask !== null) result.push({ owner: 'shootingTask', ownerId: row.productionId,
      facilityId: row.shootingTask.soundstageFacilityId, slot: null, capability: null })
    return result
  })
  expect(claims.filter(row => row.kind === 'facility' && (row.owner === 'production' || row.owner === 'shootingTask'))
    .map(row => ({ owner: row.owner, ownerId: row.ownerId, facilityId: row.facilityId, slot: row.slot, capability: row.capability })))
    .toEqual(expectedFacility)
  // All claims, including whole-facility references, participate; standing mounts are not production slots.
  const free = (['development-casting', 'soundstage', 'set-scenery', 'post'] as const).map(capability => ({ capability,
    slots: state.operations.facilities.filter(row => row.capability === capability).flatMap(facility =>
      Array.from({ length: facility.capacity }, (_, slot) => ({ facilityId: facility.id, slot })).filter(slot =>
        !claims.some(row => row.kind === 'facility' && row.facilityId === slot.facilityId
          && (row.slot === null || row.slot === slot.slot)))) }))
  for (const row of free) expect(row.slots.length).toBeGreaterThan(0)
  const stage = free.find(row => row.capability === 'soundstage')!; assert.ok(w.shootingTask)
  expect(stage.slots.every(row => row.facilityId !== w.shootingTask!.soundstageFacilityId)).toBe(true)
  const takeLowerBound = 60 + Math.max(1, p.remainingTicks - 4) + (p.startTick >= 60 ? 1 : 0)
  const releaseLowerBound = 60 + Math.max(1, p.remainingTicks) + (p.startTick >= 60 ? 1 : 0)
  expect([takeLowerBound, releaseLowerBound]).toEqual([61, 65])
  return { personId, talent: clone(talent), provenance: clone(provenance), contract: clone(contract), employment: clone(employment),
    currentRetirement: current ?? null, actingRetirement: acting ?? null, assignment, company, writing, research: clone(research),
    production: clone(p), workflow: clone(w), heldConcept: clone(heldConcept), drama: clone(drama),
    facilities: clone(state.operations.facilities), claims: clone(claims), free,
    takeLowerBound, releaseLowerBound, physicalFreshWeek: personId === IDLE ? 60 : releaseLowerBound }
}
function membership(state: GameState, request: PromiseDraft) {
  const from = Math.max(60, request.windowStartWeek)
  const attached = [...new Set(state.talentMarket.proposals.flatMap(row => row.promises))]
  const rows = state.promises.map(row => {
    const remaining = row.predicate.count - row.progress, open = row.outcome === null, unmet = remaining > 0
    const boundOrAttached = row.contractId !== null || attached.includes(row.promiseId)
    const overlap = row.dueWeekExclusive > from && row.windowStartWeek < request.dueWeekExclusive
    const issuerOrPerson = row.issuerStudioId === request.issuerStudioId || row.beneficiaryPersonId === request.beneficiaryPersonId
    const notSelf = row.promiseId !== request.promiseId
    return { promiseId: row.promiseId, remaining, open, unmet, boundOrAttached, overlap, issuerOrPerson, notSelf,
      selected: open && unmet && boundOrAttached && overlap && issuerOrPerson && notSelf }
  })
  const ids = rows.filter(row => row.selected).map(row => row.promiseId)
  return { from, rows, selected: state.promises.filter(row => ids.includes(row.promiseId)), attached,
    proposals: clone(state.talentMarket.proposals), allPromises: clone(state.promises) }
}
function groupFacts(state: GameState, request: PromiseDraft, selected: readonly ProfessionalPromise[]) {
  const pair = openPair(state), ids = pair.map(row => row.promiseId)
  expect(selected).toEqual(state.promises.filter(row => ids.includes(row.promiseId)))
  // Census preserves append order; presentation pairs the two actual beneficiaries, never rewrites selection.
  const held = pair.map(row => {
    // Both real reservations remain ordinary all-cast P1; no hypothetical material/root is inserted.
    expect(row.predicate).toEqual({ count: 1 })
    const owner = allOwners(state).find(o => o.studioId === row.issuerStudioId); assert.ok(owner)
    const candidates = owner.productions.filter(p => p.remainingTicks >= 5
      && Object.values(p.cast).includes(row.beneficiaryPersonId)
      && !state.firstTakes.some(take => take.productionId === p.id)
      && owner.workflows.find(w => w.productionId === p.id)?.blocker == null
      && Math.max(60 + Math.max(1, p.remainingTicks - 4) + (p.startTick >= 60 ? 1 : 0), row.windowStartWeek) < row.dueWeekExclusive)
    expect(candidates.map(p => p.id)).toEqual([production(state).id])
    return { promiseId: row.promiseId, beneficiaryPersonId: row.beneficiaryPersonId, contractId: row.contractId,
      windowStartWeek: row.windowStartWeek, dueWeekExclusive: row.dueWeekExclusive, remaining: row.predicate.count - row.progress,
      candidates: clone(candidates), individualTake: Math.max(61, row.windowStartWeek) }
  })
  const p = production(state), commonTake = Math.max(61, ...held.map(row => row.windowStartWeek))
  const compatible = held.every(row => commonTake < row.dueWeekExclusive)
  const inCompany = p.directorId === request.beneficiaryPersonId || Object.values(p.cast).includes(request.beneficiaryPersonId)
    || p.craftIds.includes(request.beneficiaryPersonId)
  const physicalFresh = inCompany ? 65 : 60
  const commonRelease = Math.max(65, commonTake + 4)
  return { held, productionId: p.id, groupCount: 1, commonTake, compatible, inCompany, commonRelease,
    physicalFresh, physicalTake: physicalFresh + 5, delayedFresh: inCompany ? commonRelease : 60,
    delayedTake: (inCompany ? commonRelease : 60) + 5 }
}
const quoteTrace: { name: string; request: PromiseDraft; receipt: ReturnType<typeof core.promiseFeasibility>;
  stateBytes: number; stateSha256: string; facts: ReturnType<typeof physicalFacts> }[] = []
function quote(state: GameState, request: PromiseDraft, name: string,
  classification: PromiseClassification, bottleneck: string | null, clock: unknown) {
  assert.ok(count.explicitQuotes < HARD_QUOTES, 'only eight direct quote calls')
  const before = bytes(state), draftBefore = stable(request), rng = clone(state.rngState)
  const facts = physicalFacts(state, request.beneficiaryPersonId), census = membership(state, request)
  const material = request.family === 'PREFERRED_GENRE_OPPORTUNITY'
  const group = material ? groupFacts(state, request, census.selected) : null
  const spy = vi.spyOn(opportunityOwner, 'opportunityReservations') // The single real quote forwards normally.
  let receipt: ReturnType<typeof core.promiseFeasibility>, selection: unknown
  try {
    count.explicitQuotes++
    receipt = core.promiseFeasibility(state, request, 60); count.returnedQuotes++
    expect(spy.mock.calls).toHaveLength(1)
    const call = spy.mock.calls[0]!, result = spy.mock.results[0]!
    expect(call[0]).toBe(state); expect(call[1]).toBe(request); expect(call[2]).toBe(census.from)
    expect(result.type).toBe('return'); selection = clone(result.value)
  } finally { spy.mockRestore() } // Restore only this spy; the advance guard stays installed.
  emit('QUOTE', { name, actualWeek: 60, request, receipt, clock, group, facts, membership: census,
    actualOpportunitySelection: selection ?? null, stateBytes: Buffer.byteLength(before), stateSha256: sha(before) })
  expect(bytes(state)).toBe(before); expect(stable(request)).toBe(draftBefore); expect(state.rngState).toEqual(rng)
  if (material) expect(selection).toEqual(census.selected); else expect(selection).toBeUndefined()
  quoteTrace.push({ name, request: clone(request), receipt: clone(receipt), facts: clone(facts),
    stateBytes: Buffer.byteLength(before), stateSha256: sha(before) })
  expect(receipt).toMatchObject({ classification, bottleneck, week: 60, rulesVersion: material ? 7 : 4 })
  expect(receipt.inputsDigest).toMatch(/^[0-9a-f]{16}$/)
  return { receipt, group, census, facts }
}
function materialDraft(state: GameState, personId: string, due: number): PromiseDraft {
  const contract = activeContract(state, personId); assert.ok(contract)
  return { family: 'PREFERRED_GENRE_OPPORTUNITY', issuerStudioId: issuer(state), beneficiaryPersonId: personId,
    predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'drama' },
    startWeek: contract.startWeek, termWeeks: contract.termWeeks, windowStartWeek: 60, dueWeekExclusive: due }
}
function publicWaiver(state: GameState, promiseId: string, windowStartWeek: number, dueWeekExclusive: number): GameState {
  const original = clone(retained(state, promiseId)), before = bytes(state), rng = clone(state.rngState)
  expect(original).toMatchObject({ family: 'APPEARANCE_COUNT', predicate: { count: 1 }, progress: 0,
    evidenceRefs: [], outcome: null, version: 4, windowStartWeek: 52, dueWeekExclusive: 92 })
  const contract = activeContract(state, original.beneficiaryPersonId); assert.ok(contract)
  expect(contract).toMatchObject({ startWeek: 52, endWeekExclusive: 104, termWeeks: 52 })
  expect(state.hollywood!.employment.find(row => row.contractId === original.contractId)?.terms).toEqual(contract)
  const substitute: PromiseAttachment = { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek, dueWeekExclusive }
  const request: PromiseDraft = { ...substitute, issuerStudioId: original.issuerStudioId,
    beneficiaryPersonId: original.beneficiaryPersonId, startWeek: contract.startWeek, termWeeks: contract.termWeeks, promiseId }
  const trust = promiseOwner.trustDescriptor(state, original.beneficiaryPersonId, issuer(state), 60)
  const from = Math.max(windowStartWeek, 60), p = production(state)
  // Existing evaluator4 uses from for its first held event and its unchanged 8-week sequential clock.
  const first = from + Math.max(1, p.remainingTicks - 4) + (p.startTick >= from ? 1 : 0), second = from + 8 + 5
  const third = from + 16 + 5
  const clock = { evaluator: 4, from, first, second, third, nMax: 2, buffer: 1,
    firstSlack: dueWeekExclusive - first, existingHeldProduction: p.id, legacyUnusedStock: true }
  expect([first, second, third]).toEqual(promiseId === 'promise-0' ? [82, 94, 102] : [62, 74, 82])
  expect(first).toBeLessThan(dueWeekExclusive); expect(second).toBeLessThan(dueWeekExclusive)
  expect(third).toBeGreaterThanOrEqual(dueWeekExclusive); expect(clock.firstSlack).toBe(19)
  emit('WAIVER-PREMISE', { original, substitute, actualContract: contract, trust, clock })
  expect(trust.label).not.toBe('Distrusted'); expect(trust.drivers.some(row => row.kind === 'ranToEnd' && row.positive)).toBe(true)
  expect(bytes(state)).toBe(before); expect(state.rngState).toEqual(rng)
  const preview = quote(state, request, `P1-preview-${promiseId}`, 'REASONABLY_ACHIEVABLE', null, clock).receipt
  assert.ok(count.actionAttempts < HARD_ACTIONS)
  const operation: (typeof operations)[number] = { week: 60,
    action: { kind: 'waivePromise', promiseId, substitute: { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek, dueWeekExclusive } },
    accepted: false }
  operations.push(operation); count.actionAttempts++; emit('ACTION-ATTEMPT', operation)
  const argument = { promiseId, substitute: clone(substitute) }, argumentBefore = stable(argument)
  const next = core.waivePromise(clone(state), argument)
  expect(bytes(state)).toBe(before); expect(stable(argument)).toBe(argumentBefore); expect(next.rngState).toEqual(rng)
  expect(next.market.tick).toBe(60); admitted(next); suffix(next)
  const waived = retained(next, promiseId); assert.ok(waived.supersededByPromiseId)
  const successor = retained(next, waived.supersededByPromiseId)
  expect(waived).toEqual({ ...original, outcome: 'WAIVED', outcomeWeek: 60, outcomeCause: waived.outcomeCause,
    outcomeEventId: waived.outcomeEventId, supersededByPromiseId: successor.promiseId })
  assert.ok(waived.outcomeCause); assert.ok(waived.outcomeEventId)
  expect(successor).toEqual({ promiseId: `promise-${state.promises.length}`, ...substitute, version: 4,
    issuerStudioId: original.issuerStudioId, beneficiaryPersonId: original.beneficiaryPersonId, contractId: original.contractId,
    feasibilityReceipt: preview, progress: 0, evidenceRefs: [], outcome: null, outcomeWeek: null, outcomeCause: null,
    outcomeEventId: null, supersededByPromiseId: null })
  expect(next.promises).toHaveLength(state.promises.length + 1)
  expect(next.promises.filter(row => row.promiseId !== promiseId && row.promiseId !== successor.promiseId))
    .toEqual(state.promises.filter(row => row.promiseId !== promiseId))
  const { promises: _beforePromises, talentMarket: beforeMarket, ...beforeOther } = state
  const { promises: _afterPromises, talentMarket: afterMarket, ...afterOther } = next
  expect(afterOther).toEqual(beforeOther)
  const { receipts: beforeReceipts, ...beforeMarketOther } = beforeMarket
  const { receipts: afterReceipts, ...afterMarketOther } = afterMarket
  expect(afterMarketOther).toEqual(beforeMarketOther); expect(afterReceipts.slice(0, beforeReceipts.length)).toEqual(beforeReceipts)
  expect(afterReceipts.slice(beforeReceipts.length)).toEqual([expect.objectContaining({ eventId: waived.outcomeEventId,
    kind: 'promiseOutcome', week: 60, talentId: original.beneficiaryPersonId, studioId: issuer(state) })])
  operation.accepted = true; count.actionsAccepted++
  emit('ACTION-ACCEPTED', { ...operation, waived, successor, preview, actualNewReceipt: afterReceipts.slice(beforeReceipts.length),
    internalFeasibilityCalls: 'ordinary public waiver acceptance and minted-receipt evaluations; not explicit test quotes' })
  return next
}
function firstWaiver60(): GameState {
  return memo('initial-quote-and-first-waiver60', () => {
    const state = scheduled60(), request = materialDraft(state, CAST.lead, 90)
    const before = quote(state, request, 'P4-Actor09-original-due90', 'REASONABLY_ACHIEVABLE', null,
      { evaluator: 7, earliestHeldTake: 61, commonTake: 61, release: 65, freshTake: 70 })
    expect(before.group).toMatchObject({ commonTake: 61, commonRelease: 65, compatible: true, physicalTake: 70, delayedTake: 70 })
    expect(before.group!.held.map(row => [row.windowStartWeek, row.dueWeekExclusive])).toEqual([[52, 92], [52, 92]])
    return publicWaiver(state, 'promise-0', 81, 101)
  })
}
function secondWaiver60(): GameState {
  return memo('compatible-queries-and-second-waiver60', () => {
    const state = firstWaiver60(), request = materialDraft(state, CAST.lead, 90)
    expect(request).toEqual(quoteTrace.find(row => row.name === 'P4-Actor09-original-due90')!.request)
    const delayed = quote(state, request, 'P4-Actor09-delayed-due90', 'FRAGILE',
      'committed reservation timing leaves this opportunity uncertain', { evaluator: 7, commonTake: 81, delayedRelease: 85, freshTake: 90 })
    expect(delayed.group).toMatchObject({ commonTake: 81, commonRelease: 85, compatible: true, physicalTake: 70, delayedTake: 90 })
    expect(delayed.group!.held.map(row => [row.windowStartWeek, row.dueWeekExclusive])).toEqual([[81, 101], [52, 92]])
    expect(delayed.facts).toEqual(quoteTrace.find(row => row.name === 'P4-Actor09-original-due90')!.facts)
    quote(state, materialDraft(state, CAST.lead, 97), 'P4-Actor09-slack7-due97', 'FRAGILE',
      'the due week leaves too little slack before filming would start', { evaluator: 7, commonTake: 81, freshTake: 90, slack: 7 })
    quote(state, materialDraft(state, CAST.lead, 98), 'P4-Actor09-slack8-due98', 'REASONABLY_ACHIEVABLE', null,
      { evaluator: 7, commonTake: 81, freshTake: 90, slack: 8 })
    const idle = quote(state, materialDraft(state, IDLE, 112), 'P4-Actor13-compatible-due112', 'REASONABLY_ACHIEVABLE', null,
      { evaluator: 7, commonTake: 81, inCompany: false, freshTake: 65, slack: 47 })
    expect(idle.group).toMatchObject({ commonTake: 81, compatible: true, inCompany: false, physicalTake: 65, delayedTake: 65 })
    return publicWaiver(state, 'promise-1', 61, 81)
  })
}
function incompatible60(): GameState {
  return memo('incompatible-group-quote60', () => {
    const state = secondWaiver60(), request = materialDraft(state, IDLE, 112)
    const previous = quoteTrace.find(row => row.name === 'P4-Actor13-compatible-due112'); assert.ok(previous)
    expect(request).toEqual(previous.request)
    const result = quote(state, request, 'P4-Actor13-incompatible-due112', 'FRAGILE',
      'other promises lack compatible committed-seat reservation witnesses',
      { evaluator: 7, individualTakes: [81, 61], commonTake: 81, firstDue: 101, secondDue: 81, freshTake: 65, slack: 47 })
    expect(result.group).toMatchObject({ groupCount: 1, commonTake: 81, compatible: false, inCompany: false, physicalTake: 65 })
    expect(result.group!.held.map(row => [row.windowStartWeek, row.dueWeekExclusive, row.individualTake])).toEqual([[81, 101, 81], [61, 81, 61]])
    expect(result.facts).toEqual(previous.facts)
    return state
  })
}

describe('P4/P5 actual shared committed seats and common-window quote bounds', () => {
  it('Q19 distinguishes one shared take clock and delayed release from incompatible individual windows', () => {
    const state = incompatible60(); admitted(state); suffix(state)
    expect(state.market.tick).toBe(60); expect(production(state).remainingTicks).toBe(5)
    expect(workflow(state)).toMatchObject({ phase: 'shooting', blocker: null, shootingTask: { status: 'scheduled' } })
    expect(state.firstTakes.filter(row => row.studioId === issuer(state))).toEqual([])
    expect(state.releaseAuthority.commitments).toEqual([])
    expect(openPair(state).map(row => [row.windowStartWeek, row.dueWeekExclusive])).toEqual([[81, 101], [61, 81]])
    expect(originalRoots.map(row => retained(state, row.promiseId).outcome)).toEqual(['WAIVED', 'WAIVED'])
    expect(tickTrace.map(row => [row.from, row.to])).toEqual(Array.from({ length: 8 }, (_, i) => [52 + i, 53 + i]))
    expect(count).toEqual({ attempted: 8, reserved: 8, invoked: 8, completed: 8, outside: 0,
      actionAttempts: 6, actionsAccepted: 6, explicitQuotes: 8, returnedQuotes: 8 })
    expect(operations.map(row => [row.week, row.action.kind, row.accepted])).toEqual([
      [52, 'greenlight', true], [55, 'setProductionSetupRecipe', true], [60, 'assignShootingDirector', true],
      [60, 'scheduleShootingTake', true], [60, 'waivePromise', true], [60, 'waivePromise', true]])
    expect(quoteTrace.map(row => row.name)).toEqual(['P4-Actor09-original-due90', 'P1-preview-promise-0',
      'P4-Actor09-delayed-due90', 'P4-Actor09-slack7-due97', 'P4-Actor09-slack8-due98',
      'P4-Actor13-compatible-due112', 'P1-preview-promise-1', 'P4-Actor13-incompatible-due112'])
    emit('FINAL', { actualWeek: 60, oldPromises: originalRoots.map(row => retained(state, row.promiseId)), openSuccessors: openPair(state),
      completeMixedSuffix: expectedSuffix, firstTakeSubjects: state.firstTakeSubjects, counters: count,
      prospectiveOnly: 'No take81, release85, fresh production90, retirement readmission or material offer was performed' })
  }, TIMEOUT)
})
