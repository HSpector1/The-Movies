import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: "/Users/zacheryspector/studio-scratch/1370-c0-m0-observer-mirrors-20261009-r2/20261009-m0-types-r2",
  cacheDir: "/Users/zacheryspector/studio-scratch/1370-an-m0-types-external-config-executor-results-20261009-r3/20261009-m0-types-external-after-an-r3/external-config/cache",
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    environment: 'node',
  },
})
