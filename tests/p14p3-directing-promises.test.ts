// Independent 1112-A/C/D/E, 1121-A/B and 1132-A/B requirements.
// Fourteen existing leaves plus two fixed-rival leaves. Parent owns execution.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import { qualifyingTakes } from '../src/core/promises.js'
import * as promiseOwner from '../src/core/promises.js'
import * as math from '../src/core/math.js'
import * as lifecycle from '../src/core/careerLifecycle.js'
import { publicPreferredOpportunity } from '../src/core/talentMarket.js'
import { activeContract } from '../src/core/employment.js'
import type { GameState, FirstTakeReceipt, ProfessionalPromiseV30 } from '../src/core/types.js'
import type { PromiseDraft, PromiseAttachment } from '../src/core/promises.js'
import type { Action, ProfessionalPromise } from '../src/core/types.js'
import { afterTakeCancellation, afterTakeCancellationDue, lateCancellation, lateCancellationDue,
  outcomeCounters, waiverInput, waived, waiverCompleted, type DirectorSubstitute } from './helpers/p14p3-fixtures.js'
import { continuityCounters, LIFE, lifeDraft, lifecycle208, lifecycle248, lifecycleAttached,
  lifecycle260, lifecycle261, lifecycle364 } from './helpers/p14p3-fixtures.js'
import { RIVAL, rivalAuthoring196, rivalWinner208, rivalFinal260, rivalCounters } from './helpers/p14p3-fixtures.js'
import { act, actualPromise, admitted, at45, attach, attached, bound, bytes, CAST, castDraft, clone,
  counters, creative, directorDraft, firstFilm, futureSave, greenlight, issuer, managedEmpty,
  outgoing, outgoingNames, person, proposal, quote, reopen, secondFilm, sha, SHAPE, terminal208, WRITER,
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

// 1324-C / C20: three roots `migrateToLive` genuinely adds that a Save38 `outgoing()`
// fixture never carried — built from the old state by each root's own migration
// rule, never a literal (1309-X3 ruling 4 `termination`; 1320-A S5
// `sharedCompetitions`; convertV39ToV40 `firstTakeSubjects`), the same precedent
// `p14c3-save-v38.test.ts` already carries for the first two.
type WithRivalBusinesses = { hollywood: { businesses: readonly { account: { periods: readonly { movements: Record<string, number> }[] } }[] } | null }
function withRivalTermination<T extends WithRivalBusinesses>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, account: { ...business.account, periods: business.account.periods.map((period) => ({
      ...period, movements: { ...period.movements, termination: 0 } })) },
  })) } }
}
type WithRelationships = { relationships: readonly { sharedCompetitions?: number }[] }
function withSharedCompetitions<T extends WithRelationships>(state: T): T {
  return { ...state, relationships: state.relationships.map(edge => ({ ...edge, sharedCompetitions: 0 })) }
}
// 1358-N S5: Save44 (convertV43ToV44, src/core/save.ts:10776-10781) gives every relationship edge an
// empty `competitions` log and a null `romance`; a genuine Save38 `outgoing()` state never carried them.
function withEmptyCompetitionsAndRomance<T extends WithRelationships>(state: T): T {
  return { ...state, relationships: state.relationships.map(edge => ({ ...edge, competitions: [], romance: null })) }
}
type WithFirstTakes = { firstTakes: readonly unknown[]; firstTakeSubjects?: unknown }
function withFirstTakeSubjects<T extends WithFirstTakes>(state: T): T {
  return { ...state, firstTakeSubjects: { version: 1, cutoverOrdinal: state.firstTakes.length, facts: [] } }
}
// 1344-N S5: Save43 (convertV42ToV43, src/core/save.ts:10678-10686) gives every rival business an
// empty `screenplayShelving` root; a genuine Save38 `outgoing()` state never carried it.
function withEmptyScreenplayShelving<T extends WithRivalBusinesses>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, screenplayShelving: { version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 0 } })) } }
}
// 1358-F11 ruling 1: a genuine Save39 Director capture of record 1221 (manifest schema.saveVersion
// 39), pinned and loaded as p14p4p5-opportunities Q04 loads it. Production's convertV39ToV40 alone gives
// its lawful V40 state for the frozen builders. Nothing is stripped.
const EVIDENCE = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
function directorCapture40(name: string, gzipHash: string, rawHash: string) {
  expect(sha(readFileSync(new URL('1221-p4p5-outgoing-capture/MANIFEST.json', EVIDENCE))))
    .toBe('02115df5d6e7d4c33284b9a439a7c79601e1b2e807f4fa96c20149f5c84186f3')
  const zipped = readFileSync(new URL(`1221-p4p5-outgoing-capture/${name}.json.gz`, EVIDENCE)), raw = gunzipSync(zipped).toString('utf8')
  expect(sha(zipped)).toBe(gzipHash); expect(sha(raw)).toBe(rawHash)
  const parsed: unknown = JSON.parse(raw), old = saves.validateSaveV39(parsed)
  expect(old).toBe(parsed); expect(saves.exportSave(old)).toBe(raw)
  return saves.convertV39ToV40(old).state
}

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
      const save = saves.makeSave(state); expect(save.saveVersion).toBe(44)
      expect(api.validateSaveV39(save)).toBe(save)
      expect(bytes(reopen(state))).toBe(bytes(state))
      // 1320-A S9-adjacent: a bare saveVersion relabel keeps the live sharedCompetitions
      // field on every relationship edge; the frozen V31 relationship reader refuses that
      // unknown field before this leaf's own promise-shape cause is ever reached. Project
      // relationships to era 31 (the same production helper validateSaveV42 itself uses)
      // so the intended promise refusal is the one that actually fires.
      expect(() => saves.validateSaveV38({ ...clone(save), saveVersion: 38,
        state: { ...save.state, relationships: core.relationshipsAtV31(save.state.relationships) } }))
        .toThrow(/predicate|promise/i)
      // 1358-N S9 (MASKED): all four positives hold a romance track on relationship-edge-0, so
      // convertV44ToV43 refuses first (src/core/save.ts:10790), before the V39 opportunity-predicate and
      // first-take-subject guard 1344-X12 measured here (save.ts:10600-10602). Measured in 1358-X6
      // (probe G5-new-5, all four cases). The V39 guard stays covered on its own era's input by
      // tests/p14p4p5-screenplay-status.test.ts Q11 (`factOnly`'s last assertion: the genuine week-110
      // Save40 capture, downgraded once).
      expect(() => api.convertV39ToV38(save)).toThrow(/^migrateToV43: cannot downgrade or discard the romance of relationship-edge-0$/)
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
    // 1309-X3 ruling 3: these frozen builders receive the lawful V40 projection
    // (convertV41ToV40(makeSave(state)).state), not the raw live GameState --
    // fed directly, they now stop at the V25 Hollywood exact-key check on the
    // Save41 rival `termination` movement, before ever reaching this leaf's own
    // named cause.
    // 1358-N S9 (MASKED), 1358-F11 ruling 1: Save44's romance refusal (src/core/save.ts:10790) now masks
    // that lawful V40 projection for every route state that holds the promise. The 1358-X7t probe found 19
    // to 21 romance tracks on all nine candidates, lifecycleAttached() at week 248 included, and each chain
    // refused at relationship-edge-0.
    expect(() => saves.convertV41ToV40(saves.convertV42ToV41(saves.convertV43ToV42(saves.convertV44ToV43(saves.makeSave(a.state))))))
      .toThrow(/^migrateToV43: cannot downgrade or discard the romance of relationship-edge-0$/)
    // So the frozen builders take the genuine director-bound-week52 capture (Save39, a bound P3 Director
    // promise), lifted to V40 by convertV39ToV40 alone.
    const bound40 = directorCapture40('director-bound-week52',
      'b894a85ffad37378f93dc8a8e83bad926ab7a1bb857dd76e9b9926b520fec6e1', 'eae34cd10d457ad551028f3d0a160a55a74d5153b73653b257dc89a4338b040b')
    for (const builder of [saves.makeSaveV1, saves.makeSaveV13, saves.makeSaveV18]) {
      expect(() => builder(bound40)).toThrow(/director|promise|predicate/i)
      const invalid: GameState = { ...clone(bound40), hollywood: null }
      expect(() => builder(invalid)).toThrow()
    }
    // Genuine P3 WAIVED authority belongs to D12's separately authorized route.
  }, LEAF_TIMEOUT_MS)

  it('D14 preserves old meaning and refuses lossy reverse conversion', () => {
    for (const name of outgoingNames) {
      const old = outgoing(name)
      // 1344-N S5 (x2 at a318722, :396 measured: the two stringified states differ only by an added
      // `screenplayShelving` {version 1, rejections [], shelved [], commissionHoldUntilWeek 0} on
      // hollywood.businesses[0..3]; received 769,538 chars against 769,170 expected).
      // 1358-N S5 (1358-F10 ruling 1): 1358-X6 stopped this comparison at :406; convertV43ToV44 adds only
      // the empty log and null romance to every edge. 1358-X7t measured both sides equal for all six
      // captures (24 or 30 edges, no track, no log row).
      const oldState = saves.stableStringify(withEmptyCompetitionsAndRomance(withEmptyScreenplayShelving(withFirstTakeSubjects(withRivalTermination(withSharedCompetitions(old.save.state))))))
      const current = saves.migrateToLive(old.save)
      // Existing semantic boundary: fails as37/38 rather than a missing import.
      expect(current.saveVersion).toBe(44)
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
      expect(current.saveVersion).toBe(44)
      expect(current.state.promises[index]).toEqual(replacement)
      expect(qualifyingTakes(current.state, current.state.promises[index]!)).toEqual(oldTakes)
      expect(saves.exportSave(futureSave().convertV39ToV38(current))).toBe(rawBefore)
    }
    const tagged = attached(), abandoned = core.withdrawProposal(tagged.state, tagged.actorId, issuer(tagged.state))
    admitted(abandoned)
    expect(abandoned.promises).toEqual(tagged.state.promises)
    // 1358-N S9 (MASKED), 1358-F11 ruling 4: `abandoned` keeps the romance track `attached()` holds on
    // relationship-edge-0, so convertV44ToV43 refuses first (src/core/save.ts:10790), before the V39
    // opportunity-predicate and first-take-subject guard 1344-X12 measured here (save.ts:10600-10602).
    // Measured in 1358-X7t (probe G5-new-6). The V39 guard stays covered on its own era's input by
    // tests/p14p4p5-screenplay-status.test.ts Q11 (`factOnly`'s last assertion: the genuine week-110
    // Save40 capture, downgraded once).
    expect(() => futureSave().convertV39ToV38(saves.makeSave(abandoned))).toThrow(/^migrateToV43: cannot downgrade or discard the romance of relationship-edge-0$/)
  }, LEAF_TIMEOUT_MS)
})

