// 1361-F6 ruling 2: catalogue/evaluator changes are Legacy definition changes.
// The capture is minted once by the actual landed Save45 writer, never in this test.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { importSave, makeSave, migrateToLive, stableStringify, validateSave } from '../src/core/save.js'
import { TECHNOLOGY_CATALOGUE } from '../src/core/technologyCatalogue.js'

const FIXTURE = './fixtures/p15/p15c2-frozen-v2-save45/'
const CAPTURE = 'route-l-week-6240.save45.json.gz'
const FIXTURE_BUDGET_MS = 120_000 // Existing P15C fixture class: 1359-F4.
const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')

type Manifest = {
  format: 'p15c-frozen-v2-capture/v1'
  sourceHead: string
  routeSeed: string
  sourceSaveVersion: number
  week: number
  definition: string
  capture: { name: string; compressedBytes: number; compressedSha256: string; bytes: number; sha256: string }
  officialSha256: string
}

describe('P15C closure — frozen Legacy replay inputs (1361-F6)', () => {
  it('legacy-replay-catalogue-id-commercial-week-sequence', () => {
    expect(
      TECHNOLOGY_CATALOGUE.map(({ id, commercialWeek }) => [id, commercialWeek]),
      '1361-F6 ruling 2: changing this sequence requires an adopted Legacy definition change; do not mechanically re-pin it',
    ).toEqual([
      ['lighting-control-01', 936],
      ['synchronized-sound', 416],
    ])
  })

  it('legacy-replay-loads-genuine-landed-save45-frozen-v2', () => {
    const started = performance.now()
    const manifest = JSON.parse(readFileSync(new URL(`${FIXTURE}MANIFEST.json`, import.meta.url), 'utf8')) as Manifest
    expect(manifest.format).toBe('p15c-frozen-v2-capture/v1')
    expect(manifest.sourceHead).toMatch(/^[0-9a-f]{40}$/)
    expect(manifest.routeSeed).toBe('1359-legacy-late-founding-01')
    expect(manifest.sourceSaveVersion).toBe(45)
    expect(manifest.week).toBe(6240)
    expect(manifest.definition).toBe('campaign-legacy/v2')
    expect(manifest.capture.name).toBe(CAPTURE)
    const compressed = readFileSync(new URL(`${FIXTURE}${CAPTURE}`, import.meta.url))
    expect(compressed.byteLength).toBe(manifest.capture.compressedBytes)
    expect(sha256(compressed)).toBe(manifest.capture.compressedSha256)
    const raw = gunzipSync(compressed)
    expect(raw.byteLength).toBe(manifest.capture.bytes)
    expect(sha256(raw)).toBe(manifest.capture.sha256)

    const captured = importSave(raw.toString('utf8'))
    if (captured.saveVersion !== 45) throw new Error('1361-F6: the genuine frozen-v2 capture must remain Save45')
    expect(captured.seed).toBe(manifest.routeSeed)
    expect(captured.state.market.tick).toBe(6240)
    expect(captured.state.founding).toBeNull()
    const official = captured.state.campaignLegacy.official
    expect(official, '1361-F6: a capture must contain the actual 2040 freeze, never a root forged by the consumer').not.toBeNull()
    expect(official?.definition).toBe('campaign-legacy/v2')
    expect(official?.boundaryWeek).toBe(6240)
    const before = stableStringify(captured)
    expect(sha256(stableStringify(official))).toBe(manifest.officialSha256)

    // The old envelope and its migrated current state must both validate today.
    // No fixture overwrite, direct freeze call, or source-fact reconstruction is allowed.
    expect(() => validateSave(captured)).not.toThrow()
    const current = migrateToLive(captured)
    const resaved = makeSave(current.state)
    expect(resaved.state.campaignLegacy.official).toEqual(official)
    expect(stableStringify(captured), 'migration must preserve the original capture').toBe(before)
    expect(sha256(raw)).toBe(manifest.capture.sha256)
    expect(performance.now() - started, '1361-F6 replay fixture exceeded the existing P15C fixture budget').toBeLessThanOrEqual(FIXTURE_BUDGET_MS)
  }, FIXTURE_BUDGET_MS)
})
