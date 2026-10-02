// 1042/1055/1061: one measured seed, passive normal play, no funding or retry.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { expect, vi } from 'vitest'
import * as owner from '../../src/core/professionTransitions.js'
import * as scripts from '../../src/core/scriptDevelopment.js'
import { busyTalentIds } from '../../src/core/employment.js'
import { LIVE_SAVE_VERSION, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42ToV41, convertV43ToV42, convertV44ToV43,
  exportSave, makeSave, stableStringify } from '../../src/core/save.js'
import { careerIdentity, expectedPotentialTier, roleTier } from '../../src/core/talentSummary.js'
import { tick } from '../../src/core/tick.js'
import { p13aGeneratedStudio } from '../../src/harness/p13a/fixtures.js'
import type { IndustryEmployment, LiveIndustryFilm } from '../../src/core/hollywoodTypes.js'
import type { GameState, RetirementKey, ScriptProject } from '../../src/core/types.js'
import { clone, person, sha } from './p14c3-fixtures.js'
import { acceptedEvidence, reopenEvidence } from './p14c3-genuine-evidence-fixtures.js'

export const CANONICAL_SUBJECT = 'person-studio-8c9ee794-r01-4'
export const CANONICAL_STUDIO = 'studio-8c9ee794-r01'
export const CANONICAL_SEED = 'p14c3-canonical-stage-c-098'
export const CANONICAL_INITIAL_SHA = '2f9ec0fa289a28a188428f9caa59ba969c50f6bcf0c7f93819bd0d17541c5353'
const id = CANONICAL_SUBJECT
type Cached<T> = { ok: true; value: T } | { ok: false; error: unknown }
const cache = new Map<string, Cached<unknown>>()
function memo<T>(key: string, build: () => T): T {
  const prior = cache.get(key) as Cached<T> | undefined
  if (prior) { if (!prior.ok) throw prior.error; return clone(prior.value) }
  try { const value = build(); cache.set(key, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(key, { ok: false, error }); throw error }
}
const calls = { K: 0, L: 0 }
let lastWeek = 0
let currentSourceWeek = 0
const weekly: object[] = []
const appends: object[] = []
const boundaries: { label: string; state: GameState }[] = []
const accepts: { sourceWeek: number; before: ScriptProject; after: ScriptProject }[] = []
const projects = new Map<string, { studioId: string; first: ScriptProject; state: GameState }>()
const productions = new Map<string, { studioId: string; state: GameState }>()
let chosenWeek: number | null = null
let hiredWeek: number | null = null
let releasedWeek: number | null = null
function boundary(state: GameState, label: string): void {
  acceptedEvidence(state)
  boundaries.push({ label, state: clone(state) })
}
export function canonicalEmployment(state: GameState): IndustryEmployment[] {
  return state.hollywood!.employment.filter(row => row.terms.talentId === id)
}
function activeEmployment(state: GameState): IndustryEmployment[] {
  return canonicalEmployment(state).filter(row => row.terms.startWeek <= state.market.tick
    && state.market.tick < (row.endedWeek ?? row.terms.endWeekExclusive))
}
function subjectLifecycle(state: GameState) {
  const root = state.careerLifecycle
  return { records: root.records.filter(row => row.personId === id),
    due: root.transitionDue.filter(row => row.personId === id),
    evaluations: root.transitionEvaluations.filter(row => row.personId === id),
    changes: root.professionChanges.filter(row => row.personId === id),
    finality: root.industryRetirements.filter(row => row.personId === id) }
}
function observeAppend(before: GameState, after: GameState): void {
  expect(after.talent.slice(0, before.talent.length).map(row => row.id)).toEqual(before.talent.map(row => row.id))
  expect(after.talentProvenance.rows.slice(0, before.talentProvenance.rows.length)).toEqual(before.talentProvenance.rows)
  expect(after.careerLifecycle.professionAnchors.slice(0, before.careerLifecycle.professionAnchors.length))
    .toEqual(before.careerLifecycle.professionAnchors)
  const added = after.talent.slice(before.talent.length)
  for (const talent of added) {
    const anchors = after.careerLifecycle.professionAnchors.filter(row => row.personId === talent.id)
    const provenance = after.talentProvenance.rows.filter(row => row.personId === talent.id)
    expect(anchors).toHaveLength(1); expect(provenance).toHaveLength(1)
    const row = provenance[0]!
    assert.ok(row.kind === 'authored_exact_week')
    expect(anchors[0]).toEqual({ personId: talent.id, profession: talent.role, kind: 'entrant', recordedWeek: row.entryWeek })
    expect(talent.age).toBe(Math.floor(row.ageAtEntry + (after.market.tick - row.entryWeek) / 52))
    const cohort = after.careerLifecycle.cohorts.find(receipt => receipt.personIds.includes(talent.id))
    const employment = after.hollywood!.employment.filter(e => e.terms.talentId === talent.id)
    let category: string
    if (cohort) {
      expect(cohort.week).toBe(after.market.tick); expect(row.entryWeek).toBe(cohort.week)
      category = 'cohort'
    } else {
      expect(employment).toHaveLength(1)
      const job = employment[0]!
      expect(row.entryWeek).toBe(job.terms.startWeek)
      const receipts = after.hollywood!.receipts.filter(receipt => receipt.kind === 'employment'
        && receipt.contractId === job.contractId && receipt.toStudioId === job.studioId)
      expect(receipts).toHaveLength(1)
      expect(receipts[0]!.week).toBe(row.entryWeek)
      if (job.reason === 'entry') {
        expect(row.entryWeek).toBe(after.market.tick)
        expect(after.hollywood!.receipts.some(receipt => receipt.kind === 'studioEntered'
          && receipt.studioId === job.studioId && receipt.week === row.entryWeek)).toBe(true)
        category = 'scheduled-entry'
      } else {
        expect(row.entryWeek).toBe(before.market.tick)
        category = talent.role === 'scientist' ? 'scientist-staff' : 'ordinary-staff'
      }
    }
    appends.push({ personId: talent.id, role: talent.role, category, entryWeek: row.entryWeek,
      arrivedWeek: after.market.tick, employment: employment.map(job => job.contractId) })
  }
  if (added.length > 0) acceptedEvidence(after)
  // Scheduled employers may also reuse people. Retain those actual receipts,
  // independently of new-person appends, without taking an inspection-only tick.
  for (const studio of after.hollywood!.identities.filter(row => row.enteredWeek === after.market.tick)) {
    const jobs = after.hollywood!.employment.filter(row => row.studioId === studio.studioId && row.reason === 'entry')
    appends.push({ category: 'scheduled-company', row: studio.row, studioId: studio.studioId,
      week: studio.enteredWeek, minted: jobs.filter(job => added.some(talent => talent.id === job.terms.talentId)).length,
      reused: jobs.filter(job => before.talent.some(talent => talent.id === job.terms.talentId)).length })
  }
  const priorContracts = new Set(before.hollywood!.employment.map(row => row.contractId))
  for (const job of after.hollywood!.employment.filter(row => !priorContracts.has(row.contractId)
    && row.reason !== 'entry' && before.talent.some(talent => talent.id === row.terms.talentId))) {
    const receipts = after.hollywood!.receipts.filter(row => row.kind === 'employment'
      && row.contractId === job.contractId && row.toStudioId === job.studioId)
    expect(receipts).toHaveLength(1)
    expect(receipts[0]).toMatchObject({ talentId: job.terms.talentId, studioId: job.studioId,
      week: job.terms.startWeek, reason: job.reason })
    expect([before.market.tick, after.market.tick]).toContain(job.terms.startWeek)
    const sourcePhase = job.terms.startWeek === before.market.tick ? 'staff-at-source-week' : 'market-at-arrived-week'
    if (job.terms.startWeek === after.market.tick) {
      expect(after.talentMarket.receipts.some(row => row.kind === 'settled' && row.week === job.terms.startWeek
        && row.talentId === job.terms.talentId && row.studioId === job.studioId)).toBe(true)
    }
    const role = person(before, job.terms.talentId).role
    appends.push({ category: role === 'scientist' ? 'scientist-reuse' : 'ordinary-reuse',
      personId: job.terms.talentId, role, contractId: job.contractId, studioId: job.studioId,
      reason: job.reason, sourcePhase, startWeek: job.terms.startWeek, receiptId: receipts[0]!.eventId })
  }
}
function step(group: 'K' | 'L', state: GameState): GameState {
  assert.ok(calls[group] < (group === 'K' ? 832 : 156), `${group} fixed actual-call cap`)
  assert.ok(calls.K + calls.L < 988 && state.market.tick === calls.K + calls.L, 'one monotone zero-origin route')
  calls[group]++ // Reserve even if the actual tick throws; never retry it.
  currentSourceWeek = state.market.tick
  const after = tick(state, { develop: true })
  lastWeek = after.market.tick
  expect(after.market.tick).toBe(state.market.tick + 1)
  observeAppend(state, after)
  const lifecycle = subjectLifecycle(after), oldLifecycle = subjectLifecycle(state)
  const lifeChanged = stableStringify(lifecycle) !== stableStringify(oldLifecycle)
  const wasBusy = busyTalentIds(state).has(id), busy = busyTalentIds(after).has(id)
  if (lifeChanged || wasBusy && !busy && oldLifecycle.records.some(row => row.status === 'finishing_commitments'))
    boundary(after, `lifecycle-or-clearance-${after.market.tick}`)
  const jobs = canonicalEmployment(after), oldJobs = canonicalEmployment(state)
  const changedJobs = jobs.filter(row => stableStringify(row) !== stableStringify(oldJobs.find(old => old.contractId === row.contractId)))
  const oldCases = state.talentMarket.cases.filter(row => row.talentId === id)
  const cases = after.talentMarket.cases.filter(row => row.talentId === id)
  weekly.push({ week: after.market.tick, role: person(after, id).role, age: person(after, id).age,
    activeEmployers: activeEmployment(after).map(row => row.studioId), busy,
    employmentChanges: changedJobs, receipts: after.hollywood!.receipts.slice(state.hollywood!.receipts.length)
      .filter(row => row.kind === 'employment' && row.talentId === id),
    takes: after.firstTakes.slice(state.firstTakes.length).filter(row => Object.values(row.cast).includes(id))
      .map(row => ({ eventId: row.eventId, week: row.week, studioId: row.studioId, productionId: row.productionId })),
    films: after.hollywood!.films.slice(state.hollywood!.films.length).filter(row => row.credits.some(credit => credit.talentId === id))
      .map(row => ({ filmId: row.filmId, studioId: row.studioId, releaseWeek: row.provenance === 'simulation/v1' ? row.result.releaseTick : null })),
    ...(lifeChanged ? { lifecycle } : {}), ...(stableStringify(cases) !== stableStringify(oldCases) ? { cases } : {}) })
  if (group === 'L') for (const business of after.hollywood!.businesses) {
    for (const project of business.development.projects.filter(row => row.writerId === id)) {
      if (!projects.has(project.conceptId)) {
        acceptedEvidence(after)
        projects.set(project.conceptId, { studioId: business.studioId, first: clone(project), state: clone(after) })
      }
      const production = business.productions.find(row => row.id === project.productionId)
      if (production && !productions.has(production.id)) {
        acceptedEvidence(after)
        productions.set(production.id, { studioId: business.studioId, state: clone(after) })
      }
    }
  }
  return after
}

export function canonicalInitial(): GameState {
  return memo('initial', () => {
    const raw = readFileSync('docs/engineering/playability-launch-review/evidence/p14b4-20260919/1035-c3-stage-c-zero-tick-inventory.json', 'utf8')
    expect(sha(raw)).toBe('867c021119470d2b9f1fd0eb369a1b4b430c3e562efc8f0cfc85c493945ca7d3')
    const inventory = JSON.parse(raw)
    expect(inventory).toMatchObject({ counts: { immutableCompleted: 2, generatedCompleted: 128, ticks: 0,
      furtherActions: 0, generatedCandidates: 2 }, continuationExecuted: false, fundingAdded: 0,
    firstCandidate: { seed: CANONICAL_SEED, seedOrdinal: 98, studioManifestRow: 1, actorCreditSlotOrdinal: 2, personId: id } })
    expect(inventory.fixedSeedRule).toBe('p14c3-canonical-stage-c-000 through p14c3-canonical-stage-c-127 inclusive; no retries or early exit')
    // Existing harness initialization: generated world, economyEngagedEver true,
    // public activateStudioOperations, initializeHollywood(fresh). Nothing added.
    const state = p13aGeneratedStudio(CANONICAL_SEED)
    acceptedEvidence(state)
    // 1327-C (C3): the live save version moved past V38 (b71d4599's own pin era),
    // so the digest of unchanged week-0 content moves with it even though nothing
    // about this world changed. CANONICAL_INITIAL_SHA stays pinned to its original
    // Save38 era; the live envelope is instead down-projected to V38 through the
    // real production converters (never a literal), and that down-projection's
    // export is what is compared with the unchanged constant. Measured directly
    // (1327-measure/c3-down-projection.json): live v42 sha a7d0034f… (moved, not
    // pinned here), v38 down-projection sha 2f9ec0fa… (equals CANONICAL_INITIAL_SHA).
    const live = makeSave(state)
    expect(live.saveVersion).toBe(LIVE_SAVE_VERSION)
    const v38 = convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42ToV41(convertV43ToV42(convertV44ToV43(live))))))
    expect(sha(exportSave(v38))).toBe(CANONICAL_INITIAL_SHA)
    expect(state.market.tick).toBe(0)
    expect(person(state, id)).toMatchObject({ name: 'Clara Moss', role: 'actor', age: 62 })
    expect(state.talentProvenance.rows.find(row => row.personId === id)).toEqual({ personId: id,
      kind: 'authored_exact_week', entryWeek: 0, ageAtEntry: 62.338332370039836 })
    expect(state.careerLifecycle.professionAnchors.filter(row => row.personId === id))
      .toEqual([{ personId: id, profession: 'actor', recordedWeek: 0, kind: 'entrant' }])
    expect(subjectLifecycle(state)).toEqual({ records: [], due: [], evaluations: [], changes: [], finality: [] })
    expect(state.firstTakes.filter(row => Object.values(row.cast).includes(id))).toEqual([])
    for (const [discipline, ovr, capable] of [['writing', 65, true], ['directing', 1, false]] as const) {
      expect(careerIdentity(person(state, id)).disciplines.find(row => row.discipline === discipline))
        .toMatchObject({ ovr, capable, proven: false, workHistory: 0 })
      expect(expectedPotentialTier(person(state, id), discipline, state.seed)).toBe('Promising')
      expect(roleTier(ovr)).toBe(discipline === 'writing' ? 'Limited-or-developing' : 'Highly unproven')
    }
    expect(canonicalEmployment(state)).toEqual([expect.objectContaining({
      contractId: `${CANONICAL_STUDIO}:contract:${id}:0`, studioId: CANONICAL_STUDIO,
      reason: 'entry', endedWeek: null, terms: expect.objectContaining({ talentId: id, startWeek: 0, endWeekExclusive: 208, termWeeks: 208 }) })])
    expect(state.hollywood!.identities.find(row => row.studioId === CANONICAL_STUDIO))
      .toMatchObject({ row: 1, name: 'Bellwether Pictures', enteredWeek: 0 })
    boundary(state, 'initial')
    return state
  })
}

