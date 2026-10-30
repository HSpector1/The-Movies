import { withEmptyRecovery } from './helpers/recovery-migration-expectation.js'
// Independent 880-B: preserve already-lawful retirement writing obligations.
// This is a bounded live-validation correction, not new work admission or a
// historical reader amendment. Expected outcomes come from the reviewed contract.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds, guaranteedComp, terminationCost, weeklySalary } from '../src/core/employment.js'
import { studioConstructionView } from '../src/core/placement.js'
import { allocateScriptReservation, assessFirstDraft, availableDevelopmentCastingSlots, scriptOccupiedFacilitySlots } from '../src/core/scriptDevelopment.js'
import { studioCalendar } from '../src/core/studioCalendar.js'
import { tick } from '../src/core/tick.js'
import { conditionRecord, outstandingLoan, releaseRefusal } from '../src/core/corporateConditionLive.js'
import { requestDiligence } from '../src/core/dueDiligence.js'
import { absorptionAsk, absorptionProducerRefusal, quoteAbsorption, closeAbsorption } from '../src/core/acquisition.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { permittedBidderRefusal, spendableCash, weeklyFixedCost } from '../src/core/rightsFinance.js'
import { personReservationRefusal } from '../src/core/talentMarket.js'
import { rivalInstallationSlots } from '../src/core/technologyRival.js'
import { TUNING } from '../src/core/tuning.js'
import { operatingPromiseIssuer } from '../src/core/absorbedObligations.js'
import { trustDrivers } from '../src/core/promises.js'
import { convertV36ToV35, convertV37ToV36, convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42ToV41, convertV43ToV42, convertV44ToV43, convertV45ToV44, convertV46ToV45, convertV47ToV46, convertV49ToV48, convertV50ToV49, convertV51ToV50, exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive, stableStringify,
  validateSaveV36, validateSaveV51 } from '../src/core/save.js'
import type { GameState, GameStateV33, RetirementRecordV36, ScriptProject } from '../src/core/types.js'
import { c2Fixture } from './helpers/p14c2a-fixtures.js'

// 1309-X3 ruling 4: convertV40ToV41 (src/core/save.ts:10479) adds a zero
// `termination` movement to every rival finance period; the OLD state never
// carried it, so the expected migrated `hollywood` must build it the same way.
// P16 (Save49): convertV48ToV49 adds a zero movement of each rights kind to every rival period.
function withRivalTermination<T extends { hollywood: GameStateV33['hollywood'] }>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, account: { ...business.account, periods: business.account.periods.map((period) => ({
      ...period, movements: { ...period.movements, termination: 0 } })) },
  })) } }
}
// 1344-N S5: Save43 (convertV42ToV43, src/core/save.ts:10678-10686) gives every rival business an
// empty `screenplayShelving` root; the genuine V33 old state never carried it.
function withEmptyScreenplayShelving<T extends { hollywood: GameStateV33['hollywood'] }>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, screenplayShelving: { version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 0 } })) } }
}
// P15B (1370-ar): the P15B save step (convertToP15BSave) gives every rival finance period the three loan
// money kinds at zero; the genuine V33 old state never carried them.
function withZeroLoanMovements<T extends { hollywood: GameStateV33['hollywood'] }>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, account: { ...business.account, periods: business.account.periods.map((period) => ({
      ...period, movements: { ...period.movements, loanPrincipal: 0, loanInstallment: 0, claimPayment: 0, rightsConsideration: 0, dueDiligenceFee: 0, acquisitionOutlay: 0, estateSaleProceeds: 0 } })) },
  })) } }
}
import { addPerson, admitted, advanceTo, bytes, finishingWriter, historicalWriterPair, owner } from './helpers/p14c2rm-fixtures.js'
import { announcedGapWriter, originalCommission, pooledFinishingWriter } from './helpers/p14c2rm-writer-fixtures.js'
import { predecessorSave } from './helpers/p15-roots.js'
import { NONDEFAULT_MARKET_PROJECTION, RIGHTS_ROOT_REFUSAL } from './helpers/p16-era.js'

function envelope(state: GameState, saveVersion: number = LIVE_SAVE_VERSION) {
  return { saveVersion, seed: state.seed, state, broadcastCache: state.broadcastItems }
}
function writeProject(state: GameState, writerId: string): ScriptProject {
  const rows = state.scriptDevelopment.projects.filter(row => row.writerIds.includes(writerId)
    && (row.status === 'drafting' || row.status === 'rewriting'))
  expect(rows, 'premise: exactly one real retained screenplay obligation').toHaveLength(1)
  return rows[0]!
}
function readBack(state: GameState): GameState {
  const before = stableStringify(state), saved = makeSave(state)
  const reopened = migrateToLive(importSave(exportSave(saved))).state
  expect(stableStringify(reopened), 'save/load changes no authoritative fact').toBe(before)
  expect(stableStringify(state), 'validation/write/read never mutates its input').toBe(before)
  return reopened
}
function noExpiryPayroll(state: GameState, writerId: string, start: number) {
  // Payroll is one aggregate player row, not a per-person row. Establish the
  // no-other-employees premise before asserting that no further payroll exists.
  expect(state.contracts.filter(row => row.startWeek <= start && start < row.endWeekExclusive),
    'payroll control: this fixture has no other player employee at expiry').toEqual([])
  expect(state.hollywood!.employment.filter(row => row.studioId === owner(state) && row.terms.talentId === writerId
    && row.terms.startWeek >= start), 'retained work must not invent a replacement contract').toEqual([])
  const invalid = state.ledger.filter(row => row.kind === 'payroll' && row.week >= start)
  expect(invalid, 'retained writing must not mint employment or post-expiry payroll').toEqual([])
}

