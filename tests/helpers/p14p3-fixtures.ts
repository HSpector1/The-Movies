// Independent 1121/1132/1142/1148/1154 P3 fixtures. Player208 + three64
// + lifecycle156 + separate rival260 = <=816 actual ticks. No rescue.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect, vi } from 'vitest'
import * as core from '../../src/core/index.js'
import * as promiseOwner from '../../src/core/promises.js'
import * as lifecycleOwner from '../../src/core/careerLifecycle.js'
import * as marketOwner from '../../src/core/talentMarket.js'
import * as packageOwner from '../../src/core/hollywoodPolicy.js'
import * as saves from '../../src/core/save.js'
import { activeContract, busyTalentIds } from '../../src/core/employment.js'
import type { Action, GameState, ProfessionalPromise, PromiseFeasibilityReceipt, FirstTakeReceipt,
  FilmShape, Promise as CreativePromise, CreativeRole } from '../../src/core/types.js'
import type { PromiseDraft, PromiseAttachment } from '../../src/core/promises.js'
import type { SaveFileV38 } from '../../src/core/save.js'

export const clone = <T>(value: T): T => structuredClone(value)
export const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
export const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
export const act = (state: GameState, action: Action): GameState => core.applyActions(state, [action])
export const person = (state: GameState, id: string) => {
  const found = state.talent.find(row => row.id === id); assert.ok(found, `actual person ${id}`); return found
}
export const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
export const STAGE = 'facility-soundstage-07'
export const WRITER = 'authored-0003'
export const CAST = { lead: 'authored-0000', antagonist: 'authored-0001', support: 'authored-0005' }
export const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }

// Narrow boundary shape, deliberately independent of a nonexistent new module.
// Only these public calls receive the forward predicate. All fixture state is
// produced by real actions; a cast here does not admit or invent any authority.
export type DirectorDraft = Omit<PromiseDraft, 'family' | 'predicate'> & {
  family: 'DIRECTING_COUNT'; predicate: { kind: 'directorCount'; count: number }
}
export type DirectorPromise = Omit<ProfessionalPromise, 'family' | 'predicate'> & {
  family: 'DIRECTING_COUNT'; predicate: { kind: 'directorCount'; count: number }
}
export const directorDraft = (state: GameState, id: string, count = 2): DirectorDraft => ({
  family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count },
  issuerStudioId: issuer(state), beneficiaryPersonId: id,
  startWeek: 52, termWeeks: 104, windowStartWeek: 52, dueWeekExclusive: 112,
})
export const quote = (state: GameState, draft: DirectorDraft | PromiseDraft): PromiseFeasibilityReceipt =>
  core.promiseFeasibility(state, draft as PromiseDraft, state.market.tick)
export const attach = (state: GameState, id: string, draft: DirectorDraft): GameState =>
  core.attachPromise(state, id, draft.issuerStudioId, draft as unknown as PromiseAttachment)
export const castDraft = (state: GameState, id: string, count = 1): PromiseDraft => ({
  ...directorDraft(state, id, count), family: 'APPEARANCE_COUNT', predicate: { count },
})
export function actualPromise(state: GameState, id: string): DirectorPromise {
  const row = state.promises.find(p => p.promiseId === id)
  assert.ok(row, 'actual retained promise')
  expect(row.family).toBe('DIRECTING_COUNT')
  expect(row.predicate).toEqual({ kind: 'directorCount', count: 2 })
  return row as unknown as DirectorPromise
}
export function admitted(state: GameState): void {
  const before = saves.stableStringify(state), save = saves.makeSave(state)
  // Current 38 setup is allowed during RED; D13/D14 own the new 39 assertion.
  expect(save.saveVersion).toBe(saves.LIVE_SAVE_VERSION)
  const raw = saves.exportSave(save)
  expect(saves.exportSave(saves.importSave(raw))).toBe(raw)
  expect(saves.stableStringify(state)).toBe(before)
}
export function reopen(state: GameState): GameState {
  const raw = bytes(state), next = saves.migrateToLive(saves.importSave(raw)).state
  expect(bytes(next)).toBe(raw); return next
}
export type FutureSaveAPI = {
  validateSaveV39: (input: unknown) => unknown
  convertV39ToV38: (input: unknown) => SaveFileV38
}
export function futureSave(): FutureSaveAPI {
  const candidate = core as unknown as Partial<FutureSaveAPI>
  assert.equal(typeof candidate.validateSaveV39, 'function', 'public index exposes the new strict reader')
  assert.equal(typeof candidate.convertV39ToV38, 'function', 'public index exposes the guarded reverse conversion')
  return candidate as FutureSaveAPI
}

const outgoingPins = {
  'bound-p2-lead-week52': ['7872b26db5909f787d7c58ab37600bbd4499eb0f54f646cb480d1655afeab922', 'b79730a445d85155ef54f9497cd851d77d23388dfeeb9686f6e8399f5984af25'],
  'kept-broken-week61': ['803ed4415cc6cc1b34749a595f3b52a2d5fd0376e965c15defc06be6022d44fc', 'a689ee51581ebbf6cf5534e4fb961b27d90b5a5204f279da2d279e15af91ead0'],
  'migrated-week207': ['5d9e980e616b4b51502a24c160ca8ac89d863b22710ed5fdf2b19c8ec7cf4119', '248070431a492773e1887946bffa7bdaf6be8cbc5fba8694a778df32b7b2c1a1'],
  'natural-week208': ['a7418eb0f90fa2d10ae65e78e3c3b9e75ec19346970c677c1cfdeefce42b2960', 'ebb00ca54328ef3340d959d830045d28c73dc493b8f069220256183e718fc4bb'],
  'before-waiver-week104': ['077eec0343307983266868aa8bb242375874f7738cbe06c94e5787baa7dc098e', '5defd3aeffea645c670beccfe5ca0edd3d75cde7ddec5ef26406ff7639e39648'],
  'after-waiver-week104': ['129b8d5d6993d97f9b5aa5929b2ab4a607c506c58b942cf7c4a38133fa113181', 'ac2c9ef66c0bc7cd43448cde7d0c9aabc6474730e750d8ed72becb862c08ce95'],
} as const
export type OutgoingName = keyof typeof outgoingPins
export const outgoingNames = Object.keys(outgoingPins) as OutgoingName[]
export function outgoing(name: OutgoingName): { raw: string; save: SaveFileV38 } {
  const base = new URL('../fixtures/p14/genuine-v38-pre-p3/', import.meta.url)
  const manifest = readFileSync(new URL('MANIFEST.json', base))
  expect(sha(manifest)).toBe('87db7cc4885f5e9a9464d8e2c3e586be84078550aebf1155a672fa2782a2c987')
  const zipped = readFileSync(new URL(`genuine-v38-p3-${name}.json.gz`, base))
  const raw = gunzipSync(zipped).toString('utf8'), [gzipPin, rawPin] = outgoingPins[name]
  expect(sha(zipped)).toBe(gzipPin); expect(sha(raw)).toBe(rawPin)
  const parsed: unknown = JSON.parse(raw), save = saves.validateSaveV38(parsed)
  expect(save).toBe(parsed); expect(saves.exportSave(save)).toBe(raw)
  return { raw, save }
}

