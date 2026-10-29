// Sprint 14 item 4 (ENTRY.md): natural rival recovery and closure on the current tree, 1363-A §6.1 natural routes.
// p13a-core-causal-01 and seed-b come from campaign-measure.ts (the same route, one pass); this script runs the rest:
// p15a1-w2-market-01 (the low-market case) to 6240 and the two remaining §6.1 natural 520-week seeds.
// Copy with measure-lib.ts into the snapshot worktree root, then from that root:
//   RIVAL_OUTPUT=<empty dir> MEASURE_SOURCE_HEAD=<HEAD> node node_modules/vite-node/vite-node.mjs rival-recovery-measure.ts
// Optional RIVAL_ROUTES="seed:horizon,..." replaces the default list (e.g. p13a-wait-control-01:6240, a 1357-P seed).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { LIVE_SAVE_VERSION } from './src/core/save.ts'
import { ROUTE_ACTIONS, measureSeed, need, outputDir, sha, sourceHead, writeJson } from './measure-lib.ts'

need(LIVE_SAVE_VERSION === 51, `expected the Save51 era, found ${LIVE_SAVE_VERSION}`)
const out = outputDir('RIVAL_OUTPUT'), head = sourceHead(), started = performance.now()
const spec = process.env.RIVAL_ROUTES ?? 'p15a1-w2-market-01:6240,p13b-s8-bridge-probe-01:520,p13-public-commercial-adoption:520'
const ROUTES = spec.split(',').map(item => {
  const [seed, weeks] = item.split(':'), horizon = Number(weeks)
  need(seed !== undefined && /^[a-z0-9-]+$/.test(seed) && [520, 6240].includes(horizon), `RIVAL_ROUTES item "${item}" must be seed:520 or seed:6240`)
  return { seed, horizon }
})
// Charter §6.3 (d), two runs agree: each seed is rebuilt to week 520 (cheap) and its export bytes compared.
const seeds = ROUTES.map(r => measureSeed(r.seed, r.horizon, 520, out))
const identical = seeds.every(s => s.determinism.identical)
const script = (name: string) => sha(readFileSync(new URL(`./${name}`, import.meta.url)))
writeJson(join(out, 'RIVAL-RECEIPT.json'), {
  status: identical ? 'MEASURED' : 'DETERMINISM-MISMATCH',
  obligation: 'Sprint 14 item 4: 1363-A §6 natural routes on the landed recovery + live P15B tree; a measured non-recovery is a finding',
  sourceHead: head, node: process.version, saveVersion: LIVE_SAVE_VERSION,
  scripts: { 'rival-recovery-measure.ts': script('rival-recovery-measure.ts'), 'measure-lib.ts': script('measure-lib.ts') },
  routeActions: ROUTE_ACTIONS, seeds, elapsedMs: performance.now() - started,
  limits: ['single landed tree: the charter arms (control, A, A+B) and controls (a), (e), (f), (g) need historical trees and are not measured here',
    'no source observers: package/evaluation outcomes, refusal gates and the 154 promise attribution are not read',
    'reserve-based weeks (first below reserve, back at reserve) are read at sampled weeks only',
    'closure is reported from the live studioClosure root; closureDueNotClosed marks a due-only stage'],
})
if (!identical) { process.stderr.write('DETERMINISM-MISMATCH: see RIVAL-RECEIPT.json\n'); process.exitCode = 1 }
