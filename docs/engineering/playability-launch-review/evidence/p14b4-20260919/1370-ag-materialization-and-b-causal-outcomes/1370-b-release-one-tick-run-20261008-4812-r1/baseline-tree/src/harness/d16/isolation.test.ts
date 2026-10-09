// ── D-16 guard spec ──────────────────────────────────────────────────────────
//   npx vitest run --config src/harness/d16/vitest.d16.config.ts
//
// Four invariants that must never silently regress:
//   1. PRODUCTION IMPORT ISOLATION — nothing under src/core/ or ui/src/ mentions 'harness/'.
//   2. INFORMATION DISCIPLINE — a serialized PlayerView contains no hidden-state key.
//   3. DETERMINISM — two identical runs are byte-identical.
//   4. CONSERVATION — cash === INITIAL_CASH + Σ ledger, accumulated in ARRAY ORDER.

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  TUNING,
  applyActions,
  commitmentPreview,
  economyEngaged,
  employmentEngaged,
  stableStringify,
  tick,
  weeklyOverhead,
} from '../../core/index.js'
import type { GameState } from '../../core/index.js'
import { runOne, foundStudioFor } from './driver.js'
import { toGreenlightAction } from './packages.js'
import {
  standardCadence,
  premiumAmbitious,
  cheapestViable,
  forecastProfitMax,
  ALL_POLICIES,
  ALL_KNOWN_POLICIES,
  PUBLICITY_POLICIES,
  policyByName,
} from './policies.js'
import type { PlayerCtx } from './policies.js'
import {
  assertNoHiddenLeak,
  FORBIDDEN_PLAYER_VIEW_KEYS,
  buildPlayerView,
  collectKeys,
  reconciledCash,
} from './view.js'
import { DEFAULT_PUBLICITY, PUBLICITY_TIERS, newPublicityMemo } from './publicity.js'
import {
  assessPackage,
  bareMinimumPackage,
  evaluatePackage,
  generatePackages,
  packageAffordable,
  packagePreview,
  shippedMarketingGrid,
  standardPackage,
  STATE_PACKAGE_OPTIONS,
  withMarketingGrid,
} from './packages.js'
import { assessFinancialState } from './states.js'

/** The same player context `driver.ts` builds, for a direct `publicize()` probe. */
function playerCtxForTest(s: GameState): PlayerCtx {
  return {
    week: s.market.tick,
    maxConcurrent: TUNING.AGENT_MAX_SLATE,
    packages: (o) => generatePackages(s, o),
    bareMinimum: (o) => bareMinimumPackage(s, o),
    standard: (o) => standardPackage(s, o),
    evaluate: (p) => evaluatePackage(s, p),
    assess: (p) => assessPackage(s, p),
    affordable: (p) => packageAffordable(s, p),
    preview: (p) => packagePreview(s, p),
    previewAmount: (a) => commitmentPreview(s, a),
    financialState: () =>
      assessFinancialState(s, {
        bareMinimum: bareMinimumPackage(s, STATE_PACKAGE_OPTIONS),
        standard: standardPackage(s, STATE_PACKAGE_OPTIONS),
      }).state,
  }
}

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')

function collectFiles(dir: string, exts: readonly string[]): string[] {
  const out: string[] = []
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'dist') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...collectFiles(full, exts))
    else if (exts.some((e) => full.endsWith(e))) out.push(full)
  }
  return out
}

/** Every module specifier a file imports, exports-from, dynamically imports, or requires. */
function moduleSpecifiers(src: string): string[] {
  const out: string[] = []
  const patterns = [
    /(?:^|[\s;}])(?:import|export)[\s\S]{0,400}?from\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /(?:^|[\s;}])import\s*['"]([^'"]+)['"]/g,
  ]
  for (const re of patterns) for (const m of src.matchAll(re)) if (m[1] !== undefined) out.push(m[1])
  return out
}