type Cached<T> = { ok: true; value: T } | { ok: false; error: unknown }
const cache = new Map<string, Cached<unknown>>()
function memo<T>(name: string, build: () => T): T {
  const old = cache.get(name) as Cached<T> | undefined
  if (old) { if (!old.ok) throw old.error; return clone(old.value) }
  try { const value = build(); cache.set(name, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(name, { ok: false, error }); throw error }
}
let calls = 0
export function counters() { return { actualTicks: calls, cap: 208,
  cachedPhases: [...cache].map(([name, result]) => ({ name, completed: result.ok })) } }
function step(state: GameState): GameState {
  assert.ok(calls < 208 && state.market.tick < 208, 'one player route: <=208 reserved actual ticks / week208')
  calls++
  const next = core.tick(state, { develop: true })
  expect(next.market.tick).toBe(state.market.tick + 1); return next
}
function toWeek(state: GameState, week: number): GameState {
  assert.ok(week >= state.market.tick && week <= 208)
  while (state.market.tick < week) state = step(state)
  return state
}
export type Setup = { state: GameState; actorId: string; directorId: string; concepts: string[] }
function create(state: GameState, role: CreativeRole, age: number): { state: GameState; id: string } {
  const six = (value: number) => [value, value, value, value, value, value]
  const oldIds = new Set(state.talent.map(row => row.id))
  let next = act(state, { kind: 'createCustomTalent', talent: { name: `P3 ${role}`, role, age,
    actual: { warmth: 0, gravity: 0, physicality: 0.2 }, workEthic: 55, fame: 25,
    skills: { acting: six(80), directing: six(80), writing: six(20), craft: six(20), research: six(1) } } })
  const added = next.talent.filter(row => !oldIds.has(row.id)); expect(added).toHaveLength(1)
  const id = added[0]!.id
  expect(Object.values(person(next, id).workHistory).every(value => value === 0)).toBe(true)
  expect(next.careerLifecycle.professionAnchors.find(row => row.personId === id))
    .toEqual({ personId: id, profession: role, kind: 'entrant', recordedWeek: 0 })
  const offer = core.playerOffer(next, id, 52)
  expect(next.studio.cash).toBeGreaterThanOrEqual(offer.signingBonus)
  next = act(next, { kind: 'signContract', talentId: id, termWeeks: 52 })
  expect(activeContract(next, id)).toMatchObject({ startWeek: 0, endWeekExclusive: 52, termWeeks: 52 })
  return { state: next, id }
}
export function created(): Setup {
  return memo('created0', () => {
    const base = new URL('../fixtures/p14/genuine-v37-c3-corpus/', import.meta.url)
    expect(sha(readFileSync(new URL('MANIFEST.json', base))))
      .toBe('b3a3251ae7b3df96a1e2a615991744c5d1e5966a095424693f086a1581244294')
    const gzip = readFileSync(new URL('genuine-v37-c3-created-week0.json.gz', base))
    expect(sha(gzip)).toBe('0ce43de9abe897631f415f94ac79e584b87d6001c8bb4b5c37fccf3dcb8204a2')
    const raw = gunzipSync(gzip).toString('utf8')
    expect(sha(raw)).toBe('215b61730393abc8bc28b747d7d79bf9dcb65d2b03f17aa97b96880bc720fa23')
    const old = saves.validateSaveV37(JSON.parse(raw))
    let state = saves.migrateToLive(old).state
    expect(state.market.tick).toBe(0); expect(state.studio.cash).toBe(29_611_837)
    expect(state.studio.activeProductions).toEqual([]); expect(state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] })
    for (const id of [WRITER, 'authored-0002', 'authored-0004', ...Object.values(CAST)]) {
      expect(activeContract(state, id)).toMatchObject({ startWeek: 0, endWeekExclusive: 208 })
    }
    admitted(state)
    const actor = create(state, 'actor', 68); state = actor.state
    const director = create(state, 'director', 30); state = director.state
    const concepts = state.concepts.filter(row => !state.scriptDevelopment.projects.some(p => p.conceptId === row.id)
      && !state.studio.activeProductions.some(p => p.conceptId === row.id)
      && !state.studio.releasedFilms.some(p => p.conceptId === row.id)).slice(0, 3).map(row => row.id)
    expect(concepts).toEqual(['c-00', 'c-01', 'c-02'])
    admitted(state); return { state, actorId: actor.id, directorId: director.id, concepts }
  })
}
export function managedEmpty(): Setup {
  return memo('managedEmpty8', () => {
    const input = created(); let state = input.state
    const mounted = state.sets.filter(row => row.mountedOn === STAGE && row.status !== 'retired')
    expect(mounted.length).toBeLessThanOrEqual(1)
    if (mounted[0]) state = act(state, { kind: 'strikeSet', setId: mounted[0].id })
    state = act(state, { kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } })
    state = toWeek(state, 8)
    expect(state.sets.some(row => row.mountedOn === STAGE && row.status === 'standing')).toBe(true)
    expect(state.studio.activeProductions).toEqual([])
    state = act(state, { kind: 'activateScriptDevelopment' })
    expect(state.scriptDevelopment).toEqual({ mode: 'managed', projects: [] })
    admitted(state)
    // Independently reached before every P3 assertion, on unchanged production
    // during RED. Parent retains these complete compact outputs for a literal
    // RED/GREEN comparison; no expected digest is learned from a failure.
    const plain = castDraft(state, input.actorId)
    const lead: PromiseDraft = { ...plain, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
      predicate: { kind: 'castRoleCount', count: 1, seatClass: 'lead' } }
    const before = bytes(state), rng = clone(state.rngState)
    const receipts = [plain, lead].map(draft => ({ draft, receipt: core.promiseFeasibility(state, draft, 8) }))
    expect(receipts.every(row => row.receipt.rulesVersion === 4)).toBe(true)
    expect(bytes(state)).toBe(before); expect(state.rngState).toEqual(rng)
    console.info('1133-P3-LEGACY4 ' + JSON.stringify({ week: 8, rngState: rng, receipts }))
    return { ...input, state }
  })
}
export function creative(state: GameState, conceptId: string): CreativePromise {
  const concept = state.concepts.find(row => row.id === conceptId); assert.ok(concept)
  return { genre: concept.genre, intendedSegments: ['adult'], ranges: {
    intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } }
}
export type Pipeline = Setup & { projectIds: string[] }
export function pipeline(): Pipeline {
  return memo('ready10', () => {
    const input = managedEmpty(); let state = input.state; const projectIds: string[] = []
    for (const [index, conceptId] of input.concepts.slice(0, 2).entries()) {
      expect(state.market.tick).toBe(8 + index)
      expect(busyTalentIds(state).has(WRITER)).toBe(false)
      const oldIds = new Set(state.scriptDevelopment.projects.map(row => row.id))
      state = act(state, { kind: 'commissionScript', project: { conceptId, writerId: WRITER,
        shape: SHAPE, promise: creative(state, conceptId) } })
      const added = state.scriptDevelopment.projects.filter(row => !oldIds.has(row.id))
      expect(added).toHaveLength(1); const project = added[0]!
      expect(project).toMatchObject({ status: 'drafting', commissionedWeek: 8 + index,
        dueWeek: 9 + index, writerId: WRITER, writerIds: [WRITER], conceptId })
      expect(project.reservation).not.toBeNull(); projectIds.push(project.id)
      admitted(state); state = step(state)
      expect(state.scriptDevelopment.projects.find(row => row.id === project.id))
        .toMatchObject({ status: 'review', dueWeek: null, reservation: null })
      state = act(state, { kind: 'acceptScript', projectId: project.id })
      expect(state.scriptDevelopment.projects.find(row => row.id === project.id))
        .toMatchObject({ status: 'ready', productionId: null })
      admitted(state)
    }
    expect(new Set(projectIds).size).toBe(2)
    return { ...input, state, projectIds }
  })
}
export function at45(): Pipeline {
  return memo('cases45', () => {
    const input = pipeline(), state = toWeek(input.state, 45)
    for (const id of [input.actorId, input.directorId]) {
      expect(core.caseForTalent(state, id)).toMatchObject({ openedWeek: 40, decisionWeek: 52 })
      expect(core.retirementRecordFor(state, id)).toBeUndefined()
      expect(activeContract(state, id)).toMatchObject({ startWeek: 0, endWeekExclusive: 52 })
    }
    expect(state.scriptDevelopment.projects.filter(row => input.projectIds.includes(row.id) && row.status === 'ready')).toHaveLength(2)
    admitted(state); return { ...input, state }
  })
}
export function proposal(state: GameState, id: string, premium = 1.25): GameState {
  const priced = core.proposalDraft(state, issuer(state), id, 104, premium, state.market.tick)
  expect(state.studio.cash).toBeGreaterThanOrEqual(priced.signingBonus)
  const next = core.submitProposal(state, { talentId: id, issuerStudioId: issuer(state), termWeeks: 104, premiumTier: premium })
  expect(next.talentMarket.proposals.find(row => row.talentId === id && row.issuerStudioId === issuer(state)))
    .toMatchObject({ startWeek: 52, termWeeks: 104, premiumTier: premium })
  admitted(next); return next
}
export type Attached = Pipeline & { promiseId: string }
export function attached(): Attached {
  return memo('attached45', () => {
    const input = at45(), state = proposal(input.state, input.actorId), draft = directorDraft(state, input.actorId)
    expect(quote(state, draft)).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null, rulesVersion: 6 })
    const next = attach(state, input.actorId, draft), own = next.promises.at(-1)!
    expect(own).toMatchObject({ family: 'DIRECTING_COUNT', predicate: draft.predicate, version: 6,
      contractId: null, progress: 0, evidenceRefs: [], outcome: null })
    admitted(next); return { ...input, state: next, promiseId: own.promiseId }
  })
}
export type FreezeCall = { promiseId: string | null; rootVersion: number | null; week: number; result: PromiseFeasibilityReceipt }
export type Bound = Attached & { freezeCalls: FreezeCall[] }
export function bound(): Bound {
  return memo('bound52', () => {
    const input = attached(), actual = promiseOwner.promiseFeasibility, freezeCalls: FreezeCall[] = []
    const spy = vi.spyOn(promiseOwner, 'promiseFeasibility').mockImplementation((state, draft, week) => {
      const result = actual(state, draft, week)
      if (week === 52) freezeCalls.push({ promiseId: draft.promiseId ?? null,
        rootVersion: state.promises.find(row => row.promiseId === draft.promiseId)?.version ?? null, week, result: clone(result) })
      return result
    })
    let state: GameState
    try { state = toWeek(input.state, 52) } finally { spy.mockRestore() }
    const promise = actualPromise(state, input.promiseId)
    assert.ok(promise.contractId, 'fixture premise: player must actually win/bind at52')
    const employment = state.hollywood!.employment.find(row => row.contractId === promise.contractId)
    expect(employment).toMatchObject({ studioId: issuer(state), terms: { talentId: input.actorId, startWeek: 52, endWeekExclusive: 156 } })
    expect(state.talentMarket.receipts.filter(row => row.kind === 'settled' && row.week === 52
      && row.talentId === input.actorId && row.studioId === issuer(state))).toHaveLength(1)
    const contract = activeContract(state, input.actorId); assert.ok(contract)
    expect(state.ledger.filter(row => row.kind === 'signingBonus' && row.week === 52 && row.talentId === input.actorId))
      .toEqual([expect.objectContaining({ amount: -contract.signingBonus })])
    expect(freezeCalls.some(row => row.promiseId === input.promiseId)).toBe(true)
    admitted(state); return { ...input, state, freezeCalls }
  })
}
export function greenlight(state: GameState, projectId: string, directorId: string,
  cast = CAST): { state: GameState; productionId: string } {
  const project = state.scriptDevelopment.projects.find(row => row.id === projectId); assert.ok(project)
  expect(project.status).toBe('ready')
  const concept = state.concepts.find(row => row.id === project.conceptId); assert.ok(concept)
  const old = new Set(state.studio.activeProductions.map(row => row.id))
  const next = act(state, { kind: 'greenlightScriptProject', production: { projectId, directorId,
    craftIds: ['authored-0004'], cast, budget: { negative: concept.baseNegativeCost, marketing: 0 } } })
  const added = next.studio.activeProductions.filter(row => !old.has(row.id)); expect(added).toHaveLength(1)
  expect(added[0]).toMatchObject({ directorId, writerId: WRITER, cast, conceptId: project.conceptId })
  admitted(next); return { state: next, productionId: added[0]!.id }
}
export type FilmEvidence = { greenlit: GameState; held: GameState; scheduled: GameState; afterTake: GameState;
  released: GameState; productionId: string; take: FirstTakeReceipt; calls: number }
