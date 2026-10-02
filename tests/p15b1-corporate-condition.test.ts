// ── P15B Wave 1 — the pure corporate condition law, RED tests (record 1352-C2) ──
//
// Authority: 1352-A-p15b-corporate-condition-charter.md §4 (the law
// `corporate-condition/v1`) and §5 (the RED list); 1352-F-parent-p15b-charter-
// adoption.md Amendments 1-4 and the "RED list after adoption" (this is the
// GOVERNING text where it differs from 1352-A, per the brief); 1352-B2 (the
// confirmatory ACCEPT, whose worked re-derivations this file reproduces
// independently rather than trusting); 1352-F2-parent-rulings-on-1352-C.md
// (the parent's rulings on 1352-C's three disclosed interpretations —
// GOVERNS over this file's own prior comments wherever they differ; see
// REVISION 1352-C2 below); Owner ruling 3 (1342-O, distress after warnings
// and meaningful recovery opportunities).
//
// RED-BY-DESIGN: `src/core/corporateCondition.ts` does not exist yet. Dynamic
// per-test import (`loadCondition()`), not a static top-level import, so each
// leaf gets its own attributed failure instead of one whole-file collection
// error (1346-C precedent, directly verified against this tree during method
// setup: a static import makes vitest report one "Failed Suite" with 0 tests
// collected, attributing every leaf to a single cascade rather than its own
// reason).
//
// EXPECTED VALUES: every non-trivial number here is derived BY HAND in a
// comment at its call site, from the amended §4.2 table text plus 1352-F2's
// rulings, never by importing or trusting a production implementation (none
// exists yet). The full week-by-week derivation tables are repeated in the
// revision record (1352-C2-p15b1-red-revision.md) for independent
// re-verification.
//
// FIRST-EVALUATION SEMANTICS (1352-F2 ruling 1, GOVERNS): `stepCondition(null,
// facts)` steps from an implicit zero condition (stage stable, every counter
// 0, since=facts.week, week=facts.week-1) using `facts` exactly as any other
// week — it does NOT drop or force-zero that week's own facts. A first
// evaluation with a healthy (non-low) week therefore returns `clearRun: 1`,
// not 0 (the counter genuinely increments from the zero baseline). A first
// evaluation with negative cash returns `lowRun: 1, negativeRun: 1,
// clearRun: 0`, and — since every counter is at most 1, below every
// threshold — `transition: null` always on the very first evaluation. This
// file's `bootstrap()` helper (week 0, healthy facts) still reproduces
// 1352-F's own worked example exactly, because week 1's own facts govern
// week 1's counters regardless of what week 0's counters were (re-derived
// below, in condition-transition-table's comments, not merely asserted).
//
// DISTRESSWEEKS (1352-F2 ruling 2, GOVERNS, completing Amendment 1):
// `next.distressWeeks` is 0 whenever `next.stage !== 'distress'`, CLOSED
// INCLUDED. The closure week's duration of 26 lives only in that
// transition's `DISTRESS_DURATION` cause, never in `Condition.distressWeeks`
// itself once the stage is `closed`.
//
// CAUSES (1352-F2 ruling 3, GOVERNS): every cause carries an integer
// duration read from the counter-step values of the transition week
// (LOW_COVER=lowRun, NEGATIVE_CASH=negativeRun, DISTRESS_DURATION=distressWeeks
// from the counter step before the transition resets it, COVER_RESTORED=
// clearRun), never `floor(cover)` (which can be -Infinity and is not
// JSON-safe). The exact ordered list per row: stable/recovery->warning is
// `[LOW_COVER, NEGATIVE_CASH?]` (the second only if negativeRun>0);
// warning->distress is `[NEGATIVE_CASH, LOW_COVER]`; warning->stable,
// distress->recovery, recovery->stable are each `[COVER_RESTORED]`;
// distress->closed is `[DISTRESS_DURATION, NEGATIVE_CASH]`.
//
// REVISION 1352-C2 (this file): parent rulings 1352-F2 on the three findings
// disclosed by 1352-C. Changed: the first-evaluation leaf's `clearRun`
// expectation (0 -> 1) plus a new negative-first-evaluation leaf (ruling 1);
// the closure transition's `Condition.distressWeeks` expectation (26 -> 0,
// ruling 2 completing the reading 1352-C already used for the recovery-exit
// case); the causes leaves replaced with exact list-and-value assertions per
// row (ruling 3); a new zero-obligation finite-and-JSON-safe causes leaf
// (ruling 3's -Infinity motivation). No other leaf changed. See
// 1352-C2-p15b1-red-revision.md for the full account and hand derivations.

import { describe, expect, it } from 'vitest'

// ── module loading (per-leaf attributed failure; see header) ──────────────
async function loadCondition(): Promise<Record<string, unknown>> {
  return (await import('../src/core/corporateCondition.js')) as unknown as Record<string, unknown>
}

function requireFn<T extends (...a: any[]) => any>(mod: Record<string, unknown>, name: string): T {
  const fn = mod[name]
  if (typeof fn !== 'function') {
    throw new Error(
      `RED: src/core/corporateCondition.ts does not export a function named '${name}' (got ${typeof fn}). ` +
        'This guard exists so a partially-implemented module fails loudly per-leaf instead of a vacuous pass.',
    )
  }
  return fn as T
}

function requireValue(mod: Record<string, unknown>, name: string): unknown {
  if (!(name in mod)) {
    throw new Error(`RED: src/core/corporateCondition.ts does not export a binding named '${name}'.`)
  }
  return mod[name]
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(value as object).sort()) out[k] = canonicalize((value as Record<string, unknown>)[k])
    return out
  }
  return value
}

