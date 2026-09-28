import { createHash } from 'node:crypto'
import { SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../../../../../bridge/runtime-checkpoint.ts'
import { canonicalJson } from '../../../../../bridge/schema/canonical.ts'
const V55 = 'sha256:2c377b6fa3c559eee753e7a9d91d4956399cca1a5693edb15adb3de7c4f27158'
const older = [...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS].filter(([id]) => id !== V55).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
console.log(JSON.stringify({ total: SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.size, olderLength: older.length, olderSha: createHash('sha256').update(canonicalJson(older)).digest('hex') }))