// 1142: two additional leaves; the eight qualified declarations above are intact.
const PHYSICAL_REFUSAL = 'no filming week inside the window can reach that many pictures'
function promiseRow(state: GameState, id: string): ProfessionalPromise {
  const row = state.promises.find(p => p.promiseId === id); assert.ok(row); return row
}
function outcomeReceipt(state: GameState, row: ProfessionalPromise): void {
  expect(row.outcomeEventId).not.toBeNull()
  expect(state.talentMarket.receipts.filter(r => r.eventId === row.outcomeEventId)).toEqual([
    expect.objectContaining({ kind: 'promiseOutcome', week: row.outcomeWeek,
      talentId: row.beneficiaryPersonId, studioId: row.issuerStudioId }),
  ])
}
function outcomesFor(state: GameState, row: ProfessionalPromise) {
  return state.talentMarket.receipts.filter(r => r.kind === 'promiseOutcome'
    && r.talentId === row.beneficiaryPersonId && r.studioId === row.issuerStudioId)
}
function stableOutcome(state: GameState, id: string): void {
  admitted(state); const row = clone(promiseRow(state, id)), receipts = outcomesFor(state, row)
  expect(promiseRow(reopen(state), id)).toEqual(row)
  const again = core.advancePromisesWeek(state)
  expect(promiseRow(again, id)).toEqual(row); expect(outcomesFor(again, row)).toEqual(receipts)
}
function pureWaiverRefusal(state: GameState, id: string,
  substitute: DirectorSubstitute | PromiseAttachment, cause: RegExp): void {
  admitted(state); const before = bytes(state), row = promiseRow(state, id), draftBefore = saves.stableStringify(substitute)
  const reason = promiseOwner.waiverAccepted(state, row, substitute as PromiseAttachment, state.market.tick)
  expect(reason).toMatch(cause)
  expect(() => act(state, { kind: 'waivePromise', promiseId: id, substitute } as unknown as Action)).toThrow(cause)
  expect(bytes(state)).toBe(before); expect(saves.stableStringify(substitute)).toBe(draftBefore)
}
afterAll(() => console.info('1143-P3-OUTCOME-COUNTERS ' + JSON.stringify(outcomeCounters())))

