// UNREVIEWED/UNRUN. Exactly one public tick in this process; no factory/continuation.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { it } from 'vitest'
import { tick } from '../src/core/tick.js'
import { exportSave, importSave, makeSave } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { assertRetainedIdentity } from './retention.mjs'

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex')
const target = 'studio-5a47d054-r04'
const seed = 'p13-public-commercial-adoption'
const cap = 16 * 1024 * 1024
const json = (v: unknown) => JSON.stringify(v)
function representation(state: GameState) {
  const h = state.hollywood!
  assert.ok(h)
  assert.equal(h.receipts.some(r => (r.kind as string) === 'facilityDisposed'), false)
  for (const b of h.businesses) {
    assert.deepEqual(Object.keys(b.costCutting), ['version', 'since'])
    assert.equal(b.costCutting.version, 1)
    if (b.costCutting.since !== null) {
      assert.ok(Number.isInteger(b.costCutting.since) && b.costCutting.since <= state.market.tick)
      assert.equal(b.productions.length, 0)
      assert.equal(b.runs.length, 0)
    }
    for (const period of b.account.periods) {
      assert.equal(Object.is(period.movements.facilityDemolitionRefund, 0), true)
      // The unchanged ordinary save validator additionally checks payroll,
      // termination receipt amounts and complete finance conservation.
    }
  }
}
function occurrences(rows: any[]) {
  const counts = new Map<string, number>()
  return rows.map((row, ordinal) => {
    assert.equal(typeof row.contractId, 'string')
    const occurrence = counts.get(row.contractId) ?? 0
    counts.set(row.contractId, occurrence + 1)
    return { identity: [row.contractId, occurrence], ordinal, row }
  })
}
function differencePaths(a: any, b: any, path = '$', result: string[] = []): string[] {
  if (Object.is(a, b)) return result
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') {
    result.push(path); return result
  }
  if (Array.isArray(a) !== Array.isArray(b)) { result.push(path); return result }
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]
  for (const key of keys) {
    const child = Array.isArray(a) ? `${path}[${key}]` : `${path}.${key}`
    if (!Object.hasOwn(a, key) || !Object.hasOwn(b, key)) result.push(child)
    else differencePaths(a[key], b[key], child, result)
    assert.ok(result.length <= 100_000, 'bounded complete field difference list')
  }
  if (Array.isArray(a) && a.length !== b.length) result.push(`${path}.length`)
  return result
}
function emit(path: string, value: unknown) {
  const bytes = json(value) + '\n'
  assert.ok(Buffer.byteLength(bytes) <= cap)
  writeFileSync(path, bytes, { flag: 'wx' })
}

