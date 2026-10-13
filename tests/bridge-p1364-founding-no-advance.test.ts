// ── 1364-A §5 item 9: no new access. The bridge's founding snapshot emits no advanceWeek while a
// draft is open (1364-R §2.3), and sign/found stay available; the browser adapter's import boundary
// returns a typed failure and keeps its input (1364-A §4). Bridge/UI imports live in this
// `bridge-*` file, outside the core tsconfig.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BridgeSession, createManagedBridgeState } from '../bridge/session.ts'
import { exportSaveJson, importSaveJson } from '../ui/src/engine/adapter.ts'
import { beginFounding } from '../src/core/employment.js'
import { LIVE_SAVE_VERSION } from '../src/core/save.js'
import { validateLiveSave } from './helpers/live-era.js'
import { generateWorld } from '../src/core/worldgen.js'
import type { GameState } from '../src/core/types.js'

/** Every non-test source line under `roots` that calls a founding opener. */
function openerCalls(roots: string[]): string[] {
  const found: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) { if (entry.name !== 'test' && entry.name !== 'node_modules') walk(path); continue }
      if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) continue
      for (const line of readFileSync(path, 'utf8').split('\n')) if (/\bbeginFounding\w*\(/.test(line) && !/^\s*(\/\/|\*)/.test(line)) found.push(`${path}: ${line.trim()}`)
    }
  }
  for (const root of roots) walk(root)
  return found
}
const SECOND_GRANT = /^beginFounding: the player studio has already founded; a founded campaign never opens a second founding draft or receives a second founding grant$/
const landmarks = (state: GameState): number[] => state.studioHistory.rows.filter((row) => row.kind === 'studioFounded').map((row) => row.week)

describe('1364 no new access (bridge and adapter boundaries)', () => {
  it('founding-no-new-access: the bridge founding snapshot emits no advanceWeek; signFoundingContract stays available', () => {
    const session = BridgeSession.createRuntime()
    expect(session.gameState.founding).not.toBeNull()
    const kinds = new Set(session.snapshot().availableIntents.map((intent) => intent.kind))
    expect(kinds.has('advanceWeek')).toBe(false)
    expect(kinds.has('signFoundingContract')).toBe(true)
  })

  it('founding-import-boundary: malformed input is a typed failure at importSaveJson, never a throw', () => {
    const outcome = importSaveJson(`{"saveVersion": ${LIVE_SAVE_VERSION}, "seed": "x", "state": {}, "broadcastCache": []}`)
    expect(outcome.ok).toBe(false)
    // 1370-ar r2: the live reader labels its refusals by its own name (validateSaveP15B at Save48), read from the helper.
    if (!outcome.ok) expect(outcome.error).toMatch(new RegExp(`^${validateLiveSave.name}:`))
  })

  it('founding-first-founding-supported-surfaces: R-D (2): the browser adapter and the Bridge open a founding only through newGame over a fresh generateWorld, a campaign that never engaged; each still signs and founds that first founding, which saves, reloads and then refuses a second', () => {
    // Reachability (R-D (3)): the one opener call on either supported surface.
    expect(openerCalls(['ui/src', 'bridge'])).toEqual(['ui/src/engine/adapter.ts: return beginFounding(generateWorld(seed, options))'])
    expect(generateWorld('p1364-r6-surfaces-01').economyEngagedEver, 'premise: newGame opens over a never-engaged world').toBe(false)
    // The browser adapter: newGame, the public applicant offers, foundManagedStudioAction (the bridge's managed path).
    const adapterFounded = createManagedBridgeState('p1364-r6-surfaces-01')
    // The Bridge protocol: a fresh runtime's founding intents, then foundStudio.
    const session = BridgeSession.createRuntime()
    for (let guard = 0; guard < 16; guard++) {
      const intents = session.snapshot().availableIntents
      const intent = intents.find((option) => option.kind === 'foundStudio') ?? intents.find((option) => option.kind === 'signFoundingContract')
      if (intent === undefined) throw new Error('premise: the founding snapshot offers a contract or the founding')
      const accepted = session.command({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: `r6-found-${String(guard)}`,
        expectedStateRevision: session.stateRevision, type: 'submitIntent', payload: { intentId: intent.intentId } })
      expect(accepted, intent.kind).toMatchObject({ accepted: true })
      if (intent.kind === 'foundStudio') break
    }
    for (const [surface, founded] of [['adapter', adapterFounded], ['bridge', session.gameState]] as const) {
      expect([founded.founding, founded.market.tick, landmarks(founded)], surface).toEqual([null, 0, [0]])
      const reloaded = importSaveJson(exportSaveJson(founded))
      expect(reloaded.ok, surface).toBe(true)
      expect(() => beginFounding(founded), surface).toThrow(SECOND_GRANT)
    }
  })
})
