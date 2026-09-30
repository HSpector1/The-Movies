// Shared fixture loader for the rival-shelving RED suite (record 1344-C). Not a test
// file itself (vitest only collects tests/**/*.test.ts); imported by the three
// p14d1-rival-shelving*.test.ts files so each pins the genuine bytes without
// duplicating the gzip/sha256 machinery three times ("Reuse existing authority").
//
// Genuine inputs (1344-P, minted at the last Save42 writer before the writer moves):
// tests/fixtures/p14/genuine-v42-pre-shelving/{MANIFEST.json, genuine-v42-rival-stall-week-100,130}
// Route (verbatim from the provenance files): p13aGeneratedStudio('p13a-core-causal-01');
// natural ticks only; saved at week 100 / week 130. Pins independently recomputed against
// the checked-in bytes by this author (`shasum -a 256`, `node -e zlib.gunzipSync(...)`),
// not copied from the provenance JSON prose.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { importSave, migrateToLive } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'

export const SEED = 'p13a-core-causal-01'
export const RIVAL_R01 = 'studio-aca408ec-r01'
export const RIVAL_R02 = 'studio-aca408ec-r02'

const FIXTURES = new URL('./fixtures/p14/genuine-v42-pre-shelving/', import.meta.url)
// 1344-C3 (revision, correction 4): one more genuine input minted at the last Save42
// writer (record 1344-P2, execution HEAD e62c944f), for the viable-control leaf's week-93
// comparison (1344-F Amendment 2 / 1344-F3). Pins independently recomputed 2026-09-30
// against the checked-in bytes (`shasum -a 256`, decoded via `zlib.gunzipSync`), not
// copied from the provenance JSON prose.
const FIXTURES_WEEK93 = new URL('./fixtures/p14/genuine-v42-pre-shelving-week93/', import.meta.url)
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')

/** Independently recomputed 2026-09-29 against the checked-in files at BASE
 * c214094478f47c3e861d757ef568a124cbf3bd71 (`shasum -a 256`, decoded via `zlib.gunzipSync`). */
export function manifestPin(): void {
  const manifest = readFileSync(new URL('MANIFEST.json', FIXTURES))
  expect(manifest.byteLength).toBe(1113)
  expect(sha(manifest)).toBe('35f281f6a56190b422c44d16838290a977a595db7e3ad3ace7c4d72cafb74f3f')
}

function pinnedRaw(name: string, gzipBytes: number, gzipHash: string, decodedBytes: number, decodedHash: string): string {
  const gz = readFileSync(new URL(name, FIXTURES))
  expect(gz.byteLength).toBe(gzipBytes)
  expect(sha(gz)).toBe(gzipHash)
  const raw = gunzipSync(gz).toString('utf8')
  expect(Buffer.byteLength(raw, 'utf8')).toBe(decodedBytes)
  expect(sha(raw)).toBe(decodedHash)
  return raw
}

export const week100Raw = (): string => pinnedRaw(
  'genuine-v42-rival-stall-week-100.json.gz',
  112887, '417d70f03c04d92984024bdae4d83ef2ad053cf639ce27751757cb5d9ceacf24',
  1016421, 'c92965074315e138c8a01deadb576a73387a6045ff3b66df85251e3ffe829e5c',
)
export const week130Raw = (): string => pinnedRaw(
  'genuine-v42-rival-stall-week-130.json.gz',
  121262, 'af45c8a0efb9a56ac9ff4c16244509d59b49a02370f8390769c79b133d7238f6',
  1096270, 'f0bf1f76552347f590b54cafefc5704a436f63de49c6782e9bb9a582f28f1425',
)

/** Independently recomputed 2026-09-30 against the checked-in files (1344-P2, execution
 * HEAD e62c944f). */
export function manifestPin93(): void {
  const manifest = readFileSync(new URL('MANIFEST.json', FIXTURES_WEEK93))
  expect(manifest.byteLength).toBe(625)
  expect(sha(manifest)).toBe('da69c240bd6b689c6d2d11d5747ff1768095b241e9356f2d50881fa4843aed4a')
}
function pinnedRaw93(name: string, gzipBytes: number, gzipHash: string, decodedBytes: number, decodedHash: string): string {
  const gz = readFileSync(new URL(name, FIXTURES_WEEK93))
  expect(gz.byteLength).toBe(gzipBytes)
  expect(sha(gz)).toBe(gzipHash)
  const raw = gunzipSync(gz).toString('utf8')
  expect(Buffer.byteLength(raw, 'utf8')).toBe(decodedBytes)
  expect(sha(raw)).toBe(decodedHash)
  return raw
}
export const week93Raw = (): string => pinnedRaw93(
  'genuine-v42-rival-stall-week-93.json.gz',
  109886, '14c41c2cf3a570e59bdb5ef97da04576499528039f76389904a057ea5ae4048e',
  985487, 'c13fb767b369c5c0e7c4d2e80260af9846f0bc5a850f9342036a3e46697a0e86',
)

export type V42Save = { saveVersion: 42; seed: string; state: GameState; broadcastCache: unknown[] }

/** importSave -> migrateToLive(...).state, exactly the pattern the brief requires
 * ("feed live readers migrateToLive(save).state, never loadSave alone"). */
export function liveWeek100(): GameState {
  const save = importSave(week100Raw())
  expect(save.saveVersion).toBe(42)
  return migrateToLive(save).state as GameState
}
export function liveWeek130(): GameState {
  const save = importSave(week130Raw())
  expect(save.saveVersion).toBe(42)
  return migrateToLive(save).state as GameState
}
/** The raw V42 envelope (not migrated), for tests that call convertV42ToV43 themselves. */
export function genuineV42Week100(): V42Save {
  const save = importSave(week100Raw())
  expect(save.saveVersion).toBe(42)
  return save as unknown as V42Save
}
export function genuineV42Week130(): V42Save {
  const save = importSave(week130Raw())
  expect(save.saveVersion).toBe(42)
  return save as unknown as V42Save
}
export function genuineV42Week93(): V42Save {
  const save = importSave(week93Raw())
  expect(save.saveVersion).toBe(42)
  return save as unknown as V42Save
}

const deepClone = <T>(value: T): T => structuredClone(value)
export { deepClone }
