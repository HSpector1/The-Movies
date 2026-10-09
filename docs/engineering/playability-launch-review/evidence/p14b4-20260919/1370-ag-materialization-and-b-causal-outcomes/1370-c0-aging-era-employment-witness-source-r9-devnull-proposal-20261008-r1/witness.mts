// UNRUN proposal. Invoke only after binding is filled and independently accepted.
import { createHash } from 'node:crypto'
import { readFileSync, realpathSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { observeLedger, SOURCE } from './witness-core.mjs'
import { worktreeFile } from './worktree-guard.mjs'
import { validateBoundsRoles } from './bounds-guard.mjs'

const fail = (name: string): never => { throw new Error(`STOP_${name}`) }
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
const git = (root: string, ...args: string[]) => execFileSync('git', args, {
  cwd: root, encoding: 'utf8', timeout: 15_000, maxBuffer: 1024 * 1024,
}).trim()
const blobPins = {
  'src/core/aging.ts': 'e1b88562ded631e0142b2783555e866d4a884d04',
  'src/core/employment.ts': 'e8e5acaa1e6a94ac1de7db13eb46840efb55616f',
  'src/core/hollywood.ts': '377da502bcfa55afe31c243ab0909b2c0012d269',
  'src/core/worldgen.ts': '94f83a85e1e59532013ab4735f73a67a916a5332',
  'src/core/tick.ts': '328c2e28f7e209b4ab6b96c6e59f1d1739ad0db5',
  'src/harness/p13a/fixtures.ts': '9ab3eee75b0b2b2733f350bbc3964aa5ba176de8',
  'tests/bridge-p14b5-relationships.test.ts': '0815114340a983348eae6e98c33843c32c297228',
  'tests/fixtures/p13a/accepted-v19.json.gz': 'a987ecc4411c48fc8f256e81c93e9abf1fd61d6c',
} as const
const runtimePaths = [
  'package.json', 'package-lock.json',
  'node_modules/vite/package.json', 'node_modules/vite-node/package.json',
  'node_modules/vite-node/vite-node.mjs',
] as const
function sourceGuard(root: string, thisDir: string, binding: any) {
  if (binding.nodeVersion !== process.version ||
      binding.nodeExecPath !== realpathSync(process.execPath)) fail('NODE_IDENTITY')
  if (git(root, 'rev-parse', 'HEAD') !== SOURCE ||
      git(root, 'status', '--porcelain=v1', '--untracked-files=all') !== '') fail('SOURCE_DIRTY_OR_WRONG')
  const worktreeSha256: Record<string, string> = {}
  for (const [path, blob] of Object.entries(blobPins)) {
    if (git(root, 'rev-parse', `HEAD:${path}`) !== blob) fail('SOURCE_BLOB')
    worktreeSha256[path] = worktreeFile(root, path, blob, binding.worktreeSha256[path])
  }
  const observerPaths = ['witness-core.mjs', 'worktree-guard.mjs', 'bounds-guard.mjs', 'witness.mts', 'supervise.py', 'outer-recorder.py', 'POLICY.sb'] as const
  for (const path of observerPaths) {
    if (sha(readFileSync(join(thisDir, path))) !== binding.observerSha256[path]) fail('OBSERVER_PIN')
  }
  const runtime = Object.fromEntries(runtimePaths.map(path => [path, sha(readFileSync(join(root, path)))]))
  for (const path of runtimePaths) if (runtime[path] !== binding.runtimeSha256[path]) fail('RUNTIME_PIN')
  const amendments = [validateBoundsRoles(binding.boundsAmendment, binding.parentBoundsAdoption)]
  return { head: SOURCE, blobs: blobPins, worktreeSha256, observer: binding.observerSha256, runtime,
    amendments, node: process.version, execPath: realpathSync(process.execPath) }
}

async function main() {
  if (process.argv.length !== 3) fail('BINDING_ARGV')
  const bindingPath = resolve(process.argv[2]!)
  const binding = JSON.parse(readFileSync(bindingPath, 'utf8'))
  if (binding.status !== 'REVIEWED_FILLED_UNRUN' || binding.sourceSha !== SOURCE ||
      !binding.observerSha256 || !binding.runtimeSha256 || !binding.worktreeSha256 ||
      !binding.boundsAmendment || !binding.parentBoundsAdoption) fail('UNFILLED_OR_UNREVIEWED')
  const thisDir = dirname(new URL(import.meta.url).pathname)
  const root = realpathSync(resolve(binding.repoRoot))
  const preflight = sourceGuard(root, thisDir, binding)
  if (binding.outputProtocol !== 'single-bounded-stdout-frame-no-files') fail('OUTPUT_PROTOCOL')
  // Only now may the pinned game modules load. The observer itself has no game rules.
  const fixture = await import(pathToFileURL(join(root, 'src/harness/p13a/fixtures.ts')).href)
  const engine = await import(pathToFileURL(join(root, 'src/core/tick.ts')).href)
  const started = Date.now()
  const result = observeLedger(fixture.p13aGeneratedStudio, engine.tick)
  const postflight = sourceGuard(root, thisDir, binding)
  const frame = {
    status: 'MATCHED_AGING_ERA_PREIMAGE_CANDIDATE', protocol: 'single-bounded-stdout-frame-no-files',
    sourceSha: SOURCE, seed: 'p13a-core-causal-01', weeks: 416,
    sourceBlobs: blobPins, worktreeSha256: preflight.worktreeSha256, preflight, postflight,
    boundsAmendment: binding.boundsAmendment, parentBoundsAdoption: binding.parentBoundsAdoption,
    firstQuote: result.firstQuote, employmentBytes: result.employmentBytes.length,
    employmentRows: result.rows, digests: result.digests, elapsedMs: Date.now() - started,
    node: process.version, preimageBase64: result.employmentBytes.toString('base64'),
  }
  Object.assign(frame, { finalflight: sourceGuard(root, thisDir, binding) })
  const bytes = Buffer.from(JSON.stringify(frame) + '\n', 'utf8')
  if (bytes.length > 512 * 1024) fail('STDOUT_CAP')
  process.stdout.write(bytes)
}
main().catch(error => { process.stderr.write(String(error?.stack ?? error) + '\n'); process.exitCode = 2 })
