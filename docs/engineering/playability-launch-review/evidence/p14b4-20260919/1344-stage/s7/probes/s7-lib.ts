// 1344-s7 §7 verification kit: helpers shared by the probes and by control (b). NOT RUN by the author.
// RUNBOOK.md step 4 copies this file into a scratch tree as tests/zz-s7-lib.ts. It is not a test file
// (vitest collects tests/**/*.test.ts only). Public exports only. Every write goes to OUT_ROOT/<S7_RUN>/<name>;
// any other path throws, an existing run directory or file is never overwritten.
import { createHash } from 'node:crypto'
import { mkdirSync, realpathSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as saveModule from '../src/core/save.js'
import type { GameState } from '../src/core/index.js'

export const OUT_ROOT = '/Users/zacheryspector/studio-scratch/1344-s7/out'

/** Key-sorted JSON (save.ts stableStringify), the form a save stores: -0 is written as 0 (1344-X6). */
export const canon = (value: unknown): string => saveModule.stableStringify(value)
export const sha = (text: string): string => createHash('sha256').update(text).digest('hex')
/** First 16 hex characters of the sha256 of the key-sorted JSON; used only for equality across runs and trees. */
export const digest = (value: unknown): string => sha(canon(value)).slice(0, 16)

export type Shelving = {
  version: 1
  rejections: { ordinal: number; count: number }[]
  shelved: { ordinal: number; week: number; retryWeek: number }[]
  commissionHoldUntilWeek: number
}
export type Business = NonNullable<GameState['hollywood']>['businesses'][number]
/** The Save43 field (hollywoodTypes.ts:97-119), or undefined on a source without the law (the old tree). */
export const shelvingOf = (b: Business): Shelving | undefined =>
  (b as unknown as { screenplayShelving?: Shelving }).screenplayShelving

/** The state with `screenplayShelving` deleted from every rival business (1344-F Amendment 2, 1344-F3 ruling 4).
 * Returns new objects; the live state is untouched. */
export function stripShelving(state: GameState): unknown {
  const h = state.hollywood
  if (h === null) return state
  return { ...state, hollywood: { ...h, businesses: h.businesses.map((b) => {
    const { screenplayShelving: _dropped, ...rest } = b as unknown as Record<string, unknown>
    return rest
  }) } }
}

/** S7_TREE must name the tree and agree with the source: the candidate writes Save43 and has convertV43ToV42,
 * the old tree (ff803032) does not. A mislabelled run throws before it measures anything. */
export function requireTree(): 'candidate' | 'old' {
  const tree = process.env.S7_TREE
  if (tree !== 'candidate' && tree !== 'old') throw new Error(`S7_TREE must be candidate or old, got "${tree}"`)
  const hasV43 = typeof (saveModule as unknown as Record<string, unknown>).convertV43ToV42 === 'function'
  if ((tree === 'candidate') !== hasV43) throw new Error(`S7_TREE=${tree}, but this source ${hasV43 ? 'has' : 'lacks'} Save43`)
  return tree
}

/** Creates OUT_ROOT/<S7_RUN>/ and returns a writer confined to it. */
export function runOutput(): { dir: string; write: (name: string, text: string) => void } {
  const run = process.env.S7_RUN ?? ''
  if (!/^[a-z0-9][a-z0-9.-]*$/.test(run)) throw new Error(`S7_RUN must be a run directory name matching [a-z0-9][a-z0-9.-]*, got "${run}"`)
  mkdirSync(OUT_ROOT, { recursive: true })
  if (realpathSync(OUT_ROOT) !== OUT_ROOT) throw new Error(`${OUT_ROOT} resolves to ${realpathSync(OUT_ROOT)}; refusing to write through a link`)
  const dir = resolve(OUT_ROOT, run)
  if (!dir.startsWith(OUT_ROOT + '/')) throw new Error(`output directory outside ${OUT_ROOT}: ${dir}`)
  mkdirSync(dir) // EEXIST on a second use of a run name: a run is never overwritten
  if (realpathSync(dir) !== dir) throw new Error(`run directory resolves elsewhere: ${dir}`)
  return {
    dir,
    write: (name, text) => {
      const file = resolve(dir, name)
      if (name.includes('/') || !file.startsWith(dir + '/')) throw new Error(`output file outside ${dir}: ${name}`)
      writeFileSync(file, text, { flag: 'wx' })
    },
  }
}
