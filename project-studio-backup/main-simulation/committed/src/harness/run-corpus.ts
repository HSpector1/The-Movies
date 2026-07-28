// ── M0A §14 instrumentation entrypoint ────────────────────────────────────────
// The runnable harness. Sits ABOVE the sim boundary (§14): it does filesystem I/O
// and iteration, but touches the sim ONLY through the public core exports (via
// run-driver.ts). It never imports from src/core internals and uses no unseeded
// entropy, no UUID, and no unstable ordering — the corpus is byte-deterministic in
// the seed set alone. (Date.now is used ONLY for a stderr wall-clock timing line;
// it is never written into any output file, so it cannot perturb the artifacts.)
//
// Corpus: seeds m0a-0001 … m0a-<N> (zero-padded 4), each run by BOTH agents
// (random, oracle). Default N = 1000 (2000 runs). A smaller N gives a smoke run.
//
// Build + run (rootDir "." → tsc emits to dist/src/…):
//   npx tsc && node dist/src/harness/run-corpus.js [corpusSize]
// e.g. a 100-seed smoke run: node dist/src/harness/run-corpus.js 100
//
// Output under out/m0a/ (out/ is gitignored):
//   raw-<agent>.jsonl   full per-run raw records (one JSON object per line)
//   summary.json        the machine aggregate (the ONLY file the PM reads for data)
//   summary.md          the human draft
//
// Determinism: identical seed set ⇒ byte-identical raw files, summary.json, and
// summary.md. No wall-clock timestamps are written into any output file (timing is
// printed to stderr only, never into the deterministic artifacts).

import { mkdirSync, writeFileSync, createWriteStream } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runOneRun, type AgentName, type RunRecord } from './run-driver.js'
import { CorpusAggregator, type AggregateSummary, type FlagResult } from './aggregate.js'

// Repo root = two levels up from dist/src/harness (or src/harness in ts-node): we
// resolve out/ relative to the compiled file location's repo root robustly by
// walking up to the directory that is the project root. Simplest robust approach:
// out/ lives at <repoRoot>/out; from dist/src/harness/run-corpus.js that is
// ../../../out. This path is stable for the documented build+run command.
const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')
const OUT_DIR = join(repoRoot, 'out', 'm0a')

// The two agents, in fixed order (raw files are written per agent).
const AGENTS: readonly AgentName[] = ['random', 'oracle'] as const

// Zero-pad a 1-based seed index to 4 digits → the m0a-NNNN master seed (the ONLY
// entropy source; no other derivation).
function seedFor(i: number): string {
  return `m0a-${String(i).padStart(4, '0')}`
}

// Stable JSON stringify with sorted keys, so raw JSONL and summary.json are
// byte-identical across runs regardless of key insertion order. (Object key order
// in JS is insertion order, which our code fixes; sorting is belt-and-braces so a
// future refactor can't perturb the bytes.)
function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value))
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeys((value as Record<string, unknown>)[key])
    }
    return out
  }
  return value
}

function main(): void {
  const arg = process.argv[2]
  const corpusSize = arg === undefined ? 1000 : Number(arg)
  if (!Number.isInteger(corpusSize) || corpusSize <= 0) {
    process.stderr.write(`invalid corpus size "${arg}" — expected a positive integer\n`)
    process.exit(2)
    return
  }

  mkdirSync(OUT_DIR, { recursive: true })

  const startMs = Date.now()

  const aggregator = new CorpusAggregator()

  // Per-agent raw JSONL streams (full raw per-run data preserved for repro).
  const rawStreams: Record<AgentName, ReturnType<typeof createWriteStream>> = {
    random: createWriteStream(join(OUT_DIR, 'raw-random.jsonl')),
    oracle: createWriteStream(join(OUT_DIR, 'raw-oracle.jsonl')),
  }

  let runsDone = 0
  // Fixed iteration: seed-major, agent-minor (agents in fixed AGENTS order). This
  // ordering is deterministic and does not affect the aggregate (add is
  // commutative for every statistic except example-seed "first", which is stable
  // under this fixed order).
  for (let i = 1; i <= corpusSize; i++) {
    const seed = seedFor(i)
    for (const agent of AGENTS) {
      const record: RunRecord = runOneRun(seed, agent)
      rawStreams[agent].write(stableStringify(record) + '\n')
      aggregator.add(record)
      runsDone += 1
    }
  }

  // Close raw streams synchronously enough for the process to flush on exit.
  for (const agent of AGENTS) rawStreams[agent].end()

  const summary = aggregator.finalize()

  // summary.json — the machine aggregate (ONLY the summary content, no raw runs).
  writeFileSync(join(OUT_DIR, 'summary.json'), stableStringify(summary) + '\n', 'utf8')

  // summary.md — the human draft.
  writeFileSync(join(OUT_DIR, 'summary.md'), renderMarkdown(summary, corpusSize), 'utf8')

  const elapsedMs = Date.now() - startMs
  // Timing + a terse verdict line go to STDERR only (never into deterministic files).
  process.stderr.write(
    `m0a corpus: ${corpusSize} seeds × ${AGENTS.length} agents = ${runsDone} runs in ${(elapsedMs / 1000).toFixed(1)}s\n`,
  )
  process.stderr.write(`  raw:      ${join(OUT_DIR, 'raw-<agent>.jsonl')}\n`)
  process.stderr.write(`  summary:  ${join(OUT_DIR, 'summary.json')} + summary.md\n`)
  const blocking = summary.flags.find((f) => f.name.startsWith('Standing differentiation'))
  process.stderr.write(
    `  blocking flag (D-2): ${blocking ? blocking.verdict : 'MISSING'}; ` +
      `argmax self-check: ${summary.oracleArgmaxSelfCheck.pass ? 'PASS' : `FAIL (${summary.oracleArgmaxSelfCheck.divergences} divergences)`}\n`,
  )
}

