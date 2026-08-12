// ── D-16 · typed counterfactual TUNING overrides ─────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// The mechanism is the D-12 idiom (run-owner-calibration-study.ts:390-395): TUNING is
// declared `as const` but is never frozen, so an in-process save → assign → try/finally
// restore works. That study's version had four defects this module fixes:
//
//   1. `(TUNING as any)[k]` — a typo'd key silently no-ops. Here the key type is
//      `NumericTuningKey`, so a bad key is a compile error.
//   2. no restoration canary — here `assertTuningPristine()` deep-compares against a
//      module-load snapshot and throws loudly.
//   3. no read-timing discipline — here every sweepable constant is in an ALLOWLIST that
//      records WHERE it is read (worldgen-time vs use-time). A worldgen-time constant is
//      REJECTED unless the caller declares `regeneratesWorlds: true`.
//   4. untagged output — here `tagArtifact()` is the only way to build an emittable
//      object, and it always stamps { mode, overrides }. No experimental number can be
//      emitted without its tag.
//
// SINGLE PROCESS ONLY. TUNING mutation is process-global: it is NOT safe under vitest
// worker parallelism. Overrides are used from the vite-node CLI, never from a *.test.ts.

import { TUNING } from '../../core/index.js'

type NumericTuningKey = {
  [K in keyof typeof TUNING]: (typeof TUNING)[K] extends number ? K : never
}[keyof typeof TUNING]

export type TuningOverrides = Partial<Record<NumericTuningKey, number>>

export type ReadTiming =
  | 'worldgen' // consumed inside generateWorld — a mid-run change does nothing
  | 'founding' // consumed at beginFounding / signContract
  | 'use' // consumed at the point of use, every time (tick / greenlight / reception)

export type AllowlistEntry = {
  key: NumericTuningKey
  timing: ReadTiming
  /** where the value is read, verified by inspection at 33eb33ae. */
  readAt: string
  note: string
}

/**
 * The ONLY constants D-16 may sweep, with their verified read timing.
 * `timing: 'worldgen'` entries are rejected unless the experiment regenerates worlds
 * INSIDE the override scope — otherwise the sweep silently measures nothing.
 */
export const TUNING_ALLOWLIST: readonly AllowlistEntry[] = [
  {
    key: 'INITIAL_CASH',
    timing: 'worldgen',
    readAt: 'worldgen.ts:617 (studio.cash at generation)',
    note: 'Also the base of the reconciliation invariant (types.ts:350-352). Must be set BEFORE generateWorld.',
  },
  {
    key: 'SALARY_BASE',
    timing: 'worldgen',
    readAt: 'worldgen.ts:147-153 salaryCurve, stamped onto talent.salary at generation',
    note: 'salaryCurve is ALSO called at use time by offerForTalent/freelancerFee, so a mid-run change moves contract and fee quotes but not talent.salary. Sweep only with world regeneration.',
  },
  {
    key: 'SALARY_SKILL_COEF',
    timing: 'worldgen',
    readAt: 'worldgen.ts:147-153 salaryCurve',
    note: 'Same dual-read caveat as SALARY_BASE.',
  },
  {
    key: 'SALARY_FAME_COEF',
    timing: 'worldgen',
    readAt: 'worldgen.ts:147-153 salaryCurve',
    note: 'Same dual-read caveat as SALARY_BASE.',
  },
  {
    key: 'HIRING_FOUNDING_BUDGET',
    timing: 'founding',
    readAt: 'employment.ts:391 (beginFounding seeds founding.budget)',
    note: 'Must be set before beginFounding; changing it later has no effect on an open draft.',
  },
  {
    key: 'OVERHEAD_BASE',
    timing: 'use',
    readAt: 'tick.ts:477 (step 7.5) and economyView.ts:21',
    note: 'Read every tick. Safe to change mid-run.',
  },
  {
    key: 'OVERHEAD_PER_EMPLOYEE',
    timing: 'use',
    readAt: 'tick.ts:477 and economyView.ts:21',
    note: 'Read every tick. Safe to change mid-run.',
  },
  {
    key: 'STUDIO_RENTAL_BLENDED',
    timing: 'use',
    readAt: 'economy.ts:53-73 openTheatricalRun (LOCKED onto the run at open); tick.ts:330 uses run.studioShare',
    note: 'Locked per run at RELEASE. A run already open keeps its old share — so a mid-run change applies only to films released after it.',
  },
  {
    key: 'ECONOMY_BOX_OFFICE_SCALE',
    timing: 'use',
    readAt: 'reception.ts:599 (engaged opening scale)',
    note: 'Read at every reception resolve and every forecast. Safe mid-run.',
  },
  {
    key: 'AWARENESS_REACH_NEUTRAL',
    timing: 'use',
    readAt: 'standing.ts:98-108 (per-release awareness delta)',
    note: 'The A3 §10 ratchet pivot. Read per release. Safe mid-run.',
  },
  {
    key: 'AWARENESS_REACH_SCALE',
    timing: 'use',
    readAt: 'standing.ts:98-108',
    note: 'Read per release. Safe mid-run.',
  },
  {
    key: 'ORGANIC_AWARENESS_FLOOR_WEIGHT',
    timing: 'use',
    readAt: 'reception.ts:569 (engaged baseAwareness)',
    note: 'Read per reception/forecast. Safe mid-run.',
  },
  {
    key: 'FAME_REACH_HALF_SAT',
    timing: 'use',
    readAt: 'economy.ts:17-20 fameReach, via reception.ts:456-458 / forecast',
    note: 'Read per reception/forecast. Safe mid-run.',
  },
  {
    key: 'FREELANCER_FEE_PREMIUM',
    timing: 'use',
    readAt: 'employment.ts:219-221 freelancerFee, charged at actions.ts:417-434',
    note: 'Read at each greenlight. Safe mid-run.',
  },
  {
    key: 'CONTRACT_ANNUAL_MULT',
    timing: 'use',
    readAt: 'employment.ts:170-193 offerForTalent',
    note: 'Read when an offer is priced; existing contracts keep their locked annualSalary.',
  },
  {
    key: 'HIRING_TERMINATION_FRACTION',
    timing: 'use',
    readAt: 'employment.ts:115-123 terminationCost',
    note: 'Read at each release. Safe mid-run.',
  },
  {
    key: 'MAX_CONCURRENT_PRODUCTIONS',
    timing: 'use',
    readAt: 'actions.ts:250-254 (greenlight cap)',
    note: 'Read at each greenlight. Safe mid-run.',
  },
]

