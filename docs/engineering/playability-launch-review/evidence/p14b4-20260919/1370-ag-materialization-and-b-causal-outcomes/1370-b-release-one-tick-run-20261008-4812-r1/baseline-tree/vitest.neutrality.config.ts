import { defineConfig } from 'vitest/config'
export default defineConfig({ cacheDir: process.env.B_RELEASE_CACHE,
  test: { environment: 'node', include: ['tests/full-state-neutrality.test.ts'],
    fileParallelism: false, maxWorkers: 1, minWorkers: 1, testTimeout: 60_000 } })
