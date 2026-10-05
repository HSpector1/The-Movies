// Genuine historical pre-market state: all history is original26 output.
// The normal migration introduces the empty market; no current case is removed.
import { expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { validateSaveV26, migrateToV46, validateSaveV46, stableStringify, exportSave, importSave } from '../../src/core/save.js'
const root = new URL('../fixtures/p14/genuine-v26-renewal196-1368/', import.meta.url)
const sha = (v: string | Uint8Array) => createHash('sha256').update(v).digest('hex')
export function genuineRenewal196() {
  const manifestBytes = readFileSync(new URL('MANIFEST.json', root))
  expect(manifestBytes.length).toBe(8098)
  expect(sha(manifestBytes)).toBe('d377c3bd3ce25cc91ef9e0b6778f576a3df1274dcdd0daed706081b5a63205ca')
  const manifest = JSON.parse(manifestBytes.toString('utf8'))
  expect(manifest).toMatchObject({ format: '1368-original26-renewal196/v1', generatingHead: 'ce6945d58257f70c1b222a8c00e06038db73f6e4',
    archiveSha256: '942359540dafb615549c58df2cf1ea5067e1c7acd0d8df0dda24187241a67a14', seed: 'p13a-core-causal-01',
    ticks: 196, week: 196, sourceSaveVersion: 26, tickOptions: { develop: true } })
  const compressed = readFileSync(new URL('genuine-v26-week196.json.gz', root))
  expect(compressed.length).toBe(117369)
  expect(sha(compressed)).toBe('195651d9501df2e65ca97eb736862e8ea5eab9433c780541ef79821ffdd20dd2')
  const raw = gunzipSync(compressed).toString('utf8')
  expect(Buffer.byteLength(raw)).toBe(1048509)
  expect(sha(raw)).toBe('6e0ad3dd0a8a15cf0147ed8de1b3a04f2259829f90fddc4ae0fbb20b21f18783')
  const parsed: unknown = JSON.parse(raw), before = stableStringify(parsed)
  const historical = validateSaveV26(parsed)
  expect(stableStringify(parsed)).toBe(before)
  expect(exportSave(historical)).toBe(raw)
  expect(validateSaveV26(importSave(raw))).toEqual(historical)
  const migrated = migrateToV46(historical), migratedBefore = stableStringify(migrated)
  const live = validateSaveV46(migrated).state
  expect(stableStringify(migrated)).toBe(migratedBefore)
  expect(stableStringify(parsed)).toBe(before)
  expect(live.market.tick).toBe(196)
  expect(live.talentMarket.cases).toHaveLength(0)
  expect(live.talentMarket.proposals).toHaveLength(0)
  expect(live.hollywood!.businesses.every(b => b.costCutting.since === null)).toBe(true)
  return live
}