describe('880-B natural retired-writer continuation', () => {
  it('keeps the existing active-contract save/load control byte-identical', () => {
    const f = finishingWriter()
    expect(activeContract(f.commissioned, f.writerId)).toMatchObject({ endWeekExclusive: 312 })
    expect(writeProject(f.commissioned, f.writerId)).toMatchObject({ commissionedWeek: 311, status: 'drafting' })
    expect(readBack(f.commissioned)).toEqual(f.commissioned)
  })

  it('saves and reloads the real E snapshot without adding a contract, changing work or advancing the clock', () => {
    const f = finishingWriter(), before = stableStringify(f.finishing)
    expect(f.finishing.market.tick).toBe(312)
    expect(activeContract(f.finishing, f.writerId)).toBeUndefined()
    expect(retirementRecordFor(f.finishing, f.writerId)).toMatchObject({ status: 'finishing_commitments', effectiveWeek: 312 })
    expect(writeProject(f.finishing, f.writerId)).toEqual(writeProject(f.commissioned, f.writerId))
    const reopened = readBack(f.finishing)
    // Persistence has always canonicalized JSON -0 to 0. Validate the actual
    // reopened object and compare authoritative canonical bytes across storage.
    expect(validateSaveV51(envelope(reopened)).state).toBe(reopened)
    expect(stableStringify(reopened)).toBe(before)
    expect(stableStringify(f.finishing)).toBe(before)
  })


  // S8 acquired-obligation scenario moved intact to bridge-p16-rights-parity.test.ts
  // under this same describe/it identity: its real Bridge consumers belong to tsconfig.bridge.json.

  it('continues the real finishing task through its actual due week, then retires once', () => {
    const f = finishingWriter(), project = writeProject(f.finishing, f.writerId)
    const completed = admitted(advanceTo(f.finishing, f.dueWeek))
    expect(completed.scriptDevelopment.projects.find(row => row.id === project.id)).toMatchObject({
      status: 'review', dueWeek: null, reservation: null, writerId: f.writerId,
    })
    expect(retirementRecordFor(completed, f.writerId)).toMatchObject({ status: 'retired', retiredWeek: f.dueWeek })
    const later = admitted(tick(completed))
    expect(retirementRecordFor(later, f.writerId)).toEqual(retirementRecordFor(completed, f.writerId))
    expect(activeContract(completed, f.writerId)).toBeUndefined()
    noExpiryPayroll(later, f.writerId, 312)
  })

  it('loaded and uninterrupted finishing branches produce identical completion and next-week saves', () => {
    const f = finishingWriter(), loaded = readBack(f.finishing)
    const direct = advanceTo(f.finishing, f.dueWeek + 1), resumed = advanceTo(loaded, f.dueWeek + 1)
    expect(bytes(resumed)).toBe(bytes(direct))
    expect(resumed.hollywood!.receipts).toEqual(direct.hollywood!.receipts)
    expect(resumed.scriptDevelopment).toEqual(direct.scriptDevelopment)
  })

  it('allows actual D<E expired writing while still announced, including byte-identical resumed completion', () => {
    const f = announcedGapWriter(), project = writeProject(f.expired, f.writerId)
    expect(project.commissionedWeek).toBe(259)
    expect(f.expired.market.tick).toBe(260)
    expect(project.dueWeek).toBeGreaterThan(260)
    expect(retirementRecordFor(f.expired, f.writerId)).toMatchObject({ status: 'announced', effectiveWeek: 312 })
    const loaded = readBack(f.expired)
    const direct = admitted(advanceTo(f.expired, f.dueWeek)), resumed = admitted(advanceTo(loaded, f.dueWeek))
    expect(bytes(resumed)).toBe(bytes(direct))
    expect(direct.scriptDevelopment.projects.find(row => row.id === project.id)).toMatchObject({ status: 'review', dueWeek: null })
    expect(retirementRecordFor(direct, f.writerId)).toMatchObject({ status: 'announced', retiredWeek: null })
    noExpiryPayroll(direct, f.writerId, 260)
  })

  it('the real Calendar and construction callers accept the same retained finishing work without mutations', () => {
    const f = finishingWriter(), before = stableStringify(f.finishing)
    expect(() => studioConstructionView(f.finishing)).not.toThrow()
    const calendar = studioCalendar(f.finishing)
    expect(calendar.commitments.some(row => row.kind === 'retirement' && row.ownerId === f.writerId && row.week === 312)).toBe(true)
    expect(stableStringify(f.finishing)).toBe(before)
  })

  it('a lawful unrelated original commission does not fail on another writer’s retained task', () => {
    const f = finishingWriter(), old = writeProject(f.finishing, f.writerId)
    const made = addPerson(f.finishing, '880-B New Young Writer', 'writer', 40)
    const signed = applyActions(made.state, [{ kind: 'signContract', talentId: made.id, termWeeks: 52 }])
    expect(activeContract(signed, made.id)).toBeDefined()
    expect(availableDevelopmentCastingSlots(signed.operations, signed.scriptDevelopment, new Set()),
      'unrelated commission premise: genuine spare development capacity').toBeGreaterThan(0)
    const next = admitted(applyActions(signed, [originalCommission(made.id)]))
    expect(writeProject(next, f.writerId)).toEqual(old)
    expect(writeProject(next, made.id)).toMatchObject({ writerId: made.id, commissionedWeek: 312 })
    expect(() => applyActions(next, [{ kind: 'assignScreenplayWriter',
      projectId: writeProject(next, made.id).id, writerId: f.writerId }])).toThrow()
  })

  it('a real non-attributed pooled writer keeps only their existing assignment across E', () => {
    const f = pooledFinishingWriter(), project = writeProject(f.finishing, f.writerId)
    expect(project.writerId).toBe(f.attributedId)
    expect(project.writerIds).toEqual([f.attributedId, f.writerId])
    const loaded = readBack(f.finishing), completed = admitted(advanceTo(loaded, f.dueWeek))
    expect(completed.scriptDevelopment.projects.find(row => row.id === project.id)).toMatchObject({ status: 'review', writerIds: [f.attributedId, f.writerId] })
    expect(retirementRecordFor(completed, f.writerId)).toMatchObject({ status: 'retired', retiredWeek: f.dueWeek })
    expect(activeContract(completed, f.attributedId)).toBeDefined()
  })

  it('preserves ordinary new-work and release refusals instead of granting permission from a retained task', () => {
    const f = finishingWriter(), original = stableStringify(f.finishing)
    expect(() => applyActions(f.commissioned, [{ kind: 'releaseTalent', talentId: f.writerId }])).toThrow(/finish.*screenplay/i)
    expect(() => applyActions(f.finishing, [originalCommission(f.writerId)])).toThrow()
    const unused = f.finishing.concepts.find(row => !f.finishing.scriptDevelopment.projects.some(p => p.conceptId === row.id))!
    expect(unused).toBeDefined()
    expect(() => applyActions(f.finishing, [{ kind: 'commissionScript', project: {
      conceptId: unused.id, writerId: f.writerId, shape: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
      promise: { genre: unused.genre, intendedSegments: ['adult'], ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] } },
    } }])).toThrow()
    expect(() => applyActions(f.finishing, [{ kind: 'requestScriptRewrite', projectId: writeProject(f.finishing, f.writerId).id }])).toThrow()
    expect(stableStringify(f.finishing)).toBe(original)
  })
})