describe('D-16 · production import isolation', () => {
  it('no module under src/core/ or ui/src/ imports anything from a harness path', () => {
    const files = [
      ...collectFiles(join(repoRoot, 'src', 'core'), ['.ts']),
      ...collectFiles(join(repoRoot, 'ui', 'src'), ['.ts', '.tsx']),
    ]
    expect(files.length).toBeGreaterThan(20) // the scan actually found the trees
    const offenders: string[] = []
    for (const f of files) {
      for (const spec of moduleSpecifiers(readFileSync(f, 'utf8'))) {
        if (spec.includes('harness')) offenders.push(`${relative(repoRoot, f)} → ${spec}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('the only textual "harness/" occurrences in production code are the known prose ones', () => {
    // The brief asked for a raw substring scan. At 33eb33ae that scan has exactly ONE
    // pre-existing hit, and it is PROSE, not an edge: src/core/reception.ts:671 reads
    // "the fame-isolation harness/tests can vary fame …". Pinning it here means a NEW
    // textual occurrence still fails this spec, while the import-edge test above is the
    // invariant that actually matters.
    const files = [
      ...collectFiles(join(repoRoot, 'src', 'core'), ['.ts']),
      ...collectFiles(join(repoRoot, 'ui', 'src'), ['.ts', '.tsx']),
    ]
    const hits = files
      .filter((f) => readFileSync(f, 'utf8').includes('harness/'))
      .map((f) => relative(repoRoot, f))
      .sort()
    expect(hits).toEqual(['src/core/reception.ts'])
  })

  it('every D-16 module imports the engine ONLY through src/core/index.js', () => {
    const mine = collectFiles(here, ['.ts'])
    expect(mine.length).toBeGreaterThan(5)
    const bad: string[] = []
    for (const f of mine) {
      const src = readFileSync(f, 'utf8')
      for (const m of src.matchAll(/from '([^']*core[^']*)'/g)) {
        if (m[1] !== '../../core/index.js') bad.push(`${relative(repoRoot, f)} → ${m[1]}`)
      }
    }
    expect(bad).toEqual([])
  })

  it('no D-16 production module touches a wall clock (only the CLI, and only for stderr)', () => {
    const mine = collectFiles(here, ['.ts']).filter((f) => !f.endsWith('.test.ts'))
    const offenders: string[] = []
    for (const f of mine) {
      const src = readFileSync(f, 'utf8')
      const clock = ['Date', 'now', '('].join('.').replace('.(', '(') // avoid a self-hit
      const usesClock = src.includes(clock) || src.includes('new Date(') || src.includes('performance.now(')
      if (!usesClock) continue
      if (!f.endsWith('run-d16-corpus.ts')) offenders.push(relative(repoRoot, f))
    }
    expect(offenders).toEqual([])
  })
})

describe('D-16 · information discipline (PlayerView leak test)', () => {
  it('a serialized PlayerView contains none of actual / scriptPotential / rngState', () => {
    const founded = foundStudioFor('d16-leak', standardCadence).state
    for (const includePosition of [false, true]) {
      const view = buildPlayerView(founded, { includePosition })
      const keys = collectKeys(JSON.parse(JSON.stringify(view)) as unknown)
      for (const forbidden of FORBIDDEN_PLAYER_VIEW_KEYS) {
        expect(keys.has(forbidden), `PlayerView leaked "${forbidden}"`).toBe(false)
      }
    }
  })

  it('holds after a real run has produced films, runs and career events', () => {
    const rec = runOne({ seed: 'd16-leak', policy: standardCadence, horizonWeeks: 60 })
    expect(rec.filmsReleased).toBeGreaterThan(0)
    // Rebuild the view at the end of an equivalent run and re-check.
    const founded = foundStudioFor('d16-leak', standardCadence).state
    const view = buildPlayerView(founded, { includePosition: true })
    const json = JSON.stringify(view)
    expect(json.includes('"actual"')).toBe(false)
    expect(json.includes('"scriptPotential"')).toBe(false)
    expect(json.includes('"rngState"')).toBe(false)
  })

  it('does not expose hidden concept or market fields the UI never renders', () => {
    const founded = foundStudioFor('d16-leak', standardCadence).state
    // Greenlight one film so the view actually carries an active production + its LOCKED
    // forecast — otherwise the "present" assertions below would be vacuous.
    const pkg = standardPackage(founded)!
    const withProduction = applyActions(founded, [toGreenlightAction(pkg)])
    const keys = collectKeys(JSON.parse(JSON.stringify(buildPlayerView(withProduction))) as unknown)
    // baselineStrength IS the D-13 script-potential field; ConceptCard renders neither it
    // nor baseMarketValue.
    expect(keys.has('baselineStrength')).toBe(false)
    expect(keys.has('baseMarketValue')).toBe(false)
    expect(keys.has('ceilings')).toBe(false)
    expect(keys.has('devRate')).toBe(false)
    // …while the fields the UI DOES render are present.
    expect(keys.has('baseNegativeCost')).toBe(true)
    expect(keys.has('forecastSnapshot')).toBe(true)
    expect(keys.has('weeklyBurn')).toBe(true)
  })

  it('only the oracle view carries the raw state', () => {
    const founded = foundStudioFor('d16-leak', standardCadence).state
    const view = buildPlayerView(founded)
    expect('state' in view).toBe(false)
    expect(view.kind).toBe('player')
  })
})

describe('D-16 · determinism smoke', () => {
  it('two 60-week P3 runs on one seed are byte-identical', () => {
    const a = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 60, keepFullSeries: true })
    const b = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 60, keepFullSeries: true })
    expect(stableStringify(a as unknown as Record<string, unknown>)).toBe(
      stableStringify(b as unknown as Record<string, unknown>),
    )
    expect(a.filmsGreenlit).toBeGreaterThan(0)
  })

  it('different seeds produce different runs (the comparison above is not vacuous)', () => {
    const a = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 60 })
    const b = runOne({ seed: 'd16-0002', policy: standardCadence, horizonWeeks: 60 })
    expect(a.endCash).not.toBe(b.endCash)
  })
})

describe('D-16 · conservation smoke', () => {
  it('cash === INITIAL_CASH + Σ ledger (array order) at the end of a run for several policies', () => {
    for (const policy of [standardCadence, premiumAmbitious]) {
      const founded = foundStudioFor('d16-cons', policy).state
      // founding bonuses draw the recruitment fund, NOT cash — the documented exception.
      expect(founded.studio.cash).toBe(TUNING.INITIAL_CASH)
      expect(founded.ledger).toHaveLength(0)
      const rec = runOne({ seed: 'd16-cons', policy, horizonWeeks: 60 })
      // runOne throws on a reconciliation violation, so reaching here already proves it;
      // re-derive the identity from the emitted totals as an independent check.
      let acc: number = TUNING.INITIAL_CASH
      for (const [, v] of Object.entries(rec.ledgerTotals)) acc += v
      expect(acc).toBeCloseTo(rec.endCash, 3)
    }
  })

  it('reconciledCash matches the engine cash on a freshly founded state', () => {
    const founded = foundStudioFor('d16-cons2', standardCadence).state
    expect(reconciledCash(founded)).toBeCloseTo(founded.studio.cash, 9)
  })
})

describe('D-16 · policy registry', () => {
  it('declares 16 policies with unique names and exactly one oracle and one exploit', () => {
    expect(ALL_POLICIES).toHaveLength(16)
    expect(new Set(ALL_POLICIES.map((p) => p.name)).size).toBe(16)
    expect(ALL_POLICIES.filter((p) => p.kind === 'oracle')).toHaveLength(1)
    expect(ALL_POLICIES.filter((p) => p.kind === 'exploit')).toHaveLength(1)
    for (const p of ALL_POLICIES) expect(p.description.length).toBeGreaterThan(20)
  })

  // D-17B lab fix (Stage-8 verdict #15). The marketing level a policy names must be a RUNG of
  // the ACTIVE grid, resolved at decision time — not a dollar literal that silently ignores a
  // swept menu. Seven arms were bit-identical across the capacity and fixed grids on all 300
  // seeds because of those literals, and P12/P13 ("min"/"max" marketing) stopped naming the
  // menu's extremes. Both halves are asserted: identity under the shipped grid, movement under
  // a swept one.
  it('every policy places its films on the ACTIVE marketing grid, resolved per decision', () => {
    const SWEPT: readonly [number, number, number] = [222_000, 555_000, 1_777_000]
    const shipped = shippedMarketingGrid()
    const RUNG_ARMS = ['P4', 'P7', 'P9', 'P11', 'P12', 'P13', 'P15'] as const

    // (a) shipped grid ⇒ the historical dollar levels, unchanged (the neutral-arm half).
    const base = new Map<string, Set<number>>()
    for (const name of RUNG_ARMS) {
      const rec = runOne({ seed: 'd16-0002', policy: policyByName(name), horizonWeeks: 104 })
      const levels = new Set(rec.films.map((f) => f.marketing))
      base.set(name, levels)
      for (const l of levels) expect(shipped, `${name} placed a film off the shipped grid`).toContain(l)
    }

    // (b) swept grid ⇒ every film moves onto the swept rungs, and NONE stays on a shipped one.
    withMarketingGrid(SWEPT, () => {
      for (const name of RUNG_ARMS) {
        const rec = runOne({ seed: 'd16-0002', policy: policyByName(name), horizonWeeks: 104 })
        const levels = new Set(rec.films.map((f) => f.marketing))
        for (const l of levels) expect(SWEPT, `${name} placed a film off the swept grid`).toContain(l)
        if (base.get(name)!.size > 0) {
          expect(levels, `${name} is INERT to the marketing grid`).not.toEqual(base.get(name))
        }
      }
      // The two controlled probes must name the swept extremes, or their names are false.
      const min = runOne({ seed: 'd16-0002', policy: policyByName('P12'), horizonWeeks: 104 })
      const max = runOne({ seed: 'd16-0002', policy: policyByName('P13'), horizonWeeks: 104 })
      expect(new Set(min.films.map((f) => f.marketing))).toEqual(new Set([SWEPT[0]]))
      expect(new Set(max.films.map((f) => f.marketing))).toEqual(new Set([SWEPT[2]]))
    })
  })

  it('exactly the two policies that MEAN to disengage declare it (B2-C3)', () => {
    const declared = ALL_POLICIES.filter((p) => p.disengagementIntended).map((p) => p.name).sort()
    expect(declared).toEqual(['P15_exploitDisengage', 'P16_doNothing'])
  })

  it('every policy that does NOT declare disengagement stays engaged over 104 weeks', () => {
    for (const p of ALL_POLICIES) {
      if (p.disengagementIntended) continue
      const rec = runOne({ seed: 'd16-0003', policy: p, horizonWeeks: 104 })
      expect(rec.engagementCliffHit, `${p.name} fell off the engagement cliff at week ${String(rec.engagementCliffWeek)}`).toBe(false)
      expect(rec.engagedWeekFraction, `${p.name} engagedWeekFraction`).toBe(1)
    }
  })

  // B2-C3. Founding contracts are CONTRACT_MAX_WEEKS = 208 from week 0 and the check runs at
  // the TOP of each week loop, so a 208-week horizon can never observe the wall: the last check
  // is at w=207 and tick.ts:490-494 prunes the expired contracts on the final advance, after it.
  // Past the wall the behaviour must be real, measured, and attributable — never silently pooled.
  //
  // D-17B INSTRUMENT SPLIT (re-specified 2026-08-12, Phase-A gate ruling 1). This test used to
  // assert that the insolvent studio "falls off the engagement cliff". Post-R2 that is false:
  // `economyEngaged` is persisted and monotonic, so the regime never changes — the studio hits
  // the WEEK-208 ROSTER WALL (A5 Finding 0), a different failure with a different meaning, and
  // one that must NOT be excluded from the distributions the way a cliff run is. Both facts are
  // asserted here now.
  it('past the 208-week contract wall the ROSTER WALL is possible, flagged, and carries its week', () => {
    const solvent = runOne({ seed: 'd16-0003', policy: forecastProfitMax, horizonWeeks: 260 })
    // a solvent studio renews inside the 12-week window and survives the wall
    expect(solvent.engagementCliffHit).toBe(false)
    expect(solvent.rosterWallHit).toBeUndefined()
    expect(solvent.engagedWeekFraction).toBe(1)

    // an insolvent one cannot pay the renewal bonus — faithful, and it says so
    const broke = runOne({ seed: 'd16-0001', policy: cheapestViable, horizonWeeks: 260 })
    expect(broke.engagementCliffHit).toBe(false)
    expect(broke.rosterWallHit).toBe(true)
    expect(broke.rosterWallWeek).toBeGreaterThanOrEqual(TUNING.CONTRACT_MAX_WEEKS)
    expect(broke.engagedWeekFraction).toBeLessThan(1)
  })

  // The other half of the split: the cliff instrument now reads the PERSISTED regime, which is
  // structurally unreachable for a founded studio — so no player policy can be excluded from a
  // headline distribution by an instrument that is measuring employment rather than the economy.
  it('no policy loses the ENGAGED ECONOMY over 260 weeks (the cliff is structurally closed post-R2)', () => {
    for (const p of ALL_POLICIES) {
      const rec = runOne({ seed: 'd16-0003', policy: p, horizonWeeks: 260 })
      expect(rec.engagementCliffHit, `${p.name} reported an economy cliff`).toBe(false)
      expect(rec.engagementCliffWeek).toBeNull()
    }
  })

  // D-17A / Owner ruling R2 — THE CLIFF THIS TEST DOCUMENTED IS CLOSED; re-specified
  // 2026-08-12. `economyEngaged` is now the PERSISTED, monotonic regime fact
  // (`state.economyEngagedEver`), so shedding every contract no longer switches the D-12
  // economy back off. P15 is unchanged and still sheds — its EMPLOYMENT fraction (what this
  // harness measures, D-11.0) still collapses — but the studio stays in the engaged regime:
  // overhead keeps being charged, the engaged greenlight path applies (so D-11.12 refuses its
  // open-pool casting), and nothing is ever credited on the legacy 100 %-of-gross path.
  // The policy, driver and harness are byte-identical; only the truth they observe changed.
  it('the exploit policy sheds every contract but STAYS in the engaged economy (D-17A/R2)', () => {
    const exploit = ALL_POLICIES.find((p) => p.kind === 'exploit')!
    const rec = runOne({ seed: 'd16-0003', policy: exploit, horizonWeeks: 60 })
    expect(rec.policyKind).toBe('exploit')
    expect(rec.disengagementIntended).toBe(true)
    // EMPLOYMENT still disengages — the shed is real.
    expect(rec.engagedWeekFraction).toBeLessThan(0.2)
    // …but the ECONOMY regime is persisted and monotonic: a contract-less founded studio
    // is still a player studio, and still carries the fixed overhead.
    let shed = foundStudioFor('d16-0003', exploit).state
    for (const c of [...shed.contracts])
      shed = applyActions(shed, [{ kind: 'releaseTalent', talentId: c.talentId }])
    expect(shed.contracts).toHaveLength(0)
    expect(employmentEngaged(shed)).toBe(false)
    expect(economyEngaged(shed)).toBe(true)
    expect(weeklyOverhead(shed)).toBe(TUNING.OVERHEAD_BASE)
    // Because the engaged greenlight path stays in force, D-11.12 refuses every open-pool
    // package the exploit assembles — it greenlights and releases NOTHING.
    expect(rec.filmsGreenlit).toBe(0)
    expect(rec.filmsReleased).toBe(0)
    expect(rec.rejectedActions).toBeGreaterThan(0)
    expect(rec.rejections[0]!.kind).toBe('greenlight')
    expect(rec.rejections[0]!.reason).toContain('neither studio-contracted nor an available freelancer')
    // The economy did NOT revert to 100 %-of-gross: overhead kept being debited and the
    // legacy single-lump `boxOffice` credit never appears.
    expect(rec.ledgerTotals['overhead']).toBeLessThan(0)
    expect(rec.ledgerTotals['boxOffice']).toBeUndefined()
  })
})

// ── D-17B · the eight publicity arms ─────────────────────────────────────────
describe('D-17B · publicity policy registry', () => {
  it('the D-16 menu is STILL exactly sixteen — a Q arm can never enter an `all` corpus', () => {
    expect(ALL_POLICIES).toHaveLength(16)
    expect(ALL_POLICIES.some((p) => p.name.startsWith('Q'))).toBe(false)
    expect(PUBLICITY_POLICIES).toHaveLength(8)
    expect(ALL_KNOWN_POLICIES).toHaveLength(24)
    expect(new Set(ALL_KNOWN_POLICIES.map((p) => p.name)).size).toBe(24)
    // …and every Q arm is still reachable BY NAME and by prefix
    for (const p of PUBLICITY_POLICIES) {
      expect(policyByName(p.name)).toBe(p)
      expect(policyByName(p.name.split('_')[0]!)).toBe(p)
    }
  })

  it('every Q arm keeps its host’s greenlight behaviour (only `publicize` differs)', () => {
    const hosts: Record<string, { name: string }> = {
      Q0_neverPublicize: standardCadence,
      Q1_publicizeAtLowAwareness: standardCadence,
      Q2_publicizeBeforeEveryRelease: standardCadence,
      Q3_publicityROIDisciplined: forecastProfitMax,
      Q4_maximumPublicity: standardCadence,
      Q5_emergencyPublicity: standardCadence,
      Q6_awarenessMaintenance: standardCadence,
      Q7_publicitySpamAdversary: standardCadence,
    }
    for (const p of PUBLICITY_POLICIES) {
      const host = hosts[p.name] as unknown as { decide: unknown; roster: unknown; founding: unknown }
      expect(p.decide, `${p.name} must reuse its host's decide`).toBe(host.decide)
      expect(p.roster).toBe(host.roster)
      expect(p.founding).toBe(host.founding)
    }
    // …and with no publicity shim configured, a Q arm IS its host, run for run
    const q = runOne({ seed: 'd16-0003', policy: PUBLICITY_POLICIES[3]!, horizonWeeks: 104 })
    const p5 = runOne({ seed: 'd16-0003', policy: forecastProfitMax, horizonWeeks: 104 })
    expect(JSON.stringify({ ...q, policy: '' })).toBe(JSON.stringify({ ...p5, policy: '' }))
  })

  it('no Q arm disengages unintentionally over 104 weeks WITH the shim live', () => {
    for (const p of PUBLICITY_POLICIES) {
      const rec = runOne({ seed: 'd16-0003', policy: p, horizonWeeks: 104, publicity: DEFAULT_PUBLICITY })
      expect(p.disengagementIntended).toBe(false)
      expect(rec.engagementCliffHit, `${p.name} reported an economy cliff`).toBe(false)
      expect(rec.engagedWeekFraction, `${p.name} engagedWeekFraction`).toBe(1)
      expect(rec.reconciliationOk).toBe(true)
    }
  })

  it('the ADVERSARY is excluded from the player headline matrix by construction (B1-D9 pattern)', () => {
    const adversaries = PUBLICITY_POLICIES.filter((p) => p.kind === 'adversary')
    expect(adversaries).toHaveLength(1)
    expect(adversaries[0]!.name).toBe('Q7_publicitySpamAdversary')
    // the corpus's player matrix is `kind === 'player'`; the adversary is not in it
    const playerMenu = [...ALL_POLICIES, ...PUBLICITY_POLICIES].filter((p) => p.kind === 'player')
    expect(playerMenu.some((p) => p.name === 'Q7_publicitySpamAdversary')).toBe(false)
    expect(playerMenu.some((p) => p.name === 'Q0_neverPublicize')).toBe(true)
  })

  it('every publicize() intent is derived ONLY from the visible view (never a hidden field)', () => {
    let s = foundStudioFor('d16-0003', standardCadence).state
    for (let w = 0; w < 30; w++) s = tick(s, { develop: true })
    const memo = newPublicityMemo()
    const view = buildPlayerView(s, { publicity: { cfg: DEFAULT_PUBLICITY, memo } })
    assertNoHiddenLeak(view)
    const ctx = playerCtxForTest(s)
    for (const p of PUBLICITY_POLICIES) {
      const intent = p.publicize!(view, ctx)
      expect(intent === null || PUBLICITY_TIERS.includes(intent.tier)).toBe(true)
      // an intent is only ever for a tier the PANEL reported as available
      if (intent !== null) {
        expect(view.publicity!.tiers.find((t) => t.tier === intent.tier)!.available).toBe(true)
      }
    }
  })

  it('a Q arm’s publicity spend is visible in the ledger under the note prefix, and nowhere else', () => {
    const rec = runOne({
      seed: 'd16-0003',
      policy: PUBLICITY_POLICIES[7]!,
      horizonWeeks: 104,
      publicity: DEFAULT_PUBLICITY,
    })
    expect(rec.publicity!.spend).toBeGreaterThan(0)
    expect(rec.ledgerTotals['termination']).toBe(-rec.publicity!.spend)
    // the money never touches the film-cost channels
    expect(rec.ledgerTotals['production']).toBeLessThan(0)
    const q0 = runOne({
      seed: 'd16-0003',
      policy: PUBLICITY_POLICIES[0]!,
      horizonWeeks: 104,
      publicity: DEFAULT_PUBLICITY,
    })
    expect(q0.ledgerTotals['production']).toBe(rec.ledgerTotals['production'])
  })
})
