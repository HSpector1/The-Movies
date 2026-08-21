import { canonicalJson } from '../bridge/schema/canonical.ts'
import {
  BridgeInFlightEvidenceError,
  verifyBridgeInFlightEvidence,
} from '../bridge/testing/in-flight-evidence-verifier.ts'

const args = process.argv.slice(2)
if (args.length !== 1 || args[0]?.trim().length === 0) {
  console.error('Usage: npm run verify:bridge-inflight-evidence -- <evidence-root>')
  process.exitCode = 2
} else {
  try {
    const result = verifyBridgeInFlightEvidence(args[0])
    process.stdout.write(`${canonicalJson(result)}\n`)
  } catch (error) {
    const message = error instanceof BridgeInFlightEvidenceError
      ? error.message
      : 'Unexpected evidence verification failure.'
    console.error(`[bridge:evidence] ${message}`)
    process.exitCode = 1
  }
}