function canonicalJSON(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

// ── shared fixture shapes (mirror the brief's pinned API field-for-field) ──
type Facts = { week: number; cash: number; weeklyFixedCost: number; loanInstallment: number }
type StepFn = (prev: unknown, facts: Facts) => { next: any; transition: any }

const DEFAULT_WFC = 1000 // O = 1000 with no loan installment; cover c = cash/1000, low iff cash<4000.

function fact(week: number, cash: number, weeklyFixedCost = DEFAULT_WFC, loanInstallment = 0): Facts {
  return { week, cash, weeklyFixedCost, loanInstallment }
}

// Bootstrap: week 0, healthy facts, forced stable/zero-counters per the
// PARENT API DECISIONS null-prev rule. See header note.
function bootstrap(stepCondition: StepFn): any {
  const { next, transition } = stepCondition(null, fact(0, 1_000_000, DEFAULT_WFC, 0))
  return { start: next, bootTransition: transition }
}

// Feed a row list (each row: partial Facts minus week) starting at week 1,
// chained from the bootstrap condition. Returns per-week conditions and
// transitions (1-indexed by array position, week = i+1).
function runFrom(
  stepCondition: StepFn,
  start: any,
  rows: Array<{ cash: number; weeklyFixedCost?: number; loanInstallment?: number }>,
  startWeek = 1,
): { conditions: any[]; transitions: any[] } {
  let prev = start
  const conditions: any[] = []
  const transitions: any[] = []
  for (let i = 0; i < rows.length; i++) {
    const week = startWeek + i
    const facts = fact(week, rows[i].cash, rows[i].weeklyFixedCost ?? DEFAULT_WFC, rows[i].loanInstallment ?? 0)
    const { next, transition } = stepCondition(prev, facts)
    conditions.push(next)
    transitions.push(transition)
    prev = next
  }
  return { conditions, transitions }
}

function negWeeks(n: number, cash = -500): Array<{ cash: number }> {
  return Array.from({ length: n }, () => ({ cash }))
}
function lowPositiveWeeks(n: number, cash = 2000): Array<{ cash: number }> {
  return Array.from({ length: n }, () => ({ cash }))
}
function clearWeeks(n: number, cash = 10_000): Array<{ cash: number }> {
  return Array.from({ length: n }, () => ({ cash }))
}

// ═══════════════════════════════════════════════════════════════════════
// ADDITIONAL TO THE NUMBERED RED LIST: module surface and the
// `stepCondition` precondition/throw contract from PARENT API DECISIONS
// (non-finite cash, negative/non-finite weeklyFixedCost, negative/
// non-integer loanInstallment, non-integer week, non-sequential week). No
// item in 1352-A §5 / 1352-F names this contract directly; it is exercised
// here because it is the money/state-machine trust boundary and the brief's
// own PARENT API DECISIONS text pins it in as much detail as any numbered
// item. Reported plainly as an addition, not folded into a numbered leaf's
// name, so the classification stays honest about what item it answers.
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: module surface and stepCondition preconditions', () => {
  it('condition-definition-version-export', async () => {
    const mod = await loadCondition()
    expect(requireValue(mod, 'CORPORATE_CONDITION_VERSION')).toBe('corporate-condition/v1')
  })

  it('step-condition-throws-on-non-sequential-week', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    expect(() => stepCondition(start, fact(0, 1000))).toThrow() // repeats week0
    expect(() => stepCondition(start, fact(5, 1000))).toThrow() // skips to week5
    expect(() => stepCondition(start, fact(-1, 1000))).toThrow() // goes backward
    expect(() => stepCondition(start, fact(1, 1000))).not.toThrow() // the one legal next week
  })

  it('step-condition-throws-on-invalid-facts', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    expect(() => stepCondition(start, fact(1, NaN))).toThrow() // non-finite cash
    expect(() => stepCondition(start, fact(1, Infinity))).toThrow()
    expect(() => stepCondition(start, { week: 1, cash: 1000, weeklyFixedCost: -1, loanInstallment: 0 })).toThrow() // negative wfc
    expect(() => stepCondition(start, { week: 1, cash: 1000, weeklyFixedCost: NaN, loanInstallment: 0 })).toThrow() // non-finite wfc
    expect(() => stepCondition(start, { week: 1, cash: 1000, weeklyFixedCost: 1000, loanInstallment: -1 })).toThrow() // negative installment
    expect(() => stepCondition(start, { week: 1, cash: 1000, weeklyFixedCost: 1000, loanInstallment: 1.5 })).toThrow() // non-integer installment
    expect(() => stepCondition(start, { week: 1.5, cash: 1000, weeklyFixedCost: 1000, loanInstallment: 0 })).toThrow() // non-integer week
  })
})

