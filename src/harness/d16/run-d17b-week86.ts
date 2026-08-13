// ── D-17B · THE WEEK-86 OWNER-SAVE REPLAY ────────────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// THE OWNER'S LIVED QUESTION, asked as a counterfactual: from HIS save at week 86 — $2.83M,
// standing already sliding — does any PLAYER-INFORMATION arm produce durable recovery, and does
// paid publicity change that answer? A5's baseline: the least-bad legal continuation loses
// $2.04M per 52 weeks, stops producing by week 112 and is insolvent around week 158; producing
// the one affordable film ACCELERATES the decline and cuts awareness 12.31 → 8.51.
//
// N = 1. THIS IS ONE SAVE. It is never pooled with the fresh-start distributions and never
// quoted as a rate — the corpus answers "the class", this file answers "the instance"
// (D-16 lab §120). It writes to its own artifact directory for exactly that reason.
//
// READ-ONLY, THROUGH THE SHIPPED PATH:
//     readFileSync → importSave (validates) → migrateToV10 (in memory) → .state
// Nothing is written to the save or to any save file (D-17A precedent). `runOne` handles the
// resume correctly already: `startWeek`/`openingCash`/`filmsReleasedAtStart`, RELATIVE slices,
// and `runawayCash(openingCash)` so the studio is not measured against a $60M bar it opened
// $57M below.
//
// RUN:
//   node_modules/.bin/vite-node src/harness/d16/run-d17b-week86.ts \
//     [--save <path>] [--horizon 156] [--policies Q0,Q1,Q3,Q5] [--arms off,C,D,F]
//     [--publicity default|none|'{…}'] [--run-name NAME]
//     [--production-d17b]   frozen production path; cannot combine with lab arms/publicity
//
// The save lives OUTSIDE this worktree by default (D-17A-OWNER-EVIDENCE.md:6-8):
//   /Users/bruce/The Movies - Economy Recovery Lab/out/d16-economy-lab/week86-owner-save.json
//
// OUTPUT: out/d16-economy-lab/d17b/week86/<runName>/{rows.jsonl, summary.json, summary.md}

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { importSave, migrateToV10 } from '../../core/index.js'
import type { GameState } from '../../core/index.js'
import { runOne } from './driver.js'
import { policyByName } from './policies.js'
import type { Policy } from './policies.js'
import { makeTag, tagArtifact, assertTuningPristine } from './experiment.js'
import type { LabLevers } from './experiment.js'
import { COUNTER_FLOW_OFF, counterFlowKey, validateCounterFlow } from './counterflow.js'
import type { CounterFlowConfig } from './counterflow.js'
import { DEFAULT_PUBLICITY, PRODUCTION_PUBLICITY, publicityKey, validatePublicity } from './publicity.js'
import type { PublicityConfig } from './publicity.js'
import { assertMarketingGridPristine } from './packages.js'
import { productionCandidateKey, productionCounterFlowIdentity } from './productionIdentity.js'
import { sourceProvenance } from './sourceProvenance.js'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')
const OUT_ROOT = join(repoRoot, 'out', 'd16-economy-lab', 'd17b', 'week86')

const DEFAULT_SAVE = '/Users/bruce/The Movies - Economy Recovery Lab/out/d16-economy-lab/week86-owner-save.json'

const argv = process.argv.slice(2)
function flag(name: string): string | null {
  const i = argv.indexOf(`--${name}`)
  if (i === -1) return null
  return argv[i + 1] ?? ''
}
function has(name: string): boolean {
  return argv.includes(`--${name}`)
}

const SAVE_PATH = flag('save') ?? DEFAULT_SAVE
const HORIZON = Number(flag('horizon') ?? 156)
const RUN_NAME = flag('run-name') ?? `week86-h${HORIZON}`
const PRODUCTION_D17B = has('production-d17b')

const ARM_MENU: Record<string, CounterFlowConfig> = {
  off: COUNTER_FLOW_OFF,
  // Historical Stage-5 exploratory arm. It is not the frozen REV.3 candidate.
  C: { family: 'C', authorization: 'reference', kappa: 0.02, baseline: 30, revertMode: 'pullDownOnly' },
  C2: { family: 'C', authorization: 'reference', kappa: 0.02, baseline: 30 },
  D: { family: 'D', authorization: 'reference', gainKeep: 1, lossKeep: 0.5, idleDrain: 0.02 },
  F: { family: 'F', authorization: 'reference', pivotHalfLifeReleases: 3 },
}
const armsRaw = flag('arms')
const ARM_NAMES = PRODUCTION_D17B
  ? ['production']
  : (armsRaw ?? 'off,C,D,F').split(',').map((s) => s.trim()).filter((s) => s !== '')
