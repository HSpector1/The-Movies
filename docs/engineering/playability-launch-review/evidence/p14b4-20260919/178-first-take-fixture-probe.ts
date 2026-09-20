// AUTHORING ONLY until parent executes179. Generated fixtures; no replay API.
// Run from repository root with installed vite-node. No source/fixture writes.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { applyActions } from '../../../../../src/core/actions.js'
import { initializeHollywood } from '../../../../../src/core/hollywood.js'
import { productionCompanyTalentIds } from '../../../../../src/core/productionPeople.js'
import { makeSave } from '../../../../../src/core/save.js'
import { sceneryLoadInDecision } from '../../../../../src/core/sceneryLoadIn.js'
import { scriptProjectWriterIds } from '../../../../../src/core/scriptDevelopment.js'
import { tick } from '../../../../../src/core/tick.js'
import type { GameState } from '../../../../../src/core/types.js'
import { operationsStudio, productionPayload } from '../../../../../tests/contracts/_contractFixtures.js'

const DECLARED_BASE = 'd9ebb81090dafc0d18d7c0f3b86e5f92d66ae123'
const SEED = 'p13a-production-consumer'
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const emit = (label: string, value: unknown) => console.log(label, JSON.stringify(value))
const total = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0)
const writing = (status: string) => status === 'drafting' || status === 'rewriting'

function required<T>(value: T | undefined, label: string): T {
  assert.notEqual(value, undefined, label)
  return value!
}
function footprint(value: object) {
  const keys = Reflect.ownKeys(value).filter((key) => Object.prototype.propertyIsEnumerable.call(value, key))
  const strings = keys.filter((key): key is string => typeof key === 'string')
  return { stringKeys: strings, stringKeyCount: strings.length,
    symbolKeyCount: keys.length - strings.length, stringKeyUnits: total(strings.map((key) => key.length)),
    shallowCopyUnits162: 1 + total(strings.map((key) => 3 + key.length)) + 3 * (keys.length - strings.length) }
}
function strings(values: readonly string[]) {
  return { occurrences: values.length, utf16Units: total(values.map((value) => value.length)),
    maxUtf16Units: Math.max(0, ...values.map((value) => value.length)) }
}
function shallowStrings(values: readonly object[]) {
  return strings(values.flatMap((value) => Object.values(value).filter((field): field is string => typeof field === 'string')))
}
function pictureSummary(state: GameState) {
  return state.studio.activeProductions.map((production) => {
    const workflow = required(state.operations.workflows.find((row) => row.productionId === production.id), 'real workflow join')
    return { id: production.id, startTick: production.startTick, remainingTicks: production.remainingTicks,
      conceptId: production.conceptId, writerId: production.writerId, directorId: production.directorId,
      cast: production.cast, craftIds: production.craftIds,
      companyIds: [...productionCompanyTalentIds([production])], workflow,
      scenery: sceneryLoadInDecision(state, workflow, state.market.tick),
      recordSha256: sha(JSON.stringify(production)), enumerable: footprint(production) }
  })
}
function localProjection(state: GameState) {
  assert.ok(state.hollywood)
  const own = state.hollywood.playerStudioId
  const fullProjection = { week: state.market.tick, productions: state.studio.activeProductions,
    operations: state.operations, sets: state.sets,
    technology: state.technology.productions.filter((row) => row.studioId === own),
    releaseAuthority: state.releaseAuthority }
  return { week: state.market.tick, issuerId: own,
    fullLocalProjectionSha256: sha(JSON.stringify(fullProjection)), pictures: pictureSummary(state),
    operations: state.operations, sets: state.sets, ownTechnology: fullProjection.technology,
    releaseAuthority: state.releaseAuthority }
}

