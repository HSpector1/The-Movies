import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { closeSync, createReadStream, openSync, readFileSync, writeSync, writeFileSync } from 'node:fs'
import { createGunzip, gzipSync } from 'node:zlib'
import { expect, it } from 'vitest'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { exportSave, importSave, makeSave, stableStringify } from '../src/core/save.js'
import type { SaveFile } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'

const hash = (text: string): string => createHash('sha256').update(text).digest('hex')
const rawLimit = 2 * 1024 * 1024 * 1024
const compressedLimit = 1024 * 1024 * 1024
const rowLimit = 16 * 1024 * 1024
const seedList = ['p13a-core-causal-01', 'p13-public-commercial-adoption'] as const

type EmptyProof = { businesses: number; periods: number; cuttingNull: number; positiveZeroRefund: number }
function proveRepresentation(state: GameState, role: 'AG' | 'E0G'): EmptyProof {
  const businesses = state.hollywood?.businesses ?? []
  let periods = 0, cuttingNull = 0, positiveZeroRefund = 0
  for (const business of businesses) {
    const b = business as unknown as Record<string, unknown>
    if (role === 'E0G') {
      assert.ok(Object.hasOwn(b, 'costCutting'))
      const c = b.costCutting as Record<string, unknown>
      assert.ok(c && typeof c === 'object' && !Array.isArray(c))
      assert.deepEqual(Object.keys(c), ['version', 'since'])
      assert.equal(c.version, 1); assert.equal(c.since, null); cuttingNull++
    } else assert.equal(Object.hasOwn(b, 'costCutting'), false)
    for (const period of business.account.periods) {
      periods++
      const movements = period.movements as unknown as Record<string, unknown>
      if (role === 'E0G') {
        assert.ok(Object.hasOwn(movements, 'facilityDemolitionRefund'))
        assert.equal(Object.is(movements.facilityDemolitionRefund, 0), true)
        positiveZeroRefund++
      } else assert.equal(Object.hasOwn(movements, 'facilityDemolitionRefund'), false)
    }
  }
  assert.equal(state.hollywood?.receipts.some(r => (r.kind as string) === 'facilityDisposed'), false)
  return { businesses: businesses.length, periods, cuttingNull, positiveZeroRefund }
}
function ownerView(state: GameState): unknown {
  return state.hollywood?.businesses.map(b => ({ studioId: b.studioId, cash: b.account.cash,
    account: b.account, costCutting: (b as unknown as { costCutting?: unknown }).costCutting ?? null,
    productions: b.productions, runs: b.runs, activeScriptOrdinals: b.activeScriptOrdinals,
    nextDecisionWeek: b.nextDecisionWeek })) ?? null
}

