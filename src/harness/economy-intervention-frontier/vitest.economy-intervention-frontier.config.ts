import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/harness/economy-intervention-frontier/**/*.test.ts'],
    environment: 'node',
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 120_000,
  },
})
