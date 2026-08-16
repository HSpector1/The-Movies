// The roster wall's immutable Week-196 entry artifacts are SaveFileV11 BYTES and
// stay that way: every pinned save hash, state hash, and byte-identity proof in
// this observatory is a V11 fact, and re-making a V11 envelope from a live state
// whose placement root is empty still produces exactly those bytes.
//
// The live engine, however, is SaveFileV12. A state read back out of one of those
// pinned artifacts therefore crosses the ordinary documented load-to-play
// conversion before it re-enters the simulation — which, for a placement-free
// history, only adds the empty placement root that history implies. Nothing is
// invented and no pinned byte moves.

import { convertV11ToV12 } from '../../core/index.js'
import type { GameState, SaveFileV11 } from '../../core/index.js'

export function rosterWallLiveState(save: SaveFileV11): GameState {
  return convertV11ToV12(save).state
}
