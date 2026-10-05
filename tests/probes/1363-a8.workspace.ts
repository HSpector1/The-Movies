// Install with the probe at tests/probes/. Explicit workspace excludes ordinary suites.
import { defineWorkspace } from 'vitest/config'
export default defineWorkspace([{
  test: {
    name: '1363-a8',
    environment: 'node',
    include: ['tests/probes/1363-a8-capture.probe.ts'],
    testTimeout: 300_000,
  },
}])