describe('P3 second slice: cancellation and same-domain waiver', () => {
  it('D08 keeps earned work and attributes cancellation, due and termination outcomes', () => {
    const late = lateCancellation(), before = actualPromise(late.before, late.promiseId)
    expect(late.before.market.tick).toBe(108); expect(late.after.market.tick).toBe(108)
    expect(before).toMatchObject({ predicate: { kind: 'directorCount', count: 2 }, progress: 1,
      evidenceRefs: [late.first.take.eventId], outcome: null, dueWeekExclusive: 112 })
    expect(ownTakes(late.before, before)).toEqual([late.first.take])
    expect(late.cancelled).toMatchObject({ directorId: late.actorId, remainingTicks: 5 })
    expect(Object.values(late.cancelled.cast)).not.toContain(late.actorId)
    expect(late.before.operations.workflows.find(w => w.productionId === late.productionId))
      .toMatchObject({ blocker: null, shootingTask: { status: 'scheduled' } })
    expect(late.before.firstTakes.filter(t => t.productionId === late.productionId)).toEqual([])
    // Independent owner's one remaining advance vs a fresh picture's five.
    expect(108 + (late.cancelled.remainingTicks - 4)).toBe(109)
    expect(109).toBeLessThan(before.dueWeekExclusive); expect(108 + 5).toBeGreaterThanOrEqual(before.dueWeekExclusive)
    const beforeBytes = bytes(late.before), afterBytes = bytes(late.after)
    expect(promiseOwner.targetSpecificImpossibility(late.before, before, 108)).toBeNull()
    expect(promiseOwner.targetSpecificImpossibility(late.after, before, 108)).toBe(PHYSICAL_REFUSAL)
    expect(bytes(late.before)).toBe(beforeBytes); expect(bytes(late.after)).toBe(afterBytes)
    expect(late.after.studio.activeProductions.some(p => p.id === late.productionId)).toBe(false)
    expect(late.after.operations.workflows.some(w => w.productionId === late.productionId)).toBe(false)
    expect(late.after.scriptDevelopment.projects.find(p => p.id === late.projectIds[1]))
      .toMatchObject({ status: 'ready', productionId: null })
    expect(late.after.firstTakes).toEqual(late.before.firstTakes)
    expect(late.after.studio.cash).toBe(late.before.studio.cash); expect(late.after.ledger).toEqual(late.before.ledger)
    expect(late.after.relationships).toEqual(late.before.relationships)
    expect(promiseOwner.trustDrivers(late.after, null, issuer(late.after), 108).filter(d => d.kind === 'cancelledAfterFirstTake'))
      .toEqual(promiseOwner.trustDrivers(late.before, null, issuer(late.before), 108).filter(d => d.kind === 'cancelledAfterFirstTake'))
    const broken = actualPromise(late.after, late.promiseId)
    expect(broken).toMatchObject({ progress: 1, evidenceRefs: [late.first.take.eventId], outcome: 'BROKEN', outcomeWeek: 108 })
    expect(broken.outcomeCause).toMatch(/cancel/i); outcomeReceipt(late.after, broken)
    expect(outcomesFor(late.after, broken)).toHaveLength(outcomesFor(late.before, before).length + 1)
    const lateDue = lateCancellationDue()
    expect(lateDue.state.market.tick).toBe(112); expect(actualPromise(lateDue.state, late.promiseId)).toEqual(broken)
    stableOutcome(lateDue.state, late.promiseId)

    const post = afterTakeCancellation(), original = actualPromise(post.before, post.promiseId)
    expect(original).toMatchObject({ progress: 1, evidenceRefs: [post.first.take.eventId], outcome: null })
    expect(post.after.market.tick).toBe(post.before.market.tick)
    expect(actualPromise(post.after, post.promiseId)).toEqual(original)
    expect(post.after.firstTakes).toEqual(post.before.firstTakes)
    expect(ownTakes(post.after, original)).toEqual([post.first.take])
    expect(outcomesFor(post.after, original)).toEqual(outcomesFor(post.before, original))
    const conduct = post.after.relationships.flatMap(edge => edge.recent)
      .filter(d => d.kind === 'cancelledAfterFirstTake' && d.ref === post.first.productionId)
    expect(conduct.length).toBeGreaterThan(0)
    expect(conduct.every(d => d.week === post.after.market.tick && d.delta < 0)).toBe(true)
    for (const personId of [post.actorId, CAST.lead, null]) {
      const old = promiseOwner.trustDrivers(post.before, personId, issuer(post.before), post.before.market.tick)
        .filter(d => d.kind === 'cancelledAfterFirstTake')
      const now = promiseOwner.trustDrivers(post.after, personId, issuer(post.after), post.after.market.tick)
        .filter(d => d.kind === 'cancelledAfterFirstTake')
      expect(now).toHaveLength(old.length + 1)
      for (const driver of old) expect(now).toContainEqual(driver)
      expect(now).toContainEqual(expect.objectContaining({ kind: 'cancelledAfterFirstTake',
        week: post.first.take.week, positive: false }))
    }
    // A zero-tick real termination is distinct from waiting for the missed due.
    const contract = activeContract(post.after, post.actorId); assert.ok(contract)
    const cost = Math.round(contract.annualSalary / 52) * Math.min(contract.endWeekExclusive - post.after.market.tick, 26)
    expect(post.after.studio.cash).toBeGreaterThanOrEqual(cost)
    const terminated = act(clone(post.after), { kind: 'releaseTalent', talentId: post.actorId })
    admitted(terminated)
    expect(terminated.market.tick).toBe(post.after.market.tick)
    expect(terminated.studio.cash).toBe(post.after.studio.cash - cost)
    expect(terminated.ledger.slice(post.after.ledger.length)).toEqual([
      expect.objectContaining({ kind: 'termination', week: post.after.market.tick, amount: -cost, talentId: post.actorId }),
    ])
    expect(activeContract(terminated, post.actorId)).toBeUndefined()
    expect(terminated.hollywood!.employment.find(e => e.contractId === original.contractId))
      .toMatchObject({ endedWeek: post.after.market.tick })
    const terminationRow = actualPromise(terminated, post.promiseId)
    expect(terminationRow).toMatchObject({ outcome: 'BROKEN', outcomeWeek: post.after.market.tick,
      progress: 1, evidenceRefs: [post.first.take.eventId] })
    expect(terminationRow.outcomeCause).toMatch(/terminated.*early/i)
    outcomeReceipt(terminated, terminationRow); stableOutcome(terminated, post.promiseId)
    const due = afterTakeCancellationDue(), dueRow = actualPromise(due.state, due.promiseId)
    expect(due.state.market.tick).toBe(112)
    expect(dueRow).toMatchObject({ outcome: 'BROKEN', outcomeWeek: 112, progress: 1,
      evidenceRefs: [post.first.take.eventId] })
    expect(dueRow.outcomeCause).toMatch(/window closed/i); outcomeReceipt(due.state, dueRow)
    expect(outcomesFor(due.state, dueRow)).toHaveLength(outcomesFor(post.before, original).length + 1)
    stableOutcome(due.state, due.promiseId)
    console.info('1143-P3-CANCELLATION ' + JSON.stringify({ late: { cancelled: 108, due: lateDue.state.market.tick,
      firstTake: late.first.take.week }, afterTake: { cancelled: post.after.market.tick, due: due.state.market.tick },
      terminated: terminated.market.tick }))
  }, LEAF_TIMEOUT_MS)

  it('D12 waives only forward same-domain remaining work on the same contract', () => {
    const input = waiverInput(), before = bytes(input.state), rng = clone(input.state.rngState)
    expect(input.state.market.tick).toBe(61); expect(input.substitute.windowStartWeek).toBe(62)
    expect(input.original.predicate.count - input.original.progress).toBe(1)
    expect(input.receipt).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    expect(promiseOwner.waiverAccepted(input.state, input.original, input.substitute, input.state.market.tick)).toBeNull()
    expect(bytes(input.state)).toBe(before); expect(input.state.rngState).toEqual(rng)
    const change = waived(), original = actualPromise(change.state, change.promiseId)
    const successor = promiseRow(change.state, change.successorId)
    expect(original).toEqual({ ...input.original, outcome: 'WAIVED', outcomeWeek: 61,
      outcomeCause: expect.stringMatching(/substitute/i), outcomeEventId: expect.any(String),
      supersededByPromiseId: successor.promiseId })
    expect(successor).toMatchObject({ version: 6, family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 },
      contractId: input.original.contractId, issuerStudioId: input.original.issuerStudioId,
      beneficiaryPersonId: input.original.beneficiaryPersonId, progress: 0, evidenceRefs: [], outcome: null,
      windowStartWeek: 62, dueWeekExclusive: 104, supersededByPromiseId: null, feasibilityReceipt: input.receipt })
    expect(change.state.promises.filter(p => p.promiseId !== original.promiseId && p.promiseId !== successor.promiseId))
      .toEqual(change.before.promises.filter(p => p.promiseId !== original.promiseId))
    const except = (value: object, excluded: readonly string[]) => Object.fromEntries(
      Object.entries(clone(value)).filter(([key]) => !excluded.includes(key)))
    expect(except(change.state, ['promises', 'talentMarket']))
      .toEqual(except(change.before, ['promises', 'talentMarket']))
    expect(except(change.state.talentMarket, ['receipts']))
      .toEqual(except(change.before.talentMarket, ['receipts']))
    expect(change.state.firstTakes).toEqual(change.before.firstTakes)
    expect(change.state.market).toEqual(change.before.market); expect(change.state.rngState).toEqual(change.before.rngState)
    expect(change.state.studio.cash).toBe(change.before.studio.cash); expect(change.state.ledger).toEqual(change.before.ledger)
    expect(change.state.contracts).toEqual(change.before.contracts)
    expect(change.state.talentMarket.receipts.slice(0, change.before.talentMarket.receipts.length))
      .toEqual(change.before.talentMarket.receipts)
    expect(change.state.talentMarket.receipts).toHaveLength(change.before.talentMarket.receipts.length + 1)
    outcomeReceipt(change.state, original)
    for (const who of [input.actorId, null]) {
      expect(promiseOwner.trustDrivers(change.state, who, issuer(change.state), 61))
        .toEqual(promiseOwner.trustDrivers(change.before, who, issuer(change.before), 61))
    }
    expect(promiseOwner.trustDescriptor(change.state, input.actorId, issuer(change.state), 61))
      .toEqual(promiseOwner.trustDescriptor(change.before, input.actorId, issuer(change.before), 61))
    expect(qualifyingTakes(change.state, successor)).toEqual([])
    stableOutcome(change.state, original.promiseId)

    // All command refusals use complete admitted positive campaigns.
    pureWaiverRefusal(change.state, original.promiseId, input.substitute, /already settled|terminal/i)
    const unbound = attached()
    pureWaiverRefusal(unbound.state, unbound.promiseId, { ...input.substitute, windowStartWeek: 62 }, /nobody took|commitment|unbound/i)
    pureWaiverRefusal(input.state, input.promiseId, { family: 'DIRECTING_COUNT',
      predicate: { kind: 'directorCount', count: 2 }, windowStartWeek: 52, dueWeekExclusive: 112 }, /identical/i)
    pureWaiverRefusal(input.state, input.promiseId, { ...input.substitute, windowStartWeek: 61 }, /forward|waiver/i)
    const nothingDelivered = bound(), owed = actualPromise(nothingDelivered.state, nothingDelivered.promiseId)
    expect(owed).toMatchObject({ predicate: { kind: 'directorCount', count: 2 }, progress: 0, evidenceRefs: [] })
    const short: DirectorSubstitute = { ...input.substitute, windowStartWeek: 53 }
    expect(quote(nothingDelivered.state, { ...directorDraft(nothingDelivered.state, nothingDelivered.actorId, 1),
      windowStartWeek: 53, dueWeekExclusive: 104, promiseId: owed.promiseId }))
      .toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    pureWaiverRefusal(nothingDelivered.state, owed.promiseId, short, /only 1 of the 2 pictures still owed/i)
    pureWaiverRefusal(input.state, input.promiseId, { ...input.substitute, predicate: { kind: 'directorCount', count: 0 } },
      /count|whole|only 0|pictures still owed/i)
    pureWaiverRefusal(input.state, input.promiseId, { ...input.substitute, dueWeekExclusive: 157 }, /contract|due|window/i)
    pureWaiverRefusal(input.state, input.promiseId, { ...input.substitute, family: 'APPEARANCE_COUNT', predicate: { count: 1 } },
      /domain|directing|Director/i)
    const old = outgoing('before-waiver-week104'), oldLive = saves.migrateToLive(old.save).state
    admitted(oldLive)
    const oldOpen = oldLive.promises.filter(p => p.outcome === null && p.contractId !== null && p.family === 'APPEARANCE_COUNT')
    expect(oldOpen).toHaveLength(1)
    const oldRow = oldOpen[0]!
    pureWaiverRefusal(oldLive, oldRow.promiseId, { family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 2 },
      windowStartWeek: 105, dueWeekExclusive: 194 }, /domain|directing|Director/i)
    // Reader/service-only old P3 is still generic cast; no naturally offered old P3 is invented.
    const compatibility = clone(old.save)
    compatibility.state.promises = compatibility.state.promises.map(p => p.promiseId === oldRow.promiseId
      ? { ...p, family: 'DIRECTING_COUNT' as const, predicate: { count: p.predicate.count } } : p)
    expect(saves.validateSaveV38(compatibility)).toBe(compatibility)
    const compatibleLive = saves.migrateToLive(compatibility).state; admitted(compatibleLive)
    const legacyRow = promiseRow(compatibleLive, oldRow.promiseId)
    const legacyDraft: PromiseAttachment = { family: 'APPEARANCE_COUNT', predicate: { count: 2 },
      windowStartWeek: 105, dueWeekExclusive: 194 }
    expect(promiseOwner.waiverAccepted(compatibleLive, legacyRow, legacyDraft, 104))
      .toBe(promiseOwner.waiverAccepted(oldLive, oldRow, legacyDraft, 104))

    // Explicit pure-argument trust discriminator. These two synthetic terminal
    // rows are not recorded campaign authority: never saved, acted on or ticked.
    // The genuine accepted original/request remain unchanged, and the terminal
    // rows must not consume schedule reservations before trust alone refuses.
    const distrust = clone(input.state)
    distrust.promises = [...distrust.promises, ...[0, 1].map(i => ({ ...clone(input.original),
      promiseId: `read-only-distrust-${i}`, outcome: 'BROKEN' as const, outcomeWeek: 60 - i,
      outcomeCause: 'synthetic argument-only trust discriminator', outcomeEventId: `read-only-outcome-${i}` }))]
    const distrustBefore = saves.stableStringify(distrust)
    expect(promiseOwner.trustDescriptor(distrust, input.actorId, issuer(distrust), 61).label).toBe('Distrusted')
    expect(quote(distrust, { ...directorDraft(distrust, input.actorId, 1),
      windowStartWeek: 62, dueWeekExclusive: 104, promiseId: input.promiseId }))
      .toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    expect(promiseOwner.waiverAccepted(distrust, input.original, input.substitute, 61))
      .toBe('this person no longer trusts this studio enough to accept a substitute for what was promised')
    expect(saves.stableStringify(distrust)).toBe(distrustBefore)

    // 1142's pending D13 WAIVED authority: whole-current positives FIRST.
    admitted(change.state)
    malformed(change.state, original.promiseId, p => { p.supersededByPromiseId = null }, /substitut|successor/i)
    malformed(change.state, original.promiseId, p => { p.supersededByPromiseId = 'missing-promise' }, /supersededByPromiseId|substitut/i)
    malformed(change.state, original.promiseId, p => { p.supersededByPromiseId = original.promiseId }, /supersededByPromiseId|itself/i)
    // A wrong-existing-third-target control is pending a genuine third root;
    // neither its presence nor a fabricated compatible promise is assumed.
    malformed(change.state, successor.promiseId, p => { p.contractId = 'not-an-employment-contract' }, /contractId|contract/i)
    malformed(change.state, successor.promiseId, p => { p.family = 'APPEARANCE_COUNT'; p.predicate = { count: 1 } },
      /domain|Director|directing|substitut|successor/i)
    malformed(change.state, successor.promiseId, p => { p.windowStartWeek = 61 }, /forward|window|waiv/i)
    const done = waiverCompleted(), finalOriginal = actualPromise(done.state, done.promiseId)
    const finalSuccessor = promiseRow(done.state, done.successorId)
    expect(done.state.market.tick).toBe(104); expect(finalOriginal).toEqual(original)
    expect(finalSuccessor).toMatchObject({ outcome: 'SATISFIED', outcomeWeek: done.second.take.week, progress: 1,
      evidenceRefs: [done.second.take.eventId], supersededByPromiseId: null })
    expect(done.second.take.eventId).not.toBe(done.first.take.eventId)
    expect(qualifyingTakes(done.state, finalSuccessor)).toEqual([done.second.take])
    outcomeReceipt(done.state, finalSuccessor)
    stableOutcome(done.state, original.promiseId); stableOutcome(done.state, finalSuccessor.promiseId)
    for (const state of [change.state, done.state]) {
      admitted(state); const save = saves.makeSave(state)
      expect(futureSave().validateSaveV39(save)).toBe(save)
      // 1320-A S9-adjacent: a bare saveVersion relabel keeps the live sharedCompetitions
      // field on every relationship edge; the frozen V31 relationship reader refuses that
      // unknown field before this leaf's own promise-shape cause is ever reached. Project
      // relationships to era 31 (the same production helper validateSaveV42 itself uses)
      // so the intended promise refusal is the one that actually fires.
      expect(() => saves.validateSaveV38({ ...clone(save), saveVersion: 38,
        state: { ...save.state, relationships: core.relationshipsAtV31(save.state.relationships) } }))
        .toThrow(/predicate|promise/i)
      // 1358-N S9 (MASKED): both states descend from `attached()`, whose relationship-edge-0 already holds
      // a romance track, so convertV44ToV43 refuses first (src/core/save.ts:10790), before the V39
      // opportunity-predicate and first-take-subject guard (save.ts:10600-10602) this pattern matched
      // under Save43. Measured for `change.state` in 1358-X6 and for `done.state` in 1358-X7t (probe
      // N-0531). The V39 guard stays covered on its own era's input by
      // tests/p14p4p5-screenplay-status.test.ts Q11 (`factOnly`'s last assertion: the genuine week-110
      // Save40 capture, downgraded once).
      expect(() => futureSave().convertV39ToV38(save)).toThrow(/^migrateToV43: cannot downgrade or discard the romance of relationship-edge-0$/)
      // 1309-X3 ruling 3: fed the raw live GameState, these frozen builders now
      // stop at the V25 Hollywood exact-key check on the Save41 rival
      // `termination` movement; they receive the lawful V40 projection instead.
      // 1358-N S9 (MASKED), 1358-F11 ruling 1: the same romance refusal now masks that projection for both
      // states (1358-X7t probe: 19 and 21 tracks, refusing at relationship-edge-0), so the frozen builders
      // take a genuine capture below.
      expect(() => saves.convertV41ToV40(saves.convertV42ToV41(saves.convertV43ToV42(saves.convertV44ToV43(save)))))
        .toThrow(/^migrateToV43: cannot downgrade or discard the romance of relationship-edge-0$/)
    }
    // 1358-F11 ruling 1: the genuine director-waived-week61 capture (Save39: promise-0 WAIVED and its open
    // successor promise-1, the 1221 runtime's committed waiver) holds WAIVED authority; convertV39ToV40
    // alone lifts it to V40.
    const waived40 = directorCapture40('director-waived-week61',
      '95ca93ba0a0f16b1c11ad34960a9617217685a681e8ad27ebf896e75f1debb0e', 'ad25e44bde2ec18bef17a37a252de4ee9323dd0d7b50dbdaf424be50a5d9abce')
    for (const builder of [saves.makeSaveV1, saves.makeSaveV13, saves.makeSaveV18])
      expect(() => builder(waived40)).toThrow(/director|promise|predicate/i)
    console.info('1143-P3-WAIVER ' + JSON.stringify({ waived: change.state.market.tick, windowStart: input.substitute.windowStartWeek,
      originalTake: done.first.take.week, substituteTake: done.second.take.week, due: done.state.market.tick }))
  }, LEAF_TIMEOUT_MS)
})

