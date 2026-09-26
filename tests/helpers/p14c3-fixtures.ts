// 963/967 independent Stage A fixtures. Core-only .js graph; no bridge imports.
// Genuine historical bytes are immutable. Future shape views follow946; no
// future module/export is imported before it exists and no receipt is invented.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import * as core from '../../src/core/index.js'
import * as save from '../../src/core/save.js'
import { tick } from '../../src/core/tick.js'
import { applyActions } from '../../src/core/actions.js'
import { careerIdentity, expectedPotentialTier, roleTier } from '../../src/core/talentSummary.js'
import type { Action, CreativeRole, GameState } from '../../src/core/types.js'
import type { SaveFileV37 } from '../../src/core/save.js'

export type Target = 'director' | 'writer'
export type RoleTier = 'Highly unproven' | 'Raw prospect' | 'Limited-or-developing' | 'Strong' | 'Major-studio' | 'Elite' | 'Generational'
export type PotentialTier = 'Limited' | 'Steady' | 'Promising' | 'High Upside' | 'Exceptional Upside' | 'Generational Upside'
export type RetirementKey = { personId: string; profession: CreativeRole }
export type PictureRef = { studioId: string; pictureId: string }
export type TargetInput = { profession: Target; capability: number; roleTier: RoleTier; workHistory: number;
  proven: boolean; potentialTier: PotentialTier; contextCount: number; contextBand: 0 | 1 | 2;
  contextWitness: { counterpartId: string | null; pictures: PictureRef[] } }
export type Inputs = { age: number; actingFirstTakes: number; leadFirstTakes: number; actingWitnesses: string[];
  targets: [TargetInput, TargetInput] }
export type Choice = { outcome: 'deferred' | 'chosen' | 'declinedAll' | 'ageBoundary'; selected: Target | null;
  reason: 'noEligibleTarget' | 'onlyEligibleTarget' | 'strongerPublicTuple' | 'equalPublicTuples' | 'waitingAgeReached' }
export type Evaluation = Choice & { id: string; ordinal: number; week: number; personId: string;
  source: RetirementKey; rulesVersion: 1; inputs: Inputs; inputsDigest: string }
export type Change = { id: string; ordinal: number; week: number; personId: string; from: 'actor'; to: Target; evaluationId: string }
export type Finality = { personId: string; week: number; profession: CreativeRole; source: RetirementKey;
  cause: 'noCatalogue' | 'declinedAll' | 'ageBoundary'; evaluationId: string | null }
export type Root38 = Pick<GameState['careerLifecycle'], 'boundaryWeek' | 'records' | 'cohorts'> & {
  transitionBoundaryWeek: number;
  professionAnchors: { personId: string; profession: CreativeRole; recordedWeek: number; kind: 'existing' | 'entrant' }[];
  transitionEvaluations: Evaluation[]; professionChanges: Change[]; industryRetirements: Finality[];
  transitionDue: { personId: string; week: number }[];
}
export type State38 = Omit<GameState, 'careerLifecycle'> & { careerLifecycle: Root38 }
export type Save38 = { saveVersion: 38; seed: string; state: State38; broadcastCache: GameState['broadcastItems'] }
type PublicAPI = {
  professionAtWeek: (state: GameState, personId: string, week: number) => CreativeRole;
  transitionInputsFor: (state: GameState, personId: string, week: number) => Inputs;
  chooseProfessionTransition: (inputs: Inputs) => Choice;
  advanceProfessionTransitions: (state: GameState, newlyRetiredKeys: readonly RetirementKey[]) => GameState;
}
export function api<K extends keyof PublicAPI>(name: K): PublicAPI[K] {
  const fn = (core as unknown as Partial<PublicAPI>)[name]
  expect(typeof fn, `946 public core export ${name}`).toBe('function')
  assert.ok(fn)
  return fn
}
type SaveAPI = { validateSaveV38: (input: unknown) => Save38;
  convertV37ToV38: (input: SaveFileV37) => Save38; convertV38ToV37: (input: Save38) => SaveFileV37;
  migrateToV38: (input: unknown) => Save38 }
