// Source-only historical engine loader; no fixture input and no current gameplay.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

export const HISTORICAL_HEADS = {
  26: 'ce6945d58257f70c1b222a8c00e06038db73f6e4',
  45: '2eaa697effc38538c37da28b486786ce267a2284',
} as const
export const sha256 = (v: string | Uint8Array) => createHash('sha256').update(v).digest('hex')
export function requireFact(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message)
}
export function ordinaryPath(path: string): string {
  requireFact(isAbsolute(path), 'absolute path required')
  let cursor = resolve(path)
  for (;;) {
    requireFact(!lstatSync(cursor).isSymbolicLink(), `symlink refused: ${cursor}`)
    const parent = dirname(cursor)
    if (parent === cursor) break
    cursor = parent
  }
  requireFact(realpathSync(path) === resolve(path), 'canonical path required')
  return resolve(path)
}
export function archivedInventory(repo: string, root: string, head: string) {
  ordinaryPath(repo); ordinaryPath(root)
  requireFact(lstatSync(root).isDirectory(), 'archive directory required')
  requireFact(root !== repo && !root.startsWith(repo + sep) && !repo.startsWith(root + sep), 'archive/repo overlap')
  const listed = execFileSync('git', ['ls-tree', '-r', '-z', head, '--', 'src'], { cwd: repo, encoding: 'utf8' })
    .split('\0').filter(Boolean)
  const rows = listed.map(row => {
    const match = /^100644 blob ([0-9a-f]{40})\t(src\/.+)$/.exec(row)
    requireFact(match, `unexpected original source kind: ${row}`)
    const gitBlob = match[1]!, path = match[2]!
    const file = join(root, path)
    ordinaryPath(file)
    requireFact(lstatSync(file).isFile(), 'ordinary archived source file required')
    const bytes = readFileSync(file)
    requireFact(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') === gitBlob, `archive bytes differ: ${path}`)
    return { path, gitBlob, sha256: sha256(bytes) }
  })
  const actual: string[] = []
  function walk(dir: string): void {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name), stat = lstatSync(path)
      requireFact(!stat.isSymbolicLink(), 'archive source symlink refused')
      if (stat.isDirectory()) walk(path)
      else { requireFact(stat.isFile(), 'archive special file refused'); actual.push(relative(root, path)) }
    }
  }
  walk(join(root, 'src'))
  requireFact(JSON.stringify(actual.sort()) === JSON.stringify(rows.map(r => r.path).sort()), 'archive inventory differs')
  return { head, root, rows, sha256: sha256(JSON.stringify(rows)) }
}
export type ArchivedEngine = {
  save: { LIVE_SAVE_VERSION: number; makeSave(s: unknown): unknown; exportSave(v: unknown): string;
    importSave(v: string): unknown; stableStringify(v: unknown): string; [key: string]: unknown }
  genesis(seed: string): unknown
  tick(s: unknown, options: { develop: true }): unknown
}
export async function loadArchivedEngine(repo: string, root: string, version: 26 | 45, pin: string) {
  const pre = archivedInventory(repo, root, HISTORICAL_HEADS[version])
  requireFact(pre.sha256 === pin, 'independently recorded archive pin differs')
  const base = '/@fs/' + root + '/src/'
  const save = await import(/* @vite-ignore */ base + 'core/save.ts') as ArchivedEngine['save']
  const fixture = await import(/* @vite-ignore */ base + 'harness/p13a/fixtures.ts') as { p13aGeneratedStudio: ArchivedEngine['genesis'] }
  const clock = await import(/* @vite-ignore */ base + 'core/tick.ts') as { tick: ArchivedEngine['tick'] }
  requireFact(save.LIVE_SAVE_VERSION === version, 'wrong archived writer era')
  return { save, genesis: fixture.p13aGeneratedStudio, tick: clock.tick, pre,
    postflight() { const post = archivedInventory(repo, root, HISTORICAL_HEADS[version]); requireFact(JSON.stringify(post) === JSON.stringify(pre), 'archive postflight differs'); return post } }
}
