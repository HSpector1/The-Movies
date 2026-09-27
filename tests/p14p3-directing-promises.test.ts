// Independent 1112-A/C/D/E, 1121-A/B and 1132-A/B requirements.
// Eight first-slice leaves only. Parent owns execution; no generated expectations.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import { qualifyingTakes } from '../src/core/promises.js'
import type { GameState, FirstTakeReceipt, ProfessionalPromiseV30 } from '../src/core/types.js'
import type { PromiseDraft, PromiseAttachment } from '../src/core/promises.js'
import { act, actualPromise, admitted, at45, attach, attached, bound, bytes, CAST, castDraft, clone,
  counters, creative, directorDraft, firstFilm, futureSave, greenlight, issuer, managedEmpty,
  outgoing, outgoingNames, person, proposal, quote, reopen, secondFilm, SHAPE, terminal208, WRITER,
  type DirectorDraft, type DirectorPromise } from './helpers/p14p3-fixtures.js'

// Set before any execution. A single <=208-tick cached trajectory plus whole-save
// negative families needs more than the runner's 5s default; this does not alter
// existing/global timeouts or grant extra route calls.
const LEAF_TIMEOUT_MS = 60_000
const PIPELINE = 'needs a picture not yet commissioned'
const STOCK_REFUSAL = 'applyActions: greenlight rejected — managed studios must greenlight an authoritative Ready script project'
function ownProposal(state: GameState, id: string) {
  const row = state.talentMarket.proposals.find(p => p.talentId === id && p.issuerStudioId === issuer(state))
  assert.ok(row, 'actual current own proposal'); return row
}
function ownTakes(state: Pick<GameState, 'firstTakes'>, promise: DirectorPromise): FirstTakeReceipt[] {
  const seen = new Set<string>()
  return state.firstTakes.filter(row => {
    if (row.studioId !== promise.issuerStudioId || row.directorId !== promise.beneficiaryPersonId
      || row.week < promise.windowStartWeek || row.week >= promise.dueWeekExclusive || seen.has(row.productionId)) return false
    seen.add(row.productionId); return true
  })
}
const publicTakes = (state: Pick<GameState, 'firstTakes'>, promise: DirectorPromise) =>
  qualifyingTakes(state, promise as unknown as ProfessionalPromiseV30)
function reverseKeys<T>(value: T): T {
  if (Array.isArray(value)) return value.map(reverseKeys) as T
  if (value !== null && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).reverse().map(([key, child]) => [key, reverseKeys(child)]),
  ) as T
  return value
}
type MutablePromiseSave = { saveVersion: number; state: {
  promises: Record<string, unknown>[]; hollywood: unknown; market: { tick: number }
} }
function malformed(state: GameState, promiseId: string,
  change: (row: Record<string, unknown>, save: MutablePromiseSave) => void, cause: RegExp): void {
  const api = futureSave(), valid: unknown = JSON.parse(bytes(state))
  expect(api.validateSaveV39(valid)).toBe(valid)
  const variant = clone(valid) as MutablePromiseSave
  const row = variant.state.promises.find(p => p.promiseId === promiseId); assert.ok(row)
  change(row, variant)
  expect(() => api.validateSaveV39(variant)).toThrow(cause)
}
afterAll(() => console.info('1133-P3-COUNTERS ' + JSON.stringify(counters())))