export function saveApi<K extends keyof SaveAPI>(name: K): SaveAPI[K] {
  const fn = (save as unknown as Partial<SaveAPI>)[name]
  expect(typeof fn, `946 versioned save export ${name}`).toBe('function')
  assert.ok(fn)
  return fn
}
export const FUTURE_ROOT_KEYS = ['transitionBoundaryWeek', 'professionAnchors', 'transitionEvaluations',
  'professionChanges', 'industryRetirements', 'transitionDue'] as const
export const FOCUS = { director: 'authored-0000', writer: 'authored-0001' } as const
export const PRE207 = 'genuine-v37-c3-preretirement-week207.json.gz'
export const CONTINUOUS208 = 'genuine-v37-c3-retired-week208.json.gz'
export const RUNTIME208 = 'genuine-v37-c3-runtime-current208.json.gz'
export const DEFERRED_ACTOR = 'person-cohort-468-actor-0' // actual941:64, retired2433, writing67, zero takes
export const SCIENTIST = 't-sci-00'
export const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
export const bytes = (state: GameState) => save.exportSave(save.makeSave(state))
export const clone = <T>(value: T): T => structuredClone(value)
export const compareText = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
const C3_DIR = 'tests/fixtures/p14/genuine-v37-c3-corpus'
type ArtifactRow = { filename: string; compressedSha256: string; uncompressedSha256: string }
function readRecorded(directory: string, filename: string, list: 'artifacts' | 'fixtures' = 'artifacts'): string {
  const manifest = JSON.parse(readFileSync(`${directory}/MANIFEST.json`, 'utf8')) as Record<string, unknown>
  const row = (manifest[list] as ArtifactRow[]).find(item => item.filename === filename)
  assert.ok(row, `historical manifest names ${filename}`)
  const compressed = readFileSync(`${directory}/${filename}`), raw = gunzipSync(compressed).toString('utf8')
  expect(sha(compressed)).toBe(row.compressedSha256)
  expect(sha(raw)).toBe(row.uncompressedSha256)
  return raw
}
export function c3Raw(filename: string = PRE207): string {
  const manifest = JSON.parse(readFileSync(`${C3_DIR}/MANIFEST.json`, 'utf8'))
  expect(manifest).toMatchObject({ sourceSha: '1f44aa505c0d677430451ab5fcacaf5e0ce205d6',
    producerSha256: 'aba3b5c101a1982e2994ce69de0e78633a16d499ebe6cb26bdcc31875235bb4c',
    saveVersion: 37, projectionVersion: 52, knownParityDefect: { status: 'FAIL' } })
  return readRecorded(C3_DIR, filename)
}
export function historical37(filename: string = PRE207): SaveFileV37 {
  return save.validateSaveV37(JSON.parse(c3Raw(filename)))
}
export function migrated(filename: string = PRE207): GameState {
  // No future-root assertion here: tick tests must reach actual absent role-change
  // behavior on the old implementation, not all stop at a version/API guard.
  return save.migrateToLive(save.importSave(c3Raw(filename))).state
}
export function scientistRaw(): string {
  return readRecorded('tests/fixtures/p14/genuine-projection51-runtime-c2rm', 'genuine-v37-scientist-week670.json.gz')
}
export function scientistBoundary(): GameState { return save.migrateToLive(save.importSave(scientistRaw())).state }
export function deferredBoundary(): GameState {
  const raw = readRecorded('tests/fixtures/p14/genuine-v35-c2b-corpus', 'genuine-v35-c2b-rival-incumbent-cohorts.json.gz', 'fixtures')
  expect(sha(raw)).toBe('8b4c1934222bc28da2bd4517b3967350cc01e2517cb18044246a3a65323f2fa8')
  const imported = save.importSave(raw)
  expect(imported.saveVersion).toBe(35)
  const state = save.migrateToLive(imported).state
  expect(state.market.tick).toBe(2600)
  expect(state.talent.find(person => person.id === DEFERRED_ACTOR)).toMatchObject({ role: 'actor', age: 64 })
  expect(state.careerLifecycle.records.find(row => row.personId === DEFERRED_ACTOR))
    .toMatchObject({ profession: 'actor', status: 'retired', retiredWeek: 2433 })
  expect(state.firstTakes.filter(take => Object.values(take.cast).includes(DEFERRED_ACTOR))).toEqual([])
  return state
}
export function root38(state: GameState): Root38 {
  const root = state.careerLifecycle as Root38
  expect(Object.keys(root).sort(), '946 exact current lifecycle root')
    .toEqual(['boundaryWeek', 'records', 'cohorts', ...FUTURE_ROOT_KEYS].sort())
  return root
}
export function envelope38(state: GameState): Save38 {
  const result = save.makeSave(state)
  expect(result.saveVersion, 'existing live writer moves coherently to38').toBe(38)
  root38(result.state)
  return result as unknown as Save38
}
export function person(state: GameState, id: string) {
  const result = state.talent.find(row => row.id === id)
  assert.ok(result, `actual person ${id}`)
  return result
}
export function expectFocusChosen(state: GameState, week: number): Root38 {
  expect(state.market.tick).toBe(week)
  for (const [target, id] of Object.entries(FOCUS)) {
    expect(person(state, id).role, `actual retirement must activate ${target}, not merely expose a new API`).toBe(target)
  }
  const root = root38(state)
  for (const [target, id] of Object.entries(FOCUS)) {
    const evaluations = root.transitionEvaluations.filter(row => row.personId === id)
    const changes = root.professionChanges.filter(row => row.personId === id)
    expect(evaluations).toHaveLength(1); expect(changes).toHaveLength(1)
    expect(evaluations[0]).toMatchObject({ personId: id, week, source: { personId: id, profession: 'actor' },
      rulesVersion: 1, outcome: 'chosen', selected: target, reason: 'onlyEligibleTarget' })
    expect(changes[0]).toMatchObject({ personId: id, week, from: 'actor', to: target, evaluationId: evaluations[0]!.id })
    expect(root.transitionDue.some(row => row.personId === id)).toBe(false)
    expect(root.industryRetirements.some(row => row.personId === id)).toBe(false)
    expect(state.freeAgents.filter(member => member === id)).toHaveLength(1)
  }
  return root
}
const chosenCache = new Map<string, GameState>()
export function chosen(filename: string = PRE207): GameState {
  if (!chosenCache.has(filename)) {
    const before = migrated(filename), after = tick(before, { develop: true })
    expectFocusChosen(after, before.market.tick + 1)
    envelope38(after)
    chosenCache.set(filename, after)
  }
  return clone(chosenCache.get(filename)!)
}