// ── summary.md renderer ───────────────────────────────────────────────────────
function renderMarkdown(s: AggregateSummary, corpusSize: number): string {
  const L: string[] = []
  L.push('# M0A instrumentation summary (draft)')
  L.push('')
  L.push(`Corpus: ${corpusSize} seeds (m0a-0001 … m0a-${String(corpusSize).padStart(4, '0')}) × 2 agents = ${s.runCounts.random + s.runCounts.oracle} runs.`)
  L.push('')
  L.push(`- Random runs: ${s.runCounts.random}`)
  L.push(`- Oracle runs: ${s.runCounts.oracle}`)
  L.push(`- Total releases: ${s.totalReleases}`)
  L.push(`- Total Oracle greenlight decisions: ${s.totalOracleDecisions}`)
  L.push(`- Oracle argmax self-check: ${s.oracleArgmaxSelfCheck.pass ? 'PASS (0 divergences)' : `FAIL (${s.oracleArgmaxSelfCheck.divergences} divergences)`}`)
  L.push('')
  L.push('Raw evidence: `out/m0a/raw-random.jsonl`, `out/m0a/raw-oracle.jsonl` (one JSON object per run).')
  L.push('')
  L.push('## Flags')
  L.push('')
  for (const f of s.flags) {
    L.push(renderFlag(f))
    L.push('')
  }
  L.push('## §15.1 Corpus bounds')
  L.push('')
  L.push('| term | range | observed min | observed max | count | in range |')
  L.push('|---|---|---|---|---|---|')
  for (const b of s.bounds) {
    const rng = `[${b.min}, ${b.max}]`
    const omin = b.observedMin === null ? '—' : String(round4(b.observedMin))
    const omax = b.observedMax === null ? '—' : String(round4(b.observedMax))
    L.push(`| ${b.name} | ${rng} | ${omin} | ${omax} | ${b.count} | ${b.inRange ? 'yes' : 'NO'} |`)
  }
  const anyOut = s.bounds.some((b) => !b.inRange)
  L.push('')
  L.push(anyOut ? '**Some terms out of range — see summary.json firstViolation.**' : 'All observed values within their stated ranges.')
  L.push('')
  L.push('## §15.2 Four-quadrant cell occupancy (craft ≷ 55) × (cohesion ≷ 0.55)')
  L.push('')
  L.push('| cell | count | example seed |')
  L.push('|---|---|---|')
  for (const cell of Object.keys(s.quadrants.cells).sort()) {
    const count = (s.quadrants.cells as Record<string, number>)[cell]!
    const ex = (s.quadrants.examples as Record<string, string | undefined>)[cell] ?? '—'
    L.push(`| ${cell} | ${count} | ${ex} |`)
  }
  L.push('')
  L.push(s.quadrants.allNonEmpty ? 'All four cells non-empty.' : '**One or more cells EMPTY — §15.2 not satisfied.**')
  L.push('')
  L.push('## Confidence-tier distribution (D-3)')
  L.push('')
  L.push('| tier | count | share | low sample (<5%) |')
  L.push('|---|---|---|---|')
  for (const tier of ['high', 'medium', 'low'] as const) {
    const t = s.tierDistribution.tiers[tier]
    L.push(`| ${tier} | ${t.count} | ${(t.share * 100).toFixed(2)}% | ${t.lowSample ? 'YES' : 'no'} |`)
  }
  L.push('')
  L.push(`Total forecasts (released films × 4 segments): ${s.tierDistribution.total}.`)
  L.push('')
  L.push('## D-4 limitation (verbatim, owner-required)')
  L.push('')
  L.push(
    'technical is pinned at 40 in every M0A run, so craft\'s 15% technical weight is untested and the remaining four weights (script/director/cast/budget) are effectively validated at rescaled proportions (0.30/0.25/0.20/0.10 of a 0.85 active mass). Craft weights will need re-validation when craft hiring arrives in M1A.',
  )
  L.push('')
  return L.join('\n')
}

function renderFlag(f: FlagResult): string {
  const lines: string[] = []
  lines.push(`### ${f.name} — ${f.verdict}`)
  lines.push('')
  lines.push(`Agent scope: ${f.agentScope}`)
  lines.push('')
  lines.push('Determining statistic:')
  lines.push('')
  lines.push('```json')
  lines.push(JSON.stringify(f.statistic, null, 2))
  lines.push('```')
  if (f.exampleSeeds.length > 0) {
    lines.push('')
    lines.push(`Reproduction seeds: ${f.exampleSeeds.join(', ')}`)
  }
  lines.push('')
  lines.push(f.note)
  return lines.join('\n')
}

function round4(x: number): number {
  return Math.round(x * 10000) / 10000
}

main()
