import { defineWorkspace } from 'vitest/config'
export default defineWorkspace([{ test: { name: 'core', include: ['tests/1368-natural-recovery.test.ts'], environment: 'node', pool: 'forks', testTimeout: 300_000, hookTimeout: 300_000 } }])