/** Independent expectation for the two genuine953 subjects. Assert the bounded
 * fixture premises explicitly; Stage B owns the general cross-source algorithm. */
export function expectedFocusInputs(state: GameState, id: string): Inputs {
  const subject = person(state, id), owner = state.hollywood!.playerStudioId
  const takes = state.firstTakes.filter(take => take.week <= state.market.tick && Object.values(take.cast).includes(id))
    .sort((a, b) => a.week - b.week || compareText(a.studioId, b.studioId)
      || compareText(a.productionId, b.productionId) || compareText(a.eventId, b.eventId))
  expect(takes).toHaveLength(3)
  expect(new Set(takes.map(take => JSON.stringify([take.studioId, take.productionId]))).size).toBe(3)
  expect(takes.every(take => take.studioId === owner)).toBe(true)
  const films = state.studio.releasedFilms.filter(film => film.releaseTick <= state.market.tick && film.participants
    && Object.values(film.participants.cast).some(credit => credit.talentId === id))
  expect(films).toHaveLength(3)
  expect(new Set(films.map(film => film.participants!.writer.talentId))).toEqual(new Set(['authored-0003']))
  expect((state.hollywood?.films ?? []).some(film => film.credits.some(credit => credit.talentId === id))).toBe(false)
  const leads = takes.filter(take => take.cast.lead === id)
  expect(leads).toHaveLength(id === FOCUS.director ? 3 : 0)
  if (leads.length > 0) expect(new Set(leads.map(take => take.directorId))).toEqual(new Set(['authored-0002']))
  const target = (profession: Target): TargetInput => {
    const discipline = profession === 'director' ? 'directing' : 'writing'
    const standing = careerIdentity(subject).disciplines.find(row => row.discipline === discipline)!
    const pictures = (profession === 'director' ? leads.map(take => ({ studioId: take.studioId, pictureId: take.productionId }))
      : films.map(film => ({ studioId: owner, pictureId: film.productionId })))
      .sort((a, b) => compareText(a.studioId, b.studioId) || compareText(a.pictureId, b.pictureId))
    return { profession, capability: standing.ovr, roleTier: roleTier(standing.ovr) as RoleTier,
      workHistory: standing.workHistory, proven: standing.proven,
      potentialTier: expectedPotentialTier(subject, discipline, state.seed) as PotentialTier,
      contextCount: pictures.length, contextBand: Math.min(2, pictures.length) as 0 | 1 | 2,
      contextWitness: { counterpartId: pictures.length === 0 ? null : profession === 'director' ? 'authored-0002' : 'authored-0003',
        pictures: pictures.slice(0, 2) } }
  }
  return { age: subject.age, actingFirstTakes: takes.length, leadFirstTakes: leads.length,
    actingWitnesses: takes.slice(0, 3).map(take => take.eventId), targets: [target('director'), target('writer')] }
}

