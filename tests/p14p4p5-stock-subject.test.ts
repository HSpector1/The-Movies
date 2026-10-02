// 1263-A/F/B: fixed generated Save31 stock route; F adds the public release commitment.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import * as tickOwner from '../src/core/tick.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import type { Action, FirstTakeReceipt, FirstTakeSubject, GameState, Production } from '../src/core/types.js'

const INPUT = new URL('./fixtures/p14/genuine-v31-pre-b7/', import.meta.url)
const HARD_ADVANCES = 13, HARD_ACTIONS = 5, TIMEOUT = 60_000
const WRITER = 't-wri-03', DIRECTOR = 't-dir-01', CRAFT = 't-cra-01'
const CAST = { lead: 't-act-09', antagonist: 't-act-12', support: 't-act-13' }
const clone = <T>(value: T): T => structuredClone(value)
const stable = saves.stableStringify
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const emit = (kind: string, value: unknown): void => console.info(`1263-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { attempted: 0, reserved: 0, invoked: 0, completed: 0, outside: 0,
  actionAttempts: 0, actionsAccepted: 0, explicitQuotes: 0 }
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
    if (!permit) { count.outside++; throw new Error('1263: advance outside the sole Q15 route') }
    assert.equal(permit.used, false); permit.used = true
    assert.ok(count.attempted <= HARD_ADVANCES && count.reserved < HARD_ADVANCES, 'hard13 before real invocation')
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
  emit('COUNTERS', { ...count, hardAdvanceAttempts: HARD_ADVANCES, hardActions: HARD_ACTIONS,
    historicalPrefixAdvances: 0, simulationHelperImported: false, tickDevelopmentOption: 'default false',
    phases: [...cache].map(([name, row]) => ({ name, complete: row.ok,
      ...(!row.ok ? { failure: String(row.error) } : {}) })), operations, tickTrace })
  expect(count.outside).toBe(0); expect(count.attempted).toBeLessThanOrEqual(HARD_ADVANCES)
  expect(count.actionAttempts).toBeLessThanOrEqual(HARD_ACTIONS); expect(count.explicitQuotes).toBe(0)
})
function memo(name: string, build: () => GameState): GameState {
  const old = cache.get(name)
  if (old) { if (!old.ok) throw old.error; return clone(old.value) }
  try { const value = build(); cache.set(name, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(name, { ok: false, error }); throw error }
}
function admitted(state: GameState): void {
  const before = stable(state), save = saves.makeSave(state)
  expect(save.saveVersion).toBe(44); expect(saves.validateSaveV44(save)).toBe(save)
  const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.validateSaveV44(imported)
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
  assert.ok(count.actionAttempts < HARD_ACTIONS, 'only the five prospectively fixed public mutations')
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
    [CAST.lead, 'actor', 'acting', 25], [CAST.antagonist, 'actor', 'acting', 56],
    [CAST.support, 'actor', 'acting', 40], [CRAFT, 'craft', 'craft', 45]] as const
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
    expect(contract).toMatchObject({ talentId: id, startWeek: id === CAST.lead ? 52 : 13,
      endWeekExclusive: id === CAST.lead ? 104 : 221, termWeeks: id === CAST.lead ? 52 : 208 })
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
        windowStartWeek: 52, dueWeekExclusive: 92, feasibilityReceipt: { rulesVersion: 4, week: 52 } })
      assert.ok(row.contractId)
      const employment = state.hollywood!.employment.find(e => e.contractId === row.contractId); assert.ok(employment)
      expect(employment).toMatchObject({ studioId: issuer(state), terms: { talentId: id, startWeek: 52, endWeekExclusive: 104 } })
    }
    expect(state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] })
    expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] })
    expect(state.operations).toMatchObject({ mode: 'managed', workflows: [] }); expect(state.studio.activeProductions).toEqual([])
    expect(state.productionQueue).toEqual([]); expect(state.releaseAuthority).toEqual({ commitments: [] }); expect(state.technology.adoptions).toEqual([])
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
    const plan = workflow(state); expect(state.market.tick).toBe(55); expect(plan.phase).toBe('rehearsal'); expect(plan.blocker).toBeNull()
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
function take61(): GameState {
  return memo('take61', () => {
    const scheduled = scheduled60(), state = advance(scheduled)
    expect(state.market.tick).toBe(61); expect(production(state).remainingTicks).toBe(4)
    const takes = state.firstTakes.filter(row => row.studioId === issuer(state) && row.productionId === stockId)
    emit('STOCK-TAKE', { actualWeek: state.market.tick, productionId: stockId, takes, actualSubjectRoot: state.firstTakeSubjects,
      expectedMixedSuffix: expectedSuffix, oldPromises: originalRoots.map(old => state.promises.find(row => row.promiseId === old.promiseId)) })
    expect(takes).toHaveLength(1); const take = takes[0]!
    expect(take).toMatchObject({ week: 61, directorId: DIRECTOR, cast: CAST })
    expect(state.firstTakeSubjects.facts.find(row => row.eventId === take.eventId)).toEqual({ eventId: take.eventId,
      conceptId: 'c-00', genre: 'comedy', scriptProjectId: null })
    expect(state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] }); return state
  })
}
function committed64(): GameState {
  return memo('release-commit64', () => {
    let state = take61()
    for (const from of [61, 62, 63]) { expect(state.market.tick).toBe(from); state = advance(state) }
    expect(state.market.tick).toBe(64); expect(production(state).remainingTicks).toBe(1); expect(workflow(state).phase).toBe('releaseReady')
    expect(core.commitPictureToReleaseRefusal(state, production(state).id)).toBeNull()
    return act(state, { kind: 'commitPictureToRelease', productionId: production(state).id }, next => {
      expect(next.releaseAuthority.commitments.filter(row => row.productionId === stockId)).toEqual([
        { commitmentId: `release-commitment-${stockId}`, productionId: stockId, committedAtWeek: 64 }])
    })
  })
}
function released65(): GameState {
  return memo('released65', () => advance(committed64()))
}

describe('P4/P5 genuine stock material subject', () => {
  it('Q15 retains a post-cutover stock null-project subject through actual managed release', () => {
    const released = released65(), taking = take61(), scheduled = scheduled60()
    expect(released.market.tick).toBe(65); expect(released.studio.activeProductions.some(row => row.id === stockId)).toBe(false)
    const films = released.studio.releasedFilms.filter(row => row.productionId === stockId)
    emit('RELEASE', { actualWeek: released.market.tick, productionId: stockId, films, actualSubjectRoot: released.firstTakeSubjects,
      expectedMixedSuffix: expectedSuffix, take61Suffix: taking.firstTakeSubjects.facts,
      oldPromises: originalRoots.map(old => released.promises.find(row => row.promiseId === old.promiseId)), counters: count })
    expect(films).toHaveLength(1); expect(films[0]).toMatchObject({ conceptId: 'c-00', directorId: DIRECTOR, releaseTick: 64 })
    expect(films[0]!.participants).toEqual(production(scheduled).participants)
    expect(released.concepts.find(row => row.id === films[0]!.conceptId)).toMatchObject({ id: 'c-00', genre: 'comedy' })
    const ownTake = taking.firstTakes.find(row => row.studioId === issuer(taking) && row.productionId === stockId); assert.ok(ownTake)
    expect(released.firstTakeSubjects.facts.find(row => row.eventId === ownTake.eventId)).toEqual({ eventId: ownTake.eventId,
      conceptId: 'c-00', genre: 'comedy', scriptProjectId: null })
    expect(released.firstTakeSubjects.facts.slice(0, taking.firstTakeSubjects.facts.length)).toEqual(taking.firstTakeSubjects.facts)
    expect(released.firstTakes.slice(0, taking.firstTakes.length)).toEqual(taking.firstTakes)
    expect(released.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] }); suffix(released); admitted(released)
    expect(tickTrace.map(row => [row.from, row.to])).toEqual(Array.from({ length: 13 }, (_, i) => [52 + i, 53 + i]))
    expect(count).toEqual({ attempted: 13, reserved: 13, invoked: 13, completed: 13, outside: 0,
      actionAttempts: 5, actionsAccepted: 5, explicitQuotes: 0 })
    expect(operations.map(row => [row.week, row.action.kind, row.accepted])).toEqual([
      [52, 'greenlight', true], [55, 'setProductionSetupRecipe', true], [60, 'assignShootingDirector', true],
      [60, 'scheduleShootingTake', true], [64, 'commitPictureToRelease', true]])
  }, TIMEOUT)
})
