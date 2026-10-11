// Install at tests/helpers/p15c2-frozen-v2-mint.ts before the recorded mint.
// Run from the accepted clean Save45 repo with vite-node --script, final args:
// <full expected HEAD> <absolute NEW scratch artifact directory outside repo>.
// This producer is never imported by a test and never overwrites a fixture.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { gzipSync } from 'node:zlib'
import { exportSave, LIVE_SAVE_VERSION, makeSave, stableStringify, validateSaveV45 } from '../../src/core/save.js'
import { TECHNOLOGY_CATALOGUE } from '../../src/core/technologyCatalogue.js'
import { routeAt, ROUTE_SEED } from './p15c2-route-l.js'

const [expectedHead, outputArg] = process.argv.slice(-2)
if (expectedHead === undefined || !/^[0-9a-f]{40}$/.test(expectedHead) || outputArg === undefined || !isAbsolute(outputArg)) {
  throw new Error('1361-F6 mint: final arguments must be full expected HEAD and a new absolute scratch directory')
}
const root = realpathSync(process.cwd())
const output = resolve(realpathSync(dirname(outputArg)), basename(outputArg))
const outputRelative = relative(root, output)
if (outputRelative !== '..' && !outputRelative.startsWith('../')) throw new Error('1361-F6 mint: artifact directory must be outside the repository')
const git = (...args: string[]): string => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
if (realpathSync(git('rev-parse', '--show-toplevel')) !== root) throw new Error('1361-F6 mint: run from the repository top level')
for (const path of ['tests/helpers/p15c2-route-l.ts', 'tests/helpers/p15c2-frozen-v2-mint.ts']) {
  git('ls-files', '--error-unmatch', '--', path)
}
if (git('rev-parse', 'HEAD') !== expectedHead) throw new Error('1361-F6 mint: source HEAD differs from accepted landed source')
if (git('status', '--porcelain', '--untracked-files=no') !== '') throw new Error('1361-F6 mint: tracked source must be clean')
if (Number(LIVE_SAVE_VERSION) !== 45) throw new Error('1361-F6 mint: freeze must be captured at the landed Save45 writer before later migrations')
if (JSON.stringify(TECHNOLOGY_CATALOGUE.map(({ id, commercialWeek }) => [id, commercialWeek])) !== JSON.stringify([
  ['lighting-control-01', 936], ['synchronized-sound', 416],
])) throw new Error('1361-F6 mint: catalogue changed before its required replay pin')

const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const started = performance.now()
const state = routeAt(6240) // Actual natural route and actual tick freeze; no edits to state.
if (state.market.tick !== 6240 || state.founding !== null || state.hollywood === null || state.campaignLegacy.official?.definition !== 'campaign-legacy/v2') {
  throw new Error('1361-F6 mint: route did not produce a genuinely frozen v2 Legacy at week 6240')
}
const routed = performance.now()
const save = makeSave(state)
validateSaveV45(save)
const raw = Buffer.from(exportSave(save), 'utf8')
const compressed = gzipSync(raw, { level: 9 })
const elapsedMs = performance.now() - started
if (elapsedMs > 210_000) throw new Error('1361-F6 mint: exceeded combined established route and fixture budgets (210000 ms)')
if (git('rev-parse', 'HEAD') !== expectedHead || git('status', '--porcelain', '--untracked-files=no') !== '') {
  throw new Error('1361-F6 mint: source changed during generation')
}
const name = 'route-l-week-6240.save45.json.gz'
const manifest = {
  format: 'p15c-frozen-v2-capture/v1',
  sourceHead: expectedHead,
  routeSeed: ROUTE_SEED,
  sourceSaveVersion: 45,
  week: 6240,
  definition: 'campaign-legacy/v2',
  route: 'generateWorld; natural route L; historical-control founding before migration-origin industry; actual tick to 6240',
  capture: { name, compressedBytes: compressed.byteLength, compressedSha256: sha256(compressed), bytes: raw.byteLength, sha256: sha256(raw) },
  officialSha256: sha256(stableStringify(state.campaignLegacy.official)),
  sourceFiles: Object.fromEntries([
    'src/core/campaignLegacy.ts', 'src/core/technologyCatalogue.ts', 'src/core/save.ts',
    'tests/helpers/p15c2-route-l.ts', 'tests/helpers/p15c2-frozen-v2-mint.ts',
  ].map((path) => [path, sha256(readFileSync(resolve(root, path)))])),
  timings: { routeMs: routed - started, totalMs: elapsedMs },
}
mkdirSync(output) // Exclusive new directory: a previous capture can never be replaced.
writeFileSync(resolve(output, name), compressed, { flag: 'wx' })
writeFileSync(resolve(output, 'MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' })
process.stdout.write(`${JSON.stringify(manifest)}\n`)