/** Pure chooser units only: these synthetic inputs never enter a world/save. */
export function syntheticTarget(profession: Target, patch: Partial<TargetInput> = {}): TargetInput {
  const capability = patch.capability ?? 80, workHistory = patch.workHistory ?? 0, contextCount = patch.contextCount ?? 2
  return { profession, capability, roleTier: roleTier(capability) as RoleTier, workHistory,
    proven: capability >= 60 && workHistory > 0, potentialTier: 'Steady', contextCount,
    contextBand: Math.min(2, contextCount) as 0 | 1 | 2,
    contextWitness: { counterpartId: contextCount === 0 ? null : `synthetic-${profession}-counterpart`,
      pictures: Array.from({ length: Math.min(contextCount, 2) }, (_, i) => ({ studioId: 'synthetic-studio', pictureId: `picture-${i}` })) },
    ...patch }
}
export function syntheticInputs(director: Partial<TargetInput> = {}, writer: Partial<TargetInput> = { capability: 20 },
  patch: Partial<Omit<Inputs, 'targets'>> = {}): Inputs {
  const count = patch.actingFirstTakes ?? 3
  return { age: 72, actingFirstTakes: count, leadFirstTakes: count,
    actingWitnesses: Array.from({ length: Math.min(count, 3) }, (_, i) => `synthetic-take-${i}`),
    targets: [syntheticTarget('director', director), syntheticTarget('writer', writer)], ...patch }
}

type ObligationControls = { laterProduction: GameState; laterProductionId: string;
  originalDraft: GameState; draftId: string; pool: GameState; poolId: string;
  creditedWriter: GameState; creditedProductionId: string; rewrite: GameState; rewriteId: string }
type ObligationScope = 'production' | 'draft' | 'pool' | 'rewrite' | 'past'
const obligationCache = new Map<ObligationScope, Partial<ObligationControls>>()
/** 979 bounded real public work only. Any false premise fails before a validator
 * assertion; neither a date nor an employment/project receipt is injected. */