// ═══════════════════════════════════════════════════════════════════════
// REVISION 1352-C2, ruling 1 (1352-F2): the first evaluation counts its own
// week's facts exactly like any other week (it is not a forced-zero no-op).
// A first evaluation with negative cash therefore starts at lowRun=1,
// negativeRun=1, clearRun=0, and no transition is possible (every counter is
// at most 1, below every threshold). This is a genuinely NEW input shape
// (the null-prev call itself carrying negative facts), not a restatement of
// the healthy-bootstrap leaf above.
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: first-evaluation semantics (1352-F2 ruling 1)', () => {
  it('condition-first-evaluation-negative-cash', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    // wfc=1000, cash=-500 -> O=1000, cover=-0.5: low=true (cover<4) AND
    // negative=true (cash<0). Baseline (zero) prev: lowRun=0, negativeRun=0,
    // clearRun=0, distressWeeks=0, stage=stable. This week's counters:
    //   lowRun = low?0+1:0 = 1
    //   negativeRun = negative?0+1:0 = 1
    //   clearRun = low?0:0+1 = 0
    //   distressWeeks = (baseline stage stable, not distress) = 0
    // Transition check, from=stable: lowRun>=4? 1>=4 false -> no transition.
    const { next, transition } = stepCondition(null, fact(1, -500, 1000, 0))
    expect(transition).toBeNull()
    expect(next.stage).toBe('stable')
    expect(next.since).toBe(1)
    expect(next.week).toBe(1)
    expect(next.lowRun).toBe(1)
    expect(next.negativeRun).toBe(1)
    expect(next.clearRun).toBe(0)
    expect(next.distressWeeks).toBe(0)

    // REVISION 1352-C3 (review 1352-D, non-blocking note Q4): chain this
    // negative-first-evaluation result into one following week through the
    // normal runFrom() chaining helper (not an isolated stepCondition() call
    // in a vacuum), so a bug specific to "the negative-first-eval Condition
    // breaks the NEXT call" would be caught. A second consecutive negative
    // week (week2, still wfc=1000) continues accumulating from `next` as
    // prev: lowRun=1+1=2, negativeRun=1+1=2, clearRun=0 (still low),
    // distressWeeks=0 (baseline stage stable). Transition check, from=stable:
    // lowRun>=4? 2>=4 false -> no transition, still well short of warning.
    const chained = runFrom(stepCondition, next, [{ cash: -500 }], 2)
    expect(chained.transitions[0]).toBeNull()
    expect(chained.conditions[0].stage).toBe('stable')
    expect(chained.conditions[0].lowRun).toBe(2)
    expect(chained.conditions[0].negativeRun).toBe(2)
    expect(chained.conditions[0].clearRun).toBe(0)
    expect(chained.conditions[0].distressWeeks).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 1. condition-transition-table — every row of the AMENDED §4.2 table
//    (1352-F Amendments 1 & 2), including "at most one transition" per week.
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-transition-table', () => {
  it('condition-transition-table', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start, bootTransition } = bootstrap(stepCondition)
    // Bootstrap (1352-F2 ruling 1): the first evaluation steps from an
    // implicit zero condition using week 0's OWN (healthy) facts exactly as
    // any other week -- it is not a forced-zero no-op. cash=1,000,000,
    // wfc=1000 -> cover=1000, not low -> lowRun stays 0 (0?+1:0), negativeRun
    // stays 0, but clearRun = low?0:prev.clearRun+1 = 0+1 = 1 (a genuine
    // increment from the zero baseline, NOT 0). distressWeeks stays 0
    // (baseline stage was stable). No transition possible (lowRun=0<4).
    expect(bootTransition).toBeNull()
    expect(start.stage).toBe('stable')
    expect(start.since).toBe(0)
    expect(start.week).toBe(0)
    expect(start.lowRun).toBe(0)
    expect(start.negativeRun).toBe(0)
    expect(start.clearRun).toBe(1)
    expect(start.distressWeeks).toBe(0)

    // Re-derivation confirming the bootstrap's clearRun=1 (not 0) does NOT
    // change the worked example (1352-F2 ruling 1's own claim, re-checked
    // here rather than trusted): week1 below is negative, so low=true, and
    // clearRun = low?0:prev+1 unconditionally resets to 0 regardless of
    // start.clearRun's value (1 vs the old, wrong 0). Every downstream
    // counter in this run is therefore identical to the pre-ruling
    // derivation; only `start` itself (never fed forward past week1's reset)
    // differs.
    //
    // Full negative-from-week-1 run through closure (1352-F's own worked
    // example, reproduced independently): 33 weeks of cash=-500 (O=1000,
    // c=-0.5, always low AND negative).
    //   week1: lowRun1 negRun1        -> stable   (no transition; lowRun<4)
    //   week2: lowRun2 negRun2        -> stable
    //   week3: lowRun3 negRun3        -> stable
    //   week4: lowRun4 negRun4        -> WARNING  (stable->warning, lowRun>=4)
    //   week5: lowRun5 negRun5        -> warning  (no transition; negRun<8)
    //   week6: lowRun6 negRun6        -> warning
    //   week7: lowRun7 negRun7        -> warning
    //   week8: lowRun8 negRun8        -> DISTRESS (warning->distress, negRun>=8);
    //          distressWeeks OVERRIDDEN to 1 (Amendment 1)
    //   week9..32: distressWeeks = 2..25 (still low+negative every week, so
    //          "not low" never fires and distressWeeks<26 never fires)
    //   week33: distressWeeks = 26, negative=true -> CLOSED (distress->closed)
    const rows = negWeeks(33, -500)
    const { conditions, transitions } = runFrom(stepCondition, start, rows)

    // Row: stable | lowRun>=4 -> warning
    expect(transitions[0]).toBeNull() // week1
    expect(transitions[1]).toBeNull() // week2
    expect(transitions[2]).toBeNull() // week3
    expect(transitions[3]).toEqual(expect.objectContaining({ from: 'stable', to: 'warning', week: 4 })) // week4
    expect(conditions[3].stage).toBe('warning')
    expect(conditions[3].since).toBe(4)
    expect(conditions[3].lowRun).toBe(4)

    // Row: warning | clearRun>=4 -> stable — not exercised on this branch
    // (cash stays negative, so clearRun is pinned at 0 throughout); exercised
    // separately below and in condition-no-single-week-skip.

    // Row: warning | negativeRun>=8 -> distress
    expect(transitions[4]).toBeNull() // week5
    expect(transitions[5]).toBeNull() // week6
    expect(transitions[6]).toBeNull() // week7
    expect(transitions[7]).toEqual(expect.objectContaining({ from: 'warning', to: 'distress', week: 8 })) // week8
    expect(conditions[7].stage).toBe('distress')
    expect(conditions[7].since).toBe(8)
    expect(conditions[7].negativeRun).toBe(8)
    expect(conditions[7].distressWeeks).toBe(1) // Amendment 1 override on the entry week

    // Row: distress | not low -> recovery — not exercised on this branch
    // (cash stays low the whole way); exercised in condition-recovery-declines-as-stable.

    // Row: distress | distressWeeks>=26 and negative -> closed
    for (let w = 9; w <= 32; w++) {
      expect(transitions[w - 1]).toBeNull()
      expect(conditions[w - 1].stage).toBe('distress')
      expect(conditions[w - 1].distressWeeks).toBe(w - 8 + 1) // week9->2 ... week32->25
    }
    expect(conditions[24].distressWeeks).toBe(18) // sanity: week25 -> 25-8+1=18
    expect(transitions[32]).toEqual(expect.objectContaining({ from: 'distress', to: 'closed', week: 33 })) // week33
    expect(conditions[32].stage).toBe('closed')
    expect(conditions[32].since).toBe(33)
    // 1352-F2 ruling 2: distressWeeks is 0 whenever the CURRENT stage is not
    // distress, closed included; the closure week's duration of 26 lives
    // only in the transition's DISTRESS_DURATION cause (pinned in
    // condition-causes-bounded-closure-exact below), never in
    // Condition.distressWeeks once stage is 'closed'.
    expect(conditions[32].distressWeeks).toBe(0)

    // "At most one transition" per week: every transition object in this run,
    // where non-null, names exactly one from/to pair (the type itself allows
    // only one, but assert the shape holds for every non-null entry, i.e. no
    // leaf ever receives an array or a second competing transition field).
    for (const t of transitions) {
      if (t === null) continue
      expect(typeof t.from).toBe('string')
      expect(typeof t.to).toBe('string')
      expect(t.from).not.toBe(t.to)
    }
    // Exactly two non-null transitions fired on the stable->warning->distress
    // leg before closure (week4, week8), plus the closure transition (week33):
    // three total out of 33 weeks, matching the table's "at most one
    // transition per week, and only when a row's predicate is met" property.
    expect(transitions.filter((t) => t !== null).length).toBe(3)

    // Row: recovery | lowRun>=4 -> warning, and recovery | clearRun>=13 -> stable
    // (Amendment 2's replaced recovery rows) are pinned in
    // condition-recovery-declines-as-stable, not duplicated here.
    // (definitionVersion export is pinned in the module-surface block above.)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 1a. condition-distress-weeks-exact (1352-F) — entry week=1, next week=2,
//     relapse entry restarts at 1.
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-distress-weeks-exact', () => {
  it('condition-distress-weeks-exact', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)

    // Entry week (week8, per the derivation above): distressWeeks=1.
    // Next week (week9): distressWeeks=2 (plain counter increment).
    const first = runFrom(stepCondition, start, negWeeks(9, -500))
    expect(first.conditions[7].stage).toBe('distress')
    expect(first.conditions[7].distressWeeks).toBe(1) // week8, entry
    expect(first.conditions[8].stage).toBe('distress')
    expect(first.conditions[8].distressWeeks).toBe(2) // week9

    // Relapse: distress (weeks1-8) -> recovery (cover restored, weeks9-?) ->
    // warning (four low weeks) -> distress again (eight more negative
    // weeks). The SECOND distress entry must restart distressWeeks at 1, not
    // continue accumulating from the first bout.
    //   weeks1-8:   cash=-500          -> distress at week8 (distressWeeks=1)
    //   week9:      cash=10_000 (c=10, not low) -> distress->recovery (not low)
    //   weeks10-13: cash=2_000 (c=2, low, not negative) -> lowRun climbs
    //               1(w10),2(w11),3(w12),4(w13) -> recovery->warning at week13
    //   weeks14-21: cash=-500 (negative) -> negativeRun climbs 1..8 over
    //               weeks14-21 -> warning->distress at week21, distressWeeks
    //               RESTARTS at 1 (not 9, which a buggy "keep accumulating"
    //               implementation might produce).
    const rows = [
      ...negWeeks(8, -500), // weeks 1-8: distress at week8
      { cash: 10_000 }, // week9: recovery (not low)
      ...lowPositiveWeeks(4, 2000), // weeks10-13: warning at week13
      ...negWeeks(8, -500), // weeks14-21: distress (relapse) at week21
    ]
    const { conditions, transitions } = runFrom(stepCondition, start, rows)
    expect(conditions[7].stage).toBe('distress') // week8
    expect(conditions[7].distressWeeks).toBe(1)
    expect(transitions[8]).toEqual(expect.objectContaining({ from: 'distress', to: 'recovery', week: 9 }))
    expect(conditions[8].stage).toBe('recovery')
    expect(conditions[8].distressWeeks).toBe(0) // no longer in distress (1352-F2 ruling 2 confirms this reading)
    expect(transitions[12]).toEqual(expect.objectContaining({ from: 'recovery', to: 'warning', week: 13 }))
    expect(conditions[12].stage).toBe('warning')
    expect(transitions[20]).toEqual(expect.objectContaining({ from: 'warning', to: 'distress', week: 21 }))
    expect(conditions[20].stage).toBe('distress')
    expect(conditions[20].distressWeeks).toBe(1) // RESTART, not 9
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 2. condition-no-single-week-skip
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-no-single-week-skip', () => {
  it('condition-no-single-week-skip-single-negative-week', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // One negative week (week1=-100), then five weeks of high cover
    // (cash=10_000, c=10, not low). No transition ever fires.
    const rows = [{ cash: -100 }, ...clearWeeks(5, 10_000)]
    const { conditions, transitions } = runFrom(stepCondition, start, rows)
    for (const t of transitions) expect(t).toBeNull()
    for (const c of conditions) expect(c.stage).toBe('stable')
    expect(conditions[0].lowRun).toBe(1)
    expect(conditions[0].negativeRun).toBe(1)
    expect(conditions[1].lowRun).toBe(0) // resets: week2 is not low
    expect(conditions[1].negativeRun).toBe(0)
  })

  it('condition-no-single-week-skip-four-week-negative-streak-gives-warning-only', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // Exactly 4 consecutive negative weeks (weeks1-4=-100), then 4 clear
    // weeks (weeks5-8=10_000, not low) to close the loop back to stable.
    // weeks1-3: lowRun1,2,3 negRun1,2,3 -> stable (no transition)
    // week4:    lowRun4 negRun4         -> WARNING (stable->warning)
    // week5:    clearRun1 (not low)     -> warning (no transition; clearRun<4)
    // week6:    clearRun2               -> warning
    // week7:    clearRun3               -> warning
    // week8:    clearRun4               -> STABLE (warning->stable, clear resolution)
    // negativeRun never exceeds 4 anywhere in this run, so distress is
    // impossible (needs negativeRun>=8): "warning only", never distress.
    const rows = [...negWeeks(4, -100), ...clearWeeks(4, 10_000)]
    const { conditions, transitions } = runFrom(stepCondition, start, rows)
    expect(transitions[3]).toEqual(expect.objectContaining({ from: 'stable', to: 'warning', week: 4 }))
    expect(conditions[3].negativeRun).toBe(4)
    expect(transitions[4]).toBeNull() // week5, clearRun=1
    expect(transitions[5]).toBeNull() // week6, clearRun=2
    expect(transitions[6]).toBeNull() // week7, clearRun=3
    expect(transitions[7]).toEqual(expect.objectContaining({ from: 'warning', to: 'stable', week: 8 })) // clearRun=4
    expect(conditions[7].stage).toBe('stable')
    // Never distress anywhere in this 8-week run.
    for (const c of conditions) expect(c.stage).not.toBe('distress')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 3. condition-one-bad-film
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-one-bad-film', () => {
  it('condition-one-bad-film', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // A one-week drop to a HUGE negative X (one catastrophically bad film's
    // cost absorbed in a single week), immediately followed by cover >= 4
    // sustained for 50 weeks. Only DURATION of low/negative matters to the
    // counters, never magnitude: a -10,000,000 week is exactly as
    // consequential to the counters as a -1 week (both are "low" and
    // "negative" for exactly one week, then reset).
    const rows = [{ cash: -10_000_000 }, ...clearWeeks(50, 10_000)]
    const { conditions, transitions } = runFrom(stepCondition, start, rows)
    for (const t of transitions) expect(t).toBeNull()
    for (const c of conditions) expect(c.stage).toBe('stable')
    expect(conditions[0].lowRun).toBe(1)
    expect(conditions[0].negativeRun).toBe(1)
    expect(conditions[1].lowRun).toBe(0)
    expect(conditions[1].negativeRun).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 4. condition-distress-after-warning
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-distress-after-warning', () => {
  it('condition-distress-after-warning-minimal-timing', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // Fully negative from week1 (same sequence as the transition-table leaf,
    // isolated here to pin the specific claim): warning fires at week4;
    // distress CANNOT fire before week8 (negativeRun<8 through week7), and
    // DOES fire at week8, exactly 4 weeks after warning began (the minimal
    // possible gap, since every negative week is also low, so lowRun always
    // leads negativeRun by construction here — both start accumulating on
    // week1 in this fully-negative case).
    const rows = negWeeks(8, -500)
    const { conditions, transitions } = runFrom(stepCondition, start, rows)
    expect(conditions[3].stage).toBe('warning') // week4
    expect(conditions[4].stage).toBe('warning') // week5: negRun=5<8
    expect(conditions[5].stage).toBe('warning') // week6: negRun=6<8
    expect(conditions[6].stage).toBe('warning') // week7: negRun=7<8
    expect(transitions[4]).toBeNull()
    expect(transitions[5]).toBeNull()
    expect(transitions[6]).toBeNull()
    expect(conditions[7].stage).toBe('distress') // week8: negRun=8
    expect(transitions[7]).toEqual(expect.objectContaining({ from: 'warning', to: 'distress', week: 8 }))
  })

  it('condition-distress-after-warning-extended-warning-duration', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // Warning can persist far longer than 4 weeks before distress fires: the
    // trigger is strictly negativeRun>=8, never a fixed "4 weeks into
    // warning" gate. 10 weeks of low-but-POSITIVE cash (cover=2, cash=2000>0)
    // hold the studio in warning (lowRun climbs, negativeRun stays 0)
    // BEFORE any negative cash appears; only once an actual 8-week negative
    // run begins (weeks11-18) does distress fire, at week18 — 14 weeks after
    // warning began at week4, not 4.
    //   weeks1-3:  lowRun1,2,3  -> stable
    //   week4:     lowRun4      -> WARNING
    //   weeks5-10: lowRun5..10, negRun=0 throughout -> warning (no transition)
    //   weeks11-17: negRun1..7  -> warning (no transition; negRun<8)
    //   week18:     negRun8     -> DISTRESS
    const rows = [...lowPositiveWeeks(10, 2000), ...negWeeks(8, -500)]
    const { conditions, transitions } = runFrom(stepCondition, start, rows)
    expect(transitions[3]).toEqual(expect.objectContaining({ from: 'stable', to: 'warning', week: 4 }))
    for (let w = 5; w <= 17; w++) {
      expect(conditions[w - 1].stage).toBe('warning')
      expect(transitions[w - 1]).toBeNull()
    }
    expect(conditions[17].stage).toBe('distress') // week18
    expect(transitions[17]).toEqual(expect.objectContaining({ from: 'warning', to: 'distress', week: 18 }))
    expect(conditions[17].distressWeeks).toBe(1)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 5 (replaced by 1352-F) condition-recovery-declines-as-stable
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-recovery-declines-as-stable', () => {
  it('condition-recovery-declines-as-stable-13-clear-weeks-to-stable', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // Reach distress (weeks1-8), then "not low" (cover>=4) exits to
    // recovery at week9 (the FIRST clear week, clearRun=1), then 12 MORE
    // clear weeks (weeks10-21) bring clearRun to 13 on week21 (the 13th
    // clear week counting week9 as the first: 9+12=21, NOT week22 -- a
    // self-caught off-by-one in this leaf's own prior draft, found by an
    // independent reference-simulator cross-check during the 1352-C2
    // revision pass and corrected here; see 1352-C2-p15b1-red-revision.md).
    const rows = [...negWeeks(8, -500), ...clearWeeks(13, 10_000)]
    const { conditions, transitions } = runFrom(stepCondition, start, rows)
    expect(transitions[8]).toEqual(expect.objectContaining({ from: 'distress', to: 'recovery', week: 9 }))
    expect(conditions[8].stage).toBe('recovery')
    expect(conditions[8].clearRun).toBe(1)
    // weeks10-20: clearRun 2..12, no transition until clearRun reaches 13
    for (let w = 10; w <= 20; w++) {
      expect(conditions[w - 1].stage).toBe('recovery')
      expect(transitions[w - 1]).toBeNull()
    }
    expect(conditions[19].clearRun).toBe(12) // week20, the 12th clear week
    expect(transitions[20]).toEqual(expect.objectContaining({ from: 'recovery', to: 'stable', week: 21 })) // clearRun=13, the 13th
    expect(conditions[20].stage).toBe('stable')
    expect(conditions[20].clearRun).toBe(13)
  })

  it('condition-recovery-declines-as-stable-relapse-only-through-warning-after-8-negative-weeks', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // From recovery, a SHORT negative run (fewer than 8 weeks) is absorbed
    // via the (Amendment 2) row `recovery | lowRun>=4 -> warning`, exactly
    // as stable declines, and does NOT jump straight back to distress
    // (Amendment 2 removes the old `recovery|negative->distress` row).
    // Reach recovery at week9 via a genuine one-week breather (cash=10_000,
    // cover=10, not low; without this breather the run is just one
    // continuous negative streak and never reaches recovery at all). Then
    // 4 negative weeks (weeks10-13): lowRun climbs 1..4 -> recovery->warning
    // at week13 (NOT distress: negativeRun is only 4<8 at that point).
    const prefix = [...negWeeks(8, -500), { cash: 10_000 }]
    const shortRelapse = runFrom(stepCondition, start, [...prefix, ...negWeeks(4, -500)])
    expect(shortRelapse.conditions[8].stage).toBe('recovery') // week9
    expect(shortRelapse.transitions[12]).toEqual(expect.objectContaining({ from: 'recovery', to: 'warning', week: 13 }))
    expect(shortRelapse.conditions[12].stage).toBe('warning')
    expect(shortRelapse.conditions[12].stage).not.toBe('distress')
    expect(shortRelapse.conditions[12].negativeRun).toBe(4)

    // Continuing the SAME negative streak for a further 4 weeks (8 total in
    // this bout, weeks10-17) reaches distress again, at week17 (negativeRun
    // reaches 8 counting from week10), NOT at week13, and NOT merely from
    // having relapsed into warning.
    const fullRelapse = runFrom(stepCondition, start, [...prefix, ...negWeeks(8, -500)])
    expect(fullRelapse.conditions[12].stage).toBe('warning') // week13: negRun=4 (this bout)
    expect(fullRelapse.transitions[16]).toEqual(expect.objectContaining({ from: 'warning', to: 'distress', week: 17 }))
    expect(fullRelapse.conditions[16].distressWeeks).toBe(1)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 5b. condition-no-single-week-distress (1352-F)
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-no-single-week-distress', () => {
  it('condition-no-single-week-distress-from-stable-and-warning', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // From stable: a 7-week negative run (one short of the 8 needed) passes
    // through warning (at week4) but never reaches distress, anywhere in
    // the run.
    const rows = negWeeks(7, -500)
    const { conditions } = runFrom(stepCondition, start, rows)
    for (const c of conditions) expect(c.stage).not.toBe('distress')
    expect(conditions[6].stage).toBe('warning') // week7: negRun=7<8
    expect(conditions[6].negativeRun).toBe(7)
  })

  it('condition-no-single-week-distress-from-recovery', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // Reach recovery at week9 via a genuine one-week breather (cash=10_000,
    // cover=10, not low; without this breather the run is one continuous
    // negative streak and never reaches recovery at all). Then a 7-week
    // negative run (weeks10-16): passes through warning at week13 (lowRun=4)
    // but never reaches distress (negativeRun stops at 7, one short of 8).
    const rows = [...negWeeks(8, -500), { cash: 10_000 }, ...negWeeks(7, -500)]
    const { conditions } = runFrom(stepCondition, start, rows)
    expect(conditions[8].stage).toBe('recovery') // week9
    for (const c of conditions.slice(8)) expect(c.stage).not.toBe('distress')
    expect(conditions[15].stage).toBe('warning') // week16: lowRun=4 since week13
    expect(conditions[15].negativeRun).toBe(7)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 6. condition-closure
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-closure', () => {
  it('condition-closure-at-exactly-26-distress-weeks-with-negative-cash', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // Reuse the full 33-week fully-negative derivation (see
    // condition-transition-table): closure fires at exactly week33, the
    // earliest possible route (33 consecutive negative weeks from week1).
    const rows = negWeeks(33, -500)
    const { conditions, transitions } = runFrom(stepCondition, start, rows)
    for (let w = 1; w <= 32; w++) expect(conditions[w - 1].stage).not.toBe('closed')
    expect(transitions[32]).toEqual(expect.objectContaining({ from: 'distress', to: 'closed', week: 33 }))
    expect(conditions[32].stage).toBe('closed')
  })

  it('condition-closure-never-with-non-negative-cash', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // 40 weeks of low-but-non-negative cash (cash=0 exactly: negative is
    // cash<0, so cash=0 is low (0<4000) but NOT negative). distressWeeks
    // never applies because the studio never even reaches distress (negRun
    // stays 0 forever, since cash is never <0); this also directly shows
    // closure needs negative cash, not merely low cash, however long
    // sustained.
    const rows = lowPositiveWeeks(40, 0)
    const { conditions } = runFrom(stepCondition, start, rows)
    for (const c of conditions) {
      expect(c.stage).not.toBe('closed')
      expect(c.stage).not.toBe('distress')
    }
    expect(conditions[3].stage).toBe('warning') // week4: lowRun=4 (cash=0 is low)
  })

  it('condition-closure-is-absorbing-and-the-step-refuses-a-closed-prev', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    const rows = negWeeks(33, -500)
    const { conditions } = runFrom(stepCondition, start, rows)
    const closed = conditions[32]
    expect(closed.stage).toBe('closed')
    // Absorbing: even with facts that would otherwise clearly recover
    // (huge positive cash), calling stepCondition on a closed prev throws
    // rather than silently re-animating the studio.
    expect(() => stepCondition(closed, fact(34, 1_000_000))).toThrow(/closed/i)
  })

  it('condition-closure-earliest-route-is-33-consecutive-negative-weeks', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    // 32 consecutive negative weeks must NOT close (one week short of the
    // earliest route); this is the direct complement of the 33-week leaf
    // above, run as its own independent input rather than merely reading
    // week32 off the 33-week run.
    const { start } = bootstrap(stepCondition)
    const rows = negWeeks(32, -500)
    const { conditions } = runFrom(stepCondition, start, rows)
    expect(conditions[31].stage).toBe('distress')
    expect(conditions[31].distressWeeks).toBe(25) // week32 -> 32-8+1=25
    for (const c of conditions) expect(c.stage).not.toBe('closed')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 7. condition-owner-swap-and-determinism
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-owner-swap-and-determinism', () => {
  it('condition-owner-swap-and-determinism-identical-facts-give-identical-output', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    // The API carries no studio id or flag anywhere in Condition/ConditionFacts
    // (per the parent API decisions); "swapping the owner of the same facts
    // gives the same output" therefore reduces to plain referential
    // transparency: two wholly independent runs over the identical fact
    // sequence (standing in for "studio A" and "studio B") must produce
    // byte-identical (canonical-JSON) output at every step.
    const rowsA = [...negWeeks(8, -500), { cash: 10_000 }, ...lowPositiveWeeks(4, 2000)]
    const runA = (() => {
      const { start } = bootstrap(stepCondition)
      return runFrom(stepCondition, start, rowsA)
    })()
    const runB = (() => {
      const { start } = bootstrap(stepCondition)
      return runFrom(stepCondition, start, rowsA)
    })()
    expect(canonicalJSON(runA.conditions)).toBe(canonicalJSON(runB.conditions))
    expect(canonicalJSON(runA.transitions)).toBe(canonicalJSON(runB.transitions))
  })

  it('condition-owner-swap-and-determinism-module-imports-no-rng', async () => {
    // Read the module's own source text and assert it does not import the
    // sim's RNG facilities or call the platform's unseeded RNG anywhere. At RED this throws
    // ENOENT (the module does not exist yet), which is itself the correct
    // RED reason; once the module exists this becomes a genuine static
    // guard against a non-deterministic implementation.
    const fs = await import('node:fs')
    const path = await import('node:path')
    const srcPath = path.resolve(__dirname, '../src/core/corporateCondition.ts')
    const text = fs.readFileSync(srcPath, 'utf8')
    expect(text).not.toMatch(/Math\.random/)
    expect(text).not.toMatch(/from ['"].*\/rng(\.js)?['"]/)
    expect(text).not.toMatch(/RngStream/)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 8. condition-causes-bounded
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-causes-bounded', () => {
  const KNOWN_CODES = new Set(['LOW_COVER', 'NEGATIVE_CASH', 'DISTRESS_DURATION', 'COVER_RESTORED'])

  it('condition-causes-bounded-at-most-five-and-typed', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    const rows = negWeeks(33, -500)
    const { transitions } = runFrom(stepCondition, start, rows)
    const fired = transitions.filter((t) => t !== null)
    expect(fired.length).toBeGreaterThan(0)
    for (const t of fired) {
      expect(Array.isArray(t.causes)).toBe(true)
      expect(t.causes.length).toBeLessThanOrEqual(5)
      for (const cause of t.causes) {
        expect(KNOWN_CODES.has(cause.code)).toBe(true)
        expect(Number.isInteger(cause.weeks)).toBe(true)
        expect(cause.weeks).toBeGreaterThanOrEqual(0)
      }
    }
  })

  // REVISION 1352-C2 (1352-F2 ruling 3, GOVERNS): replaces the old bound-only
  // "unambiguous-entry-causes" leaf. Every cause is now a plain counter-step
  // duration (never floor(cover), which is not JSON-safe at O=0). Each leaf
  // below asserts the EXACT ordered causes list for one or more table rows,
  // reusing sequences already verified elsewhere in this file rather than
  // inventing new ones.

  it('condition-causes-bounded-warning-entry-exact-both-branches', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')

    // Branch A: stable->warning with negativeRun>0. Fully negative from
    // week1 (cash=-500): at week4, lowRun=4, negativeRun=4 (identical, since
    // every low week here is also negative). Causes = [LOW_COVER{4},
    // NEGATIVE_CASH{4}] (negativeRun=4>0, so the conditional second cause
    // fires). LOW_COVER's weeks value is lowRun=4 (1352-F2 ruling 3), not
    // floor(cover)=-1 as 1352-C's superseded leaf asserted.
    const boot1 = bootstrap(stepCondition)
    const run1 = runFrom(stepCondition, boot1.start, negWeeks(4, -500))
    const stableToWarning = run1.transitions[3]
    expect(stableToWarning).toEqual(expect.objectContaining({ from: 'stable', to: 'warning', week: 4 }))
    expect(stableToWarning.causes).toEqual([
      { code: 'LOW_COVER', weeks: 4 },
      { code: 'NEGATIVE_CASH', weeks: 4 },
    ])

    // Branch B: stable->warning with negativeRun=0. Low-but-positive from
    // week1 (cash=2000, cover=2<4, never negative): at week4, lowRun=4,
    // negativeRun=0. Causes = [LOW_COVER{4}] only (the conditional second
    // cause does NOT fire, since negativeRun=0).
    const boot2 = bootstrap(stepCondition)
    const run2 = runFrom(stepCondition, boot2.start, lowPositiveWeeks(4, 2000))
    const stableToWarningNoNeg = run2.transitions[3]
    expect(stableToWarningNoNeg).toEqual(expect.objectContaining({ from: 'stable', to: 'warning', week: 4 }))
    expect(stableToWarningNoNeg.causes).toEqual([{ code: 'LOW_COVER', weeks: 4 }])
  })

  it('condition-causes-bounded-recovery-to-warning-exact-both-branches', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const prefix = [...negWeeks(8, -500), { cash: 10_000 }] // weeks1-8 distress, week9 breather -> recovery

    // Branch A: recovery->warning with negativeRun>0. Weeks10-13 negative
    // (cash=-500): lowRun and negativeRun both reset at the week9 breather,
    // then climb together (not low, not negative there) 1,2,3,4 over
    // weeks10-13. At week13: lowRun=4, negativeRun=4. Causes =
    // [LOW_COVER{4}, NEGATIVE_CASH{4}].
    const bootA = bootstrap(stepCondition)
    const runA = runFrom(stepCondition, bootA.start, [...prefix, ...negWeeks(4, -500)])
    expect(runA.conditions[8].stage).toBe('recovery') // week9, sanity
    const recoveryToWarningNeg = runA.transitions[12]
    expect(recoveryToWarningNeg).toEqual(expect.objectContaining({ from: 'recovery', to: 'warning', week: 13 }))
    expect(recoveryToWarningNeg.causes).toEqual([
      { code: 'LOW_COVER', weeks: 4 },
      { code: 'NEGATIVE_CASH', weeks: 4 },
    ])

    // Branch B: recovery->warning with negativeRun=0. Weeks10-13 low-but-
    // positive (cash=2000, never negative): lowRun climbs 1,2,3,4;
    // negativeRun stays 0 throughout (including the week9 breather). At
    // week13: lowRun=4, negativeRun=0. Causes = [LOW_COVER{4}] only.
    const bootB = bootstrap(stepCondition)
    const runB = runFrom(stepCondition, bootB.start, [...prefix, ...lowPositiveWeeks(4, 2000)])
    expect(runB.conditions[8].stage).toBe('recovery') // week9, sanity
    const recoveryToWarningNoNeg = runB.transitions[12]
    expect(recoveryToWarningNoNeg).toEqual(expect.objectContaining({ from: 'recovery', to: 'warning', week: 13 }))
    expect(recoveryToWarningNoNeg.causes).toEqual([{ code: 'LOW_COVER', weeks: 4 }])
  })

  it('condition-causes-bounded-warning-to-distress-exact', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // Fully negative from week1: at week8, negativeRun=8, lowRun=8 (both
    // counters are identical in this fully-negative case). Causes =
    // [NEGATIVE_CASH{8}, LOW_COVER{8}] -- NOTE THE ORDER: NEGATIVE_CASH
    // first for this row, the reverse of the warning-entry rows above.
    const { transitions } = runFrom(stepCondition, start, negWeeks(8, -500))
    const warningToDistress = transitions[7]
    expect(warningToDistress).toEqual(expect.objectContaining({ from: 'warning', to: 'distress', week: 8 }))
    expect(warningToDistress.causes).toEqual([
      { code: 'NEGATIVE_CASH', weeks: 8 },
      { code: 'LOW_COVER', weeks: 8 },
    ])
  })

  it('condition-causes-bounded-clear-exits-exact', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')

    // warning->stable: 4 negative weeks (warning at week4), then 4 clear
    // weeks (cash=10,000). At week8, clearRun=4. Causes = [COVER_RESTORED{4}].
    const bootW = bootstrap(stepCondition)
    const runW = runFrom(stepCondition, bootW.start, [...negWeeks(4, -100), ...clearWeeks(4, 10_000)])
    const warningToStable = runW.transitions[7]
    expect(warningToStable).toEqual(expect.objectContaining({ from: 'warning', to: 'stable', week: 8 }))
    expect(warningToStable.causes).toEqual([{ code: 'COVER_RESTORED', weeks: 4 }])

    // distress->recovery and recovery->stable: 8 negative weeks (distress at
    // week8), then 13 clear weeks. Week9 is the FIRST clear week after
    // distress (clearRun=1) -> distress->recovery, causes=[COVER_RESTORED{1}].
    // Week21 is the 13th consecutive clear week counting week9 as the first
    // (9+12=21, NOT week22 -- cross-checked against a disposable reference
    // simulator during the 1352-C2 revision pass, which caught this exact
    // off-by-one; see the sibling leaf's own correction and
    // 1352-C2-p15b1-red-revision.md) -> recovery->stable, causes=
    // [COVER_RESTORED{13}].
    const bootD = bootstrap(stepCondition)
    const runD = runFrom(stepCondition, bootD.start, [...negWeeks(8, -500), ...clearWeeks(13, 10_000)])
    const distressToRecovery = runD.transitions[8]
    expect(distressToRecovery).toEqual(expect.objectContaining({ from: 'distress', to: 'recovery', week: 9 }))
    expect(distressToRecovery.causes).toEqual([{ code: 'COVER_RESTORED', weeks: 1 }])
    const recoveryToStable = runD.transitions[20]
    expect(recoveryToStable).toEqual(expect.objectContaining({ from: 'recovery', to: 'stable', week: 21 }))
    expect(recoveryToStable.causes).toEqual([{ code: 'COVER_RESTORED', weeks: 13 }])
  })

  it('condition-causes-bounded-closure-exact', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // Fully negative from week1 through closure at week33: negativeRun=33
    // (33 consecutive negative weeks); the counter-step distressWeeks
    // baseline at week33 is 26 (prev.distressWeeks=25 at week32, +1), READ
    // BEFORE the transition resets Condition.distressWeeks to 0 (ruling 2).
    // Causes = [DISTRESS_DURATION{26}, NEGATIVE_CASH{33}].
    const { transitions } = runFrom(stepCondition, start, negWeeks(33, -500))
    const distressToClosed = transitions[32]
    expect(distressToClosed).toEqual(expect.objectContaining({ from: 'distress', to: 'closed', week: 33 }))
    expect(distressToClosed.causes).toEqual([
      { code: 'DISTRESS_DURATION', weeks: 26 },
      { code: 'NEGATIVE_CASH', weeks: 33 },
    ])
  })

  it('condition-causes-bounded-zero-obligation-finite-and-json-safe', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    // 1352-F2 ruling 3's own motivation: with weeklyFixedCost=0 AND
    // loanInstallment=0 (O=0), the OLD floor(cover) formula would have given
    // -Infinity for a negative-cash week -- not JSON-safe. The new
    // duration-based causes (lowRun/negativeRun/etc., plain non-negative
    // integers) sidestep this entirely; this leaf proves it end to end
    // through a real JSON round-trip, not merely by asserting finiteness.
    const { start } = bootstrap(stepCondition)
    // wfc=0 on every row: O=0, cash<0 -> cover=-Infinity (never computed as
    // a cause now). runFrom's per-row weeklyFixedCost override is used here
    // since negWeeks() itself has no wfc parameter.
    const rows = Array.from({ length: 4 }, () => ({ cash: -500, weeklyFixedCost: 0 }))
    const { transitions } = runFrom(stepCondition, start, rows)
    const transition = transitions[3]
    expect(transition).toEqual(expect.objectContaining({ from: 'stable', to: 'warning', week: 4 }))
    expect(transition.causes.length).toBeGreaterThan(0)
    for (const cause of transition.causes) {
      expect(Number.isFinite(cause.weeks)).toBe(true)
      expect(Number.isInteger(cause.weeks)).toBe(true)
    }
    expect(JSON.parse(JSON.stringify(transition))).toEqual(transition)
  })

  it('condition-causes-bounded-public-projection-has-no-finance-number', async () => {
    const mod = await loadCondition()
    const publicCondition = requireFn<(c: any) => { stage: string; since: number }>(mod, 'publicCondition')
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    const { conditions } = runFrom(stepCondition, start, negWeeks(8, -500))
    const pub = publicCondition(conditions[7])
    expect(Object.keys(pub).sort()).toEqual(['since', 'stage'])
    expect(pub.stage).toBe('distress')
    expect(pub.since).toBe(8)
    // No leaked finance-shaped keys (lowRun/negativeRun/clearRun/
    // distressWeeks/week are all absent from the rival-safe projection).
    expect('lowRun' in pub).toBe(false)
    expect('negativeRun' in pub).toBe(false)
    expect('clearRun' in pub).toBe(false)
    expect('distressWeeks' in pub).toBe(false)
    expect('week' in pub).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 9. remedies-two-routes (+ rival-shaped capability, 1352-F note adopted)
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: remedies-two-routes', () => {
  type RemedyCapability = {
    hasPendingRelease: boolean
    terminableContracts: number
    hasOutstandingLoan: boolean
    founding: boolean
  }
  type RemediesFn = (condition: any, facts: Facts, capability: RemedyCapability) => string[]

  function distressCondition(): any {
    // A plain, well-formed distress Condition object matching the pinned
    // shape (fields beyond stage are not read by remedies() per the API,
    // but are supplied to keep the fixture honest).
    return { stage: 'distress', since: 8, week: 8, lowRun: 8, negativeRun: 8, clearRun: 0, distressWeeks: 1 }
  }

  it('remedies-two-routes-pending-release-and-staff-and-no-loan-gives-at-least-two', async () => {
    const mod = await loadCondition()
    const remedies = requireFn<RemediesFn>(mod, 'remedies')
    const facts = fact(8, -500, 10_000, 0) // weeklyFixedCost=10,000: loanMaxPrincipal=260,000>=1,000
    const capability: RemedyCapability = { hasPendingRelease: true, terminableContracts: 5, hasOutstandingLoan: false, founding: false }
    const result = remedies(distressCondition(), facts, capability)
    expect(result.length).toBeGreaterThanOrEqual(2)
    // Fixed order LOAN, REDUCE_OBLIGATIONS, RELEASE.
    expect(result).toEqual(['LOAN', 'REDUCE_OBLIGATIONS', 'RELEASE'])
  })

  it('remedies-two-routes-zero-route-case', async () => {
    const mod = await loadCondition()
    const remedies = requireFn<RemediesFn>(mod, 'remedies')
    const facts = fact(8, -500, 10_000, 0)
    // No pending release, no terminable staff, and an outstanding loan
    // (which alone disqualifies LOAN): "a studio with none left".
    const capability: RemedyCapability = { hasPendingRelease: false, terminableContracts: 0, hasOutstandingLoan: true, founding: false }
    const result = remedies(distressCondition(), facts, capability)
    expect(result).toEqual([])
  })

  it('remedies-two-routes-rival-shaped-capability-does-not-over-count', async () => {
    const mod = await loadCondition()
    const remedies = requireFn<RemediesFn>(mod, 'remedies')
    const facts = fact(8, -500, 10_000, 0)
    // Rival-shaped: has staff in the payroll sense, but terminableContracts
    // is 0 (every employee is reserve-gated / not legally terminable this
    // week per the shared charge law) and no pending release. LOAN alone
    // remains eligible; the function must report exactly [LOAN], never
    // include REDUCE_OBLIGATIONS just because a studio nominally "has
    // staff" (over-counting would be a genuine defect this leaf catches).
    const capability: RemedyCapability = { hasPendingRelease: false, terminableContracts: 0, hasOutstandingLoan: false, founding: false }
    const result = remedies(distressCondition(), facts, capability)
    expect(result).toEqual(['LOAN'])
    expect(result).not.toContain('REDUCE_OBLIGATIONS')
  })

  it('remedies-two-routes-fixed-order-skips-ineligible-middle-family', async () => {
    const mod = await loadCondition()
    const remedies = requireFn<RemediesFn>(mod, 'remedies')
    const facts = fact(8, -500, 10_000, 0)
    // Loan and release eligible, REDUCE_OBLIGATIONS not (0 terminable):
    // fixed order still yields [LOAN, RELEASE], never [RELEASE, LOAN].
    const capability: RemedyCapability = { hasPendingRelease: true, terminableContracts: 0, hasOutstandingLoan: false, founding: false }
    const result = remedies(distressCondition(), facts, capability)
    expect(result).toEqual(['LOAN', 'RELEASE'])
  })

  it('remedies-two-routes-loan-zero-fixed-cost-addition-1352-F', async () => {
    const mod = await loadCondition()
    const remedies = requireFn<RemediesFn>(mod, 'remedies')
    // 1352-F Amendment 4: weeklyFixedCost=0 -> loanMaxPrincipal=0 -> LOAN
    // ineligible -> remedies omits LOAN entirely, even in distress with no
    // outstanding loan and not founding (the only other LOAN gates).
    const facts = fact(8, -500, 0, 0)
    const withRelease = remedies(distressCondition(), facts, {
      hasPendingRelease: true,
      terminableContracts: 0,
      hasOutstandingLoan: false,
      founding: false,
    })
    expect(withRelease).toEqual(['RELEASE'])
    expect(withRelease).not.toContain('LOAN')
    const withNothing = remedies(distressCondition(), facts, {
      hasPendingRelease: false,
      terminableContracts: 0,
      hasOutstandingLoan: false,
      founding: false,
    })
    expect(withNothing).toEqual([])
  })

  // REVISION 1352-C3 (review 1352-D, blocking defects 1 & 2): every prior
  // leaf in this block calls remedies() with condition.stage hardcoded to
  // 'distress' (distressCondition()) and capability.founding hardcoded to
  // false, so an implementation that ignores the PASSED-IN condition.stage
  // for its LOAN branch (e.g. a literal 'distress' string) or never reads
  // capability.founding would still pass all of them. These two leaves close
  // that gap directly at the remedies() boundary, reusing the same
  // otherwise-loan-eligible facts/capability fixture used above.

  function conditionAt(stage: string): any {
    // Same shape as distressCondition(); only `stage` varies. remedies()
    // reads condition.stage for the LOAN gate per the pinned API -- other
    // fields are supplied to keep the fixture honest, not because remedies()
    // reads them.
    return { stage, since: 1, week: 1, lowRun: 0, negativeRun: 0, clearRun: 0, distressWeeks: 0 }
  }

  it('remedies-two-routes-stage-outside-warning-distress-excludes-loan', async () => {
    const mod = await loadCondition()
    const remedies = requireFn<RemediesFn>(mod, 'remedies')
    // Otherwise fully loan-eligible facts/capability (identical to the
    // "at-least-two" leaf above: wfc=10,000 -> max=260,000>=1,000; no
    // outstanding loan; not founding; pending release AND terminable staff,
    // so REDUCE_OBLIGATIONS/RELEASE are NOT stage-gated by the charter and
    // must still appear). Only `condition.stage` varies from 'distress'.
    const facts = fact(8, -500, 10_000, 0)
    const capability: RemedyCapability = { hasPendingRelease: true, terminableContracts: 5, hasOutstandingLoan: false, founding: false }

    const stableResult = remedies(conditionAt('stable'), facts, capability)
    expect(stableResult).not.toContain('LOAN')
    expect(stableResult).toEqual(['REDUCE_OBLIGATIONS', 'RELEASE']) // fixed order, LOAN skipped

    const recoveryResult = remedies(conditionAt('recovery'), facts, capability)
    expect(recoveryResult).not.toContain('LOAN')
    expect(recoveryResult).toEqual(['REDUCE_OBLIGATIONS', 'RELEASE'])
  })

  it('remedies-two-routes-founding-excludes-loan', async () => {
    const mod = await loadCondition()
    const remedies = requireFn<RemediesFn>(mod, 'remedies')
    // distress stage, otherwise loan-eligible facts, but capability.founding
    // is true: LOAN must be excluded (1352-A §4.4 "not founding"), while
    // REDUCE_OBLIGATIONS/RELEASE (not founding-gated) still follow capability.
    const facts = fact(8, -500, 10_000, 0)
    const capability: RemedyCapability = { hasPendingRelease: true, terminableContracts: 5, hasOutstandingLoan: false, founding: true }
    const result = remedies(distressCondition(), facts, capability)
    expect(result).not.toContain('LOAN')
    expect(result).toEqual(['REDUCE_OBLIGATIONS', 'RELEASE'])
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 13. loan-obligation-in-cover — `coverWeeks` (exported from
//     corporateCondition.ts per the pinned API, despite the loan theme: an
//     installment raises O = weeklyFixedCost + loanInstallment and lowers
//     cover exactly).
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: loan-obligation-in-cover', () => {
  type CoverWeeksFn = (facts: Facts) => number

  it('loan-obligation-in-cover-installment-raises-o-and-lowers-cover-exactly', async () => {
    const mod = await loadCondition()
    const coverWeeks = requireFn<CoverWeeksFn>(mod, 'coverWeeks')
    // Baseline, no loan: O=2000, cover=10,000/2,000=5 exactly.
    expect(coverWeeks(fact(1, 10_000, 2000, 0))).toBe(5)
    // Same cash and fixed cost, plus a 500 installment: O=2500, cover=4
    // exactly — lower by exactly 1, matching the installment's exact share
    // of O (500/2000 of the fixed cost alone shifts the ratio from 5 to 4).
    expect(coverWeeks(fact(1, 10_000, 2000, 500))).toBe(4)
    // Non-integer cover is a legitimate output (only the CAUSE's `weeks`
    // field floors; coverWeeks itself does not).
    expect(coverWeeks(fact(1, 9_000, 2000, 0))).toBe(4.5)
  })

  it('loan-obligation-in-cover-zero-obligation-infinity-rule', async () => {
    const mod = await loadCondition()
    const coverWeeks = requireFn<CoverWeeksFn>(mod, 'coverWeeks')
    // O=0 (no fixed cost, no installment): +Infinity if cash>=0, -Infinity
    // if cash<0.
    expect(coverWeeks(fact(1, 0, 0, 0))).toBe(Infinity)
    expect(coverWeeks(fact(1, 500, 0, 0))).toBe(Infinity)
    expect(coverWeeks(fact(1, -1, 0, 0))).toBe(-Infinity)
    expect(coverWeeks(fact(1, -500_000, 0, 0))).toBe(-Infinity)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 15. condition-distress-week-is-eighth-negative
// ═══════════════════════════════════════════════════════════════════════
describe('p15b corporate condition: condition-distress-week-is-eighth-negative', () => {
  it('condition-distress-week-is-eighth-negative-long-low-positive-then-negative', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // 25 weeks of low-but-positive cash (cash=1500, c=1.5<4, never negative),
    // then exactly 8 negative weeks. Distress begins in exactly the week
    // negativeRun first reaches 8 (week 25+8=33), never during the 25-week
    // low-positive stretch, however long that stretch runs.
    const rows = [...lowPositiveWeeks(25, 1500), ...negWeeks(8, -200)]
    const { conditions, transitions } = runFrom(stepCondition, start, rows)
    for (let w = 1; w <= 32; w++) expect(conditions[w - 1].stage).not.toBe('distress')
    expect(conditions[32].stage).toBe('distress') // week33
    expect(transitions[32]).toEqual(expect.objectContaining({ from: 'warning', to: 'distress', week: 33 }))
    expect(conditions[32].distressWeeks).toBe(1)
  })

  it('condition-distress-week-is-eighth-negative-low-positive-alone-never-triggers-however-long', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // 60 weeks of low-but-positive cash, never negative for even one week:
    // distress never begins, no matter how long the low-positive stretch
    // runs (warning persists indefinitely, since clearRun is pinned at 0
    // and negativeRun is pinned at 0 the whole time).
    const rows = lowPositiveWeeks(60, 1500)
    const { conditions } = runFrom(stepCondition, start, rows)
    for (const c of conditions) expect(c.stage).not.toBe('distress')
    expect(conditions[59].stage).toBe('warning')
    expect(conditions[59].negativeRun).toBe(0)
  })

  it('condition-distress-week-is-eighth-negative-distress-does-not-clear-on-low-positive-return', async () => {
    const mod = await loadCondition()
    const stepCondition = requireFn<StepFn>(mod, 'stepCondition')
    const { start } = bootstrap(stepCondition)
    // Enter distress (weeks1-8, fully negative), then return to low-but-
    // POSITIVE cash (cash=1500, c=1.5<4: still LOW, just not negative) for
    // 10 more weeks. The distress->recovery row requires "not low"
    // (cover>=4), which low-positive cash does not satisfy: distress must
    // persist and distressWeeks must keep incrementing, a direct mechanical
    // consequence of the pinned table (not a separately-authored charter
    // claim), included here because it isolates "low" from "negative" in
    // exactly the way this item's name (eighth-negative, not eighth-low)
    // requires.
    const rows = [...negWeeks(8, -500), ...lowPositiveWeeks(10, 1500)]
    const { conditions, transitions } = runFrom(stepCondition, start, rows)
    for (let w = 9; w <= 18; w++) {
      expect(conditions[w - 1].stage).toBe('distress')
      expect(transitions[w - 1]).toBeNull()
    }
    // week8: distressWeeks=1 (entry). Weeks9-18 are 10 further weeks, each
    // incrementing distressWeeks by 1 (still distress, never "not low"):
    // 1+10=11, not 10 -- a self-caught off-by-one in this leaf's own prior
    // draft (miscounted the inclusive week9..18 span as 9 weeks instead of
    // 10), found by the same reference-simulator cross-check that caught the
    // sibling recovery-to-stable leaf's off-by-one; see
    // 1352-C2-p15b1-red-revision.md.
    expect(conditions[17].distressWeeks).toBe(11) // week18
  })
})