function sourceFacts(state: GameState) {
  assert.ok(state.hollywood, 'genuine industry identity is required')
  const own = state.hollywood.playerStudioId
  const claimed = state.studio.activeProductions.flatMap((production) => Object.values(production.cast))
  const company = [...productionCompanyTalentIds(state.studio.activeProductions)]
  const playerWriting = state.scriptDevelopment.projects.filter((row) => writing(row.status))
  const activeWriters = playerWriting.flatMap((row) => [...scriptProjectWriterIds(row)])
  const relevant = new Set([...claimed, ...company, ...activeWriters])
  for (const id of relevant) assert.ok(state.talent.some((person) => person.id === id), `missing real person ${id}`)
  const foreign = state.hollywood.businesses.filter((business) => business.studioId !== own).map((business) => {
    assert.ok(state.hollywood!.identities.some((identity) => identity.studioId === business.studioId), 'foreign studio identity join')
    assert.equal(new Set(business.activeScriptOrdinals).size, business.activeScriptOrdinals.length, 'duplicate active script ordinal')
    const projects = business.activeScriptOrdinals.map((ordinal) => {
      assert.ok(Number.isSafeInteger(ordinal) && ordinal >= 0, 'invalid actual active script ordinal')
      const project = required(business.development.projects[ordinal], 'indexed foreign screenplay missing')
      const costs = required(business.projects[ordinal], 'indexed foreign project costs missing')
      assert.equal(costs.scriptProjectId, project.id)
      assert.equal(costs.conceptId, project.conceptId)
      assert.equal(required(state.hollywood!.concepts[costs.conceptOrdinal], 'indexed foreign concept missing').id, project.conceptId)
      assert.notEqual(project.status, 'produced', 'produced row cannot remain current active ordinal')
      const writers = [...scriptProjectWriterIds(project)]
      for (const id of writers) assert.ok(state.talent.some((person) => person.id === id), 'indexed foreign writer missing')
      return { ordinal, projectId: project.id, status: project.status, writerIds: writers,
        dueWeek: project.dueWeek, reservation: project.reservation,
        relevantActiveWriters: writing(project.status) ? writers.filter((id) => relevant.has(id)) : [] }
    })
    const productions = business.productions.map((production) => {
      const companyIds = [...productionCompanyTalentIds([production])]
      for (const id of companyIds) assert.ok(state.talent.some((person) => person.id === id), 'foreign company person missing')
      return { id: production.id, companyIds, relevantCompanyIds: companyIds.filter((id) => relevant.has(id)) }
    })
    return { studioId: business.studioId, developmentRowCount: business.development.projects.length,
      activeScriptOrdinals: business.activeScriptOrdinals, productions, projects }
  })
  const research = state.technology.projects.map((project) => {
    assert.ok(state.hollywood!.identities.some((identity) => identity.studioId === project.studioId), 'research studio identity missing')
    for (const seat of project.seats) assert.ok(state.talent.some((person) => person.id === seat.talentId), 'research seat person missing')
    return { id: project.id, studioId: project.studioId, status: project.status,
      seats: project.seats.map((seat) => ({ ...seat })),
      relevantActiveSeats: project.status === 'active'
        ? project.seats.filter((seat) => seat.releasedWeek === null && relevant.has(seat.talentId)) : [] }
  })
  const cuts = {
    openFounding: state.founding !== null, operationsMode: state.operations.mode,
    queue: state.productionQueue,
    ownPendingPlans: state.physicalPlans.plans.filter((plan) => plan.studioId === own
      && (plan.status === 'queued' || plan.status === 'held' || plan.status === 'blocked')),
    legacyBuilding: state.construction.projects.filter((row) => row.status === 'building'),
    placementsUnderConstruction: state.placement.facilities.filter((row) => row.status === 'underConstruction'),
    setsUnderWork: state.sets.filter((row) => row.status === 'under-construction'),
    ownActiveResearch: research.filter((row) => row.studioId === own && row.status === 'active'),
    ownPendingAdoption: state.technology.adoptions.filter((row) => row.studioId === own && row.cancelledWeek === null && row.operationalWeek === null),
    relevantForeignProductions: foreign.flatMap((business) => business.productions
      .filter((row) => row.relevantCompanyIds.length > 0).map((row) => ({ studioId: business.studioId, ...row }))),
    relevantForeignWriting: foreign.flatMap((business) => business.projects
      .filter((row) => row.relevantActiveWriters.length > 0).map((row) => ({ studioId: business.studioId, ...row }))),
    relevantForeignResearch: research.filter((row) => row.studioId !== own && row.relevantActiveSeats.length > 0),
  }
  const consumedIds = [own, ...claimed, ...company, ...activeWriters,
    ...state.studio.activeProductions.flatMap((row) => [row.id, row.conceptId, row.writerId, row.directorId, ...Object.values(row.cast), ...row.craftIds]),
    ...state.operations.facilities.map((row) => row.id),
    ...state.operations.workflows.flatMap((row) => [row.productionId, ...row.reservations.map((reservation) => reservation.facilityId)]),
    ...state.concepts.map((row) => row.id), ...state.sets.flatMap((row) => [row.id, row.mountedOn]),
    ...foreign.flatMap((business) => [business.studioId, ...business.productions.flatMap((row) => [row.id, ...row.companyIds]),
      ...business.projects.flatMap((row) => [row.projectId, ...row.writerIds])]),
    ...state.technology.productions.flatMap((row) => [row.studioId, row.productionId]),
    ...state.technology.projects.flatMap((row) => [row.id, row.studioId, ...row.seats.map((seat) => seat.talentId)]),
  ]
  const dimensions = {
    productions: state.studio.activeProductions.length, workflows: state.operations.workflows.length,
    reservations: total(state.operations.workflows.map((row) => row.reservations.length)),
    facilities: state.operations.facilities.map((row) => ({ id: row.id, capability: row.capability, capacity: row.capacity })),
    capacitySum: total(state.operations.facilities.map((row) => row.capacity)),
    postCapacity: total(state.operations.facilities.filter((row) => row.capability === 'post').map((row) => row.capacity)),
    sets: state.sets.length, concepts: state.concepts.length, ownScripts: state.scriptDevelopment.projects.length,
    castingSessions: state.castingSessions.sessions.length,
    technology: { productions: state.technology.productions.length, access: state.technology.access.length,
      adoptions: state.technology.adoptions.length, equipment: state.technology.equipment.length,
      projects: state.technology.projects.length, researchSeats: total(state.technology.projects.map((row) => row.seats.length)) },
    placements: state.placement.facilities.length, cells: total(state.placement.facilities.map((row) => row.cells.length)),
    structures: state.property.structures.length,
    providesFacilityIds: total(state.property.structures.map((row) => row.providesFacilityIds.length)),
    foreignBusinesses: foreign.length, foreignCurrentProductions: total(foreign.map((row) => row.productions.length)),
    foreignIndexedScripts: total(foreign.map((row) => row.projects.length)),
    foreignIndexedWriterIds: total(foreign.flatMap((row) => row.projects.map((project) => project.writerIds.length))),
    enumeratedIdOccurrences: strings(consumedIds), enumeratedUniqueIds: strings([...new Set(consumedIds)]),
    shallowStringValues: { productions: shallowStrings(state.studio.activeProductions),
      workflows: shallowStrings(state.operations.workflows), facilities: shallowStrings(state.operations.facilities),
      concepts: shallowStrings(state.concepts), sets: shallowStrings(state.sets),
      placements: shallowStrings(state.placement.facilities), structures: shallowStrings(state.property.structures),
      providesFacilityIds: strings(state.property.structures.flatMap((row) => row.providesFacilityIds)),
      technologyProductions: shallowStrings(state.technology.productions), access: shallowStrings(state.technology.access),
      adoptions: shallowStrings(state.technology.adoptions), equipment: shallowStrings(state.technology.equipment),
      researchProjects: shallowStrings(state.technology.projects),
      researchSeats: shallowStrings(state.technology.projects.flatMap((row) => row.seats)) },
  }
  const enumerable = {
    operations: footprint(state.operations), technology: footprint(state.technology),
    productions: state.studio.activeProductions.map((row) => ({ id: row.id, ...footprint(row) })),
    workflows: state.operations.workflows.map((row) => ({ id: row.productionId, ...footprint(row),
      bindings: footprint(row.bindings), task: row.shootingTask === null ? null : footprint(row.shootingTask) })),
    sets: state.sets.map((row) => ({ id: row.id, ...footprint(row) })),
    placements: state.placement.facilities.map(footprint), structures: state.property.structures.map(footprint),
    technologyRows: { productions: state.technology.productions.map(footprint), access: state.technology.access.map(footprint),
      adoptions: state.technology.adoptions.map(footprint), equipment: state.technology.equipment.map(footprint),
      projects: state.technology.projects.map(footprint) },
  }
  return { issuerId: own, claimedPersonIds: claimed, companyIds: company, activeWritingIds: activeWriters,
    cuts, dimensions, enumerable, foreign, research,
    originals: { physicalPlans: state.physicalPlans, construction: state.construction,
      placement: state.placement, ownScripts: state.scriptDevelopment,
      castingSessions: state.castingSessions, ownAdoptions: state.technology.adoptions.filter((row) => row.studioId === own) } }
}