// 1148: independent additions; ten qualified leaf bodies above stay byte-exact.
function selectedReservations(state: GameState, draft: PromiseDraft): ProfessionalPromise[] {
  const attachedIds = new Set(state.talentMarket.proposals.flatMap(p => p.promises))
  const from = Math.max(state.market.tick, draft.windowStartWeek), selected = new Map<string, ProfessionalPromise>()
  for (const row of state.promises) if (row.outcome === null && (row.contractId !== null || attachedIds.has(row.promiseId))
    && row.promiseId !== draft.promiseId && row.dueWeekExclusive > from && row.windowStartWeek < draft.dueWeekExclusive
    && (row.beneficiaryPersonId === draft.beneficiaryPersonId || row.issuerStudioId === draft.issuerStudioId))
    selected.set(row.promiseId, row)
  return [...selected.values()]
}
function quoteMaterial(state: GameState, draft: PromiseDraft) {
  const before = bytes(state), draftBefore = saves.stableStringify(draft), rng = clone(state.rngState)
  const spy = vi.spyOn(math, 'fnv1a64')
  try {
    const result = quote(state, draft)
    const matches = spy.mock.calls.flatMap((args, index) => spy.mock.results[index]?.type === 'return'
      && spy.mock.results[index]?.value === result.inputsDigest ? [args[0]] : [])
    expect(matches, 'actual imported hash call producing this public receipt').toHaveLength(1)
    const material: unknown = JSON.parse(matches[0]!)
    expect(bytes(state)).toBe(before); expect(state.rngState).toEqual(rng)
    expect(saves.stableStringify(draft)).toBe(draftBefore)
    return { result, material }
  } finally { spy.mockRestore() }
}
function reservationMaterial(material: unknown, ids: Set<string>): unknown[][] {
  const found: unknown[][] = []
  const walk = (value: unknown): void => {
    if (!Array.isArray(value)) return
    if (typeof value[0] === 'string' && ids.has(value[0])) found.push(value)
    else for (const child of value) walk(child)
  }
  walk(material); return found
}
function currentRow(state: GameState, id: string): ProfessionalPromise {
  const row = promiseRow(state, id); expect(row.promiseId).toBe(id); return row
}
afterAll(() => console.info('1149-P3-CONTINUITY-COUNTERS ' + JSON.stringify(continuityCounters())))