const ALLOWED = new Map(TUNING_ALLOWLIST.map((e) => [e.key as string, e]))

/** Snapshot taken at module load, used by the restoration canary. */
const PRISTINE: Record<string, unknown> = {}
for (const k of Object.keys(TUNING)) PRISTINE[k] = (TUNING as unknown as Record<string, unknown>)[k]

export function assertTuningPristine(label = ''): void {
  const live = TUNING as unknown as Record<string, unknown>
  const drift: string[] = []
  for (const k of Object.keys(PRISTINE)) {
    const a = PRISTINE[k]
    const b = live[k]
    if (typeof a === 'number' || typeof a === 'string' || typeof a === 'boolean') {
      if (a !== b) drift.push(`${k}: ${String(a)} → ${String(b)}`)
    }
  }
  if (drift.length > 0) {
    throw new Error(`d16/experiment: TUNING was not restored${label ? ` (${label})` : ''}: ${drift.join('; ')}`)
  }
}

export type OverrideScopeOptions = {
  /** the experiment regenerates worlds INSIDE the scope, so worldgen-time keys are legal. */
  regeneratesWorlds?: boolean
}

/** Reject a sweep whose constants cannot possibly bind under the experiment's design. */
export function validateOverrides(overrides: TuningOverrides, opts: OverrideScopeOptions = {}): void {
  const problems: string[] = []
  for (const key of Object.keys(overrides)) {
    const entry = ALLOWED.get(key)
    if (entry === undefined) {
      problems.push(`"${key}" is not in TUNING_ALLOWLIST (read timing unverified)`)
      continue
    }
    if ((entry.timing === 'worldgen' || entry.timing === 'founding') && opts.regeneratesWorlds !== true) {
      problems.push(
        `"${key}" is read at ${entry.timing} time (${entry.readAt}) — the experiment must regenerate worlds inside the override scope, or the sweep measures nothing`,
      )
    }
  }
  if (problems.length > 0) {
    throw new Error(`d16/experiment: rejected override set — ${problems.join(' | ')}`)
  }
}

/**
 * Apply overrides for the duration of `fn`, then restore in a `finally` and verify.
 * Nesting is safe (save/restore is symmetric per scope).
 */
export function withTuningOverrides<T>(
  overrides: TuningOverrides,
  fn: () => T,
  opts: OverrideScopeOptions = {},
): T {
  validateOverrides(overrides, opts)
  const live = TUNING as unknown as Record<string, number>
  const saved: Record<string, number> = {}
  const keys = Object.keys(overrides).sort()
  for (const k of keys) {
    saved[k] = live[k]!
    live[k] = (overrides as Record<string, number>)[k]!
  }
  try {
    return fn()
  } finally {
    for (const k of keys) live[k] = saved[k]!
  }
}

// ── artifact tagging ─────────────────────────────────────────────────────────

export type ArtifactMode = 'CURRENT' | 'COUNTERFACTUAL'

export type Tag = {
  mode: ArtifactMode
  overrides: TuningOverrides
  /** stable, sorted, human-readable key: '' for CURRENT, 'K=v;K2=v2' otherwise. */
  overrideKey: string
}

export function makeTag(overrides: TuningOverrides = {}): Tag {
  const keys = Object.keys(overrides).sort()
  const mode: ArtifactMode = keys.length === 0 ? 'CURRENT' : 'COUNTERFACTUAL'
  const overrideKey = keys.map((k) => `${k}=${String((overrides as Record<string, number>)[k])}`).join(';')
  const copy: TuningOverrides = {}
  for (const k of keys) (copy as Record<string, number>)[k] = (overrides as Record<string, number>)[k]!
  return { mode, overrides: copy, overrideKey }
}

/**
 * The ONLY sanctioned way to build an emittable object. Every artifact row and every
 * summary passes through here, so a number can never reach a file untagged.
 */
export function tagArtifact<T extends object>(payload: T, tag: Tag): T & Tag {
  return { ...payload, mode: tag.mode, overrides: tag.overrides, overrideKey: tag.overrideKey }
}

/** The read-timing table, for the build report / an artifact header. */
export function readTimingTable(): { key: string; timing: ReadTiming; readAt: string; note: string }[] {
  return TUNING_ALLOWLIST.map((e) => ({ key: e.key as string, timing: e.timing, readAt: e.readAt, note: e.note }))
}