it('AG/E0G fresh full-state neutrality capture, 416 natural weeks', () => {
  const role = process.env.NEUTRALITY_ARM
  const seed = process.env.NEUTRALITY_SEED
  const output = process.env.NEUTRALITY_BOUNDARIES
  const summary = process.env.NEUTRALITY_SUMMARY
  const progress = process.env.NEUTRALITY_PROGRESS
  assert.ok(role === 'AG' || role === 'E0G')
  assert.ok(seed === seedList[0] || seed === seedList[1])
  assert.ok(output && summary && progress)
  const version = role === 'AG' ? 45 : 46
  const fd = openSync(output, 'wx')
  const pf = openSync(progress, 'wx')
  let bytes = 0, compressedBytes = 0, captures = 0, progressRows = 0
  const compressedDigest = createHash('sha256')
  const digest = createHash('sha256')
  const started = process.hrtime.bigint()
  let state = p13aGeneratedStudio(seed)
  let uninstrumented = p13aGeneratedStudio(seed)
  for (let probeWeek = 0; probeWeek < 8; probeWeek++) uninstrumented = tick(uninstrumented)
  const capture = (boundary: number): void => {
    const original = JSON.stringify(state)
    const rng = JSON.stringify(state.rngState)
    const proof = proveRepresentation(state, role)
    const saved = makeSave(state)
    expect(JSON.stringify(saved.state)).toBe(original)
    expect(saved.saveVersion).toBe(version)
    const exported = exportSave(saved)
    const admitted = importSave(exported)
    expect(stableStringify(admitted)).toBe(exported)
    expect(JSON.stringify(state)).toBe(original)
    expect(JSON.stringify(state.rngState)).toBe(rng)
    const row = JSON.stringify({ boundary, week: state.market.tick, role, seed,
      originalStateSha256: hash(original), originalState: state, save: saved,
      serializedSaveSha256: hash(exported), owner: ownerView(state), emptyProof: proof,
      rng: state.rngState, marketReceiptCount: state.talentMarket.receipts.length,
      industryReceiptCount: state.hollywood?.receipts.length ?? 0 }) + '\n'
    const len = Buffer.byteLength(row)
    assert.ok(len <= rowLimit, 'single boundary exceeds 16 MiB')
    assert.ok(bytes + len <= rawLimit, 'complete raw captures exceed 2 GiB')
    const member = gzipSync(Buffer.from(row), { level: 6 })
    assert.ok(compressedBytes + member.length <= compressedLimit, 'lossless gzip capture exceeds 1 GiB on disk')
    let offset = 0
    while (offset < member.length) {
      const written = writeSync(fd, member, offset, member.length - offset)
      assert.ok(written > 0, 'gzip member write made no progress')
      offset += written
    }
    digest.update(row); compressedDigest.update(member)
    bytes += len; compressedBytes += member.length; captures++
  }
  try {
    capture(0)
    for (let i = 1; i <= 416; i++) {
      const original = JSON.stringify(state)
      const beforeMarket = state.talentMarket.receipts
      const beforeIndustry = state.hollywood?.receipts ?? []
      const next = tick(state)
      assert.equal(JSON.stringify(state), original, 'tick mutated caller state')
      assert.equal(next.market.tick, i)
      assert.deepEqual(next.talentMarket.receipts.slice(0, beforeMarket.length), beforeMarket)
      assert.deepEqual((next.hollywood?.receipts ?? []).slice(0, beforeIndustry.length), beforeIndustry)
      state = next; capture(i)
      if (i === 8) assert.equal(JSON.stringify(state), JSON.stringify(uninstrumented), 'read-only eight-week observer probe')
      if (i % 52 === 0) {
        progressRows++
        writeSync(pf, JSON.stringify({ week: i, elapsedSeconds: Number(process.hrtime.bigint() - started) / 1e9 }) + '\n')
      }
    }
    assert.equal(captures, 417); assert.equal(progressRows, 8)
    const h = state.hollywood
    assert.ok(h)
    const result = { schema: '1370-ag-e0g-full-state-leaf-r12-gzip-verified', role, seed, version, ticks: 416,
      boundaries: captures, progressRows, observerProbeWeeks: 8, observerProbePassed: true, boundaryBytes: bytes, boundarySha256: digest.digest('hex'),
      boundaryCompressedBytes: compressedBytes, boundaryCompressedSha256: compressedDigest.digest('hex'),
      boundaryEncoding: 'gzip-concatenated-members-one-per-boundary',
      terminal: { marketReceiptRows: state.talentMarket.receipts.length,
        industryReceiptRows: h.receipts.length, employmentRows: h.employment.length,
        firstTakeRows: state.firstTakes.length, rng: state.rngState,
        settlement: hash(JSON.stringify(state.talentMarket.receipts.filter(r => ['settled','declined','expired'].includes(r.kind)).map(r => [r.eventId,r.kind,r.week,r.talentId,r.studioId,r.reasons,r.dropped]))),
        receipts: hash(JSON.stringify(state.talentMarket.receipts)),
        employment: hash(JSON.stringify(h.employment)), takes: hash(JSON.stringify(state.firstTakes)) } }
    writeFileSync(summary, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
  } finally { closeSync(fd); closeSync(pf) }
}, 750_000)

// A second, source-bound test rereads the stored JSON through the pinned JS runtime.
// It checks JavaScript's own serialization and the actual Save export API.
it('AG/E0G stored full-state readback', async () => {
  const output = process.env.NEUTRALITY_BOUNDARIES
  const summaryPath = process.env.NEUTRALITY_SUMMARY
  const auditPath = process.env.NEUTRALITY_AUDIT
  const role = process.env.NEUTRALITY_ARM
  const seed = process.env.NEUTRALITY_SEED
  assert.ok(output && summaryPath && auditPath)
  assert.ok(role === 'AG' || role === 'E0G')
  assert.ok(seed === seedList[0] || seed === seedList[1])
  const summary = JSON.parse(readFileSync(summaryPath, 'utf8')) as Record<string, unknown>
  const digest = createHash('sha256')
  let fragments: Buffer[] = [], pendingBytes = 0, bytes = 0, count = 0
  let lastState: GameState | null = null
  const source = createReadStream(output)
  const stream = source.pipe(createGunzip())
  for await (const chunk of stream) {
    let remaining = chunk as Buffer
    while (remaining.length > 0) {
      const end = remaining.indexOf(10)
      if (end < 0) {
        fragments.push(remaining); pendingBytes += remaining.length
        assert.ok(pendingBytes <= rowLimit, 'unterminated readback row exceeds limit')
        break
      }
      const part = remaining.subarray(0, end + 1)
      fragments.push(part); pendingBytes += part.length
      assert.ok(pendingBytes <= rowLimit, 'readback row exceeds limit')
      const line = Buffer.concat(fragments, pendingBytes)
      fragments = []; pendingBytes = 0
      remaining = remaining.subarray(end + 1)
      digest.update(line); bytes += line.length
      const row = JSON.parse(line.toString('utf8')) as Record<string, unknown>
      assert.equal(row.boundary, count); assert.equal(row.week, count)
      assert.equal(row.role, role); assert.equal(row.seed, seed)
      const state = row.originalState as GameState
      lastState = state
      const save = row.save as SaveFile
      assert.ok(state && typeof state === 'object' && save && typeof save === 'object')
      const stateJson = JSON.stringify(state)
      assert.equal(row.originalStateSha256, hash(stateJson))
      assert.equal(JSON.stringify(save.state), stateJson)
      assert.equal(save.saveVersion, role === 'AG' ? 45 : 46)
      assert.equal(row.serializedSaveSha256, hash(exportSave(save)))
      assert.deepEqual(row.owner, JSON.parse(JSON.stringify(ownerView(state))))
      assert.deepEqual(row.emptyProof, proveRepresentation(state, role))
      assert.deepEqual(row.rng, state.rngState)
      assert.equal(row.marketReceiptCount, state.talentMarket.receipts.length)
      assert.equal(row.industryReceiptCount, state.hollywood?.receipts.length ?? 0)
      count++
      assert.ok(count <= 417 && bytes <= rawLimit)
    }
  }
  assert.equal(pendingBytes, 0, 'readback trailing incomplete row')
  assert.equal(count, 417)
  assert.equal(bytes, summary.boundaryBytes)
  assert.equal(digest.digest('hex'), summary.boundarySha256)
  assert.ok(lastState && lastState.hollywood)
  const terminal = summary.terminal as Record<string, unknown>
  const h = lastState.hollywood
  const receipts = lastState.talentMarket.receipts
  assert.equal(terminal.marketReceiptRows, receipts.length)
  assert.equal(terminal.industryReceiptRows, h.receipts.length)
  assert.equal(terminal.employmentRows, h.employment.length)
  assert.equal(terminal.firstTakeRows, lastState.firstTakes.length)
  assert.deepEqual(terminal.rng, lastState.rngState)
  assert.equal(terminal.receipts, hash(JSON.stringify(receipts)))
  assert.equal(terminal.employment, hash(JSON.stringify(h.employment)))
  assert.equal(terminal.takes, hash(JSON.stringify(lastState.firstTakes)))
  assert.equal(terminal.settlement, hash(JSON.stringify(receipts.filter(r =>
    ['settled','declined','expired'].includes(r.kind)).map(r =>
    [r.eventId,r.kind,r.week,r.talentId,r.studioId,r.reasons,r.dropped]))))
  writeFileSync(auditPath, JSON.stringify({ schema: '1370-ag-e0g-full-state-readback-r12',
    role, seed, rows: count, rawBytes: bytes, rawSha256: summary.boundarySha256,
    sourceRuntime: 'pinned Vitest Node plus source exportSave and representation proof' }) + '\n', { flag: 'wx' })
}, 750_000)
