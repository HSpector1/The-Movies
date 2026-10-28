// Sprint 14 items 3-4: the shared natural-route loop behind campaign-measure.ts and rival-recovery-measure.ts.
// Copied beside them into the worktree root; imports are root-relative (as capture67.ts). Read-only over game
// state: no action, cash, roster, receipt or history is written; the rebuild comparison witnesses that.
import { createHash } from 'node:crypto'
import { closeSync, openSync, readFileSync, statSync, writeFileSync, writeSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { tick } from './src/core/tick.ts'
import { p13aGeneratedStudio } from './src/harness/p13a/fixtures.ts'
import { exportSave, makeSave, stableStringify, validateSaveV51, LIVE_SAVE_VERSION } from './src/core/save.ts'
import { LEGACY_BOUNDARY_WEEK } from './src/core/campaignLegacy.ts'
import { rivalCapacityOpex, rivalWeeklyOperatingCost } from './src/core/hollywood.ts'
import { weeklySalary } from './src/core/employment.ts'
import type { GameState } from './src/core/types.ts'
import type { HollywoodState, RivalBusiness } from './src/core/hollywoodTypes.ts'

export const ROUTE_ACTIONS = 'p13aGeneratedStudio(seed) from src/harness/p13a/fixtures.ts (unchanged since Save45 source d5e2dad1): '
  + 'generateWorld(seed) with economyEngagedEver true, ONE applyActions activateStudioOperations, initializeHollywood(fresh); '
  + 'then one tick per week: tick(state) on the default arm, tick(state, {deferPlayerClosure: true}) on the closure-deferred arm. '
  + 'No other player action (no hiring, film, rights, continuation, cameo or '
  + 'TV command); any rights/franchise/television rows come from engine and rival laws. Same route as 1361-GL-probe.ts runSeed '
  + 'and the 1363-V kit (1368-natural-recovery.test.ts). No cash, roster or controller input.'

export const sha = (v: string | Uint8Array): string => createHash('sha256').update(v).digest('hex')
export function fail(message: string): never { throw new Error(`sprint14-measure: ${message}`) }
export function need(ok: unknown, message: string): asserts ok { if (!ok) fail(message) }
const median = (xs: number[]): number => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!

export function outputDir(variable: string): string {
  const dir = process.env[variable]
  need(dir !== undefined && dir.startsWith('/') && statSync(dir).isDirectory(), `${variable} must name an existing absolute directory`)
  return dir
}
export function sourceHead(): string {
  const head = process.env.MEASURE_SOURCE_HEAD
  need(head !== undefined && /^[0-9a-f]{40}$/.test(head), 'MEASURE_SOURCE_HEAD must be the 40-hex HEAD the run.sh verified')
  return head
}
export const writeJson = (path: string, value: unknown): void =>
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
/** One exclusive ('wx') file per stream; rows are written as they happen so a later throw keeps earlier rows. */
function jsonl(path: string) {
  const fd = openSync(path, 'wx')
  return { row: (value: unknown): void => { writeSync(fd, JSON.stringify(value) + '\n') }, close: (): void => closeSync(fd) }
}
export const fileSha = (path: string): string => sha(readFileSync(path))

/** makeSave (validates and detaches) then the additional validateSaveV51, timed as 1367-K/1368-C paired them.
 * exportSave (validate + stable bytes) is outside both timers; its bytes give size and hash. */
export function saveProbe(state: GameState, samples: number) {
  const timings: { makeSaveMs: number; validateSaveV51Ms: number }[] = []
  let exported = ''
  for (let i = 0; i < samples; i++) {
    const t0 = performance.now(), save = makeSave(state), t1 = performance.now()
    validateSaveV51(save)
    need(save.saveVersion === LIVE_SAVE_VERSION, 'writer is not the live save version')
    timings.push({ makeSaveMs: t1 - t0, validateSaveV51Ms: performance.now() - t1 })
    const bytes = exportSave(save)
    need(i === 0 || bytes === exported, `week ${state.market.tick}: makeSave bytes differ between samples`)
    exported = bytes
  }
  return { week: state.market.tick, saveVersion: LIVE_SAVE_VERSION, bytes: Buffer.byteLength(exported), sha256: sha(exported), timings,
    medianMakeSaveMs: median(timings.map(t => t.makeSaveMs)), medianValidateSaveV51Ms: median(timings.map(t => t.validateSaveV51Ms)) }
}

const hollywood = (state: GameState): HollywoodState => state.hollywood ?? fail(`week ${state.market.tick}: hollywood root absent`)
const counts = (root: unknown) => root === undefined ? null
  : Object.fromEntries(Object.entries(root as Record<string, unknown>).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, (v as unknown[]).length]))