function film(input: Bound, state: GameState, projectId: string,
  advance: (state: GameState) => GameState = step, count: () => number = () => calls): FilmEvidence {
  const made = greenlight(state, projectId, input.actorId), startCalls = count()
  state = made.state
  let held: GameState | undefined, scheduled: GameState | undefined, afterTake: GameState | undefined
  let selectedRecipe = false
  for (let i = 0; i < 40; i++) {
    let workflow = state.operations.workflows.find(row => row.productionId === made.productionId)
    if (workflow?.phase === 'rehearsal' && !selectedRecipe) {
      state = act(state, { kind: 'setProductionSetupRecipe', productionId: made.productionId,
        recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: workflow.planRevision })
      selectedRecipe = true
    }
    const production = state.studio.activeProductions.find(row => row.id === made.productionId); assert.ok(production)
    if (production.remainingTicks === 5 && held === undefined) {
      held = clone(state); expect(state.firstTakes.filter(row => row.productionId === made.productionId)).toEqual([])
      admitted(held)
    }
    workflow = state.operations.workflows.find(row => row.productionId === made.productionId)
    if (workflow?.shootingTask?.status === 'unassigned')
      state = act(state, { kind: 'assignShootingDirector', productionId: made.productionId, directorId: input.actorId })
    if (state.operations.workflows.find(row => row.productionId === made.productionId)?.shootingTask?.status === 'ready') {
      state = act(state, { kind: 'scheduleShootingTake', productionId: made.productionId })
      expect(state.operations.workflows.find(row => row.productionId === made.productionId)?.shootingTask?.status).toBe('scheduled')
      if (production.remainingTicks === 5 && scheduled === undefined) { scheduled = clone(state); admitted(scheduled) }
    }
    if (production.remainingTicks === 1) state = act(state, { kind: 'commitPictureToRelease', productionId: made.productionId })
    const previous = state; state = advance(state)
    const takes = state.firstTakes.filter(row => row.productionId === made.productionId && row.studioId === issuer(state))
    if (takes.length && afterTake === undefined) {
      expect(previous.studio.activeProductions.find(row => row.id === made.productionId)?.remainingTicks).toBe(5)
      expect(state.studio.activeProductions.find(row => row.id === made.productionId)?.remainingTicks).toBe(4)
      expect(takes).toHaveLength(1); expect(takes[0]).toMatchObject({ directorId: input.actorId, week: state.market.tick })
      expect(takes[0]!.week).toBeGreaterThanOrEqual(52); expect(takes[0]!.week).toBeLessThan(112)
      afterTake = clone(state); admitted(afterTake)
    }
    const released = state.studio.releasedFilms.find(row => row.productionId === made.productionId)
    if (released) {
      assert.ok(held && scheduled && afterTake, 'actual held/scheduled/take boundaries before release')
      expect(released.participants).toMatchObject({ director: { talentId: input.actorId }, writer: { talentId: WRITER } })
      expect(takes).toHaveLength(1); admitted(state)
      return { greenlit: made.state, held, scheduled, afterTake, released: state,
        productionId: made.productionId, take: takes[0]!, calls: count() - startCalls }
    }
  }
  throw new Error('fixture premise: actual film did not release within40 calls; no rescue permitted')
}
export function firstFilm(): Bound & { first: FilmEvidence } {
  return memo('firstFilm', () => { const input = bound(), first = film(input, input.state, input.projectIds[0]!)
    return { ...input, first, state: first.released } })
}
export function secondFilm(): Bound & { first: FilmEvidence; second: FilmEvidence } {
  return memo('secondFilm', () => { const input = firstFilm(), second = film(input, input.state, input.projectIds[1]!)
    return { ...input, second, state: second.released } })
}
export function terminal208(): ReturnType<typeof secondFilm> & { at104: GameState; at156: GameState } {
  return memo('terminal208', () => {
    const input = secondFilm(); assert.ok(input.state.market.tick <= 104, 'both real pictures before natural notice104')
    const at104 = toWeek(input.state, 104); admitted(at104)
    const at156 = toWeek(at104, 156); admitted(at156)
    const state = toWeek(at156, 208); admitted(state)
    return { ...input, state, at104, at156 }
  })
}

// 1142: three explicitly charged branches; the original player path is shared,
// never recreated by a branch. Defaults in film() preserve its original route.
type Branch = 'cancelBefore' | 'cancelAfter' | 'waiver'
const branchCalls: Record<Branch, number> = { cancelBefore: 0, cancelAfter: 0, waiver: 0 }
const branchStarts: Partial<Record<Branch, number>> = {}
export function outcomeCounters() {
  return { playerCalls: calls, playerCap: 208, branches: Object.entries(branchCalls).map(([name, actualTicks]) => ({
    name, actualTicks, cap: 64, startWeek: branchStarts[name as Branch] ?? null,
  })), total: calls + Object.values(branchCalls).reduce((a, b) => a + b, 0), cap: 400 }
}
function startBranch(name: Branch, state: GameState): void {
  assert.equal(branchStarts[name], undefined, `${name}: only one actual trajectory`)
  assert.equal(branchCalls[name], 0); branchStarts[name] = state.market.tick; admitted(state)
}
function branchStep(name: Branch, state: GameState): GameState {
  const start = branchStarts[name]; assert.notEqual(start, undefined)
  assert.equal(state.market.tick, start! + branchCalls[name], `${name}: no hidden or repeated prefix`)
  assert.ok(branchCalls[name] < 64 && outcomeCounters().total < 400, `${name}: fixed branch/aggregate caps`)
  branchCalls[name]++
  const next = core.tick(state, { develop: true })
  expect(next.market.tick).toBe(state.market.tick + 1); return next
}
function branchTo(name: Branch, state: GameState, week: number): GameState {
  const start = branchStarts[name]; assert.notEqual(start, undefined)
  assert.ok(week >= state.market.tick && week <= start! + 64)
  while (state.market.tick < week) state = branchStep(name, state)
  admitted(state); return state
}

export function lateCancellation() {
  return memo('cancelBefore108', () => {
    const input = bound(); let state = input.state
    expect(state.market.tick).toBe(52); startBranch('cancelBefore', state)
    // This repeated real film is inside cancelBefore64, not free fixture work.
    const first = film(input, state, input.projectIds[0]!, s => branchStep('cancelBefore', s), () => branchCalls.cancelBefore)
    state = first.released
    expect(actualPromise(state, input.promiseId)).toMatchObject({ progress: 1,
      evidenceRefs: [first.take.eventId], outcome: null })
    const made = greenlight(state, input.projectIds[1]!, input.actorId); state = made.state
    let recipeSet = false
    while (state.market.tick < 108) {
      let workflow = state.operations.workflows.find(row => row.productionId === made.productionId); assert.ok(workflow)
      if (workflow.phase === 'rehearsal' && !recipeSet) {
        state = act(state, { kind: 'setProductionSetupRecipe', productionId: made.productionId,
          recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: workflow.planRevision })
        recipeSet = true
      }
      workflow = state.operations.workflows.find(row => row.productionId === made.productionId); assert.ok(workflow)
      if (workflow.shootingTask?.status === 'unassigned')
        state = act(state, { kind: 'assignShootingDirector', productionId: made.productionId, directorId: input.actorId })
      const production = state.studio.activeProductions.find(row => row.id === made.productionId); assert.ok(production)
      expect(production.remainingTicks).toBeGreaterThanOrEqual(5)
      expect(state.firstTakes.filter(row => row.productionId === made.productionId)).toEqual([])
      expect(state.operations.workflows.find(row => row.productionId === made.productionId)?.shootingTask?.status)
        .not.toBe('scheduled')
      // Deliberately no schedule action: actual ready work waits at remaining5.
      state = branchStep('cancelBefore', state)
    }
    expect(recipeSet).toBe(true); expect(state.market.tick).toBe(108)
    const production = state.studio.activeProductions.find(row => row.id === made.productionId); assert.ok(production)
    const workflow = state.operations.workflows.find(row => row.productionId === made.productionId); assert.ok(workflow)
    expect(production).toMatchObject({ directorId: input.actorId, remainingTicks: 5 })
    expect(workflow.shootingTask).toMatchObject({ directorId: input.actorId, status: 'ready' })
    expect(workflow.blocker).toBeNull(); admitted(state)
    const held = clone(state)
    state = act(state, { kind: 'scheduleShootingTake', productionId: made.productionId })
    expect(state.operations.workflows.find(row => row.productionId === made.productionId)?.shootingTask?.status)
      .toBe('scheduled')
    expect(state.firstTakes.filter(row => row.productionId === made.productionId)).toEqual([])
    admitted(state); const before = clone(state)
    const after = act(state, { kind: 'cancel', productionId: made.productionId })
    admitted(after)
    return { ...input, first, held, before, after, cancelled: clone(production), productionId: made.productionId }
  })
}
export function lateCancellationDue() {
  return memo('cancelBefore112', () => {
    const input = lateCancellation(), state = branchTo('cancelBefore', input.after, 112)
    return { ...input, state }
  })
}
export function afterTakeCancellation() {
  return memo('cancelAfterTake', () => {
    const input = firstFilm(), before = clone(input.first.afterTake)
    expect(before.market.tick).toBe(input.first.take.week); startBranch('cancelAfter', before)
    expect(actualPromise(before, input.promiseId)).toMatchObject({ progress: 1,
      evidenceRefs: [input.first.take.eventId], outcome: null })
    const after = act(before, { kind: 'cancel', productionId: input.first.productionId })
    admitted(after); return { ...input, before, after }
  })
}
export function afterTakeCancellationDue() {
  return memo('cancelAfter112', () => {
    const input = afterTakeCancellation(), state = branchTo('cancelAfter', input.after, 112)
    return { ...input, state }
  })
}
export type DirectorSubstitute = {
  family: 'DIRECTING_COUNT'; predicate: { kind: 'directorCount'; count: number }
  windowStartWeek: number; dueWeekExclusive: number
}
export function waiverInput() {
  return memo('waiverInput', () => {
    const input = firstFilm(), state = clone(input.first.afterTake)
    expect(state.market.tick).toBe(input.first.take.week); expect(state.market.tick).toBe(61)
    const original = actualPromise(state, input.promiseId)
    expect(original).toMatchObject({ progress: 1, evidenceRefs: [input.first.take.eventId], outcome: null })
    const contract = activeContract(state, input.actorId); assert.ok(contract)
    expect(contract).toMatchObject({ startWeek: 52, endWeekExclusive: 156, termWeeks: 104 })
    expect(state.scriptDevelopment.projects.find(row => row.id === input.projectIds[1]))
      .toMatchObject({ status: 'ready', productionId: null })
    const substitute: DirectorSubstitute = { family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 },
      windowStartWeek: state.market.tick + 1, dueWeekExclusive: 104 }
    expect(substitute.windowStartWeek).toBe(62)
    const receipt = core.promiseFeasibility(state, { ...substitute,
      issuerStudioId: original.issuerStudioId, beneficiaryPersonId: input.actorId,
      startWeek: contract.startWeek, termWeeks: contract.termWeeks, promiseId: original.promiseId }, state.market.tick)
    expect(receipt).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null, rulesVersion: 6 })
    expect(promiseOwner.trustDescriptor(state, input.actorId, original.issuerStudioId, state.market.tick).label)
      .not.toBe('Distrusted')
    admitted(state); return { ...input, state, original, substitute, receipt }
  })
}
export function waived() {
  return memo('waived61', () => {
    const input = waiverInput(), before = clone(input.state); startBranch('waiver', before)
    // The public action remains the boundary even while its old type lacks P3.
    const state = act(clone(before), { kind: 'waivePromise', promiseId: input.promiseId,
      substitute: input.substitute } as unknown as Action)
    admitted(state)
    const added = state.promises.filter(row => !before.promises.some(old => old.promiseId === row.promiseId))
    expect(added).toHaveLength(1); const successor = added[0]!
    expect(successor).toMatchObject({ family: 'DIRECTING_COUNT', predicate: input.substitute.predicate,
      version: 6, contractId: input.original.contractId, beneficiaryPersonId: input.actorId,
      issuerStudioId: input.original.issuerStudioId, progress: 0, evidenceRefs: [], outcome: null,
      windowStartWeek: 62, dueWeekExclusive: 104, feasibilityReceipt: input.receipt })
    expect(actualPromise(state, input.promiseId)).toMatchObject({ outcome: 'WAIVED', progress: 1,
      evidenceRefs: [input.first.take.eventId], supersededByPromiseId: successor.promiseId, outcomeWeek: before.market.tick })
    return { ...input, before, state, successorId: successor.promiseId }
  })
}
export function waiverCompleted() {
  return memo('waiver104', () => {
    const input = waived(); let state = input.state
    // Finish the already-filmed first picture without minting or replaying a take.
    while (state.studio.activeProductions.some(row => row.id === input.first.productionId)) {
      const production = state.studio.activeProductions.find(row => row.id === input.first.productionId)!
      expect(production.remainingTicks).toBeLessThan(5)
      if (production.remainingTicks === 1)
        state = act(state, { kind: 'commitPictureToRelease', productionId: production.id })
      state = branchStep('waiver', state)
    }
    expect(state.studio.releasedFilms.filter(row => row.productionId === input.first.productionId)).toHaveLength(1)
    expect(state.firstTakes.filter(row => row.productionId === input.first.productionId)).toEqual([input.first.take])
    admitted(state)
    const second = film(input, state, input.projectIds[1]!, s => branchStep('waiver', s), () => branchCalls.waiver)
    expect(second.take.week).toBeGreaterThanOrEqual(input.substitute.windowStartWeek)
    expect(second.take.week).toBeLessThan(input.substitute.dueWeekExclusive)
    state = branchTo('waiver', second.released, 104)
    return { ...input, second, state }
  })
}

