// ── P15B closure/v1 (record 1370-ar): the operating state ──────────────────────────────────────
// The Wave-4 closure contract §4: "operating loops filter P12's actual operating state, never merely the
// condition stage". This build derives that state from the actual closure records (REPORT narrow reading
// (d)2): a studio operates until its closure week. A leaf module (type imports only) so every operating
// loop (hollywoodTick, the talent market, the shared-market batch, the busy set) reads the one derivation
// without an import cycle through studioClosure.ts.
import type { GameState } from './types.js'

/** Every actually closed studio and its closure week. */
export function closedWeekOf(state: GameState): ReadonlyMap<string, number> {
  const root = (state as Partial<GameState>).studioClosure
  return new Map((root?.closures ?? []).map((c) => [c.studioId, c.closureWeek]))
}

/** Current49 absorption is a distinct terminal transaction, never a distress closure. */
export function absorbedWeekOf(state: GameState): ReadonlyMap<string, number> {
  return new Map(((state as Partial<GameState>).rights?.absorptions ?? []).map(a => [a.targetId, a.week]))
}
export function terminalWeekOf(state: GameState): ReadonlyMap<string, number> {
  return new Map([...closedWeekOf(state), ...absorbedWeekOf(state)])
}
export const isOperatingStudio = (state: GameState, studioId: string): boolean => !terminalWeekOf(state).has(studioId)
