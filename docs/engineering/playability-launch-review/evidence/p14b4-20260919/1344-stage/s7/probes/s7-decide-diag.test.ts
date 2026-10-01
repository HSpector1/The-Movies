// 1344-s7 decide-diag: the 1329 decide/package-chooser instrumentation (1329-A :38; E/1329-c8/diag-head-*.diff,
// probe-decide-diag.test.ts.txt) rebuilt without a source patch. NOT RUN by the author. RUNBOOK.md copies it into a
// scratch tree as tests/zz-s7-decide-diag.test.ts, beside tests/zz-s7-lib.ts, and runs it alone.
// Env: S7_RUN (required), S7_TREE (candidate|old, required), S7_SEED (default p13a-core-causal-01), S7_WEEKS (default 520).
//
// Method. 1329 patched decide() and the chooser loop in a scratch copy and pushed one row per evaluated ready
// screenplay. Here a vitest spy on the public export hollywoodPolicy.chooseIndustryPackage (the technique of
// tests/helpers/p14p3-fixtures.ts rivalStep and the 1344-F2 counts leaf) sees every locked-screenplay evaluation that
// reaches the chooser: the ready loop's and, on the candidate, the retry's (1344-F Amendment 1). For each call, mirror()
// re-runs the chooser's locked-screenplay candidate loop through public exports and reports what the 1329 patch reported
// (unaffordable, affordable and unviable counts; the best score over affordable candidates, its hold and its package).
// mirror() is checked on every call: on the candidate against searchIndustryPackages (counts and choice), on the old
// tree against the chooser's own result (viable > 0 exactly when it chose). A drift throws.
// Not reproduced: 1329's `employees` string (busy and refusal markers at decide time; no public reader). Not seen:
// staffing-blocked evaluations, which never call the chooser (hollywoodTick.ts:225); NOTES.md item 1.
// Writes OUT_ROOT/<S7_RUN>/: decide-diag.jsonl (one row per chooser call), decide-diag-summary.json.
import { it, vi } from 'vitest'
import { tick } from '../src/core/index.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import * as policy from '../src/core/hollywoodPolicy.js'
import { computeForecast } from '../src/core/forecast.js'
import { marketingCapacityForInputs, marketingMenuFromCapacity } from '../src/core/marketingMenu.js'
import { resolveShape } from '../src/core/shape.js'
import { TUNING } from '../src/core/tuning.js'
import { canon, requireTree, runOutput, sha, shelvingOf } from './zz-s7-lib.js'

const SEED = process.env.S7_SEED ?? 'p13a-core-causal-01'
const WEEKS = Number(process.env.S7_WEEKS ?? '520')

type Args = Parameters<typeof policy.chooseIndustryPackage>
type Search = (...args: Args) => { choice: unknown; affordable: number; unaffordable: number; viable: number }
// hollywoodPolicy.ts:18 BILLINGS, same order (strict-greater ties resolve to the first).
const BILLINGS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]] as const

/** hollywoodPolicy.ts:49-77 (candidate) / :46-72 (ff803032) with lockScreenplay true, plus the 1329 patch's counters
 * (diag-head-hollywoodPolicy.diff: bestScore and hold over every affordable candidate, before the viability gate). */
function mirror(input: Args[0], pol: Args[1], options: Args[2]) {
  const planning = policy.perceivedPlanningInputs(input)
  const actors = [planning.cast.lead, planning.cast.antagonist, planning.cast.support]
  const shape = planning.shape
  let affordable = 0, unaffordable = 0, viable = 0, bestScore = -Infinity
  let hold: number | null = null
  let best: { negative: number; marketing: number; total: number; contribution: number } | null = null
  for (const billing of BILLINGS) {
    const inp = { ...planning, shape, shapeEffects: resolveShape(shape),
      cast: { lead: actors[billing[0]]!, antagonist: actors[billing[1]]!, support: actors[billing[2]]! } }
    const required = inp.concept.baseNegativeCost * inp.shapeEffects.budgetDemandMultiplier * inp.era.costScale
    for (const scale of TUNING.HOLLYWOOD_NEGATIVE_CHOICES) {
      const negative = Math.round(required * scale * pol.negativeScale)
      const base = { ...inp, budget: { negative, marketing: 0 } }
      for (const marketing of marketingMenuFromCapacity(marketingCapacityForInputs(base, true))) {
        if (negative + marketing > options.cashAvailable) { unaffordable++; continue }
        affordable++
        const forecast = computeForecast({ ...base, budget: { negative, marketing } },
          { seed: options.seed, productionId: options.key, directorId: inp.director.id, releasedFilms: [], concepts: [inp.concept] }, true, true)
        const contribution = forecast.expectedTotal * TUNING.STUDIO_RENTAL_BLENDED - negative - marketing
        const holdMargin = -options.weeklyCost * (TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS)
        const operatingMargin = contribution + holdMargin
        const score = operatingMargin - Math.abs(marketing / Math.max(negative, 1) - pol.marketingRatio) * TUNING.HOLLYWOOD_POLICY_PREFERENCE_COST
        if (score > bestScore) {
          bestScore = score; hold = holdMargin
          best = { negative, marketing, total: Math.round(forecast.expectedTotal), contribution: Math.round(contribution) }
        }
        if (score > holdMargin) viable++
      }
    }
  }
  return { affordable, unaffordable, viable, bestScore, hold, best }
}