const movementSums = (b: RivalBusiness): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const p of b.account.periods) for (const [kind, amount] of Object.entries(p.movements)) out[kind] = (out[kind] ?? 0) + amount
  return out
}

type Mark = 'hire' | 'commission' | 'greenlight' | 'firstTake' | 'release' | 'revenue'
type RivalStats = {
  greenlightWeeks: number[]; releases: number; firstTakes: number; hires: number; commissions: number
  terminations: { week: number; contractId: string; weeklySalaryAvoided: number }[]
  refunds: { week: number; facilityId: string; refund: number }[]
  minimumCash: number; minimumCashWeek: number; firstNonpositiveWeek: number | null
  cuttingEpisodes: { since: number; endedWeek: number | null }[]
  firstAfterFirstCuttingEntry: Partial<Record<Mark, number>>
  /** Reserve reads cost a receipt scan, so they are taken at sampled weeks only (see rivalSampleDue). */
  sampledFirstBelowReserveWeek: number | null; sampledFirstBackAtReserveWeek: number | null
}

/** Charter 1363-A §6.2 read-outs that state alone can give (no source observers): per-week receipts, cash and the
 * cost-cutting episode; per-sample costs, reserve, headcount and money by kind; P15B condition, loans and closure. */
function rivalTracker() {
  const stats = new Map<string, RivalStats>()
  const stat = (b: RivalBusiness, week: number): RivalStats => {
    let s = stats.get(b.studioId)
    if (s === undefined) {
      s = { greenlightWeeks: [], releases: 0, firstTakes: 0, hires: 0, commissions: 0, terminations: [], refunds: [],
        minimumCash: b.account.cash, minimumCashWeek: week, firstNonpositiveWeek: null, cuttingEpisodes: [],
        firstAfterFirstCuttingEntry: {}, sampledFirstBelowReserveWeek: null, sampledFirstBackAtReserveWeek: null }
      stats.set(b.studioId, s)
    }
    return s
  }
  /** Returns true when a cutting episode, condition event, loan or closure happened this tick (forces a sample). */
  function observe(pre: GameState, post: GameState): boolean {
    const ph = hollywood(pre), h = hollywood(post), week = post.market.tick
    need(h.receipts.length >= ph.receipts.length && post.firstTakes.length >= pre.firstTakes.length, `week ${week}: receipt history shrank`)
    const fresh = h.receipts.slice(ph.receipts.length), takes = post.firstTakes.slice(pre.firstTakes.length)
    let eventful = post.corporateCondition.events.length !== pre.corporateCondition.events.length
      || post.corporateCondition.loans.length !== pre.corporateCondition.loans.length
      || post.studioClosure.closures.length !== pre.studioClosure.closures.length
    for (const b of h.businesses) {
      const s = stat(b, week), old = ph.businesses.find(x => x.studioId === b.studioId)
      const mine = fresh.filter(r => r.studioId === b.studioId)
      const marks: Partial<Record<Mark, boolean>> = {
        greenlight: mine.some(r => r.kind === 'filmAnnounced'),
        release: mine.some(r => r.kind === 'filmReleased'),
        firstTake: takes.some(t => t.studioId === b.studioId),
        hire: fresh.some(r => r.kind === 'employment' && r.toStudioId === b.studioId),
        commission: old !== undefined && b.development.projects.length > old.development.projects.length,
      }
      if (marks.greenlight) s.greenlightWeeks.push(week)
      s.releases += mine.filter(r => r.kind === 'filmReleased').length
      s.firstTakes += takes.filter(t => t.studioId === b.studioId).length
      s.hires += fresh.filter(r => r.kind === 'employment' && r.toStudioId === b.studioId).length
      if (old !== undefined) s.commissions += b.development.projects.length - old.development.projects.length
      for (const r of mine) {
        if (r.kind === 'employment' && r.reason === 'termination') {
          const contract = h.employment.find(e => e.contractId === r.contractId) ?? fail(`termination ${r.contractId} has no employment row`)
          s.terminations.push({ week: r.week, contractId: r.contractId, weeklySalaryAvoided: weeklySalary(contract.terms.annualSalary) })
        }
        if (r.kind === 'facilityDisposed') s.refunds.push({ week: r.week, facilityId: r.facilityId, refund: r.refund })
      }
      const cash = b.account.cash
      if (cash < s.minimumCash) { s.minimumCash = cash; s.minimumCashWeek = week }
      if (cash <= 0) s.firstNonpositiveWeek ??= week
      const since = b.costCutting.since, before = old?.costCutting.since ?? null
      if (since !== before) {
        eventful = true
        const open = s.cuttingEpisodes.at(-1)
        if (before !== null) need(open !== undefined && open.endedWeek === null, `${b.studioId}: cutting exit without an open episode`)
        if (before !== null) open!.endedWeek = week
        if (since !== null) s.cuttingEpisodes.push({ since, endedWeek: null })
      }
      const entry = s.cuttingEpisodes[0]?.since
      if (entry !== undefined && week > entry) {
        if (s.firstAfterFirstCuttingEntry.revenue === undefined && old !== undefined
          && (movementSums(b).studioRevenue ?? 0) > (movementSums(old).studioRevenue ?? 0)) s.firstAfterFirstCuttingEntry.revenue = week
        for (const [mark, present] of Object.entries(marks) as [Mark, boolean][]) if (present) s.firstAfterFirstCuttingEntry[mark] ??= week
      }
    }
    return eventful
  }
  function sample(state: GameState) {
    const h = hollywood(state), week = state.market.tick
    const roles = new Map(state.talent.map(t => [t.id, t.role]))
    const closed = new Map(state.studioClosure.closures.map(c => [c.studioId, c.closureWeek]))
    const stage = new Map(state.corporateCondition.studios.map(r => [r.studioId, r.condition.stage]))
    return h.businesses.map(b => {
      const employed = h.activeEmploymentOrdinals.map(i => h.employment[i] ?? fail(`employment ordinal ${i} missing`))
        .filter(e => e.studioId === b.studioId && e.endedWeek === null && e.terms.startWeek <= week && week < e.terms.endWeekExclusive)
      const headcount: Record<string, number> = {}
      for (const e of employed) { const role = roles.get(e.terms.talentId) ?? fail(`unknown employee ${e.terms.talentId}`); headcount[role] = (headcount[role] ?? 0) + 1 }
      const weeklyOperatingCost = rivalWeeklyOperatingCost(b, h, week), facilityOpex = rivalCapacityOpex(b, h.receipts)
      const payroll = employed.reduce((n, e) => n + weeklySalary(e.terms.annualSalary), 0)
      const reserve = weeklyOperatingCost * b.policy.reserveWeeks
      const s = stat(b, week)
      if (b.account.cash < reserve) s.sampledFirstBelowReserveWeek ??= week
      else if (s.sampledFirstBelowReserveWeek !== null) s.sampledFirstBackAtReserveWeek ??= week
      return { studioId: b.studioId, closedWeek: closed.get(b.studioId) ?? null, conditionStage: stage.get(b.studioId) ?? null,
        cash: b.account.cash, reserve, cashMinusReserve: b.account.cash - reserve, weeklyOperatingCost, payroll, facilityOpex,
        remainingOverhead: weeklyOperatingCost - payroll - facilityOpex, headcount, costCuttingSince: b.costCutting.since,
        productions: b.productions.length, runs: b.runs.length, activeScripts: b.activeScriptOrdinals.length,
        screenplays: b.development.projects.length, facilities: b.operations.facilities.map(f => f.capability),
        greenlights: s.greenlightWeeks.length, releases: s.releases, firstTakes: s.firstTakes, hires: s.hires,
        moneyByKindToDate: movementSums(b) }
    })
  }
  function summary(state: GameState) {
    const h = hollywood(state), end = state.market.tick
    return h.businesses.map(b => {
      const s = stat(b, end), closure = state.studioClosure.closures.find(c => c.studioId === b.studioId)
      const stage = state.corporateCondition.studios.find(r => r.studioId === b.studioId)?.condition.stage ?? null
      const marks = [0, ...s.greenlightWeeks, end], gaps = marks.slice(1).map((w, i) => w - marks[i]!)
      return { studioId: b.studioId, ...s, lastGreenlightWeek: s.greenlightWeeks.at(-1) ?? null,
        longestWeeksWithoutGreenlight: Math.max(...gaps), conditionStage: stage,
        conditionEvents: state.corporateCondition.events.filter(e => e.studioId === b.studioId)
          .map(e => ({ week: e.week, from: e.from, to: e.to, causes: e.causes.map(c => c.code) })),
        loans: state.corporateCondition.loans.filter(l => l.studioId === b.studioId)
          .map(l => ({ loanId: l.loanId, contractedWeek: l.contractedWeek, principal: l.principal, total: l.total, installments: l.installments.length })),
        closure: closure === undefined ? null : { closureWeek: closure.closureWeek, cash: closure.cash, loan: closure.loan },
        closureDueNotClosed: stage === 'closed' && closure === undefined,
        dormantSurvivor: s.cuttingEpisodes.length > 0 && closure === undefined && s.firstAfterFirstCuttingEntry.greenlight === undefined,
        annualPeriods: b.account.periods.map(p => ({ fromWeek: p.fromWeek, throughWeek: p.throughWeek, opening: p.opening, closing: p.closing, movements: p.movements })) }
    })
  }
  return { observe, sample, summary }
}

