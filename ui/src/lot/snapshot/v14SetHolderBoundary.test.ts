// ── C2a-M2 — the two places the V14 bump left the UI unable to speak ─────────
//
// Both of these were compile failures, and both of them were also LIES waiting to be
// told to a player. They are pinned here together because they are one fact from two
// sides: the engine grew sets, and the boundary that hands the engine to the lot had
// not been told.
//
//   1. THE SAVE PATH. `importSaveJson` stopped at `migrateToV13`, so a loaded save was
//      a V13 state wearing the V14 type. The UI package did not compile; had it, the
//      state would have carried no `sets` and no `studioEvents` root at all and the
//      first C2a reader to touch one would have thrown. The migrator is `migrateToV14`.
//
//   2. THE SET HOLDER. A set holds two things — the MOUNT on the stage it stands on,
//      and a scenery slot while it is being built or repaired — so a stage or a shop
//      the player tries to move or take down can be blocked by a set. The lot's mirror
//      of the engine's engagement kind did not carry `'set'`, and the refusal sentence
//      had no words for one: it would have degraded to "reserved by current studio
//      work", which is true, useless, and hides the one remedy the player owns.

import { describe, expect, it } from 'vitest'
import {
  exportSaveJson,
  importSaveJson,
  newGame,
  studioLotSnapshot,
  type GameState,
} from '../../engine/adapter.ts'
import {
  LOT_SET_ENGAGEMENT_SENTENCE,
  facilityMutationBlockedReason,
} from '../facilityMutation.ts'

function activatedStudio(): GameState {
  // The managed regime is what owns sets at all; a legacy world has none, which is
  // exactly why the snapshot omits the root there rather than claiming an empty one.
  const fresh = newGame('v14-set-holder-boundary')
  return fresh
}

describe('C2a-M2 — a save round-trips as V15, roots and all', () => {
  it('exports V15 and imports it back with the four C2a roots intact', () => {
    const state = activatedStudio()
    const json = exportSaveJson(state)
    // P06A W1/W2: the live save version is V16 (releaseAuthority root); a fresh
    // makeSave/export is current, not a conversion, and pins to 16 here.
    expect(JSON.parse(json).saveVersion).toBe(18)

    const outcome = importSaveJson(json)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    // A CURRENT save is not a conversion — the player is told nothing about upgrading.
    expect(outcome.converted).toBe(false)
    // The four C2a roots exist on the imported state. Before the repair the import
    // produced a V13 state, so every one of these was `undefined`.
    expect(Array.isArray(outcome.state.sets)).toBe(true)
    expect(typeof outcome.state.nextSetId).toBe('number')
    expect(Array.isArray(outcome.state.productionQueue)).toBe(true)
    expect(Array.isArray(outcome.state.studioEvents.rows)).toBe(true)
    expect(typeof outcome.state.studioEvents.nextSeq).toBe('number')
  })

  it('an imported save can still be projected onto the lot', () => {
    // The end of the same chain: the snapshot selector reads `state.sets`, so an
    // import that dropped the root would have thrown here rather than silently.
    const outcome = importSaveJson(exportSaveJson(activatedStudio()))
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(() => studioLotSnapshot(outcome.state)).not.toThrow()
  })
})

describe('C2a-M2 — a set standing in the way says so, and says what to do', () => {
  const blockedBy = (activity: string): string | null =>
    facilityMutationBlockedReason('Soundstage 3', {
      code: 'facilityEngaged' as const,
      // A set never resolves a title through the Studio Calendar, so `null` here is
      // the REAL shape of this refusal, not a degraded one.
      holders: [{ kind: 'set' as const, holderId: 'set-4', activity, title: null }],
    })

  it('names the hold and the remedy for all three engine phrases', () => {
    expect(blockedBy('a set standing on this stage')).toBe(
      'Soundstage 3 has a set standing on it. Strike the set before moving or taking down the stage.',
    )
    expect(blockedBy('a set going up on this stage')).toBe(
      'Soundstage 3 has a set going up on it. Moving or taking down the stage opens up once that work finishes and the set is struck.',
    )
    expect(
      facilityMutationBlockedReason('Scenery Shop', {
        code: 'facilityEngaged' as const,
        holders: [{ kind: 'set' as const, holderId: 'set-4', activity: 'building a set', title: null }],
      }),
    ).toBe(
      'Scenery Shop has a scenery crew building a set. Moving or taking it down opens up once that work finishes.',
    )
  })

  it('every sentence is a whole sentence, and none of them prints an id', () => {
    for (const clause of Object.values(LOT_SET_ENGAGEMENT_SENTENCE)) {
      expect(clause.endsWith('.')).toBe(true)
      expect(clause).not.toMatch(/set-\d|facility-|_/)
    }
  })

  it('a phrase the table has not been taught degrades rather than promising a remedy', () => {
    // Honest degradation: the generic sentence, never an invented remedy.
    expect(blockedBy('doing something nobody has authored')).toBe(
      'Soundstage 3 is reserved by current studio work.',
    )
  })
})