type InvalidCase = { name: string; corrupt: (state: GameState, writerId: string) => GameState }
const changeProject = (state: GameState, id: string, patch: Partial<ScriptProject>): GameState => ({ ...state,
  scriptDevelopment: { ...state.scriptDevelopment, projects: state.scriptDevelopment.projects.map(row => row.writerIds.includes(id) ? { ...row, ...patch } : row) },
})
function anotherUncontractedWriter(state: GameState, id: string): string {
  const person = state.talent.find(row => row.role === 'writer' && row.id !== id && !activeContract(state, row.id)
    && !retirementRecordFor(state, row.id))
  expect(person, 'negative control premise: an existing writer with no player contract or retirement authority').toBeDefined()
  return person!.id
}
// 1358-N S8 (1358-F10 ruling 2): `refusal` pins the innermost guard the live validator reaches
// for each tamper, measured by the 1358-X6 message probe (N-0468, 18 cases) and cited at its
// source. The V9 script development invariants carry the prefixes of src/core/scriptDevelopment.ts:811
// and src/core/save.ts:3655; the deeper chain prefixes vary, so each pin anchors on the end.
const invalidCases: (InvalidCase & { refusal: RegExp })[] = [
  { name: 'missing lifecycle record', corrupt: (state, id) => ({ ...state, careerLifecycle: { ...state.careerLifecycle,
    records: state.careerLifecycle.records.filter(row => row.personId !== id) } }),
    refusal: /validateSaveV36: talentMarket\.cases\[25\] is a retirementExtension case for authored-0000, who holds no retirement record$/ }, // save.ts:10295
  { name: 'retired lifecycle cannot own active writing', corrupt: (state, id) => ({ ...state, careerLifecycle: { ...state.careerLifecycle,
    records: state.careerLifecycle.records.map(row => row.personId === id ? { ...row, status: 'retired', retiredWeek: state.market.tick } : row) } }),
    refusal: /validateSaveV38: non-catalogue retirement is missing its exact finality$/ }, // professionHistory.ts:270
  { name: 'another person’s lifecycle record is not authority', corrupt: (state, id) => ({ ...state, careerLifecycle: { ...state.careerLifecycle,
    records: state.careerLifecycle.records.map(row => row.personId === id ? { ...row, personId: state.talent.find(t => t.role === 'writer' && t.id !== id)!.id } : row) } }),
    refusal: /validateSaveV36: talentMarket\.cases\[25\] is a retirementExtension case for authored-0000, who holds no retirement record$/ }, // save.ts:10295
  { name: 'wrong historical employer studio', corrupt: (state, id) => ({ ...state, hollywood: { ...state.hollywood!,
    employment: state.hollywood!.employment.map(row => row.terms.talentId === id && row.terms.endWeekExclusive === 312
      ? { ...row, studioId: state.hollywood!.businesses[0]!.studioId } : row) } }),
    refusal: /validateSaveV9: script development invariant: active project "script-0000" writer is not contracted$/ }, // scriptDevelopment.ts:1118
  { name: 'historical employment did not cover commissioning', corrupt: (state, id) => ({ ...state, hollywood: { ...state.hollywood!,
    employment: state.hollywood!.employment.map(row => row.terms.talentId === id && row.terms.endWeekExclusive === 312
      ? { ...row, terms: { ...row.terms, startWeek: 312 } } : row) } }),
    refusal: /validateSaveV9: script development invariant: active project "script-0000" writer is not contracted$/ }, // scriptDevelopment.ts:1118
  { name: 'missing historical employment', corrupt: (state, id) => ({ ...state, hollywood: { ...state.hollywood!,
    employment: state.hollywood!.employment.filter(row => row.terms.talentId !== id) } }),
    refusal: /validateSaveV9: script development invariant: active project "script-0000" writer is not contracted$/ }, // scriptDevelopment.ts:1118
  { name: 'new work begins at E', corrupt: (state, id) => changeProject(state, id, { commissionedWeek: 312 }),
    refusal: /validateSaveV9: script development invariant: active project "script-0000" writer is not contracted$/ }, // scriptDevelopment.ts:1118
  { name: 'future commission week', corrupt: (state, id) => changeProject(state, id, { commissionedWeek: 313 }),
    refusal: /validateSaveV9: script development invariant: project "script-0000" has an invalid or future commission week$/ }, // scriptDevelopment.ts:996
  { name: 'due week is no longer in the future', corrupt: (state, id) => changeProject(state, id, { dueWeek: 312 }),
    refusal: /validateSaveV9: script development invariant: drafting project "script-0000" has an invalid due week$/ }, // scriptDevelopment.ts:1020
  { name: 'due week exceeds the ordinary draft bound', corrupt: (state, id) => changeProject(state, id, { dueWeek: 318 }),
    refusal: /validateSaveV9: script development invariant: drafting project "script-0000" has an invalid due week$/ }, // scriptDevelopment.ts:1020
  { name: 'unknown writer membership', corrupt: (state, id) => changeProject(state, id, { writerIds: [id, 'missing-writer'] }),
    refusal: /validateSaveV9: script development invariant: project "script-0000" references unknown writer "missing-writer"$/ }, // scriptDevelopment.ts:1113
  { name: 'uncontracted second writer without retirement authority', corrupt: (state, id) => changeProject(state, id, {
    writerIds: [id, anotherUncontractedWriter(state, id)],
  }), refusal: /validateSaveV9: script development invariant: active project "script-0000" writer is not contracted$/ }, // scriptDevelopment.ts:1118
  { name: 'duplicate writer membership', corrupt: (state, id) => changeProject(state, id, { writerIds: [id, id] }),
    refusal: /validateSaveV9: state\.scriptDevelopment\.projects\[0\]\.writerIds\[1\] is duplicated$/ }, // save.ts:3532
  { name: 'attributed writer is missing from membership', corrupt: (state, id) => changeProject(state, id, { writerIds: [] }),
    refusal: /validateSaveV9: state\.scriptDevelopment\.projects\[0\]\.writerIds must hold between 1 and 5 writers$/ }, // save.ts:3526
  { name: 'reservation belongs to another project', corrupt: (state, id) => changeProject(state, id, {
    reservation: { ...writeProject(state, id).reservation!, projectId: 'script-9999' },
  }), refusal: /validateSaveV9: script development invariant: project "script-0000" reservation owner disagrees$/ }, // scriptDevelopment.ts:919
  { name: 'reservation slot is outside capacity', corrupt: (state, id) => changeProject(state, id, {
    reservation: { ...writeProject(state, id).reservation!, slot: 999 },
  }), refusal: /validateSaveV9: script development invariant: project "script-0000" reservation slot is outside facility capacity$/ }, // scriptDevelopment.ts:932
  { name: 'unknown concept reference', corrupt: (state, id) => changeProject(state, id, { conceptId: 'missing-concept' }),
    refusal: /validateSaveV9: script development invariant: project "script-0000" references unknown concept$/ }, // scriptDevelopment.ts:984
  { name: 'duplicate active project cannot borrow the same writer or slot', corrupt: (state, id) => ({ ...state,
    scriptDevelopment: { ...state.scriptDevelopment, projects: [...state.scriptDevelopment.projects, { ...writeProject(state, id), id: 'script-0001' }] },
  }), refusal: /validateSaveV9: script development invariant: duplicate concept link "concept-orig-0000"$/ }, // scriptDevelopment.ts:980
]

