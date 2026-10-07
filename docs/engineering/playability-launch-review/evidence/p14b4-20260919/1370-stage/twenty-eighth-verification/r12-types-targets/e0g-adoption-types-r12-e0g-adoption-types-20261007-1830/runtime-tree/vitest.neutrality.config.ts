import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { environment: 'node', include: ['tests/full-state-neutrality.test.ts'], fileParallelism: false, maxWorkers: 1, minWorkers: 1, testTimeout: 750_000 } })