export type CanonicalOwnerObservation = { before: GameState; after: GameState; keys: readonly RetirementKey[] }
export function canonicalChosen() {
  return memo('chosen', () => {
    const initial = canonicalInitial()
    let state = clone(initial)
    const observations: CanonicalOwnerObservation[] = []
    const original = owner.advanceProfessionTransitions
    const spy = vi.spyOn(owner, 'advanceProfessionTransitions').mockImplementation((input, keys) => {
      const relevant = keys.some(key => key.personId === id) || input.careerLifecycle.transitionDue.some(row => row.personId === id && row.week === input.market.tick)
      const before = relevant ? clone(input) : undefined, supplied = relevant ? clone(keys) : undefined
      const result = original(input, keys)
      if (relevant) {
        expect(input).toEqual(before); expect(keys).toEqual(supplied)
        if (result.careerLifecycle.professionChanges.some(row => row.personId === id)) {
          assert.ok(before && supplied)
          expect(observations, 'one actual focus choice owner invocation').toEqual([])
          observations.push({ before, after: clone(result), keys: supplied })
        }
      }
      return result
    })
    try {
      while (calls.K < 832) {
        state = step('K', state)
        const change = state.careerLifecycle.professionChanges.find(row => row.personId === id)
        if (change) {
          expect(change.to, 'canonical098 must genuinely choose Writer').toBe('writer')
          expect(observations, 'actual chosen owner call must be intercepted').toHaveLength(1)
          chosenWeek = state.market.tick
          boundary(state, 'chosen')
          const loaded = reopenEvidence(state)
          return { initial, state, loaded, observed: observations[0]!, milestones: clone(boundaries) }
        }
        const finality = state.careerLifecycle.industryRetirements.find(row => row.personId === id)
        assert.ok(!finality, `K positive premise ended: ${JSON.stringify(finality)}`)
      }
      throw new Error('K chosen Writer premise absent after832 actual normal ticks; no alternate seed or rescue')
    } finally { spy.mockRestore() }
  })
}
function withAcceptance<T>(build: () => T): T {
  const original = scripts.acceptScriptProject
  const spy = vi.spyOn(scripts, 'acceptScriptProject').mockImplementation((development, projectId) => {
    const project = development.projects.find(row => row.id === projectId)
    const before = project?.writerId === id ? clone(project) : undefined
    const originalBytes = before ? stableStringify(development) : undefined
    const result = original(development, projectId)
    if (before) {
      expect(stableStringify(development)).toBe(originalBytes)
      const after = result.projects.find(row => row.id === projectId)
      assert.ok(after)
      expect(before.status).toBe('review'); expect(after.status).toBe('ready')
      expect(before.assessment).not.toBeNull()
      expect(after).toEqual({ ...before, status: 'ready' })
      accepts.push({ sourceWeek: currentSourceWeek, before, after: clone(after) })
    }
    return result
  })
  try { return build() } finally { spy.mockRestore() }
}
function pendingWriterWork(state: GameState): boolean {
  return state.hollywood!.businesses.some(business => business.development.projects.some(project => project.writerId === id
    && project.status !== 'produced') || business.productions.some(production => production.writerId === id))
}
function refuseTerminalWithoutWork(state: GameState): void {
  const finality = state.careerLifecycle.industryRetirements.find(row => row.personId === id)
  assert.ok(!finality || pendingWriterWork(state), `L passive work premise ended without an obligation: ${JSON.stringify(finality)}`)
}
export function canonicalHired() {
  return memo('hired', () => {
    const choice = canonicalChosen()
    return withAcceptance(() => {
      let state = clone(choice.loaded)
      expect(activeEmployment(state)).toEqual([])
      while (calls.L < 156) {
        state = step('L', state)
        const jobs = canonicalEmployment(state).filter(row => row.terms.startWeek >= choice.state.market.tick)
        if (jobs.length > 0) {
          expect(jobs).toHaveLength(1)
          const employment = jobs[0]!
          expect(employment.studioId).not.toBe(state.hollywood!.playerStudioId)
          expect(person(state, id).role).toBe('writer')
          expect(activeEmployment(state)).toEqual([employment])
          hiredWeek = employment.terms.startWeek
          boundary(state, 'new-writer-hire')
          return { state, employment, choiceWeek: choice.state.market.tick }
        }
        refuseTerminalWithoutWork(state)
      }
      throw new Error('L passive Writer hire premise absent after156 actual calls; no vacancy intervention')
    })
  })
}
export function canonicalReleased() {
  return memo('released', () => {
    // Complete K before installing L's acceptance observer; nested spies would
    // obscure the exact real call and its restoration.
    const hire = canonicalHired()
    return withAcceptance(() => {
      let state = clone(hire.state)
      const found = (): LiveIndustryFilm | undefined => state.hollywood!.films.find((film): film is LiveIndustryFilm =>
        film.provenance === 'simulation/v1' && film.result.releaseTick >= hire.choiceWeek
        && film.credits.some(credit => credit.talentId === id && credit.role === 'writer'))
      while (!found() && calls.L < 156) {
        refuseTerminalWithoutWork(state)
        state = step('L', state)
      }
      const film = found()
      assert.ok(film, 'L actual rival Writer film release absent at the shared156-call cap')
      releasedWeek = film.result.releaseTick
      boundary(state, 'writer-release')
      const project = projects.get(film.conceptId), production = productions.get(film.filmId)
      assert.ok(project && production, 'actual commissioned and in-production states must be observed')
      const acceptance = accepts.filter(row => row.before.conceptId === film.conceptId)
      expect(acceptance).toHaveLength(1)
      return { state, loaded: reopenEvidence(state), film, hire, project, production, acceptance: acceptance[0]! }
    })
  })
}
export function recordCanonicalRoute(): void {
  console.info(JSON.stringify({ phase: '1061-canonical098-passive-route', calls, total: calls.K + calls.L,
    cap: 988, lastWeek, chosenWeek, hiredWeek, releasedWeek,
    boundaries: boundaries.map(row => ({ label: row.label, week: row.state.market.tick })),
    appends, weekly, pendingCategories: ['ordinary-staff', 'scientist-staff', 'ordinary-reuse', 'scientist-reuse', 'scheduled-entry', 'cohort']
      .filter(category => !appends.some(row => 'category' in row && row.category === category)),
    row5Reached: lastWeek >= 520, failedCaches: [...cache.entries()].filter(([, row]) => !row.ok).map(([key]) => key) }))
}