for (const n of ARM_NAMES) {
  const cfg = n === 'production' ? COUNTER_FLOW_OFF : ARM_MENU[n]
  if (cfg === undefined) {
    throw new Error(`run-d17b-week86: unknown arm "${n}". Known: ${Object.keys(ARM_MENU).join(', ')}`)
  }
  if (cfg.family !== 'off') validateCounterFlow(cfg)
}

const POLICY_NAMES = (flag('policies') ?? 'Q0,Q1,Q3,Q5').split(',').map((s) => s.trim()).filter((s) => s !== '')
const policies: Policy[] = POLICY_NAMES.map((n) => policyByName(n))

const publicityRaw = flag('publicity')
if (PRODUCTION_D17B && (armsRaw !== null || publicityRaw !== null)) {
  throw new Error('--production-d17b cannot be combined with --arms or --publicity')
}
const PUBLICITY: PublicityConfig | undefined =
  PRODUCTION_D17B
    ? PRODUCTION_PUBLICITY
    : publicityRaw === 'none'
    ? undefined
    : publicityRaw === null || publicityRaw === '' || publicityRaw === 'default'
      ? DEFAULT_PUBLICITY
      : (JSON.parse(publicityRaw) as PublicityConfig)
if (PUBLICITY !== undefined) validatePublicity(PUBLICITY)

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys)
  if (v !== null && typeof v === 'object') {
    const src = v as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(src).sort()) out[k] = sortKeys(src[k])
    return out
  }
  return v
}
function stableJson(v: unknown, indent = 0): string {
  return JSON.stringify(sortKeys(v), null, indent)
}

/** Load the owner save READ-ONLY through the shipped import path. */
function loadOwnerState(path: string): GameState {
  const save = migrateToV10(importSave(readFileSync(path, 'utf8')))
  return save.state
}

function money(n: number): string {
  return Number.isFinite(n) ? `$${(n / 1_000_000).toFixed(2)}M` : 'n/a'
}

