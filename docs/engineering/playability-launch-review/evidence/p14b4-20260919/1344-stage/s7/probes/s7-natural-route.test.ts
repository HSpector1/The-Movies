// 1344-s7 §7 probe: the 1329 natural-chain and rival-economy probes on one chain, plus the §7 measures.
// NOT RUN by the author. RUNBOOK.md copies it into a scratch tree as tests/zz-s7-natural-route.test.ts, beside
// tests/zz-s7-lib.ts, and runs it alone:
//   node_modules/.bin/vitest run --project core --no-cache tests/zz-s7-natural-route.test.ts
// Env: S7_RUN (output directory name, required), S7_TREE (candidate|old, required, checked against the source),
//      S7_SEED (default p13a-core-causal-01), S7_WEEKS (default 520).
// Method kept from 1329 (E/1329-c8/probe-natural-chain.test.ts.txt, probe-rival-economy.test.ts.txt): one chain from
// p13aGeneratedStudio(seed), natural ticks only (tick(state), no actions); for week = 0..WEEKS the state at tick `week`
// is sampled, then ticked. The two 1329 blocks below are verbatim, so on the old tree (ff803032, src equal to 133aca7a)
// their lines must reproduce 1329's recorded files byte for byte (the anchor in compare.py). The §7 measures cover the
// ticks that process weeks 0..WEEKS-1 and the state at tick WEEKS; only the 1329 summary line also reads the tick that
// processes week WEEKS, as 1329's did.
// Writes OUT_ROOT/<S7_RUN>/: natural-chain.jsonl, rival-economy.jsonl, weekly.jsonl, s7.json, final-state.json.
// Exit 0 means the probe measured; control verdicts are computed later by controls/check.py from s7.json.
import { it } from 'vitest'
import { tick, TUNING } from '../src/core/index.js'
import type { GameState } from '../src/core/index.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { makeSave } from '../src/core/save.js'
import { canon, digest, requireTree, runOutput, sha, shelvingOf, stripShelving } from './zz-s7-lib.js'
import type { Business } from './zz-s7-lib.js'

const SEED = process.env.S7_SEED ?? 'p13a-core-causal-01'
const WEEKS = Number(process.env.S7_WEEKS ?? '520')

type Ev = { week: number; id: string }
type Log = {
  announced: Ev[]; takes: Ev[]; released: Ev[]; commissions: Ev[]
  shelvings: { week: number; id: string; conceptId: string; rejections: number }[]
  retryViable: Ev[]
  retryRejected: { week: number; id: string; retryWeekBefore: number; retryWeekAfter: number }[]
}
type AnyReceipt = { eventId: string; week: number; studioId: string; kind: string; productionId?: string
  scriptProjectId?: string; conceptId?: string; rejections?: number }