const rivalSampleDue = (week: number, horizon: number): boolean =>
  (week <= 520 && week % 10 === 0) || week % 520 === 0 || week === horizon // 1363-A §6.2 cadence; 1560..6240 are 520-multiples
const playerClosed = (state: GameState): boolean => state.studioClosure.closures.some(c => c.studioId === hollywood(state).playerStudioId)

function campaignRow(state: GameState) {
  const h = hollywood(state), player = h.playerStudioId
  const releasesByStudio: Record<string, number> = {}
  for (const r of h.receipts) if (r.kind === 'filmReleased') releasesByStudio[r.studioId] = (releasesByStudio[r.studioId] ?? 0) + 1
  const closed = new Set(state.studioClosure.closures.map(c => c.studioId))
  const stage = (id: string) => state.corporateCondition.studios.find(r => r.studioId === id)?.condition.stage ?? null
  const films = state.studio.releasedFilms
  return {
    week: state.market.tick,
    player: { cash: state.studio.cash, conditionStage: stage(player), closedWeek: state.studioClosure.closures.find(c => c.studioId === player)?.closureWeek ?? null,
      releases: films.length, releasesWeek312to519: films.filter(f => f.releaseTick >= 312 && f.releaseTick < 520).length,
      releasesFrom312: films.filter(f => f.releaseTick >= 312).length, releasesAfter2040: films.filter(f => f.releaseTick > LEGACY_BOUNDARY_WEEK).length,
      contracts: state.contracts.length, activeProductions: state.studio.activeProductions.length, operationsMode: state.operations.mode },
    rivals: { total: h.businesses.length, closed: h.businesses.filter(b => closed.has(b.studioId)).length,
      alive: h.businesses.filter(b => !closed.has(b.studioId)).length,
      closureDueNotClosed: h.businesses.filter(b => !closed.has(b.studioId) && stage(b.studioId) === 'closed').length,
      inCostCutting: h.businesses.filter(b => !closed.has(b.studioId) && b.costCutting.since !== null).length },
    industryFilmReleasedReceiptsByStudio: releasesByStudio,
    eraRoots: { rights: counts(state.rights), franchises: counts(state.franchises), cameos: counts(state.cameos), television: counts(state.television) },
  }
}

