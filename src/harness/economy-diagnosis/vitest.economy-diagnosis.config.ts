import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/harness/economy-diagnosis/**/*.test.ts'],
    environment: 'node',
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 60_000,
  },
})
