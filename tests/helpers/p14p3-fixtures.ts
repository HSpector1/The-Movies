// Independent 1121/1132/1142 P3 fixtures. Cached player route <=208 actual
// develop:true ticks plus three <=64-call branches, aggregate <=400. No rescue.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect, vi } from 'vitest'
import * as core from '../../src/core/index.js'
import * as promiseOwner from '../../src/core/promises.js'
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
