// Isolated 1170-A/B/C capture; parent is the sole executor.
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: fileURLToPath(new URL('../../../../../', import.meta.url)),
  test: {
    name: 'p3-current45-capture',
    environment: 'node',
    include: ['docs/engineering/playability-launch-review/evidence/p14b4-20260919/1171-p3-current45-capture.test.ts'],
    testTimeout: 60_000,
    retry: 0,
    fileParallelism: false,
  },
})