describe('880-B live allowance stays narrowly scoped', () => {
  it.each(invalidCases)('refuses $name without altering caller bytes', ({ corrupt, refusal }) => {
    const f = finishingWriter(), state = corrupt(f.finishing, f.writerId), input = envelope(state), before = stableStringify(input)
    expect(() => validateSaveV51(input)).toThrow(refusal)
    expect(stableStringify(input)).toBe(before)
  })

  it('refuses a genuinely terminated interval, even if an illegal cross-branch draft is grafted afterward', () => {
    const f = finishingWriter()
    const terminated = admitted(applyActions(f.ready, [{ kind: 'releaseTalent', talentId: f.writerId }]))
    expect(terminated.hollywood!.employment.find(row => row.terms.talentId === f.writerId && row.terms.endWeekExclusive === 312))
      .toMatchObject({ endedWeek: 311 })
    // Explicitly INVALID alternate-branch combination. The release, payment and
    // receipt are genuine; this task was commissioned only on the unreleased
    // branch, so it cannot borrow retirement to become lawful here.
    const illegal = { ...terminated, concepts: f.commissioned.concepts, scriptDevelopment: f.commissioned.scriptDevelopment,
      originalScreenplays: f.commissioned.originalScreenplays }
    // 1358-N S8: the grafted draft's writer holds no contract and no retirement authority on this
    // branch (src/core/scriptDevelopment.ts:1118). Measured by the 1358-X6 message probe (N-0470).
    expect(() => validateSaveV51(envelope(illegal))).toThrow(/validateSaveV9: script development invariant: active project "script-0000" writer is not contracted$/)
    expect(() => applyActions(terminated, [originalCommission(f.writerId)])).toThrow()
  })

  it('still refuses extra project/save keys at the exact public schema boundary', () => {
    const f = finishingWriter()
    const input = envelope({ ...f.finishing, scriptDevelopment: { ...f.finishing.scriptDevelopment,
      projects: f.finishing.scriptDevelopment.projects.map(row => ({ ...row, retirementBypass: true })),
    } })
    // 1358-N S8: the V9 project key set refuses the extra key (src/core/save.ts:3371). Measured by
    // the 1358-X6 message probe (N-0472).
    expect(() => validateSaveV51(input)).toThrow(/validateSaveV9: state\.scriptDevelopment\.projects\[0\] has unknown field "retirementBypass"$/)
    expect(() => validateSaveV51({ ...envelope(f.finishing), retirementBypass: true })).toThrow(/^validateSaveV12: save has unknown field "retirementBypass"$/)
  })

  it('frozen public V36 stays strict, and an exceptional current save cannot silently downgrade', () => {
    const f = finishingWriter()
    const old = historicalWriterPair()
    expect(old.commissioned.state.careerLifecycle.records.every(row => row.profession !== 'scientist'), 'frozen-reader control has no unsupported Scientist record').toBe(true)
    expect(() => validateSaveV36({ ...old.commissioned, saveVersion: 36 })).not.toThrow()
    expect(() => validateSaveV36({ ...old.finishing, saveVersion: 36 })).toThrow(/not contracted/i)
    expect(convertV37ToV36(old.commissioned).saveVersion).toBe(36)
    // 1358-N S9: the V36 extension guard on its own era's input (src/core/save.ts:10382-10388).
    // The genuine pair's commissioned311 save holds authored-0000's open retirementExtension case,
    // opened at week 300, and the real convertV37ToV36 carries it to V36. The two downgrade leaves of
    // tests/p14c2b-save-v36.test.ts name this assertion, since Save44 now stops their live chains.
    expect(() => convertV36ToV35(convertV37ToV36(old.commissioned))).toThrow(/^migrateToV35: cannot downgrade SaveFileV36 or discard the retirement extension \u2014 it holds 1 retirementExtension case\(s\) and 0 used extension\(s\) \(first: authored-0000\), and V35 has nowhere to record the one final extension$/)
    expect(() => convertV37ToV36(old.finishing)).toThrow(/not contracted/i)
    const current = makeSave(f.finishing), before = stableStringify(current)
    // 1361-N S9 (MASKED), F7 ruling 2: the recorded Power Ranking quarter makes
    // convertV45ToV44 refuse first (src/core/save.ts:10989-10995; reason :10895).
    // x2 measured this first guard in the family; the follow-up must confirm every call.
    // The romance guard remains covered on its own V44 input in p14b10-save-v44.test.ts.
    // The commissioned V37 control above covers the V36 extension guard.
    // The finishing V37 control covers the not-contracted refusal this live chain masks.
    // V39 stays covered by p13b-s3-save-v23.test.ts (the V40 input refusal).
    // MOVED (P16 rebase): the live step refuses first, by name (the world recorded titles). The chain below starts from
    // the world's Save48 projection, which does not exist here: its shared-market history is table 3 and nondefault,
    // and `rightsStripped` refuses to relabel it, so the V45 guard pinned here before is unreachable from this world.
    expect(() => convertV49ToV48(convertV50ToV49(convertV51ToV50(current)))).toThrow(RIGHTS_ROOT_REFUSAL)
    expect(() => convertV37ToV36(convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42ToV41(convertV43ToV42(convertV44ToV43(convertV45ToV44(convertV46ToV45(convertV47ToV46(predecessorSave(current.state))))))))))))).toThrow(NONDEFAULT_MARKET_PROJECTION)
    expect(stableStringify(current)).toBe(before)
  })

  it('genuine older migration preserves existing screenplay, employment and work facts', () => {
    const old = c2Fixture('genuine-v33-c2-contract-and-case'), before = stableStringify(old)
    const live = migrateToLive(importSave(stableStringify({ saveVersion: 33, seed: old.seed,
      state: old, broadcastCache: old.broadcastItems }))).state
    expect(live.scriptDevelopment).toEqual(old.scriptDevelopment)
    expect(live.contracts).toEqual(old.contracts)
    // 1344-N S5 (x2 at a318722, :257 measured `+ "screenplayShelving"` on each of four rival businesses, nothing else).
    expect(live.hollywood).toEqual(withZeroLoanMovements(withEmptyRecovery(withEmptyScreenplayShelving(withRivalTermination(old)))).hollywood)
    expect(live.talent).toEqual(old.talent)
    expect(live.originalScreenplays).toEqual(old.originalScreenplays)
    expect(stableStringify(old)).toBe(before)
    expect(bytes(readBack(live))).toBe(bytes(live))
  })

  it('validation authority never leaks between campaigns with the same project and PersonIds', () => {
    const f = finishingWriter(), legal = envelope(f.finishing)
    const illegal = envelope({ ...f.finishing, careerLifecycle: { ...f.finishing.careerLifecycle,
      records: f.finishing.careerLifecycle.records.filter(row => row.personId !== f.writerId) } })
    const legalBefore = stableStringify(legal), illegalBefore = stableStringify(illegal)
    for (let round = 0; round < 2; round++) {
      expect(() => validateSaveV51(legal)).not.toThrow()
      // 1358-D9 R2 (S8): `illegal` is N-0468 case 1's input, so it takes that case's measured refusal.
      expect(() => validateSaveV51(illegal)).toThrow(/validateSaveV36: talentMarket\.cases\[25\] is a retirementExtension case for authored-0000, who holds no retirement record$/) // save.ts:10295
      expect(() => validateSaveV36({ ...historicalWriterPair().finishing, saveVersion: 36 })).toThrow(/not contracted/i)
    }
    expect(stableStringify(legal)).toBe(legalBefore)
    expect(stableStringify(illegal)).toBe(illegalBefore)
    expect(owner(legal.state)).toBe(owner(illegal.state)) // identical IDs alone confer no authority.
  })
})

// Review finding after900: Save37 already rejects these corrupt records, but a
// current in-memory caller must not grant expired writing from malformed
// retirement authority before reaching a save. Exercise only public live paths.
const changeRetirement = (state: GameState, id: string, patch: Partial<RetirementRecordV36>): GameState => ({ ...state,
  careerLifecycle: { ...state.careerLifecycle,
    records: state.careerLifecycle.records.map(row => row.personId === id ? { ...row, ...patch } : row),
  },
})
const invalidTemporalAuthority: (InvalidCase & { saveRefusal?: RegExp })[] = [
  { name: 'non-finite effective week', corrupt: (state, id) => changeRetirement(state, id, { effectiveWeek: Number.NaN }) },
  { name: 'fractional effective/finishing week', corrupt: (state, id) => changeRetirement(state, id, {
    effectiveWeek: 312.5, finishingFromWeek: 312.5,
  }) },
  { name: 'announced status at the effective week', corrupt: (state, id) => changeRetirement(state, id, {
    status: 'announced', finishingFromWeek: null,
  }) },
  { name: 'finishing date differs from the effective week', corrupt: (state, id) => changeRetirement(state, id, { finishingFromWeek: 311 }) },
  // 1361-N S8 / F7 ruling 9: the x2-guards probe reaches the V36 market-case
  // retirement-coherence guard before the lifecycle future-announcement guard.
  // This full-save control does not isolate the latter; the live callers still refuse below.
  { name: 'announcement lies in the future',
    saveRefusal: /^validateSaveV37: state is invalid \u2014 validateSaveV36: talentMarket\.cases\[25\] opened at week 300, when authored-0000's retirement was not announced \(announced week 313, effective week 312\)$/,
    corrupt: (state, id) => changeRetirement(state, id, { announcedWeek: 313 }) },
  { name: 'finishing status carries a retired date', corrupt: (state, id) => changeRetirement(state, id, { retiredWeek: 312 }) },
  { name: 'duplicate lifecycle person authority', corrupt: (state, id) => ({ ...state, careerLifecycle: { ...state.careerLifecycle,
    records: [...state.careerLifecycle.records, { ...state.careerLifecycle.records.find(row => row.personId === id)! }],
  } }) },
  // Deliberately malformed runtime input; no typed public action writes version2.
  { name: 'unsupported lifecycle intent version', corrupt: (state, id) => changeRetirement(state, id, { intentRulesVersion: 2 as 1 }) },
]
type LiveTemporalInput = { state: GameState; retiringId: string; youngId: string }
let temporalInputCache: LiveTemporalInput | undefined
function temporalInput(): LiveTemporalInput {
  if (temporalInputCache === undefined) {
    const f = finishingWriter()
    const made = addPerson(f.finishing, '880-B Temporal Control Writer', 'writer', 40)
    const state = admitted(applyActions(made.state, [{ kind: 'signContract', talentId: made.id, termWeeks: 52 }]))
    expect(state.market.tick).toBe(312)
    expect(retirementRecordFor(state, f.writerId)).toMatchObject({
      announcedWeek: 260, effectiveWeek: 312, status: 'finishing_commitments', finishingFromWeek: 312, retiredWeek: null,
    })
    expect(activeContract(state, f.writerId)).toBeUndefined()
    expect(activeContract(state, made.id)).toBeDefined()
    expect(writeProject(state, f.writerId).dueWeek).toBeGreaterThan(312)
    expect(availableDevelopmentCastingSlots(state.operations, state.scriptDevelopment, new Set())).toBeGreaterThan(0)
    temporalInputCache = { state, retiringId: f.writerId, youngId: made.id }
  }
  return structuredClone(temporalInputCache)
}
const liveTemporalCallers: { name: string; run: (state: GameState, youngId: string) => unknown }[] = [
  { name: 'tick', run: state => tick(state) },
  { name: 'Calendar', run: state => studioCalendar(state) },
  { name: 'construction view', run: state => studioConstructionView(state) },
  { name: 'unrelated screenplay action', run: (state, youngId) => applyActions(state, [originalCommission(youngId)]) },
]
describe('880-B malformed authority refuses before live work, not only at persistence', () => {
  for (const caller of liveTemporalCallers) {
    it.each(invalidTemporalAuthority)(`${caller.name} refuses $name`, ({ corrupt, saveRefusal }) => {
      const f = temporalInput()
      // The unmodified real state and this same live entrypoint are admissible.
      expect(() => caller.run(f.state, f.youngId)).not.toThrow()
      const invalid = corrupt(f.state, f.retiringId), before = structuredClone(invalid)
      const validateInvalid = () => validateSaveV51(envelope(invalid))
      if (saveRefusal === undefined) expect(validateInvalid, 'existing full-save refusal is a control').toThrow()
      else expect(validateInvalid, 'measured first full-save guard (1361-N S8)').toThrow(saveRefusal)
      expect(() => caller.run(invalid, f.youngId), 'live permission must also reject malformed authority').toThrow()
      // Compare in memory so NaN and signed zero are not hidden by JSON encoding.
      expect(invalid).toEqual(before)
    })
  }
})