describe('P3 third slice: reservations, profession chronology and successor proof', () => {
  it('D09 reserves the actual union and freezes a changed receipt without restamping its root', () => {
    const input = at45(); let state = proposal(input.state, input.directorId)
    const cast = castDraft(state, input.directorId)
    state = core.attachPromise(state, input.directorId, issuer(state), cast)
    const castId = state.promises.at(-1)!.promiseId
    expect(currentRow(state, castId).version).toBe(4); admitted(state)
    const originalCastQuote = quote(state, { ...cast, promiseId: castId })
    state = proposal(state, input.actorId)
    state = attach(state, input.actorId, directorDraft(state, input.actorId, 1))
    const ownId = state.promises.at(-1)!.promiseId; admitted(state)
    const rivalId = 'studio-de11f27b-r01'
    expect(state.hollywood!.identities.find(row => row.studioId === rivalId)?.enteredWeek).not.toBeNull()
    expect(core.marketEligibility(state, input.actorId).proposers).toContain(rivalId)
    // A real core-public attachment. No automatic rival policy, feasible rival
    // screenplay, winner or promised rival work is inferred from this authority.
    const rivalPrice = core.proposalDraft(state, rivalId, input.actorId, 104, 1.25, 45)
    expect(rivalPrice.startWeek).toBe(52)
    state = core.submitProposal(state, { talentId: input.actorId, issuerStudioId: rivalId, termWeeks: 104, premiumTier: 1.25 })
    const rivalDraft = { ...directorDraft(state, input.actorId, 1), issuerStudioId: rivalId }
    const actualRivalReceipt = quote(state, rivalDraft)
    state = core.attachPromise(state, input.actorId, rivalId, rivalDraft)
    const rivalPromiseId = state.promises.at(-1)!.promiseId
    expect(currentRow(state, rivalPromiseId)).toMatchObject({ contractId: null, outcome: null,
      issuerStudioId: rivalId, beneficiaryPersonId: input.actorId, feasibilityReceipt: actualRivalReceipt })
    admitted(state)
    const draft = { ...directorDraft(state, input.actorId, 6), promiseId: ownId }
    const selected = selectedReservations(state, draft)
    expect(selected.map(p => p.promiseId).sort()).toEqual([castId, rivalPromiseId].sort())
    expect(selected.reduce((sum, p) => sum + Math.max(0, p.predicate.count - p.progress), 0)).toBe(2)
    expect([57, 65, 73, 81, 89, 97, 105]).toHaveLength(7)
    const observed = quoteMaterial(state, draft)
    expect(observed.result).toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 6,
      bottleneck: 'promises already made to this person exhaust the window' })
    expect(reservationMaterial(observed.material, new Set(state.promises.map(p => p.promiseId))))
      .toEqual(selected.map(p => [p.promiseId, p.family, p.issuerStudioId, p.beneficiaryPersonId,
        p.predicate, p.windowStartWeek, p.dueWeekExclusive, p.progress]))
    const withdrawn = core.withdrawProposal(state, input.actorId, rivalId); admitted(withdrawn)
    expect(withdrawn.promises).toEqual(state.promises)
    expect(selectedReservations(withdrawn, draft).map(p => p.promiseId)).toEqual([castId])
    expect(quote(withdrawn, draft)).toMatchObject({ classification: 'FRAGILE', rulesVersion: 6,
      bottleneck: 'the schedule leaves no spare picture inside the window' })
    const allWithdrawn = core.withdrawProposal(withdrawn, input.actorId, issuer(withdrawn)); admitted(allWithdrawn)
    expect(allWithdrawn.promises).toEqual(state.promises)
    expect(quote(allWithdrawn, { ...cast, promiseId: castId })).toEqual(originalCastQuote)
    // Explicit argument-only excluded-membership controls; never saved/ticked.
    for (const mutate of [
      (p: ProfessionalPromise) => { p.outcome = 'SATISFIED' },
      (p: ProfessionalPromise) => { p.dueWeekExclusive = 52 },
      (p: ProfessionalPromise) => { p.windowStartWeek = 112 },
      (p: ProfessionalPromise) => { p.issuerStudioId = rivalId; p.beneficiaryPersonId = WRITER },
    ]) {
      const variant = clone(withdrawn), row = promiseRow(variant, ownId); mutate(row)
      const before = saves.stableStringify(variant), result = quote(variant, { ...cast, promiseId: castId })
      expect(result).toEqual(originalCastQuote); expect(saves.stableStringify(variant)).toBe(before)
    }
    const attachedState = lifecycleAttached(), frozen = lifecycle260()
    const castBefore = attachedState.castBefore, stored = currentRow(frozen.state, frozen.castId)
    expect(castBefore).toMatchObject({ version: 4, feasibilityReceipt: { rulesVersion: 4, week: 248 } })
    expect(currentRow(attachedState.state, attachedState.castId)).toEqual(castBefore)
    expect(quote(attachedState.state, { ...lifeDraft(attachedState.state, LIFE.other, false), promiseId: attachedState.castId }))
      .toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    expect(stored).toMatchObject({ version: 4, feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6, week: 260 } })
    expect(frozen.freezeCalls.filter(c => c.promiseId === frozen.castId).map(c => c.result)).toContainEqual(stored.feasibilityReceipt)
    expect(frozen.freezeCalls.filter(c => c.promiseId === frozen.castId).every(c => c.rootVersion === 4)).toBe(true)
    expect(currentRow(frozen.state, frozen.directorPromiseId)).toMatchObject({ version: 6, predicate: { kind: 'directorCount', count: 1 } })
    expect(currentRow(reopen(frozen.state), frozen.castId)).toEqual(stored)
    console.info('1149-P3-RESERVATIONS ' + JSON.stringify({ rivalClassification: actualRivalReceipt.classification,
      scriptIds: frozen.projectIds, boundWeek: frozen.state.market.tick, castId: frozen.castId,
      directorId: frozen.directorPromiseId, prices: frozen.prices }))
  }, LEAF_TIMEOUT_MS)

  it('D10 keeps a newly bound Director obligation lawful after its completed Actor episode', () => {
    const start = lifecycle208(); admitted(start.state)
    expect(lifecycle.assignmentRefusal(start.state, LIFE.director, 208, 'director')).toBeNull()
    expect(lifecycle.assignmentRefusal(start.state, LIFE.director, 208, 'actor')).toMatch(/retired|retirement/i)
    expect(core.retirementRecordFor(start.state, LIFE.director)).toBeUndefined()
    expect(core.retirementRecordFor(start.state, LIFE.director, 'actor')).toEqual(start.actorRecord)
    const at248 = lifecycle248()
    expect(core.caseForTalent(at248.state, LIFE.director)).toMatchObject({ openedWeek: 248, decisionWeek: 260 })
    const boundNow = lifecycle260(), boundRow = currentRow(boundNow.state, boundNow.directorPromiseId)
    // All actual row/employer/case identities are established before outcome.
    expect(boundRow).toMatchObject({ beneficiaryPersonId: LIFE.director, issuerStudioId: issuer(boundNow.state),
      family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 }, windowStartWeek: 260, dueWeekExclusive: 300 })
    expect(boundRow.contractId).not.toBeNull()
    expect(boundRow).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [] })
    const after = lifecycle261(), row = currentRow(after.state, after.directorPromiseId)
    expect(after.state.market.tick).toBe(261)
    expect(row).toEqual(boundRow)
    expect(outcomesFor(after.state, row)).toEqual(outcomesFor(boundNow.state, boundRow))
    expect(after.state.contracts.find(c => c.talentId === LIFE.director))
      .toEqual(boundNow.state.contracts.find(c => c.talentId === LIFE.director))
    const dispatch = after.admissionCalls.filter(c => c.personId === LIFE.director && c.week === 261)
    expect(dispatch.length, 'actual promise-owner admission calls observed inside the real tick').toBeGreaterThan(0)
    expect(dispatch.every(c => c.requested === 'director')).toBe(true)
    expect(core.retirementRecordFor(after.state, LIFE.director, 'actor')).toEqual(start.actorRecord)
    const end = lifecycle364(), E = end.current.effectiveWeek
    expect(core.retirementRecordFor(end.state, LIFE.other)).toBeUndefined()
    const shape = { ...lifeDraft(end.state, LIFE.other, true), predicate: { kind: 'directorCount' as const, count: 2 },
      startWeek: E, termWeeks: 52, windowStartWeek: E, dueWeekExclusive: E + 52 }
    expect(quote(end.state, shape)).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    expect(quote(end.state, { ...shape, beneficiaryPersonId: LIFE.director }))
      .toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 6,
        bottleneck: 'retirement leaves too few qualifying production seats inside the window' })
    const p3 = quoteMaterial(end.state, { ...shape, beneficiaryPersonId: LIFE.director })
    const acting = quoteMaterial(end.state, { ...shape, family: 'APPEARANCE_COUNT', predicate: { count: 2 },
      beneficiaryPersonId: LIFE.director })
    assert.ok(Array.isArray(p3.material) && Array.isArray(acting.material))
    const boundaries = (items: unknown[]) => items.filter(item => Array.isArray(item)
      && ['retirement', 'requestedRetirement'].includes(String(item[0])))
    expect(boundaries(p3.material)).toEqual([['retirement', end.current.status, E]])
    expect(boundaries(acting.material)).toEqual([['retirement', end.current.status, E],
      ['requestedRetirement', 'actor', 'retired', 208]])
    expect(acting.result.classification).toBe('IMPOSSIBLE')
    const player = firstFilm(), held = actualPromise(player.first.held, player.promiseId)
    expect(quote(player.first.held, { ...directorDraft(player.first.held, player.actorId), promiseId: held.promiseId }))
      .toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    expect(quote(player.first.afterTake, { ...directorDraft(player.first.afterTake, player.actorId), promiseId: held.promiseId }))
      .toMatchObject({ classification: 'FRAGILE', bottleneck: PIPELINE, rulesVersion: 6 })
    console.info('1149-P3-LIFECYCLE ' + JSON.stringify({ bound: 260, firstDisposition: 261,
      announced: end.current.announcedWeek, effective: E, actorRetired: start.actorRecord!.retiredWeek }))
  }, LEAF_TIMEOUT_MS)

  it('D11 preserves promise outcomes through actual current-profession retirement', () => {
    const player = terminal208(), terminal = actualPromise(player.state, player.promiseId)
    const earned = actualPromise(player.second.afterTake, player.promiseId)
    expect(earned.outcome).toBe('SATISFIED')
    expect(core.retirementRecordFor(player.at104, player.actorId, 'actor')).toMatchObject({
      profession: 'actor', status: 'announced', announcedWeek: 104, effectiveWeek: 156, retiredWeek: null })
    for (const state of [player.at156, player.state])
      expect(core.retirementRecordFor(state, player.actorId, 'actor')).toMatchObject({
        profession: 'actor', status: 'retired', announcedWeek: 104, effectiveWeek: 156, retiredWeek: 156 })
    for (const state of [player.at104, player.at156, player.state]) {
      admitted(state); expect(actualPromise(state, player.promiseId)).toEqual(earned)
      expect(state.firstTakes.filter(t => t.eventId === player.first.take.eventId || t.eventId === player.second.take.eventId))
        .toEqual([player.first.take, player.second.take])
      outcomeReceipt(state, terminal); stableOutcome(state, player.promiseId)
    }
    const at260 = lifecycle260(), at261 = lifecycle261(), end = lifecycle364()
    const original = currentRow(at260.state, at260.directorPromiseId)
    expect(currentRow(at261.state, at261.directorPromiseId)).toEqual(original)
    const due = currentRow(end.at300, end.directorPromiseId)
    expect(due).toMatchObject({ outcome: 'BROKEN', outcomeWeek: 300, progress: 0, evidenceRefs: [] })
    expect(due.outcomeCause).toMatch(/window closed/i)
    outcomeReceipt(end.at300, due); stableOutcome(end.at300, due.promiseId)
    expect(currentRow(end.state, due.promiseId)).toEqual(due)
    outcomeReceipt(end.state, due); stableOutcome(end.state, due.promiseId)
    expect(core.retirementRecordFor(end.state, LIFE.director, 'actor')).toEqual(end.actorRecord)
    expect(end.state.careerLifecycle.professionChanges.filter(c => c.personId === LIFE.director)).toEqual(end.changes)
    expect(core.retirementRecordFor(end.state, LIFE.director)).toEqual(end.current)
    // Re-evaluation and reload preserve unrelated conduct as well as outcomes;
    // ordinary ticking may lawfully add other people's history and trust facts.
    for (const state of [end.at300, end.state]) {
      const before = bytes(state), conduct = clone(state.relationships)
      const trust = promiseOwner.trustDrivers(state, LIFE.director, issuer(state), state.market.tick)
      const again = core.advancePromisesWeek(state)
      expect(again.relationships).toEqual(conduct)
      expect(promiseOwner.trustDrivers(again, LIFE.director, issuer(again), again.market.tick)).toEqual(trust)
      expect(bytes(state)).toBe(before); expect(bytes(reopen(state))).toBe(before)
    }
    console.info('1149-P3-OUTCOME-HISTORY ' + JSON.stringify({ playerTerminal: player.state.market.tick,
      directorDue: due.outcomeWeek, directorAnnouncement: end.current.announcedWeek, final: end.state.market.tick }))
  }, LEAF_TIMEOUT_MS)

  it('D13W refuses a nonaccepted receipt on an actual Director waiver successor', () => {
    const first = waived(), original = currentRow(first.state, first.promiseId)
    const successor = currentRow(first.state, first.successorId)
    admitted(first.state); expect(currentRow(reopen(first.state), successor.promiseId)).toEqual(successor)
    for (const classification of ['FRAGILE', 'IMPOSSIBLE']) malformed(first.state, successor.promiseId, row => {
      const receipt = row.feasibilityReceipt as Record<string, unknown>
      receipt.classification = classification; receipt.bottleneck = 'explicit detached nonaccepted receipt discriminator'
    }, /successor must carry an accepted reasonably achievable receipt/i)
    const next: DirectorSubstitute = { family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 },
      windowStartWeek: 63, dueWeekExclusive: 104 }
    expect(successor).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [], windowStartWeek: 62, dueWeekExclusive: 104 })
    const contract = activeContract(first.state, successor.beneficiaryPersonId)
    assert.ok(contract)
    const draft = { ...next, issuerStudioId: successor.issuerStudioId, beneficiaryPersonId: successor.beneficiaryPersonId,
      startWeek: contract.startWeek, termWeeks: contract.termWeeks, promiseId: successor.promiseId }
    const receipt = quote(first.state, draft)
    expect(receipt).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 })
    expect(promiseOwner.trustDescriptor(first.state, first.actorId, issuer(first.state), 61).label).not.toBe('Distrusted')
    expect(promiseOwner.waiverAccepted(first.state, successor, next, 61)).toBeNull()
    const preimage = bytes(first.state)
    const chain = act(clone(first.state), { kind: 'waivePromise', promiseId: successor.promiseId, substitute: next } as unknown as Action)
    admitted(chain); expect(chain.market.tick).toBe(61); expect(bytes(first.state)).toBe(preimage)
    const added = chain.promises.filter(p => !first.state.promises.some(old => old.promiseId === p.promiseId))
    expect(added).toHaveLength(1); const last = added[0]!
    expect(currentRow(chain, original.promiseId)).toEqual(original)
    expect(currentRow(chain, successor.promiseId)).toMatchObject({ outcome: 'WAIVED', outcomeWeek: 61,
      progress: 0, evidenceRefs: [], supersededByPromiseId: last.promiseId, feasibilityReceipt: successor.feasibilityReceipt })
    expect(last).toMatchObject({ version: 6, family: 'DIRECTING_COUNT', predicate: next.predicate,
      contractId: successor.contractId, beneficiaryPersonId: successor.beneficiaryPersonId, issuerStudioId: successor.issuerStudioId,
      progress: 0, evidenceRefs: [], outcome: null, windowStartWeek: 63, dueWeekExclusive: 104, feasibilityReceipt: receipt })
    expect(qualifyingTakes(chain, last)).toEqual([])
    expect(chain.firstTakes).toEqual(first.state.firstTakes)
    expect(chain.talentMarket.receipts.slice(0, first.state.talentMarket.receipts.length)).toEqual(first.state.talentMarket.receipts)
    expect(chain.talentMarket.receipts).toHaveLength(first.state.talentMarket.receipts.length + 1)
    outcomeReceipt(chain, currentRow(chain, original.promiseId)); outcomeReceipt(chain, currentRow(chain, successor.promiseId))
    expect(bytes(reopen(chain))).toBe(bytes(chain))
    malformed(chain, original.promiseId, row => { row.supersededByPromiseId = last.promiseId },
      /later successor belonging to exactly one waiver/i)
    console.info('1149-P3-WAIVER-CHAIN ' + JSON.stringify({ week: chain.market.tick,
      ids: [original.promiseId, successor.promiseId, last.promiseId], windows: [62, 63], due: 104 }))
  }, LEAF_TIMEOUT_MS)
})

