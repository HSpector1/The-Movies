// Independent C.2-RM inputs (875). Original corpus bytes are never rewritten.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { exportSave, importSave, makeSave, migrateToLive, validateSaveV37 } from '../../src/core/save.js'
import { retirementRecordFor } from '../../src/core/careerLifecycle.js'
import type { GameState } from '../../src/core/types.js'
import { advanceTo } from '../../src/harness/p13a/fixtures.js'
import { c2bFixture } from './p14c2b-fixtures.js'
export { advanceTo }
export const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
export const bytes = (state: GameState) => exportSave(makeSave(state))
export const owner = (state: GameState) => state.hollywood!.playerStudioId
export function admitted(state: GameState): GameState {
  return validateSaveV37(JSON.parse(bytes(state))).state
}
export const OUTGOING_51 = 'sha256:a690e6f9e6f93f3a78f8eed8eaa20a1532a9ebd82812b0bc9414a04fdcb5968f'
export const SCI = 't-sci-00'
export const RUNTIME_51 = {
  filename: 'runtime51-current670-saved669.json.gz',
  gzip: '6a5b2566d061464fd3c352266535e491b5bcbe90a5e6f48e52548029178b403c',
  raw: 'acd644d005b4c0077a53e07257b965e3b4ebb1bd04e6d720e9e8d4b3ac261acf',
  source: '48a76a87bca624d6dff81118d5ecb6df56ca00d2',
  producer: '701d48863eb7682d470d6c1c5691cdd2a675751c9fbdd757ef80c77f31ac4814',
  current: 'c119e1aac5b1dda794bf6c6967dceade05eeace2626002eebdae68628d31db72',
  saved: '4482ac4eaedae72245fc36ef58242e412cba7fdaeee80322b4fa364845667d1e',
  journal: 'cb804269140603f3d426e027053304a593f453aa8ec8fd104cd607dcac423206',
} as const
export function runtime51Artifact(filename = RUNTIME_51.filename): URL {
  return new URL(`../fixtures/p14/genuine-projection51-runtime-c2rm/${filename}`, import.meta.url)
}
export function readRuntime51(): string {
  const gz = readFileSync(runtime51Artifact())
  expect(sha(gz), 'original outgoing51 compressed bytes').toBe(RUNTIME_51.gzip)
  const raw = gunzipSync(gz).toString('utf8')
  expect(sha(raw), 'original outgoing51 canonical bytes').toBe(RUNTIME_51.raw)
  return raw
}
const SCIENTIST_SAVES = {
  617: ['ce1ff03c6c23516fc356ae9f5ad595c49f2ff095b905e860ec3096e44177c3fe', 'f549047f4b99cae8b0a085aac043235d9ea2070f833a69a034da4b99416c4393'],
  618: ['d166d42cd47d36fdeec62e093bc008402e40f49ffe41b2bfc91c184c088d44d2', '6b144ae7ae1543a721773c14294a78e73dcb8468b842ca83487ffc8ad3a2b664'],
  669: ['a957c4a6d7d3c549a3e4e65c2a3268ec484deffc53592d17f82aa98cd10e0fb1', RUNTIME_51.saved],
  670: ['34f0ac18280f8e5fef2482e6e1dcc5c48f30a1ef10d3ca9eaece8699ece99861', RUNTIME_51.current],
} as const
export function scientistSnapshot(week: keyof typeof SCIENTIST_SAVES): GameState {
  const gz = readFileSync(runtime51Artifact(`genuine-v37-scientist-week${week}.json.gz`))
  expect(sha(gz)).toBe(SCIENTIST_SAVES[week][0])
  const raw = gunzipSync(gz).toString('utf8')
  expect(sha(raw)).toBe(SCIENTIST_SAVES[week][1])
  const state = validateSaveV37(JSON.parse(raw)).state
  expect(state.market.tick).toBe(week)
  return state
}
export const AXES = {
  gap: { fixture: 'genuine-v35-c2b-contract-gap-freeagent-expiry', personId: 'authored-0000',
    issuer: 'studio-d7df6c8e-player', announcement: 52, effective: 104, window: 92, decision: 98, term: 58 },
  exact: { fixture: 'genuine-v35-c2b-contract-at-effective-week', personId: 'authored-0000',
    issuer: 'studio-d2e9db93-player', announcement: 52, effective: 150, window: 138, decision: 150, term: 52 },
  rival: { fixture: 'genuine-v35-c2b-rival-incumbent-cohorts', personId: 'person-cohort-208-actor-1',
    issuer: 'studio-25969b11-r01', announcement: 2566, effective: 2704, window: 2692, decision: 2704, term: 52 },
} as const
const extensionCache = new Map<string, GameState>()
export function extensionWorld(axis: keyof typeof AXES = 'gap', atWeek = AXES[axis].window): GameState {
  const key = `${axis}:${atWeek}`
  if (!extensionCache.has(key)) {
    const facts = AXES[axis]
    const old = c2bFixture(facts.fixture)
    const live = migrateToLive(importSave(JSON.stringify({ saveVersion: 35, seed: old.seed,
      state: old, broadcastCache: old.broadcastItems }))).state
    expect(retirementRecordFor(live, facts.personId), 'genuine axis premise').toMatchObject({
      announcedWeek: facts.announcement, effectiveWeek: facts.effective, extensionUsed: false,
    })
    extensionCache.set(key, admitted(advanceTo(live, atWeek)))
  }
  return structuredClone(extensionCache.get(key)!)
}
