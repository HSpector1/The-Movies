// Isolated test-process negative control; no file/law/fixture mutations.
import { afterAll } from '/Users/zacheryspector/The-Movies-headless-program/node_modules/vitest/dist/index.js'
import { TUNING } from '/Users/zacheryspector/The-Movies-headless-program/src/core/tuning.ts'
const tuning = TUNING as unknown as { SHARED_MARKET_FACTOR_MAX_PENALTY: number }
const original = tuning.SHARED_MARKET_FACTOR_MAX_PENALTY
if (original !== 0.15) throw new Error('Unexpected input law: zero-pressure control requires live penalty0.15')
// Setup executes before the original test module; liveMarketLaw reads this value.
tuning.SHARED_MARKET_FACTOR_MAX_PENALTY = 0
console.info('R7Q2_ZERO_PRESSURE_CONTROL penalty0; original assertions and fixtures unchanged')
afterAll(() => {
  tuning.SHARED_MARKET_FACTOR_MAX_PENALTY = original
  if (tuning.SHARED_MARKET_FACTOR_MAX_PENALTY !== 0.15) throw new Error('Zero-pressure control did not restore tuning')
  console.info('R7Q2_ZERO_PRESSURE_CONTROL restored0.15')
})
