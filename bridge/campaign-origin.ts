import type {GameState} from '../src/core/types.js'

/** Storage copies may have different session IDs and weeks, but retain one world origin. */
export function sameNativeCampaignOrigin(a:GameState,b:GameState):boolean {
  return a.hollywood!==null && b.hollywood!==null && a.seed===b.seed &&
    a.hollywood.worldId===b.hollywood.worldId && a.hollywood.playerStudioId===b.hollywood.playerStudioId
}