// 1148: one additional genuine208→364 trajectory; no player-prefix replay.
export const LIFE = { director: 'authored-0000', other: 'authored-0002', writer: WRITER } as const
let lifecycleCalls = 0
export function continuityCounters() {
  return { ...outcomeCounters(), lifecycleCalls, lifecycleCap: 156,
    total: outcomeCounters().total + lifecycleCalls, cap: 556, selectedCap: 364 }
}
function lifeStep(state: GameState): GameState {
  assert.equal(state.market.tick, 208 + lifecycleCalls, 'one monotone lifecycle route')
  assert.ok(lifecycleCalls < 156 && continuityCounters().total < 556)
  lifecycleCalls++
  const next = core.tick(state, { develop: true })
  expect(next.market.tick).toBe(state.market.tick + 1); return next
}
function lifeTo(state: GameState, week: number): GameState {
  assert.ok(week >= state.market.tick && week <= 364)
  while (state.market.tick < week) state = lifeStep(state)
  admitted(state); return state
}
export const lifeDraft = (state: GameState, id: string, directing: boolean): PromiseDraft => ({
  family: directing ? 'DIRECTING_COUNT' : 'APPEARANCE_COUNT',
  predicate: directing ? { kind: 'directorCount', count: 1 } : { count: 1 },
  issuerStudioId: issuer(state), beneficiaryPersonId: id, startWeek: 260, termWeeks: 52,
  windowStartWeek: 260, dueWeekExclusive: 300,
})
export function lifecycle208() {
  return memo('lifecycle208', () => {
    const old = outgoing('natural-week208'), loaded = saves.migrateToLive(old.save).state
    expect(loaded.market.tick).toBe(208); expect(loaded.studio.cash).toBe(18_715_197.00408718)
    expect(loaded.contracts).toEqual([]); expect(loaded.studio.activeProductions).toEqual([])
    expect(loaded.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] }); admitted(loaded)
    expect(person(loaded, LIFE.director)).toMatchObject({ role: 'director', age: 72 })
    expect(person(loaded, LIFE.other)).toMatchObject({ role: 'director', age: 44 })
    expect(person(loaded, LIFE.writer)).toMatchObject({ role: 'writer', age: 44 })
    const actorRecord = clone(core.retirementRecordFor(loaded, LIFE.director, 'actor'))
    expect(actorRecord).toMatchObject({ profession: 'actor', status: 'retired', retiredWeek: 208 })
    const changes = clone(loaded.careerLifecycle.professionChanges.filter(row => row.personId === LIFE.director))
    expect(changes).toEqual([expect.objectContaining({ from: 'actor', to: 'director', week: 208 })])
    let state = loaded
    for (const id of [LIFE.director, LIFE.other, LIFE.writer]) {
      expect(state.hollywood!.employment.filter(e => e.terms.talentId === id && e.terms.startWeek <= 208
        && 208 < (e.endedWeek ?? e.terms.endWeekExclusive))).toEqual([])
      const offer = core.playerOffer(state, id, 52)
      expect(state.studio.cash).toBeGreaterThanOrEqual(offer.signingBonus)
      const cash = state.studio.cash, ledgerCount = state.ledger.length
      state = act(state, { kind: 'signContract', talentId: id, termWeeks: 52 })
      expect(activeContract(state, id)).toMatchObject({ startWeek: 208, endWeekExclusive: 260,
        termWeeks: 52, annualSalary: offer.annualSalary, signingBonus: offer.signingBonus })
      expect(state.studio.cash).toBe(cash - offer.signingBonus)
      expect(state.ledger.slice(ledgerCount)).toEqual([expect.objectContaining({ kind: 'signingBonus',
        talentId: id, week: 208, amount: -offer.signingBonus })]); admitted(state)
    }
    expect(core.retirementRecordFor(state, LIFE.director, 'actor')).toEqual(actorRecord)
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === LIFE.director)).toEqual(changes)
    return { loaded, state, actorRecord, changes }
  })
}
export function lifecycle248() {
  return memo('lifecycle248', () => {
    const input = lifecycle208(); let state = act(input.state, { kind: 'activateScriptDevelopment' })
    const used = new Set([...state.studio.releasedFilms.map(f => f.conceptId),
      ...state.studio.activeProductions.map(p => p.conceptId)])
    expect(state.concepts.filter(c => !used.has(c.id)).slice(0, 2).map(c => c.id)).toEqual(['c-03', 'c-04'])
    const projectIds: string[] = []
    for (const [index, conceptId] of ['c-03', 'c-04'].entries()) {
      expect(state.market.tick).toBe(208 + index); expect(busyTalentIds(state).has(LIFE.writer)).toBe(false)
      const before = new Set(state.scriptDevelopment.projects.map(p => p.id))
      state = act(state, { kind: 'commissionScript', project: { conceptId, writerId: LIFE.writer,
        shape: SHAPE, promise: creative(state, conceptId) } })
      const added = state.scriptDevelopment.projects.filter(p => !before.has(p.id)); expect(added).toHaveLength(1)
      const project = added[0]!; projectIds.push(project.id)
      expect(project).toMatchObject({ status: 'drafting', writerId: LIFE.writer, writerIds: [LIFE.writer],
        commissionedWeek: 208 + index, dueWeek: 209 + index, conceptId })
      expect(project.reservation).not.toBeNull(); admitted(state)
      state = lifeStep(state)
      expect(state.scriptDevelopment.projects.find(p => p.id === project.id))
        .toMatchObject({ status: 'review', dueWeek: null, reservation: null })
      state = act(state, { kind: 'acceptScript', projectId: project.id }); admitted(state)
      expect(state.scriptDevelopment.projects.find(p => p.id === project.id)).toMatchObject({ status: 'ready', productionId: null })
    }
    state = lifeTo(state, 248)
    for (const id of [LIFE.other, LIFE.director]) {
      const view = core.caseForTalent(state, id); assert.ok(view)
      expect(view).toMatchObject({ openedWeek: 248, decisionWeek: 260, status: 'discovered' })
      expect(state.talentMarket.cases.find(c => c.contractId === view.contractId && c.openedWeek === 248))
        .toMatchObject({ variant: 'expiry' })
      expect(core.retirementRecordFor(state, id)).toBeUndefined()
    }
    for (const id of projectIds) expect(state.scriptDevelopment.projects.find(p => p.id === id))
      .toMatchObject({ status: 'ready', productionId: null })
    return { ...input, state, projectIds }
  })
}
export function lifecycleAttached() {
  return memo('lifecycleAttached248', () => {
    const input = lifecycle248(); let state = input.state
    const promiseIds: string[] = [], before = clone(state)
    let castBefore: ProfessionalPromise | undefined
    for (const [id, directing] of [[LIFE.other, false], [LIFE.director, true]] as const) {
      const offer = core.proposalDraft(state, issuer(state), id, 52, 1.25, 248)
      expect(state.studio.cash).toBeGreaterThanOrEqual(offer.signingBonus)
      state = core.submitProposal(state, { talentId: id, issuerStudioId: issuer(state), termWeeks: 52, premiumTier: 1.25 })
      const draft = lifeDraft(state, id, directing)
      expect(quote(state, draft)).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null })
      const old = new Set(state.promises.map(p => p.promiseId))
      state = core.attachPromise(state, id, issuer(state), draft)
      const added = state.promises.filter(p => !old.has(p.promiseId)); expect(added).toHaveLength(1)
      promiseIds.push(added[0]!.promiseId)
      if (!directing) castBefore = clone(added[0]!)
      admitted(state)
    }
    assert.ok(castBefore)
    return { ...input, before, state, castId: promiseIds[0]!, directorPromiseId: promiseIds[1]!, castBefore }
  })
}
export function lifecycle260() {
  return memo('lifecycle260', () => {
    const input = lifecycleAttached(), actual = promiseOwner.promiseFeasibility, freezeCalls: FreezeCall[] = []
    const prices: Record<string, { annualSalary: number; signingBonus: number }> = {}
    const spy = vi.spyOn(promiseOwner, 'promiseFeasibility').mockImplementation((state, draft, week) => {
      if (week === 260 && draft.issuerStudioId === issuer(state)
        && [input.castId, input.directorPromiseId].includes(draft.promiseId ?? '')) {
        const price = core.proposalDraft(state, draft.issuerStudioId, draft.beneficiaryPersonId, 52, 1.25, week)
        prices[draft.beneficiaryPersonId] = { annualSalary: price.annualSalary, signingBonus: price.signingBonus }
      }
      const result = actual(state, draft, week)
      if (week === 260) freezeCalls.push({ promiseId: draft.promiseId ?? null,
        rootVersion: state.promises.find(p => p.promiseId === draft.promiseId)?.version ?? null,
        week, result: clone(result) })
      return result
    })
    let state: GameState
    try { state = lifeTo(input.state, 260) } finally { spy.mockRestore() }
    for (const [id, promiseId] of [[LIFE.other, input.castId], [LIFE.director, input.directorPromiseId]] as const) {
      const row = state.promises.find(p => p.promiseId === promiseId); assert.ok(row)
      assert.ok(row.contractId, 'fixture premise: actual own winner and bound root')
      expect(row).toMatchObject({ beneficiaryPersonId: id, issuerStudioId: issuer(state) })
      const employment = state.hollywood!.employment.find(e => e.contractId === row.contractId); assert.ok(employment)
      expect(employment).toMatchObject({ studioId: issuer(state), terms: { talentId: id, startWeek: 260,
        endWeekExclusive: 312, termWeeks: 52 } })
      const price = prices[id]; assert.ok(price, 'actual decision-week pre-freeze public price observed')
      expect(price.signingBonus).toBe(Math.round(price.annualSalary * 0.18))
      expect(employment.terms).toMatchObject(price)
      expect(state.ledger.filter(r => r.kind === 'signingBonus' && r.week === 260 && r.talentId === id))
        .toEqual([expect.objectContaining({ amount: -employment.terms.signingBonus })])
      expect(state.talentMarket.receipts.filter(r => r.kind === 'settled' && r.week === 260
        && r.talentId === id && r.studioId === issuer(state))).toHaveLength(1)
      expect(state.talentMarket.proposals.filter(p => p.talentId === id)).toEqual([])
    }
    for (const id of input.projectIds) expect(state.scriptDevelopment.projects.find(p => p.id === id))
      .toMatchObject({ status: 'ready', productionId: null })
    admitted(state); return { ...input, state, freezeCalls, prices }
  })
}
export function lifecycle261() {
  return memo('lifecycle261', () => {
    const input = lifecycle260(), actual = lifecycleOwner.assignmentRefusal
    const advance = promiseOwner.advancePromisesWeek
    let inPromiseOwner = false
    const admissionCalls: { personId: string; week: number; requested: string | null }[] = []
    const spy = vi.spyOn(lifecycleOwner, 'assignmentRefusal').mockImplementation((state, id, week, requested) => {
      if (inPromiseOwner) admissionCalls.push({ personId: id, week, requested: requested ?? null })
      return actual(state, id, week, requested)
    })
    const ownerSpy = vi.spyOn(promiseOwner, 'advancePromisesWeek').mockImplementation(state => {
      inPromiseOwner = true
      try { return advance(state) } finally { inPromiseOwner = false }
    })
    let state: GameState
    try { state = lifeStep(input.state) } finally { ownerSpy.mockRestore(); spy.mockRestore() }
    admitted(state); return { ...input, before261: input.state, state, admissionCalls }
  })
}
export function lifecycle364() {
  return memo('lifecycle364', () => {
    const input = lifecycle261(), at300 = lifeTo(input.state, 300), state = lifeTo(at300, 364)
    expect(person(state, LIFE.director)).toMatchObject({ role: 'director', age: 75 })
    const current = core.retirementRecordFor(state, LIFE.director); assert.ok(current, 'actual hard75 announcement')
    const ends = state.hollywood!.employment.filter(e => e.terms.talentId === LIFE.director
      && e.terms.startWeek <= 364 && 364 < (e.endedWeek ?? e.terms.endWeekExclusive)).map(e => e.terms.endWeekExclusive)
    expect(current).toMatchObject({ profession: 'director', status: 'announced', cause: 'hardBoundary',
      announcedWeek: 364, effectiveWeek: Math.max(416, ...ends) })
    expect(core.retirementRecordFor(state, LIFE.director, 'actor')).toEqual(input.actorRecord)
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === LIFE.director)).toEqual(input.changes)
    admitted(state); return { ...input, at300, state, current }
  })
}

