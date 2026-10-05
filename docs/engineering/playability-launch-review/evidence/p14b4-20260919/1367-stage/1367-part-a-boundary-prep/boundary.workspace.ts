import { defineWorkspace } from 'vitest/config'
export default defineWorkspace([{ test: { name: 'boundary', environment: 'node', include: ['tests/probes/1367-boundary.probe.ts'] } }])
