import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  test: {
    name: 'economy-truth-audit',
    environment: 'node',
    include: ['*.test.ts'],
  },
})