// 1154: one fixed rival attempt; no edits to the fourteen bodies above.
afterAll(() => console.info('1155-P3-RIVAL-COUNTERS ' + JSON.stringify(rivalCounters())))
describe('P3 fixed rival: public credit, ordinary contest and distinct staffing', () => {
  it('D07 authors and fulfills a real rival promise to a credited primary Actor', () => {
    const winner = rivalWinner208(), row = currentRow(winner.state, winner.promiseId)
    admitted(winner.state)
    expect(person(winner.state, RIVAL.focus).role).toBe('actor')
    expect(winner.credit.state.studio.releasedFilms.find(f => f.productionId === winner.credit.productionId)?.participants?.director.talentId)
      .toBe(RIVAL.focus)
    expect(row).toMatchObject({ family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 }, version: 6,
      issuerStudioId: RIVAL.studio, beneficiaryPersonId: RIVAL.focus, contractId: winner.employment.contractId,
      windowStartWeek: 208, dueWeekExclusive: 416, outcome: null, progress: 0, evidenceRefs: [],
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6, week: 208 } })
    expect(currentRow(reopen(winner.state), row.promiseId)).toEqual(row)
    // Expected policy work is asserted only after actual winning tagged authority.
    const done = rivalFinal260()
    expect(done.state.market.tick).toBe(260)
    assert.ok(done.packages.some(p => p.week >= 208), 'actual Ready screenplay reaches the rival package boundary within the fixed route')
    expect(done.seated, 'bound promised primary Actor is actually selected as Director').toBeDefined()
    assert.ok(done.seated)
    expect(done.seated.state.hollywood!.businesses.find(b => b.studioId === RIVAL.studio)!.productions
      .find(p => p.id === done.seated!.productionId)?.directorId).toBe(RIVAL.focus)
    expect(currentRow(done.seated.state, row.promiseId)).toMatchObject({ outcome: null, progress: 0, evidenceRefs: [] })
    expect(done.takes, 'real rival first take fulfills the promised Director seat').toHaveLength(1)
    const take = done.takes[0]!
    expect(take).toMatchObject({ studioId: RIVAL.studio, directorId: RIVAL.focus, productionId: done.seated.productionId })
    expect(take.week).toBeGreaterThanOrEqual(row.windowStartWeek); expect(take.week).toBeLessThan(row.dueWeekExclusive)
    expect(done.released, 'same genuine production releases by260').toBeDefined()
    assert.ok(done.released && done.released.provenance === 'simulation/v1')
    expect(done.released.credits).toContainEqual(expect.objectContaining({ talentId: RIVAL.focus, role: 'director' }))
    expect(done.released.result.productionId).toBe(take.productionId)
    const terminal = currentRow(done.state, row.promiseId)
    expect(terminal).toMatchObject({ outcome: 'SATISFIED', outcomeWeek: take.week, progress: 1,
      evidenceRefs: [take.eventId], feasibilityReceipt: row.feasibilityReceipt })
    const independent = done.state.firstTakes.filter(t => t.studioId === RIVAL.studio && t.directorId === RIVAL.focus
      && t.week >= row.windowStartWeek && t.week < row.dueWeekExclusive)
    expect(independent).toContainEqual(take)
    expect(qualifyingTakes(done.state, terminal)).toEqual(independent)
    outcomeReceipt(done.state, terminal); stableOutcome(done.state, terminal.promiseId)
    expect(promiseOwner.trustDrivers(done.state, RIVAL.focus, RIVAL.studio, 260))
      .toContainEqual(expect.objectContaining({ kind: 'promiseKept', week: take.week, positive: true }))
    expect(currentRow(reopen(done.state), row.promiseId)).toEqual(terminal)
    console.info('1155-P3-RIVAL-WORK ' + JSON.stringify({ bootstrapTake: winner.credit.take.week,
      bootstrapRelease: winner.credit.releaseWeek, bootstrapReturned: winner.credit.returnedReleaseWeek,
      bootstrapCalls: winner.credit.filmCalls, vacancy: RIVAL.vacancy, bound: 208, promiseId: row.promiseId,
      workWeek: done.seated.workWeek, firstTake: take.week, releaseWeek: done.released.result.releaseTick, final: 260 }))
  }, LEAF_TIMEOUT_MS)

  it('D18 uses the declared rival strategy and legal distinct staffing', () => {
    // This successful196 cache is independent of a failed later208 contest.
    const early = rivalAuthoring196(); admitted(early.state)
    expect(early.state.market.tick).toBe(196)
    expect(person(early.state, RIVAL.focus).role).toBe('actor')
    const focusCalls = early.calls.filter(c => c.personId === RIVAL.focus)
    expect(focusCalls.length).toBeGreaterThan(0)
    expect(focusCalls[0]!.draft).toMatchObject({ family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 },
      issuerStudioId: RIVAL.studio, beneficiaryPersonId: RIVAL.focus, startWeek: 208,
      termWeeks: 208, windowStartWeek: 208, dueWeekExclusive: 416 })
    expect(publicPreferredOpportunity(early.state, RIVAL.focus)).toBe('anyCastAppearance')
    // This is r01's real offer to the player's primary Director, not a claim
    // that authored0002 is r01's incumbent Director.
    const directorCalls = early.calls.filter(c => c.personId === RIVAL.primaryDirector)
    expect(directorCalls.length, 'actual automatic r01 offer to the original player Director').toBeGreaterThan(0)
    expect(person(early.state, RIVAL.primaryDirector).role).toBe('director')
    expect(directorCalls[0]!.draft).toMatchObject({ family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 } })
    expect(publicPreferredOpportunity(early.state, RIVAL.primaryDirector)).toBe('directingOpportunity')
    const uncredited = early.calls.filter(c => c.personId === RIVAL.vacancy)
    expect(uncredited.length, 'actual automatic incumbent cast offer').toBeGreaterThan(0)
    expect(early.state.studio.releasedFilms.some(f => f.participants?.director.talentId === RIVAL.vacancy)).toBe(false)
    expect(early.state.hollywood!.films.some(f => f.credits.some(c => c.talentId === RIVAL.vacancy && c.role === 'director'))).toBe(false)
    expect(uncredited[0]!.draft).toMatchObject({ family: 'APPEARANCE_COUNT', predicate: { count: 1 } })
    for (const id of [RIVAL.focus, RIVAL.primaryDirector, RIVAL.vacancy]) {
      const calls = early.calls.filter(c => c.personId === id)
      expect(calls.every(c => c.week === 196 && c.beforeHash === c.afterHash && c.rngBefore === c.rngAfter)).toBe(true)
      expect(new Set(calls.map(c => c.beforeHash)).size).toBe(1)
      expect(calls.every(c => c.automaticProposal.promises.length === 0 && c.automaticProposal.startWeek === 208
        && c.automaticProposal.termWeeks === 208)).toBe(true)
      const firstAccepted = calls.findIndex(c => c.result.classification === 'REASONABLY_ACHIEVABLE')
      const proposal = early.state.talentMarket.proposals.find(p => p.talentId === id && p.issuerStudioId === RIVAL.studio)
      assert.ok(proposal)
      if (firstAccepted < 0) {
        expect(proposal.promises).toEqual([])
        expect(early.state.promises.filter(p => p.beneficiaryPersonId === id && p.issuerStudioId === RIVAL.studio)).toEqual([])
      } else {
        expect(firstAccepted).toBe(calls.length - 1)
        expect(proposal.promises).toHaveLength(1)
        const offered = currentRow(early.state, proposal.promises[0]!)
        expect(offered).toMatchObject({ family: calls[firstAccepted]!.draft.family, predicate: calls[firstAccepted]!.draft.predicate,
          contractId: null, outcome: null, progress: 0, evidenceRefs: [], feasibilityReceipt: calls[firstAccepted]!.result })
        expect(calls[0]!.promiseIds).not.toContain(offered.promiseId)
        expect(early.state.promises.filter(p => p.beneficiaryPersonId === id && p.issuerStudioId === RIVAL.studio))
          .toEqual([offered])
      }
    }
    console.info('1155-P3-RIVAL-AUTHORING ' + JSON.stringify({ week: 196,
      calls: early.calls.map(c => ({ personId: c.personId, family: c.draft.family, predicate: c.draft.predicate,
        classification: c.result.classification })), bootstrapTake: early.credit.take.week }))
    const winner = rivalWinner208(), bound = currentRow(winner.state, winner.promiseId)
    expect(bound).toMatchObject({ family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 }, outcome: null })
    const done = rivalFinal260()
    expect(done.seated, 'real bound-P3 staffing is a leaf policy assertion').toBeDefined(); assert.ok(done.seated)
    const selected = done.seated.packageCall
    expect(selected.director).toBe(RIVAL.focus); expect(selected.directorRole).toBe('actor')
    expect(selected.offeredCast).not.toContain(RIVAL.focus); expect(selected.chosenCast).not.toContain(RIVAL.focus)
    expect(done.seated.eligibleActors).toHaveLength(2)
    expect(done.seated.castPrefix).toHaveLength(2)
    expect(done.seated.castPrefix).not.toContain(done.seated.ordinaryDirector)
    expect(selected.offeredCast).toEqual([...done.seated.castPrefix, done.seated.ordinaryDirector])
    expect(selected.chosenCast?.slice().sort()).toEqual(selected.offeredCast.slice().sort())
    expect(new Set(done.seated.crew).size).toBe(done.seated.crew.length)
    const displaced = person(done.seated.state, done.seated.ordinaryDirector)
    expect(displaced.role).toBe('director'); expect(displaced.skills.acting).toBeDefined()
    expect(lifecycle.assignmentRefusal(done.seated.state, displaced.id, done.seated.workWeek, 'actor')).toBeNull()
    const ordinary = early.ordinaryPackage
    assert.ok(ordinary && ordinary.chosenCast, 'actual ordinary unpromised package in this same fixed route')
    expect(ordinary.week).toBeLessThan(208); expect(ordinary.directorRole).toBe('director')
    expect(ordinary.offeredCast).not.toContain(ordinary.director)
    expect(ordinary.chosenCast.slice().sort()).toEqual(ordinary.offeredCast.slice().sort())
    // Private selector busy/missing/closed-Actor negative arguments remain the
    // explicit1154 pending seam, not substituted by a generic save refusal.
    console.info('1155-P3-RIVAL-STAFFING ' + JSON.stringify({ week: done.seated.workWeek,
      director: selected.director, ordinaryDirector: done.seated.ordinaryDirector,
      offeredCast: selected.offeredCast, chosenCast: selected.chosenCast, final: done.state.market.tick }))
  }, LEAF_TIMEOUT_MS)
})