function build(count: 1 | 2): GameState {
  let state = initializeHollywood(operationsStudio(SEED), 'fresh')
  assert.equal(state.operations.mode, 'managed')
  assert.equal(state.scriptDevelopment.mode, 'legacy')
  for (let offset = 0; offset < count; offset++) {
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, offset) }])
  }
  assert.equal(state.studio.activeProductions.length, count, 'both real greenlights must admit, not queue')
  const ids = state.studio.activeProductions.map((row) => row.id)
  for (let guard = 0; guard < 20 && !state.studio.activeProductions.every((row) => row.remainingTicks === 5); guard++) state = tick(state)
  assert.ok(state.studio.activeProductions.every((row) => row.remainingTicks === 5), `entry guard: ${JSON.stringify(pictureSummary(state))}`)
  for (const id of ids) {
    const production = required(state.studio.activeProductions.find((row) => row.id === id), 'production retained before director call')
    state = applyActions(state, [{ kind: 'assignShootingDirector', productionId: id, directorId: production.directorId }])
  }
  const allReady = () => ids.every((id) => state.operations.workflows.find((row) => row.productionId === id)?.shootingTask?.status === 'ready')
  for (let guard = 0; guard < 8 && !allReady(); guard++) {
    assert.ok(state.studio.activeProductions.every((row) => row.remainingTicks === 5), 'uncommanded picture must not film')
    state = tick(state)
  }
  assert.ok(allReady(), `arrival guard: ${JSON.stringify(pictureSummary(state))}`)
  const schedulingWeek = state.market.tick
  for (const id of ids) state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: id }])
  assert.equal(state.market.tick, schedulingWeek, 'schedule both at the same real visible boundary')
  assert.deepEqual(state.studio.activeProductions.map((row) => row.id), ids)
  assert.equal(state.operations.workflows.length, count)
  assert.equal(new Set(state.studio.activeProductions.flatMap((row) => Object.values(row.cast))).size, 3 * count)
  const companies = state.studio.activeProductions.map((row) => [...productionCompanyTalentIds([row])])
  assert.equal(new Set(companies.flat()).size, total(companies.map((row) => row.length)), 'current companies must be genuinely disjoint')
  for (const production of state.studio.activeProductions) {
    const workflow = required(state.operations.workflows.find((row) => row.productionId === production.id), 'scheduled workflow')
    assert.equal(production.remainingTicks, 5)
    assert.ok(production.startTick < state.market.tick)
    assert.equal(workflow.phase, 'shooting')
    assert.equal(workflow.shootingTask?.status, 'scheduled')
    assert.equal(workflow.blocker, null)
    assert.notEqual(workflow.bindings.stageFacilityId, null)
    assert.notEqual(workflow.bindings.setId, null)
    assert.equal(sceneryLoadInDecision(state, workflow, state.market.tick).kind, 'none')
    assert.equal(state.firstTakes.filter((row) => row.productionId === production.id).length, 0)
  }
  makeSave(state) // unchanged strict live writer/validator, no version restamp
  return state
}