export function obligationControls(scope: ObligationScope): Partial<ObligationControls> {
  const cached = obligationCache.get(scope)
  if (cached !== undefined) return clone(cached)
  const done = (value: Partial<ObligationControls>) => { obligationCache.set(scope, value); return clone(value) }
  const act = (state: GameState, action: Action) => applyActions(state, [action])
  const sign = (state: GameState, id: string) => act(state, { kind: 'signContract', talentId: id, termWeeks: 52 })
  function add(state: GameState, role: 'actor' | 'director' | 'writer' | 'craft', label: string) {
    const created = act(state, { kind: 'createTalent', talent: { name: label, role, age: 30,
      actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } })
    expect(created.talent.length).toBe(state.talent.length + 1)
    const id = created.talent.at(-1)!.id
    return { state: sign(created, id), id }
  }
  function team(input: GameState, directorId?: string) {
    let state = input
    const castIds: string[] = []
    for (const slot of ['lead', 'antagonist', 'support']) {
      const made = add(state, 'actor', `979 ${slot}`); state = made.state; castIds.push(made.id)
    }
    const craft = add(state, 'craft', '979 craft'); state = craft.state
    if (directorId === undefined) { const director = add(state, 'director', '979 director'); state = director.state; directorId = director.id }
    return { state, directorId, craftIds: [craft.id], cast: { lead: castIds[0]!, antagonist: castIds[1]!, support: castIds[2]! } }
  }
  const unused = (state: GameState) => {
    const concept = state.concepts.find(row => !state.studio.activeProductions.some(film => film.conceptId === row.id)
      && !state.studio.releasedFilms.some(film => film.conceptId === row.id)
      && !state.scriptDevelopment.projects.some(project => project.conceptId === row.id))
    assert.ok(concept, 'real unused concept')
    return concept
  }
  const original = (writerId: string): Action => ({ kind: 'commissionOriginalScreenplay', screenplay: {
    writerId, genre: 'crime', shape: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
    promise: { genre: 'crime', intendedSegments: ['adult'], ranges: { intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] } },
  } })

  // Real post-change work: both new primary professions are hired normally.
  let later = sign(sign(chosen(), FOCUS.director), FOCUS.writer)
  const cast = team(later, FOCUS.director); later = cast.state
  const concept = unused(later)
  later = act(later, { kind: 'greenlight', production: { conceptId: concept.id,
    writerId: FOCUS.writer, directorId: cast.directorId, cast: cast.cast, craftIds: cast.craftIds,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    budget: { negative: concept.baseNegativeCost, marketing: 0 } } })
  const laterProduction = later.studio.activeProductions.at(-1)!
  expect(laterProduction).toMatchObject({ startTick: 208, directorId: FOCUS.director, writerId: FOCUS.writer })
  envelope38(later)
  const prepared: Partial<ObligationControls> = { laterProduction: later, laterProductionId: laterProduction.id }
  if (scope === 'production') return done(prepared)

  let draft = sign(chosen(), FOCUS.writer)
  draft = act(draft, { kind: 'activateScriptDevelopment' }); draft = act(draft, original(FOCUS.writer))
  const draftProject = draft.scriptDevelopment.projects.at(-1)!
  expect(draftProject).toMatchObject({ commissionedWeek: 208, status: 'drafting', writerId: FOCUS.writer })
  envelope38(draft)
  Object.assign(prepared, { originalDraft: draft, draftId: draftProject.id })
  if (scope === 'draft') return done(prepared)

  // A different writer actually starts a long original draft at207. The changed
  // actor joins only after208, so commissionedWeek cannot date their pool entry.
  let pool = migrated()
  const young = add(pool, 'writer', '979 original pool writer'); pool = young.state
  pool = act(pool, { kind: 'activateScriptDevelopment' }); pool = act(pool, original(young.id))
  const poolId = pool.scriptDevelopment.projects.at(-1)!.id
  expect(pool.scriptDevelopment.projects.at(-1)!.dueWeek).toBeGreaterThan(208)
  pool = tick(pool, { develop: true }); expectFocusChosen(pool, 208)
  pool = sign(pool, FOCUS.writer)
  pool = act(pool, { kind: 'assignScreenplayWriter', projectId: poolId, writerId: FOCUS.writer })
  expect(pool.scriptDevelopment.projects.find(row => row.id === poolId))
    .toMatchObject({ commissionedWeek: 207, status: 'drafting', writerId: young.id, writerIds: [young.id, FOCUS.writer] })
  envelope38(pool)
  Object.assign(prepared, { pool, poolId })
  if (scope === 'pool') return done(prepared)

  // A real one-week pool screenplay completes BEFORE the acting retirement.
  // The saved104 branch advances102 times to206, then one completion tick to207.
  let earlier = migrated('genuine-v37-c3-announced-week104.json.gz')
  for (let count = 0; earlier.market.tick < 206; count++) {
    assert.ok(count < 102, 'bounded104→206 continuation'); earlier = tick(earlier, { develop: true })
  }
  earlier = act(earlier, { kind: 'activateScriptDevelopment' })
  const oldConcept = unused(earlier)
  earlier = act(earlier, { kind: 'commissionScript', project: { conceptId: oldConcept.id, writerId: FOCUS.writer,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: oldConcept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } } } })
  const rewriteId = earlier.scriptDevelopment.projects.at(-1)!.id
  expect(earlier.scriptDevelopment.projects.at(-1)!).toMatchObject({ commissionedWeek: 206, dueWeek: 207, status: 'drafting' })
  earlier = tick(earlier, { develop: true })
  expect(earlier.scriptDevelopment.projects.find(row => row.id === rewriteId)?.status).toBe('review')
  expect(person(earlier, FOCUS.writer).role).toBe('actor')

  let rewrite = tick(earlier, { develop: true }); expectFocusChosen(rewrite, 208)
  rewrite = sign(rewrite, FOCUS.writer)
  rewrite = act(rewrite, { kind: 'requestScriptRewrite', projectId: rewriteId })
  expect(rewrite.scriptDevelopment.projects.find(row => row.id === rewriteId))
    .toMatchObject({ commissionedWeek: 206, status: 'rewriting', writerId: FOCUS.writer })
  envelope38(rewrite)
  Object.assign(prepared, { rewrite, rewriteId })
  if (scope === 'rewrite') return done(prepared)

  let credited = act(earlier, { kind: 'acceptScript', projectId: rewriteId })
  const otherTeam = team(credited); credited = otherTeam.state
  credited = act(credited, { kind: 'greenlightScriptProject', production: { projectId: rewriteId,
    directorId: otherTeam.directorId, craftIds: otherTeam.craftIds, cast: otherTeam.cast,
    budget: { negative: oldConcept.baseNegativeCost, marketing: 0 } } })
  const creditedProductionId = credited.studio.activeProductions.at(-1)!.id
  expect(credited.studio.activeProductions.at(-1)!).toMatchObject({ startTick: 207, writerId: FOCUS.writer })
  credited = tick(credited, { develop: true }); expectFocusChosen(credited, 208)
  const stillActive = credited.studio.activeProductions.find(row => row.id === creditedProductionId)
  assert.ok(stillActive, 'writer credit outlives retirement in an actual active production')
  expect(stillActive.writerId).toBe(FOCUS.writer)
  expect([stillActive.directorId, ...Object.values(stillActive.cast), ...stillActive.craftIds]).not.toContain(FOCUS.writer)
  envelope38(credited)

  return done({ laterProduction: later, laterProductionId: laterProduction.id,
    originalDraft: draft, draftId: draftProject.id, pool, poolId, creditedWriter: credited,
    creditedProductionId, rewrite, rewriteId })
}