/** The two arms. 'default' is the G-L call, tick(state) with no options; since P15B (Save48) tick refuses after the
 * player's actual closure (studioClosure.ts assertOperatingPlayer), so this arm ends there. 'closure-deferred' passes the
 * engine's existing TickOptions.deferPlayerClosure (tick.ts:208-214; tests/helpers/p15b-live.ts advanceDeferred): the
 * player's closure is recorded as due and left due, rivals close as ever, no money moves. It runs only when 'default'
 * stopped short of the horizon. */
export type Arm = 'default' | 'closure-deferred'
const options = (arm: Arm) => arm === 'default' ? undefined : { deferPlayerClosure: true }

/** One natural route: rival rows on the §6.2 cadence; a campaign row and save probe every 520 weeks, at the horizon and
 * at the stop week (three paired samples at 6240 and at a horizon past it, as 1367-K; one elsewhere). */
export function runRoute(seed: string, horizon: number, arm: Arm, out: string) {
  const name = `${seed}.${arm}`, files = [`${name}.campaign.jsonl`, `${name}.rivals.jsonl`, `${name}.rival-summary.json`]
  const campaign = jsonl(join(out, files[0]!)), rivals = jsonl(join(out, files[1]!))
  const tracker = rivalTracker(), findings: string[] = [], finding = (text: string) => { findings.push(text); process.stderr.write(`FINDING ${name}: ${text}\n`) }
  let state = p13aGeneratedStudio(seed)
  need(state.market.tick === 0 && state.founding === null && state.hollywood !== null, `${seed}: unexpected genesis`)
  rivals.row({ week: 0, rivals: tracker.sample(state) })
  let routeMs = 0, intervalMs = 0, intervalMaxTickMs = 0, intervalStart = 0, officialSha: string | null = null
  const saves: Record<number, string> = {}
  let last: ReturnType<typeof saveProbe> | null = null
  while (state.market.tick < horizon && !playerClosed(state)) {
    const pre = state, t0 = performance.now()
    state = tick(pre, options(arm))
    const ms = performance.now() - t0
    need(state.market.tick === pre.market.tick + 1, `${name}: non-unit advance at ${pre.market.tick}`)
    routeMs += ms; intervalMs += ms; intervalMaxTickMs = Math.max(intervalMaxTickMs, ms)
    const week = state.market.tick, stop = week === horizon || playerClosed(state)
    if (tracker.observe(pre, state) || rivalSampleDue(week, horizon) || stop) rivals.row({ week, rivals: tracker.sample(state) })
    if (week === LEGACY_BOUNDARY_WEEK) {
      officialSha = state.campaignLegacy.official === null ? null : sha(stableStringify(state.campaignLegacy.official))
      if (officialSha === null) finding(`no official Legacy freeze at ${week}`)
    }
    if (week % 520 !== 0 && !stop) continue
    const official = state.campaignLegacy.official === null ? null : sha(stableStringify(state.campaignLegacy.official))
    if (week > LEGACY_BOUNDARY_WEEK && official !== officialSha) finding(`official Legacy changed after the ${LEGACY_BOUNDARY_WEEK} freeze (week ${week})`)
    last = saveProbe(state, week === LEGACY_BOUNDARY_WEEK || (stop && week > LEGACY_BOUNDARY_WEEK) ? 3 : 1)
    saves[week] = last.sha256
    campaign.row({ seed, arm, ...campaignRow(state), ticks: { fromWeek: intervalStart, intervalTickMs: intervalMs, intervalMaxTickMs, routeTickMs: routeMs },
      legacy: { officialFrozen: official !== null, officialSha256: official, endOfRunPresent: state.campaignLegacy.endOfRun !== null }, save: last })
    process.stderr.write(`[sprint14] ${name} week ${week}: route ${Math.round(routeMs)} ms, save ${last.bytes} B\n`)
    intervalStart = week; intervalMs = 0; intervalMaxTickMs = 0
  }
  campaign.close(); rivals.close()
  need(last !== null && last.week === state.market.tick, `${name}: no save probe at the stop week`)
  const final = campaignRow(state)
  if (state.market.tick < horizon) finding(`route ends at week ${state.market.tick}: the player's actual closure (closure/v1); tick refuses after it, so ${horizon} is not reached on this arm`)
  if (final.player.releasesWeek312to519 === 0 && state.market.tick >= 520) finding('no player release in weeks 312..519 (structural: the route issues no player production action)')
  if (final.player.releasesAfter2040 === 0 && state.market.tick > LEGACY_BOUNDARY_WEEK) finding(`no player release after ${LEGACY_BOUNDARY_WEEK} (structural: no player production action)`)
  writeJson(join(out, files[2]!), { seed, arm, horizon, finalWeek: state.market.tick, rivals: tracker.summary(state) })
  return { seed, arm, horizon, finalWeek: state.market.tick, routeTickMs: routeMs, finalSave: { bytes: last.bytes, sha256: last.sha256 },
    saveSha256ByCheckpoint: saves, final, findings, files: Object.fromEntries(files.map(f => [f, fileSha(join(out, f))])) }
}

