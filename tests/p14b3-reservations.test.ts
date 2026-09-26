// DRAFT ONLY: intended tests/p14b3-reservations.test.ts. Not installed or run.
// Authority: P14-HEADLESS-PLAN B3 / evidence/p14b2-20260919/12-b3-expansion-draft.
// Existing APIs, behavioral RED: OPEN roots reserve iff bound OR referenced by a
// CURRENT proposal. Abandoned roots remain evidence, not reservations. The same
// membership must determine the feasibility receipt's inputsDigest. Preserve
// self-exclusion, overlap and competing CURRENT cross-issuer accounting.
// Fixtures are candidates until the authorized T1 runner proves every guard.
import { describe, expect, it } from 'vitest'
import { applyActions, hiringMarketIds } from '../src/core/index.js'
import { attachPromise, promiseFeasibility, trustDrivers, type PromiseDraft } from '../src/core/promises.js'
import { currentProposals, submitProposal, withdrawProposal } from '../src/core/talentMarket.js'
import { makeSave, validateSaveV36 } from '../src/core/save.js'
import type { GameState, ProfessionalPromise } from '../src/core/types.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './helpers/p14b2-fixtures.js'

let cached: { state: GameState; talentId: string } | undefined
function fixture() {
  if (cached === undefined) {
    let state = fund(p13aGeneratedStudio())
    const talentId = hiringMarketIds(state, state.market.tick)
      .find((id) => state.talent.find((t) => t.id === id)?.role === 'actor')
    if (talentId === undefined) throw new Error('B3 premise: no real signable actor')
    state = applyActions(state, [{ kind: 'signContract', talentId, termWeeks: 52 }])
    state = advanceTo(state, 45)
    state = submitProposal(state, { talentId, issuerStudioId: player(state), termWeeks: 52, premiumTier: 1.25 })
    expect(state.promises.filter((p) => p.beneficiaryPersonId === talentId)).toEqual([])
    expect(state.studio.activeProductions).toEqual([])
    cached = { state, talentId }
  }
  return structuredClone(cached)
}
function draft(state: GameState, talentId: string): PromiseDraft {
  return { family: 'APPEARANCE_COUNT', issuerStudioId: player(state), beneficiaryPersonId: talentId,
    predicate: { count: 1 }, windowStartWeek: 52, dueWeekExclusive: 92, startWeek: 52, termWeeks: 52 }
}
function attach(state: GameState, talentId: string, issuer = player(state), windowStartWeek = 52, dueWeekExclusive = 92, count = 1) {
  return attachPromise(state, talentId, issuer, { family: 'APPEARANCE_COUNT', predicate: { count }, windowStartWeek, dueWeekExclusive })
}
function currentPromise(state: GameState, talentId: string, issuer = player(state)): ProfessionalPromise {
  const proposal = currentProposals(state, talentId).find((p) => p.issuerStudioId === issuer)
  expect(proposal?.promises).toHaveLength(1)
  const promise = state.promises.find((p) => p.promiseId === proposal!.promises[0])
  if (promise === undefined) throw new Error('B3 premise: current attachment must have a genuine root')
  return promise
}
function read(state: GameState, talentId: string, extra: Partial<PromiseDraft> = {}) {
  return promiseFeasibility(state, { ...draft(state, talentId), ...extra }, state.market.tick)
}
function assertUnchangedHistory(state: GameState, prior: GameState): void {
  expect(state.promises.slice(0, prior.promises.length)).toEqual(prior.promises)
  expect(state.talentMarket.receipts.slice(0, prior.talentMarket.receipts.length)).toEqual(prior.talentMarket.receipts)
  expect(state.hollywood!.employment).toEqual(prior.hollywood!.employment)
  expect(state.hollywood!.receipts).toEqual(prior.hollywood!.receipts)
  expect(state.ledger).toEqual(prior.ledger)
  expect(state.rngState).toBe(prior.rngState)
}

