import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { include: ['tests/1368-natural-recovery.test.ts'], environment: 'node', pool: 'forks', maxWorkers: 1, minWorkers: 1, fileParallelism: false, testTimeout: 300_000, hookTimeout: 300_000 } })
