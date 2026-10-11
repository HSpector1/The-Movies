// Genuine original Save42 week77 capture; literal pins independently accepted after mint.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { exportSave, importSave, stableStringify, validateSaveV42 } from '../src/core/save.js'

const ROOT = new URL('./fixtures/p14/genuine-v42-pre-shelving-week77-1363/', import.meta.url)
type Pin = { bytes: number; sha256: string }
const PINS: { manifest: Pin | null; gzip: Pin | null; raw: Pin | null; archiveSha256: string | null;
  currentValidationHead: string | null; currentValidationVersion: 45 | 46 | null } = {
  manifest: { bytes: 21060, sha256: '2f34d9ad15655c0beec8dc99cc3bc10b8b13195db254b23e0fa34d061f5aee4d' },
  gzip: { bytes: 103584, sha256: 'b3856c561ca787d40db4dbe5e197a3101ceb45b83bfe2dd7978f70996b4915cd' },
  raw: { bytes: 910372, sha256: '149de4e4d9501966456fa4123304f5dbf26e35d278a0c80ccf945cf47f7f06ac' },
  archiveSha256: '2cb00fad7c679caabf6d3630ba345e5c0c7ea6e54e0e3e174b55ce274446c9ff',
  currentValidationHead: 'd8a332fc33b26209abe23c32b157cc2fa85ac1f0', currentValidationVersion: 45,
}
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
function required<T>(value: T | null, label: string): T {
  if (value === null) throw new Error('UNMINTED WEEK77 PREREQUISITE: independent ' + label + ' pin is required')
  return value
}
function pinned(name: string, input: Pin | null): Buffer {
  const pin = required(input, name)
  expect(pin.sha256).toMatch(/^[0-9a-f]{64}$/)
  const data = readFileSync(new URL(name, ROOT))
  expect(data.length).toBe(pin.bytes); expect(sha(data)).toBe(pin.sha256)
  return data
}
export function genuineV42Week77() {
  const manifest = JSON.parse(pinned('MANIFEST.json', PINS.manifest).toString('utf8')) as {
    format: string; generatingHead: string; currentValidationHead: string; currentValidationVersion: number;
    archivedSourceFilesSha256: string; producerSha256: string; sourceSaveVersion: number; seed: string;
    startWeek: number; ticks: number; week: number; originalNamedPins: Record<string, { sha256: string }>;
    capture: { name: string; gzipBytes: number; gzipSha256: string; rawBytes: number; rawSha256: string };
  }
  expect(manifest.format).toBe('1367-week77-save42-capture/v1')
  expect(manifest.generatingHead).toBe('e62c944fef2966ea2ba4b5d28594dd061bc33a94')
  expect(manifest.currentValidationHead).toBe(required(PINS.currentValidationHead, 'actual validation HEAD'))
  expect(manifest.currentValidationVersion).toBe(required(PINS.currentValidationVersion, 'actual validation version'))
  expect(manifest.archivedSourceFilesSha256).toBe(required(PINS.archiveSha256, 'archived source'))
  expect(manifest.producerSha256).toBe('7f3acb1b161cbb67e409f59fe5ea28ed245df2362ed99626b1fb1d5470350a59')
  expect(manifest.originalNamedPins['src/harness/p13a/fixtures.ts']!.sha256).toBe('f9d07ff10728ef42aa4973e97880e2300b9f29c32db3cc3b4bd6e4cdbd01f6d5')
  expect(manifest.originalNamedPins['bridge/protocol.ts']!.sha256).toBe('71b920d90ce9a54214c7dd82208a168bd71cab9be60efa11d2ae3a81d7e0b7fa')
  expect(manifest.originalNamedPins['tsconfig.json']!.sha256).toBe('f855dfc9191a0d63240d447bccac5e029530a74b83e12f467083f1393bbe6d4f')
  expect([manifest.sourceSaveVersion, manifest.startWeek, manifest.ticks, manifest.week]).toEqual([42, 0, 77, 77])
  expect(manifest.seed).toBe('p13a-core-causal-01')
  const gzPin = required(PINS.gzip, 'gzip'), rawPin = required(PINS.raw, 'raw')
  expect(manifest.capture).toEqual({ name: 'genuine-v42-rival-stall-week-77.json.gz',
    gzipBytes: gzPin.bytes, gzipSha256: gzPin.sha256, rawBytes: rawPin.bytes, rawSha256: rawPin.sha256 })
  const raw = gunzipSync(pinned(manifest.capture.name, PINS.gzip)).toString('utf8')
  expect(Buffer.byteLength(raw)).toBe(rawPin.bytes); expect(sha(raw)).toBe(rawPin.sha256)
  const parsed: unknown = JSON.parse(raw), before = stableStringify(parsed)
  const save = validateSaveV42(parsed)
  expect(save).toBe(parsed); expect(stableStringify(parsed)).toBe(before)
  expect(save.saveVersion).toBe(42); expect(save.state.market.tick).toBe(77)
  expect(exportSave(save)).toBe(raw)
  expect(exportSave(validateSaveV42(importSave(raw)))).toBe(raw)
  expect(stableStringify(parsed)).toBe(before)
  return save
}
