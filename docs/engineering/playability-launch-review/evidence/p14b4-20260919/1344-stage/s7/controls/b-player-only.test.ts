// 1344-s7 control (b): player-only saves are untouched by shelving. NOT RUN by the author.
// RUNBOOK.md copies it into both scratch trees as tests/zz-s7-player-only.test.ts, beside tests/zz-s7-lib.ts.
// Env: S7_RUN (required), S7_TREE (candidate|old, required), S7_WEEKS (default 52, the corpus year TICKS_PER_YEAR).
//
// "Player-only" here is a campaign with no rival industry (hollywood null), the M0A corpus control
// (hollywoodValidation.ts validateHollywood: "Explicit non-player corpus control"). Each route is the corpus loop of
// tests/acceptance-corpus.test.ts (runYear :86-93 with commitReadyPictures :43-55) on that file's replay seeds
// (`replay-bcast-${name}`, :421), so every path it runs is one the corpus already runs. NOTES.md item 9 lists the
// other reading (the player's own development inside a rival world), which s7.json `player` covers.
// Writes OUT_ROOT/<S7_RUN>/:
//   player-only.cmp.json  tree-independent: per-week digests of the key-sorted state, sha256 of the save exported as V42
//                         (candidate: exportSave(convertV43ToV42(makeSave(s))); old: exportSave(makeSave(s))).
//                         The two trees' files must be byte-identical (controls/check.py).
//   player-only.json      per tree: hollywood null every week; on the candidate, the V43 export differs from the V42
//                         export only in its saveVersion stamp.
import { it } from 'vitest'
import { applyActions, generateWorld, OracleAgent, RandomAgent, tick } from '../src/core/index.js'
import type { Agent, GameState } from '../src/core/index.js'
import * as saveModule from '../src/core/save.js'
import { digest, requireTree, runOutput, sha } from './zz-s7-lib.js'

const WEEKS = Number(process.env.S7_WEEKS ?? '52')

// tests/acceptance-corpus.test.ts:43-55, verbatim.
function commitReadyPictures(state: GameState): GameState {
  const committed = new Set(state.releaseAuthority.commitments.map((r) => r.productionId))
  const ready = state.studio.activeProductions.filter(
    (p) => p.remainingTicks === 1 && !committed.has(p.id),
  )
  if (ready.length === 0) return state
  return applyActions(
    state,
    ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
  )
}

it('s7 control b: player-only saves', () => {
  if (!Number.isInteger(WEEKS) || WEEKS < 1) throw new Error(`S7_WEEKS must be a positive integer, got "${process.env.S7_WEEKS}"`)
  const tree = requireTree()
  const out = runOutput()
  const toV42 = (saveModule as unknown as Record<string, unknown>).convertV43ToV42 as ((s: unknown) => unknown) | undefined
  const routes: [string, Agent][] = [['Oracle', OracleAgent], ['Random', RandomAgent]] // acceptance-corpus.test.ts:126-129
  const comparable: unknown[] = []
  const details: { route: string; seed: string; hollywoodNullEveryWeek: boolean; liveSaveVersion: number;
    liveExportSha256: string; liveDiffersFromV42OnlyInVersionStamp: boolean | null }[] = []
  for (const [name, agent] of routes) {
    const seed = `replay-bcast-${name}`
    let state = generateWorld(seed)
    let hollywoodNullEveryWeek = state.hollywood === null
    const weekly: string[] = []
    for (let t = 0; t < WEEKS; t++) { // runYear, acceptance-corpus.test.ts:88-92
      state = applyActions(state, agent.chooseActions(state))
      state = commitReadyPictures(state)
      state = tick(state)
      if (state.hollywood !== null) hollywoodNullEveryWeek = false
      weekly.push(digest(state))
    }
    const live = saveModule.makeSave(state)
    const asV42 = tree === 'candidate' ? toV42!(live) : live
    const v42Bytes = saveModule.exportSave(asV42 as Parameters<typeof saveModule.exportSave>[0])
    const liveBytes = saveModule.exportSave(live)
    // stableStringify sorts keys, so the envelope's own stamp is the first "saveVersion" in the export.
    const stamps = liveBytes.split('"saveVersion":43,').length - 1
    comparable.push({ route: name, seed, weeks: WEEKS, weekly, v42ExportSha256: sha(v42Bytes) })
    details.push({ route: name, seed, hollywoodNullEveryWeek, liveSaveVersion: live.saveVersion, liveExportSha256: sha(liveBytes),
      liveDiffersFromV42OnlyInVersionStamp: tree === 'candidate'
        ? stamps === 1 && liveBytes.replace('"saveVersion":43,', '"saveVersion":42,') === v42Bytes : null })
  }
  out.write('player-only.cmp.json', JSON.stringify({ routes: comparable }, null, 1) + '\n')
  out.write('player-only.json', JSON.stringify({ tree, weeks: WEEKS, routes: details }, null, 1) + '\n')
  const premise = details.filter((d) => !d.hollywoodNullEveryWeek).map((d) => d.route)
  if (premise.length > 0) throw new Error(`control b premise failed: ${premise.join(', ')} acquired a rival industry`)
}, 3_600_000)
