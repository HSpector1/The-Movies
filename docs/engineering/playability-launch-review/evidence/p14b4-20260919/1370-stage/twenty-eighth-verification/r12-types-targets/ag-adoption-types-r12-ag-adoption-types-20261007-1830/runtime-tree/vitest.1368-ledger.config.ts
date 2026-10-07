import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { environment: 'node', include: ['tests/1368-ledger-attribution.test.ts'], fileParallelism: false, maxWorkers: 1, minWorkers: 1, testTimeout: 300_000 } })