// 1154: one independently loaded fixed rival attempt. Earlier successful phase
// caches survive a later failed market/work premise; never replay the prefix.
export const RIVAL = { studio: 'studio-de11f27b-r01', vacancy: 'person-studio-de11f27b-r01-2',
  focus: 'authored-0006', trust: 'authored-0007', primaryDirector: 'authored-0002' } as const
let rivalCalls = 0
export function rivalCounters() {
  return { rivalCalls, rivalCap: 260, otherCoreCalls: continuityCounters().total,
    total: continuityCounters().total + rivalCalls, cap: 816 }
}
export type RivalCandidateCall = { week: number; personId: string; role: string; draft: PromiseDraft;
  result: PromiseFeasibilityReceipt; beforeHash: string; afterHash: string; rngBefore: string; rngAfter: string;
  promiseIds: string[]; automaticProposal: { submittedWeek: number; termWeeks: number; startWeek: number; promises: string[] } }
export type RivalPackageCall = { week: number; key: string; director: string; directorRole: string; writer: string;
  craft: string[]; offeredCast: string[]; chosenCast: string[] | null; conceptId: string }
const rivalCandidateCalls: RivalCandidateCall[] = []
const rivalPackageCalls: RivalPackageCall[] = []
type Industry = NonNullable<GameState['hollywood']>
type RivalBusiness = Industry['businesses'][number]
type MarketPass = { week: number; beforeSigning: number; afterSigning: number;
  beforeCash: number; afterCash: number; beforeMovements: number; afterMovements: number;
  addedEmployment: Industry['employment']; addedReceipts: Industry['receipts'];
  marketReceipts: GameState['talentMarket']['receipts'] }