function main(): void {
  const state = loadOwnerState(SAVE_PATH)
  const out = join(OUT_ROOT, RUN_NAME)
  mkdirSync(out, { recursive: true })

  type Row = {
    arm: string
    armAuthorization: string
    policy: string
    endCash: number
    deltaCash: number
    filmsReleased: number
    endState: string | null
    weeksInsolvent: number
    durableAt52: boolean | null
    durableAt103: boolean | null
    finalAwareness: number
    exitsFromFloor: number
    publicityCount: number
    publicitySpend: number
    rosterWall: boolean
  }
  const rows: Row[] = []
  const jsonl: string[] = []

  for (const armName of ARM_NAMES) {
    const cf = armName === 'production' ? COUNTER_FLOW_OFF : ARM_MENU[armName]!
    for (const policy of policies) {
      const rec = runOne({
        seed: state.seed,
        policy,
        horizonWeeks: HORIZON,
        initialState: state,
        awarenessStats: true,
        ...(PRODUCTION_D17B ? { productionD17b: true } : {}),
        ...(!PRODUCTION_D17B && cf.family !== 'off' ? { counterFlow: cf } : {}),
        ...(!PRODUCTION_D17B && PUBLICITY !== undefined ? { publicity: PUBLICITY } : {}),
      })
      const levers: LabLevers = {}
      if (PRODUCTION_D17B) levers.productionCandidateKey = productionCandidateKey()
      else {
        const cfk = counterFlowKey(cf)
        if (cfk !== undefined) levers.counterFlowKey = cfk
        const pk = publicityKey(PUBLICITY)
        if (pk !== undefined) levers.publicityKey = pk
      }
      const record: Record<string, unknown> = {
        ...(rec as unknown as Record<string, unknown>),
        arm: armName,
        armAuthorization: PRODUCTION_D17B ? 'production' : cf.family === 'off' ? 'n/a' : cf.authorization,
        savePath: SAVE_PATH,
      }
      delete record['captures']
      jsonl.push(stableJson(tagArtifact(record, makeTag({}, levers))))
      rows.push({
        arm: armName,
        armAuthorization: PRODUCTION_D17B ? 'production' : cf.family === 'off' ? 'n/a' : cf.authorization,
        policy: policy.name,
        endCash: rec.endCash,
        deltaCash: rec.endCash - rec.openingCash,
        filmsReleased: rec.filmsReleased,
        endState: rec.episodes.endState,
        weeksInsolvent: rec.episodes.weeksInsolvent,
        durableAt52: rec.durableRecovery?.at52 ?? null,
        durableAt103: rec.durableRecovery?.at103 ?? null,
        finalAwareness: rec.awareness!.final,
        exitsFromFloor: rec.awareness!.exitsFromFloor,
        publicityCount: rec.publicity?.count ?? 0,
        publicitySpend: rec.publicity?.spend ?? 0,
        rosterWall: rec.rosterWallHit === true,
      })
    }
  }

  writeFileSync(join(out, 'rows.jsonl'), `${jsonl.join('\n')}\n`)

  const levers: LabLevers = {}
  if (PRODUCTION_D17B) levers.productionCandidateKey = productionCandidateKey()
  else {
    const pk = publicityKey(PUBLICITY)
    if (pk !== undefined) levers.publicityKey = pk
  }
  writeFileSync(
    join(out, 'summary.json'),
    `${stableJson(
      tagArtifact(
        {
          runName: RUN_NAME,
          source: sourceProvenance(),
          savePath: SAVE_PATH,
          openingWeek: state.market.tick,
          openingCash: state.studio.cash,
          openingAwareness: state.studio.standing.audienceAwareness,
          openingContracts: state.contracts.length,
          horizonWeeks: HORIZON,
          arms: ARM_NAMES.map((n) => {
            if (n === 'production') {
              return { arm: n, config: productionCounterFlowIdentity(), counterFlowKey: null }
            }
            const config = ARM_MENU[n]!
            return { arm: n, config, counterFlowKey: counterFlowKey(config) ?? null }
          }),
          policies: POLICY_NAMES,
          publicity: PUBLICITY ?? null,
          rows,
          nNote:
            'n = 1. This is ONE save, replayed. Nothing here is a rate, nothing here is pooled with the fresh-start corpora, and no number from this file may be quoted as a distribution. It answers the instance; the corpus answers the class.',
          authorizationNote:
            'Arms marked authorization "reference" (two-sided mean reversion with a free pull-up, loss-leg damping, the endogenous EMA pivot) are LABELLED REFERENCE ARMS under D-17B Phase-A gate ruling 2 — reported, never proposed.',
          readOnlyNote: 'The save is opened read-only through importSave + migrateToV10 (in memory). Nothing is written back.',
        },
        makeTag({}, levers),
      ),
      2,
    )}\n`,
  )

  const lines: string[] = []
  lines.push(`# D-17B Week-86 owner-save replay — ${RUN_NAME}`)
  lines.push('')
  lines.push(
    `**n = 1.** Opened at week ${String(state.market.tick)} with ${money(state.studio.cash)}, awareness ` +
      `${state.studio.standing.audienceAwareness.toFixed(2)}, ${String(state.contracts.length)} contracts. ` +
      `Horizon ${String(HORIZON)} wk. This is ONE save: never pooled with the fresh-start ` +
      'distributions, never quoted as a rate.',
  )
  lines.push('')
  lines.push('| arm | auth | policy | Δcash | end cash | films | end state | weeks insolvent | durable@52 | durable@103 | final awareness | exits from floor | publicity | roster wall |')
  lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const r of rows) {
    lines.push(
      `| ${r.arm} | ${r.armAuthorization} | ${r.policy} | ${money(r.deltaCash)} | ${money(r.endCash)} | ${r.filmsReleased} | ` +
        `${r.endState ?? 'n/a'} | ${r.weeksInsolvent} | ${r.durableAt52 === null ? 'n/a' : String(r.durableAt52)} | ` +
        `${r.durableAt103 === null ? 'n/a' : String(r.durableAt103)} | ${r.finalAwareness.toFixed(2)} | ${r.exitsFromFloor} | ` +
        `${r.publicityCount}×/${money(r.publicitySpend)} | ${r.rosterWall ? 'yes' : '—'} |`,
    )
  }
  lines.push('')
  lines.push(
    '`durable@N` is `n/a` when the continuation never entered distress inside its own horizon — ' +
      'there is nothing to recover from, which is itself an answer.',
  )
  lines.push('')
  writeFileSync(join(out, 'summary.md'), `${lines.join('\n')}\n`)
  process.stderr.write(`\nD-17B week-86 replay "${RUN_NAME}" — ${rows.length} arms\n  wrote ${out}\n`)
}

main()
assertTuningPristine('post-week86')
assertMarketingGridPristine('post-week86')