function run(count: 1 | 2) {
  const state = build(count)
  const original = structuredClone(state)
  const facts = sourceFacts(state)
  emit(`FIXTURE178_SOURCE_${count}`, { week: state.market.tick, ...facts, local: localProjection(state) })
  assert.equal(facts.cuts.openFounding, false)
  assert.equal(facts.cuts.operationsMode, 'managed')
  for (const [name, value] of Object.entries(facts.cuts)) if (Array.isArray(value)) assert.equal(value.length, 0, `genuine replay-cut premise: ${name}`)
  const ids = state.studio.activeProductions.map((row) => row.id)
  const once = tick(state)
  emit(`FIXTURE178_AFTER_ONE_${count}`, { local: localProjection(once),
    firstTakes: once.firstTakes.filter((row) => ids.includes(row.productionId)),
    events: once.studioEvents.rows.filter((row) => row.seq >= state.studioEvents.nextSeq) })
  assert.deepEqual(state, original, 'source must remain unchanged by actual tick')
  assert.equal(once.market.tick, state.market.tick + 1)
  for (const production of state.studio.activeProductions) {
    const after = required(once.studio.activeProductions.find((row) => row.id === production.id), 'first-take production survives')
    assert.equal(after.remainingTicks, 4)
    assert.deepEqual({ ...after, remainingTicks: production.remainingTicks }, production)
    const receipt = once.firstTakes.filter((row) => row.productionId === production.id)
    assert.equal(receipt.length, 1)
    assert.deepEqual(receipt[0], { eventId: receipt[0]!.eventId, week: state.market.tick + 1,
      productionId: production.id, studioId: facts.issuerId, directorId: production.directorId, cast: production.cast })
  }
  assert.deepEqual(once.sets, state.sets, 'first take is not wrap wear')
  makeSave(once)
  const afterOne = structuredClone(once)
  const twice = tick(once)
  assert.deepEqual(once, afterOne, 'first-take state must remain unchanged by second tick')
  assert.equal(twice.market.tick, state.market.tick + 2)
  assert.deepEqual(twice.firstTakes.filter((row) => ids.includes(row.productionId)), once.firstTakes.filter((row) => ids.includes(row.productionId)))
  const events = twice.studioEvents.rows.filter((row) => row.seq >= once.studioEvents.nextSeq)
  const wraps = events.filter((row) => row.kind === 'wrapped' && ids.includes(row.productionId))
  const secondFacts = { local: localProjection(twice), events, counts: { wraps: wraps.length,
    reservationReleases: events.filter((row) => row.kind === 'reservationReleased').length,
    reservationGrants: events.filter((row) => row.kind === 'reservationGranted').length,
    atPost3: twice.studio.activeProductions.filter((row) => row.remainingTicks === 3).length,
    postBlocked4: twice.studio.activeProductions.filter((row) => row.remainingTicks === 4).length },
    conditions: once.sets.map((row) => ({ setId: row.id, before: row.condition,
      after: required(twice.sets.find((next) => next.id === row.id), 'Set comparison').condition })) }
  emit(`FIXTURE178_AFTER_TWO_${count}`, secondFacts)
  assert.equal(wraps.length, count, 'every actual completed take must wrap once on the next visit')
  for (const production of twice.studio.activeProductions) {
    assert.ok(production.remainingTicks === 3 || production.remainingTicks === 4, 'actual Post advancement or actual Post capacity hold')
    const workflow = required(twice.operations.workflows.find((row) => row.productionId === production.id), 'wrapped workflow')
    assert.equal(workflow.bindings.stageFacilityId, null)
    assert.equal(workflow.shootingTask, null)
    if (production.remainingTicks === 3) assert.equal(workflow.phase, 'postProduction')
    else assert.deepEqual(workflow.blocker, { kind: 'facility-capacity', capability: 'post', targetPhase: 'postProduction' })
  }
  for (const beforeSet of once.sets) {
    const afterSet = required(twice.sets.find((row) => row.id === beforeSet.id), 'same physical Set survives wrap')
    const uses = wraps.filter((row) => row.kind === 'wrapped' && row.setId === beforeSet.id).length
    assert.equal(afterSet.condition, Math.max(0, beforeSet.condition - 9 * uses), 'literal existing per-wrap wear9')
    assert.deepEqual({ ...afterSet, condition: beforeSet.condition }, beforeSet)
  }
  makeSave(twice)
  emit(`FIXTURE178_CHECKED_${count}`, { count, sourceWeek: state.market.tick,
    firstTakeWeek: once.market.tick, postVisitWeek: twice.market.tick,
    counts: secondFacts.counts, noReplayOrBudgetClaim: true })
}

emit('FIXTURE178_PROVENANCE', { declaredSourceBase: DECLARED_BASE,
  sourceVerification: 'parent fixed-source recorder, not a self-verified Git claim',
  selfScriptSha256: sha(readFileSync(fileURLToPath(import.meta.url))), seed: SEED,
  route: 'historical-control founding; real hires/greenlight/director/schedule/ticks; no cash/RNG/clock/history edits' })
run(1)
run(2)
emit('FIXTURE178_COMPLETE', { scenarios: [1, 2], nextActualTicksPerScenario: 2 })