it('one genuine Save46 boundary307 to308, ordinary or r04 release-only arm', () => {
  const arm = process.env.B_RELEASE_ARM
  assert.ok(arm === 'EBG' || arm === 'EBG_R04_RELEASE_OFF')
  const inputRaw = readFileSync(process.env.B_RELEASE_INPUT!)
  const expectedRaw = readFileSync(process.env.B_RELEASE_EXPECTED!)
  assert.equal(inputRaw.length, 4221574)
  assert.equal(sha(inputRaw), 'ade139db3bffd24918a12fbc24c7df31f4a0fc74e9c689ed0403101f2f455c6e')
  assert.equal(expectedRaw.length, 4228063)
  assert.equal(sha(expectedRaw), '9343625f2cd72964727f7d0b6679d89c0c85ba855208554af13a239d78bb968a')
  const row = JSON.parse(inputRaw.toString('utf8'))
  const expected = JSON.parse(expectedRaw.toString('utf8'))
  assert.equal(row.boundary, 307); assert.equal(row.week, 307)
  assert.equal(expected.boundary, 308); assert.equal(expected.week, 308)
  assert.equal(row.role, 'EBG'); assert.equal(expected.role, 'EBG')
  assert.equal(row.seed, seed); assert.equal(expected.seed, seed)
  assert.equal(row.save.saveVersion, 46); assert.equal(expected.save.saveVersion, 46)
  const original = json(row.originalState)
  assert.equal(sha(original), row.originalStateSha256)
  assert.equal(json(row.save.state), original)
  assert.equal(sha(json(expected.originalState)), expected.originalStateSha256)
  assert.equal(json(expected.save.state), json(expected.originalState))
  assert.equal(sha(exportSave(expected.save)), expected.serializedSaveSha256)
  const exported = exportSave(row.save)
  assert.equal(sha(exported), row.serializedSaveSha256)
  const admitted = importSave(exported)
  assert.equal(exportSave(admitted), exported)
  assert.deepEqual(admitted.state, row.originalState)
  assert.equal(json(row.originalState), original, 'admission is pure')
  // Ticks start from exact authenticated captured ordering AFTER genuine ordinary
  // admission/value equality, not from sorted import bytes. JSON capture law has
  // no undefined/non-JSON values; no source-era state field is invented/dropped.
  const state = JSON.parse(original) as GameState
  assert.equal(json(state), original)
  assert.equal(sha(json(state)), row.originalStateSha256)
  assert.equal(state.seed, seed); assert.equal(state.market.tick, 307)
  representation(state)
  const before = state.hollywood!
  const b = before.businesses.find(x => x.studioId === target)!
  assert.ok(b); assert.equal(b.costCutting.since, 306)
  assert.equal(b.nextDecisionWeek, 307)
  assert.equal(b.account.cash, 4233382.340766562)
  const selected = occurrences(before.employment).filter(x => x.ordinal >= 42 && x.ordinal <= 47)
  assert.equal(selected.length, 6)
  for (const entry of selected) {
    assert.equal(entry.row.studioId, target); assert.equal(entry.row.endedWeek, null)
    assert.equal(entry.row.terms.endWeekExclusive, 416)
    assert.ok(before.activeEmploymentOrdinals.includes(entry.ordinal))
  }
  const next = tick(state) // The sole tick call in this observer.
  assert.equal(json(state), original, 'tick caller refusal purity')
  assert.equal(next.market.tick, 308)
  representation(next)
  assert.deepEqual(next.talentMarket.receipts.slice(0, state.talentMarket.receipts.length), state.talentMarket.receipts)
  assert.deepEqual(next.hollywood!.receipts.slice(0, before.receipts.length), before.receipts)
  const saved = makeSave(next)
  const admittedOutput = importSave(exportSave(saved))
  assert.deepEqual(admittedOutput.state, next)
  assert.equal(json(saved.state), json(next))
  const after = next.hollywood!
  const afterBusiness = after.businesses.find(x => x.studioId === target)!
  const added = after.receipts.slice(before.receipts.length)
  const selectedIds = new Set(selected.map(x => x.row.contractId))
  const terminations = added.filter(r => r.kind === 'employment' && r.reason === 'termination' && selectedIds.has(r.contractId))
  const totalTermination = (business: typeof b) => business.account.periods.reduce((n, p) => n + p.movements.termination, 0)
  const output = { arm, seed, inputStateSha256: row.originalStateSha256,
    stateSha256: sha(json(next)), state: next, save: saved,
    serializedSaveSha256: sha(exportSave(saved)), rng: next.rngState,
    employment: occurrences(after.employment), addedIndustryReceipts: added,
    selectedContracts: selected.map(x => x.identity), selectedTerminations: terminations,
    terminationMovementDelta: totalTermination(afterBusiness) - totalTermination(b),
    cashDelta: afterBusiness.account.cash - b.account.cash,
    admission: 'ordinary importSave(exportSave), input/output semantic equality',
    conservation: 'unchanged ordinary Save46 full validator',
    inputOrdering: 'authenticated captured state after genuine admission proof' }
  if (arm === 'EBG') {
    assert.equal(json(next), json(expected.originalState), 'STOP_BASELINE_EXACT_STATE')
    assert.equal(output.stateSha256, expected.originalStateSha256)
    assert.equal(next.rngState, expected.rng)
    assert.equal(terminations.length, 6)
    assert.deepEqual(terminations.map(r => r.eventId), ['industry-event-419','industry-event-420','industry-event-421','industry-event-422','industry-event-423','industry-event-424'])
    for (const entry of selected) assert.equal(after.employment[entry.ordinal]!.endedWeek, 307)
    assert.ok(output.terminationMovementDelta < 0)
  } else {
    const baseline = JSON.parse(readFileSync(process.env.B_RELEASE_BASELINE!, 'utf8'))
    assert.equal(baseline.arm, 'EBG'); assert.equal(baseline.stateSha256, expected.originalStateSha256)
    assert.equal(json(baseline.state), json(expected.originalState))
    assert.equal(next.rngState, baseline.rng)
    assert.deepEqual(next.firstTakes, baseline.state.firstTakes)
    assert.deepEqual(after.businesses.map(x => [x.studioId, x.costCutting]), baseline.state.hollywood.businesses.map((x: any) => [x.studioId, x.costCutting]))
    for (const entry of selected) {
      assertRetainedIdentity(entry, after.employment)
      assert.equal(after.employment[entry.ordinal]!.endedWeek, null)
      assert.ok(after.activeEmploymentOrdinals.includes(entry.ordinal))
      assert.deepEqual(after.employment[entry.ordinal]!.terms, entry.row.terms)
    }
    assert.equal(terminations.length, 0); assert.equal(output.terminationMovementDelta, 0)
    const left = occurrences(baseline.state.hollywood.employment)
    const right = occurrences(after.employment)
    const rightByIdentity = new Map(right.map(x => [json(x.identity), x]))
    const matched = left.map(x => ({ identity: x.identity, baselineOrdinal: x.ordinal,
      intervention: rightByIdentity.get(json(x.identity)) ?? null,
      baselineRow: x.row }))
    const leftIds = new Set(left.map(x => json(x.identity)))
    emit(process.env.B_RELEASE_COMPARISON!, { status: 'ONE_TICK_DIAGNOSTIC_CANDIDATE',
      firstDifferingField: differencePaths(baseline.state, next)[0] ?? null,
      completeDifferentPaths: differencePaths(baseline.state, next), employmentMatched: matched,
      employmentOnlyIntervention: right.filter(x => !leftIds.has(json(x.identity))),
      baselineStateSha256: baseline.stateSha256, interventionStateSha256: output.stateSha256,
      baselineTerminationDelta: baseline.terminationMovementDelta,
      interventionTerminationDelta: output.terminationMovementDelta,
      baselineCashDelta: baseline.cashDelta, interventionCashDelta: output.cashDelta,
      internalReleasePredicates: 'UNOBSERVED', followOn109Weeks: 'NOT_RUN_NOT_IMPLEMENTED' })
  }
  emit(process.env.B_RELEASE_OUTPUT!, output)
}, 60_000)
