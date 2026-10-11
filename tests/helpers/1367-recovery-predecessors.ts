// Accepted 1367-M captures, copied byte-for-byte at the repository paths below.
// Literal pins come from preserved independent mint reviews, never live reconstruction.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { exportSave, importSave, stableStringify, validateSaveV26, validateSaveV45 } from '../../src/core/save.js'

const ROOT45 = new URL('../fixtures/p14/genuine-v45-recovery-predecessors-1363/', import.meta.url)
const ROOT26 = new URL('../fixtures/p13b/genuine-v26-old-era-period-1363/', import.meta.url)
const HEAD = '689a69f314a61a71c2ee4fc813fb4f16c7245ec1'
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const PINS45 = {
  0: { name: 'p13a-week-0.save45.json.gz', week: 0, gzipBytes: 48875, rawBytes: 402008,
    gzipSha256: '4bded8663feb1cd20d7425405d7daf4864a3f3b5a840e9deaf86b09ce45bb8ae',
    rawSha256: 'eb0aa9897e964ec56ffe287d2dba7853c953689f50d7348aaadc9330348e4f7b',
    stateSha256: 'ee4f81b834c726f0dc0166786ecd2cdc95ffa98856db238a1b41bf59dabc38e0' },
  53: { name: 'p13a-week-53.save45.json.gz', week: 53, gzipBytes: 90405, rawBytes: 774318,
    gzipSha256: 'fd4b8f0986453d1b735dda8410ffd05c841289d0fd51d9fe1a6707128947dc68',
    rawSha256: 'd66a6809c3fc3dacf6a83386cad320d94c70264384f47e5f83a0bd0320768d07',
    stateSha256: 'dc973949b9ae006ec113a76727511ecf0d69f53d623356a57c4ec6e555112abe' },
} as const
function pinned(root: URL, name: string, bytes: number, hash: string): Buffer {
  const value = readFileSync(new URL(name, root))
  expect(value.byteLength, `${name}: accepted capture byte pin`).toBe(bytes)
  expect(sha(value), `${name}: accepted capture SHA pin`).toBe(hash)
  return value
}
function decoded(root: URL, pin: { name: string; gzipBytes: number; rawBytes: number; gzipSha256: string; rawSha256: string }): string {
  const raw = gunzipSync(pinned(root, pin.name, pin.gzipBytes, pin.gzipSha256)).toString('utf8')
  expect(Buffer.byteLength(raw)).toBe(pin.rawBytes)
  expect(sha(raw)).toBe(pin.rawSha256)
  return raw
}
export function recoveryPredecessor45(week: 0 | 53) {
  const manifest = JSON.parse(pinned(ROOT45, 'MANIFEST.json', 118645,
    '0cee53cb3c0a09d3b1afef8e9200f26a570423533a468864a9233cf6ce85001d').toString('utf8')) as {
    format: string; generatingHead: string; originalSourceHead: string; srcTree: string; sourceSaveVersion: number;
    seed: string; bound: { ticks: number; weeks: number[] }; files: Record<string, string>; captures: unknown[];
  }
  expect(manifest.format).toBe('1363-save45-predecessor/v1')
  expect(manifest.generatingHead).toBe(HEAD)
  expect(manifest.originalSourceHead).toBe('2eaa697effc38538c37da28b486786ce267a2284')
  expect(manifest.srcTree).toBe('88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837')
  expect(manifest.sourceSaveVersion).toBe(45)
  expect(manifest.seed).toBe('p13a-core-causal-01')
  expect(manifest.bound).toMatchObject({ ticks: 53, weeks: [0, 53] })
  expect(manifest.files['scripts/captures/1363-save45-predecessor.ts']).toBe('7c94086ca4787a931f0bd61b7eb94cacee3062ec14973a7132799f37036eebac')
  expect(manifest.files['scripts/captures/1363-save45-predecessor.config.ts']).toBe('7b935bef9808c4bae3371515c31ee3fb25bc78744070decab92e7c995a28abff')
  expect(manifest.captures).toEqual([PINS45[0], PINS45[53]])
  const pin = PINS45[week], raw = decoded(ROOT45, pin), parsed: unknown = JSON.parse(raw)
  const before = stableStringify(parsed), save = validateSaveV45(parsed)
  expect(save).toBe(parsed)
  expect(stableStringify(parsed), 'genuine45 reader cannot repair the predecessor').toBe(before)
  expect(save.saveVersion).toBe(45)
  expect(save.state.market.tick).toBe(week)
  expect(sha(stableStringify(save.state))).toBe(pin.stateSha256)
  expect(exportSave(save)).toBe(raw)
  expect(validateSaveV45(importSave(raw))).toEqual(save)
  expect(stableStringify(save)).toBe(before)
  return save
}
export function recoveryOldPeriod26() {
  const manifest = JSON.parse(pinned(ROOT26, 'MANIFEST.json', 2935,
    'bd0df3d065934c22275120bb6e0b340a76885f3ac0c4790a3f2e4ff92e7ef7fd').toString('utf8')) as {
    format: string; generatingHead: string; currentValidationHead: string; producerSha256: string;
    archivedSourceFilesSha256: string; sourceSaveVersion: number; startWeek: number; ticks: number; week: number;
    inputRawSha256: string; capture: { name: string; gzipBytes: number; rawBytes: number; gzipSha256: string; rawSha256: string };
  }
  expect(manifest.format).toBe('1363-old-era-period-capture/v1')
  expect(manifest.generatingHead).toBe('ce6945d58257f70c1b222a8c00e06038db73f6e4')
  expect(manifest.currentValidationHead).toBe(HEAD)
  expect(manifest.producerSha256).toBe('84643aa7517682b1c090fd74581419c30fa5e3bed02a52f30ff96536ba53ef86')
  expect(manifest.archivedSourceFilesSha256).toBe('942359540dafb615549c58df2cf1ea5067e1c7acd0d8df0dda24187241a67a14')
  expect(manifest.sourceSaveVersion).toBe(26)
  expect([manifest.startWeek, manifest.ticks, manifest.week]).toEqual([309, 3, 312])
  expect(manifest.inputRawSha256).toBe('11ef05be4131d3d3c4a19484f31e79cb50fa1936868f96ace7d0d18ea86e2d72')
  const pin = { name: 'genuine-v26-sound-mid-deployment-week312.json.gz', gzipBytes: 121310, rawBytes: 1106746,
    gzipSha256: 'd8b36ff43d7ad1e6a1b41ae3888e786f0266211875084f6d9d23b33bf5510757',
    rawSha256: 'fcbf32c3bc133cf6154b07603610d00a7c2533cdc6e70a0533d0a80f826d8868' }
  expect(manifest.capture).toEqual(pin)
  const raw = decoded(ROOT26, pin), parsed: unknown = JSON.parse(raw), before = stableStringify(parsed)
  const save = validateSaveV26(parsed)
  expect(save).toBe(parsed)
  expect(stableStringify(parsed), 'genuine26 reader cannot repair the predecessor').toBe(before)
  expect(save.state.market.tick).toBe(312)
  expect(exportSave(save)).toBe(raw)
  expect(validateSaveV26(importSave(raw))).toEqual(save)
  expect(stableStringify(save)).toBe(before)
  return save
}
