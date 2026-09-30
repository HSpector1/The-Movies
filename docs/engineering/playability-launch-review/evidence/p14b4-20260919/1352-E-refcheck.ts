// 1352-E disposable reference check (NOT part of the patch).
// A direct transcription of 1352-A §4 as amended by 1352-F / ruled by 1352-F2, written as a
// row table, compared against the production stepCondition / remedies / loan law over seeded
// random fact sequences. Also checks Lemma A, Lemma B (parametrized over the cover
// threshold), cause bounds, JSON safety, determinism and input non-mutation (inputs frozen).
import * as cc from '../tree/src/core/corporateCondition.ts'
import * as sl from '../tree/src/core/studioLoan.ts'
import { TUNING } from '../tree/src/core/tuning.ts'

type Stage = 'stable' | 'warning' | 'distress' | 'recovery' | 'closed'
type Facts = { week: number; cash: number; weeklyFixedCost: number; loanInstallment: number }
type Cond = { stage: Stage; since: number; week: number; lowRun: number; negativeRun: number; clearRun: number; distressWeeks: number }
type Cause = { code: string; weeks: number }
type Params = { warnCover: number; warnSustain: number; clear: number; distressSustain: number; recoveryStable: number; closure: number }
const CHARTER: Params = { warnCover: 4, warnSustain: 4, clear: 4, distressSustain: 8, recoveryStable: 13, closure: 26 }

// seeded PRNG (mulberry32) — disposable check only
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function refStep(prev: Cond | null, f: Facts, P: Params) {
  const O = f.weeklyFixedCost + f.loanInstallment
  // integer form of `cover < warnCover` (cover = cash/O, ±∞ at O = 0)
  const low = O > 0 ? f.cash < P.warnCover * O : f.cash < 0
  const neg = f.cash < 0
  const p: Cond = prev ?? { stage: 'stable', since: f.week, week: f.week - 1, lowRun: 0, negativeRun: 0, clearRun: 0, distressWeeks: 0 }
  const lowRun = low ? p.lowRun + 1 : 0
  const negativeRun = neg ? p.negativeRun + 1 : 0
  const clearRun = low ? 0 : p.clearRun + 1
  const dw = p.stage === 'distress' ? p.distressWeeks + 1 : 0
  const LC = { code: 'LOW_COVER', weeks: lowRun }
  const NC = { code: 'NEGATIVE_CASH', weeks: negativeRun }
  const CR = { code: 'COVER_RESTORED', weeks: clearRun }
  const DD = { code: 'DISTRESS_DURATION', weeks: dw }
  const toWarning = () => (negativeRun > 0 ? [LC, NC] : [LC])
  const rows: Array<[Stage, boolean, Stage, () => Cause[]]> = [
    ['stable', lowRun >= P.warnSustain, 'warning', toWarning],
    ['warning', negativeRun >= P.distressSustain, 'distress', () => [NC, LC]],
    ['warning', clearRun >= P.clear, 'stable', () => [CR]],
    ['distress', !low, 'recovery', () => [CR]],
    ['distress', dw >= P.closure && neg, 'closed', () => [DD, NC]],
    ['recovery', lowRun >= P.warnSustain, 'warning', toWarning],
    ['recovery', clearRun >= P.recoveryStable, 'stable', () => [CR]],
  ]
  const matching = rows.filter((r) => r[0] === p.stage && r[1])
  if (matching.length > 1) throw new Error(`LAW: ${matching.length} rows match from ${p.stage} (Lemma A violated)`)
  const row = matching[0]
  const stage = row ? row[2] : p.stage
  const next: Cond = {
    stage,
    since: row ? f.week : p.since,
    week: f.week,
    lowRun,
    negativeRun,
    clearRun,
    distressWeeks: stage === 'distress' ? (row ? 1 : dw) : 0,
  }
  return { next, transition: row ? { from: p.stage, to: stage, week: f.week, causes: row[3]() } : null, low, neg }
}