let rivalMarketPass: MarketPass | undefined
const rivalFreezeSeats: { week: number; heldActors: string[]; receipt: PromiseFeasibilityReceipt }[] = []
function rivalBusiness(state: GameState): RivalBusiness {
  const b = state.hollywood?.businesses.find(row => row.studioId === RIVAL.studio)
  assert.ok(b, 'fixed entered rival business'); return b
}
function accountTotals(b: RivalBusiness) {
  return { cash: b.account.cash, signing: b.account.periods.reduce((sum, p) => sum + p.movements.signing, 0),
    movements: b.account.periods.reduce((sum, p) => sum + Object.values(p.movements).reduce((a, n) => a + n, 0), 0) }
}
// 1164: factual pre-call observations only. Keep raw linked rows alongside the
// independently labelled membership sets; do not calculate a classification,
// capacity total, expected receipt or replacement digest.
function rivalQuoteFacts(state: GameState, draft: PromiseDraft, week: number) {
  const from = Math.max(week, draft.windowStartWeek)
  const linked = state.talentMarket.proposals.flatMap(p => p.promises)
  const rows = state.promises.filter(p => p.beneficiaryPersonId === draft.beneficiaryPersonId
    || p.issuerStudioId === draft.issuerStudioId).map(p => {
    const samePerson = p.beneficiaryPersonId === draft.beneficiaryPersonId
    const sameIssuer = p.issuerStudioId === draft.issuerStudioId
    const open = p.outcome === null, bound = p.contractId !== null, attached = linked.includes(p.promiseId)
    const notSelf = p.promiseId !== draft.promiseId
    const overlaps = p.dueWeekExclusive > from && p.windowStartWeek < draft.dueWeekExclusive
    return { row: clone(p), samePerson, sameIssuer, open, bound, attached, notSelf, overlaps,
      attachedBy: state.talentMarket.proposals.filter(proposal => proposal.promises.includes(p.promiseId))
        .map(proposal => ({ talentId: proposal.talentId, issuerStudioId: proposal.issuerStudioId,
          startWeek: proposal.startWeek, termWeeks: proposal.termWeeks, submittedWeek: proposal.submittedWeek })) }
  })
  const active = rows.filter(r => r.open && (r.bound || r.attached) && r.notSelf && r.overlaps)
  const union = active.filter(r => r.samePerson || r.sameIssuer)
  const hasDirectorTag = (p: { predicate: PromiseDraft['predicate'] }) =>
    'kind' in p.predicate && p.predicate.kind === 'directorCount'
  const taggedUnionScope = hasDirectorTag(draft) || union.some(r => hasDirectorTag(r.row))
  const player = state.hollywood === null || draft.issuerStudioId === state.hollywood.playerStudioId
  const business = player ? undefined : state.hollywood?.businesses.find(b => b.studioId === draft.issuerStudioId)
  const development = player ? state.scriptDevelopment : business?.development
  const productions = player ? state.studio.activeProductions : business?.productions ?? []
  const operations = player ? state.operations : business?.operations
  const productionIds = new Set(productions.map(p => p.id))
  const used = new Set([...state.studio.activeProductions.map(p => p.conceptId),
    ...state.studio.releasedFilms.map(f => f.conceptId), ...state.scriptDevelopment.projects.map(p => p.conceptId)])
  return { gameWeek: state.market.tick, quoteWeek: week, from, draft: clone(draft),
    currentProfession: person(state, draft.beneficiaryPersonId).role,
    selectedSamePersonIds: active.filter(r => r.samePerson).map(r => r.row.promiseId),
    selectedUnionIds: union.map(r => r.row.promiseId), taggedUnionScope,
    selectedByDeclaredScopeIds: (taggedUnionScope ? union : active.filter(r => r.samePerson)).map(r => r.row.promiseId),
    rawLinkedRows: rows,
    actualProposals: clone(state.talentMarket.proposals.filter(p => p.talentId === draft.beneficiaryPersonId
      || p.issuerStudioId === draft.issuerStudioId)),
    owner: player ? 'player' : 'rival', developmentMode: development?.mode ?? null,
    scripts: development?.projects.map(p => ({ id: p.id, conceptId: p.conceptId, status: p.status,
      commissionedWeek: p.commissionedWeek, dueWeek: p.dueWeek, writerId: p.writerId,
      writerIds: [...p.writerIds], reservation: clone(p.reservation), productionId: p.productionId })) ?? [],
    productions: productions.map(p => ({ id: p.id, conceptId: p.conceptId, startTick: p.startTick,
      remainingTicks: p.remainingTicks, writerId: p.writerId, directorId: p.directorId,
      craftIds: [...p.craftIds], cast: clone(p.cast) })),
    recordedTakes: clone(state.firstTakes.filter(t => productionIds.has(t.productionId))),
    facilities: operations?.facilities.map(f => ({ id: f.id, capability: f.capability, capacity: f.capacity })) ?? [],
    workflows: operations?.workflows.map(w => ({ productionId: w.productionId, phase: w.phase,
      blocker: clone(w.blocker), shootingTask: clone(w.shootingTask) })) ?? [],
    unusedPlayerConceptIds: player ? state.concepts.filter(c => !used.has(c.id)).map(c => c.id) : null }
}
function rivalStep(state: GameState): GameState {
  assert.equal(state.market.tick, rivalCalls, 'rival route has no replayed or hidden prefix')
  assert.ok(rivalCalls < 260 && rivalCounters().total < 816, 'fixed rival260 / all-core816 caps')
  const returnedWeek = state.market.tick + 1, workWeek = state.market.tick
  const originalMarket = marketOwner.advanceTalentMarketWeek, originalQuote = promiseOwner.promiseFeasibility
  const originalPackage = packageOwner.chooseIndustryPackage
  let insideMarket = false
  const watched = new Set<string>([RIVAL.focus, RIVAL.vacancy, RIVAL.primaryDirector])
  const quoteSpy = (returnedWeek === 196 || returnedWeek === 208)
    ? vi.spyOn(promiseOwner, 'promiseFeasibility').mockImplementation((current, draft, week) => {
      const relevant = insideMarket && draft.issuerStudioId === RIVAL.studio && watched.has(draft.beneficiaryPersonId)
      const proposal = relevant ? current.talentMarket.proposals.find(p => p.talentId === draft.beneficiaryPersonId
        && p.issuerStudioId === RIVAL.studio) : undefined
      const authoring = relevant && week === 196 && draft.promiseId === undefined && proposal !== undefined
        && proposal.promises.length === 0
      const beforeHash = authoring ? sha(saves.stableStringify(current)) : ''
      const rngBefore = authoring ? current.rngState : ''
      const inputFacts = authoring && draft.beneficiaryPersonId === RIVAL.focus
        ? rivalQuoteFacts(current, draft, week) : undefined
      const result = originalQuote(current, draft, week)
      if (inputFacts !== undefined)
        console.info('1164-P3-RIVAL-QUOTE ' + JSON.stringify({ inputFacts, receipt: result }))
      if (authoring) rivalCandidateCalls.push({ week, personId: draft.beneficiaryPersonId,
        role: person(current, draft.beneficiaryPersonId).role, draft: clone(draft), result: clone(result),
        beforeHash, afterHash: sha(saves.stableStringify(current)), rngBefore, rngAfter: current.rngState,
        promiseIds: current.promises.map(p => p.promiseId), automaticProposal: {
          submittedWeek: proposal!.submittedWeek, termWeeks: proposal!.termWeeks,
          startWeek: proposal!.startWeek, promises: [...proposal!.promises] } })
      if (relevant && week === 208 && draft.beneficiaryPersonId === RIVAL.focus) {
        const heldActors = current.hollywood!.activeEmploymentOrdinals.map(i => current.hollywood!.employment[i]!)
          .filter(e => e.studioId === RIVAL.studio && e.endedWeek === null && e.terms.endWeekExclusive > week
            && person(current, e.terms.talentId).role === 'actor').map(e => e.terms.talentId)
        rivalFreezeSeats.push({ week, heldActors, receipt: clone(result) })
      }
      return result
    }) : undefined
  const marketSpy = (returnedWeek === 196 || returnedWeek === 208)
    ? vi.spyOn(marketOwner, 'advanceTalentMarketWeek').mockImplementation(current => {
      const before = returnedWeek === 208 ? accountTotals(rivalBusiness(current)) : undefined
      const contracts = new Set(current.hollywood!.employment.map(e => e.contractId))
      const receiptCount = current.hollywood!.receipts.length, marketReceiptCount = current.talentMarket.receipts.length
      insideMarket = true
      try {
        const next = originalMarket(current)
        if (before) {
          const after = accountTotals(rivalBusiness(next))
          rivalMarketPass = { week: current.market.tick, beforeSigning: before.signing, afterSigning: after.signing,
            beforeCash: before.cash, afterCash: after.cash, beforeMovements: before.movements, afterMovements: after.movements,
            addedEmployment: clone(next.hollywood!.employment.filter(e => !contracts.has(e.contractId) && e.studioId === RIVAL.studio)),
            addedReceipts: clone(next.hollywood!.receipts.slice(receiptCount).filter(r => r.studioId === RIVAL.studio)),
            marketReceipts: clone(next.talentMarket.receipts.slice(marketReceiptCount)) }
        }
        return next
      } finally { insideMarket = false }
    }) : undefined
  // Retain one ordinary pre208 package and actual post208 candidates only.
  // This observes the existing pure package boundary, not the private staffing
  // selector. No callback clones a world or invokes a second simulation phase.
  const packageSpy = (workWeek >= 208 || !rivalPackageCalls.some(p => p.week < 208 && p.chosenCast !== null))
    ? vi.spyOn(packageOwner, 'chooseIndustryPackage').mockImplementation((input, policy, options) => {
      const result = originalPackage(input, policy, options)
      if (options.key.startsWith(`${RIVAL.studio}:package:`) && options.lockScreenplay
        && (workWeek >= 208 || (result !== null && !rivalPackageCalls.some(p => p.week < 208 && p.chosenCast !== null))))
        rivalPackageCalls.push({ week: workWeek, key: options.key, director: input.director.id,
          directorRole: input.director.role, writer: input.writer.id, craft: input.craftHires.map(p => p.id),
          offeredCast: [input.cast.lead.id, input.cast.antagonist.id, input.cast.support.id],
          chosenCast: result ? [result.cast.lead, result.cast.antagonist, result.cast.support] : null, conceptId: input.concept.id })
      return result
    }) : undefined
  rivalCalls++
  try {
    const next = core.tick(state, { develop: true })
    expect(next.market.tick).toBe(returnedWeek); return next
  } finally { packageSpy?.mockRestore(); marketSpy?.mockRestore(); quoteSpy?.mockRestore() }
}
function rivalTo(state: GameState, week: number): GameState {
  assert.ok(week >= state.market.tick && week <= 260)
  while (state.market.tick < week) state = rivalStep(state)
  return state
}
function createRivalActor(state: GameState, termWeeks: 52 | 208, expectedId: string): GameState {
  const six = (n: number) => [n, n, n, n, n, n], ids = new Set(state.talent.map(t => t.id))
  let next = act(state, { kind: 'createCustomTalent', talent: { name: `P3 rival ${termWeeks}`, role: 'actor', age: 30,
    actual: { warmth: 0, gravity: 0, physicality: 0.2 }, workEthic: 55, fame: 25,
    skills: { acting: six(80), directing: six(80), writing: six(20), craft: six(20), research: six(1) } } })
  expect(next.talent.filter(t => !ids.has(t.id)).map(t => t.id)).toEqual([expectedId])
  expect(Object.values(person(next, expectedId).workHistory).every(n => n === 0)).toBe(true)
  expect(next.careerLifecycle.professionAnchors.find(a => a.personId === expectedId))
    .toEqual({ personId: expectedId, profession: 'actor', kind: 'entrant', recordedWeek: 0 })
  const price = core.playerOffer(next, expectedId, termWeeks)
  expect(next.studio.cash).toBeGreaterThanOrEqual(price.signingBonus)
  next = act(next, { kind: 'signContract', talentId: expectedId, termWeeks })
  expect(activeContract(next, expectedId)).toMatchObject({ startWeek: 0, endWeekExclusive: termWeeks, termWeeks })
  admitted(next); return next
}
function rivalScript(state: GameState, conceptId: string, week: number) {
  expect(state.market.tick).toBe(week); expect(busyTalentIds(state).has(WRITER)).toBe(false)
  expect(activeContract(state, WRITER)).toMatchObject({ startWeek: 0, endWeekExclusive: 208 })
  const old = new Set(state.scriptDevelopment.projects.map(p => p.id))
  let next = act(state, { kind: 'commissionScript', project: { conceptId, writerId: WRITER,
    shape: SHAPE, promise: creative(state, conceptId) } })
  const added = next.scriptDevelopment.projects.filter(p => !old.has(p.id)); expect(added).toHaveLength(1)
  const id = added[0]!.id
  expect(added[0]).toMatchObject({ status: 'drafting', commissionedWeek: week, dueWeek: week + 1,
    writerId: WRITER, writerIds: [WRITER], conceptId })
  admitted(next); next = rivalStep(next)
  expect(next.scriptDevelopment.projects.find(p => p.id === id)).toMatchObject({ status: 'review', dueWeek: null, reservation: null })
  next = act(next, { kind: 'acceptScript', projectId: id })
  expect(next.scriptDevelopment.projects.find(p => p.id === id)).toMatchObject({ status: 'ready', productionId: null })
  admitted(next); return { state: next, projectId: id }
}
export function rivalCreated0() {
  return memo('rivalCreated0', () => {
    const base = new URL('../fixtures/p14/genuine-v37-c3-corpus/', import.meta.url)
    expect(sha(readFileSync(new URL('MANIFEST.json', base)))).toBe('b3a3251ae7b3df96a1e2a615991744c5d1e5966a095424693f086a1581244294')
    const gzip = readFileSync(new URL('genuine-v37-c3-created-week0.json.gz', base))
    expect(sha(gzip)).toBe('0ce43de9abe897631f415f94ac79e584b87d6001c8bb4b5c37fccf3dcb8204a2')
    const raw = gunzipSync(gzip).toString('utf8')
    expect(sha(raw)).toBe('215b61730393abc8bc28b747d7d79bf9dcb65d2b03f17aa97b96880bc720fa23')
    let state = saves.migrateToLive(saves.validateSaveV37(JSON.parse(raw))).state
    expect(state.market.tick).toBe(0); expect(state.studio.cash).toBe(29_611_837)
    expect(state.studio.activeProductions).toEqual([]); expect(state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] })
    for (const id of [WRITER, RIVAL.primaryDirector, 'authored-0004', ...Object.values(CAST)])
      expect(activeContract(state, id)).toMatchObject({ startWeek: 0, endWeekExclusive: 208 })
    expect(person(state, RIVAL.vacancy)).toMatchObject({ role: 'actor', age: 35 })
    admitted(state)
    state = createRivalActor(state, 208, RIVAL.focus)
    state = createRivalActor(state, 52, RIVAL.trust)
    return { state }
  })
}
export function rivalCredit() {
  return memo('rivalCredit', () => {
    let state = rivalCreated0().state
    const mounted = state.sets.filter(s => s.mountedOn === STAGE && s.status !== 'retired')
    expect(mounted.length).toBeLessThanOrEqual(1)
    if (mounted[0]) state = act(state, { kind: 'strikeSet', setId: mounted[0].id })
    state = act(state, { kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } })
    state = rivalTo(state, 8)
    expect(state.sets.some(s => s.mountedOn === STAGE && s.status === 'standing')).toBe(true)
    state = act(state, { kind: 'activateScriptDevelopment' })
    const script = rivalScript(state, 'c-00', 8); state = script.state
    const made = greenlight(state, script.projectId, RIVAL.focus); state = made.state
    const start = rivalCalls, history = person(state, RIVAL.focus).workHistory.directing
    let recipe = false, take: FirstTakeReceipt | undefined
    for (let n = 0; n < 40; n++) {
      let workflow = state.operations.workflows.find(w => w.productionId === made.productionId)
      if (workflow?.phase === 'rehearsal' && !recipe) {
        state = act(state, { kind: 'setProductionSetupRecipe', productionId: made.productionId,
          recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: workflow.planRevision }); recipe = true
      }
      const production = state.studio.activeProductions.find(p => p.id === made.productionId); assert.ok(production)
      workflow = state.operations.workflows.find(w => w.productionId === made.productionId)
      if (workflow?.shootingTask?.status === 'unassigned')
        state = act(state, { kind: 'assignShootingDirector', productionId: made.productionId, directorId: RIVAL.focus })
      if (state.operations.workflows.find(w => w.productionId === made.productionId)?.shootingTask?.status === 'ready')
        state = act(state, { kind: 'scheduleShootingTake', productionId: made.productionId })
      if (production.remainingTicks === 1) state = act(state, { kind: 'commitPictureToRelease', productionId: made.productionId })
      const before = state; state = rivalStep(state)
      const takes = state.firstTakes.filter(t => t.productionId === made.productionId && t.studioId === issuer(state))
      if (!take && takes.length) {
        expect(takes).toHaveLength(1); take = takes[0]!
        expect(before.studio.activeProductions.find(p => p.id === made.productionId)?.remainingTicks).toBe(5)
        expect(state.studio.activeProductions.find(p => p.id === made.productionId)?.remainingTicks).toBe(4)
        expect(take).toMatchObject({ directorId: RIVAL.focus, week: state.market.tick }); admitted(state)
      }
      const released = state.studio.releasedFilms.find(f => f.productionId === made.productionId)
      if (released) {
        assert.ok(take, 'actual player directing take before real release')
        expect(released.participants).toMatchObject({ director: { talentId: RIVAL.focus }, writer: { talentId: WRITER } })
        expect(person(state, RIVAL.focus).role).toBe('actor')
        expect(person(state, RIVAL.focus).workHistory.directing).toBe(history + 1)
        // Player films retain their authoritative participants in releasedFilms;
        // Hollywood.films is the separate rival film corpus, not a second mirror.
        expect(released.productionId).toBe(take.productionId)
        admitted(state)
        return { state, productionId: made.productionId, take, filmCalls: rivalCalls - start,
          releaseWeek: released.releaseTick, returnedReleaseWeek: state.market.tick }
      }
    }
    throw new Error('fixture premise: rival bootstrap film failed its fixed40-call release bound')
  })
}
export function rivalAuthoring196() {
  return memo('rivalAuthoring196', () => {
    const credit = rivalCredit(); let state = rivalTo(credit.state, 191)
    admitted(state)
    // 1167: fixed five-script arrangement replaces four idle weeks and the old
    // single commission. These ten public actions pay their real costs; no rescue.
    const projectIds: string[] = []
    for (const [index, conceptId] of ['c-01', 'c-02', 'c-03', 'c-04', 'c-05'].entries()) {
      const script = rivalScript(state, conceptId, 191 + index)
      state = script.state; projectIds.push(script.projectId)
    }
    expect(new Set(projectIds).size).toBe(5)
    for (const id of projectIds) expect(state.scriptDevelopment.projects.find(p => p.id === id))
      .toMatchObject({ status: 'ready', productionId: null, writerId: WRITER })
    for (const id of [RIVAL.vacancy, RIVAL.focus]) {
      const view = core.caseForTalent(state, id); assert.ok(view)
      expect(view).toMatchObject({ talentId: id, status: 'discovered', openedWeek: 196, decisionWeek: 208 })
      const stored = state.talentMarket.cases.filter(c => c.talentId === id && c.contractId === view.contractId
        && c.openedWeek === view.openedWeek && c.subjectStudioId === view.subjectStudioId)
      expect(stored).toHaveLength(1)
      expect(stored[0]).toMatchObject({ variant: 'expiry', outcome: null })
      expect(core.retirementRecordFor(state, id)).toBeUndefined()
    }
    expect(core.publicPreferredTerm(state, RIVAL.vacancy)).toBe(208)
    expect(marketOwner.publicPreferredOpportunity(state, RIVAL.vacancy)).toBe('anyCastAppearance')
    expect(marketOwner.publicPreferredOpportunity(state, RIVAL.focus)).toBe('anyCastAppearance')
    const targetEmployment = state.hollywood!.employment.find(e => e.terms.talentId === RIVAL.vacancy
      && e.studioId === RIVAL.studio && e.endedWeek === null)
    expect(targetEmployment?.terms.endWeekExclusive).toBe(208)
    const trust = state.hollywood!.employment.find(e => e.terms.talentId === RIVAL.trust && e.studioId === issuer(state))
    expect(trust).toMatchObject({ endedWeek: 52, terms: { startWeek: 0, endWeekExclusive: 52 } })
    expect(promiseOwner.trustDrivers(state, RIVAL.trust, issuer(state), 196))
      .toContainEqual(expect.objectContaining({ kind: 'ranToEnd', week: 52, positive: true }))
    expect(promiseOwner.trustDescriptor(state, RIVAL.vacancy, issuer(state), 196).label).toBe('Reliable')
    const automatic = state.talentMarket.proposals.find(p => p.talentId === RIVAL.focus && p.issuerStudioId === RIVAL.studio)
    assert.ok(automatic, 'fixture premise: real automatic r01 proposal for focus exists at196')
    expect(automatic).toMatchObject({ submittedWeek: 196, startWeek: 208, termWeeks: 208 })
    const authoring = rivalCandidateCalls.filter(c => c.personId === RIVAL.focus)
    assert.ok(authoring.length > 0, 'fixture premise: actual automatic candidate calls observed at196')
    const order = state.talentMarket.cases.filter(c => c.openedWeek === 196 && c.outcome === null).map(c => c.talentId)
    expect(order.indexOf(RIVAL.vacancy)).toBeGreaterThanOrEqual(0)
    expect(order.indexOf(RIVAL.focus)).toBeGreaterThan(order.indexOf(RIVAL.vacancy))
    admitted(state)
    return { state, credit, projectIds, automatic: clone(automatic),
      calls: clone(rivalCandidateCalls), ordinaryPackage: clone(rivalPackageCalls.find(p => p.week < 208)) }
  })
}
export function rivalWinner208() {
  return memo('rivalWinner208', () => {
    const input = rivalAuthoring196(); let state = input.state
    const price = core.proposalDraft(state, issuer(state), RIVAL.vacancy, 208, 1.25, 196)
    expect(price.startWeek).toBe(208); expect(state.studio.cash).toBeGreaterThanOrEqual(price.signingBonus)
    state = core.submitProposal(state, { talentId: RIVAL.vacancy, issuerStudioId: issuer(state), termWeeks: 208, premiumTier: 1.25 })
    const draft: PromiseDraft = { family: 'APPEARANCE_COUNT', predicate: { count: 1 },
      issuerStudioId: issuer(state), beneficiaryPersonId: RIVAL.vacancy, startWeek: 208, termWeeks: 208,
      windowStartWeek: 208, dueWeekExclusive: 416 }
    const inputFacts = rivalQuoteFacts(state, draft, state.market.tick)
    const receipt = quote(state, draft)
    console.info('1164-P3-PLAYER-QUOTE ' + JSON.stringify({ inputFacts, receipt }))
    expect(receipt).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null })
    state = core.attachPromise(state, RIVAL.vacancy, issuer(state), draft)
    const vacancyPromiseId = state.promises.at(-1)!.promiseId
    expect(state.talentMarket.proposals.find(p => p.talentId === RIVAL.focus && p.issuerStudioId === issuer(state))).toBeUndefined()
    admitted(state); state = rivalTo(state, 208); admitted(state)
    const vacantWinner = state.talentMarket.receipts.filter(r => r.kind === 'settled' && r.week === 208 && r.talentId === RIVAL.vacancy)
    expect(vacantWinner, 'fixture premise: fixed vacancy bid really wins for the player').toEqual([
      expect.objectContaining({ studioId: issuer(state) }),
    ])
    const playerContract = activeContract(state, RIVAL.vacancy); assert.ok(playerContract)
    expect(playerContract).toMatchObject({ startWeek: 208, endWeekExclusive: 416, termWeeks: 208 })
    expect(state.ledger.filter(r => r.kind === 'signingBonus' && r.week === 208 && r.talentId === RIVAL.vacancy))
      .toEqual([expect.objectContaining({ amount: -playerContract.signingBonus })])
    expect(state.promises.find(p => p.promiseId === vacancyPromiseId)?.contractId).not.toBeNull()
    const focusWinner = state.talentMarket.receipts.filter(r => r.kind === 'settled' && r.week === 208 && r.talentId === RIVAL.focus)
    expect(focusWinner, 'fixture premise: the same fixed rival really wins the later focus case').toEqual([
      expect.objectContaining({ studioId: RIVAL.studio }),
    ])
    expect(state.talentMarket.receipts.indexOf(vacantWinner[0]!)).toBeLessThan(state.talentMarket.receipts.indexOf(focusWinner[0]!))
    const employment = state.hollywood!.employment.filter(e => e.studioId === RIVAL.studio && e.terms.talentId === RIVAL.focus
      && e.terms.startWeek === 208)
    expect(employment).toHaveLength(1)
    expect(employment[0]).toMatchObject({ endedWeek: null, reason: 'replacement', terms: { termWeeks: 208, endWeekExclusive: 416 } })
    expect(employment[0]!.terms.signingBonus).toBe(Math.round(employment[0]!.terms.annualSalary * 0.18))
    assert.ok(rivalMarketPass, 'actual market owner208 before/after accounting observation')
    expect(rivalMarketPass.week).toBe(208)
    expect(rivalMarketPass.addedEmployment).toContainEqual(employment[0])
    const totalBonuses = rivalMarketPass.addedEmployment.reduce((sum, e) => sum + e.terms.signingBonus, 0)
    expect(rivalMarketPass.afterSigning - rivalMarketPass.beforeSigning).toBeCloseTo(-totalBonuses, 7)
    expect(rivalMarketPass.afterCash - rivalMarketPass.beforeCash)
      .toBeCloseTo(rivalMarketPass.afterMovements - rivalMarketPass.beforeMovements, 7)
    for (const e of rivalMarketPass.addedEmployment)
      expect(rivalMarketPass.addedReceipts.filter(r => r.kind === 'employment' && r.contractId === e.contractId
        && r.toStudioId === RIVAL.studio)).toEqual([expect.objectContaining({ week: 208, talentId: e.terms.talentId })])
    expect(rivalFreezeSeats.length, 'real subject freeze state before the rival commit').toBeGreaterThan(0)
    for (const snapshot of rivalFreezeSeats) {
      expect(snapshot.week).toBe(208); expect(snapshot.heldActors).toHaveLength(2)
      expect(snapshot.heldActors).not.toContain(RIVAL.focus); expect(snapshot.heldActors).not.toContain(RIVAL.vacancy)
    }
    const bound = state.promises.filter(p => p.beneficiaryPersonId === RIVAL.focus && p.issuerStudioId === RIVAL.studio
      && p.contractId === employment[0]!.contractId)
    expect(bound, 'fixture premise: actual automatic promise binds with the winning employment').toHaveLength(1)
    expect(input.automatic.promises).toContain(bound[0]!.promiseId)
    expect(state.talentMarket.proposals.filter(p => p.talentId === RIVAL.focus || p.talentId === RIVAL.vacancy)).toEqual([])
    // Expected Director predicate/outcome is deliberately left to the leaves.
    return { ...input, state, promiseId: bound[0]!.promiseId, employment: employment[0]!, vacancyPromiseId,
      marketPass: clone(rivalMarketPass), freezeSeats: clone(rivalFreezeSeats) }
  })
}
export function rivalFinal260() {
  return memo('rivalFinal260', () => {
    const input = rivalWinner208(); let state = input.state
    let seated: { state: GameState; productionId: string; workWeek: number; crew: string[];
      ordinaryDirector: string; eligibleActors: string[]; castPrefix: string[]; packageCall: RivalPackageCall } | undefined
    while (state.market.tick < 260) {
      const before = state, old = new Set(rivalBusiness(before).productions.map(p => p.id))
      state = rivalStep(state)
      const newFocused = rivalBusiness(state).productions.find(p => !old.has(p.id) && p.directorId === RIVAL.focus)
      if (newFocused && !seated) {
        const week = newFocused.startTick
        expect(week).toBe(before.market.tick)
        const employees = before.hollywood!.activeEmploymentOrdinals.map(i => before.hollywood!.employment[i]!)
          .filter(e => e.studioId === RIVAL.studio && e.terms.startWeek <= week
            && week < (e.endedWeek ?? e.terms.endWeekExclusive))
        const busy = busyTalentIds(before)
        const ordinaryDirector = employees.map(e => person(before, e.terms.talentId))
          .find(t => t.role === 'director' && !busy.has(t.id)
            && lifecycleOwner.assignmentRefusal(before, t.id, week, 'director') === null)
        assert.ok(ordinaryDirector, 'actual displaced ordinary Director exists at work week')
        const slots = [newFocused.cast.lead, newFocused.cast.antagonist, newFocused.cast.support]
        const crew = [newFocused.writerId, newFocused.directorId, ...newFocused.craftIds, ...slots]
        expect(new Set(crew).size).toBe(crew.length)
        for (const id of crew) expect(employees.some(e => e.terms.talentId === id)).toBe(true)
        // Writer credit itself is not an occupied production seat.
        for (const id of [newFocused.directorId, ...newFocused.craftIds, ...slots]) expect(busy.has(id)).toBe(false)
        expect(lifecycleOwner.assignmentRefusal(before, RIVAL.focus, week, 'director')).toBeNull()
        for (const id of slots) {
          expect(person(before, id).skills.acting).toBeDefined()
          expect(lifecycleOwner.assignmentRefusal(before, id, week, 'actor')).toBeNull()
        }
        const eligibleActors = employees.map(e => person(before, e.terms.talentId))
          .filter(t => t.role === 'actor' && t.id !== RIVAL.focus && !busy.has(t.id)
            && ![newFocused.writerId, ...newFocused.craftIds].includes(t.id)
            && lifecycleOwner.assignmentRefusal(before, t.id, week, 'actor') === null).map(t => t.id)
        const masks = promiseOwner.promisedCastMasks(before, RIVAL.studio, week + promiseOwner.WEEKS_TO_FIRST_TAKE)
        const excluded = new Set([newFocused.writerId, newFocused.directorId, ...newFocused.craftIds])
        const promised = employees.map(e => person(before, e.terms.talentId)).filter(t => masks.has(t.id)
          && !excluded.has(t.id) && !busy.has(t.id) && t.skills.acting !== undefined
          && lifecycleOwner.assignmentRefusal(before, t.id, week, 'actor') === null).map(t => t.id)
        const castPrefix = [...promised, ...eligibleActors.filter(id => !promised.includes(id))].slice(0, 3)
        const packageCall = rivalPackageCalls.find(p => p.week === week && p.director === RIVAL.focus
          && p.conceptId === newFocused.conceptId && p.chosenCast !== null)
        assert.ok(packageCall, 'actual public package call observed before chosen rival work')
        const project = rivalBusiness(state).development.projects.find(p => p.productionId === newFocused.id)
        assert.ok(project, 'actual managed rival screenplay linked to production')
        expect(project.writerId).toBe(newFocused.writerId)
        admitted(state)
        seated = { state: clone(state), productionId: newFocused.id, workWeek: week, crew,
          ordinaryDirector: ordinaryDirector.id, eligibleActors, castPrefix, packageCall: clone(packageCall) }
      }
    }
    admitted(state)
    const takes = state.firstTakes.filter(t => t.productionId === seated?.productionId && t.studioId === RIVAL.studio)
    const released = state.hollywood!.films.find(f => f.filmId === seated?.productionId && f.studioId === RIVAL.studio)
    // Absence of intended Director work is observable policy behavior, not a
    // failed cache prerequisite. Leaves own the seat/take/release expectations.
    return { ...input, state, seated, takes, released, packages: clone(rivalPackageCalls) }
  })
}
