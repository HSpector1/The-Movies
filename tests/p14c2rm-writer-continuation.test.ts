// Independent 880-B: preserve already-lawful retirement writing obligations.
// This is a bounded live-validation correction, not new work admission or a
// historical reader amendment. Expected outcomes come from the reviewed contract.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract } from '../src/core/employment.js'
import { studioConstructionView } from '../src/core/placement.js'
import { availableDevelopmentCastingSlots } from '../src/core/scriptDevelopment.js'
import { studioCalendar } from '../src/core/studioCalendar.js'
import { tick } from '../src/core/tick.js'
import { convertV37ToV36, exportSave, importSave, makeSave, migrateToLive, stableStringify,
  validateSaveV36, validateSaveV37 } from '../src/core/save.js'
import type { GameState, RetirementRecordV36, ScriptProject } from '../src/core/types.js'
import { c2Fixture } from './helpers/p14c2a-fixtures.js'
import { addPerson, admitted, advanceTo, bytes, finishingWriter, owner } from './helpers/p14c2rm-fixtures.js'
import { announcedGapWriter, originalCommission, pooledFinishingWriter } from './helpers/p14c2rm-writer-fixtures.js'

function envelope(state: GameState, saveVersion = 37) {
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
    expect(validateSaveV37(envelope(reopened)).state).toBe(reopened)
    expect(stableStringify(reopened)).toBe(before)
    expect(stableStringify(f.finishing)).toBe(before)
  })

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
const invalidCases: InvalidCase[] = [
  { name: 'missing lifecycle record', corrupt: (state, id) => ({ ...state, careerLifecycle: { ...state.careerLifecycle,
    records: state.careerLifecycle.records.filter(row => row.personId !== id) } }) },
  { name: 'retired lifecycle cannot own active writing', corrupt: (state, id) => ({ ...state, careerLifecycle: { ...state.careerLifecycle,
    records: state.careerLifecycle.records.map(row => row.personId === id ? { ...row, status: 'retired', retiredWeek: state.market.tick } : row) } }) },
  { name: 'another person’s lifecycle record is not authority', corrupt: (state, id) => ({ ...state, careerLifecycle: { ...state.careerLifecycle,
    records: state.careerLifecycle.records.map(row => row.personId === id ? { ...row, personId: state.talent.find(t => t.role === 'writer' && t.id !== id)!.id } : row) } }) },
  { name: 'wrong historical employer studio', corrupt: (state, id) => ({ ...state, hollywood: { ...state.hollywood!,
    employment: state.hollywood!.employment.map(row => row.terms.talentId === id && row.terms.endWeekExclusive === 312
      ? { ...row, studioId: state.hollywood!.businesses[0]!.studioId } : row) } }) },
  { name: 'historical employment did not cover commissioning', corrupt: (state, id) => ({ ...state, hollywood: { ...state.hollywood!,
    employment: state.hollywood!.employment.map(row => row.terms.talentId === id && row.terms.endWeekExclusive === 312
      ? { ...row, terms: { ...row.terms, startWeek: 312 } } : row) } }) },
  { name: 'missing historical employment', corrupt: (state, id) => ({ ...state, hollywood: { ...state.hollywood!,
    employment: state.hollywood!.employment.filter(row => row.terms.talentId !== id) } }) },
  { name: 'new work begins at E', corrupt: (state, id) => changeProject(state, id, { commissionedWeek: 312 }) },
  { name: 'future commission week', corrupt: (state, id) => changeProject(state, id, { commissionedWeek: 313 }) },
  { name: 'due week is no longer in the future', corrupt: (state, id) => changeProject(state, id, { dueWeek: 312 }) },
  { name: 'due week exceeds the ordinary draft bound', corrupt: (state, id) => changeProject(state, id, { dueWeek: 318 }) },
  { name: 'unknown writer membership', corrupt: (state, id) => changeProject(state, id, { writerIds: [id, 'missing-writer'] }) },
  { name: 'uncontracted second writer without retirement authority', corrupt: (state, id) => changeProject(state, id, {
    writerIds: [id, anotherUncontractedWriter(state, id)],
  }) },
  { name: 'duplicate writer membership', corrupt: (state, id) => changeProject(state, id, { writerIds: [id, id] }) },
  { name: 'attributed writer is missing from membership', corrupt: (state, id) => changeProject(state, id, { writerIds: [] }) },
  { name: 'reservation belongs to another project', corrupt: (state, id) => changeProject(state, id, {
    reservation: { ...writeProject(state, id).reservation!, projectId: 'script-9999' },
  }) },
  { name: 'reservation slot is outside capacity', corrupt: (state, id) => changeProject(state, id, {
    reservation: { ...writeProject(state, id).reservation!, slot: 999 },
  }) },
  { name: 'unknown concept reference', corrupt: (state, id) => changeProject(state, id, { conceptId: 'missing-concept' }) },
  { name: 'duplicate active project cannot borrow the same writer or slot', corrupt: (state, id) => ({ ...state,
    scriptDevelopment: { ...state.scriptDevelopment, projects: [...state.scriptDevelopment.projects, { ...writeProject(state, id), id: 'script-0001' }] },
  }) },
]