// 1203: one zero-advance occupancy branch on the existing cached bound52 state.
// A fresh isolated D03O selection still pays the unchanged 52-call player prefix.
describe('P3 bounded occupancy admission', () => {
  it('D03O refuses a Director window blocked by the actual exclusive cast seat', () => {
    const setupBefore = counters(), routesBefore = rivalCounters()
    const branchesBefore = outcomeCounters().branches
    const lifecycleBefore = continuityCounters().lifecycleCalls
    const wasBound = setupBefore.cachedPhases.some(row => row.name === 'bound52' && row.completed)
    const input = bound(), setupAfter = counters()
    const setupDelta = wasBound ? 0 : 52 - setupBefore.actualTicks
    expect(setupDelta).toBeGreaterThanOrEqual(0)
    expect(setupAfter.actualTicks - setupBefore.actualTicks).toBe(setupDelta)
    expect(setupAfter.actualTicks).toBeLessThanOrEqual(setupAfter.cap)
    expect(outcomeCounters().branches).toEqual(branchesBefore)
    expect(continuityCounters().lifecycleCalls).toBe(lifecycleBefore)
    expect(rivalCounters().rivalCalls).toBe(routesBefore.rivalCalls)
    expect(input.state.market.tick).toBe(52)
    expect(input.actorId).toBe('authored-0006')
    admitted(input.state)
    expect(saves.makeSave(input.state).saveVersion).toBe(44)
    const root = actualPromise(input.state, input.promiseId)
    expect(root).toMatchObject({ contractId: expect.any(String), progress: 0, outcome: null })
    const contract = activeContract(input.state, input.actorId); assert.ok(contract)
    expect(contract).toMatchObject({ talentId: input.actorId, startWeek: 52, endWeekExclusive: 156 })
    expect(input.state.hollywood!.employment.find(row => row.contractId === root.contractId))
      .toMatchObject({ studioId: issuer(input.state), terms: contract })
    const draft: DirectorDraft = { ...directorDraft(input.state, input.actorId, 1),
      promiseId: input.promiseId, windowStartWeek: 52, dueWeekExclusive: 66 }
    // Independent membership-first person/issuer union. Retained abandoned or
    // terminal roots do not reserve; the actual bound root excludes itself.
    const reservations = (state: GameState) => {
      const attachedIds = new Set(state.talentMarket.proposals.flatMap(row => row.promises))
      const selected = new Map<string, ProfessionalPromise>()
      for (const row of state.promises) {
        const member = row.outcome === null && (row.contractId !== null || attachedIds.has(row.promiseId))
        const overlaps = row.windowStartWeek < 66 && row.dueWeekExclusive > 52
        const shares = row.beneficiaryPersonId === input.actorId || row.issuerStudioId === draft.issuerStudioId
        if (member && overlaps && shares && row.promiseId !== input.promiseId) selected.set(row.promiseId, row)
      }
      return [...selected.values()].map(row => ({ promiseId: row.promiseId, contractId: row.contractId,
        currentlyAttached: attachedIds.has(row.promiseId), personId: row.beneficiaryPersonId,
        issuerStudioId: row.issuerStudioId, count: row.predicate.count, progress: row.progress }))
    }
    expect(input.state.studio.activeProductions).toEqual([])
    for (const projectId of input.projectIds) expect(input.state.scriptDevelopment.projects.find(row => row.id === projectId))
      .toMatchObject({ status: 'ready', productionId: null })
    const vacantReservations = reservations(input.state)
    expect(vacantReservations).toEqual([])
    const vacantBytes = bytes(input.state), vacantRng = clone(input.state.rngState)
    const vacantQuote = quote(input.state, draft)
    expect(bytes(input.state)).toBe(vacantBytes); expect(input.state.rngState).toEqual(vacantRng)
    expect(vacantQuote).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6, bottleneck: null })

    const made = greenlight(clone(input.state), input.projectIds[0]!, 'authored-0002', {
      lead: input.actorId, antagonist: CAST.antagonist, support: CAST.support,
    })
    const occupied = made.state
    admitted(occupied)
    expect(occupied.market.tick).toBe(52)
    expect(saves.makeSave(occupied).saveVersion).toBe(44)
    const production = occupied.studio.activeProductions.find(row => row.id === made.productionId)
    assert.ok(production)
    expect(production).toMatchObject({ startTick: 52, remainingTicks: 8,
      directorId: 'authored-0002', cast: { lead: input.actorId } })
    expect(occupied.scriptDevelopment.projects.find(row => row.id === input.projectIds[0]))
      .toMatchObject({ productionId: made.productionId })
    const ready = occupied.scriptDevelopment.projects.find(row => row.id === input.projectIds[1])
    assert.ok(ready)
    expect(ready).toMatchObject({ status: 'ready', productionId: null })
    expect([...occupied.studio.activeProductions,
      ...(occupied.hollywood?.businesses.flatMap(row => row.productions) ?? [])]
      .filter(row => row.directorId === input.actorId)).toEqual([])
    expect(occupied.firstTakes.filter(row => row.productionId === made.productionId || row.directorId === input.actorId)).toEqual([])
    expect(actualPromise(occupied, input.promiseId)).toEqual(root)
    const occupiedReservations = reservations(occupied)
    expect(occupiedReservations).toEqual([])
    // Existing owner's earliest clock only: skip greenlight's start week,
    // then eight remaining advances. Holds can delay this lower bound further.
    const earliestRelease = occupied.market.tick + production.remainingTicks + 1
    const earliestFreshDirectorTake = earliestRelease + 5
    expect(earliestRelease).toBe(61)
    expect(earliestFreshDirectorTake).toBe(66)
    expect(earliestFreshDirectorTake).toBeGreaterThanOrEqual(draft.dueWeekExclusive)
    const occupiedBytes = bytes(occupied), occupiedRng = clone(occupied.rngState)
    const occupiedQuote = quote(occupied, draft)
    expect(bytes(occupied)).toBe(occupiedBytes); expect(occupied.rngState).toEqual(occupiedRng)

    const refusedInput = clone(occupied), refusalBefore = bytes(refusedInput), refusalRng = clone(refusedInput.rngState)
    let refusal: unknown
    try { greenlight(refusedInput, ready.id, input.actorId) } catch (error) { refusal = error }
    assert.ok(refusal instanceof Error, 'the actual second public greenlight must reach its exclusivity refusal')
    const expectedRefusal = 'applyActions: greenlight talent "authored-0006" is already engaged in an active production (exclusivity, M16)'
    expect(refusal.message).toBe(expectedRefusal)
    expect(bytes(refusedInput)).toBe(refusalBefore); expect(refusedInput.rngState).toEqual(refusalRng)
    expect(bytes(occupied)).toBe(occupiedBytes); expect(bytes(input.state)).toBe(vacantBytes)
    expect(counters()).toEqual(setupAfter)
    expect(outcomeCounters().branches).toEqual(branchesBefore)
    expect(continuityCounters().lifecycleCalls).toBe(lifecycleBefore)
    expect(rivalCounters().rivalCalls).toBe(routesBefore.rivalCalls)
    expect(rivalCounters().total).toBeLessThanOrEqual(rivalCounters().cap)
    // Print reached physical/quote facts before the disputed classification.
    console.info('1203-P3-OCCUPANCY ' + JSON.stringify({ week: occupied.market.tick, personId: input.actorId,
      promiseId: input.promiseId, draft, vacantQuote, occupiedQuote, vacantReservations, occupiedReservations,
      production: { id: production.id, startTick: production.startTick, remainingTicks: production.remainingTicks,
        directorId: production.directorId, cast: production.cast },
      readyProject: { id: ready.id, status: ready.status, productionId: ready.productionId },
      earliestReleaseLowerBound: earliestRelease, earliestFreshDirectorTakeLowerBound: earliestFreshDirectorTake,
      actualSecondGreenlightRefusal: refusal.message,
      counters: { setupBefore, setupAfter, setupDelta, branchAdvanceDelta: counters().actualTicks - setupAfter.actualTicks,
        outcome: outcomeCounters(), continuity: continuityCounters(), rival: rivalCounters() } }))
    expect(occupiedQuote).toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 6 })
  }, LEAF_TIMEOUT_MS)
})

// 1213: three independent quote controls; all simulation belongs to old caches.
function occupancyControlCounts() {
  return { player: counters(), outcome: outcomeCounters(), continuity: continuityCounters(), rival: rivalCounters() }
}
function occupancyBound52() {
  const before = occupancyControlCounts(), input = bound(), after = occupancyControlCounts()
  const cached = before.player.cachedPhases.some(row => row.name === 'bound52' && row.completed)
  expect(after.player.actualTicks - before.player.actualTicks).toBe(cached ? 0 : 52 - before.player.actualTicks)
  expect(after.outcome.branches).toEqual(before.outcome.branches)
  expect(after.continuity.lifecycleCalls).toBe(before.continuity.lifecycleCalls)
  expect(after.rival.rivalCalls).toBe(before.rival.rivalCalls)
  expect(after.player.actualTicks).toBeLessThanOrEqual(after.player.cap)
  expect(input.state.market.tick).toBe(52); admitted(input.state)
  expect(actualPromise(input.state, input.promiseId)).toMatchObject({ contractId: expect.any(String),
    predicate: { kind: 'directorCount', count: 2 }, progress: 0, outcome: null })
  return input
}
function occupancyCompanyClaims(state: GameState, personId: string) {
  const player = issuer(state)
  const owners = [{ studioId: player, productions: state.studio.activeProductions },
    ...state.hollywood!.businesses.filter(row => row.studioId !== player)
      .map(row => ({ studioId: row.studioId, productions: row.productions }))]
  return owners.flatMap(owner => owner.productions.flatMap(production => {
    const seats = [production.directorId === personId ? 'director' : null,
      ...Object.entries(production.cast).filter(([, id]) => id === personId).map(([slot]) => `cast:${slot}`),
      ...production.craftIds.filter(id => id === personId).map(() => 'craft')].filter(seat => seat !== null)
    return seats.length ? [{ studioId: owner.studioId, productionId: production.id,
      startTick: production.startTick, remainingTicks: production.remainingTicks, seats }] : []
  }))
}
function occupancyPicture(input: { state: GameState; actorId: string; projectIds: string[] }, projectIndex: number) {
  const before = bytes(input.state)
  expect(occupancyCompanyClaims(input.state, input.actorId)).toEqual([])
  expect(input.state.studio.activeProductions).toEqual([])
  const made = greenlight(clone(input.state), input.projectIds[projectIndex]!, 'authored-0002', {
    lead: input.actorId, antagonist: CAST.antagonist, support: CAST.support,
  })
  const production = made.state.studio.activeProductions.find(row => row.id === made.productionId); assert.ok(production)
  expect(production).toMatchObject({ startTick: input.state.market.tick, remainingTicks: 8,
    directorId: 'authored-0002', writerId: WRITER, cast: { lead: input.actorId } })
  expect(occupancyCompanyClaims(made.state, input.actorId)).toEqual([{ studioId: issuer(made.state),
    productionId: production.id, startTick: production.startTick, remainingTicks: 8, seats: ['cast:lead'] }])
  expect(made.state.firstTakes.filter(row => row.productionId === production.id)).toEqual([])
  expect(bytes(input.state)).toBe(before); admitted(made.state)
  return { ...made, production }
}
function occupancyTuple(material: unknown) {
  assert.ok(Array.isArray(material))
  return material.filter((item: unknown) => Array.isArray(item) && item[0] === 'occupiedProductionSeats')
}
function occupancyReservationFacts(state: GameState, draft: PromiseDraft) {
  const selected = selectedReservations(state, draft)
  const attached = new Set(state.talentMarket.proposals.flatMap(row => row.promises))
  return { selected, remaining: selected.reduce((sum, row) => sum + Math.max(0, row.predicate.count - row.progress), 0),
    rows: selected.map(row => ({ promiseId: row.promiseId, beneficiaryPersonId: row.beneficiaryPersonId,
      issuerStudioId: row.issuerStudioId, contractId: row.contractId, currentlyAttached: attached.has(row.promiseId),
      predicate: row.predicate, progress: row.progress, outcome: row.outcome,
      windowStartWeek: row.windowStartWeek, dueWeekExclusive: row.dueWeekExclusive })) }
}
function occupancyQueryAt(state: GameState, draft: DirectorDraft, queryWeek: number) {
  const before = bytes(state), draftBefore = saves.stableStringify(draft), rng = clone(state.rngState)
  const result = core.promiseFeasibility(state, draft, queryWeek)
  expect(bytes(state)).toBe(before); expect(state.rngState).toEqual(rng)
  expect(saves.stableStringify(draft)).toBe(draftBefore)
  return result
}

