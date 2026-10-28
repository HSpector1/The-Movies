// Sprint 14 item 3 (sprint14-qualification/ENTRY.md): natural long campaign on the live era (Save51, P16-P18 code present).
// Routes are 1367-K's natural G-L routes (1361-GL-probe.ts): p13a-core-causal-01 to 6240; seed-b to 6240 and on to 8791.
// Copy this file and measure-lib.ts into the snapshot worktree root, then from that root:
//   CAMPAIGN_OUTPUT=<empty dir> MEASURE_SOURCE_HEAD=<HEAD> node node_modules/vite-node/vite-node.mjs campaign-measure.ts
// Measures; never forces: no cash, roster, controller or action input beyond the route (measure-lib ROUTE_ACTIONS).
// Each seed runs the default arm and, when the player's closure stops it early, the closure-deferred arm (measure-lib Arm).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { LIVE_SAVE_VERSION } from './src/core/save.ts'
import { ROUTE_ACTIONS, measureSeed, need, outputDir, sha, sourceHead, writeJson } from './measure-lib.ts'

need(LIVE_SAVE_VERSION === 51, `expected the Save51 era, found ${LIVE_SAVE_VERSION}`)
const out = outputDir('CAMPAIGN_OUTPUT'), head = sourceHead(), started = performance.now()
// ponytail: seed-b is rebuilt to 520 only; a full 8791 rebuild repeats the whole route (318 s + 422 s at Save45).
// The default route is rebuilt to 6240 and compared byte for byte; measureSeed also compares the two arms' shared checkpoints.
const ROUTES = [{ seed: 'p13a-core-causal-01', horizon: 6240, rebuildTo: 6240 }, { seed: 'seed-b', horizon: 8791, rebuildTo: 520 }]
const seeds = ROUTES.map(r => measureSeed(r.seed, r.horizon, r.rebuildTo, out))
const identical = seeds.every(s => s.determinism.identical)
const script = (name: string) => sha(readFileSync(new URL(`./${name}`, import.meta.url)))
writeJson(join(out, 'CAMPAIGN-RECEIPT.json'), {
  status: identical ? 'MEASURED' : 'DETERMINISM-MISMATCH',
  obligation: 'Sprint 14 item 3: natural long campaign on Save51; compare with Save45 1367-K (gl-natural-r1) and 1368-C',
  sourceHead: head, node: process.version, saveVersion: LIVE_SAVE_VERSION,
  scripts: { 'campaign-measure.ts': script('campaign-measure.ts'), 'measure-lib.ts': script('measure-lib.ts') },
  routeActions: ROUTE_ACTIONS, seeds, elapsedMs: performance.now() - started,
  limits: ['save timings are isolated makeSave/validateSaveV51 calls, not a Bridge-step budget',
    'player release counts on these routes are structural: the route issues no player production action',
    'the operated 1367-K seed-b trial (week 312 question) is operated-trial-312.ts, a separate route'],
})
if (!identical) { process.stderr.write('DETERMINISM-MISMATCH: see CAMPAIGN-RECEIPT.json\n'); process.exitCode = 1 }
