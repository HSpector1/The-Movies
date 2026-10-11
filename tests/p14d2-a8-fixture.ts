// Genuine 1363-A8 Save45 bytes. Pins recomputed from the named new mint only.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV45, validateSaveV46, convertV46ToV45 } from '../src/core/save.js'
import type { RivalBusiness } from '../src/core/hollywoodTypes.js'
type HistoricalAccount = NonNullable<ReturnType<typeof validateSaveV45>['state']['hollywood']>['businesses'][number]['account']

export const A8_STUDIO = 'studio-aca408ec-r02'
export const A8_SCRIPT = 'script-0021'
export const A8_ORDINAL = 21
export const A8_HEAD = '689a69f314a61a71c2ee4fc813fb4f16c7245ec1'
const ROOT = new URL('./fixtures/p14/genuine-v45-binding-cash-1363/', import.meta.url)
const NAME = 'genuine-v45-binding-cash-count12'
export const a8Sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
export type A8Candidate = { billing: number[]; negative: number; marketing: number; cost: number; contribution: number; preference: number; viable: boolean }
type Provenance = {
  executionHead: string; saveVersion: number; status: string; seed: string;
  sourceFiles: Record<string, { bytes: number; sha256: string }>;
  facts: {
    week: number; afterWeek: number; studioId: string; scriptId: string; ordinal: number;
    countBefore: number; countAfter: number; oldOutcome: string; candidateOutcome: string;
    actualSeatableTeamReachedChooser: boolean; allCashFreeViable: number;
    searchCounts: { affordable: number; unaffordable: number; viable: number };
    accountBefore: HistoricalAccount; accountAfter: HistoricalAccount;
    shelvingBefore: RivalBusiness['screenplayShelving']; shelvingAfter: RivalBusiness['screenplayShelving'];
    appendedIndustryReceipts: unknown[]; rngBefore: string; rngAfter: string;
    decisionInputSha256: string; candidates: A8Candidate[];
    rawBefore: { bytes: number; sha256: string }; rawAfter: { bytes: number; sha256: string };
  };
}
function pinned(name: string, bytes: number, hash: string): Buffer {
  const value = readFileSync(new URL(name, ROOT))
  expect(value.byteLength, `${name}: byte pin prerequisite`).toBe(bytes)
  expect(a8Sha(value), `${name}: hash pin prerequisite`).toBe(hash)
  return value
}
export function a8Raw(): string {
  const gz = pinned(`${NAME}.json.gz`, 142226, '505c1335601ebd292fd0b341631ccb33ad4898eec652b4378c8f913d22064623')
  const raw = gunzipSync(gz).toString('utf8')
  expect(Buffer.byteLength(raw)).toBe(1339547)
  expect(a8Sha(raw)).toBe('54938083c4d088fad71ca1c5088dd67427c316d9fee81fdaba1ea66161ca954c')
  return raw
}
export function loadA8() {
  const manifest = JSON.parse(pinned('MANIFEST.json', 2463, 'bd6d51a93b532d3f02de6bd0bae821588c70a7f63ac5251b092d518a12231b89').toString('utf8')) as {
    executionHead: string; saveVersion: number; seed: string; sourceFiles: Provenance['sourceFiles'];
    inputs: { name: string; facts: { week: number; studioId: string; scriptId: string; count: number } }[];
  }
  const provenance = JSON.parse(pinned(`${NAME}.provenance.json`, 28287, '209b1fbdeaff37ff0f1228eeefebf201161bb3f878f1704072c67f9315a35597').toString('utf8')) as Provenance
  expect(manifest.executionHead).toBe(A8_HEAD)
  expect(provenance.executionHead).toBe(A8_HEAD)
  expect(manifest.saveVersion).toBe(45); expect(provenance.saveVersion).toBe(45)
  expect(manifest.seed).toBe('p13a-core-causal-01'); expect(provenance.seed).toBe(manifest.seed)
  expect(provenance.status).toBe('MINTED')
  expect(manifest.sourceFiles).toEqual(provenance.sourceFiles)
  expect(manifest.sourceFiles['src/core/hollywoodPolicy.ts']!.sha256).toBe('843131da845b609ad133259ee82035bc129aad4b75394b757d5ac66341efd234')
  expect(manifest.sourceFiles['src/core/hollywoodTick.ts']!.sha256).toBe('d5963544fd591ee5abbb3584e3f0337db0210bfeaac05b69195a3c339452ac17')
  expect(manifest.inputs).toHaveLength(1)
  expect(manifest.inputs[0]!.name).toBe(NAME)
  expect(manifest.inputs[0]!.facts).toEqual({ week: 247, studioId: A8_STUDIO, scriptId: A8_SCRIPT, count: 12 })
  const raw = a8Raw(), parsed: unknown = JSON.parse(raw), before = stableStringify(parsed)
  const historical = validateSaveV45(parsed)
  expect(stableStringify(parsed), 'public V45 validation is neutral').toBe(before)
  expect(exportSave(historical)).toBe(raw)
  const imported = importSave(raw), importedBytes = stableStringify(imported)
  expect(imported.saveVersion).toBe(45)
  const live = migrateToLive(imported)
  expect(stableStringify(imported), 'migration preserves the imported predecessor').toBe(importedBytes)
  expect(live.saveVersion).toBe(46)
  const expectedState = structuredClone(historical.state)
  for (const owner of expectedState.hollywood!.businesses) {
    Object.assign(owner, { costCutting: { version: 1, since: null } })
    for (const period of owner.account.periods) Object.assign(period.movements, { facilityDemolitionRefund: 0 })
  }
  expect(live.state).toEqual(expectedState) // Comparison oracle only; never a producer/reader input.
  const stateBytes = stableStringify(live.state)
  const current = makeSave(live.state)
  expect(current.saveVersion).toBe(46)
  validateSaveV46(current)
  const actualOld = convertV46ToV45(current)
  validateSaveV45(actualOld)
  expect(exportSave(actualOld)).toBe(raw)
  expect(exportSave(importSave(exportSave(current)))).toBe(exportSave(current))
  expect(stableStringify(live.state)).toBe(stateBytes)
  expect(a8Raw()).toBe(raw)
  return { raw, state: live.state, provenance }
}

/** Expected migration adds zeros; no real refund is removed to satisfy comparison. */
export function a8AccountInRecovery(account: HistoricalAccount): RivalBusiness['account'] {
  return { ...structuredClone(account), periods: account.periods.map(period => ({ ...structuredClone(period),
    movements: { ...period.movements, facilityDemolitionRefund: 0 },
  })) }
}