it('s7 natural route', () => {
  if (!Number.isInteger(WEEKS) || WEEKS < 1) throw new Error(`S7_WEEKS must be a positive integer, got "${process.env.S7_WEEKS}"`)
  const tree = requireTree()
  const out = runOutput()
  const started = Date.now()
  let state = p13aGeneratedStudio(SEED)
  const playerId = state.hollywood!.playerStudioId

  // ── 1329 probe-natural-chain.test.ts.txt :9-14, verbatim. `s.studio.id` does not exist (Studio has no id), so
  // player(state) is undefined and every promise counts as a rival's; NOTES.md item 17. Kept for byte comparability;
  // s7.json `player` records whether the player issued any promise or proposal on this route.
  const player = (s: GameState) => (s.studio as unknown as { id?: string }).id
  let firstRivalOpen = -1, firstRivalSatisfied = -1, firstShared = -1
  const lines: string[] = []
  // ── 1329 probe-rival-economy.test.ts.txt :11, verbatim
  const economy: string[] = []
  // ── §7
  const weekly: string[] = []
  const series: unknown[] = []
  const logs = new Map<string, Log>()
  const logOf = (studioId: string): Log => {
    let log = logs.get(studioId)
    if (log === undefined) {
      log = { announced: [], takes: [], released: [], commissions: [], shelvings: [], retryViable: [], retryRejected: [] }
      logs.set(studioId, log)
    }
    return log
  }
  const controlC: unknown[] = []
  const integrity: string[] = []
  let filmsAt140: number | null = null
  let playerProposalWeeks = 0
  let playerShelvingReceipts = 0
  let atEnd: GameState | undefined
  let finalState = ''

  const appendOnly = (a: readonly { eventId: string }[], b: readonly { eventId: string }[]) =>
    b.length >= a.length && (a.length === 0 || b[a.length - 1]!.eventId === a[a.length - 1]!.eventId)
  const movementSums = (b: Business): Record<string, number> => {
    const sums: Record<string, number> = {}
    for (const period of b.account.periods) for (const [k, v] of Object.entries(period.movements)) sums[k] = (sums[k] ?? 0) + v
    return sums
  }
  const near = (x: number, y: number) => Math.abs(x - y) <= 0.01

  /** Control (c) at one shelving: 1344-A §3.2 "no money moves, and nothing is refunded"; §7 "the rival ledger reconciles". */
  const checkShelving = (w: number, pre: GameState, post: GameState, r: AnyReceipt) => {
    const preB = pre.hollywood!.businesses.find((b) => b.studioId === r.studioId)
    const postB = post.hollywood!.businesses.find((b) => b.studioId === r.studioId)
    const o = postB ? postB.development.projects.findIndex((p) => p.id === r.scriptProjectId) : -1
    if (!preB || !postB || o < 0) { integrity.push(`week ${w}: shelving receipt ${r.eventId} names no screenplay of ${r.studioId}`); return }
    const s0 = movementSums(preB), s1 = movementSums(postB)
    const deltas: Record<string, number> = {}
    for (const k of [...new Set([...Object.keys(s0), ...Object.keys(s1)])].sort()) {
      const d = (s1[k] ?? 0) - (s0[k] ?? 0)
      if (d !== 0) deltas[k] = d
    }
    // Greenlights in the same decision (the ready loop after the shelving, or a retry) are the only lawful
    // production and marketing spend of the week (hollywoodTick.ts greenlight :255-256).
    const greenlit = postB.projects.filter((row) => row.announcedWeek === w)
    const spent = (key: 'production' | 'marketing') => greenlit.reduce((sum, row) => sum + row[key], 0)
    let validator = 'ok'
    try { makeSave(post) } catch (e) { validator = (e as Error).message }
    controlC.push({
      week: w, studioId: r.studioId, scriptProjectId: r.scriptProjectId, ordinal: o,
      checks: {
        costRowUnchanged: canon(preB.projects[o]) === canon(postB.projects[o]),
        scriptProjectUnchanged: canon(preB.development.projects[o]) === canon(postB.development.projects[o]),
        readyAndOutsideIndex: postB.development.projects[o]!.status === 'ready' && !postB.activeScriptOrdinals.includes(o),
        productionDeltaEqualsSameWeekGreenlights: near(deltas.production ?? 0, -spent('production')),
        marketingDeltaEqualsSameWeekGreenlights: near(deltas.marketing ?? 0, -spent('marketing')),
        noDevelopmentMovement: (deltas.development ?? 0) === 0,
        noPositiveMovementExceptStudioRevenue: Object.entries(deltas).every(([k, d]) => k === 'studioRevenue' || d <= 0),
        cashChangeEqualsMovements: near(postB.account.cash - preB.account.cash, Object.values(deltas).reduce((x, y) => x + y, 0)),
        liveValidatorPasses: validator === 'ok',
      },
      deltas, sameWeekGreenlights: greenlit.map((row) => row.scriptProjectId), validator,
    })
  }

  /** Events of the tick that processes week w (pre at tick w, post at tick w+1). */
  const observe = (w: number, pre: GameState, post: GameState) => {
    const ph = pre.hollywood!, qh = post.hollywood!
    if (!appendOnly(ph.receipts, qh.receipts)) integrity.push(`week ${w}: industry receipts are not append-only`)
    if (!appendOnly(pre.firstTakes, post.firstTakes)) integrity.push(`week ${w}: firstTakes are not append-only`)
    for (const receipt of qh.receipts.slice(ph.receipts.length)) {
      const r = receipt as unknown as AnyReceipt
      if (r.kind === 'filmAnnounced') logOf(r.studioId).announced.push({ week: r.week, id: r.productionId! })
      else if (r.kind === 'filmReleased') logOf(r.studioId).released.push({ week: r.week, id: r.productionId! })
      else if (r.kind === 'screenplayShelved') {
        if (r.studioId === playerId) playerShelvingReceipts++
        logOf(r.studioId).shelvings.push({ week: r.week, id: r.scriptProjectId!, conceptId: r.conceptId!, rejections: r.rejections! })
        if (r.week !== w) integrity.push(`week ${w}: shelving receipt ${r.eventId} carries week ${r.week}`)
        checkShelving(w, pre, post, r)
      }
    }
    for (const t of post.firstTakes.slice(pre.firstTakes.length)) logOf(t.studioId).takes.push({ week: t.week, id: t.productionId })
    for (const b of qh.businesses) {
      const a = ph.businesses.find((x) => x.studioId === b.studioId)
      for (const p of b.development.projects.slice(a?.development.projects.length ?? 0)) logOf(b.studioId).commissions.push({ week: w, id: p.id })
      const after = shelvingOf(b)?.shelved ?? []
      for (const s of (a ? shelvingOf(a)?.shelved : undefined) ?? []) {
        const id = b.development.projects[s.ordinal]!.id
        const now = after.find((x) => x.ordinal === s.ordinal)
        if (now === undefined) {
          // A viable retry re-enters the index together with its greenlight (1344-F Amendment 1).
          if (b.activeScriptOrdinals.includes(s.ordinal) && b.projects[s.ordinal]?.announcedWeek === w) logOf(b.studioId).retryViable.push({ week: w, id })
          else integrity.push(`week ${w}: ${b.studioId} ${id} left the shelved list without a greenlight`)
        } else if (now.retryWeek !== s.retryWeek) {
          logOf(b.studioId).retryRejected.push({ week: w, id, retryWeekBefore: s.retryWeek, retryWeekAfter: now.retryWeek })
        }
      }
    }
  }

  for (let week = 0; week <= WEEKS; week++) {
    // ── 1329 probe-natural-chain.test.ts.txt :16-36, verbatim
    if (firstRivalOpen < 0 && state.talentMarket.proposals.some((p) => p.issuerStudioId !== player(state) && p.promises.length > 0)) firstRivalOpen = state.market.tick
    if (firstRivalSatisfied < 0 && state.promises.some((p) => p.issuerStudioId !== player(state) && p.outcome === 'SATISFIED')) firstRivalSatisfied = state.market.tick
    const groups = new Map<string, Set<string>>()
    for (const p of state.promises) {
      if (p.outcome !== 'SATISFIED') continue
      for (const e of p.evidenceRefs) groups.set(e, (groups.get(e) ?? new Set()).add(p.beneficiaryPersonId))
    }
    const maxShared = Math.max(0, ...[...groups.values()].map((g) => g.size))
    if (firstShared < 0 && maxShared >= 2) firstShared = state.market.tick
    if (week % 20 === 0 || week === WEEKS) {
      const byOutcome: Record<string, number> = {}
      const byFamily: Record<string, number> = {}
      for (const p of state.promises) {
        const k = `${p.issuerStudioId === player(state) ? 'player' : 'rival'}:${p.outcome ?? 'open'}`
        byOutcome[k] = (byOutcome[k] ?? 0) + 1
        byFamily[p.family] = (byFamily[p.family] ?? 0) + 1
      }
      lines.push(JSON.stringify({ week: state.market.tick, promises: state.promises.length, byOutcome, byFamily,
        firstTakes: state.firstTakes.length, rivalProposalsWithPromises: state.talentMarket.proposals.filter((p) => p.issuerStudioId !== player(state) && p.promises.length > 0).length,
        films: state.hollywood?.films.length ?? null, maxShared }))
    }
    // ── 1329 probe-rival-economy.test.ts.txt :13-27, verbatim (its `state: any`)
    if (week % 10 === 0 || week === WEEKS) {
      const s: any = state
      const h = s.hollywood
      const biz = (h?.businesses ?? []).map((b: any) => {
        const st: Record<string, number> = {}
        for (const p of b.development?.projects ?? []) st[p.status] = (st[p.status] ?? 0) + 1
        const emp = (h.employment ?? []).filter((e: any) => e.studioId === b.studioId && e.endedWeek === null).length
        return { id: b.studioId.slice(-3), cash: Math.round(b.account?.cash ?? NaN), prod: b.productions.length,
          dev: st, next: b.nextDecisionWeek, emp, films: h.films.filter((f: any) => f.studioId === b.studioId).length,
          runs: b.runs?.length }
      })
      const pst: Record<string, number> = {}
      for (const p of s.scriptDevelopment?.projects ?? []) pst[p.status] = (pst[p.status] ?? 0) + 1
      economy.push(JSON.stringify({ week: s.market.tick, player: { cash: Math.round(s.studio.cash), active: s.studio.activeProductions.length, dev: pst,
        firstTakes: s.firstTakes?.length, contracts: (s.contracts ?? []).length }, biz }))
    }
    // ── §7, the state at tick `week`: the stripped-state digest and each rival's account digest (compare.py finds
    // the first tick where candidate and old differ), the 10-week series, and the end state.
    {
      const h = state.hollywood!
      weekly.push(JSON.stringify({ w: state.market.tick, d: digest(stripShelving(state)),
        a: Object.fromEntries(h.businesses.map((b) => [b.studioId.slice(-3), digest(b.account)])) }))
      if (state.talentMarket.proposals.some((p) => p.issuerStudioId === playerId && p.promises.length > 0)) playerProposalWeeks++
      if (week % 10 === 0 || week === WEEKS) series.push({ week: state.market.tick, films: h.films.length, firstTakes: state.firstTakes.length,
        studios: Object.fromEntries(h.businesses.map((b) => [b.studioId.slice(-3), { cash: Math.round(b.account.cash),
          films: h.films.filter((f) => f.studioId === b.studioId).length,
          firstTakes: state.firstTakes.filter((t) => t.studioId === b.studioId).length,
          productions: b.productions.length, active: b.activeScriptOrdinals.length, shelved: shelvingOf(b)?.shelved.length ?? 0 }])) })
      if (week === 140) filmsAt140 = h.films.length
      if (week === WEEKS) { atEnd = state; finalState = canon(state) } // serialized before the 1329 summary's extra tick
    }
    const before = state
    state = tick(state)
    if (week < WEEKS) observe(week, before, state)
  }
  // ── 1329 probe-natural-chain.test.ts.txt :39-40, verbatim: the state after the loop (tick WEEKS + 1)
  lines.push(JSON.stringify({ summary: true, firstRivalOpen, firstRivalSatisfied, firstShared,
    promiseDetail: state.promises.map((p) => ({ id: p.promiseId, fam: p.family, issuer: p.issuerStudioId === player(state) ? 'player' : p.issuerStudioId, ben: p.beneficiaryPersonId, win: [p.windowStartWeek, p.dueWeekExclusive], out: p.outcome, ow: p.outcomeWeek, cause: p.outcomeCause, ev: p.evidenceRefs.length, contract: p.contractId !== null })) }))

  // ── §7 summary over processed weeks 0..WEEKS-1 and the state at tick WEEKS
  const end = atEnd!
  const h = end.hollywood!
  const firstAtOrAfter = (list: Ev[], w0: number) => list.find((e) => e.week >= w0) ?? null
  const summarize = (studioId: string, b: Business | undefined) => {
    const log = logOf(studioId)
    const weeks = log.shelvings.map((s) => s.week)
    const perYear: Record<string, number> = {}
    for (const w of weeks) perYear[Math.floor(w / 52)] = (perYear[Math.floor(w / 52)] ?? 0) + 1
    return {
      studioId, short: studioId.slice(-3),
      cashEnd: b ? b.account.cash : null,
      films: h.films.filter((f) => f.studioId === studioId).length,
      firstTakes: end.firstTakes.filter((t) => t.studioId === studioId).length,
      shelvings: log.shelvings,
      // year = floor(week / 52), the rival finance period rule (hollywood.ts:44); NOTES.md item 4
      shelvingsPerYear: perYear,
      maxShelvingsInAny52Weeks: Math.max(0, ...weeks.map((w0) => weeks.filter((w) => w >= w0 && w < w0 + 52).length)),
      retries: { viable: log.retryViable, economicRejection: log.retryRejected },
      shelvedAtEnd: b ? shelvingOf(b)?.shelved ?? [] : [],
      // "films again": the first announcement, first take and first release at or after each shelving week; NOTES.md item 2
      filmsAgain: log.shelvings.map((s) => ({ shelvingWeek: s.week, shelved: s.id, announced: firstAtOrAfter(log.announced, s.week),
        firstTake: firstAtOrAfter(log.takes, s.week), released: firstAtOrAfter(log.released, s.week) })),
      events: { announced: log.announced, firstTakes: log.takes, released: log.released, commissions: log.commissions },
    }
  }
  const businessIds = h.businesses.map((b) => b.studioId)
  const tuning = TUNING as unknown as Record<string, unknown>
  const s7 = {
    meta: { seed: SEED, weeks: WEEKS, tree, kit: '1344-s7 probes/s7-natural-route.test.ts', finalStateSha256: sha(finalState),
      tuning: { HOLLYWOOD_SHELVE_AFTER_REJECTIONS: tuning.HOLLYWOOD_SHELVE_AFTER_REJECTIONS ?? null,
        HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS: tuning.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS ?? null,
        HOLLYWOOD_SHELVED_RETRY_WEEKS: tuning.HOLLYWOOD_SHELVED_RETRY_WEEKS ?? null } },
    industryFilms: { filmsAt140, filmsAtEnd: h.films.length,
      filmsAddedFromWeek140: filmsAt140 === null ? null : h.films.length - filmsAt140,
      head1329: { commit: '133aca7a', filmsAt140: 53, filmsAt520: 53 } },
    studios: businessIds.map((id) => summarize(id, h.businesses.find((b) => b.studioId === id))),
    // Studios with logged events but no rival business at tick WEEKS (the player's own first takes land here).
    otherStudios: [...logs.keys()].filter((id) => !businessIds.includes(id)).map((id) => summarize(id, undefined)),
    player: { studioId: playerId, shelvingReceipts: playerShelvingReceipts,
      developmentHasShelvingKey: end.scriptDevelopment != null && Object.hasOwn(end.scriptDevelopment as unknown as object, 'screenplayShelving'),
      issuedPromisesAtEnd: end.promises.filter((p) => p.issuerStudioId === playerId).length, proposalWeeksWithPromises: playerProposalWeeks },
    series, controlC, integrity,
  }
  out.write('natural-chain.jsonl', lines.join('\n') + '\n')
  out.write('rival-economy.jsonl', economy.join('\n') + '\n')
  out.write('weekly.jsonl', weekly.join('\n') + '\n')
  out.write('s7.json', JSON.stringify(s7, null, 1) + '\n')
  out.write('final-state.json', finalState + '\n')
  console.log('S7 natural-route', JSON.stringify({ seed: SEED, weeks: WEEKS, tree, ms: Date.now() - started,
    finalStateSha256: sha(finalState), shelvings: controlC.length, integrity: integrity.length }))
  if (integrity.length > 0) throw new Error(`s7 natural-route: ${integrity.length} integrity failure(s); see s7.json integrity`)
}, 3_600_000)
