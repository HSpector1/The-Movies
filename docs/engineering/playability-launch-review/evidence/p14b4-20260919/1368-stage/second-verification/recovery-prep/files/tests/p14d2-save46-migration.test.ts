// 1367-H combined B+C; capture prerequisite is real, separately minted Save45.
import { describe, expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import * as research from '../src/core/rivalResearch.js'
import type { GameState } from '../src/core/types.js'
import { recoveryPredecessor45 } from './helpers/1367-recovery-predecessors.js'
import { accepted45 } from './helpers/1368-recovery-witnesses.js'

type Envelope = { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown }
type RecoveryBusiness = { costCutting: { version: 1; since: number | null } }
type Era = {
  validateSaveV46(value: unknown): Envelope
  convertV45ToV46(value: unknown): Envelope
  convertV46ToV45(value: unknown): Envelope
  migrateToV46(value: unknown): Envelope
}
const bytes = save.stableStringify
const ZERO = 'p13a-week-0.save45.json.gz'
const HISTORY = 'p13a-week-53.save45.json.gz'
const lowerVersions = Array.from({ length: 42 }, (_, i) => i + 4) // every public migrateToV4 .. V45
const frozenVersions = Array.from({ length: 18 }, (_, i) => i + 1)
const sinceRefusal = 'migrateToV45: cannot downgrade or discard recovery authority: costCutting.since'
const allRefusal = sinceRefusal + ', facilityDemolitionRefund, facilityDisposed'
function api(): Era {
  const future = save as unknown as Era
  for (const name of ['validateSaveV46', 'convertV45ToV46', 'convertV46ToV45', 'migrateToV46'] as const)
    expect(typeof future[name], 'MISSING SAVE46 API: ' + name).toBe('function')
  return future
}
function entry(name: string): (value: unknown) => unknown {
  const fn = (save as unknown as Record<string, unknown>)[name]
  expect(typeof fn, 'named real save entry: ' + name).toBe('function')
  return fn as (value: unknown) => unknown
}
const cache = new Map<string, Envelope>()
function predecessor(name: typeof ZERO | typeof HISTORY): Envelope {
  if (!cache.has(name)) {
    const old = recoveryPredecessor45(name === ZERO ? 0 : 53) as unknown as Envelope
    expect(old.state.hollywood).not.toBeNull()
    for (const business of old.state.hollywood!.businesses) {
      expect(Object.hasOwn(business, 'costCutting')).toBe(false)
      for (const period of business.account.periods) expect(Object.hasOwn(period.movements, 'facilityDemolitionRefund')).toBe(false)
    }
    expect(old.state.hollywood!.receipts.some(r => (r.kind as string) === 'facilityDisposed')).toBe(false)
    cache.set(name, old)
  }
  return structuredClone(cache.get(name)!)
}
function admitted(value: Envelope): Envelope {
  expect(value.saveVersion).toBe(46)
  expect(api().validateSaveV46(value)).toBe(value)
  return value
}
function withSince(): Envelope {
  const old = predecessor(ZERO)
  const current = admitted(api().convertV45ToV46(old))
  const owner = current.state.hollywood!.businesses.find(b => b.productions.length === 0 && b.runs.length === 0
    && !current.state.talentMarket.proposals.some(p => p.issuerStudioId === b.studioId))
  expect(owner, 'UNMET VALID PREMISE: genuine week-zero idle owner').toBeDefined()
  const cutting = owner! as unknown as RecoveryBusiness
  expect(cutting.costCutting).toEqual({ version: 1, since: null })
  // Explicit synthetic policy-state control; not a claim of natural decision entry.
  cutting.costCutting.since = current.state.market.tick
  return admitted(current)
}
function observed(fn: () => unknown): { kind: 'value'; bytes: string } | { kind: 'error'; message: string } {
  try { return { kind: 'value', bytes: bytes(fn()) } }
  catch (error) { expect(error).toBeInstanceOf(Error); return { kind: 'error', message: (error as Error).message } }
}
function errorMessage(fn: () => unknown): string {
  const result = observed(fn)
  expect(result.kind, 'expected a refusal from an admitted baseline').toBe('error')
  return result.kind === 'error' ? result.message : ''
}

describe('1363 Save46 genuine predecessor migration and boundary law', () => {
  it.each([ZERO, HISTORY] as const)('adds only null/zero to %s, preserving all old facts, detached and idempotent', name => {
    const old = predecessor(name), before = bytes(old)
    if (name === HISTORY) expect(old.state.hollywood!.businesses.some(b => b.account.periods.length > 1),
      'UNMET VALID PREMISE: actual old multi-period finance').toBe(true)
    const current = admitted(api().convertV45ToV46(old))
    expect(current).not.toBe(old)
    expect(current.state).not.toBe(old.state)
    const projected = structuredClone(current)
    projected.saveVersion = 45
    for (const owner of projected.state.hollywood!.businesses) {
      expect((owner as unknown as RecoveryBusiness).costCutting).toEqual({ version: 1, since: null })
      Reflect.deleteProperty(owner, 'costCutting')
      for (const period of owner.account.periods) {
        expect((period.movements as unknown as Record<string, number>).facilityDemolitionRefund).toBe(0)
        Reflect.deleteProperty(period.movements, 'facilityDemolitionRefund')
      }
    }
    // Test-only exact inverse oracle, never used as an input to a historical reader.
    expect(bytes(projected)).toBe(before)
    expect(bytes(api().convertV46ToV45(current))).toBe(before)
    expect(bytes(api().migrateToV46(old))).toBe(bytes(current))
    expect(bytes(api().migrateToV46(current))).toBe(bytes(current))
    expect(bytes(entry('migrateToLive')(old))).toBe(bytes(current))
    expect(bytes(entry('migrateToLive')(current))).toBe(bytes(current))
    expect(bytes(old)).toBe(before)
    const first = current.state.hollywood!.businesses[0]!
    expect(first).not.toBe(old.state.hollywood!.businesses[0])
    const oldFirst = old.state.hollywood!.businesses[0]!
    expect(first.account).not.toBe(oldFirst.account)
    expect(first.account.periods).not.toBe(oldFirst.account.periods)
    expect(first.account.periods[0]).not.toBe(oldFirst.account.periods[0])
    expect(first.account.periods[0]!.movements).not.toBe(oldFirst.account.periods[0]!.movements)
    expect(current.state.hollywood!.receipts).not.toBe(old.state.hollywood!.receipts)
    expect(bytes(old)).toBe(before)
  })

  it('validates the predecessor before up-migration and the full current save before any authority refusal', () => {
    const old = predecessor(ZERO)
    const invalidOld = structuredClone(old)
    invalidOld.seed += '-envelope-mismatch'
    const oldRefusal = errorMessage(() => save.validateSaveV45(invalidOld))
    const before = bytes(invalidOld)
    expect(errorMessage(() => api().convertV45ToV46(invalidOld))).toBe(oldRefusal)
    expect(bytes(invalidOld)).toBe(before)
    const current = withSince()
    current.seed += '-envelope-mismatch'
    const currentRefusal = errorMessage(() => api().validateSaveV46(current))
    expect(currentRefusal).not.toBe(sinceRefusal)
    const currentBytes = bytes(current)
    expect(errorMessage(() => api().convertV46ToV45(current))).toBe(currentRefusal)
    expect(bytes(current)).toBe(currentBytes)
  })

  it.each(lowerVersions)('migrateToV%i handles empty recovery through exactly the existing predecessor law', version => {
    const old = predecessor(HISTORY), before = bytes(old)
    const fn = entry('migrateToV' + version)
    const control = observed(() => fn(structuredClone(old)))
    // An existing historical refusal is a valid parity result, not a claimed successful downgrade.
    const current = admitted(api().convertV45ToV46(old)), currentBytes = bytes(current)
    expect(observed(() => fn(current))).toEqual(control)
    expect(bytes(current)).toBe(currentBytes)
    expect(bytes(old)).toBe(before)
  })

  it.each(lowerVersions)('migrateToV%i refuses real since before any older-era authority can mask it', version => {
    const current = withSince(), before = bytes(current)
    expect(errorMessage(() => entry('migrateToV' + version)(current))).toBe(sinceRefusal)
    expect(bytes(current)).toBe(before)
  })

  it.each(frozenVersions)('makeSaveV%i preserves predecessor outcome when recovery is empty, names nonempty recovery', version => {
    const fn = entry('makeSaveV' + version), old = predecessor(ZERO)
    const control = observed(() => fn(structuredClone(old.state)))
    const empty = admitted(api().convertV45ToV46(old)), emptyBytes = bytes(empty)
    expect(observed(() => fn(empty.state))).toEqual(control)
    expect(bytes(empty)).toBe(emptyBytes)
    const full = withSince(), before = bytes(full)
    expect(errorMessage(() => fn(full.state))).toBe(
      `makeSaveV${version}: cannot downgrade or discard recovery authority: costCutting.since`)
    expect(bytes(full)).toBe(before)
  })

  it.each([45, 44, 43, 42, 41])('public V%i keeps its own business and money key law', version => {
    const old = predecessor(ZERO)
    const own = entry('migrateToV' + version)(old) as Envelope
    const validate = entry('validateSaveV' + version)
    expect(validate(own)).toBe(own) // valid own-era control FIRST
    const baseline = bytes(own)
    for (const kind of ['cuttingKey', 'refundKey'] as const) {
      const mutant = structuredClone(own)
      const owner = mutant.state.hollywood!.businesses[0]!
      if (kind === 'cuttingKey') Object.assign(owner, { costCutting: { version: 1, since: null } })
      else Object.assign(owner.account.periods[0]!.movements, { facilityDemolitionRefund: 0 })
      const mutantBytes = bytes(mutant)
      const refusal = errorMessage(() => validate(mutant))
      // Public old readers preserve the frozen-owner wrappers. Pin the complete
      // expected refusal, including this era's exact owned key roster.
      const wrappers = 'validateSaveV37: state is invalid — '
        + 'validateSaveV36: frozen V35 state is invalid — '
        + 'validateSaveV35: frozen V34 state is invalid — '
        + 'validateSaveV34: frozen V33 state is invalid — '
        + 'validateSaveV33: frozen V32 state is invalid — '
        + 'validateSaveV32: frozen V31 state is invalid — '
        + 'validateSaveV31: frozen V30 state is invalid — '
        + 'validateSaveV30: frozen V28 state is invalid — '
        + 'validateSaveV28: frozen V27 state is invalid — '
        + 'validateSaveV27: frozen V26 state is invalid — '
        + 'validateSaveV26: frozen V25 state is invalid — '
        + 'validateSaveV25: frozen V24 state is invalid — '
      const businessKeys = 'studioId,entryKey,account,standing,operations,development,productions,'
        + 'activeScriptOrdinals,activeRunFilmOrdinals,releaseAuthority,runs,projects,nextDecisionWeek,policy'
        + (version >= 43 ? ',screenplayShelving' : '')
      const moneyKeys = 'capacity,signing,payroll,overhead,facilityOpex,development,production,marketing,'
        + 'studioRevenue,technologyAdoption,researchSpend,researchCapacity,technologyRestoration,technologyRefund,termination'
      expect(refusal).toBe(wrappers + 'Hollywood save: exact keys required: '
        + (kind === 'cuttingKey' ? businessKeys : moneyKeys))
      expect(refusal).not.toContain(kind === 'cuttingKey' ? 'costCutting' : 'facilityDemolitionRefund')
      expect(bytes(mutant)).toBe(mutantBytes)
    }
    expect(bytes(own)).toBe(baseline)
  })

  it('a real disposal names every inseparable authority rather than hiding refund/tombstone behind since', () => {
    const future = research as unknown as {
      rivalFacilityDisposalEligibility(s: GameState, studioId: string, facilityId: string): { eligible: boolean }
      disposeRivalFacility(s: GameState, studioId: string, facilityId: string): GameState
    }
    expect(typeof future.rivalFacilityDisposalEligibility).toBe('function')
    expect(typeof future.disposeRivalFacility).toBe('function')
    // Original week53 null/zero/history tests above remain unchanged.
    // This distinct positive disposal witness has separately accepted genuine45 provenance.
    const witness = accepted45('ordinary')
    const initial = admitted(witness.live as unknown as Envelope)
    let selected: { envelope: Envelope; studioId: string; facilityId: string } | undefined
    for (const original of initial.state.hollywood!.businesses) {
      if (original.studioId !== witness.row.studioId) continue
      if (original.productions.length || original.runs.length
        || initial.state.talentMarket.proposals.some(p => p.issuerStudioId === original.studioId)) continue
      for (const facility of original.operations.facilities.filter(f => f.capability === 'laboratory' && f.id === witness.row.facilityId)) {
        const candidate = structuredClone(initial)
        const owner = candidate.state.hollywood!.businesses.find(b => b.studioId === original.studioId)!
        expect((owner as unknown as RecoveryBusiness).costCutting.since).toBeNull()
        ;(owner as unknown as RecoveryBusiness).costCutting.since = candidate.state.market.tick
        admitted(candidate) // synthetic cutting control must be valid before invoking the real producer
        if (future.rivalFacilityDisposalEligibility(candidate.state, owner.studioId, facility.id).eligible) {
          selected = { envelope: candidate, studioId: owner.studioId, facilityId: facility.id }; break
        }
      }
      if (selected) break
    }
    expect(selected, 'UNMET ACCEPTED WITNESS: named original45 idle body must satisfy the unchanged disposal premise').toBeDefined()
    const { envelope, studioId, facilityId } = selected!
    const before = bytes(envelope)
    const result = future.disposeRivalFacility(envelope.state, studioId, facilityId)
    const disposed = admitted(save.makeSave(result) as unknown as Envelope)
    expect(bytes(envelope)).toBe(before)
    const receipts = disposed.state.hollywood!.receipts.filter(r => (r.kind as string) === 'facilityDisposed')
    expect(receipts).toHaveLength(1)
    const owner = disposed.state.hollywood!.businesses.find(b => b.studioId === studioId)!
    expect(owner.operations.facilities.some(f => f.id === facilityId)).toBe(false)
    expect(owner.account.periods.reduce((sum, p) => sum +
      (p.movements as unknown as Record<string, number>).facilityDemolitionRefund!, 0)).toBeGreaterThan(0)
    const immutable = bytes(disposed)
    expect(errorMessage(() => api().convertV46ToV45(disposed))).toBe(allRefusal)
    for (const version of lowerVersions) expect(errorMessage(() => entry('migrateToV' + version)(disposed))).toBe(allRefusal)
    for (const version of frozenVersions) expect(errorMessage(() => entry('makeSaveV' + version)(disposed.state))).toBe(
      `makeSaveV${version}: cannot downgrade or discard recovery authority: costCutting.since, facilityDemolitionRefund, facilityDisposed`)
    expect(bytes(disposed)).toBe(immutable)
  }, 120_000)
})
