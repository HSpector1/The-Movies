// Named accepted capture loader, reusable by C/migration and separately reviewed B consumers.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import * as save from '../../src/core/save.js'
import { HISTORICAL_HEADS, ordinaryPath, requireFact, sha256 } from './1368-archived-route.js'

type Row = { key: string; file: string; rawSha256: string; gzipSha256: string; week: number; version: number;
  studioId?: string; facilityId?: string; projectId?: string; qualification: string }
function load(version: 26 | 45, key: string) {
  const prefix = version === 45 ? 'P1368_ACCEPTED45' : 'P1368_ACCEPTED26'
  const root = process.env[prefix + '_ROOT'], pin = process.env[prefix + '_MANIFEST_SHA256']
  requireFact(root && pin && /^[0-9a-f]{64}$/.test(pin), 'independently accepted capture path/manifest pin required')
  ordinaryPath(root)
  const manifestPath = ordinaryPath(join(root, 'MANIFEST.json')), rawManifest = readFileSync(manifestPath)
  requireFact(sha256(rawManifest) === pin, 'accepted manifest bytes differ')
  const manifest = JSON.parse(rawManifest.toString('utf8')) as { format: string; historicalGeneratingHead: string;
    seed: string; start: number; horizon: number; ticks: number; options: { develop: boolean }; rows: Row[] }
  requireFact(manifest.format === '1368-recovery-witness/v1' && manifest.historicalGeneratingHead === HISTORICAL_HEADS[version], 'wrong historical capture authority')
  requireFact(manifest.seed === 'p13a-core-causal-01' && manifest.start === 0
    && manifest.horizon === (version === 45 ? 520 : 52) && manifest.ticks === manifest.horizon && manifest.options.develop === true, 'wrong fixed capture route')
  const rows = manifest.rows.filter(row => row.key === key)
  requireFact(rows.length === 1, `required accepted witness absent: ${key}`)
  const row = rows[0]!
  requireFact(row.version === version && row.file === key + '.json.gz', 'wrong named witness file')
  const gzip = readFileSync(ordinaryPath(join(root, row.file))), raw = gunzipSync(gzip)
  requireFact(sha256(gzip) === row.gzipSha256 && sha256(raw) === row.rawSha256, 'capture payload pins differ')
  const parsed: unknown = JSON.parse(raw.toString('utf8')), before = save.stableStringify(parsed)
  const value = version === 45 ? save.validateSaveV45(parsed) : save.validateSaveV26(parsed)
  requireFact(save.stableStringify(parsed) === before && value.state.market.tick === row.week, 'public predecessor reader neutrality/clock differs')
  return { value, row }
}
export function accepted45(key: 'ordinary'|'calendar'|'operational'|'research'|'baseline265'|'baseline280') {
  const { value, row } = load(45, key), old = save.validateSaveV45(value), before = save.stableStringify(old)
  const live = save.convertV45ToV46(old)
  requireFact(save.validateSaveV46(live) === live && save.stableStringify(old) === before, 'actual45→46 neutral admission failed')
  requireFact(save.stableStringify(save.convertV46ToV45(live)) === before, 'only null/zero initialized roundtrip differs')
  for (const b of live.state.hollywood!.businesses) {
    requireFact(b.costCutting.since === null && b.costCutting.version === 1, 'new recovery authority is not empty')
    requireFact(b.account.periods.every(p => p.movements.facilityDemolitionRefund === 0), 'retroactive refund not empty')
  }
  return { old, live, row }
}
export function acceptedPeriod52() {
  const { value, row } = load(26, 'period52')
  requireFact(row.week === 52, 'exact first calendar boundary required')
  return save.validateSaveV26(value)
}
