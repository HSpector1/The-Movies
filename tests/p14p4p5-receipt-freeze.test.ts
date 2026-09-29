// 1257-A/B/F/G: isolated fixed45→52 branch; no prior simulation helper imports.
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
import { activeContract } from '../src/core/employment.js'
import type { PromiseAttachment, PromiseDraft } from '../src/core/promises.js'
import type { GameState, ProfessionalPromise, PromiseFeasibilityReceipt, TalentMarketProposal } from '../src/core/types.js'

const E = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
const FOCUS = 'authored-0006', LATER = 'authored-0007', HARD_ADVANCES = 7, TIMEOUT = 60_000
const clone = <T>(value: T): T => structuredClone(value)
const stable = saves.stableStringify
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const emit = (kind: string, value: unknown): void => console.info(`1257-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { attempted: 0, reserved: 0, invoked: 0, completed: 0, outside: 0,
  mutationAttempts: 0, mutationsAccepted: 0, previews: 0, explicitQuotes: 0,
  matchingAttempts: 0, matchingCompleted: 0, selectorAttempts: 0, selectorCompleted: 0 }
const operations: { week: number; kind: 'submitProposal' | 'attachPromise'; personId: string; accepted: boolean }[] = []
const trace: unknown[] = []
type Cached = { ok: true; value: unknown } | { ok: false; error: unknown }
const cache = new Map<string, Cached>()
let permit: { from: number; used: boolean } | undefined
let restoreTick: (() => void) | undefined

beforeAll(() => {
  const actual = tickOwner.tick
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation((state, options) => {
    count.attempted++
    if (!permit) { count.outside++; throw new Error('1257: no advance outside the sole Q12 route') }
    assert.equal(permit.used, false, 'one authorization covers one invocation only'); permit.used = true
    assert.ok(count.attempted <= HARD_ADVANCES && count.reserved < HARD_ADVANCES, 'hard7 before invocation')
    assert.equal(state.market.tick, permit.from); assert.equal(permit.from, 45 + count.reserved)
    count.reserved++; count.invoked++
    const next = actual(state, options)
    expect(next.market.tick).toBe(state.market.tick + 1); count.completed++
    return next
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: HARD_ADVANCES, hardMutations: 4, hardPreviews: 2,
    hardExplicitQuotes: 1, hardMatchingCalls: 2, hardSelectorsPerMatchingCall: 1,
    oldRoutesImported: false, capturePrefixAdvances: 0,
    phases: [...cache].map(([name, row]) => ({ name, complete: row.ok })), operations, trace })
  expect(count.outside).toBe(0); expect(count.attempted).toBeLessThanOrEqual(HARD_ADVANCES)
})
function memo<T>(name: string, build: () => T): T {
  const prior = cache.get(name)
  if (prior) { if (!prior.ok) throw prior.error; return clone(prior.value as T) }
  try { const value = build(); cache.set(name, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(name, { ok: false, error }); throw error }
}
function admitted(state: GameState): void {
  const before = stable(state), save = saves.makeSave(state)
  expect(save.saveVersion).toBe(42); expect(saves.validateSaveV42(save)).toBe(save)
  const raw = saves.exportSave(save)
  expect(saves.exportSave(saves.importSave(raw))).toBe(raw); expect(stable(state)).toBe(before)
}
function request(state: GameState, personId: string, promiseId?: string): PromiseDraft {
  return { family: personId === FOCUS ? 'DIRECTING_COUNT' : 'PREFERRED_GENRE_OPPORTUNITY',
    issuerStudioId: issuer(state), beneficiaryPersonId: personId,
    predicate: personId === FOCUS ? { kind: 'directorCount', count: 1 }
      : { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'drama' },
    startWeek: 52, termWeeks: 104, windowStartWeek: 52, dueWeekExclusive: 112,
    ...(promiseId === undefined ? {} : { promiseId }) }
}
function proposal(state: GameState, personId: string): TalentMarketProposal {
  const rows = state.talentMarket.proposals.filter(row => row.talentId === personId && row.issuerStudioId === issuer(state))
  expect(rows).toHaveLength(1); return rows[0]!
}
function root(state: GameState, promiseId: string): ProfessionalPromise {
  const rows = state.promises.filter(row => row.promiseId === promiseId)
  expect(rows).toHaveLength(1); return rows[0]!
}
function caseOrder(state: GameState, open: boolean): void {
  const indices = [FOCUS, LATER].map(id => state.talentMarket.cases.findIndex(row => row.talentId === id && row.openedWeek === 40))
  expect(indices[0]).toBe(0); expect(indices[1]).toBe(1)
  for (const index of indices) {
    const row = state.talentMarket.cases[index]!
    expect(row).toMatchObject({ variant: 'expiry', subjectStudioId: issuer(state) })
    if (open) expect(row).toMatchObject({ closedWeek: null, outcome: null })
  }
}
function input45(): GameState {
  return memo('genuine45', () => {
    const manifest = readFileSync(new URL('1171-p3-current45-capture/MANIFEST.json', E))
    expect(manifest.length).toBe(11550)
    expect(sha(manifest)).toBe('a261fc3177527d05d5a8daf624de7af015df8c9a8fedd3e11b37fe1597a2f4b6')
    const zipped = readFileSync(new URL('1171-p3-current45-capture/genuine-v39-p3-market-week45.json.gz', E))
    expect(zipped.length).toBe(86995)
    expect(sha(zipped)).toBe('12799a849b0b4aff49cd9707ea8c1b87c64b4e787ff261b2e9cf4b109a953117')
    const raw = gunzipSync(zipped).toString('utf8')
    expect(Buffer.byteLength(raw)).toBe(751294)
    expect(sha(raw)).toBe('e7401f2578a7ad151383ca905df4253c2bbd82d6823c406c28b7e76aa809c5af')
    const parsed: unknown = JSON.parse(raw), old = saves.validateSaveV39(parsed), oldBytes = stable(old)
    expect(old).toBe(parsed); expect(saves.exportSave(old)).toBe(raw)
    const state = saves.migrateToLive(old).state
    expect(stable(old)).toBe(oldBytes); admitted(state)
    expect(state.market.tick).toBe(45); expect(state.studio.cash).toBe(24701506)
    expect(state.promises).toEqual([]); expect(state.firstTakes).toHaveLength(19)
    expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 19, facts: [] })
    expect(state.studio.activeProductions).toEqual([]); expect(state.productionQueue).toEqual([])
    expect(state.scriptDevelopment.mode).toBe('managed')
    expect(state.scriptDevelopment.projects.map(p => [p.id, p.conceptId, p.status, p.productionId]))
      .toEqual([['script-0000', 'c-00', 'ready', null], ['script-0001', 'c-01', 'ready', null]])
    for (const project of state.scriptDevelopment.projects) expect(project.assessment).not.toBeNull()
    caseOrder(state, true)
    for (const id of [FOCUS, LATER]) {
      const talent = state.talent.find(row => row.id === id); assert.ok(talent)
      expect(talent).toMatchObject({ role: id === FOCUS ? 'actor' : 'director', age: id === FOCUS ? 68 : 30 })
      assert.ok(talent.skills.directing); assert.ok(talent.skills.acting)
      const provenance = state.talentProvenance.rows.find(row => row.personId === id); assert.ok(provenance)
      expect(core.ageAt(provenance, 45)).toBe(talent.age)
      expect(core.retirementRecordFor(state, id)).toBeUndefined()
      expect(core.caseForTalent(state, id)).toMatchObject({ openedWeek: 40, decisionWeek: 52 })
      const contract = activeContract(state, id); assert.ok(contract)
      expect(contract).toMatchObject({ startWeek: 0, endWeekExclusive: 52, termWeeks: 52 })
      const stored = state.talentMarket.cases.find(row => row.talentId === id)!
      const employment = state.hollywood!.employment.find(row => row.contractId === stored.contractId); assert.ok(employment)
      expect(employment.terms).toEqual(contract); expect(employment.endedWeek).toBeNull()
    }
    emit('INPUT', { week: 45, cases: state.talentMarket.cases.slice(0, 2), ready: state.scriptDevelopment.projects,
      rootCount: state.promises.length, migrationCutover: state.firstTakeSubjects })
    return state
  })
}
function preview(state: GameState, week: 45 | 52, promises: readonly string[]) {
  assert.equal(count.previews, week === 45 ? 0 : 1, 'exact45 then first-precommit52 preview allocation')
  count.previews++
  const before = stable(state), rng = clone(state.rngState)
  const part = promiseOwner.attachedPromiseDigest(state, promises)
  const value = core.proposalDraft(state, issuer(state), FOCUS, 104, 1.25, week, part)
  expect(stable(state)).toBe(before); expect(state.rngState).toEqual(rng)
  expect(value).toMatchObject({ talentId: FOCUS, issuerStudioId: issuer(state), startWeek: 52,
    endWeekExclusive: 156, termWeeks: 104, premiumTier: 1.25 })
  emit('PREVIEW', { week, promiseIds: [...promises], promisePart: part, value })
  return value
}
function mutation(state: GameState, personId: string, kind: 'submitProposal' | 'attachPromise'): GameState {
  assert.ok(count.mutationAttempts < 4, 'four fixed public mutations only')
  const before = bytes(state), source = clone(state), draft = request(source, personId)
  const row = { week: state.market.tick, kind, personId, accepted: false }
  count.mutationAttempts++; operations.push(row); emit('MUTATION-ATTEMPT', row)
  const attachment: PromiseAttachment = { family: draft.family, predicate: clone(draft.predicate),
    windowStartWeek: draft.windowStartWeek, dueWeekExclusive: draft.dueWeekExclusive }
  const next = kind === 'submitProposal'
    ? core.submitProposal(source, { talentId: personId, issuerStudioId: issuer(source), termWeeks: 104, premiumTier: 1.25 })
    : core.attachPromise(source, personId, issuer(source), attachment)
  admitted(next); expect(bytes(state)).toBe(before); expect(next.market.tick).toBe(45)
  const accepted = proposal(next, personId)
  expect(accepted).toMatchObject({ talentId: personId, issuerStudioId: issuer(next), submittedWeek: 45,
    startWeek: 52, termWeeks: 104, premiumTier: 1.25 })
  expect(accepted.startWeek + accepted.termWeeks).toBe(156)
  if (kind === 'submitProposal') {
    expect(accepted.promises).toEqual([])
    expect(accepted.annualSalary).toBeGreaterThan(0); expect(accepted.signingBonus).toBeGreaterThan(0)
    expect(state.studio.cash).toBeGreaterThanOrEqual(accepted.signingBonus)
  } else expect(accepted.promises).toHaveLength(1)
  count.mutationsAccepted++; row.accepted = true; emit('MUTATION-ACCEPTED', { ...row, proposal: accepted })
  return next
}
type Joined = { state: GameState; focusRoot: ProfessionalPromise; laterRoot: ProfessionalPromise;
  focusProposal: TalentMarketProposal; laterProposal: TalentMarketProposal }
function joined45(): Joined {
  return memo('joined45', () => {
    let state = input45()
    const price = preview(state, 45, [])
    state = mutation(state, FOCUS, 'submitProposal')
    expect(proposal(state, FOCUS)).toMatchObject({ annualSalary: price.annualSalary, signingBonus: price.signingBonus, digest: price.digest })
    state = mutation(state, FOCUS, 'attachPromise')
    const focusRoot = clone(root(state, proposal(state, FOCUS).promises[0]!))
    emit('ORIGINAL-ROOT6', { root: focusRoot, proposal: proposal(state, FOCUS) })
    expect(focusRoot).toMatchObject({ version: 6, family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 },
      contractId: null, progress: 0, evidenceRefs: [], outcome: null, windowStartWeek: 52, dueWeekExclusive: 112 })
    expect(focusRoot.feasibilityReceipt).toMatchObject({ rulesVersion: 6, week: 45,
      classification: 'REASONABLY_ACHIEVABLE', bottleneck: null })
    state = mutation(state, LATER, 'submitProposal')
    state = mutation(state, LATER, 'attachPromise')
    const laterRoot = clone(root(state, proposal(state, LATER).promises[0]!))
    expect(laterRoot).toMatchObject({ family: 'PREFERRED_GENRE_OPPORTUNITY',
      predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'drama' },
      issuerStudioId: issuer(state), beneficiaryPersonId: LATER, contractId: null, outcome: null, progress: 0 })
    expect(root(state, focusRoot.promiseId)).toEqual(focusRoot); caseOrder(state, true)
    emit('JOINED45', { focusRoot, laterRoot, proposals: state.talentMarket.proposals })
    return { state, focusRoot, laterRoot, focusProposal: clone(proposal(state, FOCUS)), laterProposal: clone(proposal(state, LATER)) }
  })
}
function census(state: GameState, draft: PromiseDraft, from: number) {
  const attached = new Set(state.talentMarket.proposals.flatMap(row => row.promises))
  const rows = state.promises.map(row => ({ row: clone(row), open: row.outcome === null,
    remaining: Math.max(0, row.predicate.count - row.progress), bound: row.contractId !== null,
    attached: attached.has(row.promiseId), notSelf: row.promiseId !== draft.promiseId,
    overlaps: row.dueWeekExclusive > from && row.windowStartWeek < draft.dueWeekExclusive,
    samePerson: row.beneficiaryPersonId === draft.beneficiaryPersonId, sameIssuer: row.issuerStudioId === draft.issuerStudioId }))
  const selected = rows.filter(row => row.open && row.remaining > 0 && (row.bound || row.attached)
    && row.notSelf && row.overlaps && (row.samePerson || row.sameIssuer)).map(row => row.row)
  return { from, rows, selected, proposals: clone(state.talentMarket.proposals) }
}
function quoted45(): Joined {
  return memo('quoted45', () => {
    const joined = joined45(), state = joined.state, draft = request(state, FOCUS, joined.focusRoot.promiseId)
    const before = bytes(state), requested = stable(draft), rng = clone(state.rngState), union = census(state, draft, 52)
    assert.equal(count.explicitQuotes, 0); count.explicitQuotes++
    const receipt = core.promiseFeasibility(state, draft, 45)
    emit('JOINED45-QUOTE', { request: draft, receipt, union, originalRoot: joined.focusRoot })
    expect(bytes(state)).toBe(before); expect(stable(draft)).toBe(requested); expect(state.rngState).toEqual(rng)
    expect(union.selected.some(row => row.promiseId === joined.laterRoot.promiseId)).toBe(true)
    expect(receipt.rulesVersion).toBe(7)
    expect(root(state, joined.focusRoot.promiseId)).toEqual(joined.focusRoot)
    return joined
  })
}
function advance(state: GameState): GameState {
  assert.equal(permit, undefined)
  const before = bytes(state), priorTakes = clone(state.firstTakes)
  permit = { from: state.market.tick, used: false }
  let next: GameState
  try { next = tickOwner.tick(clone(state), { develop: true }) } finally { permit = undefined }
  expect(bytes(state)).toBe(before); admitted(next)
  expect(next.firstTakes.slice(0, priorTakes.length)).toEqual(priorTakes)
  const row = { from: state.market.tick, to: next.market.tick, addedReceipts: next.firstTakes.slice(priorTakes.length),
    subjects: next.firstTakeSubjects }
  trace.push(row); emit('ADVANCE', row)
  return next
}
type Selection = { from: number; census: ReturnType<typeof census>; actual: ProfessionalPromise[] | null;
  beforeStateSha256: string; afterStateSha256: string; requestBefore: string; requestAfter: string }
type Observation = { index: number; week: number; actualStateWeek: number; request: PromiseDraft;
  originalRoot: ProfessionalPromise; proposal: TalentMarketProposal; beforeStateBytes: number; beforeStateSha256: string;
  beforeRng: GameState['rngState']; selections: Selection[]; receipt: PromiseFeasibilityReceipt | null;
  price: ReturnType<typeof core.proposalDraft> | null; completed: boolean; afterStateSha256: string | null }
const observations: Observation[] = []
type ActiveObservation = { state: GameState; request: PromiseDraft; row: Observation }
let activeObservation: ActiveObservation | undefined
function settled52(): { joined: Joined; state: GameState } {
  return memo('settled52', () => {
    const joined = quoted45()
    let state = joined.state
    while (state.market.tick < 51) {
      state = advance(state); caseOrder(state, true)
      expect(root(state, joined.focusRoot.promiseId)).toEqual(joined.focusRoot)
      expect(root(state, joined.laterRoot.promiseId)).toEqual(joined.laterRoot)
      expect(proposal(state, FOCUS)).toEqual(joined.focusProposal)
      expect(proposal(state, LATER)).toEqual(joined.laterProposal)
    }
    const actualFeasibility = promiseOwner.promiseFeasibility
    const actualReservations = opportunityOwner.opportunityReservations
    const selectionSpy = vi.spyOn(opportunityOwner, 'opportunityReservations').mockImplementation((current, draft, from) => {
      const active = activeObservation
      if (!active) return actualReservations(current, draft, from)
      assert.equal(current, active.state); assert.equal(draft, active.request)
      assert.equal(from, Math.max(active.row.week, draft.windowStartWeek))
      assert.equal(active.row.selections.length, 0, 'one actual selector call per matching quote')
      assert.ok(count.selectorAttempts < 2, 'two selectors maximum inside the two matching observations')
      count.selectorAttempts++
      const before = stable(current), requested = stable(draft), rng = clone(current.rngState)
      const independent = census(current, draft, from)
      const selected = actualReservations(current, draft, from)
      const after = stable(current)
      const row: Selection = { from, census: independent, actual: selected === undefined ? null : clone([...selected]),
        beforeStateSha256: sha(before), afterStateSha256: sha(after), requestBefore: requested, requestAfter: stable(draft) }
      active.row.selections.push(row); emit('ACTUAL-SELECTION', { index: active.row.index, ...row })
      expect(after).toBe(before); expect(stable(draft)).toBe(requested); expect(current.rngState).toEqual(rng)
      count.selectorCompleted++; return selected
    })
    const feasibilitySpy = vi.spyOn(promiseOwner, 'promiseFeasibility').mockImplementation((current, draft, week) => {
      if (week !== 52 || draft.issuerStudioId !== issuer(current) || draft.beneficiaryPersonId !== FOCUS
        || draft.promiseId !== joined.focusRoot.promiseId) return actualFeasibility(current, draft, week)
      assert.equal(activeObservation, undefined, 'no nested matching quote')
      assert.ok(count.matchingAttempts < 2, 'hard2 matching calls before forwarding')
      const index = count.matchingAttempts++
      // Atomic settlement is in progress: stable bytes here, never makeSave/full admission.
      const before = stable(current), requested = stable(draft), rng = clone(current.rngState)
      const carried = proposal(current, FOCUS)
      const row: Observation = { index, week, actualStateWeek: current.market.tick, request: clone(draft),
        originalRoot: clone(root(current, joined.focusRoot.promiseId)), proposal: clone(carried),
        beforeStateBytes: Buffer.byteLength(before), beforeStateSha256: sha(before), beforeRng: rng,
        selections: [], receipt: null, price: null, completed: false, afterStateSha256: null }
      observations.push(row); emit('PRECOMMIT-INPUT', row)
      if (index === 0) {
        row.price = clone(preview(current, 52, carried.promises))
        expect(row.price.digest).toBe(carried.digest)
      }
      activeObservation = { state: current, request: draft, row }
      try {
        const receipt = actualFeasibility(current, draft, week)
        row.receipt = clone(receipt); row.afterStateSha256 = sha(stable(current))
        expect(stable(current)).toBe(before); expect(stable(draft)).toBe(requested); expect(current.rngState).toEqual(rng)
        row.completed = true; count.matchingCompleted++; emit('PRECOMMIT-RESULT', row)
        return receipt
      } finally { activeObservation = undefined }
    })
    try { state = advance(state) }
    finally { feasibilitySpy.mockRestore(); selectionSpy.mockRestore() }
    emit('COMPLETED52', { week: state.market.tick, cases: state.talentMarket.cases.filter(row => [FOCUS, LATER].includes(row.talentId)),
      marketReceipts: state.talentMarket.receipts.filter(row => row.week === 52 && [FOCUS, LATER].includes(row.talentId)),
      focus: root(state, joined.focusRoot.promiseId), later: root(state, joined.laterRoot.promiseId),
      contracts: state.contracts.filter(row => [FOCUS, LATER].includes(row.talentId)),
      employment: state.hollywood!.employment.filter(row => row.terms.startWeek === 52 && [FOCUS, LATER].includes(row.terms.talentId)),
      signing: state.ledger.filter(row => row.week === 52 && row.kind === 'signingBonus'), observations })
    return { joined, state }
  })
}

describe('P4/P5 genuine root6 and frozen receipt7 settlement', () => {
  it('Q12 preserves actual Director root6 while committing its overlapping-material frozen receipt7', () => {
    const { joined, state } = settled52()
    expect(state.market.tick).toBe(52); admitted(state); caseOrder(state, false)
    const focusCase = state.talentMarket.cases[0]!, laterCase = state.talentMarket.cases[1]!
    emit('CASE-DISPOSITIONS', { focusCase, laterCase })
    const wins = state.talentMarket.receipts.filter(row => row.kind === 'settled' && row.week === 52 && row.talentId === FOCUS)
    expect(wins).toHaveLength(1)
    expect(wins[0]!.studioId, 'actual fixed Focus player victory prerequisite').toBe(issuer(state))
    expect(focusCase).toMatchObject({ closedWeek: 52, outcome: 'settled' })
    expect(laterCase.closedWeek).toBe(52) // Its actual disposition is reported, never assumed to be a player/material win.
    const contract = activeContract(state, FOCUS); assert.ok(contract)
    expect(contract).toMatchObject({ talentId: FOCUS, startWeek: 52, endWeekExclusive: 156, termWeeks: 104 })
    const employment = state.hollywood!.employment.filter(row => row.studioId === issuer(state)
      && row.terms.talentId === FOCUS && row.terms.startWeek === 52 && row.endedWeek === null)
    expect(employment).toHaveLength(1); expect(employment[0]!.terms).toEqual(contract)
    expect(count.matchingAttempts).toBe(2); expect(count.matchingCompleted).toBe(2)
    expect(count.selectorAttempts).toBe(2); expect(count.selectorCompleted).toBe(2)
    expect(observations).toHaveLength(2)
    for (const observed of observations) {
      expect(observed.completed).toBe(true)
      expect(observed.request).toEqual(request(state, FOCUS, joined.focusRoot.promiseId))
      expect(observed.originalRoot).toEqual(joined.focusRoot)
      expect(observed.proposal).toEqual(joined.focusProposal)
      expect(observed.selections).toHaveLength(1)
      const selection = observed.selections[0]!
      expect(selection.census.selected.some(row => row.promiseId === joined.laterRoot.promiseId)).toBe(true)
      expect(selection.actual).toEqual(selection.census.selected)
      expect(selection.census.selected.some(row => row.promiseId === joined.focusRoot.promiseId)).toBe(false)
      expect(selection.afterStateSha256).toBe(selection.beforeStateSha256)
      expect(selection.requestAfter).toBe(selection.requestBefore)
      expect(observed.afterStateSha256).toBe(observed.beforeStateSha256)
    }
    const frozen = observations[0]!, ranking = observations[1]!
    assert.ok(frozen.receipt); assert.ok(frozen.price); assert.ok(ranking.receipt)
    expect(frozen.receipt).toMatchObject({ rulesVersion: 7, week: 52, classification: 'REASONABLY_ACHIEVABLE', bottleneck: null })
    expect(ranking.receipt).toMatchObject({ rulesVersion: 7, week: 52, classification: 'REASONABLY_ACHIEVABLE', bottleneck: null })
    expect(contract.annualSalary).toBe(frozen.price.annualSalary)
    expect(contract.signingBonus).toBe(frozen.price.signingBonus)
    expect(state.ledger.filter(row => row.kind === 'signingBonus' && row.week === 52 && row.talentId === FOCUS))
      .toEqual([{ week: 52, kind: 'signingBonus', amount: -frozen.price.signingBonus,
        talentId: FOCUS, note: 'market settlement signing bonus' }])
    const committed = root(state, joined.focusRoot.promiseId)
    expect(committed).toEqual({ ...joined.focusRoot, contractId: employment[0]!.contractId, feasibilityReceipt: frozen.receipt })
    expect(stable(committed.feasibilityReceipt)).toBe(stable(frozen.receipt))
    expect(committed.version).toBe(6); expect(joined.focusRoot.feasibilityReceipt.rulesVersion).toBe(6)
    const raw = bytes(state), imported = saves.importSave(raw), round = saves.validateSaveV42(imported)
    expect(round).toBe(imported)
    expect(root(round.state, committed.promiseId)).toEqual(committed)
    expect(saves.exportSave(round)).toBe(raw)
    emit('ROOT6-RECEIPT7', { originalRoot: joined.focusRoot, committedRoot: committed,
      frozenReceipt: frozen.receipt, rankingReceipt: ranking.receipt, actualPrice: frozen.price,
      contract, employment: employment[0], completedSaveBytes: Buffer.byteLength(raw), completedSaveSha256: sha(raw) })
    expect(count).toEqual({ attempted: 7, reserved: 7, invoked: 7, completed: 7, outside: 0,
      mutationAttempts: 4, mutationsAccepted: 4, previews: 2, explicitQuotes: 1,
      matchingAttempts: 2, matchingCompleted: 2, selectorAttempts: 2, selectorCompleted: 2 })
  }, TIMEOUT)
})