/** Determinism: the same seed and arm rebuilt in this process to `week`, its export bytes hashed. */
export function rebuildSaveSha(seed: string, arm: Arm, week: number): string {
  let state = p13aGeneratedStudio(seed)
  while (state.market.tick < week) state = tick(state, options(arm))
  return sha(exportSave(makeSave(state)))
}

/** The default arm, then (only if it stopped short) the deferred arm; the arms' shared pre-closure checkpoints
 * should carry identical save bytes (two executions of one route, reported, not asserted: the option could act before
 * the closure week); the asserted determinism check is one rebuild of the same seed and arm to `rebuildTo`. */
export function measureSeed(seed: string, horizon: number, rebuildTo: number, out: string) {
  const arms = [runRoute(seed, horizon, 'default', out)]
  if (arms[0]!.finalWeek < horizon) arms.push(runRoute(seed, horizon, 'closure-deferred', out))
  const [first, second] = arms
  const shared = second === undefined ? [] : Object.keys(first!.saveSha256ByCheckpoint).map(Number)
    .filter(w => w < first!.finalWeek && second.saveSha256ByCheckpoint[w] !== undefined)
  const armsAgree = shared.map(w => ({ week: w, identical: first!.saveSha256ByCheckpoint[w] === second!.saveSha256ByCheckpoint[w] }))
  const target = arms.find(a => a.saveSha256ByCheckpoint[rebuildTo] !== undefined) ?? fail(`${seed}: no recorded save at ${rebuildTo}`)
  const rebuilt = rebuildSaveSha(seed, target.arm, rebuildTo)
  const rebuild = { arm: target.arm, week: rebuildTo, recorded: target.saveSha256ByCheckpoint[rebuildTo], rebuilt,
    identical: rebuilt === target.saveSha256ByCheckpoint[rebuildTo], method: 'same seed and arm rebuilt in this process; sha256 of exportSave bytes' }
  if (!armsAgree.every(a => a.identical)) process.stderr.write(`FINDING ${seed}: arms differ before the player's closure week (deferral effect or nondeterminism; the rebuild separates them)\n`)
  return { seed, horizon, arms, determinism: { armsAgree, rebuild, identical: rebuild.identical } }
}
