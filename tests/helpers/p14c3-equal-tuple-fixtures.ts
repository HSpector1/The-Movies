// 1028-A/1032-A: public authorship and actual A/B pictures. No evidence, ages,
// ceilings, public tiers or cash are patched after creation. Max300 ticks.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../../src/core/employment.js'
import { openMarketCaseFor } from '../../src/core/talentMarket.js'
import { careerIdentity, expectedPotentialTier, roleTier } from '../../src/core/talentSummary.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import type { CustomTalentInput, GameState } from '../../src/core/types.js'
import { clone, compareText, migrated, person } from './p14c3-fixtures.js'
import { acceptedEvidence, greenlightEvidence, releaseEvidence, reopenEvidence } from './p14c3-genuine-evidence-fixtures.js'

type Route = 'main' | 'repeat'
type Pair = { directorId: string; writerId: string }
type Prepared = { source: GameState; created0: GameState; state: GameState; id: string; A: Pair; B: Pair;
  antagonistId: string; supportId: string; craftId: string }
export type ActualPicture = { productionId: string; pair: 'A' | 'B'; directorId: string; writerId: string;
  takeWeek: number; releaseWeek: number; stateWeek: number }
type Pictures = { setup: Prepared; state: GameState; pictures: ActualPicture[] }
type Cached<T> = { ok: true; value: T } | { ok: false; error: unknown }
const cache = new Map<string, Cached<unknown>>()
const calls = { main: 0, repeat: 0 }
let notice52: GameState | undefined
const released: { main: ActualPicture[]; repeat: ActualPicture[] } = { main: [], repeat: [] }
function memo<T>(key: string, build: () => T): T {
  const prior = cache.get(key) as Cached<T> | undefined
  if (prior) { if (!prior.ok) throw prior.error; return clone(prior.value) }
  try { const value = build(); cache.set(key, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(key, { ok: false, error }); throw error }
}
function step(route: Route, state: GameState): GameState {
  assert.ok(calls.main + calls.repeat < 300, 'G4 aggregate300-tick cap')
  assert.ok(state.market.tick < 260, 'G4 maximum world260')
  assert.ok(calls[route] < (route === 'main' ? 260 : 40), `G4 ${route} route cap`)
  if (route === 'main') expect(state.market.tick, 'main route never rewinds or duplicates a prefix').toBe(calls.main)
  calls[route]++
  const after = tick(state, { develop: true })
  expect(after.market.tick).toBe(state.market.tick + 1)
  if (route === 'main' && after.market.tick === 52) { acceptedEvidence(after); notice52 = clone(after) }
  return after
}
function toWeek(state: GameState, end: number): GameState {
  assert.ok(Number.isSafeInteger(end) && end >= state.market.tick && end <= 260)
  while (state.market.tick < end) state = step('main', state)
  return state
}
export function equalTupleAccounting() {
  return { tickCalls: { ...calls }, totalTickCalls: calls.main + calls.repeat,
    mainPictures: released.main.map(row => ({ pair: row.pair, takeWeek: row.takeWeek, releaseWeek: row.releaseWeek, stateWeek: row.stateWeek })),
    repeatPictures: released.repeat.map(row => ({ pair: row.pair, takeWeek: row.takeWeek, releaseWeek: row.releaseWeek, stateWeek: row.stateWeek })) }
}
const six = (value: number) => [value, value, value, value, value, value]
function authoredInput(role: 'actor' | 'director' | 'writer'): CustomTalentInput {
  return { name: role === 'actor' ? 'G4 Equal Public Tuple Actor' : `G4 New A ${role}`, role,
    age: role === 'actor' ? 69 : 30, actual: { warmth: 0, gravity: 0, physicality: 0.2 }, workEthic: 55, fame: 25,
    skills: { acting: six(role === 'actor' ? 75 : 20), writing: six(role === 'actor' ? 99 : role === 'writer' ? 75 : 20),
      directing: six(role === 'actor' ? 99 : role === 'director' ? 75 : 20), craft: six(20), research: six(1) } }
}
function addAndSign(state: GameState, role: 'actor' | 'director' | 'writer') {
  const count = state.talent.length
  let next = applyActions(state, [{ kind: 'createCustomTalent', talent: authoredInput(role) }])
  expect(next.talent).toHaveLength(count + 1)
  const id = next.talent.at(-1)!.id
  expect(Object.values(person(next, id).workHistory).every(value => value === 0)).toBe(true)
  expect(activeContract(next, id)).toBeUndefined()
  next = applyActions(next, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  expect(activeContract(next, id)).toMatchObject({ startWeek: 0, endWeekExclusive: 208, termWeeks: 208 })
  return { state: next, id }
}
export function assertEqualPublicProfiles(state: GameState, id: string): void {
  const talent = person(state, id)
  expect(talent.workEthic).toBe(55)
  for (const discipline of ['directing', 'writing'] as const) {
    expect(Object.values(talent.skills[discipline])).toHaveLength(6)
    for (const value of Object.values(talent.skills[discipline])) expect(value).toEqual({ actual: 99, perceived: 99 })
    expect(Object.values(talent.ceilings[discipline])).toEqual(six(99))
    const standing = careerIdentity(talent).disciplines.find(row => row.discipline === discipline)
    assert.ok(standing)
    expect(standing).toMatchObject({ workHistory: 0, proven: false, capable: true })
    expect(standing.ovr).toBeGreaterThanOrEqual(95)
    expect(standing.ovr).toBeLessThanOrEqual(99)
    expect(roleTier(standing.ovr)).toBe('Generational')
    expect(expectedPotentialTier(talent, discipline, state.seed)).toBe('Limited')
  }
}
export function preparedEqualTuple(): Prepared {
  return memo('prepared8', () => {
    let state = migrated('genuine-v37-c3-created-week0.json.gz')
    expect(state.market.tick).toBe(0)
    acceptedEvidence(state)
    const manifest = JSON.parse(readFileSync('tests/fixtures/p14/genuine-v37-c3-corpus/MANIFEST.json', 'utf8'))
    expect(manifest.bootstrap).toMatchObject({ cashBefore: 20_000_000, cashAfter: 30_000_000, delta: 10_000_000 })
    expect(state.ledger.filter(row => row.note === 'C3 T0 explicitly disclosed generated-fixture cash bootstrap; no simulated earned revenue'))
      .toEqual([expect.objectContaining({ week: 0, kind: 'studioRevenue', amount: 10_000_000 })])
    for (const id of ['authored-0000', 'authored-0001', 'authored-0002', 'authored-0003', 'authored-0004', 'authored-0005']) {
      expect(activeContract(state, id)).toMatchObject({ startWeek: 0, endWeekExclusive: 208 })
    }
    expect(state.scriptDevelopment.mode).toBe('legacy')
    expect(state.concepts.filter(row => !state.studio.releasedFilms.some(film => film.conceptId === row.id)
      && !state.studio.activeProductions.some(film => film.conceptId === row.id)).length).toBeGreaterThanOrEqual(4)
    const source = clone(state)
    const subject = addAndSign(state, 'actor'); state = subject.state
    const director = addAndSign(state, 'director'); state = director.state
    const writer = addAndSign(state, 'writer'); state = writer.state
    const A = { directorId: director.id, writerId: writer.id }, B = { directorId: 'authored-0002', writerId: 'authored-0003' }
    expect(compareText(A.directorId, B.directorId)).toBeGreaterThan(0)
    expect(compareText(A.writerId, B.writerId)).toBeGreaterThan(0)
    expect(state.talentProvenance.rows.find(row => row.personId === subject.id))
      .toMatchObject({ kind: 'authored_exact_week', ageAtEntry: 69, entryWeek: 0 })
    expect(state.careerLifecycle.professionAnchors.find(row => row.personId === subject.id))
      .toEqual({ personId: subject.id, profession: 'actor', kind: 'entrant', recordedWeek: 0 })
    expect(state.firstTakes.filter(row => Object.values(row.cast).includes(subject.id))).toEqual([])
    expect(state.careerEvents.filter(row => row.talentId === subject.id)).toEqual([])
    assertEqualPublicProfiles(state, subject.id)
    acceptedEvidence(state)
    const created0 = clone(state), stage = 'facility-soundstage-07'
    const mounted = state.sets.find(row => row.mountedOn === stage && row.status !== 'retired')
    if (mounted) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
    state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: stage } }])
    expect(TUNING.SET_BUILD_WEEKS_BAND_HIGH).toBe(8)
    state = toWeek(state, 8)
    expect(state.sets.some(row => row.mountedOn === stage && row.status === 'standing')).toBe(true)
    acceptedEvidence(state)
    return { source, created0, state, id: subject.id, A, B, antagonistId: 'authored-0000', supportId: 'authored-0005', craftId: 'authored-0004' }
  })
}
function picture(prior: Pictures, label: 'A' | 'B', route: Route): Pictures {
  const { setup } = prior, pair = setup[label]
  for (const id of [setup.id, pair.directorId, pair.writerId, setup.antagonistId, setup.supportId, setup.craftId]) {
    expect(activeContract(prior.state, id), `actual greenlight employment for${id}`).toBeDefined()
  }
  const made = greenlightEvidence(prior.state, { directorId: pair.directorId, writerId: pair.writerId,
    cast: { lead: setup.id, antagonist: setup.antagonistId, support: setup.supportId }, craftIds: [setup.craftId] })
  expect(made.state.studio.activeProductions.find(row => row.id === made.productionId))
    .toMatchObject({ directorId: pair.directorId, writerId: pair.writerId, cast: { lead: setup.id } })
  const state = releaseEvidence(made.state, made.productionId, pair.directorId, value => step(route, value))
  const film = state.studio.releasedFilms.find(row => row.productionId === made.productionId)
  assert.ok(film)
  expect(film.participants).toMatchObject({ director: { talentId: pair.directorId }, writer: { talentId: pair.writerId },
    cast: { lead: { talentId: setup.id }, antagonist: { talentId: setup.antagonistId }, support: { talentId: setup.supportId } } })
  const takes = state.firstTakes.filter(row => row.productionId === made.productionId)
  expect(takes).toHaveLength(1)
  expect(takes[0]).toMatchObject({ directorId: pair.directorId, cast: { lead: setup.id } })
  const row: ActualPicture = { productionId: made.productionId, pair: label, directorId: pair.directorId,
    writerId: pair.writerId, takeWeek: takes[0]!.week, releaseWeek: film.releaseTick, stateWeek: state.market.tick }
  released[route].push(row)
  assertEqualPublicProfiles(state, setup.id)
  acceptedEvidence(state)
  return { setup, state, pictures: [...prior.pictures, row] }
}
export function firstEqualPicture(): Pictures {
  return memo('main-A', () => { const setup = preparedEqualTuple(); return picture({ setup, state: setup.state, pictures: [] }, 'A', 'main') })
}
export function twoEqualMain(): Pictures { return memo('main-AB', () => picture(firstEqualPicture(), 'B', 'main')) }
export function twoEqualRepeat(): Pictures { return memo('fork-AA', () => picture(firstEqualPicture(), 'A', 'repeat')) }
export function fourEqualMain(): Pictures {
  return memo('main-ABAB', () => {
    const result = picture(picture(twoEqualMain(), 'A', 'main'), 'B', 'main')
    expect(result.state.market.tick).toBeLessThanOrEqual(168)
    expect(result.state.studio.activeProductions).toEqual([])
    expect(busyTalentIds(result.state).has(result.setup.id)).toBe(false)
    return result
  })
}
export function retiredEqualTuple() {
  return memo('retired208', () => {
    const f = fourEqualMain(), id = f.setup.id
    let state = toWeek(f.state, 195)
    assert.ok(notice52, 'the main real route must observe its actual52 birthday')
    expect(retirementRecordFor(notice52, id, 'actor')).toMatchObject({ announcedWeek: 52, ageAtAnnouncement: 70,
      cause: 'hardBoundary', effectiveWeek: 208, extensionUsed: false })
    expect(openMarketCaseFor(state, id)).toBeUndefined()
    state = toWeek(state, 196)
    expect(openMarketCaseFor(state, id)).toMatchObject({ variant: 'retirementExtension', openedWeek: 196, outcome: null })
    expect(state.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([])
    const window196 = clone(state)
    state = toWeek(state, 207)
    expect(activeContract(state, id)).toMatchObject({ startWeek: 0, endWeekExclusive: 208 })
    expect(busyTalentIds(state).has(id)).toBe(false)
    const before207 = clone(state)
    state = toWeek(state, 208)
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 208, effectiveWeek: 208 })
    expect(person(state, id)).toMatchObject({ role: 'actor', age: 73 })
    assertEqualPublicProfiles(state, id)
    acceptedEvidence(state)
    return { ...f, state, notice52: clone(notice52), window196, before207 }
  })
}
export function terminalEqualTuple() {
  return memo('terminal260', () => {
    const f = retiredEqualTuple(), id = f.setup.id, at208 = f.state
    const loaded208 = reopenEvidence(at208)
    const evaluations = clone(at208.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
    const finalities = clone(at208.careerLifecycle.industryRetirements.filter(row => row.personId === id))
    expect(evaluations).toHaveLength(1); expect(finalities).toHaveLength(1)
    let state = loaded208, at259: GameState | undefined
    const observedWeeks: number[] = []
    while (state.market.tick < 260) {
      state = step('main', state)
      observedWeeks.push(state.market.tick)
      expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)).toEqual(evaluations)
      expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual(finalities)
      expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id)).toEqual([])
      expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
      expect(retirementRecordFor(state, id, 'actor')).toEqual(retirementRecordFor(at208, id, 'actor'))
      expect(activeContract(state, id)).toBeUndefined()
      expect(state.hollywood!.employment.filter(row => row.terms.talentId === id && row.terms.startWeek <= state.market.tick
        && state.market.tick < (row.endedWeek ?? row.terms.endWeekExclusive))).toEqual([])
      expect(state.freeAgents).not.toContain(id)
      expect(busyTalentIds(state).has(id)).toBe(false)
      if (state.market.tick === 259) { acceptedEvidence(state); at259 = clone(state) }
    }
    assert.ok(at259)
    acceptedEvidence(state)
    expect(calls.main).toBe(260)
    return { ...f, at208, loaded208, at259, at260: state, observedWeeks }
  })
}