describe('880-B live allowance stays narrowly scoped', () => {
  it.each(invalidCases)('refuses $name without altering caller bytes', ({ corrupt }) => {
    const f = finishingWriter(), state = corrupt(f.finishing, f.writerId), input = envelope(state), before = stableStringify(input)
    expect(() => validateSaveV37(input)).toThrow()
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
    expect(() => validateSaveV37(envelope(illegal))).toThrow()
    expect(() => applyActions(terminated, [originalCommission(f.writerId)])).toThrow()
  })

  it('still refuses extra project/save keys at the exact public schema boundary', () => {
    const f = finishingWriter()
    const input = envelope({ ...f.finishing, scriptDevelopment: { ...f.finishing.scriptDevelopment,
      projects: f.finishing.scriptDevelopment.projects.map(row => ({ ...row, retirementBypass: true })),
    } })
    expect(() => validateSaveV37(input)).toThrow()
    expect(() => validateSaveV37({ ...envelope(f.finishing), retirementBypass: true })).toThrow()
  })

  it('frozen public V36 stays strict, and an exceptional current save cannot silently downgrade', () => {
    const f = finishingWriter()
    expect(f.commissioned.careerLifecycle.records.every(row => row.profession !== 'scientist'), 'frozen-reader control has no unsupported Scientist record').toBe(true)
    expect(() => validateSaveV36(envelope(f.commissioned, 36))).not.toThrow()
    expect(() => validateSaveV36(envelope(f.finishing, 36))).toThrow(/not contracted/i)
    const current = makeSave(f.finishing), before = stableStringify(current)
    expect(() => convertV37ToV36(current)).toThrow()
    expect(stableStringify(current)).toBe(before)
  })

  it('genuine older migration preserves existing screenplay, employment and work facts', () => {
    const old = c2Fixture('genuine-v33-c2-contract-and-case'), before = stableStringify(old)
    const live = migrateToLive(importSave(stableStringify(envelope(old, 33)))).state
    expect(live.scriptDevelopment).toEqual(old.scriptDevelopment)
    expect(live.contracts).toEqual(old.contracts)
    expect(live.hollywood).toEqual(old.hollywood)
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
      expect(() => validateSaveV37(legal)).not.toThrow()
      expect(() => validateSaveV37(illegal)).toThrow()
      expect(() => validateSaveV36(envelope(f.finishing, 36))).toThrow()
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
const invalidTemporalAuthority: InvalidCase[] = [
  { name: 'non-finite effective week', corrupt: (state, id) => changeRetirement(state, id, { effectiveWeek: Number.NaN }) },
  { name: 'fractional effective/finishing week', corrupt: (state, id) => changeRetirement(state, id, {
    effectiveWeek: 312.5, finishingFromWeek: 312.5,
  }) },
  { name: 'announced status at the effective week', corrupt: (state, id) => changeRetirement(state, id, {
    status: 'announced', finishingFromWeek: null,
  }) },
  { name: 'finishing date differs from the effective week', corrupt: (state, id) => changeRetirement(state, id, { finishingFromWeek: 311 }) },
  { name: 'announcement lies in the future', corrupt: (state, id) => changeRetirement(state, id, { announcedWeek: 313 }) },
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
    it.each(invalidTemporalAuthority)(`${caller.name} refuses $name`, ({ corrupt }) => {
      const f = temporalInput()
      // The unmodified real state and this same live entrypoint are admissible.
      expect(() => caller.run(f.state, f.youngId)).not.toThrow()
      const invalid = corrupt(f.state, f.retiringId), before = structuredClone(invalid)
      expect(() => validateSaveV37(envelope(invalid)), 'existing full-save refusal is a control').toThrow()
      expect(() => caller.run(invalid, f.youngId), 'live permission must also reject malformed authority').toThrow()
      // Compare in memory so NaN and signed zero are not hidden by JSON encoding.
      expect(invalid).toEqual(before)
    })
  }
})