describe('P3 first slice: public Director promises and historical meaning', () => {
  it('D01 offers fresh directing work to lawful Actors and Directors', () => {
    const input = at45()
    for (const [id, count, primary] of [[input.actorId, 2, 'actor'], [input.directorId, 1, 'director']] as const) {
      const state = proposal(input.state, id), draft = directorDraft(state, id, count)
      expect(person(state, id).role).toBe(primary)
      expect(person(state, id).skills.directing).toBeDefined()
      admitted(state)
      const before = bytes(state), rng = clone(state.rngState), receipt = quote(state, draft)
      expect(bytes(state)).toBe(before); expect(state.rngState).toEqual(rng)

      // Fresh classless P3 is refused through the existing direct attachment
      // boundary. A readable old classless row is a separate D14 construction.
      // This independent public refusal precedes the positive tagged assertion
      // so its actual unsupported behavior is visible in the first RED record.
      const classless: PromiseAttachment = { family: 'DIRECTING_COUNT', predicate: { count: 1 },
        windowStartWeek: 52, dueWeekExclusive: 112 }
      expect(core.promiseFeasibility(state, { ...draft, predicate: { count: 1 } } as PromiseDraft, 45))
        .toMatchObject({ classification: 'IMPOSSIBLE' })
      expect(() => core.attachPromise(state, id, issuer(state), classless)).toThrow(/director|predicate|select|tag/i)
      expect(bytes(state)).toBe(before)
      expect(receipt).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null, rulesVersion: 6, week: 45 })
      expect((core as unknown as { DIRECTING_PROMISE_RULES_VERSION?: number }).DIRECTING_PROMISE_RULES_VERSION).toBe(6)
      expect(core.PROMISE_RULES_VERSION).toBe(4)
      const promised = attach(state, id, draft), row = promised.promises.at(-1)!
      expect(row).toMatchObject({ family: 'DIRECTING_COUNT', predicate: draft.predicate,
        version: 6, contractId: null, progress: 0, evidenceRefs: [], outcome: null, feasibilityReceipt: receipt })
      expect(Object.keys(row.predicate).sort()).toEqual(['count', 'kind'])
      expect(ownProposal(promised, id).promises).toEqual([row.promiseId]); admitted(promised)
      expect(() => attach(state, id, { ...draft, family: 'APPEARANCE_COUNT' } as unknown as DirectorDraft))
        .toThrow(/director|DIRECTING_COUNT|predicate/i)
    }
    // Existing admitted low-directing Actor: no skill/work-history threshold.
    const low = person(input.state, 'authored-0001')
    const standing = core.careerIdentity(low).disciplines.find(row => row.discipline === 'directing')!
    expect(standing.ovr).toBeLessThan(60); expect(low.skills.directing).toBeDefined()
    expect(quote(input.state, directorDraft(input.state, low.id, 1)))
      .toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    // Explicit malformed-request discriminator, never saved or continued.
    const absent = clone(input.state)
    delete (person(absent, input.actorId).skills as Partial<typeof low.skills>).directing
    expect(quote(absent, directorDraft(absent, input.actorId, 1)))
      .toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: expect.stringMatching(/directing.*profile/i) })
  }, LEAF_TIMEOUT_MS)

  it('D02 counts only actual unrecorded Director seats through the first take', () => {
    const input = firstFilm(), promise = actualPromise(input.first.afterTake, input.promiseId)
    for (const before of [input.first.greenlit, input.first.held, input.first.scheduled]) {
      admitted(before)
      expect(before.firstTakes.filter(row => row.productionId === input.first.productionId)).toEqual([])
      expect(actualPromise(before, input.promiseId)).toMatchObject({ progress: 0, evidenceRefs: [], outcome: null })
      expect(publicTakes(before, actualPromise(before, input.promiseId))).toEqual([])
    }
    expect(input.first.held.studio.activeProductions.find(row => row.id === input.first.productionId)?.remainingTicks).toBe(5)
    expect(input.first.scheduled.operations.workflows.find(row => row.productionId === input.first.productionId)?.shootingTask?.status)
      .toBe('scheduled')
    expect(input.first.afterTake.studio.activeProductions.find(row => row.id === input.first.productionId)?.remainingTicks).toBe(4)
    expect(promise).toMatchObject({ progress: 1, evidenceRefs: [input.first.take.eventId], outcome: null })
    expect(ownTakes(input.first.afterTake, promise)).toEqual([input.first.take])
    expect(publicTakes(input.first.afterTake, promise)).toEqual([input.first.take])
    const heldDraft = { ...directorDraft(input.first.held, input.actorId), promiseId: input.promiseId }
    expect(quote(input.first.held, heldDraft)).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    expect(quote(input.first.afterTake, { ...heldDraft, predicate: { kind: 'directorCount', count: 2 } }))
      .toMatchObject({ classification: 'FRAGILE', bottleneck: PIPELINE, rulesVersion: 6 })

    // Actual zero-tick public cast-only package on an admitted detached bound
    // branch. It does not create a Director seat for this beneficiary.
    const start = bound(), other = greenlight(start.state, start.projectIds[0]!, 'authored-0002', {
      lead: start.actorId, antagonist: CAST.antagonist, support: CAST.support,
    })
    expect(other.state.studio.activeProductions.find(row => row.id === other.productionId))
      .toMatchObject({ directorId: 'authored-0002', cast: { lead: start.actorId } })
    admitted(other.state)
    expect(quote(other.state, { ...directorDraft(other.state, start.actorId), promiseId: start.promiseId }))
      .toMatchObject({ classification: 'FRAGILE', bottleneck: PIPELINE, rulesVersion: 6 })
    expect(publicTakes(other.state, actualPromise(other.state, start.promiseId))).toEqual([])
  }, LEAF_TIMEOUT_MS)

  it('D03 preserves conservative clocks and names each unavailable resource', () => {
    const empty = managedEmpty(), state = empty.state, before = bytes(state)
    expect(state.scriptDevelopment).toEqual({ mode: 'managed', projects: [] })
    expect(state.studio.activeProductions).toEqual([])
    expect(state.operations.facilities.some(row => row.capability === 'soundstage')).toBe(true)
    expect(state.promises.filter(row => row.beneficiaryPersonId === empty.actorId)).toEqual([])
    const concept = state.concepts.find(row => row.id === empty.concepts[0])!
    expect(() => act(state, { kind: 'greenlight', production: { conceptId: concept.id,
      directorId: empty.actorId, writerId: WRITER, craftIds: ['authored-0004'], cast: CAST,
      shape: SHAPE, promise: creative(state, concept.id), budget: { negative: concept.baseNegativeCost, marketing: 0 } } }))
      .toThrow(STOCK_REFUSAL)
    expect(bytes(state)).toBe(before)
    const legacy = castDraft(state, empty.actorId)
    const legacyReceipt = quote(state, legacy)
    expect(legacyReceipt).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null, rulesVersion: 4 })
    expect(quote(reopen(state), legacy)).toEqual(legacyReceipt)
    // Seven literal candidate weeks in this specified window, buffer2; this
    // count1 has55 weeks of slack. Only the real pipeline is missing.
    expect([57, 65, 73, 81, 89, 97, 105].every(week => week >= 52 && week < 112)).toBe(true)
    expect(quote(state, directorDraft(state, empty.actorId, 1)))
      .toMatchObject({ classification: 'FRAGILE', bottleneck: PIPELINE, rulesVersion: 6 })
    expect(bytes(state)).toBe(before)

    const prepared = at45(), draft = directorDraft(prepared.state, prepared.actorId)
    expect(prepared.state.scriptDevelopment.projects.filter(row => row.status === 'ready')).toHaveLength(2)
    expect(quote(prepared.state, draft)).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    const cases: { change: Partial<DirectorDraft>; classification: string; reason: string }[] = [
      { change: { predicate: { kind: 'directorCount', count: 0 } }, classification: 'IMPOSSIBLE', reason: 'the promised count must be a whole picture' },
      { change: { windowStartWeek: 51 }, classification: 'IMPOSSIBLE', reason: 'the window starts before the proposed contract' },
      { change: { dueWeekExclusive: 157 }, classification: 'IMPOSSIBLE', reason: 'the due week falls outside the proposed contract' },
      { change: { dueWeekExclusive: 52 }, classification: 'IMPOSSIBLE', reason: 'the window closes before it opens' },
      { change: { predicate: { kind: 'directorCount', count: 8 } }, classification: 'IMPOSSIBLE', reason: 'no filming week inside the window can reach that many pictures' },
      { change: { predicate: { kind: 'directorCount', count: 6 } }, classification: 'FRAGILE', reason: 'the schedule leaves no spare picture inside the window' },
      { change: { predicate: { kind: 'directorCount', count: 3 } }, classification: 'FRAGILE', reason: PIPELINE },
    ]
    const stable = bytes(prepared.state)
    for (const row of cases) expect(quote(prepared.state, { ...draft, ...row.change }))
      .toMatchObject({ classification: row.classification, bottleneck: row.reason, rulesVersion: 6 })
    expect(bytes(prepared.state)).toBe(stable)
    // The spare-event guard precedes slack under the uniform8-week clock. Do
    // not mislabel an earlier buffer refusal as an independently reached slack
    // refusal; D02 observes actual held clocks and D09 owns further reservations.
  }, LEAF_TIMEOUT_MS)

  it('D04 selects revision6 only for the explicit relevant domain and preserves pure history', () => {
    const input = at45(), plain = proposal(input.state, input.directorId)
    const cast = castDraft(plain, input.directorId), oldReceipt = quote(plain, cast)
    expect(oldReceipt.rulesVersion).toBe(4)
    let state = core.attachPromise(plain, input.directorId, issuer(plain), cast)
    const oldId = state.promises.at(-1)!.promiseId
    expect(state.promises.at(-1)).toMatchObject({ version: 4, feasibilityReceipt: oldReceipt }); admitted(state)
    const castOwn = { ...cast, promiseId: oldId }
    const original = quote(state, castOwn)
    state = proposal(state, input.actorId)
    const directing = directorDraft(state, input.actorId, 1)
    expect(quote(state, directing)).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    state = attach(state, input.actorId, directing); admitted(state)
    const newId = state.promises.at(-1)!.promiseId, before = bytes(state), rng = clone(state.rngState)
    const scoped = quote(state, castOwn)
    expect(scoped).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    expect(scoped.inputsDigest).not.toBe(original.inputsDigest)
    // Same issuer/different beneficiary activates6 before the old person filter.
    expect(state.promises.find(row => row.promiseId === oldId)).toMatchObject({ version: 4, feasibilityReceipt: oldReceipt })
    expect(quote(reverseKeys(state), castOwn)).toEqual(scoped)
    expect(quote(reopen(state), castOwn)).toEqual(scoped)
    expect(bytes(state)).toBe(before); expect(state.rngState).toEqual(rng)
    const abandoned = core.withdrawProposal(state, input.actorId, issuer(state)); admitted(abandoned)
    expect(abandoned.promises).toEqual(state.promises)
    expect(quote(abandoned, castOwn)).toEqual(original)

    // Labelled reservation-service discriminators only. Each changes one copied
    // real row; these variants are never saved, ticked, or claimed as history.
    const isolated = (change: (row: Record<string, unknown>) => void) => {
      const variant = clone(state), row = variant.promises.find(p => p.promiseId === newId)!
      change(row as unknown as Record<string, unknown>); return variant
    }
    for (const variant of [isolated(row => { row.outcome = 'SATISFIED' }),
      isolated(row => { row.dueWeekExclusive = 52 }), isolated(row => { row.windowStartWeek = 112 })]) {
      expect(quote(variant, castOwn)).toEqual(original)
    }
    const otherStudio = state.hollywood!.identities.find(row => row.studioId !== issuer(state) && row.enteredWeek !== null)
    assert.ok(otherStudio)
    const neither = isolated(row => { row.issuerStudioId = otherStudio.studioId })
    expect(quote(neither, castOwn)).toEqual(original)
    // Same beneficiary/different issuer still activates6 in this labelled
    // service-only discriminator; the altered proposal link is not saved.
    const actorCast = castDraft(state, input.actorId)
    expect(quote(neither, actorCast)).toMatchObject({ rulesVersion: 6,
      classification: 'FRAGILE', bottleneck: PIPELINE })
    const ownOnly = { ...directing, promiseId: newId }
    expect(quote(state, ownOnly)).toMatchObject({ rulesVersion: 6, classification: 'REASONABLY_ACHIEVABLE' })
    // A cast reclassification excluding that same own ID has no remaining
    // tagged relevant row; merely retaining the tag in history cannot select6.
    expect(quote(state, { ...actorCast, promiseId: newId }).rulesVersion).toBe(4)
    expect(bytes(state)).toBe(before)

    // Real winner freeze, not a fabricated replacement receipt. A root's
    // attachment stamp is retained; current scope picks the returned receipt.
    const winner = bound(), promised = actualPromise(winner.state, winner.promiseId)
    expect(promised.version).toBe(actualPromise(attached().state, winner.promiseId).version)
    expect(winner.freezeCalls.filter(row => row.promiseId === winner.promiseId).map(row => row.result))
      .toContainEqual(promised.feasibilityReceipt)
    expect(promised.feasibilityReceipt).toMatchObject({ rulesVersion: 6, week: 52 })
  }, LEAF_TIMEOUT_MS)

  it('D05 binds only the actual accepted material proposal', () => {
    const input = attached(), original = actualPromise(input.state, input.promiseId)
    const material = ownProposal(input.state, input.actorId), frozenBytes = bytes(input.state)
    const revised = proposal(input.state, input.actorId, 1.2)
    expect(ownProposal(revised, input.actorId).promises).toEqual([])
    expect(ownProposal(revised, input.actorId).digest).not.toBe(material.digest)
    expect(revised.promises).toEqual(input.state.promises)
    const draft = directorDraft(revised, input.actorId, 1), replacement = attach(revised, input.actorId, draft)
    admitted(replacement)
    expect(replacement.promises.at(-1)?.promiseId).not.toBe(input.promiseId)
    expect(ownProposal(replacement, input.actorId).digest).not.toBe(ownProposal(revised, input.actorId).digest)
    expect(replacement.promises.find(row => row.promiseId === input.promiseId)).toEqual(original)
    const withdrawn = core.withdrawProposal(replacement, input.actorId, issuer(replacement)); admitted(withdrawn)
    expect(withdrawn.talentMarket.proposals.some(row => row.talentId === input.actorId && row.issuerStudioId === issuer(withdrawn))).toBe(false)
    expect(withdrawn.promises).toEqual(replacement.promises)
    expect(withdrawn.promises.filter(row => [input.promiseId, replacement.promises.at(-1)!.promiseId].includes(row.promiseId))
      .every(row => row.contractId === null && row.outcome === null)).toBe(true)
    expect(bytes(input.state)).toBe(frozenBytes)
    const winner = bound(), row = actualPromise(winner.state, winner.promiseId)
    expect(row.contractId).not.toBeNull()
    expect(row.version).toBe(original.version)
    expect(row.feasibilityReceipt.week).toBe(52)
    expect(row.feasibilityReceipt.inputsDigest).not.toBe(original.feasibilityReceipt.inputsDigest)
    expect(winner.state.talentMarket.proposals.filter(p => p.talentId === winner.actorId)).toEqual([])
    expect(winner.state.promises.filter(p => p.beneficiaryPersonId === winner.actorId && p.contractId === row.contractId))
      .toHaveLength(1)
  }, LEAF_TIMEOUT_MS)

  it('D06 fulfills directing once from two real distinct first takes', () => {
    const input = secondFilm(), row = actualPromise(input.second.afterTake, input.promiseId)
    const real = ownTakes(input.second.afterTake, row)
    expect(real).toEqual([input.first.take, input.second.take])
    expect(new Set(real.map(t => t.productionId)).size).toBe(2)
    expect(row).toMatchObject({ progress: 2, evidenceRefs: real.map(t => t.eventId), outcome: 'SATISFIED',
      outcomeWeek: input.second.take.week, supersededByPromiseId: null })
    expect(input.second.afterTake.talentMarket.receipts.filter(r => r.eventId === row.outcomeEventId))
      .toEqual([expect.objectContaining({ kind: 'promiseOutcome', week: row.outcomeWeek, talentId: input.actorId, studioId: issuer(input.state) })])
    expect(publicTakes(input.second.afterTake, row)).toEqual(real)
    // Argument-only adversarial collection: not a saved campaign. Distinct
    // productions at exact lower edge count; duplicate IDs, upper edge, another
    // issuer and cast-only membership do not. Production order stays original.
    const first = input.first.take
    const synthetic: FirstTakeReceipt[] = [first, { ...first, eventId: 'duplicate' },
      { ...first, eventId: 'before', productionId: 'before', week: 51 },
      { ...first, eventId: 'lower', productionId: 'lower', week: 52 },
      { ...first, eventId: 'upper', productionId: 'upper', week: 112 },
      { ...first, eventId: 'otherIssuer', productionId: 'otherIssuer', studioId: 'not-the-issuer' },
      { ...first, eventId: 'castOnly', productionId: 'castOnly', directorId: WRITER, cast: { ...first.cast, lead: input.actorId } },
      input.second.take]
    expect(publicTakes({ firstTakes: synthetic }, row)).toEqual(ownTakes({ firstTakes: synthetic }, row))
    expect(publicTakes({ firstTakes: synthetic }, row).map(t => t.eventId))
      .toEqual([first.eventId, 'lower', input.second.take.eventId])
    const end = terminal208(), terminal = actualPromise(end.state, end.promiseId)
    expect(terminal).toEqual(row)
    expect(actualPromise(reopen(end.state), end.promiseId)).toEqual(row)
    const stable = bytes(end.state), repeated = core.advancePromisesWeek(end.state)
    expect(bytes(repeated)).toBe(stable)
    expect(end.state.firstTakes.filter(t => Object.values(t.cast).includes(input.actorId))).toEqual([])
    expect(core.retirementRecordFor(end.at104, input.actorId, 'actor')).toMatchObject({ announcedWeek: 104, effectiveWeek: 156 })
    expect(core.retirementRecordFor(end.at156, input.actorId, 'actor')).toMatchObject({ effectiveWeek: 156 })
    expect(counters().actualTicks).toBe(208)
    console.info('1133-P3-FILMS ' + JSON.stringify({ first: { take: input.first.take.week, release: input.first.released.market.tick,
      ticks: input.first.calls }, second: { take: input.second.take.week, release: input.second.released.market.tick,
      ticks: input.second.calls }, terminalWeek: end.state.market.tick }))
  }, LEAF_TIMEOUT_MS)

  it('D13 admits exact new promise authority and rejects malformed current saves', () => {
    const a = attached(), b = bound(), first = firstFilm(), second = secondFilm(), api = futureSave()
    const positives = [a.state, b.state, first.first.afterTake, second.second.afterTake]
    for (const state of positives) {
      admitted(state)
      const save = saves.makeSave(state); expect(save.saveVersion).toBe(39)
      expect(api.validateSaveV39(save)).toBe(save)
      expect(bytes(reopen(state))).toBe(bytes(state))
      expect(() => saves.validateSaveV38({ ...clone(save), saveVersion: 38 })).toThrow(/predicate|promise/i)
      expect(() => api.convertV39ToV38(save)).toThrow(/director|predicate|promise|discard/i)
    }
    const id = a.promiseId
    malformed(a.state, id, row => { (row.predicate as Record<string, unknown>).extra = true }, /predicate.*extra/i)
    malformed(a.state, id, row => { (row.predicate as Record<string, unknown>).seatClass = 'lead' }, /predicate.*seatClass/i)
    malformed(a.state, id, row => { (row.predicate as Record<string, unknown>).kind = 'writerCount' }, /predicate.*kind/i)
    malformed(a.state, id, row => { (row.predicate as Record<string, unknown>).count = 1.5 }, /predicate.*count/i)
    malformed(a.state, id, row => { row.family = 'APPEARANCE_COUNT' }, /DIRECTING_COUNT|directorCount|family/i)
    malformed(a.state, id, row => { row.version = 4 }, /version|revision/i)
    malformed(a.state, id, row => { (row.feasibilityReceipt as Record<string, unknown>).rulesVersion = 4 }, /rulesVersion|revision/i)
    malformed(a.state, id, row => { row.progress = 3 }, /progress/i)
    malformed(a.state, id, row => { row.evidenceRefs = ['missing-first-take'] }, /evidenceRefs/i)
    malformed(a.state, id, row => { row.supersededByPromiseId = id }, /supersededByPromiseId/i)
    malformed(b.state, id, row => { row.contractId = 'not-actual-employment' }, /contractId/i)
    malformed(b.state, id, row => { row.dueWeekExclusive = 157 }, /contractId|window|due/i)
    malformed(first.first.afterTake, id, row => { row.evidenceRefs = [first.first.take.eventId, first.first.take.eventId] }, /evidenceRefs/i)
    malformed(second.second.afterTake, id, row => { row.outcomeWeek = first.first.take.week }, /evidenceRefs|outcome/i)
    malformed(second.second.afterTake, id, row => { row.outcomeEventId = 'missing-outcome' }, /outcomeEventId/i)
    // The parent-approved guard order is whole39 proof, then explicit P3 loss
    // refusal before any older profession projection. Entrant authority cannot
    // satisfy this precise predicate cause. Never strip those real anchors.
    for (const builder of [saves.makeSaveV1, saves.makeSaveV13, saves.makeSaveV18]) {
      expect(() => builder(a.state)).toThrow(/director|promise|predicate/i)
      const invalid: GameState = { ...clone(a.state), hollywood: null }
      expect(() => builder(invalid)).toThrow()
    }
    // Genuine P3 WAIVED authority belongs to D12's separately authorized route.
  }, LEAF_TIMEOUT_MS)

  it('D14 preserves old meaning and refuses lossy reverse conversion', () => {
    for (const name of outgoingNames) {
      const old = outgoing(name), oldState = saves.stableStringify(old.save.state)
      const current = saves.migrateToLive(old.save)
      // Existing semantic boundary: fails as37/38 rather than a missing import.
      expect(current.saveVersion).toBe(39)
      expect(saves.stableStringify(current.state)).toBe(oldState)
      expect(current.state.promises).toEqual(old.save.state.promises)
      expect(current.state.firstTakes).toEqual(old.save.state.firstTakes)
      expect(current.state.careerLifecycle).toEqual(old.save.state.careerLifecycle)
      expect(current.state.rngState).toEqual(old.save.state.rngState)
      expect(saves.exportSave(futureSave().convertV39ToV38(current))).toBe(old.raw)
      expect(saves.exportSave(saves.validateSaveV38(JSON.parse(old.raw)))).toBe(old.raw)
    }
    // Explicit old-reader compatibility construction, not a naturally accepted
    // P3 history: reinterpret an actual generic-cast P1 row as old classless P3.
    // Scalar6 alone carries no new predicate meaning and must not be restamped.
    const raw = outgoing('kept-broken-week61').save
    const index = raw.state.promises.findIndex(p => p.family === 'APPEARANCE_COUNT' && p.outcome === 'SATISFIED')
    expect(index).toBeGreaterThanOrEqual(0)
    for (const version of [4, 6]) {
      const old = clone(raw), target = old.state.promises[index]!
      const replacement = { ...target, family: 'DIRECTING_COUNT' as const, predicate: { count: target.predicate.count },
        version, feasibilityReceipt: { ...target.feasibilityReceipt, rulesVersion: version } }
      old.state.promises = old.state.promises.map((row, i) => i === index ? replacement : row)
      expect(saves.validateSaveV38(old)).toBe(old)
      const oldTakes = qualifyingTakes(old.state, replacement)
      expect(oldTakes.length).toBeGreaterThanOrEqual(replacement.predicate.count)
      expect(oldTakes.every(take => Object.values(take.cast).includes(replacement.beneficiaryPersonId))).toBe(true)
      const rawBefore = saves.exportSave(old), current = saves.migrateToLive(old)
      expect(current.saveVersion).toBe(39)
      expect(current.state.promises[index]).toEqual(replacement)
      expect(qualifyingTakes(current.state, current.state.promises[index]!)).toEqual(oldTakes)
      expect(saves.exportSave(futureSave().convertV39ToV38(current))).toBe(rawBefore)
    }
    const tagged = attached(), abandoned = core.withdrawProposal(tagged.state, tagged.actorId, issuer(tagged.state))
    admitted(abandoned)
    expect(abandoned.promises).toEqual(tagged.state.promises)
    expect(() => futureSave().convertV39ToV38(saves.makeSave(abandoned))).toThrow(/director|promise|predicate|discard/i)
  }, LEAF_TIMEOUT_MS)
})
