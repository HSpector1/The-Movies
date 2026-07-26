// ── Oracle talent-selection concentration + specialist-selection frequency ─────
// Reads the OFFICIAL corpus raw-oracle.jsonl (dev-OFF; agents role-partitioned, so
// selection behavior is dev-independent) and, per seed, cross-references the
// Oracle's chosen top-forecast casts against the generated world to compute:
//   - Oracle talent-selection CONCENTRATION: the share of the Oracle's chosen
//     casting picks captured by its single most-frequently-chosen actor (pooled),
//     and the Herfindahl index of its actor-pick distribution.
//   - Specialist-selection frequency: the fraction of the Oracle's chosen cast
//     picks that are specialists (peaked acting profile) vs the specialist share of
//     the actor pool (a lift number: does the Oracle prefer specialists?).
// Public surface only. Writes out/d9-dev/selection-stats.json.

import { createReadStream, mkdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateWorld, SKILL_ORDER } from '../core/index.js'
import type { Talent } from '../core/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')
const RAW_ORACLE = join(repoRoot, 'out', 'm0a', 'raw-oracle.jsonl')
const OUT_DIR = join(repoRoot, 'out', 'd9-dev')

function isSpecialist(t: Talent): boolean {
  const vals = SKILL_ORDER.acting.map((k) => t.skills.acting[k]!.perceived)
  const max = Math.max(...vals)
  const rest = vals.filter((v) => v !== max)
  const restMean = rest.reduce((a, b) => a + b, 0) / rest.length
  return max - restMean >= 15
}

type OracleRow = {
  seed: string
  oracleDecisions: Array<{ topForecastCast: { lead: string; antagonist: string; support: string } }>
}

async function main(): Promise<void> {
  const rl = createInterface({ input: createReadStream(RAW_ORACLE), crlfDelay: Infinity })

  // Global pick tally (actor id → times chosen in any top-forecast cast slot).
  const globalPicks = new Map<string, number>()
  let totalPicks = 0
  let specialistPicks = 0
  let specialistPoolFraction = 0
  let poolFractionSamples = 0
  // Per-run concentration: top-actor share of that run's picks.
  const perRunTopShare: number[] = []

  for await (const line of rl) {
    if (!line.trim()) continue
    const row = JSON.parse(line) as OracleRow
    const world = generateWorld(row.seed)
    const byId = new Map(world.talent.map((t) => [t.id, t]))
    // specialist share of the actor pool (per run).
    const actors = world.talent.filter((t) => t.role === 'actor')
    const poolSpecialists = actors.filter(isSpecialist).length
    specialistPoolFraction += poolSpecialists / actors.length
    poolFractionSamples++

    const runPicks = new Map<string, number>()
    for (const dec of row.oracleDecisions) {
      for (const id of [dec.topForecastCast.lead, dec.topForecastCast.antagonist, dec.topForecastCast.support]) {
        globalPicks.set(id, (globalPicks.get(id) ?? 0) + 1)
        runPicks.set(id, (runPicks.get(id) ?? 0) + 1)
        totalPicks++
        const t = byId.get(id)
        if (t && isSpecialist(t)) specialistPicks++
      }
    }
    let runTotal = 0
    let runMax = 0
    for (const v of runPicks.values()) {
      runTotal += v
      if (v > runMax) runMax = v
    }
    if (runTotal > 0) perRunTopShare.push(runMax / runTotal)
  }

  // Global Herfindahl (concentration) over the pooled actor-pick distribution.
  let herfindahl = 0
  let globalMax = 0
  for (const v of globalPicks.values()) {
    const share = v / totalPicks
    herfindahl += share * share
    if (v > globalMax) globalMax = v
  }
  const distinctActorsChosen = globalPicks.size
  const medianTopShare = (() => {
    const s = [...perRunTopShare].sort((a, b) => a - b)
    return s.length ? s[Math.floor(s.length / 2)]! : 0
  })()

  const summary = {
    totalOracleCastPicks: totalPicks,
    distinctActorsEverPicked: distinctActorsChosen,
    oracleSelectionConcentration: {
      pooledHerfindahlIndex: Number(herfindahl.toFixed(5)),
      pooledTopActorShare: Number((globalMax / totalPicks).toFixed(5)),
      perRunMedianTopActorShare: Number(medianTopShare.toFixed(4)),
      note:
        'Herfindahl over the pooled actor-pick distribution (1/N_actors ≈ perfectly diffuse; 1 = one actor always chosen). Lower = more diffuse selection.',
    },
    specialistSelection: {
      specialistShareOfOraclePicks: Number((specialistPicks / totalPicks).toFixed(4)),
      specialistShareOfActorPool: Number((specialistPoolFraction / poolFractionSamples).toFixed(4)),
      selectionLift: Number(
        (specialistPicks / totalPicks / (specialistPoolFraction / poolFractionSamples)).toFixed(4),
      ),
      note: 'lift > 1 ⇒ the Oracle picks specialists more often than their pool share.',
    },
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'selection-stats.json'), JSON.stringify(summary, null, 2))
  console.log('Oracle selection stats:')
  console.log(JSON.stringify(summary, null, 2))
}

void main()