describe('P14B.3 F1: real reservation membership and matching feasibility digest', () => {
  it('a CURRENT unbound attachment still consumes the only existing path; only its own recheck excludes itself', () => {
    const { state, talentId } = fixture()
    const before = read(state, talentId)
    expect(before.classification).toBe('REASONABLY_ACHIEVABLE')
    const attached = attach(state, talentId)
    const promise = currentPromise(attached, talentId)
    expect(promise.contractId).toBeNull()
    expect(promise.outcome).toBeNull()
    expect(promise.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE')
    const bytes = JSON.stringify(attached)
    const another = read(attached, talentId)
    expect(another.classification).toBe('FRAGILE')
    expect(another.bottleneck).toMatch(/not.*commission/i)
    expect(another.inputsDigest).not.toBe(before.inputsDigest)
    expect(read(attached, talentId, { promiseId: promise.promiseId })).toEqual(before)
    expect(JSON.stringify(attached)).toBe(bytes)
  })

  it.each(['revise', 'withdraw'] as const)('%s preserves the old unbound root but removes its reservation AND digest contribution', (operation) => {
    const { state, talentId } = fixture()
    const before = read(state, talentId)
    expect(before.classification).toBe('REASONABLY_ACHIEVABLE')
    const attached = attach(state, talentId)
    const old = currentPromise(attached, talentId)
    expect(read(attached, talentId).classification).toBe('FRAGILE')
    const next = operation === 'revise'
      ? submitProposal(attached, { talentId, issuerStudioId: player(attached), termWeeks: 52, premiumTier: 1.25 })
      : withdrawProposal(attached, talentId, player(attached))
    expect(currentProposals(next, talentId).some((p) => p.promises.includes(old.promiseId))).toBe(false)
    expect(next.promises.find((p) => p.promiseId === old.promiseId)).toEqual(old)
    assertUnchangedHistory(next, attached)
    expect(read(next, talentId)).toEqual(before) // same relevant facts, same class AND digest
    expect(trustDrivers(next, talentId, player(next), next.market.tick))
      .toEqual(trustDrivers(state, talentId, player(state), state.market.tick))
    expect(next.talentMarket.receipts.some((r) => r.kind === 'promiseOutcome' && r.talentId === talentId)).toBe(false)
    const reloaded = validateSaveV36(JSON.parse(JSON.stringify(makeSave(next)))).state
    expect(reloaded.promises).toEqual(next.promises) // loading never recomputes historical receipts
    expect(read(reloaded, talentId)).toEqual(before)
  })

  it('three real replacements preserve every ordinal and original receipt without accumulating phantom capacity', () => {
    const { state: initial, talentId } = fixture()
    const expected = read(initial, talentId)
    let state = initial
    const authored: ProfessionalPromise[] = []
    for (let index = 0; index < 3; index++) {
      const ordinal = state.promises.length
      state = attach(state, talentId)
      const promise = currentPromise(state, talentId)
      expect(promise.promiseId).toBe(`promise-${ordinal}`)
      expect(promise.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE')
      authored.push(structuredClone(promise))
      const beforeRevision = state
      state = submitProposal(state, { talentId, issuerStudioId: player(state), termWeeks: 52, premiumTier: 1.25 })
      assertUnchangedHistory(state, beforeRevision)
      expect(read(state, talentId)).toEqual(expected)
    }
    expect(state.promises.slice(initial.promises.length)).toEqual(authored)
    expect(authored.every((p) => p.contractId === null && p.outcome === null)).toBe(true)
  })

  it('a genuinely bound OPEN promise reserves after the winning proposal has left the current table', () => {
    const { state, talentId } = fixture()
    const attached = attach(state, talentId)
    const old = currentPromise(attached, talentId)
    const settled = advanceTo(attached, 52)
    expect(currentProposals(settled, talentId)).toEqual([])
    const bound = settled.promises.find((p) => p.promiseId === old.promiseId)!
    expect(bound.contractId).not.toBeNull()
    expect(bound.outcome).toBeNull()
    const employment = settled.hollywood!.employment.find((e) => e.contractId === bound.contractId)
    expect(employment).toMatchObject({ studioId: player(settled), terms: { talentId, startWeek: 52 } })
    expect(read(settled, talentId).classification).toBe('FRAGILE')
    expect(read(settled, talentId).bottleneck).toMatch(/not.*commission/i)
    expect(read(settled, talentId, { promiseId: bound.promiseId }).classification).toBe('REASONABLY_ACHIEVABLE')
    validateSaveV36(JSON.parse(JSON.stringify(makeSave(settled))))
  })

  it('preserves the existing competing CURRENT cross-issuer reservation policy, without choosing a new alternatives policy', () => {
    const { state, talentId } = fixture()
    const issuer = state.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const submitted = submitProposal(state, { talentId, issuerStudioId: issuer, termWeeks: 52, premiumTier: 1 })
    const baseline = read(submitted, talentId)
    expect(baseline.classification).toBe('REASONABLY_ACHIEVABLE')
    const attached = attach(submitted, talentId, issuer)
    const rival = currentPromise(attached, talentId, issuer)
    expect(rival.contractId).toBeNull()
    expect(read(attached, talentId).classification).toBe('FRAGILE')
    expect(read(attached, talentId).inputsDigest).not.toBe(baseline.inputsDigest)
    const withdrawn = withdrawProposal(attached, talentId, issuer)
    expect(withdrawn.promises).toEqual(attached.promises)
    expect(read(withdrawn, talentId)).toEqual(baseline)
  })

  it('a real CURRENT non-overlapping attachment is ignored without changing its stored receipt', () => {
    const { state, talentId } = fixture()
    const before = read(state, talentId)
    const attached = attach(state, talentId, player(state), 93, 104)
    const distant = currentPromise(attached, talentId)
    expect(distant.windowStartWeek).toBeGreaterThanOrEqual(draft(state, talentId).dueWeekExclusive)
    expect(read(attached, talentId)).toEqual(before)
    expect(attached.promises.at(-1)).toEqual(distant)
  })

  it('a real terminal BROKEN outcome no longer reserves even though its bound contract identity remains', () => {
    const { state, talentId } = fixture()
    const attached = attach(state, talentId)
    const id = currentPromise(attached, talentId).promiseId
    const settled = advanceTo(attached, 52)
    expect(settled.promises.find((p) => p.promiseId === id)!.contractId).not.toBeNull()
    const released = applyActions(settled, [{ kind: 'releaseTalent', talentId }])
    const broken = released.promises.find((p) => p.promiseId === id)!
    expect(broken).toMatchObject({ outcome: 'BROKEN', outcomeWeek: 52 })
    expect(broken.contractId).not.toBeNull()
    expect(released.talentMarket.receipts.find((r) => r.eventId === broken.outcomeEventId))
      .toMatchObject({ kind: 'promiseOutcome', week: 52, talentId, studioId: player(released) })
    expect(read(released, talentId).classification).toBe('REASONABLY_ACHIEVABLE')
    expect(read(released, talentId)).toEqual(read(released, talentId, { promiseId: id }))
    validateSaveV36(JSON.parse(JSON.stringify(makeSave(released))))
  })

  it('an actually dropped losing draft stays in evidence after settlement but cannot reserve a later overlapping read', () => {
    const { state, talentId } = fixture()
    const issuer = state.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    let offers = submitProposal(state, { talentId, issuerStudioId: issuer, termWeeks: 52, premiumTier: 1 })
    offers = attach(offers, talentId, issuer, 93, 104, 999)
    const losing = structuredClone(currentPromise(offers, talentId, issuer))
    expect(losing.feasibilityReceipt.classification).toBe('IMPOSSIBLE')
    offers = attach(offers, talentId)
    const own = currentPromise(offers, talentId)
    expect(own.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE')
    const settled = advanceTo(offers, 52)
    expect(settled.promises.find((p) => p.promiseId === own.promiseId)!.contractId).not.toBeNull()
    expect(currentProposals(settled, talentId)).toEqual([])
    const receipt = settled.talentMarket.receipts.find((r) => r.talentId === talentId && r.kind === 'settled' && r.week === 52)!
    const rivalName = settled.hollywood!.identities.find((s) => s.studioId === issuer)!.name
    expect(receipt).toBeDefined()
    expect(receipt.dropped.some((reason) => reason.startsWith(rivalName))).toBe(true)
    expect(settled.promises.find((p) => p.promiseId === losing.promiseId)).toEqual(losing)
    const later = { windowStartWeek: 100, dueWeekExclusive: 204, startWeek: 52, termWeeks: 208 }
    expect(read(settled, talentId, later).classification).toBe('REASONABLY_ACHIEVABLE')
    expect(read(settled, talentId, later)).toEqual(read(settled, talentId, { ...later, promiseId: losing.promiseId }))
    validateSaveV36(JSON.parse(JSON.stringify(makeSave(settled))))
  })
})