function deepFreeze<T>(o: T): T {
  if (o && typeof o === 'object') {
    for (const v of Object.values(o as object)) deepFreeze(v)
    Object.freeze(o)
  }
  return o
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
let failures = 0
function fail(msg: string) {
  failures++
  if (failures <= 20) console.log('FAIL', msg)
}

// ── random regime-based fact sequences ─────────────────────────────────────
function genSequence(r: () => number, startWeek: number, len: number): Facts[] {
  const out: Facts[] = []
  let week = startWeek
  while (out.length < len) {
    const regime = Math.floor(r() * 6)
    const runLen = 1 + Math.floor(r() * (r() < 0.3 ? 40 : 10))
    const wfc = r() < 0.08 ? 0 : 1 + Math.floor(r() * 5000)
    const inst = r() < 0.7 ? 0 : Math.floor(r() * 800)
    const O = wfc + inst
    for (let k = 0; k < runLen && out.length < len; k++) {
      let cash: number
      switch (regime) {
        case 0: cash = 4 * O + Math.floor(r() * 100_000); break // clear (not low)
        case 1: cash = Math.floor(r() * Math.max(1, 4 * O)); break // low, non-negative (includes 0)
        case 2: cash = -1 - Math.floor(r() * 1_000_000); break // negative
        case 3: cash = 4 * O - 1 + Math.floor(r() * 3); break // straddle the boundary: 4O-1, 4O, 4O+1
        case 4: cash = r() < 0.5 ? 0 : -1; break // zero / minus one
        default: cash = Math.floor((r() - 0.5) * 20 * Math.max(O, 1)); break // mixed
      }
      out.push({ week: week++, cash, weeklyFixedCost: wfc, loanInstallment: inst })
    }
  }
  return out
}

const rowCount: Record<string, number> = {}
let steps = 0
let sequences = 0
let maxCauses = 0

function runSequence(seq: Facts[], P: Params, checkAgainstImpl: boolean) {
  let refPrev: Cond | null = null
  let implPrev: Cond | null = null
  let prevStage: Stage = 'stable'
  const entries: number[] = []
  for (const f0 of seq) {
    const f = deepFreeze({ ...f0 })
    const ref = refStep(refPrev, f, P)
    steps++
    // Lemma A and ruling-2 invariants on the reference itself
    const n = ref.next
    if (ref.neg && !ref.low) fail('Lemma A: negative but not low')
    if (!(n.lowRun >= n.negativeRun)) fail('Lemma A: lowRun < negativeRun')
    if ((n.lowRun > 0) !== (n.clearRun === 0)) fail('Lemma A: lowRun>0 <=> clearRun=0')
    if ((n.distressWeeks > 0) !== (n.stage === 'distress')) fail('ruling 2: distressWeeks>0 <=> distress')
    // Lemma B: entering distress <=> negativeRun reaches DISTRESS_SUSTAIN outside distress
    const entered = ref.transition?.to === 'distress'
    const lemmaB = n.negativeRun === P.distressSustain && prevStage !== 'distress'
    if (entered !== lemmaB) fail(`Lemma B at week ${f.week}: entered=${entered} predicate=${lemmaB} prevStage=${prevStage}`)
    if (entered) entries.push(f.week)
    if (ref.transition) {
      const key = `${ref.transition.from}->${ref.transition.to}`
      rowCount[key] = (rowCount[key] ?? 0) + 1
      maxCauses = Math.max(maxCauses, ref.transition.causes.length)
      for (const c of ref.transition.causes) if (!(Number.isInteger(c.weeks) && c.weeks >= 1)) fail(`cause ${c.code} weeks ${c.weeks}`)
    }
    if (checkAgainstImpl) {
      const frozenPrev = implPrev === null ? null : deepFreeze({ ...implPrev })
      const impl = cc.stepCondition(frozenPrev, f)
      const impl2 = cc.stepCondition(frozenPrev, f) // determinism
      if (!same(impl, impl2)) fail(`nondeterministic at week ${f.week}`)
      if (!same(impl.next, ref.next)) fail(`next differs at week ${f.week}: impl ${JSON.stringify(impl.next)} ref ${JSON.stringify(ref.next)}`)
      if (!same(impl.transition, ref.transition)) fail(`transition differs at week ${f.week}: impl ${JSON.stringify(impl.transition)} ref ${JSON.stringify(ref.transition)}`)
      if (!same(JSON.parse(JSON.stringify(impl)), impl)) fail('not JSON-safe')
      const cover = cc.coverWeeks(f)
      if ((cover < P.warnCover) !== ref.low) fail(`coverWeeks low disagrees at week ${f.week}`)
      if (!same(cc.publicCondition(impl.next), { stage: ref.next.stage, since: ref.next.since })) fail('publicCondition')
      implPrev = impl.next
    }
    prevStage = n.stage
    refPrev = n
    if (n.stage === 'closed') {
      if (checkAgainstImpl) {
        let threw = false
        try {
          cc.stepCondition(implPrev, { ...f, week: f.week + 1 })
        } catch (e) {
          threw = /closed/i.test(String(e))
        }
        if (!threw) fail('closed prev did not throw /closed/')
      }
      break
    }
  }
  return entries
}

// 1. Implementation vs reference at the charter values
const r = rng(0x1352e)
const SCALE = Number(process.env.REFCHECK_SCALE ?? 1)
const SEQ = Math.max(1, Math.round(20_000 * SCALE))
for (let i = 0; i < SEQ; i++) {
  const seq = genSequence(r, Math.floor(r() * 5000) - 100, 20 + Math.floor(r() * 180))
  runSequence(seq, CHARTER, true)
  sequences++
}
// the charter's worked example, explicitly
{
  const seq = Array.from({ length: 33 }, (_, i) => ({ week: i + 1, cash: -500, weeklyFixedCost: 1000, loanInstallment: 0 }))
  let prev: cc.Condition | null = null
  const fired: string[] = []
  for (const f of seq) {
    const { next, transition } = cc.stepCondition(prev, f)
    if (transition) fired.push(`${transition.from}->${transition.to}@${transition.week}`)
    prev = next
  }
  const want = 'stable->warning@4,warning->distress@8,distress->closed@33'
  if (fired.join(',') !== want) fail(`worked example: ${fired.join(',')}`)
}
console.log(`impl-vs-ref: ${sequences} sequences, ${steps} steps, rows fired:`, JSON.stringify(rowCount), `max causes ${maxCauses}`)

// 2. Lemma B parametrized over the cover threshold (B2 non-blocking note): the implementation
// reads TUNING at call time, so the threshold is overridden for this block only and restored.
const tuning = TUNING as unknown as Record<string, number>
const original = tuning.CORPORATE_WARN_COVER_WEEKS
let lemmaSteps = 0
for (const warnCover of [1, 2, 4, 13, 50]) {
  tuning.CORPORATE_WARN_COVER_WEEKS = warnCover
  const P = { ...CHARTER, warnCover }
  const rr = rng(0xb2 + warnCover)
  const before = steps
  for (let i = 0; i < Math.max(1, Math.round(3000 * SCALE)); i++) runSequence(genSequence(rr, 0, 200), P, true)
  lemmaSteps += steps - before
}
tuning.CORPORATE_WARN_COVER_WEEKS = original
if (TUNING.CORPORATE_WARN_COVER_WEEKS !== 4) fail('TUNING not restored')
console.log(`lemma-B/impl-vs-ref over warnCover {1,2,4,13,50}: ${lemmaSteps} steps`)

// 3. remedies vs reference
let remedyCases = 0
const rrm = rng(0x9e3)
for (let i = 0; i < 50_000; i++) {
  const stage = (['stable', 'warning', 'distress', 'recovery'] as const)[Math.floor(rrm() * 4)]!
  const wfc = rrm() < 0.2 ? Math.floor(rrm() * 60) : Math.floor(rrm() * 20_000)
  const cap = deepFreeze({
    hasPendingRelease: rrm() < 0.5,
    terminableContracts: rrm() < 0.5 ? 0 : Math.floor(rrm() * 4),
    hasOutstandingLoan: rrm() < 0.4,
    founding: rrm() < 0.2,
  })
  const cond = deepFreeze({ stage, since: 1, week: 1, lowRun: 0, negativeRun: 0, clearRun: 1, distressWeeks: 0 })
  const facts = deepFreeze({ week: 2, cash: -1, weeklyFixedCost: wfc, loanInstallment: 0 })
  const maxP = Math.floor((26 * wfc) / 1000) * 1000
  const loanOk = (stage === 'warning' || stage === 'distress') && !cap.hasOutstandingLoan && !cap.founding && maxP >= 1000
  const want = [...(loanOk ? ['LOAN'] : []), ...(cap.terminableContracts > 0 ? ['REDUCE_OBLIGATIONS'] : []), ...(cap.hasPendingRelease ? ['RELEASE'] : [])]
  const got = cc.remedies(cond as cc.Condition, facts, cap)
  if (!same(got, want)) fail(`remedies ${JSON.stringify({ stage, wfc, cap })}: ${JSON.stringify(got)} vs ${JSON.stringify(want)}`)
  if (sl.loanEligible(stage, wfc, cap) !== loanOk) fail('loanEligible')
  remedyCases++
}
try {
  cc.remedies({ stage: 'closed', since: 1, week: 1, lowRun: 0, negativeRun: 0, clearRun: 0, distressWeeks: 0 }, { week: 2, cash: 1, weeklyFixedCost: 1, loanInstallment: 0 }, { hasPendingRelease: true, terminableContracts: 1, hasOutstandingLoan: false, founding: false })
  fail('remedies(closed) did not throw')
} catch {
  /* expected */
}
console.log(`remedies/loanEligible vs reference: ${remedyCases} cases`)

// 4. loan law vs reference
let loanCases = 0
let contracted = 0
const rl = rng(0x10a4)
for (let i = 0; i < 20_000; i++) {
  const wfc = rl() < 0.1 ? rl() * 5000 : Math.floor(rl() * 30_000)
  const maxP = Math.floor((26 * wfc) / 1000) * 1000
  if (sl.loanMaxPrincipal(wfc) !== maxP) fail(`loanMaxPrincipal(${wfc})`)
  const principal = rl() < 0.15 ? Math.floor((rl() - 0.3) * 50_000) : 1000 * Math.floor(rl() * (maxP / 1000 + 4))
  const week = Math.floor(rl() * 5000)
  const legal = Number.isInteger(principal) && principal > 0 && principal % 1000 === 0 && principal <= maxP
  let loan: sl.StudioLoan | null = null
  try {
    loan = sl.contractLoan(principal, wfc, week)
  } catch {
    loan = null
  }
  if ((loan !== null) !== legal) fail(`contractLoan legality principal=${principal} wfc=${wfc}`)
  if (loan) {
    contracted++
    const total = (principal * 112) / 100
    const q = Math.floor(total / 52)
    const rem = total - 52 * q
    if (loan.total !== total || loan.principal !== principal || loan.contractedWeek !== week) fail('loan header')
    if (loan.installments.length !== 52) fail('term')
    let sum = 0
    loan.installments.forEach((x, k) => {
      sum += x
      if (x !== q + (k < rem ? 1 : 0)) fail(`installment ${k}`)
      if (!Number.isInteger(x) || x < 1) fail('installment not a positive integer')
    })
    if (sum !== total) fail('sum')
    for (let w = week - 2; w <= week + 55; w++) {
      const k = w - week - 1
      const want = k >= 0 && k < 52 ? q + (k < rem ? 1 : 0) : 0
      if (sl.loanInstallmentDue(deepFreeze(loan), w) !== want) fail(`due week ${w}`)
    }
  }
  loanCases++
}
console.log(`loan law vs reference: ${loanCases} cases, ${contracted} contracted`)

console.log(failures === 0 ? 'REFCHECK PASS' : `REFCHECK FAIL (${failures} failures)`)
if (failures) process.exit(1)
