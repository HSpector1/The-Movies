// Isolated outgoing39/54 capture. Parent alone executes.
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
export default defineConfig({
  root: fileURLToPath(new URL('../../../../../', import.meta.url)),
  test: {
    name: 'p4p5-outgoing-capture', environment: 'node',
    include: ['docs/engineering/playability-launch-review/evidence/p14b4-20260919/1221-p4p5-outgoing-capture.test.ts'],
    testTimeout: 60_000, retry: 0, fileParallelism: false,
  },
})