describe('P3 occupancy ownership and retirement query controls', () => {
  it('D03X keeps an actual player cast seat visible to a rival Director quote', () => {
    const input = occupancyBound52(), setup = occupancyControlCounts(), rival = 'studio-de11f27b-r01'
    const identity = input.state.hollywood!.identities.find(row => row.studioId === rival); assert.ok(identity)
    assert.ok(identity.enteredWeek !== null && identity.enteredWeek <= 52)
    expect(rival).not.toBe(issuer(input.state))
    for (const id of input.projectIds) expect(input.state.scriptDevelopment.projects.find(row => row.id === id))
      .toMatchObject({ status: 'ready', productionId: null })
    // Fresh argument-only rival query: the real player's count2 root remains reserved.
    const draft = { ...directorDraft(input.state, input.actorId, 1), issuerStudioId: rival, dueWeekExclusive: 66 }
    const reservations = occupancyReservationFacts(input.state, draft)
    expect(reservations.selected).toContainEqual(actualPromise(input.state, input.promiseId))
    expect(reservations.remaining).toBeGreaterThanOrEqual(2)
    const vacant = quoteMaterial(input.state, draft), made = occupancyPicture(input, 0)
    const occupiedReservations = occupancyReservationFacts(made.state, draft)
    expect(occupiedReservations).toEqual(reservations)
    expect(made.state.scriptDevelopment.projects.find(row => row.id === input.projectIds[1]))
      .toMatchObject({ status: 'ready', productionId: null })
    const occupied = quoteMaterial(made.state, draft)
    const releaseLowerBound = 52 + made.production.remainingTicks + 1
    expect(releaseLowerBound).toBe(61); expect(releaseLowerBound + 5).toBe(draft.dueWeekExclusive)
    expect(occupancyControlCounts()).toEqual(setup)
    console.info('1213-P3-CROSS-ISSUER ' + JSON.stringify({ worldWeek: 52, queryIssuer: rival,
      personId: input.actorId, draft, reservations: reservations.rows,
      claims: occupancyCompanyClaims(made.state, input.actorId), releaseLowerBound, freshTakeLowerBound: 66,
      vacant: vacant.result, occupied: occupied.result, occupiedInput: occupancyTuple(occupied.material), counters: setup }))
    expect(vacant.result).toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 6,
      bottleneck: 'promises already made to this person exhaust the window' })
    expect(occupied.result).toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 6,
      bottleneck: 'no filming week inside the window can reach that many pictures' })
    expect(occupancyTuple(vacant.material)).toEqual([])
    expect(occupancyTuple(occupied.material)).toEqual([['occupiedProductionSeats',
      [[issuer(made.state), made.productionId, 52, 8]]]])
  }, LEAF_TIMEOUT_MS)

  it('D03W excludes Writer credit alone from actual production occupancy', () => {
    const input = occupancyBound52(), setup = occupancyControlCounts()
    expect(person(input.state, WRITER).skills.directing).toBeDefined()
    expect(occupancyCompanyClaims(input.state, WRITER)).toEqual([])
    const draft = { ...directorDraft(input.state, WRITER, 1), dueWeekExclusive: 66 }
    const reservations = occupancyReservationFacts(input.state, draft)
    expect(reservations.selected).toEqual([actualPromise(input.state, input.promiseId)])
    expect(reservations.remaining).toBe(2)
    const vacant = quoteMaterial(input.state, draft), made = occupancyPicture(input, 0)
    expect(made.production.writerId).toBe(WRITER)
    expect(occupancyCompanyClaims(made.state, WRITER)).toEqual([])
    expect(occupancyReservationFacts(made.state, draft)).toEqual(reservations)
    const occupied = quoteMaterial(made.state, draft)
    expect(occupancyControlCounts()).toEqual(setup)
    console.info('1213-P3-WRITER-CREDIT ' + JSON.stringify({ worldWeek: 52, personId: WRITER, draft,
      reservations: reservations.rows, creditedProductionId: made.productionId,
      companyClaims: occupancyCompanyClaims(made.state, WRITER), freshEventWeeks: [57, 65],
      vacant: vacant.result, credited: occupied.result, occupiedInput: occupancyTuple(occupied.material), counters: setup }))
    for (const observed of [vacant, occupied]) {
      expect(observed.result).toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 6,
        bottleneck: 'promises already made to this person exhaust the window' })
      expect(occupancyTuple(observed.material)).toEqual([])
    }
  }, LEAF_TIMEOUT_MS)

  it('D03R distinguishes the retirement cap from physical time at an explicit future query week', () => {
    const before = occupancyControlCounts(), input = afterTakeCancellationDue(), setup = occupancyControlCounts()
    const hadFilm = before.player.cachedPhases.some(row => row.name === 'firstFilm' && row.completed)
    expect(setup.player.actualTicks - before.player.actualTicks).toBe(hadFilm ? 0 : 65 - before.player.actualTicks)
    const priorBranch = before.outcome.branches.find(row => row.name === 'cancelAfter'); assert.ok(priorBranch)
    const branch = setup.outcome.branches.find(row => row.name === 'cancelAfter'); assert.ok(branch)
    expect(branch).toMatchObject({ actualTicks: 51, startWeek: 61, cap: 64 })
    expect(branch.actualTicks - priorBranch.actualTicks).toBe(51 - priorBranch.actualTicks)
    expect(setup.outcome.branches.filter(row => row.name !== 'cancelAfter'))
      .toEqual(before.outcome.branches.filter(row => row.name !== 'cancelAfter'))
    expect(setup.continuity.lifecycleCalls).toBe(before.continuity.lifecycleCalls)
    expect(setup.rival.rivalCalls).toBe(before.rival.rivalCalls)
    expect(setup.player.actualTicks).toBeLessThanOrEqual(setup.player.cap)
    expect(input.first.take.week).toBe(61); expect(input.first.released.market.tick).toBe(65)
    expect(input.state.market.tick).toBe(112); admitted(input.state)
    const root = actualPromise(input.state, input.promiseId)
    expect(root).toMatchObject({ progress: 1, outcome: 'BROKEN', dueWeekExclusive: 112 })
    const retirement = core.retirementRecordFor(input.state, input.actorId, 'actor'); assert.ok(retirement)
    expect(retirement).toMatchObject({ profession: 'actor', status: 'announced', announcedWeek: 104,
      effectiveWeek: 156, retiredWeek: null })
    expect(person(input.state, input.actorId).role).toBe('actor')
    const contract = activeContract(input.state, input.actorId); assert.ok(contract)
    expect(contract).toMatchObject({ startWeek: 52, endWeekExclusive: 156 })
    const made = occupancyPicture(input, 1)
    expect(made.state.market.tick).toBe(112)
    expect(core.retirementRecordFor(made.state, input.actorId, 'actor')).toEqual(retirement)
    expect(actualPromise(made.state, input.promiseId)).toEqual(root)
    // Explicit query-time controls; neither state nor actual employment is moved to147/164.
    const queryWeek = retirement.effectiveWeek - 9
    expect(queryWeek).toBe(147)
    const draft: DirectorDraft = { ...directorDraft(input.state, input.actorId, 1),
      startWeek: 112, termWeeks: 52, windowStartWeek: queryWeek, dueWeekExclusive: 162 }
    const physicalDraft = { ...draft, dueWeekExclusive: 160 }
    for (const state of [input.state, made.state]) {
      expect(occupancyReservationFacts(state, draft).selected).toEqual([])
      expect(occupancyReservationFacts(state, physicalDraft).selected).toEqual([])
    }
    const releaseLowerBound = queryWeek + made.production.remainingTicks
    expect(releaseLowerBound).toBe(155); expect(releaseLowerBound + 5).toBe(160)
    const admissionBefore = bytes(made.state), admissionRng = clone(made.state.rngState)
    const admissions = [queryWeek, queryWeek + 1, releaseLowerBound].map(week => ({ week,
      refusal: lifecycle.assignmentRefusal(made.state, input.actorId, week, 'director') }))
    expect(admissions[0]!.refusal).toBeNull()
    for (const row of admissions.slice(1)) expect(row.refusal).toMatch(/retirementAnnounced/)
    expect(bytes(made.state)).toBe(admissionBefore); expect(made.state.rngState).toEqual(admissionRng)
    const vacant = occupancyQueryAt(input.state, draft, queryWeek)
    const capped = occupancyQueryAt(made.state, draft, queryWeek)
    const physical = occupancyQueryAt(made.state, physicalDraft, queryWeek)
    expect(occupancyControlCounts()).toEqual(setup)
    console.info('1213-P3-RETIREMENT-FLOOR ' + JSON.stringify({ actualWorldWeek: 112, explicitQueryWeek: queryWeek,
      personId: input.actorId, retirement, actualContract: contract, draft, physicalDraft,
      reservations: occupancyReservationFacts(made.state, draft).rows,
      claims: occupancyCompanyClaims(made.state, input.actorId), admissions, releaseLowerBound,
      freshTakeLowerBound: 160, vacant, capped, physical, counters: setup }))
    expect(vacant).toMatchObject({ classification: 'FRAGILE', rulesVersion: 6,
      bottleneck: 'the schedule leaves no spare picture inside the window' })
    expect(capped).toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 6,
      bottleneck: 'retirement leaves too few qualifying production seats inside the window' })
    expect(physical).toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 6,
      bottleneck: 'no filming week inside the window can reach that many pictures' })
  }, LEAF_TIMEOUT_MS)
})
