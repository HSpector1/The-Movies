import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { environment: 'node', include: ['tests/1368-recovery-witness-producer.test.ts'],
  fileParallelism: false, maxWorkers: 1, minWorkers: 1 } })
