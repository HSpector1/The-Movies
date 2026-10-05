// New original-engine reproduction at c000479d (Save37), lawfully projected to V36.
// Current validation HEAD is separately pinned; these are not current-engine ticks.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { exportSave, importSave, loadSave, stableStringify, validateSaveV36 } from '../../src/core/save.js'

const ROOT = new URL('../fixtures/p14/genuine-v36-downgrade-extension-controls/', import.meta.url)
export const EXTENSION_PERSON = 'authored-0000'
export const EXTENSION_STUDIO = 'studio-d7df6c8e-player'
export const EXTENSION_OLD_CONTRACT = 'studio-d7df6c8e-player:contract:authored-0000:0:player-24'
export const EXTENSION_NEW_CONTRACT = 'studio-d7df6c8e-player:contract:authored-0000:98:player-26'
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const PINS = {
  open: { filename: 'reproduced-v36-extension-open-week92.json.gz', week: 92,
    gzipBytes: 112390, gzipSha256: '88293028366023ac5ffb3cf48838391a27e80ef0d7e5c95eddff8247e36f77af',
    rawBytes: 1016089, rawSha256: '59fa201e30be28acac4d7406fc3bf4ab76ee995cc0e3dd8a2103d42ab8be5d1d',
    projectedFrom37Sha256: '1b3024a955cd2723a05f29d3404096c0c81cd41ccc0388ac3900ca5a35611d20' },
  used: { filename: 'reproduced-v36-extension-used-week98.json.gz', week: 98,
    gzipBytes: 118267, gzipSha256: '69339e4af679bf39270619d2d73196b0a17958cf96e8b932b8f03015bc0bbc26',
    rawBytes: 1076361, rawSha256: '37ed808d53ab76d45fdc2afbd4d4be03e2010b25b819794c2ad4db70ed6b9eba',
    projectedFrom37Sha256: '8672c6bcac0d39eadfbbe149bea55a5c92004f7ea2c57e0964ac5c86f63efc35' },
} as const
type Kind = keyof typeof PINS
type Facts = { week: number; payloadSaveVersion: number; archivedRuntimeSaveVersion: number; personId: string;
  record: unknown; extensionCase: unknown; expectedRefusal: string; settlementEmployment: unknown[];
  projectedFrom37Sha256: string; rawSha256: string }
type Manifest = { format: string; generatingHead: string; currentValidationHead: string; producerSha256: string;
  configSha256: string; archiveFilesSha256: string; ticks: number;
  proposal: { week: number; talentId: string; issuerStudioId: string; termWeeks: number; premiumTier: number };
  artifacts: { filename: string; facts: Facts; rawSha256: string; gzipSha256: string }[] }
function pinned(name: string, bytes: number, hash: string): Buffer {
  const value = readFileSync(new URL(name, ROOT))
  expect(value.byteLength, `${name}: prerequisite byte pin`).toBe(bytes)
  expect(sha(value), `${name}: prerequisite hash pin`).toBe(hash)
  return value
}
export function extensionRaw(kind: Kind): string {
  const pin = PINS[kind], raw = gunzipSync(pinned(pin.filename, pin.gzipBytes, pin.gzipSha256)).toString('utf8')
  expect(Buffer.byteLength(raw)).toBe(pin.rawBytes)
  expect(sha(raw)).toBe(pin.rawSha256)
  return raw
}
export function extensionFixture(kind: Kind) {
  const manifest = JSON.parse(pinned('MANIFEST.json', 6182, 'e62713cc60ecfce007b11ee381c5346a1fa98a430978983d47068d61addbb7ee').toString('utf8')) as Manifest
  expect(manifest.format).toBe('genuine-v36-extension-controls/v1')
  expect(manifest.generatingHead).toBe('c000479d6e888d3a02f5c2ff534f5dfcbb32af3f')
  expect(manifest.currentValidationHead).toBe('689a69f314a61a71c2ee4fc813fb4f16c7245ec1')
  expect(manifest.producerSha256).toBe('714be0ea30e3e236b55c5e54454909adbf358264fca66e50f0de2d652d5dc77c')
  expect(manifest.configSha256).toBe('71c006047d7b2887b2f2f6fec5f75f70dd07626fc95221f84b45fcf6dd540029')
  expect(manifest.archiveFilesSha256).toBe('1583d5c7d6311cc8de99429a4ead13d8d82a4abdc73602eb436cf5dac6280816')
  expect(manifest.ticks).toBe(46)
  expect(manifest.proposal).toEqual({ week: 92, talentId: EXTENSION_PERSON, issuerStudioId: EXTENSION_STUDIO, termWeeks: 58, premiumTier: 1.1 })
  expect(manifest.artifacts.map(row => row.filename)).toEqual([PINS.open.filename, PINS.used.filename])
  const pin = PINS[kind], artifact = manifest.artifacts.find(row => row.filename === pin.filename)!
  expect(artifact.gzipSha256).toBe(pin.gzipSha256)
  expect(artifact.rawSha256).toBe(pin.rawSha256)
  expect(artifact.facts).toMatchObject({ week: pin.week, payloadSaveVersion: 36, archivedRuntimeSaveVersion: 37,
    personId: EXTENSION_PERSON, rawSha256: pin.rawSha256, projectedFrom37Sha256: pin.projectedFrom37Sha256 })
  const raw = extensionRaw(kind), parsed: unknown = JSON.parse(raw), before = stableStringify(parsed)
  const save = validateSaveV36(parsed)
  expect(save).toBe(parsed)
  expect(stableStringify(parsed), 'public V36 reader must not repair the baseline').toBe(before)
  expect(save.saveVersion).toBe(36)
  expect(save.state.market.tick).toBe(pin.week)
  expect(loadSave(save)).toBe(save)
  expect(stableStringify(save), 'dispatching reader must be neutral').toBe(before)
  expect(exportSave(save)).toBe(raw)
  expect(stableStringify(save), 'codec validation must be neutral').toBe(before)
  const roundtrip = validateSaveV36(importSave(raw))
  expect(roundtrip).toEqual(save)
  expect(exportSave(roundtrip)).toBe(raw)
  expect(stableStringify(save)).toBe(before)
  expect(extensionRaw(kind)).toBe(raw)
  return { save, raw, facts: artifact.facts }
}
