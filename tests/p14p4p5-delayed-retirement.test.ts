// 1281-A/B: fixed45→104 continuation; no old helper/prefix evaluation or future arrival.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import * as tickOwner from '../src/core/tick.js'
import * as promiseOwner from '../src/core/promises.js'
import * as opportunityOwner from '../src/core/opportunityPromises.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import type { PromiseAttachment, PromiseDraft } from '../src/core/promises.js'
import type { Action, FirstTakeReceipt, FirstTakeSubject, GameState, ProfessionalPromise, PromiseFeasibilityReceipt } from '../src/core/types.js'

const E = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
const FOCUS = 'authored-0006', WRITER = 'authored-0003', DIRECTOR = 'authored-0002', CRAFT = 'authored-0004'
const CAST = { lead: FOCUS, antagonist: 'authored-0001', support: 'authored-0005' }
const HARD_ADVANCES = 59, TIMEOUT = 180_000
const clone = <T>(value: T): T => structuredClone(value)
const stable = saves.stableStringify
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const emit = (kind: string, value: unknown): void => console.info(`1281-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { attempted: 0, reserved: 0, invoked: 0, completed: 0, outside: 0,
  mutationAttempts: 0, mutationsAccepted: 0, explicitQuotes: 0, returnedQuotes: 0, priceReads: 0, settlementObservations: 0 }
const operations: { week: number; kind: string; request: unknown; accepted: boolean }[] = []
const cache = new Map<string, { ok: true; value: unknown } | { ok: false; error: unknown }>()
let permit: { from: number; used: boolean } | undefined
let restoreTick: (() => void) | undefined
let oldTakes: GameState['firstTakes'] = []
let promiseId = '', productionId = ''
const expectedSuffix: { receipt: FirstTakeReceipt; subject: FirstTakeSubject }[] = []
const trace: unknown[] = []
beforeAll(() => {
  const actual = tickOwner.tick
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation((state, options) => {
    count.attempted++
    if (!permit) { count.outside++; throw new Error('1281: no tick outside the one Q21 route') }
    assert.equal(permit.used, false); permit.used = true
    assert.ok(count.attempted <= HARD_ADVANCES && count.reserved < HARD_ADVANCES, 'hard59 before invocation')
    assert.equal(state.market.tick, permit.from); assert.equal(permit.from, 45 + count.reserved)
    expect(options).toEqual({ develop: true })
    count.reserved++; count.invoked++
    const next = actual(state, options)
    expect(next.market.tick).toBe(state.market.tick + 1); count.completed++
    return next
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: HARD_ADVANCES, hardMutations: 5, hardExplicitQuotes: 4,
    oldHelpersImported: false, capturePrefixAdvances: 0, operations, trace,
    phases: [...cache].map(([name, row]) => ({ name, complete: row.ok })) })
  expect(count.outside).toBe(0); expect(count.attempted).toBeLessThanOrEqual(HARD_ADVANCES)
})
function memo<T>(name: string, build: () => T): T {
  const old = cache.get(name)
  if (old) { if (!old.ok) throw old.error; return clone(old.value as T) }
  try { const value = build(); cache.set(name, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(name, { ok: false, error }); throw error }
}
function admitted(state: GameState): void {
  const before = stable(state), save = saves.makeSave(state)
  expect(save.saveVersion).toBe(40); expect(saves.validateSaveV40(save)).toBe(save)
  const raw = saves.exportSave(save)
  expect(saves.exportSave(saves.importSave(raw))).toBe(raw); expect(stable(state)).toBe(before)
}
function suffix(state: GameState): void {
  expect(state.firstTakes.slice(0, oldTakes.length)).toEqual(oldTakes)
  expect(state.firstTakes.slice(oldTakes.length)).toEqual(expectedSuffix.map(row => row.receipt))
  expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 19, facts: expectedSuffix.map(row => row.subject) })
}
function owners(state: GameState) {
  return [{ studioId: issuer(state), productions: state.studio.activeProductions, development: state.scriptDevelopment,
    concepts: state.concepts, workflows: state.operations.workflows }, ...state.hollywood!.businesses.map(row => ({ studioId: row.studioId,
    productions: row.productions, development: row.development, concepts: state.hollywood!.concepts, workflows: row.operations.workflows }))]
}
function takeOwners(state: GameState) {
  return owners(state).flatMap(owner => owner.productions.map(production => ({ studioId: owner.studioId, production,
    concept: owner.concepts.find(row => row.id === production.conceptId), mode: owner.development.mode,
    projects: owner.development.projects.filter(row => row.productionId === production.id) })))
}
function advance(state: GameState): GameState {
  assert.equal(permit, undefined)
  const before = bytes(state), priorTakes = clone(state.firstTakes), beforeOwners = takeOwners(state)
  permit = { from: state.market.tick, used: false }
  let next: GameState
  try { next = tickOwner.tick(clone(state), { develop: true }) } finally { permit = undefined }
  expect(bytes(state)).toBe(before); expect(next.firstTakes.slice(0, priorTakes.length)).toEqual(priorTakes)
  const afterOwners = takeOwners(next)
  const added = next.firstTakes.slice(priorTakes.length).map(receipt => {
    const owner = beforeOwners.find(row => row.studioId === receipt.studioId && row.production.id === receipt.productionId)
      ?? afterOwners.find(row => row.studioId === receipt.studioId && row.production.id === receipt.productionId)
    assert.ok(owner?.concept, 'actual new receipt must join a direct owner/concept')
    expect(owner.production.directorId).toBe(receipt.directorId); expect(owner.production.cast).toEqual(receipt.cast)
    expect(owner.projects.length).toBeLessThanOrEqual(1)
    if (owner.mode === 'managed') expect(owner.projects).toHaveLength(1)
    for (const row of owner.projects) expect(row.conceptId).toBe(owner.concept.id)
    const subject: FirstTakeSubject = { eventId: receipt.eventId, conceptId: owner.concept.id,
      genre: owner.concept.genre, scriptProjectId: owner.projects[0]?.id ?? null }
    expectedSuffix.push({ receipt: clone(receipt), subject })
    return { receipt: clone(receipt), subject, owner: clone(owner) }
  })
  admitted(next); suffix(next)
  const held = productionId === '' ? null : next.studio.activeProductions.find(row => row.id === productionId) ?? null
  const row = { from: state.market.tick, to: next.market.tick, develop: true, added, firstTakeSubjects: clone(next.firstTakeSubjects),
    focus: next.talent.find(row => row.id === FOCUS), retirement: core.retirementRecordFor(next, FOCUS, 'actor') ?? null,
    held, storedPromise: promiseId === '' ? null : root(next, promiseId), currentStateSha256: sha(bytes(next)) }
  trace.push(row); emit('ADVANCE', row); return next
}
function root(state: GameState, id = promiseId): ProfessionalPromise {
  const rows = state.promises.filter(row => row.promiseId === id); expect(rows).toHaveLength(1); return rows[0]!
}
function proposal(state: GameState) {
  const rows = state.talentMarket.proposals.filter(row => row.talentId === FOCUS && row.issuerStudioId === issuer(state))
  expect(rows).toHaveLength(1); return rows[0]!
}
function production(state: GameState) {
  const rows = state.studio.activeProductions.filter(row => row.id === productionId); expect(rows).toHaveLength(1); return rows[0]!
}
function workflow(state: GameState) {
  const rows = state.operations.workflows.filter(row => row.productionId === productionId); expect(rows).toHaveLength(1); return rows[0]!
}
function focus(state: GameState, expectedAge: number) {
  const talent = state.talent.find(row => row.id === FOCUS); assert.ok(talent?.skills.acting)
  expect(talent).toMatchObject({ role: 'actor', age: expectedAge })
  const provenance = state.talentProvenance.rows.find(row => row.personId === FOCUS); assert.ok(provenance)
  expect(provenance).toEqual({ personId: FOCUS, kind: 'authored_exact_week', ageAtEntry: 68, entryWeek: 0 })
  expect(core.ageAt(provenance, state.market.tick)).toBe(expectedAge)
  return { talent, provenance }
}
function input45(): GameState {
  return memo('genuine45', () => {
    const manifestBytes = readFileSync(new URL('1171-p3-current45-capture/MANIFEST.json', E))
    expect(manifestBytes.length).toBe(11550); expect(sha(manifestBytes)).toBe('a261fc3177527d05d5a8daf624de7af015df8c9a8fedd3e11b37fe1597a2f4b6')
    const manifest = JSON.parse(manifestBytes.toString('utf8'))
    const zipped = readFileSync(new URL('1171-p3-current45-capture/genuine-v39-p3-market-week45.json.gz', E))
    expect(zipped.length).toBe(86995); expect(sha(zipped)).toBe('12799a849b0b4aff49cd9707ea8c1b87c64b4e787ff261b2e9cf4b109a953117')
    const raw = gunzipSync(zipped).toString('utf8')
    expect(Buffer.byteLength(raw)).toBe(751294); expect(sha(raw)).toBe('e7401f2578a7ad151383ca905df4253c2bbd82d6823c406c28b7e76aa809c5af')
    expect(manifest.output).toEqual({ filename: 'genuine-v39-p3-market-week45.json.gz', saveVersion: 39, week: 45,
      raw: { bytes: Buffer.byteLength(raw), sha256: sha(raw) }, gzip: { bytes: zipped.length, sha256: sha(zipped) } })
    const parsed: unknown = JSON.parse(raw), old = saves.validateSaveV39(parsed), frozen = stable(old)
    expect(old).toBe(parsed); expect(saves.exportSave(old)).toBe(raw)
    const state = saves.migrateToLive(old).state
    expect(stable(old)).toBe(frozen); expect(state).toEqual({ ...old.state, firstTakeSubjects: { version: 1, cutoverOrdinal: 19, facts: [] } })
    oldTakes = clone(old.state.firstTakes); expect(oldTakes).toHaveLength(19); admitted(state); suffix(state)
    expect(state.market.tick).toBe(45); expect(state.studio.cash).toBe(24701506); expect(state.promises).toEqual([])
    expect(state.talentMarket.proposals).toEqual([]); expect(state.studio.activeProductions).toEqual([])
    expect(state.productionQueue).toEqual([]); expect(state.operations.mode).toBe('managed')
    expect(state.scriptDevelopment.mode).toBe('managed'); expect(state.scriptDevelopment.projects).toHaveLength(2)
    for (const [id, conceptId, genre] of [['script-0000', 'c-00', 'drama'], ['script-0001', 'c-01', 'crime']] as const) {
      const project = state.scriptDevelopment.projects.find(row => row.id === id); assert.ok(project?.assessment)
      expect(project).toMatchObject({ conceptId, writerId: WRITER, status: 'ready', productionId: null, reservation: null, dueWeek: null })
      expect(state.concepts.find(row => row.id === conceptId)?.genre).toBe(genre)
    }
    const person = focus(state, 68); expect(core.retirementRecordFor(state, FOCUS)).toBeUndefined()
    expect(core.retirementRecordFor(state, FOCUS, 'actor')).toBeUndefined(); expect(core.assignmentRefusal(state, FOCUS, 45, 'actor')).toBeNull()
    const contract = activeContract(state, FOCUS); assert.ok(contract)
    expect(contract).toMatchObject({ startWeek: 0, endWeekExclusive: 52, termWeeks: 52 })
    expect(core.caseForTalent(state, FOCUS)).toMatchObject({ openedWeek: 40, decisionWeek: 52 })
    const marketCase = state.talentMarket.cases.find(row => row.talentId === FOCUS && row.openedWeek === 40); assert.ok(marketCase)
    expect(marketCase).toMatchObject({ variant: 'expiry', subjectStudioId: issuer(state), closedWeek: null, outcome: null })
    const employment = state.hollywood!.employment.find(row => row.contractId === marketCase.contractId); assert.ok(employment)
    expect(employment.terms).toEqual(contract); expect(employment.endedWeek).toBeNull()
    emit('INPUT', { manifest, person, contract, employment, marketCase, ready: state.scriptDevelopment.projects,
      oldTakes, firstTakeSubjects: state.firstTakeSubjects, cash: state.studio.cash })
    return state
  })
}
function membership(state: GameState, request: PromiseDraft, week = state.market.tick) {
  const from = Math.max(week, request.windowStartWeek), attached = [...new Set(state.talentMarket.proposals.flatMap(row => row.promises))]
  const rows = state.promises.map(row => {
    const remaining = row.predicate.count - row.progress, open = row.outcome === null, unmet = remaining > 0,
      boundOrAttached = row.contractId !== null || attached.includes(row.promiseId), notSelf = row.promiseId !== request.promiseId,
      overlap = row.dueWeekExclusive > from && row.windowStartWeek < request.dueWeekExclusive,
      issuerOrPerson = row.issuerStudioId === request.issuerStudioId || row.beneficiaryPersonId === request.beneficiaryPersonId
    return { promiseId: row.promiseId, remaining, open, unmet, boundOrAttached, notSelf, overlap, issuerOrPerson,
      selected: open && unmet && boundOrAttached && notSelf && overlap && issuerOrPerson }
  })
  const ids = rows.filter(row => row.selected).map(row => row.promiseId)
  return { from, rows, selected: state.promises.filter(row => ids.includes(row.promiseId)), attached,
    rawRoots: clone(state.promises), proposals: clone(state.talentMarket.proposals) }
}
function quote(state: GameState, request: PromiseDraft, name: string, expectedSelected: readonly string[], facts: unknown) {
  assert.ok(count.explicitQuotes < 4, 'only four explicit feasibility previews')
  const before = bytes(state), argument = stable(request), rng = clone(state.rngState), census = membership(state, request)
  expect(census.selected.map(row => row.promiseId)).toEqual(expectedSelected)
  const spy = vi.spyOn(opportunityOwner, 'opportunityReservations')
  let receipt: PromiseFeasibilityReceipt, selected: unknown
  try {
    count.explicitQuotes++; receipt = core.promiseFeasibility(state, request, state.market.tick); count.returnedQuotes++
    expect(spy.mock.calls).toHaveLength(1)
    const args = spy.mock.calls[0]!, result = spy.mock.results[0]!
    expect(args[0]).toBe(state); expect(args[1]).toBe(request); expect(args[2]).toBe(census.from)
    expect(result.type).toBe('return'); selected = clone(result.value)
  } finally { spy.mockRestore() }
  emit('QUOTE', { name, actualWeek: state.market.tick, request, receipt, census, actualSelection: selected, facts,
    stateBytes: Buffer.byteLength(before), stateSha256: sha(before), requestBytes: argument, rng })
  expect(selected).toEqual(census.selected); expect(bytes(state)).toBe(before); expect(stable(request)).toBe(argument)
  expect(state.rngState).toEqual(rng); expect(receipt).toMatchObject({ rulesVersion: 7, week: state.market.tick })
  return receipt
}
function ra(receipt: PromiseFeasibilityReceipt): void { expect(receipt).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null }) }
function genreDraft(state: GameState, windowStartWeek = 52, id?: string): PromiseDraft {
  return { family: 'PREFERRED_GENRE_OPPORTUNITY', issuerStudioId: issuer(state), beneficiaryPersonId: FOCUS,
    predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'drama' },
    startWeek: 52, termWeeks: 104, windowStartWeek, dueWeekExclusive: 156, ...(id === undefined ? {} : { promiseId: id }) }
}
function mutation(state: GameState, kind: string, request: unknown, apply: () => GameState, verify: (next: GameState) => void): GameState {
  assert.ok(count.mutationAttempts < 5, 'five fixed public mutations only')
  const before = bytes(state), argument = stable(request), row = { week: state.market.tick, kind, request: clone(request), accepted: false }
  count.mutationAttempts++; operations.push(row); emit('MUTATION-ATTEMPT', row)
  const next = apply(); expect(bytes(state)).toBe(before); expect(stable(request)).toBe(argument)
  expect(next.market.tick).toBe(state.market.tick); admitted(next); suffix(next)
  expect(next.productionQueue).toEqual(state.productionQueue); verify(next)
  count.mutationsAccepted++; row.accepted = true
  emit('MUTATION-ACCEPTED', { ...row, stateBytes: Buffer.byteLength(bytes(next)), stateSha256: sha(bytes(next)) })
  return next
}
type Attached = { state: GameState; attachedRoot: ProfessionalPromise }
function attached45(): Attached {
  return memo('attached45', () => {
    const base = input45(), before = bytes(base)
    count.priceReads++; const price = core.proposalDraft(base, issuer(base), FOCUS, 104, 1.25, 45)
    expect(bytes(base)).toBe(before); expect(base.studio.cash).toBeGreaterThanOrEqual(price.signingBonus)
    const submit = { talentId: FOCUS, issuerStudioId: issuer(base), termWeeks: 104 as const, premiumTier: 1.25 as const }
    let state = mutation(base, 'submitProposal', submit, () => core.submitProposal(clone(base), clone(submit)), next => {
      expect(proposal(next)).toMatchObject({ talentId: FOCUS, issuerStudioId: issuer(next), submittedWeek: 45,
        startWeek: 52, termWeeks: 104, premiumTier: 1.25, annualSalary: price.annualSalary, signingBonus: price.signingBonus,
        digest: price.digest, promises: [] })
    })
    const request = genreDraft(state), preview = quote(state, request, 'attachment45', [], { price, actualContract: activeContract(state, FOCUS) })
    ra(preview)
    const attachment: PromiseAttachment = { family: request.family, predicate: clone(request.predicate),
      windowStartWeek: request.windowStartWeek, dueWeekExclusive: request.dueWeekExclusive }
    const proposed = state
    state = mutation(proposed, 'attachPromise', attachment,
      () => core.attachPromise(clone(proposed), FOCUS, issuer(proposed), clone(attachment)), next => {
        expect(proposal(next).promises).toHaveLength(1); promiseId = proposal(next).promises[0]!
        expect(root(next)).toMatchObject({ version: 7, family: request.family, predicate: request.predicate,
          issuerStudioId: issuer(next), beneficiaryPersonId: FOCUS, contractId: null, windowStartWeek: 52,
          dueWeekExclusive: 156, progress: 0, evidenceRefs: [], outcome: null, feasibilityReceipt: preview })
      })
    emit('ATTACHED45', { price, proposal: proposal(state), root: root(state) })
    return { state, attachedRoot: clone(root(state)) }
  })
}
type Bound = Attached & { boundRoot: ProfessionalPromise; contractId: string }
function bound52(): Bound {
  return memo('bound52', () => {
    const input = attached45()
    let state = input.state
    while (state.market.tick < 51) { state = advance(state); expect(root(state)).toEqual(input.attachedRoot) }
    const actual = promiseOwner.promiseFeasibility
    const observations: { receipt: PromiseFeasibilityReceipt; request: PromiseDraft; root: ProfessionalPromise;
      beforeStateSha256: string; afterStateSha256: string; price: ReturnType<typeof core.proposalDraft> | null }[] = []
    const spy = vi.spyOn(promiseOwner, 'promiseFeasibility').mockImplementation((current, request, week) => {
      if (week !== 52 || request.promiseId !== promiseId || request.issuerStudioId !== issuer(current)
        || request.beneficiaryPersonId !== FOCUS) return actual(current, request, week)
      const before = stable(current), argument = stable(request), rng = clone(current.rngState)
      const carried = proposal(current)
      let price: ReturnType<typeof core.proposalDraft> | null = null
      if (observations.length === 0) {
        count.priceReads++
        price = core.proposalDraft(current, issuer(current), FOCUS, 104, 1.25, week,
          promiseOwner.attachedPromiseDigest(current, carried.promises))
        expect(price.digest).toBe(carried.digest); expect(current.studio.cash).toBeGreaterThanOrEqual(price.signingBonus)
      }
      count.settlementObservations++
      const receipt = actual(current, request, week)
      expect(stable(current)).toBe(before); expect(stable(request)).toBe(argument); expect(current.rngState).toEqual(rng)
      const row = { receipt: clone(receipt), request: clone(request), root: clone(root(current)),
        beforeStateSha256: sha(before), afterStateSha256: sha(stable(current)), price: clone(price) }
      observations.push(row); emit('PRECOMMIT52', row); return receipt
    })
    try { state = advance(state) } finally { spy.mockRestore() }
    expect(state.market.tick).toBe(52); expect(count.completed).toBe(7); focus(state, 69)
    expect(core.retirementRecordFor(state, FOCUS, 'actor')).toBeUndefined()
    const settled = state.talentMarket.receipts.filter(row => row.kind === 'settled' && row.week === 52 && row.talentId === FOCUS)
    assert.ok(settled.some(row => row.studioId === issuer(state)), `real player win prerequisite: ${JSON.stringify(settled)}`)
    const contract = activeContract(state, FOCUS); assert.ok(contract)
    expect(contract).toMatchObject({ talentId: FOCUS, startWeek: 52, endWeekExclusive: 156, termWeeks: 104 })
    const employed = state.hollywood!.employment.filter(row => row.studioId === issuer(state) && row.terms.talentId === FOCUS
      && row.terms.startWeek === 52 && row.terms.endWeekExclusive === 156 && row.endedWeek === null)
    expect(employed).toHaveLength(1); expect(employed[0]!.terms).toEqual(contract)
    const first = observations[0]; assert.ok(first?.price, 'actual decision-state price/frozen receipt must have been observed')
    ra(first.receipt); expect(first.receipt).toMatchObject({ rulesVersion: 7, week: 52 })
    expect([contract.annualSalary, contract.signingBonus]).toEqual([first.price.annualSalary, first.price.signingBonus])
    const payment = state.ledger.filter(row => row.week === 52 && row.kind === 'signingBonus' && row.talentId === FOCUS)
    expect(payment).toEqual([{ week: 52, kind: 'signingBonus', amount: -first.price.signingBonus,
      talentId: FOCUS, note: 'market settlement signing bonus' }])
    expect(root(state)).toEqual({ ...input.attachedRoot, contractId: employed[0]!.contractId, feasibilityReceipt: first.receipt })
    expect(count.priceReads).toBe(2)
    emit('BOUND52', { settled, contract, employment: employed[0], signingPayment: payment, observations, root: root(state),
      pricingScope: 'first decision-state receipt and price; equal-valued ranking reread is not independently distinguishable if identical' })
    return { ...input, state, boundRoot: clone(root(state)), contractId: employed[0]!.contractId }
  })
}
function act(state: GameState, action: Action, verify: (next: GameState) => void): GameState {
  return mutation(state, action.kind, action, () => core.applyActions(clone(state), [clone(action)]), verify)
}
function greenlit52(): Bound {
  return memo('greenlit52', () => {
    const bound = bound52(), state = bound.state
    const project = state.scriptDevelopment.projects.find(row => row.id === 'script-0000'); assert.ok(project?.assessment)
    expect(project).toMatchObject({ conceptId: 'c-00', status: 'ready', writerId: WRITER, productionId: null, reservation: null })
    const concept = state.concepts.find(row => row.id === project.conceptId); assert.ok(concept); expect(concept.genre).toBe('drama')
    const crew = [WRITER, DIRECTOR, CRAFT, ...Object.values(CAST)].map(id => {
      const talent = state.talent.find(row => row.id === id), contract = activeContract(state, id); assert.ok(talent && contract)
      expect(busyTalentIds(state).has(id)).toBe(false)
      const requested = id === WRITER ? 'writer' : id === DIRECTOR ? 'director' : id === CRAFT ? 'craft' : 'actor'
      expect(core.assignmentRefusal(state, id, 52, requested)).toBeNull()
      expect(contract.endWeekExclusive).toBeGreaterThan(52)
      return { talent, contract, requested }
    })
    const beforeIds = new Set(state.studio.activeProductions.map(row => row.id))
    const next = act(state, { kind: 'greenlightScriptProject', production: { projectId: project.id,
      directorId: DIRECTOR, craftIds: [CRAFT], cast: CAST, budget: { negative: concept.baseNegativeCost, marketing: 0 } } }, value => {
      const added = value.studio.activeProductions.filter(row => !beforeIds.has(row.id)); expect(added).toHaveLength(1)
      productionId = added[0]!.id
      expect(production(value)).toMatchObject({ conceptId: concept.id, writerId: WRITER, directorId: DIRECTOR,
        craftIds: [CRAFT], cast: CAST, startTick: 52, remainingTicks: 8 })
      expect(value.scriptDevelopment.projects.find(row => row.id === project.id))
        .toMatchObject({ status: 'inProduction', productionId })
      workflow(value); expect(root(value)).toEqual(bound.boundRoot)
    })
    emit('GREENLIT52', { crew, concept, production: production(next), workflow: workflow(next), linkedProject: next.scriptDevelopment.projects[0] })
    return { ...bound, state: next }
  })
}
function rehearsal55(): Bound {
  return memo('rehearsal55', () => {
    const input = greenlit52(); let state = input.state
    for (const from of [52, 53, 54]) { expect(state.market.tick).toBe(from); state = advance(state) }
    expect(workflow(state).phase).toBe('rehearsal')
    const revision = workflow(state).planRevision
    state = act(state, { kind: 'setProductionSetupRecipe', productionId,
      recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: revision }, next => {
      expect(workflow(next).setup?.recipeId).toBe('ballroom-reveal-lighting-01')
      expect(root(next)).toEqual(input.boundRoot)
    })
    emit('RECIPE55', { production: production(state), workflow: workflow(state) })
    return { ...input, state }
  })
}
function held(state: GameState): void {
  expect(state.studio.activeProductions).toEqual([production(state)])
  expect(production(state)).toMatchObject({ conceptId: 'c-00', startTick: 52, remainingTicks: 5,
    writerId: WRITER, directorId: DIRECTOR, craftIds: [CRAFT], cast: CAST })
  expect(workflow(state)).toMatchObject({ phase: 'shooting', blocker: null,
    shootingTask: { status: 'unassigned', directorId: DIRECTOR } })
  expect(state.firstTakes.filter(row => row.studioId === issuer(state) && row.productionId === productionId)).toEqual([])
  expect(state.releaseAuthority.commitments).toEqual([])
}
function held104(): Bound {
  return memo('held104', () => {
    const input = rehearsal55(); let state = input.state
    while (state.market.tick < 104) {
      state = advance(state); expect(root(state)).toEqual(input.boundRoot)
      if (state.market.tick >= 60) held(state)
      if (state.market.tick === 60) emit('HELD60', { production: production(state), workflow: workflow(state), root: root(state) })
      if (state.market.tick < 104) expect(core.retirementRecordFor(state, FOCUS, 'actor')).toBeUndefined()
    }
    expect(count.completed).toBe(59); expect(count.mutationsAccepted).toBe(4)
    held(state); admitted(state); suffix(state)
    const person = focus(state, 70), current = core.retirementRecordFor(state, FOCUS), acting = core.retirementRecordFor(state, FOCUS, 'actor')
    expect(current).toEqual(acting); expect(acting).toMatchObject({ personId: FOCUS, profession: 'actor', cause: 'hardBoundary',
      status: 'announced', announcedWeek: 104, ageAtAnnouncement: 70, effectiveWeek: 156, finishingFromWeek: null, retiredWeek: null })
    const contract = activeContract(state, FOCUS); assert.ok(contract)
    expect(contract).toMatchObject({ startWeek: 52, endWeekExclusive: 156, termWeeks: 104 })
    expect(state.hollywood!.employment.find(row => row.contractId === input.contractId))
      .toMatchObject({ studioId: issuer(state), endedWeek: null, terms: contract })
    expect(root(state)).toEqual(input.boundRoot)
    emit('HELD104', { person, currentRetirement: current, actingRetirement: acting, contract,
      production: production(state), workflow: workflow(state), root: root(state), suffix: state.firstTakeSubjects,
      completeNewReceipts: state.firstTakes.slice(19) })
    return { ...input, state }
  })
}
function physical104(state: GameState) {
  expect(state.market.tick).toBe(104); held(state); admitted(state); suffix(state)
  const person = focus(state, 70), p = production(state), w = workflow(state)
  const acting = core.retirementRecordFor(state, FOCUS, 'actor'); assert.ok(acting)
  expect(acting).toMatchObject({ status: 'announced', cause: 'hardBoundary', announcedWeek: 104, effectiveWeek: 156,
    finishingFromWeek: null, retiredWeek: null })
  expect(core.retirementRecordFor(state, FOCUS)).toEqual(acting)
  const contract = activeContract(state, FOCUS); assert.ok(contract)
  expect(contract).toMatchObject({ startWeek: 52, endWeekExclusive: 156, termWeeks: 104 })
  const employment = state.hollywood!.employment.filter(row => row.terms.talentId === FOCUS && row.terms.startWeek <= 104
    && row.terms.endWeekExclusive > 104 && (row.endedWeek === null || row.endedWeek > 104))
  expect(employment).toHaveLength(1); expect(employment[0]!.studioId).toBe(issuer(state)); expect(employment[0]!.terms).toEqual(contract)
  const company = owners(state).flatMap(owner => owner.productions.map(row => ({ studioId: owner.studioId, production: clone(row),
    member: row.directorId === FOCUS || Object.values(row.cast).includes(FOCUS) || row.craftIds.includes(FOCUS), writerCredit: row.writerId === FOCUS })))
  expect(company.filter(row => row.member).map(row => [row.studioId, row.production.id])).toEqual([[issuer(state), productionId]])
  const writing = owners(state).flatMap(owner => owner.development.projects.map(row => ({ studioId: owner.studioId, project: clone(row),
    assigned: (row.status === 'drafting' || row.status === 'rewriting') && row.writerIds.includes(FOCUS) })))
  const research = state.technology.projects.map(row => ({ project: clone(row), assigned: row.status === 'active'
    && row.seats.some(seat => seat.talentId === FOCUS && seat.releasedWeek === null) }))
  expect(writing.filter(row => row.assigned)).toEqual([]); expect(research.filter(row => row.assigned)).toEqual([])
  expect(busyTalentIds(state).has(FOCUS)).toBe(true)
  const target = state.scriptDevelopment.projects.find(row => row.id === 'script-0001'); assert.ok(target?.assessment)
  expect(target).toMatchObject({ conceptId: 'c-01', status: 'ready', writerId: WRITER, reservation: null, dueWeek: null, productionId: null })
  expect(target).toEqual(input45().scriptDevelopment.projects.find(row => row.id === target.id))
  expect(state.concepts.find(row => row.id === target.conceptId)?.genre).toBe('crime')
  expect(state.concepts.find(row => row.id === p.conceptId)?.genre).toBe('drama'); expect(target.writerId).not.toBe(FOCUS)
  expect(state.placement.facilities).toEqual([]); expect(state.technology.projects).toEqual([])
  expect(state.construction.projects).toEqual([]); expect(state.castingSessions.sessions).toEqual([])
  expect(state.productionQueue).toEqual([]); expect(state.scriptDevelopment.projects.every(row => row.reservation === null)).toBe(true)
  for (const set of state.sets) expect(['standing', 'retired']).toContain(set.status)
  const claims = resourceClaimsOf(occupiedResourceSlots(state))
  const expected: { owner: string; ownerId: string; kind: string; facilityId: string; slot: number | null; capability: string | null }[] = []
  for (const plan of state.operations.workflows) {
    expected.push(...plan.reservations.map(r => ({ owner: 'production', ownerId: plan.productionId, kind: 'facility',
      facilityId: r.facilityId, slot: r.slot, capability: r.capability })))
    if (plan.shootingTask !== null) expected.push({ owner: 'shootingTask', ownerId: plan.productionId, kind: 'facility',
      facilityId: plan.shootingTask.soundstageFacilityId, slot: null, capability: null })
  }
  expected.push(...state.sets.filter(row => row.status !== 'retired').map(row => ({ owner: 'set', ownerId: row.id,
    kind: 'mount', facilityId: row.mountedOn, slot: null, capability: null })))
  for (const plan of state.operations.workflows) if (plan.bindings.setId !== null && plan.reservations.some(r => r.capability === 'soundstage')) {
    expected.push({ owner: 'production', ownerId: plan.productionId, kind: 'set', facilityId: plan.bindings.stageFacilityId ?? '', slot: null, capability: null })
  }
  expect(claims.map(row => ({ owner: row.owner, ownerId: row.ownerId, kind: row.kind,
    facilityId: row.facilityId, slot: row.slot, capability: row.capability }))).toEqual(expected)
  const free = (['development-casting', 'soundstage', 'set-scenery', 'post'] as const).map(capability => ({ capability,
    slots: state.operations.facilities.filter(row => row.capability === capability).flatMap(facility =>
      Array.from({ length: facility.capacity }, (_, slot) => ({ facilityId: facility.id, slot })).filter(candidate =>
        !claims.some(row => row.kind === 'facility' && row.facilityId === candidate.facilityId && (row.slot === null || row.slot === candidate.slot)))) }))
  for (const row of free) expect(row.slots.length).toBeGreaterThan(0)
  assert.ok(w.shootingTask)
  expect(free.find(row => row.capability === 'soundstage')!.slots.every(row => row.facilityId !== w.shootingTask!.soundstageFacilityId)).toBe(true)
  const earliestTake = 104 + Math.max(1, p.remainingTicks - 4) + (p.startTick >= 104 ? 1 : 0)
  const earliestRelease = 104 + Math.max(1, p.remainingTicks) + (p.startTick >= 104 ? 1 : 0)
  expect([earliestTake, earliestRelease]).toEqual([105, 109])
  const admissions = [109, 147, 148].map(queryWeek => ({ queryWeek, actualWeek: 104,
    conservativeRelease: queryWeek + 9, refusal: core.assignmentRefusal(state, FOCUS, queryWeek, 'actor') }))
  expect(admissions[0]!.refusal).toBeNull(); expect(admissions[1]!.refusal).toBeNull()
  expect(admissions[2]!.refusal).toBe(`talent "${FOCUS}" is retirementAnnounced (effective week 156) — a production seat taken at week 148 cannot release before it (P14C.2a)`)
  expect(admissions.map(row => row.conservativeRelease)).toEqual([118, 156, 157])
  return { person, acting, contract, employment, company, writing, research, production: clone(p), workflow: clone(w), target: clone(target),
    claims: clone(claims), expected, facilities: clone(state.operations.facilities), free, earliestTake, earliestRelease, admissions }
}
function crimeDraft(state: GameState): PromiseDraft {
  return { family: 'SPECIFIC_PROJECT', issuerStudioId: issuer(state), beneficiaryPersonId: FOCUS,
    predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId: 'script-0001' },
    startWeek: 104, termWeeks: 104, windowStartWeek: 104, dueWeekExclusive: 180 }
}
function witness(state: GameState, request: PromiseDraft, witnessId: string, delayed: boolean) {
  const facts = physical104(state), census = membership(state, request), row = root(state, witnessId), p = production(state)
  expect(census.selected).toEqual([row])
  expect(row).toMatchObject({ family: 'PREFERRED_GENRE_OPPORTUNITY', version: 7,
    predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'drama' }, issuerStudioId: issuer(state),
    beneficiaryPersonId: FOCUS, progress: 0, evidenceRefs: [], outcome: null, windowStartWeek: delayed ? 144 : 52, dueWeekExclusive: 156 })
  expect(row.contractId).toBe(facts.employment[0]!.contractId)
  const linked = state.scriptDevelopment.projects.filter(project => project.productionId === p.id)
  expect(linked).toHaveLength(1); expect(linked[0]).toMatchObject({ id: 'script-0000', conceptId: 'c-00', status: 'inProduction' })
  expect(Object.values(p.cast)).toContain(FOCUS)
  const commonTake = Math.max(facts.earliestTake, row.windowStartWeek), release = Math.max(facts.earliestRelease, commonTake + 4)
  const freshTake = Math.max(request.windowStartWeek, release + 5), slack = request.dueWeekExclusive - freshTake
  expect(commonTake).toBe(delayed ? 144 : 105); expect(commonTake).toBeLessThan(row.dueWeekExclusive)
  expect(release).toBe(delayed ? 148 : 109); expect(freshTake).toBe(delayed ? 153 : 114); expect(slack).toBe(delayed ? 27 : 66)
  expect(slack).toBeGreaterThanOrEqual(8); expect(freshTake).toBeLessThan(request.dueWeekExclusive)
  expect(release + 9 > facts.acting.effectiveWeek).toBe(delayed)
  return { facts, census, witness: clone(row), linkedProjects: clone(linked), commonTake, release, freshTakeWithoutRetirement: freshTake,
    slackWithoutRetirement: slack, conservativeRetirementRelease: release + 9,
    hypotheticalInterval: { startWeek: request.startWeek, endWeekExclusive: request.startWeek + request.termWeeks,
      actualEmploymentEnd: facts.contract.endWeekExclusive, attachableExtensionClaimed: false } }
}
type Waived = { state: GameState; successorId: string; originalQuery: PromiseDraft; originalFacts: ReturnType<typeof physical104> }
function waived104(): Waived {
  return memo('waived104', () => {
    const input = held104(), state = input.state, request = crimeDraft(state), original = clone(root(state))
    expect(original).toEqual(input.boundRoot)
    const beforeFacts = witness(state, request, promiseId, false)
    ra(quote(state, request, 'P5-original-reservation104', [promiseId], beforeFacts))
    const substitute: PromiseAttachment = { family: 'PREFERRED_GENRE_OPPORTUNITY',
      predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'drama' }, windowStartWeek: 144, dueWeekExclusive: 156 }
    const replacement = genreDraft(state, 144, promiseId)
    const trust = promiseOwner.trustDescriptor(state, FOCUS, issuer(state), 104)
    const before = bytes(state), rng = clone(state.rngState)
    emit('WAIVER-PREMISE', { original, substitute, actualContract: activeContract(state, FOCUS), trust,
      physical: beforeFacts.facts, heldTake: 144, slack: 12, selfExcludedUnion: membership(state, replacement) })
    expect(trust.label).not.toBe('Distrusted')
    expect(144 - state.market.tick).toBe(40); expect(156 - 144).toBe(12)
    const preview = quote(state, replacement, 'self-excluded-P4-substitute104', [], { trust, heldTake: 144, slack: 12,
      actualContract: activeContract(state, FOCUS), physical: beforeFacts.facts })
    ra(preview)
    const argument = { promiseId, substitute: clone(substitute) }
    let successorId = ''
    const next = mutation(state, 'waivePromise', argument, () => core.waivePromise(clone(state), clone(argument)), value => {
      const waived = root(value); assert.ok(waived.supersededByPromiseId); successorId = waived.supersededByPromiseId
      const successor = root(value, successorId)
      expect(waived).toEqual({ ...original, outcome: 'WAIVED', outcomeWeek: 104, outcomeCause: waived.outcomeCause,
        outcomeEventId: waived.outcomeEventId, supersededByPromiseId: successorId })
      assert.ok(waived.outcomeCause); assert.ok(waived.outcomeEventId)
      expect(successor).toEqual({ promiseId: `promise-${state.promises.length}`, ...substitute, version: 7,
        issuerStudioId: original.issuerStudioId, beneficiaryPersonId: FOCUS, contractId: original.contractId,
        feasibilityReceipt: preview, progress: 0, evidenceRefs: [], outcome: null, outcomeWeek: null, outcomeCause: null,
        outcomeEventId: null, supersededByPromiseId: null })
      expect(value.promises).toHaveLength(state.promises.length + 1)
      expect(value.promises.filter(row => row.promiseId !== promiseId && row.promiseId !== successorId))
        .toEqual(state.promises.filter(row => row.promiseId !== promiseId))
      const { promises: _old, talentMarket: oldMarket, ...otherBefore } = state
      const { promises: _new, talentMarket: newMarket, ...otherAfter } = value
      expect(otherAfter).toEqual(otherBefore)
      const { receipts: oldReceipts, ...marketBefore } = oldMarket, { receipts: newReceipts, ...marketAfter } = newMarket
      expect(marketAfter).toEqual(marketBefore); expect(newReceipts.slice(0, oldReceipts.length)).toEqual(oldReceipts)
      expect(newReceipts.slice(oldReceipts.length)).toEqual([expect.objectContaining({ eventId: waived.outcomeEventId,
        week: 104, kind: 'promiseOutcome', talentId: FOCUS, studioId: issuer(state),
        reasons: ['a promise to this person was waived for a substitute the person accepted'] })])
      emit('WAIVED104', { original: waived, successor, preview, trust, outcomeReceipts: newReceipts.slice(oldReceipts.length) })
    })
    expect(bytes(state)).toBe(before); expect(state.rngState).toEqual(rng)
    return { state: next, successorId, originalQuery: request, originalFacts: beforeFacts.facts }
  })
}

describe('P4/P5 delayed committed witness and actual retirement readmission', () => {
  it('Q21 repeats retirement admission at the real witness-delayed release floor', () => {
    const result = waived104(), state = result.state, request = crimeDraft(state)
    expect(request).toEqual(result.originalQuery)
    const facts = witness(state, request, result.successorId, true)
    expect(facts.facts).toEqual(result.originalFacts)
    const observed = quote(state, request, 'identical-P5-after-delayed-waiver104', [result.successorId], facts)
    expect(observed).toMatchObject({ classification: 'FRAGILE', bottleneck: 'committed reservation timing leaves this opportunity uncertain' })
    expect(membership(state, request).rows.find(row => row.promiseId === promiseId))
      .toMatchObject({ open: false, selected: false })
    expect(membership(state, request).rows.find(row => row.promiseId === result.successorId))
      .toMatchObject({ open: true, unmet: true, boundOrAttached: true, overlap: true, issuerOrPerson: true, selected: true })
    expect(state.market.tick).toBe(104); admitted(state); suffix(state); held(state)
    expect([count.attempted, count.reserved, count.invoked, count.completed, count.outside]).toEqual([59, 59, 59, 59, 0])
    expect([count.mutationAttempts, count.mutationsAccepted, count.explicitQuotes, count.returnedQuotes]).toEqual([5, 5, 4, 4])
    expect(operations.map(row => [row.week, row.kind, row.accepted])).toEqual([[45, 'submitProposal', true], [45, 'attachPromise', true],
      [52, 'greenlightScriptProject', true], [55, 'setProductionSetupRecipe', true], [104, 'waivePromise', true]])
    expect(trace).toHaveLength(59)
    emit('COMPLETE', { week: state.market.tick, oldReceiptCount: oldTakes.length, newReceipts: state.firstTakes.slice(19),
      firstTakeSubjects: state.firstTakeSubjects, original: root(state), successor: root(state, result.successorId),
      finalReceipt: observed, clock: { originalFresh: 109, originalTake: 114, delayedTake: 144, delayedFresh: 148,
        uncappedFreshTake: 153, due: 180, slackWithoutRetirement: 27, allowedAdmission: 147, refusedAdmission: 148 }, counters: count })
  }, TIMEOUT)
})