// Same preserved historical311 input as the player/Bridge obligation leaf; fixed first entered rival R01.
describe('P16 genuine rival retained obligations at original312', () => {
  it('quotes actual R01 buying R02 with its retained writer and four promise histories before the obligations producer', () => {
    const historical = historicalWriterPair(), historyBefore = stableStringify(historical)
    const initial = migrateToLive(historical.commissioned).state, initialBefore = stableStringify(initial)
    expect(initial.market.tick).toBe(311)
    const state = tick(initial), stateBefore = stableStringify(state)
    expect(stableStringify(initial)).toBe(initialBefore); expect(stableStringify(historical)).toBe(historyBefore)
    expect(state.market.tick).toBe(312); expect(state.rights.absorptions).toEqual([])
    const buyerId = 'studio-56472515-r01', targetId = 'studio-56472515-r02', writer = 'person-studio-56472515-r02-0'
    expect(state.hollywood!.identities.find(i => i.studioId === buyerId)).toMatchObject({ row: 1, enteredWeek: 0 })
    expect(owner(state)).not.toBe(buyerId)
    const buyer = state.hollywood!.businesses.find(b => b.studioId === buyerId)!, source = state.hollywood!.businesses.find(b => b.studioId === targetId)!
    for (const studioId of [buyerId, targetId]) {
      expect(conditionRecord(state, studioId)?.condition).toMatchObject({ stage: 'stable', week: 312 })
      expect(outstandingLoan(state, studioId, 312)).toBeUndefined()
    }
    expect(permittedBidderRefusal(state, buyerId, 312)).toBeNull(); expect(buyer.costCutting.since).toBeNull()
    expect(buyer.productions).toMatchObject([{ id: buyerId + ':film:33', startTick: 309, remainingTicks: 6 }])
    expect(buyer.productions).toHaveLength(1)
    const own = writeProject(state, historical.writerId)
    expect(own).toMatchObject({ id: 'script-0000', status: 'drafting', commissionedWeek: 311, dueWeek: 314 })
    expect(activeContract(state, historical.writerId)).toBeUndefined()
    expect(retirementRecordFor(state, historical.writerId)).toMatchObject({ status: 'finishing_commitments', effectiveWeek: 312 })
    const script = source.development.projects.find(p => p.id === 'script-0035')!
    expect(script).toMatchObject({ status: 'drafting', commissionedWeek: 310, dueWeek: 313, writerId: writer, writerIds: [writer] })
    expect(source.productions).toMatchObject([{ id: targetId + ':film:34', startTick: 310, remainingTicks: 7 }]); expect(source.productions).toHaveLength(1)
    const employees = state.hollywood!.activeEmploymentOrdinals.map(i => state.hollywood!.employment[i]!)
      .filter(e => e.studioId === targetId && e.endedWeek === null && e.terms.startWeek <= 312 && 312 < e.terms.endWeekExclusive)
    expect(employees).toHaveLength(6)
    const keep = employees.find(e => e.terms.talentId === writer)!
    expect(keep).toMatchObject({ contractId: targetId + ':contract:' + writer + ':208', terms: { startWeek: 208, endWeekExclusive: 416 } })
    expect(personReservationRefusal(state, writer, buyerId, 312), 'fixed writer must actually accept R01; no alternate buyer or person').toBeNull()
    const pool = { ...buyer.development, projects: buyer.activeScriptOrdinals.map(i => buyer.development.projects[i]!) }
    expect(pool.mode).toBe('managed'); expect(pool.projects.filter(p => p.status === 'drafting' || p.status === 'rewriting')).toEqual([])
    const occupied = new Set([...scriptOccupiedFacilitySlots(pool), ...rivalInstallationSlots(state.technology, buyer)])
    const reservation = allocateScriptReservation(buyer.operations, pool, `prospective-script:${targetId}:${script.id}`, occupied)
    expect(reservation, 'actual R01 slot beside its genuine running film, not copied player capacity').not.toBeNull()
    expect(buyer.operations.facilities.some(f => f.id === reservation!.facilityId && f.capability === reservation!.capability && f.capacity > reservation!.slot)).toBe(true)
    expect(stableStringify(state)).toBe(stateBefore)
    const targetPromises = state.promises.filter(p => p.issuerStudioId === targetId)
    expect(targetPromises).toEqual(initial.promises.filter(p => p.issuerStudioId === targetId)); expect(targetPromises).toHaveLength(25)
    const unbound = targetPromises.filter(p => p.outcome === null && p.contractId === null)
    const bound = targetPromises.filter(p => p.outcome === null && p.contractId !== null), settled = targetPromises.filter(p => p.outcome !== null)
    expect(unbound).toHaveLength(19); expect(bound.map(p => p.promiseId)).toEqual(['promise-13', 'promise-15', 'promise-23'])
    expect(bound.find(p => p.promiseId === 'promise-13')).toMatchObject({ contractId: keep.contractId, beneficiaryPersonId: writer, family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 208, dueWeekExclusive: 416, progress: 0, evidenceRefs: [] })
    expect(settled.map(p => p.promiseId)).toEqual(['promise-17', 'promise-19', 'promise-21'])
    expect(settled.every(p => p.outcome === 'SATISFIED' && p.outcomeWeek === 216 && p.evidenceRefs.includes('first-take-event-93'))).toBe(true)
    // Closed cases and resolved promises remain historical facts, not fresh dispositions.
    const historicalCases = state.talentMarket.cases.filter(c => c.subjectStudioId === targetId)
    expect(historicalCases).toHaveLength(6); expect(historicalCases.every(c => c.closedWeek !== null)).toBe(true)
    expect(historicalCases).toEqual(initial.talentMarket.cases.filter(c => c.subjectStudioId === targetId))
    expect(state.talentMarket.proposals.filter(p => p.issuerStudioId === targetId)).toEqual([])
    const paid = requestDiligence(state, { recipientId: buyerId, target: { kind: 'studio', studioId: targetId }, scope: ['rights', 'employment', 'liabilities'] }, 312)
    expect(stableStringify(state)).toBe(stateBefore)
    const paidBefore = stableStringify(paid.state), paidBuyer = paid.state.hollywood!.businesses.find(b => b.studioId === buyerId)!
    expect(paid.record).toMatchObject({ recipientId: buyerId, week: 312, target: { kind: 'studio', studioId: targetId }, scope: ['rights', 'employment', 'liabilities'], fee: TUNING.RIGHTS_DUE_DILIGENCE_FEE })
    expect(paid.record.fee).toBeGreaterThan(0); expect(paidBuyer.account.cash).toBe(buyer.account.cash - paid.record.fee)
    expect(paidBuyer.account.periods.reduce((sum, p) => sum + p.movements.dueDiligenceFee, 0) - buyer.account.periods.reduce((sum, p) => sum + p.movements.dueDiligenceFee, 0)).toBe(-paid.record.fee)
    expect(paid.state.studio).toEqual(state.studio); expect(paid.state.ledger).toEqual(state.ledger)
    expect(paid.state.promises).toEqual(state.promises); expect(paid.state.talentMarket).toEqual(state.talentMarket)
    const exits = employees.filter(e => e.contractId !== keep.contractId).reduce((sum, e) => sum + terminationCost(e.terms, 312), 0)
    const postExitCash = source.account.cash - exits, library = libraryValuationV1(paid.state, targetId, 312)
    expect(library.kind).toBe('available'); if (library.kind !== 'available') throw new Error('fixed real R02 held-title valuation unavailable')
    const consideration = absorptionAsk(library.total, postExitCash)
    const preview = { buyerId, targetId, consideration, disclosureId: paid.record.id, retention: { kind: 'explicit' as const, contractIds: [keep.contractId] } }
    const quote = quoteAbsorption(paid.state, preview, 312)
    expect(stableStringify(paid.state)).toBe(paidBefore)
    expect(quote.kind, 'fixed R01/R02 complete public quote, no alternate amount or date').toBe('quote'); if (quote.kind !== 'quote') throw new Error(quote.refusal)
    expect(quote.affordable).toBe(true); expect(quote.ask).toBe(consideration); expect(quote.rightsValue).toBe(library.total)
    expect(quote.contracts.filter(c => c.retained).map(c => c.contractId)).toEqual([keep.contractId])
    expect(quote.contracts.find(c => c.contractId === keep.contractId)?.reason).toBeNull(); expect(quote.contracts.filter(c => !c.retained)).toHaveLength(5)
    expect(quote.exitCharges).toBe(exits); expect(exits).toBeGreaterThan(0); expect(quote.targetCashBeforeExits).toBe(source.account.cash)
    expect(quote.postExitCash).toBe(postExitCash); expect(quote.outlay).toBe(consideration - postExitCash); expect(quote.guarantees).toBe(guaranteedComp(keep.terms, 312))
    const fixedCost = Math.ceil(weeklyFixedCost(paid.state, buyerId) + keep.terms.annualSalary / TUNING.TICKS_PER_YEAR + TUNING.OVERHEAD_PER_EMPLOYEE)
    expect(quote.resultingWeeklyFixedCost).toBe(fixedCost); expect(quote.reserveAfter).toBe(TUNING.RIGHTS_RESERVE_WEEKS * fixedCost)
    expect(spendableCash(paid.state, buyerId) - quote.outlay).toBeGreaterThanOrEqual(quote.reserveAfter)
    expect(quote.productions).toMatchObject([{ productionId: targetId + ':film:34', remainingTicks: 7, disposition: 'cancelRequired', reason: 'missingParticipants' }])
    expect(quote.scripts).toEqual([{ scriptProjectId: script.id, status: 'drafting', writerIds: [writer], sourceContractIds: [keep.contractId], disposition: 'continues', reason: 'writerTeamRetained' }])
    expect(quote.runs).toEqual(source.runs.map(r => ({ productionId: r.productionId, beneficiaryFromWeek: 312, startingWeekIndex: r.weekIndex,
      grossPaidBeforeClose: r.cumulativeGrossPaid, revenuePaidBeforeClose: r.cumulativeStudioRevenuePaid })))
    expect(quote.promiseObligations.filter(p => p.disposition === 'unboundHistory')).toEqual(unbound.map(p => ({ promiseId: p.promiseId, disposition: 'unboundHistory', sourceContractId: null })))
    expect(quote.promiseObligations.filter(p => p.disposition === 'continued')).toEqual([{ promiseId: 'promise-13', disposition: 'continued', sourceContractId: keep.contractId }])
    expect(quote.promiseObligations.filter(p => p.disposition === 'exit')).toEqual(bound.filter(p => p.promiseId !== 'promise-13').map(p => ({ promiseId: p.promiseId, disposition: 'exit', sourceContractId: p.contractId })))
    expect(quote.promiseObligations).toHaveLength(22); expect(quote.promiseObligations.some(p => settled.some(s => s.promiseId === p.promiseId))).toBe(false)
    expect(quote.marketObligations).toEqual({ proposalCount: 0, caseCount: 0 })
    const input = { ...preview, quotedAtWeek: quote.quotedAtWeek, quoteAgePolicyVersion: quote.quoteAgePolicyVersion }
    expect(input).toMatchObject({ quotedAtWeek: 312, quoteAgePolicyVersion: 1 })
    console.info('S8_RIVAL_OBLIGATIONS_REAL312_PREMISES ' + JSON.stringify({ buyerId, targetId, week: 312, writer, ownDue: own.dueWeek, acquiredDue: script.dueWeek, reservation,
      buyerCash: paidBuyer.account.cash, consideration, exits, outlay: quote.outlay, reserve: quote.reserveAfter, promises: quote.promiseObligations,
      settled: settled.map(p => p.promiseId), market: quote.marketObligations, producerRefusal: absorptionProducerRefusal(paid.state, input) }))
    let closed: GameState
    try { closed = closeAbsorption(paid.state, input, 312) }
    finally {
      expect(stableStringify(paid.state)).toBe(paidBefore); expect(stableStringify(state)).toBe(stateBefore)
      expect(stableStringify(initial)).toBe(initialBefore); expect(stableStringify(historical)).toBe(historyBefore)
    }
    const record = closed.rights.absorptions.find(a => a.targetId === targetId)!
    const receipt = (s: GameState) => {
      const a = s.rights.absorptions.find(a => a.id === record.id)!
      if (a?.producerVersion !== 'absorption-rival-obligations/v9') throw new Error('actual combined native rival obligations producer required')
      return a
    }
    const business = (s: GameState, id = buyerId) => s.hollywood!.businesses.find(b => b.studioId === id)!
    const booked = (s: GameState, id: string, kind: 'signing' | 'termination' | 'payroll' | 'acquisitionOutlay') => business(s, id).account.periods.reduce((sum, p) => sum + p.movements[kind], 0)
    const money = (s: GameState) => business(s).account.periods.reduce((sum, p) => sum + Object.values(p.movements).reduce((n, value) => n + value, 0), 0)
    const buyerContractId = `${buyerId}:contract:${writer}:312`, retainedPromise = bound.find(p => p.promiseId === 'promise-13')!
    const exitPromises = bound.filter(p => p.promiseId !== retainedPromise.promiseId)
    const ownUnbound = paid.state.promises.find(p => p.promiseId === 'promise-12')!
    expect(ownUnbound).toMatchObject({ issuerStudioId: buyerId, beneficiaryPersonId: writer, contractId: null, outcome: null })
    expect(record).toMatchObject({ buyerId, targetId, week: 312, exitCharges: exits, postExitCash, outlay: quote.outlay, consideration })
    expect(record.continuedProductions).toEqual([]); expect(record.buyerWorkflows).toEqual([])
    expect(record.stoppedProductions).toMatchObject([{ productionId: source.productions[0]!.id, remainingTicks: 7, reason: 'missingParticipants' }])
    expect(record.stoppedProductions).toHaveLength(1)
    expect(record.contracts.filter(c => c.buyerContractId !== null)).toEqual([{ sourceContractId: keep.contractId, buyerContractId, talentId: writer, exitCost: 0 }])
    const kept = closed.hollywood!.employment.find(e => e.contractId === buyerContractId)!
    expect(kept).toEqual({ contractId: buyerContractId, studioId: buyerId, endedWeek: null, reason: 'absorptionContinuation', terms: { ...keep.terms, startWeek: 312, termWeeks: 104 } })
    expect(closed.hollywood!.employment.find(e => e.contractId === keep.contractId)).toEqual({ ...keep, endedWeek: 312 })
    expect(closed.freeAgents).not.toContain(writer)
    for (const original of employees.filter(e => e.contractId !== keep.contractId)) {
      expect(record.contracts.find(c => c.sourceContractId === original.contractId)).toEqual({ sourceContractId: original.contractId, buyerContractId: null, talentId: original.terms.talentId, exitCost: terminationCost(original.terms, 312) })
      expect(closed.hollywood!.employment.find(e => e.contractId === original.contractId)).toEqual({ ...original, endedWeek: 312 })
      expect(closed.freeAgents).toContain(original.terms.talentId)
    }
    const closeEmployment = closed.hollywood!.receipts.slice(paid.state.hollywood!.receipts.length).filter(r => r.kind === 'employment')
    expect(closeEmployment).toHaveLength(7)
    expect(closeEmployment.filter(r => r.talentId === writer)).toMatchObject([
      { week: 312, studioId: targetId, contractId: keep.contractId, fromStudioId: targetId, toStudioId: null, reason: 'absorptionContinuation' },
      { week: 312, studioId: buyerId, contractId: buyerContractId, fromStudioId: targetId, toStudioId: buyerId, reason: 'absorptionContinuation' },
    ])
    expect(business(closed).account.cash).toBe(paidBuyer.account.cash - quote.outlay)
    expect(business(closed, targetId).account.cash).toBe(0)
    expect(booked(closed, buyerId, 'acquisitionOutlay') - booked(paid.state, buyerId, 'acquisitionOutlay')).toBe(-quote.outlay)
    expect(booked(closed, targetId, 'acquisitionOutlay') - booked(paid.state, targetId, 'acquisitionOutlay')).toBe(-postExitCash)
    expect(booked(closed, targetId, 'termination') - booked(paid.state, targetId, 'termination')).toBe(-exits)
    expect(booked(closed, buyerId, 'termination')).toBe(booked(paid.state, buyerId, 'termination'))
    for (const id of [buyerId, targetId]) expect(booked(closed, id, 'signing')).toBe(booked(paid.state, id, 'signing'))
    expect(closed.studio).toEqual(paid.state.studio); expect(closed.ledger).toEqual(paid.state.ledger)
    expect(closed.contracts).toEqual(paid.state.contracts); expect(closed.scriptDevelopment).toEqual(paid.state.scriptDevelopment)
    expect(business(closed).development).toEqual(buyer.development); expect(business(closed).projects).toEqual(buyer.projects)
    expect(closed.hollywood!.receipts.slice(0, paid.state.hollywood!.receipts.length)).toEqual(paid.state.hollywood!.receipts)
    expect(closed.talentMarket.receipts.slice(0, paid.state.talentMarket.receipts.length)).toEqual(paid.state.talentMarket.receipts)
    expect(closed.talentMarket.proposals).toEqual(paid.state.talentMarket.proposals); expect(closed.talentMarket.cases).toEqual(paid.state.talentMarket.cases)
    const obligations = receipt(closed).obligations
    expect(obligations).toMatchObject({ promiseCountBeforeClose: paid.state.promises.length, firstTakeCountBeforeClose: paid.state.firstTakes.length, marketReceiptCountBeforeClose: paid.state.talentMarket.receipts.length, withdrawals: [], cases: [] })
    expect(obligations.promises.map(d => d.original)).toEqual(targetPromises.filter(p => p.outcome === null))
    expect(obligations.promises.filter(d => d.kind === 'unboundHistory')).toEqual(unbound.map(original => ({ kind: 'unboundHistory', original })))
    expect(obligations.promises.filter(d => d.kind === 'continued')).toEqual([{ kind: 'continued', original: retainedPromise, sourceContractId: keep.contractId, buyerContractId }])
    expect(closed.promises.find(p => p.promiseId === retainedPromise.promiseId)).toEqual(retainedPromise)
    expect(operatingPromiseIssuer(closed, retainedPromise, 312)).toBe(buyerId)
    for (const original of exitPromises) {
      const broken = closed.promises.find(p => p.promiseId === original.promiseId)!
      expect(broken).toEqual({ ...original, outcome: 'BROKEN', outcomeWeek: 312, outcomeCause: 'the studio terminated this contract early, ending the window', outcomeEventId: broken.outcomeEventId })
      expect(broken.outcomeEventId).not.toBeNull()
      expect(obligations.promises.find(d => d.original.promiseId === original.promiseId)).toEqual({ kind: 'exit', original, sourceContractId: original.contractId, outcomeEventId: broken.outcomeEventId })
      expect(closed.talentMarket.receipts.filter(r => r.eventId === broken.outcomeEventId)).toEqual([{ eventId: broken.outcomeEventId, kind: 'promiseOutcome', week: 312, studioId: targetId, talentId: original.beneficiaryPersonId, reasons: ['a promise to this person was broken by an early termination'], dropped: [] }])
      expect(trustDrivers(closed, original.beneficiaryPersonId, targetId, 312).filter(d => d.kind === 'promiseBroken' && d.week === 312)).toEqual([{ kind: 'promiseBroken', week: 312, positive: false, reason: 'broke a promise' }])
      expect(trustDrivers(closed, original.beneficiaryPersonId, buyerId, 312).filter(d => d.kind === 'promiseKept' || d.kind === 'promiseBroken')).toEqual(trustDrivers(paid.state, original.beneficiaryPersonId, buyerId, 312).filter(d => d.kind === 'promiseKept' || d.kind === 'promiseBroken'))
    }
    expect(obligations.closeEvents).toEqual(exitPromises.map(original => ({ kind: 'exitOutcome', promiseId: original.promiseId, eventId: closed.promises.find(p => p.promiseId === original.promiseId)!.outcomeEventId })))
    expect(closed.talentMarket.receipts.slice(paid.state.talentMarket.receipts.length)).toHaveLength(2)
    for (const original of [...unbound, ...settled, ownUnbound]) expect(closed.promises.find(p => p.promiseId === original.promiseId)).toEqual(original)
    expect(closed.promises.filter(p => p.issuerStudioId !== targetId)).toEqual(paid.state.promises.filter(p => p.issuerStudioId !== targetId))
    const carried = receipt(closed).continuedScripts[0]!, projectId = carried.project.id
    expect(receipt(closed).continuedScripts).toHaveLength(1); expect(receipt(closed).stoppedScripts).toEqual([])
    expect(carried.originalScript).toEqual(script); expect(carried.originalCosts).toEqual(source.projects.find(p => p.scriptProjectId === script.id))
    expect(carried.sourceContractIds).toEqual([keep.contractId]); expect(carried.buyerContractIds).toEqual([buyerContractId])
    expect(projectId).toMatch(/^absorbed-script-[1-9][0-9]*$/)
    expect(carried.project).toEqual({ ...script, id: projectId, reservation: { ...reservation!, projectId } })
    expect(carried.reservationAtClose).toEqual(carried.project.reservation)
    expect(receipt(closed).scriptCompletions).toEqual([]); expect(receipt(closed).scriptDecisions).toEqual([])
    expect(receipt(closed).scriptShelving).toEqual({ rejections: [], shelved: [] })
    const concept = closed.hollywood!.concepts.find(c => c.id === script.conceptId)!
    expect(releaseRefusal(closed, buyerId, writer)).toBe(`talent "${writer}" is Drafting ${concept.title} and must finish that screenplay task first`)
    expect(busyTalentIds(closed).has(writer)).toBe(true)
    const closedBefore = stableStringify(closed)
    expect(() => closeAbsorption(closed, input, 312)).toThrow('absorption: targetTerminal'); expect(stableStringify(closed)).toBe(closedBefore)
    const loaded = readBack(closed), loadedBefore = stableStringify(loaded)
    const ready = tick(closed), replay = tick(loaded)
    expect(stableStringify(closed)).toBe(closedBefore); expect(stableStringify(loaded)).toBe(loadedBefore)
    expect(stableStringify(replay)).toBe(stableStringify(ready)); expect(ready.market.tick).toBe(313)
    const readyProject = receipt(ready).continuedScripts[0]!.project, assessment = assessFirstDraft(concept, 0)
    expect(readyProject).toEqual({ ...carried.project, status: 'ready', dueWeek: null, reservation: null, assessment })
    expect(receipt(ready).scriptCompletions).toHaveLength(1)
    const completion = receipt(ready).scriptCompletions[0]!
    expect(completion).toMatchObject({ projectId, week: 313, inputWeek: 312, estUplift: 0, writerRewriting: null, assessment })
    expect(completion.id).toMatch(/^script-completion-[1-9][0-9]*$/)
    // Real disposal has run; arrival313 Laboratory completions follow this observation.
    const arrivedFacilities = new Set(ready.hollywood!.receipts.flatMap(r => r.kind === 'laboratoryOperational' && r.studioId === buyerId && r.week === 313 ? [r.facilityId] : []))
    expect(completion.developmentContext).toEqual({ facilities: business(ready).operations.facilities.filter(f => !arrivedFacilities.has(f.id)), placements: [], paidRows: [] })
    expect(receipt(ready).scriptDecisions).toHaveLength(1)
    expect(receipt(ready).scriptDecisions[0]).toMatchObject({ projectId, kind: 'accept', week: 313 })
    expect(receipt(ready).scriptDecisions[0]!.id).toMatch(/^script-decision-[1-9][0-9]*$/)
    expect(writeProject(ready, historical.writerId)).toEqual(own); expect(activeContract(ready, historical.writerId)).toBeUndefined()
    expect(retirementRecordFor(ready, historical.writerId)).toMatchObject({ status: 'finishing_commitments', effectiveWeek: 312 })
    expect(releaseRefusal(ready, buyerId, writer)).toBeNull(); expect(busyTalentIds(ready).has(writer)).toBe(false)
    expect(business(ready).productions.find(p => p.id === buyerId + ':film:33')).toMatchObject({ remainingTicks: 5 })
    expect(ready.firstTakes.filter(t => t.productionId === buyerId + ':film:33')).toEqual([])
    const readyBefore = stableStringify(ready), afterChoice = tick(ready)
    expect(stableStringify(ready)).toBe(readyBefore); expect(afterChoice.market.tick).toBe(314)
    // Existing own film33 reaches its first take; no fabricated acquired film is scheduled.
    const picture = business(ready).productions.find(p => p.id === buyerId + ':film:33')!
    expect([picture.directorId, ...Object.values(picture.cast)]).not.toContain(writer)
    const unrelatedTakes = afterChoice.firstTakes.filter(t => t.productionId === picture.id)
    expect(unrelatedTakes).toHaveLength(1)
    expect(unrelatedTakes[0]).toMatchObject({ studioId: buyerId, week: 314, directorId: picture.directorId, cast: picture.cast })
    expect(afterChoice.firstTakeSubjects.facts.find(f => f.eventId === unrelatedTakes[0]!.eventId)).toMatchObject({ conceptId: picture.conceptId, scriptProjectId: business(ready).development.projects.find(p => p.productionId === picture.id)!.id })
    expect(receipt(afterChoice).continuedScripts[0]!.project).toEqual(readyProject)
    expect(receipt(afterChoice).scriptCompletions).toEqual(receipt(ready).scriptCompletions)
    expect(receipt(afterChoice).scriptDecisions).toEqual(receipt(ready).scriptDecisions)
    console.info('S8_RIVAL_OBLIGATIONS_NATIVE313_BOUNDARY ' + JSON.stringify({ buyerId, writer, inputWeek: 313, existingOpenOwnPromise: ownUnbound.promiseId,
      ownFirstTake: unrelatedTakes[0], retainedPromise: afterChoice.promises.find(p => p.promiseId === retainedPromise.promiseId),
      writerInterval: afterChoice.hollywood!.employment.find(e => e.contractId === buyerContractId), carriedProject: receipt(afterChoice).continuedScripts[0]!.project,
      qualification: 'no retained first-take or termination reached; own unbound promise also protects employment, so delegated-only retention is unproved' }))
    for (const [prior, next] of [[closed, ready], [ready, afterChoice]] as const) {
      const week = prior.market.tick
      expect(next.hollywood!.employment.find(e => e.contractId === buyerContractId)).toEqual(kept)
      expect(next.hollywood!.receipts.filter(r => r.kind === 'employment' && r.contractId === buyerContractId && r.reason === 'termination')).toEqual([])
      const paidPeople = next.hollywood!.employment.filter(e => e.studioId === buyerId && e.terms.startWeek <= week && week < e.terms.endWeekExclusive && (e.endedWeek === null || week < e.endedWeek))
      expect(paidPeople.some(e => e.contractId === buyerContractId)).toBe(true)
      expect(booked(next, buyerId, 'payroll') - booked(prior, buyerId, 'payroll')).toBe(-paidPeople.reduce((sum, e) => sum + weeklySalary(e.terms.annualSalary), 0))
      expect(business(next).account.cash - business(prior).account.cash).toBeCloseTo(money(next) - money(prior), 6)
      expect(business(next).account.cash).toBeCloseTo(business(next).account.openingBalance + money(next), 6)
      expect(business(next, targetId).account).toEqual(business(closed, targetId).account)
      expect(business(next, targetId).development).toEqual(source.development); expect(business(next, targetId).projects).toEqual(source.projects)
      expect(business(next, targetId).productions).toEqual(source.productions)
      expect(receipt(next).continuedScripts[0]!.originalScript).toEqual(script); expect(receipt(next).continuedScripts[0]!.originalCosts).toEqual(carried.originalCosts)
      expect(receipt(next).obligations).toEqual(obligations)
      expect(next.promises.filter(p => p.issuerStudioId === targetId)).toEqual(closed.promises.filter(p => p.issuerStudioId === targetId))
      expect(next.promises.find(p => p.promiseId === ownUnbound.promiseId)).toEqual(ownUnbound)
      expect(next.promises.find(p => p.promiseId === retainedPromise.promiseId)).toEqual(retainedPromise)
      expect(next.talentMarket.receipts.filter(r => r.kind === 'promiseOutcome' && r.studioId === targetId)).toEqual(closed.talentMarket.receipts.filter(r => r.kind === 'promiseOutcome' && r.studioId === targetId))
      expect(next.talentMarket.cases.filter(c => c.subjectStudioId === targetId)).toEqual(historicalCases)
      expect(next.firstTakes.filter(t => t.studioId === targetId)).toEqual(paid.state.firstTakes.filter(t => t.studioId === targetId))
      expect(next.studio.cash).toBeCloseTo(prior.studio.cash + next.ledger.slice(prior.ledger.length).reduce((sum, r) => sum + r.amount, 0), 6)
      expect(next.contracts).toEqual(paid.state.contracts)
    }
    for (const issuer of [targetId, buyerId]) expect(trustDrivers(afterChoice, writer, issuer, 314).filter(d => d.kind === 'promiseKept' || d.kind === 'promiseBroken'))
      .toEqual(trustDrivers(paid.state, writer, issuer, 312).filter(d => d.kind === 'promiseKept' || d.kind === 'promiseBroken'))
    expect(afterChoice.scriptDevelopment.projects.find(p => p.id === own.id)).toMatchObject({ id: own.id, status: 'review', dueWeek: null, writerId: historical.writerId, writerIds: own.writerIds })
    expect(activeContract(afterChoice, historical.writerId)).toBeUndefined()
    readBack(afterChoice)
    expect(stableStringify(paid.state)).toBe(paidBefore); expect(stableStringify(state)).toBe(stateBefore)
    expect(stableStringify(initial)).toBe(initialBefore); expect(stableStringify(historical)).toBe(historyBefore)
  })
})
