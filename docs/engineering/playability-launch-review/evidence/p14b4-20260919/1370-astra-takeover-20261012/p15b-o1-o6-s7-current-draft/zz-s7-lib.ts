// Current final arm only: adaptation of1344 s7 lib. No synthetic control.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, realpathSync, writeFileSync, readFileSync, existsSync, lstatSync } from 'node:fs'
import { resolve, dirname, isAbsolute } from 'node:path'
import * as saveModule from '../src/core/save.js'
import type { GameState } from '../src/core/index.js'
export const OUT_ROOT = '/Users/zacheryspector/studio-scratch/1363-measurement-prep/runs'
export const canon = (value: unknown): string => saveModule.stableStringify(value)
export const sha = (text: string | Buffer): string => createHash('sha256').update(text).digest('hex')
export const digest = (value: unknown): string => sha(canon(value)).slice(0, 16)
export type Business = NonNullable<GameState['hollywood']>['businesses'][number]
export type Shelving = Business['screenplayShelving']
export const shelvingOf = (b: Business): Shelving => b.screenplayShelving
// Historical compatibility diagnostic only, NEVER a persisted control arm.
export function stripShelving(state: GameState): unknown {
  const h = state.hollywood
  if (h === null) return state
  return { ...state, hollywood: { ...h, businesses: h.businesses.map(b => {
    const { screenplayShelving: _drop, ...rest } = b
    return rest
  }) } }
}
export function requireTree(): 'final-current' {
  if (process.env.S7_TREE !== 'final-current') throw new Error('Only explicitly frozen final-current arm allowed')
  if (process.env.S7_SEED !== 'p13a-core-causal-01' || process.env.S7_WEEKS !== '520')
    throw new Error('First tranche fixes p13a-core-causal-01 and520; no route search')
  const root = process.cwd(), manifestPath = process.env.S7_SOURCE_MANIFEST
  const pin = process.env.S7_SOURCE_MANIFEST_SHA256, head = process.env.S7_EXPECTED_HEAD
  if (!manifestPath || !isAbsolute(manifestPath) || !pin?.match(/^[a-f0-9]{64}$/) || !head?.match(/^[a-f0-9]{40}$/))
    throw new Error('Require absolute reviewed source manifest, exact SHA256 and HEAD')
  const raw = readFileSync(manifestPath)
  if (sha(raw) !== pin) throw new Error('source manifest bytes changed')
  const manifest = JSON.parse(raw.toString()) as { arm: string; head: string; liveSaveVersion: number; candidateSourceIdentity:string; candidateFiles:Record<string,string>; files: Record<string,string> }
  if (manifest.arm !== 'final-current' || manifest.head !== head || manifest.liveSaveVersion !== 48)
    throw new Error('manifest arm/head/current save era mismatch')
  if (manifest.candidateSourceIdentity !== process.env.S7_CANDIDATE_SOURCE_ID || sha(canon(manifest.candidateFiles)) !== manifest.candidateSourceIdentity) throw new Error('candidate source identity mismatch')
  if (process.version !== 'v20.20.2') throw new Error('reviewed Node20.20.2 required')
  if (execFileSync('git', ['rev-parse','HEAD'], { encoding:'utf8' }).trim() !== head) throw new Error('HEAD mismatch')
  // Cover all runtime source/generated inputs, including staged and untracked files.
  const tracked = execFileSync('git', ['ls-files','-z','--cached','--others','--exclude-standard'], { encoding:'utf8' }).split('\0').filter(Boolean)
  const required = tracked.filter(p => p.startsWith('src/') || p.startsWith('generated/') ||
    ['package.json','package-lock.json','vitest.config.ts','vitest.workspace.ts','tests/zz-s7-lib.ts',
     'tests/zz-s7-natural-route.test.ts','tests/zz-s7-decide-diag.test.ts'].includes(p))
  for (const path of required) if (!(path in manifest.files)) throw new Error(`manifest lacks runtime input ${path}`)
  const observerBase = '393ad2d92c51889633804ac5a0144d1993f75f3644be4d9694f45266030a93b9', observerPatched = '52b07bd0bd2fd8e68b002416240c64bad65ce9887ac29925956dcbcbe3fd56f7'
  for (const path of required.filter(p=>p.startsWith('src/')||p.startsWith('generated/'))) {
    const clean = manifest.candidateFiles[path], actual = manifest.files[path]
    if (!clean || (actual!==clean && !(path==='src/core/hollywoodTick.ts' && clean===observerBase && actual===observerPatched)))
      throw new Error(`unreviewed source difference ${path}`)
  }
  const mode=process.env.S7_OBSERVER_MODE
  if ((mode!=='clean'&&mode!=='decide') || manifest.files['src/core/hollywoodTick.ts'] !== (mode==='clean'?observerBase:observerPatched)) throw new Error('exact clean/observed source mode mismatch')
  for (const [path, expected] of Object.entries(manifest.files)) {
    const full = resolve(root,path)
    if (isAbsolute(path) || !full.startsWith(root+'/') || !expected.match(/^[a-f0-9]{64}$/)) throw new Error('unsafe manifest member')
    if (realpathSync(full) !== full || sha(readFileSync(full)) !== expected) throw new Error(`source input drift ${path}`)
  }
  if (saveModule.LIVE_SAVE_VERSION !== 48) throw new Error('wrong actual live validator era')
  return 'final-current'
}
export function runOutput() {
  const run = process.env.S7_RUN ?? ''
  if (!/^[a-z0-9][a-z0-9.-]*$/.test(run)) throw new Error('S7_RUN requires a fresh exclusive leaf')
  // Refuse symlink ancestry before creating anything.
  let ancestor = OUT_ROOT
  while (!existsSync(ancestor)) ancestor = dirname(ancestor)
  if (realpathSync(ancestor) !== ancestor || !lstatSync(ancestor).isDirectory()) throw new Error('unsafe output ancestor')
  mkdirSync(OUT_ROOT,{recursive:true})
  if (realpathSync(OUT_ROOT) !== OUT_ROOT) throw new Error('unsafe output root')
  const dir = resolve(OUT_ROOT,run)
  mkdirSync(dir)
  return { dir, write: (name: string,text: string) => {
    if (!/^[a-z0-9][a-z0-9.-]*$/.test(name)) throw new Error('unsafe output basename')
    writeFileSync(resolve(dir,name),text,{flag:'wx'})
  } }
}