it('s7 decide diag', () => {
  if (!Number.isInteger(WEEKS) || WEEKS < 1) throw new Error(`S7_WEEKS must be a positive integer, got "${process.env.S7_WEEKS}"`)
  const tree = requireTree()
  const out = runOutput()
  const started = Date.now()
  const original = policy.chooseIndustryPackage
  const search = (policy as unknown as Record<string, unknown>).searchIndustryPackages as Search | undefined
  if ((tree === 'candidate') !== (typeof search === 'function')) throw new Error(`S7_TREE=${tree}, but searchIndustryPackages is ${typeof search}`)
  let week = -1
  let shelvedKeys = new Set<string>()
  const rows: string[] = []
  const counts: Record<string, Record<string, number>> = {}
  const spy = vi.spyOn(policy, 'chooseIndustryPackage').mockImplementation((input, pol, options) => {
    const result = original(input, pol, options)
    if (!options.lockScreenplay) return result // a commission search (hollywoodTick.ts:324), not an evaluation
    const m = mirror(input, pol, options)
    if (search !== undefined) {
      const s = search(input, pol, options)
      if (s.affordable !== m.affordable || s.unaffordable !== m.unaffordable || s.viable !== m.viable || canon(s.choice) !== canon(result))
        throw new Error(`decide-diag mirror drifted from searchIndustryPackages at week ${week} ${options.key}: `
          + JSON.stringify({ search: [s.affordable, s.unaffordable, s.viable], mirror: [m.affordable, m.unaffordable, m.viable] }))
    } else if ((m.viable > 0) !== (result !== null)) {
      throw new Error(`decide-diag mirror drifted from chooseIndustryPackage at week ${week} ${options.key}: viable ${m.viable}, choice ${result !== null}`)
    }
    const [studioId, , ready] = options.key.split(':') // `${studioId}:package:${scriptProjectId}` (hollywoodTick.ts:230)
    const retry = shelvedKeys.has(options.key)
    const outcome = result !== null ? 'viable' : m.unaffordable > 0 ? 'cashBlocked' : 'economicRejection' // hollywoodTick.ts:233-236
    const reserve = options.weeklyCost * pol.reserveWeeks // operatingReserve (hollywoodTick.ts:60-62); cashAvailable = cash - reserve
    const short = studioId!.slice(-3)
    // 1329 row keys and order (diag-head-hollywoodTick.diff), without `employees`; `retry`, `cast` and `outcome` are new.
    rows.push(JSON.stringify({ week, studio: short, ready, retry, director: input.director.id, craft: input.craftHires[0]?.id ?? null, actors: 3,
      cast: [input.cast.lead.id, input.cast.antagonist.id, input.cast.support.id],
      cash: Math.round(options.cashAvailable + reserve), reserve: Math.round(reserve), masks: options.promisedMasks?.size ?? 0,
      pol: { cash: m.unaffordable, evaluated: m.affordable, unviable: m.affordable - m.viable, bestScore: Math.round(m.bestScore), hold: m.hold, best: m.best },
      candidate: result ? { neg: result.budget.negative, mkt: result.budget.marketing, m: Math.round(result.expectedOperatingMargin) } : null,
      outcome }))
    const tally = (counts[short] ??= {})
    const k = `${retry ? 'retry' : 'ready'}:${outcome}`
    tally[k] = (tally[k] ?? 0) + 1
    return result
  })
  let state = p13aGeneratedStudio(SEED)
  try {
    while (state.market.tick < WEEKS) {
      week = state.market.tick
      // A shelved ordinal is outside the active index, so only the retry path evaluates it (hollywoodTick.ts:286-299).
      shelvedKeys = new Set(state.hollywood!.businesses.flatMap((b) => (shelvingOf(b)?.shelved ?? [])
        .map((s) => `${b.studioId}:package:${b.development.projects[s.ordinal]!.id}`)))
      state = tick(state)
    }
  } finally {
    spy.mockRestore()
  }
  const stateAtEndSha256 = sha(canon(state))
  out.write('decide-diag.jsonl', rows.join('\n') + '\n')
  out.write('decide-diag-summary.json', JSON.stringify({ seed: SEED, weeks: WEEKS, tree, rows: rows.length,
    countsByStudio: counts, stateAtEndSha256,
    note: 'stateAtEndSha256 must equal s7.json meta.finalStateSha256 of a natural-route run with the same tree, seed and weeks: the spy did not perturb the chain' }, null, 1) + '\n')
  console.log('S7 decide-diag', JSON.stringify({ seed: SEED, weeks: WEEKS, tree, rows: rows.length, ms: Date.now() - started, stateAtEndSha256 }))
}, 3_600_000)
